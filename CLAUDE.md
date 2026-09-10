# CLAUDE.md — Gia sư Hóa 11

Nền tảng tự học Hoá học 11 theo chương trình Kết nối tri thức 2018: 25 bài giảng,
gia sư AI (Gemini), ngân hàng câu hỏi, đề kiểm tra và hai trò chơi ôn tập. Người dùng
là học sinh lớp 11 và giáo viên phổ thông. Dùng cho một đề tài nghiên cứu khoa học,
nên tính đúng đắn của nội dung hoá học quan trọng hơn mọi thứ khác.

Nguyên tắc dài hạn của dự án nằm ở `.specify/memory/constitution.md`; tệp này là
hướng dẫn vận hành hằng ngày và không được mâu thuẫn với tệp đó.

> File này mô tả dự án ĐANG như thế nào, để bạn (AI) khỏi phải dò lại toàn bộ code mỗi phiên.
> Đây là mặc định, KHÔNG phải xiềng: nếu user muốn đổi UI/Auth/nhà cung cấp AI/cấu trúc, cứ làm theo user — chỉ cần báo trước là sẽ lệch khỏi mô tả dưới đây.

## Cách làm việc (luôn áp dụng)
- Trả lời bằng tiếng Việt; giữ nguyên tiếng Anh cho tên biến/hàm/file/lệnh/code.
- Trả lời gọn, đi thẳng việc. Yêu cầu chưa rõ hoặc thiếu thông tin → HỎI LẠI trước, đừng đoán rồi làm sai.
- Việc lớn/mơ hồ: nói ngắn gọn định làm gì rồi mới code, để user kịp chỉnh hướng.
- **XEM DANH SÁCH KỸ NĂNG TRƯỚC KHI ĐỌC MÃ.** Repo có gần 30 kỹ năng ở
  `.claude/skills/`, nạp sẵn mỗi phiên, chọn một cái chỉ tốn một câu. Bốn mốc
  BẮT BUỘC dừng lại tự hỏi "việc này có kỹ năng nào không":

  | Khi | Gọi |
  |---|---|
  | User mô tả việc còn mơ hồ, hoặc có nhiều đường làm | `brainstorming` |
  | Có gì đó hỏng / sai / chạy không như mong đợi | `systematic-debugging` |
  | Sắp nói "xong" | `verification-before-completion` |
  | Việc nhiều bước, nhiều tệp | `writing-plans` rồi `executing-plans` |

  Vì sao phải viết ra đây: bản chép superpowers này KHÔNG có hook lúc mở phiên
  như bản plugin, nên **không có gì tự nhắc** — chỉ dòng này nhắc. Đã lỡ hai lần
  thấy rõ cái giá: một lần định đọc ~18.000 dòng mã trò chơi để "chuyển chúng
  sang thế giới mới", trong khi `brainstorming` hỏi đúng một câu ("trò chơi có
  cần thế giới của app không?") là việc co lại còn sửa một chỗ nối; một lần đoán
  nguyên nhân lỗi CSP thay vì chạy `systematic-debugging` ngay từ đầu.

  Kỹ năng `find-skills` là việc KHÁC: nó đi tìm kỹ năng **chưa có** trên
  Internet (chạy `npx skills find`, cần mạng). Đừng lẫn hai việc.
- Sửa xong một việc: chạy `npm run lint` MỘT LẦN trước khi báo xong. Bỏ qua nếu chỉ đổi chữ/màu/comment. Không chạy sau mỗi chỉnh nhỏ.
- KHÔNG tự chạy `npm run build`, git nguy hiểm (reset/xoá/ghi đè), push/deploy — user tự làm.
- Ưu tiên sửa đúng file/màn hình user chỉ ra; chỉ đọc rộng khi thật sự chưa biết lỗi ở đâu.
- **Thấy lỗi NGOÀI phạm vi được giao thì BÁO, đừng tự vá.** Đang làm việc A mà phát
  hiện lỗi B không liên quan: nói ra kèm số đo, rồi hỏi có sửa luôn không. Chỉ tự sửa
  khi B chặn mất việc A. Lý do: mỗi commit nên đúng bằng phần user yêu cầu, không rộng
  hơn — người duyệt mới soi được. Cũng đừng "cải thiện" đoạn mã kề bên, đừng sửa chú
  thích hay định dạng không liên quan, và thấy mã chết thì nhắc chứ đừng xoá.

## Hiện trạng dự án (mặc định — đổi được)
| Thành phần | Đang dùng |
|---|---|
| Framework | React 19 + Vite 6 + TypeScript 5.8 |
| UI | MUI v9 (`@mui/material`) + Tailwind v4 (nạp bằng `@import "tailwindcss"` trong `index.css`, KHÔNG có tệp cấu hình) + emotion |
| Icons / Animation | `lucide-react`, `@mui/icons-material` / `motion` |
| Backend | Firebase Firestore |
| Auth | **Firebase Auth** (email + mật khẩu). Hồ sơ ở `users/{uid}` — xem "Vài điểm dễ vấp" |
| AI | `@google/genai` (Gemini), key qua `GEMINI_API_KEY` ở `.env.local` |
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

