/**
 * BÀI 11 — PHƯƠNG PHÁP TÁCH VÀ TINH CHẾ HỢP CHẤT HỮU CƠ.
 *
 * Bốn cách tách của SGK: chưng cất, chiết, kết tinh và sắc kí. Điểm chung cần
 * cho học sinh thấy là CÁI GÌ đi đường nào — hơi đi lên rồi ngưng lại, chất tan
 * chuyển sang dung môi kia, tạp chất ở lại trong nước cái, các màu chạy nhanh
 * chậm khác nhau.
 */
import {
  chayHat, Hat, hatMoi, mau, mauKhi, MucVe, nhienNgau, noiSuy, to, tronMau,
  veBatSu, veBinhCau, veBinhTamGiac, veBotKhi, veCoc, veDenCon, veGiay, veHatMem, veHatRan,
  veMatBan, veNhan, veNhietKe, veOngSinhHan, vePheuChiet, vePheuLoc, veQuaCau,
  veTheoChieuSau, vienXoay,
} from '../dungCu3d';
import { dinhNghia, KhungVe } from '../kichBan';

/* ── chưng cất ───────────────────────────────────────────────────────────── */

interface StCat { bot: Hat[]; giot: Hat[]; dem: number; demGiot: number }

const X_BINH = -1.45, Y_TAM = -0.5, R_BINH = 0.62;
const X_HUNG = 1.5, Y_HUNG = -1.5;

