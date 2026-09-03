# Quy trình nghiên cứu thực nghiệm có nhóm đối chứng

Tài liệu này mô tả cách chạy một nghiên cứu để trả lời câu hỏi trung tâm của đề tài. Viết **trước khi** thu số liệu, và không sửa sau khi đã bắt đầu — sửa giữa chừng rồi mới báo cáo là cách nhanh nhất để một kết quả đúng cũng mất giá trị.

---

## 1. Vì sao cần

Hệ thống hiện có một luận điểm sư phạm chưa được kiểm chứng:

> Gia sư gợi mở (dẫn dắt, không cho đáp án) giúp học sinh làm bài tốt hơn so với gia sư giảng thẳng có lời giải mẫu.

Đây là một mệnh đề **đo được**. Chưa đo thì mọi kết luận về hiệu quả của hệ thống chỉ là suy đoán, và đó là chỗ yếu nhất của đề tài khi ra bảo vệ.

## 2. Câu hỏi và giả thuyết

**Câu hỏi.** Với học sinh lớp 11 học chương Nitrogen – Sulfur, cách dạy gợi mở của gia sư AI có làm tăng điểm bài kiểm tra so với cách giảng thẳng hay không?

- **H₀ (giả thuyết không):** mức tiến bộ của hai nhóm như nhau.
- **H₁ (giả thuyết nghiên cứu):** nhóm gợi mở tiến bộ nhiều hơn.

Kiểm hai phía, mức ý nghĩa 0,05. Chốt trước: **biến phụ thuộc là mức tiến bộ** (điểm sau − điểm trước), không phải điểm sau.

> Phải chốt trước một biến duy nhất. Thu số liệu xong mới chọn xem đo cái nào cho ra kết quả đẹp là gian lận, dù không cố ý.

## 3. Thiết kế

Thực nghiệm ngẫu nhiên có đối chứng, đo trước – đo sau, hai nhóm song song.

| | Nhóm thực nghiệm | Nhóm đối chứng |
|---|---|---|
| Nhánh | `socratic` | `truc-tiep` |
| Cách dạy | Dẫn dắt theo quy trình, không cho đáp án | Giảng thẳng, có lời giải mẫu đầy đủ |
| Neo chương trình KNTT 2018 | có | **có** |
| Hằng số đkc 24,79 L/mol | có | **có** |
| Danh pháp IUPAC | có | **có** |
| Rào an toàn, nhãn tín hiệu | có | **có** |

**Hai nhánh chỉ khác nhau ở cách dạy.** Đây là điều kiện sống còn: nếu nhánh đối chứng cũng yếu hơn ở phần neo kiến thức thì chênh lệch điểm đo được không biết là do cách dạy hay do một bên nắm chương trình tốt hơn. `npm run kiem-tra:thuc-nghiem` canh đúng việc này — nó liệt kê từng mảnh bắt buộc phải có ở cả hai bên.

**Nhóm đối chứng không phải bù nhìn.** Nó được viết cho tử tế, ngang tầm thứ học sinh nhận được khi hỏi một trợ lý AI thông thường. Thắng một đối thủ cố tình làm dở thì không nói lên điều gì.

## 4. Cỡ mẫu

Chạy `npm run phan-tich` để xem bảng đầy đủ. Mức ý nghĩa 0,05 hai phía, lực kiểm định 80%:

| Muốn phát hiện chênh lệch | Cần mỗi nhóm | Tổng |
|---|---|---|
| Lớn (g = 0,8) | 25 | 50 |
| Vừa (g = 0,5) | 63 | 126 |
| Nhỏ (g = 0,2) | 392 | 784 |

**Một lớp 40 em là không đủ.** Với 20 em mỗi nhóm, chỉ phát hiện nổi chênh lệch từ g ≈ 0,89 trở lên — mức rất lớn, hiếm gặp trong nghiên cứu giáo dục. Nói thẳng ra: nếu chỉ có một lớp, khả năng cao kết quả sẽ là "chưa đủ bằng chứng", và điều đó **không** có nghĩa hai cách dạy như nhau.

**Khuyến nghị:** gom ít nhất **3 lớp (≈120 em)** để nhắm mức "vừa". Nếu không thể, vẫn làm — nhưng phải báo cáo trung thực rằng nghiên cứu thiếu lực, và trình bày như một **nghiên cứu thăm dò** để ước lượng mức chênh lệch cho lần sau, chứ không phải để kết luận.

## 5. Đề kiểm tra trước và sau

- Dùng **cùng một đề** cho cả trước và sau. Học sinh có thể nhớ đề, nhưng nhớ như nhau ở cả hai nhóm nên không làm lệch phép so sánh giữa hai nhóm.
- Đề gồm **15 câu** trải đều bốn mức: 4 nhận biết, 4 thông hiểu, 4 vận dụng, 3 vận dụng cao.
- **Các câu trong đề phải được rút khỏi phần luyện tập** suốt đợt nghiên cứu. Nếu gia sư hoặc bài kiểm tra chương lại đưa đúng câu ấy ra ôn thì điểm sau đo trí nhớ về câu hỏi, không đo năng lực.
- Đề do **giáo viên soạn và duyệt**, không dùng câu do AI sinh ra. Hội đồng sẽ hỏi ai chịu trách nhiệm về nội dung đề.
- Chấm **rọc phách**: người chấm không được biết em đó thuộc nhóm nào.

## 6. Các bước

**Trước khi bắt đầu**