## Vài điểm dễ vấp (đọc trước khi sửa vùng liên quan)
- **Auth là Firebase Auth** (chuyển ngày 10/09/2026). Trạng thái vẫn nằm ở
  `core/contexts/AppContext.tsx`, lấy ra bằng `useApp()` (khai ở `core/hooks/useApp.ts`,
  không phải `useAuth`) → `{ currentUser, users, loading, login, register, logout,
  loginWithGoogle, forgotPassword, … }`. **Hình dạng `currentUser` KHÔNG đổi**, nên
  32 tệp dùng nó không phải sửa gì.
  Vai trò: `UserRole = 'admin' | 'school_admin' | 'teacher' | 'student'` (bốn vai, chữ
  thường, gạch dưới — không phải `'Teacher' | 'Student'`).

  Bốn điều phải nhớ trước khi đụng vào vùng này:

  1. **Id tài liệu `users` = `uid` của Auth.** `AppContext` nghe `onAuthStateChanged`
     rồi đọc thẳng `users/{uid}`. Bắt buộc như vậy vì luật Firestore KHÔNG truy vấn
     được, chỉ `get()` theo đường dẫn — đợt siết phân quyền sẽ cần
     `users/{request.auth.uid}` để biết vai. Dùng `addDoc` (id ngẫu nhiên) là hỏng
     đúng điều đó.
  2. **Tạo tài khoản hộ người khác phải đi qua `taoAuthPhu()`** trong `firebase.ts`.
     `createUserWithEmailAndPassword` ĐĂNG NHẬP LUÔN bằng tài khoản vừa tạo, nên gọi
     trên app chính là admin bị đá khỏi phiên của chính mình. Mọi đường tạo tài khoản
     (`register`, `createTeacher`, `createSchoolAdmin`, `createStudent`) đều gọi
     `createAccountWithFirestore` — **đừng bao giờ ghi thẳng `users` để tạo tài khoản**,
     sẽ ra hồ sơ mồ côi không có bản ghi Auth và không ai đăng nhập được.
  3. **Mật khẩu KHÔNG còn trong Firestore**, và kiểu `User` không có trường
     `password` — đó là hàng rào do trình biên dịch giữ. Không ai đặt hộ mật khẩu ai
     được nữa, chỉ gửi thư đặt lại.
  4. **Phiên sống qua F5.** Trước đây `AppContext` cố ý xoá session mỗi lần mở trang;
     Firebase Auth giữ phiên trong IndexedDB.

  Hai điều đợt chuyển KHÔNG làm được, ghi để khỏi tìm lại:
  - **"Đặt lại mật khẩu cả lớp"** trong `ClassManagement` đã bỏ. Trình duyệt không đặt
    được mật khẩu cho người khác; muốn có lại thì cần Cloud Function + Admin SDK, tức
    gói Blaze trả tiền. Nút đó nay chỉ xuất CSV danh sách lớp kèm tên đăng nhập.
  - **Học sinh không có email thật** dùng địa chỉ `<username>@internal.local`. Đăng
    nhập bình thường, nhưng không nhận được thư đặt lại — quên mật khẩu thì giáo viên
    phải tạo lại tài khoản.
- `Grid` MUI v9 dùng `size={{ xs, sm, md }}` (không phải `item`/`xs=` kiểu bản cũ).
- Theme MUI khai ngay trong `src/App.tsx` (không có `core/theme/`): primary là **đỏ tín
  hiệu `#C4000E`**, secondary lục phòng thí nghiệm `#0F5A44`, warning vàng cảnh báo
  `#F5C400`; nền `#F2F1ED` (giấy nhãn) trên `#FFFFFF` (mặt nhãn). Phần nền tối được
  dựng lại bằng một theme thứ hai ở cuối tệp và **phải trùng khớp** với
  `:root[data-theme="dark"]` trong `index.css` — hai hệ nói khác nhau thì chữ MUI ngồi
  trên nền CSS khác hệ, tương phản tụt mà build vẫn xanh.
  Khối `palette` phải giữ mã màu THẬT — đưa biến CSS vào là hỏng cả bảng màu, vì MUI
  cần màu thật để tự tính sắc độ đậm/nhạt. Đây là **chỗ duy nhất** còn được viết cứng
  mã màu; `kiem-tra:mau` bắt mọi chỗ khác.
- Khối `components` của theme quy định hình dạng chung: `shape.borderRadius = 0`, mọi
  `boxShadow` mặc định bị tắt, `Paper`/`Card` dùng nét kẻ thay bóng đổ, mặt nổi lên
  (hộp thoại / menu / gợi ý) tách khỏi nền bằng viền mực 2px. Sửa ở đó rẻ hơn nhiều so
  với đi đổi từng `sx`.
