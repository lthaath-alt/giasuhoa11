---
name: Gia sư Hóa 11
description: Thế giới nhãn cảnh báo hoá chất GHS — giấy nhãn, mực đen, đỏ tín hiệu được phân phối tiết kiệm, dựng bằng nét kẻ chứ không bằng bóng đổ.
colors:
  nen-trang: "#F2F1ED"
  nen-the: "#FFFFFF"
  nen-nhat: "#E7E6E0"
  nen-rat-nhat: "#F8F7F4"
  vien: "#CBC9C0"
  vien-2: "#DEDCD4"
  chu-dam: "#121210"
  chu-dam-2: "#292926"
  chu-dam-3: "#3C3C37"
  chu: "#4D4D47"
  chu-mo: "#63635B"
  chu-nguoc: "#FFFFFF"
  nen-dam: "#121210"
  vien-dam: "#2A2A26"
  chu-tren-nen-dam: "#A9A89F"
  tin-hieu: "#B3000F"
  tin-hieu-nen: "#C4000E"
  tin-hieu-dam: "#8C000C"
  vang-nen: "#F5C400"
  chu-tren-vang: "#1A1400"
  luc-tham-nen: "#0F5A44"
  luc-nen: "#17603A"
  xanh-nen: "#14508C"
  nen-ma: "#1A1A16"
  chu-ma: "#E8E7E1"
  nen-tat: "#CBC9C0"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.12em"
  button:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    letterSpacing: "0.01em"
  data:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    fontFeature: "tabular-nums"
rounded:
  vuong: "0"
  tron: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.tin-hieu-nen}"
    textColor: "{colors.chu-nguoc}"
    typography: "{typography.button}"
    rounded: "{rounded.vuong}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.nen-dam}"
    textColor: "{colors.chu-nguoc}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.chu-dam}"
    typography: "{typography.button}"
    rounded: "{rounded.vuong}"
    padding: "8px 16px"
  button-outline-hover:
    backgroundColor: "{colors.nen-dam}"
    textColor: "{colors.chu-nguoc}"
  button-disabled:
    backgroundColor: "{colors.nen-tat}"
    textColor: "{colors.chu}"
  field-band:
    backgroundColor: "{colors.nen-dam}"
    textColor: "{colors.chu-nguoc}"
    typography: "{typography.label}"
    rounded: "{rounded.vuong}"
    padding: "9px 16px"
  field-body:
    backgroundColor: "{colors.nen-the}"
    textColor: "{colors.chu-dam-3}"
    typography: "{typography.data}"
    rounded: "{rounded.vuong}"
    padding: "16px"
  card:
    backgroundColor: "{colors.nen-the}"
    textColor: "{colors.chu-dam}"
    rounded: "{rounded.vuong}"
    padding: "16px"
  input:
    backgroundColor: "{colors.nen-the}"
    textColor: "{colors.chu-dam}"
    typography: "{typography.body}"
    rounded: "{rounded.vuong}"
  chip:
    backgroundColor: "{colors.nen-nhat}"
    textColor: "{colors.chu-dam}"
    rounded: "{rounded.vuong}"
    padding: "0 12px"
    height: "24px"
  tooltip:
    backgroundColor: "{colors.nen-dam}"
    textColor: "{colors.chu-nguoc}"
    rounded: "{rounded.vuong}"
    padding: "6px 10px"
  code-block:
    backgroundColor: "{colors.nen-ma}"
    textColor: "{colors.chu-ma}"
    rounded: "{rounded.vuong}"
    padding: "8px"
---

# Design System: Gia sư Hóa 11

> Tài liệu này ghi lại hệ thống **ĐANG XUẤT XƯỞNG**, đọc ra từ mã nguồn ngày
> 09/09/2026. Nguồn sự thật là `src/index.css`, `src/App.tsx` và các thành phần đã
> dựng — không phải ý định trong hợp đồng hướng. Chỗ nào hai bên lệch nhau, tài liệu
> chép theo **bản đã dựng** và nói rõ chỗ lệch.
>
> Đây là bản dựng **code-led**: không có comp được duyệt, và vòng gieo ý tưởng không
> sinh ra ảnh nào. Vòng duyệt hoàn thiện chạy **không có ảnh chụp màn hình** (môi
> trường điều khiển được trình duyệt nhưng không ghi được tệp PNG ra đĩa), nên kết
> luận của nó chỉ có hiệu lực trong phạm vi mã nguồn và số đo. Hai vòng duyệt đã
> chạy; vòng thứ hai trả về `disposition: fix` và các điểm nó nêu đã được sửa.

