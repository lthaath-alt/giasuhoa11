# Đồng quản trị và đơn xin làm giáo viên — Kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho chủ dự án chỉ định đồng quản trị, và cho người ngoài tự đăng ký làm giáo viên rồi chờ duyệt.

**Architecture:** Danh sách đồng quản trị nằm trong một tài liệu Firestore duy nhất mà chỉ chủ dự án ghi được; luật đọc nó bằng `get()`. Đơn xin làm giáo viên sao chép đúng khuôn "đơn xin vào lớp" đã chạy: một trường nguyện vọng `pendingRole` do chính người xin ghi, người có quyền bấm Duyệt thì mới đổi `role` thật.

**Tech Stack:** React 19 + Vite 6 + TypeScript 5.8, MUI v9, Firebase Auth + Firestore, Firestore Security Rules.

**Spec:** `docs/superpowers/specs/2026-09-13-dong-quan-tri-va-don-lam-giao-vien-design.md` (commit `83c97c8`)

## Global Constraints

- Trả lời và viết chú thích bằng **tiếng Việt**; tên biến/hàm theo lối vùng đang sửa (`src/` phần lớn tiếng Anh, `scripts/` tiếng Việt không dấu).
- **Dự án KHÔNG có bộ chạy test** — không Vitest, không Jest. "Viết test trước" ở đây nghĩa là **viết phép kiểm trước**, thêm vào `scripts/kiem-tra-*.mts`. **Đừng dựng khung test mới.**
- Hàng rào mỗi bước: `npx tsc --noEmit` sạch, rồi `npm run kiem-tra` 0 SAI.
- **KHÔNG tự chạy `npm run build`, git nguy hiểm, push hay deploy** — chủ dự án tự làm.
- **KHÔNG ai ngoài chủ dự án publish được luật.** Sửa `firestore.rules` xong thì DỪNG ở cổng, đừng làm tiếp phần phụ thuộc luật mới.
- MUI v9 dùng `size={{ xs, sm, md }}` cho `Grid`, không phải `item`/`xs=`.
- Màu: **không viết cứng mã màu** trong `.tsx`, luôn dùng `var(--ten-bien)`. Biến có `--X-nen` thì `--X` CHỈ dùng cho chữ.
- Tệp nguồn dùng **CRLF**. Đừng chạy `sed` ghi đè cả tệp — nó đổi hết sang LF và git báo tệp đã sửa.
- Mọi `dangerouslySetInnerHTML` phải qua `locHtml.ts`. Việc này không đụng tới chỗ nào như vậy.

---

# ĐỢT 3a — ĐỒNG QUẢN TRỊ

### Task 1: Hằng email chủ dự án, và phép kiểm canh hai nơi khớp nhau

Email chủ dự án sẽ nằm ở **hai** chỗ: `firestore.rules` (hàng rào thật) và một hằng trong `src/` (chỉ để vẽ giao diện). Hai nơi lệch nhau thì giao diện nói một đằng luật làm một nẻo — hỏng im lặng. Phép kiểm này sinh ra để chặn đúng điều đó, nên nó phải có **trước** cái nó canh.

**Files:**
- Create: `src/core/services/quanTri.ts`
- Modify: `scripts/kiem-tra-an-ninh.mts` (thêm một khối trước dòng `console.log(soLoi === 0 ? ...)` ở cuối tệp)

**Interfaces:**
- Produces: `EMAIL_CHU_DU_AN: string` — Task 3 và Task 4 dùng để biết ai là chủ dự án.

- [ ] **Step 1: Viết phép kiểm TRƯỚC (nó sẽ trượt vì chưa có tệp hằng)**

Thêm vào `scripts/kiem-tra-an-ninh.mts`, ngay trước dòng `console.log(soLoi === 0 ...)` cuối tệp:

```ts
// ── Email chủ dự án: luật và mã nguồn phải nói CÙNG một người ──────────────
{
  console.log('\n== Email chủ dự án khớp giữa luật và mã ==');

  /* Vì sao cần phép kiểm này: `laChuDuAn()` trong luật là hàng rào THẬT, còn
     hằng trong `src/` chỉ để quyết định vẽ hay không vẽ nút. Lệch nhau thì
     người dùng thấy nút mà bấm vào bị từ chối, hoặc tệ hơn là không thấy nút
     dù có quyền — và build vẫn xanh. */
  const R = join(GOC, 'firestore.rules');
  const S = join(GOC, 'src/core/services/quanTri.ts');

  if (!existsSync(R)) {
    truot('email chủ dự án khớp giữa luật và mã', 'thiếu firestore.rules');
  } else if (!existsSync(S)) {
    truot('email chủ dự án khớp giữa luật và mã', 'thiếu src/core/services/quanTri.ts');
  } else {
    const mLuat = /function\s+laChuDuAn\s*\(\s*\)[\s\S]{0,200}?email\(\)\s*==\s*'([^']+)'/.exec(readFileSync(R, 'utf8'));
    const mNguon = /EMAIL_CHU_DU_AN\s*=\s*'([^']+)'/.exec(readFileSync(S, 'utf8'));
    if (!mLuat) truot('email chủ dự án khớp giữa luật và mã', 'không đọc được email trong laChuDuAn() của firestore.rules');
    else if (!mNguon) truot('email chủ dự án khớp giữa luật và mã', 'không đọc được EMAIL_CHU_DU_AN trong quanTri.ts');
    else if (mLuat[1] !== mNguon[1]) truot('email chủ dự án khớp giữa luật và mã', `luật nói "${mLuat[1]}", mã nói "${mNguon[1]}"`);
    else dat('email chủ dự án khớp giữa luật và mã');
  }
}
```

