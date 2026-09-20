# CLAUDE.md — Gia sư Hóa 11

Nền tảng tự học Hoá học 11 theo chương trình Kết nối tri thức 2018: 25 bài giảng,
gia sư AI (Gemini), ngân hàng câu hỏi, đề kiểm tra và hai trò chơi ôn tập. Người dùng
là học sinh lớp 11 và giáo viên phổ thông. Dùng cho một đề tài nghiên cứu khoa học,
nên tính đúng đắn của nội dung hoá học quan trọng hơn mọi thứ khác.

Nguyên tắc dài hạn của dự án nằm ở `.specify/memory/constitution.md`; tệp này là
hướng dẫn vận hành hằng ngày và không được mâu thuẫn với tệp đó.

> File này mô tả dự án ĐANG như thế nào, để bạn (AI) khỏi phải dò lại toàn bộ code mỗi phiên.
> Đây là mặc định, KHÔNG phải xiềng: nếu user muốn đổi UI/Auth/nhà cung cấp AI/cấu trúc, cứ làm theo user — chỉ cần báo trước là sẽ lệch khỏi mô tả dưới đây.

**Sắp sửa vùng nào thì đọc mục đó TRƯỚC, đừng làm theo trí nhớ.** Tệp dài
~11.600 từ; cái hại của nó không phải tốn chỗ mà là bị đọc lướt. Bảng này để
nhảy thẳng:

| Sắp đụng vào | Đọc mục |
|---|---|
| Đăng nhập, vai trò, vào lớp, đăng ký | Vài điểm dễ vấp |
| `firestore.rules` | An ninh dự án → "Bảy điều về luật hiện hành" |
| `index.css`, màu, chế độ tối | Bảng màu & chế độ sáng / tối |
| `public/_headers`, CSP, deploy | An ninh dự án → "Ba cái bẫy của `_headers`" |
| Giao diện, bố cục, kiểu dáng | Thế giới thị giác |
| Ngân hàng câu hỏi, bài đã nộp, đồng bộ | **Kiến trúc dự án** |
| Đọc ngân hàng ở màn học sinh, hạn mức Firestore | Kiến trúc dự án → "Hạn mức đọc" |
| Gia sư AI, hạn mức, khoá Gemini | An ninh dự án + Nhờ Gemini soi nội dung |
| Viết/sửa phép kiểm | Lệnh + Rút kinh nghiệm |

**Chín bài học ở mục "Rút kinh nghiệm" là phần đắt nhất của tệp này** — mỗi cái
đổi bằng một lần hỏng đã tới tay người dùng. Đọc trước khi tin trí nhớ.

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

  **Việc chạm từ 3 TỆP trở lên: NÓI RA một dòng TRƯỚC KHI gõ dòng mã đầu tiên**
  — *"việc này ~N tệp, tôi gọi `writing-plans`"*, hoặc *"~N tệp, tôi không gọi
  kỹ năng nào, vì …"*. Nói ra là đủ; không cần dài.

  Vì sao siết thành "nói ra" (20/09/2026): bảng trên vốn chỉ là lời nhắc thụ
  động, và nó **thất bại có bằng chứng**. Hôm đó hook nhắc đúng bảng này **25
  lượt liên tiếp**, mà cả hai việc lớn trong ngày đều bỏ qua nó — dựng Playwright
  (9 tệp) và làm `soat:hoa-hoc` + `kiem-tra:gemini` (5 tệp) đều chạy tuỳ cơ ứng
  biến, không gọi `writing-plans` lần nào. Kết quả vẫn dùng được, nên **không ai
  phát hiện ra là quy tắc đang bị bỏ** cho tới lúc ngồi rà lại cuối ngày.

  Đó là bài học chung, không riêng chỗ này: **một quy tắc không ai NHÌN THẤY
  được thì không ai kiểm được.** Bắt nói ra biến nó thành thứ chủ dự án bắt lỗi
  được ngay trong lượt đó. Giống hệt lý do mọi luật khác của dự án đều có một
  phép kiểm đi kèm — khác mỗi chỗ luật này chỉ người kiểm được, không có script
  nào kiểm hộ.

  Hai lần khác đã trả giá, giữ lại để nhớ: một lần định đọc ~18.000 dòng mã trò
  chơi để "chuyển chúng sang thế giới mới", trong khi `brainstorming` hỏi đúng
  một câu ("trò chơi có cần thế giới của app không?") là việc co lại còn sửa một
  chỗ nối; một lần đoán nguyên nhân lỗi CSP thay vì chạy `systematic-debugging`
  ngay từ đầu.

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

  **Ba lối vào, ba hành vi khác nhau** (20/09/2026). Đừng gộp chúng lại:

  - **Gõ mật khẩu xong → VÀO THẲNG.** Không hỏi thêm câu nào.
  - **Mở lại tab mà chưa đăng xuất → hỏi "Tiếp tục với ..."** Đây là màn "Chào
    mừng trở lại" trong `LoginPage`, và nó CÓ LÝ DO: phiên còn sống thì không
    bắt gõ lại mật khẩu, nhưng cũng không tự nhảy vào — máy chung ở trường có
    thể đang là tài khoản bạn khác.
  - **Đăng ký xong → đẩy ra MÀN ĐĂNG NHẬP**, không vào thẳng trang học.
    `registerStudent` tạo tài khoản trên app CHÍNH nên Firebase đăng nhập luôn;
    vì thế `StudentRegisterForm` phải `logout()` trước khi chuyển màn, nếu
    không em sẽ gặp "Tiếp tục với ..." trong khi chưa gõ mật khẩu lần nào —
    tức chưa hề xác nhận mình nhớ mật khẩu gì.

  **`login()` trả về VAI, không trả về hồ sơ.** Bản cũ trả
  `users.find(u => u.id === uid)`, mà mảng `users` chỉ có dữ liệu khi tài khoản
  được quyền `list` trên `users` — tức **từ giáo viên trở lên**. Với học sinh nó
  luôn rỗng, nên `LoginForm` rơi vào nhánh thất bại và đem chính câu "Đăng nhập
  thành công!" đi `setError`: **mọi em đăng nhập đúng đều thấy một khung ĐỎ báo
  lỗi**, rồi phải bấm thêm một nút nữa mới vào được. Lỗi này sống nhiều ngày mà
  `tsc` và 13 bộ kiểm đều xanh, vì không bộ nào mở nổi trình duyệt; `kiem-tra:e2e`
  bắt được ngay lượt chạy đầu tiên của nó. Hai phép canh trong
  `tests/dangnhap.setup.ts` giữ cho nó không quay lại.

  **"Vào lớp bằng mã mời" nay là ĐƠN CHỜ DUYỆT** (12/09/2026). Học sinh nhập mã
  → mã cất vào `users.pendingClassCode` của chính em, **em chưa vào lớp**. Giáo
  viên mở màn quản lý lớp, thấy cột "Đơn chờ", bấm Duyệt → **chính giáo viên**
  ghi `classId` và `classes.studentIdentifiers`. Lý do: chủ dự án chốt học sinh
  không sửa gì về lớp, kể cả thêm email của chính mình. Ba điều dễ vấp ở vùng này:

  - **Lối vào nằm ở `StudentArea`**, trong khối "Chưa tham gia lớp học nào" của
    tab Học sinh — KHÔNG phải ở `DashboardPage`. `JoinClassForm` trong
    `DashboardPage` chỉ dựng khi `activeTab === 'hocmai'`, mà nút duy nhất đặt
    tab đó là mục "Các khóa học" đã bị ẩn khỏi menu (`HIEN_MUC_KHOA_HOC = false`).
    Tức lối vào cũ **không ai tới được** — cả tính năng nằm chết sau một tab ẩn.
  - **Màn đăng ký cố ý KHÔNG tra mã.** Nó chạy khi chưa đăng nhập, mà `classes`
    chỉ đọc được sau khi đăng nhập — tra là luôn ra "mã không tồn tại". Mã cất
    nguyên văn; mã sai không trùng lớp nào.
  - **Mã sai phải coi như chưa gửi.** `JoinClassForm` chỉ coi là "đang chờ duyệt"
    khi `pendingClassCode` **trùng một lớp thật**. Bỏ phép đối chiếu đó thì em gõ
    sai 6 ký tự sẽ bị khoá khỏi mọi lớp: không giáo viên nào thấy đơn để từ chối,
    ô nhập thì bị ẩn, và chỉ Firebase Console cứu được.

  Mã mời phải **4-6 ký tự, chỉ A-Z0-9** (hai ô nhập đều
  `.replace(/[^A-Z0-9]/g,'').slice(0,6)`, nút gửi `disabled` khi `< 4`). Vì thế
  lớp tên "11H" không dùng "11H" làm mã được — đang dùng `11H01`.

  Hai điều đợt chuyển KHÔNG làm được, ghi để khỏi tìm lại:
  - **"Đặt lại mật khẩu cả lớp"** trong `ClassManagement` đã bỏ. Trình duyệt không đặt
    được mật khẩu cho người khác; muốn có lại thì cần Cloud Function + Admin SDK, tức
    gói Blaze trả tiền. Nút đó nay chỉ xuất CSV danh sách lớp kèm tên đăng nhập.
  - **Học sinh không có email thật** dùng địa chỉ `<username>@internal.local`. Đăng
    nhập bình thường, nhưng không nhận được thư đặt lại — quên mật khẩu thì giáo viên
    phải tạo lại tài khoản.

  **Giáo viên TỰ ĐĂNG KÝ, chờ duyệt** (13/09/2026). Màn đăng ký có thẻ thứ ba
  "Giáo viên đăng ký". Người nộp được tạo với `role: student` + `pendingRole:
  'teacher'` trong MỘT lượt ghi — tách làm hai lượt thì lượt sau chạy đua với
  `onAuthStateChanged` và thua, mất dấu đơn. Trong lúc chờ họ dùng web như học
  sinh. Khung duyệt ở "Quản lý Tài khoản" CHỈ hiện khi có đơn, và chỉ chủ dự án
  với đồng quản trị thấy.

  **Đồng quản trị** = danh sách email ở `quan_tri/dong_quan_tri`, chỉ chủ dự án
  sửa được. Họ duyệt đơn và đặt được vai `teacher`/`school_admin`, nhưng KHÔNG
  phong được `admin`, KHÔNG xoá hồ sơ, KHÔNG thêm đồng quản trị khác. Bản sao
  để VẼ giao diện nằm ở `src/core/services/quanTri.ts`; hàng rào thật là luật.

  Hai dấu đơn (`pendingClassCode`, `pendingRole`) phải có mặt ở MỌI chỗ đọc hồ
  sơ từ Firestore — xem bài học số 7 ở mục "Rút kinh nghiệm".
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
| `npm run kiem-tra` | Chạy cả 13 bộ kiểm, 361 mục trên máy thiếu Java (thêm 26 mục nữa trên CI, khi `kiem-tra:luat` chạy thật). Chạy trước khi commit |
| `npm run build` | **Chỉ khi user yêu cầu** |

