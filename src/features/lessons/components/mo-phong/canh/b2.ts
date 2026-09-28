/**
 * BÀI 2 — CÂN BẰNG TRONG DUNG DỊCH NƯỚC VÀ THUYẾT ACID – BASE.
 *
 * Ba mô phỏng khác của bài này (đèn dẫn điện, chuẩn độ, điện li nhiều nấc) là
 * component React riêng, không nằm ở đây.
 *
 * · Tự làm chất chỉ thị từ hoa đậu biếc / bắp cải tím (SGK tr. 23).
 * · Đo pH dung dịch muối — sự thuỷ phân của ion (SGK tr. 24).
 */
import {
  chayHat, Hat, hatMoi, mau, mauKhi, MucVe, nhienNgau, noiSuy, tronMau, V3,
  veCoc, veDua, veGiay, veHatMem, veHatRan, veMatBan, veNhan, veOngNghiem, veQuaCau, veTheoChieuSau,
} from '../dungCu3d';
import { dinhNghia, giua, KhungVe } from '../kichBan';

/* ── chất chỉ thị tự nhiên ───────────────────────────────────────────────── */

interface StChiThi { hoi: Hat[]; dem: number }

/** Bốn mẫu thử quen thuộc trong nhà, xếp từ acid sang base. */
const MAU_THU = [
  { x: -1.5, ten: 'giấm', pH: 'pH ≈ 3', acid: 1 },
  { x: -0.5, ten: 'nước vitamin C', pH: 'pH ≈ 4', acid: 0.75 },
  { x: 0.5, ten: 'nước muối', pH: 'pH ≈ 7', acid: 0 },
  { x: 1.5, ten: 'nước soda', pH: 'pH ≈ 9', acid: -1 },
];

export const b2ChatChiThi = dinhNghia<StChiThi>({
  id: 'b2-chat-chi-thi',
  baiId: 'bai-2',
  ten: 'Tự làm chất chỉ thị từ hoa đậu biếc hoặc bắp cải tím',
  nhan: 'Bài 2 · SGK tr. 23',
  moTaAria: 'Cảnh 3D: cốc nước màu tím nấu từ hoa đậu biếc, nhỏ vào bốn ống đựng giấm, nước vitamin C, nước muối và nước soda.',
  ptHoaHoc: ['Anthocyanin đổi cấu tạo theo pH → đổi màu (giống cách quỳ tím đổi màu)'],
  buoc: [
    { nhan: 'Ngâm hoa trong nước sôi', giay: 4, hienTuong: 'Ngâm hoa đậu biếc (hoặc bắp cải tím thái nhỏ) trong nước sôi khoảng 10 phút, nước chuyển dần sang màu tím xanh.' },
    { nhan: 'Lọc lấy nước màu', giay: 3, hienTuong: 'Lọc bỏ bã, giữ lại nước màu — đó chính là chất chỉ thị tự làm.' },
    { nhan: 'Nhỏ vào bốn mẫu thử', giay: 5, hienTuong: 'Nhỏ nước màu vào từng mẫu: giấm, nước vitamin C, nước muối và nước soda.' },
    { nhan: 'So màu', giay: 7, hienTuong: 'Môi trường acid cho màu đỏ – hồng; mẫu trung tính giữ màu tím ban đầu; môi trường base chuyển xanh – xanh lục. Có giấy pH thì đo lại để đối chiếu.' },
  ],
  cam: { yaw: 0.24, pitch: 0.22 },
  phong: 0.88,
  tao: () => ({ hoi: [], dem: 0 }),
  ve: ({ ctx, P, buoc, tienDo, dt, tt }: KhungVe<StChiThi>) => {
    const tim = mau('--mau-chi-thi-tim'), acid = mau('--mau-chi-thi-acid'), base = mau('--mau-chi-thi-base');
    const trong = mau('--mau-dd-trong');
    const ngam = buoc === 0 ? Math.min(1, tienDo * 1.2) : 1;
    const nho = buoc === 2 ? Math.min(1, tienDo * 1.3) : buoc > 2 ? 1 : 0;
    const doi = buoc === 3 ? Math.min(1, tienDo * 1.2) : 0;

    if (dt > 0) {
      tt.dem += dt;
      if (buoc === 0 && tt.dem > 0.25) {
        tt.dem = 0;
        tt.hoi.push(hatMoi([-2.1 + nhienNgau(-0.25, 0.25), 0.15, nhienNgau(-0.2, 0.2)],
          [0, nhienNgau(0.25, 0.45), 0], 2.2, 0.15));
      }
      tt.hoi = chayHat(tt.hoi, dt, [0, 0.05, 0], 0.08);
    }

    veMatBan(ctx, P, -1.5);

    const ds: MucVe[] = [];
    /* Cốc nước chỉ thị đứng riêng bên trái. */
    ds.push({ z: 0.1, ve: () => {
      veCoc(ctx, P, {
        x: -2.1, z: 0, yDay: -1.45, yMieng: -0.2, r: 0.5,
        muc: -0.5, mauLong: tronMau(trong, tim, ngam), dam: noiSuy(0.25, 0.6, ngam),
      }, () => {
        /* Cánh hoa còn trong cốc ở bước đầu, lọc xong thì hết. */
        if (buoc === 0) {
          const hoa: Hat[] = [];
          for (let i = 0; i < 5; i++) {
            const g = i * 2.4;
            hoa.push(hatMoi([-2.1 + Math.cos(g) * 0.25, -0.75 + (i % 2) * 0.12, Math.sin(g) * 0.25], [0, 0, 0], 9, 0.08));
          }
          veHatRan(ctx, P, hoa, tim, 1 - tienDo * 0.4);
        }
      });
      veNhan(ctx, P, [-2.1, -1.75, 0], buoc === 0 ? 'hoa đậu biếc + nước sôi' : 'nước chỉ thị', 12);
    } });

    /* Bốn ống mẫu thử. */
    for (const m of MAU_THU) {
      ds.push({ z: 0, ve: () => {
        const k = doi * Math.abs(m.acid);
        const dich = m.acid > 0 ? acid : base;
        const c = nho < 0.2 ? trong : tronMau(tim, dich, k);
        veOngNghiem(ctx, P, {
          x: m.x, z: 0, yDay: -1.05, yMieng: 0.6, r: 0.27, muc: -0.3,
          mauLong: c, dam: nho < 0.2 ? 0.2 : noiSuy(0.25, 0.6, nho),
        });
        veNhan(ctx, P, [m.x, -1.3, 0], m.ten, 11);
        if (doi > 0.7) veNhan(ctx, P, [m.x, -1.55, 0], m.pH, 11, mau('--chu'));
      } });
    }
    veTheoChieuSau(ds);
    veHatMem(ctx, P, tt.hoi, mauKhi('--mau-khoi', 0.4), 0.4);

    /* Giọt chỉ thị rơi xuống ống khi đang nhỏ. */
    if (buoc === 2) {
      const i = Math.min(3, Math.floor(tienDo * 4));
      const pha = (tienDo * 4) % 1;
      const q = P(giua([MAU_THU[i].x, 1.15, 0], [MAU_THU[i].x, -0.3, 0], pha) as V3);
      veQuaCau(ctx, q.x, q.y, 0.06 * q.s, tim, 0.95);
    }
    if (doi > 0.6) veNhan(ctx, P, [0, 1.35, 0], 'acid → đỏ hồng · trung tính → tím · base → xanh lục', 12, mau('--chu-dam'));
  },
});

