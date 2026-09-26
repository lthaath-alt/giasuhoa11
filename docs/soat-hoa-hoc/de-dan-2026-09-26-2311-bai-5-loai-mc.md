# Đề dẫn soát nội dung — 73 câu

Mở tệp này trong Antigravity rồi bảo nó: *"làm đúng yêu cầu trong tệp,
ghi kết quả ra `docs/soat-hoa-hoc/tra-loi-2026-09-26-2311-bai-5-loai-mc-1.json`"*.

**Rồi làm lại LẦN NỮA**, trong một phiên mới, ghi ra
`docs/soat-hoa-hoc/tra-loi-2026-09-26-2311-bai-5-loai-mc-2.json`. Một lượt soát
KHÔNG đủ: đo 20/09/2026, cùng 16 câu chạy ba lượt cho ra 3, 3, rồi 0 câu
nghi ngờ — và ba câu bị bỏ sót ở lượt thứ ba là lỗi THẬT.

Xong thì nạp CẢ HAI, ngăn bằng dấu phẩy, KHÔNG có dấu cách:

```bash
npm run soat:hoa-hoc -- --bai bai-5 --loai mc --nap docs/soat-hoa-hoc/tra-loi-2026-09-26-2311-bai-5-loai-mc-1.json,docs/soat-hoa-hoc/tra-loi-2026-09-26-2311-bai-5-loai-mc-2.json
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
  "id": "b:2:nb:2",
  "loai": "mc",
  "muc": "nb",
  "de": "Để nhận biết muối ammonium, người ta cho muối tác dụng với dung dịch kiềm rồi đun nóng, hiện tượng là",
  "phuong_an": [
   "0. có kết tủa trắng",
   "1. có khí mùi khai làm quỳ tím ẩm hóa xanh",
   "2. dung dịch hóa đỏ",
   "3. có khí không màu hóa nâu trong không khí"
  ],
  "dap_an_dung": 1,
  "giai_thich": "NH₄⁺ + OH⁻ → NH₃↑ + H₂O. Khí NH₃ mùi khai, làm giấy quỳ tím ẩm chuyển xanh."
 },
 {
  "id": "b:2:nb:7",
  "loai": "mc",
  "muc": "nb",
  "de": "Ammonia NH₃ có tính chất vật lí nào sau đây?",
  "phuong_an": [
   "0. khí không mùi, không tan trong nước",
   "1. khí mùi khai, tan rất nhiều trong nước",
   "2. chất lỏng màu vàng",
   "3. chất rắn thăng hoa"
  ],
  "dap_an_dung": 1,
  "giai_thich": "NH₃ là khí không màu, mùi khai xốc, nhẹ hơn không khí và tan rất nhiều trong nước tạo dung dịch có tính base."
 },
 {
  "id": "b:2:th:0",
  "loai": "mc",
  "muc": "th",
  "de": "Đưa hai đũa thủy tinh, một tẩm dung dịch NH₃ đặc, một tẩm dung dịch HCl đặc, lại gần nhau. Hiện tượng quan sát được là",
  "phuong_an": [
   "0. có khói trắng xuất hiện",
   "1. có khí màu nâu",
   "2. có kết tủa vàng",
   "3. không hiện tượng"
  ],
  "dap_an_dung": 0,
  "giai_thich": "NH₃ + HCl → NH₄Cl. Tinh thể NH₄Cl rất mịn lơ lửng tạo hiện tượng khói trắng."
 },
 {
  "id": "b:2:vd:4",
  "loai": "mc",
  "muc": "vd",
  "de": "Tổng hợp ammonia từ 1 mol N₂ và 3 mol H₂ với hiệu suất 25%. Số mol NH₃ thu được là",
  "phuong_an": [
   "0. 0,25 mol",
   "1. 0,50 mol",
   "2. 0,75 mol",
   "3. 2,00 mol"
  ],
  "dap_an_dung": 1,
  "giai_thich": "Nếu hiệu suất 100% thu 2 mol NH₃; với H = 25% thì n(NH₃) = 2 × 0,25 = 0,5 mol."
 },
 {
  "id": "b:2:vd:6",
  "loai": "mc",
  "muc": "vd",
  "de": "Cho 200 mL dung dịch NH₃ tác dụng vừa đủ với 100 mL dung dịch HCl 0,2 M. Nồng độ mol của dung dịch NH₃ là",
  "phuong_an": [
   "0. 0,05 M",
   "1. 0,10 M",
   "2. 0,20 M",
   "3. 0,40 M"
  ],
  "dap_an_dung": 1,
  "giai_thich": "n(HCl) = 0,02 mol; NH₃ + HCl → NH₄Cl nên n(NH₃) = 0,02 mol → C = 0,02/0,2 = 0,1 M."
 },
 {
  "id": "bq_1788161555460_bjif7",
  "loai": "mc",
  "muc": "vd",
  "de": "Khí thải công nghiệp có lẫn NH₃ rất độc hại. Để xử lý loại bỏ khí NH₃ trong khí thải, người ta có thể dẫn khí thải đi qua bể chứa dung dịch nào sau đây?",
  "phuong_an": [
   "0. Dung dịch HCl hoặc H₂SO₄.",
   "1. Dung dịch NaOH hoặc KOH.",
   "2. Dung dịch NaCl.",
   "3. Nước vôi trong Ca(OH)₂."
  ],
  "dap_an_dung": 0,
  "giai_thich": "NH₃ là một base, có khả năng tác dụng mạnh với các acid (như HCl, H₂SO₄) tạo thành muối amoni tan, qua đó loại bỏ được NH₃ khỏi dòng khí thải."
 },
 {
  "id": "bq_1789371866323_7uxh2",
  "loai": "mc",
  "muc": "th",
  "de": "Sản phẩm của phản ứng nhiệt phân nào sau đây là sai?",
  "phuong_an": [
   "0. NH₄HCO₃ → NH₃ + CO₂ + H₂O.",
   "1. NH₄NO₂ → N₂ + 2H₂O.",
   "2. NH₄Cl → NH₃ + HCl.",
   "3. NH₄NO₃ → NH₃ + HNO₃."
  ],
  "dap_an_dung": 3,
  "giai_thich": "Muối ammonium của gốc acid có tính oxi hóa (NO₂⁻, NO₃⁻) bị nhiệt phân kèm oxi hóa – khử nội phân tử: NH₄NO₃ → N₂O + 2H₂O, không tạo NH₃ và HNO₃."
 },
 {
  "id": "bq_1789371866324_469t3",
  "loai": "mc",
  "muc": "th",
  "de": "Ở nhiệt độ cao, khí nitrogen phản ứng với khí hydrogen và khí oxygen theo hai phương trình hóa học sau: N₂ + 3H₂ ⇌ 2NH₃ (t°, xt, p) (1); N₂ + O₂ ⇌ 2NO (t°) (2). Trong các phản ứng (1) và (2), vai trò của N₂ lần lượt là",
  "phuong_an": [
   "0. chất oxi hóa; chất khử.",
   "1. chất khử; chất khử.",
   "2. chất oxi hóa; chất oxi hóa.",
   "3. chất khử; chất oxi hóa."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Ở (1), số oxi hóa N giảm từ 0 xuống −3 (nhận electron) nên N₂ là chất oxi hóa; ở (2), N tăng từ 0 lên +2 (nhường electron) nên N₂ là chất khử."
 },
 {
  "id": "bq_1789371866324_4qcq6",
  "loai": "mc",
  "muc": "nb",
  "de": "Cho vài giọt phenolphthalein vào dung dịch NH₃ thì dung dịch chuyển thành",
  "phuong_an": [
   "0. màu hồng.",
   "1. màu vàng.",
   "2. màu đỏ.",
   "3. màu xanh."
  ],
  "dap_an_dung": 0,
  "giai_thich": "NH₃ + H₂O ⇌ NH₄⁺ + OH⁻ tạo môi trường base nên phenolphthalein chuyển sang màu hồng."
 },
 {
  "id": "bq_1789371866324_6mrli",
  "loai": "mc",
  "muc": "vdc",
  "de": "Trong công nghiệp, người ta sản xuất nitric acid (HNO₃) từ ammonia theo sơ đồ: NH₃ → NO → NO₂ → HNO₃. Để điều chế 150 tấn nitric acid có nồng độ 60% cần dùng bao nhiêu tấn ammonia? Biết hiệu suất của quá trình sản xuất là 76,2%.",
  "phuong_an": [
   "0. 24,3 tấn",
   "1. 31,9 tấn",
   "2. 40,5 tấn",
   "3. 18,5 tấn"
  ],
  "dap_an_dung": 1,
  "giai_thich": "m(HNO₃) = 150·60% = 90 tấn; bảo toàn N: m(NH₃) lí thuyết = 90·17/63 ≈ 24,29 tấn; do hiệu suất 76,2% nên cần 24,29/0,762 ≈ 31,9 tấn."
 },
 {
  "id": "bq_1789371866324_az60b",
  "loai": "mc",
  "muc": "th",
  "de": "Phương trình hóa học nào sau đây sai?",
  "phuong_an": [
   "0. NH₄NO₃ —t°→ NH₃ + HNO₃.",
   "1. NH₄Cl —t°→ NH₃ + HCl.",
   "2. (NH₄)₂CO₃ —t°→ 2NH₃ + CO₂ + H₂O.",
   "3. NH₄HCO₃ —t°→ NH₃ + CO₂ + H₂O."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Gốc NO₃⁻ oxi hóa NH₄⁺ khi đun nóng nên NH₄NO₃ → N₂O + 2H₂O; các muối ammonium của acid không có tính oxi hóa mới phân hủy giải phóng NH₃."
 },
 {
  "id": "bq_1789371866324_gjzyj",
  "loai": "mc",
  "muc": "th",
  "de": "Cho các phát biểu sau: (a) Trong không khí, N₂ chiếm khoảng 78% về thể tích. (b) Phân tử N₂ có chứa liên kết ba bền vững nên N₂ trơ về mặt hóa học ngay cả khi đun nóng. (c) Trong phản ứng giữa N₂ và H₂ thì N₂ vừa là chất oxi hóa, vừa là chất khử. (d) N₂ lỏng có nhiệt độ thấp nên thường được sử dụng để bảo quản thực phẩm. (e) Phần lớn N₂ được sử dụng để tổng hợp NH₃, từ đó sản xuất nitric acid, phân bón,... Số phát biểu đúng là",
  "phuong_an": [
   "0. 2.",
   "1. 3.",
   "2. 4.",
   "3. 5."
  ],
  "dap_an_dung": 1,
  "giai_thich": "(a), (d), (e) đúng; (b) sai vì khi đun nóng N₂ trở nên hoạt động hơn; (c) sai vì với H₂, N₂ chỉ là chất oxi hóa (N: 0 → −3)."
 },
 {
  "id": "bq_1789371866324_kc2n6",
  "loai": "mc",
  "muc": "th",
  "de": "Nạp đầy khí ammonia vào bình thủy tinh trong suốt, đậy bình bằng nút cao su có ống thủy tinh vuốt nhọn xuyên qua, rồi nhúng đầu ống vào chậu nước có pha dung dịch phenolphthalein. Hiện tượng và giải thích nào sau đây đúng?",
  "phuong_an": [
   "0. Nước phun vào bình thành tia màu hồng vì NH₃ tan nhiều làm giảm áp suất trong bình và tạo dung dịch có tính base.",
   "1. Nước không phun vào bình vì NH₃ không tan trong nước.",
   "2. Nước phun vào bình thành tia không màu vì dung dịch NH₃ có tính acid.",
   "3. Nước phun vào bình thành tia màu hồng vì NH₃ có tính khử mạnh."
  ],
  "dap_an_dung": 0,
  "giai_thich": "NH₃ tan rất nhiều trong nước làm áp suất trong bình giảm mạnh nên nước bị hút vào thành tia; dung dịch NH₃ có tính base làm phenolphthalein hóa hồng."
 },
 {
  "id": "bq_1789371866324_o8brx",
  "loai": "mc",
  "muc": "nb",
  "de": "Khi cho dung dịch NaOH vào dung dịch NH₄Cl, đun nóng thì thấy thoát ra",
  "phuong_an": [
   "0. một chất khí màu lục nhạt.",
   "1. một chất khí không màu, mùi khai, làm xanh giấy quỳ tím ẩm.",
   "2. một chất khí màu nâu đỏ, làm xanh giấy quỳ tím ẩm.",
   "3. chất khí không màu, không mùi."
  ],
  "dap_an_dung": 1,
  "giai_thich": "NH₄⁺ + OH⁻ → NH₃↑ + H₂O; NH₃ là khí không màu, mùi khai, có tính base nên làm xanh quỳ tím ẩm."
 },
 {
  "id": "bq_1789371866324_zfh5w",
  "loai": "mc",
  "muc": "th",
  "de": "Tiến hành thí nghiệm: Bước 1: Cho khoảng 2 gam đạm ammonium chloride (NH₄Cl) vào ống nghiệm, thêm khoảng 2 mL nước cất, lắc đều đến khi tan hết. Bước 2: Cho 2 mL dung dịch NaOH đặc vào ống nghiệm, lắc đều rồi đun nhẹ. Bước 3: Đặt mẩu giấy quỳ tím ẩm lên miệng ống nghiệm. Hiện tượng quan sát được ở bước 3 là",
  "phuong_an": [
   "0. giấy quỳ tím ẩm chuyển sang màu đỏ.",
   "1. giấy quỳ tím ẩm chuyển sang màu xanh.",
   "2. giấy quỳ tím ẩm bị mất màu.",
   "3. giấy quỳ tím ẩm không đổi màu."
  ],
  "dap_an_dung": 1,
  "giai_thich": "NH₄Cl + NaOH → NaCl + NH₃↑ + H₂O; khí NH₃ tan vào nước trên giấy ẩm tạo môi trường base nên quỳ tím hóa xanh."
 },
 {
  "id": "bq_1789371866325_0a12u",
  "loai": "mc",
  "muc": "nb",
  "de": "Nhận xét nào sau đây không đúng về muối ammonium?",
  "phuong_an": [
   "0. Muối ammonium bền với nhiệt.",
   "1. Các muối ammonium đều là chất điện li mạnh.",
   "2. Tất cả các muối ammonium đều tan trong nước.",
   "3. Các muối ammonium đều bị thủy phân trong nước."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Muối ammonium kém bền nhiệt, dễ bị nhiệt phân (tạo NH₃ hoặc N₂, N₂O); chúng tan tốt, điện li mạnh và ion NH₄⁺ thủy phân tạo môi trường acid."
 },
 {
  "id": "bq_1789371866325_351fi",
  "loai": "mc",
  "muc": "nb",
  "de": "Chất xúc tác trong phản ứng tổng hợp ammonia là",
  "phuong_an": [
   "0. Fe",
   "1. Al",
   "2. H₂",
   "3. Hg"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Tổng hợp NH₃ theo quy trình Haber dùng xúc tác sắt (Fe) để tăng tốc độ phản ứng ở nhiệt độ vừa phải."
 },
 {
  "id": "bq_1789371866325_3whij",
  "loai": "mc",
  "muc": "nb",
  "de": "Ammonia chủ yếu thể hiện tính ... trong các phản ứng hóa học.",
  "phuong_an": [
   "0. khử",
   "1. base",
   "2. oxi hóa",
   "3. cả A và B đều đúng"
  ],
  "dap_an_dung": 3,
  "giai_thich": "Cặp electron riêng trên N cho NH₃ tính base (nhận H⁺); N có số oxi hóa thấp nhất −3 nên NH₃ có tính khử."
 },
 {
  "id": "bq_1789371866325_4wvwl",
  "loai": "mc",
  "muc": "nb",
  "de": "Ammonia là hợp chất của",
  "phuong_an": [
   "0. oxygen và nitrogen.",
   "1. hydrogen và nitrogen.",
   "2. oxygen và hydrogen.",
   "3. sulfur và nitrogen."
  ],
  "dap_an_dung": 1,
  "giai_thich": "Ammonia có công thức NH₃, gồm 1 nguyên tử nitrogen liên kết với 3 nguyên tử hydrogen."
 },
 {
  "id": "bq_1789371866325_7tp1k",
  "loai": "mc",
  "muc": "nb",
  "de": "Ở điều kiện thường, ammonia là chất",
  "phuong_an": [
   "0. rắn.",
   "1. lỏng.",
   "2. khí.",
   "3. tồn tại ở dạng nhũ tương."
  ],
  "dap_an_dung": 2,
  "giai_thich": "NH₃ là khí không màu, mùi khai ở điều kiện thường (nhiệt độ sôi khoảng −33 °C)."
 },
 {
  "id": "bq_1789371866325_8fiag",
  "loai": "mc",
  "muc": "nb",
  "de": "Khi đun nóng, các muối ammonium dễ ... Từ thích hợp để điền vào chỗ trống là",
  "phuong_an": [
   "0. tạo kết tủa trên thành ống nghiệm",
   "1. tạo NO₂",
   "2. bị phân hủy",
   "3. tan chảy mà không biến đổi"
  ],
  "dap_an_dung": 2,
  "giai_thich": "Muối ammonium kém bền nhiệt, khi đun nóng bị phân hủy (NH₄Cl → NH₃ + HCl, NH₄NO₂ → N₂ + 2H₂O…)."
 },
 {
  "id": "bq_1789371866325_8pes4",
  "loai": "mc",
  "muc": "vd",
  "de": "Thể tích hỗn hợp N₂ và H₂ (đkc, lấy theo đúng tỉ lệ phản ứng) cần lấy để điều chế 102 gam NH₃ với hiệu suất 25% là",
  "phuong_an": [
   "0. 1189,92 lít",
   "1. 594,96 lít",
   "2. 1075,2 lít",
   "3. 297,48 lít"
  ],
  "dap_an_dung": 0,
  "giai_thich": "n(NH₃) = 6 mol cần 3 mol N₂ và 9 mol H₂ theo lí thuyết; do H = 25% nên cần 4 lần: 48 mol khí, V = 48·24,79 = 1189,92 L."
 },
 {
  "id": "bq_1789371866325_a1uba",
  "loai": "mc",
  "muc": "th",
  "de": "Trong các phản ứng sau, phản ứng NH₃ đóng vai trò là chất oxi hóa là",
  "phuong_an": [
   "0. 2NH₃ + H₂O₂ + MnSO₄ → MnO₂ + (NH₄)₂SO₄",
   "1. 2NH₃ + 3Cl₂ → N₂ + 6HCl",
   "2. 4NH₃ + 5O₂ → 4NO + 6H₂O",
   "3. 2NH₃ + 2Na → 2NaNH₂ + H₂"
  ],
  "dap_an_dung": 3,
  "giai_thich": "Chỉ ở phản ứng với Na, hydrogen trong NH₃ giảm số oxi hóa từ +1 về 0 tạo H₂ nên NH₃ là chất oxi hóa; ở các phản ứng còn lại nitrogen bị oxi hóa."
 },
 {
  "id": "bq_1789371866325_cqo5w",
  "loai": "mc",
  "muc": "nb",
  "de": "Muối được dùng làm bột nở trong thực phẩm là",
  "phuong_an": [
   "0. (NH₄)₂CO₃",
   "1. Na₂CO₃",
   "2. NH₄HSO₃",
   "3. NH₄Cl"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Muối ammonium carbonate khi đun nóng phân hủy hoàn toàn thành NH₃, CO₂ và hơi nước làm bánh xốp mà không để lại cặn."
 },
 {
  "id": "bq_1789371866325_g586d",
  "loai": "mc",
  "muc": "th",
  "de": "“Lúa chiêm lấp ló đầu bờ / Hễ nghe tiếng sấm phất cờ mà lên.” Hai câu trên mô tả cho phương trình hóa học nào sau đây?",
  "phuong_an": [
   "0. N₂ + O₂ → 2NO",
   "1. 2NH₃ + CO₂ → (NH₂)₂CO + H₂O",
   "2. 2NO + O₂ → 2NO₂",
   "3. (NH₂)₂CO + 2H₂O → (NH₄)₂CO₃"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Tia sét cung cấp nhiệt độ rất cao để N₂ + O₂ → 2NO, khởi đầu chuỗi tạo HNO₃ và đạm nitrate cho lúa."
 },
 {
  "id": "bq_1789371866325_ks7sb",
  "loai": "mc",
  "muc": "nb",
  "de": "Hợp chất nào sau đây nitrogen có số oxi hóa là −3?",
  "phuong_an": [
   "0. NO",
   "1. N₂O",
   "2. HNO₃",
   "3. NH₄Cl"
  ],
  "dap_an_dung": 3,
  "giai_thich": "Trong NH₄Cl, H có số oxi hóa +1 và Cl là −1 nên N có số oxi hóa −3; NO, N₂O, HNO₃ có N lần lượt là +2, +1, +5."
 },
 {
  "id": "bq_1789371866325_kxryl",
  "loai": "mc",
  "muc": "th",
  "de": "Dãy chất nào sau đây có số oxi hóa của nitrogen tăng dần?",
  "phuong_an": [
   "0. NH₄Cl, N₂, N₂O, NO, HNO₃",
   "1. N₂, NH₄Cl, N₂O, NO, HNO₃",
   "2. HNO₃, NH₄Cl, N₂O, N₂, NO",
   "3. HNO₃, NH₄Cl, N₂O, NO, N₂"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Số oxi hóa của N: NH₄Cl (−3), N₂ (0), N₂O (+1), NO (+2), HNO₃ (+5) nên dãy A tăng dần."
 },
 {
  "id": "bq_1789371866325_l0iou",
  "loai": "mc",
  "muc": "vd",
  "de": "R có oxide cao nhất là R₂O₅; trong hợp chất khí của R với hydrogen có 17,64% khối lượng H. Nguyên tố R là",
  "phuong_an": [
   "0. S",
   "1. P",
   "2. N",
   "3. Cl"
  ],
  "dap_an_dung": 2,
  "giai_thich": "Oxide cao nhất R₂O₅ nên hợp chất với H là RH₃; 3/(R + 3) = 0,1764 cho R ≈ 14, là nitrogen."
 },
 {
  "id": "bq_1789371866325_no297",
  "loai": "mc",
  "muc": "vd",
  "de": "Người ta điều chế khí N₂ từ phản ứng nhiệt phân muối ammonium nitrite: NH₄NO₂ → N₂ + 2H₂O. Biết khi nhiệt phân 32 gam muối thu được 10 gam chất rắn. Hiệu suất của phản ứng này là",
  "phuong_an": [
   "0. 6,67%",
   "1. 75,00%",
   "2. 68,75%",
   "3. 80%"
  ],
  "dap_an_dung": 2,
  "giai_thich": "Sản phẩm đều là khí và hơi nên 10 g chất rắn còn lại là NH₄NO₂ chưa phân hủy; lượng đã phân hủy là 22 g, H = 22/32 = 68,75%."
 },
 {
  "id": "bq_1789371866325_nuvts",
  "loai": "mc",
  "muc": "th",
  "de": "Khí nitrogen có thể được tạo thành bằng phản ứng hóa học nào sau đây?",
  "phuong_an": [
   "0. Đốt cháy NH₃ trong oxygen khi có mặt chất xúc tác Pt.",
   "1. Nhiệt phân NH₄NO₃.",
   "2. Nhiệt phân AgNO₃.",
   "3. Nhiệt phân NH₄NO₂."
  ],
  "dap_an_dung": 3,
  "giai_thich": "NH₄NO₂ → N₂ + 2H₂O; đốt NH₃ có xúc tác Pt tạo NO, nhiệt phân NH₄NO₃ tạo N₂O, nhiệt phân AgNO₃ tạo Ag, NO₂ và O₂."
 },
 {
  "id": "bq_1789371866325_q5yal",
  "loai": "mc",
  "muc": "nb",
  "de": "Nhận định nào sau đây đúng khi nói về cấu trúc của phân tử NH₃?",
  "phuong_an": [
   "0. Nguyên tử hydrogen ở đỉnh, đáy là một tam giác mà đỉnh là 2 nguyên tử hydrogen và 1 nguyên tử nitrogen.",
   "1. Nguyên tử hydrogen ở đỉnh, đáy là một tam giác đều mà đỉnh là 2 nguyên tử hydrogen và 1 nguyên tử nitrogen.",
   "2. Nguyên tử nitrogen ở đỉnh, đáy là một tam giác mà đỉnh là 3 nguyên tử hydrogen.",
   "3. Nguyên tử nitrogen ở đỉnh, đáy là một tam giác đều mà đỉnh là 3 nguyên tử hydrogen."
  ],
  "dap_an_dung": 3,
  "giai_thich": "NH₃ có dạng chóp tam giác: N ở đỉnh, ba nguyên tử H giống nhau nằm ở ba đỉnh của đáy tam giác đều."
 },
 {
  "id": "bq_1789371866325_qq6hw",
  "loai": "mc",
  "muc": "nb",
  "de": "Trong các phát biểu sau về tính chất vật lí của ammonia, phát biểu nào không đúng?",
  "phuong_an": [
   "0. Là chất khí không màu.",
   "1. Có mùi khai và xốc.",
   "2. Nhẹ hơn không khí.",
   "3. Ít tan trong nước."
  ],
  "dap_an_dung": 3,
  "giai_thich": "NH₃ tan rất nhiều trong nước (khoảng 700 thể tích NH₃ trong 1 thể tích nước) nhờ tạo liên kết hydrogen với nước."
 },
 {
  "id": "bq_1789371866325_rb43m",
  "loai": "mc",
  "muc": "nb",
  "de": "Trong công nghiệp, khí nitrogen được sản xuất bằng cách",
  "phuong_an": [
   "0. chưng cất phân đoạn không khí lỏng.",
   "1. nhiệt phân NH₄NO₃.",
   "2. dùng phương pháp dời nước.",
   "3. nhiệt phân HNO₃."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Không khí được hóa lỏng rồi chưng cất phân đoạn; N₂ có nhiệt độ sôi thấp hơn O₂ nên bay hơi trước và được thu riêng."
 },
 {
  "id": "bq_1789371866325_rofup",
  "loai": "mc",
  "muc": "nb",
  "de": "Khi có sấm sét, nitrogen trong không khí có vai trò cung cấp ... cho cây trồng. Cụm từ phù hợp điền vào chỗ trống là",
  "phuong_an": [
   "0. đạm nhân tạo",
   "1. đạm tự nhiên",
   "2. phân NPK",
   "3. phân lân"
  ],
  "dap_an_dung": 1,
  "giai_thich": "Sấm sét giúp N₂ chuyển thành NO → NO₂ → HNO₃ theo nước mưa xuống đất tạo nitrate, là nguồn đạm tự nhiên cho cây."
 },
 {
  "id": "bq_1789371866325_rs5mf",
  "loai": "mc",
  "muc": "nb",
  "de": "Ở điều kiện thường, nitrogen là",
  "phuong_an": [
   "0. chất khí không màu.",
   "1. chất lỏng màu vàng nhạt.",
   "2. chất rắn màu đen.",
   "3. huyền phù."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Ở điều kiện thường, N₂ là khí không màu, không mùi, không vị, hơi nhẹ hơn không khí."
 },
 {
  "id": "bq_1789371866325_sfa16",
  "loai": "mc",
  "muc": "vdc",
  "de": "Cho phản ứng: N₂ + 3H₂ ⇌ 2NH₃. Sau một thời gian, nồng độ các chất là [N₂] = 2,5 mol/L; [H₂] = 1,5 mol/L; [NH₃] = 2 mol/L (ban đầu không có NH₃). Nồng độ ban đầu của N₂ và H₂ lần lượt là",
  "phuong_an": [
   "0. 2,5 M và 4,5 M",
   "1. 3,5 M và 2,5 M",
   "2. 1,5 M và 3,5 M",
   "3. 3,5 M và 4,5 M"
  ],
  "dap_an_dung": 3,
  "giai_thich": "Tạo 2 M NH₃ cần 1 M N₂ và 3 M H₂ nên ban đầu [N₂] = 2,5 + 1 = 3,5 M, [H₂] = 1,5 + 3 = 4,5 M."
 },
 {
  "id": "bq_1789371866325_xqzs4",
  "loai": "mc",
  "muc": "th",
  "de": "Trong phòng thí nghiệm, để điều chế nitrogen người ta nhiệt phân NH₄NO₂, nhưng thực tế do chất này kém bền, khó bảo quản nên người ta thường trộn hai dung dịch X và Y rồi đun nóng. X, Y là",
  "phuong_an": [
   "0. NaNO₂ và NH₄Cl",
   "1. KNO₂ và NH₄NO₃",
   "2. NaNO₂ và NH₄NO₃",
   "3. KNO₂ và NaCl"
  ],
  "dap_an_dung": 0,
  "giai_thich": "NaNO₂ + NH₄Cl → NaCl + NH₄NO₂, sau đó NH₄NO₂ → N₂ + 2H₂O khi đun nóng; đây là cách điều chế N₂ thông dụng trong phòng thí nghiệm."
 },
 {
  "id": "bq_1789371866325_ykuyw",
  "loai": "mc",
  "muc": "th",
  "de": "Nitrogen có thể tác dụng với chất nào sau đây để tạo ra hợp chất khí?",
  "phuong_an": [
   "0. Hydrogen.",
   "1. Oxygen.",
   "2. Sodium.",
   "3. Cả A và B đều đúng."
  ],
  "dap_an_dung": 3,
  "giai_thich": "N₂ + 3H₂ ⇌ 2NH₃ và N₂ + O₂ ⇌ 2NO đều tạo hợp chất khí; phản ứng với kim loại tạo nitride là chất rắn."
 },
 {
  "id": "bq_1789371866326_15bfa",
  "loai": "mc",
  "muc": "vd",
  "de": "Có 2 dung dịch A, B. Mỗi dung dịch chỉ chứa 2 cation và 2 anion (không trùng lặp giữa các loại ion) trong số các ion gồm K⁺ (0,15 mol), H⁺ (0,2 mol), Mg²⁺ (0,1 mol), NH₄⁺ (0,25 mol), Cl⁻ (0,1 mol), SO₄²⁻ (0,075 mol), NO₃⁻ (0,25 mol), CO₃²⁻ (0,15 mol). Làm bay hơi (không xảy ra phản ứng hóa học) 2 dung dịch A, B thì thu được chất rắn khan lần lượt là",
  "phuong_an": [
   "0. 22,9 gam và 12,7 gam",
   "1. 25,4 gam và 25,3 gam",
   "2. 22,9 gam và 25,3 gam",
   "3. 25,4 gam và 12,7 gam"
  ],
  "dap_an_dung": 2,
  "giai_thich": "CO₃²⁻ không cùng tồn tại với H⁺ và Mg²⁺ nên A gồm K⁺, NH₄⁺, CO₃²⁻, Cl⁻ (22,9 gam) và B gồm H⁺, Mg²⁺, SO₄²⁻, NO₃⁻ (25,3 gam); cả hai đều thỏa mãn bảo toàn điện tích."
 },
 {
  "id": "bq_1789371866326_5cxcq",
  "loai": "mc",
  "muc": "vdc",
  "de": "Muối ammonium dichromate bị nhiệt phân theo phương trình (NH₄)₂Cr₂O₇ → Cr₂O₃ + N₂ + 4H₂O. Khi nhiệt phân 48 gam muối này thấy còn 30 gam hỗn hợp chất rắn gồm sản phẩm rắn và tạp chất không bị biến đổi. Phần trăm tạp chất trong muối là",
  "phuong_an": [
   "0. 8,5",
   "1. 6,5",
   "2. 7,5",
   "3. 5,5"
  ],
  "dap_an_dung": 3,
  "giai_thich": "Gọi khối lượng tạp chất là t gam: 152(48 − t)/252 + t = 30 cho t = 2,64 gam, ứng với 2,64/48 = 5,5%."
 },
 {
  "id": "bq_1789371866326_fynw6",
  "loai": "mc",
  "muc": "vd",
  "de": "Trộn 300 mL dung dịch NaNO₂ 2 M với 200 mL dung dịch NH₄Cl 2 M rồi đun nóng cho đến khi phản ứng xảy ra hoàn toàn. Thể tích khí thu được ở đkc là",
  "phuong_an": [
   "0. 22,4 lít",
   "1. 13,44 lít",
   "2. 9,916 lít",
   "3. 1,12 lít"
  ],
  "dap_an_dung": 2,
  "giai_thich": "NH₄⁺ + NO₂⁻ → N₂ + 2H₂O; NH₄Cl 0,4 mol thiếu so với NaNO₂ 0,6 mol nên N₂ = 0,4 mol, V = 0,4·24,79 = 9,916 L."
 },
 {
  "id": "bq_1789371866326_tk1ru",
  "loai": "mc",
  "muc": "vd",
  "de": "Cho 2,3 gam Na vào 200 mL dung dịch (NH₄)₂SO₄ 1 M. Đun nóng thu được V lít khí (đkc). Giá trị của V là",
  "phuong_an": [
   "0. 1,12",
   "1. 2,24",
   "2. 3,7185",
   "3. 10,08"
  ],
  "dap_an_dung": 2,
  "giai_thich": "Na 0,1 mol tác dụng với nước cho 0,05 mol H₂ và 0,1 mol NaOH; NaOH đẩy được 0,1 mol NH₃ từ lượng NH₄⁺ đang dư, tổng 0,15 mol khí nên V = 0,15·24,79 = 3,7185 L."
 },
 {
  "id": "bq_1789371866326_xr622",
  "loai": "mc",
  "muc": "vd",
  "de": "Thể tích khí N₂ (ở đkc) thu được khi nhiệt phân hoàn toàn 16 gam NH₄NO₂ là",
  "phuong_an": [
   "0. 0,56 lít.",
   "1. 11,20 lít.",
   "2. 1,2395 lít.",
   "3. 6,1975 lít."
  ],
  "dap_an_dung": 3,
  "giai_thich": "M(NH₄NO₂) = 64 nên n = 0,25 mol; NH₄NO₂ → N₂ + 2H₂O cho 0,25 mol N₂, V = 0,25·24,79 = 6,1975 L."
 },
 {
  "id": "bq_1789371866328_kjnh3",
  "loai": "mc",
  "muc": "th",
  "de": "Cho các chất NH₃, N₂, NO₂, HNO₃. Chất nào chỉ thể hiện tính oxi hóa trong các phản ứng hóa học?",
  "phuong_an": [
   "0. NH₃",
   "1. N₂",
   "2. NO₂",
   "3. HNO₃"
  ],
  "dap_an_dung": 3,
  "giai_thich": "Trong HNO₃, nitrogen ở số oxi hóa cao nhất +5 nên chỉ có thể giảm số oxi hóa, tức chỉ thể hiện tính oxi hóa."
 },
 {
  "id": "bq_1789371866328_nq31k",
  "loai": "mc",
  "muc": "vd",
  "de": "Cho 7,437 lít nitrogen (đkc) phản ứng với hydrogen dư có chất xúc tác thích hợp một thời gian để điều chế ammonia. Biết hiệu suất phản ứng là 20%, thể tích ammonia thu được (đkc) là",
  "phuong_an": [
   "0. 2,9748 lít",
   "1. 1,4874 lít",
   "2. 5,9496 lít",
   "3. 7,437 lít"
  ],
  "dap_an_dung": 0,
  "giai_thich": "n(N₂) = 7,437/24,79 = 0,3 mol; với hiệu suất 20% thì 0,06 mol N₂ phản ứng cho 0,12 mol NH₃, V = 0,12·24,79 = 2,9748 L."
 },
 {
  "id": "bq_1789372198145_g7rz2",
  "loai": "mc",
  "muc": "nb",
  "de": "Trong tự nhiên, phản ứng giữa nitrogen và oxygen (trong cơn mưa dông kèm sấm sét) là khởi đầu cho quá trình tạo và cung cấp loại phân bón nào cho cây?",
  "phuong_an": [
   "0. Phân đạm nitrate.",
   "1. Phân đạm ammonium.",
   "2. Phân kali.",
   "3. Phân lân."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Tia sét cung cấp năng lượng cho N₂ + O₂ → 2NO; NO → NO₂ → HNO₃ theo nước mưa xuống đất tạo ion NO₃⁻, chính là đạm nitrate."
 },
 {
  "id": "bq_1789372198145_llu8q",
  "loai": "mc",
  "muc": "th",
  "de": "Cho các nhận định sau: Phân tử ammonia và ion ammonium đều (1) chứa liên kết cộng hóa trị; (2) là base Brønsted trong nước; (3) là acid Brønsted trong nước; (4) chứa nguyên tử N có số oxi hóa −3. Số nhận định đúng là",
  "phuong_an": [
   "0. 1.",
   "1. 4.",
   "2. 3.",
   "3. 2."
  ],
  "dap_an_dung": 3,
  "giai_thich": "NH₃ và NH₄⁺ đều có liên kết cộng hóa trị N−H và N có số oxi hóa −3; nhưng NH₃ là base (nhận H⁺) còn NH₄⁺ là acid (cho H⁺) nên (2), (3) sai."
 },
 {
  "id": "bq_1789372198146_0yu4k",
  "loai": "mc",
  "muc": "nb",
  "de": "Dạng hình học của phân tử ammonia là",
  "phuong_an": [
   "0. hình chóp tam giác.",
   "1. hình tứ diện.",
   "2. hình tam giác đều.",
   "3. đường thẳng."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Nguyên tử N tạo 3 liên kết N−H và còn 1 cặp electron riêng nên phân tử NH₃ có dạng chóp tam giác, N ở đỉnh."
 },
 {
  "id": "bq_1789372198146_dkfky",
  "loai": "mc",
  "muc": "nb",
  "de": "Có thể nhận biết muối ammonium bằng cách cho muối tác dụng với dung dịch kiềm đặc, đun nóng thấy thoát ra khí X. Khí X là",
  "phuong_an": [
   "0. NO.",
   "1. NH₃.",
   "2. H₂.",
   "3. NO₂."
  ],
  "dap_an_dung": 1,
  "giai_thich": "NH₄⁺ + OH⁻ → NH₃↑ + H₂O khi đun nóng; khí NH₃ có mùi khai và làm xanh quỳ tím ẩm."
 },
 {
  "id": "bq_1789372198146_e1eei",
  "loai": "mc",
  "muc": "th",
  "de": "Phát biểu nào sau đây về ammonia là đúng?",
  "phuong_an": [
   "0. Quá trình tổng hợp ammonia từ nitrogen và hydrogen đạt hiệu suất 100%.",
   "1. Ammonia là chất khí nặng hơn không khí.",
   "2. Phần lớn ammonia được dùng phản ứng với acid để sản xuất các loại phân đạm.",
   "3. Ammonia không tan trong nước."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Tổng hợp NH₃ là phản ứng thuận nghịch nên không đạt hiệu suất 100%; NH₃ (M = 17) nhẹ hơn không khí, tan rất nhiều trong nước và chủ yếu dùng sản xuất phân đạm."
 },
 {
  "id": "bq_1789372198146_e7nij",
  "loai": "mc",
  "muc": "th",
  "de": "Cho các phát biểu về chu trình nitrogen trong tự nhiên: (1) Thực vật đồng hóa nitrogen bằng cách hấp thụ chủ yếu ở dạng nitrate (NO₃⁻) và muối ammonium (NH₄⁺) qua rễ cây, chuyển hóa chúng thành protein thực vật. (2) Động vật đồng hóa protein thực vật tạo ra protein động vật. (3) Trong khí quyển, phản ứng tạo ra NO từ nitrogen và oxygen khi có sấm sét được coi là khởi đầu cho quá trình cung cấp đạm cho đất. (4) Chu trình của nitrogen trong tự nhiên là một chu trình tuần hoàn khép kín. Số phát biểu đúng là",
  "phuong_an": [
   "0. 2.",
   "1. 1.",
   "2. 4.",
   "3. 3."
  ],
  "dap_an_dung": 2,
  "giai_thich": "Nitrogen đi từ khí quyển xuống đất (nhờ sấm sét, vi khuẩn), vào thực vật dưới dạng NO₃⁻, NH₄⁺, sang động vật qua chuỗi thức ăn rồi trở lại khí quyển nhờ vi khuẩn phân hủy, nên cả bốn phát biểu đều đúng."
 },
 {
  "id": "bq_1789372198146_hp47t",
  "loai": "mc",
  "muc": "vd",
  "de": "Trong công nghiệp, ammonia được tổng hợp từ nitrogen và hydrogen. Cho 14,874 L N₂ (đkc) tác dụng với lượng dư khí H₂. Biết hiệu suất của phản ứng là 30%, khối lượng NH₃ tạo thành là",
  "phuong_an": [
   "0. 20,4 gam",
   "1. 6,12 gam",
   "2. 3,06 gam",
   "3. 12,24 gam"
  ],
  "dap_an_dung": 1,
  "giai_thich": "n(N₂) = 14,874/24,79 = 0,6 mol; N₂ + 3H₂ ⇌ 2NH₃ nên n(NH₃) = 0,6·2·30% = 0,36 mol, m = 0,36·17 = 6,12 g."
 },
 {
  "id": "bq_1789372198146_qc4mr",
  "loai": "mc",
  "muc": "nb",
  "de": "Trong các ứng dụng: (1) Sản xuất phân bón (đạm ammonium,...); (2) Sản xuất nitric acid; (3) Sử dụng như một chất làm lạnh trong các hệ thống làm lạnh công nghiệp; (4) Làm dung môi; (5) Làm môi trường trơ trong một số ngành công nghiệp. Các ứng dụng của ammonia là",
  "phuong_an": [
   "0. (2); (3); (4).",
   "1. (1); (2); (3); (4).",
   "2. (1); (2); (4); (5).",
   "3. (2); (3); (5)."
  ],
  "dap_an_dung": 1,
  "giai_thich": "Ammonia dùng sản xuất phân đạm, nitric acid, làm chất làm lạnh và dung môi (ammonia lỏng); tạo môi trường trơ là ứng dụng của N₂ vì N₂ kém hoạt động còn NH₃ khá hoạt động."
 },
 {
  "id": "bq_1789372198146_tkc2b",
  "loai": "mc",
  "muc": "nb",
  "de": "Trong khí quyển, nguyên tố nitrogen tồn tại chủ yếu dưới dạng chất nào sau đây?",
  "phuong_an": [
   "0. NO₂.",
   "1. N₂.",
   "2. NH₃.",
   "3. NO."
  ],
  "dap_an_dung": 1,
  "giai_thich": "Nitrogen trong khí quyển tồn tại chủ yếu ở dạng đơn chất N₂, chiếm khoảng 78% thể tích không khí."
 },
 {
  "id": "bq_1789372198147_519y5",
  "loai": "mc",
  "muc": "nb",
  "de": "Phát biểu nào sau đây không đúng?",
  "phuong_an": [
   "0. Trong điều kiện thường, NH₃ là khí không màu, mùi khai.",
   "1. Khí NH₃ nhẹ hơn không khí.",
   "2. Phân tử NH₃ chứa các liên kết cộng hóa trị không phân cực.",
   "3. Khí NH₃ tan nhiều trong nước."
  ],
  "dap_an_dung": 2,
  "giai_thich": "N có độ âm điện lớn hơn H nhiều nên liên kết N−H là liên kết cộng hóa trị phân cực."
 },
 {
  "id": "bq_1789372198147_e1bob",
  "loai": "mc",
  "muc": "nb",
  "de": "Khí ammonia làm giấy quỳ tím ẩm",
  "phuong_an": [
   "0. chuyển thành màu xanh.",
   "1. không đổi màu.",
   "2. mất màu.",
   "3. chuyển thành màu đỏ."
  ],
  "dap_an_dung": 0,
  "giai_thich": "NH₃ tan vào nước trên giấy ẩm: NH₃ + H₂O ⇌ NH₄⁺ + OH⁻ tạo môi trường base nên quỳ tím hóa xanh."
 },
 {
  "id": "bq_1789372198147_fn50k",
  "loai": "mc",
  "muc": "vd",
  "de": "Cho sơ đồ chuyển hóa: X —(+O₂)→ Y —(+O₂)→ Z —(+O₂ + H₂O)→ W. Biết X, Y, Z, W đều chứa nitrogen; X và W có thể phản ứng với nhau tạo thành muối tan trong nước. Chất X phù hợp với sơ đồ trên là",
  "phuong_an": [
   "0. NO₂.",
   "1. NH₃.",
   "2. NO.",
   "3. HNO₃."
  ],
  "dap_an_dung": 1,
  "giai_thich": "NH₃ → NO → NO₂ → HNO₃ là chuỗi oxi hóa trong sản xuất nitric acid; NH₃ (base) phản ứng với HNO₃ (acid) tạo muối tan NH₄NO₃."
 },
 {
  "id": "bq_1789372198151_bpeaz",
  "loai": "mc",
  "muc": "nb",
  "de": "Trong công nghiệp, phần lớn lượng nitrogen sản xuất ra được dùng để",
  "phuong_an": [
   "0. làm môi trường trơ trong luyện kim, điện tử,...",
   "1. tổng hợp phân đạm.",
   "2. sản xuất nitric acid.",
   "3. tổng hợp ammonia."
  ],
  "dap_an_dung": 3,
  "giai_thich": "Phần lớn N₂ được dùng tổng hợp NH₃; từ NH₃ mới sản xuất nitric acid và các loại phân đạm."
 },
 {
  "id": "bq_1789372198151_ey4sc",
  "loai": "mc",
  "muc": "nb",
  "de": "Phát biểu không đúng là",
  "phuong_an": [
   "0. Trong điều kiện thường, NH₃ là khí không màu, mùi khai.",
   "1. Khí NH₃ nặng hơn không khí.",
   "2. Khí NH₃ dễ hóa lỏng, tan nhiều trong nước.",
   "3. Liên kết giữa N và 3 nguyên tử H là liên kết cộng hóa trị có cực."
  ],
  "dap_an_dung": 1,
  "giai_thich": "M(NH₃) = 17 nhỏ hơn 29 nên NH₃ nhẹ hơn không khí; NH₃ tạo liên kết hydrogen nên dễ hóa lỏng và tan nhiều trong nước."
 },
 {
  "id": "bq_1789372198151_i7yub",
  "loai": "mc",
  "muc": "vd",
  "de": "Cho dung dịch NH₄NO₃ tác dụng với dung dịch kiềm của một kim loại hóa trị II, thu được 4,958 lít khí (ở đkc) và 26,1 gam muối. Kim loại đó là",
  "phuong_an": [
   "0. Ca (40).",
   "1. Mg (24).",
   "2. Cu (64).",
   "3. Ba (137)."
  ],
  "dap_an_dung": 3,
  "giai_thich": "n(NH₃) = 4,958/24,79 = 0,2 mol; 2NH₄NO₃ + M(OH)₂ → M(NO₃)₂ + 2NH₃ + 2H₂O nên n(muối) = 0,1 mol, M(muối) = 261 = M + 124, suy ra M = 137 (Ba)."
 },
 {
  "id": "bq_1789372198151_ppzw3",
  "loai": "mc",
  "muc": "th",
  "de": "Trong những nhận xét dưới đây, nhận xét nào là đúng?",
  "phuong_an": [
   "0. Nitrogen không duy trì sự cháy, sự hô hấp và là một khí độc.",
   "1. Vì có liên kết ba nên phân tử nitrogen rất bền và ở nhiệt độ thường nitrogen khá trơ về mặt hóa học.",
   "2. Khi tác dụng với kim loại hoạt động, nitrogen thể hiện tính khử.",
   "3. Số oxi hóa của nitrogen trong AlN, N₂O₄, NH₄⁺, NO₃⁻, NO₂⁻ lần lượt là −3, +4, −3, +5, +4."
  ],
  "dap_an_dung": 1,
  "giai_thich": "N₂ không độc; khi tác dụng với kim loại, N nhận electron (tính oxi hóa); trong NO₂⁻ nitrogen có số oxi hóa +3 chứ không phải +4."
 },
 {
  "id": "bq_1789372198151_rnyiu",
  "loai": "mc",
  "muc": "vd",
  "de": "Trong công nghiệp, nitric acid được dùng để sản xuất phân bón ammonium nitrate theo phương trình: NH₃ + HNO₃ → NH₄NO₃. Để sản xuất 7,84 kg loại phân trên với hiệu suất 98% thì lượng nitric acid cần dùng là",
  "phuong_an": [
   "0. 6,3 kg.",
   "1. 5,67 kg.",
   "2. 5,04 kg.",
   "3. 6,93 kg."
  ],
  "dap_an_dung": 0,
  "giai_thich": "n(NH₄NO₃) = 7,84/80 = 0,098 kmol; do hiệu suất 98% nên n(HNO₃) = 0,098/0,98 = 0,1 kmol, m = 0,1·63 = 6,3 kg."
 },
 {
  "id": "bq_1789372198151_wb0jn",
  "loai": "mc",
  "muc": "nb",
  "de": "Nhúng 2 đũa thủy tinh vào 2 bình đựng dung dịch HCl đặc và NH₃ đặc. Sau đó đưa 2 đũa lại gần nhau thì thấy xuất hiện",
  "phuong_an": [
   "0. khói màu trắng.",
   "1. khói màu tím.",
   "2. khói màu nâu.",
   "3. khói màu vàng."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Khí HCl và NH₃ bay hơi gặp nhau tạo các tinh thể NH₄Cl rất nhỏ lơ lửng như khói trắng: NH₃ + HCl → NH₄Cl."
 },
 {
  "id": "bq_1789372198152_jep2q",
  "loai": "mc",
  "muc": "vd",
  "de": "Một hỗn hợp gồm hai khí H₂ và N₂ theo tỉ lệ mol là 4 : 1. Nung với xúc tác ở nhiệt độ cao thu được hỗn hợp khí Y, trong đó NH₃ chiếm 20% thể tích. Hiệu suất của phản ứng là",
  "phuong_an": [
   "0. 20%",
   "1. 25%",
   "2. 41,67%",
   "3. 50%"
  ],
  "dap_an_dung": 2,
  "giai_thich": "Lấy 1 mol N₂ và 4 mol H₂ (N₂ thiếu so với tỉ lệ 1 : 3 nên tính hiệu suất theo N₂); nếu x mol N₂ phản ứng: 2x/(5 − 2x) = 0,2 nên x ≈ 0,4167, H ≈ 41,67%."
 },
 {
  "id": "bq_1789372198152_q4uq7",
  "loai": "mc",
  "muc": "vdc",
  "de": "Để điều chế 5 lít dung dịch HNO₃ 21% (D = 1,2 g/mL) bằng phương pháp oxi hóa NH₃ với hiệu suất toàn quá trình là 75%, thể tích khí NH₃ (đkc) tối thiểu cần dùng là",
  "phuong_an": [
   "0. 495,8 L",
   "1. 661,1 L",
   "2. 371,9 L",
   "3. 881,4 L"
  ],
  "dap_an_dung": 1,
  "giai_thich": "m(HNO₃) = 5000·1,2·21% = 1260 g = 20 mol; bảo toàn N cần 20 mol NH₃ lí thuyết, thực tế 20/0,75 ≈ 26,67 mol, V = 26,67·24,79 ≈ 661,1 L."
 },
 {
  "id": "bq_1789372198153_jh8yn",
  "loai": "mc",
  "muc": "th",
  "de": "Xét cân bằng hóa học: NH₃ + H₂O ⇌ NH₄⁺ + OH⁻. Cân bằng sẽ chuyển dịch theo chiều thuận khi cho thêm vài giọt dung dịch nào sau đây?",
  "phuong_an": [
   "0. NH₄Cl.",
   "1. NaOH.",
   "2. HCl.",
   "3. NaCl."
  ],
  "dap_an_dung": 2,
  "giai_thich": "HCl cung cấp H⁺ trung hòa OH⁻ làm giảm nồng độ OH⁻ nên cân bằng chuyển dịch theo chiều thuận; NH₄Cl, NaOH làm tăng NH₄⁺, OH⁻ nên đẩy cân bằng theo chiều nghịch."
 },
 {
  "id": "bq_1789372198153_o4bmz",
  "loai": "mc",
  "muc": "nb",
  "de": "Tính base của NH₃ là do",
  "phuong_an": [
   "0. trên nguyên tử N còn một cặp electron tự do.",
   "1. phân tử có 3 liên kết cộng hóa trị phân cực.",
   "2. NH₃ tan được nhiều trong nước.",
   "3. NH₃ tác dụng với nước tạo NH₄OH."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Cặp electron riêng trên N nhận được H⁺, tạo liên kết cho – nhận hình thành NH₄⁺; đó là bản chất tính base Brønsted của NH₃."
 },
 {
  "id": "bq_1789372198153_r2s0a",
  "loai": "mc",
  "muc": "th",
  "de": "Có các loại phân bón như NH₄Cl, NH₄NO₃, (NH₄)₂SO₄. Các loại phân bón này không thích hợp bón cho đất nào sau đây?",
  "phuong_an": [
   "0. Đất chua.",
   "1. Đất phù sa.",
   "2. Đất bạc màu.",
   "3. Đất nghèo dinh dưỡng."
  ],
  "dap_an_dung": 0,
  "giai_thich": "Ion NH₄⁺ thủy phân tạo H₃O⁺ (môi trường acid) nên bón các phân ammonium làm đất chua càng chua thêm."
 },
 {
  "id": "bq_1789372198153_txabl",
  "loai": "mc",
  "muc": "vdc",
  "de": "Hỗn hợp X gồm N₂ và H₂ có khối lượng mol trung bình bằng 12,4. Dẫn X đi qua bình đựng bột Fe rồi nung nóng (hiệu suất tổng hợp NH₃ đạt 40%), thu được hỗn hợp Y. Khối lượng mol trung bình của Y là",
  "phuong_an": [
   "0. 12,4",
   "1. 14,8",
   "2. 15,5",
   "3. 13,6"
  ],
  "dap_an_dung": 1,
  "giai_thich": "Từ M̄ = 12,4 suy ra n(N₂) : n(H₂) = 2 : 3; lấy 2 mol N₂, 3 mol H₂, H₂ thiếu nên phản ứng 1,2 mol H₂ tạo 0,8 mol NH₃; n(Y) = 5 − 0,8 = 4,2 mol, m = 62 g, M̄(Y) = 62/4,2 ≈ 14,8."
 },
 {
  "id": "bq_1789373737083_kutye",
  "loai": "mc",
  "muc": "th",
  "de": "Ammonia (NH₃) tan nhiều trong nước do",
  "phuong_an": [
   "0. NH₃ là phân tử không phân cực, có khả năng tạo tương tác van der Waals với nước.",
   "1. phân tử NH₃ phân cực và tạo được liên kết hydrogen với nước.",
   "2. NH₃ tồn tại ở trạng thái khí, có khả năng tạo liên kết cộng hóa trị với nước.",
   "3. NH₃ nhẹ hơn không khí nên dễ khuếch tán vào nước."
  ],
  "dap_an_dung": 1,
  "giai_thich": "Phân tử NH₃ có cặp electron riêng và ba liên kết N−H phân cực nên phân tử phân cực, tạo được liên kết hydrogen bền với nước."
 },
 {
  "id": "bq_1789373737083_ludvr",
  "loai": "mc",
  "muc": "vd",
  "de": "[Hình: sơ đồ chuyển hóa giữa nitrogen và hợp chất. Hàng trên: N₂ → NH₃ (mũi tên ghi (I)) → NO (mũi tên ghi (1)) → NO₂ (mũi tên ghi (2) và (II)) → HNO₃ (mũi tên ghi (3) và (III)). Ngoài ra có một mũi tên đi từ N₂ vòng xuống dưới rồi chỉ lên NO.] Phát biểu nào sau đây không đúng?",
  "phuong_an": [
   "0. Nitrogen dioxide có thể trực tiếp tạo thành khi nitrogen phản ứng với oxygen dư.",
   "1. Quá trình (I) → (II) → (III) giải thích sự tạo thành nitric acid khi mưa dông kèm sấm chớp.",
   "2. Các phản ứng trong sơ đồ đều là phản ứng oxi hóa – khử.",
   "3. Quá trình (1) → (2) → (3) dùng để sản xuất nitric acid trong công nghiệp."
  ],
  "dap_an_dung": 0,
  "giai_thich": "N₂ tác dụng với O₂ ở nhiệt độ rất cao chỉ tạo NO; muốn có NO₂ thì NO phải tiếp tục bị O₂ oxi hóa nên không có con đường trực tiếp N₂ → NO₂."
 },
 {
  "id": "bq_1789373737083_lznfe",
  "loai": "mc",
  "muc": "vd",
  "de": "[Hình: sơ đồ chuyển hóa hình chữ nhật, mỗi mũi tên là một phản ứng. Góc trên trái là N₂, mũi tên (2) đi sang phải tới NH₃ ở góc trên phải; mũi tên (1) đi thẳng xuống từ N₂ tới NO₂ ở góc dưới trái; mũi tên (3) đi thẳng xuống từ NH₃ tới NO ở góc dưới phải; mũi tên (4) đi từ NO sang trái tới NO₂.] Phản ứng không thể thực hiện được trong sơ đồ trên là",
  "phuong_an": [
   "0. (4)",
   "1. (1)",
   "2. (2)",
   "3. (3)"
  ],
  "dap_an_dung": 1,
  "giai_thich": "Phản ứng (1) đòi hỏi N₂ tác dụng trực tiếp với O₂ tạo NO₂, điều không xảy ra vì sản phẩm của N₂ và O₂ chỉ là NO."
 },
 {
  "id": "bq_1789373737083_mec52",
  "loai": "mc",
  "muc": "th",
  "de": "Trong các hợp chất hóa học sau, hợp chất nào nitrogen có số oxi hóa thấp nhất?",
  "phuong_an": [
   "0. (NH₄)₂SO₄",
   "1. N₂",
   "2. NO₂",
   "3. HNO₂"
  ],
  "dap_an_dung": 0,
  "giai_thich": "Trong ion NH₄⁺, nitrogen có số oxi hóa −3 là mức thấp nhất; N₂ có mức 0, NO₂ có +4 và HNO₂ có +3."
 }
]
```
