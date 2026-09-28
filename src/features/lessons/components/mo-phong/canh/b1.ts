/**
 * BÀI 1 — KHÁI NIỆM VỀ CÂN BẰNG HOÁ HỌC.
 *
 * Ba thí nghiệm đều so ba ống cạnh nhau: một ống để so sánh, hai ống chịu tác
 * động. Cân bằng chuyển dịch không nhìn thấy được, chỉ thấy MÀU đậm nhạt — nên
 * cảnh dựng quanh đúng việc đó, và ống so sánh luôn đứng giữa cho dễ đối chiếu.
 */
import {
  chayHat, Hat, hatMoi, mau, mauKhi, MucVe, nhienNgau, noiSuy, V3,
  veCoc, veHatMem, veHatRan, veMatBan, veNhan, veNutBong, veOngNghiem, veQuaCau, veTheoChieuSau,
} from '../dungCu3d';
import { dinhNghia, giua, KhungVe } from '../kichBan';

const X_ONG = [-1.35, 0, 1.35];
const R = 0.34, Y_DAY = -1.05, Y_MIENG = 0.95;
const Y_COC_DAY = -1.5, Y_COC_MIENG = -0.25, R_COC = 0.58;

/** Ống 2 và ống 3 hạ xuống cốc khi ngâm; ống 1 đứng yên. */
const haXuong = (i: number, k: number) => (i === 0 ? 0 : noiSuy(0, -0.32, k));

interface StNo2 { hoi: Hat[]; dem: number }

