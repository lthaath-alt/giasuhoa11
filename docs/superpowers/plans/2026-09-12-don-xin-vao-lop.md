# Đợt 2b — Đơn xin vào lớp + vá bốn lỗ chặn publish

> **Cho người thực thi:** dùng kỹ năng `executing-plans`. Mỗi bước có ô đánh dấu
> `- [ ]`. Mã trong kế hoạch là mã THẬT, đã đối chiếu với tệp hiện tại — đừng tự
> nghĩ ra mã khác.

**Mục tiêu:** Học sinh không ghi được vào `classes` dưới bất kỳ hình thức nào;
"vào lớp bằng mã mời" chuyển thành đơn chờ giáo viên duyệt; và bốn chỗ khiến
ứng dụng vỡ ngay khi publish luật mới được vá trước khi publish.

**Cách làm:** Nguyện vọng nằm ở một trường trên hồ sơ của chính học sinh
(`users.pendingClassCode`) — không tạo collection mới, không thêm khối luật nào.
Giáo viên duyệt thì chính giáo viên ghi `classId` và `classes.studentIdentifiers`.

**Ngăn xếp:** React 19 + Vite 6 + TypeScript 5.8 + MUI v9, Firestore, luật CEL.

**Spec:** `docs/superpowers/specs/2026-09-12-don-xin-vao-lop-design.md`
(phụ lục của `docs/superpowers/specs/2026-09-10-firestore-rules-dot-2-design.md`)

## Ràng buộc toàn cục

- `bank_questions` giữ `allow read: if true` — đồng bộ đêm đọc khi chưa đăng nhập.
- KHÔNG dùng `get()` trong luật của `progress` và `chats`.
- `classes` giữ `allow write: if laGiaoVien()`. Không nới, kể cả một trường.
- Không tạo collection mới.
- Bốn chỗ đọc `studentIdentifiers` (`ClassManagement`, `SchoolTab`,
  `TeacherPage`, `AppContext:960`) không đổi — nó vẫn là nguồn sự thật của sổ lớp.
- Không tự chạy `npm run build`, git nguy hiểm, push, deploy — chủ dự án tự làm.
- Mỗi lần sửa tệp bằng script: `grep` lại chuỗi vừa đặt vào, đừng tin thông báo.

## Thứ tự KHÔNG được đảo

    1 phép kiểm  ->  2 luật + kiểu  ->  3 AppContext (đăng ký & xin vào lớp)
    ->  4 màn duyệt cho giáo viên  ->  5 chữ nghĩa giao diện
    ->  6 BUILD + DEPLOY + XÁC NHẬN            <- CỔNG, chủ dự án làm
    ->  7 Playground 24 phép rồi Publish       <- CỔNG, khó lùi
    ->  8 thử tay ba vai + tài liệu

Publish trước khi bản mới chạy trên Netlify thì bản đang chạy vẫn ghi vào
`classes` khi học sinh nhập mã, và vẫn tạo hồ sơ lúc chưa đăng nhập — cả hai
đều bị luật mới chặn, tức **học sinh mới không đăng ký được và không ai vào lớp
được**.

---

### Task 1: Phép kiểm phải nhìn thấy tên trường trong `hasAny([...])`

**Tệp:**
- Sửa: `scripts/kiem-tra-an-ninh.mts:358-360`

**Giao diện:**
- Tiêu thụ: không
- Sinh ra: không (chỉ mở rộng phép kiểm sẵn có)

Phép 3 rút tên trường từ luật bằng hai mẫu `resource.data.X` và
`'X' in resource.data`. Luật mới ở Task 2 nhắc `role`, `classId`, `schoolId`
bên trong `affectedKeys().hasAny([...])` — **không mẫu nào thấy**. Không vá
trước thì đúng loại lỗi phép kiểm này sinh ra để bắt (gõ sai tên trường) lại
lọt qua cửa vừa mở.

- [ ] **Bước 1: Làm hỏng có chủ ý để xem phép kiểm có kêu không**

Trong `firestore.rules`, sửa dòng `allow delete: if laQuanTri();` của
`match /users/{userId}` thành:

```
      allow delete: if laQuanTri()
                    && !request.resource.data.diff(resource.data)
                         .affectedKeys().hasAny(['khongCoThatDau']);
```

- [ ] **Bước 2: Chạy phép kiểm, xác nhận nó KHÔNG kêu**

```bash
npm run kiem-tra:an-ninh
```

Mong đợi: vẫn báo đạt. Đó chính là lỗ hổng — `khongCoThatDau` không có trong mã
nguồn nào mà phép kiểm không thấy.

- [ ] **Bước 3: Mở rộng mẫu rút tên trường**

Trong `scripts/kiem-tra-an-ninh.mts`, ngay sau dòng

```typescript
  for (const m of luat.matchAll(/['"]([A-Za-z_]\w*)['"]\s+in\s+(?:request\.)?resource\.data/g)) truongTrongLuat.add(m[1]);
```

thêm:

```typescript
  /* Tên trường còn nấp trong affectedKeys().hasAny([...]) / .hasOnly([...]) /
     .hasAll([...]) — hai mẫu trên không thấy chúng. Cửa này mở ngày 12/09/2026
     cùng luật `users` mới; không mở mẫu theo thì gõ sai tên trường ở đó là
     luật im lặng cho qua, đúng cái bẫy đã sập ở đợt 1. */
  for (const m of luat.matchAll(/\.has(?:Any|Only|All)\(\s*\[([^\]]*)\]/g)) {
    for (const t of m[1].matchAll(/['"]([A-Za-z_]\w*)['"]/g)) truongTrongLuat.add(t[1]);
  }
```

- [ ] **Bước 4: Chạy lại, lần này phải KÊU**

```bash
npm run kiem-tra:an-ninh
```

Mong đợi: SAI, với dòng `không có trong mã: khongCoThatDau`.

Không kêu thì regex sai — sửa regex, đừng sửa luật.

- [ ] **Bước 5: Trả `firestore.rules` về nguyên trạng**

```bash
git checkout firestore.rules
npm run kiem-tra:an-ninh
```

Mong đợi: đạt trở lại.

- [ ] **Bước 6: Commit**

