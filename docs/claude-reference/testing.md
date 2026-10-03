# Tài liệu theo chủ đề — testing

> Trích nguyên văn từ CLAUDE.md người dùng cung cấp. Quy tắc/giới hạn vẫn có hiệu lực; số đo và trạng thái dịch vụ là ghi nhận lịch sử, chưa được xác minh lại. Chỉ đọc phần liên quan.

**Tra mục:** [INDEX.md](INDEX.md). **Đọc chéo khi liên quan:** [auth.md](auth.md), [security.md](security.md), [chemistry.md](chemistry.md), [ui.md](ui.md).

Các đường dẫn code trong nội dung gốc tính từ gốc repo. Cụm “mục bên dưới”, “tệp này” hoặc tên mục không kèm file là tham chiếu của bản gốc: dùng INDEX.md để tìm đúng tài liệu mới.

---

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
`kiem-tra:luat` (19 phép thử luật Firestore trên emulator; cần Java 21+ vì
firebase-tools 15 đòi vậy, nên máy nào thiếu thì tự bỏ qua — phép này chạy thật
trên GitHub Actions, xem `.github/workflows/kiem-luat.yml`. Lần chạy đầu trên
một máy, firebase tải emulator Firestore về thư mục .cache/firebase/emulators
trong thư mục người dùng).


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
| `npm run kiem-tra:e2e:giaovien` | Chỉ màn giáo viên. Cần `GIAO_VIEN_EMAIL` / `GIAO_VIEN_MATKHAU` |

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

**KHÔNG lái được GIA SƯ AI bằng Playwright trên bản đã deploy** — và đó là
App Check đang làm ĐÚNG việc của nó. Đo 21/09/2026, chạy cả headless lẫn
headed, đều hỏng như nhau:

```
POST .../exchangeRecaptchaEnterpriseToken  → 403  "App attestation failed."
GET  .../recaptcha/enterprise/clr          → net::ERR_ABORTED
POST .../gemini-3.6-flash:generateContent  → 401  "App Check token is invalid."
```

reCAPTCHA Enterprise nhận ra trình duyệt tự động và từ chối cấp token, nên
Firebase AI Logic chặn lượt gọi. Học sinh thật thì không sao; cùng câu hỏi đó
gõ trong trình duyệt thường vẫn được trả lời bình thường.

Hai hệ quả phải nhớ:

- **Trên BẢN DEPLOY, muốn chụp ảnh hội thoại thật thì PHẢI có người ngồi gõ.**
  Không có đường vòng nào ở đó, trừ khi tắt App Check — mà tắt thì mất hàng rào
  chống lạm dụng khoá Gemini.
- **Hỏng một lần là App Check khoá hồ sơ trình duyệt đó 24 GIỜ** — Console ghi
  mã lỗi appCheck rồi tới initial-throttle. Thử lại trong ngày chỉ tốn công.

**Trên MÁY DEV thì Playwright lái được** (bổ sung 24/09/2026 — câu trên trước đó
viết "không có đường vòng nào" trống trơn, và như thế là nói quá). Cơ chế:
`batAppCheck()` trong `giaSuFirebaseAI.ts:32` có nhánh chỉ chạy khi
`import.meta.env.DEV`, đặt `FIREBASE_APPCHECK_DEBUG_TOKEN`. Debug token KHÔNG đi
qua reCAPTCHA nên nó không quan tâm trình duyệt có bị lái hay không. Đây là cơ
chế chính thức của App Check, **không phải tắt App Check**.

Ba điều kèm theo, thiếu cái nào cũng hỏng:

1. **Token phải CỐ ĐỊNH và đã đăng ký.** Không có `.env.development.local` thì
   biểu thức rơi về `true`, Firebase tự sinh token ngẫu nhiên cho từng hồ sơ
   trình duyệt — mà Playwright tạo hồ sơ mới mỗi lượt chạy, nên vẫn 403. Đăng ký
   ở Firebase Console → App Check → Manage debug tokens, rồi đặt
   `VITE_APPCHECK_DEBUG_TOKEN` vào `.env.development.local` (`.gitignore` đã chặn
   `.env*`). Bước này chỉ chủ dự án làm được.
2. **Ảnh ra từ máy dev KHÔNG được chú thích là "chụp trên trang đã deploy".**
   Cùng mã, cùng Gemini thật, cùng tài khoản thật, cùng Firestore thật — nhưng
   địa chỉ là `localhost`. Nói khác đi là sai sự thật trong một báo cáo khoa học.
3. **Đừng chạy phép đó với `E2E_URL` trỏ bản deploy.** Nó sẽ hỏng VÀ khoá hồ sơ
   trình duyệt 24 giờ. Rẻ hơn là cho phép thử tự `skip` khi `baseURL` không phải
   localhost, thay vì trông vào trí nhớ.

