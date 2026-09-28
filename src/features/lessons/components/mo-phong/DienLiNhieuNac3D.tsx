import React, { useEffect, useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { AcidNhieuNac, phanBo, giaiH } from './tinhHoaHoc';
import { chieu, giamChuyenDong, mau, trongSuot, useCanh3D, V3, veChu, veQuaCau } from './canh3d';

/**
 * Cảnh 3D QUÁ TRÌNH điện li nhiều nấc trên một mẫu 48 phân tử acid.
 *
 * Diễn ra theo đúng thứ tự: lúc đầu mọi phân tử còn nguyên → nấc 1 (phân tử tách
 * một H⁺) → nấc 2 → nấc 3… Số phân tử ở mỗi dạng lấy từ phép tính cân bằng thật
 * (tinhHoaHoc.ts) làm tròn trên 48 phân tử. Hết các nấc thì chuyển sang cân bằng
 * động: có phân tử tách H⁺, có ion nhận lại H⁺, tổng số mỗi dạng giữ nguyên —
 * trừ nấc điện li hoàn toàn (H₂SO₄ nấc 1: mũi tên một chiều) thì không ghép lại.
 * Kéo nồng độ: số mỗi dạng dịch dần tới phân bố mới, không chạy lại từ đầu.
 *
 * Nấc quá yếu (vd H₂CO₃ ~0,4 %) làm tròn ra 0 phân tử — dòng chú thích nói rõ cần
 * bao nhiêu phân tử mới thấy một phân tử tách H⁺, thay vì vẽ sai tỉ lệ.
 */

const N = 48;
const HOP: V3 = [2.1, 1.35, 1.5];           // nửa kích thước hộp dung dịch
const THOI_GIAN_NAC = 2.6;                   // giây cho mỗi nấc

interface PhanTu { p: V3; v: V3; j: number; goc: number; dich: number }
interface HCong { p: V3; v: V3 }
interface Loe { p: V3; t: number }

const ngauNhien = (a: number, b: number) => a + Math.random() * (b - a);
const viTri = (): V3 => [ngauNhien(-HOP[0] * 0.9, HOP[0] * 0.9), ngauNhien(-HOP[1] * 0.9, HOP[1] * 0.9), ngauNhien(-HOP[2] * 0.9, HOP[2] * 0.9)];
const kc = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Số phân tử mục tiêu ở mỗi dạng (0, 1, 2… H⁺ đã tách) — làm tròn theo phần dư lớn nhất. */
export function mucTieu(acid: AcidNhieuNac, c: number): number[] {
  const al = phanBo(acid, giaiH(acid, c));
  const tho = al.map(x => x * N);
  const n = tho.map(Math.floor);
  let du = N - n.reduce((s, x) => s + x, 0);
  const thuTu = tho.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0]);
  for (let k = 0; du > 0; k++, du--) n[thuTu[k % thuTu.length][1]]++;
  return n;
}

/** Điện tích của ion theo số H⁺ đã tách. */
const DIEN_TICH = ['', '−', '2−', '3−'];

