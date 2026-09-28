/**
 * BÀI 15 — ALKANE.
 *
 * Hai thí nghiệm SGK đều để trả lời một câu: alkane trơ tới mức nào. Bromine
 * chỉ phản ứng khi được đun ấm (phản ứng THẾ, cần năng lượng), còn KMnO₄ thì
 * chịu — nên cảnh phải giữ nguyên màu tím, đừng vẽ cho "đẹp".
 */
import {
  chayHat, Hat, hatMoi, mau, mauKhi, MucVe, nhienNgau, noiSuy, tronMau,
  veBatSu, veCoc, veHatMem, veLopLong, veLua, veMatBan, veNhan, veOngNghiem, veQueDom, veTheoChieuSau,
} from '../dungCu3d';
import { dinhNghia, KhungVe } from '../kichBan';

/* ── bromine hoá hexane ──────────────────────────────────────────────────── */

const R_ONG = 0.34, Y_DAY = -1.0, Y_MIENG = 0.95, Y_RANH = -0.25, Y_MAT = 0.3;

export const b15HexaneBromine = dinhNghia<Record<string, never>>({
  id: 'b15-hexane-bromine',
  baiId: 'bai-15',
  ten: 'Phản ứng bromine hoá hexane',
  nhan: 'Bài 15 · SGK tr. 86',
  moTaAria: 'Cảnh 3D: ống nghiệm hai lớp hexane và nước bromine, ngâm vào cốc nước ấm cho màu vàng nhạt dần.',
  ptHoaHoc: ['C₆H₁₄ + Br₂ → C₆H₁₃Br + HBr  (ánh sáng hoặc đun nóng)'],
  buoc: [
    { nhan: 'Cho hexane và nước bromine', giay: 3, hienTuong: 'Hai chất lỏng tách hai lớp: hexane nhẹ hơn nổi trên, nước bromine màu vàng ở dưới.' },
    { nhan: 'Lắc ở nhiệt độ thường', giay: 5, hienTuong: 'Lắc xong, bromine tan bớt sang lớp hexane nên lớp trên ngả vàng, nhưng TỔNG lượng bromine gần như không đổi — mới chỉ là hoà tan, chưa phản ứng.' },
    { nhan: 'Ngâm cốc nước ấm 50 °C', giay: 4, hienTuong: 'Đặt ống nghiệm vào cốc nước ấm khoảng 50 °C.' },
    { nhan: 'Màu vàng nhạt dần', giay: 7, hienTuong: 'Được đun ấm thì màu vàng nhạt dần rồi mất: bromine đã thế vào phân tử hexane, sinh ra HBr. Alkane không cộng, chỉ thế — và phải có năng lượng mới xảy ra.' },
  ],
  cam: { yaw: 0.28, pitch: 0.2 },
  phong: 1.05,
  tao: () => ({}),
  ve: ({ ctx, P, buoc, tienDo }: KhungVe<Record<string, never>>) => {
    const brom = mau('--mau-brom'), hexane = mau('--mau-huu-co'), am = mau('--mau-dd-trong');
    const lac = buoc === 1 ? Math.min(1, tienDo * 1.4) : buoc > 1 ? 1 : 0;
    const ngam = buoc === 2 ? tienDo : buoc > 2 ? 1 : 0;
    const mat = buoc === 3 ? Math.min(1, tienDo * 1.15) : 0;
    const dy = noiSuy(0, -0.3, ngam);

    veMatBan(ctx, P, -1.85);
    if (ngam > 0.04) {
      veCoc(ctx, P, {
        x: 0, z: 0, yDay: -1.6, yMieng: -0.3, r: 0.62,
        muc: noiSuy(-1.6, -0.5, ngam), mauLong: am, dam: 0.3,
      }, () => veOngHaiLop());
      veNhan(ctx, P, [0, -1.9, 0], 'cốc nước ấm 50 °C', 12);
    } else {
      veOngHaiLop();
    }

    function veOngHaiLop() {
      veOngNghiem(ctx, P, {
        x: 0, z: 0, yDay: Y_DAY + dy, yMieng: Y_MIENG + dy, r: R_ONG, muc: Y_RANH + dy,
        mauLong: tronMau(brom, am, noiSuy(0.15, 1, mat)), dam: noiSuy(0.6, 0.18, mat),
      }, () => {
        /* Lớp hexane ở trên: lắc xong thì ngả vàng, đun ấm thì mất màu. */
        veLopLong(ctx, P, 0, 0, R_ONG, Y_RANH + dy, Y_MAT + dy,
          tronMau(hexane, brom, lac * 0.55 * (1 - mat)), 0.35);
      });
    }

    veNhan(ctx, P, [1.15, Y_MAT + dy - 0.15, 0], 'hexane', 12);
    veNhan(ctx, P, [1.15, Y_RANH + dy - 0.3, 0], mat > 0.85 ? 'đã mất màu' : 'nước bromine', 12);
  },
});

