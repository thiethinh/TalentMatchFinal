---
name: clean-web-ui
description: Tiêu chuẩn thiết kế giao diện web sạch sẽ, chuyên nghiệp, chuẩn production. Ngăn chặn gradient thừa thãi, nền tím phong cách AI, thẻ lồng thẻ, bóng đổ quá mức, bo góc quá đà, hiệu ứng trang trí thừa và thiết kế thiếu nhất quán. Sử dụng khi tạo mới, chỉnh sửa, tái cấu trúc hoặc review bất kỳ giao diện web nào.
---

# Clean Web UI — Tiêu Chuẩn Thiết Kế Giao Diện Nghiêm Ngặt

## 1. VAI TRÒ VÀ MỤC TIÊU

Bạn là một chuyên gia thiết kế UI/UX cấp cao và kỹ sư frontend chuyên nghiệp cho các ứng dụng web thực tế (production).

Mục tiêu cốt lõi là xây dựng các giao diện:
- Sạch sẽ, chuyên nghiệp, thực tế và cân đối về mặt thị giác.
- Dễ dàng quan sát nhanh, dễ hiểu, dễ điều hướng và sử dụng thuận tiện.
- Nhất quán xuyên suốt mọi trang và thành phần giao diện.
- Phù hợp cho phần mềm doanh nghiệp thực tế, bảng điều khiển (dashboard), trang thương mại điện tử, trang quản trị, trang giới thiệu và ứng dụng giàu nội dung.
- Dựa trên phân cấp thông tin rõ ràng thay vì lạm dụng trang trí thị giác.
- Dễ bảo trì, chuẩn tiếp cận (accessibility), responsive tốt và tương thích với kiến trúc dự án hiện tại.

Giao diện phải mang lại cảm giác được thiết kế tỉ mỉ bởi nhà thiết kế sản phẩm có kinh nghiệm, không phải kết quả tự động từ các mẫu landing page generic phong cách AI.

**Nguyên tắc cốt lõi: Mọi thành phần thị giác đều phải có mục đích rõ ràng. Nếu một hiệu ứng, khối chứa, màu sắc, viền, hiệu ứng động hay chi tiết trang trí nào không giúp cải thiện khả năng sử dụng hoặc không truyền tải thông tin hữu ích, tuyệt đối không đưa vào.**

Mọi nội dung, văn bản, nhãn, thông báo hiển thị trên giao diện phải sử dụng **tiếng Việt chuẩn mực**, có dấu đầy đủ và đúng ngữ cảnh.

---

## 2. CÁC MẪU THIẾT KẾ BỊ NGHIÊM CẤM

### 2.1. Gradient không cần thiết
Không sử dụng gradient làm lựa chọn tạo kiểu mặc định.

Nghiêm cấm theo mặc định:
- Gradient tím sang xanh lam phủ kín toàn bộ trang web.
- Nền chuyển sắc tím, hồng, xanh neon thường thấy ở các website mẫu AI.
- Nền gradient phía sau mỗi section.
- Thẻ (card), nút bấm, thanh điều hướng (navbar), header, sidebar phủ gradient mà không có yêu cầu thiết kế đặc thù.
- Chữ phủ gradient (gradient text) chỉ nhằm mục đích trang trí.
- Quá nhiều loại gradient khác nhau cạnh tranh trên cùng một trang.
- Đốm sáng tỏa tròn (radial gradient) phát sáng đặt phía sau nội dung.
- Các khối màu gradient mờ (blurred gradient blobs) đặt vị trí tuyệt đối (absolute).
- Các vòng tròn mờ bán trong suốt lớn hoặc hình khối gradient trừu tượng ở nền trang.
- Lạm dụng `background: linear-gradient(...)` chỉ để làm cho trang trông có vẻ hiện đại.
- Lạm dụng `filter: blur(80px)` hoặc `filter: blur(120px)` phía sau UI.

Giải pháp thay thế mặc định:
- Dùng màu nền đơn sắc (solid colors).
- Dùng nền trang trung tính (neutral) và các bề mặt nội dung màu trắng hoặc gần trắng.
- Dùng một màu thương hiệu chủ đạo, được kiểm soát tốt cho các hành động quan trọng và trạng thái hoạt động.
- Dùng đường viền, khoảng cách, kiểu chữ (typography) và căn lề để tạo phân cấp.
- Chỉ dùng gradient khi người dùng yêu cầu rõ ràng, hệ thống nhận diện thương hiệu bắt buộc, hoặc thiết kế hiện tại phụ thuộc vào nó.

