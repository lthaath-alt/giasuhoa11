// ─── Phân loại ý định tin nhắn của em bằng hồi quy logistic (CHẠY BÓNG) ─────
//
// Nhóm đề tài tự gán nhãn và tự huấn luyện (`scripts/phan-loai/huan-luyen.py`),
// xuất trọng số ra JSON; tệp này chỉ làm phép nhân và softmax trên trình duyệt.
// Không gọi mạng, không tốn lượt AI.
//
// CHẠY BÓNG (02/10/2026): kết quả chỉ được GHI vào `chats`, KHÔNG được đổi hành
// vi gia sư. `kiem-tra:phan-loai` canh việc gia sư và máy trạng thái không
// import tệp này.
//
// `chuanHoaYDinh` phải ra ĐÚNG như `chuan_hoa` bên Python
// (`scripts/phan-loai/chung.py`). Lệch một ký tự thì mô hình vẫn ra nhãn — chỉ là
// nhãn sai. Hai bên cùng chạy `scripts/phan-loai/du-lieu/vecto-chuan-hoa.json`.
//
// Tệp thuần, không import gì.

/** Đổi cách chuẩn hoá thì tăng số này: mô hình cũ sẽ bị từ chối thay vì đoán sai. */
export const PHIEN_BAN_CHUAN_HOA = 1;

/** Chữ thường → bỏ dấu → đ thành d → mọi thứ ngoài a-z, 0-9 thành một dấu cách. */
export function chuanHoaYDinh(s: string): string {
  return (s ?? '').toLowerCase().normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Tách theo dấu cách. GIỮ từ một ký tự: "k biet", "e chiu" là cách em gõ thật. */
export function tachTuYDinh(s: string): string[] {
  const t = chuanHoaYDinh(s);
  return t ? t.split(' ') : [];
}

export interface MoHinhYDinh {
  phien_ban: string;
  chuan_hoa_phien_ban: number;
  /** Thứ tự nhãn của hàng `he_so` — thứ tự scikit-learn (chữ cái), không phải thứ tự hướng dẫn */
  nhan: string[];
  /** Cụm 1–2 từ → chỉ số cột */
  tu_vung: Record<string, number>;
  idf: number[];
  he_so: number[][];
  chan: number[];
}

export interface KetQuaYDinh {
  nhan: string;
  xacSuat: number;
  /** Xác suất từng nhãn, cùng thứ tự `MoHinhYDinh.nhan` */
  phanBo: number[];
}

/** Kiểm hình dạng tệp mô hình trước khi dùng — tệp hỏng thì thôi, đừng đoán bừa. */
export function laMoHinhHopLe(m: unknown): m is MoHinhYDinh {
  const x = m as MoHinhYDinh | null;
  if (!x || typeof x !== 'object') return false;
  if (x.chuan_hoa_phien_ban !== PHIEN_BAN_CHUAN_HOA || typeof x.phien_ban !== 'string') return false;
  if (!Array.isArray(x.nhan) || x.nhan.length < 2) return false;
  if (!x.tu_vung || typeof x.tu_vung !== 'object' || !Array.isArray(x.idf)) return false;
  if (!Array.isArray(x.chan) || x.chan.length !== x.nhan.length) return false;
  if (!Array.isArray(x.he_so) || x.he_so.length !== x.nhan.length) return false;
  return x.he_so.every(h => Array.isArray(h) && h.length === x.idf.length);
}

/**
 * Vectơ TF-IDF thưa, đúng như TfidfVectorizer(ngram_range=(1, 2), smooth_idf=True,
 * norm='l2') của scikit-learn: đếm thô từng cụm × idf, rồi chia cho độ dài L2.
 */
export function vectoTfidf(m: MoHinhYDinh, s: string): Map<number, number> {
  const tu = tachTuYDinh(s);
  const cum = [...tu];
  for (let i = 0; i + 1 < tu.length; i++) cum.push(`${tu[i]} ${tu[i + 1]}`);
  const v = new Map<number, number>();
  for (const c of cum) {
    /* hasOwnProperty.call (không dùng Object.hasOwn — Safari < 15.4 chưa có):
       "constructor", "__proto__" là từ em gõ được, không phải chỉ số. */
    if (!Object.prototype.hasOwnProperty.call(m.tu_vung, c)) continue;
    const i = m.tu_vung[c];
    v.set(i, (v.get(i) ?? 0) + 1);
  }
  let binhPhuong = 0;
  for (const [i, dem] of v) {
    const w = dem * m.idf[i];
    v.set(i, w);
    binhPhuong += w * w;
  }
  const doDai = Math.sqrt(binhPhuong);
  if (doDai > 0) for (const [i, w] of v) v.set(i, w / doDai);
  return v;
}

/** Xác suất = softmax(hệ số · vectơ + chặn) — đúng `predict_proba` đa thức của scikit-learn. */
export function duDoanYDinh(m: MoHinhYDinh, s: string): KetQuaYDinh {
  const v = vectoTfidf(m, s);
  const z = m.chan.map((chan, k) => {
    let t = chan;
    for (const [i, x] of v) t += m.he_so[k][i] * x;
    return t;
  });
  const lon = Math.max(...z);
  const mu = z.map(t => Math.exp(t - lon));
  const tong = mu.reduce((a, b) => a + b, 0);
  const phanBo = mu.map(t => t / tong);
  let k = 0;
  for (let j = 1; j < phanBo.length; j++) if (phanBo[j] > phanBo[k]) k = j;
  return { nhan: m.nhan[k], xacSuat: phanBo[k], phanBo };
}
