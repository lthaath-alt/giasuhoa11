# Bài kiểm tra đã nộp lên Firestore — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Giáo viên thấy được bài kiểm tra học sinh nộp trên máy khác, và điểm tự luận giáo viên chấm lại về được tới học sinh.

**Architecture:** Hôm nay `QuizStorage` ghi mọi bài vào `localStorage` của máy đang dùng; trang giáo viên đọc `localStorage` của máy giáo viên nên luôn trống. Giữ nguyên `localStorage` làm kho làm việc của học sinh (đề đang làm, chống trùng đề — chạy đồng bộ, không đổi), và THÊM một bản sao của mỗi bài ĐÃ NỘP lên collection mới `bai_nop/{quizId}`. Trang giáo viên và việc chấm lại chỉ đọc/ghi Firestore; trang xem lại bài của học sinh ưu tiên bản Firestore để thấy điểm chấm lại.

**Tech Stack:** React 19 + TypeScript, Firebase Firestore (web SDK v10+), luật Firestore, bộ kiểm tự viết chạy bằng `tsx`.

**Spec:** Yêu cầu "sửa web" của chủ dự án ngày 18/09/2026, sau khi phát hiện `QuizProgressTab.tsx:63` đọc `QuizStorage.getQuizzes()` (localStorage máy giáo viên).

## Global Constraints

- KHÔNG tự chạy `npm run build`, push hay deploy; KHÔNG tự publish luật — chủ dự án làm.
- Luật: không dùng `get()` ở đường học sinh ghi (tạo bài nộp chỉ so `request.auth.token.email`). `laGiaoVien()` (có `get()`) chỉ được đứng SAU phép so email trong `||`.
- `bank_questions` giữ nguyên `allow read: if true`.
- Tên collection đặt qua hằng `COL_BAI_NOP` — `kiem-tra:an-ninh` quét `COL_*` và `collection(db, '…')` để đòi luật riêng.
- Firestore từ chối giá trị `undefined` → bài nộp phải được làm sạch trước khi ghi.
- Email lưu CHỮ THƯỜNG (token Auth luôn chữ thường; luật so bằng `==`).
- Ghi bài nộp lên Firestore KHÔNG được chặn luồng nộp bài: mất mạng hay luật chưa publish thì học sinh vẫn nộp và xem điểm như cũ.
- Mọi `dangerouslySetInnerHTML` vẫn đi qua `locHtml` (nội dung câu hỏi trong bài nộp do học sinh ghi lên, phải coi là không tin cậy).

## File Structure

| Tệp | Việc |
|---|---|
| Tạo `src/features/quiz/baiNopChuan.ts` | Hàm thuần `chuanBiBaiNop(quiz)`: bỏ `undefined`, email chữ thường. Không import Firebase, để bộ kiểm import được |
| Tạo `src/features/quiz/baiNopService.ts` | Mọi lệnh Firestore của `bai_nop`: lưu, đọc một bài, đọc bài của nhiều em, cập nhật điểm, đẩy bài cũ lên |
| Sửa `src/features/quiz/quizService.ts:406` | Sau khi nộp: đẩy bản sao lên (không chờ) |
| Sửa `src/features/teacher/components/QuizProgressTab.tsx:63,211` | Đọc từ Firestore thay vì `QuizStorage` |
| Sửa `src/core/contexts/AppContext.tsx:1865-1889` | `updateQuizEssayScore` đọc/ghi Firestore |
| Sửa `src/core/contexts/AppContext.tsx:~469` | Học sinh đăng nhập → đẩy các bài cũ còn nằm trong máy lên |
| Sửa `src/pages/QuizPage.tsx:44-51` | Bài đã nộp: ưu tiên bản Firestore (thấy điểm chấm lại); mở được cả bài không có trong máy |
| Sửa `firestore.rules` | Khối `match /bai_nop/{id}` |
| Sửa `scripts/kiem-tra-luyen-tap.mts` | Phép kiểm `chuanBiBaiNop` + canh trang giáo viên không đọc lại `QuizStorage` |
| Sửa `scripts/kiem-tra-luat.mts` | 10 phép thử luật `bai_nop` (chạy thật trên CI) |
| Sửa `CLAUDE.md` | Ghi collection mới, giới hạn đã biết, thứ tự triển khai |

