# Đợt 2c — Chọn lớp từ danh sách, và cổng đăng nhập

> **Cho người thực thi:** dùng kỹ năng `executing-plans` hoặc
> `subagent-driven-development`. Mỗi bước có ô đánh dấu `- [ ]`. Mã trong kế
> hoạch là mã THẬT, đã đối chiếu với tệp hiện tại ngày 12/09/2026 — đừng tự nghĩ
> ra mã khác.

**Mục tiêu:** Học sinh bấm chọn lớp từ danh sách thay vì gõ mã 6 ký tự; ô mã lớp
biến mất khỏi màn đăng ký; và vào web là luôn dừng ở màn đăng nhập, có nút
"Tiếp tục với \<email\>" khi phiên còn sống.

**Cách làm:** KHÔNG đổi cơ chế bên dưới. Chọn lớp xong vẫn gọi đúng hàm
`joinClassByCode(inviteCode)` đang chạy, vì `pendingClassCode` là trường duy nhất
luật Firestore cho học sinh ghi. Cổng đăng nhập gom việc điều hướng về MỘT chỗ
(`LoginPage`) để hết cảnh hai chỗ chạy đua.

**Ngăn xếp:** React 19 + Vite 6 + TypeScript 5.8 + MUI v9, Firestore.

**Spec:** `docs/superpowers/specs/2026-09-12-chon-lop-va-cong-dang-nhap-design.md`

## Ràng buộc toàn cục

- **KHÔNG đụng một dòng nào trong `firestore.rules`.** Luật vừa publish
  12/09/2026 và đã qua 24 phép thử.
- Không tạo collection mới, không thêm trường mới. `pendingClassCode` vẫn là cơ
  chế — chỉ đổi cách nhập.
- Trong `.tsx` KHÔNG viết mã màu cứng `#rrggbb`; luôn `var(--ten-bien)`, và tên
  biến phải có thật trong `src/index.css`. `npm run kiem-tra:mau` bắt cả tên gõ
  nhầm.
- Hễ có biến `--X-nen` thì `--X` CHỈ dùng cho màu chữ, không làm màu nền.
- Góc vuông (`borderRadius: 0`), dựng bằng nét kẻ, không bóng đổ.
- Đỏ tín hiệu (`--tin-hieu`) chỉ cho hành động chính, lỗi thật, trạng thái đang
  chọn. Trạng thái đang dở dùng vàng cảnh báo.
- MUI v9: `Grid` dùng `size={{ xs, sm, md }}`.
- Không tự chạy `npm run build`, git nguy hiểm, push, deploy — chủ dự án tự làm.
- Dự án KHÔNG có Vitest/Jest và không được dựng khung test mới. "Chạy test" =
  `npx tsc --noEmit` và `npm run kiem-tra`.
- Sau mỗi lần sửa tệp: `grep` lại chuỗi vừa đặt vào. Đừng tin thông báo.

## Môi trường — chỗ dễ mất thời gian nhất

1. **PATH của Bash trên máy này hỏng.** Mọi lệnh Bash phải mở đầu bằng:
   `export PATH="/c/Users/vi.nguyen/AppData/Local/Programs/Git/usr/bin:/c/Users/vi.nguyen/AppData/Local/Programs/Git/bin:/c/Users/vi.nguyen/AppData/Local/Programs/node:$PATH"`
2. Node trên Windows không nhận `/c/Users/...`, dùng `C:/Users/...`.
3. **Tệp trong repo dùng CRLF** — Read tệp rồi chép đúng chuỗi đang có vào
   `old_string`, đừng gõ lại từ trí nhớ.

## Cấu trúc tệp

| Tệp | Trách nhiệm sau đợt này |
|---|---|
| `src/features/auth/components/JoinClassForm.tsx` | Ô **chọn lớp** + trạng thái chờ duyệt. Không còn ô gõ mã. |
| `src/features/auth/components/StudentRegisterForm.tsx` | Đăng ký gọn: họ tên, email, mật khẩu. Không còn ô mã lớp. |
| `src/core/contexts/AppContext.tsx` | `registerStudent(name, email, password)` — không còn tham số mã. |
| `src/App.tsx` | `/` → `/login`. |
| `src/core/components/RouteGuards.tsx` | `PublicRoute` thôi điều hướng. |
| `src/pages/LoginPage.tsx` | **Chỗ DUY NHẤT** điều hướng sau đăng nhập, theo vai. Thêm panel "Tiếp tục với \<email\>". |

