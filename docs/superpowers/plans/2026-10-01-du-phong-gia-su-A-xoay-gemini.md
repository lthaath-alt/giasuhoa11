# Kế hoạch A — Xoay vòng Gemini, ghi đúng model (chuỗi dự phòng gia sư, phần 1/3)

> **Cho người thực thi:** KỸ NĂNG BẮT BUỘC: dùng `superpowers:subagent-driven-development`
> (khuyến nghị) hoặc `superpowers:executing-plans` để làm từng việc. Các bước dùng ô
> đánh dấu (`- [ ]`).

**Mục tiêu:** Khi model chính `gemini-3.6-flash` hết 20 lượt/ngày, gia sư lặng lẽ chuyển
sang các model Gemini khác cùng dự án (mỗi model có hạn mức riêng), học sinh không thấy
gì khác; dữ liệu `chats` ghi đúng model và đường đã đi.

**Kiến trúc:** Một hàm thuần `goiTheoChuoi` nhận danh sách bước gọi (tiêm từ ngoài), nhớ
model nào đã hết lượt trong ngày (localStorage, ngày theo giờ Thái Bình Dương), nghỉ 60 s
với model hết lượt phút, dừng ngay với lỗi App Check/quá hạn/mạng. `geminiTutorService`
dựng danh sách bước: model chính → `GEMINI_XOAY` → (nếu em có khoá riêng, và mọi model
chung đã hết lượt NGÀY) khoá riêng. Câu lệnh hệ thống ghép ở MỘT chỗ dùng chung
(`dungCauLenh.ts`), so từng ký tự với bản ghép cũ.

**Ngăn xếp:** TypeScript 5.8, React 19, Firebase AI Logic (`firebase/ai`), `@google/genai`
(đường khoá riêng), `tsx` cho script `.mts`. Không có khung test: phép kiểm nằm trong
`scripts/kiem-tra-*.mts`.

**Spec:** `docs/superpowers/specs/2026-10-01-du-phong-gia-su-design.md`. Kế hoạch này phủ
bước 1–3 của spec, trừ hai việc chỉ máy chủ cần nên dời sang B: tách hằng
`promptSuPham.ts` (cho prompt rút gọn) và `hangSoGioiHan.ts` (cho trần lượt ở máy chủ). Kế hoạch B (máy chủ Pages Function, Workers AI/SambaNova/Groq, D1) và
C (đánh giá model, tài liệu, báo cáo) viết sau khi A xong, vì chúng dùng giao diện A tạo ra.

## Ràng buộc toàn cục

- Nhánh `du-phong-gia-su`. Không `npm run build`, không push, không deploy (CLAUDE.md).
- Nhánh Socratic phải khớp NGUYÊN VĂN `scripts/du-lieu/prompt-socratic-goc.txt` — không sửa chữ nào trong `promptSuPham.ts`.
- `GEMINI_MODEL_NAME = 'gemini-3.6-flash'` (`src/core/constants.ts:1`) giữ nguyên, vẫn đi đầu.
- `THAM_SO_SINH` (0,3 / 0,85) và `thinkingLevel: LOW` dùng cho MỌI model trong chuỗi.
- Học sinh không thấy việc chuyển: không thêm câu thông báo nào; các câu `thongBaoHetLuot`/`thongBaoLoiKetNoi` giữ nguyên chữ.
- Khoá riêng của em chỉ được dùng khi mọi model chung đã hết lượt NGÀY (không dùng khi chỉ hết lượt phút) — quy tắc 20/09/2026.
- Không viết chữ `key` (đứng riêng) trong 400 ký tự sau `logError({` ở `geminiTutorService.ts` — `kiem-tra:an-ninh` bắt. Vì vậy tên đường là `'khoa-rieng'`, không phải `'key-rieng'` như spec.
- Không thêm gói npm. Chạy `npm run lint` một lần cuối mỗi việc; `npm run kiem-tra` trước mỗi commit.
- Bash trên máy này thiếu PATH: đầu mỗi lệnh `export PATH="$PATH:/c/Program Files/nodejs:/usr/bin:/mingw64/bin";`.

## Bản đồ tệp

| Tệp | Việc | Trách nhiệm |
|---|---|---|
| `src/features/tutor/services/dungCauLenh.ts` (mới) | 1 | Ghép câu lệnh hệ thống một lượt |
| `src/features/tutor/services/danhSachMoHinh.ts` (mới) | 2 | `GEMINI_XOAY`, kiểu `NhaCungCap`, `Duong` |
| `src/features/tutor/services/hetLuotMoHinh.ts` (mới) | 2 | `phanLoaiLoiGemini`, `ngayTheoMuiGio`, `taoKhoHet` |
| `src/features/tutor/services/chuoiDuPhong.ts` (mới) | 3 | `goiTheoChuoi`, `HAN_CHO_MS` |
| `scripts/kiem-tra-du-phong.mts` (mới) | 2, 3 | Phép kiểm các module thuần |
| `src/features/tutor/services/geminiTutorService.ts` | 1, 4 | Dùng chỗ ghép chung + chuỗi |
| `src/features/tutor/services/giaSuFirebaseAI.ts` | 4 | Nhận hạn chờ; `HAN_CHO_MS` lấy từ `chuoiDuPhong` |
| `src/features/tutor/services/giaSuKeyRieng.ts` | 4 | Nhận hạn chờ |
| `src/features/auth/types.ts` | 4 | `ChatMessage.nha_cung_cap`, `duong` |
| `src/core/contexts/AppContext.tsx` | 4 | Ghi hai trường mới |
| `src/features/tutor/services/telemetryService.ts` | 4 | Hai cột CSV mới ở CUỐI |
| `scripts/kiem-tra-thuc-nghiem.mts`, `scripts/kiem-tra-su-pham.mts`, `scripts/kiem-tra-gemini.mts`, `scripts/thu-gia-su-ai.mts`, `package.json` | 1–5 | Phép kiểm, lệnh |
| `docs/claude-reference/project.md`, `security.md` | 5 | Ghi kiến trúc mới |

---

### Việc 1: Chỗ ghép câu lệnh dùng chung

**Tệp:**
- Tạo: `src/features/tutor/services/dungCauLenh.ts`
- Sửa: `src/features/tutor/services/geminiTutorService.ts:4-5, 221-238`
- Sửa: `scripts/thu-gia-su-ai.mts:60-82` (bỏ `dungNguCanh`, dùng chỗ chung)
- Kiểm: `scripts/kiem-tra-thuc-nghiem.mts`

**Giao diện:**
- Dùng: `dungPrompt`, `NhanhThucNghiem` (`promptSuPham.ts`); `buildLessonCatalog`, `buildLessonContext`, `buildProgramContext` (`lessonContext.ts`)
- Sinh ra: `interface ThamSoCauLenh { nhanh: NhanhThucNghiem; lessonId: string; chiDanThem?: string; chiThiChan?: string }`, `function dungHuongDanHeThong(t: ThamSoCauLenh): string`

- [ ] **Bước 1: Viết phép kiểm trước**

Trong `scripts/kiem-tra-thuc-nghiem.mts`, thêm vào khối import:

```ts
import { dungHuongDanHeThong } from '../src/features/tutor/services/dungCauLenh';
import { buildLessonCatalog, buildLessonContext, buildProgramContext } from '../src/features/tutor/services/lessonContext';
import { chiDanGianGiao } from '../src/features/tutor/services/pedagogicalStateMachine';
import { CHI_THI_SINH_LAI } from '../src/features/tutor/services/chanRoDapSo';
import { CHEMISTRY_11_CURRICULUM } from '../src/features/lessons/constants';
```

Thêm khối này ngay SAU khối "Nhánh Socratic phải giống NGUYÊN VĂN bản chụp đã duyệt":

