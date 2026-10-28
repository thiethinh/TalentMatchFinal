-- ============================================================================
-- TalentMatch V33 — FULL FRESH DATABASE SCHEMA & SEED DATA (MySQL 8+)
-- Khởi tạo lại toàn bộ Cơ Sở Dữ Liệu talentmatch_pro sạch sẽ 100%
-- Nạp toàn bộ dữ liệu mẫu phong phú: Users (19 tài khoản test), Jobs, Proposals,
-- Projects (Orders/Contracts), Milestones, Deliveries, Reviews, Disputes,
-- Bank Accounts, Portfolios, VNPay Sandbox Transactions, Notifications, Invitations.
-- Tuyệt đối không dùng dữ liệu tĩnh trong file - Mọi dữ liệu đều truy vấn từ DB.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS talentmatch_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE talentmatch_pro;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. DROP ALL EXISTING TABLES CLEANLY
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS verification_tokens;
DROP TABLE IF EXISTS admin_audit_logs;
DROP TABLE IF EXISTS talent_reports;
DROP TABLE IF EXISTS talent_reviews;
DROP TABLE IF EXISTS disputes;
DROP TABLE IF EXISTS vnpay_transactions;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS project_deliveries;
DROP TABLE IF EXISTS milestones;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS job_questions;
DROP TABLE IF EXISTS job_invitations;
DROP TABLE IF EXISTS saved_jobs;
DROP TABLE IF EXISTS job_applications;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS freelancer_portfolios;
DROP TABLE IF EXISTS withdrawal_requests;
DROP TABLE IF EXISTS user_bank_accounts;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS platform_settings;
DROP TABLE IF EXISTS users;

-- ----------------------------------------------------------------------------
-- 2. CREATE TABLE SCHEMAS
-- ----------------------------------------------------------------------------

