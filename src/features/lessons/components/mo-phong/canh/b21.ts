/**
 * BÀI 21 — PHENOL.
 *
 * Hai thí nghiệm SGK tr. 131 chứng minh hai điều khác nhau: phenol có tính acid
 * (tan được trong kiềm), và vòng benzene của phenol dễ thế hơn benzene thường
 * (kết tủa trắng với nước bromine ngay ở nhiệt độ thường, không cần xúc tác).
 */
import {
  Hat, hatMoi, mau, MucVe, noiSuy, tronMau, V3,
  mauKhi, veHatRan, veMatBan, veNhan, veOngNghiem, veQuaCau, veTheoChieuSau,
} from '../dungCu3d';
import { dinhNghia, giua, KhungVe } from '../kichBan';

const Y_DAY = -1.1, Y_MIENG = 0.85, R_ONG = 0.33, MUC = -0.2;

/** Phenol ít tan: trong ống là huyền phù trắng đục, không phải dung dịch trong. */
function veVanDuc(ctx: CanvasRenderingContext2D, P: KhungVe['P'], x: number, dam: number): void {
  if (dam <= 0.02) return;
  const hat: Hat[] = [];
  for (let i = 0; i < 20; i++) {
    const g = i * 2.399963, r = 0.24 * Math.sqrt((i + 0.5) / 20);
    hat.push(hatMoi([x + Math.cos(g) * r, Y_DAY + 0.15 + (i % 5) * 0.16, Math.sin(g) * r], [0, 0, 0], 9, 0.05));
  }
  veHatRan(ctx, P, hat, mauKhi('--mau-ket-tua', 0.34), dam);
}

export const b21PhenolNaoh = dinhNghia<Record<string, never>>({
  id: 'b21-phenol-naoh',
  baiId: 'bai-21',
  ten: 'Phenol tác dụng với NaOH và Na₂CO₃',
  nhan: 'Bài 21 · SGK tr. 131',
  moTaAria: 'Cảnh 3D: hai ống phenol vẩn đục, thêm NaOH và Na₂CO₃ thì cả hai chuyển thành trong suốt.',
  ptHoaHoc: [
    'C₆H₅OH + NaOH → C₆H₅ONa + H₂O',
    '2C₆H₅OH + Na₂CO₃ → 2C₆H₅ONa + H₂O + CO₂  (phenol là acid yếu hơn carbonic acid)',
  ],
  buoc: [
    { nhan: 'Hai ống phenol vẩn đục', giay: 3, hienTuong: 'Phenol ít tan trong nước nguội nên hai ống đều đục như sữa loãng.' },
    { nhan: 'Thêm NaOH và Na₂CO₃', giay: 4, hienTuong: 'Ống 1 thêm dung dịch NaOH, ống 2 thêm dung dịch Na₂CO₃, lắc đều.' },
    { nhan: 'Cả hai ống trong suốt', giay: 7, hienTuong: 'Cả hai ống chuyển từ vẩn đục sang trong suốt: phenol đã phản ứng tạo muối sodium phenolate tan tốt trong nước. Vậy phenol có tính acid — tính chất mà alcohol không có.' },
  ],
  cam: { yaw: 0.26, pitch: 0.2 },
  phong: 1,
  tao: () => ({}),
  ve: ({ ctx, P, buoc, tienDo }: KhungVe<Record<string, never>>) => {
    const trong = mau('--mau-dd-trong');
    const tan = buoc === 2 ? Math.min(1, tienDo * 1.25) : 0;

    veMatBan(ctx, P, -1.6);
    const ds: MucVe[] = [-0.85, 0.85].map((x, i) => ({ z: 0, ve: () => {
      veOngNghiem(ctx, P, {
        x, z: 0, yDay: Y_DAY, yMieng: Y_MIENG, r: R_ONG, muc: MUC,
        mauLong: trong, dam: noiSuy(0.4, 0.2, tan),
      }, () => veVanDuc(ctx, P, x, 1 - tan));
      veNhan(ctx, P, [x, Y_MIENG + 0.4, 0], i === 0 ? 'phenol + NaOH' : 'phenol + Na₂CO₃', 12);
      if (tan > 0.6) veNhan(ctx, P, [x, Y_DAY - 0.3, 0], 'trong suốt', 11, mau('--chu-dam'));
    } }));
    veTheoChieuSau(ds);
    if (buoc === 1) {
      for (const x of [-0.85, 0.85]) {
        const q = P(giua([x, 1.5, 0], [x, MUC, 0], (tienDo * 3) % 1) as V3);
        veQuaCau(ctx, q.x, q.y, 0.065 * q.s, trong, 0.95);
      }
    }
  },
});