```bash
git add scripts/kiem-tra-an-ninh.mts
git commit -m "Dot 2b/1: phep kiem doc duoc ten truong trong affectedKeys().hasAny()

Co tinh lam hong bang hasAny(['khongCoThatDau']) truoc khi va: phep kiem
cu bao dat, tuc no khong bat duoc chinh cai loi no sinh ra de bat.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Trường `pendingClassCode` và luật `users` mới

**Tệp:**
- Sửa: `src/features/auth/types.ts` (thêm trường vào `User`, sau `joinedClassId`)
- Sửa: `src/core/services/firestoreAuth.ts:134-144` và `:180-192`
- Sửa: `src/core/services/firestoreService.ts` (thêm `clearPendingClassCode`)
- Sửa: `firestore.rules` (khối `match /users/{userId}`)

**Giao diện:**
- Tiêu thụ: không
- Sinh ra:
  - `User.pendingClassCode?: string`
  - `createAccountWithFirestore({ …, pendingClassCode?: string })`
  - `FirestoreService.clearPendingClassCode(userId: string): Promise<boolean>`

- [ ] **Bước 1: Thêm trường vào kiểu `User`**

Trong `src/features/auth/types.ts`, ngay sau khối `joinedClassId?: string;`:

```typescript
  /**
   * Mã lớp học sinh đã nhập để XIN vào lớp — chưa được duyệt.
   *
   * Khác `classId`: đây mới là nguyện vọng. Học sinh KHÔNG tự đặt được
   * `classId` cho mình (luật Firestore chặn `affectedKeys()` chạm vào
   * `classId`/`schoolId`), nên đường duy nhất vào lớp là giáo viên bấm Duyệt
   * trong `ClassManagement` — và chính giáo viên ghi `classId` cùng
   * `classes.studentIdentifiers`.
   *
   * Cố ý KHÔNG kiểm mã có thật hay không lúc nhập: màn đăng ký chạy khi chưa
   * đăng nhập, mà từ đợt 2 `classes` chỉ nạp sau khi đăng nhập — mảng lúc đó
   * rỗng nên mọi lần tra đều trả "mã không tồn tại", kể cả mã đúng. Mã sai
   * đơn giản là không trùng lớp nào và không hiện ra ở đâu.
   */
  pendingClassCode?: string;
```

- [ ] **Bước 2: Cho `createAccountWithFirestore` nhận và ghi trường đó**

Trong `src/core/services/firestoreAuth.ts`, thêm vào khối tham số (cạnh
`schoolId?: string;`):

```typescript
  pendingClassCode?: string;
```

và ngay sau hai dòng

```typescript
    if (data.classId) hoSo.classId = data.classId;
    if (data.schoolId) hoSo.schoolId = data.schoolId;
```

thêm:

```typescript
    if (data.pendingClassCode) hoSo.pendingClassCode = data.pendingClassCode;
```

- [ ] **Bước 3: Thêm hàm xoá nguyện vọng**

Trong `src/core/services/firestoreService.ts`, thêm `deleteField` vào dòng
`import { … } from 'firebase/firestore';`, rồi thêm hàm này ngay sau
`updateUserById`:

```typescript
  /**
   * Xoá nguyện vọng vào lớp, sau khi giáo viên duyệt hoặc từ chối.
   *
   * Phải dùng `deleteField()` chứ không gán `undefined`: `cleanForFirestore`
   * lọc bỏ `undefined` trước khi gửi, nên gán như vậy là KHÔNG ghi gì cả và
   * đơn cũ nằm lại mãi trong danh sách chờ.
   */
  async clearPendingClassCode(userId: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, COL_USERS, userId), { pendingClassCode: deleteField() });
      return true;
    } catch (err) {
      handleError('clearPendingClassCode', err);
      return false;
    }
  },
```

- [ ] **Bước 4: Viết lại khối `users` trong `firestore.rules`**

Thay TOÀN BỘ khối `match /users/{userId} { … }` (kể cả chú thích phía trên)
bằng:

```
    /* BỐN điều phải nhớ, cả bốn đều đã viết sai một lần:

       1. `create` phải cho phép giáo viên/quản trị tạo hộ. Khi admin tạo tài
          khoản cho giáo viên, bản ghi Auth tạo trên app PHỤ (xem `taoAuthPhu()`)
          nhưng hồ sơ ghi bằng db của app CHÍNH — lúc ghi, request.auth.uid là
          ADMIN chứ không phải người mới.

       2. `create` cũng phải chặn TỰ PHONG VAI. Đăng ký Firebase Auth bằng email
          + mật khẩu là công khai: ai cũng gọi thẳng API của Google để lấy một
          uid hợp lệ mà không cần đụng vào web, rồi ghi users/{uid} với
          role: "admin". Chặn `update` mà bỏ ngỏ `create` thì cửa vẫn mở, chỉ là
          cửa bên cạnh.

       3. Học sinh KHÔNG tự đặt được `classId`/`schoolId`. Nếu cho, thì dù
          `classes` đã khoá, em vẫn tự xếp mình vào lớp bất kỳ qua cửa sau.
          Vào lớp đi bằng `pendingClassCode` rồi chờ giáo viên duyệt.

       4. So bằng `affectedKeys()` chứ KHÔNG so
          `request.resource.data.classId == resource.data.classId`: phần lớn hồ
          sơ không có hai trường đó, mà đọc một trường vắng mặt trong luật là
          lỗi, và lỗi thì từ chối — tức chặn nhầm mọi người. */
    match /users/{userId} {
      allow read:   if dangNhap() && (request.auth.uid == userId || laGiaoVien());

      allow create: if dangNhap() && (
                      (request.auth.uid == userId
                       && request.resource.data.role == 'student'
                       && !('classId' in request.resource.data)
                       && !('schoolId' in request.resource.data))
                      || laGiaoVien()
                    );

      allow update: if dangNhap() && (
                      (request.auth.uid == userId
                       && !request.resource.data.diff(resource.data)
                            .affectedKeys().hasAny(['role', 'classId', 'schoolId']))
                      || (laGiaoVien()
                          && !request.resource.data.diff(resource.data)
                               .affectedKeys().hasAny(['role']))
                      || laQuanTri()
                    );

      allow delete: if laQuanTri();
    }
