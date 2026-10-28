const fs = require('fs');
const path = require('path');

// Extract all data from mockData.ts
let code = fs.readFileSync(path.join(__dirname, '../frontend/src/data/mockData.ts'), 'utf8')
  .replace(/:\s*User\[\]/g, '').replace(/:\s*User/g, '').replace(/:\s*FreelancerProfile\[\]/g, '')
  .replace(/:\s*Project\[\]/g, '').replace(/:\s*Proposal\[\]/g, '').replace(/:\s*Order\[\]/g, '')
  .replace(/:\s*Review\[\]/g, '').replace(/:\s*Dispute\[\]/g, '').replace(/:\s*VNPayTransaction\[\]/g, '')
  .replace(/:\s*AppNotification\[\]/g, '').replace(/:\s*ProjectInvitation\[\]/g, '')
  .replace(/import type[\s\S]*?from '\.\.\/types';/g, '').replace(/export /g, '');

const mock = new Function(code + '; return { GUEST_USER, INITIAL_USERS, FREELANCERS, PROJECTS, PROPOSALS, INITIAL_ORDERS, INITIAL_REVIEWS, INITIAL_DISPUTES, INITIAL_VNPAY_TRANSACTIONS, INITIAL_NOTIFICATIONS, INITIAL_INVITATIONS };')();

function esc(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
}

function num(n, def = 0) {
  if (n === null || n === undefined || isNaN(n)) return def;
  return Number(n);
}

function bit(b) {
  return b ? "b'1'" : "b'0'";
}

function dt(val) {
  if (!val) return 'NOW(6)';
  if (val.includes(' ')) return `'${val}'`;
  return `'${val} 08:00:00'`;
}

// User ID mapping:
// 1: admin@talentmatch.vn
// 2: ha.le@techstartup.vn (usr-emp-1)
// 3: tuan.pham@invest.vn (usr-emp-2)
// 4: lan.nguyen@edusparks.edu.vn (usr-emp-3)
// 5: hoang.tran@foodies.vn (usr-emp-4)
// 6: mai.dang@fashionhouse.vn (usr-emp-5)
// 7: yen.hoang.demo@gmail.com (usr-unverified-emp)
// 8: minhanh.dev@gmail.com (usr-free-1 / free-1)
// 9: hoangnam.design@gmail.com (usr-free-2 / free-2)
// 10: huy.media@gmail.com (usr-free-3 / free-3)
// 11: linhdan.marketing@gmail.com (usr-free-4 / free-4)
// 12: baolong.ai@gmail.com (usr-free-5 / free-5)
// 13: thanh.writer@gmail.com (usr-free-6 / free-6)
// 14: duc.architect@gmail.com (usr-free-7 / free-7)
// 15: thu.translator@gmail.com (usr-free-8 / free-8)
// 16: quang.fin@gmail.com (usr-free-9 / free-9)
// 17: ngoc.game3d@gmail.com (usr-free-10 / free-10)
// 18: ducminh.demo@gmail.com (usr-unverified-free)
// 19: banned.user@gmail.com (usr-banned)

const emailToId = {
  'admin@talentmatch.vn': 1,
  'ha.le@techstartup.vn': 2,
  'tuan.pham@invest.vn': 3,
  'lan.nguyen@edusparks.edu.vn': 4,
  'hoang.tran@foodies.vn': 5,
  'mai.dang@fashionhouse.vn': 6,
  'yen.hoang.demo@gmail.com': 7,
  'minhanh.dev@gmail.com': 8,
  'hoangnam.design@gmail.com': 9,
  'huy.media@gmail.com': 10,
  'linhdan.marketing@gmail.com': 11,
  'baolong.ai@gmail.com': 12,
  'thanh.writer@gmail.com': 13,
  'duc.architect@gmail.com': 14,
  'thu.translator@gmail.com': 15,
  'quang.fin@gmail.com': 16,
  'ngoc.game3d@gmail.com': 17,
  'ducminh.demo@gmail.com': 18,
  'banned.user@gmail.com': 19
};

const stringIdToDbId = {
  'usr-admin': 1,
  'usr-emp-1': 2,
  'usr-emp-2': 3,
  'usr-emp-3': 4,
  'usr-emp-4': 5,
  'usr-emp-5': 6,
  'usr-unverified-emp': 7,
  'usr-free-1': 8,
  'free-1': 8,
  'usr-free-2': 9,
  'free-2': 9,
  'usr-free-3': 10,
  'free-3': 10,
  'usr-free-4': 11,
  'free-4': 11,
  'usr-free-5': 12,
  'free-5': 12,
  'usr-free-6': 13,
  'free-6': 13,
  'usr-free-7': 14,
  'free-7': 14,
  'usr-free-8': 15,
  'free-8': 15,
  'usr-free-9': 16,
  'free-9': 16,
  'usr-free-10': 17,
  'free-10': 17,
  'usr-unverified-free': 18,
  'usr-banned': 19
};

function resolveUserId(idOrEmail) {
  if (!idOrEmail) return 1;
  if (emailToId[idOrEmail]) return emailToId[idOrEmail];
  if (stringIdToDbId[idOrEmail]) return stringIdToDbId[idOrEmail];
  const num = parseInt(idOrEmail.replace(/\D/g, ''), 10);
  return isNaN(num) ? 1 : num;
}

let sql = `-- ============================================================================
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
`;