## Overview

**Creative North Star: "Nhãn cảnh báo hoá chất"**

Ngôn ngữ thị giác không mượn từ ngành phần mềm giáo dục mà mượn từ **chính ngành hoá
học**: hệ nhãn GHS dán trên mọi lọ hoá chất trong phòng thí nghiệm. Nền nhãn trắng và
giấy ngà, mực đen đặc, viền là đường kẻ thẳng, thứ bậc nghiêm ngặt, và **đỏ tín hiệu
chỉ xuất hiện ở chỗ thật sự có tín hiệu**. Một cái nhãn hoá chất phải đọc được từ cuối
phòng thí nghiệm; giao diện này phải đọc được từ cuối lớp học, vì máy chiếu trong lớp
là một trong ba cảnh dùng thật.

Mật độ là mật độ của một tờ khai: các trường ngồi liền cạnh nhau, chia bằng một nét
mực dùng chung, không phải bốn tấm thẻ rời trôi nổi có khe hở. **Độ sâu diễn đạt bằng
ĐỘ ĐẬM CỦA VIỀN, không bằng độ nhoè của bóng** — toàn bộ mặc định `boxShadow` của MUI
bị tắt trong `src/App.tsx`, và trong `src/` không còn một giá trị `boxShadow` sống nào
ngoài `'none'`. Mặt nào nổi lên trên (hộp thoại, menu, popover) thì tách khỏi nền bằng
viền mực `2px`, đúng như mép một tờ nhãn dán đè lên.

Thế giới này **từ chối** kiểu app học tập bo tròn pastel với vòng tiến độ và linh vật
cười — đó là thứ mọi nền tảng học online đều xuất ra. Chủ dự án đã hai lần xác nhận từ
bỏ bảng màu cam–teal cũ; di sản teal cuối cùng (mảng nền panel đăng nhập) đã được thay
bằng mực.

**Key Characteristics:**
- Giấy ngà (`#F2F1ED`) và mặt nhãn trắng (`#FFFFFF`); mực gần đen (`#121210`).
- Bán kính góc **bằng 0** ở mọi nơi; hình tròn `50%` chỉ dành cho huy hiệu và chấm trạng thái.
- **Không có bóng đổ nào**, kể cả bóng khối cứng. Nét kẻ làm hết việc đó.
- Hai phông grotesque công nghiệp: **Archivo** cho giọng hiển thị, **IBM Plex Sans** cho thân bài.
- Ký hiệu riêng của thế giới: **hình thoi nét đều 2px**, ô 22×22.
- Số luôn dạng bảng (`tabular-nums`) — điểm, số câu, mã bài đều là dữ liệu đo được.
- Hai chế độ màu là tính năng thật, có máy đo, không phải tuỳ chọn trang trí.
- **Đúng MỘT nhịp chuyển động** trong toàn hệ thống.

## Colors

Bảng màu là bảng màu của một tờ nhãn: giấy, mực, và một lượng rất nhỏ màu báo động.
Toàn bộ màu khai bằng biến CSS trong `src/index.css`, **khai hai lần** — `:root` cho
nền sáng và `:root[data-theme="dark"]` cho nền tối, 64 biến mỗi bên. Trong `.tsx`
không được viết mã màu cứng; `npm run kiem-tra:mau` xác nhận **0 mã màu cứng còn sót**
ngoài khối `palette` của MUI và bốn tệp tranh vẽ.

### Primary
- **Đỏ tín hiệu — nền** (`--tin-hieu-nen`): nền của hành động chính, gạch chân tab đang
  chọn, nền báo lỗi thật. Đây là màu viền thoi trên nhãn cảnh báo. Giữ **cùng một giá
  trị ở cả hai chế độ** vì nó luôn mang chữ trắng.
- **Đỏ tín hiệu — chữ** (`--tin-hieu`): cùng màu ấy khi làm CHỮ, viền ô nhập đang focus,
  `caret-color`, và vòng `:focus-visible`. Ở chế độ tối biến này **sáng lên** (`#FF5A50`)
  để đọc được trên giấy đen; bản nền thì không.
- **Đỏ tín hiệu đậm** (`--tin-hieu-dam`): trạng thái nhấn giữ và sắc `dark` của MUI.

### Secondary
- **Vàng cảnh báo** (`--vang-nen`): băng kẻ chéo của phòng thí nghiệm — trạng thái đang
  dở, tiêu đề phụ trên mặt mực, viền khối "ghi nhớ", và `::selection` của toàn trang. Ở
  chế độ tối hạ xuống `#D9A600` cho đỡ chói.
