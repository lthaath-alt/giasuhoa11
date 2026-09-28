# Thí nghiệm & mô phỏng — 27/9/2026 — nội dung mới (mục 7: thầy Văn đã duyệt)

Chủ dự án yêu cầu thêm khuyến nghị thí nghiệm vì tab "Thí nghiệm" chỉ có 4 hiện
vật 3D. Nội dung do AI soạn, rồi **đối chiếu SGK KNTT theo yêu cầu thầy Văn** qua
các trang giải SGK chép lại đề mục thí nghiệm (mục 3). **Chưa đối chiếu sách
giấy hay sách điện tử chính thức** (hanhtrangso.nxbgd.vn không đọc được qua proxy),
**chưa qua giáo viên duyệt** — giao diện hiện nhãn vàng "Chờ giáo viên duyệt"
(`daDuyet: false`) cho tới khi thầy duyệt từng mục.

## 1. Đã thêm

| Phần | Tệp | Nội dung |
|---|---|---|
| Mô phỏng bóng đèn (3D) | `src/features/lessons/components/mo-phong/DenDienLi.tsx`, `DenDienLi3D.tsx`, `canh3d.ts` | 12 dung dịch 0,1 M: mạnh (HCl, NaOH, NaCl, KNO₃, H₂SO₄) sáng rõ; yếu (CH₃COOH, NH₃, HF) sáng mờ; không điện li (C₂H₅OH, saccharose, glycerol) và nước cất (điện li rất yếu) không sáng; phương trình + giải thích. Cảnh **3D** (thay hẳn hình 2D, chủ dự án chọn 27/09): cốc, hai bản điện cực, dây, khoá K, nguồn, bóng đèn; ion là quả cầu mang dấu, đóng mạch thì ion dương trôi về cực âm, ion âm về cực dương; chất điện li yếu có phân tử tách thành ion và cặp ion ghép lại (⇌). Kéo để xoay |
| Quá trình điện li nhiều nấc (3D) | `mo-phong/DienLiNhieuNac3D.tsx` | Mẫu 48 phân tử: lúc đầu còn nguyên → nấc 1 → nấc 2 (→ nấc 3) tách H⁺ theo thứ tự, rồi cân bằng động; số mỗi dạng đúng bằng phép tính Ka làm tròn trên 48 (H₂SO₄ 0,1 M: 0 / 44 / 4, 52 H⁺). Kéo nồng độ thì dịch dần tới phân bố mới. Nấc quá yếu để thấy thì ghi "cứ khoảng N phân tử mới có 1" |
| Mô phỏng chuẩn độ | `mo-phong/ChuanDo.tsx`, `mo-phong/tinhHoaHoc.ts` | Mặc định **đúng thực hành SGK tr. 25**: 10 mL HCl 0,1 M + phenolphthalein trong bình, NaOH chưa biết (0,080–0,125 M) trong burette 25 mL, dừng khi hồng nhạt bền ~10 giây. Thêm hai chế độ "Luyện thêm" (chất chưa biết trong bình). Màu tính từ pH thật; học sinh ghi V, tính C, được chấm (sai số ≤ 2 %) và xem lời giải |
| Mô phỏng điện li nhiều nấc | `mo-phong/DienLiNhieuNac.tsx`, `tinhHoaHoc.ts` | H₂SO₄, H₂SO₃, H₂CO₃, H₃PO₄; nồng độ tiểu phân, pH, độ điện li từng nấc giải từ Ka (pKa theo CRC Handbook). **Ngoài SGK** — nhãn "Mở rộng – nâng cao" |
| Thí nghiệm theo bài | `src/features/lessons/thiNghiemTheoBai.ts`, `components/ThiNghiemTheoBai.tsx` | 41 thẻ, đủ 6 chương: **33 thẻ có trong SGK** (nhãn "SGK tr. N", 3 trong số đó SGK chỉ mô tả) + **8 thẻ "Gợi ý thêm"** ngoài sách |
| 4 hiện vật 3D | `public/thi-nghiem.html` | C₂H₄ (chuối chín), C₂H₂ (đèn xì, liên kết ba), C₂H₅OH (cồn 70°), CH₃COOH ↔ CH₃COO⁻ (giấm, nút "Bớt H⁺", liên kết cộng hưởng) |
| Toàn màn hình | `mo-phong/KhungToanManHinh.tsx` | Nút ở từng mô phỏng và khung 3D; phủ kín cửa sổ bằng CSS + xin toàn màn hình thật; thoát bằng nút/Esc |

