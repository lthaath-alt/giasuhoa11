# Tài liệu theo chủ đề — deployment

> Trích nguyên văn từ CLAUDE.md người dùng cung cấp. Quy tắc/giới hạn vẫn có hiệu lực; số đo và trạng thái dịch vụ là ghi nhận lịch sử, chưa được xác minh lại. Chỉ đọc phần liên quan.

**Tra mục:** [INDEX.md](INDEX.md). **Đọc chéo khi liên quan:** [security.md](security.md), [testing.md](testing.md).

Các đường dẫn code trong nội dung gốc tính từ gốc repo. Cụm “mục bên dưới”, “tệp này” hoặc tên mục không kèm file là tham chiếu của bản gốc: dùng INDEX.md để tìm đúng tài liệu mới.

**Ghi chú đối chiếu:** Tài liệu này nói Netlify, trong khi ví dụ E2E dùng tên miền pages.dev. Xác nhận nền tảng đích thực trước khi thay cấu hình hoặc triển khai; không suy ra một nền tảng đã thay thế nền tảng kia.

---

## Deploy lên Netlify (kéo thả thư mục `dist/`)
- Học viên deploy bằng cách `npm run build` rồi kéo-thả thư mục `dist/` lên Netlify (KHÔNG qua git).
- **Bắt buộc có `public/_redirects`** với nội dung `/*  /index.html  200`. Vite tự copy file này vào `dist/` khi build. ĐỪNG xoá nó.
- Lý do: đây là SPA (React Router). Không có file này thì F5/mở trực tiếp một route con (vd `/login`) sẽ báo **404 (Page not found)** trên Netlify, vì Netlify tìm file tên `login` không có. Rule `_redirects` bảo Netlify trả `index.html` cho mọi đường dẫn để React Router tự xử lý.
- Nếu user báo "F5 bị 404 trên Netlify" hoặc "vào link con bị Page not found": kiểm tra `public/_redirects` còn không, và nó có nằm trong `dist/` sau khi build không.


## Biến môi trường & lỗi trắng trang
- **Cấu hình Firebase nằm trong git** ở `src/core/services/firebaseCongKhai.ts`, và
  `src/core/services/firebase.ts` lấy nó làm bản dự phòng khi không có biến
  `VITE_FIREBASE_*`. Nhờ vậy máy vừa `git clone` về chạy được ngay. Nếu app trắng
  trang, ĐỪNG đi sửa Firebase config trước; xem lỗi thật trong Console trình duyệt
  (F12) rồi mới chẩn đoán.
  - (Khoá web của Firebase không phải bí mật — nó vốn nằm trong mã JavaScript đã dựng
    trên Netlify, ai bấm F12 cũng đọc được. An toàn dựa vào Firestore Rules, và
    từ 12/09/2026 luật đã siết theo vai — xem mục "An ninh dự án". `bank_questions` nay
    chỉ giáo viên ghi được, nhưng vẫn **đọc công khai** vì đồng bộ đêm cần.)
- **Web KHÔNG cần key Gemini** (từ 13/09/2026): gia sư gọi qua Firebase AI Logic, xem `src/features/tutor/services/giaSuFirebaseAI.ts`. `.env.local` chỉ cần `GEMINI_API_KEY` cho script trong `scripts/` (xem `.env.example`). **Đừng bao giờ** đặt key Gemini vào biến `VITE_*` — Vite chép nguyên văn vào gói JS; `kiem-tra:an-ninh` bắt điều đó.
- Máy dev gọi Firebase AI Logic cần `VITE_APPCHECK_DEBUG_TOKEN` trong `.env.development.local` (token đăng ký ở Firebase Console → App Check → Manage debug tokens). Nếu gia sư báo "tạm mất kết nối với máy chủ": trên máy dev thường là thiếu hoặc sai token đó; trên Netlify thường là CSP trong `public/_headers` hoặc tên miền chưa có trong key reCAPTCHA. Mở F12 xem lỗi thật trước khi sửa.
- ĐỪNG commit `.env.local` (đã nằm trong `.gitignore`).