export const b11ChungCat = dinhNghia<StCat>({
  id: 'b11-chung-cat',
  baiId: 'bai-11',
  ten: 'Chưng cất ethanol từ rượu',
  nhan: 'Bài 11 · SGK tr. 64',
  moTaAria: 'Cảnh 3D: bình cầu đựng rượu đun trên đèn cồn, nhiệt kế ở cổ bình, ống sinh hàn nghiêng dẫn sang bình hứng.',
  ptHoaHoc: ['Ethanol sôi ở 78 °C, nước sôi ở 100 °C — tách được nhờ chênh lệch nhiệt độ sôi'],
  buoc: [
    { nhan: 'Lắp bộ chưng cất', giay: 4, hienTuong: 'Rượu và vài viên đá bọt trong bình cầu (không quá 2/3 bình), nhiệt kế ở cổ bình, ống sinh hàn nối sang bình hứng.' },
    { nhan: 'Đun từ từ', giay: 5, hienTuong: 'Chất lỏng sôi lăn tăn quanh đá bọt, nhiệt độ trên nhiệt kế tăng dần.' },
    { nhan: 'Hơi ngưng tụ chảy xuống', giay: 7, hienTuong: 'Nhiệt kế đứng yên quanh 78 °C trong khi từng giọt chất lỏng ngưng tụ chảy xuống bình hứng — đó là phần giàu ethanol.' },
    { nhan: 'Nhiệt độ tăng lại thì ngừng đun', giay: 5, hienTuong: 'Khi nhiệt kế bắt đầu nhích lên khỏi 78 °C nghĩa là ethanol đã bay gần hết, nước bắt đầu bay hơi theo — ngừng đun. Sản phẩm hứng được có độ cồn cao hơn rượu ban đầu.' },
  ],
  cam: { yaw: 0.2, pitch: 0.18 },
  phong: 0.82,
  tao: () => ({ bot: [], giot: [], dem: 0, demGiot: 0 }),
  ve: ({ ctx, P, buoc, tienDo, tong, dt, tt }: KhungVe<StCat>) => {
    const ruou = mau('--mau-huu-co'), hoiMau = mauKhi('--mau-khoi', 0.4);
    const dun = buoc >= 1;
    const lua = buoc === 1 ? Math.min(1, tienDo * 2) : buoc === 2 ? 1 : buoc === 3 ? Math.max(0, 1 - tienDo * 1.5) : 0;
    const soi = buoc === 1 ? Math.min(1, tienDo * 1.6) : buoc >= 2 ? 1 : 0;
    /* Nhiệt kế: tăng dần → đứng ở 78 °C → nhích lên lại. */
    const nhiet = buoc <= 0 ? 0.12 : buoc === 1 ? noiSuy(0.12, 0.62, tienDo) : buoc === 2 ? 0.62 : noiSuy(0.62, 0.85, tienDo);
    const sonhiet = buoc <= 0 ? '25 °C' : buoc === 1 ? `${Math.round(noiSuy(25, 78, tienDo))} °C` : buoc === 2 ? '78 °C' : `${Math.round(noiSuy(78, 95, tienDo))} °C`;
    const mucBinh = buoc <= 1 ? -0.62 : noiSuy(-0.62, -0.85, buoc === 2 ? tienDo : 1);
    const mucHung = buoc <= 1 ? Y_HUNG : noiSuy(Y_HUNG, Y_HUNG + 0.42, buoc === 2 ? tienDo : 1);

    if (dt > 0) {
      tt.dem += dt;
      if (soi > 0 && tt.dem > 0.09 / soi) {
        tt.dem = 0;
        tt.bot.push(hatMoi([X_BINH + nhienNgau(-0.3, 0.3), Y_TAM - 0.45, nhienNgau(-0.25, 0.25)],
          [0, nhienNgau(0.4, 0.7), 0], 1.5, nhienNgau(0.04, 0.07)));
      }
      tt.bot = chayHat(tt.bot, dt, [0, 0.2, 0], 0.2).filter(h => h.p[1] < mucBinh - 0.02);
      tt.demGiot += dt;
      if (buoc >= 2 && lua > 0.1 && tt.demGiot > 0.55) {
        tt.demGiot = 0;
        tt.giot.push(hatMoi([X_HUNG - 0.18, -0.34, 0], [0.05, -0.15, 0], 1.6, 0.07));
      }
      tt.giot = chayHat(tt.giot, dt, [0, -1.4, 0], 0).filter(h => h.p[1] > mucHung);
    }

    veMatBan(ctx, P, -2.05);
    const ds: MucVe[] = [];

    ds.push({ z: -0.05, ve: () => {
      if (dun) veDenCon(ctx, P, X_BINH, 0, -2.0, tong, lua);
      veBinhCau(ctx, P, {
        x: X_BINH, z: 0, yTam: Y_TAM, r: R_BINH, muc: mucBinh, mauLong: ruou, dam: 0.35, yCo: 1.15, rCo: 0.2,
      }, () => {
        veBotKhi(ctx, P, tt.bot, hoiMau);
        /* Đá bọt nằm đáy bình. */
        const da: Hat[] = [-0.2, 0, 0.2].map((d, i) => hatMoi([X_BINH + d, Y_TAM - R_BINH + 0.12, d * 0.5 + (i % 2) * 0.1], [0, 0, 0], 9, 0.06));
        veHatRan(ctx, P, da, mau('--chu-mo'));
      });
      veNhietKe(ctx, P, X_BINH, 0, 0.55, 1.05, nhiet);
      veNhan(ctx, P, [X_BINH - 0.95, 1.5, 0], sonhiet, 13, mau('--chu-dam'));
      /* Nhãn sang bên trái bình: đặt dưới đáy bình là nằm đè lên ngọn đèn cồn. */
      veNhan(ctx, P, [X_BINH - 1.05, Y_TAM - 0.15, 0], 'rượu', 12);
    } });

    /* Ống sinh hàn nghiêng từ cổ bình xuống bình hứng. */
    ds.push({ z: 0.02, ve: () => {
      veOngSinhHan(ctx, P, [X_BINH + 0.18, 1.05, 0], [X_HUNG - 0.18, -0.3, 0]);
      /* Trên ống một quãng: đặt ngay trên trục ống là chữ nằm đè lên vỏ sinh hàn. */
      veNhan(ctx, P, [0.1, 1.35, 0], 'ống sinh hàn', 12, mau('--chu'));
    } });

    ds.push({ z: 0.05, ve: () => {
      veBinhTamGiac(ctx, P, {
        x: X_HUNG, z: 0, yDay: Y_HUNG, cao: 1.1, rDay: 0.52, rCo: 0.2,
        muc: mucHung, mauLong: ruou, dam: 0.4,
      });
      veNhan(ctx, P, [X_HUNG, Y_HUNG - 0.3, 0], 'bình hứng', 12);
    } });
    veTheoChieuSau(ds);

    veHatRan(ctx, P, tt.giot, tronMau(ruou, mau('--chu-mo'), 0.2));
    if (buoc >= 2) veHatMem(ctx, P, tt.bot.slice(0, 3), hoiMau, 0.25);
  },
});

/* ── chiết ───────────────────────────────────────────────────────────────── */

const X_PHEU = -0.1, Y_PHEU = -0.35, CAO_PHEU = 2.1, R_PHEU = 0.62;

