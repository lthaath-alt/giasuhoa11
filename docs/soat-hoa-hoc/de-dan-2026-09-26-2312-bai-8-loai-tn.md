# Đề dẫn soát nội dung — 24 câu

Mở tệp này trong Antigravity rồi bảo nó: *"làm đúng yêu cầu trong tệp,
ghi kết quả ra `docs/soat-hoa-hoc/tra-loi-2026-09-26-2312-bai-8-loai-tn-1.json`"*.

**Rồi làm lại LẦN NỮA**, trong một phiên mới, ghi ra
`docs/soat-hoa-hoc/tra-loi-2026-09-26-2312-bai-8-loai-tn-2.json`. Một lượt soát
KHÔNG đủ: đo 20/09/2026, cùng 16 câu chạy ba lượt cho ra 3, 3, rồi 0 câu
nghi ngờ — và ba câu bị bỏ sót ở lượt thứ ba là lỗi THẬT.

Xong thì nạp CẢ HAI, ngăn bằng dấu phẩy, KHÔNG có dấu cách:

```bash
npm run soat:hoa-hoc -- --bai bai-8 --loai tn --nap docs/soat-hoa-hoc/tra-loi-2026-09-26-2312-bai-8-loai-tn-1.json,docs/soat-hoa-hoc/tra-loi-2026-09-26-2312-bai-8-loai-tn-2.json
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
  "id": "b:2:vdc:3",
  "loai": "tn",
  "muc": "vdc",
  "de": "Cho 200 mL dung dịch H₂SO₄ nồng độ x mol/L tác dụng vừa đủ với 300 mL dung dịch NaOH 0,4 M. Tính x.",
  "dap_an": "0,3",
  "sai_so_cho_phep": 0.01,
  "giai_thich": "n(NaOH) = 0,12 mol. Theo H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O thì n(H₂SO₄) = 0,06 mol → x = 0,06 / 0,2 = 0,3 M."
 },
 {
  "id": "bq_1788161089233_q4b2o",
  "loai": "tn",
  "muc": "vdc",
  "de": "Hòa tan 33,8 gam oleum X (có công thức dạng H₂SO₄.nSO₃) vào nước, sau đó cho phản ứng với lượng dư dung dịch BaCl₂ thu được 93,2 gam kết tủa trắng. Xác định giá trị n trong công thức của oleum X.",
  "dap_an": "3",
  "giai_thich": "Bảo toàn nguyên tố lưu huỳnh, ta có n(H₂SO₄.nSO₃) = n(BaSO₄) / (n+1) = 0,4 / (n+1). Suy ra M = 33,8(n+1)/0,4 = 98 + 80n. Từ đó tìm được n = 3."
 },
 {
  "id": "bq_1788161555460_hv5yh",
  "loai": "tn",
  "muc": "vd",
  "de": "Cho 5,76 gam magnesium (Mg) tác dụng vừa đủ với dung dịch sulfuric acid loãng thu được V lít khí hydrogen (đo ở 25 °C, 1 bar). Tính giá trị của V (làm tròn đến bốn chữ số thập phân).",
  "dap_an": "5,9496",
  "sai_so_cho_phep": 0.01,
  "giai_thich": "Phương trình: Mg + H₂SO₄ → MgSO₄ + H₂. Số mol Mg = 5,76 / 24 = 0,24 mol. Số mol H₂ = 0,24 mol. Thể tích V = 0,24 × 24,79 = 5,9496 L."
 },
 {
  "id": "bq_1788161555460_kmm76",
  "loai": "tn",
  "muc": "vdc",
  "de": "Sử dụng 12 tấn quặng pyrite sắt (có chứa 9% tạp chất trơ) để sản xuất V m³ dung dịch H₂SO₄ 98% (khối lượng riêng 1840 kg/m³). Biết hiệu suất mỗi giai đoạn của quá trình 3 giai đoạn (đốt quặng, oxi hóa SO₂, hấp thụ SO₃) đều là 80%. Tính giá trị V (làm tròn đến hai chữ số thập phân).",
  "dap_an": "5,06",
  "sai_so_cho_phep": 0.05,
  "giai_thich": "Khối lượng FeS₂ = 12 × 0,91 = 10,92 tấn. Sơ đồ: FeS₂ → 2H₂SO₄. Khối lượng H₂SO₄ lý thuyết = (10,92 / 120) × 2 × 98 = 17,836 tấn = 17836 kg. Thực tế H₂SO₄ nguyên chất = 17836 × (0,8)³ = 9132,032 kg. Khối lượng dd H₂SO₄ 98% = 9132,032 / 0,98 = 9318,4 kg. Thể tích V = m / D = 9318,4 / 1840 ≈ 5,06 m³."
 },
 {
  "id": "bq_1789371866324_m0vms",
  "loai": "tn",
  "muc": "vd",
  "de": "Một muối X tác dụng với dung dịch HCl và dung dịch NaOH đều tạo khí; X không phản ứng với dung dịch BaCl₂ nhưng phản ứng với dung dịch Ba(OH)₂ vừa cho kết tủa, vừa tạo khí. Khối lượng phân tử của X là bao nhiêu?",
  "dap_an": "79",
  "giai_thich": "X là NH₄HCO₃ nên M = 18 + 1 + 12 + 48 = 79."
 },
 {
  "id": "bq_1789371866326_0sdja",
  "loai": "tn",
  "muc": "th",
  "de": "Cho các phản ứng: (1) S + O₂ —t°→ SO₂; (2) S + 3F₂ —t°→ SF₆; (3) S + Hg → HgS; (4) S + 6HNO₃ (đặc) —t°→ H₂SO₄ + 6NO₂ + 2H₂O. Có bao nhiêu phản ứng trong đó S thể hiện tính khử?",
  "dap_an": "3",
  "giai_thich": "Các phản ứng (1), (2), (4) đều làm tăng số oxi hóa của sulfur nên có 3 phản ứng S là chất khử."
 },
 {
  "id": "bq_1789371866326_3cuso",
  "loai": "tn",
  "muc": "vd",
  "de": "Hỗn hợp X gồm NH₄Cl và (NH₄)₂SO₄ tác dụng với dung dịch Ba(OH)₂ dư, đun nhẹ thu được 9,32 gam kết tủa và 2,479 lít khí (đkc). Khối lượng hỗn hợp X là bao nhiêu gam?",
  "dap_an": "6,35",
  "sai_so_cho_phep": 0.02,
  "giai_thich": "m = 0,02·53,5 + 0,04·132 = 6,35 gam."
 },
 {
  "id": "bq_1789371866327_5lkef",
  "loai": "tn",
  "muc": "vd",
  "de": "Cho 2,81 gam hỗn hợp Fe₂O₃, MgO, ZnO tan vừa đủ trong 300 mL dung dịch H₂SO₄ 0,1 M. Khối lượng muối sulfate khan thu được là bao nhiêu gam?",
  "dap_an": "5,21",
  "sai_so_cho_phep": 0.02,
  "giai_thich": "m = 2,81 + 0,03·(96 − 16) = 5,21 gam."
 },
 {
  "id": "bq_1789371866327_5noid",
  "loai": "tn",
  "muc": "vdc",
  "de": "Dùng 300 tấn quặng pyrite (FeS₂) có lẫn 20% tạp chất để sản xuất H₂SO₄ 98% với hiệu suất 90%. Khối lượng dung dịch H₂SO₄ 98% thu được là bao nhiêu tấn?",
  "dap_an": "360",
  "sai_so_cho_phep": 1,
  "giai_thich": "m(H₂SO₄) = 240/120·2·98·0,9 = 352,8 tấn nên m(dd) = 352,8/0,98 = 360 tấn."
 },
 {
  "id": "bq_1789371866327_jee3a",
  "loai": "tn",
  "muc": "vd",
  "de": "Cho 20 gam hỗn hợp X gồm Fe và Cu phản ứng hoàn toàn với H₂SO₄ loãng dư, thu được 12 gam chất rắn không tan. Phần trăm khối lượng của Fe trong X là bao nhiêu %?",
  "dap_an": "40",
  "sai_so_cho_phep": 0.5,
  "giai_thich": "m(Fe) = 20 − 12 = 8 gam nên %Fe = 8/20·100% = 40%."
 },
 {
  "id": "bq_1789371866327_ljrou",
  "loai": "tn",
  "muc": "vdc",
  "de": "Nung hỗn hợp X gồm FeS và FeS₂ trong bình kín chứa không khí (20% O₂, 80% N₂) đến hoàn toàn, thu được một chất rắn duy nhất và khí Y gồm 84,8% N₂, 14% SO₂, còn lại là O₂. Phần trăm khối lượng của FeS trong X là bao nhiêu %?",
  "dap_an": "19,64",
  "sai_so_cho_phep": 0.05,
  "giai_thich": "n(FeS₂) = 3·n(FeS) nên %FeS = 88/(88 + 360)·100% = 19,64%."
 },
 {
  "id": "bq_1789371866327_o09bk",
  "loai": "tn",
  "muc": "vd",
  "de": "Để hòa tan hoàn toàn 2,32 gam hỗn hợp FeO, Fe₂O₃, Fe₃O₄ (số mol FeO bằng số mol Fe₂O₃) cần vừa đủ V lít dung dịch H₂SO₄ 0,5 M. Giá trị của V là bao nhiêu lít?",
  "dap_an": "0,08",
  "sai_so_cho_phep": 0.005,
  "giai_thich": "Quy đổi thành 0,01 mol Fe₃O₄ cần 0,04 mol H₂SO₄ nên V = 0,08 L."
 },
 {
  "id": "bq_1789371866327_uf1ki",
  "loai": "tn",
  "muc": "vd",
  "de": "Nung 11,2 gam Fe và 26 gam Zn với lượng S dư, hòa tan sản phẩm trong H₂SO₄ loãng rồi dẫn khí sinh ra vào dung dịch CuSO₄ 10% (D = 1,2 g/mL). Thể tích dung dịch CuSO₄ tối thiểu cần dùng là bao nhiêu mL?",
  "dap_an": "800",
  "sai_so_cho_phep": 1,
  "giai_thich": "n(H₂S) = 0,6 mol nên m(CuSO₄) = 96 gam, m(dd) = 960 gam, V = 960/1,2 = 800 mL."
 },
 {
  "id": "bq_1789371866327_w2404",
  "loai": "tn",
  "muc": "vd",
  "de": "Cho 21 gam hỗn hợp Zn và CuO phản ứng vừa đủ với 600 mL dung dịch H₂SO₄ 0,5 M. Khối lượng Zn trong hỗn hợp ban đầu là bao nhiêu gam?",
  "dap_an": "13",
  "sai_so_cho_phep": 0.02,
  "giai_thich": "Giải hệ 65x + 80y = 21 và x + y = 0,3 được x = 0,2 mol, m(Zn) = 13 gam."
 },
 {
  "id": "bq_1789372198147_h7dn1",
  "loai": "tn",
  "muc": "th",
  "de": "Cho các chất: S, SO₂, SO₃, H₂SO₄. Có bao nhiêu chất vừa có tính oxi hóa, vừa có tính khử?",
  "dap_an": "2",
  "giai_thich": "Chỉ S (0) và SO₂ (+4) có số oxi hóa trung gian của sulfur."
 },
 {
  "id": "bq_1789372198151_eu2cm",
  "loai": "tn",
  "muc": "vd",
  "de": "Thể tích dung dịch H₂SO₄ 98% (D = 1,84 g/mL) cần dùng để pha chế 2 lít dung dịch H₂SO₄ 0,05 M là bao nhiêu mL? (làm tròn đến hàng phần trăm)",
  "dap_an": "5,43",
  "sai_so_cho_phep": 0.02,
  "giai_thich": "m(H₂SO₄) = 9,8 g, m dung dịch = 10 g, V = 10/1,84 ≈ 5,43 mL."
 },
 {
  "id": "bq_1789372198152_57vti",
  "loai": "tn",
  "muc": "vd",
  "de": "Để trừ nấm thực vật, người ta dùng dung dịch CuSO₄ 0,8%. Lượng dung dịch CuSO₄ 0,8% pha chế được từ 60 gam CuSO₄.5H₂O là bao nhiêu gam?",
  "dap_an": "4800",
  "giai_thich": "m(CuSO₄) = 38,4 g nên m dung dịch = 38,4/0,008 = 4800 g."
 },
 {
  "id": "bq_1789372198152_9x575",
  "loai": "tn",
  "muc": "vdc",
  "de": "Hòa tan hoàn toàn 24 gam hỗn hợp X gồm MO, M(OH)₂ và MCO₃ (M có hóa trị không đổi) trong 100 gam dung dịch H₂SO₄ 39,2%, thu được 1,2395 lít khí (đkc) và dung dịch Y chỉ chứa một chất tan duy nhất có nồng độ 39,41%. Khối lượng chất tan trong Y là bao nhiêu gam?",
  "dap_an": "48",
  "sai_so_cho_phep": 0.1,
  "giai_thich": "m(dd Y) = 24 + 100 − 2,2 = 121,8 g nên m(MSO₄) = 0,3941·121,8 ≈ 48 g."
 },
 {
  "id": "bq_1789372198152_carj2",
  "loai": "tn",
  "muc": "vdc",
  "de": "Từ 800 tấn quặng pyrite sắt (FeS₂) chứa 25% tạp chất không cháy, có thể sản xuất được bao nhiêu m³ dung dịch H₂SO₄ 93% (D = 1,83 g/mL)? Giả thiết tỉ lệ hao hụt là 5% (làm tròn đến hàng phần trăm).",
  "dap_an": "547,04",
  "sai_so_cho_phep": 0.5,
  "giai_thich": "m(H₂SO₄) = 600·196/120·0,95 = 931 tấn; V = 931/0,93/1,83 ≈ 547,04 m³."
 },
 {
  "id": "bq_1789372198152_hfboc",
  "loai": "tn",
  "muc": "vd",
  "de": "Hỗn hợp X gồm NH₄Cl và (NH₄)₂SO₄. Cho X tác dụng với dung dịch Ba(OH)₂ dư, đun nhẹ thu được 9,32 gam kết tủa và 2,479 lít (đkc) khí thoát ra. Khối lượng của X là bao nhiêu gam?",
  "dap_an": "6,35",
  "sai_so_cho_phep": 0.01,
  "giai_thich": "m(X) = 0,04·132 + 0,02·53,5 = 5,28 + 1,07 = 6,35 g."
 },
 {
  "id": "bq_1789372198152_pfahu",
  "loai": "tn",
  "muc": "vd",
  "de": "Cho 21,3 gam hỗn hợp bột X gồm Mg, Cu và Al tác dụng hoàn toàn với O₂ (đun nóng), thu được 33,3 gam chất rắn B. Để hòa tan hoàn toàn B cần dùng tối thiểu V mL dung dịch hỗn hợp HCl 2M và H₂SO₄ 1M. Giá trị của V là bao nhiêu?",
  "dap_an": "375",
  "giai_thich": "n(H⁺) = 2n(O) = 2·12/16 = 1,5 mol; V = 1,5/(2 + 2·1) = 0,375 L = 375 mL."
 },
 {
  "id": "bq_1789372198153_i396j",
  "loai": "tn",
  "muc": "vd",
  "de": "Tính thể tích dung dịch H₂SO₄ 98% (D = 1,84 g/mL) cần dùng để pha chế thành 500 mL dung dịch H₂SO₄ 0,05 M (làm tròn đến hàng phần trăm).",
  "dap_an": "1,36",
  "sai_so_cho_phep": 0.01,
  "giai_thich": "m dung dịch = 0,025·98/0,98 = 2,5 g; V = 2,5/1,84 ≈ 1,36 mL."
 },
 {
  "id": "bq_1789373737083_41i8l",
  "loai": "tn",
  "muc": "vdc",
  "de": "Từ 1 tấn quặng pyrite chứa 80% FeS₂ sản xuất H₂SO₄ 95% (D = 1,82 g/mL) với hiệu suất toàn quá trình 90%. Khối lượng H₂SO₄ nguyên chất thu được là bao nhiêu kg?",
  "dap_an": "1176",
  "sai_so_cho_phep": 1,
  "giai_thich": "n(FeS₂) = 800000/120 = 6666,7 mol, cho 13333,3 mol H₂SO₄ lí thuyết; nhân 0,9 được 12000 mol, m = 12000·98 = 1 176 000 g = 1176 kg."
 },
 {
  "id": "bq_1789373737083_fb6ic",
  "loai": "tn",
  "muc": "vdc",
  "de": "Hỗn hợp X gồm SO₂ và O₂ có tỉ khối so với H₂ bằng 28; lấy 4,958 lít X (đkc) cho qua V₂O₅ nung nóng rồi dẫn hỗn hợp sau phản ứng qua dung dịch Ba(OH)₂ dư thu được 33,51 gam kết tủa. Hiệu suất phản ứng oxi hóa SO₂ thành SO₃ là bao nhiêu %?",
  "dap_an": "40",
  "sai_so_cho_phep": 0.5,
  "giai_thich": "233x + 217(0,15 − x) = 33,51 cho x = 0,06 mol nên H = 0,06/0,15·100% = 40%."
 }
]
```