```ts
console.log('\n== Chỗ ghép câu lệnh dùng chung ra ĐÚNG như bản ghép cũ ==');
{
  /* Bản ghép của geminiTutorService.dungYeuCau trước ngày 01/10/2026, chép
     nguyên văn rồi ĐÓNG BĂNG ở đây. dungCauLenh.ts lệch một ký tự là đỏ — tức
     nhóm thực nghiệm đang được dạy bằng câu lệnh khác câu lệnh đã duyệt. */
  const banCu = (nhanh: 'socratic' | 'truc-tiep', lessonId: string, chiDanThem: string, chiThiChan?: string) => {
    const nguCanhBai = buildLessonContext(lessonId);
    const danhMucBai = buildLessonCatalog();
    const danBaiChung = nguCanhBai ? '' : buildProgramContext();
    return [
      dungPrompt(nhanh),
      '='.repeat(60),
      danhMucBai,
      ...(nguCanhBai ? ['='.repeat(60), nguCanhBai] : []),
      ...(danBaiChung ? ['='.repeat(60), danBaiChung] : []),
      ...(chiDanThem ? ['='.repeat(60), chiDanThem] : []),
      ...(chiThiChan ? ['='.repeat(60), chiThiChan] : []),
    ].join('\n\n');
  };
  const cacBai = [...CHEMISTRY_11_CURRICULUM.flatMap(c => c.lessons.map(l => l.id)), 'global-advisor'];
  let soCa = 0;
  let lech = '';
  for (const nhanh of ['socratic', 'truc-tiep'] as const) {
    for (const lessonId of cacBai) {
      for (const muc of [0, 1, 2, 3, 4]) {
        for (const chiThiChan of [undefined, CHI_THI_SINH_LAI]) {
          const chiDanThem = nhanh === 'socratic' ? chiDanGianGiao(muc) : '';
          soCa++;
          const moi = dungHuongDanHeThong({ nhanh, lessonId, chiDanThem, chiThiChan });
          if (!lech && moi !== banCu(nhanh, lessonId, chiDanThem, chiThiChan)) {
            lech = `${nhanh} ${lessonId} nấc ${muc}${chiThiChan ? ' sinh lại' : ''}`;
          }
        }
      }
    }
  }
  ok(!lech, 'khớp từng ký tự ở mọi tổ hợp bài × nhánh × nấc × sinh lại',
     lech ? `lệch đầu tiên: ${lech}` : `${soCa} tổ hợp`);
  const maGiaSu = readFileSync(join(HERE, '..', 'src/features/tutor/services/geminiTutorService.ts'), 'utf8');
  ok(maGiaSu.includes('dungHuongDanHeThong(') && !maGiaSu.includes('buildProgramContext'),
     'geminiTutorService dùng chỗ ghép chung, không tự ghép lại');
}
```

- [ ] **Bước 2: Chạy để thấy TRƯỢT**

Chạy: `npm run kiem-tra:thuc-nghiem`
Kỳ vọng: lỗi nạp mô-đun `dungCauLenh` (chưa có tệp).

- [ ] **Bước 3: Viết `dungCauLenh.ts`**

```ts
// ─── Ghép câu lệnh hệ thống cho MỘT lượt gia sư ──────────────────────────────
//
// Tách khỏi `geminiTutorService.dungYeuCau` ngày 01/10/2026 để mọi đường gọi
// mô hình — trình duyệt, máy chủ dự phòng, script thử — dùng CHUNG một chỗ
// ghép. Hai chỗ tự ghép thì sớm muộn lệch nhau, và nhóm thực nghiệm không còn
// được dạy bằng đúng một câu lệnh. `kiem-tra:thuc-nghiem` so đầu ra với bản
// ghép cũ đóng băng, từng ký tự.
//
// Chỉ import tệp thuần, để Node và Pages Function nạp thẳng được.
import { dungPrompt, type NhanhThucNghiem } from './promptSuPham';
import { buildLessonCatalog, buildLessonContext, buildProgramContext } from './lessonContext';

const VACH = '='.repeat(60);

export interface ThamSoCauLenh {
  nhanh: NhanhThucNghiem;
  /** Mã bài đang mở; 'global-advisor' nghĩa là khung iChat chung */
  lessonId: string;
  /** Chỉ dẫn của máy trạng thái (`xuLyTruocLuot().chiDanThem`) */
  chiDanThem?: string;
  /** Chỉ thị của bộ chặn rò — chỉ có ở lượt sinh lại */
  chiThiChan?: string;
}

export function dungHuongDanHeThong(t: ThamSoCauLenh): string {
  /* Nội dung bài đang mở; không mở bài nào (khung iChat chung) thì rỗng. */
  const nguCanhBai = buildLessonContext(t.lessonId);
  /* Không mở bài nào thì đưa dàn bài cả chương trình vào chỗ trống. */
  const danBaiChung = nguCanhBai ? '' : buildProgramContext();
  return [
    dungPrompt(t.nhanh),
    VACH,
    /* Danh mục mã bài LUÔN đính kèm, để nhãn ra đề mang đúng mã bài. */
    buildLessonCatalog(),
    ...(nguCanhBai ? [VACH, nguCanhBai] : []),
    ...(danBaiChung ? [VACH, danBaiChung] : []),
    /* Chỉ dẫn của máy trạng thái đặt CUỐI CÙNG: gần lượt hỏi nhất, và câu
       lệnh đã dặn mục "TRẠNG THÁI" được ưu tiên hơn quy tắc bước. */
    ...(t.chiDanThem ? [VACH, t.chiDanThem] : []),
    /* Chỉ thị của bộ chặn rò đứng sau cùng, chỉ có ở lượt sinh lại. */
    ...(t.chiThiChan ? [VACH, t.chiThiChan] : []),
  ].join('\n\n');
}
```

- [ ] **Bước 4: Cho `geminiTutorService` dùng nó**

Dòng 4–5 đổi thành:

```ts
import { THAM_SO_SINH } from './promptSuPham';
import { dungHuongDanHeThong } from './dungCauLenh';
```

Trong `generateAIResponseChiTiet`, xoá ba dòng `nguCanhBai`/`danhMucBai`/`danBaiChung` (214–219) và thay `systemInstruction: [ ... ].join('\n\n'),` (224–235) bằng:

```ts
      systemInstruction: dungHuongDanHeThong({
        nhanh, lessonId, chiDanThem: truoc.chiDanThem, chiThiChan,
      }),
```

- [ ] **Bước 5: Cho `thu-gia-su-ai.mts` dùng nó**

Xoá hàm `dungNguCanh` (dòng 67–82) cùng chú thích ngay trên. Thêm import `import { dungHuongDanHeThong } from '../src/features/tutor/services/dungCauLenh';` và trong `hoi()` thay `systemInstruction: dungNguCanh(p.bai, truoc.chiDanThem),` bằng:

```ts
      /* Cùng chỗ ghép với web (dungCauLenh.ts) — không tự ghép lại ở đây. */
      systemInstruction: dungHuongDanHeThong({
        nhanh: 'socratic', lessonId: p.bai, chiDanThem: truoc.chiDanThem,
      }),
```

Gỡ các import không còn dùng (`buildLessonContext`, `buildLessonCatalog`, `buildProgramContext`, `SYSTEM_PROMPT` nếu `tsc` báo thừa — `THAM_SO_SINH` vẫn giữ vì `kiem-tra-su-pham.mts:187` đòi chữ đó).
Lưu ý: `bai: ''` cũ nay là `lessonId: ''` — `buildLessonContext('')` trả rỗng y như `global-advisor`, nên hành vi không đổi.

- [ ] **Bước 6: Chạy phép kiểm, phải ĐẠT**

Chạy: `npm run kiem-tra:thuc-nghiem && npm run kiem-tra:su-pham && npm run lint`
Kỳ vọng: `>>> TẤT CẢ ĐẠT` hai lần, `tsc` không lỗi; dòng mới in `260 tổ hợp` (26 bài × 2 × 5 × 2).

- [ ] **Bước 7: Commit**

```bash
git add src/features/tutor/services/dungCauLenh.ts src/features/tutor/services/geminiTutorService.ts scripts/thu-gia-su-ai.mts scripts/kiem-tra-thuc-nghiem.mts
git commit -m "Tach cho ghep cau lenh he thong ra dungCauLenh.ts, kiem khop tung ky tu"
```

---

### Việc 2: Danh sách model, đọc loại lỗi, kho nhớ hết lượt

**Tệp:**
- Tạo: `src/features/tutor/services/danhSachMoHinh.ts`
- Tạo: `src/features/tutor/services/hetLuotMoHinh.ts`
- Tạo: `scripts/kiem-tra-du-phong.mts`
- Sửa: `package.json` (thêm `"kiem-tra:du-phong": "tsx scripts/kiem-tra-du-phong.mts"`, và nối `&& npm run kiem-tra:du-phong` vào `kiem-tra` ngay SAU `npm run kiem-tra:het-luot`)

