import { UIState } from '../types';
import { ActionType, AppAction } from '../types';
import {
  ViewportState,
  SearchState,
  SpeechRecognitionState,
  ComparisonState,
  FilterPanelState,
  Notification
} from '../../types/ui';

// Initial UI state
export const initialUIState: UIState = {
  viewport: {
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  },
  search: {
    query: '',
    isListening: false,
    hasResults: false,
    suggestions: [],
    recentSearches: [],
  },
  speechRecognition: {
    isSupported: typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
    isListening: false,
    transcript: '',
    confidence: 0,
  },
  comparison: {
    selectedAgents: [],
    maxSelections: 4,
    isComparing: false,
  },
  filterPanel: {
    isOpen: false,
    activeFilters: {},
    appliedFilters: {},
    hasChanges: false,
  },
  notifications: [],
  theme: {
    name: 'light',
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#8b5cf6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    isDark: false,
  },
};

// UI Reducer
export function uiReducer(state: UIState = initialUIState, action: AppAction): UIState {
  switch (action.type) {
    case ActionType.SET_VIEWPORT:
      if (!action.payload) return state;
      const viewport = action.payload as ViewportState;
      return {
        ...state,
        viewport: {
          ...viewport,
          isMobile: viewport.width < 768,
          isTablet: viewport.width >= 768 && viewport.width < 1024,
          isDesktop: viewport.width >= 1024,
        },
      };

    case ActionType.SET_SEARCH_STATE:
      if (!action.payload) return state;
      return {
        ...state,
        search: {
          ...state.search,
          ...(action.payload as Partial<SearchState>),
        },
      };

    case ActionType.SET_SPEECH_RECOGNITION:
      if (!action.payload) return state;
      return {
        ...state,
        speechRecognition: {
          ...state.speechRecognition,
          ...(action.payload as Partial<SpeechRecognitionState>),
        },
      };

    case ActionType.SET_COMPARISON_STATE:
      if (!action.payload) return state;
      return {
        ...state,
        comparison: {
          ...state.comparison,
          ...(action.payload as Partial<ComparisonState>),
        },
      };

    case ActionType.SET_FILTER_PANEL:
      if (!action.payload) return state;
      const filterUpdate = action.payload as Partial<FilterPanelState>;
      return {
        ...state,
        filterPanel: {
          ...state.filterPanel,
          ...filterUpdate,
          hasChanges: filterUpdate.activeFilters
            ? JSON.stringify(filterUpdate.activeFilters) !== JSON.stringify(state.filterPanel.appliedFilters)
            : state.filterPanel.hasChanges,
        },
      };

    case ActionType.ADD_NOTIFICATION:
      if (!action.payload) return state;
      const notification = action.payload as Notification;
      return {
        ...state,
        notifications: [...state.notifications, notification],
      };

    case ActionType.REMOVE_NOTIFICATION:
      if (!action.payload) return state;
      const notificationId = action.payload as string;
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== notificationId),
      };

    case ActionType.SET_THEME:
      if (!action.payload) return state;
      return {
        ...state,
        theme: action.payload as UIState['theme'],
      };

    case ActionType.RESET_STATE:
      return initialUIState;

    default:
      return state;
  }
}