Bộ kiểm chạy riêng khi cần: `kiem-tra:su-pham` (máy trạng thái sư phạm, chuẩn
hoá + dựng công thức KaTeX, telemetry), `kiem-tra:chuong-trinh` (dữ liệu 25 bài),
`kiem-tra:ngan-hang`, `kiem-tra:de-chuong`, `kiem-tra:het-luot`, `kiem-tra:mau`
(biến màu + tương phản), `kiem-tra:thuc-nghiem`, `kiem-tra:ran-thang`,
`kiem-tra:dong-bo` (cần mạng, mất mạng thì tự bỏ qua), `kiem-tra:luyen-tap`,
`kiem-tra:tai-lieu`
(mọi đường dẫn và lệnh npm mà CLAUDE.md / hiến chương nhắc tới đều phải có thật),
`kiem-tra:an-ninh` (những hàng rào an ninh không được phép biến mất — xem mục
"An ninh dự án" bên dưới),
`kiem-tra:luat` (19 phép thử luật Firestore trên emulator; cần Java 11+ nên
máy nào thiếu thì tự bỏ qua — phép này chạy thật trên GitHub Actions, xem
`.github/workflows/kiem-luat.yml`).

## Kiểm thử đầu-cuối bằng trình duyệt (`npm run kiem-tra:e2e`)

Thêm 20/09/2026. Playwright mở trình duyệt thật, bấm nút thật. Sinh ra vì một
lỗ hổng cụ thể: mười ba bộ kiểm trên **không mở nổi trình duyệt**, nên mọi thứ
chỉ hiện ra SAU KHI đăng nhập đều không ai canh. Hai thứ thêm hôm 20/09 (nút
"Chơi để ôn", hộp thoại khoá riêng) đã phải nhờ chủ dự án xem hộ, vì AI không
được phép gõ mật khẩu.

| Lệnh | Làm gì |
|---|---|
| `npm run kiem-tra:e2e` | Cả bộ. Cần tài khoản thử, xem bên dưới |
| `npm run kiem-tra:e2e:khach` | Chỉ phần khách vãng lai — không cần tài khoản nào |

Đích mặc định là máy dev (`npm run dev` tự bật). Soi bản đã deploy thì đặt
`E2E_URL=https://giasuhoa11.pages.dev` trước lệnh.

**CỐ Ý KHÔNG nằm trong `npm run kiem-tra`.** Bộ kia phải nhanh và chạy được ở
mọi máy để còn gọi trước mỗi commit; bộ này cần mạng, cần trình duyệt, cần tài
khoản thật, mỗi lượt vài chục giây. Trộn vào là hàng rào chính bị bỏ qua vì
chậm. Đây là hai việc khác nhau, giữ riêng.

**Sáu điều đã trả giá để biết:**

1. **`storageState` phải có `indexedDB: true`.** Firebase Auth giữ phiên trong
   IndexedDB, không phải cookie hay localStorage. Thiếu cờ đó thì tệp phiên
   vẫn ghi ra "thành công" nhưng rỗng, và mọi phép sau mở ra là màn đăng nhập
   — hỏng mà thông báo lỗi không hề nhắc tới đăng nhập.
2. **Dùng Chrome ĐÃ CÀI trên máy (`channel: 'chrome'`), không dùng bản
   Chromium đi kèm.** Đo 20/09/2026: `npx playwright install chromium` gãy hai
   lần, đứt giữa chừng lúc tải (host vẫn trả lời, chỉ tệp lớn là gãy). Máy nào
   tải được thì bỏ dòng `channel` đi cũng không sao.
3. **KHÔNG quay video.** Video cần tệp ffmpeg tải riêng, mà đường tải đó cũng
   bị chặn. Bật lên thì MỌI phép thử trượt ngay từ lúc mở trang với thông báo
   nói về ffmpeg chứ không nói về web. Ảnh chụp và trace không cần tệp ngoài.
4. **`workers: 1`.** Các phép dùng chung một tài khoản học sinh thật; chạy
   song song là hai phép cùng ghi tiến độ của một người rồi đá nhau.
5. **Phép thử GHI DỮ LIỆU THẬT.** Web luôn nối Firestore thật, kể cả ở máy dev
   (phần web không có emulator). Dùng một tài khoản học sinh RIÊNG để thử,
   đừng dùng tài khoản của một em đang học.
6. **Mật khẩu ở `.env.local`, không ở đâu khác.** Hai biến `E2E_EMAIL` và
   `E2E_MATKHAU` (xem `.env.example`); `.gitignore` chặn bằng `.env*`. Kịch
   bản gõ mật khẩu vào ô — không ai phải đọc nó, và AI thì không được đọc.
   Tệp phiên `tests/.auth/` mang token thật nên cũng bị chặn. Thiếu tài khoản
   thì phần cần đăng nhập tự BỎ QUA chứ không báo trượt: để nó đỏ sẵn thì
   người ta quen mắt với màu đỏ, rồi hôm trượt thật cũng không ai nhìn.

