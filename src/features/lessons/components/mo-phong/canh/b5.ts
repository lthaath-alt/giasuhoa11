/**
 * BÀI 5 — AMMONIA VÀ MUỐI AMMONIUM.
 *
 * · Nhận biết ion ammonium trong phân đạm (SGK tr. 36).
 * · NH₃ gặp HCl tạo "khói trắng" (ngoài SGK, giáo viên biểu diễn).
 */
import {
  chayHat, Hat, hatMoi, mau, mauKhi, MucVe, nhienNgau, noiSuy, tronMau, veBotKhi, veCoc, veDenCon, veDua,
  veGiay, veHatMem, veHatRan, veKepGo, veMatBan, veNhan, veOngNghiem, veTheoChieuSau,
} from '../dungCu3d';
import { dinhNghia, giua, KhungVe } from '../kichBan';

interface StNh4 { bot: Hat[]; khi: Hat[]; demBot: number; demKhi: number }

const R_ONG = 0.33, Y_DAY = -1.05, Y_MIENG = 0.85;
const X_TRAI = -0.85, X_PHAI = 0.85;

/** Mặt thoáng: bước 0 mới có nước hoà phân, bước 1 thêm NaOH nên dâng lên. */
const mucOng = (buoc: number, tienDo: number) =>
  buoc === 0 ? -0.42 : buoc === 1 ? noiSuy(-0.42, -0.08, tienDo) : -0.08;