## 2. Đã kiểm

- **Số liệu mô phỏng** so tính tay: chuẩn độ NaOH 0,137 M — pH 10,33 lúc còn một giọt, 3,68 lúc quá một giọt; H₂SO₄ 0,1 M pH 0,965, [SO₄²⁻] 8,44·10⁻³ M; H₃PO₄ 0,1 M pH 1,637; H₂SO₃ 0,1 M pH 1,508; H₂CO₃ 0,03 M pH 3,94.
- **Trên trình duyệt**: ba mức sáng đúng nhóm chất; chuẩn độ cả ba chế độ tới điểm cuối rồi nhập đáp số (chế độ SGK: NaOH 0,101 M, hồng bền ở 9,95 mL, tính 0,1005 M → Đúng), đáp số sai được chấm Chưa đúng; 8 hiện vật không lỗi JS; "Bớt H⁺/Thêm H⁺" giấm ↔ acetate; toàn màn hình phủ đúng 1366×900, Esc thoát; 375 px không cuộn ngang; chế độ tối; 41 thẻ, lọc chương đúng.
- **Hình học 3D**: toạ độ tính bằng script, đo lại từng liên kết (133, 120, 153, 143, 96, 121, 134, 126 pm) và góc; thêm hệ số thu nhỏ `co` cho phân tử lớn sau khi đo thấy tràn khung tới 132 px khi xoay.
- **Soát hoá học một lượt (subagent)**: mọi phương trình cân bằng; sửa theo góp ý (nước cất "điện li rất yếu", C₂H₅Br sang giáo viên biểu diễn, PH₃/H₂S từ CaC₂, kính bảo hộ, huỷ Na dư, dung dịch Cu + HNO₃ xanh lục, thao tác phễu chiết, quy ước bài tập H₂SO₄ [H⁺] = 2C).

## 3. Đối chiếu SGK KNTT (27/09/2026, thầy Văn yêu cầu)

Không tải bản PDF sách (bản quyền, nguồn không chính thức). Tra các trang giải SGK
chép lại đề mục "Thí nghiệm / Hoạt động / Thực hành trang N"; mỗi mục ít nhất hai
nguồn khớp nhau trừ chỗ ghi khác. AI chính tự mở lại trang để kiểm: tr. 25 chuẩn độ
(vietjack + hoc24), tr. 86 hexane (loigiaihay), tr. 149 acetic acid (vietjack),
tr. 51 Cu + H₂SO₄ 70 % và tr. 36 nhận biết NH₄⁺ (kết quả tìm kiếm độc lập).

**Thí nghiệm có trong SGK** (đã đưa vào, nhãn "SGK tr. N"):

