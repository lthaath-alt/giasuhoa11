# Gia sư AI gọi Gemini qua Firebase AI Logic — Kế hoạch thi công

> **Cho người/AI thực hiện:** làm lần lượt từng việc, đánh dấu `- [ ]` khi xong. Dùng kỹ năng `executing-plans`. KHÔNG push, KHÔNG deploy — chủ dự án tự làm.

**Mục tiêu:** Bản Netlify không còn chứa key Gemini nào trong gói JS, mà gia sư vẫn trả lời bằng đúng model, đúng câu lệnh, đúng tham số như hôm nay.

**Kiến trúc:** Bản build gọi Gemini qua `firebase/ai` (Firebase AI Logic, nhà cung cấp Gemini Developer API). Firebase giữ quyền gọi Gemini ở phía máy chủ bằng tài khoản dịch vụ do Google quản lý; trình duyệt chỉ chứng minh "đúng là app này" bằng App Check (reCAPTCHA Enterprise). Đường cũ giữ nguyên: key riêng học sinh tự nhập (localStorage) vẫn đi `@google/genai`.

**Công nghệ:** `firebase` 12.16.0 đã cài (có sẵn `firebase/ai`, `firebase/app-check`) — KHÔNG cài gói mới. `@google/genai` giữ lại cho key riêng người dùng và các script.

**Căn cứ:** phát hiện ngày 13/09/2026 — key `VITE_GEMINI_API_KEY` (dạng `AQ.`) nằm nguyên văn trong `dist/`; key `AQ.` gắn tài khoản dịch vụ KHÔNG giới hạn được theo website; key chuẩn thì Google đang khai tử (tháng 9/2026).

## Ràng buộc chung

- Model: `GEMINI_MODEL_NAME` trong `src/core/constants.ts` (`gemini-3.6-flash`) — KHÔNG đổi.
- Câu lệnh hệ thống: ghép y hệt hôm nay (`dungPrompt(nhanhCuaHocSinh(email))` + danh mục bài + ngữ cảnh bài/dàn bài) — KHÔNG đổi thứ tự, KHÔNG đổi dấu phân cách `'='.repeat(60)`.
- `temperature: 0.7`, `topP: 0.9` — KHÔNG đổi. Không thêm `thinkingConfig`, không bật `includeThoughts`.
- Không một chuỗi dạng key Google (`AQ.…`, `AIza…`) nào trong `dist/` ngoài khoá web Firebase công khai.
- CSP: KHÔNG thêm `'unsafe-inline'` hay `'unsafe-eval'` vào `script-src`.
- Chạy `npm run lint` một lần cuối mỗi việc có sửa mã; `npm run kiem-tra` trước mỗi commit.

## Tệp sẽ đụng tới

| Tệp | Việc |
|---|---|
| `src/features/tutor/services/loiGemini.ts` (MỚI) | `loiThanhChuoi()` — gộp `message` + `customErrorData` của lỗi thành một chuỗi. Không import gì, chạy được bằng Node |
| `src/features/tutor/services/giaSuFirebaseAI.ts` (MỚI) | Bật App Check một lần, gọi `firebase/ai`. Chỉ nạp động (dynamic import) |
| `src/features/tutor/services/geminiTutorService.ts` | Chọn đường gọi; bỏ đọc `VITE_GEMINI_API_KEY`; thêm `coGiaSuAI()` |
| `src/features/tutor/components/TutorChat.tsx:20,48-52` | Dùng `coGiaSuAI()` |
| `src/pages/DashboardPage.tsx:62,100-104` | Dùng `coGiaSuAI()` |
| `src/core/services/firebase.ts:23` | `export` biến `app` |
| `src/core/services/firebaseCongKhai.ts` | Thêm site key reCAPTCHA (công khai); sửa chú thích dòng 15-17 đang nói sai |
| `public/_headers` | CSP cho phép reCAPTCHA |
| `scripts/kiem-tra-het-luot.mts` | Thêm ca lỗi 429 dạng Firebase |
| `scripts/kiem-tra-an-ninh.mts:399-420` | Bắt thêm key dạng `AQ.`, cấm `VITE_GEMINI_API_KEY`, quét `dist/` |
| `.env.local`, `.env.development.local`, `.env.example` | Bỏ key web; thêm debug token cho máy dev |
| `CLAUDE.md` | Cập nhật dòng AI, mục biến môi trường, mục An ninh |

