---
# Thông tin dựng trang bìa. Sửa ở đây rồi chạy `npm run word` là bìa đổi theo.
# Dòng nào để trống thì bìa tự bỏ dòng đó đi.
co_quan: "SỞ GIÁO DỤC VÀ ĐÀO TẠO"
don_vi: "TRƯỜNG THPT"
loai: "ĐỀ TÀI NGHIÊN CỨU KHOA HỌC CẤP TRƯỜNG"
ten_de_tai: "Gia sư ảo bám sát Chương trình Hoá học 11 (2018): phương pháp ràng buộc mô hình ngôn ngữ lớn và kiểm chứng tự động"
ten_tieng_anh: "A Curriculum-Grounded AI Tutor for Grade-11 Chemistry: Constraining a Large Language Model and Verifying It Automatically"
linh_vuc: "Khoa học máy tính — Trí tuệ nhân tạo ứng dụng"
mon_lien_quan: "Hoá học 11 — Kết nối tri thức với cuộc sống"
chu_nhiem: "(bổ sung họ tên)"
gv_huong_dan: ""
hoc_sinh: ""
thanh_vien: ""
don_vi_chu_tri: "(bổ sung)"
thoi_gian: "Tháng 9 – tháng 10 năm 2026"
dia_danh: "(địa phương), tháng 9 năm 2026"
muc_luc: true
---

# THÔNG TIN CHUNG VỀ ĐỀ TÀI

| | |
|---|---|
| **Lĩnh vực** | Khoa học máy tính — Trí tuệ nhân tạo ứng dụng |
| **Môn học liên quan** | Hoá học 11 — Kết nối tri thức với cuộc sống |
| **Cấp đề tài** | Cấp trường |
| **Chủ nhiệm đề tài** | *(bổ sung)* |
| **Đơn vị chủ trì** | *(bổ sung)* |
| **Thời gian thực hiện** | Tháng 9 – tháng 10 năm 2026 |
| **Đối tượng thực nghiệm** | Học sinh khối 11 của trường |

---

# 1. TÍNH CẤP THIẾT CỦA ĐỀ TÀI

## 1.1. Học sinh đang dùng trí tuệ nhân tạo để học, mà chưa ai kiểm tra nó dạy đúng hay sai

Các công cụ trí tuệ nhân tạo như ChatGPT hay Gemini đã trở thành thứ học sinh mở ra hằng ngày để hỏi bài. Nhà trường gần như không kiểm soát được việc này, và cũng chưa có cách nào biết chúng đang dạy các em điều gì.

Cùng lúc đó, Chương trình giáo dục phổ thông 2018 (Thông tư 32/2018/TT-BGDĐT) bắt đầu áp dụng cho lớp 11 từ năm học 2023–2024, mang theo nhiều thay đổi căn bản đối với môn Hoá học.

Hai việc này gặp nhau và tạo ra vấn đề mà đề tài muốn giải quyết.

## 1.2. Vấn đề thứ nhất: trí tuệ nhân tạo trả lời theo sách cũ

Các mô hình ngôn ngữ lớn (sau đây gọi tắt là **mô hình**) học từ một kho văn bản khổng lồ trên mạng. Kho đó chủ yếu là tài liệu tiếng Việt viết **trước năm 2018** cùng tài liệu nước ngoài. Vì vậy khi được hỏi về Hoá học phổ thông Việt Nam, mô hình có xu hướng trả lời theo **chương trình 2006**.

Nhóm nghiên cứu đã thử và ghi nhận ba dạng sai, cả ba đều kiểm tra đúng sai được rõ ràng:

**Một là sai hằng số.** Mô hình dùng "điều kiện tiêu chuẩn (đktc)" với thể tích mol khí **22,4 L/mol** — quy ước 0 °C, 1 atm của sách cũ. Chương trình 2018 dùng "điều kiện chuẩn (đkc)" ở 25 °C và 1 bar, thể tích mol khí là **24,79 L/mol**.

