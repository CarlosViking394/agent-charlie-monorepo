import { useCallback, useEffect } from 'react';
import { useAgents, useActions } from '../store/context';
import { AgentSearchQuery, AgentFilters } from '../types/agent';
import { useAsyncOperation } from './useAsyncOperation';
import { AgentService } from '../services/agentService';

// Agent search hook with built-in state management
export function useAgentSearch() {
  const agentState = useAgents();
  const actions = useActions();
  const { execute, isLoading } = useAsyncOperation();

  // Search agents with query and filters
  const searchAgents = useCallback(
    async (query?: string, filters?: AgentFilters) => {
      const searchQuery: AgentSearchQuery = {
        query,
        filters: { ...agentState.activeFilters, ...filters },
        sortBy: 'relevance',
        sortOrder: 'desc',
      };

      try {
        actions.agents.searchStart(searchQuery);

        const results = await execute(
          AgentService.searchAgents,
          searchQuery.query,
          undefined, // category
          searchQuery.filters
        );

        const paginatedResults = {
          items: results.agents,
          total: results.total,
          page: 1,
          totalPages: Math.ceil(results.total / 20),
          hasNext: results.total > 20,
          hasPrevious: false,
        };

        actions.agents.searchSuccess(paginatedResults);

        // Add to recent searches if query exists
        if (query?.trim()) {
          actions.user.addRecentSearch(query.trim());
        }

        return paginatedResults;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Search failed';
        actions.agents.searchError(errorMessage);
        throw error;
      }
    },
    [agentState.activeFilters, actions, execute]
  );

  // Quick search with just query
  const quickSearch = useCallback(
    (query: string) => {
      if (!query.trim()) return;
      return searchAgents(query.trim());
    },
    [searchAgents]
  );

  // Search by category
  const searchByCategory = useCallback(
    (category: string) => {
      return searchAgents(undefined, { category: category as any });
    },
    [searchAgents]
  );

  // Apply filters
  const applyFilters = useCallback(
    (filters: AgentFilters) => {
      actions.agents.setFilters(filters);
      // Automatically search with current query and new filters
      if (agentState.lastQuery?.query || Object.keys(filters).length > 0) {
        return searchAgents(agentState.lastQuery?.query, filters);
      }
    },
    [actions, agentState.lastQuery, searchAgents]
  );

  // Clear filters
  const clearFilters = useCallback(() => {
    actions.agents.clearFilters();
    // Re-search with cleared filters if there's a current query
    if (agentState.lastQuery?.query) {
      return searchAgents(agentState.lastQuery.query, {});
    }
  }, [actions, agentState.lastQuery, searchAgents]);

  // Retry last search
  const retrySearch = useCallback(() => {
    if (agentState.lastQuery) {
      return searchAgents(
        agentState.lastQuery.query,
        agentState.lastQuery.filters
      );
    }
  }, [agentState.lastQuery, searchAgents]);

  return {
    // State
    searchResults: agentState.searchResults,
    activeFilters: agentState.activeFilters,
    lastQuery: agentState.lastQuery,
    isLoading,

    // Actions
    searchAgents,
    quickSearch,
    searchByCategory,
    applyFilters,
    clearFilters,
    retrySearch,

    // Computed properties
    hasResults: Boolean(agentState.searchResults.data?.items.length),
    totalResults: agentState.searchResults.data?.total || 0,
    hasActiveFilters: Object.keys(agentState.activeFilters).length > 0,
  };
}

// Hook for managing individual agent data
export function useAgent(agentId?: string) {
  const agentState = useAgents();
  const actions = useActions();
  const { execute, isLoading } = useAsyncOperation();

  // Load agent by ID
  const loadAgent = useCallback(
    async (id: string) => {
      try {
        actions.agents.loadStart(id);

        const agent = await execute(AgentService.getAgentById, id);

        if (agent) {
          actions.agents.loadSuccess(agent);
          return agent;
        } else {
          throw new Error('Agent not found');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load agent';
        actions.agents.loadError(errorMessage);
        throw error;
      }
    },
    [actions, execute]
  );

  // Auto-load agent when ID changes
  useEffect(() => {
    if (agentId && !agentState.cache[agentId]) {
      loadAgent(agentId);
    }
  }, [agentId, agentState.cache, loadAgent]);

  // Get agent from cache or current state
  const agent = agentId
    ? agentState.cache[agentId] || agentState.currentAgent.data
    : agentState.currentAgent.data;

  return {
    agent,
    currentAgent: agentState.currentAgent,
    isLoading: isLoading || agentState.currentAgent.loading.isLoading,
    error: agentState.currentAgent.error,
    loadAgent,
  };
}

// Hook for agent comparison functionality
export function useAgentComparison() {
  const agentState = useAgents();
  const actions = useActions();

  const addToComparison = useCallback(
    (agent: any) => {
      const currentComparison = agentState.comparison.data || [];

      if (currentComparison.length >= 4) {
        throw new Error('Maximum 4 agents can be compared');
      }

      if (currentComparison.some(a => a.id === agent.id)) {
        throw new Error('Agent is already in comparison');
      }

      actions.agents.addToComparison(agent);
    },
    [agentState.comparison.data, actions]
  );

  const removeFromComparison = useCallback(
    (agentId: string) => {
      actions.agents.removeFromComparison(agentId);
    },
    [actions]
  );

  const clearComparison = useCallback(() => {
    actions.agents.clearComparison();
  }, [actions]);

  const isInComparison = useCallback(
    (agentId: string) => {
      return Boolean(
        agentState.comparison.data?.some(agent => agent.id === agentId)
      );
    },
    [agentState.comparison.data]
  );

  return {
    comparisonAgents: agentState.comparison.data || [],
    comparisonCount: agentState.comparison.data?.length || 0,
    canAddMore: (agentState.comparison.data?.length || 0) < 4,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
  };
}