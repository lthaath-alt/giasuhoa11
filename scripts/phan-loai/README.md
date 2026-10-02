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
4. Kiểm TypeScript tính đúng như Python trước khi tin số đo:
   `npm run kiem-tra:phan-loai` — dòng "mô hình thật" PHẢI ĐẠT (không phải "BỎ QUA").
5. So với luật regex: `npm run danh-gia:phan-loai`.

**Trên Google Colab** (máy công ty không cài được Python): nén cả thư mục `scripts/phan-loai`
thành một tệp zip rồi tải lên Colab (`!unzip phan-loai.zip`, sau đó `%cd phan-loai`), chạy
`!pip install -r requirements.txt`, rồi
`!python huan-luyen.py --vao du-lieu/nhan.csv --ra phan-loai-y-dinh.json --kiem ket-qua`,
tải `phan-loai-y-dinh.json` về `public/mo-hinh/` và thư mục `ket-qua` về `scripts/phan-loai/`.

## `y_dinh` không phải điểm đánh giá học sinh

`y_dinh` ghi vào `chats`/CSV là NHÃN MÔ HÌNH ĐOÁN, chưa qua ai kiểm lại — giáo viên có
thể thấy trường này trong lịch sử chat, nhưng tuyệt đối không dùng nó để đánh giá, chấm
điểm hay nhận xét học sinh. Đây là phép đo chạy bóng cho đề tài NCKH, không phải nhãn đã
xác nhận đúng.
