const fs = require('fs');
const path = require('path');
const net = require('net');
const { spawn, spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');
const backendDir = path.join(rootDir, 'backend');
const gradlewPath = path.join(backendDir, 'gradlew');
const gradleJarPath = path.join(backendDir, 'gradle', 'wrapper', 'gradle-wrapper.jar');
const gradlePropsPath = path.join(backendDir, 'gradle', 'wrapper', 'gradle-wrapper.properties');
const frontendNodeModules = path.join(rootDir, 'frontend', 'node_modules');

function printBanner() {
  console.log('\n=============================================================');
  console.log('  🌟 TALENTMATCH PLATFORM - TRÌNH KHỞI ĐỘNG TỰ ĐỘNG 🌟');
  console.log('=============================================================\n');
}

function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') resolve(false);
      else resolve(true);
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port, '127.0.0.1');
  });
}

async function runPreflightChecks() {
  console.log('🔍 [1/4] Kiểm tra cấu hình môi trường (.env)...');
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('  ✅ Đã tự động tạo file .env từ .env.example');
    } else {
      console.warn('  ⚠️ Không tìm thấy .env.example để khởi tạo .env');
    }
  } else {
    console.log('  ✅ File .env đã sẵn sàng.');
  }

  console.log('\n🔍 [2/4] Kiểm tra các tệp Gradle & mã nguồn Backend...');
  const missingFiles = [];
  if (!fs.existsSync(gradlewPath)) missingFiles.push('backend/gradlew');
  if (!fs.existsSync(gradleJarPath)) missingFiles.push('backend/gradle/wrapper/gradle-wrapper.jar');
  if (!fs.existsSync(gradlePropsPath)) missingFiles.push('backend/gradle/wrapper/gradle-wrapper.properties');

  if (missingFiles.length > 0) {
    console.error('\n❌ [LỖI PHÁT HIỆN] Dự án thiếu các tệp Gradle wrapper quan trọng:');
    missingFiles.forEach((file) => console.error(`   - ${file}`));
    console.error('\n👉 Hướng dẫn khắc phục:');
    console.error('   Vui lòng kiểm tra lại quá trình clone git hoặc tải lại các file wrapper bị thiếu.\n');
    process.exit(1);
  }
  console.log('  ✅ Các tệp Gradle wrapper đầy đủ.');

  // Cấp quyền thực thi nếu chạy trên Linux / macOS
  if (process.platform !== 'win32') {
    try {
      fs.chmodSync(gradlewPath, '755');
    } catch (_) {}
  }

  console.log('\n🔍 [3/4] Kiểm tra Docker Desktop...');
  const isWin = process.platform === 'win32';
  const dockerCmd = isWin ? 'docker.exe' : 'docker';

  // Kiểm tra Docker đã cài đặt chưa
  const dockerVersionCheck = spawnSync(dockerCmd, ['--version'], { encoding: 'utf-8' });
  if (dockerVersionCheck.error || dockerVersionCheck.status !== 0) {
    console.error('\n❌ [LỖI DOCKER] Máy tính của bạn CHƯA CÀI ĐẶT DOCKER!');
    console.error('👉 Hướng dẫn:');
    console.error('   1. Tải và cài đặt Docker Desktop tại: https://www.docker.com/products/docker-desktop/');
    console.error('   2. Mở Docker Desktop lên, chờ khởi động xong rồi chạy lại: npm run dev\n');
    process.exit(1);
  }

  // Kiểm tra Docker daemon đang chạy không
  const dockerInfoCheck = spawnSync(dockerCmd, ['info'], { encoding: 'utf-8' });
  if (dockerInfoCheck.error || dockerInfoCheck.status !== 0) {
    console.error('\n❌ [LỖI DOCKER] DOCKER DESKTOP CHƯA ĐƯỢC BẬT HOẶC ĐANG KHỞI ĐỘNG!');
    console.error('👉 Hướng dẫn:');
    console.error('   1. Mở ứng dụng Docker Desktop trên máy tính.');
    console.error('   2. Chờ biểu tượng Docker ở thanh tác vụ chuyển sang màu xanh (Engine running).');
    console.error('   3. Sau đó chạy lại lệnh: npm run dev\n');
    process.exit(1);
  }
  console.log('  ✅ Docker Desktop đang hoạt động bình thường.');

  console.log('\n🔍 [4/4] Kiểm tra cổng mạng (Ports: 3306, 8080, 5173)...');
  const port3306Free = await checkPortAvailable(3306);
  const port8080Free = await checkPortAvailable(8080);
  const port5173Free = await checkPortAvailable(5173);

  if (!port3306Free) {
    console.warn('  ⚠️  [CẢNH BÁO] Cổng 3306 đang có dịch vụ sử dụng (có thể là MySQL cục bộ / XAMPP).');
    console.warn('      Nếu Docker báo lỗi "port is already allocated", hãy dừng MySQL local để nhường cổng.');
  }
  if (!port8080Free) {
    console.warn('  ⚠️  [CẢNH BÁO] Cổng 8080 đang có dịch vụ sử dụng. Có thể gây xung đột với Backend.');
  }
  if (!port5173Free) {
    console.warn('  ⚠️  [CẢNH BÁO] Cổng 5173 đang có dịch vụ sử dụng. Có thể gây xung đột với Frontend.');
  }
  if (port3306Free && port8080Free && port5173Free) {
    console.log('  ✅ Các cổng 3306, 8080, 5173 hoàn toàn sẵn sàng.');
  }

  // Tự động chuẩn bị node_modules frontend nếu chưa có (để IDE dev không báo lỗi đỏ)
  if (!fs.existsSync(frontendNodeModules)) {
    console.log('\n📦 [Hỗ trợ IDE] Đang tải trước thư viện Frontend vào thư mục local...');
    const npmExecutable = isWin ? 'cmd.exe' : 'npm';
    const npmArgs = isWin ? ['/c', 'npm', '--prefix', 'frontend', 'install'] : ['--prefix', 'frontend', 'install'];
    spawnSync(npmExecutable, npmArgs, { cwd: rootDir, stdio: 'inherit' });
  }
}

