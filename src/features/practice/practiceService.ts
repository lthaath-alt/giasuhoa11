// ─── Luyện tập — Phần chạm Firestore ─────────────────────────────────────────
//
// File này CHỈ lo việc lấy câu hỏi về. Toàn bộ luật chơi (chấm điểm, chọn câu,
// lượt làm lại, trạng thái mở/khóa) nằm ở `logic.ts` — tách ra để bộ kiểm tra
// `npm run kiem-tra:luyen-tap` nạp được ngoài trình duyệt; chỉ cần một dòng
// import Firestore là script sập vì Node không có `import.meta.env`.
//
// Vẫn `export * from './logic'` để chỗ gọi chỉ phải nhớ một cửa duy nhất.

import { BankQuestion } from '../bank/types';
import { BankFirestore } from '../bank/bankStore';
import { PhanLuyenTap, THU_TU_PHAN, TienDoPhan } from './types';
import { BangDemCau, chonCauTuKho } from './logic';

export * from './logic';

// ─── Kho câu hỏi ─────────────────────────────────────────────────────────────
//
// Đọc Firestore THEO TỪNG BÀI, và chỉ khi học sinh thật sự mở bài đó.
//
// Trước 20/09/2026 chỗ này tải cả ngân hàng ngay lúc mở tab Luyện tập, chỉ để
// đếm xem mỗi bài có bao nhiêu câu: 1.554 lượt đọc + 5,74 MB mỗi em mỗi phiên.
// Bậc miễn phí cho 50.000 lượt đọc/NGÀY, tức một lớp 40 em mở cùng một tiết là
// 62.160 lượt — vỡ hạn mức giữa buổi, và cả trường mất ngân hàng tới sáng hôm
// sau.
//
// Danh sách nay vẽ bằng TIẾN ĐỘ trong localStorage, không cần số câu — xem chú
// thích trong `trangThaiPhan` ở logic.ts. Số câu chỉ được hỏi khi em bấm vào
// một bài, và lượt hỏi đó đằng nào cũng phải có vì còn lấy câu để làm.
//
// CỐ Ý không dựng bảng đếm sẵn ở đâu (tệp sinh sẵn, bản chụp, localStorage):
// web deploy bằng kéo-thả `dist/` nên mọi con số nằm trong tệp tĩnh chỉ mới tới
// lần deploy gần nhất. Thầy cô nhập câu hỏi xong mà phải deploy lại thì con số
// mới đúng — đó là một nguồn hiểu nhầm, không phải một cách tiết kiệm.

/** Câu của từng bài, giữ trong phiên để em làm lại không phải đọc lại. */
const khoTheoBai = new Map<string, Promise<BankQuestion[]>>();

export function xoaCacheKho(): void {
  khoTheoBai.clear();
}

function cauCuaBai(lessonId: string): Promise<BankQuestion[]> {
  let p = khoTheoBai.get(lessonId);
  if (!p) {
    p = BankFirestore.getByLesson(lessonId).catch(err => {
      // Tải hỏng thì bỏ đi, lần sau còn thử lại được.
      khoTheoBai.delete(lessonId);
      throw err;
    });
    khoTheoBai.set(lessonId, p);
  }
  return p;
}

/**
 * Đếm số câu của MỘT bài, hỏi thẳng Firestore.
 *
 * Đây là con số DUY NHẤT dùng để quyết định "bài này đủ câu để mở một lượt
 * chưa". Không có bảng đếm dựng sẵn ở đâu cả, nên không có gì cũ được: thầy cô
 * nhập câu bằng JSON xong là em thấy ngay ở lần bấm kế tiếp.
 */
export async function demTuoiCuaBai(
  lessonId: string,
): Promise<Record<PhanLuyenTap, number>> {
  const ra: Record<PhanLuyenTap, number> = { mc: 0, tf: 0, tn: 0 };
  for (const cau of await cauCuaBai(lessonId)) {
    const phan = cau.t as PhanLuyenTap;
    if (THU_TU_PHAN.includes(phan)) ra[phan]++;   // bỏ câu tự luận
  }
  return ra;
}

/** Rút câu cho một lượt làm. Luật chọn xem `chonCauTuKho` trong logic.ts. */
export async function layCauChoLuot(
  lessonId: string,
  phan: PhanLuyenTap,
  tienDo: TienDoPhan,
): Promise<BankQuestion[]> {
  // `getByLesson` đã lọc lessonId trên máy chủ rồi, ở đây chỉ còn lọc phần.
  const kho = (await cauCuaBai(lessonId)).filter(c => (c.t as PhanLuyenTap) === phan);
  return chonCauTuKho(kho, phan, tienDo);
}

/** Lấy lại câu hỏi theo id — dùng để dựng phần "những câu em còn sai" */
export async function layCauTheoId(ids: string[]): Promise<BankQuestion[]> {
  return BankFirestore.getByIds(ids);
}
