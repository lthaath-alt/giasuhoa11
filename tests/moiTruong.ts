import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Đọc `.env` rồi `.env.local` (tệp sau thắng, vì đó là bản riêng từng máy).
 *
 * Cố ý KHÔNG dùng lại `docEnv()` trong `scripts/ngan-hang-chung.mts`: tệp đó
 * `import` firebase và `firebaseCongKhai` ngay ở đầu, mà `playwright.config.ts`
 * được nạp trước mọi thứ khác — kéo cả SDK Firebase vào chỉ để đọc sáu dòng
 * text là đổi một rủi ro lấy một tiện. Sáu dòng dưới đây không có gì để lệch.
 *
 * TUYỆT ĐỐI không in giá trị đọc được ra màn hình: mật khẩu tài khoản thử đi
 * qua đây. `kiem-tra:an-ninh` canh điều đó.
 */
export function docEnvE2E(): Record<string, string> {
  const ra: Record<string, string> = {};
  for (const ten of ['.env', '.env.local']) {
    const p = join(GOC, ten);
    if (!existsSync(p)) continue;
    for (const dong of readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(dong);
      if (!m) continue;
      ra[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
  return ra;
}

/** Tài khoản học sinh dùng để thử. Thiếu thì các phép cần đăng nhập tự bỏ qua. */
export function taiKhoanThu(): { email: string; matKhau: string } | null {
  const env = docEnvE2E();
  const email = process.env.E2E_EMAIL || env.E2E_EMAIL || '';
  const matKhau = process.env.E2E_MATKHAU || env.E2E_MATKHAU || '';
  return email && matKhau ? { email, matKhau } : null;
}

/**
 * Tài khoản GIÁO VIÊN dùng để thử. Thiếu thì các phép cần nó tự bỏ qua.
 *
 * Dùng chung hai biến với `npm run sua:cau-hoi` (`GIAO_VIEN_EMAIL` /
 * `GIAO_VIEN_MATKHAU`) thay vì đẻ thêm cặp biến thứ ba: cùng một vai, cùng một
 * tệp `.env.local`, và mỗi biến phải khai thêm là một chỗ nữa để quên.
 *
 * Tài khoản này chỉ cần vai `teacher`. ĐỪNG dùng `admin` — xem lý do ở mục
 * `sua:cau-hoi` trong CLAUDE.md.
 */
export function taiKhoanGiaoVien(): { email: string; matKhau: string } | null {
  const env = docEnvE2E();
  const email = process.env.GIAO_VIEN_EMAIL || env.GIAO_VIEN_EMAIL || '';
  const matKhau = process.env.GIAO_VIEN_MATKHAU || env.GIAO_VIEN_MATKHAU || '';
  return email && matKhau ? { email, matKhau } : null;
}

export const TEP_PHIEN = 'tests/.auth/hocsinh.json';
export const TEP_PHIEN_GV = 'tests/.auth/giaovien.json';

/**
 * Trần lượt của khách, đọc từ CHÍNH mã nguồn.
 *
 * Cố ý đọc bằng text thay vì `import` hằng số: tệp khai nó kéo theo
 * `firebase.ts`, mà tệp đó đụng `import.meta.env` — thứ chỉ có khi Vite dựng,
 * nên `import` ở đây là gãy ngay lúc nạp mô-đun. `kiem-tra:het-luot` cũng
 * phải làm đúng cách này, vì cùng một lý do.
 */
export function tranLuotKhach(): number {
  const p = join(GOC, 'src/features/tutor/services/gioiHanChatService.ts');
  const m = /TRAN_LUOT_KHACH\s*=\s*(\d+)/.exec(readFileSync(p, 'utf8'));
  if (!m) throw new Error('Không thấy TRAN_LUOT_KHACH trong gioiHanChatService.ts');
  return Number(m[1]);
}
