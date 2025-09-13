import { Agent, FilterOptions, SearchContext } from '../types';
import { N8NService } from './api';
import { mockAgents, getAgentsByQuery, getAgentsByCategory } from '../utils/mockData';

const ENABLE_MOCK_DATA = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';

export class AgentService {
  // Search agents with filters
  static async searchAgents(
    query?: string,
    category?: string,
    filters?: FilterOptions
  ): Promise<{ agents: Agent[]; total: number }> {
    if (ENABLE_MOCK_DATA) {
      console.log('🔧 Using mock data for agent search');
      
      let agents = mockAgents;
      
      // Apply query filter
      if (query) {
        agents = getAgentsByQuery(query);
      }
      
      // Apply category filter
      if (category) {
        agents = getAgentsByCategory(category);
      }
      
      // Apply additional filters
      if (filters) {
        agents = this.applyFilters(agents, filters);
      }
      
      return {
        agents: agents.slice(0, 20), // Limit results
        total: agents.length
      };
    }

    try {
      const response = await N8NService.searchAgents(query || '', {
        category,
        filters,
        limit: 20
      });
      
      return {
        agents: response.agents || [],
        total: response.total || 0
      };
    } catch (error) {
      console.error('Agent search failed:', error);
      
      // Fallback to mock data if API fails
      return this.searchAgents(query, category, filters);
    }
  }

  // Get agent by ID
  static async getAgentById(id: string): Promise<Agent | null> {
    if (ENABLE_MOCK_DATA) {
      return mockAgents.find(agent => agent.id === id) || null;
    }

    try {
      const response = await N8NService.callWebhook('get-agent', { id });
      return response.agent || null;
    } catch (error) {
      console.error('Failed to fetch agent:', error);
      return mockAgents.find(agent => agent.id === id) || null;
    }
  }

  // Get multiple agents by IDs (for comparison)
  static async getAgentsByIds(ids: string[]): Promise<Agent[]> {
    if (ENABLE_MOCK_DATA) {
      return mockAgents.filter(agent => ids.includes(agent.id));
    }

    try {
      const response = await N8NService.callWebhook('get-agents', { ids });
      return response.agents || [];
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      return mockAgents.filter(agent => ids.includes(agent.id));
    }
  }

  // Book an agent
  static async bookAgent(
    agentId: string,
    bookingDetails: {
      date: string;
      time: string;
      duration?: number;
      message?: string;
      contactInfo: {
        name: string;
        email: string;
        phone: string;
      };
    }
  ): Promise<{ success: boolean; bookingId?: string; message: string }> {
    try {
      const response = await N8NService.bookAgent(agentId, bookingDetails);
      return {
        success: true,
        bookingId: response.bookingId,
        message: response.message || 'Booking request sent successfully!'
      };
    } catch (error) {
      console.error('Booking failed:', error);
      return {
        success: false,
        message: 'Failed to send booking request. Please try again.'
      };
    }
  }

  // Send message to agent
  static async messageAgent(
    agentId: string,
    message: string,
    context?: SearchContext
  ): Promise<{ success: boolean; response?: string; conversationId?: string }> {
    try {
      const response = await N8NService.chatWithAgent(agentId, message, context);
      return {
        success: true,
        response: response.reply,
        conversationId: response.conversationId
      };
    } catch (error) {
      console.error('Message failed:', error);
      return {
        success: false,
        response: 'Unable to send message. Please try again later.'
      };
    }
  }

  // Get agent availability
  static async getAgentAvailability(
    agentId: string,
    dateRange: { start: string; end: string }
  ): Promise<{ available: boolean; slots: string[] }> {
    try {
      const response = await N8NService.callWebhook('check-availability', {
        agentId,
        dateRange
      });
      
      return {
        available: response.available || false,
        slots: response.availableSlots || []
      };
    } catch (error) {
      console.error('Availability check failed:', error);
      
      // Mock availability for development
      return {
        available: true,
        slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
      };
    }
  }

  // Apply filters to agent list (client-side filtering for mock data)
  private static applyFilters(agents: Agent[], filters: FilterOptions): Agent[] {
    return agents.filter(agent => {
      // Price filter
      if (agent.pricing.max > filters.priceRange[1]) return false;
      
      // Rating filter
      if (filters.rating > 0 && agent.rating < filters.rating) return false;
      
      // Response time filter
      if (filters.responseTime && !agent.responseTime.toLowerCase().includes(filters.responseTime.toLowerCase())) {
        return false;
      }
      
      // Verification filter
      if (filters.verified && !agent.verified) return false;
      
      // Remote filter
      if (filters.remote && !agent.location.remote) return false;
      
      // Availability filter
      if (filters.available && !agent.available) return false;
      
      return true;
    });
  }

  // Save agent to favorites
  static async saveAgent(agentId: string): Promise<{ success: boolean }> {
    try {
      const saved = JSON.parse(localStorage.getItem('savedAgents') || '[]');
      if (!saved.includes(agentId)) {
        saved.push(agentId);
        localStorage.setItem('savedAgents', JSON.stringify(saved));
      }
      
      // Also send to backend if available
      if (!ENABLE_MOCK_DATA) {
        await N8NService.callWebhook('save-agent', { agentId });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to save agent:', error);
      return { success: false };
    }
  }

  // Get saved agents
  static async getSavedAgents(): Promise<Agent[]> {
    try {
      const savedIds = JSON.parse(localStorage.getItem('savedAgents') || '[]');
      return await this.getAgentsByIds(savedIds);
    } catch (error) {
      console.error('Failed to get saved agents:', error);
      return [];
    }
  }

  // Get agent reviews (extended functionality)
  static async getAgentReviews(
    agentId: string,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      if (ENABLE_MOCK_DATA) {
        // Return mock reviews
        return {
          reviews: [
            {
              id: '1',
              author: 'Jennifer K.',
              rating: 5,
              date: '2 weeks ago',
              content: 'Absolutely fantastic work! Professional and on time.',
              verified: true
            },
            {
              id: '2',
              author: 'Mike R.',
              rating: 5,
              date: '1 month ago',
              content: 'Incredible service. Highly recommend!',
              verified: true
            }
          ],
          total: 2,
          average: 4.9
        };
      }

      const response = await N8NService.callWebhook('get-reviews', {
        agentId,
        page,
        limit
      });
      
      return response;
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      return { reviews: [], total: 0, average: 0 };
    }
  }
}

export default AgentService;