- **Chữ trên nền vàng** (`--chu-tren-vang`): vàng quá sáng nên chữ trắng chỉ đạt 2,8.
  Chữ nâu gần đen trên vàng đạt hơn 8. Giữ nguyên ở cả hai chế độ.

### Tertiary
- **Lục phòng thí nghiệm** (`--luc-tham-nen`, `--luc-nen`): trạng thái an toàn / đã xong
  / nguồn dữ liệu sẵn sàng. Vai phụ, không bao giờ là hành động chính.
- **Xanh tài liệu** (`--xanh-nen`): khối đề bài, thông tin trung tính.

### Neutral
- **Giấy trang** (`--nen-trang`): nền toàn trang, ngà chứ không trắng tinh.
- **Mặt nhãn** (`--nen-the`): nền thẻ, hộp thoại, và **hàng menu** dưới thanh nhận diện.
- **Giấy nhấn nhẹ** (`--nen-nhat`, `--nen-rat-nhat`): nền một trường nội dung, nền rãnh
  thanh cuộn, nền thanh tiến độ.
- **Nét kẻ** (`--vien`, `--vien-2`): đường chia ô — thiết bị dựng hình chính của cả hệ
  thống. `--vien` cũng là màu con trượt thanh cuộn.
- **Mực** (`--chu-dam`, `--chu-dam-2`, `--chu-dam-3`, `--chu`, `--chu-mo`): thang năm
  bậc chữ trên giấy. Đảo hoàn toàn ở chế độ tối.
- **Mặt mực** (`--nen-dam`, `--vien-dam`, `--chu-tren-nen-dam`): mặt **CỐ Ý TỐI ở cả hai
  chế độ** — thanh nhận diện, dải đầu trường nhãn, panel trái màn đăng nhập, thanh phủ
  khung trò chơi, tooltip. Không được thay bằng `--chu-dam`: đó là biến màu CHỮ và nó
  lật màu theo chế độ.
- **Chữ nghịch** (`--chu-nguoc`): chữ đặt trên mọi nền MÀU. **Luôn trắng ở cả hai chế độ.**
- **Khối mã / công thức** (`--nen-ma`, `--chu-ma`): cố ý giữ nền tối ở cả hai chế độ.
- **Nút vô hiệu hoá** (`--nen-tat` + chữ `--chu`): mặc định `rgba(0,0,0,0.26)` của MUI
  chỉ đạt 1,83 trên nền này. Một cái nhãn thì đọc được hoặc không — giữ nó MỜ chứ không
  giữ nó MẤT. Cặp đang dùng đạt 5,13.

### Named Rules

**The One Variable, One Role Rule.** Hễ tồn tại `--X-nen` thì `--X` **chỉ dành cho vai
chữ**. Ở chế độ tối, biến vai-chữ được **làm sáng lên** để đọc được trên giấy đen, còn
biến vai-nền **giữ nguyên độ đậm** để chữ trắng trên nó vẫn đọc được. Một biến không
gánh nổi hai vai trái ngược. Luật này đã bị vi phạm bốn lần trong lịch sử dự án — lần
tệ nhất làm cả thanh quản trị thành chữ trắng trên nền trắng — và nay
`npm run kiem-tra:mau` canh nó tự động cho cả **8 màu nhấn có bản nền riêng**
(`--tin-hieu`, `--luc-tham`, `--xanh`, `--xanh-dam`, `--do`, `--luc`, `--tim`, `--vang`).

**The Rationed Red Rule.** `--tin-hieu*` chỉ dùng cho **hành động chính, lỗi thật, và
trạng thái đang chọn**. Không bao giờ để trang trí, không bao giờ làm nền một mảng lớn,
và **không quá một lần trên mỗi khung hình**. Ở khung hình đầu, bốn trường nhãn chỉ có
trường thứ nhất mang nút đỏ; ba trường còn lại là khung kẻ. Đỏ mà xuất hiện bốn lần thì
hết là tín hiệu. Biến này được **đổi tên có chủ ý** từ `--cam` sang `--tin-hieu` để
chính cái tên mang theo luật. Lỗi thật dùng **đúng một sắc đỏ ấy**: trên nhãn hoá chất
chỉ có MỘT màu báo động.

