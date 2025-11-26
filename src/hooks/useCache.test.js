import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useCache from './useCache';

// Mock timers for testing TTL and garbage collection
vi.useFakeTimers();

describe('useCache', () => {
  let cache;

  beforeEach(() => {
    const { result } = renderHook(() => useCache({
      maxSize: 5,
      defaultTTL: 10000, // 10 seconds
      staleTime: 5000,   // 5 seconds
      gcInterval: 1000,  // 1 second
      enableGC: true
    }));
    cache = result.current;
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Basic Cache Operations', () => {
    it('should set and get cache entries', () => {
      act(() => {
        cache.set('test-key', { data: 'test-value' });
      });

      const result = cache.get('test-key');
      expect(result).toBeTruthy();
      expect(result.data).toEqual({ data: 'test-value' });
      expect(result.isStale).toBe(false);
      expect(result.status).toBe('fresh');
    });

    it('should return null for non-existent keys', () => {
      const result = cache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should check if key exists', () => {
      act(() => {
        cache.set('exists', 'value');
      });

      expect(cache.has('exists')).toBe(true);
      expect(cache.has('does-not-exist')).toBe(false);
    });

    it('should clear all cache entries', () => {
      act(() => {
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');
      });

      expect(cache.getKeys()).toHaveLength(2);

      act(() => {
        const cleared = cache.clear();
        expect(cleared).toBe(2);
      });

      expect(cache.getKeys()).toHaveLength(0);
    });
  });

  describe('TTL and Expiration', () => {
    it('should mark data as stale after stale time', () => {
      act(() => {
        cache.set('stale-test', 'value');
      });

      // Initially fresh
      let result = cache.get('stale-test');
      expect(result.isStale).toBe(false);
      expect(result.status).toBe('fresh');

      // Advance time past stale time but before expiration
      act(() => {
        vi.advanceTimersByTime(6000); // 6 seconds
      });

      result = cache.get('stale-test');
      expect(result.isStale).toBe(true);
      expect(result.status).toBe('stale');
    });

    it('should expire data after TTL', () => {
      act(() => {
        cache.set('expire-test', 'value');
      });

      // Advance time past TTL
      act(() => {
        vi.advanceTimersByTime(11000); // 11 seconds
      });

      const result = cache.get('expire-test');
      expect(result).toBeNull();
    });

    it('should use custom TTL when provided', () => {
      act(() => {
        cache.set('custom-ttl', 'value', 2000); // 2 seconds TTL
      });

      // Should still exist after 1 second
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(cache.get('custom-ttl')).toBeTruthy();

      // Should be expired after 3 seconds
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(cache.get('custom-ttl')).toBeNull();
    });
  });

  describe('LRU Eviction', () => {
    it('should evict least recently used entries when cache is full', () => {
      // Fill cache to max size (5)
      act(() => {
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');
        cache.set('key3', 'value3');
        cache.set('key4', 'value4');
        cache.set('key5', 'value5');
      });

      expect(cache.getKeys()).toHaveLength(5);

      // Access key1 to make it recently used
      cache.get('key1');

      // Add another entry, should evict key2 (least recently used)
      act(() => {
        cache.set('key6', 'value6');
      });

      expect(cache.getKeys()).toHaveLength(5);
      expect(cache.has('key1')).toBe(true); // Recently accessed, should remain
      expect(cache.has('key2')).toBe(false); // Should be evicted
      expect(cache.has('key6')).toBe(true); // Newly added
    });
  });

  describe('Cache Invalidation', () => {
    beforeEach(() => {
      act(() => {
        cache.set('user_123_profile', 'profile data');
        cache.set('user_123_appointments', 'appointments data');
        cache.set('user_456_profile', 'other profile');
        cache.set('api_endpoint_data', 'api data');
        cache.set('other_data', 'other');
      });
    });

    it('should invalidate by string pattern', () => {
      act(() => {
        const invalidated = cache.invalidate('user_123');
        expect(invalidated).toBe(2);
      });

      expect(cache.has('user_123_profile')).toBe(false);
      expect(cache.has('user_123_appointments')).toBe(false);
      expect(cache.has('user_456_profile')).toBe(true);
      expect(cache.has('api_endpoint_data')).toBe(true);
    });

    it('should invalidate by regex pattern', () => {
      act(() => {
        const invalidated = cache.invalidate(/^user_/);
        expect(invalidated).toBe(3);
      });

      expect(cache.has('user_123_profile')).toBe(false);
      expect(cache.has('user_456_profile')).toBe(false);
      expect(cache.has('api_endpoint_data')).toBe(true);
    });

    it('should invalidate by function', () => {
      act(() => {
        const invalidated = cache.invalidate((key, entry) => key.includes('api'));
        expect(invalidated).toBe(1);
      });

      expect(cache.has('api_endpoint_data')).toBe(false);
      expect(cache.has('user_123_profile')).toBe(true);
    });
  });

  describe('Stale While Revalidate', () => {
    it('should return fresh data immediately', async () => {
      const fetchFn = vi.fn().mockResolvedValue('fresh data');

      act(() => {
        cache.set('swr-test', 'cached data');
      });

      const result = await act(async () => {
        return cache.getStaleWhileRevalidate('swr-test', fetchFn);
      });

      expect(result).toBe('cached data');
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('should return stale data and revalidate in background', async () => {
      const fetchFn = vi.fn().mockResolvedValue('new data');

      act(() => {
        cache.set('swr-stale', 'stale data');
      });

      // Make data stale
      act(() => {
        vi.advanceTimersByTime(6000);
      });

      const result = await act(async () => {
        return cache.getStaleWhileRevalidate('swr-stale', fetchFn);
      });

      expect(result).toBe('stale data');
      expect(fetchFn).toHaveBeenCalled();

      // Wait for background revalidation
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Should now have fresh data
      const freshResult = cache.get('swr-stale');
      expect(freshResult.data).toBe('new data');
    });

    it('should fetch fresh data when no cache exists', async () => {
      const fetchFn = vi.fn().mockResolvedValue('fetched data');

      const result = await act(async () => {
        return cache.getStaleWhileRevalidate('no-cache', fetchFn);
      });

      expect(result).toBe('fetched data');
      expect(fetchFn).toHaveBeenCalled();
      expect(cache.get('no-cache').data).toBe('fetched data');
    });

    it('should return stale data on fetch failure', async () => {
      const fetchFn = vi.fn().mockRejectedValue(new Error('Fetch failed'));

      act(() => {
        cache.set('swr-error', 'stale data');
        vi.advanceTimersByTime(11000); // Make expired
      });

      const result = await act(async () => {
        return cache.getStaleWhileRevalidate('swr-error', fetchFn);
      });

      expect(result).toBe('fetched data'); // Should throw since no valid cache
    });
  });

  describe('Garbage Collection', () => {
    it('should automatically remove expired entries', () => {
      act(() => {
        cache.set('gc-test1', 'value1', 1000); // 1 second TTL
        cache.set('gc-test2', 'value2', 5000); // 5 second TTL
      });

      expect(cache.getKeys()).toHaveLength(2);

      // Advance time past first entry's TTL
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Trigger garbage collection
      act(() => {
        const collected = cache.garbageCollect();
        expect(collected).toBe(1);
      });

      expect(cache.has('gc-test1')).toBe(false);
      expect(cache.has('gc-test2')).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should track cache statistics', () => {
      act(() => {
        cache.set('stats1', 'value1');
        cache.set('stats2', 'value2');
      });

      // Generate some hits and misses
      cache.get('stats1'); // hit
      cache.get('stats1'); // hit
      cache.get('nonexistent'); // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.sets).toBe(2);
      expect(stats.size).toBe(2);
      expect(stats.hitRate).toBe(66.67);
      expect(stats.totalRequests).toBe(3);
    });
  });

  describe('Entry Metadata', () => {
    it('should provide full entry metadata', () => {
      act(() => {
        cache.set('metadata-test', 'value');
      });

      const entry = cache.getEntry('metadata-test');
      expect(entry).toBeTruthy();
      expect(entry.data).toBe('value');
      expect(entry.status).toBe('fresh');
      expect(entry.isStale).toBe(false);
      expect(entry.accessCount).toBe(1);
      expect(typeof entry.timestamp).toBe('number');
      expect(typeof entry.lastAccessed).toBe('number');
    });
  });
});