Đây là sai lệch nặng nhất. Hằng số này có mặt trong hầu hết bài toán tính lượng chất khí, nên **sai ở đây là sai toàn bộ đáp số** — trong khi bài giải vẫn trình bày mạch lạc, đủ các bước, trông rất đáng tin.

**Hai là sai tên gọi.** Mô hình gọi NaOH là "natri hiđroxit" thay vì "sodium hydroxide", gọi alcohol là "ancol", aldehyde là "anđehit". Học sinh chép vào bài kiểm tra sẽ bị trừ điểm dù bản chất hoá học các em hiểu đúng.

**Ba là bịa nội dung không có trong sách.** Hỏi "Bài 30 nói gì?", mô hình có thể mô tả một bài học không tồn tại, trong khi chương trình chỉ có đúng 25 bài.

Điều nguy hiểm không nằm ở bản thân ba lỗi ấy, mà ở chỗ **học sinh không đủ khả năng nhận ra**. Một câu trả lời sai được viết trôi chảy, đúng giọng thầy cô, có kèm phương trình hoá học — với người đang đi học, nó không khác gì một câu trả lời đúng.

## 1.3. Vấn đề thứ hai: cứ hỏi là nó cho đáp án

Các công cụ này được nhà sản xuất điều chỉnh theo hướng làm hài lòng người dùng. Học sinh gõ "cho em đáp án luôn" thì nó đưa đáp án ngay. Kết quả là các em có bài nộp nhưng không hề trải qua quá trình suy nghĩ để ra bài nộp đó.

Từ góc độ tin học, đây là một bài toán đáng chú ý: **làm sao buộc một chương trình vốn được thiết kế để giúp đỡ hết mình phải từ chối giúp theo đúng cách người dùng đang đòi** — và giữ được thái độ ấy khi học sinh nài nỉ liên tục qua nhiều lượt.

## 1.4. Chỗ chưa ai làm

Đề tài xác định hai chỗ trống:

**Chỗ trống thứ nhất — chưa có ai làm cho chương trình Việt Nam 2018.** Trên thế giới đã có nhiều hệ dạy học thông minh và rất nhiều nghiên cứu về trí tuệ nhân tạo trong giáo dục, nhưng đều dựa trên chương trình của Mỹ hoặc châu Âu. Việc buộc mô hình bám theo một chương trình quốc gia **vừa mới thay đổi** — nơi kiến thức mô hình đã học mâu thuẫn thẳng với nội dung cần dạy — thì chưa thấy công trình nào.

**Chỗ trống thứ hai — không ai kiểm tra tự động.** Phần lớn ứng dụng trí tuệ nhân tạo trong giáo dục dừng ở chỗ mô tả cách viết câu lệnh rồi khẳng định "hệ thống hoạt động tốt". Không có cơ chế nào **tự phát hiện** khi hệ thống bắt đầu trả lời sai. Với một công cụ mà nhà sản xuất có thể cập nhật bất cứ lúc nào, đây là thiếu sót có hậu quả thật: chất lượng tụt xuống mà không ai hay biết.

## 1.5. Vì sao phải làm ngay

Học sinh **đang** dùng, không chờ nghiên cứu xong. Mỗi năm học trôi qua là thêm một khoá tiếp nhận kiến thức theo quy ước đã bị thay thế. Đề tài cần làm trong giai đoạn chương trình 2018 còn đang triển khai, khi kết quả còn kịp có ích.

---

# 2. MỤC TIÊU NGHIÊN CỨU

## 2.1. Mục tiêu chung

Xây dựng một gia sư ảo **bám sát Chương trình Hoá học 11 năm 2018**, vừa trả lời đúng kiến thức vừa dẫn dắt học sinh tự tìm ra lời giải thay vì cho đáp án; và quan trọng không kém — **chứng minh được điều đó bằng kiểm tra tự động**, chứ không chỉ nói suông.

## 2.2. Mục tiêu cụ thể