---

## Phần A — Việc CHỦ DỰ ÁN làm trên console

Làm A1–A4 trước Việc 6. A5 chỉ làm ở Việc 8.

- [x] **A1. Bật Firebase AI Logic.** Firebase Console → dự án `giasuhoa11` → **AI Logic** → **Get started** → chọn **Gemini Developer API**. Console tự bật API cần thiết và tự bật App Check cho AI Logic. Dự án vẫn ở gói Spark.
- [x] **A2. Tạo key reCAPTCHA Enterprise.** Google Cloud Console (project `giasuhoa11`) → **Security → reCAPTCHA** → **Create key** → loại **Website**, tên miền: `<ten-site>.netlify.app`. **KHÔNG** thêm `localhost`, **KHÔNG** bật "Use checkbox challenge". Chép **site key** (dạng `6L…`, công khai) gửi cho Claude.
- [x] **A3. Đăng ký App Check.** Firebase Console → **App Check** → **Apps** → web app → **reCAPTCHA Enterprise** → dán site key ở A2 → Save.
- [ ] **A4. Debug token cho máy dev** (token Claude tạo sẵn trong `.env.development.local`, biến `VITE_APPCHECK_DEBUG_TOKEN` — nên bỏ qua được bước chờ Console in token): App Check → Apps → menu ⋮ của web app → **Manage debug tokens** → Add → dán token.
- [ ] **A5. Xoá hai key cũ** — CHỈ sau khi Việc 8 xác nhận production chạy: key đuôi `…hsiA` và key `web-hoc-sinh` trong AI Studio / Cloud Console → Credentials.

---

## Việc 1: Viết phép kiểm trước — XONG 13/09/2026 (`e822446`)

**Tệp:**
- Tạo: `src/features/tutor/services/loiGemini.ts`
- Sửa: `scripts/kiem-tra-het-luot.mts`, `scripts/kiem-tra-an-ninh.mts:399-420`

**Giao diện:**
- Tạo ra: `loiThanhChuoi(loi: unknown): string`

- [ ] **Bước 1: Tạo `loiGemini.ts` với thân rỗng** (để phép kiểm chạy được và HỎNG đúng chỗ):

```ts
/* Gộp một lỗi gọi Gemini thành MỘT chuỗi để thongBaoHetLuot đọc.

   Vì sao cần: `@google/genai` nhét cả JSON lỗi (quotaId, retryDelay) vào
   `message`. `firebase/ai` thì KHÔNG — message chỉ có "[429 Too Many
   Requests] …", còn quotaId và retryDelay nằm trong `customErrorData.
   errorDetails` (đọc từ mã nguồn @firebase/ai 12.16.0). Đọc mỗi `message`
   thì hết lượt NGÀY bị báo thành hết lượt PHÚT, và học sinh ngồi bấm lại cả
   buổi — đúng lỗi mà thongBaoHetLuot sinh ra để chặn.

   Tệp này cố ý không import gì, để script Node gọi được. */
export const loiThanhChuoi = (loi: unknown): string => '';
```

- [ ] **Bước 2: Thêm ca Firebase vào `scripts/kiem-tra-het-luot.mts`.** Sửa dòng import đầu tệp và thêm khối ngay trước dòng `console.log('\n' + (hong === 0 …`:

```ts
import { thongBaoHetLuot } from '../src/features/tutor/services/geminiTutorService';
import { loiThanhChuoi } from '../src/features/tutor/services/loiGemini';
```

