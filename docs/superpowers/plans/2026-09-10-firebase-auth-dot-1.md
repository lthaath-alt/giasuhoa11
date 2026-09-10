# Chuyển sang Firebase Auth — Đợt 1

> **Cho người thực thi (kể cả AI):** Dùng kỹ năng `superpowers:executing-plans`
> hoặc `superpowers:subagent-driven-development` để làm từng việc một. Các bước
> dùng ô đánh dấu `- [ ]`.

**Mục tiêu:** Thay hệ đăng nhập tự viết (so mật khẩu chữ thường trên trình duyệt)
bằng Firebase Auth thật, và xoá cột `password` khỏi collection `users`.

**Cách làm:** Firebase Auth đã bật sẵn trong dự án `giasuhoa11` với hai nhà cung
cấp Email/Password và Google, và đã có 15 tài khoản khớp trường `authUid` trong
Firestore. Việc của đợt này là **nối mã vào hạ tầng đã dựng sẵn**: đánh lại khoá
tài liệu `users` theo `uid` của Auth, cho `AppContext` nghe `onAuthStateChanged`,
và viết lại `firestoreAuth.ts` để gọi Firebase Auth thay vì so chuỗi.

**Công nghệ:** React 19 + Vite 6 + TypeScript 5.8, `firebase` v9+ dạng modular
(`firebase/auth`, `firebase/firestore`). Không thêm gói mới.

**Đặc tả:** Không có tệp spec riêng. Các quyết định đã chốt nằm ngay mục dưới —
chúng ra đời từ một lượt `brainstorming` ngày 10/09/2026, và mọi con số trong
tài liệu này đều đo từ dữ liệu thật, không ước lượng.

---

## Quyết định đã chốt (đây là đặc tả)

1. **Hai đợt.** Đợt 1 chỉ đổi cách đăng nhập. `firestore.rules` **giữ nguyên như
   bản đã publish ngày 10/09/2026** — đợt 2 mới siết phân quyền theo vai.
2. **Đánh lại khoá `users` theo `uid`.** Id tài liệu mới = `authUid`. Lý do: luật
   Firestore **không truy vấn được**, chỉ `get()` theo đường dẫn; muốn đợt 2 đọc
   được vai của người gọi thì bắt buộc `users/{uid}`.
3. **Admin tạo tài khoản bằng phiên phụ.** `createUserWithEmailAndPassword` đăng
   nhập luôn bằng tài khoản vừa tạo, nên phải gọi nó trên một Firebase App thứ
   hai rồi huỷ app đó. Giao diện admin giữ nguyên.
4. **Chỉ đăng nhập bằng email.** Đã đếm: 12/16 tài khoản không có trường
   `username`; 3 cái có thì trùng y hệt email. Nhánh username là mã thừa.
5. **Xoá cột `password`** khỏi `users` — đây chính là lỗ hổng cần đóng.
6. **Đăng nhập Google để NGOÀI phạm vi.** Đã kiểm: `VITE_GOOGLE_CLIENT_ID` để
   trống và `signInWithGoogle()` không nơi nào gọi. Đây là tính năng chưa từng
   chạy, không phải thứ đang hỏng.

## Ràng buộc toàn cục

- **Trả lời và chú thích bằng tiếng Việt**; giữ tiếng Anh cho tên biến/hàm/lệnh.
- **Gói Spark ($0)** — KHÔNG được dùng Cloud Functions hay Admin SDK.
- **Không thêm gói npm nào.** `firebase` đã có sẵn.
- `UserRole = 'admin' | 'school_admin' | 'teacher' | 'student'` — bốn vai, chữ
  thường, gạch dưới.
- **Không tự chạy `npm run build`, git nguy hiểm, push hay deploy** — user tự làm.
- Sau mỗi việc: `npm run lint` (tức `tsc --noEmit`) phải sạch.
- Dự án **không có bộ chạy test** (không Vitest, không Jest). "Viết test trước"
  ở đây nghĩa là **viết phép kiểm trước**, thêm vào `scripts/kiem-tra-*.mts`.
- **Đừng tin dòng "xong" của script tự viết** — sau mỗi lần script sửa tệp phải
  `grep` lại đúng chuỗi vừa đặt vào.

---

## Bản đồ tệp

| Tệp | Trách nhiệm sau đợt này |
|---|---|
| `src/core/services/firebase.ts` | Sửa: thêm hàm tạo/huỷ Firebase App phụ |
| `src/core/services/firestoreAuth.ts` | Viết lại: 5 hàm cũ, ruột gọi Firebase Auth |
| `src/core/contexts/AppContext.tsx` | Sửa: `onAuthStateChanged`, `login`, `register`, `logout`, `forgotPassword` |
| `src/features/admin/components/FirestoreAccountManager.tsx` | Sửa: theo chữ ký hàm mới |
| `scripts/chuyen-users-sang-uid.mts` | Tạo mới: đánh lại khoá 16 tài liệu |
| `scripts/xoa-cot-password.mts` | Tạo mới: xoá cột `password`, chạy CUỐI CÙNG |
| `scripts/kiem-tra-an-ninh.mts` | Sửa: thêm 3 phép kiểm canh không quay lại lối cũ |
| `CLAUDE.md` | Sửa: mục Auth, mục An ninh |

**KHÔNG sửa:** `RouteGuards.tsx` và 32 tệp gọi `useApp()` — hình dạng
`currentUser` giữ nguyên nên chúng chạy y như cũ.

## Thứ tự bắt buộc, và vì sao

```
Việc 1  phép kiểm (đỏ ngay)      ← viết trước để biết lúc nào thật sự xong
Việc 2  đánh lại khoá users      ← AN TOÀN chạy sớm: mã cũ tra theo TRƯỜNG
                                    email/username, không tra theo id tài liệu
Việc 3  firebase.ts app phụ
Việc 4  firestoreAuth.ts
Việc 5  AppContext
Việc 6  FirestoreAccountManager
Việc 7  ⚠ xoá cột password       ← CHỈ khi đã đăng nhập được bằng Auth thật.
                                    Xoá sớm là đăng nhập cũ chết ngay lập tức,
                                    mà mã mới thì chưa chạy.
Việc 8  tài liệu
```

---

## Một thay đổi hành vi phải nói trước

Hiện tại `AppContext` **cố ý xoá session mỗi lần mở trang** (dòng 368–371:
`localStorage.removeItem(...)`, `setCurrentUser(null)`), nên bấm F5 là văng ra
màn đăng nhập.

Firebase Auth **giữ phiên** qua IndexedDB. Sau đợt này, F5 sẽ **vẫn đăng nhập**.
Đây là cải thiện thật, nhưng là đổi hành vi — phải báo user và thử tay.

---

### Việc 1: Phép kiểm canh không quay lại lối cũ

**Tệp:**
- Sửa: `scripts/kiem-tra-an-ninh.mts`

**Giao diện:**
- Dùng: các hàm sẵn có trong tệp — `dat()`, `truot()`, `doc()`, `ten()`, `tepNguon`
- Cho việc sau: không có

