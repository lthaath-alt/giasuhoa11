# Soát nội dung hoá học — 27/9/2026 — Chương 3, đường C: subagent Claude

Phạm vi: toàn bộ 484 câu Chương 3 (Đại cương hoá học hữu cơ), qua sáu đề dẫn
`de-dan-2026-09-26-0014-*` (Bài 10: 78, Bài 11: 109, Bài 12 mc/tf/tn: 75/68/38,
Bài 13: 107) cộng 9 câu chưa gắn bài. Sáu subagent, mỗi phần MỘT lượt; mỗi
subagent báo đúng số câu và id câu cuối.

> Một lượt, một mô hình — "không thấy gì" không có nghĩa là sạch. Mọi chỗ dưới
> đây đã kiểm tay; chỗ chẩn sai đã loại. Có tra chéo bộ số (bài học từ `r59e7`).

## 1. Số liệu tự mâu thuẫn — đã kiểm tay

Bộ "đốt 4,4 g X (C, H, O); bình H₂SO₄ tăng 3,6 g; 20 g CaCO₃; d/H₂ = 30" ở
**ba câu**: `zu2op` (mc), `41i8e` (tf), `yqngn` (tn). Tính: C 0,2 mol (2,4 g), H
0,4 mol (0,4 g) → O = 1,6 g (0,1 mol) → C:H:O = 2:4:1 → CTĐGN C₂H₄O (M = 44),
**không** khớp M = 60. Lời giải cả ba viết "2:4:1" rồi kết luận C₂H₄O₂.
Đổi 4,4 g → **6,0 g**: O = 3,2 g (0,2 mol) → 1:2:1 → CH₂O, M = 60 → C₂H₄O₂;
đáp án của cả ba giữ nguyên. Riêng `41i8e` ý 4 "số O bằng số C" (Sai) sẽ thành
Đúng với C₂H₄O₂ → viết lại thành "số O gấp đôi số C" (vẫn Sai).

## 2. Mơ hồ / nhiều đáp án — đã kiểm tay

| id | Vấn đề |
|---|---|
| `a6zhp` (tf) | "1 mol X cần 3,5 mol O₂" → ý "CTPT của X là C₃H₈O₃" ghi Đúng, nhưng C₂H₆, C₃H₄O cũng cần 3,5 mol |
| `13zzr` (tf) | "dẫn xuất có M = 46" → "CTPT là C₂H₆O" ghi Đúng, nhưng HCOOH (CH₂O₂) cũng 46 |
| `uegw5` (mc) | Tiền đề "phân tử khối ứng với peak cường độ lớn nhất" — sai nguyên tắc: M⁺ là peak m/z lớn nhất (câu `0voi3` cùng kho dạy đúng) |
| `mwyt8` (tn) | "Số đồng phân cấu tạo mạch hở C₃H₆O" = 4 chỉ đúng khi bỏ enol |
| `cfgww`, `yclel` (tf) | Ý viết "phương pháp cần điền", "định nghĩa trên" nhưng đề không có chỗ trống/định nghĩa |
| `fo3iq` (tf) | "Phổ IR **chỉ** cho biết nhóm chức" — khái quát quá mức |
| `c3axi`, `4yuc7` (mc) | Mô tả phổ IR chưa loại hẳn HOC₂H₄COOH |

Lời giải lệch: `tgb3y` suy M từ "peak mạnh nhất". Ngoài chương trình:
`gahmc` (amine bậc 1/2/3 — Hoá 12).

## 3. Đã loại

`b960o` — các phương án chỉ có đúng một chất cần 3,5 mol O₂. `x3jjo`
("chưng cất phân đoạn" cho nấu rượu) — sửa cần đổi phương án (`o`), để nguyên.
`kf0ut` (HCN vô cơ?) — lời giải đã nêu rõ quy ước. Các cặp trùng lặp
(`c3axi`/`4yuc7`, `1kc0t`/`hlt1r`, `s3yzo`/`jehnx`) — script không xoá.

## 4. Gắn bài

69 câu đọc lại từng câu, đồng ý cả 69 (60 câu gắn nhầm + 9 câu chưa gắn bài):
phổ IR và đặc điểm chung → Bài 10; phổ MS, tỉ khối, lập CTPT → Bài 12; đồng
phân → Bài 13; chiết, sắc kí → Bài 11. Script mở cho `lessonId` cũ là `null`
(câu chưa gắn bài). `b:3:vd:4` (đề xuất sang Chương 4) — khác chương, không chuyển.

## 5. Phiếu

`sua-20-muc-chuong-3.json` (không đổi đáp án câu nào) và
`sua-69-cau-chuong-3-gan-bai.json`. Chạy thử khớp 20/20 và 69/69.
Nguồn duyệt: chủ dự án ghi `--that` sau khi xem bảng này.

**Đã ghi Firestore 27/09/2026**, chạy thử lại 20/20 và 69/69 "đã sửa rồi";
bản chụp mới đối chiếu khớp 89/89 mục. Lượt `--that` đầu của phiếu 20 bỏ qua
ý thứ hai của `cfgww`, `yclel` — lỗi script (so với ảnh chụp trước khi chính
lượt đó ghi ý đầu), không mất dữ liệu; đã sửa script rồi chạy lại.