Nếu `readFileSync` chưa được import ở đầu tệp thì thêm vào dòng `import` sẵn có từ `node:fs`; đừng thêm dòng import mới.

- [ ] **Step 2: Chạy để thấy nó TRƯỢT**

```bash
npm run kiem-tra:an-ninh
```

Mong đợi: `SAI  email chủ dự án khớp giữa luật và mã` kèm `thiếu src/core/services/quanTri.ts`, và tiến trình thoát khác 0.

- [ ] **Step 3: Tạo tệp hằng**

Tạo `src/core/services/quanTri.ts`:

```ts
/**
 * Ai là chủ dự án — bản dùng cho GIAO DIỆN.
 *
 * Hàng rào THẬT là `laChuDuAn()` trong `firestore.rules`. Hằng dưới đây chỉ
 * dùng để quyết định vẽ hay không vẽ một nút. Sửa nó KHÔNG cấp thêm quyền cho
 * ai: người không phải chủ dự án có bấm được nút cũng bị Firestore từ chối.
 *
 * Hai nơi này phải luôn trùng nhau — `npm run kiem-tra:an-ninh` canh điều đó.
 * Đổi email thì phải sửa CẢ HAI, và publish lại luật bằng tay.
 */
export const EMAIL_CHU_DU_AN = 'ktranquang713@gmail.com';

/** Người đang đăng nhập có phải chủ dự án không. Chỉ để vẽ giao diện. */
export function laChuDuAn(email?: string | null): boolean {
  return Boolean(email && email.toLowerCase() === EMAIL_CHU_DU_AN);
}
```

- [ ] **Step 4: Chạy lại để thấy nó ĐẠT**

```bash
npm run kiem-tra:an-ninh
```

Mong đợi: `OK   email chủ dự án khớp giữa luật và mã`, và `>>> TẤT CẢ ĐẠT`.

- [ ] **Step 5: CỐ TÌNH LÀM HỎNG để chứng minh phép kiểm biết kêu**

Đổi tạm hằng trong `quanTri.ts` thành `'sai@vi-du.test'`, chạy lại `npm run kiem-tra:an-ninh`.

Mong đợi: `SAI` kèm đúng hai email in ra cạnh nhau. **Rồi đổi về như cũ** và chạy lại cho xanh.

Bước này bắt buộc. `CLAUDE.md` đã ghi: một phép kiểm luôn xanh mà chưa bao giờ bắt được gì thì đáng ngờ hơn đáng mừng — dự án từng có một phép kiểm đọc nhầm `m[2]` thay vì `m[1]` nên báo ĐẠT suốt nhiều tuần mà chưa soi dòng nào.

- [ ] **Step 6: Kiểm toàn bộ rồi commit**

```bash
npx tsc --noEmit
npm run kiem-tra
```

```bash
git add src/core/services/quanTri.ts scripts/kiem-tra-an-ninh.mts
git commit -m "Dot 3a/1: hang EMAIL_CHU_DU_AN, va phep kiem canh luat va ma khop nhau"
```

---

### Task 2: Luật — `laDongQuanTri()`, collection `quan_tri`, hai nhánh mới

**Files:**
- Modify: `firestore.rules` — thêm hàm sau `laChuDuAn()` (khoảng dòng 94); thêm `match /quan_tri/{id}` ngay trước `match /users/{userId}` (khoảng dòng 269); sửa `allow create` (dòng 294) và `allow update` (dòng 304)

**Interfaces:**
- Produces: collection `quan_tri`, tài liệu `dong_quan_tri`, hình dạng `{ emails: string[] }` — Task 3 đọc và ghi đúng hình dạng này.

- [ ] **Step 1: Thêm hàm `laDongQuanTri()`**

Ngay sau khối `function laChuDuAn() { ... }`:

```
    /* ĐỒNG QUẢN TRỊ — chủ dự án chỉ định, danh sách nằm ở một tài liệu duy
       nhất mà chỉ chủ dự án ghi được.

       Vì sao KHÔNG cắm cờ `coAdmin: true` lên hồ sơ từng người: rẻ hơn thật
       (luật vốn đã đọc hồ sơ người gọi để lấy `role`), nhưng nó mở HAI cửa
       phải canh — học sinh tự sửa hồ sơ mình, và người mới tự đăng ký. Quên
       một cửa là ai cũng tự phong. Dự án này đã vấp đúng kiểu lỗi đó hai lần.

       Vì sao KHÔNG để trong `system_settings`: chỗ đó đang `allow write: if
       laQuanTri()`, tức một `school_admin` ghi được và sẽ tự thêm mình.

       Hàm này TỐN MỘT LƯỢT ĐỌC. Vì thế mọi phép `||` bên dưới đặt nó ở CUỐI,
       sau các nhánh không tốn gì. */
    function laDongQuanTri() {
      return dangNhap() && get(/databases/$(database)/documents/quan_tri/dong_quan_tri)
               .data.emails.hasAny([email()]);
    }
```

- [ ] **Step 2: Thêm mục `match /quan_tri/{id}`**

Đặt ngay TRƯỚC `match /users/{userId}`:

```
    /* Danh sách đồng quản trị. Một tài liệu: `dong_quan_tri`.

       PHẢI cho đồng quản trị ĐỌC. Bản thiết kế đầu để mỗi `laChuDuAn()` cho
       kín, nhưng thế thì chính người đồng quản trị không đọc được danh sách để
       biết mình có quyền — giao diện sẽ không vẽ nút Duyệt cho họ, và lỗi chỉ
       lộ ra lúc thử tay.

       Không có vòng lặp: `get()` trong luật KHÔNG bị luật đọc chặn. */
    match /quan_tri/{id} {
      allow read:  if laChuDuAn() || laDongQuanTri();
      allow write: if laChuDuAn();
    }
```

- [ ] **Step 3: Thêm nhánh vào `allow create` của `users`**

Sửa khối `allow create` thành:

```
      allow create: if dangNhap() && (
                      laChuDuAn()
                      || (request.auth.uid == userId
                          && request.resource.data.role == 'student'
                          && !('classId' in request.resource.data)
                          && !('schoolId' in request.resource.data)
                          && !('joinedClassId' in request.resource.data))
                      || (laGiaoVien() && request.resource.data.role == 'student')
                      || (laDongQuanTri()
                          && request.resource.data.role in ['student', 'teacher', 'school_admin'])
                    );
```

**KHÔNG được nhắc `resource.data` trong nhánh này.** Lúc `create` thì `resource` là null, đọc trường trên null là lỗi và luật từ chối — đúng lỗi "Null value error" đã gặp ở Playground ngày 13/09/2026.

- [ ] **Step 4: Thêm nhánh vào `allow update` của `users`**

Sửa khối `allow update` thành:

```
      allow update: if dangNhap() && (
                      laChuDuAn()
                      || (request.auth.uid == userId
                          && !request.resource.data.diff(resource.data)
                               .affectedKeys().hasAny(['role', 'classId', 'schoolId', 'joinedClassId', 'username', 'email']))
                      || (laGiaoVien()
                          && !request.resource.data.diff(resource.data)
                               .affectedKeys().hasAny(['role']))
                      || (laDongQuanTri()
                          && request.resource.data.role in ['student', 'teacher', 'school_admin']
                          && resource.data.role != 'admin')
                    );
```

Hai vế `role` là cố ý: vai **mới** không được là `admin`, và vai **cũ** cũng không. Thiếu vế sau thì một đồng quản trị hạ được chính chủ dự án xuống `student`, và sau đó không ai đặt lại vai được ngoài Firebase Console.

`allow delete` **giữ nguyên** `laChuDuAn()` — đồng quản trị không xoá được hồ sơ.

- [ ] **Step 5: Kiểm rằng không làm hỏng gì khác**

```bash
npm run kiem-tra:an-ninh
```

Mong đợi: `>>> TẤT CẢ ĐẠT`. Chú ý phép "cả N collection đều có luật riêng" — số N **chưa** đổi ở bước này vì chưa có mã nào gọi `collection(db, 'quan_tri')`; nó sẽ tăng ở Task 3.

Kiểm tay: tệp còn CRLF.

```bash
file firestore.rules
```

Mong đợi: `with CRLF line terminators`.

- [ ] **Step 6: Commit**

```bash
git add firestore.rules
git commit -m "Dot 3a/2: luat laDongQuanTri, collection quan_tri, hai nhanh moi o users"
```

**CHƯA PUBLISH.** Luật mới chưa có tác dụng cho tới khi chủ dự án bấm Publish ở cổng phía dưới.

---

### Task 3: Đọc/ghi danh sách đồng quản trị

**Files:**
- Modify: `src/core/services/firestoreService.ts` — thêm hằng `COL_QUAN_TRI` cạnh các hằng `COL_*` (khoảng dòng 37-46), và hai hàm
- Modify: `src/core/contexts/AppContext.tsx` — thêm state, thêm hai hàm, khai vào `AppContextType` và vào `value`

**Interfaces:**
- Consumes: `EMAIL_CHU_DU_AN`, `laChuDuAn(email)` từ Task 1
- Produces:
  - `FirestoreService.docDongQuanTri(): Promise<string[]>`
  - `FirestoreService.ghiDongQuanTri(emails: string[]): Promise<boolean>`
  - Trên `useApp()`: `dongQuanTri: string[]`, `laChuDuAnHienTai: boolean`, `laDongQuanTriHienTai: boolean`, `themDongQuanTri(email: string): Promise<{ success: boolean; message: string }>`, `boDongQuanTri(email: string): Promise<{ success: boolean; message: string }>`

- [ ] **Step 1: Thêm hằng và hai hàm vào `firestoreService.ts`**

Cạnh các hằng `COL_*`:

```ts
const COL_QUAN_TRI     = 'quan_tri';
```

Thêm hai hàm vào object `FirestoreService`, cạnh `clearPendingClassCode`:

```ts
  /* Danh sách đồng quản trị. Một tài liệu duy nhất `quan_tri/dong_quan_tri`.
     Luật chỉ cho chủ dự án và chính đồng quản trị ĐỌC, nên người thường gọi
     hàm này sẽ nhận `permission-denied` — đó là đường chạy BÌNH THƯỜNG, trả
     mảng rỗng chứ đừng báo lỗi ra màn hình. */
  async docDongQuanTri(): Promise<string[]> {
    try {
      const s = await getDoc(doc(db, COL_QUAN_TRI, 'dong_quan_tri'));
      if (!s.exists()) return [];
      const ds = (s.data() as { emails?: unknown }).emails;
      return Array.isArray(ds) ? ds.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  },

  /** Ghi đè cả danh sách. Luật chỉ cho chủ dự án ghi. */
  async ghiDongQuanTri(emails: string[]): Promise<boolean> {
    try {
      await setDoc(doc(db, COL_QUAN_TRI, 'dong_quan_tri'), { emails });
      return true;
    } catch (err) {
      handleError('ghiDongQuanTri', err);
      return false;
    }
  },
```