**Mục tiêu 1 — Buộc mô hình bám đúng chương trình.**
Xây dựng cách đưa nội dung 25 bài của chương trình vào từng lượt hỏi đáp.

*Đạt khi:* hệ thống dùng đúng đkc 24,79 L/mol và tên chất theo IUPAC trong toàn bộ các phép thử; không bịa ra bài học nào ngoài 25 bài.

**Mục tiêu 2 — Buộc mô hình dẫn dắt thay vì cho đáp án.**
Xây dựng cơ chế bắt gia sư gợi mở từng bước, nhưng không cứng nhắc tới mức những câu hỏi tra cứu đơn giản cũng bị bắt đi vòng.

*Đạt khi:* hệ thống không đưa đáp án kể cả khi học sinh đòi thẳng hoặc tìm cách lách; đồng thời trả lời gọn những câu hỏi kiểu "phần này học ở bài nào".

**Mục tiêu 3 — Xây dựng bộ kiểm tra tự động.**
Làm bộ công cụ chạy bằng một câu lệnh, tự phát hiện được sai sót về kiến thức, về tên gọi và về cách dạy.

*Đạt khi:* bộ kiểm tra bắt được lỗi thật trên hệ thống đang chạy, không phải chỉ trên tình huống nghĩ ra.

**Mục tiêu 4 — Đo hiệu quả thật trên học sinh.**
Tổ chức thực nghiệm có nhóm đối chứng để trả lời: cách dạy gợi mở có giúp học sinh làm bài tốt hơn cách giảng thẳng hay không.

*Đạt khi:* thu và phân tích được điểm trước – sau trên học sinh khối 11, báo cáo đầy đủ kết quả kèm đánh giá mức tin cậy.

---

# 3. NỘI DUNG NGHIÊN CỨU

## Nội dung 1. Tìm hiểu tài liệu

Tìm hiểu một số công trình tiêu biểu về hệ dạy học thông minh và về trí tuệ nhân tạo trong giáo dục; tìm hiểu các cách buộc mô hình bám nội dung; nêu rõ đề tài khác gì những gì đã có.

## Nội dung 2. Đo mức sai của mô hình so với chương trình mới

Soạn bộ câu hỏi thử có đáp án rõ ràng, tập trung vào những điểm chương trình 2018 khác chương trình 2006. Đo tỉ lệ sai của mô hình khi **chưa** được ràng buộc, để sau này có cái mà so sánh.

## Nội dung 3. Xây dựng cách ràng buộc

**3.1. Đưa nội dung chương trình vào từng lượt hỏi.** Không thể nhét cả cuốn sách vào mỗi câu hỏi, nên phải chọn đưa gì và lúc nào:

| Phần đưa vào | Nội dung | Dùng khi nào |
|---|---|---|
| Danh mục bài học | Mã và tên 25 bài | Luôn luôn |
| Toàn văn bài đang mở | Trọng tâm, công thức, các mục, ý chính | Khi học sinh đang đọc một bài |
| Dàn bài cả chương trình | Tóm tắt và ý chính của cả 25 bài | Khi hỏi đáp chung, không mở bài nào |

**3.2. Chuẩn hoá dữ liệu bài học.** Xây dựng quy trình biến tài liệu giáo viên soạn thành dữ liệu cho máy đọc, kèm hai bước làm sạch: đổi thuật ngữ 2006 sang 2018, và khôi phục chỉ số dưới trong công thức hoá học bị mất khi lấy chữ ra khỏi tệp Word.

**3.3. Ràng buộc cách dạy.** Thiết kế quy trình dẫn dắt cho câu hỏi lý thuyết và cho bài toán tính, kèm bước lọc để không bắt mọi câu hỏi đều phải đi qua quy trình.

## Nội dung 4. Xây dựng bộ kiểm tra tự động