## Thứ tự KHÔNG được đảo

    1 chọn lớp  ->  2 bỏ ô mã ở đăng ký  ->  3 cổng đăng nhập
    ->  4 BUILD + DEPLOY + THỬ TAY        <- CỔNG, chủ dự án làm

Việc 3 chạm đường đăng nhập của mọi người. Làm nó sau cùng để nếu hỏng thì biết
chắc lỗi đến từ đâu.

---

### Task 1: Chọn lớp từ danh sách

**Tệp:**
- Sửa: `src/features/auth/components/JoinClassForm.tsx`

**Giao diện:**
- Tiêu thụ: `joinClassByCode(code: string)` và `classes` từ `useApp()` — đã có
- Sinh ra: không

Học sinh đã đăng nhập **đọc được** `classes` (`allow read: if dangNhap()`), nên
danh sách dựng được ngay ở client. Chọn lớp xong vẫn gọi
`joinClassByCode(lop.inviteCode)` — **giữ nguyên cơ chế**, vì luật Firestore cấm
học sinh ghi `classId`, chỉ cho ghi `pendingClassCode`.

- [ ] **Bước 1: Đổi import**

Trong dòng import `@mui/material`, **bỏ** `InputAdornment` và **thêm**
`MenuItem`. `InputAdornment` chỉ được dùng trong ô gõ mã sắp xoá — để lại là lỗi
biên dịch vì dự án bật kiểm biến không dùng.

Kết quả phải là:

```typescript
import {
  Box, TextField, Button, Typography, Alert, Paper, MenuItem,
  CircularProgress, Collapse, IconButton,
} from '@mui/material';
```

- [ ] **Bước 2: Đổi state `code` thành `lopId`, thêm danh sách đã sắp**

Thay dòng

```typescript
  const [code, setCode]         = useState('');
```

bằng

```typescript
  const [lopId, setLopId]       = useState('');
```

rồi ngay sau khối tính `pendingCode`, thêm:

```typescript
  /* Sắp theo tên để danh sách đọc được: 11A1, 11A2… rồi 11B1, 11H.
     `localeCompare` với 'vi' để tên có dấu không nhảy lung tung. */
  const dsLop = [...classes].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
```

- [ ] **Bước 3: Đổi phần đầu `handleJoin`**

Thay hai dòng đầu của `handleJoin`

```typescript
    if (!code.trim()) { setError('Vui lòng nhập mã lớp.'); return; }
```

bằng

```typescript
    const lop = classes.find(c => c.id === lopId);
    if (!lop) { setError('Vui lòng chọn lớp của bạn.'); return; }
    /* Mã mời vẫn là cơ chế gửi đơn — luật Firestore chỉ cho học sinh ghi
       `pendingClassCode`, không cho ghi `classId`. Lớp thiếu mã là dữ liệu
       lệch, phải nói rõ chứ đừng gửi đơn rỗng. */
    if (!lop.inviteCode) {
      setError(`Lớp "${lop.name}" chưa có mã mời. Nhờ giáo viên tạo lại lớp.`);
      return;
    }
```

rồi đổi lời gọi

```typescript
    const res = await joinClassByCode(code.trim());
```

thành

```typescript
    const res = await joinClassByCode(lop.inviteCode);
```

**Giữ nguyên toàn bộ phần còn lại của `handleJoin`** — nhánh thành công, `setSuccess`,
`onJoined`, `setLoading(false)`. Đừng viết lại chúng.

- [ ] **Bước 4: Đổi tiêu đề và lời dẫn của khối nhập**

Thay

```
              Bạn có mã lớp do giáo viên cấp?
```

bằng

```
              Bạn học lớp nào?
```

và thay đoạn lời dẫn

