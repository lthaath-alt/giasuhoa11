---
title: "ĐỀ CƯƠNG NGHIÊN CỨU KHOA HỌC CẤP CƠ SỞ"
lang: vi
---

# Neo mô hình ngôn ngữ lớn vào Chương trình giáo dục phổ thông 2018: kiểm chứng tự động và thực nghiệm sư phạm trên môn Hoá học 11

**Tên tiếng Anh:** *Grounding Large Language Models in Vietnam's 2018 National Curriculum: Automated Verification and a Controlled Classroom Study in Grade-11 Chemistry*

| | |
|---|---|
| **Lĩnh vực** | Khoa học máy tính — Trí tuệ nhân tạo ứng dụng và Công nghệ phần mềm |
| **Cấp đề tài** | Cấp cơ sở |
| **Chủ nhiệm đề tài** | *(bổ sung)* |
| **Đơn vị chủ trì** | *(bổ sung)* |
| **Thời gian thực hiện** | Tháng 9 – tháng 10 năm 2026 |
| **Đối tượng thực nghiệm** | Học sinh khối 11 |

---

# 1. TÍNH CẤP THIẾT CỦA ĐỀ TÀI

## 1.1. Bối cảnh

Chương trình giáo dục phổ thông 2018 (Thông tư 32/2018/TT-BGDĐT) bắt đầu áp dụng cho lớp 11 từ năm học 2023–2024, mang theo những thay đổi có tính nền tảng đối với môn Hoá học: đổi hệ quy ước điều kiện chuẩn, chuyển toàn bộ danh pháp sang tiếng Anh theo IUPAC, và tái cấu trúc nội dung.

Cùng thời điểm đó, các mô hình ngôn ngữ lớn (Large Language Model — LLM) như ChatGPT, Gemini trở thành công cụ học sinh sử dụng hằng ngày mà nhà trường gần như không kiểm soát được.

Hai xu hướng này gặp nhau và tạo ra một vấn đề chưa được nghiên cứu ở Việt Nam.

## 1.2. Vấn đề thứ nhất: mô hình ngôn ngữ lớn trả lời theo chương trình cũ

Dữ liệu huấn luyện của các LLM phổ biến chủ yếu là tài liệu tiếng Việt được viết trước năm 2018 cùng tài liệu quốc tế. Hệ quả là khi được hỏi về Hoá học phổ thông Việt Nam, mô hình có xu hướng trả lời theo **chương trình 2006**. Khảo sát sơ bộ của nhóm nghiên cứu ghi nhận ba nhóm sai lệch có thể kiểm chứng khách quan:

**a) Sai hằng số.** Mô hình dùng "điều kiện tiêu chuẩn (đktc)" với thể tích mol khí 22,4 L/mol — quy ước 0 °C, 1 atm của chương trình cũ. Chương trình 2018 dùng "điều kiện chuẩn (đkc)" ở 25 °C và 1 bar với thể tích mol khí **24,79 L/mol**.

Đây là sai lệch nghiêm trọng nhất, vì hằng số này xuất hiện trong hầu hết bài toán tính lượng chất khí. Sai ở đây thì **toàn bộ kết quả bài tính sai theo**, trong khi cách trình bày vẫn hoàn toàn chỉnh chu và thuyết phục.

**b) Sai danh pháp.** Mô hình gọi NaOH là "natri hiđroxit" thay vì "sodium hydroxide"; gọi alcohol là "ancol", aldehyde là "anđehit". Học sinh chép lại vào bài kiểm tra sẽ bị trừ điểm dù bản chất hoá học các em hiểu đúng.

**c) Bịa nội dung ngoài chương trình.** Được hỏi "Bài 30 nói gì?", mô hình có thể mô tả một bài học không tồn tại, trong khi chương trình chỉ có đúng 25 bài.

Điều làm ba sai lệch trên trở nên nguy hiểm không phải bản thân chúng, mà là **học sinh không có đủ năng lực để phát hiện**. Một câu trả lời sai được trình bày mạch lạc, đúng văn phong sư phạm, có phương trình hoá học kèm theo — đối với người học, nó không khác gì một câu trả lời đúng.

## 1.3. Vấn đề thứ hai: mô hình được huấn luyện để chiều người dùng

