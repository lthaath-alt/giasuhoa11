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
  /** Khoá riêng của em: chỉ dùng khi MỌI model chung đã hết lượt NGÀY. Chỉ
      hết lượt PHÚT thì chờ một phút là xong, tiêu lượt của em làm gì
      (quy tắc 20/09/2026). */
  chiKhiChungHetNgay?: boolean;
  goi: (chiThi: string | undefined, hanChoMs: number) => Promise<string>;
}

export interface KetQuaGoi {
  text: string;
  maMoHinh: string;
  nhaCungCap: NhaCungCap;
  duong: Duong;
  /** Gọi lại ĐÚNG model vừa trả lời — cho lượt sinh lại của bộ chặn rò. */
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
  /* Có model chung nào đang chỉ nghỉ phút (chưa chết hẳn trong ngày) không. */
  let chungChiNghiPhut = false;
  let daGoi = false;

  for (const b of cacBuoc) {
    const ma = `${b.vung}:${b.maMoHinh}`;
    const bayGio = mt.bayGio();
    if (b.chiKhiChungHetNgay && chungChiNghiPhut) continue;
    if (!mt.kho.conDung(b.vung, b.maMoHinh, new Date(bayGio))) continue;
    if ((mt.nghiPhut.get(ma) ?? 0) > bayGio) {
      if (!b.chiKhiChungHetNgay) chungChiNghiPhut = true;
      continue;
    }

    const conLai = batDau + mt.tongHanMs - bayGio;
    if (daGoi && conLai < CON_LAI_TOI_THIEU_MS) break;
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
        if (!b.chiKhiChungHetNgay) chungChiNghiPhut = true;
        continue;
      }
      if (loai === 'may-chu') continue;
      /* App Check, quá hạn, mạng, lỗi lạ: đổi model không cứu được. */
      throw loi;
    }
  }
  /* Còn model chỉ nghỉ phút thì nói đúng là "chờ một phút", đừng doạ
     "hết lượt cả ngày" — em sẽ bỏ đi trong khi một phút nữa là hỏi được. */
  if (chungChiNghiPhut) throw loiPhut ?? new Error(LOI_HET_SACH_PHUT);
  throw loiCuoi ?? new Error(LOI_HET_SACH_NGAY);
}
