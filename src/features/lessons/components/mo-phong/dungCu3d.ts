/**
 * BỘ DỤNG CỤ THÍ NGHIỆM 3D — dùng chung cho các kịch bản "thí nghiệm theo bài".
 *
 * Cùng phép chiếu với `canh3d.ts` (xoay quanh trục đứng rồi trục ngang, chiếu
 * phối cảnh). Mỗi dụng cụ tự vẽ theo đúng thứ tự chất lỏng → thứ nằm bên trong
 * → thành thuỷ tinh, nên nhìn xuyên được mà hạt trong lòng ống vẫn hiện ra.
 * Nhiều dụng cụ đứng cạnh nhau thì xếp bằng `veTheoChieuSau`.
 *
 * KHÔNG viết mã màu cứng: màu chất lấy từ biến `--mau-*` trong src/index.css
 * lúc vẽ, nên đổi sáng/tối là cảnh đổi theo.
 */
import { baoLoi, Camera, DiemChieu, mau, trongSuot, V3, veChu, veQuaCau } from './canh3d';

export type { Camera, DiemChieu, V3 };
export { baoLoi, mau, trongSuot, veChu, veQuaCau };

/** Hàm chiếu một điểm 3D của cảnh xuống canvas. */
export type Chieu = (p: V3) => DiemChieu;

export interface MucVe { z: number; ve: () => void }

/** Vẽ từ xa tới gần — cách duy nhất để vật này che đúng vật kia. */
export function veTheoChieuSau(ds: MucVe[]): void {
  ds.sort((a, b) => a.z - b.z);
  for (const m of ds) m.ve();
}

export type Diem2 = { x: number; y: number };

/** Vòng tròn nằm ngang quanh trục đứng đi qua (x, z). */
export function vongTron(P: Chieu, x: number, z: number, y: number, r: number, n = 32): DiemChieu[] {
  const ds: DiemChieu[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    ds.push(P([x + Math.cos(a) * r, y, z + Math.sin(a) * r]));
  }
  return ds;
}

function duong(ctx: CanvasRenderingContext2D, ds: Diem2[]): void {
  ctx.beginPath();
  ds.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
  ctx.closePath();
}

export function to(ctx: CanvasRenderingContext2D, ds: Diem2[], fill: string): void {
  if (ds.length < 3) return;
  duong(ctx, ds); ctx.fillStyle = fill; ctx.fill();
}

export function net(ctx: CanvasRenderingContext2D, ds: Diem2[], stroke: string, w = 1.5): void {
  if (ds.length < 2) return;
  duong(ctx, ds); ctx.strokeStyle = stroke; ctx.lineWidth = w; ctx.stroke();
}

/** Nét thẳng giữa hai điểm 3D (dây, đũa, chân giá…). */
export function netThang(ctx: CanvasRenderingContext2D, P: Chieu, a: V3, b: V3, c: string, w = 2): void {
  const A = P(a), B = P(b);
  ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y);
  ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke();
}

/* ── ống nghiệm ─────────────────────────────────────────────────────────── */

export interface OngNghiem {
  x: number; z: number;
  /** Điểm THẤP NHẤT của đáy tròn. */
  yDay: number;
  yMieng: number;
  r: number;
  /** Mặt thoáng chất lỏng; ≤ yDay nghĩa là ống rỗng. */
  muc: number;
  mauLong?: string;
  /** Độ đậm của chất lỏng, 0 = trong suốt như nước. */
  dam?: number;
}

/** Mấy vòng của đáy tròn, từ điểm thấp nhất lên tới chỗ ống thành hình trụ. */
function vongDay(P: Chieu, o: OngNghiem): DiemChieu[] {
  const ds: DiemChieu[] = [];
  for (const g of [0.35, 0.7, 1.05, Math.PI / 2]) {
    ds.push(...vongTron(P, o.x, o.z, o.yDay + o.r * (1 - Math.cos(g)), o.r * Math.sin(g), 24));
  }
  return ds;
}

const mucLong = (o: OngNghiem) => Math.max(o.muc, o.yDay + o.r * 0.12);

/**
 * Ống nghiệm: chất lỏng trước, rồi `beTrong` (hạt, mẩu kim loại, khí), sau cùng
 * mới tới thành thuỷ tinh — đúng thứ tự đó thì mới nhìn xuyên vào trong được.
 */
