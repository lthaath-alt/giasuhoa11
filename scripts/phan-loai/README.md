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
2b. **Câu hỏi thật của lớp 11A3** (từ 03/10/2026, xem quy tắc 1 của `HUONG-DAN-GAN-NHAN.md`).
   Mỗi đợt (vd. mỗi tuần) chỉ có HAI lệnh; gán nhãn ở giữa vẫn do người:
   1. `npm run phan-loai:xuat` — đăng nhập tài khoản giáo viên (lấy ở .env.local nếu có, không thì hỏi), lấy câu mới
      của lớp 11A3 chưa có ở đợt nào, tạo `du-lieu/that/dot-<ngày>/` gồm `a.csv`, `b.csv` (cho
      hai người gán, không có cột nguồn), `chua-gan.csv` và `chua-gan.meta.txt` (nguồn, sự đồng
      ý, số câu — chép vào báo cáo). Muốn xem trước mà chưa ghi: `npm run xuat:cau-hoi -- --lop 11A3`.
   2. Gán nhãn: đọc lại `a.csv`, che tay tên, biệt danh, tên trường máy còn sót (sửa y hệt ở
      `b.csv`); hai bạn gán ĐỘC LẬP, mỗi bạn điền `nhan` và `nguoi_gan` trong một tệp. Gán trên
      Google Sheets thì để chia sẻ **Bị hạn chế** (chỉ thêm email từng bạn), không để "Bất kỳ ai có
      đường liên kết"; xong thì tải CSV về đúng chỗ cũ và xoá bảng tính.
   3. `npm run phan-loai:huan-luyen -- scripts/phan-loai/du-lieu/that/dot-<ngày>` — chạy nối tiếp:
      kiểm hai tệp gán đủ → đo đồng thuận (in kappa; lần đầu ghi `bat-dong.csv`) → còn câu bất đồng
      chưa có `nhan_chot` thì DỪNG, bàn xong điền rồi chạy lại đúng lệnh này → gộp nhãn, cộng dồn
      vào `that/nhan-that.csv` → học trên câu thật + bộ cũ (`--chi-cau-that` để bỏ bộ cũ) với tập
      kiểm CỐ ĐỊNH `that/tap-kiem-co-dinh.csv` (20 % câu học sinh thật). Tập kiểm chỉ chốt khi đủ BA
      điều: có ≥ 250 câu học sinh (đổi bằng `--nguong-tap-kiem`; với 100 câu thì tập kiểm chỉ 20 câu,
      mỗi câu đổi 5 điểm %), mỗi nhãn đã gặp có ≥ 2 câu, và MỌI câu học sinh tích luỹ đã qua hai
      người gán (câu nằm trong `nhan-dot.csv` của đợt nó; đợt nạp bằng bảng Excel một người thì chưa).
      Trước mốc đó máy vẫn học, chia 80/20 như cũ, in "CHƯA chốt tập kiểm (lý do)" kèm tên đợt còn
      một người gán và cách gỡ; số đo các đợt đó CHƯA đưa vào báo cáo. Bước học
      có kèm phép dò tên trong từ vựng → `kiem-tra:phan-loai` → so với regex → vẽ biểu đồ
      (`--bo-bieu-do` để bỏ) → bảng tóm tắt so với đợt trước, ghi `that/lich-su.csv`. Dừng ở bước
      nào thì in cách sửa; sửa xong chạy lại cùng lệnh, không cộng câu hai lần.
   - Số cho báo cáo, máy in sẵn: **kappa gộp** (dòng "Kappa gộp" trong TÓM TẮT) là Cohen's kappa
     tính trên MỘT dãy dồn mọi câu của các đợt hai người gán đủ `a.csv`/`b.csv`, lấy nhãn TRƯỚC khi
     thống nhất; đợt chưa gán đủ bị bỏ qua và được đếm trong dòng in. **Khoảng tin cậy 95 %** của
     độ chính xác và F1 macro in ngay dưới dòng "TẬP KIỂM": bootstrap 1.000 lần lấy mẫu lại tập
     kiểm (hạt 42), mô hình không học lại, nên khoảng này chỉ nói độ dao động do tập kiểm nhỏ.
   - Cột `chemai_vua_noi` (đợt xuất từ 04/10/2026): tin ChemAI ngay trước tin của em trong cùng
     cuộc chat, giữ 500 ký tự cuối, đứng trước cột `tin_nhan` trong `a.csv`, `b.csv`, `chua-gan.csv`.
     Chỉ để người gán đọc cho hiểu câu (cần cho nhãn `tra_loi_gia_su`); nhãn vẫn gán cho `tin_nhan`,
     mô hình không học cột này. Máy đã che như tin của em nhưng vẫn có thể sót tên: che tay cả cột
     này, sửa y hệt ở cả ba tệp.
   - Mô hình mới ghi vào `public/mo-hinh/`, web chỉ dùng sau khi chủ dự án build và deploy.
   - Câu thật không rời `du-lieu/that/` (bị `.gitignore` chặn). Các script tự nhận câu thật (tệp
     nằm trong đó, hoặc có dòng nguồn `that`) và dừng nếu `--ra`/`--kiem`/`--tap-kiem` trỏ ra ngoài.
     Ảnh biểu đồ nằm ở `that/bieu-do/`: xem trước khi chép vào báo cáo.
   - Phép dò tên: trước khi ghi mô hình web, từ vựng được so với `that/ten-hoc-sinh.txt` (chỉ tên,
     do bước 1 ghi). Một cụm hai chữ của tên (so không dấu, vd. "thanh an") nằm trong từ vựng là
     dừng và in cụm đó: che tay trong CSV rồi chạy lại; cụm đã xem tay là lời thường thì chạy riêng
     `huan-luyen.py ... --cho-phep-cum "<cụm>"`. Không dò chữ đơn, nên tên một chữ phải che tay.
   - `ket-qua/du-doan.json` (lên git, để `kiem-tra:phan-loai` so TypeScript với Python) dựng từ câu
     GIẢ `mau-nho.csv`. `ket-qua/so-sanh.md` chỉ có số.
   - KHÔNG tự gán nhãn bằng mô hình, không lấy `y_dinh` làm nhãn: số đo khi đó là mô hình tự chấm.
   - Giới hạn: phép dò tên chỉ biết tên có hồ sơ. Biệt danh, tên người ngoài trường lặp lại từ 2
     câu trở lên vẫn có thể vào từ vựng web; đọc kỹ CSV trước khi gán là chốt cuối.
   - Từng script chạy riêng được (`do-dong-thuan.py`, `gop-nhan.py`, `huan-luyen.py --tap-kiem`,
     `danh-gia:phan-loai -- --tap-kiem`, `ve-bieu-do.py --tap-kiem`); xem đầu mỗi tệp.