**The Measured, Not Asserted Rule.** Tương phản là số đo, không phải lời khẳng định.
`npm run kiem-tra` chạy **9 bộ / 194 mục**; riêng bộ màu đo **71 cặp chữ/nền đã khai,
mỗi chế độ**, đối chiếu ngưỡng **4,5**; **27 cặp viết cùng một khối `sx`** dò thẳng từ
mã nguồn; và **3 chỉ báo phi-chữ** (viền, gạch chân, vòng tiêu điểm) đối chiếu **3,0**.
Cặp nào chấp nhận dưới ngưỡng thì phải nằm trong danh sách miễn kèm LÝ DO. Chỗ nào đã
xem tay và xác nhận đúng thì ghi `// mau-ok` ở cuối dòng. Trước khi có phép đo này,
ngưỡng 4,5 chỉ được *nói* — đo tay ra 14 cặp không đạt.

## Typography

**Display Font:** Archivo (dự phòng `system-ui, sans-serif`)
**Body Font:** IBM Plex Sans (dự phòng `system-ui, sans-serif`)

Cả hai nạp từ Google Fonts trong `src/index.css`: Archivo 500–900, IBM Plex Sans
400–700, `display=swap`.

**Character:** Archivo là grotesque công nghiệp gốc từ chữ **biển báo** — đúng thế giới
nhãn cảnh báo, đủ dấu tiếng Việt, và đủ nặng để đọc từ cuối lớp qua máy chiếu. IBM Plex
Sans là grotesque kỹ thuật dựng cho tài liệu máy móc; đứng cạnh Archivo thì cùng một họ
giọng, không phải một cặp tương phản. Chỗ này **trước đây là Inter**, và đã đổi có chủ
ý: Inter nằm trong nhúm phông bị dùng tới mức mất hết cá tính, và giữ nó cho thân bài
thì dấu vết ấy vẫn còn nguyên ở chỗ chiếm nhiều diện tích nhất.

### Hierarchy
- **Display** (Archivo 800, `letter-spacing: -0.02em`, `line-height: 1.2`): `h1`–`h4`.
  Câu tuyên ngôn ở panel đăng nhập, tên màn hình.
- **Headline** (Archivo 700, `-0.01em`, `line-height: 1.3`): `h5`–`h6`. Tên bài giảng,
  tiêu đề khối trong trình đọc.
- **Title** (IBM Plex Sans 600): `subtitle1`/`subtitle2`. Tên mục, tên tính năng.
- **Body** (IBM Plex Sans 400, `line-height: 1.6`): `body1`/`body2`. Câu chữ dài để đọc.
- **Label** (Archivo 700, `letter-spacing: 0.12em`, HOA TOÀN PHẦN): `overline`. Tên
  trường trên dải nhãn, tiêu đề khối nhỏ, tên nhóm. Ở dải nhãn khung hình đầu dùng cỡ
  `0.82rem`.
- **Button** (Archivo 700, `letter-spacing: 0.01em`, `text-transform: none`): chữ nút
  **không** viết hoa tự động — chữ hoa dành cho NHÃN, không dành cho lệnh.
- **Data** (IBM Plex Sans 600, `font-variant-numeric: tabular-nums`): mọi con số.

### Named Rules

**The Label-Voice Rule.** Chữ HOA toàn phần + `letter-spacing: 0.12em` là **giọng
NHÃN**: nó đặt tên cho một trường, một khối, một nhóm. Nó không phải giọng câu văn và
không phải giọng nút bấm. Một khối chỉ được có **một nhãn**, đặt ở dải đầu khối.

**The Tabular Number Rule.** Mọi con số đo được — điểm, số câu, mã bài, số lượt hỏi còn
lại — phải thẳng cột. `src/index.css` bật `tabular-nums` cho `table`, `[data-so]` và
`.so-lieu`; chỗ nào hiện số ngoài ba vùng đó thì đặt `fontVariantNumeric` tại chỗ.

## Layout

Khung là `Container maxWidth="xl"` của MUI. Điểm ngắt là bộ mặc định của MUI và được
dùng nguyên: `xs 0` · `sm 600px` · `md 900px` · `lg 1200px` · `xl 1536px`. Ngưỡng làm
việc thật là **`md`** — đó là chỗ bố cục chuyển từ một cột (điện thoại) sang hai cột
(máy tính, máy chiếu).

Nhịp khoảng cách là thang 8px của MUI, và bản dựng thật chỉ dùng **năm bậc**:
`0.5 = 4px` · `1 = 8px` · `1.5 = 12px` · `2 = 16px` · `3 = 24px`. Bậc `2` (16px) là khe
giữa các trường và là padding thân trường; bậc `3` (24px) là padding của khối lớn trong
trình đọc.

Khung hình đầu: thanh nhận diện mực chạy hết bề ngang → hàng menu giấy → **lưới bốn
trường nhãn**, `repeat(2, minmax(0, 1fr))` trên `md`, một cột trên `xs`, khe 16px. Dùng
`minmax(0, 1fr)` chứ **không** dùng `1fr`: `1fr` có sàn `min-content` nên một dòng trạng
thái dài sẽ đẩy cột tràn ra ngoài.