- Đừng sửa `vite.config.ts` phần `hmr`/`watch` (do AI Studio điều khiển, sửa gây nhấp nháy khi edit).
- Đừng commit `.env.local` / API key.

## Lệnh

Hằng ngày:

| Lệnh | Làm gì |
|---|---|
| `npm run dev` | Máy chủ phát triển, cổng 3000 |
| `npm run lint` | `tsc --noEmit` — hàng rào chính, chạy MỘT LẦN trước khi báo xong |
| `npm run kiem-tra` | Chạy cả 10 bộ kiểm, 211 mục. Chạy trước khi commit |
| `npm run build` | **Chỉ khi user yêu cầu** |

Bộ kiểm chạy riêng khi cần: `kiem-tra:chuong-trinh` (dữ liệu 25 bài),
`kiem-tra:ngan-hang`, `kiem-tra:de-chuong`, `kiem-tra:het-luot`, `kiem-tra:mau`
(biến màu + tương phản), `kiem-tra:thuc-nghiem`, `kiem-tra:ran-thang`,
`kiem-tra:dong-bo` (cần mạng, mất mạng thì tự bỏ qua), `kiem-tra:tai-lieu`
(mọi đường dẫn và lệnh npm mà CLAUDE.md / hiến chương nhắc tới đều phải có thật),
`kiem-tra:an-ninh` (những hàng rào an ninh không được phép biến mất — xem mục
"An ninh" bên dưới).

Sinh lại dữ liệu — đọc `scripts/README.md` trước khi dùng:
`soan` (từ tệp .docx sang `constants.ts`), `xuat:ngan-hang` (Firestore sang repo),
`gan:cau-hoi`, `sinh:ran-thang`, `nhung:ran-thang`, `word`, `phan-tich`, `do-chi-phi`,
`thu:ai`.

## Kỹ năng trong repo (`.claude/skills/`)

Mở Claude Code ở thư mục dự án thì các kỹ năng này tự nạp, gọi bằng dấu gạch chéo:

- **`karpathy-guidelines`** — bốn nguyên tắc hành vi: nghĩ trước khi code, ưu tiên đơn
  giản, sửa đúng chỗ, đặt tiêu chí nghiệm thu. Lấy nguyên văn từ
  `github.com/multica-ai/andrej-karpathy-skills` (giấy phép MIT), bản ngày 20/04/2026.
  **Giữ nguyên văn** — sửa thì mất mạch với bản gốc; muốn khác thì ghi vào chính
  `CLAUDE.md` này.
- **`speckit-*`** (10 kỹ năng) — quy trình Spec-Driven Development của GitHub Spec Kit
  1.0.4: `/speckit-constitution`, `/speckit-specify`, `/speckit-plan`, `/speckit-tasks`,
  `/speckit-implement`, `/speckit-converge`, cùng bốn cái tuỳ chọn. Do `specify init`
  sinh ra, đừng sửa tay — chạy lại lệnh đó khi nâng cấp.
- **`impeccable`** — quy trình thiết kế giao diện: chốt sự thật sản phẩm, bốc hướng,
  viết hợp đồng hướng, dựng, rồi duyệt kết thúc. Thế giới thị giác hiện tại của dự án
  ra đời từ đây; xem mục "Thế giới thị giác" bên dưới.
- **14 kỹ năng `superpowers`** — cách LÀM VIỆC, không phải cách viết code:
  `brainstorming`, `writing-plans`, `executing-plans`, `systematic-debugging`,
  `verification-before-completion`, `requesting-code-review`, `receiving-code-review`,
  `test-driven-development`, `using-git-worktrees`, `dispatching-parallel-agents`,
  `subagent-driven-development`, `finishing-a-development-branch`, `writing-skills`,
  `using-superpowers`. Chép nguyên văn từ `github.com/obra/superpowers` v6.3.0 (MIT).
  Nguồn gốc, giấy phép và cách nâng cấp: `.claude/skills/SUPERPOWERS-LICENSE.md`.
- **`vercel-composition-patterns`, `vercel-react-best-practices`** — lối viết
  component React ghép được, và hiệu năng React. Chép từ
  `github.com/vercel-labs/agent-skills` (MIT), bản ngày 10/09/2026. Chỉ lấy 2
  trong 9 kỹ năng của repo đó; bảy cái kia hoặc chỉ dùng cho Vercel (dự án này
  lên Netlify), hoặc mâu thuẫn với hợp đồng hướng, hoặc phải tải hướng dẫn từ URL
  lúc chạy. Lý do từng cái: `.claude/skills/VERCEL-SKILLS-LICENSE.md`.
