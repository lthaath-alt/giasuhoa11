# Đợt 2 — Siết `firestore.rules` theo vai trò

**Ngày chốt:** 10/09/2026
**Tiền đề:** đợt 1 (Firebase Auth) đã xong — xem
`docs/superpowers/plans/2026-09-10-firebase-auth-dot-1.md`.

## Vì sao có đợt này

Đợt 1 dựng được **danh tính**: `request.auth` không còn null, và id tài liệu
`users` bằng `uid` của Auth nên luật `get()` được vai trò. Nhưng luật vẫn để
mọi collection `allow write: if true`, và mọi collection đọc công khai.

Hai lỗ hổng đo được trên dữ liệu thật ngày 10/09/2026:

1. **Ai có địa chỉ web cũng ghi/xoá được mọi thứ** — kể cả xoá sạch 252 câu hỏi.
2. **Ai có địa chỉ web cũng TẢI VỀ được** danh sách toàn bộ người dùng (họ tên,
   email, vai trò, trường) và **toàn bộ hội thoại của học sinh với gia sư AI**.
   Đây là dữ liệu cá nhân của trẻ vị thành niên.

Lỗ hổng thứ hai không được nhắc tới khi lập kế hoạch đợt 1; nó lộ ra khi khảo
sát cho đợt 2.

## Quyết định đã chốt

| Câu hỏi | Chốt |
|---|---|
| Siết tới mức nào | **Mức 2 — theo vai trò**. Không làm mức 3 (giáo viên chỉ sửa lớp mình, admin trường chỉ trong trường mình): quy mô hiện tại 4 giáo viên / 3 lớp, chưa đáng. |
| Có siết quyền ĐỌC không | **Có, nhưng chỉ dữ liệu cá nhân** (`users`, `classes`, `chats`, `progress`). Nội dung học giữ đọc công khai. |
| Học sinh vào lớp bằng mã | **Cho người đã đăng nhập đọc `classes`**. Giữ chức năng nguyên vẹn, không sửa mã. |
| Giáo viên đọc chat học sinh | Được. |
| Giáo viên sửa ngân hàng câu hỏi | Được. |

## Ràng buộc — đo trên hệ thống thật, không suy đoán

- **`bank_questions` PHẢI giữ đọc công khai.** Workflow đồng bộ đêm
  (`.github/workflows/dong-bo-ngan-hang.yml` → `npm run xuat:ngan-hang`) đọc
  Firestore **không đăng nhập**, chỉ bằng khoá web. Siết là đồng bộ chết.
- **Trò chơi không bị ảnh hưởng** — chúng đọc bản chụp `public/bank/ngan-hang.json`,
  không gọi thẳng Firestore.
- **Chế độ khách ("Dùng Thử") không ghi Firestore** — không cần ngoại lệ.
- **Gói Spark ($0)** — không dùng được Cloud Functions, nên **không có custom
  claims**. Vai trò phải tra bằng `get()`, mà mỗi `get()` trong luật **bị tính
  là một lượt đọc có tính tiền**.
- **Mọi thao tác ghi đi qua một cửa**: `core/services/firestoreService.ts` và
  `features/bank/bankStore.ts`.

## Kiến trúc luật

### Ba hàm trợ giúp, và vì sao chia làm hai loại

```
dangNhap()   = request.auth != null
email()      = request.auth.token.email      ← có sẵn trong token: MIỄN PHÍ
vaiTro()     = get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role
                                             ← TỐN một lượt đọc
laGiaoVien() = vaiTro() in ['teacher','school_admin','admin']
laQuanTri()  = vaiTro() in ['school_admin','admin']
```

**Nguyên tắc quan trọng nhất của thiết kế này: đường ghi NHIỀU không được dùng
`get()`.** Học sinh ghi `progress` và `chats` liên tục trong lúc học; nếu mỗi
lần ghi tốn thêm một lượt đọc để tra vai trò thì hạn mức 50.000 lượt/ngày của
gói Spark tiêu rất nhanh. May là quyền sở hữu ở hai chỗ đó kiểm được bằng
`email()` — miễn phí. `get()` chỉ dùng cho các đường ghi HIẾM: giáo viên soạn
câu hỏi, quản trị sửa cấu hình.