Các LLM thương mại được tinh chỉnh theo hướng hữu ích và làm hài lòng người dùng. Khi học sinh yêu cầu "cho em đáp án luôn", mô hình đưa đáp án. Điều này đi ngược mục tiêu sư phạm: học sinh nhận được kết quả nhưng không trải qua quá trình tư duy tạo ra kết quả đó.

Từ góc độ khoa học máy tính, đây là một bài toán đáng chú ý: **làm thế nào ràng buộc một mô hình vốn được tối ưu để giúp đỡ, phải từ chối giúp đỡ theo đúng cách người dùng đang yêu cầu** — và duy trì được ràng buộc đó khi người dùng gây áp lực liên tục qua nhiều lượt hội thoại.

## 1.4. Khoảng trống nghiên cứu

Qua khảo sát tài liệu, nhóm nghiên cứu xác định hai khoảng trống:

**Khoảng trống 1 — chưa có nghiên cứu về neo LLM vào chương trình Việt Nam 2018.** Các hệ dạy học thông minh (Intelligent Tutoring System) đã có lịch sử trên năm mươi năm và các nghiên cứu về LLM trong giáo dục xuất hiện dày đặc từ 2023, nhưng đều xây dựng trên chương trình Hoa Kỳ hoặc châu Âu. Bài toán neo mô hình vào một chương trình quốc gia **vừa cải cách**, nơi dữ liệu huấn luyện của mô hình mâu thuẫn trực tiếp với nội dung cần dạy, chưa được nghiên cứu.

**Khoảng trống 2 — thiếu phương pháp kiểm chứng tự động.** Phần lớn ứng dụng LLM trong giáo dục dừng ở mức mô tả cách thiết kế câu lệnh và khẳng định hệ thống hoạt động tốt, không có cơ chế nào để **phát hiện tự động** khi hệ thống bắt đầu trả lời sai. Với một hệ thống mà nhà cung cấp có thể cập nhật mô hình bất kỳ lúc nào, đây là thiếu sót có hậu quả thực tế: hệ thống có thể suy giảm chất lượng mà không ai hay biết.

## 1.5. Tính cấp thiết về thời điểm

Học sinh **đang** sử dụng các công cụ này, không chờ nghiên cứu kết luận. Mỗi năm học trôi qua là thêm một khoá học sinh tiếp nhận kiến thức theo quy ước đã bị thay thế. Nghiên cứu này cần được thực hiện trong giai đoạn chương trình 2018 còn đang triển khai, khi kết quả còn kịp có tác dụng.

---

# 2. MỤC TIÊU NGHIÊN CỨU

## 2.1. Mục tiêu tổng quát

Xây dựng và kiểm chứng một phương pháp neo mô hình ngôn ngữ lớn vào Chương trình giáo dục phổ thông 2018 môn Hoá học lớp 11, bảo đảm đồng thời **tính đúng đắn về nội dung** và **tính phù hợp về phương pháp sư phạm**, trong đó sự tuân thủ của hệ thống phải kiểm chứng được một cách tự động thay vì chỉ được cam kết bằng lời.

## 2.2. Mục tiêu cụ thể

**MT1 — Xây dựng phương pháp neo nội dung.**
Thiết kế kiến trúc dựng ngữ cảnh đưa nội dung chương trình 2018 vào mỗi lượt hỏi đáp, sao cho mô hình bám đúng 25 bài của chương trình.

*Tiêu chí đạt:* hệ thống trả lời đúng quy ước đkc 24,79 L/mol và danh pháp IUPAC trong toàn bộ phép thử; không bịa bài học ngoài phạm vi 25 bài.

**MT2 — Xây dựng phương pháp ràng buộc sư phạm.**
Thiết kế cơ chế buộc mô hình dẫn dắt học sinh tự tìm ra lời giải thay vì cung cấp đáp án, đồng thời không quá cứng nhắc tới mức cản trở các câu hỏi tra cứu thông thường.

*Tiêu chí đạt:* hệ thống không cung cấp đáp án ngay cả khi học sinh yêu cầu trực tiếp hoặc tìm cách lách; đồng thời trả lời thẳng các câu hỏi tra cứu mà không bắt học sinh đi qua quy trình dẫn dắt.

**MT3 — Xây dựng bộ kiểm chứng tự động.**
Phát triển bộ công cụ chạy bằng một lệnh, phát hiện được các sai lệch về nội dung, về thuật ngữ và về hành vi sư phạm.

