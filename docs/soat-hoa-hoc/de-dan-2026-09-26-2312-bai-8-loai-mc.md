# Đề dẫn soát nội dung — 98 câu

Mở tệp này trong Antigravity rồi bảo nó: *"làm đúng yêu cầu trong tệp,
ghi kết quả ra `docs/soat-hoa-hoc/tra-loi-2026-09-26-2312-bai-8-loai-mc-1.json`"*.

**Rồi làm lại LẦN NỮA**, trong một phiên mới, ghi ra
`docs/soat-hoa-hoc/tra-loi-2026-09-26-2312-bai-8-loai-mc-2.json`. Một lượt soát
KHÔNG đủ: đo 20/09/2026, cùng 16 câu chạy ba lượt cho ra 3, 3, rồi 0 câu
nghi ngờ — và ba câu bị bỏ sót ở lượt thứ ba là lỗi THẬT.

Xong thì nạp CẢ HAI, ngăn bằng dấu phẩy, KHÔNG có dấu cách:

```bash
npm run soat:hoa-hoc -- --bai bai-8 --loai mc --nap docs/soat-hoa-hoc/tra-loi-2026-09-26-2312-bai-8-loai-mc-1.json,docs/soat-hoa-hoc/tra-loi-2026-09-26-2312-bai-8-loai-mc-2.json
```

Giữ nguyên các cờ lọc trong lệnh trên: `--nap` tính phạm vi từ chúng.

Báo cáo sẽ ghi `k/2 lượt cùng nêu` cho từng câu — câu nào cả hai lượt
cùng chỉ ra thì đáng tin hơn hẳn. Chỉ có một tệp thì nạp một tệp cũng được,
báo cáo sẽ ghi `1/1`.

---

Bạn là giáo viên Hoá học phổ thông Việt Nam, đang soát lỗi một ngân hàng
câu hỏi Hoá học lớp 11 (chương trình Kết nối tri thức 2018).

Với MỖI câu được đưa, hãy kiểm: đáp án đánh dấu có đúng không; phần giải thích có
mâu thuẫn với đáp án không; công thức, phương trình, đơn vị, số liệu có sai không;
đề có mơ hồ tới mức nhiều phương án cùng đúng không.

QUY TẮC:
- CHỈ nêu câu bạn thực sự nghi có lỗi. Câu đúng thì bỏ qua hoàn toàn.
- Không góp ý về văn phong, cách diễn đạt, hay độ khó. Chỉ nói về ĐÚNG/SAI.
- Nêu rõ vì sao sai, và đúng thì phải thế nào.
- Không chắc thì để "tin" là "thap" — thà báo nhẹ còn hơn khẳng định bừa.

Trả lời DUY NHẤT một mảng JSON, không kèm chữ nào khác, không rào đầu rào cuối:
[{"id":"...","tin":"cao|vua|thap","loi":"sai ở đâu","sua":"nên thế nào"}]
Không có câu nào đáng ngờ thì trả về [].

## Dữ liệu

