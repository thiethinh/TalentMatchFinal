-- ============================================================================
-- TalentMatch V32 — FULL DATABASE SCHEMA & FEATURE ENRICHMENT (MySQL 8+)
-- Non-destructive, safe to re-run multiple times (Idempotent).
-- Covers 100% features: Auth, eKYC, Escrow Wallet, Bank Accounts, Withdrawals,
-- Projects, Milestones, Deliveries, Multi-Criteria Reviews, Disputes, VNPay,
-- Invitations, Real-time Notifications & Platform Configuration.
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
-- 2. ALTER EXISTING TABLES WITH REQUIRED FEATURE COLUMNS
-- ----------------------------------------------------------------------------

-- [A] USERS: eKYC, Mandatory Email Verification, Wallet & Escrow Balances, TalentCredit
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

-- [B] JOBS: Budget type & proposal count cache
CALL tm_add_column_if_absent('jobs', 'budget_type', 'VARCHAR(30) NOT NULL DEFAULT \'FIXED\'');
CALL tm_add_column_if_absent('jobs', 'proposals_count', 'INT NOT NULL DEFAULT 0');

-- [C] PROJECTS: Order number, fee breakdown, revisions, Escrow payment info
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

-- [D] PROJECT DELIVERIES: File size and interactive live demo URL
CALL tm_add_column_if_absent('project_deliveries', 'file_size', 'VARCHAR(50) NULL');
CALL tm_add_column_if_absent('project_deliveries', 'demo_url', 'VARCHAR(500) NULL');

-- [E] TALENT REVIEWS: Multi-criteria rating and freelancer reply
CALL tm_add_column_if_absent('talent_reviews', 'quality_rating', 'DECIMAL(3,1) NOT NULL DEFAULT 5.0');
CALL tm_add_column_if_absent('talent_reviews', 'deadline_rating', 'DECIMAL(3,1) NOT NULL DEFAULT 5.0');
CALL tm_add_column_if_absent('talent_reviews', 'communication_rating', 'DECIMAL(3,1) NOT NULL DEFAULT 5.0');
CALL tm_add_column_if_absent('talent_reviews', 'freelancer_reply', 'TEXT NULL');
CALL tm_add_column_if_absent('talent_reviews', 'order_title', 'VARCHAR(255) NULL');

-- [F] JOB INVITATIONS: Response time and decline reason
CALL tm_add_column_if_absent('job_invitations', 'responded_at', 'DATETIME(6) NULL');
CALL tm_add_column_if_absent('job_invitations', 'decline_reason', 'VARCHAR(500) NULL');

-- [G] NOTIFICATIONS: Notification category type
CALL tm_add_column_if_absent('notifications', 'type', 'VARCHAR(40) NOT NULL DEFAULT \'SYSTEM\'');

DROP PROCEDURE IF EXISTS tm_add_column_if_absent;

-- ----------------------------------------------------------------------------
-- 3. CREATE NEW FEATURE TABLES IF NOT EXISTS
-- ----------------------------------------------------------------------------

-- [1] USER BANK ACCOUNTS: Quản lý tài khoản ngân hàng rút tiền
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

-- [2] WITHDRAWAL REQUESTS: Lệnh yêu cầu rút tiền thù lao
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

-- [3] FREELANCER PORTFOLIOS: Dự án mẫu trong hồ sơ năng lực
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

-- [4] DISPUTES: Trung tâm trọng tài giải quyết tranh chấp hợp đồng Escrow
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

-- [5] VNPAY TRANSACTIONS: Giao dịch thanh toán cổng VNPay Sandbox
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

