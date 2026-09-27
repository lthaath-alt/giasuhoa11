import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { baoLoi, chieu, giamChuyenDong, mau, trongSuot, useCanh3D, V3, veChu, veQuaCau } from './canh3d';

/**
 * Cảnh 3D của thí nghiệm tính dẫn điện: cốc dung dịch, hai bản điện cực, dây
 * dẫn, khoá K, nguồn và bóng đèn. Ion dương/âm là quả cầu mang dấu điện tích.
 *
 * Khi đóng mạch, ion dương trôi về cực âm (bên trái), ion âm về cực dương (bên
 * phải) — chính dòng ion đó là dòng điện trong dung dịch. Tới bản cực thì ion
 * "được dẫn đi" và một ion mới xuất hiện ở phía đối diện: cách vẽ quy ước để
 * dòng chảy không cạn, KHÔNG phải mô tả phản ứng ở điện cực.
 * Chất điện li yếu: thỉnh thoảng một phân tử tách thành cặp ion và một cặp ion
 * ghép lại thành phân tử — số ion giữ gần như không đổi: cân bằng động ⇌.
 */

export interface ChatDen {
  id: string;
  nhom: 'manh' | 'yeu' | 'khong';
  sang: number;
}

type Loai = 'duong' | 'am' | 'phan-tu';
interface Hat { loai: Loai; p: V3; v: V3; goc: number }
interface Loe { p: V3; t: number }

const R_COC = 1.5, Y_DAY = -1.5, Y_MIENG = 0.9, Y_MAT = 0.45;
const X_CUC = 0.85, Z_CUC = 0.45, Y_CUC_DUOI = -1.2, Y_CUC_TREN = 1.9, Y_DAY_DAN = 2.7;
const R_HAT = 0.11;

const ngauNhien = (a: number, b: number) => a + Math.random() * (b - a);
function viTriTrongCoc(xMin = -1.3, xMax = 1.3): V3 {
  for (;;) {
    const x = ngauNhien(xMin, xMax), z = ngauNhien(-1.3, 1.3);
    if (x * x + z * z < 1.3 * 1.3 && Math.abs(Math.abs(x) - X_CUC) > 0.15) return [x, ngauNhien(-1.3, 0.3), z];
  }
}
function taoHat(loai: Loai, p = viTriTrongCoc()): Hat {
  return { loai, p, v: [ngauNhien(-0.2, 0.2), ngauNhien(-0.2, 0.2), ngauNhien(-0.2, 0.2)], goc: ngauNhien(0, 6.28) };
}
function taoDanHat(c: ChatDen): Hat[] {
  if (c.nhom === 'manh') return [...Array(15)].flatMap(() => [taoHat('duong'), taoHat('am')]);
  if (c.nhom === 'yeu') return [...[...Array(18)].map(() => taoHat('phan-tu')), taoHat('duong'), taoHat('am'), taoHat('duong'), taoHat('am')];
  return [...Array(20)].map(() => taoHat('phan-tu'));
}

