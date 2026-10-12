# BÁO CÁO KIỂM KÊ VÀ PHÂN TÍCH HIỆN TRẠNG (MIGRATION AUDIT)
**Dự án:** TalentMatch — Freelance Marketplace  
**Ngày thực hiện:** 10/10/2026  
**Vai trò:** Senior Software Architect & Legacy Migration Engineer  

---

## 1. TỔNG QUAN HỆ THỐNG HIỆN TẠI

### 1.1. Công nghệ & Môi trường nền tảng
- **Ngôn ngữ & Runtime:** Java 21 (Java SE 21.0.9 LTS).
- **Framework backend:** Spring Boot 3.4.5 (`org.springframework.boot:spring-boot-starter-parent:3.4.5`).
- **Build tool hiện tại:** Maven (`pom.xml`), chưa tích hợp Gradle Wrapper.
- **Frontend server-side render:** Thymeleaf (`spring-boot-starter-thymeleaf`, `thymeleaf-extras-springsecurity6`, `thymeleaf-extras-java8time:3.0.4.RELEASE`).
- **ORM & Database:** Spring Data JPA / Hibernate, MySQL 8.0 (`mysql-connector-j`, database `talentmatch_pro`).
- **Bảo mật:** Spring Security 6 (`spring-boot-starter-security`, form login với session cookie, remember-me token `talentmatch-pro-remember-key`, BCrypt password encoder).
- **Xác thực & Biểu mẫu:** `spring-boot-starter-validation`.
- **Email:** `spring-boot-starter-mail` (kết nối Gmail SMTP qua TLS/SSL).
- **Môi trường container:** Docker & Docker Compose (`mysql:8.0`, Spring Boot build từ Dockerfile với Maven multi-stage).
- **Hệ thống Node & npm trên máy chủ:** Node.js v24.14.1, npm v11.11.0.

### 1.2. Nguồn dữ liệu & Tính chân thực của dữ liệu
- Hệ thống **KHÔNG PHẢI** dữ liệu giả (pure mock data) trên giao diện tĩnh.
- Tất cả các nghiệp vụ tương tác trực tiếp với Database thật thông qua 16 Spring Data Repositories.
- Có cơ chế **DataInitializer** (`com.talentmatch.config.DataInitializer` - 58KB code):
  - Tự động nạp sẵn tài khoản mẫu, hàng chục doanh nghiệp, hàng trăm công việc (Jobs) theo chuẩn thị trường Việt Nam (Figma, React, Spring Boot, 3D, Marketing,...), các hồ sơ Freelancer mẫu, ứng tuyển mẫu (Applications), hợp đồng dự án (Projects), Milestones, thanh toán và đánh giá.
  - Kiểm tra điều kiện `jobs.count() >= 375` để không ghi đè dữ liệu thật sau khi khởi tạo lần đầu.
  - Tài khoản mặc định hệ thống:
    - Admin: `admin@talentmatch.vn` / `admin123`
    - Client / Khách hàng: `client@talentmatch.vn` / `123456`
    - Freelancer: `freelancer@talentmatch.vn` / `123456`

---

## 2. KIỂM KÊ TOÀN DIỆN CÁC TRANG & THYMELEAF TEMPLATES

Hệ thống hiện có tổng cộng **42 tệp Thymeleaf template** phân bổ theo 9 phân vùng chức năng:

| STT | Mã Trang (Page ID) | URL Cũ (Server Route) | Tệp Template Thymeleaf | Controller Xử Lý | Vai Trò (Role) | Chức Năng Nghiệp Vụ Chính | Nguồn Dữ Liệu |
|:---:|---|---|---|---|:---:|---|---|
| 1 | `PUB_HOME` | `/` | `index.html` | `HomeController` | Public | Trang chủ marketplace: Dự án nổi bật, Freelancer tiêu biểu, số liệu thống kê nền tảng | Database (`JobService`, `UserRepository`, `JobRepository`) |
| 2 | `PUB_JOB_LIST` | `/jobs`, `/projects` | `jobs/list.html` | `JobController` | Public / Freelancer | Tìm kiếm & lọc nâng cao danh sách dự án (từ khóa, ngành nghề, kỹ năng, ngân sách, deadline, hình thức làm việc, cấp độ, sắp xếp, tính điểm phù hợp match score) | Database |
| 3 | `PUB_JOB_DETAIL` | `/jobs/{id}` | `jobs/detail.html` | `JobController` | Public / Freelancer | Xem chi tiết công việc, yêu cầu kỹ năng, ngân sách, danh sách việc tương tự, form nộp Proposal ứng tuyển, lưu việc yêu thích | Database |
| 4 | `PUB_JOB_DISCUSS` | `/jobs/{id}/discussion` | `jobs/discussion.html` | `TalentWorkflowController` | Public / Freelancer / Customer | Diễn đàn hỏi - đáp công khai về công việc giữa Freelancer và Khách hàng | Database (`JobQuestionRepository`) |
| 5 | `PUB_FL_LIST` | `/freelancers`, `/hire` | `freelancer/public-list.html` | `HomeController` | Public | Danh sách Freelancer công khai, tìm kiếm theo từ khóa kỹ năng, chuyên môn | Database |
| 6 | `PUB_FL_PROFILE` | `/freelancers/{id}` | `freelancer/public-profile.html` | `HomeController` | Public | Xem hồ sơ công khai của Freelancer (kỹ năng, kinh nghiệm, portfolio, dự án đã làm, đánh giá) | Database |
| 7 | `AUTH_LOGIN` | `/login` | `auth/login.html` | `AuthController` | Anonymous | Đăng nhập tài khoản bằng Email & Mật khẩu | Spring Security FormLogin |
| 8 | `AUTH_REGISTER` | `/register` | `auth/register.html` | `AuthController` | Anonymous | Đăng ký tài khoản mới (lựa chọn vai trò Freelancer hoặc Khách hàng), kích hoạt gửi email xác thực | `UserService`, `MailService` |
| 9 | `AUTH_FORGOT` | `/forgot-password` | `auth/forgot-password.html` | `AuthController` | Anonymous | Quên mật khẩu, gửi link reset mật khẩu qua email token | `UserService`, `MailService` |
| 10 | `AUTH_RESET` | `/reset-password` | `auth/reset-password.html` | `AuthController` | Anonymous | Đặt lại mật khẩu mới với token xác thực | `UserService` |
| 11 | `SYS_ERROR` | `/error` | `error.html` | Spring Boot Error Controller | Public | Trang hiển thị thông báo lỗi hệ thống | Server Context |
| 12 | `NOTIF_LIST` | `/notifications` | `notifications/list.html` | `NotificationController` | Authenticated | Danh sách thông báo tài khoản, đánh dấu đã đọc và điều hướng | Database (`NotificationService`) |
| 13 | `CUST_DASHBOARD` | `/customer/dashboard` | `customer/dashboard.html` | `CustomerController` | `ROLE_CUSTOMER` | Bảng điều khiển khách hàng: chỉ số thống kê, biểu đồ cột chi phí/dự án, biểu đồ tròn trạng thái, dự án mới nhất | Database (`DashboardService`) |
| 14 | `CUST_PROFILE` | `/customer/profile` | `customer/profile.html` | `CustomerController` | `ROLE_CUSTOMER` | Xem và cập nhật hồ sơ doanh nghiệp khách hàng (tên công ty, quy mô, mã số thuế, liên hệ) | Database (`UserService`) |
| 15 | `CUST_JOBS` | `/customer/jobs` | `customer/jobs.html` | `CustomerController` | `ROLE_CUSTOMER` | Quản lý các tin tuyển dụng đã đăng (lọc theo trạng thái: OPEN, PAUSED, CLOSED, CANCELLED) | Database (`JobRepository`) |
| 16 | `CUST_JOB_NEW` | `/customer/jobs/new` | `customer/job-form.html` | `CustomerController` | `ROLE_CUSTOMER` | Form đăng tin tuyển dụng mới với validation (tiêu đề, lĩnh vực, ngân sách, deadline, kỹ năng,...) | Database (`JobService`) |
| 17 | `CUST_JOB_EDIT` | `/customer/jobs/{id}/edit` | `customer/job-form.html` | `CustomerController` | `ROLE_CUSTOMER` | Chỉnh sửa tin tuyển dụng đang mở | Database (`JobService`) |
| 18 | `CUST_JOB_APPL` | `/customer/jobs/{id}/applicants` | `customer/applicants.html` | `CustomerController` | `ROLE_CUSTOMER` | Xem danh sách ứng viên đã nộp đơn vào một công việc cụ thể, duyệt ưu tiên (shortlist) hoặc chấp thuận (accept) | Database (`JobService`, `ProjectService`) |
| 19 | `CUST_ALL_APPL` | `/customer/applicants` | `customer/all-applicants.html` | `CustomerController` | `ROLE_CUSTOMER` | Tổng hợp toàn bộ hồ sơ ứng tuyển từ tất cả các tin đã đăng của khách hàng | Database |
| 20 | `CUST_TALENT` | `/customer/talent` | `customer/talent.html` | `TalentWorkflowController` | `ROLE_CUSTOMER` | Khám phá & gợi ý Freelancer theo thuật toán match score đối chiếu với công việc của khách hàng | Database & Matching Algorithm |
| 21 | `CUST_INVITES` | `/customer/invitations` | `customer/invitations.html` | `TalentWorkflowController` | `ROLE_CUSTOMER` | Quản lý lịch sử các lời mời hợp tác đã gửi tới Freelancer | Database (`JobInvitationRepository`) |
| 22 | `CUST_PROJECTS` | `/customer/projects` | `customer/projects.html` | `CustomerController` | `ROLE_CUSTOMER` | Danh sách các hợp đồng dự án đang triển khai với Freelancer | Database (`ProjectService`) |
| 23 | `CUST_HISTORY` | `/customer/history` | `customer/history.html` | `CustomerController` | `ROLE_CUSTOMER` | Lịch sử đăng tin, dự án và toàn bộ giao dịch thanh toán của khách hàng | Database |
| 24 | `FL_DASHBOARD` | `/freelancer/dashboard` | `freelancer/dashboard.html` | `FreelancerController` | `ROLE_FREELANCER` | Bảng điều khiển Freelancer: thu nhập, số lượng dự án, tỷ lệ hoàn thành, biểu đồ hiệu suất | Database (`DashboardService`) |
| 25 | `FL_PROFILE` | `/freelancer/profile` | `freelancer/profile.html` | `FreelancerController` | `ROLE_FREELANCER` | Hồ sơ chuyên môn Freelancer: Checklist độ hoàn thiện hồ sơ, kỹ năng, kinh nghiệm, biểu đồ thống kê API, chỉnh sửa thông tin | Database & REST API `/profile/statistics` |
| 26 | `FL_APPL` | `/freelancer/applications` | `freelancer/applications.html` | `FreelancerController` | `ROLE_FREELANCER` | Danh sách đơn ứng tuyển đã gửi, trạng thái duyệt (SUBMITTED, SHORTLISTED, ACCEPTED, REJECTED), rút đơn ứng tuyển | Database (`JobService`) |
| 27 | `FL_PROJECTS` | `/freelancer/projects` | `freelancer/projects.html` | `FreelancerController` | `ROLE_FREELANCER` | Quản lý hợp đồng dự án đang làm, tiến độ milestone, doanh thu đã giải ngân, tiến độ công việc | Database (`ProjectService`, `PaymentService`) |
| 28 | `FL_SAVED` | `/freelancer/saved-jobs` | `freelancer/saved-jobs.html` | `FreelancerController` | `ROLE_FREELANCER` | Danh sách công việc đã lưu vào mục quan tâm, thao tác gỡ bỏ | Database (`JobService`) |
| 29 | `FL_INVITES` | `/freelancer/invitations` | `freelancer/invitations.html` | `TalentWorkflowController` | `ROLE_FREELANCER` | Danh sách lời mời phỏng vấn/dự án từ khách hàng, phản hồi đồng ý hoặc từ chối | Database (`JobInvitationRepository`) |
| 30 | `FL_HISTORY` | `/freelancer/history` | `freelancer/history.html` | `FreelancerController` | `ROLE_FREELANCER` | Lịch sử ứng tuyển, hợp đồng và dòng tiền thanh toán | Database |
| 31 | `PROJ_DETAIL` | `/projects/{id}` | `projects/detail.html` | `ProjectController` | Authenticated (Participant) | Chi tiết hợp đồng dự án: ký hợp đồng điện tử, quản lý Milestones, bàn giao sản phẩm, yêu cầu chỉnh sửa, nghiệm thu, thanh toán, đánh giá & báo cáo | Database (`ProjectService`, `PaymentService`, `DeliveryService`) |
| 32 | `PAY_CHECKOUT` | `/payment/project/{id}` | `payment/checkout.html` | `PaymentController` | `ROLE_CUSTOMER` | Trang thanh toán ký quỹ (Escrow Checkout) cho dự án hoặc milestone cụ thể | Database (`PaymentService`) |
| 33 | `PAY_GATEWAY` | `/payment/...` (Sandbox) | `payment/demo-gateway.html`, `vnpay-return.html` | `PaymentController`, `VnPaySandboxService` | Authenticated | Cổng thanh toán giả lập VNPay Sandbox / Thẻ nội địa | Cổng thanh toán nội bộ |
| 34 | `ADM_DASHBOARD` | `/admin/dashboard` | `admin/dashboard.html` | `AdminController` | `ROLE_ADMIN` | Tổng quan hệ thống: Thống kê doanh thu, người dùng, việc mở, tranh chấp, báo cáo chờ xử lý, biểu đồ tăng trưởng | Database (`DashboardService`) |
| 35 | `ADM_USERS` | `/admin/users` | `admin/users.html` | `AdminController` | `ROLE_ADMIN` | Quản trị danh sách người dùng, lọc vai trò/trạng thái, khóa / mở khóa tài khoản | Database (`UserRepository`, Audit Log) |
| 36 | `ADM_JOBS` | `/admin/jobs` | `admin/jobs.html` | `AdminController` | `ROLE_ADMIN` | Quản lý & kiểm duyệt tin tuyển dụng: tạm ẩn tin vi phạm, mở lại tin, gắn huy hiệu Nổi bật / Xác thực | Database (`JobRepository`, Audit Log) |
| 37 | `ADM_PROJECTS` | `/admin/projects` | `admin/projects.html` | `AdminController` | `ROLE_ADMIN` | Giám sát toàn bộ hợp đồng dự án trên sàn giao dịch | Database (`ProjectRepository`) |
| 38 | `ADM_PAYMENTS` | `/admin/payments` | `admin/payments.html` | `AdminController` | `ROLE_ADMIN` | Quản trị sổ cái giao dịch: đối soát nạp tiền, ký quỹ, giải ngân, hoàn tiền | Database (`PaymentRepository`) |
| 39 | `ADM_REPORTS` | `/admin/reports` | `admin/reports.html` | `AdminController` | `ROLE_ADMIN` | Xử lý tố cáo/báo cáo vi phạm giữa Freelancer và Khách hàng (Đã xử lý, Giải quyết, Từ chối kèm lý do) | Database (`TalentReportRepository`) |
| 40 | `ADM_DISPUTES` | `/admin/disputes` | `admin/disputes.html` | `AdminDisputeController` | `ROLE_ADMIN` | Trọng tài xử lý tranh chấp hợp đồng: phê duyệt hoàn tiền ký quỹ về ví demo hoặc cho phép tiếp tục dự án | Database (`ProjectRepository`, `PaymentRepository`) |
| 41 | `ADM_AUDIT` | `/admin/audit` | `admin/audit.html` | `AdminController` | `ROLE_ADMIN` | Nhật ký hành vi quản trị (Audit Trail): ghi nhận ai thực hiện, loại hành động, đối tượng tác động, thời gian | Database (`AdminAuditLogRepository`) |
| 42 | `FRAG_COMMON` | N/A | `fragments/common.html` | `GlobalControllerAdvice` | All | Chứa Layout chung: Market Topbar, Sidebar phân quyền theo vai trò, User dropdown, Footer, Navigation, Modal | Phân mảnh Thymeleaf |

