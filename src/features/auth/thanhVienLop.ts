// ─── Ai thuộc lớp nào — MỘT chỗ trả lời, mọi màn hình đọc từ đây ─────────────
//
// Vì sao cần tệp này (21/09/2026): danh sách lớp của giáo viên và của quản trị
// đều tự lọc lấy, và cả hai chỉ soi đúng `classes.studentIdentifiers`. Hồ sơ
// học sinh lại có tới hai trường chỉ lớp — `classId` (giáo viên/quản trị xếp)
// và `joinedClassId` (em tự xin vào, giáo viên duyệt). Hai nguồn này lệch nhau
// là chuyện đã xảy ra thật: sửa lớp cho một em trong màn "Quản lý tài khoản"
// chỉ ghi `classId` lên hồ sơ, KHÔNG đụng tới `studentIdentifiers` của lớp —
// nên em có lớp A3 trên hồ sơ mà sĩ số lớp A3 vẫn đếm thiếu em, và tên em
// không hiện trong danh sách. Triệu chứng y hệt "học sinh vào lớp rồi mà
// không thấy đâu".
//
// Quy ước từ nay: đọc thành viên lớp thì hỏi `laThanhVienLop`, nó nhận em qua
// BẤT KỲ đường nào trong ba đường. Còn khi GHI (xếp lớp, duyệt đơn, xoá khỏi
// lớp) thì vẫn phải cập nhật cả hai phía — hồ sơ và `studentIdentifiers` —
// để dữ liệu không lệch thêm; phần đó nằm ở `AppContext`.

import type { SchoolClass, User } from './types';

/** So khớp định danh (email hoặc username), bỏ qua hoa thường và khoảng trắng. */
const trung = (a?: string, b?: string): boolean => {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
};

/** Định danh dùng để ghi vào `classes.studentIdentifiers` cho một học sinh. */
export const dinhDanhHocSinh = (u: User): string => u.username || u.email;

/**
 * Em này có thuộc lớp `cls` không — nhận qua bất kỳ đường nào:
 *   1. `classId`        — giáo viên hoặc quản trị xếp lớp cho em;
 *   2. `joinedClassId`  — em tự xin vào và đã được duyệt;
 *   3. `studentIdentifiers` của lớp — danh sách phía lớp giữ.
 */
export function laThanhVienLop(
  u: User,
  cls: Pick<SchoolClass, 'id' | 'studentIdentifiers'>,
): boolean {
  if (cls.id && (u.classId === cls.id || u.joinedClassId === cls.id)) return true;
  return (cls.studentIdentifiers || []).some(
    id => trung(id, u.email) || trung(id, u.username),
  );
}

/** Danh sách học sinh của lớp, đã xếp theo số báo danh (em chưa có số xếp cuối). */
export function hocSinhCuaLop(
  users: User[],
  cls: Pick<SchoolClass, 'id' | 'studentIdentifiers'>,
): User[] {
  return users
    .filter(u => laThanhVienLop(u, cls))
    .sort((a, b) => (a.studentNumber ?? 999) - (b.studentNumber ?? 999));
}

/** Sĩ số thật của lớp — đếm theo cùng một luật với danh sách hiện ra. */
export function siSoLop(
  users: User[],
  cls: Pick<SchoolClass, 'id' | 'studentIdentifiers'>,
): number {
  return users.filter(u => laThanhVienLop(u, cls)).length;
}
