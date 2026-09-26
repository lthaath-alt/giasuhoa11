# Tài liệu theo chủ đề — chemistry

> Trích nguyên văn từ CLAUDE.md người dùng cung cấp. Quy tắc/giới hạn vẫn có hiệu lực; số đo và trạng thái dịch vụ là ghi nhận lịch sử, chưa được xác minh lại. Chỉ đọc phần liên quan.

**Tra mục:** [INDEX.md](INDEX.md). **Đọc chéo khi liên quan:** [data.md](data.md), [security.md](security.md), [deployment.md](deployment.md), [testing.md](testing.md).

Các đường dẫn code trong nội dung gốc tính từ gốc repo. Cụm “mục bên dưới”, “tệp này” hoặc tên mục không kèm file là tham chiếu của bản gốc: dùng INDEX.md để tìm đúng tài liệu mới.

**Ghi chú đối chiếu:** Mốc thay đổi đăng nhập, quota, model và cách tính lượt là ghi nhận gốc, không được xác minh lại trong lần tách này. “Không tốn lượt” của đường dẫn tay không chứng minh mọi gói/dịch vụ đều miễn phí hoặc không giới hạn. Giữ bước người dùng quyết định và tự ghi dữ liệu thật; không tự động hóa vượt quy trình.

---

## Nhờ Gemini soi nội dung hoá học (`npm run soat:hoa-hoc`)

Thêm 20/09/2026. Đưa câu hỏi cho Gemini đọc và nêu chỗ nghi sai. Sinh ra vì
tính đúng đắn hoá học là thứ quan trọng nhất của đề tài, mà 1554 câu thì không
ai đọc tay hết. Lượt chạy đầu tiên đã tìm ra ba câu mà đề ghi `H₂O (l)` nhưng
lời giải vẫn đưa [H₂O] vào biểu thức Kc.

```bash
npm run soat:hoa-hoc -- --bai bai-1              # một bài, vừa hạn mức ngày
npm run soat:hoa-hoc -- --chuong 1 --xem         # chỉ xem kế hoạch, không gọi
npm run soat:hoa-hoc -- --bai bai-1 --ra bao-cao.md
```

**Bốn điều cố ý, đừng sửa thành khác:**

1. **Script KHÔNG sửa gì.** Chỉ in danh sách câu đáng xem lại. Một mô hình nói
   "câu này sai" KHÔNG phải bằng chứng câu đó sai — phải tự kiểm rồi mới sửa,
   và sửa trên Firestore chứ không sửa bản chụp trong repo.
2. **Chỉ gửi đi NỘI DUNG CÂU HỎI.** Không email, không tên học sinh, không tiến
   độ, không gì từ `users`. Đây là luật chung cho mọi lần nhờ mô hình ngoài đọc
   dữ liệu dự án: cái gì gửi đi là rời khỏi máy vĩnh viễn.
3. **Đọc bản chụp `public/bank/ngan-hang.json`**, không đọc Firestore — giống
   mọi thứ chạy ngoài trình duyệt. Muốn soát bản mới nhất thì `xuat:ngan-hang`
   trước.
4. **Tự dừng khi vượt 20 lượt/ngày.** Bậc miễn phí cho 5 lượt/phút và 20
   lượt/NGÀY cho từng model; soát cả kho tốn 63 lượt. Script tính trước rồi
   dừng kèm cách chia nhỏ, thay vì chạy một phần ba rồi chết.

Có hai cờ `--qua`: `cli` (mặc định, qua `gemini` CLI) và `key` (qua
`@google/genai`). **Cả hai nay đều đi bằng khoá API.**

**Gói Gemini Pro/Ultra KHÔNG dùng cho CLI được nữa.** Google chấm dứt đăng nhập
bằng tài khoản cá nhân cho Gemini CLI và Code Assist từ **18/06/2026**, áp dụng
cho cả bậc miễn phí lẫn Google AI Pro và Ultra. Chuỗi `LOGIN_WITH_GOOGLE` vẫn
còn trong gói cài nên nhìn tưởng dùng được — nhưng máy chủ từ chối. Gói trả phí
của cá nhân nay chỉ còn dùng được ở gemini.google.com và ở Antigravity.