| Bài | Trang | Thí nghiệm |
|---|---|---|
| 1 | 10, 11, 12 | 2NO₂ ⇌ N₂O₄ theo nhiệt độ; thuỷ phân CH₃COONa + phenolphthalein theo nhiệt độ; theo nồng độ (thêm CH₃COONa / CH₃COOH) |
| 2 | 16–18, 23, 24, 25 | Thử dẫn điện (nước, muối ăn khan, dd NaCl; HCl, NaOH, saccharose, ethanol; HCl vs CH₃COOH 0,1 M); chỉ thị hoa đậu biếc/bắp cải tím; đo pH Na₂CO₃, AlCl₃, FeCl₃; **thực hành chuẩn độ** |
| 5 | 36 | Nhận biết NH₄⁺ trong phân đạm (KNO₃ đối chứng, NH₄Cl; NaOH 20 %; giấy pH ẩm) |
| 7 | 44, 45 | S + Fe; S + O₂ |
| 8 | 51, 51, 53 | Cu + H₂SO₄ 70 % đun nóng (bông tẩm NaOH); H₂SO₄ đặc + đường; nhận biết SO₄²⁻ bằng BaCl₂ |
| 11 | 64, 66, 68 | Chưng cất rượu nấu thủ công; chiết β-carotene từ nước ép cà rốt bằng hexane; kết tinh đường đỏ (SGK mô tả) |
| 15 | 86, 88 | Hexane + **nước bromine, ngâm nước ấm ~50 °C** (không chiếu sáng); hexane + KMnO₄, đốt hexane |
| 16 | 99 | Điều chế, thử ethylene (cồn + H₂SO₄ đặc); điều chế, thử acetylene (đất đèn) với Br₂, KMnO₄, đốt |
| 17 | 105, 106, 107 | Nitro hoá benzene (mô tả); cộng Cl₂ vào benzene (mô tả); benzene/toluene + KMnO₄/H₂SO₄ đun cách thuỷ |
| 19 | 114 | Thuỷ phân bromoethane bằng NaOH 10 %, trung hoà HNO₃, thử AgNO₃ 1 % |
| 20 | 124, 125 | Đốt cồn; Cu(OH)₂ + glycerol (ethanol đối chứng) |
| 21 | 131 | Phenol + NaOH 2 M và Na₂CO₃ 2 M; phenol 5 % + nước bromine bão hoà |
| 23 | 140, 141, 142 | Tollens với acetaldehyde 5 %; Cu(OH)₂/NaOH với acetaldehyde (đỏ gạch); iodoform với acetone |
| 24 | 149, 150 | Acetic acid 10 % với quỳ, bột Mg, Na₂CO₃ 10 %; ester hoá (60–70 °C, NaCl bão hoà) |

Bài 3, 4, 6, 9, 10, 12, 13, 14, 18, 22, 25 không có thí nghiệm.

**Đã sửa vì lệch SGK:** chiều chuẩn độ (trước để NaOH trong bình); hexane chiếu sáng
→ nước ấm; toluene + KMnO₄ trong môi trường H₂SO₄ (sản phẩm Mn²⁺, không phải MnO₂);
chưng cất nước muối → chưng cất rượu; chiết dầu – nước → chiết β-carotene; acetic
acid với CaCO₃/CuO → Mg/Na₂CO₃; phenol + CO₂ → phenol + Na₂CO₃; thêm 13 thí nghiệm SGK
còn thiếu (CH₃COONa ×2, thuỷ phân muối, S + Fe, S + O₂, Cu + H₂SO₄, kết tinh,
oxi hoá hexane, ethylene, nitro hoá, cộng Cl₂, đốt cồn, Cu(OH)₂ + aldehyde).

**Giữ lại nhưng ghi "Gợi ý thêm" (không có trong SGK):** NH₃ + HCl khói trắng,
Cu + HNO₃ đặc, SO₂ + nước bromine, ethanol + Na (SGK chỉ nêu phương trình), sắc kí
giấy tại nhà, chuối chín, giấm + baking soda, điện li nhiều nấc. Nhận biết C₂H₂
bằng AgNO₃/NH₃ chỉ là lí thuyết trong SGK, đã bỏ khỏi thẻ thí nghiệm.

**SGK không học** điện li nhiều nấc, hằng số Ka — xác nhận nhãn "Mở rộng – nâng cao".

