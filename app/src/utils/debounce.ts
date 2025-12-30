/**
 * Debounce utility functions
 */

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * 
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns The debounced function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * React hook for debouncing a callback function
 * Returns a debounced version of the callback that will only execute after
 * the specified delay has passed since the last invocation.
 * 
 * @param callback - The callback function to debounce
 * @param delay - The delay in milliseconds (default: 300)
 * @returns The debounced callback
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number = 300
): T {
  // This is a simple implementation - in a real app you might want to use
  // useMemo or useRef to persist the debounced function across renders
  return debounce(callback, delay) as T;
}

