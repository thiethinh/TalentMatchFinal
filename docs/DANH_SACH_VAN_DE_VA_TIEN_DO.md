# BẢNG TỔNG HỢP VẤN ĐỀ TỒN TẠI VÀ TIẾN ĐỘ THỰC HIỆN DỰ ÁN TALENTMATCH

> **Nguồn đối soát:** Trích xuất từ 2 Tab tài liệu Google Docs (`Tab 1: Freelancer & Tính năng chung` và `Tab 2: Nhà tuyển dụng & Hợp đồng Escrow`).

---

## I. TAB 1: PHÂN HỆ FREELANCER & CÁC TÍNH NĂNG CHUNG

| STT | Vấn đề tồn tại cần giải quyết | Tiến độ | Mô tả chi tiết việc đã làm & Kế hoạch xử lý |
|:---:|:---|:---:|:---|
| **1** | **Không xem được chi tiết công việc**<br>- Khi duyệt danh sách `/jobs`, người dùng không bấm vào xem được trang chi tiết bài đăng công việc. | **⏳ Chưa làm** | - **Hiện trạng:** Tuyến đường `/jobs` chỉ đang trỏ vào trang danh sách `Projects.tsx`, chưa có route `/jobs/:id` hay `/projects/:id` để xem mô tả đầy đủ, ngân sách, kỹ năng, thông tin client.<br>- **Kế hoạch:** Tạo trang `JobDetail.tsx` (hoặc modal chi tiết), hiển thị đầy đủ tiêu chí công việc và nút "Ứng tuyển ngay". |
| **2** | **Quản lý công việc quan tâm nên để thành 1 trang riêng, chỉ lưu công việc (không lưu công ty)** | **⏳ Chưa làm** | - **Hiện trạng:** Mục "Đã lưu" đang bị nhét chung vào 1 tab trong `FreelancerDashboard.tsx` và đang lưu cả 2 mục (Doanh nghiệp + Dự án).<br>- **Kế hoạch:** Bỏ chức năng lưu doanh nghiệp, chỉ lưu công việc. Tách ra trang riêng `/saved-jobs` hoặc cấu trúc lại thành trang quản lý công việc yêu thích chuyên biệt. |
| **3** | **Ứng tuyển công việc nên làm chi tiết, có thể gửi file, hình ảnh,... nên làm thành 1 trang riêng. Chưa xem được danh sách đã ứng tuyển và tình trạng** | **⏳ Chưa làm** | - **Hiện trạng:** Form nộp proposal hiện tại quá đơn giản, chưa có trang ứng tuyển riêng, chưa hỗ trợ đính kèm CV/Portfolio/Hình ảnh. Tab danh sách đã ứng tuyển chưa thể hiện rõ trạng thái (Đang chờ / Được chọn / Bị từ chối).<br>- **Kế hoạch:** Xây dựng trang `/jobs/:id/apply` cho phép nhập thư chào giá, thời gian cam kết, upload file đính kèm; Nâng cấp trang danh sách hồ sơ đã nộp kèm tracker trạng thái. |
| **4** | **Rút tiền & Cổng VNPAY Sandbox:**<br>- Thông tin nào freelancer chưa điền thì để trống chứ không điền mặc định.<br>- Phải đăng ký VNPAY Sandbox để test.<br>- Phải có thủ tục rút tiền & xem được lịch sử giao dịch trên nền tảng. | **✅ Đã làm một phần** | - **Việc ĐÃ LÀM:**<br>  1. Đã đăng ký thành công Merchant VNPAY Sandbox (`XIRJ44TM`).<br>  2. Đã tích hợp cấu hình bảo mật `HmacSHA512` vào `application.properties` & `VnPaySandboxService.java`.<br>  3. Đã nâng cấp `VNPayModal.tsx` mở cổng VNPAY Sandbox chính thức và tích hợp bộ thẻ test NCB 1-click copy.<br>- **Việc CẦN LÀM TIẾP:** Xóa bỏ dữ liệu mock mặc định trong form rút tiền (để trống khi chưa thêm STK), hoàn thiện trang lịch sử giao dịch nạp/rút tiền. |
| **5** | **Thiếu biểu đồ thống kê:**<br>- Bắt buộc phải có biểu đồ cột cho dự án - doanh thu theo khoảng thời gian (từ ngày... đến ngày...).<br>- Bắt buộc phải có biểu đồ tròn theo tỷ lệ trạng thái hoặc lĩnh vực. | **⏳ Chưa làm** | - **Hiện trạng:** Dashboard hiện chỉ có các thẻ số liệu thống kê tĩnh (Total earnings, Orders count...), chưa có chart tương tác.<br>- **Kế hoạch:** Tích hợp Chart.js hoặc Recharts để dựng biểu đồ cột doanh thu theo ngày/tháng có bộ lọc Date Range, và biểu đồ tròn tỷ lệ ngành nghề/trạng thái dự án. |
| **6** | **Hồ sơ tài khoản phải chỉnh sửa được trực tiếp (chứ không nằm riêng/cố định)** | **🔄 Đang xử lý** | - **Việc ĐÃ LÀM:** Đã sửa lỗi giao diện bị che tên (`Lê Thu Hà`) và lỗi chữ bị dính sát trong `UserProfileModal.tsx`, mở rộng modal thoáng đẹp `max-w-3xl`.<br>- **Việc CẦN LÀM TIẾP:** Cho phép chỉnh sửa trực tiếp thông tin cá nhân (Họ tên, SĐT, Avatar, Bio, Kỹ năng) và lưu cập nhật vào state/database. |
| **7** | **Trao đổi với Client phải thật chứ không code cứng; Đồng thời chỉnh lại logic tiến độ, sản phẩm bàn giao xem được khách hàng có chấp nhận hay không** | **⏳ Chưa làm** | - **Hiện trạng:** Tin nhắn trao đổi đang dùng mảng tĩnh; Nút nộp bài bàn giao chưa có cơ chế phản hồi duyệt/yêu cầu sửa từ phía khách hàng.<br>- **Kế hoạch:** Kết nối khung chat động theo từng đơn hàng/hợp đồng; Hoàn thiện quy trình: Freelancer nộp file bàn giao -> Khách hàng nhận thông báo -> Bấm "Chấp thuận & Giải ngân Escrow" HOẶC "Yêu cầu chỉnh sửa". |

