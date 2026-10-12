# HỢP ĐỒNG REST API (REST API CONTRACTS)
**Dự án:** TalentMatch — Freelance Marketplace  
**Ngày thực hiện:** 10/10/2026  
**Vai trò:** Senior Software Architect & Legacy Migration Engineer  

---

## 1. QUY CHUẨN CHUNG

- **Tiền tố API:** Tất cả các endpoint đều có tiền tố `/api`.
- **Định dạng dữ liệu:** JSON UTF-8 (`application/json`).
- **Xác thực:** Session Cookie `JSESSIONID` gửi tự động kèm request (`withCredentials: true`).
- **Cấu trúc phản hồi lỗi thống nhất:**
```json
{
  "timestamp": "2026-10-10T17:30:00.000",
  "status": 400,
  "code": "VALIDATION_FAILED",
  "message": "Thông tin nhập vào không hợp lệ.",
  "errors": {
    "title": "Tên công việc phải có ít nhất 5 ký tự.",
    "budget": "Ngân sách phải lớn hơn 0."
  }
}
```

---

## 2. NHÓM 1: AUTHENTICATION & SESSION (`/api/auth`)

### 2.1. Đăng nhập
- **Endpoint:** `POST /api/auth/login`
- **Quyền:** Public
- **Request Body:**
```json
{
  "email": "freelancer@talentmatch.vn",
  "password": "123456",
  "rememberMe": true
}
```
- **Response (200 OK):**
```json
{
  "id": 10,
  "fullName": "Nguyễn Minh Anh",
  "email": "freelancer@talentmatch.vn",
  "role": "FREELANCER",
  "avatar": null,
  "talentCreditBalance": 50
}
```
- **Lỗi (401 Unauthorized):**
```json
{ "status": 401, "message": "Email hoặc mật khẩu không chính xác." }
```

### 2.2. Lấy thông tin phiên hiện tại
- **Endpoint:** `GET /api/auth/me`
- **Quyền:** Public (trả về null nếu chưa đăng nhập) hoặc Authenticated
- **Response (200 OK):** Thông tin user hiện tại hoặc `{ "authenticated": false }`.

### 2.3. Đăng xuất
- **Endpoint:** `POST /api/auth/logout`
- **Quyền:** Authenticated
- **Response (200 OK):** `{ "message": "Đăng xuất thành công." }`

### 2.4. Đăng ký tài khoản
- **Endpoint:** `POST /api/auth/register`
- **Quyền:** Public
- **Request Body:**
```json
{
  "fullName": "Lê Hoàng Nam",
  "email": "nam.le@example.com",
  "password": "Password123",
  "confirmPassword": "Password123",
  "role": "FREELANCER",
  "agreeTerms": true
}
```
- **Response (200 OK):** `{ "message": "Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt." }`

---

## 3. NHÓM 2: TRANG CHỦ & THỊ TRƯỜNG (`/api/home`, `/api/jobs`, `/api/freelancers`)

### 3.1. Dữ liệu tổng quan trang chủ
- **Endpoint:** `GET /api/home/overview`
- **Quyền:** Public
- **Response (200 OK):**
```json
{
  "featuredJobs": [ ... ],
  "featuredFreelancers": [ ... ],
  "stats": {
    "freelancerCount": 120,
    "customerCount": 45,
    "openJobCount": 86
  }
}
```

### 3.2. Tìm kiếm & lọc danh sách công việc
- **Endpoint:** `GET /api/jobs`
- **Query Params:**
  - `q`: Từ khóa tìm kiếm
  - `category`: Ngành nghề
  - `skill`: Kỹ năng
  - `minBudget`, `maxBudget`: Khoảng ngân sách
  - `workType`: `REMOTE,HYBRID,ONSITE`
  - `level`: `INTERN,FRESHER,JUNIOR,MIDDLE,SENIOR`
  - `sort`: `latest`, `budget_desc`, `budget_asc`, `deadline_asc`, `match_desc`
  - `page`: Trang hiện tại (mặc định 1)
  - `size`: Số bản ghi mỗi trang (mặc định 10)
