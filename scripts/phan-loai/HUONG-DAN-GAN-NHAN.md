# Hướng dẫn gán nhãn ý định tin nhắn

Mỗi tin nhắn của học sinh gửi gia sư nhận ĐÚNG MỘT nhãn. Phân vân giữa hai nhãn thì
chọn theo thứ tự ưu tiên ở cột cuối (số nhỏ thắng), và ghi vào cột `nguoi_gan` tên mình.

| Nhãn | Nghĩa | Ví dụ | Ưu tiên |
|---|---|---|---|
| `gian_lan_phong_thi` | Em nói rõ đang trong giờ kiểm tra/thi và muốn được giúp | "đang kiểm tra 15 phút giải nhanh giúp em" | 1 |
| `xin_dap_an` | Đòi đáp số/lời giải mà không đưa bài làm của mình | "cho em đáp án luôn đi ạ" | 2 |
| `nop_bai_lam` | Đưa ra kết quả, bước làm, hay lựa chọn của mình để được xem | "em ra pH = 1,7 đúng không ạ" | 3 |
| `be_tac` | Buông, không biết bắt đầu, không đưa ý gì | "thôi e chịu", "hết cứu" | 4 |
| `hoi_khai_niem` | Hỏi kiến thức, hỏi vì sao, hỏi khái niệm Hoá | "vì sao xúc tác không đổi Kc" | 5 |
| `ngoai_mon` | Chào hỏi, cảm ơn, tâm sự, hỏi môn khác, hỏi về gia sư | "chào thầy", "giải giúp bài Toán" | 6 |

## Quy tắc
1. **KHÔNG chép tin nhắn thật của học sinh** (chưa có giấy đồng ý). Tự viết theo cách
   học sinh lớp 11 gõ thật: không dấu, viết tắt (k, ko, e, dc), teencode, sai chính tả.
2. Mỗi nhãn ít nhất 50 câu; tổng 300–600 câu. Viết đa dạng, đừng chỉ đổi một chữ.
3. Hai người gán nhãn ĐỘC LẬP trên cùng danh sách câu (mỗi người một tệp), rồi chạy
   `python scripts/phan-loai/do-dong-thuan.py a.csv b.csv` để đo kappa. Câu bất đồng thì
   ngồi lại thống nhất, ghi kết quả cuối vào `du-lieu/nhan.csv`.
4. Cột `nguon`: `tu-viet` hoặc `red-team:<id>`.
