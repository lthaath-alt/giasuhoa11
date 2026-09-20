// ─── Giới hạn chat: lượt thử của khách + khoá tạm khi spam — lưu ở Firestore ──
//
// Thay cho `cooldownService.ts` (localStorage) và `GuestChatStorage`. Biên bản
// thẩm định 14/09/2026 đo được: xoá khoá `h11_tutor_guest_chat_count` trong
// localStorage rồi tải lại trang là "còn 25/25" lượt; khoá phạt lạc đề cũng
// xoá được y như vậy, và bản cũ còn lưu NGUYÊN VĂN tin lạc đề (kể cả tin tục).
//
// Nay:
//   - trạng thái nằm ở `gioi_han_chat/{uid}`; khách có `uid` nhờ đăng nhập ẩn
//     danh trên app phụ (xem `layAppKhach` trong firebase.ts);
//   - chỉ lưu SỐ và MÃ BĂM của tin gần đây (để nhận ra tin lặp), không lưu chữ;
//   - luật Firestore cấm đếm lùi và cấm rút ngắn thời gian khoá.
//
// GIỚI HẠN THẬT — phải ghi rõ trong báo cáo, không được nói quá:
//   1. Dự án không có máy chủ (không bật Blaze), nên việc GỌI Gemini không đi
//      qua Firestore. Người biết mở công cụ nhà phát triển vẫn gọi thẳng được
//      mô hình, hoặc xoá cả dữ liệu site để nhận một uid ẩn danh mới. Cách này
//      chặn được thao tác "xoá localStorage" phổ thông, KHÔNG chặn được người
//      cố tình. Chặn thật phải có máy chủ hoặc giới hạn theo người dùng của
//      Firebase AI Logic.
//   2. Cần bật "Anonymous" trong Firebase Console → Authentication → Sign-in
//      method, và deploy lại firestore.rules. Chưa bật thì dịch vụ tự lùi về
//      chế độ cục bộ (đếm trong bộ nhớ phiên) và báo trong Console.

import { signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, layAppKhach } from '../../../core/services/firebase';
import { laSpam, SPAM_LAP_LAI } from './pedagogicalStateMachine';

export const COL_GIOI_HAN_CHAT = 'gioi_han_chat';
/* 5 chứ không phải 25 (20/09/2026). Khách dùng CHUNG hạn mức Gemini theo ngày
   với học sinh: ngày 18/09/2026 cả web hết lượt giữa buổi chiều, học sinh
   không hỏi được nữa. Khách chỉ cần đủ lượt để xem thử; lớp mới là người phải
   được ưu tiên. Mọi chỗ hiển thị con số này PHẢI đọc hằng số —
   `kiem-tra:het-luot` bắt chỗ nào chép cứng. */
export const TRAN_LUOT_KHACH = 5;
export const PHUT_KHOA_SPAM = 15;
const SO_THOI_DIEM_GIU = 10;

/** Hình dạng tài liệu — luật Firestore kiểm đúng năm trường này. */
interface BanGhiGioiHan {
  luotKhach: number;
  thoiDiemGui: number[];
  bamTinGanDay: string[];
  luotPhatSpam: number;
  /** Mốc hết khoá (ms). 0 = không khoá. Dùng 0 thay null để luật so sánh được. */
  khoaDen: number;
}

const MAC_DINH: BanGhiGioiHan = { luotKhach: 0, thoiDiemGui: [], bamTinGanDay: [], luotPhatSpam: 0, khoaDen: 0 };

export type LyDoChan = 'het-luot-khach' | 'dang-khoa' | 'spam';

export interface KetQuaGioiHan {
  choPhep: boolean;
  lyDo?: LyDoChan;
  conLaiMs?: number;
  luotKhach: number;
  /** 'firestore' khi đã đồng bộ; 'cuc-bo' khi chưa bật đăng nhập ẩn danh hoặc mất mạng */
  cheDo: 'firestore' | 'cuc-bo';
}

