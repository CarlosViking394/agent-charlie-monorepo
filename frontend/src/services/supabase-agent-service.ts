import { supabase } from '../lib/supabase';
import { Agent, AgentFilters, AgentSearchQuery } from '../types/agent';
import { ID, PaginatedResponse, Result, ApiError } from '../types/core';
import { Database } from '../types/supabase';

type AgentRow = Database['public']['Tables']['agents']['Row'];
type AgentInsert = Database['public']['Tables']['agents']['Insert'];
type AgentUpdate = Database['public']['Tables']['agents']['Update'];

class SupabaseAgentService {
  // Convert Supabase row to Agent type
  private mapRowToAgent(row: AgentRow): Agent {
    return {
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      name: row.name,
      bio: row.bio || '',
      avatar: {
        id: `avatar-${row.id}`,
        url: row.avatar_url || '/default-avatar.png',
        type: 'image',
      },
      category: row.category as any,
      specialties: row.specialties.map(s => ({
        id: s,
        name: s,
        category: row.category as any,
        verified: true,
      })),
      location: {
        city: row.location_city,
        state: row.location_state,
        remote: row.location_remote,
      },
      pricing: {
        min: row.pricing_min,
        max: row.pricing_max,
        currency: row.pricing_currency as any,
        unit: 'hour' as const,
      },
      rating: {
        average: row.rating_average,
        count: row.rating_count,
      },
      reviews: [], // Load separately if needed
      credentials: {
        verified: row.verified,
        insured: row.insured,
        bonded: false,
        backgroundChecked: false,
        licenses: [],
        certifications: [],
      },
      metrics: {
        responseTime: {
          average: row.response_time_minutes,
          category: this.categorizeResponseTime(row.response_time_minutes),
        },
        successRate: row.success_rate,
        completionRate: row.success_rate,
        repeatClientRate: 0,
        totalJobs: 0,
        totalClients: 0,
      },
      status: row.available ? 'available' : 'offline',
      tags: [],
      languages: row.languages,
      yearsExperience: row.years_experience,
    };
  }

  private categorizeResponseTime(minutes: number): 'instant' | 'fast' | 'moderate' | 'slow' {
    if (minutes <= 5) return 'instant';
    if (minutes <= 60) return 'fast';
    if (minutes <= 240) return 'moderate';
    return 'slow';
  }

  // Search agents with advanced filtering
  async searchAgents(searchQuery: AgentSearchQuery): Promise<Result<PaginatedResponse<Agent>>> {
    try {
      let query = supabase
        .from('agents')
        .select('*', { count: 'exact' });

      // Apply text search
      if (searchQuery.query) {
        query = query.or(`name.ilike.%${searchQuery.query}%,bio.ilike.%${searchQuery.query}%,specialties.cs.{${searchQuery.query}}`);
      }

      // Apply filters
      if (searchQuery.filters) {
        const { filters } = searchQuery;

        if (filters.category) {
          query = query.eq('category', filters.category);
        }

        if (filters.location?.city) {
          query = query.ilike('location_city', `%${filters.location.city}%`);
        }

        if (filters.location?.state) {
          query = query.eq('location_state', filters.location.state);
        }

        if (filters.location?.remoteOnly) {
          query = query.eq('location_remote', true);
        }

        if (filters.pricing?.min !== undefined) {
          query = query.gte('pricing_min', filters.pricing.min);
        }

        if (filters.pricing?.max !== undefined) {
          query = query.lte('pricing_max', filters.pricing.max);
        }

        if (filters.rating?.minimum) {
          query = query.gte('rating_average', filters.rating.minimum);
        }

        if (filters.credentials?.verified) {
          query = query.eq('verified', true);
        }

        if (filters.credentials?.insured) {
          query = query.eq('insured', true);
        }

        if (filters.availability?.status === 'available') {
          query = query.eq('available', true);
        }

        if (filters.experience?.minYears) {
          query = query.gte('years_experience', filters.experience.minYears);
        }
      }

      // Apply sorting
      if (searchQuery.sortBy) {
        const sortOrder = searchQuery.sortOrder === 'desc' ? false : true;

        switch (searchQuery.sortBy) {
          case 'rating':
            query = query.order('rating_average', { ascending: sortOrder });
            break;
          case 'price':
            query = query.order('pricing_min', { ascending: sortOrder });
            break;
          case 'responseTime':
            query = query.order('response_time_minutes', { ascending: sortOrder });
            break;
          default:
            // Default relevance sorting
            query = query.order('rating_average', { ascending: false })
                        .order('success_rate', { ascending: false });
        }
      }

      // Pagination
      const page = 1; // Could be parameterized
      const limit = 20;
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return {
          success: false,
          error: {
            code: 'SUPABASE_ERROR',
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        };
      }

      const agents = (data || []).map(this.mapRowToAgent);
      const total = count || 0;

      const result: PaginatedResponse<Agent> = {
        items: agents,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasNext: total > offset + limit,
        hasPrevious: page > 1,
      };

      return { success: true, data: result };

    } catch (error) {
      const apiError: ApiError = {
        code: 'SEARCH_FAILED',
        message: error instanceof Error ? error.message : 'Failed to search agents',
        timestamp: new Date().toISOString(),
      };

      return { success: false, error: apiError };
    }
  }

