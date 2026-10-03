# Kế hoạch thi công — Bộ kiểm luật Firestore bằng emulator

> **Cho người/agent thi công:** KỸ NĂNG BẮT BUỘC — dùng
> `superpowers:subagent-driven-development` (khuyên dùng) hoặc
> `superpowers:executing-plans` để làm từng việc một. Các bước dùng ô đánh dấu
> `- [ ]` để theo dõi.

**Mục tiêu:** Biến 18 phép thử luật đang bấm tay trên Rules Playground thành một
bộ kiểm chạy bằng máy, chạy tự động trên GitHub Actions mỗi lần push.

**Kiến trúc:** Một script `.mts` duy nhất, chạy bằng `tsx`, giống hệt mười bộ
kiểm còn lại của repo — KHÔNG dựng Vitest/Jest. Script tự nhận biết mình đang ở
trong hay ngoài emulator: ở ngoài thì kiểm điều kiện rồi tự gọi lại chính mình
bên trong `firebase emulators:exec`; ở trong thì chạy các phép. Thiếu Java 11+
hoặc thiếu `firebase` thì in `BỎ QUA` và thoát 0.

**Công nghệ:** `@firebase/rules-unit-testing@^5.0.2`, `firebase-tools@^15.30.0`,
`tsx` (đã có), Node 22.

**Đặc tả:** `docs/superpowers/specs/2026-09-13-kiem-luat-firestore-bang-emulator-design.md`

## Ràng buộc toàn cục

- **Máy chủ dự án KHÔNG có JDK 11+** (Java 8, Zulu 8 JRE 32-bit, không cài được
  — đã đo 13/09/2026). Mọi phép nghiệm thu THẬT diễn ra trên CI. Ở máy chỉ kiểm
  được đúng một thứ: đường BỎ QUA có sạch sẽ không.
- **`projectId` phải bắt đầu bằng `demo-`** — Firebase quy ước dự án tên
  `demo-*` không bao giờ chạm tới hạ tầng thật. Dùng `demo-giasuhoa11`.
- **Nạp thẳng `firestore.rules`**, không chép, không diễn giải lại.
- **Không sửa `firestore.rules`.** Phép "tự phá" vá luật TRONG BỘ NHỚ, tệp trên
  đĩa không đổi một ký tự.
- Chú thích và thông báo viết **tiếng Việt**; tên hàm trong `scripts/` viết
  **tiếng Việt không dấu**, theo lối sẵn có của thư mục đó.
- Đừng viết `#rrggbb` hay `var(--x)` vào chú thích — `kiem-tra:mau` quét cả chú
  thích và sẽ báo nhầm.

---

### Việc 1: Phụ thuộc, cấu hình, và đường BỎ QUA

Đây là việc DUY NHẤT nghiệm thu được ngay trên máy chủ dự án, vì máy không có
Java nên nó sẽ đi đúng vào nhánh bỏ qua.

**Tệp:**
- Sửa: `package.json` (devDependencies + scripts)
- Sửa: `firebase.json` (thêm khối `emulators`)
- Tạo: `scripts/kiem-tra-luat.mts` (mới chỉ phần khung + bỏ qua)

**Giao diện:**
- Sinh ra cho việc sau: hàm `chayCacPhep(): Promise<number>` trong cùng tệp —
  trả về số phép hỏng. Việc 2 viết thân hàm này.
- Biến môi trường `H11_TRONG_EMULATOR=1` là dấu hiệu "đang chạy bên trong
  emulator". KHÔNG dựa vào `FIRESTORE_EMULATOR_HOST` do `emulators:exec` tự đặt
  — đặt cờ của mình thì không phụ thuộc hành vi không được ghi trong tài liệu.

- [x] **Bước 1: Cài hai gói**

```bash
npm i -D @firebase/rules-unit-testing@^5.0.2 firebase-tools@^15.30.0
```

- [x] **Bước 2: Thêm khối `emulators` vào `firebase.json`**