const usersSeed = [
  // 1: Admin
  {
    id: 1, full_name: 'Quản Trị Viên TalentMatch', email: 'admin@talentmatch.vn', role: 'ADMIN',
    phone: '0901888999', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=admin',
    professional_title: 'Hệ Thống Trọng Tài & Quản Trị TalentMatch',
    bio: 'Ban Quản Trị Hệ Thống TalentMatch Việt Nam - Chuyên xử lý khiếu nại, đối soát Escrow và duyệt định danh eKYC.',
    field: 'Quản Trị Hệ Thống', location: 'Tòa nhà TalentMatch, Cầu Giấy, Hà Nội',
    experience_years: 10, hourly_rate: 0, balance: 95000000, escrow_balance: 0,
    talent_credit_score: 999, talent_credit_badge: 'Top Rated', rating: 5.0, completed_projects: 100,
    enabled: 1, locked: 0, is_verified: 1, email_verified: 1, account_status: 'ACTIVE', kyc_status: 'VERIFIED'
  },
  // 2: Lê Thu Hà
  {
    id: 2, full_name: 'Lê Thu Hà', email: 'ha.le@techstartup.vn', role: 'CUSTOMER',
    phone: '0987654321', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
    company_name: 'Công ty Cổ phần TechStartup Việt Nam', company_size: '20-50', contact_name: 'Lê Thu Hà', tax_code: '0101234567',
    field: 'Công nghệ & Phần mềm', location: 'Quận 1, TP. Hồ Chí Minh', website: 'https://techstartup.vn',
    bio: 'TechStartup Việt Nam là đơn vị tiên phong cung cấp giải pháp chuyển đổi số toàn diện cho chuỗi bán lẻ và logistics.',
    experience_years: 8, hourly_rate: 0, balance: 50000000, escrow_balance: 9500000,
    talent_credit_score: 920, talent_credit_badge: 'Top Rated', rating: 4.95, completed_projects: 34,
    enabled: 1, locked: 0, is_verified: 1, email_verified: 1, account_status: 'ACTIVE', kyc_status: 'VERIFIED'
  },
  // 3: Phạm Tuấn Anh
  {
    id: 3, full_name: 'Phạm Tuấn Anh', email: 'tuan.pham@invest.vn', role: 'CUSTOMER',
    phone: '0903332211', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-tuan-anh',
    company_name: 'Invest Growth Vietnam', company_size: '50-100', contact_name: 'Phạm Tuấn Anh', tax_code: '0319876543',
    field: 'Tài chính & Đầu tư', location: 'Quận Cầu Giấy, Hà Nội', website: 'https://investgrowth.vn',
    bio: 'Quỹ tư vấn đầu tư và tái cấu trúc thương hiệu doanh nghiệp vừa và nhỏ.',
    experience_years: 12, hourly_rate: 0, balance: 32000000, escrow_balance: 0,
    talent_credit_score: 890, talent_credit_badge: 'Gold', rating: 4.88, completed_projects: 18,
    enabled: 1, locked: 0, is_verified: 1, email_verified: 1, account_status: 'ACTIVE', kyc_status: 'VERIFIED'
  },
  // 4: Nguyễn Mai Lan
  {
    id: 4, full_name: 'Nguyễn Mai Lan', email: 'lan.nguyen@edusparks.edu.vn', role: 'CUSTOMER',
    phone: '0912445566', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=nguyen-mai-lan',
    company_name: 'Học Viện Công Nghệ Giáo Dục EduSparks', company_size: '10-25', contact_name: 'Nguyễn Mai Lan', tax_code: '0108765432',
    field: 'EdTech & Đào tạo', location: 'Quận Ba Đình, Hà Nội', website: 'https://edusparks.edu.vn',
    bio: 'Hệ thống đào tạo tiếng Anh và kỹ năng lập trình trực tuyến cho học sinh, sinh viên.',
    experience_years: 7, hourly_rate: 0, balance: 28000000, escrow_balance: 0,
    talent_credit_score: 880, talent_credit_badge: 'Silver', rating: 4.85, completed_projects: 12,
    enabled: 1, locked: 0, is_verified: 1, email_verified: 1, account_status: 'ACTIVE', kyc_status: 'VERIFIED'
  },
  // 5: Trần Việt Hoàng
  {
    id: 5, full_name: 'Trần Việt Hoàng', email: 'hoang.tran@foodies.vn', role: 'CUSTOMER',
    phone: '0978990011', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=tran-viet-hoang',
    company_name: 'Chuỗi Nhà Hàng Chay Foodies Delight', company_size: '50-100', contact_name: 'Trần Việt Hoàng', tax_code: '0315556677',
    field: 'Ẩm thực & Nhà hàng', location: 'Quận 3, TP. Hồ Chí Minh', website: 'https://foodiesdelight.vn',
    bio: 'Chuỗi 12 nhà hàng ẩm thực chay thanh tịnh tại TP.HCM và Đà Nẵng, cần tuyển chuyên gia thiết kế và truyền thông.',
    experience_years: 9, hourly_rate: 0, balance: 45000000, escrow_balance: 5500000,
    talent_credit_score: 910, talent_credit_badge: 'Top Rated', rating: 4.90, completed_projects: 22,
    enabled: 1, locked: 0, is_verified: 1, email_verified: 1, account_status: 'ACTIVE', kyc_status: 'VERIFIED'
  },
  // 6: Đặng Ngọc Mai
  {
    id: 6, full_name: 'Đặng Ngọc Mai', email: 'mai.dang@fashionhouse.vn', role: 'CUSTOMER',
    phone: '0934112233', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=dang-ngoc-mai',
    company_name: 'Thời Trang Nữ Thiết Kế Bella Mode', company_size: '20-50', contact_name: 'Đặng Ngọc Mai', tax_code: '0109988776',
    field: 'Thời trang & Bán lẻ', location: 'Quận Đống Đa, Hà Nội', website: 'https://bellamode.vn',
    bio: 'Thương hiệu thời trang công sở cao cấp, cần hợp tác Freelancer dựng video TikTok, quản trị ads và viết bài chuẩn SEO.',
    experience_years: 6, hourly_rate: 0, balance: 19500000, escrow_balance: 0,
    talent_credit_score: 875, talent_credit_badge: 'Silver', rating: 4.82, completed_projects: 15,
    enabled: 1, locked: 0, is_verified: 1, email_verified: 1, account_status: 'ACTIVE', kyc_status: 'VERIFIED'
  },
  // 7: Hoàng Thị Yến (Unverified Employer)
  {
    id: 7, full_name: 'Hoàng Thị Yến', email: 'yen.hoang.demo@gmail.com', role: 'CUSTOMER',
    phone: '0945667788', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=hoang-thi-yen',
    company_name: 'Yen Fashion Boutique', company_size: '1-10', contact_name: 'Hoàng Thị Yến', tax_code: '0310001122',
    field: 'Bán lẻ & Phụ kiện', location: 'Hải Phòng',
    bio: 'Tài khoản thử nghiệm kiểm duyệt OTP và chặn đăng dự án khi chưa kích hoạt email.',
    experience_years: 2, hourly_rate: 0, balance: 0, escrow_balance: 0,
    talent_credit_score: 600, talent_credit_badge: 'Bronze', rating: 5.0, completed_projects: 0,
    enabled: 1, locked: 0, is_verified: 0, email_verified: 0, account_status: 'PENDING', kyc_status: 'NOT_SUBMITTED'
  },
  // 8: Nguyễn Minh Anh (Freelancer Full-Stack)
  {
    id: 8, full_name: 'Nguyễn Minh Anh', email: 'minhanh.dev@gmail.com', role: 'FREELANCER',
    phone: '0912345678', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=nguyen-minh-anh',
    professional_title: 'Senior Full-Stack & Mobile Developer',
    skills: 'Flutter, React Native, Node.js, Spring Boot, MySQL, MongoDB, AWS, Docker',
    field: 'Lập trình & CNTT', location: 'Quận Cầu Giấy, Hà Nội', website: 'https://github.com/minhanh-dev',
    bio: '6+ năm kinh nghiệm phát triển Mobile Flutter và Full-Stack Web App. Đã hoàn thành hơn 50 dự án cho các doanh nghiệp trong và ngoài nước.',
    experience_years: 6, hourly_rate: 350000, balance: 18500000, escrow_balance: 0,
    talent_credit_score: 960, talent_credit_badge: 'Top Rated', rating: 4.95, completed_projects: 52,
    enabled: 1, locked: 0, is_verified: 1, email_verified: 1, account_status: 'ACTIVE', kyc_status: 'VERIFIED'
  },
  // 9: Trần Hoàng Nam (Freelancer UI/UX)
  {
    id: 9, full_name: 'Trần Hoàng Nam', email: 'hoangnam.design@gmail.com', role: 'FREELANCER',
    phone: '0908776655', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=tran-hoang-nam',
    professional_title: 'Lead UI/UX & Brand Identity Designer',
    skills: 'Figma, Adobe Illustrator, Photoshop, Design System, Branding, Wireframing',
    field: 'Thiết kế & Sáng tạo', location: 'Quận 1, TP. Hồ Chí Minh', website: 'https://behance.net/hoangnam-design',
    bio: 'Chuyên gia thiết kế UI/UX ứng dụng Fintech, E-commerce và hệ thống nhận diện thương hiệu chuyên nghiệp.',
    experience_years: 7, hourly_rate: 300000, balance: 24000000, escrow_balance: 0,
    talent_credit_score: 940, talent_credit_badge: 'Top Rated', rating: 4.92, completed_projects: 46,
    enabled: 1, locked: 0, is_verified: 1, email_verified: 1, account_status: 'ACTIVE', kyc_status: 'VERIFIED'
  },
  // 10: Phạm Quốc Huy (Freelancer Video)
  {
    id: 10, full_name: 'Phạm Quốc Huy', email: 'huy.media@gmail.com', role: 'FREELANCER',
    phone: '0981223344', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-quoc-huy',
    professional_title: 'Senior Motion Graphic & Video Editor',
    skills: 'Premiere Pro, After Effects, CapCut Pro, DaVinci Resolve, TikTok Ads, Motion Design',
    field: 'Video & Truyền thông', location: 'Quận Thanh Xuân, Hà Nội', website: 'https://youtube.com/@huy-media-pro',
    bio: 'Chuyên dựng video ngắn triệu view TikTok Ads, Reels, Trailer 3D và TVC quảng cáo sản phẩm cho nhãn hàng.',
    experience_years: 5, hourly_rate: 220000, balance: 8200000, escrow_balance: 0,
    talent_credit_score: 870, talent_credit_badge: 'Silver', rating: 4.80, completed_projects: 38,
    enabled: 1, locked: 0, is_verified: 1, email_verified: 1, account_status: 'ACTIVE', kyc_status: 'VERIFIED'
  },
  // 11: Vũ Linh Đan (Freelancer Marketing)
  {
    id: 11, full_name: 'Vũ Linh Đan', email: 'linhdan.marketing@gmail.com', role: 'FREELANCER',
    phone: '0972334455', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=vu-linh-dan',
    professional_title: 'Growth Marketing & SEO Expert',
    skills: 'Google Ads, Meta Ads, Technical SEO, Google Analytics 4, Content Strategy, CRO',
    field: 'Marketing & Bán hàng', location: 'Quận Bình Thạnh, TP. Hồ Chí Minh', website: 'https://linhdan-growth.vn',
    bio: 'Đã tối ưu chiến dịch quảng cáo và đẩy hơn 120 từ khóa khó lên Top 1 Google cho các dự án thương mại điện tử.',
    experience_years: 5, hourly_rate: 250000, balance: 14600000, escrow_balance: 0,
    talent_credit_score: 890, talent_credit_badge: 'Gold', rating: 4.88, completed_projects: 41,
    enabled: 1, locked: 0, is_verified: 1, email_verified: 1, account_status: 'ACTIVE', kyc_status: 'VERIFIED'
  },
  // 12: Đỗ Bảo Long (Freelancer AI/LLM)
  {
    id: 12, full_name: 'Đỗ Bảo Long', email: 'baolong.ai@gmail.com', role: 'FREELANCER',
    phone: '0966778899', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=do-bao-long',
    professional_title: 'Senior AI & LLM Integration Engineer',
    skills: 'Python, PyTorch, LangChain, OpenAI API, Vector DB, RAG Chatbot, FastAPI, HuggingFace',
    field: 'Trí tuệ nhân tạo & AI', location: 'Quận Cầu Giấy, Hà Nội', website: 'https://huggingface.co/baolong-ai',
    bio: 'Chuyên gia tích hợp mô hình ngôn ngữ lớn LLM, xây dựng hệ thống chatbot hỗ trợ khách hàng tự động và phân tích dữ liệu.',
    experience_years: 6, hourly_rate: 450000, balance: 31000000, escrow_balance: 0,
    talent_credit_score: 955, talent_credit_badge: 'Top Rated', rating: 4.96, completed_projects: 35,
    enabled: 1, locked: 0, is_verified: 1, email_verified: 1, account_status: 'ACTIVE', kyc_status: 'VERIFIED'
  },
  // 13: Ngô Phương Thanh (Freelancer Content)
  {
    id: 13, full_name: 'Ngô Phương Thanh', email: 'thanh.writer@gmail.com', role: 'FREELANCER',
    phone: '0919223344', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=ngo-phuong-thanh',
    professional_title: 'Senior Copywriter & Content Strategist',
    skills: 'SEO Copywriting, Storytelling, PR Articles, Landing Page Copy, Social Media',
    field: 'Viết lách & Nội dung', location: 'Quận Hải Châu, Đà Nẵng', website: 'https://phuongthanh-writer.com',
    bio: 'Cây bút chuyên nghiệp cho các tạp chí kinh doanh và nhãn hàng F&B, thời trang. Văn phong cuốn hút, chuẩn SEO.',
    experience_years: 4, hourly_rate: 180000, balance: 11800000, escrow_balance: 0,
    talent_credit_score: 885, talent_credit_badge: 'Gold', rating: 4.86, completed_projects: 64,
    enabled: 1, locked: 0, is_verified: 1, email_verified: 1, account_status: 'ACTIVE', kyc_status: 'VERIFIED'
  },
  // 14: Bùi Hoàng Đức (Freelancer Kiến trúc)
  {
    id: 14, full_name: 'Bùi Hoàng Đức', email: 'duc.architect@gmail.com', role: 'FREELANCER',
    phone: '0905112233', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=bui-hoang-duc',
    professional_title: 'Kiến Trúc Sư 3D Nội Thất & Revit BIM',
    skills: '3ds Max, Corona Renderer, SketchUp, Revit BIM, AutoCAD, Lumion',
    field: 'Kỹ thuật & Kiến trúc', location: 'Quận 7, TP. Hồ Chí Minh', website: 'https://duc-architect.vn',
    bio: '8 năm kinh nghiệm thiết kế kiến trúc biệt thự, căn hộ cao cấp và không gian quán cafe, nhà hàng phong cách hiện đại.',
    experience_years: 8, hourly_rate: 320000, balance: 22400000, escrow_balance: 0,
    talent_credit_score: 935, talent_credit_badge: 'Top Rated', rating: 4.91, completed_projects: 29,
    enabled: 1, locked: 0, is_verified: 1, email_verified: 1, account_status: 'ACTIVE', kyc_status: 'VERIFIED'
  },
  // 15: Trịnh Hoài Thu (Freelancer Dịch thuật)
  {
    id: 15, full_name: 'Trịnh Hoài Thu', email: 'thu.translator@gmail.com', role: 'FREELANCER',
    phone: '0938445566', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=trinh-hoai-thu',
    professional_title: 'Biên - Phiên Dịch Hợp Đồng Song Ngữ Anh - Nhật',
    skills: 'IELTS 8.5, JLPT N1, Pháp lý & Hợp đồng, Bản địa hóa phần mềm, Dịch công chứng',
    field: 'Dịch thuật & Ngoại ngữ', location: 'Quận Hoàn Kiếm, Hà Nội', website: 'https://hoaithu-translate.vn',
    bio: 'Tốt nghiệp ĐH Ngoại Thương, chứng chỉ JLPT N1 và IELTS 8.5. Hơn 7 năm biên dịch tài liệu thương mại và hồ sơ thầu.',
    experience_years: 7, hourly_rate: 280000, balance: 16200000, escrow_balance: 0,
    talent_credit_score: 915, talent_credit_badge: 'Gold', rating: 4.89, completed_projects: 58,
    enabled: 1, locked: 0, is_verified: 1, email_verified: 1, account_status: 'ACTIVE', kyc_status: 'VERIFIED'
  },
  // 16: Lê Minh Quang (Freelancer Kế toán)
  {
    id: 16, full_name: 'Lê Minh Quang', email: 'quang.fin@gmail.com', role: 'FREELANCER',
    phone: '0918778899', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-minh-quang',
    professional_title: 'Kế Toán Trưởng & Tư Vấn Thuế Doanh Nghiệp (CPA)',
    skills: 'Báo Cáo Tài Chính, Quyết Toán Thuế, Soát Xét Sổ Sách, MISA, Fast, Excel VBA',
    field: 'Tài chính & Kế toán', location: 'Quận Tân Bình, TP. Hồ Chí Minh', website: 'https://quang-taxconsulting.vn',
    bio: 'Chứng chỉ hành nghề Kế toán viên công chứng CPA, hỗ trợ quyết toán thuế thành công cho hơn 80 doanh nghiệp SME.',
    experience_years: 11, hourly_rate: 350000, balance: 27500000, escrow_balance: 0,
    talent_credit_score: 945, talent_credit_badge: 'Top Rated', rating: 4.94, completed_projects: 72,
    enabled: 1, locked: 0, is_verified: 1, email_verified: 1, account_status: 'ACTIVE', kyc_status: 'VERIFIED'
  },
  // 17: Đoàn Bảo Ngọc (Freelancer 3D Game)
  {
    id: 17, full_name: 'Đoàn Bảo Ngọc', email: 'ngoc.game3d@gmail.com', role: 'FREELANCER',
    phone: '0977889900', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=doan-bao-ngoc',
    professional_title: '3D Character Artist & Unreal Engine Specialist',
    skills: 'Blender, ZBrush, Substance Painter, Unreal Engine 5, Maya, Rigging',
    field: 'Thiết kế & Sáng tạo', location: 'Quận Tây Hồ, Hà Nội', website: 'https://artstation.com/baongoc3d',
    bio: 'Chuyên tạo hình nhân vật game 3D AAA, mô hình hóa vũ khí và bối cảnh chân thực cho các studio game quốc tế.',
    experience_years: 5, hourly_rate: 270000, balance: 13500000, escrow_balance: 0,
    talent_credit_score: 895, talent_credit_badge: 'Gold', rating: 4.87, completed_projects: 31,
    enabled: 1, locked: 0, is_verified: 1, email_verified: 1, account_status: 'ACTIVE', kyc_status: 'VERIFIED'
  },
  // 18: Phạm Đức Minh (Unverified Freelancer)
  {
    id: 18, full_name: 'Phạm Đức Minh', email: 'ducminh.demo@gmail.com', role: 'FREELANCER',
    phone: '0988001122', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-duc-minh',
    professional_title: 'Junior Web Developer (Chờ Kích Hoạt OTP)',
    skills: 'HTML, CSS, JavaScript, React',
    field: 'Lập trình & CNTT', location: 'Nam Định',
    bio: 'Tài khoản thử nghiệm chức năng kiểm soát OTP và popup chặn nộp báo giá dự án khi chưa kích hoạt email.',
    experience_years: 1, hourly_rate: 150000, balance: 0, escrow_balance: 0,
    talent_credit_score: 550, talent_credit_badge: 'Bronze', rating: 5.0, completed_projects: 0,
    enabled: 1, locked: 0, is_verified: 0, email_verified: 0, account_status: 'PENDING', kyc_status: 'NOT_SUBMITTED'
  },
  // 19: Nguyễn Văn Vi Phạm (Banned)
  {
    id: 19, full_name: 'Nguyễn Văn Vi Phạm', email: 'banned.user@gmail.com', role: 'FREELANCER',
    phone: '0911000999', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=banned-user',
    professional_title: 'Tài Khoản Đang Bị Tạm Khóa Vi Phạm Chính Sách',
    skills: 'Spam, Vi Phạm Điều Khoản',
    field: 'Khác', location: 'Việt Nam',
    bio: 'Tài khoản này đã bị khóa do cố tình giao dịch ngoài sàn và vi phạm điều khoản bảo mật của TalentMatch.',
    experience_years: 0, hourly_rate: 0, balance: 0, escrow_balance: 0,
    talent_credit_score: 200, talent_credit_badge: 'Bronze', rating: 1.0, completed_projects: 0,
    enabled: 0, locked: 1, is_verified: 0, email_verified: 1, account_status: 'SUSPENDED', kyc_status: 'REJECTED'
  }
];

