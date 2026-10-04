# Kế hoạch: chuỗi dự phòng gia sư AI — miễn phí, giấu với học sinh, chạy gần như cũ

## Bối cảnh
Gia sư Chemai gọi `gemini-3.6-flash` qua Firebase AI Logic, bậc miễn phí chỉ **20 lượt/ngày cho mỗi model, tính cho cả dự án**. Hết lượt thì cả trường nhận câu "hết lượt trong ngày" và lời mời dán khoá riêng. Mục tiêu: khi hết lượt, gia sư lặng lẽ chuyển sang nguồn miễn phí khác mà học sinh không nhận ra (không thông báo, cùng giọng "thầy", cùng định dạng, cùng hàng rào sư phạm), còn dữ liệu nghiên cứu vẫn ghi **đúng** model đã trả lời.

Quyết định đã chốt với người dùng: đường A (Gemini hiện tại vẫn đứng đầu, ngày thường không đổi gì); xoay vòng các model Gemini khác ở đầu chuỗi; máy chủ là Cloudflare Pages Function trong repo (chủ dự án chuyển sang deploy bằng `npx wrangler pages deploy dist`); có cả Workers AI và Groq (thêm SambaNova vì miễn phí, chất lượng tốt); đếm lượt theo học sinh bằng D1; gửi lịch sử chat (không tên/email) và bật luôn — người dùng chịu trách nhiệm xin phép chủ nhiệm đề tài.

**Học sinh không phải tạo thêm tài khoản nào.** Groq, SambaNova, Cloudflare (Workers AI, D1) đều do **một người lớn tạo MỘT lần cho cả web**; khoá cất trong Cloudflare Secrets ở máy chủ, học sinh không bao giờ thấy. Học sinh chỉ cần tài khoản web (hoặc vào chế độ khách). Khoá Gemini riêng (T3) vẫn là tuỳ chọn cũ, đứng cuối chuỗi; có chuỗi mới thì gần như không bao giờ phải mời em lấy khoá nữa.

Số đo dùng để thiết kế (01/10/2026):
- Prompt hệ thống socratic khi mở bài: 18,5–20,6 nghìn ký tự ≈ **8–9 nghìn token**; khung iChat chung 38,7 nghìn ký tự ≈ **17 nghìn token** (vì `buildProgramContext` 22 nghìn ký tự). Lịch sử gửi nguyên, không cắt, kể cả bong bóng báo lỗi cũ.
- Gemini Flash-Lite (3.5, 3.1) ~500 lượt/ngày mỗi model (nguồn bên thứ ba — phải kiểm trong AI Studio). Workers AI 10.000 neuron/ngày (~115 lượt với `gemma-4-26b-a4b-it`). SambaNova 20 lượt/ngày/model × ~5 model. Groq 1.000 lượt/ngày nhưng **8K token/phút** → chỉ dùng được với prompt rút gọn, ~1 lượt/phút/model.
- Pages Functions miễn phí: 100k lượt/ngày, **10 ms CPU/lượt**, kéo-thả không chạy Functions.

## Kiến trúc

### Tầng ở trình duyệt (tất cả vẫn đi qua `generateAIResponseChiTiet`)
```
T0 chinh        AI Logic, GEMINI_MODEL_NAME — y hệt hôm nay
T1 xoay-gemini  AI Logic, danh sách GEMINI_XOAY (bỏ qua model đã chết hôm nay)
T2 du-phong     POST /api/gia-su  (chuỗi máy chủ)
T3 key-rieng    khoá riêng của em (đường cũ, thêm xoay model)
T4              câu "hết lượt trong ngày…" cũ → KeyRiengDialog vẫn hiện
```
- Phân loại lỗi bằng hàm thuần `phanLoaiLoiGemini`: hết ngày → đánh dấu chết tới nửa đêm giờ Thái Bình Dương (14:00/15:00 giờ VN) trong localStorage `h11_mo_hinh_het` rồi đi tiếp; hết phút → nghỉ 60 s trong bộ nhớ, đi tiếp (học sinh không còn thấy "chờ một phút"); 404/400 model → chết hôm nay; App Check → dừng, giữ câu "bấm F5"; quá hạn ở T0 → giữ câu cũ.
- Một hạn chót chung 90 s (`HAN_CHO_MS`); tầng sau nhận phần còn lại, bỏ qua nếu < 8 s.
- **Dính nhà cung cấp theo phiên** (sessionStorage, 30 phút như `PHIEN_HET_HAN_MS`) để giọng văn không nhảy giữa chừng; mọi kết quả mang `goiLai(chiThi)` nên lượt sinh lại của bộ chặn rò đi thẳng vào đúng model vừa trả lời.
- Không chèn trễ giả (dự án đã bỏ trễ giả ngày 16/09 vì làm bẩn `latency_ms`).

