/**
 * BÀI 20 — ALCOHOL.
 *
 * · Phản ứng cháy của alcohol (SGK tr. 124).
 * · Cu(OH)₂ tác dụng với alcohol đa chức (SGK tr. 125) — phép thử phân biệt
 *   alcohol đa chức có hai nhóm OH kề nhau với alcohol đơn chức.
 * · Ethanol tác dụng với sodium (ngoài SGK, giáo viên biểu diễn).
 */
import {
  chayHat, Hat, hatMoi, mau, mauKhi, MucVe, nhienNgau, noiSuy, tronMau, V3,
  veBatSu, veBotKhi, veHatRan, veLua, veMatBan, veNhan, veOngNghiem, veQuaCau, veQueDom,
  veTheoChieuSau,
} from '../dungCu3d';
import { dinhNghia, giua, KhungVe } from '../kichBan';

/* ── phản ứng cháy của alcohol ───────────────────────────────────────────── */

export const b20Chay = dinhNghia<Record<string, never>>({
  id: 'b20-chay',
  baiId: 'bai-20',
  ten: 'Phản ứng cháy của alcohol',
  nhan: 'Bài 20 · SGK tr. 124',
  moTaAria: 'Cảnh 3D: bát sứ đựng cồn được châm lửa bằng que đóm dài, cháy với ngọn lửa xanh nhạt.',
  ptHoaHoc: ['C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O  (t°)'],
  buoc: [
    { nhan: 'Cho cồn vào bát sứ', giay: 3, hienTuong: 'Khoảng 1 mL cồn trong bát sứ, chất lỏng không màu, bay hơi nhanh.' },
    { nhan: 'Châm bằng que đóm dài', giay: 4, hienTuong: 'Dùng que đóm DÀI để châm — không cúi mặt xuống bát và không rót thêm cồn khi đang cháy.' },
    { nhan: 'Cồn cháy', giay: 7, hienTuong: 'Cồn cháy với ngọn lửa màu xanh nhạt, gần như không có khói và không để lại muội. Cháy hết thì bát khô, không còn gì lại.' },
  ],
  cam: { yaw: 0.24, pitch: 0.22 },
  phong: 1.15,
  tao: () => ({}),
  ve: ({ ctx, P, buoc, tienDo, tong }: KhungVe<Record<string, never>>) => {
    const con = mau('--mau-huu-co');
    const cham = buoc === 1 ? Math.min(1, tienDo * 1.3) : buoc > 1 ? 1 : 0;
    const chay = buoc === 2 ? Math.min(1, tienDo * 2.2) : 0;
    const con2 = buoc === 2 ? 1 - tienDo * 0.7 : 1;

    veMatBan(ctx, P, -1.35);
    veBatSu(ctx, P, { x: 0, z: 0, yDay: -1.0, r: 0.62, muc: -1.0 + 0.16 * con2, mauLong: con });
    if (cham > 0.02 && chay < 0.5) {
      const cao = noiSuy(1.1, -0.55, cham);
      veQueDom(ctx, P, [1.5, cao + 0.85, 0], [0.55, cao, 0], tong, 1);
    }
    if (chay > 0.02) {
      veLua(ctx, P, [0, -0.82, 0], 1.0, 0.3, tong, mau('--mau-lua-xanh'), mau('--mau-lua-trong'), chay);
      veNhan(ctx, P, [1.35, -0.2, 0], 'ngọn lửa xanh nhạt', 12, mau('--chu-dam'));
    }
    veNhan(ctx, P, [0, -1.55, 0], 'bát sứ đựng cồn', 12);
  },
});

/* ── Cu(OH)₂ với alcohol đa chức ─────────────────────────────────────────── */

const X_A = -0.85, X_B = 0.85;
const Y_DAY = -1.1, Y_MIENG = 0.85, R_ONG = 0.33, MUC = -0.2;

