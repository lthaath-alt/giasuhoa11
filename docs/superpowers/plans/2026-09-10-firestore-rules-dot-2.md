# Siết `firestore.rules` theo vai trò — Đợt 2

> **Cho người thực thi (kể cả AI):** Dùng kỹ năng `superpowers:executing-plans`
> để làm từng việc một. Các bước dùng ô đánh dấu `- [ ]`.

**Mục tiêu:** Chỉ người có vai phù hợp mới ghi được dữ liệu, và dữ liệu cá nhân
của học sinh không còn đọc được từ Internet nếu chưa đăng nhập.

**Cách làm:** Luật chia collection làm hai nhóm — nội dung học (đọc công khai,
ghi theo vai) và dữ liệu người (phải đăng nhập). Quyền sở hữu kiểm bằng
`request.auth.token.email` để không tốn lượt đọc; `get()` chỉ dùng ở đường ghi
hiếm. Phía app, `users` và `classes` dời xuống tải sau khi đăng nhập.

**Công nghệ:** Firestore Security Rules (cú pháp CEL), React 19 + TypeScript.
Không thêm gói nào.

**Đặc tả:** `docs/superpowers/specs/2026-09-10-firestore-rules-dot-2-design.md`

## Ràng buộc toàn cục

- **`bank_questions` PHẢI giữ `allow read: if true`.** Workflow đồng bộ đêm đọc
  Firestore không đăng nhập. Siết là đồng bộ chết.
- **Gói Spark ($0)** — không Cloud Functions, không custom claims.
- **Mỗi `get()` trong luật là một lượt đọc có tính tiền.** KHÔNG dùng `get()`
  trong luật của `progress` và `chats` — đó là hai chỗ ghi nhiều nhất.
- Bốn vai: `'admin' | 'school_admin' | 'teacher' | 'student'`.
- Trả lời và chú thích bằng tiếng Việt; giữ tiếng Anh cho tên biến/hàm/lệnh.
- **KHÔNG tự chạy `npm run build`, git nguy hiểm, push hay deploy** — user tự làm.
- Sau mỗi việc: `npm run lint` phải sạch.
- Dự án **không có bộ chạy test**. "Viết test trước" ở đây là **viết phép kiểm
  trước**, thêm vào `scripts/kiem-tra-*.mts`.
- **Đừng tin dòng "xong" của script tự viết** — `grep` lại chuỗi vừa đặt vào.

## Bản đồ tệp

| Tệp | Trách nhiệm sau đợt này |
|---|---|
| `scripts/kiem-tra-an-ninh.mts` | Sửa: thêm 3 phép kiểm canh luật không lỏng trở lại |
| `src/core/contexts/AppContext.tsx` | Sửa: tách việc tải dữ liệu làm hai tầng |
| `firestore.rules` | Viết lại phần phân quyền; giữ nguyên phần kiểm nội dung câu hỏi |
| `CLAUDE.md` | Sửa: mục An ninh |

**KHÔNG sửa:** `firestoreService.ts` (truy vấn đã đúng dạng luật cần),
`bankStore.ts`, mọi component.

## Thứ tự bắt buộc — không được đảo

```
1  phép kiểm tĩnh (đỏ ngay)
2  AppContext hai tầng
3  build + DEPLOY + xác nhận bản mới đã chạy      ← CỔNG, user làm
4  viết luật mới vào firestore.rules (chưa publish)
5  Rules Playground rồi mới Publish                ← CỔNG, khó lùi
6  thử tay ba vai + tài liệu
```

Đảo bước 3 và 5 thì bản đang chạy trên Netlify vẫn tải `users` lúc mở trang,
luật mới chặn, **mọi người thấy trang trắng**.

---

### Việc 1: Phép kiểm canh luật không lỏng trở lại

**Tệp:**
- Sửa: `scripts/kiem-tra-an-ninh.mts`

**Giao diện:**
- Dùng: các hàm sẵn có trong tệp — `dat()`, `truot()`, `doc()`, `ten()`,
  `tepNguon`, `GOC`, `join`, `existsSync`
- Cho việc sau: không có

- [ ] **Bước 1: Viết phép kiểm (nó PHẢI đỏ ngay bây giờ)**

