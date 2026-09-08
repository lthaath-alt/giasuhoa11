# Hiến chương dự án Gia sư Hóa 11

Nền tảng tự học Hóa học 11 (Kết nối tri thức 2018): bài giảng, gia sư AI, ngân hàng
câu hỏi và hai trò chơi ôn tập. Người dùng là học sinh lớp 11 và giáo viên phổ thông.

Claude soạn bản đầu ngày 06/09/2026 từ những gì dự án đã dạy trong quá trình làm.
Ngày 08/09/2026 đối chiếu lại với mã nguồn, sửa hai chỗ ghi sai sự thật (xem hai khung
trích dẫn ở nguyên tắc II và V), rồi **thầy Paul thông qua**.

Mỗi điều dưới đây đều rút từ một lỗi CÓ THẬT trong dự án, không phải nguyên tắc chung
chung mượn ở đâu về.

## Nguyên tắc cốt lõi

### I. Đúng chương trình Kết nối tri thức 2018 (KHÔNG THƯƠNG LƯỢNG)

Mọi nội dung hoá học phải khớp sách giáo khoa hiện hành, không phải sách cũ:

- Điều kiện chuẩn là **25 °C, 1 bar, 24,79 L/mol**. Không dùng "đktc" và 22,4 L/mol.
- Tên chất viết theo IUPAC tiếng Anh (*sulfuric acid*, *alcohol*), không phiên âm cũ.
- Số thập phân dùng **dấu phẩy** (24,79), theo chuẩn tiếng Việt.
- Công thức hoá học phải có chỉ số dưới thật: **N₂**, không phải `N2`.
- Nội dung bám đúng 25 bài trong `src/features/lessons/constants.ts`.

Sai một trong những điều này là dạy sai học sinh — nặng hơn mọi lỗi kỹ thuật trong tài
liệu này.

### II. Tiếng Việt là ngôn ngữ của cả sản phẩm lẫn mã nguồn

Giao diện, thông báo lỗi, **chú thích trong mã** và thông điệp commit: tiếng Việt. Lý
do: người bảo trì dự án này là giáo viên Việt Nam, không phải kỹ sư nói tiếng Anh.

Còn **cách đặt tên hàm và biến thì tuỳ vùng**, và đây là mô tả hiện trạng chứ không
phải mệnh lệnh:

- `src/` — chủ yếu tiếng Anh (`getUserProgress`, `handleSubmit`, `useCheDoMau`). Đếm
  ngày 08/09/2026: **154 tên kiểu tiếng Anh so với 35 tên kiểu tiếng Việt**.
- Trò chơi (`public/games/*.html`) và `scripts/` — chủ yếu tiếng Việt không dấu
  (`cauChoBai`, `veBan`, `xepLoai`, `datRanThang`).

Viết thêm vào vùng nào thì theo lối của vùng đó. Đừng đổi tên hàng loạt cho "thống
nhất" — công sức lớn, rủi ro cao, lợi ích không rõ.

> Bản nháp đầu tiên của mục này ghi "đặt tên tiếng Việt **theo lối đã có trong dự án**".
> Sai: tôi lấy ấn tượng từ mấy tệp vừa sửa rồi khái quát cho cả repo, trong khi `src/`
> dùng tiếng Anh áp đảo 4 ăn 1. Đúng nguyên tắc III — đáng ra phải đếm trước khi viết.

### III. Đo trước khi sửa (KHÔNG THƯƠNG LƯỢNG)

Thấy dấu hiệu bất thường thì **xác định bên nào sai trước đã** — mã hay phép kiểm — rồi
mới đụng vào. Nhiều lần trong dự án này phép kiểm mới là bên sai, còn mã vẫn đúng.

Không đoán. Chạy thật, đọc DOM, đo tương phản, in ra con số. Đo được quân cờ lệch 3px
thì không được báo cáo thành "quân cờ đặt sai chỗ".

Cũng phải cảnh giác với chính dụng cụ đo: khung xem trước bị ẩn trả về `innerWidth 0`,
bộ đếm giờ bị hãm xuống ≥ 1 giây, kiểu tính toán đọc ra có thể còn cũ. Đo được điều lạ
thì nghi ngờ dụng cụ trước khi kết luận về sản phẩm.

### IV. Phép kiểm phải tự bảo trì, và phải chứng minh được là nó có chạy

- Mỗi lỗi đã sửa để lại một phép kiểm chặn nó tái diễn.
- Phép kiểm **trích thẳng mã thật** ra chạy, không chép lại. Chép lại thì bài kiểm cứ
  đạt trong khi sản phẩm đã sai.
- Viết xong một phép kiểm phải **cố ý làm hỏng** để xem nó có báo không. Bộ kiểm màu
  từng có một phép so sánh không bao giờ chạy mà vẫn báo OK suốt nhiều tháng.
- `npm run kiem-tra` và `npx tsc --noEmit` phải xanh trước khi commit.

### V. Một biến một vai, và chữ luôn phải đọc được

Một biến màu chỉ gánh một vai: `--cam` làm **chữ** thì nền dùng `--cam-nen`. Không bao
giờ mượn biến màu chữ làm nền — ở chế độ sáng trông vẫn ổn, sang chế độ tối nó lật
thành chữ trắng trên nền trắng.

