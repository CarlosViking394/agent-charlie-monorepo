import {
  ActionType,
  AppAction,
  SetViewportAction,
  SearchAgentsStartAction,
  SearchAgentsSuccessAction,
  SearchAgentsErrorAction,
  AddNotificationAction,
  RemoveNotificationAction
} from './types';
import {
  ViewportState,
  SearchState,
  SpeechRecognitionState,
  ComparisonState,
  FilterPanelState,
  Notification
} from '../types/ui';
import { Agent, AgentFilters, AgentSearchQuery } from '../types/agent';
import { ID, PaginatedResponse } from '../types/core';

// Action creators
export const actionCreators = {
  // UI Actions
  setViewport: (viewport: ViewportState): SetViewportAction => ({
    type: ActionType.SET_VIEWPORT,
    payload: viewport,
    meta: { timestamp: Date.now(), source: 'ui' },
  }),

  setSearchState: (searchState: Partial<SearchState>): AppAction => ({
    type: ActionType.SET_SEARCH_STATE,
    payload: searchState,
    meta: { timestamp: Date.now(), source: 'ui' },
  }),

  setSpeechRecognition: (speechState: Partial<SpeechRecognitionState>): AppAction => ({
    type: ActionType.SET_SPEECH_RECOGNITION,
    payload: speechState,
    meta: { timestamp: Date.now(), source: 'ui' },
  }),

  setComparisonState: (comparisonState: Partial<ComparisonState>): AppAction => ({
    type: ActionType.SET_COMPARISON_STATE,
    payload: comparisonState,
    meta: { timestamp: Date.now(), source: 'ui' },
  }),

  setFilterPanel: (filterState: Partial<FilterPanelState>): AppAction => ({
    type: ActionType.SET_FILTER_PANEL,
    payload: filterState,
    meta: { timestamp: Date.now(), source: 'ui' },
  }),

  addNotification: (notification: Notification): AddNotificationAction => ({
    type: ActionType.ADD_NOTIFICATION,
    payload: notification,
    meta: { timestamp: Date.now(), source: 'notification' },
  }),

  removeNotification: (notificationId: ID): RemoveNotificationAction => ({
    type: ActionType.REMOVE_NOTIFICATION,
    payload: notificationId,
    meta: { timestamp: Date.now(), source: 'notification' },
  }),

  setTheme: (theme: ViewportState): AppAction => ({
    type: ActionType.SET_THEME,
    payload: theme,
    meta: { timestamp: Date.now(), source: 'ui' },
  }),

  // Agent Actions
  searchAgentsStart: (query: AgentSearchQuery): SearchAgentsStartAction => ({
    type: ActionType.SEARCH_AGENTS_START,
    payload: query,
    meta: { timestamp: Date.now(), source: 'agent' },
  }),

  searchAgentsSuccess: (results: PaginatedResponse<Agent>): SearchAgentsSuccessAction => ({
    type: ActionType.SEARCH_AGENTS_SUCCESS,
    payload: results,
    meta: { timestamp: Date.now(), source: 'agent' },
  }),

  searchAgentsError: (error: string): SearchAgentsErrorAction => ({
    type: ActionType.SEARCH_AGENTS_ERROR,
    payload: error,
    meta: { timestamp: Date.now(), source: 'agent' },
  }),

  setAgentFilters: (filters: Partial<AgentFilters>): AppAction => ({
    type: ActionType.SET_AGENT_FILTERS,
    payload: filters,
    meta: { timestamp: Date.now(), source: 'agent' },
  }),

  clearAgentFilters: (): AppAction => ({
    type: ActionType.CLEAR_AGENT_FILTERS,
    meta: { timestamp: Date.now(), source: 'agent' },
  }),

  loadAgentStart: (agentId: ID): AppAction => ({
    type: ActionType.LOAD_AGENT_START,
    payload: agentId,
    meta: { timestamp: Date.now(), source: 'agent' },
  }),

  loadAgentSuccess: (agent: Agent): AppAction => ({
    type: ActionType.LOAD_AGENT_SUCCESS,
    payload: agent,
    meta: { timestamp: Date.now(), source: 'agent' },
  }),

  loadAgentError: (error: string): AppAction => ({
    type: ActionType.LOAD_AGENT_ERROR,
    payload: error,
    meta: { timestamp: Date.now(), source: 'agent' },
  }),

  addToComparison: (agent: Agent): AppAction => ({
    type: ActionType.ADD_TO_COMPARISON,
    payload: agent,
    meta: { timestamp: Date.now(), source: 'agent' },
  }),

  removeFromComparison: (agentId: ID): AppAction => ({
    type: ActionType.REMOVE_FROM_COMPARISON,
    payload: agentId,
    meta: { timestamp: Date.now(), source: 'agent' },
  }),

  clearComparison: (): AppAction => ({
    type: ActionType.CLEAR_COMPARISON,
    meta: { timestamp: Date.now(), source: 'agent' },
  }),

  toggleFavorite: (agentId: ID): AppAction => ({
    type: ActionType.TOGGLE_FAVORITE,
    payload: agentId,
    meta: { timestamp: Date.now(), source: 'agent' },
  }),

  cacheAgent: (agent: Agent): AppAction => ({
    type: ActionType.CACHE_AGENT,
    payload: agent,
    meta: { timestamp: Date.now(), source: 'agent' },
  }),

  // User Actions
  addRecentSearch: (query: string): AppAction => ({
    type: ActionType.ADD_RECENT_SEARCH,
    payload: query,
    meta: { timestamp: Date.now(), source: 'user' },
  }),

  clearRecentSearches: (): AppAction => ({
    type: ActionType.CLEAR_RECENT_SEARCHES,
    meta: { timestamp: Date.now(), source: 'user' },
  }),

  // Global Actions
  resetState: (): AppAction => ({
    type: ActionType.RESET_STATE,
    meta: { timestamp: Date.now(), source: 'global' },
  }),

  hydrateState: (state: any): AppAction => ({
    type: ActionType.HYDRATE_STATE,
    payload: state,
    meta: { timestamp: Date.now(), source: 'global' },
  }),
};

