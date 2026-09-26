# Soạn nội dung và kiểm tra

Hai nhóm script: một nhóm **sinh** nội dung 25 bài học từ tệp `.docx` của giáo
viên, một nhóm **kiểm tra** những thứ mà `tsc` và `vite build` không bắt được.

## Sửa nội dung bài học

Đừng sửa tay `src/features/lessons/constants.ts` — tệp đó do máy sinh ra, lần
chạy sau sẽ ghi đè. Sửa tệp `.docx` gốc rồi chạy lại:

```bash
npm run soan:trich -- "D:\đường dẫn\thư mục docx"
```

```bash
npm run soan:sinh
```

Hoặc đặt biến môi trường `HOA11_DOCX` một lần rồi chỉ cần `npm run soan` (chạy
cả hai bước và kiểm tra luôn).

| Bước | Việc | Đọc | Ghi |
|---|---|---|---|
| `soan:trich` | Trích lý thuyết từ `.docx`, cắt theo đề mục La Mã có sẵn | 25 tệp `.docx` | `du-lieu/trich-tu-docx.json` |
| `soan:sinh` | Ghép với ngân hàng câu hỏi và phần soạn tay | `du-lieu/*.json`, `public/bank/ngan-hang.json` | `src/features/lessons/constants.ts` |

Vài điểm hai script này xử lý sẵn, đừng gỡ bỏ:

- **Tên tệp không thống nhất** — có tệp viết `BAI 22 HOA 11`, có tệp viết
  `bài 22 hóa 11` có dấu. Đã bỏ dấu trước khi đối chiếu số bài.
- **Word xuất mỗi ô bảng thành một đoạn riêng**, nên hàng tiêu đề của bảng ra
  thành mấy dòng cụt ("Chưng cất", "Chiết", "Kết tinh"). Đã bỏ qua khi lấy tóm
  tắt, nếu không tóm tắt đọc như một mớ từ rời rạc.
- **Tên gọi chương trình 2006** còn lẫn trong tài liệu (`ancol`, `axit`,
  `cacbonat`…) được đổi sang tên KNTT 2018. Danh sách từ nằm trong
  `2-sinh-bai-hoc.py`, kèm ghi chú vì sao **giữ nguyên** "oxi hoá", "đồng phân",
  "tráng bạc", "butan-1-ol".
- **Sáu bài giáo viên soạn tay** trước đây đánh số 1–6 trong khi bài THẬT là
  1, 2, 4, 6, 10, 15. Bảng `CHUYEN` giữ ánh xạ đó; phần soạn tay được giữ
  nguyên từng chữ và bài kiểm tra bên dưới canh điều này.

Chạy xong luôn kiểm lại bằng `npm run kiem-tra:chuong-trinh`.

## Chạy kiểm tra

```bash
npm run kiem-tra          # bốn bài kiểm tra không cần mạng
npm run thu:ai            # thử gia sư AI thật (tốn 8 lượt API)
```

| Lệnh | Kiểm cái gì | Cần mạng |
|---|---|---|
| `npm run kiem-tra:chuong-trinh` | Dữ liệu 25 bài trong `constants.ts` | không |
| `npm run kiem-tra:ngan-hang` | Chuyển đổi ngân hàng câu hỏi web ↔ trò chơi | không |
| `npm run kiem-tra:de-chuong` | Sinh đề kiểm tra tổng hợp một chương | không |
| `npm run kiem-tra:het-luot` | Cách diễn giải lỗi 429 của Gemini | không |
| `npm run kiem-tra:dong-bo` | Ngân hàng trong git còn khớp Firestore không | **có** (mất mạng thì bỏ qua) |
| `npm run thu:ai` | Gia sư AI trả lời có đúng kiến thức không | **có** |

## Ngân hàng câu hỏi nằm ở đâu

Ngân hàng **thật** nằm ở Firestore, collection `bank_questions`. Web đọc thẳng
từ đó, nên trang web luôn đúng. Trong repo chỉ có `public/bank/ngan-hang.json`
— một **bản chụp**, và mọi thứ chạy ngoài trình duyệt đều dùng bản chụp này:

* `npm run gan:cau-hoi` dựng bảng câu hỏi theo bài cho trò Rắn và Thang;
* `npm run soan:sinh` lấy câu cho phần luyện tập cuối mỗi bài giảng;
* các bộ kiểm `kiem-tra:ngan-hang`, `kiem-tra:de-chuong`, `kiem-tra:ran-thang`;
* trò chơi khi mở lúc mất mạng, và `migrate.ts` khi cần gạo lại Firestore trống.

### Đồng bộ tự động — thầy không phải làm gì

