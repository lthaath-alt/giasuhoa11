# Tài liệu theo chủ đề — project

> Trích nguyên văn từ CLAUDE.md người dùng cung cấp. Quy tắc/giới hạn vẫn có hiệu lực; số đo và trạng thái dịch vụ là ghi nhận lịch sử, chưa được xác minh lại. Chỉ đọc phần liên quan.

**Tra mục:** [INDEX.md](INDEX.md). **Đọc chéo khi liên quan:** [auth.md](auth.md), [security.md](security.md), [testing.md](testing.md).

Các đường dẫn code trong nội dung gốc tính từ gốc repo. Cụm “mục bên dưới”, “tệp này” hoặc tên mục không kèm file là tham chiếu của bản gốc: dùng INDEX.md để tìm đúng tài liệu mới.

**Ghi chú đối chiếu:** Bảng stack cũ nói khóa riêng người dùng đã bỏ; security.md có ghi nhận có lại ngày 20/09. Câu hướng dẫn dùng @google/genai cho AI mới không được hiểu là thay Firebase AI Logic trên web. Đối chiếu đường web/script và code thực tế trước khi sửa.

---

## Hiện trạng dự án (mặc định — đổi được)
| Thành phần | Đang dùng |
|---|---|
| Framework | React 19 + Vite 6 + TypeScript 5.8 |
| UI | MUI v9 (`@mui/material`) + Tailwind v4 (nạp bằng `@import "tailwindcss"` trong `index.css`, KHÔNG có tệp cấu hình) + emotion |
| Icons / Animation | `lucide-react`, `@mui/icons-material` / `motion` |
| Backend | Firebase Firestore |
| Auth | **Firebase Auth** (email + mật khẩu). Hồ sơ ở `users/{uid}` — xem "Vài điểm dễ vấp" |
| AI | Gemini qua **Firebase AI Logic** (gói firebase/ai + App Check reCAPTCHA Enterprise) ở bản build — xem `src/features/tutor/services/giaSuFirebaseAI.ts`. Trước khi gọi, `pedagogicalStateMachine.ts` đếm bế tắc / chặn gian lận phòng thi. `@google/genai` chỉ còn dùng trong script `scripts/` (đường "key riêng người dùng tự nhập" đã bỏ ngày 14/09/2026) |
| Hiển thị chat | `MathMarkdownRenderer.tsx` (react-markdown + remark-math + rehype-sanitize + rehype-katex + mhchem), thay cho RichText/mathText đã xoá |
| Routing | `react-router-dom` v7 |
| Form | Không có thư viện form — viết tay bằng state |

> Ba gói `react-hook-form`, `zod`, `recharts` từng được ghi ở đây nhưng **chưa bao giờ
> được cài**. Đừng `import` chúng.

Khi thêm code MỚI mà user không nói khác: bám stack trên cho nhất quán (vd cần UI thì dùng MUI, cần AI thì dùng `@google/genai`). Khi user muốn thêm/đổi công nghệ: làm theo user.


## Cấu trúc & quy ước
```
src/
├── core/
│   ├── components/   # khối dùng chung + RouteGuards.tsx + GlobalErrorBoundary
│   ├── contexts/     # AppContext.tsx — kho trạng thái toàn ứng dụng
│   ├── hooks/        # useApp.ts, useCheDoMau.ts
│   └── services/     # firebase.ts, firestoreAuth.ts, firestoreService.ts, googleAuth.ts…
├── features/         # 12 module: admin, auth, bank, games, lessons, library,
│                     #   mascot, quiz, research, student, teacher, tutor
├── pages/            # AdminPage, DashboardPage, LoginPage, NotFoundPage,
│                     #   QuizPage, SchoolAdminPage, TeacherPage
├── App.tsx           # 14 <Route>, và khối `palette` của MUI
├── index.css         # TOÀN BỘ biến màu, hai chế độ sáng/tối
└── main.tsx
```
KHÔNG có `src/lib/`, `src/services/`, `src/components/`, `src/guards/` — bốn thư mục
này từng được ghi ở đây nhưng chưa bao giờ tồn tại.

- Import 1 chiều: `pages → features → core`.
- Logic Firestore/AI để trong `core/services/` hoặc `features/{tên}/services/`, KHÔNG
  viết thẳng trong component. Quy tắc này giúp thêm tính năng sau gọn và dễ sửa.
- Đặt tên: component React `PascalCase.tsx`; trong `src/` phần lớn hàm đặt tên tiếng
  Anh, còn trong `scripts/` và `public/games/` đặt tên tiếng Việt không dấu. Viết thêm
  vào vùng nào thì theo lối của vùng đó.


## Thêm một feature/trang mới — checklist
1. Component/trang mới đặt đúng chỗ: trang → `pages/` (theo role nếu có), khối tính năng → `features/{tên}/components/`.
2. Việc gọi Firestore/AI → tách ra hàm trong `core/services/`, component chỉ gọi hàm đó.
3. Nối route trong `App.tsx`, bọc bằng thẻ canh phù hợp lấy từ
   `core/components/RouteGuards.tsx`: `PublicRoute`, `ProtectedRoute`,
   `TeacherRoute`, `SchoolAdminRoute`, `SuperAdminRoute`.
4. Cần UI → dùng MUI cho khớp theme; layout nhanh có thể dùng Tailwind class.
5. Chạy `npm run lint` kiểm tra sạch trước khi báo xong.