**Giao diện:**
- Sinh ra: `GEMINI_XOAY: readonly string[]`; `type NhaCungCap = 'gemini-firebase' | 'gemini-khoa-rieng'`; `type Duong = 'chinh' | 'xoay-gemini' | 'khoa-rieng'`
- Sinh ra: `type LoaiLoiGemini`; `phanLoaiLoiGemini(chuoiLoi: string): LoaiLoiGemini`; `MUI_GIO_HAN_MUC`; `ngayTheoMuiGio(luc: Date, muiGio?: string): string`; `type VungHet = 'firebase' | 'khoa'`; `interface KhoHet { conDung(vung, moHinh, luc: Date): boolean; danhDau(vung, moHinh, luc: Date): void }`; `taoKhoHet(luuTru: Pick<Storage,'getItem'|'setItem'> | null): KhoHet`; `KHOA_KHO_HET = 'h11_mo_hinh_het'`

- [ ] **Bước 1: Viết phép kiểm trước — tạo `scripts/kiem-tra-du-phong.mts`**

```ts
/**
 * Kiểm chuỗi dự phòng của gia sư AI (01/10/2026).
 *
 * Chạy:  npm run kiem-tra:du-phong
 * Không gọi mạng, không tốn lượt API: model, đồng hồ, bộ nhớ trình duyệt đều giả.
 *
 * Canh ba điều mà mắt thường không thấy: (1) model hết lượt NGÀY bị bỏ qua tới
 * đúng nửa đêm giờ Thái Bình Dương rồi được thử lại; (2) khoá riêng của em
 * không bị tiêu khi chỉ hết lượt PHÚT; (3) lỗi App Check thì dừng ngay, không
 * gõ cửa thêm model nào.
 */
import { phanLoaiLoiGemini, ngayTheoMuiGio, taoKhoHet, KHOA_KHO_HET } from '../src/features/tutor/services/hetLuotMoHinh';
import { GEMINI_XOAY } from '../src/features/tutor/services/danhSachMoHinh';
import { GEMINI_MODEL_NAME } from '../src/core/constants';

let hong = 0;
const ok = (dieu: boolean, ten: string, chiTiet = '') => {
  if (!dieu) hong++;
  console.log(`  ${dieu ? 'OK  ' : 'SAI '} ${ten}${chiTiet ? '  — ' + chiTiet : ''}`);
};

/** Bộ nhớ trình duyệt giả: đủ hai hàm mà kho dùng. */
const luuTruGia = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); }, m };
};

/* Lỗi dựng theo đúng dạng `loiThanhChuoi` trả về cho firebase/ai (message +
   JSON customErrorData) — xem kiem-tra-het-luot.mts. */
const LOI_NGAY = 'AI: Error fetching from https://firebasevertexai.googleapis.com/v1beta/projects/giasuhoa11/models/gemini-3.6-flash:generateContent: [429 Too Many Requests] You exceeded your current quota. (AI/fetch-error) {"status":429,"errorDetails":[{"violations":[{"quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier"}]}]}';
const LOI_PHUT = LOI_NGAY.replace('PerDay', 'PerMinute');
const LOI_404 = 'AI: Error fetching from https://firebasevertexai.googleapis.com/v1beta/projects/giasuhoa11/models/gemini-x:generateContent: [404 Not Found] models/gemini-x is not found (AI/fetch-error)';
const LOI_503 = 'AI: Error fetching from https://firebasevertexai.googleapis.com/...: [503 Service Unavailable] The model is overloaded due to high demand (AI/fetch-error)';
const LOI_APPCHECK = 'AppCheck: Requests throttled due to 403 error. Attempts allowed again after 23h:59m (appCheck/initial-throttle).';

console.log('\n== Đọc loại lỗi ==');
ok(phanLoaiLoiGemini(LOI_NGAY) === 'het-ngay', 'hết lượt NGÀY');
ok(phanLoaiLoiGemini(LOI_PHUT) === 'het-phut', 'hết lượt PHÚT');
ok(phanLoaiLoiGemini(LOI_404) === 'mo-hinh-hong', 'model không tồn tại (404)');
ok(phanLoaiLoiGemini(LOI_503) === 'may-chu', 'máy chủ quá tải (503)');
ok(phanLoaiLoiGemini(LOI_APPCHECK) === 'app-check', 'App Check bị khoá');
ok(phanLoaiLoiGemini('AbortError: signal timed out') === 'qua-han', 'quá hạn chờ');
ok(phanLoaiLoiGemini('TypeError: Failed to fetch') === 'mang', 'rớt mạng');
ok(phanLoaiLoiGemini('API key not valid. Please pass a valid API key.') === 'khac', 'khoá sai không bị coi là hết lượt');

console.log('\n== Ngày theo giờ Thái Bình Dương (hạn mức hồi lúc nửa đêm ở đó) ==');
ok(ngayTheoMuiGio(new Date('2026-10-02T06:59:59Z')) === '2026-10-01', 'mùa hè: 13:59:59 giờ VN vẫn là ngày cũ');
ok(ngayTheoMuiGio(new Date('2026-10-02T07:00:00Z')) === '2026-10-02', 'mùa hè: 14:00 giờ VN sang ngày mới');
ok(ngayTheoMuiGio(new Date('2026-12-01T07:59:00Z')) === '2026-11-30', 'mùa đông: 14:59 giờ VN vẫn là ngày cũ');
ok(ngayTheoMuiGio(new Date('2026-12-01T08:00:00Z')) === '2026-12-01', 'mùa đông: 15:00 giờ VN sang ngày mới');

console.log('\n== Kho nhớ model đã hết lượt ==');
{
  const lt = luuTruGia();
  const kho = taoKhoHet(lt);
  const sang = new Date('2026-10-01T16:00:00Z');   // 09:00 Pacific ngày 01/10
  ok(kho.conDung('firebase', 'm1', sang), 'chưa đánh dấu thì còn dùng');
  kho.danhDau('firebase', 'm1', sang);
  ok(!kho.conDung('firebase', 'm1', new Date('2026-10-02T06:00:00Z')), 'đánh dấu xong: cả phần còn lại của ngày đó là chết');
  ok(kho.conDung('firebase', 'm1', new Date('2026-10-02T07:00:00Z')), 'qua nửa đêm Pacific thì sống lại');
  ok(kho.conDung('khoa', 'm1', sang), 'hạn mức khoá riêng của em tách khỏi hạn mức của web');
  kho.danhDau('firebase', 'm2', new Date('2026-10-03T16:00:00Z'));
  ok(!(lt.getItem(KHOA_KHO_HET) ?? '').includes('m1'), 'dấu của ngày cũ bị dọn khi ghi dấu mới');
  const hong1 = taoKhoHet({ getItem: () => '{không phải json', setItem: () => { throw new Error('đầy'); } });
  ok(hong1.conDung('firebase', 'm1', sang), 'bộ nhớ hỏng thì coi như còn dùng, không ném lỗi');
  hong1.danhDau('firebase', 'm1', sang);
  ok(taoKhoHet(null).conDung('firebase', 'm1', sang), 'không có localStorage (Node) vẫn chạy');
}

console.log('\n== Danh sách model xoay vòng ==');
ok(GEMINI_XOAY.length >= 4, `có ít nhất 4 model dự phòng (đang có ${GEMINI_XOAY.length})`);
ok(!GEMINI_XOAY.includes(GEMINI_MODEL_NAME), 'model chính không nằm lại trong danh sách xoay');
ok(GEMINI_XOAY.every(m => /^gemini-3/.test(m)), 'chỉ đời 3.x (nhận thinkingLevel như model chính)');
ok(new Set(GEMINI_XOAY).size === GEMINI_XOAY.length, 'không trùng tên');

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC KHÔNG ĐẠT`) + '\n');
process.exit(hong === 0 ? 0 : 1);
```

Thêm vào `package.json` như phần **Tệp** ở trên.

- [ ] **Bước 2: Chạy để thấy TRƯỢT**

Chạy: `npm run kiem-tra:du-phong`
Kỳ vọng: lỗi nạp mô-đun `hetLuotMoHinh`.

- [ ] **Bước 3: Viết `danhSachMoHinh.ts`**

```ts
// ─── Model dự phòng của gia sư, và tên các đường gọi ─────────────────────────
//
// Hạn mức miễn phí của Gemini tính theo DỰ ÁN và theo TỪNG MODEL (quotaId
// `GenerateRequestsPerDayPerProjectPerModel-FreeTier`). Model chính hết 20
// lượt thì các model khác trong cùng dự án vẫn còn lượt riêng của chúng.
//
// Thứ tự: các bản Flash trước — gần model chính nhất về chất lượng, khoảng 20
// lượt/ngày mỗi bản; các bản Flash-Lite sau — nhẹ hơn, khoảng 500 lượt/ngày mỗi
// bản (số của bên thứ ba, chủ dự án đối chiếu trong AI Studio).
//
// Chỉ đời 3.x: chúng nhận `thinkingLevel` như model chính. Đời 2.5 đòi
// `thinkingBudget`, thêm vào thì phải sửa `giaSuFirebaseAI.ts`.
// Đo bằng ListModels ngày 01/10/2026: cả sáu tên đều được cấp cho dự án.
// `kiem-tra:gemini` hỏi lại mỗi lần chạy.
//
// Tệp thuần, không import gì.