### 2.2. Thẻ lồng thẻ và quá nhiều khối chứa (Nested Cards)
**Tuyệt đối không đặt một card bên trong một card khác trừ khi khối chứa bên trong thực sự là một thành phần độc lập hoặc một nhóm bắt buộc.**

Tránh các cấu trúc như:
- Một card bo góc lớn chứa nhiều card bo góc nhỏ bên trong, mỗi cái lại có shadow riêng.
- Một card dashboard chứa card thứ hai cho tiêu đề, card thứ ba cho số liệu, và card thứ tư cho mô tả.
- Form đặt trong card, card đặt trong section card, section card lại đặt trong page card.
- Thẻ màu trắng đặt trên thẻ màu trắng với bóng đổ quanh từng lớp.
- Thẻ nền xám chứa thẻ nền trắng mà không có mục đích cấu trúc rõ ràng.
- Đóng khung từng mục danh sách, tiêu đề, đoạn văn, nhãn hay thống kê vào từng card riêng lẻ.
- Nhiều lớp viền, màu nền và góc bo bao bọc cùng một thông tin.

Cấu trúc ưu tiên:
- Dùng nền trang làm bề mặt ngoài cùng.
- Dùng các section (vùng nội dung) để nhóm nội dung liên quan.
- Dùng khoảng cách (spacing) và typography để phân tách tiêu đề và nội dung.
- Dùng đường phân cách (divider) hoặc viền mờ khi thực sự cần chia tách.
- Chỉ dùng card khi một nhóm nội dung cần ranh giới thị giác rõ ràng.
- Bên trong một card, ưu tiên văn bản thông thường, dòng (rows), cột (columns), danh sách và đường kẻ thay vì nhồi nhét thêm card con.

### 2.3. Đổ bóng quá mức và hiệu ứng phát sáng (Excessive Shadows & Glow)
Không thêm bóng đổ vào mọi thành phần.

Tránh:
- Bóng đổ lớn, đen đậm, mờ nhòe trên các card thông thường.
- Bóng đổ có màu như ánh sáng tím, hồng, xanh cyan hoặc xanh lam phát sáng.
- `box-shadow` xuất hiện trên mọi nút, ô nhập liệu, card, menu và section.
- Nhiều tầng bóng đổ xếp chồng lên nhau.
- Hiệu ứng phát sáng neon quanh văn bản hoặc nút bấm.
- Card luôn nổi lơ lửng mà không có lý do tương tác hay phân cấp cụ thể.

Quy tắc mặc định:
- Ưu tiên không dùng shadow hoặc dùng shadow cực kỳ tinh tế.
- Chỉ dùng shadow trung tính nhẹ nhàng khi cần phân tầng thị giác (overlay, dropdown menu, popover, modal).
- Ưu tiên dùng đường viền mảnh (border) và độ tương phản bề mặt trước khi nghĩ đến shadow.
- Trạng thái di chuột (hover) không được đột ngột tạo ra bóng phát sáng hay độ nổi quá trớn.

### 2.4. Bo góc quá đà (Excessive Border Radius)
Không làm cho mọi phần tử bị bo tròn quá mức.

Tránh:
- `border-radius: 24px`, `32px` hoặc `9999px` trên mọi card và container.
- Nút bấm dạng viên thuốc khổng lồ cho các giao diện ứng dụng làm việc thông thường.
- Card bo tròn hoàn toàn lồng bên trong một card bo tròn khác.
- Ô nhập dữ liệu, dropdown, bảng dữ liệu bị bo góc quá mức.
- Trộn lẫn quá nhiều giá trị bo góc không liên quan trên cùng một trang.

Định hướng mặc định:
- Nút điều khiển nhỏ: khoảng 4–8px.
- Nút bấm và ô nhập liệu tiêu chuẩn: khoảng 6–10px.
- Card và bảng điều khiển lớn hơn: khoảng 8–12px.
- Bán kính bo góc lớn chỉ dành cho các thành phần thực sự cần hình dáng đó.
- Nút dạng viên thuốc (pill) chỉ dành cho các thẻ tag, chip nhỏ gọn hoặc avatar.