**4.1. Kiểm tra phần dữ liệu** — chạy không cần gọi mô hình: dữ liệu 25 bài có đủ và đúng không, ngân hàng câu hỏi có hợp lệ không, đề kiểm tra sinh ra có đúng cấu trúc không, công thức hoá học có đúng ký hiệu không, và **đáp án có bị lọt sang phần gửi cho mô hình không**.

**4.2. Kiểm tra cách trả lời** — gọi mô hình thật với những tình huống có đáp án rõ ràng: dùng đúng hằng số, đúng tên chất, không cho đáp án khi bị đòi, không bịa bài, từ chối câu hỏi ngoài môn Hoá.

**4.3. Kiểm tra thiết kế thực nghiệm** — đối chiếu hai nhóm để bảo đảm chúng chỉ khác nhau ở cách dạy, và kiểm tra phần tính toán thống kê có đúng không.

## Nội dung 5. Thực nghiệm và xử lý số liệu

Tổ chức thực nghiệm có nhóm đối chứng trên học sinh khối 11; thu và xử lý số liệu; phân tích; rút kết luận và nêu rõ những gì đề tài chưa làm được.

---

# 4. PHƯƠNG PHÁP NGHIÊN CỨU

## 4.1. Phương pháp nghiên cứu tài liệu

Đọc, phân tích và tổng hợp tài liệu về hệ dạy học thông minh, về cách buộc mô hình bám nội dung, và về Chương trình giáo dục phổ thông 2018 môn Hoá học.

## 4.2. Phương pháp xây dựng sản phẩm

Làm theo vòng lặp: thiết kế — làm — đo — sửa. Nguyên tắc xuyên suốt là **đo trước khi sửa**: mọi thay đổi phải dựa trên số liệu quan sát được chứ không dựa vào cảm tính, và con số đo được ghi lại ngay trong mã nguồn để lần sau còn đối chiếu.

## 4.3. Phương pháp kiểm tra tự động

Đây là phần đóng góp chính của đề tài về mặt tin học.

**Mỗi phép thử phải chấm được khách quan.** Ví dụ, phép thử về hằng số **không** đòi mô hình phải in ra con số 24,79 — vì gia sư có quyền hỏi ngược lại học sinh, và đó mới là cách dạy đúng. Phép thử chỉ kiểm rằng mô hình **không** tính bằng 22,4 L/mol, và nếu có nhắc tới 22,4 thì phải nói rõ đó là quy ước cũ.

**Chạy lặp nhiều lần.** Mô hình trả lời có yếu tố ngẫu nhiên, nên một lần chạy đạt chưa nói lên điều gì. Đề tài sẽ chạy lặp mỗi phép thử và báo cáo tỉ lệ đạt thay vì kết quả một lần.

**Kiểm tra lại chính bộ kiểm tra.** Trong quá trình làm, nhóm nghiên cứu phát hiện bộ chấm tự động có thể **báo hỏng oan** một câu trả lời đúng, khi tiêu chí chấm liệt kê cứng các cách diễn đạt được chấp nhận. Đây là một bài học có giá trị và sẽ được trình bày trong báo cáo: bộ chấm cũng cần được kiểm tra, và tỉ lệ chấm sai của nó phải nêu ra cùng kết quả.

## 4.4. Phương pháp thực nghiệm sư phạm

**Cách bố trí:** chia học sinh thành hai nhóm ngẫu nhiên, cùng kiểm tra trước, cùng học hai tuần, cùng kiểm tra sau.

**Chia nhóm:** máy tự chia ngẫu nhiên dựa trên mã học sinh. Cách này bảo đảm mỗi em cố định ở một nhóm suốt đợt — nếu chia lại mỗi lần đăng nhập, các em sẽ nhận cả hai cách dạy trộn lẫn và không còn hai nhóm để so sánh. Không ai, kể cả người làm đề tài, chọn được em nào vào nhóm nào.

**Hai nhóm khác nhau ở đâu:**

