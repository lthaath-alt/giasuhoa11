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

## Chưa đo

Bốn bản Flash (3.8, 3.7, 3.5, 3-flash-preview) chưa chạy bộ 20 tình huống: mỗi bản chỉ có
khoảng 20 lượt/ngày ở bậc miễn phí, chạy là dùng hết tầng dự phòng của web trong ngày đó.
Hạn mức ngày hồi lúc 14:00 giờ Việt Nam (mùa hè) hoặc 15:00 (mùa đông), nên chạy ngay trước
giờ đó là ít ảnh hưởng nhất. Giáo viên chưa đọc tay câu trả lời nào của các model này.
