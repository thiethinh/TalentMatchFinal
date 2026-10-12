# 🌟 TalentMatch — Nền Tảng Kết Nối Freelancer & Doanh Nghiệp

> **Kiến trúc hiện đại:** Hệ thống tách biệt hoàn toàn giữa **Backend REST API (Spring Boot 3.4.5 + Java 21 + Gradle Kotlin DSL)** và **Frontend Single Page Application (React + Vite + TypeScript + Tailwind CSS)**, vận hành trên cơ sở dữ liệu **MySQL 8.0** và tự động hóa điều phối bằng **Docker Compose**.

---

## 📑 Mục Lục
1. [Giới Thiệu Dự Án](#1-giới-thiệu-dự-án)
2. [Cấu Trúc Thư Mục Chuẩn](#2-cấu-trúc-thư-mục-chuẩn)
3. [Công Nghệ & Thư Viện Sử Dụng (Giải Thích Chi Tiết)](#3-công-nghệ--thư-viện-sử-dụng-giải-thích-chi-tiết)
4. [Hướng Dẫn Khởi Động Nhanh (1 Lệnh Duy Nhất)](#4-hướng-dẫn-khởi-động-nhanh-1-lệnh-duy-nhất)
5. [Hướng Dẫn Chạy Môi Trường Phát Triển (Local Dev)](#5-hướng-dẫn-chạy-môi-trường-phát-triển-local-dev)
6. [Tài Khoản Mẫu Trải Nghiệm Hệ Thống](#6-tài-khoản-mẫu-trải-nghiệm-hệ-thống)
7. [Quy Chuẩn Git & Docker Ignore](#7-quy-chuẩn-git--docker-ignore)

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
│   ├── tailwind.config.js         # Hệ thống màu sắc và chuẩn thiết kế Clean Web UI
│   ├── Dockerfile                 # Dockerfile cho Vite frontend container
│   └── .dockerignore              # Loại trừ node_modules/ và dist/ khi build
│
├── docker-entrypoint-initdb.d/    # Thư mục nạp dữ liệu mẫu khởi tạo MySQL lần đầu
│   ├── 01_init_schema.sql         # Tạo database talentmatch_pro và các bảng cốt lõi
│   └── 02_TalentMatch_database.sql# Script mở rộng và các trigger/indexes
├── docker-compose.yml             # Tệp điều phối 3 containers: MySQL + Backend + Frontend
├── docker-start-all.bat           # 1-Click khởi động toàn bộ hệ sinh thái Docker trên Windows
├── docker-start-db.bat            # 1-Click chỉ khởi động MySQL container
├── docker-stop.bat                # 1-Click dừng an toàn mọi containers
├── .gitignore                     # Tệp loại bỏ rác/cache/môi trường phát triển trên Git
├── .dockerignore                  # Tệp loại trừ cho Docker context
├── package.json                   # Script điều phối nhanh tại thư mục gốc (npm run dev)
└── README.md                      # Tài liệu chính của dự án
```

---

## 3. Công Nghệ & Thư Viện Sử Dụng (Giải Thích Chi Tiết)

### 3.1. Phía Backend (Máy chủ API)

| Công nghệ / Thư viện | Vai trò & Giải thích dễ hiểu |
| :--- | :--- |
| **Java 21 (LTS)** | Phiên bản Java ổn định mới nhất với hiệu năng cao, hỗ trợ Virtual Threads, Pattern Matching giúp mã nguồn ngắn gọn và xử lý đồng thời nhanh chóng. |
| **Spring Boot 3.4.5** | Framework Java số 1 thế giới để xây dựng ứng dụng web và REST API. Tự động cấu hình (Auto-configuration), nhúng sẵn Tomcat, giúp khởi chạy hệ thống chỉ bằng 1 dòng mã. |
| **Spring Data JPA & Hibernate** | Tầng truy cập dữ liệu (ORM). Cho phép lập trình viên thao tác với bảng CSDL MySQL thông qua các đối tượng Java (Entities) thay vì phải viết các câu lệnh SQL dài dòng thủ công. |
| **Spring Security** | Tầng phòng vệ và kiểm soát truy cập. Mã hóa mật khẩu an toàn với thuật toán `BCrypt`, phân quyền các đường dẫn (`/api/admin/**`, `/api/customer/**`, `/api/freelancer/**`), ngăn chặn các cuộc tấn công CSRF/XSS. |
| **Gradle Kotlin DSL (`build.gradle.kts`)** | Hệ thống biên dịch và quản lý thư viện hiện đại thay thế cho Maven `pom.xml`. Viết bằng Kotlin nên có khả năng kiểm tra lỗi cú pháp (type-safe) ngay khi gõ và tốc độ build nhanh vượt trội nhờ cache thông minh. |
| **MySQL Connector/J** | Thư viện Driver chính thức giúp Java kết nối và gửi/nhận dữ liệu trực tiếp với hệ quản trị CSDL MySQL. |
| **Jakarta Validation** | Bộ kiểm tra tính hợp lệ của dữ liệu đầu vào (ví dụ `@NotBlank`, `@Email`, `@Min`, `@Size`), tự động trả về lỗi chi tiết nếu người dùng gửi dữ liệu sai định dạng. |
| **Java Mail Sender** | Thư viện hỗ trợ kết nối SMTP máy chủ thư điện tử (như Google Gmail) để gửi email xác minh kích hoạt tài khoản và email khôi phục mật khẩu. |

### 3.2. Phía Frontend (Giao diện người dùng)

| Công nghệ / Thư viện | Vai trò & Giải thích dễ hiểu |
| :--- | :--- |
| **React 18 / 19** | Thư viện xây dựng giao diện dựa trên Component (khối mã tái sử dụng). Cập nhật màn hình tức thì qua Virtual DOM mà không cần tải lại toàn bộ trang web. |
| **Vite** | Công cụ lập trình và đóng gói ứng dụng frontend thế hệ mới. Khởi động môi trường dev trong chưa đầy 1 giây và phản hồi thay đổi mã nguồn ngay lập tức (Hot Module Replacement - HMR). |
| **TypeScript** | Siêu ngôn ngữ bổ sung kiểm soát kiểu dữ liệu tĩnh cho JavaScript. Bắt gọn tất cả các lỗi tiềm ẩn (như sai tên trường, thiếu dữ liệu API) ngay trong lúc viết mã trước khi chạy. |
| **Tailwind CSS v3** | Framework định kiểu giao diện theo phong cách tiện ích (utility-first). Toàn bộ giao diện tuân thủ triệt để tiêu chuẩn **Clean Web UI**: màu sắc trang nhã, viền góc 6-10px, thông tin rõ ràng, không hiệu ứng loè loẹt gây rối mắt. |
| **React Router DOM v7** | Bộ định tuyến trang phía Client (Client-Side Routing). Cho phép chuyển hướng mượt mà giữa các trang (Trang chủ, Tin tuyển dụng, Dashboard) mà không gây nhấp nháy màn hình. |
| **Axios** | Thư viện thực hiện các cuộc gọi mạng HTTP (GET, POST, PUT, DELETE) đến Backend REST API. Cấu hình sẵn gửi kèm thông tin phiên đăng nhập (`withCredentials: true`) và tiền tố URL tự động. |
| **Lucide React** | Bộ thư viện gồm hàng ngàn biểu tượng SVG hiện đại, đường nét thanh lịch, siêu nhẹ, đồng bộ hóa phong cách icon trên toàn bộ dự án. |

### 3.3. Cơ Sở Dữ Liệu & Hạ Tầng Triển Khai

| Công nghệ / Thư viện | Vai trò & Giải thích dễ hiểu |
| :--- | :--- |
| **MySQL 8.0** | Hệ quản trị cơ sở dữ liệu quan hệ mã nguồn mở phổ biến nhất. Lưu trữ an toàn, toàn vẹn dữ liệu với bảng mã `utf8mb4` hỗ trợ hoàn hảo tiếng Việt có dấu. |
| **Docker & Docker Compose** | Nền tảng ảo hóa container. "Đóng gói" toàn bộ MySQL, Backend, Frontend thành các môi trường cô lập. Đảm bảo dự án **chạy chuẩn 100% trên mọi máy tính khác nhau** mà không lo thiếu môi trường hay xung đột phiên bản. |

---

## 4. Hướng Dẫn Khởi Động Nhanh (1 Lệnh Duy Nhất)

Không cần cài đặt thủ công Java, Gradle hay Node.js trên máy, bạn chỉ cần có phần mềm **Docker Desktop**:

### Bước 1: Mở Docker Desktop
Đảm bảo biểu tượng cá voi Docker Desktop đang chạy trên máy tính của bạn.

### Bước 2: Chạy hệ thống bằng 1 lệnh

Tại thư mục gốc `TalentMatch/`:

- **Cách 1: Sử dụng File Click sẵn (Dành cho Windows):**
  Nhấp đúp chuột vào file:
  ```text
  docker-start-all.bat
  ```

- **Cách 2: Gõ lệnh qua Terminal (Windows PowerShell / CMD / macOS / Linux):**
  ```bash
  docker compose up -d --build
  ```
  *(hoặc nếu bạn có npm: `npm run dev`)*

### Bước 3: Truy cập hệ thống
Khi các container khởi động thành công:
- 🌐 **Giao diện Web Khách hàng (Frontend):** [http://localhost:5173](http://localhost:5173)
- 🔌 **Máy chủ REST API (Backend):** [http://localhost:8080](http://localhost:8080)
- 🗄️ **Cơ sở dữ liệu MySQL:** `localhost:3306` (Tài khoản: `root` / Mật khẩu: `123456`)

### Bước 4: Dừng hệ thống khi không sử dụng
Nhấp đúp chuột vào file [`docker-stop.bat`](file:///c:/Users/HINH/Downloads/tmdt/TalentMatch/TalentMatch/docker-stop.bat) hoặc gõ:
```bash
docker compose down
```

---

## 5. Hướng Dẫn Chạy Môi Trường Phát Triển (Local Dev)

Dành cho lập trình viên muốn chỉnh sửa trực tiếp mã nguồn trên IDE (IntelliJ IDEA, VS Code):

### Bước 1: Chỉ bật CSDL MySQL bằng Docker
Nhấp đúp [`docker-start-db.bat`](file:///c:/Users/HINH/Downloads/tmdt/TalentMatch/TalentMatch/docker-start-db.bat) hoặc gõ:
```bash
docker compose up -d mysql
```

### Bước 2: Chạy Backend (Spring Boot)
Mở cửa sổ dòng lệnh tại thư mục `backend/`:
```powershell
cd backend
.\gradlew.bat bootRun
```
> *(Trên macOS/Linux: `./gradlew bootRun`)*
> Backend sẽ chạy tại cổng `8080` và tự động kết nối tới MySQL `localhost:3306`.

### Bước 3: Chạy Frontend (React Vite)
Mở cửa sổ dòng lệnh thứ hai tại thư mục `frontend/`:
```powershell
cd frontend
npm install
npm run dev
```
> Frontend sẽ chạy tại `http://localhost:5173`. Mọi request gửi tới `/api/*` sẽ được Vite tự động chuyển hướng (proxy) sang Backend `http://localhost:8080`.

---

## 6. Tài Khoản Mẫu Trải Nghiệm Hệ Thống

Khi hệ thống khởi chạy lần đầu, cơ chế `DataInitializer` sẽ tự động tạo dữ liệu mẫu phong phú (375+ công việc cùng các tài khoản demo sẵn có):

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn & Chức năng thử nghiệm |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (ADMIN)** | `admin@talentmatch.vn` | `admin123` | Quản lý người dùng, khóa/mở tài khoản, duyệt tin dự án, xem thống kê dòng tiền, giải quyết khiếu nại. |
| **Doanh nghiệp (CUSTOMER)** | `client@talentmatch.vn` | `123456` | Đăng tin tuyển dụng, xem danh sách ứng viên nộp hồ sơ, chọn ứng viên (accept), ký hợp đồng, thanh toán. |
| **Doanh nghiệp 2 (CUSTOMER)** | `customer2@talentmatch.vn` | `123456` | Trải nghiệm luồng tài khoản doanh nghiệp thứ hai. |
| **Freelancer UI/UX** | `freelancer@talentmatch.vn` | `123456` | Tìm kiếm việc làm theo bộ lọc, xem điểm tương thích, nộp đơn ứng tuyển, ký hợp đồng điện tử, nộp sản phẩm. |
| **Freelancer Lập trình** | `developer@talentmatch.vn` | `123456` | Trải nghiệm nộp hồ sơ freelancer công nghệ thông tin. |

---

## 7. Quy Chuẩn Git & Docker Ignore

Dự án đã được cấu hình chặt chẽ hệ thống tệp `.gitignore` và `.dockerignore` tại tất cả các cấp thư mục:
- **Loại bỏ hoàn toàn tệp rác:** Các tệp `.idea/`, `*.iml`, `node_modules/`, `build/`, `.gradle/`, `.DS_Store` sẽ không bị đưa lên Git repository, đảm bảo dung lượng repo luôn nhẹ và an toàn.
- **Giữ trọn vẹn tệp kịch bản thực thi:** Gradle Wrapper (`gradle/wrapper/gradle-wrapper.jar`) và các file mẫu `.env.example` được giữ lại đầy đủ để bất kỳ ai khi clone dự án về máy đều có thể chạy ngay lập tức mà không gặp bất kỳ lỗi thiếu file nào.