Và nhớ `HAN_CHO_MS = 90_000` trong `giaSuFirebaseAI.ts`, trong khi
`playwright.config.ts` đặt `timeout: 60_000` và `expect.timeout: 15_000` — không
nới riêng cho phép thử này thì nó trượt vì hết giờ chứ không phải vì web sai.

Và một cái bẫy khi viết phép thử cho vùng này: nhánh hỏng của gia sư hiện câu
"Gia sư AI đang tạm mất kết nối với máy chủ" chứ không ném lỗi. Phép thử nào
chỉ canh "AI không đưa đáp án" sẽ báo ĐẠT ngay cả khi AI không hề trả lời —
đã dính đúng lần đầu. Canh AI THẬT SỰ TRẢ LỜI TRƯỚC, rồi mới canh nội dung.

**Ba "lỗi" của bộ `giaovien` ghi ngày 22/09/2026 là MỘT lỗi của phép thử,
che một lỗi thật của web** (đo lại 23/09/2026). Ba điều từng ghi ở đây —
"gõ mật khẩu xong giáo viên vẫn bị hỏi Tiếp tục với ...", "màn giáo viên báo
0 Lớp học kèm permission-denied", và "trong Playwright Firebase Auth không lưu
phiên xuống đĩa" — đều SAI, và cùng một gốc: `dangNhapGiaoVien()` và
`dang-nhap-vao-thang.spec.ts` **không bấm thẻ "Giáo viên"**. Thẻ mặc định là
Học sinh, nên `LoginForm` thấy sai vai và đăng xuất ngay.

Đối chứng, cùng tài khoản, cùng máy: bấm đúng thẻ thì vào thẳng `/teacher`
sau khoảng 3 giây, không một lỗi quyền nào, IndexedDB có 1 bản ghi phiên, F5
xong hiện "Tiếp tục với ..." đúng đặc tả. Bài học số 4 và số 9 cùng lúc: kết
luận của lần trước đi từ triệu chứng thẳng tới một cơ chế nghe hợp lý (cuộc
đua trong `LoginPage`, token về chậm), mà chưa lần nào đối chứng với một lượt
chạy đúng.

**Lỗi thật mà nó che, đã vá:** chọn nhầm thẻ thì `LoginForm` gọi `logout()`,
nhưng lượt `onAuthStateChanged` của lần đăng nhập vẫn đang chờ đọc hồ sơ và
tiến độ. Lượt đăng xuất đặt `currentUser = null` xong, lượt cũ chạy tiếp tới
`persistSession` và **đặt lại người vừa bị đăng xuất**: màn "Tiếp tục với ..."
hiện ra với một phiên đã chết, bấm vào là "0 Lớp học" kèm hàng loạt
permission-denied. Đo: lỗi sai vai ở 2659 ms, `currentUser` bị đặt lại ở
3108 ms. Người dùng thật gặp được, vì giáo viên quên đổi thẻ là chuyện thường.
Vá bằng `conHieuLuc()` trong `AppContext`: sau MỖI nhịp `await` hỏi lại phiên
Auth còn là người này không, không thì dừng. Phép thứ hai trong
`dang-nhap-vao-thang.spec.ts` canh cho nó không quay lại.

Phần đã làm hôm 23/09 vẫn giữ vì vẫn đúng khi mạng chập chờn:
`getClassesHoacLoi()` trả kèm mã lỗi, `AppContext` thử lại một lần sau 800ms,
và màn giáo viên phân biệt "chưa có lớp" với "không tải được danh sách lớp".

Bộ `giaovien` vẫn để mỗi phép tự đăng nhập, không dùng `storageState` — lối
đó chạy được nên không đổi. Nếu muốn nhanh hơn thì chuyển sang `storageState`
như bộ `hocsinh`; lý do cũ để không làm vậy đã không còn.

Phép `giao-de.spec.ts` **GHI DỮ LIỆU THẬT**: nó tạo một đề tên `[E2E] …` cho
lớp thật rồi xoá ở cuối. Chết giữa chừng thì đề đó còn sót — xoá tay trong bảng
"Đề đã giao"; bài đã nộp không mất theo.


Sinh lại dữ liệu — đọc `scripts/README.md` trước khi dùng:
`soan` (từ tệp .docx sang `constants.ts`), `xuat:ngan-hang` (Firestore sang repo),
`gan:cau-hoi`, `sinh:ran-thang`, `nhung:ran-thang`, `word`, `phan-tich`, `do-chi-phi`,
`thu:ai`.


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

