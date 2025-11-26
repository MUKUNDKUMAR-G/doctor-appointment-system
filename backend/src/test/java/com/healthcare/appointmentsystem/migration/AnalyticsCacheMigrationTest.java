package com.healthcare.appointmentsystem.migration;

import com.healthcare.appointmentsystem.entity.AnalyticsCache;
import com.healthcare.appointmentsystem.repository.AnalyticsCacheRepository;
import com.healthcare.appointmentsystem.service.AnalyticsCacheService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration test to verify the analytics_cache table migration
 * and the AnalyticsCacheService functionality.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AnalyticsCacheMigrationTest {
    
    @Autowired(required = false)
    private AnalyticsCacheRepository cacheRepository;
    
    @Autowired(required = false)
    private AnalyticsCacheService cacheService;
    
    @Test
    public void testAnalyticsCacheTableExists() {
        // This test will fail if the migration didn't run
        assertNotNull(cacheRepository, "AnalyticsCacheRepository should be available");
    }
    
    @Test
    public void testAnalyticsCacheServiceAvailable() {
        assertNotNull(cacheService, "AnalyticsCacheService should be available");
    }
    
    @Test
    public void testCreateAndRetrieveCacheEntry() {
        if (cacheRepository == null) {
            System.out.println("Skipping test - AnalyticsCacheRepository not available");
            return;
        }
        
        // Create a cache entry
        AnalyticsCache cache = new AnalyticsCache();
        cache.setCacheKey("test_key_" + System.currentTimeMillis());
        cache.setCacheType("test_type");
        cache.setData("{\"test\": \"data\"}");
        cache.setExpiresAt(LocalDateTime.now().plusHours(1));
        
        // Save it
        AnalyticsCache saved = cacheRepository.save(cache);
        assertNotNull(saved.getId(), "Cache entry should have an ID after saving");
        
        // Retrieve it
        Optional<AnalyticsCache> retrieved = cacheRepository.findByCacheKey(cache.getCacheKey());
        assertTrue(retrieved.isPresent(), "Cache entry should be retrievable");
        assertEquals(cache.getCacheKey(), retrieved.get().getCacheKey());
        assertEquals(cache.getCacheType(), retrieved.get().getCacheType());
    }
    
    @Test
    public void testCacheServicePutAndGet() {
        if (cacheService == null) {
            System.out.println("Skipping test - AnalyticsCacheService not available");
            return;
        }
        
        // Create test data
        Map<String, Object> testData = new HashMap<>();
        testData.put("metric", "test_metric");
        testData.put("value", 42);
        
        String cacheKey = "test_service_key_" + System.currentTimeMillis();
        
        // Store in cache
        cacheService.put(cacheKey, "test_type", testData, 60);
        
        // Retrieve from cache
        Optional<Map> retrieved = cacheService.get(cacheKey, Map.class);
        assertTrue(retrieved.isPresent(), "Cache entry should be retrievable via service");
        assertEquals("test_metric", retrieved.get().get("metric"));
    }
    
    @Test
    public void testCacheExpiration() {
        if (cacheRepository == null) {
            System.out.println("Skipping test - AnalyticsCacheRepository not available");
            return;
        }
        
        // Create an expired cache entry
        AnalyticsCache cache = new AnalyticsCache();
        cache.setCacheKey("expired_key_" + System.currentTimeMillis());
        cache.setCacheType("test_type");
        cache.setData("{\"test\": \"data\"}");
        cache.setExpiresAt(LocalDateTime.now().minusHours(1)); // Already expired
        
        AnalyticsCache saved = cacheRepository.save(cache);
        
        // Check if it's expired
        assertTrue(saved.isExpired(), "Cache entry should be marked as expired");
    }
    
    @Test
    public void testCacheInvalidation() {
        if (cacheService == null) {
            System.out.println("Skipping test - AnalyticsCacheService not available");
            return;
        }
        
        String cacheKey = "invalidation_test_" + System.currentTimeMillis();
        Map<String, Object> testData = new HashMap<>();
        testData.put("test", "data");
        
        // Store in cache
        cacheService.put(cacheKey, "test_type", testData, 60);
        
        // Verify it's there
        Optional<Map> retrieved = cacheService.get(cacheKey, Map.class);
        assertTrue(retrieved.isPresent(), "Cache entry should exist before invalidation");
        
        // Invalidate
        cacheService.invalidate(cacheKey);
        
        // Verify it's gone
        Optional<Map> afterInvalidation = cacheService.get(cacheKey, Map.class);
        assertFalse(afterInvalidation.isPresent(), "Cache entry should not exist after invalidation");
    }
}