export function veOngNghiem(ctx: CanvasRenderingContext2D, P: Chieu, o: OngNghiem, beTrong?: () => void): void {
  const muc = mau('--chu-dam');
  if (o.muc > o.yDay && o.mauLong) {
    const y = mucLong(o);
    to(ctx, baoLoi([...vongDay(P, o), ...vongTron(P, o.x, o.z, y, o.r, 24)]), trongSuot(o.mauLong, o.dam ?? 0.55));
    to(ctx, vongTron(P, o.x, o.z, y, o.r, 28), trongSuot(o.mauLong, Math.min(1, (o.dam ?? 0.55) + 0.18)));
  }
  beTrong?.();
  net(ctx, baoLoi([...vongDay(P, o), ...vongTron(P, o.x, o.z, o.yMieng, o.r, 24)]), muc, 1.8);
  net(ctx, vongTron(P, o.x, o.z, o.yMieng, o.r, 28), trongSuot(muc, 0.75), 1.4);
}

/** Một lớp chất lỏng nằm giữa hai mức — hệ hai lớp không tan vào nhau. */
export function veLopLong(ctx: CanvasRenderingContext2D, P: Chieu, x: number, z: number, r: number, yDuoi: number, yTren: number, c: string, dam = 0.5): void {
  if (yTren <= yDuoi) return;
  const duoi = vongTron(P, x, z, yDuoi, r, 24), tren = vongTron(P, x, z, yTren, r, 24);
  to(ctx, baoLoi([...duoi, ...tren]), trongSuot(c, dam));
  to(ctx, tren, trongSuot(c, Math.min(1, dam + 0.16)));
}

/**
 * Lớp tráng bạc bám mặt trong thành ống (phản ứng tráng gương). Bạc sáng vẽ
 * đúng màu thì chìm vào nền sáng, nên tô đậm hơn và kẻ viền để ra chất kim loại.
 */
export function veTrangGuong(ctx: CanvasRenderingContext2D, P: Chieu, o: OngNghiem, day: number): void {
  if (day <= 0.01) return;
  const bac = mau('--mau-bac'), muc = mau('--chu-dam');
  const duoi = vongTron(P, o.x, o.z, o.yDay + o.r * 0.6, o.r * 0.99, 24);
  const tren = vongTron(P, o.x, o.z, o.muc + 0.12, o.r * 0.99, 24);
  const vien = baoLoi([...duoi, ...tren]);
  to(ctx, vien, trongSuot(tronMau(bac, muc, 0.3), 0.95 * day));
  net(ctx, vien, trongSuot(muc, 0.8 * day), 1.6);
  /* Vệt sáng dọc thân ống cho ra vẻ mặt gương. */
  const a = P([o.x - o.r * 0.45, o.yDay + o.r * 0.7, o.z]), b = P([o.x - o.r * 0.45, o.muc + 0.05, o.z]);
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
  ctx.strokeStyle = trongSuot(mau('--chu-nguoc'), 0.8 * day); ctx.lineWidth = 3; ctx.stroke();
}

/* ── thân tròn xoay: bình cầu, phễu, bát, bình tam giác ─────────────────── */

/** Bán kính theo độ cao — dùng chung cho mọi vật hình tròn xoay. */
export type BanKinh = (y: number) => number;

export const banCau = (yTam: number, r: number): BanKinh =>
  y => Math.sqrt(Math.max(0, r * r - (y - yTam) * (y - yTam)));

export const banNon = (yDuoi: number, yTren: number, rDuoi: number, rTren: number): BanKinh =>
  y => rDuoi + (rTren - rDuoi) * Math.max(0, Math.min(1, (y - yDuoi) / (yTren - yDuoi)));

/** Bao ngoài của một vật tròn xoay, lấy theo nhiều vòng ngang. */
export function vienXoay(P: Chieu, x: number, z: number, yDuoi: number, yTren: number, ban: BanKinh, n = 12): Diem2[] {
  const ds: DiemChieu[] = [];
  for (let i = 0; i <= n; i++) {
    const y = yDuoi + (yTren - yDuoi) * (i / n);
    ds.push(...vongTron(P, x, z, y, Math.max(0.004, ban(y)), 20));
  }
  return baoLoi(ds);
}

/**
 * Vật thuỷ tinh tròn xoay: chất lỏng (tới `muc`) rồi `beTrong` rồi thành ngoài.
 * Bình cầu, phễu chiết, phễu lọc, bát sứ và bình tam giác chỉ khác nhau ở hàm
 * bán kính, nên dùng chung một chỗ vẽ.
 */