---

### Task 1: Hàm làm sạch bài nộp (thuần) + phép kiểm

**Files:**
- Create: `src/features/quiz/baiNopChuan.ts`
- Test: `scripts/kiem-tra-luyen-tap.mts` (thêm một mục cuối)

**Interfaces:**
- Produces: `chuanBiBaiNop(quiz: Quiz): Quiz` — trả bản sao sâu, không `undefined`, `userEmail` đã `trim().toLowerCase()`; KHÔNG sửa đối tượng đầu vào.

- [ ] **Step 1: Viết phép kiểm trước** — cuối `kiem-tra-luyen-tap.mts`, trước dòng tổng kết:

```ts
console.log('\n== Bài nộp lên Firestore ==');
{
  const { chuanBiBaiNop } = await import('../src/features/quiz/baiNopChuan');
  const goc = {
    id: 'quiz_1', lessonId: 'b1', chapterId: 'c1', userEmail: '  HS@Truong.Local ',
    questions: [{ id: 'q1', type: 'Trắc nghiệm', content: 'x', points: 1, image: undefined }],
    answers: { q1: 'A' }, status: 'submitted', score: 1, maxScore: 1,
    createdAt: '2026-09-18T00:00:00Z', expiresAt: '2026-09-19T00:00:00Z',
    results: { q1: { questionId: 'q1', score: 1, maxScore: 1, correct: true, studentAnswer: 'A', correctAnswer: 'A', feedback: 'ok', confidence: 'high' } },
  } as any;
  const ra = chuanBiBaiNop(goc);
  ok(ra.userEmail === 'hs@truong.local', 'email về chữ thường, bỏ khoảng trắng');
  ok(!JSON.stringify(ra).includes('undefined') && !('image' in ra.questions[0]), 'không còn trường undefined (Firestore từ chối nó)');
  ok(goc.userEmail === '  HS@Truong.Local ' && 'image' in goc.questions[0], 'không sửa đối tượng gốc');
  ok(ra.results.q1.score === 1 && ra.answers.q1 === 'A', 'giữ nguyên điểm và câu trả lời');
}
```

- [ ] **Step 2: Chạy, phải HỎNG** — `npm run kiem-tra:luyen-tap` → lỗi không tìm thấy module `baiNopChuan`.

- [ ] **Step 3: Viết hàm**

```ts
// src/features/quiz/baiNopChuan.ts
import type { Quiz } from './types';

/** Bản sao sạch để ghi lên Firestore: bỏ mọi `undefined` (Firestore từ chối
 *  chúng), email chữ thường (luật so với token Auth vốn luôn chữ thường).
 *  Không import Firebase để bộ kiểm chạy được ngoài trình duyệt. */
export function chuanBiBaiNop(quiz: Quiz): Quiz {
  const ban = JSON.parse(JSON.stringify(quiz)) as Quiz;
  ban.userEmail = (quiz.userEmail || '').trim().toLowerCase();
  return ban;
}
```

- [ ] **Step 4: Chạy lại, phải ĐẠT** — `npm run kiem-tra:luyen-tap`.
- [ ] **Step 5: Phá thử** — tạm xoá dòng `toLowerCase()`, chạy lại, phép kiểm email phải HỎNG; trả lại.

### Task 2: Luật `bai_nop` + phép thử emulator

**Files:**
- Modify: `firestore.rules` (thêm khối sau `match /progress/{userId}`)
- Test: `scripts/kiem-tra-luat.mts`

**Interfaces:**
- Produces: collection `bai_nop/{id}` với quyền: học sinh TẠO bài của chính mình, ĐỌC bài của chính mình; giáo viên ĐỌC/LIỆT KÊ mọi bài, SỬA chỉ `score` + `results`; không ai xoá, học sinh không sửa.

- [ ] **Step 1: Viết phép thử trước** — trong `gieo()` thêm một bài có sẵn; trong `chayCacPhep()` thêm 10 phép:

```ts
// gieo():
await setDoc(doc(db, 'bai_nop', 'bn_1'), baiMau('bn_1', NGUOI.hs.email, 5, 10));

// ở đầu tệp:
const baiMau = (id: string, email: string, score: number, maxScore: number) => ({
  id, lessonId: 'b1', chapterId: 'c1', userEmail: email, questions: [], answers: {},
  status: 'submitted', score, maxScore, createdAt: '2026-09-18T00:00:00Z',
  expiresAt: '2026-09-19T00:00:00Z', results: {},
});

// chayCacPhep():
await duoc(setDoc(doc(hs, 'bai_nop', 'bn_2'), baiMau('bn_2', NGUOI.hs.email, 3, 10)), 'BN1. học sinh nộp bài của chính mình');
await chan(setDoc(doc(hs, 'bai_nop', 'bn_3'), baiMau('bn_3', NGUOI.hs2.email, 3, 10)), 'BN2. học sinh nộp bài đứng tên người khác');
await chan(setDoc(doc(hs, 'bai_nop', 'bn_4'), baiMau('bn_4', NGUOI.hs.email, 11, 10)), 'BN3. điểm lớn hơn điểm tối đa');
await chan(setDoc(doc(hs, 'bai_nop', 'bn_5'), baiMau('bn_x', NGUOI.hs.email, 3, 10)), 'BN4. id trong dữ liệu khác id tài liệu');
await chan(updateDoc(doc(hs, 'bai_nop', 'bn_1'), { score: 10 }), 'BN5. học sinh tự nâng điểm bài đã nộp');
await duoc(getDoc(doc(hs, 'bai_nop', 'bn_1')), 'BN6. học sinh đọc bài của chính mình');
await chan(getDoc(doc(nhu(moi, NGUOI.hs2), 'bai_nop', 'bn_1')), 'BN7. học sinh đọc bài của bạn');
await duoc(getDocs(query(collection(gv, 'bai_nop'), where('userEmail', 'in', [NGUOI.hs.email]))), 'BN8. giáo viên liệt kê bài của học sinh');
await duoc(updateDoc(doc(gv, 'bai_nop', 'bn_1'), { score: 7, results: {} }), 'BN9. giáo viên chấm lại điểm');
await chan(updateDoc(doc(gv, 'bai_nop', 'bn_1'), { userEmail: NGUOI.hs2.email }), 'BN10. giáo viên đổi chủ bài nộp');
await chan(getDocs(collection(khach, 'bai_nop')), 'BN11. khách liệt kê bài nộp');
```

(Thêm `updateDoc, query, where` vào dòng import `firebase/firestore` nếu chưa có.)

- [ ] **Step 2: Viết luật**

```
    /* Bài kiểm tra ĐÃ NỘP (18/09/2026). Trước đó bài chỉ nằm trong localStorage
       của máy học sinh nên giáo viên không bao giờ thấy.
       Học sinh tạo: KHÔNG get() — chỉ so email trong token.
       GIỚI HẠN ĐÃ BIẾT: điểm do trình duyệt chấm, luật chỉ chặn được điểm
       vượt tối đa và đứng tên người khác. Chặn điểm giả thật sự cần chấm lại
       ở máy chủ (Cloud Function, gói Blaze). */
    function baiNopHopLe(d, id) {
      return d.keys().hasOnly(['id', 'lessonId', 'chapterId', 'userEmail', 'questions',
                               'answers', 'status', 'score', 'maxScore', 'createdAt',
                               'expiresAt', 'results'])
        && d.id == id
        && d.status == 'submitted'
        && d.score is number && d.maxScore is number
        && d.score >= 0 && d.score <= d.maxScore;
    }
    match /bai_nop/{id} {
      allow get:    if dangNhap() && (resource.data.userEmail == email() || laGiaoVien());
      allow list:   if laGiaoVien();
      allow create: if dangNhap() && request.resource.data.userEmail == email()
        && baiNopHopLe(request.resource.data, id);
      allow update: if laGiaoVien()
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['score', 'results'])
        && request.resource.data.score is number
        && request.resource.data.score >= 0
        && request.resource.data.score <= resource.data.maxScore;
      allow delete: if false;
    }
```