Nguồn chính (mỗi trang con dạng `https://vietjack.com/hoa-hoc-11-kn/...`):
- Chuẩn độ: https://vietjack.com/hoa-hoc-11-kn/thuc-hanh-trang-25-hoa-hoc-11.jsp · https://hoc24.vn/cau-hoi/thuc-hanh-chuan-do-acid-basechuan-bi-dung-dich-hcl-01-m-dung-dich-naoh-nong-do-khoang-01-m-dung-dich-phenolphthalein-pipette-10-ml-burette.8583521885072
- Bài 1: https://vietjack.com/hoa-hoc-11-kn/thi-nghiem-1-trang-10-hoa-hoc-11.jsp · https://hoc247.net/hoa-hoc-11/thi-nghiem-1-trang-11-sgk-hoa-hoc-11-ket-noi-tri-thuc-kntt-bt72598.html
- Bài 2: https://vietjack.com/hoa-hoc-11-kn/bai-2-can-bang-trong-dung-dich-nuoc.jsp · https://vndoc.com/hoa-11-ket-noi-tri-thuc-bai-2-297653
- Bài 5: https://www.vietjack.com/hoa-hoc-11-kn/thi-nghiem-trang-36-hoa-hoc-11.jsp · https://hoc247.net/hoa-hoc-11/thi-nghiem-trang-36-sgk-hoa-hoc-11-ket-noi-tri-thuc-kntt-bt72733.html
- Bài 7, 8: https://vietjack.com/hoa-hoc-11-kn/thi-nghiem-trang-51-hoa-hoc-11.jsp · https://vietjack.com/hoa-hoc-11-kn/bai-8-sulfuric-acid-va-muoi-sulfate.jsp
- Bài 11: https://vietjack.com/hoa-hoc-11-kn/bai-11-phuong-phap-tach-biet-va-tinh-che-hop-chat-huu-co.jsp
- Bài 15: https://loigiaihay.com/giai-hoa-hoc-11-bai-15-trang-82-83-84-85-86-87-88-89-90-91-ket-noi-tri-thuc-a139339.html
- Bài 16: https://vietjack.com/hoa-hoc-11-kn/hoa-hoc-lop-11-trang-99.jsp · https://vndoc.com/hoa-11-ket-noi-tri-thuc-bai-16-299113
- Bài 17: https://loigiaihay.com/giai-hoa-hoc-11-bai-17-trang-102-103-104-105-106-107-108-109-ket-noi-tri-thuc-a139377.html
- Bài 19: https://vietjack.com/hoa-hoc-11-kn/hoat-dong-trang-114-hoa-hoc-11-1.jsp
- Bài 20: https://vietjack.com/hoa-hoc-11-kn/hoat-dong-trang-125-hoa-hoc-11-1.jsp
- Bài 21: https://vietjack.com/hoa-hoc-11-kn/hoa-hoc-lop-11-trang-131.jsp
- Bài 23: https://vietjack.com/hoa-hoc-11-kn/bai-23-hop-chat-carbonyl.jsp
- Bài 24: https://vietjack.com/hoa-hoc-11-kn/hoat-dong-trang-149-hoa-hoc-11-3.jsp · https://vietjack.com/hoa-hoc-11-kn/hoat-dong-trang-150-hoa-hoc-11-4.jsp

## 4. Thầy Văn đã quyết (27/09/2026, chủ dự án chuyển lời)

- **Thí nghiệm SGK có chất độc/ăn mòn: cho học sinh làm như sách.** 12 thẻ (NO₂,
  S + O₂, Cu + H₂SO₄, H₂SO₄ + đường, đốt hexane, ethylene, acetylene, toluene/benzene
  + KMnO₄, thuỷ phân C₂H₅Br, hai thẻ phenol, ester hoá) đổi sang "Phòng thí nghiệm";
  cảnh báo an toàn giữ nguyên, câu "chỉ giáo viên làm" đổi thành "làm dưới sự hướng
  dẫn của giáo viên". 4 thẻ **ngoài sách** có chất độc (NH₃ + HCl, Cu + HNO₃,
  SO₂ + Br₂, ethanol + Na) vẫn "Giáo viên biểu diễn".

- **Điện li nhiều nấc** (ngoài SGK, có cảnh 3D): **giữ**, nhãn "Mở rộng – nâng cao".

## 5. Còn chờ thầy Văn

1. ~~Duyệt từng thẻ trong 41 mục~~ — thầy đã duyệt cả 41 mục chiều 27/09/2026 (mục 7).
   Số trang, nồng độ, số mL vẫn nên được thầy so lại với sách in.