Chèn vào `scripts/kiem-tra-an-ninh.mts`, ngay TRƯỚC dòng
`console.log('\n== Không lộ bí mật trong mã nguồn ==');`:

```typescript
console.log('\n== Luật Firestore phân quyền theo vai ==');
{
  /* Ba phép kiểm canh cho đợt 2 không bị lùi lại. Luật lỏng không làm app vỡ —
     nó chỉ lặng lẽ cho phép mọi thứ, nên phải có phép kiểm nhìn thay. */
  const R = join(GOC, 'firestore.rules');
  const luat = existsSync(R)
    ? doc(R).split(/\r?\n/).filter(d => !d.trimStart().startsWith('//')).join('\n')
    : '';

  /* 1. Không còn cửa mở toang. */
  const moToang = [...luat.matchAll(/allow[^:]*:\s*if\s+true\s*;/g)].length;
  const doc_ = [...luat.matchAll(/allow\s+read\s*:\s*if\s+true\s*;/g)].length;
  const ghiToang = moToang - doc_;
  if (!existsSync(R)) truot('có firestore.rules', 'thiếu tệp');
  else if (ghiToang > 0) truot('không còn `allow write: if true`', `${ghiToang} chỗ vẫn cho ghi tự do`);
  else dat('không còn `allow write: if true`');

  /* 2. Mọi collection mã nguồn có GHI đều phải có mục `match`.
        Thêm collection mới mà quên viết luật thì nó rơi vào mục cấm tất ở cuối
        và hỏng im lặng — phép kiểm này bắt trước khi chuyện đó xảy ra. */
  const hang: Record<string, string> = {};
  for (const f of tepNguon) {
    for (const m of doc(f).matchAll(/\b(COL_[A-Z_]+)\s*=\s*['"]([^'"]+)['"]/g)) hang[m[1]] = m[2];
  }
  const dungToi = new Set<string>(Object.values(hang));
  for (const f of tepNguon) {
    for (const m of doc(f).matchAll(/collection\(\s*db\s*,\s*['"]([^'"]+)['"]/g)) dungToi.add(m[1]);
  }
  const thieuLuat = [...dungToi].filter(c => !new RegExp(`match\\s+/${c}/`).test(luat));
  if (thieuLuat.length) truot('mọi collection đều có luật riêng', 'thiếu: ' + thieuLuat.join(', '));
  else dat(`cả ${dungToi.size} collection đều có luật riêng`);

  /* 3. Tên trường luật dùng để kiểm sở hữu phải THẬT SỰ tồn tại trong mã.
        Đây đúng là cái bẫy đã sập ở đợt 1: luật nhắm `content`/`explanation`/
        `options` trong khi Firestore lưu `q`/`e`/`o`, nên mệnh đề
        `!('content' in d) || …` luôn đúng và luật cho qua mọi tải trọng. */
  const truongSoHuu = ['userEmail', 'teacherEmail', 'studentIdentifiers'];
  const dungTrongLuat = truongSoHuu.filter(t => luat.includes(t));
  const khongCoThat = dungTrongLuat.filter(t => !tepNguon.some(f => doc(f).includes(t)));
  if (!dungTrongLuat.length) truot('luật kiểm sở hữu bằng tên trường thật', 'luật không nhắc trường sở hữu nào — chưa siết?');
  else if (khongCoThat.length) truot('luật kiểm sở hữu bằng tên trường thật', 'không có trong mã: ' + khongCoThat.join(', '));
  else dat(`luật dùng ${dungTrongLuat.length} tên trường có thật trong mã`);
}

console.log('\n== Không lộ bí mật trong mã nguồn ==');
```

- [ ] **Bước 2: Chạy để xác nhận nó ĐỎ**

```bash
npm run kiem-tra:an-ninh
```

Trông đợi **2 dòng `SAI`**:
```
SAI  không còn `allow write: if true`        (10 chỗ vẫn cho ghi tự do)
SAI  luật kiểm sở hữu bằng tên trường thật   (luật không nhắc trường sở hữu nào)
```

Mục "mọi collection đều có luật riêng" ĐẠT ngay, vì luật hiện tại đã liệt kê đủ
12 collection. Đó là đúng — nó canh việc khác.

