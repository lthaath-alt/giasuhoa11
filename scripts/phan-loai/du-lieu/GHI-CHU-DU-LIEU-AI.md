# Bộ cũ 438 câu: AI viết, người gán nhãn (từ 05/10/2026) — đọc trước khi trích số liệu

## Hiện trạng (từ 05/10/2026)

`nhan.csv` vẫn là 438 câu cũ, nhưng nhãn giờ do NGƯỜI gán: một thành viên nhóm (`nguoi_gan` =
`quang-khai`) gán lại cả 438 câu ngày 05/10/2026 trên bảng Excel `gan-lai-438-cau-bo-cu.xlsx`
(ô nhãn để trống, thứ tự câu đã xáo, không có cột nguồn), theo bộ 8 nhãn. Câu thì không
đổi: 360 câu nguồn `ai-sinh` do AI viết, 78 câu `red-team:*` là câu tấn công. Trong báo cáo ghi
đúng như vậy: **câu do AI viết, nhãn do một người trong nhóm gán**. Chưa được ghi là "hai người
gán độc lập", và không có kappa giữa hai người cho bộ này.

Những điều phải nêu kèm khi trích:

- **Một người gán.** Chưa có người thứ hai gán lại, nên không có độ đồng thuận giữa người với người.
- **51 nhãn khác lần gán đầu.** Lần gán đầu có 420 câu thuộc 8 nhãn, 13 câu chọn "(Bỏ câu
  này)" và 5 ô trống. Sau đó người gán đối chiếu với một bản rà soát do AI (Claude) soạn, duyệt
  và đổi nhãn 52 câu (gồm cả 18 câu bỏ/trống, phần lớn về `ngoai_mon`), theo các quy tắc nay đã
  ghi ở tám dòng cuối mục Ca khó của `../HUONG-DAN-GAN-NHAN.md`. Cùng ngày, một câu trong 52 câu đó
  ("cô nói 10 phút nữa nộp bài kiểm tra 1 tiết", stt 88 trong bảng) được trả về nhãn người gán
  chọn lúc đầu (`ngoai_mon`), vì định nghĩa `gian_lan_phong_thi` cần có lời nhờ giúp. Nhãn cuối là
  nhãn người gán đã duyệt, nhưng 51 câu còn lại không còn là nhãn gán lần đầu.
- **So với nhãn AI cũ.** Lần gán đầu trùng nhãn AI ở 369/420 câu (87,9 %), Cohen's kappa 0,854.
  Đây là đồng thuận giữa MỘT người và nhãn AI, đừng trích như kappa giữa hai người. Bản cuối
  khác nhãn AI ở 23 câu: `nop_bai_lam` → `tra_loi_gia_su` 14, `nop_bai_lam` → `xin_dap_an` 6,
  `be_tac` → `ngoai_mon` 1, `gian_lan_phong_thi` → `ngoai_mon` 1, `hoi_khai_niem` → `xin_dap_an` 1.
- **Gán không có ngữ cảnh.** Bộ cũ là câu rời, không có cột "ChemAI vừa nói". 14 câu
  `tra_loi_gia_su` trong bộ này được gán khi không biết gia sư vừa hỏi gì.
- **Phân bố nhãn:** `xin_dap_an` 110, `be_tac` 77, `ngoai_mon` 63, `hoi_khai_niem` 62,
  `gian_lan_phong_thi` 61, `nop_bai_lam` 51, `tra_loi_gia_su` 14, `xin_de` 0.
- **Câu vẫn do AI viết.** Mọi nhận xét cũ về câu AI viết (câu "sạch", nhiều câu không dấu làm
  regex thua) vẫn đúng. Biểu đồ hết chữ chìm "NHÃN DO AI GÁN" nhưng dòng chân ảnh vẫn ghi 360
  câu AI viết.

Bản nhãn AI trước ngày 05/10/2026 còn trong lịch sử git của `nhan.csv` (trước commit `62c74c3`)
và, trên máy chủ dự án, ở `sao-luu/nhan-ai-truoc-gan-lai-2026-10-05.csv` (không lên git). Bảng
Excel đã gán (bản gốc và bản đã sửa, có dấu "[sửa theo rà soát 05/10: …]" ở 52 câu) do người gán
giữ; đó là chỗ duy nhất ghi lại câu nào đổi sau lần gán đầu. Bản đã sửa vẫn ghi stt 88 là Gian lận
phòng thi; `nhan.csv` mới là bản đúng cho câu này.

Kết quả huấn luyện ngày 05/10/2026 (mô hình `2026-10-05-2342`; 497 câu = 438 câu bộ này + 59
câu thật, chia 80/20 thành 397 câu học và tập kiểm TẠM 100 câu): độ chính xác 84,0 %, F1 macro 0,821
(khoảng tin cậy 95 %: 0,682–0,898). Mô hình `2026-10-05-2241` học trước khi trả nhãn câu stt 88 đạt
89,0 % và 0,867; hai lần chỉ khác MỘT nhãn, nhưng phép chia 80/20 giữ tỉ lệ nhãn nên 12/100 câu của
tập kiểm đổi và C được chọn đổi từ 16 sang 4. Chênh lệch này là độ dao động của tập kiểm tạm, không
phải mô hình kém đi; nó cho thấy vì sao phải chốt tập kiểm cố định trước khi trích số. Chưa dùng cho
báo cáo vì tập kiểm cố định chưa chốt (xem `../README.md` bước 2b).

## Lịch sử: lượt chạy thử bằng AI (02/10/2026)

Ngày 02/10/2026, theo yêu cầu của người dùng, Claude (trợ lý AI) đã tạo bộ dữ liệu
đầu tiên để chạy thử toàn bộ quy trình: AI viết câu và AI gán nhãn. Các số dưới đây là của
lượt đó, **không phải của nhãn hiện tại trong `nhan.csv`**.

| Tệp | Nội dung |
|---|---|
| `ai-sinh-claude-a.csv` | 360 câu do AI (claude-a) viết theo hướng dẫn, 60 câu/nhãn, kèm nhãn ý định khi viết |
| `ai-nguoi-gan-1.csv` | Người gán 1: nhãn của claude-a cho 360 câu trên + claude-c gán mù 78 câu tấn công |
| `ai-nguoi-gan-2.csv` | Người gán 2: claude-b gán mù cả 438 câu (đã xáo, bỏ cột nguồn để không lộ gợi ý) |
| `nhan.csv` (tới 04/10/2026) | 433 câu hai lượt AI trùng + 5 câu phân xử (`phan-xu:claude`). Từ 05/10/2026 đã thay bằng nhãn người gán, xem mục trên |

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