```
              Nhập mã lớp để xin vào lớp. Giáo viên duyệt xong thì thầy cô mới theo
              dõi được tiến độ học. Lịch sử học hiện tại sẽ được giữ nguyên.
```

bằng

```
              Chọn lớp của bạn rồi gửi đơn. Giáo viên duyệt xong thì thầy cô mới
              theo dõi được tiến độ học. Lịch sử học hiện tại sẽ được giữ nguyên.
```

- [ ] **Bước 5: Thay ô gõ mã bằng ô chọn lớp**

Xoá **toàn bộ** khối `<TextField id="join-class-code-input" … />` (từ dòng
`<TextField` tới `/>` đóng của nó, gồm cả `slotProps` và `sx`), thay bằng:

```tsx
              <TextField
                id="join-class-select"
                select
                size="small"
                label="Chọn lớp"
                value={lopId}
                onChange={e => setLopId(e.target.value)}
                disabled={loading || dsLop.length === 0}
                helperText={dsLop.length === 0 ? 'Đang tải danh sách lớp…' : ' '}
                sx={{
                  minWidth: 240,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    '&.Mui-focused fieldset': { borderColor: 'var(--luc-tham)' },
                  },
                }}
              >
                {dsLop.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </TextField>
```

- [ ] **Bước 6: Đổi điều kiện vô hiệu của nút gửi**

Thay

```tsx
                disabled={loading || code.length < 4}
```

bằng

```tsx
                disabled={loading || !lopId}
```

- [ ] **Bước 7: Cập nhật khối chú thích đầu component**

Trong JSDoc của `JoinClassForm`, thay câu
`Cho phép nhập mã lớp để gửi đơn xin vào lớp (chờ giáo viên duyệt).`
bằng:

```
 * Cho phép CHỌN lớp từ danh sách rồi gửi đơn xin vào lớp (chờ giáo viên duyệt).
 * Đổi từ "gõ mã 6 ký tự" sang "chọn lớp" ngày 12/09/2026: mã sinh tự động
 * (X22P43, SDSAPT…) không ai đoán được, nên học sinh phải được đọc cho mới vào
 * được lớp. Bên dưới KHÔNG đổi — vẫn gửi `inviteCode` của lớp đã chọn, vì luật
 * Firestore chỉ cho học sinh ghi `pendingClassCode`, không cho ghi `classId`.
```

- [ ] **Bước 8: Kiểm và commit**

```bash
npx tsc --noEmit
npm run kiem-tra:mau
```

Mong đợi: `tsc` không in gì (exit 0); `kiem-tra:mau` TẤT CẢ ĐẠT.

Rồi `grep` xác nhận không còn dấu vết ô gõ mã:

```bash
grep -n "join-class-code-input\|InputAdornment\|code.length" src/features/auth/components/JoinClassForm.tsx
```

Mong đợi: **không có dòng nào**.

```bash
git add src/features/auth/components/JoinClassForm.tsx
git commit -m "Dot 2c/1: hoc sinh CHON lop tu danh sach thay vi go ma 6 ky tu

Ma sinh tu dong (X22P43, SDSAPT, MZQ72E) khong ai doan duoc, nen hoc sinh
phai duoc doc cho moi vao duoc lop. Nay chon tu danh sach.

Ben duoi KHONG doi: van goi joinClassByCode(lop.inviteCode). Luat Firestore
chi cho hoc sinh ghi pendingClassCode, khong cho ghi classId — doi co che la
phai mo lai luat vua publish.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Bỏ ô mã lớp ở màn đăng ký

**Tệp:**
- Sửa: `src/features/auth/components/StudentRegisterForm.tsx`
- Sửa: `src/core/contexts/AppContext.tsx` (khai báo trong `interface`, thân hàm,
  và khoá trong object `value` của Provider)

**Giao diện:**
- Tiêu thụ: không
- Sinh ra: `registerStudent(name: string, email: string, password: string) =>
  Promise<{ success: boolean; message: string; user?: User }>` — thay cho
  `registerWithOptionalClass(name, email, password, inviteCode?)`

Màn đăng ký chạy khi **chưa đăng nhập**, nên nó không đọc được `classes` — không
có cách nào cho chọn lớp ở đó. Bỏ hẳn ô mã: đăng ký cho gọn, vào rồi mới chọn lớp.

- [ ] **Bước 1: Xoá state `inviteCode`**

Trong `StudentRegisterForm.tsx`, xoá dòng

```typescript
  const [inviteCode, setInviteCode] = useState('');