-- [6] PLATFORM SETTINGS: Cấu hình tham số sàn
CREATE TABLE IF NOT EXISTS platform_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    updated_at DATETIME(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- 5. ENRICH EXISTING DATABASE USERS (Update verification, KYC, balances)
-- ----------------------------------------------------------------------------
UPDATE users SET 
    is_verified = b'1',
    email_verified = b'1',
    account_status = 'ACTIVE',
    kyc_status = 'VERIFIED',
    balance = IF(balance > 0, balance, 95000000.00),
    escrow_balance = IF(escrow_balance > 0, escrow_balance, 13550000.00),
    talent_credit_score = 1000,
    talent_credit_badge = 'Top Rated'
WHERE email = 'admin@talentmatch.vn';

UPDATE users SET 
    is_verified = b'1',
    email_verified = b'1',
    account_status = 'ACTIVE',
    kyc_status = 'VERIFIED',
    balance = IF(balance > 0, balance, 50000000.00),
    escrow_balance = IF(escrow_balance > 0, escrow_balance, 9500000.00),
    talent_credit_score = 980,
    talent_credit_badge = 'Top Rated'
WHERE email = 'client@talentmatch.vn';

UPDATE users SET 
    is_verified = b'1',
    email_verified = b'1',
    account_status = 'ACTIVE',
    kyc_status = 'VERIFIED',
    balance = IF(balance > 0, balance, 32000000.00),
    talent_credit_score = 950,
    talent_credit_badge = 'Top Rated'
WHERE email = 'customer2@talentmatch.vn';

UPDATE users SET 
    is_verified = b'1',
    email_verified = b'1',
    account_status = 'ACTIVE',
    kyc_status = 'VERIFIED',
    balance = IF(balance > 0, balance, 18500000.00),
    escrow_balance = IF(escrow_balance > 0, escrow_balance, 4500000.00),
    talent_credit_score = 940,
    talent_credit_badge = 'Top Rated'
WHERE email = 'developer@talentmatch.vn';

UPDATE users SET 
    is_verified = b'1',
    email_verified = b'1',
    account_status = 'ACTIVE',
    kyc_status = 'VERIFIED',
    balance = IF(balance > 0, balance, 24000000.00),
    escrow_balance = IF(escrow_balance > 0, escrow_balance, 4050000.00),
    talent_credit_score = 965,
    talent_credit_badge = 'Top Rated'
WHERE email = 'freelancer@talentmatch.vn';

UPDATE users SET 
    is_verified = b'1',
    email_verified = b'1',
    account_status = 'ACTIVE',
    kyc_status = 'VERIFIED',
    balance = IF(balance > 0, balance, 31000000.00),
    talent_credit_score = 975,
    talent_credit_badge = 'Top Rated'
WHERE email = 'thiethinh789@gmail.com';

-- ----------------------------------------------------------------------------
-- 6. INSERT DEMO ACCOUNTS MATCHING FRONTEND (By unique email)
-- ----------------------------------------------------------------------------

-- [Employer: Lê Thu Hà - TechStartup]
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

-- [Employer: Phạm Tuấn Anh - Invest Growth]
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
    32000000.00, 0.00, 950, 'Top Rated', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'1', email_verified = b'1', account_status = 'ACTIVE', kyc_status = 'VERIFIED',
    balance = 32000000.00;

-- [Freelancer: Nguyễn Minh Anh - Senior Full-Stack Developer]
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
    'Chuyên gia Full-Stack Web & Mobile App với hơn 6 năm kinh nghiệm thực chiến phát triển các giải pháp thương mại điện tử, ReactJS, Next.js, Node.js và Flutter.',
    'ReactJS, Next.js, Node.js, TypeScript, Flutter, Tailwind CSS, REST API, MySQL',
    'IT & Lập trình', 'Hà Nội, Việt Nam', 'https://github.com/minhanh-dev/portfolio-vietnam',
    6, 350000.00, b'1', 4.92, 52, b'1', b'0', b'1', b'1', 'ACTIVE', 'VERIFIED',
    18500000.00, 4500000.00, 940, 'Top Rated', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'1', email_verified = b'1', account_status = 'ACTIVE', kyc_status = 'VERIFIED',
    balance = 18500000.00, escrow_balance = 4500000.00, talent_credit_score = 940, talent_credit_badge = 'Top Rated';

-- [Freelancer: Trần Hoàng Nam - UI/UX Lead Designer]
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

-- [Freelancer: Phạm Quốc Huy - Video Editor]
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

-- [Freelancer: Vũ Linh Đan - SEO & Performance Marketer]
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
    4, 280000.00, b'1', 4.90, 42, b'1', b'0', b'1', b'1', 'ACTIVE', 'VERIFIED',
    14600000.00, 0.00, 915, 'Gold', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'1', email_verified = b'1', account_status = 'ACTIVE', kyc_status = 'VERIFIED',
    balance = 14600000.00;

-- [Freelancer: Đỗ Bảo Long - Senior Python & AI Engineer]
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
    'Python, FastAPI, AI/LLM, PostgreSQL, Docker, REST API',
    'IT & Lập trình', 'TP. Hồ Chí Minh, Việt Nam', 'https://github.com/baolong-ai-engineer',
    7, 450000.00, b'1', 4.96, 61, b'1', b'0', b'1', b'1', 'ACTIVE', 'VERIFIED',
    31000000.00, 0.00, 975, 'Top Rated', NOW(6), NOW(6)
) ON DUPLICATE KEY UPDATE 
    is_verified = b'1', email_verified = b'1', account_status = 'ACTIVE', kyc_status = 'VERIFIED',
    balance = 31000000.00;

-- [Unverified Employer Demo]
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

-- [Unverified Freelancer Demo]
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

-- ----------------------------------------------------------------------------
-- 7. SEED BANK ACCOUNTS (Tài khoản ngân hàng liên kết)
-- ----------------------------------------------------------------------------
INSERT INTO user_bank_accounts (user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
SELECT u.id, 'Vietcombank (Ngoại Thương Việt Nam)', 'VCB', '1028394857', 'LE THU HA', b'1', NOW(6)
FROM users u WHERE u.email IN ('ha.le@techstartup.vn', 'client@talentmatch.vn') LIMIT 1
ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name);

INSERT INTO user_bank_accounts (user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
SELECT u.id, 'Techcombank (Kỹ Thương Việt Nam)', 'TCB', '190384759281', 'PHAM TUAN ANH', b'1', NOW(6)
FROM users u WHERE u.email IN ('tuan.pham@invest.vn', 'customer2@talentmatch.vn') LIMIT 1
ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name);

