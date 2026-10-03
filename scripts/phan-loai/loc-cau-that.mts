/**
 * Phần thuần của `npm run xuat:cau-hoi` (03/10/2026): biến tin nhắn thật của học
 * sinh thành câu CHƯA GÁN NHÃN cho bộ phân loại ý định. Không đụng mạng hay
 * Firestore, nên `kiem-tra:phan-loai` chạy thẳng trên dữ liệu giả.
 *
 * Thứ tự xử lý ở `chonCauHoi`:
 *   1. chỉ giữ tin của EM (sender 'user') có email thuộc lớp đã đồng ý, trong khoảng ngày;
 *   2. che email, số điện thoại, họ tên học sinh (mọi em có trong `users`, không
 *      riêng lớp đó — em hay nhắc tên bạn lớp khác);
 *   3. bỏ câu trùng nhau và trùng câu đã gán (so bằng chuanHoaYDinh — đúng phép
 *      chuẩn hoá mô hình dùng, xem phanLoaiYDinh.ts);
 *   4. xáo thứ tự bằng hạt giống cố định, để thứ tự dòng không lộ ai hỏi lúc nào.
 * Ra CHỈ có nội dung đã che. Email chỉ dùng để lọc, không đi vào kết quả.
 *
 * Giới hạn của bước che tên: chỉ che họ tên ĐẦY ĐỦ và cụm "tên đệm + tên" của các
 * em có hồ sơ học sinh. Tên gọi một chữ ("An", "Anh"), biệt danh, tên bạn ngoài
 * danh sách, tên trường, địa chỉ đều KHÔNG che được bằng máy. Người gán nhãn vẫn
 * phải đọc và che tay trước khi đưa câu nào vào báo cáo.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chuanHoaYDinh } from '../../src/features/tutor/services/phanLoaiYDinh';

export interface TinTho {
  sender?: string;
  userEmail?: string;
  content?: string;
  timestamp?: string;
}

export interface NguoiDongY {
  email: string;
  hoTen?: string;
}

/** Ai thuộc lớp nào: dùng đúng `laThanhVienLop` của app, khỏi lệch với màn giáo viên. */
export { laThanhVienLop } from '../../src/features/auth/thanhVienLop';

export const CHE_EMAIL = '[email]';
export const CHE_SDT = '[sđt]';
export const CHE_TEN = '[tên]';

const EMAIL = /[^\s@<>()[\]",;:]+@[^\s@<>()[\]",;:]+\.[a-z]{2,}/gi;
/* Số di động/bàn Việt Nam: 0 hoặc +84, rồi 9–10 chữ số, có thể chia nhóm bằng
   dấu cách, chấm, gạch. KHÔNG cho dấu phẩy và đòi chữ số liền sau số 0 đầu, để
   số liệu hoá học ("0,1 M", "0.1 0.2 0.3") không bị che nhầm. */
const SDT = /(?<![\d,.])(?:\+84|0)\d{2,3}[\s.-]?\d{3}[\s.-]?\d{3,4}(?![\d,])/g;