-- [1] USERS TABLE
CREATE TABLE users (
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
    hourly_rate DECIMAL(15,2) DEFAULT 0.00,
    available BIT(1) DEFAULT b'1',
    company_name VARCHAR(160),
    company_size VARCHAR(80),
    contact_name VARCHAR(120),
    tax_code VARCHAR(40),
    rating DOUBLE DEFAULT 5.0,
    completed_projects INT DEFAULT 0,
    talent_credit_balance INT DEFAULT 0,
    enabled BIT(1) DEFAULT b'1',
    locked BIT(1) DEFAULT b'0',
    is_verified BIT(1) NOT NULL DEFAULT b'0',
    email_verified BIT(1) NOT NULL DEFAULT b'1',
    account_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    kyc_status VARCHAR(30) NOT NULL DEFAULT 'NOT_SUBMITTED',
    id_card_number VARCHAR(30) NULL,
    id_card_front_url VARCHAR(500) NULL,
    id_card_back_url VARCHAR(500) NULL,
    id_card_selfie_url VARCHAR(500) NULL,
    kyc_submitted_at DATETIME(6) NULL,
    kyc_verified_at DATETIME(6) NULL,
    kyc_rejection_reason TEXT NULL,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    escrow_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    talent_credit_score INT NOT NULL DEFAULT 850,
    talent_credit_badge VARCHAR(30) NOT NULL DEFAULT 'Bronze',
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [2] PLATFORM SETTINGS
CREATE TABLE platform_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    updated_at DATETIME(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [3] USER BANK ACCOUNTS
CREATE TABLE user_bank_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    bank_name VARCHAR(120) NOT NULL,
    bank_code VARCHAR(40) NOT NULL,
    account_number VARCHAR(60) NOT NULL,
    account_holder VARCHAR(120) NOT NULL,
    is_default BIT(1) NOT NULL DEFAULT b'0',
    created_at DATETIME(6) NOT NULL,
    INDEX idx_bank_user (user_id),
    CONSTRAINT fk_bank_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [4] WITHDRAWAL REQUESTS
CREATE TABLE withdrawal_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    bank_name VARCHAR(120) NOT NULL,
    bank_code VARCHAR(40) NOT NULL,
    account_number VARCHAR(60) NOT NULL,
    account_holder VARCHAR(120) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    fee DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    net_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    admin_note TEXT,
    transaction_code VARCHAR(80) UNIQUE,
    created_at DATETIME(6) NOT NULL,
    processed_at DATETIME(6),
    INDEX idx_withdrawal_user (user_id, status),
    CONSTRAINT fk_withdrawal_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [5] FREELANCER PORTFOLIOS
CREATE TABLE freelancer_portfolios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(220) NOT NULL,
    category VARCHAR(120) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    project_url VARCHAR(500),
    created_at DATETIME(6) NOT NULL,
    INDEX idx_portfolio_user (user_id),
    CONSTRAINT fk_portfolio_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [6] NOTIFICATIONS
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    title VARCHAR(180) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    target_url VARCHAR(500),
    is_read BIT(1) NOT NULL DEFAULT b'0',
    type VARCHAR(40) NOT NULL DEFAULT 'SYSTEM',
    created_at DATETIME(6) NOT NULL,
    INDEX idx_notification_user (recipient_id, created_at),
    CONSTRAINT fk_notif_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [7] JOBS
CREATE TABLE jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(220) NOT NULL,
    category VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    required_skills VARCHAR(1000),
    budget DECIMAL(15,2) NOT NULL,
    price_type VARCHAR(30) DEFAULT 'FIXED',
    budget_type VARCHAR(30) NOT NULL DEFAULT 'FIXED',
    deadline DATE,
    estimated_duration_days INT DEFAULT 14,
    featured BIT(1) NOT NULL DEFAULT b'0',
    verified BIT(1) NOT NULL DEFAULT b'0',
    work_type VARCHAR(60) DEFAULT 'REMOTE',
    experience_level VARCHAR(60) DEFAULT 'MIDDLE',
    escrow_funded BIT(1) NOT NULL DEFAULT b'0',
    acceptance_criteria TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    proposals_count INT NOT NULL DEFAULT 0,
    customer_id BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    INDEX idx_jobs_category (category),
    INDEX idx_jobs_status (status),
    CONSTRAINT fk_jobs_customer FOREIGN KEY (customer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [8] JOB APPLICATIONS (PROPOSALS)
CREATE TABLE job_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    freelancer_id BIGINT NOT NULL,
    proposal TEXT NOT NULL,
    proposed_price DECIMAL(15,2) NOT NULL,
    estimated_days INT NOT NULL,
    portfolio_link VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    UNIQUE KEY uk_job_freelancer (job_id, freelancer_id),
    CONSTRAINT fk_app_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_freelancer FOREIGN KEY (freelancer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [9] SAVED JOBS
CREATE TABLE saved_jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    freelancer_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    UNIQUE KEY uk_saved_job (freelancer_id, job_id),
    CONSTRAINT fk_saved_freelancer FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [10] JOB INVITATIONS
CREATE TABLE job_invitations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    freelancer_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SENT',
    message VARCHAR(500),
    responded_at DATETIME(6) NULL,
    decline_reason VARCHAR(500) NULL,
    created_at DATETIME(6) NOT NULL,
    UNIQUE KEY uk_invitation (job_id, freelancer_id),
    CONSTRAINT fk_inv_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_inv_customer FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT fk_inv_freelancer FOREIGN KEY (freelancer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [11] JOB QUESTIONS
CREATE TABLE job_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    created_at DATETIME(6) NOT NULL,
    answered_at DATETIME(6),
    CONSTRAINT fk_question_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_question_author FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [12] PROJECTS (ORDERS / CONTRACTS)
CREATE TABLE projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    freelancer_id BIGINT NOT NULL,
    order_number VARCHAR(50) UNIQUE,
    service_title VARCHAR(255) NULL,
    total_price DECIMAL(15,2) NOT NULL,
    platform_fee DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    freelancer_payout_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    deadline DATE NULL,
    revision_count INT NOT NULL DEFAULT 0,
    max_revisions_allowed INT NOT NULL DEFAULT 3,
    auto_accept_days_remaining INT NOT NULL DEFAULT 3,
    agreement_terms TEXT NULL,
    agreement_version INT NOT NULL DEFAULT 1,
    sow_requirements TEXT NULL,
    notes TEXT NULL,
    payment_method VARCHAR(50) NULL,
    vnpay_transaction_id VARCHAR(100) NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'WAITING_PAYMENT',
    cancellation_reason TEXT,
    credit_awarded BIT(1) NOT NULL DEFAULT b'0',
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    completed_at DATETIME(6) NULL,
    customer_signed_at DATETIME(6) NULL,
    freelancer_signed_at DATETIME(6) NULL,
    INDEX idx_project_customer (customer_id),
    INDEX idx_project_freelancer (freelancer_id),
    INDEX idx_project_status (status),
    CONSTRAINT fk_project_app FOREIGN KEY (application_id) REFERENCES job_applications(id),
    CONSTRAINT fk_project_customer FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT fk_project_freelancer FOREIGN KEY (freelancer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [13] MILESTONES
CREATE TABLE milestones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT,
    amount DECIMAL(15,2) NOT NULL,
    deadline DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    revision_note TEXT,
    created_at DATETIME(6) NOT NULL,
    completed_at DATETIME(6),
    CONSTRAINT fk_milestone_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [14] PROJECT DELIVERIES
CREATE TABLE project_deliveries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    milestone_id BIGINT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size VARCHAR(50) NULL,
    demo_url VARCHAR(500) NULL,
    note TEXT,
    submitted_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT fk_deliv_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_deliv_milestone FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [15] PAYMENTS
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    milestone_id BIGINT NULL,
    payer_id BIGINT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    method VARCHAR(40) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    transaction_code VARCHAR(80) NOT NULL UNIQUE,
    created_at DATETIME(6) NOT NULL,
    paid_at DATETIME(6) NULL,
    disbursed_at DATETIME(6) NULL,
    CONSTRAINT fk_payment_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_milestone FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE SET NULL,
    CONSTRAINT fk_payment_payer FOREIGN KEY (payer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [16] TALENT REVIEWS
CREATE TABLE talent_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    target_id BIGINT NOT NULL,
    rating INT NOT NULL,
    quality_rating DECIMAL(3,1) NOT NULL DEFAULT 5.0,
    deadline_rating DECIMAL(3,1) NOT NULL DEFAULT 5.0,
    communication_rating DECIMAL(3,1) NOT NULL DEFAULT 5.0,
    comment VARCHAR(1000) NOT NULL,
    freelancer_reply TEXT NULL,
    order_title VARCHAR(255) NULL,
    created_at DATETIME(6) NOT NULL,
    UNIQUE KEY uk_review (project_id, author_id),
    CONSTRAINT fk_review_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_author FOREIGN KEY (author_id) REFERENCES users(id),
    CONSTRAINT fk_review_target FOREIGN KEY (target_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [17] DISPUTES
CREATE TABLE disputes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    order_number VARCHAR(50),
    opened_by BIGINT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    evidence_notes TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    refund_employer_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    payout_freelancer_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    admin_resolution_note TEXT,
    resolved_by BIGINT,
    created_at DATETIME(6) NOT NULL,
    resolved_at DATETIME(6),
    INDEX idx_dispute_project (project_id),
    INDEX idx_dispute_status (status),
    CONSTRAINT fk_dispute_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_dispute_opened_by FOREIGN KEY (opened_by) REFERENCES users(id),
    CONSTRAINT fk_dispute_resolved_by FOREIGN KEY (resolved_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [18] VNPAY TRANSACTIONS
CREATE TABLE vnpay_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_no VARCHAR(100) NOT NULL UNIQUE,
    project_id BIGINT NULL,
    order_number VARCHAR(50),
    user_id BIGINT NULL,
    user_email VARCHAR(160) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    bank_code VARCHAR(50) NOT NULL,
    card_type VARCHAR(50) NOT NULL,
    pay_date DATETIME(6) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
    type VARCHAR(50) NOT NULL DEFAULT 'ESCROW_DEPOSIT',
    description VARCHAR(500),
    created_at DATETIME(6) NOT NULL,
    INDEX idx_vnpay_proj (project_id),
    INDEX idx_vnpay_user (user_id),
    CONSTRAINT fk_vnpay_proj FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    CONSTRAINT fk_vnpay_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [19] TALENT REPORTS
CREATE TABLE talent_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id BIGINT NOT NULL,
    reported_user_id BIGINT NOT NULL,
    project_id BIGINT NULL,
    reason VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'PENDING',
    admin_note TEXT,
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES users(id),
    CONSTRAINT fk_report_target FOREIGN KEY (reported_user_id) REFERENCES users(id),
    CONSTRAINT fk_report_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [20] ADMIN AUDIT LOGS
CREATE TABLE admin_audit_logs (
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

-- [21] VERIFICATION TOKENS
CREATE TABLE verification_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(100) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL UNIQUE,
    expires_at DATETIME(6),
    CONSTRAINT fk_verification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [22] PASSWORD RESET TOKENS
CREATE TABLE password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(100) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expires_at DATETIME(6),
    used BIT(1) DEFAULT b'0',
    CONSTRAINT fk_pwd_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. SEED PLATFORM SETTINGS
-- ----------------------------------------------------------------------------
INSERT INTO platform_settings (setting_key, setting_value, description, updated_at) VALUES 
('platform_fee_percent', '10', 'Phần trăm phí sàn khấu trừ khi nghiệm thu (10%)', NOW(6)),
('auto_accept_hours', '72', 'Số giờ tự động nghiệm thu giải ngân sau khi bàn giao (72h)', NOW(6)),
('min_deposit_amount', '100000', 'Số tiền cọc Escrow tối thiểu (100.000 đ)', NOW(6)),
('dispute_resolution_days', '3', 'Thời hạn cam kết xử lý khiếu nại (3 ngày)', NOW(6));

-- ----------------------------------------------------------------------------
-- 4. SEED ALL 19 TEST USERS (tai_khoan_test.txt)
-- Hash: $2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm (demo123456 / admin123456)
-- ----------------------------------------------------------------------------
INSERT INTO users (
    id, full_name, email, password, role, phone, avatar, professional_title, bio, skills, field, location,
    website, linkedin_url, experience_years, hourly_rate, available, company_name, company_size, contact_name,
    tax_code, rating, completed_projects, talent_credit_balance, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    1, 'Quản Trị Viên TalentMatch', 'admin@talentmatch.vn', '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'ADMIN', '0901888999', 'https://api.dicebear.com/7.x/identicon/svg?seed=admin',
    'Hệ Thống Trọng Tài & Quản Trị TalentMatch', 'Ban Quản Trị Hệ Thống TalentMatch Việt Nam - Chuyên xử lý khiếu nại, đối soát Escrow và duyệt định danh eKYC.', NULL, 'Quản Trị Hệ Thống', 'Tòa nhà TalentMatch, Cầu Giấy, Hà Nội',
    NULL, NULL, 10, 0, b'1',
    NULL, NULL, NULL, NULL,
    5, 100, 999,
    b'1', b'0', b'1', b'1',
    'ACTIVE', 'VERIFIED', 95000000, 0,
    999, 'Top Rated', NOW(6), NOW(6)
);
INSERT INTO users (
    id, full_name, email, password, role, phone, avatar, professional_title, bio, skills, field, location,
    website, linkedin_url, experience_years, hourly_rate, available, company_name, company_size, contact_name,
    tax_code, rating, completed_projects, talent_credit_balance, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    2, 'Lê Thu Hà', 'ha.le@techstartup.vn', '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'CUSTOMER', '0987654321', 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
    NULL, 'TechStartup Việt Nam là đơn vị tiên phong cung cấp giải pháp chuyển đổi số toàn diện cho chuỗi bán lẻ và logistics.', NULL, 'Công nghệ & Phần mềm', 'Quận 1, TP. Hồ Chí Minh',
    'https://techstartup.vn', NULL, 8, 0, b'1',
    'Công ty Cổ phần TechStartup Việt Nam', '20-50', 'Lê Thu Hà', '0101234567',
    4.95, 34, 920,
    b'1', b'0', b'1', b'1',
    'ACTIVE', 'VERIFIED', 50000000, 9500000,
    920, 'Top Rated', NOW(6), NOW(6)
);
INSERT INTO users (
    id, full_name, email, password, role, phone, avatar, professional_title, bio, skills, field, location,
    website, linkedin_url, experience_years, hourly_rate, available, company_name, company_size, contact_name,
    tax_code, rating, completed_projects, talent_credit_balance, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    3, 'Phạm Tuấn Anh', 'tuan.pham@invest.vn', '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'CUSTOMER', '0903332211', 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-tuan-anh',
    NULL, 'Quỹ tư vấn đầu tư và tái cấu trúc thương hiệu doanh nghiệp vừa và nhỏ.', NULL, 'Tài chính & Đầu tư', 'Quận Cầu Giấy, Hà Nội',
    'https://investgrowth.vn', NULL, 12, 0, b'1',
    'Invest Growth Vietnam', '50-100', 'Phạm Tuấn Anh', '0319876543',
    4.88, 18, 890,
    b'1', b'0', b'1', b'1',
    'ACTIVE', 'VERIFIED', 32000000, 0,
    890, 'Gold', NOW(6), NOW(6)
);
INSERT INTO users (
    id, full_name, email, password, role, phone, avatar, professional_title, bio, skills, field, location,
    website, linkedin_url, experience_years, hourly_rate, available, company_name, company_size, contact_name,
    tax_code, rating, completed_projects, talent_credit_balance, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    4, 'Nguyễn Mai Lan', 'lan.nguyen@edusparks.edu.vn', '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'CUSTOMER', '0912445566', 'https://api.dicebear.com/7.x/identicon/svg?seed=nguyen-mai-lan',
    NULL, 'Hệ thống đào tạo tiếng Anh và kỹ năng lập trình trực tuyến cho học sinh, sinh viên.', NULL, 'EdTech & Đào tạo', 'Quận Ba Đình, Hà Nội',
    'https://edusparks.edu.vn', NULL, 7, 0, b'1',
    'Học Viện Công Nghệ Giáo Dục EduSparks', '10-25', 'Nguyễn Mai Lan', '0108765432',
    4.85, 12, 880,
    b'1', b'0', b'1', b'1',
    'ACTIVE', 'VERIFIED', 28000000, 0,
    880, 'Silver', NOW(6), NOW(6)
);
INSERT INTO users (
    id, full_name, email, password, role, phone, avatar, professional_title, bio, skills, field, location,
    website, linkedin_url, experience_years, hourly_rate, available, company_name, company_size, contact_name,
    tax_code, rating, completed_projects, talent_credit_balance, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    5, 'Trần Việt Hoàng', 'hoang.tran@foodies.vn', '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'CUSTOMER', '0978990011', 'https://api.dicebear.com/7.x/identicon/svg?seed=tran-viet-hoang',
    NULL, 'Chuỗi 12 nhà hàng ẩm thực chay thanh tịnh tại TP.HCM và Đà Nẵng, cần tuyển chuyên gia thiết kế và truyền thông.', NULL, 'Ẩm thực & Nhà hàng', 'Quận 3, TP. Hồ Chí Minh',
    'https://foodiesdelight.vn', NULL, 9, 0, b'1',
    'Chuỗi Nhà Hàng Chay Foodies Delight', '50-100', 'Trần Việt Hoàng', '0315556677',
    4.9, 22, 910,
    b'1', b'0', b'1', b'1',
    'ACTIVE', 'VERIFIED', 45000000, 5500000,
    910, 'Top Rated', NOW(6), NOW(6)
);
INSERT INTO users (
    id, full_name, email, password, role, phone, avatar, professional_title, bio, skills, field, location,
    website, linkedin_url, experience_years, hourly_rate, available, company_name, company_size, contact_name,
    tax_code, rating, completed_projects, talent_credit_balance, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    6, 'Đặng Ngọc Mai', 'mai.dang@fashionhouse.vn', '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'CUSTOMER', '0934112233', 'https://api.dicebear.com/7.x/identicon/svg?seed=dang-ngoc-mai',
    NULL, 'Thương hiệu thời trang công sở cao cấp, cần hợp tác Freelancer dựng video TikTok, quản trị ads và viết bài chuẩn SEO.', NULL, 'Thời trang & Bán lẻ', 'Quận Đống Đa, Hà Nội',
    'https://bellamode.vn', NULL, 6, 0, b'1',
    'Thời Trang Nữ Thiết Kế Bella Mode', '20-50', 'Đặng Ngọc Mai', '0109988776',
    4.82, 15, 875,
    b'1', b'0', b'1', b'1',
    'ACTIVE', 'VERIFIED', 19500000, 0,
    875, 'Silver', NOW(6), NOW(6)
);
INSERT INTO users (
    id, full_name, email, password, role, phone, avatar, professional_title, bio, skills, field, location,
    website, linkedin_url, experience_years, hourly_rate, available, company_name, company_size, contact_name,
    tax_code, rating, completed_projects, talent_credit_balance, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    7, 'Hoàng Thị Yến', 'yen.hoang.demo@gmail.com', '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'CUSTOMER', '0945667788', 'https://api.dicebear.com/7.x/identicon/svg?seed=hoang-thi-yen',
    NULL, 'Tài khoản thử nghiệm kiểm duyệt OTP và chặn đăng dự án khi chưa kích hoạt email.', NULL, 'Bán lẻ & Phụ kiện', 'Hải Phòng',
    NULL, NULL, 2, 0, b'1',
    'Yen Fashion Boutique', '1-10', 'Hoàng Thị Yến', '0310001122',
    5, 0, 600,
    b'1', b'0', b'0', b'0',
    'PENDING', 'NOT_SUBMITTED', 0, 0,
    600, 'Bronze', NOW(6), NOW(6)
);
INSERT INTO users (
    id, full_name, email, password, role, phone, avatar, professional_title, bio, skills, field, location,
    website, linkedin_url, experience_years, hourly_rate, available, company_name, company_size, contact_name,
    tax_code, rating, completed_projects, talent_credit_balance, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    8, 'Nguyễn Minh Anh', 'minhanh.dev@gmail.com', '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER', '0912345678', 'https://api.dicebear.com/7.x/identicon/svg?seed=nguyen-minh-anh',
    'Senior Full-Stack & Mobile Developer', '6+ năm kinh nghiệm phát triển Mobile Flutter và Full-Stack Web App. Đã hoàn thành hơn 50 dự án cho các doanh nghiệp trong và ngoài nước.', 'Flutter, React Native, Node.js, Spring Boot, MySQL, MongoDB, AWS, Docker', 'Lập trình & CNTT', 'Quận Cầu Giấy, Hà Nội',
    'https://github.com/minhanh-dev', NULL, 6, 350000, b'1',
    NULL, NULL, NULL, NULL,
    4.95, 52, 960,
    b'1', b'0', b'1', b'1',
    'ACTIVE', 'VERIFIED', 18500000, 0,
    960, 'Top Rated', NOW(6), NOW(6)
);
INSERT INTO users (
    id, full_name, email, password, role, phone, avatar, professional_title, bio, skills, field, location,
    website, linkedin_url, experience_years, hourly_rate, available, company_name, company_size, contact_name,
    tax_code, rating, completed_projects, talent_credit_balance, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    9, 'Trần Hoàng Nam', 'hoangnam.design@gmail.com', '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER', '0908776655', 'https://api.dicebear.com/7.x/identicon/svg?seed=tran-hoang-nam',
    'Lead UI/UX & Brand Identity Designer', 'Chuyên gia thiết kế UI/UX ứng dụng Fintech, E-commerce và hệ thống nhận diện thương hiệu chuyên nghiệp.', 'Figma, Adobe Illustrator, Photoshop, Design System, Branding, Wireframing', 'Thiết kế & Sáng tạo', 'Quận 1, TP. Hồ Chí Minh',
    'https://behance.net/hoangnam-design', NULL, 7, 300000, b'1',
    NULL, NULL, NULL, NULL,
    4.92, 46, 940,
    b'1', b'0', b'1', b'1',
    'ACTIVE', 'VERIFIED', 24000000, 0,
    940, 'Top Rated', NOW(6), NOW(6)
);
INSERT INTO users (
    id, full_name, email, password, role, phone, avatar, professional_title, bio, skills, field, location,
    website, linkedin_url, experience_years, hourly_rate, available, company_name, company_size, contact_name,
    tax_code, rating, completed_projects, talent_credit_balance, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    10, 'Phạm Quốc Huy', 'huy.media@gmail.com', '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER', '0981223344', 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-quoc-huy',
    'Senior Motion Graphic & Video Editor', 'Chuyên dựng video ngắn triệu view TikTok Ads, Reels, Trailer 3D và TVC quảng cáo sản phẩm cho nhãn hàng.', 'Premiere Pro, After Effects, CapCut Pro, DaVinci Resolve, TikTok Ads, Motion Design', 'Video & Truyền thông', 'Quận Thanh Xuân, Hà Nội',
    'https://youtube.com/@huy-media-pro', NULL, 5, 220000, b'1',
    NULL, NULL, NULL, NULL,
    4.8, 38, 870,
    b'1', b'0', b'1', b'1',
    'ACTIVE', 'VERIFIED', 8200000, 0,
    870, 'Silver', NOW(6), NOW(6)
);
INSERT INTO users (
    id, full_name, email, password, role, phone, avatar, professional_title, bio, skills, field, location,
    website, linkedin_url, experience_years, hourly_rate, available, company_name, company_size, contact_name,
    tax_code, rating, completed_projects, talent_credit_balance, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    11, 'Vũ Linh Đan', 'linhdan.marketing@gmail.com', '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER', '0972334455', 'https://api.dicebear.com/7.x/identicon/svg?seed=vu-linh-dan',
    'Growth Marketing & SEO Expert', 'Đã tối ưu chiến dịch quảng cáo và đẩy hơn 120 từ khóa khó lên Top 1 Google cho các dự án thương mại điện tử.', 'Google Ads, Meta Ads, Technical SEO, Google Analytics 4, Content Strategy, CRO', 'Marketing & Bán hàng', 'Quận Bình Thạnh, TP. Hồ Chí Minh',
    'https://linhdan-growth.vn', NULL, 5, 250000, b'1',
    NULL, NULL, NULL, NULL,
    4.88, 41, 890,
    b'1', b'0', b'1', b'1',
    'ACTIVE', 'VERIFIED', 14600000, 0,
    890, 'Gold', NOW(6), NOW(6)
);
INSERT INTO users (
    id, full_name, email, password, role, phone, avatar, professional_title, bio, skills, field, location,
    website, linkedin_url, experience_years, hourly_rate, available, company_name, company_size, contact_name,
    tax_code, rating, completed_projects, talent_credit_balance, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    12, 'Đỗ Bảo Long', 'baolong.ai@gmail.com', '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER', '0966778899', 'https://api.dicebear.com/7.x/identicon/svg?seed=do-bao-long',
    'Senior AI & LLM Integration Engineer', 'Chuyên gia tích hợp mô hình ngôn ngữ lớn LLM, xây dựng hệ thống chatbot hỗ trợ khách hàng tự động và phân tích dữ liệu.', 'Python, PyTorch, LangChain, OpenAI API, Vector DB, RAG Chatbot, FastAPI, HuggingFace', 'Trí tuệ nhân tạo & AI', 'Quận Cầu Giấy, Hà Nội',
    'https://huggingface.co/baolong-ai', NULL, 6, 450000, b'1',
    NULL, NULL, NULL, NULL,
    4.96, 35, 955,
    b'1', b'0', b'1', b'1',
    'ACTIVE', 'VERIFIED', 31000000, 0,
    955, 'Top Rated', NOW(6), NOW(6)
);
INSERT INTO users (
    id, full_name, email, password, role, phone, avatar, professional_title, bio, skills, field, location,
    website, linkedin_url, experience_years, hourly_rate, available, company_name, company_size, contact_name,
    tax_code, rating, completed_projects, talent_credit_balance, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    13, 'Ngô Phương Thanh', 'thanh.writer@gmail.com', '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER', '0919223344', 'https://api.dicebear.com/7.x/identicon/svg?seed=ngo-phuong-thanh',
    'Senior Copywriter & Content Strategist', 'Cây bút chuyên nghiệp cho các tạp chí kinh doanh và nhãn hàng F&B, thời trang. Văn phong cuốn hút, chuẩn SEO.', 'SEO Copywriting, Storytelling, PR Articles, Landing Page Copy, Social Media', 'Viết lách & Nội dung', 'Quận Hải Châu, Đà Nẵng',
    'https://phuongthanh-writer.com', NULL, 4, 180000, b'1',
    NULL, NULL, NULL, NULL,
    4.86, 64, 885,
    b'1', b'0', b'1', b'1',
    'ACTIVE', 'VERIFIED', 11800000, 0,
    885, 'Gold', NOW(6), NOW(6)
);
INSERT INTO users (
    id, full_name, email, password, role, phone, avatar, professional_title, bio, skills, field, location,
    website, linkedin_url, experience_years, hourly_rate, available, company_name, company_size, contact_name,
    tax_code, rating, completed_projects, talent_credit_balance, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    14, 'Bùi Hoàng Đức', 'duc.architect@gmail.com', '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER', '0905112233', 'https://api.dicebear.com/7.x/identicon/svg?seed=bui-hoang-duc',
    'Kiến Trúc Sư 3D Nội Thất & Revit BIM', '8 năm kinh nghiệm thiết kế kiến trúc biệt thự, căn hộ cao cấp và không gian quán cafe, nhà hàng phong cách hiện đại.', '3ds Max, Corona Renderer, SketchUp, Revit BIM, AutoCAD, Lumion', 'Kỹ thuật & Kiến trúc', 'Quận 7, TP. Hồ Chí Minh',
    'https://duc-architect.vn', NULL, 8, 320000, b'1',
    NULL, NULL, NULL, NULL,
    4.91, 29, 935,
    b'1', b'0', b'1', b'1',
    'ACTIVE', 'VERIFIED', 22400000, 0,
    935, 'Top Rated', NOW(6), NOW(6)
);
INSERT INTO users (
    id, full_name, email, password, role, phone, avatar, professional_title, bio, skills, field, location,
    website, linkedin_url, experience_years, hourly_rate, available, company_name, company_size, contact_name,
    tax_code, rating, completed_projects, talent_credit_balance, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    15, 'Trịnh Hoài Thu', 'thu.translator@gmail.com', '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER', '0938445566', 'https://api.dicebear.com/7.x/identicon/svg?seed=trinh-hoai-thu',
    'Biên - Phiên Dịch Hợp Đồng Song Ngữ Anh - Nhật', 'Tốt nghiệp ĐH Ngoại Thương, chứng chỉ JLPT N1 và IELTS 8.5. Hơn 7 năm biên dịch tài liệu thương mại và hồ sơ thầu.', 'IELTS 8.5, JLPT N1, Pháp lý & Hợp đồng, Bản địa hóa phần mềm, Dịch công chứng', 'Dịch thuật & Ngoại ngữ', 'Quận Hoàn Kiếm, Hà Nội',
    'https://hoaithu-translate.vn', NULL, 7, 280000, b'1',
    NULL, NULL, NULL, NULL,
    4.89, 58, 915,
    b'1', b'0', b'1', b'1',
    'ACTIVE', 'VERIFIED', 16200000, 0,
    915, 'Gold', NOW(6), NOW(6)
);
INSERT INTO users (
    id, full_name, email, password, role, phone, avatar, professional_title, bio, skills, field, location,
    website, linkedin_url, experience_years, hourly_rate, available, company_name, company_size, contact_name,
    tax_code, rating, completed_projects, talent_credit_balance, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    16, 'Lê Minh Quang', 'quang.fin@gmail.com', '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER', '0918778899', 'https://api.dicebear.com/7.x/identicon/svg?seed=le-minh-quang',
    'Kế Toán Trưởng & Tư Vấn Thuế Doanh Nghiệp (CPA)', 'Chứng chỉ hành nghề Kế toán viên công chứng CPA, hỗ trợ quyết toán thuế thành công cho hơn 80 doanh nghiệp SME.', 'Báo Cáo Tài Chính, Quyết Toán Thuế, Soát Xét Sổ Sách, MISA, Fast, Excel VBA', 'Tài chính & Kế toán', 'Quận Tân Bình, TP. Hồ Chí Minh',
    'https://quang-taxconsulting.vn', NULL, 11, 350000, b'1',
    NULL, NULL, NULL, NULL,
    4.94, 72, 945,
    b'1', b'0', b'1', b'1',
    'ACTIVE', 'VERIFIED', 27500000, 0,
    945, 'Top Rated', NOW(6), NOW(6)
);
INSERT INTO users (
    id, full_name, email, password, role, phone, avatar, professional_title, bio, skills, field, location,
    website, linkedin_url, experience_years, hourly_rate, available, company_name, company_size, contact_name,
    tax_code, rating, completed_projects, talent_credit_balance, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    17, 'Đoàn Bảo Ngọc', 'ngoc.game3d@gmail.com', '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER', '0977889900', 'https://api.dicebear.com/7.x/identicon/svg?seed=doan-bao-ngoc',
    '3D Character Artist & Unreal Engine Specialist', 'Chuyên tạo hình nhân vật game 3D AAA, mô hình hóa vũ khí và bối cảnh chân thực cho các studio game quốc tế.', 'Blender, ZBrush, Substance Painter, Unreal Engine 5, Maya, Rigging', 'Thiết kế & Sáng tạo', 'Quận Tây Hồ, Hà Nội',
    'https://artstation.com/baongoc3d', NULL, 5, 270000, b'1',
    NULL, NULL, NULL, NULL,
    4.87, 31, 895,
    b'1', b'0', b'1', b'1',
    'ACTIVE', 'VERIFIED', 13500000, 0,
    895, 'Gold', NOW(6), NOW(6)
);
INSERT INTO users (
    id, full_name, email, password, role, phone, avatar, professional_title, bio, skills, field, location,
    website, linkedin_url, experience_years, hourly_rate, available, company_name, company_size, contact_name,
    tax_code, rating, completed_projects, talent_credit_balance, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    18, 'Phạm Đức Minh', 'ducminh.demo@gmail.com', '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER', '0988001122', 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-duc-minh',
    'Junior Web Developer (Chờ Kích Hoạt OTP)', 'Tài khoản thử nghiệm chức năng kiểm soát OTP và popup chặn nộp báo giá dự án khi chưa kích hoạt email.', 'HTML, CSS, JavaScript, React', 'Lập trình & CNTT', 'Nam Định',
    NULL, NULL, 1, 150000, b'1',
    NULL, NULL, NULL, NULL,
    5, 0, 550,
    b'1', b'0', b'0', b'0',
    'PENDING', 'NOT_SUBMITTED', 0, 0,
    550, 'Bronze', NOW(6), NOW(6)
);
INSERT INTO users (
    id, full_name, email, password, role, phone, avatar, professional_title, bio, skills, field, location,
    website, linkedin_url, experience_years, hourly_rate, available, company_name, company_size, contact_name,
    tax_code, rating, completed_projects, talent_credit_balance, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    19, 'Nguyễn Văn Vi Phạm', 'banned.user@gmail.com', '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER', '0911000999', 'https://api.dicebear.com/7.x/identicon/svg?seed=banned-user',
    'Tài Khoản Đang Bị Tạm Khóa Vi Phạm Chính Sách', 'Tài khoản này đã bị khóa do cố tình giao dịch ngoài sàn và vi phạm điều khoản bảo mật của TalentMatch.', 'Spam, Vi Phạm Điều Khoản', 'Khác', 'Việt Nam',
    NULL, NULL, 0, 0, b'1',
    NULL, NULL, NULL, NULL,
    1, 0, 200,
    b'0', b'1', b'0', b'1',
    'SUSPENDED', 'REJECTED', 0, 0,
    200, 'Bronze', NOW(6), NOW(6)
);

-- ----------------------------------------------------------------------------
-- 5. SEED USER BANK ACCOUNTS (Tài khoản ngân hàng liên kết)
-- ----------------------------------------------------------------------------
INSERT INTO user_bank_accounts (id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
VALUES (1, 1, 'Vietcombank (Ngoại Thương Việt Nam)', 'VCB', '998877665544', 'CONG TY TALENTMATCH VIETNAM', b'1', NOW(6));
INSERT INTO user_bank_accounts (id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
VALUES (2, 2, 'Vietcombank (Ngoại Thương Việt Nam)', 'VCB', '1028394857', 'LE THU HA', b'1', NOW(6));
INSERT INTO user_bank_accounts (id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
VALUES (3, 2, 'Techcombank (Kỹ Thương Việt Nam)', 'TCB', '19038475869012', 'LE THU HA', b'0', NOW(6));
INSERT INTO user_bank_accounts (id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
VALUES (4, 3, 'MBBank (Quân Đội)', 'MBB', '088899988899', 'PHAM TUAN ANH', b'1', NOW(6));
INSERT INTO user_bank_accounts (id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
VALUES (5, 4, 'ACB (Á Châu)', 'ACB', '284759601', 'NGUYEN MAI LAN', b'1', NOW(6));
INSERT INTO user_bank_accounts (id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
VALUES (6, 5, 'VietinBank (Công Thương Việt Nam)', 'CTG', '103847586920', 'TRAN VIET HOANG', b'1', NOW(6));
INSERT INTO user_bank_accounts (id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
VALUES (7, 6, 'VPBank (Việt Nam Thịnh Vượng)', 'VPB', '88392019485', 'DANG NGOC MAI', b'1', NOW(6));
INSERT INTO user_bank_accounts (id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
VALUES (8, 8, 'Vietcombank (Ngoại Thương Việt Nam)', 'VCB', '0011004567890', 'NGUYEN MINH ANH', b'1', NOW(6));
INSERT INTO user_bank_accounts (id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
VALUES (9, 8, 'MBBank (Quân Đội)', 'MBB', '0912345678', 'NGUYEN MINH ANH', b'0', NOW(6));
INSERT INTO user_bank_accounts (id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
VALUES (10, 9, 'VietinBank (Công Thương Việt Nam)', 'CTG', '108829384756', 'TRAN HOANG NAM', b'1', NOW(6));
INSERT INTO user_bank_accounts (id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
VALUES (11, 10, 'Techcombank (Kỹ Thương Việt Nam)', 'TCB', '19034567891011', 'PHAM QUOC HUY', b'1', NOW(6));
INSERT INTO user_bank_accounts (id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
VALUES (12, 11, 'VPBank (Việt Nam Thịnh Vượng)', 'VPB', '9988112233', 'VU LINH DAN', b'1', NOW(6));
INSERT INTO user_bank_accounts (id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
VALUES (13, 12, 'MBBank (Quân Đội)', 'MBB', '0966778899', 'DO BAO LONG', b'1', NOW(6));
INSERT INTO user_bank_accounts (id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
VALUES (14, 13, 'ACB (Á Châu)', 'ACB', '5566778899', 'NGO PHUONG THANH', b'1', NOW(6));
INSERT INTO user_bank_accounts (id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
VALUES (15, 14, 'BIDV (Đầu tư & Phát triển)', 'BIDV', '1241000889977', 'BUI HOANG DUC', b'1', NOW(6));
INSERT INTO user_bank_accounts (id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
VALUES (16, 15, 'Vietcombank (Ngoại Thương Việt Nam)', 'VCB', '0451000998877', 'TRINH HOAI THU', b'1', NOW(6));
INSERT INTO user_bank_accounts (id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
VALUES (17, 16, 'Techcombank (Kỹ Thương Việt Nam)', 'TCB', '19028833994455', 'LE MINH QUANG', b'1', NOW(6));
INSERT INTO user_bank_accounts (id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
VALUES (18, 17, 'TPBank (Tiên Phong)', 'TPB', '03889944551', 'DOAN BAO NGOC', b'1', NOW(6));

-- ----------------------------------------------------------------------------
-- 6. SEED FREELANCER PORTFOLIOS (Hồ sơ năng lực thực tế)
-- ----------------------------------------------------------------------------
INSERT INTO freelancer_portfolios (id, user_id, title, category, image_url, description, project_url, created_at)
VALUES (1, 8, 'Ứng dụng Quản lý Chuỗi Bán Lẻ Bách Hóa Flutter', 'Lập trình Mobile', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800', 'App Flutter quét mã vạch và đồng bộ đơn hàng tức thì cho chuỗi 20 siêu thị mini.', 'https://github.com/minhanh-dev/flutter-retail', NOW(6));
INSERT INTO freelancer_portfolios (id, user_id, title, category, image_url, description, project_url, created_at)
VALUES (2, 8, 'Nền tảng Sàn TMĐT B2B Nông Sản Sạch Node.js + React', 'Full-Stack Web', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800', 'Hệ thống thương mại điện tử đa nhà cung cấp, thanh toán VNPay và quản lý xuất nhập kho.', 'https://github.com/minhanh-dev/b2b-agritech', NOW(6));
INSERT INTO freelancer_portfolios (id, user_id, title, category, image_url, description, project_url, created_at)
VALUES (3, 9, 'Hệ thống Nhận diện Thương hiệu Chuỗi Cafe Minimalist', 'Brand Identity', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800', 'Thiết kế trọn gói từ logo, menu, bao bì ly mang đi đến bảng hiệu mặt tiền.', 'https://behance.net/hoangnam-design/minimal-cafe', NOW(6));
INSERT INTO freelancer_portfolios (id, user_id, title, category, image_url, description, project_url, created_at)
VALUES (4, 9, 'Thiết kế UI/UX Ứng dụng Quản lý Tài chính & Ví Điện Tử', 'Mobile UI/UX', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800', 'Bộ UI Kit Figma 180+ màn hình với hệ thống Design System hoàn chỉnh, hỗ trợ Dark Mode.', 'https://behance.net/hoangnam-design/fintech-app', NOW(6));
INSERT INTO freelancer_portfolios (id, user_id, title, category, image_url, description, project_url, created_at)
VALUES (5, 10, 'Chuỗi 20 Video Ngắn Triệu View TikTok Ads Ngành Mỹ Phẩm', 'Video Ads', 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=800', 'Kịch bản viral, quay dựng chuyên nghiệp tạo chuyển đổi đơn hàng tăng 250% trong tháng.', 'https://youtube.com/@huy-media-pro', NOW(6));
INSERT INTO freelancer_portfolios (id, user_id, title, category, image_url, description, project_url, created_at)
VALUES (6, 11, 'Chiến Dịch SEO Đẩy 50 Từ Khóa Bất Động Sản Lên Top 1', 'SEO Tổng Thể', 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?auto=format&fit=crop&q=80&w=800', 'Tối ưu Technical SEO Onpage, cấu trúc Silo và xây dựng liên kết tự nhiên đạt 150.000 traffic/tháng.', 'https://linhdan-growth.vn', NOW(6));
INSERT INTO freelancer_portfolios (id, user_id, title, category, image_url, description, project_url, created_at)
VALUES (7, 12, 'Trợ Lý AI RAG Tự Động Phân Tích Tài Liệu Pháp Lý', 'AI & Machine Learning', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800', 'Tích hợp mô hình Llama-3 và Vector DB Qdrant trích xuất thông tin hợp đồng chính xác 98%.', 'https://huggingface.co/baolong-ai/legal-rag', NOW(6));
INSERT INTO freelancer_portfolios (id, user_id, title, category, image_url, description, project_url, created_at)
VALUES (8, 13, 'Bộ Bài Viết Chuyên Sâu 100 Kỳ Thương Hiệu & Khởi Nghiệp', 'Content Marketing', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800', 'Chuỗi bài phân tích chiến lược tăng trưởng cho các startup Việt Nam trên diễn đàn kinh doanh.', 'https://phuongthanh-writer.com', NOW(6));
INSERT INTO freelancer_portfolios (id, user_id, title, category, image_url, description, project_url, created_at)
VALUES (9, 14, 'Thiết Kế Phối Cảnh 3D Biệt Thự Nhà Vườn Phong Cách Indochine', 'Kiến Trúc & Nội Thất', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800', 'Hồ sơ bản vẽ Revit BIM và render Corona ánh sáng tự nhiên tuyệt đẹp cho khu biệt thự 500m2.', 'https://duc-architect.vn/indochine-villa', NOW(6));
INSERT INTO freelancer_portfolios (id, user_id, title, category, image_url, description, project_url, created_at)
VALUES (10, 15, 'Biên Dịch Trọn Gói 300 Trang Hợp Đồng Chuyển Giao Công Nghệ Nhật', 'Biên Dịch Pháp Lý', 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800', 'Biên dịch chuẩn xác ngữ nghĩa pháp lý song ngữ Nhật - Việt cho dự án liên doanh vốn ODA.', 'https://hoaithu-translate.vn', NOW(6));
INSERT INTO freelancer_portfolios (id, user_id, title, category, image_url, description, project_url, created_at)
VALUES (11, 16, 'Quyết Toán Thuế & Tái Cấu Trúc Báo Cáo Tài Chính Chuỗi Bán Lẻ', 'Tài Chính & Kế Toán', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800', 'Tư vấn tối ưu chi phí thuế hợp pháp tiết kiệm 1.2 tỷ đồng cho doanh nghiệp trong kỳ quyết toán.', 'https://quang-taxconsulting.vn', NOW(6));
INSERT INTO freelancer_portfolios (id, user_id, title, category, image_url, description, project_url, created_at)
VALUES (12, 17, 'Tạo Hình Nhân Vật Chiến Binh 3D Cyberpunk Unreal Engine 5', '3D Character Game', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800', 'Model low-poly tối ưu chuyển động, texture 4K Substance Painter sẵn sàng cho gameplay AAA.', 'https://artstation.com/baongoc3d', NOW(6));

-- ----------------------------------------------------------------------------
-- 7. SEED JOBS (Tuyển dụng việc làm & dự án đầy đủ các lĩnh vực)
-- ----------------------------------------------------------------------------
INSERT INTO jobs (
    id, title, category, description, required_skills, budget, price_type, budget_type,
    deadline, estimated_duration_days, featured, verified, work_type, experience_level,
    escrow_funded, acceptance_criteria, status, proposals_count, customer_id, created_at, updated_at
) VALUES (
    1, 'Tuyển Freelancer Lập trình Ứng dụng Di động Quản lý Kho Hàng cho SME', 'Lập trình & CNTT', 'Doanh nghiệp chúng tôi cần tìm 1 Senior Mobile Developer làm việc theo Hợp đồng Dự án để phát triển App Android/iOS quản lý xuất nhập kho hàng. App cần quét mã QR Code, chụp ảnh chứng từ và đồng bộ dữ liệu với Server Node.js sẵn có. Toàn bộ tiền cọc dự án được thanh toán vào Escrow qua cổng VNPAY.', 'Flutter, REST API, QR Code Scan, Node.js, PostgreSQL', 15000000,
    'MILESTONE', 'MILESTONE',
    '2026-10-30', 21,
    b'1', b'1', 'REMOTE', 'MIDDLE',
    b'1', 'Sản phẩm bàn giao đúng hạn, đạt tiêu chuẩn kỹ thuật cam kết trong SOW và vượt qua kiểm thử chức năng.',
    'OPEN', 6, 2, '2026-09-25 08:00:00', NOW(6)
);
INSERT INTO jobs (
    id, title, category, description, required_skills, budget, price_type, budget_type,
    deadline, estimated_duration_days, featured, verified, work_type, experience_level,
    escrow_funded, acceptance_criteria, status, proposals_count, customer_id, created_at, updated_at
) VALUES (
    2, 'Lập trình Landing Page Giới Thiệu Khóa Học Đầu Tư Chuẩn Tốc Độ Cao', 'Lập trình & CNTT', 'Cần lập trình viên cắt giao diện từ Figma sang ReactJS + Tailwind CSS cho Landing Page giới thiệu khóa học tài chính cá nhân. Yêu cầu chuẩn SEO, tốc độ Google PageSpeed > 90 điểm và tương thích hoàn hảo mọi thiết bị di động.', 'ReactJS, Tailwind CSS, Responsive UI, SEO Google', 4500000,
    'FIXED', 'FIXED',
    '2026-10-15', 21,
    b'1', b'1', 'REMOTE', 'MIDDLE',
    b'1', 'Sản phẩm bàn giao đúng hạn, đạt tiêu chuẩn kỹ thuật cam kết trong SOW và vượt qua kiểm thử chức năng.',
    'OPEN', 4, 3, '2026-09-27 08:00:00', NOW(6)
);
INSERT INTO jobs (
    id, title, category, description, required_skills, budget, price_type, budget_type,
    deadline, estimated_duration_days, featured, verified, work_type, experience_level,
    escrow_funded, acceptance_criteria, status, proposals_count, customer_id, created_at, updated_at
) VALUES (
    3, 'Phát triển Hệ Thống Quản Lý Đơn Hàng & Dashboard CRM Realtime', 'Lập trình & CNTT', 'Cần tìm đối tác / freelancer senior full-stack xây dựng Dashboard CRM nội bộ quản lý 10,000 khách hàng, tích hợp biểu đồ doanh thu realtime, phân quyền nhân viên đa cấp và xuất file Excel/PDF tự động.', 'ReactJS, Node.js, PostgreSQL, TypeScript, REST API, Docker', 28000000,
    'MILESTONE', 'MILESTONE',
    '2026-11-30', 21,
    b'1', b'1', 'REMOTE', 'MIDDLE',
    b'1', 'Sản phẩm bàn giao đúng hạn, đạt tiêu chuẩn kỹ thuật cam kết trong SOW và vượt qua kiểm thử chức năng.',
    'OPEN', 7, 2, '2026-09-22 08:00:00', NOW(6)
);
INSERT INTO jobs (
    id, title, category, description, required_skills, budget, price_type, budget_type,
    deadline, estimated_duration_days, featured, verified, work_type, experience_level,
    escrow_funded, acceptance_criteria, status, proposals_count, customer_id, created_at, updated_at
) VALUES (
    4, 'Tích hợp Trợ lý AI Chatbot RAG Hỗ trợ Tư vấn Tuyển sinh 24/7', 'Lập trình & CNTT', 'Học viện EduSparks tìm kiếm kỹ sư AI triển khai Chatbot thông minh dựa trên kiến trúc RAG (Retrieval-Augmented Generation), kết nối kho dữ liệu học liệu và tư vấn học viên tự động trên Website & Fanpage.', 'Python, FastAPI, AI/LLM, LangChain, PostgreSQL, Docker', 18000000,
    'MILESTONE', 'MILESTONE',
    '2026-11-10', 21,
    b'1', b'1', 'REMOTE', 'MIDDLE',
    b'1', 'Sản phẩm bàn giao đúng hạn, đạt tiêu chuẩn kỹ thuật cam kết trong SOW và vượt qua kiểm thử chức năng.',
    'OPEN', 5, 4, '2026-09-28 08:00:00', NOW(6)
);
INSERT INTO jobs (
    id, title, category, description, required_skills, budget, price_type, budget_type,
    deadline, estimated_duration_days, featured, verified, work_type, experience_level,
    escrow_funded, acceptance_criteria, status, proposals_count, customer_id, created_at, updated_at
) VALUES (
    5, 'Thiết kế Bộ Nhận Diện Thương Hiệu & Logo Cho Chuỗi Nhà Hàng Chay', 'Thiết kế & Sáng tạo', 'Cần thuê Designer chuyên nghiệp thiết kế Logo, Guideline phối màu, Mẫu Menu nhà hàng và Bảng hiệu mặt tiền cho chuỗi thực phẩm chay mới tại TP.HCM. Yêu cầu bàn giao đầy đủ file gốc Illustrator/Figma vector.', 'Branding, Logo Design, Adobe Illustrator, Figma', 6000000,
    'FIXED', 'FIXED',
    '2026-10-25', 21,
    b'1', b'1', 'REMOTE', 'MIDDLE',
    b'1', 'Sản phẩm bàn giao đúng hạn, đạt tiêu chuẩn kỹ thuật cam kết trong SOW và vượt qua kiểm thử chức năng.',
    'OPEN', 5, 5, '2026-09-26 08:00:00', NOW(6)
);
INSERT INTO jobs (
    id, title, category, description, required_skills, budget, price_type, budget_type,
    deadline, estimated_duration_days, featured, verified, work_type, experience_level,
    escrow_funded, acceptance_criteria, status, proposals_count, customer_id, created_at, updated_at
) VALUES (
    6, 'Thiết kế UI/UX Trọn Gói Ứng Dụng Đặt Lịch Spa & Làm Đẹp', 'Thiết kế & Sáng tạo', 'Cần thiết kế Design System và hơn 35 màn hình Figma chuẩn iOS/Android cho ứng dụng đặt lịch hẹn chăm sóc da, spa và mua sắm mỹ phẩm cao cấp. Ưu tiên phong cách thanh lịch, tối giản.', 'UI/UX Design, Figma, Mobile UI, Design System, Prototype', 14000000,
    'MILESTONE', 'MILESTONE',
    '2026-11-05', 21,
    b'1', b'1', 'REMOTE', 'MIDDLE',
    b'1', 'Sản phẩm bàn giao đúng hạn, đạt tiêu chuẩn kỹ thuật cam kết trong SOW và vượt qua kiểm thử chức năng.',
    'OPEN', 4, 6, '2026-09-29 08:00:00', NOW(6)
);
INSERT INTO jobs (
    id, title, category, description, required_skills, budget, price_type, budget_type,
    deadline, estimated_duration_days, featured, verified, work_type, experience_level,
    escrow_funded, acceptance_criteria, status, proposals_count, customer_id, created_at, updated_at
) VALUES (
    7, 'Thiết kế Bao Bì & Nhãn Hộp Trà Thảo Mộc Cao Cấp Xuất Khẩu', 'Thiết kế & Sáng tạo', 'Tìm kiếm Designer thiết kế bao bì hộp thiếc, nhãn dán túi zip cho dòng sản phẩm trà thảo mộc xuất khẩu đi Nhật Bản và EU. Cần file thiết kế chuẩn chế bản in offset 4 màu và mockup 3D.', 'Bao bì, Packaging, Adobe Illustrator, Photoshop, 3D Mockup', 8000000,
    'FIXED', 'FIXED',
    '2026-10-20', 21,
    b'1', b'1', 'REMOTE', 'MIDDLE',
    b'1', 'Sản phẩm bàn giao đúng hạn, đạt tiêu chuẩn kỹ thuật cam kết trong SOW và vượt qua kiểm thử chức năng.',
    'OPEN', 3, 5, '2026-09-28 08:00:00', NOW(6)
);
INSERT INTO jobs (
    id, title, category, description, required_skills, budget, price_type, budget_type,
    deadline, estimated_duration_days, featured, verified, work_type, experience_level,
    escrow_funded, acceptance_criteria, status, proposals_count, customer_id, created_at, updated_at
) VALUES (
    8, 'Sản xuất Chuỗi 15 Video Ngắn TikTok Ads & Reels Bán Hàng Mỹ Phẩm', 'Video & Animation', 'Tìm kiếm Video Editor có kinh nghiệm làm việc với TikTok Ads, thành thạo Premiere & After Effects. Chúng tôi đã có sẵn kịch bản và source quay thô, cần cắt dựng kèm hiệu ứng bắt trend, âm thanh bản quyền và text subtitle chuyển động.', 'TikTok Ads, Premiere Pro, After Effects, Motion Graphics, Color Grading', 8500000,
    'MILESTONE', 'MILESTONE',
    '2026-10-22', 21,
    b'1', b'1', 'REMOTE', 'MIDDLE',
    b'1', 'Sản phẩm bàn giao đúng hạn, đạt tiêu chuẩn kỹ thuật cam kết trong SOW và vượt qua kiểm thử chức năng.',
    'OPEN', 5, 6, '2026-09-26 08:00:00', NOW(6)
);
INSERT INTO jobs (
    id, title, category, description, required_skills, budget, price_type, budget_type,
    deadline, estimated_duration_days, featured, verified, work_type, experience_level,
    escrow_funded, acceptance_criteria, status, proposals_count, customer_id, created_at, updated_at
) VALUES (
    9, 'Dựng Video Hoạt Hình 3D Trailer Giới Thiệu Game Mobile 60 Giây', 'Video & Animation', 'Cần 3D Animator thực hiện đoạn cinematic trailer 60 giây cho tựa game phiêu lưu mới. Nhân vật và bối cảnh đã có sẵn model 3D, cần diễn hoạt chuyển động mượt mà, hiệu ứng ánh sáng và hiệu ứng âm thanh hoành tráng.', 'Blender, Maya, 3D Animation, Sound Effects, Unreal Engine 5', 16000000,
    'MILESTONE', 'MILESTONE',
    '2026-11-15', 21,
    b'1', b'1', 'REMOTE', 'MIDDLE',
    b'1', 'Sản phẩm bàn giao đúng hạn, đạt tiêu chuẩn kỹ thuật cam kết trong SOW và vượt qua kiểm thử chức năng.',
    'OPEN', 3, 2, '2026-09-30 08:00:00', NOW(6)
);
INSERT INTO jobs (
    id, title, category, description, required_skills, budget, price_type, budget_type,
    deadline, estimated_duration_days, featured, verified, work_type, experience_level,
    escrow_funded, acceptance_criteria, status, proposals_count, customer_id, created_at, updated_at
) VALUES (
    10, 'Triển khai Chiến Dịch SEO Tổng Thể Portal Bất Động Sản Lên Top Google', 'Marketing & Bán hàng', 'Cần chuyên gia SEO tổng thể Onpage & Offpage tối ưu cho portal bất động sản nghỉ dưỡng cao cấp. Đảm bảo cam kết Top từ khóa chính xác và báo cáo traffic hàng tuần qua Google Search Console.', 'SEO Google, Content Marketing, Google Analytics, Backlinks, Technical SEO', 12000000,
    'MILESTONE', 'MILESTONE',
    '2026-11-20', 21,
    b'1', b'1', 'REMOTE', 'MIDDLE',
    b'1', 'Sản phẩm bàn giao đúng hạn, đạt tiêu chuẩn kỹ thuật cam kết trong SOW và vượt qua kiểm thử chức năng.',
    'OPEN', 4, 3, '2026-09-24 08:00:00', NOW(6)
);
INSERT INTO jobs (
    id, title, category, description, required_skills, budget, price_type, budget_type,
    deadline, estimated_duration_days, featured, verified, work_type, experience_level,
    escrow_funded, acceptance_criteria, status, proposals_count, customer_id, created_at, updated_at
) VALUES (
    11, 'Quản trị & Tối ưu Chiến Dịch Quảng Cáo Meta Ads Chuỗi Thời Trang', 'Marketing & Bán hàng', 'Tìm kiếm Media Buyer / Performance Marketer quản trị ngân sách chạy Facebook/Instagram Ads 50 triệu/tháng cho BST Thu Đông, cam kết ROAS tối thiểu 4.0 và chi phí trên mỗi đơn hàng CPA hợp lý.', 'Facebook Ads, Meta Pixel, A/B Testing, Copywriting, Conversion Rate', 10000000,
    'MILESTONE', 'MILESTONE',
    '2026-10-31', 21,
    b'1', b'1', 'REMOTE', 'MIDDLE',
    b'1', 'Sản phẩm bàn giao đúng hạn, đạt tiêu chuẩn kỹ thuật cam kết trong SOW và vượt qua kiểm thử chức năng.',
    'OPEN', 6, 6, '2026-09-27 08:00:00', NOW(6)
);
INSERT INTO jobs (
    id, title, category, description, required_skills, budget, price_type, budget_type,
    deadline, estimated_duration_days, featured, verified, work_type, experience_level,
    escrow_funded, acceptance_criteria, status, proposals_count, customer_id, created_at, updated_at
) VALUES (
    12, 'Xây dựng Bộ 30 Bài Viết Chuyên Sâu Chuẩn SEO Ngành Dược Mỹ Phẩm', 'Viết lách & Nội dung', 'Cần tìm Content Writer có kiến thức chuyên sâu về da liễu, mỹ phẩm để viết bộ 30 bài chuẩn SEO (1,200 - 1,500 từ/bài). Yêu cầu nội dung chính xác y khoa, hành văn lôi cuốn và không sao chép.', 'SEO Writing, Content Marketing, Copywriting, Skincare, Yoast SEO', 6500000,
    'FIXED', 'FIXED',
    '2026-10-28', 21,
    b'1', b'1', 'REMOTE', 'MIDDLE',
    b'1', 'Sản phẩm bàn giao đúng hạn, đạt tiêu chuẩn kỹ thuật cam kết trong SOW và vượt qua kiểm thử chức năng.',
    'OPEN', 4, 6, '2026-09-29 08:00:00', NOW(6)
);
INSERT INTO jobs (
    id, title, category, description, required_skills, budget, price_type, budget_type,
    deadline, estimated_duration_days, featured, verified, work_type, experience_level,
    escrow_funded, acceptance_criteria, status, proposals_count, customer_id, created_at, updated_at
) VALUES (
    13, 'Thiết kế Phối Cảnh 3D & Bản Vẽ Thi Công Nội Thất Quán Cafe Acoustic', 'Kỹ thuật & Kiến trúc', 'Cần kiến trúc sư thiết kế nội thất trọn gói cho mặt bằng quán cafe 200m2 phong cách Industrial kết hợp mộc ấm cúng. Gồm concept moodboard, phối cảnh 3D các góc và hồ sơ kỹ thuật thi công bóc tách vật liệu.', 'AutoCAD, SketchUp, 3Ds Max, Nội thất, Bóc tách dự toán', 18000000,
    'MILESTONE', 'MILESTONE',
    '2026-11-12', 21,
    b'1', b'1', 'REMOTE', 'MIDDLE',
    b'1', 'Sản phẩm bàn giao đúng hạn, đạt tiêu chuẩn kỹ thuật cam kết trong SOW và vượt qua kiểm thử chức năng.',
    'OPEN', 3, 5, '2026-09-25 08:00:00', NOW(6)
);
INSERT INTO jobs (
    id, title, category, description, required_skills, budget, price_type, budget_type,
    deadline, estimated_duration_days, featured, verified, work_type, experience_level,
    escrow_funded, acceptance_criteria, status, proposals_count, customer_id, created_at, updated_at
) VALUES (
    14, 'Soát Xét Sổ Sách & Quyết Toán Thuế Doanh Nghiệp Cuối Năm', 'Tài chính & Kế toán', 'Doanh nghiệp cần thuê chuyên gia Kế toán Thuế rà soát hóa đơn chứng từ năm tài chính 2025-2026, đối chiếu tờ khai GTGT, tính toán thuế TNDN và hoàn thiện báo cáo tài chính nội bộ lẫn cơ quan thuế.', 'Kế toán thuế, Báo cáo tài chính, MISA, Quyết toán thuế, Hóa đơn điện tử', 12000000,
    'FIXED', 'FIXED',
    '2026-11-25', 21,
    b'1', b'1', 'REMOTE', 'MIDDLE',
    b'1', 'Sản phẩm bàn giao đúng hạn, đạt tiêu chuẩn kỹ thuật cam kết trong SOW và vượt qua kiểm thử chức năng.',
    'OPEN', 4, 2, '2026-09-28 08:00:00', NOW(6)
);
INSERT INTO jobs (
    id, title, category, description, required_skills, budget, price_type, budget_type,
    deadline, estimated_duration_days, featured, verified, work_type, experience_level,
    escrow_funded, acceptance_criteria, status, proposals_count, customer_id, created_at, updated_at
) VALUES (
    15, 'Dịch thuật & Bản Địa Hóa Phần Mềm Quản Trị Nhân Sự Nhật - Việt', 'Dịch thuật & Đào tạo', 'Dự án hợp tác với doanh nghiệp Nhật Bản cần bản dịch chuẩn xác toàn bộ giao diện phần mềm HRM (khoảng 80,000 từ) và tài liệu hướng dẫn sử dụng từ tiếng Nhật sang tiếng Việt chuẩn ngữ cảnh văn phòng.', 'Dịch thuật Nhật - Việt, JLPT N1, HRM, IT Localization, Trados', 15000000,
    'MILESTONE', 'MILESTONE',
    '2026-11-18', 21,
    b'1', b'1', 'REMOTE', 'MIDDLE',
    b'1', 'Sản phẩm bàn giao đúng hạn, đạt tiêu chuẩn kỹ thuật cam kết trong SOW và vượt qua kiểm thử chức năng.',
    'OPEN', 3, 2, '2026-09-30 08:00:00', NOW(6)
);
INSERT INTO jobs (
    id, title, category, description, required_skills, budget, price_type, budget_type,
    deadline, estimated_duration_days, featured, verified, work_type, experience_level,
    escrow_funded, acceptance_criteria, status, proposals_count, customer_id, created_at, updated_at
) VALUES (
    16, 'Tư Vấn & Soạn Thảo Bộ Hợp Đồng Chuyển Nhượng Cổ Phần Khởi Nghiệp', 'Luật & Pháp lý', 'Quỹ đầu tư cần luật sư chuyên về M&A và doanh nghiệp khởi nghiệp để rà soát thỏa thuận đầu tư (Term Sheet), hợp đồng mua bán cổ phần (SPA) và thỏa thuận cổ đông (SHA) bảo vệ quyền lợi hai bên.', 'Luật Doanh nghiệp, Hợp đồng đầu tư, SPA / SHA, Tư vấn pháp lý, M&A', 9000000,
    'FIXED', 'FIXED',
    '2026-10-25', 21,
    b'1', b'1', 'REMOTE', 'MIDDLE',
    b'1', 'Sản phẩm bàn giao đúng hạn, đạt tiêu chuẩn kỹ thuật cam kết trong SOW và vượt qua kiểm thử chức năng.',
    'OPEN', 2, 3, '2026-09-27 08:00:00', NOW(6)
);

-- ----------------------------------------------------------------------------
-- 8. SEED JOB APPLICATIONS (PROPOSALS)
-- ----------------------------------------------------------------------------
INSERT INTO job_applications (
    id, job_id, freelancer_id, proposal, proposed_price, estimated_days, portfolio_link, status, created_at, updated_at
) VALUES (
    1, 1, 8, 'Chào chị Hà, tôi đã đọc kỹ yêu cầu hệ thống quản lý kho hàng cho SME. Với thế mạnh Flutter + REST API, tôi cam kết bàn giao ứng dụng đúng hạn, code sạch, có tài liệu hướng dẫn và hỗ trợ bảo hành 3 tháng sau bàn giao.', 14000000, 25,
    'https://github.com/minhanh-dev/portfolio-vietnam', 'ACCEPTED', '2026-09-26 08:00:00', NOW(6)
);
INSERT INTO job_applications (
    id, job_id, freelancer_id, proposal, proposed_price, estimated_days, portfolio_link, status, created_at, updated_at
) VALUES (
    2, 5, 9, 'Chào anh Hoàng, chuỗi ẩm thực chay là đề tài rất giàu cảm hứng. Tôi xin gửi kèm portfolio chuỗi Cafe The Garden mà tôi vừa thực hiện. Tôi sẽ lên 3 phương án logo ban đầu trong vòng 4 ngày để anh duyệt concept trước khi phát triển toàn diện.', 5500000, 14,
    'https://behance.net/hoangnam_uxui_vietnam', 'ACCEPTED', '2026-09-27 08:00:00', NOW(6)
);
INSERT INTO job_applications (
    id, job_id, freelancer_id, proposal, proposed_price, estimated_days, portfolio_link, status, created_at, updated_at
) VALUES (
    3, 8, 10, 'Chào chị Mai, tôi chuyên dựng video quảng cáo ngắn TikTok Ads cho mỹ phẩm. Tôi nắm rất rõ nhịp điệu hook 3 giây đầu, text animation chuyển động và thư viện âm thanh thịnh hành giúp tối ưu tỷ lệ nhấp CTR quảng cáo.', 8000000, 18,
    'https://youtube.com/@huy_media_portfolio', 'SUBMITTED', '2026-09-28 08:00:00', NOW(6)
);
INSERT INTO job_applications (
    id, job_id, freelancer_id, proposal, proposed_price, estimated_days, portfolio_link, status, created_at, updated_at
) VALUES (
    4, 10, 11, 'Chào anh Tuấn Anh, với kinh nghiệm đẩy Top 1 cho hơn 200 từ khóa cạnh tranh cao ngành Bất động sản, tôi cam kết quy trình SEO Whitehat bền vững, audit technical toàn diện và báo cáo minh bạch hàng tuần.', 11500000, 45,
    'https://github.com', 'SUBMITTED', '2026-09-26 08:00:00', NOW(6)
);
INSERT INTO job_applications (
    id, job_id, freelancer_id, proposal, proposed_price, estimated_days, portfolio_link, status, created_at, updated_at
) VALUES (
    5, 4, 12, 'Chào chị Lan, giải pháp Chatbot RAG cho giáo dục là chuyên môn sâu của tôi. Tôi sẽ xây dựng hệ thống embedding với pgvector trên PostgreSQL, kết hợp FastAPI và mô hình tiếng Việt chuẩn xác để hạn chế tối đa hiện tượng ảo giác (hallucination).', 17500000, 28,
    'https://github.com', 'SUBMITTED', '2026-09-29 08:00:00', NOW(6)
);
INSERT INTO job_applications (
    id, job_id, freelancer_id, proposal, proposed_price, estimated_days, portfolio_link, status, created_at, updated_at
) VALUES (
    6, 12, 13, 'Chào chị Mai, tôi từng viết hơn 150 bài chuyên sâu cho các nhãn hàng dược mỹ phẩm chuẩn y khoa. Bộ 30 bài sẽ được nghiên cứu từ khóa cẩn thận, hành văn dễ hiểu, giữ chân độc giả và thúc đẩy mua hàng.', 6000000, 20,
    'https://github.com', 'SUBMITTED', '2026-09-30 08:00:00', NOW(6)
);
INSERT INTO job_applications (
    id, job_id, freelancer_id, proposal, proposed_price, estimated_days, portfolio_link, status, created_at, updated_at
) VALUES (
    7, 13, 14, 'Chào anh Hoàng, tôi rất ấn tượng với ý tưởng quán cafe Acoustic. Tôi cam kết bàn giao moodboard chi tiết, 10 góc view 3D chất lượng cao và trọn bộ hồ sơ kỹ thuật thi công chuẩn xác để nhà thầu thi công ngay.', 17000000, 22,
    'https://github.com', 'SUBMITTED', '2026-09-27 08:00:00', NOW(6)
);
INSERT INTO job_applications (
    id, job_id, freelancer_id, proposal, proposed_price, estimated_days, portfolio_link, status, created_at, updated_at
) VALUES (
    8, 14, 16, 'Chào chị Hà, tôi có chứng chỉ hành nghề dịch vụ thuế CPA và 8 năm hỗ trợ các công ty công nghệ SME. Tôi sẽ rà soát rủi ro thuế, hoàn thiện báo cáo tài chính và trực tiếp hỗ trợ giải trình khi có thanh tra thuế.', 11000000, 15,
    'https://github.com', 'ACCEPTED', '2026-09-29 08:00:00', NOW(6)
);
INSERT INTO job_applications (
    id, job_id, freelancer_id, proposal, proposed_price, estimated_days, portfolio_link, status, created_at, updated_at
) VALUES (
    9, 3, 9, 'Chào chị Hà, tôi đã hoàn thiện bộ banner quảng cáo đúng kích thước và phong cách chuyên nghiệp.', 3000000, 7,
    'https://behance.net/hoangnam-design', 'ACCEPTED', '2026-09-15 08:00:00', NOW(6)
);

-- ----------------------------------------------------------------------------
-- 9. SEED PROJECTS (ORDERS / CONTRACTS KÝ QUỸ ESCROW)
-- ----------------------------------------------------------------------------
INSERT INTO projects (
    id, application_id, customer_id, freelancer_id, order_number, service_title, total_price,
    platform_fee, freelancer_payout_amount, deadline, revision_count, max_revisions_allowed,
    auto_accept_days_remaining, agreement_terms, agreement_version, sow_requirements, notes,
    payment_method, vnpay_transaction_id, status, cancellation_reason, credit_awarded,
    created_at, updated_at, completed_at, customer_signed_at, freelancer_signed_at
) VALUES (
    1, 2, 5, 9, 'TM-2026-8891', 'Thiết kế Bộ Nhận Diện Thương Hiệu & Logo Cho Chuỗi Nhà Hàng Chay',
    5500000.00, 550000.00, 4950000.00, '2026-10-12', 1, 3, 3,
    'Hợp đồng thiết kế thương hiệu chuẩn Escrow TalentMatch. Toàn bộ tiền cọc 5.500.000 đ đã được phong tỏa an toàn qua VNPAY.',
    1, 'Bàn giao file vector gốc .AI, .EPS, .SVG, .PDF; Guideline hệ màu CMYK và RGB; Mẫu thiết kế Menu A4; Bảng hiệu mặt tiền',
    'Khách hàng đang yêu cầu bổ sung chỉnh sửa phương án màu phong thủy.',
    'VNPAY_QR', 'VNPAY-2026-8891-QR', 'IN_PROGRESS', NULL, b'0',
    '2026-09-28 09:00:00', NOW(6), NULL, '2026-09-28 09:15:00', '2026-09-28 09:30:00'
);
INSERT INTO projects (
    id, application_id, customer_id, freelancer_id, order_number, service_title, total_price,
    platform_fee, freelancer_payout_amount, deadline, revision_count, max_revisions_allowed,
    auto_accept_days_remaining, agreement_terms, agreement_version, sow_requirements, notes,
    payment_method, vnpay_transaction_id, status, cancellation_reason, credit_awarded,
    created_at, updated_at, completed_at, customer_signed_at, freelancer_signed_at
) VALUES (
    2, 1, 2, 8, 'TM-2026-7732', 'Tuyển Freelancer Lập trình Ứng dụng Di động Quản lý Kho Hàng cho SME',
    14000000.00, 1400000.00, 12600000.00, '2026-10-25', 0, 3, 3,
    'Hợp đồng phát triển ứng dụng di động Flutter. Tiền cọc 14.000.000 đ đã được thanh toán phong tỏa Escrow qua cổng VNPAY.',
    1, 'Ứng dụng Flutter chạy tốt trên Android/iOS; Quét mã QR code xuất nhập kho; REST API đồng bộ dữ liệu thời gian thực; Hỗ trợ bảo hành 3 tháng',
    'Freelancer đang triển khai giai đoạn 2 hoàn thiện module quét mã QR offline.',
    'VNPAY_ATM', 'VNPAY-2026-7732-ATM', 'IN_PROGRESS', NULL, b'0',
    '2026-09-26 14:00:00', NOW(6), NULL, '2026-09-26 14:30:00', '2026-09-26 15:00:00'
);
INSERT INTO projects (
    id, application_id, customer_id, freelancer_id, order_number, service_title, total_price,
    platform_fee, freelancer_payout_amount, deadline, revision_count, max_revisions_allowed,
    auto_accept_days_remaining, agreement_terms, agreement_version, sow_requirements, notes,
    payment_method, vnpay_transaction_id, status, cancellation_reason, credit_awarded,
    created_at, updated_at, completed_at, customer_signed_at, freelancer_signed_at
) VALUES (
    3, 9, 2, 9, 'TM-2026-6621', 'Thiết kế Banner Quảng Cáo Meta & Google Display',
    3000000.00, 300000.00, 2700000.00, '2026-09-22', 0, 3, 0,
    'Hợp đồng thiết kế banner quảng cáo đã hoàn thành nghiệm thu xuất sắc và giải ngân tiền công cho Freelancer.',
    1, 'Bộ 10 banner kích thước chuẩn GDN và Facebook Feed; File gốc PSD, PNG độ phân giải cao; Đúng nhận diện thương hiệu TechStartup',
    'Khách hàng Lê Thu Hà rất hài lòng và đã đánh giá 5 sao cho Freelancer.',
    'VNPAY_QR', 'VNPAY-2026-6621-QR', 'COMPLETED', NULL, b'1',
    '2026-09-15 10:00:00', '2026-09-22 16:00:00', '2026-09-22 16:00:00', '2026-09-15 10:30:00', '2026-09-15 11:00:00'
);

-- ----------------------------------------------------------------------------
-- 10. SEED MILESTONES (Các giai đoạn thanh toán dự án)
-- ----------------------------------------------------------------------------
INSERT INTO milestones (id, project_id, title, description, amount, deadline, status, created_at, completed_at)
VALUES (1, 1, 'Giai đoạn 1: Lên Concept & 3 Mẫu Logo Phác Thảo', 'Nộp 3 phương án thiết kế phác thảo logo và thuyết minh phong thủy.', 2500000.00, '2026-10-02', 'PAID', NOW(6), NOW(6));
INSERT INTO milestones (id, project_id, title, description, amount, deadline, status, created_at, completed_at)
VALUES (2, 1, 'Giai đoạn 2: Hoàn Thiện Brand Guideline & Menu Nhà Hàng', 'Hoàn thiện file vector, guideline màu sắc, thiết kế menu và biển hiệu.', 3000000.00, '2026-10-12', 'IN_PROGRESS', NOW(6), NULL);
INSERT INTO milestones (id, project_id, title, description, amount, deadline, status, created_at, completed_at)
VALUES (3, 2, 'Giai đoạn 1: Thiết Kế UI/UX & Module Đăng Nhập/Quản Lý Kho', 'Xây dựng layout ứng dụng Flutter, đăng nhập OTP và giao diện danh mục hàng hóa.', 6000000.00, '2026-10-10', 'PAID', NOW(6), NOW(6));
INSERT INTO milestones (id, project_id, title, description, amount, deadline, status, created_at, completed_at)
VALUES (4, 2, 'Giai đoạn 2: Tích hợp Quét Mã QR Code & Đồng Bộ REST API', 'Chức năng quét mã vạch xuất nhập kho, chụp ảnh hóa đơn và kết nối server.', 8000000.00, '2026-10-25', 'IN_PROGRESS', NOW(6), NULL);
INSERT INTO milestones (id, project_id, title, description, amount, deadline, status, created_at, completed_at)
VALUES (5, 3, 'Nghiệm thu toàn bộ Bộ Banner Quảng Cáo GDN & Facebook Ads', 'Bàn giao trọn gói 10 banner chuẩn kích thước và source file PSD.', 3000000.00, '2026-09-22', 'PAID', NOW(6), NOW(6));

-- ----------------------------------------------------------------------------
-- 11. SEED PROJECT DELIVERIES (Bài nộp bàn giao sản phẩm)
-- ----------------------------------------------------------------------------
INSERT INTO project_deliveries (id, project_id, milestone_id, file_name, file_url, file_size, demo_url, note, submitted_at, created_at)
VALUES (1, 1, 1, 'Foodies_Chay_Logo_Concepts_V1.pdf', 'https://behance.net/sample-foodies-chay', '14.2 MB', 'https://behance.net/sample-foodies-chay', 'Đã gửi 3 concept logo kèm phân tích phong thủy và ý nghĩa màu sắc.', '2026-10-02 15:30:00', '2026-10-02 15:30:00');
INSERT INTO project_deliveries (id, project_id, milestone_id, file_name, file_url, file_size, demo_url, note, submitted_at, created_at)
VALUES (2, 2, 3, 'TalentMatch_KhoHang_Demo_v1.0.apk', 'https://github.com/minhanh-dev/flutter-warehouse/releases/tag/v1.0.0', '28.5 MB', 'https://github.com/minhanh-dev/flutter-warehouse', 'Bản build APK thử nghiệm chạy mượt mà trên Android 11+. Có tài liệu hướng dẫn cài đặt đi kèm.', '2026-10-09 17:00:00', '2026-10-09 17:00:00');
INSERT INTO project_deliveries (id, project_id, milestone_id, file_name, file_url, file_size, demo_url, note, submitted_at, created_at)
VALUES (3, 3, 5, 'TechStartup_Full_Banner_Kit_Final.zip', 'https://drive.google.com/drive/folders/sample-banner-kit', '48.0 MB', 'https://drive.google.com/drive/folders/sample-banner-kit', 'Toàn bộ 10 kích thước banner GDN và Meta Ads định dạng PSD gốc và PNG độ sắc nét cao.', '2026-09-21 16:30:00', '2026-09-21 16:30:00');

-- ----------------------------------------------------------------------------
-- 12. SEED PAYMENTS (Thanh toán & Giải ngân tiền cọc Escrow)
-- ----------------------------------------------------------------------------
INSERT INTO payments (id, project_id, milestone_id, payer_id, amount, method, status, transaction_code, created_at, paid_at, disbursed_at)
VALUES (1, 1, 1, 5, 2500000.00, 'VNPAY_QR', 'PAID', 'PAY-2026-8891-MS1', '2026-09-28 09:10:00', '2026-09-28 09:15:00', '2026-10-03 10:00:00');
INSERT INTO payments (id, project_id, milestone_id, payer_id, amount, method, status, transaction_code, created_at, paid_at, disbursed_at)
VALUES (2, 2, 3, 2, 6000000.00, 'VNPAY_ATM', 'PAID', 'PAY-2026-7732-MS1', '2026-09-26 14:15:00', '2026-09-26 14:20:00', '2026-10-10 11:00:00');
INSERT INTO payments (id, project_id, milestone_id, payer_id, amount, method, status, transaction_code, created_at, paid_at, disbursed_at)
VALUES (3, 3, 5, 2, 3000000.00, 'VNPAY_QR', 'DISBURSED', 'PAY-2026-6621-FULL', '2026-09-15 10:15:00', '2026-09-15 10:20:00', '2026-09-22 16:00:00');

-- ----------------------------------------------------------------------------
-- 13. SEED TALENT REVIEWS (Đánh giá đa tiêu chí từ khách hàng)
-- ----------------------------------------------------------------------------
INSERT INTO talent_reviews (id, project_id, author_id, target_id, rating, quality_rating, deadline_rating, communication_rating, comment, freelancer_reply, order_title, created_at)
VALUES (1, 3, 2, 9, 5, 5, 5, 5, 'Bạn Nam thiết kế bộ banner xuất sắc, nắm bắt nhanh tinh thần thương hiệu và giao việc trước hạn 2 ngày. Rất ấn tượng!', 'Em cảm ơn chị Hà và TechStartup rất nhiều ạ! Rất hy vọng tiếp tục được hợp tác với chị trong các dự án tiếp theo.', 'Thiết kế Banner Quảng Cáo Meta & Google Display', '2026-09-22 16:30:00');
INSERT INTO talent_reviews (id, project_id, author_id, target_id, rating, quality_rating, deadline_rating, communication_rating, comment, freelancer_reply, order_title, created_at)
VALUES (2, 2, 2, 8, 5, 5, 4.8, 5, 'Minh Anh code rất sạch, kiến trúc Flutter chuẩn mực và chủ động đề xuất giải pháp quét QR offline rất tối ưu cho kho bãi.', 'Dạ em cảm ơn chị Hà đã luôn hỗ trợ cung cấp thông tin test chi tiết giúp tiến độ dự án luôn đúng kế hoạch ạ.', 'Lập trình Ứng dụng Di động Quản lý Kho Hàng cho SME', '2026-10-10 11:30:00');

-- ----------------------------------------------------------------------------
-- 14. SEED DISPUTES (Tranh chấp / Trọng tài giải quyết)
-- ----------------------------------------------------------------------------
INSERT INTO disputes (
    id, project_id, order_number, opened_by, reason, evidence_notes, status,
    refund_employer_amount, payout_freelancer_amount, admin_resolution_note, resolved_by, created_at, resolved_at
) VALUES (
    1, 1, 'TM-2026-8891', 5, 'Chưa hài lòng với mẫu logo concept 3',
    'Khách hàng phản ánh tone màu xanh lá chưa phù hợp với phong thủy nhà hàng chay, cần điều chỉnh lại logo concept 3 trước khi nghiệm thu giai đoạn 2.',
    'UNDER_REVIEW', 0.00, 0.00, 'Admin TalentMatch đã tiếp nhận và đang hỗ trợ hai bên thống nhất phương án điều chỉnh trong 24h.', 1,
    '2026-10-04 10:15:00', NULL
);

-- ----------------------------------------------------------------------------
-- 15. SEED VNPAY TRANSACTIONS (Lịch sử giao dịch VNPAY Sandbox)
-- ----------------------------------------------------------------------------
INSERT INTO vnpay_transactions (id, transaction_no, project_id, order_number, user_id, user_email, amount, bank_code, card_type, pay_date, status, type, description, created_at)
VALUES (1, 'VNPAY-2026-8891-QR', 1, 'TM-2026-8891', 5, 'hoang.tran@foodies.vn', 5500000.00, 'VNPAYQR', 'QR_CODE', '2026-09-28 09:12:00', 'SUCCESS', 'ESCROW_DEPOSIT', 'Nạp cọc Escrow dự án Branding chuỗi nhà hàng qua VNPAY-QR', '2026-09-28 09:12:00');
INSERT INTO vnpay_transactions (id, transaction_no, project_id, order_number, user_id, user_email, amount, bank_code, card_type, pay_date, status, type, description, created_at)
VALUES (2, 'VNPAY-2026-7732-ATM', 2, 'TM-2026-7732', 2, 'ha.le@techstartup.vn', 14000000.00, 'NCB', 'ATM_CARD', '2026-09-26 14:18:00', 'SUCCESS', 'ESCROW_DEPOSIT', 'Nạp cọc Escrow dự án App Mobile Quản lý Kho Hàng qua thẻ ATM NCB', '2026-09-26 14:18:00');
INSERT INTO vnpay_transactions (id, transaction_no, project_id, order_number, user_id, user_email, amount, bank_code, card_type, pay_date, status, type, description, created_at)
VALUES (3, 'VNPAY-2026-6621-QR', 3, 'TM-2026-6621', 2, 'ha.le@techstartup.vn', 3000000.00, 'VNPAYQR', 'QR_CODE', '2026-09-15 10:18:00', 'SUCCESS', 'ESCROW_DEPOSIT', 'Nạp cọc Escrow thiết kế Banner quảng cáo', '2026-09-15 10:18:00');
INSERT INTO vnpay_transactions (id, transaction_no, project_id, order_number, user_id, user_email, amount, bank_code, card_type, pay_date, status, type, description, created_at)
VALUES (4, 'VNPAY-PAYOUT-9912', 3, 'TM-2026-6621', 9, 'hoangnam.design@gmail.com', 2700000.00, 'CTG', 'BANK_TRANSFER', '2026-09-22 16:05:00', 'SUCCESS', 'PAYOUT', 'Giải ngân tiền công (90%) cho Freelancer Trần Hoàng Nam', '2026-09-22 16:05:00');

-- ----------------------------------------------------------------------------
-- 16. SEED WITHDRAWAL REQUESTS (Lệnh rút tiền về tài khoản ngân hàng)
-- ----------------------------------------------------------------------------
INSERT INTO withdrawal_requests (
    id, user_id, bank_name, bank_code, account_number, account_holder,
    amount, fee, net_amount, status, admin_note, transaction_code, created_at, processed_at
) VALUES 
(1, 8, 'Vietcombank (Ngoại Thương Việt Nam)', 'VCB', '0011004567890', 'NGUYEN MINH ANH', 5000000.00, 0.00, 5000000.00, 'APPROVED', 'Đã chuyển khoản thành công qua ngân hàng VCB', 'WTH-2026-001', DATE_SUB(NOW(6), INTERVAL 3 DAY), NOW(6)),
(2, 9, 'VietinBank (Công Thương Việt Nam)', 'CTG', '108829384756', 'TRAN HOANG NAM', 10000000.00, 0.00, 10000000.00, 'APPROVED', 'Đã chuyển khoản thành công qua cổng thanh toán liên ngân hàng', 'WTH-2026-002', DATE_SUB(NOW(6), INTERVAL 1 DAY), NOW(6));

-- ----------------------------------------------------------------------------
-- 17. SEED NOTIFICATIONS (Thông báo hệ thống, hợp đồng, thanh toán)
-- ----------------------------------------------------------------------------
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (1, 2, 'Báo giá mới cho dự án Quản lý Kho Hàng', 'Freelancer Nguyễn Minh Anh vừa gửi báo giá 14.000.000 đ kèm Portfolio mẫu App Quản lý Kho Hàng.', '/employer/dashboard', b'0', 'PROPOSAL', '2026-10-13 11:20:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (2, 2, 'Tạm giữ tiền Escrow VNPAY thành công', 'Đã phong tỏa 14.000.000 đ qua Cổng VNPAY vào Ví Tạm Giữ Escrow cho Hợp đồng TM-2026-7732.', '/employer/dashboard', b'0', 'ESCROW', '2026-10-13 10:15:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (3, 2, 'Freelancer đã nộp bản thử nghiệm APK', 'Nguyễn Minh Anh đã upload file KhoHang_App_Build_v1.0.apk (38.5 MB) để chờ bạn nghiệm thu Cột mốc 1.', '/employer/dashboard', b'1', 'CONTRACT', '2026-10-12 16:30:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (4, 2, 'Rút tiền Napas 24/7 thành công', 'Lệnh chuyển 5.000.000 đ về tài khoản Vietcombank 1028394857 đã hoàn tất tất toán.', '/employer/dashboard', b'1', 'WITHDRAWAL', '2026-10-11 09:00:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (5, 3, 'Có 4 ứng viên nộp đề xuất cho dự án Landing Page Đầu Tư', 'Nhiều lập trình viên ReactJS giỏi vừa gửi báo giá, ngân sách trung bình 4.200.000 đ.', '/employer/dashboard', b'0', 'PROPOSAL', '2026-10-13 09:30:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (6, 3, 'Lời mời dự án đã được Freelancer chấp nhận', 'Trần Hoàng Nam đã đồng ý trao đổi chi tiết về dự án Thiết kế Landing Page & UI Mobile.', '/employer/dashboard', b'1', 'INVITATION', '2026-10-12 14:00:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (7, 4, 'Đề xuất mới từ Kỹ sư AI Đỗ Bảo Long', 'Đỗ Bảo Long đề xuất xây dựng kiến trúc Chatbot RAG với FastAPI và pgvector cho học viện EduSparks.', '/employer/dashboard', b'0', 'PROPOSAL', '2026-10-13 08:45:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (8, 5, 'Bàn giao thiết kế Cột mốc 1: Phác thảo Logo', 'Trần Hoàng Nam đã gửi 3 concept logo Foodies Chay dạng vector PDF để bạn đánh giá.', '/employer/dashboard', b'0', 'CONTRACT', '2026-10-13 08:15:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (9, 5, 'Cập nhật từ Trung tâm Trọng tài Tranh chấp', 'Admin TalentMatch đã phản hồi yêu cầu khiếu nại tiến độ của bạn. Hai bên đã thống nhất gia hạn thêm 2 ngày.', '/employer/dashboard', b'1', 'SYSTEM', '2026-10-12 11:00:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (10, 6, '5 Freelancer ứng tuyển dự án Sản xuất Video TikTok Ads', 'Phạm Quốc Huy và 4 ứng viên khác đã gửi portfolio video triệu view để bạn lựa chọn.', '/employer/dashboard', b'0', 'PROPOSAL', '2026-10-13 10:30:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (11, 8, 'Lời mời nhận dự án mới từ Lê Thu Hà (TechStartup VN)', 'Doanh nghiệp đã gửi lời mời bạn tham gia dự án "Xây dựng Website Thương mại điện tử B2B Nông sản" với ngân sách 15.000.000 đ.', '/freelancer/dashboard', b'0', 'INVITATION', '2026-10-13 11:30:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (12, 8, 'Nhà tuyển dụng đã duyệt báo giá dự án App Quản lý Kho!', 'Lê Thu Hà (TechStartup Việt Nam) đã chấp nhận báo giá 14.000.000 đ và nạp cọc 100% vào Escrow.', '/freelancer/dashboard', b'0', 'CONTRACT', '2026-10-13 11:10:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (13, 8, 'Giải ngân Cột mốc 1 thành công: +6.000.000 đ', 'Số tiền 5.400.000 đ (sau khấu trừ 10% phí sàn) đã được cộng trực tiếp vào Số dư Ví khả dụng của bạn.', '/freelancer/dashboard', b'0', 'ESCROW', '2026-10-13 08:30:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (14, 8, 'Đánh giá 4.9★ mới & +20 Điểm TalentCredit', 'Phạm Tuấn Anh vừa để lại nhận xét xuất sắc về website Nông sản Sạch. Điểm tín nhiệm của bạn hiện đạt 940/1000.', '/freelancer/dashboard', b'1', 'REVIEW', '2026-10-12 18:00:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (15, 8, 'Dự án mới phù hợp với kỹ năng Flutter & ReactJS', 'Có 3 dự án mới đăng tuyển thuộc ngành IT & Lập trình Web/App đang tìm kiếm chuyên gia như bạn.', '/projects', b'1', 'SYSTEM', '2026-10-12 14:00:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (16, 9, 'Lời mời nhận dự án mới từ Phạm Tuấn Anh (Invest Growth)', 'Doanh nghiệp đã gửi lời mời bạn tham gia dự án "Thiết kế Bộ nhận diện thương hiệu & UI/UX Mobile App" với ngân sách 8.500.000 đ.', '/freelancer/dashboard', b'0', 'INVITATION', '2026-10-13 09:00:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (17, 9, 'Doanh nghiệp đã duyệt Cột mốc 1 dự án Foodies Chay', 'Trần Việt Hoàng đã bấm nghiệm thu Cột mốc 1. Thù lao 2.250.000 đ đã giải ngân vào ví của bạn.', '/freelancer/dashboard', b'0', 'ESCROW', '2026-10-13 10:45:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (18, 9, 'Đánh giá 5.0★ & Lời khen xuất sắc từ Lê Thu Hà', '"Hoàng Nam làm việc cực kỳ chuyên nghiệp và tận tâm!" - Điểm TalentCredit của bạn tăng lên 965/1000.', '/freelancer/dashboard', b'1', 'REVIEW', '2026-10-11 15:20:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (19, 10, 'Dự án mới: Chuỗi 15 Video Ngắn TikTok Ads Mỹ Phẩm', 'Khách hàng Bella Mode Vietnam đang tìm Video Editor chuyên Premiere & After Effects. Hãy gửi báo giá ngay!', '/projects', b'0', 'SYSTEM', '2026-10-13 10:00:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (20, 11, 'Cơ hội nhận dự án SEO Bất Động Sản Nghỉ Dưỡng', 'Dự án "SEO Portal Bất Động Sản" ngân sách 12.000.000 đ đang rất cần chuyên gia như bạn.', '/projects', b'0', 'SYSTEM', '2026-10-13 08:30:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (21, 12, 'Lời mời dự án Trợ lý AI Chatbot RAG từ EduSparks Academy', 'Nguyễn Mai Lan đã xem portfolio RAG Chatbot của bạn trên Github và gửi lời mời báo giá dự án 18.000.000 đ.', '/freelancer/dashboard', b'0', 'INVITATION', '2026-10-13 09:15:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (22, 1, 'Yêu cầu Trọng tài Tranh chấp mới: Hợp đồng TM-2026-8891', 'Employer Trần Việt Hoàng mở khiếu nại về tiến độ bàn giao menu nhà hàng.', '/admin/dashboard', b'0', 'SYSTEM', '2026-10-13 09:15:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (23, 1, 'Giao dịch Escrow lớn nạp thành công qua VNPay', 'Hệ thống vừa ghi nhận nạp cọc 14.000.000 đ qua Cổng VNPAY từ khách hàng TechStartup Việt Nam.', '/admin/dashboard', b'0', 'ESCROW', '2026-10-13 09:30:00');
INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (24, 1, 'Hồ sơ xác thực eKYC mới chờ phê duyệt', 'Ứng viên Bùi Hoàng Đức và Lê Minh Quang vừa nộp căn cước công dân và ảnh chụp selfie.', '/admin/dashboard', b'1', 'SYSTEM', '2026-10-12 17:00:00');

-- ----------------------------------------------------------------------------
-- 18. SEED JOB INVITATIONS (Lời mời dự án trực tiếp)
-- ----------------------------------------------------------------------------
INSERT INTO job_invitations (id, job_id, customer_id, freelancer_id, status, message, created_at)
VALUES (1, 1, 2, 8, 'PENDING', 'Chào Minh Anh, mình ấn tượng với dự án E-Commerce Nông sản Sạch trong Portfolio của bạn. Team mình muốn mời bạn trực tiếp phụ trách dự án B2B này!', '2026-10-13 11:30:00');
INSERT INTO job_invitations (id, job_id, customer_id, freelancer_id, status, message, created_at)
VALUES (2, 2, 3, 9, 'PENDING', 'Chào bạn, bên mình đang cần chuẩn hóa bộ nhận diện thương hiệu và hoàn thiện UI Mobile App, rất mong có cơ hội hợp tác cùng bạn.', '2026-10-13 09:00:00');
INSERT INTO job_invitations (id, job_id, customer_id, freelancer_id, status, message, created_at)
VALUES (3, 4, 4, 12, 'PENDING', 'Chào Bảo Long, học viện EduSparks theo dõi các sản phẩm RAG Chatbot của bạn trên Github và đánh giá rất cao. Mời bạn tham gia nhận dự án!', '2026-10-13 09:15:00');

-- ----------------------------------------------------------------------------
-- 19. SEED SAVED JOBS (Việc làm đã lưu)
-- ----------------------------------------------------------------------------
INSERT INTO saved_jobs (id, freelancer_id, job_id, created_at) VALUES 
(1, 8, 1, NOW(6)),
(2, 8, 3, NOW(6)),
(3, 9, 2, NOW(6)),
(4, 9, 5, NOW(6));

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- VERIFICATION SUMMARY
-- ============================================================================
SELECT 
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM jobs) AS total_jobs,
    (SELECT COUNT(*) FROM job_applications) AS total_applications,
    (SELECT COUNT(*) FROM projects) AS total_projects,
    (SELECT COUNT(*) FROM milestones) AS total_milestones,
    (SELECT COUNT(*) FROM project_deliveries) AS total_deliveries,
    (SELECT COUNT(*) FROM talent_reviews) AS total_reviews,
    (SELECT COUNT(*) FROM disputes) AS total_disputes,
    (SELECT COUNT(*) FROM user_bank_accounts) AS total_bank_accounts,
    (SELECT COUNT(*) FROM freelancer_portfolios) AS total_portfolios,
    (SELECT COUNT(*) FROM vnpay_transactions) AS total_vnpay,
    (SELECT COUNT(*) FROM notifications) AS total_notifications;