Nên CLI chỉ còn **hai** đường: khoá API (bậc miễn phí 20 lượt/ngày, hoặc trả
tiền theo token nếu bật thanh toán), và giấy phép doanh nghiệp. Kiểm bằng
`security.auth.selectedType` trong `~/.gemini/settings.json`.

**Muốn soát cả kho trong một lượt thì phải bật thanh toán** cho dự án Google
Cloud đang giữ API key. Đo 20/09/2026: cả 1554 câu là **369.813 token vào**
(853.563 ký tự, 2,31 ký tự/token). Đơn giá KHÔNG ghi ở đây — giá đổi theo thời
gian, tra bảng giá hiện hành rồi nhân với con số trên. Cùng lý do mà
`do-chi-phi.mts` cũng không ghi cứng đơn giá.

Ba chi tiết kỹ thuật của đường `cli` (`-p` nối vào stdin, `--approval-mode
plan` = chỉ đọc, và `shell: true` trên Windows không tự bọc nháy) nằm trong
chú thích của chính hàm `goiQuaCli` — đọc ở đó, đúng lúc cần sửa.

**Báo cáo luôn ghi ra `docs/soat-hoa-hoc/<ngày>-<phạm vi>.md`** và theo git.
Đó là vết của quy trình kiểm định nội dung — thứ hội đồng NCKH hỏi tới, và là
cách đối chiếu lần soát sau với lần trước.

### Hai đường soát, dùng xen kẽ

| | Tốn gì | Ai bấm |
|---|---|---|
| **A. Gọi thẳng** `--bai bai-1` | hạn mức miễn phí, 20 lượt/ngày | AI tự chạy |
| **B. Dẫn tay qua Antigravity** `--xuat-de-dan` → `--nap` | KHÔNG tốn lượt nào | chủ dự án mở Antigravity |

