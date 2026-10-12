# BẢNG ĐỐI CHIẾU TRANG (PAGE MAPPING TABLE)
**Dự án:** TalentMatch — Freelance Marketplace  
**Ngày thực hiện:** 10/10/2026  
**Vai trò:** Senior Software Architect & Legacy Migration Engineer  

---

## BẢNG ÁNH XẠ ĐẦY ĐỦ TỪ THYMELEAF SANG REACT ROUTER

| STT | Trang | URL Cũ (Server Render) | URL Mới (React Route) | Component React Đích | Quyền Truy Cập (Auth Guard) | REST API Tương Ứng | Trạng Thái Migration |
|:---:|---|---|---|---|---|---|:---:|
| 1 | Trang chủ Marketplace | `/` | `/` | `HomePage` | Public | `GET /api/home/overview` | Chờ triển khai |
| 2 | Danh sách tìm việc | `/jobs`, `/projects` | `/jobs` | `JobListPage` | Public | `GET /api/jobs` | Chờ triển khai |
| 3 | Chi tiết công việc | `/jobs/{id}` | `/jobs/:id` | `JobDetailPage` | Public / Freelancer | `GET /api/jobs/:id`<br>`POST /api/jobs/:id/apply`<br>`POST /api/jobs/:id/save` | Chờ triển khai |
| 4 | Hỏi đáp về dự án | `/jobs/{id}/discussion` | `/jobs/:id/discussion` | `JobDiscussionPage` | Public / Participant | `GET /api/jobs/:id/discussion`<br>`POST /api/jobs/:id/discussion`<br>`POST /api/customer/questions/:id/answer` | Chờ triển khai |
| 5 | Danh sách Freelancer | `/freelancers`, `/hire` | `/freelancers` | `FreelancerListPage` | Public | `GET /api/freelancers` | Chờ triển khai |
| 6 | Hồ sơ Freelancer công khai | `/freelancers/{id}` | `/freelancers/:id` | `FreelancerDetailPage` | Public | `GET /api/freelancers/:id` | Chờ triển khai |
| 7 | Đăng nhập | `/login` | `/login` | `LoginPage` | Anonymous Only | `POST /api/auth/login` | Chờ triển khai |
| 8 | Đăng ký | `/register` | `/register` | `RegisterPage` | Anonymous Only | `POST /api/auth/register` | Chờ triển khai |
| 9 | Quên mật khẩu | `/forgot-password` | `/forgot-password` | `ForgotPasswordPage` | Anonymous Only | `POST /api/auth/forgot-password` | Chờ triển khai |
| 10 | Đặt lại mật khẩu | `/reset-password` | `/reset-password` | `ResetPasswordPage` | Anonymous Only | `POST /api/auth/reset-password` | Chờ triển khai |
| 11 | Xác thực Email | `/verify` | `/verify` | `VerifyEmailPage` | Anonymous Only | `GET /api/auth/verify` | Chờ triển khai |
| 12 | Điều hướng theo vai trò | `/dashboard` | `/dashboard` | `RoleRedirect` | Authenticated | Dựa vào `currentUser.role` để chuyển trang | Chờ triển khai |
| 13 | Thông báo cá nhân | `/notifications` | `/notifications` | `NotificationListPage` | Authenticated | `GET /api/notifications`<br>`POST /api/notifications/:id/read` | Chờ triển khai |
| 14 | Chi tiết dự án hợp đồng | `/projects/{id}` | `/projects/:id` | `ProjectDetailPage` | Authenticated (Participant) | `GET /api/projects/:id`<br>`POST /api/projects/:id/milestones`<br>`POST /api/projects/:id/milestones/:mid/status`<br>`POST /api/projects/:id/agreement/sign`<br>`POST /api/projects/:id/cancel`<br>`POST /api/projects/:id/complete`<br>`POST /api/projects/:id/deliveries`<br>`POST /api/projects/:id/reviews`<br>`POST /api/projects/:id/reports` | Chờ triển khai |
| 15 | Thanh toán ký quỹ (Escrow) | `/payment/project/{id}` | `/payment/project/:id` | `CheckoutPage` | `ROLE_CUSTOMER` | `GET /api/payment/project/:id`<br>`POST /api/payment/project/:id` | Chờ triển khai |
| 16 | Dashboard Khách hàng | `/customer/dashboard` | `/customer/dashboard` | `CustomerDashboardPage` | `ROLE_CUSTOMER` | `GET /api/customer/dashboard` | Chờ triển khai |
| 17 | Hồ sơ Doanh nghiệp | `/customer/profile` | `/customer/profile` | `CustomerProfilePage` | `ROLE_CUSTOMER` | `GET /api/customer/profile`<br>`PUT /api/customer/profile` | Chờ triển khai |
| 18 | Tin tuyển dụng đã đăng | `/customer/jobs` | `/customer/jobs` | `CustomerJobsPage` | `ROLE_CUSTOMER` | `GET /api/customer/jobs`<br>`POST /api/customer/jobs/:id/status` | Chờ triển khai |
| 19 | Đăng tin mới | `/customer/jobs/new` | `/customer/jobs/new` | `JobCreatePage` | `ROLE_CUSTOMER` | `POST /api/customer/jobs` | Chờ triển khai |
| 20 | Sửa tin đã đăng | `/customer/jobs/{id}/edit`| `/customer/jobs/:id/edit`| `JobEditPage` | `ROLE_CUSTOMER` | `GET /api/customer/jobs/:id`<br>`PUT /api/customer/jobs/:id` | Chờ triển khai |
| 21 | Ứng viên của một tin | `/customer/jobs/{id}/applicants` | `/customer/jobs/:id/applicants` | `JobApplicantsPage` | `ROLE_CUSTOMER` | `GET /api/customer/jobs/:id/applicants`<br>`POST /api/customer/applications/:id/shortlist`<br>`POST /api/customer/applications/:id/accept` | Chờ triển khai |
| 22 | Toàn bộ ứng viên | `/customer/applicants` | `/customer/applicants` | `AllApplicantsPage` | `ROLE_CUSTOMER` | `GET /api/customer/applicants` | Chờ triển khai |
| 23 | Tìm & Gợi ý Freelancer | `/customer/talent` | `/customer/talent` | `TalentMatcherPage` | `ROLE_CUSTOMER` | `GET /api/customer/talent`<br>`POST /api/customer/invitations` | Chờ triển khai |
| 24 | Lời mời đã gửi | `/customer/invitations` | `/customer/invitations` | `CustomerInvitationsPage`| `ROLE_CUSTOMER` | `GET /api/customer/invitations` | Chờ triển khai |
| 25 | Hợp đồng của khách hàng | `/customer/projects` | `/customer/projects` | `CustomerProjectsPage` | `ROLE_CUSTOMER` | `GET /api/customer/projects` | Chờ triển khai |
| 26 | Lịch sử khách hàng | `/customer/history` | `/customer/history` | `CustomerHistoryPage` | `ROLE_CUSTOMER` | `GET /api/customer/history` | Chờ triển khai |
| 27 | Dashboard Freelancer | `/freelancer/dashboard` | `/freelancer/dashboard` | `FreelancerDashboardPage`| `ROLE_FREELANCER` | `GET /api/freelancer/dashboard` | Chờ triển khai |
| 28 | Hồ sơ Freelancer | `/freelancer/profile` | `/freelancer/profile` | `FreelancerProfilePage` | `ROLE_FREELANCER` | `GET /api/freelancer/profile`<br>`PUT /api/freelancer/profile`<br>`GET /api/freelancer/profile/statistics` | Chờ triển khai |
| 29 | Việc làm đã lưu | `/freelancer/saved-jobs`| `/freelancer/saved-jobs`| `SavedJobsPage` | `ROLE_FREELANCER` | `GET /api/freelancer/saved-jobs`<br>`POST /api/freelancer/saved-jobs/:id/remove` | Chờ triển khai |
| 30 | Đơn ứng tuyển đã nộp | `/freelancer/applications`| `/freelancer/applications`| `MyApplicationsPage` | `ROLE_FREELANCER` | `GET /api/freelancer/applications`<br>`POST /api/freelancer/applications/:id/withdraw` | Chờ triển khai |
| 31 | Hợp đồng đang làm | `/freelancer/projects` | `/freelancer/projects` | `FreelancerProjectsPage` | `ROLE_FREELANCER` | `GET /api/freelancer/projects` | Chờ triển khai |
| 32 | Lời mời nhận được | `/freelancer/invitations`| `/freelancer/invitations`| `FreelancerInvitationsPage`| `ROLE_FREELANCER` | `GET /api/freelancer/invitations`<br>`POST /api/freelancer/invitations/:id/answer` | Chờ triển khai |
| 33 | Lịch sử Freelancer | `/freelancer/history` | `/freelancer/history` | `FreelancerHistoryPage` | `ROLE_FREELANCER` | `GET /api/freelancer/history` | Chờ triển khai |
| 34 | Dashboard Quản trị Admin | `/admin/dashboard` | `/admin/dashboard` | `AdminDashboardPage` | `ROLE_ADMIN` | `GET /api/admin/dashboard` | Chờ triển khai |
| 35 | Quản lý người dùng | `/admin/users` | `/admin/users` | `AdminUsersPage` | `ROLE_ADMIN` | `GET /api/admin/users`<br>`POST /api/admin/users/:id/lock` | Chờ triển khai |
| 36 | Kiểm duyệt tin đăng | `/admin/jobs` | `/admin/jobs` | `AdminJobsPage` | `ROLE_ADMIN` | `GET /api/admin/jobs`<br>`POST /api/admin/jobs/:id/status`<br>`POST /api/admin/jobs/:id/flags` | Chờ triển khai |
| 37 | Giám sát hợp đồng | `/admin/projects` | `/admin/projects` | `AdminProjectsPage` | `ROLE_ADMIN` | `GET /api/admin/projects` | Chờ triển khai |
| 38 | Sổ cái thanh toán | `/admin/payments` | `/admin/payments` | `AdminPaymentsPage` | `ROLE_ADMIN` | `GET /api/admin/payments` | Chờ triển khai |
| 39 | Xử lý báo cáo vi phạm | `/admin/reports` | `/admin/reports` | `AdminReportsPage` | `ROLE_ADMIN` | `GET /api/admin/reports`<br>`POST /api/admin/reports/:id/review` | Chờ triển khai |
| 40 | Trọng tài tranh chấp | `/admin/disputes` | `/admin/disputes` | `AdminDisputesPage` | `ROLE_ADMIN` | `GET /api/admin/disputes`<br>`POST /api/admin/disputes/:id/resolve` | Chờ triển khai |
| 41 | Nhật ký quản trị (Audit) | `/admin/audit` | `/admin/audit` | `AdminAuditPage` | `ROLE_ADMIN` | `GET /api/admin/audit` | Chờ triển khai |
| 42 | Trang không tồn tại (404) | N/A | `*` | `NotFoundPage` | Public | Không yêu cầu | Chờ triển khai |
