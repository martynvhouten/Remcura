import { ref, Ref } from 'vue';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
  serialize?: boolean;
}

/**
 * Advanced caching composable for better performance
 * Supports multiple storage types and smart cache invalidation
 */
export function useCache<T = any>(
  prefix: string = 'cache',
  options: CacheOptions = {}
) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    maxSize = 100,
    storage = 'memory',
    serialize = true,
  } = options;

  // Memory cache
  const memoryCache = new Map<string, CacheItem<T>>();
  const cacheStats = ref({
    hits: 0,
    misses: 0,
    size: 0,
  });

  /**
   * Generate cache key with prefix
   */
  const getCacheKey = (key: string): string => {
    return `${prefix}:${key}`;
  };

  /**
   * Get item from appropriate storage
   */
  const getFromStorage = (key: string): CacheItem<T> | null => {
    try {
      switch (storage) {
        case 'localStorage': {
          const localItem = localStorage.getItem(getCacheKey(key));
          return localItem ? JSON.parse(localItem) : null;
        }

        case 'sessionStorage': {
          const sessionItem = sessionStorage.getItem(getCacheKey(key));
          return sessionItem ? JSON.parse(sessionItem) : null;
        }

        case 'memory':
        default:
          return memoryCache.get(key) || null;
      }
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  };

  /**
   * Set item in appropriate storage
   */
  const setInStorage = (key: string, item: CacheItem<T>): void => {
    try {
      switch (storage) {
        case 'localStorage': {
          localStorage.setItem(getCacheKey(key), JSON.stringify(item));
          break;
        }

        case 'sessionStorage': {
          sessionStorage.setItem(getCacheKey(key), JSON.stringify(item));
          break;
        }

        case 'memory':
        default:
          memoryCache.set(key, item);
          enforceMaxSize();
          break;
      }
      cacheStats.value.size = memoryCache.size;
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  };

  /**
   * Remove item from storage
   */
  const removeFromStorage = (key: string): void => {
    switch (storage) {
      case 'localStorage': {
        localStorage.removeItem(getCacheKey(key));
        break;
      }

      case 'sessionStorage': {
        sessionStorage.removeItem(getCacheKey(key));
        break;
      }

      case 'memory':
      default:
        memoryCache.delete(key);
        break;
    }
    cacheStats.value.size = memoryCache.size;
  };

  /**
   * Enforce maximum cache size (LRU eviction)
   */
  const enforceMaxSize = (): void => {
    if (storage === 'memory' && memoryCache.size > maxSize) {
      const oldestKey = memoryCache.keys().next().value;
      if (oldestKey) {
        memoryCache.delete(oldestKey);
      }
    }
  };

  /**
   * Check if cache item is expired
   */
  const isExpired = (item: CacheItem<T>): boolean => {
    return Date.now() > item.expiresAt;
  };

  /**
   * Get cached data
   */
  const get = (key: string): T | null => {
    const item = getFromStorage(key);

    if (!item) {
      cacheStats.value.misses++;
      return null;
    }

    if (isExpired(item)) {
      removeFromStorage(key);
      cacheStats.value.misses++;
      return null;
    }

    cacheStats.value.hits++;
    return item.data;
  };

  /**
   * Set cached data
   */
  const set = (key: string, data: T, customTtl?: number): void => {
    const expirationTime = customTtl || ttl;
    const item: CacheItem<T> = {
      data: serialize ? JSON.parse(JSON.stringify(data)) : data,
      timestamp: Date.now(),
      expiresAt: Date.now() + expirationTime,
    };

    setInStorage(key, item);
  };

  /**
   * Remove cached data
   */
  const remove = (key: string): void => {
    removeFromStorage(key);
  };

  /**
   * Clear all cache
   */
  const clear = (): void => {
    switch (storage) {
      case 'localStorage':
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(`${prefix}:`)) {
            localStorage.removeItem(key);
          }
        });
        break;

      case 'sessionStorage':
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith(`${prefix}:`)) {
            sessionStorage.removeItem(key);
          }
        });
        break;

      case 'memory':
      default:
        memoryCache.clear();
        break;
    }
    cacheStats.value.size = 0;
  };

  /**
   * Get cache statistics
   */
  const getStats = () => ({
    ...cacheStats.value,
    hitRate:
      cacheStats.value.hits /
        (cacheStats.value.hits + cacheStats.value.misses) || 0,
  });

  /**
   * Get or set with async function
   */
  const getOrSet = async <TResult = T>(
    key: string,
    fetchFn: () => Promise<TResult>,
    customTtl?: number
  ): Promise<TResult> => {
    const cached = get(key) as TResult | null;

    if (cached !== null) {
      return cached;
    }

    const result = await fetchFn();
    set(key, result as any, customTtl);
    return result;
  };

  /**
   * Batch operations
   */
  const batchGet = (keys: string[]): Array<T | null> => {
    return keys.map(key => get(key));
  };

  const batchSet = (
    entries: Array<{ key: string; data: T; ttl?: number }>
  ): void => {
    entries.forEach(({ key, data, ttl: customTtl }) => {
      set(key, data, customTtl);
    });
  };

  /**
   * Clean expired items
   */
  const cleanExpired = (): number => {
    let cleaned = 0;

    if (storage === 'memory') {
      for (const [key, item] of memoryCache.entries()) {
        if (isExpired(item)) {
          memoryCache.delete(key);
          cleaned++;
        }
      }
    } else {
      // For localStorage/sessionStorage, we'd need to iterate through all keys
      // This is more expensive, so we'll do it on-demand
    }

    cacheStats.value.size = memoryCache.size;
    return cleaned;
  };

  /**
   * Check if key exists and is valid
   */
  const has = (key: string): boolean => {
    const item = getFromStorage(key);
    return item !== null && !isExpired(item);
  };

  return {
    get,
    set,
    remove,
    clear,
    has,
    getOrSet,
    batchGet,
    batchSet,
    cleanExpired,
    getStats,
    stats: cacheStats,
  };
}

/**
 * Specialized cache for API responses
 */
export function useApiCache() {
  return useCache('api', {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 50,
    storage: 'memory',
  });
}

/**
 * Specialized cache for user preferences
 */
export function usePreferencesCache() {
  return useCache('prefs', {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 20,
    storage: 'localStorage',
  });
}

/**
 * Specialized cache for session data
 */
export function useSessionCache() {
  return useCache('session', {
    ttl: 30 * 60 * 1000, // 30 minutes
    maxSize: 30,
    storage: 'sessionStorage',
  });
}

/**
 * Advanced cache with automatic cleanup
 */
export function useSmartCache<T = any>(
  prefix: string,
  options: CacheOptions & { cleanupInterval?: number } = {}
) {
  const { cleanupInterval = 10 * 60 * 1000, ...cacheOptions } = options;
  const cache = useCache<T>(prefix, cacheOptions);

  // Auto cleanup expired items
  if (typeof window !== 'undefined') {
    setInterval(() => {
      const cleaned = cache.cleanExpired();
      if (cleaned > 0) {
        console.debug(`Cache cleanup: removed ${cleaned} expired items`);
      }
    }, cleanupInterval);
  }

  return cache;
}
