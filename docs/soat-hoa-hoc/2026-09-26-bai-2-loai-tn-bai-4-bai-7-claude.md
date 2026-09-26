# Soát nội dung hoá học — 26/9/2026 — đường C: subagent Claude

Phạm vi: ba đề dẫn `de-dan-2026-09-22-1946-*` chưa có kết quả —
`bai-2-loai-tn` (30 câu), `bai-4` (46 câu), `bai-7` (73 câu). Mỗi đề dẫn MỘT
lượt, một subagent Claude đọc bản chụp `public/bank/ngan-hang.json` qua tệp đề
dẫn (không gửi gì ra ngoài). Mỗi subagent báo đúng số câu và id câu cuối của
tệp, tức đã đọc hết.

> Một lượt, một mô hình. "Không thấy gì" ở đây KHÔNG có nghĩa là sạch — xem
> `docs/claude-reference/chemistry.md`, mục "Một lượt soát là không đủ".
> Mọi chỗ dưới đây đã được kiểm lại tay; chỗ nào chẩn sai đã loại và ghi rõ.

## Đáp án/phép tính

Không câu nào sai đáp án hay sai phép tính. Các phép tính đã tự tính lại, khớp:
pH các câu tn Bài 2; P + NaOH ra 25,1 g (0,15 mol NaH₂PO₄ + 0,05 mol
Na₂HPO₄); 60 g CuSO₄·5H₂O chứa 38,4 g CuSO₄, pha được 4800 g dung dịch 0,8 %;
các bài Fe + S, SO₂ + O₂ của Bài 7.

## Đáng xem lại (chủ dự án quyết cách sửa)

| id (đuôi) | Bài | Vấn đề | Kiểm tay |
|---|---|---|---|
| `bdr93` | 7 | Ý 4 "S là chất còn dư sau phản ứng nung" ghi **sai**. Tính lại: a = 4x, b = 2x (S thiếu, H = 50 %) → sau nung vẫn còn x mol S chưa phản ứng. Hiểu "còn dư" theo nghĩa đen thì ý này ĐÚNG; hiểu là "lấy dư" thì SAI | **Giữ — câu mơ hồ**, học sinh hiểu đúng vẫn có thể bị chấm sai |
| `k8efc` | 2 (tn) | Tính pH dung dịch đệm CH₃COOH/CH₃COO⁻ bằng Ka | Đáp án 5,06 đúng. Nghi **ngoài chương trình** Hoá 11 KNTT; giám khảo Hoá của hội đồng giả lập cũng nêu câu này độc lập |
| `wnwch` | 2 (tn) | Dùng pKa, phương trình đệm (Henderson–Hasselbalch) | Đáp án 5,88 đúng. Nghi **ngoài chương trình** |
| `ivfj5`, `jd49p`, `uab7q` | 4 | Bài P + NaOH (phosphorus) | Đáp án đúng. Phosphorus **không có** trong chương 2 Hoá 11 KNTT (chỉ Nitrogen, Sulfur) — ngoài chương trình, lại gắn vào Bài 4 |
| `2gd5x`, `57vti`, `zuq5w` | 4 | Pha dung dịch CuSO₄ từ tinh thể ngậm nước | Đáp án đúng. **Gắn nhầm bài** (không liên quan Nitrogen) |
| `cqo5w` | 7 | "Muối làm bột nở": đáp án (NH₄)₂CO₃; phương án NH₄HSO₃ nghi gõ nhầm từ NH₄HCO₃ (muối sách KNTT nêu làm bột nở) | Tin thấp. Đáp án hiện tại chấp nhận được; câu cũng **gắn nhầm bài** (thuộc Bài 5) |

Bài 7 còn khoảng 13 câu về ammonia, N₂, Fe + HNO₃ — nội dung đúng nhưng gắn
nhầm bài (subagent đếm, chưa kiểm từng câu).

## Đã loại

- `ly8os` (Bài 4): subagent lo phương án "cả A, B, C đều đúng." sẽ sai khi app
  xáo phương án. **Loại**: `src/features/bank/xaoDapAn.ts:40` có mẫu `MAU_NEO`
  khớp "cả A…", câu có phương án neo thì KHÔNG bị xáo.
