# THIẾT KẾ KIẾN TRÚC ĐÍCH (TARGET ARCHITECTURE DESIGN)
**Dự án:** TalentMatch — Freelance Marketplace  
**Ngày thực hiện:** 10/10/2026  
**Vai trò:** Senior Software Architect & Legacy Migration Engineer  

---

## 1. MÔ HÌNH KIẾN TRÚC TỔNG THỂ

Kiến trúc đích phân tách hoàn toàn giữa tầng hiển thị (Frontend) và tầng xử lý nghiệp vụ/lưu trữ (Backend & Database):

```text
+-----------------------------------------------------------------------+
|                       TRÌNH DUYỆT NGƯỜI DÙNG                          |
|             (Desktop, Tablet, Mobile - UI Tiếng Việt Chuẩn)            |
+-----------------------------------------------------------------------+
                                   |
                                   | HTTP / HTTPS (JSON)
                                   v
+-----------------------------------------------------------------------+
|                    FRONTEND CLIENT (VITE + REACT + TS)                |
|  - Cổng phát triển: 5173 (Dev Proxy -> /api -> Spring Boot:8080)       |
|  - Framework: React 18/19 + TypeScript (strict mode)                   |
|  - Styling: Tailwind CSS (Clean Web UI - Không gradient tím AI)       |
|  - Routing: React Router v6 (Client-side routing theo vai trò)        |
|  - Quản trị State: React Context + Custom Hooks + Axios Client         |
+-----------------------------------------------------------------------+
                                   |
                                   | REST API JSON (/api/...)
                                   | Cookie-based Session / Auth Header
                                   v
+-----------------------------------------------------------------------+
|                     BACKEND (SPRING BOOT 3.4.5)                       |
|  - Cổng dịch vụ: 8080                                                 |
|  - Build Tool: Gradle Kotlin DSL (build.gradle.kts + Wrapper)         |
|  - Kiến trúc: Controller (@RestController) -> Service -> Repository   |
|  - Xác thực & Phân quyền: Spring Security 6 (RBAC: ADMIN, CLIENT, FL)  |
|  - Quản lý DTO: Tách biệt Entity Database với API Request/Response    |
|  - Xử lý lỗi toàn cục: @RestControllerAdvice với mã lỗi & message chuẩn|
+-----------------------------------------------------------------------+
                                   |
                                   | JDBC Connection Pool (HikariCP)
                                   v
+-----------------------------------------------------------------------+
|                        CƠ SỞ DỮ LIỆU (MYSQL 8.0)                      |
|  - Database: talentmatch_pro (Container mysql:8.0)                    |
|  - Port nội bộ Compose: 3306                                          |
|  - Lưu trữ bền vững: Docker Volume (mysql_data)                       |
+-----------------------------------------------------------------------+
```

---

## 2. CẤU TRÚC THƯ MỤC DỰ ÁN ĐÍCH