export const GEMINI_XOAY: readonly string[] = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-3-flash-preview',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
];

/** Ai đã trả lời lượt này — ghi vào `chats.nha_cung_cap`. */
export type NhaCungCap = 'gemini-firebase' | 'gemini-khoa-rieng';

/** Lượt này đi đường nào — ghi vào `chats.duong`. Lọc `'chinh'` là ra đúng
    những lượt do model gốc trả lời, cho phân tích của đề tài. */
export type Duong = 'chinh' | 'xoay-gemini' | 'khoa-rieng';
```

- [ ] **Bước 4: Viết `hetLuotMoHinh.ts`**

```ts
// ─── Đọc loại lỗi, và nhớ model nào đã hết lượt trong ngày ───────────────────
//
// Không nhớ thì lượt nào cũng gõ cửa model đã chết trước, mất thêm chừng một
// giây mỗi model — học sinh thấy gia sư chậm dần trong ngày mà không hiểu vì sao.
//
// Hạn mức ngày của Gemini hồi lại lúc nửa đêm giờ Thái Bình Dương, tức 14:00
// giờ VN mùa hè, 15:00 mùa đông. Lưu NGÀY theo múi giờ đó và so ngày, không
// cộng trừ giờ — khỏi lo đổi giờ mùa hè.
//
// Tệp thuần, không import gì: kho nhận `Storage` từ ngoài để script Node kiểm được.

export type LoaiLoiGemini =
  | 'het-ngay' | 'het-phut' | 'mo-hinh-hong' | 'app-check'
  | 'qua-han' | 'mang' | 'may-chu' | 'khac';

/**
 * Đọc loại lỗi từ chuỗi `loiThanhChuoi(loi)`. Thứ tự các phép thử là cố ý:
 * hết lượt xét trước (chuỗi lỗi 429 có thể chứa chữ khác), App Check xét
 * trước mạng (lỗi App Check có khi mang chữ "fetch").
 */