export function veKhoiXoay(
  ctx: CanvasRenderingContext2D, P: Chieu,
  o: { x: number; z: number; yDuoi: number; yTren: number; ban: BanKinh; muc?: number; mauLong?: string; dam?: number },
  beTrong?: () => void,
): void {
  const net2 = mau('--chu-dam');
  if (o.muc !== undefined && o.muc > o.yDuoi && o.mauLong) {
    to(ctx, vienXoay(P, o.x, o.z, o.yDuoi, o.muc, o.ban, 8), trongSuot(o.mauLong, o.dam ?? 0.55));
    to(ctx, vongTron(P, o.x, o.z, o.muc, Math.max(0.004, o.ban(o.muc)), 24), trongSuot(o.mauLong, Math.min(1, (o.dam ?? 0.55) + 0.16)));
  }
  beTrong?.();
  net(ctx, vienXoay(P, o.x, o.z, o.yDuoi, o.yTren, o.ban), net2, 1.8);
}

/** Bình cầu: thân cầu + cổ ống. `yTam` là tâm quả cầu. */
export function veBinhCau(
  ctx: CanvasRenderingContext2D, P: Chieu,
  o: { x: number; z: number; yTam: number; r: number; muc?: number; mauLong?: string; dam?: number; yCo?: number; rCo?: number },
  beTrong?: () => void,
): void {
  const rCo = o.rCo ?? o.r * 0.3, yCo = o.yCo ?? o.yTam + o.r + 0.9;
  const net2 = mau('--chu-dam');
  net(ctx, baoLoi([
    ...vongTron(P, o.x, o.z, o.yTam + o.r * 0.55, o.r * 0.83, 20),
    ...vongTron(P, o.x, o.z, yCo, rCo, 18),
  ]), net2, 1.8);
  veKhoiXoay(ctx, P, { ...o, yDuoi: o.yTam - o.r, yTren: o.yTam + o.r, ban: banCau(o.yTam, o.r) }, beTrong);
  net(ctx, vongTron(P, o.x, o.z, yCo, rCo, 18), trongSuot(net2, 0.75), 1.4);
}

/** Phễu chiết hình quả lê, có khoá xả ở cuống dưới. */
export function vePheuChiet(
  ctx: CanvasRenderingContext2D, P: Chieu,
  o: { x: number; z: number; yDay: number; cao: number; r: number },
  beTrong?: () => void,
): void {
  const net2 = mau('--chu-dam');
  const yPhinh = o.yDay + o.cao * 0.38;
  const ban: BanKinh = y => (y <= yPhinh
    ? o.r * Math.sqrt(Math.max(0, (y - o.yDay) / (yPhinh - o.yDay)))
    : o.r * (1 - 0.72 * (y - yPhinh) / (o.yDay + o.cao - yPhinh)));
  beTrong?.();
  net(ctx, vienXoay(P, o.x, o.z, o.yDay, o.yDay + o.cao, ban, 14), net2, 1.8);
  /* Cuống + khoá: nét dọc và một gạch ngang cho khoá. */
  netThang(ctx, P, [o.x, o.yDay, o.z], [o.x, o.yDay - 0.55, o.z], net2, 2);
  netThang(ctx, P, [o.x - 0.16, o.yDay - 0.3, o.z], [o.x + 0.16, o.yDay - 0.3, o.z], net2, 4);
}

/** Bát sứ cạn (đốt cồn, đốt hexane). */
export function veBatSu(ctx: CanvasRenderingContext2D, P: Chieu, o: { x: number; z: number; yDay: number; r: number; muc?: number; mauLong?: string }): void {
  const ban = banNon(o.yDay, o.yDay + 0.3, o.r * 0.55, o.r);
  veKhoiXoay(ctx, P, { x: o.x, z: o.z, yDuoi: o.yDay, yTren: o.yDay + 0.3, ban, muc: o.muc, mauLong: o.mauLong, dam: 0.45 });
  net(ctx, vongTron(P, o.x, o.z, o.yDay + 0.3, o.r, 24), trongSuot(mau('--chu-dam'), 0.7), 1.4);
}