**The Three Real Screens Rule.** Điện thoại buổi tối, máy tính ở nhà, **máy chiếu trong
lớp** — cả ba là cảnh dùng thật, không cảnh nào hạng hai. **Máy chiếu là lý do ngôn ngữ
nhãn thắng**: chữ hoa nặng, tương phản cao và nét kẻ đậm đọc được từ cuối lớp, còn chữ
mảnh trên thẻ pastel thì không. Mọi màn mới phải nhìn được ở cả ba khoảng cách trước
khi coi là xong.

## Elevation & Depth

**Hệ này không có bóng đổ.** Không bóng mềm, không bóng khối cứng, không bóng màu.
`src/App.tsx` tắt `boxShadow` mặc định của MUI ở `MuiButton` và đặt `elevation: 0` cho
`MuiCard`/`MuiPaper`; trong toàn bộ `src/` không còn giá trị `boxShadow` nào khác
`'none'`.

Độ sâu diễn đạt bằng **độ đậm của nét kẻ** và bằng **sắc độ mặt**, theo ba bậc:

- **Mặt phẳng nền** — nét `1px solid var(--vien)`. Thẻ, ô nhập, khối nội dung thường.
  Đây là mặt giấy.
- **Mặt có trọng lượng** — nét `2px solid var(--chu-dam)`. Trường nhãn ở khung hình đầu,
  khối bài giảng đang mở. Nét mực nói "đây là một đơn vị", không nói "cái này nổi".
- **Mặt nổi lên trên** — nét `2px solid var(--chu-dam)` trên `MuiDialog`, `MuiMenu`,
  `MuiPopover`, `MuiAutocomplete`. Không có bóng để tách khỏi nền nên phải tách bằng
  viền mực, giống mép một tờ nhãn dán đè lên.

Mặt **mực** (`--nen-dam`) là bậc thứ tư và là bậc mạnh nhất: nó không nổi lên, nó **đảo
cực**. Dùng cho thanh nhận diện, dải đầu trường, thanh phủ khung trò chơi.

**The Ink-Rule Depth Rule.** Muốn một khối "nổi hơn"? Làm đậm viền nó, đừng thêm bóng.
Bóng đổ mềm là ngôn ngữ của thế giới cũ ("thẻ nổi trên nền"); thế giới này là một mặt
phẳng giấy chia ô bằng đường mực.

## Shapes

**Bán kính góc của hệ này là 0.** `shape: { borderRadius: 0 }` trong theme MUI đặt mặc
định vuông góc cho mọi thành phần không tự khai — Menu, Popover, Snackbar, Accordion,
Slider — và các thành phần hay tự khai lại (`MuiButton`, `MuiCard`, `MuiPaper`,
`MuiChip`, `MuiOutlinedInput`, `MuiToggleButton`, `MuiLinearProgress`, `MuiAlert`,
`MuiTooltip`, `MuiTabs`) đều bị đặt lại về 0 tường minh. Cả thanh cuộn do trình duyệt vẽ
cũng `border-radius: 0`.

**Ngoại lệ duy nhất là hình tròn thật** (`50%`): huy hiệu kết quả 64×64 ở các màn xác
nhận, ảnh đại diện, và chấm trạng thái 10px. Hình tròn hoàn chỉnh là một hình dạng khác,
không phải một góc bo.

**Ký hiệu của thế giới là hình thoi**: ô 22×22, `border: 2px solid currentColor`, xoay
45°, nội dung xoay ngược lại 45° để chữ vẫn đứng. Nó mang mã trường (`ActivityFields`),
và bản đặc 6×6 xoay 45° làm dấu đầu dòng trong khối "ghi nhớ".

**The Straight-Rule Rule.** Thế giới này dựng bằng đường kẻ thẳng. Không bo góc lớn,
không viền trái màu dày kiểu callout, không dải gradient. Một đường `1px` biết nói đủ mọi
thứ mà một cái bóng nói được.

**The Shared-Rule Table Rule.** Nhiều ô cùng nhóm thì **liền cạnh, chia bằng MỘT nét dùng
chung**, không phải nhiều thẻ rời có khe. Lưới bốn tính năng ở panel đăng nhập làm đúng
thế: mỗi ô chỉ vẽ cạnh phải và cạnh dưới, khung ngoài đóng lại hai cạnh còn lại (`border`
trên khung + `borderRight: 0` + `borderBottom: 0`). Đây là "trường có kẻ ô như bảng khai
nhãn" — thiết bị dựng hình đặc trưng nhất của hệ.