```text
TalentMatch/
├── frontend/                                # Ứng dụng Frontend độc lập
│   ├── public/                              # Tệp tĩnh (favicon, logo, icons, svg)
│   ├── src/
│   │   ├── app/
│   │   │   ├── router/                      # Cấu hình routes tập trung & Route guards
│   │   │   └── providers/                   # AuthProvider, ToastProvider
│   │   ├── assets/                          # Hình ảnh, icons nội bộ
│   │   ├── components/
│   │   │   ├── ui/                          # Button, Input, Modal, Badge, Card, Table, Pagination
│   │   │   └── layout/                      # Navbar, Sidebar (Marketplace/Client/FL/Admin), Footer
│   │   ├── features/                        # Module nghiệp vụ chuyên biệt
│   │   │   ├── auth/                        # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── jobs/                        # JobSearch, JobFilters, JobDetail, JobApplyModal
│   │   │   ├── customer/                    # JobForm, ApplicantsManagement, TalentMatchExplorer
│   │   │   ├── freelancer/                  # ProfileChecklist, ApplicationList, SavedJobs
│   │   │   ├── projects/                    # ContractDetail, Milestones, DeliverySubmission
│   │   │   ├── payments/                    # EscrowCheckout, PaymentHistory
│   │   │   └── admin/                       # UserModeration, JobModeration, Disputes, AuditLog
│   │   ├── hooks/                           # useAuth, useDebounce, usePagination
│   │   ├── lib/
│   │   │   └── api/                         # Axios client, interceptors, error handler
│   │   ├── types/                           # TypeScript interfaces (User, Job, Project, DTOs)
│   │   ├── utils/                           # Format tiền tệ VNĐ, ngày tháng, thời gian tương đối
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css                        # Tailwind directives & CSS design tokens
│   ├── Dockerfile                           # Dockerfile phát triển cho Frontend
│   ├── .dockerignore
│   ├── package.json                         # Dependencies của frontend
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.ts                       # Cấu hình Vite & Proxy /api sang backend
│
├── backend/                                 # Ứng dụng Backend Spring Boot
│   ├── gradle/wrapper/                      # Gradle Wrapper binaries & config
│   │   ├── gradle-wrapper.jar
│   │   └── gradle-wrapper.properties
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/talentmatch/
│   │   │   │   ├── config/                  # SecurityConfig, CorsConfig, DataInitializer
│   │   │   │   ├── controller/              # @RestController (@RequestMapping("/api/..."))
│   │   │   │   ├── dto/                     # Request & Response DTOs
│   │   │   │   ├── exception/               # GlobalExceptionHandler, CustomExceptions
│   │   │   │   ├── model/                   # JPA Entities & Enums
│   │   │   │   ├── repository/              # Spring Data JPA Repositories
│   │   │   │   └── service/                 # Nghiệp vụ lõi (10 services hiện có)
│   │   │   └── resources/
│   │   │       └── application.properties   # Cấu hình DB, Mail, Ports
│   │   └── test/java/com/talentmatch/       # Unit & Integration Tests
│   ├── build.gradle.kts                     # Gradle Kotlin DSL build script (Thay thế Maven)
│   ├── settings.gradle.kts
│   ├── gradlew
│   ├── gradlew.bat
│   ├── Dockerfile                           # Multi-stage Dockerfile cho Spring Boot
│   └── .dockerignore
│
├── docker-entrypoint-initdb.d/              # Scripts khởi tạo database MySQL
├── docs/                                    # Toàn bộ tài liệu di chuyển (Migration Docs)
│   └── migration/
│       ├── audit.md
│       ├── architecture.md
│       ├── page-mapping.md
│       ├── api-contracts.md
│       └── migration-plan.md
│
├── compose.yaml                             # Docker Compose hợp nhất (frontend + backend + mysql)
├── package.json                             # Root package.json chứa lệnh "npm run dev" duy nhất
├── .env.example                             # Mẫu biến môi trường an toàn
└── README.md                                # Hướng dẫn cài đặt, vận hành & kiểm thử
```

---

## 3. PHÂN ĐỊNH TRÁCH NHIỆM RÕ RÀNG

### 3.1. Trách nhiệm của Frontend (Client-side)
1. **Render giao diện:** Hiển thị trực quan, thích ứng với mọi kích thước màn hình (Responsive Mobile, Tablet, Desktop).
2. **Client-side Routing:** Định tuyến bằng React Router, hiển thị trang 404 cho route không hợp lệ.
3. **Route Guards:** Bảo vệ các khu vực yêu cầu đăng nhập theo vai trò (`/admin/*`, `/customer/*`, `/freelancer/*`). Chuyển hướng người dùng chưa đăng nhập về trang `/login`.
4. **Trải nghiệm người dùng:** Hiển thị loading skeleton, spinner, thông báo thành công/lỗi rõ ràng (Toast), xử lý trường hợp dữ liệu rỗng (Empty State).
5. **Kiểm tra sơ bộ đầu vào (Client Validation):** Bắt buộc các trường nhập liệu, kiểm tra định dạng email, độ dài mật khẩu, giá tiền trước khi gửi lên máy chủ để tăng tính phản hồi nhanh.

### 3.2. Trách nhiệm của Backend (Server-side)
1. **Toàn vẹn nghiệp vụ:** Là nơi duy nhất quyết định tính hợp lệ của giao dịch, chấp thuận ứng viên, chuyển trạng thái hợp đồng, hoàn tiền ký quỹ, chấm điểm match score.
2. **Bảo mật & Quyền truy cập:** Kiểm tra quyền hạn của người dùng trên từng tài nguyên (ví dụ: Client A không được sửa hoặc xem danh sách ứng viên của Client B; Freelancer không được ký hợp đồng thay Client).
3. **Validation quyết định:** Sử dụng Bean Validation (`@Valid`, `@NotNull`, `@Size`,...) và kiểm tra logic nghiệp vụ phức tạp.
4. **Giao dịch cơ sở dữ liệu:** Quản lý `@Transactional` đảm bảo tính nhất quán của dữ liệu (ACID).
5. **Cấu trúc JSON phản hồi ổn định:** Định dạng dữ liệu DTO rõ ràng, không để lộ Entity JPA hoặc gây vòng lặp tham chiếu tuần hoàn (circular references).