Sinh lại dữ liệu — đọc `scripts/README.md` trước khi dùng:
`soan` (từ tệp .docx sang `constants.ts`), `xuat:ngan-hang` (Firestore sang repo),
`gan:cau-hoi`, `sinh:ran-thang`, `nhung:ran-thang`, `word`, `phan-tich`, `do-chi-phi`,
`thu:ai`.

## Nhờ Gemini soi nội dung hoá học (`npm run soat:hoa-hoc`)

Thêm 20/09/2026. Đưa câu hỏi cho Gemini đọc và nêu chỗ nghi sai. Sinh ra vì
tính đúng đắn hoá học là thứ quan trọng nhất của đề tài, mà 1554 câu thì không
ai đọc tay hết. Lượt chạy đầu tiên đã tìm ra ba câu mà đề ghi `H₂O (l)` nhưng
lời giải vẫn đưa [H₂O] vào biểu thức Kc.

```bash
npm run soat:hoa-hoc -- --bai bai-1              # một bài, vừa hạn mức ngày
npm run soat:hoa-hoc -- --chuong 1 --xem         # chỉ xem kế hoạch, không gọi
npm run soat:hoa-hoc -- --bai bai-1 --ra bao-cao.md
```

**Bốn điều cố ý, đừng sửa thành khác:**

1. **Script KHÔNG sửa gì.** Chỉ in danh sách câu đáng xem lại. Một mô hình nói
   "câu này sai" KHÔNG phải bằng chứng câu đó sai — phải tự kiểm rồi mới sửa,
   và sửa trên Firestore chứ không sửa bản chụp trong repo.
2. **Chỉ gửi đi NỘI DUNG CÂU HỎI.** Không email, không tên học sinh, không tiến
   độ, không gì từ `users`. Đây là luật chung cho mọi lần nhờ mô hình ngoài đọc
   dữ liệu dự án: cái gì gửi đi là rời khỏi máy vĩnh viễn.
3. **Đọc bản chụp `public/bank/ngan-hang.json`**, không đọc Firestore — giống
   mọi thứ chạy ngoài trình duyệt. Muốn soát bản mới nhất thì `xuat:ngan-hang`
   trước.
4. **Tự dừng khi vượt 20 lượt/ngày.** Bậc miễn phí cho 5 lượt/phút và 20
   lượt/NGÀY cho từng model; soát cả kho tốn 63 lượt. Script tính trước rồi
   dừng kèm cách chia nhỏ, thay vì chạy một phần ba rồi chết.

Có hai cờ `--qua`: `cli` (mặc định, qua `gemini` CLI) và `key` (qua
`@google/genai`). **Cả hai nay đều đi bằng khoá API.**

**Gói Gemini Pro/Ultra KHÔNG dùng cho CLI được nữa.** Google chấm dứt đăng nhập
bằng tài khoản cá nhân cho Gemini CLI và Code Assist từ **18/06/2026**, áp dụng
cho cả bậc miễn phí lẫn Google AI Pro và Ultra. Chuỗi `LOGIN_WITH_GOOGLE` vẫn
còn trong gói cài nên nhìn tưởng dùng được — nhưng máy chủ từ chối. Gói trả phí
của cá nhân nay chỉ còn dùng được ở gemini.google.com và ở Antigravity.

Nên CLI chỉ còn **hai** đường: khoá API (bậc miễn phí 20 lượt/ngày, hoặc trả
tiền theo token nếu bật thanh toán), và giấy phép doanh nghiệp. Kiểm bằng
`security.auth.selectedType` trong `~/.gemini/settings.json`.

**Muốn soát cả kho trong một lượt thì phải bật thanh toán** cho dự án Google
Cloud đang giữ API key. Đo 20/09/2026: cả 1554 câu là **369.813 token vào**
(853.563 ký tự, 2,31 ký tự/token). Đơn giá KHÔNG ghi ở đây — giá đổi theo thời
gian, tra bảng giá hiện hành rồi nhân với con số trên. Cùng lý do mà
`do-chi-phi.mts` cũng không ghi cứng đơn giá.

Ba chi tiết kỹ thuật của đường `cli` (`-p` nối vào stdin, `--approval-mode
plan` = chỉ đọc, và `shell: true` trên Windows không tự bọc nháy) nằm trong
chú thích của chính hàm `goiQuaCli` — đọc ở đó, đúng lúc cần sửa.

**Báo cáo luôn ghi ra `docs/soat-hoa-hoc/<ngày>-<phạm vi>.md`** và theo git.
Đó là vết của quy trình kiểm định nội dung — thứ hội đồng NCKH hỏi tới, và là
cách đối chiếu lần soát sau với lần trước.

### Hai đường soát, dùng xen kẽ

| | Tốn gì | Ai bấm |
|---|---|---|
| **A. Gọi thẳng** `--bai bai-1` | hạn mức miễn phí, 20 lượt/ngày | AI tự chạy |
| **B. Dẫn tay qua Antigravity** `--xuat-de-dan` → `--nap` | KHÔNG tốn lượt nào | chủ dự án mở Antigravity |

