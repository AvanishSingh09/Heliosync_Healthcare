import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let isConnected = false;
let hasLoggedOffline = false;

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 1,
  connectTimeout: 2000,
  retryStrategy(times) {
    if (times > 3) {
      if (!hasLoggedOffline) {
        console.warn('⚠️ Redis not available. Falling back to direct database queries.');
        hasLoggedOffline = true;
      }
      return null; // Stop retrying aggressively
    }
    return Math.min(times * 500, 2000);
  },
  lazyConnect: true,
});

// Try initial connection
redis
  .connect()
  .then(() => {
    isConnected = true;
    console.log('⚡ Redis Cache connected successfully');
  })
  .catch(() => {
    if (!hasLoggedOffline) {
      console.warn('⚠️ Redis running in fallback mode (queries will hit MongoDB directly)');
      hasLoggedOffline = true;
    }
  });

redis.on('connect', () => {
  isConnected = true;
  hasLoggedOffline = false;
});

redis.on('error', () => {
  isConnected = false;
});

/**
 * Retrieve parsed JSON from Redis cache
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    if (!isConnected && redis.status !== 'ready') return null;
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
};

/**
 * Store data as JSON string in Redis with TTL (default 30 mins)
 */
export const setCache = async (
  key: string,
  value: any,
  ttlSeconds: number = 1800
): Promise<void> => {
  try {
    if (!isConnected && redis.status !== 'ready') return;
    const serialized = JSON.stringify(value);
    await redis.setex(key, ttlSeconds, serialized);
  } catch (err) {
    // Non-blocking catch
  }
};

/**
 * Delete a specific key or keys matching pattern
 */
export const delCache = async (keyOrPattern: string): Promise<void> => {
  try {
    if (!isConnected && redis.status !== 'ready') return;

    if (keyOrPattern.includes('*')) {
      const keys = await redis.keys(keyOrPattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      await redis.del(keyOrPattern);
    }
  } catch (err) {
    // Non-blocking catch
  }
};

/**
 * Convenience method to invalidate all cached data for a specific patient
 */
export const invalidatePatientCaches = async (patientId: string): Promise<void> => {
  try {
    await Promise.all([
      delCache(`patient:profile:${patientId}`),
      delCache(`patient:timeline:${patientId}`),
      delCache(`patient:vitals:${patientId}`),
      delCache(`patient:prescriptions:${patientId}`),
      delCache(`patient:documents:${patientId}`),
      delCache(`patient:authorized:${patientId}:*`),
    ]);
  } catch (err) {
    // Non-blocking catch
  }
};
