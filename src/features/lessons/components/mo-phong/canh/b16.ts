/**
 * BÀI 16 — HYDROCARBON KHÔNG NO.
 *
 * Ethylene và acetylene điều chế xong là thử ngay bằng nước bromine và KMnO₄:
 * mất màu cả hai, khác hẳn hexane ở bài trước. Cảnh giữ nguyên thứ tự đó —
 * bình điều chế bên trái, hai ống thử ở giữa, đốt khí ở đầu ống dẫn.
 */
import {
  chayHat, Hat, hatMoi, mau, mauKhi, MucVe, nhienNgau, noiSuy, to, tronMau, V3,
  veBinhCau, veBotKhi, veDenCon, veHatMem, veHatRan, veLua, veMatBan, veNhan, veOngDan,
  veChu, veOngNghiem, veQuaCau, veTheoChieuSau, trongSuot,
} from '../dungCu3d';
import { dinhNghia, giua, KhungVe } from '../kichBan';

interface StKhi { bot: Hat[]; khoi: Hat[]; dem: number; demKhoi: number }

const X_BINH = -2.0, Y_TAM = -0.55, R_BINH = 0.6;
const X_BROM = 0.15, X_KMNO4 = 1.35, X_DOT = 2.5;
const Y_ONG_DAY = -1.15, Y_ONG_MIENG = 0.55, R_ONG = 0.3, MUC_ONG = -0.3;

/** Ống dẫn chạy từ cổ bình sang ống đang được sục khí, rồi ra đầu đốt. */
function duongOng(dich: number): V3[] {
  return [[X_BINH, 0.95, 0], [X_BINH, 1.45, 0], [dich, 1.45, 0], [dich, -0.75, 0]];
}

/** Hai ống thử: nước bromine và dung dịch KMnO₄, mất màu theo tiến độ. */
function veHaiOngThu(ctx: CanvasRenderingContext2D, P: KhungVe['P'], matBrom: number, matTim: number, bot: Hat[], dangSuc: number): MucVe[] {
  const brom = mau('--mau-brom'), tim = mau('--mau-kmno4'), trong = mau('--mau-dd-trong');
  const khi = mauKhi('--mau-so2', 0.4);
  return [
    { x: X_BROM, c: brom, mat: matBrom, ten: 'nước bromine' },
    { x: X_KMNO4, c: tim, mat: matTim, ten: 'KMnO₄' },
  ].map(o => ({ z: 0, ve: () => {
    veOngNghiem(ctx, P, {
      x: o.x, z: 0, yDay: Y_ONG_DAY, yMieng: Y_ONG_MIENG, r: R_ONG, muc: MUC_ONG,
      mauLong: tronMau(o.c, trong, o.mat), dam: noiSuy(0.6, 0.18, o.mat),
    }, () => { if (Math.abs(dangSuc - o.x) < 0.1) veBotKhi(ctx, P, bot, khi); });
    veNhan(ctx, P, [o.x, Y_ONG_DAY - 0.3, 0], o.mat > 0.85 ? 'mất màu' : o.ten, 12);
  } }));
}