Tệp sau khi sửa phải đúng như thế này:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "emulators": {
    "firestore": {
      "port": 8080
    },
    "singleProjectMode": true,
    "ui": {
      "enabled": false
    }
  }
}
```

`ui.enabled: false` vì CI không ai mở giao diện, mà bật thì tốn thêm một cổng.

- [x] **Bước 3: Viết khung `scripts/kiem-tra-luat.mts`**

```ts
/**
 * Kiểm luật Firestore bằng emulator.
 *
 * Chạy:  npm run kiem-tra:luat   (và chạy trong `npm run kiem-tra`)
 *
 * VÌ SAO CÓ TỆP NÀY. Trước đây luật chỉ kiểm được bằng Rules Playground, bấm
 * tay từng phép trên Console. Ngày 13/09/2026 mất nửa buổi vì ô Build document
 * ghi tên trường là `role ` — thừa một dấu cách, thành một trường khác, nên
 * phép thử ra ALLOWED trong khi luật hoàn toàn đúng. Máy không gõ nhầm dấu
 * cách. Và Playground KHÔNG mô phỏng được `list`, nên hai đường quan trọng
 * nhất của khối `users` chưa từng được đo lần nào.
 *
 * THIẾU JAVA 11+ THÌ BỎ QUA, không báo hỏng. Máy chủ dự án chỉ có Java 8 và
 * không cài được bản mới; phép này chạy thật trên GitHub Actions.
 *
 * Script tự gọi lại chính mình: lần đầu chạy ngoài emulator thì kiểm điều kiện
 * rồi spawn `firebase emulators:exec`, lần sau (có cờ H11_TRONG_EMULATOR) thì
 * chạy các phép.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');
const DU_AN = 'demo-giasuhoa11';   // tiền tố `demo-` = không bao giờ chạm hạ tầng thật
const CONG = 8080;

let hong = 0;
export const ok = (dieu: boolean, ten: string, chiTiet = '') => {
  if (!dieu) hong++;
  console.log(`  ${dieu ? 'OK  ' : 'SAI '} ${ten}${chiTiet ? '\n       ' + chiTiet : ''}`);
};

/** Đọc số hiệu chính của Java. `1.8.0_502` -> 8; `21.0.12` -> 21. Không gọi
 *  được `java` thì trả 0. */
function soHieuJava(): number {
  const r = spawnSync('java', ['-version'], { encoding: 'utf8' });
  if (r.error) return 0;
  const chu = `${r.stderr || ''}${r.stdout || ''}`;
  const m = chu.match(/version "(\d+)(?:\.(\d+))?/);
  if (!m) return 0;
  return m[1] === '1' ? Number(m[2] ?? 0) : Number(m[1]);
}

/** Gọi được `firebase` không. Dùng bản trong node_modules, không phụ thuộc máy. */
function coFirebase(): boolean {
  const r = spawnSync('npx', ['--no-install', 'firebase', '--version'], {
    encoding: 'utf8', shell: process.platform === 'win32',
  });
  return !r.error && r.status === 0;
}

async function main() {
  console.log('== Luật Firestore ==');

  if (process.env.H11_TRONG_EMULATOR !== '1') {
    const java = soHieuJava();
    if (java < 11) {
      console.log(`  BỎ QUA  emulator cần Java 11+, máy này có ${java || 'không có Java'}`);
      console.log('          (phép này chạy thật trên GitHub Actions)');
      process.exit(0);
    }
    if (!coFirebase()) {
      console.log('  BỎ QUA  chưa cài firebase-tools — chạy `npm ci` rồi thử lại');
      process.exit(0);
    }

    const con = spawnSync('npx', [
      'firebase', 'emulators:exec', '--only', 'firestore', '--project', DU_AN,
      'npx tsx scripts/kiem-tra-luat.mts',
    ], {
      cwd: GOC,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, H11_TRONG_EMULATOR: '1' },
    });
    process.exit(con.status ?? 1);
  }

  hong += await chayCacPhep();

  if (hong === 0) { console.log('\n>>> TẤT CẢ ĐẠT'); process.exit(0); }
  console.log(`\n>>> CÓ ${hong} MỤC KHÔNG ĐẠT`);
  process.exit(1);
}