```

- [ ] **Bước 5: Kiểm biên dịch và phép kiểm**

```bash
npx tsc --noEmit
npm run kiem-tra:an-ninh
```

Mong đợi: `tsc` sạch; phép kiểm đạt, và dòng "tên trường luật nhắc tới" nay
đếm thêm `classId`, `schoolId` — cả hai đều có thật trong `types.ts`.

- [ ] **Bước 6: Commit**

```bash
git add src/features/auth/types.ts src/core/services/firestoreAuth.ts src/core/services/firestoreService.ts firestore.rules
git commit -m "Dot 2b/2: pendingClassCode + luat users chan tu phong vai va tu xep lop

create khong rang buoc role la mot duong leo thang quyen: dang ky Auth la
cong khai, co uid roi thi ghi users/{uid} voi role admin.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: `AppContext` — đăng ký và xin vào lớp

**Tệp:**
- Sửa: `src/core/contexts/AppContext.tsx:388-421` (hiệu ứng `onAuthStateChanged`)
- Sửa: `src/core/contexts/AppContext.tsx:1530-1610` (`registerWithOptionalClass`)
- Sửa: `src/core/contexts/AppContext.tsx:1648-1687` (`joinClassByCode`)

**Giao diện:**
- Tiêu thụ: `createAccountWithFirestore({ pendingClassCode })` từ Task 2
- Sinh ra: `joinClassByCode` đổi ý nghĩa — nay **gửi đơn**, không vào lớp ngay.
  Kiểu trả về giữ nguyên `{ success, message, className? }`.

- [ ] **Bước 1: Đọc hồ sơ TRƯỚC, và chỉ tải `users` cho người có quyền**

Hai lỗi trong hiệu ứng hiện tại:

* `getUsers()` là truy vấn không ràng buộc trên `users`. Luật mới đòi
  `request.auth.uid == userId` cho từng tài liệu, nên với **học sinh** truy vấn
  này **chắc chắn bị từ chối** — mỗi lần học sinh đăng nhập là một vòng mạng
  phí và một dòng lỗi vô ích. (Không vỡ gì, vì `getUsers` nuốt lỗi và trả `[]`,
  và đã đo: sáu tệp dùng mảng `users` đều là màn giáo viên/quản trị.)
* Người VỪA đăng ký: `createUserWithEmailAndPassword` bắn
  `onAuthStateChanged` ngay, chạy đua với `setDoc` ghi hồ sơ. Thua thì
  `signOut()` đá người mới ra.

Trong hiệu ứng, thay đoạn từ `/* Đã đăng nhập → nay mới đọc được…` cho tới hết
khối `if (!anh.exists()) { … }` bằng:

```typescript
      /* Hồ sơ đọc TRƯỚC, hai collection người đọc sau — ngược với bản cũ.
         Lý do: `getUsers()` là truy vấn không ràng buộc, mà luật mới đòi
         `request.auth.uid == userId` từng tài liệu, nên HỌC SINH gọi là chắc
         chắn bị từ chối. Biết vai rồi mới gọi thì đỡ một vòng mạng và một
         dòng lỗi vô ích mỗi lần học sinh đăng nhập. */

      /* Thử LẠI một lần trước khi kết luận là không có hồ sơ. Người vừa đăng
         ký xong: `createUserWithEmailAndPassword` bắn sự kiện này NGAY, chạy
         đua với `setDoc` ghi hồ sơ. Thua cuộc đua mà đá luôn ra thì người mới
         đăng ký xong bị văng về màn đăng nhập dù tài khoản hoàn toàn hợp lệ. */
      let anh = await getDoc(doc(db, 'users', nguoiAuth.uid));
      if (!anh.exists()) {
        await new Promise(r => setTimeout(r, 600));
        anh = await getDoc(doc(db, 'users', nguoiAuth.uid));
      }
      if (!anh.exists()) {
        /* Có phiên Auth mà không có hồ sơ — đừng đoán, đừng tự tạo. Đây là dấu
           hiệu dữ liệu lệch, phải để người quản trị nhìn thấy. */
        await signOut(auth);
        setCurrentUser(null);
        return;
      }
```

Rồi NGAY SAU dòng `setCurrentUser(hoSo);` ở cuối hiệu ứng, thêm:

```typescript
      /* `classes` thì học sinh đọc được (luật chỉ đòi đã đăng nhập) và màn
         "xin vào lớp" cần nó. `users` thì chỉ giáo viên/quản trị đọc được. */
      setClasses(await FirestoreService.getClasses());
      if (hoSo.role !== 'student') {
        const dsNguoiDung = await FirestoreService.getUsers();
        setUsers(dsNguoiDung.map(u => {
          const chuan = chuanHoaVaiTro(u.role as string);
          return chuan === u.role ? u : { ...u, role: chuan };
        }));
      }
```

Xoá khối `const [dsNguoiDung, dsLop] = await Promise.all([…]);` cùng hai dòng
`setUsers(…)` / `setClasses(dsLop);` cũ nằm phía trên.

- [ ] **Bước 2: Viết lại `registerWithOptionalClass`**

Thay toàn bộ thân hàm bằng:

```typescript
  const registerWithOptionalClass = async (
    name: string,
    email: string,
    password: string,
    inviteCode?: string
  ) => {
    if (!name.trim()) return { success: false, message: 'Vui lòng nhập họ tên.' };
    if (!email.trim()) return { success: false, message: 'Vui lòng nhập email.' };
    if (password.length < 8) return { success: false, message: 'Mật khẩu phải có ít nhất 8 ký tự.' };
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { success: false, message: 'Mật khẩu phải chứa cả chữ cái và chữ số.' };
    }

    const lower = email.toLowerCase().trim();

    /* Phép kiểm này chỉ chạy được khi người gọi ĐÃ đăng nhập; với khách thì
       mảng `users` rỗng nên nó không bao giờ bắt được gì. Hàng rào thật là
       Firebase Auth: nó trả `auth/email-already-in-use`. Giữ lại vì vô hại và
       cho thông báo đẹp hơn ở những đường có sẵn danh sách. */
    const existing = users.find(u => u.email.toLowerCase() === lower);
    if (existing) return { success: false, message: `Email ${email} đã được đăng ký trong hệ thống!` };

    /* KHÔNG tra mã lớp ở đây, và đó là CỐ Ý. Màn đăng ký chạy khi chưa đăng
       nhập, mà từ đợt 2 `classes` chỉ nạp sau khi đăng nhập — mảng đang rỗng
       nên mọi lần tra đều trả "mã không tồn tại", kể cả mã đúng. (Lỗi này đã
       lên production từ lần deploy của Việc 3.) Mã cất nguyên văn vào
       `pendingClassCode`; giáo viên nào có lớp mang mã đó sẽ thấy đơn. */
    const maXinVaoLop = inviteCode?.trim().toUpperCase() || undefined;

    const fsRes = await createAccountWithFirestore({
      username: lower,
      password: password,
      fullName: name.trim(),
      role: 'student',
      email: lower,
      pendingClassCode: maXinVaoLop,
      status: 'active',
      dangTuDangKy: true,   // tạo trên app CHÍNH -> đăng nhập luôn sau khi tạo
    });

    if (!fsRes.success) {
      return { success: false, message: fsRes.message };
    }

    const newUser: User = {
      id: fsRes.user!.uid,
      email: lower,
      username: lower,
      name: name.trim(),
      role: 'student',
      status: 'active',
      authProvider: 'local',
      pendingClassCode: maXinVaoLop,
      canChangePassword: true,
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [...prev, newUser]);
    persistSession(newUser);

    return {
      success: true,
      message: maXinVaoLop
        ? `Tạo tài khoản thành công! Đã gửi đơn xin vào lớp mã "${maXinVaoLop}", chờ giáo viên duyệt.`
        : 'Tạo tài khoản thành công!',
      user: newUser,
    };
  };
```

Chú ý: **không còn** gán `classId`/`schoolId`/`joinedClassId` lúc đăng ký, và
**không còn** gọi `addStudentToClass`. Cả hai đều bị luật mới chặn.

- [ ] **Bước 3: Viết lại `joinClassByCode` thành gửi đơn**

Thay toàn bộ thân hàm bằng:

```typescript
  const joinClassByCode = async (code: string) => {
    if (!currentUser) return { success: false, message: 'Bạn cần đăng nhập trước khi tham gia lớp.' };
    if (!code.trim()) return { success: false, message: 'Vui lòng nhập mã lớp.' };

    if (currentUser.classId || currentUser.joinedClassId) {
      return { success: false, message: 'Bạn đã thuộc một lớp học. Liên hệ giáo viên nếu cần thay đổi.' };
    }
    if (currentUser.pendingClassCode) {
      return { success: false, message: 'Bạn đã gửi một đơn xin vào lớp và đang chờ giáo viên duyệt.' };
    }

    const upper = code.trim().toUpperCase();

    /* Học sinh ĐÃ đăng nhập thì đọc được `classes` (luật chỉ đòi đã đăng
       nhập), nên ở đây tra mã được — khác màn đăng ký. Tra để báo sai ngay,
       đỡ để em chờ một đơn không bao giờ tới tay ai. */
    const schoolClass = classes.find(c => c.inviteCode?.toUpperCase() === upper);
    if (!schoolClass) {
      return { success: false, message: `Mã lớp "${code.toUpperCase()}" không tồn tại. Vui lòng kiểm tra lại.` };
    }

    /* CHỈ ghi vào hồ sơ của CHÍNH MÌNH, và chỉ đúng một trường nguyện vọng.
       Không đặt `classId`, không đụng `classes` — luật Firestore chặn cả hai,
       và đó là chủ ý: giáo viên là người duy nhất xếp lớp. */
    const ok = await FirestoreService.updateUserById(currentUser.id, {
      pendingClassCode: upper,
    });
    if (!ok) {
      return { success: false, message: 'Không gửi được đơn. Vui lòng thử lại.' };
    }

    const updatedUser = { ...currentUser, pendingClassCode: upper };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    return {
      success: true,
      message: `Đã gửi đơn xin vào lớp "${schoolClass.name}". Chờ giáo viên duyệt.`,
      className: schoolClass.name,
    };
  };
```

- [ ] **Bước 4: Kiểm biên dịch**

```bash
npx tsc --noEmit
```

Mong đợi: sạch. Báo `isManaged`/`targetRole`/`assignedClassId` không dùng nữa
thì xoá hẳn những dòng khai báo đó — chúng thuộc thân hàm cũ.

- [ ] **Bước 5: Commit**

```bash
git add src/core/contexts/AppContext.tsx
git commit -m "Dot 2b/3: dang ky khong ghi classes, vao lop bang ma tro thanh don cho duyet

Ba loi cung duong: thieu dangTuDangKy nen ho so ghi luc chua dang nhap;
joinClassByCode ghi thang vao classes; va o Ma lop luc dang ky tra vao
mang classes rong ke tu Viec 2 nen ma dung van bao khong ton tai.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Màn duyệt đơn cho giáo viên

**Tệp:**
- Sửa: `src/core/contexts/AppContext.tsx` (thêm hai hàm + khai vào interface + đưa vào `value`)
- Sửa: `src/core/components/ClassManagement.tsx` (cột "Đơn chờ" + hộp thoại duyệt)

**Giao diện:**
- Tiêu thụ: `FirestoreService.clearPendingClassCode` từ Task 2
- Sinh ra:
  - `approveJoinRequest(studentId: string, classId: string): Promise<{ success: boolean; message: string }>`
  - `rejectJoinRequest(studentId: string): Promise<{ success: boolean; message: string }>`

- [ ] **Bước 1: Thêm hai hàm vào `AppContext`, đặt ngay sau `joinClassByCode`**

```typescript
  // ── Giáo viên duyệt đơn xin vào lớp ──────────────────────────────────

  /* Hai lượt ghi dưới đây đều do GIÁO VIÊN thực hiện, và đó là cả điểm mấu
     chốt của đợt 2b: học sinh không ghi được vào `classes`, cũng không tự đặt
     được `classId` cho mình. Luật Firestore chặn cả hai đường. */
  const approveJoinRequest = async (studentId: string, classId: string) => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return { success: false, message: 'Không tìm thấy lớp.' };
    const student = users.find(u => u.id === studentId);
    if (!student) return { success: false, message: 'Không tìm thấy học sinh.' };

    const identifier = student.username || student.email;

    const okHoSo = await FirestoreService.updateUserById(studentId, {
      classId: cls.id,
      joinedClassId: cls.id,
      schoolId: cls.schoolId,
    });
    if (!okHoSo) return { success: false, message: 'Không cập nhật được hồ sơ học sinh.' };

    await FirestoreService.addStudentToClass(cls.id, identifier);
    await FirestoreService.clearPendingClassCode(studentId);

    setUsers(prev => prev.map(u => u.id === studentId
      ? { ...u, classId: cls.id, joinedClassId: cls.id, schoolId: cls.schoolId, pendingClassCode: undefined }
      : u));
    setClasses(prev => prev.map(c => c.id === cls.id
      ? { ...c, studentIdentifiers: [...c.studentIdentifiers, identifier] }
      : c));

    return { success: true, message: `Đã thêm ${student.name} vào lớp "${cls.name}".` };
  };

  const rejectJoinRequest = async (studentId: string) => {
    const ok = await FirestoreService.clearPendingClassCode(studentId);
    if (!ok) return { success: false, message: 'Không xoá được đơn. Vui lòng thử lại.' };
    setUsers(prev => prev.map(u => u.id === studentId ? { ...u, pendingClassCode: undefined } : u));
    return { success: true, message: 'Đã từ chối đơn.' };
  };