/** Bình tam giác (bình nón). */
export function veBinhTamGiac(
  ctx: CanvasRenderingContext2D, P: Chieu,
  o: { x: number; z: number; yDay: number; cao: number; rDay: number; rCo: number; muc?: number; mauLong?: string; dam?: number },
  beTrong?: () => void,
): void {
  const yVai = o.yDay + o.cao * 0.62;
  const ban: BanKinh = y => (y <= yVai ? banNon(o.yDay, yVai, o.rDay, o.rCo)(y) : o.rCo);
  veKhoiXoay(ctx, P, { x: o.x, z: o.z, yDuoi: o.yDay, yTren: o.yDay + o.cao, ban, muc: o.muc, mauLong: o.mauLong, dam: o.dam }, beTrong);
  net(ctx, vongTron(P, o.x, o.z, o.yDay + o.cao, o.rCo, 20), trongSuot(mau('--chu-dam'), 0.75), 1.4);
}

/** Phễu lọc: nón chụm xuống, có nếp giấy lọc bên trong. */
export function vePheuLoc(ctx: CanvasRenderingContext2D, P: Chieu, o: { x: number; z: number; yDinh: number; cao: number; r: number; coGiay?: boolean }): void {
  const net2 = mau('--chu-dam');
  const ban = banNon(o.yDinh, o.yDinh + o.cao, 0.02, o.r);
  if (o.coGiay) to(ctx, vienXoay(P, o.x, o.z, o.yDinh + 0.06, o.yDinh + o.cao * 0.95, ban, 8), trongSuot(mau('--mau-giay'), 0.9));
  net(ctx, vienXoay(P, o.x, o.z, o.yDinh, o.yDinh + o.cao, ban, 8), net2, 1.8);
  net(ctx, vongTron(P, o.x, o.z, o.yDinh + o.cao, o.r, 22), trongSuot(net2, 0.75), 1.4);
  netThang(ctx, P, [o.x, o.yDinh, o.z], [o.x, o.yDinh - 0.45, o.z], net2, 2);
}

/** Ống sinh hàn: ống nghiêng có vỏ nước làm mát. */
export function veOngSinhHan(ctx: CanvasRenderingContext2D, P: Chieu, a: V3, b: V3): void {
  const net2 = mau('--chu-dam');
  netThang(ctx, P, a, b, trongSuot(mau('--xanh-nen'), 0.18), 16);
  netThang(ctx, P, a, b, net2, 1.4);
  for (let i = 0; i <= 4; i++) {
    const k = i / 4, p: V3 = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2]];
    const q: V3 = [p[0], p[1] + 0.22, p[2]];
    netThang(ctx, P, [p[0], p[1] - 0.22, p[2]], q, trongSuot(net2, 0.45), 1.2);
  }
}

/** Nhiệt kế: ống mảnh, bầu dưới, cột chất lỏng dâng theo `muc` (0→1). */
export function veNhietKe(ctx: CanvasRenderingContext2D, P: Chieu, x: number, z: number, yDay: number, cao: number, muc: number): void {
  const net2 = mau('--chu-dam'), do2 = mau('--mau-nung-do');
  netThang(ctx, P, [x, yDay, z], [x, yDay + cao, z], trongSuot(net2, 0.18), 7);
  netThang(ctx, P, [x, yDay, z], [x, yDay + cao, z], net2, 1.2);
  netThang(ctx, P, [x, yDay, z], [x, yDay + cao * Math.max(0.05, Math.min(1, muc)), z], do2, 3);
  const q = P([x, yDay, z]);
  veQuaCau(ctx, q.x, q.y, 0.075 * q.s, do2, 1);
}

/** Que đóm: que gỗ nhỏ, đầu có thể đang cháy. */
export function veQueDom(ctx: CanvasRenderingContext2D, P: Chieu, can: V3, dau: V3, t: number, chay: number): void {
  netThang(ctx, P, can, dau, mau('--vang'), 2.5);
  veLua(ctx, P, dau, 0.22, 0.06, t, mau('--mau-lua'), mau('--mau-lua-trong'), chay);
}