/* ── đo pH dung dịch muối ────────────────────────────────────────────────── */

/** Ba muối của SGK: một muối cho môi trường base, hai muối cho môi trường acid. */
const MUOI = [
  { x: -1.2, ten: 'Na₂CO₃', pH: 'pH > 7', mauGiay: '--mau-quy-xanh', mauDd: '--mau-dd-trong', base: true },
  { x: 0, ten: 'AlCl₃', pH: 'pH < 7', mauGiay: '--mau-quy-do', mauDd: '--mau-dd-trong', base: false },
  { x: 1.2, ten: 'FeCl₃', pH: 'pH < 7', mauGiay: '--mau-quy-do', mauDd: '--mau-fecl3', base: false },
];

export const b2ThuyPhanMuoi = dinhNghia<Record<string, never>>({
  id: 'b2-thuy-phan-muoi',
  baiId: 'bai-2',
  ten: 'Đo pH dung dịch muối — sự thuỷ phân của ion',
  nhan: 'Bài 2 · SGK tr. 24',
  moTaAria: 'Cảnh 3D: ba ống dung dịch muối, dùng đũa thuỷ tinh chấm lên giấy pH rồi so màu.',
  ptHoaHoc: ['CO₃²⁻ + H₂O ⇌ HCO₃⁻ + OH⁻  → môi trường base', 'Al³⁺ + H₂O ⇌ [Al(OH)]²⁺ + H⁺  → môi trường acid'],
  buoc: [
    { nhan: 'Ba dung dịch muối', giay: 3, hienTuong: 'Ba ống đựng dung dịch Na₂CO₃, AlCl₃ và FeCl₃. Cả ba đều là muối — nhìn bề ngoài không đoán được môi trường.' },
    { nhan: 'Chấm đũa lên giấy pH', giay: 5, hienTuong: 'Dùng đũa thuỷ tinh chấm từng dung dịch lên một mẩu giấy pH riêng.' },
    { nhan: 'So với bảng màu', giay: 7, hienTuong: 'Na₂CO₃ cho pH lớn hơn 7; AlCl₃ và FeCl₃ cho pH nhỏ hơn 7. Muối không phải lúc nào cũng trung tính: ion của nó phản ứng với nước.' },
  ],
  cam: { yaw: 0.26, pitch: 0.2 },
  phong: 1,
  tao: () => ({}),
  ve: ({ ctx, P, buoc, tienDo }: KhungVe<Record<string, never>>) => {
    const giayGoc = mau('--mau-giay-ph');
    const cham = buoc === 1 ? tienDo : buoc > 1 ? 1 : 0;
    const doi = buoc === 2 ? Math.min(1, tienDo * 1.3) : 0;

    veMatBan(ctx, P, -1.6);
    const ds: MucVe[] = MUOI.map(m => ({ z: 0, ve: () => {
      veOngNghiem(ctx, P, { x: m.x, z: 0, yDay: -1.1, yMieng: 0.7, r: 0.3, muc: -0.2, mauLong: mau(m.mauDd), dam: m.mauDd === '--mau-fecl3' ? 0.5 : 0.22 });
      veNhan(ctx, P, [m.x, -1.4, 0], m.ten, 13);
      /* Đũa chấm: hạ xuống dung dịch rồi đưa lên mẩu giấy. */
      if (cham > 0.02) {
        const cao = 1.15 - Math.sin(Math.min(1, cham) * Math.PI) * 0.9;
        veDua(ctx, P, [m.x - 0.55, cao + 0.85, 0], [m.x, cao, 0], mau(m.mauDd));
      }
      veGiay(ctx, P, [m.x, 1.55, 0], 0.4, 0.3, tronMau(giayGoc, mau(m.mauGiay), doi));
      if (doi > 0.7) veNhan(ctx, P, [m.x, 1.92, 0], m.pH, 12, mau('--chu-dam'));
    } }));
    veTheoChieuSau(ds);
  },
});
