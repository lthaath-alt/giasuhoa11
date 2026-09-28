/**
 * BÀI 23 — HỢP CHẤT CARBONYL (ALDEHYDE – KETONE).
 *
 * Ba phép thử của SGK: tráng bạc và Cu(OH)₂ nhận ra ALDEHYDE (bị oxi hoá),
 * còn iodoform nhận ra nhóm methyl ketone — ketone không tráng bạc được.
 */
import {
  chayHat, Hat, hatMoi, mau, mauKhi, nhienNgau, noiSuy, tronMau, V3,
  veBotKhi, veCoc, veDenCon, veHatRan, veMatBan, veNhan, veOngNghiem, veQuaCau, veTrangGuong,
} from '../dungCu3d';
import { dinhNghia, giua, KhungVe } from '../kichBan';

const Y_DAY = -1.1, Y_MIENG = 0.9, R_ONG = 0.35, MUC = -0.2;

/* ── tráng bạc ───────────────────────────────────────────────────────────── */

export const b23TrangBac = dinhNghia<Record<string, never>>({
  id: 'b23-trang-bac',
  baiId: 'bai-23',
  ten: 'Oxi hoá aldehyde bằng thuốc thử Tollens',
  nhan: 'Bài 23 · SGK tr. 140',
  moTaAria: 'Cảnh 3D: pha thuốc thử Tollens rồi thêm acetaldehyde, ngâm ống vào cốc nước nóng cho bạc bám thành ống như gương.',
  ptHoaHoc: ['CH₃CHO + 2[Ag(NH₃)₂]OH → CH₃COONH₄ + 2Ag↓ + 3NH₃ + H₂O  (t°)'],
  buoc: [
    { nhan: 'Nhỏ NH₃ vào AgNO₃', giay: 4, hienTuong: 'Ban đầu xuất hiện kết tủa, nhỏ tiếp NH₃ tới khi kết tủa VỪA tan hết thì dừng — dung dịch trong suốt đó là thuốc thử Tollens.' },
    { nhan: 'Thêm vài giọt acetaldehyde', giay: 4, hienTuong: 'Thêm vài giọt acetaldehyde vào ống, không lắc.' },
    { nhan: 'Ngâm nước nóng 70 – 80 °C', giay: 5, hienTuong: 'Ngâm ống vào cốc nước nóng khoảng 5 phút, giữ ống đứng yên. Lắc hoặc để ống bẩn thì bạc sẽ kết thành bột xám chứ không bám thành gương.' },
    { nhan: 'Bạc bám thành ống', giay: 7, hienTuong: 'Thành ống nghiệm phủ một lớp bạc sáng như gương. Aldehyde đã bị oxi hoá thành muối của acid, còn Ag⁺ bị khử thành Ag kim loại. Ketone không cho phản ứng này.' },
  ],
  cam: { yaw: 0.26, pitch: 0.2 },
  phong: 1.05,
  tao: () => ({}),
  ve: ({ ctx, P, buoc, tienDo }: KhungVe<Record<string, never>>) => {
    const trong = mau('--mau-dd-trong'), nuoc = mau('--mau-dd-trong');
    /* Kết tủa xuất hiện rồi tan lại — chỗ dễ làm hỏng nhất của bài. */
    const tua = buoc === 0 ? Math.max(0, Math.sin(Math.min(1, tienDo * 1.15) * Math.PI)) : 0;
    const ngam = buoc === 2 ? tienDo : buoc > 2 ? 1 : 0;
    const guong = buoc === 3 ? Math.min(1, tienDo * 1.2) : 0;
    const dy = noiSuy(0, -0.26, ngam);
    const ong = { x: 0, z: 0, yDay: Y_DAY + dy, yMieng: Y_MIENG + dy, r: R_ONG, muc: MUC + dy, mauLong: trong, dam: 0.22 };

    veMatBan(ctx, P, -1.85);
    const veOng = () => veOngNghiem(ctx, P, ong, () => {
      if (tua > 0.03) {
        const hat: Hat[] = [];
        for (let i = 0; i < 12; i++) {
          const g = i * 2.399963, r = 0.2 * Math.sqrt((i + 0.5) / 12);
          hat.push(hatMoi([Math.cos(g) * r, Y_DAY + 0.12 + (i % 3) * 0.08, Math.sin(g) * r], [0, 0, 0], 9, 0.055));
        }
        veHatRan(ctx, P, hat, mau('--chu-mo'), tua);
      }
      veTrangGuong(ctx, P, ong, guong);
    });

    if (ngam > 0.04) {
      veCoc(ctx, P, {
        x: 0, z: 0, yDay: -1.6, yMieng: -0.35, r: 0.62,
        muc: noiSuy(-1.6, -0.5, ngam), mauLong: nuoc, dam: 0.28,
      }, veOng);
      veNhan(ctx, P, [0, -1.9, 0], 'cốc nước nóng 70 – 80 °C', 12);
    } else {
      veOng();
    }

    if (buoc <= 1) {
      const q = P(giua([0, 1.55, 0], [0, MUC, 0], (tienDo * 3) % 1) as V3);
      veQuaCau(ctx, q.x, q.y, 0.065 * q.s, trong, 0.95);
      veNhan(ctx, P, [1.3, 1.5, 0], buoc === 0 ? 'dung dịch NH₃' : 'acetaldehyde', 12);
    }
    veNhan(ctx, P, [-1.35, MUC + dy - 0.15, 0], buoc === 0 ? 'AgNO₃' : 'thuốc thử Tollens', 12);
    if (guong > 0.5) veNhan(ctx, P, [1.4, MUC + dy - 0.1, 0], 'lớp bạc sáng như gương', 12, mau('--chu-dam'));
  },
});

