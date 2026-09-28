/**
 * BÀI 8 — SULFURIC ACID VÀ MUỐI SULFATE.
 *
 * · Copper tác dụng với H₂SO₄ đặc, nóng (SGK tr. 51).
 * · Tính háo nước của H₂SO₄ đặc (SGK tr. 51).
 * · Nhận biết ion sulfate bằng Ba²⁺ (SGK tr. 53).
 */
import {
  chayHat, dao, dongBot, Hat, hatMoi, mau, mauKhi, nhienNgau, noiSuy, tronMau, V3,
  veBotKhi, veCoc, veDenCon, veHatMem, veHatRan, veKepGo, veManhKimLoai, veMatBan, veNhan,
  veNutBong, veOngDan, veOngNghiem, veQuaCau,
} from '../dungCu3d';
import { dinhNghia, giua, KhungVe } from '../kichBan';

/* ── Copper tác dụng với sulfuric acid đặc, nóng ─────────────────────────── */

interface StCu { bot: Hat[]; dem: number }

const R_ONG = 0.4, Y_DAY = -1.1, Y_MIENG = 1.15, MUC_CU = -0.25;

export const b8CuH2so4 = dinhNghia<StCu>({
  id: 'b8-cu-h2so4',
  baiId: 'bai-8',
  ten: 'Copper tác dụng với sulfuric acid đặc, nóng',
  nhan: 'Bài 8 · SGK tr. 51',
  moTaAria: 'Cảnh 3D: ống nghiệm đựng lá đồng và sulfuric acid đặc, nút bông tẩm NaOH, đun trên đèn cồn, dung dịch chuyển xanh.',
  ptHoaHoc: ['Cu + 2H₂SO₄(đặc) → CuSO₄ + SO₂↑ + 2H₂O (t°)', 'SO₂ + 2NaOH → Na₂SO₃ + H₂O (bông tẩm NaOH giữ khí độc)'],
  buoc: [
    { nhan: 'Cho lá đồng và H₂SO₄ 70 %', giay: 4, hienTuong: 'Lá đồng nằm trong acid không màu. Ở nhiệt độ thường hầu như không thấy phản ứng — đồng đứng sau hydrogen nên không tác dụng với acid loãng.' },
    { nhan: 'Đun nóng ống nghiệm', giay: 5, hienTuong: 'Hơ nóng đều ống rồi đun tập trung ở đáy. Khi acid nóng lên, phản ứng bắt đầu.' },
    { nhan: 'Đồng tan, khí thoát ra', giay: 6, hienTuong: 'Lá đồng mòn dần, bọt khí nổi lên liên tục — khí SO₂ không màu, mùi hắc, bị nút bông tẩm NaOH giữ lại.' },
    { nhan: 'Dung dịch chuyển xanh', giay: 6, hienTuong: 'Dung dịch chuyển sang màu xanh lam của ion Cu²⁺: H₂SO₄ đặc nóng đã oxi hoá được cả kim loại đứng sau hydrogen.' },
  ],
  cam: { yaw: 0.33, pitch: 0.22 },
  phong: 1,
  tao: () => ({ bot: [], dem: 0 }),
  ve: ({ ctx, P, buoc, tienDo, tong, dt, tt }: KhungVe<StCu>) => {
    const trong = mau('--mau-dd-trong'), lam = mau('--mau-cu-xanh-lam'), dong = mau('--mau-dong'), so2 = mauKhi('--mau-so2', 0.4);
    const lua = buoc >= 1 ? (buoc === 1 ? Math.min(1, tienDo * 2) : 1) : 0;
    const soi = buoc === 2 ? Math.min(1, tienDo * 2) : buoc > 2 ? 1 : 0;
    const xanh = buoc === 3 ? Math.min(1, tienDo * 1.2) : 0;
    const conCu = buoc <= 1 ? 1 : buoc === 2 ? 1 - tienDo * 0.4 : Math.max(0.2, 0.6 - tienDo * 0.4);

    if (dt > 0) {
      tt.dem += dt;
      if (soi > 0 && tt.dem > 0.06 / soi) {
        tt.dem = 0;
        tt.bot.push(hatMoi(
          [nhienNgau(-0.2, 0.2), Y_DAY + 0.16, nhienNgau(-0.2, 0.2)],
          [0, nhienNgau(0.5, 0.85), 0], 2, nhienNgau(0.04, 0.07),
        ));
      }
      tt.bot = chayHat(tt.bot, dt, [0, 0.22, 0], 0.22).filter(h => h.p[1] < MUC_CU - 0.02);
    }

    veMatBan(ctx, P, -2.1);
    veDenCon(ctx, P, 0, 0, -2.05, tong, lua);
    veKepGo(ctx, P, 0, 0, 0.6, R_ONG);

    veOngNghiem(ctx, P, {
      x: 0, z: 0, yDay: Y_DAY, yMieng: Y_MIENG, r: R_ONG, muc: MUC_CU,
      mauLong: tronMau(trong, lam, xanh), dam: noiSuy(0.2, 0.6, xanh),
    }, () => {
      /* Ba lá đồng nhỏ nằm đáy ống, mỏng dần theo mức độ tan. */
      for (const dx of [-0.16, 0.02, 0.17]) {
        veManhKimLoai(ctx, P, [dx, Y_DAY + 0.1, dx * 0.7], 0.3 * conCu, dong, 0.35 + dx);
      }
      veBotKhi(ctx, P, tt.bot, so2);
    });

    veNutBong(ctx, P, 0, 0, Y_MIENG, R_ONG);
    veNhan(ctx, P, [0, Y_MIENG + 0.72, 0], 'bông tẩm NaOH', 12, mau('--chu'));
    veNhan(ctx, P, [-1.35, -0.35, 0], xanh > 0.5 ? 'CuSO₄' : 'H₂SO₄ đặc', 14);
    if (soi > 0.4) veNhan(ctx, P, [1.3, 0.25, 0], 'SO₂ ↑', 13);
  },
});

