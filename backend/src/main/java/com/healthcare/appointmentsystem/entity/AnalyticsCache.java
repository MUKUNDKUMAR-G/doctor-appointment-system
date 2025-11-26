package com.healthcare.appointmentsystem.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing cached analytics data for performance optimization.
 * This table stores pre-calculated analytics to reduce database query load.
 */
@Entity
@Table(name = "analytics_cache", indexes = {
    @Index(name = "idx_analytics_cache_key", columnList = "cache_key"),
    @Index(name = "idx_analytics_cache_type", columnList = "cache_type"),
    @Index(name = "idx_analytics_cache_expires", columnList = "expires_at")
})
public class AnalyticsCache {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "cache_key", nullable = false, unique = true, length = 255)
    private String cacheKey;
    
    @Column(name = "cache_type", nullable = false, length = 50)
    private String cacheType;
    
    @Column(name = "data", nullable = false, columnDefinition = "JSON")
    private String data;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    // Constructors
    public AnalyticsCache() {
    }
    
    public AnalyticsCache(String cacheKey, String cacheType, String data, LocalDateTime expiresAt) {
        this.cacheKey = cacheKey;
        this.cacheType = cacheType;
        this.data = data;
        this.expiresAt = expiresAt;
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    /**
     * Check if this cache entry has expired
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getCacheKey() {
        return cacheKey;
    }
    
    public void setCacheKey(String cacheKey) {
        this.cacheKey = cacheKey;
    }
    
    public String getCacheType() {
        return cacheType;
    }
    
    public void setCacheType(String cacheType) {
        this.cacheType = cacheType;
    }
    
    public String getData() {
        return data;
    }
    
    public void setData(String data) {
        this.data = data;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
}
