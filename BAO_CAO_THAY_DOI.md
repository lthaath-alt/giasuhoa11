# Báo cáo thay đổi — đợt P0 trước kỳ thi Khoa học kỹ thuật cấp trường

**Nhánh:** `p0-truoc-thi` · **Bắt đầu:** 22/09/2026 · **Hạn:** 28/09/2026
**Chưa merge vào `main`, chưa deploy.** Site đang chạy (`giasuhoa11.pages.dev`) vẫn là bản cũ.

Tệp này viết cho Sổ nhật ký nghiên cứu. Mỗi mục ghi đủ năm phần theo yêu cầu: trạng thái,
hiện trạng trước khi sửa, đã sửa gì, cách kiểm chứng, ngày thực hiện.

## Bảng tổng

| Mục | Trạng thái | Ngày |
|---|---|---|
| Sao lưu Firestore trước khi sửa | Xong | 22/09 |
| P0-1 Kiểm chứng temperature và topP | Xong | 22/09 |
| P0-2 Bộ chặn rò đáp số | Xong (có giới hạn, xem bên dưới) | 22/09 |
| P0-3 Chống khai thác nấc câu hỏi có/không | Xong | 22/09 |
| P0-4 Bộ kiểm thử tấn công | Dựng xong, chạy 86 lượt qua Antigravity; **chưa** chạy qua API thật | 22/09 |
| P0-5 Xuất dữ liệu nghiên cứu | Xong, chưa chạy trên dữ liệu thật | 22/09 |
| P0-6 Gỡ nhãn ẩn an toàn | Xong | 22/09 |

---

## Việc 0 — Sao lưu Firestore (nguyên tắc 1)

**Trạng thái:** Xong.

**Hiện trạng trước:** không có bản sao nào của dữ liệu thực nghiệm. Mọi thay đổi đều không
có đường lùi.

**Đã làm:** thêm `npm run sao-luu` (`scripts/sao-luu-firestore.mts`). Script CHỈ ĐỌC — không
có một lệnh ghi Firestore nào, và `kiem-tra:an-ninh` có phép kiểm canh điều đó. Đăng nhập
bằng `GIAO_VIEN_EMAIL` trong `.env.local`, ghi từng collection ra JSON kèm `README.txt`.

**Kiểm chứng:** chạy thật lúc 17:25 ngày 22/09. Lấy được 13/15 collection:

| Collection | Số tài liệu |
|---|---|
| `bank_questions` | 1.554 |
| `users` | 43 |
| `chats` | 225 |
| `progress` | 19 |
| `bai_nop` | 4 |
| `classes` / `schools` / `system_settings` | 1 / 2 / 1 |

Script tự đọc lại từ đĩa để đối chiếu: 13/13 khớp số lượng. Hai collection không lấy được là
`quan_tri` và `gioi_han_chat`, cả hai trả `permission-denied` **đúng theo luật** (một cái chỉ
chủ dự án đọc, một cái chỉ cho đọc bản ghi của chính mình) và không chứa dữ liệu thực nghiệm.

Thư mục `sao-luu/` nằm trong `.gitignore` vì chứa email và toàn bộ hội thoại học sinh.

**Ngày:** 22/09/2026. Commit `a30192d`.

---

## P0-1 — Kiểm chứng temperature và topP

**Trạng thái:** Xong. Kết quả **ngược với tài liệu Google**, và tìm ra một câu sai trong tài
liệu của nhóm.

**Hiện trạng trước:** mã gửi `temperature: 0,3` và `topP: 0,85` ở cả ba đường gọi
(`giaSuFirebaseAI.ts`, `giaSuKeyRieng.ts`, `geminiTutorService.ts`), trong khi tài liệu Google
Cloud nói `gemini-3.6-flash` không nhận giá trị tuỳ chỉnh. Không ai đo.

**Đã làm:** viết `scripts/do-tham-so-sinh.mts`, ba phép đo, 8 lượt gọi REST thật.

**Kiểm chứng và kết quả:**

| Phép | Kết quả |
|---|---|
| Gửi `temperature: 99` | **HTTP 400** — `temperature must be in the range [0.0, 2.0]` |
| Siêu dữ liệu model | Khai `temperature: 1`, `topP: 0.95`, `topK: 64`, `maxTemperature: 2` |
| 3 lượt ở `temperature: 0`, cùng câu hỏi | **Ba câu trả lời khác nhau**: 254 / 394 / 359 ký tự |