### Nhóm 1 — Nội dung học: đọc công khai, ghi theo vai

| Collection | Đọc | Ghi |
|---|---|---|
| `bank_questions` | công khai | `laGiaoVien()` **và** nội dung sạch (giữ nguyên `cauHoiSach()` của đợt 1) |
| `questions` | công khai | như trên (hiện rỗng) |
| `curriculum_chapters` | công khai | `laGiaoVien()` |
| `exams` | công khai | `laGiaoVien()` |
| `equations` | công khai | `laGiaoVien()` |
| `matrix_resources` | công khai | `laGiaoVien()` |
| `system_settings` | công khai | `laQuanTri()` |
| `schools` | công khai | `laQuanTri()` |

### Nhóm 2 — Dữ liệu người: phải đăng nhập

| Collection | Đọc | Ghi |
|---|---|---|
| `progress` | id tài liệu **chính là email** → `email() == userId`, hoặc `laGiaoVien()` | như đọc |
| `chats` | `email() == resource.data.userEmail`, hoặc `laGiaoVien()` | `email() == request.resource.data.userEmail` |
| `classes` | `dangNhap()` | `laGiaoVien()` |
| `users` | `request.auth.uid == userId`, hoặc `laGiaoVien()` | xem dưới |

### Luật `users` — chỗ tinh tế nhất

Người dùng phải tự sửa được hồ sơ mình (đổi tên), nhưng **không được tự đổi
`role`**. Không chặn thì một học sinh mở console trình duyệt là tự phong mình
làm `admin`, và toàn bộ đợt này thành vô nghĩa.

```
allow update: if (request.auth.uid == userId
                  && request.resource.data.role == resource.data.role)
              || laQuanTri();
```

Tạo mới (`create`) phải cho phép **hai** trường hợp, không phải một:

```
allow create: if (request.auth.uid == userId)   // tự đăng ký
              || laGiaoVien();                  // admin/giáo viên tạo hộ
```

Vế thứ hai bắt buộc phải có, và đây là chỗ dễ bỏ sót nhất của cả đợt. Khi admin
tạo tài khoản hộ giáo viên, `createAccountWithFirestore` tạo tài khoản Auth trên
Firebase App **PHỤ** (để không mất phiên admin — xem `taoAuthPhu()`), nhưng ghi
hồ sơ bằng `db` của app **CHÍNH**. Lúc ghi, `request.auth.uid` là **admin**, còn
`userId` là uid của người vừa tạo — hai giá trị khác nhau. Chỉ viết vế đầu là
chặn đúng `createTeacher` / `createSchoolAdmin` / `createStudent`, tức ba chức
năng vừa sửa ở đợt 1.

Ngược lại, lúc người dùng **tự đăng ký** thì tài khoản được tạo trên app chính
nên họ đăng nhập luôn, và `request.auth.uid == userId` đúng.

### Truy vấn phải có ràng buộc — đã kiểm

Luật Firestore chỉ cho phép một truy vấn khi nó **chứng minh được** mọi tài liệu
trả về đều hợp lệ. Hai chỗ đọc dữ liệu cá nhân đều đã đúng dạng:

- `getUserProgress`: `getDoc(doc(db, 'progress', email))` — lấy một tài liệu
  theo id, id chính là email.
- `getChatsByUserLesson`: `query(where('userEmail','==',…), where('lessonId','==',…))`
  — có ràng buộc trên đúng trường mà luật kiểm.

## Thay đổi phía ứng dụng

Chỉ **2 trong 9** collection đang tải lúc mở trang phải dời xuống sau đăng nhập:

```
init()  giữ:  schools, questions, exams, equations,
              matrix_resources, curriculum_chapters, system_settings

effect onAuthStateChanged  thêm:  users, classes
```