/** Chai nhựa và quả bóng bay chụp trên miệng chai. */
export function veChaiBong(
  ctx: CanvasRenderingContext2D, P: Chieu,
  o: { x: number; z: number; yDay: number; cao: number; r: number; muc: number; mauLong: string; phong: number },
  beTrong?: () => void,
): void {
  const net2 = mau('--chu-dam');
  const yVai = o.yDay + o.cao * 0.72, rCo = o.r * 0.34;
  const ban: BanKinh = y => (y <= yVai ? o.r : banNon(yVai, o.yDay + o.cao, o.r, rCo)(y));
  veKhoiXoay(ctx, P, { x: o.x, z: o.z, yDuoi: o.yDay, yTren: o.yDay + o.cao, ban, muc: o.muc, mauLong: o.mauLong, dam: 0.4 }, beTrong);
  /* Bóng: xẹp thì bám sát cổ chai, phồng thì thành quả cầu. */
  const rB = rCo * (1 + o.phong * 3.6), yB = o.yDay + o.cao + rB * 0.72;
  const q = P([o.x, yB, o.z]);
  ctx.beginPath();
  ctx.ellipse(q.x, q.y, rB * q.s, rB * q.s * (0.78 + o.phong * 0.24), 0, 0, Math.PI * 2);
  ctx.fillStyle = trongSuot(mau('--mau-bong-bay'), 0.62); ctx.fill();
  ctx.strokeStyle = net2; ctx.lineWidth = 1.5; ctx.stroke();
}

/* ── cốc thuỷ tinh ──────────────────────────────────────────────────────── */

export interface Coc { x: number; z: number; yDay: number; yMieng: number; r: number; muc: number; mauLong?: string; dam?: number }

export function veCoc(ctx: CanvasRenderingContext2D, P: Chieu, o: Coc, beTrong?: () => void): void {
  const muc = mau('--chu-dam');
  const day = vongTron(P, o.x, o.z, o.yDay, o.r, 28);
  if (o.muc > o.yDay && o.mauLong) {
    const mat = vongTron(P, o.x, o.z, o.muc, o.r, 28);
    to(ctx, baoLoi([...day, ...mat]), trongSuot(o.mauLong, o.dam ?? 0.5));
    to(ctx, mat, trongSuot(o.mauLong, Math.min(1, (o.dam ?? 0.5) + 0.16)));
  }
  beTrong?.();
  net(ctx, baoLoi([...day, ...vongTron(P, o.x, o.z, o.yMieng, o.r, 28)]), muc, 1.8);
  net(ctx, vongTron(P, o.x, o.z, o.yMieng, o.r, 28), trongSuot(muc, 0.75), 1.4);
  net(ctx, day, trongSuot(muc, 0.45), 1.2);
}

/** Bình/lọ thuỷ tinh đựng khí, có tấm đậy miệng. */
export function veBinhKhi(
  ctx: CanvasRenderingContext2D, P: Chieu,
  o: { x: number; z: number; yDay: number; yMieng: number; r: number; mauKhi?: string; dam?: number; dayNap?: boolean },
  beTrong?: () => void,
): void {
  const muc = mau('--chu-dam');
  const day = vongTron(P, o.x, o.z, o.yDay, o.r, 28), mieng = vongTron(P, o.x, o.z, o.yMieng, o.r, 28);
  if (o.mauKhi) to(ctx, baoLoi([...day, ...mieng]), trongSuot(o.mauKhi, o.dam ?? 0.16));
  beTrong?.();
  net(ctx, baoLoi([...day, ...mieng]), muc, 1.8);
  net(ctx, mieng, trongSuot(muc, 0.75), 1.4);
  net(ctx, day, trongSuot(muc, 0.45), 1.2);
  if (o.dayNap) {
    to(ctx, vongTron(P, o.x, o.z, o.yMieng + 0.06, o.r * 1.06, 28), trongSuot(mau('--chu-mo'), 0.9));
    net(ctx, vongTron(P, o.x, o.z, o.yMieng + 0.06, o.r * 1.06, 28), muc, 1.4);
  }
}

/* ── phụ kiện ───────────────────────────────────────────────────────────── */

/** Nút bông (có thể tẩm NaOH) đậy miệng ống. */
export function veNutBong(ctx: CanvasRenderingContext2D, P: Chieu, x: number, z: number, y: number, r: number): void {
  const q = P([x, y, z]);
  ctx.save();
  ctx.beginPath(); ctx.ellipse(q.x, q.y, r * q.s * 1.02, r * q.s * 0.62, 0, 0, Math.PI * 2);
  ctx.fillStyle = trongSuot(mau('--nen-nhat'), 0.95); ctx.fill();
  ctx.strokeStyle = mau('--chu-dam'); ctx.lineWidth = 1.4; ctx.stroke();
  ctx.restore();
}

