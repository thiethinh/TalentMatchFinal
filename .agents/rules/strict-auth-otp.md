---
name: strict-auth-otp
description: Quy chuẩn bảo mật xác thực OTP bắt buộc cho đăng ký và đăng nhập (TalentMatch). Nghiêm cấm cấp quyền truy cập tài khoản, lưu phiên làm việc (session/token) trước khi người dùng xác thực mã OTP thành công.
---

# Quy Chuẩn Xác Thực OTP Bắt Buộc (Strict Auth OTP)

## 1. NGUYÊN TẮC CỐT LÕI
- **Bắt buộc nhập mã xác nhận OTP trước khi cho vào tài khoản**: Tuyệt đối không cho phép người dùng vào tài khoản (hay nhận `currentUser` / session đăng nhập) khi chưa xác thực mã OTP email.
- **Không áp dụng cơ chế "vào acc trước rồi xác thực sau và bị hạn chế tính năng"**: Cơ chế soft-login hoặc cho phép tài khoản chưa kích hoạt duyệt dashboard rồi dùng modal chặn tính năng là vi phạm tiêu chuẩn bảo mật này.
- **Tính toàn vẹn trên cả Frontend và Backend**: Cả Spring Boot Backend và React Frontend đều phải đồng bộ nghiêm ngặt nguyên tắc này.

---

## 2. QUY TRÌNH ĐĂNG KÝ TÀI KHOẢN (REGISTRATION)

1. **Khởi tạo tài khoản tạm thời:**
   - Khi nhận yêu cầu đăng ký (`/api/auth/register`), hệ thống lưu thông tin người dùng với trạng thái `emailVerified = false` và `enabled = false`.
   - Sinh mã OTP 6 số (thời hạn 15 phút) và gửi email kích hoạt tới người dùng.
2. **Nghiêm cấm cấp quyền truy cập sớm:**
   - Backend **không** tạo `Authentication` trong `SecurityContext`, **không** cấp session cookie.
   - Frontend **không** gán `currentUser`, **không** lưu id vào `localStorage`. Người dùng tiếp tục ở trạng thái Khách (Guest).
3. **Chuyển tiếp trực tiếp sang màn hình xác thực OTP:**
   - Hệ thống mở ngay màn hình nhập mã OTP 6 số với email vừa đăng ký.
   - Cung cấp tính năng đếm ngược gửi lại mã OTP (60s) và đổi email nếu nhập sai.
4. **Xác nhận OTP thành công (`/api/auth/verify-otp`):**
   - Chỉ khi nhập đúng mã OTP (hoặc mã test demo `123456`, `889922` trong môi trường thử nghiệm):
     - Backend cập nhật `emailVerified = true`, `enabled = true`.
     - Backend chính thức cấp `Authentication` session cho người dùng.
     - Frontend cập nhật `currentUser`, lưu `localStorage`, đóng modal và thông báo thành công.

---

## 3. QUY TRÌNH ĐĂNG NHẬP (LOGIN)

1. **Kiểm tra trạng thái xác thực:**
   - Khi người dùng đăng nhập bằng Email & Mật khẩu (`/api/auth/login`):
   - Nếu mật khẩu chính xác nhưng tài khoản **chưa xác thực OTP** (`emailVerified == false`):
     - Backend **từ chối cấp phiên làm việc**, trả về mã lỗi HTTP 403 Forbidden kèm cờ `requiresOtp: true` và tự động gửi lại mã OTP mới đến email người dùng.
     - Frontend bắt lỗi `requiresOtp`, **tuyệt đối không set `currentUser`**, tự động chuyển sang màn hình nhập OTP cho tài khoản đó.
2. **Kích hoạt tài khoản:**
   - Sau khi người dùng nhập đúng mã OTP, tài khoản chuyển sang trạng thái đã kích hoạt và người dùng được tự động đăng nhập vào hệ thống.

---

## 4. QUY TRÌNH VỚI GOOGLE AUTH & TÀI KHOẢN MẪU (TEST ACCOUNTS)

- Đối với tài khoản test hoặc tài khoản chuyển vai trò nhanh (RoleSwitcher): nếu tài khoản ở trạng thái `emailVerified: false`, hệ thống phải chặn lại và mở màn hình nhập OTP (mã demo: `123456`), không được phép chuyển trực tiếp vào tài khoản chưa xác thực.

---

## 5. XỬ LÝ TRƯỜNG HỢP ĐÃ TẠO TÀI KHOẢN NHƯNG CHƯA NHẬP MÃ XÁC NHẬN (RE-REGISTRATION FOR UNVERIFIED ACCOUNTS)

- **Tránh tình trạng người dùng bị kẹt (dead-end)**: Khi người dùng đã đăng ký tài khoản nhưng chưa nhập mã OTP (ví dụ: tắt trình duyệt, hết hạn mã OTP, bỏ dở giữa chừng):
  - **Kiểm tra trạng thái `emailVerified`**: Nếu tài khoản tồn tại trong hệ thống nhưng `emailVerified == false`, hệ thống **phải cho phép tiếp tục tạo tài khoản / đăng ký lại** bằng chính email đó.
  - **Cập nhật thông tin**: Cập nhật lại thông tin mới nhất (họ tên, mật khẩu, vai trò) mà người dùng nhập trong lần đăng ký lại.
  - **Tạo mã OTP mới và gửi lại**: Huỷ/cập nhật token cũ, sinh mã OTP 6 số mới và gửi về hòm thư của người dùng.
  - **Tránh thông báo lỗi cứng nhắc**: Tuyệt đối **không** thông báo lỗi kiểu "Tài khoản / Email đã tồn tại" rồi chặn người dùng không cho tạo lại. Thay vào đó, thông báo rõ ràng: "Tài khoản với email này đang chờ xác thực OTP. Đã cập nhật lại thông tin và gửi mã OTP mới tới email của bạn. Vui lòng nhập mã OTP để kích hoạt tài khoản!"
  - **Chỉ chặn khi tài khoản đã xác thực**: Chỉ ném lỗi "Email này đã được sử dụng và đã xác thực. Vui lòng chọn Đăng nhập hoặc Quên mật khẩu." khi `emailVerified == true`.