export const b11Chiet = dinhNghia<Record<string, never>>({
  id: 'b11-chiet',
  baiId: 'bai-11',
  ten: 'Chiết β-carotene từ nước ép cà rốt',
  nhan: 'Bài 11 · SGK tr. 66',
  moTaAria: 'Cảnh 3D: phễu chiết đựng nước ép cà rốt và hexane, lắc rồi để yên cho tách hai lớp, mở khoá xả lớp nước.',
  ptHoaHoc: ['β-carotene tan tốt trong hexane, tan kém trong nước → chuyển sang lớp hexane'],
  buoc: [
    { nhan: 'Cho nước ép và hexane', giay: 4, hienTuong: 'Hai chất lỏng không tan vào nhau: nước ép cà rốt màu cam đục ở dưới, hexane không màu nhẹ hơn nổi lên trên.' },
    { nhan: 'Đậy nút và lắc 2 phút', giay: 4, hienTuong: 'Lắc cho hai lớp trộn thành nhũ: diện tích tiếp xúc lớn thì β-carotene mới kịp chuyển sang hexane.' },
    { nhan: 'Để yên 5 phút', giay: 6, hienTuong: 'Hỗn hợp tách lại thành hai lớp. Lớp hexane ở trên chuyển từ không màu sang vàng cam; lớp nước ở dưới nhạt màu đi.' },
    { nhan: 'Mở khoá xả lớp nước', giay: 6, hienTuong: 'Mở nút đậy rồi mở khoá, xả hết lớp nước ở dưới xuống cốc, giữ lại lớp hexane có β-carotene trong phễu.' },
  ],
  cam: { yaw: 0.22, pitch: 0.18 },
  phong: 0.95,
  tao: () => ({}),
  ve: ({ ctx, P, buoc, tienDo, tong }: KhungVe<Record<string, never>>) => {
    const carot = mau('--mau-carotene'), hexane = mau('--mau-huu-co'), nuocEp = mau('--mau-carotene');
    const lac = buoc === 1 ? Math.sin(tong * 9) * 0.1 * Math.min(1, tienDo * 3) : 0;
    const tron = buoc === 1 ? Math.min(1, tienDo * 1.5) : buoc === 2 ? Math.max(0, 1 - tienDo * 1.6) : 0;
    const chuyen = buoc === 2 ? Math.min(1, tienDo * 1.3) : buoc > 2 ? 1 : 0;
    const xa = buoc === 3 ? Math.min(1, tienDo * 1.15) : 0;

    /* Mặt phân cách: xả hết lớp nước thì ranh giới tụt xuống đáy. */
    const yDuoi = Y_PHEU + 0.1, yRanh = noiSuy(Y_PHEU + 0.72, yDuoi, xa), yTren = Y_PHEU + 1.25;
    const ban = (y: number) => {
      const yPhinh = Y_PHEU + CAO_PHEU * 0.38;
      return y <= yPhinh
        ? R_PHEU * Math.sqrt(Math.max(0, (y - Y_PHEU) / (yPhinh - Y_PHEU)))
        : R_PHEU * (1 - 0.72 * (y - yPhinh) / (Y_PHEU + CAO_PHEU - yPhinh));
    };

    veMatBan(ctx, P, -2.0);
    const x = X_PHEU + lac;

    vePheuChiet(ctx, P, { x, z: 0, yDay: Y_PHEU, cao: CAO_PHEU, r: R_PHEU }, () => {
      if (tron > 0.35) {
        /* Đang lắc: một khối nhũ đều màu, không còn ranh giới. */
        to(ctx, vienXoay(P, x, 0, yDuoi, yTren, ban, 8), tronMau(nuocEp, hexane, 0.45));
      } else {
        to(ctx, vienXoay(P, x, 0, yDuoi, yRanh, ban, 8), tronMau(nuocEp, mau('--mau-dd-trong'), chuyen * 0.75));
        to(ctx, vienXoay(P, x, 0, yRanh, yTren, ban, 8), tronMau(hexane, carot, chuyen));
      }
    });

    veNhan(ctx, P, [x + 1.15, yTren - 0.2, 0], chuyen > 0.6 ? 'hexane có β-carotene' : 'hexane', 12);
    veNhan(ctx, P, [x + 1.15, yRanh - 0.25, 0], 'nước ép cà rốt', 12);

    /* Cốc hứng lớp nước ở dưới khoá. */
    veCoc(ctx, P, {
      x, z: 0, yDay: -1.95, yMieng: -1.15, r: 0.45,
      muc: noiSuy(-1.95, -1.35, xa), mauLong: tronMau(nuocEp, mau('--mau-dd-trong'), 0.7), dam: 0.45,
    });
    if (xa > 0.05 && xa < 0.97) {
      const q = P([x, noiSuy(Y_PHEU - 0.45, -1.4, (tong * 2) % 1), 0]);
      veQuaCau(ctx, q.x, q.y, 0.06 * q.s, nuocEp, 0.9);
    }
  },
});

/* ── kết tinh ────────────────────────────────────────────────────────────── */