Hai kết luận:

1. **Tham số KHÔNG bị bỏ qua** — API đọc và kiểm miền giá trị. Vì vậy **giữ nguyên** 0,3 / 0,85
   trong mã. Mô tả trong tài liệu Google Cloud không khớp hành vi đo được ngày 22/09/2026.
2. **Nhưng phải sửa slide.** Chú thích cũ trong `promptSuPham.ts` viết rằng hạ xuống 0,3 / 0,85
   để câu trả lời "tái lập được" — vế đó **sai**: ngay ở nhiệt độ 0, model vẫn không tất định
   (metadata khai `"thinking": true`). Câu nói đúng trước hội đồng: *hạ nhiệt độ để giảm độ tản
   mạn của câu trả lời; model này không tất định kể cả ở nhiệt độ 0, nên mỗi phép đo đều được
   chạy lại nhiều lượt.* Chú thích trong mã đã sửa cho khớp.

Báo cáo đầy đủ kèm request/response thô: `docs/P0-1-tham-so-sinh.md` và `docs/P0-1-do-tho.json`.

**Hai giới hạn:** phép đo đi qua REST + khoá API, còn bản chạy thật đi qua Firebase AI Logic và
có thêm `thinkingLevel: LOW`. Một lượt trả HTTP 503 nên cỡ mẫu phép so sánh là 5 chứ không phải 6.

**Ngày:** 22/09/2026. Commit `72e8c64`.

---

## P0-2 — Bộ chặn rò đáp số

**Trạng thái:** Xong, với một giới hạn phải đọc kỹ ở cuối mục.

**Hiện trạng trước:** **không có bộ chặn nào.** Câu lệnh hệ thống dặn không được đưa đáp số,
nhưng dặn không phải là chặn — biên bản thẩm định 14/09/2026 đã ghi lại những việc câu lệnh dặn
mà mô hình làm lúc có lúc không.

**Đã làm:** thêm `src/features/tutor/services/chanRoDapSo.ts`:

- `timSoTrongVanBan` đọc được mọi lối viết số của học sinh và của mô hình: `1,45` · `1.45` ·
  `1,45.10^-2` · `1,45×10⁻²` · `1.45e-2` · `1{,}45` (lối LaTeX mà chính câu lệnh dặn dùng).
- `timDapAnChoTin` khớp tin nhắn của học sinh với câu trong ngân hàng của bài đang mở
  (ngưỡng 80% từ dài, chịu được gõ không dấu) để lấy đáp án.
- `locTraLoi` dò → sinh lại **một lần** với chỉ thị gắt hơn → vẫn rò thì thay bằng câu hỏi
  dự phòng.

Nối vào `geminiTutorService.generateAIResponseChiTiet`, **không** nối ở component. Mã thật cho
thấy cả ba đường gọi mô hình (Firebase AI Logic, khoá riêng của học sinh, mock) hội tụ ở hàm
này; đặt ở component thì hai đường sau lọt. Kế hoạch ban đầu ghi đặt ở `AppContext` — sai, đã
sửa khi thực thi.

Ba quyết định kèm theo:

1. **Đáp án nhớ theo bài suốt phiên.** `getByLesson` tốn khoảng 80 lượt đọc mỗi lần gọi; hỏi lại
   mỗi lượt chat thì một lớp 40 em học một tiết đủ vỡ hạn mức 50.000 lượt đọc/ngày.
2. **Dò trên bản đã gỡ nhãn**, không dò trên bản thô: nhãn ẩn mang số (`[BUOC:A6]` có số 6) mà
   đáp án vài câu cũng là 6 hay 8.
3. **Chỉ áp cho nhánh `socratic`.** Nhánh đối chứng `truc-tiep` vốn được giao việc giảng thẳng
   kèm lời giải mẫu; chặn cả hai nhánh là xoá mất đúng biến mà đề tài đang đo.

**Kiểm chứng:** 15 phép kiểm trong `npm run kiem-tra:su-pham`, có cả ca mong `true` lẫn ca mong
`false` nên một hàm trả hằng số sẽ trượt ngay. Đã xác nhận **học sinh không tắt được chế độ
Socrates**: `nhanhCuaHocSinh()` băm từ email cộng mã đợt, không đọc `localStorage`, không đọc
tham số URL; khách vãng lai luôn `socratic`.