- **`find-skills`** — đi TÌM kỹ năng chưa có trên Internet (`npx skills find`,
  bảng xếp hạng skills.sh). Chép từ `github.com/vercel-labs/skills` (MIT) — repo
  này là **trình cài đặt CLI**, không phải bộ kỹ năng; chỉ lấy đúng tệp
  `SKILL.md` của `find-skills`, không cài CLI. **Phải hỏi user trước khi chạy
  `npx skills`**: lệnh đó tải và chạy mã từ npm. Đừng lẫn nó với việc dùng kỹ
  năng đã có — việc đó nằm ở mục "Cách làm việc" bên trên.

### Ba chỗ superpowers nói khác dự án này — theo dự án

Nhóm kỹ năng trên viết cho một dự án phần mềm điển hình. Repo này khác ở ba điểm, và
khi mâu thuẫn thì **`CLAUDE.md` thắng**:

1. **`test-driven-development` bảo viết test trước khi viết code.** Dự án này KHÔNG có
   bộ chạy test nào — không Vitest, không Jest. Hàng rào là `npm run lint` cộng chín bộ
   kiểm tự viết trong `scripts/`. "Viết test trước" ở đây nghĩa là **viết phép kiểm
   trước**, thêm vào đúng bộ kiểm liên quan. Đừng tự dựng khung test mới khi user không
   yêu cầu.
2. **`using-git-worktrees`, `finishing-a-development-branch`, `dispatching-parallel-agents`
   giả định AI tự quản nhánh, tự trộn, tự đẩy.** Ở đây thì không: mục "Cách làm việc" đã
   chốt là KHÔNG tự chạy `npm run build`, git nguy hiểm, push hay deploy — user tự làm.
3. **`verification-before-completion` đòi chạy lệnh kiểm rồi mới được nói "xong".** Cái
   này ăn khớp với dự án, và mạnh hơn: bài học số 1 trong mục "Rút kinh nghiệm" nói
   đừng tin dòng chữ "xong" của chính script mình viết. Dùng nó.

Một điểm nữa: bản chép này KHÔNG có hook lúc mở phiên như bản plugin, nên kỹ năng
`using-superpowers` phải được gọi ra chứ không tự nhắc.

`.gitignore` chặn `.claude/*` nhưng CỐ Ý mở ngoại lệ `!.claude/skills/`, để kỹ năng
theo được `git pull` sang máy khác. Phần còn lại của `.claude/` (vd `settings.local.json`)
vẫn bị chặn vì chứa cấu hình riêng từng máy.

## Ngân hàng câu hỏi nằm ở Firestore, không nằm trong repo

Bản thật ở collection `bank_questions`. Trong repo chỉ có bản chụp
`public/bank/ngan-hang.json`, và mọi thứ chạy ngoài trình duyệt đều dùng bản chụp đó:
trò chơi lúc mất mạng, `npm run soan:sinh`, `npm run gan:cau-hoi`, các bộ kiểm.

Việc đồng bộ **tự chạy**: `.github/workflows/dong-bo-ngan-hang.yml` xuất lại lúc 02:00
mỗi đêm rồi commit nếu có gì đổi. Làm tay thì `npm run xuat:ngan-hang` rồi
`npm run gan:cau-hoi`. Quên đồng bộ thì hai bên lệch dần mà **không có dấu hiệu nào** —
web vẫn đúng vì nó đọc thẳng Firestore; `kiem-tra:dong-bo` sinh ra để chặn điều đó.

`src/features/lessons/constants.ts` **do máy sinh ra**, sửa tay sẽ bị ghi đè.

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
    trên Netlify, ai bấm F12 cũng đọc được. An toàn dựa vào Firestore Rules. Hiện
    `bank_questions` để `allow write: if true`, tức ai cũng ghi được — đây là lỗ hổng
    đã biết, siết lại cần Firebase Auth.)
- **`.env.local` chỉ cần cho tính năng AI**: biến `GEMINI_API_KEY` (xem `.env.example`). Thiếu nó thì các phần KHÁC vẫn chạy, chỉ màn hình gọi Gemini mới lỗi.
- Nếu user báo "màn hình AI trắng trang / báo lỗi API key": kiểm tra đã tạo file `.env.local` (copy từ `.env.example`) và điền `GEMINI_API_KEY` thật chưa, rồi chạy lại `npm run dev`. Đây là nguyên nhân số 1 khiến người mới tưởng "hỏng app".
- ĐỪNG commit `.env.local` (đã nằm trong `.gitignore`).

## An ninh

Rà soát ngày 10/09/2026 tìm ra một lỗ hổng **XSS lưu trữ** đã sống trong dự án
từ lâu. Chuỗi tấn công:

```
bank_questions để allow write: if true   →  ai trên Internet cũng ghi được
        ↓
nội dung câu hỏi đọc từ đó
        ↓
đi thẳng vào dangerouslySetInnerHTML    →  không có bộ lọc nào trong cả dự án
```

