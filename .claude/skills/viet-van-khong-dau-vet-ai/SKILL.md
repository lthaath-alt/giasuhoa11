---
name: viet-van-khong-dau-vet-ai
description: Bộ 50 quy tắc viết nghiêm ngặt giúp văn bản tiếng Việt và tiếng Anh cụ thể, tự nhiên, không mang dấu vết văn phong AI (dựa trên trang Wikipedia "Signs of AI writing"), kèm script tự quét lỗi. Dùng skill này mỗi khi viết, viết lại, biên tập hoặc soát bất kỳ văn bản nào người dùng sẽ gửi, nộp hoặc đăng, như bài viết, báo cáo, tiểu luận, bài Wikipedia, bài mạng xã hội, email, thư, bình luận, mô tả sản phẩm, commit message. Cũng dùng khi người dùng nói "viết tự nhiên", "đừng giống AI", "bỏ giọng văn AI", "văn này có giống AI không", "soát văn phong", "theo bộ quy tắc viết của tôi", hoặc nhờ kiểm tra dấu gạch dài, từ sáo rỗng, từ nối rập khuôn, kể cả khi không nhắc tên skill.
---

# Viết văn không dấu vết AI

Mô hình ngôn ngữ có xu hướng chọn cách nói phổ biến nhất. Kết quả là chi tiết cụ thể bị thay bằng lời khen chung chung, chủ đề vừa mờ đi vừa bị thổi phồng, kèm một bộ từ ngữ và định dạng rất dễ nhận ra. Skill này kéo văn bản về phía ngược lại: cụ thể, kiểm chứng được, viết thẳng.

Người dùng coi đây là quy tắc bắt buộc. Văn bản còn vi phạm thì chưa được giao.

## Phạm vi

- Áp dụng cho văn bản giao cho người dùng: nội dung trong file, hoặc đoạn văn họ sẽ sao chép đi dùng. Lời trao đổi giữa bạn và người dùng xung quanh văn bản đó không bị ràng buộc, nhưng hãy tách bạch rõ đâu là văn bản giao.
- Tiếng Việt và tiếng Anh: áp dụng nguyên văn danh sách từ cấm. Ngôn ngữ khác: áp dụng tinh thần các quy tắc.
- Yêu cầu rõ ràng của người dùng được ưu tiên hơn quy tắc (ví dụ họ cần danh sách gạch đầu dòng, hay văn bản hành chính bắt buộc "Kính gửi"). Khi đó làm theo họ và ghi chú ngắn quy tắc nào đang được miễn.

## Trước khi bắt đầu

Đọc `references/rules.md` một lần trong phiên làm việc. File đó có đủ 50 quy tắc (mã Q1 đến Q50), danh sách từ cấm và ví dụ sai/đúng. Phần dưới đây chỉ là bản tóm tắt để nhớ nhanh.

## Chế độ A: viết hoặc viết lại

1. Xác định nơi đăng. Nơi đó có hiển thị Markdown không? Tiếng Anh cần Anh-Anh hay Anh-Mỹ? Văn bản thuộc loại gì (bài, email, mô tả chỉnh sửa)?
2. Gom dữ kiện trước khi viết: số liệu, tên, ngày, nguồn. Thiếu dữ kiện thì hỏi người dùng hoặc bỏ phần đó. Không lấp chỗ trống bằng lời chung chung, không bịa nguồn, vì chính các câu lấp chỗ là thứ tạo ra giọng AI.
3. Viết nháp theo các quy tắc cốt lõi bên dưới.
4. Lưu nháp ra file tạm và chạy script (xem mục "Chạy script").
5. Sửa hết mọi LỖI. Cân nhắc từng XEM LẠI: nếu từ đó dùng theo nghĩa đen hoặc thật sự cần thì giữ. Chạy lại đến khi còn 0 LỖI.
6. Tự rà những gì script không bắt được (xem mục cuối).
7. Giao bản cuối. Nói ngắn gọn điều gì chưa kiểm chứng được, ví dụ link hay trang sách chưa mở được.

## Chế độ B: soát văn bản có sẵn

1. Lưu văn bản ra file nếu cần, chạy script.
2. Đọc thêm bằng mắt theo các quy tắc script không bắt được.
3. Báo cáo theo nhóm (nội dung, từ ngữ, trình bày, dấu vết chatbot, nguồn). Mỗi vi phạm gồm: đoạn trích, mã quy tắc, cách sửa gợi ý.
4. Chỉ viết lại toàn bộ khi người dùng yêu cầu.
5. Dấu hiệu không phải bằng chứng. Không kết luận "văn này do AI viết" chỉ vì đếm được nhiều vi phạm; nói là "có nhiều đặc điểm giống văn AI". Ngữ pháp hoàn hảo, văn trang trọng hay "nhạt" không phải dấu hiệu (xem Phụ lục trong rules.md).

