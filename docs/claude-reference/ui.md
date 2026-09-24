# Tài liệu theo chủ đề — ui

> Trích nguyên văn từ CLAUDE.md người dùng cung cấp. Quy tắc/giới hạn vẫn có hiệu lực; số đo và trạng thái dịch vụ là ghi nhận lịch sử, chưa được xác minh lại. Chỉ đọc phần liên quan.

**Tra mục:** [INDEX.md](INDEX.md). **Đọc chéo khi liên quan:** [auth.md](auth.md), [testing.md](testing.md), [product-decisions.md](product-decisions.md).

Các đường dẫn code trong nội dung gốc tính từ gốc repo. Cụm “mục bên dưới”, “tệp này” hoặc tên mục không kèm file là tham chiếu của bản gốc: dùng INDEX.md để tìm đúng tài liệu mới.

---

## Thế giới thị giác — nhãn cảnh báo hoá chất

Giao diện đi theo hệ **nhãn cảnh báo GHS** trên lọ hoá chất phòng thí nghiệm, chốt
ngày 09/09/2026. Hợp đồng hướng đầy đủ nằm ở `.impeccable/surfaces/app.md`, sự thật
sản phẩm ở `PRODUCT.md`. Bốn điều rút gọn, đủ để không đi lệch:

1. **Ba mực in.** Mực đen là mặc định cho MỌI chữ và dấu đánh mục. **Đỏ tín hiệu chỉ
   dành cho hành động chính, lỗi thật, và trạng thái đang chọn** — dùng thêm chỗ nữa
   là màu mất nghĩa. Vàng cảnh báo cho trạng thái đang dở (đồng hồ đếm ngược, mẹo cần
   nhớ). Lục phòng thí nghiệm là vai phụ cho trạng thái an toàn / đúng.
2. **Dựng bằng nét kẻ, không bằng bóng đổ.** Góc vuông, viền mực. Không bo góc lớn,
   không bóng đổ mềm, không chuyển sắc, không viền trái dày một màu.
3. **Chữ hiển thị dùng Archivo** (grotesque công nghiệp, gốc từ chữ biển báo); Inter ở
   lại làm chữ thân bài. Nhãn và mã viết hoa; số dùng dạng bảng (`tabular-nums`).
4. **Máy chiếu là cảnh dùng thật.** Ngôn ngữ nhãn thắng vì nó đọc được từ cuối lớp —
   đừng đánh đổi độ tương phản hay cỡ chữ để lấy vẻ thanh nhã.

Muốn đổi hướng thì đổi hợp đồng trước, đừng sửa lẻ từng màn.


## Bảng màu & chế độ sáng / tối

Toàn bộ màu của giao diện nằm trong `src/index.css` dưới dạng biến CSS, khai hai
lần: `:root` (nền sáng) và `:root[data-theme="dark"]` (nền tối). Trong `.tsx`
KHÔNG viết mã màu cứng nữa, luôn dùng `var(--ten-bien)`.

Công tắc: `src/core/hooks/useCheDoMau.ts`, nút bấm ở `DashboardHeader`
(`id="header-theme-btn"`), lựa chọn nhớ trong localStorage `h11_che_do_mau`.
Mặc định SÁNG, kể cả khi máy đang để nền tối.

**Mỗi biến có MỘT vai, không dùng lẫn.** Đây là chỗ dễ sai nhất:

| Vai | Tên biến | Vì sao không dùng lẫn được |
|---|---|---|
| Nền trang, nền thẻ | `--nen-*` | Sáng → tối khi đổi chế độ |
| Chữ trên nền trang | `--chu-*` | Tối → sáng khi đổi chế độ (ngược lại) |
| Chữ trên nền MÀU (nút đỏ tín hiệu, thanh menu mực) | `--chu-nguoc` | Luôn trắng ở CẢ hai chế độ |
| Màu nhấn làm CHỮ | `--tin-hieu`, `--luc-tham`, `--xanh`, ... | Nền tối phải SÁNG lên mới đọc được |
| Màu nhấn làm NỀN nút | `--tin-hieu-nen`, `--luc-tham-nen`, `--xanh-nen`, ... | Nền tối phải ĐẬM lại để chữ trắng đọc được |
| Khối mã / công thức | `--nen-ma`, `--chu-ma` | Cố ý giữ nền tối ở cả hai chế độ |
| Mặt nền cố ý TỐI (thanh quản trị, khung công thức) | `--nen-dam`, `--vien-dam`, `--chu-tren-nen-dam` | Giữ nguyên ở cả hai chế độ |
| Nền nút đã bị vô hiệu hoá | `--nen-tat` | Không phải màu chữ |

**Tên biến phải nói VAI, không nói sắc — nếu vai đó là một luật.** Ngày 09/09/2026
`--cam*` đổi thành `--tin-hieu*` và `--teal*` thành `--luc-tham*` (259 chỗ). Không phải
dọn dẹp cho đẹp: chính cái tên "cam" đã mở đường cho lỗ hổng lớn nhất của đợt thiết kế
lại. "Cam" nghe như màu thương hiệu nên nó bị rải ra 95 chỗ làm dấu trang trí; đến khi
giá trị đổi thành đỏ tín hiệu thì cả trang đỏ rực và màu đỏ mất sạch nghĩa. Tên mới
mang luôn cái luật — **`--tin-hieu` chỉ dùng cho hành động chính, lỗi thật, và trạng
thái đang chọn** — nên người viết mã lần sau không cần đọc tới đây mới biết.