Đường B có vì gói Gemini trả phí của cá nhân **vẫn dùng được trong
Antigravity**, chỉ không dùng được qua CLI hay API key. Script ghi một tệp đề
dẫn vào `docs/soat-hoa-hoc/de-dan-*.md`; repo nằm sẵn trong workspace của
Antigravity nên không phải dán gì — chỉ cần bảo nó đọc tệp đó rồi ghi kết quả
ra JSON. `--nap` chịu được tệp có rào ```json và có lời dẫn thừa.

Đường B cũng phải theo luật "một lượt là không đủ": bảo Antigravity soát
HAI lần ra hai tệp, rồi `--nap a.json,b.json` (ngăn bằng dấu phẩy, không có
dấu cách). Báo cáo ghi `k/2 lượt cùng nêu` y như đường A. Tệp đề dẫn tự sinh
ra sẵn hai tên tệp và cả dòng lệnh nạp.

Ngày làm việc điển hình: hết 20 lượt miễn phí thì chuyển sang đường B, hôm sau
lại có 20 lượt mới.

### MỘT LƯỢT SOÁT LÀ KHÔNG ĐỦ — đo được, không phải phỏng đoán

Cùng 16 câu, cùng `temperature: 0`, chạy ba lượt cho ra **3, 3, rồi 0** câu nghi
ngờ. Ba câu bị bỏ sót ở lượt thứ ba là lỗi THẬT (đề ghi `H₂O (l)` nhưng lời giải
vẫn đưa [H₂O] vào biểu thức Kc — đã kiểm tay). Nên:

- Mặc định `--lan 2`: mỗi lô soát hai lượt, lấy HỢP của hai kết quả.
- Báo cáo ghi **`k/N lượt cùng nêu`** cho từng câu. Con số đó đáng tin hơn cái
  nhãn `tin` do chính mô hình tự chấm.
- **Đừng kết luận "bài này sạch"** sau một lượt. Nhiều nhất chỉ nói được là
  "lượt này không thấy gì".

**Hai lượt chữa được sót NGẪU NHIÊN, KHÔNG chữa được sót HỆ THỐNG** (đo
20/09/2026). Phép đối chứng mù: xuất đề dẫn Bài 1 — 154 câu, trong đó có **ba
câu đã kiểm tay và biết chắc là sai** (ba câu Kc ghi `H₂O (l)` nhưng lời giải
vẫn đưa [H₂O] vào biểu thức). Mô hình không được mách câu nào.

| Lượt | Bắt được |
|---|---|
| API `gemini-3.6-flash`, lượt 1 và 2 (15:27) | `04avv`, `frynt` — **2/3** |
| Antigravity, lượt 1 (23:18) | `04avv`, `frynt` — **2/3** |
| Antigravity, lượt 2 (23:29) | `04avv`, `frynt` — **2/3** |

Bốn lượt, hai đường khác nhau, **cùng sót đúng một câu**: `bq_1789371866328_eg7es`.
Đó là câu đúng/sai mà bốn ý đều đúng sẵn, chỉ phần đề mang kí hiệu trạng thái
sai — tức lỗi kín nhất trong ba câu. Người tìm ra nó là người, không phải máy.

Ba điều rút ra:

1. **Đường dẫn tay qua Antigravity CHẠY THẬT** ở cỡ ~95.000 ký tự / 154 câu. Nó
   không "giả vờ đọc rồi trả mảng rỗng".
2. **Tỉ lệ bắt khoảng 2/3 ngay trên lỗi đã biết chắc.** Con số đó là trần chứ
   không phải sàn — lỗi trong kho còn kín hơn ba câu này.
3. **`0 nghi ngờ` KHÔNG bằng `sạch`.** Nếu cái sót là sót hệ thống thì chạy bao
   nhiêu lượt cũng ra cùng một kết quả, và con số `k/N lượt cùng nêu` không hề
   cảnh báo điều đó. Soát máy là cái lưới thưa, không phải phép nghiệm thu.

### Quy trình soát — năm bước, chủ dự án chốt ở bước 3 và 4

Chốt ngày 20/09/2026. Cố ý KHÔNG tự động hoá trọn gói:

1. **Chủ dự án nêu phạm vi** ("soát chương 2"). Không tự chạy cả kho.
2. **AI chạy** `npm run soat:hoa-hoc -- --chuong 2`, rồi **tự kiểm chứng từng
   chỗ Gemini nêu** bằng cách mở đúng câu đó trong ngân hàng và tính lại. Chỗ
   nào Gemini nói sai thì loại, và **nói rõ là đã loại** — đừng chuyển tiếp
   nguyên si. Lượt chạy đầu tiên đã có ví dụ: Gemini chẩn đúng bệnh nhưng
   đề nghị cách sửa sai.
3. **Chủ dự án quyết** sửa thế nào. Một câu sai thường có hơn một cách chữa,
   và chọn cách nào là việc của người dạy.
4. **Chủ dự án tự sửa trên Firestore**, bằng Console hoặc bằng
   `npm run sua:cau-hoi` (xem ngay dưới). Không có script nào sửa ngân hàng
   theo ý mình — đó là dữ liệu thật của 1554 câu, một lỗi trong script là hỏng
   hàng loạt.
5. **Đồng bộ lại:** `npm run xuat:ngan-hang` rồi `npm run gan:cau-hoi`, để bản
   chụp trong repo khớp Firestore. Quên bước này thì lần soát sau đọc bản cũ.

### `npm run sua:cau-hoi` — sửa vài câu theo phiếu, KHÔNG phải sửa hàng loạt

Thêm 20/09/2026, vì dán tay công thức hoá học vào Firebase Console rất dễ gõ
lệch một ký tự mà không ai phát hiện. Nó KHÔNG mâu thuẫn với điều 4 ở trên:
thứ điều 4 cấm là một script tự quyết định sửa gì.

```bash
npm run sua:cau-hoi -- docs/soat-hoa-hoc/sua-3-cau-Kc.json          # chạy thử
npm run sua:cau-hoi -- docs/soat-hoa-hoc/sua-3-cau-Kc.json --that   # ghi thật
```

Năm cái trói, **đừng nới cái nào mà không hỏi chủ dự án**:

1. **Không tự biết phải sửa gì** — mọi thứ nằm trong một *phiếu sửa* JSON theo
   git, do người soạn sau khi đã kiểm tay.
2. **Chỉ ghi trường trong danh sách trắng**, hiện chỉ có `q`. `a`/`num`/`tol`
   là ĐÁP ÁN — sửa nhầm là cả lớp bị chấm sai mà điểm vẫn trông hợp lý.
3. **Điều kiện tiên quyết khớp từng ký tự**: giá trị trên Firestore phải bằng
   đúng `cuPhaiLa`. Nhờ vậy chạy lại lần hai không làm gì, và phiếu soạn từ bản
   chụp cũ không đè mất thứ người khác vừa sửa.
4. **Mặc định KHÔNG ghi.** Chạy thử không cần đăng nhập (`bank_questions` đọc
   công khai), nên xem được sẽ đổi gì trước khi quyết định gõ mật khẩu.
5. **`updateDoc`, không `setDoc`; không tạo, không xoá.** `setDoc` thay cả tài
   liệu, tức mọi trường không nhắc tới sẽ biến mất.

Ghi xong nó tự đọc lại từ Firestore để xác nhận — bài học số 1, đừng tin dòng
chữ "xong" của chính script mình viết. Rồi nhắc chạy `xuat:ngan-hang` +
`gan:cau-hoi`.

**Tài khoản để ghi: `GIAO_VIEN_EMAIL` + `GIAO_VIEN_MATKHAU` trong `.env.local`**
(20/09/2026), cùng lối với `E2E_EMAIL`/`E2E_MATKHAU`; `.gitignore` chặn `.env*`.
Bỏ trống thì script hỏi ngay tại máy, hiện dấu sao. Dù đường nào cũng **KHÔNG
nhận mật khẩu qua tham số dòng lệnh** — dòng lệnh nằm trong lịch sử shell và
trong danh sách tiến trình của cả máy. Chung module `scripts/hoi-ban-phim.mts`
với `liet-ke:tai-khoan`.

Tài khoản đó chỉ cần vai **`teacher`**. **Đừng dùng `admin`:** ghi
`bank_questions` không cần tới nó, mà một tài khoản quản trị nằm trong tệp trên
đĩa thì mở thêm cả `users` nếu máy bị lộ — và việc đặt/đổi vai vốn đã ghim vào
`laChuDuAn()` nên `admin` cũng không mở thêm được gì hữu ích. Script in VAI ra
ngay sau khi đăng nhập, dừng luôn nếu là `student`, và nhắc nếu là quản trị.

Phạm vi sẽ mở rộng dần: ngân hàng câu hỏi trước, rồi nội dung 25 bài giảng, rồi
đề cương NCKH. **Câu trả lời của gia sư AI để CUỐI CÙNG** và phải lọc sạch
email/tên học sinh trước khi gửi đi — xem điều 2 ở trên.

### `npm run kiem-tra:gemini` — canh chừng Google đổi nền dưới chân

Nằm trong chuỗi `npm run kiem-tra`, nên chạy trước mỗi commit. Sinh ra vì trong
MỘT buổi ngày 20/09/2026, Google làm hỏng giả định của dự án hai lần mà không
có gì báo — và cả hai đều thuộc loại không làm đỏ `tsc`, không làm hỏng build.

Nó canh bảy thứ: `gemini` còn gọi được; còn các cờ `--approval-mode`,
`--prompt`, `--model`; còn chế độ `plan` (chỉ đọc); `-p` còn được nối vào
stdin; `selectedType` còn đọc được; `.env` không mọc lại khoá giữ chỗ; và model
trong `GEMINI_MODEL_NAME` còn được Google cấp (hỏi ListModels — **không tốn lượt
nào** trong 20 lượt/ngày).

**Máy không có Gemini CLI thì BỎ QUA phần CLI**, không báo hỏng — chuỗi
`kiem-tra` phải chạy được trên CI và trên máy vừa clone. Cùng lối với
`kiem-tra:luat` khi thiếu Java. Thiếu `.env.local` cũng bỏ qua.

`oauth-personal` bị tính là **SAI**, không phải tin vui: đăng nhập bằng tài
khoản Google vẫn lọt nhưng mọi lượt gọi bị chặn bằng `IneligibleTierError`.
Chữa: chạy `gemini`, gõ `/auth`, chọn *Use Gemini API key*. `soat:hoa-hoc` tự
lùi về khoá API nên vẫn chạy được, chỉ là đường CLI chết.

Antigravity chỉ được **ghi nhận**, không tính là hỏng: `agentapi` là API nội bộ
không tài liệu (và nó đòi `ANTIGRAVITY_LS_ADDRESS` do chính app đặt, nên gọi từ
ngoài không được). Dự án CỐ Ý không xây gì lên nó.

**Một cái bẫy đã gỡ:** `gemini` gõ trần trong thư mục dự án từng báo
`API key not valid`. Không phải khoá hỏng — Gemini CLI đọc tệp `.env`, mà ở đó
`GEMINI_API_KEY` là chuỗi giữ chỗ. Nay dòng đó đã bỏ khỏi `.env`; khoá thật chỉ
nằm ở `.env.local`. Đừng khai lại nó vào `.env`.

Xem tài khoản đang có — `npm run liet-ke:tai-khoan`. CHỈ ĐỌC, không ghi gì
Firestore. Phải đăng nhập bằng vai giáo viên trở lên, vì luật chặn `list` trên
`users`; mật khẩu hỏi ngay tại máy, hiện dấu sao, KHÔNG nhận qua tham số dòng
lệnh và không lưu ở đâu. Bốn cờ ghép được với nhau:

| Cờ | Làm gì |
|---|---|
| `--tim <chữ>` | lọc theo email / tên / tên đăng nhập / uid |
| `--vai <vai>` | chỉ một nhóm |
| `--gon` | mỗi tài khoản một dòng, dạng bảng |
| `--csv <tệp>` | xuất ra tệp mở bằng Excel |

Hai điều cố ý, đừng "sửa" thành khác: bộ lọc KHÔNG đụng tới các cảnh báo ở
cuối (hồ sơ mồ côi, đồng quản trị còn vai `student`) — chúng luôn tính trên
TOÀN BỘ, vì một cảnh báo bị bộ lọc giấu đi là cảnh báo vô dụng. Và tệp CSV có
dấu BOM ở đầu, thiếu nó thì Excel trên Windows đọc UTF-8 thành ký tự rác.

Tệp CSV xuất ra **chứa email học sinh** — xem xong thì xoá, đừng commit.

Đây là lời giải đã chốt cho nhu cầu "bí với đống tài khoản thử". Kho mật khẩu
cho quản trị là **KHÔNG LÀM** — xem điều 3 mục Auth, và bốn phép kiểm canh
cho kiểu `User` không bao giờ có lại trường mật khẩu.

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
   bộ chạy test nào — không Vitest, không Jest. Hàng rào là `npm run lint` cộng mười một bộ
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

## Kiến trúc dự án — dữ liệu thật nằm ở đâu

Mục này và mục "An ninh dự án" tách ra từ MỘT mục "An ninh" cũ, ngày
20/09/2026, bằng đúng một cây thước:
**kiến trúc** trả lời *dữ liệu nằm ở đâu, ai ghi, luồng đi thế nào*; **an ninh**
trả lời *ai có thể lạm dụng, và hàng rào nào chặn*. Khối nào vừa là kiến trúc
vừa có ràng buộc an ninh thì để ở đây và để lại một dòng trỏ ở mục kia.

### Ngân hàng câu hỏi nằm ở Firestore, không nằm trong repo

Bản thật ở collection `bank_questions`. Trong repo chỉ có bản chụp
`public/bank/ngan-hang.json`, và mọi thứ chạy ngoài trình duyệt đều dùng bản chụp đó:
trò chơi lúc mất mạng, `npm run soan:sinh`, `npm run gan:cau-hoi`, các bộ kiểm.

Việc đồng bộ **tự chạy**: `.github/workflows/dong-bo-ngan-hang.yml` xuất lại lúc 02:00
mỗi đêm rồi commit nếu có gì đổi. Làm tay thì `npm run xuat:ngan-hang` rồi
`npm run gan:cau-hoi`. Quên đồng bộ thì hai bên lệch dần mà **không có dấu hiệu nào** —
web vẫn đúng vì nó đọc thẳng Firestore; `kiem-tra:dong-bo` sinh ra để chặn điều đó.

`src/features/lessons/constants.ts` **do máy sinh ra**, sửa tay sẽ bị ghi đè.

### Hạn mức đọc: đừng tải cả ngân hàng ở màn học sinh

Bậc miễn phí cho **50.000 lượt đọc/ngày**, mà ngân hàng có **1.554 tài liệu,
5,74 MB** — nên `BankFirestore.getAll()` là **1.554 lượt đọc MỖI LẦN gọi**. Đo
20/09/2026: trước khi sửa, tab Luyện tập, tab Trò chơi và đề theo chương đều gọi
nó, tức một lớp 40 em mở Luyện tập cùng một tiết là **62.160 lượt** — vỡ hạn mức
giữa buổi, và cả trường mất ngân hàng tới sáng hôm sau.

Ba đường thay thế: `getByLesson(lessonId)` (~80 lượt, nhiều nhất 230 ở bài 2),
`getByChapter(ch)` (nhiều nhất 583 ở chương 2), `getByIds(ids)` (chia lô 30 vì
`where(documentId(), 'in', …)` chỉ nhận 30 giá trị).

`getAll()` nay chỉ còn ở màn GIÁO VIÊN — `BankManager`, `DatabankManagement`, và
`GameHubSection` **sau khi đã canh vai**. Họ ít người và thật sự cần cả kho.

**CỐ Ý KHÔNG dựng bảng đếm sẵn ở đâu cả** — không tệp sinh sẵn, không bản chụp,
không bộ nhớ đệm bền. Web deploy bằng kéo-thả `dist/`, nên mọi con số nằm trong
tệp tĩnh chỉ mới tới lần deploy gần nhất: thầy cô nhập câu hỏi xong lại phải
build và deploy lại thì số mới đúng. Đó là một nguồn hiểu nhầm, không phải một
cách tiết kiệm. Thay vào đó:

- Danh sách Luyện tập vẽ bằng **tiến độ** (localStorage) và **không hiện số câu**.
- `trangThaiPhan(phan, tienDo, soCau?)` bỏ trống tham số thứ ba nghĩa là **chưa
  biết** số câu, và khi đó nó KHÔNG bao giờ trả `'thieu-cau'` — đoán sai theo
  hướng đó là giấu mất một bài mà ngân hàng vẫn đủ câu.
- Số câu chỉ được hỏi khi học sinh **bấm vào một bài**, bằng `demTuoiCuaBai()`.
  Lượt đọc đó đằng nào cũng phải có vì còn lấy câu để làm, và `cauCuaBai` giữ
  lại suốt phiên nên bấm lại cùng bài không tốn thêm.

Nhờ vậy **nhập câu hỏi bằng JSON xong là học sinh thấy ngay**, không phải chụp
lại, không phải deploy lại.

**`getCountFromServer` KHÔNG dùng được trên dự án này.** Đo 20/09/2026: trả
`RESOURCE_EXHAUSTED: Quota exceeded` trên MỌI collection, kể cả khi không lọc,
trong khi đọc thường vẫn chạy bình thường — gần như chắc vì chưa bật thanh toán.
Hệ quả: `BankFirestore.getCount()` luôn rơi vào nhánh dự phòng
`getDocs(collection)`, tức **mỗi lần gọi nó tốn 1.554 lượt đọc**. Đừng gọi nó ở
màn học sinh.

Hai phép canh: `kiem-tra:luyen-tap` bắt `getAll()` mọc lại ở ba tệp màn học sinh
và bắt `GameHubSection` phải canh vai TRƯỚC khi gọi; `kiem-tra:e2e` đếm request
Firestore thật — mở tab Luyện tập phải là **0**, bấm vào bài mới được đọc. Bộ
kiểm tĩnh không thấy được chuyện này, chỉ đếm request mới thấy.

Kế hoạch và toàn bộ số đo: `docs/superpowers/plans/2026-09-20-giam-luot-doc-firestore.md`.

### Bài kiểm tra đã nộp nằm ở `bai_nop/{quizId}`

Chuyển sang Firestore ngày 18/09/2026. Trước đó
`QuizStorage` ghi mọi bài vào localStorage của máy đang dùng, còn trang giáo
viên (`QuizProgressTab.tsx`) đọc localStorage của máy GIÁO VIÊN — học sinh
làm ở nhà thì giáo viên thấy trống trơn mà không có lỗi nào, và điểm tự luận
chấm lại chỉ nằm trên máy giáo viên. Phát hiện khi định chụp màn giáo viên
cho báo cáo NCKH.

localStorage VẪN là kho làm việc của học sinh (đề đang làm, chống trùng đề —
cần chạy đồng bộ). `src/features/quiz/baiNopService.ts` chỉ thêm một bản sao
của mỗi bài ĐÃ NỘP. Bốn điều phải biết:

1. **Nộp bài không chờ Firestore.** Mất mạng hay luật chưa publish thì học
   sinh vẫn nộp và xem điểm như cũ; lần đăng nhập sau `dayBaiCuLen` đẩy lại.
   Lỗi GÌ cũng không đánh dấu "đã đẩy", kể cả `permission-denied` — coi bị từ
   chối là xong thì web lên trước luật sẽ làm mất vĩnh viễn các bài trong
   khoảng đó.
2. **Email lưu chữ thường** (`baiNopChuan.ts`), vì luật so `userEmail` với
   token Auth vốn luôn chữ thường. Và phải bỏ mọi `undefined` — Firestore từ
   chối cả tài liệu nếu gặp một giá trị `undefined`, mà câu hỏi từ kho hay
   mang `image: undefined`.
3. **Học sinh tạo, không sửa; giáo viên chỉ sửa `score` + `results`; không ai
   xoá.** Tạo bài không dùng `get()` (chỉ so email trong token).
4. **GIỚI HẠN ĐÃ BIẾT: điểm do trình duyệt chấm.** Luật chặn được điểm vượt
   tối đa và bài đứng tên người khác, KHÔNG chặn được học sinh tự dựng một bài
   điểm cao. Chặn thật cần chấm lại ở máy chủ (Cloud Function, gói Blaze).

Nội dung câu hỏi trong bài nộp do học sinh ghi lên, nên phải coi là không tin
cậy: trang giáo viên hiện nó qua `ChemicalText`, tức qua `locHtml`. Đừng bỏ lớp
lọc đó. `kiem-tra:luyen-tap` canh cho trang giáo viên không đọc lại
`QuizStorage`; `kiem-tra:luat` có 12 phép (21a–21l) cho collection này.

## An ninh dự án — lỗ hổng, hàng rào, và luật

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

**Một lỗi CSP trong Console là BÌNH THƯỜNG, đừng đi chữa.** Bản Netlify miễn
phí tự chèn huy hiệu "Powered by Netlify" dưới dạng một khung `srcdoc`
(`id="nl-badge-frame"`), mà khung kiểu đó **thừa kế CSP của trang cha**, nên
script nội tuyến bên trong nó bị chặn. Đo ngày 16/09/2026 trên tab sạch, không
chạm vào gì: Console có ĐÚNG một lỗi, và là lỗi này.

**ĐỪNG băm hash cho nó.** Hash sẽ hợp thức hoá một đoạn script của bên thứ ba
mà Netlify đổi lúc nào ta không biết — CSP chặn nó chính là CSP đang làm đúng
việc. Cách nhận ra trong một giây: thông báo lỗi ghi nguồn là `about:srcdoc`.
Cả `src/` không có chỗ nào dựng khung `srcdoc`; ba khung của app
(`SlidesSection.tsx`, `GameHubSection.tsx`, `PhongThiNghiem.tsx`) đều dùng
`src`. Thấy `about:srcdoc` là biết ngay không phải mã mình.

**Lỗ hổng mật khẩu chữ thường: ĐÃ VÁ ngày 10/09/2026.** Chuyển sang Firebase
Auth, và xoá cột `password` khỏi cả 17 tài liệu `users` còn mang nó. Mật khẩu
nay đã băm và không bao giờ về tới trình duyệt. Bốn phép kiểm trong
`kiem-tra:an-ninh` canh cho nó không quay lại, mạnh nhất là phép kiểm "kiểu
`User` không có trường `password`" — hàng rào đó do trình biên dịch giữ.

**Phân quyền theo vai: ĐÃ PUBLISH ngày 12/09/2026** (đợt 2 + 2b). Đo ngay sau khi
publish, bằng REST không đăng nhập — đúng tư cách mà workflow đồng bộ đêm dùng:

| Collection | Khách chưa đăng nhập |
|---|---|
| `bank_questions` + 6 collection nội dung | ĐỌC ĐƯỢC (252 câu) — **phải giữ như vậy** |
| `users`, `classes`, `progress`, `chats` | BỊ CHẶN (trước đó đọc được hết) |

Luật làm được điều đó nhờ hai thứ dựng sẵn ở đợt 1: id tài liệu `users` **bằng**
`uid` nên luật đọc được
`get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role`;
và `progress`/`chats` trỏ tới người dùng bằng `userEmail` nên luật dùng thẳng
`request.auth.token.email`, **không tốn lượt đọc nào**.

**Sửa luật xong là CHƯA có tác dụng gì.** Tệp `firestore.rules` trong git chỉ là
bản thảo; luật đang chạy nằm trên Firebase Console. Chủ dự án dán tệp vào ô soạn,
chạy Rules Playground cho đủ phép rồi mới bấm **Publish** — AI không publish được
và không được tự deploy. Nên khi sửa luật: đưa NGUYÊN TỆP cho chủ dự án (đừng chỉ
trích đoạn trong chat), kèm bảng phép thử Playground. Sau khi chủ dự án báo đã
publish, đo lại bằng REST không đăng nhập — đó là tư cách mà đồng bộ đêm dùng.

Từ 13/09/2026 có `npm run kiem-tra:luat` — 19 phép chạy trên emulator, đọc
thẳng `firestore.rules`. Nó bắt được thứ Playground không bắt được: `list`, và
lỗi gõ nhầm tên trường. Nhưng nó CHỈ chứng minh tệp trong git đúng; luật đang
chạy trên Firebase thì vẫn phải đo bằng REST sau khi publish. Hai việc khác
nhau.

Máy chủ dự án KHÔNG chạy được bộ kiểm đó, và đã đo kỹ ngày 16/09/2026 — đừng
đi dò lại. Máy có đúng hai bản Java, cả hai đều là 8: Zulu 8 JRE 32-bit (chỗ
`JAVA_HOME` đang trỏ tới) và AdoptOpenJDK 8 64-bit. `winget install` bản JDK
mới không chạy được. Antigravity chạy ngay trên chính máy Windows này, không
container không WSL, nên bên đó cũng in BỎ QUA y hệt. Cổng 8080 trống, không
cần `firebase login` — hai thứ đó không phải vấn đề. Vấn đề chỉ là Java.
Đường chưa thử, nếu sau này thấy phiền: tải JDK dạng `.zip` giải nén vào thư
mục người dùng (không cần quyền quản trị) rồi đặt `JAVA_HOME` cho riêng phiên.

Một cái bẫy của Playground, đã mất nửa buổi vì nó: ô "Build document" ghi thừa
một dấu cách vào tên trường (`role␣`) là tạo ra một trường KHÁC, và luật đọc
`role` vẫn thấy giá trị cũ — phép thử ra ALLOWED trong khi luật hoàn toàn đúng.
Ra kết quả lạ thì đòi xem `request.resource.data` trước khi đoán bất cứ điều gì.
**Bảy điều về luật hiện hành, đọc trước khi sửa `firestore.rules`:**

1. **`bank_questions` PHẢI giữ `allow read: if true`.** Workflow đồng bộ đêm
   (`.github/workflows/dong-bo-ngan-hang.yml`) đọc Firestore **không đăng nhập**.
   Siết dòng đó là đồng bộ chết mà **không ai biết** — web vẫn đúng vì nó đọc
   thẳng Firestore, chỉ bản chụp trong git lệch dần.
2. **KHÔNG dùng `get()` trong luật của `progress` và `chats`.** Mỗi `get()` là một
   lượt đọc **có tính tiền**, mà đó là hai chỗ học sinh ghi nhiều nhất. Hai khối
   đó chỉ so `request.auth.token.email`, thứ có sẵn trong token.
3. **`users` tách `read` thành `get` và `list`, cố ý.** `get` là đường ĐĂNG NHẬP
   (`getDoc` ở `firestoreAuth.ts`); `list` là `getUsers()` (`getDocs`), chỉ màn
   giáo viên/quản trị. Gộp lại một dòng `read` thì `list` phải dựa vào cách
   Firestore đánh giá `request.auth.uid == userId` trên **từng** tài liệu trả về
   — mà Rules Playground **không mô phỏng được `list`**, nên không đo được trước
   khi publish. Tách ra thì `list` chỉ còn `laGiaoVien()`, không phụ thuộc tài
   liệu. Sai `get` là **không ai đăng nhập được**; sai `list` là **mọi màn giáo
   viên/quản trị trắng**.
4. **Học sinh không sửa được SÁU trường trên hồ sơ của chính mình:** `role`,
   `classId`, `schoolId`, `joinedClassId`, `username`, `email`. Ba cái sau là các
   cửa sau tìm ra trong lúc soát: dự án có **hai** dấu hiệu thuộc lớp
   (`classId` *và* `joinedClassId`), và sổ lớp khớp học sinh bằng **chuỗi định
   danh** (`studentIdentifiers` so với `username`/`email`) chứ không bằng
   `classId`. Khoá một cửa mà quên cửa kia thì vẫn lọt.
5. **Giáo viên thuần chỉ tạo được tài khoản `role: 'student'`.** Để
   `|| laGiaoVien()` trần ở `create` là một giáo viên lấy uid mới qua API đăng
   ký công khai của Google rồi tự ghi hồ sơ `role: admin` — leo quyền teacher
   → admin.
6. **Đặt hay đổi `role` là việc của MỘT người: `laChuDuAn()`** (13/09/2026).
   Ghim bằng email trong token Auth — không giả được, và không tốn lượt đọc
   nào nên đặt TRƯỚC trong mọi phép `||`. Cố ý KHÔNG canh bằng vai trong hồ
   sơ: vai chính là thứ đang được bảo vệ, lấy nó ra canh chính nó là khoá tự
   mở. `allow delete` trên `users` cũng chỉ còn chủ dự án.
   Đổi email chủ dự án thì PHẢI publish lại luật, không thì không ai đặt
   được vai nữa.
   Email đó nằm ở BA nơi và phải khớp từng ký tự: `laChuDuAn()` trong
   `firestore.rules` (hàng rào thật), `EMAIL_CHU_DU_AN` trong
   `src/core/services/quanTri.ts` (chỉ để vẽ giao diện), và nhân vật `chu`
   trong `scripts/kiem-tra-luat.mts` (bộ kiểm luật). `kiem-tra:an-ninh` canh
   cả ba và gọi tên đúng chỗ lệch.
7. **Đồng quản trị đọc bằng `get()`, nên tốn một lượt đọc mỗi lần gọi.**
   `laDongQuanTri()` đọc `quan_tri/dong_quan_tri`, vì thế nó phải đứng SAU
   `laChuDuAn()` trong mọi phép `||` — chủ dự án không tốn lượt đọc nào.
   Collection `quan_tri` chỉ chủ dự án ghi được; đồng quản trị chỉ đọc.
   Nhánh `update` của đồng quản trị chặn thêm `resource.data.role != 'admin'`
   để họ không hạ vai một quản trị hệ thống.

**Lỗ hổng tự nâng vai: ĐÃ VÁ 13/09/2026.** Trước đó `laQuanTri()` ở cả
`create` lẫn `update` không ràng buộc `role`, nên một `school_admin` tự nâng
mình lên `admin` được. Nay cả hai chỗ đi qua `laChuDuAn()`.

Hai hệ quả phải biết trước khi ngạc nhiên:

- **Quản trị KHÔNG phải chủ dự án nay chỉ tạo được `role: 'student'`** và
  **không xoá được hồ sơ nào**. Đó là chủ ý, không phải lỗi.
- `deleteClass` ghi `{ classId: null, role: 'student' }` cho từng học sinh.
  Học sinh vốn đã là `student` nên `role` KHÔNG nằm trong `affectedKeys()`
  (hàm đó chỉ kể khoá thêm/bớt/ĐỔI GIÁ TRỊ) — giáo viên vẫn xoá lớp được.
  Nhưng nếu trong `studentIdentifiers` lỡ có một email vai khác thì lệnh đó
  ĐỔI vai thật, và sẽ bị từ chối. Đúng như mong muốn.

**Còn lại, đã biết và cố ý hoãn:** học sinh sửa được `status` (hôm nay vô hại
— đã quét, không đường nào dùng `status` làm cổng).

**Bài kiểm tra đã nộp (`bai_nop`)** chuyển sang mục "Kiến trúc dự án" — ở đó
có ghi rõ một GIỚI HẠN AN NINH đã biết: điểm do trình duyệt chấm, luật chặn
được điểm vượt tối đa và bài đứng tên người khác, nhưng KHÔNG chặn được học
sinh tự dựng một bài điểm cao.

**Khoá Gemini riêng của học sinh: CÓ LẠI ngày 20/09/2026**, sau khi đã bỏ ngày
14/09/2026. Khác bản cũ ở ba điểm, và cả ba đều có phép kiểm canh:

1. **Chỉ mời khi thật sự bị chặn** — tức khi cả web hết hạn mức theo NGÀY. Hết
   theo PHÚT thì chờ vài chục giây, không đụng tới khoá của em.
2. **Hướng dẫn nói rõ Google đòi người tạo khoá từ 18 tuổi**, nên bố mẹ hoặc
   thầy cô làm giúp. Đây chính là lý do bản cũ bị bỏ; bỏ câu này đi là web
   đang xui trẻ vị thành niên làm sai điều khoản. `kiem-tra:het-luot` canh.
3. **Khoá không rời khỏi máy em**: chỉ `localStorage`, KHÔNG Firestore, KHÔNG
   console, KHÔNG nhật ký lỗi. `kiem-tra:an-ninh` canh bốn điều đó.

Đừng lẫn với lỗ hổng 13/09/2026: cái đó là khoá nằm trong gói JS đã dựng (biến
môi trường tiền tố VITE). Khoá ở đây do chính người dùng gõ lúc chạy, không có
trong mã nguồn. Vì phép kiểm quét cả CHÚ THÍCH, đừng viết tên biến môi trường
đó ra trong bình luận — sẽ bị báo SAI, và phép kiểm nên tiếp tục nghiêm như vậy.

**Luật KHÔNG với tới mật khẩu.** Mật khẩu nằm ở Firebase Auth, đã băm. Đăng
ký email + mật khẩu là **công khai** — ai cũng lấy được một uid hợp lệ mà
không cần đụng vào web. Điều luật làm được là chặn uid đó thành bất kỳ vai
nào ngoài `student`. Trong mã hôm nay không có `updatePassword` và không có
Admin SDK, nên **không ai đặt được mật khẩu cho người khác**, chỉ
`sendPasswordResetEmail`.

Khoá web của Firebase trong `firebaseCongKhai.ts` **không phải bí mật** (nó vốn
nằm trong gói JS ai bấm F12 cũng đọc được); an toàn dựa vào Firestore Rules. Khoá
Gemini thì CÓ là bí mật vì nó tính tiền — `kiem-tra:an-ninh` canh không cho khoá
nào lọt vào `src/`.

**Key Gemini lộ trên Netlify: ĐÃ VÁ trong mã ngày 13/09/2026.** `VITE_GEMINI_API_KEY`
bị Vite chép nguyên văn vào `dist/`, ai bấm F12 cũng lấy được — mà phép kiểm cũ
báo ĐẠT vì chỉ soi `src/` và chỉ biết mẫu `AIza` (key cấp từ 2026 bắt đầu bằng
`AQ.`). Key `AQ.` gắn tài khoản dịch vụ lại KHÔNG giới hạn được theo website. Nay
bản build gọi qua Firebase AI Logic, không mang key nào; `kiem-tra:an-ninh` bắt
cả mẫu `AQ.`, cấm mã đọc `VITE_GEMINI_API_KEY`, và quét `dist/` nếu có.
Hai điều phải giữ:

- **Chỉ AI Logic bật App Check.** Đừng bấm Enforce cho Firestore/Auth/Storage
  trong Firebase Console khi app chưa khởi tạo App Check ở mọi màn — học sinh sẽ
  không đăng nhập được. (Từ 02/11/2026 Firebase bắt buộc App Check cho AI Logic.)
- **CSP phải cho phép reCAPTCHA** (`https://www.google.com/recaptcha/`,
  `https://www.gstatic.com/recaptcha/`, `https://recaptcha.google.com/recaptcha/`) — thiếu thì
  gia sư chết trên Netlify mà máy dev vẫn chạy.

