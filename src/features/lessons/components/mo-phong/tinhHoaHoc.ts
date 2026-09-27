/**
 * Phần tính hoá học cho các mô phỏng — hàm thuần, không đụng giao diện, để kiểm
 * được bằng số (xem báo cáo `docs/soat-hoa-hoc/2026-09-27-thi-nghiem-theo-bai.md`).
 *
 * Giả thiết chung: dung dịch loãng lý tưởng ở 25 °C, bỏ qua hệ số hoạt độ.
 * Ở nồng độ cao (cỡ 1 M) số chỉ gần đúng — giao diện có ghi chú điều này.
 */

export const KW = 1e-14;

/** [H⁺] từ hiệu nồng độ D = C(acid mạnh dư) − C(base mạnh dư), có tính nước:
 *  [H⁺] − [OH⁻] = D  →  [H⁺] = (D + √(D² + 4Kw)) / 2. */
export function hTuHieu(D: number): number {
  return (D + Math.sqrt(D * D + 4 * KW)) / 2;
}

/* ── Chuẩn độ acid mạnh – base mạnh ─────────────────────────────────────── */

export type CheDoChuanDo = 'base-trong-binh' | 'acid-trong-binh';

/** pH của bình tam giác sau khi nhỏ `vChuan` mL dung dịch chuẩn.
 *  base-trong-binh: bình NaOH (cBinh, vBinh), burette HCl (cChuan).
 *  acid-trong-binh: bình HCl, burette NaOH. Thể tích mL, nồng độ mol/L. */
export function pHChuanDo(
  cheDo: CheDoChuanDo, cBinh: number, vBinh: number, cChuan: number, vChuan: number,
): number {
  const nBinh = cBinh * vBinh;      // mmol
  const nChuan = cChuan * vChuan;   // mmol
  const nAcidDu = cheDo === 'acid-trong-binh' ? nBinh - nChuan : nChuan - nBinh;
  return -Math.log10(hTuHieu(nAcidDu / (vBinh + vChuan)));
}

/** Độ đậm màu hồng của phenolphthalein, 0 (không màu) → 1 (hồng rõ).
 *  Khoảng chuyển màu 8,2 – 10,0. */
export function mauPhenolphthalein(pH: number): number {
  return Math.max(0, Math.min(1, (pH - 8.2) / 1.8));
}

/* ── Điện li nhiều nấc ──────────────────────────────────────────────────── */

export interface AcidNhieuNac {
  id: string;
  ct: string;            // công thức hiển thị
  ten: string;
  /** Ka từng nấc, theo thứ tự. Nấc 1 hoàn toàn thì Ka[0] bỏ qua. */
  ka: number[];
  nac1HoanToan: boolean;
  /** Công thức tiểu phân theo số H⁺ đã tách: 0, 1, 2, … */
  tieuPhan: string[];
  cMin: number;
  cMax: number;
  ghiChu: string;
  moRong: boolean;       // vượt SGK KNTT → nhãn "Mở rộng – nâng cao"
}

/** Phân bố tiểu phân tại [H⁺] = h. Trả mảng phần mol theo số H⁺ đã tách. */
export function phanBo(a: AcidNhieuNac, h: number): number[] {
  const n = a.ka.length;
  const batDau = a.nac1HoanToan ? 1 : 0;   // nấc 1 hoàn toàn: không còn H_nA
  const t: number[] = new Array(n + 1).fill(0);
  let tich = 1;
  for (let j = batDau; j <= n; j++) {
    if (j > batDau) tich *= a.ka[j - 1] / h;
    t[j] = tich;
  }
  const tong = t.reduce((s, x) => s + x, 0);
  return t.map(x => x / tong);
}

/** Giải cân bằng điện tích [H⁺] = C·Σ j·αⱼ + Kw/[H⁺] bằng chia đôi trên log[H⁺]
 *  (vế trái trừ vế phải tăng đơn điệu theo [H⁺]). */
export function giaiH(a: AcidNhieuNac, c: number): number {
  let lo = -15, hi = 1;
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2, h = 10 ** mid;
    const al = phanBo(a, h);
    const am = al.reduce((s, x, j) => s + j * x, 0);
    if (h - c * am - KW / h > 0) hi = mid; else lo = mid;
  }
  return 10 ** ((lo + hi) / 2);
}

