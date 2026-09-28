/**
 * BÀI 6 — MỘT SỐ HỢP CHẤT CỦA NITROGEN VỚI OXYGEN.
 *
 * Copper tác dụng với nitric acid đặc (ngoài SGK, giáo viên biểu diễn trong tủ
 * hút). Miệng ống luôn có nút bông tẩm NaOH: trong mô phỏng khí NO₂ cũng KHÔNG
 * thoát ra ngoài, đúng như cách làm an toàn.
 */
import {
  baoLoi, chayHat, Hat, hatMoi, mau, nhienNgau, noiSuy, to, tronMau, trongSuot,
  veBotKhi, veManhKimLoai, veMatBan, veNhan, veNutBong, veOngNghiem, vongTron,
} from '../dungCu3d';
import { dinhNghia, KhungVe, giua } from '../kichBan';

interface St { bot: Hat[]; dem: number }

const X = 0, R = 0.42, Y_DAY = -1.25, Y_MIENG = 1.15;

export const b6CuHno3 = dinhNghia<St>({
  id: 'b6-cu-hno3',
  baiId: 'bai-6',
  ten: 'Copper tác dụng với nitric acid đặc',
  nhan: 'Bài 6 · gợi ý thêm',
  moTaAria: 'Cảnh 3D: ống nghiệm đựng nitric acid đặc, nút bông tẩm NaOH ở miệng, mảnh copper tan dần và khí màu nâu đỏ đầy ống.',
  ptHoaHoc: ['Cu + 4HNO₃(đặc) → Cu(NO₃)₂ + 2NO₂↑ + 2H₂O'],
  buoc: [
    { nhan: 'Thả mảnh Cu', giay: 4, hienTuong: 'Ống nghiệm đựng HNO₃ đặc không màu. Thả mảnh copper đỏ vào, phản ứng bắt đầu ngay ở nhiệt độ thường.' },
    { nhan: 'Khí nâu đỏ thoát ra', giay: 6, hienTuong: 'Bọt khí nổi lên liên tục, phần ống phía trên dung dịch đầy khí màu nâu đỏ — đó là NO₂. Nút bông tẩm NaOH giữ khí lại, không cho thoát ra ngoài.' },
    { nhan: 'Dung dịch chuyển xanh lục', giay: 6, hienTuong: 'Mảnh copper mòn dần, dung dịch đậm màu xanh lục: màu xanh lam của ion Cu²⁺ lẫn với NO₂ hoà tan trong dung dịch đặc.' },
    { nhan: 'Pha loãng bằng nước', giay: 6, hienTuong: 'Thêm nước: NO₂ hoà tan loãng ra, chỉ còn màu xanh lam đặc trưng của ion Cu²⁺.' },
  ],
  cam: { yaw: 0.34, pitch: 0.2 },
  phong: 1.05,
  tao: () => ({ bot: [], dem: 0 }),
  ve: ({ ctx, P, buoc, tienDo, dt, tt }: KhungVe<St>) => {
    const trong = mau('--mau-dd-trong'), luc = mau('--mau-cu-xanh-luc'), lam = mau('--mau-cu-xanh-lam');
    const no2 = mau('--mau-no2'), dong = mau('--mau-dong');

    /* Mức và màu dung dịch suy thẳng từ bước — tua tới lui vẫn đúng cảnh. */
    const muc = buoc < 3 ? -0.3 : noiSuy(-0.3, 0.25, tienDo);
    const mauDd = buoc <= 1 ? trong
      : buoc === 2 ? tronMau(trong, luc, Math.min(1, tienDo * 1.3))
        : tronMau(luc, lam, Math.min(1, tienDo * 1.2));
    const damDd = buoc <= 1 ? 0.22 : buoc === 2 ? noiSuy(0.22, 0.62, tienDo) : noiSuy(0.62, 0.5, tienDo);

    /* Khí NO₂ đầy dần từ bước 1, loãng bớt khi pha nước. */
    const damKhi = buoc === 0 ? 0
      : buoc === 1 ? noiSuy(0, 0.45, tienDo)
        : buoc === 2 ? noiSuy(0.45, 0.6, tienDo) : noiSuy(0.6, 0.3, tienDo);

    /* Mảnh copper rơi ở bước 0 rồi mòn dần — bước 3 gần như tan hết. */
    const roi = buoc === 0 ? Math.min(1, tienDo * 1.6) : 1;
    const viTriCu = giua([X, 1.5, 0], [X, Y_DAY + 0.16, 0], roi);
    const coCu = buoc < 2 ? 1 : buoc === 2 ? 1 - tienDo * 0.65 : Math.max(0, 0.35 - tienDo * 0.35);

    const soi = buoc >= 1 && coCu > 0 ? (buoc === 1 ? Math.min(1, tienDo * 2) : 1) : 0;
    if (dt > 0) {
      tt.dem += dt;
      if (soi > 0 && tt.dem > 0.06 / soi) {
        tt.dem = 0;
        tt.bot.push(hatMoi(
          [X + nhienNgau(-0.18, 0.18), Y_DAY + 0.18, nhienNgau(-0.18, 0.18)],
          [0, nhienNgau(0.45, 0.8), 0], 2, nhienNgau(0.04, 0.075),
        ));
      }
      tt.bot = chayHat(tt.bot, dt, [0, 0.2, 0], 0.22).filter(h => h.p[1] < muc - 0.02);
    }

    veMatBan(ctx, P, -1.95);

    veOngNghiem(ctx, P, { x: X, z: 0, yDay: Y_DAY, yMieng: Y_MIENG, r: R, muc, mauLong: mauDd, dam: damDd }, () => {
      /* Khí nằm giữa mặt thoáng và miệng ống: tô khối đó bằng màu NO₂. */
      if (damKhi > 0.01) {
        to(ctx, baoLoi([...vongTron(P, X, 0, muc, R, 24), ...vongTron(P, X, 0, Y_MIENG - 0.08, R, 24)]), trongSuot(no2, damKhi));
      }
      if (coCu > 0.02) veManhKimLoai(ctx, P, viTriCu, 0.34 * coCu + 0.08, dong, 0.5);
      veBotKhi(ctx, P, tt.bot, no2);
    });

    veNutBong(ctx, P, X, 0, Y_MIENG, R);
    /* Nhãn để cách miệng ống một quãng: sát quá thì xoay cảnh là chữ đè lên nút bông. */
    veNhan(ctx, P, [X, Y_MIENG + 0.72, 0], 'bông tẩm NaOH', 12, mau('--chu'));
    veNhan(ctx, P, [X - 1.25, -0.45, 0], buoc <= 1 ? 'HNO₃ đặc' : 'Cu(NO₃)₂', 14);
    if (damKhi > 0.2) veNhan(ctx, P, [X + 1.15, 0.45, 0], 'NO₂ nâu đỏ', 13, mau('--chu-dam'));
  },
});
