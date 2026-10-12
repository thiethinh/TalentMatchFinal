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

## 2. Cách Khởi Động Dự Án

### Cách A: Chạy TOÀN BỘ bằng Docker (Khuyên dùng)
1. Bật **Docker Desktop**.
2. Nhấp đúp vào file [`docker-start-all.bat`](file:///c:/Users/HINH/Downloads/tmdt/TalentMatch/TalentMatch/docker-start-all.bat) (hoặc chạy lệnh: `docker compose up -d --build`).
3. Truy cập ứng dụng:
   - **Frontend (Giao diện Web)**: [http://localhost:5173](http://localhost:5173)
   - **Backend (REST API)**: [http://localhost:8080](http://localhost:8080)
   - **MySQL Database**: `localhost:3306` (`root` / `123456`)

### Cách B: Chạy Thủ Công Từng Phần Để Lập Trình (Dev Mode)
1. **Khởi động MySQL**:
   Nhấp đúp [`docker-start-db.bat`](file:///c:/Users/HINH/Downloads/tmdt/TalentMatch/TalentMatch/docker-start-db.bat) (hoặc `docker compose up -d mysql`).

2. **Chạy Backend**:
   ```powershell
   cd backend
   .\gradlew.bat bootRun
   ```
   Backend chạy tại `http://localhost:8080`.

3. **Chạy Frontend**:
   ```powershell
   cd frontend
   npm run dev
   ```
   Frontend chạy tại `http://localhost:5173`. Các request API (`/api/*`) được Vite proxy tự động sang `http://localhost:8080`.

---

## 3. Dừng Container
- Nhấp đúp vào file [`docker-stop.bat`](file:///c:/Users/HINH/Downloads/tmdt/TalentMatch/TalentMatch/docker-stop.bat) (hoặc lệnh `docker compose down`).

---

## 4. Tài Khoản Demo Sẵn Có
Khi khởi động lần đầu, hệ thống tự động sinh dữ liệu demo:

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@talentmatch.vn` | `admin123` |
| **Khách hàng / Doanh nghiệp** | `client@talentmatch.vn` | `123456` |
| **Khách hàng 2** | `customer2@talentmatch.vn` | `123456` |
| **Freelancer (UI/UX)** | `freelancer@talentmatch.vn` | `123456` |
| **Freelancer (Developer)** | `developer@talentmatch.vn` | `123456` |
