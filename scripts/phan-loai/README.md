# Bộ phân loại ý định — chạy thế nào

1. Gán nhãn theo `HUONG-DAN-GAN-NHAN.md` (Google Sheets → tải CSV). Lấy thêm câu từ bộ
   tấn công: `python scripts/phan-loai/lay-cau-red-team.py`.
2. Đo đồng thuận: `python scripts/phan-loai/do-dong-thuan.py a.csv b.csv`; thống nhất, ghi `du-lieu/nhan.csv`.
3. Huấn luyện: `python scripts/phan-loai/huan-luyen.py` → ghi `public/mo-hinh/phan-loai-y-dinh.json`
   và `scripts/phan-loai/ket-qua/`.
4. So với luật regex: `npm run danh-gia:phan-loai`.

**Trên Google Colab** (máy công ty không cài được Python): tải cả thư mục `scripts/phan-loai`
lên, chạy `!pip install -r requirements.txt`, rồi
`!python huan-luyen.py --vao du-lieu/nhan.csv --ra phan-loai-y-dinh.json --kiem ket-qua`,
tải `phan-loai-y-dinh.json` về `public/mo-hinh/` và thư mục `ket-qua` về `scripts/phan-loai/`.