// Utility functions for creating notifications
export const notificationHelpers = {
  success: (title: string, message?: string): Notification => ({
    id: `notification-${Date.now()}-${Math.random()}`,
    type: 'success' as const,
    title,
    message,
    duration: 4000,
  }),

  error: (title: string, message?: string): Notification => ({
    id: `notification-${Date.now()}-${Math.random()}`,
    type: 'error' as const,
    title,
    message,
    duration: 6000,
  }),

  warning: (title: string, message?: string): Notification => ({
    id: `notification-${Date.now()}-${Math.random()}`,
    type: 'warning' as const,
    title,
    message,
    duration: 5000,
  }),

  info: (title: string, message?: string): Notification => ({
    id: `notification-${Date.now()}-${Math.random()}`,
    type: 'info' as const,
    title,
    message,
    duration: 4000,
  }),
};

// Async action creators (for thunk-like behavior)
export const asyncActions = {
  searchAgents: (query: AgentSearchQuery) => async (dispatch: (action: AppAction) => void) => {
    try {
      dispatch(actionCreators.searchAgentsStart(query));

      // Import agent service dynamically to avoid circular dependencies
      const { AgentService } = await import('../services/agentService');
      const results = await AgentService.searchAgents(
        query.query,
        undefined, // category
        query.filters
      );

      const paginatedResults: PaginatedResponse<Agent> = {
        items: results.agents,
        total: results.total,
        page: 1,
        totalPages: Math.ceil(results.total / 20),
        hasNext: results.total > 20,
        hasPrevious: false,
      };

      dispatch(actionCreators.searchAgentsSuccess(paginatedResults));

      // Show success notification
      dispatch(actionCreators.addNotification(
        notificationHelpers.success('Search completed', `Found ${results.total} agents`)
      ));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      dispatch(actionCreators.searchAgentsError(errorMessage));

      // Show error notification
      dispatch(actionCreators.addNotification(
        notificationHelpers.error('Search failed', errorMessage)
      ));
    }
  },

  loadAgent: (agentId: ID) => async (dispatch: (action: AppAction) => void) => {
    try {
      dispatch(actionCreators.loadAgentStart(agentId));

      const { AgentService } = await import('../services/agentService');
      const agent = await AgentService.getAgentById(agentId);

      if (agent) {
        dispatch(actionCreators.loadAgentSuccess(agent));
      } else {
        throw new Error('Agent not found');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load agent';
      dispatch(actionCreators.loadAgentError(errorMessage));

      dispatch(actionCreators.addNotification(
        notificationHelpers.error('Failed to load agent', errorMessage)
      ));
    }
  },
};