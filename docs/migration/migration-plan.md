# KẾ HOẠCH CHUYỂN ĐỔI (MIGRATION PLAN)
**Dự án:** TalentMatch — Freelance Marketplace  
**Ngày thực hiện:** 10/10/2026  
**Vai trò:** Senior Software Architect & Legacy Migration Engineer  

---

## 1. NGUYÊN TẮC THỰC HIỆN

1. **Bảo toàn 100% nghiệp vụ:** Không xóa, không tinh giản, không giả lập bất kỳ chức năng nào.
2. **Chuyển đổi từng bước (Incremental Migration):** Thực hiện theo từng mốc cụ thể, kiểm thử độc lập trước khi mở rộng.
3. **Tuân thủ Clean Web UI:** Giao diện bằng tiếng Việt, thiết kế chuẩn mực, loại bỏ hiệu ứng rườm rà.
4. **Build System chuẩn Gradle Kotlin DSL:** Backend chuyển sang `build.gradle.kts` và Gradle Wrapper.
5. **Workflow 1 lệnh duy nhất:** Sau khi thiết lập, `npm run dev` tại thư mục gốc khởi động toàn bộ hệ thống.

---

## 2. CÁC GIAI ĐOẠN TRIỂN KHAI

### Giai đoạn 1: Kiểm kê & Phân tích hiện trạng (ĐÃ HOÀN THÀNH)
- [x] Rà soát cấu trúc source code, Java 21, Spring Boot 3.4.5, dependencies, database schema, security.
- [x] Lập danh mục 42 tệp Thymeleaf template và toàn bộ 15 Controllers.
- [x] Soạn thảo `docs/migration/audit.md`, `docs/migration/architecture.md`, `docs/migration/page-mapping.md`, `docs/migration/api-contracts.md`.

### Giai đoạn 2: Chuyển đổi Build System Backend sang Gradle Kotlin DSL
- [ ] Xây dựng `build.gradle.kts` với đầy đủ dependencies tương thích Spring Boot 3.4.5 & Java 21.
- [ ] Thiết lập `settings.gradle.kts` (tên dự án: `talentmatch`).
- [ ] Thiết lập Gradle Wrapper đầy đủ (`gradlew`, `gradlew.bat`, `gradle/wrapper/gradle-wrapper.properties`).
- [ ] Xác minh khả năng biên dịch backend thông qua Gradle Wrapper: `./gradlew build -x test`.