/** Ống dẫn khí: nối các đoạn thẳng, vẽ dày để ra dáng ống thuỷ tinh. */
export function veOngDan(ctx: CanvasRenderingContext2D, P: Chieu, diem: V3[]): void {
  const muc = mau('--chu-dam');
  for (let i = 1; i < diem.length; i++) {
    netThang(ctx, P, diem[i - 1], diem[i], trongSuot(muc, 0.25), 7);
    netThang(ctx, P, diem[i - 1], diem[i], muc, 2);
  }
}

/** Đũa thuỷ tinh / que nhỏ giữa hai điểm. */
export function veDua(ctx: CanvasRenderingContext2D, P: Chieu, a: V3, b: V3, dauUot?: string): void {
  const muc = mau('--chu-dam');
  netThang(ctx, P, a, b, trongSuot(muc, 0.22), 8);
  netThang(ctx, P, a, b, muc, 1.8);
  if (dauUot) {
    const q = P(b);
    veQuaCau(ctx, q.x, q.y, 0.085 * q.s, dauUot, 0.95);
  }
}

/** Muôi sắt đốt hoá chất: cán nghiêng và bát muôi hình đĩa. */
export function veMuoiSat(ctx: CanvasRenderingContext2D, P: Chieu, can: V3, bat: V3, mauTrongBat?: string): void {
  const kl = mau('--chu-mo');
  netThang(ctx, P, can, bat, kl, 3);
  const dia = vongTron(P, bat[0], bat[2], bat[1], 0.2, 20);
  to(ctx, dia, trongSuot(kl, 0.9));
  net(ctx, dia, mau('--chu-dam'), 1.4);
  if (mauTrongBat) to(ctx, vongTron(P, bat[0], bat[2], bat[1] + 0.03, 0.15, 18), trongSuot(mauTrongBat, 0.95));
}

/** Kẹp gỗ giữ ống nghiệm. */
export function veKepGo(ctx: CanvasRenderingContext2D, P: Chieu, x: number, z: number, y: number, r: number): void {
  const a = P([x - r * 1.6, y, z]), b = P([x + r * 1.6, y, z]);
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
  ctx.strokeStyle = trongSuot(mau('--vang'), 0.85); ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke();
}

/** Mẩu giấy (quỳ, pH) luôn quay mặt về người xem; đổi `mauGiay` là giấy đổi màu. */
export function veGiay(ctx: CanvasRenderingContext2D, P: Chieu, tam: V3, rong: number, cao: number, mauGiay: string): void {
  const q = P(tam), w = rong * q.s, h = cao * q.s;
  ctx.save();
  ctx.beginPath(); ctx.rect(q.x - w / 2, q.y - h / 2, w, h);
  ctx.fillStyle = mauGiay; ctx.fill();
  ctx.strokeStyle = mau('--chu-dam'); ctx.lineWidth = 1.2; ctx.stroke();
  ctx.restore();
}

/** Mảnh kim loại (lá đồng, mẩu sắt) — tấm nhỏ quay về người xem. */
export function veManhKimLoai(ctx: CanvasRenderingContext2D, P: Chieu, p: V3, canh: number, mauKl: string, goc = 0.4): void {
  const q = P(p), w = canh * q.s;
  if (w <= 0.5) return;
  ctx.save();
  ctx.translate(q.x, q.y); ctx.rotate(goc);
  ctx.beginPath(); ctx.rect(-w / 2, -w / 3.2, w, w / 1.6);
  ctx.fillStyle = mauKl; ctx.fill();
  ctx.strokeStyle = trongSuot(mau('--chu-dam'), 0.8); ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
}

/* ── lửa và nhiệt ───────────────────────────────────────────────────────── */

/** Quầng sáng toả tròn (ánh lửa, chỗ nung đỏ). */
export function veHaoQuang(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string, dam = 0.55): void {
  if (r <= 0) return;
  const g = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
  g.addColorStop(0, trongSuot(c, dam));
  g.addColorStop(1, trongSuot(c, 0));
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
}

/**
 * Ngọn lửa hình giọt nước, chân ở `goc`. `manh` 0→1 để lửa lớn dần hoặc tắt
 * dần; `t` là thời gian (giây) để lửa rung.
 */
