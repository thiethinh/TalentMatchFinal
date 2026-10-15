const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');
const gradlewPath = path.join(rootDir, 'backend', 'gradlew');

console.log('🚀 [Setup] Bắt đầu khởi tạo dự án TalentMatch...');

// 1. Khởi tạo file .env từ .env.example nếu chưa có
if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ [Setup] Đã tạo file .env từ .env.example');
} else if (fs.existsSync(envPath)) {
  console.log('ℹ️  [Setup] File .env đã sẵn sàng');
}

// 2. Cấp quyền thực thi cho gradlew trên Linux / macOS
if (process.platform !== 'win32' && fs.existsSync(gradlewPath)) {
  try {
    fs.chmodSync(gradlewPath, '755');
    console.log('✅ [Setup] Đã cấp quyền thực thi cho backend/gradlew');
  } catch (err) {
    console.warn('⚠️ [Setup] Không thể chmod gradlew:', err.message);
  }
}

// 3. Cài đặt dependencies cho frontend
console.log('📦 [Setup] Đang cài đặt thư viện frontend (npm install)...');
const isWin = process.platform === 'win32';
const executable = isWin ? 'cmd.exe' : 'npm';
const args = isWin ? ['/c', 'npm', '--prefix', 'frontend', 'install'] : ['--prefix', 'frontend', 'install'];

const installResult = spawnSync(executable, args, {
  cwd: rootDir,
  stdio: 'inherit',
});

if (installResult.status !== 0) {
  console.error('❌ [Setup] Lỗi khi cài đặt dependencies frontend!');
  process.exit(installResult.status || 1);
}

console.log('🎉 [Setup] Hoàn tất cài đặt! Bạn đã có thể chạy dự án.');
