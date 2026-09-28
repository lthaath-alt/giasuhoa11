/**
 * BÀI 24 — CARBOXYLIC ACID.
 *
 * · Tính acid của acetic acid (SGK tr. 149): ba phép thử quen thuộc của acid.
 * · Phản ứng ester hoá (SGK tr. 150): nhận ra bằng lớp chất lỏng nổi lên và
 *   mùi thơm, nên cảnh phải cho thấy rõ lớp ester tách ra sau khi thêm muối.
 * · Giấm và baking soda thổi phồng bóng bay — làm được ở nhà.
 */
import {
  chayHat, Hat, hatMoi, mau, mauKhi, MucVe, nhienNgau, noiSuy, tronMau, V3,
  veBotKhi, veChaiBong, veCoc, veGiay, veHatRan, veLopLong, veMatBan, veNhan,
  veOngNghiem, veQuaCau, veTheoChieuSau,
} from '../dungCu3d';
import { dinhNghia, giua, KhungVe } from '../kichBan';

const Y_DAY = -1.1, Y_MIENG = 0.85, R_ONG = 0.32, MUC = -0.25;

/* ── tính acid của acetic acid ───────────────────────────────────────────── */

interface StAcid { botMg: Hat[]; botCO2: Hat[]; dem: number }

export const b24TinhAcid = dinhNghia<StAcid>({
  id: 'b24-tinh-acid',
  baiId: 'bai-24',
  ten: 'Tính acid của acetic acid',
  nhan: 'Bài 24 · SGK tr. 149',
  moTaAria: 'Cảnh 3D: giấy quỳ hoá đỏ, ống bột magnesium sủi khí và ống Na₂CO₃ sủi bọt khi gặp acetic acid.',
  ptHoaHoc: [
    'Mg + 2CH₃COOH → (CH₃COO)₂Mg + H₂↑',
    'Na₂CO₃ + 2CH₃COOH → 2CH₃COONa + CO₂↑ + H₂O',
  ],
  buoc: [
    { nhan: 'Nhỏ acid lên giấy quỳ', giay: 4, hienTuong: 'Giấy quỳ tím chuyển sang đỏ: trong dung dịch có ion H⁺.' },
    { nhan: 'Cho bột Mg vào acid', giay: 5, hienTuong: 'Bột magnesium tan dần, sủi bọt khí không màu — đó là hydrogen.' },
    { nhan: 'Cho acid vào Na₂CO₃', giay: 5, hienTuong: 'Sủi bọt khí mạnh ngay lập tức: acetic acid mạnh hơn carbonic acid nên đẩy được CO₂ ra khỏi muối carbonate.' },
    { nhan: 'Kết luận', giay: 6, hienTuong: 'Acetic acid có đủ tính chất của một acid: đổi màu chất chỉ thị, tác dụng với kim loại và với muối carbonate. Nó là acid yếu, chỉ phân li một phần, nhưng vẫn mạnh hơn carbonic acid.' },
  ],
  cam: { yaw: 0.26, pitch: 0.2 },
  phong: 0.9,
  tao: () => ({ botMg: [], botCO2: [], dem: 0 }),
  ve: ({ ctx, P, buoc, tienDo, dt, tt }: KhungVe<StAcid>) => {
    const trong = mau('--mau-dd-trong'), kl = mau('--mau-sat');
    const doQuy = buoc === 0 ? Math.min(1, tienDo * 1.4) : 1;
    const soiMg = buoc === 1 ? Math.min(1, tienDo * 1.6) : buoc > 1 ? 0.55 : 0;
    const soiCO2 = buoc === 2 ? Math.min(1, tienDo * 2) : buoc > 2 ? 0.7 : 0;
    const conMg = buoc <= 1 ? 1 - (buoc === 1 ? tienDo * 0.5 : 0) : 0.4;

    if (dt > 0) {
      tt.dem += dt;
      if (tt.dem > 0.07) {
        tt.dem = 0;
        if (soiMg > 0) tt.botMg.push(hatMoi([-0.2 + nhienNgau(-0.14, 0.14), Y_DAY + 0.14, nhienNgau(-0.12, 0.12)], [0, nhienNgau(0.45, 0.8), 0], 1.6, nhienNgau(0.03, 0.055)));
        if (soiCO2 > 0) tt.botCO2.push(hatMoi([1.45 + nhienNgau(-0.14, 0.14), Y_DAY + 0.14, nhienNgau(-0.12, 0.12)], [0, nhienNgau(0.6, 1), 0], 1.6, nhienNgau(0.04, 0.07)));
      }
      tt.botMg = chayHat(tt.botMg, dt, [0, 0.25, 0], 0.2).filter(h => h.p[1] < MUC - 0.02);
      tt.botCO2 = chayHat(tt.botCO2, dt, [0, 0.3, 0], 0.2).filter(h => h.p[1] < MUC - 0.02);
    }

    veMatBan(ctx, P, -1.6);
    const ds: MucVe[] = [];
    ds.push({ z: 0, ve: () => {
      /* Mẩu quỳ nằm trên mặt bàn, một giọt acid vừa rơi xuống. */
      veGiay(ctx, P, [-1.75, -0.55, 0], 0.46, 0.3, tronMau(mau('--mau-chi-thi-tim'), mau('--mau-quy-do'), doQuy));
      veNhan(ctx, P, [-1.75, -0.95, 0], 'giấy quỳ', 12);
      if (buoc === 0) {
        const q = P(giua([-1.75, 0.9, 0], [-1.75, -0.5, 0], (tienDo * 3) % 1) as V3);
        veQuaCau(ctx, q.x, q.y, 0.06 * q.s, trong, 0.95);
      }
    } });
    for (const [x, ten, khi, bot] of [
      [-0.2, 'CH₃COOH + Mg', 'H₂ ↑', tt.botMg] as const,
      [1.45, 'CH₃COOH + Na₂CO₃', 'CO₂ ↑', tt.botCO2] as const,
    ]) {
      ds.push({ z: 0, ve: () => {
        veOngNghiem(ctx, P, { x, z: 0, yDay: Y_DAY, yMieng: Y_MIENG, r: R_ONG, muc: MUC, mauLong: trong, dam: 0.2 }, () => {
          if (x < 0 && conMg > 0.05) {
            const hat: Hat[] = [];
            for (let i = 0; i < 8; i++) {
              const g = i * 2.399963, r = 0.16 * Math.sqrt((i + 0.5) / 8);
              hat.push(hatMoi([x + Math.cos(g) * r, Y_DAY + 0.1, Math.sin(g) * r], [0, 0, 0], 9, 0.05));
            }
            veHatRan(ctx, P, hat, kl, conMg);
          }
          veBotKhi(ctx, P, bot, mauKhi('--mau-khoi', 0.45));
        });
        veNhan(ctx, P, [x, Y_DAY - 0.3, 0], ten, 12);
        if ((x < 0 ? soiMg : soiCO2) > 0.4) veNhan(ctx, P, [x, Y_MIENG + 0.4, 0], khi, 12, mau('--chu-dam'));
      } });
    }
    veTheoChieuSau(ds);
  },
});

