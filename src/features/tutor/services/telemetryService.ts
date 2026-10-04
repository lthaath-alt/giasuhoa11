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

/**
 * Bọc một ô CSV. Tách ra khỏi `xuatCsv` ngày 22/09/2026 để bản xuất nghiên cứu
 * (P0-5) dùng CHUNG một cách bọc — hai cách bọc khác nhau trong cùng dự án thì
 * sớm muộn một cái sẽ quên mất dấu nháy kép và làm lệch cả bảng.
 */
export const bocCsv = (v: unknown): string => {
  const s = v === undefined || v === null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const COT_CSV = [
  'user_hash', 'nhanh', 'session_id', 'lesson_id', 'timestamp', 'sender', 'buoc', 'loai_luot',
  'muc_goi_y', 'be_tac', 'ma_ngo_nhan', 'ngoai_mon', 'model_name', 'latency_ms', 'do_dai_noi_dung',
  'nha_cung_cap', 'duong', 'y_dinh', 'y_dinh_xs', 'y_dinh_phien_ban',
] as const;

/**
 * CSV để nộp kèm báo cáo và chạy lại phân tích. CỐ Ý không có email và không
 * có NỘI DUNG tin nhắn — chỉ độ dài; nội dung dùng cho việc chấm lại nhãn thì
 * giáo viên xuất riêng, có kiểm soát.
 */
export function xuatCsv(tinNhan: ChatMessage[]): string {
  const dong = tinNhan.map(m => [
    m.user_hash ?? userHash(m.userEmail) ?? '', m.nhanh, m.session_id, m.lessonId, m.timestamp, m.sender,
    m.buoc, m.loai_luot, m.muc_goi_y, m.be_tac, m.ma_ngo_nhan, m.ngoai_mon, m.model_name, m.latency_ms,
    (m.content ?? '').length, m.nha_cung_cap, m.duong, m.y_dinh, m.y_dinh_xs, m.y_dinh_phien_ban,
  ].map(bocCsv).join(','));
  return [COT_CSV.join(','), ...dong].join('\n');
}

// ── Gộp theo từng học sinh, cho bản xuất nghiên cứu (P0-5) ───────────────────

/**
 * Một dòng trong bảng "mỗi học sinh một dòng" — đơn vị phân tích của đề tài.
 *
 * Mọi trường ở đây đều tính từ những trường mã THẬT SỰ đang ghi xuống `chats`
 * (xem khối `aiMsg` trong `AppContext`). Kế hoạch P0-5 còn nhắc `nghi_sao_chep`
 * và `gio_kiem_tra`; hôm nay chưa chỗ nào ghi hai trường đó nên CỐ Ý không có
 * cột cho chúng: một cột luôn rỗng trông như "không em nào bị" chứ không như
 * "chưa đo", và đó là kiểu nhầm tệ nhất trong một bảng số liệu nghiên cứu.
 */
export interface DongHocSinh {
  user_hash: string;
  /** Nhánh thực nghiệm; ghép bằng `|` nếu một em từng ở hai nhánh (đổi đợt) */
  nhanh: string;
  soPhien: number;
  soLuot: number;
  soLuotHocSinh: number;
  /** Tổng thời gian CỘNG TRONG từng phiên, xem chú thích trong `gopTheoHocSinh` */
  tongThoiGianMs: number;
  /** Cùng mẫu số với `socraticRatio` của `tinhChiSo`; null khi không có lượt nào để tính */
  tyLeGoiMo: number | null;
  tyLeBeTac: number | null;
  mucCaoNhat: number;
  /** Số phiên chạm nấc trần. Trần hôm nay là 3 — đổi kiểu `muc_goi_y` thì đổi cả đây */
  soPhienMuc3: number;
  soLanChanRo: number;
  soLanNhanHong: number;
  soLanGianLan: number;
  /** Lượt gia sư KHÔNG có nhãn `loai_luot`; cao thì `tyLeGoiMo` không đáng tin */
  soNhanThieu: number;
}

/** Nấc giàn giáo cao nhất mà `ChatMessage.muc_goi_y` cho phép. */
const MUC_TRAN = 3;

/**
 * Gộp chỉ số theo từng học sinh, dùng cho bản xuất nghiên cứu (P0-5).
 *
 * CHỈ ĐỌC: không sửa mảng đưa vào. Mốc ngày so thẳng trên chuỗi ISO nên
 * `tuNgay`/`denNgay` viết dạng 'YYYY-MM-DD'; `denNgay` tính TRỌN ngày đó, vì
 * người gõ `--den 2026-09-22` luôn có ý gồm cả hôm ấy.
 */
export function gopTheoHocSinh(tin: ChatMessage[], tuNgay?: string, denNgay?: string): DongHocSinh[] {
  const trongKhoang = (ts: string) =>
    (!tuNgay || ts >= tuNgay) && (!denNgay || ts <= `${denNgay}T23:59:59.999Z`);
  const loc = tin.filter(m => trongKhoang(m.timestamp));

  const theoHocSinh = new Map<string, ChatMessage[]>();
  for (const m of loc) {
    const khoa = m.user_hash ?? userHash(m.userEmail) ?? '';
    const da = theoHocSinh.get(khoa);
    if (da) da.push(m); else theoHocSinh.set(khoa, [m]);
  }

  return [...theoHocSinh.entries()].map(([user_hash, ms]) => {
    const cuaHocSinh = ms.filter(m => m.sender === 'user');
    const cuaGiaSu = ms.filter(m => m.sender === 'ai');
    const coNhan = cuaGiaSu.filter(m => m.loai_luot);
    /* Cùng mẫu số với `socraticRatio` trong `tinhChiSo`: lượt hành chính và
       tra cứu không phải cơ hội dạy học. Hai chỗ mà khác mẫu số thì báo cáo có
       hai con số "tỉ lệ Socratic" lệch nhau mà không ai giải thích được. */
    const mauSo = coNhan.filter(m => m.loai_luot !== 'hanh_chinh' && m.loai_luot !== 'tra_cuu');

    const mucTheoPhien = new Map<string, number>();
    const mocTheoPhien = new Map<string, number[]>();
    for (const m of ms) {
      const phien = m.session_id ?? '';
      mucTheoPhien.set(phien, Math.max(mucTheoPhien.get(phien) ?? 0, m.muc_goi_y ?? 0));
      const moc = Date.parse(m.timestamp);
      if (!Number.isNaN(moc)) {
        const da = mocTheoPhien.get(phien);
        if (da) da.push(moc); else mocTheoPhien.set(phien, [moc]);
      }
    }

    /* Cộng TRONG từng phiên rồi mới cộng lại, chứ không lấy mốc cuối trừ mốc
       đầu: một em học hai buổi cách nhau ba hôm sẽ ra "72 giờ học", con số đó
       đi thẳng vào báo cáo thì không ai bắt được vì nó vẫn trông như một số. */
    let tongThoiGianMs = 0;
    for (const moc of mocTheoPhien.values()) {
      if (moc.length > 1) tongThoiGianMs += Math.max(...moc) - Math.min(...moc);
    }

    const nhanh = [...new Set(ms.map(m => m.nhanh).filter(Boolean))].join('|');

    return {
      user_hash,
      nhanh,
      soPhien: new Set(ms.map(m => m.session_id ?? '')).size,
      soLuot: ms.length,
      soLuotHocSinh: cuaHocSinh.length,
      tongThoiGianMs,
      tyLeGoiMo: mauSo.length ? mauSo.filter(m => m.loai_luot === 'goi_mo').length / mauSo.length : null,
      tyLeBeTac: cuaHocSinh.length ? cuaHocSinh.filter(m => m.be_tac).length / cuaHocSinh.length : null,
      mucCaoNhat: Math.max(0, ...mucTheoPhien.values()),
      soPhienMuc3: [...mucTheoPhien.values()].filter(v => v >= MUC_TRAN).length,
      soLanChanRo: ms.filter(m => m.chan_ro).length,
      soLanNhanHong: ms.filter(m => m.nhan_hong).length,
      soLanGianLan: ms.filter(m => m.ngoai_mon === 'GIAN_LAN').length,
      soNhanThieu: cuaGiaSu.length - coNhan.length,
    };
  });
}

/**
 * Bảng "mỗi học sinh một dòng" dưới dạng CSV.
 *
 * Hai điều bắt buộc, đừng bỏ:
 *   - BOM ở đầu. Tệp này mở bằng Excel trên Windows; thiếu BOM là tiếng Việt
 *     ra ký tự rác (đã ghi trong CLAUDE.md, `liet-ke:tai-khoan` vấp rồi).
 *   - `canhBao` thành cột ĐẦU TIÊN của MỌI dòng, không phải một dòng chú thích
 *     trên đầu tệp. Dòng chú thích làm lệch cột khi nạp bằng pandas, còn một
 *     cột thì vừa đập vào mắt người mở Excel vừa không phá công cụ nào.
 *
 * Số thập phân dùng dấu CHẤM, khác lối hiển thị cho học sinh: dấu phẩy vừa là
 * dấu thập phân vừa là dấu ngăn cột thì bảng vỡ ngay dòng đầu.
 */
export function csvHocSinh(dong: DongHocSinh[], canhBao: string): string {
  const lam = (v: number | null) => (v === null ? '' : v.toFixed(4));
  const cot: [string, (d: DongHocSinh) => unknown][] = [
    ['canh_bao', () => canhBao],
    ['user_hash', d => d.user_hash],
    ['nhanh', d => d.nhanh],
    ['so_phien', d => d.soPhien],
    ['so_luot', d => d.soLuot],
    ['so_luot_hoc_sinh', d => d.soLuotHocSinh],
    ['tong_thoi_gian_ms', d => d.tongThoiGianMs],
    ['tong_thoi_gian_phut', d => (d.tongThoiGianMs / 60000).toFixed(1)],
    ['ty_le_goi_mo', d => lam(d.tyLeGoiMo)],
    ['ty_le_be_tac', d => lam(d.tyLeBeTac)],
    ['muc_cao_nhat', d => d.mucCaoNhat],
    [`so_phien_muc_${MUC_TRAN}`, d => d.soPhienMuc3],
    ['so_lan_chan_ro', d => d.soLanChanRo],
    ['so_lan_nhan_hong', d => d.soLanNhanHong],
    ['so_lan_gian_lan', d => d.soLanGianLan],
    ['so_nhan_thieu', d => d.soNhanThieu],
  ];
  return '﻿' + [
    cot.map(c => c[0]).join(','),
    ...dong.map(d => cot.map(c => bocCsv(c[1](d))).join(',')),
  ].join('\n');
}