Kiểm `getDoc` và `setDoc` đã có trong dòng `import` từ `firebase/firestore` ở đầu tệp; thiếu thì thêm vào dòng đó, đừng thêm dòng import mới.

- [ ] **Step 2: Thêm state và hàm vào `AppContext.tsx`**

Thêm state cạnh các state khác trong `AppProvider`:

```tsx
  const [dongQuanTri, setDongQuanTri] = useState<string[]>([]);
```

Trong hiệu ứng `onAuthStateChanged`, sau khi đã có hồ sơ, nạp danh sách:

```tsx
      /* Đọc lỗi (người thường không có quyền) thì `docDongQuanTri` đã trả mảng
         rỗng — coi như không phải đồng quản trị, KHÔNG báo lỗi cho người dùng. */
      setDongQuanTri(await FirestoreService.docDongQuanTri());
```

Thêm hai hàm:

```tsx
  /* Thêm/bớt đồng quản trị. Hàng rào thật là luật (`allow write: if
     laChuDuAn()`); kiểm ở đây chỉ để báo lỗi sớm và tử tế. */
  const themDongQuanTri = async (email: string) => {
    const lower = email.trim().toLowerCase();
    if (!lower) return { success: false, message: 'Chưa nhập email.' };
    if (lower === EMAIL_CHU_DU_AN) {
      return { success: false, message: 'Chủ dự án vốn đã có toàn quyền, không cần thêm.' };
    }
    if (dongQuanTri.includes(lower)) {
      return { success: false, message: 'Người này đã là đồng quản trị.' };
    }
    const moi = [...dongQuanTri, lower];
    const ok = await FirestoreService.ghiDongQuanTri(moi);
    if (!ok) return { success: false, message: 'Không ghi được. Chỉ chủ dự án mới thêm được đồng quản trị.' };
    setDongQuanTri(moi);
    return { success: true, message: `Đã thêm ${lower} làm đồng quản trị.` };
  };

  const boDongQuanTri = async (email: string) => {
    const lower = email.trim().toLowerCase();
    const moi = dongQuanTri.filter(e => e !== lower);
    const ok = await FirestoreService.ghiDongQuanTri(moi);
    if (!ok) return { success: false, message: 'Không ghi được. Chỉ chủ dự án mới bớt được đồng quản trị.' };
    setDongQuanTri(moi);
    return { success: true, message: `Đã bỏ ${lower} khỏi danh sách đồng quản trị.` };
  };
```

Thêm hai giá trị dẫn xuất:

```tsx
  const laChuDuAnHienTai = laChuDuAn(currentUser?.email);
  const laDongQuanTriHienTai = Boolean(
    currentUser?.email && dongQuanTri.includes(currentUser.email.toLowerCase())
  );
```

Thêm `import { EMAIL_CHU_DU_AN, laChuDuAn } from '../services/quanTri';`, khai sáu thứ trên vào `interface AppContextType`, và đưa vào object `value`.

- [ ] **Step 3: Kiểm**

```bash
npx tsc --noEmit
npm run kiem-tra
```

Mong đợi: sạch, 0 SAI, và phép "cả N collection đều có luật riêng" nay đếm **13** (tăng 1 vì `quan_tri`). Nếu nó báo thiếu luật cho `quan_tri` thì Task 2 chưa xong — quay lại.

- [ ] **Step 4: Commit**

```bash
git add src/core/services/firestoreService.ts src/core/contexts/AppContext.tsx
git commit -m "Dot 3a/3: doc va ghi danh sach dong quan tri"
```

---

### Task 4: Khung "Đồng quản trị" trong Quản lý Tài khoản

**Files:**
- Modify: `src/core/components/AccountManagement.tsx` — thêm khung phía trên bảng tài khoản (bảng bắt đầu ở `<TableContainer ...>`, khoảng dòng 154)

**Interfaces:**
- Consumes: `dongQuanTri`, `laChuDuAnHienTai`, `themDongQuanTri`, `boDongQuanTri` từ Task 3 qua `useApp()`

- [ ] **Step 1: Dựng khung, chỉ chủ dự án thấy**

Lấy thêm từ `useApp()` ở đầu component (hiện đang là `const { deleteUser, updateUserInfo, currentUser } = useApp();`):

```tsx
  const { deleteUser, updateUserInfo, currentUser,
          dongQuanTri, laChuDuAnHienTai, themDongQuanTri, boDongQuanTri } = useApp();
  const [emailMoi, setEmailMoi] = useState('');
  const [baoDongQuanTri, setBaoDongQuanTri] = useState<{ loi: boolean; chu: string } | null>(null);
```

Đặt khung ngay TRƯỚC `<TableContainer ...>`:

```tsx
      {/* Đồng quản trị — CHỈ chủ dự án thấy. Đây chỉ là lớp vẽ: hàng rào thật
          là `allow write: if laChuDuAn()` trong firestore.rules. */}
      {laChuDuAnHienTai && (
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 0, borderColor: 'var(--vien)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', mb: 0.5 }}>
            Đồng quản trị
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, lineHeight: 1.6 }}>
            Những người này duyệt được đơn xin làm giáo viên và đặt được vai giáo viên
            hoặc quản trị trường. Họ <strong>không</strong> phong được vai quản trị hệ
            thống, <strong>không</strong> xoá được tài khoản, và <strong>không</strong> thêm
            được đồng quản trị khác. Chỉ mình bạn sửa được danh sách này.
          </Typography>

          {baoDongQuanTri && (
            <Alert severity={baoDongQuanTri.loi ? 'error' : 'success'} sx={{ mb: 2, borderRadius: 0, py: 0.5 }}>
              <Typography variant="caption">{baoDongQuanTri.chu}</Typography>
            </Alert>
          )}

          {dongQuanTri.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
              Chưa chỉ định ai.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {dongQuanTri.map(e => (
                <Chip
                  key={e}
                  label={e}
                  onDelete={async () => setBaoDongQuanTri(
                    await boDongQuanTri(e).then(r => ({ loi: !r.success, chu: r.message }))
                  )}
                  sx={{ borderRadius: 0, bgcolor: 'var(--nen-tim-nhat)', color: 'var(--tim)', fontWeight: 'bold' }}
                />
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              select
              size="small"
              label="Chọn tài khoản để thêm"
              value={emailMoi}
              onChange={e => setEmailMoi(e.target.value)}
              sx={{ minWidth: 280, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            >
              {users
                .filter(u => u.email && u.email.toLowerCase() !== currentUser?.email?.toLowerCase())
                .filter(u => !dongQuanTri.includes(u.email.toLowerCase()))
                .map(u => (
                  <MenuItem key={u.id} value={u.email}>
                    {u.name} — {u.email}
                  </MenuItem>
                ))}
            </TextField>
            <Button
              variant="outlined"
              disabled={!emailMoi}
              onClick={async () => {
                const r = await themDongQuanTri(emailMoi);
                setBaoDongQuanTri({ loi: !r.success, chu: r.message });
                if (r.success) setEmailMoi('');
              }}
              sx={{ textTransform: 'none', borderRadius: 0, fontWeight: 'bold', mt: 0.2 }}
            >
              Thêm
            </Button>
          </Box>
        </Paper>
      )}
```

`Paper`, `Chip`, `TextField`, `MenuItem`, `Alert`, `Button`, `Box`, `Typography` đều đã có trong dòng `import` từ `@mui/material` ở đầu tệp — kiểm lại, thiếu thì bổ sung vào đúng dòng đó.

- [ ] **Step 2: Kiểm**

```bash
npx tsc --noEmit
npm run kiem-tra
```

Mong đợi: sạch, 0 SAI. Đặc biệt `kiem-tra:mau` phải xanh — khung trên chỉ dùng `var(--...)`, không có mã màu cứng.

- [ ] **Step 3: Xem bằng mắt trên máy dev**

```bash
npm run dev
```

Mở `http://localhost:3000/`, đăng nhập bằng tài khoản chủ dự án, vào `/admin` → **Quản lý Tài khoản**. Phải thấy khung "Đồng quản trị" phía trên bảng.

**Lưu ý:** lúc này luật CHƯA publish, nên bấm Thêm sẽ bị Firestore từ chối và hiện thông báo lỗi. Đó là đúng — khung vẽ ra được là đủ cho bước này. Nhớ tắt máy chủ dev sau khi xem.

- [ ] **Step 4: Commit**

```bash
git add src/core/components/AccountManagement.tsx
git commit -m "Dot 3a/4: khung Dong quan tri trong Quan ly Tai khoan"
```

---

## 🚪 CỔNG A — chủ dự án chạy, KHÔNG ai làm thay

Dừng ở đây. Mọi việc phía sau dựa vào luật đã publish.

1. Dán toàn bộ `firestore.rules` vào Firebase Console → Firestore Database → Rules.
2. Tạo tay tài liệu `quan_tri/dong_quan_tri` với trường `emails` (kiểu array) — Playground cần nó có thật để phép 2, 8, 9 chạy được.
3. Chạy **10 phép** trong đặc tả, mục "Mười phép thử ở Rules Playground".
   - Ô Location phải là **uid thật** dán từ Firestore. Gõ chữ mô tả vào đó thì tài liệu không tồn tại và Playground báo "Null value error" chứ không báo DENIED.
   - Tên trường phân biệt hoa thường: `classId`, không phải `ClassId`.
4. Đủ 10 phép mới bấm **Publish**.
5. Đo lại bằng REST không đăng nhập, phải vẫn **11/11** và `bank_questions` vẫn **252** tài liệu.

Có phép nào lệch thì **dừng và báo**, đừng sửa mã để né.

---

# ĐỢT 3b — ĐƠN XIN LÀM GIÁO VIÊN

### Task 5: Trường `pendingRole`, thẻ thứ ba, và form đăng ký giáo viên

**Files:**
- Modify: `src/features/auth/types.ts` — thêm trường sau `pendingClassCode` (khoảng dòng 134)
- Create: `src/features/auth/components/TeacherRegisterForm.tsx`
- Modify: `src/features/auth/components/RegisterForm.tsx` — thêm thẻ thứ ba
- Modify: `src/core/contexts/AppContext.tsx` — thêm `registerTeacherApplicant`

**Interfaces:**
- Produces: `User.pendingRole?: 'teacher'`; `registerTeacherApplicant(name, email, password): Promise<{ success: boolean; message: string; user?: User }>` — Task 6 và 7 đọc `pendingRole`.

- [ ] **Step 1: Thêm trường vào `types.ts`**

Ngay sau `pendingClassCode?: string;`:

```ts
  /**
   * Nguyện vọng làm giáo viên — chưa được duyệt.
   *
   * Cùng khuôn với `pendingClassCode`: người xin ghi được trường này lên hồ sơ
   * của CHÍNH MÌNH (luật chỉ đòi `role == 'student'` lúc tự đăng ký và không
   * cấm trường phụ), nhưng KHÔNG tự đặt được `role` — đổi `role` là việc của
   * `laChuDuAn()` hoặc `laDongQuanTri()`.
   *
   * Chỉ coi là đơn khi giá trị ĐÚNG là 'teacher' VÀ `role === 'student'`. Giá
   * trị lạ thì lờ đi: đợt 2b đã trả giá vì một mã lớp gõ sai khoá học sinh khỏi
   * mọi lớp, do không ai thấy đơn để từ chối.
   */
  pendingRole?: 'teacher';
```

- [ ] **Step 2: Thêm `registerTeacherApplicant` vào `AppContext.tsx`**

Đặt ngay sau `registerStudent`. Nó gần trùng `registerStudent`, khác đúng hai chỗ: thêm `pendingRole` vào hồ sơ, và câu thông báo.

```tsx
  /* Đăng ký làm giáo viên = đăng ký học sinh + một nguyện vọng.
     Tài khoản sinh ra với `role: 'student'` — đó là điều luật bắt buộc với mọi
     người tự đăng ký. Chỉ sau khi chủ dự án hoặc đồng quản trị bấm Duyệt thì
     `role` mới thành 'teacher'. */
  const registerTeacherApplicant = async (
    name: string,
    email: string,
    password: string
  ) => {
    const res = await registerStudent(name, email, password);
    if (!res.success || !res.user) return res;

    const ok = await FirestoreService.updateUserById(res.user.id, { pendingRole: 'teacher' });
    if (!ok) {
      return {
        success: true,
        message: 'Đã tạo tài khoản, nhưng chưa gửi được đơn xin làm giáo viên. Vào mục Học sinh để thử lại.',
        user: res.user,
      };
    }

    const capNhat: User = { ...res.user, pendingRole: 'teacher' };
    setUsers(prev => prev.map(u => (u.id === capNhat.id ? capNhat : u)));
    setCurrentUser(capNhat);
    return { success: true, message: 'Đã gửi đơn xin làm giáo viên. Chờ quản trị duyệt.', user: capNhat };
  };
```

Khai vào `AppContextType` và đưa vào `value`. Nếu tên hàm đặt `currentUser` trong tệp không phải `setCurrentUser`, dùng đúng tên đang có — **đọc tệp, đừng đoán**.

- [ ] **Step 3: Tạo `TeacherRegisterForm.tsx`**

Chép nguyên `src/features/auth/components/StudentRegisterForm.tsx` rồi đổi đúng bốn chỗ:

1. tên component → `TeacherRegisterForm`
2. gọi `registerTeacherApplicant` thay cho `registerStudent`
3. tiêu đề → `Đăng ký làm giáo viên`
4. câu dưới tiêu đề → `Tạo tài khoản xong, đơn của bạn sẽ chờ quản trị duyệt. Trong lúc chờ, bạn dùng web như học sinh.`

Giữ nguyên mọi ràng buộc mật khẩu (≥8 ký tự, có cả chữ và số) — chúng nằm trong `registerStudent` mà hàm mới gọi lại.

- [ ] **Step 4: Thêm thẻ thứ ba vào `RegisterForm.tsx`**

Thêm state cạnh `showStudentForm`:

```tsx
  const [showTeacherForm, setShowTeacherForm] = useState(false);
```

Thêm nhánh trả về sớm, ngay sau nhánh `showStudentForm`:

```tsx
  if (showTeacherForm) {
    return <TeacherRegisterForm onBackToLogin={() => setShowTeacherForm(false)} />;
  }
```

Thêm thẻ thứ ba, đặt SAU thẻ `register-option-school`. Chép đúng lối của thẻ `register-option-student-self` — **giữ nguyên `role="button"`, `tabIndex={0}` và `onKeyDown`**: thẻ bấm được thì phải đi được bằng bàn phím, đó là lý do chú thích ở thẻ đầu tồn tại.

```tsx
      {/* Luồng 4: Giáo viên tự đăng ký, chờ duyệt */}
      <Paper
        id="register-option-teacher"
        variant="outlined"
        sx={{
          p: 2.5, borderRadius: 0, mb: 3,
          borderColor: 'var(--vien-2)',
          backgroundColor: 'var(--nen-tim-nhat)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': { transform: 'translateY(-1px)' },
        }}
        role="button"
        tabIndex={0}
        onClick={() => setShowTeacherForm(true)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowTeacherForm(true); }
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Box sx={{ p: 1, bgcolor: 'var(--nen-tim-nhat)', borderRadius: 0, display: 'flex' }}>
            <UserPlus size={22} color="var(--tim)" />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', mb: 0.5 }}>
              Giáo viên đăng ký
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: 'block' }}>
              Tự tạo tài khoản rồi chờ quản trị duyệt. Trong lúc chờ, bạn dùng web
              như học sinh.
            </Typography>
          </Box>
        </Box>
      </Paper>
```

Kiểm tương phản: `--tim` trên `--nen-tim-nhat` phải đạt ≥4,5. `npm run kiem-tra:mau` đo thật; nó kêu thì đổi sang cặp biến khác chứ đừng bỏ qua.

- [ ] **Step 5: Kiểm**

```bash
npx tsc --noEmit
npm run kiem-tra
```

