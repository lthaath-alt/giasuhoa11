# Tài liệu theo chủ đề — deployment

> Trích nguyên văn từ CLAUDE.md người dùng cung cấp. Quy tắc/giới hạn vẫn có hiệu lực; số đo và trạng thái dịch vụ là ghi nhận lịch sử, chưa được xác minh lại. Chỉ đọc phần liên quan.

**Tra mục:** [INDEX.md](INDEX.md). **Đọc chéo khi liên quan:** [security.md](security.md), [testing.md](testing.md).

Các đường dẫn code trong nội dung gốc tính từ gốc repo. Cụm “mục bên dưới”, “tệp này” hoặc tên mục không kèm file là tham chiếu của bản gốc: dùng INDEX.md để tìm đúng tài liệu mới.

**Nền tảng đích: Cloudflare Pages, địa chỉ `https://giasuhoa11.pages.dev`** (chốt 26/09/2026, bỏ hẳn Netlify). Trước đó web chạy song song hai nơi và bản `giasuhoa11.netlify.app` bị bỏ quên ở bản cũ — QR trên poster trỏ vào đúng bản cũ đó. Các đoạn nhắc Netlify ở tài liệu khác là ghi chép lịch sử.

---

## Deploy lên Cloudflare Pages (tải tay thư mục `dist/`)
- Chủ dự án deploy bằng cách `npm run build` rồi tải thư mục `dist/` lên dự án Cloudflare Pages `giasuhoa11` (KHÔNG qua git). AI không tự build hay deploy.
- **Bắt buộc có `public/_redirects`** với nội dung `/*  /index.html  200`, và **`public/_headers`**. Vite tự copy cả hai vào `dist/` khi build. ĐỪNG xoá.
- Lý do `_redirects`: đây là SPA (React Router). Không có tệp này thì F5/mở trực tiếp một route con (vd `/login`) sẽ báo 404, vì máy chủ tìm tệp tên `login` không có.
- Cloudflare Pages đọc `_headers` và `_redirects` cùng cú pháp với Netlify. Đo 26/09/2026 bằng `curl -sI`: trang chủ có đủ CSP (kèm hash do `scripts/bam-csp.mts` thêm lúc build) và `X-Frame-Options: SAMEORIGIN`; `/login` trả 200; ảnh `/hoa11/slides/*` nhận đúng `max-age=3600`.
- Sau mỗi lần deploy: `curl -sI https://giasuhoa11.pages.dev/` xem còn dòng `content-security-policy`, và mở thẳng một route con để chắc F5 không 404.
- Nếu user báo "F5 bị 404" hoặc "vào link con bị Page not found": kiểm tra `public/_redirects` còn không, và nó có nằm trong `dist/` sau khi build không.
- **Việc chỉ chủ dự án làm được khi bỏ Netlify:** xoá (hoặc để trống) site Netlify; gỡ `giasuhoa11.netlify.app` khỏi danh sách tên miền của khoá reCAPTCHA Enterprise và khỏi Authorized domains của Firebase Auth. Hai bản dùng chung hạn mức Gemini, nên bản cũ còn sống là còn tiêu lượt của cả web.


## Biến môi trường & lỗi trắng trang
- **Cấu hình Firebase nằm trong git** ở `src/core/services/firebaseCongKhai.ts`, và
  `src/core/services/firebase.ts` lấy nó làm bản dự phòng khi không có biến
  `VITE_FIREBASE_*`. Nhờ vậy máy vừa `git clone` về chạy được ngay. Nếu app trắng
  trang, ĐỪNG đi sửa Firebase config trước; xem lỗi thật trong Console trình duyệt
  (F12) rồi mới chẩn đoán.
  - (Khoá web của Firebase không phải bí mật — nó vốn nằm trong mã JavaScript đã dựng
    trên web, ai bấm F12 cũng đọc được. An toàn dựa vào Firestore Rules, và
    từ 12/09/2026 luật đã siết theo vai — xem mục "An ninh dự án". `bank_questions` nay
    chỉ giáo viên ghi được, nhưng vẫn **đọc công khai** vì đồng bộ đêm cần.)
- **Web KHÔNG cần key Gemini** (từ 13/09/2026): gia sư gọi qua Firebase AI Logic, xem `src/features/tutor/services/giaSuFirebaseAI.ts`. `.env.local` chỉ cần `GEMINI_API_KEY` cho script trong `scripts/` (xem `.env.example`). **Đừng bao giờ** đặt key Gemini vào biến `VITE_*` — Vite chép nguyên văn vào gói JS; `kiem-tra:an-ninh` bắt điều đó.
- Máy dev gọi Firebase AI Logic cần `VITE_APPCHECK_DEBUG_TOKEN` trong `.env.development.local` (token đăng ký ở Firebase Console → App Check → Manage debug tokens). Nếu gia sư báo "tạm mất kết nối với máy chủ": trên máy dev thường là thiếu hoặc sai token đó; trên Cloudflare Pages thường là CSP trong `public/_headers` hoặc tên miền chưa có trong key reCAPTCHA. Mở F12 xem lỗi thật trước khi sửa.
- ĐỪNG commit `.env.local` (đã nằm trong `.gitignore`).

