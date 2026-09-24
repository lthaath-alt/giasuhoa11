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