/** Việc 2 viết thân hàm này. Trả về số phép hỏng. */
async function chayCacPhep(): Promise<number> {
  console.log('  (chưa có phép nào — xem Việc 2 của kế hoạch)');
  return 0;
}

export const docLuat = () => readFileSync(join(GOC, 'firestore.rules'), 'utf8');
export const CAU_HINH = { DU_AN, CONG };

main();
```

- [x] **Bước 4: Thêm hai dòng vào `package.json`**

Trong `scripts`, thêm:

```json
"kiem-tra:luat": "tsx scripts/kiem-tra-luat.mts"
```

và nối vào cuối chuỗi `kiem-tra` (sau `kiem-tra:an-ninh`):

```
&& npm run kiem-tra:luat
```

- [x] **Bước 5: Chạy để xác nhận đường BỎ QUA sạch**

```bash
npm run kiem-tra:luat
```

Phải in đúng:

```
== Luật Firestore ==
  BỎ QUA  emulator cần Java 11+, máy này có 8
          (phép này chạy thật trên GitHub Actions)
```

và **thoát với mã 0**. Kiểm mã thoát:

```bash
npm run kiem-tra:luat; echo "ma thoat = $?"
```

Phải thấy `ma thoat = 0`.

- [x] **Bước 6: Chạy cả bộ, xác nhận không làm đỏ gì**

```bash
npm run kiem-tra
```

Phải vẫn `TẤT CẢ ĐẠT` như trước, cộng thêm dòng BỎ QUA mới.

- [x] **Bước 7: Commit**

```bash
git add package.json package-lock.json firebase.json scripts/kiem-tra-luat.mts
git commit -m "Viec 1: khung bo kiem luat va duong BO QUA khi thieu Java"
```

---

### Việc 2: Mười tám phép

**Tệp:**
- Sửa: `scripts/kiem-tra-luat.mts` — thay thân `chayCacPhep()`

**Giao diện:**
- Dùng của Việc 1: `ok()`, `docLuat()`, `CAU_HINH`
- Không sinh ra gì cho việc sau ngoài một `chayCacPhep()` đầy đủ

**KHÔNG chạy được trên máy chủ dự án.** Viết xong thì đi tiếp; Việc 3 nghiệm thu
trên CI.

- [x] **Bước 1: Thêm phần nhập khẩu vào đầu tệp**

```ts
import {
  initializeTestEnvironment, assertSucceeds, assertFails,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs,
} from 'firebase/firestore';
```

- [x] **Bước 2: Viết hàm gieo dữ liệu nền**

Đặt ngay trên `chayCacPhep()`:

```ts
/* Sáu nhân vật. Mỗi người phải có hồ sơ THẬT trong `users`, vì luật đọc vai
   bằng get(users/{uid}) — không có hồ sơ thì laGiaoVien() luôn sai và phép
   thử đạt vì lý do sai. */
const NGUOI = {
  chu:   { uid: 'uid_chu',    email: 'ktranquang713@gmail.com', role: 'admin'   },
  dong:  { uid: 'uid_dong',   email: 'lthaa.th@gmail.com',      role: 'teacher' },
  gv:    { uid: 'uid_gv',     email: 'gv@truong.local',         role: 'teacher' },
  hs:    { uid: 'uid_hs',     email: 'hs@truong.local',         role: 'student' },
  hs2:   { uid: 'uid_hs2',    email: 'hs2@truong.local',        role: 'student' },
  admin2:{ uid: 'uid_admin2', email: 'admin2@truong.local',     role: 'admin'   },
};

async function gieo(moi: RulesTestEnvironment) {
  await moi.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    for (const n of Object.values(NGUOI)) {
      await setDoc(doc(db, 'users', n.uid), {
        email: n.email, username: n.email, name: n.uid,
        role: n.role, status: 'active',
      });
    }
    await setDoc(doc(db, 'quan_tri', 'dong_quan_tri'), {
      emails: [NGUOI.dong.email],
    });
    await setDoc(doc(db, 'bank_questions', 'cau_1'), { q: 'Fe + HCl ?' });
    await setDoc(doc(db, 'classes', 'lop_1'), { name: '11H', inviteCode: '11H01' });
    await setDoc(doc(db, 'progress', NGUOI.hs.email), { diem: 8 });
    await setDoc(doc(db, 'chats', 'chat_1'), { userEmail: NGUOI.hs.email, noiDung: 'chao' });
  });
}