### Chuỗi ở máy chủ (`/api/gia-su`) — thứ tự khởi điểm, chốt sau bước đánh giá
1. Workers AI `@cf/google/gemma-4-26b-a4b-it` (tắt reasoning), prompt đầy đủ — gần Gemini nhất, không khoá bí mật.
2. SambaNova: DeepSeek-V3.2 → V3.1 → gemma-4-31B-it → gpt-oss-120b, prompt đầy đủ.
3. Workers AI `gemma-sea-lion-v4-27b-it` → `qwen3-30b-a3b-fp8` (cùng quỹ neuron, thêm đa dạng).
4. SambaNova Llama-3.3-70B.
5. Groq gpt-oss-120b → qwen3.8-27b → gpt-oss-20b, **prompt rút gọn**.

Mỗi lượt: POST + Origin hợp lệ + ≤ 64 KB → kiểm **thẻ App Check** và **ID token Firebase** (RS256 bằng WebCrypto, không thêm thư viện; JWKS đệm ≤ 6 h) → kiểm dữ liệu bằng tay → máy chủ tự tính `nhanh` từ email đã xác thực (`nhanhCuaHocSinh`) và chạy lại `xuLyTruocLuot` → D1: tăng đếm nguyên tử (học sinh 40/ngày, khách `TRAN_LUOT_KHACH`/ngày + trần chung khách 50/ngày) và đọc trạng thái hết lượt của nhà cung cấp → `chayChuoi` tối đa 3 lần gọi, có hạn chót; cổng chất lượng (rỗng, quá ngắn, không phải tiếng Việt, chữ Hán, lộ prompt → nhà kế tiếp; thiếu nhãn → thử lại 1 lần nếu còn > 15 s) → ghi trạng thái hết lượt chỉ khi đổi (trong `waitUntil`); không ai trả lời được thì hoàn lượt → trả `{text, maMoHinh, nhaCungCap, banCauLenh, nhanh}`. Mã lỗi khớp các câu thông báo sẵn có. Không ghi nội dung chat ra log.

### Sửa các giới hạn đã nêu
| Giới hạn | Cách sửa |
|---|---|
| Trình duyệt gửi prompt tuỳ ý | Máy chủ tự dựng prompt; trình duyệt chỉ gửi `lessonId`, `tin`, `lichSu`, `sinhLai`, `uuTien` |
| Thẻ App Check bị móc ra dùng lại | Thêm ID token + trần lượt/học sinh trong D1 (lưu HMAC(uid), không lưu uid/email/chat) |
| Học sinh khai gian nhánh thực nghiệm | Máy chủ tự tính `nhanh` từ email trong ID token |
| Model nhỏ quên nhãn ẩn | `NHAC_DINH_DANG` (chỉ định dạng, trung tính giữa hai nhánh) + cổng mềm + `nhan_hong`; không bịa nhãn |
| Groq 8K TPM | Prompt rút gọn riêng ≤ 7.500 token kể cả lịch sử; bỏ dàn bài chương trình; Groq đứng cuối |
| Lịch sử dài + bong bóng lỗi | `locLichSu`: bỏ tin hệ thống (trường mới `he_thong`), bỏ dòng link đề, cắt 20 tin/24k ký tự (rút gọn: 6 tin/600 ký tự) |
| Kéo-thả nuốt mất Functions im lặng | Client đòi `content-type: application/json`; `public/_routes.json` chỉ `/api/*` |
| `kiem-tra:an-ninh` mù `functions/` và khoá Groq | Mở rộng quét + mẫu `gsk_`, `sk-`; `.dev.vars` vào `.gitignore` |
| `model_name` ghi cứng | Ghi đúng model; thêm `nha_cung_cap`, `duong`, `ban_cau_lenh` |
| Kéo `<think>` / LaTeX lệch | `chuanHoaTraLoi`: bỏ `<think>`, đổi `\(..\)`→`$..$` |

## Tệp (≈ 30 tệp — dùng `writing-plans` rồi `subagent-driven-development`)