```ts
/* Lỗi 429 như `firebase/ai` ném ra — dựng theo mã nguồn @firebase/ai 12.16.0
   (AIError: message có "[429 Too Many Requests]", quotaId và retryDelay nằm
   trong customErrorData.errorDetails, KHÔNG nằm trong message). */
const loiFirebase = (quotaId: string, giay: string) => Object.assign(
  new Error('AI: Error fetching from https://firebasevertexai.googleapis.com/v1beta/projects/'
    + 'giasuhoa11/models/gemini-3.6-flash:generateContent: [429 Too Many Requests] '
    + 'You exceeded your current quota. (AI/fetch-error)'),
  {
    code: 'fetch-error',
    customErrorData: {
      status: 429,
      statusText: 'Too Many Requests',
      errorDetails: [
        { '@type': 'type.googleapis.com/google.rpc.QuotaFailure', violations: [{ quotaId }] },
        { '@type': 'type.googleapis.com/google.rpc.RetryInfo', retryDelay: `${giay}s` },
      ],
    },
  },
);

const fPhut = thongBaoHetLuot(loiThanhChuoi(loiFirebase('GenerateRequestsPerMinutePerProjectPerModel-FreeTier', '41')));
const fNgay = thongBaoHetLuot(loiThanhChuoi(loiFirebase('GenerateRequestsPerDayPerProjectPerModel-FreeTier', '57')));

console.log('\n== Lỗi dạng Firebase AI Logic ==');
console.log('   ' + fPhut);
console.log('   ' + fNgay);
ok(fPhut.includes('mỗi phút') && fPhut.includes('41 giây'), 'Firebase: hết lượt PHÚT, đúng số giây');
ok(fNgay.includes('trong ngày') && !/\d+ giây/.test(fNgay), 'Firebase: hết lượt NGÀY, không báo nhầm thành chờ giây');
ok(thongBaoHetLuot(loiThanhChuoi(new Error(LOI_NGAY))) === tNgay, 'lỗi @google/genai đi qua loiThanhChuoi vẫn ra y như cũ');
```

- [ ] **Bước 3: Sửa khối "Không lộ bí mật" trong `scripts/kiem-tra-an-ninh.mts`** — thay nguyên dòng 399-420 bằng:

```ts
console.log('\n== Không lộ bí mật trong mã nguồn và bản dựng ==');
{
  /* Khoá web của Firebase KHÔNG phải bí mật (nó vốn nằm trong gói JS ai cũng
     đọc được — an toàn dựa vào Firestore Rules). Nhưng khoá Gemini thì có.

     Ngày 13/09/2026 phép kiểm cũ báo ĐẠT trong khi key Gemini nằm nguyên văn
     trên Netlify, vì nó mù ba chỗ: chỉ biết mẫu `AIza` (key cấp từ 2026 bắt
     đầu bằng `AQ.`), chỉ soi `src/` (key đi vào gói JS qua biến môi trường
     VITE_, không hề nằm trong mã), và không cấm đọc biến đó. */
  const MAU_KEY = /AIza[0-9A-Za-z_-]{30,}|AQ\.[0-9A-Za-z_-]{20,}/g;
  const khoaFirebase = doc(join(GOC, 'src/core/services/firebaseCongKhai.ts'));

  const pham: string[] = [];
  for (const f of tepNguon) {
    if (basename(f) === 'firebaseCongKhai.ts') continue;
    doc(f).split(/\r?\n/).forEach((d, i) => {
      if (new RegExp(MAU_KEY.source).test(d)) pham.push(`${ten(f)}:${i + 1}`);
    });
  }
  if (pham.length) truot('không có khoá API viết cứng trong src/', pham.join(', '));
  else dat('không có khoá API viết cứng trong src/');

  /* Mọi biến `VITE_*` đều bị Vite chép nguyên văn vào gói JS. Key Gemini mà
     đi qua đó là lộ, bất kể `.env.local` có nằm trong .gitignore hay không. */
  const docBien = tepNguon.filter(f => /VITE_GEMINI_API_KEY|import\.meta\.env\.GEMINI_API_KEY/.test(doc(f)));
  if (docBien.length) truot('mã trình duyệt không đọc key Gemini từ biến môi trường', docBien.map(ten).join(', '));
  else dat('mã trình duyệt không đọc key Gemini từ biến môi trường');

  const DIST = join(GOC, 'dist');
  if (!existsSync(DIST)) {
    dat('chưa có dist/ — bỏ qua phép quét bản dựng');
  } else {
    const lo = new Set<string>();
    for (const f of moiTep(DIST, ['.js', '.html'])) {
      for (const m of doc(f).matchAll(MAU_KEY)) if (!khoaFirebase.includes(m[0])) lo.add(ten(f));
    }
    if (lo.size) truot('dist/ không chứa key Google nào ngoài khoá Firebase công khai', [...lo].join(', ') + ' — build lại rồi chạy lại');
    else dat('dist/ không chứa key Google nào ngoài khoá Firebase công khai');
  }
}
```

- [ ] **Bước 4: Chạy để thấy HỎNG đúng chỗ.**