*Tiêu chí đạt:* bộ kiểm chứng phát hiện được lỗi thực tế trên hệ thống đang chạy, không chỉ trên tình huống giả định.

**MT4 — Đánh giá hiệu quả bằng thực nghiệm sư phạm.**
Tiến hành nghiên cứu có nhóm đối chứng, phân nhóm ngẫu nhiên, để trả lời câu hỏi cách dạy gợi mở có làm tăng kết quả học tập so với cách giảng thẳng hay không.

*Tiêu chí đạt:* thu thập và phân tích được số liệu trước – sau trên toàn khối 11, báo cáo đầy đủ giá trị *p* và mức chênh lệch kèm đánh giá lực kiểm định.

---

# 3. NỘI DUNG NGHIÊN CỨU

## ND1. Nghiên cứu tổng quan

Khảo sát các hệ dạy học thông minh kinh điển và các nghiên cứu về LLM trong giáo dục giai đoạn 2023–2026; phân tích các kỹ thuật neo tri thức; xác định vị trí của đề tài trong bức tranh chung và làm rõ khoảng trống nghiên cứu.

## ND2. Phân tích sai lệch của mô hình đối với Chương trình 2018

Xây dựng bộ tình huống thử có đáp án khách quan, tập trung vào các điểm chương trình 2018 khác chương trình 2006. Đo tỉ lệ sai của mô hình khi **không** được neo, làm cơ sở đối chiếu cho phần sau.

## ND3. Xây dựng phương pháp neo và ràng buộc

**ND3.1. Kiến trúc dựng ngữ cảnh ba tầng.** Thiết kế cơ chế lựa chọn nội dung đưa vào mỗi lượt hỏi, cân bằng giữa độ bao phủ và chi phí:

| Tầng | Nội dung | Khi nào dùng |
|---|---|---|
| Danh mục bài học | Mã và tên 25 bài | Luôn luôn |
| Toàn văn bài đang mở | Trọng tâm, công thức, mục, ý chính, câu hỏi gợi mở | Khi học sinh đang đọc một bài cụ thể |
| Dàn bài cả chương trình | Tóm tắt và ý chính của cả 25 bài | Khi hỏi đáp chung, không mở bài nào |

**ND3.2. Chuẩn hoá dữ liệu nguồn.** Xây dựng quy trình chuyển tài liệu giáo viên soạn thành dữ liệu có cấu trúc, kèm hai bước chuẩn hoá: đổi thuật ngữ 2006 sang 2018 và khôi phục ký hiệu hoá học (chỉ số dưới) bị mất khi trích xuất văn bản.

**ND3.3. Ràng buộc sư phạm.** Thiết kế quy trình dẫn dắt theo nhánh lý thuyết và nhánh bài toán, kèm cơ chế phân loại để không áp quy trình lên các câu hỏi không cần thiết.

## ND4. Xây dựng bộ kiểm chứng tự động

**ND4.1. Kiểm chứng tĩnh** — chạy không cần gọi mô hình: tính toàn vẹn dữ liệu chương trình, ngân hàng câu hỏi, thuật toán sinh đề, ký hiệu hoá học, và ràng buộc không để lộ đáp án sang phần ngữ cảnh gửi cho mô hình.

**ND4.2. Kiểm chứng hành vi** — gọi mô hình thật với các tình huống có tiêu chí chấm khách quan: dùng đúng hằng số, dùng đúng danh pháp, không cung cấp đáp án khi bị yêu cầu, không bịa nội dung, từ chối yêu cầu ngoài phạm vi môn học.

**ND4.3. Kiểm chứng thiết kế thực nghiệm** — đối chiếu hai nhánh thực nghiệm để bảo đảm chúng chỉ khác nhau ở biến nghiên cứu, và kiểm chứng phần thống kê tự cài với bảng tra chuẩn.

## ND5. Thực nghiệm sư phạm và phân tích số liệu

Tiến hành thực nghiệm có đối chứng trên toàn khối 11; xử lý số liệu; phân tích kết quả; rút ra kết luận và chỉ rõ hạn chế.

---

# 4. PHƯƠNG PHÁP NGHIÊN CỨU

## 4.1. Phương pháp nghiên cứu lý luận

Phân tích, tổng hợp tài liệu về hệ dạy học thông minh, kỹ thuật neo tri thức cho mô hình ngôn ngữ, và Chương trình giáo dục phổ thông 2018 môn Hoá học.