```json
[
 {
  "id": "b:2:nb:4",
  "loai": "mc",
  "muc": "nb",
  "de": "Thuốc thử dùng nhận biết ion sulfate SO₄²⁻ trong dung dịch là",
  "phuong_an": [
   "0. dung dịch BaCl₂",
   "1. dung dịch NaOH",
   "2. quỳ tím",
   "3. dung dịch AgNO₃"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Ba²⁺ + SO₄²⁻ → BaSO₄↓ trắng, không tan trong acid mạnh — dấu hiệu đặc trưng của ion sulfate."
 },
 {
  "id": "b:2:nb:5",
  "loai": "mc",
  "muc": "nb",
  "de": "Sulfuric acid đặc có tính chất đặc trưng nào?",
  "phuong_an": [
   "0. tính khử mạnh",
   "1. tính háo nước và tính oxi hóa mạnh",
   "2. tính base mạnh",
   "3. dễ bay hơi"
  ],
  "dap_an_dung": 1,
  "giai_thich": "H₂SO₄ đặc hút mạnh nước (than hóa đường, giấy) và oxi hóa được nhiều kim loại kém hoạt động như Cu."
 },
 {
  "id": "b:2:th:4",
  "loai": "mc",
  "muc": "th",
  "de": "Cách pha loãng dung dịch H₂SO₄ đặc đúng kỹ thuật là",
  "phuong_an": [
   "0. rót nước vào acid đặc",
   "1. rót từ từ acid đặc vào nước, khuấy đều",
   "2. đổ nhanh cả hai vào nhau",
   "3. đun nóng acid rồi thêm nước"
  ],
  "dap_an_dung": 1,
  "giai_thich": "H₂SO₄ tan trong nước tỏa nhiệt rất mạnh. Rót nước vào acid sẽ làm nước sôi bắn acid ra ngoài gây bỏng."
 },
 {
  "id": "b:2:th:5",
  "loai": "mc",
  "muc": "th",
  "de": "Kim loại nào sau đây bị thụ động hóa trong H₂SO₄ đặc, nguội?",
  "phuong_an": [
   "0. Cu",
   "1. Zn",
   "2. Al và Fe",
   "3. Mg"
  ],
  "dap_an_dung": 2,
  "giai_thich": "Al, Fe (và Cr) tạo lớp oxide bền, đặc khít trên bề mặt nên không phản ứng tiếp, nhờ đó dùng thùng thép chở acid đặc nguội."
 },
 {
  "id": "b:2:th:6",
  "loai": "mc",
  "muc": "th",
  "de": "Cho lá đồng vào H₂SO₄ đặc, đun nóng. Hiện tượng là",
  "phuong_an": [
   "0. không có phản ứng",
   "1. có khí không màu, mùi hắc thoát ra và dung dịch chuyển màu xanh lam",
   "2. có kết tủa đen",
   "3. có khí màu vàng lục"
  ],
  "dap_an_dung": 1,
  "giai_thich": "Cu + 2H₂SO₄(đặc) → CuSO₄ + SO₂↑ + 2H₂O. SO₂ mùi hắc, dung dịch CuSO₄ có màu xanh lam."
 },
 {
  "id": "b:2:vd:0",
  "loai": "mc",
  "muc": "vd",
  "de": "Hòa tan hết 6,4 gam Cu bằng dung dịch H₂SO₄ đặc, nóng, dư. Thể tích khí SO₂ (đkc, 24,79 L/mol) thu được là",
  "phuong_an": [
   "0. 1,2395 L",
   "1. 2,479 L",
   "2. 4,958 L",
   "3. 3,7185 L"
  ],
  "dap_an_dung": 1,
  "giai_thich": "n(Cu) = 6,4/64 = 0,1 mol. Theo Cu + 2H₂SO₄ → CuSO₄ + SO₂ + 2H₂O thì n(SO₂) = 0,1 mol → V = 0,1 × 24,79 = 2,479 L."
 },
 {
  "id": "b:2:vd:2",
  "loai": "mc",
  "muc": "vd",
  "de": "Cho 100 mL dung dịch H₂SO₄ 0,5 M tác dụng với dung dịch BaCl₂ dư. Khối lượng kết tủa thu được là",
  "phuong_an": [
   "0. 9,32 gam",
   "1. 11,65 gam",
   "2. 23,30 gam",
   "3. 5,83 gam"
  ],
  "dap_an_dung": 1,
  "giai_thich": "n(H₂SO₄) = 0,05 mol → n(BaSO₄) = 0,05 mol → m = 0,05 × 233 = 11,65 gam."
 },
 {
  "id": "b:2:vd:5",
  "loai": "mc",
  "muc": "vd",
  "de": "Hệ số của H₂SO₄ trong phương trình Cu + H₂SO₄(đặc, nóng) → CuSO₄ + SO₂ + H₂O là",
  "phuong_an": [
   "0. 1",
   "1. 2",
   "2. 3",
   "3. 4"
  ],
  "dap_an_dung": 1,
  "giai_thich": "Cu + 2H₂SO₄ → CuSO₄ + SO₂ + 2H₂O. Một phân tử H₂SO₄ bị khử thành SO₂, một phân tử đóng vai trò tạo muối."
 },
 {
  "id": "b:2:vdc:0",
  "loai": "mc",
  "muc": "vdc",
  "de": "Hòa tan hoàn toàn 11,2 gam Fe bằng dung dịch H₂SO₄ đặc, nóng, dư. Thể tích khí SO₂ (đkc, 24,79 L/mol) thu được là",
  "phuong_an": [
   "0. 2,479 L",
   "1. 4,958 L",
   "2. 7,437 L",
   "3. 9,916 L"
  ],
  "dap_an_dung": 2,
  "giai_thich": "Fe nhường 3 electron lên Fe³⁺: n(Fe) = 0,2 mol cho 0,6 mol electron. S⁺⁶ nhận 2 electron thành SO₂ nên n(SO₂) = 0,3 mol → V = 0,3 × 24,79 = 7,437 L."
 },
 {
  "id": "bq_1788161089232_sms30",
  "loai": "mc",
  "muc": "vd",
  "de": "Chỉ dùng một thuốc thử, bằng phương pháp hóa học hãy nhận biết 5 dung dịch: AlCl₃, FeCl₃, ZnCl₂, CuCl₂, KCl. Thuốc thử phù hợp nhất là:",
  "phuong_an": [
   "0. Dung dịch NH₃",
   "1. Dung dịch NaOH",
   "2. Dung dịch AgNO₃",
   "3. Dung dịch BaCl₂"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Dùng NH₃ tạo các hiện tượng khác biệt: FeCl₃ (kết tủa nâu đỏ), CuCl₂ (kết tủa xanh tan tạo dung dịch xanh thẫm), AlCl₃ (kết tủa trắng không tan), ZnCl₂ (kết tủa trắng tan), KCl (không hiện tượng)."
 },
 {
  "id": "bq_1788161089233_jub3v",
  "loai": "mc",
  "muc": "vdc",
  "de": "Hấp thụ SO₃ vào 100 gam dung dịch H₂SO₄ 91% thu được oleum X. Hòa tan 33,8 gam oleum X vào nước rồi cho tác dụng với BaCl₂ dư thu được 93,2 gam kết tủa. Công thức của oleum X là:",
  "phuong_an": [
   "0. H₂SO₄.3SO₃",
   "1. H₂SO₄.2SO₃",
   "2. H₂SO₄.4SO₃",
   "3. H₂SO₄.SO₃"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Số mol BaSO₄ = 93,2 / 233 = 0,4 mol. Xét 33,8 gam oleum H₂SO₄.nSO₃: số mol oleum = 0,4 / (n + 1). Phương trình khối lượng: 33,8 = [0,4 / (n + 1)] × (98 + 80n). Giải ra n = 3."
 },
 {
  "id": "bq_1788161555460_cagrv",
  "loai": "mc",
  "muc": "nb",
  "de": "Ở thể lỏng, hóa chất nào sau đây có dạng sánh như dầu, không màu, không bay hơi và tan vô hạn trong nước?",
  "phuong_an": [
   "0. CH₃COOH",
   "1. H₂SO₄",
   "2. HF",
   "3. H₂O"
  ],
  "dap_an_dung": 1,
  "giai_thich": "Sulfuric acid (H₂SO₄) tinh khiết là chất lỏng sánh như dầu, không màu, không bay hơi, nặng gần gấp hai lần nước và tan vô hạn trong nước."
 },
 {
  "id": "bq_1788161555460_dk0pt",
  "loai": "mc",
  "muc": "th",
  "de": "Muối X không tan trong nước và các dung môi hữu cơ. Trong y học, X thường được dùng làm chất cản quang để xét nghiệm X-quang đường tiêu hóa. Công thức của X là",
  "phuong_an": [
   "0. Na₂SO₄",
   "1. MgSO₄",
   "2. BaSO₄",
   "3. K₂SO₄"
  ],
  "dap_an_dung": 2,
  "giai_thich": "BaSO₄ (Barium sulfate) là muối rất ít tan, hấp thụ tốt tia X nên được sử dụng làm chất cản quang an toàn trong y học để chụp X-quang đường tiêu hóa."
 },
 {
  "id": "bq_1788161555460_rmurl",
  "loai": "mc",
  "muc": "vd",
  "de": "Khi cho dung dịch sulfuric acid (H₂SO₄) loãng tiếp xúc với baking soda (NaHCO₃), hiện tượng quan sát được là gì?",
  "phuong_an": [
   "0. Sủi bọt khí không màu.",
   "1. Xuất hiện kết tủa trắng.",
   "2. Dung dịch chuyển sang màu xanh.",
   "3. Có khí mùi hắc thoát ra."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Phản ứng: H₂SO₄ + 2NaHCO₃ → Na₂SO₄ + 2CO₂ + 2H₂O. Khí CO₂ thoát ra gây hiện tượng sủi bọt khí không màu, không mùi."
 },
 {
  "id": "bq_1789371866324_treft",
  "loai": "mc",
  "muc": "nb",
  "de": "Sau cơn mưa dông kèm sấm sét, một lượng nhỏ nitrogen trong không khí được chuyển hóa thành ion nitrate là một dạng phân đạm mà cây trồng hấp thụ được để sinh trưởng, phát triển. Phản ứng nào sau đây có trong quá trình đó?",
  "phuong_an": [
   "0. 2SO₂ + O₂ + 2H₂O → 2H₂SO₄.",
   "1. N₂ + 3H₂ ⇌ 2NH₃.",
   "2. NH₃ + HCl → NH₄Cl.",
   "3. N₂ + O₂ ⇌ 2NO."
  ],
  "dap_an_dung": 3,
  "giai_thich": "Nhiệt độ rất cao của tia sét giúp N₂ kết hợp với O₂ tạo NO, sau đó NO → NO₂ → HNO₃ theo nước mưa tạo ion nitrate."
 },
 {
  "id": "bq_1789371866324_uyvcf",
  "loai": "mc",
  "muc": "nb",
  "de": "Muối nào sau đây tan tốt trong nước?",
  "phuong_an": [
   "0. CaCO₃.",
   "1. BaSO₄.",
   "2. NH₄Cl.",
   "3. AgCl."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Hầu hết muối ammonium đều tan tốt trong nước; CaCO₃, BaSO₄, AgCl là muối không tan."
 },
 {
  "id": "bq_1789371866324_x7nmx",
  "loai": "mc",
  "muc": "vd",
  "de": "Một muối X có tính chất như sau: X tác dụng với dung dịch HCl và dung dịch NaOH đều tạo khí; X không phản ứng với dung dịch BaCl₂ nhưng phản ứng với dung dịch Ba(OH)₂ vừa cho kết tủa, vừa tạo khí. Muối X là",
  "phuong_an": [
   "0. (NH₄)₂CO₃",
   "1. NH₄HCO₃",
   "2. NH₄Cl",
   "3. NaHCO₃"
  ],
  "dap_an_dung": 1,
  "giai_thich": "Tạo khí với NaOH nên có NH₄⁺, tạo khí với HCl nên có gốc carbonate; không kết tủa với BaCl₂ nên là HCO₃⁻; với Ba(OH)₂, HCO₃⁻ chuyển thành CO₃²⁻ tạo BaCO₃ đồng thời giải phóng NH₃."
 },
 {
  "id": "bq_1789371866325_1ezo8",
  "loai": "mc",
  "muc": "th",
  "de": "Dãy các chất đều phản ứng với NH₃ trong điều kiện thích hợp là",
  "phuong_an": [
   "0. HCl, O₂, Cl₂, FeCl₃",
   "1. H₂SO₄, Ba(OH)₂, FeO, NaOH",
   "2. HCl, HNO₃, AlCl₃, CaO",
   "3. KOH, HNO₃, CuO, CuCl₂"
  ],
  "dap_an_dung": 0,
  "giai_thich": "NH₃ phản ứng với acid (HCl), với chất oxi hóa (O₂, Cl₂) và với dung dịch muối kim loại tạo hydroxide kết tủa (FeCl₃); NH₃ không phản ứng với base như NaOH, Ba(OH)₂, KOH hay với CaO."
 },
 {
  "id": "bq_1789371866325_2884b",
  "loai": "mc",
  "muc": "nb",
  "de": "Để tách riêng NH₃ ra khỏi hỗn hợp gồm N₂, H₂, NH₃ trong công nghiệp, người ta",
  "phuong_an": [
   "0. cho hỗn hợp qua nước vôi trong dư.",
   "1. cho hỗn hợp qua bột CuO nung nóng.",
   "2. nén và làm lạnh hỗn hợp để hóa lỏng NH₃.",
   "3. cho hỗn hợp qua dung dịch H₂SO₄ đặc."
  ],
  "dap_an_dung": 2,
  "giai_thich": "NH₃ có nhiệt độ sôi (−33 °C) cao hơn nhiều so với N₂, H₂ nên dễ hóa lỏng khi nén và làm lạnh; N₂, H₂ chưa phản ứng được tuần hoàn trở lại."
 },
 {
  "id": "bq_1789371866325_9c5ja",
  "loai": "mc",
  "muc": "th",
  "de": "Có ba dung dịch mất nhãn gồm NaCl, NH₄Cl, NaNO₃. Dãy hóa chất có thể phân biệt được ba dung dịch là",
  "phuong_an": [
   "0. phenolphtalein và NaOH.",
   "1. Cu và HCl.",
   "2. phenolphtalein, Cu và H₂SO₄ loãng.",
   "3. quỳ tím và dung dịch AgNO₃."
  ],
  "dap_an_dung": 3,
  "giai_thich": "Quỳ tím hóa đỏ với NH₄Cl vì ion NH₄⁺ thủy phân cho môi trường acid; hai dung dịch còn lại phân biệt bằng AgNO₃ vì NaCl cho kết tủa trắng AgCl còn NaNO₃ không có hiện tượng."
 },
 {
  "id": "bq_1789371866325_n2649",
  "loai": "mc",
  "muc": "th",
  "de": "Chất nào sau đây có thể làm khô khí NH₃ có lẫn hơi nước?",
  "phuong_an": [
   "0. P₂O₅",
   "1. H₂SO₄ đặc",
   "2. CuO bột",
   "3. NaOH rắn"
  ],
  "dap_an_dung": 3,
  "giai_thich": "Chất làm khô phải hút nước mà không phản ứng với khí cần làm khô; P₂O₅ và H₂SO₄ đặc có tính acid nên giữ lại NH₃, còn CuO nóng bị NH₃ khử."
 },
 {
  "id": "bq_1789371866325_ppkui",
  "loai": "mc",
  "muc": "nb",
  "de": "Ứng dụng không phải của ammonia là",
  "phuong_an": [
   "0. sản xuất nitric acid.",
   "1. sử dụng làm chất làm lạnh.",
   "2. sản xuất các loại phân đạm.",
   "3. sản xuất sulfuric acid."
  ],
  "dap_an_dung": 3,
  "giai_thich": "NH₃ là nguyên liệu sản xuất HNO₃, phân đạm và là môi chất lạnh nhờ nhiệt hóa hơi lớn; nguyên liệu sản xuất H₂SO₄ là sulfur hoặc quặng pyrite."
 },
 {
  "id": "bq_1789371866325_q4c7u",
  "loai": "mc",
  "muc": "th",
  "de": "Chất nào sau đây làm khô khí NH₃ tốt nhất?",
  "phuong_an": [
   "0. HCl",
   "1. H₂SO₄",
   "2. CaO",
   "3. HNO₃"
  ],
  "dap_an_dung": 2,
  "giai_thich": "CaO vừa hút nước mạnh (CaO + H₂O → Ca(OH)₂) vừa có tính base nên không phản ứng với NH₃; ba chất còn lại đều là acid, giữ lại NH₃ dưới dạng muối ammonium."
 },
 {
  "id": "bq_1789371866325_v6lg0",
  "loai": "mc",
  "muc": "th",
  "de": "X là muối khi tác dụng với dung dịch NaOH dư sinh khí mùi khai, tác dụng với dung dịch BaCl₂ sinh kết tủa trắng không tan trong HNO₃. X là muối nào trong số các muối sau?",
  "phuong_an": [
   "0. (NH₄)₂CO₃",
   "1. (NH₄)₂SO₄",
   "2. NH₄HSO₃",
   "3. (NH₄)₃PO₄"
  ],
  "dap_an_dung": 1,
  "giai_thich": "Khí mùi khai chứng tỏ có ion NH₄⁺; kết tủa trắng với BaCl₂ không tan trong HNO₃ chỉ có thể là BaSO₄ nên gốc acid là SO₄²⁻."
 },
 {
  "id": "bq_1789371866326_08rmu",
  "loai": "mc",
  "muc": "nb",
  "de": "Ứng dụng nào sau đây không phải của S?",
  "phuong_an": [
   "0. Làm nguyên liệu sản xuất sulfuric acid.",
   "1. Làm chất lưu hóa cao su.",
   "2. Điều chế thuốc súng đen.",
   "3. Khử chua đất."
  ],
  "dap_an_dung": 3,
  "giai_thich": "Sulfur được dùng sản xuất H₂SO₄, lưu hóa cao su, làm thuốc súng đen; chất dùng khử chua đất là vôi (CaO, Ca(OH)₂, CaCO₃)."
 },
 {
  "id": "bq_1789371866326_6t3wt",
  "loai": "mc",
  "muc": "nb",
  "de": "Ứng dụng nào sau đây là ứng dụng chính của sulfur?",
  "phuong_an": [
   "0. Chế tạo dược phẩm, phẩm nhuộm.",
   "1. Sản xuất H₂SO₄.",
   "2. Lưu hóa cao su.",
   "3. Chế tạo diêm, thuốc trừ sâu, diệt nấm."
  ],
  "dap_an_dung": 1,
  "giai_thich": "Khoảng 90% lượng sulfur khai thác được dùng để sản xuất sulfuric acid, các ứng dụng còn lại chỉ chiếm phần nhỏ."
 },
 {
  "id": "bq_1789371866326_9cw68",
  "loai": "mc",
  "muc": "th",
  "de": "Cho các phản ứng hóa học sau: (1) S + O₂ —t°→ SO₂; (2) S + 3F₂ —t°→ SF₆; (3) S + Hg → HgS; (4) S + 6HNO₃ (đặc) —t°→ H₂SO₄ + 6NO₂ + 2H₂O. Trong các phản ứng trên, số phản ứng trong đó S thể hiện tính khử là",
  "phuong_an": [
   "0. 3",
   "1. 2",
   "2. 4",
   "3. 1"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Ở (1), (2), (4) số oxi hóa của S tăng từ 0 lên +4 hoặc +6 nên S là chất khử; ở (3) S giảm xuống −2 nên là chất oxi hóa."
 },
 {
  "id": "bq_1789371866326_i3d4q",
  "loai": "mc",
  "muc": "nb",
  "de": "Sulfur không được ứng dụng để",
  "phuong_an": [
   "0. điều chế H₂SO₄.",
   "1. làm bột nở.",
   "2. lưu hóa cao su.",
   "3. sản xuất chất tẩy trắng bột giấy."
  ],
  "dap_an_dung": 1,
  "giai_thich": "Bột nở là muối ammonium hoặc sodium hydrogencarbonate phân hủy sinh khí; sulfur được dùng để sản xuất H₂SO₄, SO₂ tẩy trắng bột giấy và lưu hóa cao su."
 },
 {
  "id": "bq_1789371866326_k1jm2",
  "loai": "mc",
  "muc": "vd",
  "de": "Hỗn hợp X gồm NH₄Cl và (NH₄)₂SO₄. Cho X tác dụng với dung dịch Ba(OH)₂ dư, đun nhẹ thu được 9,32 gam kết tủa và 2,479 lít khí (đkc) thoát ra. Hỗn hợp X có khối lượng là",
  "phuong_an": [
   "0. 5,28 gam",
   "1. 6,60 gam",
   "2. 5,35 gam",
   "3. 6,35 gam"
  ],
  "dap_an_dung": 3,
  "giai_thich": "Kết tủa BaSO₄ là 9,32/233 = 0,04 mol nên (NH₄)₂SO₄ là 0,04 mol; khí NH₃ là 0,1 mol nên NH₄Cl = 0,1 − 0,08 = 0,02 mol, m = 0,02·53,5 + 0,04·132 = 6,35 gam."
 },
 {
  "id": "bq_1789371866326_lj8t6",
  "loai": "mc",
  "muc": "th",
  "de": "Nguyên tử S đóng vai trò vừa là chất khử, vừa là chất oxi hóa trong phản ứng nào sau đây?",
  "phuong_an": [
   "0. 4S + 6NaOH (đặc) —t°→ 2Na₂S + Na₂S₂O₃ + 3H₂O",
   "1. S + 3F₂ —t°→ SF₆",
   "2. S + 6HNO₃ (đặc) —t°→ H₂SO₄ + 6NO₂ + 2H₂O",
   "3. S + 2Na —t°→ Na₂S"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Trong phản ứng với NaOH đặc, một phần S giảm xuống −2 (Na₂S) và một phần tăng lên +2 (Na₂S₂O₃) nên đây là phản ứng tự oxi hóa – khử."
 },
 {
  "id": "bq_1789371866326_p8w90",
  "loai": "mc",
  "muc": "th",
  "de": "Khí nào sau đây có khả năng làm mất màu nước bromine?",
  "phuong_an": [
   "0. N₂",
   "1. CO₂",
   "2. H₂",
   "3. SO₂"
  ],
  "dap_an_dung": 3,
  "giai_thich": "SO₂ có tính khử, phản ứng SO₂ + Br₂ + 2H₂O → 2HBr + H₂SO₄ làm mất màu nước bromine; N₂, CO₂, H₂ không phản ứng với Br₂ trong nước."
 },
 {
  "id": "bq_1789371866326_uurxs",
  "loai": "mc",
  "muc": "th",
  "de": "Phương pháp đơn giản để thu hồi thủy ngân khi bị vỡ nhiệt kế thủy ngân là dùng",
  "phuong_an": [
   "0. H₂SO₄",
   "1. bột S",
   "2. AgNO₃",
   "3. khí Cl₂"
  ],
  "dap_an_dung": 1,
  "giai_thich": "Sulfur phản ứng với thủy ngân ngay ở nhiệt độ thường tạo HgS là chất rắn không bay hơi, nhờ đó thu gom được thủy ngân độc hại."
 },
 {
  "id": "bq_1789371866326_yeamv",
  "loai": "mc",
  "muc": "th",
  "de": "Sulfur thể hiện tính oxi hóa khi tác dụng với",
  "phuong_an": [
   "0. O₂",
   "1. Al",
   "2. H₂SO₄ đặc",
   "3. F₂"
  ],
  "dap_an_dung": 1,
  "giai_thich": "Al có độ âm điện nhỏ hơn S nên S nhận electron, giảm số oxi hóa từ 0 xuống −2 trong Al₂S₃; O₂, F₂ và H₂SO₄ đặc đều oxi hóa sulfur."
 },
 {
  "id": "bq_1789371866326_zr4uy",
  "loai": "mc",
  "muc": "nb",
  "de": "Sulfur có thể tồn tại ở những trạng thái số oxi hóa nào?",
  "phuong_an": [
   "0. −2; +4; +5; +6",
   "1. −3; +2; +4; +6",
   "2. −2; 0; +4; +6",
   "3. +1; 0; +4; +6"
  ],
  "dap_an_dung": 2,
  "giai_thich": "Sulfur có 6 electron hóa trị nên số oxi hóa cao nhất là +6, thấp nhất là −2; các trạng thái thường gặp là −2, 0, +4, +6."
 },
 {
  "id": "bq_1789371866327_0e3dz",
  "loai": "mc",
  "muc": "vdc",
  "de": "Dùng 300 tấn quặng pyrite (FeS₂) có lẫn 20% tạp chất để sản xuất acid H₂SO₄ có nồng độ 98%. Biết rằng hiệu suất phản ứng là 90%. Khối lượng acid H₂SO₄ 98% thu được là",
  "phuong_an": [
   "0. 320 tấn",
   "1. 335 tấn",
   "2. 350 tấn",
   "3. 360 tấn"
  ],
  "dap_an_dung": 3,
  "giai_thich": "FeS₂ nguyên chất 240 tấn ứng với 2 tấn-mol, theo sơ đồ FeS₂ → 2H₂SO₄ và hiệu suất 90% thu 3,6 tấn-mol tức 352,8 tấn acid nguyên chất, chia cho 0,98 được 360 tấn dung dịch."
 },
 {
  "id": "bq_1789371866327_11uwb",
  "loai": "mc",
  "muc": "th",
  "de": "Tính chất đặc biệt của dung dịch H₂SO₄ đặc, nóng là tác dụng được với các chất trong dãy nào sau đây mà dung dịch H₂SO₄ loãng không tác dụng?",
  "phuong_an": [
   "0. BaCl₂, NaOH, Zn",
   "1. NH₃, MgO, Ba(OH)₂",
   "2. Fe, Al, Ni",
   "3. Ag, S, FeSO₄"
  ],
  "dap_an_dung": 3,
  "giai_thich": "Ag, S và FeSO₄ chỉ phản ứng nhờ tính oxi hóa mạnh của sulfur +6 trong acid đặc nóng; các chất ở ba dãy còn lại phản ứng được với cả acid loãng."
 },
 {
  "id": "bq_1789371866327_1m589",
  "loai": "mc",
  "muc": "vd",
  "de": "Cho 2,81 gam hỗn hợp gồm 3 oxide Fe₂O₃, MgO, ZnO tan vừa đủ trong 300 mL dung dịch H₂SO₄ 0,1 M thì khối lượng muối sulfate khan tạo thành là",
  "phuong_an": [
   "0. 5,33 gam",
   "1. 5,21 gam",
   "2. 3,52 gam",
   "3. 5,68 gam"
  ],
  "dap_an_dung": 1,
  "giai_thich": "Mỗi mol H₂SO₄ thay một nguyên tử O (16) trong oxide bằng một gốc SO₄ (96) nên khối lượng tăng 80 gam/mol: m = 2,81 + 0,03·80 = 5,21 gam."
 },
 {
  "id": "bq_1789371866327_2oqki",
  "loai": "mc",
  "muc": "nb",
  "de": "Trong các phát biểu sau, phát biểu không đúng khi nói về tính chất của sulfuric acid là",
  "phuong_an": [
   "0. Là chất lỏng sánh như dầu.",
   "1. Không màu, không bay hơi.",
   "2. Không tan trong nước.",
   "3. Nặng hơn nước."
  ],
  "dap_an_dung": 2,
  "giai_thich": "H₂SO₄ tan vô hạn trong nước và tỏa rất nhiều nhiệt khi tan; nó là chất lỏng sánh, không màu, khó bay hơi và có khối lượng riêng 1,84 g/mL."
 },
 {
  "id": "bq_1789371866327_4byjo",
  "loai": "mc",
  "muc": "vd",
  "de": "Cho 6,72 gam Fe vào dung dịch chứa 0,3 mol H₂SO₄ đặc, nóng (giả thiết SO₂ là sản phẩm khử duy nhất). Sau khi phản ứng xảy ra hoàn toàn, thu được",
  "phuong_an": [
   "0. 0,03 mol Fe₂(SO₄)₃ và 0,06 mol FeSO₄",
   "1. 0,05 mol Fe₂(SO₄)₃ và 0,02 mol Fe dư",
   "2. 0,02 mol Fe₂(SO₄)₃ và 0,08 mol FeSO₄",
   "3. 0,12 mol FeSO₄"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Fe 0,12 mol cần 0,36 mol acid nên acid hết: tạo 0,05 mol Fe₂(SO₄)₃ và còn 0,02 mol Fe; lượng Fe dư khử tiếp Fe³⁺ nên còn 0,03 mol Fe₂(SO₄)₃ và 0,06 mol FeSO₄."
 },
 {
  "id": "bq_1789371866327_6z2h9",
  "loai": "mc",
  "muc": "nb",
  "de": "Dung dịch sulfuric acid đặc có thể lấy nước của nhiều hợp chất hữu cơ có trong da, giấy, đường, tinh bột,... do có tính chất nào?",
  "phuong_an": [
   "0. Tính oxi hóa mạnh.",
   "1. Tính acid mạnh.",
   "2. Tính háo nước.",
   "3. Cả ba tính chất trên."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Tính háo nước khiến H₂SO₄ đặc tách H và O theo tỉ lệ của nước ra khỏi hợp chất hữu cơ, ví dụ C₁₂H₂₂O₁₁ hóa đen thành carbon."
 },
 {
  "id": "bq_1789371866327_7hggu",
  "loai": "mc",
  "muc": "vd",
  "de": "Để hòa tan hoàn toàn 2,32 gam hỗn hợp gồm FeO, Fe₂O₃ và Fe₃O₄ (trong đó số mol FeO bằng số mol Fe₂O₃) cần dùng vừa đủ V lít dung dịch H₂SO₄ 0,5 M. Giá trị của V là",
  "phuong_an": [
   "0. 0,23",
   "1. 0,08",
   "2. 0,18",
   "3. 0,16"
  ],
  "dap_an_dung": 1,
  "giai_thich": "Vì n(FeO) = n(Fe₂O₃) nên có thể quy đổi hỗn hợp thành Fe₃O₄; n(Fe₃O₄) = 2,32/232 = 0,01 mol cần 0,04 mol H₂SO₄, V = 0,04/0,5 = 0,08 L."
 },
 {
  "id": "bq_1789371866327_9dklb",
  "loai": "mc",
  "muc": "nb",
  "de": "Ứng dụng của sulfuric acid là dùng để sản xuất",
  "phuong_an": [
   "0. phân bón.",
   "1. chất tẩy rửa tổng hợp.",
   "2. thuốc trừ sâu.",
   "3. cả phân bón, chất tẩy rửa tổng hợp và thuốc trừ sâu."
  ],
  "dap_an_dung": 3,
  "giai_thich": "H₂SO₄ là hóa chất cơ bản của công nghiệp, tham gia sản xuất phân bón (superphosphate, ammonium sulfate), chất tẩy rửa, thuốc trừ sâu, phẩm nhuộm, ắc quy."
 },
 {
  "id": "bq_1789371866327_9lq21",
  "loai": "mc",
  "muc": "th",
  "de": "Cho FeCO₃ tác dụng với H₂SO₄ đặc nóng, sản phẩm khí thu được gồm có",
  "phuong_an": [
   "0. CO₂ và SO₂",
   "1. H₂S và CO₂",
   "2. CO₂",
   "3. SO₂"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Gốc carbonate bị acid đẩy ra tạo CO₂, đồng thời Fe²⁺ bị S⁺⁶ oxi hóa lên Fe³⁺ và sinh SO₂."
 },
 {
  "id": "bq_1789371866327_aofwi",
  "loai": "mc",
  "muc": "th",
  "de": "Khi cho Fe₂O₃ tác dụng với H₂SO₄ đặc nóng thì sản phẩm thu được là",
  "phuong_an": [
   "0. Fe₂(SO₄)₃, SO₂ và H₂O",
   "1. Fe₂(SO₄)₃ và H₂O",
   "2. FeSO₄, SO₂ và H₂O",
   "3. FeSO₄ và H₂O"
  ],
  "dap_an_dung": 1,
  "giai_thich": "Sắt trong Fe₂O₃ đã ở số oxi hóa cao nhất +3 nên không bị oxi hóa tiếp, phản ứng chỉ là trao đổi tạo muối và nước."
 },
 {
  "id": "bq_1789371866327_cz63h",
  "loai": "mc",
  "muc": "nb",
  "de": "Kim loại bị thụ động hóa trong dung dịch H₂SO₄ đặc, nguội là",
  "phuong_an": [
   "0. Al và Zn",
   "1. Al và Fe",
   "2. Fe và Cu",
   "3. Fe và Mg"
  ],
  "dap_an_dung": 1,
  "giai_thich": "Al, Fe (và Cr) bị H₂SO₄ đặc nguội oxi hóa tạo lớp oxide bền, đặc khít bám trên bề mặt ngăn kim loại tiếp xúc với acid nên phản ứng dừng lại."
 },
 {
  "id": "bq_1789371866327_dfxla",
  "loai": "mc",
  "muc": "nb",
  "de": "Ứng dụng của barium sulfate (BaSO₄) là",
  "phuong_an": [
   "0. làm chất phụ gia để làm đông các sản phẩm như đậu hũ, đậu non,...",
   "1. bột màu làm phụ gia pha màu cho công nghiệp sơn.",
   "2. sản xuất muối tắm.",
   "3. thành phần của thuốc trừ sâu hòa tan, thuốc diệt nấm."
  ],
  "dap_an_dung": 1,
  "giai_thich": "BaSO₄ rất bền, không tan và có độ trắng cao nên được dùng làm bột màu cho sơn; nhờ không tan nên còn dùng làm thuốc cản quang chụp X-quang."
 },
 {
  "id": "bq_1789371866327_fnlma",
  "loai": "mc",
  "muc": "vd",
  "de": "Cho 20 gam hỗn hợp X gồm Fe, Cu phản ứng hoàn toàn với H₂SO₄ loãng dư, sau phản ứng thu được 12 gam chất rắn không tan. Phần trăm về khối lượng của Fe trong X là",
  "phuong_an": [
   "0. 60%",
   "1. 72%",
   "2. 40%",
   "3. 64%"
  ],
  "dap_an_dung": 2,
  "giai_thich": "Cu không tan trong H₂SO₄ loãng nên 12 gam chất rắn là Cu, Fe còn lại 8 gam, chiếm 8/20 = 40%."
 },
 {
  "id": "bq_1789371866327_fqtm3",
  "loai": "mc",
  "muc": "th",
  "de": "Dung dịch H₂SO₄ đặc, nóng tác dụng được với dãy các chất nào sau đây, thu được sản phẩm không có khí thoát ra?",
  "phuong_an": [
   "0. Fe, BaCO₃, Cu",
   "1. FeO, KOH, BaCl₂",
   "2. Fe₂O₃, Cu(OH)₂, Ba(OH)₂",
   "3. S, Fe(OH)₃, BaCl₂"
  ],
  "dap_an_dung": 2,
  "giai_thich": "Fe₂O₃, Cu(OH)₂, Ba(OH)₂ đều có kim loại ở số oxi hóa cao nhất nên chỉ xảy ra phản ứng trao đổi hoặc trung hòa; các dãy khác có Fe, Cu, S, FeO, BaCO₃ sinh SO₂ hoặc CO₂."
 },
 {
  "id": "bq_1789371866327_g4e82",
  "loai": "mc",
  "muc": "nb",
  "de": "Ứng dụng của ammonium sulfate (NH₄)₂SO₄ là",
  "phuong_an": [
   "0. làm chất phụ gia để làm đông các sản phẩm như đậu hũ, đậu non,...",
   "1. bột màu làm phụ gia pha màu cho công nghiệp sơn.",
   "2. sản xuất muối tắm.",
   "3. thành phần của thuốc trừ sâu hòa tan, thuốc diệt nấm."
  ],
  "dap_an_dung": 3,
  "giai_thich": "(NH₄)₂SO₄ là phân đạm một lá và là thành phần của nhiều chế phẩm thuốc trừ sâu, thuốc diệt nấm dạng hòa tan."
 },
 {
  "id": "bq_1789371866327_hw0so",
  "loai": "mc",
  "muc": "nb",
  "de": "Tính chất hóa học chung của H₂SO₄ đặc là",
  "phuong_an": [
   "0. tính oxi hóa mạnh.",
   "1. tính acid mạnh.",
   "2. tính lưỡng tính.",
   "3. vừa có tính oxi hóa mạnh, vừa có tính acid mạnh."
  ],
  "dap_an_dung": 3,
  "giai_thich": "H₂SO₄ đặc vừa là acid mạnh vừa có tính oxi hóa mạnh do nguyên tử sulfur ở số oxi hóa cao nhất +6 gây ra, ngoài ra còn có tính háo nước."
 },
 {
  "id": "bq_1789371866327_irrc4",
  "loai": "mc",
  "muc": "vdc",
  "de": "Nung m gam hỗn hợp X gồm FeS và FeS₂ trong một bình kín chứa không khí (gồm 20% thể tích O₂ và 80% thể tích N₂) đến khi các phản ứng xảy ra hoàn toàn, thu được một chất rắn duy nhất và hỗn hợp khí Y có thành phần thể tích: 84,8% N₂, 14% SO₂, còn lại là O₂. Thành phần phần trăm khối lượng của FeS trong hỗn hợp X là",
  "phuong_an": [
   "0. 42,31%",
   "1. 59,46%",
   "2. 19,64%",
   "3. 26,83%"
  ],
  "dap_an_dung": 2,
  "giai_thich": "Lấy 100 mol Y: N₂ 84,8 nên O₂ ban đầu 21,2 và O₂ đã dùng 20; từ SO₂ = x + 2y = 14 và O₂ = 1,75x + 2,75y = 20 được y = 3x, do đó %FeS = 88x/(88x + 360x) = 19,64%."
 },
 {
  "id": "bq_1789371866327_o4e88",
  "loai": "mc",
  "muc": "nb",
  "de": "Kim loại nào sau đây không tác dụng với dung dịch H₂SO₄ loãng?",
  "phuong_an": [
   "0. Al",
   "1. Mg",
   "2. Na",
   "3. Cu"
  ],
  "dap_an_dung": 3,
  "giai_thich": "H₂SO₄ loãng chỉ oxi hóa được kim loại đứng trước hydrogen trong dãy hoạt động hóa học; Cu đứng sau hydrogen nên không phản ứng."
 },
 {
  "id": "bq_1789371866327_o4igq",
  "loai": "mc",
  "muc": "th",
  "de": "Có 4 dung dịch đựng trong 4 lọ mất nhãn: HCl, Na₂SO₄, NaCl, Ba(OH)₂. Chỉ dùng một thuốc thử có thể nhận biết được tất cả các chất trên là",
  "phuong_an": [
   "0. quỳ tím.",
   "1. H₂SO₄",
   "2. BaCl₂",
   "3. AgNO₃"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Quỳ tím nhận ra HCl (đỏ) và Ba(OH)₂ (xanh); dùng chính Ba(OH)₂ vừa tìm được nhỏ vào hai dung dịch trung tính thì Na₂SO₄ cho kết tủa trắng, NaCl không hiện tượng."
 },
 {
  "id": "bq_1789371866327_ofnss",
  "loai": "mc",
  "muc": "nb",
  "de": "Để nhận biết sự có mặt của ion sulfate trong dung dịch, người ta thường dùng",
  "phuong_an": [
   "0. dung dịch chứa ion Ba²⁺.",
   "1. quỳ tím.",
   "2. thuốc thử duy nhất là Ba(OH)₂.",
   "3. dung dịch muối Mg²⁺."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Ion Ba²⁺ tạo với SO₄²⁻ kết tủa trắng BaSO₄ không tan trong acid, nên bất kì dung dịch chứa Ba²⁺ (BaCl₂, Ba(NO₃)₂, Ba(OH)₂) đều nhận biết được."
 },
 {
  "id": "bq_1789371866327_p9t7l",
  "loai": "mc",
  "muc": "vd",
  "de": "Cho 21 gam hỗn hợp Zn và CuO phản ứng vừa đủ với 600 mL dung dịch H₂SO₄ 0,5 M. Phần trăm khối lượng của Zn có trong hỗn hợp ban đầu là",
  "phuong_an": [
   "0. 57%",
   "1. 62%",
   "2. 69%",
   "3. 73%"
  ],
  "dap_an_dung": 1,
  "giai_thich": "Cả Zn và CuO đều phản ứng theo tỉ lệ 1 : 1 với H₂SO₄ nên tổng số mol là 0,3; giải 65x + 80(0,3 − x) = 21 được x = 0,2, %Zn = 13/21 ≈ 62%."
 },
 {
  "id": "bq_1789371866327_pkqxg",
  "loai": "mc",
  "muc": "th",
  "de": "Cho phương trình hóa học: aAl + bH₂SO₄ → cAl₂(SO₄)₃ + dSO₂ + eH₂O. Tỉ lệ a : b là",
  "phuong_an": [
   "0. 1 : 1",
   "1. 2 : 3",
   "2. 1 : 3",
   "3. 1 : 2"
  ],
  "dap_an_dung": 2,
  "giai_thich": "Cân bằng electron: Al nhường 3e, S⁺⁶ nhận 2e nên 2Al + 6H₂SO₄ → Al₂(SO₄)₃ + 3SO₂ + 6H₂O, do đó a : b = 2 : 6 = 1 : 3."
 },
 {
  "id": "bq_1789371866327_puqzf",
  "loai": "mc",
  "muc": "nb",
  "de": "Dung dịch H₂SO₄ loãng là một",
  "phuong_an": [
   "0. chất oxi hóa mạnh.",
   "1. chất khử mạnh.",
   "2. base mạnh.",
   "3. acid mạnh."
  ],
  "dap_an_dung": 3,
  "giai_thich": "H₂SO₄ loãng phân li hoàn toàn nấc thứ nhất cho nhiều ion H⁺ nên là acid mạnh, thể hiện đầy đủ tính chất chung của acid."
 },
 {
  "id": "bq_1789371866327_qkiev",
  "loai": "mc",
  "muc": "nb",
  "de": "Sulfuric acid đặc hấp thụ mạnh hơi nước nên thường được dùng để",
  "phuong_an": [
   "0. làm khô các chất phản ứng mãnh liệt với nó.",
   "1. làm khô những khí không tương tác hóa học với nó.",
   "2. làm khô chất bất kì.",
   "3. làm gói hút ẩm."
  ],
  "dap_an_dung": 1,
  "giai_thich": "Chất làm khô chỉ được giữ nước mà không phản ứng với chất cần làm khô, nên H₂SO₄ đặc không dùng để làm khô NH₃ hay H₂S."
 },
 {
  "id": "bq_1789371866327_sqn48",
  "loai": "mc",
  "muc": "nb",
  "de": "Ứng dụng của calcium sulfate (CaSO₄) là",
  "phuong_an": [
   "0. làm chất phụ gia để làm đông các sản phẩm như đậu hũ, đậu non,...",
   "1. bột màu làm phụ gia pha màu cho công nghiệp sơn.",
   "2. sản xuất muối tắm.",
   "3. thành phần của thuốc trừ sâu hòa tan, thuốc diệt nấm."
  ],
  "dap_an_dung": 0,
  "giai_thich": "CaSO₄ (thạch cao) được dùng làm chất làm đông trong sản xuất đậu phụ, ngoài ra còn dùng làm phấn viết, bó bột và phụ gia xi măng."
 },
 {
  "id": "bq_1789371866327_t5y2i",
  "loai": "mc",
  "muc": "th",
  "de": "Dãy kim loại phản ứng được với dung dịch H₂SO₄ loãng là",
  "phuong_an": [
   "0. Ag, Ba, Fe, Sn",
   "1. Cu, Zn, Na, Ba",
   "2. Au, Pt",
   "3. K, Mg, Al, Fe, Zn"
  ],
  "dap_an_dung": 3,
  "giai_thich": "Chỉ kim loại đứng trước hydrogen mới khử được ion H⁺ của acid loãng; Ag, Cu, Au, Pt đều đứng sau hydrogen nên không phản ứng."
 },
 {
  "id": "bq_1789371866327_u5u0h",
  "loai": "mc",
  "muc": "nb",
  "de": "Phải thận trọng khi làm việc với dung dịch H₂SO₄ đặc vì khi bị dung dịch này bắn vào người, sẽ",
  "phuong_an": [
   "0. gây ra bỏng nặng.",
   "1. gây ra bỏng base.",
   "2. gây ra bỏng lạnh.",
   "3. không ảnh hưởng quá lớn."
  ],
  "dap_an_dung": 0,
  "giai_thich": "H₂SO₄ đặc có tính háo nước, lấy nước từ mô cơ thể và tỏa nhiều nhiệt nên gây bỏng acid rất nặng, phá hủy sâu vào da thịt."
 },
 {
  "id": "bq_1789371866327_z3fms",
  "loai": "mc",
  "muc": "nb",
  "de": "Ion sulfate có công thức là",
  "phuong_an": [
   "0. OH⁻",
   "1. SO₄²⁻",
   "2. CO₃²⁻",
   "3. S²⁻"
  ],
  "dap_an_dung": 1,
  "giai_thich": "Sulfate là gốc acid của H₂SO₄, mang hai đơn vị điện tích âm nên có công thức SO₄²⁻."
 },
 {
  "id": "bq_1789371866327_zsbqh",
  "loai": "mc",
  "muc": "vd",
  "de": "Nung 11,2 gam Fe và 26 gam Zn với một lượng S dư. Sản phẩm của phản ứng cho tan hoàn toàn trong dung dịch H₂SO₄ loãng, toàn bộ khí sinh ra được dẫn vào dung dịch CuSO₄ 10% (D = 1,2 g/mL). Biết các phản ứng xảy ra hoàn toàn. Thể tích tối thiểu của dung dịch CuSO₄ cần để hấp thụ hết khí sinh ra là",
  "phuong_an": [
   "0. 700 mL",
   "1. 800 mL",
   "2. 600 mL",
   "3. 500 mL"
  ],
  "dap_an_dung": 1,
  "giai_thich": "Fe 0,2 mol và Zn 0,4 mol tạo 0,6 mol sulfide nên sinh 0,6 mol H₂S, cần 0,6 mol CuSO₄ (96 gam) tức 960 gam dung dịch 10%, ứng với 960/1,2 = 800 mL."
 },
 {
  "id": "bq_1789371866328_4xay0",
  "loai": "mc",
  "muc": "th",
  "de": "Sulfuric acid đặc là chất rất nguy hiểm, có thể gây bỏng da khi tiếp xúc. Việc làm nào sau đây không đúng khi sử dụng và bảo quản sulfuric acid đặc?",
  "phuong_an": [
   "0. Bảo quản acid trong lọ có nút kín, đặt ở nơi khô ráo, thoáng mát.",
   "1. Khi pha loãng, rót từ từ acid đặc vào nước và khuấy đều.",
   "2. Khi acid bắn vào da, rửa ngay bằng thật nhiều nước rồi đến cơ sở y tế.",
   "3. Khi acid bắn vào da, dùng ngay dung dịch NaOH đặc để trung hòa acid trên da."
  ],
  "dap_an_dung": 3,
  "giai_thich": "Dung dịch base đặc cũng ăn mòn da và phản ứng trung hòa lại tỏa nhiệt mạnh, làm vết bỏng nặng thêm; cách đúng là rửa bằng thật nhiều nước để pha loãng và cuốn trôi acid."
 },
 {
  "id": "bq_1789371866328_6vwz8",
  "loai": "mc",
  "muc": "th",
  "de": "Trong công nghiệp, quy trình sản xuất sulfuric acid theo phương pháp tiếp xúc gồm các giai đoạn theo thứ tự",
  "phuong_an": [
   "0. S (hoặc FeS₂) → SO₂ → SO₃ → H₂SO₄",
   "1. S → SO₃ → SO₂ → H₂SO₄",
   "2. FeS₂ → H₂S → SO₂ → H₂SO₄",
   "3. SO₂ → S → SO₃ → H₂SO₄"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Đốt sulfur hoặc quặng pyrite tạo SO₂, oxi hóa SO₂ bằng O₂ với xúc tác V₂O₅ tạo SO₃, rồi hấp thụ SO₃ vào H₂SO₄ đặc tạo oleum và pha thành acid."
 },
 {
  "id": "bq_1789371866328_g935w",
  "loai": "mc",
  "muc": "th",
  "de": "Điểm khác nhau cơ bản giữa dung dịch H₂SO₄ đặc, nóng và dung dịch H₂SO₄ loãng khi tác dụng với kim loại là",
  "phuong_an": [
   "0. H₂SO₄ loãng oxi hóa kim loại nhờ ion H⁺ và giải phóng H₂, còn H₂SO₄ đặc nóng oxi hóa nhờ S⁺⁶ và cho SO₂.",
   "1. cả hai đều giải phóng khí H₂.",
   "2. cả hai đều chỉ tác dụng với kim loại đứng trước hydrogen.",
   "3. H₂SO₄ đặc nóng chỉ có tính acid, không có tính oxi hóa."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Trong acid loãng, chất oxi hóa là H⁺ nên chỉ kim loại đứng trước hydrogen phản ứng; trong acid đặc nóng, chất oxi hóa là S⁺⁶ nên oxi hóa được cả Cu, Ag."
 },
 {
  "id": "bq_1789372198145_82wx4",
  "loai": "mc",
  "muc": "nb",
  "de": "Diêm tiêu Chile (hay diêm tiêu natri) là tên gọi khác của hợp chất nào sau đây?",
  "phuong_an": [
   "0. Potassium sulfate.",
   "1. Sodium chloride.",
   "2. Sodium nitrate.",
   "3. Potassium nitrate."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Diêm tiêu Chile là NaNO₃ (sodium nitrate) khai thác từ các mỏ ở Chile, được dùng làm phân đạm nitrate."
 },
 {
  "id": "bq_1789372198146_jxpc6",
  "loai": "mc",
  "muc": "nb",
  "de": "Nhôm không bị hòa tan trong dung dịch",
  "phuong_an": [
   "0. HCl.",
   "1. H₂SO₄ loãng.",
   "2. HNO₃ loãng.",
   "3. HNO₃ đặc, nguội."
  ],
  "dap_an_dung": 3,
  "giai_thich": "Al bị thụ động hóa trong HNO₃ đặc, nguội (và H₂SO₄ đặc, nguội) do tạo lớp oxide bền, đặc khít trên bề mặt."
 },
 {
  "id": "bq_1789372198147_6iled",
  "loai": "mc",
  "muc": "th",
  "de": "Nhóm các chất nào sau đây tác dụng với dung dịch H₂SO₄ loãng chỉ xảy ra phản ứng trao đổi?",
  "phuong_an": [
   "0. Fe(OH)₃, Mg, CuO, KHCO₃.",
   "1. Fe, CuO, Cu(OH)₂, BaCl₂.",
   "2. FeO, Cu(OH)₂, BaCl₂, Na₂CO₃.",
   "3. Fe₂O₃, Cu(OH)₂, Zn, Na₂SO₃."
  ],
  "dap_an_dung": 2,
  "giai_thich": "H₂SO₄ loãng chỉ có tính acid (H⁺); oxide, hydroxide, muối phản ứng theo kiểu trao đổi, còn các kim loại Mg, Fe, Zn phản ứng oxi hóa – khử giải phóng H₂."
 },
 {
  "id": "bq_1789372198147_8qaq9",
  "loai": "mc",
  "muc": "th",
  "de": "Hầu hết các kim loại được tìm thấy dưới dạng quặng trên bề mặt Trái Đất và trải qua nhiều quá trình để tách được kim loại ra khỏi quặng. Quặng nào dưới đây không tạo thành sulfur dioxide khi nung trong lò?",
  "phuong_an": [
   "0. Chu sa (HgS).",
   "1. Pyrite (FeS₂).",
   "2. Thạch cao (CaSO₄.2H₂O).",
   "3. Chalcopyrite (CuFeS₂)."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Các quặng sulfide (HgS, FeS₂, CuFeS₂) khi nung trong không khí bị oxi hóa giải phóng SO₂; thạch cao là muối sulfate, khi nung chỉ mất nước kết tinh."
 },
 {
  "id": "bq_1789372198147_c8tcd",
  "loai": "mc",
  "muc": "th",
  "de": "Phương trình hóa học của phản ứng nào sau đây chứng tỏ ammonia là một chất khử?",
  "phuong_an": [
   "0. NH₃ + H₂O ⇌ NH₄⁺ + OH⁻.",
   "1. 2NH₃ + H₂SO₄ → (NH₄)₂SO₄.",
   "2. 4NH₃ + 5O₂ —t°, Pt→ 4NO + 6H₂O.",
   "3. NH₃ + HCl → NH₄Cl."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Trong phản ứng với O₂, số oxi hóa N tăng từ −3 lên +2 nên NH₃ là chất khử; trong các phản ứng còn lại NH₃ nhận H⁺, thể hiện tính base."
 },
 {
  "id": "bq_1789372198147_gigil",
  "loai": "mc",
  "muc": "th",
  "de": "Dãy gồm các chất đều phản ứng được với NH₃ là",
  "phuong_an": [
   "0. HNO₃ (aq), H₂SO₄ (aq), Na₂O (s).",
   "1. HCl (aq), O₂ (g, t°), AlCl₃ (aq).",
   "2. H₂SO₄ (aq), H₂S (aq), NaOH (aq).",
   "3. HCl (aq), FeCl₃ (aq), Na₂CO₃ (aq)."
  ],
  "dap_an_dung": 1,
  "giai_thich": "NH₃ phản ứng với acid (tính base), với O₂ khi đun nóng (tính khử) và với dung dịch muối Al³⁺, Fe³⁺ tạo hydroxide kết tủa; NH₃ không phản ứng với Na₂O, NaOH, Na₂CO₃."
 },
 {
  "id": "bq_1789372198147_k666r",
  "loai": "mc",
  "muc": "th",
  "de": "Cho các chất: S, SO₂, SO₃, H₂SO₄. Số chất vừa có tính oxi hóa, vừa có tính khử là",
  "phuong_an": [
   "0. 1.",
   "1. 3.",
   "2. 2.",
   "3. 4."
  ],
  "dap_an_dung": 2,
  "giai_thich": "S (số oxi hóa 0) và SO₂ (+4) có số oxi hóa trung gian nên vừa có thể tăng vừa có thể giảm; SO₃ và H₂SO₄ có S⁺⁶ cao nhất nên chỉ có tính oxi hóa."
 },
 {
  "id": "bq_1789372198147_n8jiw",
  "loai": "mc",
  "muc": "nb",
  "de": "H₂SO₄ đặc, nguội không tác dụng được với tất cả các kim loại thuộc nhóm nào?",
  "phuong_an": [
   "0. Al, Mg, Fe.",
   "1. Fe, Al, Cr.",
   "2. Ag, Cu, Au.",
   "3. Ag, Cu, Fe."
  ],
  "dap_an_dung": 1,
  "giai_thich": "Fe, Al, Cr bị thụ động trong H₂SO₄ đặc, nguội do lớp oxide bền trên bề mặt; Mg, Cu, Ag vẫn phản ứng được với H₂SO₄ đặc."
 },
 {
  "id": "bq_1789372198147_o30f7",
  "loai": "mc",
  "muc": "nb",
  "de": "Oleum có công thức tổng quát là",
  "phuong_an": [
   "0. H₂SO₄.nSO₂.",
   "1. H₂SO₄.nH₂O.",
   "2. H₂SO₄.nSO₃.",
   "3. H₂SO₄ đặc."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Oleum là dung dịch SO₃ trong H₂SO₄ đặc (H₂SO₄.nSO₃), tạo ra khi hấp thụ SO₃ bằng H₂SO₄ 98% trong sản xuất sulfuric acid."
 },
 {
  "id": "bq_1789372198147_s68l0",
  "loai": "mc",
  "muc": "vd",
  "de": "Cho FeS tác dụng với dung dịch H₂SO₄ loãng, thu được khí (A); nếu dùng dung dịch H₂SO₄ đặc, nóng thì thu được khí (B). Dẫn khí (B) vào dung dịch của (A) thu được rắn (C). Các chất (A), (B), (C) lần lượt là",
  "phuong_an": [
   "0. H₂, SO₂, S.",
   "1. O₂, SO₂, SO₃.",
   "2. H₂, H₂S, S.",
   "3. H₂S, SO₂, S."
  ],
  "dap_an_dung": 3,
  "giai_thich": "FeS + H₂SO₄ loãng → FeSO₄ + H₂S; với H₂SO₄ đặc, nóng, S⁻² bị oxi hóa và H₂SO₄ bị khử thành SO₂; SO₂ + 2H₂S → 3S + 2H₂O."
 },
 {
  "id": "bq_1789372198147_w3q4d",
  "loai": "mc",
  "muc": "nb",
  "de": "Số oxi hóa cao nhất có thể có của sulfur trong các hợp chất là",
  "phuong_an": [
   "0. +6.",
   "1. +8.",
   "2. +4.",
   "3. +5."
  ],
  "dap_an_dung": 0,
  "giai_thich": "S ở nhóm VIA có 6 electron hóa trị nên số oxi hóa cao nhất là +6 (như trong SO₃, H₂SO₄)."
 },
 {
  "id": "bq_1789372198151_0s2hu",
  "loai": "mc",
  "muc": "th",
  "de": "Cho phản ứng hóa học: S + H₂SO₄ đặc —t°→ X + H₂O. Vậy X là chất nào sau đây?",
  "phuong_an": [
   "0. SO₂.",
   "1. H₂S.",
   "2. H₂SO₃.",
   "3. SO₃."
  ],
  "dap_an_dung": 0,
  "giai_thich": "S (0) bị oxi hóa lên +4, S⁺⁶ trong H₂SO₄ bị khử xuống +4 nên cùng tạo SO₂: S + 2H₂SO₄ → 3SO₂ + 2H₂O."
 },
 {
  "id": "bq_1789372198151_bekwq",
  "loai": "mc",
  "muc": "th",
  "de": "Quá trình nào sau đây không chứng minh tính oxi hóa mạnh của sulfuric acid?",
  "phuong_an": [
   "0. Cho Cu vào dung dịch H₂SO₄ đặc, đun nóng.",
   "1. Cho S vào dung dịch H₂SO₄ đặc, đun nóng.",
   "2. Cho tinh thể KBr vào dung dịch H₂SO₄ đặc.",
   "3. Dẫn khí N₂ ẩm qua dung dịch H₂SO₄ đặc."
  ],
  "dap_an_dung": 3,
  "giai_thich": "H₂SO₄ đặc hút nước làm khô N₂ ẩm, đó là tính háo nước; trong các trường hợp còn lại S⁺⁶ bị khử thành SO₂ khi oxi hóa Cu, S, Br⁻."
 },
 {
  "id": "bq_1789372198151_gzg1d",
  "loai": "mc",
  "muc": "th",
  "de": "Phản ứng nào dưới đây không đúng?",
  "phuong_an": [
   "0. H₂SO₄ đặc + FeO → FeSO₄ + H₂O.",
   "1. H₂SO₄ đặc + 2HI → I₂ + SO₂ + 2H₂O.",
   "2. 2H₂SO₄ đặc + C → CO₂ + 2SO₂ + 2H₂O.",
   "3. 6H₂SO₄ đặc + 2Fe → Fe₂(SO₄)₃ + 3SO₂ + 6H₂O."
  ],
  "dap_an_dung": 0,
  "giai_thich": "FeO chứa Fe⁺² nên bị H₂SO₄ đặc oxi hóa lên Fe⁺³: 2FeO + 4H₂SO₄ → Fe₂(SO₄)₃ + SO₂ + 4H₂O, không tạo FeSO₄."
 },
 {
  "id": "bq_1789372198151_j9ggr",
  "loai": "mc",
  "muc": "nb",
  "de": "Muốn pha loãng dung dịch acid H₂SO₄ đặc cần làm như sau:",
  "phuong_an": [
   "0. Rót từ từ dung dịch acid đặc vào nước.",
   "1. Rót từ từ nước vào dung dịch acid đặc.",
   "2. Rót nhanh dung dịch acid đặc vào nước.",
   "3. Rót thật nhanh nước vào dung dịch acid đặc."
  ],
  "dap_an_dung": 0,
  "giai_thich": "H₂SO₄ đặc tan trong nước tỏa rất nhiều nhiệt; rót từ từ acid vào lượng nước lớn và khuấy đều để nhiệt phân tán, tránh nước sôi bắn acid ra ngoài."
 },
 {
  "id": "bq_1789372198151_jbgs6",
  "loai": "mc",
  "muc": "vd",
  "de": "Thể tích dung dịch H₂SO₄ 98% (D = 1,84 g/mL) cần dùng để pha chế 2 lít dung dịch H₂SO₄ 0,05 M là",
  "phuong_an": [
   "0. 4,35 mL",
   "1. 3,45 mL",
   "2. 3,53 mL",
   "3. 5,43 mL"
  ],
  "dap_an_dung": 3,
  "giai_thich": "n(H₂SO₄) = 2·0,05 = 0,1 mol, m = 9,8 g; m dung dịch 98% = 9,8/0,98 = 10 g; V = 10/1,84 ≈ 5,43 mL."
 },
 {
  "id": "bq_1789372198151_mq6zl",
  "loai": "mc",
  "muc": "th",
  "de": "Dung dịch sulfuric acid loãng tác dụng được với dãy nào sau đây?",
  "phuong_an": [
   "0. S và H₂S.",
   "1. Fe và Fe(OH)₃.",
   "2. Cu và Cu(OH)₂.",
   "3. C và CO₂."
  ],
  "dap_an_dung": 1,
  "giai_thich": "H₂SO₄ loãng chỉ có tính acid: hòa tan kim loại đứng trước H (Fe) và base (Fe(OH)₃); không phản ứng với Cu, S, C, H₂S, CO₂."
 },
 {
  "id": "bq_1789372198152_2gd5x",
  "loai": "mc",
  "muc": "vd",
  "de": "Để trừ nấm thực vật, người ta dùng dung dịch CuSO₄ 0,8%. Lượng dung dịch CuSO₄ 0,8% pha chế được từ 60 gam CuSO₄.5H₂O là",
  "phuong_an": [
   "0. 7500 gam",
   "1. 4800 gam",
   "2. 3840 gam",
   "3. 6000 gam"
  ],
  "dap_an_dung": 1,
  "giai_thich": "m(CuSO₄) = 60·160/250 = 38,4 g; m dung dịch = 38,4/0,008 = 4800 g."
 },
 {
  "id": "bq_1789372198152_38uca",
  "loai": "mc",
  "muc": "vd",
  "de": "Hỗn hợp X gồm NH₄Cl và (NH₄)₂SO₄. Cho X tác dụng với dung dịch Ba(OH)₂ dư, đun nhẹ thu được 9,32 gam kết tủa và 2,479 lít (đkc) khí thoát ra. Hỗn hợp X có khối lượng là",
  "phuong_an": [
   "0. 5,28 gam.",
   "1. 6,60 gam.",
   "2. 5,35 gam.",
   "3. 6,35 gam."
  ],
  "dap_an_dung": 3,
  "giai_thich": "n(BaSO₄) = 0,04 mol nên (NH₄)₂SO₄ = 0,04 mol (5,28 g); n(NH₃) = 0,1 mol bằng tổng NH₄⁺ nên NH₄Cl = 0,1 − 0,08 = 0,02 mol (1,07 g); m(X) = 6,35 g."
 },
 {
  "id": "bq_1789372198152_h458y",
  "loai": "mc",
  "muc": "vdc",
  "de": "Hòa tan hoàn toàn 24 gam hỗn hợp X gồm MO, M(OH)₂ và MCO₃ (M là kim loại có hóa trị không đổi) trong 100 gam dung dịch H₂SO₄ 39,2%, thu được 1,2395 lít khí (đkc) và dung dịch Y chỉ chứa một chất tan duy nhất có nồng độ 39,41%. Kim loại M là",
  "phuong_an": [
   "0. Mg.",
   "1. Ca.",
   "2. Zn.",
   "3. Cu."
  ],
  "dap_an_dung": 0,
  "giai_thich": "n(H₂SO₄) = 0,4 mol = n(MSO₄); m(dd Y) = 24 + 100 − 0,05·44 = 121,8 g; m(MSO₄) = 0,3941·121,8 ≈ 48 g nên M(MSO₄) = 120, M = 24 (Mg)."
 },
 {
  "id": "bq_1789372198152_jgsar",
  "loai": "mc",
  "muc": "vdc",
  "de": "Từ 800 tấn quặng pyrite sắt (FeS₂) chứa 25% tạp chất không cháy, có thể sản xuất được bao nhiêu m³ dung dịch H₂SO₄ 93% (D = 1,83 g/mL)? Giả thiết tỉ lệ hao hụt là 5%.",
  "phuong_an": [
   "0. 547,04 m³",
   "1. 575,83 m³",
   "2. 509,82 m³",
   "3. 1001,08 m³"
  ],
  "dap_an_dung": 0,
  "giai_thich": "m(FeS₂) = 600 tấn; FeS₂ → 2H₂SO₄ nên m(H₂SO₄) = 600·196/120 = 980 tấn, trừ hao hụt 5% còn 931 tấn; m dung dịch = 931/0,93 ≈ 1001,08 tấn, V = 1001,08/1,83 ≈ 547,04 m³."
 },
 {
  "id": "bq_1789372198152_om9b4",
  "loai": "mc",
  "muc": "vd",
  "de": "Cho 21,3 gam hỗn hợp bột X gồm 3 kim loại Mg, Cu và Al tác dụng hoàn toàn với O₂ (có đun nóng), thu được hỗn hợp chất rắn B có khối lượng 33,3 gam. Để hòa tan hoàn toàn B cần phải dùng tối thiểu V mL hỗn hợp HCl 2M và H₂SO₄ 1M. Giá trị của V là",
  "phuong_an": [
   "0. 375",
   "1. 750",
   "2. 187,5",
   "3. 500"
  ],
  "dap_an_dung": 0,
  "giai_thich": "m(O) = 33,3 − 21,3 = 12 g, n(O) = 0,75 mol; mỗi O²⁻ cần 2H⁺ tạo H₂O nên n(H⁺) = 1,5 mol; mỗi lít dung dịch acid chứa 2 + 2 = 4 mol H⁺ nên V = 0,375 L = 375 mL."
 },
 {
  "id": "bq_1789372198153_byf9c",
  "loai": "mc",
  "muc": "vd",
  "de": "Thể tích dung dịch H₂SO₄ 98% (D = 1,84 g/mL) cần dùng để pha chế thành 500 mL dung dịch H₂SO₄ 0,05 M là",
  "phuong_an": [
   "0. 1,36 mL",
   "1. 2,50 mL",
   "2. 2,45 mL",
   "3. 4,60 mL"
  ],
  "dap_an_dung": 0,
  "giai_thich": "n(H₂SO₄) = 0,025 mol, m = 2,45 g; m dung dịch 98% = 2,45/0,98 = 2,5 g; V = 2,5/1,84 ≈ 1,36 mL."
 },
 {
  "id": "bq_1789372198153_op4jx",
  "loai": "mc",
  "muc": "nb",
  "de": "Dung dịch sulfuric acid đặc khác dung dịch sulfuric acid loãng ở tính chất hóa học nào?",
  "phuong_an": [
   "0. Tính base mạnh.",
   "1. Tính oxi hóa mạnh.",
   "2. Tính acid mạnh.",
   "3. Tính khử mạnh."
  ],
  "dap_an_dung": 1,
  "giai_thich": "Cả hai đều có tính acid, nhưng chỉ H₂SO₄ đặc có tính oxi hóa mạnh do S⁺⁶ nhận electron (và tính háo nước); H₂SO₄ loãng oxi hóa chỉ nhờ H⁺."
 },
 {
  "id": "bq_1789372198153_ox68p",
  "loai": "mc",
  "muc": "th",
  "de": "Nhóm các chất nào sau đây đều tác dụng được với dung dịch H₂SO₄ loãng?",
  "phuong_an": [
   "0. Fe, CuO, Cu(OH)₂, BaCl₂, NaCl.",
   "1. FeO, Cu, Cu(OH)₂, BaCl₂, Na₂CO₃.",
   "2. Fe₂O₃, Cu(OH)₂, Zn, Na₂SO₃, Ba(NO₃)₂.",
   "3. Fe(OH)₃, Ag, CuO, KHCO₃, MgS."
  ],
  "dap_an_dung": 2,
  "giai_thich": "NaCl không phản ứng vì không tạo kết tủa, khí hay chất điện li yếu; Cu, Ag đứng sau H nên không tác dụng với H₂SO₄ loãng."
 },
 {
  "id": "bq_1789373737083_c5p1u",
  "loai": "mc",
  "muc": "th",
  "de": "Dung dịch H₂SO₄ đặc, nóng tác dụng với cặp chất nào sau đây thu được sản phẩm không có khí thoát ra?",
  "phuong_an": [
   "0. P và Mg.",
   "1. Fe và KOH.",
   "2. Cu(OH)₂ và BaCl₂.",
   "3. Na₂CO₃ và Al₂O₃."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Cu(OH)₂ và BaCl₂ đều có nguyên tố ở số oxi hóa cao nhất nên chỉ xảy ra phản ứng trao đổi; các cặp còn lại có P, Mg, Fe sinh SO₂ hoặc Na₂CO₃ sinh CO₂."
 },
 {
  "id": "bq_1789373737083_ifxmt",
  "loai": "mc",
  "muc": "th",
  "de": "Kim loại nào sau đây tan được trong dung dịch H₂SO₄ loãng nhưng không tan được trong dung dịch H₂SO₄ đặc, nguội?",
  "phuong_an": [
   "0. Cu.",
   "1. Zn.",
   "2. Mg.",
   "3. Fe."
  ],
  "dap_an_dung": 3,
  "giai_thich": "Fe đứng trước hydrogen nên tan trong acid loãng, nhưng bị H₂SO₄ đặc nguội thụ động hóa nhờ lớp oxide bền bảo vệ bề mặt."
 },
 {
  "id": "bq_1789373737083_jwmsb",
  "loai": "mc",
  "muc": "th",
  "de": "Phát biểu nào sau đây sai?",
  "phuong_an": [
   "0. Trong phòng thí nghiệm, SO₂ được điều chế bằng cách đốt quặng pyrite.",
   "1. SO₂ là chất trung gian để sản xuất sulfuric acid.",
   "2. SO₂ được dùng làm chất tẩy trắng đường mía, giấy và bột giấy.",
   "3. SO₂ được dùng làm chất diệt nấm mốc cho đồ mây tre, gỗ và nông sản giống."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Đốt quặng pyrite là phương pháp công nghiệp; trong phòng thí nghiệm, SO₂ được điều chế bằng cách cho muối sulfite tác dụng với dung dịch acid mạnh."
 },
 {
  "id": "bq_1789373737083_naall",
  "loai": "mc",
  "muc": "vdc",
  "de": "Sulfuric acid được điều chế từ quặng pyrite theo sơ đồ FeS₂ → SO₂ → SO₃ → H₂SO₄. Tính thể tích dung dịch H₂SO₄ 95% (D = 1,82 g/mL) thu được từ 1 tấn quặng pyrite chứa 80% FeS₂, biết hiệu suất của cả quá trình là 90% và tạp chất trong quặng không chứa sulfur.",
  "phuong_an": [
   "0. khoảng 680 lít.",
   "1. khoảng 646 lít.",
   "2. khoảng 756 lít.",
   "3. khoảng 612 lít."
  ],
  "dap_an_dung": 0,
  "giai_thich": "800 kg FeS₂ ứng với 6666,7 mol, mỗi mol cho 2 mol H₂SO₄ nên thu 12000 mol acid sau khi nhân hiệu suất 90%, tức 1176 kg; khối lượng dung dịch 95% là 1237,9 kg và V = 1237894/1,82 ≈ 680 000 mL."
 },
 {
  "id": "bq_1789373737083_r59e7",
  "loai": "mc",
  "muc": "vdc",
  "de": "Hỗn hợp X gồm SO₂ và O₂ có tỉ khối so với H₂ bằng 28. Lấy 4,958 lít hỗn hợp X (đkc) cho đi qua bình đựng V₂O₅ nung nóng. Hỗn hợp thu được cho lội qua dung dịch Ba(OH)₂ dư thấy có 33,51 gam kết tủa. Hiệu suất phản ứng oxi hóa SO₂ thành SO₃ là",
  "phuong_an": [
   "0. 30%",
   "1. 40%",
   "2. 50%",
   "3. 60%"
  ],
  "dap_an_dung": 1,
  "giai_thich": "n(X) = 0,2 mol với M trung bình 56 cho SO₂ 0,15 mol và O₂ 0,05 mol; gọi SO₂ phản ứng là x thì 233x + 217(0,15 − x) = 33,51 nên x = 0,06 và H = 0,06/0,15 = 40%."
 },
 {
  "id": "bq_1789373737083_ryww2",
  "loai": "mc",
  "muc": "th",
  "de": "Cho các phản ứng: (a) NH₃ + HCl; (b) FeO + H₂SO₄ loãng; (c) Cu + H₂SO₄ đặc, nóng; (d) BaCl₂ + Na₂SO₄. Sản phẩm của phản ứng (c) gồm",
  "phuong_an": [
   "0. CuSO₄, SO₂ và H₂O.",
   "1. CuSO₄ và H₂.",
   "2. CuSO₄ và H₂O.",
   "3. CuS, SO₂ và H₂O."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Cu bị S⁺⁶ trong acid đặc nóng oxi hóa lên Cu²⁺ theo phương trình Cu + 2H₂SO₄ (đặc) → CuSO₄ + SO₂ + 2H₂O."
 },
 {
  "id": "bq_1789373737083_tg8mr",
  "loai": "mc",
  "muc": "th",
  "de": "[Hình: ba hình vẽ nhỏ mô tả ba cách pha loãng, mỗi hình gồm một cốc thủy tinh đựng chất lỏng và một ống nghiêng rót chất lỏng vào cốc. Cách 1: cốc đựng H₂O, rót H₂SO₄ từ ống vào cốc. Cách 2: cốc đựng H₂SO₄, rót H₂O từ ống vào cốc. Cách 3: cốc rỗng, rót đồng thời H₂O từ ống bên trái và H₂SO₄ từ ống bên phải vào cốc.] Để pha loãng H₂SO₄ đặc an toàn thì cách nào sau đây là đúng?",
  "phuong_an": [
   "0. Cách 2.",
   "1. Cách 1.",
   "2. Cách 1 và 2.",
   "3. Cách 3."
  ],
  "dap_an_dung": 1,
  "giai_thich": "Phải rót từ từ acid đặc vào nước (cách 1) vì nước có nhiệt dung lớn, hấp thụ được nhiệt tỏa ra; làm ngược lại nước sôi bùng và bắn acid ra ngoài."
 }
]
```
