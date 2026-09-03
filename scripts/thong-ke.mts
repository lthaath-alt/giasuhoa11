// ─── Hàm thống kê thuần, không phụ thuộc thư viện ngoài ──────────────────────
//
// Tách riêng để KIỂM CHỨNG ĐƯỢC. Tự cài kiểm định t rồi đem số ra bảo vệ mà
// không đối chiếu với nguồn chuẩn thì rất dễ sai âm thầm — sai ở đây là cả kết
// luận nghiên cứu sai theo. Bộ kiểm-tra-thuc-nghiem đối chiếu các hàm dưới đây
// với BẢNG TRA T chuẩn (giá trị tới hạn ở mức ý nghĩa 0,05), là thứ bất kỳ ai
// trong hội đồng cũng tra lại được.
//
// Không dùng thư viện ngoài vì máy không có scipy/jStat, và thêm phụ thuộc chỉ
// để tính t thì nặng hơn lợi.

// ── Thống kê mô tả ──────────────────────────────────────────────────────────

export const tb = (x: number[]) => x.reduce((a, b) => a + b, 0) / x.length;

/** Phương sai MẪU (chia n-1), không phải phương sai tổng thể. */
export const phuongSai = (x: number[]) => {
  const m = tb(x);
  return x.reduce((s, v) => s + (v - m) ** 2, 0) / (x.length - 1);
};

export const doLech = (x: number[]) => Math.sqrt(phuongSai(x));

// ── Hàm phân phối t (không dùng thư viện ngoài) ─────────────────────────────

/** Hàm gamma theo xấp xỉ Lanczos — dùng cho phân phối t. */
export function lnGamma(z: number): number {
  const g = [676.5203681218851, -1259.1392167224028, 771.32342877765313,
             -176.61502916214059, 12.507343278686905, -0.13857109526572012,
             9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
  z -= 1;
  let x = 0.99999999999980993;
  for (let i = 0; i < g.length; i++) x += g[i] / (z + i + 1);
  const t = z + g.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

/** Hàm beta không hoàn chỉnh, chuẩn hoá — nền của giá trị p hai phía. */
function betaKhongHoanChinh(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const truoc = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b)
    + a * Math.log(x) + b * Math.log(1 - x));
  // Khai triển liên phân số Lentz
  const eps = 1e-12;
  let f = 1, c = 1, d = 0;
  for (let m = 0; m <= 300; m++) {
    let so: number;
    if (m === 0) so = 1;
    else if (m % 2 === 0) {
      const k = m / 2;
      so = (k * (b - k) * x) / ((a + 2 * k - 1) * (a + 2 * k));
    } else {
      const k = (m - 1) / 2;
      so = -((a + k) * (a + b + k) * x) / ((a + 2 * k) * (a + 2 * k + 1));
    }
    d = 1 + so * d; if (Math.abs(d) < eps) d = eps; d = 1 / d;
    c = 1 + so / c; if (Math.abs(c) < eps) c = eps;
    f *= d * c;
    if (Math.abs(1 - d * c) < eps) break;
  }
  return (truoc * (f - 1)) / a;
}

/** Giá trị p HAI PHÍA cho thống kê t với df bậc tự do. */
export function pHaiPhia(t: number, df: number): number {
  const x = df / (df + t * t);
  return betaKhongHoanChinh(x, df / 2, 0.5);
}

// ── Kiểm định ───────────────────────────────────────────────────────────────

/**
 * Kiểm định t Welch cho hai mẫu độc lập.
 *
 * Dùng Welch chứ KHÔNG dùng Student: Student giả định hai nhóm có phương sai
 * bằng nhau, mà lớp học thì không ai bảo đảm điều đó — và khi giả định sai,
 * Student cho giá trị p đẹp hơn thực tế. Welch không cần giả định đó và gần như
 * không mất gì khi phương sai thật sự bằng nhau.
 */
export function tWelch(a: number[], b: number[]) {
  const na = a.length, nb = b.length;
  const va = phuongSai(a) / na, vb = phuongSai(b) / nb;
  const t = (tb(a) - tb(b)) / Math.sqrt(va + vb);
  const df = (va + vb) ** 2 / (va ** 2 / (na - 1) + vb ** 2 / (nb - 1));
  return { t, df, p: pHaiPhia(t, df) };
}

/**
 * Cohen's d — mức chênh lệch, dùng độ lệch chuẩn gộp.
 * Quy ước đọc: 0,2 nhỏ · 0,5 vừa · 0,8 lớn.
 */
export function cohenD(a: number[], b: number[]) {
  const na = a.length, nb = b.length;
  const sGop = Math.sqrt(((na - 1) * phuongSai(a) + (nb - 1) * phuongSai(b)) / (na + nb - 2));
  const d = (tb(a) - tb(b)) / sGop;
  /* Hedges' g: Cohen's d thổi phồng khi mẫu nhỏ, mà lớp học thì mẫu luôn nhỏ.
     Hệ số hiệu chỉnh dưới đây kéo về đúng — với n≈30 nó bớt khoảng 2%. */
  const g = d * (1 - 3 / (4 * (na + nb) - 9));
  return { d, g };
}

export function ySo(d: number): string {
  const a = Math.abs(d);
  return a < 0.2 ? 'không đáng kể' : a < 0.5 ? 'nhỏ' : a < 0.8 ? 'vừa' : 'lớn';
}

