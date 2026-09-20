# Ba việc chốt ngày 20/09/2026 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (repo này không dùng subagent tự quản nhánh — xem CLAUDE.md). Steps dùng checkbox `- [ ]`.

**Goal:** (4) Khách vãng lai còn 5 lượt thay vì 25; (2A) Luyện tập có lối sang trò chơi của đúng bài; (2B) Bị khoá 15 phút thì chơi xong một màn là mở lại lượt; (5) Học sinh tự nhập API key của mình, và khi cả web hết hạn mức thì hướng dẫn + động viên các em tự lấy key.

**Architecture:** Cả ba việc bám vào thứ đã có. Trần lượt khách là một hằng số ở `gioiHanChatService.ts` nhưng đang bị chép cứng số 25 ra 6 chỗ giao diện — sửa hằng số rồi bắt mọi chỗ dùng hằng số đó. Trò chơi đã gửi tiến độ về web qua `postMessage` và web ghi vào `progress.troChoi`, nên chỉ cần thêm dấu thời gian để biết em chơi TRƯỚC hay SAU khi bị khoá. Key riêng: giữ nguyên đường Firebase AI Logic làm mặc định, chỉ thêm một đường dự phòng gọi thẳng Gemini bằng key em tự nhập, cất trong `localStorage` của chính máy em.

**Tech Stack:** React 19 + TypeScript, Firebase AI Logic, `@google/genai` (đã là dependency), bộ kiểm tự viết bằng `tsx`.

**Spec:** Chủ dự án chốt trong phiên ngày 20/09/2026: "mục số 2 chọn A+B, mục 4 siết lại theo đề nghị, mục số 5 chọn hướng 1 — mỗi học sinh tự lấy API và lúc hết hạn mức hãy hướng dẫn lấy và động viên các em".

## Global Constraints

- KHÔNG tự `npm run build`, push, deploy, publish luật — chủ dự án làm.
- **Key của học sinh KHÔNG bao giờ rời khỏi máy em**: chỉ `localStorage`, không ghi Firestore, không gửi telemetry, không in ra `console`, không vào nhật ký lỗi. `errorLog.ts` đã cố ý chỉ lưu bản rút gọn — giữ như vậy.
- Không đặt key vào `VITE_*` và không viết key vào mã: `kiem-tra:an-ninh` bắt điều đó, và phải tiếp tục ĐẠT.
- CSP hiện cho `connect-src https://*.googleapis.com`, nên gọi thẳng `generativelanguage.googleapis.com` không phải sửa `public/_headers`.
- Mỗi luật mới phải có phép kiểm tự động; sau khi thêm, cố tình phá một lần để chứng minh phép kiểm biết kêu.
- `npm run lint` + `npm run kiem-tra` phải sạch trước khi báo xong.

## File Structure

| Tệp | Việc |
|---|---|
| `src/features/tutor/services/gioiHanChatService.ts` | `TRAN_LUOT_KHACH` 25 → 5 |
| `src/pages/DashboardPage.tsx`, `src/pages/LoginPage.tsx`, `src/features/tutor/components/TutorChat.tsx` | bỏ số 25 chép cứng, dùng hằng số |
| `scripts/kiem-tra-het-luot.mts` | phép kiểm: giao diện không chép cứng trần lượt; thông báo hết hạn mức có hướng dẫn lấy key |
| `src/features/auth/types.ts` | `troChoi` thêm `luc` (mốc thời gian chơi xong) |
| `src/core/contexts/AppContext.tsx` | ghi `luc` khi nhận tiến độ trò chơi |
| `src/features/practice/components/OnBangTroChoi.tsx` (tạo) | khối "Chơi để ôn bài này" + luật mở khoá bằng trò chơi |
| `src/features/practice/PracticeSection.tsx`, `components/ReviewGate.tsx` | gắn khối trên vào Luyện tập và màn khoá |
| `src/features/tutor/services/keyRieng.ts` (tạo) | đọc/ghi/xoá key trong localStorage, kiểm dạng key |
| `src/features/tutor/services/giaSuKeyRieng.ts` (tạo) | gọi Gemini bằng key của em |
| `src/features/tutor/services/geminiTutorService.ts` | hết hạn mức → thử key riêng; thông báo mới |
| `src/features/tutor/components/KeyRiengDialog.tsx` (tạo) | hộp thoại hướng dẫn lấy key, có lời động viên |
| `scripts/kiem-tra-an-ninh.mts` | phép kiểm: key riêng không bị ghi ra Firestore/log |
| `CLAUDE.md` | ghi ba thay đổi này |

