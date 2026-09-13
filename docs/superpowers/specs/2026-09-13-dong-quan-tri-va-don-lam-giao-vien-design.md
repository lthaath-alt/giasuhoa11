# Đợt 3 — Đồng quản trị, và đơn xin làm giáo viên

Ngày 13/09/2026. Sau khi đợt 2c đã đóng và luật `laChuDuAn()` đã publish.

## Vì sao có đợt này

Chủ dự án muốn hai điều:

1. **Người ngoài tự đăng ký làm giáo viên, phải chờ duyệt.** Hiện tài khoản giáo
   viên chỉ sinh ra một đường: quản trị tạo hộ ở `/admin`.
2. **Có người cùng gánh việc quản trị**, nhưng danh sách những người đó do
   **một mình chủ dự án** nắm.

Hai điều này dính nhau: nút "Duyệt đơn" thuộc về ai? Chủ dự án chốt **"thầy cộng
những người thầy chỉ đích danh"**, nên đồng quản trị phải làm trước.

## Quyết định của chủ dự án, ghi nguyên văn

| Hỏi | Chốt |
|---|---|
| Ai được duyệt đơn làm giáo viên? | Chủ dự án **+ những người chủ dự án chỉ đích danh** |
| Đồng quản trị được làm gì? | Đặt **mọi vai trừ `admin`**; không thêm được đồng quản trị khác |
| Người xin làm giáo viên nộp đơn ở đâu? | **Ngay ở màn đăng ký** |

## Việc KHÔNG làm trong đợt này

- **Không** xây kho mật khẩu. Đã bàn và gác lại — xem mục cuối.
- **Không** đụng `createTeacher`: đường quản trị tạo trực tiếp ở `/admin` giữ
  nguyên. Hai đường song song, cả hai đều hợp lệ.
- **Không** cho đồng quản trị xoá hồ sơ. Chủ dự án chỉ nói "đặt vai"; giữ hẹp.
- **Không** xoá `SchoolTab.tsx` (mã chết, 207 dòng, không tệp nào dựng). Theo quy
  ước "thấy mã chết thì nhắc chứ đừng xoá".

---

# Đợt 3a — Đồng quản trị

## Dữ liệu

Collection mới, đúng **một** tài liệu:

```
quan_tri/dong_quan_tri  →  { emails: ["nguoia@x.com", "nguoib@y.com"] }
```

Vì sao một tài liệu riêng chứ không phải cờ trên hồ sơ từng người: cờ
`coAdmin: true` trên `users/{uid}` rẻ hơn (luật vốn đã đọc hồ sơ người gọi để lấy
`role`), nhưng nó mở **hai cửa** phải canh — học sinh tự sửa hồ sơ mình, và
người mới tự đăng ký. Quên một cửa là bất kỳ ai cũng tự phong. Dự án này đã vấp
đúng kiểu lỗi đó hai lần (`classId` khoá rồi mà quên `joinedClassId`; khoá xong
lại quên `username`). Một chỗ duy nhất để canh đáng giá hơn một lượt đọc.

Cũng vì thế **không** dùng `system_settings`: nó đang là `allow write: if
laQuanTri()`, tức một `school_admin` ghi được — họ sẽ tự thêm mình vào danh sách.

## Luật

```
function laDongQuanTri() {
  return dangNhap() && get(/databases/$(database)/documents/quan_tri/dong_quan_tri)
           .data.emails.hasAny([email()]);
}

match /quan_tri/{id} {
  allow read:  if laChuDuAn() || laDongQuanTri();
  allow write: if laChuDuAn();
}
```

Trong `match /users/{userId}`, thêm một nhánh vào `create` và `update`, **đặt
cuối** trong phép `||` để các nhánh rẻ hơn chạy trước và ngắn mạch:

```
create:  || (laDongQuanTri()
             && request.resource.data.role in ['student','teacher','school_admin'])

update:  || (laDongQuanTri()
             && request.resource.data.role in ['student','teacher','school_admin']
             && resource.data.role != 'admin')
```

`allow delete` giữ nguyên `laChuDuAn()`.

### Bốn điều dễ viết sai ở khối này

1. **`create` KHÔNG được nhắc `resource.data`.** Lúc `create` thì `resource` là
   null, và đọc trường trên null là lỗi "Null value error" — luật từ chối. Đây
   đúng là lỗi đã gặp ngày 13/09/2026 khi thử phép 4 ở Playground với một đường
   dẫn không có tài liệu. Vì thế vế `resource.data.role != 'admin'` **chỉ có ở
   `update`**.

2. **Phải chặn CẢ vai mới lẫn vai cũ.** Thiếu `resource.data.role != 'admin'`
   thì một đồng quản trị hạ được chính chủ dự án xuống `student`, và sau đó
   không ai đặt lại vai được nữa ngoài việc vào Firebase Console.