export const b1No2NhietDo = dinhNghia<StNo2>({
  id: 'b1-no2-nhiet-do',
  baiId: 'bai-1',
  ten: 'Ảnh hưởng của nhiệt độ đến cân bằng 2NO₂ ⇌ N₂O₄',
  nhan: 'Bài 1 · SGK tr. 10',
  moTaAria: 'Cảnh 3D: ba ống nghiệm nút kín chứa khí NO₂; một ống ngâm nước đá, một ống ngâm nước nóng.',
  ptHoaHoc: ['2NO₂ (nâu đỏ) ⇌ N₂O₄ (không màu)   ΔH < 0'],
  buoc: [
    { nhan: 'Ba ống màu như nhau', giay: 3, hienTuong: 'Ba ống nghiệm nút kín đựng cùng một lượng khí NO₂, màu nâu đỏ như nhau.' },
    { nhan: 'Ngâm nước đá và nước nóng', giay: 4, hienTuong: 'Giữ ống 1 để so sánh; ngâm ống 2 vào cốc nước đá, ống 3 vào cốc nước nóng khoảng 1–2 phút.' },
    { nhan: 'So màu ba ống', giay: 7, hienTuong: 'Ống ngâm nước đá nhạt màu hơn hẳn ống so sánh; ống ngâm nước nóng nâu đỏ đậm hơn. Hạ nhiệt độ thì cân bằng chuyển dịch theo chiều toả nhiệt (tạo N₂O₄ không màu), tăng nhiệt độ thì ngược lại.' },
  ],
  cam: { yaw: 0.26, pitch: 0.2 },
  phong: 0.92,
  tao: () => ({ hoi: [], dem: 0 }),
  ve: ({ ctx, P, buoc, tienDo, dt, tt }: KhungVe<StNo2>) => {
    const no2 = mau('--mau-no2'), da = mau('--mau-nuoc-da'), nuoc = mau('--mau-dd-trong');
    const ngam = buoc === 1 ? tienDo : buoc > 1 ? 1 : 0;
    const doi = buoc === 2 ? Math.min(1, tienDo * 1.2) : 0;
    /* Đậm nhạt là toàn bộ nội dung thí nghiệm: ống lạnh nhạt đi, ống nóng đậm lên. */
    const damKhi = [0.45, noiSuy(0.45, 0.14, doi), noiSuy(0.45, 0.78, doi)];

    if (dt > 0) {
      tt.dem += dt;
      if (ngam > 0.5 && tt.dem > 0.22) {
        tt.dem = 0;
        tt.hoi.push(hatMoi([X_ONG[2] + nhienNgau(-0.3, 0.3), Y_COC_MIENG + 0.1, nhienNgau(-0.2, 0.2)],
          [nhienNgau(-0.05, 0.05), nhienNgau(0.25, 0.45), 0], 2.2, 0.13));
      }
      tt.hoi = chayHat(tt.hoi, dt, [0, 0.05, 0], 0.08);
    }

    veMatBan(ctx, P, -1.75);
    const ds: MucVe[] = X_ONG.map((x, i) => ({ z: 0, ve: () => {
      const dy = haXuong(i, ngam);
      /* Ống kín, trong ống chỉ có khí — không có chất lỏng nào. */
      const veOng = () => veOngNghiem(ctx, P, { x, z: 0, yDay: Y_DAY + dy, yMieng: Y_MIENG + dy, r: R, muc: Y_DAY - 1 });
      /* Tô khí bằng một lớp trong lòng ống. */
      const veKhi = () => {
        const q0 = P([x, Y_DAY + dy + 0.2, 0]), q1 = P([x, Y_MIENG + dy - 0.1, 0]);
        ctx.save();
        ctx.beginPath();
        ctx.ellipse((q0.x + q1.x) / 2, (q0.y + q1.y) / 2, R * 0.97 * q0.s, Math.abs(q1.y - q0.y) / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = no2;
        ctx.globalAlpha = damKhi[i];
        ctx.fill();
        ctx.restore();
      };
      if (i > 0 && ngam > 0.05) {
        veCoc(ctx, P, {
          x, z: 0, yDay: Y_COC_DAY, yMieng: Y_COC_MIENG, r: R_COC,
          muc: noiSuy(Y_COC_DAY, Y_COC_MIENG - 0.18, ngam), mauLong: i === 1 ? da : nuoc, dam: 0.4,
        }, () => { veKhi(); veOng(); });
        if (i === 1) {
          /* Vài viên đá nổi trên mặt nước. */
          for (const d of [-0.22, 0.05, 0.26]) {
            const q = P([x + d, Y_COC_MIENG - 0.16, d * 0.6]);
            veQuaCau(ctx, q.x, q.y, 0.1 * q.s, da, 0.95);
          }
        }
      } else {
        veKhi(); veOng();
      }
      veNutBong(ctx, P, x, 0, Y_MIENG + dy, R);
      veNhan(ctx, P, [x, Y_MIENG + dy + 0.55, 0], `Ống ${i + 1}`, 12, mau('--chu'));
      if (ngam > 0.4 && i > 0) veNhan(ctx, P, [x, Y_COC_DAY - 0.3, 0], i === 1 ? 'nước đá' : 'nước nóng', 12);
      if (i === 0 && ngam > 0.4) veNhan(ctx, P, [x, Y_COC_DAY - 0.3, 0], 'để so sánh', 12);
    } }));
    veTheoChieuSau(ds);
    veHatMem(ctx, P, tt.hoi, mauKhi('--mau-khoi', 0.4), 0.4);
    if (doi > 0.6) {
      veNhan(ctx, P, [X_ONG[1], 1.85, 0], 'nhạt ← N₂O₄ không màu · NO₂ nâu đỏ → đậm', 12, mau('--chu-dam'));
    }
  },
});

/* ── cân bằng thuỷ phân CH₃COONa ─────────────────────────────────────────── */

/** Ba ống dung dịch hồng phenolphthalein, dùng chung cho hai thí nghiệm sau. */
function veBaOngHong(
  ctx: CanvasRenderingContext2D, P: KhungVe['P'], dam: number[], dy: (i: number) => number,
  beTrong?: (i: number) => void, nhan?: (i: number) => string,
): void {
  const hong = mau('--mau-phenolphthalein');
  const ds: MucVe[] = X_ONG.map((x, i) => ({ z: 0, ve: () => {
    veOngNghiem(ctx, P, {
      x, z: 0, yDay: Y_DAY + dy(i), yMieng: Y_MIENG + dy(i), r: R, muc: -0.15 + dy(i),
      mauLong: hong, dam: dam[i],
    }, () => beTrong?.(i));
    veNhan(ctx, P, [x, Y_MIENG + dy(i) + 0.45, 0], nhan ? nhan(i) : `Ống ${i + 1}`, 12, mau('--chu'));
  } }));
  veTheoChieuSau(ds);
}

interface StNhiet { hoi: Hat[]; dem: number }

export const b1Ch3coonaNhietDo = dinhNghia<StNhiet>({
  id: 'b1-ch3coona-nhiet-do',
  baiId: 'bai-1',
  ten: 'Ảnh hưởng của nhiệt độ đến cân bằng thuỷ phân CH₃COONa',
  nhan: 'Bài 1 · SGK tr. 11',
  moTaAria: 'Cảnh 3D: ba ống dung dịch CH₃COONa có phenolphthalein; một ống ngâm nước đá, một ống ngâm nước nóng.',
  ptHoaHoc: ['CH₃COONa + H₂O ⇌ CH₃COOH + NaOH   (chiều thuận thu nhiệt)'],
  buoc: [
    { nhan: 'Nhỏ phenolphthalein, chia ba ống', giay: 4, hienTuong: 'Dung dịch CH₃COONa có phenolphthalein cho màu hồng nhạt như nhau ở cả ba ống: trong dung dịch đã có sẵn một ít OH⁻.' },
    { nhan: 'Ngâm nước đá và nước nóng', giay: 4, hienTuong: 'Giữ ống 1 để so sánh; ngâm ống 2 vào nước đá, ống 3 vào nước nóng.' },
    { nhan: 'So màu ba ống', giay: 7, hienTuong: 'Ống ngâm nước nóng hồng đậm hơn (nhiều OH⁻ hơn), ống ngâm nước đá nhạt màu hơn. Đun nóng đẩy cân bằng theo chiều thuận — chiều thu nhiệt.' },
  ],
  cam: { yaw: 0.26, pitch: 0.2 },
  phong: 0.92,
  tao: () => ({ hoi: [], dem: 0 }),
  ve: ({ ctx, P, buoc, tienDo, dt, tt }: KhungVe<StNhiet>) => {
    const da = mau('--mau-nuoc-da'), nuoc = mau('--mau-dd-trong');
    const ngam = buoc === 1 ? tienDo : buoc > 1 ? 1 : 0;
    const doi = buoc === 2 ? Math.min(1, tienDo * 1.2) : 0;
    const dam = [0.34, noiSuy(0.34, 0.12, doi), noiSuy(0.34, 0.72, doi)];

    if (dt > 0) {
      tt.dem += dt;
      if (ngam > 0.5 && tt.dem > 0.22) {
        tt.dem = 0;
        tt.hoi.push(hatMoi([X_ONG[2] + nhienNgau(-0.3, 0.3), Y_COC_MIENG + 0.1, nhienNgau(-0.2, 0.2)],
          [nhienNgau(-0.05, 0.05), nhienNgau(0.25, 0.45), 0], 2.2, 0.13));
      }
      tt.hoi = chayHat(tt.hoi, dt, [0, 0.05, 0], 0.08);
    }

    veMatBan(ctx, P, -1.75);
    /* Cốc ngâm vẽ trước, ống hồng vẽ sau để nhìn thấy trong lòng cốc. */
    for (let i = 1; i < 3; i++) {
      if (ngam > 0.05) {
        veCoc(ctx, P, {
          x: X_ONG[i], z: 0, yDay: Y_COC_DAY, yMieng: Y_COC_MIENG, r: R_COC,
          muc: noiSuy(Y_COC_DAY, Y_COC_MIENG - 0.18, ngam), mauLong: i === 1 ? da : nuoc, dam: 0.4,
        });
        veNhan(ctx, P, [X_ONG[i], Y_COC_DAY - 0.3, 0], i === 1 ? 'nước đá' : 'nước nóng', 12);
      }
    }
    veBaOngHong(ctx, P, dam, i => haXuong(i, ngam));
    veHatMem(ctx, P, tt.hoi, mauKhi('--mau-khoi', 0.4), 0.4);
    if (doi > 0.6) veNhan(ctx, P, [0, 1.8, 0], 'hồng đậm = nhiều OH⁻ hơn', 12, mau('--chu-dam'));
  },
});

/* ── ảnh hưởng của nồng độ ───────────────────────────────────────────────── */

interface StNongDo { hat: Hat[]; dem: number }

export const b1Ch3coonaNongDo = dinhNghia<StNongDo>({
  id: 'b1-ch3coona-nong-do',
  baiId: 'bai-1',
  ten: 'Ảnh hưởng của nồng độ đến cân bằng thuỷ phân CH₃COONa',
  nhan: 'Bài 1 · SGK tr. 12',
  moTaAria: 'Cảnh 3D: ba ống dung dịch CH₃COONa hồng; ống 2 thêm tinh thể CH₃COONa, ống 3 thêm vài giọt CH₃COOH.',
  ptHoaHoc: ['CH₃COONa + H₂O ⇌ CH₃COOH + NaOH'],
  buoc: [
    { nhan: 'Ba ống hồng như nhau', giay: 3, hienTuong: 'Chia dung dịch CH₃COONa có phenolphthalein vào ba ống, màu hồng nhạt như nhau.' },
    { nhan: 'Thêm CH₃COONa và CH₃COOH', giay: 5, hienTuong: 'Ống 1 giữ nguyên để so sánh; ống 2 thêm vài tinh thể CH₃COONa; ống 3 thêm vài giọt CH₃COOH.' },
    { nhan: 'So màu ba ống', giay: 7, hienTuong: 'Ống thêm CH₃COONa hồng đậm hơn: tăng chất đầu thì cân bằng chuyển theo chiều thuận, sinh thêm OH⁻. Ống thêm CH₃COOH nhạt màu hơn: thêm sản phẩm thì cân bằng chuyển theo chiều nghịch.' },
  ],
  cam: { yaw: 0.26, pitch: 0.2 },
  phong: 1,
  tao: () => ({ hat: [], dem: 0 }),
  ve: ({ ctx, P, buoc, tienDo, dt, tt }: KhungVe<StNongDo>) => {
    const doi = buoc === 2 ? Math.min(1, tienDo * 1.2) : 0;
    const dam = [0.34, noiSuy(0.34, 0.72, doi), noiSuy(0.34, 0.1, doi)];

    if (dt > 0 && buoc === 1) {
      tt.dem += dt;
      if (tt.dem > 0.3) {
        tt.dem = 0;
        tt.hat.push(hatMoi([X_ONG[1] + nhienNgau(-0.12, 0.12), 1.6, 0], [0, -0.6, 0], 1.8, 0.055));
      }
    }
    if (dt > 0) tt.hat = chayHat(tt.hat, dt, [0, -1.2, 0], 0).filter(h => h.p[1] > -0.2);

    veMatBan(ctx, P, -1.5);
    veBaOngHong(ctx, P, dam, () => 0, undefined,
      i => (i === 0 ? 'so sánh' : i === 1 ? '+ CH₃COONa' : '+ CH₃COOH'));
    /* Tinh thể rơi vào ống 2; giọt acid rơi vào ống 3. */
    veHatRan(ctx, P, tt.hat, mau('--mau-ket-tua'));
    if (buoc === 1) {
      const pha = (tienDo * 3) % 1;
      const q = P(giua([X_ONG[2], 1.6, 0], [X_ONG[2], -0.12, 0], pha) as V3);
      veQuaCau(ctx, q.x, q.y, 0.07 * q.s, mau('--mau-dd-trong'), 0.95);
    }
    if (doi > 0.6) veNhan(ctx, P, [0, 1.75, 0], 'thêm chất đầu → đậm · thêm sản phẩm → nhạt', 12, mau('--chu-dam'));
  },
});