| | Nhóm thực nghiệm | Nhóm đối chứng |
|---|---|---|
| Cách dạy | Gợi mở, không cho đáp án | Giảng thẳng, có bài giải mẫu |
| Bám Chương trình 2018 | Có | **Có** |
| Hằng số đkc 24,79 L/mol | Có | **Có** |
| Tên chất theo IUPAC | Có | **Có** |
| Giới hạn phạm vi, rào an toàn | Có | **Có** |

Đây là điểm quan trọng nhất về mặt phương pháp: **hai nhóm chỉ được khác nhau ở đúng một thứ là cách dạy.** Nếu nhóm đối chứng đồng thời cũng kém hơn ở phần bám chương trình, thì chênh lệch điểm cuối cùng không biết là do cách dạy hay do một bên nắm kiến thức tốt hơn — và cả thực nghiệm trở nên vô nghĩa. Điều kiện này được máy kiểm tra tự động bằng cách đối chiếu từng phần bắt buộc phải có ở cả hai bên.

**Nhóm đối chứng không phải làm cho có.** Nó được viết đầy đủ, ngang với chất lượng học sinh nhận được khi hỏi một trợ lý trí tuệ nhân tạo thông thường. So sánh với một đối thủ cố tình làm yếu đi thì thắng cũng chẳng chứng minh được gì.

**Bài kiểm tra:** 15 câu do giáo viên bộ môn soạn và duyệt, trải đều bốn mức nhận biết – thông hiểu – vận dụng – vận dụng cao. Dùng **cùng một đề** cho lần trước và lần sau; việc học sinh nhớ đề tác động như nhau lên hai nhóm nên không làm lệch phép so sánh giữa hai nhóm. Các câu trong đề được **rút khỏi phần luyện tập** của hệ thống suốt đợt thực nghiệm, để tránh chuyện gia sư ôn đúng câu sắp thi. Bài làm chấm rọc phách.

**Đo cái gì:** mức tiến bộ, tức là điểm sau trừ điểm trước. Chốt trước khi thu số liệu, không đổi giữa chừng.

## 4.5. Phương pháp xử lý số liệu

| Bước | Việc | Để làm gì |
|---|---|---|
| 1 | So điểm trước của hai nhóm | Xem hai nhóm có ngang nhau từ đầu không |
| 2 | So mức tiến bộ của hai nhóm | Câu hỏi chính của đề tài |
| 3 | So điểm trước – sau trong từng nhóm | Xem đợt học có tác dụng không |

Phép so sánh dùng **kiểm định t** — công cụ chuẩn để trả lời câu hỏi "chênh lệch này là thật hay chỉ do may rủi". Đề tài dùng biến thể **Welch** vì nó không đòi hỏi hai nhóm phải dao động đều như nhau, điều mà lớp học thực tế không bao giờ bảo đảm.

Báo cáo đồng thời hai con số:

- **Mức tin cậy (giá trị *p*)** — khả năng chênh lệch quan sát được chỉ là do may rủi. Dưới 0,05 thì coi là đáng tin.
- **Mức chênh lệch thực tế (hệ số ảnh hưởng)** — chênh lệch đó **lớn tới đâu**. Với số học sinh đông, một khác biệt bé xíu vẫn cho *p* nhỏ; nên chỉ nhìn *p* thì không biết kết quả có ý nghĩa gì trên lớp học hay không.

**Cần bao nhiêu học sinh mới đủ.** Đây là câu hỏi quyết định kết luận có giá trị hay không:

| Số em mỗi nhóm | Phát hiện được chênh lệch từ mức |
|---|---|
| 40 | Lớn |
| 60 | Vừa |
| 100 | Vừa – nhỏ |
| 150 | Nhỏ |

Vì đề tài có toàn khối 11, cỡ mẫu đủ để phát hiện chênh lệch mức vừa — tốt hơn phần lớn nghiên cứu ở cấp trường.

Toàn bộ phần tính toán được viết trong đề tài và **đối chiếu với bảng tra chuẩn** trước khi đem dùng, để chắc chắn không tính sai.

## 4.6. Bảo đảm quyền lợi học sinh