/** Băm FNV-1a 32 bit — đủ để nhận ra hai tin giống nhau, không khôi phục được chữ. */
function bam(noiDung: string): string {
  const s = (noiDung ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

// Chế độ cục bộ: chỉ sống trong bộ nhớ phiên, CỐ Ý không ghi localStorage.
const cucBo: BanGhiGioiHan = { ...MAC_DINH, thoiDiemGui: [], bamTinGanDay: [] };
let daBaoCucBo = false;

/**
 * @param taoPhienNeuThieu Chưa có phiên ẩn danh thì có tạo mới không. Chỉ tạo
 *   khi khách THẬT SỰ gửi câu hỏi. Lúc mở trang chỉ đọc: tạo phiên ở đó nghĩa
 *   là ai ghé qua cũng sinh một tài khoản ẩn danh trong Firebase, và máy nào
 *   chưa bật Anonymous thì Console đỏ lỗi 400 ngay từ màn đăng nhập.
 */
async function layDiaChi(laKhach: boolean, taoPhienNeuThieu: boolean) {
  if (!laKhach) {
    const uid = auth.currentUser?.uid;
    return uid ? doc(db, COL_GIOI_HAN_CHAT, uid) : null;
  }
  try {
    const { authKhach, dbKhach } = layAppKhach();
    const sanCo = authKhach.currentUser;
    if (!sanCo && !taoPhienNeuThieu) return null;
    const user = sanCo ?? (await signInAnonymously(authKhach)).user;
    return doc(dbKhach, COL_GIOI_HAN_CHAT, user.uid);
  } catch (err) {
    if (!daBaoCucBo) {
      daBaoCucBo = true;
      console.warn('[gioiHanChat] Không đăng nhập ẩn danh được — dùng chế độ cục bộ. '
        + 'Bật Anonymous trong Firebase Console → Authentication.', err);
    }
    return null;
  }
}

async function docBanGhi(laKhach: boolean, taoPhienNeuThieu = true) {
  const diaChi = await layDiaChi(laKhach, taoPhienNeuThieu);
  if (!diaChi) return { diaChi: null, banGhi: cucBo };
  try {
    const snap = await getDoc(diaChi);
    return { diaChi, banGhi: snap.exists() ? { ...MAC_DINH, ...(snap.data() as Partial<BanGhiGioiHan>) } : { ...MAC_DINH } };
  } catch {
    return { diaChi: null, banGhi: cucBo };
  }
}

async function ghi(diaChi: Awaited<ReturnType<typeof layDiaChi>>, banGhi: BanGhiGioiHan): Promise<boolean> {
  if (!diaChi) { Object.assign(cucBo, banGhi); return false; }
  try {
    await setDoc(diaChi, banGhi);
    return true;
  } catch (err) {
    console.warn('[gioiHanChat] Ghi Firestore bị từ chối — kiểm tra đã deploy firestore.rules chưa.', err);
    Object.assign(cucBo, banGhi);
    return false;
  }
}

/** Trạng thái hiện tại, không ghi gì — dùng để vẽ giao diện. */
export async function layTrangThaiGioiHan(laKhach: boolean): Promise<{ luotKhach: number; conLaiKhoaMs: number }> {
  const { banGhi } = await docBanGhi(laKhach, false);
  return { luotKhach: banGhi.luotKhach, conLaiKhoaMs: Math.max(0, banGhi.khoaDen - Date.now()) };
}

/**
 * Gọi MỘT lần trước mỗi tin gửi đi. Kiểm khoá, hết lượt, spam; nếu cho phép
 * thì ghi nhận lượt gửi (tăng bộ đếm của khách).
 */
export async function kiemTraVaGhiNhanLuotGui(laKhach: boolean, noiDung: string): Promise<KetQuaGioiHan> {
  const bayGio = Date.now();
  const { diaChi, banGhi } = await docBanGhi(laKhach);
  const cheDo: KetQuaGioiHan['cheDo'] = diaChi ? 'firestore' : 'cuc-bo';

  if (banGhi.khoaDen > bayGio) {
    return { choPhep: false, lyDo: 'dang-khoa', conLaiMs: banGhi.khoaDen - bayGio, luotKhach: banGhi.luotKhach, cheDo };
  }
  if (laKhach && banGhi.luotKhach >= TRAN_LUOT_KHACH) {
    return { choPhep: false, lyDo: 'het-luot-khach', luotKhach: banGhi.luotKhach, cheDo };
  }

  const thoiDiemGui = [...banGhi.thoiDiemGui, bayGio].slice(-SO_THOI_DIEM_GIU);
  const bamTinGanDay = [...banGhi.bamTinGanDay, bam(noiDung)].slice(-SPAM_LAP_LAI);

  if (laSpam(thoiDiemGui, bamTinGanDay, bayGio)) {
    const khoaDen = bayGio + PHUT_KHOA_SPAM * 60_000;
    const moi: BanGhiGioiHan = { ...banGhi, thoiDiemGui, bamTinGanDay, luotPhatSpam: banGhi.luotPhatSpam + 1, khoaDen };
    const daGhi = await ghi(diaChi, moi);
    return { choPhep: false, lyDo: 'spam', conLaiMs: khoaDen - bayGio, luotKhach: banGhi.luotKhach, cheDo: daGhi ? 'firestore' : 'cuc-bo' };
  }

  const moi: BanGhiGioiHan = {
    ...banGhi,
    thoiDiemGui,
    bamTinGanDay,
    luotKhach: laKhach ? banGhi.luotKhach + 1 : banGhi.luotKhach,
  };
  const daGhi = await ghi(diaChi, moi);
  return { choPhep: true, luotKhach: moi.luotKhach, cheDo: daGhi ? 'firestore' : 'cuc-bo' };
}

export function thongBaoBiChan(kq: KetQuaGioiHan): string {
  const phut = Math.max(1, Math.ceil((kq.conLaiMs ?? 0) / 60_000));
  switch (kq.lyDo) {
    case 'het-luot-khach':
      return `Em đã dùng hết ${TRAN_LUOT_KHACH} lượt hỏi thử. Em đăng ký tài khoản học sinh (hoặc dùng tài khoản nhà trường cấp) để học tiếp nhé.`;
    case 'spam':
      return `⏸️ Hệ thống thấy tin nhắn được gửi dồn dập hoặc lặp lại liên tục, nên tạm dừng khung chat **${phut} phút**. Sau đó em quay lại học bình thường nhé.`;
    case 'dang-khoa':
      return `⏸️ Khung chat đang tạm dừng, còn khoảng **${phut} phút**. Trong lúc chờ, em xem lại phần bài giảng nhé.`;
    default:
      return '';
  }
}