**Kiểm cảnh 3D (27/09):** trên trình duyệt, bóng đèn đủ ba mức, ion dồn đúng cực khi
đóng mạch; nhiều nấc đọc dòng đếm theo thời gian — H₂SO₄ 0,1 M: nấc 1 hết H₂SO₄, nấc 2
dừng ở 44/4, 52 H⁺; H₃PO₄ 1 M: 44/4; kéo về 0,001 M dịch tới 5/43 trong ~8 giây;
toàn màn hình, 375 px không cuộn ngang; `kiem-tra:mau` bắt một chỗ lấy biến chữ làm
nền (chấm chú giải) — đã sửa. Chuyển động liên tục là ngoại lệ có chủ ý so với "một
nhịp chuyển động" của hợp đồng giao diện (chủ dự án yêu cầu 3D chạy quá trình); tắt
khi máy bật giảm chuyển động (nhảy thẳng tới trạng thái cân bằng).

## 6. Ngoài phạm vi, chưa sửa

- `public/thi-nghiem.html` có sẵn từ trước: khung chú thích viền trái dày 4 px (trái luật `ui.md`), font Inter.
- `scripts/kiem-tra-mau.mts`: bộ đếm mã màu cứng không bỏ qua dòng có `// mau-ok` dù chú thích nói có — đã tách thành việc riêng.

## 7. Cập nhật chiều 27/09/2026 — thầy Văn duyệt, dựng mô phỏng 3D chương 2

**Duyệt:** chủ dự án chuyển lời thầy Văn đã duyệt **cả 41 thí nghiệm**, nên
`thiNghiemTheoBai.ts` để `daDuyet: true` toàn bộ và nhãn vàng "Chờ giáo viên duyệt"
không còn hiện. Thí nghiệm thêm sau này vẫn để `false` cho tới khi thầy duyệt riêng
mục đó.

**Dựng mô phỏng:** chủ dự án yêu cầu làm mô phỏng 3D cho thí nghiệm theo bài, chọn
cách **canvas tự viết như hiện tại, không thêm thư viện**, và làm trọn **chương 2**
trước để xem thử.

| Phần | Tệp | Nội dung |
|---|---|---|
| Bộ dụng cụ 3D dùng chung | `mo-phong/dungCu3d.ts` | Ống nghiệm (đáy tròn), cốc, bình khí có nắp, nút bông, ống dẫn khí, đũa thuỷ tinh, muôi sắt, kẹp gỗ, giấy pH, mảnh kim loại, đèn cồn, ngọn lửa, quầng sáng, mặt bàn; hệ hạt cho bọt khí, khói, kết tủa, đống bột; trộn màu và hàm `mauKhi` — khí không màu phải pha chút màu chữ mờ, không thì chìm hẳn vào nền sáng |
| Kiểu kịch bản + khung chạy | `mo-phong/kichBan.ts`, `mo-phong/ThiNghiem3D.tsx` | Mỗi thí nghiệm là một kịch bản gồm các BƯỚC (đúng thứ tự thao tác SGK) và một hàm vẽ suy cảnh từ số bước + tiến độ trong bước, nên tua tới lui bước nào cũng ra đúng cảnh bước đó. Khung chạy: canvas kéo xoay, dải bước bấm được, nút Chạy / Bước trước / Bước sau / Làm lại, phần "Hiện tượng" và "Phương trình" của đúng bước đang xem |
| 9 kịch bản chương 2 | `mo-phong/canh/b5.ts`, `b6.ts`, `b7.ts`, `b8.ts`, `canh/index.ts` | Nhận biết NH₄⁺ trong phân đạm (SGK tr. 36); NH₃ + HCl khói trắng; Cu + HNO₃ đặc; Fe + S (tr. 44); S + O₂ (tr. 45); SO₂ + nước bromine; Cu + H₂SO₄ đặc nóng (tr. 51); H₂SO₄ đặc háo nước (tr. 51); nhận biết SO₄²⁻ (tr. 53) |
| Màu chất thật | `src/index.css` | 22 biến `--mau-*` mới (NO₂ nâu đỏ, Cu²⁺ xanh lam / xanh lục, nước bromine, bột sulfur, bột sắt, FeS, than, ngọn lửa đèn cồn, ngọn lửa sulfur…), giữ nguyên ở cả hai chế độ đúng như `--mau-phenolphthalein` |
| Chọn mô phỏng hai tầng | `components/PhongThiNghiem.tsx` | Chọn bài (Bài 2, 5, 6, 7, 8) rồi chọn mô phỏng trong bài; một dãy 12 nút phẳng là tràn màn hình điện thoại |