/* ── phản ứng ester hoá ──────────────────────────────────────────────────── */

export const b24EsterHoa = dinhNghia<Record<string, never>>({
  id: 'b24-ester-hoa',
  baiId: 'bai-24',
  ten: 'Phản ứng ester hoá — điều chế ethyl acetate',
  nhan: 'Bài 24 · SGK tr. 150',
  moTaAria: 'Cảnh 3D: đun cách thuỷ hỗn hợp ethanol, acetic acid và H₂SO₄ đặc, thêm nước muối bão hoà cho lớp ester nổi lên.',
  ptHoaHoc: ['CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O  (H₂SO₄ đặc, t°)'],
  buoc: [
    { nhan: 'Trộn ethanol, acid và H₂SO₄ đặc', giay: 4, hienTuong: 'Ba chất tan lẫn vào nhau thành một chất lỏng trong suốt. H₂SO₄ đặc vừa là xúc tác vừa hút nước, kéo cân bằng về phía tạo ester.' },
    { nhan: 'Đun cách thuỷ 60 – 70 °C', giay: 5, hienTuong: 'Ngâm ống vào cốc nước nóng khoảng 5 phút. Không đun lửa trực tiếp vì hỗn hợp dễ bay hơi và dễ cháy.' },
    { nhan: 'Để nguội, thêm NaCl bão hoà', giay: 5, hienTuong: 'Thêm khoảng 5 mL dung dịch NaCl bão hoà: ester tan rất kém trong nước muối nên bị đẩy hẳn ra.' },
    { nhan: 'Lớp ester nổi lên trên', giay: 7, hienTuong: 'Chất lỏng tách hai lớp, lớp ester nhẹ hơn nổi lên trên và có mùi thơm. Đó là dấu hiệu nhận ra ester — phản ứng này thuận nghịch nên không bao giờ chuyển hoá hết.' },
  ],
  cam: { yaw: 0.26, pitch: 0.2 },
  phong: 1.05,
  tao: () => ({}),
  ve: ({ ctx, P, buoc, tienDo }: KhungVe<Record<string, never>>) => {
    const trong = mau('--mau-dd-trong'), ester = mau('--mau-huu-co');
    const ngam = buoc === 1 ? tienDo : buoc > 1 ? (buoc === 2 ? 1 - tienDo : 0) : 0;
    const muoi = buoc === 2 ? Math.min(1, tienDo * 1.2) : buoc > 2 ? 1 : 0;
    const tach = buoc === 3 ? Math.min(1, tienDo * 1.2) : 0;
    const dy = noiSuy(0, -0.26, ngam);
    const mucNay = noiSuy(MUC, 0.2, muoi);

    veMatBan(ctx, P, -1.9);
    const veOng = () => veOngNghiem(ctx, P, {
      x: 0, z: 0, yDay: Y_DAY + dy, yMieng: Y_MIENG + dy + 0.15, r: 0.36, muc: mucNay + dy,
      mauLong: trong, dam: 0.22,
    }, () => {
      /* Lớp ester tách ra nằm TRÊN vì nhẹ hơn nước muối. */
      if (tach > 0.05) veLopLong(ctx, P, 0, 0, 0.36, mucNay + dy - 0.35 * tach, mucNay + dy, ester, 0.45);
    });

    if (ngam > 0.04) {
      veCoc(ctx, P, {
        x: 0, z: 0, yDay: -1.65, yMieng: -0.4, r: 0.66,
        muc: noiSuy(-1.65, -0.55, ngam), mauLong: trong, dam: 0.26,
      }, veOng);
      veNhan(ctx, P, [0, -1.95, 0], 'cốc nước nóng 60 – 70 °C', 12);
    } else {
      veOng();
    }

    veNhan(ctx, P, [-1.4, mucNay + dy - 0.5, 0], buoc === 0 ? 'ethanol + CH₃COOH' : 'hỗn hợp phản ứng', 12);
    if (buoc === 2) {
      const q = P(giua([0, 1.75, 0], [0, mucNay, 0], (tienDo * 3) % 1) as V3);
      veQuaCau(ctx, q.x, q.y, 0.07 * q.s, trong, 0.95);
      veNhan(ctx, P, [1.35, 1.6, 0], 'NaCl bão hoà', 12);
    }
    if (tach > 0.5) veNhan(ctx, P, [1.45, mucNay + dy - 0.15, 0], 'lớp ester, mùi thơm', 12, mau('--chu-dam'));
  },
});

