# Đặc tả — Kiểm luật Firestore bằng emulator, chạy trên CI

Ngày 13/09/2026. Chủ dự án duyệt hướng; tệp này chốt phạm vi trước khi viết mã.

## Vấn đề

Luật Firestore hiện chỉ được kiểm bằng **Rules Playground**, bấm tay từng phép
trên Firebase Console. Ba cái giá đã trả:

1. **Tốn nửa buổi cho một dấu cách.** Ngày 13/09/2026, phép thử "đồng quản trị
   ghi `role: admin`" ra ALLOWED suốt bốn lần đoán sai nguyên nhân. Gốc rễ: ô
   Build document ghi tên trường là `role␣` — thừa một dấu cách, thành một
   trường khác, nên `request.resource.data.role` vẫn là `student`, mà `student`
   nằm trong danh sách cho phép. **Luật đúng, phép thử sai.** Máy không gõ nhầm
   dấu cách; người thì có.

2. **`list` chưa từng được đo.** CLAUDE.md điều 3 ghi rõ: Playground **không mô
   phỏng được `list`**, nên khối `users` phải tách `get` và `list` mà không đo
   được trước khi publish — trong khi "sai `list` là mọi màn giáo viên/quản trị
   trắng". Emulator chạy được `list`.

3. **Không lặp lại được.** Mỗi lần sửa luật là một buổi bấm tay. Không có gì
   chặn một lần sửa vội làm hỏng đường đã đúng.

## Quyết định: chạy trên GitHub Actions, không chạy ở máy

Emulator đòi **JDK 11+**. Máy chủ dự án có Java 8 (Zulu 8 JRE 32-bit của công
ty) và **không cài được JDK mới** — winget không cài được, `JAVA_HOME` vẫn trỏ
Zulu 8. Đã đo ngày 13/09/2026.

Máy chạy của GitHub có sẵn Java. Nên:

| | Máy chủ dự án | GitHub Actions |
|---|---|---|
| `npm run kiem-tra` | phép luật **tự BỎ QUA** | chạy đủ |
| Cần cài gì | không | không |
| Khi nào biết kết quả | — | sau mỗi lần push |

Độ trễ của CI không hại, vì **chủ dự án Publish luật bằng tay**: push xong, xem
CI xanh rồi mới dán luật lên Console.

## Kiến trúc

| Tệp | Việc |
|---|---|
| `scripts/kiem-tra-luat.mts` | mới — nạp thẳng `firestore.rules`, chạy các phép |
| `firebase.json` | thêm khối `emulators.firestore` |
| `package.json` | `kiem-tra:luat`, nối vào `kiem-tra`; hai devDependency |
| `.github/workflows/kiem-luat.yml` | mới — chạy phép luật trên CI |
| `CLAUDE.md` | ghi bộ kiểm thứ 11 và điều kiện bỏ qua |

**Nạp thẳng tệp luật**, không chép, không diễn giải lại. Một bản sao của luật
trong bộ kiểm là một bản sẽ lệch.

## Cách bỏ qua khi thiếu emulator

Theo đúng lối `kiem-tra:dong-bo` đang dùng khi mất mạng: in `BỎ QUA` kèm lý do
rồi `process.exit(0)`. Không bao giờ làm đỏ `npm run kiem-tra` của một máy
không có Java.

Ba điều kiện kiểm trước khi chạy, thiếu cái nào cũng bỏ qua:
`java -version` trả về ≥ 11; gọi được `firebase`; cổng emulator rảnh.

## Các phép

Nhóm theo đúng thứ tự các điều trong CLAUDE.md để người đọc đối chiếu được.

| # | Tư cách | Việc | Phải ra |
|---|---|---|---|
| 1 | học sinh | `get` hồ sơ **của chính mình** | ĐƯỢC |
| 2 | học sinh | `get` hồ sơ người khác | CHẶN |
| 3 | học sinh | `list` toàn bộ `users` | CHẶN |
| 4 | giáo viên | `list` toàn bộ `users` | ĐƯỢC |
| 5 | học sinh | sửa `name` của mình | ĐƯỢC |
| 6 | học sinh | sửa `role` của mình | CHẶN |
| 7 | học sinh | sửa `classId` / `schoolId` / `joinedClassId` | CHẶN |
| 8 | học sinh | sửa `username` / `email` | CHẶN |
| 9 | chủ dự án | đặt `role: teacher` cho một học sinh | ĐƯỢC |
| 10 | giáo viên thường | đặt `role: teacher` cho một học sinh | CHẶN |
| 11 | đồng quản trị | đặt `role: teacher` | ĐƯỢC |
| 12 | đồng quản trị | đặt `role: admin` | CHẶN |
| 13 | đồng quản trị | hạ vai một `admin` xuống `teacher` | CHẶN |
| 14 | giáo viên thường | xoá một hồ sơ | CHẶN |
| 15 | khách | đọc `bank_questions` | ĐƯỢC |
| 16 | khách | đọc `users` / `classes` / `progress` / `chats` | CHẶN |
| 17 | giáo viên | ghi câu hỏi chứa `<script>` | CHẶN |
| 18 | giáo viên | ghi `role: 'student'` đè lên hồ sơ vốn đã `student` | ĐƯỢC |

Phép 3 và 4 là hai phép **chưa từng chạy lần nào** — Playground không làm được.

Phép 18 canh cái bẫy `affectedKeys()`: `deleteClass` ghi `{ classId: null,
role: 'student' }` cho từng học sinh, và vì giá trị không đổi nên `role` không
nằm trong `affectedKeys()`. Xoá lớp phải chạy được.

Phép 15 canh điều cấm số 2: siết `bank_questions` là đồng bộ đêm chết lặng lẽ.

## Nghiệm thu

Không tin một phép kiểm chưa bao giờ bắt được gì. Sau khi viết xong, **cố ý
phá** — sửa một dòng trong `firestore.rules` cho một phép đang CHẶN thành ĐƯỢC
— rồi chạy lại. Bộ kiểm phải kêu đúng phép đó. Trả luật về rồi chạy lại: xanh.

Ghi kết quả phép phá vào thông điệp commit.

## Việc KHÔNG làm

- **Không** dựng khung test chung (Vitest/Jest). Đây là một script `.mts` như
  mười bộ kiểm còn lại, chạy bằng `tsx`.
- **Không** tự publish luật. Chủ dự án vẫn dán lên Console và bấm Publish.
- **Không** đụng vào `firestore.rules`, trừ lúc cố ý phá để nghiệm thu — và
  phải trả về nguyên trạng.
- **Không** cài gì lên máy chủ dự án.

## Rủi ro đã biết

- `firebase-tools` là gói nặng, làm `npm ci` trên CI lâu thêm. Chấp nhận: CI
  chạy nền.
- Bộ kiểm này chỉ chứng minh **tệp trong git** đúng. Nó **không** chứng minh
  luật đang chạy trên Firebase đúng — chỉ có phép đo REST sau publish làm được
  điều đó. Hai việc khác nhau, đừng lẫn.