Nếu mục 1 ra ĐẠT ngay bây giờ thì phép kiểm **viết sai**: luật hiện tại có 10
dòng `allow read, write: if true`. Sửa phép kiểm rồi chạy lại, đừng đi tiếp.

- [ ] **Bước 3: Commit**

```bash
git add scripts/kiem-tra-an-ninh.mts
git commit -m "Viec 1/6: phep kiem canh luat Firestore phan quyen (dang DO)"
```

---

### Việc 2: `AppContext` — tách việc tải dữ liệu làm hai tầng

**Tệp:**
- Sửa: `src/core/contexts/AppContext.tsx`

**Giao diện:**
- Dùng: `FirestoreService.getUsers()`, `FirestoreService.getClasses()`,
  `chuanHoaVaiTro()`, `setUsers()`, `setClasses()` — đều đã có
- Cho việc sau: sau việc này, app KHÔNG đọc `users` và `classes` khi chưa đăng nhập

**Vì sao an toàn:** đã kiểm ngày 10/09/2026 — `users` chỉ được dùng ở
`AdminPage`, `SchoolAdminPage`, `TeacherPage`, `ErrorManagement`,
`SchoolDialogs`; `classes` chỉ ở `StudentArea`, `AdminPage`, `SchoolAdminPage`.
Trang công khai `DashboardPage` không đụng tới cả hai.

- [ ] **Bước 1: Bỏ `getUsers` và `getClasses` khỏi `init()`**

Trong `useEffect` khởi tạo (khoảng dòng 317–380), sửa khối `Promise.all`. Xoá
`allUsers` và `allClasses` khỏi danh sách nhận, và xoá hai lời gọi tương ứng:

```typescript
      const [
        allSchools,
        allQuestions,
        allExams,
        allEqs,
        allMatrix,
        curriculumOverrides,
        settings,
      ] = await Promise.all([
        FirestoreService.getSchools(),
        FirestoreService.getQuestions(),
        FirestoreService.getExams(),
        FirestoreService.getEquations(),
        FirestoreService.getMatrixResources(),
        FirestoreService.getCurriculumOverrides(),
        FirestoreService.getSystemSettings(),
      ]);
```

- [ ] **Bước 2: Xoá phần chuẩn hoá vai trò và hai lời `set` tương ứng**

Xoá nguyên khối `const migratedUsers = allUsers.map(...)` (khoảng dòng 346–353),
và xoá hai dòng `setUsers(migratedUsers);` và `setClasses(allClasses);` khỏi
mục "4. Cập nhật state".

Thay chú thích của mục đó thành:

```typescript
      /* 3. Cập nhật state — CHỈ nội dung học.
            `users` và `classes` KHÔNG tải ở đây nữa: từ đợt 2, luật Firestore
            đòi đăng nhập mới đọc được hai collection đó (chúng mang họ tên,
            email học sinh). Chúng được tải trong useEffect nghe
            onAuthStateChanged bên dưới.
            Đã kiểm: trang công khai DashboardPage không dùng cả hai. */
      setSchools(allSchools);
      setLibraryQuestions(allQuestions);
      setExams(allExams);
      setEquations(allEqs);
      setMatrixResources(allMatrix);
      setSystemSettings(settings);
```

- [ ] **Bước 3: Tải `users` + `classes` trong effect nghe Auth**

Trong `useEffect` có `onAuthStateChanged` (khoảng dòng 398–434), ngay SAU khối
`if (!nguoiAuth) { … return; }` và TRƯỚC dòng `const anh = await getDoc(...)`,
chèn:

```typescript
      /* Đã đăng nhập → nay mới đọc được hai collection mang dữ liệu người.
         Tải trước khi dựng hồ sơ, để màn quản trị mở ra là có sẵn dữ liệu. */
      const [dsNguoiDung, dsLop] = await Promise.all([
        FirestoreService.getUsers(),
        FirestoreService.getClasses(),
      ]);
      setUsers(dsNguoiDung.map(u => {
        const chuan = chuanHoaVaiTro(u.role as string);
        return chuan === u.role ? u : { ...u, role: chuan };
      }));
      setClasses(dsLop);
```

- [ ] **Bước 4: Dọn `users` và `classes` khi đăng xuất**

Trong cùng effect đó, bên trong `if (!nguoiAuth) { … }`, thêm hai dòng trước
`return;`:

```typescript
        setUsers([]);
        setClasses([]);
```

Không dọn thì sau khi đăng xuất, danh sách học sinh vẫn nằm trong bộ nhớ trình
duyệt của máy đó.

- [ ] **Bước 5: Kiểm biên dịch**

```bash
npm run lint
```
Trông đợi: 0 lỗi. Có lỗi "allUsers is not defined" nghĩa là còn sót chỗ dùng —
xoá nốt.

- [ ] **Bước 6: Grep lại xác nhận**

```bash
grep -n "getUsers()\|getClasses()" src/core/contexts/AppContext.tsx
```
Trông đợi: cả hai chỉ xuất hiện MỘT lần, và nằm trong effect `onAuthStateChanged`.

- [ ] **Bước 7: Thử tay trên `npm run dev`**

| Thử | Phải ra |
|---|---|
| Mở trang khi CHƯA đăng nhập | Trang chào hiện đủ, không lỗi console |
| Đăng nhập bằng tài khoản admin | Vào khu quản trị, **danh sách người dùng có dữ liệu** |
| Đăng xuất | Về màn đăng nhập |

Mục giữa là quan trọng nhất — nó chứng minh việc tải sau đăng nhập chạy đúng.

- [ ] **Bước 8: Commit**

```bash
git add src/core/contexts/AppContext.tsx
git commit -m "Viec 2/6: tai users va classes sau khi dang nhap, khong tai luc mo trang"
```

---

### Việc 3: ⚠ CỔNG — build, deploy, xác nhận

**KHÔNG được làm việc 4 trước khi việc này xong.**

- [ ] **Bước 1: Dựng gói** (user yêu cầu thì mới chạy)

```bash
npm run build
```

- [ ] **Bước 2: Kiểm gói có đúng mã mới không**

```bash
grep -c "getUsers" dist/assets/*.js
```

Tên hàm bị rút gọn nên số này không nói lên nhiều. Cách tin được hơn: đối chiếu
một chuỗi tiếng Việt mới thêm ở việc 2 — trình rút gọn giữ nguyên chuỗi.

- [ ] **Bước 3: User deploy `dist/` lên Netlify**

Kéo thả thư mục `dist` vào khung **Production deploys**.

- [ ] **Bước 4: XÁC NHẬN bản mới đã chạy trên site thật**

Mở site, `Ctrl+Shift+R`, rồi:
- Mở trang khi chưa đăng nhập → hiện bình thường
- Đăng nhập → vào được, khu quản trị có dữ liệu

**Chỉ khi cả hai đúng mới đi tiếp.** Chưa chắc thì dừng lại hỏi user.

---

### Việc 4: Viết luật mới vào `firestore.rules`

**Tệp:**
- Sửa: `firestore.rules` (thay phần từ dòng `service cloud.firestore {` trở đi;
  giữ nguyên khối chú thích đầu tệp và bốn hàm `sach`, `phuongAnSach`, `ySach`,
  `cauHoiSach`)

**Giao diện:**
- Cho việc sau: luật này được dán vào Firebase Console ở việc 5

- [ ] **Bước 1: Thêm bốn hàm trợ giúp**

Chèn ngay SAU dòng `match /databases/{database}/documents {` và TRƯỚC hàm
`sach(s)`:

```
    // ── Danh tính và vai trò ────────────────────────────────────────────────

    function dangNhap() {
      return request.auth != null;
    }

    /* Email nằm sẵn trong token, đọc nó KHÔNG tốn lượt đọc nào. Đây là lý do
       mọi phép kiểm quyền sở hữu bên dưới đều dùng email chứ không dùng uid. */
    function email() {
      return request.auth.token.email;
    }

    /* NGƯỢC LẠI: mỗi lần gọi get() là MỘT LƯỢT ĐỌC CÓ TÍNH TIỀN. Gói Spark cho
       50.000 lượt/ngày. Vì thế hàm này chỉ được dùng ở những đường ghi HIẾM
       (giáo viên soạn câu hỏi, quản trị sửa cấu hình), tuyệt đối KHÔNG dùng
       trong luật của `progress` và `chats` — hai chỗ học sinh ghi liên tục.
       Cách đúng đắn hơn là custom claims, nhưng thứ đó cần Admin SDK trong
       Cloud Function, tức gói Blaze trả tiền. */
    function vaiTro() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function laGiaoVien() {
      return dangNhap() && vaiTro() in ['teacher', 'school_admin', 'admin'];
    }

    function laQuanTri() {
      return dangNhap() && vaiTro() in ['school_admin', 'admin'];
    }
```

