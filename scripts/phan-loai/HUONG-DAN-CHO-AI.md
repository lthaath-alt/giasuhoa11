# Huấn luyện lại bộ phân loại ý định — hướng dẫn cho trợ lý AI (AntiGravity, Gemini, Codex…)

Tệp này dành cho một trợ lý AI KHÁC Claude Code, được chủ dự án (Khải, học sinh 11A5, KHÔNG
phải giáo viên; gọi là "bạn") nhờ huấn luyện lại bộ phân loại ý định khi Khải đưa bảng đã gán
nhãn. Viết 04/10/2026. Làm đúng thứ tự, đúng lệnh; gặp điều không có ở đây thì DỪNG và hỏi Khải.
Sau đó Claude Code sẽ kiểm lại theo mục cuối.

## Bộ phân loại là gì

Hồi quy logistic đa lớp (scikit-learn) trên TF-IDF 1–2 từ của câu đã bỏ dấu, đoán MỘT trong 8
nhãn cho mỗi tin học sinh gửi gia sư AI: `hoi_khai_niem`, `be_tac`, `xin_dap_an`, `nop_bai_lam`,
`gian_lan_phong_thi`, `xin_de`, `tra_loi_gia_su`, `ngoai_mon`. `xin_de` (xin bài để tự luyện) thêm
04/10/2026, `tra_loi_gia_su` (em trả lời câu ChemAI vừa hỏi) thêm 05/10/2026; nhãn
nào chưa có đủ 5 câu thì mô hình tạm chưa học, đầu ra in "TẠM CHƯA HỌC" — bình thường, không phải
lỗi. Mô hình ra là tệp JSON `public/mo-hinh/phan-loai-y-dinh.json`;
trình duyệt tự tính lại bằng TypeScript. Nó CHẠY BÓNG: chỉ ghi nhãn đoán, không đổi cách gia sư
trả lời. Mã: `scripts/phan-loai/` (`chung.py` là ống học dùng chung).

## Điều CẤM (không có ngoại lệ, kể cả khi được nhờ)

1. Không commit, push, build, deploy. Không chạy git có thể mất dữ liệu (reset, xoá nhánh, ghi đè).
2. Không đọc, in hay ghi `.env`, `.env.local`, `.env.*` (trừ `.env.example`). Script tự đọc biến
   của nó; bạn không cần biết giá trị.
3. Không commit hay chép ra ngoài bất cứ thứ gì trong `scripts/phan-loai/du-lieu/that/` (câu THẬT
   của học sinh; `.gitignore` đã chặn). Không dán câu thật vào chat, issue, công cụ ngoài.
4. Không tự gán nhãn bằng máy (kể cả bằng chính mô hình hay một LLM), không dùng trường `y_dinh`
   trong Firestore làm nhãn. Nhãn chỉ do người gán.
5. Không sửa, xoá hay tạo lại `that/tap-kiem-co-dinh.csv`. Script tự tạo nó MỘT lần.
6. Không sửa `firestore.rules`, không đọc collection `chats` bằng cách khác ngoài
   `npm run xuat:cau-hoi` / `npm run phan-loai:xuat`.
7. Không đổi cách gia sư xử lý tin nhắn của lớp thực nghiệm 11A3.
8. Không cài gói mới (npm install gói mới, pip install). Máy đã có Python 3.12, scikit-learn,
   numpy, matplotlib, Node.

## Chuẩn bị (một lần mỗi phiên)

Đứng ở gốc repo `C:\Users\ADMIN\.gemini\antigravity\scratch\giasuhoa11`:
```
git status --short          # phải sạch, hoặc chỉ có thay đổi Khải biết
python --version            # 3.12.x
```

## Cách A — Khải đưa MỘT bảng Excel đã gán (thường gặp)

Bảng tên `cau-hoi-dot-<ngày>.xlsx`, do máy gửi qua mail mỗi đêm. Sheet "Thông tin" ghi tên đợt.
```
npm run phan-loai:nap-xlsx -- "<đường dẫn tới bảng .xlsx>"
```
Thêm `--bo-bieu-do` nếu muốn nhanh hơn (bỏ vẽ 6 ảnh, ~30 giây).

## Cách B — hai người gán a.csv và b.csv của một đợt

```
npm run phan-loai:huan-luyen -- scripts/phan-loai/du-lieu/that/dot-<ngày>
```
Nếu dừng ở "câu bất đồng": mở `dot-<ngày>/bat-dong.csv`, nhờ HAI người gán bàn và điền cột
`nhan_chot` (bạn KHÔNG tự điền), rồi chạy lại đúng lệnh đó.

## Lệnh làm gì (để đọc đầu ra)