export const b5NhanBietNh4 = dinhNghia<StNh4>({
  id: 'b5-nhan-biet-nh4',
  baiId: 'bai-5',
  ten: 'Nhận biết ion ammonium trong phân đạm',
  nhan: 'Bài 5 · SGK tr. 36',
  moTaAria: 'Cảnh 3D: hai ống nghiệm đựng phân đạm trên hai đèn cồn, mẩu giấy pH ướt đặt trên miệng ống.',
  ptHoaHoc: ['NH₄Cl + NaOH → NaCl + NH₃↑ + H₂O (t°)', 'KNO₃ + NaOH: không phản ứng'],
  buoc: [
    { nhan: 'Hoà phân vào nước', giay: 4, hienTuong: 'Hai ống đều cho dung dịch không màu: nhìn bề ngoài chưa phân biệt được ống nào chứa muối ammonium.' },
    { nhan: 'Thêm NaOH 20 %', giay: 4, hienTuong: 'Thêm kiềm vào cả hai ống. Ở nhiệt độ thường chưa thấy dấu hiệu gì rõ rệt.' },
    { nhan: 'Đun nhẹ', giay: 6, hienTuong: 'Ống NH₄Cl sủi bọt và bốc khí mùi khai; ống KNO₃ vẫn im, chỉ có hơi nước.' },
    { nhan: 'Đưa giấy pH ướt lên miệng ống', giay: 7, hienTuong: 'Giấy pH trên ống NH₄Cl chuyển xanh (môi trường base); giấy trên ống KNO₃ giữ nguyên màu. Đó là dấu hiệu nhận biết ion NH₄⁺.' },
  ],
  cam: { yaw: 0.3, pitch: 0.2 },
  phong: 0.95,
  tao: () => ({ bot: [], khi: [], demBot: 0, demKhi: 0 }),
  ve: ({ ctx, P, buoc, tienDo, tong, dt, tt }: KhungVe<StNh4>) => {
    const dd = mau('--mau-dd-trong'), khiMau = mauKhi('--mau-khoi', 0.5), ran = mauKhi('--mau-ket-tua', 0.34);
    const muc = mucOng(buoc, tienDo);
    const dun = buoc >= 2;
    const lua = buoc === 2 ? Math.min(1, tienDo * 2.5) : buoc > 2 ? 1 : 0;
    /* Chỉ ống NH₄Cl (bên trái) mới có phản ứng: đây là chỗ học sinh phải thấy
       khác nhau, nên bọt và khí chỉ sinh ra ở ống trái. */
    const soi = dun ? (buoc === 2 ? Math.min(1, tienDo * 2) : 1) : 0;

    if (dt > 0 && soi > 0) {
      tt.demBot += dt;
      if (tt.demBot > 0.08 / soi) {
        tt.demBot = 0;
        tt.bot.push(hatMoi(
          [X_TRAI + nhienNgau(-0.16, 0.16), Y_DAY + 0.12, nhienNgau(-0.16, 0.16)],
          [0, nhienNgau(0.5, 0.85), 0], 1.6, nhienNgau(0.035, 0.06),
        ));
      }
      tt.demKhi += dt;
      if (tt.demKhi > 0.13) {
        tt.demKhi = 0;
        tt.khi.push(hatMoi(
          [X_TRAI + nhienNgau(-0.1, 0.1), Y_MIENG + 0.05, nhienNgau(-0.1, 0.1)],
          [nhienNgau(-0.08, 0.08), nhienNgau(0.3, 0.5), 0], 2.4, 0.12,
        ));
      }
    }
    if (dt > 0) {
      tt.bot = chayHat(tt.bot, dt, [0, 0.25, 0], 0.25).filter(h => h.p[1] < muc - 0.03);
      tt.khi = chayHat(tt.khi, dt, [0, 0.1, 0], 0.12);
    }

    veMatBan(ctx, P, -2.12);

    const ds: MucVe[] = [];
    for (const x of [X_TRAI, X_PHAI]) {
      const trai = x === X_TRAI;
      ds.push({ z: P([x, 0, 0]).z, ve: () => {
        veDenCon(ctx, P, x, 0, -2.1, tong, lua);
        veKepGo(ctx, P, x, 0, 0.5, R_ONG);
        veOngNghiem(ctx, P, { x, z: 0, yDay: Y_DAY, yMieng: Y_MIENG, r: R_ONG, muc, mauLong: dd, dam: 0.22 }, () => {
          /* Bước 0: phân bón chưa tan hết — mấy hạt rắn dưới đáy, mờ dần. */
          if (buoc === 0) {
            const hatRan: Hat[] = [];
            for (let i = 0; i < 7; i++) {
              const g = (i / 7) * 6.283;
              hatRan.push(hatMoi([x + Math.cos(g) * 0.14, Y_DAY + 0.07, Math.sin(g) * 0.14], [0, 0, 0], 9, 0.05));
            }
            veHatRan(ctx, P, hatRan, ran, 1 - tienDo * 0.8);
          }
          if (trai) veBotKhi(ctx, P, tt.bot, khiMau);
        });
        if (trai) veHatMem(ctx, P, tt.khi, khiMau, 0.5);
        veNhan(ctx, P, [x + (trai ? -0.95 : 0.95), -0.45, 0], trai ? 'NH₄Cl' : 'KNO₃', 14);

        /* Giấy pH ướt hơ trên miệng ống: chỉ ống có NH₃ mới làm giấy hoá xanh. */
        if (buoc >= 3) {
          const xanh = trai ? Math.min(1, tienDo * 1.6) : 0;
          veGiay(ctx, P, [x, Y_MIENG + 0.42, 0], 0.34, 0.24, tronMau(mau('--mau-giay-ph'), mau('--mau-quy-xanh'), xanh));
        }
      } });
    }
    veTheoChieuSau(ds);

    if (buoc >= 2) {
      veNhan(ctx, P, [X_TRAI, Y_MIENG + 1.0, 0], 'NH₃ ↑ mùi khai', 12, mau('--chu'));
    }
  },
});

/* ────────────────────────────────────────────────────────────────────────── */

interface StKhoi { khoi: Hat[]; dem: number }

const X_LO = 1.55;

