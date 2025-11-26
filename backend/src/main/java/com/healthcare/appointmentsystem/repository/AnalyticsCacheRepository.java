package com.healthcare.appointmentsystem.repository;

import com.healthcare.appointmentsystem.entity.AnalyticsCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for managing analytics cache entries.
 */
@Repository
public interface AnalyticsCacheRepository extends JpaRepository<AnalyticsCache, Long> {
    
    /**
     * Find a cache entry by its key
     */
    Optional<AnalyticsCache> findByCacheKey(String cacheKey);
    
    /**
     * Find all cache entries of a specific type
     */
    List<AnalyticsCache> findByCacheType(String cacheType);
    
    /**
     * Find all expired cache entries
     */
    @Query("SELECT ac FROM AnalyticsCache ac WHERE ac.expiresAt < :now")
    List<AnalyticsCache> findExpiredEntries(@Param("now") LocalDateTime now);
    
    /**
     * Delete expired cache entries
     */
    @Modifying
    @Query("DELETE FROM AnalyticsCache ac WHERE ac.expiresAt < :now")
    int deleteExpiredEntries(@Param("now") LocalDateTime now);
    
    /**
     * Delete all cache entries of a specific type
     */
    @Modifying
    @Query("DELETE FROM AnalyticsCache ac WHERE ac.cacheType = :cacheType")
    int deleteByCacheType(@Param("cacheType") String cacheType);
    
    /**
     * Delete cache entries matching a key pattern
     */
    @Modifying
    @Query("DELETE FROM AnalyticsCache ac WHERE ac.cacheKey LIKE :pattern")
    int deleteByCacheKeyPattern(@Param("pattern") String pattern);
}
