/**
 * BÀI 17 — ARENE (HYDROCARBON THƠM).
 *
 * Hai thí nghiệm đầu SGK chỉ MÔ TẢ để học sinh đọc và trả lời, không phải bài
 * tự làm — cảnh dựng đúng bộ dụng cụ trong sách để hình dung, kèm nhãn nhắc.
 * Thí nghiệm thứ ba mới là bài làm được: so benzene với toluene.
 */
import {
  chayHat, Hat, hatMoi, mau, mauKhi, MucVe, nhienNgau, noiSuy, to, trongSuot, tronMau, V3,
  veBinhCau, veBinhTamGiac, veCoc, veHatMem, veHatRan, veLopLong, veMatBan, veNhan,
  veOngNghiem, veOngSinhHan, vePheuChiet, veTheoChieuSau, vienXoay,
} from '../dungCu3d';
import { dinhNghia, KhungVe } from '../kichBan';

/* ── nitro hoá benzene ───────────────────────────────────────────────────── */

interface StNitro { hoi: Hat[]; dem: number }

export const b17NitroHoaBenzene = dinhNghia<StNitro>({
  id: 'b17-nitro-hoa-benzene',
  baiId: 'bai-17',
  ten: 'Phản ứng nitro hoá benzene',
  nhan: 'Bài 17 · SGK tr. 105',
  moTaAria: 'Cảnh 3D: bình cầu có ống sinh hàn hồi lưu đun cách thuỷ, sau đó tách lớp nitrobenzene vàng nhạt trong phễu chiết.',
  ptHoaHoc: ['C₆H₆ + HNO₃(đặc) → C₆H₅NO₂ + H₂O   (H₂SO₄ đặc, 80 °C)'],
  buoc: [
    { nhan: 'Trộn HNO₃ đặc với H₂SO₄ đặc', giay: 4, hienTuong: 'SGK mô tả: trộn hai acid đặc đã làm lạnh — hỗn hợp toả nhiệt mạnh nên phải làm lạnh trước.' },
    { nhan: 'Thêm benzene, lắp sinh hàn hồi lưu', giay: 4, hienTuong: 'Thêm benzene rồi lắp ống sinh hàn thẳng đứng: hơi benzene bay lên gặp ống lạnh sẽ ngưng lại và rơi về bình, không thoát ra ngoài.' },
    { nhan: 'Đun cách thuỷ 80 °C', giay: 6, hienTuong: 'Đun cách thuỷ khoảng 80 °C trong thời gian dài. Không đun lửa trực tiếp vì benzene rất dễ cháy.' },
    { nhan: 'Tách lớp trong phễu chiết', giay: 6, hienTuong: 'Đổ hỗn hợp vào phễu chiết: chất lỏng tách hai lớp, lớp nitrobenzene là chất lỏng màu vàng nhạt, nặng hơn nên nằm dưới.' },
  ],
  cam: { yaw: 0.2, pitch: 0.18 },
  phong: 0.88,
  tao: () => ({ hoi: [], dem: 0 }),
  ve: ({ ctx, P, buoc, tienDo, dt, tt }: KhungVe<StNitro>) => {
    const acid = mau('--mau-dd-trong'), nitro = mau('--mau-nitrobenzene'), nuoc = mau('--mau-dd-trong');
    const dun = buoc === 2;

    if (dt > 0) {
      tt.dem += dt;
      if (dun && tt.dem > 0.25) {
        tt.dem = 0;
        tt.hoi.push(hatMoi([nhienNgau(-0.5, 0.5), -0.35, nhienNgau(-0.25, 0.25)], [0, nhienNgau(0.3, 0.5), 0], 2, 0.14));
      }
      tt.hoi = chayHat(tt.hoi, dt, [0, 0.05, 0], 0.07);
    }

    veMatBan(ctx, P, -1.95);

    if (buoc <= 2) {
      /* Nồi cách thuỷ: cốc nước lớn, bình cầu ngâm trong đó. */
      veCoc(ctx, P, { x: 0, z: 0, yDay: -1.85, yMieng: -0.45, r: 1.05, muc: -0.7, mauLong: nuoc, dam: 0.25 }, () => {
        veBinhCau(ctx, P, {
          x: 0, z: 0, yTam: -0.95, r: 0.55, muc: -1.1, mauLong: tronMau(acid, nitro, buoc === 2 ? tienDo * 0.5 : 0),
          dam: 0.35, yCo: 0.05, rCo: 0.16,
        });
      });
      if (buoc >= 1) {
        veOngSinhHan(ctx, P, [0, 0.05, 0], [0, 1.75, 0]);
        veNhan(ctx, P, [1.05, 1.15, 0], 'sinh hàn hồi lưu', 12);
      }
      veNhan(ctx, P, [0, -2.2, 0], dun ? 'nồi cách thuỷ 80 °C' : 'nồi cách thuỷ', 12);
      veNhan(ctx, P, [-1.5, -1.0, 0], buoc === 0 ? 'HNO₃ + H₂SO₄' : 'thêm benzene', 12);
      veHatMem(ctx, P, tt.hoi, mauKhi('--mau-khoi', 0.4), 0.3);
    } else {
      const k = Math.min(1, tienDo * 1.3);
      const yDay = -0.6, cao = 2.0, r = 0.6;
      const yPhinh = yDay + cao * 0.38;
      const ban = (y: number) => (y <= yPhinh
        ? r * Math.sqrt(Math.max(0, (y - yDay) / (yPhinh - yDay)))
        : r * (1 - 0.72 * (y - yPhinh) / (yDay + cao - yPhinh)));
      vePheuChiet(ctx, P, { x: 0, z: 0, yDay, cao, r }, () => {
        const yRanh = noiSuy(yDay + 1.0, yDay + 0.62, k);
        to(ctx, vienXoay(P, 0, 0, yDay + 0.08, yRanh, ban, 8), tronMau(nitro, acid, 1 - k));
        to(ctx, vienXoay(P, 0, 0, yRanh, yDay + 1.25, ban, 8), tronMau(acid, nitro, 0.1));
      });
      veNhan(ctx, P, [1.35, yDay + 1.1, 0], 'lớp acid', 12);
      veNhan(ctx, P, [1.35, yDay + 0.45, 0], 'nitrobenzene vàng nhạt', 12);
    }
  },
});

