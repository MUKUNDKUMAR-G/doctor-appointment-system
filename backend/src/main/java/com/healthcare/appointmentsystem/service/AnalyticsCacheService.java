package com.healthcare.appointmentsystem.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.appointmentsystem.entity.AnalyticsCache;
import com.healthcare.appointmentsystem.repository.AnalyticsCacheRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service for managing analytics cache to improve performance.
 * Provides methods to store, retrieve, and invalidate cached analytics data.
 */
@Service
public class AnalyticsCacheService {
    
    private static final Logger logger = LoggerFactory.getLogger(AnalyticsCacheService.class);
    
    @Autowired
    private AnalyticsCacheRepository cacheRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * Get cached data by key
     * @param cacheKey The cache key
     * @param clazz The class type to deserialize to
     * @return Optional containing the cached data if found and not expired
     */
    public <T> Optional<T> get(String cacheKey, Class<T> clazz) {
        Optional<AnalyticsCache> cacheEntry = cacheRepository.findByCacheKey(cacheKey);
        
        if (cacheEntry.isEmpty()) {
            logger.debug("Cache miss for key: {}", cacheKey);
            return Optional.empty();
        }
        
        AnalyticsCache cache = cacheEntry.get();
        
        if (cache.isExpired()) {
            logger.debug("Cache expired for key: {}", cacheKey);
            cacheRepository.delete(cache);
            return Optional.empty();
        }
        
        try {
            T data = objectMapper.readValue(cache.getData(), clazz);
            logger.debug("Cache hit for key: {}", cacheKey);
            return Optional.of(data);
        } catch (JsonProcessingException e) {
            logger.error("Error deserializing cache data for key: {}", cacheKey, e);
            return Optional.empty();
        }
    }
    
    /**
     * Store data in cache
     * @param cacheKey The cache key
     * @param cacheType The type of cache (e.g., "appointment_trends", "user_growth")
     * @param data The data to cache
     * @param ttlMinutes Time to live in minutes
     */
    @Transactional
    public <T> void put(String cacheKey, String cacheType, T data, int ttlMinutes) {
        try {
            String jsonData = objectMapper.writeValueAsString(data);
            LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(ttlMinutes);
            
            Optional<AnalyticsCache> existing = cacheRepository.findByCacheKey(cacheKey);
            
            if (existing.isPresent()) {
                AnalyticsCache cache = existing.get();
                cache.setData(jsonData);
                cache.setExpiresAt(expiresAt);
                cache.setUpdatedAt(LocalDateTime.now());
                cacheRepository.save(cache);
                logger.debug("Updated cache for key: {}", cacheKey);
            } else {
                AnalyticsCache cache = new AnalyticsCache();
                cache.setCacheKey(cacheKey);
                cache.setCacheType(cacheType);
                cache.setData(jsonData);
                cache.setExpiresAt(expiresAt);
                cacheRepository.save(cache);
                logger.debug("Created cache for key: {}", cacheKey);
            }
        } catch (JsonProcessingException e) {
            logger.error("Error serializing cache data for key: {}", cacheKey, e);
        }
    }
    
    /**
     * Invalidate cache by key
     */
    @Transactional
    public void invalidate(String cacheKey) {
        cacheRepository.findByCacheKey(cacheKey).ifPresent(cache -> {
            cacheRepository.delete(cache);
            logger.debug("Invalidated cache for key: {}", cacheKey);
        });
    }
    
    /**
     * Invalidate all cache entries of a specific type
     */
    @Transactional
    public void invalidateByType(String cacheType) {
        int deleted = cacheRepository.deleteByCacheType(cacheType);
        logger.info("Invalidated {} cache entries of type: {}", deleted, cacheType);
    }
    
    /**
     * Invalidate cache entries matching a pattern
     * @param pattern SQL LIKE pattern (e.g., "appointment_trends:%")
     */
    @Transactional
    public void invalidateByPattern(String pattern) {
        int deleted = cacheRepository.deleteByCacheKeyPattern(pattern);
        logger.info("Invalidated {} cache entries matching pattern: {}", deleted, pattern);
    }
    
    /**
     * Clean up expired cache entries
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    @Transactional
    public void cleanupExpiredEntries() {
        int deleted = cacheRepository.deleteExpiredEntries(LocalDateTime.now());
        if (deleted > 0) {
            logger.info("Cleaned up {} expired cache entries", deleted);
        }
    }
}
