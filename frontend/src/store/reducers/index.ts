import { AppState, AppAction } from '../types';
import { uiReducer, initialUIState } from './ui';
import { agentReducer, initialAgentState } from './agents';

// Initial state for booking and user (simplified for now)
const initialBookingState = {
  userBookings: {
    data: undefined,
    loading: { isLoading: false },
    error: { hasError: false, canRetry: true },
  },
  currentBooking: {
    data: undefined,
    loading: { isLoading: false },
    error: { hasError: false, canRetry: true },
  },
  activeFilters: {},
  cache: {},
};

const initialUserState = {
  profile: undefined,
  authentication: {
    isAuthenticated: false,
  },
  activity: {
    recentSearches: [],
    savedAgents: [],
    recentBookings: [],
  },
};

// Root initial state
export const initialAppState: AppState = {
  ui: initialUIState,
  agents: initialAgentState,
  bookings: initialBookingState,
  user: initialUserState,
};

// Root reducer
export function rootReducer(state: AppState = initialAppState, action: AppAction): AppState {
  return {
    ui: uiReducer(state.ui, action),
    agents: agentReducer(state.agents, action),
    bookings: state.bookings, // TODO: Implement booking reducer
    user: state.user, // TODO: Implement user reducer
  };
}

export * from './ui';
export * from './agents';