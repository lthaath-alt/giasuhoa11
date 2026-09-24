# Tài liệu theo chủ đề — product-decisions

> Trích nguyên văn từ CLAUDE.md người dùng cung cấp. Quy tắc/giới hạn vẫn có hiệu lực; số đo và trạng thái dịch vụ là ghi nhận lịch sử, chưa được xác minh lại. Chỉ đọc phần liên quan.

**Tra mục:** [INDEX.md](INDEX.md). **Đọc chéo khi liên quan:** [security.md](security.md), [data.md](data.md), [ui.md](ui.md).

Các đường dẫn code trong nội dung gốc tính từ gốc repo. Cụm “mục bên dưới”, “tệp này” hoặc tên mục không kèm file là tham chiếu của bản gốc: dùng INDEX.md để tìm đúng tài liệu mới.

---

## Tính năng đã chốt — ghi để khỏi sửa ngược

Hai khối dưới đây trước nằm trong mục "An ninh", nhưng chúng là ghi chú
TÍNH NĂNG chứ không phải hàng rào an ninh. Xếp nhầm chỗ thì người đi tìm
"trò chơi mở khoá" không bao giờ nghĩ tới việc mở mục An ninh ra đọc.

**Khách vãng lai còn 5 lượt** (20/09/2026, trước đó 25). Khách dùng chung hạn
mức Gemini theo ngày với học sinh; ngày 18/09/2026 cả web hết lượt giữa buổi.
Con số khai ở `TRAN_LUOT_KHACH`; mọi chỗ hiển thị phải đọc hằng số đó, đừng
chép cứng — `kiem-tra:het-luot` bắt chỗ nào chép.

**Trò chơi mở khoá được Luyện tập** (20/09/2026). Trượt hết lượt thì bị khoá 10
phút; chơi xong màn của đúng bài đó là được làm lại ngay. Tiến độ trò chơi nay
ghi thêm `luc` — mốc thời gian lần chơi XONG gần nhất. Thiếu mốc đó thì một màn
chơi từ tuần trước cũng mở được khoá. Ba điều đi kèm: chỉ ghi `luc` khi lượt
chơi thật sự XONG; chơi lại mà không hơn điểm cũ vẫn phải ghi (nếu không, em
chơi xong mà khoá không mở); và trò chơi phải mở TRONG tab Trò chơi của web,
vì nó gửi tiến độ về bằng `postMessage` tới cửa sổ cha.


## KHÔNG biến app thành PWA / service worker
- Dự án này KHÔNG phải PWA và phải giữ nguyên như vậy. ĐỪNG thêm `vite-plugin-pwa`, `workbox`, `manifest.webmanifest`, hay bất kỳ đoạn `navigator.serviceWorker.register(...)` nào.
- Lý do: service worker cache lại trang cũ → học viên sửa code, build lại, deploy mà trình duyệt vẫn hiện bản cũ, tưởng "sửa không ăn". Người mới rất dễ nản vì lỗi khó hiểu này.
- Nếu user yêu cầu "làm web cài được như app / hoạt động offline / thêm PWA": giải thích ngắn gọn rủi ro cache gây rối cho người mới, hỏi lại có chắc không rồi mới làm — đừng tự động thêm.
- (Firebase SDK có dùng service worker nội bộ cho auth — đó là chuyện khác, không phải PWA, không cần đụng tới.)