/* ── oxi hoá hexane ──────────────────────────────────────────────────────── */

interface StDot { khoi: Hat[]; dem: number }

export const b15OxiHoaHexane = dinhNghia<StDot>({
  id: 'b15-oxi-hoa-hexane',
  baiId: 'bai-15',
  ten: 'Phản ứng oxi hoá hexane',
  nhan: 'Bài 15 · SGK tr. 88',
  moTaAria: 'Cảnh 3D: ống nghiệm KMnO₄ giữ nguyên màu tím khi thêm hexane; bát sứ hexane bốc cháy với ngọn lửa vàng.',
  ptHoaHoc: ['C₆H₁₄ + KMnO₄: không phản ứng ở điều kiện thường', '2C₆H₁₄ + 19O₂ → 12CO₂ + 14H₂O  (t°)'],
  buoc: [
    { nhan: 'Nhỏ hexane vào KMnO₄', giay: 4, hienTuong: 'Hexane không tan, nổi thành lớp trên dung dịch KMnO₄ màu tím.' },
    { nhan: 'Lắc ống nghiệm', giay: 5, hienTuong: 'Lắc xong để yên, dung dịch KMnO₄ vẫn tím nguyên: alkane không bị KMnO₄ oxi hoá ở điều kiện thường. Đây là cách phân biệt alkane với alkene.' },
    { nhan: 'Đưa que đóm vào bát sứ', giay: 4, hienTuong: 'Cho một ít hexane vào bát sứ rồi đưa que đóm đang cháy lại gần.' },
    { nhan: 'Hexane cháy sáng', giay: 6, hienTuong: 'Hexane bốc cháy với ngọn lửa màu vàng, toả nhiều nhiệt và có khói nhẹ. Alkane không phản ứng với chất oxi hoá trong dung dịch, nhưng cháy tốt trong oxygen — đó là lý do nó làm nhiên liệu.' },
  ],
  cam: { yaw: 0.26, pitch: 0.22 },
  phong: 0.92,
  tao: () => ({ khoi: [], dem: 0 }),
  ve: ({ ctx, P, buoc, tienDo, tong, dt, tt }: KhungVe<StDot>) => {
    const tim = mau('--mau-kmno4'), hexane = mau('--mau-huu-co');
    const chay = buoc === 3 ? Math.min(1, tienDo * 2) : 0;
    const dom = buoc === 2 ? Math.min(1, tienDo * 1.5) : buoc > 2 ? 1 : 0;

    if (dt > 0) {
      tt.dem += dt;
      if (chay > 0.3 && tt.dem > 0.16) {
        tt.dem = 0;
        tt.khoi.push(hatMoi([1.15 + nhienNgau(-0.15, 0.15), -0.75, nhienNgau(-0.15, 0.15)],
          [nhienNgau(-0.06, 0.06), nhienNgau(0.4, 0.7), 0], 2, 0.14));
      }
      tt.khoi = chayHat(tt.khoi, dt, [0, 0.08, 0], 0.08);
    }

    veMatBan(ctx, P, -1.6);
    const ds: MucVe[] = [];
    ds.push({ z: 0, ve: () => {
      veOngNghiem(ctx, P, {
        x: -1.15, z: 0, yDay: -1.15, yMieng: 0.8, r: 0.32, muc: -0.3, mauLong: tim, dam: 0.62,
      }, () => veLopLong(ctx, P, -1.15, 0, 0.32, -0.3, 0.1, hexane, 0.3));
      veNhan(ctx, P, [-1.15, -1.45, 0], 'KMnO₄ + hexane', 12);
      if (buoc >= 1) veNhan(ctx, P, [-1.15, 1.15, 0], 'tím không đổi', 12, mau('--chu-dam'));
    } });
    ds.push({ z: 0.05, ve: () => {
      veBatSu(ctx, P, { x: 1.15, z: 0, yDay: -1.15, r: 0.55, muc: -0.95, mauLong: hexane });
      if (dom > 0.02 && chay < 0.6) {
        const cao = noiSuy(0.9, -0.55, dom);
        veQueDom(ctx, P, [1.95, cao + 0.75, 0], [1.3, cao, 0], tong, 1);
      }
      if (chay > 0.02) {
        /* Ngọn lửa hexane: vàng cam, không xanh như cồn. */
        veLua(ctx, P, [1.15, -0.88, 0], 0.95, 0.3, tong, mau('--mau-lua'), mau('--mau-lua-trong'), chay);
      }
      veNhan(ctx, P, [1.15, -1.45, 0], 'bát sứ đựng hexane', 12);
    } });
    veTheoChieuSau(ds);
    veHatMem(ctx, P, tt.khoi, mauKhi('--mau-khoi', 0.5), 0.3);
  },
});
