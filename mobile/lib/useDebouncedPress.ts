import { useCallback, useRef } from 'react';

/**
 * Hook to prevent duplicate taps on buttons
 *
 * Usage:
 * ```tsx
 * const handlePress = useDebouncedPress(async () => {
 *   await submitForm();
 * }, 1000);
 *
 * <TouchableOpacity onPress={handlePress}>
 *   <Text>Submit</Text>
 * </TouchableOpacity>
 * ```
 */
export function useDebouncedPress<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const lastPressRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);

  return useCallback(
    async (...args: Parameters<T>) => {
      const now = Date.now();

      // Check if enough time has passed since last press
      if (now - lastPressRef.current < delay) {
        console.log('[DebouncedPress] Ignoring duplicate tap');
        return;
      }

      // Check if still processing previous press
      if (isProcessingRef.current) {
        console.log('[DebouncedPress] Still processing previous action');
        return;
      }

      lastPressRef.current = now;
      isProcessingRef.current = true;

      try {
        await callback(...args);
      } finally {
        isProcessingRef.current = false;
      }
    },
    [callback, delay]
  );
}

/**
 * Hook to track loading state for async operations
 * Prevents duplicate submissions and provides loading state
 *
 * Usage:
 * ```tsx
 * const { execute, isLoading } = useAsyncAction(async () => {
 *   await api.post('/submit', data);
 * });
 *
 * <TouchableOpacity onPress={execute} disabled={isLoading}>
 *   {isLoading ? <ActivityIndicator /> : <Text>Submit</Text>}
 * </TouchableOpacity>
 * ```
 */
export function useAsyncAction<T extends (...args: any[]) => Promise<any>>(
  callback: T,
  options: {
    onSuccess?: (result: Awaited<ReturnType<T>>) => void;
    onError?: (error: Error) => void;
    minDelay?: number; // Minimum time between executions
  } = {}
) {
  const { onSuccess, onError, minDelay = 500 } = options;
  const isLoadingRef = useRef<boolean>(false);
  const lastExecutionRef = useRef<number>(0);

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | null> => {
      const now = Date.now();

      // Prevent duplicate submissions
      if (isLoadingRef.current) {
        console.log('[AsyncAction] Already executing');
        return null;
      }

      // Enforce minimum delay between executions
      if (now - lastExecutionRef.current < minDelay) {
        console.log('[AsyncAction] Too soon, ignoring');
        return null;
      }

      isLoadingRef.current = true;
      lastExecutionRef.current = now;

      try {
        const result = await callback(...args);
        onSuccess?.(result);
        return result;
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error(String(error)));
        return null;
      } finally {
        isLoadingRef.current = false;
      }
    },
    [callback, onSuccess, onError, minDelay]
  );

  return {
    execute,
    get isLoading() {
      return isLoadingRef.current;
    },
  };
}

export default useDebouncedPress;