/* ── phenol với nước bromine ─────────────────────────────────────────────── */

export const b21PhenolBromine = dinhNghia<Record<string, never>>({
  id: 'b21-phenol-bromine',
  baiId: 'bai-21',
  ten: 'Phenol tác dụng với nước bromine',
  nhan: 'Bài 21 · SGK tr. 131',
  moTaAria: 'Cảnh 3D: nhỏ nước bromine vào dung dịch phenol, màu vàng mất đi và xuất hiện kết tủa trắng.',
  ptHoaHoc: ['C₆H₅OH + 3Br₂ → C₆H₂Br₃OH↓ (trắng) + 3HBr'],
  buoc: [
    { nhan: 'Ống dung dịch phenol', giay: 3, hienTuong: 'Ống nghiệm đựng khoảng 1 mL dung dịch phenol.' },
    { nhan: 'Nhỏ nước bromine', giay: 4, hienTuong: 'Nhỏ từng giọt nước bromine màu vàng vào rồi lắc.' },
    { nhan: 'Mất màu và có kết tủa trắng', giay: 7, hienTuong: 'Màu vàng của bromine mất ngay, đồng thời xuất hiện kết tủa trắng 2,4,6-tribromophenol. Phản ứng xảy ra ở nhiệt độ thường và thế cùng lúc BA nguyên tử H — vòng benzene của phenol hoạt động mạnh hơn benzene nhiều, vì nhóm –OH đẩy electron vào vòng.' },
  ],
  cam: { yaw: 0.28, pitch: 0.2 },
  phong: 1.15,
  tao: () => ({}),
  ve: ({ ctx, P, buoc, tienDo }: KhungVe<Record<string, never>>) => {
    const trong = mau('--mau-dd-trong'), brom = mau('--mau-brom'), tuaTrang = mauKhi('--mau-ket-tua', 0.34);
    const nho = buoc === 1 ? Math.min(1, tienDo * 1.3) : buoc > 1 ? 1 : 0;
    const pu = buoc === 2 ? Math.min(1, tienDo * 1.25) : 0;

    veMatBan(ctx, P, -1.5);
    veOngNghiem(ctx, P, {
      x: 0, z: 0, yDay: Y_DAY, yMieng: Y_MIENG, r: 0.36, muc: MUC,
      mauLong: tronMau(trong, brom, nho * 0.6 * (1 - pu)), dam: noiSuy(0.2, 0.4, nho * (1 - pu) + pu * 0.5),
    }, () => {
      if (pu > 0.04) {
        const hat: Hat[] = [];
        const n = Math.round(pu * 26);
        for (let i = 0; i < n; i++) {
          const g = i * 2.399963, r = 0.26 * Math.sqrt((i + 0.5) / 26);
          hat.push(hatMoi([Math.cos(g) * r, Y_DAY + 0.12 + (i % 4) * 0.1, Math.sin(g) * r], [0, 0, 0], 9, 0.055));
        }
        veHatRan(ctx, P, hat, tuaTrang);
      }
    });
    if (buoc === 1) {
      const q = P(giua([0, 1.5, 0], [0, MUC, 0], (tienDo * 3) % 1) as V3);
      veQuaCau(ctx, q.x, q.y, 0.07 * q.s, brom, 0.95);
      veNhan(ctx, P, [1.15, 1.45, 0], 'nước bromine', 12);
    }
    veNhan(ctx, P, [-1.25, MUC - 0.15, 0], 'dung dịch phenol', 12);
    if (pu > 0.5) veNhan(ctx, P, [1.35, Y_DAY + 0.35, 0], 'kết tủa trắng', 12, mau('--chu-dam'));
  },
});