/* ── Tính háo nước của sulfuric acid đặc ─────────────────────────────────── */

interface StHao { hoi: Hat[]; dem: number }

const R_COC = 0.86, Y_COC_DAY = -1.3, Y_COC_MIENG = 0.25;

export const b8HaoNuoc = dinhNghia<StHao>({
  id: 'b8-hao-nuoc',
  baiId: 'bai-8',
  ten: 'Tính háo nước của sulfuric acid đặc',
  nhan: 'Bài 8 · SGK tr. 51',
  moTaAria: 'Cảnh 3D: cốc thuỷ tinh đựng đường mía, nhỏ sulfuric acid đặc lên, đường hoá đen và khối than xốp dâng trào khỏi cốc.',
  ptHoaHoc: ['C₁₂H₂₂O₁₁ → 12C + 11H₂O (H₂SO₄ đặc hút nước)', 'C + 2H₂SO₄(đặc) → CO₂↑ + 2SO₂↑ + 2H₂O'],
  buoc: [
    { nhan: 'Cho đường vào cốc', giay: 3, hienTuong: 'Đáy cốc là lớp đường mía trắng, khô.' },
    { nhan: 'Nhỏ H₂SO₄ đặc lên đường', giay: 4, hienTuong: 'Nhỏ đều acid đặc lên mặt đường. Chỗ tiếp xúc ẩm lại và bắt đầu ngả màu.' },
    { nhan: 'Đường hoá vàng rồi hoá đen', giay: 5, hienTuong: 'Đường chuyển vàng, nâu rồi đen: acid đặc đã lấy nước của phân tử đường, chỉ còn lại carbon.' },
    { nhan: 'Khối than xốp trào lên', giay: 8, hienTuong: 'Khối đen sủi bọt, phồng to thành than xốp dâng cao trào khỏi miệng cốc; cốc nóng lên và bốc hơi — khí CO₂, SO₂ sinh ra đẩy khối than nở ra.' },
  ],
  cam: { yaw: 0.3, pitch: 0.26 },
  phong: 0.92,
  tao: () => ({ hoi: [], dem: 0 }),
  ve: ({ ctx, P, buoc, tienDo, tong, dt, tt }: KhungVe<StHao>) => {
    const duong = mau('--mau-duong'), than = mau('--mau-than'), nau = mau('--mau-nau-duong'), hoiMau = mauKhi('--mau-khoi', 0.42);

    const den = buoc === 2 ? Math.min(1, tienDo * 1.2) : buoc > 2 ? 1 : 0;
    const cao = buoc === 3 ? Math.min(1, tienDo * 1.05) : 0;
    const mauKhoi = den < 0.5 ? tronMau(duong, nau, den * 2) : tronMau(nau, than, (den - 0.5) * 2);

    if (dt > 0) {
      tt.dem += dt;
      if (cao > 0.15 && tt.dem > 0.1) {
        tt.dem = 0;
        tt.hoi.push(hatMoi(
          [nhienNgau(-0.4, 0.4), Y_COC_DAY + 0.5 + cao * 1.5, nhienNgau(-0.3, 0.3)],
          [nhienNgau(-0.1, 0.1), nhienNgau(0.35, 0.6), 0], 2.4, nhienNgau(0.16, 0.26),
        ));
      }
      tt.hoi = chayHat(tt.hoi, dt, [0, 0.1, 0], 0.1);
    }

    veMatBan(ctx, P, -1.95);

    veCoc(ctx, P, { x: 0, z: 0, yDay: Y_COC_DAY, yMieng: Y_COC_MIENG, r: R_COC, muc: Y_COC_DAY - 1 }, () => {
      /* Lớp đường / than dưới đáy cốc. */
      const lop = dongBot(0, Y_COC_DAY + 0.08, R_COC * 0.8, 34, 0.075);
      veHatRan(ctx, P, lop, mauKhoi);
      /* Cột than xốp: chồng từng tầng hạt, cao dần và phình ra — phần trên vượt
         khỏi miệng cốc chính là hiện tượng "trào khỏi cốc". */
      if (cao > 0.02) {
        const tang = Math.round(cao * 11);
        for (let i = 0; i < tang; i++) {
          const y = Y_COC_DAY + 0.14 + i * 0.24;
          const nho = Math.max(0.22, (R_COC * 0.8) * (1 - i / 15)) * (0.9 + dao(tong + i * 0.3, 1.1) * 0.14);
          veHatRan(ctx, P, dongBot(0, y, nho, 12 + (i % 3), 0.1), than);
        }
      }
    });

    if (cao > 0.05) veHatMem(ctx, P, tt.hoi, hoiMau, 0.4);

    /* Bình nhỏ acid: chỉ hiện ở bước đang nhỏ acid. */
    if (buoc === 1) {
      veOngDan(ctx, P, [[-1.5, 2.0, 0], [-0.05, 2.0, 0], [-0.05, 1.5, 0]]);
      const pha = (tienDo * 3) % 1;
      const q = P(giua([-0.05, 1.45, 0], [0, Y_COC_DAY + 0.2, 0], pha));
      veQuaCau(ctx, q.x, q.y, 0.07 * q.s, mau('--mau-dd-trong'), 0.9);
      veNhan(ctx, P, [-2.0, 2.0, 0], 'H₂SO₄ đặc', 13);
    }
    veNhan(ctx, P, [R_COC + 1.1, Y_COC_DAY + 0.3, 0], den > 0.8 ? 'than xốp' : 'đường mía', 13);
  },
});