/* ── giấm và baking soda ─────────────────────────────────────────────────── */

interface StBong { bot: Hat[]; dem: number }

export const b24GiamBakingSoda = dinhNghia<StBong>({
  id: 'b24-giam-baking-soda',
  baiId: 'bai-24',
  ten: 'Giấm và baking soda thổi phồng bóng bay',
  nhan: 'Bài 24 · gợi ý thêm',
  moTaAria: 'Cảnh 3D: chai giấm chụp quả bóng bay đựng baking soda; bột rơi xuống, hỗn hợp sủi bọt và bóng phồng lên.',
  ptHoaHoc: ['NaHCO₃ + CH₃COOH → CH₃COONa + CO₂↑ + H₂O'],
  buoc: [
    { nhan: 'Giấm vào chai, baking soda vào bóng', giay: 4, hienTuong: 'Rót giấm vào chai, cho bột baking soda vào quả bóng bay bằng phễu nhỏ.' },
    { nhan: 'Chụp bóng lên miệng chai', giay: 3, hienTuong: 'Chụp miệng bóng vào cổ chai nhưng vẫn để bóng gục sang bên, chưa cho bột rơi xuống.' },
    { nhan: 'Dựng bóng cho bột rơi xuống', giay: 4, hienTuong: 'Dựng bóng lên, bột rơi xuống giấm và hỗn hợp sủi bọt mạnh ngay.' },
    { nhan: 'Bóng phồng lên', giay: 7, hienTuong: 'Khí CO₂ sinh ra không thoát đi đâu được nên dồn lên làm quả bóng phồng to. Đây chính là phản ứng của acid với muối carbonate, làm bằng đồ trong bếp.' },
  ],
  cam: { yaw: 0.22, pitch: 0.18 },
  phong: 1,
  tao: () => ({ bot: [], dem: 0 }),
  ve: ({ ctx, P, buoc, tienDo, dt, tt }: KhungVe<StBong>) => {
    const giam = mau('--mau-dd-trong');
    const soi = buoc === 2 ? Math.min(1, tienDo * 2) : buoc > 2 ? 1 : 0;
    const phong = buoc === 3 ? Math.min(1, tienDo * 1.1) : 0;

    if (dt > 0) {
      tt.dem += dt;
      if (soi > 0 && tt.dem > 0.05 / soi) {
        tt.dem = 0;
        tt.bot.push(hatMoi([nhienNgau(-0.3, 0.3), -1.3, nhienNgau(-0.25, 0.25)], [0, nhienNgau(0.6, 1), 0], 1.6, nhienNgau(0.04, 0.08)));
      }
      tt.bot = chayHat(tt.bot, dt, [0, 0.3, 0], 0.25).filter(h => h.p[1] < -0.45);
    }

    veMatBan(ctx, P, -1.75);
    veChaiBong(ctx, P, {
      x: 0, z: 0, yDay: -1.6, cao: 1.9, r: 0.55, muc: -0.5,
      mauLong: giam, phong: buoc >= 1 ? Math.max(0.04, phong) : 0,
    }, () => veBotKhi(ctx, P, tt.bot, mauKhi('--mau-khoi', 0.45)));

    /* Bột baking soda rơi từ cổ chai xuống khi dựng bóng lên. */
    if (buoc === 2 && tienDo < 0.5) {
      const hat: Hat[] = [];
      for (let i = 0; i < 6; i++) {
        hat.push(hatMoi([nhienNgau(-0.1, 0.1), noiSuy(0.3, -0.45, (tienDo * 2 + i * 0.12) % 1), 0], [0, 0, 0], 9, 0.05));
      }
      veHatRan(ctx, P, hat, mauKhi('--mau-ket-tua', 0.3));
    }
    veNhan(ctx, P, [-1.35, -0.75, 0], 'giấm', 12);
    veNhan(ctx, P, [1.35, 0.95, 0], buoc === 0 ? 'baking soda trong bóng' : phong > 0.4 ? 'CO₂ làm bóng phồng' : 'bóng bay', 12);
  },
});