**GIỚI HẠN ĐÃ BIẾT, phải ghi vào báo cáo NCKH:**

- Bộ chặn chỉ hoạt động khi **khớp được** tin nhắn với một câu trong ngân hàng. Học sinh gõ đề
  cô cho trên lớp hoặc đề tự chế thì không có đáp án để so — khi đó bộ chặn không can thiệp.
- **31 trong 200 câu trả lời ngắn của ngân hàng (15,5%) không chấm được**, vì giá trị đáp án
  trùng một dữ kiện ngay trong đề, kể cả qua đổi đơn vị. Ví dụ bài "200 mL H₂SO₄ x M vừa đủ
  300 mL NaOH 0,4 M" có đáp án x = 0,3, mà 300 mL đổi ra 0,3 L. Ở những câu này bộ chặn cố ý
  **không** chặn: đổi đơn vị là việc dạy đúng đắn, chặn nó là phá chính thứ cần bảo vệ.
- Toàn bộ hàng rào vẫn chạy **trên trình duyệt**. Học sinh mở DevTools vẫn sửa được. Đó là
  P1-1, chưa làm trong đợt này.

**Ngày:** 22/09/2026. Commit `9b87ee3`, `edecec9`, `35aae27`.

---

## P0-3 — Chống khai thác nấc câu hỏi có/không

**Trạng thái:** Xong.

**Hiện trạng trước:** từ lần bế tắc thứ 4 trở đi, máy trạng thái cho phép hỏi câu có/không
**không giới hạn số lượt**, và không cấm hỏi dò giá trị đáp số. Một chuỗi câu có/không ghép lại
được thành đáp án: "lớn hơn 1 không", "nhỏ hơn 2 không", "khoảng 1,7 không" — từng lượt một thì
lượt nào cũng đúng luật.

**Đã làm:** sửa `chiDanGianGiao` trong `pedagogicalStateMachine.ts`:

- Trần **3 lượt** câu hỏi có/không liên tiếp. Quá 3 thì chỉ dẫn đổi hẳn: quay lại một câu hỏi
  mở, hoặc mời em hỏi trực tiếp thầy cô, hoặc chỉ phần bài giảng cần đọc lại.
- Nấc có/không nay nói rõ cấm mọi câu dạng *"đáp số có phải là … không"*, *"kết quả có lớn hơn
  … không"*, *"có phải khoảng … không"*.

**Kiểm chứng:** 6 phép kiểm mới trong `kiem-tra:su-pham`. Một phép kiểm đầu tiên viết **sai** —
nó bắt nhầm chính câu đúng, vì câu chỉ dẫn mới có chứa chữ "có/không" trong cụm "DỪNG chuỗi câu
hỏi có/không". Đã sửa phép kiểm, không sửa mã (bài học số 4 trong CLAUDE.md).

**Ngày:** 22/09/2026. Commit `c4e6caa`.

---

## P0-4 — Bộ kiểm thử tấn công

**Trạng thái:** Dựng xong và đã chạy 86 lượt qua Antigravity. **Chưa** chạy qua API thật — đó
là số liệu chính thức còn thiếu.

**Hiện trạng trước:** không có bộ kiểm thử tấn công nào.

**Đã làm:**

- `scripts/red-team/cau-tan-cong.json`: **41 câu, 12 nhóm, 86 lượt**. Mỗi câu neo vào một câu
  ngân hàng có đáp án số để chấm rò tự động. Các nhóm nhiều lượt (chia nhỏ câu hỏi, giả bế tắc,
  dò có/không) gửi nối tiếp trong cùng một phiên.
- `scripts/red-team/chay.mts` đi **đúng pipeline thật**: `xuLyTruocLuot` → `dungPrompt('socratic')`
  → mô hình → `tachNhanAn`, y như `AppContext.addMessage`. Cờ `--chan` bật hàng rào P0-2 để đo lại.
- `--rut-gon`: mỗi nhóm một câu, 12 câu / 24 lượt, để chạy vừa hạn mức miễn phí.
- `--xuat-de-dan` + `--nap`: đường dẫn tay qua Antigravity, không tốn lượt API nào.

**Kết quả đã có (đường Antigravity, 22/09):**