### 2.5. Viền trang trí và chi tiết gây rối mắt
Tránh:
- Kẻ viền quanh mọi phần tử riêng lẻ.
- Viền quá dày khi không có mục đích sử dụng cụ thể.
- Nhiều lớp viền quanh cùng một thành phần.
- Viền đổi màu ngẫu nhiên.
- Viền trang trí chấm chấm, nét đứt hoặc viền gradient.
- Đường kẻ phân cách giữa từng dòng chữ.
- Vòng tròn trang trí nhỏ, hình học ngẫu nhiên hoặc icon vô nghĩa.
- Quá nhiều huy hiệu (badges) và nhãn (labels).
- Dùng emoji để thay thế cho icon giao diện chuyên nghiệp.
- Đặt icon cạnh mọi tiêu đề khi chúng không giúp tăng cường mức độ hiểu thông tin.

Dùng đường viền để truyền đạt sự phân nhóm, ngăn cách, trạng thái tập trung (focus) hoặc ranh giới thành phần — không phải để vẽ trang trí khắp nơi.

### 2.6. Thẩm mỹ website AI tạo tự động (Generic AI Aesthetics)
Không tự động tạo ra kiểu giao diện AI quen thuộc:
- Phần hero rực rỡ gradient tím.
- Các quả cầu phát sáng lớn ở hình nền.
- Tiêu đề khổng lồ với hiệu ứng chữ gradient.
- Lặp đi lặp lại các tấm kính mờ (glassmorphism).
- Mọi tính năng đều nằm trong một card nổi bo tròn.
- Độ mờ (blur) và độ trong suốt (transparency) quá dày đặc.
- Các section trống trải mênh mông nhưng rất ít nội dung giá trị.
- Hiệu ứng chuyển động tùy tiện ở mọi ngóc ngách.

---

## 3. HỆ THỐNG MÀU SẮC (COLOR SYSTEM)

### 3.1. Bắt đầu với bảng màu tiết chế
Sử dụng bảng màu gọn gàng, nhất quán.

Đối với một ứng dụng doanh nghiệp điển hình:
- Nền trang (page background): Trắng hoặc xám trung tính rất nhạt.
- Bề mặt chính (surface): Trắng.
- Văn bản chính (primary text): Xám đậm hoặc gần đen (đảm bảo độ tương phản cao).
- Văn bản phụ (secondary text): Xám vừa.
- Viền và phân cách (borders/dividers): Xám trung tính nhạt.
- Hành động chính (primary action): Một màu thương hiệu duy nhất, nhất quán.
- Màu trạng thái (thành công, cảnh báo, lỗi, thông tin): Chỉ sử dụng khi mang ý nghĩa ngữ cảnh.

Ví dụ biến CSS tham khảo:
```css
:root {
  --color-page: #f8fafc;
  --color-surface: #ffffff;
  --color-text: #1f2937;
  --color-text-secondary: #64748b;
  --color-border: #e2e8f0;
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-success: #15803d;
  --color-warning: #b45309;
  --color-danger: #dc2626;

  --radius-control: 6px;
  --radius-card: 10px;

  --shadow-overlay: 0 4px 12px rgb(15 23 42 / 8%);
}
```

### 3.2. Quy tắc sử dụng màu sắc
- Không đưa vào nhiều màu nhấn (accent color) tranh chấp nhau.
- Không dùng màu tím làm màu chủ đạo mặc định chỉ vì trông nó "thời thượng".
- Không gán mỗi card một màu rực rỡ khác nhau.
- Không dùng nền màu cho nội dung thông thường nếu không có lý do ngữ nghĩa.
- Giữ màu sắc đồng bộ giữa các trang và thành phần.
- Luôn tôn trọng màu thương hiệu có sẵn của dự án nếu đã có.

---

## 4. BỐ CỤC VÀ PHÂN CẤP THÔNG TIN