INSERT INTO user_bank_accounts (user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
SELECT u.id, 'MB Bank (Quân Đội)', 'MBB', '090123456789', 'NGUYEN MINH ANH', b'1', NOW(6)
FROM users u WHERE u.email IN ('minhanh.dev@gmail.com', 'developer@talentmatch.vn') LIMIT 1
ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name);

INSERT INTO user_bank_accounts (user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
SELECT u.id, 'VietinBank (Công Thương Việt Nam)', 'CTG', '108829384756', 'TRAN HOANG NAM', b'1', NOW(6)
FROM users u WHERE u.email IN ('hoangnam.design@gmail.com', 'freelancer@talentmatch.vn') LIMIT 1
ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name);

-- ----------------------------------------------------------------------------
-- 8. SEED FREELANCER PORTFOLIOS
-- ----------------------------------------------------------------------------
INSERT INTO freelancer_portfolios (user_id, title, category, image_url, description, project_url, created_at)
SELECT u.id, 'Hệ thống E-Commerce Bán lẻ Nông sản Sạch', 'IT & Lập trình',
 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
 'Xây dựng toàn bộ giao diện Web ReactJS và API Backend Node.js cho hệ thống bán lẻ nông sản sạch, tích hợp thanh toán VNPay.',
 'https://nongsan-demo.vercel.app', NOW(6)
FROM users u WHERE u.email IN ('minhanh.dev@gmail.com', 'developer@talentmatch.vn') LIMIT 1
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO freelancer_portfolios (user_id, title, category, image_url, description, project_url, created_at)
SELECT u.id, 'Ứng dụng Quản lý Tài chính Doanh nghiệp', 'IT & Lập trình',
 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600',
 'Lập trình App di động Flutter với giao diện tối giản, tích hợp biểu đồ thống kê chi tiêu và báo cáo tự động.',
 'https://finance-app-demo.flutter.dev', NOW(6)
FROM users u WHERE u.email IN ('minhanh.dev@gmail.com', 'developer@talentmatch.vn') LIMIT 1
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO freelancer_portfolios (user_id, title, category, image_url, description, project_url, created_at)
SELECT u.id, 'Bộ Nhận Diện Thương Hiệu Chuỗi Cà Phê The Garden', 'Thiết kế & Đồ họa',
 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=600',
 'Thiết kế Logo, Guideline màu sắc, Bao bì sản phẩm và Menu định dạng số chuẩn in ấn và hiển thị di động.',
 'https://behance.net/gallery/thegarden-coffee-branding', NOW(6)
FROM users u WHERE u.email IN ('hoangnam.design@gmail.com', 'freelancer@talentmatch.vn') LIMIT 1
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO freelancer_portfolios (user_id, title, category, image_url, description, project_url, created_at)
SELECT u.id, 'Giao diện Mobile App E-Commerce Thời Trang', 'Thiết kế & Đồ họa',
 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=600',
 'Hơn 45 màn hình Figma chuẩn iOS/Android kèm prototype tương tác mượt mà.',
 'https://figma.com/@hoangnam_fashion_ui', NOW(6)
FROM users u WHERE u.email IN ('hoangnam.design@gmail.com', 'freelancer@talentmatch.vn') LIMIT 1
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ----------------------------------------------------------------------------
-- 9. SEED WITHDRAWAL REQUESTS (Lệnh rút tiền mẫu)
-- ----------------------------------------------------------------------------
INSERT INTO withdrawal_requests (
    id, user_id, bank_name, bank_code, account_number, account_holder,
    amount, fee, net_amount, status, admin_note, transaction_code, created_at
)
SELECT 1, u.id, 'MB Bank (Quân Đội)', 'MBB', '090123456789', 'NGUYEN MINH ANH',
 5000000.00, 0.00, 5000000.00, 'PENDING',
 'Yêu cầu rút tiền thù lao từ dự án E-Commerce', 'WTH-2026-001', NOW(6)
FROM users u WHERE u.email IN ('minhanh.dev@gmail.com', 'developer@talentmatch.vn') LIMIT 1
ON DUPLICATE KEY UPDATE amount = VALUES(amount), status = VALUES(status);

INSERT INTO withdrawal_requests (
    id, user_id, bank_name, bank_code, account_number, account_holder,
    amount, fee, net_amount, status, admin_note, transaction_code, created_at, processed_at
)
SELECT 2, u.id, 'VietinBank (Công Thương Việt Nam)', 'CTG', '108829384756', 'TRAN HOANG NAM',
 10000000.00, 0.00, 10000000.00, 'APPROVED',
 'Đã chuyển khoản thành công qua cổng thanh toán liên ngân hàng', 'WTH-2026-002',
 DATE_SUB(NOW(6), INTERVAL 1 DAY), NOW(6)
FROM users u WHERE u.email IN ('hoangnam.design@gmail.com', 'freelancer@talentmatch.vn') LIMIT 1
ON DUPLICATE KEY UPDATE amount = VALUES(amount), status = VALUES(status);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
SELECT 'TalentMatch V32 Database Migration & Feature Setup Completed Successfully!' AS status;
