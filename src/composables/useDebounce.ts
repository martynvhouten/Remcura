import { ref, Ref } from 'vue';

/**
 * Debounce composable for better performance
 * Delays execution of expensive operations like filtering and API calls
 */
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): {
  debouncedFn: (...args: Parameters<T>) => void;
  cancel: () => void;
  flush: () => void;
  pending: Ref<boolean>;
} {
  let timeoutId: NodeJS.Timeout | null = null;
  const pending = ref(false);
  let lastArgs: Parameters<T> | null = null;

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      pending.value = false;
    }
  };

  const flush = () => {
    if (timeoutId && lastArgs) {
      cancel();
      fn(...lastArgs);
      lastArgs = null;
    }
  };

  const debouncedFn = (...args: Parameters<T>) => {
    lastArgs = args;
    cancel();
    pending.value = true;

    timeoutId = setTimeout(() => {
      fn(...args);
      pending.value = false;
      timeoutId = null;
      lastArgs = null;
    }, delay);
  };

  return {
    debouncedFn,
    cancel,
    flush,
    pending,
  };
}

/**
 * Debounced ref for reactive values
 * Useful for filter inputs that should update with delay
 */
export function useDebouncedRef<T>(
  initialValue: T,
  delay: number = 300
): {
  value: Ref<T>;
  debouncedValue: Ref<T>;
  pending: Ref<boolean>;
} {
  const value = ref(initialValue) as Ref<T>;
  const debouncedValue = ref(initialValue) as Ref<T>;
  const pending = ref(false);

  const { debouncedFn } = useDebounce((newValue: T) => {
    debouncedValue.value = newValue;
  }, delay);

  // Watch for changes and debounce them
  const unwatchValue = (() => {
    let timeoutId: NodeJS.Timeout | null = null;

    return (newValue: T) => {
      pending.value = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        debouncedValue.value = newValue;
        pending.value = false;
      }, delay);
    };
  })();

  // Set up watcher manually to avoid circular dependency
  let isWatching = false;
  const startWatching = () => {
    if (isWatching) return;
    isWatching = true;

    // Simple reactive watching
    const check = () => {
      if (value.value !== debouncedValue.value && !pending.value) {
        unwatchValue(value.value);
      }
      requestAnimationFrame(check);
    };
    check();
  };

  startWatching();

  return {
    value,
    debouncedValue,
    pending,
  };
}