Đã kiểm: `users` chỉ được dùng ở `AdminPage`, `SchoolAdminPage`, `TeacherPage`,
`ErrorManagement`, `SchoolDialogs`; `classes` chỉ ở `StudentArea`, `AdminPage`,
`SchoolAdminPage`. **Trang công khai `DashboardPage` không đụng tới cả hai.**
Lúc chưa đăng nhập chúng là mảng rỗng và không ai đọc.

## Cách kiểm — ba tầng, rẻ trước

Luật sai không làm app vỡ. Nó làm app **lưu không được mà không báo gì**, rải
rác ở những chỗ ít ai bấm tới. Nên phải kiểm ở cả ba tầng.

**Tầng 1 — phép kiểm tĩnh**, thêm vào `scripts/kiem-tra-an-ninh.mts`:

- `firestore.rules` không còn dòng `allow write: if true` nào.
- Mọi collection mà mã nguồn có ghi đều có mục `match` tương ứng — bắt được
  trường hợp thêm collection mới mà quên viết luật.
- Tên trường luật nhắc tới (`userEmail`, `teacherEmail`, `role`) phải thật sự
  tồn tại trong Firestore. **Đây chính là cái bẫy đã sập ở đợt 1**: luật nhắm
  `content`/`explanation`/`options` trong khi dữ liệu thật là `q`/`e`/`o`, nên
  luật cho qua mọi tải trọng mà vẫn "đạt" mọi phép thử.

**Tầng 2 — Rules Playground**, chạy trước khi Publish:

| Ai | Làm gì | Phải ra |
|---|---|---|
| chưa đăng nhập | đọc `bank_questions` | ✅ (đồng bộ đêm sống nhờ dòng này) |
| chưa đăng nhập | đọc `users` | ❌ |
| chưa đăng nhập | ghi `bank_questions` | ❌ |
| học sinh | đọc `progress/<email mình>` | ✅ |
| học sinh | đọc `progress/<email bạn>` | ❌ |
| học sinh | ghi `bank_questions` | ❌ |
| học sinh | tự đổi `role` thành `admin` | ❌ |
| giáo viên | ghi `bank_questions` sạch | ✅ |
| giáo viên | ghi câu chứa `<img onerror=…>` | ❌ |
| giáo viên | **tạo `users/<uid người khác>`** | ✅ (đường admin tạo tài khoản hộ) |
| học sinh | tạo `users/<uid người khác>` | ❌ |

**Tầng 3 — thử tay trên app** bằng cả ba vai (học sinh, giáo viên, admin), mỗi
vai làm đúng việc vai đó hay làm. Đây là tầng duy nhất bắt được lỗi "lưu im
lặng".

## Thứ tự triển khai — không được đảo

```
1  sửa AppContext (dời users/classes xuống sau đăng nhập)
2  build + deploy lên Netlify, XÁC NHẬN bản mới đã chạy
3  publish luật mới
```

Làm ngược thì bản đang chạy trên Netlify vẫn tải `users` lúc mở trang, luật mới
chặn, và **mọi người thấy trang trắng**.

## Đường lùi

Firebase Console giữ lịch sử luật → Restore, có hiệu lực trong vài giây. Bản
đang chạy sẽ được chép ra tệp trước khi publish, như đợt 1.

## Ngoài phạm vi

- **Mức 3** (giáo viên chỉ sửa lớp mình, admin trường chỉ trong trường mình).
- **Custom claims** — cần Blaze.
- **Email học sinh vẫn lộ cho học sinh khác** qua `classes.studentIdentifiers`,
  hệ quả đã biết của quyết định "người đăng nhập đọc được `classes`". Muốn kín
  hơn thì tách `class_codes` ra collection riêng — đã cân nhắc và hoãn.
- **`users` vẫn cho `laGiaoVien()` đọc toàn bộ** — giáo viên thấy được cả học
  sinh trường khác. Siết chặt hơn là việc của mức 3.