export function veLua(
  ctx: CanvasRenderingContext2D, P: Chieu, goc: V3,
  cao: number, rong: number, t: number, mauNgoai: string, mauTrong: string, manh = 1,
): void {
  if (manh <= 0.01) return;
  const rung = 1 + Math.sin(t * 9) * 0.06 + Math.sin(t * 15.7) * 0.03;
  const chan = P(goc), dinh = P([goc[0], goc[1] + cao * manh * rung, goc[2]]);
  const w = rong * manh * chan.s;
  veHaoQuang(ctx, chan.x, (chan.y + dinh.y) / 2, w * 3.4, mauNgoai, 0.34 * manh);
  const giot = (co: number, c: string, a: number) => {
    const dy = (dinh.y - chan.y) * co;
    ctx.beginPath();
    ctx.moveTo(chan.x, chan.y);
    ctx.bezierCurveTo(chan.x - w * co, chan.y - Math.abs(dy) * 0.25, chan.x - w * co * 0.9, chan.y + dy * 0.7, chan.x, chan.y + dy);
    ctx.bezierCurveTo(chan.x + w * co * 0.9, chan.y + dy * 0.7, chan.x + w * co, chan.y - Math.abs(dy) * 0.25, chan.x, chan.y);
    ctx.closePath();
    ctx.fillStyle = trongSuot(c, a); ctx.fill();
  };
  giot(1, mauNgoai, 0.7);
  giot(0.5, mauTrong, 0.85);
}

/** Đèn cồn: bầu, cổ, bấc và ngọn lửa. `chay` = 0 là tắt. */
export function veDenCon(ctx: CanvasRenderingContext2D, P: Chieu, x: number, z: number, yDay: number, t: number, chay: number): void {
  const thuy = mau('--chu-dam'), con = mau('--mau-con');
  const r = 0.32, yBau = yDay + 0.32, yCo = yBau + 0.16;
  const day = vongTron(P, x, z, yDay, r, 24), vai = vongTron(P, x, z, yBau, r * 0.96, 24);
  to(ctx, baoLoi([...day, ...vai]), trongSuot(con, 0.45));
  net(ctx, baoLoi([...day, ...vai]), thuy, 1.6);
  const co1 = vongTron(P, x, z, yBau, r * 0.4, 18), co2 = vongTron(P, x, z, yCo, r * 0.36, 18);
  to(ctx, baoLoi([...co1, ...co2]), trongSuot(mau('--chu-mo'), 0.85));
  net(ctx, baoLoi([...co1, ...co2]), thuy, 1.4);
  netThang(ctx, P, [x, yCo, z], [x, yCo + 0.09, z], thuy, 3);
  veLua(ctx, P, [x, yCo + 0.09, z], 0.7, 0.16, t, mau('--mau-lua'), mau('--mau-lua-trong'), chay);
}

/* ── hệ hạt: khí, khói, bọt, kết tủa ────────────────────────────────────── */

export interface Hat { p: V3; v: V3; tuoi: number; song: number; r: number }

export const hatMoi = (p: V3, v: V3, song: number, r: number): Hat =>
  ({ p: [p[0], p[1], p[2]], v: [v[0], v[1], v[2]], tuoi: 0, song, r });

export const nhienNgau = (a: number, b: number) => a + Math.random() * (b - a);

/** Chạy một đợt hạt: cộng gia tốc, rung nhẹ, bỏ hạt hết tuổi. */
export function chayHat(ds: Hat[], dt: number, keo: V3 = [0, 0, 0], rung = 0): Hat[] {
  for (const h of ds) {
    h.tuoi += dt;
    for (let i = 0; i < 3; i++) {
      h.v[i] += keo[i] * dt + nhienNgau(-rung, rung) * dt;
      h.p[i] += h.v[i] * dt;
    }
  }
  return ds.filter(h => h.tuoi < h.song);
}

/** Vệt khói / đám khí: hạt mờ dần và phình ra theo tuổi. */
export function veHatMem(ctx: CanvasRenderingContext2D, P: Chieu, ds: Hat[], c: string, dam = 0.5): void {
  for (const h of ds) {
    const q = P(h.p), k = h.tuoi / h.song;
    const r = h.r * (0.7 + k * 1.6) * q.s;
    if (r <= 0.2) continue;
    veHaoQuang(ctx, q.x, q.y, r, c, dam * (1 - k));
  }
}

/** Bọt khí trong chất lỏng: quả cầu rỗng viền sáng. */
export function veBotKhi(ctx: CanvasRenderingContext2D, P: Chieu, ds: Hat[], c: string): void {
  for (const h of ds) {
    const q = P(h.p), r = h.r * q.s;
    if (r <= 0.3) continue;
    ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, Math.PI * 2);
    ctx.fillStyle = trongSuot(c, 0.4); ctx.fill();
    ctx.strokeStyle = trongSuot(c, 0.9); ctx.lineWidth = 1; ctx.stroke();
  }
}

