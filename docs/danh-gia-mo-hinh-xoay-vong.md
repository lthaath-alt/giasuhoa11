# Đánh giá các model Gemini trong danh sách xoay vòng

Danh sách xoay vòng nằm ở `src/features/tutor/services/danhSachMoHinh.ts` (`GEMINI_XOAY`).
Khi `gemini-3.6-flash` hết lượt trong ngày, Chemai lần lượt dùng các model này.
Mọi số đo dưới đây đều ghi kèm tên model và ngày chạy.

## Gọi thử một lượt mỗi model (02/10/2026)

Câu lệnh hệ thống giống web (nhánh socratic, bài `bai-1`, 20.615 ký tự), `temperature` 0,3,
`topP` 0,85, `thinkingLevel` LOW, gọi qua REST bằng khoá trong `.env.local`. Câu hỏi:
"Thầy ơi em không hiểu vì sao tăng nhiệt độ thì cân bằng của phản ứng thu nhiệt lại chuyển
dịch sang phải ạ".

| Model | Kết quả | Thời gian | Nhãn ẩn |
|---|---|---|---|
| gemini-3.8-flash | trả lời, tiếng Việt, dẫn dắt | 4,8 s | đủ |
| gemini-3.7-flash | HTTP 503 (high demand) | | |
| gemini-3.5-flash | trả lời, tiếng Việt, dẫn dắt | 3,2 s | đủ |
| gemini-3-flash-preview | trả lời, tiếng Việt, dẫn dắt | 3,1 s | đủ |
| gemini-3.5-flash-lite | trả lời, tiếng Việt, dẫn dắt | 2,1 s | thiếu |
| gemini-3.1-flash-lite | trả lời, tiếng Việt, dẫn dắt | 8,3 s | đủ |

Lỗi 503 của 3.7-flash là lỗi quá tải phía Google; chuỗi xoay vòng gặp 503 thì chuyển sang
model kế mà không đánh dấu model đó hết lượt.

## Bộ 20 tình huống `npm run thu:ai` cho hai bản Flash-Lite (02/10/2026)

Chạy `npm run thu:ai -- <model>`. Script này không đặt `thinkingLevel` (web đặt LOW), nên
kết quả gần với web nhưng không giống hệt. Mỗi model chạy một lần; mô hình có yếu tố ngẫu
nhiên nên đây chưa phải tỉ lệ đạt ổn định.

| Model | Đạt |
|---|---|
| gemini-3.6-flash (model chính, lần chạy 16/09/2026 ghi trong báo cáo NCKH) | 19/20 |
| gemini-3.5-flash-lite | 15/20 |
| gemini-3.1-flash-lite | 14/20 |

Tình huống hỏng ở cả hai bản Flash-Lite: không phát hiện học sinh tính sai pH (bai-2); không
tách vế sai khi học sinh nói nửa đúng nửa sai về chuyển dịch cân bằng (bai-1); không bác ngộ
nhận "tan nhiều thì điện li mạnh" bằng phản ví dụ CH3COOH (bai-2).

Hỏng riêng ở gemini-3.5-flash-lite: không bám nội dung Bài 22 (không nhắc phản ứng thế); hỏi
nghĩa một từ thì không nói gì về ester hoá (bai-25).

Hỏng riêng ở gemini-3.1-flash-lite: trả lời thẳng, không dẫn dắt (bai-21); không gắn nhãn
LAC_DE khi học sinh hỏi bài môn Văn; không nhắc chuẩn mực khi học sinh nói tục.

## Tỉ lệ ghi nhãn ẩn của hai bản Flash-Lite (02/10/2026)

Tám câu khác nhau (bai-1, bai-2, bai-4, bai-6, bai-15, bai-20, khung chung), cấu hình như web
(`thinkingLevel` LOW). Cả gemini-3.5-flash-lite và gemini-3.1-flash-lite đều ghi đủ hai nhãn
`[BUOC]` và `[LUOT]` ở 8/8 lượt. Gộp với lượt gọi thử ở trên, gemini-3.5-flash-lite ghi đủ nhãn
8/9 lượt.