**Mới, thuần (trình duyệt + máy chủ + script dùng chung)** — `src/features/tutor/services/`:
- `dungCauLenh.ts` — `dungHuongDanHeThong` (đúng chuỗi ghép cũ ở `geminiTutorService.ts:224-235`), `dungHuongDanHeThongGon`, `themNhacDinhDang`.
- `promptGon.ts` — `dungPromptGon(nhanh)`, `NHAC_DINH_DANG`, `NGAN_SACH_GON`; giữ nguyên văn vai, đkc 24,79, luật, IUPAC/KaTeX, bảng ngộ nhận, rào an toàn, các khối nhãn; chỉ rút gọn phần bước dẫn dắt; phần chung giống hệt giữa hai nhánh.
- `danhSachMoHinh.ts` (kiểu `NhaCungCap`, `Duong`, `GEMINI_XOAY` kèm kiểu tư duy: 3.x `thinkingLevel`, 2.5 `thinkingBudget`), `lichSuChoMoHinh.ts` (`locLichSu`, `sangTinOpenAI`, `sangNoiDungGemini`, `uocLuongToken`), `chatLuongTraLoi.ts`, `hetLuotMoHinh.ts` (`ngayTheoMuiGio`, `phanLoaiLoiGemini`, `taoKhoHet`), `hangSoGioiHan.ts` (chuyển `TRAN_LUOT_KHACH` vào đây, `gioiHanChatService` xuất lại).
- `giaSuMayChu.ts` (lấy thẻ App Check + ID token, kể cả app khách `layAppKhach()`), `chuoiDuPhong.ts` (`goiTheoChuoi`, phụ thuộc tiêm được để kiểm).

**Mới, máy chủ** — `functions/api/gia-su.ts`; `functions/_lib/`: `kieuCloudflare.ts` (kiểu tự viết, không thêm `@cloudflare/workers-types`), `xacThucJwt.ts`, `gioiHanD1.ts`, `nhaCungCap.ts`, `chuoiMayChu.ts`. Cấu hình: `wrangler.toml` (binding `AI`, `DB`, `[vars] CHUOI_MAY_CHU`, `NGUON_HOP_LE`; bí mật `GROQ_API_KEY`, `SAMBANOVA_API_KEY`, `MUOI_BAM`), `migrations/0001_gioi_han_va_trang_thai.sql` (bảng `luot_ngay`, `trang_thai_nha_cung_cap`), `public/_routes.json`, `.dev.vars.example`.

**Sửa:** `geminiTutorService.ts` (dùng builder + `goiTheoChuoi`, `KetQuaGiaSu` thêm trường), `giaSuFirebaseAI.ts` (giữ instance App Check, xuất `layTheAppCheck()`, nhận model/tư duy/timeout), `giaSuKeyRieng.ts`, `promptSuPham.ts` (chỉ `export` và tách hằng — chữ không đổi), `lessonContext.ts` (thêm `buildLessonContextGon`), `src/features/auth/types.ts` (`ChatMessage`: `nha_cung_cap`, `duong`, `ban_cau_lenh`, `he_thong`), `AppContext.tsx` (~1395 ghi trường mới; gắn `he_thong` cho tin khoá/hết lượt/lỗi), `telemetryService.ts` (thêm cột CSV ở **cuối**, `ti_le_du_phong`), `scripts/xuat-du-lieu-nghien-cuu.mts`, `.gitignore`, `.env.example`, `package.json` (chỉ thêm script, không thêm gói), `vite.config.ts` (chỉ thêm `server.proxy['/api']` cho dev — không đụng `hmr`/`watch`), `scripts/thu-gia-su-ai.mts` và `scripts/red-team/chay.mts` (cờ `--nha/--mo-hinh/--gon`, dùng `scripts/red-team/van-chuyen.mts` mới).

**Bẫy đã biết:** `kiem-tra-an-ninh.mts:519` bắt chữ `key` gần `logError({` → không viết `'key-rieng'` cạnh `logError`; `kiem-tra-het-luot.mts:132` đọc `TRAN_LUOT_KHACH` bằng regex → trỏ sang tệp mới; `_redirects` trả `index.html` 200 cho `/api` nếu Functions không lên.

