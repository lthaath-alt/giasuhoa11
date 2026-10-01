# Tài liệu theo chủ đề — security

> Trích nguyên văn từ CLAUDE.md người dùng cung cấp. Quy tắc/giới hạn vẫn có hiệu lực; số đo và trạng thái dịch vụ là ghi nhận lịch sử, chưa được xác minh lại. Chỉ đọc phần liên quan.

**Tra mục:** [INDEX.md](INDEX.md). **Đọc chéo khi liên quan:** [auth.md](auth.md), [data.md](data.md), [deployment.md](deployment.md), [chemistry.md](chemistry.md), [product-decisions.md](product-decisions.md), [testing.md](testing.md).

Các đường dẫn code trong nội dung gốc tính từ gốc repo. Cụm “mục bên dưới”, “tệp này” hoặc tên mục không kèm file là tham chiếu của bản gốc: dùng INDEX.md để tìm đúng tài liệu mới.

**Ghi chú đối chiếu:** “Bốn hàng rào” trong bản gốc liệt kê năm mục: giữ đủ cả năm. Câu “sáu thẻ” liệt kê tám tên thẻ: không tự sửa whitelist theo con số, kiểm locHtml.ts. Mô tả cũ chỉ chủ dự án đổi vai phải đọc cùng phần ngoại lệ đồng quản trị; không suy ra có thể bỏ nhánh phân quyền nào. Ghi chú khách 25 lượt là lịch sử; product-decisions.md ghi thay đổi còn 5 lượt và yêu cầu dùng TRAN_LUOT_KHACH.

---

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
3. **Vite KHÔNG đọc `_headers`** — đó là tính năng của nền tảng phát hành (nay là Cloudflare Pages). Nên mọi lượt
   "đã thử CSP ở máy dev" đều không thật: `X-Frame-Options` chỉ tồn tại ở dạng
   header, và `frame-ancestors` bị bỏ qua khi đặt trong thẻ `<meta>`. Muốn thử
   thật thì phải phục vụ `dist/` bằng một máy chủ có áp `_headers`, hoặc deploy
   bản nháp. Đây là lý do gốc khiến hai cái bẫy trên lọt.

**(Lịch sử, chỉ đúng khi còn chạy trên Netlify — web đã chuyển hẳn sang
Cloudflare Pages ngày 26/09/2026.)** **Một lỗi CSP trong Console là BÌNH THƯỜNG, đừng đi chữa.** Bản Netlify miễn
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

Khi thêm một collection MỚI: `npm run do:luat` hỏi thẳng Firebase xem luật của
nó đã publish chưa (CHỈ ĐỌC, cần `.env.local`). Tệp `firestore.rules` trong git
chỉ là bản thảo, nên `kiem-tra:luat` xanh **không** có nghĩa là luật đang chạy đã
đúng — hai việc khác nhau. Xem `do-luat-dang-chay.mts`.

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
- **Xoay vòng model (01/10/2026).** Mọi model trong chuỗi đi CÙNG đường AI Logic,
  cùng thẻ App Check — không thêm khoá, không thêm tên miền CSP. `localStorage`
  khoá `h11_mo_hinh_het` chỉ chứa tên model và ngày, không có gì của học sinh.
  Khoá riêng của em vẫn chỉ dùng khi mọi model chung đã hết lượt NGÀY.
- **CSP phải cho phép reCAPTCHA** (`https://www.google.com/recaptcha/`,
  `https://www.gstatic.com/recaptcha/`, `https://recaptcha.google.com/recaptcha/`) — thiếu thì
  gia sư chết trên web thật mà máy dev vẫn chạy.

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