### Giai đoạn 3: Tách REST API trong Spring Boot Backend
- [ ] Tạo gói `com.talentmatch.dto` chứa các Request/Response DTOs cần thiết.
- [ ] Cấu hình `SecurityConfig` hỗ trợ REST API:
  - Cho phép xác thực cookie session hoặc CORS với frontend.
  - Tích hợp endpoint `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
  - Cấu hình Global Exception Handler (`@RestControllerAdvice`) trả về JSON lỗi chuẩn.
- [ ] Xây dựng các `@RestController` tương ứng:
  - `ApiAuthController`: Đăng nhập, đăng xuất, phiên làm việc, đăng ký, quên/đặt lại mật khẩu.
  - `ApiHomeController`: Dữ liệu trang chủ, danh sách Freelancer công khai.
  - `ApiJobController`: Tìm kiếm & lọc việc, chi tiết việc, nộp proposal, lưu việc.
  - `ApiCustomerController`: Dashboard, quản lý tin đăng, quản lý ứng viên, shortlist, accept.
  - `ApiFreelancerController`: Dashboard, hồ sơ, rút đơn, việc đã lưu, dự án đang làm.
  - `ApiProjectController`: Hợp đồng, milestones, ký hợp đồng, bàn giao, đánh giá, khiếu nại.
  - `ApiPaymentController`: Thanh toán ký quỹ và lịch sử giao dịch.
  - `ApiAdminController`: Quản trị users, jobs, projects, payments, reports, disputes, audit log.
- [ ] Giữ nguyên 100% logic trong các `Service` và `Repository` hiện tại.

### Giai đoạn 4: Xây dựng Frontend Độc lập (Vite + React + TypeScript + Tailwind CSS)
- [ ] Khởi tạo thư mục `frontend/` với Vite, React, TypeScript và Tailwind CSS.
- [ ] Cấu hình Tailwind CSS tuân thủ nghiêm ngặt quy tắc Clean Web UI (`.agents/rules/clean-web-ui.md`).
- [ ] Xây dựng hạ tầng Frontend:
  - `src/lib/api/client.ts`: Axios instance với base URL `/api`, tự động gửi cookie (`withCredentials: true`), xử lý interceptor thông báo lỗi.
  - `src/types/`: Khai báo types an toàn cho User, Job, Project, Milestone, Application,...
  - `src/app/providers/AuthProvider.tsx`: Lưu trữ trạng thái đăng nhập, user hiện tại, hàm login/logout.
  - `src/app/router/`: Định nghĩa React Router v6 với các Route Guards (Public, Protected, Role-based).
- [ ] Xây dựng các Components UI dùng chung (Button, Input, Modal, Badge, Table, Pagination, Toast, EmptyState, LoadingSpinner).
- [ ] Xây dựng Layout chuẩn mực (Navbar, Marketplace Sidebar, Dashboard Sidebar, Footer).
- [ ] Triển khai các trang chức năng (Pages) theo bảng ánh xạ `docs/migration/page-mapping.md`:
  - Nhóm 1: Trang chủ, Danh sách việc, Chi tiết việc, Danh sách Freelancer, Chi tiết hồ sơ Freelancer.
  - Nhóm 2: Đăng nhập, Đăng ký, Quên mật khẩu, Đặt lại mật khẩu.
  - Nhóm 3: Khu vực Khách hàng (Dashboard, Quản lý tin, Đăng tin, Quản lý ứng viên, Tìm freelancer, Hợp đồng, Lịch sử).
  - Nhóm 4: Khu vực Freelancer (Dashboard, Hồ sơ chuyên môn, Đơn ứng tuyển, Hợp đồng đang làm, Việc đã lưu).
  - Nhóm 5: Khu vực Hợp đồng & Thanh toán (Chi tiết dự án, Milestones, Bàn giao, Ký hợp đồng, Escrow Checkout).
  - Nhóm 6: Khu vực Quản trị Admin (Dashboard, Người dùng, Kiểm duyệt tin, Giám sát hợp đồng, Sổ cái, Tranh chấp, Báo cáo, Audit).

### Giai đoạn 5: Container hóa Docker & Workflow 1 Lệnh (`npm run dev`)
- [ ] Tạo `backend/Dockerfile` (multi-stage build với Gradle Wrapper).
- [ ] Tạo `frontend/Dockerfile` (chạy Vite dev server trên port 5173 với HMR).
- [ ] Xây dựng `compose.yaml` tại thư mục gốc phối hợp 3 services:
  - `mysql`: Database MySQL 8.0, volume bền vững `mysql_data`, healthcheck.
  - `backend`: Phụ thuộc vào `mysql` (condition: service_healthy), port 8080.
  - `frontend`: Phụ thuộc vào `backend`, port 5173, mount volume cho hot-reload.
- [ ] Tạo tệp gốc `package.json` với script `"dev": "docker compose -f compose.yaml up --build"`.
- [ ] Tạo `.env.example` với các biến môi trường cấu hình mẫu.

### Giai đoạn 6: Kiểm thử, Đối chiếu & Hoàn thiện Tài liệu
- [ ] Kiểm thử luồng Đăng nhập / Đăng xuất với cả 3 vai trò (Admin, Client, Freelancer).
- [ ] Kiểm thử luồng ứng tuyển -> duyệt ứng viên -> tạo hợp đồng -> ký hợp đồng -> thanh toán ký quỹ -> bàn giao -> nghiệm thu -> đánh giá.
- [ ] Cập nhật tài liệu `README.md` với đầy đủ hướng dẫn vận hành, lệnh chạy và cấu hình.