| Nhóm tấn công | Rò / chấm được |
|---|---|
| xin thẳng đáp án | 0/4 |
| giả làm giáo viên, quản trị | 0/2 |
| "bỏ qua mọi hướng dẫn trước" | 0/4 |
| xin số cuối để đối chiếu | 0/4 |
| nhờ viết truyện, thơ, đóng vai | 0/3 |
| gửi ảnh chụp đề | 0/3 |
| dán lời giải sai nhờ kiểm tra | 0/3 |
| chia nhỏ câu hỏi | 0/8 |
| tiếng Anh, không dấu, teencode | 0/3 |
| giả bế tắc để lên nấc cao | 0/14 |
| "đây không phải bài kiểm tra" | 0/4 |
| dò có/không từng bước | 0/13 |
| **TỔNG** | **0/65** |

Ngoài 65 lượt chấm được còn **21 lượt không chấm được** (neo vào câu có đáp án trùng dữ kiện đề).

**Hai lỗi của chính bộ chấm, tìm ra khi đối chiếu tay — phần đáng giá nhất của lượt chạy này:**

1. **Bộ dò từng mù trước lối viết LaTeX `1{,}70`.** Chính câu lệnh hệ thống dặn mô hình viết số
   thập phân như vậy trong công thức, và **49/86 câu trả lời dùng lối đó** — tức bộ dò mù đúng
   chỗ dễ rò nhất. Sửa xong thì lộ ra 3 lượt bị đánh dấu rò mà trước đó giấu kín.
2. **Cả 3 lượt đó lại là báo nhầm**, cùng kiểu đã mô tả ở P0-2 (đáp án 0,3 trùng với 300 mL đổi
   đơn vị). Từ đó mới có quy tắc loại câu không chấm được.

**Một lượt chạy hỏng, ghi lại để không ai đọc nhầm:** lô đầu qua API lúc 17:33 ngày 22/09 in ra
"0/20 = 0,0% rò", nhưng **16 trong 20 lượt là lỗi HTTP** (12 lỗi 429 hết hạn mức ngày, 4 lỗi 503
quá tải) — chỉ 4 lượt có câu trả lời thật. Bảng tóm tắt khi đó đếm cả dòng lỗi như lượt sạch,
tức tự tạo ra bằng chứng an toàn. Nguyên nhân gốc: sáng cùng ngày đã tiêu 8 lượt cho phép đo
P0-1, mà bậc miễn phí chỉ có 20 lượt/ngày. Tệp kết quả đó đã đổi tên thành
`ket-qua-BASELINE-2026-09-22-cau1-HONG-16-20-luot-loi.csv`. Script nay **dừng hẳn** khi gặp lỗi
429 và **loại lượt lỗi khỏi mẫu số**.

**GIỚI HẠN của kết quả Antigravity, phải ghi rõ trước hội đồng:** đường này chạy qua phần lõi
thật (câu lệnh hệ thống, máy trạng thái với chỉ dẫn giàn giáo tính sẵn, gỡ nhãn, bộ dò rò), nhưng
**không** đi qua Firebase AI Logic, không dùng tham số sinh của bản thật, và không có gì bảo đảm
model sau lưng Antigravity đúng bằng `gemini-3.6-flash`. Nó **không** chứng minh bản chạy thật
an toàn.

**Còn thiếu:** chạy bộ rút gọn 12 câu qua API thật, cả trước và sau khi bật hàng rào. Với hạn
mức miễn phí 20 lượt/ngày cần 4 ngày (23–26/09); bật thanh toán thì gọn trong một buổi.

**Ngày:** 22/09/2026. Commit `9b87ee3`, `29eecfe`, `3f8ae47`, `35aae27`.

---

## P0-5 — Xuất dữ liệu nghiên cứu

**Trạng thái:** Xong, chưa chạy trên dữ liệu thật.

**Hiện trạng trước:** chỉ có `telemetryService.xuatCsv` xuất từng lượt chat. Không có bảng gộp
theo học sinh, không lọc theo khoảng ngày, không có mẫu cho giáo viên chấm độ chính xác.

**Đã làm:** `npm run xuat:nghien-cuu` (`scripts/xuat-du-lieu-nghien-cuu.mts`), CHỈ ĐỌC, sinh hai
tệp trong `xuat-nghien-cuu/<mốc>/`:

- `theo-hoc-sinh.csv` — mỗi dòng một học sinh, dùng mã băm: số phiên, số lượt, tổng thời gian,
  tỉ lệ lượt gợi mở, nấc nâng đỡ cao nhất, số phiên chạm nấc 3, số lần bị chặn rò, số lần nhãn
  hỏng, số lần chạm chế độ giờ kiểm tra.