const pwdHash = '$2a$10$t6KXck5g9MYMc5Yf82m99e4cOUXsq3fwu72Ejw8EqRWE4QzifzWQm';

usersSeed.forEach(u => {
  sql += `INSERT INTO users (
    id, full_name, email, password, role, phone, avatar, professional_title, bio, skills, field, location,
    website, linkedin_url, experience_years, hourly_rate, available, company_name, company_size, contact_name,
    tax_code, rating, completed_projects, talent_credit_balance, enabled, locked, is_verified, email_verified,
    account_status, kyc_status, balance, escrow_balance, talent_credit_score, talent_credit_badge, created_at, updated_at
) VALUES (
    ${u.id}, ${esc(u.full_name)}, ${esc(u.email)}, '${pwdHash}', ${esc(u.role)}, ${esc(u.phone)}, ${esc(u.avatar)},
    ${esc(u.professional_title)}, ${esc(u.bio)}, ${esc(u.skills)}, ${esc(u.field)}, ${esc(u.location)},
    ${esc(u.website)}, NULL, ${num(u.experience_years)}, ${num(u.hourly_rate)}, b'1',
    ${esc(u.company_name)}, ${esc(u.company_size)}, ${esc(u.contact_name)}, ${esc(u.tax_code)},
    ${num(u.rating, 5.0)}, ${num(u.completed_projects, 0)}, ${num(u.talent_credit_score, 850)},
    ${bit(u.enabled)}, ${bit(u.locked)}, ${bit(u.is_verified)}, ${bit(u.email_verified)},
    ${esc(u.account_status)}, ${esc(u.kyc_status)}, ${num(u.balance)}, ${num(u.escrow_balance)},
    ${num(u.talent_credit_score)}, ${esc(u.talent_credit_badge)}, NOW(6), NOW(6)
);\n`;
});

