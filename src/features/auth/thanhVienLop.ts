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

/**
 * Tên riêng của một người — chữ CUỐI trong họ tên.
 *
 * Sổ điểm Việt Nam xếp theo TÊN chứ không theo họ: "Nguyễn Gia Bảo" nằm ở vần
 * B, không phải vần N. Xếp theo cả chuỗi họ tên là ra một danh sách toàn họ
 * Nguyễn đứng đầu — không cô nào dò được.
 */
function tenRieng(hoTen: string): string {
  const phan = (hoTen || '').trim().split(/\s+/).filter(Boolean);
  return phan.length ? phan[phan.length - 1] : '';
}

/**
 * Thứ tự hai học sinh trong mọi danh sách lớp.
 *
 * Ưu tiên SỐ BÁO DANH. Đó là thứ tự do nhà trường chốt (khớp sổ điểm và bảng
 * danh sách lớp), nên không có quy tắc chữ nghĩa nào thay thế được.
 *
 * Em chưa có số thì xếp SAU, theo tên riêng rồi tới cả họ tên, so bằng vần
 * tiếng Việt (`localeCompare('vi')` — thứ biết A < Ă < Â và phân biệt dấu).
 *
 * Vì sao phải thêm nhánh này (23/09/2026): bản cũ chỉ so `studentNumber ?? 999`.
 * Đo trên lớp 11A3 hôm đó, **0/38 em có số báo danh**, nên mọi em đều là 999,
 * phép `sort` không đổi chỗ ai, và danh sách hiện ra theo đúng thứ tự Firestore
 * trả về — tức theo id tài liệu, tức ngẫu nhiên với người đọc. Cô dò tên trong
 * một danh sách 38 em không thứ tự.
 */
export function soSanhHocSinh(a: User, b: User): number {
  const sa = a.studentNumber;
  const sb = b.studentNumber;
  if (typeof sa === 'number' && typeof sb === 'number') return sa - sb;
  if (typeof sa === 'number') return -1;
  if (typeof sb === 'number') return 1;

  const theoTen = tenRieng(a.name).localeCompare(tenRieng(b.name), 'vi');
  if (theoTen !== 0) return theoTen;
  /* Trùng tên riêng ("Thiên Kim" và "Thiên Kim") thì so cả họ tên, để thứ tự
     ổn định giữa hai lần mở trang. */
  return (a.name || '').localeCompare(b.name || '', 'vi');
}

/**
 * Danh sách học sinh của lớp, đã xếp theo số báo danh; em chưa có số xếp cuối
 * và sắp theo tên. Xem `soSanhHocSinh`.
 */
export function hocSinhCuaLop(
  users: User[],
  cls: Pick<SchoolClass, 'id' | 'studentIdentifiers'>,
): User[] {
  return users.filter(u => laThanhVienLop(u, cls)).sort(soSanhHocSinh);
}

/** Sĩ số thật của lớp — đếm theo cùng một luật với danh sách hiện ra. */
export function siSoLop(
  users: User[],
  cls: Pick<SchoolClass, 'id' | 'studentIdentifiers'>,
): number {
  return users.filter(u => laThanhVienLop(u, cls)).length;
}