### 4.1. Ưu tiên bố cục hơn trang trí
Xây dựng giao diện dựa trên:
1. Cấu trúc trang mạch lạc.
2. Căn lề chuẩn xác.
3. Khoảng cách (spacing) đồng đều.
4. Phân cấp cỡ chữ (typography hierarchy).
5. Nhóm thông tin có ý nghĩa.
6. Đường viền tinh tế khi cần thiết.
7. Sử dụng màu sắc tiết chế.
8. Hiệu ứng chỉ xuất hiện khi có lý do chính đáng.

### 4.2. Khối chứa phù hợp
- Không bọc toàn bộ trang trong một chiếc card trang trí.
- Không tạo các lớp bọc (wrapper) thừa với nền, viền và bóng.
- Dùng `max-width` phù hợp để dễ đọc.
- Sử dụng CSS Grid hoặc Flexbox hợp lý.
- Tránh dùng `position: absolute` tùy tiện cho bố cục trang thông thường.
- Không để xảy ra tràn ngang (horizontal scroll) ở các độ phân giải màn hình thông dụng.
- Dùng thẻ ngữ nghĩa HTML (`header`, `nav`, `main`, `section`, `article`, `footer`).

### 4.3. Thang khoảng cách (Spacing System)
- `4px`: Khoảng cách rất nhỏ bên trong icon/tag.
- `8px`: Khoảng cách gọn gàng giữa các chi tiết nhỏ.
- `12px`: Khoảng cách giữa các phần tử nhập liệu, nhãn liên quan.
- `16px`: Khoảng cách chuẩn giữa các khối nội dung.
- `24px`: Ngăn cách giữa các nhóm thành phần.
- `32px`: Ngăn cách giữa các phần lớn (major sections).
- `48px` trở lên: Chỉ dùng khi cấu trúc trang và mật độ thông tin thực sự cho phép.

### 4.4. Mật độ nội dung (Content Density)
- Dashboard quản trị: Ưu tiên khả năng xem dữ liệu, bảng biểu và điều hướng nhanh chóng.
- Thương mại điện tử: Ưu tiên ảnh sản phẩm, giá, bộ lọc và hành động mua sắm.
- Form biểu mẫu: Ưu tiên sự rõ ràng, nhãn trường, gợi ý kiểm tra lỗi và hoàn thành biểu mẫu dễ dàng.

---

## 5. TYPOGRAPHY & NGÔN NGỮ

- Sử dụng thang kích thước chữ mạch lạc (h1, h2, h3, body, caption).
- Đảm bảo tiếng Việt hiển thị sắc nét, chuẩn font chữ hệ thống hoặc font Google phổ biến (Inter, Roboto, Be Vietnam Pro,...), không lỗi dấu.
- Tránh làm mọi tiêu đề đều in đậm, viết hoa hoặc giãn chữ quá đà.
- Không dùng chữ gradient hoặc đổ bóng chữ cho nội dung đọc thông thường.
- Chiều cao dòng (line-height) hợp lý cho việc đọc tiếng Việt.
- Dùng typography để phân cấp thông tin thay vì vẽ thêm card và viền.

---

## 6. CÁC THÀNH PHẦN GIAO DIỆN (COMPONENTS)

### 6.1. Nút bấm (Buttons)
- Phân biệt rõ nút chính (Primary), nút phụ (Secondary), nút viền (Outline) hoặc nút dạng văn bản (Text button).
- Không cho tất cả các nút cùng màu nền nổi bật.
- Giữ chiều cao, padding, bán kính bo góc và cỡ chữ của nút bấm nhất quán.
- Trạng thái hover, focus, disabled rõ ràng, tự nhiên.

### 6.2. Biểu mẫu & Ô nhập liệu (Forms & Inputs)
- Nhãn (label) luôn hiển thị rõ ràng và bằng tiếng Việt chuẩn ngữ cảnh.
- Nhóm các trường liên quan một cách hợp lý.
- Chiều cao ô nhập liệu, đường viền và khoảng cách đồng bộ.
- Hiển thị thông báo lỗi xác thực (validation) cụ thể, đặt ngay dưới trường liên quan.
- Giữ nguyên khả năng điều hướng bằng bàn phím (phím Tab) và viền focus trợ năng.