Học sinh là người chưa thành niên, nên đề tài đặt ra các nguyên tắc bắt buộc:

- Xin ý kiến đồng ý của học sinh và phụ huynh trước khi bắt đầu; nói rõ có hai cách dạy, việc chia nhóm là ngẫu nhiên, và em nào muốn dừng thì dừng bất cứ lúc nào.
- Kết quả nghiên cứu **không ảnh hưởng gì tới điểm số chính thức** của học sinh.
- Số liệu chỉ lưu mã, **không lưu họ tên, lớp hay địa chỉ thư điện tử**.
- Nhóm đối chứng không bị thiệt: các em vẫn có một gia sư đầy đủ, thậm chí trả lời nhanh hơn. Hết đợt thì cả hai nhóm dùng chung bản chính thức.

---

# 5. KẾT QUẢ DỰ KIẾN

## 5.1. Sản phẩm

1. **Hệ thống gia sư ảo hoạt động được**, đã triển khai thực tế: hỏi đáp có gia sư, kho bài giảng 25 bài, ngân hàng câu hỏi, bài kiểm tra theo chương và ba trò chơi ôn tập.
2. **Bộ kiểm tra tự động** chạy bằng một câu lệnh, gồm phần kiểm dữ liệu và phần kiểm cách trả lời.
3. **Bộ số liệu thực nghiệm** trên học sinh khối 11.
4. **Báo cáo tổng kết đề tài** và bài trình bày bảo vệ.

## 5.2. Kết quả về mặt khoa học

1. Một **cách làm có thể áp dụng lại** cho môn học khác: mô tả đủ chi tiết để giáo viên Vật lí, Sinh học làm theo cho môn của mình.
2. **Bằng chứng số** đầu tiên trên học sinh của trường về hiệu quả của cách dạy gợi mở bằng trí tuệ nhân tạo.
3. Một **bài học về phương pháp**: bộ chấm tự động cũng có thể chấm sai, và điều đó phải được báo cáo chứ không giấu đi.

## 5.3. Chỉ tiêu định lượng

| Chỉ tiêu | Mức đặt ra |
|---|---|
| Tỉ lệ trả lời đúng quy ước Chương trình 2018 | Từ 95% số phép thử trở lên |
| Tỉ lệ giữ được nguyên tắc không cho đáp án | Từ 90% số lượt bị đòi trở lên |
| Số phép thử tự động | Từ 30 trở lên |
| Số học sinh tham gia thực nghiệm | Toàn khối 11 |

## 5.4. Hai khả năng — và cả hai đều có giá trị

Điều này được nói ngay từ đề cương, để không ai phải chịu áp lực ra một kết quả định sẵn:

**Khả năng A — nhóm gợi mở tiến bộ hơn rõ rệt.** Đây là bằng chứng số cho cách dạy này, và là cơ sở để nhân rộng ra các môn khác trong trường.

**Khả năng B — không đủ bằng chứng kết luận hai cách dạy khác nhau.** Kết quả này **vẫn có giá trị và vẫn báo cáo được**, vì nó cảnh báo rằng lợi ích của cách dạy gợi mở không hiển nhiên như nhiều lời quảng cáo về công nghệ giáo dục. Khi đó đề tài sẽ báo cáo mức chênh lệch quan sát được, nêu rõ cỡ mẫu đủ hay chưa, và đề xuất số học sinh cần cho lần sau.

Nhóm nghiên cứu cam kết **chốt cách đo và cách phân tích trước khi thu số liệu**, không thay đổi sau khi đã nhìn thấy kết quả.

## 5.5. Khả năng áp dụng và nhân rộng

Cách làm của đề tài **không gắn cứng với môn Hoá**. Cấu trúc dữ liệu bài học, cách đưa nội dung vào từng lượt hỏi, và bộ phép thử đều dùng lại được cho Vật lí, Sinh học hay bất kỳ môn nào có chương trình quy định chặt chẽ. Đây là hướng mở rộng tự nhiên sau khi đề tài kết thúc.