export function phanLoaiLoiGemini(chuoiLoi: string): LoaiLoiGemini {
  const goc = chuoiLoi || '';
  const s = goc.toLowerCase();
  if (s.includes('429') || s.includes('quota') || s.includes('rate limit')
      || s.includes('resource_exhausted')) {
    return s.includes('perday') ? 'het-ngay' : 'het-phut';
  }
  /* App Check hỏng thì đổi model cũng hỏng y vậy: mọi model đi chung một thẻ. */
  if (s.includes('app check') || s.includes('appcheck') || s.includes('initial-throttle')
      || s.includes('attempts allowed again')) return 'app-check';
  if (s.includes('abort') || s.includes('timeout') || s.includes('timed out')) return 'qua-han';
  if (s.includes('network') || s.includes('failed to fetch')) return 'mang';
  /* Model bị gỡ hoặc không nhận cấu hình — chỉ chết với RIÊNG model này. */
  if (/\[404\s/.test(goc) || /\[400\s/.test(goc) || s.includes('is not found')
      || s.includes('not supported')) return 'mo-hinh-hong';
  if (/\[5\d\d\s/.test(goc) || /"?status"?:\s*5\d\d/.test(goc) || s.includes('internal server error')
      || s.includes('service unavailable') || s.includes('overloaded')
      || s.includes('high demand')) return 'may-chu';
  return 'khac';
}

export const MUI_GIO_HAN_MUC = 'America/Los_Angeles';

/** Ngày 'YYYY-MM-DD' theo múi giờ cho trước (mặc định giờ Thái Bình Dương). */
export function ngayTheoMuiGio(luc: Date, muiGio: string = MUI_GIO_HAN_MUC): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: muiGio, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(luc);
}

export const KHOA_KHO_HET = 'h11_mo_hinh_het';

/** 'firebase' = hạn mức chung của web; 'khoa' = hạn mức khoá riêng của em. */
export type VungHet = 'firebase' | 'khoa';

export interface KhoHet {
  conDung(vung: VungHet, moHinh: string, luc: Date): boolean;
  danhDau(vung: VungHet, moHinh: string, luc: Date): void;
}

/**
 * Kho nhớ trong `localStorage`. Chỉ chứa tên model và ngày — không có gì
 * của học sinh. Bộ nhớ hỏng hay bị chặn (chế độ ẩn danh, đầy) thì coi như
 * mọi model còn dùng: lần sau gõ lại cửa, chậm hơn chút chứ không hỏng.
 */
export function taoKhoHet(luuTru: Pick<Storage, 'getItem' | 'setItem'> | null): KhoHet {
  const doc = (): Record<string, string> => {
    try {
      const v: unknown = JSON.parse(luuTru?.getItem(KHOA_KHO_HET) ?? '{}');
      return v && typeof v === 'object' ? v as Record<string, string> : {};
    } catch {
      return {};
    }
  };
  return {
    conDung(vung, moHinh, luc) {
      return doc()[`${vung}:${moHinh}`] !== ngayTheoMuiGio(luc);
    },
    danhDau(vung, moHinh, luc) {
      const homNay = ngayTheoMuiGio(luc);
      /* Chỉ giữ dấu của hôm nay: dấu cũ vô hại nhưng cứ thế phình ra mãi. */
      const giu = Object.fromEntries(Object.entries(doc()).filter(([, ngay]) => ngay === homNay));
      giu[`${vung}:${moHinh}`] = homNay;
      try { luuTru?.setItem(KHOA_KHO_HET, JSON.stringify(giu)); } catch { /* xem chú thích hàm */ }
    },
  };
}
```

- [ ] **Bước 5: Chạy phép kiểm, phải ĐẠT**

Chạy: `npm run kiem-tra:du-phong && npm run lint`
Kỳ vọng: `>>> TẤT CẢ ĐẠT`; `tsc` không lỗi.

- [ ] **Bước 6: Phá thử một lần (hiến chương: mọi phép kiểm mới phải chứng minh nó bắt được lỗi)**

Tạm đổi `'America/Los_Angeles'` thành `'Asia/Ho_Chi_Minh'`, chạy `npm run kiem-tra:du-phong` → phải thấy ≥ 2 dòng `SAI` ở khối "Ngày theo giờ Thái Bình Dương". Hoàn lại, chạy lại → ĐẠT.

- [ ] **Bước 7: Commit**

```bash
git add src/features/tutor/services/danhSachMoHinh.ts src/features/tutor/services/hetLuotMoHinh.ts scripts/kiem-tra-du-phong.mts package.json
git commit -m "Them danh sach model xoay vong, doc loai loi, kho nho model het luot"
```

---

### Việc 3: Hàm gọi theo chuỗi

**Tệp:**
- Tạo: `src/features/tutor/services/chuoiDuPhong.ts`
- Kiểm: `scripts/kiem-tra-du-phong.mts`

**Giao diện:**
- Dùng: `loiThanhChuoi` (`loiGemini.ts`); `phanLoaiLoiGemini`, `KhoHet`, `VungHet` (Việc 2); `Duong`, `NhaCungCap` (Việc 2)
- Sinh ra:
  - `HAN_CHO_MS = 90_000`, `CON_LAI_TOI_THIEU_MS = 8_000`, `NGHI_HET_PHUT_MS = 60_000`
  - `LOI_HET_SACH_NGAY: string`, `LOI_HET_SACH_PHUT: string`
  - `interface BuocGoi { duong: Duong; nhaCungCap: NhaCungCap; maMoHinh: string; vung: VungHet; chiKhiChungHetNgay?: boolean; goi: (chiThi: string | undefined, hanChoMs: number) => Promise<string> }`
  - `interface KetQuaGoi { text: string; maMoHinh: string; nhaCungCap: NhaCungCap; duong: Duong; goiLai: (chiThi: string) => Promise<string> }`
  - `interface MoiTruongChuoi { kho: KhoHet; bayGio: () => number; nghiPhut: Map<string, number>; tongHanMs: number }`
  - `goiTheoChuoi(cacBuoc: BuocGoi[], mt: MoiTruongChuoi): Promise<KetQuaGoi>`

- [ ] **Bước 1: Viết phép kiểm trước**

Trong `scripts/kiem-tra-du-phong.mts`, thêm import:

```ts
import { goiTheoChuoi, type BuocGoi, type MoiTruongChuoi } from '../src/features/tutor/services/chuoiDuPhong';
import { thongBaoHetLuot } from '../src/features/tutor/services/geminiTutorService';
import { loiThanhChuoi } from '../src/features/tutor/services/loiGemini';
```

Thêm khối này TRƯỚC dòng tổng kết `>>> TẤT CẢ ĐẠT`:

```ts
console.log('\n== Gọi theo chuỗi ==');
{
  let gio = Date.parse('2026-10-01T16:00:00Z');            // 09:00 Pacific
  const moiTruong = (): MoiTruongChuoi => ({
    kho: taoKhoHet(luuTruGia()), bayGio: () => gio, nghiPhut: new Map(), tongHanMs: 90_000,
  });
  /** Bước giả: lần gọi thứ i làm theo hanhVi[i] (hết mảng thì lặp phần tử cuối). */
  const buoc = (ten: string, hanhVi: ('ok' | string)[], nhat: string[], them: Partial<BuocGoi> = {}): BuocGoi => {
    let lan = 0;
    return {
      duong: 'xoay-gemini', nhaCungCap: 'gemini-firebase', maMoHinh: ten, vung: 'firebase', ...them,
      goi: async (chiThi) => {
        nhat.push(ten + (chiThi ? '+chiThi' : ''));
        const h = hanhVi[Math.min(lan++, hanhVi.length - 1)];
        if (h === 'ok') return `trả lời của ${ten}`;
        throw new Error(h);
      },
    };
  };
  const thu = async (f: () => Promise<unknown>) => { try { await f(); return null; } catch (e) { return e; } };

  {
    const nhat: string[] = [];
    const kq = await goiTheoChuoi([buoc('chinh', ['ok'], nhat, { duong: 'chinh' }), buoc('a', ['ok'], nhat)], moiTruong());
    ok(kq.duong === 'chinh' && kq.maMoHinh === 'chinh' && nhat.join() === 'chinh',
       'ngày thường: chỉ gọi model chính, một lần');
  }
  {
    const mt = moiTruong();
    const nhat: string[] = [];
    const cacBuoc = [buoc('chinh', [LOI_NGAY], nhat, { duong: 'chinh' }), buoc('a', ['ok'], nhat)];
    const kq = await goiTheoChuoi(cacBuoc, mt);
    ok(kq.maMoHinh === 'a' && kq.duong === 'xoay-gemini' && nhat.join() === 'chinh,a',
       'model chính hết lượt NGÀY thì lặng lẽ sang model kế');
    nhat.length = 0;
    await goiTheoChuoi(cacBuoc, mt);
    ok(nhat.join() === 'a', 'lượt sau cùng ngày: KHÔNG gõ cửa model đã chết nữa', nhat.join());
    gio = Date.parse('2026-10-02T07:00:00Z');               // nửa đêm Pacific
    nhat.length = 0;
    await goiTheoChuoi(cacBuoc, mt);
    ok(nhat[0] === 'chinh', 'qua nửa đêm Pacific: thử lại model chính', nhat.join());
    gio = Date.parse('2026-10-01T16:00:00Z');
  }
  {
    const nhat: string[] = [];
    const kq = await goiTheoChuoi([buoc('chinh', [LOI_503], nhat, { duong: 'chinh' }), buoc('a', ['ok'], nhat)], moiTruong());
    ok(kq.maMoHinh === 'a', 'máy chủ quá tải (503) thì sang model kế');
  }
  {
    const nhat: string[] = [];
    const kq = await goiTheoChuoi([buoc('chinh', [LOI_404], nhat, { duong: 'chinh' }), buoc('a', ['ok'], nhat)], moiTruong());
    ok(kq.maMoHinh === 'a', 'model không tồn tại (404) thì sang model kế');
  }
  {
    const nhat: string[] = [];
    const loi = await thu(() => goiTheoChuoi([
      buoc('chinh', [LOI_APPCHECK], nhat, { duong: 'chinh' }), buoc('a', ['ok'], nhat),
    ], moiTruong()));
    ok(loi !== null && nhat.join() === 'chinh', 'App Check hỏng thì DỪNG, không gõ cửa model nào nữa');
  }
  {
    const nhat: string[] = [];
    const khoa = { duong: 'khoa-rieng' as const, nhaCungCap: 'gemini-khoa-rieng' as const, vung: 'khoa' as const, chiKhiChungHetNgay: true };
    const loi = await thu(() => goiTheoChuoi([
      buoc('chinh', [LOI_PHUT], nhat, { duong: 'chinh' }), buoc('a', [LOI_NGAY], nhat), buoc('k', ['ok'], nhat, khoa),
    ], moiTruong()));
    ok(loi !== null && !nhat.includes('k'), 'chỉ hết lượt PHÚT thì KHÔNG tiêu khoá riêng của em', nhat.join());
    ok(thongBaoHetLuot(loiThanhChuoi(loi)).includes('mỗi phút'), 'và học sinh được bảo chờ một phút');
  }
  {
    const nhat: string[] = [];
    const khoa = { duong: 'khoa-rieng' as const, nhaCungCap: 'gemini-khoa-rieng' as const, vung: 'khoa' as const, chiKhiChungHetNgay: true };
    const kq = await goiTheoChuoi([
      buoc('chinh', [LOI_NGAY], nhat, { duong: 'chinh' }), buoc('a', [LOI_NGAY], nhat), buoc('k', ['ok'], nhat, khoa),
    ], moiTruong());
    ok(kq.duong === 'khoa-rieng' && kq.nhaCungCap === 'gemini-khoa-rieng',
       'mọi model chung hết lượt NGÀY thì mới dùng khoá riêng của em');
  }
  {
    const mt = moiTruong();
    mt.kho.danhDau('firebase', 'chinh', new Date(gio));
    mt.kho.danhDau('firebase', 'a', new Date(gio));
    const nhat: string[] = [];
    const loi = await thu(() => goiTheoChuoi([buoc('chinh', ['ok'], nhat, { duong: 'chinh' }), buoc('a', ['ok'], nhat)], mt));
    ok(loi !== null && nhat.length === 0, 'mọi model đã chết từ trước: không gọi ai cả');
    ok(thongBaoHetLuot(loiThanhChuoi(loi)).includes('toàn hệ thống'), 'và học sinh nhận đúng câu hết lượt trong ngày');
  }
  {
    const nhat: string[] = [];
    const kq = await goiTheoChuoi([buoc('chinh', [LOI_NGAY], nhat, { duong: 'chinh' }), buoc('a', ['ok'], nhat)], moiTruong());
    await kq.goiLai('đừng nêu đáp số');
    ok(nhat.at(-1) === 'a+chiThi', 'lượt sinh lại của bộ chặn rò đi thẳng vào ĐÚNG model vừa trả lời', nhat.join());
  }
  {
    const nhat: string[] = [];
    const cham: BuocGoi = {
      duong: 'chinh', nhaCungCap: 'gemini-firebase', maMoHinh: 'chinh', vung: 'firebase',
      goi: async () => { nhat.push('chinh'); gio += 85_000; throw new Error(LOI_NGAY); },
    };
    const loi = await thu(() => goiTheoChuoi([cham, buoc('a', ['ok'], nhat)], moiTruong()));
    ok(loi !== null && nhat.join() === 'chinh', 'model chính ngốn 85 s rồi mới hỏng: không gọi thêm lượt chắc chắn quá hạn');
    gio = Date.parse('2026-10-01T16:00:00Z');
  }
  {
    let hanNhan = 0;
    const b: BuocGoi = {
      duong: 'chinh', nhaCungCap: 'gemini-firebase', maMoHinh: 'chinh', vung: 'firebase',
      goi: async (_c, han) => { hanNhan = han; return 'x'; },
    };
    await goiTheoChuoi([b], moiTruong());
    ok(hanNhan === 90_000, 'model chính vẫn được chờ đủ 90 giây như trước', String(hanNhan));
  }
}
```

- [ ] **Bước 2: Chạy để thấy TRƯỢT**

Chạy: `npm run kiem-tra:du-phong`
Kỳ vọng: lỗi nạp mô-đun `chuoiDuPhong`.

- [ ] **Bước 3: Viết `chuoiDuPhong.ts`**

```ts
// ─── Gọi mô hình theo chuỗi, lặng lẽ chuyển khi một model hết lượt ──────────
//
// Thay cho `goiMoHinh` cũ trong geminiTutorService (01/10/2026), vốn chỉ có hai
// đường: model chính, rồi khoá riêng của em. Học sinh KHÔNG thấy việc chuyển:
// không thông báo, cùng câu lệnh, cùng hàng rào sư phạm phía sau. Dữ liệu
// nghiên cứu thì THẤY: kết quả mang tên model và đường đã đi.
//
// Tệp thuần — các bước gọi được tiêm từ ngoài — để `kiem-tra:du-phong` chạy
// bằng Node với model giả, đồng hồ giả, bộ nhớ giả, không tốn lượt nào.
import { loiThanhChuoi } from './loiGemini';
import { phanLoaiLoiGemini, type KhoHet, type VungHet } from './hetLuotMoHinh';
import type { Duong, NhaCungCap } from './danhSachMoHinh';

/** Học sinh chờ một lượt tối đa bao lâu. Lý do chọn 90 giây: xem chú thích
    ngay trên chỗ dùng trong `giaSuFirebaseAI.ts`. */
export const HAN_CHO_MS = 90_000;
/** Còn dưới mức này thì thôi: gọi thêm model nữa chỉ để chắc chắn quá hạn. */
export const CON_LAI_TOI_THIEU_MS = 8_000;
/** Hết lượt PHÚT: cho model đó nghỉ chừng này rồi mới gõ lại. */
export const NGHI_HET_PHUT_MS = 60_000;

/* Lỗi dựng sẵn khi KHÔNG gọi được model nào vì tất cả đã bị đánh dấu từ trước.
   Mang đúng dấu hiệu `thongBaoHetLuot` đọc, để học sinh nhận đúng câu cũ. */
export const LOI_HET_SACH_NGAY =
  '[429 Too Many Requests] GenerateRequestsPerDayPerProjectPerModel-FreeTier: mọi model đã hết lượt hôm nay';
export const LOI_HET_SACH_PHUT =
  '[429 Too Many Requests] GenerateRequestsPerMinutePerProjectPerModel-FreeTier: mọi model đang nghỉ một phút';

export interface BuocGoi {
  duong: Duong;
  nhaCungCap: NhaCungCap;
  maMoHinh: string;
  vung: VungHet;
  /** Khoá riêng của em: chỉ dùng khi MỌI model chung đã hết lượt NGÀY. Chỉ
      hết lượt PHÚT thì chờ một phút là xong, tiêu lượt của em làm gì
      (quy tắc 20/09/2026). */
  chiKhiChungHetNgay?: boolean;
  goi: (chiThi: string | undefined, hanChoMs: number) => Promise<string>;
}

export interface KetQuaGoi {
  text: string;
  maMoHinh: string;
  nhaCungCap: NhaCungCap;
  duong: Duong;
  /** Gọi lại ĐÚNG model vừa trả lời — cho lượt sinh lại của bộ chặn rò. */
  goiLai: (chiThi: string) => Promise<string>;
}

export interface MoiTruongChuoi {
  kho: KhoHet;
  bayGio: () => number;
  /** 'vùng:model' → thời điểm hết nghỉ (ms). Sống trong bộ nhớ của trang. */
  nghiPhut: Map<string, number>;
  tongHanMs: number;
}

export async function goiTheoChuoi(cacBuoc: BuocGoi[], mt: MoiTruongChuoi): Promise<KetQuaGoi> {
  const batDau = mt.bayGio();
  let loiCuoi: unknown = null;
  let loiPhut: unknown = null;
  /* Có model chung nào đang chỉ nghỉ phút (chưa chết hẳn trong ngày) không. */
  let chungChiNghiPhut = false;
  let daGoi = false;

  for (const b of cacBuoc) {
    const ma = `${b.vung}:${b.maMoHinh}`;
    const bayGio = mt.bayGio();
    if (b.chiKhiChungHetNgay && chungChiNghiPhut) continue;
    if (!mt.kho.conDung(b.vung, b.maMoHinh, new Date(bayGio))) continue;
    if ((mt.nghiPhut.get(ma) ?? 0) > bayGio) {
      if (!b.chiKhiChungHetNgay) chungChiNghiPhut = true;
      continue;
    }

    const conLai = batDau + mt.tongHanMs - bayGio;
    if (daGoi && conLai < CON_LAI_TOI_THIEU_MS) break;
    daGoi = true;
    try {
      const text = await b.goi(undefined, Math.min(mt.tongHanMs, conLai));
      return {
        text, maMoHinh: b.maMoHinh, nhaCungCap: b.nhaCungCap, duong: b.duong,
        goiLai: (chiThi) => b.goi(chiThi, mt.tongHanMs),
      };
    } catch (loi) {
      loiCuoi = loi;
      const loai = phanLoaiLoiGemini(loiThanhChuoi(loi));
      if (loai === 'het-ngay' || loai === 'mo-hinh-hong') {
        mt.kho.danhDau(b.vung, b.maMoHinh, new Date(mt.bayGio()));
        continue;
      }
      if (loai === 'het-phut') {
        mt.nghiPhut.set(ma, mt.bayGio() + NGHI_HET_PHUT_MS);
        loiPhut = loi;
        if (!b.chiKhiChungHetNgay) chungChiNghiPhut = true;
        continue;
      }
      if (loai === 'may-chu') continue;
      /* App Check, quá hạn, mạng, lỗi lạ: đổi model không cứu được. */
      throw loi;
    }
  }
  /* Còn model chỉ nghỉ phút thì nói đúng là "chờ một phút", đừng doạ
     "hết lượt cả ngày" — em sẽ bỏ đi trong khi một phút nữa là hỏi được. */
  if (chungChiNghiPhut) throw loiPhut ?? new Error(LOI_HET_SACH_PHUT);
  throw loiCuoi ?? new Error(LOI_HET_SACH_NGAY);
}
```

- [ ] **Bước 4: Chạy phép kiểm, phải ĐẠT**

Chạy: `npm run kiem-tra:du-phong && npm run lint`
Kỳ vọng: `>>> TẤT CẢ ĐẠT`.

Lưu ý ca "chỉ hết lượt PHÚT": `chinh` hết phút, `a` hết ngày → `loiPhut` là lỗi của `chinh` → `thongBaoHetLuot` ra câu "giới hạn số câu mỗi phút". Ca "mọi model chết từ trước": không có lỗi nào → `LOI_HET_SACH_NGAY` → câu "toàn hệ thống".

- [ ] **Bước 5: Phá thử một lần**

Tạm xoá điều kiện `if (b.chiKhiChungHetNgay && chungChiNghiPhut) continue;` → chạy → phải có `SAI` ở dòng "KHÔNG tiêu khoá riêng". Hoàn lại → ĐẠT.

- [ ] **Bước 6: Commit**

```bash
git add src/features/tutor/services/chuoiDuPhong.ts scripts/kiem-tra-du-phong.mts
git commit -m "Them goiTheoChuoi: chuyen model khi het luot, giu khoa rieng cho luc het ngay"
```

---

### Việc 4: Nối chuỗi vào gia sư, ghi đúng model

**Tệp:**
- Sửa: `src/features/tutor/services/giaSuFirebaseAI.ts:43-74`
- Sửa: `src/features/tutor/services/giaSuKeyRieng.ts:15-27`
- Sửa: `src/features/tutor/services/geminiTutorService.ts` (import; `KetQuaGiaSu` 136-149; khối gọi 210-297)
- Sửa: `src/features/auth/types.ts:240-248`
- Sửa: `src/core/contexts/AppContext.tsx:1409-1410`
- Sửa: `src/features/tutor/services/telemetryService.ts:142-160`
- Kiểm: `scripts/kiem-tra-su-pham.mts`, `scripts/kiem-tra-du-phong.mts`

**Giao diện:**
- Dùng: `dungHuongDanHeThong` (Việc 1); `GEMINI_XOAY`, `Duong`, `NhaCungCap` (Việc 2); `taoKhoHet` (Việc 2); `goiTheoChuoi`, `BuocGoi`, `MoiTruongChuoi`, `HAN_CHO_MS` (Việc 3)
- Sinh ra: `hoiGeminiQuaFirebase(y: YeuCauGiaSu, hanChoMs?: number)`, `hoiGeminiBangKeyRieng(y, key, hanChoMs?)`; `KetQuaGiaSu.nhaCungCap?: NhaCungCap`, `KetQuaGiaSu.duong?: Duong`; `ChatMessage.nha_cung_cap?: string`, `ChatMessage.duong?: string`

- [ ] **Bước 1: Viết phép kiểm trước**

Trong `scripts/kiem-tra-su-pham.mts`, ngay sau dòng `ok(!csv.includes('@') ...)` (khoảng dòng 266–267), thêm:

```ts
  ok(csv.split('\n')[0].endsWith(',do_dai_noi_dung,nha_cung_cap,duong'),
    'CSV có cột nguồn trả lời và đường đi, thêm ở CUỐI để không xô lệch cột cũ');
```

Trong `scripts/kiem-tra-du-phong.mts`, thêm import `import { readFileSync } from 'node:fs';` và trước dòng tổng kết:

```ts
console.log('\n== Gia sư dùng chuỗi, ghi đúng model ==');
{
  const ma = readFileSync(new URL('../src/features/tutor/services/geminiTutorService.ts', import.meta.url), 'utf8');
  ok(ma.includes('goiTheoChuoi(') && ma.includes('GEMINI_XOAY'), 'geminiTutorService gọi qua chuỗi có xoay vòng');
  ok(!/modelName:\s*GEMINI_MODEL_NAME/.test(ma), 'KHÔNG còn ghi cứng modelName = model chính');
  ok(ma.includes('ket.goiLai('), 'lượt sinh lại đi qua goiLai (đúng model vừa trả lời)');
  const ctx = readFileSync(new URL('../src/core/contexts/AppContext.tsx', import.meta.url), 'utf8');
  ok(/nha_cung_cap:\s*ketQua\.nhaCungCap/.test(ctx) && /duong:\s*ketQua\.duong/.test(ctx),
     'AppContext ghi nguồn trả lời và đường đi xuống chats');
}
```

- [ ] **Bước 2: Chạy để thấy TRƯỢT**

Chạy: `npm run kiem-tra:du-phong; npm run kiem-tra:su-pham`
Kỳ vọng: `SAI` ở cả 4 dòng mới của `du-phong` và dòng CSV của `su-pham`.

- [ ] **Bước 3: `giaSuFirebaseAI.ts` nhận hạn chờ**

Thêm import ở đầu tệp: `import { HAN_CHO_MS } from './chuoiDuPhong';`
Xoá dòng `const HAN_CHO_MS = 90_000;` (dòng 57) — giữ nguyên khối chú thích phía trên nó (giờ nó giải thích hằng số đã chuyển sang `chuoiDuPhong.ts`), thêm một dòng cuối chú thích: `   Hằng số nằm ở chuoiDuPhong.ts từ 01/10/2026: cả chuỗi dùng chung một hạn. */` (thay cho `*/` cũ).
Đổi chữ ký và tuỳ chọn:

```ts
export async function hoiGeminiQuaFirebase(y: YeuCauGiaSu, hanChoMs: number = HAN_CHO_MS): Promise<string> {
```

và `}, { timeout: HAN_CHO_MS });` thành `}, { timeout: hanChoMs });`

- [ ] **Bước 4: `giaSuKeyRieng.ts` nhận hạn chờ**

```ts
export async function hoiGeminiBangKeyRieng(y: YeuCauGiaSu, key: string, hanChoMs?: number): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: key });
  const r = await ai.models.generateContent({
    model: y.model,
    contents: y.contents,
    config: {
      systemInstruction: y.systemInstruction,
      temperature: y.temperature,
      topP: y.topP,
      /* Cùng hạn với đường chính: chuỗi dự phòng chia một hạn chung 90 giây. */
      ...(hanChoMs ? { abortSignal: AbortSignal.timeout(hanChoMs) } : {}),
    },
  });
  return r.text ?? '';
}
```

- [ ] **Bước 5: `geminiTutorService.ts` dùng chuỗi**

Giữ nguyên dòng `import { docKey, coKeyRieng } from './keyRieng';` (vẫn cần cả hai). Thêm:

```ts
import { GEMINI_XOAY, type Duong, type NhaCungCap } from './danhSachMoHinh';
import { taoKhoHet } from './hetLuotMoHinh';
import { goiTheoChuoi, HAN_CHO_MS, type BuocGoi, type MoiTruongChuoi } from './chuoiDuPhong';
```

Thay khối chú thích đầu tệp (dòng 13–25) bằng:

```ts
/* ── Các đường gọi AI, và thứ tự giữa chúng (01/10/2026) ─────────────────────
   1. Model chính `GEMINI_MODEL_NAME` qua Firebase AI Logic — ngày thường chỉ
      đi đường này, y như trước.
   2. Hết lượt: các model trong `GEMINI_XOAY`, cùng đường Firebase. Hạn mức
      tính theo TỪNG model nên mỗi cái còn lượt riêng.
   3. Mọi model chung hết lượt NGÀY mà em đã dán khoá riêng: đi bằng khoá của
      em (`giaSuKeyRieng.ts`). Khoá cũ còn sót vẫn bị xoá trong
      `donDepLuuTruCu()`; khoá mới dùng tên khác (`keyRieng.ts`).
   4. Hết sạch: câu "hết lượt trong ngày" như cũ.
   Học sinh không thấy việc chuyển. `chats` thấy: `model_name`, `nha_cung_cap`,
   `duong`. Thứ tự và lý do: `chuoiDuPhong.ts`, `danhSachMoHinh.ts`. */
