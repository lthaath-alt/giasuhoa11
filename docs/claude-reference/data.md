# Tài liệu theo chủ đề — data

> Trích nguyên văn từ CLAUDE.md người dùng cung cấp. Quy tắc/giới hạn vẫn có hiệu lực; số đo và trạng thái dịch vụ là ghi nhận lịch sử, chưa được xác minh lại. Chỉ đọc phần liên quan.

**Tra mục:** [INDEX.md](INDEX.md). **Đọc chéo khi liên quan:** [security.md](security.md), [chemistry.md](chemistry.md), [testing.md](testing.md), [product-decisions.md](product-decisions.md).

Các đường dẫn code trong nội dung gốc tính từ gốc repo. Cụm “mục bên dưới”, “tệp này” hoặc tên mục không kèm file là tham chiếu của bản gốc: dùng INDEX.md để tìm đúng tài liệu mới.

---

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


### Đề giáo viên GIAO nằm ở `de_giao/{id}`

Thêm 22/09/2026 — chiều NGƯỢC của `bai_nop`: đề đi từ máy giáo viên tới máy
học sinh. Trước đó mọi đề chỉ sinh ra khi chính học sinh bấm trong màn học, nên
giáo viên không có đường nào giao một đề chung cho cả lớp.

Luồng đầy đủ, ba bước, KHÔNG có đường chấm điểm thứ hai:

1. **Giáo viên**: mục "Theo dõi học sinh" → thẻ **Giao đề kiểm tra**
   (`features/teacher/components/GiaoDeTab.tsx`). Chọn chương/bài, bấm "Lấy câu
   từ ngân hàng" (`getByLesson` hoặc `getByChapter` — **không bao giờ**
   `getAll()`), đặt số phút và hạn nộp, bấm Giao. Nhận lại một đoạn thông báo
   kèm link `#/de/<id>` để dán vào nhóm lớp.
2. **Học sinh**: mở link → `pages/DeGiaoPage.tsx`. Trang này **cố ý không hiện
   câu hỏi nào**, chỉ nói đề gì / lớp nào / bao lâu / hạn khi nào. Bấm "Bắt đầu
   làm bài" thì `taoBaiLam` dựng một `Quiz` rồi đẩy sang `/quiz/<id>`.
   Đề cũng hiện lại trong tab "Bài tập GV giao" (`DeCoGiaoList.tsx`) cho em nào
   mất link.
3. **Nộp**: đi đúng `QuizPage` + `bai_nop` đã có từ trước. Giáo viên xem điểm ở
   thẻ "Bài kiểm tra và chấm tự luận" như mọi bài khác.

Bảy điều phải biết:

1. **Đề mang NGUYÊN câu hỏi, không mang danh sách id.** Câu trong
   `bank_questions` sửa được bất cứ lúc nào, mà đề đã giao thì phải đứng yên —
   cả lớp làm đúng một đề, và cô chấm lại sau một tháng vẫn thấy đúng đề đó.
2. **Mã bài làm suy ra được**: `dg_<mã đề>_<email đã lọc>` (`maBaiLam`). Nhờ vậy
   mở lại link giữa chừng là gặp lại bài đang làm dở, và mỗi em chỉ có MỘT dòng
   điểm cho mỗi đề. Sinh mã ngẫu nhiên là hỏng cả hai.
3. **`lessonId` của bài mang tiền tố `de-giao:`**, không trùng bài nào trong
   chương trình. Hai chỗ dựa vào đúng tính chất đó: `QuizPage` khoá bài kiểm tra
   khi bài học trước chưa xong (trùng mã bài thật là em bị chặn khỏi chính bài
   cô giao), và chỗ đánh dấu bài học hoàn thành khi đạt 7/10.
4. **Hết giờ lấy mốc SỚM HƠN** giữa "bắt đầu + số phút" và hạn nộp của đề
   (`hetGioLuc`). Bỏ vế thứ hai là em mở link lúc 23h50 vẫn có trọn 45 phút.
