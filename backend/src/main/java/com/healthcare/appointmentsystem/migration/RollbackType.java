package com.healthcare.appointmentsystem.migration;

/**
 * Enumeration of rollback types supported by the migration system
 * 
 * Requirements addressed:
 * - 2.3: Automatic rollback on migration failure
 * - 2.4: Manual rollback capabilities and point-in-time rollback
 */
public enum RollbackType {
    
    /**
     * Automatic rollback triggered by migration failure
     * Uses pre-migration backup to restore database state
     */
    AUTOMATIC("Automatic rollback on migration failure"),
    
    /**
     * Manual rollback initiated by administrator
     * Allows selective rollback of specific migrations
     */
    MANUAL("Manual rollback initiated by administrator"),
    
    /**
     * Point-in-time rollback to specific migration version
     * Rolls back to a specific point in migration history
     */
    POINT_IN_TIME("Point-in-time rollback to specific version"),
    
    /**
     * Emergency rollback using backup restoration
     * Fast rollback using pre-migration backup
     */
    EMERGENCY("Emergency rollback using backup restoration"),
    
    /**
     * Selective rollback of specific migration
     * Undoes changes from a particular migration
     */
    SELECTIVE("Selective rollback of specific migration");
    
    private final String description;
    
    RollbackType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    @Override
    public String toString() {
        return name() + ": " + description;
    }
}