## Components

### Buttons
- **Shape:** vuông góc tuyệt đối (`0`), padding `8px 18px` (mặc định theme), `8px 16px` ở
  nút trong trường nhãn. `disableElevation` bật mặc định.
- **Primary:** nền `--tin-hieu-nen`, chữ `--chu-nguoc`. **Mỗi khung hình một nút loại
  này**, không hơn.
- **Hover:** nút chính lật sang nền **mực** (`--nen-dam`) — không phải một sắc đỏ đậm
  hơn. Chuyển `background-color 0.15s linear, color 0.15s linear`, không có `transform`,
  không có bóng.
- **Outline (mặc nhiên là thứ hai):** nền trong suốt, chữ `--chu-dam`,
  `border: 1px solid var(--chu-dam)`; hover **đảo cực** thành nền mực chữ trắng.
- **Trên mặt mực:** viền và chữ `--chu-nguoc`; hover lật thành nền `--nen-the`, chữ
  `--chu-dam`.
- **Disabled:** nền `--nen-tat`, chữ `--chu` (không dùng mặc định của MUI).

### Chips
- **Style:** chữ nhật (`0`), `font-weight: 700`, `letter-spacing: 0.02em`. Chip là một
  cái **nhãn nhỏ**, không phải viên kẹo bo tròn.

### Cards / Containers
- **Corner Style:** `0`. **Background:** `--nen-the`. **Shadow:** không có, `elevation: 0`.
- **Border:** `1px solid var(--vien)` mặc định; `2px solid var(--chu-dam)` khi khối là
  một đơn vị có trọng lượng.
- **Internal Padding:** 16px (thẻ thường) hoặc 24px (khối lớn trong trình đọc).

### Inputs / Fields
- **Style:** `MuiOutlinedInput` bán kính 0, viền `--vien`.
- **Hover:** viền chuyển sang `--chu-dam`.
- **Focus:** viền `--tin-hieu` và **dày lên 2px** — độ dày mang trạng thái, đúng như cách
  hệ này diễn đạt độ sâu. `caret-color` cũng là `--tin-hieu`.
- **Focus toàn cục:** `:focus-visible { outline: 2px solid var(--tin-hieu); outline-offset: 2px }`.

### Navigation
- **Thanh nhận diện** là **MỰC** (`--nen-dam`, chữ `--chu-nguoc`), gạch dưới bằng
  `2px solid var(--chu-dam)` thay cho bóng toả. Mang logo sách mở trong ô giấy vuông
  44×44, tên "Gia sư Hóa 11", dòng phụ hoa nhỏ, và số Zalo neo phải.
- **Hàng menu ngay dưới là GIẤY** (`--nen-the`, chữ `--chu-dam`). Mực ở trên, giấy ở
  dưới — không được dựng ngược.
- **Mục đang chọn:** chữ `--chu-dam`, nền `--nen-nhat`,
  `border-bottom: 3px solid var(--tin-hieu)`. Mục thường: chữ `--chu-2`, gạch chân
  `3px solid transparent` để hàng không nhảy.
- **Gạch chân tab (`MuiTabs`):** một nét mực dày `3px` màu `--tin-hieu-nen`, không phải
  vệt màu mờ.
- **Trên điện thoại:** hàng menu cuộn ngang (`overflowX: auto`, thanh cuộn ẩn), các nút
  `flexShrink: 0` và `whiteSpace: nowrap` để không bị bóp vỡ dòng.

### Trường nhãn (thành phần chữ ký)
`src/features/lessons/components/ActivityFields.tsx` — biểu đạt rõ nhất của thế giới.
Mỗi trường là một ô khai trên nhãn hoá chất:
- **Khung:** `2px solid var(--chu-dam)`, nền `--nen-the`, không bo góc, không bóng.
- **Dải nhãn** (đầu khối): nền `--nen-dam`, chữ `--chu-nguoc`, padding `9px 16px`, mang
  **ký hiệu thoi** chứa mã trường và **tên trường viết hoa** ở giọng Label.
- **Thân:** padding 16px, một dòng trạng thái THẬT đọc từ dữ liệu đang chạy, đặt
  `tabular-nums`, màu `--chu-dam-3`, weight 600.
- **Hành động:** một nút neo ở mép phải. Đúng **một** trường mang cờ `chinh` và được nút
  đỏ; các trường khác dùng nút viền.