## Kỹ năng dùng cho từng bước
Chuỗi kỹ năng sẵn có trong repo đã đủ làm "quy trình liên kết", không cần tải thêm kỹ năng điều phối (kết quả tìm kiếm chỉ ra các kỹ năng điều phối của tác giả lạ, uy tín thấp):
- Lên kế hoạch chi tiết: `writing-plans` → lưu `docs/superpowers/plans/2026-10-01-du-phong-gia-su.md`.
- Thực thi: `subagent-driven-development` (mỗi bước một subagent + rà giữa các bước); bước 2 và 4 có nhiều module thuần độc lập → `dispatching-parallel-agents`.
- Viết phép kiểm trước khi viết hàm: `test-driven-development` (theo lối repo: thêm vào `scripts/kiem-tra-*.mts`).
- Lỗi lạ khi chạy: `systematic-debugging`. Trước khi báo xong mỗi bước: `verification-before-completion`. Cuối đợt: `requesting-code-review` rồi `finishing-a-development-branch`.
- Phần Cloudflare (bước 4, 8): kỹ năng chính thức `wrangler`, `workers-best-practices`, `cloudflare` của `cloudflare/skills` (Apache-2.0, 2.960 sao, cập nhật 01/10/2026). **Người dùng đã đồng ý cài bằng `npx skills add cloudflare/skills`** — chạy ở **bước 0**. Các kỹ năng này tra `developers.cloudflare.com` lúc chạy: dùng curl (đo được 200), vì WebFetch bị chặn trên mạng này. Sau khi cài: đọc lại các tệp vừa thêm, ghi vào `docs/claude-reference/workflow.md` một mục mới (nguồn, giấy phép, lý do ngoại lệ so với tiền lệ loại kỹ năng Vercel "tải hướng dẫn từ URL lúc chạy", ngày cài), và một tệp ghi nguồn kiểu `.claude/skills/CLOUDFLARE-SKILLS-LICENSE.md`. Lưu ý: `npx skills find` trên máy này trả rỗng với mọi từ khoá (kể cả "react"), nên `add` cũng có thể hỏng vì mạng — hỏng thì báo lại người dùng, không tự chép tay.
- `/skill-doctor` (có sẵn trong Claude Code) do người dùng tự gõ để xem kỹ năng nào 7 ngày qua không được gọi; ghi chú: 10 kỹ năng `speckit-*` trùng vai với chuỗi `superpowers`.

## Thứ tự làm
0. Cài kỹ năng Cloudflare (`npx skills add cloudflare/skills`), kiểm tệp đã vào, ghi nguồn/giấy phép; rồi `writing-plans` viết kế hoạch chi tiết từ tài liệu này.
1. Tái cấu trúc không đổi hành vi: `dungCauLenh` + phép kiểm trùng khớp, tách hằng `promptSuPham`, `hangSoGioiHan`, `modelName` thật. Cổng: `npm run lint` + `npm run kiem-tra` xanh.
2. Các module thuần + `scripts/kiem-tra-du-phong.mts` (lệnh `kiem-tra:du-phong`, nối vào `kiem-tra`).
3. T1 xoay Gemini + localStorage + trường telemetry — **tự đứng được, deploy kéo-thả vẫn chạy**, mang lại phần lớn sức chứa (~1.000 lượt/ngày).
4. Máy chủ: kiểu, JWT, D1, adapter, chuỗi, route, toml, migration, `_routes.json`.
5. T2 + dính phiên + `sinhLai` theo đúng tầng + xoay model ở T3.
6. Đánh giá từng model, chốt `CHUOI_MAY_CHU`, ghi `docs/danh-gia-nha-cung-cap.md`.
7. Cập nhật tài liệu (sau khi tệp đã tồn tại, vì `kiem-tra:tai-lieu`): `CLAUDE.md:41`, `docs/claude-reference/project.md`, `deployment.md`, `security.md`, `data.md`, `.specify/memory/constitution.md` (lên 1.1.0 + lý do), `PRODUCT.md`, báo cáo NCKH (dòng 225; từ 04/10/2026 báo cáo không còn trong repo) (công khai model dự phòng, tỉ lệ lượt dự phòng theo nhánh, phân tích chỉ-T0).
8. Chủ dự án deploy và nghiệm thu.

