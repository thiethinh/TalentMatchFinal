# 🌟 TalentMatch — Nền Tảng Kết Nối Freelancer & Doanh Nghiệp

> **Kiến trúc hiện đại:** Hệ thống tách biệt hoàn toàn giữa **Backend REST API (Spring Boot 3.4.5 + Java 21 + Gradle Kotlin DSL)** và **Frontend Single Page Application (React + Vite + TypeScript + Tailwind CSS)**, vận hành trên cơ sở dữ liệu **MySQL 8.0** và tự động hóa điều phối bằng **Docker Compose**.

---

## 📑 Mục Lục
1. [Giới Thiệu Dự Án](#1-giới-thiệu-dự-án)
2. [Cấu Trúc Thư Mục Chuẩn](#2-cấu-trúc-thư-mục-chuẩn)
3. [Thông Tin Kết Nối Cơ Sở Dữ Liệu (Database Info)](#3-thông-tin-kết-nối-cơ-sở-dữ-liệu-database-info)
4. [Công Nghệ & Thư Viện Sử Dụng](#4-công-nghệ--thư-viện-sử-dụng)
5. [Hướng Dẫn Khởi Động Nhanh (1 Lệnh Duy Nhất)](#5-hướng-dẫn-khởi-động-nhanh-1-lệnh-duy-nhất)
6. [Hướng Dẫn Chạy Môi Trường Phát Triển (Local Dev)](#6-hướng-dẫn-chạy-môi-trường-phát-triển-local-dev)
7. [Tài Khoản Mẫu Trải Nghiệm Hệ Thống](#7-tài-khoản-mẫu-trải-nghiệm-hệ-thống)
8. [Bảng Lệnh Tiện Ích NPM](#8-bảng-lệnh-tiện-ích-npm)
9. [Quy Chuẩn Git & Docker Ignore](#9-quy-chuẩn-git--docker-ignore)

---

## 1. Giới Thiệu Dự Án

**TalentMatch** là sàn giao dịch việc làm kỹ thuật số kết nối trực tiếp giữa **Doanh nghiệp/Khách hàng (Client)** có nhu cầu tuyển dụng theo dự án và đội ngũ **Nhân sự tự do (Freelancer)** chất lượng cao.

Hệ thống hỗ trợ trọn gói vòng đời của một dự án công nghệ:
- **Đăng tin & Lọc việc làm:** Đăng tuyển dự án, phân loại theo kỹ năng, ngân sách, hình thức làm việc.
- **Thuật toán Khớp lệnh Ứng viên (Smart Matching):** Đề xuất freelancer phù hợp nhất dựa trên tỷ lệ trùng khớp kỹ năng và kinh nghiệm.
- **Quy trình Tuyển chọn & Đàm phán:** Ứng tuyển kèm thư chào giá (cover letter, proposal rate), shortlist ứng viên, mời phỏng vấn/nhận việc.
- **Hợp đồng điện tử & Ký số (E-Contract):** Tạo điều khoản thỏa thuận, xác nhận phiên bản hợp đồng minh bạch.
- **Quản lý Tiến độ Theo Milestone:** Chia nhỏ công việc theo từng cột mốc (Milestones), bàn giao sản phẩm đính kèm tệp tin.
- **Cơ chế Ký quỹ & Quyết toán (Escrow Payment):** Đảm bảo an toàn tài chính giữa hai bên trước khi bàn giao.
- **Đánh giá & Xếp hạng tín nhiệm:** Chấm điểm sao và viết nhận xét sau khi hoàn thành dự án.
- **Bảng điều khiển Quản trị (Admin Dashboard):** Giám sát người dùng, duyệt tin, phân xử khiếu nại (Disputes) và nhật ký kiểm toán (Audit Logs).

---

## 2. Cấu Trúc Thư Mục Chuẩn

Dự án được phân chia độc lập, sạch sẽ và chuẩn mực:

```text
TalentMatch/
├── backend/                       # BACKEND REST API
│   ├── src/main/java/             # Mã nguồn Java (Controllers, Services, Repositories, Entities)
│   ├── src/main/resources/        # File cấu hình application.properties & SQL migration
│   ├── build.gradle.kts           # Kịch bản build Gradle Kotlin DSL
│   ├── settings.gradle.kts        # Cấu hình project name của Gradle
│   ├── gradlew / gradlew.bat      # Gradle Wrapper v8.11.1 (chạy độc lập không cần cài Gradle)
│   ├── Dockerfile                 # Multi-stage Dockerfile tối ưu kích thước JAR (Temurin 21)
│   └── .dockerignore              # Loại trừ build/ và .gradle/ khi đóng gói container
│
├── frontend/                      # FRONTEND SINGLE PAGE APPLICATION (SPA)
│   ├── src/
│   │   ├── app/                   # Providers (Auth Context), Router Guards
│   │   ├── components/            # UI atoms (Button, Input, Badge, Modal, Navbar, Sidebar, ...)
│   │   ├── pages/                 # Giao diện nghiệp vụ (Home, Jobs, Freelancers, Dashboard, ...)
│   │   ├── lib/api/               # Axios Client cấu hình interceptors và credentials
│   │   ├── types/                 # Định nghĩa TypeScript interfaces toàn bộ thực thể
│   │   └── utils/                 # Hàm tiện ích format tiền tệ VND, ngày tháng
│   ├── package.json               # Khai báo thư viện phụ thuộc và scripts
│   ├── vite.config.ts             # Cấu hình dev server và proxy tự động /api -> backend:8080
│   ├── Dockerfile                 # Dockerfile cho Vite frontend container
│   └── .dockerignore              # Loại trừ node_modules/ và dist/ khi build
│
├── docker-entrypoint-initdb.d/    # Thư mục nạp dữ liệu mẫu khởi tạo MySQL lần đầu
├── docker-compose.yml             # Tệp điều phối 3 containers: MySQL + Backend + Frontend
├── docker-start-all.bat           # File click chạy toàn bộ hệ thống bằng Docker
├── docker-start-db.bat            # File click chỉ chạy riêng MySQL Database
├── docker-stop.bat                # File click dừng toàn bộ container an toàn
├── scripts/                       # Các script tự động hóa thông minh (dev.js, gradle.js, setup.js)
├── .env.example                   # File mẫu biến môi trường (Database, Mail, Ports)
├── .gitattributes                 # Chuẩn hóa line-ending LF cho Gradle/Linux
├── .gitignore                     # Loại trừ tệp rác, cache, node_modules
├── package.json                   # Bộ lệnh điều phối 1 chạm tại thư mục gốc
└── README.md                      # Tài liệu chính của dự án
```

---

## 3. Thông Tin Kết Nối Cơ Sở Dữ Liệu (Database Info)

Hệ thống sử dụng cơ sở dữ liệu **MySQL 8.0** phục vụ môi trường kiểm thử và phát triển. Dưới đây là thông số kết nối chi tiết dành cho lập trình viên và các công cụ/AI:

| Thông số | Giá trị |
| :--- | :--- |
| **Hệ Quản Trị CSDL** | **MySQL 8.0** |
| **Host (khi kết nối từ máy Host/DBeaver/Navicat/AI)** | `localhost` hoặc `127.0.0.1` |
| **Host (khi kết nối nội bộ giữa các container Docker)** | `mysql` |
| **Port kết nối** | `3306` |
| **Database Name** | `talentmatch_pro` |
| **Username** | `root` |
| **Password** | `123456` |
| **Mã hóa & Bảng mã** | `utf8mb4` / `utf8mb4_unicode_ci` |
| **Múi giờ (Server Timezone)** | `Asia/Ho_Chi_Minh` |
| **JDBC Connection URL** | `jdbc:mysql://localhost:3306/talentmatch_pro?createDatabaseIfNotExist=true&useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Ho_Chi_Minh` |
| **Khởi tạo dữ liệu mẫu** | Tự động qua thư mục `docker-entrypoint-initdb.d/` và `APP_DEMO_SEED=true` |

---

## 4. Công Nghệ & Thư Viện Sử Dụng

### 4.1. Phía Backend (Máy chủ API)
- **Java 21 (LTS)**: Hiệu năng cao, Virtual Threads, Pattern Matching.
- **Spring Boot 3.4.5**: Tự động cấu hình (Auto-configuration), nhúng sẵn Tomcat.
- **Spring Data JPA & Hibernate**: Quản lý truy cập dữ liệu ORM mạnh mẽ.
- **Spring Security**: Mã hóa mật khẩu với `BCrypt`, phân quyền đường dẫn chặt chẽ.
- **Gradle Kotlin DSL (`build.gradle.kts`)**: Hệ thống build hiện đại, type-safe, tốc độ cao.
- **MySQL Connector/J**: Driver kết nối cơ sở dữ liệu.
- **Jakarta Validation**: Kiểm tra tính hợp lệ dữ liệu đầu vào (`@NotBlank`, `@Email`, `@Min`, `@Size`).
- **Java Mail Sender**: Hỗ trợ SMTP gửi email xác thực và khôi phục mật khẩu.

### 4.2. Phía Frontend (Giao diện người dùng)
- **React 18 / 19**: Xây dựng UI Component hiện đại, Virtual DOM phản hồi tức thì.
- **Vite**: Công cụ lập trình và đóng gói thế hệ mới, HMR siêu tốc.
- **TypeScript**: Kiểm soát kiểu tĩnh, phòng tránh lỗi cú pháp và kiểu dữ liệu.
- **Tailwind CSS**: Định kiểu tiện ích, chuẩn Clean Web UI thanh lịch.
- **React Router DOM v7**: Điều hướng trang phía Client không tải lại trang.
- **Axios**: Gửi nhận request API với interceptors và credentials tự động.
- **Lucide React**: Thư viện biểu tượng SVG hiện đại, đồng bộ phong cách.

### 4.3. Hạ Tầng Triển Khai
- **Docker & Docker Compose**: Đóng gói cô lập MySQL, Backend, Frontend; vận hành nhất quán 100% trên mọi máy tính.

---

## 5. Hướng Dẫn Khởi Động Nhanh (1 Lệnh Duy Nhất)

Dành cho thành viên mới vừa clone/tải dự án về máy. Chỉ cần mở **Docker Desktop** lên và chạy:

### Bước 1: Mở Docker Desktop
Đảm bảo biểu tượng Docker Desktop đang chạy trên máy tính.

### Bước 2: Chạy đúng 1 lệnh
Tại thư mục gốc `TalentMatch/`, mở terminal và chạy:
```bash
npm run dev
```
*(Hoặc gõ `npm start`, hoặc nhấp đúp vào file `docker-start-all.bat` trên Windows).*

> 💡 **Cơ chế tự động thông minh (Preflight Checks):**
> Lệnh trên sẽ tự động:
> 1. Kiểm tra và tự copy file `.env` từ `.env.example` nếu máy bạn chưa có.
> 2. Kiểm tra tính toàn vẹn của Gradle Wrapper và mã nguồn Backend.
> 3. Kiểm tra Docker Desktop đã bật chưa (nếu chưa bật hoặc chưa cài, hệ thống sẽ hiển thị thông báo hướng dẫn chi tiết).
> 4. Kiểm tra xung đột cổng mạng (3306, 8080, 5173), cảnh báo nếu có MySQL local đang chiếm cổng.
> 5. Kích hoạt Docker Compose build và khởi chạy toàn bộ 3 dịch vụ.

### Bước 3: Truy cập hệ thống
- 🌐 **Giao diện Web Frontend:** [http://localhost:5173](http://localhost:5173)
- 🔌 **Máy chủ REST API Backend:** [http://localhost:8080](http://localhost:8080)
- 🗄️ **Cơ sở dữ liệu MySQL:** `localhost:3306` (Tài khoản: `root` / `123456`)

### Bước 4: Dừng hệ thống khi không sử dụng
```bash
npm run dev:down
```
*(Hoặc nhấp đúp vào file `docker-stop.bat`).*

---

## 6. Hướng Dẫn Chạy Môi Trường Phát Triển (Local Dev)

Dành cho lập trình viên muốn code và debug trực tiếp trên IDE (IntelliJ IDEA, VS Code):

### Cách 1: Chạy song song cả Backend & Frontend chỉ với 1 lệnh (Khuyên dùng)
1. **Khởi động MySQL qua Docker**:
   ```bash
   npm run db:up
   ```
   *(Hoặc nhấp đúp file `docker-start-db.bat`).*

2. **Chạy đồng thời Backend + Frontend bằng 1 lệnh**:
   ```bash
   npm run dev:local
   ```
   *(Sử dụng `concurrently` hiển thị log màu của cả Spring Boot và Vite React song song trong 1 cửa sổ).*

---

### Cách 2: Chạy thủ công từng phần
1. **Bật MySQL**:
   ```bash
   npm run db:up
   ```
2. **Chạy Backend (Spring Boot)**:
   ```bash
   npm run backend:run
   ```
   *(Script tự động nhận diện Windows/macOS/Linux để gọi `gradlew` chính xác, không lo lỗi cú pháp).*
3. **Chạy Frontend (React Vite)**:
   ```bash
   npm run frontend:dev
   ```

---

## 7. Tài Khoản Mẫu Trải Nghiệm Hệ Thống

Khi hệ thống khởi chạy lần đầu, cơ chế `DataInitializer` sẽ tự động tạo dữ liệu mẫu phong phú (375+ công việc cùng các tài khoản demo sẵn có):

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn & Chức năng thử nghiệm |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (ADMIN)** | `admin@talentmatch.vn` | `admin123` | Quản lý người dùng, khóa/mở tài khoản, duyệt tin dự án, xem thống kê dòng tiền, giải quyết khiếu nại. |
| **Doanh nghiệp (CUSTOMER)** | `client@talentmatch.vn` | `123456` | Đăng tin tuyển dụng, xem danh sách ứng viên nộp hồ sơ, chọn ứng viên (accept), ký hợp đồng, thanh toán. |
| **Doanh nghiệp 2 (CUSTOMER)** | `customer2@talentmatch.vn` | `123456` | Trải nghiệm luồng tài khoản doanh nghiệp thứ hai. |
| **Freelancer UI/UX** | `freelancer@talentmatch.vn` | `123456` | Tìm kiếm việc làm theo bộ lọc, xem điểm tương thích, nộp đơn ứng tuyển, ký hợp đồng điện tử, nộp sản phẩm. |
| **Freelancer Lập trình** | `developer@talentmatch.vn` | `123456` | Trải nghiệm nộp hồ sơ freelancer công nghệ thông tin. |

---

## 8. Bảng Lệnh Tiện Ích NPM

| Lệnh | Ý nghĩa & Tác dụng |
| :--- | :--- |
| **`npm run dev`** hoặc **`npm start`** | **1 lệnh chạy toàn bộ** hệ sinh thái với Docker (Preflight check tự động) |
| `npm run dev:d` | Chạy Docker ở chế độ ngầm (detached) |
| `npm run dev:down` | Dừng và hạ toàn bộ container Docker an toàn |
| `npm run dev:clean` | Dừng container và xóa volume database để reset dữ liệu sạch sẽ |
| **`npm run dev:local`** | **1 lệnh chạy song song** cả Spring Boot & Vite Frontend local |
| `npm run db:up` | Chỉ khởi động MySQL database trong Docker |
| `npm run db:down` | Dừng MySQL database |
| `npm run db:logs` | Xem log trực tiếp của MySQL database |
| `npm run backend:run` | Chạy Spring Boot Backend (tự động nhận diện OS) |
| `npm run backend:build` | Build Backend JAR qua Gradle |
| `npm run backend:test` | Chạy bộ test tự động của Backend |
| `npm run frontend:dev` | Chạy Vite dev server cho Frontend |
| `npm run frontend:build` | Build đóng gói mã nguồn Frontend cho production |
| `npm run frontend:preview`| Xem thử bản build Frontend tại local |

---

## 9. Quy Chuẩn Git & Docker Ignore

- **Loại bỏ hoàn toàn tệp rác:** Các tệp `.idea/`, `*.iml`, `node_modules/`, `build/`, `.gradle/`, `.DS_Store` không được đưa lên Git repository, đảm bảo dung lượng repo luôn nhẹ và sạch sẽ.
- **Giữ trọn vẹn tệp kịch bản thực thi:** Gradle Wrapper (`gradle/wrapper/gradle-wrapper.jar`), `.env.example`, `.gitattributes` được lưu giữ đầy đủ để bất kỳ ai khi clone dự án về máy đều có thể chạy ngay lập tức bằng 1 lệnh mà không gặp bất kỳ trở ngại nào.
