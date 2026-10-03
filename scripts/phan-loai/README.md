# Bộ phân loại ý định — chạy thế nào

0. Cài thư viện: `python -m pip install -r scripts/phan-loai/requirements.txt`.
1. Gán nhãn theo `HUONG-DAN-GAN-NHAN.md` (Google Sheets → tải CSV). Lấy thêm câu từ bộ
   tấn công: `python scripts/phan-loai/lay-cau-red-team.py`.
   - Mở CSV bằng Excel thì khi lưu lại PHẢI chọn "CSV UTF-8 (Comma delimited)" — lưu
     bằng bảng mã khác, script đọc sẽ dừng ngay với thông báo rõ nguyên nhân.
2. Đo đồng thuận: `python scripts/phan-loai/do-dong-thuan.py a.csv b.csv` (in kappa, đồng thuận
   từng nhãn, ma trận nhầm lẫn giữa hai người; ghi `du-lieu/bat-dong.csv`). Nhóm điền cột
   `nhan_chot` cho từng câu bất đồng, rồi dựng `du-lieu/nhan.csv`:
   `python scripts/phan-loai/gop-nhan.py a.csv b.csv scripts/phan-loai/du-lieu/bat-dong.csv --ghi-de`.
   Chi tiết và cách đọc số ở mục "Đo đồng thuận và xử lý câu bất đồng" của `HUONG-DAN-GAN-NHAN.md`.
2b. **Câu hỏi thật của lớp 11A3** (từ 03/10/2026, xem quy tắc 1 của `HUONG-DAN-GAN-NHAN.md`):
   - Xuất: `npm run xuat:cau-hoi -- --lop 11A3` (chạy thử: in số câu và 3 câu đã che), rồi
     `npm run xuat:cau-hoi -- --lop 11A3 --that` → `du-lieu/that/chua-gan-<ngày>.csv` kèm
     `.meta.txt` (nguồn, sự đồng ý, số câu — chép vào báo cáo). Cần tài khoản giáo viên; tự
     nhập mật khẩu. Thêm `--tu`/`--den` để chỉ lấy câu mới; câu đã có trong các tệp `du-lieu/`
     và `du-lieu/that/` tự bị bỏ, nên chạy lại mỗi tuần không xuất trùng.
   - Script chỉ giữ NỘI DUNG câu, bỏ email, mã học sinh, bài, giờ gửi, xáo thứ tự, che email,
     số điện thoại, họ tên học sinh có trong hồ sơ. Tên một chữ, biệt danh, tên trường KHÔNG che
     được: người gán đọc lại và che tay trước khi gán.
   - Gán nhãn như bước 2 (hai người, `do-dong-thuan.py`, `gop-nhan.py`). Gán trên Google Sheets
     thì để chế độ chia sẻ **Bị hạn chế** (chỉ thêm email từng bạn trong nhóm), KHÔNG để "Bất kỳ ai
     có đường liên kết"; xong thì tải CSV về `du-lieu/that/` và xoá bảng tính.
   - Câu thật không rời `du-lieu/that/` (bị `.gitignore` chặn). Tệp nào nằm trong đó, hoặc có dòng
     nguồn `that`, là các script tự coi là câu thật: `do-dong-thuan.py` ghi `that/bat-dong.csv`,
     `gop-nhan.py` ghi `that/nhan-that.csv`, `huan-luyen.py` ghi tệp khớp và tập kiểm vào
     `that/ket-qua/`, `ve-bieu-do.py` ghi ảnh vào `that/bieu-do/` (xem ảnh trước khi chép vào báo
     cáo). Trỏ `--ra`/`--kiem`/`--tap-kiem` ra ngoài thư mục đó thì script dừng.
   - Mô hình web (`public/mo-hinh/`) vẫn ghi như cũ, nhưng TRƯỚC khi ghi, `huan-luyen.py` dò từ vựng
     với `that/ten-hoc-sinh.txt` (danh sách TÊN, không email, do `xuat:cau-hoi --that` ghi). Một cụm
     hai chữ của tên nằm trong từ vựng (so không dấu, vd. "thanh an") là dừng, in cụm đó: che tay
     trong CSV rồi chạy lại; cụm đã xem tay là lời thường thì thêm `--cho-phep-cum "<cụm>"`. Không
     dò chữ đơn ("an", "minh" là chữ thường), nên tên một chữ vẫn phải che tay từ đầu.
   - Khi học trên câu thật mà ghi vào mô hình web, `ket-qua/du-doan.json` (lên git, để
     `kiem-tra:phan-loai` so TypeScript với Python) được dựng từ câu GIẢ `mau-nho.csv`, không từ câu
     thật. So với regex: `npm run danh-gia:phan-loai -- --tap-kiem <đường dẫn huan-luyen.py in ra>`;
     quên `--tap-kiem` thì script dừng vì tập kiểm không khớp mô hình.
   - Huấn luyện với tập kiểm CỐ ĐỊNH: lần đầu
     `python scripts/phan-loai/huan-luyen.py --vao scripts/phan-loai/du-lieu/that/nhan-that.csv --tap-kiem scripts/phan-loai/du-lieu/that/tap-kiem-co-dinh.csv --tao-tap-kiem`
     (chọn 20 % câu nguồn `that` làm tập kiểm, ghi ra tệp); các đợt sau bỏ `--tao-tap-kiem`.
     Câu mới chỉ vào phần học, số đo các đợt so được với nhau. Xoá câu khỏi tập kiểm thì script
     dừng. `ve-bieu-do.py` nhận cùng `--tap-kiem`.
   - Giới hạn còn lại: phép dò tên chỉ biết tên có trong hồ sơ. Biệt danh, tên bạn ngoài trường lặp
     lại từ 2 câu trở lên vẫn có thể vào từ vựng web; đọc kỹ CSV trước khi gán là chốt cuối.
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