**Lỗi 400 lúc KHÁCH gửi câu hỏi cho gia sư = chưa bật Anonymous.** Console in
`auth/admin-restricted-operation` kèm cảnh báo `[gioiHanChat]`. Đây là đường
lùi đã tính trước, không phải hỏng:
`src/features/tutor/services/gioiHanChatService.ts` gọi `signInAnonymously` để
khách có một `uid`, và CHỈ gọi khi khách **thật sự gửi tin** — mở trang thì chỉ
đọc, không tạo phiên (đo 16/09/2026: tab sạch, không chạm gì, KHÔNG có 400).

Chưa bật thì hàng rào chống lạm dụng **lùi về đếm trong bộ nhớ phiên**: khách
bấm F5 là 25 lượt về lại 25, khoá spam 15 phút cũng mất — đúng cái lỗ mà bản
ghi `gioi_han_chat` dựng lên để bịt.

**Hai công tắc chứ không phải một, và ĐÃ BẬT CẢ HAI ngày 16/09/2026:** (1)
Anonymous ở Firebase Console → Authentication → Sign-in method; (2) luật phải
được Publish, vì khối `gioi_han_chat` vào git ở commit `78f839e` mà luật đang
chạy lúc đó vẫn là bản cũ hơn — bật mỗi công tắc 1 thì vẫn hỏng. Mã tự phân
biệt hai ca nên đọc Console là biết ngay: `Không đăng nhập ẩn danh được` là
công tắc 1, `Ghi Firestore bị từ chối` là công tắc 2.