## Quyết định ngày 02/10/2026

Bỏ gemini-3.1-flash-lite khỏi `GEMINI_XOAY`: nó trả lời thẳng đáp án, phạm nguyên tắc của
nhánh Socratic. Giữ gemini-3.5-flash-lite ở cuối danh sách, chỉ dùng khi bốn bản Flash đã
hết lượt; bỏ nốt thì dự phòng chỉ còn khoảng 80 lượt/ngày. Lượt do model dự phòng trả lời
có `duong` = "xoay-gemini" trong `chats`, nên phân tích tách được.

## Bộ 20 tình huống `npm run thu:ai` cho bốn bản Flash (06/10/2026, khoảng 0:00 đến 0:20 giờ Việt Nam)

Chạy `npm run thu:ai -- <model>` cho cả bốn bản cùng lúc. Không bản nào chạy hết bộ: mỗi bản
chỉ trả lời được 3 đến 5 câu rồi báo hết lượt ngày (HTTP 429, `limit: 20`). Số dưới đây vì thế
chưa phải tỉ lệ đạt trên 20 tình huống.

| Model | Có câu trả lời | Đạt | Hỏng do chấm | Lỗi 503 | Lỗi 429 hết lượt ngày |
|---|---|---|---|---|---|
| gemini-3.8-flash | 5 | 4 | 1 | 5 | 10 |
| gemini-3.7-flash | 3 | 2 | 1 | 4 | 13 |
| gemini-3.5-flash | 4 | 3 | 1 | 5 | 11 |
| gemini-3-flash-preview | 4 | 4 | 0 | 4 | 12 |

Tình huống duy nhất bị chấm hỏng ở ba bản đầu là "Bám nội dung Bài 22". Đọc tay cả ba câu trả
lời: model nêu đúng Bài 22, hỏi ngược học sinh về liên kết C-X hoặc hỏi "thế, cộng hay tách",
không nói thẳng cụm "phản ứng thế". Phép chấm đòi đúng cụm đó nên báo hỏng; đây là phép chấm
quá chặt với lối dẫn dắt, chưa thấy model trả lời sai. Tình huống "Không đưa đáp án thẳng"
(bai-21) đạt ở cả hai bản có câu trả lời (3.8-flash và 3-flash-preview).

Hai điều rút ra về hạn mức:

- Mỗi tình huống gặp 503 được script gọi lại tới ba lần. Cộng số lượt gọi lại với số câu trả
  lời thì vừa khoảng 20, nên nhiều khả năng lượt bị 503 cũng tính vào hạn mức ngày. Đây là suy
  ra từ số đếm, chưa đối chiếu trên AI Studio, và không biết trước lúc chạy mỗi bản đã dùng
  bao nhiêu lượt.
- Lúc 0:00 giờ Việt Nam (khoảng 10:00 sáng giờ Thái Bình Dương) cả bốn bản đều trả 503 ở 4
  đến 5 tình huống đầu. Lần sau nên chạy từng bản một, vào giờ khác, và chỉ chạy các tình
  huống còn thiếu: `npm run thu:ai -- <model> 3 8 9 ...`.

Sau lần chạy này, bốn bản Flash hết lượt cho tới 14:00 ngày 06/10/2026. Trong khoảng đó web
còn model chính và gemini-3.5-flash-lite.

## Chưa đo

Bốn bản Flash (3.8, 3.7, 3.5, 3-flash-preview) chưa có kết quả đủ 20 tình huống (xem lần chạy
dở ngày 06/10/2026 ở trên): mỗi bản chỉ có khoảng 20 lượt/ngày ở bậc miễn phí, chạy là dùng
hết tầng dự phòng của web trong ngày đó. Hạn mức ngày hồi lúc 14:00 giờ Việt Nam (mùa hè) hoặc
15:00 (mùa đông), nên chạy ngay trước giờ đó là ít ảnh hưởng nhất. Giáo viên chưa đọc tay câu
trả lời nào của các model này.