```

- [ ] **Bước 2: Xoá tham số thứ tư ở lời gọi, và đổi tên hàm**

Tìm lời gọi `registerWithOptionalClass(` và xoá đối số cuối
`inviteCode.trim() || undefined`, đồng thời đổi tên hàm thành `registerStudent`.
Nhớ xoá cả dấu phẩy của đối số trước nó, và đổi cả dòng lấy hàm ra từ
`useApp()`.

- [ ] **Bước 3: Xoá khối "Mã lớp (tùy chọn)"**

Xoá **toàn bộ** khối JSX bắt đầu bằng chú thích

```
          {/* Mã lớp (tùy chọn) */}
```

cho tới thẻ `</Box>` đóng của khối đó. Khối này chứa `TextField` mã lớp và mọi
chỗ dùng `inviteCode` để đổi màu viền/nền.

- [ ] **Bước 4: Đổi nhãn nút gửi**

Thay

```tsx
            {loading
              ? 'Đang tạo tài khoản...'
              : inviteCode
                ? 'Đăng ký & gửi đơn vào lớp'
                : 'Đăng ký học tự do'
            }
```

bằng

```tsx
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
```

- [ ] **Bước 5: Đổi lời dẫn đầu form**

Thay dòng

```
        Có mã lớp do giáo viên cấp? Điền vào bên dưới để gửi đơn xin vào lớp.
```

bằng

```
        Đăng ký xong, vào mục Học sinh để chọn lớp của bạn.
```

- [ ] **Bước 6: Dọn import không còn dùng**

Chạy `npx tsc --noEmit`. Nếu nó báo biểu tượng nào (ví dụ `School`) hoặc thành
phần MUI nào không còn được dùng, xoá khỏi dòng import. **Đừng đoán** — để `tsc`
chỉ ra.

- [ ] **Bước 7: Đổi tên hàm trong `AppContext.tsx`**

Ba chỗ, đổi `registerWithOptionalClass` thành `registerStudent`:

1. khai báo trong `interface` của context (khoảng dòng 249)
2. `const registerWithOptionalClass = async (` — thân hàm
3. khoá trong object truyền cho `<AppContext.Provider value={{ … }}>`

Trong khai báo ở `interface`, **xoá tham số `inviteCode`**. Chữ ký mới:

```typescript
  registerStudent: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string; user?: User }>;
```

- [ ] **Bước 8: Bỏ tham số và phần ghi `pendingClassCode` trong thân hàm**

Trong thân hàm `registerStudent`:

- xoá tham số `inviteCode?: string` khỏi danh sách tham số
- xoá khối tính `maXinVaoLop` (cùng chú thích của nó)
- xoá `pendingClassCode: maXinVaoLop,` khỏi lời gọi `createAccountWithFirestore`
- xoá `pendingClassCode: maXinVaoLop,` khỏi object `newUser`
- đổi phần trả về cuối hàm thành:

```typescript
    return { success: true, message: 'Tạo tài khoản thành công!', user: newUser };
```

Rồi thêm chú thích này ngay trên hàm:

```typescript
  /* Đăng ký học sinh tự do. KHÔNG nhận mã lớp nữa (12/09/2026): màn đăng ký
     chạy khi chưa đăng nhập nên không đọc được `classes`, không có cách nào cho
     chọn lớp ở đó. Học sinh vào rồi chọn lớp ở tab Học sinh.
     GHI CHÚ MÃ CHẾT: hàm `register` phía trên nay gần trùng hàm này và không có
     ai gọi. Để lại theo quy ước "thấy mã chết thì nhắc chứ đừng xoá". */
```

- [ ] **Bước 9: Kiểm và commit**

```bash
npx tsc --noEmit
npm run kiem-tra
```

Mong đợi: `tsc` exit 0; `kiem-tra` 11/11 bộ, 0 mục SAI.

```bash
grep -rn "registerWithOptionalClass\|inviteCode" src/features/auth/components/StudentRegisterForm.tsx src/core/contexts/AppContext.tsx
```

Mong đợi: **không còn** `registerWithOptionalClass`; `inviteCode` chỉ còn xuất
hiện ở chỗ `joinClassByCode` tra mã trong `classes` (nếu có), không còn trong
`StudentRegisterForm.tsx`.

```bash
git add src/features/auth/components/StudentRegisterForm.tsx src/core/contexts/AppContext.tsx
git commit -m "Dot 2c/2: bo o ma lop khoi man dang ky, doi ten thanh registerStudent

Man dang ky chay khi CHUA dang nhap nen khong doc duoc `classes` — khong co
cach nao cho chon lop o do. Bo han o ma: dang ky cho gon, vao roi moi chon lop
o tab Hoc sinh.

Doi ten registerWithOptionalClass -> registerStudent: bo tham so ma roi thi cai
ten cu noi doi, va ten noi doi la thu bay nguoi sau.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Cổng đăng nhập — luôn dừng ở màn đăng nhập

**Tệp:**
- Sửa: `src/App.tsx` (khối `<Routes>`)
- Sửa: `src/core/components/RouteGuards.tsx` (`PublicRoute`)
- Sửa: `src/pages/LoginPage.tsx`

**Giao diện:**
- Tiêu thụ: `currentUser`, `logout` từ `useApp()` — đã có
- Sinh ra: không

**ĐÂY LÀ VIỆC RỦI RO NHẤT CỦA ĐỢT.** Sai là không ai đăng nhập được, hoặc mọi
vai bị đổ vào màn học sinh.

Hiện trạng đo được: `PublicRoute` điều hướng theo vai, **và** `LoginPage`
`navigate('/dashboard')` cứng — hai chỗ đang chạy đua. Bỏ `PublicRoute` mà không
sửa `LoginPage` thì giáo viên và quản trị vào sai trang.

- [ ] **Bước 1: `/` trỏ sang `/login`**

Trong `src/App.tsx`, **xoá** dòng nằm trong khối `<Route element={<ProtectedRoute />}>`:

```tsx
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
```

rồi thêm route này làm con trực tiếp của `<Routes>`, ngay trước khối
`<Route element={<PublicRoute />}>`:

```tsx
            {/* Vào web là LUÔN dừng ở màn đăng nhập — chủ dự án chốt 12/09/2026.
                Còn phiên thì `LoginPage` hiện nút "Tiếp tục với <email>", chứ
                KHÔNG tự nhảy vào trong. Để route này ngoài mọi thẻ canh để nó
                không phải chờ màn "đang tải" của `ProtectedRoute`. */}
            <Route path="/" element={<Navigate to="/login" replace />} />
```

- [ ] **Bước 2: `PublicRoute` thôi điều hướng**

Trong `src/core/components/RouteGuards.tsx`, thay toàn bộ `PublicRoute` bằng:

```tsx
/**
 * PublicRoute – trang công khai (Login).
 *
 * KHÔNG còn đá người đã đăng nhập sang trang theo vai. Chủ dự án chốt
 * 12/09/2026: vào web là luôn dừng ở màn đăng nhập.
 *
 * Việc điều hướng sau khi đăng nhập nay nằm HẲN ở `LoginPage` — trước đây
 * `PublicRoute` và `LoginPage.handleSuccess` cùng điều hướng và chạy đua nhau,
 * nên `handleSuccess` đổ mọi vai vào `/dashboard` mà không ai thấy, vì
 * `PublicRoute` thường thắng. Một chỗ thì không đua với ai.
 */
export const PublicRoute: React.FC = () => {
  const { loading } = useApp();
  if (loading) return <LoadingScreen />;
  return <Outlet />;
};
```

Nếu `tsc` báo `currentUser` không còn dùng ở tệp này, đó là đúng — đã xoá khỏi
`useApp()` ở trên rồi.

- [ ] **Bước 3: `LoginPage` — thêm `useEffect` và hàm đường-theo-vai**

Trong `src/pages/LoginPage.tsx`, đổi dòng import React thành:

```typescript
import React, { useState, useEffect } from 'react';
```

Thêm hàm này ở cấp tệp, ngay trên `export const LoginPage`:

```typescript
/** Trang chủ theo vai. Phải khớp với các thẻ canh trong `RouteGuards.tsx`. */
const duongTheoVai = (role?: string) => {
  if (role === 'admin') return '/admin';
  if (role === 'school_admin') return '/school-admin';
  if (role === 'teacher') return '/teacher';
  return '/dashboard';
};
```

- [ ] **Bước 4: Thay `handleSuccess` bằng cờ + `useEffect`**

Trong thân `LoginPage`, thêm `currentUser` và `logout` vào `useApp()`, rồi thay

```typescript
  const handleSuccess = () => navigate('/dashboard');
```

bằng

```typescript
  /* Cờ "người dùng đã bấm vào". Vì sao phải chờ bằng useEffect chứ không điều
     hướng ngay trong handleSuccess: `login()` gọi
     signInWithEmailAndPassword, còn hồ sơ (có `role`) về SAU qua
     onAuthStateChanged. Lúc handleSuccess chạy, `currentUser` vẫn còn null —
     điều hướng ngay là đổ MỌI vai vào /dashboard, đúng lỗi bản cũ mắc phải. */
  const [dangVao, setDangVao] = useState(false);

  useEffect(() => {
    if (dangVao && currentUser) {
      navigate(duongTheoVai(currentUser.role), { replace: true });
    }
  }, [dangVao, currentUser, navigate]);

  const handleSuccess = () => setDangVao(true);
```

Cũng đổi `handleGoogleRegisterSuccess`: thay `navigate('/dashboard')` bằng
`setDangVao(true)`.

**Giữ nguyên** `handleContinueAsGuest = () => navigate('/dashboard')` — khách
vãng lai không có hồ sơ nên không chờ được `currentUser`.

- [ ] **Bước 5: Thêm panel "Tiếp tục với \<email\>"**

Trong `renderFormContent`, thêm nhánh này **ngay trước** `switch (view)`:

```tsx
    /* Phiên còn sống: KHÔNG tự nhảy vào trong, hiện nút để người dùng tự bấm.
       Đây là nửa "luôn lưu phiên" của yêu cầu — không phải nhập lại mật khẩu. */
    if (currentUser && !dangVao) {
      return (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', mb: 0.5 }}>
            Chào mừng trở lại
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Bạn đang đăng nhập bằng <strong>{currentUser.email}</strong>.
          </Typography>
          <Button
            id="continue-session-btn"
            variant="contained"
            size="large"
            fullWidth
            onClick={() => setDangVao(true)}
            startIcon={<UserCheck size={18} />}
            sx={{
              py: 1.5, borderRadius: 0, fontWeight: 'bold',
              textTransform: 'none', boxShadow: 'none',
              '&:hover': { boxShadow: 'none' },
            }}
          >
            Tiếp tục với {currentUser.name || currentUser.email}
          </Button>
          <Button
            id="switch-account-btn"
            variant="text"
            size="small"
            fullWidth
            onClick={() => { void logout(); }}
            sx={{ mt: 1.5, borderRadius: 0, textTransform: 'none', color: 'var(--chu-2)' }}
          >
            Đăng nhập bằng tài khoản khác
          </Button>
        </Box>
      );
    }
```

`UserCheck` đã có trong dòng import `lucide-react` của tệp này — không phải thêm.

- [ ] **Bước 6: Ẩn tiêu đề "Đăng nhập tài khoản" khi đang hiện panel**

Khối tiêu đề đang là `{view === 'login' && (`. Nếu để nguyên, nó hiện chữ "Đăng
nhập tài khoản" ngay trên panel "Chào mừng trở lại" — hai tiêu đề chồng nhau.
Đổi điều kiện thành:

```tsx
            {view === 'login' && !(currentUser && !dangVao) && (
```

- [ ] **Bước 7: Kiểm**

```bash
npx tsc --noEmit
npm run kiem-tra
```

Mong đợi: `tsc` exit 0; `kiem-tra` 11/11 bộ, 0 mục SAI.

```bash
grep -n "Navigate to=\"/dashboard\"\|Navigate to=\"/login\"" src/App.tsx
grep -n "currentUser" src/core/components/RouteGuards.tsx
```

Mong đợi: `App.tsx` có `/login`, **không còn** dòng `/` trỏ `/dashboard`;
`RouteGuards.tsx` vẫn dùng `currentUser` ở các thẻ canh vai (`TeacherRoute`,
`SuperAdminRoute`…) nhưng **không** ở `PublicRoute`.

- [ ] **Bước 8: Commit**

```bash
git add src/App.tsx src/core/components/RouteGuards.tsx src/pages/LoginPage.tsx
git commit -m "Dot 2c/3: luon dung o man dang nhap, kem nut Tiep tuc voi <email>

Chu du an chot: vao web la luon vao trang dang nhap truoc, VA luon luu phien
cuoi. Hai yeu cau nghe mau thuan nhung khong — chi la them mot buoc bam tuong
minh, khong phai nhap lai mat khau.

Ba cho doi:
  App.tsx        `/` -> `/login`, va dua route do ra ngoai moi the canh
  PublicRoute    thoi dieu huong; chi con man \"dang tai\"
  LoginPage      NOI DUY NHAT dieu huong sau dang nhap, va theo VAI

Cai bay da tranh: PublicRoute va LoginPage.handleSuccess dang CHAY DUA. Bo
PublicRoute ma khong sua handleSuccess thi giao vien va quan tri bi do het vao
/dashboard. Va handleSuccess KHONG doc duoc vai ngay — login() goi
signInWithEmailAndPassword, con ho so ve sau qua onAuthStateChanged. Nen dung
mot co \"da bam vao\" cong useEffect cho currentUser xuat hien.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: CỔNG — build, deploy, thử tay

**Chủ dự án làm.** Không giao cho subagent.

- [ ] **Bước 1: Build**

```bash
npm run build
```

- [ ] **Bước 2: Kéo thả `dist/` lên Netlify**

- [ ] **Bước 3: Thử tay, cửa sổ ẩn danh**

| Thử | Phải ra |
|---|---|
| Mở web (chưa đăng nhập) | Dừng ở màn đăng nhập |
| Đăng nhập **học sinh** | Vào `/dashboard` |
| Đăng nhập **giáo viên** | Vào `/teacher` — **không** phải `/dashboard` |
| Đăng nhập **quản trị** | Vào `/admin` — **không** phải `/dashboard` |
| Mở lại web khi còn phiên | Màn đăng nhập + nút "Tiếp tục với \<email\>" |
| Bấm "Tiếp tục" | Vào đúng trang theo vai |
| Bấm "Đăng nhập bằng tài khoản khác" | Về form đăng nhập trống |
| Màn đăng ký | **Không còn** ô "Mã lớp" |
| Tab Học sinh, chưa có lớp | Ô **chọn lớp** với 9 lớp thật |
| Chọn 11A4 → Gửi đơn | Báo đã gửi, chờ duyệt |
| Màn quản lý lớp của thầy | Cột "Đơn chờ" hiện đơn ở 11A4 |

**Ba dòng vai giữa là quan trọng nhất.** Sai là giáo viên và quản trị mất đường
vào màn của mình, mà `tsc` không bắt được lỗi đó.

- [ ] **Bước 4: Cập nhật `CLAUDE.md`**

Mục "Vào lớp bằng mã mời nay là ĐƠN CHỜ DUYỆT" phải nói thêm: học sinh **chọn
lớp từ danh sách**, không gõ mã; ô mã ở màn đăng ký đã bỏ; và ràng buộc 4-6 ký
tự nay chỉ còn liên quan tới người **tạo** lớp, không còn tới học sinh.

Thêm một mục về cổng đăng nhập: `/` → `/login`; `PublicRoute` không điều hướng;
`LoginPage` là chỗ duy nhất điều hướng sau đăng nhập và điều hướng **theo vai**;
và vì sao phải chờ `currentUser` bằng `useEffect`.