- **Response (200 OK):**
```json
{
  "items": [
    {
      "id": 101,
      "title": "Thiết kế UI/UX ứng dụng Fintech",
      "category": "Thiết kế & Sáng tạo",
      "budget": 15000000,
      "priceType": "FIXED",
      "deadline": "2026-11-15",
      "workType": "REMOTE",
      "experienceLevel": "MIDDLE",
      "requiredSkills": "Figma, UI/UX, Design System",
      "proposalCount": 6,
      "postedAgo": "2 giờ trước",
      "daysLeft": 25,
      "matchScore": 85,
      "isSaved": false,
      "hasApplied": false
    }
  ],
  "currentPage": 1,
  "totalPages": 9,
  "totalItems": 86,
  "categoryCounts": {
    "Lập trình & CNTT": 30,
    "Thiết kế & Sáng tạo": 25
  }
}
```

### 3.3. Chi tiết công việc
- **Endpoint:** `GET /api/jobs/{id}`
- **Response (200 OK):**
```json
{
  "job": {
    "id": 101,
    "title": "Thiết kế UI/UX ứng dụng Fintech",
    "description": "Mô tả chi tiết dự án...",
    "acceptanceCriteria": "Tiêu chí bàn giao...",
    "budget": 15000000,
    "deadline": "2026-11-15",
    "customer": {
      "id": 5,
      "companyName": "Nova Digital",
      "location": "TP. Hồ Chí Minh"
    }
  },
  "matchScore": 85,
  "isSaved": true,
  "hasApplied": false,
  "currentApplication": null,
  "similarJobs": [ ... ]
}
```

### 3.4. Nộp đơn ứng tuyển
- **Endpoint:** `POST /api/jobs/{id}/apply`
- **Quyền:** `ROLE_FREELANCER`
- **Request Body:**
```json
{
  "proposal": "Tôi đã có 4 năm kinh nghiệm thiết kế ứng dụng tài chính...",
  "proposedPrice": 14000000,
  "estimatedDays": 14,
  "portfolioLink": "https://behance.net/sample"
}
```
- **Response (200 OK):** `{ "message": "Nộp đề xuất ứng tuyển thành công." }`

### 3.5. Lưu / Bỏ lưu công việc quan tâm
- **Endpoint:** `POST /api/jobs/{id}/save`
- **Quyền:** `ROLE_FREELANCER`
- **Response (200 OK):** `{ "saved": true, "message": "Đã lưu vào danh sách quan tâm." }`

---

## 4. NHÓM 3: KHÁCH HÀNG DOANH NGHIỆP (`/api/customer`)

### 4.1. Dashboard khách hàng
- **Endpoint:** `GET /api/customer/dashboard`
- **Quyền:** `ROLE_CUSTOMER`
- **Query Params:** `from`, `to`, `metric` (`projects` hoặc `budget`), `pieMode` (`status` hoặc `category`)
- **Response (200 OK):** Thống kê số lượng tin đăng, dự án đang chạy, tổng chi phí, biểu đồ `barData`, biểu đồ `pieData`.

### 4.2. Quản lý tin tuyển dụng
- `GET /api/customer/jobs`: Danh sách tin đã đăng của khách hàng
- `POST /api/customer/jobs`: Đăng tin tuyển dụng mới
- `PUT /api/customer/jobs/{id}`: Cập nhật tin tuyển dụng
- `POST /api/customer/jobs/{id}/status`: Đổi trạng thái (`OPEN`, `PAUSED`, `CLOSED`, `CANCELLED`)
- `GET /api/customer/jobs/{id}/applicants`: Xem ứng viên của một tin cụ thể
- `POST /api/customer/applications/{id}/shortlist`: Đưa ứng viên vào danh sách ưu tiên (`value: true/false`)
- `POST /api/customer/applications/{id}/accept`: Chấp thuận ứng viên và tạo hợp đồng `Project`

### 4.3. Gợi ý & Kết nối Freelancer
- `GET /api/customer/talent`: Tìm kiếm ứng viên kèm điểm match score tự động
- `POST /api/customer/invitations`: Gửi lời mời làm việc tới Freelancer

---

## 5. NHÓM 4: FREELANCER (`/api/freelancer`)