export const b20GlycerolCuoh2 = dinhNghia<Record<string, never>>({
  id: 'b20-glycerol-cuoh2',
  baiId: 'bai-20',
  ten: 'Copper(II) hydroxide tác dụng với alcohol đa chức',
  nhan: 'Bài 20 · SGK tr. 125',
  moTaAria: 'Cảnh 3D: hai ống Cu(OH)₂ xanh; ống thêm ethanol không tan, ống thêm glycerol tan thành dung dịch xanh lam đậm.',
  ptHoaHoc: [
    'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄',
    '2C₃H₅(OH)₃ + Cu(OH)₂ → [C₃H₅(OH)₂O]₂Cu + 2H₂O  (xanh lam đậm)',
    'C₂H₅OH + Cu(OH)₂: không phản ứng',
  ],
  buoc: [
    { nhan: 'Nhỏ NaOH vào CuSO₄', giay: 4, hienTuong: 'Cả hai ống đều xuất hiện kết tủa xanh lam nhạt Cu(OH)₂.' },
    { nhan: 'Ống 1 thêm ethanol', giay: 4, hienTuong: 'Thêm vài giọt ethanol vào ống 1 rồi lắc: kết tủa xanh vẫn còn nguyên, không tan.' },
    { nhan: 'Ống 2 thêm glycerol', giay: 4, hienTuong: 'Thêm vài giọt glycerol vào ống 2 rồi lắc.' },
    { nhan: 'So hai ống', giay: 7, hienTuong: 'Ống glycerol: kết tủa tan hết, dung dịch trong và xanh lam đậm. Ống ethanol: kết tủa vẫn còn. Phép thử này nhận ra alcohol có nhiều nhóm OH kề nhau.' },
  ],
  cam: { yaw: 0.26, pitch: 0.2 },
  phong: 1,
  tao: () => ({}),
  ve: ({ ctx, P, buoc, tienDo }: KhungVe<Record<string, never>>) => {
    const xanhNhat = mau('--mau-cu-oh2'), xanhDam = mau('--mau-cu-xanh-lam'), trong = mau('--mau-dd-trong');
    const tao = buoc === 0 ? Math.min(1, tienDo * 1.3) : 1;
    const tan = buoc === 3 ? Math.min(1, tienDo * 1.2) : buoc === 2 ? Math.min(1, tienDo * 0.6) : 0;

    veMatBan(ctx, P, -1.6);
    const ds: MucVe[] = [X_A, X_B].map((x, i) => ({ z: 0, ve: () => {
      const glycerol = i === 1;
      const tanOng = glycerol ? tan : 0;
      veOngNghiem(ctx, P, {
        x, z: 0, yDay: Y_DAY, yMieng: Y_MIENG, r: R_ONG, muc: MUC,
        mauLong: tronMau(trong, xanhDam, tanOng), dam: noiSuy(0.2, 0.62, tanOng),
      }, () => {
        /* Kết tủa Cu(OH)₂: ống glycerol thì tan dần, ống ethanol giữ nguyên. */
        const con = tao * (1 - tanOng);
        if (con > 0.03) {
          const hat: Hat[] = [];
          const n = Math.round(con * 15);
          for (let k = 0; k < n; k++) {
            const g = k * 2.399963, r = 0.2 * Math.sqrt((k + 0.5) / 15);
            hat.push(hatMoi([x + Math.cos(g) * r, Y_DAY + 0.1 + (k % 3) * 0.08, Math.sin(g) * r], [0, 0, 0], 9, 0.06));
          }
          veHatRan(ctx, P, hat, xanhNhat, con);
        }
      });
      veNhan(ctx, P, [x, Y_MIENG + 0.4, 0], glycerol ? '+ glycerol' : '+ ethanol', 12);
      if (buoc === 3 && tienDo > 0.5) {
        veNhan(ctx, P, [x, Y_DAY - 0.3, 0], glycerol ? 'tan, xanh lam đậm' : 'kết tủa không tan', 11, mau('--chu-dam'));
      }
    } }));
    veTheoChieuSau(ds);
    /* Giọt thuốc thử đang nhỏ vào ống tương ứng. */
    if (buoc === 1 || buoc === 2) {
      const x = buoc === 1 ? X_A : X_B;
      const q = P(giua([x, 1.5, 0], [x, MUC, 0], (tienDo * 3) % 1) as V3);
      veQuaCau(ctx, q.x, q.y, 0.065 * q.s, trong, 0.95);
    }
  },
});

/* ── ethanol tác dụng với sodium ─────────────────────────────────────────── */

interface StNa { bot: Hat[]; dem: number }

