# Bề mặt: toàn ứng dụng Gia sư Hóa 11

Chế độ: **Operate**. Người dùng tới để làm việc — đọc bài, hỏi, làm đề, chơi ôn tập.
Bề mặt này bao trùm cả bảy trang và mười hai mô-đun; nó định nghĩa thế giới thị giác
mà mọi màn kế thừa.

## Direction contract

**THESIS**
Ngôn ngữ thị giác của chính ngành hoá học: hệ nhãn cảnh báo GHS trên mọi lọ hoá chất
trong phòng thí nghiệm. Viền thoi kẻ đậm, chữ đen trên nền nhãn trắng, thứ bậc nghiêm
ngặt, đọc được từ cuối lớp. Nó **từ chối** kiểu app học tập bo tròn pastel với vòng
tiến độ và linh vật cười — thứ mà mọi nền tảng học online đều xuất ra, và thứ mà một
mô hình gặp chủ đề "học sinh" sẽ mặc định cho ra.

**OWN-WORLD**
Nền nhãn trắng và giấy ngà; mực đen đặc; **đỏ tín hiệu chỉ dành cho hành động chính và
lỗi thật** — không bao giờ để trang trí; vàng cảnh báo cho trạng thái đang dở. Viền là
đường kẻ thẳng mảnh, không bo góc lớn, không bóng đổ mềm. Khối nội dung là **trường có
kẻ ô** như bảng khai nhãn, không phải thẻ bo tròn. Chữ hiển thị dùng grotesque công
nghiệp (Archivo), hoa toàn phần cho nhãn và mã; số dùng dạng bảng. Bộ ký hiệu là hình
thoi vẽ nét đều. Xoá hết: thẻ cùng cỡ xếp lưới, viền trái màu dày, bóng đổ khối cứng,
chữ gradient.

**STORY**
Học sinh mở app và hiểu ngay đang có bốn việc làm được, mỗi việc một khối nhãn rõ ràng.
Em tin rằng đây là công cụ nghiêm túc của môn hoá chứ không phải trò chơi điểm thưởng,
và tin rằng nội dung khớp đúng sách trên bàn. Em bấm vào việc cần làm ngay trong màn
đầu, không phải cuộn tìm.

**FIRST VIEWPORT**
Thanh nhận diện mực đen chạy hết bề ngang, cao vừa phải, mang logo sách mở, "Gia sư
Hóa 11", dòng phụ hoa nhỏ, và Zalo neo phải. Ngay dưới: bốn trường nhãn chia hai cột
trên máy tính, một cột trên điện thoại — Bài giảng · Gia sư AI · Đề kiểm tra · Trò chơi
— mỗi trường có ký hiệu thoi riêng, tên hoa đậm, một dòng trạng thái thật (đã học bao
nhiêu bài, còn bao nhiêu lượt hỏi). Hành động chính nằm trong trường đầu tiên, nền đỏ
tín hiệu, chữ trắng. Thầy Hùng đứng ở mép phải trường Gia sư AI, không phải giữa màn.

**FORM**
Nhãn cảnh báo hoá chất GHS. Ứng viên số 4 trong bảy hướng đã dựng, do xúc xắc chỉ định.
Khoá seed `3f07f4d6`. Đường dựng: code-led.

Nâng từ các hướng bị loại, mỗi dòng ghi tên người cho:
- *Oscilloscope Signal Bench* — mọi con số ngồi trên lưới đo được; tiến độ đọc ra ở vị
  trí trên thang, không phải ở một thanh trang trí.
- *Ikeda Datamatics* — không có xám trang trí; mỗi sắc độ phải có việc hoặc bị loại.
- *Console Dashboard Atmosphere* — bốn hoạt động là bốn nơi chốn có khoảng thở riêng.
- *Miura Orbit Sheet* — mở một bài là bung trọn cấu trúc của nó trong một nhịp.

**FINISH**
unreviewed and undocumented is unfinished; this build ends with the finish review, the
verdict, DESIGN.md, and every shipping raster carrying its provenance

## Ràng buộc riêng của dự án, đè lên mọi quyết định thị giác

- **Giữ nguyên**: tên "Gia sư Hóa 11", dòng phụ "HỆ THỐNG TỰ HỌC AI", logo sách mở, số
  Zalo 0345203054, nhân vật Thầy Hùng. Chủ dự án xác nhận là ràng buộc.
- **Được thay**: bảng màu cam–teal cũ. Chủ dự án xác nhận hai lần.
- **Tương phản ≥ 4,5** ở cả hai chế độ màu, có `npm run kiem-tra:mau` đo 70 cặp mỗi
  chế độ. Đây là sàn cứng, không thương lượng vì lý do thẩm mỹ.
- **Ba cỡ màn hình đều là cảnh dùng thật**: điện thoại buổi tối, máy tính ở nhà, máy
  chiếu trong lớp. Máy chiếu là lý do ngôn ngữ nhãn thắng — nó đọc được từ xa.
- **Chế độ tối là bắt buộc**, không phải tuỳ chọn: học sinh học buổi tối. Cảnh vật lý
  quyết định điều này, không phải thói quen thể loại.
- **Trò chơi trong `public/games/` CỐ Ý ở ngoài thế giới này.** Bề mặt trên là chế độ
  **Operate** — nơi học sinh làm việc. Trò chơi là chế độ **Chơi**, và một trò chơi có
  thế giới riêng là lựa chọn thiết kế, không phải lỗi đồng bộ. Chủ dự án chốt ngày
  09/09/2026, sau khi một vòng duyệt kết thúc nêu chỗ này là "hai sản phẩm khác nhau".
  Riêng "Rắn và Thang" còn là **thiết kế chủ dự án đặt riêng**: thầy gửi ảnh một tấm áp
  phích trò chơi và yêu cầu làm theo, `npm run kiem-tra:ran-thang` đang canh đúng bảng
  màu ấy. Đổi nó là xoá việc đã duyệt.
  Thứ PHẢI thuộc thế giới nhãn là **chỗ tiếp giáp**: thẻ chọn trò và thanh phủ khung
  trò chơi — như một cái nhãn dán trên hộp đựng trò chơi.
- **Ngữ pháp chuyển động: đúng MỘT nhịp, và nó nằm ở chỗ mở một bài.** Trải so le các
  khối bên trong mục vừa mở, tổng ~320ms, bước 60ms — đây là dòng nâng mượn từ *Miura
  Orbit Sheet* được trả. Dựng bằng CSS thuần, cố ý KHÔNG kéo thư viện chuyển động vào
  gói tải: học sinh dùng mạng di động và nặng trang là rào cản thật. Luôn tắt dưới
  `prefers-reduced-motion`.