sql += `\n-- ----------------------------------------------------------------------------
-- 5. SEED USER BANK ACCOUNTS (Tài khoản ngân hàng liên kết)
-- ----------------------------------------------------------------------------\n`;

const bankAccountsSeed = [
  { user_id: 1, bank_name: 'Vietcombank (Ngoại Thương Việt Nam)', bank_code: 'VCB', account_number: '998877665544', account_holder: 'CONG TY TALENTMATCH VIETNAM', is_default: 1 },
  { user_id: 2, bank_name: 'Vietcombank (Ngoại Thương Việt Nam)', bank_code: 'VCB', account_number: '1028394857', account_holder: 'LE THU HA', is_default: 1 },
  { user_id: 2, bank_name: 'Techcombank (Kỹ Thương Việt Nam)', bank_code: 'TCB', account_number: '19038475869012', account_holder: 'LE THU HA', is_default: 0 },
  { user_id: 3, bank_name: 'MBBank (Quân Đội)', bank_code: 'MBB', account_number: '088899988899', account_holder: 'PHAM TUAN ANH', is_default: 1 },
  { user_id: 4, bank_name: 'ACB (Á Châu)', bank_code: 'ACB', account_number: '284759601', account_holder: 'NGUYEN MAI LAN', is_default: 1 },
  { user_id: 5, bank_name: 'VietinBank (Công Thương Việt Nam)', bank_code: 'CTG', account_number: '103847586920', account_holder: 'TRAN VIET HOANG', is_default: 1 },
  { user_id: 6, bank_name: 'VPBank (Việt Nam Thịnh Vượng)', bank_code: 'VPB', account_number: '88392019485', account_holder: 'DANG NGOC MAI', is_default: 1 },
  { user_id: 8, bank_name: 'Vietcombank (Ngoại Thương Việt Nam)', bank_code: 'VCB', account_number: '0011004567890', account_holder: 'NGUYEN MINH ANH', is_default: 1 },
  { user_id: 8, bank_name: 'MBBank (Quân Đội)', bank_code: 'MBB', account_number: '0912345678', account_holder: 'NGUYEN MINH ANH', is_default: 0 },
  { user_id: 9, bank_name: 'VietinBank (Công Thương Việt Nam)', bank_code: 'CTG', account_number: '108829384756', account_holder: 'TRAN HOANG NAM', is_default: 1 },
  { user_id: 10, bank_name: 'Techcombank (Kỹ Thương Việt Nam)', bank_code: 'TCB', account_number: '19034567891011', account_holder: 'PHAM QUOC HUY', is_default: 1 },
  { user_id: 11, bank_name: 'VPBank (Việt Nam Thịnh Vượng)', bank_code: 'VPB', account_number: '9988112233', account_holder: 'VU LINH DAN', is_default: 1 },
  { user_id: 12, bank_name: 'MBBank (Quân Đội)', bank_code: 'MBB', account_number: '0966778899', account_holder: 'DO BAO LONG', is_default: 1 },
  { user_id: 13, bank_name: 'ACB (Á Châu)', bank_code: 'ACB', account_number: '5566778899', account_holder: 'NGO PHUONG THANH', is_default: 1 },
  { user_id: 14, bank_name: 'BIDV (Đầu tư & Phát triển)', bank_code: 'BIDV', account_number: '1241000889977', account_holder: 'BUI HOANG DUC', is_default: 1 },
  { user_id: 15, bank_name: 'Vietcombank (Ngoại Thương Việt Nam)', bank_code: 'VCB', account_number: '0451000998877', account_holder: 'TRINH HOAI THU', is_default: 1 },
  { user_id: 16, bank_name: 'Techcombank (Kỹ Thương Việt Nam)', bank_code: 'TCB', account_number: '19028833994455', account_holder: 'LE MINH QUANG', is_default: 1 },
  { user_id: 17, bank_name: 'TPBank (Tiên Phong)', bank_code: 'TPB', account_number: '03889944551', account_holder: 'DOAN BAO NGOC', is_default: 1 }
];

