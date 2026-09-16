// ─── Telemetry hành vi học tập và chỉ số Socratic ────────────────────────────
//
// Mục đích: có SỐ LIỆU thật cho đề tài, thay vì khẳng định bằng lời rằng gia sư
// "dẫn dắt theo Socrates". Mỗi tin nhắn mang thêm vài trường đo (xem
// `ChatMessage` trong features/auth/types.ts); tệp này dựng các trường đó và
// tính chỉ số từ chúng.
//
// Nguồn của từng trường — quan trọng khi viết phần phương pháp của báo cáo:
//   - be_tac, muc_goi_y, ngoai_mon = SPAM_ATTACK/GIAN_LAN, latency_ms,
//     session_id, user_hash, nhanh, model_name  → do MÃ đo, tin được.
//   - buoc, loai_luot, ma_ngo_nhan, ngoai_mon = CAM_XUC_TIEU_CUC/LAC_DE
//     → do MÔ HÌNH tự gắn nhãn. Là tự báo cáo, CÓ THỂ SAI. Phải kiểm độ tin cậy
//       bằng cách cho người chấm độc lập gắn nhãn lại một mẫu rồi tính Cohen's κ
//       trước khi đưa tỉ lệ Socratic vào kết luận.
//
// Tệp này chỉ import tệp thuần, để bộ kiểm chạy bằng Node nạp được.

import type { ChatMessage } from '../../auth/types';
import { maAnDanh } from '../../research/thucNghiem';

// ── Phiên giải một vấn đề ────────────────────────────────────────────────────

/** Ngừng quá lâu thì coi như bắt đầu vấn đề mới */
export const PHIEN_HET_HAN_MS = 30 * 60 * 1000;

interface TrangThaiPhien { id: string; lanCuoi: number; }
const phienDangMo = new Map<string, TrangThaiPhien>();