- [ ] **Bước 2: Thay hai mục `bank_questions` và `questions`**

```
    // ── Ngân hàng câu hỏi ───────────────────────────────────────────────────
    /* Đọc PHẢI giữ công khai: workflow đồng bộ đêm
       (.github/workflows/dong-bo-ngan-hang.yml) đọc Firestore KHÔNG đăng nhập,
       chỉ bằng khoá web. Siết dòng này là đồng bộ chết mà không ai biết. */
    match /bank_questions/{id} {
      allow read: if true;
      allow create, update: if laGiaoVien() && cauHoiSach();
      allow delete: if laGiaoVien();
    }

    // Kho câu hỏi cũ, hiện rỗng. Cùng luật để nếu ai ghi lại thì cũng phải sạch.
    match /questions/{id} {
      allow read: if true;
      allow create, update: if laGiaoVien() && cauHoiSach();
      allow delete: if laGiaoVien();
    }
```

- [ ] **Bước 3: Thay toàn bộ khối 10 dòng `allow read, write: if true`**

Xoá 10 dòng đó, thay bằng:

```
    // ── Nội dung học: đọc công khai, ghi theo vai ───────────────────────────
    match /curriculum_chapters/{id} { allow read: if true; allow write: if laGiaoVien(); }
    match /exams/{id}               { allow read: if true; allow write: if laGiaoVien(); }
    match /equations/{id}           { allow read: if true; allow write: if laGiaoVien(); }
    match /matrix_resources/{id}    { allow read: if true; allow write: if laGiaoVien(); }
    match /system_settings/{id}     { allow read: if true; allow write: if laQuanTri(); }
    match /schools/{id}             { allow read: if true; allow write: if laQuanTri(); }

    // ── Dữ liệu người: phải đăng nhập ───────────────────────────────────────

    /* Id tài liệu CHÍNH LÀ email — đã kiểm trên dữ liệu thật. Nhờ vậy kiểm
       được quyền sở hữu mà không tốn lượt đọc nào. */
    match /progress/{userId} {
      allow read, write: if dangNhap() && (email() == userId || laGiaoVien());
    }

    /* App đọc chats bằng query(where('userEmail','==',…)), tức truy vấn CÓ RÀNG
       BUỘC trên đúng trường luật kiểm — điều kiện bắt buộc để Firestore cho
       phép truy vấn. Xem `getChatsByUserLesson` trong firestoreService.ts. */
    match /chats/{id} {
      allow read: if dangNhap() && (email() == resource.data.userEmail || laGiaoVien());
      allow create: if dangNhap() && email() == request.resource.data.userEmail;
      allow update, delete: if dangNhap() && (email() == resource.data.userEmail || laGiaoVien());
    }

    /* Đọc rộng cho người đã đăng nhập, CÓ CHỦ Ý: học sinh tự đăng ký vào lớp
       bằng mã mời, mà lúc đó email các em CHƯA nằm trong studentIdentifiers.
       Siết chặt hơn là chức năng "vào lớp bằng mã" chết. Hệ quả đã biết và
       chấp nhận: học sinh đã đăng nhập thấy được email bạn cùng trường. */
    match /classes/{id} {
      allow read: if dangNhap();
      allow write: if laGiaoVien();
    }

    /* CHÚ Ý hai điều, cả hai đều dễ viết sai:

       1. `create` phải cho phép CẢ trường hợp giáo viên/quản trị tạo hộ. Khi
          admin tạo tài khoản cho giáo viên, tài khoản Auth được tạo trên
          Firebase App PHỤ nhưng hồ sơ ghi bằng db của app CHÍNH — lúc ghi,
          request.auth.uid là ADMIN chứ không phải người mới. Thiếu vế
          laGiaoVien() là chặn đúng createTeacher / createSchoolAdmin /
          createStudent.

       2. `update` phải chặn tự đổi `role`. Không chặn thì một học sinh mở
          console trình duyệt là tự phong mình làm admin, và cả đợt này vô
          nghĩa. */
    match /users/{userId} {
      allow read: if dangNhap() && (request.auth.uid == userId || laGiaoVien());
      allow create: if dangNhap() && (request.auth.uid == userId || laGiaoVien());
      allow update: if dangNhap() && (
                      (request.auth.uid == userId
                       && request.resource.data.role == resource.data.role)
                      || laQuanTri()
                    );
      allow delete: if laQuanTri();
    }
```