export const b11KetTinh = dinhNghia<Record<string, never>>({
  id: 'b11-ket-tinh',
  baiId: 'bai-11',
  ten: 'Tinh chế đường đỏ thành đường trắng',
  nhan: 'Bài 11 · SGK tr. 68',
  moTaAria: 'Cảnh 3D: hoà đường đỏ vào nước nóng, khử màu bằng than hoạt tính, lọc rồi cô bớt nước cho đường kết tinh.',
  ptHoaHoc: ['Than hoạt tính hấp phụ chất màu; đường kết tinh lại khi dung dịch nguội và bão hoà'],
  buoc: [
    { nhan: 'Hoà đường đỏ vào nước nóng', giay: 4, hienTuong: 'Đường đỏ tan hết trong nước nóng, cho dung dịch màu nâu.' },
    { nhan: 'Thêm than hoạt tính', giay: 5, hienTuong: 'Khuấy than hoạt tính vào dung dịch; than hấp phụ chất màu nên dung dịch nhạt dần.' },
    { nhan: 'Lọc bỏ than', giay: 5, hienTuong: 'Lọc qua phễu có giấy lọc: than đen ở lại trên giấy, nước đường gần như không màu chảy xuống.' },
    { nhan: 'Cô bớt nước, để nguội', giay: 7, hienTuong: 'Cô bớt nước rồi để nguội, dung dịch quá bão hoà và đường kết tinh thành tinh thể trắng.' },
  ],
  cam: { yaw: 0.24, pitch: 0.24 },
  phong: 1.15,
  tao: () => ({}),
  ve: ({ ctx, P, buoc, tienDo, tong }: KhungVe<Record<string, never>>) => {
    const nau = mau('--mau-nau-duong'), than = mau('--mau-than'), trang = mauKhi('--mau-duong', 0.3);
    const tan = buoc === 0 ? Math.min(1, tienDo * 1.3) : 1;
    const khuMau = buoc === 1 ? Math.min(1, tienDo * 1.2) : buoc > 1 ? 1 : 0;
    const loc = buoc === 2 ? Math.min(1, tienDo * 1.15) : buoc > 2 ? 1 : 0;
    const ketTinh = buoc === 3 ? Math.min(1, tienDo * 1.2) : 0;

    veMatBan(ctx, P, -1.9);

    if (buoc <= 1) {
      veCoc(ctx, P, {
        x: 0, z: 0, yDay: -1.4, yMieng: 0.1, r: 0.72, muc: -0.45,
        mauLong: tronMau(nau, mau('--mau-dd-trong'), khuMau * 0.85), dam: noiSuy(0.2, 0.62, tan),
      }, () => {
        if (buoc === 1) {
          const bui: Hat[] = [];
          for (let i = 0; i < 14; i++) {
            const g = i * 2.4, r = 0.45 * Math.sqrt((i + 0.5) / 14);
            bui.push(hatMoi([Math.cos(g + tong) * r, -0.7 + (i % 3) * 0.12, Math.sin(g + tong) * r], [0, 0, 0], 9, 0.05));
          }
          veHatRan(ctx, P, bui, than);
        }
      });
      veNhan(ctx, P, [1.4, -0.5, 0], buoc === 0 ? 'nước đường đỏ' : 'thêm than hoạt tính', 12);
    } else if (buoc === 2) {
      /* Phễu lọc đặt trên cốc: than giữ lại trên giấy. */
      vePheuLoc(ctx, P, { x: 0, z: 0, yDinh: 0.25, cao: 0.85, r: 0.62, coGiay: true });
      const bui: Hat[] = [];
      for (let i = 0; i < 12; i++) {
        const g = i * 2.4, r = 0.3 * Math.sqrt((i + 0.5) / 12);
        bui.push(hatMoi([Math.cos(g) * r, 0.62, Math.sin(g) * r], [0, 0, 0], 9, 0.05));
      }
      veHatRan(ctx, P, bui, than);
      veCoc(ctx, P, { x: 0, z: 0, yDay: -1.4, yMieng: -0.15, r: 0.6, muc: noiSuy(-1.4, -0.5, loc), mauLong: mau('--mau-dd-trong'), dam: 0.25 });
      if (loc < 0.95) {
        const q = P([0, noiSuy(-0.15, -0.55, (tong * 2.2) % 1), 0]);
        veQuaCau(ctx, q.x, q.y, 0.055 * q.s, mau('--mau-dd-trong'), 0.9);
      }
      veNhan(ctx, P, [1.35, 0.7, 0], 'than ở lại trên giấy lọc', 12);
    } else {
      veBatSu(ctx, P, { x: 0, z: 0, yDay: -1.3, r: 0.8, muc: noiSuy(-1.15, -1.24, ketTinh), mauLong: mau('--mau-dd-trong') });
      const tinhThe: Hat[] = [];
      const n = Math.round(ketTinh * 22);
      for (let i = 0; i < n; i++) {
        const g = i * 2.399963, r = 0.6 * Math.sqrt((i + 0.5) / 22);
        tinhThe.push(hatMoi([Math.cos(g) * r, -1.2 + (i % 2) * 0.05, Math.sin(g) * r], [0, 0, 0], 9, 0.07));
      }
      veHatRan(ctx, P, tinhThe, trang);
      veNhan(ctx, P, [1.5, -1.1, 0], 'tinh thể đường trắng', 12);
    }
  },
});

