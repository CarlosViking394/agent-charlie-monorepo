import {
  AsyncState,
  SearchState,
  SpeechRecognitionState,
  ComparisonState,
  FilterPanelState,
  Notification,
  UserPreferences,
  ViewportState
} from '../types/ui';
import { Agent, AgentFilters, AgentSearchQuery } from '../types/agent';
import { Booking, BookingFilters } from '../types/booking';
import { ID, PaginatedResponse } from '../types/core';

// Root application state
export interface AppState {
  readonly ui: UIState;
  readonly agents: AgentState;
  readonly bookings: BookingState;
  readonly user: UserState;
}

// UI State slice
export interface UIState {
  readonly viewport: ViewportState;
  readonly search: SearchState;
  readonly speechRecognition: SpeechRecognitionState;
  readonly comparison: ComparisonState;
  readonly filterPanel: FilterPanelState;
  readonly notifications: readonly Notification[];
  readonly theme: UserPreferences['theme'];
}

// Agent State slice
export interface AgentState {
  readonly searchResults: AsyncState<PaginatedResponse<Agent>>;
  readonly currentAgent: AsyncState<Agent>;
  readonly favorites: AsyncState<readonly Agent[]>;
  readonly comparison: AsyncState<readonly Agent[]>;
  readonly activeFilters: AgentFilters;
  readonly lastQuery?: AgentSearchQuery;
  readonly cache: Record<ID, Agent>;
}

// Booking State slice
export interface BookingState {
  readonly userBookings: AsyncState<PaginatedResponse<Booking>>;
  readonly currentBooking: AsyncState<Booking>;
  readonly activeFilters: BookingFilters;
  readonly cache: Record<ID, Booking>;
}

// User State slice
export interface UserState {
  readonly profile?: {
    readonly id: ID;
    readonly name: string;
    readonly email: string;
    readonly preferences: UserPreferences;
  };
  readonly authentication: {
    readonly isAuthenticated: boolean;
    readonly token?: string;
    readonly refreshToken?: string;
    readonly expiresAt?: number;
  };
  readonly activity: {
    readonly recentSearches: readonly string[];
    readonly savedAgents: readonly ID[];
    readonly recentBookings: readonly ID[];
  };
}

// Action types
export enum ActionType {
  // UI Actions
  SET_VIEWPORT = 'SET_VIEWPORT',
  SET_SEARCH_STATE = 'SET_SEARCH_STATE',
  SET_SPEECH_RECOGNITION = 'SET_SPEECH_RECOGNITION',
  SET_COMPARISON_STATE = 'SET_COMPARISON_STATE',
  SET_FILTER_PANEL = 'SET_FILTER_PANEL',
  ADD_NOTIFICATION = 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION',
  SET_THEME = 'SET_THEME',

  // Agent Actions
  SEARCH_AGENTS_START = 'SEARCH_AGENTS_START',
  SEARCH_AGENTS_SUCCESS = 'SEARCH_AGENTS_SUCCESS',
  SEARCH_AGENTS_ERROR = 'SEARCH_AGENTS_ERROR',
  SET_AGENT_FILTERS = 'SET_AGENT_FILTERS',
  CLEAR_AGENT_FILTERS = 'CLEAR_AGENT_FILTERS',
  LOAD_AGENT_START = 'LOAD_AGENT_START',
  LOAD_AGENT_SUCCESS = 'LOAD_AGENT_SUCCESS',
  LOAD_AGENT_ERROR = 'LOAD_AGENT_ERROR',
  ADD_TO_COMPARISON = 'ADD_TO_COMPARISON',
  REMOVE_FROM_COMPARISON = 'REMOVE_FROM_COMPARISON',
  CLEAR_COMPARISON = 'CLEAR_COMPARISON',
  TOGGLE_FAVORITE = 'TOGGLE_FAVORITE',
  CACHE_AGENT = 'CACHE_AGENT',

  // Booking Actions
  LOAD_BOOKINGS_START = 'LOAD_BOOKINGS_START',
  LOAD_BOOKINGS_SUCCESS = 'LOAD_BOOKINGS_SUCCESS',
  LOAD_BOOKINGS_ERROR = 'LOAD_BOOKINGS_ERROR',
  CREATE_BOOKING_START = 'CREATE_BOOKING_START',
  CREATE_BOOKING_SUCCESS = 'CREATE_BOOKING_SUCCESS',
  CREATE_BOOKING_ERROR = 'CREATE_BOOKING_ERROR',
  UPDATE_BOOKING = 'UPDATE_BOOKING',
  SET_BOOKING_FILTERS = 'SET_BOOKING_FILTERS',
  CACHE_BOOKING = 'CACHE_BOOKING',

  // User Actions
  LOGIN_START = 'LOGIN_START',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_ERROR = 'LOGIN_ERROR',
  LOGOUT = 'LOGOUT',
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  UPDATE_PREFERENCES = 'UPDATE_PREFERENCES',
  ADD_RECENT_SEARCH = 'ADD_RECENT_SEARCH',
  CLEAR_RECENT_SEARCHES = 'CLEAR_RECENT_SEARCHES',

  // Global Actions
  RESET_STATE = 'RESET_STATE',
  HYDRATE_STATE = 'HYDRATE_STATE',
}

// Action interfaces
export interface Action<T = unknown> {
  readonly type: ActionType;
  readonly payload?: T;
  readonly meta?: {
    readonly timestamp: number;
    readonly source?: string;
  };
}

// Specific action creators
export interface SetViewportAction extends Action<ViewportState> {
  readonly type: ActionType.SET_VIEWPORT;
}

export interface SearchAgentsStartAction extends Action<AgentSearchQuery> {
  readonly type: ActionType.SEARCH_AGENTS_START;
}

export interface SearchAgentsSuccessAction extends Action<PaginatedResponse<Agent>> {
  readonly type: ActionType.SEARCH_AGENTS_SUCCESS;
}

export interface SearchAgentsErrorAction extends Action<string> {
  readonly type: ActionType.SEARCH_AGENTS_ERROR;
}

export interface AddNotificationAction extends Action<Notification> {
  readonly type: ActionType.ADD_NOTIFICATION;
}

export interface RemoveNotificationAction extends Action<ID> {
  readonly type: ActionType.REMOVE_NOTIFICATION;
}

// Union type of all actions
export type AppAction =
  | SetViewportAction
  | SearchAgentsStartAction
  | SearchAgentsSuccessAction
  | SearchAgentsErrorAction
  | AddNotificationAction
  | RemoveNotificationAction
  | Action; // Fallback for other actions

// Middleware function type
export type Middleware<S = AppState> = (
  state: S,
  action: AppAction,
  dispatch: Dispatch
) => AppAction;

// Dispatch function type
export type Dispatch = (action: AppAction) => void;

// Store context type
export interface StoreContext {
  readonly state: AppState;
  readonly dispatch: Dispatch;
}

// Selector function type
export type Selector<T> = (state: AppState) => T;

// Store configuration
export interface StoreConfig {
  readonly initialState?: Partial<AppState>;
  readonly middleware?: readonly Middleware[];
  readonly persistKeys?: readonly (keyof AppState)[];
  readonly devTools?: boolean;
}