export const b16Ethylene = dinhNghia<StKhi>({
  id: 'b16-ethylene',
  baiId: 'bai-16',
  ten: 'Điều chế và thử tính chất ethylene',
  nhan: 'Bài 16 · SGK tr. 99',
  moTaAria: 'Cảnh 3D: bình cầu đun cồn với sulfuric acid đặc sinh khí ethylene, dẫn qua nước bromine và KMnO₄ rồi đốt ở đầu ống dẫn.',
  ptHoaHoc: [
    'C₂H₅OH → C₂H₄ + H₂O  (H₂SO₄ đặc, 170 °C)',
    'C₂H₄ + Br₂ → C₂H₄Br₂',
    '3C₂H₄ + 2KMnO₄ + 4H₂O → 3C₂H₄(OH)₂ + 2MnO₂↓ + 2KOH',
  ],
  buoc: [
    { nhan: 'Đun cồn với H₂SO₄ đặc', giay: 4, hienTuong: 'Rót từ từ H₂SO₄ đặc vào cồn có đá bọt rồi đun; hỗn hợp sôi và có khí không màu thoát ra.' },
    { nhan: 'Dẫn khí vào nước bromine', giay: 6, hienTuong: 'Sục khí vào ống nước bromine: màu vàng nhạt dần rồi mất — ethylene CỘNG bromine, khác hẳn hexane ở bài trước.' },
    { nhan: 'Dẫn khí vào KMnO₄', giay: 6, hienTuong: 'Chuyển ống dẫn sang dung dịch KMnO₄: màu tím nhạt dần và có kết tủa nâu đen MnO₂.' },
    { nhan: 'Đốt khí ở đầu ống dẫn', giay: 6, hienTuong: 'Khí cháy với ngọn lửa sáng, toả nhiều nhiệt.' },
  ],
  cam: { yaw: 0.2, pitch: 0.18 },
  phong: 0.78,
  tao: () => ({ bot: [], khoi: [], dem: 0, demKhoi: 0 }),
  ve: ({ ctx, P, buoc, tienDo, tong, dt, tt }: KhungVe<StKhi>) => {
    const con = mau('--mau-huu-co');
    const matBrom = buoc === 1 ? Math.min(1, tienDo * 1.15) : buoc > 1 ? 1 : 0;
    const matTim = buoc === 2 ? Math.min(1, tienDo * 1.15) : buoc > 2 ? 1 : 0;
    const dich = buoc <= 1 ? X_BROM : buoc === 2 ? X_KMNO4 : X_DOT;
    const dot = buoc === 3 ? Math.min(1, tienDo * 2) : 0;
    const soi = buoc >= 1 ? 1 : Math.min(1, tienDo * 1.5);

    if (dt > 0) {
      tt.dem += dt;
      if (buoc >= 1 && buoc <= 2 && tt.dem > 0.07) {
        tt.dem = 0;
        tt.bot.push(hatMoi([dich + nhienNgau(-0.1, 0.1), -0.7, nhienNgau(-0.08, 0.08)],
          [0, nhienNgau(0.5, 0.85), 0], 1.8, nhienNgau(0.035, 0.065)));
      }
      tt.bot = chayHat(tt.bot, dt, [0, 0.25, 0], 0.2).filter(h => h.p[1] < MUC_ONG - 0.02);
    }

    veMatBan(ctx, P, -2.0);
    const ds: MucVe[] = [];
    ds.push({ z: -0.02, ve: () => {
      veDenCon(ctx, P, X_BINH, 0, -1.95, tong, 1);
      veBinhCau(ctx, P, { x: X_BINH, z: 0, yTam: Y_TAM, r: R_BINH, muc: -0.75, mauLong: con, dam: 0.3, yCo: 0.95, rCo: 0.18 }, () => {
        const b: Hat[] = [];
        for (let i = 0; i < 6; i++) {
          const g = i * 2.4 + tong * 2;
          b.push(hatMoi([X_BINH + Math.cos(g) * 0.22, -1.0 + (i % 3) * 0.1, Math.sin(g) * 0.22], [0, 0, 0], 9, 0.05 * soi));
        }
        veHatRan(ctx, P, b, mauKhi('--mau-khoi', 0.45), soi);
      });
      veNhan(ctx, P, [X_BINH, Y_TAM - R_BINH - 0.4, 0], 'cồn + H₂SO₄ đặc', 12);
    } });
    ds.push(...veHaiOngThu(ctx, P, matBrom, matTim, tt.bot, dich));
    ds.push({ z: 0.06, ve: () => {
      veOngDan(ctx, P, duongOng(dich));
      if (buoc === 3) {
        /* Đốt ngay ở đầu ống dẫn, không sục vào dung dịch nào nữa. */
        veLua(ctx, P, [X_DOT, -0.7, 0], 0.55, 0.16, tong, mau('--mau-lua'), mau('--mau-lua-trong'), dot);
        veNhan(ctx, P, [X_DOT, -1.1, 0], 'đốt khí', 12);
      }
    } });
    veTheoChieuSau(ds);
    /* MnO₂ nâu đen lắng xuống ống KMnO₄. */
    if (matTim > 0.3) {
      const t: Hat[] = [];
      for (let i = 0; i < 10; i++) {
        const g = i * 2.4, r = 0.18 * Math.sqrt((i + 0.5) / 10);
        t.push(hatMoi([X_KMNO4 + Math.cos(g) * r, Y_ONG_DAY + 0.1 + (i % 2) * 0.05, Math.sin(g) * r], [0, 0, 0], 9, 0.05));
      }
      veHatRan(ctx, P, t, mau('--mau-than'), matTim);
      veNhan(ctx, P, [X_KMNO4 + 0.85, Y_ONG_DAY + 0.15, 0], 'MnO₂ ↓', 11, mau('--chu'));
    }
  },
});