export const DenDienLi3D: React.FC<{ chat: ChatDen; dong: boolean; toanManHinh: boolean }> = ({ chat, dong, toanManHinh }) => {
  const hat = useRef<Hat[]>(taoDanHat(chat));
  const loe = useRef<Loe[]>([]);
  const demGio = useRef(0);
  const dongRef = useRef(dong);
  dongRef.current = dong;
  const chatRef = useRef(chat);
  chatRef.current = chat;

  useEffect(() => { hat.current = taoDanHat(chat); loe.current = []; }, [chat.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const ref = useCanh3D((ctx, W, H, dt, cam) => {
    const S = Math.min(H / 4.5, W / 3.6);
    const P = (p: V3) => chieu(p, cam, W, H, S, 0.64);
    const m = {
      muc: mau('--chu-dam'), mo: mau('--chu-mo'), nuoc: mau('--xanh'),
      duong: mau('--tim-nen'), am: mau('--xanh-nen'), trang: mau('--chu-nguoc'), vang: mau('--vang-nen'), cuc: mau('--chu'),
    };
    const dongMach = dongRef.current;
    const c = chatRef.current;
    const tinh = giamChuyenDong();

    /* ── cập nhật hạt ── */
    if (!tinh) {
      for (const h of hat.current) {
        const nhanh = h.loai === 'phan-tu' ? 0.5 : 0.8;
        for (let i = 0; i < 3; i++) h.v[i] = h.v[i] * 0.95 + ngauNhien(-1, 1) * nhanh * dt * 3;
        if (dongMach && h.loai !== 'phan-tu') {
          const huong = h.loai === 'duong' ? -1 : 1;
          h.v[0] += huong * 0.9 * dt;
          h.v[2] += -h.p[2] * 0.6 * dt;          // gom về phía bản cực
        }
        const tran = 0.6;
        for (let i = 0; i < 3; i++) h.v[i] = Math.max(-tran, Math.min(tran, h.v[i]));
        for (let i = 0; i < 3; i++) h.p[i] += h.v[i] * dt;
        h.goc += dt * 1.5;
        const r = Math.hypot(h.p[0], h.p[2]);
        if (r > 1.35) { h.p[0] *= 1.35 / r; h.p[2] *= 1.35 / r; h.v[0] *= -0.5; h.v[2] *= -0.5; }
        if (h.p[1] < -1.35) { h.p[1] = -1.35; h.v[1] = Math.abs(h.v[1]); }
        if (h.p[1] > 0.3) { h.p[1] = 0.3; h.v[1] = -Math.abs(h.v[1]); }
        if (h.loai !== 'phan-tu' && Math.abs(h.p[2]) < Z_CUC) {
          const xDich = h.loai === 'duong' ? -X_CUC : X_CUC;
          if (dongMach && Math.abs(h.p[0] - xDich) < 0.08) {
            h.p = viTriTrongCoc(h.loai === 'duong' ? 0.2 : -1.3, h.loai === 'duong' ? 1.3 : -0.2);
            h.v = [0, 0, 0];
          } else if (Math.abs(Math.abs(h.p[0]) - X_CUC) < 0.07) {
            h.v[0] *= -1;
          }
        }
      }
      /* Cân bằng động của chất điện li yếu: một phân tử tách, một cặp ion ghép. */
      if (c.nhom === 'yeu') {
        demGio.current += dt;
        if (demGio.current > 1.4) {
          demGio.current = 0;
          const ds = hat.current;
          const pt = ds.filter(h => h.loai === 'phan-tu');
          const tach = pt[Math.floor(Math.random() * pt.length)];
          const duong = ds.filter(h => h.loai === 'duong');
          const d = duong[Math.floor(Math.random() * duong.length)];
          const a = ds.filter(h => h.loai === 'am').sort((u, w) => Math.hypot(u.p[0] - d.p[0], u.p[1] - d.p[1], u.p[2] - d.p[2]) - Math.hypot(w.p[0] - d.p[0], w.p[1] - d.p[1], w.p[2] - d.p[2]))[0];
          if (tach && d && a) {
            const giua: V3 = [(d.p[0] + a.p[0]) / 2, (d.p[1] + a.p[1]) / 2, (d.p[2] + a.p[2]) / 2];
            hat.current = ds.filter(h => h !== tach && h !== d && h !== a);
            hat.current.push(taoHat('phan-tu', giua));
            const u: V3 = [ngauNhien(-1, 1), ngauNhien(-1, 1), ngauNhien(-1, 1)];
            hat.current.push({ ...taoHat('duong', [tach.p[0], tach.p[1], tach.p[2]]), v: [u[0] * 0.4, u[1] * 0.4, u[2] * 0.4] });
            hat.current.push({ ...taoHat('am', [tach.p[0], tach.p[1], tach.p[2]]), v: [-u[0] * 0.4, -u[1] * 0.4, -u[2] * 0.4] });
            loe.current.push({ p: tach.p, t: 1 }, { p: giua, t: 1 });
          }
        }
      }
      for (const l of loe.current) l.t -= dt * 1.2;
      loe.current = loe.current.filter(l => l.t > 0);
    }

    /* ── cốc: nền dung dịch ── */
    const vong = (y: number, r: number) => Array.from({ length: 40 }, (_, i) => P([Math.cos(i / 40 * 6.283) * r, y, Math.sin(i / 40 * 6.283) * r]));
    const tomau = (ds: { x: number; y: number }[], fill: string) => {
      ctx.beginPath(); ds.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill();
    };
    tomau(baoLoi([...vong(Y_DAY, R_COC), ...vong(Y_MAT, R_COC)]), trongSuot(m.nuoc, 0.12));
    tomau(vong(Y_MAT, R_COC), trongSuot(m.nuoc, 0.10));

    /* ── dây dẫn, khoá K, nguồn, bóng đèn ── */
    const net = (a: V3, b: V3, w = 2.2, c2 = m.muc) => {
      const A = P(a), B = P(b); ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y);
      ctx.strokeStyle = c2; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke();
    };
    const D = Y_DAY_DAN;
    net([-X_CUC, Y_CUC_TREN, 0], [-X_CUC, D, 0]);
    net([-X_CUC, D, 0], [-0.3, D, 0]);
    net([0.3, D, 0], [0.5, D, 0]);
    net([0.5, D, 0], dongMach ? [0.82, D, 0] : [0.78, D + 0.3, 0], 2.6);   // khoá K
    net([X_CUC, D, 0], [X_CUC, 2.46, 0]);
    net([X_CUC - 0.12, 2.46, 0], [X_CUC + 0.12, 2.46, 0], 4);             // cực âm (ngắn, dày)
    net([X_CUC - 0.24, 2.36, 0], [X_CUC + 0.24, 2.36, 0], 2);             // cực dương (dài)
    net([X_CUC, 2.36, 0], [X_CUC, Y_CUC_TREN, 0]);
    const k = P([0.5, D + 0.18, 0]); veChu(ctx, 'K', k.x, k.y, 12, m.muc);
    const ng = P([X_CUC + 0.8, 2.41, 0]); veChu(ctx, 'nguồn', ng.x, ng.y, 11, m.cuc);

    const sang = dongMach ? c.sang : 0;
    const bd = P([0, D, 0]), rb = 0.3 * bd.s;
    if (sang > 0) {
      const g = ctx.createRadialGradient(bd.x, bd.y, rb * 0.5, bd.x, bd.y, rb * (1.4 + 2.2 * sang));
      g.addColorStop(0, trongSuot(m.vang, 0.75 * sang)); g.addColorStop(1, trongSuot(m.vang, 0));
      ctx.beginPath(); ctx.arc(bd.x, bd.y, rb * (1.4 + 2.2 * sang), 0, 6.283); ctx.fillStyle = g; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(bd.x, bd.y, rb, 0, 6.283);
    ctx.fillStyle = trongSuot(m.vang, 0.15 + 0.85 * sang); ctx.fill();
    ctx.strokeStyle = m.muc; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bd.x - rb * 0.45, bd.y + rb * 0.3); ctx.lineTo(bd.x - rb * 0.2, bd.y - rb * 0.3);
    ctx.lineTo(bd.x, bd.y + rb * 0.2); ctx.lineTo(bd.x + rb * 0.2, bd.y - rb * 0.3); ctx.lineTo(bd.x + rb * 0.45, bd.y + rb * 0.3);
    ctx.strokeStyle = m.muc; ctx.lineWidth = 1.4; ctx.stroke();
    /* Nhãn đặt DƯỚI bóng, giữa hai dây: phía trên thì sát mép canvas (dấu tiếng
       Việt bị cắt), bên trái thì đè lên dây dẫn. */
    veChu(ctx, sang >= 0.9 ? 'SÁNG RÕ' : sang > 0 ? 'SÁNG MỜ' : 'KHÔNG SÁNG', bd.x, bd.y + rb + 16, 13, m.muc);

    /* ── điện cực + hạt, vẽ từ xa tới gần ── */
    type Ve = { z: number; f: () => void };
    const dsVe: Ve[] = [];
    for (const xc of [-X_CUC, X_CUC]) {
      const goc: V3[] = [[xc, Y_CUC_DUOI, -Z_CUC], [xc, Y_CUC_TREN, -Z_CUC], [xc, Y_CUC_TREN, Z_CUC], [xc, Y_CUC_DUOI, Z_CUC]];
      const q = goc.map(P);
      dsVe.push({ z: P([xc, 0, 0]).z, f: () => {
        ctx.beginPath(); q.forEach((a, i) => (i ? ctx.lineTo(a.x, a.y) : ctx.moveTo(a.x, a.y))); ctx.closePath();
        ctx.fillStyle = trongSuot(m.mo, 0.85); ctx.fill(); ctx.strokeStyle = m.muc; ctx.lineWidth = 1.2; ctx.stroke();
        const n = P([xc, Y_CUC_TREN + 0.25, 0]);
        veChu(ctx, xc < 0 ? '−' : '+', n.x, n.y, 18, xc < 0 ? m.am : m.duong);
      } });
    }
    for (const h of hat.current) {
      if (h.loai === 'phan-tu') {
        const dx = Math.cos(h.goc) * 0.09, dz = Math.sin(h.goc) * 0.09;
        const a = P([h.p[0] - dx, h.p[1], h.p[2] - dz]), b = P([h.p[0] + dx, h.p[1], h.p[2] + dz]);
        dsVe.push({ z: (a.z + b.z) / 2, f: () => {
          veQuaCau(ctx, a.x, a.y, R_HAT * 0.8 * a.s, m.mo);
          veQuaCau(ctx, b.x, b.y, R_HAT * 0.8 * b.s, m.mo);
        } });
      } else {
        const q = P(h.p), r = R_HAT * q.s;
        dsVe.push({ z: q.z, f: () => {
          veQuaCau(ctx, q.x, q.y, r, h.loai === 'duong' ? m.duong : m.am);
          veChu(ctx, h.loai === 'duong' ? '+' : '−', q.x, q.y + 0.5, r * 1.3, m.trang);
        } });
      }
    }
    for (const l of loe.current) {
      const q = P(l.p);
      dsVe.push({ z: q.z, f: () => {
        ctx.beginPath(); ctx.arc(q.x, q.y, (1 - l.t) * 0.5 * q.s + 4, 0, 6.283);
        ctx.strokeStyle = trongSuot(m.vang, l.t); ctx.lineWidth = 2; ctx.stroke();
      } });
    }
    dsVe.sort((a, b) => a.z - b.z).forEach(o => o.f());

    /* ── thành cốc (vẽ sau cùng, mảnh, để nhìn xuyên được) ── */
    const vien = baoLoi([...vong(Y_DAY, R_COC), ...vong(Y_MIENG, R_COC)]);
    ctx.beginPath(); vien.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath();
    ctx.strokeStyle = m.muc; ctx.lineWidth = 2; ctx.stroke();
    const mieng = vong(Y_MIENG, R_COC);
    ctx.beginPath(); mieng.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath();
    ctx.strokeStyle = trongSuot(m.muc, 0.7); ctx.lineWidth = 1.5; ctx.stroke();
    const mat = vong(Y_MAT, R_COC);
    ctx.beginPath(); mat.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath();
    ctx.setLineDash([4, 3]); ctx.strokeStyle = trongSuot(m.nuoc, 0.8); ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
  }, { yaw: 0.35, pitch: 0.22 });

  return (
    <Box
      component="canvas"
      ref={ref}
      role="img"
      aria-label={`Cảnh 3D: cốc dung dịch, hai điện cực và bóng đèn ${dong ? (chat.sang >= 0.9 ? 'sáng rõ' : chat.sang > 0 ? 'sáng mờ' : 'không sáng') : 'tắt vì khoá K mở'}. Kéo để xoay.`}
      sx={{
        width: '100%', height: toanManHinh ? '62vh' : 360, display: 'block', touchAction: 'none', cursor: 'grab',
        bgcolor: 'var(--nen-rat-nhat)', border: '1px solid var(--vien)',
        '&:active': { cursor: 'grabbing' },
      }}
    />
  );
};
