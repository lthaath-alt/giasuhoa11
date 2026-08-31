# Bộ kiểm tra

Ba script kiểm tra những thứ mà `tsc` và `vite build` không bắt được: nội dung
bài học có đúng không, gia sư AI có trả lời sai kiến thức không, và web có báo
lỗi hết lượt cho đúng không.

## Chạy

```bash
npm run kiem-tra          # hai bài kiểm tra không cần mạng
npm run thu:ai            # thử gia sư AI thật (tốn 7 lượt API)
```

| Lệnh | Kiểm cái gì | Cần mạng |
|---|---|---|
| `npm run kiem-tra:chuong-trinh` | Dữ liệu 25 bài trong `constants.ts` | không |
| `npm run kiem-tra:het-luot` | Cách diễn giải lỗi 429 của Gemini | không |
| `npm run thu:ai` | Gia sư AI trả lời có đúng kiến thức không | **có** |

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

## `thu:ai`

Gọi Gemini bằng **đúng** `SYSTEM_PROMPT` và ngữ cảnh bài mà web dựng (đọc thẳng
từ mã nguồn, không sao chép — sao chép thì sửa prompt xong bài thử vẫn kiểm bản
cũ mà không ai hay).

Bảy phép thử: hằng số đkc 24,79 L/mol · bám nội dung bài đang mở · dùng thuật
ngữ 2018 · không đưa đáp án thẳng · bắt lỗi sai của học sinh · từ chối việc
ngoài môn Hoá · không bịa bài không có thật.

Cần `GEMINI_API_KEY` trong `.env.local` (tệp này nằm trong `.gitignore`).
Script không bao giờ in giá trị key ra màn hình.

### Hạn mức API

Bậc miễn phí của Gemini cho **5 lượt/phút** và **20 lượt/ngày**, tính riêng cho
**từng model**. Chạy hết bộ này tốn 7 lượt.

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
