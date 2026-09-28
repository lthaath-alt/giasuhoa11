/**
 * BÀI 19 — DẪN XUẤT HALOGEN.
 *
 * Thuỷ phân bromoethane (SGK tr. 114). Cái bẫy của bài này là phải RỬA sạch
 * ion halide có sẵn trước, nếu không thì kết tủa AgBr cuối bài chẳng chứng minh
 * được gì — nên bước rửa được giữ thành một bước riêng trong mô phỏng.
 */
import {
  chayHat, Hat, hatMoi, mau, mauKhi, MucVe, nhienNgau, noiSuy, tronMau, V3,
  veBotKhi, veDenCon, veHatRan, veLopLong, veMatBan, veNhan, veOngDan, veOngNghiem,
  veQuaCau, veTheoChieuSau,
} from '../dungCu3d';
import { dinhNghia, giua, KhungVe } from '../kichBan';

interface St { bot: Hat[]; dem: number }

const X1 = -0.95, X2 = 1.05;
const Y_DAY = -1.1, Y_MIENG = 0.85, R = 0.33;

export const b19ThuyPhan = dinhNghia<St>({
  id: 'b19-thuy-phan',
  baiId: 'bai-19',
  ten: 'Thuỷ phân bromoethane',
  nhan: 'Bài 19 · SGK tr. 114',
  moTaAria: 'Cảnh 3D: ống nghiệm bromoethane hai lớp, đun với NaOH rồi thử lớp nước bằng AgNO₃ cho kết tủa vàng nhạt.',
  ptHoaHoc: [
    'C₂H₅Br + NaOH → C₂H₅OH + NaBr  (t°)',
    'NaBr + AgNO₃ → AgBr↓ (vàng nhạt) + NaNO₃',
  ],
  buoc: [
    { nhan: 'Lắc C₂H₅Br với nước, rửa sạch', giay: 5, hienTuong: 'C₂H₅Br không tan, nặng hơn nước nên nằm dưới. Rửa và thử lớp nước bằng AgNO₃ tới khi KHÔNG còn kết tủa — nghĩa là đã hết ion halide có sẵn, kết tủa về sau mới là do phản ứng.' },
    { nhan: 'Thêm NaOH, đun 5 phút', giay: 6, hienTuong: 'Thêm NaOH 10 % rồi đun. Lớp C₂H₅Br mỏng dần: nó đang bị thuỷ phân thành ethanol tan trong nước.' },
    { nhan: 'Trung hoà NaOH dư bằng HNO₃', giay: 4, hienTuong: 'Lấy một ít lớp nước sang ống khác rồi trung hoà NaOH dư bằng HNO₃ — bỏ qua bước này thì AgNO₃ sẽ tạo kết tủa với OH⁻ chứ không phải với Br⁻.' },
    { nhan: 'Nhỏ AgNO₃ 1 %', giay: 7, hienTuong: 'Xuất hiện kết tủa màu vàng nhạt — đó là AgBr. Vậy nguyên tử bromine đã rời khỏi phân tử và vào dung dịch dưới dạng ion Br⁻.' },
  ],
  cam: { yaw: 0.28, pitch: 0.2 },
  phong: 0.98,
  tao: () => ({ bot: [], dem: 0 }),
  ve: ({ ctx, P, buoc, tienDo, tGiay, tong, dt, tt }: KhungVe<St>) => {
    const trong = mau('--mau-dd-trong'), huuCo = mau('--mau-huu-co'), tua = mau('--mau-ket-tua-vang');
    const dun = buoc === 1;
    const lua = dun ? Math.min(1, tienDo * 2) : 0;
    /* Lớp C₂H₅Br mỏng dần trong lúc đun — đó là dấu hiệu nó đang bị thuỷ phân. */
    const conBr = buoc <= 0 ? 1 : buoc === 1 ? 1 - tienDo * 0.75 : 0.2;
    const sangOng2 = buoc >= 2;
    const ketTua = buoc === 3 ? Math.min(1, tienDo * 1.2) : 0;

    if (dt > 0) {
      tt.dem += dt;
      if (dun && tt.dem > 0.1) {
        tt.dem = 0;
        tt.bot.push(hatMoi([X1 + nhienNgau(-0.15, 0.15), Y_DAY + 0.15, nhienNgau(-0.12, 0.12)],
          [0, nhienNgau(0.4, 0.7), 0], 1.6, nhienNgau(0.035, 0.06)));
      }
      tt.bot = chayHat(tt.bot, dt, [0, 0.2, 0], 0.2).filter(h => h.p[1] < 0.05);
    }

    veMatBan(ctx, P, -2.05);
    const ds: MucVe[] = [];

    ds.push({ z: 0, ve: () => {
      if (dun) veDenCon(ctx, P, X1, 0, -2.0, tong, lua);
      veOngNghiem(ctx, P, {
        x: X1, z: 0, yDay: Y_DAY, yMieng: Y_MIENG, r: R, muc: 0.15,
        mauLong: trong, dam: 0.22,
      }, () => {
        /* C₂H₅Br nặng hơn nước nên nằm DƯỚI — vẽ ngược là sai bản chất. */
        if (conBr > 0.05) veLopLong(ctx, P, X1, 0, R, Y_DAY + 0.06, Y_DAY + 0.06 + 0.42 * conBr, huuCo, 0.45);
        veBotKhi(ctx, P, tt.bot, mauKhi('--mau-khoi', 0.45));
      });
      veNhan(ctx, P, [X1, Y_MIENG + 0.4, 0], buoc === 0 ? 'C₂H₅Br + nước' : 'C₂H₅Br + NaOH', 12);
      if (conBr > 0.2) veNhan(ctx, P, [X1 - 1.0, Y_DAY + 0.25, 0], 'C₂H₅Br', 11, mau('--chu'));
    } });

    if (sangOng2) {
      ds.push({ z: 0.05, ve: () => {
        veOngNghiem(ctx, P, {
          x: X2, z: 0, yDay: Y_DAY, yMieng: Y_MIENG, r: R, muc: -0.25,
          mauLong: tronMau(trong, tua, ketTua * 0.5), dam: noiSuy(0.22, 0.45, ketTua),
        }, () => {
          if (ketTua > 0.05) {
            const hat: Hat[] = [];
            const n = Math.round(ketTua * 16);
            for (let i = 0; i < n; i++) {
              const g = i * 2.399963, r = 0.2 * Math.sqrt((i + 0.5) / 16);
              hat.push(hatMoi([X2 + Math.cos(g) * r, Y_DAY + 0.1 + (i % 3) * 0.07, Math.sin(g) * r], [0, 0, 0], 9, 0.055));
            }
            veHatRan(ctx, P, hat, tua);
          }
        });
        veNhan(ctx, P, [X2, Y_MIENG + 0.4, 0], buoc === 2 ? 'lớp nước + HNO₃' : 'thêm AgNO₃', 12);
        if (ketTua > 0.5) veNhan(ctx, P, [X2 + 1.0, Y_DAY + 0.3, 0], 'AgBr ↓ vàng nhạt', 12, mau('--chu-dam'));
      } });
    }
    veTheoChieuSau(ds);

    /* Giọt thuốc thử rơi xuống ống 2 ở bước cuối. */
    if (buoc === 3) {
      const q = P(giua([X2, 1.5, 0], [X2, -0.25, 0], (tGiay * 1.6) % 1) as V3);
      veQuaCau(ctx, q.x, q.y, 0.065 * q.s, trong, 0.95);
      veOngDan(ctx, P, [[X2, 2.0, 0], [X2, 1.55, 0]]);
    }
  },
});