```

Thêm vào `KetQuaGiaSu` (sau `modelName?: string;`):

```ts
  /** Ai đã trả lời — học sinh không thấy, dữ liệu nghiên cứu thấy (01/10/2026) */
  nhaCungCap?: NhaCungCap;
  /** Đường đã đi: 'chinh' | 'xoay-gemini' | 'khoa-rieng' */
  duong?: Duong;
```

Đổi chú thích của `latencyMs` thành: `/** Thời gian học sinh chờ (ms), gồm cả lúc gõ cửa model đã hết lượt; không có khi không gọi mô hình */`

Ngay trên `export const generateAIResponseChiTiet`, thêm:

```ts
/* Model đang nghỉ vì hết lượt PHÚT — sống theo phiên trang, không cần lưu. */
const NGHI_PHUT = new Map<string, number>();

const moiTruongChuoi = (): MoiTruongChuoi => ({
  kho: taoKhoHet(typeof localStorage === 'undefined' ? null : localStorage),
  bayGio: () => Date.now(),
  nghiPhut: NGHI_PHUT,
  tongHanMs: HAN_CHO_MS,
});
```

Trong `try { ... }` của `generateAIResponseChiTiet`, thay từ `const formattedHistory = ...` đến hết dòng `const latencyMs = ...` (dòng 211–256) bằng:

```ts
    const noiDung = buildGeminiHistory(history, userQuestion);
    const yeuCau = (moHinh: string, chiThiChan?: string) => ({
      model: moHinh,
      contents: noiDung,
      systemInstruction: dungHuongDanHeThong({
        nhanh, lessonId, chiDanThem: truoc.chiDanThem, chiThiChan,
      }),
      temperature: THAM_SO_SINH.temperature,
      topP: THAM_SO_SINH.topP,
    });

    const quaFirebase = (moHinh: string, duong: Duong): BuocGoi => ({
      duong, nhaCungCap: 'gemini-firebase', maMoHinh: moHinh, vung: 'firebase',
      goi: async (chiThi, han) =>
        (await import('./giaSuFirebaseAI')).hoiGeminiQuaFirebase(yeuCau(moHinh, chiThi), han),
    });
    const khoaCuaEm = docKey();
    const cacBuoc: BuocGoi[] = [
      quaFirebase(GEMINI_MODEL_NAME, 'chinh'),
      ...GEMINI_XOAY.map(m => quaFirebase(m, 'xoay-gemini')),
      ...(khoaCuaEm ? [GEMINI_MODEL_NAME, ...GEMINI_XOAY].map((m): BuocGoi => ({
        duong: 'khoa-rieng', nhaCungCap: 'gemini-khoa-rieng', maMoHinh: m, vung: 'khoa',
        chiKhiChungHetNgay: true,
        goi: async (chiThi, han) =>
          (await import('./giaSuKeyRieng')).hoiGeminiBangKeyRieng(yeuCau(m, chiThi), khoaCuaEm, han),
      })) : []),
    ];

    const batDau = performance.now();
    const ket = await goiTheoChuoi(cacBuoc, moiTruongChuoi());
    let traLoi = ket.text;
    const latencyMs = Math.round(performance.now() - batDau);
    const nguon = { modelName: ket.maMoHinh, nhaCungCap: ket.nhaCungCap, duong: ket.duong };
