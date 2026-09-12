# Đợt 2b — Đơn xin vào lớp, và hai lỗ hổng chặn publish

Ngày 12/09/2026. Phụ lục của
`docs/superpowers/specs/2026-09-10-firestore-rules-dot-2-design.md`.

## Vì sao có tài liệu này

Đợt 2 dừng ở Việc 5 (cổng Rules Playground). Trong lúc truy một câu hỏi của chủ
dự án — "sao phép 7 lại allowed?" — đã tìm ra **bốn** chỗ hỏng. Hai chỗ là lỗ
hổng trong chính luật vừa viết, hai chỗ là mã ứng dụng sẽ vỡ ngay khi publish.

Không cái nào bị bảng 11 phép thử của Việc 5 bắt được. Đó là khiếm khuyết của
bảng thử, không phải may mắn.

## Bốn phát hiện

### 1. `create` của `users` là một đường leo thang quyền

Luật Việc 4 viết:

    allow create: if dangNhap() && (request.auth.uid == userId || laGiaoVien());

Không ràng buộc `role`. Đăng ký Firebase Auth bằng email + mật khẩu là **công
khai**: bất kỳ ai cũng gọi thẳng API của Google để lấy một `uid` hợp lệ mà không
cần đụng vào web. Có `uid` rồi thì ghi `users/{uid}` với `role: "admin"` —
luật cho qua.

Chặn `update` mà bỏ ngỏ `create` thì cửa vẫn mở, chỉ là cửa bên cạnh.

### 2. Học sinh tự đăng ký sẽ chết ngay khi publish

`StudentRegisterForm` → `registerWithOptionalClass` (AppContext) **không** truyền
`dangTuDangKy: true`. Nên tài khoản Auth tạo trên app PHỤ, còn hồ sơ lại ghi
bằng `db` của app CHÍNH — lúc đó khách **chưa đăng nhập**. Luật mới:
`dangNhap()` sai → create bị chặn. Người đăng ký có bản ghi Auth nhưng không có
hồ sơ, và không tự sửa được.

### 3. "Vào lớp bằng mã mời" ghi vào `classes`

`joinClassByCode` gọi `addStudentToClass`, tức `updateDoc` lên `classes`. Luật
mới cho `classes` là `allow write: if laGiaoVien()` → học sinh bị chặn.

### 4. Ô "Mã lớp" ở màn đăng ký đã hỏng sẵn trên bản đang chạy

Việc 2 đổi `AppContext` sang nạp hai tầng: `classes` chỉ nạp **sau khi đăng
nhập**. Nhưng `registerWithOptionalClass` tra mã bằng
`classes.find(c => c.inviteCode === code)` — với khách thì mảng đó rỗng, nên
mã đúng vẫn bị báo *"Mã lớp không tồn tại"*. Lỗi này **đã lên production** từ
lần deploy của Việc 3.

## Quyết định của chủ dự án

> "k cho học sinh chỉnh sửa gì về lớp học kể cả thêm mail vào"

`classes` giữ nguyên `allow write: if laGiaoVien()`. Không nới.

Chọn phương án **đơn xin vào lớp**: học sinh gửi nguyện vọng, **giáo viên** là
người duy nhất ghi vào `classes`.

## Một phương án đã bị loại, và vì sao

Cách nhỏ nhất trông có vẻ là: bỏ ghi `classes`, chỉ ghi `users.classId` của
chính em đó, rồi cho sổ điểm danh đọc theo `classId`.

**Loại.** Học sinh sửa được hồ sơ của chính mình, nên em tự đặt `classId` thành
lớp bất kỳ là hiện ra trong sổ của giáo viên. Vẫn đúng là học sinh tự thêm mình
vào lớp, chỉ đi cửa sau. Nó vi phạm đúng điều vừa chốt.

Hệ quả: luật phải chặn học sinh tự đặt `classId`/`schoolId` cho mình.

## Thiết kế

### Không tạo collection mới

Nguyện vọng nằm ở **một trường trên hồ sơ của chính học sinh**:
`users.pendingClassCode` — mã lớp thô, chữ hoa, tối đa 6 ký tự.

Học sinh đã được phép sửa hồ sơ của mình, nên **không cần thêm khối luật nào**.
So với một collection riêng: bớt một khối `match`, bớt một bộ luật đọc/ghi, bớt
một đường đồng bộ.