## Phép kiểm (thêm vào bộ sẵn có, không thêm khung test)
- `kiem-tra-thuc-nghiem`: `dungHuongDanHeThong` === bản ghép cũ đóng băng cho 25 bài + global × 2 nhánh × `chiDanGianGiao(0..4)` × có/không `CHI_THI_SINH_LAI`; snapshot socratic vẫn khớp; prompt gọn đủ 18 mảnh bắt buộc, phần chung giống nhau giữa hai nhánh, ngân sách token.
- `kiem-tra-het-luot`: `phanLoaiLoiGemini` với chuỗi lỗi thật; `ngayTheoMuiGio` quanh mốc 07:00/08:00 UTC; kho hết lượt; câu cuối vẫn khớp regex của dialog.
- `kiem-tra-du-phong` (mới): đổi tin nhắn, chuẩn hoá + cổng chất lượng, JWT ký bằng khoá RSA sinh tại chỗ (đúng/sai iss, aud, sub, hạn, `alg`, chữ ký, kid lạ), phân loại lỗi Groq/SambaNova/Workers AI, `chayChuoi` với adapter giả và đồng hồ tiêm, đo CPU thô.
- `kiem-tra-an-ninh`: quét `functions/`, mẫu khoá mới, `.dev.vars`, `[vars]` không chứa khoá, `functions/` không log nội dung, route gọi `xacThucAppCheck(` và `xacThucIdToken(` trước `chayChuoi(`.
- `kiem-tra-gemini`: ListModels xác nhận mọi tên trong `GEMINI_XOAY` (không tốn lượt sinh).

## Đánh giá trước khi tin một model (bước 6)
`red-team/chay.mts` + `thu-gia-su-ai.mts` qua `van-chuyen.mts` (cùng pipeline production), đếm trước lượt theo hạn mức từng nhà. Cổng cứng: không rò đáp số sau bộ chặn và tỉ lệ rò thô ≤ Gemini; đủ nhãn ≥ 90 %; `thu:ai` ≥ 80 % điểm của T0; 0 chữ Hán, 0 lộ phần suy nghĩ. Qua cổng thì xếp theo chất lượng → sức chứa → độ trễ; Groq luôn cuối. Giáo viên xem tay 10 câu mỗi model.

## Việc chỉ chủ dự án / chủ nhiệm làm
1. Quyết: điều khoản Gemini API 18+ và cấm ứng dụng hướng tới người dưới 18 (web hiện tại cũng vướng); chuyển dữ liệu chat của trẻ vị thành niên ra nước ngoài (Nghị định 13/2023) và giấy đồng ý; trả lời thế nào khi em hỏi "em đang nói chuyện với AI nào".
2. Người lớn tạo tài khoản Groq và SambaNova (không gắn thẻ), đọc chính sách dữ liệu, lấy khoá.
3. `npx wrangler@4 login` → `npx wrangler d1 create giasuhoa11-gioi-han` → dán `database_id` vào `wrangler.toml` → `npx wrangler d1 migrations apply giasuhoa11-gioi-han --remote`.
4. `npx wrangler pages secret put GROQ_API_KEY --project-name giasuhoa11` (tương tự `SAMBANOVA_API_KEY`, `MUOI_BAM`).
5. Từ nay: `npm run build` rồi `npx wrangler pages deploy dist --project-name giasuhoa11 --branch main`. **Không kéo-thả nữa.**
6. Kiểm trong AI Studio hạn mức thật của từng model trong `GEMINI_XOAY`.

## Nghiệm thu
- Máy: `npm run lint`, `npm run kiem-tra`; `npx wrangler pages dev dist` với `.dev.vars` + `npm run dev` (proxy `/api`, debug token App Check). Ép từng tầng bằng cách ghi tay localStorage đánh dấu mọi Gemini đã chết → câu trả lời không khác biệt thấy được (nhãn đã gỡ, KaTeX hiện đúng), `chats` có đúng `model_name`/`duong`/`nha_cung_cap`; sinh lại trúng đúng nhà; vượt trần khách hiện câu cũ + dialog; không thẻ / thẻ giả → 401; thân > 64 KB → 413.
- Sau deploy: `curl -X POST https://giasuhoa11.pages.dev/api/gia-su` không thẻ → 401 JSON (không phải HTML); CSP vẫn đủ; `npx wrangler pages deployment tail` không có nội dung chat; CPU p99 ≪ 10 ms, không lỗi 1102; D1 ít dòng.

## Rủi ro còn lại
- 10 ms CPU: phải đo trên máy thật; nếu sát trần thì dựng sẵn ngữ cảnh bài lúc build.
- Model ngoài Gemini vẫn có thể lệch giọng/nhãn — dính phiên và chuẩn hoá chỉ giảm, không xoá hẳn.
- Hạn mức và tên model miễn phí đổi không báo trước — chạy lại đánh giá hằng tháng.
- Tỉ lệ lượt dự phòng có thể khác giữa hai nhánh thực nghiệm — báo cáo theo nhánh và phân tích chỉ-T0.
