import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, StoreContext, StoreConfig, Dispatch } from './types';
import { rootReducer, initialAppState } from './reducers';
import { actionCreators } from './actions';

// Create context
const AppStateContext = createContext<StoreContext | undefined>(undefined);

// Provider props
interface StoreProviderProps {
  readonly children: ReactNode;
  readonly config?: StoreConfig;
}

// Local storage persistence utility
const persistenceUtils = {
  save: (key: string, data: any) => {
    try {
      localStorage.setItem(`agentCharlie_${key}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to persist data:', error);
    }
  },

  load: function<T>(key: string, fallback: T): T {
    try {
      const stored = localStorage.getItem(`agentCharlie_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch (error) {
      console.warn('Failed to load persisted data:', error);
      return fallback;
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(`agentCharlie_${key}`);
    } catch (error) {
      console.warn('Failed to remove persisted data:', error);
    }
  },
};

// Enhanced dispatch with middleware support
function createEnhancedDispatch(
  baseDispatch: React.Dispatch<any>,
  state: AppState,
  middleware: readonly any[] = []
): Dispatch {
  return (action) => {
    let processedAction = action;

    // Apply middleware
    middleware.forEach(middlewareFn => {
      processedAction = middlewareFn(state, processedAction, baseDispatch);
    });

    baseDispatch(processedAction);
  };
}

// Store Provider Component
export function StoreProvider({ children, config = {} }: StoreProviderProps) {
  // Load persisted state
  const getInitialState = (): AppState => {
    const persistedData = {
      user: persistenceUtils.load('user', initialAppState.user),
      ui: {
        ...initialAppState.ui,
        theme: persistenceUtils.load('theme', initialAppState.ui.theme),
      },
    };

    return {
      ...initialAppState,
      ...config.initialState,
      ...persistedData,
      ui: {
        ...initialAppState.ui,
        ...config.initialState?.ui,
        ...persistedData.ui,
      },
    };
  };

  const [state, dispatch] = useReducer(rootReducer, getInitialState());

  // Create enhanced dispatch with middleware
  const enhancedDispatch = createEnhancedDispatch(
    dispatch,
    state,
    config.middleware
  );

  // Persist state changes
  useEffect(() => {
    const persistKeys = config.persistKeys || ['user', 'theme'];

    persistKeys.forEach(key => {
      if (key === 'theme') {
        persistenceUtils.save('theme', state.ui.theme);
      } else if (key in state) {
        persistenceUtils.save(key, state[key as keyof AppState]);
      }
    });
  }, [state, config.persistKeys]);

  // Handle viewport changes
  useEffect(() => {
    const handleResize = () => {
      enhancedDispatch(actionCreators.setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024,
      }));
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [enhancedDispatch]);

  // Auto-dismiss notifications
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    state.ui.notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const timeout = setTimeout(() => {
          enhancedDispatch(actionCreators.removeNotification(notification.id));
        }, notification.duration);

        timeouts.push(timeout);
      }
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [state.ui.notifications, enhancedDispatch]);

  // Context value
  const contextValue: StoreContext = {
    state,
    dispatch: enhancedDispatch,
  };

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
}

// Hook to use the store
export function useStore(): StoreContext {
  const context = useContext(AppStateContext);

  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }

  return context;
}

// Selector hooks for specific state slices
export function useUI() {
  const { state } = useStore();
  return state.ui;
}

export function useAgents() {
  const { state } = useStore();
  return state.agents;
}

export function useBookings() {
  const { state } = useStore();
  return state.bookings;
}

export function useUser() {
  const { state } = useStore();
  return state.user;
}

// Selector hook with custom selector function
export function useSelector<T>(selector: (state: AppState) => T): T {
  const { state } = useStore();
  return selector(state);
}

// Action dispatch hooks
export function useActions() {
  const { dispatch } = useStore();

  return {
    ui: {
      setViewport: (viewport: any) => dispatch(actionCreators.setViewport(viewport)),
      setSearchState: (searchState: any) => dispatch(actionCreators.setSearchState(searchState)),
      setSpeechRecognition: (speechState: any) => dispatch(actionCreators.setSpeechRecognition(speechState)),
      setComparisonState: (comparisonState: any) => dispatch(actionCreators.setComparisonState(comparisonState)),
      setFilterPanel: (filterState: any) => dispatch(actionCreators.setFilterPanel(filterState)),
      addNotification: (notification: any) => dispatch(actionCreators.addNotification(notification)),
      removeNotification: (id: string) => dispatch(actionCreators.removeNotification(id)),
    },
    agents: {
      searchStart: (query: any) => dispatch(actionCreators.searchAgentsStart(query)),
      searchSuccess: (results: any) => dispatch(actionCreators.searchAgentsSuccess(results)),
      searchError: (error: string) => dispatch(actionCreators.searchAgentsError(error)),
      setFilters: (filters: any) => dispatch(actionCreators.setAgentFilters(filters)),
      clearFilters: () => dispatch(actionCreators.clearAgentFilters()),
      loadStart: (agentId: string) => dispatch(actionCreators.loadAgentStart(agentId)),
      loadSuccess: (agent: any) => dispatch(actionCreators.loadAgentSuccess(agent)),
      loadError: (error: string) => dispatch(actionCreators.loadAgentError(error)),
      addToComparison: (agent: any) => dispatch(actionCreators.addToComparison(agent)),
      removeFromComparison: (agentId: string) => dispatch(actionCreators.removeFromComparison(agentId)),
      clearComparison: () => dispatch(actionCreators.clearComparison()),
      toggleFavorite: (agentId: string) => dispatch(actionCreators.toggleFavorite(agentId)),
      cache: (agent: any) => dispatch(actionCreators.cacheAgent(agent)),
    },
    user: {
      addRecentSearch: (query: string) => dispatch(actionCreators.addRecentSearch(query)),
      clearRecentSearches: () => dispatch(actionCreators.clearRecentSearches()),
    },
    global: {
      reset: () => dispatch(actionCreators.resetState()),
    },
  };
}