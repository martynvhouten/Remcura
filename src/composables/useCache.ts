import { ref } from 'vue';
import { logger } from '@/utils/logger';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number;
  maxSize?: number;
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
  serialize?: boolean;
}

export function useCache<T = unknown>(
  prefix = 'cache',
  options: CacheOptions = {}
) {
  const {
    ttl = 5 * 60 * 1000,
    maxSize = 100,
    storage = 'memory',
    serialize = true,
  } = options;

  const memoryCache = new Map<string, CacheItem<T>>();
  const cacheStats = ref({
    hits: 0,
    misses: 0,
    size: 0,
  });

  const getCacheKey = (key: string): string => {
    return `${prefix}:${key}`;
  };

  const getFromStorage = (key: string): CacheItem<T> | null => {
    try {
      switch (storage) {
        case 'localStorage': {
          const localItem = localStorage.getItem(getCacheKey(key));
          return localItem ? (JSON.parse(localItem) as CacheItem<T>) : null;
        }

        case 'sessionStorage': {
          const sessionItem = sessionStorage.getItem(getCacheKey(key));
          return sessionItem ? (JSON.parse(sessionItem) as CacheItem<T>) : null;
        }

        case 'memory':
        default:
          return memoryCache.get(key) ?? null;
      }
    } catch (error) {
      logger.warn(
        'Cache get error',
        'CACHE',
        error instanceof Error ? error : undefined
      );
      return null;
    }
  };

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
      logger.warn(
        'Cache set error',
        'CACHE',
        error instanceof Error ? error : undefined
      );
    }
  };

  const removeFromStorage = (key: string): void => {
    switch (storage) {
      case 'localStorage':
        localStorage.removeItem(getCacheKey(key));
        break;

      case 'sessionStorage':
        sessionStorage.removeItem(getCacheKey(key));
        break;

      case 'memory':
      default:
        memoryCache.delete(key);
        break;
    }
    cacheStats.value.size = memoryCache.size;
  };

  const enforceMaxSize = (): void => {
    if (storage === 'memory' && memoryCache.size > maxSize) {
      const oldestKey = memoryCache.keys().next().value as string | undefined;
      if (oldestKey) {
        memoryCache.delete(oldestKey);
      }
    }
  };

  const isExpired = (item: CacheItem<T>): boolean => {
    return Date.now() > item.expiresAt;
  };

  const get = (key: string): T | null => {
    const item = getFromStorage(key);

    if (!item) {
      cacheStats.value.misses += 1;
      return null;
    }

    if (isExpired(item)) {
      removeFromStorage(key);
      cacheStats.value.misses += 1;
      return null;
    }

    cacheStats.value.hits += 1;
    return item.data;
  };

  const set = (key: string, data: T, customTtl?: number): void => {
    const expirationTime = customTtl ?? ttl;
    const item: CacheItem<T> = {
      data: serialize ? (JSON.parse(JSON.stringify(data)) as T) : data,
      timestamp: Date.now(),
      expiresAt: Date.now() + expirationTime,
    };

    setInStorage(key, item);
  };

  const remove = (key: string): void => {
    removeFromStorage(key);
  };

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

  const getStats = () => ({
    ...cacheStats.value,
    hitRate:
      cacheStats.value.hits /
        (cacheStats.value.hits + cacheStats.value.misses) || 0,
  });

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
    set(key, result as unknown as T, customTtl);
    return result;
  };

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

  const cleanExpired = (): number => {
    let cleaned = 0;

    if (storage === 'memory') {
      for (const [key, item] of memoryCache.entries()) {
        if (isExpired(item)) {
          memoryCache.delete(key);
          cleaned += 1;
        }
      }
    }

    cacheStats.value.size = memoryCache.size;
    return cleaned;
  };

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

export function useApiCache() {
  return useCache('api', {
    ttl: 5 * 60 * 1000,
    maxSize: 50,
    storage: 'memory',
  });
}

export function usePreferencesCache() {
  return useCache('prefs', {
    ttl: 24 * 60 * 60 * 1000,
    maxSize: 20,
    storage: 'localStorage',
  });
}

export function useSessionCache() {
  return useCache('session', {
    ttl: 30 * 60 * 1000,
    maxSize: 30,
    storage: 'sessionStorage',
  });
}

export function useSmartCache<T = unknown>(
  prefix: string,
  options: CacheOptions & { cleanupInterval?: number } = {}
) {
  const { cleanupInterval = 10 * 60 * 1000, ...cacheOptions } = options;
  const cache = useCache<T>(prefix, cacheOptions);

  if (typeof window !== 'undefined') {
    setInterval(() => {
      const cleaned = cache.cleanExpired();
      if (cleaned > 0) {
        logger.debug(
          `Cache cleanup: removed ${cleaned} expired items`,
          'CACHE'
        );
      }
    }, cleanupInterval);
  }

  return cache;
}