### 5.1. Dashboard & Thống kê
- `GET /api/freelancer/dashboard`: Chỉ số thu nhập, đơn đã nộp, dự án đang làm, biểu đồ thống kê
- `GET /api/freelancer/profile`: Xem hồ sơ, checklist hoàn thiện, kỹ năng
- `PUT /api/freelancer/profile`: Cập nhật thông tin chuyên môn, đơn giá giờ, portfolio
- `GET /api/freelancer/profile/statistics`: API lấy dữ liệu biểu đồ realtime không tải lại trang
- `GET /api/freelancer/applications`: Danh sách đơn ứng tuyển đã nộp, trạng thái duyệt
- `POST /api/freelancer/applications/{id}/withdraw`: Rút đơn ứng tuyển
- `GET /api/freelancer/saved-jobs`: Danh sách việc đã lưu
- `GET /api/freelancer/invitations`: Danh sách lời mời từ khách hàng
- `POST /api/freelancer/invitations/{id}/answer`: Chấp thuận (`ACCEPTED`) hoặc từ chối (`DECLINED`) lời mời

---

## 6. NHÓM 5: HỢP ĐỒNG DỰ ÁN & THANH TOÁN (`/api/projects`, `/api/payment`)

### 6.1. Hợp đồng dự án
- `GET /api/projects/{id}`: Chi tiết hợp đồng, danh sách milestones, lịch sử giao dịch, bàn giao, đánh giá
- `POST /api/projects/{id}/agreement/sign`: Ký hợp đồng điện tử (Customer hoặc Freelancer)
- `POST /api/projects/{id}/milestones`: Tạo mốc thanh toán mới
- `POST /api/projects/{id}/milestones/{mid}/status`: Chuyển trạng thái mốc
- `POST /api/projects/{id}/milestones/{mid}/revision`: Yêu cầu chỉnh sửa mốc công việc
- `POST /api/projects/{id}/deliveries`: Bàn giao sản phẩm (hỗ trợ multipart file và link ngoài)
- `GET /api/projects/deliveries/{did}/download`: Tải file bàn giao đính kèm
- `POST /api/projects/{id}/complete`: Nghiệm thu và hoàn tất dự án
- `POST /api/projects/{id}/cancel`: Yêu cầu hủy hợp đồng (chuyển tranh chấp sang Admin)
- `POST /api/projects/{id}/reviews`: Đánh giá đối tác 1–5 sao sau khi hoàn thành
- `POST /api/projects/{id}/reports`: Tố cáo đối tác lên Quản trị viên

### 6.2. Thanh toán ký quỹ (Escrow Payment)
- `GET /api/payment/project/{id}`: Lấy thông tin thanh toán cho hợp đồng hoặc milestone
- `POST /api/payment/project/{id}`: Thực hiện thanh toán ký quỹ qua các cổng thanh toán hỗ trợ

---

## 7. NHÓM 6: QUẢN TRỊ ADMIN (`/api/admin`)

- `GET /api/admin/dashboard`: Thống kê toàn hệ thống
- `GET /api/admin/users`: Danh sách người dùng, tìm kiếm & lọc
- `POST /api/admin/users/{id}/lock`: Khóa / Mở khóa tài khoản (kèm ghi log audit)
- `GET /api/admin/jobs`: Danh sách tin tuyển dụng trên toàn sàn
- `POST /api/admin/jobs/{id}/status`: Tạm ẩn / Mở lại tin đăng
- `POST /api/admin/jobs/{id}/flags`: Duyệt kiểm duyệt, gắn cờ Nổi bật / Xác thực
- `GET /api/admin/projects`: Giám sát toàn bộ hợp đồng
- `GET /api/admin/payments`: Quản lý sổ cái thanh toán
- `GET /api/admin/reports`: Danh sách tố cáo vi phạm
- `POST /api/admin/reports/{id}/review`: Kết luận xử lý báo cáo
- `GET /api/admin/disputes`: Danh sách tranh chấp hợp đồng
- `POST /api/admin/disputes/{id}/resolve`: Trọng tài phán quyết (hoàn tiền ký quỹ hoặc tiếp tục dự án)
- `GET /api/admin/audit`: Xem lịch sử nhật ký quản trị
