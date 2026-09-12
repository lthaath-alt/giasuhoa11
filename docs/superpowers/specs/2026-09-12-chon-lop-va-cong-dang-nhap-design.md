# Đợt 2c — Chọn lớp từ danh sách, và cổng đăng nhập

Ngày 12/09/2026. Sau khi đợt 2b đã publish luật phân quyền.

## Vì sao có đợt này

Đợt 2b dựng xong đường "đơn xin vào lớp", nhưng học sinh phải **gõ mã 6 ký tự**.
Chủ dự án thử rồi nói thẳng: *"mã lớp thì rất là khó đoán"*. Và đúng vậy — mã
sinh tự động trước đây là `X22P43`, `SDSAPT`, `MZQ72E`.

Ngày 12/09/2026 đã tạo 6 lớp mới với mã đọc được (`11A4`, `11B1`, `11H01`…),
nhưng đó chỉ là vá triệu chứng: học sinh vẫn phải **biết trước** mã, tức phải
được ai đó đọc cho.

Chủ dự án chốt ba việc:

1. **Cho học sinh bấm chọn lớp từ danh sách**, thay vì gõ mã.
2. **Xoá ô nhập mã lớp ở màn đăng ký.**
3. **Luôn vào trang đăng nhập trước, và luôn lưu phiên đăng nhập cuối.**

## Quyết định của chủ dự án, ghi nguyên văn

Hỏi: *"Luôn vào trang đăng nhập trước" + "luôn lưu phiên cuối" — cụ thể là gì?*

Chọn: **"Màn đăng nhập có nút *Tiếp tục với \<email\>*"** — mọi lần vào web đều
dừng ở màn đăng nhập; nếu phiên còn sống thì có sẵn một nút bấm một cái là vào,
**không cần nhập lại mật khẩu**.

Nghĩa là: vừa luôn thấy màn đăng nhập, vừa giữ phiên. Hai yêu cầu nghe mâu thuẫn
nhưng không mâu thuẫn — chỉ là thêm một bước bấm tường minh.

Hai phương án bị loại: "điền sẵn email nhưng vẫn phải nhập mật khẩu" (đảo ngược
điều đợt 1 vừa làm, và học sinh phải nhập mật khẩu mỗi lần vào), và "giữ nguyên
hiện trạng" (không thoả yêu cầu).

## Thiết kế

### 1. Chọn lớp — KHÔNG đổi cơ chế bên dưới

`JoinClassForm` đổi từ ô gõ chữ sang **ô chọn lớp**. Khi học sinh chọn và bấm
gửi, hệ thống lấy `inviteCode` của lớp đó rồi gọi **đúng hàm
`joinClassByCode(code)` đang có**.

Vì sao không lưu `classId`: luật Firestore **cấm** học sinh ghi `classId` — đó là
cửa sau mà đợt 2b vừa khoá. `pendingClassCode` là trường duy nhất học sinh được
ghi, và cơ chế duyệt của giáo viên đã khớp theo nó. Đổi cơ chế là phải mở lại
luật; giữ cơ chế thì **không cần đụng một dòng luật nào**.

Học sinh đã đăng nhập **đọc được** `classes` (`allow read: if dangNhap()`), nên
danh sách dựng được ngay ở client, không thêm lượt đọc nào ngoài lượt đã có.

Hệ quả đã biết và chấp nhận: học sinh thấy tên **mọi lớp** trong hệ thống. Điều
đó vốn đã đúng từ trước (em đọc được `classes`), nay chỉ hiện ra trên giao diện.
Tên lớp không phải bí mật.

### 2. Bỏ ô mã ở màn đăng ký

Màn đăng ký chạy khi **chưa đăng nhập**, nên nó không đọc được `classes` — không
có cách nào cho chọn lớp ở đó. Vậy bỏ hẳn ô mã: đăng ký cho gọn, vào rồi mới
chọn lớp từ danh sách.

Nhờ vậy mã mời **biến mất hoàn toàn khỏi mắt học sinh**, và không ai phải nhớ
`11H01` nữa.

### 3. Cổng đăng nhập

Hiện trạng đo được ngày 12/09/2026:

- `App.tsx`: `/` → `Navigate to /dashboard`
- `PublicRoute`: thấy `currentUser` là **đá thẳng** sang trang theo vai, nên
  người đã đăng nhập **không bao giờ** thấy màn đăng nhập
- `LoginPage.handleSuccess`: `navigate('/dashboard')` — **cứng, không theo vai**

Ba chỗ phải đổi, và chỗ thứ ba là cái bẫy:

`PublicRoute` và `handleSuccess` đang **chạy đua** sau khi đăng nhập. Bỏ
`PublicRoute` mà không sửa `handleSuccess` thì giáo viên và quản trị bị đổ hết
vào màn học sinh.

Nhưng `handleSuccess` **không thể** đọc vai ngay: `login()` gọi
`signInWithEmailAndPassword`, còn hồ sơ (có `role`) về sau, qua
`onAuthStateChanged`. Tại thời điểm `handleSuccess` chạy, `currentUser` còn
`null`.

Cách giải: một cờ **"người dùng đã bấm vào"**, cộng một `useEffect` chờ
`currentUser` xuất hiện rồi mới điều hướng theo vai.

    người dùng bấm Đăng nhập / Tiếp tục  ->  đặt cờ
    currentUser xuất hiện                ->  useEffect điều hướng theo vai

Vào web với phiên còn sống thì cờ chưa đặt → **dừng ở màn đăng nhập**, đúng yêu
cầu. Bấm rồi thì đi đúng vai, không đua với ai.

## Cách nghiệm thu

- `npx tsc --noEmit` sạch; `npm run kiem-tra` 11/11 bộ.
- Không đổi một dòng nào trong `firestore.rules`.
- Thử tay: vào web có phiên còn sống → thấy màn đăng nhập kèm nút *Tiếp tục với
  \<email\>*; bấm → vào **đúng trang theo vai** (học sinh → dashboard, giáo viên
  → /teacher, quản trị → /admin).
- Đăng nhập bằng tài khoản quản trị → phải vào `/admin`, **không** phải
  `/dashboard`.
- Màn đăng ký không còn ô "Mã lớp".
- Tab Học sinh → chọn lớp từ danh sách → báo đã gửi đơn; giáo viên thấy đơn.

## Việc KHÔNG làm

- Không đụng `firestore.rules`.
- Không tạo collection mới, không thêm trường mới.
- Không bỏ `pendingClassCode` — nó vẫn là cơ chế, chỉ đổi cách nhập.
- Không xoá hàm `register` cũ (không có ai gọi) — chỉ ghi chú, theo quy ước
  "thấy mã chết thì nhắc chứ đừng xoá".