/* ── oxi hoá aldehyde bằng Cu(OH)₂ ───────────────────────────────────────── */

export const b23Cuoh2 = dinhNghia<Record<string, never>>({
  id: 'b23-cuoh2',
  baiId: 'bai-23',
  ten: 'Oxi hoá aldehyde bằng Cu(OH)₂ trong môi trường kiềm',
  nhan: 'Bài 23 · SGK tr. 141',
  moTaAria: 'Cảnh 3D: tạo Cu(OH)₂ xanh lam rồi thêm acetaldehyde và đun, kết tủa chuyển sang đỏ gạch.',
  ptHoaHoc: [
    'CuSO₄ + 2NaOH → Cu(OH)₂↓ (xanh lam) + Na₂SO₄',
    'CH₃CHO + 2Cu(OH)₂ + NaOH → CH₃COONa + Cu₂O↓ (đỏ gạch) + 3H₂O  (t°)',
  ],
  buoc: [
    { nhan: 'Trộn CuSO₄ với NaOH', giay: 4, hienTuong: 'Xuất hiện kết tủa xanh lam Cu(OH)₂.' },
    { nhan: 'Thêm acetaldehyde', giay: 4, hienTuong: 'Thêm khoảng 1 mL acetaldehyde vào ống, kết tủa vẫn xanh — ở nhiệt độ thường chưa thấy gì.' },
    { nhan: 'Đun nhẹ trên đèn cồn', giay: 7, hienTuong: 'Đun nhẹ thì kết tủa xanh lam chuyển dần sang đỏ gạch: Cu²⁺ bị khử thành Cu₂O. Đây là phép thử aldehyde không cần dụng cụ đặc biệt như tráng bạc.' },
  ],
  cam: { yaw: 0.28, pitch: 0.2 },
  phong: 1.05,
  tao: () => ({}),
  ve: ({ ctx, P, buoc, tienDo, tong }: KhungVe<Record<string, never>>) => {
    const xanh = mau('--mau-cu-oh2'), doGach = mau('--mau-cu2o'), trong = mau('--mau-dd-trong');
    const tao = buoc === 0 ? Math.min(1, tienDo * 1.3) : 1;
    const doi = buoc === 2 ? Math.min(1, tienDo * 1.15) : 0;
    const lua = buoc === 2 ? Math.min(1, tienDo * 2.5) : 0;

    veMatBan(ctx, P, -2.0);
    if (buoc === 2) veDenCon(ctx, P, 0, 0, -1.95, tong, lua);
    veOngNghiem(ctx, P, {
      x: 0, z: 0, yDay: Y_DAY, yMieng: Y_MIENG, r: R_ONG, muc: MUC, mauLong: trong, dam: 0.2,
    }, () => {
      const hat: Hat[] = [];
      const n = Math.round(tao * 18);
      for (let i = 0; i < n; i++) {
        const g = i * 2.399963, r = 0.22 * Math.sqrt((i + 0.5) / 18);
        hat.push(hatMoi([Math.cos(g) * r, Y_DAY + 0.12 + (i % 4) * 0.08, Math.sin(g) * r], [0, 0, 0], 9, 0.06));
      }
      veHatRan(ctx, P, hat, tronMau(xanh, doGach, doi));
    });
    veNhan(ctx, P, [-1.35, MUC - 0.15, 0], buoc === 0 ? 'CuSO₄ + NaOH' : '+ acetaldehyde', 12);
    if (buoc === 1) {
      const q = P(giua([0, 1.55, 0], [0, MUC, 0], (tienDo * 3) % 1) as V3);
      veQuaCau(ctx, q.x, q.y, 0.065 * q.s, trong, 0.95);
    }
    if (doi > 0.5) veNhan(ctx, P, [1.4, Y_DAY + 0.35, 0], 'Cu₂O đỏ gạch', 12, mau('--chu-dam'));
    else if (tao > 0.6) veNhan(ctx, P, [1.4, Y_DAY + 0.35, 0], 'Cu(OH)₂ xanh lam', 12, mau('--chu'));
  },
});