---

## 4. CHIẾN LƯỢC XÁC THỰC VÀ PHIÊN LÀM VIỆC (AUTHENTICATION)

- **Cơ chế xác thực:** Spring Security với Session Cookie (`JSESSIONID`).
- **Endpoint xác thực chuyên biệt:**
  - `POST /api/auth/login`: Nhận `{ "email": "...", "password": "..." }`, xác thực thông qua AuthenticationManager, tạo session an toàn và trả về thông tin người dùng kèm vai trò (`Role`).
  - `POST /api/auth/logout`: Hủy session hiện tại và trả về phản hồi thành công.
  - `GET /api/auth/me`: Trả về thông tin của tài khoản đang đăng nhập trong phiên làm việc hiện tại hoặc mã `401 Unauthorized` nếu chưa đăng nhập.
  - `POST /api/auth/register`: Đăng ký tài khoản mới và gửi email kích hoạt.
- **Xử lý CORS & Cookie:**
  - Trong môi trường phát triển: Vite Dev Server đóng vai trò Reverse Proxy (chuyển tiếp các request `/api` sang backend `http://localhost:8080`), nhờ đó trình duyệt xem frontend và backend cùng chung một origin `localhost:5173`, Session Cookie được gửi nhận tự nhiên mà không bị chặn bởi chính sách Third-party Cookie.
  - Trong môi trường Production / Docker Compose: Nginx hoặc Spring Boot cấu hình CORS cụ thể (`allowedOrigins`, `allowCredentials = true`).

---

## 5. BẢO ĐẢM TIÊU CHUẨN GIAO DIỆN "CLEAN WEB UI"

Tuân thủ nghiêm ngặt theo [.agents/rules/clean-web-ui.md](../../.agents/rules/clean-web-ui.md):
- **Ngôn ngữ:** 100% tiếng Việt chuẩn xác cho nhãn, thông báo, tiêu đề, trạng thái, bộ lọc và nội dung giao diện.
- **Không dùng gradient AI:** Nền trang dùng màu trung tính (`#f8fafc` hoặc `#ffffff`), bề mặt nội dung trắng sáng, chữ xám đậm tương phản cao.
- **Không lồng thẻ (No nested cards):** Dùng layout phân chia theo dòng, cột, khoảng cách (spacing 8px, 12px, 16px, 24px) và typography rõ ràng.
- **Đổ bóng & Bo góc nhẹ nhàng:** `border-radius` từ 6px đến 10px, shadow mờ nhẹ (`0 1px 3px rgba(0,0,0,0.05)`).
- **Trực quan & Hiệu quả:** Tối ưu hóa bảng dữ liệu, danh sách dự án, form nộp đề xuất và các mốc thanh toán.

---

## 6. QUY TRÌNH BUILD & ORCHESTRATION DOCKER

### 6.1. Gradle Kotlin DSL cho Backend
- File cấu hình: `build.gradle.kts` áp dụng:
  - Plugin `org.springframework.boot` version `3.4.5`.
  - Plugin `io.spring.dependency-management` version `1.1.7`.
  - Java 21 Toolchain.
  - Các thư viện cần thiết: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-security`, `spring-boot-starter-validation`, `spring-boot-starter-mail`, `mysql-connector-j`, `spring-boot-devtools`.
- Loại bỏ dependency Thymeleaf sau khi toàn bộ endpoint đã chuyển thành công sang REST API.

### 6.2. Luồng phát triển "1 Lệnh Duy Nhất" (One-Command Development)
- Tệp gốc `package.json` định nghĩa:
  ```json
  {
    "name": "talentmatch-platform",
    "private": true,
    "scripts": {
      "dev": "docker compose -f compose.yaml up --build"
    }
  }
  ```
- Khi chạy `npm run dev` từ thư mục gốc:
  1. Service `mysql` khởi động và kiểm tra tính sẵn sàng (Healthcheck `mysqladmin ping`).
  2. Service `backend` khởi động sau khi MySQL sẵn sàng, build bằng Gradle Wrapper và kết nối tới database container.
  3. Service `frontend` khởi động với Vite trên port `5173`, hỗ trợ Hot Module Replacement (HMR) khi chỉnh sửa code trên máy host.