Trong phạm vi nhà trường, sản phẩm dùng được ngay cho việc tự học ở nhà và cho tiết ôn tập trên máy chiếu.

---

# 6. KẾ HOẠCH THỰC HIỆN

| Tuần | Thời gian | Việc làm | Kết quả |
|---|---|---|---|
| 1 | 08–13/9 | Hoàn thiện phần tìm hiểu tài liệu; soạn và duyệt đề kiểm tra 15 câu; rút các câu đó khỏi phần luyện tập; xin ý kiến đồng ý của học sinh và phụ huynh; **bật thanh toán dịch vụ** | Đề kiểm tra; phiếu đồng ý |
| 2 | 15–20/9 | Kiểm tra trước cho cả khối; bật chế độ chia nhóm; hướng dẫn học sinh cách dùng | Bảng điểm trước |
| 3–4 | 22/9–04/10 | Học sinh sử dụng hệ thống; theo dõi mức độ dùng; ghi nhật ký sự cố | Nhật ký; số lượt dùng |
| 5 | 06–11/10 | Kiểm tra sau; nhập và kiểm tra số liệu; chạy phân tích | Bảng số liệu; kết quả |
| 6 | 13–18/10 | Viết báo cáo tổng kết; làm bài trình bày | Báo cáo; slide |

---

# 7. NHỮNG RỦI RO ĐÃ LƯỜNG TRƯỚC

Nêu thẳng vì hai rủi ro đầu là chỗ dễ làm hỏng cả đề tài nhất.

## 7.1. Hết lượt dùng dịch vụ — rủi ro lớn nhất

**Vấn đề:** bản miễn phí của dịch vụ chỉ cho **20 lượt hỏi mỗi ngày**. Cả khối 11 dùng trong hai tuần cần khoảng **5.000 lượt**, trong khi bản miễn phí chỉ đáp ứng chừng 280 lượt cho cả đợt.

**Hậu quả nếu không xử lý:** hệ thống ngừng trả lời giữa đợt, và chính cái hạn mức đó — chứ không phải thiết kế nghiên cứu — sẽ quyết định em nào được dùng. Số liệu thu về sẽ không dùng được.

**Cách xử lý:** bật thanh toán trước tuần 1.

**Kinh phí cần chuẩn bị** (đo bằng chính hệ thống, không ước lượng):

| Phần nội dung gửi đi mỗi lượt | Số token |
|---|---|
| Câu lệnh điều khiển gia sư | 4.407 |
| Danh mục 25 bài (luôn gửi kèm) | 604 |
| Dàn bài cả chương trình | 7.994 |
| **Cộng mỗi lượt hỏi** | **13.005** |

Một điểm dễ bỏ sót: **lịch sử trò chuyện được gửi lại ở mỗi lượt**, nên một cuộc mười lượt tốn nhiều hơn mười lượt rời rạc khoảng 12%.

| Quy mô | Tổng lượt | Token gửi đi | Token nhận về |
|---|---|---|---|
| 100 học sinh × 25 lượt | 2.500 | 34,7 triệu | 0,75 triệu |
| 200 học sinh × 25 lượt | 5.000 | 69,5 triệu | 1,5 triệu |
| 300 học sinh × 50 lượt | 15.000 | 208,4 triệu | 4,5 triệu |

Với mặt bằng giá hiện nay của các mô hình hạng nhẹ, quy mô 200 học sinh tốn **dưới 25 đô-la Mỹ**. Cộng hệ số an toàn ba lần cho việc chạy thử và dùng nhiều hơn dự kiến, **kinh phí đề nghị dự trù là khoảng 1,5 triệu đồng**. Đơn giá cụ thể tra tại thời điểm thực hiện.

**Hai việc bắt buộc khi bật thanh toán:** đặt hạn mức chi tiêu theo ngày, để một lỗi lặp vô hạn không làm phát sinh chi phí ngoài tầm; và bật cảnh báo khi sắp chạm ngưỡng.