---

### Task 1: Khách vãng lai còn 5 lượt

**Files:**
- Modify: `src/features/tutor/services/gioiHanChatService.ts:31`
- Modify: `src/pages/DashboardPage.tsx:135,725,727`, `src/pages/LoginPage.tsx:380`, `src/features/tutor/components/TutorChat.tsx:199,287`
- Test: `scripts/kiem-tra-het-luot.mts`

**Interfaces:**
- Produces: `TRAN_LUOT_KHACH = 5` — mọi nơi hiển thị trần lượt phải đọc hằng số này.

- [ ] **Step 1: Viết phép kiểm trước** — thêm vào cuối `kiem-tra-het-luot.mts`:

```ts
console.log('\n== Trần lượt khách chỉ khai MỘT chỗ ==');
{
  const { TRAN_LUOT_KHACH } = await import('../src/features/tutor/services/gioiHanChatService');
  ok(TRAN_LUOT_KHACH === 5, 'trần lượt khách là 5', String(TRAN_LUOT_KHACH));
  const tep = ['src/pages/DashboardPage.tsx', 'src/pages/LoginPage.tsx',
               'src/features/tutor/components/TutorChat.tsx'];
  for (const t of tep) {
    const ma = readFileSync(t, 'utf8');
    /* Bắt "25 câu hỏi", "25 lượt", "/25" — số chép cứng thì đổi hằng số xong
       giao diện vẫn nói số cũ, và không ai thấy cho tới khi học sinh kêu. */
    const chepCung = ma.match(/\b\d+\s*(câu hỏi|lượt (chat|hỏi))|\/\s*\d+\s*câu hỏi/g) || [];
    ok(chepCung.length === 0, `${t}: không chép cứng số lượt`, chepCung.join(' | '));
  }
}
```

- [ ] **Step 2: Chạy, phải HỎNG** — `npm run kiem-tra:het-luot`, cả 4 phép mới đều hỏng.
- [ ] **Step 3: Đổi hằng số** — `export const TRAN_LUOT_KHACH = 5;` kèm chú thích:

```ts
/* 5 chứ không phải 25 (20/09/2026): khách dùng CHUNG hạn mức Gemini theo ngày
   với học sinh. Ngày 18/09/2026 cả web hết lượt giữa buổi, học sinh không hỏi
   được nữa. Khách chỉ cần đủ để xem thử; lớp mới là người phải được ưu tiên. */
export const TRAN_LUOT_KHACH = 5;
```

- [ ] **Step 4: Sửa 6 chỗ giao diện** — import `TRAN_LUOT_KHACH` và thay:
  - `DashboardPage.tsx:135`: `còn ${Math.max(0, TRAN_LUOT_KHACH - guestChatCount)}/${TRAN_LUOT_KHACH} câu hỏi thử`
  - `DashboardPage.tsx:725`: `Em đã dùng hết {TRAN_LUOT_KHACH} lượt hỏi thử miễn phí.`
  - `DashboardPage.tsx:727`: `{guestRemainingCount}/{TRAN_LUOT_KHACH}`
  - `DashboardPage.tsx:874`: câu giới thiệu "tối đa 25 câu hỏi" → dùng hằng số
  - `LoginPage.tsx:380`: `*Bản dùng thử miễn phí giới hạn tối đa {TRAN_LUOT_KHACH} câu hỏi với Gia sư AI.`
  - `TutorChat.tsx:199,287`: như trên
- [ ] **Step 5: Chạy lại, phải ĐẠT**; rồi `npm run lint`.
- [ ] **Step 6: Phá thử** — chép tạm số `5` vào một chuỗi trong `LoginPage.tsx`, chạy lại, phép kiểm phải HỎNG; trả lại.

