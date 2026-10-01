// ─── Gọi mô hình theo chuỗi, lặng lẽ chuyển khi một model hết lượt ──────────
//
// Thay cho `goiMoHinh` cũ trong geminiTutorService (01/10/2026), vốn chỉ có hai
// đường: model chính, rồi khoá riêng của em. Học sinh KHÔNG thấy việc chuyển:
// không thông báo, cùng câu lệnh, cùng hàng rào sư phạm phía sau. Dữ liệu
// nghiên cứu thì THẤY: kết quả mang tên model và đường đã đi.
//
// Tệp thuần — các bước gọi được tiêm từ ngoài — để `kiem-tra:du-phong` chạy
// bằng Node với model giả, đồng hồ giả, bộ nhớ giả, không tốn lượt nào.
import { loiThanhChuoi } from './loiGemini';
import { phanLoaiLoiGemini, type KhoHet, type VungHet } from './hetLuotMoHinh';
import type { Duong, NhaCungCap } from './danhSachMoHinh';

/** Học sinh chờ một lượt tối đa bao lâu. Lý do chọn 90 giây: xem chú thích
    ngay trên chỗ dùng trong `giaSuFirebaseAI.ts`. */
export const HAN_CHO_MS = 90_000;
/** Còn dưới mức này thì thôi: gọi thêm model nữa chỉ để chắc chắn quá hạn. */
export const CON_LAI_TOI_THIEU_MS = 8_000;
/** Hết lượt PHÚT: cho model đó nghỉ chừng này rồi mới gõ lại. */
export const NGHI_HET_PHUT_MS = 60_000;

/* Lỗi dựng sẵn khi KHÔNG gọi được model nào vì tất cả đã bị đánh dấu từ trước.
   Mang đúng dấu hiệu `thongBaoHetLuot` đọc, để học sinh nhận đúng câu cũ. */
export const LOI_HET_SACH_NGAY =
  '[429 Too Many Requests] GenerateRequestsPerDayPerProjectPerModel-FreeTier: mọi model đã hết lượt hôm nay';
export const LOI_HET_SACH_PHUT =
  '[429 Too Many Requests] GenerateRequestsPerMinutePerProjectPerModel-FreeTier: mọi model đang nghỉ một phút';

export interface BuocGoi {
  duong: Duong;
  nhaCungCap: NhaCungCap;
  maMoHinh: string;
  vung: VungHet;
  /** Khoá riêng của em: chỉ được GỌI khi MỌI bước KHÔNG mang cờ này trong
      `cacBuoc` đã chết hôm nay trong kho (`!kho.conDung(...)` đúng cho tất
      cả) — xét trên CẢ MẢNG, không phụ thuộc thứ tự đứng trước hay sau trong
      `cacBuoc`. Chỉ hết lượt PHÚT (máy chủ quá tải 503, …) thì KHÔNG tính
      — còn sống trong kho, nên gate vẫn chặn; chờ một phút là xong, tiêu
      lượt của em làm gì (quy tắc 20/09/2026, bản sửa theo soát Việc 3). */
  chiKhiChungHetNgay?: boolean;
  goi: (chiThi: string | undefined, hanChoMs: number) => Promise<string>;
}

export interface KetQuaGoi {
  text: string;
  maMoHinh: string;
  nhaCungCap: NhaCungCap;
  duong: Duong;
  /** Gọi lại ĐÚNG model vừa trả lời — cho lượt sinh lại của bộ chặn rò.
      Cố ý nhận đủ `tongHanMs`, không phải phần hạn còn lại của lượt đầu:
      khớp đúng hành vi sinh lại cũ (một hạn chờ mới, không trừ vào lượt
      trước). */
  goiLai: (chiThi: string) => Promise<string>;
}

export interface MoiTruongChuoi {
  kho: KhoHet;
  bayGio: () => number;
  /** 'vùng:model' → thời điểm hết nghỉ (ms). Sống trong bộ nhớ của trang. */
  nghiPhut: Map<string, number>;
  tongHanMs: number;
}

