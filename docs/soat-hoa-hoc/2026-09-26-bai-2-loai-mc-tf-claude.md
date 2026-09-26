# Soát nội dung hoá học — 26/9/2026 — Bài 2 mc + tf, đường C: subagent Claude

Phạm vi: `de-dan-2026-09-22-1946-bai-2-loai-mc` (107 câu) và `-loai-tf` (93
câu). Mỗi đề dẫn MỘT lượt, một subagent Claude; mỗi subagent báo đúng số câu
và id câu cuối của tệp (`xnq8d`, `l1b5n`), tức đã đọc hết.

**Đối chiếu với đường B:** cùng 200 câu này, Antigravity chạy 4 lượt (22/09,
hai lượt mc + hai lượt tf) và 2 lượt ngày 20/09 — tất cả trả `[]`. Lượt Claude
dưới đây bắt được 2 câu mơ hồ thật và 2 câu ngoài chương trình chưa gắn nhãn.
Nên các báo cáo `[]` của Bài 2 qua Antigravity không đủ tin cậy.

> Một lượt, một mô hình — "không thấy gì" ở phần còn lại KHÔNG có nghĩa là
> sạch. Mọi chỗ dưới đây đã kiểm lại tay; chỗ chẩn sai đã loại và ghi rõ.

## Đáng xem lại — đã kiểm tay

| id (đuôi) | Loại | Vấn đề | Kiểm tay |
|---|---|---|---|
| `1xtfx` | mc | "Chỉ dùng quỳ tím" nhận biết 3 dung dịch: phương án 3 (Ba(OH)₂, NaOH, H₂SO₄) cũng làm được nếu dùng H₂SO₄ vừa nhận ra thử tiếp (Ba(OH)₂ cho ↓ BaSO₄) — quy ước thường gặp của đề Việt Nam | Đúng — **hai đáp án** |
| `tzcf8` | tf | Ý 1 "acid mạnh + base mạnh có phương trình ion rút gọn H⁺ + OH⁻ → H₂O" ghi Đúng; phản ví dụ H₂SO₄ + Ba(OH)₂ (có ↓ BaSO₄) | Đúng — **mơ hồ** |
| `axxej` | mc | Dung dịch đệm, Ka (bản trắc nghiệm của `k8efc`) | Đáp án 5,06 đúng; **ngoài chương trình, chưa nhãn** |
| `uzhen` | tf | Ksp, pKa | Tính lại: Ur⁻ tối đa 4,92·10⁻⁴ M, Ur⁻/HUr = 100 — các nhãn đúng; **ngoài chương trình, chưa nhãn** |
| `kf8xd` | mc | Nguyên lí Le Chatelier | **Gắn nhầm** Bài 2, thuộc Bài 1 (cùng chương 1) |
| `19ya7` | tf | Nguyên lí Le Chatelier | **Gắn nhầm** Bài 2, thuộc Bài 1 |
| `b:1:vd:4` | mc | Độ điện li α | Đáp án đúng; có trong SGK KNTT 11 hay không — **thầy Văn đối chiếu**. Để nguyên |
| `60nvd` | tf | `giai_thich` viết "pH tỉ lệ nghịch với [H⁺]" — đúng ra là nghịch biến | Nhãn Đ/S đúng; lỗi nhẹ ở trường `e`, script chưa mở trường này. Để nguyên |

## Đã loại

- `5lv4x`: subagent báo chưa có nhãn — đề dẫn soạn 22/09, câu đã gắn nhãn sáng
  26/09 (`sua-7-cau-ngoai-chuong-trinh.json`).
- `cs9ct` (mc), `oz468` (tf): trộn ý Bài 1 lẫn Bài 2 (phương án/ý về môi trường
  muối) — để ở Bài 2 hợp lý.
- "Cặp gần trùng" `7tve2`/`grbuw`, `i050l`/`z78lw`: so từng chữ, đề và các ý
  khác nhau — không phải bản sao.

## Chủ dự án quyết (26/09/2026)

Phiếu `sua-6-cau-bai-2.json`, không đổi đáp án ở câu nào:

- `1xtfx`: thêm vào đề "(không dùng thêm thuốc thử nào khác, kể cả các chất
  đã nhận ra)" → chỉ còn đáp án 0.
- `tzcf8` ý 1: "giữa acid mạnh và base mạnh" → "giữa HCl và NaOH" (vẫn Đúng).
- `axxej`, `uzhen`: gắn nhãn `[Nâng cao – ngoài SGK]`.
- `kf8xd`, `19ya7`: `lessonId` bai-2 → bai-1.