`.github/workflows/dong-bo-ngan-hang.yml` chạy **02:00 giờ Việt Nam mỗi đêm**:
xuất ngân hàng từ Firestore, gán lại câu theo bài, kiểm, rồi commit vào `main`
nếu có gì đổi. Cần gấp thì vào tab **Actions → Đồng bộ ngân hàng câu hỏi →
Run workflow**. Không cần cài secret nào, xem mục dưới.

Trò chơi cũng **không còn phải đợi** lần đồng bộ kế tiếp: `cauChoBai` trong
`ran-va-thang.html` lấy hết bảng gán rồi lấy tiếp mọi câu cùng chương trong
ngân hàng sống (đọc từ IndexedDB, do web bơm sang từ Firestore). Câu vừa soạn
trên web là học sinh gặp được ngay, chỉ xếp sau các câu đã chấm điểm khớp bài.

Làm tay khi cần:

```
npm run xuat:ngan-hang    # Firestore -> public/bank/ngan-hang.json
npm run gan:cau-hoi       # gán câu theo bài rồi nhúng vào Rắn và Thang
npm run kiem-tra
git add public/bank/ngan-hang.json public/games && git commit
```

`kiem-tra:dong-bo` so bằng **vân tay** chứ không chỉ đếm số câu, nên sửa nội
dung một câu cũng bắt được. Mất mạng thì nó bỏ qua, không báo hỏng.

### Máy mới cần gì

```
git clone … && npm install && npm run dev
```

Chỉ vậy. Cấu hình Firebase nằm sẵn trong `src/core/services/firebaseCongKhai.ts`
— sáu giá trị công khai theo thiết kế của Firebase, vốn đã nằm trong bản dựng
trên web. Biến `VITE_FIREBASE_*` trong `.env.local` vẫn được ưu tiên nếu
có, để còn trỏ sang dự án Firebase khác lúc thử nghiệm.

Thứ **duy nhất** còn phải chép tay là `GEMINI_API_KEY` trong `.env.local`, và
chỉ phần gia sư AI cần tới nó. Đã kiểm: khoá đó không bị đóng vào bản dựng.

## `kiem-tra:chuong-trinh`

- Đủ 6 chương, 25 bài, id `bai-1`…`bai-25` liên tục — phải khớp với slide bài
  giảng và với ngân hàng câu hỏi, nếu lệch thì học sinh thấy hai cách đánh số
  khác nhau cho cùng một bài.
- Mọi bài đều có tóm tắt và nội dung SGK.
- Không còn tên gọi của chương trình 2006 (`ancol`, `axit`, `cacbonat`…).
- **Sáu bài giáo viên soạn tay giữ nguyên từng chữ** — đối chiếu với bản lưu ở
  `du-lieu/soan-tay-goc.json`. Đây là phần công phu nhất, tuyệt đối không được
  để quá trình sinh lại `constants.ts` làm mất.
- Câu luyện tập vẫn giữ đáp án cho trình đọc SGK, nhưng **không đáp án nào lọt
  vào ngữ cảnh gửi cho AI** — nếu lọt, gia sư sẽ đọc thấy và rất dễ đưa thẳng
  cho học sinh.

Chạy lại sau mỗi lần sinh lại `src/features/lessons/constants.ts`.

## `kiem-tra:ngan-hang`

Web và trò chơi dùng hai dạng dữ liệu khác nhau, đồng bộ hai chiều qua
IndexedDB. Chuyển sai một lượt là mất câu hỏi thật của giáo viên mà không ai
biết ngay, nên đây là chỗ dễ hỏng ngầm nhất trong dự án.

Phép thử cốt lõi là **khứ hồi**: 148 câu trắc nghiệm đi vòng web → trò chơi →
web phải giữ nguyên đề, 4 phương án, đáp án và chương.

Bài này cũng khoá lại hai **mất mát có chủ ý** của mô hình cũ, để nếu chúng lan
rộng thêm thì biết ngay: mức `vdc` (vận dụng cao) hạ về `vd` vì dạng cũ chỉ có
3 mức, và dạng `tn` (trả lời ngắn) chuyển thành Tự luận vì dạng cũ không có.

## `kiem-tra:de-chuong`

Bài kiểm tra tổng hợp chương phải lấy câu từ **ngân hàng thật trên Firestore**,
lọc đúng chương, 10 câu chia 3 nhận biết · 3 thông hiểu · 4 vận dụng.

Bài này dựng đề cho cả 6 chương từ `public/bank/ngan-hang.json` và kiểm: đủ số
câu, không câu nào lặp, mọi câu thuộc đúng chương, câu trắc nghiệm còn đủ phương
án và đáp án, đề xếp từ dễ đến khó, và ngân hàng rỗng thì trả về `null` để web
báo cho học sinh chứ không dựng đề rỗng.

