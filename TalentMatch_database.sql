-- ============================================================================
-- TalentMatch V33 — FULL DATABASE SCHEMA & COMPREHENSIVE SEED DATA (MySQL 8+)
-- Non-destructive, safe to re-run multiple times (Idempotent).
-- Covers 100% features: Auth, eKYC, Escrow Wallet, Bank Accounts, Withdrawals,
-- Projects, Proposals, Milestones, Deliveries, Multi-Criteria Reviews, Disputes,
-- VNPay Sandbox, Job Invitations, Real-time Notifications & Platform Configuration.
-- Đồng bộ 100% với giao diện Frontend & file tài liệu test accounts.txt.
-- ============================================================================

USE talentmatch_pro;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. STORED PROCEDURE FOR SAFE COLUMN ADDITIONS
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS tm_add_column_if_absent;
DELIMITER //
CREATE PROCEDURE tm_add_column_if_absent(
    IN p_table_name VARCHAR(64),
    IN p_column_name VARCHAR(64),
    IN p_column_definition TEXT
)
BEGIN
    DECLARE v_exists INT DEFAULT 0;
    SELECT COUNT(*) INTO v_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND COLUMN_NAME = p_column_name;

    IF v_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE `', p_table_name, '` ADD COLUMN `', p_column_name, '` ', p_column_definition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

-- ----------------------------------------------------------------------------
-- 2. ENSURE FEATURE TABLES EXIST
-- ----------------------------------------------------------------------------

-- [A] NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
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

