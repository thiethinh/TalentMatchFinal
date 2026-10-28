# Hướng Dẫn Setup Dự Án TalentMatch (Kiến Trúc Tách Biệt Frontend & Backend)

Hệ thống TalentMatch đã được tách biệt thành 2 thư mục độc lập:
- **`backend/`**: REST API viết bằng **Spring Boot 3.4.5**, **Java 21**, build bằng **Gradle Kotlin DSL (`build.gradle.kts`)**, kết nối **MySQL 8.0**.
- **`frontend/`**: Ứng dụng Single Page Application (SPA) viết bằng **React 18 / 19**, **Vite**, **TypeScript**, **Tailwind CSS**.

---

## 1. Cấu Trúc Thư Mục Chuẩn

```
TalentMatch/
├── backend/                       # Spring Boot 3.4.5 REST API (Gradle Kotlin DSL)
│   ├── src/main/java/             # Mã nguồn Java (Controllers, Services, Repositories, Entities)
│   ├── src/main/resources/        # Cấu hình application.properties
│   ├── build.gradle.kts           # Cấu hình build Gradle chính
│   ├── settings.gradle.kts
│   ├── gradlew / gradlew.bat
│   └── Dockerfile                 # Multi-stage Dockerfile cho Backend
├── frontend/                      # React SPA (Vite + TypeScript + Tailwind CSS)
│   ├── src/                       # Components, Pages, Router, API Client
│   ├── package.json
│   ├── vite.config.ts             # Proxy tự động /api sang backend
│   └── Dockerfile                 # Dockerfile cho Frontend
├── docker-entrypoint-initdb.d/    # Script SQL khởi tạo MySQL tự động
├── docker-compose.yml             # Orchestration cho cả MySQL, Backend, Frontend
├── docker-start-all.bat           # File click chạy toàn bộ hệ thống
├── docker-start-db.bat            # File click chỉ chạy MySQL
└── docker-stop.bat                # File click dừng container
```

---

## 2. Thông Tin Kết Nối Cơ Sở Dữ Liệu (MySQL Test Database)

| Thông số | Giá trị |
| :--- | :--- |
| **Hệ Quản Trị CSDL** | **MySQL 8.0** |
| **Host (từ máy ngoài / DBeaver / Navicat / AI kết nối)** | `localhost` hoặc `127.0.0.1` |
| **Host (nội bộ trong mạng Docker)** | `mysql` |
| **Cổng kết nối (Port)** | `3306` |
| **Tên Cơ Sở Dữ Liệu (DB Name)** | `talentmatch_pro` |
| **Tên Đăng Nhập (Username)** | `root` |
| **Mật Khẩu (Password)** | `123456` |
| **JDBC Connection URL** | `jdbc:mysql://localhost:3306/talentmatch_pro?createDatabaseIfNotExist=true&useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Ho_Chi_Minh` |

---

## 3. Cách Khởi Động Dự Án (Chỉ Cần 1 Lệnh)

### Bước 1: Chuẩn Bị & Cài Đặt (Chỉ 1 lệnh duy nhất)
Khi mới clone dự án về, bạn chỉ cần mở terminal tại thư mục gốc và chạy:
```bash
npm install
```
*(Lệnh này tự động kích hoạt script `postinstall` để khởi tạo file `.env` từ `.env.example`, cấp quyền thực thi cho Gradle và cài đặt toàn bộ thư viện Frontend).*

---

### Bước 2: Chạy Dự Án (Lựa chọn 1 trong 2 cách)

#### Cách A: Chạy TOÀN BỘ bằng Docker (Khuyên dùng)
```bash
npm start
# hoặc: npm run dev
```
- Tự động build và chạy cả 3 container: **MySQL (port 3306)**, **Backend (port 8080)**, **Frontend (port 5173)**.
- Dừng hệ thống:
  ```bash
  npm run dev:down
  ```

#### Cách B: Chạy Lập Trình Local (Dev Mode)
1. **Khởi động Database MySQL**:
   ```bash
   npm run db:up
   ```
2. **Chạy song song cả Backend & Frontend chỉ với 1 lệnh**:
   ```bash
   npm run dev:local
   ```
   *(Sử dụng `concurrently` hiển thị log màu đồng thời của cả Spring Boot và Vite React).*

---

### Danh Sách Các Lệnh Tiện Ích Trong `package.json`
| Lệnh | Ý nghĩa |
| :--- | :--- |
| `npm install` hoặc `npm run setup` | Cài đặt toàn bộ dependencies, tự động tạo `.env` |
| `npm start` hoặc `npm run dev` | Khởi động toàn bộ dự án với Docker |
| `npm run dev:d` | Chạy Docker ở chế độ chạy ngầm (detached) |
| `npm run dev:down` | Dừng toàn bộ Docker container |
| `npm run dev:clean` | Dừng và dọn sạch volumes database Docker (reset DB về mới hoàn toàn) |
| `npm run db:seed` | Nạp lại 100% CSDL mới từ TalentMatch_database.sql vào MySQL |
| `npm run dev:local` | Chạy cùng lúc cả Spring Boot & Vite Frontend không qua Docker |
| `npm run db:up` | Chỉ khởi động MySQL database qua Docker |
| `npm run db:down` | Dừng MySQL database |
| `npm run backend:run` | Chạy Spring Boot Backend (hỗ trợ cả Windows và Unix) |
| `npm run backend:build` | Build Backend JAR qua Gradle |
| `npm run backend:test` | Chạy test Backend |
| `npm run frontend:dev` | Chạy Vite dev server cho Frontend |
| `npm run frontend:build` | Build production cho Frontend |
| `npm run frontend:preview` | Preview bản build Frontend |

## 4. Tài Khoản Test Demo Chuẩn Xác
Hệ thống sử dụng bảng tra cứu 19 tài khoản test thực tế đồng bộ 100% với MySQL trong file `tai_khoan_test.txt`:
* **Mật khẩu chung:** `demo123456` (cho tất cả tài khoản Freelancer và Employer)
* **Mật khẩu Admin:** `admin123456` (hoặc `demo123456`)
* **Chuyển đổi tài khoản nhanh:** Bấm nút **"Test"** trên Header website để chuyển đổi giữa các vai trò (Employer Lê Thu Hà, Freelancer Nguyễn Minh Anh, Admin,...).

> 💡 **Lưu ý khi Git Pull về máy khác:**
> - Nếu chạy lần đầu: Chỉ cần `npm run dev` là Docker tự động nạp toàn bộ CSDL mới.
> - Nếu máy đã từng chạy Docker trước đó (đã có volume dữ liệu cũ): Chỉ cần chạy `npm run db:seed` (hoặc `npm run dev:clean` rồi `npm run dev`) để cập nhật CSDL mới nhất.
