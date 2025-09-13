import { useState, useCallback, useRef, useEffect } from 'react';
import { AsyncState } from '../types/ui';

// Generic async operation hook
export function useAsyncOperation<T, P extends readonly unknown[] = []>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: undefined,
    loading: { isLoading: false },
    error: { hasError: false, canRetry: true },
  });

  const cancelRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelRef.current?.abort();
    };
  }, []);

  const execute = useCallback(
    async (asyncFunction: (...args: P) => Promise<T>, ...args: P) => {
      // Cancel any previous operation
      cancelRef.current?.abort();
      cancelRef.current = new AbortController();

      setState(prev => ({
        ...prev,
        loading: { isLoading: true, message: 'Processing...' },
        error: { hasError: false, canRetry: true },
      }));

      try {
        const result = await asyncFunction(...args);

        if (mountedRef.current && !cancelRef.current?.signal.aborted) {
          setState({
            data: result,
            loading: { isLoading: false },
            error: { hasError: false, canRetry: true },
          });
        }

        return result;
      } catch (error) {
        if (mountedRef.current && !cancelRef.current?.signal.aborted) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred';

          setState(prev => ({
            ...prev,
            loading: { isLoading: false },
            error: {
              hasError: true,
              message: errorMessage,
              canRetry: true,
            },
          }));
        }

        throw error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    cancelRef.current?.abort();
    setState({
      data: undefined,
      loading: { isLoading: false },
      error: { hasError: false, canRetry: true },
    });
  }, []);

  const retry = useCallback(
    async (asyncFunction: (...args: P) => Promise<T>, ...args: P) => {
      return execute(asyncFunction, ...args);
    },
    [execute]
  );

  return {
    ...state,
    execute,
    reset,
    retry,
    isLoading: state.loading.isLoading,
    hasError: state.error.hasError,
    canRetry: state.error.canRetry,
  };
}

// Specialized hooks for common operations
export function useApiCall<T, P extends readonly unknown[] = []>() {
  return useAsyncOperation<T, P>();
}

export function useDataFetching<T>(
  fetchFunction: () => Promise<T>,
  dependencies: readonly unknown[] = []
) {
  const { execute, ...state } = useAsyncOperation<T>();

  useEffect(() => {
    execute(fetchFunction);
  }, dependencies);

  return state;
}