5. **GIỚI HẠN ĐÃ BIẾT: đáp án nằm trong tài liệu học sinh đọc được.** Cùng gốc
   với giới hạn số 4 của `bai_nop` — chấm điểm chạy trên trình duyệt của em nên
   đáp án bắt buộc phải tới máy em. Siết luật không chữa được; chữa thật là chấm
   lại ở máy chủ (Cloud Function, gói Blaze). Đừng vá bằng cách giấu đáp án.
6. **Có một đề DỰNG SẴN 10 câu** ở `features/quiz/deMauCanBang.ts` — đề giấy của
   giáo viên, gõ tay từ ảnh chụp ngày 22/09/2026, chủ đề Cân bằng hoá học. Nút
   "Đề mẫu 10 câu" trong `GiaoDeTab` nạp thẳng bộ này, **không đọc Firestore**.
   Cố ý KHÔNG nạp vào `bank_questions`: ghi ngân hàng là sửa dữ liệu thật của
   1.554 câu, và quy trình bắt chủ dự án tự làm việc đó. Hai đáp án dễ chấm
   nhầm đã ghi lý do ngay trong chú thích đầu tệp (câu 7 là *giảm áp suất* chứ
   không phải giảm nhiệt độ; câu 10 là *0,1 M* chứ không phải 0,534 M — Kc đòi
   0,534 mol CO₂ trong 1 L mà cả bình chỉ có 0,1 mol CaCO₃).
7. **Câu có phương án "Tất cả đều đúng" / "cả A và B" KHÔNG được xáo.**
   `coPhuongAnNeo` trong `features/bank/xaoDapAn.ts` chặn cả hai hàm xáo
   (`xaoPhuongAnWeb` cho Đề kiểm tra, `xaoPhuongAnBank` cho Luyện tập và trò
   chơi). Xáo lên thì phương án A hoá ra "Tất cả đều sai", hoặc "cả A và B" trỏ
   vào chính nó — câu hỏi thành vô nghĩa mà điểm vẫn ra một con số hợp lý. Đo
   22/09/2026: **12 trong 1.554 câu** của ngân hàng dính mẫu này. Cái giá phải
   trả là 12 câu đó giữ nguyên thế lệch đáp án; chữa tận gốc là viết lại nội
   dung chúng, việc của người soạn đề.

Phép canh: `kiem-tra:de-giao` (logic thuần — trạng thái đề, mã bài, hết giờ, và
đối chiếu trường của bài nộp với `hasOnly` trong `firestore.rules`);
`kiem-tra:luat` có 12 phép (22a–22l) cho collection này.

### Chat với gia sư AI lưu ở `chats/{id}`

Không có mục riêng ở đây cho toàn bộ collection này — trường telemetry
`model_name`, `nha_cung_cap`, `duong` mô tả ở bảng AI trong
`docs/claude-reference/project.md`. Trường mới cùng tài liệu `chats`:

- **`y_dinh`, `y_dinh_xs`, `y_dinh_phien_ban` (02/10/2026)** — chỉ ở tin của EM: nhãn ý
  định do bộ phân loại logistic nhóm tự huấn luyện đoán, CHẠY BÓNG (không đổi hành vi
  gia sư). Mô hình là tệp JSON trong thư mục mo-hinh của public; chưa có tệp thì ba
  trường trống. Cách gán nhãn và huấn luyện: `scripts/phan-loai/README.md`.
- **"Ẩn khỏi màn hình" thay cho "Xóa lịch sử chat" (03/10/2026)** — nút cũ trong
  TutorChat gọi `clearLessonChats`, xóa thật tài liệu `chats`, tức xóa cả số liệu đề
  tài. Nay giao diện học sinh không còn đường nào gọi hàm đó: nút mới chỉ ghi một mốc
  thời gian vào localStorage (khoá `h11_an_chat:<uid>:<lessonId>`, không chứa email),
  tin tới mốc không hiện và không gửi làm ngữ cảnh cho gia sư; "Hiện lại" xóa mốc. Mốc
  chỉ ở máy đó. Xem `src/features/tutor/services/anTinCu.ts`.