**Đã kiểm trên trình duyệt (dev, 1024 px):** mở đủ 9 mô phỏng, tua từng bước. Fe + S
cháy rực rồi thành FeS đen; Cu + HNO₃ khí nâu đỏ đầy ống, dung dịch xanh lục rồi pha
loãng thành xanh lam; S cháy trong bình O₂ sáng hơn hẳn ngoài không khí; nước bromine
nhạt dần rồi mất màu; đường hoá đen và cột than trào khỏi cốc; BaSO₄ kết tủa rồi lắng,
thêm HCl không tan; giấy pH chỉ hoá xanh ở ống NH₄Cl. Thử cả chế độ tối.
`npm run lint` và `npm run kiem-tra:mau` đều đạt.

**Ba chỗ sửa trong lúc kiểm:** (1) bấm thẳng vào một bước lúc đang tạm dừng thì bước
đó phải DIỄN hết rồi mới dừng — không thì nhảy vào bước "Đun nhẹ" mà đèn chưa kịp
cháy, coi như bước trống; (2) máy bật giảm chuyển động thì vẽ thẳng cảnh cuối bước,
có hiện tượng để nhìn; (3) khí không màu, khói trắng và kết tủa trắng vẽ đúng màu
thật thì không thấy gì trên nền sáng.

**Còn lại:** 29 thí nghiệm của chương 1, 3, 4, 5, 6 chưa có mô phỏng (12/41 đã có).
Thêm một cái chỉ phải viết kịch bản trong `mo-phong/canh/`, khai ở `canh/index.ts` và
thêm id vào kiểu `MoPhong`.

## 8. Cập nhật 27/09/2026 — dựng nốt mô phỏng 5 chương còn lại

Chủ dự án xem chương 2 xong, yêu cầu làm tiếp. Nay **cả 41 thí nghiệm đều có
mô phỏng**: 3 mô phỏng React của Bài 2 (đèn dẫn điện, chuẩn độ, điện li nhiều
nấc) và 38 kịch bản 3D trong `mo-phong/canh/`.

| Bài | Kịch bản thêm đợt này |
|---|---|
| 1 | Cân bằng 2NO₂ ⇌ N₂O₄ theo nhiệt độ; thuỷ phân CH₃COONa theo nhiệt độ; theo nồng độ (ba ống, ống giữa để so sánh) |
| 2 | Chất chỉ thị từ hoa đậu biếc / bắp cải tím; đo pH dung dịch muối bằng giấy pH |
| 11 | Chưng cất ethanol (bình cầu, nhiệt kế, sinh hàn, bình hứng); chiết β-carotene bằng phễu chiết; tinh chế đường đỏ; sắc kí giấy |
| 15 | Bromine hoá hexane (phải đun ấm mới mất màu); oxi hoá hexane (KMnO₄ giữ nguyên tím, hexane cháy trong bát sứ) |
| 16 | Điều chế + thử ethylene; điều chế + thử acetylene (có muội đen); ethylene làm quả chín |
| 17 | Nitro hoá benzene; cộng chlorine dưới ánh nắng; oxi hoá toluene và benzene bằng KMnO₄ |
| 19 | Thuỷ phân bromoethane (giữ nguyên bước rửa sạch halide trước khi thử AgNO₃) |
| 20 | Cháy của alcohol; Cu(OH)₂ với ethanol và glycerol; ethanol tác dụng sodium |
| 21 | Phenol với NaOH và Na₂CO₃; phenol với nước bromine |
| 23 | Tráng bạc Tollens; Cu(OH)₂ → Cu₂O đỏ gạch; tạo iodoform |
| 24 | Tính acid của acetic acid (quỳ, Mg, Na₂CO₃); ester hoá; giấm + baking soda thổi bóng |