1. Xin đồng ý của học sinh và phụ huynh (các em chưa thành niên). Nói rõ: có hai cách dạy, phân nhóm ngẫu nhiên, dừng lúc nào cũng được, và không ảnh hưởng điểm số trên lớp.
2. Chốt đề kiểm tra, rút các câu đó khỏi phần luyện tập.
3. Chốt ngày bắt đầu và ngày kết thúc. **Không kéo dài đợt vì thấy kết quả chưa đẹp.**
4. Ghi lại tên model và ngày (`gemini-3.6-flash`, tháng nào) — nhà cung cấp cập nhật model là kết quả đổi.
5. Bật công tắc: sửa `DANG_CHAY_NGHIEN_CUU = true` trong `src/features/research/thucNghiem.ts`, đặt `MA_DOT`, rồi triển khai.

**Trong đợt (2–3 tuần)**

6. Kiểm tra trước, cả hai nhóm cùng lúc.
7. Học sinh dùng hệ thống như bình thường. Không nhắc các em đang ở nhóm nào.
8. Ghi số lượt hỏi của từng em — cần để loại các em gần như không dùng.

**Sau đợt**

9. Kiểm tra sau, cùng đề, cùng điều kiện.
10. Nhập điểm vào `scripts/du-lieu/diem-thuc-nghiem.csv` theo mẫu ở `diem-thuc-nghiem-MAU.csv`, dùng **mã ẩn danh** chứ không dùng tên hay email.
11. Chạy `npm run phan-tich -- scripts/du-lieu/diem-thuc-nghiem.csv`.
12. **Tắt công tắc** khi kết thúc.

## 7. Đạo đức và dữ liệu

- Đối tượng là người chưa thành niên: bắt buộc có đồng ý của phụ huynh và của chính các em.
- Chỉ lưu **mã ẩn danh** (`maAnDanh()`), không lưu tên, email hay lớp trong tệp số liệu.
- Nhóm đối chứng **không bị thiệt**: các em vẫn được một gia sư đầy đủ, thậm chí trả lời nhanh hơn. Kết thúc đợt thì cả hai nhóm đều dùng bản chính thức.
- Em nào muốn rút thì rút, dữ liệu của em đó xoá khỏi mẫu.

## 8. Phân tích

`npm run phan-tich` chạy ba kiểm định, theo đúng thứ tự này:

1. **Hai nhóm có tương đương từ đầu không** — nếu điểm trước đã lệch có ý nghĩa thì kết quả sau không quy được về cách dạy; phải dùng ANCOVA lấy điểm trước làm hiệp biến.
2. **Mức tiến bộ có khác nhau không** — câu hỏi chính. Dùng kiểm định t Welch (không giả định phương sai bằng nhau), báo cáo cả `p` lẫn **Hedges' g**.
3. **Mỗi nhóm tự nó có tiến bộ không** — kiểm t cặp, để biết đợt học có diễn ra thật.

Toàn bộ hàm thống kê nằm ở `scripts/thong-ke.mts`, tự cài, không dùng thư viện ngoài, và **được đối chiếu với bảng tra t chuẩn** trong `kiem-tra-thuc-nghiem.mts` (lệch lớn nhất 4,3×10⁻⁵ — đúng mức làm tròn của bảng).

**Báo cáo cả `p` lẫn mức chênh lệch.** Chỉ nói "p < 0,05" thì không cho biết chênh lệch có đáng kể trên lớp hay không; chỉ nói mức chênh lệch thì không biết nó có phải do ngẫu nhiên.

## 9. Những hạn chế phải viết vào báo cáo

Viết ra trước, đừng đợi hội đồng chỉ:

- **Không làm mù được.** Học sinh biết mình đang được dạy kiểu nào. Không có cách nào tránh trong thiết kế này.
- **Đo bằng bài kiểm tra giấy.** Không đo được kỹ năng tự học lâu dài — mà đó mới là điều hệ thống hướng tới. Đây là hạn chế thật, không phải khiêm tốn xã giao.
- **Một trường, một chương, một đợt ngắn.** Chưa suy rộng ra được.
- **Hiệu ứng mới lạ.** Học sinh dùng công cụ mới thường chăm hơn, ảnh hưởng cả hai nhóm nhưng có thể không đều.
- **Model đóng.** Google có thể cập nhật `gemini-3.6-flash` bất cứ lúc nào; kết quả không tái lập được hoàn toàn. Ghi rõ ngày chạy.
- **Hạn mức API.** Bậc miễn phí 20 lượt/ngày cho mỗi model — phải giải quyết trước khi triển khai cho nhiều lớp, nếu không chính hạn mức sẽ quyết định em nào được học.

## 10. Nếu kết quả không như mong đợi

Một kết quả "không thấy khác biệt" **vẫn là kết quả**, và báo cáo trung thực nó thì đề tài mạnh lên chứ không yếu đi. Điều làm hỏng một công trình không phải là H₀ đúng, mà là:

- đổi biến đo sau khi đã nhìn số liệu,
- kéo dài đợt cho tới khi p < 0,05,
- lặng lẽ loại các em có điểm không thuận,
- báo cáo "có xu hướng tăng" khi p = 0,3.

Nếu ra kết quả rỗng, hãy trình bày mức chênh lệch quan sát được kèm khoảng tin cậy, nêu rõ lực kiểm định của mẫu, và đề xuất cỡ mẫu cần thiết cho lần sau. Hội đồng đánh giá cao chỗ đó hơn nhiều so với một con số p đẹp không ai kiểm chứng được.