export const b5Nh3Hcl = dinhNghia<StKhoi>({
  id: 'b5-nh3-hcl',
  baiId: 'bai-5',
  ten: 'NH₃ gặp HCl tạo "khói trắng"',
  nhan: 'Bài 5 · gợi ý thêm',
  moTaAria: 'Cảnh 3D: hai đũa thuỷ tinh nhúng dung dịch ammonia đặc và hydrochloric acid đặc, đưa lại gần nhau trong tủ hút.',
  ptHoaHoc: ['NH₃(g) + HCl(g) → NH₄Cl(s)'],
  buoc: [
    { nhan: 'Nhúng hai đũa', giay: 4, hienTuong: 'Một đũa nhúng dung dịch NH₃ đặc, đũa kia nhúng HCl đặc. Cả hai dung dịch đều bay hơi mạnh.' },
    { nhan: 'Đưa lại gần nhau', giay: 4, hienTuong: 'Hai đầu đũa tiến lại gần (không chạm). Hơi NH₃ và hơi HCl gặp nhau trong không khí.' },
    { nhan: 'Khói trắng xuất hiện', giay: 7, hienTuong: 'Giữa hai đầu đũa hiện lên đám khói trắng dày dần: đó là vô số hạt NH₄Cl rắn rất nhỏ lơ lửng trong không khí.' },
  ],
  cam: { yaw: 0.18, pitch: 0.16 },
  phong: 1.05,
  tao: () => ({ khoi: [], dem: 0 }),
  ve: ({ ctx, P, buoc, tienDo, dt, tt }: KhungVe<StKhoi>) => {
    const khoiMau = mauKhi('--mau-khoi', 0.42), thuy = mau('--mau-dd-trong');
    /* Bước 1 là lúc hai đũa đi vào giữa; bước 2 đứng yên cho khói dày lên. */
    const ke = buoc === 0 ? 0 : buoc === 1 ? tienDo : 1;
    const dauTrai = giua([-X_LO, 0.25, 0], [-0.3, 0.35, 0], ke);
    const dauPhai = giua([X_LO, 0.25, 0], [0.3, 0.35, 0], ke);

    if (dt > 0) {
      const manh = buoc >= 2 ? 1 : buoc === 1 ? ke * 0.35 : 0;
      tt.dem += dt;
      if (manh > 0 && tt.dem > 0.05 / manh) {
        tt.dem = 0;
        tt.khoi.push(hatMoi(
          [nhienNgau(-0.28, 0.28), 0.35 + nhienNgau(-0.12, 0.12), nhienNgau(-0.12, 0.12)],
          [nhienNgau(-0.1, 0.1), nhienNgau(0.12, 0.3), 0], 2.8, nhienNgau(0.16, 0.3),
        ));
      }
      tt.khoi = chayHat(tt.khoi, dt, [0, 0.06, 0], 0.1);
    }

    veMatBan(ctx, P, -1.5);

    const ds: MucVe[] = [];
    /* Hai lọ đựng dung dịch đặc, đũa gác trên miệng lọ. */
    for (const x of [-X_LO, X_LO]) {
      ds.push({ z: P([x, 0, 0]).z, ve: () => {
        veCoc(ctx, P, { x, z: 0, yDay: -1.48, yMieng: -0.75, r: 0.42, muc: -1.0, mauLong: thuy, dam: 0.3 });
        veNhan(ctx, P, [x, -1.75, 0], x < 0 ? 'NH₃ đặc' : 'HCl đặc', 13);
      } });
    }
    ds.push({ z: 0.02, ve: () => {
      veDua(ctx, P, [-X_LO - 0.5, -0.1, 0], dauTrai, thuy);
      veDua(ctx, P, [X_LO + 0.5, -0.1, 0], dauPhai, thuy);
      veHatMem(ctx, P, tt.khoi, khoiMau, 0.6);
    } });
    veTheoChieuSau(ds);

    if (buoc >= 2) veNhan(ctx, P, [0, 1.35, 0], 'khói trắng NH₄Cl', 13, mau('--chu-dam'));
  },
});