export const DienLiNhieuNac3D: React.FC<{ acid: AcidNhieuNac; c: number; toanManHinh: boolean }> = ({ acid, c, toanManHinh }) => {
  const soNac = acid.ka.length;
  const pt = useRef<PhanTu[]>([]);
  const hc = useRef<HCong[]>([]);
  const loe = useRef<Loe[]>([]);
  const muc = useRef<number[]>(mucTieu(acid, c));
  /* giai đoạn: 0 = chưa điện li; k = đang chạy nấc k; soNac + 1 = cân bằng động */
  const gd = useRef({ buoc: 0, t: 0, nhip: 0 });
  const chuThich = useRef<HTMLSpanElement>(null);
  const demSo = useRef<HTMLSpanElement>(null);
  const acidRef = useRef(acid);
  acidRef.current = acid;

  const batDau = () => {
    pt.current = Array.from({ length: N }, () => ({ p: viTri(), v: [0, 0, 0] as V3, j: 0, goc: ngauNhien(0, 6.28), dich: ngauNhien(0, 1) }));
    hc.current = [];
    loe.current = [];
    gd.current = { buoc: 1, t: 0, nhip: 0 };
    if (giamChuyenDong()) {
      /* Giảm chuyển động: nhảy thẳng tới trạng thái cân bằng, không diễn hoạt. */
      const n = muc.current;
      let i = 0;
      n.forEach((so, j) => { for (let k = 0; k < so; k++) pt.current[i++].j = j; });
      pt.current.forEach(u => { for (let k = 0; k < u.j; k++) hc.current.push({ p: [u.p[0] + ngauNhien(-0.5, 0.5), u.p[1] + ngauNhien(-0.5, 0.5), u.p[2] + ngauNhien(-0.5, 0.5)], v: [0, 0, 0] }); });
      gd.current.buoc = soNac + 1;
    }
  };

  useEffect(() => { muc.current = mucTieu(acid, c); batDau(); }, [acid.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { muc.current = mucTieu(acid, c); }, [acid, c]);

  const tachH = (u: PhanTu) => {
    u.j++;
    const d: V3 = [ngauNhien(-1, 1), ngauNhien(-1, 1), ngauNhien(-1, 1)];
    const l = Math.hypot(...d) || 1;
    hc.current.push({ p: [u.p[0] + d[0] / l * 0.3, u.p[1] + d[1] / l * 0.3, u.p[2] + d[2] / l * 0.3], v: [d[0] / l * 1.2, d[1] / l * 1.2, d[2] / l * 1.2] });
    loe.current.push({ p: [...u.p] as V3, t: 1 });
  };
  const ghepH = (u: PhanTu) => {
    if (!hc.current.length) return false;
    let tot = 0;
    hc.current.forEach((h, i) => { if (kc(h.p, u.p) < kc(hc.current[tot].p, u.p)) tot = i; });
    hc.current.splice(tot, 1);
    u.j--;
    loe.current.push({ p: [...u.p] as V3, t: 1 });
    return true;
  };

  const ref = useCanh3D((ctx, W, H, dt, cam) => {
    const a = acidRef.current;
    const S = Math.min(W / 5.6, H / 3.9);
    const P = (p: V3) => chieu(p, cam, W, H, S, 0.5);
    const mm = {
      muc: mau('--chu-dam'), vien: mau('--chu-mo'), h: mau('--chu-nguoc'), hCong: mau('--tim-nen'), vang: mau('--vang-nen'),
      tam: a.id === 'h2co3' ? mau('--chu-mo') : a.id === 'h3po4' ? mau('--luc-tham-nen') : mau('--vang-nen'),
    };
    const tinh = giamChuyenDong();
    const g = gd.current;
    const n = muc.current;

    /* ── diễn biến ── */
    if (!tinh) {
      if (g.buoc >= 1 && g.buoc <= soNac) {
        g.t += dt;
        const k = g.buoc;                                 // nấc k: dạng k-1 → dạng k
        const canTach = n.slice(k).reduce((s, x) => s + x, 0);   // số phân tử phải đi qua nấc k
        const daTach = pt.current.filter(u => u.j >= k).length;
        const nenDat = Math.round(canTach * Math.min(1, g.t / THOI_GIAN_NAC));
        const ung = pt.current.filter(u => u.j === k - 1).sort((x, y) => x.dich - y.dich);
        for (let i = daTach; i < nenDat && ung.length; i++) tachH(ung.shift()!);
        if (g.t >= THOI_GIAN_NAC + 0.8) { g.buoc++; g.t = 0; }
      } else if (g.buoc > soNac) {
        g.nhip += dt;
        const hienCo = Array.from({ length: soNac + 1 }, (_, j) => pt.current.filter(u => u.j === j).length);
        const lech = hienCo.findIndex((x, j) => x !== n[j]);
        /* Đang lệch (vừa kéo nồng độ) thì dịch nhanh, 0,15 s một phân tử; đã
           đúng phân bố thì nhịp cân bằng động chậm, 0,9 s, cho dễ nhìn. */
        if (g.nhip > (lech >= 0 ? 0.15 : 0.9)) {
          g.nhip = 0;
          if (lech >= 0) {
            const thieuCao = n.slice(lech + 1).reduce((s, x) => s + x, 0) > hienCo.slice(lech + 1).reduce((s, x) => s + x, 0);
            if (thieuCao) { const u = pt.current.find(x => x.j === lech); if (u) tachH(u); }
            else { const u = pt.current.find(x => x.j === lech + 1) ?? pt.current.find(x => x.j > lech); if (u && !(a.nac1HoanToan && u.j === 1)) ghepH(u); }
          } else {
            /* Cân bằng động: ở một nấc chưa hoàn toàn, một phân tử tách và một ion ghép. */
            const nac = Array.from({ length: soNac }, (_, i) => i + 1)
              .filter(k => !(a.nac1HoanToan && k === 1) && hienCo[k - 1] > 0 && hienCo[k] > 0);
            if (nac.length) {
              const k = nac[Math.floor(Math.random() * nac.length)];
              const tach = pt.current.filter(u => u.j === k - 1);
              const ghep = pt.current.filter(u => u.j === k);
              const u1 = tach[Math.floor(Math.random() * tach.length)], u2 = ghep[Math.floor(Math.random() * ghep.length)];
              tachH(u1); ghepH(u2);
            }
          }
        }
      }
      for (const u of pt.current) {
        for (let i = 0; i < 3; i++) { u.v[i] = u.v[i] * 0.94 + ngauNhien(-1, 1) * dt * 0.9; u.p[i] += u.v[i] * dt; }
        u.goc += dt * 0.8;
      }
      for (const h of hc.current) {
        for (let i = 0; i < 3; i++) { h.v[i] = h.v[i] * 0.96 + ngauNhien(-1, 1) * dt * 2.4; h.p[i] += h.v[i] * dt; }
      }
      for (const o of [...pt.current, ...hc.current]) {
        for (let i = 0; i < 3; i++) {
          if (Math.abs(o.p[i]) > HOP[i] * 0.95) { o.p[i] = Math.sign(o.p[i]) * HOP[i] * 0.95; o.v[i] *= -1; }
        }
      }
      for (const l of loe.current) l.t -= dt * 1.4;
      loe.current = loe.current.filter(l => l.t > 0);
    }

    /* ── hộp dung dịch ── */
    const dinh: V3[] = [];
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) dinh.push([x * HOP[0], y * HOP[1], z * HOP[2]]);
    const q = dinh.map(P);
    ctx.strokeStyle = trongSuot(mm.vien, 0.55); ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
      const khac = [0, 1, 2].filter(t => dinh[i][t] !== dinh[j][t]).length;
      if (khac === 1) { ctx.beginPath(); ctx.moveTo(q[i].x, q[i].y); ctx.lineTo(q[j].x, q[j].y); ctx.stroke(); }
    }

    /* ── phân tử, H⁺, loé: vẽ từ xa tới gần ── */
    type Ve = { z: number; f: () => void };
    const ds: Ve[] = [];
    const soH = a.ka.length;
    for (const u of pt.current) {
      const tam = P(u.p);
      const conH = soH - u.j;
      const tay = Array.from({ length: conH }, (_, i) => {
        const g2 = u.goc + (i * 6.283) / Math.max(conH, 1);
        return P([u.p[0] + Math.cos(g2) * 0.26, u.p[1] + (i % 2 ? 0.14 : -0.14), u.p[2] + Math.sin(g2) * 0.26]);
      });
      ds.push({ z: tam.z, f: () => {
        for (const t of tay) if (t.z < tam.z) veQuaCau(ctx, t.x, t.y, 0.09 * t.s, mm.h, 1, mm.vien);
        veQuaCau(ctx, tam.x, tam.y, 0.2 * tam.s, mm.tam);
        for (const t of tay) if (t.z >= tam.z) veQuaCau(ctx, t.x, t.y, 0.09 * t.s, mm.h, 1, mm.vien);
        if (u.j > 0) veChu(ctx, DIEN_TICH[u.j], tam.x + 0.26 * tam.s, tam.y - 0.24 * tam.s, Math.max(10, 0.2 * tam.s), mm.muc);
      } });
    }
    for (const h of hc.current) {
      const t = P(h.p);
      ds.push({ z: t.z, f: () => { veQuaCau(ctx, t.x, t.y, 0.1 * t.s, mm.hCong); veChu(ctx, '+', t.x, t.y + 0.5, 0.13 * t.s, mm.h); } });
    }
    for (const l of loe.current) {
      const t = P(l.p);
      ds.push({ z: t.z + 0.01, f: () => { ctx.beginPath(); ctx.arc(t.x, t.y, (1.1 - l.t) * 0.45 * t.s + 3, 0, 6.283); ctx.strokeStyle = trongSuot(mm.vang, l.t); ctx.lineWidth = 2; ctx.stroke(); } });
    }
    ds.sort((x, y) => x.z - y.z).forEach(o => o.f());

    /* ── chú thích (ghi thẳng vào DOM, không dựng lại React mỗi khung) ── */
    const dem = Array.from({ length: soNac + 1 }, (_, j) => pt.current.filter(u => u.j === j).length);
    if (demSo.current) {
      demSo.current.textContent = `Mẫu ${N} phân tử: ` + a.tieuPhan.map((tp, j) => `${tp} ${dem[j]}`).join(' · ') + ` · H⁺ tự do ${hc.current.length}`;
    }
    if (chuThich.current) {
      const b = g.buoc;
      chuThich.current.textContent = b >= 1 && b <= soNac
        ? `Nấc ${b} đang diễn ra: ${a.tieuPhan[b - 1]} ${a.nac1HoanToan && b === 1 ? '→' : '⇌'} H⁺ + ${a.tieuPhan[b]}`
        : 'Cân bằng động: phân tử vẫn tách H⁺ và ion vẫn nhận lại H⁺, nhưng số mỗi dạng giữ nguyên'
          + (a.nac1HoanToan ? ' (riêng nấc 1 của H₂SO₄ điện li hoàn toàn, không ghép lại).' : '.');
    }
  }, { yaw: 0.5, pitch: 0.3 });

  /* Nấc nào quá yếu để thấy trên 48 phân tử thì nói rõ cần bao nhiêu phân tử. */
  const al = phanBo(acid, giaiH(acid, c));
  const ghiChuYeu = acid.ka.map((_, i) => {
    const qua = al.slice(i + 1).reduce((s, x) => s + x, 0);
    const toi = al.slice(i).reduce((s, x) => s + x, 0);
    const alpha = toi > 0 ? qua / toi : 0;
    if (alpha * N * toi >= 0.5 || alpha <= 0) return null;
    const moi = 1 / (alpha * toi);
    return `Nấc ${i + 1} quá yếu để thấy trên ${N} phân tử: trung bình cứ khoảng ${moi >= 1e4 ? moi.toExponential(0).replace('e+', '·10^') : Math.round(moi).toLocaleString('vi-VN')} phân tử mới có 1 phân tử đi qua nấc này.`;
  }).filter(Boolean);

  return (
    <Box>
      <Box
        component="canvas"
        ref={ref}
        role="img"
        aria-label={`Cảnh 3D quá trình điện li nhiều nấc của ${acid.ct}. Kéo để xoay.`}
        /* Cao bằng khung của các thí nghiệm theo bài (28/09/2026). */
        sx={{ width: '100%', height: toanManHinh ? '52vh' : { xs: 300, md: 400 }, display: 'block', touchAction: 'none', cursor: 'grab',
          bgcolor: 'var(--nen-rat-nhat)', border: '1px solid var(--vien)', '&:active': { cursor: 'grabbing' } }}
      />
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mt: 0.75 }}>
        <Button onClick={batDau}
          sx={{ borderRadius: 0, fontWeight: 700, textTransform: 'none', fontSize: '0.82rem', border: '1px solid var(--chu-dam)', color: 'var(--chu-dam)', '&:hover': { bgcolor: 'var(--nen-nhat)' } }}>
          Chạy lại quá trình điện li
        </Button>
        <Typography component="span" ref={chuThich} sx={{ fontWeight: 700, color: 'var(--chu-dam)', fontSize: toanManHinh ? '1.05rem' : '0.88rem' }} />
      </Box>
      <Typography component="span" ref={demSo} sx={{ display: 'block', mt: 0.5, color: 'var(--chu)', fontSize: toanManHinh ? '1rem' : '0.82rem', fontVariantNumeric: 'tabular-nums' }} />
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 0.5, fontSize: '0.78rem', color: 'var(--chu)' }}>
        <span><Box component="span" sx={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', bgcolor: 'var(--tim-nen)', mr: 0.5, verticalAlign: 'middle' }} />H⁺ tự do (trong nước thực chất là H₃O⁺)</span>
        <span><Box component="span" sx={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', border: '1px solid var(--chu-mo)', mr: 0.5, verticalAlign: 'middle' }} />nguyên tử H còn gắn trong phân tử/ion</span>
        <span>Nhãn −, 2−, 3− là điện tích của ion · kéo để xoay</span>
      </Box>
      {ghiChuYeu.map(s => (
        <Typography key={s} sx={{ mt: 0.5, color: 'var(--chu)', fontSize: '0.8rem' }}>{s}</Typography>
      ))}
    </Box>
  );
};
