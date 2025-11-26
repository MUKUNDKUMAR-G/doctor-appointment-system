package com.healthcare.appointmentsystem.migration;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Collects and exposes metrics for migration operations
 * Integrates with Micrometer for Prometheus/monitoring systems
 * 
 * Requirements addressed:
 * - 4.1: Migration execution metrics
 * - 4.2: Performance monitoring and success/failure rate tracking
 */
@Component
public class MigrationMetricsCollector {
    
    private static final Logger logger = LoggerFactory.getLogger(MigrationMetricsCollector.class);
    
    private final MeterRegistry meterRegistry;
    
    // Counters
    private final Counter migrationSuccessCounter;
    private final Counter migrationFailureCounter;
    private final Counter migrationRepairCounter;
    private final Counter checksumMismatchCounter;
    private final Counter backupCreatedCounter;
    private final Counter rollbackCounter;
    
    // Timers
    private final Timer migrationExecutionTimer;
    private final Timer validationTimer;
    private final Timer backupTimer;
    
    // Gauges (using atomic values)
    private final AtomicInteger pendingMigrationsGauge;
    private final AtomicInteger appliedMigrationsGauge;
    private final AtomicInteger failedMigrationsGauge;
    private final AtomicLong lastMigrationDurationMs;
    
    public MigrationMetricsCollector(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        
        // Initialize counters
        this.migrationSuccessCounter = Counter.builder("migration.executions.success")
            .description("Number of successful migration executions")
            .tag("component", "migration")
            .register(meterRegistry);
        
        this.migrationFailureCounter = Counter.builder("migration.executions.failure")
            .description("Number of failed migration executions")
            .tag("component", "migration")
            .register(meterRegistry);
        
        this.migrationRepairCounter = Counter.builder("migration.repairs")
            .description("Number of migration repair operations")
            .tag("component", "migration")
            .register(meterRegistry);
        
        this.checksumMismatchCounter = Counter.builder("migration.checksum.mismatches")
            .description("Number of checksum mismatches detected")
            .tag("component", "migration")
            .register(meterRegistry);
        
        this.backupCreatedCounter = Counter.builder("migration.backups.created")
            .description("Number of backups created")
            .tag("component", "migration")
            .register(meterRegistry);
        
        this.rollbackCounter = Counter.builder("migration.rollbacks")
            .description("Number of migration rollbacks")
            .tag("component", "migration")
            .register(meterRegistry);
        
        // Initialize timers
        this.migrationExecutionTimer = Timer.builder("migration.execution.duration")
            .description("Duration of migration execution operations")
            .tag("component", "migration")
            .register(meterRegistry);
        
        this.validationTimer = Timer.builder("migration.validation.duration")
            .description("Duration of migration validation operations")
            .tag("component", "migration")
            .register(meterRegistry);
        
        this.backupTimer = Timer.builder("migration.backup.duration")
            .description("Duration of backup creation operations")
            .tag("component", "migration")
            .register(meterRegistry);
        
        // Initialize gauge values
        this.pendingMigrationsGauge = new AtomicInteger(0);
        this.appliedMigrationsGauge = new AtomicInteger(0);
        this.failedMigrationsGauge = new AtomicInteger(0);
        this.lastMigrationDurationMs = new AtomicLong(0);
        
        // Register gauges
        Gauge.builder("migration.pending.count", pendingMigrationsGauge, AtomicInteger::get)
            .description("Number of pending migrations")
            .tag("component", "migration")
            .register(meterRegistry);
        
        Gauge.builder("migration.applied.count", appliedMigrationsGauge, AtomicInteger::get)
            .description("Number of applied migrations")
            .tag("component", "migration")
            .register(meterRegistry);
        
        Gauge.builder("migration.failed.count", failedMigrationsGauge, AtomicInteger::get)
            .description("Number of failed migrations")
            .tag("component", "migration")
            .register(meterRegistry);
        
        Gauge.builder("migration.last.duration.ms", lastMigrationDurationMs, AtomicLong::get)
            .description("Duration of last migration execution in milliseconds")
            .tag("component", "migration")
            .register(meterRegistry);
        
        logger.info("Migration metrics collector initialized");
    }
    
    /**
     * Records a successful migration execution
     */
    public void recordMigrationSuccess(int migrationsExecuted, long durationMs) {
        migrationSuccessCounter.increment();
        lastMigrationDurationMs.set(durationMs);
        migrationExecutionTimer.record(Duration.ofMillis(durationMs));
        logger.debug("Recorded successful migration: {} migrations in {} ms", migrationsExecuted, durationMs);
    }
    
    /**
     * Records a failed migration execution
     */
    public void recordMigrationFailure(long durationMs) {
        migrationFailureCounter.increment();
        lastMigrationDurationMs.set(durationMs);
        migrationExecutionTimer.record(Duration.ofMillis(durationMs));
        logger.debug("Recorded failed migration after {} ms", durationMs);
    }
    
    /**
     * Records a migration repair operation
     */
    public void recordRepairOperation() {
        migrationRepairCounter.increment();
        logger.debug("Recorded migration repair operation");
    }
    
    /**
     * Records a checksum mismatch detection
     */
    public void recordChecksumMismatch(int count) {
        checksumMismatchCounter.increment(count);
        logger.debug("Recorded {} checksum mismatch(es)", count);
    }
    