bankAccountsSeed.forEach((b, idx) => {
  sql += `INSERT INTO user_bank_accounts (id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
VALUES (${idx + 1}, ${b.user_id}, ${esc(b.bank_name)}, ${esc(b.bank_code)}, ${esc(b.account_number)}, ${esc(b.account_holder)}, ${bit(b.is_default)}, NOW(6));\n`;
});

sql += `\n-- ----------------------------------------------------------------------------
-- 6. SEED FREELANCER PORTFOLIOS (Hồ sơ năng lực thực tế)
-- ----------------------------------------------------------------------------\n`;

const portfoliosSeed = [
  { user_id: 8, title: 'Ứng dụng Quản lý Chuỗi Bán Lẻ Bách Hóa Flutter', category: 'Lập trình Mobile', image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800', description: 'App Flutter quét mã vạch và đồng bộ đơn hàng tức thì cho chuỗi 20 siêu thị mini.', project_url: 'https://github.com/minhanh-dev/flutter-retail' },
  { user_id: 8, title: 'Nền tảng Sàn TMĐT B2B Nông Sản Sạch Node.js + React', category: 'Full-Stack Web', image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800', description: 'Hệ thống thương mại điện tử đa nhà cung cấp, thanh toán VNPay và quản lý xuất nhập kho.', project_url: 'https://github.com/minhanh-dev/b2b-agritech' },
  { user_id: 9, title: 'Hệ thống Nhận diện Thương hiệu Chuỗi Cafe Minimalist', category: 'Brand Identity', image_url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800', description: 'Thiết kế trọn gói từ logo, menu, bao bì ly mang đi đến bảng hiệu mặt tiền.', project_url: 'https://behance.net/hoangnam-design/minimal-cafe' },
  { user_id: 9, title: 'Thiết kế UI/UX Ứng dụng Quản lý Tài chính & Ví Điện Tử', category: 'Mobile UI/UX', image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800', description: 'Bộ UI Kit Figma 180+ màn hình với hệ thống Design System hoàn chỉnh, hỗ trợ Dark Mode.', project_url: 'https://behance.net/hoangnam-design/fintech-app' },
  { user_id: 10, title: 'Chuỗi 20 Video Ngắn Triệu View TikTok Ads Ngành Mỹ Phẩm', category: 'Video Ads', image_url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=800', description: 'Kịch bản viral, quay dựng chuyên nghiệp tạo chuyển đổi đơn hàng tăng 250% trong tháng.', project_url: 'https://youtube.com/@huy-media-pro' },
  { user_id: 11, title: 'Chiến Dịch SEO Đẩy 50 Từ Khóa Bất Động Sản Lên Top 1', category: 'SEO Tổng Thể', image_url: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?auto=format&fit=crop&q=80&w=800', description: 'Tối ưu Technical SEO Onpage, cấu trúc Silo và xây dựng liên kết tự nhiên đạt 150.000 traffic/tháng.', project_url: 'https://linhdan-growth.vn' },
  { user_id: 12, title: 'Trợ Lý AI RAG Tự Động Phân Tích Tài Liệu Pháp Lý', category: 'AI & Machine Learning', image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800', description: 'Tích hợp mô hình Llama-3 và Vector DB Qdrant trích xuất thông tin hợp đồng chính xác 98%.', project_url: 'https://huggingface.co/baolong-ai/legal-rag' },
  { user_id: 13, title: 'Bộ Bài Viết Chuyên Sâu 100 Kỳ Thương Hiệu & Khởi Nghiệp', category: 'Content Marketing', image_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800', description: 'Chuỗi bài phân tích chiến lược tăng trưởng cho các startup Việt Nam trên diễn đàn kinh doanh.', project_url: 'https://phuongthanh-writer.com' },
  { user_id: 14, title: 'Thiết Kế Phối Cảnh 3D Biệt Thự Nhà Vườn Phong Cách Indochine', category: 'Kiến Trúc & Nội Thất', image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800', description: 'Hồ sơ bản vẽ Revit BIM và render Corona ánh sáng tự nhiên tuyệt đẹp cho khu biệt thự 500m2.', project_url: 'https://duc-architect.vn/indochine-villa' },
  { user_id: 15, title: 'Biên Dịch Trọn Gói 300 Trang Hợp Đồng Chuyển Giao Công Nghệ Nhật', category: 'Biên Dịch Pháp Lý', image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800', description: 'Biên dịch chuẩn xác ngữ nghĩa pháp lý song ngữ Nhật - Việt cho dự án liên doanh vốn ODA.', project_url: 'https://hoaithu-translate.vn' },
  { user_id: 16, title: 'Quyết Toán Thuế & Tái Cấu Trúc Báo Cáo Tài Chính Chuỗi Bán Lẻ', category: 'Tài Chính & Kế Toán', image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800', description: 'Tư vấn tối ưu chi phí thuế hợp pháp tiết kiệm 1.2 tỷ đồng cho doanh nghiệp trong kỳ quyết toán.', project_url: 'https://quang-taxconsulting.vn' },
  { user_id: 17, title: 'Tạo Hình Nhân Vật Chiến Binh 3D Cyberpunk Unreal Engine 5', category: '3D Character Game', image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800', description: 'Model low-poly tối ưu chuyển động, texture 4K Substance Painter sẵn sàng cho gameplay AAA.', project_url: 'https://artstation.com/baongoc3d' }
];

portfoliosSeed.forEach((p, idx) => {
  sql += `INSERT INTO freelancer_portfolios (id, user_id, title, category, image_url, description, project_url, created_at)
VALUES (${idx + 1}, ${p.user_id}, ${esc(p.title)}, ${esc(p.category)}, ${esc(p.image_url)}, ${esc(p.description)}, ${esc(p.project_url)}, NOW(6));\n`;
});

sql += `\n-- ----------------------------------------------------------------------------
-- 7. SEED JOBS (Tuyển dụng việc làm & dự án đầy đủ các lĩnh vực)
-- ----------------------------------------------------------------------------\n`;

mock.PROJECTS.forEach((j, idx) => {
  const jobId = idx + 1;
  const customerId = resolveUserId(j.employerId);
  const skillsStr = Array.isArray(j.requiredSkills) ? j.requiredSkills.join(', ') : (j.requiredSkills || 'Chuyên môn');
  let cat = j.category || 'Lập trình & CNTT';
  if (cat === 'IT & Lập trình') cat = 'Lập trình & CNTT';
  else if (cat === 'Thiết kế & Đồ họa') cat = 'Thiết kế & Sáng tạo';
  else if (cat === 'Digital Marketing') cat = 'Marketing & Bán hàng';

  sql += `INSERT INTO jobs (
    id, title, category, description, required_skills, budget, price_type, budget_type,
    deadline, estimated_duration_days, featured, verified, work_type, experience_level,
    escrow_funded, acceptance_criteria, status, proposals_count, customer_id, created_at, updated_at
) VALUES (
    ${jobId}, ${esc(j.title)}, ${esc(cat)}, ${esc(j.description)}, ${esc(skillsStr)}, ${num(j.budget)},
    ${esc(j.budgetType || 'FIXED')}, ${esc(j.budgetType || 'FIXED')},
    ${j.deadline ? `'${j.deadline}'` : 'DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY)'}, 21,
    ${bit(j.employerVerified || idx < 5)}, b'1', 'REMOTE', 'MIDDLE',
    b'1', 'Sản phẩm bàn giao đúng hạn, đạt tiêu chuẩn kỹ thuật cam kết trong SOW và vượt qua kiểm thử chức năng.',
    ${esc(j.status || 'OPEN')}, ${num(j.proposalsCount, 3)}, ${customerId}, ${dt(j.createdAt)}, NOW(6)
);\n`;
});

sql += `\n-- ----------------------------------------------------------------------------
-- 8. SEED JOB APPLICATIONS (PROPOSALS)
-- ----------------------------------------------------------------------------\n`;

mock.PROPOSALS.forEach((pr, idx) => {
  const appId = idx + 1;
  const jobId = parseInt(pr.projectId.replace(/\D/g, ''), 10) || 1;
  const freelancerId = resolveUserId(pr.freelancerId);
  const status = pr.status === 'ACCEPTED' ? 'ACCEPTED' : (pr.status === 'REJECTED' ? 'REJECTED' : 'SUBMITTED');

  sql += `INSERT INTO job_applications (
    id, job_id, freelancer_id, proposal, proposed_price, estimated_days, portfolio_link, status, created_at, updated_at
) VALUES (
    ${appId}, ${jobId}, ${freelancerId}, ${esc(pr.coverLetter)}, ${num(pr.bidAmount)}, ${num(pr.estimatedDays, 14)},
    ${esc(pr.freelancerPortfolioUrl || 'https://github.com')}, ${esc(status)}, ${dt(pr.createdAt)}, NOW(6)
);\n`;
});

// App 9 for the completed order TM-2026-6621
sql += `INSERT INTO job_applications (
    id, job_id, freelancer_id, proposal, proposed_price, estimated_days, portfolio_link, status, created_at, updated_at
) VALUES (
    9, 3, 9, 'Chào chị Hà, tôi đã hoàn thiện bộ banner quảng cáo đúng kích thước và phong cách chuyên nghiệp.', 3000000, 7,
    'https://behance.net/hoangnam-design', 'ACCEPTED', '2026-09-15 08:00:00', NOW(6)
);\n`;

sql += `\n-- ----------------------------------------------------------------------------
-- 9. SEED PROJECTS (ORDERS / CONTRACTS KÝ QUỸ ESCROW)
-- ----------------------------------------------------------------------------\n`;

// Order 1: ord-101 (TM-2026-8891) - Design Branding
// Application 2 (job 5, freelancer 9, customer 5)
sql += `INSERT INTO projects (
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
);\n`;

// Order 2: ord-102 (TM-2026-7732) - App Mobile Kho Hang
// Application 1 (job 1, freelancer 8, customer 2)
sql += `INSERT INTO projects (
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
);\n`;

// Order 3: ord-100 (TM-2026-6621) - Thiết kế Banner Quảng Cáo (COMPLETED)
// Application 9 (job 3, freelancer 9, customer 2)
sql += `INSERT INTO projects (
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
);\n`;

sql += `\n-- ----------------------------------------------------------------------------
-- 10. SEED MILESTONES (Các giai đoạn thanh toán dự án)
-- ----------------------------------------------------------------------------\n`;

const milestonesSeed = [
  // For project 1:
  { id: 1, project_id: 1, title: 'Giai đoạn 1: Lên Concept & 3 Mẫu Logo Phác Thảo', description: 'Nộp 3 phương án thiết kế phác thảo logo và thuyết minh phong thủy.', amount: 2500000, deadline: '2026-10-02', status: 'PAID' },
  { id: 2, project_id: 1, title: 'Giai đoạn 2: Hoàn Thiện Brand Guideline & Menu Nhà Hàng', description: 'Hoàn thiện file vector, guideline màu sắc, thiết kế menu và biển hiệu.', amount: 3000000, deadline: '2026-10-12', status: 'IN_PROGRESS' },
  // For project 2:
  { id: 3, project_id: 2, title: 'Giai đoạn 1: Thiết Kế UI/UX & Module Đăng Nhập/Quản Lý Kho', description: 'Xây dựng layout ứng dụng Flutter, đăng nhập OTP và giao diện danh mục hàng hóa.', amount: 6000000, deadline: '2026-10-10', status: 'PAID' },
  { id: 4, project_id: 2, title: 'Giai đoạn 2: Tích hợp Quét Mã QR Code & Đồng Bộ REST API', description: 'Chức năng quét mã vạch xuất nhập kho, chụp ảnh hóa đơn và kết nối server.', amount: 8000000, deadline: '2026-10-25', status: 'IN_PROGRESS' },
  // For project 3:
  { id: 5, project_id: 3, title: 'Nghiệm thu toàn bộ Bộ Banner Quảng Cáo GDN & Facebook Ads', description: 'Bàn giao trọn gói 10 banner chuẩn kích thước và source file PSD.', amount: 3000000, deadline: '2026-09-22', status: 'PAID' }
];

milestonesSeed.forEach(m => {
  sql += `INSERT INTO milestones (id, project_id, title, description, amount, deadline, status, created_at, completed_at)
VALUES (${m.id}, ${m.project_id}, ${esc(m.title)}, ${esc(m.description)}, ${m.amount.toFixed(2)}, '${m.deadline}', ${esc(m.status)}, NOW(6), ${m.status === 'PAID' ? 'NOW(6)' : 'NULL'});\n`;
});

sql += `\n-- ----------------------------------------------------------------------------
-- 11. SEED PROJECT DELIVERIES (Bài nộp bàn giao sản phẩm)
-- ----------------------------------------------------------------------------\n`;

const deliveriesSeed = [
  { id: 1, project_id: 1, milestone_id: 1, file_name: 'Foodies_Chay_Logo_Concepts_V1.pdf', file_url: 'https://behance.net/sample-foodies-chay', file_size: '14.2 MB', demo_url: 'https://behance.net/sample-foodies-chay', note: 'Đã gửi 3 concept logo kèm phân tích phong thủy và ý nghĩa màu sắc.', submitted_at: '2026-10-02 15:30:00' },
  { id: 2, project_id: 2, milestone_id: 3, file_name: 'TalentMatch_KhoHang_Demo_v1.0.apk', file_url: 'https://github.com/minhanh-dev/flutter-warehouse/releases/tag/v1.0.0', file_size: '28.5 MB', demo_url: 'https://github.com/minhanh-dev/flutter-warehouse', note: 'Bản build APK thử nghiệm chạy mượt mà trên Android 11+. Có tài liệu hướng dẫn cài đặt đi kèm.', submitted_at: '2026-10-09 17:00:00' },
  { id: 3, project_id: 3, milestone_id: 5, file_name: 'TechStartup_Full_Banner_Kit_Final.zip', file_url: 'https://drive.google.com/drive/folders/sample-banner-kit', file_size: '48.0 MB', demo_url: 'https://drive.google.com/drive/folders/sample-banner-kit', note: 'Toàn bộ 10 kích thước banner GDN và Meta Ads định dạng PSD gốc và PNG độ sắc nét cao.', submitted_at: '2026-09-21 16:30:00' }
];

deliveriesSeed.forEach(d => {
  sql += `INSERT INTO project_deliveries (id, project_id, milestone_id, file_name, file_url, file_size, demo_url, note, submitted_at, created_at)
VALUES (${d.id}, ${d.project_id}, ${d.milestone_id}, ${esc(d.file_name)}, ${esc(d.file_url)}, ${esc(d.file_size)}, ${esc(d.demo_url)}, ${esc(d.note)}, '${d.submitted_at}', '${d.submitted_at}');\n`;
});

sql += `\n-- ----------------------------------------------------------------------------
-- 12. SEED PAYMENTS (Thanh toán & Giải ngân tiền cọc Escrow)
-- ----------------------------------------------------------------------------\n`;

const paymentsSeed = [
  { id: 1, project_id: 1, milestone_id: 1, payer_id: 5, amount: 2500000, method: 'VNPAY_QR', status: 'PAID', transaction_code: 'PAY-2026-8891-MS1', created_at: '2026-09-28 09:10:00', paid_at: '2026-09-28 09:15:00', disbursed_at: '2026-10-03 10:00:00' },
  { id: 2, project_id: 2, milestone_id: 3, payer_id: 2, amount: 6000000, method: 'VNPAY_ATM', status: 'PAID', transaction_code: 'PAY-2026-7732-MS1', created_at: '2026-09-26 14:15:00', paid_at: '2026-09-26 14:20:00', disbursed_at: '2026-10-10 11:00:00' },
  { id: 3, project_id: 3, milestone_id: 5, payer_id: 2, amount: 3000000, method: 'VNPAY_QR', status: 'DISBURSED', transaction_code: 'PAY-2026-6621-FULL', created_at: '2026-09-15 10:15:00', paid_at: '2026-09-15 10:20:00', disbursed_at: '2026-09-22 16:00:00' }
];

paymentsSeed.forEach(p => {
  sql += `INSERT INTO payments (id, project_id, milestone_id, payer_id, amount, method, status, transaction_code, created_at, paid_at, disbursed_at)
VALUES (${p.id}, ${p.project_id}, ${p.milestone_id}, ${p.payer_id}, ${p.amount.toFixed(2)}, ${esc(p.method)}, ${esc(p.status)}, ${esc(p.transaction_code)}, '${p.created_at}', '${p.paid_at}', '${p.disbursed_at}');\n`;
});

sql += `\n-- ----------------------------------------------------------------------------
-- 13. SEED TALENT REVIEWS (Đánh giá đa tiêu chí từ khách hàng)
-- ----------------------------------------------------------------------------\n`;

const reviewsSeed = [
  {
    id: 1, project_id: 3, author_id: 2, target_id: 9, rating: 5, quality_rating: 5.0, deadline_rating: 5.0, communication_rating: 5.0,
    comment: 'Bạn Nam thiết kế bộ banner xuất sắc, nắm bắt nhanh tinh thần thương hiệu và giao việc trước hạn 2 ngày. Rất ấn tượng!',
    freelancer_reply: 'Em cảm ơn chị Hà và TechStartup rất nhiều ạ! Rất hy vọng tiếp tục được hợp tác với chị trong các dự án tiếp theo.',
    order_title: 'Thiết kế Banner Quảng Cáo Meta & Google Display', created_at: '2026-09-22 16:30:00'
  },
  {
    id: 2, project_id: 2, author_id: 2, target_id: 8, rating: 5, quality_rating: 5.0, deadline_rating: 4.8, communication_rating: 5.0,
    comment: 'Minh Anh code rất sạch, kiến trúc Flutter chuẩn mực và chủ động đề xuất giải pháp quét QR offline rất tối ưu cho kho bãi.',
    freelancer_reply: 'Dạ em cảm ơn chị Hà đã luôn hỗ trợ cung cấp thông tin test chi tiết giúp tiến độ dự án luôn đúng kế hoạch ạ.',
    order_title: 'Lập trình Ứng dụng Di động Quản lý Kho Hàng cho SME', created_at: '2026-10-10 11:30:00'
  }
];

reviewsSeed.forEach(r => {
  sql += `INSERT INTO talent_reviews (id, project_id, author_id, target_id, rating, quality_rating, deadline_rating, communication_rating, comment, freelancer_reply, order_title, created_at)
VALUES (${r.id}, ${r.project_id}, ${r.author_id}, ${r.target_id}, ${r.rating}, ${r.quality_rating}, ${r.deadline_rating}, ${r.communication_rating}, ${esc(r.comment)}, ${esc(r.freelancer_reply)}, ${esc(r.order_title)}, '${r.created_at}');\n`;
});

sql += `\n-- ----------------------------------------------------------------------------
-- 14. SEED DISPUTES (Tranh chấp / Trọng tài giải quyết)
-- ----------------------------------------------------------------------------\n`;

sql += `INSERT INTO disputes (
    id, project_id, order_number, opened_by, reason, evidence_notes, status,
    refund_employer_amount, payout_freelancer_amount, admin_resolution_note, resolved_by, created_at, resolved_at
) VALUES (
    1, 1, 'TM-2026-8891', 5, 'Chưa hài lòng với mẫu logo concept 3',
    'Khách hàng phản ánh tone màu xanh lá chưa phù hợp với phong thủy nhà hàng chay, cần điều chỉnh lại logo concept 3 trước khi nghiệm thu giai đoạn 2.',
    'UNDER_REVIEW', 0.00, 0.00, 'Admin TalentMatch đã tiếp nhận và đang hỗ trợ hai bên thống nhất phương án điều chỉnh trong 24h.', 1,
    '2026-10-04 10:15:00', NULL
);\n`;

sql += `\n-- ----------------------------------------------------------------------------
-- 15. SEED VNPAY TRANSACTIONS (Lịch sử giao dịch VNPAY Sandbox)
-- ----------------------------------------------------------------------------\n`;

const vnpaySeed = [
  { id: 1, transaction_no: 'VNPAY-2026-8891-QR', project_id: 1, order_number: 'TM-2026-8891', user_id: 5, user_email: 'hoang.tran@foodies.vn', amount: 5500000, bank_code: 'VNPAYQR', card_type: 'QR_CODE', pay_date: '2026-09-28 09:12:00', status: 'SUCCESS', type: 'ESCROW_DEPOSIT', description: 'Nạp cọc Escrow dự án Branding chuỗi nhà hàng qua VNPAY-QR' },
  { id: 2, transaction_no: 'VNPAY-2026-7732-ATM', project_id: 2, order_number: 'TM-2026-7732', user_id: 2, user_email: 'ha.le@techstartup.vn', amount: 14000000, bank_code: 'NCB', card_type: 'ATM_CARD', pay_date: '2026-09-26 14:18:00', status: 'SUCCESS', type: 'ESCROW_DEPOSIT', description: 'Nạp cọc Escrow dự án App Mobile Quản lý Kho Hàng qua thẻ ATM NCB' },
  { id: 3, transaction_no: 'VNPAY-2026-6621-QR', project_id: 3, order_number: 'TM-2026-6621', user_id: 2, user_email: 'ha.le@techstartup.vn', amount: 3000000, bank_code: 'VNPAYQR', card_type: 'QR_CODE', pay_date: '2026-09-15 10:18:00', status: 'SUCCESS', type: 'ESCROW_DEPOSIT', description: 'Nạp cọc Escrow thiết kế Banner quảng cáo' },
  { id: 4, transaction_no: 'VNPAY-PAYOUT-9912', project_id: 3, order_number: 'TM-2026-6621', user_id: 9, user_email: 'hoangnam.design@gmail.com', amount: 2700000, bank_code: 'CTG', card_type: 'BANK_TRANSFER', pay_date: '2026-09-22 16:05:00', status: 'SUCCESS', type: 'PAYOUT', description: 'Giải ngân tiền công (90%) cho Freelancer Trần Hoàng Nam' }
];

vnpaySeed.forEach(v => {
  sql += `INSERT INTO vnpay_transactions (id, transaction_no, project_id, order_number, user_id, user_email, amount, bank_code, card_type, pay_date, status, type, description, created_at)
VALUES (${v.id}, ${esc(v.transaction_no)}, ${v.project_id}, ${esc(v.order_number)}, ${v.user_id}, ${esc(v.user_email)}, ${v.amount.toFixed(2)}, ${esc(v.bank_code)}, ${esc(v.card_type)}, '${v.pay_date}', ${esc(v.status)}, ${esc(v.type)}, ${esc(v.description)}, '${v.pay_date}');\n`;
});

sql += `\n-- ----------------------------------------------------------------------------
-- 16. SEED WITHDRAWAL REQUESTS (Lệnh rút tiền về tài khoản ngân hàng)
-- ----------------------------------------------------------------------------\n`;

sql += `INSERT INTO withdrawal_requests (
    id, user_id, bank_name, bank_code, account_number, account_holder,
    amount, fee, net_amount, status, admin_note, transaction_code, created_at, processed_at
) VALUES 
(1, 8, 'Vietcombank (Ngoại Thương Việt Nam)', 'VCB', '0011004567890', 'NGUYEN MINH ANH', 5000000.00, 0.00, 5000000.00, 'APPROVED', 'Đã chuyển khoản thành công qua ngân hàng VCB', 'WTH-2026-001', DATE_SUB(NOW(6), INTERVAL 3 DAY), NOW(6)),
(2, 9, 'VietinBank (Công Thương Việt Nam)', 'CTG', '108829384756', 'TRAN HOANG NAM', 10000000.00, 0.00, 10000000.00, 'APPROVED', 'Đã chuyển khoản thành công qua cổng thanh toán liên ngân hàng', 'WTH-2026-002', DATE_SUB(NOW(6), INTERVAL 1 DAY), NOW(6));\n`;

sql += `\n-- ----------------------------------------------------------------------------
-- 17. SEED NOTIFICATIONS (Thông báo hệ thống, hợp đồng, thanh toán)
-- ----------------------------------------------------------------------------\n`;

mock.INITIAL_NOTIFICATIONS.forEach((n, idx) => {
  const notifId = idx + 1;
  const recipientId = resolveUserId(n.userId);
  const isRead = n.isRead ? "b'1'" : "b'0'";

  sql += `INSERT INTO notifications (id, recipient_id, title, message, target_url, is_read, type, created_at)
VALUES (${notifId}, ${recipientId}, ${esc(n.title)}, ${esc(n.message)}, ${esc(n.link || '/dashboard')}, ${isRead}, ${esc(n.type || 'SYSTEM')}, ${dt(n.createdAt)});\n`;
});

sql += `\n-- ----------------------------------------------------------------------------
-- 18. SEED JOB INVITATIONS (Lời mời dự án trực tiếp)
-- ----------------------------------------------------------------------------\n`;

mock.INITIAL_INVITATIONS.forEach((inv, idx) => {
  const invId = idx + 1;
  const jobId = parseInt(inv.projectId.replace(/\D/g, ''), 10) || 1;
  const custId = resolveUserId(inv.employerId);
  const freeId = resolveUserId(inv.freelancerId);

  sql += `INSERT INTO job_invitations (id, job_id, customer_id, freelancer_id, status, message, created_at)
VALUES (${invId}, ${jobId}, ${custId}, ${freeId}, ${esc(inv.status || 'SENT')}, ${esc(inv.message)}, ${dt(inv.createdAt)});\n`;
});

sql += `\n-- ----------------------------------------------------------------------------
-- 19. SEED SAVED JOBS (Việc làm đã lưu)
-- ----------------------------------------------------------------------------\n`;

sql += `INSERT INTO saved_jobs (id, freelancer_id, job_id, created_at) VALUES 
(1, 8, 1, NOW(6)),
(2, 8, 3, NOW(6)),
(3, 9, 2, NOW(6)),
(4, 9, 5, NOW(6));\n`;

sql += `\nSET FOREIGN_KEY_CHECKS = 1;

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
`;

fs.writeFileSync(path.join(__dirname, '../TalentMatch_database.sql'), sql, 'utf8');
fs.writeFileSync(path.join(__dirname, '../docker-entrypoint-initdb.d/02_TalentMatch_database.sql'), sql, 'utf8');
console.log('✅ Generated TalentMatch_database.sql and docker-entrypoint-initdb.d/02_TalentMatch_database.sql successfully!');
console.log('File size:', (Buffer.byteLength(sql, 'utf8') / 1024).toFixed(2), 'KB');