/* ── sắc kí giấy ─────────────────────────────────────────────────────────── */

/** Ba chất màu trong mực chạy nhanh chậm khác nhau — đó là điều cần thấy. */
const DAI_MUC = [
  { mau: '--mau-muc-3', toc: 1 },
  { mau: '--mau-muc-2', toc: 0.72 },
  { mau: '--mau-muc-1', toc: 0.42 },
];

export const b11SacKiGiay = dinhNghia<Record<string, never>>({
  id: 'b11-sac-ki-giay',
  baiId: 'bai-11',
  ten: 'Sắc kí giấy với mực bút dạ',
  nhan: 'Bài 11 · gợi ý thêm',
  moTaAria: 'Cảnh 3D: dải giấy lọc chấm mực treo trong cốc nước, nước ngấm lên kéo mực tách thành các dải màu.',
  ptHoaHoc: ['Chất nào bị giấy giữ yếu và tan tốt trong nước thì chạy lên cao hơn'],
  buoc: [
    { nhan: 'Chấm mực lên dải giấy', giay: 3, hienTuong: 'Chấm một chấm mực đậm cách mép dưới dải giấy khoảng 2 cm.' },
    { nhan: 'Nhúng mép giấy vào nước', giay: 4, hienTuong: 'Treo giấy sao cho mép dưới chạm nước, còn chấm mực phải nằm TRÊN mặt nước — nhúng ngập chấm mực là mực tan hết vào cốc.' },
    { nhan: 'Chờ nước ngấm lên', giay: 8, hienTuong: 'Nước ngấm dần lên cao, kéo theo chấm mực.' },
    { nhan: 'Đọc các dải màu', giay: 6, hienTuong: 'Chấm mực tách thành mấy dải màu ở các độ cao khác nhau: mực đen của bút dạ thực ra là hỗn hợp nhiều chất màu.' },
  ],
  cam: { yaw: 0.16, pitch: 0.14 },
  phong: 1,
  tao: () => ({}),
  ve: ({ ctx, P, buoc, tienDo }: KhungVe<Record<string, never>>) => {
    const giay = mau('--mau-giay'), nuoc = mau('--mau-dd-trong');
    const chay = buoc === 2 ? Math.min(1, tienDo) : buoc > 2 ? 1 : 0;
    const nhung = buoc >= 1;
    const yNuoc = -0.95;

    veMatBan(ctx, P, -1.85);
    veCoc(ctx, P, {
      x: 0, z: 0, yDay: -1.8, yMieng: -0.25, r: 0.75, muc: nhung ? yNuoc : -1.8,
      mauLong: nuoc, dam: 0.28,
    }, () => {
      /* Dải giấy: thân giấy, mặt nước ngấm, rồi các dải màu. */
      veGiay(ctx, P, [0, 0.15, 0], 0.5, 2.6, giay);
      if (nhung) veGiay(ctx, P, [0, noiSuy(-0.95, 0.1, chay) - 0.55, 0], 0.5, noiSuy(0.2, 1.5, chay), mau('--mau-nuoc-da'));
      if (chay < 0.15) {
        veGiay(ctx, P, [0, -0.55, 0], 0.3, 0.2, mau('--chu-dam'));
      } else {
        for (const d of DAI_MUC) {
          veGiay(ctx, P, [0, noiSuy(-0.55, -0.55 + 1.35 * d.toc, chay), 0], 0.34, 0.17, mau(d.mau));
        }
      }
    });
    veNhan(ctx, P, [1.5, yNuoc, 0], 'mặt nước', 12, mau('--chu'));
    veNhan(ctx, P, [1.5, -0.55, 0], 'vạch chấm mực', 12, mau('--chu'));
    if (chay > 0.8) veNhan(ctx, P, [1.5, 0.75, 0], 'các dải màu tách ra', 12, mau('--chu-dam'));
  },
});