export const b20EthanolNa = dinhNghia<StNa>({
  id: 'b20-ethanol-na',
  baiId: 'bai-20',
  ten: 'Ethanol tác dụng với sodium',
  nhan: 'Bài 20 · gợi ý thêm',
  moTaAria: 'Cảnh 3D: mẩu sodium trong ống nghiệm ethanol khan sủi bọt khí, đưa que đóm vào miệng ống thì khí cháy.',
  ptHoaHoc: ['2C₂H₅OH + 2Na → 2C₂H₅ONa + H₂↑'],
  buoc: [
    { nhan: 'Thả mẩu Na vào ethanol khan', giay: 4, hienTuong: 'Mẩu sodium chìm xuống đáy — Na nặng hơn ethanol, còn thả vào nước thì nó nổi — rồi sủi bọt đều, êm hơn hẳn phản ứng với nước.' },
    { nhan: 'Na tan dần, khí thoát ra', giay: 6, hienTuong: 'Mẩu Na nhỏ dần, khí không màu thoát ra liên tục. Phản ứng chậm và êm vì ethanol có tính acid yếu hơn nước nhiều.' },
    { nhan: 'Đưa que đóm vào miệng ống', giay: 6, hienTuong: 'Khí cháy với tiếng nổ nhỏ — đó là hydrogen. Nhóm –OH của alcohol đã nhường nguyên tử H cho sodium.' },
  ],
  cam: { yaw: 0.28, pitch: 0.2 },
  phong: 1.08,
  tao: () => ({ bot: [], dem: 0 }),
  ve: ({ ctx, P, buoc, tienDo, tong, dt, tt }: KhungVe<StNa>) => {
    const con = mau('--mau-huu-co'), na = mau('--mau-bac');
    const soi = buoc === 0 ? Math.min(1, tienDo * 1.5) : 1;
    const conNa = buoc === 0 ? 1 : buoc === 1 ? 1 - tienDo * 0.6 : 0.35;
    const dom = buoc === 2 ? Math.min(1, tienDo * 1.6) : 0;
    /* Tiếng nổ nhỏ: một chớp lửa ngắn ngay miệng ống. */
    const no = buoc === 2 && tienDo > 0.55 ? Math.max(0, 1 - (tienDo - 0.55) * 4) : 0;

    if (dt > 0) {
      tt.dem += dt;
      if (soi > 0 && tt.dem > 0.07 / soi) {
        tt.dem = 0;
        tt.bot.push(hatMoi([nhienNgau(-0.14, 0.14), -0.92, nhienNgau(-0.12, 0.12)],
          [0, nhienNgau(0.5, 0.85), 0], 1.8, nhienNgau(0.035, 0.06)));
      }
      tt.bot = chayHat(tt.bot, dt, [0, 0.25, 0], 0.2).filter(h => h.p[1] < -0.02);
    }

    veMatBan(ctx, P, -1.6);
    veOngNghiem(ctx, P, {
      x: 0, z: 0, yDay: -1.1, yMieng: 0.9, r: 0.34, muc: -0.05, mauLong: con, dam: 0.25,
    }, () => {
      if (conNa > 0.05) {
        const q = P([0, -0.95, 0]);
        veQuaCau(ctx, q.x, q.y, 0.13 * conNa * q.s, na, 1);
      }
      veBotKhi(ctx, P, tt.bot, mauKhi('--mau-khoi', 0.45));
    });
    if (dom > 0.02) {
      const cao = noiSuy(1.9, 1.05, dom);
      veQueDom(ctx, P, [1.5, cao + 0.7, 0], [0.32, cao, 0], tong, 1);
    }
    if (no > 0.02) veLua(ctx, P, [0, 0.95, 0], 0.5, 0.22, tong, mau('--mau-lua-xanh'), mau('--mau-lua-trong'), no);
    veNhan(ctx, P, [-1.15, -0.5, 0], 'ethanol khan', 12);
    if (conNa > 0.1) veNhan(ctx, P, [1.1, -0.95, 0], 'mẩu Na', 12, mau('--chu'));
    if (buoc >= 1) veNhan(ctx, P, [1.25, 0.35, 0], 'H₂ ↑', 12, mau('--chu-dam'));
  },
});
