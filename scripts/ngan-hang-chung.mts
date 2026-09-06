/**
 * Phần dùng chung giữa `npm run xuat:ngan-hang` và `npm run kiem-tra:dong-bo`.
 *
 * Hai lệnh đó phải tính "vân tay" ngân hàng theo ĐÚNG một cách, nếu không lệnh
 * kiểm sẽ báo lệch ngay sau khi vừa xuất xong. Để mỗi bên tự viết một bản là
 * chuyện sớm muộn cũng lệch — nên gom vào đây.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { FIREBASE_CONG_KHAI } from '../src/core/services/firebaseCongKhai';

export const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');
export const TEP_NGAN_HANG = join(GOC, 'public/bank/ngan-hang.json');
export const COL = 'bank_questions';

/**
 * Đọc biến môi trường từ .env rồi .env.local.
 *
 * .env.local đọc SAU nên nó thắng — đó là bản riêng của từng máy. Không dùng
 * `dotenv.config()` vì hàm đó không ghi đè biến đã có, tức là ngược đúng thứ
 * tự ưu tiên cần ở đây.
 */
export function docEnv(): Record<string, string> {
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

/**
 * Cấu hình dùng để nối Firestore: .env.local thắng, thiếu thì lấy bản công
 * khai trong git.
 *
 * Nhờ bản dự phòng này mà GitHub Actions chạy được `xuat:ngan-hang` mà không
 * cần cài secret nào, và máy vừa clone về cũng chạy được ngay.
 */
export function cauHinh(env: Record<string, string>) {
  return {
    apiKey: env.VITE_FIREBASE_API_KEY || FIREBASE_CONG_KHAI.apiKey,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || FIREBASE_CONG_KHAI.authDomain,
    projectId: env.VITE_FIREBASE_PROJECT_ID || FIREBASE_CONG_KHAI.projectId,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || FIREBASE_CONG_KHAI.storageBucket,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID
      || FIREBASE_CONG_KHAI.messagingSenderId,
    appId: env.VITE_FIREBASE_APP_ID || FIREBASE_CONG_KHAI.appId,
  };
}

/** Còn thiếu gì thì không nối được. Có bản công khai nên hầu như luôn rỗng. */
export function thieuCauHinh(env: Record<string, string>): string[] {
  const c = cauHinh(env);
  return (['apiKey', 'projectId', 'appId'] as const).filter(k => !c[k]);
}

/**
 * Tải cả ngân hàng từ Firestore. CHỈ ĐỌC.
 *
 * `bank_questions` cho đọc công khai (xem firestore.rules.proposed) nên không
 * cần đăng nhập. Cấu hình Firebase trong .env.local là khoá công khai của ứng
 * dụng web, không phải bí mật — nó nằm sẵn trong mã JavaScript đã dựng.
 */
export async function taiTuFirestore(
  env: Record<string, string>, hetGioMs = 25000,
): Promise<Record<string, unknown>[]> {
  const app = getApps().length ? getApp() : initializeApp(cauHinh(env));
  /* Mất mạng thì Firestore không báo lỗi mà ngồi thử lại mãi. Không có hạn giờ
     thì `npm run kiem-tra` treo vô hạn, đúng lúc người chạy nó đang offline. */
  const tai = getDocs(collection(getFirestore(app), COL))
    .then(s => s.docs.map(d => ({ ...(d.data() as Record<string, unknown>), id: d.id })));
  const hetGio = new Promise<never>((_, tu) =>
    setTimeout(() => tu(new Error('quá ' + (hetGioMs / 1000) + ' giây, coi như mất mạng')), hetGioMs));
  return Promise.race([tai, hetGio]);
}

/** Sắp khoá theo alphabet ở mọi tầng, kể cả trong mảng các ý Đúng/Sai. */
function sapKhoa(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sapKhoa);
  if (v && typeof v === 'object') {
    const o: Record<string, unknown> = {};
    for (const k of Object.keys(v as object).sort()) {
      const x = (v as Record<string, unknown>)[k];
      if (x !== undefined) o[k] = sapKhoa(x);
    }
    return o;
  }
  return v;
}

/** Danh sách đã chuẩn hoá: sắp theo id, khoá trong từng câu sắp theo alphabet. */
export function chuanHoa(ds: Record<string, unknown>[]): unknown[] {
  return [...ds]
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    .map(q => sapKhoa(q));
}

/**
 * Vân tay của ngân hàng — không phụ thuộc thứ tự.
 *
 * PHẢI chuẩn hoá trước khi băm. Firestore không hứa trả về các trường theo một
 * thứ tự cố định, nên băm thẳng JSON.stringify sẽ cho vân tay khác nhau giữa
 * hai lần đọc y hệt, và lệnh kiểm báo lệch trong khi không có gì đổi cả.
 */
export function vanTay(ds: Record<string, unknown>[]): string {
  return createHash('sha256').update(JSON.stringify(chuanHoa(ds))).digest('hex').slice(0, 16);
}

export function docTepNganHang(): Record<string, unknown>[] | null {
  if (!existsSync(TEP_NGAN_HANG)) return null;
  return JSON.parse(readFileSync(TEP_NGAN_HANG, 'utf8'));
}