### Task 2A: Lối từ Luyện tập sang trò chơi của đúng bài

**Files:**
- Create: `src/features/practice/components/OnBangTroChoi.tsx`
- Modify: `src/features/practice/PracticeSection.tsx`

**Interfaces:**
- Produces: `<OnBangTroChoi bai={bai} daChoiSauKhoa={boolean} onMoKhoa={() => void} />`; và `troChoiCuaBai(lessonId): { id: string; ten: string; man?: number } | null`.

- [ ] **Step 1: Xác định trò chơi ứng với bài** — `public/games/ran-va-thang.html` có 25 màn ứng 25 bài; `tham-tu-hoa-chat` gắn Bài 2; `giai-cuu-phong-thi-nghiem` gắn chương Nitrogen–Sulfur. Viết bảng tra trong `OnBangTroChoi.tsx`:

```ts
/** Trò chơi ôn được cho từng bài. Rắn và Thang có 25 màn ứng đúng 25 bài nên
 *  dùng làm mặc định; hai trò kia chỉ gắn với phần nội dung của chúng. */
export function troChoiCuaBai(lessonId: string, chiSoBai: number) {
  if (lessonId === 'bai-2') return { id: 'tham-tu-hoa-chat', ten: 'Thám Tử Hóa Chất' };
  return { id: 'ran-va-thang', ten: 'Rắn và Thang', man: chiSoBai + 1 };
}
```

- [ ] **Step 2: Kiểm xem trò chơi có nhận tham số màn qua URL không** — đọc `public/games/ran-va-thang.html`, tìm chỗ chọn màn.
  - Nếu CÓ chỗ móc sạch: thêm đọc `?bai=N` cạnh chỗ đã đọc `?theme=` (dòng 76) và mở đúng màn đó.
  - Nếu KHÔNG: **không sửa tệp trò chơi** (32.000 dòng, script nội tuyến, sửa là phải băm lại CSP). Nút chỉ mở trò chơi kèm câu "Bài này ứng với màn N".
  - Ghi lại đã chọn nhánh nào và vì sao, ngay trong chú thích của `OnBangTroChoi.tsx`.
- [ ] **Step 3: Dựng khối** — thẻ viền mực, không bóng đổ (hợp đồng hướng), một nút chính "Chơi để ôn bài này", chữ phụ ghi tên trò và màn.
- [ ] **Step 4: Gắn vào `PracticeSection.tsx`**, đặt dưới khối chọn phần luyện tập.
- [ ] **Step 5:** `npm run lint`; `npm run kiem-tra:mau` (có thêm màu/thẻ mới).

### Task 2B: Chơi xong một màn thì mở lại lượt đang bị khoá

**Files:**
- Modify: `src/features/auth/types.ts:273`
- Modify: `src/core/contexts/AppContext.tsx:1433-1454`
- Modify: `src/features/practice/components/ReviewGate.tsx`
- Test: `scripts/kiem-tra-luyen-tap.mts`

**Interfaces:**
- Consumes: `troChoiCuaBai` (Task 2A), `capLaiLuot` (có sẵn).
- Produces: kiểu `troChoi` có thêm `luc?: number` (mốc mili giây); `daChoiSauKhi(progress, troId, man, moc): boolean`.

- [ ] **Step 1: Viết phép kiểm trước** — trong `kiem-tra-luyen-tap.mts`:

```ts
console.log('\n== Mở khoá luyện tập bằng trò chơi ==');
{
  const { daChoiSauKhi } = await import('../src/features/practice/logic');
  const td = { troChoi: { 'ran-va-thang': { '3': { xong: true, cauDung: 6, luc: 1_000 } } } } as any;
  ok(daChoiSauKhi(td, 'ran-va-thang', 3, 500), 'chơi xong SAU khi bị khoá → được mở lại');
  ok(!daChoiSauKhi(td, 'ran-va-thang', 3, 2_000), 'màn chơi từ hôm trước KHÔNG mở khoá được');
  ok(!daChoiSauKhi(td, 'ran-va-thang', 4, 500), 'chơi màn khác bài thì không tính');
  const chuaXong = { troChoi: { 'ran-va-thang': { '3': { xong: false, cauDung: 2, luc: 9_000 } } } } as any;
  ok(!daChoiSauKhi(chuaXong, 'ran-va-thang', 3, 500), 'bỏ dở giữa chừng thì không tính');
}
```