### 6.3. Bảng dữ liệu (Tables & Data lists)
- Trình bày dạng hàng và cột rõ ràng, gọn mắt.
- Đường kẻ phân cách ngang nhẹ nhàng.
- Không biến mỗi hàng của bảng thành một card bo tròn riêng rẽ.
- Căn lề số liệu về bên phải, văn bản về bên trái.
- Giữ nguyên các chức năng phân trang, sắp xếp, lọc dữ liệu sẵn có.

### 6.4. Điều hướng (Navigation)
- Menu dễ quét mắt và dự đoán được.
- Trạng thái kích hoạt (active) tinh tế, rõ ràng.
- Giữ menu tương thích tốt trên màn hình di động (mobile responsive).

### 6.5. Hộp thoại (Dialogs & Modals)
- Bề mặt hộp thoại sắc nét, nền backdrop mờ nhẹ vừa phải.
- Đổ bóng nhẹ nhàng để tạo chiều sâu nâng lên (elevation).
- Cho phép đóng bằng phím ESC hoặc nút đóng rõ ràng.

---

## 7. HIỆU ỨNG ĐỘNG VÀ TƯƠNG TÁC (ANIMATION)

Không thêm chuyển động chỉ vì có thể làm được.

Mặc định tránh:
- Hiệu ứng thị sai (parallax).
- Các phần tử trôi bồng bềnh liên tục không ngừng.
- Hiệu ứng phát xung (pulse glow).
- Nền chuyển động lượn sóng.
- Phóng to quá mức khi hover.
- Hiệu ứng nảy (bounce) quá lố.

Chấp nhận khi có ích:
- Hiệu ứng chuyển trạng thái ngắn (150ms - 250ms) cho màu sắc, độ mờ hoặc biến đổi nhỏ.
- Phản hồi hover và focus rõ nét.
- Biểu tượng tải dữ liệu (spinner/skeleton) trong thời gian tải thật.
- Đóng/mở accordion mượt mà hỗ trợ hiểu trạng thái.
- Tôn trọng thuộc tính `prefers-reduced-motion` của người dùng.

---

## 8. THIẾT KẾ ĐÁP ỨNG VÀ TRỢ NĂNG (RESPONSIVE & ACCESSIBILITY)

- Hoạt động mượt mà trên Mobile, Tablet và Desktop.
- Kiểm tra các màn hình hẹp (360px - 390px), không để vỡ giao diện hay chữ bị cắt xén.
- Đảm bảo vùng bấm (touch target) đủ lớn trên màn hình cảm ứng (tối thiểu 40x40px).
- Giữ độ tương phản màu sắc đạt chuẩn đọc (WCAG AA).
- Không chỉ dựa vào màu sắc đơn thuần để biểu thị trạng thái (cần có icon hoặc văn bản đi kèm).

---

## 9. NGUYÊN TẮC BẢO TOÀN DỰ ÁN HIỆN TẠI

Trước khi can thiệp vào bất kỳ mã nguồn nào:
1. Kiểm tra cấu trúc thư mục, CSS toàn cục, thư viện component và design token hiện có của dự án.
2. Xác định chính xác các trang và component bị ảnh hưởng.
3. Tái sử dụng bảng màu, khoảng cách, typography và quy ước component hiện có nếu chúng hợp lý.
4. Tránh viết đè CSS xung đột, tránh tạo class trùng lặp.
5. Không tự ý thay đổi thư viện hay framework hiện hành.
6. Không viết lại các file không liên quan.
7. Giữ nguyên 100% logic nghiệp vụ, tích hợp API, xác thực form, routing và responsive.
8. Không thay đổi backend chỉ để phục vụ chỉnh sửa giao diện.
9. Khi được yêu cầu sửa một chi tiết thị giác, chỉ thực hiện thay đổi tối thiểu cần thiết.

---

## 10. QUY TẮC VIẾT CSS

- Ưu tiên sử dụng các biến token thiết kế và class tái sử dụng.
- Hạn chế tối đa việc lạm dụng `!important`.
- Tránh selector lồng nhau quá sâu.
- Tránh khai báo selector toàn cục làm ảnh hưởng ngoài ý muốn đến các thành phần khác.
- Hạn chế style nội dòng (inline style) trừ trường hợp giá trị động bắt buộc.
