# Bộ phân loại ý định — chạy thế nào

0. Cài thư viện: `python -m pip install -r scripts/phan-loai/requirements.txt`.
1. Gán nhãn theo `HUONG-DAN-GAN-NHAN.md` (Google Sheets → tải CSV). Lấy thêm câu từ bộ
   tấn công: `python scripts/phan-loai/lay-cau-red-team.py`.
   - Mở CSV bằng Excel thì khi lưu lại PHẢI chọn "CSV UTF-8 (Comma delimited)" — lưu
     bằng bảng mã khác, script đọc sẽ dừng ngay với thông báo rõ nguyên nhân.
2. Đo đồng thuận: `python scripts/phan-loai/do-dong-thuan.py a.csv b.csv`; thống nhất, ghi `du-lieu/nhan.csv`.
3. Huấn luyện: `python scripts/phan-loai/huan-luyen.py` → ghi `public/mo-hinh/phan-loai-y-dinh.json`
   và `scripts/phan-loai/ket-qua/`.
   - **Chốt tập kiểm sau lần huấn luyện THẬT đầu tiên**: `train_test_split` chia theo
     toàn bộ `nhan.csv` hiện có, nên thêm câu mới vào CSV sau khi đã thấy số đo sẽ làm
     tập kiểm (tập 20 %) đổi — số đo cũ và mới không còn so sánh được với nhau. Nếu dữ
     liệu phải sửa sau khi đã xem số đo, phải NÊU RÕ điều này trong báo cáo.
   - Web chỉ dùng mô hình mới sau khi chủ dự án build và deploy lại.
4. Kiểm TypeScript tính đúng như Python trước khi tin số đo:
   `npm run kiem-tra:phan-loai` — dòng "mô hình thật" PHẢI ĐẠT (không phải "BỎ QUA").
5. So với luật regex: `npm run danh-gia:phan-loai`.
6. Vẽ biểu đồ: `python scripts/phan-loai/ve-bieu-do.py` ghi 6 ảnh PNG và `so-lieu.json` vào
   `scripts/phan-loai/ket-qua/bieu-do/`, mất khoảng nửa phút. Script học lại y như bước 3 nhưng
   không ghi đè mô hình trên web. Chạy sau bước 3 và 5, vì ảnh so với regex chỉ có khi
   `so-sanh.md` chấm đúng mô hình đang chạy. Cách đọc từng ảnh ở mục "Đọc biểu đồ" bên dưới.

**Trên Google Colab** (máy công ty không cài được Python): nén cả thư mục `scripts/phan-loai`
thành một tệp zip rồi tải lên Colab (`!unzip phan-loai.zip`, sau đó `%cd phan-loai`), chạy
`!pip install -r requirements.txt`, rồi
`!python huan-luyen.py --vao du-lieu/nhan.csv --ra phan-loai-y-dinh.json --kiem ket-qua`,
tải `phan-loai-y-dinh.json` về `public/mo-hinh/` và thư mục `ket-qua` về `scripts/phan-loai/`.
Vẽ biểu đồ trên Colab: `!python ve-bieu-do.py --mo-hinh phan-loai-y-dinh.json`, rồi tải thư mục
`ket-qua/bieu-do` về.

## Đọc biểu đồ

Mọi con số trên ảnh nằm trong `so-lieu.json`. Dòng chữ xám ở chân ảnh ghi tệp dữ liệu, số câu,
phiên bản mô hình và ngày vẽ. Cắt ảnh đưa vào báo cáo thì chép dòng này làm chú thích.

- `1-duong-cong-huan-luyen.png`: mất mát (log-loss) và độ chính xác qua từng vòng lặp lúc máy
  học. Vòng 0 là lúc chưa học: mọi trọng số bằng 0, mỗi nhãn được đoán với xác suất 1/6, mất
  mát bằng ln 6 ≈ 1,79. Vài vòng đầu thuật toán còn dò hướng nên điểm có thể nhảy lên xuống.
  Đường xanh chấm trên câu đã học nên giảm dần. Đường đỏ chấm trên tập kiểm (câu máy chưa
  thấy), thường giảm rồi đi ngang. Khoảng cách giữa hai đường là phần mô hình thuộc riêng câu
  đã học mà không dùng được cho câu mới.
- `2-duong-cong-hoc.png`: điểm F1 khi cho máy học 20 %, 35 %, ..., 100 % số câu. Đường đỏ còn
  đi lên ở cuối nghĩa là gán thêm câu có thể còn giúp; đường đã nằm ngang thì thêm câu ít tác
  dụng. Dải mờ là độ lệch giữa các lần kiểm chéo. Ngôi sao là điểm trên tập kiểm riêng, chấm
  một lần với mô hình học trên toàn bộ phần học.
- `3-chon-C.png`: C là mức phạt trọng số lớn, C càng nhỏ phạt càng mạnh. C nhỏ quá thì mô hình
  quá đơn giản, cả hai đường đều thấp. C lớn thì đường xanh lên sát 100 % còn đường đỏ không
  lên theo: mô hình thuộc lòng câu đã học. Vòng tròn đen là các mức `huan-luyen.py` thật sự
  thử, vạch đứt là mức được chọn.
- `4-ma-tran-nham-lan.png`: hàng là nhãn thật, cột là nhãn mô hình đoán, mỗi ô là số câu. Các
  ô trên đường chéo là câu đoán đúng; ô ngoài đường chéo cho biết nhãn nào hay bị nhầm sang
  nhãn nào.
- `5-cum-tu-dac-trung.png`: 8 cụm từ có hệ số lớn nhất của mỗi nhãn, tức các cụm từ kéo câu
  về nhãn đó mạnh nhất. Chữ đã bỏ dấu vì mô hình đọc chữ không dấu. Nếu đứng đầu là cụm từ
  không liên quan tới nhãn, dữ liệu đang có kiểu viết lặp lại mà mô hình học theo, cần thêm
  câu viết khác đi.
- `6-so-voi-regex.png`: F1 của luật regex đang chạy trên web và của mô hình, cho 2 nhãn mà
  regex nhận ra. Regex trên web chỉ viết bằng chữ có dấu, nên tập kiểm càng nhiều câu không
  dấu thì regex càng thua (xem `du-lieu/GHI-CHU-DU-LIEU-AI.md`).

Cột `nguoi_gan` có tên một AI (claude, gemini, gpt...) thì mọi ảnh mang chữ chìm "BẢN THỬ /
NHÃN DO AI GÁN". Bộ dữ liệu hiện tại do AI gán nhãn hết nên ảnh nào cũng có chữ này: dùng để
tập đọc biểu đồ, chưa đưa vào báo cáo được. Nhóm gán nhãn lại rồi chạy bước 3, 5, 6 thì chữ
chìm tự mất.

## `y_dinh` không phải điểm đánh giá học sinh

`y_dinh` ghi vào `chats`/CSV là NHÃN MÔ HÌNH ĐOÁN, chưa qua ai kiểm lại — giáo viên có
thể thấy trường này trong lịch sử chat, nhưng tuyệt đối không dùng nó để đánh giá, chấm
điểm hay nhận xét học sinh. Đây là phép đo chạy bóng cho đề tài NCKH, không phải nhãn đã
xác nhận đúng.
