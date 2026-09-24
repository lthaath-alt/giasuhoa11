# Đề dẫn soát nội dung — 93 câu

Mở tệp này trong Antigravity rồi bảo nó: *"làm đúng yêu cầu trong tệp,
ghi kết quả ra `docs/soat-hoa-hoc/tra-loi-2026-09-22-1946-bai-2-loai-tf-1.json`"*.

**Rồi làm lại LẦN NỮA**, trong một phiên mới, ghi ra
`docs/soat-hoa-hoc/tra-loi-2026-09-22-1946-bai-2-loai-tf-2.json`. Một lượt soát
KHÔNG đủ: đo 20/09/2026, cùng 16 câu chạy ba lượt cho ra 3, 3, rồi 0 câu
nghi ngờ — và ba câu bị bỏ sót ở lượt thứ ba là lỗi THẬT.

Xong thì nạp CẢ HAI, ngăn bằng dấu phẩy, KHÔNG có dấu cách:

```bash
npm run soat:hoa-hoc -- --nap docs/soat-hoa-hoc/tra-loi-2026-09-22-1946-bai-2-loai-tf-1.json,docs/soat-hoa-hoc/tra-loi-2026-09-22-1946-bai-2-loai-tf-2.json
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
  "id": "bq_1788161296549_7tve2",
  "loai": "tf",
  "muc": "th",
  "de": "Xét cân bằng acid - base sau trong dung dịch: H₂S(aq) + H₂O ⇌ HS⁻(aq) + H₃O⁺(aq)",
  "y_dung_sai": [
   {
    "y": "Theo thuyết Brønsted - Lowry, H₂S đóng vai trò là base vì nó hòa tan trong nước.",
    "dung": false
   },
   {
    "y": "Phân tử H₂O đóng vai trò là base vì nó nhận H⁺ từ H₂S để tạo thành H₃O⁺.",
    "dung": true
   },
   {
    "y": "Trong chiều nghịch của phản ứng, H₃O⁺ đóng vai trò là acid.",
    "dung": true
   },
   {
    "y": "Ion HS⁻ là acid liên hợp của phân tử H₂S.",
    "dung": false
   }
  ],
  "giai_thich": "H₂S nhường proton nên nó là acid. Ion HS⁻ nhận proton tạo lại H₂S ở chiều nghịch, nên HS⁻ là base liên hợp của H₂S, không phải acid liên hợp."
 },
 {
  "id": "bq_1788161296549_i050l",
  "loai": "tf",
  "muc": "nb",
  "de": "Cho các phát biểu sau về tính chất của saccharose khi hòa tan vào nước:",
  "y_dung_sai": [
   {
    "y": "Dung dịch saccharose trong nước có khả năng dẫn điện tốt.",
    "dung": false
   },
   {
    "y": "Phân tử saccharose không phân li thành các ion khi tan trong nước.",
    "dung": true
   },
   {
    "y": "Saccharose thuộc loại chất điện li yếu.",
    "dung": false
   },
   {
    "y": "Khả năng dẫn điện của dung dịch phụ thuộc vào sự hiện diện của các ion tự do.",
    "dung": true
   }
  ],
  "giai_thich": "Saccharose khi tan trong nước vẫn tồn tại ở dạng phân tử, không sinh ra ion tự do nên dung dịch không dẫn điện. Nó là chất không điện li."
 },
 {
  "id": "bq_1788161296549_uzhen",
  "loai": "tf",
  "muc": "vd",
  "de": "[Hình ảnh: Bệnh gout ở bàn chân cho thấy tinh thể uric acid tích tụ ở khớp nối gây sưng viêm] Trong máu ở 37 °C có pH = 7,4; nồng độ Na⁺ là 130 mmol/L và tích số tan của sodium urate là 6,4.10⁻⁵ (pKa uric acid = 5,4). Xét các phát biểu sau:",
  "y_dung_sai": [
   {
    "y": "Nồng độ urate (Ur⁻) tối đa trong máu để không xuất hiện kết tủa sodium urate là 4,92.10⁻⁴ M.",
    "dung": true
   },
   {
    "y": "Khi sỏi thận (chứa uric acid HUr không tan) hình thành, nồng độ HUr dạng hòa tan trong nước tiểu đạt mức bão hòa.",
    "dung": true
   },
   {
    "y": "Ở máu pH = 7,4, nồng độ dạng phân tử uric acid (HUr) lớn hơn nồng độ dạng ion urate (Ur⁻).",
    "dung": false
   },
   {
    "y": "Uống nhiều nước giúp làm loãng nồng độ các ion, từ đó giảm nguy cơ kết tủa tinh thể trong khớp.",
    "dung": true
   }
  ],
  "giai_thich": "Điều kiện không kết tủa: [Ur⁻] < Ksp / [Na⁺] = 6,4.10⁻⁵ / 0,13 = 4,92.10⁻⁴ M. Tại pH = 7,4 > pKa (5,4) nên chất tồn tại chủ yếu ở dạng base liên hợp (Ur⁻ chiếm đa số so với HUr)."
 },
 {
  "id": "bq_1788161555459_grbuw",
  "loai": "tf",
  "muc": "th",
  "de": "Xét phương trình phân li của H₂S trong nước: H₂S(aq) + H₂O ⇌ HS⁻(aq) + H₃O⁺(aq). Đánh giá các nhận định sau theo thuyết Brønsted - Lowry:",
  "y_dung_sai": [
   {
    "y": "Phân tử H₂O đóng vai trò là base vì nó nhận H⁺ từ H₂S.",
    "dung": true
   },
   {
    "y": "Phân tử H₂S đóng vai trò là base vì nó tan được trong nước.",
    "dung": false
   },
   {
    "y": "Ion HS⁻ là acid liên hợp của base H₂S.",
    "dung": false
   },
   {
    "y": "Trong chiều nghịch, ion H₃O⁺ đóng vai trò là acid vì nó nhường H⁺ cho HS⁻.",
    "dung": true
   }
  ],
  "giai_thich": "H₂S nhường proton nên nó là acid. Ion HS⁻ nhận proton tạo lại H₂S ở chiều nghịch, nên HS⁻ là base liên hợp của acid H₂S, không phải acid liên hợp."
 },
 {
  "id": "bq_1788161555459_z78lw",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét các phát biểu sau về saccharose (đường kính) và khả năng điện li:",
  "y_dung_sai": [
   {
    "y": "Dung dịch saccharose trong nước có khả năng dẫn điện tốt.",
    "dung": false
   },
   {
    "y": "Saccharose là một chất không điện li do không phân li thành ion khi hòa tan vào nước.",
    "dung": true
   },
   {
    "y": "Saccharose tan tốt trong nước tạo thành dung dịch chứa các phân tử trung hòa.",
    "dung": true
   },
   {
    "y": "Saccharose thuộc loại chất điện li yếu giống như acetic acid.",
    "dung": false
   }
  ],
  "giai_thich": "Saccharose không phân li ra ion nên dung dịch của nó không dẫn điện. Các chất điện li (mạnh hoặc yếu) đều phải sinh ra ion khi tan trong nước."
 },
 {
  "id": "bq_1789371866323_er1ph",
  "loai": "tf",
  "muc": "th",
  "de": "Xét các phân tử và ion: H₂S, Ba²⁺, CO₃²⁻, Na⁺ theo thuyết Brønsted – Lowry.",
  "y_dung_sai": [
   {
    "y": "CO₃²⁻ là base vì nhận được proton.",
    "dung": true
   },
   {
    "y": "H₂S là base.",
    "dung": false
   },
   {
    "y": "Na⁺ và Ba²⁺ không phải acid cũng không phải base.",
    "dung": true
   },
   {
    "y": "Dung dịch Na₂CO₃ có môi trường acid.",
    "dung": false
   }
  ],
  "giai_thich": "H₂S có H linh động nên cho proton (acid); cation kim loại kiềm, kiềm thổ không trao đổi proton với nước; CO₃²⁻ tạo OH⁻ nên dung dịch Na₂CO₃ có tính base."
 },
 {
  "id": "bq_1789371866323_j21r7",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét các chất: C₂H₅OH, HF, KOH, CH₃COOH.",
  "y_dung_sai": [
   {
    "y": "KOH là chất điện li mạnh.",
    "dung": true
   },
   {
    "y": "HF là chất điện li mạnh vì là hợp chất của halogen.",
    "dung": false
   },
   {
    "y": "Phương trình điện li của CH₃COOH được biểu diễn bằng mũi tên hai chiều.",
    "dung": true
   },
   {
    "y": "C₂H₅OH phân li ra ion OH⁻ nên là base.",
    "dung": false
   }
  ],
  "giai_thich": "HF và CH₃COOH là acid yếu nên điện li thuận nghịch; nhóm OH trong ethanol liên kết cộng hóa trị với carbon nên ethanol không phân li ra OH⁻."
 },
 {
  "id": "bq_1789371866324_19ya7",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét nguyên lí chuyển dịch cân bằng Le Chatelier.",
  "y_dung_sai": [
   {
    "y": "Cân bằng chuyển dịch theo chiều làm giảm tác động bên ngoài.",
    "dung": true
   },
   {
    "y": "Theo nguyên lí này, khi tăng nhiệt độ, cân bằng chuyển dịch theo chiều thu nhiệt.",
    "dung": true
   },
   {
    "y": "Theo nguyên lí này, khi tăng nồng độ một chất, cân bằng chuyển dịch theo chiều làm tăng thêm chất đó.",
    "dung": false
   },
   {
    "y": "Nguyên lí Le Chatelier áp dụng cho phản ứng một chiều.",
    "dung": false
   }
  ],
  "giai_thich": "Thêm một chất thì cân bằng chuyển theo chiều tiêu thụ bớt chất đó; nguyên lí chỉ áp dụng cho hệ cân bằng của phản ứng thuận nghịch."
 },
 {
  "id": "bq_1789371866324_6ic73",
  "loai": "tf",
  "muc": "nb",
  "de": "Dịch vị dạ dày của người bình thường có pH trong khoảng 1,5 – 3,5.",
  "y_dung_sai": [
   {
    "y": "Dịch vị dạ dày có môi trường acid.",
    "dung": true
   },
   {
    "y": "Trong dịch vị dạ dày, [H⁺] < [OH⁻].",
    "dung": false
   },
   {
    "y": "Acid chủ yếu trong dịch vị dạ dày là HCl.",
    "dung": true
   },
   {
    "y": "Dịch vị dạ dày làm phenolphthalein hóa hồng.",
    "dung": false
   }
  ],
  "giai_thich": "pH < 7 nên [H⁺] > [OH⁻]; môi trường acid không làm đổi màu phenolphthalein (chỉ hóa hồng trong base)."
 },
 {
  "id": "bq_1789371866324_bn451",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét thuyết acid – base của Brønsted – Lowry.",
  "y_dung_sai": [
   {
    "y": "Base là chất nhận proton (H⁺).",
    "dung": true
   },
   {
    "y": "Acid là chất nhận proton.",
    "dung": false
   },
   {
    "y": "Một chất có thể vừa là acid vừa là base (lưỡng tính).",
    "dung": true
   },
   {
    "y": "Base là chất cho electron.",
    "dung": false
   }
  ],
  "giai_thich": "Thuyết Brønsted – Lowry dựa trên sự trao đổi proton, không phải electron; chất như HCO₃⁻, H₂O vừa cho vừa nhận được proton nên lưỡng tính."
 },
 {
  "id": "bq_1789371866324_e7c80",
  "loai": "tf",
  "muc": "th",
  "de": "Xét cách viết phương trình điện li của một số chất.",
  "y_dung_sai": [
   {
    "y": "Na₂SO₄ → 2Na⁺ + SO₄²⁻.",
    "dung": true
   },
   {
    "y": "HCOOH là acid yếu nên phương trình điện li dùng mũi tên hai chiều.",
    "dung": true
   },
   {
    "y": "HBr là acid yếu nên phương trình điện li dùng mũi tên hai chiều.",
    "dung": false
   },
   {
    "y": "Na₃PO₄ → Na₃⁺ + PO₄³⁻.",
    "dung": false
   }
  ],
  "giai_thich": "HBr là acid mạnh điện li hoàn toàn (→); khi viết phương trình điện li, mỗi ion Na⁺ tách riêng và tổng điện tích hai vế phải bằng nhau."
 },
 {
  "id": "bq_1789371866324_iol92",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét khái niệm sự điện li.",
  "y_dung_sai": [
   {
    "y": "Sự điện li là quá trình phân li các chất trong nước thành ion.",
    "dung": true
   },
   {
    "y": "Sự điện li là quá trình kết hợp các ion thành phân tử.",
    "dung": false
   },
   {
    "y": "Khi NaCl tan trong nước xảy ra sự điện li.",
    "dung": true
   },
   {
    "y": "Khi đường saccharose tan trong nước xảy ra sự điện li.",
    "dung": false
   }
  ],
  "giai_thich": "Chỉ chất điện li (acid, base, muối) mới phân li thành ion khi tan; saccharose tan ở dạng phân tử nên không điện li."
 },
 {
  "id": "bq_1789371866324_mvv39",
  "loai": "tf",
  "muc": "th",
  "de": "Xét dung dịch acid yếu CH₃COOH 0,10 M (bỏ qua sự điện li của nước).",
  "y_dung_sai": [
   {
    "y": "[H⁺] < 0,10 M.",
    "dung": true
   },
   {
    "y": "[H⁺] = [CH₃COO⁻].",
    "dung": true
   },
   {
    "y": "[H⁺] = 0,10 M.",
    "dung": false
   },
   {
    "y": "pH của dung dịch bằng 1.",
    "dung": false
   }
  ],
  "giai_thich": "Mỗi phân tử phân li cho 1 H⁺ và 1 CH₃COO⁻ nhưng chỉ một phần nhỏ phân li, nên [H⁺] < 0,10 M và pH > 1."
 },
 {
  "id": "bq_1789371866324_odndf",
  "loai": "tf",
  "muc": "th",
  "de": "Đất chua là đất có độ pH dưới 6,5. Một anh nông dân lấy một lượng đất cho vào nước, lọc lấy phần dung dịch rồi dùng máy đo pH được giá trị pH là 4,52.",
  "y_dung_sai": [
   {
    "y": "Nồng độ ion H⁺ trong dung dịch đất là 10^(4,52) M.",
    "dung": false
   },
   {
    "y": "Mẫu đất trên có môi trường base do pH < 7.",
    "dung": false
   },
   {
    "y": "Anh nông dân có thể làm tăng pH của đất trồng bằng cách bổ sung các chất như vôi sống (CaO), P₂O₅,… nhưng không nên cho vào đất các chất như NH₄Cl, phèn chua (KAl(SO₄)₂.12H₂O).",
    "dung": false
   },
   {
    "y": "Loại đất trên ảnh hưởng lớn đến dinh dưỡng của cây, làm giảm khả năng cung cấp các nguyên tố dinh dưỡng và tác động trực tiếp đến bộ rễ, làm giảm khả năng sinh trưởng của cây.",
    "dung": true
   }
  ],
  "giai_thich": "[H⁺] = 10^(−4,52) M; pH < 7 là môi trường acid; P₂O₅ là oxide acid nên làm đất chua thêm, chỉ vôi (oxide base) mới khử chua được."
 },
 {
  "id": "bq_1789371866324_oou5d",
  "loai": "tf",
  "muc": "th",
  "de": "Cho dung dịch X có [H⁺] = 10⁻³ M.",
  "y_dung_sai": [
   {
    "y": "Dung dịch X có môi trường acid.",
    "dung": true
   },
   {
    "y": "Dung dịch X có pH = 11.",
    "dung": false
   },
   {
    "y": "Dung dịch X có thể là dung dịch HCl 10⁻³ M.",
    "dung": true
   },
   {
    "y": "Dung dịch X có thể là dung dịch KCl 10⁻³ M.",
    "dung": false
   }
  ],
  "giai_thich": "pH = −lg 10⁻³ = 3; HCl là acid mạnh phân li hoàn toàn nên HCl 10⁻³ M có [H⁺] = 10⁻³ M, còn KCl không tạo H⁺."
 },
 {
  "id": "bq_1789371866324_ost4j",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét các chất: HCl, HNO₃, NaOH, NaCl, CuO, O₂, CH₃COOH.",
  "y_dung_sai": [
   {
    "y": "CuO là chất không điện li.",
    "dung": true
   },
   {
    "y": "O₂ là chất điện li yếu.",
    "dung": false
   },
   {
    "y": "CH₃COOH là chất điện li yếu.",
    "dung": true
   },
   {
    "y": "NaCl là chất không điện li.",
    "dung": false
   }
  ],
  "giai_thich": "Chỉ acid, base, muối tan mới phân li ra ion; O₂ là phân tử trung hòa không phân li, còn NaCl là muối tan điện li mạnh."
 },
 {
  "id": "bq_1789371866324_oz468",
  "loai": "tf",
  "muc": "th",
  "de": "Cho các phát biểu sau:",
  "y_dung_sai": [
   {
    "y": "Phản ứng thuận nghịch là phản ứng xảy ra theo hai chiều ngược nhau trong cùng điều kiện.",
    "dung": true
   },
   {
    "y": "Cân bằng hóa học là cân bằng động.",
    "dung": true
   },
   {
    "y": "Cân bằng CO(g) + H₂O(g) ⇌ CO₂(g) + H₂(g) chuyển dịch sang phải khi tăng áp suất.",
    "dung": false
   },
   {
    "y": "Dung dịch Na₂CO₃ có môi trường acid, dung dịch AlCl₃ và FeCl₃ có môi trường base.",
    "dung": false
   }
  ],
  "giai_thich": "Số mol khí hai vế bằng nhau nên áp suất không ảnh hưởng tới cân bằng; CO₃²⁻ thủy phân tạo OH⁻ (base) còn Al³⁺, Fe³⁺ thủy phân tạo H⁺ (acid)."
 },
 {
  "id": "bq_1789371866324_rwa2p",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét các chất: CuO, NaCl, CuCl₂, NaOH.",
  "y_dung_sai": [
   {
    "y": "CuO không phải là chất điện li.",
    "dung": true
   },
   {
    "y": "CuCl₂ tan trong nước phân li ra Cu²⁺ và Cl⁻.",
    "dung": true
   },
   {
    "y": "NaOH là chất không điện li.",
    "dung": false
   },
   {
    "y": "Dung dịch NaCl không dẫn điện.",
    "dung": false
   }
  ],
  "giai_thich": "Muối tan và base tan phân li thành ion nên dung dịch dẫn điện; oxide kim loại như CuO không tan, không phân li."
 },
 {
  "id": "bq_1789371866324_u8bzt",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét khái niệm pH của dung dịch (ở 25 °C).",
  "y_dung_sai": [
   {
    "y": "pH = −lg[H⁺].",
    "dung": true
   },
   {
    "y": "Nếu [H⁺] = 10⁻ᵃ M thì pH = a.",
    "dung": true
   },
   {
    "y": "pH + pOH = 14.",
    "dung": true
   },
   {
    "y": "Dung dịch có [H⁺] càng lớn thì pH càng lớn.",
    "dung": false
   }
  ],
  "giai_thich": "Do dấu âm trong định nghĩa pH = −lg[H⁺], nồng độ H⁺ càng lớn thì pH càng nhỏ; tích ion của nước 10⁻¹⁴ cho pH + pOH = 14."
 },
 {
  "id": "bq_1789371866324_usarq",
  "loai": "tf",
  "muc": "th",
  "de": "Cho phương trình: NH₃ + H₂O ⇌ NH₄⁺ + OH⁻.",
  "y_dung_sai": [
   {
    "y": "Trong phản ứng thuận, NH₃ là base.",
    "dung": true
   },
   {
    "y": "Trong phản ứng thuận, H₂O đóng vai trò acid.",
    "dung": true
   },
   {
    "y": "Trong phản ứng nghịch, NH₄⁺ là base.",
    "dung": false
   },
   {
    "y": "Trong phản ứng nghịch, OH⁻ là acid.",
    "dung": false
   }
  ],
  "giai_thich": "Chiều thuận H₂O cho H⁺ cho NH₃; chiều nghịch NH₄⁺ trả lại H⁺ cho OH⁻, nên NH₄⁺ là acid và OH⁻ là base."
 },
 {
  "id": "bq_1789371866324_z8tgt",
  "loai": "tf",
  "muc": "th",
  "de": "Xét các dung dịch: Na₂SO₄, NaCl, Fe₂(SO₄)₃, saccharose (C₁₂H₂₂O₁₁).",
  "y_dung_sai": [
   {
    "y": "Dung dịch Fe₂(SO₄)₃ có môi trường acid do ion Fe³⁺ bị thủy phân.",
    "dung": true
   },
   {
    "y": "Dung dịch Na₂SO₄ có môi trường base.",
    "dung": false
   },
   {
    "y": "Dung dịch NaCl làm giấy chỉ thị pH chuyển sang màu đỏ.",
    "dung": false
   },
   {
    "y": "Saccharose không điện li nên không làm đổi màu giấy chỉ thị pH.",
    "dung": true
   }
  ],
  "giai_thich": "Cation của base yếu (Fe³⁺) thủy phân tạo H⁺; muối của acid mạnh và base mạnh như NaCl, Na₂SO₄ không thủy phân nên trung tính."
 },
 {
  "id": "bq_1789371866325_2bqzo",
  "loai": "tf",
  "muc": "vdc",
  "de": "Trộn 200 mL dung dịch gồm HCl 0,1 M và H₂SO₄ 0,15 M với 300 mL dung dịch Ba(OH)₂ a M, thu được m gam kết tủa và 500 mL dung dịch có pH = 1.",
  "y_dung_sai": [
   {
    "y": "Tổng số mol H⁺ ban đầu là 0,08 mol.",
    "dung": true
   },
   {
    "y": "Dung dịch sau phản ứng còn dư 0,05 mol H⁺.",
    "dung": true
   },
   {
    "y": "Khối lượng kết tủa BaSO₄ được tính theo số mol SO₄²⁻.",
    "dung": false
   },
   {
    "y": "Giá trị của a là 0,10.",
    "dung": false
   }
  ],
  "giai_thich": "pH = 1 cho [H⁺] dư 0,1 M × 0,5 L = 0,05 mol nên OH⁻ chỉ có 0,03 mol (a = 0,05 M); Ba²⁺ 0,015 mol ít hơn SO₄²⁻ 0,03 mol nên kết tủa tính theo Ba²⁺."
 },
 {
  "id": "bq_1789371866325_57oht",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét các chất điện li mạnh.",
  "y_dung_sai": [
   {
    "y": "HCl là chất điện li mạnh.",
    "dung": true
   },
   {
    "y": "NaOH là chất điện li mạnh.",
    "dung": true
   },
   {
    "y": "Muối tan NaCl là chất điện li yếu.",
    "dung": false
   },
   {
    "y": "CH₃COOH là chất điện li mạnh.",
    "dung": false
   }
  ],
  "giai_thich": "Muối tan là hợp chất ion phân li hoàn toàn; CH₃COOH là acid yếu nên chỉ phân li một phần."
 },
 {
  "id": "bq_1789371866325_6juoj",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét cách viết phương trình điện li của chất điện li mạnh.",
  "y_dung_sai": [
   {
    "y": "NaCl → Na⁺ + Cl⁻ được viết bằng một mũi tên.",
    "dung": true
   },
   {
    "y": "Chất điện li mạnh phân li hoàn toàn thành ion.",
    "dung": true
   },
   {
    "y": "HCl ⇌ H⁺ + Cl⁻ là cách viết đúng.",
    "dung": false
   },
   {
    "y": "Phương trình điện li của chất điện li mạnh luôn dùng hai mũi tên.",
    "dung": false
   }
  ],
  "giai_thich": "Mũi tên một chiều thể hiện sự phân li hoàn toàn; HCl là acid mạnh nên viết HCl → H⁺ + Cl⁻."
 },
 {
  "id": "bq_1789371866325_7rzre",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét khái niệm muối acid.",
  "y_dung_sai": [
   {
    "y": "NaHSO₄ là muối acid.",
    "dung": true
   },
   {
    "y": "Trong muối acid, gốc acid còn hydrogen có khả năng phân li ra H⁺.",
    "dung": true
   },
   {
    "y": "Mọi muối acid đều có dung dịch pH < 7.",
    "dung": false
   },
   {
    "y": "CH₃COONa là muối acid vì trong phân tử có hydrogen.",
    "dung": false
   }
  ],
  "giai_thich": "H trong gốc CH₃COO⁻ không phân li ra H⁺ nên CH₃COONa là muối trung hòa; NaHCO₃ là muối acid nhưng dung dịch có tính base."
 },
 {
  "id": "bq_1789371866325_az6h5",
  "loai": "tf",
  "muc": "th",
  "de": "Xét khả năng làm đổi màu quỳ tím của một số dung dịch.",
  "y_dung_sai": [
   {
    "y": "Dung dịch NaHSO₄ làm quỳ tím hóa đỏ.",
    "dung": true
   },
   {
    "y": "Dung dịch AlCl₃ có môi trường acid.",
    "dung": true
   },
   {
    "y": "Dung dịch NaHCO₃ làm quỳ tím hóa đỏ.",
    "dung": false
   },
   {
    "y": "Dung dịch BaCl₂ làm quỳ tím hóa đỏ.",
    "dung": false
   }
  ],
  "giai_thich": "HSO₄⁻ điện li mạnh ra H⁺ còn HCO₃⁻ chủ yếu nhận H⁺ nên NaHCO₃ có tính base yếu; muối của acid mạnh và base mạnh như BaCl₂ trung tính."
 },
 {
  "id": "bq_1789371866325_bgegu",
  "loai": "tf",
  "muc": "th",
  "de": "Xét màu của quỳ tím trong các dung dịch NaCl, NH₄Cl, Na₂CO₃, FeCl₃.",
  "y_dung_sai": [
   {
    "y": "Dung dịch Na₂CO₃ làm quỳ tím hóa xanh.",
    "dung": true
   },
   {
    "y": "Dung dịch FeCl₃ làm quỳ tím hóa đỏ.",
    "dung": true
   },
   {
    "y": "Dung dịch NH₄Cl làm quỳ tím hóa xanh.",
    "dung": false
   },
   {
    "y": "Dung dịch NaCl làm quỳ tím hóa đỏ.",
    "dung": false
   }
  ],
  "giai_thich": "Fe³⁺, NH₄⁺ thủy phân tạo H⁺ (môi trường acid); NaCl không thủy phân nên quỳ tím giữ nguyên màu tím."
 },
 {
  "id": "bq_1789371866325_bnfvo",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét các chất điện li yếu.",
  "y_dung_sai": [
   {
    "y": "CH₃COOH là chất điện li yếu.",
    "dung": true
   },
   {
    "y": "Dung dịch NH₃ chứa chất điện li yếu.",
    "dung": true
   },
   {
    "y": "HNO₃ là chất điện li yếu.",
    "dung": false
   },
   {
    "y": "KOH là chất điện li yếu.",
    "dung": false
   }
  ],
  "giai_thich": "Acid yếu, base yếu chỉ phân li một phần; HNO₃ là acid mạnh, KOH là base mạnh nên phân li hoàn toàn."
 },
 {
  "id": "bq_1789371866325_br0xf",
  "loai": "tf",
  "muc": "vdc",
  "de": "Trộn V₁ lít dung dịch H₂SO₄ có pH = 3 với V₂ lít dung dịch NaOH có pH = 12, thu được dung dịch có pH = 4.",
  "y_dung_sai": [
   {
    "y": "Dung dịch H₂SO₄ ban đầu có [H⁺] = 10⁻³ M.",
    "dung": true
   },
   {
    "y": "Dung dịch NaOH ban đầu có [OH⁻] = 10⁻² M.",
    "dung": true
   },
   {
    "y": "Sau khi trộn, OH⁻ còn dư.",
    "dung": false
   },
   {
    "y": "Tỉ số V₁ : V₂ bằng 10 : 1.",
    "dung": false
   }
  ],
  "giai_thich": "pH = 4 < 7 nên H⁺ dư; lập phương trình 10⁻³V₁ − 10⁻²V₂ = 10⁻⁴(V₁ + V₂) được V₁ : V₂ = 101 : 9 ≈ 11,2."
 },
 {
  "id": "bq_1789371866325_cbdrk",
  "loai": "tf",
  "muc": "vdc",
  "de": "Trộn 100 mL dung dịch HCl có pH = 1 với 100 mL dung dịch gồm KOH 0,1 M và NaOH a M, thu được 200 mL dung dịch có pH = 12.",
  "y_dung_sai": [
   {
    "y": "Số mol H⁺ trong dung dịch HCl ban đầu là 0,01 mol.",
    "dung": true
   },
   {
    "y": "Dung dịch sau phản ứng còn dư 0,002 mol OH⁻.",
    "dung": true
   },
   {
    "y": "Dung dịch sau phản ứng có môi trường acid.",
    "dung": false
   },
   {
    "y": "Giá trị của a là 0,12.",
    "dung": false
   }
  ],
  "giai_thich": "pH = 12 cho [OH⁻] dư 0,01 M trong 0,2 L nên tổng OH⁻ = 0,012 mol; trừ 0,01 mol của KOH còn 0,002 mol NaOH trong 0,1 L, a = 0,02."
 },
 {
  "id": "bq_1789371866325_da6gu",
  "loai": "tf",
  "muc": "vd",
  "de": "Trung hòa 10 mL dung dịch X chứa HCl 1M và H₂SO₄ 0,5M bằng dung dịch NaOH 1M.",
  "y_dung_sai": [
   {
    "y": "Tổng số mol H⁺ trong X là 0,02 mol.",
    "dung": true
   },
   {
    "y": "Phương trình ion rút gọn của phản ứng trung hòa là H⁺ + OH⁻ → H₂O.",
    "dung": true
   },
   {
    "y": "H₂SO₄ trong X cung cấp 0,005 mol H⁺.",
    "dung": false
   },
   {
    "y": "Thể tích dung dịch NaOH cần dùng là 15 mL.",
    "dung": false
   }
  ],
  "giai_thich": "0,005 mol H₂SO₄ cho 0,01 mol H⁺, cộng 0,01 mol từ HCl được 0,02 mol, cần 0,02 mol OH⁻ tức 20 mL NaOH 1M."
 },
 {
  "id": "bq_1789371866325_e5l8q",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét hành vi của chất điện li trong dung dịch.",
  "y_dung_sai": [
   {
    "y": "Chất điện li phân li thành các ion trong dung dịch.",
    "dung": true
   },
   {
    "y": "Dung dịch chất điện li dẫn được điện.",
    "dung": true
   },
   {
    "y": "Chất điện li phân li thành các nguyên tử trung hòa.",
    "dung": false
   },
   {
    "y": "Chất không điện li cũng phân li thành ion khi tan trong nước.",
    "dung": false
   }
  ],
  "giai_thich": "Sự có mặt của các ion tự do làm dung dịch dẫn điện; chất không điện li tan ở dạng phân tử."
 },
 {
  "id": "bq_1789371866325_f4x8o",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét ý nghĩa của giá trị pH (ở 25 °C).",
  "y_dung_sai": [
   {
    "y": "Dung dịch có pH < 7 có môi trường acid.",
    "dung": true
   },
   {
    "y": "Dung dịch có pH > 7 có môi trường base.",
    "dung": true
   },
   {
    "y": "pH chỉ dùng để đánh giá độ acid, không đánh giá độ base.",
    "dung": false
   },
   {
    "y": "Dung dịch trung tính có pH = 0.",
    "dung": false
   }
  ],
  "giai_thich": "Thang pH phản ánh nồng độ H⁺ nên dùng cho mọi môi trường; dung dịch trung tính có pH = 7."
 },
 {
  "id": "bq_1789371866325_gelr9",
  "loai": "tf",
  "muc": "vd",
  "de": "Pha chế 250 mL dung dịch NaOH có pH = 10.",
  "y_dung_sai": [
   {
    "y": "Dung dịch có [OH⁻] = 10⁻⁴ M.",
    "dung": true
   },
   {
    "y": "Số mol NaOH cần là 2,5·10⁻⁵ mol.",
    "dung": true
   },
   {
    "y": "Dung dịch có [OH⁻] = 10⁻¹⁰ M.",
    "dung": false
   },
   {
    "y": "Khối lượng NaOH cần là 0,01 gam.",
    "dung": false
   }
  ],
  "giai_thich": "pH = 10 thì [H⁺] = 10⁻¹⁰ M và [OH⁻] = 10⁻⁴ M; m(NaOH) = 2,5·10⁻⁵·40 = 10⁻³ g."
 },
 {
  "id": "bq_1789371866325_lbpsy",
  "loai": "tf",
  "muc": "vd",
  "de": "Xét dung dịch hỗn hợp HCl 0,005 M và H₂SO₄ 0,0025 M.",
  "y_dung_sai": [
   {
    "y": "Nồng độ H⁺ trong dung dịch là 0,01 M.",
    "dung": true
   },
   {
    "y": "pH của dung dịch là 2.",
    "dung": true
   },
   {
    "y": "H₂SO₄ 0,0025 M cung cấp [H⁺] = 0,0025 M.",
    "dung": false
   },
   {
    "y": "Dung dịch có môi trường base.",
    "dung": false
   }
  ],
  "giai_thich": "H₂SO₄ phân li 2 nấc cho 2 H⁺ nên đóng góp 0,005 M H⁺; tổng [H⁺] = 0,01 M, pH = 2, môi trường acid."
 },
 {
  "id": "bq_1789371866325_lm2d6",
  "loai": "tf",
  "muc": "vd",
  "de": "Xét dung dịch Ba(OH)₂ 0,05 M (ở 25 °C).",
  "y_dung_sai": [
   {
    "y": "[OH⁻] trong dung dịch là 0,1 M.",
    "dung": true
   },
   {
    "y": "pOH của dung dịch bằng 1.",
    "dung": true
   },
   {
    "y": "pH của dung dịch bằng 12.",
    "dung": false
   },
   {
    "y": "Dung dịch Ba(OH)₂ làm quỳ tím hóa đỏ.",
    "dung": false
   }
  ],
  "giai_thich": "Mỗi Ba(OH)₂ cho 2 OH⁻ nên [OH⁻] gấp đôi nồng độ base; pH = 14 − 1 = 13, môi trường base làm quỳ hóa xanh."
 },
 {
  "id": "bq_1789371866325_mn94y",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét khái niệm chất điện li yếu.",
  "y_dung_sai": [
   {
    "y": "Khi tan trong nước, chất điện li yếu chỉ có một phần phân tử phân li thành ion.",
    "dung": true
   },
   {
    "y": "Trong dung dịch chất điện li yếu vẫn còn các phân tử chưa phân li.",
    "dung": true
   },
   {
    "y": "Chất điện li yếu phân li hoàn toàn thành ion.",
    "dung": false
   },
   {
    "y": "Dung dịch chất điện li yếu hoàn toàn không dẫn điện.",
    "dung": false
   }
  ],
  "giai_thich": "Chất điện li yếu vẫn tạo được một ít ion nên dung dịch dẫn điện yếu."
 },
 {
  "id": "bq_1789371866325_mogmf",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét khái niệm chất không điện li.",
  "y_dung_sai": [
   {
    "y": "Saccharose là chất không điện li.",
    "dung": true
   },
   {
    "y": "Khi tan trong nước, chất không điện li không phân li thành ion.",
    "dung": true
   },
   {
    "y": "Ethanol là chất điện li yếu.",
    "dung": false
   },
   {
    "y": "Dung dịch chất không điện li dẫn điện tốt.",
    "dung": false
   }
  ],
  "giai_thich": "Ethanol, saccharose tồn tại dạng phân tử trong nước nên không tạo ion, dung dịch không dẫn điện."
 },
 {
  "id": "bq_1789371866325_nx3zu",
  "loai": "tf",
  "muc": "vd",
  "de": "Hòa tan 4,9 mg H₂SO₄ vào nước thu được 1 lít dung dịch.",
  "y_dung_sai": [
   {
    "y": "Số mol H₂SO₄ là 5·10⁻⁵ mol.",
    "dung": true
   },
   {
    "y": "Nồng độ H⁺ trong dung dịch là 10⁻⁴ M.",
    "dung": true
   },
   {
    "y": "Nồng độ H⁺ trong dung dịch là 5·10⁻⁵ M.",
    "dung": false
   },
   {
    "y": "pH của dung dịch là 2.",
    "dung": false
   }
  ],
  "giai_thich": "4,9 mg = 4,9·10⁻³ g; mỗi H₂SO₄ cho 2 H⁺ nên [H⁺] = 10⁻⁴ M và pH = 4."
 },
 {
  "id": "bq_1789371866325_oixbl",
  "loai": "tf",
  "muc": "th",
  "de": "Xét môi trường của các dung dịch NH₄Cl, CH₃COONa, C₆H₅ONa, KClO₃.",
  "y_dung_sai": [
   {
    "y": "Dung dịch KClO₃ có pH = 7.",
    "dung": true
   },
   {
    "y": "Dung dịch NH₄Cl có pH < 7.",
    "dung": true
   },
   {
    "y": "Dung dịch CH₃COONa có pH = 7.",
    "dung": false
   },
   {
    "y": "Dung dịch C₆H₅ONa có môi trường acid.",
    "dung": false
   }
  ],
  "giai_thich": "Anion của acid yếu (CH₃COO⁻, C₆H₅O⁻) nhận H⁺ của nước tạo OH⁻; cation NH₄⁺ cho H⁺; ion của acid mạnh, base mạnh không thủy phân."
 },
 {
  "id": "bq_1789371866325_pgdpl",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét chất chỉ thị acid – base.",
  "y_dung_sai": [
   {
    "y": "Quỳ tím là một chất chỉ thị acid – base.",
    "dung": true
   },
   {
    "y": "Phenolphthalein hóa hồng trong môi trường base.",
    "dung": true
   },
   {
    "y": "Chất chỉ thị giúp biến đổi môi trường acid thành môi trường base.",
    "dung": false
   },
   {
    "y": "Màu của chất chỉ thị không thay đổi khi pH thay đổi.",
    "dung": false
   }
  ],
  "giai_thich": "Chất chỉ thị chỉ được dùng lượng rất nhỏ để quan sát sự đổi màu theo pH, không đủ để thay đổi môi trường dung dịch."
 },
 {
  "id": "bq_1789371866325_qw176",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét các hệ thức về pH và pOH của dung dịch ở 25 °C.",
  "y_dung_sai": [
   {
    "y": "pH = −lg[H⁺].",
    "dung": true
   },
   {
    "y": "[H⁺]·[OH⁻] = 10⁻¹⁴.",
    "dung": true
   },
   {
    "y": "pH = lg[H⁺].",
    "dung": false
   },
   {
    "y": "pH + pOH = 7.",
    "dung": false
   }
  ],
  "giai_thich": "Lấy −lg hai vế của tích ion [H⁺][OH⁻] = 10⁻¹⁴ được pH + pOH = 14."
 },
 {
  "id": "bq_1789371866325_rvkrw",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét khái niệm chất điện li mạnh.",
  "y_dung_sai": [
   {
    "y": "Khi tan trong nước, chất điện li mạnh phân li hoàn toàn thành ion.",
    "dung": true
   },
   {
    "y": "Trong dung dịch chất điện li mạnh hầu như không còn phân tử chất tan.",
    "dung": true
   },
   {
    "y": "Chất điện li mạnh chỉ phân li một phần khi tan trong nước.",
    "dung": false
   },
   {
    "y": "Chất điện li mạnh được định nghĩa theo sự phân li trong dung môi hữu cơ.",
    "dung": false
   }
  ],
  "giai_thich": "Khái niệm chất điện li xét trong dung môi nước; chất điện li mạnh phân li hoàn toàn còn chất điện li yếu phân li một phần."
 },
 {
  "id": "bq_1789371866325_tt2ur",
  "loai": "tf",
  "muc": "th",
  "de": "Xét khả năng phản ứng với dung dịch acid và dung dịch base của một số chất.",
  "y_dung_sai": [
   {
    "y": "Zn(OH)₂ tác dụng được với cả dung dịch HCl và dung dịch NaOH.",
    "dung": true
   },
   {
    "y": "KHCO₃ tác dụng được với cả acid và base.",
    "dung": true
   },
   {
    "y": "NH₄Cl tác dụng được với dung dịch HCl.",
    "dung": false
   },
   {
    "y": "FeO tác dụng được với dung dịch NaOH.",
    "dung": false
   }
  ],
  "giai_thich": "Chất lưỡng tính vừa cho vừa nhận được proton (HCO₃⁻) hoặc là hydroxide lưỡng tính (Zn(OH)₂); FeO là oxide base, NH₄Cl chỉ phản ứng với base."
 },
 {
  "id": "bq_1789371866325_tzcf8",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét ý nghĩa của phương trình ion rút gọn.",
  "y_dung_sai": [
   {
    "y": "Phương trình ion rút gọn của phản ứng giữa acid mạnh và base mạnh là H⁺ + OH⁻ → H₂O.",
    "dung": true
   },
   {
    "y": "Phương trình ion rút gọn cho biết bản chất của phản ứng trong dung dịch.",
    "dung": true
   },
   {
    "y": "Phương trình ion cho biết khối lượng chất điện li tham gia phản ứng.",
    "dung": false
   },
   {
    "y": "Trong phương trình ion, chất kết tủa được viết dưới dạng ion.",
    "dung": false
   }
  ],
  "giai_thich": "Chỉ chất điện li mạnh tan được viết dạng ion; chất kết tủa, khí, chất điện li yếu giữ nguyên dạng phân tử."
 },
 {
  "id": "bq_1789371866325_u5niy",
  "loai": "tf",
  "muc": "th",
  "de": "Xét việc dùng quỳ tím để nhận biết các dung dịch.",
  "y_dung_sai": [
   {
    "y": "Dung dịch HCl làm quỳ tím hóa đỏ.",
    "dung": true
   },
   {
    "y": "Dung dịch NaNO₃ không làm quỳ tím đổi màu.",
    "dung": true
   },
   {
    "y": "Chỉ dùng quỳ tím có thể phân biệt H₂SO₄ và HCl.",
    "dung": false
   },
   {
    "y": "Chỉ dùng quỳ tím có thể phân biệt NaOH và KOH.",
    "dung": false
   }
  ],
  "giai_thich": "Quỳ tím chỉ phân biệt được ba môi trường acid, trung tính, base; hai acid hoặc hai base cùng làm quỳ đổi màu giống nhau."
 },
 {
  "id": "bq_1789371866325_wq4j9",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét cách viết phương trình điện li của chất điện li yếu.",
  "y_dung_sai": [
   {
    "y": "CH₃COOH ⇌ CH₃COO⁻ + H⁺ là cách viết đúng.",
    "dung": true
   },
   {
    "y": "Sự điện li của chất điện li yếu là quá trình thuận nghịch.",
    "dung": true
   },
   {
    "y": "HF → H⁺ + F⁻ là cách viết đúng.",
    "dung": false
   },
   {
    "y": "Chất điện li yếu phân li hoàn toàn thành ion.",
    "dung": false
   }
  ],
  "giai_thich": "Các ion của chất điện li yếu có thể kết hợp lại thành phân tử nên tồn tại cân bằng điện li, biểu diễn bằng ⇌."
 },
 {
  "id": "bq_1789371866325_xl7ja",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét nội dung thuyết acid – base của Brønsted – Lowry.",
  "y_dung_sai": [
   {
    "y": "Acid là chất cho proton (H⁺).",
    "dung": true
   },
   {
    "y": "Base là chất nhận proton.",
    "dung": true
   },
   {
    "y": "Acid là chất nhận proton.",
    "dung": false
   },
   {
    "y": "Theo thuyết Brønsted – Lowry, ion không thể là acid hay base.",
    "dung": false
   }
  ],
  "giai_thich": "Cả phân tử và ion đều có thể là acid (NH₄⁺, HSO₄⁻) hoặc base (CO₃²⁻, OH⁻) nếu cho hoặc nhận được proton."
 },
 {
  "id": "bq_1789371866325_xtx2g",
  "loai": "tf",
  "muc": "th",
  "de": "Cho các muối: NaNO₃; K₂CO₃; CuSO₄; FeCl₃; AlCl₃; KCl.",
  "y_dung_sai": [
   {
    "y": "Dung dịch KCl có pH = 7.",
    "dung": true
   },
   {
    "y": "Dung dịch CuSO₄ có pH < 7.",
    "dung": true
   },
   {
    "y": "Dung dịch K₂CO₃ có pH = 7.",
    "dung": false
   },
   {
    "y": "Dung dịch FeCl₃ có pH > 7.",
    "dung": false
   }
  ],
  "giai_thich": "Cation của base yếu (Cu²⁺, Fe³⁺, Al³⁺) thủy phân tạo H⁺; anion CO₃²⁻ thủy phân tạo OH⁻; Na⁺, K⁺, NO₃⁻, Cl⁻ không thủy phân."
 },
 {
  "id": "bq_1789371866328_60nvd",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét công thức tính pH và môi trường của dung dịch.",
  "y_dung_sai": [
   {
    "y": "Công thức tính pH là pH = −log[H⁺].",
    "dung": true
   },
   {
    "y": "Dung dịch trung tính có pH bằng 7 ở 25 °C.",
    "dung": true
   },
   {
    "y": "Dung dịch acid có pH lớn hơn 7.",
    "dung": false
   },
   {
    "y": "pH càng lớn thì nồng độ ion H⁺ càng lớn.",
    "dung": false
   }
  ],
  "giai_thich": "pH tỉ lệ nghịch với nồng độ H⁺ theo hàm logarit nên pH càng lớn thì môi trường càng ít acid, càng nhiều base."
 },
 {
  "id": "bq_1789371866328_kbpyp",
  "loai": "tf",
  "muc": "th",
  "de": "Xét các chất NaCl, BaSO₄, CH₃COOH, CO₂, N₂, KOH, H₂SO₄, (NH₄)₂CO₃.",
  "y_dung_sai": [
   {
    "y": "NaCl, KOH, H₂SO₄ và (NH₄)₂CO₃ đều là chất điện li mạnh.",
    "dung": true
   },
   {
    "y": "CH₃COOH là chất điện li yếu nên phương trình điện li viết bằng mũi tên hai chiều.",
    "dung": true
   },
   {
    "y": "CO₂ và N₂ là những chất điện li.",
    "dung": false
   },
   {
    "y": "BaSO₄ tan nhiều trong nước và phân li hoàn toàn thành ion.",
    "dung": false
   }
  ],
  "giai_thich": "Chất điện li mạnh phân li hoàn toàn nên dùng mũi tên một chiều, chất điện li yếu chỉ phân li một phần; BaSO₄ gần như không tan trong nước."
 },
 {
  "id": "bq_1789371866328_say5x",
  "loai": "tf",
  "muc": "th",
  "de": "Xét môi trường của các dung dịch Na₂CO₃, Al₂(SO₄)₃, NH₄Cl.",
  "y_dung_sai": [
   {
    "y": "Dung dịch Na₂CO₃ có môi trường base.",
    "dung": true
   },
   {
    "y": "Dung dịch Al₂(SO₄)₃ và NH₄Cl đều có môi trường acid.",
    "dung": true
   },
   {
    "y": "Dung dịch NH₄Cl có môi trường base.",
    "dung": false
   },
   {
    "y": "Cả ba dung dịch đều có môi trường trung tính.",
    "dung": false
   }
  ],
  "giai_thich": "Ion gốc acid yếu (CO₃²⁻) thủy phân cho OH⁻, còn ion kim loại nhỏ, điện tích lớn (Al³⁺) và NH₄⁺ thủy phân cho H⁺."
 },
 {
  "id": "bq_1789371866328_yr3qm",
  "loai": "tf",
  "muc": "th",
  "de": "Xét tính acid – base theo Brønsted – Lowry của CO₃²⁻, Al³⁺, NH₄⁺, NH₃, HCO₃⁻, HPO₄²⁻.",
  "y_dung_sai": [
   {
    "y": "HCO₃⁻ và HPO₄²⁻ là các chất lưỡng tính.",
    "dung": true
   },
   {
    "y": "NH₄⁺ và Al³⁺ là acid theo Brønsted – Lowry.",
    "dung": true
   },
   {
    "y": "CO₃²⁻ là acid theo Brønsted – Lowry.",
    "dung": false
   },
   {
    "y": "NH₃ là chất lưỡng tính.",
    "dung": false
   }
  ],
  "giai_thich": "Acid là chất cho H⁺, base là chất nhận H⁺; ion kim loại như Al³⁺ thể hiện tính acid thông qua phức aquơ nhường H⁺ cho nước."
 },
 {
  "id": "bq_1789372198145_0w8kd",
  "loai": "tf",
  "muc": "vd",
  "de": "Xét 1 lít dung dịch H₂SO₄ 0,01 M (coi H₂SO₄ phân li hoàn toàn theo 2 nấc).",
  "y_dung_sai": [
   {
    "y": "Nồng độ H⁺ trong dung dịch là 0,02 M.",
    "dung": true
   },
   {
    "y": "pH của dung dịch bằng 2.",
    "dung": false
   },
   {
    "y": "Dung dịch làm quỳ tím hóa đỏ.",
    "dung": true
   },
   {
    "y": "Pha loãng dung dịch 10 lần thì pH giảm đi 1 đơn vị.",
    "dung": false
   }
  ],
  "giai_thich": "Mỗi phân tử H₂SO₄ cho 2 H⁺ nên [H⁺] = 0,02 M, pH ≈ 1,7; pha loãng làm [H⁺] giảm nên pH tăng."
 },
 {
  "id": "bq_1789372198145_3q50j",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét các chất: KOH, LiOH, NaCl, HCl.",
  "y_dung_sai": [
   {
    "y": "HCl là acid vì cho proton H⁺.",
    "dung": true
   },
   {
    "y": "KOH và LiOH là base.",
    "dung": true
   },
   {
    "y": "NaCl là acid vì trong phân tử có nguyên tố chlorine.",
    "dung": false
   },
   {
    "y": "Dung dịch HCl có pH > 7.",
    "dung": false
   }
  ],
  "giai_thich": "Acid là chất cho H⁺ nên dung dịch có pH < 7; NaCl là muối trung tính, không cho proton."
 },
 {
  "id": "bq_1789372198145_ertej",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét sự điện li của NaCl trong nước.",
  "y_dung_sai": [
   {
    "y": "NaCl là chất điện li mạnh.",
    "dung": true
   },
   {
    "y": "Khi tan trong nước, NaCl phân li thành các nguyên tử Na và Cl.",
    "dung": false
   },
   {
    "y": "Phương trình điện li của NaCl được biểu diễn bằng một mũi tên một chiều.",
    "dung": true
   },
   {
    "y": "Các ion sinh ra tồn tại ở trạng thái khí (g).",
    "dung": false
   }
  ],
  "giai_thich": "Muối tan NaCl phân li hoàn toàn thành ion mang điện Na⁺(aq) và Cl⁻(aq) nên dùng mũi tên một chiều; không tạo nguyên tử hay khí."
 },
 {
  "id": "bq_1789372198145_gg6bo",
  "loai": "tf",
  "muc": "th",
  "de": "[Hình: bộ dụng cụ chuẩn độ gồm giá sắt có kẹp (1); buret có vạch chia (2) kẹp thẳng đứng; khóa buret (3) ở đầu dưới buret; bình tam giác (4) đặt ngay dưới đầu buret] Chuẩn độ dung dịch HCl có phenolphthalein trong bình (4) bằng dung dịch NaOH chứa trong dụng cụ (2).",
  "y_dung_sai": [
   {
    "y": "Dụng cụ ở vị trí (2) là buret, dùng để chứa dung dịch NaOH.",
    "dung": true
   },
   {
    "y": "Dụng cụ ở vị trí (3) là khóa buret, dùng để điều chỉnh tốc độ nhỏ dung dịch.",
    "dung": true
   },
   {
    "y": "Kết thúc chuẩn độ khi dung dịch trong bình (4) chuyển từ màu hồng sang không màu.",
    "dung": false
   },
   {
    "y": "Nếu màu hồng xuất hiện rồi mất ngay khi lắc thì phản ứng đã vừa đủ, có thể dừng chuẩn độ.",
    "dung": false
   }
  ],
  "giai_thich": "Dung dịch trong bình ban đầu có tính acid nên không màu; màu hồng mất ngay chứng tỏ acid còn dư, chỉ dừng khi màu hồng nhạt bền."
 },
 {
  "id": "bq_1789372198145_j6v3h",
  "loai": "tf",
  "muc": "th",
  "de": "Xét độ tan và mức độ điện li của một số chất.",
  "y_dung_sai": [
   {
    "y": "H₂SO₄, NaCl, KNO₃, Ba(NO₃)₂ đều tan nhiều trong nước và điện li mạnh.",
    "dung": true
   },
   {
    "y": "H₂O là chất điện li mạnh.",
    "dung": false
   },
   {
    "y": "Ca₃(PO₄)₂ tan tốt trong nước.",
    "dung": false
   },
   {
    "y": "H₃PO₄ điện li không hoàn toàn, phương trình điện li dùng mũi tên hai chiều.",
    "dung": true
   }
  ],
  "giai_thich": "Muối nitrate, chloride của kim loại kiềm và acid mạnh phân li hoàn toàn; nước chỉ điện li rất yếu, còn Ca₃(PO₄)₂ là muối không tan."
 },
 {
  "id": "bq_1789372198145_o35z0",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét phản ứng trao đổi ion trong dung dịch.",
  "y_dung_sai": [
   {
    "y": "Phản ứng NaOH + HCl có phương trình ion thu gọn H⁺ + OH⁻ → H₂O.",
    "dung": true
   },
   {
    "y": "Phản ứng Zn + CuSO₄ → ZnSO₄ + Cu là phản ứng trao đổi ion.",
    "dung": false
   },
   {
    "y": "Trong phản ứng trao đổi ion, số oxi hóa của các nguyên tố không thay đổi.",
    "dung": true
   },
   {
    "y": "Phản ứng Fe + 2HCl → FeCl₂ + H₂ là phản ứng trao đổi ion vì xảy ra trong dung dịch.",
    "dung": false
   }
  ],
  "giai_thich": "Phản ứng trao đổi ion chỉ là sự kết hợp các ion tạo chất kết tủa, khí hoặc chất điện li yếu; Zn và Fe thay đổi số oxi hóa nên là phản ứng oxi hóa – khử."
 },
 {
  "id": "bq_1789372198145_ut24k",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét khả năng dẫn điện của dung dịch chất điện li.",
  "y_dung_sai": [
   {
    "y": "Dung dịch dẫn điện nhờ các cation và anion chuyển động tự do.",
    "dung": true
   },
   {
    "y": "Các phân tử trung hòa trong dung dịch góp phần dẫn điện.",
    "dung": false
   },
   {
    "y": "Ở cùng điều kiện, dung dịch chứa nhiều ion hơn thì dẫn điện tốt hơn.",
    "dung": true
   },
   {
    "y": "Nước cất dẫn điện tốt vì chứa nhiều ion H⁺ và OH⁻.",
    "dung": false
   }
  ],
  "giai_thich": "Chỉ hạt mang điện mới tạo dòng điện; nước cất điện li rất yếu nên gần như không dẫn điện."
 },
 {
  "id": "bq_1789372198145_uzkh2",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét dung dịch Na₂CO₃ trong nước.",
  "y_dung_sai": [
   {
    "y": "Ion CO₃²⁻ bị thủy phân tạo ra ion OH⁻.",
    "dung": true
   },
   {
    "y": "Dung dịch Na₂CO₃ có pH < 7.",
    "dung": false
   },
   {
    "y": "Nhỏ phenolphthalein vào dung dịch Na₂CO₃ thấy xuất hiện màu hồng.",
    "dung": true
   },
   {
    "y": "Ion Na⁺ bị thủy phân làm dung dịch có môi trường acid.",
    "dung": false
   }
  ],
  "giai_thich": "CO₃²⁻ là base Brønsted, nhận H⁺ của nước tạo OH⁻ nên pH > 7 và phenolphthalein hóa hồng; Na⁺ là cation của base mạnh nên không bị thủy phân."
 },
 {
  "id": "bq_1789372198145_yclf9",
  "loai": "tf",
  "muc": "vdc",
  "de": "Trộn 200 mL dung dịch chứa hỗn hợp HCl 0,1 M và H₂SO₄ 0,05 M với 300 mL dung dịch Ba(OH)₂ a mol/L, thu được m gam kết tủa và 500 mL dung dịch có pH = 13.",
  "y_dung_sai": [
   {
    "y": "Tổng số mol H⁺ trong 200 mL dung dịch acid là 0,04 mol.",
    "dung": true
   },
   {
    "y": "Dung dịch sau phản ứng có môi trường acid.",
    "dung": false
   },
   {
    "y": "Nồng độ a của dung dịch Ba(OH)₂ là 0,15 M.",
    "dung": true
   },
   {
    "y": "Khối lượng kết tủa BaSO₄ thu được là 4,66 gam.",
    "dung": false
   }
  ],
  "giai_thich": "pH = 13 chứng tỏ OH⁻ dư 0,05 mol nên dung dịch có tính base; n(OH⁻) = 0,04 + 0,05 = 0,09 mol cho a = 0,15 M; kết tủa tính theo SO₄²⁻ (0,01 mol) nên m = 2,33 g."
 },
 {
  "id": "bq_1789372198146_679lv",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét phương pháp chuẩn độ acid – base.",
  "y_dung_sai": [
   {
    "y": "Dung dịch chuẩn là dung dịch đã biết chính xác nồng độ.",
    "dung": true
   },
   {
    "y": "Chuẩn độ acid – base dùng để xác định nồng độ của một dung dịch acid hoặc base chưa biết.",
    "dung": true
   },
   {
    "y": "Phenolphthalein chuyển từ không màu sang hồng khi môi trường chuyển từ base sang acid.",
    "dung": false
   },
   {
    "y": "Tại điểm tương đương của phản ứng giữa HCl và NaOH, n(HCl) = n(NaOH).",
    "dung": true
   }
  ],
  "giai_thich": "HCl + NaOH phản ứng theo tỉ lệ 1 : 1 nên tại điểm tương đương số mol bằng nhau; phenolphthalein hóa hồng khi môi trường chuyển sang base."
 },
 {
  "id": "bq_1789372198146_ajpp9",
  "loai": "tf",
  "muc": "th",
  "de": "Xét môi trường của các dung dịch muối sau:",
  "y_dung_sai": [
   {
    "y": "Dung dịch CaCl₂ có môi trường acid.",
    "dung": false
   },
   {
    "y": "Dung dịch NH₄NO₃ có môi trường base.",
    "dung": false
   },
   {
    "y": "Dung dịch K₂CO₃ có môi trường trung tính.",
    "dung": false
   },
   {
    "y": "Dung dịch KHCO₃ có môi trường base.",
    "dung": true
   }
  ],
  "giai_thich": "CaCl₂ tạo bởi base mạnh và acid mạnh nên trung tính; NH₄⁺ thủy phân cho H₃O⁺ (acid); CO₃²⁻ và HCO₃⁻ nhận proton của nước tạo OH⁻ nên có môi trường base."
 },
 {
  "id": "bq_1789372198146_da6y8",
  "loai": "tf",
  "muc": "th",
  "de": "Xét các dung dịch muối: Na₂CO₃, NaNO₃, NaNO₂, NaCl, Na₂SO₄, CH₃COONa, NH₄HSO₄, Na₂S.",
  "y_dung_sai": [
   {
    "y": "Dung dịch NaNO₂ làm quỳ tím hóa xanh.",
    "dung": true
   },
   {
    "y": "Dung dịch NH₄HSO₄ có môi trường base.",
    "dung": false
   },
   {
    "y": "Dung dịch Na₂SO₄ và dung dịch NaCl có môi trường trung tính.",
    "dung": true
   },
   {
    "y": "Có 5 dung dịch trong dãy làm quỳ tím hóa xanh.",
    "dung": false
   }
  ],
  "giai_thich": "NO₂⁻, CO₃²⁻, CH₃COO⁻, S²⁻ là base Brønsted nên tạo OH⁻; NH₄⁺ và HSO₄⁻ cho H⁺ nên NH₄HSO₄ có tính acid; chỉ có 4 dung dịch làm xanh quỳ."
 },
 {
  "id": "bq_1789372198146_m89qw",
  "loai": "tf",
  "muc": "vd",
  "de": "Pha loãng 1 lít dung dịch NaOH có pH = 9 bằng nước để được dung dịch mới có pH = 8.",
  "y_dung_sai": [
   {
    "y": "Dung dịch ban đầu có [OH⁻] = 10⁻⁵ M.",
    "dung": true
   },
   {
    "y": "Dung dịch sau pha loãng có [OH⁻] = 10⁻⁶ M.",
    "dung": true
   },
   {
    "y": "Thể tích dung dịch sau pha loãng là 9 lít.",
    "dung": false
   },
   {
    "y": "Pha loãng dung dịch base làm pH tăng.",
    "dung": false
   }
  ],
  "giai_thich": "pOH = 14 − pH nên [OH⁻] đổi từ 10⁻⁵ sang 10⁻⁶ M; số mol OH⁻ không đổi nên thể tích tăng 10 lần thành 10 lít, pH của base giảm dần về 7 khi pha loãng."
 },
 {
  "id": "bq_1789372198146_my3sv",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét các chất: NaCl; C₂H₅OH; C₁₂H₂₂O₁₁; HF; Ba(OH)₂; CH₃COOH.",
  "y_dung_sai": [
   {
    "y": "HF là chất điện li yếu.",
    "dung": true
   },
   {
    "y": "C₂H₅OH là chất điện li yếu.",
    "dung": false
   },
   {
    "y": "Ba(OH)₂ là chất điện li mạnh.",
    "dung": true
   },
   {
    "y": "Dung dịch saccharose (C₁₂H₂₂O₁₁) dẫn điện tốt.",
    "dung": false
   }
  ],
  "giai_thich": "HF chỉ phân li một phần; Ba(OH)₂ là base mạnh phân li hoàn toàn; ethanol và saccharose tồn tại ở dạng phân tử trong nước nên không dẫn điện."
 },
 {
  "id": "bq_1789372198146_sjhys",
  "loai": "tf",
  "muc": "nb",
  "de": "Cho dung dịch X có pH = 10.",
  "y_dung_sai": [
   {
    "y": "Dung dịch X có môi trường base.",
    "dung": true
   },
   {
    "y": "Nồng độ H⁺ trong X là 10⁻¹⁰ M.",
    "dung": true
   },
   {
    "y": "Nhỏ phenolphthalein vào X, dung dịch vẫn không màu.",
    "dung": false
   },
   {
    "y": "Nhúng quỳ tím vào X, quỳ tím hóa đỏ.",
    "dung": false
   }
  ],
  "giai_thich": "pH = 10 nên [H⁺] = 10⁻¹⁰ M < 10⁻⁷ M, môi trường base làm phenolphthalein hóa hồng và quỳ tím hóa xanh."
 },
 {
  "id": "bq_1789372198146_ulvor",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét các phát biểu về sự điện li và chất điện li.",
  "y_dung_sai": [
   {
    "y": "Chất điện li là những chất khi tan trong nước phân li ra ion.",
    "dung": true
   },
   {
    "y": "Sự điện li là quá trình phân li các chất trong nước tạo thành ion.",
    "dung": true
   },
   {
    "y": "Dung dịch các chất điện li không dẫn được điện.",
    "dung": false
   },
   {
    "y": "Chất điện li bao gồm oxide, acid, base, muối.",
    "dung": false
   }
  ],
  "giai_thich": "Các ion tự do trong dung dịch chất điện li làm dung dịch dẫn điện; oxide không phải chất điện li, chỉ acid, base và muối mới phân li ra ion."
 },
 {
  "id": "bq_1789372198147_02qi7",
  "loai": "tf",
  "muc": "th",
  "de": "[Hình: một nguồn điện nối với ba cốc dung dịch, mỗi cốc có hai điện cực và một bóng đèn; cốc thứ nhất đèn không sáng, cốc thứ hai đèn sáng yếu, cốc thứ ba đèn sáng tỏ] Cho dòng điện chạy qua dung dịch nước của một chất (X) như thí nghiệm, thấy đèn sáng tỏ.",
  "y_dung_sai": [
   {
    "y": "Chất (X) là chất điện li mạnh.",
    "dung": true
   },
   {
    "y": "Trong dung dịch (X) có các ion dương và ion âm.",
    "dung": true
   },
   {
    "y": "Chất (X) ở dạng rắn khan cũng dẫn điện.",
    "dung": false
   },
   {
    "y": "Dung dịch (X) có thể là dung dịch acid mạnh, base mạnh hoặc muối tan.",
    "dung": true
   }
  ],
  "giai_thich": "Độ sáng của đèn phản ánh nồng độ ion tự do; chất điện li mạnh (acid mạnh, base mạnh, muối tan) cho đèn sáng tỏ, còn chất rắn khan không có ion di chuyển tự do."
 },
 {
  "id": "bq_1789372198147_0thek",
  "loai": "tf",
  "muc": "nb",
  "de": "Đất nhiễm phèn có pH trong khoảng 4,5 – 5,0.",
  "y_dung_sai": [
   {
    "y": "Đất nhiễm phèn có môi trường acid.",
    "dung": true
   },
   {
    "y": "Trong dung dịch đất phèn, [H⁺] > 10⁻⁷ M.",
    "dung": true
   },
   {
    "y": "Có thể bón NH₄Cl để khử chua cho đất phèn.",
    "dung": false
   },
   {
    "y": "Dung dịch đất phèn làm quỳ tím hóa xanh.",
    "dung": false
   }
  ],
  "giai_thich": "pH khoảng 4,5 – 5,0 là môi trường acid làm quỳ hóa đỏ; NH₄⁺ thủy phân tạo H⁺ nên làm đất chua thêm, cần bón vôi để khử chua."
 },
 {
  "id": "bq_1789372198147_1drpz",
  "loai": "tf",
  "muc": "th",
  "de": "Xét cách viết phương trình điện li của HCl, CH₃COOH, HClO, Na₃PO₄.",
  "y_dung_sai": [
   {
    "y": "HCl là chất điện li mạnh nên phương trình điện li dùng mũi tên một chiều.",
    "dung": true
   },
   {
    "y": "CH₃COOH là acid yếu nên phương trình điện li dùng mũi tên hai chiều.",
    "dung": true
   },
   {
    "y": "HClO là acid mạnh, phân li hoàn toàn trong nước.",
    "dung": false
   },
   {
    "y": "Na₃PO₄ → Na₃⁺ + PO₄³⁻.",
    "dung": false
   }
  ],
  "giai_thich": "Acid yếu (CH₃COOH, HClO) điện li thuận nghịch nên dùng ⇌; muối tan phân li hoàn toàn và mỗi ion Na⁺ được viết riêng: Na₃PO₄ → 3Na⁺ + PO₄³⁻."
 },
 {
  "id": "bq_1789372198147_36sr8",
  "loai": "tf",
  "muc": "vd",
  "de": "Để chuẩn độ 300 mL dung dịch HCl a M cần 200 mL dung dịch NaOH 0,015 M, thu được dung dịch X.",
  "y_dung_sai": [
   {
    "y": "Số mol NaOH đã dùng là 0,003 mol.",
    "dung": true
   },
   {
    "y": "Tại điểm tương đương, n(HCl) = n(NaOH).",
    "dung": true
   },
   {
    "y": "Giá trị a = 0,015 M.",
    "dung": false
   },
   {
    "y": "Dung dịch X tại điểm tương đương có môi trường base.",
    "dung": false
   }
  ],
  "giai_thich": "HCl + NaOH → NaCl + H₂O theo tỉ lệ 1 : 1 nên a = 0,003/0,3 = 0,01 M; tại điểm tương đương dung dịch chỉ chứa NaCl, môi trường trung tính."
 },
 {
  "id": "bq_1789372198147_4nyvk",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét dung dịch HCl 0,01 M (ở 25 °C).",
  "y_dung_sai": [
   {
    "y": "[H⁺] trong dung dịch là 10⁻² M.",
    "dung": true
   },
   {
    "y": "pH của dung dịch bằng 2.",
    "dung": true
   },
   {
    "y": "pOH của dung dịch bằng 2.",
    "dung": false
   },
   {
    "y": "Pha loãng dung dịch 10 lần thì pH bằng 1.",
    "dung": false
   }
  ],
  "giai_thich": "pH = −lg 10⁻² = 2 và pOH = 14 − 2 = 12; pha loãng 10 lần làm [H⁺] còn 10⁻³ M nên pH tăng lên 3."
 },
 {
  "id": "bq_1789372198147_5160s",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét sự phân li của các chất: CH₃COOH, Ca(OH)₂, NaCl, C₁₂H₂₂O₁₁ khi tan trong nước.",
  "y_dung_sai": [
   {
    "y": "Saccharose là chất không điện li.",
    "dung": true
   },
   {
    "y": "CH₃COOH phân li một phần thành ion.",
    "dung": true
   },
   {
    "y": "NaCl không phân li ra ion khi tan trong nước.",
    "dung": false
   },
   {
    "y": "Ca(OH)₂ là chất không điện li.",
    "dung": false
   }
  ],
  "giai_thich": "Acid, base, muối tan đều phân li ra ion (mạnh hoặc yếu); saccharose là hợp chất cộng hóa trị không phân li."
 },
 {
  "id": "bq_1789372198147_59142",
  "loai": "tf",
  "muc": "vd",
  "de": "Phân tích 1 mL dịch vị dạ dày của một bệnh nhân thấy số mol H⁺ là 3,16·10⁻⁶ mol (pH bình thường trong khoảng 1,5 đến 3,5).",
  "y_dung_sai": [
   {
    "y": "Nồng độ H⁺ trong dịch vị là 3,16·10⁻³ M.",
    "dung": true
   },
   {
    "y": "pH của dịch vị khoảng 2,5.",
    "dung": true
   },
   {
    "y": "pH dịch vị của bệnh nhân nằm ngoài khoảng bình thường.",
    "dung": false
   },
   {
    "y": "Nồng độ H⁺ trong dịch vị là 3,16·10⁻⁶ M.",
    "dung": false
   }
  ],
  "giai_thich": "Phải chia số mol cho thể tích 10⁻³ L để có nồng độ 3,16·10⁻³ M; pH ≈ 2,5 vẫn nằm trong khoảng 1,5 – 3,5."
 },
 {
  "id": "bq_1789372198147_8zjsi",
  "loai": "tf",
  "muc": "th",
  "de": "Thêm nước vào dung dịch NaOH có pH = 13.",
  "y_dung_sai": [
   {
    "y": "Dung dịch NaOH ban đầu có [OH⁻] = 0,1 M.",
    "dung": true
   },
   {
    "y": "Thêm nước làm [OH⁻] giảm.",
    "dung": true
   },
   {
    "y": "Thêm nước làm pH của dung dịch tăng.",
    "dung": false
   },
   {
    "y": "Pha loãng mãi, pH có thể giảm xuống dưới 7.",
    "dung": false
   }
  ],
  "giai_thich": "pOH = 1 nên [OH⁻] = 0,1 M; pha loãng làm dung dịch base kém base đi và pH chỉ tiến dần về 7, không thể thành môi trường acid."
 },
 {
  "id": "bq_1789372198147_9z1zn",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét khả năng dẫn điện của một số dung dịch.",
  "y_dung_sai": [
   {
    "y": "Dung dịch muối ăn dẫn điện được.",
    "dung": true
   },
   {
    "y": "Dung dịch đường saccharose dẫn điện tốt.",
    "dung": false
   },
   {
    "y": "Dung dịch rượu ethylic không dẫn điện.",
    "dung": true
   },
   {
    "y": "Dung dịch benzene trong alcohol dẫn điện nhờ các ion.",
    "dung": false
   }
  ],
  "giai_thich": "Chỉ dung dịch chứa ion tự do mới dẫn điện; saccharose, ethanol, benzene là chất không điện li."
 },
 {
  "id": "bq_1789372198147_f3w8z",
  "loai": "tf",
  "muc": "th",
  "de": "Xét cân bằng: HCO₃⁻ + H₂O ⇌ …… + H₃O⁺.",
  "y_dung_sai": [
   {
    "y": "Trong cân bằng này, HCO₃⁻ đóng vai trò acid.",
    "dung": true
   },
   {
    "y": "Chất cần điền vào chỗ trống là CO₃²⁻.",
    "dung": true
   },
   {
    "y": "Trong cân bằng này, H₂O đóng vai trò acid.",
    "dung": false
   },
   {
    "y": "HCO₃⁻ chỉ có thể là acid, không thể là base.",
    "dung": false
   }
  ],
  "giai_thich": "H₂O nhận proton tạo H₃O⁺ nên là base; HCO₃⁻ lưỡng tính, cũng có thể nhận proton tạo H₂CO₃."
 },
 {
  "id": "bq_1789372198147_tw0aw",
  "loai": "tf",
  "muc": "th",
  "de": "Xét các phản ứng của HCl, HCO₃⁻, NH₃, CH₃COOH với nước theo thuyết Brønsted – Lowry.",
  "y_dung_sai": [
   {
    "y": "NH₃ nhận H⁺ của nước nên là base.",
    "dung": true
   },
   {
    "y": "HCl cho H⁺ cho nước nên là acid.",
    "dung": true
   },
   {
    "y": "Trong phản ứng của CH₃COOH với nước, CH₃COOH nhận H⁺.",
    "dung": false
   },
   {
    "y": "Trong phản ứng HCO₃⁻ + H₂O ⇌ CO₃²⁻ + H₃O⁺, HCO₃⁻ đóng vai trò base.",
    "dung": false
   }
  ],
  "giai_thich": "Chất cho H⁺ là acid, chất nhận H⁺ là base; nước lưỡng tính, nhận H⁺ từ acid và cho H⁺ cho NH₃."
 },
 {
  "id": "bq_1789372198147_xuvui",
  "loai": "tf",
  "muc": "th",
  "de": "Cho cân bằng: CH₃COOH + H₂O ⇌ CH₃COO⁻ + H₃O⁺.",
  "y_dung_sai": [
   {
    "y": "Trong phản ứng thuận, CH₃COOH là acid.",
    "dung": true
   },
   {
    "y": "Trong phản ứng thuận, H₂O là base.",
    "dung": true
   },
   {
    "y": "Trong phản ứng nghịch, H₃O⁺ là base.",
    "dung": false
   },
   {
    "y": "Trong phản ứng nghịch, CH₃COO⁻ là acid.",
    "dung": false
   }
  ],
  "giai_thich": "Chiều nghịch H₃O⁺ trả H⁺ cho CH₃COO⁻ nên H₃O⁺ là acid, CH₃COO⁻ là base liên hợp của CH₃COOH."
 },
 {
  "id": "bq_1789372198151_1b6l9",
  "loai": "tf",
  "muc": "th",
  "de": "Cho các chất: HNO₃, C₁₂H₂₂O₁₁, BaCl₂, KOH, Na₂SO₄, NaHSO₃, NH₄NO₃, H₂SO₄, Zn, ZnSO₄, O₂, C₂H₅OH.",
  "y_dung_sai": [
   {
    "y": "NaHSO₃ là chất điện li.",
    "dung": true
   },
   {
    "y": "C₂H₅OH là chất không điện li.",
    "dung": true
   },
   {
    "y": "Zn là chất điện li mạnh vì dẫn điện tốt.",
    "dung": false
   },
   {
    "y": "Trong dãy có 10 chất điện li.",
    "dung": false
   }
  ],
  "giai_thich": "Chất điện li là chất phân li ra ion khi tan trong nước; kim loại dẫn điện nhờ electron tự do chứ không phải chất điện li; dãy chỉ có 8 chất điện li."
 },
 {
  "id": "bq_1789372198151_2xog6",
  "loai": "tf",
  "muc": "vd",
  "de": "Trộn 300 mL dung dịch HCl 0,5 M với 500 mL dung dịch H₂SO₄ 0,1 M thu được 800 mL dung dịch X.",
  "y_dung_sai": [
   {
    "y": "Số mol H⁺ do HCl cung cấp là 0,15 mol.",
    "dung": true
   },
   {
    "y": "Số mol H⁺ do H₂SO₄ cung cấp là 0,10 mol.",
    "dung": true
   },
   {
    "y": "Nồng độ H⁺ trong X là 0,2 M.",
    "dung": false
   },
   {
    "y": "Dung dịch X có pH > 7.",
    "dung": false
   }
  ],
  "giai_thich": "Mỗi phân tử H₂SO₄ cho 2 H⁺ nên 0,05 mol H₂SO₄ cho 0,10 mol H⁺; tổng 0,25 mol trong 0,8 L cho [H⁺] = 0,3125 M, môi trường acid."
 },
 {
  "id": "bq_1789372198151_k1ish",
  "loai": "tf",
  "muc": "th",
  "de": "[Hình: ba cốc dung dịch X, Y, Z, mỗi cốc cắm hai điện cực nối với pin và bóng đèn; với dung dịch X đèn không sáng, với dung dịch Y đèn sáng mạnh, với dung dịch Z đèn sáng yếu] Tiến hành thử tính dẫn điện của một số dung dịch như hình.",
  "y_dung_sai": [
   {
    "y": "Dung dịch X có thể là dung dịch glucose, maltose.",
    "dung": true
   },
   {
    "y": "Dung dịch Y có thể là dung dịch H₂SO₄, KOH, FeSO₄.",
    "dung": true
   },
   {
    "y": "Dung dịch Z có thể là dung dịch CH₃COOH, CH₃COONa.",
    "dung": false
   },
   {
    "y": "Dung dịch Y chứa chất điện li yếu và dung dịch Z chứa chất điện li mạnh.",
    "dung": false
   }
  ],
  "giai_thich": "Đèn không sáng: chất không điện li (glucose, maltose); sáng mạnh: chất điện li mạnh; sáng yếu: chất điện li yếu như CH₃COOH, còn CH₃COONa là muối tan điện li mạnh."
 },
 {
  "id": "bq_1789372198151_sikbf",
  "loai": "tf",
  "muc": "vd",
  "de": "Chuẩn độ 10 mL dung dịch HCl 0,1 M (có 2 giọt phenolphthalein, đựng trong bình tam giác) bằng dung dịch NaOH đựng trong buret 25 mL; thể tích NaOH cần dùng là 20 mL.",
  "y_dung_sai": [
   {
    "y": "Dấu hiệu nhận biết điểm tương đương là dung dịch trong bình chuyển từ không màu sang hồng nhạt bền trong khoảng 30 giây.",
    "dung": true
   },
   {
    "y": "Số mol HCl trong bình tam giác là 0,001 mol.",
    "dung": true
   },
   {
    "y": "Nồng độ dung dịch NaOH là 0,1 M.",
    "dung": false
   },
   {
    "y": "Trong thí nghiệm này, NaOH được đựng trong bình tam giác và HCl được đựng trong buret.",
    "dung": false
   }
  ],
  "giai_thich": "Dung dịch có nồng độ đã biết (HCl) được lấy chính xác vào bình, dung dịch cần xác định (NaOH) cho vào buret; tỉ lệ 1 : 1 cho C(NaOH) = 0,001/0,02 = 0,05 M."
 },
 {
  "id": "bq_1789372198151_u9rij",
  "loai": "tf",
  "muc": "th",
  "de": "Một học sinh làm thí nghiệm xác định pH của đất như sau: lấy một lượng đất cho vào nước rồi lọc lấy phần dung dịch. Dùng máy đo pH đo được pH = 4,69.",
  "y_dung_sai": [
   {
    "y": "Môi trường của dung dịch là acid.",
    "dung": true
   },
   {
    "y": "Loại đất trên được gọi là đất chua; để giảm độ chua cho đất có thể bón vôi.",
    "dung": true
   },
   {
    "y": "Nồng độ H⁺ trong cốc lớn hơn 0,001 M.",
    "dung": false
   },
   {
    "y": "Dung dịch trong cốc có [OH⁻] > [H⁺] vì pOH > pH.",
    "dung": false
   }
  ],
  "giai_thich": "[H⁺] = 10^(−4,69) ≈ 2,0·10⁻⁵ M < 0,001 M; pH < pOH nghĩa là [H⁺] > [OH⁻], môi trường acid."
 },
 {
  "id": "bq_1789372198153_8pjcv",
  "loai": "tf",
  "muc": "vd",
  "de": "Để chuẩn độ 10 mL dung dịch HCl nồng độ x M cần 50 mL dung dịch NaOH 0,5 M.",
  "y_dung_sai": [
   {
    "y": "Số mol NaOH đã dùng là 0,025 mol.",
    "dung": true
   },
   {
    "y": "Tại điểm tương đương, n(HCl) = n(NaOH).",
    "dung": true
   },
   {
    "y": "Giá trị x = 0,25 M.",
    "dung": false
   },
   {
    "y": "Tại điểm tương đương, dung dịch có pH < 7.",
    "dung": false
   }
  ],
  "giai_thich": "HCl + NaOH phản ứng tỉ lệ 1 : 1 nên x = 0,025/0,010 = 2,5 M; tại điểm tương đương chỉ còn NaCl, môi trường trung tính."
 },
 {
  "id": "bq_1789372198153_ked6z",
  "loai": "tf",
  "muc": "th",
  "de": "Đo pH của một cốc nước chanh được giá trị pH bằng 2,4.",
  "y_dung_sai": [
   {
    "y": "Nước chanh có môi trường acid.",
    "dung": true
   },
   {
    "y": "Nồng độ ion H⁺ trong nước chanh là 10^(−2,4) mol/L.",
    "dung": true
   },
   {
    "y": "Nồng độ ion H⁺ trong nước chanh là 0,24 mol/L.",
    "dung": false
   },
   {
    "y": "Nồng độ ion OH⁻ trong nước chanh lớn hơn 10⁻⁷ mol/L.",
    "dung": false
   }
  ],
  "giai_thich": "Từ pH = −lg[H⁺] suy ra [H⁺] = 10^(−2,4) ≈ 3,98·10⁻³ M; khi [H⁺] > 10⁻⁷ M thì [OH⁻] < 10⁻⁷ M."
 },
 {
  "id": "bq_1789372198153_lfrui",
  "loai": "tf",
  "muc": "th",
  "de": "Cho các chất: HClO₄, HClO, HF, HNO₃, H₂S, H₂SO₃, NaOH, NaCl, CuSO₄, CH₃COOH.",
  "y_dung_sai": [
   {
    "y": "HClO₄ là chất điện li mạnh.",
    "dung": true
   },
   {
    "y": "CuSO₄ là chất điện li mạnh.",
    "dung": true
   },
   {
    "y": "HF là chất điện li mạnh.",
    "dung": false
   },
   {
    "y": "H₂SO₃ phân li hoàn toàn trong nước.",
    "dung": false
   }
  ],
  "giai_thich": "Acid mạnh, base mạnh, muối tan phân li hoàn toàn; HF và H₂SO₃ là acid yếu nên chỉ phân li một phần."
 },
 {
  "id": "bq_1789372198153_s6s6v",
  "loai": "tf",
  "muc": "vd",
  "de": "Độ acid và độ base của dung dịch có thể được đánh giá bằng nồng độ H⁺ (nồng độ H⁺ càng cao thì pH càng nhỏ) hoặc quy về giá trị pH.",
  "y_dung_sai": [
   {
    "y": "Để so sánh mức độ acid giữa các dung dịch có thể dựa vào nồng độ: dung dịch acid nào có nồng độ mol/lít lớn hơn sẽ có tính acid mạnh hơn.",
    "dung": false
   },
   {
    "y": "Cho các dung dịch có cùng nồng độ: K₂SO₃ (1), NaClO₄ (2), HNO₃ (3), Ca(OH)₂ (4). Chất có giá trị pH cao nhất là (3).",
    "dung": false
   },
   {
    "y": "Cho ba dung dịch có cùng nồng độ: NH₃ (1), Ca(OH)₂ (2), KOH (3). Giá trị pH các dung dịch được sắp xếp theo thứ tự giảm dần là (2), (3), (1).",
    "dung": true
   },
   {
    "y": "Trong các dung dịch có cùng nồng độ, dung dịch có nồng độ ion H⁺ nhỏ hơn và pH cao hơn sẽ có tính acid yếu hơn.",
    "dung": true
   }
  ],
  "giai_thich": "Mức độ acid phải so bằng [H⁺] (phụ thuộc cả nồng độ và độ phân li); HNO₃ là acid mạnh nên pH thấp nhất, còn Ca(OH)₂ có pH cao nhất trong dãy."
 },
 {
  "id": "bq_1789373737083_6arfp",
  "loai": "tf",
  "muc": "th",
  "de": "Xét cách viết phương trình điện li của H₂SO₃, Al₂(SO₄)₃, H₂SO₄ và HClO₄.",
  "y_dung_sai": [
   {
    "y": "HClO₄ → H⁺ + ClO₄⁻ là phương trình điện li viết đúng.",
    "dung": true
   },
   {
    "y": "Al₂(SO₄)₃ phân li cho 2Al³⁺ và 3SO₄²⁻.",
    "dung": true
   },
   {
    "y": "H₂SO₃ là acid mạnh nên phân li hoàn toàn.",
    "dung": false
   },
   {
    "y": "Sự điện li của H₂SO₄ cần đun nóng mới xảy ra.",
    "dung": false
   }
  ],
  "giai_thich": "Phương trình điện li phải bảo toàn cả nguyên tố lẫn điện tích; chất điện li mạnh phân li ngay khi tan trong nước, không cần đun nóng."
 },
 {
  "id": "bq_1789373737083_ei21t",
  "loai": "tf",
  "muc": "vd",
  "de": "Xét ảnh hưởng của phân đạm ammonium đến độ chua của đất.",
  "y_dung_sai": [
   {
    "y": "Ion NH₄⁺ thủy phân theo phương trình NH₄⁺ + H₂O ⇌ NH₃ + H₃O⁺.",
    "dung": true
   },
   {
    "y": "Bón lâu dài phân đạm ammonium làm đất chua thêm.",
    "dung": true
   },
   {
    "y": "Bón phân đạm ammonium làm giảm độ chua của đất.",
    "dung": false
   },
   {
    "y": "Ion NH₄⁺ là base theo thuyết Brønsted – Lowry.",
    "dung": false
   }
  ],
  "giai_thich": "NH₄⁺ cho H⁺ nên là acid; muốn khắc phục đất chua do bón đạm ammonium, người ta bón thêm vôi."
 },
 {
  "id": "bq_1789373737083_l1b5n",
  "loai": "tf",
  "muc": "th",
  "de": "Cho các phương trình: (1) NH₄⁺ ⇌ NH₃ + H⁺; (2) S²⁻ + H₂O ⇌ HS⁻ + OH⁻.",
  "y_dung_sai": [
   {
    "y": "NH₄⁺ là acid theo thuyết Brønsted – Lowry.",
    "dung": true
   },
   {
    "y": "S²⁻ là base theo thuyết Brønsted – Lowry.",
    "dung": true
   },
   {
    "y": "Trong phương trình (2), nước đóng vai trò base.",
    "dung": false
   },
   {
    "y": "Dung dịch chứa ion S²⁻ có môi trường acid.",
    "dung": false
   }
  ],
  "giai_thich": "Ở phương trình (2), nước nhường H⁺ cho S²⁻ nên nước là acid; sản phẩm sinh ra OH⁻ nên dung dịch có môi trường base."
 }
]
```