    /**
     * Records a backup creation
     */
    public void recordBackupCreated(long durationMs) {
        backupCreatedCounter.increment();
        backupTimer.record(Duration.ofMillis(durationMs));
        logger.debug("Recorded backup creation in {} ms", durationMs);
    }
    
    /**
     * Records a migration rollback
     */
    public void recordRollback() {
        rollbackCounter.increment();
        logger.debug("Recorded migration rollback");
    }
    
    /**
     * Records validation operation duration
     */
    public void recordValidation(long durationMs) {
        validationTimer.record(Duration.ofMillis(durationMs));
        logger.debug("Recorded validation operation in {} ms", durationMs);
    }
    
    /**
     * Updates migration count gauges
     */
    public void updateMigrationCounts(int pending, int applied, int failed) {
        pendingMigrationsGauge.set(pending);
        appliedMigrationsGauge.set(applied);
        failedMigrationsGauge.set(failed);
        logger.debug("Updated migration counts: pending={}, applied={}, failed={}", pending, applied, failed);
    }
    
    /**
     * Gets success rate as a percentage
     */
    public double getSuccessRate() {
        double successCount = migrationSuccessCounter.count();
        double failureCount = migrationFailureCounter.count();
        double total = successCount + failureCount;
        
        if (total == 0) {
            return 100.0; // No migrations executed yet, consider as 100%
        }
        
        return (successCount / total) * 100.0;
    }
    
    /**
     * Gets total number of migrations executed
     */
    public long getTotalMigrationsExecuted() {
        return (long) (migrationSuccessCounter.count() + migrationFailureCounter.count());
    }
    
    /**
     * Gets average migration execution time
     */
    public double getAverageMigrationDuration() {
        return migrationExecutionTimer.mean(java.util.concurrent.TimeUnit.MILLISECONDS);
    }
    
    /**
     * Gets maximum migration execution time
     */
    public double getMaxMigrationDuration() {
        return migrationExecutionTimer.max(java.util.concurrent.TimeUnit.MILLISECONDS);
    }
    
    /**
     * Gets metrics summary for logging/reporting
     */
    public MetricsSummary getMetricsSummary() {
        return new MetricsSummary(
            (long) migrationSuccessCounter.count(),
            (long) migrationFailureCounter.count(),
            (long) migrationRepairCounter.count(),
            (long) checksumMismatchCounter.count(),
            (long) backupCreatedCounter.count(),
            (long) rollbackCounter.count(),
            pendingMigrationsGauge.get(),
            appliedMigrationsGauge.get(),
            failedMigrationsGauge.get(),
            getSuccessRate(),
            getAverageMigrationDuration(),
            getMaxMigrationDuration()
        );
    }
    
    /**
     * Summary object for metrics
     */
    public static class MetricsSummary {
        private final long successCount;
        private final long failureCount;
        private final long repairCount;
        private final long checksumMismatchCount;
        private final long backupCount;
        private final long rollbackCount;
        private final int pendingMigrations;
        private final int appliedMigrations;
        private final int failedMigrations;
        private final double successRate;
        private final double avgDuration;
        private final double maxDuration;
        
        public MetricsSummary(long successCount, long failureCount, long repairCount,
                            long checksumMismatchCount, long backupCount, long rollbackCount,
                            int pendingMigrations, int appliedMigrations, int failedMigrations,
                            double successRate, double avgDuration, double maxDuration) {
            this.successCount = successCount;
            this.failureCount = failureCount;
            this.repairCount = repairCount;
            this.checksumMismatchCount = checksumMismatchCount;
            this.backupCount = backupCount;
            this.rollbackCount = rollbackCount;
            this.pendingMigrations = pendingMigrations;
            this.appliedMigrations = appliedMigrations;
            this.failedMigrations = failedMigrations;
            this.successRate = successRate;
            this.avgDuration = avgDuration;
            this.maxDuration = maxDuration;
        }
        
        public long getSuccessCount() { return successCount; }
        public long getFailureCount() { return failureCount; }
        public long getRepairCount() { return repairCount; }
        public long getChecksumMismatchCount() { return checksumMismatchCount; }
        public long getBackupCount() { return backupCount; }
        public long getRollbackCount() { return rollbackCount; }
        public int getPendingMigrations() { return pendingMigrations; }
        public int getAppliedMigrations() { return appliedMigrations; }
        public int getFailedMigrations() { return failedMigrations; }
        public double getSuccessRate() { return successRate; }
        public double getAvgDuration() { return avgDuration; }
        public double getMaxDuration() { return maxDuration; }
        
        @Override
        public String toString() {
            return String.format(
                "MetricsSummary{success=%d, failure=%d, repair=%d, checksumMismatch=%d, " +
                "backup=%d, rollback=%d, pending=%d, applied=%d, failed=%d, " +
                "successRate=%.2f%%, avgDuration=%.2fms, maxDuration=%.2fms}",
                successCount, failureCount, repairCount, checksumMismatchCount,
                backupCount, rollbackCount, pendingMigrations, appliedMigrations, failedMigrations,
                successRate, avgDuration, maxDuration
            );
        }
    }
}
