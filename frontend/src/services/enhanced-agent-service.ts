import {
  Agent,
  AgentFilters,
  AgentSearchQuery,
  AgentCategory,
  ComparisonAgent
} from '../types/agent';
import {
  ID,
  PaginatedResponse,
  Result,
  ApiError
} from '../types/core';
import { N8NService } from './api';
import { mockAgents, getAgentsByQuery, getAgentsByCategory } from '../utils/mockData';
import { FEATURE_FLAGS, CACHE_CONFIG } from '../constants';
import { storage, retry, timeout } from '../lib/utils';

interface AgentCache {
  readonly data: Agent;
  readonly timestamp: number;
  readonly ttl: number;
}

interface SearchCache {
  readonly query: AgentSearchQuery;
  readonly results: PaginatedResponse<Agent>;
  readonly timestamp: number;
  readonly ttl: number;
}

class EnhancedAgentService {
  private agentCache = new Map<ID, AgentCache>();
  private searchCache = new Map<string, SearchCache>();

  // Cache management
  private isCacheValid(timestamp: number, ttl: number): boolean {
    return Date.now() - timestamp < ttl;
  }

  private getCacheKey(query: AgentSearchQuery): string {
    return JSON.stringify({
      query: query.query,
      filters: query.filters,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  private cleanExpiredCache(): void {
    // Clean agent cache
    for (const [key, cache] of this.agentCache.entries()) {
      if (!this.isCacheValid(cache.timestamp, cache.ttl)) {
        this.agentCache.delete(key);
      }
    }

    // Clean search cache
    for (const [key, cache] of this.searchCache.entries()) {
      if (!this.isCacheValid(cache.timestamp, cache.ttl)) {
        this.searchCache.delete(key);
      }
    }
  }

  // Search agents with advanced filtering and caching
  async searchAgents(searchQuery: AgentSearchQuery): Promise<Result<PaginatedResponse<Agent>>> {
    try {
      this.cleanExpiredCache();
      const cacheKey = this.getCacheKey(searchQuery);

      // Check cache first
      const cached = this.searchCache.get(cacheKey);
      if (cached && this.isCacheValid(cached.timestamp, cached.ttl)) {
        return { success: true, data: cached.results };
      }

      let agents: Agent[] = [];
      let total = 0;

      if (FEATURE_FLAGS.enableMockData) {
        // Use mock data with advanced filtering
        agents = this.filterMockAgents(searchQuery);
        total = agents.length;
      } else {
        // Use real API
        const apiResult = await retry(
          () => timeout(
            N8NService.searchAgents(searchQuery.query || '', {
              filters: searchQuery.filters,
              sortBy: searchQuery.sortBy,
              sortOrder: searchQuery.sortOrder,
              limit: 20,
            }),
            10000
          ),
          3,
          1000
        );

        agents = apiResult.agents || [];
        total = apiResult.total || 0;
      }

      // Apply sorting
      if (searchQuery.sortBy && agents.length > 0) {
        agents = this.sortAgents(agents, searchQuery.sortBy, searchQuery.sortOrder || 'desc');
      }

      const results: PaginatedResponse<Agent> = {
        items: agents.slice(0, 20), // Limit to 20 per page
        total,
        page: 1,
        totalPages: Math.ceil(total / 20),
        hasNext: total > 20,
        hasPrevious: false,
      };

      // Cache results
      this.searchCache.set(cacheKey, {
        query: searchQuery,
        results,
        timestamp: Date.now(),
        ttl: CACHE_CONFIG.search.ttl,
      });

      // Cache individual agents
      agents.forEach(agent => this.cacheAgent(agent));

      return { success: true, data: results };

    } catch (error) {
      const apiError: ApiError = {
        code: 'SEARCH_FAILED',
        message: error instanceof Error ? error.message : 'Failed to search agents',
        timestamp: new Date().toISOString(),
      };

      return { success: false, error: apiError };
    }
  }

  // Get agent by ID with caching
  async getAgentById(id: ID): Promise<Result<Agent>> {
    try {
      this.cleanExpiredCache();

      // Check cache first
      const cached = this.agentCache.get(id);
      if (cached && this.isCacheValid(cached.timestamp, cached.ttl)) {
        return { success: true, data: cached.data };
      }

      let agent: Agent | null = null;

      if (FEATURE_FLAGS.enableMockData) {
        agent = mockAgents.find(a => a.id === id) || null;
      } else {
        const response = await retry(
          () => timeout(N8NService.callWebhook('get-agent', { id }), 10000),
          3,
          1000
        );
        agent = response.agent || null;
      }

      if (!agent) {
        return {
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: 'Agent not found',
            timestamp: new Date().toISOString(),
          },
        };
      }

      // Cache the agent
      this.cacheAgent(agent);

      return { success: true, data: agent };

    } catch (error) {
      const apiError: ApiError = {
        code: 'AGENT_LOAD_FAILED',
        message: error instanceof Error ? error.message : 'Failed to load agent',
        timestamp: new Date().toISOString(),
      };

      return { success: false, error: apiError };
    }
  }

  // Get multiple agents by IDs
  async getAgentsByIds(ids: readonly ID[]): Promise<Result<readonly Agent[]>> {
    try {
      const agents: Agent[] = [];
      const missingIds: ID[] = [];

      // Check cache for each agent
      for (const id of ids) {
        const cached = this.agentCache.get(id);
        if (cached && this.isCacheValid(cached.timestamp, cached.ttl)) {
          agents.push(cached.data);
        } else {
          missingIds.push(id);
        }
      }

      // Fetch missing agents
      if (missingIds.length > 0) {
        const fetchPromises = missingIds.map(id => this.getAgentById(id));
        const results = await Promise.allSettled(fetchPromises);

        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value.success) {
            agents.push(result.value.data);
          }
        });
      }

      // Sort by original order
      const sortedAgents = ids
        .map(id => agents.find(agent => agent.id === id))
        .filter((agent): agent is Agent => agent !== undefined);

      return { success: true, data: sortedAgents };

    } catch (error) {
      const apiError: ApiError = {
        code: 'AGENTS_LOAD_FAILED',
        message: error instanceof Error ? error.message : 'Failed to load agents',
        timestamp: new Date().toISOString(),
      };

      return { success: false, error: apiError };
    }
  }

  // Enhanced agent comparison with scoring
  async getAgentsForComparison(ids: readonly ID[]): Promise<Result<readonly ComparisonAgent[]>> {
    const result = await this.getAgentsByIds(ids);
    if (!result.success) {
      return result;
    }

    const comparisonAgents: ComparisonAgent[] = result.data.map(agent => ({
      ...agent,
      selected: true,
    }));

    // Add comparison scores if multiple agents
    if (comparisonAgents.length > 1) {
      comparisonAgents.forEach((agent, index) => {
        (agent as any).comparisonScore = this.calculateComparisonScore(agent, comparisonAgents);
      });
    }

    return { success: true, data: comparisonAgents };
  }

  // Favorites management with persistence
  async getFavorites(): Promise<Result<readonly Agent[]>> {
    try {
      const favoriteIds = storage.get<string[]>('favorites', []);
      return await this.getAgentsByIds(favoriteIds);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FAVORITES_LOAD_FAILED',
          message: 'Failed to load favorite agents',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  async toggleFavorite(agentId: ID): Promise<Result<{ isFavorite: boolean }>> {
    try {
      const favorites = storage.get<string[]>('favorites', []);
      const index = favorites.indexOf(agentId);
      let isFavorite: boolean;

      if (index > -1) {
        favorites.splice(index, 1);
        isFavorite = false;
      } else {
        favorites.push(agentId);
        isFavorite = true;
      }

      storage.set('favorites', favorites);

      return { success: true, data: { isFavorite } };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FAVORITE_TOGGLE_FAILED',
          message: 'Failed to toggle favorite',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  // Private helper methods
  private cacheAgent(agent: Agent): void {
    this.agentCache.set(agent.id, {
      data: agent,
      timestamp: Date.now(),
      ttl: CACHE_CONFIG.agents.ttl,
    });

    // Enforce cache size limit
    if (this.agentCache.size > CACHE_CONFIG.agents.maxSize) {
      const oldestKey = Array.from(this.agentCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.agentCache.delete(oldestKey);
    }
  }

  private filterMockAgents(query: AgentSearchQuery): Agent[] {
    let agents = mockAgents;

    // Apply text query
    if (query.query) {
      agents = getAgentsByQuery(query.query);
    }

    // Apply filters
    if (query.filters) {
      agents = agents.filter(agent => this.matchesFilters(agent, query.filters!));
    }

    return agents;
  }

  private matchesFilters(agent: Agent, filters: AgentFilters): boolean {
    // Category filter
    if (filters.category && agent.category !== filters.category) {
      return false;
    }

    // Location filters
    if (filters.location) {
      const { city, state, remoteOnly } = filters.location;

      if (city && !agent.location.city.toLowerCase().includes(city.toLowerCase())) {
        return false;
      }

      if (state && agent.location.state !== state) {
        return false;
      }

      if (remoteOnly && !agent.location.remote) {
        return false;
      }
    }

    // Pricing filters
    if (filters.pricing) {
      const { min, max } = filters.pricing;

      if (min !== undefined && agent.pricing.max < min) {
        return false;
      }

      if (max !== undefined && agent.pricing.min > max) {
        return false;
      }
    }

    // Rating filter
    if (filters.rating?.minimum && agent.rating.average < filters.rating.minimum) {
      return false;
    }

    // Credentials filters
    if (filters.credentials) {
      const { verified, insured } = filters.credentials;

      if (verified && !agent.credentials.verified) {
        return false;
      }

      if (insured && !agent.credentials.insured) {
        return false;
      }
    }

    return true;
  }

  private sortAgents(
    agents: Agent[],
    sortBy: AgentSearchQuery['sortBy'],
    sortOrder: 'asc' | 'desc'
  ): Agent[] {
    return [...agents].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'rating':
          comparison = a.rating.average - b.rating.average;
          break;
        case 'price':
          comparison = a.pricing.min - b.pricing.min;
          break;
        case 'responseTime':
          comparison = a.metrics.responseTime.average - b.metrics.responseTime.average;
          break;
        case 'relevance':
        default:
          // Complex relevance scoring
          comparison = this.calculateRelevanceScore(b) - this.calculateRelevanceScore(a);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  private calculateRelevanceScore(agent: Agent): number {
    let score = 0;

    // Rating weight (40%)
    score += agent.rating.average * 0.4;

    // Success rate weight (25%)
    score += (agent.metrics.successRate / 100) * 0.25;

    // Review count weight (20%)
    score += Math.min(agent.rating.count / 100, 1) * 0.2;

    // Response time weight (15%) - lower is better
    const responseTimeScore = Math.max(0, 1 - (agent.metrics.responseTime.average / 1440)); // normalized to 24 hours
    score += responseTimeScore * 0.15;

    return score;
  }

  private calculateComparisonScore(agent: Agent, allAgents: readonly ComparisonAgent[]): number {
    // Score based on how this agent compares to others
    let score = 0;
    const otherAgents = allAgents.filter(a => a.id !== agent.id);

    if (otherAgents.length === 0) return 0;

    // Rating comparison
    const avgRating = otherAgents.reduce((sum, a) => sum + a.rating.average, 0) / otherAgents.length;
    score += (agent.rating.average - avgRating) * 20;

    // Price comparison (lower is better)
    const avgPrice = otherAgents.reduce((sum, a) => sum + a.pricing.min, 0) / otherAgents.length;
    score += (avgPrice - agent.pricing.min) / 10;

    // Response time comparison (lower is better)
    const avgResponseTime = otherAgents.reduce((sum, a) => sum + a.metrics.responseTime.average, 0) / otherAgents.length;
    score += (avgResponseTime - agent.metrics.responseTime.average) / 60;

    return Math.round(score);
  }

  // Clear all caches
  clearCache(): void {
    this.agentCache.clear();
    this.searchCache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return {
      agentCacheSize: this.agentCache.size,
      searchCacheSize: this.searchCache.size,
      agentCacheLimit: CACHE_CONFIG.agents.maxSize,
      searchCacheLimit: CACHE_CONFIG.search.maxSize,
    };
  }
}

export const AgentServiceV2 = new EnhancedAgentService();
export default AgentServiceV2;