2c. **Mỗi đêm tự gửi bảng Excel, một người gán** (04/10/2026):
   - `npm run phan-loai:hang-ngay` (`hang_ngay.py`): chạy `phan-loai:xuat` (câu học sinh 11A3 +
     câu tài khoản giáo viên/quản trị, nguồn `that-gv`, chỉ câu chưa có ở đợt nào). Không có câu
     mới thì thôi, KHÔNG gửi mail. Có thì làm bảng `<Tài liệu>\gan-nhan-gia-su\cau-hoi-<đợt>.xlsx`
     và gửi mail qua Gmail (biến `GMAIL_GUI`, `GMAIL_MAT_KHAU_UNG_DUNG`, `GMAIL_NHAN` trong
     `.env.local`, xem `.env.example`). Thử không gửi: `-- --khong-gui`; thử không đọc Firestore:
     `-- --thu <thư mục đợt>`. Nhật ký: `<Tài liệu>\gan-nhan-gia-su\nhat-ky\`.
   - Bảng: sheet "Gán nhãn" (cột Nhãn bấm mũi tên chọn 1 trong 8 nhãn hoặc "(Bỏ câu này)"; nhãn thứ 7 "Xin đề" thêm 04/10/2026, nhãn thứ 8
     "Trả lời ChemAI" thêm 05/10/2026; bảng gửi trước ngày đó chưa có nhãn mới trong ô chọn), sheet
     "Giải thích nhãn", sheet "Thông tin" (tên đợt, người gán). Không thêm, xoá, sắp xếp lại dòng.
     Đợt có cột `chemai_vua_noi` thì bảng thêm cột "ChemAI vừa nói" trước cột Câu hỏi (cột Nhãn lùi
     sang D): chỉ để đọc, thấy tên người trong cột này cũng sửa thành [tên]. Bảng cũ 5 cột vẫn nạp được.
   - Nạp bảng đã gán: `npm run phan-loai:nap-xlsx -- "<tệp .xlsx>"` — chạy cùng chuỗi như bước 2b
     nhưng không có kappa (lịch sử ghi `mot-nguoi-gan`); muốn chốt tập kiểm thì bạn thứ hai phải gán lại CẢ đợt (xem dưới).
   - Hẹn giờ 0:00: `powershell -ExecutionPolicy Bypass -File scripts\phan-loai\dang-ky-hen-gio.ps1`
     (huỷ: thêm `-Huy`). Máy phải bật và đăng nhập Windows; lỡ giờ thì chạy bù khi bật lại.
   - Câu giáo viên/quản trị được học nhưng KHÔNG vào tập kiểm cố định và không tính vào ngưỡng
     250 câu: số đo báo cáo là trên câu học sinh.
   - Đợt nạp bằng bảng một người gán thì CHƯA chốt được tập kiểm cố định: hai bạn gán độc lập
     `a.csv`, `b.csv` của đợt đó rồi chạy `npm run phan-loai:huan-luyen -- <thư mục đợt>` (câu đã
     cộng dồn không cộng lần hai; đợt khi đó có kappa và được tính là hai người gán).
   - Trợ lý AI khác (AntiGravity…) huấn luyện thay: đọc `HUONG-DAN-CHO-AI.md`.
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
