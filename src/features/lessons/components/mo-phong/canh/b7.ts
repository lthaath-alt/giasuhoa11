/**
 * BÀI 7 — SULFUR VÀ SULFUR DIOXIDE.
 *
 * · Sulfur tác dụng với sắt (SGK tr. 44) — sulfur là chất oxi hoá.
 * · Sulfur tác dụng với oxygen (SGK tr. 45) — sulfur là chất khử.
 * · SO₂ làm mất màu nước bromine (ngoài SGK, giáo viên biểu diễn).
 */
import {
  chayHat, dao, dongBot, Hat, hatMoi, mau, mauKhi, MucVe, nhienNgau, noiSuy, tronMau, V3,
  veBinhKhi, veBotKhi, veDenCon, veHaoQuang, veHatMem, veHatRan, veKepGo, veLua, veMatBan,
  veMuoiSat, veNhan, veNutBong, veOngDan, veOngNghiem, veTheoChieuSau,
} from '../dungCu3d';
import { dinhNghia, giua, KhungVe } from '../kichBan';

/* ── Sulfur tác dụng với sắt ─────────────────────────────────────────────── */

interface StFe { tia: Hat[]; dem: number }

const R_ONG = 0.38, Y_DAY = -1.0, Y_MIENG = 1.1;

export const b7SFe = dinhNghia<StFe>({
  id: 'b7-s-fe',
  baiId: 'bai-7',
  ten: 'Sulfur tác dụng với sắt',
  nhan: 'Bài 7 · SGK tr. 44',
  moTaAria: 'Cảnh 3D: ống nghiệm đựng hỗn hợp bột sắt và bột sulfur, nút bông ở miệng, đun trên đèn cồn.',
  ptHoaHoc: ['Fe + S → FeS (t°)'],
  buoc: [
    { nhan: 'Trộn bột Fe và bột S', giay: 4, hienTuong: 'Hỗn hợp trong ống gồm bột sắt màu xám và bột sulfur màu vàng, vẫn còn phân biệt được hai màu vì chưa phản ứng.' },
    { nhan: 'Hơ nóng ống nghiệm', giay: 5, hienTuong: 'Hơ nóng đều cả ống rồi đun tập trung vào chỗ có hỗn hợp. Sulfur nóng chảy, hỗn hợp sẫm lại.' },
    { nhan: 'Hỗn hợp cháy sáng', giay: 6, hienTuong: 'Hỗn hợp tự bùng cháy sáng rực, toả nhiều nhiệt — phản ứng tiếp tục lan ra cả khối mà không cần đun thêm.' },
    { nhan: 'Còn lại chất rắn đen', giay: 5, hienTuong: 'Nguội đi, trong ống còn lại chất rắn màu đen là iron(II) sulfide FeS, không còn màu vàng của sulfur.' },
  ],
  cam: { yaw: 0.32, pitch: 0.24 },
  phong: 1,
  tao: () => ({ tia: [], dem: 0 }),
  ve: ({ ctx, P, buoc, tienDo, tong, dt, tt }: KhungVe<StFe>) => {
    const luuHuynh = mau('--mau-luu-huynh'), sat = mau('--mau-sat'), fes = mau('--mau-fes'), nong = mau('--mau-nung-do');

    /* Đun ở bước 1; bước 2 phản ứng tự toả nhiệt nên hạ đèn cồn xuống. */
    const lua = buoc === 1 ? Math.min(1, tienDo * 2) : buoc === 2 ? Math.max(0, 1 - tienDo * 1.6) : 0;
    const chay = buoc === 2 ? Math.min(1, tienDo * 2.2) : buoc === 3 ? Math.max(0, 1 - tienDo * 1.4) : 0;
    const dong = dongBot(0, Y_DAY + 0.1, R_ONG * 0.72, 26);

    if (dt > 0) {
      tt.dem += dt;
      if (chay > 0.25 && tt.dem > 0.07) {
        tt.dem = 0;
        tt.tia.push(hatMoi(
          [nhienNgau(-0.18, 0.18), Y_DAY + 0.2, nhienNgau(-0.18, 0.18)],
          [nhienNgau(-0.15, 0.15), nhienNgau(0.7, 1.3), 0], 0.8, 0.035,
        ));
      }
      tt.tia = chayHat(tt.tia, dt, [0, -0.8, 0], 0.1);
    }

    veMatBan(ctx, P, -2.05);
    veDenCon(ctx, P, 0, 0, -2.0, tong, lua);
    veKepGo(ctx, P, 0, 0, 0.62, R_ONG);

    veOngNghiem(ctx, P, { x: 0, z: 0, yDay: Y_DAY, yMieng: Y_MIENG, r: R_ONG, muc: Y_DAY - 1 }, () => {
      /* Hỗn hợp: hạt lẻ là sắt, hạt chẵn là sulfur. Cháy thì rực lên màu nung
         đỏ trước, nguội mới thành FeS đen — nhảy thẳng sang đen là mất đúng
         cái hiện tượng "cháy sáng, toả nhiều nhiệt" cần cho học sinh thấy. */
      const nung = buoc === 1 ? tienDo * 0.45 : buoc === 2 ? 1 : buoc > 2 ? Math.max(0, 1 - tienDo * 1.6) : 0;
      const den = buoc === 2 ? tienDo * 0.45 : buoc > 2 ? Math.min(1, 0.45 + tienDo * 1.1) : 0;
      dong.forEach((h, i) => {
        veHatRan(ctx, P, [h], tronMau(tronMau(i % 2 === 0 ? luuHuynh : sat, nong, nung), fes, den));
      });
      if (chay > 0.02) {
        const q = P([0, Y_DAY + 0.15, 0]);
        veHaoQuang(ctx, q.x, q.y, (1.25 + dao(tong, 0.33) * 0.45) * q.s * chay, nong, 0.9 * chay);
        veHatRan(ctx, P, tt.tia, nong);
      }
    });

    veNutBong(ctx, P, 0, 0, Y_MIENG, R_ONG);
    veNhan(ctx, P, [0, Y_MIENG + 0.7, 0], 'nút bông', 12, mau('--chu'));
    veNhan(ctx, P, [-1.4, Y_DAY + 0.25, 0], buoc >= 3 ? 'FeS đen' : 'Fe + S', 14);
  },
});

