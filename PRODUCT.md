# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Học sinh lớp 11** là người dùng chính, tự học môn Hoá học ngoài giờ lên lớp mà không
đi học thêm. Các em dùng nền tảng ở **cả ba bối cảnh**, đã xác nhận với chủ dự án:

- điện thoại, tự học buổi tối ở nhà;
- máy tính ở nhà, ngồi bàn học lâu hơn;
- **máy chiếu trong lớp**, khi giáo viên tổ chức ôn tập tập thể — trò chơi đã có sẵn
  "chế độ lớp học" cho 2–4 người chơi chung một máy.

**Giáo viên** là người dùng thứ hai và cũng là người soạn nội dung: soạn câu hỏi, duyệt
ngân hàng, theo dõi tiến độ lớp. Hệ thống có bốn vai trò:
`admin` · `school_admin` · `teacher` · `student`.

## Product Purpose

Giúp học sinh lớp 11 tự học được môn Hoá mà không cần đi học thêm tốn kém, bằng cách
ghép nội dung bám sách giáo khoa với một gia sư AI dẫn dắt tư duy.

Thành công nghĩa là học sinh **tự giải ra** được bài, không phải chép đáp án.

Dự án đồng thời là đề tài **nghiên cứu khoa học**, có đợt thực nghiệm dự kiến trong
tháng 10.

## Positioning

Ba điều cộng lại, và phải cộng lại mới thành khác biệt — chủ dự án xác nhận cả ba:

1. **Gia sư AI không giải hộ.** "Cho cần câu chứ không cho con cá": Thầy Hùng gợi mở
   từng bước, cố ý không đưa đáp số. Một app đưa đáp án nhanh hơn không thay thế được
   điều này vì nó làm ngược lại mục đích.
2. **Bám sát 25 bài Kết nối tri thức 2018**, không phải kiến thức chung chung hay sách
   cũ. Nội dung khớp đúng sách học sinh đang cầm trên tay.
3. **Ngân hàng câu hỏi do chính giáo viên soạn và duyệt** — 252 câu tính tới 08/09/2026,
   không phải kho câu hỏi mua sẵn.

## Operating Context

- Học sinh xen kẽ giữa **đọc bài giảng**, **hỏi gia sư AI**, **làm đề kiểm tra** và
  **chơi trò ôn tập**. Bốn việc này là một vòng học, không phải bốn sản phẩm rời.
- Giáo viên soạn câu hỏi trên web; ngân hàng thật nằm ở Firestore và tự đồng bộ về kho
  mã mỗi đêm.
- Bốn trò chơi ôn tập: "Thám Tử Hoá Chất", "Giải Cứu Phòng Thí Nghiệm", "Vòng Quanh
  Hoá 11" và "Rắn và Thang" (25 màn theo 25 bài, mở
  khoá lần lượt). Trò chơi chạy trong iframe cùng nguồn, nói chuyện với web bằng
  `postMessage`.
- Lớp học dùng chung một máy chiếu là cảnh sử dụng thật, không phải giả định.

## Capabilities and Constraints

**Đang có:** 25 bài giảng + trình đọc SGK · gia sư AI Gemini · ngân hàng 252 câu ·
sinh đề kiểm tra theo chương · bốn trò chơi · khu quản trị trường và quản trị hệ thống ·
hai chế độ màu sáng/tối đồng bộ toàn hệ thống.

**Ràng buộc bắt buộc giữ:**

- **Quy ước hoá học Kết nối tri thức 2018**: điều kiện chuẩn 25 °C, 1 bar,
  **24,79 L/mol** (không dùng "đktc" và 22,4); tên chất theo IUPAC tiếng Anh; số thập
  phân dùng **dấu phẩy**; công thức có chỉ số dưới thật (N₂, không phải N2).
- **Tiếng Việt** cho toàn bộ giao diện và thông báo.
- **Tương phản chữ trên nền tối thiểu 4,5** ở **cả hai** chế độ màu; có phép đo tự động
  canh 70 cặp mỗi chế độ (`npm run kiem-tra:mau`).
- Gemini bậc miễn phí: **5 lượt/phút và 20 lượt/ngày** cho mỗi model. Đây là trần thật
  của trải nghiệm hỏi đáp, không phải con số ước lượng.
- Kỹ thuật: React 19 + Vite 6 + MUI v9 + Tailwind v4, Firestore, triển khai Netlify.
  Toàn bộ màu khai bằng biến CSS trong `src/index.css`, hai bảng sáng/tối.

**Lỗ hổng đã biết, chưa sửa:** đăng nhập là hệ tự viết, so mật khẩu dạng chữ thường ngay
trên trình duyệt (`src/core/services/firestoreAuth.ts`); collection `bank_questions` để
`allow write: if true`.

## Brand Commitments

Chủ dự án xác nhận **phải giữ nguyên**:

- **Tên và nhận diện chữ**: "Gia sư Hóa 11", dòng phụ "HỆ THỐNG TỰ HỌC AI", logo sách
  mở, và **số Zalo 0345203054** trên thanh đầu trang.
- **Nhân vật Thầy Hùng** — linh vật gia sư, hiện ở khu iChat và trang giới thiệu.

**Không nằm trong ràng buộc:** bảng màu cam–teal hiện tại. Chủ dự án cố ý không đánh dấu
giữ nó, nên nhận diện màu được phép thay khi dựng thế giới thị giác mới.

## Evidence on Hand

- 25 bài giảng thật, sinh từ tệp `.docx` của chính giáo viên → `src/features/lessons/constants.ts`.
- 252 câu hỏi thật, do giáo viên soạn và duyệt → `public/bank/ngan-hang.json`.
- Bốn trò chơi chạy được → `public/games/`.
- Đề cương nghiên cứu khoa học → `docs/de-cuong-nghien-cuu.md`.

**Chưa có, và không được bịa ra:** con số học sinh đang dùng, lời chứng thực của người
dùng, kết quả thực nghiệm (đợt thực nghiệm chưa chạy), giải thưởng, đối tác, bảng giá.

## Product Principles

1. **Dẫn dắt, không giải hộ.** Mọi tính năng phải đưa học sinh tới chỗ tự nghĩ ra. Thứ
   gì rút ngắn đường tới đáp án mà bỏ qua bước suy nghĩ là đi ngược sản phẩm.
2. **Đúng sách giáo khoa hơn là đúng chung chung.** Sai một quy ước hoá học là dạy sai
   học sinh — nặng hơn mọi lỗi kỹ thuật.
3. **Ba màn hình, một sản phẩm.** Điện thoại, máy tính và máy chiếu đều là cảnh dùng
   thật. Không có cảnh nào là hạng hai.
4. **Giáo viên là tác giả, không phải người tiêu thụ.** Nội dung do thầy soạn và duyệt;
   công cụ phải phục vụ việc soạn, không chỉ việc học.
5. **Đọc được là điều kiện tối thiểu, không phải mục tiêu cộng thêm.** Ngưỡng tương
   phản 4,5 ở cả hai chế độ màu là sàn, có máy canh.

## Accessibility & Inclusion

- Tương phản tối thiểu **4,5** cho chữ thường, đo tự động ở cả hai chế độ màu.
- Hai chế độ màu sáng/tối là tính năng thật, không phải tuỳ chọn trang trí: nhiều học
  sinh học buổi tối.
- Học sinh dùng điện thoại phổ thông và mạng di động; nặng trang là rào cản thật.