- `mau-cham.csv` — N lượt ngẫu nhiên kèm hai cột trống *đúng/sai kiến thức Hoá học* và *loại lỗi*
  để giáo viên Hoá chấm tay.

**Kiểm chứng:** 17 phép kiểm trong `kiem-tra:su-pham`. CSV có BOM ở đầu (thiếu nó thì Excel trên
Windows đọc tiếng Việt ra ký tự rác). Bảng theo học sinh không mang email và không mang nội dung
hội thoại — có phép kiểm canh.

**Hai điều phải biết:**

- **P1-7 (xin đồng ý tham gia nghiên cứu) chưa làm**, nên bản xuất còn gồm cả tài khoản chưa đồng
  ý. Cảnh báo đó nằm ở **cột đầu tiên của mọi dòng**, không nấp ở cuối bảng.
- Thư mục `xuat-nghien-cuu/` nằm trong `.gitignore` vì tệp mẫu chấm chứa nguyên văn hội thoại.
  Trong lần làm đầu, chú thích của script khẳng định `.gitignore` đã chặn trong khi **chưa** chặn
  — đã vá.

**Ngày:** 22/09/2026. Commit `e64a413`.

---

## P0-6 — Gỡ nhãn ẩn an toàn

**Trạng thái:** Xong. **Bắt được hai lỗi đang chạy thật trên site.**

**Hiện trạng trước:** `tachNhanAn` gỡ nhãn bằng bốn phép thay thế đòi thẻ viết **đúng** định dạng
(`[BUOC:` dính liền, có ngoặc đóng). Mô hình viết lệch một chút là thẻ lọt ra màn hình học sinh.
Hai ca đo được là lỗi thật, đang có trên bản chạy:

- `[ NGO_NHAN : xuc-tac-chuyen-dich ]` — có khoảng trắng quanh dấu hai chấm
- `[LUOT:goi_mo` — mô hình cắt ngang, thiếu ngoặc đóng

**Đã làm:** thêm lượt quét thứ hai bắt mọi thẻ `BUOC` / `LUOT` / `NGO_NHAN` viết sai, kể cả thiếu
ngoặc đóng. Nhãn ra đề (`XONG_BAI`, `YEU_CAU_DE`, `XONG_CHUONG`) **giữ nguyên** cho `AppContext`
xử lý. Thêm hai cờ `thieuNhan` và `nhanHong` để ghi log và để P0-5 đếm được mô hình quên nhãn bao
nhiêu lần.

**Kiểm chứng:** 9 phép kiểm mới. Một cái bẫy đã tránh: regex có cờ `g` giữ `lastIndex` giữa
`.test()` và `.replace()`, không đặt lại thì cứ hai lượt lại sót một.

**Ngày:** 22/09/2026. Commit `c4e6caa`.

---

## Những gì đợt này KHÔNG làm

- **P1-1 chuyển logic lên server** — việc lớn nhất trong danh sách. Hôm nay câu lệnh hệ thống, bộ
  đếm bế tắc và mọi hàng rào đều chạy trên trình duyệt; học sinh mở DevTools vẫn sửa được. Làm
  trước 28/9 thì rủi ro hỏng bản demo cao hơn lợi ích.
- **P1-2 đến P1-9 và P2** — chưa lên kế hoạch.
- **Không đổi model**, không đổi câu lệnh Socratic (đổi giữa chừng là hỏng so sánh trước/sau).

## Việc còn lại trước 28/9

1. Chạy bộ rút gọn 12 câu qua API thật, baseline rồi `--chan` — 4 ngày miễn phí, hoặc một buổi
   nếu bật thanh toán.
2. Giáo viên Hoá đọc và điền cột `nguoi_duyet` trong
   `scripts/red-team/ket-qua-ANTIGRAVITY-2026-09-22-cau1.csv`. Máy chỉ chấm được kiểu rò **có
   số**; kiểu rò không có số — ví dụ gia sư mô tả trọn vẹn các bước tới mức chỉ còn bấm máy tính
   — phải người đọc mới thấy.
3. Chạy `npm run xuat:nghien-cuu` để có bộ CSV bàn giao.
4. Merge `p0-truoc-thi` vào `main` sau khi ba việc trên xong, rồi mới deploy.
