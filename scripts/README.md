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

Thêm hay sửa câu trên web **không** tự chảy về repo. Sau khi soạn xong trên web:

```
npm run xuat:ngan-hang    # Firestore -> public/bank/ngan-hang.json
npm run gan:cau-hoi       # gán câu theo bài rồi nhúng vào Rắn và Thang
npm run kiem-tra
git add public/bank/ngan-hang.json public/games && git commit
```

Quên bước đó là hai bên lệch dần mà **không có dấu hiệu nào**: web vẫn chạy
đúng vì nó đọc Firestore, chỉ trò chơi và các bộ kiểm âm thầm dùng dữ liệu cũ.
Đã lệch đúng như thế một lần — tệp trong git đứng ở 160 câu suốt trong khi
Firestore đã lên 252. `kiem-tra:dong-bo` sinh ra để chặn việc đó lặp lại; nó so
bằng **vân tay** chứ không chỉ đếm, nên sửa nội dung một câu cũng bắt được.

Máy mới `git clone` về cần thêm `.env.local` (chép từ `.env.example`) mới nối
được Firestore — tệp đó nằm trong `.gitignore` vì có `GEMINI_API_KEY`.

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