## 4.2. Phương pháp thiết kế và xây dựng hệ thống

Xây dựng hệ thống theo hướng lặp: thiết kế — hiện thực — đo — sửa. Nguyên tắc xuyên suốt là **đo trước khi sửa**: mọi thay đổi phải dựa trên số liệu quan sát được chứ không dựa trên phỏng đoán, và số đo được ghi lại ngay trong mã nguồn.

## 4.3. Phương pháp kiểm chứng tự động

Đây là phương pháp mang tính đóng góp chính của đề tài về mặt công nghệ phần mềm.

**Nguyên tắc thiết kế:** mỗi phép thử phải có **tiêu chí chấm khách quan**, không phụ thuộc đánh giá chủ quan. Thí dụ, phép thử về hằng số không đòi mô hình phải in ra con số 24,79 — vì mô hình có quyền hỏi ngược lại học sinh, và đó mới là hành vi sư phạm đúng — mà chỉ kiểm rằng mô hình **không** tính bằng 22,4 L/mol, và nếu có nhắc tới 22,4 thì phải nói rõ đó là quy ước cũ.

**Xử lý tính ngẫu nhiên của mô hình:** LLM sinh văn bản có yếu tố ngẫu nhiên, nên một lần chạy đạt không bảo đảm hệ thống ổn định. Nghiên cứu sẽ chạy lặp mỗi phép thử và báo cáo tỉ lệ đạt thay vì kết quả một lần.

**Kiểm chứng chính bộ kiểm chứng:** trong quá trình phát triển, nhóm nghiên cứu ghi nhận bộ chấm tự động có thể **báo hỏng oan** một câu trả lời đúng khi tiêu chí chấm liệt kê cứng các cụm từ chấp nhận được. Đây là một phát hiện có giá trị phương pháp luận và sẽ được trình bày trong báo cáo: bộ chấm tự động cũng cần được kiểm chứng, và tỉ lệ sai của nó phải được báo cáo cùng kết quả.

## 4.4. Phương pháp thực nghiệm sư phạm

**Thiết kế:** thực nghiệm ngẫu nhiên có đối chứng, đo trước – đo sau, hai nhóm song song.

**Phân nhóm:** ngẫu nhiên bằng hàm băm từ định danh học sinh. Cách này bảo đảm mỗi học sinh cố định ở một nhánh trong suốt đợt — nếu tung ngẫu nhiên mỗi lượt truy cập, học sinh sẽ nhận cả hai cách dạy trộn lẫn và không còn hai nhóm để so sánh. Không ai, kể cả nhóm nghiên cứu, chọn được học sinh nào vào nhóm nào.

**Hai nhánh:**

| | Nhóm thực nghiệm | Nhóm đối chứng |
|---|---|---|
| Cách dạy | Dẫn dắt gợi mở, không cung cấp đáp án | Giảng trực tiếp, có lời giải mẫu đầy đủ |
| Neo Chương trình 2018 | Có | **Có** |
| Hằng số đkc 24,79 L/mol | Có | **Có** |
| Danh pháp IUPAC | Có | **Có** |
| Giới hạn phạm vi và an toàn | Có | **Có** |

Đây là điểm mấu chốt về mặt phương pháp: **hai nhánh chỉ được khác nhau ở đúng một biến là cách dạy.** Nếu nhóm đối chứng đồng thời yếu hơn ở phần neo nội dung thì chênh lệch kết quả không quy được về nguyên nhân nào, và thực nghiệm mất giá trị. Điều kiện này được kiểm chứng tự động bằng cách đối chiếu từng thành phần bắt buộc phải có ở cả hai nhánh.

**Nhóm đối chứng không phải phương án hình thức.** Nhánh đối chứng được thiết kế đầy đủ, tương đương chất lượng mà học sinh nhận được khi sử dụng một trợ lý AI thông thường. So sánh với một đối tượng cố ý làm yếu đi sẽ không cho kết luận có ý nghĩa.

**Công cụ đo:** bài kiểm tra 15 câu do giáo viên bộ môn soạn và thẩm định, trải đều bốn mức nhận biết – thông hiểu – vận dụng – vận dụng cao. Dùng cùng một đề cho lần đo trước và lần đo sau; hiệu ứng ghi nhớ đề tác động như nhau lên hai nhóm nên không ảnh hưởng phép so sánh giữa hai nhóm. Các câu trong đề được rút khỏi phần luyện tập của hệ thống trong suốt đợt thực nghiệm. Bài làm được chấm rọc phách.