Tương phản chữ trên nền tối thiểu **4,5** (mức WCAG AA cho chữ thường).
`npm run kiem-tra:mau` đo thật 70 cặp chữ/nền ở **mỗi** chế độ màu và báo đỏ kèm số đo
khi có cặp nào tụt xuống dưới. Cặp nào cố ý chấp nhận thấp hơn thì phải ghi vào danh
sách `MIEN` trong bộ kiểm **kèm lý do** — để món nợ đếm được chứ không nằm khuất; danh
sách đó hiện đang rỗng.

Mọi thay đổi giao diện vẫn phải thử ở **cả hai chế độ màu**: mọi lỗi loại này trong dự
án đều chỉ lộ ra ở một trong hai.

> Mục này từng ghi con số 4,5 như thể đang có hiệu lực, trong khi **không phép kiểm nào
> đo nó**. Đo tay ngày 08/09/2026 ra 14 cặp không đạt, tệ nhất là `--luc` làm màu chữ
> chỉ được 2,32 mà đang dùng ở 11 chỗ, và `--vang` được 1,96. Đã làm đậm 12 biến ở
> chế độ sáng và sáng/đậm lại 2 biến ở chế độ tối cho đạt chuẩn, rồi mới viết phép đo.
> Đúng cái bẫy nguyên tắc IV cảnh báo: một luật không ai canh thì chỉ là lời chúc.

## Ràng buộc kỹ thuật

- **Ngân hàng câu hỏi**: bản thật ở Firestore `bank_questions`; `public/bank/ngan-hang.json`
  chỉ là bản chụp. GitHub Actions tự đồng bộ mỗi đêm; `npm run kiem-tra:dong-bo` so vân
  tay hai bên.
- **Trò chơi là tệp HTML tĩnh**, dữ liệu riêng của nó **nhúng thẳng** trong tệp chứ
  không tải qua mạng: máy chủ SPA trả `index.html` cho tệp không tìm thấy, và trò chơi
  báo `Unexpected token '<'` mà không ai hiểu vì sao. Đổi lại, phải có phép kiểm canh
  bản nhúng đừng lạc hậu so với tệp `.json`.
- **Không dùng localStorage cho dữ liệu lớn.** Đã mất dữ liệu vì đầy ở mức 5 MB khi có
  ảnh. Dùng IndexedDB (`hoa11` / `kv`).
- **Web ↔ trò chơi nói chuyện bằng `postMessage` cùng origin**, luôn kiểm `e.origin`.
  Không đổi `src` của iframe để truyền trạng thái — nạp lại là mất ván đang chơi.
- **Quyền phải do web cấp, không do địa chỉ trang.** Chế độ thử của trò chơi chỉ bật khi
  web trả lời dựa trên vai trò của tài khoản đang đăng nhập; sửa URL không ăn thua.
- **Bí mật ở `.env.local`** (`GEMINI_API_KEY`), nằm ngoài git. Cấu hình Firebase là khoá
  công khai nên cố ý để trong git — xem `src/core/services/firebaseCongKhai.ts`.
- **`src/features/lessons/constants.ts` do máy sinh ra.** Sửa `.docx` gốc rồi chạy
  `npm run soan`; sửa tay sẽ bị ghi đè.
- Gemini bậc miễn phí: **5 lượt/phút và 20 lượt/ngày** cho mỗi model.

## Quy trình làm việc

- Yêu cầu mơ hồ thì **hỏi lại trước**, đừng đoán rồi làm sai. Việc lớn: nói ngắn gọn
  định làm gì rồi mới code.
- Trước khi commit: xem `git status` và `git diff`. **Không `git add -A` một cách mù
  quáng** — đã có lần tệp thử lọt vào commit vì thế.
- **Không push khi chưa được đồng ý.** Commit tại chỗ thì lùi được, đẩy lên rồi thì khó.
- **Không tự chạy `npm run build`, không tự deploy, không dùng lệnh git phá huỷ**
  (`reset --hard`, xoá nhánh, ghi đè). Đây là luật sẵn có trong `CLAUDE.md`; chép vào
  đây vì bản nháp đầu tiên bỏ sót nó, và chính tôi đã chạy `npm run build` nhiều lần
  trong lúc soạn tài liệu này.
- Báo cáo trung thực: phép kiểm hỏng thì nói là hỏng kèm nguyên văn; bỏ qua bước nào thì
  nói rõ đã bỏ qua.
- Việc tự mình không kiểm chứng được (phải đăng nhập, phải nhìn trên máy thật) thì nói
  thẳng là chưa kiểm, đừng báo là xong.

## Điều hành

Hiến chương này thắng mọi thói quen khác trong dự án. `CLAUDE.md` ở gốc repo là hướng
dẫn vận hành hằng ngày và phải không mâu thuẫn với tài liệu này; lệch nhau thì sửa
`CLAUDE.md`.

Sửa hiến chương phải ghi lý do trong thông điệp commit và tăng số phiên bản: chữ số đầu
khi bỏ hay thay hẳn một nguyên tắc, chữ số giữa khi thêm nguyên tắc hoặc mục mới, chữ số
cuối khi chỉ làm rõ câu chữ.

**Phiên bản**: 1.0.0 | **Thông qua**: 2026-09-08 (thầy Paul) | **Sửa lần cuối**: 2026-09-08