export interface KetQuaNhieuNac {
  h: number;
  pH: number;
  nongDo: number[];      // mol/L theo tiểu phân
  dienLiNac: number[];   // độ điện li từng nấc, 0–1
}

export function tinhNhieuNac(a: AcidNhieuNac, c: number): KetQuaNhieuNac {
  const h = giaiH(a, c);
  const al = phanBo(a, h);
  const nongDo = al.map(x => x * c);
  /* Độ điện li nấc k = phần đã tách qua nấc k trên phần đã tới được nấc k. */
  const dienLiNac = a.ka.map((_, i) => {
    const toi = al.slice(i).reduce((s, x) => s + x, 0);
    const qua = al.slice(i + 1).reduce((s, x) => s + x, 0);
    return toi > 0 ? qua / toi : 0;
  });
  return { h, pH: -Math.log10(h), nongDo, dienLiNac };
}

/* Hằng số ở 25 °C, làm tròn từ bảng pKa của CRC Handbook of Chemistry and
   Physics: H₂SO₄ pKa₂ 1,99; H₂SO₃ 1,85 / 7,2; H₂CO₃ 6,35 / 10,33;
   H₃PO₄ 2,16 / 7,21 / 12,32. */
export const ACID_NHIEU_NAC: AcidNhieuNac[] = [
  {
    id: 'h2so4', ct: 'H₂SO₄', ten: 'Sulfuric acid',
    ka: [Infinity, 1.0e-2], nac1HoanToan: true,
    tieuPhan: ['H₂SO₄', 'HSO₄⁻', 'SO₄²⁻'],
    cMin: 0.001, cMax: 1,
    ghiChu: 'Nấc 1 điện li hoàn toàn nên H₂SO₄ là acid mạnh; nấc 2 chỉ điện li một phần. Lưu ý: khi làm bài tập theo SGK và đề thi, H₂SO₄ loãng thường được coi là điện li hoàn toàn cả hai nấc ([H⁺] = 2C, ví dụ H₂SO₄ 0,005 M có pH = 2) — cứ làm theo quy ước đó. Mô phỏng này cho thấy giá trị gần thực tế hơn.',
    /* Nấc 1 hoàn toàn là kiến thức phổ thông; Ka₂ và phép tính nấc 2 thì vượt SGK. */
    moRong: true,
  },
  {
    id: 'h2so3', ct: 'H₂SO₃', ten: 'Sulfurous acid (SO₂ tan trong nước)',
    ka: [1.4e-2, 6.3e-8], nac1HoanToan: false,
    tieuPhan: ['H₂SO₃', 'HSO₃⁻', 'SO₃²⁻'],
    cMin: 0.001, cMax: 1,
    ghiChu: 'Acid yếu ngay từ nấc 1; nấc 2 yếu hơn nấc 1 khoảng hai trăm nghìn lần.',
    moRong: true,
  },
  {
    id: 'h2co3', ct: 'H₂CO₃', ten: 'Carbonic acid (CO₂ tan trong nước)',
    ka: [4.5e-7, 4.7e-11], nac1HoanToan: false,
    tieuPhan: ['H₂CO₃', 'HCO₃⁻', 'CO₃²⁻'],
    /* CO₂ tan có hạn: cỡ 0,03 mol/L ở 1 atm, 25 °C. */
    cMin: 0.001, cMax: 0.03,
    ghiChu: 'Acid rất yếu. Phần lớn "H₂CO₃" thực ra là CO₂ hoà tan; Ka₁ là giá trị biểu kiến tính gộp cả hai.',
    moRong: true,
  },
  {
    id: 'h3po4', ct: 'H₃PO₄', ten: 'Phosphoric acid',
    ka: [6.9e-3, 6.2e-8, 4.8e-13], nac1HoanToan: false,
    tieuPhan: ['H₃PO₄', 'H₂PO₄⁻', 'HPO₄²⁻', 'PO₄³⁻'],
    cMin: 0.001, cMax: 1,
    ghiChu: 'Ba nấc, nấc sau yếu hơn nấc trước hàng trăm nghìn lần — gần như chỉ nấc 1 góp H⁺.',
    moRong: true,
  },
];