Chạy: `npm run kiem-tra:het-luot` → Kỳ vọng: 3 mục mới HỎNG, các mục cũ vẫn OK.
Chạy: `npm run kiem-tra:an-ninh` → Kỳ vọng: SAI ở "không đọc key Gemini từ biến môi trường" (geminiTutorService.ts, TutorChat.tsx, DashboardPage.tsx) và SAI ở "dist/ không chứa key" (dist/ ngày 12/09).

- [ ] **Bước 5: Viết thân thật cho `loiThanhChuoi`:**

```ts
export const loiThanhChuoi = (loi: unknown): string => {
  const e = loi as { message?: unknown; customErrorData?: unknown } | null | undefined;
  const message = typeof e?.message === 'string' ? e.message : String(loi ?? '');
  return e?.customErrorData ? `${message} ${JSON.stringify(e.customErrorData)}` : message;
};
```

- [ ] **Bước 6:** `npm run kiem-tra:het-luot` → Kỳ vọng: TẤT CẢ ĐẠT. (`kiem-tra:an-ninh` vẫn SAI — sẽ xanh ở Việc 3 và Việc 7.)
- [ ] **Bước 7: Commit**

```bash
git add src/features/tutor/services/loiGemini.ts scripts/kiem-tra-het-luot.mts scripts/kiem-tra-an-ninh.mts
git commit -m "Phep kiem: loi 429 dang Firebase, key AQ., bien VITE_GEMINI_API_KEY va quet dist"
```

---

## Việc 2: Đường gọi qua Firebase AI Logic — XONG 13/09/2026 (`17ae4dd`)

**Cần có:** site key reCAPTCHA từ A2.

**Tệp:**
- Tạo: `src/features/tutor/services/giaSuFirebaseAI.ts`
- Sửa: `src/core/services/firebase.ts:23`, `src/core/services/firebaseCongKhai.ts`

**Giao diện:**
- Tạo ra: `export const app: FirebaseApp` (firebase.ts); `export const RECAPTCHA_ENTERPRISE_SITE_KEY: string` (firebaseCongKhai.ts); `export interface YeuCauGiaSu { model: string; contents: { role: 'user' | 'model'; parts: { text: string }[] }[]; systemInstruction: string; temperature: number; topP: number }`; `export async function hoiGeminiQuaFirebase(y: YeuCauGiaSu): Promise<string>`

- [ ] **Bước 1: `firebase.ts` dòng 23** — đổi `const app =` thành `export const app =`.
- [ ] **Bước 2: `firebaseCongKhai.ts`** — thay chú thích dòng 15-17 và thêm hằng cuối tệp:

```ts
 * KHÔNG bao giờ thêm key Gemini hay khoá tài khoản dịch vụ vào tệp này.
 * Bản build KHÔNG còn chứa key Gemini: gia sư gọi qua Firebase AI Logic
 * (xem giaSuFirebaseAI.ts). `GEMINI_API_KEY` trong `.env.local` chỉ dành cho
 * script Node trong `scripts/`. `npm run kiem-tra:an-ninh` quét `dist/` để
 * canh điều này — ngày 13/09/2026 dòng chú thích cũ ở đây nói "đã kiểm" trong
 * khi key đang nằm nguyên văn trên Netlify.
```

```ts
/**
 * Site key reCAPTCHA Enterprise cho App Check — CÔNG KHAI, cùng lý do với
 * sáu giá trị trên: reCAPTCHA thiết kế nó để nằm trên trang. Nó chỉ dùng
 * được trên các tên miền khai trong Google Cloud Console → reCAPTCHA.
 * Chuỗi rỗng = chưa cấu hình → bản build không gọi Firebase AI Logic.
 */
export const RECAPTCHA_ENTERPRISE_SITE_KEY = '<site key chủ dự án gửi ở bước A2>';
```

- [ ] **Bước 3: Tạo `giaSuFirebaseAI.ts`:**