Giới hạn đã biết và chấp nhận: mỗi học sinh chỉ xin được một lớp tại một thời
điểm. Đúng với thực tế — một học sinh thuộc một lớp.

### Ai đọc đơn

Giáo viên mở màn quản lý lớp. Với mỗi lớp, hệ thống lọc trong `users` những em
có `pendingClassCode` trùng `inviteCode` của lớp đó. Luật cho phép: giáo viên
đọc được `users` (`laGiaoVien()` không phụ thuộc tài liệu nên truy vấn hợp lệ).

Mã sai không trùng lớp nào — vô hại, không cần kiểm lúc nhập. Nhờ vậy màn đăng
ký không phải tra `classes`, và phát hiện 4 tự biến mất.

### Duyệt

Giáo viên bấm Duyệt → **giáo viên** ghi hai chỗ:

1. `users/{uid}`: đặt `classId`, `schoolId`, `joinedClassId`; xoá
   `pendingClassCode`.
2. `classes/{id}`: thêm định danh em vào `studentIdentifiers`.

Cả hai đều là ghi của giáo viên, luật cho qua. Từ chối thì chỉ xoá
`pendingClassCode`.

`studentIdentifiers` vẫn là nguồn sự thật duy nhất cho sổ điểm danh — bốn chỗ
đang đọc nó (`ClassManagement`, `SchoolTab`, `TeacherPage`, `AppContext`) không
phải sửa.

### Luật `users` mới

    allow create: if dangNhap() && (
                    (request.auth.uid == userId
                     && request.resource.data.role == 'student'
                     && !('classId' in request.resource.data)
                     && !('schoolId' in request.resource.data))
                    || laGiaoVien()
                  );

    allow update: if dangNhap() && (
                    (request.auth.uid == userId
                     && !request.resource.data.diff(resource.data)
                          .affectedKeys().hasAny(['role','classId','schoolId']))
                    || (laGiaoVien()
                        && !request.resource.data.diff(resource.data)
                             .affectedKeys().hasAny(['role']))
                    || laQuanTri()
                  );

Ba vai, ba mức: học sinh sửa được tên và những thứ vô hại của chính mình; giáo
viên xếp lớp được cho học sinh nhưng **không đổi được vai**; chỉ quản trị mới
đổi vai.

Dùng `affectedKeys()` chứ không so `request.resource.data.classId ==
resource.data.classId`: phần lớn hồ sơ **không có** hai trường đó, mà đọc một
trường vắng mặt trong luật là lỗi, và lỗi thì từ chối. So sánh theo khoá bị
động chạy đúng cả khi trường vắng mặt.

## Khiếm khuyết của phép kiểm, phải vá cùng đợt

`kiem-tra:an-ninh` phép 3 rút tên trường từ luật bằng hai mẫu
`resource.data.X` và `'X' in resource.data`. Tên nằm trong
`affectedKeys().hasAny(['role','classId'])` **không khớp mẫu nào** — nên đúng
loại lỗi phép kiểm này sinh ra để bắt (gõ sai tên trường) lại lọt qua cửa mới
mở. Phải mở rộng mẫu, và phải chứng minh bằng cách cố tình bịa một tên sai.

## Cách nghiệm thu

- `npx tsc --noEmit` sạch; `npm run kiem-tra` 10/10 bộ đạt.
- Phép kiểm mở rộng: bịa `hasAny(['khongCoThatDau'])` thì phải KÊU.
- 14 phép ở Rules Playground đúng hết (11 phép cũ + 3 phép mới cho đăng ký, tạo
  hồ sơ `role: admin`, và học sinh tự đặt `classId`).
- Thử tay: học sinh đăng ký mới kèm mã → đăng nhập được; nhập mã ở Dashboard →
  báo "đã gửi, chờ duyệt"; giáo viên thấy đơn và duyệt được; sau khi duyệt, em
  hiện trong sổ lớp.

## Việc KHÔNG làm

- Không nới `classes` cho học sinh, dù chỉ một trường.
- Không tạo collection mới.
- Không đổi bốn chỗ đang đọc `studentIdentifiers`.
- Không đụng vào `progress` và `chats` — hai chỗ đó vẫn phải sạch `get()`.
