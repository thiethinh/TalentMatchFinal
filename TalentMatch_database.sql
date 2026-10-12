-- TalentMatch V31 (MySQL 8+) – non-destructive, safe to re-run.
-- BACKUP DATABASE FIRST. For Hibernate ddl-auto=update, skip this file.
USE talentmatch_pro;
SET NAMES utf8mb4;
SET @has_contract = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='projects' AND COLUMN_NAME='agreement_terms');
SET @stmt = IF(@has_contract=0,'ALTER TABLE projects ADD COLUMN agreement_terms TEXT NULL','SELECT 1');
PREPARE tm_stmt FROM @stmt; EXECUTE tm_stmt; DEALLOCATE PREPARE tm_stmt;
SET @has_version = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='projects' AND COLUMN_NAME='agreement_version');
SET @stmt = IF(@has_version=0,'ALTER TABLE projects ADD COLUMN agreement_version INT NOT NULL DEFAULT 1','SELECT 1');
PREPARE tm_stmt FROM @stmt; EXECUTE tm_stmt; DEALLOCATE PREPARE tm_stmt;

CREATE TABLE IF NOT EXISTS project_deliveries (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 project_id BIGINT NOT NULL,
 milestone_id BIGINT NULL,
 submitter_id BIGINT NOT NULL,
 version INT NOT NULL,
 file_name VARCHAR(255),
 storage_key VARCHAR(90),
 external_url VARCHAR(500),
 note TEXT,
 submitted_at DATETIME(6) NOT NULL,
 INDEX idx_delivery_project (project_id),
 CONSTRAINT fk_delivery_project FOREIGN KEY (project_id) REFERENCES projects(id),
 CONSTRAINT fk_delivery_milestone FOREIGN KEY (milestone_id) REFERENCES milestones(id),
 CONSTRAINT fk_delivery_submitter FOREIGN KEY (submitter_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS notifications (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 recipient_id BIGINT NOT NULL,
 title VARCHAR(180) NOT NULL,
 message VARCHAR(1000) NOT NULL,
 target_url VARCHAR(500),
 is_read BIT(1) NOT NULL DEFAULT b'0',
 created_at DATETIME(6) NOT NULL,
 INDEX idx_notification_user (recipient_id, created_at),
 CONSTRAINT fk_notification_recipient FOREIGN KEY (recipient_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