```

- [ ] **Bước 2: Khai hai hàm trong interface và đưa vào `value`**

Cạnh dòng `joinClassByCode: (code: string) => Promise<{` trong interface, thêm:

```typescript
  approveJoinRequest: (studentId: string, classId: string) => Promise<{ success: boolean; message: string }>;
  rejectJoinRequest: (studentId: string) => Promise<{ success: boolean; message: string }>;
```

Và cạnh dòng `joinClassByCode,` trong object `value`, thêm:

```typescript
        approveJoinRequest,
        rejectJoinRequest,
```

- [ ] **Bước 3: Thêm cột "Đơn chờ" vào bảng lớp**

Trong `src/core/components/ClassManagement.tsx`:

đổi dòng lấy hàm từ context

```typescript
  const { updateClass, deleteClass } = useApp();
```

thành

```typescript
  const { updateClass, deleteClass, approveJoinRequest, rejectJoinRequest } = useApp();
```

thêm state ngay sau `const [exporting, setExporting] = useState(false);`

```typescript
  const [donClassId, setDonClassId] = useState<string | null>(null);
  const [dangDuyet, setDangDuyet] = useState<string | null>(null);
```

và thêm hàm lọc đơn ngay sau `getTeachers()`:

```typescript
  /* Đơn xin vào lớp = học sinh có `pendingClassCode` trùng mã mời của lớp.
     Không có collection riêng, nên cũng không có gì phải đồng bộ. */
  const getDonChoDuyet = (cls: SchoolClass) =>
    users.filter(u =>
      u.pendingClassCode &&
      cls.inviteCode &&
      u.pendingClassCode.toUpperCase() === cls.inviteCode.toUpperCase()
    );
```

Thêm một `<TableCell>` ngay SAU ô `label={`${cls.studentIdentifiers.length} học sinh`}`:

```tsx
                  <TableCell>
                    {getDonChoDuyet(cls).length > 0 ? (
                      <Chip
                        size="small"
                        clickable
                        onClick={() => setDonClassId(cls.id)}
                        label={`${getDonChoDuyet(cls).length} đơn chờ`}
                        sx={{
                          fontWeight: 'bold',
                          bgcolor: 'var(--vang-nen)',
                          color: 'var(--chu-nguoc)',
                        }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">—</Typography>
                    )}
                  </TableCell>
```

và một `<TableCell>Đơn chờ</TableCell>` vào hàng tiêu đề, đúng vị trí tương ứng.

- [ ] **Bước 4: Thêm hộp thoại duyệt, đặt cạnh các `<Dialog>` sẵn có**

```tsx
      <Dialog open={Boolean(donClassId)} onClose={() => setDonClassId(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Đơn xin vào lớp</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Học sinh đã nhập mã lớp này. Duyệt thì em được thêm vào lớp và bắt đầu
            được theo dõi tiến độ.
          </DialogContentText>
          {donClassId && getDonChoDuyet(classes.find(c => c.id === donClassId)!).map(hs => (
            <Box
              key={hs.id}
              sx={{
                display: 'flex', alignItems: 'center', gap: 2, py: 1.5,
                borderBottom: '1px solid var(--vien-2)',
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{hs.name}</Typography>
                <Typography variant="caption" color="text.secondary">{hs.email}</Typography>
              </Box>
              <Button
                size="small"
                disabled={dangDuyet === hs.id}
                onClick={async () => {
                  setDangDuyet(hs.id);
                  await approveJoinRequest(hs.id, donClassId!);
                  setDangDuyet(null);
                }}
                sx={{
                  textTransform: 'none', fontWeight: 'bold', borderRadius: 0,
                  bgcolor: 'var(--luc-tham-nen)', color: 'var(--chu-nguoc)',
                }}
              >
                Duyệt
              </Button>
              <Button
                size="small"
                disabled={dangDuyet === hs.id}
                onClick={async () => {
                  setDangDuyet(hs.id);
                  await rejectJoinRequest(hs.id);
                  setDangDuyet(null);
                }}
                sx={{ textTransform: 'none', borderRadius: 0, color: 'var(--chu-2)' }}
              >
                Từ chối
              </Button>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDonClassId(null)} sx={{ textTransform: 'none' }}>Đóng</Button>
        </DialogActions>
      </Dialog>
```

- [ ] **Bước 5: Kiểm biên dịch và màu**

```bash
npx tsc --noEmit
npm run kiem-tra:mau
```

Mong đợi: cả hai sạch. `kiem-tra:mau` kêu tên biến không có thật thì sửa tên
biến cho đúng bảng trong `index.css` — đừng sửa phép kiểm.

- [ ] **Bước 6: Commit**

```bash
git add src/core/contexts/AppContext.tsx src/core/components/ClassManagement.tsx
git commit -m "Dot 2b/4: giao vien duyet don xin vao lop

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Chữ nghĩa giao diện phải nói đúng sự thật mới

**Tệp:**
- Sửa: `src/features/auth/components/JoinClassForm.tsx`
- Sửa: `src/features/auth/components/StudentRegisterForm.tsx:244-310`

Màn hình đang hứa "Tham gia lớp thành công! Bạn đã được thêm vào lớp." Sau đợt
này điều đó KHÔNG còn đúng — em mới chỉ gửi đơn. Để nguyên là nói dối người dùng.

- [ ] **Bước 1: Sửa chữ ở `JoinClassForm`**

Thay khối trong `<Collapse in={Boolean(success)}>`:

```tsx
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--luc)' }}>
                Đã gửi đơn xin vào lớp!
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Đơn vào lớp <strong>{success}</strong> đã gửi tới giáo viên. Khi được
                duyệt, giáo viên sẽ thấy tiến độ học tập của bạn.
              </Typography>
```

Và đổi nhãn nút `'Tham gia lớp'` thành `'Gửi đơn'`, dòng mời
`Bạn có mã lớp do giáo viên cấp?` giữ nguyên, còn dòng mô tả đổi thành:

```tsx
              Nhập mã lớp để xin vào lớp. Giáo viên duyệt xong thì thầy cô mới theo
              dõi được tiến độ học. Lịch sử học hiện tại sẽ được giữ nguyên.
```

- [ ] **Bước 2: Thêm một dòng giải thích dưới ô "Mã lớp" ở màn đăng ký**

Ngay sau `<TextField … label="Mã lớp (6 ký tự)" … />`, thêm:

```tsx
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Nhập mã thì đơn vào lớp sẽ được gửi tới giáo viên. Bạn vẫn dùng được
              ngay, không cần chờ duyệt.
            </Typography>
```

- [ ] **Bước 3: Kiểm**

```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Bước 4: Commit**

```bash
git add src/features/auth/components/JoinClassForm.tsx src/features/auth/components/StudentRegisterForm.tsx
git commit -m "Dot 2b/5: man hinh noi dung su that moi — gui don, chua vao lop

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: CỔNG — build, deploy, xác nhận bản mới đang chạy

**Chủ dự án làm.** Đây là chỗ đảo thứ tự là hỏng cả hệ thống.

- [ ] **Bước 1: Chạy đủ bộ kiểm**

```bash
npm run kiem-tra
```

Mong đợi: 10/10 bộ đạt, 0 mục sai.

- [ ] **Bước 2: Build**

```bash
npm run build
```

- [ ] **Bước 3: Kéo thả `dist/` lên Netlify, rồi XÁC NHẬN bản mới thật sự đang chạy**

**Cách xác nhận này đã viết lại ngày 12/09/2026.** Bản đầu bảo "đăng nhập học
sinh rồi mở khung mã lớp" — nhưng khung đó lúc ấy **không ai tới được** (xem
commit `f57265a`), nên phép xác nhận đó vô dụng. Nay dùng một chỗ **công khai**,
không cần đăng nhập.

Mở web bằng **cửa sổ ẩn danh** rồi kiểm ba thứ:

**a) Màn đăng ký học sinh** (Đăng ký ngay → Học sinh đăng ký bằng Email). Dòng
trên ô "Mã lớp" phải là *"Có mã lớp do giáo viên cấp? Điền vào bên dưới để **gửi
đơn xin vào lớp**."* Còn thấy *"được gắn vào lớp học ngay"* là trình duyệt giữ
bản cũ — Ctrl+F5, đừng đi tiếp. (Dòng mới này đã đo trên máy chủ dev ngày
12/09/2026, nên nó là dấu hiệu chắc chắn.)

**b) Đăng nhập một tài khoản học sinh chưa có lớp** → tab **Học sinh** → khối
"Bài tập GV giao" phải hiện thẳng khung nhập mã lớp. Đây là lối vào mới; trước
đó chỗ này chỉ có một dòng chữ chỉ tới mục "Các khóa học" đã bị ẩn khỏi menu.

**c) Trang phòng thí nghiệm 3D** (tính năng trộn về từ `origin/main`) phải hiện
đúng, không trắng trang. Trang đó dựng bằng 2 đoạn script nội tuyến, mà CSP chặn
script nội tuyến trừ khi có hash. `bam-csp.mts` quét đệ quy mọi `.html` trong
`dist/` nên sẽ tự băm — nhưng đây là loại lỗi **chỉ hiện trên production**, và
dự án đã trả giá vì nó đúng hai lần.

**Chưa xác nhận xong thì TUYỆT ĐỐI chưa sang Task 7.**

---

### Task 7: CỔNG — 24 phép ở Rules Playground, rồi Publish

**Chủ dự án làm.** Chép luật ĐANG chạy ra Notepad trước — đó là bản lùi.

Với mỗi phép: bật/tắt **Authenticated** đúng như cột thứ hai. Công tắc đó **tự
tắt khi đổi Simulation type**, phải kiểm lại trước mỗi lần Run.

| # | Đăng nhập | Thao tác | Đường dẫn | Dữ liệu | Phải ra |
|---|---|---|---|---|---|
| 1 | TẮT | get | `/bank_questions/abc` | — | ✅ |
| 2 | TẮT | get | `/users/abc` | — | ❌ |
| 3 | TẮT | create | `/bank_questions/t1` | `q: thu` | ❌ |
| 4 | học sinh | get | `/progress/<email HS>` | — | ✅ |
| 5 | học sinh | get | `/progress/<email HS khác>` | — | ❌ |
| 6 | học sinh | create | `/bank_questions/t2` | `q: thu` | ❌ |
| 7 | học sinh | **update** | `/users/<uid HS>` | `role: admin` | ❌ |
| 8 | học sinh | update | `/users/<uid HS>` | `name: Tên mới` | ✅ |
| 9 | giáo viên | create | `/bank_questions/t3` | `q: 2+2=?` | ✅ |
| 10 | giáo viên | create | `/bank_questions/t4` | `q: <img src=x onerror=alert(1)>` | ❌ |
| 11 | **quản trị** | create | `/users/<uid mới bịa>` | `role: teacher` | ✅ |
| 12 | **giáo viên thuần** | create | `/users/<uid mới bịa>` | `role: teacher` | ❌ |
| 13 | **giáo viên thuần** | create | `/users/<uid mới bịa>` | `role: student` + `classId: <id lớp>` | ✅ |
| 14 | học sinh | **create** | `/users/<uid HS>` | `role: admin` | ❌ |
| 15 | học sinh | update | `/users/<uid HS>` | `classId: class_abc` | ❌ |
| 16 | học sinh | update | `/users/<uid HS>` | `joinedClassId: class_abc` | ❌ |
| 17 | học sinh | update | `/users/<uid HS>` | `pendingClassCode: ABC123` | ✅ |
| 18 | **giáo viên thuần** | **list** | `/users` | — | ✅ |
| 19 | học sinh | **list** | `/users` | — | ❌ |
| 20 | **giáo viên thuần** | update | `/users/<uid HS>` | `classId: <id lớp>` | ✅ |
| 21 | **giáo viên thuần** | update | `/users/<uid HS>` | `role: admin` | ❌ |
| 22 | học sinh | update | `/users/<uid HS>` | `username: <email HS khác>` | ❌ |
| 23 | học sinh | **get** | `/users/<uid CHÍNH MÌNH>` | — | ✅ |
| 24 | học sinh | get | `/users/<uid HS khác>` | — | ❌ |

**Phép 23 và 24 thêm ngày 12/09/2026, và phép 23 là chỗ bảng này thiếu nặng
nhất từ đầu.** Nó đo **đường đăng nhập**: `firestoreAuth.ts:91` và hiệu ứng
`onAuthStateChanged` đều gọi `getDoc(doc(db,'users',uid))` để dựng hồ sơ. Phép
23 sai là **KHÔNG AI đăng nhập được** — nặng hơn mọi phép còn lại, mà suốt 22
phép trước không có dòng nào chạm tới nó.

**Phép 18 và 19 không mô phỏng được** — Rules Playground không cho chọn thao tác
`list` (đã thử ngày 12/09/2026). Thay vì publish với một câu hỏi treo, luật đã
được **tách `read` thành `get` và `list`** để câu hỏi đó biến mất:

- `allow list: if laGiaoVien();` — **không phụ thuộc tài liệu nào**. Trước khi
  tách, `list` phải dựa vào cách Firestore đánh giá `request.auth.uid == userId`
  trên từng tài liệu trả về, và đó là điều không đo được ở đây.
- `laGiaoVien()` đã được đo gián tiếp bởi phép 9, 10, 12, 13, 20, 21 — sáu phép
  đều đi qua nó.

Nên bỏ 18 và 19 khỏi danh sách bắt buộc: chúng nay là hệ quả của một mệnh đề đã
được kiểm, không còn là ẩn số.

**Phép 22 thêm ngày 12/09/2026.** Nó đo bản vá cửa sau thứ ba: sổ lớp khớp học
sinh bằng **chuỗi định danh** (`studentIdentifiers` so với `username` hoặc
`email`), không bằng `classId`. Học sinh đọc được `classes`, nên nếu luật không
chặn thì em chép một định danh trong sổ lớp đích rồi đặt `username` của mình
thành chuỗi đó là hiện ra trong bảng tiến độ của giáo viên lớp ấy. Không có phép
này thì bản vá đó **không được đo lần nào**.

**Giá trị thật để điền** (uid, email, `classId`, `inviteCode`) cố ý KHÔNG ghi
vào tệp này: tệp nằm trong git và đẩy lên GitHub. Tra lại bằng Firebase Console,
hoặc hỏi lại trợ lý — nó tra được từ Firestore mà không cần đăng nhập.

**Bốn dòng 18-21 thêm ngày 12/09/2026** sau lần soát toàn nhánh. Bảng 17 phép
trước đó để trống đúng bốn đường mà sai một cái là phải lùi luật:

- **Phép 18 là phép rủi ro nhất của cả đợt.** `getUsers()` là một truy vấn
  **không ràng buộc** trên `users`. Firestore đánh giá luật `list` theo từng tài
  liệu trả về, nên nếu `laGiaoVien()` không thoả được cho cả collection thì
  **toàn bộ màn giáo viên và quản trị trắng**: danh sách tài khoản, sổ lớp, xuất
  CSV, và chính cột "Đơn chờ" vừa làm. Kế hoạch này suy luận là nó đạt, nhưng
  **chưa ai đo** — và `laGiaoVien()` gọi `get()` bên trong một phép `list`, đúng
  chỗ tôi không dám chắc. Đây là phép duy nhất đo được nó trước khi Publish.
- **Phép 19** là mặt sau của 18. Ra ✅ thì học sinh đọc được hồ sơ toàn hệ thống,
  và cả quyết định "bỏ `getUsers()` cho học sinh" ở Việc 3 thành vô nghĩa.
- **Phép 20 là đường Duyệt.** Sai là `approveJoinRequest` chết và cả đợt 2b vô
  nghĩa. Bảng cũ chỉ thử `create` của giáo viên (phép 13), chưa thử `update` lần
  nào.
- **Phép 21** đo vế `laGiaoVien() && !hasAny(['role'])` ở nhánh `update` — chưa
  phép nào chạm tới. Sai là giáo viên phong admin cho một tài khoản mình tạo rồi
  đăng nhập bằng nó.

**Phép 4 phải chạy trên một tài khoản học sinh CŨ**, không phải tài khoản vừa
tạo. Luật `progress` so `request.auth.token.email` với id tài liệu, mà id đó lấy
từ **trường `email` của hồ sơ** đã `toLowerCase`. Tài khoản mới thì hai thứ chắc
chắn khớp vì cùng do `createAccountWithFirestore` sinh ra; 15 hồ sơ đánh lại khoá
ở đợt 1 mới là chỗ có thể lệch — và lệch thì em đó **mất sạch tiến độ học**.

**Bảng này đã được viết lại ngày 12/09/2026** sau khi lần soát Việc 2 tìm ra hai
lỗ hổng trong bản luật đầu. Ba dòng 11-13 thay cho một dòng "giáo viên tạo
`/users`" cũ, vì luật nay **phân biệt giáo viên thuần với quản trị**: giáo viên
chỉ tạo được tài khoản học sinh, còn tạo tài khoản giáo viên là việc của quản
trị. Dòng 16 là dòng mới hoàn toàn.

**Ba vai cần chuẩn bị sẵn uid + email THẬT** (Authentication → Users → cột User
UID). "Giáo viên thuần" phải là hồ sơ có đúng `role: "teacher"` — lấy một
`school_admin` hay `admin` là phép 12 ra ✅ và bảng vô nghĩa.

Sáu phép quan trọng nhất, và sai mỗi phép thì hỏng chuyện gì:

- **Phép 1** — sai là đồng bộ đêm chết âm thầm. Web vẫn đúng vì nó đọc thẳng
  Firestore; chỉ bản chụp trong git lệch dần, không ai biết.
- **Phép 11** — sai là quản trị không tạo được tài khoản cho giáo viên, tức nhà
  trường mất chức năng chính.
- **Phép 12** — sai là một giáo viên tự nâng mình thành admin. Đây là lỗ hổng
  lần soát vừa tìm ra; phép này là bằng chứng nó đã bị bịt.
- **Phép 13** — sai là giáo viên không tạo được tài khoản cho học sinh lớp mình.
  Cặp 12-13 phải ra NGƯỢC nhau; cùng ✅ hay cùng ❌ đều là luật sai.
- **Phép 14** — cửa bên cạnh. Sai là ai cũng tự phong mình làm admin.
- **Phép 16** — cửa sau thứ hai. Dự án có HAI dấu hiệu thuộc lớp (`classId` và
  `joinedClassId`); khoá một cái mà quên cái kia thì học sinh vẫn tự chui vào
  bảng tiến độ lớp của giáo viên.

- [ ] **Bước 1: Dán luật mới vào ô soạn thảo, CHƯA Publish**
- [ ] **Bước 2: Chạy đủ 24 phép (18 và 19 không mô phỏng được — xem ghi chú), ghi lại phép nào lệch**
- [ ] **Bước 3: Lệch một phép thôi cũng DỪNG — báo số phép và kết quả thật**
- [ ] **Bước 4: Đúng cả 22 phép mô phỏng được thì Publish**

---

### Task 8: Thử tay ba vai, rồi tài liệu

- [ ] **Bước 1: Thử vai học sinh (cửa sổ ẩn danh)**

Đăng ký một tài khoản mới KÈM mã lớp thật → phải vào thẳng được ứng dụng, không
bị văng ra màn đăng nhập. Rồi đăng nhập một tài khoản học sinh cũ chưa có lớp,
nhập mã ở Dashboard → phải báo "Đã gửi đơn… chờ giáo viên duyệt".

- [ ] **Bước 2: Thử vai giáo viên**

Mở màn quản lý lớp → thấy chip "N đơn chờ" → bấm → thấy đúng hai em trên → bấm
Duyệt một em, Từ chối một em. Em được duyệt phải hiện trong sổ lớp.

- [ ] **Bước 3: Thử vai quản trị**

Đăng nhập tài khoản admin, mở màn quản trị, xác nhận danh sách người dùng vẫn
tải đầy đủ (học sinh thì `users` rỗng là ĐÚNG, admin thì phải đủ).

- [ ] **Bước 4: Kiểm đồng bộ ngân hàng**

```bash
npm run kiem-tra:dong-bo
```

Báo "Firestore 0 câu" thì ĐỪNG hoảng — đã biết: Zscaler chặn kênh của Firebase
SDK và SDK trả về rỗng thay vì báo lỗi. Kiểm chéo bằng REST trước khi kết luận.

- [ ] **Bước 5: Cập nhật `CLAUDE.md`**

Trong mục "Vài điểm dễ vấp", thêm vào khối Auth:

```
  5. **Học sinh không tự vào lớp được.** Nhập mã mời chỉ ghi `pendingClassCode`
     lên hồ sơ của chính em; giáo viên bấm Duyệt trong `ClassManagement` thì
     GIÁO VIÊN mới ghi `classId` và `classes.studentIdentifiers`. Luật Firestore
     chặn học sinh chạm vào `classes`, và chặn cả `classId`/`schoolId` trên hồ
     sơ của chính mình — bỏ vế sau là còn nguyên cửa sau.
  6. **`users` không tải cho học sinh.** Truy vấn không ràng buộc trên `users`
     bị luật từ chối với vai học sinh, đó là CHỦ Ý. Sáu tệp dùng mảng `users`
     đều là màn giáo viên/quản trị. Viết màn học sinh mà cần `users` là thiết
     kế sai, không phải luật sai.
```

Trong mục "An ninh", đổi câu "Lỗ hổng CÒN LẠI" cho khớp: đợt 2 đã publish, và
ghi lại bốn phát hiện của đợt 2b.

Trong mục "Lệnh", sửa số mục của `npm run kiem-tra` cho khớp số thật vừa chạy.

- [ ] **Bước 6: Kiểm lần cuối rồi commit**

```bash
npm run lint
npm run kiem-tra
git add -A
git commit -m "Dot 2b/8: tai lieu hoa don xin vao lop va bon phat hien cua dot

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Tự soát lại kế hoạch

**Phủ spec:** bốn phát hiện của spec → Task 2 (phát hiện 1), Task 3 bước 2
(phát hiện 2 và 4), Task 3 bước 3 + Task 4 (phát hiện 3). Khiếm khuyết phép
kiểm → Task 1. Luật `users` mới → Task 2 bước 4. Cách nghiệm thu → Task 6, 7, 8.

**Chỗ kế hoạch này biết là mình chưa chắc:** thứ tự đánh giá truy vấn danh sách
của Firestore với `match /users/{userId}` là suy luận từ tài liệu, chưa đo. Nếu
ở Task 8 bước 3 mà admin cũng không tải được `users`, thì `laGiaoVien()` gọi
`get()` bên trong một phép `list` là chỗ phải xem lại đầu tiên.

**Nhất quán tên:** `pendingClassCode` dùng y hệt ở `types.ts`, `firestoreAuth.ts`,
`firestoreService.clearPendingClassCode`, `AppContext`, `ClassManagement`, và
trong luật thì KHÔNG nhắc tới (nó được phép sửa, nên không cần tên trong luật).
`approveJoinRequest` / `rejectJoinRequest` dùng y hệt ở Task 4 bước 1, 2, 4.