/* ── cộng chlorine vào benzene ───────────────────────────────────────────── */

export const b17CongChlorine = dinhNghia<Record<string, never>>({
  id: 'b17-cong-chlorine',
  baiId: 'bai-17',
  ten: 'Phản ứng cộng chlorine vào benzene',
  nhan: 'Bài 17 · SGK tr. 106',
  moTaAria: 'Cảnh 3D: bình nón đậy kín chứa benzene và khí chlorine, đưa ra ánh nắng cho bột trắng bám vào thành bình.',
  ptHoaHoc: ['C₆H₆ + 3Cl₂ → C₆H₆Cl₆   (ánh sáng)'],
  buoc: [
    { nhan: 'Dẫn Cl₂ vào bình benzene', giay: 4, hienTuong: 'SGK mô tả: dẫn một ít khí chlorine màu vàng lục vào bình chứa benzene rồi đậy kín.' },
    { nhan: 'Đưa bình ra ánh nắng', giay: 4, hienTuong: 'Đưa bình ra chỗ có nắng. Ánh sáng chính là điều kiện của phản ứng này.' },
    { nhan: 'Bột trắng bám thành bình', giay: 7, hienTuong: 'Màu vàng lục của chlorine nhạt dần, xuất hiện khói trắng rồi lớp bột trắng bám vào thành bình — đó là C₆H₆Cl₆. Ở đây benzene CỘNG chứ không thế, vì có ánh sáng và chlorine dư.' },
  ],
  cam: { yaw: 0.24, pitch: 0.2 },
  phong: 1.05,
  tao: () => ({}),
  ve: ({ ctx, P, buoc, tienDo }: KhungVe<Record<string, never>>) => {
    const cl2 = mau('--mau-cl2'), benzen = mau('--mau-huu-co'), bot = mau('--mau-ket-tua');
    const nang = buoc >= 1;
    const pu = buoc === 2 ? Math.min(1, tienDo * 1.2) : 0;

    veMatBan(ctx, P, -1.7);
    veBinhTamGiac(ctx, P, {
      x: 0, z: 0, yDay: -1.55, cao: 2.0, rDay: 0.85, rCo: 0.26,
      muc: -1.15, mauLong: benzen, dam: 0.35,
    }, () => {
      /* Khí chlorine đầy phần trên bình, nhạt dần khi phản ứng. */
      const ban = (y: number) => (y <= -1.55 + 2.0 * 0.62 ? 0.85 + (0.26 - 0.85) * ((y + 1.55) / (2.0 * 0.62)) : 0.26);
      to(ctx, vienXoay(P, 0, 0, -1.15, 0.3, ban, 8), trongSuot(cl2, 0.32 * (1 - pu * 0.8)));
      /* Bột trắng bám mặt trong thành bình. */
      if (pu > 0.15) {
        const hat: Hat[] = [];
        for (let i = 0; i < 26; i++) {
          const g = i * 2.399963, y = -1.4 + (i % 7) * 0.22;
          const r = (y <= -0.31 ? 0.85 + (0.26 - 0.85) * ((y + 1.55) / 1.24) : 0.26) * 0.93;
          hat.push(hatMoi([Math.cos(g) * r, y, Math.sin(g) * r], [0, 0, 0], 9, 0.05));
        }
        veHatRan(ctx, P, hat, bot, pu);
      }
    });
    /* Nắp đậy kín + tia nắng. */
    veNhan(ctx, P, [0, 0.72, 0], 'đậy kín', 12, mau('--chu'));
    if (nang) {
      for (let i = 0; i < 4; i++) {
        const y = 1.15 - i * 0.22;
        const a: V3 = [-2.3, y + 0.5, 0], b: V3 = [-1.05, y, 0];
        const A = P(a), B = P(b);
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y);
        ctx.strokeStyle = mau('--mau-lua-trong'); ctx.lineWidth = 2; ctx.stroke();
      }
      veNhan(ctx, P, [-2.1, 1.85, 0], 'ánh nắng', 12, mau('--chu-dam'));
    }
    veNhan(ctx, P, [1.5, -1.25, 0], 'benzene', 12);
    if (pu > 0.5) veNhan(ctx, P, [1.6, -0.35, 0], 'bột trắng C₆H₆Cl₆', 12, mau('--chu-dam'));
  },
});