## Chạy script

```bash
node scripts/check_text.js <file> [--markdown-ok] [--summary]
```

- `--markdown-ok`: nơi đăng hỗ trợ Markdown, nên không báo lỗi `#` tiêu đề, `[chữ](link)`, khối code. In đậm và danh sách "tiêu đề in đậm:" vẫn bị báo.
- `--summary`: văn bản là mô tả chỉnh sửa hoặc commit message, bật thêm quy tắc Q44.
- `-` thay cho tên file để đọc từ stdin.
- Mã thoát 1 nghĩa là còn LỖI.

Script chỉ cần Node.js, không cần cài thư viện. Nếu môi trường không có Node, tự rà theo Phần 8 trong rules.md bằng cách tìm kiếm thủ công.

## Quy tắc cốt lõi (tóm tắt)

Nội dung (Q1–Q12). Nêu sự việc thay vì tuyên bố tầm quan trọng. Nói nguồn viết gì thay vì khoe được báo chí đưa tin. Không gắn lời bình cuối câu ("highlighting…", "qua đó cho thấy…"). Không giọng quảng cáo. Nhận định nào cũng có người nói cụ thể. Không kết bài bằng "thách thức và triển vọng", không "Tóm lại". Không biết thì không viết, không suy đoán. Không răn dạy người đọc.

Từ ngữ (Q13–Q22). Không dùng các từ trong danh sách cấm (delve, pivotal, showcase, underscore, vibrant, tapestry…; "nâng tầm", "then chốt", "nổi bật", "trong bối cảnh"…). Dùng "là", "có" thay cho "serves as", "đóng vai trò là", "sở hữu". Nói thẳng quan hệ thay cho "gắn liền với". Không "không chỉ… mà còn", "It's not X, it's Y". Không bộ ba cho tròn câu. Không từ nối rập khuôn đầu câu ("Additionally", "Ngoài ra", "Bên cạnh đó"). Chọn từ đơn giản. Được lặp từ.

Trình bày (Q23–Q31). Không dấu gạch dài. Nháy thẳng. Không in đậm nhấn mạnh. Ưu tiên văn xuôi, không danh sách "tiêu đề in đậm: mô tả". Tiêu đề chỉ viết hoa chữ đầu. Không emoji, không đường kẻ ngang, không nhảy cấp tiêu đề, không bảng nhỏ vô ích. Đúng cú pháp nơi đăng.

Dấu vết chatbot (Q32–Q37). Không câu trò chuyện ("Hy vọng giúp ích", "Dưới đây là"). Không chỗ trống chưa điền. Không mã nội bộ (oaicite, turn0search, [cite: 1]…). Không utm_source. Không tự khen bài.

Nguồn (Q38–Q43). Chỉ trích nguồn đã đọc. Link, DOI, trang sách phải đúng. Nguồn đặt sau câu nó chứng minh.

Bình luận, email, mô tả chỉnh sửa (Q44–Q46). Nói nội dung cụ thể đã đổi. Không "ensured neutrality", "preserved", "added sourced content". Không mở đầu theo khuôn ("I hope this message finds you well").

Giọng văn (Q47–Q50). Nhất quán biến thể ngôn ngữ. Không kéo dài. Không làm giả "chất người" bằng lỗi cố ý.

## Script không bắt được, phải tự rà

- Q18: bộ ba tạo nhịp.
- Q1, Q3: câu ngầm khen tầm quan trọng mà không dùng từ cấm.
- Q5, Q6: nhận định thiếu người nói cụ thể, lời gán cho người thật chưa kiểm.
- Q9: câu lấp chỗ thiếu thông tin.
- Q21: đổi từ đồng nghĩa chỉ để tránh lặp.
- Q38–Q43: nguồn. Nếu có công cụ duyệt web thì mở từng link; không có thì báo người dùng là chưa kiểm.
- Q47–Q49: nhất quán, lặp ý, dài dòng.

Cuối cùng đọc lại từng câu và hỏi: câu này có cho người đọc thêm một sự thật kiểm chứng được không? Không thì xóa.

## Lưu ý

Bộ quy tắc giúp văn bản rõ và chính xác hơn. Nó không thay cho việc khai báo có dùng AI ở nơi yêu cầu (trường học, tạp chí, Wikipedia). Nếu người dùng cho biết văn bản dành cho nơi như vậy, nhắc họ một câu về việc khai báo rồi tiếp tục.