---

## II. TAB 2: PHÂN HỆ NHÀ TUYỂN DỤNG (EMPLOYER / CLIENT)

| STT | Vấn đề tồn tại cần giải quyết | Tiến độ | Mô tả chi tiết việc đã làm & Kế hoạch xử lý |
|:---:|:---|:---:|:---|
| **1** | **Chưa xem lại được chi tiết các Công việc đã đăng để chấp nhận báo giá**<br>- Hiện tại chỉ đang xem được các Dự án/công việc đã chấp nhận đang thực hiện. | **⏳ Chưa làm** | - **Hiện trạng:** `EmployerDashboard.tsx` chỉ liệt kê các bài đăng cơ bản, khi bấm vào không xem được danh sách các freelancer đã nộp báo giá cho bài đăng đó để so sánh và bấm "Chấp nhận báo giá".<br>- **Kế hoạch:** Bổ sung giao diện xem chi tiết tin tuyển dụng + Bảng danh sách ứng viên/báo giá kèm nút duyệt ứng viên chuyển thành hợp đồng Escrow. |
| **2** | **Chức năng Hợp đồng & Ký quỹ Escrow hiện tại chỉ đang liên kết trực tiếp vào một dự án duy nhất** | **🔄 Đang xử lý** | - **Việc ĐÃ LÀM:** Đã kết nối cổng thanh toán VNPAY Sandbox thật vào flow ký quỹ.<br>- **Việc CẦN LÀM TIẾP:** Gắn `orderNumber`, `amount`, `projectId` động theo đúng hợp đồng được chọn thay vì hardcode một mã dự án mẫu. |
| **3** | **Tin nhắn trao đổi vẫn đang là code tĩnh** | **⏳ Chưa làm** | - **Hiện trạng:** Khung chat trao đổi giữa Employer và Freelancer đang là dữ liệu giả định.<br>- **Kế hoạch:** Đồng bộ kho tin nhắn chung theo mã hợp đồng (`orderId`), người tuyển dụng nhắn thì tài khoản freelancer nhận được theo thời gian thực. |

---

## TỔNG KẾT TIẾN ĐỘ CHUNG:
* **Tổng số vấn đề:** 10 vấn đề (7 mục Freelancer/Hệ thống + 3 mục Employer).
* **Đã hoàn thành một phần:** 2/10 mục (VNPAY Sandbox thực tế, Sửa giao diện Hồ sơ tài khoản).
* **Cần triển khai tiếp theo:** 8/10 mục (Chi tiết công việc, Trang ứng tuyển đính kèm file, Biểu đồ thống kê cột & tròn, Quản lý báo giá dự án, Chat động, Nghiệm thu bàn giao Escrow).

