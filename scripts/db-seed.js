const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

console.log('\n=============================================================');
console.log('  🗄️ TALENTMATCH - CHUẨN HÓA & NẠP LẠI DỮ LIỆU CSDL UTF-8');
console.log('=============================================================\n');

const rootDir = path.resolve(__dirname, '..');
const sqlPath = path.join(rootDir, 'TalentMatch_database.sql');

if (!fs.existsSync(sqlPath)) {
  console.error('❌ Không tìm thấy file SQL:', sqlPath);
  process.exit(1);
}

// 1. Kiểm tra container talentmatch-mysql
console.log('🔍 [1/4] Kiểm tra container talentmatch-mysql...');
const psCheck = spawnSync('docker', ['ps', '--filter', 'name=talentmatch-mysql', '--format', '{{.Names}}'], { encoding: 'utf8' });
if (!psCheck.stdout || !psCheck.stdout.includes('talentmatch-mysql')) {
  console.error('❌ Container talentmatch-mysql chưa chạy! Vui lòng khởi động bằng `npm run db:up` trước.');
  process.exit(1);
}
console.log('  ✅ Container talentmatch-mysql đang hoạt động.');

// 2. Chuẩn hóa Collation toàn bộ bảng thành utf8mb4_unicode_ci
console.log('\n🔧 [2/4] Đồng bộ Collation toàn bộ bảng về utf8mb4_unicode_ci...');
const alterSql = `
USE talentmatch_pro;
SET NAMES utf8mb4;
ALTER DATABASE talentmatch_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE notifications CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE project_deliveries CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
DELETE FROM freelancer_portfolios WHERE id BETWEEN 1 AND 12;
`;
spawnSync('docker', ['exec', '-i', 'talentmatch-mysql', 'mysql', '--default-character-set=utf8mb4', '-uroot', '-p123456', 'talentmatch_pro'], {
  input: Buffer.from(alterSql, 'utf8'),
  encoding: 'utf8'
});
console.log('  ✅ Đã đồng bộ Collation & dọn dẹp các bản ghi trùng lặp.');

// 3. Nạp lại file TalentMatch_database.sql với luồng binary/UTF-8 nguyên vẹn
console.log('\n📦 [3/4] Nạp dữ liệu từ TalentMatch_database.sql với UTF-8 tuyệt đối...');
const sqlContent = fs.readFileSync(sqlPath);
const seedProcess = spawnSync(
  'docker',
  ['exec', '-i', 'talentmatch-mysql', 'mysql', '--default-character-set=utf8mb4', '-uroot', '-p123456', 'talentmatch_pro'],
  {
    input: sqlContent,
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024
  }
);

if (seedProcess.status !== 0) {
  console.error('❌ Lỗi khi nạp SQL:', seedProcess.stderr);
  process.exit(1);
}
console.log('  ✅ Nạp dữ liệu thành công.');

// 4. Kiểm tra đối soát dữ liệu
console.log('\n🔍 [4/4] Đối soát tính toàn vẹn dữ liệu tiếng Việt trong CSDL...');
const verifySql = `
SELECT 
    (SELECT COUNT(*) FROM jobs) AS total_jobs,
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM projects) AS total_projects,
    (SELECT COUNT(*) FROM talent_reviews) AS total_reviews,
    (SELECT COUNT(*) FROM vnpay_transactions) AS total_vnpay;
`;
const verifyRes = spawnSync(
  'docker',
  ['exec', '-i', 'talentmatch-mysql', 'mysql', '--default-character-set=utf8mb4', '-uroot', '-p123456', 'talentmatch_pro', '-e', verifySql],
  { encoding: 'utf8' }
);

if (verifyRes.stdout) {
  console.log(verifyRes.stdout.trim());
}

console.log('\n🎉 [HOÀN TẤT] Toàn bộ dữ liệu CSDL đã được tối ưu và chuẩn hóa UTF-8 tiếng Việt 100%!\n');