`--luc-tham` thì ngược lại: nó không phải một vai, chỉ là một sắc nhấn, nên đặt tên
theo đúng sắc như `--xanh` / `--tim` / `--vang`.

Trò chơi trong `public/games/` có bảng màu RIÊNG và **cố ý không đổi**: `--cam` ở đó là
cam thật. Tên đó không nói dối.

Hai dòng cuối là bài học phải trả giá: ban đầu chỉ có một biến `--xanh` gánh cả
vai chữ lẫn vai nền. Làm sáng nó lên cho vai chữ thì thanh menu thành xanh nhạt
mang chữ trắng, tương phản tụt còn 2,7 — nhìn là biết sai nhưng build vẫn xanh.

**Luật quan trọng nhất, và đã bị vi phạm bốn lần:** hễ có biến `--X-nen` thì `--X` CHỈ dành cho vai chữ. Ở chế độ tối `--X` được làm sáng lên cho dễ đọc trên nền đậm, nên đem nó làm nền nút mang chữ trắng là trắng-trên-sáng. `npm run kiem-tra:mau` nay có luật tự bảo trì canh đúng điều đó.

Lần lọt thứ tư (09/09/2026) đáng nhớ vì nó cho thấy một phép kiểm ĐÚNG vẫn có thể mù:
regex cũ đòi `var(--x)` đứng NGAY sau `backgroundColor:`, nên mọi chỗ viết dạng ba ngôi
(`active ? 'var(--luc-tham)' : …`) đều lọt — mà đó lại đúng là lối viết cho trạng thái đang
chọn, tức đúng chỗ nút mang chữ trắng. Sáu chỗ lọt: hai nút chọn vai và nút Đăng nhập ở
màn đăng nhập, hai ảnh đại diện "đang chọn", cột biểu đồ điểm, bong bóng chat. Nay cả
ba phép kiểm đọc hết GIÁ TRỊ của thuộc tính (tới dấu phẩy) và soi thêm `linkColor`,
`accentColor`, `statusColor`.

**Và một bài học về chính bộ kiểm tra:** phép kiểm "không lấy biến CHỮ làm màu nền" đã báo ĐẠT suốt nhiều tuần mà chưa hề soi dòng nào — regex dùng nhóm không-bắt `(?:...)` nên biến nằm ở `m[1]`, mà mã lại đọc `m[2]`, luôn `undefined`. Vì thế lỗi "nền thanh quản trị dùng `--chu-dam`" lọt tới tận tay người dùng. Một phép kiểm luôn xanh mà chưa bao giờ bắt được gì thì đáng ngờ hơn là đáng mừng: thỉnh thoảng phải cố tình làm hỏng một chỗ để xem nó có kêu không.

Chạy `npm run kiem-tra:mau` sau khi đụng vào màu. Bộ này bắt: biến khai thiếu ở
một chế độ, gõ nhầm tên biến, dùng lẫn vai nền/chữ, mã màu cứng còn sót, và **tương
phản dưới 4,5** — đo thật 70 cặp chữ/nền ở mỗi chế độ màu. Chỗ nào đã xem tay và xác
nhận đúng thì ghi `// mau-ok` ở CUỐI dòng đó.

Hai điều về phép đo tương phản, thêm ngày 08/09/2026:

- Trước đó ngưỡng 4,5 chỉ được *nói* chứ không ai đo. Đo tay ra 14 cặp không đạt, tệ
  nhất là `--luc` làm màu chữ chỉ được 2,32 mà đang dùng ở 11 chỗ. Đã làm đậm 12 biến
  cho đạt chuẩn rồi mới viết phép đo.
- Phép đo chỉ soi **biến CSS**. Màu viết cứng trong `.tsx` chỉ bị ĐẾM chứ không bị đo,
  nên vẫn lọt lỗi: trang 404 từng có tương phản 1,03 vì viết cứng nền tối. Và cẩn thận
  chỗ màu chữ đến từ bảng màu MUI còn màu nền đến từ biến CSS — hai hệ khác nhau, chỉ
  cần một bên đổi trước là chữ biến mất. Gặp trường hợp đó thì đặt màu chữ tường minh
  bằng `color: 'var(--...)'`.

**Ngưỡng mã màu cứng nay là 0.** Từ 09/09/2026 trong `src/*.tsx` không còn mã màu
viết cứng nào ngoài khối `palette` của MUI và bốn tệp tranh vẽ. Trước đó ngưỡng là 70
và con số đứng ở 66 rất lâu — đủ chỗ cho chữ `#f5a623` ở khu trò chơi sống sót với
tương phản 2,0 trên nền trắng, vì phép kiểm chỉ ĐẾM chứ không ĐO. Cần một mã màu thật
thì ghi `// mau-ok` ở cuối dòng.

Chú ý khi viết chú thích: cả bộ đếm "mã màu cứng" lẫn phép kiểm tên biến đều quét chú
thích. Đừng viết lại mã màu dạng `#rrggbb` trong đó, và đừng viết `var(--x)` làm ví dụ
— tên biến giả sẽ bị báo là gõ nhầm.

Cố ý KHÔNG đụng tới `GameArt.tsx`, `doodles.tsx`, `ChemDoodles.tsx`,
`Mascot.tsx` (tranh vẽ — đảo màu theo nền là hỏng hình) và khối `palette` trong
`App.tsx` (MUI cần màu thật để tự tính sắc độ đậm/nhạt, đưa biến CSS vào là
hỏng cả bảng màu).