## 7.2. Thời gian rất gấp

**Vấn đề:** kế hoạch trên kết thúc giữa tháng 10 và **không có tuần dự phòng**. Chậm ở tuần 1 hay tuần 2 là phần phân tích bị đẩy quá hạn.

**Phương án dự phòng:** nếu không kịp làm xong thực nghiệm, đề tài vẫn đứng vững trên bốn nội dung đầu — cách ràng buộc, chuẩn hoá dữ liệu và bộ kiểm tra tự động đều đã có kết quả kiểm chứng được. Phần thực nghiệm khi đó trình bày ở dạng **thiết kế đã hoàn chỉnh và đang triển khai**, kèm số liệu thăm dò trên một lớp. Cách này trung thực và vẫn đủ nội dung, tốt hơn nhiều so với rút ngắn đợt học để lấy số liệu vội.

## 7.3. Nhà cung cấp cập nhật mô hình giữa chừng

**Vấn đề:** mô hình có thể được cập nhật bất cứ lúc nào, làm đổi cách trả lời ngay trong lúc đang thực nghiệm.

**Cách xử lý:** ghi rõ tên và phiên bản mô hình cùng ngày chạy; chạy bộ kiểm tra vào đầu và cuối đợt để phát hiện thay đổi; nếu có thì ghi vào phần hạn chế.

## 7.4. Học sinh dùng không đều

**Vấn đề:** một số em gần như không dùng, làm loãng kết quả cần đo.

**Cách xử lý:** ghi số lượt dùng của từng em; báo cáo song song hai kết quả — tính trên toàn bộ học sinh theo nhóm đã chia, và tính riêng trên những em có dùng thật — rồi nêu rõ khác biệt giữa hai cách tính.

---

# 8. NHỮNG ĐIỀU ĐỀ TÀI CHƯA LÀM ĐƯỢC

Nêu ngay từ đề cương, không đợi tới lúc bảo vệ mới nói:

- **Không giấu được nhóm.** Học sinh biết mình đang được dạy theo cách nào. Không có cách khắc phục trong điều kiện này.
- **Chỉ đo bằng bài kiểm tra.** Không đo được năng lực tự học lâu dài — vốn mới là điều hệ thống hướng tới. Đây là khoảng cách thật giữa thứ đo được và thứ muốn biết.
- **Phạm vi hẹp.** Một trường, một khối, một chương, một đợt ngắn. Chưa suy rộng ra được cho nơi khác.
- **Hiệu ứng đồ mới.** Học sinh dùng công cụ mới thường hào hứng hơn bình thường; điều này tác động lên cả hai nhóm nhưng có thể không đều.
- **Phụ thuộc dịch vụ bên ngoài.** Nếu nhà cung cấp thay đổi mô hình thì không lặp lại được y hệt kết quả.

---

# 9. TÀI LIỆU THAM KHẢO

*(Danh mục ban đầu, sẽ bổ sung trong quá trình thực hiện Nội dung 1)*

1. Bộ Giáo dục và Đào tạo (2018). *Chương trình giáo dục phổ thông môn Hoá học*. Ban hành kèm Thông tư số 32/2018/TT-BGDĐT.
2. Bộ sách giáo khoa *Hoá học 11 — Kết nối tri thức với cuộc sống*. NXB Giáo dục Việt Nam.
3. Bloom, B. S. (1984). The 2 Sigma Problem: The Search for Methods of Group Instruction as Effective as One-to-One Tutoring. *Educational Researcher*, 13(6), 4–16.
4. VanLehn, K. (2011). The Relative Effectiveness of Human Tutoring, Intelligent Tutoring Systems, and Other Tutoring Systems. *Educational Psychologist*, 46(4), 197–221.
5. Cohen, J. (1988). *Statistical Power Analysis for the Behavioral Sciences* (2nd ed.). Lawrence Erlbaum Associates.

---

*Đề cương lập ngày 03 tháng 9 năm 2026.*