/* ── acetylene ───────────────────────────────────────────────────────────── */

export const b16Acetylene = dinhNghia<StKhi>({
  id: 'b16-acetylene',
  baiId: 'bai-16',
  ten: 'Điều chế và thử tính chất acetylene',
  nhan: 'Bài 16 · SGK tr. 99',
  moTaAria: 'Cảnh 3D: nhỏ nước xuống đất đèn trong bình có nhánh, khí acetylene dẫn qua nước bromine và KMnO₄ rồi đốt.',
  ptHoaHoc: [
    'CaC₂ + 2H₂O → C₂H₂↑ + Ca(OH)₂',
    'C₂H₂ + 2Br₂ → C₂H₂Br₄',
    '2C₂H₂ + 5O₂ → 4CO₂ + 2H₂O  (t°)',
  ],
  buoc: [
    { nhan: 'Nhỏ nước xuống đất đèn', giay: 4, hienTuong: 'Nước vừa chạm đất đèn (CaC₂) là sủi bọt mạnh, khí acetylene thoát ra ngay, không cần đun.' },
    { nhan: 'Dẫn khí vào nước bromine', giay: 6, hienTuong: 'Nước bromine nhạt dần rồi mất màu: liên kết ba cộng được tới hai phân tử bromine.' },
    { nhan: 'Dẫn khí vào KMnO₄', giay: 6, hienTuong: 'Dung dịch KMnO₄ mất màu tím và có kết tủa nâu đen MnO₂.' },
    { nhan: 'Đốt khí ở đầu ống dẫn', giay: 6, hienTuong: 'Khí cháy sáng và có muội đen — acetylene giàu carbon (C₂H₂) nên cháy không hết trong không khí.' },
  ],
  cam: { yaw: 0.2, pitch: 0.18 },
  phong: 0.78,
  tao: () => ({ bot: [], khoi: [], dem: 0, demKhoi: 0 }),
  ve: ({ ctx, P, buoc, tienDo, tong, dt, tt }: KhungVe<StKhi>) => {
    const voi = mau('--mau-ket-tua'), trong = mau('--mau-dd-trong');
    const matBrom = buoc === 1 ? Math.min(1, tienDo * 1.15) : buoc > 1 ? 1 : 0;
    const matTim = buoc === 2 ? Math.min(1, tienDo * 1.15) : buoc > 2 ? 1 : 0;
    const dich = buoc <= 1 ? X_BROM : buoc === 2 ? X_KMNO4 : X_DOT;
    const dot = buoc === 3 ? Math.min(1, tienDo * 2) : 0;

    if (dt > 0) {
      tt.dem += dt;
      if (buoc >= 1 && buoc <= 2 && tt.dem > 0.07) {
        tt.dem = 0;
        tt.bot.push(hatMoi([dich + nhienNgau(-0.1, 0.1), -0.7, nhienNgau(-0.08, 0.08)],
          [0, nhienNgau(0.5, 0.85), 0], 1.8, nhienNgau(0.035, 0.065)));
      }
      tt.bot = chayHat(tt.bot, dt, [0, 0.25, 0], 0.2).filter(h => h.p[1] < MUC_ONG - 0.02);
      tt.demKhoi += dt;
      if (dot > 0.4 && tt.demKhoi > 0.2) {
        tt.demKhoi = 0;
        tt.khoi.push(hatMoi([X_DOT + nhienNgau(-0.1, 0.1), -0.25, 0], [nhienNgau(-0.05, 0.05), nhienNgau(0.4, 0.7), 0], 1.8, 0.1));
      }
      tt.khoi = chayHat(tt.khoi, dt, [0, 0.1, 0], 0.06);
    }

    veMatBan(ctx, P, -2.0);
    const ds: MucVe[] = [];
    ds.push({ z: -0.02, ve: () => {
      /* Bình có nhánh: đất đèn dưới đáy, phễu nhỏ giọt nước phía trên. */
      veBinhCau(ctx, P, {
        x: X_BINH, z: 0, yTam: Y_TAM, r: R_BINH,
        muc: noiSuy(-1.1, -0.72, Math.min(1, (buoc === 0 ? tienDo : 1))), mauLong: tronMau(trong, voi, 0.5), dam: 0.35,
        yCo: 0.95, rCo: 0.18,
      }, () => {
        const d: Hat[] = [];
        for (let i = 0; i < 7; i++) {
          const g = i * 2.4, r = 0.28 * Math.sqrt((i + 0.5) / 7);
          d.push(hatMoi([X_BINH + Math.cos(g) * r, Y_TAM - R_BINH + 0.12, Math.sin(g) * r], [0, 0, 0], 9, 0.07));
        }
        veHatRan(ctx, P, d, mau('--chu-mo'));
      });
      veOngDan(ctx, P, [[X_BINH - 0.75, 1.75, 0], [X_BINH - 0.28, 1.75, 0], [X_BINH - 0.28, 1.05, 0]]);
      const pha = (tong * 1.6) % 1;
      const q = P(giua([X_BINH - 0.28, 1.0, 0], [X_BINH - 0.1, -0.9, 0], pha));
      veQuaCau(ctx, q.x, q.y, 0.06 * q.s, trong, 0.9);
      veNhan(ctx, P, [X_BINH - 1.1, 1.95, 0], 'nước', 12);
      veNhan(ctx, P, [X_BINH, Y_TAM - R_BINH - 0.4, 0], 'đất đèn CaC₂', 12);
    } });
    ds.push(...veHaiOngThu(ctx, P, matBrom, matTim, tt.bot, dich));
    ds.push({ z: 0.06, ve: () => {
      veOngDan(ctx, P, duongOng(dich));
      if (buoc === 3) {
        veLua(ctx, P, [X_DOT, -0.7, 0], 0.6, 0.17, tong, mau('--mau-lua'), mau('--mau-lua-trong'), dot);
        veNhan(ctx, P, [X_DOT, -1.1, 0], 'đốt khí', 12);
      }
    } });
    veTheoChieuSau(ds);
    /* Muội đen bay lên trên ngọn lửa — dấu hiệu cháy không hết. */
    veHatMem(ctx, P, tt.khoi, mau('--mau-than'), 0.45);
    if (dot > 0.5) veNhan(ctx, P, [X_DOT + 0.05, 0.75, 0], 'muội đen', 12, mau('--chu-dam'));
  },
});