/** Hạt rắn (kết tủa, bột) — quả cầu đặc có bóng sáng. */
export function veHatRan(ctx: CanvasRenderingContext2D, P: Chieu, ds: Hat[], c: string, mo = 1): void {
  for (const h of ds) {
    const q = P(h.p);
    veQuaCau(ctx, q.x, q.y, h.r * q.s, c, mo);
  }
}

/**
 * Đống bột / lớp chất rắn quanh trục (x, z): vị trí tính từ chỉ số hạt theo góc
 * vàng nên khung hình nào cũng giống nhau — bột không được phép nhảy lung tung
 * giữa các khung hình.
 */
export function dongBot(x: number, y: number, ban: number, n: number, rHat = 0.055, z = 0): Hat[] {
  const ds: Hat[] = [];
  for (let i = 0; i < n; i++) {
    const g = i * 2.399963, r = ban * Math.sqrt((i + 0.5) / n);
    ds.push(hatMoi([x + Math.cos(g) * r, y + (i % 3) * rHat * 0.6, z + Math.sin(g) * r], [0, 0, 0], 99, rHat));
  }
  return ds;
}

/** Dao động 0→1→0 theo chu kỳ, dùng cho nhấp nháy và phập phồng. */
export const dao = (t: number, chuKy = 1) => 0.5 - 0.5 * Math.cos((t / chuKy) * Math.PI * 2);

/** Nội suy tuyến tính có chặn hai đầu — đổi màu, đổi mức theo tiến độ. */
export const noiSuy = (a: number, b: number, k: number) => a + (b - a) * Math.max(0, Math.min(1, k));

/** Trộn hai màu theo tỉ lệ k (0 = màu đầu) — dung dịch đang đổi màu. */
export function tronMau(c1: string, c2: string, k: number): string {
  const doc = (c: string): [number, number, number] => {
    if (c.startsWith('#') && c.length >= 7) return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
    const m = c.match(/(\d+)\D+(\d+)\D+(\d+)/);
    return m ? [+m[1], +m[2], +m[3]] : [128, 128, 128];
  };
  const a = doc(c1), b = doc(c2), t = Math.max(0, Math.min(1, k));
  return `rgb(${Math.round(noiSuy(a[0], b[0], t))},${Math.round(noiSuy(a[1], b[1], t))},${Math.round(noiSuy(a[2], b[2], t))})`;
}

/**
 * Màu khí / khói pha thêm chút màu chữ mờ. Khí không màu (NH₃, SO₂) và khói
 * trắng vẽ đúng màu thật thì trên nền sáng gần như không thấy gì; pha như vậy
 * mới đọc được vệt khí ở CẢ hai chế độ nền.
 */
export const mauKhi = (ten: string, k = 0.45) => tronMau(mau(ten), mau('--chu-mo'), k);

/** Mặt bàn: một tấm mờ cho cảnh có chỗ đứng, không vẽ hộp cho rối mắt. */
export function veMatBan(ctx: CanvasRenderingContext2D, P: Chieu, y: number, rong = 3.4, sau = 1.6): void {
  const ds = ([[-rong, y, -sau], [rong, y, -sau], [rong, y, sau], [-rong, y, sau]] as V3[]).map(P);
  to(ctx, ds, trongSuot(mau('--chu-mo'), 0.1));
  net(ctx, ds, trongSuot(mau('--chu-mo'), 0.45), 1.2);
}

/**
 * Nhãn chữ đặt tại một điểm trong cảnh (tên chất, tên dụng cụ).
 *
 * Cỡ chữ CO THEO cỡ cảnh chứ không để cứng: vào toàn màn hình chiếu lên lớp thì
 * hình to ra, chữ giữ nguyên px sẽ càng lúc càng nhỏ so với hình — đúng lúc cần
 * đọc được từ cuối lớp. `q.s` tỉ lệ thuận với cỡ cảnh, 78 là giá trị ở khung
 * thường nên ở đó chữ vẫn đúng bằng `px`.
 */
export function veNhan(ctx: CanvasRenderingContext2D, P: Chieu, p: V3, s: string, px = 12, c?: string): void {
  const q = P(p);
  const co = Math.max(0.9, Math.min(2, q.s / 78));
  veChu(ctx, s, q.x, q.y, px * co, c ?? mau('--chu-dam'));
}