```ts
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { app } from '../../../core/services/firebase';
import { RECAPTCHA_ENTERPRISE_SITE_KEY } from '../../../core/services/firebaseCongKhai';

/* Gọi Gemini qua Firebase AI Logic — đường MẶC ĐỊNH của bản build.

   Vì sao không gọi thẳng Gemini bằng key như trước: key phải nằm trong gói JS
   thì trình duyệt mới gọi được, và ngày 13/09/2026 nó đã nằm nguyên văn trên
   Netlify. Key dạng `AQ.` lại không giới hạn được theo website. Ở đây Firebase
   giữ quyền gọi Gemini phía máy chủ; trình duyệt chỉ nộp token App Check.

   Tệp này CHỈ được nạp động từ geminiTutorService (`await import(...)`):
   firebase/ai + app-check + reCAPTCHA chỉ tải khi có người hỏi gia sư, và
   script Node import geminiTutorService không kéo theo chúng. */

export interface YeuCauGiaSu {
  model: string;
  contents: { role: 'user' | 'model'; parts: { text: string }[] }[];
  systemInstruction: string;
  temperature: number;
  topP: number;
}

let daBatAppCheck = false;

function batAppCheck(): void {
  if (daBatAppCheck) return;
  /* Máy dev không qua được reCAPTCHA (localhost cố ý KHÔNG nằm trong key).
     Debug token chỉ bật khi `npm run dev`; khi build `import.meta.env.DEV`
     là false nên cả nhánh bị cắt khỏi gói JS. */
  if (import.meta.env.DEV) {
    (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean })
      .FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
  }
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_ENTERPRISE_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  });
  daBatAppCheck = true;
}

export async function hoiGeminiQuaFirebase(y: YeuCauGiaSu): Promise<string> {
  batAppCheck();
  const ai = getAI(app, { backend: new GoogleAIBackend() });
  const model = getGenerativeModel(ai, {
    model: y.model,
    systemInstruction: y.systemInstruction,
    generationConfig: { temperature: y.temperature, topP: y.topP },
  });
  const { response } = await model.generateContent({ contents: y.contents });
  // text() đã bỏ các phần "suy nghĩ" (thought) — giống response.text của @google/genai.
  return response.text();
}
```

- [ ] **Bước 4:** `npm run lint` → 0 lỗi.
- [ ] **Bước 5: Commit**

```bash
git add src/features/tutor/services/giaSuFirebaseAI.ts src/core/services/firebase.ts src/core/services/firebaseCongKhai.ts
git commit -m "Them duong goi Gemini qua Firebase AI Logic va App Check (chua noi vao gia su)"
```

---

## Việc 3: Nối vào gia sư, bỏ key web — XONG 13/09/2026 (`bf6ec95`)

**Tệp:** `geminiTutorService.ts`, `TutorChat.tsx`, `DashboardPage.tsx`

**Giao diện:**
- Dùng: `loiThanhChuoi` (Việc 1); `YeuCauGiaSu`, `hoiGeminiQuaFirebase`, `RECAPTCHA_ENTERPRISE_SITE_KEY` (Việc 2)
- Tạo ra: `export const coGiaSuAI = (): boolean`

- [ ] **Bước 1: Import** — thêm vào đầu `geminiTutorService.ts`:

```ts
import { RECAPTCHA_ENTERPRISE_SITE_KEY } from '../../../core/services/firebaseCongKhai';
import { loiThanhChuoi } from './loiGemini';
```

- [ ] **Bước 2: `getEffectiveApiKey`** — thay dòng `return import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || 'MISSING_API_KEY';` bằng:

```ts
  /* Không còn key của web ở đây. Key đọc từ biến VITE_ bị Vite chép nguyên
     văn vào gói JS — ngày 13/09/2026 nó nằm trên Netlify. Web nay gọi qua
     Firebase AI Logic (giaSuFirebaseAI.ts); hàm này chỉ còn trả key RIÊNG
     người dùng tự nhập. */
  return 'MISSING_API_KEY';
```

và sửa câu cuối chú thích phía trên hàm: "Key của người dùng được ưu tiên" → "Chỉ trả key riêng người dùng tự nhập".

- [ ] **Bước 3: `buildGeminiHistory`** — đổi dòng `role: msg.sender === 'user' ? 'user' : 'model',` thành:

```ts
    role: msg.sender === 'user' ? ('user' as const) : ('model' as const),
```

- [ ] **Bước 4: Thêm `coGiaSuAI`** ngay trước dòng `// Create a new instance dynamically`:

```ts
/* Gia sư có gọi được AI thật không. TutorChat và DashboardPage dựa vào đây để
   quyết định có đòi học sinh nhập key riêng không — hỏi ở MỘT chỗ để ba nơi
   không nói khác nhau. */
export const coGiaSuAI = (): boolean =>
  getEffectiveApiKey() !== 'MISSING_API_KEY' || RECAPTCHA_ENTERPRISE_SITE_KEY.length > 0;
```

