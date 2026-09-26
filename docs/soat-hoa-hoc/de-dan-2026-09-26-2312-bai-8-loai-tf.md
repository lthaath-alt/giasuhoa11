# Đề dẫn soát nội dung — 86 câu

Mở tệp này trong Antigravity rồi bảo nó: *"làm đúng yêu cầu trong tệp,
ghi kết quả ra `docs/soat-hoa-hoc/tra-loi-2026-09-26-2312-bai-8-loai-tf-1.json`"*.

**Rồi làm lại LẦN NỮA**, trong một phiên mới, ghi ra
`docs/soat-hoa-hoc/tra-loi-2026-09-26-2312-bai-8-loai-tf-2.json`. Một lượt soát
KHÔNG đủ: đo 20/09/2026, cùng 16 câu chạy ba lượt cho ra 3, 3, rồi 0 câu
nghi ngờ — và ba câu bị bỏ sót ở lượt thứ ba là lỗi THẬT.

Xong thì nạp CẢ HAI, ngăn bằng dấu phẩy, KHÔNG có dấu cách:

```bash
npm run soat:hoa-hoc -- --bai bai-8 --loai tf --nap docs/soat-hoa-hoc/tra-loi-2026-09-26-2312-bai-8-loai-tf-1.json,docs/soat-hoa-hoc/tra-loi-2026-09-26-2312-bai-8-loai-tf-2.json
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
  "id": "b:2:vdc:2",
  "loai": "tf",
  "muc": "vdc",
  "de": "Nhận định về sulfuric acid đặc.",
  "y_dung_sai": [
   {
    "y": "Pha loãng an toàn bằng cách rót từ từ acid đặc vào nước và khuấy đều.",
    "dung": true
   },
   {
    "y": "H₂SO₄ đặc, nguội hòa tan được nhôm.",
    "dung": false
   },
   {
    "y": "H₂SO₄ đặc làm than hóa đường saccharose nhờ tính háo nước.",
    "dung": true
   },
   {
    "y": "Khi tác dụng với Cu, sulfur trong H₂SO₄ bị oxi hóa lên số oxi hóa cao hơn.",
    "dung": false
   }
  ],
  "giai_thich": "Al và Fe bị thụ động hóa trong H₂SO₄ đặc nguội. Khi Cu phản ứng, S giảm số oxi hóa từ +6 xuống +4 tạo SO₂, tức bị khử chứ không bị oxi hóa."
 },
 {
  "id": "bq_1788161089232_p4utb",
  "loai": "tf",
  "muc": "vd",
  "de": "Khi dùng dung dịch NH₃ dư để nhận biết các dung dịch AlCl₃, FeCl₃, ZnCl₂, CuCl₂, KCl, các hiện tượng quan sát được là:",
  "y_dung_sai": [
   {
    "y": "Dung dịch FeCl₃ tạo kết tủa màu nâu đỏ.",
    "dung": true
   },
   {
    "y": "Dung dịch CuCl₂ tạo kết tủa màu xanh, sau đó kết tủa tan dần tạo dung dịch xanh thẫm.",
    "dung": true
   },
   {
    "y": "Dung dịch AlCl₃ tạo kết tủa keo trắng, sau đó kết tủa tan hoàn toàn.",
    "dung": false
   },
   {
    "y": "Dung dịch ZnCl₂ ban đầu tạo kết tủa trắng, sau đó kết tủa tan tạo phức tan.",
    "dung": true
   }
  ],
  "giai_thich": "Al(OH)₃ không tạo phức với NH₃ nên kết tủa trắng không tan trong NH₃ dư. Các ion Cu²⁺, Zn²⁺ tạo phức tan với NH₃ dư."
 },
 {
  "id": "bq_1789371866324_dcszs",
  "loai": "tf",
  "muc": "vd",
  "de": "Một muối X tác dụng với dung dịch HCl và dung dịch NaOH đều tạo khí; X không phản ứng với dung dịch BaCl₂ nhưng phản ứng với dung dịch Ba(OH)₂ vừa cho kết tủa, vừa tạo khí.",
  "y_dung_sai": [
   {
    "y": "X chứa ion NH₄⁺ vì tác dụng với NaOH tạo khí.",
    "dung": true
   },
   {
    "y": "X là (NH₄)₂CO₃.",
    "dung": false
   },
   {
    "y": "Khí tạo ra khi X tác dụng với dung dịch HCl là CO₂.",
    "dung": true
   },
   {
    "y": "Kết tủa tạo ra khi X tác dụng với Ba(OH)₂ là BaSO₄.",
    "dung": false
   }
  ],
  "giai_thich": "(NH₄)₂CO₃ có CO₃²⁻ sẽ kết tủa ngay với BaCl₂ nên X là NH₄HCO₃; HCO₃⁻ + H⁺ tạo CO₂, còn với Ba(OH)₂ tạo kết tủa BaCO₃."
 },
 {
  "id": "bq_1789371866324_j48cs",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét độ tan của một số muối: CaCO₃, BaSO₄, NH₄Cl, AgCl.",
  "y_dung_sai": [
   {
    "y": "NH₄Cl tan tốt trong nước.",
    "dung": true
   },
   {
    "y": "BaSO₄ tan tốt trong nước.",
    "dung": false
   },
   {
    "y": "Hầu hết các muối ammonium đều dễ tan trong nước.",
    "dung": true
   },
   {
    "y": "AgCl tan tốt nên dung dịch AgCl dẫn điện tốt.",
    "dung": false
   }
  ],
  "giai_thich": "Muối ammonium là hợp chất ion dễ tan và điện li mạnh; BaSO₄, AgCl, CaCO₃ là các muối kết tủa."
 },
 {
  "id": "bq_1789371866324_vp4sn",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét quá trình nitrogen trong không khí chuyển hóa thành ion nitrate sau cơn mưa dông kèm sấm sét.",
  "y_dung_sai": [
   {
    "y": "Phản ứng N₂ + O₂ ⇌ 2NO xảy ra nhờ nhiệt độ cao của tia lửa điện.",
    "dung": true
   },
   {
    "y": "NO sinh ra tiếp tục bị oxi hóa thành NO₂.",
    "dung": true
   },
   {
    "y": "NO₂ tác dụng với O₂ và H₂O tạo HNO₃.",
    "dung": true
   },
   {
    "y": "Phản ứng N₂ + 3H₂ ⇌ 2NH₃ xảy ra trong khí quyển khi có sấm sét.",
    "dung": false
   }
  ],
  "giai_thich": "Chuỗi N₂ → NO → NO₂ → HNO₃ là con đường tạo đạm nitrate tự nhiên; tổng hợp NH₃ cần xúc tác, áp suất cao và không xảy ra trong khí quyển."
 },
 {
  "id": "bq_1789371866325_023xx",
  "loai": "tf",
  "muc": "th",
  "de": "Muối X tác dụng với dung dịch NaOH dư sinh khí mùi khai, tác dụng với dung dịch BaCl₂ sinh kết tủa trắng không tan trong HNO₃.",
  "y_dung_sai": [
   {
    "y": "X chứa ion NH₄⁺.",
    "dung": true
   },
   {
    "y": "Kết tủa trắng thu được là BaSO₄.",
    "dung": true
   },
   {
    "y": "X có thể là (NH₄)₂CO₃.",
    "dung": false
   },
   {
    "y": "X có thể là NH₄HSO₃.",
    "dung": false
   }
  ],
  "giai_thich": "BaCO₃ và BaSO₃ đều tan trong HNO₃ vì giải phóng CO₂, SO₂; chỉ BaSO₄ bền với acid nên X là (NH₄)₂SO₄."
 },
 {
  "id": "bq_1789371866325_73clc",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét các ứng dụng của ammonia.",
  "y_dung_sai": [
   {
    "y": "NH₃ được dùng để sản xuất nitric acid.",
    "dung": true
   },
   {
    "y": "NH₃ lỏng được dùng làm chất làm lạnh.",
    "dung": true
   },
   {
    "y": "NH₃ là nguyên liệu chính để sản xuất sulfuric acid.",
    "dung": false
   },
   {
    "y": "NH₃ được dùng làm nhiên liệu cho đèn khí chiếu sáng.",
    "dung": false
   }
  ],
  "giai_thich": "Ứng dụng của NH₃ gắn với nguyên tố nitrogen (phân đạm, HNO₃) và với nhiệt hóa hơi lớn (chất làm lạnh); H₂SO₄ đi từ nguyên tố sulfur."
 },
 {
  "id": "bq_1789371866325_dy52i",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét cách tách NH₃ khỏi hỗn hợp N₂, H₂, NH₃ trong sản xuất ammonia.",
  "y_dung_sai": [
   {
    "y": "NH₃ được tách ra bằng cách nén và làm lạnh để hóa lỏng.",
    "dung": true
   },
   {
    "y": "NH₃ dễ hóa lỏng hơn N₂ và H₂.",
    "dung": true
   },
   {
    "y": "Cho hỗn hợp qua H₂SO₄ đặc để thu NH₃ tinh khiết.",
    "dung": false
   },
   {
    "y": "Cho hỗn hợp qua CuO nung nóng để giữ lại NH₃ nguyên vẹn.",
    "dung": false
   }
  ],
  "giai_thich": "H₂SO₄ và CuO nóng đều phản ứng làm mất NH₃; hóa lỏng tách được NH₃ nhờ lực liên phân tử (liên kết hydrogen) mạnh hơn."
 },
 {
  "id": "bq_1789371866325_f8usk",
  "loai": "tf",
  "muc": "th",
  "de": "Xét khả năng phản ứng của NH₃ với một số chất.",
  "y_dung_sai": [
   {
    "y": "NH₃ phản ứng với dung dịch FeCl₃ tạo kết tủa Fe(OH)₃.",
    "dung": true
   },
   {
    "y": "NH₃ phản ứng với Cl₂ tạo N₂ và HCl.",
    "dung": true
   },
   {
    "y": "NH₃ phản ứng với dung dịch NaOH.",
    "dung": false
   },
   {
    "y": "NH₃ phản ứng với CaO ở điều kiện thường.",
    "dung": false
   }
  ],
  "giai_thich": "NH₃ là base nên không tác dụng với base khác; với dung dịch muối, NH₃ cung cấp OH⁻ làm kết tủa hydroxide kim loại."
 },
 {
  "id": "bq_1789371866325_hsh9u",
  "loai": "tf",
  "muc": "th",
  "de": "Xét cách phân biệt ba dung dịch mất nhãn NaCl, NH₄Cl, NaNO₃.",
  "y_dung_sai": [
   {
    "y": "Quỳ tím hóa đỏ trong dung dịch NH₄Cl.",
    "dung": true
   },
   {
    "y": "Dung dịch AgNO₃ tạo kết tủa trắng với NaCl.",
    "dung": true
   },
   {
    "y": "Phenolphtalein phân biệt được NaCl và NaNO₃.",
    "dung": false
   },
   {
    "y": "Cu tan ngay trong dung dịch NaNO₃ nên dùng Cu để nhận biết NaNO₃.",
    "dung": false
   }
  ],
  "giai_thich": "Phenolphtalein chỉ đổi màu trong môi trường base nên không phân biệt được hai muối trung tính; Cu chỉ tan trong NaNO₃ khi có thêm acid mạnh."
 },
 {
  "id": "bq_1789371866325_yncfe",
  "loai": "tf",
  "muc": "th",
  "de": "Xét việc chọn chất làm khô khí NH₃ có lẫn hơi nước.",
  "y_dung_sai": [
   {
    "y": "Có thể dùng NaOH rắn để làm khô khí NH₃.",
    "dung": true
   },
   {
    "y": "Không dùng H₂SO₄ đặc vì nó phản ứng với NH₃.",
    "dung": true
   },
   {
    "y": "P₂O₅ là chất làm khô thích hợp cho NH₃.",
    "dung": false
   },
   {
    "y": "CuO bột được dùng để làm khô khí NH₃.",
    "dung": false
   }
  ],
  "giai_thich": "NH₃ có tính base nên chỉ làm khô được bằng chất hút ẩm trung tính hoặc có tính base (NaOH, CaO); P₂O₅ là oxide acid, còn CuO bị NH₃ khử khi đun nóng."
 },
 {
  "id": "bq_1789371866325_zz58c",
  "loai": "tf",
  "muc": "th",
  "de": "Xét việc dùng CaO để làm khô khí NH₃.",
  "y_dung_sai": [
   {
    "y": "CaO hút nước theo phản ứng CaO + H₂O → Ca(OH)₂.",
    "dung": true
   },
   {
    "y": "CaO không phản ứng với NH₃ nên làm khô được khí này.",
    "dung": true
   },
   {
    "y": "HNO₃ là chất làm khô thích hợp cho NH₃.",
    "dung": false
   },
   {
    "y": "NH₃ là khí có tính acid nên phải làm khô bằng base.",
    "dung": false
   }
  ],
  "giai_thich": "NH₃ có tính base, vì vậy chỉ chọn chất hút ẩm trung tính hoặc base; acid như HCl, HNO₃, H₂SO₄ sẽ tạo muối ammonium và giữ mất khí."
 },
 {
  "id": "bq_1789371866326_7g1uq",
  "loai": "tf",
  "muc": "th",
  "de": "Xét vai trò của sulfur khi tác dụng với O₂, Al, H₂SO₄ đặc, F₂.",
  "y_dung_sai": [
   {
    "y": "Khi tác dụng với Al, sulfur là chất oxi hóa.",
    "dung": true
   },
   {
    "y": "Khi tác dụng với F₂, sulfur là chất khử.",
    "dung": true
   },
   {
    "y": "Khi tác dụng với O₂, sulfur là chất oxi hóa.",
    "dung": false
   },
   {
    "y": "Khi tác dụng với H₂SO₄ đặc, số oxi hóa của sulfur giảm.",
    "dung": false
   }
  ],
  "giai_thich": "Sulfur chỉ thể hiện tính oxi hóa với chất có độ âm điện nhỏ hơn (kim loại, hydrogen); với O₂, F₂, H₂SO₄ đặc thì số oxi hóa của S tăng."
 },
 {
  "id": "bq_1789371866326_b7zgj",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét các ứng dụng của sulfur.",
  "y_dung_sai": [
   {
    "y": "Sulfur là nguyên liệu chính để sản xuất sulfuric acid.",
    "dung": true
   },
   {
    "y": "Sulfur được dùng làm chất lưu hóa cao su.",
    "dung": true
   },
   {
    "y": "Sulfur được dùng để khử chua đất.",
    "dung": false
   },
   {
    "y": "Sulfur được dùng làm bột nở trong thực phẩm.",
    "dung": false
   }
  ],
  "giai_thich": "Khử chua đất phải dùng chất có tính base như vôi; sulfur trái lại tạo ra hợp chất có tính acid khi bị oxi hóa."
 },
 {
  "id": "bq_1789371866326_cj0gw",
  "loai": "tf",
  "muc": "th",
  "de": "Cho các phản ứng: (1) S + O₂ —t°→ SO₂; (2) S + 3F₂ —t°→ SF₆; (3) S + Hg → HgS; (4) S + 6HNO₃ (đặc) —t°→ H₂SO₄ + 6NO₂ + 2H₂O.",
  "y_dung_sai": [
   {
    "y": "Ở phản ứng (2), sulfur có số oxi hóa +6 trong sản phẩm.",
    "dung": true
   },
   {
    "y": "Ở phản ứng (3), sulfur là chất oxi hóa.",
    "dung": true
   },
   {
    "y": "Ở phản ứng (4), sulfur là chất oxi hóa.",
    "dung": false
   },
   {
    "y": "Cả bốn phản ứng đều có sulfur đóng vai trò chất khử.",
    "dung": false
   }
  ],
  "giai_thich": "So sánh độ âm điện: F, O, N (trong HNO₃) mạnh hơn S nên S nhường electron; Hg yếu hơn S nên S nhận electron."
 },
 {
  "id": "bq_1789371866326_dvz4u",
  "loai": "tf",
  "muc": "th",
  "de": "Xét phản ứng 4S + 6NaOH (đặc) —t°→ 2Na₂S + Na₂S₂O₃ + 3H₂O.",
  "y_dung_sai": [
   {
    "y": "Đây là phản ứng tự oxi hóa – khử của sulfur.",
    "dung": true
   },
   {
    "y": "Trong Na₂S, sulfur có số oxi hóa −2.",
    "dung": true
   },
   {
    "y": "Trong phản ứng S + 2Na → Na₂S, sulfur vừa khử vừa oxi hóa.",
    "dung": false
   },
   {
    "y": "Trong phản ứng S + 3F₂ → SF₆, sulfur là chất oxi hóa.",
    "dung": false
   }
  ],
  "giai_thich": "Chỉ khi cùng một nguyên tố vừa tăng vừa giảm số oxi hóa mới gọi là tự oxi hóa – khử; với Na thì S chỉ bị khử, với F₂ thì S chỉ bị oxi hóa."
 },
 {
  "id": "bq_1789371866326_ku2tq",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét các số oxi hóa của sulfur.",
  "y_dung_sai": [
   {
    "y": "Sulfur có số oxi hóa thấp nhất là −2.",
    "dung": true
   },
   {
    "y": "Sulfur có số oxi hóa cao nhất là +6.",
    "dung": true
   },
   {
    "y": "Sulfur có số oxi hóa +5 trong hợp chất H₂SO₄.",
    "dung": false
   },
   {
    "y": "Sulfur có thể có số oxi hóa −3.",
    "dung": false
   }
  ],
  "giai_thich": "Nguyên tử S nhận thêm 2 electron để đạt cấu hình khí hiếm (−2) hoặc nhường tối đa 6 electron hóa trị (+6); trong H₂SO₄ sulfur ở mức +6."
 },
 {
  "id": "bq_1789371866326_nko8x",
  "loai": "tf",
  "muc": "th",
  "de": "Xét cách xử lí thủy ngân rơi vãi khi vỡ nhiệt kế.",
  "y_dung_sai": [
   {
    "y": "Người ta rắc bột sulfur lên chỗ thủy ngân rơi vãi.",
    "dung": true
   },
   {
    "y": "Phản ứng tạo thành HgS là chất rắn, không bay hơi.",
    "dung": true
   },
   {
    "y": "Phản ứng giữa S và Hg chỉ xảy ra ở nhiệt độ cao.",
    "dung": false
   },
   {
    "y": "Có thể dùng khí Cl₂ để thu hồi thủy ngân rơi vãi.",
    "dung": false
   }
  ],
  "giai_thich": "S + Hg → HgS xảy ra ngay ở nhiệt độ thường, đây là phản ứng hiếm gặp của sulfur ở điều kiện thường và được dùng để khử độc thủy ngân."
 },
 {
  "id": "bq_1789371866326_qym26",
  "loai": "tf",
  "muc": "th",
  "de": "Xét khả năng làm mất màu nước bromine của một số khí.",
  "y_dung_sai": [
   {
    "y": "SO₂ làm mất màu nước bromine.",
    "dung": true
   },
   {
    "y": "Trong phản ứng với nước bromine, SO₂ là chất khử.",
    "dung": true
   },
   {
    "y": "CO₂ làm mất màu nước bromine.",
    "dung": false
   },
   {
    "y": "Trong phản ứng với nước bromine, sulfur trong SO₂ giảm số oxi hóa.",
    "dung": false
   }
  ],
  "giai_thich": "Sulfur trong SO₂ ở mức +4 nên bị Br₂ oxi hóa lên +6 (H₂SO₄); CO₂ không còn khả năng bị oxi hóa vì carbon đã ở mức cao nhất +4."
 },
 {
  "id": "bq_1789371866326_tfufd",
  "loai": "tf",
  "muc": "vd",
  "de": "Hỗn hợp X gồm NH₄Cl và (NH₄)₂SO₄ tác dụng với dung dịch Ba(OH)₂ dư, đun nhẹ, thu được 9,32 gam kết tủa và 2,479 lít khí (đkc).",
  "y_dung_sai": [
   {
    "y": "Kết tủa thu được là BaSO₄ với số mol 0,04 mol.",
    "dung": true
   },
   {
    "y": "Số mol NH₄Cl trong X là 0,02 mol.",
    "dung": true
   },
   {
    "y": "Khí thoát ra là SO₂.",
    "dung": false
   },
   {
    "y": "Khối lượng hỗn hợp X là 5,28 gam.",
    "dung": false
   }
  ],
  "giai_thich": "Ba(OH)₂ vừa kết tủa SO₄²⁻ thành BaSO₄ vừa đẩy NH₃ ra khỏi muối ammonium; tổng NH₄⁺ = 0,1 mol nên khối lượng X là 6,35 gam."
 },
 {
  "id": "bq_1789371866326_yp6pr",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét phạm vi ứng dụng của sulfur.",
  "y_dung_sai": [
   {
    "y": "Sulfur được dùng để điều chế H₂SO₄.",
    "dung": true
   },
   {
    "y": "SO₂ sinh ra từ sulfur được dùng tẩy trắng bột giấy.",
    "dung": true
   },
   {
    "y": "Sulfur được dùng làm bột nở cho bánh.",
    "dung": false
   },
   {
    "y": "Sulfur không có vai trò trong công nghiệp cao su.",
    "dung": false
   }
  ],
  "giai_thich": "Bột nở phải là chất phân hủy sinh khí không độc; sulfur tạo cầu nối −S−S− giữa các mạch cao su nên được dùng để lưu hóa."
 },
 {
  "id": "bq_1789371866326_zwxk9",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét ứng dụng chính của sulfur.",
  "y_dung_sai": [
   {
    "y": "Phần lớn sulfur khai thác được dùng để sản xuất H₂SO₄.",
    "dung": true
   },
   {
    "y": "Sulfur còn được dùng để lưu hóa cao su và chế tạo diêm.",
    "dung": true
   },
   {
    "y": "Ứng dụng chính của sulfur là chế tạo phẩm nhuộm.",
    "dung": false
   },
   {
    "y": "Sulfur không được dùng trong sản xuất thuốc trừ sâu.",
    "dung": false
   }
  ],
  "giai_thich": "Sản xuất sulfuric acid là ứng dụng tiêu thụ nhiều sulfur nhất; lưu hóa cao su, diêm, thuốc trừ sâu là các ứng dụng phụ."
 },
 {
  "id": "bq_1789371866327_076r2",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét mức độ nguy hiểm khi tiếp xúc với H₂SO₄ đặc.",
  "y_dung_sai": [
   {
    "y": "H₂SO₄ đặc bắn vào da gây bỏng nặng.",
    "dung": true
   },
   {
    "y": "Nguyên nhân gây bỏng là tính háo nước và sự tỏa nhiệt mạnh của H₂SO₄ đặc.",
    "dung": true
   },
   {
    "y": "H₂SO₄ đặc gây bỏng lạnh.",
    "dung": false
   },
   {
    "y": "H₂SO₄ đặc bắn vào da không ảnh hưởng đáng kể.",
    "dung": false
   }
  ],
  "giai_thich": "Bỏng lạnh do chất có nhiệt độ rất thấp như nitrogen lỏng gây ra; với H₂SO₄ đặc phải rửa ngay bằng thật nhiều nước rồi đến cơ sở y tế."
 },
 {
  "id": "bq_1789371866327_270gq",
  "loai": "tf",
  "muc": "vd",
  "de": "Cho 21 gam hỗn hợp Zn và CuO phản ứng vừa đủ với 600 mL dung dịch H₂SO₄ 0,5 M.",
  "y_dung_sai": [
   {
    "y": "Tổng số mol Zn và CuO bằng 0,3 mol.",
    "dung": true
   },
   {
    "y": "Khối lượng Zn trong hỗn hợp là 13 gam.",
    "dung": true
   },
   {
    "y": "Số mol CuO trong hỗn hợp là 0,2 mol.",
    "dung": false
   },
   {
    "y": "Phần trăm khối lượng Zn trong hỗn hợp là 73%.",
    "dung": false
   }
  ],
  "giai_thich": "Zn + H₂SO₄ → ZnSO₄ + H₂ và CuO + H₂SO₄ → CuSO₄ + H₂O đều theo tỉ lệ 1 : 1 nên tổng mol hai chất bằng mol acid; Zn 0,2 mol và CuO 0,1 mol."
 },
 {
  "id": "bq_1789371866327_46e88",
  "loai": "tf",
  "muc": "th",
  "de": "Xét phản ứng giữa Fe₂O₃ và H₂SO₄ đặc, nóng.",
  "y_dung_sai": [
   {
    "y": "Sản phẩm gồm Fe₂(SO₄)₃ và H₂O.",
    "dung": true
   },
   {
    "y": "Phản ứng không phải phản ứng oxi hóa – khử.",
    "dung": true
   },
   {
    "y": "Phản ứng sinh ra khí SO₂.",
    "dung": false
   },
   {
    "y": "Muối thu được là FeSO₄.",
    "dung": false
   }
  ],
  "giai_thich": "Fe³⁺ không còn khả năng nhường electron nên S⁺⁶ không bị khử; muốn sinh SO₂ thì oxide phải chứa Fe²⁺ như FeO hoặc Fe₃O₄."
 },
 {
  "id": "bq_1789371866327_4g7jm",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét ứng dụng của ammonium sulfate.",
  "y_dung_sai": [
   {
    "y": "(NH₄)₂SO₄ là thành phần của thuốc trừ sâu hòa tan, thuốc diệt nấm.",
    "dung": true
   },
   {
    "y": "(NH₄)₂SO₄ còn được dùng làm phân đạm cho cây trồng.",
    "dung": true
   },
   {
    "y": "(NH₄)₂SO₄ được dùng làm bột màu cho sơn.",
    "dung": false
   },
   {
    "y": "(NH₄)₂SO₄ không tan trong nước.",
    "dung": false
   }
  ],
  "giai_thich": "Muối ammonium đều tan tốt nên (NH₄)₂SO₄ dễ dàng cung cấp NH₄⁺ cho cây và pha được thành dung dịch phun."
 },
 {
  "id": "bq_1789371866327_55xu5",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét các ứng dụng của sulfuric acid.",
  "y_dung_sai": [
   {
    "y": "H₂SO₄ được dùng để sản xuất phân bón.",
    "dung": true
   },
   {
    "y": "H₂SO₄ được dùng để sản xuất chất tẩy rửa tổng hợp và thuốc trừ sâu.",
    "dung": true
   },
   {
    "y": "H₂SO₄ chỉ được dùng trong phòng thí nghiệm.",
    "dung": false
   },
   {
    "y": "H₂SO₄ được dùng trực tiếp làm phân bón tưới cho cây.",
    "dung": false
   }
  ],
  "giai_thich": "Lượng H₂SO₄ tiêu thụ được xem là thước đo trình độ phát triển công nghiệp của một quốc gia; acid này là nguyên liệu chứ không phải phân bón."
 },
 {
  "id": "bq_1789371866327_a052m",
  "loai": "tf",
  "muc": "vd",
  "de": "Cho 20 gam hỗn hợp X gồm Fe và Cu phản ứng hoàn toàn với H₂SO₄ loãng dư, thu được 12 gam chất rắn không tan.",
  "y_dung_sai": [
   {
    "y": "Chất rắn không tan là Cu.",
    "dung": true
   },
   {
    "y": "Khối lượng Fe trong X là 8 gam.",
    "dung": true
   },
   {
    "y": "Phần trăm khối lượng Fe trong X là 60%.",
    "dung": false
   },
   {
    "y": "Cu tan hết trong dung dịch H₂SO₄ loãng dư.",
    "dung": false
   }
  ],
  "giai_thich": "Cu đứng sau hydrogen nên không khử được H⁺; phần tan chỉ là Fe, từ đó tính được %Fe = 40%."
 },
 {
  "id": "bq_1789371866327_dfevf",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét ứng dụng của barium sulfate.",
  "y_dung_sai": [
   {
    "y": "BaSO₄ được dùng làm bột màu cho công nghiệp sơn.",
    "dung": true
   },
   {
    "y": "BaSO₄ được dùng làm thuốc cản quang khi chụp X-quang dạ dày.",
    "dung": true
   },
   {
    "y": "BaSO₄ được dùng làm chất làm đông đậu hũ.",
    "dung": false
   },
   {
    "y": "BaSO₄ tan tốt trong nước nên dễ gây ngộ độc barium.",
    "dung": false
   }
  ],
  "giai_thich": "Chính vì BaSO₄ gần như không tan nên ion Ba²⁺ độc không được giải phóng, cho phép dùng nó trong y học."
 },
 {
  "id": "bq_1789371866327_fnp54",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét hiện tượng thụ động hóa kim loại trong H₂SO₄ đặc, nguội.",
  "y_dung_sai": [
   {
    "y": "Al và Fe bị thụ động hóa trong H₂SO₄ đặc, nguội.",
    "dung": true
   },
   {
    "y": "Có thể dùng bình bằng nhôm hoặc thép để chuyên chở H₂SO₄ đặc, nguội.",
    "dung": true
   },
   {
    "y": "Cu bị thụ động hóa trong H₂SO₄ đặc, nguội.",
    "dung": false
   },
   {
    "y": "Thụ động hóa nghĩa là kim loại hoàn toàn không phản ứng với acid ở mọi điều kiện.",
    "dung": false
   }
  ],
  "giai_thich": "Lớp oxide mỏng, bền sinh ra ngay trên bề mặt đã bảo vệ kim loại; khi đun nóng lớp oxide bị phá hủy và phản ứng lại xảy ra."
 },
 {
  "id": "bq_1789371866327_fqg9l",
  "loai": "tf",
  "muc": "vd",
  "de": "Nung 11,2 gam Fe và 26 gam Zn với lượng S dư, hòa tan sản phẩm trong dung dịch H₂SO₄ loãng rồi dẫn toàn bộ khí sinh ra vào dung dịch CuSO₄ 10% (D = 1,2 g/mL).",
  "y_dung_sai": [
   {
    "y": "Khí sinh ra là H₂S với số mol 0,6 mol.",
    "dung": true
   },
   {
    "y": "Phản ứng hấp thụ khí là H₂S + CuSO₄ → CuS↓ + H₂SO₄.",
    "dung": true
   },
   {
    "y": "Khối lượng dung dịch CuSO₄ cần dùng là 96 gam.",
    "dung": false
   },
   {
    "y": "Thể tích dung dịch CuSO₄ tối thiểu là 600 mL.",
    "dung": false
   }
  ],
  "giai_thich": "Vì S dư nên toàn bộ Fe, Zn chuyển thành FeS, ZnS và cho H₂S theo tỉ lệ 1 : 1; 96 gam là khối lượng CuSO₄ nguyên chất, dung dịch 10% phải nặng 960 gam."
 },
 {
  "id": "bq_1789371866327_gv7v3",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét tính chất vật lí của sulfuric acid.",
  "y_dung_sai": [
   {
    "y": "H₂SO₄ là chất lỏng sánh như dầu, không màu.",
    "dung": true
   },
   {
    "y": "H₂SO₄ tan vô hạn trong nước và tỏa nhiều nhiệt.",
    "dung": true
   },
   {
    "y": "H₂SO₄ không tan trong nước.",
    "dung": false
   },
   {
    "y": "H₂SO₄ nhẹ hơn nước nên nổi lên trên.",
    "dung": false
   }
  ],
  "giai_thich": "Khối lượng riêng của H₂SO₄ đặc là 1,84 g/mL, nặng gần gấp đôi nước; sự tan tỏa nhiệt mạnh là lí do phải rót acid từ từ vào nước."
 },
 {
  "id": "bq_1789371866327_h1q8l",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét ứng dụng của calcium sulfate.",
  "y_dung_sai": [
   {
    "y": "CaSO₄ được dùng làm chất phụ gia làm đông đậu hũ.",
    "dung": true
   },
   {
    "y": "CaSO₄ còn được gọi là thạch cao.",
    "dung": true
   },
   {
    "y": "CaSO₄ được dùng làm bột màu cho công nghiệp sơn.",
    "dung": false
   },
   {
    "y": "CaSO₄ là thành phần chính của muối tắm.",
    "dung": false
   }
  ],
  "giai_thich": "Bột màu cho sơn là BaSO₄ nhờ độ trắng và độ bền cao, còn muối tắm chủ yếu là MgSO₄."
 },
 {
  "id": "bq_1789371866327_h95zw",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét phản ứng của kim loại với dung dịch H₂SO₄ loãng.",
  "y_dung_sai": [
   {
    "y": "Al, Mg, Na đều tác dụng với dung dịch H₂SO₄ loãng giải phóng H₂.",
    "dung": true
   },
   {
    "y": "Cu không tác dụng với dung dịch H₂SO₄ loãng.",
    "dung": true
   },
   {
    "y": "Cu tác dụng với H₂SO₄ loãng giải phóng khí SO₂.",
    "dung": false
   },
   {
    "y": "Chất oxi hóa trong H₂SO₄ loãng là nguyên tử sulfur.",
    "dung": false
   }
  ],
  "giai_thich": "Trong H₂SO₄ loãng, chất oxi hóa là ion H⁺; Cu chỉ tan trong H₂SO₄ đặc nóng, khi đó sulfur +6 mới đóng vai trò chất oxi hóa."
 },
 {
  "id": "bq_1789371866327_iluec",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét cách nhận biết ion sulfate trong dung dịch.",
  "y_dung_sai": [
   {
    "y": "Thuốc thử của ion SO₄²⁻ là dung dịch chứa ion Ba²⁺.",
    "dung": true
   },
   {
    "y": "Kết tủa BaSO₄ có màu trắng và không tan trong acid mạnh.",
    "dung": true
   },
   {
    "y": "Chỉ có thể dùng Ba(OH)₂ để nhận biết ion sulfate.",
    "dung": false
   },
   {
    "y": "Quỳ tím là thuốc thử đặc trưng của ion sulfate.",
    "dung": false
   }
  ],
  "giai_thich": "Dấu hiệu nhận biết dựa vào độ tan rất nhỏ của BaSO₄; quỳ tím chỉ cho biết môi trường acid – base chứ không xác định được gốc acid."
 },
 {
  "id": "bq_1789371866327_j1ndk",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét việc dùng H₂SO₄ đặc làm chất hút ẩm.",
  "y_dung_sai": [
   {
    "y": "H₂SO₄ đặc chỉ làm khô được những khí không phản ứng với nó.",
    "dung": true
   },
   {
    "y": "Không dùng H₂SO₄ đặc để làm khô khí NH₃.",
    "dung": true
   },
   {
    "y": "H₂SO₄ đặc làm khô được mọi chất khí.",
    "dung": false
   },
   {
    "y": "H₂SO₄ đặc được đóng thành gói hút ẩm để trong thực phẩm.",
    "dung": false
   }
  ],
  "giai_thich": "NH₃ có tính base nên bị H₂SO₄ giữ lại thành muối; gói hút ẩm phải dùng chất rắn an toàn như silica gel chứ không dùng acid lỏng ăn mòn."
 },
 {
  "id": "bq_1789371866327_jjy7y",
  "loai": "tf",
  "muc": "vd",
  "de": "Cho 2,81 gam hỗn hợp Fe₂O₃, MgO, ZnO tan vừa đủ trong 300 mL dung dịch H₂SO₄ 0,1 M.",
  "y_dung_sai": [
   {
    "y": "Số mol H₂SO₄ phản ứng là 0,03 mol.",
    "dung": true
   },
   {
    "y": "Số mol nguyên tử O trong oxide bị thay thế là 0,03 mol.",
    "dung": true
   },
   {
    "y": "Khối lượng muối khan thu được là 3,52 gam.",
    "dung": false
   },
   {
    "y": "Phản ứng của oxide với H₂SO₄ loãng là phản ứng oxi hóa – khử.",
    "dung": false
   }
  ],
  "giai_thich": "Đây chỉ là phản ứng trao đổi giữa oxide base và acid; dùng phương pháp tăng giảm khối lượng cho m(muối) = 2,81 + 0,03·80 = 5,21 gam."
 },
 {
  "id": "bq_1789371866327_kgv73",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét tính chất của dung dịch H₂SO₄ loãng.",
  "y_dung_sai": [
   {
    "y": "H₂SO₄ loãng là acid mạnh.",
    "dung": true
   },
   {
    "y": "H₂SO₄ loãng làm quỳ tím hóa đỏ.",
    "dung": true
   },
   {
    "y": "H₂SO₄ loãng là base mạnh.",
    "dung": false
   },
   {
    "y": "H₂SO₄ loãng có tính oxi hóa mạnh do sulfur +6 gây ra.",
    "dung": false
   }
  ],
  "giai_thich": "Trong dung dịch loãng, tính oxi hóa là của ion H⁺ chứ không phải của sulfur +6; tính oxi hóa mạnh do S⁺⁶ chỉ thể hiện ở acid đặc, nóng."
 },
 {
  "id": "bq_1789371866327_llpec",
  "loai": "tf",
  "muc": "th",
  "de": "Xét phản ứng giữa FeCO₃ và H₂SO₄ đặc, nóng.",
  "y_dung_sai": [
   {
    "y": "Khí thoát ra gồm CO₂ và SO₂.",
    "dung": true
   },
   {
    "y": "Muối sắt thu được là Fe₂(SO₄)₃.",
    "dung": true
   },
   {
    "y": "Phản ứng chỉ là phản ứng trao đổi, không có thay đổi số oxi hóa.",
    "dung": false
   },
   {
    "y": "Khí thoát ra gồm H₂S và CO₂.",
    "dung": false
   }
  ],
  "giai_thich": "Phản ứng vừa mang bản chất trao đổi (CO₃²⁻ → CO₂) vừa là oxi hóa – khử (Fe²⁺ → Fe³⁺, S⁺⁶ → S⁺⁴)."
 },
 {
  "id": "bq_1789371866327_lxrfe",
  "loai": "tf",
  "muc": "th",
  "de": "Xét phương trình aAl + bH₂SO₄ → cAl₂(SO₄)₃ + dSO₂ + eH₂O.",
  "y_dung_sai": [
   {
    "y": "Bộ hệ số nguyên tối giản là 2, 6, 1, 3, 6.",
    "dung": true
   },
   {
    "y": "Tỉ lệ a : b bằng 1 : 3.",
    "dung": true
   },
   {
    "y": "Trong phản ứng, H₂SO₄ chỉ đóng vai trò chất oxi hóa.",
    "dung": false
   },
   {
    "y": "Tỉ lệ a : d bằng 1 : 1.",
    "dung": false
   }
  ],
  "giai_thich": "Trong 6 phân tử H₂SO₄ thì 3 bị khử thành SO₂ còn 3 tạo muối, nên acid vừa là chất oxi hóa vừa là môi trường; a : d = 2 : 3."
 },
 {
  "id": "bq_1789371866327_nm9fn",
  "loai": "tf",
  "muc": "th",
  "de": "Xét sự khác nhau giữa H₂SO₄ đặc, nóng và H₂SO₄ loãng.",
  "y_dung_sai": [
   {
    "y": "Ag tan được trong H₂SO₄ đặc, nóng nhưng không tan trong H₂SO₄ loãng.",
    "dung": true
   },
   {
    "y": "FeSO₄ bị H₂SO₄ đặc, nóng oxi hóa thành Fe₂(SO₄)₃.",
    "dung": true
   },
   {
    "y": "Zn chỉ tan trong H₂SO₄ đặc, nóng.",
    "dung": false
   },
   {
    "y": "NaOH chỉ phản ứng với H₂SO₄ đặc, nóng.",
    "dung": false
   }
  ],
  "giai_thich": "Điểm khác biệt nằm ở tính oxi hóa của S⁺⁶; các phản ứng trung hòa và trao đổi (với NaOH, BaCl₂, MgO) hay với kim loại hoạt động đều xảy ra ở acid loãng."
 },
 {
  "id": "bq_1789371866327_oybgd",
  "loai": "tf",
  "muc": "vd",
  "de": "Cho 6,72 gam Fe vào dung dịch chứa 0,3 mol H₂SO₄ đặc, nóng (SO₂ là sản phẩm khử duy nhất), phản ứng xảy ra hoàn toàn.",
  "y_dung_sai": [
   {
    "y": "H₂SO₄ là chất phản ứng hết.",
    "dung": true
   },
   {
    "y": "Sau khi acid hết, Fe dư tiếp tục khử Fe³⁺ thành Fe²⁺.",
    "dung": true
   },
   {
    "y": "Sau phản ứng vẫn còn 0,02 mol Fe không tan.",
    "dung": false
   },
   {
    "y": "Dung dịch sau phản ứng chỉ chứa FeSO₄.",
    "dung": false
   }
  ],
  "giai_thich": "Phải kiểm tra hai giai đoạn: Fe + H₂SO₄ đặc rồi Fe + Fe₂(SO₄)₃; kết quả cuối là 0,03 mol Fe₂(SO₄)₃ và 0,06 mol FeSO₄, Fe tan hết."
 },
 {
  "id": "bq_1789371866327_sa2f8",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét công thức và tên gọi của một số ion.",
  "y_dung_sai": [
   {
    "y": "Ion sulfate có công thức SO₄²⁻.",
    "dung": true
   },
   {
    "y": "Ion SO₄²⁻ là gốc acid của H₂SO₄.",
    "dung": true
   },
   {
    "y": "Ion sulfate có công thức S²⁻.",
    "dung": false
   },
   {
    "y": "Ion CO₃²⁻ là ion sulfate.",
    "dung": false
   }
  ],
  "giai_thich": "S²⁻ là ion sulfide còn CO₃²⁻ là ion carbonate; hóa trị II của gốc sulfate ứng với hai nguyên tử H bị thay thế trong H₂SO₄."
 },
 {
  "id": "bq_1789371866327_seytr",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét tính háo nước của H₂SO₄ đặc.",
  "y_dung_sai": [
   {
    "y": "H₂SO₄ đặc lấy nước của đường saccharose làm đường hóa đen.",
    "dung": true
   },
   {
    "y": "Sản phẩm rắn màu đen thu được chủ yếu là carbon.",
    "dung": true
   },
   {
    "y": "Hiện tượng đường hóa đen là do tính acid mạnh của H₂SO₄.",
    "dung": false
   },
   {
    "y": "H₂SO₄ loãng cũng có tính háo nước như H₂SO₄ đặc.",
    "dung": false
   }
  ],
  "giai_thich": "Chỉ acid đặc mới tách được H và O dưới dạng nước ra khỏi phân tử hữu cơ; đây là lí do phải rất thận trọng khi làm việc với H₂SO₄ đặc."
 },
 {
  "id": "bq_1789371866327_u1p6k",
  "loai": "tf",
  "muc": "th",
  "de": "Xét phản ứng của H₂SO₄ đặc, nóng với một số chất.",
  "y_dung_sai": [
   {
    "y": "Fe₂O₃ tác dụng với H₂SO₄ đặc, nóng không sinh ra khí.",
    "dung": true
   },
   {
    "y": "FeO tác dụng với H₂SO₄ đặc, nóng sinh ra khí SO₂.",
    "dung": true
   },
   {
    "y": "BaCO₃ tác dụng với H₂SO₄ không sinh ra khí.",
    "dung": false
   },
   {
    "y": "Cu tác dụng với H₂SO₄ đặc, nóng không sinh ra khí.",
    "dung": false
   }
  ],
  "giai_thich": "Chất có nguyên tố ở số oxi hóa chưa cao nhất (Fe²⁺, Cu⁰, S⁰) sẽ bị khử S⁺⁶ thành SO₂; muối carbonate thì sinh CO₂."
 },
 {
  "id": "bq_1789371866327_v9lap",
  "loai": "tf",
  "muc": "vdc",
  "de": "Nung hỗn hợp X gồm FeS và FeS₂ trong bình kín chứa không khí (20% O₂, 80% N₂) đến phản ứng hoàn toàn, thu được một chất rắn duy nhất và hỗn hợp khí Y gồm 84,8% N₂, 14% SO₂ và phần còn lại là O₂.",
  "y_dung_sai": [
   {
    "y": "Chất rắn duy nhất thu được là Fe₂O₃.",
    "dung": true
   },
   {
    "y": "Số mol N₂ không thay đổi trong quá trình nung.",
    "dung": true
   },
   {
    "y": "Trong hỗn hợp X, số mol FeS lớn hơn số mol FeS₂.",
    "dung": false
   },
   {
    "y": "Phần trăm khối lượng FeS trong X là 42,31%.",
    "dung": false
   }
  ],
  "giai_thich": "N₂ là khí trơ nên dùng làm mốc để tính lượng O₂ ban đầu; giải hệ theo SO₂ và O₂ tiêu thụ cho n(FeS₂) = 3·n(FeS), ứng với %FeS = 19,64%."
 },
 {
  "id": "bq_1789371866327_x2yui",
  "loai": "tf",
  "muc": "vd",
  "de": "Hòa tan hoàn toàn 2,32 gam hỗn hợp FeO, Fe₂O₃, Fe₃O₄ (số mol FeO bằng số mol Fe₂O₃) bằng dung dịch H₂SO₄ 0,5 M vừa đủ.",
  "y_dung_sai": [
   {
    "y": "Có thể quy đổi hỗn hợp thành Fe₃O₄ vì FeO và Fe₂O₃ có số mol bằng nhau.",
    "dung": true
   },
   {
    "y": "Số mol H₂SO₄ cần dùng là 0,04 mol.",
    "dung": true
   },
   {
    "y": "Thể tích dung dịch H₂SO₄ cần dùng là 0,16 lít.",
    "dung": false
   },
   {
    "y": "Phản ứng hòa tan trên là phản ứng oxi hóa – khử.",
    "dung": false
   }
  ],
  "giai_thich": "FeO + Fe₂O₃ cộng lại đúng bằng Fe₃O₄ nên cả hỗn hợp tương đương 0,01 mol Fe₃O₄; phản ứng với acid loãng chỉ là trao đổi, V = 0,08 L."
 },
 {
  "id": "bq_1789371866327_xg157",
  "loai": "tf",
  "muc": "th",
  "de": "Xét cách nhận biết bốn dung dịch HCl, Na₂SO₄, NaCl, Ba(OH)₂ chỉ bằng một thuốc thử.",
  "y_dung_sai": [
   {
    "y": "Quỳ tím hóa xanh trong dung dịch Ba(OH)₂ và hóa đỏ trong dung dịch HCl.",
    "dung": true
   },
   {
    "y": "Sau khi nhận ra Ba(OH)₂, dùng chính nó để phân biệt Na₂SO₄ với NaCl.",
    "dung": true
   },
   {
    "y": "Quỳ tím phân biệt trực tiếp được Na₂SO₄ và NaCl.",
    "dung": false
   },
   {
    "y": "Chỉ dùng dung dịch AgNO₃ là nhận biết được cả bốn dung dịch.",
    "dung": false
   }
  ],
  "giai_thich": "Na₂SO₄ và NaCl đều là muối trung tính nên không đổi màu quỳ; mẹo của bài là dùng chất vừa nhận ra làm thuốc thử cho bước tiếp theo."
 },
 {
  "id": "bq_1789371866327_xv83d",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét tính chất hóa học của H₂SO₄ đặc.",
  "y_dung_sai": [
   {
    "y": "H₂SO₄ đặc có tính oxi hóa mạnh.",
    "dung": true
   },
   {
    "y": "Tính oxi hóa mạnh của H₂SO₄ đặc do sulfur ở số oxi hóa +6 gây ra.",
    "dung": true
   },
   {
    "y": "H₂SO₄ đặc có tính lưỡng tính.",
    "dung": false
   },
   {
    "y": "H₂SO₄ đặc không tác dụng được với kim loại đứng sau hydrogen.",
    "dung": false
   }
  ],
  "giai_thich": "Sulfur ở mức oxi hóa cao nhất +6 chỉ có thể bị khử, nhờ đó H₂SO₄ đặc nóng oxi hóa được cả Cu, Ag là các kim loại đứng sau hydrogen."
 },
 {
  "id": "bq_1789371866327_yakzc",
  "loai": "tf",
  "muc": "th",
  "de": "Xét khả năng phản ứng của kim loại với dung dịch H₂SO₄ loãng.",
  "y_dung_sai": [
   {
    "y": "K, Mg, Al, Fe, Zn đều phản ứng với dung dịch H₂SO₄ loãng.",
    "dung": true
   },
   {
    "y": "Sản phẩm khí của các phản ứng này là H₂.",
    "dung": true
   },
   {
    "y": "Ag phản ứng với dung dịch H₂SO₄ loãng.",
    "dung": false
   },
   {
    "y": "Au và Pt tan được trong dung dịch H₂SO₄ loãng.",
    "dung": false
   }
  ],
  "giai_thich": "Tiêu chí duy nhất là vị trí của kim loại so với hydrogen trong dãy hoạt động hóa học; Au, Pt là kim loại quý, rất kém hoạt động."
 },
 {
  "id": "bq_1789371866327_yhkyl",
  "loai": "tf",
  "muc": "vdc",
  "de": "Dùng 300 tấn quặng pyrite (FeS₂) có lẫn 20% tạp chất để sản xuất H₂SO₄ 98% với hiệu suất toàn quá trình là 90%.",
  "y_dung_sai": [
   {
    "y": "Khối lượng FeS₂ nguyên chất là 240 tấn.",
    "dung": true
   },
   {
    "y": "Theo sơ đồ, 1 mol FeS₂ cho 2 mol H₂SO₄.",
    "dung": true
   },
   {
    "y": "Khối lượng H₂SO₄ nguyên chất thu được là 360 tấn.",
    "dung": false
   },
   {
    "y": "Khối lượng dung dịch H₂SO₄ 98% thu được là 320 tấn.",
    "dung": false
   }
  ],
  "giai_thich": "Hai nguyên tử S trong FeS₂ cho hai phân tử H₂SO₄; 352,8 tấn là acid nguyên chất, còn 360 tấn là khối lượng dung dịch 98%."
 },
 {
  "id": "bq_1789371866328_bw7yt",
  "loai": "tf",
  "muc": "th",
  "de": "So sánh tính chất hóa học của H₂SO₄ loãng và H₂SO₄ đặc.",
  "y_dung_sai": [
   {
    "y": "H₂SO₄ loãng tác dụng với kim loại đứng trước hydrogen giải phóng khí H₂.",
    "dung": true
   },
   {
    "y": "H₂SO₄ đặc, nóng oxi hóa được cả Cu và Ag, thường sinh khí SO₂.",
    "dung": true
   },
   {
    "y": "H₂SO₄ loãng có tính háo nước như H₂SO₄ đặc.",
    "dung": false
   },
   {
    "y": "Cu tác dụng với H₂SO₄ loãng giải phóng khí H₂.",
    "dung": false
   }
  ],
  "giai_thich": "Tính háo nước và tính oxi hóa mạnh do S⁺⁶ chỉ có ở acid đặc; Cu đứng sau hydrogen nên trơ với acid loãng."
 },
 {
  "id": "bq_1789371866328_bxm9n",
  "loai": "tf",
  "muc": "th",
  "de": "Xét quy trình sản xuất sulfuric acid trong công nghiệp.",
  "y_dung_sai": [
   {
    "y": "Giai đoạn oxi hóa SO₂ thành SO₃ dùng xúc tác V₂O₅.",
    "dung": true
   },
   {
    "y": "Nguyên liệu ban đầu có thể là sulfur hoặc quặng pyrite FeS₂.",
    "dung": true
   },
   {
    "y": "Người ta hấp thụ SO₃ trực tiếp vào nước để thu H₂SO₄.",
    "dung": false
   },
   {
    "y": "Giai đoạn đầu tiên là chuyển SO₃ thành SO₂.",
    "dung": false
   }
  ],
  "giai_thich": "Hấp thụ SO₃ vào nước tỏa nhiệt rất mạnh tạo mù acid khó ngưng tụ, nên phải dùng H₂SO₄ đặc để hấp thụ tạo oleum rồi mới pha loãng."
 },
 {
  "id": "bq_1789371866328_f52pi",
  "loai": "tf",
  "muc": "th",
  "de": "Xét quy tắc an toàn khi sử dụng và bảo quản sulfuric acid đặc.",
  "y_dung_sai": [
   {
    "y": "Khi pha loãng phải rót từ từ acid đặc vào nước và khuấy đều.",
    "dung": true
   },
   {
    "y": "Khi acid bắn vào da phải rửa ngay bằng thật nhiều nước rồi đến cơ sở y tế.",
    "dung": true
   },
   {
    "y": "Có thể rửa vết bỏng acid bằng dung dịch NaOH đặc để trung hòa.",
    "dung": false
   },
   {
    "y": "Nên bảo quản H₂SO₄ đặc trong lọ hở miệng để acid không bị nóng.",
    "dung": false
   }
  ],
  "giai_thich": "H₂SO₄ đặc hút ẩm mạnh và ăn mòn nên phải đựng trong lọ kín; phản ứng trung hòa bằng base đặc tỏa nhiệt lớn, càng làm tổn thương da."
 },
 {
  "id": "bq_1789372198145_c5voc",
  "loai": "tf",
  "muc": "nb",
  "de": "Về diêm tiêu Chile (diêm tiêu natri):",
  "y_dung_sai": [
   {
    "y": "Diêm tiêu Chile có công thức NaNO₃.",
    "dung": true
   },
   {
    "y": "Diêm tiêu Chile là một muối ammonium.",
    "dung": false
   },
   {
    "y": "Diêm tiêu Chile có thể dùng làm phân đạm vì chứa nguyên tố nitrogen.",
    "dung": true
   },
   {
    "y": "Trong diêm tiêu Chile, nitrogen có số oxi hóa −3.",
    "dung": false
   }
  ],
  "giai_thich": "NaNO₃ là muối nitrate của sodium, không chứa ion NH₄⁺; nitrogen trong ion NO₃⁻ có số oxi hóa +5 và cung cấp đạm cho cây."
 },
 {
  "id": "bq_1789372198146_4s4sn",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét khả năng tan của nhôm trong các dung dịch acid.",
  "y_dung_sai": [
   {
    "y": "Al bị thụ động trong HNO₃ đặc, nguội.",
    "dung": true
   },
   {
    "y": "Al tan trong dung dịch HCl giải phóng khí H₂.",
    "dung": true
   },
   {
    "y": "Al không tan trong dung dịch HNO₃ loãng.",
    "dung": false
   },
   {
    "y": "Có thể dùng bình nhôm để chuyên chở dung dịch HNO₃ loãng.",
    "dung": false
   }
  ],
  "giai_thich": "Chỉ acid đặc, nguội mới làm Al thụ động; HNO₃ loãng vẫn oxi hóa Al tạo muối Al(NO₃)₃."
 },
 {
  "id": "bq_1789372198147_0bksa",
  "loai": "tf",
  "muc": "th",
  "de": "Xét sự tạo thành SO₂ khi nung một số quặng trong không khí.",
  "y_dung_sai": [
   {
    "y": "Nung pyrite trong không khí tạo SO₂: 4FeS₂ + 11O₂ → 2Fe₂O₃ + 8SO₂.",
    "dung": true
   },
   {
    "y": "Chu sa (HgS) khi nung trong không khí tạo ra SO₂.",
    "dung": true
   },
   {
    "y": "Nung thạch cao sống ở khoảng 150 °C tạo thành SO₂.",
    "dung": false
   },
   {
    "y": "Chalcopyrite là quặng không chứa sulfur.",
    "dung": false
   }
  ],
  "giai_thich": "Sulfur ở số oxi hóa −1, −2 trong quặng sulfide bị O₂ oxi hóa lên +4 (SO₂); trong thạch cao S đã ở +6 và chỉ mất nước khi nung nhẹ."
 },
 {
  "id": "bq_1789372198147_2mkud",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét phản ứng của kim loại với H₂SO₄ đặc, nguội.",
  "y_dung_sai": [
   {
    "y": "Fe, Al, Cr bị thụ động hóa trong H₂SO₄ đặc, nguội.",
    "dung": true
   },
   {
    "y": "Có thể dùng bình thép để chứa H₂SO₄ đặc, nguội.",
    "dung": true
   },
   {
    "y": "Mg bị thụ động trong H₂SO₄ đặc, nguội.",
    "dung": false
   },
   {
    "y": "Al tan mạnh trong H₂SO₄ đặc, nguội giải phóng SO₂.",
    "dung": false
   }
  ],
  "giai_thich": "Lớp oxide bền hình thành trên bề mặt Fe, Al, Cr ngăn acid đặc, nguội tiếp xúc với kim loại nên có thể chứa acid này trong bình thép, bình nhôm."
 },
 {
  "id": "bq_1789372198147_931mb",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét số oxi hóa của sulfur.",
  "y_dung_sai": [
   {
    "y": "Trong H₂SO₄, sulfur có số oxi hóa +6.",
    "dung": true
   },
   {
    "y": "Các số oxi hóa phổ biến của sulfur là −2, 0, +4, +6.",
    "dung": true
   },
   {
    "y": "Số oxi hóa cao nhất của sulfur là +8.",
    "dung": false
   },
   {
    "y": "Trong SO₂, sulfur có số oxi hóa cao nhất.",
    "dung": false
   }
  ],
  "giai_thich": "Sulfur có 6 electron lớp ngoài cùng nên số oxi hóa cao nhất là +6; SO₂ có S⁺⁴ là số oxi hóa trung gian."
 },
 {
  "id": "bq_1789372198147_fsc3e",
  "loai": "tf",
  "muc": "vd",
  "de": "Cho FeS tác dụng với dung dịch H₂SO₄ loãng, thu được khí (A); nếu dùng dung dịch H₂SO₄ đặc, nóng thì thu được khí (B). Dẫn khí (B) vào dung dịch của (A) thu được rắn (C).",
  "y_dung_sai": [
   {
    "y": "Khí (A) là H₂S.",
    "dung": true
   },
   {
    "y": "Khí (B) là SO₂.",
    "dung": true
   },
   {
    "y": "Trong phản ứng SO₂ + 2H₂S → 3S + 2H₂O, SO₂ là chất khử.",
    "dung": false
   },
   {
    "y": "Rắn (C) là FeS₂.",
    "dung": false
   }
  ],
  "giai_thich": "H₂SO₄ loãng chỉ trao đổi H⁺ tạo H₂S; trong phản ứng giữa SO₂ và H₂S, S⁺⁴ nhận electron (chất oxi hóa) còn S⁻² nhường electron, cùng tạo sulfur rắn màu vàng."
 },
 {
  "id": "bq_1789372198147_juuuj",
  "loai": "tf",
  "muc": "th",
  "de": "Xét các chất: S, SO₂, SO₃, H₂SO₄.",
  "y_dung_sai": [
   {
    "y": "S vừa có tính oxi hóa, vừa có tính khử.",
    "dung": true
   },
   {
    "y": "SO₂ vừa có tính oxi hóa, vừa có tính khử.",
    "dung": true
   },
   {
    "y": "H₂SO₄ có tính khử vì chứa nguyên tố S.",
    "dung": false
   },
   {
    "y": "SO₃ vừa có tính oxi hóa, vừa có tính khử.",
    "dung": false
   }
  ],
  "giai_thich": "Chất chứa nguyên tố ở số oxi hóa trung gian mới thể hiện cả hai tính; S⁺⁶ trong SO₃, H₂SO₄ không thể tăng số oxi hóa nữa."
 },
 {
  "id": "bq_1789372198147_oigub",
  "loai": "tf",
  "muc": "th",
  "de": "Xét phản ứng của một số chất với dung dịch H₂SO₄ loãng.",
  "y_dung_sai": [
   {
    "y": "FeO tác dụng với H₂SO₄ loãng tạo FeSO₄ và H₂O.",
    "dung": true
   },
   {
    "y": "BaCl₂ tác dụng với H₂SO₄ loãng tạo kết tủa BaSO₄.",
    "dung": true
   },
   {
    "y": "Zn tác dụng với H₂SO₄ loãng là phản ứng trao đổi.",
    "dung": false
   },
   {
    "y": "Na₂CO₃ không tác dụng với H₂SO₄ loãng.",
    "dung": false
   }
  ],
  "giai_thich": "Kim loại đứng trước H khử H⁺ thành H₂ (oxi hóa – khử); muối carbonate phản ứng với acid giải phóng CO₂ theo kiểu trao đổi."
 },
 {
  "id": "bq_1789372198147_sdtjq",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét oleum và giai đoạn hấp thụ SO₃ trong sản xuất sulfuric acid.",
  "y_dung_sai": [
   {
    "y": "Oleum có công thức tổng quát H₂SO₄.nSO₃.",
    "dung": true
   },
   {
    "y": "Trong sản xuất H₂SO₄, SO₃ được hấp thụ bằng H₂SO₄ 98% tạo oleum.",
    "dung": true
   },
   {
    "y": "Trong công nghiệp, SO₃ được hấp thụ trực tiếp bằng nước để tạo H₂SO₄.",
    "dung": false
   },
   {
    "y": "Oleum là dung dịch SO₂ trong nước.",
    "dung": false
   }
  ],
  "giai_thich": "SO₃ tác dụng với nước tỏa nhiệt mạnh tạo sương mù acid khó hấp thụ, nên người ta hấp thụ SO₃ bằng H₂SO₄ đặc tạo oleum rồi pha loãng."
 },
 {
  "id": "bq_1789372198147_xyqtk",
  "loai": "tf",
  "muc": "th",
  "de": "Xét vai trò của NH₃ trong một số phản ứng.",
  "y_dung_sai": [
   {
    "y": "Trong phản ứng 4NH₃ + 5O₂ → 4NO + 6H₂O, số oxi hóa của N tăng từ −3 lên +2.",
    "dung": true
   },
   {
    "y": "Phản ứng NH₃ + HCl → NH₄Cl thể hiện tính khử của NH₃.",
    "dung": false
   },
   {
    "y": "Phản ứng NH₃ + H₂O ⇌ NH₄⁺ + OH⁻ thể hiện tính base của NH₃.",
    "dung": true
   },
   {
    "y": "Trong phản ứng với O₂ (xúc tác Pt), NH₃ là chất oxi hóa.",
    "dung": false
   }
  ],
  "giai_thich": "N trong NH₃ có số oxi hóa thấp nhất −3 nên chỉ có thể nhường electron (tính khử); phản ứng nhận H⁺ không đổi số oxi hóa, đó là tính base."
 },
 {
  "id": "bq_1789372198151_apq7p",
  "loai": "tf",
  "muc": "th",
  "de": "Xét các phản ứng của H₂SO₄ đặc.",
  "y_dung_sai": [
   {
    "y": "H₂SO₄ đặc oxi hóa FeO thành Fe₂(SO₄)₃.",
    "dung": true
   },
   {
    "y": "H₂SO₄ đặc oxi hóa được carbon thành CO₂.",
    "dung": true
   },
   {
    "y": "Phản ứng FeO + H₂SO₄ đặc → FeSO₄ + H₂O là phản ứng đúng.",
    "dung": false
   },
   {
    "y": "Trong phản ứng với HI, H₂SO₄ đặc đóng vai trò chất khử.",
    "dung": false
   }
  ],
  "giai_thich": "H₂SO₄ đặc là chất oxi hóa mạnh: đưa Fe⁺² lên Fe⁺³, C lên C⁺⁴, I⁻ lên I₂, còn bản thân S⁺⁶ bị khử thành SO₂."
 },
 {
  "id": "bq_1789372198151_ibbnl",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét cách pha loãng dung dịch H₂SO₄ đặc.",
  "y_dung_sai": [
   {
    "y": "Phải rót từ từ acid đặc vào nước và khuấy đều.",
    "dung": true
   },
   {
    "y": "Quá trình hòa tan H₂SO₄ đặc vào nước tỏa nhiều nhiệt.",
    "dung": true
   },
   {
    "y": "Có thể rót nước vào acid đặc cho nhanh.",
    "dung": false
   },
   {
    "y": "Khi pha loãng acid không cần dùng dụng cụ bảo hộ.",
    "dung": false
   }
  ],
  "giai_thich": "Rót nước vào acid đặc làm lớp nước nhỏ bị đun sôi tức thì, bắn acid ra ngoài gây bỏng; luôn phải đeo kính, găng tay khi làm việc với H₂SO₄."
 },
 {
  "id": "bq_1789372198151_kgce6",
  "loai": "tf",
  "muc": "th",
  "de": "Cho phản ứng hóa học: S + H₂SO₄ đặc —t°→ X + H₂O.",
  "y_dung_sai": [
   {
    "y": "X là SO₂.",
    "dung": true
   },
   {
    "y": "Trong phản ứng, S là chất khử và H₂SO₄ là chất oxi hóa.",
    "dung": true
   },
   {
    "y": "Phương trình đã cân bằng là S + H₂SO₄ → SO₂ + H₂O.",
    "dung": false
   },
   {
    "y": "X là SO₃.",
    "dung": false
   }
  ],
  "giai_thich": "Bảo toàn electron: S nhường 4e, mỗi S⁺⁶ nhận 2e nên cần 2H₂SO₄: S + 2H₂SO₄ → 3SO₂ + 2H₂O."
 },
 {
  "id": "bq_1789372198151_s8b17",
  "loai": "tf",
  "muc": "th",
  "de": "Xét phản ứng của dung dịch H₂SO₄ loãng với một số chất.",
  "y_dung_sai": [
   {
    "y": "Fe tác dụng với H₂SO₄ loãng giải phóng khí H₂.",
    "dung": true
   },
   {
    "y": "Fe(OH)₃ tác dụng với H₂SO₄ loãng tạo Fe₂(SO₄)₃ và H₂O.",
    "dung": true
   },
   {
    "y": "Cu tác dụng với H₂SO₄ loãng giải phóng khí H₂.",
    "dung": false
   },
   {
    "y": "H₂SO₄ loãng oxi hóa được sulfur thành SO₂.",
    "dung": false
   }
  ],
  "giai_thich": "Trong H₂SO₄ loãng, tác nhân oxi hóa chỉ là H⁺ nên không oxi hóa được Cu, S; tính oxi hóa của S⁺⁶ chỉ thể hiện ở H₂SO₄ đặc."
 },
 {
  "id": "bq_1789372198151_twy26",
  "loai": "tf",
  "muc": "th",
  "de": "Xét các quá trình liên quan đến dung dịch H₂SO₄ đặc.",
  "y_dung_sai": [
   {
    "y": "Phản ứng Cu + 2H₂SO₄ đặc → CuSO₄ + SO₂ + 2H₂O thể hiện tính oxi hóa mạnh của H₂SO₄ đặc.",
    "dung": true
   },
   {
    "y": "H₂SO₄ đặc oxi hóa được ion Br⁻ thành Br₂.",
    "dung": true
   },
   {
    "y": "Dẫn N₂ ẩm qua H₂SO₄ đặc thể hiện tính oxi hóa của acid.",
    "dung": false
   },
   {
    "y": "H₂SO₄ đặc oxi hóa N₂ thành NO₂.",
    "dung": false
   }
  ],
  "giai_thich": "H₂SO₄ đặc chỉ hút hơi nước khỏi N₂ (tính háo nước) vì N₂ rất trơ; tính oxi hóa thể hiện khi S⁺⁶ nhận electron từ Cu hay Br⁻."
 },
 {
  "id": "bq_1789372198151_y1mwq",
  "loai": "tf",
  "muc": "vd",
  "de": "Pha chế 2 lít dung dịch H₂SO₄ 0,05 M từ dung dịch H₂SO₄ 98% (D = 1,84 g/mL).",
  "y_dung_sai": [
   {
    "y": "Khối lượng H₂SO₄ nguyên chất cần là 9,8 gam.",
    "dung": true
   },
   {
    "y": "Khối lượng dung dịch H₂SO₄ 98% cần lấy là 10 gam.",
    "dung": true
   },
   {
    "y": "Thể tích dung dịch H₂SO₄ 98% cần lấy là 10 mL.",
    "dung": false
   },
   {
    "y": "Khi pha, rót nước vào dung dịch acid đặc.",
    "dung": false
   }
  ],
  "giai_thich": "Thể tích = khối lượng/khối lượng riêng = 10/1,84 ≈ 5,43 mL; khi pha phải rót từ từ acid đặc vào nước để tránh bắn acid."
 },
 {
  "id": "bq_1789372198152_1uwzc",
  "loai": "tf",
  "muc": "vd",
  "de": "Hỗn hợp X gồm NH₄Cl và (NH₄)₂SO₄. Cho X tác dụng với dung dịch Ba(OH)₂ dư, đun nhẹ thu được 9,32 gam kết tủa và 2,479 lít (đkc) khí thoát ra.",
  "y_dung_sai": [
   {
    "y": "Số mol (NH₄)₂SO₄ trong X là 0,04 mol.",
    "dung": true
   },
   {
    "y": "Khí thoát ra là NH₃ với số mol 0,1 mol.",
    "dung": true
   },
   {
    "y": "Số mol NH₄Cl trong X là 0,1 mol.",
    "dung": false
   },
   {
    "y": "Kết tủa thu được là BaCl₂.",
    "dung": false
   }
  ],
  "giai_thich": "Kết tủa là BaSO₄ nên n(SO₄²⁻) = 0,04 mol; mỗi NH₄⁺ cho một NH₃, trừ 0,08 mol NH₄⁺ của (NH₄)₂SO₄ còn 0,02 mol NH₄Cl."
 },
 {
  "id": "bq_1789372198152_2580w",
  "loai": "tf",
  "muc": "vd",
  "de": "Cho 21,3 gam hỗn hợp bột X gồm 3 kim loại Mg, Cu và Al tác dụng hoàn toàn với O₂ (có đun nóng), thu được hỗn hợp chất rắn B có khối lượng 33,3 gam. Để hòa tan hoàn toàn B cần phải dùng tối thiểu V mL hỗn hợp HCl 2M và H₂SO₄ 1M.",
  "y_dung_sai": [
   {
    "y": "Số mol nguyên tử O trong B là 0,75 mol.",
    "dung": true
   },
   {
    "y": "Số mol H₂O tạo thành khi hòa tan B là 1,5 mol.",
    "dung": false
   },
   {
    "y": "Số mol HCl đã dùng là 1,5 mol.",
    "dung": false
   },
   {
    "y": "Giá trị của V là 750 mL.",
    "dung": false
   }
  ],
  "giai_thich": "O²⁻ + 2H⁺ → H₂O nên n(H₂O) = n(O) = 0,75 mol và n(H⁺) = 1,5 mol; V = 1,5/4 = 0,375 L, trong đó n(HCl) = 2·0,375 = 0,75 mol."
 },
 {
  "id": "bq_1789372198152_5j8qd",
  "loai": "tf",
  "muc": "vdc",
  "de": "Hòa tan hoàn toàn 24 gam hỗn hợp X gồm MO, M(OH)₂ và MCO₃ (M là kim loại có hóa trị không đổi) trong 100 gam dung dịch H₂SO₄ 39,2%, thu được 1,2395 lít khí (đkc) và dung dịch Y chỉ chứa một chất tan duy nhất có nồng độ 39,41%.",
  "y_dung_sai": [
   {
    "y": "Khối lượng dung dịch Y là 121,8 gam.",
    "dung": true
   },
   {
    "y": "Khối lượng chất tan trong dung dịch Y là 24 gam.",
    "dung": false
   },
   {
    "y": "M là Mg.",
    "dung": true
   },
   {
    "y": "Khối lượng hỗn hợp X bằng khối lượng chất tan trong Y.",
    "dung": false
   }
  ],
  "giai_thich": "Chất tan duy nhất là MSO₄ với số mol bằng n(H₂SO₄) = 0,4; khối lượng của nó là 0,3941·121,8 ≈ 48 g (khác 24 g của X), cho M(MSO₄) = 120 nên M là Mg."
 },
 {
  "id": "bq_1789372198152_wa3ch",
  "loai": "tf",
  "muc": "vdc",
  "de": "Sản xuất dung dịch H₂SO₄ 93% (D = 1,83 g/mL) từ 800 tấn quặng pyrite sắt (FeS₂) chứa 25% tạp chất không cháy, tỉ lệ hao hụt 5%.",
  "y_dung_sai": [
   {
    "y": "Khối lượng FeS₂ nguyên chất là 600 tấn.",
    "dung": true
   },
   {
    "y": "Theo bảo toàn nguyên tố S, 1 mol FeS₂ tạo tối đa 2 mol H₂SO₄.",
    "dung": true
   },
   {
    "y": "Khối lượng H₂SO₄ thu được sau hao hụt là 980 tấn.",
    "dung": false
   },
   {
    "y": "Thể tích dung dịch H₂SO₄ 93% thu được khoảng 1001 m³.",
    "dung": false
   }
  ],
  "giai_thich": "980 tấn là lượng lí thuyết, sau hao hụt còn 931 tấn; 1001 là khối lượng dung dịch (tấn), chia cho D = 1,83 mới được thể tích ≈ 547 m³."
 },
 {
  "id": "bq_1789372198152_zuq5w",
  "loai": "tf",
  "muc": "vd",
  "de": "Pha chế dung dịch CuSO₄ 0,8% (dùng trừ nấm thực vật) từ 60 gam CuSO₄.5H₂O.",
  "y_dung_sai": [
   {
    "y": "60 gam CuSO₄.5H₂O chứa 38,4 gam CuSO₄.",
    "dung": true
   },
   {
    "y": "Khối lượng dung dịch CuSO₄ 0,8% pha được là 4800 gam.",
    "dung": true
   },
   {
    "y": "Khi tính nồng độ, chất tan được lấy là toàn bộ khối lượng CuSO₄.5H₂O.",
    "dung": false
   },
   {
    "y": "Khối lượng dung dịch pha được là 7500 gam.",
    "dung": false
   }
  ],
  "giai_thich": "Nước kết tinh trở thành một phần dung môi nên chất tan chỉ là CuSO₄ (160/250 khối lượng tinh thể); 38,4/0,008 = 4800 g."
 },
 {
  "id": "bq_1789372198153_ctvy5",
  "loai": "tf",
  "muc": "nb",
  "de": "So sánh tính chất hóa học của dung dịch H₂SO₄ đặc và dung dịch H₂SO₄ loãng.",
  "y_dung_sai": [
   {
    "y": "H₂SO₄ đặc có tính oxi hóa mạnh do nguyên tử S⁺⁶.",
    "dung": true
   },
   {
    "y": "H₂SO₄ đặc có tính háo nước.",
    "dung": true
   },
   {
    "y": "H₂SO₄ loãng oxi hóa được Cu giải phóng SO₂.",
    "dung": false
   },
   {
    "y": "H₂SO₄ đặc có tính khử mạnh.",
    "dung": false
   }
  ],
  "giai_thich": "S đã ở số oxi hóa cao nhất +6 nên H₂SO₄ không có tính khử; chỉ acid đặc mới oxi hóa được Cu, còn acid loãng không phản ứng với Cu."
 },
 {
  "id": "bq_1789372198153_t6amx",
  "loai": "tf",
  "muc": "vd",
  "de": "Pha chế 500 mL dung dịch H₂SO₄ 0,05 M từ dung dịch H₂SO₄ 98% (D = 1,84 g/mL).",
  "y_dung_sai": [
   {
    "y": "Số mol H₂SO₄ cần là 0,025 mol.",
    "dung": true
   },
   {
    "y": "Khối lượng dung dịch H₂SO₄ 98% cần lấy là 2,5 gam.",
    "dung": true
   },
   {
    "y": "Thể tích dung dịch acid 98% cần lấy được tính bằng 2,5 × 1,84.",
    "dung": false
   },
   {
    "y": "Thể tích dung dịch H₂SO₄ 98% cần lấy là 2,45 mL.",
    "dung": false
   }
  ],
  "giai_thich": "Thể tích bằng khối lượng chia khối lượng riêng: V = 2,5/1,84 ≈ 1,36 mL; 2,45 g là khối lượng H₂SO₄ nguyên chất chứ không phải thể tích."
 },
 {
  "id": "bq_1789373737083_1oind",
  "loai": "tf",
  "muc": "vdc",
  "de": "Từ 1 tấn quặng pyrite chứa 80% FeS₂ sản xuất H₂SO₄ 95% (D = 1,82 g/mL) với hiệu suất toàn quá trình 90%.",
  "y_dung_sai": [
   {
    "y": "Khối lượng FeS₂ nguyên chất là 800 kg.",
    "dung": true
   },
   {
    "y": "Khối lượng H₂SO₄ nguyên chất thu được là 1176 kg.",
    "dung": true
   },
   {
    "y": "Từ 1 mol FeS₂ chỉ thu được 1 mol H₂SO₄.",
    "dung": false
   },
   {
    "y": "Khối lượng dung dịch H₂SO₄ 95% thu được bằng 1176 kg.",
    "dung": false
   }
  ],
  "giai_thich": "Hai nguyên tử sulfur trong FeS₂ cho hai phân tử H₂SO₄; 1176 kg là acid nguyên chất, còn khối lượng dung dịch 95% là 1176/0,95 ≈ 1237,9 kg."
 },
 {
  "id": "bq_1789373737083_9owat",
  "loai": "tf",
  "muc": "th",
  "de": "Xét khả năng phản ứng của Cu, Zn, Mg, Fe với dung dịch H₂SO₄ loãng và H₂SO₄ đặc, nguội.",
  "y_dung_sai": [
   {
    "y": "Fe tan trong H₂SO₄ loãng nhưng bị thụ động trong H₂SO₄ đặc, nguội.",
    "dung": true
   },
   {
    "y": "Cu không tan trong dung dịch H₂SO₄ loãng.",
    "dung": true
   },
   {
    "y": "Zn bị thụ động hóa trong H₂SO₄ đặc, nguội.",
    "dung": false
   },
   {
    "y": "Mg không tan trong dung dịch H₂SO₄ loãng.",
    "dung": false
   }
  ],
  "giai_thich": "Chỉ Al, Fe, Cr bị thụ động hóa trong acid đặc nguội; Zn và Mg tan được trong cả acid loãng lẫn acid đặc."
 },
 {
  "id": "bq_1789373737083_atcnb",
  "loai": "tf",
  "muc": "th",
  "de": "Xét các phản ứng: (a) NH₃ + HCl; (b) FeO + H₂SO₄ loãng; (c) Cu + H₂SO₄ đặc, nóng; (d) BaCl₂ + Na₂SO₄.",
  "y_dung_sai": [
   {
    "y": "Phản ứng (a) tạo thành khói trắng NH₄Cl.",
    "dung": true
   },
   {
    "y": "Phản ứng (d) tạo kết tủa trắng BaSO₄.",
    "dung": true
   },
   {
    "y": "Phản ứng (b) tạo ra khí SO₂.",
    "dung": false
   },
   {
    "y": "Phản ứng (c) giải phóng khí H₂.",
    "dung": false
   }
  ],
  "giai_thich": "FeO tác dụng với acid loãng chỉ là trao đổi tạo FeSO₄ và H₂O; Cu đứng sau hydrogen nên không thể giải phóng H₂, khí thoát ra là SO₂."
 },
 {
  "id": "bq_1789373737083_b2ay4",
  "loai": "tf",
  "muc": "th",
  "de": "Xét phản ứng của NH₃ với dung dịch HCl, dung dịch AlCl₃, dung dịch NaOH và O₂.",
  "y_dung_sai": [
   {
    "y": "NH₃ phản ứng với dung dịch HCl tạo NH₄Cl.",
    "dung": true
   },
   {
    "y": "Dung dịch NH₃ tác dụng với dung dịch AlCl₃ tạo kết tủa Al(OH)₃.",
    "dung": true
   },
   {
    "y": "NH₃ phản ứng với dung dịch NaOH.",
    "dung": false
   },
   {
    "y": "NH₃ không phản ứng với O₂ ở bất kì điều kiện nào.",
    "dung": false
   }
  ],
  "giai_thich": "NH₃ là base yếu và chất khử: phản ứng với acid, muối của kim loại có hydroxide không tan, và cháy trong O₂ khi đun nóng; hai base không phản ứng với nhau."
 },
 {
  "id": "bq_1789373737083_cxsqq",
  "loai": "tf",
  "muc": "th",
  "de": "Xét phản ứng của H₂SO₄ đặc, nóng với các cặp chất P và Mg; Fe và KOH; Cu(OH)₂ và BaCl₂; Na₂CO₃ và Al₂O₃.",
  "y_dung_sai": [
   {
    "y": "Cu(OH)₂ và BaCl₂ tác dụng với H₂SO₄ đặc, nóng không sinh ra khí.",
    "dung": true
   },
   {
    "y": "Na₂CO₃ tác dụng với H₂SO₄ sinh ra khí CO₂.",
    "dung": true
   },
   {
    "y": "Mg tác dụng với H₂SO₄ đặc, nóng không sinh ra khí.",
    "dung": false
   },
   {
    "y": "KOH tác dụng với H₂SO₄ đặc, nóng sinh ra khí SO₂.",
    "dung": false
   }
  ],
  "giai_thich": "Kim loại và phi kim khử S⁺⁶ thành SO₂ (có thể cả S, H₂S); phản ứng trung hòa với KOH chỉ cho muối và nước."
 },
 {
  "id": "bq_1789373737083_lii4p",
  "loai": "tf",
  "muc": "th",
  "de": "Xét phản ứng của Zn, Na₂SO₃, Cu và NaCl với dung dịch H₂SO₄ loãng.",
  "y_dung_sai": [
   {
    "y": "Zn tác dụng với H₂SO₄ loãng giải phóng H₂.",
    "dung": true
   },
   {
    "y": "Na₂SO₃ tác dụng với H₂SO₄ loãng giải phóng khí SO₂.",
    "dung": true
   },
   {
    "y": "Cu tác dụng với H₂SO₄ loãng.",
    "dung": false
   },
   {
    "y": "NaCl tác dụng với H₂SO₄ loãng tạo kết tủa.",
    "dung": false
   }
  ],
  "giai_thich": "Muối sulfite gặp acid mạnh tạo H₂SO₃ phân hủy thành SO₂; ion Ba²⁺ tạo kết tủa BaSO₄; NaCl và Cu không phản ứng với acid loãng."
 },
 {
  "id": "bq_1789373737083_s8953",
  "loai": "tf",
  "muc": "vdc",
  "de": "Hỗn hợp X gồm SO₂ và O₂ có tỉ khối so với H₂ bằng 28; lấy 4,958 lít X (đkc) cho qua V₂O₅ nung nóng rồi dẫn hỗn hợp sau phản ứng qua dung dịch Ba(OH)₂ dư thu được 33,51 gam kết tủa.",
  "y_dung_sai": [
   {
    "y": "Hỗn hợp X ban đầu gồm 0,15 mol SO₂ và 0,05 mol O₂.",
    "dung": true
   },
   {
    "y": "Kết tủa thu được gồm BaSO₄ và BaSO₃.",
    "dung": true
   },
   {
    "y": "Toàn bộ SO₂ đã chuyển hết thành SO₃.",
    "dung": false
   },
   {
    "y": "Hiệu suất phản ứng oxi hóa SO₂ là 60%.",
    "dung": false
   }
  ],
  "giai_thich": "SO₃ tạo BaSO₄ (M = 233) còn SO₂ dư tạo BaSO₃ (M = 217); từ khối lượng kết tủa tính được SO₂ phản ứng 0,06 mol, hiệu suất 40%."
 },
 {
  "id": "bq_1789373737083_u17mp",
  "loai": "tf",
  "muc": "th",
  "de": "[Hình: ba cách pha loãng H₂SO₄. Cách 1: cốc đựng H₂O, rót H₂SO₄ vào cốc. Cách 2: cốc đựng H₂SO₄, rót H₂O vào cốc. Cách 3: rót đồng thời H₂O và H₂SO₄ vào một cốc rỗng.] Xét cách pha loãng H₂SO₄ đặc an toàn.",
  "y_dung_sai": [
   {
    "y": "Cách 1 là cách pha loãng đúng.",
    "dung": true
   },
   {
    "y": "Quá trình hòa tan H₂SO₄ đặc vào nước tỏa rất nhiều nhiệt.",
    "dung": true
   },
   {
    "y": "Cách 2 an toàn vì lượng nước thêm vào từ từ.",
    "dung": false
   },
   {
    "y": "Có thể rót đồng thời nước và acid vào cốc như cách 3.",
    "dung": false
   }
  ],
  "giai_thich": "Khi rót nước vào acid đặc, lượng nước nhỏ nhận toàn bộ nhiệt nên sôi tức thì và bắn acid; còn rót acid vào nhiều nước thì nhiệt được phân tán an toàn."
 },
 {
  "id": "bq_1789373737083_zhiin",
  "loai": "tf",
  "muc": "th",
  "de": "Xét cách điều chế và ứng dụng của SO₂.",
  "y_dung_sai": [
   {
    "y": "Trong phòng thí nghiệm, SO₂ được điều chế từ muối sulfite và dung dịch acid mạnh.",
    "dung": true
   },
   {
    "y": "SO₂ là chất trung gian trong quy trình sản xuất H₂SO₄.",
    "dung": true
   },
   {
    "y": "Trong phòng thí nghiệm, SO₂ được điều chế bằng cách đốt quặng pyrite.",
    "dung": false
   },
   {
    "y": "SO₂ không có khả năng tẩy trắng.",
    "dung": false
   }
  ],
  "giai_thich": "Đốt pyrite hoặc sulfur cần thiết bị và nhiệt độ cao nên chỉ phù hợp quy mô công nghiệp; tính khử mạnh của SO₂ là cơ sở cho khả năng tẩy trắng."
 }
]
```
