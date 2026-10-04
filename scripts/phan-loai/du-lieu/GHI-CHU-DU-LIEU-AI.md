# Bộ dữ liệu hiện tại do AI sinh và AI gán nhãn — đọc trước khi trích số liệu

Ngày 02/10/2026, theo yêu cầu của người dùng, Claude (trợ lý AI) đã tạo bộ dữ liệu
đầu tiên để chạy thử toàn bộ quy trình. **Đây KHÔNG phải dữ liệu nhóm tự gán nhãn.**
Muốn ghi "nhóm tự gán nhãn" trong báo cáo NCKH thì nhóm phải làm lại theo
`../HUONG-DAN-GAN-NHAN.md` và thay các tệp dưới đây.

| Tệp | Nội dung |
|---|---|
| `ai-sinh-claude-a.csv` | 360 câu do AI (claude-a) viết theo hướng dẫn, 60 câu/nhãn, kèm nhãn ý định khi viết |
| `ai-nguoi-gan-1.csv` | Người gán 1: nhãn của claude-a cho 360 câu trên + claude-c gán mù 78 câu tấn công |
| `ai-nguoi-gan-2.csv` | Người gán 2: claude-b gán mù cả 438 câu (đã xáo, bỏ cột nguồn để không lộ gợi ý) |
| `nhan.csv` | Bản cuối: 433 câu hai bên trùng + 5 câu phân xử (`phan-xu:claude`) |

- Không có tin nhắn thật nào của học sinh. 78 câu `red-team:*` là câu tấn công do nhóm soạn.
- Đồng thuận giữa hai lượt AI: 433/438 = 98,9 %, Cohen's kappa 0,986. Con số cao vì câu AI
  viết "sạch", mỗi câu một ý; người thật gán tin nhắn thật sẽ thấp hơn — đừng trích như
  kappa giữa hai người.
- 5 câu bất đồng đều được phân xử thành `xin_dap_an`: một câu chỉ có ảnh đề thi (không
  nói đang thi), bốn câu dò khoảng đáp số kiểu "pH có lớn hơn 1 không ạ?" (không đưa
  bài làm của em).
- Kết quả huấn luyện ngày 02/10/2026 (mô hình `2026-10-02-1154`, tập kiểm 88 câu):
  độ chính xác 92,0 %, F1 trung bình 0,923. So với regex: bế tắc F1 57,1 % → 93,8 %,
  gian lận phòng thi F1 73,7 % → 90,9 % (`../ket-qua/so-sanh.md`). Câu do AI viết có
  nhiều câu không dấu mà regex chỉ khớp chữ có dấu, nên khoảng cách này có phần nghiêng
  về phía mô hình; cần đo lại trên dữ liệu nhóm tự viết.
