# Tài liệu theo chủ đề — auth

> Trích nguyên văn từ CLAUDE.md người dùng cung cấp. Quy tắc/giới hạn vẫn có hiệu lực; số đo và trạng thái dịch vụ là ghi nhận lịch sử, chưa được xác minh lại. Chỉ đọc phần liên quan.

**Tra mục:** [INDEX.md](INDEX.md). **Đọc chéo khi liên quan:** [security.md](security.md), [data.md](data.md), [testing.md](testing.md), [ui.md](ui.md).

Các đường dẫn code trong nội dung gốc tính từ gốc repo. Cụm “mục bên dưới”, “tệp này” hoặc tên mục không kèm file là tham chiếu của bản gốc: dùng INDEX.md để tìm đúng tài liệu mới.

**Ghi chú đối chiếu:** Ngoài Auth, phần cuối tài liệu này còn chứa các ràng buộc MUI, theme, vite.config.ts. Khi đổi giao diện phải xem ui.md; khi đổi vai phải xem luật trong security.md.

---

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

