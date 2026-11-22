/**
 * High-performance In-Memory LRU Cache & Single-Flight Request Deduplicator
 * for Raj Suchna Admin & Public API routes.
 *
 * Designed for serverless Next.js runtimes:
 * 1. Serves high-read notices, agencies, and categories in <1ms on warm instances.
 * 2. In-Flight Single-Flight Deduplication: Coalesces concurrent identical requests
 *    into a single execution, preventing thundering herds and redundant database/memory operations.
 * 3. Smart invalidation on content mutations (create, update, approve, publish, delete).
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const MAX_CACHE_SIZE = 1000;

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU order on hit
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    if (this.cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  deletePrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global server memory cache
export const serverCache = new MemoryCache();

// Active in-flight promises map for request coalescing / single-flight deduplication
const inFlightPromises = new Map<string, Promise<unknown>>();

/**
 * Deduplicates simultaneous calls to `fn` for the same `key`.
 * If multiple callers request the same key simultaneously, only 1 execution runs,
 * and all callers receive the identical resolved value.
 */
export async function singleFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inFlightPromises.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = (async () => {
    try {
      return await fn();
    } finally {
      inFlightPromises.delete(key);
    }
  })();

  inFlightPromises.set(key, promise);
  return promise;
}

/**
 * Reads from memory cache if fresh, otherwise runs `fetcher` through single-flight deduplication.
 */
export async function getCachedOrFetch<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = serverCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  return singleFlight(key, async () => {
    // Double check cache in case a previous single-flight just completed
    const secondCheck = serverCache.get<T>(key);
    if (secondCheck !== null) {
      return secondCheck;
    }

    const result = await fetcher();
    if (result !== undefined && result !== null) {
      serverCache.set(key, result, ttlSeconds * 1000);
    }
    return result;
  });
}

// Targeted Cache Invalidation helpers
export function invalidateNoticeCache(): void {
  serverCache.deletePrefix('notices:');
  serverCache.deletePrefix('admin:notices:');
  serverCache.deletePrefix('dashboard:');
}

export function invalidateAgencyCache(): void {
  serverCache.deletePrefix('agencies:');
}

export function invalidateCategoryCache(): void {
  serverCache.deletePrefix('categories:');
}

export function invalidateMcqCache(): void {
  serverCache.deletePrefix('mcq-tests:');
}

export function invalidateCurrentAffairsCache(): void {
  serverCache.deletePrefix('current-affairs:');
}