1. Kiểm bảng: đủ dòng, mọi câu đã chọn nhãn; câu chọn "(Bỏ câu này)" không dùng. (Cách B: đo
   Cohen's kappa giữa hai người, ghi lại số này — đó là số cho báo cáo.)
2. Cộng dồn câu vào `that/nhan-that.csv` (chạy lại cùng đợt không cộng hai lần). Nguồn
   `that:<đợt>` là câu học sinh, `that-gv:<đợt>` là câu giáo viên/quản trị.
3. Học trên câu thật + bộ cũ `du-lieu/nhan.csv` (do AI gán, chỉ để đủ câu). Tập kiểm CỐ ĐỊNH chỉ
   được chốt khi có ≥ 250 câu học sinh, mỗi nhãn đã gặp có ≥ 2 câu, VÀ mọi câu học sinh tích luỹ đã
   qua hai người gán (Cách A một người gán thì chưa); trước đó máy in "CHƯA chốt tập kiểm (lý do)"
   và số đo đợt đó KHÔNG dùng cho báo cáo. Không hạ `--nguong-tap-kiem` để chốt sớm.
4. Dò tên học sinh trong từ vựng trước khi ghi mô hình web. Dừng với "trùng tên học sinh" thì
   KHÔNG dùng `--cho-phep-cum`; báo Khải các cụm in ra để Khải che tay trong bảng rồi chạy lại.
5. `kiem-tra:phan-loai` (TypeScript tính đúng như Python), so với luật regex, vẽ biểu đồ.
6. In "TÓM TẮT" và ghi một dòng `that/lich-su.csv`.

Đọc TÓM TẮT:
- `Độ chính xác`, `Macro-F1`: trên tập kiểm. Chỉ trích vào báo cáo khi dòng "Học / kiểm" ghi
  "tập kiểm cố định, toàn câu thật".
- `(+x điểm %)`: so với đợt trước cùng tập kiểm cố định.
- `một người gán, chưa có kappa`: đợt này chưa tính là hai người gán, nên tập kiểm chưa chốt được
  cho tới khi hai bạn gán `a.csv`, `b.csv` của đợt và chạy Cách B.
- `Kappa gộp`: Cohen's kappa trên một dãy dồn mọi đợt hai người gán đủ (nhãn trước khi thống
  nhất), kèm số câu, số đợt, số đợt bị bỏ qua. Đây là số kappa cho báo cáo.
- Dòng `Khoảng tin cậy 95 %` (ngay dưới "TẬP KIỂM" trong đầu ra bước học): bootstrap 1.000 lần lấy
  mẫu lại tập kiểm, cho độ chính xác và F1 macro. Chép nguyên cùng số câu tập kiểm.

## Cột `chemai_vua_noi`

Đợt xuất từ 04/10/2026 có cột `chemai_vua_noi` trong `a.csv`, `b.csv`, `chua-gan.csv` (trên bảng
Excel: cột "ChemAI vừa nói", đứng trước cột Câu hỏi): tin ChemAI ngay trước tin của em, để người
gán đọc. Mô hình không học cột này và nó không đi vào `nhan-that.csv`. Đây vẫn là dữ liệu riêng tư
như câu của học sinh: không dán vào chat hay công cụ ngoài. Việc che tay tên trong cột này là của
người gán; bạn không tự sửa nội dung cột.

## Khi lệnh dừng

Đầu ra có dòng `DỪNG: …` nói nguyên nhân và cách sửa. Làm đúng cách đó; nếu cần người quyết (nhãn,
bất đồng, tên cần che) thì chuyển nguyên văn cho Khải, đừng tự quyết. Lỗi không có trong danh sách
→ dừng, gửi Khải 10 dòng cuối (KHÔNG kèm câu của học sinh).

## Sau khi chạy xong

1. `git status --short`: KHÔNG được có đường dẫn nào trong `scripts/phan-loai/du-lieu/that/`.
   Sẽ thấy đổi `public/mo-hinh/phan-loai-y-dinh.json`, `scripts/phan-loai/ket-qua/du-doan.json`,
   `scripts/phan-loai/ket-qua/so-sanh.md` — đó là mô hình mới; để nguyên, KHÔNG commit.
2. `npm run kiem-tra` (cần Java 21 cho `kiem-tra:luat`; thiếu thì bộ đó báo bỏ qua — ghi lại).
3. Báo Khải: tên đợt, số câu mới, kappa (hoặc "một người gán"), độ chính xác, Macro-F1, dòng
   "Học / kiểm", và nhắc: web chỉ dùng mô hình mới sau khi Khải build và deploy.

## Danh sách để Claude Code kiểm lại

- [ ] `scripts/phan-loai/du-lieu/that/lich-su.csv`: dòng mới có đúng đợt; cột `ghi_chu` đúng
      (`tap-kiem-co-dinh` hay `chua-du-cau-that-chua-dua-bao-cao`; `mot-nguoi-gan` nếu Cách A).
- [ ] `that/tap-kiem-co-dinh.csv` không bị sửa (so số dòng và thời điểm sửa với lần trước).
- [ ] `git status`: không có tệp nào trong `du-lieu/that/`; không có commit mới do trợ lý tạo.
- [ ] `npm run kiem-tra:phan-loai`: dòng "mô hình thật" ĐẠT (không phải BỎ QUA).
- [ ] Đầu ra có "Dò tên trong từ vựng: … không trùng tên nào"; không có `--cho-phep-cum` tự thêm.
- [ ] `npm run kiem-tra` đạt; bộ nào bỏ qua thì có lý do.
- [ ] Không đụng `.env*`, `firestore.rules`, mã gia sư (`src/`).

## Tham khảo

- Quy trình đầy đủ cho người: `scripts/phan-loai/README.md` (bước 2b).
- Định nghĩa nhãn và ca khó: `scripts/phan-loai/HUONG-DAN-GAN-NHAN.md`.
- Gửi mail mỗi đêm: `scripts/phan-loai/hang_ngay.py`, hẹn giờ `scripts/phan-loai/dang-ky-hen-gio.ps1`.