- [ ] **Bước 5: `generateAIResponse`** — thay dòng 133-134:

```ts
  if (!coGiaSuAI()) {
    console.warn('Chưa cấu hình gia sư AI. Fallback sang mock service.');
```

Thay khối dòng 166-187 (từ `const response = await getAiInstance()…` tới hết `if (response.text) {…}`) bằng:

```ts
    const yeuCau = {
      model: GEMINI_MODEL_NAME,
      contents: formattedHistory.concat({ role: 'user' as const, parts: [{ text: latestMessage }] }),
      systemInstruction: [
        /* Chia nhóm thực nghiệm ngay tại đây, chỗ duy nhất câu lệnh được ghép.
           Khi KHÔNG chạy nghiên cứu (mặc định) hàm này luôn trả 'socratic',
           tức là web chạy y như cũ. */
        dungPrompt(nhanhCuaHocSinh(userEmail)),
        '='.repeat(60),
        danhMucBai,
        ...(nguCanhBai ? ['='.repeat(60), nguCanhBai] : []),
        ...(danBaiChung ? ['='.repeat(60), danBaiChung] : []),
      ].join('\n\n'),
      temperature: 0.7, // Nhiệt độ vừa phải để sáng tạo nhưng vẫn giữ chuẩn kiến thức
      topP: 0.9,
    };

    /* Hai đường, CÙNG một yêu cầu `yeuCau` — model, câu lệnh và tham số không
       thể lệch nhau giữa các đường, vì dữ liệu nghiên cứu cần model ổn định:
       - Key riêng người dùng tự nhập: @google/genai.
       - Còn lại (bản build cho học sinh): Firebase AI Logic. */
    const traLoi = getEffectiveApiKey() !== 'MISSING_API_KEY'
      ? (await getAiInstance().models.generateContent({
          model: yeuCau.model,
          contents: yeuCau.contents,
          config: {
            systemInstruction: yeuCau.systemInstruction,
            temperature: yeuCau.temperature,
            topP: yeuCau.topP,
          },
        })).text
      : await (await import('./giaSuFirebaseAI')).hoiGeminiQuaFirebase(yeuCau);

    if (traLoi) {
        return traLoi;
    }
```

- [ ] **Bước 6: Khối `catch`** — thay từ `const msg = …` tới trước dòng `// Fallback sang mock service…` bằng:

```ts
    const chuoiLoi = loiThanhChuoi(error);
    const msg = chuoiLoi.toLowerCase();
    const hetLuot = thongBaoHetLuot(chuoiLoi);
    if (hetLuot) return hetLuot;

    // Check for 400 bad request / Invalid API Key
    if (msg.includes('api_key_invalid') || msg.includes('api key not valid')) {
      return 'API key không hợp lệ. Vui lòng kiểm tra lại API key trong cài đặt ⚙️ nhé!';
    }

    /* Lỗi ở đường Firebase (App Check từ chối, AI Logic chưa bật, máy chủ lỗi)
       thì BÁO THẬT, không rơi sang kịch bản mẫu: kịch bản mẫu trông như AI trả
       lời, học sinh không biết là hỏng, và chủ dự án cũng không biết mà sửa. */
    if (msg.includes('firebasevertexai') || msg.includes('app check') || msg.includes('appcheck')) {
      return 'Gia sư AI đang tạm mất kết nối với máy chủ. Em thử lại sau ít phút nhé!';
    }
```

- [ ] **Bước 7: `TutorChat.tsx`** — dòng 20 đổi import thành `import { coGiaSuAI } from '../services/geminiTutorService';`; thay dòng 48-51 bằng:

```ts
  /* Hỏi coGiaSuAI chứ KHÔNG đọc thẳng localStorage: bản build gọi Gemini qua
     Firebase AI Logic mà không cần key nào. Nếu chỉ đọc localStorage thì
     học sinh nào cũng bị đòi tự nhập key riêng. */
  const coKey = coGiaSuAI;
```

- [ ] **Bước 8: `DashboardPage.tsx`** — dòng 62 đổi import thành `import { coGiaSuAI } from '../features/tutor/services/geminiTutorService';`; thay dòng 100-103 bằng:

```ts
  /* Hỏi coGiaSuAI chứ KHÔNG đọc thẳng localStorage: bản build gọi Gemini qua
     Firebase AI Logic mà không cần key nào. Đọc mỗi localStorage sẽ chặn nhầm
     người dùng dù app thừa sức gọi Gemini. */
  const coKey = coGiaSuAI;
```

- [ ] **Bước 9:** `grep -rn "getEffectiveApiKey\|VITE_GEMINI_API_KEY" src` → chỉ còn định nghĩa và hai chỗ dùng trong `geminiTutorService.ts`, không còn `VITE_GEMINI_API_KEY`.
- [ ] **Bước 10:** `npm run lint` → 0 lỗi. `npm run kiem-tra:het-luot` → ĐẠT. `npm run kiem-tra:an-ninh` → chỉ còn SAI ở mục `dist/` (build cũ).
- [ ] **Bước 11: Commit**

```bash
git add src/features/tutor/services/geminiTutorService.ts src/features/tutor/components/TutorChat.tsx src/pages/DashboardPage.tsx
git commit -m "Gia su ban build goi Gemini qua Firebase AI Logic, bo key web khoi goi JS"
```

---

## Việc 4: CSP cho reCAPTCHA — XONG 13/09/2026 (`950def6`)

**Tệp:** `public/_headers` (dòng `Content-Security-Policy:`)

- [ ] **Bước 1:** Trong dòng `Content-Security-Policy:`, đổi đúng hai đoạn:
  - `script-src 'self';` → `script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/;`
  - `frame-src 'self';` → `frame-src 'self' https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/;`

  `connect-src` đã có `https://*.googleapis.com` (gồm `firebasevertexai.googleapis.com`, `content-firebaseappcheck.googleapis.com`) và `https://*.google.com` — không đổi.

- [ ] **Bước 2:** Thêm vào khối chú thích CSP phía trên:

```
  #  script-src/frame-src thêm reCAPTCHA (13/09/2026): App Check của Firebase
  #                      AI Logic tải script và khung ẩn từ hai tên miền đó.
  #                      Thiếu thì gia sư báo "mất kết nối" trên Netlify mà máy
  #                      dev vẫn chạy (Vite không đọc tệp này). Chỉ thêm ĐƯỜNG
  #                      DẪN /recaptcha/, không thêm cả tên miền google.com.
```

- [ ] **Bước 3:** `npm run kiem-tra:an-ninh` → các mục về `_headers` vẫn OK (`bam-csp.mts` chèn hash sau `script-src 'self'`, chuỗi đó vẫn còn nguyên).
- [ ] **Bước 4: Commit**

```bash
git add public/_headers
git commit -m "CSP cho phep reCAPTCHA cua App Check"
```

---

## Việc 5: Biến môi trường và tài liệu — XONG 13/09/2026 (`581576a`)

**Tệp:** `.env.local`, `.env.development.local`, `.env.example` (không vào git trừ `.env.example`), `CLAUDE.md`

- [ ] **Bước 1: `.env.local`** — xoá dòng `VITE_GEMINI_API_KEY=…` và hai dòng chú thích ngay trên nó. `GEMINI_API_KEY` → key `script-may-dev` (chủ dự án tự dán).
- [ ] **Bước 2: `.env.example`** — thay khối `GEMINI_API_KEY` đầu tệp bằng:

```
# GEMINI_API_KEY: CHỈ cho script Node trong scripts/ (thu:ai, do-chi-phi).
# ĐỪNG BAO GIỜ đặt key Gemini vào biến có tiền tố VITE_: Vite chép nguyên văn
# vào gói JS. Web gọi Gemini qua Firebase AI Logic, không cần key.
GEMINI_API_KEY="MY_GEMINI_API_KEY"
```

