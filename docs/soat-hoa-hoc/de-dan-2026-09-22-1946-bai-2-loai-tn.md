# Đề dẫn soát nội dung — 30 câu

Mở tệp này trong Antigravity rồi bảo nó: *"làm đúng yêu cầu trong tệp,
ghi kết quả ra `docs/soat-hoa-hoc/tra-loi-2026-09-22-1946-bai-2-loai-tn-1.json`"*.

**Rồi làm lại LẦN NỮA**, trong một phiên mới, ghi ra
`docs/soat-hoa-hoc/tra-loi-2026-09-22-1946-bai-2-loai-tn-2.json`. Một lượt soát
KHÔNG đủ: đo 20/09/2026, cùng 16 câu chạy ba lượt cho ra 3, 3, rồi 0 câu
nghi ngờ — và ba câu bị bỏ sót ở lượt thứ ba là lỗi THẬT.

Xong thì nạp CẢ HAI, ngăn bằng dấu phẩy, KHÔNG có dấu cách:

```bash
npm run soat:hoa-hoc -- --nap docs/soat-hoa-hoc/tra-loi-2026-09-22-1946-bai-2-loai-tn-1.json,docs/soat-hoa-hoc/tra-loi-2026-09-22-1946-bai-2-loai-tn-2.json
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
  "id": "b:1:vdc:3",
  "loai": "tn",
  "muc": "vdc",
  "de": "Trộn 100 mL dung dịch HCl 0,1 M với 100 mL dung dịch NaOH 0,06 M. Tính pH của dung dịch sau phản ứng (lg2 ≈ 0,30).",
  "dap_an": "1,7",
  "sai_so_cho_phep": 0.05,
  "giai_thich": "n(H⁺) = 0,01; n(OH⁻) = 0,006 nên H⁺ dư 0,004 mol trong 0,2 L → [H⁺] = 0,02 M → pH = 2 − lg2 = 1,70."
 },
 {
  "id": "bq_1788161089233_k8efc",
  "loai": "tn",
  "muc": "vd",
  "de": "Trộn 150 ml dung dịch CH₃COOH 0,1M với 100 ml dung dịch NaOH 0,1M thu được dung dịch X. Tính pH của dung dịch X (biết Ka của CH₃COOH = 1,75.10⁻⁵, làm tròn đến hai chữ số thập phân).",
  "dap_an": "5,06",
  "sai_so_cho_phep": 0.05,
  "giai_thich": "Nồng độ CH₃COO⁻ tạo thành là 0,01 mol / 0,25 L = 0,04M. Nồng độ CH₃COOH dư là 0,005 mol / 0,25 L = 0,02M. Tính cân bằng điện li cho ra [H⁺] ≈ 0,875.10⁻⁵ M, suy ra pH = 5,06."
 },
 {
  "id": "bq_1788161296549_wnwch",
  "loai": "tn",
  "muc": "vdc",
  "de": "Đối với bệnh nhân bị gout, giả thiết nồng độ tổng cộng của uric acid và urate trong nước tiểu là 2,0 mmol/L, độ tan tối đa của uric acid ở 37 °C là 0,5 mmol/L. Tính pH khi sỏi uric acid bắt đầu hình thành (biết pKa = 5,4, làm tròn đến hai chữ số thập phân).",
  "dap_an": "5,88",
  "sai_so_cho_phep": 0.05,
  "giai_thich": "Sỏi bắt đầu hình thành khi dung dịch bão hòa HUr, tức [HUr] = 0,5 mmol/L. Vì tổng là 2,0 mmol/L nên [Ur⁻] = 1,5 mmol/L. Áp dụng phương trình đệm: pH = pKa + log([Ur⁻]/[HUr]) = 5,4 + log(3) ≈ 5,88."
 },
 {
  "id": "bq_1789371866324_76z2m",
  "loai": "tn",
  "muc": "nb",
  "de": "Cho các chất dưới đây: HCl, HNO₃, NaOH, NaCl, CuO, O₂, CH₃COOH. Số chất thuộc loại chất không điện li là bao nhiêu?",
  "dap_an": "2",
  "giai_thich": "Chất không điện li gồm CuO và O₂; năm chất còn lại là acid, base hoặc muối nên đều điện li."
 },
 {
  "id": "bq_1789371866324_rudb4",
  "loai": "tn",
  "muc": "th",
  "de": "Dung dịch đất có pH = 4,52. Nồng độ ion H⁺ trong dung dịch đất là a·10⁻⁵ M. Giá trị của a là bao nhiêu? (làm tròn đến hàng phần mười)",
  "dap_an": "3,0",
  "sai_so_cho_phep": 0.05,
  "giai_thich": "[H⁺] = 10^(−4,52) = 10^(0,48)·10⁻⁵ ≈ 3,0·10⁻⁵ M."
 },
 {
  "id": "bq_1789371866324_svtw9",
  "loai": "tn",
  "muc": "th",
  "de": "Cho dung dịch X có [H⁺] = 10⁻³ M. pH của dung dịch X là bao nhiêu?",
  "dap_an": "3",
  "giai_thich": "pH = −lg[H⁺] = −lg 10⁻³ = 3."
 },
 {
  "id": "bq_1789371866325_12gl8",
  "loai": "tn",
  "muc": "vdc",
  "de": "Trộn 100 mL dung dịch HCl có pH = 1 với 100 mL dung dịch gồm KOH 0,1 M và NaOH a M, thu được 200 mL dung dịch có pH = 12. Giá trị của a là bao nhiêu?",
  "dap_an": "0,02",
  "giai_thich": "0,01 + 0,1a = 0,01 + 0,002 nên a = 0,02."
 },
 {
  "id": "bq_1789371866325_15avh",
  "loai": "tn",
  "muc": "vd",
  "de": "Hòa tan 4,9 mg H₂SO₄ vào nước thu được 1 lít dung dịch. pH của dung dịch thu được là bao nhiêu?",
  "dap_an": "4",
  "giai_thich": "[H⁺] = 2·(4,9·10⁻³/98) = 10⁻⁴ M nên pH = 4."
 },
 {
  "id": "bq_1789371866325_2q98i",
  "loai": "tn",
  "muc": "vd",
  "de": "pH của dung dịch Ba(OH)₂ 0,05 M là bao nhiêu?",
  "dap_an": "13",
  "giai_thich": "[OH⁻] = 0,1 M, pOH = 1 nên pH = 13."
 },
 {
  "id": "bq_1789371866325_3o4a8",
  "loai": "tn",
  "muc": "vd",
  "de": "Cần bao nhiêu gam NaOH để pha chế 250 mL dung dịch có pH = 10?",
  "dap_an": "0,001",
  "giai_thich": "m = 10⁻⁴ mol/L·0,25 L·40 g/mol = 0,001 g."
 },
 {
  "id": "bq_1789371866325_cluch",
  "loai": "tn",
  "muc": "vd",
  "de": "Cho 10 mL dung dịch X chứa HCl 1M và H₂SO₄ 0,5M. Thể tích dung dịch NaOH 1M cần để trung hòa dung dịch X là bao nhiêu mL?",
  "dap_an": "20",
  "giai_thich": "n(OH⁻) = n(H⁺) = 0,02 mol nên V = 20 mL."
 },
 {
  "id": "bq_1789371866325_rctaw",
  "loai": "tn",
  "muc": "vdc",
  "de": "Trộn 200 mL dung dịch gồm HCl 0,1 M và H₂SO₄ 0,15 M với 300 mL dung dịch Ba(OH)₂ a M, thu được m gam kết tủa và 500 mL dung dịch có pH = 1. Giá trị của a là bao nhiêu?",
  "dap_an": "0,05",
  "giai_thich": "n(OH⁻) = 0,08 − 0,05 = 0,03 mol nên n(Ba(OH)₂) = 0,015 mol, a = 0,015/0,3 = 0,05 M."
 },
 {
  "id": "bq_1789371866325_xnvnt",
  "loai": "tn",
  "muc": "th",
  "de": "Cho các muối: NaNO₃; K₂CO₃; CuSO₄; FeCl₃; AlCl₃; KCl. Có bao nhiêu dung dịch muối có pH = 7?",
  "dap_an": "2",
  "giai_thich": "Chỉ NaNO₃ và KCl là muối của acid mạnh và base mạnh."
 },
 {
  "id": "bq_1789371866325_y6mfp",
  "loai": "tn",
  "muc": "vd",
  "de": "pH của hỗn hợp dung dịch HCl 0,005 M và H₂SO₄ 0,0025 M là bao nhiêu?",
  "dap_an": "2",
  "giai_thich": "[H⁺] = 0,005 + 0,005 = 0,01 M nên pH = 2."
 },
 {
  "id": "bq_1789371866328_hfzpj",
  "loai": "tn",
  "muc": "th",
  "de": "Cho các ion: CO₃²⁻, Al³⁺, NH₄⁺, NH₃, HCO₃⁻, HPO₄²⁻. Có bao nhiêu chất (ion) lưỡng tính theo thuyết Brønsted – Lowry?",
  "dap_an": "2",
  "giai_thich": "Hai chất lưỡng tính là HCO₃⁻ và HPO₄²⁻."
 },
 {
  "id": "bq_1789372198145_a5tn8",
  "loai": "tn",
  "muc": "vdc",
  "de": "Trộn 200 mL dung dịch chứa hỗn hợp HCl 0,1 M và H₂SO₄ 0,05 M với 300 mL dung dịch Ba(OH)₂ a mol/L, thu được m gam kết tủa và 500 mL dung dịch có pH = 13. Giá trị của a là bao nhiêu?",
  "dap_an": "0,15",
  "giai_thich": "n(OH⁻) = n(H⁺) + n(OH⁻ dư) = 0,04 + 0,1·0,5 = 0,09 mol, suy ra n(Ba(OH)₂) = 0,045 mol và a = 0,045/0,3 = 0,15 M."
 },
 {
  "id": "bq_1789372198145_d5azx",
  "loai": "tn",
  "muc": "vd",
  "de": "Tính pH của dung dịch H₂SO₄ 0,01 M (coi H₂SO₄ phân li hoàn toàn theo 2 nấc; làm tròn đến hàng phần mười).",
  "dap_an": "1,7",
  "sai_so_cho_phep": 0.05,
  "giai_thich": "[H⁺] = 2·0,01 = 0,02 M nên pH = −lg 0,02 ≈ 1,7."
 },
 {
  "id": "bq_1789372198146_l60l4",
  "loai": "tn",
  "muc": "th",
  "de": "Cho các dung dịch muối: Na₂CO₃, NaNO₃, NaNO₂, NaCl, Na₂SO₄, CH₃COONa, NH₄HSO₄, Na₂S. Có bao nhiêu dung dịch muối làm quỳ tím hóa xanh?",
  "dap_an": "4",
  "giai_thich": "Bốn muối Na₂CO₃, NaNO₂, CH₃COONa, Na₂S có anion gốc acid yếu, thủy phân tạo OH⁻ nên làm quỳ tím hóa xanh."
 },
 {
  "id": "bq_1789372198146_l6cw2",
  "loai": "tn",
  "muc": "nb",
  "de": "Cho các chất sau: NaCl; C₂H₅OH; C₁₂H₂₂O₁₁; HF; Ba(OH)₂; CH₃COOH. Số chất điện li trong dãy trên là bao nhiêu?",
  "dap_an": "4",
  "giai_thich": "Các chất điện li gồm NaCl, HF, Ba(OH)₂, CH₃COOH; C₂H₅OH và C₁₂H₂₂O₁₁ không phân li ra ion."
 },
 {
  "id": "bq_1789372198146_unc5a",
  "loai": "tn",
  "muc": "vd",
  "de": "Pha loãng 1 lít dung dịch NaOH có pH = 9 bằng nước để được dung dịch mới có pH = 8. Thể tích nước cần dùng là bao nhiêu lít?",
  "dap_an": "9",
  "giai_thich": "n(OH⁻) = 10⁻⁵ mol không đổi; để [OH⁻] = 10⁻⁶ M cần V = 10 lít, nên thêm 10 − 1 = 9 lít nước."
 },
 {
  "id": "bq_1789372198147_inn28",
  "loai": "tn",
  "muc": "vd",
  "de": "Phân tích 1 mL dịch vị dạ dày của một bệnh nhân thấy số mol H⁺ là 3,16·10⁻⁶ mol. Tính pH của dịch vị dạ dày trên (làm tròn đến hàng phần mười).",
  "dap_an": "2,5",
  "sai_so_cho_phep": 0.05,
  "giai_thich": "[H⁺] = 3,16·10⁻⁶/0,001 = 3,16·10⁻³ M, pH = −lg(3,16·10⁻³) ≈ 2,5."
 },
 {
  "id": "bq_1789372198147_kdevj",
  "loai": "tn",
  "muc": "nb",
  "de": "Giá trị pH của dung dịch HCl 0,01 M là bao nhiêu?",
  "dap_an": "2",
  "giai_thich": "HCl phân li hoàn toàn nên [H⁺] = 10⁻² M, pH = 2."
 },
 {
  "id": "bq_1789372198147_lk6bl",
  "loai": "tn",
  "muc": "vd",
  "de": "Để chuẩn độ 300 mL dung dịch HCl a M cần 200 mL dung dịch NaOH 0,015 M. Giá trị của a là bao nhiêu?",
  "dap_an": "0,01",
  "giai_thich": "n(HCl) = n(NaOH) = 0,003 mol nên a = 0,003/0,3 = 0,01 M."
 },
 {
  "id": "bq_1789372198151_3x3yt",
  "loai": "tn",
  "muc": "vd",
  "de": "Chuẩn độ 10 mL dung dịch HCl 0,1 M bằng dung dịch NaOH (chỉ thị phenolphthalein), thể tích dung dịch NaOH cần dùng là 20 mL. Nồng độ mol của dung dịch NaOH là bao nhiêu?",
  "dap_an": "0,05",
  "giai_thich": "n(NaOH) = n(HCl) = 0,001 mol nên C(NaOH) = 0,001/0,020 = 0,05 M."
 },
 {
  "id": "bq_1789372198151_fjr4k",
  "loai": "tn",
  "muc": "th",
  "de": "Dung dịch nước lọc từ một mẫu đất có pH = 4,69. Nồng độ ion H⁺ trong dung dịch là a·10⁻⁵ M. Giá trị của a là bao nhiêu? (làm tròn đến hàng phần mười)",
  "dap_an": "2,0",
  "sai_so_cho_phep": 0.05,
  "giai_thich": "[H⁺] = 10^(−4,69) = 10^(0,31)·10⁻⁵ ≈ 2,0·10⁻⁵ M."
 },
 {
  "id": "bq_1789372198151_im7r7",
  "loai": "tn",
  "muc": "vd",
  "de": "Trộn 300 mL dung dịch HCl 0,5 M với 500 mL dung dịch H₂SO₄ 0,1 M thu được 800 mL dung dịch X. Nồng độ mol/L của H⁺ trong X là bao nhiêu?",
  "dap_an": "0,3125",
  "sai_so_cho_phep": 0.001,
  "giai_thich": "[H⁺] = (0,15 + 0,10)/0,8 = 0,3125 M."
 },
 {
  "id": "bq_1789372198151_pyp0o",
  "loai": "tn",
  "muc": "th",
  "de": "Cho các chất: HNO₃, C₁₂H₂₂O₁₁, BaCl₂, KOH, Na₂SO₄, NaHSO₃, NH₄NO₃, H₂SO₄, Zn, ZnSO₄, O₂, C₂H₅OH. Có bao nhiêu chất điện li?",
  "dap_an": "8",
  "giai_thich": "Chất điện li gồm HNO₃, BaCl₂, KOH, Na₂SO₄, NaHSO₃, NH₄NO₃, H₂SO₄, ZnSO₄."
 },
 {
  "id": "bq_1789372198153_fr1uc",
  "loai": "tn",
  "muc": "th",
  "de": "Một cốc nước chanh có pH = 2,4. Nồng độ ion H⁺ trong nước chanh là a·10⁻³ mol/L. Giá trị của a là bao nhiêu? (làm tròn đến hàng phần mười)",
  "dap_an": "4,0",
  "sai_so_cho_phep": 0.05,
  "giai_thich": "[H⁺] = 10^(−2,4) = 10^(0,6)·10⁻³ ≈ 4,0·10⁻³ M."
 },
 {
  "id": "bq_1789372198153_ldc28",
  "loai": "tn",
  "muc": "vd",
  "de": "Để chuẩn độ 10 mL dung dịch HCl nồng độ x M cần 50 mL dung dịch NaOH 0,5 M. Xác định giá trị của x.",
  "dap_an": "2,5",
  "giai_thich": "x = 0,05·0,5/0,01 = 2,5."
 },
 {
  "id": "bq_1789372198153_s2g75",
  "loai": "tn",
  "muc": "th",
  "de": "Cho các chất dưới đây: HClO₄, HClO, HF, HNO₃, H₂S, H₂SO₃, NaOH, NaCl, CuSO₄, CH₃COOH. Có bao nhiêu chất thuộc loại chất điện li mạnh?",
  "dap_an": "5",
  "giai_thich": "HClO₄, HNO₃, NaOH, NaCl, CuSO₄ là chất điện li mạnh."
 }
]
```