```

`buildGeminiHistory` (dòng 35–42) giữ nguyên; `noiDung` bằng đúng `formattedHistory` cũ sau khi `pop()` rồi `concat` lại.

Trong khối chặn rò, đổi `sinhLai: async (chiThi) => tachNhanAn(await goiMoHinh(chiThi)).noiDung,` thành:

```ts
        sinhLai: async (chiThi) => tachNhanAn(await ket.goiLai(chiThi)).noiDung,
```

Hai dòng `return` cuối khối `try` đổi `modelName: GEMINI_MODEL_NAME` thành `...nguon`:

```ts
    if (traLoi) return { ...coBan, text: traLoi, latencyMs, ...nguon, daChanRo };
    return {
      ...coBan, latencyMs, ...nguon,
      text: 'Xin lỗi em, thầy/cô đang gặp chút sự cố kỹ thuật. Em có thể nhắc lại câu hỏi được không?',
    };
```

Khối `catch` giữ NGUYÊN (thongBaoHetLuot với `coKeyRieng()`, thongBaoLoiKetNoi, mock).

- [ ] **Bước 6: `types.ts`, `AppContext.tsx`, `telemetryService.ts`**

`src/features/auth/types.ts`, đổi chú thích `latency_ms` và thêm hai trường sau `nhan_hong`:

```ts
  /** Thời gian học sinh chờ (ms), gồm cả lúc gõ cửa model đã hết lượt (từ 01/10/2026); KHÔNG gồm độ trễ giả lập */
  latency_ms?: number;