- [ ] **Step 3: Chạy** `npm run kiem-tra:luat` — máy chủ dự án in BỎ QUA (Java 8); kết quả thật xem ở GitHub Actions sau khi push. `npm run kiem-tra:an-ninh` phải ĐẠT (collection mới có luật, tên trường có thật trong `types.ts`).

### Task 3: Dịch vụ Firestore cho bài nộp

**Files:**
- Create: `src/features/quiz/baiNopService.ts`

**Interfaces:**
- Consumes: `chuanBiBaiNop` (Task 1), `db` từ `core/services/firebase`, `QuizStorage`.
- Produces:
  - `COL_BAI_NOP = 'bai_nop'`
  - `luuBaiNop(quiz: Quiz): Promise<boolean>`
  - `docBaiNop(id: string): Promise<Quiz | null>`
  - `docBaiNopCuaCacEm(emails: string[]): Promise<Quiz[]>` — chia lô 30 (giới hạn của `in`)
  - `ghiDiemChamLai(id: string, score: number, results: Quiz['results']): Promise<void>`
  - `dayBaiCuLen(email: string): Promise<number>` — số bài đã đẩy

- [ ] **Step 1: Viết tệp**

```ts
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../core/services/firebase';
import { chuanBiBaiNop } from './baiNopChuan';
import { QuizStorage } from './quizStorage';
import type { Quiz } from './types';

export const COL_BAI_NOP = 'bai_nop';
/** id các bài máy này đã đẩy lên xong — để lần đăng nhập sau khỏi đẩy lại. */
const KHOA_DA_DAY = 'h11_bai_nop_da_day';

const daDay = (): Set<string> => {
  try { return new Set(JSON.parse(localStorage.getItem(KHOA_DA_DAY) || '[]')); } catch { return new Set(); }
};
const ghiDaDay = (id: string) => {
  const s = daDay(); s.add(id);
  try { localStorage.setItem(KHOA_DA_DAY, JSON.stringify([...s])); } catch { /* bộ nhớ đầy: lần sau đẩy lại, vô hại */ }
};

/** Ghi bản sao bài đã nộp. Không ném lỗi: nộp bài không được hỏng vì mạng.
 *  Lỗi GÌ cũng KHÔNG đánh dấu đã đẩy — kể cả `permission-denied`. Nếu coi bị
 *  từ chối là xong thì web lên trước luật sẽ làm mất vĩnh viễn mọi bài nộp
 *  trong khoảng đó. Cái giá: một lượt ghi bị từ chối mỗi lần đăng nhập cho
 *  mỗi bài hỏng, vô hại. */
export async function luuBaiNop(quiz: Quiz): Promise<boolean> {
  if (quiz.status !== 'submitted') return false;
  try {
    await setDoc(doc(db, COL_BAI_NOP, quiz.id), chuanBiBaiNop(quiz));
    ghiDaDay(quiz.id);
    return true;
  } catch (e) {
    console.warn('[baiNop] chưa đẩy được bài', quiz.id, e);
    return false;
  }
}

export async function docBaiNop(id: string): Promise<Quiz | null> {
  try {
    const anh = await getDoc(doc(db, COL_BAI_NOP, id));
    return anh.exists() ? (anh.data() as Quiz) : null;
  } catch {
    return null; // không có quyền, hoặc chưa có bài — luật chặn cả hai như nhau
  }
}

export async function docBaiNopCuaCacEm(emails: string[]): Promise<Quiz[]> {
  const ds = [...new Set(emails.map(e => e.trim().toLowerCase()).filter(Boolean))];
  const ra: Quiz[] = [];
  for (let i = 0; i < ds.length; i += 30) {
    const lo = ds.slice(i, i + 30);
    const anh = await getDocs(query(collection(db, COL_BAI_NOP), where('userEmail', 'in', lo)));
    anh.forEach(d => ra.push(d.data() as Quiz));
  }
  return ra.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function ghiDiemChamLai(id: string, score: number, results: Quiz['results']): Promise<void> {
  await updateDoc(doc(db, COL_BAI_NOP, id), { score, results: JSON.parse(JSON.stringify(results ?? {})) });
}

/** Bài đã nộp TRƯỚC khi có bản sửa này chỉ nằm trong máy. Đẩy những bài của
 *  CHÍNH em lên (máy dùng chung có thể chứa bài của bạn khác — luật cũng chặn). */
export async function dayBaiCuLen(email: string): Promise<number> {
  const e = email.trim().toLowerCase();
  const xong = daDay();
  const can = QuizStorage.getQuizzes().filter(q =>
    q.status === 'submitted' && q.userEmail.trim().toLowerCase() === e && !xong.has(q.id));
  let n = 0;
  for (const q of can) if (await luuBaiNop(q)) n++;
  return n;
}
```