- [ ] **Bước 1: Viết phép kiểm (nó PHẢI đỏ ngay bây giờ)**

Chèn vào `scripts/kiem-tra-an-ninh.mts`, ngay trước dòng
`console.log('\n== Luật phân quyền Firestore nằm trong git ==');`:

```typescript
console.log('\n== Đăng nhập phải qua Firebase Auth ==');
{
  /* Ba phép kiểm này canh cho đợt chuyển 10/09/2026 không bị lùi lại.
     Lỗ hổng cũ: `users` lưu mật khẩu dạng chữ thường và `firestoreAuth.ts`
     so sánh ngay trên trình duyệt, nên ai đọc được collection `users` là
     có toàn bộ mật khẩu. */
  const boChuThich = (n: string) => n
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(?<![:\w])\/\/[^\n]*/g, ' ');

  /* 1. Không còn chỗ nào so sánh mật khẩu bằng chuỗi. */
  const pham: string[] = [];
  for (const f of tepNguon) {
    const n = boChuThich(doc(f));
    if (/\.password\s*!==\s*password|password\s*!==\s*\w+\.password/.test(n)) {
      pham.push(ten(f));
    }
  }
  if (pham.length) truot('không so sánh mật khẩu trên trình duyệt', pham.join(', '));
  else dat('không so sánh mật khẩu trên trình duyệt');

  /* 2. Không ghi trường `password` vào Firestore nữa. */
  const ghi: string[] = [];
  for (const f of tepNguon) {
    const n = boChuThich(doc(f));
    for (const m of n.matchAll(/(?:setDoc|addDoc|updateDoc)\s*\([\s\S]{0,400}?\)/g)) {
      if (/\bpassword\s*:/.test(m[0])) ghi.push(ten(f));
    }
  }
  if (ghi.length) truot('không ghi trường password vào Firestore', [...new Set(ghi)].join(', '));
  else dat('không ghi trường password vào Firestore');

  /* 3. firestoreAuth.ts phải thật sự gọi Firebase Auth. */
  const P = join(GOC, 'src/core/services/firestoreAuth.ts');
  if (!existsSync(P)) truot('có firestoreAuth.ts', 'thiếu tệp');
  else {
    const n = doc(P);
    const can = ['signInWithEmailAndPassword', 'createUserWithEmailAndPassword', 'sendPasswordResetEmail'];
    const thieu = can.filter(h => !n.includes(h));
    if (thieu.length) truot('firestoreAuth.ts dùng Firebase Auth', 'thiếu: ' + thieu.join(', '));
    else dat('firestoreAuth.ts dùng Firebase Auth');
  }
}
```

- [ ] **Bước 2: Chạy để xác nhận nó ĐỎ**

```bash
npm run kiem-tra:an-ninh
```

Phải thấy đủ **3 dòng `SAI`**:
```
SAI  không so sánh mật khẩu trên trình duyệt
SAI  không ghi trường password vào Firestore
SAI  firestoreAuth.ts dùng Firebase Auth
```

Nếu có dòng nào đã ĐẠT ngay bây giờ thì phép kiểm đó **viết sai** — nó chưa soi
được gì. Sửa phép kiểm rồi chạy lại, đừng đi tiếp.

- [ ] **Bước 3: Commit**

```bash
git add scripts/kiem-tra-an-ninh.mts
git commit -m "Them phep kiem canh dang nhap phai qua Firebase Auth (dang do)"
```

---

### Việc 2: Đánh lại khoá `users` theo `uid`

**Tệp:**
- Tạo: `scripts/chuyen-users-sang-uid.mts`
- Sửa: `package.json` (thêm lệnh `chuyen:users`)

**Giao diện:**
- Dùng: `src/core/services/firebaseCongKhai.ts` để lấy `apiKey` và `projectId`
- Cho việc sau: sau khi chạy, mọi tài liệu `users` có id **bằng** `authUid`

**An toàn:** chạy sớm được vì mã cũ tra người dùng theo **trường** `email` /
`username`, không theo id tài liệu. Đã kiểm: `progress` và `chats` trỏ tới user
bằng `userEmail`, `classes` bằng `studentIdentifiers` + `teacherEmail`. Không
collection nào trỏ bằng id tài liệu.

- [ ] **Bước 1: Viết script, mặc định là CHẠY THỬ**

Tạo `scripts/chuyen-users-sang-uid.mts`:

```typescript
/* ─── Đánh lại khoá collection `users` theo uid của Firebase Auth ────────────
 *
 * Vì sao cần: luật Firestore KHÔNG truy vấn được, chỉ `get()` theo đường dẫn.
 * Muốn luật đọc được vai của người đang gọi thì tài liệu phải nằm đúng ở
 * `users/{request.auth.uid}`. Hiện id tài liệu là chuỗi ngẫu nhiên: đã đo ngày
 * 10/09/2026, 0/16 tài liệu có id trùng `authUid`.
 *
 * An toàn: mã ứng dụng tra người dùng theo TRƯỜNG `email`/`username`, không
 * theo id tài liệu; `progress`/`chats` trỏ bằng `userEmail`, `classes` bằng
 * `studentIdentifiers` + `teacherEmail`. Nên đổi id không làm hỏng gì.
 *
 * Mặc định CHẠY THỬ, không ghi gì. Thêm `--that` mới ghi.
 *
 * Chạy: npm run chuyen:users          (thử)
 *       npm run chuyen:users -- --that (ghi thật)
 */
import { readFileSync } from 'node:fs';

const GOC = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const cauHinh = readFileSync(GOC + 'src/core/services/firebaseCongKhai.ts', 'utf8');
const KHOA = cauHinh.match(/apiKey: '([^']+)'/)![1];
const DU_AN = cauHinh.match(/projectId: '([^']+)'/)![1];
const GOC_API = `https://firestore.googleapis.com/v1/projects/${DU_AN}/databases/(default)/documents`;
const THAT = process.argv.includes('--that');

const lay = (duong: string) => fetch(`${GOC_API}/${duong}?key=${KHOA}`).then(r => r.json());