async function start() {
  printBanner();
  await runPreflightChecks();

  console.log('\n🚀 [Khởi động] Đang kích hoạt Docker Compose (build & start)...');
  console.log('-------------------------------------------------------------');

  const isWin = process.platform === 'win32';
  const dockerCmd = isWin ? 'docker.exe' : 'docker';
  const child = spawn(dockerCmd, ['compose', 'up', '--build'], {
    cwd: rootDir,
    stdio: 'inherit',
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== 130 && code !== null) {
      console.log('\n-------------------------------------------------------------');
      console.error(`❌ [THÔNG BÁO LỖI] Quá trình Docker kết thúc với mã lỗi: ${code}`);
      console.error('\n🔍 BẢNG HƯỚNG DẪN CHẨN ĐOÁN & KHẮC PHỤC:');
      console.error('1. LỖI BUILD GRADLE (Backend):');
      console.error('   - Nếu lỗi xảy ra khi build jar backend: Hãy kiểm tra mã nguồn Java.');
      console.error('   - Chạy thử trực tiếp: npm run backend:build để xem chi tiết log lỗi Java/Gradle.');
      console.error('2. LỖI XUNG ĐỘT CỔNG (Bind for 0.0.0.0:xxxx failed):');
      console.error('   - Hãy tắt ứng dụng đang chiếm cổng tương ứng (MySQL cục bộ trên 3306, app Java trên 8080).');
      console.error('3. LỖI DOCKER CACHE HOẶC VOLUME DB BỊ LỆCH:');
      console.error('   - Thử dọn dẹp và reset lại bằng lệnh: npm run dev:clean');
      console.error('   - Sau đó chạy lại: npm run dev');
      console.error('-------------------------------------------------------------\n');
      process.exit(code);
    }
  });

  // Bắt tín hiệu ngắt Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Đang nhận lệnh dừng, vui lòng chờ các container đóng an toàn...');
    child.kill('SIGINT');
  });
}

start();