Trước đây đề đọc kho localStorage `h11_library` — kho cũ đã được migrate đi nên
gần như rỗng, khiến đề rơi xuống bộ câu dự phòng viết cứng trong mã, chẳng dính
gì tới ngân hàng của giáo viên.

## `thu:ai`

Gọi Gemini bằng **đúng** `SYSTEM_PROMPT` và ngữ cảnh bài mà web dựng (đọc thẳng
từ mã nguồn, không sao chép — sao chép thì sửa prompt xong bài thử vẫn kiểm bản
cũ mà không ai hay).

Tám phép thử: hằng số đkc 24,79 L/mol · bám nội dung bài đang mở · dùng thuật
ngữ 2018 · không đưa đáp án thẳng · bắt lỗi sai của học sinh · từ chối việc
ngoài môn Hoá · không bịa bài không có thật · không mở bài kiểm tra chương khi chưa rà xong.

Cần `GEMINI_API_KEY` trong `.env.local` (tệp này nằm trong `.gitignore`).
Script không bao giờ in giá trị key ra màn hình.

### Hạn mức API

Bậc miễn phí của Gemini cho **5 lượt/phút** và **20 lượt/ngày**, tính riêng cho
**từng model**. Chạy hết bộ này tốn 8 lượt.

Khi model của web đã hết lượt trong ngày, truyền tên model khác để thử tiếp:

```bash
npm run thu:ai -- gemini-3.5-flash
npm run thu:ai -- gemini-3.5-flash 1 5    # chỉ chạy phép thử số 1 và 5
```

Kết quả trên model khác chỉ mang tính tham khảo — học sinh vẫn dùng model ghi
trong `GEMINI_MODEL_NAME`.

Muốn hết lo hạn mức thì bật thanh toán cho dự án Google Cloud đang giữ API key.
Đây cũng là việc phải làm trước khi mở web cho nhiều học sinh: 20 lượt/ngày cho
mỗi key nghĩa là mỗi em chỉ hỏi được khoảng 20 câu một ngày.

## `npm run soat:hoa-hoc` — nhờ Gemini soi nội dung hoá học

Đọc `public/bank/ngan-hang.json`, chia lô rồi hỏi Gemini xem câu nào có vẻ sai
đáp án, sai công thức, hay lời giải mâu thuẫn với đề. **Không sửa gì** — chỉ in
ra danh sách để người tự kiểm chứng.

| Cờ | Làm gì |
|---|---|
| `--bai bai-1` | chỉ một bài |
| `--chuong 1` | cả chương |
| `--muc vdc` | một mức (`nb`/`th`/`vd`/`vdc`) |
| `--loai mc` | một loại (`mc`/`tf`/`tn`) |
| `--so 40` | giới hạn số câu |
| `--lo 25` | số câu mỗi lượt gọi (mặc định 25) |
| `--model ...` | đổi model, mặc định lấy `GEMINI_MODEL_NAME` |
| `--ra bc.md` | ghi báo cáo ra tệp |
| `--xem` | chỉ tính kế hoạch, KHÔNG gọi Gemini |
| `--lan N` | soát mấy lượt mỗi lô (mặc định 2 — một lượt BỎ SÓT) |
| `--xuat-de-dan` | ghi tệp đề dẫn để đưa Antigravity, KHÔNG gọi mạng |
| `--nap a.json,b.json` | nạp câu trả lời của Antigravity (NHIỀU tệp, ngăn bằng dấu phẩy) rồi dựng báo cáo |
| `--qua cli` \| `--qua key` | gọi qua `gemini` CLI (mặc định) hay qua khoá API |

Hạn mức: 20 lượt/ngày ở bậc miễn phí, mà soát cả kho tốn 63 lượt — script tự
dừng và bảo cách chia nhỏ. Mỗi bài tốn chừng 3–7 lượt, tức một ngày soát được
khoảng 3–6 bài.

Muốn gỡ hẳn trần đó thì **bật thanh toán** cho dự án Google Cloud giữ API key.
Đăng nhập bằng tài khoản Google KHÔNG còn là đường đi: Google chấm dứt lối đó
cho tài khoản cá nhân từ 18/06/2026, kể cả gói AI Pro và Ultra.

Cả kho là 369.813 token vào (đo 20/09/2026). Tra đơn giá hiện hành rồi tự nhân
— ở đây không ghi cứng giá, vì giá đổi theo thời gian.

Báo cáo ghi vào `docs/soat-hoa-hoc/<ngày>-<phạm vi>.md` và theo git.

Chỉ nội dung câu hỏi được gửi đi. Không email, không tên học sinh, không tiến độ.


### Đưa tệp đề dẫn sang Antigravity — `npm run pdf`

Đường rẻ nhất vẫn là **gõ đường dẫn tệp `.md` vào chat của Antigravity**: repo
nằm sẵn trong workspace của nó nên nó tự mở, không phải đính kèm gì, và không
qua lớp chuyển đổi nào.