- [ ] **Step 6: Xem bằng mắt**

Chạy `npm run dev`, mở màn đăng ký, phải thấy **ba** thẻ. Bấm thẻ thứ ba ra form. Thử cả bằng phím Tab. Tắt máy chủ dev sau khi xem.

- [ ] **Step 7: Commit**

```bash
git add src/features/auth/types.ts src/features/auth/components/TeacherRegisterForm.tsx src/features/auth/components/RegisterForm.tsx src/core/contexts/AppContext.tsx
git commit -m "Dot 3b/5: truong pendingRole, the thu ba o man dang ky, form dang ky giao vien"
```

---

### Task 6: Băng "đơn đang chờ duyệt"

Người chờ duyệt **là học sinh**. Họ đăng nhập sẽ rơi vào `/dashboard`, thấy giao diện học sinh, thấy cả ô chọn lớp — và tưởng đăng ký hỏng. Băng này là chỗ duy nhất nói cho họ biết đơn còn sống.

**Files:**
- Modify: một tệp thuộc đường `/dashboard` — **phải ĐO trước, đừng đoán**

- [ ] **Step 1: Đo xem chỗ nào LUÔN hiện khi vào `/dashboard`**

```bash
grep -n "StudentArea\|activeTab" src/pages/DashboardPage.tsx | head -30
```

Tìm khối dựng **không** phụ thuộc tab nào. Đợt 2b đã mất công vì cả một tính năng nằm sau `activeTab === 'hocmai'`, mà nút đặt tab đó đã bị ẩn — không ai tới được. Băng này mà rơi vào một tab thì coi như không có.

Ghi chỗ đã chọn vào chú thích, kèm lý do.

- [ ] **Step 2: Dựng băng**

```tsx
      {/* Đơn xin làm giáo viên đang chờ. Chỉ coi là đơn khi ĐỦ hai điều:
          `pendingRole === 'teacher'` VÀ vai hiện tại vẫn là 'student'. Duyệt
          xong thì vai đổi, băng tự biến mất — không cần dọn gì thêm. */}
      {currentUser?.pendingRole === 'teacher' && currentUser.role === 'student' && (
        <Alert
          severity="info"
          sx={{ mb: 3, borderRadius: 0, border: '1px solid var(--vien)' }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Đơn xin làm giáo viên đang chờ duyệt
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, lineHeight: 1.6 }}>
            Quản trị sẽ xem xét đơn của bạn. Trong lúc chờ, bạn dùng web như học sinh —
            mọi lịch sử học tập sẽ được giữ nguyên sau khi duyệt.
          </Typography>
        </Alert>
      )}
```

- [ ] **Step 3: Kiểm**

```bash
npx tsc --noEmit
npm run kiem-tra
```

- [ ] **Step 4: Commit**

```bash
git add -A src/
git commit -m "Dot 3b/6: bang bao don xin lam giao vien dang cho duyet"
```

---

### Task 7: Khung duyệt đơn

**Files:**
- Modify: `src/core/contexts/AppContext.tsx` — thêm `duyetDonGiaoVien`, `tuChoiDonGiaoVien`
- Modify: `src/core/components/AccountManagement.tsx` — thêm khung, đặt ngay sau khung "Đồng quản trị" của Task 4

**Interfaces:**
- Consumes: `User.pendingRole` (Task 5); `laChuDuAnHienTai`, `laDongQuanTriHienTai` (Task 3)
- Produces: `duyetDonGiaoVien(userId: string, schoolId: string)`, `tuChoiDonGiaoVien(userId: string)` — cả hai trả `Promise<{ success: boolean; message: string }>`

- [ ] **Step 1: Hai hàm trong `AppContext.tsx`**

Đặt cạnh `approveJoinRequest` / `rejectJoinRequest` để hai cặp "đơn" nằm gần nhau.

```tsx
  /* Duyệt đơn làm giáo viên. Đổi `role` là việc luật chỉ cho `laChuDuAn()` hoặc
     `laDongQuanTri()` — người khác bấm sẽ bị Firestore từ chối, và đó đúng là
     hàng rào. Kiểm ở đây chỉ để báo sớm. */
  const duyetDonGiaoVien = async (userId: string, schoolId: string) => {
    const nguoi = users.find(u => u.id === userId);
    if (!nguoi) return { success: false, message: 'Không tìm thấy tài khoản.' };
    if (!schoolId) return { success: false, message: 'Vui lòng chọn trường cho giáo viên này.' };

    const ok = await FirestoreService.updateUserById(userId, {
      role: 'teacher',
      schoolId,
      pendingRole: deleteField() as unknown as undefined,
    });
    if (!ok) {
      return { success: false, message: 'Không duyệt được. Chỉ chủ dự án và đồng quản trị mới duyệt được đơn.' };
    }

    setUsers(prev => prev.map(u => u.id === userId
      ? { ...u, role: 'teacher', schoolId, pendingRole: undefined }
      : u));
    return { success: true, message: `Đã duyệt ${nguoi.name} làm giáo viên.` };
  };

  const tuChoiDonGiaoVien = async (userId: string) => {
    const ok = await FirestoreService.updateUserById(userId, {
      pendingRole: deleteField() as unknown as undefined,
    });
    if (!ok) return { success: false, message: 'Không xoá được đơn. Vui lòng thử lại.' };
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, pendingRole: undefined } : u));
    return { success: true, message: 'Đã từ chối đơn. Tài khoản vẫn dùng được như học sinh.' };
  };
```