```

```ts
  /** Nguồn đã trả lời (01/10/2026): 'gemini-firebase' | 'gemini-khoa-rieng'. Lượt không gọi mô hình thì trống */
  nha_cung_cap?: string;
  /** Đường đã đi: 'chinh' | 'xoay-gemini' | 'khoa-rieng'. Lọc 'chinh' để phân tích riêng model gốc */
  duong?: string;
```

`src/core/contexts/AppContext.tsx`, trong `aiMsg`, ngay sau `latency_ms: ketQua.latencyMs,`:

```ts
      nha_cung_cap: ketQua.nhaCungCap,
      duong: ketQua.duong,
```

(`cleanForFirestore` bỏ `undefined`, luật `chats` không có danh sách trường — đã kiểm 01/10/2026.)

`src/features/tutor/services/telemetryService.ts`: thêm `'nha_cung_cap', 'duong'` vào CUỐI `COT_CSV` (sau `'do_dai_noi_dung'`), và trong `xuatCsv` thêm `m.nha_cung_cap, m.duong,` sau `(m.content ?? '').length,`.

- [ ] **Bước 7: Rà các chỗ ép kiểu `as ChatMessage`**

Chạy: `grep -rn "as ChatMessage" src/`
Kỳ vọng (đã kiểm 01/10/2026): `firestoreService.ts` và `theoDoiService.ts` chỉ ép kiểu cả tài liệu, trường tuỳ chọn tự đi theo. Nếu thấy chỗ nào dựng `ChatMessage` từng trường một, thêm hai trường mới vào đó.

- [ ] **Bước 8: Chạy phép kiểm, phải ĐẠT**

Chạy: `npm run lint && npm run kiem-tra:du-phong && npm run kiem-tra:su-pham && npm run kiem-tra:het-luot && npm run kiem-tra:an-ninh && npm run kiem-tra:thuc-nghiem`
Kỳ vọng: tất cả `ĐẠT`; riêng `kiem-tra:an-ninh` dòng "nhật ký lỗi không mang theo khoá" vẫn ĐẠT.

- [ ] **Bước 9: Thử trên trình duyệt (máy dev)**

`npm run dev` (cần `VITE_APPCHECK_DEBUG_TOKEN` trong `.env.development.local`). Đăng nhập tài khoản thử (đọc `docs/claude-reference/testing.md` trước — ghi dữ liệu thật). Mở một bài, F12 → Console:

```js
localStorage.setItem('h11_mo_hinh_het', JSON.stringify({
  'firebase:gemini-3.6-flash': new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
}));
```

Hỏi một câu. Kỳ vọng: trả lời bình thường, không có câu báo nào; tab Network có request tới `.../models/gemini-3.8-flash:generateContent` và KHÔNG có tới `gemini-3.6-flash`; tài liệu mới trong Firestore `chats` có `model_name: "gemini-3.8-flash"`, `nha_cung_cap: "gemini-firebase"`, `duong: "xoay-gemini"`. Xoá khoá `h11_mo_hinh_het` sau khi thử. Mỗi lần thử tốn 1 lượt của model dự phòng.

- [ ] **Bước 10: Commit**

```bash
git add src/features/tutor/services/giaSuFirebaseAI.ts src/features/tutor/services/giaSuKeyRieng.ts src/features/tutor/services/geminiTutorService.ts src/features/auth/types.ts src/core/contexts/AppContext.tsx src/features/tutor/services/telemetryService.ts scripts/kiem-tra-su-pham.mts scripts/kiem-tra-du-phong.mts
git commit -m "Gia su xoay vong model Gemini khi het luot, ghi dung model va duong vao chats"
```

---

### Việc 5: Canh danh sách model, ghi tài liệu

**Tệp:**
- Sửa: `scripts/kiem-tra-gemini.mts` (khối "Model còn tồn tại")
- Sửa: `docs/claude-reference/project.md:21`, `docs/claude-reference/security.md` (đoạn "Key Gemini lộ trên Netlify" ~237-250)

**Giao diện:**
- Dùng: `GEMINI_XOAY` (Việc 2)

- [ ] **Bước 1: `kiem-tra-gemini.mts` hỏi cả danh sách xoay**

Thêm import `import { GEMINI_XOAY } from '../src/features/tutor/services/danhSachMoHinh';`. Trong khối `try`, ngay sau `ok(co, ...)` của model chính:

```ts
    /* Model xoay vòng bị Google gỡ thì gia sư không chết (chuỗi đánh dấu nó
       hỏng rồi đi tiếp), nhưng mỗi ngày phí một lượt gõ cửa và mất một tầng
       dự phòng mà không ai biết. */
    for (const m of GEMINI_XOAY) {
      ok(ten.includes(m), `model xoay vòng \`${m}\` còn được cấp`,
         ten.includes(m) ? '' : 'Gỡ tên này khỏi GEMINI_XOAY trong src/features/tutor/services/danhSachMoHinh.ts.');
    }
```

Chạy: `npm run kiem-tra:gemini`
Kỳ vọng: 6 dòng `OK` mới (hoặc `BỎ QUA` cả khối nếu máy không có `.env.local`). Không tốn lượt sinh nội dung.

- [ ] **Bước 2: Tài liệu**

`docs/claude-reference/project.md`, ô AI của dòng 21, thêm vào cuối ô: ` Hết lượt thì xoay sang các model Gemini khác cùng dự án (`src/features/tutor/services/danhSachMoHinh.ts`, `src/features/tutor/services/chuoiDuPhong.ts`), học sinh không thấy; `chats` ghi `model_name`/`nha_cung_cap`/`duong` (01/10/2026).`

`docs/claude-reference/security.md`, cuối đoạn có câu "Chỉ AI Logic bật App Check", thêm một gạch đầu dòng:

```markdown
- **Xoay vòng model (01/10/2026).** Mọi model trong chuỗi đi CÙNG đường AI Logic,
  cùng thẻ App Check — không thêm khoá, không thêm tên miền CSP. `localStorage`
  khoá `h11_mo_hinh_het` chỉ chứa tên model và ngày, không có gì của học sinh.
  Khoá riêng của em vẫn chỉ dùng khi mọi model chung đã hết lượt NGÀY.
```

- [ ] **Bước 3: Kiểm toàn bộ rồi commit**

Chạy: `npm run lint && npm run kiem-tra`
Kỳ vọng: mọi bộ ĐẠT. Bộ nào báo `BỎ QUA` (ví dụ `kiem-tra:dong-bo` khi mất mạng) thì ghi rõ trong báo cáo.

```bash
git add scripts/kiem-tra-gemini.mts docs/claude-reference/project.md docs/claude-reference/security.md
git commit -m "kiem-tra:gemini hoi ca danh sach model xoay vong; ghi kien truc moi vao tai lieu"
```

---

## Sau khi xong Kế hoạch A

- Chủ dự án build và deploy như hiện nay (kéo thả vẫn được — A không có Functions).
- Chủ dự án mở AI Studio xem hạn mức thật của 6 model; số nào khác xa ghi chú trong `danhSachMoHinh.ts` thì báo lại để đổi thứ tự.
- Viết Kế hoạch B (máy chủ `/api/gia-su`) dựa trên `BuocGoi`/`goiTheoChuoi` của A: tầng máy chủ chỉ là thêm `BuocGoi` mới với `nhaCungCap`/`duong` mới.