Dụng cụ thêm vào `dungCu3d.ts`: bình cầu, phễu chiết, phễu lọc, bình tam giác,
bát sứ, ống sinh hàn, nhiệt kế, que đóm, chai + bóng bay, lớp tráng gương, lớp
chất lỏng thứ hai (hệ hai lớp) và hàm dựng vật tròn xoay theo bán kính —
bình cầu, phễu và bát chỉ khác nhau ở hàm bán kính nên dùng chung một chỗ vẽ.
`src/index.css` thêm 20 biến `--mau-*` nữa (KMnO₄ tím, Cu(OH)₂, Cu₂O đỏ gạch,
bạc, AgBr, iodine, β-carotene, chlorine, nitrobenzene, quỳ đỏ…).

**Đã kiểm:** chụp cả 29 cảnh mới bằng Playwright (Chrome đã cài, không quay
video, vào bằng khách vãng lai nên không ghi dữ liệu) rồi soát bằng mắt từng
tấm; `npm run lint` và `npm run kiem-tra:mau` đạt; ở 375 px dải chọn bài xuống
dòng, không cuộn ngang (đo được 0 px thừa).

**Sửa sau khi soát ảnh:** kết tủa trắng của phenol + nước bromine, phenol vẩn
đục, tinh thể đường và bột baking soda vẽ đúng màu trắng thì chìm vào nền sáng
— phải pha thêm màu chữ mờ; lớp bạc tráng gương cũng vậy, tô đậm hơn và thêm
vệt sáng dọc thân ống; cảnh kết tinh phóng to lên 1,15.

**Giới hạn còn lại:** hai thẻ `sgk-mo-ta` của Bài 17 (nitro hoá, cộng chlorine)
là thí nghiệm SGK chỉ mô tả — mô phỏng dựng theo lời mô tả trong sách, không
phải bài tự làm, nhãn trong danh sách vẫn ghi rõ. Số liệu thời gian trong các
bước là ước lượng cho vừa nhịp xem, không phải thời gian thật của thí nghiệm.

## 9. Cập nhật 28/09/2026 — sửa bố cục khung mô phỏng

Chủ dự án hỏi phần thí nghiệm có lỗi không, bố cục có dễ nhìn không. Soát lại:

**Không có lỗi JS.** Cho Playwright mở lần lượt **41 mô phỏng, bấm qua 139
bước**, bắt `console` và `pageerror`: 0 lỗi, 0 tài nguyên 404, 0 px cuộn ngang
ở 375 px. (Lần đo đầu báo "canvas cao 24" là do phép đo bắt nhầm icon trong
thanh tiêu đề, không phải lỗi của trang — đã sửa phép đo rồi đo lại.)

**Ba chỗ bố cục đã sửa:**

1. *Hình nhỏ so với khung.* Cỡ cảnh tính bằng `min(H/3,9 , W/4)` nên trên màn
   hình rộng chiều CAO là cái chặn: khung 1308×360 mà cảnh chỉ chiếm ~370 px
   giữa. Nay khung cao 440 px (điện thoại 330) và chặn ngang 900 px, đo lại ở
   1440 px: khung 900×440, cảnh chiếm ~450 px — nửa bề ngang thay vì một phần
   ba. Toàn màn hình nâng từ 58vh lên 68vh (1392×612). Hai mô phỏng React cũ
   (đèn dẫn điện, điện li nhiều nấc) chỉnh theo cho khỏi nhảy cỡ khi đổi bài.
2. *Chữ nhãn không to theo khung.* `veNhan` nay nhân cỡ chữ với `q.s / 78`
   (chặn trong 0,9 – 2 lần), tức chữ co theo cỡ cảnh: chiếu toàn màn hình thì
   chữ to theo hình, đọc được từ cuối lớp.
3. *Nhãn đè lên dụng cụ.* Dời 6 nhãn: "bông tẩm NaOH" (Bài 6, Bài 8), "nút
   bông" (Bài 7), "bình O₂" (Bài 7), "ống sinh hàn" và "rượu" (Bài 11).

Đã kiểm: `tsc` sạch; chụp lại 4 cảnh ở khung mới, nhãn không còn đè; đo khung
ở 1440 px, toàn màn hình và 375 px.
