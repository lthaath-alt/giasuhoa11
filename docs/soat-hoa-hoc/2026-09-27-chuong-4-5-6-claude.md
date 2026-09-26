# Soát nội dung hoá học — 27/9/2026 — Chương 4, 5, 6, đường C: subagent Claude

Phạm vi: ba đề dẫn `de-dan-2026-09-26-0056-chuong-{4,5,6}` — Chương 4
Hydrocarbon (40 câu), Chương 5 Dẫn xuất halogen – alcohol – phenol (29),
Chương 6 Carbonyl – carboxylic acid (27); tổng 96 câu. Ba subagent, mỗi
chương MỘT lượt; mỗi subagent báo đúng số câu và id câu cuối. Cả 96 câu AI
chính đọc lại, tính lại mọi bài toán.

> Một lượt, một mô hình — "không thấy gì" không có nghĩa là sạch.

## 1. Đáp án sai

**Không có.** Tự tính lại: C4 vd:1–vd:6, vdc:0–vdc:3, `20bvd`, `vr6c0`,
`t00z1`, `4c6r6`/`rwlqd` (−1718, −2222, 414160 kJ); C5 vd:0–vd:6,
vdc:0–vdc:3 (`vd:3`/`vdc:3` cùng bộ số, khớp); C6 vd:0–vd:6, vdc:0–vdc:3
(`vd:2`/`vdc:3` cùng bộ số, khớp). Đồng phân C₄H₈ (3 cấu tạo, 4 kể hình học)
và C₅H₁₀ (5) nhất quán ở cả sáu câu dùng chung.

## 2. Đề thiếu dữ kiện / mơ hồ / lời giải sai — đã kiểm tay

| id | Vấn đề | Sửa (phiếu) |
|---|---|---|
| `4c6r6` (mc), `rwlqd` (tf) | "Dựa vào năng lượng liên kết" nhưng đề KHÔNG cho giá trị nào; lời giải dùng 347/413/498/745/467 | Thêm dòng năng lượng liên kết vào đề (đáp án giữ nguyên) |
| `t00z1` (mc) | Đáp án đúng; lời giải loại C₃H₄ sai lý do ("alkyne ít C nhất là C₂H₂"); phép tính cần giả định O vừa hết | Đề: "sau phản ứng chỉ thu được CO₂ và hơi nước"; lời giải viết lại, loại C₃H₄ bằng số H (3,5 < 4) |
| `h8hgt` (tf) | "(C) + NaBr → (F) + (G)": F có thể hiểu là NaCl → ý "F là bromine" thành Sai | Viết rõ "(C) + 2NaBr → 2NaCl + (F)…"; ý 3 bỏ ký hiệu G |
| `rhjnk` (tf) | Lời giải "chiếu sáng nhiệt độ" thiếu chữ | "chiếu ánh sáng tử ngoại" |
| `g647q` (mc) | Lời giải "phương pháp sunfat" | "sulfate" |
| `b:6:th:7` (mc) | Lời giải: CH₃CH(OH)− "bị oxi hoá thành methyl ketone" — ethanol cho acetaldehyde | Viết lại: carbonyl có CH₃CO− (methyl ketone, acetaldehyde); acid không cho |

Không sửa (cần đổi phương án `o`, script chưa mở):
`b:4:th:6` (benzene + nước bromine: lắc xong lớp nước nhạt màu thật → phương
án "nước bromine mất màu" gây tranh cãi), `b:5:th:5` (phương án "nước cất" về
lí thuyết cũng phân biệt được phenol/ethanol — tin thấp).

## 3. Ngoài chương trình / nhầm chương

- `g647q`, `h8hgt`: halogen VÔ CƠ (điều chế HCl, Cl₂ đẩy Br₂/I₂, nước Javel)
  — Hoá 10 KNTT, không phải dẫn xuất halogen. Nhãn mới `[Kiến thức Hoá 10]`
  (nhãn cũ `[Ngoài chương trình KNTT]` sai nghĩa: nội dung CÓ trong KNTT, chỉ
  khác lớp). Không gắn bài nào của Hoá 11 — để `lessonId` trống.
- `rhjnk`: sơ đồ có nhị hợp C₂H₂ → C₄H₄, alkadiene C₄H₆ + KMnO₄ — không có
  trong Hoá 11 KNTT → `[Nâng cao – ngoài SGK]`. `gkzd8` cùng sơ đồ nhưng chỉ
  hỏi phản ứng (2) (Pd/PbCO₃, có trong SGK) — giữ.
- `b:5:vdc:1` (tráng bạc sau khi oxi hoá ethanol) dùng kiến thức Chương 6 —
  câu tổng hợp, giữ.

## 4. Gắn bài

9 câu (8 chưa gắn + 1 nhầm): `b:4:nb:2`, `b:4:nb:6` → Bài 16; `b:4:th:6`
(benzene) Bài 16 → Bài 17; `b:5:nb:0` → Bài 20; `b:5:nb:5` (CFC), `b:5:th:6`
(KOH/ethanol) → Bài 19; `b:5:th:5`, `b:5:vdc:2` (so sánh ethanol – phenol) →
Bài 21; `b:6:nb:7` → Bài 24. Bài 19 trước nay chưa có câu nào: script lấy
chương của bài từ `constants.ts` khi bản chụp không biết.

`chapterId: "chuong-4"` ở 6 câu đồng phân: dấu vết đường nhập, app xếp chương
theo `ch` — không lệch.

## 5. Phiếu

`sua-11-muc-chuong-4-5-6.json` (không đổi đáp án câu nào) và
`sua-9-cau-chuong-4-5-6-gan-bai.json`. Chạy thử khớp 11/11 và 9/9.
Nguồn duyệt: chủ dự án ghi `--that` sau khi xem bảng này.

**Đã ghi Firestore 27/09/2026**, chạy thử lại 11/11 và 9/9 "đã sửa rồi"; bản
chụp mới đối chiếu khớp 20/20 mục, `h8hgt` giữ đáp án Đ/Đ/S/Đ; câu chưa gắn
bài cả kho 27 → 19.