Khi đường đó không dùng được — ô đính kèm của Antigravity không nhận `.md` lẫn
`.docx` — thì chuyển sang PDF:

```bash
npm run pdf -- docs/soat-hoa-hoc/de-dan-2026-09-20-2154-bai-2.md
```

Ra tệp `.pdf` cùng chỗ, cùng tên. Cách làm: dựng HTML rồi nhờ **Chrome** in ra.
Máy không có pandoc, mà tự sinh PDF thì vướng font — nội dung có dấu tiếng Việt
VÀ chỉ số hoá học (`₂`, `⁺`, `⇌`), trong khi 14 font dựng sẵn của PDF chỉ với
tới WinAnsi. Chrome nhúng font hộ nên không mất chữ. Đã đo trên đề dẫn Bài 2:
230 câu, 54 trang, 249 KB, chỉ số dưới và dấu tiếng Việt ra đúng.

Hai chỗ phải biết:

- **Khối mã rào ` ``` ` giữ nguyên từng dòng**, vì cả ngân hàng câu hỏi nằm
  trong một khối JSON vài nghìn dòng. Dòng dài (phần `giai_thich`) vẫn bị ngắt
  mềm cho vừa khổ A4 — chấp nhận được, vì `"id"` luôn nằm gọn một dòng ngắn và
  đó mới là thứ phải đọc ra đúng từng ký tự.
- `md-sang-pdf.mts` và `md-sang-word.cjs` có **hai** bộ đọc Markdown riêng, cố
  ý chỉ xử lý những cú pháp tài liệu trong repo đang dùng. Thêm cú pháp mới thì
  phải sửa CẢ HAI.

`npm run word -- vao.md "ra.docx"` vẫn còn cho việc nộp đề cương NCKH — đó mới
là lý do nó sinh ra.

## Hạn mức đọc Firestore — không sinh bảng đếm nào cho web

`xuat:ngan-hang` và `gan:cau-hoi` **cố ý KHÔNG sinh bảng đếm câu hỏi** cho tab
Luyện tập, dù làm vậy sẽ tiết kiệm được lượt đọc.

Lý do: web deploy bằng kéo-thả `dist/`, nên mọi con số nằm trong tệp tĩnh chỉ
mới tới lần deploy gần nhất. Thầy cô nhập câu hỏi xong mà phải build và deploy
lại thì số mới đúng — đó là một nguồn hiểu nhầm, không phải một cách tiết kiệm.

Thay vào đó danh sách Luyện tập vẽ bằng tiến độ trong localStorage và không
hiện số câu; số câu chỉ được hỏi khi học sinh bấm vào một bài, đọc đúng bài đó
từ Firestore. Chi tiết và số đo: mục "Hạn mức đọc" trong `CLAUDE.md`, và
`docs/superpowers/plans/2026-09-20-giam-luot-doc-firestore.md`.

## `npm run sua:cau-hoi` — sửa vài câu trong ngân hàng theo phiếu

```bash
npm run sua:cau-hoi -- docs/soat-hoa-hoc/sua-3-cau-Kc.json          # chạy thử
npm run sua:cau-hoi -- docs/soat-hoa-hoc/sua-3-cau-Kc.json --that   # ghi thật
```

Phiếu sửa là một mảng JSON, mỗi mục bốn trường:

```json
[{ "id": "bq_...", "truong": "q", "cuPhaiLa": "<đề hiện tại, khớp từng ký tự>", "moi": "<đề mới>" }]
```

Chạy thử KHÔNG cần đăng nhập và không ghi gì — `bank_questions` đọc công khai.
Ghi thật cần một tài khoản GIÁO VIÊN — luật Firestore đòi vai đó mới ghi được
`bank_questions`. Đặt `GIAO_VIEN_EMAIL` + `GIAO_VIEN_MATKHAU` trong `.env.local`
(xem `.env.example`), hoặc bỏ trống để script hỏi ngay tại máy, hiện dấu sao.
Dù đường nào cũng KHÔNG nhận mật khẩu qua tham số dòng lệnh.

Cấp vai `teacher` THÔI, đừng cấp `admin`: xem lý do trong `CLAUDE.md`.

`cuPhaiLa` lệch một dấu cách là câu đó bị bỏ qua. Đó là chủ ý: chạy lại lần hai
không làm gì, và phiếu soạn từ bản chụp cũ không đè mất thứ người khác vừa sửa.

Chi tiết năm cái trói và vì sao chúng tồn tại: mục "`npm run sua:cau-hoi`"
trong `CLAUDE.md`. **Ghi xong phải `npm run xuat:ngan-hang && npm run gan:cau-hoi`.**
