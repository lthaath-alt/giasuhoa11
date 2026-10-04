# AGENTS.md — Gia sư Hóa 11

Tệp này dành cho **trợ lý AI KHÔNG phải Claude Code**: Antigravity, Gemini CLI,
Codex, Cursor, Copilot. Claude Code tự nạp `CLAUDE.md` nên không cần tệp này.

Nền tảng tự học Hoá học 11 (Kết nối tri thức 2018) cho học sinh và giáo viên,
phục vụ một đề tài NCKH. **Tính đúng đắn của nội dung hoá học quan trọng hơn mọi
thứ khác** — kể cả tốc độ, kể cả code đẹp.

## Đọc gì trước khi làm gì

**`CLAUDE.md` ở gốc repo là điểm vào.** Nó ngắn (~11 KB) và chứa bảng chỉ đường
sang `docs/claude-reference/`. Mở nó ra rồi đọc bảng **không phải là đã đọc đủ**:
chi tiết nằm ở 11 tệp trong `docs/claude-reference/`, và sửa vùng nào thì phải
mở tệp của vùng đó.

| Sắp đụng vào | Mở tệp |
|---|---|
| Đăng nhập, vai trò, vào lớp | `docs/claude-reference/auth.md` |
| Luật Firestore, CSP, App Check, XSS | `docs/claude-reference/security.md` |
| Ngân hàng câu hỏi, bài nộp, hạn mức đọc | `docs/claude-reference/data.md` |
| Màu, giao diện, sáng/tối, MUI | `docs/claude-reference/ui.md` |
| Phép kiểm, Playwright, lỗi khó tái hiện | `docs/claude-reference/testing.md` |
| Soát hoá học, Gemini CLI/API, sửa câu hỏi | `docs/claude-reference/chemistry.md` |
| Deploy, biến môi trường, trắng trang | `docs/claude-reference/deployment.md` |
| Cấu trúc thư mục, thêm trang mới | `docs/claude-reference/project.md` |
| Quy trình làm việc, kỹ năng, bài học | `docs/claude-reference/workflow.md` |
| Huấn luyện lại bộ phân loại ý định từ bảng đã gán nhãn | `scripts/phan-loai/HUONG-DAN-CHO-AI.md` |
| Hạn mức khách, trò chơi mở khoá, PWA | `docs/claude-reference/product-decisions.md` |

## Ba điều CẤM, không có ngoại lệ

Ba điều này lặp lại ở đây thay vì chỉ trỏ đi, vì hậu quả của việc vi phạm là hỏng
dữ liệu thật hoặc mất hàng rào an ninh — quá đắt để phụ thuộc vào việc bạn có
chịu mở thêm một tệp nữa hay không.

1. **Không tự chạy `npm run build`, không push, không deploy, không publish luật
   Firestore, không chạy lệnh git nguy hiểm** (`reset --hard`, xoá nhánh, ghi
   đè). Chủ dự án tự làm những việc đó.
2. **`bank_questions` phải giữ `allow read: if true`** trong `firestore.rules`.
   Workflow đồng bộ đêm đọc Firestore **không đăng nhập**; siết dòng đó là đồng
   bộ chết mà không ai biết, vì web vẫn đúng và chỉ bản chụp trong repo lệch dần.
3. **Đặt hay đổi trường `role`, và xoá hồ sơ người dùng: chỉ `laChuDuAn()`.**
   Đừng canh bằng vai trong hồ sơ — vai chính là thứ đang được bảo vệ.

## Vài điều khác dễ vấp

- **Ngân hàng câu hỏi thật nằm ở Firestore**, không nằm trong repo.
  `public/bank/ngan-hang.json` chỉ là bản chụp. `src/features/lessons/constants.ts`
  do máy sinh ra, sửa tay sẽ bị ghi đè.
- **Đừng tải cả ngân hàng ở màn học sinh.** `getAll()` là 1.554 lượt đọc mỗi lần
  gọi, mà bậc miễn phí chỉ có 50.000 lượt/ngày. Chi tiết ở `data.md`.
- **Nhờ mô hình ngoài soát nội dung thì CHỈ gửi nội dung câu hỏi** — không email,
  không tên học sinh, không tiến độ. Cái gì gửi đi là rời khỏi máy vĩnh viễn.
- **Một mô hình nói "câu này sai" KHÔNG phải bằng chứng câu đó sai.** Phải kiểm
  tay rồi mới sửa, và chủ dự án là người quyết sửa thế nào.
- **Đừng thêm PWA hay service worker.** Lý do ở `product-decisions.md`.
- Trả lời bằng tiếng Việt; giữ nguyên tiếng Anh cho tên biến, hàm, tệp và lệnh.

## Nếu tệp này mâu thuẫn với `CLAUDE.md`

`CLAUDE.md` và `docs/claude-reference/` thắng — chúng là bản được bảo trì. Tệp
này là bản rút gọn cho công cụ khác, nên nó có thể cũ hơn. Gặp mâu thuẫn thì nói
ra chỗ lệch chứ đừng tự chọn một bên rồi đi tiếp.