Đường B có vì gói Gemini trả phí của cá nhân **vẫn dùng được trong
Antigravity**, chỉ không dùng được qua CLI hay API key. Script ghi một tệp đề
dẫn vào `docs/soat-hoa-hoc/de-dan-*.md`; repo nằm sẵn trong workspace của
Antigravity nên không phải dán gì — chỉ cần bảo nó đọc tệp đó rồi ghi kết quả
ra JSON. `--nap` chịu được tệp có rào ```json và có lời dẫn thừa.

Đường B cũng phải theo luật "một lượt là không đủ": bảo Antigravity soát
HAI lần ra hai tệp, rồi `--nap a.json,b.json` (ngăn bằng dấu phẩy, không có
dấu cách). Báo cáo ghi `k/2 lượt cùng nêu` y như đường A. Tệp đề dẫn tự sinh
ra sẵn hai tên tệp và cả dòng lệnh nạp.

**`--nap` tính phạm vi từ cờ lọc gõ LÚC NẠP** (`--bai`, `--loai`…), không đọc
từ đề dẫn. 26/09/2026 nạp 107 câu mc Bài 2 bằng lệnh thiếu cờ, báo cáo ra
mang đuôi tên "tat-ca" và ghi "Soát 1554 câu" — vết kiểm định sai (đã xoá). Nay đề dẫn in lệnh nạp
kèm đủ cờ, và `--nap` đối chiếu id với đề dẫn cùng tên: lệch (thiếu cờ, sai
cờ, hay bản chụp đổi sau lúc xuất) thì dừng, không ghi báo cáo; tệp trả lời
nêu id ngoài phạm vi cũng dừng. Đề dẫn xuất trước ngày đó vẫn in lệnh thiếu
cờ: tự thêm cờ, ví dụ `--bai bai-2 --loai tf`.

Ngày làm việc điển hình: hết 20 lượt miễn phí thì chuyển sang đường B, hôm sau
lại có 20 lượt mới.

### MỘT LƯỢT SOÁT LÀ KHÔNG ĐỦ — đo được, không phải phỏng đoán

Cùng 16 câu, cùng `temperature: 0`, chạy ba lượt cho ra **3, 3, rồi 0** câu nghi
ngờ. Ba câu bị bỏ sót ở lượt thứ ba là lỗi THẬT (đề ghi `H₂O (l)` nhưng lời giải
vẫn đưa [H₂O] vào biểu thức Kc — đã kiểm tay). Nên:

- Mặc định `--lan 2`: mỗi lô soát hai lượt, lấy HỢP của hai kết quả.
- Báo cáo ghi **`k/N lượt cùng nêu`** cho từng câu. Con số đó đáng tin hơn cái
  nhãn `tin` do chính mô hình tự chấm.
- **Đừng kết luận "bài này sạch"** sau một lượt. Nhiều nhất chỉ nói được là
  "lượt này không thấy gì".

**Hai lượt chữa được sót NGẪU NHIÊN, KHÔNG chữa được sót HỆ THỐNG** (đo
20/09/2026). Phép đối chứng mù: xuất đề dẫn Bài 1 — 154 câu, trong đó có **ba
câu đã kiểm tay và biết chắc là sai** (ba câu Kc ghi `H₂O (l)` nhưng lời giải
vẫn đưa [H₂O] vào biểu thức). Mô hình không được mách câu nào.

| Lượt | Bắt được |
|---|---|
| API `gemini-3.6-flash`, lượt 1 và 2 (15:27) | `04avv`, `frynt` — **2/3** |
| Antigravity, lượt 1 (23:18) | `04avv`, `frynt` — **2/3** |
| Antigravity, lượt 2 (23:29) | `04avv`, `frynt` — **2/3** |

Bốn lượt, hai đường khác nhau, **cùng sót đúng một câu**: `bq_1789371866328_eg7es`.
Đó là câu đúng/sai mà bốn ý đều đúng sẵn, chỉ phần đề mang kí hiệu trạng thái
sai — tức lỗi kín nhất trong ba câu. Người tìm ra nó là người, không phải máy.

Ba điều rút ra:

1. **Đường dẫn tay qua Antigravity CHẠY THẬT** ở cỡ ~95.000 ký tự / 154 câu. Nó
   không "giả vờ đọc rồi trả mảng rỗng".
2. **Tỉ lệ bắt khoảng 2/3 ngay trên lỗi đã biết chắc.** Con số đó là trần chứ
   không phải sàn — lỗi trong kho còn kín hơn ba câu này.
3. **`0 nghi ngờ` KHÔNG bằng `sạch`.** Nếu cái sót là sót hệ thống thì chạy bao
   nhiêu lượt cũng ra cùng một kết quả, và con số `k/N lượt cùng nêu` không hề
   cảnh báo điều đó. Soát máy là cái lưới thưa, không phải phép nghiệm thu.

### Quy trình soát — năm bước, chủ dự án chốt ở bước 3 và 4

Chốt ngày 20/09/2026. Cố ý KHÔNG tự động hoá trọn gói:

1. **Chủ dự án nêu phạm vi** ("soát chương 2"). Không tự chạy cả kho.
2. **AI chạy** `npm run soat:hoa-hoc -- --chuong 2`, rồi **tự kiểm chứng từng
   chỗ Gemini nêu** bằng cách mở đúng câu đó trong ngân hàng và tính lại. Chỗ
   nào Gemini nói sai thì loại, và **nói rõ là đã loại** — đừng chuyển tiếp
   nguyên si. Lượt chạy đầu tiên đã có ví dụ: Gemini chẩn đúng bệnh nhưng
   đề nghị cách sửa sai.
3. **Chủ dự án quyết** sửa thế nào. Một câu sai thường có hơn một cách chữa,
   và chọn cách nào là việc của người dạy.
4. **Chủ dự án tự sửa trên Firestore**, bằng Console hoặc bằng
   `npm run sua:cau-hoi` (xem ngay dưới). Không có script nào sửa ngân hàng
   theo ý mình — đó là dữ liệu thật của 1554 câu, một lỗi trong script là hỏng
   hàng loạt.
5. **Đồng bộ lại:** `npm run xuat:ngan-hang` rồi `npm run gan:cau-hoi`, để bản
   chụp trong repo khớp Firestore. Quên bước này thì lần soát sau đọc bản cũ.

### `npm run sua:cau-hoi` — sửa vài câu theo phiếu, KHÔNG phải sửa hàng loạt

Thêm 20/09/2026, vì dán tay công thức hoá học vào Firebase Console rất dễ gõ
lệch một ký tự mà không ai phát hiện. Nó KHÔNG mâu thuẫn với điều 4 ở trên:
thứ điều 4 cấm là một script tự quyết định sửa gì.

```bash
npm run sua:cau-hoi -- docs/soat-hoa-hoc/sua-3-cau-Kc.json          # chạy thử
npm run sua:cau-hoi -- docs/soat-hoa-hoc/sua-3-cau-Kc.json --that   # ghi thật
```

Năm cái trói, **đừng nới cái nào mà không hỏi chủ dự án**:

1. **Không tự biết phải sửa gì** — mọi thứ nằm trong một *phiếu sửa* JSON theo
   git, do người soạn sau khi đã kiểm tay.
2. **Chỉ ghi trường trong danh sách trắng**: `q`, và từ 26/09/2026 `st` (chủ
   dự án duyệt, cho câu `bdr93` có ý đúng/sai viết mơ hồ). `a`/`num`/`tol` là
   ĐÁP ÁN — sửa nhầm là cả lớp bị chấm sai mà điểm vẫn trông hợp lý. `st` chứa
   cả chữ lẫn đáp án `v` của từng ý nên bị trói chặt hơn: phiếu phải có `y`
   (số thứ tự ý, 0–3), chỉ đổi chữ `s` của đúng ý đó; script tự kiểm số ý, mọi
   `v` và chữ các ý khác giữ nguyên, trước khi ghi và lúc đọc lại. Mẫu:
   `docs/soat-hoa-hoc/sua-1-cau-bdr93.json`.
3. **Điều kiện tiên quyết khớp từng ký tự**: giá trị trên Firestore phải bằng
   đúng `cuPhaiLa`. Nhờ vậy chạy lại lần hai không làm gì, và phiếu soạn từ bản
   chụp cũ không đè mất thứ người khác vừa sửa.
4. **Mặc định KHÔNG ghi.** Chạy thử không cần đăng nhập (`bank_questions` đọc
   công khai), nên xem được sẽ đổi gì trước khi quyết định gõ mật khẩu.
5. **`updateDoc`, không `setDoc`; không tạo, không xoá.** `setDoc` thay cả tài
   liệu, tức mọi trường không nhắc tới sẽ biến mất.

Ghi xong nó tự đọc lại từ Firestore để xác nhận — bài học số 1, đừng tin dòng
chữ "xong" của chính script mình viết. Rồi nhắc chạy `xuat:ngan-hang` +
`gan:cau-hoi`.

**Tài khoản để ghi: `GIAO_VIEN_EMAIL` + `GIAO_VIEN_MATKHAU` trong `.env.local`**
(20/09/2026), cùng lối với `E2E_EMAIL`/`E2E_MATKHAU`; `.gitignore` chặn `.env*`.
Bỏ trống thì script hỏi ngay tại máy, hiện dấu sao. Dù đường nào cũng **KHÔNG
nhận mật khẩu qua tham số dòng lệnh** — dòng lệnh nằm trong lịch sử shell và
trong danh sách tiến trình của cả máy. Chung module `scripts/hoi-ban-phim.mts`
với `liet-ke:tai-khoan`.

Tài khoản đó chỉ cần vai **`teacher`**. **Đừng dùng `admin`:** ghi
`bank_questions` không cần tới nó, mà một tài khoản quản trị nằm trong tệp trên
đĩa thì mở thêm cả `users` nếu máy bị lộ — và việc đặt/đổi vai vốn đã ghim vào
`laChuDuAn()` nên `admin` cũng không mở thêm được gì hữu ích. Script in VAI ra
ngay sau khi đăng nhập, dừng luôn nếu là `student`, và nhắc nếu là quản trị.

Phạm vi sẽ mở rộng dần: ngân hàng câu hỏi trước, rồi nội dung 25 bài giảng, rồi
đề cương NCKH. **Câu trả lời của gia sư AI để CUỐI CÙNG** và phải lọc sạch
email/tên học sinh trước khi gửi đi — xem điều 2 ở trên.

### `npm run kiem-tra:gemini` — canh chừng Google đổi nền dưới chân

Nằm trong chuỗi `npm run kiem-tra`, nên chạy trước mỗi commit. Sinh ra vì trong
MỘT buổi ngày 20/09/2026, Google làm hỏng giả định của dự án hai lần mà không
có gì báo — và cả hai đều thuộc loại không làm đỏ `tsc`, không làm hỏng build.

Nó canh bảy thứ: `gemini` còn gọi được; còn các cờ `--approval-mode`,
`--prompt`, `--model`; còn chế độ `plan` (chỉ đọc); `-p` còn được nối vào
stdin; `selectedType` còn đọc được; `.env` không mọc lại khoá giữ chỗ; và model
trong `GEMINI_MODEL_NAME` còn được Google cấp (hỏi ListModels — **không tốn lượt
nào** trong 20 lượt/ngày).

**Máy không có Gemini CLI thì BỎ QUA phần CLI**, không báo hỏng — chuỗi
`kiem-tra` phải chạy được trên CI và trên máy vừa clone. Cùng lối với
`kiem-tra:luat` khi thiếu Java. Thiếu `.env.local` cũng bỏ qua.

`oauth-personal` bị tính là **SAI**, không phải tin vui: đăng nhập bằng tài
khoản Google vẫn lọt nhưng mọi lượt gọi bị chặn bằng `IneligibleTierError`.
Chữa: chạy `gemini`, gõ `/auth`, chọn *Use Gemini API key*. `soat:hoa-hoc` tự
lùi về khoá API nên vẫn chạy được, chỉ là đường CLI chết.

Antigravity chỉ được **ghi nhận**, không tính là hỏng: `agentapi` là API nội bộ
không tài liệu (và nó đòi `ANTIGRAVITY_LS_ADDRESS` do chính app đặt, nên gọi từ
ngoài không được). Dự án CỐ Ý không xây gì lên nó.

**Một cái bẫy đã gỡ:** `gemini` gõ trần trong thư mục dự án từng báo
`API key not valid`. Không phải khoá hỏng — Gemini CLI đọc tệp `.env`, mà ở đó
`GEMINI_API_KEY` là chuỗi giữ chỗ. Nay dòng đó đã bỏ khỏi `.env`; khoá thật chỉ
nằm ở `.env.local`. Đừng khai lại nó vào `.env`.

Xem tài khoản đang có — `npm run liet-ke:tai-khoan`. CHỈ ĐỌC, không ghi gì
Firestore. Phải đăng nhập bằng vai giáo viên trở lên, vì luật chặn `list` trên
`users`; mật khẩu hỏi ngay tại máy, hiện dấu sao, KHÔNG nhận qua tham số dòng
lệnh và không lưu ở đâu. Bốn cờ ghép được với nhau:

| Cờ | Làm gì |
|---|---|
| `--tim <chữ>` | lọc theo email / tên / tên đăng nhập / uid |
| `--vai <vai>` | chỉ một nhóm |
| `--gon` | mỗi tài khoản một dòng, dạng bảng |
| `--csv <tệp>` | xuất ra tệp mở bằng Excel |

Hai điều cố ý, đừng "sửa" thành khác: bộ lọc KHÔNG đụng tới các cảnh báo ở
cuối (hồ sơ mồ côi, đồng quản trị còn vai `student`) — chúng luôn tính trên
TOÀN BỘ, vì một cảnh báo bị bộ lọc giấu đi là cảnh báo vô dụng. Và tệp CSV có
dấu BOM ở đầu, thiếu nó thì Excel trên Windows đọc UTF-8 thành ký tự rác.

Tệp CSV xuất ra **chứa email học sinh** — xem xong thì xoá, đừng commit.

Đây là lời giải đã chốt cho nhu cầu "bí với đống tài khoản thử". Kho mật khẩu
cho quản trị là **KHÔNG LÀM** — xem điều 3 mục Auth, và bốn phép kiểm canh
cho kiểu `User` không bao giờ có lại trường mật khẩu.