  // Get agent by ID
  async getAgentById(id: ID): Promise<Result<Agent>> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: {
              code: 'AGENT_NOT_FOUND',
              message: 'Agent not found',
              timestamp: new Date().toISOString(),
            },
          };
        }

        return {
          success: false,
          error: {
            code: 'SUPABASE_ERROR',
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        };
      }

      const agent = this.mapRowToAgent(data);
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
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .in('id', ids as string[]);

      if (error) {
        return {
          success: false,
          error: {
            code: 'SUPABASE_ERROR',
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        };
      }

      const agents = (data || []).map(this.mapRowToAgent);
      return { success: true, data: agents };

    } catch (error) {
      const apiError: ApiError = {
        code: 'AGENTS_LOAD_FAILED',
        message: error instanceof Error ? error.message : 'Failed to load agents',
        timestamp: new Date().toISOString(),
      };

      return { success: false, error: apiError };
    }
  }

  // Favorites management
  async getFavorites(userId: string): Promise<Result<readonly Agent[]>> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          agent_id,
          agents (*)
        `)
        .eq('user_id', userId);

      if (error) {
        return {
          success: false,
          error: {
            code: 'SUPABASE_ERROR',
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        };
      }

      const agents = (data || [])
        .map(item => item.agents)
        .filter(Boolean)
        .map(this.mapRowToAgent);

      return { success: true, data: agents };

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

  async toggleFavorite(userId: string, agentId: ID): Promise<Result<{ isFavorite: boolean }>> {
    try {
      // Check if already favorited
      const { data: existing, error: checkError } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('agent_id', agentId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        return {
          success: false,
          error: {
            code: 'SUPABASE_ERROR',
            message: checkError.message,
            timestamp: new Date().toISOString(),
          },
        };
      }

      let isFavorite: boolean;

      if (existing) {
        // Remove from favorites
        const { error: deleteError } = await supabase
          .from('user_favorites')
          .delete()
          .eq('id', existing.id);

        if (deleteError) {
          throw deleteError;
        }

        isFavorite = false;
      } else {
        // Add to favorites
        const { error: insertError } = await supabase
          .from('user_favorites')
          .insert({
            user_id: userId,
            agent_id: agentId,
          });

        if (insertError) {
          throw insertError;
        }

        isFavorite = true;
      }

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

  // Analytics and insights
  async getAgentAnalytics(agentId: ID) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('status, created_at, estimated_duration, budget_min, budget_max')
        .eq('agent_id', agentId);

      if (error) throw error;

      const bookings = data || [];

      return {
        totalBookings: bookings.length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
        averageDuration: bookings.reduce((sum, b) => sum + (b.estimated_duration || 0), 0) / bookings.length || 0,
        averageValue: bookings.reduce((sum, b) => sum + ((b.budget_min || 0) + (b.budget_max || 0)) / 2, 0) / bookings.length || 0,
      };

    } catch (error) {
      return null;
    }
  }
}

export const SupabaseAgentService = new SupabaseAgentService();
export default SupabaseAgentService;