- **Khoá:** trường chưa mở cho vai hiện tại thì thay nút bằng một dòng lý do màu `--chu-mo`.
- Nhân vật (Thầy Hùng) đứng ở **mép phải trường Gia sư AI**, không phải giữa màn.

**The Real Number Rule.** Dòng trạng thái của trường phải đọc từ dữ liệu đang chạy. Không
con số nào được bịa — một cái nhãn ghi sai số thì tệ hơn là không ghi.

### Chuyển động
**Đúng MỘT nhịp trong toàn hệ thống**, và nó nằm ở chỗ **mở một mục bài** trong
`TextbookViewer`. Lớp `.mo-muc-bai` trải so le các khối con: bước **50ms**, mỗi khối chạy
**170ms** (`ease-out`, `opacity 0→1` + `translateY(6px)→0`), khối thứ tư kết thúc ở
**320ms**. Khối thứ năm trở đi dùng chung độ trễ cuối (150ms) — một mục dài không được
biến thành hàng đợi.

*Lệch so với hợp đồng hướng, và bản dựng thắng:* hợp đồng ghi "bước 60ms"; bản đã dựng
là **50ms**. Con số trong `src/index.css` là con số đúng.

Dựng bằng **CSS thuần**. Gói `motion` có trong `package.json` nhưng chưa tệp nào trong
`src/` import nó, nên nó chưa hề nằm trong gói tải về: kéo cả một thư viện vào cho đúng
một hiệu ứng là đánh đổi sai khi học sinh dùng mạng di động.

Tắt hoàn toàn dưới `@media (prefers-reduced-motion: reduce)`. *Lưu ý trung thực: chỉ mới
xác minh **sự tồn tại** của luật này trong mã; chưa chạy thử trên máy có bật thật thiết
lập đó.*

**The One Beat Rule.** MỘT nghĩa là một. Cả hệ thống không có chỗ thứ hai chuyển động.
Thêm một chỗ nữa là mỗi chỗ mất đi phần ý nghĩa của nó. Sự khan hiếm CHÍNH LÀ hiệu ứng.

### Mặt do trình duyệt vẽ
Thanh cuộn (`::-webkit-scrollbar` + `scrollbar-color` cho Firefox), `::selection` (nền
`--vang-nen`, chữ `--chu-tren-vang`), `caret-color`, vòng `:focus-visible` — tất cả đều
lấy biến của hệ. Đây là chỗ dễ bỏ sót nhất và cũng là dấu hiệu rẻ nhất cho thấy trang
được DỰNG chứ không phải lắp ghép.

## Do's and Don'ts

### Do:
- **Do** khai mọi màu mới thành biến trong `src/index.css`, **ở CẢ HAI** khối `:root` và
  `:root[data-theme="dark"]`, rồi dùng qua `var(--ten-bien)`.
- **Do** tách vai ngay từ lúc đặt tên: có `--X-nen` thì `--X` chỉ làm chữ.
- **Do** chạy `npm run kiem-tra:mau` sau mỗi lần đụng vào màu, và ghi `// mau-ok` ở cuối
  dòng đã xem tay và xác nhận đúng.
- **Do** giữ `border-radius: 0` cho mọi hình chữ nhật; chỉ `50%` cho hình tròn thật.
- **Do** diễn đạt độ sâu bằng độ đậm viền: `1px var(--vien)` → `2px var(--chu-dam)`.
- **Do** cho mỗi khối đúng **một** dải nhãn viết hoa ở đầu, mang ký hiệu thoi nếu khối là
  một trường.
- **Do** giữ mỗi khung hình đúng **một** nút đỏ tín hiệu.
- **Do** đặt `tabular-nums` cho mọi con số hiện ra ngoài `table`.
- **Do** dùng `minmax(0, 1fr)` trong `gridTemplateColumns`, không dùng `1fr` trần.
- **Do** đặt màu chữ tường minh bằng `color: 'var(--...)'` khi nền đến từ biến CSS còn
  chữ mặc định đến từ bảng màu MUI — hai hệ khác nhau, chỉ cần một bên đổi trước là chữ
  biến mất.
- **Do** giữ mã màu THẬT trong khối `palette` của `src/App.tsx`: MUI cần số để tự tính
  sắc độ đậm/nhạt; đưa `var(--…)` vào là hỏng cả bảng màu. Và **phải đặt lại `light` cho
  từng màu ở bản tối** — MUI lấy chính `light` làm màu CHỮ cho `<Alert>`, `<Chip>`, nút
  outlined.

### Don't:
- **Don't** thêm `box-shadow` — không bóng mềm, không bóng khối cứng, không bóng màu. Hệ
  này không có ngôn ngữ bóng đổ; làm đậm viền thay vào đó.