Kẻ tấn công ghi một câu hỏi chứa `<img src=x onerror=…>` là mọi học sinh mở đề
có câu đó đều chạy mã của hắn. Lúc đó `users` còn lưu mật khẩu dạng chữ thường và
`firestoreAuth.ts` so sánh ngay trên trình duyệt, nên hắn lấy được cả tài khoản —
**vế sau này đã hết** từ đợt chuyển sang Firebase Auth cùng ngày, xem mục dưới.

**Bốn hàng rào hiện có. `npm run kiem-tra:an-ninh` canh cho chúng không biến mất.**

1. **`src/core/services/locHtml.ts`** — lọc HTML bằng danh sách CHO PHÉP (sáu thẻ:
   sub, sup, b, strong, i, em, br, u) và bỏ SẠCH mọi thuộc tính. Dùng
   `<template>` của trình duyệt chứ không dùng regex: regex trên HTML luôn lách
   được bằng `<img/src=x>`, `<IMG SRC=x>`, thẻ lồng nhau. Đã thử 10 đòn tấn công
   thật, không đòn nào lọt; và bốn công thức hoá học giữ nguyên từng ký tự.
   **Mọi `dangerouslySetInnerHTML` PHẢI gọi hàm này** — có phép kiểm canh.
2. **`public/_headers`** — năm header bảo mật phủ `/*`, trong đó CSP là hàng rào
   thứ hai nếu bộ lọc thủng. `script-src 'self'` chặt được vì gói Vite dựng ra
   chỉ có `<script src="/assets/…">`. Xem mục "Ba cái bẫy của `_headers`" bên dưới.
3. **`firestore.rules`** — nay nằm trong git, và ĐÃ triển khai ngày 10/09/2026
   (luật cũ là `match /{document=**} { allow read, write: if true; }`, mở toang).
   Chặn nội dung có mã ngay từ lúc GHI. Luật nhắm các trường THẬT của Firestore:
   `q`, `e`, `o[]`, `st[].s`, `ansText` — **không phải** `content`/`explanation`/
   `options`; bản đầu nhắm sai tên nên cho qua mọi tải trọng.
4. **Kiểm `e.origin`** ở mọi handler `postMessage` — trò chơi chạy trong iframe
   và nói chuyện với web qua đó.
5. **Trò chơi cũng phải sạch.** `giai-cuu-phong-thi-nghiem.html` từng nối thẳng
   `q.e` vào `innerHTML`. Nay dựng bằng nút DOM. Bốn game còn lại dùng
   `textContent`. Đợt rà soát đầu chỉ quét `src/` nên bỏ sót cả `public/games/` —
   lần sau quét cả hai.

### Ba cái bẫy của `_headers`, đã trả giá bằng production

Cả ba đều lên tới người dùng thật ngày 10/09/2026, và **không cái nào bị `npm run
build` hay `npm run lint` bắt** — vì chúng không phải lỗi mã.

1. **`X-Frame-Options: DENY` giết chính app.** `DENY` cấm MỌI trang nhúng, kể cả
   trang này nhúng chính nó. Mà app có hai khung cùng nguồn: bài giảng
   (`SlidesSection.tsx`) và trò chơi (`GameHubSection.tsx`). Phải là `SAMEORIGIN`
   + `frame-ancestors 'self'`. `frame-src 'self'` KHÔNG cứu được — nó nói trang
   CHA được nhúng ai, còn hai thứ kia nói trang CON cho ai nhúng mình.
2. **`script-src 'self'` giết sáu trang tĩnh.** Trang bài giảng và năm trò chơi
   trong `public/` dựng HOÀN TOÀN bằng script nội tuyến (11 đoạn, không tệp `.js`
   ngoài nào). Cách chữa là băm sha256 lúc dựng — `scripts/bam-csp.mts`, chạy tự
   động trong `npm run build`. **ĐỪNG thêm `'unsafe-inline'`**: nó bật lại cả
   thuộc tính `on…=`, tức đúng `<img src=x onerror=…>` mà CSP sinh ra để chặn.
   Hash phải băm bản đã chuẩn hoá CRLF→LF, vì bộ phân tích HTML làm vậy trước.
3. **Vite KHÔNG đọc `_headers`** — đó là tính năng của Netlify. Nên mọi lượt
   "đã thử CSP ở máy dev" đều không thật: `X-Frame-Options` chỉ tồn tại ở dạng
   header, và `frame-ancestors` bị bỏ qua khi đặt trong thẻ `<meta>`. Muốn thử
   thật thì phải phục vụ `dist/` bằng một máy chủ có áp `_headers`, hoặc deploy
   bản nháp. Đây là lý do gốc khiến hai cái bẫy trên lọt.

**Lỗ hổng mật khẩu chữ thường: ĐÃ VÁ ngày 10/09/2026.** Chuyển sang Firebase
Auth, và xoá cột `password` khỏi cả 17 tài liệu `users` còn mang nó. Mật khẩu
nay đã băm và không bao giờ về tới trình duyệt. Bốn phép kiểm trong
`kiem-tra:an-ninh` canh cho nó không quay lại, mạnh nhất là phép kiểm "kiểu
`User` không có trường `password`" — hàng rào đó do trình biên dịch giữ.

