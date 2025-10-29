/**
 * Request Cache Utility
 * Prevents duplicate simultaneous requests to expensive operations
 * Uses in-memory cache with TTL for deduplication
 */

interface CacheEntry<T> {
  promise: Promise<T>;
  timestamp: number;
}

// In-memory request cache
const requestCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 5000; // 5 seconds

/**
 * Cleans up expired cache entries
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  const expiredKeys: string[] = [];
  
  for (const [key, entry] of requestCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      expiredKeys.push(key);
    }
  }
  
  expiredKeys.forEach(key => requestCache.delete(key));
}

/**
 * Wraps an async operation with request deduplication
 * If multiple identical requests are made simultaneously, only one operation executes
 * and all callers receive the same result
 */
export async function dedupRequest<T>(
  key: string,
  operation: () => Promise<T>
): Promise<T> {
  // Cleanup old entries periodically
  if (requestCache.size > 100) {
    cleanupExpiredEntries();
  }

  // Check if request is already in flight
  const existing = requestCache.get(key);
  if (existing) {
    console.log(`[RequestCache] Deduplicating request: ${key.substring(0, 50)}...`);
    return existing.promise;
  }

  // Execute new request and cache it
  const promise = operation();
  requestCache.set(key, {
    promise,
    timestamp: Date.now(),
  });

  try {
    const result = await promise;
    // Keep successful result in cache briefly to serve immediate duplicates
    setTimeout(() => requestCache.delete(key), 1000);
    return result;
  } catch (error) {
    // Remove failed requests immediately
    requestCache.delete(key);
    throw error;
  }
}

/**
 * Creates a cache key from request parameters
 */
export function createCacheKey(prefix: string, ...params: any[]): string {
  return `${prefix}:${JSON.stringify(params)}`;
}