---

## 3. KIỂM KÊ BACKEND: ENTITY, REPOSITORY, SERVICE & CONTROLLER

### 3.1. Các thực thể cốt lõi (Domain Models & Entities - 22 files)
1. `User`: Tài khoản người dùng (Freelancer, Customer, Admin). Lưu trữ thông tin cá nhân, kỹ năng, tỷ lệ đánh giá, đơn giá theo giờ, số dư TalentCredit, trạng thái enabled/locked.
2. `Job`: Tin tuyển dụng / Dự án công việc. Có ngân sách, hạn chót, kỹ năng, phân loại ngành, hình thức làm việc, cấp độ kinh nghiệm, tiêu chí nghiệm thu, trạng thái `OPEN`, `PAUSED`, `CLOSED`, `CANCELLED`.
3. `JobApplication`: Đơn ứng tuyển của Freelancer (Proposal, báo giá chào thầu, số ngày hoàn thành, link portfolio, trạng thái `SUBMITTED`, `SHORTLISTED`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`).
4. `Project`: Hợp đồng dự án được khởi tạo khi Client chấp thuận một đơn ứng tuyển. Lưu tổng giá trị, tiến độ, thời điểm ký của hai bên (`customerSignedAt`, `freelancerSignedAt`), trạng thái (`WAITING_PAYMENT`, `IN_PROGRESS`, `WAITING_ACCEPTANCE`, `COMPLETED`, `CANCELLED`, `DISPUTED`).
5. `Milestone`: Các mốc công việc trong dự án (tiêu đề, mô tả, số tiền, hạn chót, trạng thái `UNPAID`, `PAID`, `IN_PROGRESS`, `SUBMITTED`, `COMPLETED`, ghi chú yêu cầu chỉnh sửa `revisionNote`).
6. `Payment`: Giao dịch tài chính (Ký quỹ, giải ngân, hoàn tiền). Trạng thái `PENDING`, `PAID`, `DISBURSED`, `REFUNDED`, mã giao dịch duy nhất.
7. `ProjectDelivery`: File bàn giao sản phẩm hoặc liên kết ngoài kèm ghi chú từ Freelancer cho từng mốc hoặc toàn bộ dự án.
8. `JobInvitation`: Lời mời làm việc từ Client gửi riêng cho Freelancer (`SENT`, `ACCEPTED`, `DECLINED`).
9. `JobQuestion`: Câu hỏi và câu trả lời công khai trên tin tuyển dụng.
10. `TalentReport`: Đơn khiếu nại/tố cáo đối tác vi phạm điều khoản hợp tác gửi lên Admin.
11. `TalentReview`: Đánh giá chất lượng 1–5 sao và nhận xét phản hồi sau khi hợp đồng hoàn tất.
12. `SavedJob`: Lưu công việc quan tâm của Freelancer.
13. `AdminAuditLog`: Nhật ký hành động kiểm duyệt của Quản trị viên.
14. `VerificationToken` & `PasswordResetToken`: Mã token xác thực email và đặt lại mật khẩu với thời hạn hết hạn.
15. `Notification`: Thông báo người dùng trong hệ thống.
16. Các Enums: `Role`, `JobStatus`, `ApplicationStatus`, `ProjectStatus`, `MilestoneStatus`, `PaymentStatus`.

### 3.2. Lớp Dịch Vụ Nghiệp Vụ (Services - 10 files)
1. `UserService`: Đăng ký, kích hoạt token, xác thực email, quản lý mật khẩu, cập nhật hồ sơ cá nhân và hồ sơ doanh nghiệp.
2. `JobService`: Tìm kiếm & lọc nâng cao (full-text search, khoảng ngân sách, deadline, category, skill), tính điểm matching, quản lý việc đã lưu, nộp đơn ứng tuyển, rút đơn.
3. `ProjectService`: Tạo dự án từ application, quản lý mốc milestones, ký hợp đồng điện tử hai bên, yêu cầu chỉnh sửa (revisions), hoàn tất dự án, hủy hợp đồng, phân quyền người tham gia.
4. `PaymentService`: Tính toán số tiền thanh toán, thực hiện thanh toán ký quỹ (escrow payment), giải ngân, lịch sử giao dịch.
5. `DeliveryService`: Xử lý upload file bàn giao sản phẩm (lưu trữ trên filesystem máy chủ), kiểm tra quyền sở hữu, phục vụ tải file đính kèm an toàn.
6. `DashboardService`: Tính toán số liệu thống kê doanh thu, khối lượng công việc, biểu đồ tròn phân bố trạng thái, biểu đồ cột tăng trưởng theo ngày/tháng cho cả 3 vai trò.
7. `MatchingService`: Thuật toán chấm điểm mức độ phù hợp giữa Freelancer và dự án dựa trên kỹ năng trùng khớp, năm kinh nghiệm, lĩnh vực chuyên môn và hình thức làm việc.
8. `MailService`: Gửi email xác thực tài khoản và liên kết đặt lại mật khẩu qua SMTP.
9. `NotificationService`: Tạo và quản lý hộp thư thông báo tài khoản.
10. `VnPaySandboxService`: Mô phỏng quy trình tạo URL thanh toán và xác minh phản hồi giao dịch qua VNPay.

---

## 4. TÀI NGUYÊN GIAO DIỆN (STATIC ASSETS) & THƯ VIỆN GIAO DIỆN

### 4.1. Tệp tĩnh trong `src/main/resources/static/`
- **CSS:** Có 11 file CSS với dung lượng tương đối lớn (~530 KB):
  - `admin-v30.css` (21.4 KB): Style khu vực quản trị Admin.
  - `client-v29.css` (20.7 KB): Style khu vực khách hàng doanh nghiệp.
  - `freelancer-pages-v36.css` (15.2 KB): Style hồ sơ, ứng tuyển và quản lý của Freelancer.
  - `home.css` (45.7 KB): Style trang chủ.
  - `jobs-board-v28.css` & `v33.css` (~21 KB): Bộ lọc và bảng danh sách công việc.
  - `market.css` (121.3 KB) & `reference-ui.css` (239.9 KB) & `style.css` (84.9 KB): CSS gốc chứa layout, hệ thống nút, bảng màu, form,...
- **JavaScript:** 4 file script thuần:
  - `app.js` (15.7 KB): Xử lý dropdown user, modal, flash alerts, tabs.
  - `jobs-board-v28.js` & `v33.js` (~10.8 KB): Xử lý bộ lọc tìm kiếm realtime và cập nhật URL query string.
  - `market.js` (11.6 KB): Xử lý tương tác menu sidebar, notification badge.
- **Font & Icon:**
  - Font Inter từ Google Fonts CDN.
  - Font Awesome 6.6.0 từ CDNJS.
- **Hình ảnh:** `images/hero-workspace.svg` (2.8 KB).

---

## 5. ĐÁNH GIÁ RỦI RO & THÁCH THỨC KHI CHUYỂN ĐỔI

1. **Xác thực & Quản lý phiên (Authentication State):**
   - Hiện tại hệ thống dựa vào Spring Security Session Cookie (`JSESSIONID`) và CSRF token của Spring MVC form.
   - Khi chuyển sang SPA (Single Page Application) với React + Vite:
     - Trong môi trường phát triển (Development): Cần cấu hình **Vite Proxy** (`/api` -> `http://localhost:8080`) để chia sẻ cookie cùng domain `localhost`, tránh xung đột CORS và mất cookie phiên.
     - Cần bổ sung các endpoint REST API cho đăng nhập (`POST /api/auth/login`), đăng xuất (`POST /api/auth/logout`), và lấy thông tin phiên người dùng hiện tại (`GET /api/auth/me`).
2. **Chuyển đổi Build System sang Gradle Kotlin DSL (Mục 17):**
   - Dự án hiện dùng `pom.xml` của Maven và không có sẵn Gradle Wrapper trên host.
   - Cần cấu hình chuẩn xác `build.gradle.kts`, `settings.gradle.kts` và tạo bộ wrapper (`gradlew`, `gradlew.bat`, `gradle-wrapper.jar`, `gradle-wrapper.properties`) tương thích với Spring Boot 3.4.5 và Java 21.
   - Kiểm tra kỹ việc biên dịch và chạy test để đảm bảo không bị thiếu dependency nào khi chuyển từ Maven sang Gradle.
3. **Upload & Download File (Bàn giao sản phẩm):**
   - Endpoint `DeliveryController` đang phục vụ tải file qua `ResponseEntity<UrlResource>`. Cần bảo toàn luồng multipart form data trong REST API và hỗ trợ download file an toàn trên React.
4. **Bảo toàn quy chuẩn giao diện Clean Web UI:**
   - Đảm bảo giao diện React mới sạch sẽ, chuyên nghiệp, giữ nguyên toàn bộ nhãn tiếng Việt chuẩn mực, loại bỏ triệt để các phong cách màu tím AI hay card lồng card dư thừa.