- **Tin nhắn thật làm dữ liệu huấn luyện (03/10/2026)** — chủ dự án báo chủ nhiệm đề tài
  cho phép và phụ huynh lớp 11A3 đồng ý. Từ 04/10/2026 lấy thêm câu tài khoản giáo viên/quản trị
  gửi gia sư (nguồn `that-gv`, không vào tập kiểm). Cũng từ 04/10/2026 bộ nhãn có thêm `xin_de` (xin
  bài để tự luyện; 7 nhãn), mô hình học nó khi đủ 5 câu. `npm run phan-loai:hang-ngay` mỗi đêm làm
  bảng Excel gửi mail cho chủ dự án (`scripts/phan-loai/hang_ngay.py`). Mỗi đợt hai lệnh: `npm run phan-loai:xuat`, người gán
  nhãn, rồi `npm run phan-loai:huan-luyen -- <thư mục đợt>` (`scripts/phan-loai/nap_dot.py`).
  Đường lấy câu duy nhất: `npm run xuat:cau-hoi -- --lop 11A3`
  (`scripts/phan-loai/xuat-cau-hoi.mts`, CHỈ ĐỌC, vai giáo viên). Ra câu đã che, không
  email/mã/giờ, vào thư mục con "that" của `scripts/phan-loai/du-lieu/` (bị `.gitignore`
  chặn, chỉ có sau lần xuất đầu tiên). Lớp khác phải
  thêm vào hằng `DONG_Y` trong script sau khi có đồng ý. `y_dinh` vẫn KHÔNG dùng làm nhãn
  hay để đánh giá học sinh; nhãn do hai người gán. Quy trình: `scripts/phan-loai/README.md` bước 2b.



### `npm run gan:so-thu-tu` — gán số báo danh từ danh sách lớp

Thêm 23/09/2026. Danh sách lớp của nhà trường có một thứ tự do người xếp,
**không suy ra được bằng quy tắc chữ nghĩa nào**: sổ 11A3 để "Nguyễn Hoàng
Thanh An" số 1 và "Nguyễn Bảo Ân" số 5, giữa hai em có ba em tên Anh/Ánh.
`hocSinhCuaLop` xếp theo `studentNumber`, mà đo hôm đó **0/38 em có số** — nên
mọi bảng đều rơi về thứ tự Firestore trả, tức ngẫu nhiên với người đọc.

```bash
npm run gan:so-thu-tu -- "C:\duong\dan\danh-sach-11A3.csv"          # chạy thử
npm run gan:so-thu-tu -- "C:\duong\dan\danh-sach-11A3.csv" --that   # ghi thật
```

Năm cái trói, cùng lối với `sua:cau-hoi`:

1. **Chỉ ghi ĐÚNG MỘT trường `studentNumber`.** Luật cho `laGiaoVien()` sửa hồ
   sơ học sinh trừ `role`, nên vai `teacher` là đủ.
2. **Mặc định KHÔNG ghi**, phải thêm `--that`.
3. **KHÔNG đọc cột mật khẩu.** Sổ của trường hay có cột "Pass"; script chỉ lấy
   ba cột STT / Họ tên / Gmail.
4. **Khớp bằng EMAIL**, không khớp bằng tên — hai em trùng tên là chuyện thường.
5. **Báo cáo từng dòng không khớp** thay vì im lặng bỏ qua.

Tự tìm dòng tiêu đề (sổ hay có một dòng tên bảng ở trên cùng) và tự hiểu ô bọc
nháy kép — `split(',')` trần gặp một ô có phẩy là lệch TOÀN BỘ cột sau nó, tức
gán nhầm số cho cả lớp.

Ghi xong nó **đọc lại Firestore để xác nhận** — bài học số 1.

Lượt chạy đầu (23/09/2026): 39 dòng trong sổ, ghi được 35, **4 em không có tài
khoản**. Một trong bốn là lỗi gõ trong sổ: email STT 18 thừa một chữ `i` ở cuối
(`…@gmail.comi`). Ba em còn lại chưa từng tạo tài khoản.

**Tệp CSV chứa email học sinh — để ngoài repo, đừng commit.**