3. **`quan_tri` phải cho đồng quản trị ĐỌC.** Thoạt tiên bản thiết kế để
   `allow read: if laChuDuAn()` cho kín. Nhưng thế thì chính người đồng quản trị
   không đọc được danh sách để biết mình có quyền — giao diện sẽ không hiện nút
   Duyệt cho họ, và lỗi chỉ lộ ra lúc thử tay. Không có vòng lặp: `get()` trong
   luật **không bị luật đọc chặn**.

4. **Đặt `laDongQuanTri()` ở CUỐI.** Nó tốn một lượt đọc có tính tiền. Các nhánh
   trước (chủ dự án, chủ tài khoản) không tốn gì, nên phần lớn lượt ghi không
   phải trả thêm. Chỉ đường duyệt đơn — vốn hiếm — mới chạm tới nó.

## Mã

- Một hằng **duy nhất** `EMAIL_CHU_DU_AN` trong `src/core/services/`.
- `AppContext` tải `quan_tri/dong_quan_tri` sau khi đăng nhập. Đọc lỗi
  (`permission-denied` với người thường) thì coi như **không phải** đồng quản
  trị — im lặng, không báo lỗi cho người dùng.
- `/admin` → **Quản lý Tài khoản** → khung "Đồng quản trị", **chỉ chủ dự án
  thấy**: liệt kê, thêm (chọn từ tài khoản đã có), bớt.

Phép kiểm phía `src/` **chỉ để vẽ giao diện**. Hàng rào thật luôn là luật.

## Phép kiểm mới

Thêm vào `kiem-tra:an-ninh`: email chủ dự án trong `src/` phải **trùng** với
trong `firestore.rules`. Hai nơi lệch nhau thì giao diện nói một đằng luật làm
một nẻo — kiểu lỗi im lặng tệ nhất.

Phải **cố tình làm hỏng một bên** và xác nhận phép kiểm kêu, trước khi tin nó.
Bài học đã ghi trong `CLAUDE.md`: một phép kiểm luôn xanh mà chưa bao giờ bắt
được gì thì đáng ngờ hơn đáng mừng.

## Mười phép thử ở Rules Playground

Chủ dự án chạy trước khi Publish. Phép 10 là **phép hồi quy**.

| # | Ai | Làm gì | Mong đợi |
|---|---|---|---|
| 1 | chủ dự án | đặt `role: teacher` | ALLOWED |
| 2 | đồng quản trị | đặt `role: teacher` | ALLOWED |
| 3 | đồng quản trị | đặt `role: admin` | DENIED |
| 4 | đồng quản trị | sửa hồ sơ đang là `admin` | DENIED |
| 5 | giáo viên thường | đặt `role: teacher` | DENIED |
| 6 | đồng quản trị | xoá hồ sơ | DENIED |
| 7 | học sinh | đọc `quan_tri/dong_quan_tri` | DENIED |
| 8 | đồng quản trị | đọc `quan_tri/dong_quan_tri` | ALLOWED |
| 9 | đồng quản trị | ghi `quan_tri/dong_quan_tri` | DENIED |
| 10 | giáo viên | duyệt đơn vào lớp (ghi `classId`) | ALLOWED |

Đường dẫn ở ô Location phải là **uid thật**, dán từ Firestore. Gõ chữ mô tả vào
đó thì tài liệu không tồn tại và Playground báo "Null value error" chứ không báo
DENIED.

Publish xong thì đo lại bằng cách đọc Firestore qua REST **không đăng nhập**,
xác nhận `bank_questions` (và sáu collection nội dung) vẫn đọc được, còn
`users`/`classes`/`progress`/`chats` vẫn bị chặn: phải vẫn 11/11,
`bank_questions` vẫn 252 tài liệu.

---

# Đợt 3b — Đơn xin làm giáo viên

## Cơ chế

Sao chép đúng khuôn "đơn xin vào lớp" đang chạy:

```
đơn vào lớp :  pendingClassCode  →  giáo viên duyệt   →  ghi classId
đơn làm GV  :  pendingRole       →  thầy/đồng QT duyệt →  ghi role + schoolId
```

Một trường mới `pendingRole?: 'teacher'` trên `users`.

**Không đụng một dòng luật nào.** Luật hiện hành cho người tự đăng ký ghi hồ sơ
của chính mình miễn `role == 'student'`, và không cấm trường phụ nào ngoài
`classId` / `schoolId` / `joinedClassId`. Việc đổi `role` thật đã có nhánh
`laDongQuanTri()` của đợt 3a lo.

## Lối vào