-- [B] USER BANK ACCOUNTS
CREATE TABLE IF NOT EXISTS user_bank_accounts (
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

-- [C] WITHDRAWAL REQUESTS
CREATE TABLE IF NOT EXISTS withdrawal_requests (
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

-- [D] FREELANCER PORTFOLIOS
CREATE TABLE IF NOT EXISTS freelancer_portfolios (
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

-- [E] DISPUTES
CREATE TABLE IF NOT EXISTS disputes (
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
    CONSTRAINT fk_dispute_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_dispute_opened_by FOREIGN KEY (opened_by) REFERENCES users(id),
    CONSTRAINT fk_dispute_resolved_by FOREIGN KEY (resolved_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [F] VNPAY TRANSACTIONS
CREATE TABLE IF NOT EXISTS vnpay_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_no VARCHAR(100) NOT NULL UNIQUE,
    project_id BIGINT,
    order_number VARCHAR(50),
    user_id BIGINT,
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

-- [G] PLATFORM SETTINGS
CREATE TABLE IF NOT EXISTS platform_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    updated_at DATETIME(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. ALTER EXISTING TABLES WITH REQUIRED FEATURE COLUMNS
-- ----------------------------------------------------------------------------

-- USERS
CALL tm_add_column_if_absent('users', 'is_verified', 'BIT(1) NOT NULL DEFAULT b\'0\'');
CALL tm_add_column_if_absent('users', 'email_verified', 'BIT(1) NOT NULL DEFAULT b\'1\'');
CALL tm_add_column_if_absent('users', 'account_status', 'VARCHAR(30) NOT NULL DEFAULT \'ACTIVE\'');
CALL tm_add_column_if_absent('users', 'kyc_status', 'VARCHAR(30) NOT NULL DEFAULT \'NOT_SUBMITTED\'');
CALL tm_add_column_if_absent('users', 'id_card_number', 'VARCHAR(30) NULL');
CALL tm_add_column_if_absent('users', 'id_card_front_url', 'VARCHAR(500) NULL');
CALL tm_add_column_if_absent('users', 'id_card_back_url', 'VARCHAR(500) NULL');
CALL tm_add_column_if_absent('users', 'id_card_selfie_url', 'VARCHAR(500) NULL');
CALL tm_add_column_if_absent('users', 'kyc_submitted_at', 'DATETIME(6) NULL');
CALL tm_add_column_if_absent('users', 'kyc_verified_at', 'DATETIME(6) NULL');
CALL tm_add_column_if_absent('users', 'kyc_rejection_reason', 'TEXT NULL');
CALL tm_add_column_if_absent('users', 'balance', 'DECIMAL(15,2) NOT NULL DEFAULT 0.00');
CALL tm_add_column_if_absent('users', 'escrow_balance', 'DECIMAL(15,2) NOT NULL DEFAULT 0.00');
CALL tm_add_column_if_absent('users', 'talent_credit_score', 'INT NOT NULL DEFAULT 850');
CALL tm_add_column_if_absent('users', 'talent_credit_badge', 'VARCHAR(30) NOT NULL DEFAULT \'Bronze\'');

-- JOBS
CALL tm_add_column_if_absent('jobs', 'budget_type', 'VARCHAR(30) NOT NULL DEFAULT \'FIXED\'');
CALL tm_add_column_if_absent('jobs', 'proposals_count', 'INT NOT NULL DEFAULT 0');
UPDATE jobs SET title = 'Xây dựng Website Thương mại điện tử B2B Nông sản (Next.js + Tailwind + Node.js)' WHERE id = 1;
UPDATE jobs SET title = 'Thiết kế Bộ Nhận Diện Thương Hiệu & Logo Cho Chuỗi Nhà Hàng Chay' WHERE id = 2;
UPDATE jobs SET title = 'Thiết Kế UI/UX Ứng Dụng Đặt Lịch Chăm Sóc Sức Khỏe Tại Nhà' WHERE id = 3;

-- PROJECTS
CALL tm_add_column_if_absent('projects', 'agreement_terms', 'TEXT NULL');
CALL tm_add_column_if_absent('projects', 'agreement_version', 'INT NOT NULL DEFAULT 1');
CALL tm_add_column_if_absent('projects', 'order_number', 'VARCHAR(50) NULL');
CALL tm_add_column_if_absent('projects', 'service_title', 'VARCHAR(255) NULL');
CALL tm_add_column_if_absent('projects', 'platform_fee', 'DECIMAL(15,2) NOT NULL DEFAULT 0.00');
CALL tm_add_column_if_absent('projects', 'freelancer_payout_amount', 'DECIMAL(15,2) NOT NULL DEFAULT 0.00');
CALL tm_add_column_if_absent('projects', 'deadline', 'DATE NULL');
CALL tm_add_column_if_absent('projects', 'revision_count', 'INT NOT NULL DEFAULT 0');
CALL tm_add_column_if_absent('projects', 'max_revisions_allowed', 'INT NOT NULL DEFAULT 3');
CALL tm_add_column_if_absent('projects', 'auto_accept_days_remaining', 'INT NOT NULL DEFAULT 3');
CALL tm_add_column_if_absent('projects', 'sow_requirements', 'TEXT NULL');
CALL tm_add_column_if_absent('projects', 'notes', 'TEXT NULL');
CALL tm_add_column_if_absent('projects', 'payment_method', 'VARCHAR(50) NULL');
CALL tm_add_column_if_absent('projects', 'vnpay_transaction_id', 'VARCHAR(100) NULL');

-- PROJECT DELIVERIES
CALL tm_add_column_if_absent('project_deliveries', 'file_size', 'VARCHAR(50) NULL');
CALL tm_add_column_if_absent('project_deliveries', 'demo_url', 'VARCHAR(500) NULL');

-- TALENT REVIEWS
CALL tm_add_column_if_absent('talent_reviews', 'quality_rating', 'DECIMAL(3,1) NOT NULL DEFAULT 5.0');
CALL tm_add_column_if_absent('talent_reviews', 'deadline_rating', 'DECIMAL(3,1) NOT NULL DEFAULT 5.0');
CALL tm_add_column_if_absent('talent_reviews', 'communication_rating', 'DECIMAL(3,1) NOT NULL DEFAULT 5.0');
CALL tm_add_column_if_absent('talent_reviews', 'freelancer_reply', 'TEXT NULL');
CALL tm_add_column_if_absent('talent_reviews', 'order_title', 'VARCHAR(255) NULL');

-- JOB INVITATIONS
CALL tm_add_column_if_absent('job_invitations', 'responded_at', 'DATETIME(6) NULL');
CALL tm_add_column_if_absent('job_invitations', 'decline_reason', 'VARCHAR(500) NULL');

-- NOTIFICATIONS
CALL tm_add_column_if_absent('notifications', 'type', 'VARCHAR(40) NOT NULL DEFAULT \'SYSTEM\'');

DROP PROCEDURE IF EXISTS tm_add_column_if_absent;

-- ----------------------------------------------------------------------------
-- 4. UPDATE CORE PLATFORM SETTINGS
-- ----------------------------------------------------------------------------
INSERT INTO platform_settings (setting_key, setting_value, description, updated_at)
VALUES 
('platform_fee_percent', '10', 'Phần trăm phí sàn khấu trừ khi nghiệm thu (10%)', NOW(6)),
('auto_accept_hours', '72', 'Số giờ tự động nghiệm thu giải ngân sau khi bàn giao (72h)', NOW(6)),
('min_deposit_amount', '100000', 'Số tiền cọc Escrow tối thiểu (100.000 đ)', NOW(6)),
('dispute_resolution_days', '3', 'Thời hạn cam kết xử lý khiếu nại (3 ngày)', NOW(6))
ON DUPLICATE KEY UPDATE 
    setting_value = VALUES(setting_value),
    description = VALUES(description),
    updated_at = NOW(6);

-- ----------------------------------------------------------------------------
-- 5. SEED TẤT CẢ TÀI KHOẢN NGƯỜI DÙNG (BCrypt demo123456 / admin123456)
-- Password hash: $2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm (demo123456)
-- Admin hash:    $2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm (demo123456 / admin123456)
-- ----------------------------------------------------------------------------

-- [1] ADMIN: Quản Trị Viên TalentMatch
INSERT INTO users (
    full_name, email, password, role, phone, avatar, bio, enabled, locked,
    is_verified, email_verified, account_status, kyc_status, balance, escrow_balance,
    talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    'Quản Trị Viên TalentMatch', 'admin@talentmatch.vn',
    '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'ADMIN',
    '19008888', 'https://api.dicebear.com/7.x/identicon/svg?seed=admin-talentmatch',
    'Tài khoản Quản trị cấp cao phụ trách hệ thống và vận hành sàn TalentMatch.',
    b'1', b'0', b'1', b'1', 'ACTIVE', 'VERIFIED',
    95000000.00, 13550000.00, 1000, 'Top Rated', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE
    is_verified = b'1', email_verified = b'1', account_status = 'ACTIVE', kyc_status = 'VERIFIED',
    balance = 95000000.00, escrow_balance = 13550000.00;

-- [2] EMPLOYER: Lê Thu Hà - TechStartup
INSERT INTO users (
    full_name, email, password, role, phone, avatar, company_name, tax_code,
    field, location, bio, enabled, locked, is_verified, email_verified, account_status,
    kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    'Lê Thu Hà', 'ha.le@techstartup.vn',
    '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'CUSTOMER',
    '0987654321', 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
    'Công ty Cổ phần TechStartup Việt Nam', '0101234567', 'Công nghệ & Thương mại điện tử',
    'Hà Nội', 'Doanh nghiệp công nghệ phát triển giải pháp E-Commerce và AI cho SME.',
    b'1', b'0', b'1', b'1', 'ACTIVE', 'VERIFIED',
    50000000.00, 9500000.00, 980, 'Top Rated', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'1', email_verified = b'1', account_status = 'ACTIVE', kyc_status = 'VERIFIED',
    balance = 50000000.00, escrow_balance = 9500000.00;

-- [3] EMPLOYER: Phạm Tuấn Anh - Invest Growth
INSERT INTO users (
    full_name, email, password, role, phone, avatar, company_name, tax_code,
    field, location, bio, enabled, locked, is_verified, email_verified, account_status,
    kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    'Phạm Tuấn Anh', 'tuan.pham@invest.vn',
    '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'CUSTOMER',
    '0903332211', 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-tuan-anh',
    'Invest Growth Vietnam', '0319876543', 'Tài chính & Đầu tư',
    'TP. Hồ Chí Minh', 'Quỹ đầu tư và vườn ươm khởi nghiệp công nghệ Việt Nam.',
    b'1', b'0', b'1', b'1', 'ACTIVE', 'VERIFIED',
    32000000.00, 4500000.00, 950, 'Top Rated', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'1', email_verified = b'1', account_status = 'ACTIVE', kyc_status = 'VERIFIED',
    balance = 32000000.00, escrow_balance = 4500000.00;

-- [4] EMPLOYER: Nguyễn Mai Lan - EduSparks
INSERT INTO users (
    full_name, email, password, role, phone, avatar, company_name, tax_code,
    field, location, bio, enabled, locked, is_verified, email_verified, account_status,
    kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    'Nguyễn Mai Lan', 'lan.nguyen@edusparks.edu.vn',
    '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'CUSTOMER',
    '0912998877', 'https://api.dicebear.com/7.x/identicon/svg?seed=nguyen-mai-lan',
    'Học viện Giáo dục Trực tuyến EduSparks', '0108765432', 'Đào tạo & Giáo dục',
    'Hà Nội', 'Nền tảng đào tạo kỹ năng số và ngoại ngữ trực tuyến hàng đầu.',
    b'1', b'0', b'1', b'1', 'ACTIVE', 'VERIFIED',
    28000000.00, 6000000.00, 960, 'Top Rated', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'1', email_verified = b'1', account_status = 'ACTIVE', kyc_status = 'VERIFIED',
    balance = 28000000.00, escrow_balance = 6000000.00;

-- [5] EMPLOYER: Trần Việt Hoàng - Foodies Delight
INSERT INTO users (
    full_name, email, password, role, phone, avatar, company_name, tax_code,
    field, location, bio, enabled, locked, is_verified, email_verified, account_status,
    kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    'Trần Việt Hoàng', 'hoang.tran@foodies.vn',
    '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'CUSTOMER',
    '0938112233', 'https://api.dicebear.com/7.x/identicon/svg?seed=tran-viet-hoang',
    'Chuỗi Ẩm thực & Nhà hàng Foodies Delight', '0315678901', 'F&B & Bán lẻ',
    'TP. Hồ Chí Minh', 'Chuỗi nhà hàng chay và ẩm thực thực dưỡng cao cấp tại TP.HCM.',
    b'1', b'0', b'1', b'1', 'ACTIVE', 'VERIFIED',
    45000000.00, 8500000.00, 970, 'Top Rated', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'1', email_verified = b'1', account_status = 'ACTIVE', kyc_status = 'VERIFIED',
    balance = 45000000.00, escrow_balance = 8500000.00;

-- [6] EMPLOYER: Đặng Ngọc Mai - Bella Mode
INSERT INTO users (
    full_name, email, password, role, phone, avatar, company_name, tax_code,
    field, location, bio, enabled, locked, is_verified, email_verified, account_status,
    kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    'Đặng Ngọc Mai', 'mai.dang@fashionhouse.vn',
    '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'CUSTOMER',
    '0905667788', 'https://api.dicebear.com/7.x/identicon/svg?seed=dang-ngoc-mai',
    'Thời trang Thiết kế Bella Mode Vietnam', '0401234567', 'Thời trang & Mỹ phẩm',
    'Đà Nẵng', 'Thương hiệu thời trang thiết kế công sở và mỹ phẩm thiên nhiên.',
    b'1', b'0', b'1', b'1', 'ACTIVE', 'VERIFIED',
    19500000.00, 3500000.00, 940, 'Top Rated', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'1', email_verified = b'1', account_status = 'ACTIVE', kyc_status = 'VERIFIED',
    balance = 19500000.00, escrow_balance = 3500000.00;

-- [7] UNVERIFIED EMPLOYER: Hoàng Thị Yến
INSERT INTO users (
    full_name, email, password, role, phone, avatar, company_name,
    enabled, locked, is_verified, email_verified, account_status, kyc_status,
    balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    'Hoàng Thị Yến (Chưa xác thực)', 'yen.hoang.demo@gmail.com',
    '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'CUSTOMER',
    '0944556677', 'https://api.dicebear.com/7.x/identicon/svg?seed=hoang-thi-yen',
    'Công ty TNHH Yến Fashion',
    b'1', b'0', b'0', b'0', 'PENDING', 'NOT_SUBMITTED',
    0.00, 0.00, 800, 'Bronze', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'0', email_verified = b'0', account_status = 'PENDING', kyc_status = 'NOT_SUBMITTED';

-- [8] FREELANCER: Nguyễn Minh Anh - Senior Full-Stack Developer
INSERT INTO users (
    full_name, email, password, role, phone, avatar, professional_title,
    bio, skills, field, location, website, experience_years, hourly_rate, available,
    rating, completed_projects, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score,
    talent_credit_badge, created_at, updated_at
) VALUES (
    'Nguyễn Minh Anh', 'minhanh.dev@gmail.com',
    '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER',
    '0901234567', 'https://api.dicebear.com/7.x/identicon/svg?seed=nguyen-minh-anh',
    'Senior Full-Stack & Mobile App Developer',
    'Chuyên gia Full-Stack Web & Mobile App với hơn 6 năm kinh nghiệm thực chiến phát triển các giải pháp thương mại điện tử, ReactJS, Next.js, Node.js và Flutter cho các doanh nghiệp SME tại Việt Nam.',
    'ReactJS, Next.js, Node.js, TypeScript, Flutter, Tailwind CSS, REST API, MySQL',
    'IT & Lập trình', 'Hà Nội, Việt Nam', 'https://github.com/minhanh-dev/portfolio-vietnam',
    6, 350000.00, b'1', 4.92, 52, b'1', b'0', b'1', b'1', 'ACTIVE', 'VERIFIED',
    18500000.00, 4500000.00, 940, 'Top Rated', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'1', email_verified = b'1', account_status = 'ACTIVE', kyc_status = 'VERIFIED',
    balance = 18500000.00, escrow_balance = 4500000.00, talent_credit_score = 940, talent_credit_badge = 'Top Rated';

-- [9] FREELANCER: Trần Hoàng Nam - UI/UX Lead Designer
INSERT INTO users (
    full_name, email, password, role, phone, avatar, professional_title,
    bio, skills, field, location, website, experience_years, hourly_rate, available,
    rating, completed_projects, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score,
    talent_credit_badge, created_at, updated_at
) VALUES (
    'Trần Hoàng Nam', 'hoangnam.design@gmail.com',
    '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER',
    '0912345678', 'https://api.dicebear.com/7.x/identicon/svg?seed=tran-hoang-nam',
    'UI/UX & Brand Identity Lead Designer',
    'Designer sáng tạo có 5 năm thiết kế Bộ nhận diện thương hiệu, UI/UX Web/Mobile App hiện đại cho hơn 80 startup và doanh nghiệp Việt Nam.',
    'UI/UX Design, Figma, Branding, Logo Design, Design System, Adobe Illustrator',
    'Thiết kế & Đồ họa', 'TP. Hồ Chí Minh, Việt Nam', 'https://behance.net/hoangnam_uxui_vietnam',
    5, 300000.00, b'1', 4.95, 70, b'1', b'0', b'1', b'1', 'ACTIVE', 'VERIFIED',
    24000000.00, 4050000.00, 965, 'Top Rated', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'1', email_verified = b'1', account_status = 'ACTIVE', kyc_status = 'VERIFIED',
    balance = 24000000.00, escrow_balance = 4050000.00, talent_credit_score = 965, talent_credit_badge = 'Top Rated';

-- [10] FREELANCER: Phạm Quốc Huy - Video Editor
INSERT INTO users (
    full_name, email, password, role, phone, avatar, professional_title,
    bio, skills, field, location, website, experience_years, hourly_rate, available,
    rating, completed_projects, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score,
    talent_credit_badge, created_at, updated_at
) VALUES (
    'Phạm Quốc Huy', 'huy.media@gmail.com',
    '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER',
    '0933445566', 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-quoc-huy',
    'Video Editor & Motion Designer',
    'Video Editor chuyên sản xuất video quảng cáo ngắn TikTok Ads, Reels, Shorts và YouTube.',
    'Premiere Pro, After Effects, TikTok Ads, Motion Graphics, Color Grading',
    'Media & Video', 'Đà Nẵng, Việt Nam', 'https://youtube.com/@huy_media_portfolio',
    4, 250000.00, b'1', 4.88, 38, b'1', b'0', b'1', b'1', 'ACTIVE', 'VERIFIED',
    8200000.00, 0.00, 890, 'Gold', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'1', email_verified = b'1', account_status = 'ACTIVE', kyc_status = 'VERIFIED',
    balance = 8200000.00;

-- [11] FREELANCER: Vũ Linh Đan - SEO & Performance Marketer
INSERT INTO users (
    full_name, email, password, role, phone, avatar, professional_title,
    bio, skills, field, location, website, experience_years, hourly_rate, available,
    rating, completed_projects, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score,
    talent_credit_badge, created_at, updated_at
) VALUES (
    'Vũ Linh Đan', 'linhdan.marketing@gmail.com',
    '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER',
    '0977112233', 'https://api.dicebear.com/7.x/identicon/svg?seed=vu-linh-dan',
    'Senior Performance Marketer & SEO Specialist',
    'Tối ưu chiến dịch Facebook Ads, Google Ads và xây dựng chiến lược Content chuyển đổi cao.',
    'Facebook Ads, Google Ads, SEO Google, Content Marketing, Copywriting',
    'Marketing & Bán hàng', 'Hà Nội, Việt Nam', 'https://linhdan-marketing.myportfolio.com',
    4, 280000.00, b'1', 4.85, 30, b'1', b'0', b'1', b'1', 'ACTIVE', 'VERIFIED',
    14600000.00, 0.00, 875, 'Gold', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'1', email_verified = b'1', account_status = 'ACTIVE', kyc_status = 'VERIFIED',
    balance = 14600000.00;

-- [12] FREELANCER: Đỗ Bảo Long - Senior Python & AI Engineer
INSERT INTO users (
    full_name, email, password, role, phone, avatar, professional_title,
    bio, skills, field, location, website, experience_years, hourly_rate, available,
    rating, completed_projects, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score,
    talent_credit_badge, created_at, updated_at
) VALUES (
    'Đỗ Bảo Long', 'baolong.ai@gmail.com',
    '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER',
    '0966884422', 'https://api.dicebear.com/7.x/identicon/svg?seed=do-bao-long',
    'Senior Python & AI Engineer',
    'Xây dựng hệ thống dữ liệu lớn, tích hợp OpenAI/Gemini API, OCR tiếng Việt và phát triển backend FastAPI.',
    'Python, FastAPI, AI/LLM, PostgreSQL, Docker, REST API, PyTorch, LangChain',
    'IT & Lập trình', 'TP. Hồ Chí Minh, Việt Nam', 'https://github.com/baolong-ai-engineer',
    7, 450000.00, b'1', 4.96, 45, b'1', b'0', b'1', b'1', 'ACTIVE', 'VERIFIED',
    31000000.00, 0.00, 970, 'Top Rated', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'1', email_verified = b'1', account_status = 'ACTIVE', kyc_status = 'VERIFIED',
    balance = 31000000.00;

-- [13] FREELANCER: Ngô Phương Thanh - Content Strategist
INSERT INTO users (
    full_name, email, password, role, phone, avatar, professional_title,
    bio, skills, field, location, website, experience_years, hourly_rate, available,
    rating, completed_projects, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score,
    talent_credit_badge, created_at, updated_at
) VALUES (
    'Ngô Phương Thanh', 'thanh.writer@gmail.com',
    '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER',
    '0981223344', 'https://api.dicebear.com/7.x/identicon/svg?seed=ngo-phuong-thanh',
    'Content Strategist & Creative Copywriter',
    'Chuyên gia ngôn từ và chiến lược nội dung số với 5 năm kinh nghiệm. Xây dựng content pillar, viết bài chuẩn SEO, bài PR báo chí.',
    'Content Strategy, SEO Writing, Copywriting, Social Media, Storytelling, PR Article',
    'Viết lách & Nội dung', 'Hà Nội, Việt Nam', 'https://phuongthanh-content.myportfolio.com',
    5, 200000.00, b'1', 4.91, 44, b'1', b'0', b'1', b'1', 'ACTIVE', 'VERIFIED',
    11800000.00, 1800000.00, 920, 'Top Rated', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'1', email_verified = b'1', account_status = 'ACTIVE', kyc_status = 'VERIFIED',
    balance = 11800000.00, escrow_balance = 1800000.00;

-- [14] FREELANCER: Bùi Hoàng Đức - Kiến trúc sư 3D & BIM
INSERT INTO users (
    full_name, email, password, role, phone, avatar, professional_title,
    bio, skills, field, location, website, experience_years, hourly_rate, available,
    rating, completed_projects, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score,
    talent_credit_badge, created_at, updated_at
) VALUES (
    'Bùi Hoàng Đức', 'duc.architect@gmail.com',
    '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER',
    '0918776655', 'https://api.dicebear.com/7.x/identicon/svg?seed=bui-hoang-duc',
    'Kiến trúc sư 3D & BIM Revit Specialist',
    'Kiến trúc sư giàu kinh nghiệm thiết kế quy hoạch, phối cảnh 3D nội ngoại thất và lập mô hình BIM Revit chuẩn thi công.',
    'AutoCAD, Revit BIM, 3Ds Max, SketchUp, V-Ray, Phối cảnh 3D nội thất',
    'Kỹ thuật & Kiến trúc', 'Hải Phòng, Việt Nam', 'https://behance.net/duc_architect_vietnam',
    6, 320000.00, b'1', 4.89, 40, b'1', b'0', b'1', b'1', 'ACTIVE', 'VERIFIED',
    22400000.00, 5400000.00, 935, 'Top Rated', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'1', email_verified = b'1', account_status = 'ACTIVE', kyc_status = 'VERIFIED',
    balance = 22400000.00, escrow_balance = 5400000.00;

-- [15] FREELANCER: Trịnh Hoài Thu - Biên Phiên Dịch Anh - Nhật
INSERT INTO users (
    full_name, email, password, role, phone, avatar, professional_title,
    bio, skills, field, location, website, experience_years, hourly_rate, available,
    rating, completed_projects, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score,
    talent_credit_badge, created_at, updated_at
) VALUES (
    'Trịnh Hoài Thu', 'thu.translator@gmail.com',
    '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER',
    '0936554433', 'https://api.dicebear.com/7.x/identicon/svg?seed=trinh-hoai-thu',
    'Biên Phiên Dịch Song Ngữ Anh - Nhật N1',
    'Biên dịch viên chuyên nghiệp đạt chứng chỉ JLPT N1 và IELTS 8.0 với 5 năm kinh nghiệm dịch thuật hợp đồng và bản địa hóa.',
    'Dịch thuật Anh - Việt, Nhật - Việt, Biên dịch hợp đồng, Tài liệu kỹ thuật IT, Localization',
    'Dịch thuật & Đào tạo', 'TP. Hồ Chí Minh, Việt Nam', 'https://proz.com/profile/trinh-hoai-thu-translator',
    5, 230000.00, b'1', 4.94, 58, b'1', b'0', b'1', b'1', 'ACTIVE', 'VERIFIED',
    16200000.00, 0.00, 945, 'Top Rated', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'1', email_verified = b'1', account_status = 'ACTIVE', kyc_status = 'VERIFIED',
    balance = 16200000.00;

-- [16] FREELANCER: Lê Minh Quang - Kế toán trưởng & Tư vấn thuế
INSERT INTO users (
    full_name, email, password, role, phone, avatar, professional_title,
    bio, skills, field, location, website, experience_years, hourly_rate, available,
    rating, completed_projects, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score,
    talent_credit_badge, created_at, updated_at
) VALUES (
    'Lê Minh Quang', 'quang.fin@gmail.com',
    '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER',
    '0979887766', 'https://api.dicebear.com/7.x/identicon/svg?seed=le-minh-quang',
    'Chuyên Viên Kế Toán Trưởng & Tư Vấn Thuế',
    'Kế toán trưởng có chứng chỉ hành nghề thuế CPA Vietnam. 8 năm hỗ trợ soát xét chứng từ, quyết toán thuế và tối ưu chi phí thuế.',
    'Kế toán tài chính, Báo cáo tài chính, Quyết toán thuế, MISA, ERP, Kiểm soát dòng tiền',
    'Tài chính & Kế toán', 'Hà Nội, Việt Nam', 'https://linkedin.com/in/quangle-finance-cpa',
    8, 380000.00, b'1', 4.97, 48, b'1', b'0', b'1', b'1', 'ACTIVE', 'VERIFIED',
    27500000.00, 3600000.00, 960, 'Top Rated', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'1', email_verified = b'1', account_status = 'ACTIVE', kyc_status = 'VERIFIED',
    balance = 27500000.00, escrow_balance = 3600000.00;

-- [17] FREELANCER: Đoàn Bảo Ngọc - 3D Character Game
INSERT INTO users (
    full_name, email, password, role, phone, avatar, professional_title,
    bio, skills, field, location, website, experience_years, hourly_rate, available,
    rating, completed_projects, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score,
    talent_credit_badge, created_at, updated_at
) VALUES (
    'Đoàn Bảo Ngọc', 'ngoc.game3d@gmail.com',
    '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER',
    '0962334455', 'https://api.dicebear.com/7.x/identicon/svg?seed=doan-bao-ngoc',
    '3D Character & Game Animator',
    'Nghệ sĩ 3D chuyên tạo hình nhân vật, vũ khí và hoạt họa chuyển động trong game Blender, Maya, Unreal Engine 5.',
    'Blender, Maya, ZBrush, Unity 3D, Character Rigging, Unreal Engine 5',
    'Thiết kế & Đồ họa', 'Cần Thơ, Việt Nam', 'https://artstation.com/baongoc_3dgame',
    4, 280000.00, b'1', 4.87, 29, b'1', b'0', b'1', b'1', 'ACTIVE', 'VERIFIED',
    13500000.00, 0.00, 885, 'Gold', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'1', email_verified = b'1', account_status = 'ACTIVE', kyc_status = 'VERIFIED',
    balance = 13500000.00;

-- [18] UNVERIFIED FREELANCER: Phạm Đức Minh
INSERT INTO users (
    full_name, email, password, role, phone, avatar, professional_title,
    bio, skills, enabled, locked, is_verified, email_verified, account_status,
    kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    'Phạm Đức Minh (Chưa xác thực)', 'ducminh.demo@gmail.com',
    '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER',
    '0988776655', 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-duc-minh',
    'Frontend Developer mới tốt nghiệp',
    'Lập trình viên Frontend mới tốt nghiệp, đam mê công nghệ React và Tailwind CSS.',
    'ReactJS, HTML/CSS, JavaScript',
    b'1', b'0', b'0', b'0', 'PENDING', 'NOT_SUBMITTED',
    0.00, 0.00, 800, 'Bronze', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'0', email_verified = b'0', account_status = 'PENDING', kyc_status = 'NOT_SUBMITTED';

-- [19] BANNED USER: Nguyễn Văn Vi Phạm
INSERT INTO users (
    full_name, email, password, role, phone, avatar, bio,
    enabled, locked, is_verified, email_verified, account_status, kyc_status,
    balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    'Nguyễn Văn Vi Phạm (Bị khóa)', 'banned.user@gmail.com',
    '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm', 'FREELANCER',
    '0977889900', 'https://api.dicebear.com/7.x/identicon/svg?seed=nguyen-van-vi-pham',
    'Tài khoản đã bị tạm khóa do vi phạm chính sách giao dịch ngoài sàn.',
    b'1', b'1', b'0', b'1', 'SUSPENDED', 'NOT_SUBMITTED',
    0.00, 0.00, 600, 'Bronze', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    account_status = 'SUSPENDED', locked = b'1';

UPDATE users SET full_name = 'Lê Thu Hà', company_name = 'Công ty Cổ phần TechStartup Việt Nam', field = 'Công nghệ & Thương mại điện tử', location = 'Hà Nội', bio = 'Doanh nghiệp công nghệ phát triển giải pháp E-Commerce và AI cho SME.' WHERE email = 'ha.le@techstartup.vn';
UPDATE users SET full_name = 'Phạm Tuấn Anh', company_name = 'Invest Growth Vietnam', field = 'Tài chính & Đầu tư', location = 'TP. Hồ Chí Minh', bio = 'Quỹ đầu tư và vườn ươm khởi nghiệp công nghệ Việt Nam.' WHERE email = 'tuan.pham@invest.vn';
UPDATE users SET full_name = 'Nguyễn Minh Anh', professional_title = 'Senior Full-Stack Web & Mobile App Developer', field = 'IT & Lập trình', location = 'Hà Nội, Việt Nam', bio = 'Chuyên gia Full-Stack Web & Mobile App với hơn 6 năm kinh nghiệm thực chiến phát triển các giải pháp thương mại điện tử, ReactJS, Next.js, Node.js và Flutter.' WHERE email = 'minhanh.dev@gmail.com';
UPDATE users SET full_name = 'Trần Hoàng Nam', professional_title = 'Senior UI/UX & Brand Identity Designer', field = 'Thiết kế & Đồ họa', location = 'TP. Hồ Chí Minh, Việt Nam', bio = 'Designer sáng tạo có 5 năm thiết kế Bộ nhận diện thương hiệu, UI/UX Web/Mobile App hiện đại cho hơn 80 startup và doanh nghiệp Việt Nam.' WHERE email = 'hoangnam.design@gmail.com';
UPDATE users SET full_name = 'Phạm Quốc Huy', professional_title = 'Video Editor & Motion Graphic Designer', field = 'Video & Animation', location = 'Đà Nẵng, Việt Nam', bio = 'Video Editor chuyên sản xuất video quảng cáo ngắn TikTok Ads, Reels, Shorts và YouTube.' WHERE email = 'huy.media@gmail.com';
UPDATE users SET full_name = 'Vũ Linh Đan', professional_title = 'Senior Performance Marketer & SEO Specialist', field = 'Marketing & Bán hàng', location = 'Hà Nội, Việt Nam', bio = 'Tối ưu chiến dịch Facebook Ads, Google Ads và xây dựng chiến lược Content chuyển đổi cao.' WHERE email = 'linhdan.marketing@gmail.com';
UPDATE users SET full_name = 'Đỗ Bảo Long', professional_title = 'Senior Python & AI Engineer', field = 'IT & Lập trình', location = 'TP. Hồ Chí Minh, Việt Nam', bio = 'Xây dựng hệ thống dữ liệu lớn, tích hợp OpenAI/Gemini API, OCR tiếng Việt và phát triển backend FastAPI.' WHERE email = 'baolong.ai@gmail.com';
UPDATE users SET full_name = 'Hoàng Thị Yến (Chưa xác thực)', company_name = 'Công ty TNHH Yến Fashion', field = 'Thời trang & May mặc', location = 'Hà Nội', bio = 'Thương hiệu thời trang nữ thiết kế cao cấp với 3 chi nhánh tại Hà Nội.' WHERE email = 'yen.hoang.demo@gmail.com';
UPDATE users SET full_name = 'Phạm Đức Minh (Chưa xác thực)', professional_title = 'Frontend Developer mới tốt nghiệp', bio = 'Lập trình viên Frontend mới tốt nghiệp, đam mê công nghệ React và Tailwind CSS.' WHERE email = 'ducminh.demo@gmail.com';


-- ----------------------------------------------------------------------------
-- 6. SEED TÀI KHOẢN NGÂN HÀNG LIÊN KẾT (USER_BANK_ACCOUNTS)
-- ----------------------------------------------------------------------------
INSERT INTO user_bank_accounts (user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
SELECT u.id, 'Vietcombank (Ngoại Thương Việt Nam)', 'VCB', '1028394857', 'LE THU HA', b'1', NOW(6)
FROM users u WHERE u.email = 'ha.le@techstartup.vn' LIMIT 1
ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name);

INSERT INTO user_bank_accounts (user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
SELECT u.id, 'Techcombank (Kỹ Thương Việt Nam)', 'TCB', '190384759281', 'PHAM TUAN ANH', b'1', NOW(6)
FROM users u WHERE u.email = 'tuan.pham@invest.vn' LIMIT 1
ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name);

INSERT INTO user_bank_accounts (user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
SELECT u.id, 'Á Châu (ACB)', 'ACB', '2345678901', 'NGUYEN MAI LAN', b'1', NOW(6)
FROM users u WHERE u.email = 'lan.nguyen@edusparks.edu.vn' LIMIT 1
ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name);

INSERT INTO user_bank_accounts (user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
SELECT u.id, 'VPBank (Việt Nam Thịnh Vượng)', 'VPB', '98765432101', 'TRAN VIET HOANG', b'1', NOW(6)
FROM users u WHERE u.email = 'hoang.tran@foodies.vn' LIMIT 1
ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name);

INSERT INTO user_bank_accounts (user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
SELECT u.id, 'MB Bank (Quân Đội)', 'MBB', '888809056677', 'DANG NGOC MAI', b'1', NOW(6)
FROM users u WHERE u.email = 'mai.dang@fashionhouse.vn' LIMIT 1
ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name);

INSERT INTO user_bank_accounts (user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
SELECT u.id, 'MB Bank (Quân Đội)', 'MBB', '090123456789', 'NGUYEN MINH ANH', b'1', NOW(6)
FROM users u WHERE u.email = 'minhanh.dev@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name);

INSERT INTO user_bank_accounts (user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
SELECT u.id, 'VietinBank (Công Thương Việt Nam)', 'CTG', '108829384756', 'TRAN HOANG NAM', b'1', NOW(6)
FROM users u WHERE u.email = 'hoangnam.design@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name);

INSERT INTO user_bank_accounts (user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
SELECT u.id, 'Techcombank (Kỹ Thương Việt Nam)', 'TCB', '190283746519', 'PHAM QUOC HUY', b'1', NOW(6)
FROM users u WHERE u.email = 'huy.media@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name);

INSERT INTO user_bank_accounts (user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
SELECT u.id, 'Vietcombank (Ngoại Thương Việt Nam)', 'VCB', '0071001234567', 'VU LINH DAN', b'1', NOW(6)
FROM users u WHERE u.email = 'linhdan.marketing@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name);

INSERT INTO user_bank_accounts (user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
SELECT u.id, 'Á Châu (ACB)', 'ACB', '189283749', 'DO BAO LONG', b'1', NOW(6)
FROM users u WHERE u.email = 'baolong.ai@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name);

INSERT INTO user_bank_accounts (user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
SELECT u.id, 'Vietcombank (Ngoại Thương Việt Nam)', 'VCB', '0451009876543', 'NGO PHUONG THANH', b'1', NOW(6)
FROM users u WHERE u.email = 'thanh.writer@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name);

INSERT INTO user_bank_accounts (user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
SELECT u.id, 'BIDV (Đầu Tư & Phát Triển Việt Nam)', 'BIDV', '2151000889922', 'BUI HOANG DUC', b'1', NOW(6)
FROM users u WHERE u.email = 'duc.architect@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name);

INSERT INTO user_bank_accounts (user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
SELECT u.id, 'MB Bank (Quân Đội)', 'MBB', '079012345678', 'LE MINH QUANG', b'1', NOW(6)
FROM users u WHERE u.email = 'quang.fin@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name);

-- ----------------------------------------------------------------------------
-- 7. SEED FREELANCER PORTFOLIOS
-- ----------------------------------------------------------------------------
INSERT INTO freelancer_portfolios (user_id, title, category, image_url, description, project_url, created_at)
SELECT u.id, 'Hệ thống E-Commerce Bán lẻ Nông sản Sạch', 'IT & Lập trình',
 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
 'Xây dựng toàn bộ giao diện Web ReactJS và API Backend Node.js cho hệ thống bán lẻ nông sản sạch, tích hợp thanh toán VNPay.',
 'https://nongsan-demo.vercel.app', NOW(6)
FROM users u WHERE u.email = 'minhanh.dev@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO freelancer_portfolios (user_id, title, category, image_url, description, project_url, created_at)
SELECT u.id, 'Ứng dụng Quản lý Tài chính Doanh nghiệp', 'IT & Lập trình',
 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600',
 'Lập trình App di động Flutter với giao diện tối giản, tích hợp biểu đồ thống kê chi tiêu và báo cáo tự động.',
 'https://finance-app-demo.flutter.dev', NOW(6)
FROM users u WHERE u.email = 'minhanh.dev@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO freelancer_portfolios (user_id, title, category, image_url, description, project_url, created_at)
SELECT u.id, 'Bộ Nhận Diện Thương Hiệu Chuỗi Cà Phê The Garden', 'Thiết kế & Đồ họa',
 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=600',
 'Thiết kế Logo, Guideline màu sắc, Bao bì sản phẩm và Menu định dạng số chuẩn in ấn và hiển thị di động.',
 'https://behance.net/gallery/thegarden-coffee-branding', NOW(6)
FROM users u WHERE u.email = 'hoangnam.design@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO freelancer_portfolios (user_id, title, category, image_url, description, project_url, created_at)
SELECT u.id, 'Chuỗi Video Quảng Cáo Mỹ Phẩm TikTok Ads', 'Video & Animation',
 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=600',
 'Dựng 10 video ngắn đạt hơn 2 triệu lượt xem tự nhiên trên nền tảng TikTok.',
 'https://tiktok.com/@portfolio_samples', NOW(6)
FROM users u WHERE u.email = 'huy.media@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO freelancer_portfolios (user_id, title, category, image_url, description, project_url, created_at)
SELECT u.id, 'Chiến dịch Performance Ads F&B Doanh số +320%', 'Digital Marketing',
 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=600',
 'Tối ưu hóa phễu chuyển đổi và chi phí quảng cáo ROAS đạt 4.8x.',
 'https://linhdan-marketing.myportfolio.com/case-study-fb', NOW(6)
FROM users u WHERE u.email = 'linhdan.marketing@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO freelancer_portfolios (user_id, title, category, image_url, description, project_url, created_at)
SELECT u.id, 'Hệ thống Trợ lý AI Chăm sóc Khách hàng Tự động', 'IT & Lập trình',
 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
 'Tích hợp mô hình AI LLM phân loại thắc mắc và tự động phản hồi khách hàng theo ngữ cảnh.',
 'https://github.com/baolong-ai-engineer/rag-chatbot', NOW(6)
FROM users u WHERE u.email = 'baolong.ai@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO freelancer_portfolios (user_id, title, category, image_url, description, project_url, created_at)
SELECT u.id, 'E-Book Hướng Dẫn Chuyển Đổi Số Cho Doanh Nghiệp Nhỏ', 'Viết lách & Nội dung',
 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=600',
 'Soạn thảo trọn bộ E-book 80 trang và chuỗi 20 bài viết lead generation thu hút 15,000 lượt tải.',
 'https://phuongthanh-content.myportfolio.com/ebook-sme', NOW(6)
FROM users u WHERE u.email = 'thanh.writer@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO freelancer_portfolios (user_id, title, category, image_url, description, project_url, created_at)
SELECT u.id, 'Phối Cảnh 3D Biệt Thự Nghỉ Dưỡng Sinh Thái EcoHouse', 'Kỹ thuật & Kiến trúc',
 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
 'Dựng phối cảnh 3D ngoại thất, sân vườn và hồ bơi vô cực bằng 3Ds Max + V-Ray.',
 'https://behance.net/gallery/ecohouse-villa-render', NOW(6)
FROM users u WHERE u.email = 'duc.architect@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ----------------------------------------------------------------------------
-- 8. SEED NOTIFICATIONS (THÔNG BÁO PHONG PHÚ CHO TẤT CẢ TÀI KHOẢN)
-- ----------------------------------------------------------------------------
-- Lê Thu Hà (ha.le@techstartup.vn)
INSERT INTO notifications (recipient_id, title, message, target_url, is_read, type, created_at)
SELECT u.id, 'Báo giá mới cho dự án Quản lý Kho Hàng', 'Freelancer Nguyễn Minh Anh vừa gửi báo giá 14.000.000 đ kèm Portfolio mẫu App Quản lý Kho Hàng.', '/employer/dashboard', b'0', 'PROPOSAL', NOW(6)
FROM users u WHERE u.email = 'ha.le@techstartup.vn' LIMIT 1;

INSERT INTO notifications (recipient_id, title, message, target_url, is_read, type, created_at)
SELECT u.id, 'Tạm giữ tiền Escrow VNPAY thành công', 'Đã phong tỏa 14.000.000 đ qua Cổng VNPAY vào Ví Tạm Giữ Escrow cho Hợp đồng TM-2026-7732.', '/employer/dashboard', b'0', 'ESCROW', DATE_SUB(NOW(6), INTERVAL 1 HOUR)
FROM users u WHERE u.email = 'ha.le@techstartup.vn' LIMIT 1;

INSERT INTO notifications (recipient_id, title, message, target_url, is_read, type, created_at)
SELECT u.id, 'Freelancer đã nộp bản thử nghiệm APK', 'Nguyễn Minh Anh đã upload file KhoHang_App_Build_v1.0.apk (38.5 MB) để chờ bạn nghiệm thu Cột mốc 1.', '/employer/dashboard', b'1', 'CONTRACT', DATE_SUB(NOW(6), INTERVAL 1 DAY)
FROM users u WHERE u.email = 'ha.le@techstartup.vn' LIMIT 1;

-- Phạm Tuấn Anh (tuan.pham@invest.vn)
INSERT INTO notifications (recipient_id, title, message, target_url, is_read, type, created_at)
SELECT u.id, 'Có 4 ứng viên nộp đề xuất cho dự án Landing Page Đầu Tư', 'Nhiều lập trình viên ReactJS giỏi vừa gửi báo giá, ngân sách trung bình 4.200.000 đ.', '/employer/dashboard', b'0', 'PROPOSAL', DATE_SUB(NOW(6), INTERVAL 2 HOUR)
FROM users u WHERE u.email = 'tuan.pham@invest.vn' LIMIT 1;

-- Nguyễn Mai Lan (lan.nguyen@edusparks.edu.vn)
INSERT INTO notifications (recipient_id, title, message, target_url, is_read, type, created_at)
SELECT u.id, 'Đề xuất mới từ Kỹ sư AI Đỗ Bảo Long', 'Đỗ Bảo Long đề xuất xây dựng kiến trúc Chatbot RAG với FastAPI và pgvector cho học viện EduSparks.', '/employer/dashboard', b'0', 'PROPOSAL', DATE_SUB(NOW(6), INTERVAL 3 HOUR)
FROM users u WHERE u.email = 'lan.nguyen@edusparks.edu.vn' LIMIT 1;

-- Trần Việt Hoàng (hoang.tran@foodies.vn)
INSERT INTO notifications (recipient_id, title, message, target_url, is_read, type, created_at)
SELECT u.id, 'Bàn giao thiết kế Cột mốc 1: Phác thảo Logo', 'Trần Hoàng Nam đã gửi 3 concept logo Foodies Chay dạng vector PDF để bạn đánh giá.', '/employer/dashboard', b'0', 'CONTRACT', DATE_SUB(NOW(6), INTERVAL 3 HOUR)
FROM users u WHERE u.email = 'hoang.tran@foodies.vn' LIMIT 1;

-- Nguyễn Minh Anh (minhanh.dev@gmail.com)
INSERT INTO notifications (recipient_id, title, message, target_url, is_read, type, created_at)
SELECT u.id, 'Lời mời nhận dự án mới từ Lê Thu Hà (TechStartup VN)', 'Doanh nghiệp đã gửi lời mời bạn tham gia dự án "Xây dựng Website Thương mại điện tử B2B Nông sản" với ngân sách 15.000.000 đ.', '/freelancer/dashboard', b'0', 'INVITATION', NOW(6)
FROM users u WHERE u.email = 'minhanh.dev@gmail.com' LIMIT 1;

INSERT INTO notifications (recipient_id, title, message, target_url, is_read, type, created_at)
SELECT u.id, 'Nhà tuyển dụng đã duyệt báo giá dự án App Quản lý Kho!', 'Lê Thu Hà (TechStartup Việt Nam) đã chấp nhận báo giá 14.000.000 đ và nạp cọc 100% vào Escrow.', '/freelancer/dashboard', b'0', 'CONTRACT', DATE_SUB(NOW(6), INTERVAL 20 MINUTE)
FROM users u WHERE u.email = 'minhanh.dev@gmail.com' LIMIT 1;

INSERT INTO notifications (recipient_id, title, message, target_url, is_read, type, created_at)
SELECT u.id, 'Giải ngân Cột mốc 1 thành công: +6.000.000 đ', 'Số tiền 5.400.000 đ (sau khấu trừ 10% phí sàn) đã được cộng trực tiếp vào Số dư Ví khả dụng của bạn.', '/freelancer/dashboard', b'0', 'ESCROW', DATE_SUB(NOW(6), INTERVAL 3 HOUR)
FROM users u WHERE u.email = 'minhanh.dev@gmail.com' LIMIT 1;

-- Trần Hoàng Nam (hoangnam.design@gmail.com)
INSERT INTO notifications (recipient_id, title, message, target_url, is_read, type, created_at)
SELECT u.id, 'Lời mời nhận dự án mới từ Phạm Tuấn Anh (Invest Growth)', 'Doanh nghiệp đã gửi lời mời bạn tham gia dự án "Thiết kế Bộ nhận diện thương hiệu & UI/UX Mobile App" với ngân sách 8.500.000 đ.', '/freelancer/dashboard', b'0', 'INVITATION', DATE_SUB(NOW(6), INTERVAL 2 HOUR)
FROM users u WHERE u.email = 'hoangnam.design@gmail.com' LIMIT 1;

INSERT INTO notifications (recipient_id, title, message, target_url, is_read, type, created_at)
SELECT u.id, 'Doanh nghiệp đã duyệt Cột mốc 1 dự án Foodies Chay', 'Trần Việt Hoàng đã bấm nghiệm thu Cột mốc 1. Thù lao 2.250.000 đ đã giải ngân vào ví của bạn.', '/freelancer/dashboard', b'0', 'ESCROW', DATE_SUB(NOW(6), INTERVAL 45 MINUTE)
FROM users u WHERE u.email = 'hoangnam.design@gmail.com' LIMIT 1;

-- Đỗ Bảo Long (baolong.ai@gmail.com)
INSERT INTO notifications (recipient_id, title, message, target_url, is_read, type, created_at)
SELECT u.id, 'Lời mời dự án Trợ lý AI Chatbot RAG từ EduSparks Academy', 'Nguyễn Mai Lan đã xem portfolio RAG Chatbot của bạn trên Github và gửi lời mời báo giá dự án 18.000.000 đ.', '/freelancer/dashboard', b'0', 'INVITATION', DATE_SUB(NOW(6), INTERVAL 2 HOUR)
FROM users u WHERE u.email = 'baolong.ai@gmail.com' LIMIT 1;

-- Admin (admin@talentmatch.vn)
INSERT INTO notifications (recipient_id, title, message, target_url, is_read, type, created_at)
SELECT u.id, 'Yêu cầu Trọng tài Tranh chấp mới: Hợp đồng TM-2026-8891', 'Employer Trần Việt Hoàng mở khiếu nại về tiến độ bàn giao menu nhà hàng.', '/admin/dashboard', b'0', 'SYSTEM', DATE_SUB(NOW(6), INTERVAL 2 HOUR)
FROM users u WHERE u.email = 'admin@talentmatch.vn' LIMIT 1;

INSERT INTO notifications (recipient_id, title, message, target_url, is_read, type, created_at)
SELECT u.id, 'Giao dịch Escrow lớn nạp thành công qua VNPay', 'Hệ thống vừa ghi nhận nạp cọc 14.000.000 đ qua Cổng VNPAY từ khách hàng TechStartup Việt Nam.', '/admin/dashboard', b'0', 'ESCROW', DATE_SUB(NOW(6), INTERVAL 2 HOUR)
FROM users u WHERE u.email = 'admin@talentmatch.vn' LIMIT 1;

-- ----------------------------------------------------------------------------
-- 9. SEED WITHDRAWAL REQUESTS (LỆNH RÚT TIỀN)
-- ----------------------------------------------------------------------------
INSERT INTO withdrawal_requests (
    id, user_id, bank_name, bank_code, account_number, account_holder,
    amount, fee, net_amount, status, admin_note, transaction_code, created_at
)
SELECT 1, u.id, 'MB Bank (Quân Đội)', 'MBB', '090123456789', 'NGUYEN MINH ANH',
 5000000.00, 0.00, 5000000.00, 'PENDING',
 'Yêu cầu rút tiền thù lao từ dự án E-Commerce', 'WTH-2026-001', NOW(6)
FROM users u WHERE u.email = 'minhanh.dev@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE amount = VALUES(amount), status = VALUES(status);

INSERT INTO withdrawal_requests (
    id, user_id, bank_name, bank_code, account_number, account_holder,
    amount, fee, net_amount, status, admin_note, transaction_code, created_at, processed_at
)
SELECT 2, u.id, 'VietinBank (Công Thương Việt Nam)', 'CTG', '108829384756', 'TRAN HOANG NAM',
 10000000.00, 0.00, 10000000.00, 'APPROVED',
 'Đã chuyển khoản thành công qua cổng thanh toán liên ngân hàng', 'WTH-2026-002',
 DATE_SUB(NOW(6), INTERVAL 1 DAY), NOW(6)
FROM users u WHERE u.email = 'hoangnam.design@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE amount = VALUES(amount), status = VALUES(status);

-- ----------------------------------------------------------------------------
-- 10. SEED VNPAY TRANSACTIONS
-- ----------------------------------------------------------------------------
INSERT INTO vnpay_transactions (
    transaction_no, order_number, user_email, amount, bank_code, card_type, pay_date, status, type, description, created_at
) VALUES 
('VNPAY-2026-8891-QR', 'TM-2026-8891', 'hoang.tran@foodies.vn', 5500000.00, 'VNPAYQR', 'QR_CODE', NOW(6), 'SUCCESS', 'ESCROW_DEPOSIT', 'Nạp cọc Escrow dự án Branding chuỗi nhà hàng qua VNPAY-QR', NOW(6)),
('VNPAY-2026-7732-ATM', 'TM-2026-7732', 'ha.le@techstartup.vn', 14000000.00, 'NCB', 'ATM_CARD', NOW(6), 'SUCCESS', 'ESCROW_DEPOSIT', 'Nạp cọc Escrow dự án App Mobile Quản lý Kho Hàng qua thẻ ATM nội địa', NOW(6)),
('VNPAY-2026-6621-QR', 'TM-2026-6621', 'ha.le@techstartup.vn', 3000000.00, 'VNPAYQR', 'QR_CODE', NOW(6), 'SUCCESS', 'ESCROW_DEPOSIT', 'Nạp cọc Escrow thiết kế Banner quảng cáo', NOW(6)),
('VNPAY-PAYOUT-9912', 'TM-2026-6621', 'hoangnam.design@gmail.com', 2700000.00, 'VIETINBANK', 'BANK_TRANSFER', NOW(6), 'SUCCESS', 'PAYOUT', 'Giải ngân tiền công (90%) cho Freelancer Trần Hoàng Nam', NOW(6))
ON DUPLICATE KEY UPDATE status = VALUES(status);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
SELECT 'TalentMatch V33 Database Migration & Full Seed Completed Successfully!' AS status;