Đo bằng REST với token ẩn danh ngay sau khi Publish. Bảng này cũng là phép
nghiệm thu nếu sau này phải dựng lại:

| Đọc gì | Phải ra |
|---|---|
| `bank_questions` | 200 — đồng bộ đêm còn sống |
| `users` | 403 |
| bản ghi giới hạn của chính mình, khi chưa gửi tin | **404**, KHÔNG phải 403 |
| sau khi gửi một tin | 200, đủ 5 trường, `luotKhach` = 1 |
| F5 rồi đọc lại | uid KHÔNG đổi, `luotKhach` vẫn 1 |
| đếm lùi `luotKhach` về 0 | 403 |
| hạ `khoaDen` trong lúc đang khoá thật | 403 |

`404` ở dòng thứ ba mới là đúng — luật CHO PHÉP đọc, chỉ là bản ghi chưa sinh;
`403` mới là bị luật chặn. Và cái bẫy đã vấp khi đo: thử "hạ `khoaDen` về 0"
trong lúc `khoaDen` vốn đang là 0 thì luôn ra 200, vì đó không phải hạ. Đó là
phép thử vô nghĩa chứ không phải lỗ hổng — phải đặt khoá vào tương lai trước,
rồi mới hạ, thì mới đo được điều muốn đo.

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