Màn đăng ký hiện có hai thẻ ("Học sinh đăng ký bằng Email" / "Tài khoản do nhà
trường cấp"). Thêm thẻ thứ ba **"Giáo viên đăng ký"** → form tên / email / mật
khẩu → tạo tài khoản `role: 'student'` kèm `pendingRole: 'teacher'`.

## Ba cái bẫy

1. **Người chờ duyệt LÀ học sinh.** Họ đăng nhập sẽ rơi vào `/dashboard`, thấy
   giao diện học sinh, thấy cả ô chọn lớp — và tưởng đăng ký hỏng. Phải có băng
   báo "Đơn xin làm giáo viên đang chờ duyệt" trên dashboard.

2. **`pendingRole` rác không được khoá ai lại.** Chỉ coi là đơn khi
   `pendingRole === 'teacher'` **và** `role === 'student'`. Giá trị lạ thì lờ
   đi, người đó vẫn dùng web bình thường. Đây là bài học từ đợt 2b: mã lớp gõ
   sai từng khoá học sinh khỏi mọi lớp vì không ai thấy đơn để từ chối.

3. **Khung duyệt phải nằm chỗ có người bấm tới.** Đặt trong `/admin` → **Quản lý
   Tài khoản**, ngay trên danh sách tài khoản, và **chỉ hiện khi có đơn**. Đợt
   2b đã mất công vì cả tính năng "xin vào lớp" nằm chết sau một tab bị ẩn.

## Duyệt

- **Duyệt** → đặt `role: 'teacher'`, chọn trường (`schoolId`), xoá `pendingRole`
- **Từ chối** → chỉ xoá `pendingRole`; người đó vẫn là học sinh bình thường

Ai thấy khung này: **chủ dự án và đồng quản trị**. Giáo viên thường không.

## Thử tay

| # | Làm | Phải ra |
|---|---|---|
| 1 | Mở màn đăng ký | Có thẻ thứ ba "Giáo viên đăng ký" |
| 2 | Đăng ký làm giáo viên | Vào được, thấy băng "đang chờ duyệt" |
| 3 | Chủ dự án vào `/admin` → Quản lý Tài khoản | Thấy đơn |
| 4 | Bấm Duyệt, chọn trường | Người đó đăng nhập lại → `/teacher` |
| 5 | Đăng ký người nữa rồi bấm Từ chối | Băng biến mất, vẫn là học sinh, vẫn dùng được |
| 6 | Đăng nhập bằng đồng quản trị | Cũng thấy và duyệt được |
| 7 | Đăng nhập bằng giáo viên thường | KHÔNG thấy khung đơn |

---

## Cách nghiệm thu cả đợt

- `npx tsc --noEmit` sạch; `npm run kiem-tra` cả 12 bộ (11 cũ + phép kiểm email
  chủ dự án) đạt, 0 SAI.
- Phép kiểm mới đã được **chứng minh bằng cách làm hỏng có chủ đích**.
- 10 phép Rules Playground đạt, rồi Publish, rồi REST 11/11.
- 7 phép thử tay của 3b đạt trên bản Netlify thật.

## Thứ tự không được đảo

```
3a luật + mã + phép kiểm  →  3a Playground + Publish  →  3b  →  thử tay
```

3b dựa vào nhánh `laDongQuanTri()` của 3a. Làm ngược thì nút Duyệt của 3b không
ai bấm được ngoài chủ dự án, và sẽ tưởng 3b hỏng.

## Chuyện mật khẩu — gác lại, ghi để khỏi bàn lại từ đầu

Chủ dự án từng yêu cầu một kho lưu mật khẩu mọi tài khoản cho quản trị xem.
**Không làm**, vì hai lẽ:

- **Thực dụng:** mật khẩu cũ đã băm, đã mất. Kho mới chỉ hứng được từ lúc bật
  trở đi, nên nó **không cứu được** đúng những tài khoản đang bị quên — tức
  không giải quyết được vấn đề đã sinh ra nó.
- **An ninh:** đó đúng là lỗ hổng đã đóng ngày 10/09/2026 (mật khẩu chữ thường
  cộng XSS = mất sạch tài khoản học sinh). Kiểu `User` không có trường
  `password`, và bốn phép kiểm canh điều đó.

Nhu cầu thật phía sau có thể là: **học sinh quên mật khẩu giữa giờ, giáo viên
cần cấp lại ngay** — mà học sinh dùng địa chỉ `<username>@internal.local` thì
không nhận được thư đặt lại. Lời giải đúng là một nút "cấp mật khẩu mới" hiện
**một lần** rồi không cất ở đâu; thứ đó cần Cloud Function + Admin SDK, tức gói
Blaze trả tiền. Đang chờ chủ dự án xác nhận có đúng cảnh đó không.
