# Đề dẫn soát nội dung — 67 câu

Mở tệp này trong Antigravity rồi bảo nó: *"làm đúng yêu cầu trong tệp,
ghi kết quả ra `docs/soat-hoa-hoc/tra-loi-2026-09-26-2311-bai-5-loai-tf-1.json`"*.

**Rồi làm lại LẦN NỮA**, trong một phiên mới, ghi ra
`docs/soat-hoa-hoc/tra-loi-2026-09-26-2311-bai-5-loai-tf-2.json`. Một lượt soát
KHÔNG đủ: đo 20/09/2026, cùng 16 câu chạy ba lượt cho ra 3, 3, rồi 0 câu
nghi ngờ — và ba câu bị bỏ sót ở lượt thứ ba là lỗi THẬT.

Xong thì nạp CẢ HAI, ngăn bằng dấu phẩy, KHÔNG có dấu cách:

```bash
npm run soat:hoa-hoc -- --bai bai-5 --loai tf --nap docs/soat-hoa-hoc/tra-loi-2026-09-26-2311-bai-5-loai-tf-1.json,docs/soat-hoa-hoc/tra-loi-2026-09-26-2311-bai-5-loai-tf-2.json
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
  "id": "bq_1789371866323_aaglg",
  "loai": "tf",
  "muc": "th",
  "de": "Xét phản ứng nhiệt phân một số muối ammonium.",
  "y_dung_sai": [
   {
    "y": "Nhiệt phân NH₄Cl thu được NH₃ và HCl.",
    "dung": true
   },
   {
    "y": "Nhiệt phân NH₄NO₂ thu được N₂ và H₂O.",
    "dung": true
   },
   {
    "y": "Nhiệt phân NH₄NO₃ thu được NH₃ và HNO₃.",
    "dung": false
   },
   {
    "y": "Nhiệt phân NH₄HCO₃ không tạo ra chất khí.",
    "dung": false
   }
  ],
  "giai_thich": "NH₄Cl, NH₄HCO₃ phân hủy giải phóng NH₃ (và HCl hoặc CO₂); với NH₄NO₂, NH₄NO₃, ion NH₄⁺ bị gốc acid oxi hóa nên tạo N₂ hoặc N₂O."
 },
 {
  "id": "bq_1789371866324_2jetd",
  "loai": "tf",
  "muc": "vdc",
  "de": "Sản xuất nitric acid từ ammonia theo sơ đồ NH₃ → NO → NO₂ → HNO₃ để điều chế 150 tấn dung dịch HNO₃ 60%, hiệu suất cả quá trình là 76,2%.",
  "y_dung_sai": [
   {
    "y": "Khối lượng HNO₃ nguyên chất cần điều chế là 90 tấn.",
    "dung": true
   },
   {
    "y": "Theo bảo toàn nguyên tố N, 1 mol NH₃ tạo tối đa 1 mol HNO₃.",
    "dung": true
   },
   {
    "y": "Khối lượng NH₃ cần dùng nếu hiệu suất 100% là 31,9 tấn.",
    "dung": false
   },
   {
    "y": "Khối lượng NH₃ thực tế cần dùng xấp xỉ 31,9 tấn.",
    "dung": true
   }
  ],
  "giai_thich": "Mỗi phân tử NH₃ chứa 1 N và chuyển hết thành 1 HNO₃, nên lí thuyết cần 90·17/63 ≈ 24,3 tấn; chia cho hiệu suất 0,762 được khoảng 31,9 tấn."
 },
 {
  "id": "bq_1789371866324_34y3e",
  "loai": "tf",
  "muc": "nb",
  "de": "Cho dung dịch NaOH vào dung dịch NH₄Cl rồi đun nóng.",
  "y_dung_sai": [
   {
    "y": "Khí thoát ra là NH₃.",
    "dung": true
   },
   {
    "y": "Khí thoát ra có màu nâu đỏ.",
    "dung": false
   },
   {
    "y": "Khí thoát ra có mùi khai.",
    "dung": true
   },
   {
    "y": "Khí thoát ra làm giấy quỳ tím ẩm hóa đỏ.",
    "dung": false
   }
  ],
  "giai_thich": "Khí NH₃ không màu, mùi khai, khi tan trong nước tạo OH⁻ nên làm quỳ ẩm hóa xanh; khí màu nâu đỏ là NO₂."
 },
 {
  "id": "bq_1789371866324_5uuo8",
  "loai": "tf",
  "muc": "nb",
  "de": "Nhỏ vài giọt phenolphthalein vào dung dịch NH₃.",
  "y_dung_sai": [
   {
    "y": "Dung dịch NH₃ có môi trường base.",
    "dung": true
   },
   {
    "y": "Phenolphthalein chuyển sang màu hồng trong dung dịch NH₃.",
    "dung": true
   },
   {
    "y": "Dung dịch NH₃ làm quỳ tím hóa đỏ.",
    "dung": false
   },
   {
    "y": "NH₃ là base mạnh, phân li hoàn toàn trong nước.",
    "dung": false
   }
  ],
  "giai_thich": "NH₃ là base yếu: chỉ một phần NH₃ nhận H⁺ của nước tạo OH⁻, nhưng đủ để làm phenolphthalein hóa hồng và quỳ tím hóa xanh."
 },
 {
  "id": "bq_1789371866324_6xcks",
  "loai": "tf",
  "muc": "th",
  "de": "Tiến hành thí nghiệm theo các bước sau: Bước 1: Nạp đầy khí ammonia vào bình thủy tinh trong suốt, đậy bình bằng nút cao su có ống thủy tinh vuốt nhọn xuyên qua. Bước 2: Nhúng đầu ống thủy tinh vào một chậu thủy tinh chứa nước có pha thêm dung dịch phenolphthalein.",
  "y_dung_sai": [
   {
    "y": "Ở bước 2, một lát sau nước trong chậu phun vào bình thành những tia có màu hồng.",
    "dung": true
   },
   {
    "y": "Phenolphthalein chuyển sang màu hồng, chứng tỏ dung dịch thu được có tính acid.",
    "dung": false
   },
   {
    "y": "Khí ammonia tan nhiều trong nước, làm giảm áp suất trong bình và nước bị hút vào bình.",
    "dung": true
   },
   {
    "y": "Thí nghiệm này chứng minh ammonia là một chất có tính khử mạnh.",
    "dung": false
   }
  ],
  "giai_thich": "Thí nghiệm chứng minh NH₃ tan nhiều trong nước và dung dịch có tính base (phenolphthalein hóa hồng), không liên quan tới tính khử."
 },
 {
  "id": "bq_1789371866324_bryav",
  "loai": "tf",
  "muc": "th",
  "de": "Xét các phát biểu về nitrogen.",
  "y_dung_sai": [
   {
    "y": "Trong không khí, N₂ chiếm khoảng 78% về thể tích.",
    "dung": true
   },
   {
    "y": "Phân tử N₂ có liên kết ba bền vững nên N₂ trơ về mặt hóa học ngay cả khi đun nóng.",
    "dung": false
   },
   {
    "y": "Trong phản ứng giữa N₂ và H₂ thì N₂ vừa là chất oxi hóa, vừa là chất khử.",
    "dung": false
   },
   {
    "y": "Phần lớn N₂ được sử dụng để tổng hợp NH₃, từ đó sản xuất nitric acid, phân bón.",
    "dung": true
   }
  ],
  "giai_thich": "N₂ chỉ trơ ở điều kiện thường, ở nhiệt độ cao phản ứng được; trong phản ứng với H₂, số oxi hóa N chỉ giảm nên N₂ chỉ đóng vai trò chất oxi hóa."
 },
 {
  "id": "bq_1789371866324_eepkz",
  "loai": "tf",
  "muc": "th",
  "de": "Tiến hành thí nghiệm: Bước 1: Cho khoảng 2 gam NH₄Cl vào ống nghiệm, thêm khoảng 2 mL nước cất, lắc đều đến khi tan hết. Bước 2: Cho 2 mL dung dịch NaOH đặc vào ống nghiệm, lắc đều rồi đun nhẹ. Bước 3: Đặt mẩu giấy quỳ tím ẩm lên miệng ống nghiệm.",
  "y_dung_sai": [
   {
    "y": "Ở bước 2 có khí mùi khai thoát ra.",
    "dung": true
   },
   {
    "y": "Phương trình hóa học: NH₄Cl + NaOH → NaCl + NH₃ + H₂O.",
    "dung": true
   },
   {
    "y": "Ở bước 3, giấy quỳ tím ẩm chuyển sang màu đỏ.",
    "dung": false
   },
   {
    "y": "Có thể thay dung dịch NaOH bằng dung dịch HCl mà vẫn thu được hiện tượng tương tự.",
    "dung": false
   }
  ],
  "giai_thich": "Ion OH⁻ nhận proton của NH₄⁺ giải phóng khí NH₃ có tính base làm xanh quỳ ẩm; HCl không phản ứng với NH₄Cl nên không có khí."
 },
 {
  "id": "bq_1789371866324_gtaxn",
  "loai": "tf",
  "muc": "th",
  "de": "Cho hai phản ứng: N₂ + 3H₂ ⇌ 2NH₃ (1); N₂ + O₂ ⇌ 2NO (2).",
  "y_dung_sai": [
   {
    "y": "Trong (1), số oxi hóa của N giảm từ 0 xuống −3.",
    "dung": true
   },
   {
    "y": "Trong (1), N₂ là chất oxi hóa.",
    "dung": true
   },
   {
    "y": "Trong (2), N₂ là chất oxi hóa.",
    "dung": false
   },
   {
    "y": "Nitrogen chỉ thể hiện tính khử trong mọi phản ứng.",
    "dung": false
   }
  ],
  "giai_thich": "N₂ có số oxi hóa trung gian 0 nên vừa có tính oxi hóa (với H₂, kim loại) vừa có tính khử (với O₂)."
 },
 {
  "id": "bq_1789371866324_w6r1h",
  "loai": "tf",
  "muc": "th",
  "de": "Xét phản ứng nhiệt phân các muối NH₄NO₃, NH₄Cl, (NH₄)₂CO₃, NH₄HCO₃.",
  "y_dung_sai": [
   {
    "y": "Nhiệt phân NH₄NO₃ thu được N₂O và H₂O.",
    "dung": true
   },
   {
    "y": "Nhiệt phân NH₄Cl tạo NH₃ và HCl, khi nguội hai khí lại kết hợp thành NH₄Cl.",
    "dung": true
   },
   {
    "y": "Nhiệt phân (NH₄)₂CO₃ không tạo ra chất khí.",
    "dung": false
   },
   {
    "y": "Nhiệt phân NH₄HCO₃ chỉ thu được chất rắn.",
    "dung": false
   }
  ],
  "giai_thich": "Các muối ammonium carbonate và hydrogencarbonate phân hủy hoàn toàn thành khí NH₃, CO₂ và hơi nước; NH₄NO₃ bị oxi hóa – khử nội phân tử tạo N₂O."
 },
 {
  "id": "bq_1789371866325_43zbt",
  "loai": "tf",
  "muc": "th",
  "de": "Xét sản phẩm phản ứng của nitrogen với một số chất.",
  "y_dung_sai": [
   {
    "y": "N₂ tác dụng với H₂ tạo khí NH₃.",
    "dung": true
   },
   {
    "y": "N₂ tác dụng với O₂ tạo khí NO.",
    "dung": true
   },
   {
    "y": "N₂ tác dụng với kim loại hoạt động tạo hợp chất khí.",
    "dung": false
   },
   {
    "y": "N₂ tác dụng với H₂ ở điều kiện thường.",
    "dung": false
   }
  ],
  "giai_thich": "Nitride kim loại như Li₃N, Mg₃N₂ là chất rắn; phản ứng tổng hợp NH₃ cần nhiệt độ, áp suất cao và xúc tác."
 },
 {
  "id": "bq_1789371866325_8eknv",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét điều kiện tổng hợp ammonia trong công nghiệp.",
  "y_dung_sai": [
   {
    "y": "Chất xúc tác dùng trong tổng hợp NH₃ là sắt.",
    "dung": true
   },
   {
    "y": "Xúc tác giúp phản ứng nhanh đạt trạng thái cân bằng.",
    "dung": true
   },
   {
    "y": "Xúc tác Fe làm tăng hiệu suất cân bằng tạo NH₃.",
    "dung": false
   },
   {
    "y": "Chất xúc tác trong tổng hợp NH₃ là thủy ngân.",
    "dung": false
   }
  ],
  "giai_thich": "Xúc tác làm tăng tốc độ hai chiều như nhau nên không đổi hiệu suất cân bằng, chỉ giúp đạt cân bằng nhanh hơn."
 },
 {
  "id": "bq_1789371866325_9jok9",
  "loai": "tf",
  "muc": "th",
  "de": "Xét vai trò của NH₃ trong một số phản ứng hóa học.",
  "y_dung_sai": [
   {
    "y": "Trong phản ứng 2NH₃ + 2Na → 2NaNH₂ + H₂, NH₃ là chất oxi hóa.",
    "dung": true
   },
   {
    "y": "Trong phản ứng 2NH₃ + 3Cl₂ → N₂ + 6HCl, NH₃ là chất khử.",
    "dung": true
   },
   {
    "y": "Trong phản ứng 4NH₃ + 5O₂ → 4NO + 6H₂O, NH₃ là chất oxi hóa.",
    "dung": false
   },
   {
    "y": "Nguyên tử nitrogen trong NH₃ có thể nhận thêm electron.",
    "dung": false
   }
  ],
  "giai_thich": "Nguyên tử N trong NH₃ ở số oxi hóa thấp nhất −3 nên chỉ bị oxi hóa; NH₃ chỉ thể hiện tính oxi hóa thông qua nguyên tử hydrogen +1 khi gặp kim loại mạnh."
 },
 {
  "id": "bq_1789371866325_b1jgh",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét cấu trúc hình học của phân tử NH₃.",
  "y_dung_sai": [
   {
    "y": "Nguyên tử N nằm ở đỉnh của hình chóp.",
    "dung": true
   },
   {
    "y": "Ba nguyên tử H nằm ở ba đỉnh của một tam giác đều.",
    "dung": true
   },
   {
    "y": "Phân tử NH₃ có dạng tam giác phẳng.",
    "dung": false
   },
   {
    "y": "Nguyên tử H nằm ở đỉnh hình chóp.",
    "dung": false
   }
  ],
  "giai_thich": "Ba liên kết N−H tương đương nhau và bị cặp electron riêng trên N đẩy lệch khỏi mặt phẳng nên tạo chóp tam giác đều đáy."
 },
 {
  "id": "bq_1789371866325_bw4fw",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét tính chất hóa học của ammonia.",
  "y_dung_sai": [
   {
    "y": "NH₃ có tính base.",
    "dung": true
   },
   {
    "y": "NH₃ có tính khử.",
    "dung": true
   },
   {
    "y": "NH₃ chủ yếu thể hiện tính oxi hóa.",
    "dung": false
   },
   {
    "y": "NH₃ có tính acid mạnh.",
    "dung": false
   }
  ],
  "giai_thich": "NH₃ nhận H⁺ tạo NH₄⁺ (base) và nhường electron khi tác dụng với O₂, Cl₂, CuO (khử); N⁻³ không thể giảm số oxi hóa thêm."
 },
 {
  "id": "bq_1789371866325_iqtbs",
  "loai": "tf",
  "muc": "th",
  "de": "Câu ca dao “Lúa chiêm lấp ló đầu bờ / Hễ nghe tiếng sấm phất cờ mà lên” gắn với quá trình tạo đạm tự nhiên.",
  "y_dung_sai": [
   {
    "y": "Phản ứng khởi đầu là N₂ + O₂ → 2NO nhờ tia sét.",
    "dung": true
   },
   {
    "y": "Sau đó NO bị oxi hóa thành NO₂ rồi tạo HNO₃ trong nước mưa.",
    "dung": true
   },
   {
    "y": "Câu ca dao mô tả phản ứng tổng hợp urea.",
    "dung": false
   },
   {
    "y": "Lúa phát triển nhờ hấp thụ trực tiếp khí NO.",
    "dung": false
   }
  ],
  "giai_thich": "Ion NO₃⁻ do HNO₃ phân li trong đất là dạng đạm cây hấp thụ được; urea là phân đạm tổng hợp trong công nghiệp."
 },
 {
  "id": "bq_1789371866325_jbewe",
  "loai": "tf",
  "muc": "th",
  "de": "Xét số oxi hóa của nitrogen trong các chất NH₄Cl, N₂, N₂O, NO, HNO₃.",
  "y_dung_sai": [
   {
    "y": "Trong NH₄Cl, N có số oxi hóa −3.",
    "dung": true
   },
   {
    "y": "Trong N₂O, N có số oxi hóa +1.",
    "dung": true
   },
   {
    "y": "Trong NO, N có số oxi hóa +4.",
    "dung": false
   },
   {
    "y": "Trong HNO₃, N có số oxi hóa +3.",
    "dung": false
   }
  ],
  "giai_thich": "Tính theo O = −2, H = +1: NO có N = +2; HNO₃ có 1 + x − 6 = 0 nên x = +5."
 },
 {
  "id": "bq_1789371866325_kd6v4",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét vai trò của nitrogen trong không khí đối với cây trồng.",
  "y_dung_sai": [
   {
    "y": "Khi có sấm sét, N₂ trong không khí được chuyển hóa thành ion nitrate.",
    "dung": true
   },
   {
    "y": "Ion nitrate theo nước mưa là nguồn đạm tự nhiên cho cây.",
    "dung": true
   },
   {
    "y": "Nitrogen trong không khí cung cấp phân lân cho cây.",
    "dung": false
   },
   {
    "y": "Cây trồng hấp thụ trực tiếp khí N₂ qua lá.",
    "dung": false
   }
  ],
  "giai_thich": "Thực vật không đồng hóa trực tiếp N₂ mà hấp thụ nitrogen ở dạng NO₃⁻, NH₄⁺; nguyên tố dinh dưỡng của phân lân là phosphorus."
 },
 {
  "id": "bq_1789371866325_kpw8o",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét số oxi hóa của nitrogen trong NO, N₂O, HNO₃, NH₄Cl.",
  "y_dung_sai": [
   {
    "y": "Trong NH₄Cl, N có số oxi hóa −3.",
    "dung": true
   },
   {
    "y": "Trong HNO₃, N có số oxi hóa +5.",
    "dung": true
   },
   {
    "y": "Trong N₂O, N có số oxi hóa +2.",
    "dung": false
   },
   {
    "y": "Trong NO, N có số oxi hóa −3.",
    "dung": false
   }
  ],
  "giai_thich": "Tính theo O = −2, H = +1: N₂O cho 2x − 2 = 0 nên x = +1; NO cho x − 2 = 0 nên x = +2."
 },
 {
  "id": "bq_1789371866325_l8ujx",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét việc dùng muối ammonium carbonate làm bột nở.",
  "y_dung_sai": [
   {
    "y": "(NH₄)₂CO₃ khi đun nóng phân hủy tạo khí NH₃ và CO₂.",
    "dung": true
   },
   {
    "y": "Các khí sinh ra làm bánh nở xốp.",
    "dung": true
   },
   {
    "y": "Khi nhiệt phân, (NH₄)₂CO₃ để lại nhiều chất rắn trong bánh.",
    "dung": false
   },
   {
    "y": "NH₄Cl là chất được dùng phổ biến làm bột nở.",
    "dung": false
   }
  ],
  "giai_thich": "(NH₄)₂CO₃ → 2NH₃ + CO₂ + H₂O, tất cả sản phẩm đều bay hơi; NH₄Cl phân hủy tạo HCl nên không dùng làm bột nở."
 },
 {
  "id": "bq_1789371866325_mpk1p",
  "loai": "tf",
  "muc": "th",
  "de": "Xét cách điều chế nitrogen trong phòng thí nghiệm.",
  "y_dung_sai": [
   {
    "y": "Có thể đun nóng dung dịch hỗn hợp NaNO₂ và NH₄Cl để điều chế N₂.",
    "dung": true
   },
   {
    "y": "NH₄NO₂ kém bền nên thường được tạo ra ngay trong hỗn hợp phản ứng.",
    "dung": true
   },
   {
    "y": "Có thể thay NH₄Cl bằng NaCl mà vẫn thu được N₂.",
    "dung": false
   },
   {
    "y": "Phòng thí nghiệm điều chế N₂ bằng cách chưng cất phân đoạn không khí lỏng.",
    "dung": false
   }
  ],
  "giai_thich": "Phải có ion NH₄⁺ và NO₂⁻ để tạo NH₄NO₂ rồi phân hủy thành N₂; chưng cất không khí lỏng là phương pháp công nghiệp."
 },
 {
  "id": "bq_1789371866325_oe6s2",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét thành phần của ammonia.",
  "y_dung_sai": [
   {
    "y": "Ammonia có công thức phân tử NH₃.",
    "dung": true
   },
   {
    "y": "Ammonia được tạo bởi hai nguyên tố hydrogen và nitrogen.",
    "dung": true
   },
   {
    "y": "Ammonia chứa nguyên tố oxygen.",
    "dung": false
   },
   {
    "y": "Trong NH₃, N có số oxi hóa +3.",
    "dung": false
   }
  ],
  "giai_thich": "NH₃ gồm N và H; H có số oxi hóa +1 nên N có số oxi hóa −3."
 },
 {
  "id": "bq_1789371866325_ok041",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét trạng thái và màu sắc của nitrogen ở điều kiện thường.",
  "y_dung_sai": [
   {
    "y": "Nitrogen là chất khí ở điều kiện thường.",
    "dung": true
   },
   {
    "y": "Khí nitrogen không màu, không mùi.",
    "dung": true
   },
   {
    "y": "Nitrogen là chất lỏng màu vàng nhạt ở điều kiện thường.",
    "dung": false
   },
   {
    "y": "Khí nitrogen có mùi khai.",
    "dung": false
   }
  ],
  "giai_thich": "N₂ có nhiệt độ sôi −196 °C nên là khí ở điều kiện thường; khí mùi khai là NH₃."
 },
 {
  "id": "bq_1789371866325_p01ll",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét tính chất vật lí của ammonia.",
  "y_dung_sai": [
   {
    "y": "NH₃ là chất khí không màu, mùi khai và xốc.",
    "dung": true
   },
   {
    "y": "NH₃ tan rất nhiều trong nước.",
    "dung": true
   },
   {
    "y": "NH₃ nặng hơn không khí.",
    "dung": false
   },
   {
    "y": "NH₃ ít tan trong nước.",
    "dung": false
   }
  ],
  "giai_thich": "M(NH₃) = 17 < 29 nên nhẹ hơn không khí; NH₃ phân cực và tạo liên kết hydrogen với nước nên tan nhiều."
 },
 {
  "id": "bq_1789371866325_rw5jh",
  "loai": "tf",
  "muc": "th",
  "de": "Xét các phản ứng có thể tạo ra khí nitrogen.",
  "y_dung_sai": [
   {
    "y": "Nhiệt phân NH₄NO₂ tạo ra N₂ và H₂O.",
    "dung": true
   },
   {
    "y": "Trong phản ứng nhiệt phân NH₄NO₂, N⁻³ bị oxi hóa và N⁺³ bị khử cùng về N⁰.",
    "dung": true
   },
   {
    "y": "Đốt NH₃ trong O₂ có xúc tác Pt tạo ra N₂.",
    "dung": false
   },
   {
    "y": "Nhiệt phân NH₄NO₃ tạo ra N₂.",
    "dung": false
   }
  ],
  "giai_thich": "NH₄NO₂ chứa cả N⁻³ và N⁺³ nên có phản ứng oxi hóa – khử nội phân tử tạo N₂; oxi hóa NH₃ có Pt là giai đoạn đầu sản xuất HNO₃ (tạo NO)."
 },
 {
  "id": "bq_1789371866325_t8ex7",
  "loai": "tf",
  "muc": "vd",
  "de": "Điều chế 102 gam NH₃ từ hỗn hợp N₂ và H₂ (lấy theo đúng tỉ lệ phản ứng) với hiệu suất 25%, thể tích khí đo ở đkc.",
  "y_dung_sai": [
   {
    "y": "Số mol NH₃ cần điều chế là 6 mol.",
    "dung": true
   },
   {
    "y": "Tổng số mol N₂ và H₂ cần lấy là 48 mol.",
    "dung": true
   },
   {
    "y": "Nếu hiệu suất 100% thì chỉ cần 12 mol N₂.",
    "dung": false
   },
   {
    "y": "Thể tích hỗn hợp cần lấy ở đkc là 1075,2 lít.",
    "dung": false
   }
  ],
  "giai_thich": "Lí thuyết cần 3 mol N₂ + 9 mol H₂ = 12 mol, chia cho 0,25 được 48 mol; ở đkc (24,79 L/mol) thể tích là 1189,92 L."
 },
 {
  "id": "bq_1789371866325_tetpf",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét tính chất của muối ammonium.",
  "y_dung_sai": [
   {
    "y": "Các muối ammonium đều là chất điện li mạnh.",
    "dung": true
   },
   {
    "y": "Ion NH₄⁺ bị thủy phân tạo môi trường acid.",
    "dung": true
   },
   {
    "y": "Muối ammonium rất bền với nhiệt.",
    "dung": false
   },
   {
    "y": "Hầu hết muối ammonium không tan trong nước.",
    "dung": false
   }
  ],
  "giai_thich": "Muối ammonium là hợp chất ion dễ tan, phân li hoàn toàn; khi đun nóng chúng bị phân hủy."
 },
 {
  "id": "bq_1789371866325_u2sx7",
  "loai": "tf",
  "muc": "vd",
  "de": "Nhiệt phân 32 gam NH₄NO₂ theo phương trình NH₄NO₂ → N₂ + 2H₂O, sau phản ứng còn lại 10 gam chất rắn.",
  "y_dung_sai": [
   {
    "y": "Chất rắn còn lại là NH₄NO₂ chưa bị nhiệt phân.",
    "dung": true
   },
   {
    "y": "Khối lượng NH₄NO₂ đã bị nhiệt phân là 22 gam.",
    "dung": true
   },
   {
    "y": "Hiệu suất phản ứng là 31,25%.",
    "dung": false
   },
   {
    "y": "Nhiệt phân NH₄NO₂ tạo ra chất rắn là NH₄Cl.",
    "dung": false
   }
  ],
  "giai_thich": "Mọi sản phẩm (N₂, H₂O) đều thoát ra ở dạng khí, hơi nên chất rắn chỉ là muối dư; hiệu suất bằng khối lượng đã phản ứng chia khối lượng ban đầu: 22/32 = 68,75%."
 },
 {
  "id": "bq_1789371866325_ufpg0",
  "loai": "tf",
  "muc": "vd",
  "de": "Nguyên tố R có oxide cao nhất là R₂O₅; hợp chất khí của R với hydrogen chứa 17,64% H về khối lượng.",
  "y_dung_sai": [
   {
    "y": "Hợp chất khí của R với hydrogen có công thức RH₃.",
    "dung": true
   },
   {
    "y": "R là nitrogen.",
    "dung": true
   },
   {
    "y": "R là phosphorus.",
    "dung": false
   },
   {
    "y": "Hóa trị cao nhất của R với oxygen là III.",
    "dung": false
   }
  ],
  "giai_thich": "Tổng hóa trị cao nhất với O và hóa trị với H bằng 8 nên RH₃; PH₃ chỉ có 8,8% H, còn NH₃ có 17,64% H."
 },
 {
  "id": "bq_1789371866325_x6bf9",
  "loai": "tf",
  "muc": "vdc",
  "de": "Cho phản ứng N₂ + 3H₂ ⇌ 2NH₃; sau một thời gian [N₂] = 2,5 M, [H₂] = 1,5 M, [NH₃] = 2 M (ban đầu không có NH₃).",
  "y_dung_sai": [
   {
    "y": "Nồng độ N₂ đã phản ứng là 1 M.",
    "dung": true
   },
   {
    "y": "Nồng độ H₂ ban đầu là 4,5 M.",
    "dung": true
   },
   {
    "y": "Nồng độ H₂ đã phản ứng là 2 M.",
    "dung": false
   },
   {
    "y": "Nồng độ N₂ ban đầu là 2,5 M.",
    "dung": false
   }
  ],
  "giai_thich": "Theo tỉ lệ 1 : 3 : 2, tạo 2 M NH₃ tiêu tốn 1 M N₂ và 3 M H₂; cộng lượng còn lại được nồng độ ban đầu."
 },
 {
  "id": "bq_1789371866325_y8yix",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét phản ứng nhiệt phân các muối ammonium.",
  "y_dung_sai": [
   {
    "y": "Khi đun nóng, các muối ammonium dễ bị phân hủy.",
    "dung": true
   },
   {
    "y": "Nhiệt phân NH₄Cl thu được NH₃ và HCl.",
    "dung": true
   },
   {
    "y": "Muối ammonium bền với nhiệt nên không bị phân hủy khi đun.",
    "dung": false
   },
   {
    "y": "Nhiệt phân mọi muối ammonium đều tạo ra NO₂.",
    "dung": false
   }
  ],
  "giai_thich": "Sản phẩm nhiệt phân phụ thuộc gốc acid: gốc không có tính oxi hóa cho NH₃, gốc có tính oxi hóa (NO₂⁻, NO₃⁻) cho N₂ hoặc N₂O."
 },
 {
  "id": "bq_1789371866325_yqemk",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét trạng thái tồn tại của ammonia.",
  "y_dung_sai": [
   {
    "y": "Ở điều kiện thường, NH₃ là chất khí.",
    "dung": true
   },
   {
    "y": "NH₃ có thể hóa lỏng khi nén và làm lạnh.",
    "dung": true
   },
   {
    "y": "Ở điều kiện thường, NH₃ là chất rắn.",
    "dung": false
   },
   {
    "y": "NH₃ là chất lỏng màu vàng ở điều kiện thường.",
    "dung": false
   }
  ],
  "giai_thich": "NH₃ có nhiệt độ sôi −33 °C nên là khí ở điều kiện thường nhưng dễ hóa lỏng hơn N₂, H₂ nhờ liên kết hydrogen."
 },
 {
  "id": "bq_1789371866325_yy4qy",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét cách sản xuất và điều chế nitrogen.",
  "y_dung_sai": [
   {
    "y": "Trong công nghiệp, N₂ được sản xuất bằng chưng cất phân đoạn không khí lỏng.",
    "dung": true
   },
   {
    "y": "Phương pháp công nghiệp dựa vào nhiệt độ sôi khác nhau của N₂ và O₂.",
    "dung": true
   },
   {
    "y": "Trong công nghiệp, N₂ được sản xuất bằng cách nhiệt phân HNO₃.",
    "dung": false
   },
   {
    "y": "Nhiệt phân NH₄NO₃ thu được N₂ tinh khiết.",
    "dung": false
   }
  ],
  "giai_thich": "Không khí là nguồn N₂ rẻ và dồi dào; nhiệt phân NH₄NO₃ tạo N₂O, còn HNO₃ phân hủy tạo NO₂ và O₂."
 },
 {
  "id": "bq_1789371866326_jm2z7",
  "loai": "tf",
  "muc": "vd",
  "de": "Hai dung dịch A, B mỗi dung dịch chứa 2 cation và 2 anion không trùng nhau, lấy từ K⁺ (0,15 mol), H⁺ (0,2 mol), Mg²⁺ (0,1 mol), NH₄⁺ (0,25 mol), Cl⁻ (0,1 mol), SO₄²⁻ (0,075 mol), NO₃⁻ (0,25 mol), CO₃²⁻ (0,15 mol).",
  "y_dung_sai": [
   {
    "y": "Ion CO₃²⁻ không thể cùng tồn tại với H⁺ trong một dung dịch.",
    "dung": true
   },
   {
    "y": "Dung dịch chứa CO₃²⁻ gồm K⁺, NH₄⁺, CO₃²⁻ và Cl⁻.",
    "dung": true
   },
   {
    "y": "Ion Mg²⁺ có thể cùng tồn tại với CO₃²⁻ trong dung dịch.",
    "dung": false
   },
   {
    "y": "Khối lượng chất rắn khan thu được từ hai dung dịch lần lượt là 22,9 gam và 12,7 gam.",
    "dung": false
   }
  ],
  "giai_thich": "Điều kiện cùng tồn tại là các ion không phản ứng với nhau, sau đó áp dụng bảo toàn điện tích để ghép ion; khối lượng chất rắn bằng tổng khối lượng các ion."
 },
 {
  "id": "bq_1789371866326_jykwm",
  "loai": "tf",
  "muc": "vd",
  "de": "Trộn 300 mL dung dịch NaNO₂ 2 M với 200 mL dung dịch NH₄Cl 2 M rồi đun nóng đến khi phản ứng hoàn toàn.",
  "y_dung_sai": [
   {
    "y": "Khí thu được là N₂.",
    "dung": true
   },
   {
    "y": "NH₄Cl là chất phản ứng hết.",
    "dung": true
   },
   {
    "y": "Số mol khí thu được là 0,6 mol.",
    "dung": false
   },
   {
    "y": "Thể tích khí thu được ở đkc là 22,4 lít.",
    "dung": false
   }
  ],
  "giai_thich": "Phản ứng theo tỉ lệ 1 : 1 nên chất có số mol nhỏ hơn (NH₄Cl, 0,4 mol) quyết định lượng N₂; ở đkc V = 0,4·24,79 = 9,916 L."
 },
 {
  "id": "bq_1789371866326_moymn",
  "loai": "tf",
  "muc": "vd",
  "de": "Nhiệt phân hoàn toàn 16 gam NH₄NO₂.",
  "y_dung_sai": [
   {
    "y": "Số mol NH₄NO₂ đem nhiệt phân là 0,25 mol.",
    "dung": true
   },
   {
    "y": "Thể tích N₂ thu được ở đkc là 6,1975 lít.",
    "dung": true
   },
   {
    "y": "Sản phẩm của phản ứng gồm NH₃ và HNO₂.",
    "dung": false
   },
   {
    "y": "Số mol N₂ thu được là 0,5 mol.",
    "dung": false
   }
  ],
  "giai_thich": "NH₄NO₂ → N₂ + 2H₂O là phản ứng oxi hóa – khử nội phân tử, tỉ lệ muối : N₂ là 1 : 1."
 },
 {
  "id": "bq_1789371866326_no2ct",
  "loai": "tf",
  "muc": "vdc",
  "de": "Nhiệt phân 48 gam mẫu ammonium dichromate có lẫn tạp chất trơ theo phương trình (NH₄)₂Cr₂O₇ → Cr₂O₃ + N₂ + 4H₂O, thu được 30 gam chất rắn.",
  "y_dung_sai": [
   {
    "y": "Chất rắn sau phản ứng gồm Cr₂O₃ và tạp chất.",
    "dung": true
   },
   {
    "y": "Khối lượng tạp chất trong mẫu là 2,64 gam.",
    "dung": true
   },
   {
    "y": "Khối lượng chất rắn giảm là do Cr₂O₃ bay hơi.",
    "dung": false
   },
   {
    "y": "Phần trăm tạp chất trong mẫu là 7,5%.",
    "dung": false
   }
  ],
  "giai_thich": "Chỉ N₂ và H₂O thoát ra khỏi chất rắn; lập phương trình khối lượng rắn 152(48 − t)/252 + t = 30 được t = 2,64 gam, chiếm 5,5%."
 },
 {
  "id": "bq_1789371866326_rokzp",
  "loai": "tf",
  "muc": "vd",
  "de": "Cho 2,3 gam Na vào 200 mL dung dịch (NH₄)₂SO₄ 1 M rồi đun nóng.",
  "y_dung_sai": [
   {
    "y": "Khí thu được gồm H₂ và NH₃.",
    "dung": true
   },
   {
    "y": "Số mol NaOH tạo thành là 0,1 mol.",
    "dung": true
   },
   {
    "y": "Số mol NH₃ thoát ra là 0,4 mol.",
    "dung": false
   },
   {
    "y": "Thể tích khí thu được ở đkc là 2,24 lít.",
    "dung": false
   }
  ],
  "giai_thich": "Na tác dụng với nước trước tạo H₂ và NaOH; lượng NH₃ bị giới hạn bởi NaOH (0,1 mol) chứ không phải bởi NH₄⁺ đang dư."
 },
 {
  "id": "bq_1789371866328_4vsp7",
  "loai": "tf",
  "muc": "th",
  "de": "Xét số oxi hóa của nitrogen trong NH₃, N₂, NO₂, HNO₃ và khả năng oxi hóa – khử của chúng.",
  "y_dung_sai": [
   {
    "y": "Số oxi hóa của N trong NH₃, N₂, NO₂, HNO₃ lần lượt là −3, 0, +4, +5.",
    "dung": true
   },
   {
    "y": "NH₃ chỉ thể hiện tính khử xét theo nguyên tử nitrogen.",
    "dung": true
   },
   {
    "y": "N₂ chỉ thể hiện tính oxi hóa.",
    "dung": false
   },
   {
    "y": "HNO₃ vừa thể hiện tính oxi hóa vừa thể hiện tính khử.",
    "dung": false
   }
  ],
  "giai_thich": "Nguyên tố ở số oxi hóa thấp nhất chỉ bị oxi hóa, ở số oxi hóa cao nhất chỉ bị khử, còn ở mức trung gian (N₂, NO₂) thì có cả hai khả năng."
 },
 {
  "id": "bq_1789371866328_lwka9",
  "loai": "tf",
  "muc": "vd",
  "de": "Cho 7,437 lít N₂ (đkc) phản ứng với H₂ dư có xúc tác, hiệu suất phản ứng 20%.",
  "y_dung_sai": [
   {
    "y": "Số mol N₂ ban đầu là 0,3 mol.",
    "dung": true
   },
   {
    "y": "Số mol NH₃ thu được là 0,12 mol.",
    "dung": true
   },
   {
    "y": "Hiệu suất phản ứng phải tính theo H₂ vì H₂ dư.",
    "dung": false
   },
   {
    "y": "Thể tích NH₃ thu được ở đkc là 1,4874 lít.",
    "dung": false
   }
  ],
  "giai_thich": "Hiệu suất luôn tính theo chất phản ứng hết trước, ở đây là N₂; mỗi mol N₂ phản ứng cho 2 mol NH₃ nên V = 0,12·24,79 = 2,9748 L."
 },
 {
  "id": "bq_1789372198145_3lhnz",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét quá trình nitrogen trong không khí chuyển thành đạm cho cây khi có mưa dông kèm sấm sét.",
  "y_dung_sai": [
   {
    "y": "Phản ứng khởi đầu là N₂ + O₂ ⇌ 2NO, xảy ra nhờ nhiệt độ rất cao của tia sét.",
    "dung": true
   },
   {
    "y": "Trong phản ứng giữa N₂ và O₂, nitrogen đóng vai trò chất oxi hóa.",
    "dung": false
   },
   {
    "y": "Sản phẩm cuối cùng theo nước mưa xuống đất là ion nitrate NO₃⁻.",
    "dung": true
   },
   {
    "y": "Quá trình này cung cấp phân lân cho cây.",
    "dung": false
   }
  ],
  "giai_thich": "Trong phản ứng với O₂, số oxi hóa của N tăng từ 0 lên +2 nên N₂ là chất khử; chuỗi NO → NO₂ → HNO₃ cung cấp đạm nitrate, không phải lân."
 },
 {
  "id": "bq_1789372198145_6jz8o",
  "loai": "tf",
  "muc": "th",
  "de": "Xét phân tử ammonia (NH₃) và ion ammonium (NH₄⁺).",
  "y_dung_sai": [
   {
    "y": "Cả NH₃ và NH₄⁺ đều chứa liên kết cộng hóa trị.",
    "dung": true
   },
   {
    "y": "Cả NH₃ và NH₄⁺ đều là base Brønsted trong nước.",
    "dung": false
   },
   {
    "y": "NH₄⁺ là acid Brønsted vì có thể cho proton.",
    "dung": true
   },
   {
    "y": "Số oxi hóa của N trong NH₃ và trong NH₄⁺ khác nhau.",
    "dung": false
   }
  ],
  "giai_thich": "NH₃ dùng cặp electron riêng nhận H⁺ tạo NH₄⁺, còn NH₄⁺ cho lại H⁺; trong cả hai, N đều có số oxi hóa −3."
 },
 {
  "id": "bq_1789372198146_141f4",
  "loai": "tf",
  "muc": "th",
  "de": "Xét chu trình nitrogen trong tự nhiên.",
  "y_dung_sai": [
   {
    "y": "Thực vật hấp thụ nitrogen chủ yếu ở dạng nitrate (NO₃⁻) và ammonium (NH₄⁺) qua rễ.",
    "dung": true
   },
   {
    "y": "Động vật đồng hóa protein thực vật để tạo protein động vật.",
    "dung": true
   },
   {
    "y": "Phản ứng tạo NO khi có sấm sét là khởi đầu cho quá trình cung cấp đạm cho đất.",
    "dung": true
   },
   {
    "y": "Thực vật hấp thụ nitrogen chủ yếu trực tiếp từ khí N₂ trong không khí qua lá.",
    "dung": false
   }
  ],
  "giai_thich": "N₂ rất bền, thực vật không đồng hóa trực tiếp được mà chỉ hấp thụ nitrogen ở dạng ion NO₃⁻, NH₄⁺ trong đất qua rễ."
 },
 {
  "id": "bq_1789372198146_1pjwp",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét cấu tạo phân tử ammonia (NH₃).",
  "y_dung_sai": [
   {
    "y": "Phân tử NH₃ có dạng chóp tam giác với nguyên tử N ở đỉnh.",
    "dung": true
   },
   {
    "y": "Nguyên tử N trong NH₃ còn một cặp electron chưa liên kết.",
    "dung": true
   },
   {
    "y": "Phân tử NH₃ có dạng tam giác phẳng nên không phân cực.",
    "dung": false
   },
   {
    "y": "Liên kết N−H trong NH₃ là liên kết cộng hóa trị không phân cực.",
    "dung": false
   }
  ],
  "giai_thich": "Cặp electron riêng trên N đẩy ba liên kết N−H tạo hình chóp; N âm điện hơn H nên liên kết N−H phân cực và phân tử NH₃ phân cực."
 },
 {
  "id": "bq_1789372198146_92eq8",
  "loai": "tf",
  "muc": "th",
  "de": "Xét các phát biểu về ammonia.",
  "y_dung_sai": [
   {
    "y": "Trong công nghiệp, ammonia thường được sử dụng với vai trò chất làm lạnh (chất sinh hàn).",
    "dung": true
   },
   {
    "y": "Do có hàm lượng nitrogen cao (82,35% theo khối lượng) nên ammonia được sử dụng làm phân đạm rất hiệu quả.",
    "dung": false
   },
   {
    "y": "Quá trình tổng hợp ammonia từ nitrogen và hydrogen là quá trình thuận nghịch nên không thể đạt hiệu suất 100%.",
    "dung": true
   },
   {
    "y": "Phần lớn ammonia được dùng phản ứng với acid để sản xuất các loại phân đạm.",
    "dung": true
   }
  ],
  "giai_thich": "NH₃ lỏng bay hơi thu nhiều nhiệt nên dùng làm chất sinh hàn; tuy chứa 82,35% N nhưng khí NH₃ dễ bay hơi, có tính base nên không bón trực tiếp mà được chuyển thành muối ammonium hoặc urea."
 },
 {
  "id": "bq_1789372198146_9fwtj",
  "loai": "tf",
  "muc": "vd",
  "de": "Cho 14,874 L N₂ (đkc) tác dụng với lượng dư khí H₂ để tổng hợp ammonia, hiệu suất phản ứng là 30%.",
  "y_dung_sai": [
   {
    "y": "Số mol N₂ ban đầu là 0,6 mol.",
    "dung": true
   },
   {
    "y": "Nếu hiệu suất đạt 100% thì thu được 1,2 mol NH₃.",
    "dung": true
   },
   {
    "y": "Khối lượng NH₃ thực tế thu được là 20,4 gam.",
    "dung": false
   },
   {
    "y": "Hiệu suất thấp chủ yếu do N₂ bị oxi hóa thành NO.",
    "dung": false
   }
  ],
  "giai_thich": "Theo tỉ lệ 1 N₂ tạo 2 NH₃, lý thuyết thu 1,2 mol NH₃, thực tế 0,36 mol = 6,12 g; hiệu suất thấp vì phản ứng thuận nghịch, không liên quan tới NO."
 },
 {
  "id": "bq_1789372198146_hswl2",
  "loai": "tf",
  "muc": "nb",
  "de": "Nhận biết muối ammonium bằng dung dịch kiềm đặc, đun nóng.",
  "y_dung_sai": [
   {
    "y": "Khí thoát ra là NH₃, có mùi khai.",
    "dung": true
   },
   {
    "y": "Khí thoát ra làm quỳ tím ẩm hóa đỏ.",
    "dung": false
   },
   {
    "y": "Phương trình ion thu gọn là NH₄⁺ + OH⁻ → NH₃ + H₂O.",
    "dung": true
   },
   {
    "y": "Có thể thay dung dịch kiềm bằng dung dịch HCl để nhận biết muối ammonium.",
    "dung": false
   }
  ],
  "giai_thich": "OH⁻ nhận proton của NH₄⁺ giải phóng NH₃ là khí có tính base (làm xanh quỳ ẩm); HCl là acid nên không đẩy được NH₃ ra khỏi muối."
 },
 {
  "id": "bq_1789372198146_pmq2n",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét trạng thái tự nhiên của nitrogen.",
  "y_dung_sai": [
   {
    "y": "N₂ chiếm khoảng 78% thể tích không khí.",
    "dung": true
   },
   {
    "y": "Trong khí quyển, nitrogen tồn tại chủ yếu ở dạng NH₃.",
    "dung": false
   },
   {
    "y": "Trong tự nhiên, nitrogen tồn tại ở cả dạng đơn chất và hợp chất.",
    "dung": true
   },
   {
    "y": "NO₂ là dạng tồn tại chủ yếu của nitrogen trong không khí sạch.",
    "dung": false
   }
  ],
  "giai_thich": "Đơn chất N₂ bền là thành phần chính của không khí; hợp chất của nitrogen có trong khoáng nitrate, protein; NO₂ và NH₃ chỉ có lượng rất nhỏ."
 },
 {
  "id": "bq_1789372198147_0tmqv",
  "loai": "tf",
  "muc": "vd",
  "de": "Cho sơ đồ chuyển hóa: X —(+O₂)→ Y —(+O₂)→ Z —(+O₂ + H₂O)→ W; X, Y, Z, W đều chứa nitrogen; X và W phản ứng với nhau tạo muối tan trong nước.",
  "y_dung_sai": [
   {
    "y": "X là NH₃.",
    "dung": true
   },
   {
    "y": "W là HNO₃.",
    "dung": true
   },
   {
    "y": "Y là NO₂.",
    "dung": false
   },
   {
    "y": "X và W phản ứng tạo muối NH₄NO₃ không tan trong nước.",
    "dung": false
   }
  ],
  "giai_thich": "Số oxi hóa của N tăng dần −3 (NH₃) → +2 (NO) → +4 (NO₂) → +5 (HNO₃); muối ammonium nitrate tạo thành dễ tan trong nước."
 },
 {
  "id": "bq_1789372198147_coy63",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét tác dụng của khí ammonia với giấy quỳ tím.",
  "y_dung_sai": [
   {
    "y": "Khí NH₃ làm quỳ tím ẩm hóa xanh.",
    "dung": true
   },
   {
    "y": "Có thể dùng quỳ tím ẩm để nhận biết khí NH₃.",
    "dung": true
   },
   {
    "y": "Quỳ tím khô cũng đổi màu rõ khi tiếp xúc với khí NH₃ khô.",
    "dung": false
   },
   {
    "y": "Khí NH₃ làm quỳ tím ẩm hóa đỏ vì NH₃ có tính acid.",
    "dung": false
   }
  ],
  "giai_thich": "Chỉ khi có nước NH₃ mới tạo được OH⁻ nên phải dùng quỳ tím ẩm; NH₃ có tính base nên làm quỳ hóa xanh."
 },
 {
  "id": "bq_1789372198147_yy7yt",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét tính chất vật lí và cấu tạo của ammonia (NH₃).",
  "y_dung_sai": [
   {
    "y": "NH₃ là khí không màu, mùi khai.",
    "dung": true
   },
   {
    "y": "NH₃ nhẹ hơn không khí.",
    "dung": true
   },
   {
    "y": "Liên kết N−H trong NH₃ không phân cực.",
    "dung": false
   },
   {
    "y": "NH₃ ít tan trong nước.",
    "dung": false
   }
  ],
  "giai_thich": "Liên kết N−H phân cực làm NH₃ phân cực và tạo liên kết hydrogen với nước nên tan rất nhiều; M = 17 < 29 nên nhẹ hơn không khí."
 },
 {
  "id": "bq_1789372198151_csmoi",
  "loai": "tf",
  "muc": "vd",
  "de": "Cho dung dịch NH₄NO₃ tác dụng với dung dịch kiềm của một kim loại M hóa trị II, thu được 4,958 lít khí (ở đkc) và 26,1 gam muối.",
  "y_dung_sai": [
   {
    "y": "Khí thu được là NH₃ với số mol 0,2 mol.",
    "dung": true
   },
   {
    "y": "Số mol muối M(NO₃)₂ tạo thành là 0,1 mol.",
    "dung": true
   },
   {
    "y": "Phân tử khối của muối M(NO₃)₂ là 130,5.",
    "dung": false
   },
   {
    "y": "Kim loại M là Ca.",
    "dung": false
   }
  ],
  "giai_thich": "Theo tỉ lệ 2NH₃ : 1M(NO₃)₂ nên muối có 0,1 mol, M(muối) = 26,1/0,1 = 261, M = 261 − 124 = 137 (Ba)."
 },
 {
  "id": "bq_1789372198151_cz574",
  "loai": "tf",
  "muc": "th",
  "de": "Xét các nhận xét về nitrogen.",
  "y_dung_sai": [
   {
    "y": "Liên kết ba N≡N làm nitrogen khá trơ về mặt hóa học ở nhiệt độ thường.",
    "dung": true
   },
   {
    "y": "N₂ không duy trì sự cháy, sự hô hấp nhưng không phải là khí độc.",
    "dung": true
   },
   {
    "y": "Khi tác dụng với kim loại hoạt động, N₂ thể hiện tính khử.",
    "dung": false
   },
   {
    "y": "Số oxi hóa của nitrogen trong ion NO₂⁻ là +4.",
    "dung": false
   }
  ],
  "giai_thich": "Với kim loại, N₂ nhận electron tạo nitride (N⁻³) nên là chất oxi hóa; trong NO₂⁻: x + 2·(−2) = −1 nên x = +3."
 },
 {
  "id": "bq_1789372198151_eqyzw",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét các ứng dụng của nitrogen trong công nghiệp.",
  "y_dung_sai": [
   {
    "y": "Phần lớn N₂ sản xuất ra được dùng để tổng hợp ammonia.",
    "dung": true
   },
   {
    "y": "N₂ được dùng làm môi trường trơ trong luyện kim, điện tử.",
    "dung": true
   },
   {
    "y": "Phân đạm được sản xuất trực tiếp từ N₂ mà không cần qua NH₃.",
    "dung": false
   },
   {
    "y": "N₂ lỏng được dùng làm nhiên liệu đốt cháy.",
    "dung": false
   }
  ],
  "giai_thich": "N₂ kém hoạt động nên phải chuyển thành NH₃ trước khi sản xuất phân đạm, HNO₃; N₂ không cháy nên không dùng làm nhiên liệu."
 },
 {
  "id": "bq_1789372198151_l5g3r",
  "loai": "tf",
  "muc": "nb",
  "de": "Nhúng 2 đũa thủy tinh vào 2 bình đựng dung dịch HCl đặc và NH₃ đặc rồi đưa 2 đũa lại gần nhau.",
  "y_dung_sai": [
   {
    "y": "Khói trắng xuất hiện là các tinh thể NH₄Cl.",
    "dung": true
   },
   {
    "y": "Phản ứng thể hiện tính base của NH₃.",
    "dung": true
   },
   {
    "y": "Khói tạo thành có màu nâu đỏ.",
    "dung": false
   },
   {
    "y": "Phản ứng giữa NH₃ và HCl là phản ứng oxi hóa – khử.",
    "dung": false
   }
  ],
  "giai_thich": "NH₃ nhận H⁺ của HCl tạo muối NH₄Cl, không có thay đổi số oxi hóa; muối rắn phân tán trong không khí tạo khói trắng."
 },
 {
  "id": "bq_1789372198151_s7h9c",
  "loai": "tf",
  "muc": "vd",
  "de": "Sản xuất 7,84 kg phân ammonium nitrate theo phản ứng NH₃ + HNO₃ → NH₄NO₃ với hiệu suất 98%.",
  "y_dung_sai": [
   {
    "y": "Số kmol NH₄NO₃ cần sản xuất là 0,098 kmol.",
    "dung": true
   },
   {
    "y": "Khối lượng HNO₃ cần dùng thực tế là 6,3 kg.",
    "dung": true
   },
   {
    "y": "Nếu hiệu suất là 100% thì cũng cần đúng 6,3 kg HNO₃.",
    "dung": false
   },
   {
    "y": "Phản ứng NH₃ + HNO₃ → NH₄NO₃ là phản ứng oxi hóa – khử.",
    "dung": false
   }
  ],
  "giai_thich": "Khi hiệu suất 100% chỉ cần 0,098·63 ≈ 6,17 kg; hiệu suất nhỏ hơn thì cần nhiều nguyên liệu hơn; phản ứng acid – base không đổi số oxi hóa."
 },
 {
  "id": "bq_1789372198152_40rwf",
  "loai": "tf",
  "muc": "vdc",
  "de": "Điều chế 5 lít dung dịch HNO₃ 21% (D = 1,2 g/mL) bằng phương pháp oxi hóa NH₃, hiệu suất toàn quá trình là 75%.",
  "y_dung_sai": [
   {
    "y": "Khối lượng HNO₃ trong 5 lít dung dịch là 1260 gam.",
    "dung": true
   },
   {
    "y": "Theo bảo toàn nguyên tố N, số mol NH₃ lí thuyết bằng số mol HNO₃.",
    "dung": true
   },
   {
    "y": "Thể tích NH₃ cần dùng nếu hiệu suất 100% là 661,1 lít.",
    "dung": false
   },
   {
    "y": "Quá trình oxi hóa NH₃ thành HNO₃ chỉ gồm một phản ứng.",
    "dung": false
   }
  ],
  "giai_thich": "Quá trình gồm NH₃ → NO → NO₂ → HNO₃; lí thuyết cần 20 mol NH₃ (495,8 L), do hiệu suất 75% nên cần 661,1 L."
 },
 {
  "id": "bq_1789372198152_s7bu9",
  "loai": "tf",
  "muc": "vd",
  "de": "Một hỗn hợp gồm hai khí H₂ và N₂ theo tỉ lệ mol 4 : 1. Nung với xúc tác ở nhiệt độ cao thu được hỗn hợp khí Y, trong đó NH₃ chiếm 20% thể tích.",
  "y_dung_sai": [
   {
    "y": "Hiệu suất phản ứng được tính theo N₂.",
    "dung": true
   },
   {
    "y": "Tổng số mol khí giảm sau phản ứng.",
    "dung": true
   },
   {
    "y": "Hiệu suất phản ứng được tính theo H₂.",
    "dung": false
   },
   {
    "y": "Hiệu suất phản ứng là 20%.",
    "dung": false
   }
  ],
  "giai_thich": "Tỉ lệ H₂ : N₂ = 4 > 3 nên N₂ là chất thiếu; mỗi mol N₂ phản ứng làm số mol khí giảm 2 mol; giải được H ≈ 41,67%."
 },
 {
  "id": "bq_1789372198153_0fs48",
  "loai": "tf",
  "muc": "vdc",
  "de": "Hỗn hợp X gồm N₂ và H₂ có khối lượng mol trung bình bằng 12,4. Dẫn X đi qua bình đựng bột Fe nung nóng (hiệu suất tổng hợp NH₃ đạt 40%), thu được hỗn hợp Y.",
  "y_dung_sai": [
   {
    "y": "Tỉ lệ mol N₂ : H₂ trong X là 2 : 3.",
    "dung": true
   },
   {
    "y": "Hiệu suất phản ứng được tính theo H₂.",
    "dung": true
   },
   {
    "y": "Khối lượng hỗn hợp Y nhỏ hơn khối lượng hỗn hợp X.",
    "dung": false
   },
   {
    "y": "Số mol hỗn hợp Y lớn hơn số mol hỗn hợp X.",
    "dung": false
   }
  ],
  "giai_thich": "Theo bảo toàn khối lượng m(Y) = m(X); phản ứng làm giảm số mol khí nên M̄ tăng; H₂ : N₂ = 1,5 < 3 nên H₂ là chất thiếu, hiệu suất tính theo H₂."
 },
 {
  "id": "bq_1789372198153_7ahhz",
  "loai": "tf",
  "muc": "th",
  "de": "Xét cân bằng hóa học: NH₃ + H₂O ⇌ NH₄⁺ + OH⁻.",
  "y_dung_sai": [
   {
    "y": "Thêm vài giọt dung dịch HCl, cân bằng chuyển dịch theo chiều thuận.",
    "dung": true
   },
   {
    "y": "Thêm vài giọt dung dịch NaOH, cân bằng chuyển dịch theo chiều nghịch.",
    "dung": true
   },
   {
    "y": "Thêm NH₄Cl, cân bằng chuyển dịch theo chiều thuận.",
    "dung": false
   },
   {
    "y": "Thêm NaCl, cân bằng chuyển dịch mạnh theo chiều nghịch.",
    "dung": false
   }
  ],
  "giai_thich": "Theo Le Chatelier, giảm nồng độ sản phẩm (OH⁻ bị H⁺ trung hòa) làm cân bằng chuyển theo chiều thuận, tăng nồng độ sản phẩm (NH₄⁺, OH⁻) làm cân bằng chuyển theo chiều nghịch; Na⁺, Cl⁻ không tham gia cân bằng."
 },
 {
  "id": "bq_1789372198153_aj7f6",
  "loai": "tf",
  "muc": "th",
  "de": "Xét việc sử dụng các phân bón NH₄Cl, NH₄NO₃, (NH₄)₂SO₄.",
  "y_dung_sai": [
   {
    "y": "Ion NH₄⁺ bị thủy phân tạo môi trường acid.",
    "dung": true
   },
   {
    "y": "Bón nhiều phân ammonium lâu ngày làm tăng độ chua của đất.",
    "dung": true
   },
   {
    "y": "Phân ammonium thích hợp dùng để khử chua cho đất.",
    "dung": false
   },
   {
    "y": "Dung dịch NH₄Cl có môi trường base.",
    "dung": false
   }
  ],
  "giai_thich": "NH₄⁺ + H₂O ⇌ NH₃ + H₃O⁺ làm dung dịch có tính acid, vì vậy phân ammonium không dùng cho đất chua mà phải bón vôi để khử chua."
 },
 {
  "id": "bq_1789372198153_xw3w3",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét nguyên nhân tính base của ammonia (NH₃).",
  "y_dung_sai": [
   {
    "y": "Nguyên tử N trong NH₃ còn một cặp electron chưa liên kết.",
    "dung": true
   },
   {
    "y": "NH₃ nhận H⁺ tạo ion NH₄⁺.",
    "dung": true
   },
   {
    "y": "Tính base của NH₃ là do NH₃ tan nhiều trong nước.",
    "dung": false
   },
   {
    "y": "NH₃ là base vì phân tử NH₃ trực tiếp phân li ra ion OH⁻.",
    "dung": false
   }
  ],
  "giai_thich": "NH₃ không chứa nhóm OH; OH⁻ sinh ra vì NH₃ nhận H⁺ của nước bằng cặp electron riêng, không phải do độ tan."
 },
 {
  "id": "bq_1789373737083_2xxy0",
  "loai": "tf",
  "muc": "th",
  "de": "Xét số oxi hóa của nitrogen trong (NH₄)₂SO₄, N₂, NO₂, HNO₂.",
  "y_dung_sai": [
   {
    "y": "Trong (NH₄)₂SO₄, nitrogen có số oxi hóa −3.",
    "dung": true
   },
   {
    "y": "Trong HNO₂, nitrogen có số oxi hóa +3.",
    "dung": true
   },
   {
    "y": "Trong NO₂, nitrogen có số oxi hóa +2.",
    "dung": false
   },
   {
    "y": "Trong N₂, nitrogen có số oxi hóa −3.",
    "dung": false
   }
  ],
  "giai_thich": "Áp dụng quy tắc tính số oxi hóa với O = −2, H = +1: NO₂ cho x − 4 = 0 nên x = +4; đơn chất N₂ luôn có số oxi hóa 0."
 },
 {
  "id": "bq_1789373737083_9frri",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét các ứng dụng của ammonia trong sản xuất phân bón, nitric acid và làm lạnh.",
  "y_dung_sai": [
   {
    "y": "Ammonia được dùng để sản xuất phân đạm ammonium.",
    "dung": true
   },
   {
    "y": "Ammonia là nguyên liệu để sản xuất nitric acid.",
    "dung": true
   },
   {
    "y": "Ammonia lỏng bay hơi thu nhiều nhiệt nên được dùng làm chất làm lạnh.",
    "dung": true
   },
   {
    "y": "Ammonia được dùng để tạo môi trường trơ trong luyện kim.",
    "dung": false
   }
  ],
  "giai_thich": "NH₃ có tính base và tính khử nên dễ phản ứng, không dùng làm môi trường trơ; khí trơ được dùng là N₂ hoặc Ar."
 },
 {
  "id": "bq_1789373737083_jah94",
  "loai": "tf",
  "muc": "vd",
  "de": "[Hình: sơ đồ chuyển hóa N₂ → NH₃ → NO → NO₂ → HNO₃, ngoài ra còn một mũi tên đi thẳng từ N₂ đến NO.] Xét sơ đồ chuyển hóa giữa nitrogen và các hợp chất.",
  "y_dung_sai": [
   {
    "y": "Từ N₂ và O₂ ở nhiệt độ cao chỉ thu được NO.",
    "dung": true
   },
   {
    "y": "Chuỗi N₂ → NO → NO₂ → HNO₃ giải thích sự tạo thành nitric acid khi có sấm sét.",
    "dung": true
   },
   {
    "y": "N₂ tác dụng trực tiếp với O₂ dư tạo NO₂.",
    "dung": false
   },
   {
    "y": "Phản ứng NH₃ + HCl là một mắt xích trong sơ đồ trên.",
    "dung": false
   }
  ],
  "giai_thich": "Toàn bộ sơ đồ gồm các phản ứng làm thay đổi số oxi hóa của nitrogen, còn NH₃ + HCl chỉ là phản ứng trung hòa nên không thuộc sơ đồ."
 },
 {
  "id": "bq_1789373737083_vww5f",
  "loai": "tf",
  "muc": "vd",
  "de": "[Hình: sơ đồ chuyển hóa với các mũi tên (1) N₂ → NO₂; (2) N₂ → NH₃; (3) NH₃ → NO; (4) NO → NO₂.] Xét các phản ứng trong sơ đồ.",
  "y_dung_sai": [
   {
    "y": "Phản ứng (2) N₂ + 3H₂ ⇌ 2NH₃ thực hiện được khi có nhiệt độ, áp suất cao và xúc tác.",
    "dung": true
   },
   {
    "y": "Phản ứng (4) 2NO + O₂ → 2NO₂ xảy ra ngay ở điều kiện thường.",
    "dung": true
   },
   {
    "y": "Phản ứng (1) N₂ → NO₂ thực hiện được trực tiếp.",
    "dung": false
   },
   {
    "y": "Phản ứng (3) NH₃ → NO không cần chất xúc tác.",
    "dung": false
   }
  ],
  "giai_thich": "Oxi hóa NH₃ thành NO cần xúc tác Pt ở khoảng 850 °C; NO rất dễ bị O₂ không khí oxi hóa thành NO₂ màu nâu đỏ."
 },
 {
  "id": "bq_1789373737083_w2osu",
  "loai": "tf",
  "muc": "nb",
  "de": "Xét tính chất vật lí và liên kết trong phân tử ammonia.",
  "y_dung_sai": [
   {
    "y": "Khí NH₃ dễ hóa lỏng.",
    "dung": true
   },
   {
    "y": "Khí NH₃ nặng hơn không khí.",
    "dung": false
   },
   {
    "y": "Tỉ khối của NH₃ so với không khí khoảng 0,59.",
    "dung": true
   },
   {
    "y": "Liên kết giữa N và H trong NH₃ là liên kết cộng hóa trị không cực.",
    "dung": false
   }
  ],
  "giai_thich": "d = 17/29 ≈ 0,59 < 1 nên NH₃ nhẹ hơn không khí; hiệu độ âm điện giữa N và H đủ lớn để liên kết N−H phân cực."
 },
 {
  "id": "bq_1789373737083_x2gj2",
  "loai": "tf",
  "muc": "th",
  "de": "Xét nguyên nhân NH₃ tan nhiều trong nước.",
  "y_dung_sai": [
   {
    "y": "Phân tử NH₃ phân cực.",
    "dung": true
   },
   {
    "y": "NH₃ tạo được liên kết hydrogen với phân tử nước.",
    "dung": true
   },
   {
    "y": "NH₃ là phân tử không phân cực.",
    "dung": false
   },
   {
    "y": "NH₃ tan nhiều trong nước vì nhẹ hơn không khí.",
    "dung": false
   }
  ],
  "giai_thich": "Độ tan phụ thuộc vào tương tác giữa chất tan và dung môi chứ không phụ thuộc khối lượng mol; nguyên tử N có độ âm điện lớn nên tạo liên kết hydrogen."
 }
]
```