7. **Ép kiểu `as User` làm trình biên dịch mù khi thiếu trường.** `getUsers()` và
   `getUserByIdentifier()` dựng hồ sơ bằng danh sách trường viết tay rồi đóng lại
   bằng `as User`. Thêm `pendingRole` vào kiểu `User` mà quên thêm vào hai chỗ đó
   thì `tsc` vẫn xanh, cả 12 bộ kiểm vẫn đạt, dữ liệu trong Firestore vẫn đúng —
   mà khung duyệt đơn nằm im, và cột "Đơn chờ" của giáo viên mù theo. Hai tính
   năng chết vì một dòng thiếu. Thêm trường vào kiểu `User` thì PHẢI
   `grep "as User"` rồi thêm vào từng chỗ.

8. **Bộ đệm Console bắc qua cả lần tải lại trang — đừng tin một dòng cảnh báo
   nếu chưa mở tab sạch.** Ngày 16/09/2026, dòng `[gioiHanChat] Không đăng nhập
   ẩn danh được` vẫn nằm trong Console SAU KHI công tắc Anonymous đã bật, và
   suýt dẫn tới kết luận "bật rồi mà vẫn hỏng". Nó là rác của lần tải trước.
   Dấu hiệu nhận ra: cùng một lỗi xuất hiện HAI lần trong danh sách. Cách đo
   đúng: mở một tab MỚI (bộ đệm theo tab, không theo lần tải), hoặc bỏ qua
   Console và đo thẳng — REST cho luật, IndexedDB cho phiên đăng nhập. Cùng họ
   với bài học số 3: ô xem trước cũng báo số sai khi cửa sổ đang ẩn.