/** Tư cách đã đăng nhập, có email trong token — luật dùng
 *  `request.auth.token.email` nên KHÔNG được quên tham số thứ hai. */
const nhu = (moi: RulesTestEnvironment, n: { uid: string; email: string }) =>
  moi.authenticatedContext(n.uid, { email: n.email }).firestore();
```

- [x] **Bước 3: Viết thân `chayCacPhep()`**

Thay toàn bộ hàm tạm của Việc 1 bằng:

```ts
async function chayCacPhep(): Promise<number> {
  let sai = 0;
  const dem = (dieu: boolean, ten: string, chiTiet = '') => {
    if (!dieu) sai++;
    console.log(`  ${dieu ? 'OK  ' : 'SAI '} ${ten}${chiTiet ? '\n       ' + chiTiet : ''}`);
  };
  const duoc = async (p: Promise<unknown>, ten: string) => {
    try { await assertSucceeds(p); dem(true, ten); }
    catch (e) { dem(false, ten, 'lẽ ra ĐƯỢC nhưng bị chặn: ' + (e as Error).message); }
  };
  const chan = async (p: Promise<unknown>, ten: string) => {
    try { await assertFails(p); dem(true, ten); }
    catch { dem(false, ten, 'lẽ ra BỊ CHẶN nhưng lại cho qua'); }
  };

  const moi = await initializeTestEnvironment({
    projectId: CAU_HINH.DU_AN,
    firestore: { rules: docLuat(), host: '127.0.0.1', port: CAU_HINH.CONG },
  });
  await moi.clearFirestore();
  await gieo(moi);

  const chu = nhu(moi, NGUOI.chu);
  const dong = nhu(moi, NGUOI.dong);
  const gv = nhu(moi, NGUOI.gv);
  const hs = nhu(moi, NGUOI.hs);
  const khach = moi.unauthenticatedContext().firestore();

  // 1-2: đường đăng nhập
  await duoc(getDoc(doc(hs, 'users', NGUOI.hs.uid)), '1. học sinh đọc hồ sơ CỦA CHÍNH MÌNH');
  await chan(getDoc(doc(hs, 'users', NGUOI.hs2.uid)), '2. học sinh đọc hồ sơ người khác');

  // 3-4: `list` — hai đường Playground không mô phỏng được
  await chan(getDocs(collection(hs, 'users')), '3. học sinh liệt kê toàn bộ users');
  await duoc(getDocs(collection(gv, 'users')), '4. giáo viên liệt kê toàn bộ users');

  // 5-8: sáu cửa hậu trên hồ sơ của chính mình
  await duoc(updateDoc(doc(hs, 'users', NGUOI.hs.uid), { name: 'Tên mới' }),
    '5. học sinh sửa `name` của mình');
  await chan(updateDoc(doc(hs, 'users', NGUOI.hs.uid), { role: 'teacher' }),
    '6. học sinh tự nâng vai');
  await chan(updateDoc(doc(hs, 'users', NGUOI.hs.uid), { classId: 'lop_1' }),
    '7a. học sinh tự đặt `classId`');
  await chan(updateDoc(doc(hs, 'users', NGUOI.hs.uid), { schoolId: 'truong_1' }),
    '7b. học sinh tự đặt `schoolId`');
  await chan(updateDoc(doc(hs, 'users', NGUOI.hs.uid), { joinedClassId: 'lop_1' }),
    '7c. học sinh tự đặt `joinedClassId`');
  await chan(updateDoc(doc(hs, 'users', NGUOI.hs.uid), { username: 'khac' }),
    '8a. học sinh tự đổi `username`');
  await chan(updateDoc(doc(hs, 'users', NGUOI.hs.uid), { email: 'khac@x.local' }),
    '8b. học sinh tự đổi `email`');

  // 9-13: ai được đặt vai
  await duoc(updateDoc(doc(chu, 'users', NGUOI.hs2.uid), { role: 'teacher' }),
    '9. chủ dự án đặt vai giáo viên');
  await chan(updateDoc(doc(gv, 'users', NGUOI.hs.uid), { role: 'teacher' }),
    '10. giáo viên thường đặt vai');
  await duoc(updateDoc(doc(dong, 'users', NGUOI.hs.uid), { role: 'teacher' }),
    '11. đồng quản trị đặt vai giáo viên');
  await chan(updateDoc(doc(dong, 'users', NGUOI.hs.uid), { role: 'admin' }),
    '12. đồng quản trị phong quản trị hệ thống');
  await chan(updateDoc(doc(dong, 'users', NGUOI.admin2.uid), { role: 'teacher' }),
    '13. đồng quản trị hạ vai một quản trị');

  // 14: xoá hồ sơ
  await chan(deleteDoc(doc(gv, 'users', NGUOI.hs.uid)), '14. giáo viên xoá hồ sơ');

  // 15-16: khách chưa đăng nhập
  await duoc(getDoc(doc(khach, 'bank_questions', 'cau_1')),
    '15. khách đọc `bank_questions` (đồng bộ đêm sống nhờ điều này)');
  await chan(getDocs(collection(khach, 'users')), '16a. khách liệt kê `users`');
  await chan(getDocs(collection(khach, 'classes')), '16b. khách liệt kê `classes`');
  await chan(getDoc(doc(khach, 'progress', NGUOI.hs.email)), '16c. khách đọc `progress`');
  await chan(getDoc(doc(khach, 'chats', 'chat_1')), '16d. khách đọc `chats`');

  // 17: bộ lọc XSS ngay lúc GHI. Có phép đối chứng câu sạch, để phép bẩn
  //     không đạt vì một lý do khác.
  await duoc(setDoc(doc(gv, 'bank_questions', 'cau_sach'), { q: 'H2SO4 đặc nóng?' }),
    '17a. giáo viên ghi câu hỏi sạch');
  await chan(setDoc(doc(gv, 'bank_questions', 'cau_ban'),
    { q: 'xin chào <script>alert(1)</script>' }),
    '17b. giáo viên ghi câu hỏi chứa thẻ script');

  // 18: cái bẫy affectedKeys — `deleteClass` ghi role: 'student' đè lên hồ sơ
  //     vốn đã là student. Giá trị không đổi nên `role` KHÔNG nằm trong
  //     affectedKeys(), và giáo viên vẫn phải xoá được lớp.
  await duoc(updateDoc(doc(gv, 'users', NGUOI.hs.uid), { role: 'student', classId: null }),
    '18. giáo viên ghi `role: student` đè lên hồ sơ vốn đã student');

  await moi.cleanup();
  return sai;
}
```

- [x] **Bước 4: Kiểm kiểu**

```bash
npm run lint
```

Phải xanh. Đây là thứ DUY NHẤT kiểm được ở máy cho việc này.

- [x] **Bước 5: Commit**

```bash
git add scripts/kiem-tra-luat.mts
git commit -m "Viec 2: 18 phep thu luat, gom ca hai duong `list` chua tung do duoc"
```

---

### Việc 3: Phép tự phá, workflow CI, và tài liệu

**Tệp:**
- Sửa: `scripts/kiem-tra-luat.mts` — thêm phép tự phá
- Tạo: `.github/workflows/kiem-luat.yml`
- Sửa: `CLAUDE.md` — mục "Lệnh" và mục "An ninh"
- Sửa: `.claude/nhac-moi-luot.md` — một dòng

**Giao diện:** không sinh ra gì cho việc sau.

- [x] **Bước 1: Thêm phép tự phá vào cuối `chayCacPhep()`**

Đặt ngay trước `await moi.cleanup();`:

```ts
  /* PHÉP TỰ PHÁ. Một bộ kiểm luôn xanh mà chưa bao giờ bắt được gì thì đáng
     ngờ hơn đáng mừng — bài học đã trả giá một lần, xem "Rút kinh nghiệm"
     trong CLAUDE.md. Ở đây ta vá luật TRONG BỘ NHỚ cho `allow delete` mở
     toang, rồi đòi phép 14 phải đổi kết quả. Không đổi nghĩa là bộ kiểm này
     không thực sự đọc luật, và mọi dòng OK phía trên đều vô nghĩa.
     Tệp `firestore.rules` trên đĩa KHÔNG bị đụng tới. */
  const luatPha = docLuat().replace(
    'allow delete: if laChuDuAn();',
    'allow delete: if true;',
  );
  if (luatPha === docLuat()) {
    dem(false, '19. phép tự phá',
      'không tìm thấy dòng `allow delete: if laChuDuAn();` để vá — luật đã đổi, sửa lại phép này');
  } else {
    const moiPha = await initializeTestEnvironment({
      projectId: CAU_HINH.DU_AN + '-pha',
      firestore: { rules: luatPha, host: '127.0.0.1', port: CAU_HINH.CONG },
    });
    await gieo(moiPha);
    const gvPha = nhu(moiPha, NGUOI.gv);
    let choQua = false;
    try { await assertSucceeds(deleteDoc(doc(gvPha, 'users', NGUOI.hs2.uid))); choQua = true; }
    catch { choQua = false; }
    dem(choQua, '19. phép tự phá — nới `allow delete` thì phép 14 phải đổi kết quả',
      choQua ? '' : 'nới luật mà kết quả không đổi: bộ kiểm này KHÔNG đọc luật thật');
    await moiPha.cleanup();
  }