const taoMaPhien = (bayGio: number) =>
  `ph-${bayGio.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Mã phiên cho (người, bài). Đổi phiên khi:
 *   - chưa có phiên, hoặc ngừng quá PHIEN_HET_HAN_MS;
 *   - lượt trước vừa kết thúc vấn đề (`ketThucPhienTruoc`, tức gia sư phát
 *     nhãn XONG_BAI).
 * Giữ trong bộ nhớ: tải lại trang là phiên mới — chấp nhận được, vì tải lại
 * giữa chừng hiếm và chỉ làm một phiên bị tách đôi chứ không trộn hai phiên.
 */
export function laySessionId(nguoi: string, lessonId: string, bayGio = Date.now()): string {
  const khoa = `${nguoi}::${lessonId}`;
  const cu = phienDangMo.get(khoa);
  if (cu && bayGio - cu.lanCuoi < PHIEN_HET_HAN_MS) {
    cu.lanCuoi = bayGio;
    return cu.id;
  }
  const moi = { id: taoMaPhien(bayGio), lanCuoi: bayGio };
  phienDangMo.set(khoa, moi);
  return moi.id;
}

/** Gọi sau lượt gia sư phát XONG_BAI: lượt kế tiếp sẽ mở phiên mới. */
export function ketThucPhien(nguoi: string, lessonId: string): void {
  phienDangMo.delete(`${nguoi}::${lessonId}`);
}

/** Mã giả danh của học sinh; khách vãng lai không có mã. */
export function userHash(email: string): string | undefined {
  return email && email !== 'guest' ? maAnDanh(email) : undefined;
}

// ── Chỉ số ───────────────────────────────────────────────────────────────────

export interface ChiSoHocTap {
  soPhien: number;
  soLuotHocSinh: number;
  soLuotGiaSu: number;
  /** Tỉ lệ lượt gia sư CÓ nhãn loai_luot hợp lệ — thấp thì các chỉ số dưới không đáng tin */
  tyLeCoNhan: number;
  demLoaiLuot: Record<string, number>;
  /**
   * Socratic Ratio S_R = số lượt gợi mở / số lượt gia sư có nhãn, KHÔNG tính
   * lượt hành chính và tra cứu (chúng không phải cơ hội dạy học). null nếu mẫu số 0.
   */
  socraticRatio: number | null;
  /** Số lượt trung bình mỗi phiên (cả hai phía) */
  luotTrungBinhMoiPhien: number | null;
  /** Tỉ lệ tin của học sinh là bế tắc */
  tyLeBeTac: number | null;
  /** Số lần áp từng nấc giàn giáo */
  demMucGoiY: Record<string, number>;
  demNgoNhan: Record<string, number>;
  demNgoaiMon: Record<string, number>;
  /** Độ trễ gọi mô hình thật, trung vị và phân vị 95 (ms) */
  doTreTrungViMs: number | null;
  doTreP95Ms: number | null;
}

const phanVi = (mang: number[], p: number): number | null => {
  if (!mang.length) return null;
  const s = [...mang].sort((a, b) => a - b);
  const vt = (s.length - 1) * p;
  const d = Math.floor(vt), t = Math.ceil(vt);
  return s[d] + (s[t] - s[d]) * (vt - d);
};

const dem = (arr: (string | number | undefined)[]) => {
  const m: Record<string, number> = {};
  for (const x of arr) if (x !== undefined) m[String(x)] = (m[String(x)] ?? 0) + 1;
  return m;
};

export function tinhChiSo(tinNhan: ChatMessage[]): ChiSoHocTap {
  const hs = tinNhan.filter(m => m.sender === 'user');
  const gs = tinNhan.filter(m => m.sender === 'ai');
  const coNhan = gs.filter(m => m.loai_luot);
  const demLoai = dem(coNhan.map(m => m.loai_luot));
  const coHoiDay = coNhan.filter(m => m.loai_luot !== 'hanh_chinh' && m.loai_luot !== 'tra_cuu').length;
  const phien = new Set(tinNhan.map(m => m.session_id).filter(Boolean));
  const coPhien = tinNhan.filter(m => m.session_id).length;
  const doTre = gs.map(m => m.latency_ms).filter((x): x is number => typeof x === 'number');

  return {
    soPhien: phien.size,
    soLuotHocSinh: hs.length,
    soLuotGiaSu: gs.length,
    tyLeCoNhan: gs.length ? coNhan.length / gs.length : 0,
    demLoaiLuot: demLoai,
    socraticRatio: coHoiDay ? (demLoai.goi_mo ?? 0) / coHoiDay : null,
    luotTrungBinhMoiPhien: phien.size ? coPhien / phien.size : null,
    tyLeBeTac: hs.length ? hs.filter(m => m.be_tac).length / hs.length : null,
    demMucGoiY: dem(gs.map(m => m.muc_goi_y)),
    demNgoNhan: dem(gs.map(m => m.ma_ngo_nhan)),
    demNgoaiMon: dem(tinNhan.map(m => m.ngoai_mon)),
    doTreTrungViMs: phanVi(doTre, 0.5),
    doTreP95Ms: phanVi(doTre, 0.95),
  };
}

// ── Xuất số liệu cho phân tích ───────────────────────────────────────────────

const COT_CSV = [
  'user_hash', 'nhanh', 'session_id', 'lesson_id', 'timestamp', 'sender', 'buoc', 'loai_luot',
  'muc_goi_y', 'be_tac', 'ma_ngo_nhan', 'ngoai_mon', 'model_name', 'latency_ms', 'do_dai_noi_dung',
] as const;

/**
 * CSV để nộp kèm báo cáo và chạy lại phân tích. CỐ Ý không có email và không
 * có NỘI DUNG tin nhắn — chỉ độ dài; nội dung dùng cho việc chấm lại nhãn thì
 * giáo viên xuất riêng, có kiểm soát.
 */
export function xuatCsv(tinNhan: ChatMessage[]): string {
  const boc = (v: unknown) => {
    const s = v === undefined || v === null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const dong = tinNhan.map(m => [
    m.user_hash ?? userHash(m.userEmail) ?? '', m.nhanh, m.session_id, m.lessonId, m.timestamp, m.sender,
    m.buoc, m.loai_luot, m.muc_goi_y, m.be_tac, m.ma_ngo_nhan, m.ngoai_mon, m.model_name, m.latency_ms,
    (m.content ?? '').length,
  ].map(boc).join(','));
  return [COT_CSV.join(','), ...dong].join('\n');
}
