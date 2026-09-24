# Đề dẫn soát nội dung — 107 câu

Mở tệp này trong Antigravity rồi bảo nó: *"làm đúng yêu cầu trong tệp,
ghi kết quả ra `docs/soat-hoa-hoc/tra-loi-2026-09-22-1946-bai-2-loai-mc-1.json`"*.

**Rồi làm lại LẦN NỮA**, trong một phiên mới, ghi ra
`docs/soat-hoa-hoc/tra-loi-2026-09-22-1946-bai-2-loai-mc-2.json`. Một lượt soát
KHÔNG đủ: đo 20/09/2026, cùng 16 câu chạy ba lượt cho ra 3, 3, rồi 0 câu
nghi ngờ — và ba câu bị bỏ sót ở lượt thứ ba là lỗi THẬT.

Xong thì nạp CẢ HAI, ngăn bằng dấu phẩy, KHÔNG có dấu cách:

```bash
npm run soat:hoa-hoc -- --nap docs/soat-hoa-hoc/tra-loi-2026-09-22-1946-bai-2-loai-mc-1.json,docs/soat-hoa-hoc/tra-loi-2026-09-22-1946-bai-2-loai-mc-2.json
```

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
  "id": "b:1:nb:3",
  "loai": "mc",
  "muc": "nb",
  "de": "Theo thuyết Brønsted – Lowry, acid là chất",
  "phuong_an": [
   "0. cho proton H⁺",
   "1. nhận proton H⁺",
   "2. cho cặp electron",
   "3. tan trong nước tạo ion OH⁻"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Brønsted – Lowry: acid là chất cho proton, base là chất nhận proton. Nhờ đó NH₃ tuy không chứa OH vẫn là base."
 },
 {
  "id": "b:1:nb:4",
  "loai": "mc",
  "muc": "nb",
  "de": "Dung dịch có pH = 3 thuộc môi trường",
  "phuong_an": [
   "0. acid",
   "1. trung tính",
   "2. base",
   "3. lưỡng tính"
  ],
  "dap_an_dung": 0,
  "giai_thich": "pH < 7 là môi trường acid, pH = 7 trung tính, pH > 7 là môi trường base."
 },
 {
  "id": "b:1:nb:5",
  "loai": "mc",
  "muc": "nb",
  "de": "Phenolphthalein chuyển sang màu hồng trong môi trường",
  "phuong_an": [
   "0. acid",
   "1. trung tính",
   "2. base",
   "3. mọi môi trường"
  ],
  "dap_an_dung": 2,
  "giai_thich": "Phenolphthalein không màu trong acid và trung tính, chuyển hồng khi pH khoảng 8,3 trở lên nên dùng nhận biết môi trường base."
 },
 {
  "id": "b:1:nb:6",
  "loai": "mc",
  "muc": "nb",
  "de": "Chất nào sau đây là chất điện li mạnh?",
  "phuong_an": [
   "0. CH₃COOH",
   "1. HCl",
   "2. NH₃",
   "3. C₂H₅OH"
  ],
  "dap_an_dung": 1,
  "giai_thich": "HCl phân li hoàn toàn trong nước thành H⁺ và Cl⁻. CH₃COOH và NH₃ là chất điện li yếu, còn C₂H₅OH không điện li."
 },
 {
  "id": "b:1:nb:7",
  "loai": "mc",
  "muc": "nb",
  "de": "Công thức tính pH của dung dịch là",
  "phuong_an": [
   "0. pH = log[H⁺]",
   "1. pH = −log[H⁺]",
   "2. pH = [H⁺]",
   "3. pH = −log[OH⁻]"
  ],
  "dap_an_dung": 1,
  "giai_thich": "pH = −log[H⁺]. Với dung dịch loãng ở 25 °C ta luôn có pH + pOH = 14."
 },
 {
  "id": "b:1:th:3",
  "loai": "mc",
  "muc": "th",
  "de": "pH của dung dịch HCl 0,01 M là",
  "phuong_an": [
   "0. 1",
   "1. 2",
   "2. 12",
   "3. 0,01"
  ],
  "dap_an_dung": 1,
  "giai_thich": "HCl điện li hoàn toàn nên [H⁺] = 0,01 = 10⁻² M, do đó pH = 2."
 },
 {
  "id": "b:1:th:4",
  "loai": "mc",
  "muc": "th",
  "de": "pH của dung dịch NaOH 0,001 M là",
  "phuong_an": [
   "0. 3",
   "1. 7",
   "2. 11",
   "3. 13"
  ],
  "dap_an_dung": 2,
  "giai_thich": "[OH⁻] = 10⁻³ M nên pOH = 3, suy ra pH = 14 − 3 = 11."
 },
 {
  "id": "b:1:th:5",
  "loai": "mc",
  "muc": "th",
  "de": "Cặp chất nào sau đây là một cặp acid – base liên hợp?",
  "phuong_an": [
   "0. HCl và NaOH",
   "1. HCO₃⁻ và CO₃²⁻",
   "2. H₂SO₄ và SO₄²⁻",
   "3. NH₃ và OH⁻"
  ],
  "dap_an_dung": 1,
  "giai_thich": "Cặp acid – base liên hợp chỉ khác nhau một proton H⁺. HCO₃⁻ cho một H⁺ thành CO₃²⁻."
 },
 {
  "id": "b:1:th:6",
  "loai": "mc",
  "muc": "th",
  "de": "Dung dịch Na₂CO₃ có pH",
  "phuong_an": [
   "0. nhỏ hơn 7",
   "1. bằng 7",
   "2. lớn hơn 7",
   "3. luôn bằng 14"
  ],
  "dap_an_dung": 2,
  "giai_thich": "Ion CO₃²⁻ là base yếu, nhận H⁺ của nước sinh ra OH⁻ nên dung dịch có môi trường base, pH > 7."
 },
 {
  "id": "b:1:vd:2",
  "loai": "mc",
  "muc": "vd",
  "de": "Trộn 100 mL dung dịch HCl 0,2 M với 100 mL dung dịch NaOH 0,4 M. pH của dung dịch sau phản ứng là",
  "phuong_an": [
   "0. 1",
   "1. 7",
   "2. 12",
   "3. 13"
  ],
  "dap_an_dung": 3,
  "giai_thich": "n(H⁺) = 0,02; n(OH⁻) = 0,04 nên OH⁻ dư 0,02 mol trong 0,2 L → [OH⁻] = 0,1 M → pOH = 1 → pH = 13."
 },
 {
  "id": "b:1:vd:3",
  "loai": "mc",
  "muc": "vd",
  "de": "Nồng độ ion H⁺ trong dung dịch có pH = 5 lớn gấp bao nhiêu lần dung dịch có pH = 8?",
  "phuong_an": [
   "0. 3 lần",
   "1. 30 lần",
   "2. 1000 lần",
   "3. 100 lần"
  ],
  "dap_an_dung": 2,
  "giai_thich": "[H⁺] lần lượt là 10⁻⁵ và 10⁻⁸ M, tỉ lệ bằng 10³ = 1000 lần."
 },
 {
  "id": "b:1:vd:4",
  "loai": "mc",
  "muc": "vd",
  "de": "Dung dịch CH₃COOH 0,1 M có độ điện li α = 1%. pH của dung dịch là",
  "phuong_an": [
   "0. 1",
   "1. 2",
   "2. 3",
   "3. 4"
  ],
  "dap_an_dung": 2,
  "giai_thich": "[H⁺] = 0,1 × 0,01 = 10⁻³ M nên pH = 3. Acid yếu nên pH lớn hơn acid mạnh cùng nồng độ."
 },
 {
  "id": "b:1:vdc:1",
  "loai": "mc",
  "muc": "vdc",
  "de": "Trộn 200 mL dung dịch HCl 0,1 M với 300 mL dung dịch NaOH 0,1 M. pH của dung dịch thu được là (biết lg2 ≈ 0,30)",
  "phuong_an": [
   "0. 1,70",
   "1. 12,00",
   "2. 12,30",
   "3. 13,00"
  ],
  "dap_an_dung": 2,
  "giai_thich": "n(H⁺) = 0,02; n(OH⁻) = 0,03 nên OH⁻ dư 0,01 mol trong 0,5 L → [OH⁻] = 0,02 M → pOH = 2 − lg2 = 1,70 → pH = 12,30."
 },
 {
  "id": "bq_1788161089233_axxej",
  "loai": "mc",
  "muc": "vd",
  "de": "Trộn 150 ml dung dịch CH₃COOH 0,1M với 100 ml dung dịch NaOH 0,1M thu được dung dịch X. Biết Ka của CH₃COOH là 1,75.10⁻⁵. Giá trị pH của dung dịch X gần nhất với:",
  "phuong_an": [
   "0. 5,06",
   "1. 4,74",
   "2. 8,80",
   "3. 5,30"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Dung dịch sau phản ứng có hệ đệm gồm CH₃COONa 0,04M và CH₃COOH dư 0,02M. Dùng phương trình Henderson-Hasselbalch: pH = pKa + log(0,04/0,02) = 4,757 + 0,3 = 5,06."
 },
 {
  "id": "bq_1788161296549_4d02n",
  "loai": "mc",
  "muc": "th",
  "de": "Trong phản ứng sau đây, những chất nào đóng vai trò là acid theo thuyết Brønsted - Lowry: H₂S(aq) + H₂O ⇌ HS⁻(aq) + H₃O⁺(aq)?",
  "phuong_an": [
   "0. H2O và H3O+",
   "1. H2S và H2O",
   "2. H2S và H3O+",
   "3. HS- và H2O"
  ],
  "dap_an_dung": 2,
  "giai_thich": "Acid là chất nhường proton (H⁺). Ở chiều thuận, H₂S nhường H⁺ tạo HS⁻, nên H₂S là acid. Ở chiều nghịch, H₃O⁺ nhường H⁺ tạo H₂O, nên H₃O⁺ là acid."
 },
 {
  "id": "bq_1788161296549_5lv4x",
  "loai": "mc",
  "muc": "vd",
  "de": "[Hình ảnh: Bệnh gout ở bàn chân cho thấy tinh thể uric acid tích tụ ở khớp nối gây sưng viêm] Bệnh viêm khớp (gout) xuất hiện do sự kết tủa của sodium urate (NaUr) trong khớp. Ở 37 °C, 1,0 L nước hòa tan được tối đa 8,0 mmol sodium urate. Bỏ qua sự thủy phân của urate, tích số tan của sodium urate là:",
  "phuong_an": [
   "0. 6,4.10⁻⁵",
   "1. 8,0.10⁻³",
   "2. 1,6.10⁻²",
   "3. 3,2.10⁻⁵"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Nồng độ bão hòa [NaUr] = 8,0.10⁻³ M. Khi phân li cho [Na⁺] = 8,0.10⁻³ M và [Ur⁻] = 8,0.10⁻³ M. Tích số tan Ksp = [Na⁺][Ur⁻] = (8,0.10⁻³)² = 6,4.10⁻⁵."
 },
 {
  "id": "bq_1788161296549_vtq8l",
  "loai": "mc",
  "muc": "nb",
  "de": "Saccharose là chất không điện li vì",
  "phuong_an": [
   "0. phân tử saccharose không có khả năng hoà tan trong nước.",
   "1. phân tử saccharose không có khả năng phân li thành ion trong nước.",
   "2. phân tử saccharose có khả năng hoà tan trong nước.",
   "3. phân tử saccharose không có tính dẫn điện."
  ],
  "dap_an_dung": 1,
  "giai_thich": "Saccharose (đường kính) là hợp chất cộng hóa trị phân cực, có tan trong nước nhưng các phân tử của nó không phân li thành các ion, do đó dung dịch không dẫn điện và được gọi là chất không điện li."
 },
 {
  "id": "bq_1788161555460_o06al",
  "loai": "mc",
  "muc": "vd",
  "de": "Độ pH tiêu chuẩn của nước hồ bơi là 7,2 – 7,8. Nếu pH hồ bơi quá thấp (môi trường acid), có thể dùng hóa chất nào sau đây để làm tăng pH an toàn?",
  "phuong_an": [
   "0. Na₂CO₃",
   "1. NaCl",
   "2. NaHSO₄",
   "3. HCl"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Na₂CO₃ là muối của acid yếu và base mạnh, ion CO₃²⁻ thủy phân trong nước tạo môi trường kiềm (OH⁻), giúp trung hòa acid và làm tăng pH."
 },
 {
  "id": "bq_1788161555460_tx9mk",
  "loai": "mc",
  "muc": "th",
  "de": "Cho phương trình: S²⁻ + H₂O ⇌ HS⁻ + OH⁻. Theo chiều phản ứng nghịch, ion hay chất nào đóng vai trò là base (theo thuyết Brønsted - Lowry)?",
  "phuong_an": [
   "0. OH⁻",
   "1. H₂O",
   "2. S²⁻",
   "3. HS⁻"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Chiều phản ứng nghịch: HS⁻ + OH⁻ → S²⁻ + H₂O. Trong quá trình này, OH⁻ nhận 1 proton (H⁺) từ HS⁻ để tạo thành H₂O, do đó OH⁻ đóng vai trò là base."
 },
 {
  "id": "bq_1789371866323_ta0q1",
  "loai": "mc",
  "muc": "nb",
  "de": "Chất nào sau đây thuộc loại chất điện li mạnh?",
  "phuong_an": [
   "0. C₂H₅OH.",
   "1. HF.",
   "2. KOH.",
   "3. CH₃COOH."
  ],
  "dap_an_dung": 2,
  "giai_thich": "KOH là base mạnh, tan trong nước phân li hoàn toàn thành K⁺ và OH⁻; HF, CH₃COOH là acid yếu chỉ phân li một phần, còn C₂H₅OH không điện li."
 },
 {
  "id": "bq_1789371866323_y3jmh",
  "loai": "mc",
  "muc": "th",
  "de": "Theo thuyết Brønsted – Lowry, chất (phân tử hoặc ion) nào sau đây là base?",
  "phuong_an": [
   "0. H₂S.",
   "1. Ba²⁺.",
   "2. CO₃²⁻.",
   "3. Na⁺."
  ],
  "dap_an_dung": 2,
  "giai_thich": "CO₃²⁻ nhận được proton (CO₃²⁻ + H₂O ⇌ HCO₃⁻ + OH⁻) nên là base; H₂S cho proton là acid, còn Ba²⁺ và Na⁺ không cho cũng không nhận proton."
 },
 {
  "id": "bq_1789371866324_2uvkx",
  "loai": "mc",
  "muc": "nb",
  "de": "Dịch vị dạ dày của người bình thường có pH trong khoảng 1,5 – 3,5. Môi trường của dịch vị dạ dày là",
  "phuong_an": [
   "0. môi trường base.",
   "1. môi trường acid.",
   "2. môi trường trung tính.",
   "3. môi trường trung hòa."
  ],
  "dap_an_dung": 1,
  "giai_thich": "pH < 7 là môi trường acid; dịch vị chứa HCl giúp enzyme tiêu hóa hoạt động và diệt khuẩn."
 },
 {
  "id": "bq_1789371866324_3zn0q",
  "loai": "mc",
  "muc": "th",
  "de": "Đối với dung dịch acid yếu CH₃COOH 0,10 M, nếu bỏ qua sự điện li của nước thì đánh giá nào về nồng độ mol ion sau đây là đúng?",
  "phuong_an": [
   "0. [H⁺] = 0,10 M.",
   "1. [H⁺] < [CH₃COO⁻].",
   "2. [H⁺] > [CH₃COO⁻].",
   "3. [H⁺] < 0,10 M."
  ],
  "dap_an_dung": 3,
  "giai_thich": "CH₃COOH ⇌ CH₃COO⁻ + H⁺ chỉ phân li một phần nên [H⁺] = [CH₃COO⁻] < 0,10 M."
 },
 {
  "id": "bq_1789371866324_8ubat",
  "loai": "mc",
  "muc": "th",
  "de": "Đất chua là đất có độ pH dưới 6,5. Một mẫu dung dịch đất đo được pH = 4,52. Phát biểu nào sau đây đúng?",
  "phuong_an": [
   "0. Nồng độ ion H⁺ trong dung dịch đất là 10^(4,52) M.",
   "1. Mẫu đất trên có môi trường base.",
   "2. Có thể bón vôi sống (CaO) để làm tăng pH của đất.",
   "3. Nên bón thêm NH₄Cl để giảm độ chua của đất."
  ],
  "dap_an_dung": 2,
  "giai_thich": "pH = 4,52 nên [H⁺] = 10^(−4,52) M và đất có tính acid; CaO là oxide base trung hòa bớt H⁺, còn NH₄⁺ thủy phân tạo H₃O⁺ làm đất chua thêm."
 },
 {
  "id": "bq_1789371866324_ak4ex",
  "loai": "mc",
  "muc": "nb",
  "de": "Giá trị pH của một dung dịch được tính theo biểu thức nào sau đây?",
  "phuong_an": [
   "0. pH = −lg[H⁺]",
   "1. pH = 14 + lg[H⁺]",
   "2. pH = 14 − lg[OH⁻]",
   "3. pH = lg[OH⁻]"
  ],
  "dap_an_dung": 0,
  "giai_thich": "pH là âm logarit thập phân của nồng độ ion H⁺; ở 25 °C có thể tính qua [OH⁻] bằng pH = 14 + lg[OH⁻]."
 },
 {
  "id": "bq_1789371866324_cs9ct",
  "loai": "mc",
  "muc": "th",
  "de": "Phát biểu nào sau đây đúng?",
  "phuong_an": [
   "0. Cân bằng CO(g) + H₂O(g) ⇌ CO₂(g) + H₂(g) chuyển dịch sang phải khi tăng áp suất.",
   "1. Dung dịch Na₂CO₃ có môi trường acid.",
   "2. Cân bằng hóa học là cân bằng động.",
   "3. Dung dịch AlCl₃ và FeCl₃ có môi trường base."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Ở trạng thái cân bằng, phản ứng thuận và nghịch vẫn diễn ra với tốc độ bằng nhau nên cân bằng là động; các phương án còn lại sai về áp suất và môi trường muối."
 },
 {
  "id": "bq_1789371866324_ipik3",
  "loai": "mc",
  "muc": "th",
  "de": "Cho phương trình: NH₃ + H₂O ⇌ NH₄⁺ + OH⁻. Trong phản ứng nghịch, theo thuyết Brønsted – Lowry, chất nào là base?",
  "phuong_an": [
   "0. NH₃.",
   "1. H₂O.",
   "2. NH₄⁺.",
   "3. OH⁻."
  ],
  "dap_an_dung": 3,
  "giai_thich": "Chiều nghịch: NH₄⁺ + OH⁻ → NH₃ + H₂O; NH₄⁺ cho H⁺ nên là acid, OH⁻ nhận H⁺ nên là base."
 },
 {
  "id": "bq_1789371866324_kf8xd",
  "loai": "mc",
  "muc": "nb",
  "de": "“Một phản ứng thuận nghịch đang ở trạng thái cân bằng khi chịu một tác động từ bên ngoài như biến đổi nồng độ, áp suất, nhiệt độ thì cân bằng sẽ chuyển dịch theo chiều làm giảm tác động đó.” Đây là phát biểu của",
  "phuong_an": [
   "0. nguyên lí Le Chatelier.",
   "1. quy tắc Markovnikov.",
   "2. thuyết Brønsted – Lowry.",
   "3. quy tắc Zaitsev."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Nguyên lí chuyển dịch cân bằng Le Chatelier cho biết cân bằng luôn chuyển dịch theo chiều chống lại tác động bên ngoài."
 },
 {
  "id": "bq_1789371866324_o0ee3",
  "loai": "mc",
  "muc": "th",
  "de": "Phương trình điện li nào dưới đây viết không đúng?",
  "phuong_an": [
   "0. HBr → H⁺ + Br⁻.",
   "1. HCOOH ⇌ HCOO⁻ + H⁺.",
   "2. Na₂SO₄ → Na⁺ + SO₄²⁻.",
   "3. Na₃PO₄ → 3Na⁺ + PO₄³⁻."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Na₂SO₄ phân li ra 2 ion Na⁺: Na₂SO₄ → 2Na⁺ + SO₄²⁻; phương án C không bảo toàn nguyên tố và điện tích."
 },
 {
  "id": "bq_1789371866324_o64q6",
  "loai": "mc",
  "muc": "nb",
  "de": "Chất nào sau đây không phải là chất điện li?",
  "phuong_an": [
   "0. CuO.",
   "1. NaCl.",
   "2. CuCl₂.",
   "3. NaOH."
  ],
  "dap_an_dung": 0,
  "giai_thich": "CuO là oxide không tan trong nước nên không phân li ra ion; NaCl, CuCl₂ là muối tan, NaOH là base tan nên đều điện li."
 },
 {
  "id": "bq_1789371866324_o9clm",
  "loai": "mc",
  "muc": "th",
  "de": "Cho dung dịch X có [H⁺] = 10⁻³ M. Phát biểu nào sau đây đúng?",
  "phuong_an": [
   "0. Dung dịch X có pH = 11.",
   "1. Dung dịch X có môi trường acid.",
   "2. Dung dịch X có thể là dung dịch KCl 10⁻³ M.",
   "3. Dung dịch X làm phenolphthalein hóa hồng."
  ],
  "dap_an_dung": 1,
  "giai_thich": "[H⁺] = 10⁻³ M > 10⁻⁷ M nên pH = 3, môi trường acid; KCl là muối trung tính có pH = 7."
 },
 {
  "id": "bq_1789371866324_r935z",
  "loai": "mc",
  "muc": "nb",
  "de": "Theo thuyết acid – base của Brønsted – Lowry, base là",
  "phuong_an": [
   "0. chất nhận electron.",
   "1. chất cho electron.",
   "2. chất nhận proton.",
   "3. chất cho proton."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Thuyết Brønsted – Lowry định nghĩa acid là chất cho proton (H⁺), base là chất nhận proton."
 },
 {
  "id": "bq_1789371866324_ts7so",
  "loai": "mc",
  "muc": "nb",
  "de": "Sự điện li là",
  "phuong_an": [
   "0. quá trình phân hủy các chất thành chất mới khi hòa tan vào nước.",
   "1. quá trình kết hợp giữa các ion thành phân tử trong dung dịch.",
   "2. quá trình phản ứng giữa các ion tạo ra chất kết tủa.",
   "3. quá trình phân li thành ion của các chất tan khi tan vào nước."
  ],
  "dap_an_dung": 3,
  "giai_thich": "Sự điện li là quá trình chất tan phân li thành các ion khi hòa tan trong nước, không tạo chất mới."
 },
 {
  "id": "bq_1789371866324_v5n3a",
  "loai": "mc",
  "muc": "th",
  "de": "Chất thủy phân trong nước làm đổi màu giấy chỉ thị pH là",
  "phuong_an": [
   "0. Na₂SO₄.",
   "1. NaCl.",
   "2. Fe₂(SO₄)₃.",
   "3. C₁₂H₂₂O₁₁ (saccharose)."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Ion Fe³⁺ bị thủy phân trong nước giải phóng H⁺ (H₃O⁺) nên dung dịch có môi trường acid; Na₂SO₄, NaCl trung tính, còn saccharose không điện li."
 },
 {
  "id": "bq_1789371866324_w4zs4",
  "loai": "mc",
  "muc": "nb",
  "de": "Cho các chất dưới đây: HCl, HNO₃, NaOH, NaCl, CuO, O₂, CH₃COOH. Số chất thuộc loại chất không điện li là",
  "phuong_an": [
   "0. 1",
   "1. 2",
   "2. 3",
   "3. 4"
  ],
  "dap_an_dung": 1,
  "giai_thich": "CuO không tan trong nước và O₂ là đơn chất phân tử nên đều không phân li ra ion; các acid, base, muối còn lại là chất điện li."
 },
 {
  "id": "bq_1789371866325_02pmd",
  "loai": "mc",
  "muc": "nb",
  "de": "Trong dung dịch, chất điện li",
  "phuong_an": [
   "0. gộp lại thành các ion.",
   "1. phân li thành các ion.",
   "2. phân li thành các nguyên tử.",
   "3. cả A, B, C."
  ],
  "dap_an_dung": 1,
  "giai_thich": "Chất điện li tan trong nước bị các phân tử nước tách thành các ion mang điện (cation và anion)."
 },
 {
  "id": "bq_1789371866325_1xtfx",
  "loai": "mc",
  "muc": "th",
  "de": "Chỉ dùng quỳ tím, có thể nhận biết ba dung dịch riêng biệt nào sau đây?",
  "phuong_an": [
   "0. HCl, NaNO₃, Ba(OH)₂.",
   "1. H₂SO₄, HCl, KOH.",
   "2. H₂SO₄, NaOH, KOH.",
   "3. Ba(OH)₂, NaOH, H₂SO₄."
  ],
  "dap_an_dung": 0,
  "giai_thich": "HCl làm quỳ hóa đỏ, NaNO₃ không đổi màu, Ba(OH)₂ làm quỳ hóa xanh nên phân biệt được; các dãy còn lại có hai chất làm quỳ đổi cùng một màu."
 },
 {
  "id": "bq_1789371866325_2r92h",
  "loai": "mc",
  "muc": "nb",
  "de": "pH là",
  "phuong_an": [
   "0. chỉ số đánh giá độ acid của một dung dịch.",
   "1. chỉ số đánh giá độ base của một dung dịch.",
   "2. chỉ số đánh giá độ acid hay độ base của một dung dịch.",
   "3. chỉ số đánh giá các chất điện li mạnh."
  ],
  "dap_an_dung": 2,
  "giai_thich": "pH < 7 là môi trường acid, pH = 7 trung tính, pH > 7 là môi trường base nên pH đánh giá cả độ acid lẫn độ base."
 },
 {
  "id": "bq_1789371866325_3rf79",
  "loai": "mc",
  "muc": "vd",
  "de": "pH của dung dịch Ba(OH)₂ 0,05 M là",
  "phuong_an": [
   "0. 13",
   "1. 12",
   "2. 1",
   "3. 11"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Ba(OH)₂ → Ba²⁺ + 2OH⁻ nên [OH⁻] = 0,1 M, pOH = 1, pH = 13."
 },
 {
  "id": "bq_1789371866325_49i0q",
  "loai": "mc",
  "muc": "vd",
  "de": "Cần bao nhiêu gam NaOH để pha chế 250 mL dung dịch có pH = 10?",
  "phuong_an": [
   "0. 0,1 gam",
   "1. 0,01 gam",
   "2. 0,001 gam",
   "3. 0,0001 gam"
  ],
  "dap_an_dung": 2,
  "giai_thich": "pH = 10 nên [OH⁻] = 10⁻⁴ M; n(NaOH) = 10⁻⁴·0,25 = 2,5·10⁻⁵ mol, m = 2,5·10⁻⁵·40 = 0,001 g."
 },
 {
  "id": "bq_1789371866325_6x824",
  "loai": "mc",
  "muc": "nb",
  "de": "Chọn câu trả lời đúng khi nói về muối acid.",
  "phuong_an": [
   "0. Dung dịch muối có pH < 7.",
   "1. Muối có khả năng phản ứng với base.",
   "2. Muối vẫn còn hydrogen trong phân tử.",
   "3. Muối mà gốc acid vẫn còn hydrogen có khả năng phân li tạo proton trong nước."
  ],
  "dap_an_dung": 3,
  "giai_thich": "Muối acid là muối mà anion gốc acid còn H có thể phân li ra H⁺ (như HSO₄⁻, HCO₃⁻); không phải muối acid nào cũng có pH < 7 (NaHCO₃ có môi trường base)."
 },
 {
  "id": "bq_1789371866325_a06k1",
  "loai": "mc",
  "muc": "th",
  "de": "Các dung dịch có khả năng đổi màu quỳ tím sang đỏ (hồng) là",
  "phuong_an": [
   "0. CH₃COOH, HCl và BaCl₂.",
   "1. NaOH, Na₂CO₃ và Na₂SO₃.",
   "2. H₂SO₄, NaHCO₃ và AlCl₃.",
   "3. NaHSO₄, HCl và AlCl₃."
  ],
  "dap_an_dung": 3,
  "giai_thich": "NaHSO₄ phân li cho H⁺, HCl là acid mạnh, Al³⁺ thủy phân tạo H⁺; BaCl₂ trung tính còn NaHCO₃ có tính base."
 },
 {
  "id": "bq_1789371866325_ajgyf",
  "loai": "mc",
  "muc": "vd",
  "de": "Cho 10 mL dung dịch X chứa HCl 1M và H₂SO₄ 0,5M. Thể tích dung dịch NaOH 1M cần để trung hòa dung dịch X là",
  "phuong_an": [
   "0. 10 mL",
   "1. 15 mL",
   "2. 20 mL",
   "3. 25 mL"
  ],
  "dap_an_dung": 2,
  "giai_thich": "n(H⁺) = 0,01·1 + 0,01·0,5·2 = 0,02 mol = n(OH⁻), V(NaOH) = 0,02 L = 20 mL."
 },
 {
  "id": "bq_1789371866325_artin",
  "loai": "mc",
  "muc": "vdc",
  "de": "Trộn V₁ lít dung dịch H₂SO₄ có pH = 3 với V₂ lít dung dịch NaOH có pH = 12, thu được dung dịch mới có pH = 4. Tỉ số V₁ : V₂ có giá trị là",
  "phuong_an": [
   "0. 8/1",
   "1. 101/9",
   "2. 10/1",
   "3. 4/1"
  ],
  "dap_an_dung": 1,
  "giai_thich": "pH = 4 nên acid dư: 10⁻³V₁ − 10⁻²V₂ = 10⁻⁴(V₁ + V₂), suy ra 9·10⁻⁴V₁ = 1,01·10⁻²V₂, V₁ : V₂ = 101 : 9."
 },
 {
  "id": "bq_1789371866325_djatk",
  "loai": "mc",
  "muc": "nb",
  "de": "Câu nào không đúng khi nói về pH và pOH của dung dịch (ở 25 °C)?",
  "phuong_an": [
   "0. pH = lg[H⁺]",
   "1. pH + pOH = 14",
   "2. [H⁺]·[OH⁻] = 10⁻¹⁴",
   "3. [H⁺] = 10⁻ᵃ thì pH = a"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Định nghĩa đúng là pH = −lg[H⁺]; ở 25 °C tích ion của nước [H⁺][OH⁻] = 10⁻¹⁴ nên pH + pOH = 14."
 },
 {
  "id": "bq_1789371866325_ef2f6",
  "loai": "mc",
  "muc": "nb",
  "de": "Chất chỉ thị acid – base là chất",
  "phuong_an": [
   "0. không thay đổi màu sắc khi pH thay đổi.",
   "1. có màu sắc biến đổi theo giá trị pH của dung dịch.",
   "2. giúp biến đổi từ môi trường acid thành môi trường base.",
   "3. giúp biến đổi từ môi trường base thành môi trường acid."
  ],
  "dap_an_dung": 1,
  "giai_thich": "Chất chỉ thị (quỳ tím, phenolphthalein…) đổi màu theo pH nên dùng để nhận biết môi trường, không làm thay đổi môi trường."
 },
 {
  "id": "bq_1789371866325_fig81",
  "loai": "mc",
  "muc": "nb",
  "de": "Chất điện li mạnh bao gồm",
  "phuong_an": [
   "0. acid mạnh.",
   "1. base mạnh.",
   "2. hầu hết các muối tan.",
   "3. cả A, B, C đều đúng."
  ],
  "dap_an_dung": 3,
  "giai_thich": "Acid mạnh (HCl, HNO₃…), base mạnh (NaOH, KOH…) và hầu hết muối tan đều phân li hoàn toàn trong nước."
 },
 {
  "id": "bq_1789371866325_g9ave",
  "loai": "mc",
  "muc": "nb",
  "de": "Chất điện li yếu bao gồm",
  "phuong_an": [
   "0. acid yếu.",
   "1. base yếu.",
   "2. muối không tan.",
   "3. cả A và B đều đúng."
  ],
  "dap_an_dung": 3,
  "giai_thich": "Chất điện li yếu là acid yếu (CH₃COOH, HF, H₂S…) và base yếu (NH₃…), chỉ phân li một phần trong nước."
 },
 {
  "id": "bq_1789371866325_iqvdi",
  "loai": "mc",
  "muc": "nb",
  "de": "Phương trình ion cho biết",
  "phuong_an": [
   "0. số mol mỗi chất điện li.",
   "1. bản chất của các nguyên tử.",
   "2. bản chất của phản ứng xảy ra trong dung dịch chất điện li.",
   "3. khối lượng của chất điện li."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Phương trình ion rút gọn chỉ giữ các ion thực sự phản ứng, ví dụ H⁺ + OH⁻ → H₂O, cho thấy bản chất của phản ứng trong dung dịch."
 },
 {
  "id": "bq_1789371866325_jhmar",
  "loai": "mc",
  "muc": "vd",
  "de": "Hòa tan 4,9 mg H₂SO₄ vào nước thu được 1 lít dung dịch. pH của dung dịch thu được là",
  "phuong_an": [
   "0. 1",
   "1. 2",
   "2. 3",
   "3. 4"
  ],
  "dap_an_dung": 3,
  "giai_thich": "n(H₂SO₄) = 4,9·10⁻³/98 = 5·10⁻⁵ mol, [H⁺] = 2·5·10⁻⁵ = 10⁻⁴ M nên pH = 4."
 },
 {
  "id": "bq_1789371866325_n39az",
  "loai": "mc",
  "muc": "vdc",
  "de": "Trộn 200 mL dung dịch gồm HCl 0,1 M và H₂SO₄ 0,15 M với 300 mL dung dịch Ba(OH)₂ nồng độ a M, thu được m gam kết tủa và 500 mL dung dịch có pH = 1. Giá trị của a và m lần lượt là",
  "phuong_an": [
   "0. 0,15 và 2,330",
   "1. 0,10 và 6,990",
   "2. 0,10 và 4,660",
   "3. 0,05 và 3,495"
  ],
  "dap_an_dung": 3,
  "giai_thich": "n(H⁺) = 0,2·(0,1 + 0,3) = 0,08 mol; pH = 1 nên H⁺ dư 0,05 mol, n(OH⁻) = 0,03 mol, a = 0,015/0,3 = 0,05 M; Ba²⁺ (0,015 mol) thiếu so với SO₄²⁻ (0,03 mol) nên m = 0,015·233 = 3,495 g."
 },
 {
  "id": "bq_1789371866325_naxii",
  "loai": "mc",
  "muc": "nb",
  "de": "Chất điện li yếu là chất",
  "phuong_an": [
   "0. khi tan trong nước, các phân tử hòa tan đều phân li thành ion.",
   "1. khi tan trong dung môi hữu cơ, các phân tử hòa tan đều phân li thành ion.",
   "2. khi tan trong nước chỉ có một số phân tử hòa tan phân li thành ion, phần còn lại vẫn tồn tại dưới dạng phân tử trong dung dịch.",
   "3. khi tan trong dung môi hữu cơ chỉ có một số phân tử hòa tan phân li thành ion, phần còn lại vẫn tồn tại dưới dạng phân tử trong dung dịch."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Chất điện li yếu chỉ phân li một phần trong nước, dung dịch chứa cả ion và phân tử chưa phân li."
 },
 {
  "id": "bq_1789371866325_o3coq",
  "loai": "mc",
  "muc": "nb",
  "de": "Chất điện li mạnh là chất",
  "phuong_an": [
   "0. khi tan trong nước, các phân tử hòa tan đều phân li thành ion.",
   "1. khi tan trong dung môi hữu cơ, các phân tử hòa tan đều phân li thành ion.",
   "2. khi tan trong nước chỉ có một số phân tử hòa tan phân li thành ion, phần còn lại vẫn tồn tại dưới dạng phân tử trong dung dịch.",
   "3. khi tan trong dung môi hữu cơ chỉ có một số phân tử hòa tan phân li thành ion, phần còn lại vẫn tồn tại dưới dạng phân tử trong dung dịch."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Chất điện li mạnh phân li hoàn toàn trong nước, dung dịch hầu như chỉ chứa ion."
 },
 {
  "id": "bq_1789371866325_oqwtj",
  "loai": "mc",
  "muc": "nb",
  "de": "Đâu là nội dung của thuyết Brønsted – Lowry?",
  "phuong_an": [
   "0. Acid là chất nhận proton, base là chất cho proton.",
   "1. Cả acid và base đều là chất cho proton.",
   "2. Cả acid và base đều là chất nhận proton.",
   "3. Acid là chất cho proton, base là chất nhận proton."
  ],
  "dap_an_dung": 3,
  "giai_thich": "Theo Brønsted – Lowry, phản ứng acid – base là sự trao đổi proton: acid cho H⁺, base nhận H⁺."
 },
 {
  "id": "bq_1789371866325_oyo03",
  "loai": "mc",
  "muc": "nb",
  "de": "Trong phương trình điện li của chất điện li yếu",
  "phuong_an": [
   "0. dùng một mũi tên chỉ chiều của quá trình điện li.",
   "1. dùng hai nửa mũi tên ngược chiều nhau.",
   "2. dùng hai mũi tên chỉ chiều của quá trình điện li.",
   "3. dùng hai nửa mũi tên cùng chiều nhau."
  ],
  "dap_an_dung": 1,
  "giai_thich": "Sự điện li của chất điện li yếu là quá trình thuận nghịch nên dùng kí hiệu hai nửa mũi tên ngược chiều (⇌)."
 },
 {
  "id": "bq_1789371866325_p378f",
  "loai": "mc",
  "muc": "th",
  "de": "Dung dịch có pH = 7 là",
  "phuong_an": [
   "0. NH₄Cl.",
   "1. CH₃COONa.",
   "2. C₆H₅ONa.",
   "3. KClO₃."
  ],
  "dap_an_dung": 3,
  "giai_thich": "KClO₃ là muối của base mạnh KOH và acid mạnh HClO₃ nên không thủy phân, pH = 7; NH₄Cl có tính acid, CH₃COONa và C₆H₅ONa có tính base."
 },
 {
  "id": "bq_1789371866325_rt6jz",
  "loai": "mc",
  "muc": "vd",
  "de": "pH của hỗn hợp dung dịch HCl 0,005 M và H₂SO₄ 0,0025 M là",
  "phuong_an": [
   "0. 2",
   "1. 3",
   "2. 4",
   "3. 12"
  ],
  "dap_an_dung": 0,
  "giai_thich": "[H⁺] = 0,005 + 2·0,0025 = 0,01 M nên pH = 2."
 },
 {
  "id": "bq_1789371866325_t29a6",
  "loai": "mc",
  "muc": "th",
  "de": "Cho các muối: NaNO₃; K₂CO₃; CuSO₄; FeCl₃; AlCl₃; KCl. Các dung dịch có pH = 7 là",
  "phuong_an": [
   "0. NaNO₃; KCl.",
   "1. K₂CO₃; CuSO₄; KCl.",
   "2. CuSO₄; FeCl₃; AlCl₃.",
   "3. NaNO₃; K₂CO₃; CuSO₄."
  ],
  "dap_an_dung": 0,
  "giai_thich": "NaNO₃, KCl là muối của acid mạnh và base mạnh nên trung tính; K₂CO₃ có tính base, CuSO₄, FeCl₃, AlCl₃ có tính acid."
 },
 {
  "id": "bq_1789371866325_tp38t",
  "loai": "mc",
  "muc": "vdc",
  "de": "Trộn 100 mL dung dịch HCl có pH = 1 với 100 mL dung dịch gồm KOH 0,1 M và NaOH a M, thu được 200 mL dung dịch có pH = 12. Giá trị của a là",
  "phuong_an": [
   "0. 0,12",
   "1. 0,08",
   "2. 0,02",
   "3. 0,10"
  ],
  "dap_an_dung": 2,
  "giai_thich": "n(H⁺) = 0,1·0,1 = 0,01 mol; pH = 12 nên OH⁻ dư 0,01·0,2 = 0,002 mol; n(OH⁻) ban đầu = 0,012 mol = 0,01 (KOH) + 0,1a nên a = 0,02."
 },
 {
  "id": "bq_1789371866325_vbjts",
  "loai": "mc",
  "muc": "th",
  "de": "Dãy các chất vừa tác dụng được với dung dịch acid, vừa tác dụng được với dung dịch base là",
  "phuong_an": [
   "0. Al(OH)₃, (NH₄)₂CO₃, NH₄Cl.",
   "1. NaOH, ZnCl₂, Al₂O₃.",
   "2. KHCO₃, Zn(OH)₂, CH₃COONH₄.",
   "3. Ba(HCO₃)₂, FeO, NaHCO₃."
  ],
  "dap_an_dung": 2,
  "giai_thich": "KHCO₃ (lưỡng tính), Zn(OH)₂ (hydroxide lưỡng tính), CH₃COONH₄ (NH₄⁺ phản ứng với base, CH₃COO⁻ phản ứng với acid) đều phản ứng với cả hai; NH₄Cl, NaOH, ZnCl₂, FeO chỉ phản ứng với một loại."
 },
 {
  "id": "bq_1789371866325_wgy99",
  "loai": "mc",
  "muc": "nb",
  "de": "Chất không điện li là chất",
  "phuong_an": [
   "0. khi hòa tan trong nước, các phân tử không phân li thành ion.",
   "1. khi tan trong dung môi hữu cơ, các phân tử hòa tan đều phân li thành ion.",
   "2. khi tan trong nước chỉ có một số phân tử hòa tan phân li thành ion, phần còn lại vẫn tồn tại dưới dạng phân tử trong dung dịch.",
   "3. khi tan trong dung môi hữu cơ chỉ có một số phân tử hòa tan phân li thành ion, phần còn lại vẫn tồn tại dưới dạng phân tử trong dung dịch."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Chất không điện li (saccharose, ethanol…) tan trong nước ở dạng phân tử, không tạo ion nên dung dịch không dẫn điện."
 },
 {
  "id": "bq_1789371866325_ygtd3",
  "loai": "mc",
  "muc": "nb",
  "de": "Trong phương trình điện li của chất điện li mạnh",
  "phuong_an": [
   "0. dùng một mũi tên chỉ chiều của quá trình điện li.",
   "1. dùng một mũi tên chỉ chiều của quá trình hòa tan.",
   "2. dùng hai mũi tên chỉ chiều của quá trình điện li.",
   "3. dùng hai mũi tên chỉ chiều của quá trình hòa tan."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Chất điện li mạnh phân li hoàn toàn nên quá trình điện li được biểu diễn bằng một mũi tên (→)."
 },
 {
  "id": "bq_1789371866325_zkavf",
  "loai": "mc",
  "muc": "th",
  "de": "Khi hòa tan trong nước, chất làm cho quỳ tím chuyển màu xanh là",
  "phuong_an": [
   "0. NaCl.",
   "1. NH₄Cl.",
   "2. Na₂CO₃.",
   "3. FeCl₃."
  ],
  "dap_an_dung": 2,
  "giai_thich": "CO₃²⁻ thủy phân tạo OH⁻ nên dung dịch Na₂CO₃ có tính base; NH₄Cl, FeCl₃ có tính acid, NaCl trung tính."
 },
 {
  "id": "bq_1789371866328_43tgd",
  "loai": "mc",
  "muc": "nb",
  "de": "Dung dịch có môi trường base khi giá trị pH",
  "phuong_an": [
   "0. bằng 7.",
   "1. lớn hơn 7.",
   "2. nhỏ hơn 7.",
   "3. bằng 0."
  ],
  "dap_an_dung": 1,
  "giai_thich": "pH = −log[H⁺]; khi [H⁺] < 10⁻⁷ M thì pH > 7 và dung dịch có môi trường base."
 },
 {
  "id": "bq_1789371866328_8r8vz",
  "loai": "mc",
  "muc": "th",
  "de": "Dung dịch của muối nào sau đây có môi trường base?",
  "phuong_an": [
   "0. Na₂CO₃",
   "1. Al₂(SO₄)₃",
   "2. NH₄Cl",
   "3. NaCl"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Ion CO₃²⁻ là base yếu, thủy phân trong nước sinh ra OH⁻ nên dung dịch Na₂CO₃ có môi trường base."
 },
 {
  "id": "bq_1789371866328_hme2w",
  "loai": "mc",
  "muc": "th",
  "de": "Cho các ion: CO₃²⁻, Al³⁺, NH₄⁺, NH₃, HCO₃⁻, HPO₄²⁻. Theo thuyết Brønsted – Lowry, số chất (ion) lưỡng tính là",
  "phuong_an": [
   "0. 1",
   "1. 2",
   "2. 3",
   "3. 4"
  ],
  "dap_an_dung": 1,
  "giai_thich": "HCO₃⁻ và HPO₄²⁻ vừa cho được H⁺ vừa nhận được H⁺ nên là chất lưỡng tính; CO₃²⁻, NH₃ là base còn Al³⁺, NH₄⁺ là acid."
 },
 {
  "id": "bq_1789371866328_j8hzn",
  "loai": "mc",
  "muc": "th",
  "de": "Cho các chất: NaCl, BaSO₄, CH₃COOH, CO₂, N₂, KOH, H₂SO₄, (NH₄)₂CO₃. Chất nào sau đây không phải là chất điện li?",
  "phuong_an": [
   "0. CH₃COOH",
   "1. KOH",
   "2. CO₂",
   "3. NaCl"
  ],
  "dap_an_dung": 2,
  "giai_thich": "Chất điện li là chất khi tan trong nước phân li thành ion; CO₂ và N₂ tan vào nước vẫn tồn tại ở dạng phân tử nên không phải chất điện li."
 },
 {
  "id": "bq_1789372198145_23n91",
  "loai": "mc",
  "muc": "vdc",
  "de": "Trộn 200 mL dung dịch chứa hỗn hợp HCl 0,1 M và H₂SO₄ 0,05 M với 300 mL dung dịch Ba(OH)₂ có nồng độ a mol/L, thu được m gam kết tủa và 500 mL dung dịch có pH = 13. Giá trị của a và m lần lượt là",
  "phuong_an": [
   "0. 0,2 M và 2,33 gam.",
   "1. 0,15 M và 4,46 gam.",
   "2. 0,15 M và 2,33 gam.",
   "3. 0,2 M và 3,495 gam."
  ],
  "dap_an_dung": 2,
  "giai_thich": "n(H⁺) = 0,2·(0,1 + 0,1) = 0,04 mol; pH = 13 nên OH⁻ dư 0,1·0,5 = 0,05 mol, vậy n(OH⁻) = 0,09 mol và a = 0,045/0,3 = 0,15 M; Ba²⁺ (0,045 mol) dư so với SO₄²⁻ (0,01 mol) nên m = 0,01·233 = 2,33 g."
 },
 {
  "id": "bq_1789372198145_3oz4k",
  "loai": "mc",
  "muc": "nb",
  "de": "Chất nào sau đây là acid?",
  "phuong_an": [
   "0. KOH",
   "1. LiOH",
   "2. NaCl",
   "3. HCl"
  ],
  "dap_an_dung": 3,
  "giai_thich": "HCl phân li ra H⁺ (cho proton) nên là acid; KOH, LiOH phân li ra OH⁻ là base, NaCl là muối."
 },
 {
  "id": "bq_1789372198145_4wx91",
  "loai": "mc",
  "muc": "nb",
  "de": "Phản ứng hóa học nào dưới đây là phản ứng trao đổi ion?",
  "phuong_an": [
   "0. NaOH + HCl → NaCl + H₂O.",
   "1. Zn + CuSO₄ → Cu + ZnSO₄.",
   "2. H₂ + Cl₂ → 2HCl.",
   "3. Fe + 2HCl → FeCl₂ + H₂."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Phản ứng trung hòa là trao đổi ion (H⁺ + OH⁻ → H₂O), số oxi hóa các nguyên tố không đổi; ba phản ứng còn lại đều là phản ứng oxi hóa – khử."
 },
 {
  "id": "bq_1789372198145_8mqr4",
  "loai": "mc",
  "muc": "th",
  "de": "[Hình: bộ dụng cụ chuẩn độ gồm giá sắt có kẹp (1); buret có vạch chia (2) kẹp thẳng đứng; khóa buret (3) ở đầu dưới buret; bình tam giác (4) đặt ngay dưới đầu buret] Chất lỏng cho vào dụng cụ ở vị trí (2) là NaOH, chất lỏng cho vào dụng cụ ở vị trí (4) là HCl và phenolphthalein. Tại thời điểm kết thúc chuẩn độ, hiện tượng quan sát được là",
  "phuong_an": [
   "0. Dung dịch trong bình số (4) chuyển từ không màu sang màu hồng rồi lập tức mất màu.",
   "1. Dung dịch trong bình số (4) chuyển từ màu đỏ sang màu vàng.",
   "2. Dung dịch trong bình số (4) chuyển từ không màu sang màu hồng nhạt bền.",
   "3. Chất lỏng trong dụng cụ ở vị trí (2) đã hết."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Phenolphthalein không màu trong môi trường acid; khi NaOH vừa dư một giọt, dung dịch chuyển sang hồng nhạt bền (khoảng 30 giây) báo hiệu điểm tương đương."
 },
 {
  "id": "bq_1789372198145_fw3p9",
  "loai": "mc",
  "muc": "nb",
  "de": "Sự thủy phân Na₂CO₃ trong nước tạo ra",
  "phuong_an": [
   "0. môi trường base.",
   "1. môi trường acid.",
   "2. môi trường trung tính.",
   "3. không xác định được."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Ion CO₃²⁻ nhận proton của nước: CO₃²⁻ + H₂O ⇌ HCO₃⁻ + OH⁻, sinh ra OH⁻ nên dung dịch có môi trường base."
 },
 {
  "id": "bq_1789372198145_i59ym",
  "loai": "mc",
  "muc": "th",
  "de": "Dãy chất nào dưới đây chỉ gồm những chất tan nhiều trong nước và điện li mạnh?",
  "phuong_an": [
   "0. KCl, H₂SO₄, H₂O, CaCl₂.",
   "1. CaCl₂, CuSO₄, CaSO₄, HNO₃.",
   "2. H₂SO₄, NaCl, KNO₃, Ba(NO₃)₂.",
   "3. HNO₃, Cu(NO₃)₂, Ca₃(PO₄)₂, H₃PO₄."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Acid mạnh và muối tan là chất điện li mạnh; H₂O điện li rất yếu, CaSO₄ ít tan, Ca₃(PO₄)₂ không tan và H₃PO₄ điện li không hoàn toàn."
 },
 {
  "id": "bq_1789372198145_n4x0s",
  "loai": "mc",
  "muc": "nb",
  "de": "Dung dịch chất điện li dẫn điện được là do sự chuyển động của",
  "phuong_an": [
   "0. các ion H⁺ và OH⁻.",
   "1. các cation và anion và các phân tử hòa tan.",
   "2. các cation và anion.",
   "3. các ion nóng chảy phân li."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Dòng điện trong dung dịch là dòng chuyển dời có hướng của các ion mang điện (cation về cực âm, anion về cực dương); phân tử trung hòa không mang điện nên không dẫn điện."
 },
 {
  "id": "bq_1789372198145_xfsiq",
  "loai": "mc",
  "muc": "nb",
  "de": "Phương trình mô tả sự điện li của NaCl trong nước là",
  "phuong_an": [
   "0. NaCl(s) —H₂O→ Na⁺(g) + Cl⁻(g)",
   "1. NaCl(s) —H₂O→ Na⁺(aq) + Cl⁻(aq)",
   "2. NaCl(s) —H₂O→ Na(aq) + Cl(aq)",
   "3. NaCl(s) —H₂O→ Na(s) + Cl(s)"
  ],
  "dap_an_dung": 1,
  "giai_thich": "NaCl là chất điện li mạnh, khi tan trong nước phân li hoàn toàn thành các ion Na⁺ và Cl⁻ được các phân tử nước bao quanh (trạng thái aq)."
 },
 {
  "id": "bq_1789372198145_xx0tj",
  "loai": "mc",
  "muc": "vd",
  "de": "pH của 1 lít dung dịch H₂SO₄ 0,01 M là (coi H₂SO₄ phân li hoàn toàn theo 2 nấc)",
  "phuong_an": [
   "0. 13,6",
   "1. 1,7",
   "2. 1,4",
   "3. 12,6"
  ],
  "dap_an_dung": 1,
  "giai_thich": "H₂SO₄ → 2H⁺ + SO₄²⁻ nên [H⁺] = 0,02 M và pH = −lg 0,02 ≈ 1,7."
 },
 {
  "id": "bq_1789372198146_9d4zf",
  "loai": "mc",
  "muc": "nb",
  "de": "Trong phương pháp chuẩn độ acid – base, người ta dùng một dung dịch acid hoặc dung dịch base (kiềm) đã biết chính xác ...(1)... làm dung dịch chuẩn để xác định ...(2)... của một dung dịch base hoặc dung dịch acid. Từ/cụm từ ở vị trí (1), (2) lần lượt là",
  "phuong_an": [
   "0. thể tích; thể tích.",
   "1. thể tích; nồng độ.",
   "2. nồng độ; nồng độ.",
   "3. nồng độ; thể tích."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Dung dịch chuẩn có nồng độ đã biết; từ thể tích dung dịch chuẩn dùng tới điểm tương đương, tính được nồng độ dung dịch cần xác định."
 },
 {
  "id": "bq_1789372198146_b4zva",
  "loai": "mc",
  "muc": "vd",
  "de": "Pha loãng 1 lít dung dịch NaOH có pH = 9 bằng nước để được dung dịch mới có pH = 8. Thể tích nước cần dùng là",
  "phuong_an": [
   "0. 4 lít.",
   "1. 9 lít.",
   "2. 10 lít.",
   "3. 5 lít."
  ],
  "dap_an_dung": 1,
  "giai_thich": "pH giảm 1 đơn vị nên [OH⁻] giảm 10 lần (từ 10⁻⁵ xuống 10⁻⁶ M), thể tích dung dịch phải tăng 10 lần thành 10 lít, tức cần thêm 9 lít nước."
 },
 {
  "id": "bq_1789372198146_ii8a5",
  "loai": "mc",
  "muc": "nb",
  "de": "Cho các chất sau: NaCl; C₂H₅OH; C₁₂H₂₂O₁₁; HF; Ba(OH)₂; CH₃COOH. Số chất điện li trong dãy trên là",
  "phuong_an": [
   "0. 3",
   "1. 4",
   "2. 5",
   "3. 6"
  ],
  "dap_an_dung": 1,
  "giai_thich": "NaCl, Ba(OH)₂ điện li mạnh; HF, CH₃COOH điện li yếu; ethanol và saccharose tan nhưng không phân li ra ion nên là chất không điện li."
 },
 {
  "id": "bq_1789372198146_inv2u",
  "loai": "mc",
  "muc": "nb",
  "de": "Nhỏ dung dịch phenolphthalein vào dung dịch X có pH = 10, dung dịch X chuyển thành màu",
  "phuong_an": [
   "0. không đổi màu.",
   "1. vàng.",
   "2. xanh.",
   "3. hồng."
  ],
  "dap_an_dung": 3,
  "giai_thich": "pH = 10 là môi trường base; phenolphthalein không màu ở pH < 8,3 và chuyển hồng trong môi trường base."
 },
 {
  "id": "bq_1789372198146_ku662",
  "loai": "mc",
  "muc": "nb",
  "de": "Phát biểu nào sau đây về sự điện li và chất điện li là đúng?",
  "phuong_an": [
   "0. Chất điện li là những chất khi tan trong nước phân li ra ion.",
   "1. Dung dịch các chất điện li không dẫn được điện.",
   "2. Chất điện li bao gồm oxide, acid, base, muối.",
   "3. Sự điện li là quá trình kết hợp các ion thành phân tử."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Chất điện li tan trong nước phân li thành ion nên dung dịch dẫn điện; chất điện li gồm acid, base, muối, không gồm oxide."
 },
 {
  "id": "bq_1789372198146_sg578",
  "loai": "mc",
  "muc": "th",
  "de": "Cho các dung dịch muối: Na₂CO₃, NaNO₃, NaNO₂, NaCl, Na₂SO₄, CH₃COONa, NH₄HSO₄, Na₂S. Có bao nhiêu dung dịch muối làm quỳ tím hóa xanh?",
  "phuong_an": [
   "0. 3",
   "1. 4",
   "2. 5",
   "3. 2"
  ],
  "dap_an_dung": 1,
  "giai_thich": "Muối của cation base mạnh với anion gốc acid yếu thủy phân tạo OH⁻: Na₂CO₃, NaNO₂, CH₃COONa, Na₂S; NH₄HSO₄ có môi trường acid, các muối còn lại trung tính."
 },
 {
  "id": "bq_1789372198146_uid4b",
  "loai": "mc",
  "muc": "th",
  "de": "Dung dịch muối nào sau đây có môi trường base?",
  "phuong_an": [
   "0. CaCl₂",
   "1. NH₄NO₃",
   "2. K₂CO₃",
   "3. NaCl"
  ],
  "dap_an_dung": 2,
  "giai_thich": "CO₃²⁻ là gốc của acid yếu nên bị thủy phân tạo OH⁻; Ca²⁺, Na⁺, Cl⁻ không thủy phân (trung tính), còn NH₄⁺ thủy phân tạo H₃O⁺ (acid)."
 },
 {
  "id": "bq_1789372198147_1sn79",
  "loai": "mc",
  "muc": "nb",
  "de": "Đất nhiễm phèn có pH trong khoảng 4,5 – 5,0. Môi trường dung dịch đất nhiễm phèn là môi trường",
  "phuong_an": [
   "0. acid.",
   "1. base.",
   "2. trung tính.",
   "3. lưỡng tính."
  ],
  "dap_an_dung": 0,
  "giai_thich": "pH < 7 tương ứng [H⁺] > 10⁻⁷ M nên đất nhiễm phèn có môi trường acid."
 },
 {
  "id": "bq_1789372198147_36e1s",
  "loai": "mc",
  "muc": "nb",
  "de": "Dung dịch nào sau đây có khả năng dẫn điện?",
  "phuong_an": [
   "0. Dung dịch đường.",
   "1. Dung dịch rượu.",
   "2. Dung dịch muối ăn.",
   "3. Dung dịch benzene trong alcohol."
  ],
  "dap_an_dung": 2,
  "giai_thich": "NaCl là chất điện li mạnh, phân li thành Na⁺ và Cl⁻ nên dung dịch dẫn điện; đường, rượu, benzene tồn tại dạng phân tử."
 },
 {
  "id": "bq_1789372198147_3qf30",
  "loai": "mc",
  "muc": "vd",
  "de": "Để chuẩn độ 300 mL dung dịch HCl a M cần 200 mL dung dịch NaOH 0,015 M, thu được dung dịch X. Giá trị của a là",
  "phuong_an": [
   "0. 0,01 M.",
   "1. 0,1 M.",
   "2. 0,015 M.",
   "3. 0,03 M."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Tại điểm tương đương n(HCl) = n(NaOH) = 0,2·0,015 = 0,003 mol, nên a = 0,003/0,3 = 0,01 M."
 },
 {
  "id": "bq_1789372198147_572nl",
  "loai": "mc",
  "muc": "th",
  "de": "Trong dung dịch nước của acetic acid tồn tại cân bằng: CH₃COOH + H₂O ⇌ CH₃COO⁻ + H₃O⁺. Trong phản ứng thuận, theo thuyết Brønsted – Lowry, phần tử đóng vai trò base là",
  "phuong_an": [
   "0. CH₃COOH.",
   "1. H₂O.",
   "2. CH₃COO⁻.",
   "3. H₃O⁺."
  ],
  "dap_an_dung": 1,
  "giai_thich": "Chiều thuận CH₃COOH cho H⁺ (acid), còn H₂O nhận H⁺ tạo H₃O⁺ nên H₂O đóng vai trò base."
 },
 {
  "id": "bq_1789372198147_710qx",
  "loai": "mc",
  "muc": "th",
  "de": "[Hình: một nguồn điện nối với ba cốc dung dịch, mỗi cốc có hai điện cực và một bóng đèn; cốc thứ nhất đèn không sáng, cốc thứ hai đèn sáng yếu, cốc thứ ba đèn sáng tỏ] Cho dòng điện chạy qua dung dịch nước của một chất (X) như thí nghiệm, thấy đèn sáng tỏ. Cho các phát biểu sau: (a) Dung dịch chất (X) là chất điện li mạnh. (b) Trong dung dịch (X) có các ion dương và âm. (c) Chất (X) ở dạng rắn khan cũng dẫn điện. (d) Dung dịch (X) có thể là acid mạnh, base mạnh, muối tan. Phát biểu không đúng là",
  "phuong_an": [
   "0. (d).",
   "1. (a).",
   "2. (b).",
   "3. (c)."
  ],
  "dap_an_dung": 3,
  "giai_thich": "Đèn sáng tỏ chứng tỏ dung dịch chứa nhiều ion chuyển động tự do (chất điện li mạnh); ở dạng rắn khan các ion bị giữ cố định trong mạng tinh thể nên không dẫn điện."
 },
 {
  "id": "bq_1789372198147_8v3l9",
  "loai": "mc",
  "muc": "nb",
  "de": "Giá trị pH của dung dịch HCl 0,01 M là",
  "phuong_an": [
   "0. 2.",
   "1. 12.",
   "2. 10.",
   "3. 4."
  ],
  "dap_an_dung": 0,
  "giai_thich": "HCl là acid mạnh phân li hoàn toàn nên [H⁺] = 0,01 = 10⁻² M, pH = 2."
 },
 {
  "id": "bq_1789372198147_9m5xj",
  "loai": "mc",
  "muc": "th",
  "de": "Theo thuyết Brønsted – Lowry, trong phương trình nào sau đây chất tan (không kể nước) là chất nhận H⁺?",
  "phuong_an": [
   "0. HCl + H₂O → H₃O⁺ + Cl⁻.",
   "1. HCO₃⁻ + H₂O ⇌ CO₃²⁻ + H₃O⁺.",
   "2. NH₃ + H₂O ⇌ NH₄⁺ + OH⁻.",
   "3. CH₃COOH + H₂O ⇌ CH₃COO⁻ + H₃O⁺."
  ],
  "dap_an_dung": 2,
  "giai_thich": "NH₃ dùng cặp electron riêng nhận H⁺ của nước tạo NH₄⁺ nên là base; ở ba phương trình còn lại chất tan cho H⁺ cho nước (acid)."
 },
 {
  "id": "bq_1789372198147_kq7pd",
  "loai": "mc",
  "muc": "vd",
  "de": "Dịch vị dạ dày của con người có chứa HCl với pH dao động trong khoảng từ 1,5 đến 3,5. Kết quả phân tích 1 mL dịch vị dạ dày của một bệnh nhân cho thấy số mol H⁺ là 3,16·10⁻⁶ mol. Chỉ số pH của dịch vị dạ dày trên là",
  "phuong_an": [
   "0. 2,5.",
   "1. 1,2.",
   "2. 3,2.",
   "3. 3,8."
  ],
  "dap_an_dung": 0,
  "giai_thich": "[H⁺] = 3,16·10⁻⁶/10⁻³ = 3,16·10⁻³ M nên pH = −lg(3,16·10⁻³) ≈ 2,5."
 },
 {
  "id": "bq_1789372198147_l92cf",
  "loai": "mc",
  "muc": "th",
  "de": "Dung dịch NaOH có pH = 13, khi thêm vào dung dịch NaOH một lượng nước thì giá trị pH",
  "phuong_an": [
   "0. tăng.",
   "1. không đổi.",
   "2. giảm.",
   "3. có thể tăng hoặc giảm."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Pha loãng làm [OH⁻] giảm, pOH tăng nên pH = 14 − pOH giảm dần (tiến về 7)."
 },
 {
  "id": "bq_1789372198147_qiecw",
  "loai": "mc",
  "muc": "th",
  "de": "Lựa chọn sản phẩm thích hợp điền vào chỗ trống trong cân bằng sau: HCO₃⁻ + H₂O ⇌ …… + H₃O⁺",
  "phuong_an": [
   "0. OH⁻.",
   "1. H⁺.",
   "2. H₂CO₃.",
   "3. CO₃²⁻."
  ],
  "dap_an_dung": 3,
  "giai_thich": "HCO₃⁻ cho proton cho H₂O tạo H₃O⁺, nên bản thân nó chuyển thành base liên hợp CO₃²⁻."
 },
 {
  "id": "bq_1789372198147_whxjo",
  "loai": "mc",
  "muc": "nb",
  "de": "Chất nào sau đây không phân li ra ion khi hòa tan trong nước?",
  "phuong_an": [
   "0. Acetic acid (CH₃COOH).",
   "1. Vôi tôi (Ca(OH)₂).",
   "2. Muối ăn (NaCl).",
   "3. Đường saccharose (C₁₂H₂₂O₁₁)."
  ],
  "dap_an_dung": 3,
  "giai_thich": "Saccharose tan trong nước ở dạng phân tử, không phân li ra ion; CH₃COOH phân li một phần, Ca(OH)₂ và NaCl phân li ra ion."
 },
 {
  "id": "bq_1789372198151_2hluf",
  "loai": "mc",
  "muc": "th",
  "de": "Cho các chất: HNO₃, C₁₂H₂₂O₁₁, BaCl₂, KOH, Na₂SO₄, NaHSO₃, NH₄NO₃, H₂SO₄, Zn, ZnSO₄, O₂, C₂H₅OH. Số chất điện li là",
  "phuong_an": [
   "0. 6",
   "1. 7",
   "2. 8",
   "3. 10"
  ],
  "dap_an_dung": 2,
  "giai_thich": "Các acid HNO₃, H₂SO₄, base KOH và các muối BaCl₂, Na₂SO₄, NaHSO₃, NH₄NO₃, ZnSO₄ đều phân li ra ion; saccharose, ethanol không phân li, còn Zn, O₂ là đơn chất."
 },
 {
  "id": "bq_1789372198151_a56zr",
  "loai": "mc",
  "muc": "vd",
  "de": "Trộn 300 mL dung dịch HCl 0,5 M với 500 mL dung dịch H₂SO₄ 0,1 M thu được 800 mL dung dịch X. Nồng độ mol/L của H⁺ trong X có giá trị là",
  "phuong_an": [
   "0. 0,2000 M.",
   "1. 0,3125 M.",
   "2. 0,3000 M.",
   "3. 0,1725 M."
  ],
  "dap_an_dung": 1,
  "giai_thich": "n(H⁺) = 0,3·0,5 + 2·0,5·0,1 = 0,15 + 0,10 = 0,25 mol; [H⁺] = 0,25/0,8 = 0,3125 M."
 },
 {
  "id": "bq_1789372198151_gr0gu",
  "loai": "mc",
  "muc": "th",
  "de": "Một học sinh làm thí nghiệm xác định pH của đất: lấy một lượng đất cho vào nước rồi lọc lấy phần dung dịch, dùng máy đo pH đo được pH = 4,69. Phát biểu nào sau đây đúng?",
  "phuong_an": [
   "0. Dung dịch có môi trường base.",
   "1. Nồng độ H⁺ trong dung dịch lớn hơn 0,001 M.",
   "2. Dung dịch có [OH⁻] > [H⁺] vì pOH > pH.",
   "3. Đây là đất chua, có thể bón vôi để giảm độ chua."
  ],
  "dap_an_dung": 3,
  "giai_thich": "pH = 4,69 < 7 nên dung dịch có tính acid, [H⁺] = 10^(−4,69) ≈ 2·10⁻⁵ M; vôi là base trung hòa bớt H⁺ nên giảm được độ chua."
 },
 {
  "id": "bq_1789372198151_vbkq8",
  "loai": "mc",
  "muc": "vd",
  "de": "Để xác định nồng độ của một dung dịch NaOH, người ta cho 10 mL dung dịch HCl 0,1 M vào bình tam giác, thêm 2 giọt phenolphthalein rồi chuẩn độ bằng dung dịch NaOH đựng trong buret. Kết quả thí nghiệm cho thấy thể tích dung dịch NaOH cần dùng là 20 mL. Nồng độ của dung dịch NaOH là",
  "phuong_an": [
   "0. 0,2 M",
   "1. 0,1 M",
   "2. 0,05 M",
   "3. 0,02 M"
  ],
  "dap_an_dung": 2,
  "giai_thich": "n(NaOH) = n(HCl) = 0,01·0,1 = 0,001 mol, nên C(NaOH) = 0,001/0,02 = 0,05 M; điểm tương đương nhận ra khi dung dịch chuyển sang màu hồng nhạt bền."
 },
 {
  "id": "bq_1789372198151_w2wed",
  "loai": "mc",
  "muc": "th",
  "de": "[Hình: ba cốc dung dịch X, Y, Z, mỗi cốc cắm hai điện cực nối với pin và bóng đèn; với dung dịch X đèn không sáng, với dung dịch Y đèn sáng mạnh, với dung dịch Z đèn sáng yếu] Tiến hành thử tính dẫn điện của một số dung dịch như hình. Phát biểu nào sau đây đúng?",
  "phuong_an": [
   "0. Dung dịch X có thể là dung dịch NaCl.",
   "1. Dung dịch Y có thể là dung dịch H₂SO₄, KOH hoặc FeSO₄.",
   "2. Dung dịch Z có thể là dung dịch CH₃COONa.",
   "3. Dung dịch Y chứa chất điện li yếu."
  ],
  "dap_an_dung": 1,
  "giai_thich": "Đèn sáng mạnh chứng tỏ Y chứa chất điện li mạnh (acid mạnh, base mạnh, muối tan); NaCl và CH₃COONa là muối tan điện li mạnh nên không thể cho đèn tắt hay sáng yếu."
 },
 {
  "id": "bq_1789372198153_1rgp8",
  "loai": "mc",
  "muc": "vd",
  "de": "Phát biểu nào sau đây về độ acid, độ base của dung dịch là đúng?",
  "phuong_an": [
   "0. Dung dịch acid nào có nồng độ mol/L lớn hơn thì luôn có tính acid mạnh hơn.",
   "1. Trong các dung dịch cùng nồng độ K₂SO₃, NaClO₄, HNO₃, Ca(OH)₂, dung dịch có pH cao nhất là HNO₃.",
   "2. Với ba dung dịch cùng nồng độ NH₃ (1), Ca(OH)₂ (2), KOH (3), giá trị pH giảm dần theo thứ tự (2), (3), (1).",
   "3. Dung dịch có [H⁺] càng lớn thì pH càng lớn."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Ở cùng nồng độ, Ca(OH)₂ cho 2 OH⁻ nên pH cao nhất, KOH phân li hoàn toàn cho 1 OH⁻, còn NH₃ là base yếu nên pH thấp nhất; độ mạnh acid phụ thuộc mức độ phân li chứ không chỉ nồng độ."
 },
 {
  "id": "bq_1789372198153_cjhpp",
  "loai": "mc",
  "muc": "vd",
  "de": "Để chuẩn độ 10 mL dung dịch HCl nồng độ x M cần 50 mL dung dịch NaOH 0,5 M. Giá trị của x là",
  "phuong_an": [
   "0. 0,25",
   "1. 1,25",
   "2. 2,5",
   "3. 5"
  ],
  "dap_an_dung": 2,
  "giai_thich": "n(NaOH) = 0,05·0,5 = 0,025 mol = n(HCl), nên x = 0,025/0,01 = 2,5 M."
 },
 {
  "id": "bq_1789372198153_po6po",
  "loai": "mc",
  "muc": "th",
  "de": "Cho các chất dưới đây: HClO₄, HClO, HF, HNO₃, H₂S, H₂SO₃, NaOH, NaCl, CuSO₄, CH₃COOH. Số chất thuộc loại chất điện li mạnh là",
  "phuong_an": [
   "0. 5.",
   "1. 6.",
   "2. 7.",
   "3. 4."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Chất điện li mạnh gồm acid mạnh HClO₄, HNO₃, base mạnh NaOH và muối tan NaCl, CuSO₄; HClO, HF, H₂S, H₂SO₃, CH₃COOH là acid yếu."
 },
 {
  "id": "bq_1789372198153_tvt0h",
  "loai": "mc",
  "muc": "th",
  "de": "Đo pH của một cốc nước chanh được giá trị pH bằng 2,4. Nhận định nào sau đây không đúng?",
  "phuong_an": [
   "0. Nước chanh có môi trường acid.",
   "1. Nồng độ ion H⁺ của nước chanh là 10^(−2,4) mol/L.",
   "2. Nồng độ ion H⁺ của nước chanh là 0,24 mol/L.",
   "3. Nồng độ ion OH⁻ của nước chanh nhỏ hơn 10⁻⁷ mol/L."
  ],
  "dap_an_dung": 2,
  "giai_thich": "[H⁺] = 10^(−2,4) ≈ 4·10⁻³ M chứ không phải 0,24 M; môi trường acid nên [OH⁻] < 10⁻⁷ M."
 },
 {
  "id": "bq_1789373737083_8kgwz",
  "loai": "mc",
  "muc": "th",
  "de": "Phương trình điện li nào sau đây được viết không đúng?",
  "phuong_an": [
   "0. HCl → H⁺ + Cl⁻.",
   "1. CH₃COOH → H⁺ + CH₃COO⁻.",
   "2. HClO ⇌ H⁺ + ClO⁻.",
   "3. Na₃PO₄ → 3Na⁺ + PO₄³⁻."
  ],
  "dap_an_dung": 1,
  "giai_thich": "CH₃COOH là acid yếu, chỉ phân li một phần nên phải dùng mũi tên hai chiều: CH₃COOH ⇌ H⁺ + CH₃COO⁻."
 },
 {
  "id": "bq_1789373737083_fqsbs",
  "loai": "mc",
  "muc": "th",
  "de": "Phương trình điện li nào dưới đây được viết đúng?",
  "phuong_an": [
   "0. H₂SO₃ → H⁺ + HSO₃⁻",
   "1. Al₂(SO₄)₃ → 3Al²⁺ + 3SO₄²⁻",
   "2. H₂SO₄ —t°→ H⁺ + HSO₄⁻",
   "3. HClO₄ → H⁺ + ClO₄⁻"
  ],
  "dap_an_dung": 3,
  "giai_thich": "HClO₄ là acid mạnh, phân li hoàn toàn một nấc nên viết mũi tên một chiều; H₂SO₃ là acid yếu phải dùng mũi tên hai chiều, Al₂(SO₄)₃ phải cho 2Al³⁺ + 3SO₄²⁻."
 },
 {
  "id": "bq_1789373737083_vejh8",
  "loai": "mc",
  "muc": "th",
  "de": "Cho các phương trình sau: (1) NH₄⁺ ⇌ NH₃ + H⁺; (2) S²⁻ + H₂O ⇌ HS⁻ + OH⁻. Theo thuyết Brønsted – Lowry,",
  "phuong_an": [
   "0. NH₄⁺ và S²⁻ là acid.",
   "1. NH₄⁺ là acid, S²⁻ là base.",
   "2. NH₄⁺ là base, S²⁻ là acid.",
   "3. NH₄⁺ và S²⁻ là base."
  ],
  "dap_an_dung": 1,
  "giai_thich": "NH₄⁺ cho H⁺ nên là acid; S²⁻ nhận H⁺ của nước để tạo HS⁻ nên là base."
 },
 {
  "id": "bq_1789373737083_xnq8d",
  "loai": "mc",
  "muc": "vd",
  "de": "Có hai ý kiến: Học sinh (1) cho rằng sau một thời gian bón phân đạm ammonium (NH₄Cl, NH₄NO₃,…) thì độ chua của đất tăng lên vì ion NH₄⁺ thủy phân tạo môi trường acid; Học sinh (2) cho rằng bón phân đạm ammonium thì độ chua của đất giảm vì NH₄⁺ thủy phân tạo ra NH₃ có môi trường base. Ý kiến đúng là",
  "phuong_an": [
   "0. của học sinh (1).",
   "1. của học sinh (2).",
   "2. cả hai đều đúng.",
   "3. cả hai đều sai."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Cân bằng NH₄⁺ + H₂O ⇌ NH₃ + H₃O⁺ giải phóng ion H₃O⁺ nên dung dịch có môi trường acid, làm đất chua thêm."
 }
]
```