- [ ] **Bước 3: `CLAUDE.md`**
  - Dòng 55 (bảng): `| AI | \`@google/genai\` (Gemini), key qua \`GEMINI_API_KEY\` ở \`.env.local\` |` → `| AI | Gemini qua **Firebase AI Logic** (\`firebase/ai\` + App Check) ở bản build; \`@google/genai\` cho key riêng người dùng và script. Xem \`src/features/tutor/services/giaSuFirebaseAI.ts\` |`
  - Dòng 288-289: thay bằng "`.env.local` chỉ cần `GEMINI_API_KEY` cho script trong `scripts/`. Web KHÔNG cần key: gia sư gọi qua Firebase AI Logic. Máy dev cần `VITE_APPCHECK_DEBUG_TOKEN` trong `.env.development.local` (token đăng ký ở Firebase Console → App Check)."
  - Mục "An ninh", cuối đoạn "Khoá Gemini thì CÓ là bí mật": thêm "Ngày 13/09/2026 phát hiện `VITE_GEMINI_API_KEY` nằm nguyên văn trong `dist/` trên Netlify — phép kiểm cũ chỉ soi `src/` và mẫu `AIza`. Nay web gọi qua Firebase AI Logic, `kiem-tra:an-ninh` cấm đọc biến đó và quét cả `dist/`."
- [ ] **Bước 4:** `npm run kiem-tra:tai-lieu` → ĐẠT (mọi đường dẫn nhắc tới đều có thật).
- [ ] **Bước 5: Commit**

```bash
git add .env.example CLAUDE.md
git commit -m "Tai lieu: web goi Gemini qua Firebase AI Logic, GEMINI_API_KEY chi cho script"
```

---

## Việc 6: Thử trên máy dev

**Cần có:** A1, A2, A3.

- [ ] **Bước 1:** Trong trình duyệt thử, xoá `localStorage` mục `gemini_api_key_user` nếu có.
- [ ] **Bước 2:** `npm run dev`, mở http://localhost:3000, F12 → Console. Hỏi gia sư một câu → Console in `App Check debug token: <uuid>` (lần đầu sẽ lỗi, đúng như dự kiến).
- [ ] **Bước 3:** Chủ dự án làm **A4** với token đó; thêm `VITE_APPCHECK_DEBUG_TOKEN=<uuid>` vào `.env.development.local`; khởi động lại `npm run dev`.
- [ ] **Bước 4:** Đăng nhập, hỏi gia sư trong **một bài đang mở** và trong **khung iChat**. Kỳ vọng: cả hai trả lời tiếng Việt, không có đoạn "suy nghĩ" tiếng Anh.
- [ ] **Bước 5:** F12 → Network, lọc `generateContent`. Kỳ vọng: gọi tới `firebasevertexai.googleapis.com/…/models/gemini-3.6-flash:generateContent` trạng thái 200; KHÔNG có request nào tới `generativelanguage.googleapis.com`.

---

## Việc 7: Build, quét, thử CSP trên site nháp

- [ ] **Bước 1:** `npm run build` → thành công.
- [ ] **Bước 2:** `npm run kiem-tra` → TẤT CẢ ĐẠT, trong đó `kiem-tra:an-ninh` báo "dist/ không chứa key Google nào ngoài khoá Firebase công khai".
- [ ] **Bước 3:** Tìm trong `dist/` chuỗi `FIREBASE_APPCHECK_DEBUG_TOKEN` → Kỳ vọng: 0 kết quả.
- [ ] **Bước 4 (chủ dự án):** Vì Vite không đọc `_headers`, CSP chỉ thử được trên Netlify. Kéo thả `dist` vào https://app.netlify.com/drop để tạo **site nháp** (tên ngẫu nhiên `…netlify.app`); thêm tên miền đó vào key reCAPTCHA (A2).
- [ ] **Bước 5:** Trên site nháp: đăng nhập bằng email/mật khẩu, hỏi gia sư. Kỳ vọng: trả lời; F12 Console KHÔNG có dòng `Refused to load` / `Refused to frame` / `violates the following Content Security Policy`.

---

## Việc 8: Lên production và xoá key cũ

- [ ] **Bước 1 (chủ dự án):** Kéo thả `dist` vào tab **Deploys** của site chính.
- [ ] **Bước 2:** Hỏi gia sư trên site chính → trả lời; Network gọi `firebasevertexai.googleapis.com`.
- [ ] **Bước 3 (chủ dự án):** **A5** — xoá key `…hsiA` và `web-hoc-sinh`; xoá tên miền site nháp khỏi key reCAPTCHA; xoá site nháp trên Netlify.
- [ ] **Bước 4:** Hỏi gia sư trên site chính lần nữa → vẫn trả lời (chứng minh không còn phụ thuộc key cũ).
- [ ] **Bước 5:** Cập nhật `.claude/nhac-moi-luot.md` (mục ĐÃ XONG) — ghi ngày, commit.