/* ── Sulfur tác dụng với oxygen ──────────────────────────────────────────── */

interface StO2 { khi: Hat[]; dem: number }

const X_DEN = -1.35, X_BINH = 1.25, Y_BINH_DAY = -1.25, Y_BINH_MIENG = 0.6, R_BINH = 0.66;
const BAT_TREN_DEN: V3 = [X_DEN, -0.5, 0];
const BAT_TRONG_BINH: V3 = [X_BINH, -0.35, 0];

export const b7SO2 = dinhNghia<StO2>({
  id: 'b7-s-o2',
  baiId: 'bai-7',
  ten: 'Sulfur tác dụng với oxygen',
  nhan: 'Bài 7 · SGK tr. 45',
  moTaAria: 'Cảnh 3D: muôi sắt đựng sulfur đốt trên đèn cồn rồi đưa vào bình khí oxygen.',
  ptHoaHoc: ['S + O₂ → SO₂ (t°)'],
  buoc: [
    { nhan: 'Đun sulfur trong muôi sắt', giay: 4, hienTuong: 'Bột sulfur màu vàng trong muôi sắt được hơ trên ngọn lửa đèn cồn, chảy lỏng và sẫm lại.' },
    { nhan: 'Sulfur cháy trong không khí', giay: 5, hienTuong: 'Sulfur bắt cháy với ngọn lửa nhỏ, màu xanh nhạt, khó thấy trong phòng sáng.' },
    { nhan: 'Đưa muôi vào bình oxygen', giay: 4, hienTuong: 'Mở nắp bình đựng oxygen và đưa nhanh muôi sulfur đang cháy vào trong bình.' },
    { nhan: 'Cháy mãnh liệt trong oxygen', giay: 7, hienTuong: 'Sulfur cháy mãnh liệt hơn hẳn, ngọn lửa xanh sáng rõ, sinh khí SO₂ không màu, mùi hắc làm mờ lòng bình.' },
  ],
  cam: { yaw: 0.26, pitch: 0.2 },
  phong: 0.95,
  tao: () => ({ khi: [], dem: 0 }),
  ve: ({ ctx, P, buoc, tienDo, tong, dt, tt }: KhungVe<StO2>) => {
    const luuHuynh = mau('--mau-luu-huynh'), nong = mau('--mau-nung-do');
    const luaS = mau('--mau-lua-sulfur'), luaTrong = mau('--mau-lua-trong'), so2 = mauKhi('--mau-so2', 0.4);

    const dua = buoc === 2 ? tienDo : buoc > 2 ? 1 : 0;
    const bat = giua(BAT_TREN_DEN, BAT_TRONG_BINH, dua);
    const can: V3 = [bat[0] - 1.05, bat[1] + 0.62, 0];
    /* Đèn cồn tắt khi muôi rời đi — trong bình thì phản ứng tự cháy. */
    const luaDen = buoc <= 1 ? 1 : 1 - dua;
    const luaS_manh = buoc === 1 ? Math.min(1, tienDo * 2) : buoc >= 2 ? 1 : 0;
    const trongBinh = buoc === 3;
    const nap = buoc <= 1;

    if (dt > 0) {
      tt.dem += dt;
      if (trongBinh && tt.dem > 0.09) {
        tt.dem = 0;
        tt.khi.push(hatMoi(
          [X_BINH + nhienNgau(-0.3, 0.3), bat[1] + 0.2, nhienNgau(-0.25, 0.25)],
          [0, nhienNgau(0.1, 0.25), 0], 3, nhienNgau(0.14, 0.24),
        ));
      }
      tt.khi = chayHat(tt.khi, dt, [0, 0.02, 0], 0.05);
    }

    veMatBan(ctx, P, -1.92);

    const ds: MucVe[] = [];
    ds.push({ z: P([X_DEN, 0, 0]).z - 0.01, ve: () => veDenCon(ctx, P, X_DEN, 0, -1.9, tong, luaDen) });
    ds.push({ z: P([X_BINH, 0, 0]).z, ve: () => {
      veBinhKhi(ctx, P, {
        x: X_BINH, z: 0, yDay: Y_BINH_DAY, yMieng: Y_BINH_MIENG, r: R_BINH,
        mauKhi: so2, dam: trongBinh ? noiSuy(0.05, 0.4, tienDo) : 0.05, dayNap: nap,
      }, () => { if (trongBinh) veHatMem(ctx, P, tt.khi, so2, 0.3); });
      /* Dưới đáy bình một quãng: đáy bình chiếu xuống thành hình bầu dục nên
         nhãn sát quá là nằm đè lên vành. */
      veNhan(ctx, P, [X_BINH, Y_BINH_DAY - 0.58, 0], 'bình O₂', 13);
    } });
    ds.push({ z: P([bat[0], 0, 0]).z + 0.02, ve: () => {
      /* Sulfur trong muôi: vàng → sẫm khi nóng chảy. */
      const mauS = tronMau(luuHuynh, nong, buoc === 0 ? tienDo * 0.6 : 0.6);
      veMuoiSat(ctx, P, can, bat, mauS);
      veLua(ctx, P, [bat[0], bat[1] + 0.08, bat[2]],
        trongBinh ? 0.75 : 0.34, trongBinh ? 0.2 : 0.1, tong, luaS, luaTrong,
        luaS_manh * (trongBinh ? Math.min(1, 0.55 + tienDo) : 0.55));
    } });
    veTheoChieuSau(ds);

    if (luaS_manh > 0.3) {
      veNhan(ctx, P, [bat[0], bat[1] + (trongBinh ? 1.35 : 0.75), 0],
        trongBinh ? 'ngọn lửa xanh sáng rõ' : 'ngọn lửa xanh nhạt', 12, mau('--chu-dam'));
    }
  },
});

