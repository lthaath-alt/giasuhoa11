/**
 * Bộ vẽ 3D tối giản trên canvas cho các mô phỏng — tự viết, KHÔNG kéo thư viện
 * (chủ dự án chọn 27/09/2026: trang nhẹ cho mạng di động của học sinh). Cùng
 * cách chiếu với phòng trưng bày phân tử (public/thi-nghiem.html): xoay quanh
 * trục đứng rồi trục ngang, chiếu phối cảnh, vẽ từ xa tới gần.
 *
 * Màu lấy từ biến CSS lúc vẽ (không viết mã màu cứng), nên đổi sáng/tối là
 * cảnh đổi theo ngay.
 */
import { useEffect, useRef } from 'react';

export type V3 = [number, number, number];

export interface Camera { yaw: number; pitch: number }

export interface DiemChieu { x: number; y: number; s: number; z: number }

const CAM = 9, FOC = 7.5;

/** Chiếu điểm 3D lên canvas. `S` là số px cho một đơn vị ở gần tâm. */
export function chieu(p: V3, cam: Camera, W: number, H: number, S: number, cy = 0.55): DiemChieu {
  const c1 = Math.cos(cam.yaw), s1 = Math.sin(cam.yaw), c2 = Math.cos(cam.pitch), s2 = Math.sin(cam.pitch);
  const x1 = p[0] * c1 + p[2] * s1, z1 = -p[0] * s1 + p[2] * c1;
  const y2 = p[1] * c2 - z1 * s2, z2 = p[1] * s2 + z1 * c2;
  const f = FOC / (CAM - z2);
  return { x: W / 2 + x1 * f * S, y: H * cy - y2 * f * S, s: f * S, z: z2 };
}

/** Đọc một biến CSS (đã khai trong src/index.css). */
export function mau(ten: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(ten).trim() || 'gray';
}

/** '#rrggbb' hoặc 'rgb(r,g,b)' → 'rgba(r,g,b,a)'. */
export function trongSuot(c: string, a: number): string {
  let r = 128, g = 128, b = 128;
  if (c.startsWith('#') && c.length >= 7) {
    r = parseInt(c.slice(1, 3), 16); g = parseInt(c.slice(3, 5), 16); b = parseInt(c.slice(5, 7), 16);
  } else {
    const m = c.match(/(\d+)\D+(\d+)\D+(\d+)/);
    if (m) { r = +m[1]; g = +m[2]; b = +m[3]; }
  }
  return `rgba(${r},${g},${b},${a})`;
}

/** Quả cầu có bóng sáng — nguyên tử, ion. `vien`: nét viền cho quả cầu sáng
 *  màu (nguyên tử H trắng) để không lẫn vào nền sáng. */
export function veQuaCau(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string, alpha = 1, vien?: string) {
  if (r <= 0.3) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.08, x, y, r);
  g.addColorStop(0, trongSuot(c, 1));
  g.addColorStop(0.15, trongSuot(c, 1));
  g.addColorStop(1, trongSuot(c, 0.72));
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
  if (vien) { ctx.strokeStyle = vien; ctx.lineWidth = 1; ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(x - r * 0.33, y - r * 0.38, r * 0.26, r * 0.17, -0.7, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();
  ctx.restore();
}

/** Chữ nhỏ canh giữa (dấu điện tích trên ion…). */
export function veChu(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, c: string) {
  ctx.save();
  ctx.font = `800 ${Math.max(8, px)}px Archivo, system-ui, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = c; ctx.fillText(s, x, y);
  ctx.restore();
}

/** Bao lồi (monotone chain) — tô thân cốc từ điểm của hai vòng tròn. */
export function baoLoi(ds: { x: number; y: number }[]): { x: number; y: number }[] {
  const p = [...ds].sort((a, b) => a.x - b.x || a.y - b.y);
  if (p.length < 3) return p;
  const cheo = (o: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const duoi: typeof p = [], tren: typeof p = [];
  for (const q of p) { while (duoi.length >= 2 && cheo(duoi[duoi.length - 2], duoi[duoi.length - 1], q) <= 0) duoi.pop(); duoi.push(q); }
  for (const q of [...p].reverse()) { while (tren.length >= 2 && cheo(tren[tren.length - 2], tren[tren.length - 1], q) <= 0) tren.pop(); tren.push(q); }
  return duoi.slice(0, -1).concat(tren.slice(0, -1));
}

export const giamChuyenDong = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Canvas tự co theo khung (ResizeObserver, tỉ lệ điểm ảnh ≤ 2), kéo chuột/ngón
 * tay để xoay, và vòng lặp vẽ. `ve(ctx, W, H, dt)` được gọi mỗi khung hình;
 * `dt` tính bằng giây (chặn tối đa 0,05 để đổi tab quay lại không nhảy cóc).
 */
export function useCanh3D(ve: (ctx: CanvasRenderingContext2D, W: number, H: number, dt: number, cam: Camera) => void,
  camDau: Camera = { yaw: 0.55, pitch: 0.32 }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const cam = useRef<Camera>({ ...camDau });
  const veRef = useRef(ve);
  veRef.current = ve;

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    let W = 0, H = 0;
    const doiCo = () => {
      const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      cv.width = Math.round(W * d); cv.height = Math.round(H * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    const ro = new ResizeObserver(doiCo);
    ro.observe(cv);
    doiCo();

    let keo = false, lx = 0, ly = 0;
    const xuong = (e: PointerEvent) => { keo = true; lx = e.clientX; ly = e.clientY; cv.setPointerCapture(e.pointerId); };
    const di = (e: PointerEvent) => {
      if (!keo) return;
      cam.current.yaw += (e.clientX - lx) * 0.01;
      cam.current.pitch = Math.max(-0.2, Math.min(1.3, cam.current.pitch + (e.clientY - ly) * 0.01));
      lx = e.clientX; ly = e.clientY;
    };
    const len = () => { keo = false; };
    cv.addEventListener('pointerdown', xuong);
    cv.addEventListener('pointermove', di);
    cv.addEventListener('pointerup', len);
    cv.addEventListener('pointercancel', len);

    let id = 0, truoc = performance.now();
    const khung = (bay: number) => {
      const dt = Math.min(0.05, (bay - truoc) / 1000);
      truoc = bay;
      if (W > 0 && H > 0) {
        ctx.clearRect(0, 0, W, H);
        veRef.current(ctx, W, H, dt, cam.current);
      }
      id = requestAnimationFrame(khung);
    };
    id = requestAnimationFrame(khung);
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
      cv.removeEventListener('pointerdown', xuong);
      cv.removeEventListener('pointermove', di);
      cv.removeEventListener('pointerup', len);
      cv.removeEventListener('pointercancel', len);
    };
  }, []);

  return ref;
}