**Lỗ hổng CÒN LẠI, và vì sao:** mọi collection vẫn phải cho ghi. Có `request.auth`
rồi nhưng `firestore.rules` **chưa siết theo vai** — đó là **đợt 2**, cố ý tách ra
để đợt 1 hỏng thì chỉ hỏng đường đăng nhập, thấy ngay.

Đợt 2 làm được rồi nhờ hai thứ đã dựng sẵn: id tài liệu `users` **bằng** `uid` nên
luật đọc được `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role`;
và `progress`/`chats` trỏ tới người dùng bằng `userEmail` nên luật dùng thẳng
`request.auth.token.email` được.

Khoá web của Firebase trong `firebaseCongKhai.ts` **không phải bí mật** (nó vốn
nằm trong gói JS ai bấm F12 cũng đọc được); an toàn dựa vào Firestore Rules. Khoá
Gemini thì CÓ là bí mật vì nó tính tiền — `kiem-tra:an-ninh` canh không cho khoá
nào lọt vào `src/`.

## KHÔNG biến app thành PWA / service worker
- Dự án này KHÔNG phải PWA và phải giữ nguyên như vậy. ĐỪNG thêm `vite-plugin-pwa`, `workbox`, `manifest.webmanifest`, hay bất kỳ đoạn `navigator.serviceWorker.register(...)` nào.
- Lý do: service worker cache lại trang cũ → học viên sửa code, build lại, deploy mà trình duyệt vẫn hiện bản cũ, tưởng "sửa không ăn". Người mới rất dễ nản vì lỗi khó hiểu này.
- Nếu user yêu cầu "làm web cài được như app / hoạt động offline / thêm PWA": giải thích ngắn gọn rủi ro cache gây rối cho người mới, hỏi lại có chắc không rồi mới làm — đừng tự động thêm.
- (Firebase SDK có dùng service worker nội bộ cho auth — đó là chuyện khác, không phải PWA, không cần đụng tới.)

## Thế giới thị giác — nhãn cảnh báo hoá chất

Giao diện đi theo hệ **nhãn cảnh báo GHS** trên lọ hoá chất phòng thí nghiệm, chốt
ngày 09/09/2026. Hợp đồng hướng đầy đủ nằm ở `.impeccable/surfaces/app.md`, sự thật
sản phẩm ở `PRODUCT.md`. Bốn điều rút gọn, đủ để không đi lệch:

1. **Ba mực in.** Mực đen là mặc định cho MỌI chữ và dấu đánh mục. **Đỏ tín hiệu chỉ
   dành cho hành động chính, lỗi thật, và trạng thái đang chọn** — dùng thêm chỗ nữa
   là màu mất nghĩa. Vàng cảnh báo cho trạng thái đang dở (đồng hồ đếm ngược, mẹo cần
   nhớ). Lục phòng thí nghiệm là vai phụ cho trạng thái an toàn / đúng.
2. **Dựng bằng nét kẻ, không bằng bóng đổ.** Góc vuông, viền mực. Không bo góc lớn,
   không bóng đổ mềm, không chuyển sắc, không viền trái dày một màu.
3. **Chữ hiển thị dùng Archivo** (grotesque công nghiệp, gốc từ chữ biển báo); Inter ở
   lại làm chữ thân bài. Nhãn và mã viết hoa; số dùng dạng bảng (`tabular-nums`).
4. **Máy chiếu là cảnh dùng thật.** Ngôn ngữ nhãn thắng vì nó đọc được từ cuối lớp —
   đừng đánh đổi độ tương phản hay cỡ chữ để lấy vẻ thanh nhã.

Muốn đổi hướng thì đổi hợp đồng trước, đừng sửa lẻ từng màn.

## Bảng màu & chế độ sáng / tối

Toàn bộ màu của giao diện nằm trong `src/index.css` dưới dạng biến CSS, khai hai
lần: `:root` (nền sáng) và `:root[data-theme="dark"]` (nền tối). Trong `.tsx`
KHÔNG viết mã màu cứng nữa, luôn dùng `var(--ten-bien)`.

Công tắc: `src/core/hooks/useCheDoMau.ts`, nút bấm ở `DashboardHeader`
(`id="header-theme-btn"`), lựa chọn nhớ trong localStorage `h11_che_do_mau`.
Mặc định SÁNG, kể cả khi máy đang để nền tối.

**Mỗi biến có MỘT vai, không dùng lẫn.** Đây là chỗ dễ sai nhất:

| Vai | Tên biến | Vì sao không dùng lẫn được |
|---|---|---|
| Nền trang, nền thẻ | `--nen-*` | Sáng → tối khi đổi chế độ |
| Chữ trên nền trang | `--chu-*` | Tối → sáng khi đổi chế độ (ngược lại) |
| Chữ trên nền MÀU (nút đỏ tín hiệu, thanh menu mực) | `--chu-nguoc` | Luôn trắng ở CẢ hai chế độ |
| Màu nhấn làm CHỮ | `--tin-hieu`, `--luc-tham`, `--xanh`, ... | Nền tối phải SÁNG lên mới đọc được |
| Màu nhấn làm NỀN nút | `--tin-hieu-nen`, `--luc-tham-nen`, `--xanh-nen`, ... | Nền tối phải ĐẬM lại để chữ trắng đọc được |
| Khối mã / công thức | `--nen-ma`, `--chu-ma` | Cố ý giữ nền tối ở cả hai chế độ |
| Mặt nền cố ý TỐI (thanh quản trị, khung công thức) | `--nen-dam`, `--vien-dam`, `--chu-tren-nen-dam` | Giữ nguyên ở cả hai chế độ |
| Nền nút đã bị vô hiệu hoá | `--nen-tat` | Không phải màu chữ |

**Tên biến phải nói VAI, không nói sắc — nếu vai đó là một luật.** Ngày 09/09/2026
`--cam*` đổi thành `--tin-hieu*` và `--teal*` thành `--luc-tham*` (259 chỗ). Không phải
dọn dẹp cho đẹp: chính cái tên "cam" đã mở đường cho lỗ hổng lớn nhất của đợt thiết kế
lại. "Cam" nghe như màu thương hiệu nên nó bị rải ra 95 chỗ làm dấu trang trí; đến khi
giá trị đổi thành đỏ tín hiệu thì cả trang đỏ rực và màu đỏ mất sạch nghĩa. Tên mới
mang luôn cái luật — **`--tin-hieu` chỉ dùng cho hành động chính, lỗi thật, và trạng
thái đang chọn** — nên người viết mã lần sau không cần đọc tới đây mới biết.

`--luc-tham` thì ngược lại: nó không phải một vai, chỉ là một sắc nhấn, nên đặt tên
theo đúng sắc như `--xanh` / `--tim` / `--vang`.

Trò chơi trong `public/games/` có bảng màu RIÊNG và **cố ý không đổi**: `--cam` ở đó là
cam thật. Tên đó không nói dối.

Hai dòng cuối là bài học phải trả giá: ban đầu chỉ có một biến `--xanh` gánh cả
vai chữ lẫn vai nền. Làm sáng nó lên cho vai chữ thì thanh menu thành xanh nhạt
mang chữ trắng, tương phản tụt còn 2,7 — nhìn là biết sai nhưng build vẫn xanh.

**Luật quan trọng nhất, và đã bị vi phạm bốn lần:** hễ có biến `--X-nen` thì `--X` CHỈ dành cho vai chữ. Ở chế độ tối `--X` được làm sáng lên cho dễ đọc trên nền đậm, nên đem nó làm nền nút mang chữ trắng là trắng-trên-sáng. `npm run kiem-tra:mau` nay có luật tự bảo trì canh đúng điều đó.

Lần lọt thứ tư (09/09/2026) đáng nhớ vì nó cho thấy một phép kiểm ĐÚNG vẫn có thể mù:
regex cũ đòi `var(--x)` đứng NGAY sau `backgroundColor:`, nên mọi chỗ viết dạng ba ngôi
(`active ? 'var(--luc-tham)' : …`) đều lọt — mà đó lại đúng là lối viết cho trạng thái đang
chọn, tức đúng chỗ nút mang chữ trắng. Sáu chỗ lọt: hai nút chọn vai và nút Đăng nhập ở
màn đăng nhập, hai ảnh đại diện "đang chọn", cột biểu đồ điểm, bong bóng chat. Nay cả
ba phép kiểm đọc hết GIÁ TRỊ của thuộc tính (tới dấu phẩy) và soi thêm `linkColor`,
`accentColor`, `statusColor`.

**Và một bài học về chính bộ kiểm tra:** phép kiểm "không lấy biến CHỮ làm màu nền" đã báo ĐẠT suốt nhiều tuần mà chưa hề soi dòng nào — regex dùng nhóm không-bắt `(?:...)` nên biến nằm ở `m[1]`, mà mã lại đọc `m[2]`, luôn `undefined`. Vì thế lỗi "nền thanh quản trị dùng `--chu-dam`" lọt tới tận tay người dùng. Một phép kiểm luôn xanh mà chưa bao giờ bắt được gì thì đáng ngờ hơn là đáng mừng: thỉnh thoảng phải cố tình làm hỏng một chỗ để xem nó có kêu không.

Chạy `npm run kiem-tra:mau` sau khi đụng vào màu. Bộ này bắt: biến khai thiếu ở
một chế độ, gõ nhầm tên biến, dùng lẫn vai nền/chữ, mã màu cứng còn sót, và **tương
phản dưới 4,5** — đo thật 70 cặp chữ/nền ở mỗi chế độ màu. Chỗ nào đã xem tay và xác
nhận đúng thì ghi `// mau-ok` ở CUỐI dòng đó.