/* ── oxi hoá toluene và benzene bằng KMnO₄ ───────────────────────────────── */

export const b17TolueneKmno4 = dinhNghia<Record<string, never>>({
  id: 'b17-toluene-kmno4',
  baiId: 'bai-17',
  ten: 'Oxi hoá toluene và benzene bằng KMnO₄',
  nhan: 'Bài 17 · SGK tr. 107',
  moTaAria: 'Cảnh 3D: hai ống KMnO₄ ngâm nước nóng, ống thêm benzene giữ màu tím, ống thêm toluene mất màu.',
  ptHoaHoc: ['C₆H₅CH₃ + 2KMnO₄ → C₆H₅COOK + 2MnO₂↓ + KOH + H₂O  (t°)', 'C₆H₆ + KMnO₄: không phản ứng'],
  buoc: [
    { nhan: 'Hai ống KMnO₄ + H₂SO₄ loãng', giay: 3, hienTuong: 'Hai ống nghiệm giống hệt nhau, mỗi ống 1 mL KMnO₄ và 1 mL H₂SO₄ loãng, cùng màu tím.' },
    { nhan: 'Thêm benzene và toluene', giay: 4, hienTuong: 'Ống 1 thêm benzene, ống 2 thêm toluene. Cả hai đều không tan, nổi thành lớp trên.' },
    { nhan: 'Ngâm nồi nước nóng', giay: 5, hienTuong: 'Lắc rồi ngâm cả hai ống vào nồi nước nóng.' },
    { nhan: 'So màu hai ống', giay: 7, hienTuong: 'Ống benzene vẫn tím nguyên; ống toluene nhạt màu rồi mất màu, có kết tủa nâu đen MnO₂. Vòng benzene rất bền, nhưng nhánh –CH₃ gắn vào vòng thì bị oxi hoá được.' },
  ],
  cam: { yaw: 0.26, pitch: 0.2 },
  phong: 0.95,
  tao: () => ({}),
  ve: ({ ctx, P, buoc, tienDo }: KhungVe<Record<string, never>>) => {
    const tim = mau('--mau-kmno4'), huuCo = mau('--mau-huu-co'), trong = mau('--mau-dd-trong');
    const them = buoc >= 1;
    const ngam = buoc === 2 ? tienDo : buoc > 2 ? 1 : 0;
    const mat = buoc === 3 ? Math.min(1, tienDo * 1.2) : 0;
    const dy = noiSuy(0, -0.28, ngam);

    veMatBan(ctx, P, -1.95);
    if (ngam > 0.04) {
      veCoc(ctx, P, { x: 0, z: 0, yDay: -1.7, yMieng: -0.4, r: 1.15, muc: noiSuy(-1.7, -0.62, ngam), mauLong: trong, dam: 0.25 }, veHaiOng);
      veNhan(ctx, P, [0, -2.0, 0], 'nồi nước nóng', 12);
    } else {
      veHaiOng();
    }

    function veHaiOng() {
      const ds: MucVe[] = [-0.62, 0.62].map((x, i) => ({ z: 0, ve: () => {
        const matOng = i === 1 ? mat : 0;
        veOngNghiem(ctx, P, {
          x, z: 0, yDay: -1.15 + dy, yMieng: 0.75 + dy, r: 0.3, muc: -0.35 + dy,
          mauLong: tronMau(tim, trong, matOng), dam: noiSuy(0.62, 0.2, matOng),
        }, () => {
          if (them) veLopLong(ctx, P, x, 0, 0.3, -0.35 + dy, -0.05 + dy, huuCo, 0.3);
          if (matOng > 0.3) {
            const t: Hat[] = [];
            for (let k = 0; k < 9; k++) {
              const g = k * 2.4, r = 0.17 * Math.sqrt((k + 0.5) / 9);
              t.push(hatMoi([x + Math.cos(g) * r, -1.05 + dy + (k % 2) * 0.05, Math.sin(g) * r], [0, 0, 0], 9, 0.05));
            }
            veHatRan(ctx, P, t, mau('--mau-than'), matOng);
          }
        });
        veNhan(ctx, P, [x, 1.1 + dy, 0], i === 0 ? 'benzene' : 'toluene', 12);
      } }));
      veTheoChieuSau(ds);
    }

    if (mat > 0.6) {
      veNhan(ctx, P, [-0.62, 1.42 + dy, 0], 'tím không đổi', 11, mau('--chu-dam'));
      veNhan(ctx, P, [0.62, 1.42 + dy, 0], 'mất màu + MnO₂ ↓', 11, mau('--chu-dam'));
    }
  },
});