9. **Đọc mã KHÔNG thay được chỗ hỏi máy chủ.** Ngày 20/09/2026 sai ba lần trong
   một buổi, cả ba cùng một bệnh là kết luận từ thứ đọc được thay vì từ thứ đo
   được:

   - `grep` thấy `LOGIN_WITH_GOOGLE` còn trong gói Gemini CLI → kết luận đăng
     nhập tài khoản Google còn dùng được → **bảo chủ dự án đi đăng nhập**. Thực
     tế Google đã ngừng phục vụ tài khoản cá nhân từ 18/06/2026; chuỗi đó là mã
     thừa. Chủ dự án mất công, và CLI rơi vào trạng thái `oauth-personal` chết.
     Một lượt gọi thật đã cho ngay câu trả lời: `IneligibleTierError`.
   - Ghim cứng đường dẫn `auth.selectedType` trong khi nó nằm ở
     `security.auth.selectedType`. Hàm dò trả `'khong-ro'`, mà `'khong-ro'` lúc
     đó bị hiểu là "đang dùng tài khoản trả phí" → **hàng rào hạn mức tự tắt**.
     Nay hàm tìm khoá ở mọi độ sâu, và không biết thì hiểu theo hướng an toàn.
   - Tên tệp báo cáo chỉ có NGÀY, không có giờ → lượt soát thứ hai **ghi đè mất
     một báo cáo có 3 phát hiện thật**.

   Cả ba đều tự bắt được bằng chính việc đo sau đó, nên quy trình không hỏng —
   chỉ là áp dụng muộn. Thứ tự đúng: đo trước, kết luận sau. Cái gì hỏi được
   máy chủ thì đừng suy ra từ mã nguồn.