- [ ] **Step 2: Chạy, phải HỎNG.**
- [ ] **Step 3: Thêm `luc`** vào kiểu và vào chỗ ghi tiến độ:

```ts
// types.ts
troChoi?: Record<string, Record<string, { xong: boolean; cauDung: number; hang?: string; luc?: number }>>;
// AppContext.tsx, khi nhận 'hoa11:tien-do-tro-choi'
cuaTro[man] = { ...cuaTro[man], xong, cauDung, ...(hang ? { hang } : {}), luc: Date.now() };
```

- [ ] **Step 4: Viết `daChoiSauKhi` trong `src/features/practice/logic.ts`:**

```ts
/** Em có chơi xong đúng màn của bài này SAU mốc thời gian không.
 *  Đòi mốc thời gian vì nếu chỉ hỏi "đã xong chưa" thì một màn chơi từ tuần
 *  trước cũng mở được khoá, và khoá 15 phút thành vô nghĩa. */
export function daChoiSauKhi(
  tienDo: { troChoi?: Record<string, Record<string, { xong: boolean; luc?: number }>> } | null,
  troId: string, man: number, moc: number,
): boolean {
  const m = tienDo?.troChoi?.[troId]?.[String(man)];
  return !!m && m.xong === true && typeof m.luc === 'number' && m.luc >= moc;
}
```

- [ ] **Step 5: Gắn vào `ReviewGate.tsx`** — khi `conKhoa`, hiện thêm đường "Chơi một màn để mở lại ngay". Mốc so sánh là thời điểm bắt đầu khoá (`tienDo.khoaDen - PHUT_KHOA*60*1000`). Chơi xong quay lại thì nút "Mở lại lượt" sáng, bấm vào gọi đúng `capLaiLuot` mà `PracticeSection.tsx:126` đang dùng.
- [ ] **Step 6: Chạy `npm run kiem-tra:luyen-tap` (ĐẠT) và `npm run lint`.**
- [ ] **Step 7: Phá thử** — bỏ điều kiện `m.luc >= moc`, phép kiểm "màn chơi từ hôm trước" phải HỎNG; trả lại.

### Task 3: Key riêng của học sinh + hướng dẫn khi hết hạn mức

**Files:**
- Create: `src/features/tutor/services/keyRieng.ts`, `src/features/tutor/services/giaSuKeyRieng.ts`, `src/features/tutor/components/KeyRiengDialog.tsx`
- Modify: `src/features/tutor/services/geminiTutorService.ts:49-62,109-160`
- Modify: `src/features/tutor/components/TutorChat.tsx`
- Test: `scripts/kiem-tra-het-luot.mts`, `scripts/kiem-tra-an-ninh.mts`

**Interfaces:**
- Produces:
  - `docKey(): string | null`, `luuKey(k: string): void`, `xoaKey(): void`, `KHOA_KEY = 'h11_key_rieng'`
  - `keyHopLe(k: string): boolean` — chỉ kiểm DẠNG (`AIza…` hoặc `AQ.…`, không khoảng trắng), không gọi mạng
  - `hoiGeminiBangKeyRieng(y: YeuCauGiaSu, key: string): Promise<string>`
  - `thongBaoHetLuot(loi, coKeyRieng)` — thêm câu hướng dẫn khi em CHƯA có key

- [ ] **Step 1: Viết phép kiểm trước** — `kiem-tra-het-luot.mts`:

```ts
console.log('\n== Hết hạn mức thì chỉ đường cho em tự lấy key ==');
{
  const { thongBaoHetLuot } = await import('../src/features/tutor/services/geminiTutorService');
  const ngay = thongBaoHetLuot(LOI_NGAY, false);
  ok(/aistudio\.google\.com/.test(ngay), 'nói rõ chỗ lấy key miễn phí');
  ok(/miễn phí/.test(ngay), 'nói rõ là miễn phí');
  ok(!/em đã dùng hết/i.test(ngay), 'không đổ lỗi cho em — hạn mức tính theo cả web');
  const coKey = thongBaoHetLuot(LOI_NGAY, true);
  ok(!/aistudio\.google\.com/.test(coKey), 'em đã có key thì đừng chỉ lại cách lấy key');
  const phut = thongBaoHetLuot(LOI_PHUT, false);
  ok(!/aistudio\.google\.com/.test(phut), 'hết lượt theo PHÚT thì chỉ cần chờ, không cần key');
}
```
và `kiem-tra-an-ninh.mts`:

```ts
/* Key của học sinh chỉ được nằm trong localStorage của máy em. Ghi nó lên
   Firestore hay vào nhật ký lỗi là biến một bí mật cá nhân thành dữ liệu
   dùng chung — và khoá đó tính tiền theo tài khoản Google của chính em. */
const maKey = doc('src/features/tutor/services/keyRieng.ts');
dat(/localStorage/.test(maKey) && !/setDoc|addDoc|updateDoc|collection\(/.test(maKey)
  ? 'key riêng chỉ nằm trong localStorage'
  : truot('key riêng chỉ nằm trong localStorage', 'có đường ghi key ra Firestore'));
for (const f of ['src/features/tutor/services/giaSuKeyRieng.ts', 'src/features/tutor/services/keyRieng.ts']) {
  const m = doc(f);
  if (/console\.(log|warn|error)\([^)]*key/i.test(m)) truot('không in key ra console', f);
}
```

- [ ] **Step 2: Chạy cả hai, phải HỎNG.**
- [ ] **Step 3: `keyRieng.ts`** — đọc/ghi/xoá `localStorage`, `keyHopLe` kiểm dạng. Không import Firebase.
- [ ] **Step 4: `giaSuKeyRieng.ts`** — dùng `@google/genai` (đã có trong `package.json`) gọi `GEMINI_MODEL_NAME` với `systemInstruction` và `contents` y như đường Firebase AI Logic, để hai đường cho ra cùng một kiểu trả lời.
- [ ] **Step 5: Nối vào `geminiTutorService.ts`** — khi lỗi là hết lượt theo NGÀY và em có key riêng thì gọi lại bằng key đó. Hết lượt theo phút thì KHÔNG dùng key (chờ là xong, đừng tiêu lượt của em).
- [ ] **Step 6: `thongBaoHetLuot`** — thêm tham số `coKeyRieng = false`; khi chưa có key thì thêm:

> Nếu em muốn hỏi tiếp ngay hôm nay, em có thể tự lấy một khoá miễn phí của Google tại aistudio.google.com rồi dán vào mục "Khoá riêng của em". Việc này miễn phí, làm một lần dùng mãi, và chỉ mất khoảng hai phút. Em làm được, thầy tin vậy.

- [ ] **Step 7: `KeyRiengDialog.tsx`** — 4 bước có đánh số, ô dán key, nút Lưu/Xoá, và một dòng nói rõ: khoá chỉ lưu trên máy này, không ai khác đọc được, và em xoá lúc nào cũng được. Nút mở hộp thoại đặt cạnh thông báo hết lượt trong `TutorChat.tsx`.
- [ ] **Step 8: Chạy `npm run kiem-tra:het-luot`, `npm run kiem-tra:an-ninh` (ĐẠT), `npm run lint`.**
- [ ] **Step 9: Phá thử** — thêm tạm `console.log('key', key)` vào `keyRieng.ts`, `kiem-tra:an-ninh` phải HỎNG; trả lại.

### Task 4: Tài liệu và nghiệm thu

- [ ] **Step 1:** Ghi vào `CLAUDE.md`: trần lượt khách 5 và vì sao; trò chơi mở khoá luyện tập (và vì sao cần mốc thời gian); key riêng của học sinh (chỉ localStorage, không Firestore, không log, chỉ dùng khi hết hạn mức theo NGÀY).
- [ ] **Step 2:** `npm run kiem-tra` — mọi bộ ĐẠT.
- [ ] **Step 3:** Báo chủ dự án, chờ lệnh mới commit / build / deploy.
