-- Base schema for TalentMatch to ensure database and parent tables exist
CREATE DATABASE IF NOT EXISTS talentmatch_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE talentmatch_pro;
SET NAMES utf8mb4;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    phone VARCHAR(25),
    avatar VARCHAR(500),
    professional_title VARCHAR(160),
    bio TEXT,
    skills VARCHAR(1000),
    field VARCHAR(120),
    location VARCHAR(160),
    website VARCHAR(255),
    linkedin_url VARCHAR(255),
    experience_years INT DEFAULT 0,
    hourly_rate DECIMAL(15,2),
    available BIT(1) DEFAULT b'1',
    company_name VARCHAR(160),
    company_size VARCHAR(80),
    contact_name VARCHAR(120),
    tax_code VARCHAR(40),
    rating DOUBLE DEFAULT 5.0,
    completed_projects INT DEFAULT 0,
    talent_credit_balance INT DEFAULT 0,
    enabled BIT(1) DEFAULT b'0',
    locked BIT(1) DEFAULT b'0',
    created_at DATETIME(6),
    updated_at DATETIME(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(220) NOT NULL,
    category VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    required_skills VARCHAR(1000),
    budget DECIMAL(15,2) NOT NULL,
    price_type VARCHAR(30) DEFAULT 'FIXED',
    deadline DATE,
    estimated_duration_days INT DEFAULT 14,
    featured BIT(1) NOT NULL DEFAULT b'0',
    verified BIT(1) NOT NULL DEFAULT b'0',
    work_type VARCHAR(60) DEFAULT 'REMOTE',
    experience_level VARCHAR(60) DEFAULT 'MIDDLE',
    escrow_funded BIT(1) NOT NULL DEFAULT b'0',
    acceptance_criteria TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    customer_id BIGINT NOT NULL,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    CONSTRAINT fk_jobs_customer FOREIGN KEY (customer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Job Applications table
CREATE TABLE IF NOT EXISTS job_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    freelancer_id BIGINT NOT NULL,
    proposal TEXT NOT NULL,
    proposed_price DECIMAL(15,2) NOT NULL,
    estimated_days INT NOT NULL,
    portfolio_link VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    created_at DATETIME(6),
    updated_at DATETIME(6),
    UNIQUE KEY uk_job_freelancer (job_id, freelancer_id),
    CONSTRAINT fk_app_job FOREIGN KEY (job_id) REFERENCES jobs(id),
    CONSTRAINT fk_app_freelancer FOREIGN KEY (freelancer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Projects table
CREATE TABLE IF NOT EXISTS projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    freelancer_id BIGINT NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'WAITING_PAYMENT',
    cancellation_reason TEXT,
    credit_awarded BIT(1) NOT NULL DEFAULT b'0',
    created_at DATETIME(6),
    updated_at DATETIME(6),
    completed_at DATETIME(6),
    customer_signed_at DATETIME(6),
    freelancer_signed_at DATETIME(6),
    CONSTRAINT fk_project_app FOREIGN KEY (application_id) REFERENCES job_applications(id),
    CONSTRAINT fk_project_customer FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT fk_project_freelancer FOREIGN KEY (freelancer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Milestones table
CREATE TABLE IF NOT EXISTS milestones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT,
    amount DECIMAL(15,2) NOT NULL,
    deadline DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    revision_note TEXT,
    created_at DATETIME(6),
    completed_at DATETIME(6),
    CONSTRAINT fk_milestone_project FOREIGN KEY (project_id) REFERENCES projects(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Payments table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    milestone_id BIGINT,
    payer_id BIGINT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    method VARCHAR(40) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    transaction_code VARCHAR(80) NOT NULL UNIQUE,
    created_at DATETIME(6),
    paid_at DATETIME(6),
    disbursed_at DATETIME(6),
    CONSTRAINT fk_payment_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_payment_milestone FOREIGN KEY (milestone_id) REFERENCES milestones(id),
    CONSTRAINT fk_payment_payer FOREIGN KEY (payer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Saved Jobs table
CREATE TABLE IF NOT EXISTS saved_jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    freelancer_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    created_at DATETIME(6),
    UNIQUE KEY uk_saved_job (freelancer_id, job_id),
    CONSTRAINT fk_saved_freelancer FOREIGN KEY (freelancer_id) REFERENCES users(id),
    CONSTRAINT fk_saved_job FOREIGN KEY (job_id) REFERENCES jobs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Job Invitations table
CREATE TABLE IF NOT EXISTS job_invitations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    freelancer_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SENT',
    message VARCHAR(500),
    created_at DATETIME(6),
    UNIQUE KEY uk_invitation (job_id, freelancer_id),
    CONSTRAINT fk_inv_job FOREIGN KEY (job_id) REFERENCES jobs(id),
    CONSTRAINT fk_inv_customer FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT fk_inv_freelancer FOREIGN KEY (freelancer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Job Questions table
CREATE TABLE IF NOT EXISTS job_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    created_at DATETIME(6),
    answered_at DATETIME(6),
    CONSTRAINT fk_question_job FOREIGN KEY (job_id) REFERENCES jobs(id),
    CONSTRAINT fk_question_author FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Talent Reports table
CREATE TABLE IF NOT EXISTS talent_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id BIGINT NOT NULL,
    reported_user_id BIGINT NOT NULL,
    project_id BIGINT,
    reason VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'PENDING',
    admin_note TEXT,
    created_at DATETIME(6),
    CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES users(id),
    CONSTRAINT fk_report_target FOREIGN KEY (reported_user_id) REFERENCES users(id),
    CONSTRAINT fk_report_project FOREIGN KEY (project_id) REFERENCES projects(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Talent Reviews table
CREATE TABLE IF NOT EXISTS talent_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    target_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comment VARCHAR(1000) NOT NULL,
    created_at DATETIME(6),
    UNIQUE KEY uk_review (project_id, author_id),
    CONSTRAINT fk_review_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_review_author FOREIGN KEY (author_id) REFERENCES users(id),
    CONSTRAINT fk_review_target FOREIGN KEY (target_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Admin Audit Logs table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_id BIGINT NOT NULL,
    actor_email VARCHAR(160) NOT NULL,
    action VARCHAR(70) NOT NULL,
    target_type VARCHAR(45) NOT NULL,
    target_id BIGINT NOT NULL,
    details VARCHAR(600),
    created_at DATETIME(6) NOT NULL,
    INDEX idx_admin_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Verification Tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(100) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL UNIQUE,
    expires_at DATETIME(6),
    CONSTRAINT fk_verification_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Password Reset Tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(100) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expires_at DATETIME(6),
    used BIT(1) DEFAULT b'0',
    CONSTRAINT fk_pwd_reset_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
