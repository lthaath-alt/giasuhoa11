# Đề dẫn soát nội dung — 19 câu

Mở tệp này trong Antigravity rồi bảo nó: *"làm đúng yêu cầu trong tệp,
ghi kết quả ra `docs/soat-hoa-hoc/tra-loi-2026-09-26-2311-bai-5-loai-tn-1.json`"*.

**Rồi làm lại LẦN NỮA**, trong một phiên mới, ghi ra
`docs/soat-hoa-hoc/tra-loi-2026-09-26-2311-bai-5-loai-tn-2.json`. Một lượt soát
KHÔNG đủ: đo 20/09/2026, cùng 16 câu chạy ba lượt cho ra 3, 3, rồi 0 câu
nghi ngờ — và ba câu bị bỏ sót ở lượt thứ ba là lỗi THẬT.

Xong thì nạp CẢ HAI, ngăn bằng dấu phẩy, KHÔNG có dấu cách:

```bash
npm run soat:hoa-hoc -- --bai bai-5 --loai tn --nap docs/soat-hoa-hoc/tra-loi-2026-09-26-2311-bai-5-loai-tn-1.json,docs/soat-hoa-hoc/tra-loi-2026-09-26-2311-bai-5-loai-tn-2.json
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
  "id": "bq_1789371866324_aeowo",
  "loai": "tn",
  "muc": "vdc",
  "de": "Trong công nghiệp, người ta sản xuất nitric acid (HNO₃) từ ammonia theo sơ đồ: NH₃ → NO → NO₂ → HNO₃. Để điều chế 150 tấn nitric acid có nồng độ 60% cần dùng bao nhiêu tấn ammonia? Biết hiệu suất của quá trình là 76,2% (làm tròn đến hàng phần mười).",
  "dap_an": "31,9",
  "sai_so_cho_phep": 0.1,
  "giai_thich": "m(NH₃) = (150·0,6·17/63)/0,762 ≈ 31,9 tấn."
 },
 {
  "id": "bq_1789371866324_o5l6j",
  "loai": "tn",
  "muc": "th",
  "de": "Cho các phát biểu sau: (a) Trong không khí, N₂ chiếm khoảng 78% về thể tích. (b) Phân tử N₂ có chứa liên kết ba bền vững nên N₂ trơ về mặt hóa học ngay cả khi đun nóng. (c) Trong phản ứng giữa N₂ và H₂ thì N₂ vừa là chất oxi hóa, vừa là chất khử. (d) N₂ lỏng có nhiệt độ thấp nên thường được sử dụng để bảo quản thực phẩm. (e) Phần lớn N₂ được sử dụng để tổng hợp NH₃, từ đó sản xuất nitric acid, phân bón,... Có bao nhiêu phát biểu đúng?",
  "dap_an": "3",
  "giai_thich": "Ba phát biểu (a), (d), (e) đúng; (b) và (c) sai về tính trơ khi đun nóng và vai trò của N₂."
 },
 {
  "id": "bq_1789371866325_iuik4",
  "loai": "tn",
  "muc": "vd",
  "de": "Thể tích hỗn hợp N₂ và H₂ (đkc, lấy theo đúng tỉ lệ phản ứng) cần lấy để điều chế 102 gam NH₃ với hiệu suất 25% là bao nhiêu lít?",
  "dap_an": "1189,92",
  "sai_so_cho_phep": 0.5,
  "giai_thich": "n(khí) = (3 + 9)/0,25 = 48 mol, V = 48·24,79 = 1189,92 L."
 },
 {
  "id": "bq_1789371866325_ryo9p",
  "loai": "tn",
  "muc": "vd",
  "de": "Nhiệt phân 32 gam NH₄NO₂ (NH₄NO₂ → N₂ + 2H₂O), sau phản ứng còn lại 10 gam chất rắn. Hiệu suất của phản ứng là bao nhiêu %?",
  "dap_an": "68,75",
  "sai_so_cho_phep": 0.05,
  "giai_thich": "H = (32 − 10)/32·100% = 68,75%."
 },
 {
  "id": "bq_1789371866325_ziyjn",
  "loai": "tn",
  "muc": "nb",
  "de": "Trong hợp chất NH₄Cl, số oxi hóa của nitrogen là bao nhiêu?",
  "dap_an": "-3",
  "giai_thich": "H có số oxi hóa +1, Cl có số oxi hóa −1 nên x + 4 − 1 = 0, x = −3."
 },
 {
  "id": "bq_1789371866326_86vq9",
  "loai": "tn",
  "muc": "vd",
  "de": "Trộn 300 mL dung dịch NaNO₂ 2 M với 200 mL dung dịch NH₄Cl 2 M rồi đun nóng đến khi phản ứng hoàn toàn. Thể tích khí thu được ở đkc là bao nhiêu lít?",
  "dap_an": "9,916",
  "sai_so_cho_phep": 0.02,
  "giai_thich": "n(N₂) = 0,4 mol, V = 0,4·24,79 = 9,916 L."
 },
 {
  "id": "bq_1789371866326_8ki3q",
  "loai": "tn",
  "muc": "vdc",
  "de": "Nhiệt phân 48 gam mẫu ammonium dichromate có lẫn tạp chất trơ, thu được 30 gam chất rắn. Phần trăm tạp chất trong mẫu là bao nhiêu %?",
  "dap_an": "5,5",
  "sai_so_cho_phep": 0.05,
  "giai_thich": "t = 2,64 gam nên phần trăm tạp chất = 2,64/48·100% = 5,5%."
 },
 {
  "id": "bq_1789371866326_d6afb",
  "loai": "tn",
  "muc": "vd",
  "de": "Cho 2,3 gam Na vào 200 mL dung dịch (NH₄)₂SO₄ 1 M, đun nóng thu được V lít khí (đkc). Giá trị của V là bao nhiêu?",
  "dap_an": "3,7185",
  "sai_so_cho_phep": 0.01,
  "giai_thich": "n(khí) = 0,05 (H₂) + 0,1 (NH₃) = 0,15 mol, V = 0,15·24,79 = 3,7185 L."
 },
 {
  "id": "bq_1789371866326_l2mtl",
  "loai": "tn",
  "muc": "vd",
  "de": "Thể tích khí N₂ (đkc) thu được khi nhiệt phân hoàn toàn 16 gam NH₄NO₂ là bao nhiêu lít?",
  "dap_an": "6,1975",
  "sai_so_cho_phep": 0.01,
  "giai_thich": "n(N₂) = 16/64 = 0,25 mol, V = 0,25·24,79 = 6,1975 L."
 },
 {
  "id": "bq_1789371866328_smrdv",
  "loai": "tn",
  "muc": "vd",
  "de": "Cho 7,437 lít N₂ (đkc) phản ứng với H₂ dư có xúc tác, hiệu suất phản ứng 20%. Thể tích ammonia thu được ở đkc là bao nhiêu lít?",
  "dap_an": "2,9748",
  "sai_so_cho_phep": 0.01,
  "giai_thich": "n(NH₃) = 2·0,3·0,2 = 0,12 mol nên V = 0,12·24,79 = 2,9748 L."
 },
 {
  "id": "bq_1789372198145_85blw",
  "loai": "tn",
  "muc": "th",
  "de": "Cho các nhận định sau: Phân tử ammonia và ion ammonium đều (1) chứa liên kết cộng hóa trị; (2) là base Brønsted trong nước; (3) là acid Brønsted trong nước; (4) chứa nguyên tử N có số oxi hóa −3. Có bao nhiêu nhận định đúng?",
  "dap_an": "2",
  "giai_thich": "Chỉ (1) và (4) đúng; NH₃ là base còn NH₄⁺ là acid theo Brønsted nên không cùng thỏa (2) hoặc (3)."
 },
 {
  "id": "bq_1789372198146_dzvv1",
  "loai": "tn",
  "muc": "th",
  "de": "Cho các phát biểu về chu trình nitrogen trong tự nhiên: (1) Thực vật đồng hóa nitrogen bằng cách hấp thụ chủ yếu ở dạng nitrate (NO₃⁻) và muối ammonium (NH₄⁺) qua rễ cây, chuyển hóa chúng thành protein thực vật. (2) Động vật đồng hóa protein thực vật tạo ra protein động vật. (3) Trong khí quyển, phản ứng tạo ra NO từ nitrogen và oxygen khi có sấm sét được coi là khởi đầu cho quá trình cung cấp đạm cho đất. (4) Chu trình của nitrogen trong tự nhiên là một chu trình tuần hoàn khép kín. Có bao nhiêu phát biểu đúng?",
  "dap_an": "4",
  "giai_thich": "Cả bốn phát biểu mô tả đúng các khâu của chu trình nitrogen khép kín giữa khí quyển, đất và sinh vật."
 },
 {
  "id": "bq_1789372198146_genrt",
  "loai": "tn",
  "muc": "vd",
  "de": "Trong công nghiệp, ammonia được tổng hợp từ nitrogen và hydrogen. Cho 14,874 L N₂ (đkc) tác dụng với lượng dư khí H₂. Biết hiệu suất của phản ứng là 30%, khối lượng NH₃ tạo thành là bao nhiêu gam?",
  "dap_an": "6,12",
  "sai_so_cho_phep": 0.01,
  "giai_thich": "n(NH₃) thực tế = 2·(14,874/24,79)·0,3 = 0,36 mol, khối lượng = 0,36·17 = 6,12 g."
 },
 {
  "id": "bq_1789372198146_tzp9g",
  "loai": "tn",
  "muc": "nb",
  "de": "Trong các ứng dụng: (1) Sản xuất phân bón (đạm ammonium,...); (2) Sản xuất nitric acid; (3) Sử dụng như một chất làm lạnh trong các hệ thống làm lạnh công nghiệp; (4) Làm dung môi; (5) Làm môi trường trơ trong một số ngành công nghiệp. Có bao nhiêu ứng dụng là của ammonia?",
  "dap_an": "4",
  "giai_thich": "Các ứng dụng (1), (2), (3), (4) là của ammonia; (5) là ứng dụng của nitrogen."
 },
 {
  "id": "bq_1789372198151_eazh0",
  "loai": "tn",
  "muc": "vd",
  "de": "Để sản xuất 7,84 kg phân ammonium nitrate theo phản ứng NH₃ + HNO₃ → NH₄NO₃ với hiệu suất 98% thì cần bao nhiêu kg nitric acid?",
  "dap_an": "6,3",
  "sai_so_cho_phep": 0.05,
  "giai_thich": "m(HNO₃) = (7,84/80)/0,98·63 = 6,3 kg."
 },
 {
  "id": "bq_1789372198151_oyh1c",
  "loai": "tn",
  "muc": "vd",
  "de": "Cho dung dịch NH₄NO₃ tác dụng với dung dịch kiềm của một kim loại M hóa trị II, thu được 4,958 lít khí (ở đkc) và 26,1 gam muối. Nguyên tử khối của M là bao nhiêu?",
  "dap_an": "137",
  "giai_thich": "n(NH₃) = 0,2 mol nên n(M(NO₃)₂) = 0,1 mol; M + 124 = 261, suy ra M = 137."
 },
 {
  "id": "bq_1789372198152_omo49",
  "loai": "tn",
  "muc": "vdc",
  "de": "Để điều chế 5 lít dung dịch HNO₃ 21% (D = 1,2 g/mL) bằng phương pháp oxi hóa NH₃ với hiệu suất toàn quá trình là 75%, thể tích khí NH₃ (đkc) tối thiểu cần dùng là bao nhiêu lít? (làm tròn đến hàng phần mười)",
  "dap_an": "661,1",
  "sai_so_cho_phep": 0.2,
  "giai_thich": "n(HNO₃) = 1260/63 = 20 mol; V(NH₃) = 20/0,75·24,79 ≈ 661,1 L."
 },
 {
  "id": "bq_1789372198152_ovilv",
  "loai": "tn",
  "muc": "vd",
  "de": "Một hỗn hợp gồm hai khí H₂ và N₂ theo tỉ lệ mol là 4 : 1. Nung với xúc tác ở nhiệt độ cao thu được hỗn hợp khí Y, trong đó NH₃ chiếm 20% thể tích. Hiệu suất của phản ứng là a%. Xác định giá trị của a (làm tròn đến hàng phần trăm).",
  "dap_an": "41,67",
  "sai_so_cho_phep": 0.05,
  "giai_thich": "2x/(5 − 2x) = 0,2 cho x = 1/2,4 ≈ 0,4167 mol N₂ phản ứng trên 1 mol ban đầu, a ≈ 41,67."
 },
 {
  "id": "bq_1789372198153_pebzz",
  "loai": "tn",
  "muc": "vdc",
  "de": "Hỗn hợp X gồm N₂ và H₂ có khối lượng mol trung bình bằng 12,4. Dẫn X đi qua bình đựng bột Fe rồi nung nóng (hiệu suất tổng hợp NH₃ đạt 40%), thu được hỗn hợp Y. Khối lượng mol trung bình của Y là bao nhiêu? (làm tròn đến hàng phần mười)",
  "dap_an": "14,8",
  "sai_so_cho_phep": 0.05,
  "giai_thich": "Với 2 mol N₂ và 3 mol H₂: n(Y) = 5 − 2·0,4 = 4,2 mol, M̄(Y) = 62/4,2 ≈ 14,8."
 }
]
```