- [ ] **Bước 4: Chạy phép kiểm — hai mục của việc 1 phải chuyển XANH**

```bash
npm run kiem-tra:an-ninh
```

Trông đợi:
```
OK   không còn `allow write: if true`
OK   cả 12 collection đều có luật riêng
OK   luật dùng 3 tên trường có thật trong mã
```

- [ ] **Bước 5: Chạy đủ bộ kiểm**

```bash
npm run lint
npm run kiem-tra
```

- [ ] **Bước 6: Commit**

```bash
git add firestore.rules
git commit -m "Viec 4/6: luat Firestore phan quyen theo vai (chua publish)"
```

---

### Việc 5: ⚠ CỔNG — Playground rồi Publish

**Chỉ làm sau khi việc 3 đã xác nhận bản mới chạy trên site thật.**

- [ ] **Bước 1: Chép luật ĐANG chạy ra tệp**

Firebase Console → Firestore Database → Rules → bôi đen toàn bộ → copy → dán
vào Notepad, lưu lại. Đây là bản lùi trong tay.

- [ ] **Bước 2: Dán luật mới vào ô soạn thảo, CHƯA bấm Publish**

Sai cú pháp thì Console báo đỏ ngay tại đây.

- [ ] **Bước 3: Chạy 11 phép thử ở Rules Playground**

| # | Ai | Thao tác | Đường dẫn | Phải ra |
|---|---|---|---|---|
| 1 | chưa đăng nhập | get | `/bank_questions/abc` | ✅ Allow |
| 2 | chưa đăng nhập | get | `/users/abc` | ❌ Deny |
| 3 | chưa đăng nhập | create | `/bank_questions/t1` | ❌ Deny |
| 4 | học sinh | get | `/progress/<email mình>` | ✅ Allow |
| 5 | học sinh | get | `/progress/<email bạn>` | ❌ Deny |
| 6 | học sinh | create | `/bank_questions/t2` | ❌ Deny |
| 7 | học sinh | update `role`→`admin` | `/users/<uid mình>` | ❌ Deny |
| 8 | học sinh | update `name` | `/users/<uid mình>` | ✅ Allow |
| 9 | giáo viên | create câu sạch | `/bank_questions/t3` | ✅ Allow |
| 10 | giáo viên | create câu có `<img onerror=…>` | `/bank_questions/t4` | ❌ Deny |
| 11 | giáo viên | create | `/users/<uid người khác>` | ✅ Allow |

Playground có ô **Authenticated** và ô nhập `uid` + `email` — dùng uid/email
thật của một tài khoản học sinh và một tài khoản giáo viên đang có.

**Phép 1 quan trọng nhất** — sai là đồng bộ đêm chết.
**Phép 7 quan trọng thứ nhì** — sai là cả đợt vô nghĩa.
**Phép 11 dễ quên nhất** — sai là admin không tạo được tài khoản hộ.

- [ ] **Bước 4: Publish**

- [ ] **Bước 5: Nếu hỏng — lùi ngay**

Dán lại bản Notepad ở bước 1 → Publish. Hoặc Console → Rules → lịch sử →
Restore. Có hiệu lực trong vài giây.

---

### Việc 6: Thử tay ba vai, rồi cập nhật tài liệu

- [ ] **Bước 1: Thử bằng vai HỌC SINH**

| Thử | Phải ra |
|---|---|
| Đăng nhập | vào được |
| Mở một bài, học vài slide | tiến độ lưu (F5 rồi xem lại) |
| Hỏi gia sư AI một câu | trả lời được, đoạn chat lưu |
| Làm một đề kiểm tra | nộp được, có điểm |

- [ ] **Bước 2: Thử bằng vai GIÁO VIÊN**