Nếu `updateUserById` lọc mất `deleteField()` (xem `cleanForFirestore`), thì thêm một hàm riêng trong `firestoreService.ts` theo đúng lối `clearPendingClassCode`:

```ts
  async clearPendingRole(userId: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, COL_USERS, userId), { pendingRole: deleteField() });
      return true;
    } catch (err) {
      handleError('clearPendingRole', err);
      return false;
    }
  },
```

**Đọc `cleanForFirestore` trước khi chọn đường nào.** Đây đúng là chỗ dễ hỏng im lặng: xoá không được thì đơn ở lại mãi trong danh sách chờ.

- [ ] **Step 2: Khung duyệt trong `AccountManagement.tsx`**

Đặt ngay sau khung "Đồng quản trị". Lấy thêm từ `useApp()`: `laDongQuanTriHienTai`, `duyetDonGiaoVien`, `tuChoiDonGiaoVien`, `schools` đã có sẵn qua props.

```tsx
      {/* Đơn xin làm giáo viên. CHỈ hiện khi có đơn — không để một khung rỗng
          chiếm chỗ mỗi ngày. Chủ dự án và đồng quản trị thấy; giáo viên thường
          không. */}
      {(laChuDuAnHienTai || laDongQuanTriHienTai) && donGiaoVien.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 0, borderColor: 'var(--tin-hieu-vien)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--tin-hieu)', mb: 0.5 }}>
            Đơn xin làm giáo viên ({donGiaoVien.length})
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, lineHeight: 1.6 }}>
            Những người này tự đăng ký và xin làm giáo viên. Duyệt thì họ thành giáo
            viên của trường bạn chọn; từ chối thì họ vẫn dùng web như học sinh.
          </Typography>

          {donGiaoVien.map(hs => (
            <Box key={hs.id} sx={{
              display: 'flex', alignItems: 'center', gap: 2, py: 1.5, flexWrap: 'wrap',
              borderBottom: '1px solid var(--vien-2)',
            }}>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{hs.name}</Typography>
                <Typography variant="caption" color="text.secondary">{hs.email}</Typography>
              </Box>
              <TextField
                select size="small" label="Trường"
                value={truongChon[hs.id] || ''}
                onChange={e => setTruongChon(p => ({ ...p, [hs.id]: e.target.value }))}
                sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              >
                {schools.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </TextField>
              <Button
                variant="contained" size="small"
                disabled={!truongChon[hs.id]}
                onClick={async () => {
                  const r = await duyetDonGiaoVien(hs.id, truongChon[hs.id]);
                  setBaoDongQuanTri({ loi: !r.success, chu: r.message });
                }}
                sx={{ textTransform: 'none', borderRadius: 0, fontWeight: 'bold', boxShadow: 'none' }}
              >
                Duyệt
              </Button>
              <Button
                variant="outlined" size="small"
                onClick={async () => {
                  const r = await tuChoiDonGiaoVien(hs.id);
                  setBaoDongQuanTri({ loi: !r.success, chu: r.message });
                }}
                sx={{ textTransform: 'none', borderRadius: 0 }}
              >
                Từ chối
              </Button>
            </Box>
          ))}
        </Paper>
      )}
```

Thêm hai thứ ở đầu component:

```tsx
  const [truongChon, setTruongChon] = useState<Record<string, string>>({});

  /* ĐỦ HAI điều mới là đơn. Giá trị `pendingRole` lạ, hoặc người đã là giáo
     viên rồi, đều không được lọt vào danh sách này. */
  const donGiaoVien = users.filter(u => u.pendingRole === 'teacher' && u.role === 'student');
```

- [ ] **Step 3: Kiểm**

```bash
npx tsc --noEmit
npm run kiem-tra
```

- [ ] **Step 4: Commit**

```bash
git add src/core/contexts/AppContext.tsx src/core/components/AccountManagement.tsx src/core/services/firestoreService.ts
git commit -m "Dot 3b/7: khung duyet don xin lam giao vien"
```

---

## 🚪 CỔNG B — chủ dự án chạy

```bash
npm run build
```

Kéo thả `dist/` lên Netlify, rồi chạy **7 phép thử tay** trong đặc tả, mục "Thử tay" của đợt 3b.

Chỗ soi kỹ nhất là **phép 7**: đăng nhập bằng giáo viên thường thì **không** được thấy khung đơn.

---

## Tự soát kế hoạch

- **Phủ đặc tả:** 3a có Task 1 (hằng + phép kiểm), Task 2 (luật), Task 3 (đọc/ghi), Task 4 (giao diện), Cổng A (Playground + Publish + REST). 3b có Task 5 (trường + lối vào), Task 6 (băng chờ), Task 7 (duyệt), Cổng B (thử tay). Ba cái bẫy của 3b nằm ở Task 6 Step 1 (lối vào phải đo), Task 5 Step 1 và Task 7 Step 2 (`pendingRole` rác), Task 7 Step 2 (chỗ đặt khung).
- **Không có chỗ bỏ lửng:** mọi bước có mã thật hoặc lệnh chạy thật.
- **Tên gọi nhất quán:** `EMAIL_CHU_DU_AN`, `laChuDuAn()`, `laDongQuanTri()`, `docDongQuanTri`, `ghiDongQuanTri`, `themDongQuanTri`, `boDongQuanTri`, `laChuDuAnHienTai`, `laDongQuanTriHienTai`, `pendingRole`, `registerTeacherApplicant`, `duyetDonGiaoVien`, `tuChoiDonGiaoVien` — dùng y hệt ở mọi task.