- **Don't** bo góc thẻ, nút, ô nhập, chip hay khối bất kỳ.
- **Don't** dùng đỏ tín hiệu để trang trí, để làm nền một mảng lớn, hay quá một lần trên
  một khung hình; và **don't** thêm sắc đỏ thứ hai cho báo lỗi.
- **Don't** lấy một biến vai-CHỮ (`--chu-dam`, `--tin-hieu`, `--luc`, `--xanh`…) làm màu
  NỀN. Ở chế độ tối chúng lật sáng lên và mặt nền biến thành trắng-trên-trắng.
- **Don't** viết mã màu cứng trong `.tsx`, kể cả `rgba()` trắng/đen — phép đo chỉ soi
  biến CSS nên màu viết cứng lọt lưới (trang 404 từng có tương phản 1,03 vì thế).
- **Don't** thêm nhịp chuyển động thứ hai vào bất cứ đâu.
- **Don't** kéo thư viện chuyển động vào gói tải cho một hiệu ứng.
- **Don't** dựng nhiều thẻ rời có khe khi nhóm ấy đáng là một bảng kẻ ô chia bằng nét
  dùng chung.
- **Don't** viền trái màu dày kiểu callout, chữ gradient, hay lưới thẻ cùng cỡ.
- **Don't** viết hoa chữ NÚT: chữ hoa là giọng của NHÃN.

### Hai vùng CỐ Ý nằm ngoài thế giới này — đừng "sửa" chúng

1. **Các trò chơi trong `public/games/`** giữ bảng màu pastel riêng. Bề mặt app là chế độ
   **Operate** (học sinh làm việc); trò chơi là chế độ **Chơi**, và một trò chơi có thế
   giới riêng là **lựa chọn thiết kế, không phải lỗi đồng bộ** — chủ dự án chốt ngày
   09/09/2026. Riêng **"Rắn và Thang"** làm theo một tấm áp phích do chính chủ dự án gửi,
   và `npm run kiem-tra:ran-thang` đang canh đúng bảng màu ấy; đổi nó là xoá việc đã
   duyệt. Thứ **PHẢI** thuộc thế giới nhãn là **chỗ tiếp giáp**: thẻ chọn trò
   (`2px solid var(--chu-dam)`, nền `--nen-the`) và thanh phủ khung trò chơi
   (`--nen-dam`) — như một cái nhãn dán trên hộp đựng trò chơi.
2. **Bốn tệp tranh vẽ** — `GameArt.tsx`, `doodles.tsx`, `ChemDoodles.tsx`, `Mascot.tsx` —
   được miễn khỏi hệ biến màu và khỏi việc đảo màu theo chế độ. Màu trong đó là nét vẽ
   của hình minh hoạ; đảo theo nền chỉ làm hỏng hình. `scripts/kiem-tra-mau.mts` ghi tên
   bốn tệp này trong danh sách miễn.

### Nợ bản dựng đang mang — KHÔNG phải luật của hệ

Ba chỗ dưới đây có trong mã đang chạy nhưng **không được kế thừa sang màn mới**. Chúng
được ghi ra để người sau biết đó là nợ chứ không phải chuẩn:

- `TextbookViewer.tsx` đặt `fontFamily: '"Georgia", serif'` cho văn bản lý thuyết (3 chỗ)
  và `'"Courier New", monospace'` cho công thức. Đây là **phông hệ điều hành nằm ngoài
  cặp Archivo + IBM Plex Sans**, không phải bậc thứ ba của thang chữ. Cần một giọng đọc
  dài hoặc một giọng mã thì phải chọn phông và khai vào `src/index.css` như hai phông kia.
- Panel trái `LoginPage.tsx` còn `rgba(255,255,255,0.85 / 0.78 / 0.75)` viết thẳng. Bộ đếm
  mã màu cứng chỉ bắt dạng `#rrggbb` nên các giá trị này **không bị đo tương phản**. Đúng
  cách là một biến chữ mờ đặt trên mặt mực (`--chu-tren-nen-dam` đã có sẵn cho đúng việc đó).
- Bộ biểu tượng đang dùng là `lucide-react` — biểu tượng nét kế thừa từ bản dựng cũ, không
  phải bộ ký hiệu của thế giới này. **Bộ ký hiệu của hệ là hình thoi.** Dùng lucide ở nơi
  cần một biểu tượng chức năng thì được, nhưng đừng coi nó là ngôn ngữ hình của hệ và đừng
  mở rộng nó thành một bộ biểu tượng trang trí.