- [ ] **Step 2:** `npm run lint` sạch; `npm run kiem-tra:an-ninh` báo collection `bai_nop` có luật riêng.

### Task 4: Nộp bài → đẩy bản sao; đăng nhập → đẩy bài cũ

**Files:**
- Modify: `src/features/quiz/quizService.ts:406`
- Modify: `src/core/contexts/AppContext.tsx` (ngay sau `persistSession(hoSo);` trong `onAuthStateChanged`)

- [ ] **Step 1:** Trong `submitQuiz`, sau `QuizStorage.updateQuiz(quizId, updatedQuiz);`:

```ts
    /* Bản sao lên Firestore để giáo viên thấy. KHÔNG chờ: mất mạng hay luật
       chưa publish thì học sinh vẫn nộp và xem điểm bình thường; lần đăng
       nhập sau `dayBaiCuLen` đẩy lại. */
    void luuBaiNop(updatedQuiz);
```
và `import { luuBaiNop } from './baiNopService';`

- [ ] **Step 2:** Trong `AppContext`, sau `persistSession(hoSo);`:

```ts
      /* Bài kiểm tra nộp trước 18/09/2026 chỉ nằm trong máy — đẩy lên để giáo
         viên thấy. Không chờ, không báo lỗi cho học sinh. */
      if (hoSo.role === 'student') void dayBaiCuLen(hoSo.email);
```
và import `dayBaiCuLen` từ `../../features/quiz/baiNopService`.

- [ ] **Step 3:** `npm run lint` sạch.

### Task 5: Trang giáo viên + chấm lại đọc/ghi Firestore

**Files:**
- Modify: `src/features/teacher/components/QuizProgressTab.tsx`
- Modify: `src/core/contexts/AppContext.tsx:1865-1889` (`updateQuizEssayScore`)
- Test: `scripts/kiem-tra-luyen-tap.mts` (phép canh mã nguồn)

- [ ] **Step 1: Viết phép canh trước** (trong mục "Bài nộp lên Firestore" của Task 1):

```ts
  const fs = await import('node:fs');
  const tab = fs.readFileSync('src/features/teacher/components/QuizProgressTab.tsx', 'utf8');
  ok(!/QuizStorage/.test(tab), 'trang giáo viên KHÔNG đọc QuizStorage (đó là localStorage của máy giáo viên)');
  const ctx = fs.readFileSync('src/core/contexts/AppContext.tsx', 'utf8');
  const cham = ctx.slice(ctx.indexOf('const updateQuizEssayScore'), ctx.indexOf('const updateQuizEssayScore') + 1500);
  ok(/docBaiNop\(/.test(cham) && /ghiDiemChamLai\(/.test(cham) && !/QuizStorage/.test(cham), 'chấm lại đọc và ghi Firestore');
```
Chạy → HỎNG.

- [ ] **Step 2: QuizProgressTab** — bỏ `import { QuizStorage }`; thêm state và nạp:

```ts
  const [baiNop, setBaiNop] = useState<Quiz[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loiTai, setLoiTai] = useState<string | null>(null);
  const khoaEmail = students.map(s => s.email.toLowerCase()).sort().join('|');
  const napBaiNop = useCallback(async () => {
    setDangTai(true); setLoiTai(null);
    try { setBaiNop(await docBaiNopCuaCacEm(students.map(s => s.email))); }
    catch (e) { setLoiTai('Không tải được bài làm của học sinh. Kiểm tra mạng rồi tải lại trang.'); console.warn('[baiNop]', e); }
    finally { setDangTai(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [khoaEmail]);
  useEffect(() => { void napBaiNop(); }, [napBaiNop]);
  const baiCua = (email: string) => baiNop.filter(q => q.userEmail === email.toLowerCase() && q.status === 'submitted');
```
Thay dòng 63-66 bằng `const quizzes = selectedStudent ? baiCua(selectedStudent.email) : [];` và dòng 211-213 bằng `const studQuizzes = baiCua(stud.email);`. Sau khi `updateQuizEssayScore` thành công gọi `await napBaiNop()` thay cho `refresh()`. Hiện `<Alert severity="error">{loiTai}</Alert>` khi có lỗi, và chữ "Đang tải bài làm…" khi `dangTai`.

- [ ] **Step 3: AppContext.updateQuizEssayScore** — thay `QuizStorage.getQuizById(quizId)` bằng `await docBaiNop(quizId)`, và `QuizStorage.updateQuiz(quizId, quiz)` bằng `await ghiDiemChamLai(quizId, quiz.score, quiz.results)` trong `try/catch` trả `{ success: false, message: 'Không lưu được điểm lên máy chủ.' }` khi lỗi. Nếu còn import `QuizStorage` không dùng thì bỏ.

- [ ] **Step 4:** `npm run kiem-tra:luyen-tap` ĐẠT; `npm run lint` sạch.
- [ ] **Step 5: Phá thử** — tạm thêm lại một dòng `QuizStorage.getQuizzes()` vào tab → phép canh phải HỎNG; trả lại.

### Task 6: Học sinh xem lại bài thấy điểm chấm lại

**Files:**
- Modify: `src/pages/QuizPage.tsx:44-51`

- [ ] **Step 1:** Thay effect nạp bài:

```ts
  useEffect(() => {
    if (!quizId) return;
    const q = QuizStorage.getQuizById(quizId);
    if (q) { setQuiz(q); setAnswers(q.answers || {}); }
    /* Bài đã nộp: bản Firestore mới nhất mang điểm giáo viên chấm lại, và mở
       được cả khi máy này không có bài (học sinh đổi máy). */
    if (!q || q.status === 'submitted') {
      let huy = false;
      void docBaiNop(quizId).then(ban => {
        if (huy || !ban) return;
        setQuiz(ban); setAnswers(ban.answers || {});
        if (q) QuizStorage.updateQuiz(quizId, ban);
      });
      return () => { huy = true; };
    }
  }, [quizId]);
```

- [ ] **Step 2:** `npm run lint` sạch.

### Task 7: Tài liệu, kiểm toàn bộ, bàn giao luật

**Files:**
- Modify: `CLAUDE.md` (mục An ninh, "Bảy điều về luật hiện hành" và bảng collection)

- [ ] **Step 1:** Ghi vào `CLAUDE.md`: collection `bai_nop` và vì sao có; giới hạn "điểm do trình duyệt chấm"; thứ tự triển khai nên là publish luật trước, deploy sau. Làm ngược thì không mất bài (lỗi nào cũng không đánh dấu "đã đẩy", lần đăng nhập sau đẩy lại), chỉ là giáo viên thấy muộn hơn.

- [ ] **Step 2:** `npm run kiem-tra` — mọi bộ ĐẠT (luật BỎ QUA vì Java 8).
- [ ] **Step 3:** Đưa NGUYÊN TỆP `firestore.rules` cho chủ dự án + bảng Playground (BN1, BN2, BN5, BN6, BN7, BN9, BN10; `list` không mô phỏng được → chỉ emulator trên CI đo).
- [ ] **Step 4:** Sau khi chủ dự án báo đã publish: đo bằng REST — học sinh ẩn danh tạo bài đứng tên email khác → 403; khách đọc `bai_nop` → 403.
- [ ] **Step 5:** Commit khi chủ dự án bảo.