| Thử | Phải ra |
|---|---|
| Đăng nhập | vào được |
| Xem danh sách lớp và học sinh | có dữ liệu |
| Soạn/sửa một câu hỏi trong ngân hàng | lưu được |
| Tạo một tài khoản học sinh | tạo được, **và giáo viên vẫn là giáo viên** |

- [ ] **Bước 3: Thử bằng vai ADMIN**

| Thử | Phải ra |
|---|---|
| Đăng nhập | vào được |
| Xem toàn bộ người dùng | có dữ liệu |
| Sửa cấu hình hệ thống | lưu được |

**Bất kỳ mục nào "lưu không được mà không báo lỗi"** → mở F12 Console tìm dòng
`Missing or insufficient permissions`, ghi lại collection nào, rồi lùi luật và
báo user.

- [ ] **Bước 4: Xác nhận đồng bộ đêm còn sống**

```bash
npm run kiem-tra:dong-bo
```

Trông đợi: ĐẠT, hoặc BỎ QUA nếu mạng chặn. Ra "lệch" thì đọc kỹ — có thể là báo
động giả do mạng (đã gặp), kiểm lại bằng cách gọi thẳng REST trước khi kết luận.

- [ ] **Bước 5: Cập nhật `CLAUDE.md`**

Trong mục "An ninh", thay đoạn "Lỗ hổng CÒN LẠI" bằng:

```markdown
**Đợt 2 đã xong ngày 10/09/2026.** `firestore.rules` nay phân quyền theo vai:
nội dung học đọc công khai nhưng chỉ `teacher`/`school_admin`/`admin` ghi được;
`users`, `classes`, `chats`, `progress` phải đăng nhập mới đọc, và học sinh chỉ
thấy dữ liệu của chính mình.

Hai điều PHẢI giữ khi sửa luật về sau:

1. **`bank_questions` giữ `allow read: if true`** — workflow đồng bộ đêm đọc
   Firestore không đăng nhập.
2. **KHÔNG dùng `get()` trong luật của `progress` và `chats`** — mỗi `get()` là
   một lượt đọc có tính tiền, mà đó là hai chỗ học sinh ghi nhiều nhất. Quyền sở
   hữu ở đó kiểm bằng `request.auth.token.email`, miễn phí.

Còn lại: học sinh đã đăng nhập vẫn thấy email bạn cùng trường qua
`classes.studentIdentifiers` — hệ quả đã biết của việc giữ chức năng "vào lớp
bằng mã". Muốn kín hơn thì tách `class_codes` ra collection riêng.
```

- [ ] **Bước 6: Cập nhật số mục kiểm**

```bash
npm run kiem-tra
```
Đếm số dòng `OK` rồi sửa con số trong bảng lệnh của `CLAUDE.md` cho khớp.

- [ ] **Bước 7: Chạy đủ hai hàng rào**

```bash
npm run lint
npm run kiem-tra
```

- [ ] **Bước 8: Commit**

```bash
git add CLAUDE.md
git commit -m "CLAUDE.md: luat Firestore nay phan quyen theo vai"
```

---

## Nghiệm thu đợt 2

- [ ] Chưa đăng nhập: đọc được `bank_questions`, KHÔNG đọc được `users`
- [ ] Chưa đăng nhập: không ghi được gì
- [ ] Học sinh: lưu được tiến độ và chat của mình, không đọc được của bạn
- [ ] Học sinh: không tự đổi được `role`
- [ ] Giáo viên: soạn được câu hỏi, tạo được tài khoản học sinh mà không mất phiên
- [ ] Admin: sửa được cấu hình hệ thống
- [ ] `npm run kiem-tra:dong-bo` không báo lệch
- [ ] `npm run lint` sạch, `npm run kiem-tra` không mục nào SAI
- [ ] `CLAUDE.md` khớp với luật

## Ngoài phạm vi

- **Mức 3** — giáo viên chỉ sửa lớp mình, admin trường chỉ trong trường mình.
- **Custom claims** — cần gói Blaze.
- **Tách `class_codes`** để giấu email học sinh khỏi bạn cùng trường.
- **Đổi vai trò qua giao diện** — hiện không có màn nào làm việc này (màn cũ
  nằm trong mã chết đã xoá ngày 10/09/2026); phải sửa thẳng Firestore.