/* ── ethylene làm quả chín ───────────────────────────────────────────────── */

/** Quả chuối vẽ bằng một nét cong dày — đủ nhận ra mà không rối cảnh. */
function veChuoi(ctx: CanvasRenderingContext2D, P: KhungVe['P'], p: V3, c: string, nghieng = 0): void {
  const q = P(p), s = q.s;
  ctx.save();
  ctx.translate(q.x, q.y);
  ctx.rotate(nghieng);
  ctx.beginPath();
  ctx.moveTo(-0.22 * s, -0.05 * s);
  ctx.quadraticCurveTo(0, 0.18 * s, 0.22 * s, -0.05 * s);
  ctx.strokeStyle = c;
  ctx.lineWidth = Math.max(3, 0.1 * s);
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}

export const b16ChuoiChin = dinhNghia<Record<string, never>>({
  id: 'b16-chuoi-chin',
  baiId: 'bai-16',
  ten: 'Ethylene làm quả chín nhanh',
  nhan: 'Bài 16 · gợi ý thêm',
  moTaAria: 'Cảnh 3D: hai túi giấy đựng chuối xanh, một túi có thêm quả chín; sau vài ngày chuối trong túi đó vàng nhanh hơn.',
  ptHoaHoc: ['Quả chín tự sinh ethylene C₂H₄ — chất này thúc quả khác chín theo'],
  buoc: [
    { nhan: 'Xếp hai túi', giay: 4, hienTuong: 'Túi 1: chuối xanh cùng một quả đã chín. Túi 2: chỉ chuối xanh. Hai túi để cạnh nhau, cùng chỗ, cùng nhiệt độ.' },
    { nhan: 'Gấp kín miệng túi', giay: 3, hienTuong: 'Gấp kín miệng cả hai túi để khí sinh ra không bay mất.' },
    { nhan: 'Để 2 – 3 ngày', giay: 6, hienTuong: 'Trong túi 1, quả chín toả ethylene và khí này quanh quẩn trong túi.' },
    { nhan: 'So sánh hai túi', giay: 6, hienTuong: 'Chuối ở túi có quả chín vàng nhanh hơn rõ rệt. Đó cũng là mẹo giấm hoa quả trong nhà, và là lý do người ta dùng ethylene để giấm chín trái cây.' },
  ],
  cam: { yaw: 0.2, pitch: 0.2 },
  phong: 0.95,
  tao: () => ({}),
  ve: ({ ctx, P, buoc, tienDo, tong }: KhungVe<Record<string, never>>) => {
    const xanh = mau('--mau-chuoi-xanh'), chin = mau('--mau-chuoi-chin'), giay = mau('--mau-giay');
    const gap = buoc >= 1 ? 1 : 0;
    const vang = buoc === 3 ? Math.min(1, tienDo * 1.2) : 0;

    veMatBan(ctx, P, -1.5);
    const ds: MucVe[] = [-1.3, 1.3].map((x, i) => ({ z: 0, ve: () => {
      /* Túi giấy: hình thang đứng, gấp miệng thì thấp xuống một chút. */
      const cao = gap ? 1.25 : 1.45;
      const goc: V3[] = [[x - 0.62, -1.45, 0.3], [x + 0.62, -1.45, 0.3], [x + 0.52, -1.45 + cao, 0.3], [x - 0.52, -1.45 + cao, 0.3]];
      to(ctx, goc.map(P), trongSuot(giay, 0.85));
      for (let k = 0; k < 4; k++) {
        const a = goc[k], b = goc[(k + 1) % 4];
        const A = P(a), B = P(b);
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y);
        ctx.strokeStyle = mau('--chu-dam'); ctx.lineWidth = 1.5; ctx.stroke();
      }
      /* Chuối nằm trong túi, nhìn qua miệng túi hở ở bước đầu. */
      const mauChuoi = i === 0 ? tronMau(xanh, chin, vang) : tronMau(xanh, chin, vang * 0.18);
      veChuoi(ctx, P, [x - 0.2, -0.95, 0], mauChuoi, -0.15);
      veChuoi(ctx, P, [x + 0.16, -0.78, 0], mauChuoi, 0.12);
      if (i === 0) veChuoi(ctx, P, [x, -0.5, 0], chin, 0.3);
      veNhan(ctx, P, [x, -1.75, 0], i === 0 ? 'túi 1: có quả chín' : 'túi 2: chỉ chuối xanh', 12);
      if (i === 0 && buoc >= 2) {
        const n = 5;
        for (let k = 0; k < n; k++) {
          const q = P([x + Math.cos(tong + k) * 0.32, -0.7 + Math.sin(tong * 0.8 + k) * 0.3, 0.1]);
          veChu(ctx, 'C₂H₄', q.x, q.y, 10, mau('--chu'));
        }
      }
    } }));
    veTheoChieuSau(ds);
    if (vang > 0.6) veNhan(ctx, P, [0, 0.9, 0], 'ethylene thúc quả chín', 13, mau('--chu-dam'));
  },
});