/** Bỏ dấu, thường hoá, đ → d: so tên "Nguyễn Bảo Ân" với "nguyen bao an". */
const boDau = (s: string) =>
  s.normalize('NFD').replace(/\p{Mn}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

/** Chữ thường, GIỮ dấu, gom về một dạng Unicode (NFC). */
const thuong = (s: string) => s.normalize('NFC').toLowerCase();

/**
 * Một cụm tên cần che. `giuDau`: so cả dấu thanh và dấu mũ. Họ tên đầy đủ (từ
 * 3 chữ, hiếm khi trùng lời thường) so KHÔNG dấu để bắt cả khi em gõ không dấu.
 * Cụm 2 chữ thì phải đúng dấu: "Bảo Ân" so không dấu thành "bao an", trùng ngay
 * "bảo an toàn" — đo bằng phép kiểm 03/10/2026, che nhầm thành "[tên] toàn".
 */
export interface CumTen { chu: string[]; giuDau: boolean }

/** Các cụm tên cần che. Bỏ cụm ngắn hơn 2 chữ. */
export function cumTenCanChe(hoTen: readonly string[]): CumTen[] {
  const cum = new Map<string, CumTen>();
  const them = (chu: string[], giuDau: boolean) => {
    const c = giuDau ? chu.map(thuong) : chu.map(boDau);
    cum.set(`${giuDau}|${c.join(' ')}`, { chu: c, giuDau });
  };
  for (const ten of hoTen) {
    const chu = (ten ?? '').split(/\s+/).filter(Boolean);
    if (chu.length >= 3) {
      them(chu, false);
      /* "Thanh An" trong "Nguyễn Hoàng Thanh An": em hay gọi nhau bằng tên đệm + tên. */
      them(chu.slice(-2), true);
    } else if (chu.length === 2) {
      them(chu, true);
    }
  }
  /* Cụm dài che trước, để "Nguyễn Thanh An" không bị che dở thành "Nguyễn [tên]". */
  return [...cum.values()].sort((a, b) => b.chu.length - a.chu.length);
}

/** Che email, số điện thoại và các cụm tên trong một câu. */
export function cheThongTin(cau: string, cumTen: readonly CumTen[]): string {
  const s = cau.replace(EMAIL, CHE_EMAIL).replace(SDT, CHE_SDT);
  if (!cumTen.length) return s;
  /* Tách thành chữ (giữ nguyên văn) và phần xen giữa, so từng cụm trên bản bỏ dấu. */
  /* Gồm cả dấu rời (\p{M}): chữ gõ kiểu NFD vẫn là MỘT chữ. Chỉ số lẻ là chữ. */
  const manh = s.split(/([\p{L}\p{M}]+)/u);
  const chuIdx = manh.map((_, i) => i).filter(i => i % 2 === 1);
  const chuKhong = chuIdx.map(i => boDau(manh[i]));
  const chuCoDau = chuIdx.map(i => thuong(manh[i]));
  const che = new Array<boolean>(chuIdx.length).fill(false);
  const batDauCum = new Map<number, number>();   // vị trí chữ đầu cụm -> số chữ
  for (const { chu: cum, giuDau } of cumTen) {
    const nguon = giuDau ? chuCoDau : chuKhong;
    for (let i = 0; i + cum.length <= nguon.length; i++) {
      if (che.slice(i, i + cum.length).some(Boolean)) continue;
      if (cum.every((c, j) => nguon[i + j] === c)) {
        for (let j = 0; j < cum.length; j++) che[i + j] = true;
        batDauCum.set(i, cum.length);
      }
    }
  }
  if (!batDauCum.size) return s;
  let ra = '';
  for (let k = 0; k < manh.length; k++) {
    if (k % 2 === 0) {
      /* Phần xen giữa hai chữ của CÙNG một cụm tên (dấu cách) thì bỏ luôn. */
      const truoc = (k - 1) >> 1, sau = (k + 1) >> 1;
      const giuaCum = k > 0 && k < manh.length - 1 && che[truoc] && che[sau] && !batDauCum.has(sau);
      if (!giuaCum) ra += manh[k];
      continue;
    }
    const vt = (k - 1) >> 1;
    if (!che[vt]) ra += manh[k];
    else if (batDauCum.has(vt)) ra += CHE_TEN;
  }
  return ra;
}

/** Tạo số giả ngẫu nhiên lặp lại được (mulberry32): cùng hạt giống thì cùng thứ tự. */
export function taoBoSinh(hat: number): () => number {
  let a = hat >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function xao<T>(ds: readonly T[], hat: number): T[] {
  const ra = [...ds];
  const r = taoBoSinh(hat);
  for (let i = ra.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [ra[i], ra[j]] = [ra[j], ra[i]];
  }
  return ra;
}

export interface TuyChon {
  /** Email các em được lấy câu (thành viên lớp, giao với tệp đồng ý nếu có) */
  emailDuocLay: readonly string[];
  /** Họ tên cần che */
  hoTenCanChe: readonly string[];
  /** Câu đã có ở các tệp đã gán / đã xuất trước, để không xuất lại */
  daCo: readonly string[];
  tuNgay?: string;   // YYYY-MM-DD, tính theo giờ UTC của timestamp
  denNgay?: string;
  hat: number;
}

export interface KetQua {
  cau: string[];
  dem: { tinEm: number; ngoaiLop: number; ngoaiNgay: number; rong: number; trungNhau: number; trungDaCo: number };
}

export function chonCauHoi(tin: readonly TinTho[], tc: TuyChon): KetQua {
  const duocLay = new Set(tc.emailDuocLay.map(e => e.trim().toLowerCase()).filter(Boolean));
  const cumTen = cumTenCanChe(tc.hoTenCanChe);
  const daCo = new Set(tc.daCo.map(chuanHoaYDinh));
  const dem = { tinEm: 0, ngoaiLop: 0, ngoaiNgay: 0, rong: 0, trungNhau: 0, trungDaCo: 0 };
  const thay = new Set<string>();
  const cau: string[] = [];
  for (const m of tin) {
    if (m.sender !== 'user') continue;
    dem.tinEm++;
    if (!duocLay.has((m.userEmail ?? '').trim().toLowerCase())) { dem.ngoaiLop++; continue; }
    const ngay = (m.timestamp ?? '').slice(0, 10);
    if ((tc.tuNgay && ngay < tc.tuNgay) || (tc.denNgay && ngay > tc.denNgay)) { dem.ngoaiNgay++; continue; }
    const da = cheThongTin((m.content ?? '').trim(), cumTen);
    const khoa = chuanHoaYDinh(da);
    if (!khoa) { dem.rong++; continue; }
    if (daCo.has(khoa)) { dem.trungDaCo++; continue; }
    if (thay.has(khoa)) { dem.trungNhau++; continue; }
    thay.add(khoa);
    cau.push(da);
  }
  return { cau: xao(cau, tc.hat), dem };
}

// ── CSV ─────────────────────────────────────────────────────────────────────

/** Tách một tệp CSV (có ngoặc kép, xuống dòng trong ô) thành các dòng ô. */
export function docCsv(van: string): string[][] {
  const s = van.replace(/^﻿/, '');
  const dong: string[][] = [];
  let o = '', hang: string[] = [], trongNgoac = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (trongNgoac) {
      if (c === '"' && s[i + 1] === '"') { o += '"'; i++; }
      else if (c === '"') trongNgoac = false;
      else o += c;
    } else if (c === '"') trongNgoac = true;
    else if (c === ',') { hang.push(o); o = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      hang.push(o); o = '';
      if (hang.some(x => x !== '')) dong.push(hang);
      hang = [];
    } else o += c;
  }
  hang.push(o);
  if (hang.some(x => x !== '')) dong.push(hang);
  return dong;
}

/** Tệp đồng ý (tuỳ chọn, khi có em rút lại): cột `email`, có thể thêm `ho_ten`. */
export function docDanhSachDongY(van: string): NguoiDongY[] {
  const [dau, ...con] = docCsv(van);
  const cot = (dau ?? []).map(x => x.trim().toLowerCase());
  const iEmail = cot.indexOf('email');
  const iTen = cot.indexOf('ho_ten');
  if (iEmail < 0) throw new Error(`tệp đồng ý thiếu cột "email" (đang có: ${cot.join(', ') || 'rỗng'})`);
  return con
    .map(h => ({ email: (h[iEmail] ?? '').trim(), hoTen: iTen >= 0 ? (h[iTen] ?? '').trim() : undefined }))
    .filter(n => n.email);
}

/** Cột `tin_nhan` của một tệp đã gán / đã xuất. Không có cột đó thì trả rỗng. */
export function cotTinNhan(van: string): string[] {
  const [dau, ...con] = docCsv(van);
  const i = (dau ?? []).map(x => x.trim()).indexOf('tin_nhan');
  return i < 0 ? [] : con.map(h => h[i] ?? '').filter(Boolean);
}

/** Họ tên để dò trong từ vựng: bỏ rỗng, bỏ trùng, xếp. Không mang email hay mã nào. */
export function danhSachTen(hoTen: readonly string[]): string[] {
  return [...new Set(hoTen.map(t => (t ?? '').trim().replace(/\s+/g, ' ')).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'vi'));
}

const bocO = (s: string) => /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;

/** CSV cho người gán: cùng bốn cột với nhan.csv, nhãn để trống, nguồn "that". */
export function csvChuaGan(cau: readonly string[]): string {
  return '﻿' + ['tin_nhan,nhan,nguoi_gan,nguon', ...cau.map(c => `${bocO(c)},,,that`)].join('\r\n') + '\r\n';
}

/** Tệp cho MỘT người gán: tin_nhan, nhan, nguoi_gan. Cố ý KHÔNG có cột nguon (lộ gợi ý). */
export function csvChoNguoiGan(cau: readonly string[]): string {
  return '﻿' + ['tin_nhan,nhan,nguoi_gan', ...cau.map(c => `${bocO(c)},,`)].join('\r\n') + '\r\n';
}

// ── Đợt xuất: một thư mục that/dot-<ngày>/ cho mỗi lần chạy ────────────────

/** Mọi câu (cột tin_nhan) trong các CSV của du-lieu/ và MỌI thư mục con của du-lieu/that/. */
export function cauDaCo(thuMucDuLieu: string): string[] {
  const ra: string[] = [];
  const doc = (tm: string, deQuy: boolean) => {
    if (!existsSync(tm)) return;
    for (const e of readdirSync(tm, { withFileTypes: true })) {
      const p = join(tm, e.name);
      if (e.isDirectory() && deQuy) doc(p, true);
      else if (e.isFile() && e.name.endsWith('.csv')) ra.push(...cotTinNhan(readFileSync(p, 'utf8')));
    }
  };
  doc(thuMucDuLieu, false);
  doc(join(thuMucDuLieu, 'that'), true);
  return ra;
}

/**
 * Ghi một đợt vào `<thuMucThat>/dot-<ngày>/` (thêm -2, -3... nếu đã có, không ghi đè):
 *   chua-gan.csv   bản gốc, có cột nguon "that" — nap_dot.py lấy nguồn từ đây
 *   chua-gan.meta.txt
 *   a.csv, b.csv   hai bản cho hai người gán ĐỘC LẬP, không cột nguon
 * và `<thuMucThat>/ten-hoc-sinh.txt` (chỉ tên) để dò từ vựng. Trả đường dẫn thư mục đợt.
 */
export function ghiDot(thuMucThat: string, ngay: string, cau: readonly string[],
  meta: readonly string[], dsTen: readonly string[]): string {
  let dot = join(thuMucThat, `dot-${ngay}`);
  for (let i = 2; existsSync(dot); i++) dot = join(thuMucThat, `dot-${ngay}-${i}`);
  mkdirSync(dot, { recursive: true });
  writeFileSync(join(dot, 'chua-gan.csv'), csvChuaGan(cau), 'utf8');
  writeFileSync(join(dot, 'chua-gan.meta.txt'), [...meta, ''].join('\r\n'), 'utf8');
  writeFileSync(join(dot, 'a.csv'), csvChoNguoiGan(cau), 'utf8');
  writeFileSync(join(dot, 'b.csv'), csvChoNguoiGan(cau), 'utf8');
  writeFileSync(join(thuMucThat, 'ten-hoc-sinh.txt'), dsTen.join('\r\n') + '\r\n', 'utf8');
  return dot;
}
