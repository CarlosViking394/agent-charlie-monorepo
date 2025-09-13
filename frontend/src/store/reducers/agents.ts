import { AgentState } from '../types';
import { ActionType, AppAction } from '../types';
import { Agent, AgentFilters, AgentSearchQuery } from '../../types/agent';
import { ID, PaginatedResponse } from '../../types/core';

// Initial agent state
export const initialAgentState: AgentState = {
  searchResults: {
    data: undefined,
    loading: { isLoading: false },
    error: { hasError: false, canRetry: true },
  },
  currentAgent: {
    data: undefined,
    loading: { isLoading: false },
    error: { hasError: false, canRetry: true },
  },
  favorites: {
    data: [],
    loading: { isLoading: false },
    error: { hasError: false, canRetry: true },
  },
  comparison: {
    data: [],
    loading: { isLoading: false },
    error: { hasError: false, canRetry: true },
  },
  activeFilters: {},
  lastQuery: undefined,
  cache: {},
};

// Agent Reducer
export function agentReducer(state: AgentState = initialAgentState, action: AppAction): AgentState {
  switch (action.type) {
    case ActionType.SEARCH_AGENTS_START:
      return {
        ...state,
        searchResults: {
          ...state.searchResults,
          loading: { isLoading: true, message: 'Searching for agents...' },
          error: { hasError: false, canRetry: true },
        },
        lastQuery: action.payload as AgentSearchQuery,
      };

    case ActionType.SEARCH_AGENTS_SUCCESS:
      if (!action.payload) return state;
      const searchResults = action.payload as PaginatedResponse<Agent>;

      // Cache all agents from search results
      const newCache = { ...state.cache };
      searchResults.items.forEach(agent => {
        newCache[agent.id] = agent;
      });

      return {
        ...state,
        searchResults: {
          data: searchResults,
          loading: { isLoading: false },
          error: { hasError: false, canRetry: true },
        },
        cache: newCache,
      };

    case ActionType.SEARCH_AGENTS_ERROR:
      return {
        ...state,
        searchResults: {
          ...state.searchResults,
          loading: { isLoading: false },
          error: {
            hasError: true,
            message: (action.payload as string) || 'Failed to search agents',
            canRetry: true,
          },
        },
      };

    case ActionType.SET_AGENT_FILTERS:
      if (!action.payload) return state;
      return {
        ...state,
        activeFilters: {
          ...state.activeFilters,
          ...(action.payload as Partial<AgentFilters>),
        },
      };

    case ActionType.CLEAR_AGENT_FILTERS:
      return {
        ...state,
        activeFilters: {},
      };

    case ActionType.LOAD_AGENT_START:
      return {
        ...state,
        currentAgent: {
          ...state.currentAgent,
          loading: { isLoading: true, message: 'Loading agent details...' },
          error: { hasError: false, canRetry: true },
        },
      };

    case ActionType.LOAD_AGENT_SUCCESS:
      if (!action.payload) return state;
      const agent = action.payload as Agent;

      return {
        ...state,
        currentAgent: {
          data: agent,
          loading: { isLoading: false },
          error: { hasError: false, canRetry: true },
        },
        cache: {
          ...state.cache,
          [agent.id]: agent,
        },
      };

    case ActionType.LOAD_AGENT_ERROR:
      return {
        ...state,
        currentAgent: {
          ...state.currentAgent,
          loading: { isLoading: false },
          error: {
            hasError: true,
            message: (action.payload as string) || 'Failed to load agent',
            canRetry: true,
          },
        },
      };

    case ActionType.ADD_TO_COMPARISON:
      if (!action.payload) return state;
      const agentToAdd = action.payload as Agent;
      const currentComparison = state.comparison.data || [];

      // Don't add if already in comparison or at max capacity
      if (currentComparison.some(a => a.id === agentToAdd.id) ||
          currentComparison.length >= 4) {
        return state;
      }

      return {
        ...state,
        comparison: {
          ...state.comparison,
          data: [...currentComparison, agentToAdd],
        },
        cache: {
          ...state.cache,
          [agentToAdd.id]: agentToAdd,
        },
      };

    case ActionType.REMOVE_FROM_COMPARISON:
      if (!action.payload) return state;
      const agentIdToRemove = action.payload as ID;
      const filteredComparison = (state.comparison.data || [])
        .filter(agent => agent.id !== agentIdToRemove);

      return {
        ...state,
        comparison: {
          ...state.comparison,
          data: filteredComparison,
        },
      };

    case ActionType.CLEAR_COMPARISON:
      return {
        ...state,
        comparison: {
          ...state.comparison,
          data: [],
        },
      };

    case ActionType.TOGGLE_FAVORITE:
      if (!action.payload) return state;
      const agentId = action.payload as ID;
      const currentFavorites = state.favorites.data || [];
      const isFavorite = currentFavorites.some(a => a.id === agentId);

      let updatedFavorites: readonly Agent[];
      if (isFavorite) {
        updatedFavorites = currentFavorites.filter(a => a.id !== agentId);
      } else {
        const agentToAdd = state.cache[agentId];
        if (agentToAdd) {
          updatedFavorites = [...currentFavorites, agentToAdd];
        } else {
          updatedFavorites = currentFavorites;
        }
      }

      return {
        ...state,
        favorites: {
          ...state.favorites,
          data: updatedFavorites,
        },
      };

    case ActionType.CACHE_AGENT:
      if (!action.payload) return state;
      const agentToCache = action.payload as Agent;

      return {
        ...state,
        cache: {
          ...state.cache,
          [agentToCache.id]: agentToCache,
        },
      };

    case ActionType.RESET_STATE:
      return initialAgentState;

    default:
      return state;
  }
}