**Biến phụ thuộc:** mức tiến bộ, tính bằng điểm sau trừ điểm trước. Biến này được chốt trước khi thu số liệu.

## 4.5. Phương pháp xử lý số liệu

| Bước | Kiểm định | Mục đích |
|---|---|---|
| 1 | t Welch trên điểm trước | Xác nhận hai nhóm tương đương từ đầu |
| 2 | t Welch trên mức tiến bộ | Câu hỏi nghiên cứu chính |
| 3 | t cặp trong từng nhóm | Xác nhận đợt học có tác động |

Sử dụng kiểm định **t Welch** thay vì t Student vì Welch không giả định hai nhóm có phương sai bằng nhau — giả định mà lớp học thực tế không bảo đảm, và khi giả định sai thì Student cho giá trị *p* lạc quan hơn thực tế.

Báo cáo đồng thời **giá trị *p*** và **mức chênh lệch (Hedges' g)**. Chỉ báo cáo *p* thì không biết chênh lệch có đáng kể trên thực tế hay không; chỉ báo cáo mức chênh lệch thì không biết nó có phải do ngẫu nhiên.

**Lực kiểm định.** Với cỡ mẫu toàn khối 11, ở mức ý nghĩa 0,05 hai phía và lực kiểm định 80%:

| Số học sinh mỗi nhóm | Phát hiện được chênh lệch từ |
|---|---|
| 40 | g ≈ 0,63 (mức vừa – lớn) |
| 60 | g ≈ 0,51 (mức vừa) |
| 100 | g ≈ 0,40 (mức vừa – nhỏ) |
| 150 | g ≈ 0,32 (mức nhỏ – vừa) |

Toàn bộ hàm thống kê được cài đặt trong đề tài và **đối chiếu với bảng tra phân phối t chuẩn** ở nhiều bậc tự do trước khi sử dụng.

## 4.6. Đạo đức nghiên cứu

Đối tượng là người chưa thành niên, do đó:

- Xin đồng ý của học sinh và của phụ huynh trước khi bắt đầu; nêu rõ có hai cách dạy, việc phân nhóm là ngẫu nhiên, và học sinh có thể rút khỏi nghiên cứu bất cứ lúc nào.
- Kết quả nghiên cứu **không ảnh hưởng đến điểm số chính thức** của học sinh.
- Số liệu chỉ lưu mã ẩn danh, không lưu họ tên, địa chỉ thư điện tử hay lớp.
- Nhóm đối chứng không bị thiệt: các em vẫn được một gia sư đầy đủ chức năng. Sau khi kết thúc đợt, toàn bộ học sinh dùng chung phiên bản chính thức.

---

# 5. KẾT QUẢ DỰ KIẾN

## 5.1. Sản phẩm khoa học

1. **Phương pháp neo LLM vào chương trình quốc gia vừa cải cách**, mô tả đủ chi tiết để áp dụng lại cho môn học khác hoặc cấp học khác.
2. **Bộ kiểm chứng tự động** cho hệ thống giáo dục dựa trên LLM, gồm cả kiểm chứng tĩnh và kiểm chứng hành vi, kèm phân tích về độ tin cậy của chính bộ chấm.
3. **Số liệu thực nghiệm** về hiệu quả của cách dạy gợi mở so với cách giảng trực tiếp trên mẫu học sinh Việt Nam.
4. **Báo cáo tổng kết** và **01 bài báo** đăng kỷ yếu hội nghị hoặc tạp chí chuyên ngành.

## 5.2. Sản phẩm ứng dụng

Hệ thống hoạt động được, triển khai thực tế, gồm phần hỏi đáp có gia sư ảo, kho bài giảng, ngân hàng câu hỏi, bài kiểm tra theo chương và ba trò chơi ôn tập. Mã nguồn kèm bộ kiểm chứng được công bố để nhóm khác kiểm chứng lại.

## 5.3. Kết quả định lượng dự kiến

| Chỉ tiêu | Mức dự kiến |
|---|---|
| Tỉ lệ trả lời đúng quy ước Chương trình 2018 | ≥ 95% số phép thử |
| Tỉ lệ giữ được ràng buộc không cung cấp đáp án | ≥ 90% số lượt bị yêu cầu trực tiếp |
| Số phép thử tự động | ≥ 30 |
| Cỡ mẫu thực nghiệm | Toàn khối 11 |

## 5.4. Hai kịch bản kết quả thực nghiệm — cả hai đều có giá trị

Điểm này được nêu ngay trong đề cương để tránh áp lực phải ra một kết quả định sẵn:

**Kịch bản A — nhóm gợi mở tiến bộ hơn có ý nghĩa thống kê.** Cung cấp bằng chứng định lượng đầu tiên trên học sinh Việt Nam cho phương pháp dẫn dắt gợi mở bằng LLM, và là cơ sở để nhân rộng.

**Kịch bản B — không đủ bằng chứng kết luận hai cách dạy khác nhau.** Vẫn là kết quả có giá trị công bố, vì nó cảnh báo rằng lợi ích của cách dạy gợi mở không hiển nhiên như nhiều tài liệu quảng bá công nghệ giáo dục ngụ ý. Trong trường hợp này, đề tài sẽ báo cáo mức chênh lệch quan sát được kèm khoảng tin cậy và lực kiểm định của mẫu, đồng thời đề xuất cỡ mẫu cần thiết cho nghiên cứu tiếp theo.

Nhóm nghiên cứu cam kết **chốt biến đo và kế hoạch phân tích trước khi thu số liệu**, không thay đổi sau khi đã nhìn thấy kết quả.

## 5.5. Khả năng ứng dụng và mở rộng

Phương pháp neo và bộ kiểm chứng không gắn cứng với môn Hoá học. Cấu trúc dữ liệu chương trình, cơ chế dựng ngữ cảnh và bộ phép thử đều có thể áp dụng cho Vật lí, Sinh học hoặc bất kỳ môn nào có chương trình được quy định chặt chẽ. Đây là hướng mở rộng tự nhiên sau khi đề tài kết thúc.

---

# 6. KẾ HOẠCH THỰC HIỆN

| Tuần | Thời gian | Nội dung | Sản phẩm |
|---|---|---|---|
| 1 | 08–13/9 | Hoàn thiện tổng quan; chốt đề kiểm tra 15 câu; rút các câu đó khỏi phần luyện tập; xin đồng ý của học sinh và phụ huynh; **bật thanh toán dịch vụ API** | Đề kiểm tra; văn bản đồng ý |
| 2 | 15–20/9 | Kiểm tra trước cho toàn khối; kích hoạt phân nhóm; tập huấn cách sử dụng | Số liệu điểm trước |
| 3–4 | 22/9–04/10 | Giai đoạn can thiệp; theo dõi mức độ sử dụng; ghi nhật ký sự cố | Nhật ký; số lượt sử dụng |
| 5 | 06–11/10 | Kiểm tra sau; nhập và làm sạch số liệu; chạy phân tích thống kê | Bảng số liệu; kết quả phân tích |
| 6 | 13–18/10 | Viết báo cáo tổng kết; chuẩn bị bảo vệ | Báo cáo; bài trình bày |

---

# 7. RỦI RO VÀ PHƯƠNG ÁN DỰ PHÒNG

Phần này được nêu thẳng vì hai rủi ro đầu đã được xác định là **đường găng** của đề tài.

## 7.1. Hạn mức dịch vụ API — rủi ro cao nhất

**Vấn đề:** bậc miễn phí của dịch vụ mô hình ngôn ngữ giới hạn 20 lượt gọi mỗi ngày cho mỗi mô hình. Với toàn khối 11 sử dụng trong hai tuần, nhu cầu ước tính khoảng 2.000 lượt, trong khi bậc miễn phí chỉ đáp ứng khoảng 280 lượt cho cả đợt — thiếu khoảng bảy lần.

**Hậu quả nếu không xử lý:** hệ thống ngừng phản hồi giữa đợt thực nghiệm, và chính hạn mức — chứ không phải thiết kế nghiên cứu — sẽ quyết định học sinh nào được sử dụng. Số liệu thu được sẽ không dùng được.

**Phương án:** bật thanh toán trước tuần 1. Cần dự trù kinh phí cho khoảng 2.000 lượt gọi, mỗi lượt mang theo tối đa khoảng 7.500 đơn vị từ ngữ cảnh. Đơn giá phải tra tại thời điểm thực hiện.

**Phương án dự phòng:** nếu không kịp bật thanh toán, thu hẹp thực nghiệm còn hai lớp và bố trí lịch sử dụng luân phiên, đồng thời báo cáo rõ giới hạn này.

## 7.2. Thời gian rất gấp

**Vấn đề:** kế hoạch trên kết thúc giữa tháng 10 và không có tuần dự phòng. Bất kỳ chậm trễ nào ở tuần 1 hoặc tuần 2 đều đẩy phần phân tích ra sau thời hạn.

**Phương án dự phòng:** nếu không kịp hoàn tất thực nghiệm, đề tài vẫn đứng vững trên các nội dung ND1–ND4 — phương pháp neo, chuẩn hoá dữ liệu và bộ kiểm chứng tự động đều đã có kết quả kiểm chứng được. Phần thực nghiệm khi đó được trình bày ở dạng **thiết kế nghiên cứu đã hoàn chỉnh và đang triển khai**, kèm số liệu thăm dò trên một lớp. Cách trình bày này trung thực và vẫn đủ nội dung khoa học, tốt hơn nhiều so với việc rút ngắn đợt can thiệp để lấy số liệu vội.

## 7.3. Mô hình bị nhà cung cấp cập nhật giữa chừng

**Vấn đề:** nhà cung cấp có thể cập nhật mô hình bất kỳ lúc nào, làm thay đổi hành vi hệ thống trong khi thực nghiệm đang diễn ra.

**Phương án:** ghi rõ tên và phiên bản mô hình cùng ngày chạy; chạy bộ kiểm chứng hành vi vào đầu và cuối đợt để phát hiện thay đổi; nếu phát hiện, ghi nhận vào phần hạn chế.

## 7.4. Học sinh sử dụng không đều

**Vấn đề:** một số học sinh gần như không dùng hệ thống, làm loãng hiệu ứng cần đo.

**Phương án:** ghi số lượt sử dụng của từng em; báo cáo song song hai phân tích — trên toàn bộ mẫu theo nhóm được phân (*intention-to-treat*) và trên nhóm có sử dụng thực chất — và nêu rõ sự khác biệt giữa hai cách.

---

# 8. HẠN CHẾ CỦA NGHIÊN CỨU

Được nêu ngay trong đề cương, không chờ đến khi báo cáo:

- **Không thể làm mù.** Học sinh biết mình đang được dạy theo cách nào. Không có cách khắc phục trong thiết kế này.
- **Công cụ đo là bài kiểm tra giấy.** Không đo được năng lực tự học lâu dài — vốn là điều hệ thống hướng tới. Đây là khoảng cách thật giữa thứ đo được và thứ muốn biết.
- **Phạm vi hẹp.** Một trường, một khối, một chương, một đợt ngắn. Chưa suy rộng được.
- **Hiệu ứng mới lạ.** Học sinh dùng công cụ mới thường tích cực hơn bình thường; hiệu ứng này tác động lên cả hai nhóm nhưng có thể không đều.
- **Phụ thuộc mô hình đóng.** Không tái lập được hoàn toàn kết quả nếu nhà cung cấp thay đổi mô hình.

---

# 9. TÀI LIỆU THAM KHẢO

*(Danh mục khởi đầu, cần bổ sung trong quá trình thực hiện ND1)*

1. Bộ Giáo dục và Đào tạo (2018). *Chương trình giáo dục phổ thông môn Hoá học*. Ban hành kèm Thông tư số 32/2018/TT-BGDĐT.
2. Bộ sách giáo khoa *Hoá học 11 — Kết nối tri thức với cuộc sống*. NXB Giáo dục Việt Nam.
3. Bloom, B. S. (1984). The 2 Sigma Problem: The Search for Methods of Group Instruction as Effective as One-to-One Tutoring. *Educational Researcher*, 13(6), 4–16.
4. VanLehn, K. (2011). The Relative Effectiveness of Human Tutoring, Intelligent Tutoring Systems, and Other Tutoring Systems. *Educational Psychologist*, 46(4), 197–221.
5. Cohen, J. (1988). *Statistical Power Analysis for the Behavioral Sciences* (2nd ed.). Lawrence Erlbaum Associates.

---

*Đề cương lập ngày 03 tháng 9 năm 2026.*