async function main() {
  const j = await lay('users?pageSize=300');
  const docs = (j.documents ?? []) as any[];
  console.log(`Đọc được ${docs.length} tài liệu users\n`);

  const canChuyen: { cu: string; moi: string; fields: any; email: string }[] = [];
  const boQua: string[] = [];

  for (const d of docs) {
    const idCu = d.name.split('/').pop() as string;
    const uid = d.fields?.authUid?.stringValue ?? '';
    const email = d.fields?.email?.stringValue ?? '(không có email)';
    if (!uid) { boQua.push(`${idCu}  (${email}) — KHÔNG có authUid`); continue; }
    if (idCu === uid) { boQua.push(`${idCu}  (${email}) — đã đúng khoá rồi`); continue; }
    canChuyen.push({ cu: idCu, moi: uid, fields: d.fields, email });
  }

  console.log(`Cần chuyển: ${canChuyen.length}`);
  for (const x of canChuyen) console.log(`  ${x.email.padEnd(32)} ${x.cu}  ->  ${x.moi}`);
  if (boQua.length) {
    console.log(`\nBỏ qua: ${boQua.length}`);
    for (const x of boQua) console.log('  ' + x);
  }

  if (!THAT) {
    console.log('\n(CHẠY THỬ — chưa ghi gì. Thêm `-- --that` để ghi thật.)\n');
    return;
  }

  console.log('\nĐang ghi…');
  let xong = 0;
  for (const x of canChuyen) {
    /* Ghi tài liệu MỚI trước, đọc lại xác nhận, rồi mới xoá tài liệu cũ.
       Đứt mạng giữa chừng thì thừa một bản sao, còn hơn mất dữ liệu. */
    const tao = await fetch(`${GOC_API}/users?documentId=${x.moi}&key=${KHOA}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: x.fields }),
    });
    if (!tao.ok) { console.log(`  HỎNG tạo ${x.moi}: HTTP ${tao.status}`); continue; }

    const kiem = await lay(`users/${x.moi}`);
    if (!kiem.name) { console.log(`  HỎNG đọc lại ${x.moi} — GIỮ NGUYÊN bản cũ`); continue; }

    const xoa = await fetch(`${GOC_API}/users/${x.cu}?key=${KHOA}`, { method: 'DELETE' });
    if (!xoa.ok) { console.log(`  Tạo xong nhưng KHÔNG xoá được bản cũ ${x.cu}`); continue; }

    xong++;
    console.log(`  OK  ${x.email}`);
  }
  console.log(`\nChuyển xong ${xong}/${canChuyen.length}\n`);
}

main();
```

- [ ] **Bước 2: Thêm lệnh vào `package.json`**

Trong khối `"scripts"`, thêm ngay sau dòng `"xuat:ngan-hang"`:

```json
    "chuyen:users": "tsx scripts/chuyen-users-sang-uid.mts",
```

- [ ] **Bước 3: Chạy thử, đọc kỹ kết quả**

```bash
npm run chuyen:users
```

Trông đợi: **15 cần chuyển**, **1 bỏ qua** (bản ghi `admin@system.local` không có
`authUid` — đây là bản ghi rác, `role: student` nhưng `username: admin`; **đừng
tự xoá**, báo user).

Con số khác 15/1 thì **dừng lại**, báo user trước khi ghi.

- [ ] **Bước 4: Ghi thật**

```bash
npm run chuyen:users -- --that
```

- [ ] **Bước 5: Chạy lại để xác nhận (đừng tin thông báo của script)**

```bash
npm run chuyen:users
```

Lần này phải ra **Cần chuyển: 0**, và 15 dòng "đã đúng khoá rồi".

- [ ] **Bước 6: Xác nhận ứng dụng cũ VẪN chạy**

`npm run dev`, đăng nhập bằng một tài khoản thật. Vẫn phải vào được — mã cũ chưa
đổi dòng nào. Vào không được thì lùi lại và báo user ngay.

- [ ] **Bước 7: Commit**

```bash
git add scripts/chuyen-users-sang-uid.mts package.json
git commit -m "Danh lai khoa users theo uid cua Firebase Auth"
```

---

### Việc 3: Firebase App phụ cho việc tạo tài khoản

**Tệp:**
- Sửa: `src/core/services/firebase.ts` (thêm vào cuối, trước `export default db`)

**Giao diện:**
- Dùng: `firebaseConfig` đã export sẵn trong chính tệp này
- Cho việc sau: `taoAuthPhu(): { authPhu: Auth; huy: () => Promise<void> }`

- [ ] **Bước 1: Thêm hàm**

```typescript
/**
 * Tạo một Firebase App PHỤ chỉ để tạo tài khoản mới.
 *
 * Vì sao cần: `createUserWithEmailAndPassword` ĐĂNG NHẬP LUÔN bằng tài khoản
 * vừa tạo. Gọi nó trên app chính thì admin đang thao tác bị đá ra khỏi phiên
 * của chính mình và trở thành người dùng mới — mất phiên, mất luôn ngữ cảnh.
 *
 * Cách chính thống là dùng Admin SDK trong Cloud Function, nhưng thứ đó đòi
 * gói Blaze trả tiền. Dự án đang ở gói Spark ($0), nên dùng app phụ: nó có
 * kho phiên riêng, tạo xong thì huỷ, phiên của admin không hề bị đụng.
 *
 * LUÔN gọi `huy()` trong khối `finally`, kể cả khi tạo lỗi — bỏ sót thì app
 * phụ còn đó và lần gọi sau sẽ trùng tên.
 */
export function taoAuthPhu(): { authPhu: Auth; huy: () => Promise<void> } {
  const ten = `phu-${Date.now()}`;
  const appPhu = initializeApp(firebaseConfig, ten);
  const authPhu = getAuth(appPhu);
  return {
    authPhu,
    huy: async () => {
      try { await signOut(authPhu); } catch { /* chưa đăng nhập thì thôi */ }
      await deleteApp(appPhu);
    },
  };
}
```

- [ ] **Bước 2: Sửa hai dòng import ở đầu tệp**

```typescript
import { initializeApp, getApps, getApp, deleteApp } from 'firebase/app';
import { getAuth, signOut, type Auth } from 'firebase/auth';
```

- [ ] **Bước 3: Kiểm biên dịch**

```bash
npm run lint
```
Trông đợi: không lỗi.

- [ ] **Bước 4: Commit**

```bash
git add src/core/services/firebase.ts
git commit -m "Them Firebase App phu de tao tai khoan khong lam mat phien admin"
```

---

### Việc 4: Viết lại `firestoreAuth.ts`

**Tệp:**
- Sửa: `src/core/services/firestoreAuth.ts` (thay toàn bộ, 297 dòng)

**Giao diện:**
- Dùng: `auth`, `db`, `taoAuthPhu` từ `./firebase`
- Cho việc sau — **giữ nguyên 5 tên hàm cũ** để chỗ gọi đổi ít nhất:
  - `loginWithFirestore(email: string, password: string)` → `{ success, message, user? }`
  - `createAccountWithFirestore(data)` → `{ success, message, user? }`
  - `resetPasswordWithFirestore(email: string)` → `{ success, message }`
    **⚠ Chữ ký ĐỔI**: trước là `(docId, newPassword)`, nay là `(email)`
  - `updateUserRole(uid: string, newRole: string)` → `{ success, message }` (không đổi)
  - `getFirestoreUsers()` → `FirestoreUser[]` (không đổi, nhưng bỏ trường `password`)
  - `FirestoreUser` — **bỏ hẳn trường `password`**

- [ ] **Bước 1: Thay toàn bộ nội dung tệp**

```typescript
import {
  collection, query, where, getDocs, getDoc, setDoc, updateDoc,
  doc, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, signOut,
} from 'firebase/auth';
import { db, auth, taoAuthPhu } from './firebase';
import { ErrorLogService } from './errorLog';

/* ─── Đăng nhập qua Firebase Auth ─────────────────────────────────────────────
 *
 * Trước 10/09/2026 tệp này đọc thẳng collection `users` rồi SO CHUỖI mật khẩu
 * ngay trên trình duyệt. Mà `users` phải cho đọc công khai để việc đó chạy
 * được, nên bất kỳ ai cũng tải về được toàn bộ mật khẩu của mọi người. Đó là
 * lỗ hổng nặng nhất của dự án.
 *
 * Nay mật khẩu chỉ tồn tại ở phía Firebase Auth, đã băm, không bao giờ về tới
 * trình duyệt. Tài liệu `users/{uid}` chỉ còn giữ hồ sơ: tên, vai, lớp, trạng
 * thái.
 *
 * `npm run kiem-tra:an-ninh` canh cho tệp này không quay lại lối cũ.
 */

// ─── Hồ sơ người dùng trên Firestore (KHÔNG còn mật khẩu) ───────────────────
export interface FirestoreUser {
  /** Id tài liệu = uid của Firebase Auth */
  uid: string;
  /** Email đăng nhập */
  username: string;
  /** Họ và tên hiển thị */
  fullName: string;
  /** Vai trò: 'admin' | 'school_admin' | 'teacher' | 'student' */
  role: string;
  createdAt?: string | Timestamp;
}

/** Đổi mã lỗi của Firebase Auth sang câu tiếng Việt học sinh đọc hiểu. */
function loiTiengViet(ma: string): string {
  switch (ma) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Sai email hoặc mật khẩu.';
    case 'auth/invalid-email':
      return 'Email không đúng định dạng.';
    case 'auth/user-disabled':
      return 'Tài khoản này đã bị khoá. Hãy liên hệ giáo viên.';
    case 'auth/too-many-requests':
      return 'Sai quá nhiều lần. Hãy đợi vài phút rồi thử lại.';
    case 'auth/email-already-in-use':
      return 'Email này đã có tài khoản rồi.';
    case 'auth/weak-password':
      return 'Mật khẩu phải từ 6 ký tự trở lên.';
    case 'auth/network-request-failed':
      return 'Không kết nối được. Hãy kiểm tra mạng.';
    default:
      return 'Không đăng nhập được. Hãy thử lại.';
  }
}

// ─── 1. ĐĂNG NHẬP ───────────────────────────────────────────────────────────
export const loginWithFirestore = async (
  email: string,
  password: string
): Promise<{ success: boolean; message: string; user?: FirestoreUser }> => {
  const dinhDanh = email.trim().toLowerCase();
  if (!dinhDanh || !password) {
    return { success: false, message: 'Vui lòng nhập đầy đủ email và mật khẩu!' };
  }
  try {
    const cred = await signInWithEmailAndPassword(auth, dinhDanh, password);
    const uid = cred.user.uid;

    /* Hồ sơ nằm ở `users/{uid}` — đã đánh lại khoá ở việc 2. Thiếu hồ sơ thì
       KHÔNG tự tạo: có tài khoản Auth mà không có hồ sơ là dấu hiệu dữ liệu
       lệch, phải để người quản trị nhìn thấy chứ đừng lặng lẽ vá. */
    const hoSo = await getDoc(doc(db, 'users', uid));
    if (!hoSo.exists()) {
      await signOut(auth);
      return {
        success: false,
        message: 'Tài khoản đăng nhập được nhưng chưa có hồ sơ trong hệ thống. Hãy báo giáo viên.',
      };
    }

    const d = hoSo.data();
    return {
      success: true,
      message: 'Đăng nhập thành công!',
      user: {
        uid,
        username: d.email || d.username || dinhDanh,
        fullName: d.fullName || d.name || '',
        role: d.role || 'student',
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || '',
      },
    };
  } catch (error: any) {
    const ma = error?.code || '';
    /* Sai mật khẩu là chuyện thường ngày, KHÔNG ghi vào nhật ký lỗi — ghi thì
       nhật ký ngập và lỗi thật bị chìm. Chỉ ghi lỗi hệ thống. */
    if (ma !== 'auth/invalid-credential' && ma !== 'auth/wrong-password' && ma !== 'auth/user-not-found') {
      ErrorLogService.logError({
        level: 'Lỗi Cơ Sở Dữ Liệu',
        component: 'firestoreAuth.login',
        message: `${ma} — ${error?.message || ''}`,
      });
    }
    return { success: false, message: loiTiengViet(ma) };
  }
};

// ─── 2. TẠO TÀI KHOẢN ───────────────────────────────────────────────────────
/**
 * Tạo tài khoản Auth + hồ sơ Firestore.
 *
 * `dangTuDangKy = true`  → người dùng tự đăng ký, tạo trên app CHÍNH nên tạo
 *                          xong là đăng nhập luôn (đúng ý muốn).
 * `dangTuDangKy = false` → admin tạo hộ, dùng app PHỤ để phiên của admin
 *                          không bị đụng.
 */
export const createAccountWithFirestore = async (data: {
  username: string;
  password: string;
  fullName: string;
  role: string;
  email?: string;
  classId?: string;
  schoolId?: string;
  status?: string;
  dangTuDangKy?: boolean;
}): Promise<{ success: boolean; message: string; user?: FirestoreUser }> => {
  const email = (data.email || data.username).trim().toLowerCase();
  const fullName = data.fullName.trim();
  const role = data.role || 'student';
  const status = data.status || 'active';

  if (!email || !data.password || !fullName) {
    return { success: false, message: 'Vui lòng nhập đầy đủ Email, Mật khẩu và Họ tên!' };
  }
  if (data.password.length < 6) {
    return { success: false, message: 'Mật khẩu phải từ 6 ký tự trở lên.' };
  }

  const tuDangKy = data.dangTuDangKy === true;
  const phu = tuDangKy ? null : taoAuthPhu();

  try {
    const authDung = phu ? phu.authPhu : auth;
    const cred = await createUserWithEmailAndPassword(authDung, email, data.password);
    const uid = cred.user.uid;

    /* setDoc với id = uid, KHÔNG dùng addDoc: luật Firestore đợt 2 sẽ cần đọc
       `users/{request.auth.uid}` để biết vai. addDoc sinh id ngẫu nhiên là
       hỏng đúng điều đó. */
    const hoSo: Record<string, any> = {
      email,
      username: email,
      fullName,
      name: fullName,
      role,
      status,
      authUid: uid,
      authProvider: 'firebase',
      createdAt: serverTimestamp(),
    };
    if (data.classId) hoSo.classId = data.classId;
    if (data.schoolId) hoSo.schoolId = data.schoolId;

    await setDoc(doc(db, 'users', uid), hoSo);

    return {
      success: true,
      message: `Đã tạo tài khoản "${email}" thành công!`,
      user: { uid, username: email, fullName, role, createdAt: new Date().toISOString() },
    };
  } catch (error: any) {
    const ma = error?.code || '';
    ErrorLogService.logError({
      level: 'Lỗi Cơ Sở Dữ Liệu',
      component: 'firestoreAuth.createAccount',
      message: `${ma} — ${error?.message || ''}`,
    });
    return { success: false, message: loiTiengViet(ma) };
  } finally {
    if (phu) await phu.huy();
  }
};

// ─── 3. ĐẶT LẠI MẬT KHẨU ────────────────────────────────────────────────────
/**
 * Gửi thư đặt lại mật khẩu.
 *
 * ⚠ CHỮ KÝ ĐÃ ĐỔI: trước là `(docId, newPassword)` — admin tự gõ mật khẩu mới
 * rồi ghi thẳng vào Firestore. Nay không ai đặt hộ mật khẩu ai được nữa; chỉ
 * chủ hộp thư mới đặt được. Đó chính là điều đợt này muốn.
 *
 * Firebase gửi thư miễn phí trên gói Spark. Nội dung thư sửa ở
 * Firebase Console → Authentication → Templates.
 */
export const resetPasswordWithFirestore = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  const dinhDanh = (email || '').trim().toLowerCase();
  if (!dinhDanh) return { success: false, message: 'Không xác định được email tài khoản!' };
  try {
    await sendPasswordResetEmail(auth, dinhDanh);
    /* Câu trả lời CỐ Ý không nói email có tồn tại hay không — nói ra là biến
       màn này thành công cụ dò xem ai có tài khoản. */
    return {
      success: true,
      message: `Nếu ${dinhDanh} có tài khoản, thư đặt lại mật khẩu đã được gửi. Hãy kiểm tra cả hộp thư rác.`,
    };
  } catch (error: any) {
    const ma = error?.code || '';
    if (ma === 'auth/user-not-found') {
      return {
        success: true,
        message: `Nếu ${dinhDanh} có tài khoản, thư đặt lại mật khẩu đã được gửi. Hãy kiểm tra cả hộp thư rác.`,
      };
    }
    ErrorLogService.logError({
      level: 'Lỗi Cơ Sở Dữ Liệu',
      component: 'firestoreAuth.resetPassword',
      message: `${ma} — ${error?.message || ''}`,
    });
    return { success: false, message: loiTiengViet(ma) };
  }
};

// ─── 4. CẬP NHẬT VAI TRÒ ────────────────────────────────────────────────────
export const updateUserRole = async (
  uid: string,
  newRole: string
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!uid) return { success: false, message: 'Không xác định được ID tài khoản!' };
    if (!newRole || !newRole.trim()) return { success: false, message: 'Vui lòng chọn quyền hạn mới!' };
    await updateDoc(doc(db, 'users', uid), { role: newRole.trim() });
    return { success: true, message: `Đã cập nhật quyền thành "${newRole}" thành công!` };
  } catch (error: any) {
    ErrorLogService.logError({
      level: 'Lỗi Cơ Sở Dữ Liệu',
      component: 'firestoreAuth.updateUserRole',
      message: error?.message || 'Lỗi khi cập nhật quyền người dùng',
    });
    return { success: false, message: error?.message || 'Không thể cập nhật quyền trên Firestore!' };
  }
};

// ─── 5. DANH SÁCH TÀI KHOẢN ─────────────────────────────────────────────────
export const getFirestoreUsers = async (): Promise<FirestoreUser[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map((s) => {
      const d = s.data();
      return {
        uid: s.id,
        username: d.email || d.username || '',
        fullName: d.fullName || d.name || '',
        role: d.role || 'student',
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || '',
      };
    });
  } catch (error: any) {
    ErrorLogService.logError({
      level: 'Lỗi Cơ Sở Dữ Liệu',
      component: 'firestoreAuth.getUsers',
      message: error?.message || 'Lỗi khi lấy danh sách người dùng',
    });
    return [];
  }
};
```

- [ ] **Bước 2: Kiểm biên dịch — sẽ có lỗi, đó là đúng**

```bash
npm run lint
```

Trông đợi: lỗi ở `AppContext.tsx` (dùng `fsRes.user.password` đã bị bỏ) và ở
`FirestoreAccountManager.tsx` (gọi `resetPasswordWithFirestore` với 2 tham số).
Hai lỗi này chính là việc 5 và việc 6. **Chưa commit ở bước này** — kho phải luôn
biên dịch được.

- [ ] **Bước 3: Không commit riêng.** Đi thẳng sang việc 5.

---

### Việc 5: `AppContext` — nghe `onAuthStateChanged`

**Tệp:**
- Sửa: `src/core/contexts/AppContext.tsx`

**Giao diện:**
- Dùng: `loginWithFirestore`, `createAccountWithFirestore`, `resetPasswordWithFirestore`
  từ việc 4; `auth` từ `../services/firebase`
- Cho việc sau: hình dạng `currentUser` **không đổi** — 32 tệp gọi `useApp()` chạy y như cũ

- [ ] **Bước 1: Thêm import**

Thêm vào khối import đầu tệp:

```typescript
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
```

- [ ] **Bước 2: Thay khối "không tự động khôi phục session"**

Tìm dòng 368–371 (trong `useEffect` khởi tạo):

```typescript
      // 7. Không tự động khôi phục session — user phải đăng nhập lại
      localStorage.removeItem('h11_current_user_data');
      localStorage.removeItem('h11_current_user_email');
      setCurrentUser(null);
```

Thay bằng **ba dòng** (chỉ dọn localStorage cũ, không tự đặt `currentUser` nữa):

```typescript
      // 7. Phiên nay do Firebase Auth quản — xem useEffect riêng bên dưới.
      //    Hai khoá localStorage này là tàn dư của hệ cũ, dọn cho sạch.
      localStorage.removeItem('h11_current_user_data');
      localStorage.removeItem('h11_current_user_email');
```

- [ ] **Bước 2b: Thêm một `useEffect` RIÊNG cho `onAuthStateChanged`**

Đặt ngay sau `useEffect` khởi tạo (sau dòng `}, []);` ở dòng 377):

```typescript
  /* ── Phiên đăng nhập: nghe Firebase Auth ───────────────────────────────────
   *
   * ĐỔI HÀNH VI: trước đây `init()` CỐ Ý xoá session mỗi lần mở trang, nên bấm
   * F5 là văng ra màn đăng nhập. Firebase Auth giữ phiên trong IndexedDB, nên
   * nay F5 vẫn còn đăng nhập.
   *
   * Phải là useEffect RIÊNG, và hồ sơ phải đọc THẲNG từ Firestore — KHÔNG lấy
   * từ mảng `users` trong state. Hai lý do:
   *
   *   1. Hàm gọi lại này sống lâu hơn lần chạy đăng ký nó. Đóng gói mảng
   *      `users` vào trong là giữ mãi một ảnh chụp cũ, và người VỪA đăng ký
   *      xong sẽ không có trong ảnh chụp đó — đăng ký thành công nhưng bị đá
   *      ra màn đăng nhập.
   *   2. Đặt `users` vào mảng phụ thuộc thì mỗi lần danh sách đổi lại đăng ký
   *      lại người nghe. Đọc thẳng thì mảng phụ thuộc rỗng là đúng.
   */
  useEffect(() => {
    const thoi = onAuthStateChanged(auth, async (nguoiAuth) => {
      if (!nguoiAuth) {
        setCurrentUser(null);
        localStorage.removeItem('h11_current_user_email');
        localStorage.removeItem('h11_current_user_data');
        return;
      }

      const anh = await getDoc(doc(db, 'users', nguoiAuth.uid));
      if (!anh.exists()) {
        /* Có phiên Auth mà không có hồ sơ — đừng đoán, đừng tự tạo. Đây là dấu
           hiệu dữ liệu lệch, phải để người quản trị nhìn thấy. */
        await signOut(auth);
        setCurrentUser(null);
        return;
      }

      const d = anh.data();
      const hoSo: User = {
        ...(d as any),
        id: anh.id,
        email: d.email || d.username || nguoiAuth.email || '',
        name: d.fullName || d.name || '',
        role: chuanHoaVaiTro(d.role as string),
      };

      await loadProgressForUser(hoSo.email);
      persistSession(hoSo);
      /* Đồng bộ luôn vào mảng `users` để phần còn lại của app thấy bản mới nhất. */
      setUsers(prev => prev.some(u => u.id === hoSo.id)
        ? prev.map(u => u.id === hoSo.id ? hoSo : u)
        : [...prev, hoSo]);
    });

    return () => thoi();   // huỷ đăng ký khi component rời đi
  }, []);
```

Thêm `getDoc`, `doc` vào import `firebase/firestore` và `db` vào import
`../services/firebase` nếu tệp chưa có.

- [ ] **Bước 3: Rút gọn `login`**

Thay toàn bộ thân hàm `login` (dòng 398–434) bằng:

```typescript
  const login = async (identifier: string, password: string) => {
    const fsRes = await loginWithFirestore(identifier, password);
    if (!fsRes.success || !fsRes.user) {
      return { success: false, message: fsRes.message || 'Sai email hoặc mật khẩu' };
    }

    /* Không tự dựng `appUser` ở đây nữa: `onAuthStateChanged` sẽ chạy ngay sau
       khi đăng nhập thành công và tự đặt currentUser từ hồ sơ Firestore. Dựng
       hai lần là hai nguồn sự thật, và bản dựng tay ở đây từng đặt email giả
       dạng `${username}@firestore.local` khi không tìm thấy user trong state —
       đủ để tiến độ học ghi nhầm chỗ. */
    const stateUser = users.find(u => u.id === fsRes.user!.uid);
    return { success: true, message: 'Đăng nhập thành công!', user: stateUser };
  };
```

- [ ] **Bước 4: Sửa `register`**

Trong hàm `register` (dòng 517), thêm `dangTuDangKy: true` vào lời gọi, và bỏ
trường `password` khỏi object `newUser`:

```typescript
    const fsRes = await createAccountWithFirestore({
      username: identifier,
      password: password,
      fullName: name,
      role: 'student',
      email: identifier,
      status: 'pending',
      dangTuDangKy: true,   // tạo trên app chính -> đăng nhập luôn
    });
```

và trong `const newUser: User = { … }` **xoá dòng** `password,`.

- [ ] **Bước 5: Sửa `logout`**

```typescript
  const logout = async () => {
    await signOut(auth);          // onAuthStateChanged sẽ dọn currentUser
    setChats([]);
    localStorage.removeItem('h11_current_user_email');
    localStorage.removeItem('h11_current_user_data');
  };
```

- [ ] **Bước 6: Sửa `forgotPassword`**

Thay toàn bộ thân hàm (dòng 564–596) bằng:

```typescript
  const forgotPassword = async (identifier: string) => {
    /* Trước đây hàm này TỰ SINH mật khẩu mới, ghi thẳng vào Firestore rồi hiện
       lên màn hình. Ai mở được màn đó là đổi được mật khẩu người khác. Nay chỉ
       gửi thư — chỉ chủ hộp thư mới đặt lại được.
       Cũng bỏ luôn quy tắc "học sinh phải nhờ giáo viên": nó ra đời vì admin
       phải gõ mật khẩu hộ, mà nay không ai gõ hộ ai nữa. */
    return await resetPasswordWithFirestore(identifier.trim().toLowerCase());
  };
```

Nếu `tsc` báo kiểu trả về không khớp (chỗ gọi mong có `newPassword`/`email`),
sửa chỗ gọi để chỉ dùng `success` và `message`.

- [ ] **Bước 7: Bỏ mọi chỗ còn đọc `password` của user**

```bash
grep -n "\.password" src/core/contexts/AppContext.tsx
```

Xoá hoặc sửa từng dòng còn lại. Dòng 588
(`setCurrentUser(prev => prev ? { ...prev, password: newPassword } : prev)`)
phải biến mất.

- [ ] **Bước 8: Kiểm biên dịch**

```bash
npm run lint
```
Chỉ còn lỗi ở `FirestoreAccountManager.tsx` — đó là việc 6.

---

### Việc 6: `FirestoreAccountManager` theo chữ ký mới

**Tệp:**
- Sửa: `src/features/admin/components/FirestoreAccountManager.tsx` (546 dòng)

**Giao diện:**
- Dùng: 4 hàm từ việc 4
- Cho việc sau: không có

- [ ] **Bước 1: Sửa lời gọi tạo tài khoản (khoảng dòng 114)**

```typescript
    const result = await createAccountWithFirestore({
      username: newUsername.trim(),
      password: newPassword,
      fullName: newFullName.trim(),
      role: newRole,
      // KHÔNG đặt dangTuDangKy: admin tạo hộ -> dùng app phụ -> giữ phiên admin
    });
```

- [ ] **Bước 2: Sửa màn đặt lại mật khẩu (khoảng dòng 145)**

Chữ ký đổi từ `(uid, mật khẩu mới)` sang `(email)`:

```typescript
    const result = await resetPasswordWithFirestore(selectedUser.username);
```

- [ ] **Bước 3: Sửa giao diện của màn đó**

Ô nhập "mật khẩu mới" và state `resetPasswordVal` **không còn nghĩa** — admin
không đặt hộ mật khẩu nữa. Bỏ ô nhập, đổi nhãn nút thành **"Gửi thư đặt lại mật
khẩu"**, và thêm một dòng giải thích:

```tsx
<Typography variant="body2" sx={{ color: 'var(--chu-nhat)', mb: 2 }}>
  Hệ thống sẽ gửi thư tới {selectedUser.username}. Người dùng tự đặt mật khẩu mới.
  Thầy cô không đặt hộ được nữa — đây là điều khiến mật khẩu an toàn.
</Typography>
```

Màu phải dùng biến CSS, đừng viết mã màu cứng (`npm run kiem-tra:mau` bắt).

- [ ] **Bước 4: Bỏ mọi chỗ hiện `password` trong bảng danh sách**

```bash
grep -n "password" src/features/admin/components/FirestoreAccountManager.tsx
```

Còn cột nào hiện mật khẩu thì xoá cột đó.

- [ ] **Bước 5: Kiểm biên dịch — lần này phải SẠCH**

```bash
npm run lint
```
Trông đợi: không lỗi.

- [ ] **Bước 6: Chạy phép kiểm an ninh — 3 mục ở việc 1 phải XANH**

```bash
npm run kiem-tra:an-ninh
```

- [ ] **Bước 7: Thử tay trên `npm run dev`**

Sáu việc, làm đủ:

| # | Thử | Phải ra |
|---|---|---|
| 1 | Đăng nhập bằng một tài khoản thật | Vào được |
| 2 | Bấm **F5** | **Vẫn đăng nhập** (hành vi mới) |
| 3 | Đăng xuất | Ra màn đăng nhập |
| 4 | Đăng nhập sai mật khẩu | "Sai email hoặc mật khẩu." |
| 5 | Admin tạo một tài khoản giáo viên | Tạo xong, **admin VẪN là admin** |
| 6 | Bấm "Gửi thư đặt lại mật khẩu" cho chính mình | Nhận được thư |

Việc 5 là quan trọng nhất — nó chứng minh app phụ hoạt động. Nếu sau khi tạo mà
tên trên thanh tiêu đề đổi thành người vừa tạo thì `taoAuthPhu()` chưa đúng.

- [ ] **Bước 8: Commit cả ba việc 4–5–6 một lần**

```bash
git add src/core/services/firestoreAuth.ts src/core/contexts/AppContext.tsx src/features/admin/components/FirestoreAccountManager.tsx
git commit -m "Dang nhap qua Firebase Auth that, bo so mat khau tren trinh duyet"
```

---

### Việc 7: ⚠ Xoá cột `password` khỏi Firestore

**CHỈ LÀM SAU KHI việc 6 bước 7 đã chạy đúng cả sáu mục.** Xoá sớm là đường đăng
nhập cũ chết ngay mà mã mới chưa chắc chạy — không còn đường lùi.

**Tệp:**
- Tạo: `scripts/xoa-cot-password.mts`
- Sửa: `package.json`

- [ ] **Bước 1: Viết script**

```typescript
/* ─── Xoá cột `password` khỏi collection `users` ──────────────────────────────
 *
 * Đây là bước ĐÓNG lỗ hổng: trước đó `users` phải cho đọc công khai (đăng nhập
 * chạy trên trình duyệt), nên bất kỳ ai cũng tải về được mật khẩu của mọi
 * người. Nay mật khẩu nằm ở Firebase Auth, đã băm.
 *
 * ⚠ CHỈ chạy sau khi đã đăng nhập được bằng Firebase Auth. Chạy sớm là mọi
 * người mất đường đăng nhập cũ mà đường mới chưa chắc chạy.
 *
 * Mặc định CHẠY THỬ. Thêm `--that` mới ghi.
 *
 * Chạy: npm run xoa:password           (thử)
 *       npm run xoa:password -- --that  (ghi thật)
 */
import { readFileSync } from 'node:fs';

const GOC = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const cauHinh = readFileSync(GOC + 'src/core/services/firebaseCongKhai.ts', 'utf8');
const KHOA = cauHinh.match(/apiKey: '([^']+)'/)![1];
const DU_AN = cauHinh.match(/projectId: '([^']+)'/)![1];
const GOC_API = `https://firestore.googleapis.com/v1/projects/${DU_AN}/databases/(default)/documents`;
const THAT = process.argv.includes('--that');

async function main() {
  const j = await fetch(`${GOC_API}/users?pageSize=300&key=${KHOA}`).then(r => r.json());
  const docs = (j.documents ?? []) as any[];
  const co = docs.filter(d => d.fields?.password !== undefined);

  console.log(`${docs.length} tài liệu users, ${co.length} còn cột password\n`);
  for (const d of co) console.log('  ' + (d.fields?.email?.stringValue ?? d.name.split('/').pop()));

  if (!THAT) { console.log('\n(CHẠY THỬ — chưa ghi gì. Thêm `-- --that` để ghi thật.)\n'); return; }

  let xong = 0;
  for (const d of co) {
    const id = d.name.split('/').pop();
    /* updateMask.fieldPaths=password + body không có `password`
       => Firestore XOÁ đúng trường đó, giữ nguyên mọi trường khác. */
    const r = await fetch(
      `${GOC_API}/users/${id}?updateMask.fieldPaths=password&key=${KHOA}`,
      { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: {} }) }
    );
    if (r.ok) { xong++; console.log('  OK  ' + id); }
    else console.log(`  HỎNG ${id}: HTTP ${r.status}`);
  }
  console.log(`\nXoá xong ${xong}/${co.length}\n`);
}

main();
```

- [ ] **Bước 2: Thêm lệnh vào `package.json`**

```json
    "xoa:password": "tsx scripts/xoa-cot-password.mts",
```

- [ ] **Bước 3: Chạy thử**

```bash
npm run xoa:password
```
Trông đợi: 16 tài liệu, 16 còn cột password.

- [ ] **Bước 4: Ghi thật**

```bash
npm run xoa:password -- --that
```

- [ ] **Bước 5: Chạy lại xác nhận**

```bash
npm run xoa:password
```
Phải ra **0 còn cột password**.

- [ ] **Bước 6: Đăng nhập lại lần nữa trên `npm run dev`**

Vẫn phải vào được. Không vào được thì mật khẩu Auth khác mật khẩu cũ → dùng
"Gửi thư đặt lại mật khẩu".

- [ ] **Bước 7: Commit**

```bash
git add scripts/xoa-cot-password.mts package.json
git commit -m "Xoa cot password khoi Firestore — lo hong da dong"
```

---

### Việc 8: Cập nhật tài liệu

**Tệp:**
- Sửa: `CLAUDE.md`

- [ ] **Bước 1: Sửa bảng "Hiện trạng dự án"**

```
| Auth | **Firebase Auth** (email/mật khẩu). Hồ sơ ở `users/{uid}` |
```

- [ ] **Bước 2: Viết lại gạch đầu dòng đầu của "Vài điểm dễ vấp"**

Thay đoạn "Auth là hệ tự viết, KHÔNG phải Firebase Auth…" bằng:

```markdown
- **Auth là Firebase Auth** (từ 10/09/2026). Trạng thái vẫn ở
  `core/contexts/AppContext.tsx`, lấy ra bằng `useApp()` — hình dạng
  `currentUser` KHÔNG đổi, nên 32 tệp dùng nó không phải sửa gì.
  `AppContext` nghe `onAuthStateChanged` rồi đọc hồ sơ ở `users/{uid}`:
  **id tài liệu = uid của Auth**, vì luật Firestore không truy vấn được, chỉ
  `get()` theo đường dẫn.
  Admin tạo tài khoản hộ thì đi qua `taoAuthPhu()` trong `firebase.ts` —
  `createUserWithEmailAndPassword` đăng nhập luôn bằng tài khoản mới, gọi trên
  app chính là admin bị đá khỏi phiên của chính mình.
  Mật khẩu KHÔNG còn trong Firestore. Không ai đặt hộ mật khẩu ai được nữa,
  chỉ gửi thư đặt lại.
  **Phiên nay sống qua F5** — trước đây `AppContext` cố ý xoá session mỗi lần
  mở trang.
```

- [ ] **Bước 3: Sửa mục "An ninh"**

Trong "Hai lỗ hổng CHƯA vá được", **xoá** gạch đầu dòng về mật khẩu chữ thường
(đã vá). Giữ gạch đầu dòng về việc mọi collection phải cho ghi, và ghi rõ đó là
việc của **đợt 2**.

- [ ] **Bước 4: Cập nhật số mục kiểm**

```bash
npm run kiem-tra
```
Đếm số dòng `OK` rồi sửa con số trong bảng lệnh của `CLAUDE.md` cho khớp.

- [ ] **Bước 5: Chạy đủ hai hàng rào**

```bash
npm run lint
npm run kiem-tra
```
Cả hai phải sạch. `kiem-tra:tai-lieu` sẽ bắt nếu `CLAUDE.md` nhắc tới đường dẫn
hoặc lệnh npm không có thật.

- [ ] **Bước 6: Commit**

```bash
git add CLAUDE.md
git commit -m "CLAUDE.md: Auth nay la Firebase Auth, khong con mat khau chu thuong"
```

---

## Nghiệm thu đợt 1

- [ ] Đăng nhập bằng email + mật khẩu chạy được
- [ ] F5 vẫn giữ phiên
- [ ] Đăng xuất sạch
- [ ] Sai mật khẩu ra câu tiếng Việt, không lộ email có tồn tại hay không
- [ ] Admin tạo tài khoản mà **không mất phiên**
- [ ] Gửi được thư đặt lại mật khẩu
- [ ] `users` không còn tài liệu nào có cột `password`
- [ ] Mọi id tài liệu `users` đều bằng `authUid` (trừ bản ghi rác đã báo user)
- [ ] `npm run lint` sạch
- [ ] `npm run kiem-tra` — cả 10 bộ đạt
- [ ] `CLAUDE.md` khớp với mã

## Ngoài phạm vi (ghi lại để khỏi quên)

- **Siết `firestore.rules` theo vai** — đợt 2. Nhờ việc 2 đã đánh lại khoá,
  luật sẽ dùng được `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role`.
  Và vì `progress`/`chats` trỏ bằng `userEmail`, luật dùng thẳng
  `request.auth.token.email` được.
- **Đăng nhập Google** — hiện chết hẳn. Nối qua `GoogleAuthProvider` của Firebase
  thì không cần `VITE_GOOGLE_CLIENT_ID` (Google đã bật sẵn trong console). Là
  tính năng MỚI, không phải sửa lỗi.
- **Bản ghi rác `admin@system.local`** — `username: admin` nhưng `role: student`,
  không có `authUid`. Hỏi user rồi mới xoá.
- **Bảy tài khoản trông như tài khoản thử** (`hocsinh1/2/3@`, `conva@`, `convb@`,
  `schooladmin@demo.com`, `admin@gmail.com`) — hỏi user xem cái nào bỏ được.

---

# ĐÃ LÀM XONG — 10/09/2026

Cả 8 việc. Commit `535e01f` → `e316655`. Nghiệm thu: đăng nhập chạy sau khi xoá
cột `password`, chủ dự án xác nhận.

## Bốn chỗ kế hoạch SAI hoặc THIẾU

Ghi lại vì đây mới là phần đáng đọc — kế hoạch đúng thì không cần nhớ.

**1. Đếm thiếu quá nửa phạm vi.** Kế hoạch ghi 4 tệp mang mật khẩu; thật ra 7 tệp,
17 chỗ. Phép kiểm ở Việc 1 lộ ra điều đó ngay — đó chính là lý do viết phép kiểm
trước khi sửa mã.

**2. Bỏ sót một lỗ hổng CHỨC NĂNG lớn hơn cả lỗ hổng an ninh.**
`createTeacher` / `createSchoolAdmin` / `createStudent` không tạo tài khoản
Firebase Auth — chúng bịa id rồi ghi thẳng Firestore. Nghĩa là sau Việc 4–6, mọi
tài khoản giáo viên và học sinh tạo ra đều **không đăng nhập được**. Kế hoạch
không nhắc một chữ. Phải thêm hẳn Việc 6b.

**3. Chốt chặn vai trò đặt sai chỗ.** Việc 4 giữ nó trong `firestoreAuth.ts`,
nhưng hàm đó là chỗ DUY NHẤT tạo được cặp "tài khoản Auth + hồ sơ", nên nó chặn
nhầm cả `createSchoolAdmin` hợp lệ. Chuyển ra `FirestoreAccountManager` — hạn chế
thuộc về NGƯỜI GỌI, không thuộc về công cụ.

**4. Regex là hàng rào yếu.** Hàng rào mạnh nhất hoá ra là **bỏ trường `password`
khỏi kiểu `User`**: trình biên dịch chỉ ra đúng 6 chỗ, trong khi regex vừa báo
thừa (6 chỗ truyền vào Firebase Auth là chính đáng) vừa bỏ sót (lối viết tắt
`{ password, }`). Lần sau gặp việc kiểu này: đổi KIỂU trước, đừng viết regex.

## Chức năng mất đi, đã báo chủ dự án

- **"Đặt lại mật khẩu cả lớp"** — trình duyệt không đặt được mật khẩu cho người
  khác. Cần Cloud Function + Admin SDK, tức gói Blaze trả tiền. Nút đó nay chỉ
  xuất CSV danh sách lớp kèm tên đăng nhập.
- **Học sinh dùng `<username>@internal.local`** đăng nhập được nhưng không nhận
  được thư đặt lại mật khẩu.

## Ba lỗi trong chính bộ kiểm tra, tự bắt được

- Hàm bỏ chú thích thay cả khối `/* */` bằng MỘT dấu cách → mọi số dòng phía sau
  lệch, phép kiểm chỉ sai chỗ.
- Luật "cấm `password` làm khoá object ở mọi nơi" báo đỏ cả 6 chỗ hợp lệ. Một
  phép kiểm đỏ vĩnh viễn thì người ta học cách phớt lờ nó.
- Phép kiểm "firestoreAuth có gọi Firebase Auth" dùng `includes()` trên cả tệp,
  nên ba cái tên hàm nằm trong CHÚ THÍCH cũng làm nó xanh.

## Một báo động giả đã không sửa nhầm

App báo `useApp must be used within an AppProvider`. Mở tab mới với bộ đệm console
sạch thì app tải đúng, 0 lỗi — đó là dấu vết Vite HMR hoán mô-đun nóng giữa lúc
sửa nhiều bước. Không có lỗi nào trong mã.

## Dọn dẹp còn treo

- Bản chụp dự phòng chứa mật khẩu chữ thường ở thư mục tạm
  (`giasuhoa11-duphong-*`) — xoá khi chắc chắn không cần lùi nữa.
- Hai hồ sơ mồ côi `admin@system.local` và `superadmin@giasuhoa11.com`: không có
  `authUid`, không đăng nhập được. Chờ chủ dự án quyết.
- **ĐỢT 2**: siết `firestore.rules` theo vai. Làm được rồi nhờ id tài liệu `users`
  đã bằng `uid`.
