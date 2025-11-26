-- Database Maintenance Scripts for Production
-- Run these scripts periodically for optimal performance

-- 1. Clean up expired reservations (run every 15 minutes via cron)
UPDATE appointments 
SET is_reserved = FALSE, reservation_expires_at = NULL 
WHERE is_reserved = TRUE 
  AND reservation_expires_at < NOW() 
  AND status = 'SCHEDULED';

-- 2. Archive old notification logs (run monthly)
-- Keep only last 6 months of notification logs
DELETE FROM notification_logs 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH)
  AND status IN ('DELIVERED', 'FAILED');

-- 3. Archive old audit logs (run monthly)
-- Keep only last 12 months of audit logs
DELETE FROM audit_logs 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 12 MONTH);

-- 4. Clean up expired session tokens (run daily)
DELETE FROM session_tokens 
WHERE expires_at < NOW() 
   OR is_revoked = TRUE;

-- 5. Update table statistics for query optimizer (run weekly)
ANALYZE TABLE users, doctors, appointments, doctor_availabilities, notification_logs;

-- 6. Optimize tables (run monthly during maintenance window)
OPTIMIZE TABLE users, doctors, appointments, doctor_availabilities, notification_logs, audit_logs, session_tokens;

-- 7. Check for fragmentation (run weekly)
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
    ROUND((data_free / 1024 / 1024), 2) AS 'Free Space (MB)',
    ROUND((data_free / (data_length + index_length)) * 100, 2) AS 'Fragmentation %'
FROM information_schema.tables 
WHERE table_schema = 'appointment_system' 
  AND data_free > 0
ORDER BY `Fragmentation %` DESC;

-- 8. Monitor slow queries
SELECT 
    query_time,
    lock_time,
    rows_sent,
    rows_examined,
    sql_text
FROM mysql.slow_log 
WHERE start_time > DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY query_time DESC 
LIMIT 10;

-- 9. Check database size and growth
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'appointment_system'
GROUP BY table_schema;

-- 10. Monitor connection usage
SHOW PROCESSLIST;
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Max_used_connections';
SHOW VARIABLES LIKE 'max_connections';

-- 11. Check for duplicate or unused indexes
SELECT 
    s.table_name,
    s.index_name,
    s.column_name,
    s.seq_in_index,
    s2.index_name AS duplicate_index
FROM information_schema.statistics s
JOIN information_schema.statistics s2 ON s.table_schema = s2.table_schema
    AND s.table_name = s2.table_name
    AND s.seq_in_index = s2.seq_in_index
    AND s.column_name = s2.column_name
    AND s.index_name != s2.index_name
WHERE s.table_schema = 'appointment_system'
ORDER BY s.table_name, s.index_name;

-- 12. Backup verification query
SELECT 
    'Last backup should be verified manually' AS backup_status,
    NOW() AS check_time;