/* ── Nhận biết ion sulfate ───────────────────────────────────────────────── */

interface StSo4 { tua: Hat[]; dem: number }

const R_S = 0.4, Y_S_DAY = -1.1, Y_S_MIENG = 1.1, MUC_S = 0.0;

/** Giọt thuốc thử rơi từ ống nhỏ giọt xuống mặt thoáng, lặp lại. */
function veGiot(ctx: CanvasRenderingContext2D, P: KhungVe['P'], pha: number, c: string): void {
  const q = P(giua([0, 1.62, 0], [0, MUC_S, 0], pha) as V3);
  veQuaCau(ctx, q.x, q.y, 0.075 * q.s, c, 0.95);
}

export const b8NhanBietSo4 = dinhNghia<StSo4>({
  id: 'b8-nhan-biet-so4',
  baiId: 'bai-8',
  ten: 'Nhận biết ion sulfate SO₄²⁻',
  nhan: 'Bài 8 · SGK tr. 53',
  moTaAria: 'Cảnh 3D: nhỏ dung dịch barium chloride vào ống nghiệm đựng sodium sulfate, xuất hiện kết tủa trắng.',
  ptHoaHoc: ['Ba²⁺ + SO₄²⁻ → BaSO₄↓ (trắng)', 'BaSO₄ không tan trong acid'],
  buoc: [
    { nhan: 'Ống nghiệm chứa Na₂SO₄', giay: 3, hienTuong: 'Dung dịch sodium sulfate trong suốt, không màu.' },
    { nhan: 'Nhỏ vài giọt BaCl₂', giay: 4, hienTuong: 'Nhỏ từng giọt dung dịch barium chloride vào và lắc nhẹ.' },
    { nhan: 'Kết tủa trắng xuất hiện', giay: 6, hienTuong: 'Dung dịch vẩn đục ngay lập tức rồi xuất hiện kết tủa trắng mịn — đó là barium sulfate.' },
    { nhan: 'Nhỏ thêm HCl loãng', giay: 6, hienTuong: 'Kết tủa lắng xuống đáy và KHÔNG tan khi thêm HCl loãng. Nhờ vậy phân biệt được BaSO₄ với BaCO₃ hay BaSO₃ (hai chất này tan và sủi khí).' },
  ],
  cam: { yaw: 0.3, pitch: 0.2 },
  phong: 0.95,
  tao: () => ({ tua: [], dem: 0 }),
  ve: ({ ctx, P, buoc, tienDo, tGiay, dt, tt }: KhungVe<StSo4>) => {
    const trong = mau('--mau-dd-trong'), tuaMau = mau('--mau-ket-tua'), hatTua = mauKhi('--mau-ket-tua', 0.34);
    const duc = buoc === 2 ? Math.min(1, tienDo * 1.3) : buoc > 2 ? 1 : 0;

    if (dt > 0) {
      tt.dem += dt;
      if (buoc === 2 && tt.dem > 0.05 && tt.tua.length < 90) {
        tt.dem = 0;
        tt.tua.push(hatMoi(
          [nhienNgau(-0.26, 0.26), nhienNgau(-0.5, MUC_S - 0.1), nhienNgau(-0.26, 0.26)],
          [0, -nhienNgau(0.04, 0.12), 0], 999, nhienNgau(0.04, 0.07),
        ));
      }
      /* Bước 4 lắng nhanh hơn; hạt chạm đáy thì nằm yên thành lớp kết tủa. */
      const chim: V3 = [0, buoc >= 3 ? -0.3 : -0.06, 0];
      tt.tua = chayHat(tt.tua, dt, chim, 0.02);
      for (const h of tt.tua) {
        if (h.p[1] < Y_S_DAY + 0.12) { h.p[1] = Y_S_DAY + 0.12; h.v[1] = 0; }
      }
    }

    veMatBan(ctx, P, -1.85);

    veOngNghiem(ctx, P, {
      x: 0, z: 0, yDay: Y_S_DAY, yMieng: Y_S_MIENG, r: R_S, muc: MUC_S,
      mauLong: tronMau(trong, tuaMau, duc * 0.55), dam: noiSuy(0.2, 0.45, duc),
    }, () => veHatRan(ctx, P, tt.tua, hatTua));

    /* Ống nhỏ giọt: BaCl₂ ở bước 1, HCl loãng ở bước 3. */
    if (buoc === 1 || buoc === 3) {
      veOngDan(ctx, P, [[0, 2.1, 0], [0, 1.62, 0]]);
      veGiot(ctx, P, (tGiay * 1.6) % 1, trong);
      veNhan(ctx, P, [1.15, 1.95, 0], buoc === 1 ? 'BaCl₂' : 'HCl loãng', 13);
    }
    veNhan(ctx, P, [-1.3, -0.35, 0], 'Na₂SO₄', 14);
    if (duc > 0.5) veNhan(ctx, P, [1.35, Y_S_DAY + 0.35, 0], 'BaSO₄ ↓ trắng', 13);
  },
});