```

- [x] **Bước 2: Tạo `.github/workflows/kiem-luat.yml`**

```yaml
# Chạy bộ kiểm luật Firestore trên emulator.
#
# VÌ SAO CHẠY Ở ĐÂY MÀ KHÔNG CHẠY Ở MÁY. Emulator đòi JDK 11+; máy chủ dự án
# chỉ có Java 8 (Zulu 8 JRE của công ty) và không cài được bản mới. Máy chạy
# của GitHub có sẵn Java. Ở máy chủ dự án, `npm run kiem-tra` tự BỎ QUA phép
# luật, nên không ai bị chặn việc.
#
# Job này KHÔNG chạm tới Firebase thật: emulator chạy cục bộ với projectId
# `demo-giasuhoa11`, và tiền tố `demo-` là quy ước Firebase cho dự án không bao
# giờ nối ra ngoài.
#
# CI xanh CHỈ chứng minh tệp `firestore.rules` trong git là đúng. Nó KHÔNG
# chứng minh luật đang chạy trên Firebase là đúng — chủ dự án vẫn phải dán tệp
# lên Console và bấm Publish bằng tay.

name: Kiểm luật Firestore

on:
  push:
    paths:
      - 'firestore.rules'
      - 'scripts/kiem-tra-luat.mts'
      - 'firebase.json'
      - 'package.json'
      - 'package-lock.json'
      - '.github/workflows/kiem-luat.yml'
  workflow_dispatch:

jobs:
  kiem-luat:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm

      # Khai rõ bản Java thay vì trông vào bản có sẵn của máy chạy: bản có sẵn
      # đổi theo thời gian, mà emulator đòi tối thiểu 11.
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'

      - run: npm ci

      - name: Chạy 19 phép thử luật
        run: npm run kiem-tra:luat
```

- [x] **Bước 3: Ghi vào `CLAUDE.md`, mục "Lệnh"**

Trong bảng các bộ kiểm chạy riêng, thêm `kiem-tra:luat` vào danh sách, với mô tả:

```
`kiem-tra:luat` (19 phép thử luật Firestore trên emulator; cần Java 11+ nên
máy nào thiếu thì tự bỏ qua — phép này chạy thật trên GitHub Actions, xem
`.github/workflows/kiem-luat.yml`)
```

Và sửa con số: `npm run kiem-tra` nay chạy **12** bộ kiểm, không phải 11.

- [x] **Bước 4: Ghi vào `CLAUDE.md`, mục "An ninh"**

Thêm ngay dưới đoạn "Sửa luật xong là CHƯA có tác dụng gì":

```
Từ 13/09/2026 có `npm run kiem-tra:luat` — 19 phép chạy trên emulator, đọc
thẳng `firestore.rules`. Nó bắt được thứ Playground không bắt được: `list`, và
lỗi gõ nhầm tên trường. Nhưng nó CHỈ chứng minh tệp trong git đúng; luật đang
chạy trên Firebase thì vẫn phải đo bằng REST sau khi publish. Hai việc khác
nhau.
```

- [x] **Bước 5: Thêm một dòng vào `.claude/nhac-moi-luot.md`**

Trong khối "LICH SU CAC DOT...", thêm:

```
  Sua `firestore.rules` xong: chay `npm run kiem-tra:luat` (may nay se BO QUA
  vi thieu Java — xem ket qua that o tab Actions sau khi push).