/* ── SO₂ làm mất màu nước bromine ────────────────────────────────────────── */

interface StBr { bot: Hat[]; dem: number }

const X_BR = 0.45, R_BR = 0.4, Y_BR_DAY = -1.15, Y_BR_MIENG = 1.2, MUC_BR = 0.05;

export const b7So2Bromine = dinhNghia<StBr>({
  id: 'b7-so2-bromine',
  baiId: 'bai-7',
  ten: 'SO₂ làm mất màu nước bromine',
  nhan: 'Bài 7 · gợi ý thêm',
  moTaAria: 'Cảnh 3D: ống dẫn khí SO₂ sục vào ống nghiệm đựng nước bromine màu vàng, màu nhạt dần rồi mất hẳn.',
  ptHoaHoc: ['SO₂ + Br₂ + 2H₂O → H₂SO₄ + 2HBr'],
  buoc: [
    { nhan: 'Nước bromine màu vàng', giay: 3, hienTuong: 'Ống nghiệm đựng nước bromine loãng, màu vàng cam nhìn rõ.' },
    { nhan: 'Sục khí SO₂ vào', giay: 5, hienTuong: 'Dẫn khí SO₂ qua ống thuỷ tinh xuống đáy ống nghiệm, bọt khí nổi lên liên tục.' },
    { nhan: 'Màu vàng mất dần', giay: 7, hienTuong: 'Màu vàng của nước bromine nhạt dần rồi mất hẳn: Br₂ đã bị SO₂ khử thành HBr không màu.' },
  ],
  cam: { yaw: 0.3, pitch: 0.18 },
  phong: 1,
  tao: () => ({ bot: [], dem: 0 }),
  ve: ({ ctx, P, buoc, tienDo, dt, tt }: KhungVe<StBr>) => {
    const brom = mau('--mau-brom'), trong = mau('--mau-dd-trong'), so2 = mauKhi('--mau-so2', 0.4);
    const nhat = buoc < 2 ? 0 : Math.min(1, tienDo * 1.15);
    const mauDd = tronMau(brom, trong, nhat);
    const soi = buoc === 1 ? Math.min(1, tienDo * 2) : buoc >= 2 ? 1 : 0;

    if (dt > 0) {
      tt.dem += dt;
      if (soi > 0 && tt.dem > 0.05 / soi) {
        tt.dem = 0;
        tt.bot.push(hatMoi(
          [X_BR + nhienNgau(-0.1, 0.1), -0.7, nhienNgau(-0.1, 0.1)],
          [0, nhienNgau(0.5, 0.9), 0], 2, nhienNgau(0.04, 0.08),
        ));
      }
      tt.bot = chayHat(tt.bot, dt, [0, 0.25, 0], 0.25).filter(h => h.p[1] < MUC_BR - 0.02);
    }

    veMatBan(ctx, P, -1.85);

    veOngNghiem(ctx, P, {
      x: X_BR, z: 0, yDay: Y_BR_DAY, yMieng: Y_BR_MIENG, r: R_BR, muc: MUC_BR,
      mauLong: mauDd, dam: noiSuy(0.62, 0.18, nhat),
    }, () => veBotKhi(ctx, P, tt.bot, so2));

    /* Ống dẫn khí đi từ ngoài vào, thả đầu xuống sát đáy ống nghiệm. */
    veOngDan(ctx, P, [[-2.5, 1.55, 0], [X_BR, 1.55, 0], [X_BR, -0.82, 0]]);
    veNhan(ctx, P, [-2.25, 1.85, 0], 'khí SO₂', 13);
    veNhan(ctx, P, [X_BR + 1.25, -0.4, 0], nhat > 0.85 ? 'mất màu' : 'nước bromine', 13);
  },
});