export async function goiTheoChuoi(cacBuoc: BuocGoi[], mt: MoiTruongChuoi): Promise<KetQuaGoi> {
  const batDau = mt.bayGio();
  let loiCuoi: unknown = null;
  let loiPhut: unknown = null;
  /* Có BƯỚC NÀO (chung hay khoá riêng) bị bỏ qua hay hỏng vì đang nghỉ PHÚT
     không — quyết định câu lỗi cuối cùng khi không ai trả lời được. */
  let coNghiPhut = false;
  /* Vòng lặp DỪNG vì hết hạn tổng (`CON_LAI_TOI_THIEU_MS`), không phải vì
     hết bước để thử — lỗi cuối phải nói đúng là quá hạn, không phải lỗi
     (có thể đã cũ) của bước trước đó. */
  let dungDoHetHan = false;
  let daGoi = false;

  /* Soát riêng của người kiểm Việc 3 (lệch kế hoạch gốc): bước mang
     `chiKhiChungHetNgay` chỉ được GỌI khi TẤT CẢ bước KHÔNG mang cờ này
     trong `cacBuoc` đã chết hôm nay trong kho — xét trên cả mảng, không
     theo thứ tự đứng trước/sau. Không dùng `chungChiNghiPhut` nữa: hết lượt
     PHÚT (hay máy chủ 503 tạm continue) không đánh dấu chết trong kho, nên
     hàm dưới tự trả false, khoá riêng không bị tiêu oan. */
  const moiModelChungDaChetHomNay = (luc: number): boolean =>
    cacBuoc.filter((x) => !x.chiKhiChungHetNgay)
      .every((x) => !mt.kho.conDung(x.vung, x.maMoHinh, new Date(luc)));

  for (const b of cacBuoc) {
    const ma = `${b.vung}:${b.maMoHinh}`;
    const bayGio = mt.bayGio();
    if (b.chiKhiChungHetNgay && !moiModelChungDaChetHomNay(bayGio)) continue;
    if (!mt.kho.conDung(b.vung, b.maMoHinh, new Date(bayGio))) continue;
    if ((mt.nghiPhut.get(ma) ?? 0) > bayGio) {
      coNghiPhut = true;
      continue;
    }

    const conLai = batDau + mt.tongHanMs - bayGio;
    if (daGoi && conLai < CON_LAI_TOI_THIEU_MS) { dungDoHetHan = true; break; }
    daGoi = true;
    try {
      const text = await b.goi(undefined, Math.min(mt.tongHanMs, conLai));
      return {
        text, maMoHinh: b.maMoHinh, nhaCungCap: b.nhaCungCap, duong: b.duong,
        goiLai: (chiThi) => b.goi(chiThi, mt.tongHanMs),
      };
    } catch (loi) {
      loiCuoi = loi;
      const loai = phanLoaiLoiGemini(loiThanhChuoi(loi));
      if (loai === 'het-ngay' || loai === 'mo-hinh-hong') {
        mt.kho.danhDau(b.vung, b.maMoHinh, new Date(mt.bayGio()));
        continue;
      }
      if (loai === 'het-phut') {
        mt.nghiPhut.set(ma, mt.bayGio() + NGHI_HET_PHUT_MS);
        loiPhut = loi;
        coNghiPhut = true;
        continue;
      }
      if (loai === 'may-chu') continue;
      /* App Check, quá hạn, mạng, lỗi lạ: đổi model không cứu được. */
      throw loi;
    }
  }
  /* Dừng vì hết hạn tổng: lỗi thật là "chờ quá lâu", không phải lỗi (có khi
     đã cũ) của bước trước — nói đúng để `thongBaoLoiKetNoi` bảo em gửi lại,
     đừng doạ hết lượt trong khi model kế có khi còn sống. */
  if (dungDoHetHan) throw new Error('timeout: hết thời gian chờ của lượt này');
  /* Còn bước nào chỉ nghỉ phút thì nói đúng là "chờ một phút", đừng doạ
     "hết lượt cả ngày" — em sẽ bỏ đi trong khi một phút nữa là hỏi được. */
  if (coNghiPhut) throw loiPhut ?? new Error(LOI_HET_SACH_PHUT);
  throw loiCuoi ?? new Error(LOI_HET_SACH_NGAY);
}