```

- [x] **Bước 6: Kiểm ở máy**

```bash
npm run lint && npm run kiem-tra
```

Cả hai phải xanh, và phép luật phải in `BỎ QUA`.

- [x] **Bước 7: Commit**

```bash
git add scripts/kiem-tra-luat.mts .github/workflows/kiem-luat.yml CLAUDE.md .claude/nhac-moi-luot.md
git commit -m "Viec 3: phep tu pha, workflow CI, va tai lieu"
```

- [x] **Bước 8: Chủ dự án push và xem CI**

Đây là phép nghiệm thu THẬT. Người thi công KHÔNG push — chủ dự án push.

```bash
git push origin main
```

Rồi mở tab **Actions** của repo, xem job "Kiểm luật Firestore".

Phải thấy **19 dòng OK** và `>>> TẤT CẢ ĐẠT`. Job xanh.

Nếu job đỏ: đọc phép nào SAI. Xác định **bên nào sai** trước khi gõ dòng nào —
luật sai, hay phép thử sai? Ngày 13/09/2026 đã mất nửa buổi vì đoán nhầm chiều
đó đúng bốn lần.

---

## Tự soát

**Phủ đặc tả.** 18 phép của đặc tả đều có trong Việc 2, đánh số khớp. Phép 7 và
8 tách thành 7a/7b/7c và 8a/8b vì mỗi trường là một đường riêng — gộp lại thì
một trường lọt mà phép vẫn đạt. Phép 16 tách bốn. Phép 17 thêm một phép đối
chứng câu sạch, để phép bẩn không đạt vì lý do khác. Phép 19 (tự phá) là phần
"Nghiệm thu" của đặc tả, nay thành phép chạy mỗi lần chứ không phải nghi thức
làm một lần.

**Chỗ trống.** Không có "TBD", không có "tương tự việc N", mọi bước có mã đều
có mã thật.

**Khớp tên.** `ok()` khai ở Việc 1 nhưng Việc 2 dùng `dem()` cục bộ trong
`chayCacPhep()` — cố ý, để đếm riêng rồi cộng vào. `docLuat()`, `CAU_HINH`,
`NGUOI`, `gieo()`, `nhu()` dùng đúng tên đã khai. `chayCacPhep(): Promise<number>`
giữ nguyên chữ ký qua cả ba việc.

**Điều chưa chắc, phải đo khi chạy.** Hai chỗ:

1. `emulators:exec` nhận chuỗi lệnh `npx tsx scripts/kiem-tra-luat.mts`. Nếu
   trên CI nó không truyền được cờ `H11_TRONG_EMULATOR` xuống tiến trình con
   thì script sẽ tự gọi lại vô hạn. Việc 3 bước 8 sẽ lộ ra ngay (job treo hoặc
   lặp). Cách chữa nếu gặp: đổi sang hai tệp, một tệp bọc và một tệp thân.
2. `assertFails` của `getDocs` trên collection bị chặn — cần chắc nó ném lỗi
   `permission-denied` chứ không trả mảng rỗng. Nếu phép 3 hoặc 16a "đạt" một
   cách đáng ngờ thì phải soi lại.