Hai điều về phép đo tương phản, thêm ngày 08/09/2026:

- Trước đó ngưỡng 4,5 chỉ được *nói* chứ không ai đo. Đo tay ra 14 cặp không đạt, tệ
  nhất là `--luc` làm màu chữ chỉ được 2,32 mà đang dùng ở 11 chỗ. Đã làm đậm 12 biến
  cho đạt chuẩn rồi mới viết phép đo.
- Phép đo chỉ soi **biến CSS**. Màu viết cứng trong `.tsx` chỉ bị ĐẾM chứ không bị đo,
  nên vẫn lọt lỗi: trang 404 từng có tương phản 1,03 vì viết cứng nền tối. Và cẩn thận
  chỗ màu chữ đến từ bảng màu MUI còn màu nền đến từ biến CSS — hai hệ khác nhau, chỉ
  cần một bên đổi trước là chữ biến mất. Gặp trường hợp đó thì đặt màu chữ tường minh
  bằng `color: 'var(--...)'`.

**Ngưỡng mã màu cứng nay là 0.** Từ 09/09/2026 trong `src/*.tsx` không còn mã màu
viết cứng nào ngoài khối `palette` của MUI và bốn tệp tranh vẽ. Trước đó ngưỡng là 70
và con số đứng ở 66 rất lâu — đủ chỗ cho chữ `#f5a623` ở khu trò chơi sống sót với
tương phản 2,0 trên nền trắng, vì phép kiểm chỉ ĐẾM chứ không ĐO. Cần một mã màu thật
thì ghi `// mau-ok` ở cuối dòng.

Chú ý khi viết chú thích: cả bộ đếm "mã màu cứng" lẫn phép kiểm tên biến đều quét chú
thích. Đừng viết lại mã màu dạng `#rrggbb` trong đó, và đừng viết `var(--x)` làm ví dụ
— tên biến giả sẽ bị báo là gõ nhầm.

Cố ý KHÔNG đụng tới `GameArt.tsx`, `doodles.tsx`, `ChemDoodles.tsx`,
`Mascot.tsx` (tranh vẽ — đảo màu theo nền là hỏng hình) và khối `palette` trong
`App.tsx` (MUI cần màu thật để tự tính sắc độ đậm/nhạt, đưa biến CSS vào là
hỏng cả bảng màu).

## Rút kinh nghiệm — những lỗi đã lặp lại

Ghi lại để lần sau không vấp nữa. Tất cả đều là lỗi KHÔNG làm hỏng build.

1. **Đừng tin dòng chữ "xong" của script tự viết.** Đã có lần script sửa nhiều
   chỗ bị assert giữa chừng, thoát trước khi ghi file, nhưng vẫn in ra thông
   báo thành công. Sau MỌI lần chạy script sửa file: `grep` lại đúng chuỗi vừa
   đặt vào để xác nhận, đừng đọc thông báo rồi đi tiếp.

2. **Regex thay thế hàng loạt phải chặn ở đầu chuỗi.** `color: 'var(--x)'` khớp
   luôn phần đuôi của `bgcolor: 'var(--x)'`, thế là biến nền thẻ thành màu chữ.
   Luôn neo đầu chuỗi bằng ranh giới từ hoặc lớp ký tự `[^a-zA-Z-]`, và ĐẾM
   số chỗ đổi trước/sau để biết có khớp thừa không.

3. **Ô xem trước của trình duyệt báo số sai khi cửa sổ đang ẩn.** Lúc đó
   `innerWidth` = 0, toạ độ phần tử ra số âm, `requestAnimationFrame` không
   chạy, và `getComputedStyle` trả giá trị cũ chưa vẽ lại. Đã hai lần suýt báo
   "lỗi bố cục" trong khi không có lỗi nào. Kiểm `document.hidden` trước khi
   tin số đo; ảnh chụp màn hình thì vẫn đúng kể cả khi ẩn.

4. **Bài kiểm tra sai thì sửa bài kiểm tra, đừng sửa code.** Đã nhiều lần định
   "sửa" phần mềm cho khớp một phép thử viết sai (bắt AI đọc ra 24,79 trong khi
   nó hỏi ngược lại học sinh là đúng; báo trùng đề trong khi mức đó chỉ còn
   từng ấy câu). Xác định BÊN NÀO sai trước khi gõ dòng nào.

5. **Đóng tab trò chơi sau khi thử.** Trò chơi có nhạc nền; để tab mở là máy
   người dùng cứ phát nhạc. (Đã sửa để nhạc tự tắt khi tab bị ẩn, nhưng vẫn
   phải dọn.)

6. **Đo trước khi sửa.** Chiều cao nhảy, chiều rộng khe, thời điểm boss đổi
   pha — số đo cụ thể ghi thẳng vào chú thích trong mã, đừng ước lượng.