/* ── phản ứng tạo iodoform ───────────────────────────────────────────────── */

interface StIod { bot: Hat[]; dem: number }

export const b23Iodoform = dinhNghia<StIod>({
  id: 'b23-iodoform',
  baiId: 'bai-23',
  ten: 'Phản ứng tạo iodoform',
  nhan: 'Bài 23 · SGK tr. 142',
  moTaAria: 'Cảnh 3D: trộn dung dịch iodine trong KI với NaOH rồi thêm acetone, xuất hiện kết tủa vàng.',
  ptHoaHoc: ['CH₃COCH₃ + 3I₂ + 4NaOH → CHI₃↓ (vàng) + CH₃COONa + 3NaI + 3H₂O'],
  buoc: [
    { nhan: 'Trộn I₂/KI với NaOH', giay: 4, hienTuong: 'Dung dịch iodine màu nâu nhạt màu đi khi thêm NaOH.' },
    { nhan: 'Thêm acetone và lắc', giay: 4, hienTuong: 'Thêm khoảng 0,5 mL acetone rồi lắc nhẹ.' },
    { nhan: 'Kết tủa vàng iodoform', giay: 7, hienTuong: 'Xuất hiện kết tủa màu vàng có mùi đặc trưng — đó là iodoform CHI₃. Phản ứng này nhận ra nhóm CH₃–CO– nên dùng được cho cả ketone, khác với hai phép thử trước.' },
  ],
  cam: { yaw: 0.28, pitch: 0.2 },
  phong: 1.1,
  tao: () => ({ bot: [], dem: 0 }),
  ve: ({ ctx, P, buoc, tienDo, dt, tt }: KhungVe<StIod>) => {
    const iod = mau('--mau-i2'), vang = mau('--mau-ket-tua-vang'), trong = mau('--mau-dd-trong');
    const nhat = buoc === 0 ? Math.min(1, tienDo * 1.2) : 1;
    const tua = buoc === 2 ? Math.min(1, tienDo * 1.2) : 0;

    if (dt > 0) {
      tt.dem += dt;
      if (buoc === 1 && tt.dem > 0.12) {
        tt.dem = 0;
        tt.bot.push(hatMoi([nhienNgau(-0.15, 0.15), Y_DAY + 0.15, nhienNgau(-0.12, 0.12)],
          [0, nhienNgau(0.35, 0.6), 0], 1.6, nhienNgau(0.03, 0.05)));
      }
      tt.bot = chayHat(tt.bot, dt, [0, 0.2, 0], 0.18).filter(h => h.p[1] < MUC - 0.02);
    }

    veMatBan(ctx, P, -1.5);
    veOngNghiem(ctx, P, {
      x: 0, z: 0, yDay: Y_DAY, yMieng: Y_MIENG, r: R_ONG, muc: MUC,
      mauLong: tronMau(iod, trong, nhat * 0.65), dam: noiSuy(0.55, 0.28, nhat),
    }, () => {
      veBotKhi(ctx, P, tt.bot, mauKhi('--mau-khoi', 0.4));
      if (tua > 0.04) {
        const hat: Hat[] = [];
        const n = Math.round(tua * 22);
        for (let i = 0; i < n; i++) {
          const g = i * 2.399963, r = 0.24 * Math.sqrt((i + 0.5) / 22);
          hat.push(hatMoi([Math.cos(g) * r, Y_DAY + 0.12 + (i % 4) * 0.09, Math.sin(g) * r], [0, 0, 0], 9, 0.055));
        }
        veHatRan(ctx, P, hat, vang);
      }
    });
    veNhan(ctx, P, [-1.3, MUC - 0.15, 0], buoc === 0 ? 'I₂ trong KI' : '+ acetone', 12);
    if (tua > 0.5) veNhan(ctx, P, [1.35, Y_DAY + 0.35, 0], 'CHI₃ ↓ vàng', 12, mau('--chu-dam'));
  },
});
