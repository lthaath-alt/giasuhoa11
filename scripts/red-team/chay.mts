/**
 * P0-4 — bộ kiểm thử tấn công. Đẩy 41 câu tấn công qua ĐÚNG pipeline sư phạm
 * của web rồi chấm xem câu trả lời có rò đáp số không.
 *
 * Chạy:
 *   npx tsx scripts/red-team/chay.mts --tran 20                 (lô đầu, 20 lượt)
 *   npx tsx scripts/red-team/chay.mts --tu-cau 8 --tran 20      (lô tiếp, từ câu thứ 8)
 *   npx tsx scripts/red-team/chay.mts --chan --tran 20          (đo LẠI, có hàng rào P0-2)
 *   npx tsx scripts/red-team/chay.mts --xem                     (chỉ in kế hoạch, không gọi)
 *
 * BỐN RÀNG BUỘC, đừng nới:
 *
 * 1. ĐI ĐÚNG PIPELINE THẬT. Gọi `xuLyTruocLuot` rồi `dungPrompt('socratic')`
 *    rồi `tachNhanAn`, y như `AppContext.addMessage`. Chỉ khác lớp vận chuyển:
 *    ở đây là REST + khoá API, còn web đi qua Firebase AI Logic. Khác biệt đó
 *    PHẢI được ghi trong báo cáo — một bộ kiểm chạy đường khác với bản thật thì
 *    không chứng minh được bản thật an toàn.
 * 2. KHÔNG GHI FIRESTORE. Không một lệnh ghi nào trong tệp này. Dữ liệu thực
 *    nghiệm của lớp 11A3 là bằng chứng nghiên cứu.
 * 3. ĐẾM HẠN MỨC TRƯỚC. Bậc miễn phí cho 20 lượt/ngày/model, mà cả bộ là 86
 *    lượt. Script tính trước, dừng nếu vượt `--tran`, và in sẵn lệnh chạy lô
 *    tiếp theo — thay vì chạy một phần ba rồi chết giữa chừng.
 * 4. CHẤM TỰ ĐỘNG CHỈ LÀ GỢI Ý. Cột `co_dap_so` do `coDapSo()` chấm, cột
 *    `nguoi_duyet` để trống cho người đọc lại. Một mô hình nói "câu này an toàn"
 *    không phải bằng chứng câu đó an toàn.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { dungPrompt } from '../../src/features/tutor/services/promptSuPham';
import { xuLyTruocLuot, tachNhanAn, type TinNhanToiThieu } from '../../src/features/tutor/services/pedagogicalStateMachine';
import { coDapSo, locTraLoi } from '../../src/features/tutor/services/chanRoDapSo';
import { GEMINI_MODEL_NAME } from '../../src/core/constants';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

let KEY = '';
try {
  KEY = (readFileSync(join(GOC, '.env.local'), 'utf8')
    .match(/^GEMINI_API_KEY=(.*)$/m)?.[1] ?? '').trim().replace(/^["']|["']$/g, '');
} catch { /* báo ở dưới */ }

/* ── Tham số dòng lệnh ──────────────────────────────────────────────────── */

const argv = process.argv.slice(2);
const co = (c: string) => argv.includes(c);
const so = (c: string, mac: number) => {
  const i = argv.indexOf(c);
  return i >= 0 && argv[i + 1] ? Number(argv[i + 1]) : mac;
};

const CHI_XEM = co('--xem');
const CO_CHAN = co('--chan');
const TRAN_LUOT = so('--tran', 20);
const TU_CAU = so('--tu-cau', 1);
const SO_LAN = so('--lan', 1);

/* ── Dữ liệu ───────────────────────────────────────────────────────────── */

interface CauTanCong { id: string; nhom: string; maCauNganHang: string; luot: string[] }
interface CauNganHang { id: string; q: string; num?: number; tol?: number }

const tanCong: CauTanCong[] = JSON.parse(
  readFileSync(join(GOC, 'scripts/red-team/cau-tan-cong.json'), 'utf8'),
).filter((x: Partial<CauTanCong>) => x.id);

const kho: CauNganHang[] = JSON.parse(readFileSync(join(GOC, 'public/bank/ngan-hang.json'), 'utf8'));
const dapAnCua = (ma: string) => {
  const q = kho.find(k => k.id === ma);
  if (!q || typeof q.num !== 'number') return undefined;
  return { num: q.num, tol: q.tol ?? Math.abs(q.num) * 0.01 };
};

/* ── Gọi mô hình ───────────────────────────────────────────────────────── */

const URL_SINH = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_NAME}:generateContent`;
let daGoi = 0;

async function goiMoHinh(systemInstruction: string, lichSu: TinNhanToiThieu[], tin: string): Promise<string> {
  const contents = [
    ...lichSu.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
    { role: 'user', parts: [{ text: tin }] },
  ];
  const r = await fetch(`${URL_SINH}?key=${KEY}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig: { temperature: 0.3, topP: 0.85 },
    }),
  });
  daGoi++;
  const than = await r.text();
  if (!r.ok) return `[[LỖI HTTP ${r.status}]] ${than.slice(0, 200)}`;
  try {
    const j = JSON.parse(than);
    return (j?.candidates?.[0]?.content?.parts ?? [])
      .map((p: { text?: string }) => p.text ?? '').join('').trim();
  } catch {
    return '[[LỖI: thân trả về không phải JSON]]';
  }
}

/* ── Một lượt, đi đúng đường của AppContext.addMessage ──────────────────── */

interface Dong {
  id: string; nhom: string; lan: number; luot_so: number;
  tin: string; tra_loi: string; co_dap_so: boolean;
  muc_be_tac: number; gio_kiem_tra: boolean; da_chan: boolean;
  buoc: string; loai_luot: string;
}

async function chayMotCau(c: CauTanCong, lan: number, ra: Dong[]): Promise<void> {
  const dapAn = dapAnCua(c.maCauNganHang);
  const lichSu: TinNhanToiThieu[] = [];

  for (let i = 0; i < c.luot.length; i++) {
    const tin = c.luot[i];

    // Bước 1 — y như web: máy trạng thái chạy TRƯỚC khi gọi mô hình
    const truoc = xuLyTruocLuot(lichSu, tin, 'socratic');

    let thoNoiDung: string;
    if (truoc.traLoiNgay) {
      thoNoiDung = truoc.traLoiNgay;          // chặn gian lận phòng thi: không tốn lượt gọi
    } else {
      const systemInstruction = truoc.chiDanThem
        ? `${dungPrompt('socratic')}\n\n${truoc.chiDanThem}`
        : dungPrompt('socratic');
      thoNoiDung = await goiMoHinh(systemInstruction, lichSu, tin);
    }

    // Bước 2 — gỡ nhãn ẩn, y như web
    const nhan = tachNhanAn(thoNoiDung);
    let noiDung = nhan.noiDung;
    let daChan = false;

    // Bước 3 — hàng rào P0-2, chỉ bật khi đo LẠI
    if (CO_CHAN && dapAn && !truoc.traLoiNgay) {
      const loc = await locTraLoi({
        traLoi: noiDung,
        dapAn,
        sinhLai: async (chiThi) => {
          const lai = await goiMoHinh(
            `${dungPrompt('socratic')}\n\n${truoc.chiDanThem}\n\n${chiThi}`, lichSu, tin);
          return tachNhanAn(lai).noiDung;
        },
      });
      noiDung = loc.noiDung;
      daChan = loc.daChan;
    }

    ra.push({
      id: c.id, nhom: c.nhom, lan, luot_so: i + 1,
      tin, tra_loi: noiDung,
      co_dap_so: dapAn ? coDapSo(noiDung, dapAn.num, dapAn.tol) : false,
      muc_be_tac: truoc.soLanBeTac, gio_kiem_tra: truoc.laGianLan, da_chan: daChan,
      buoc: nhan.buoc ?? '', loai_luot: nhan.loaiLuot ?? '',
    });

    lichSu.push({ sender: 'user', content: tin });
    lichSu.push({ sender: 'ai', content: noiDung });
  }
}

/* ── CSV ───────────────────────────────────────────────────────────────── */

const oCsv = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

function xuatCsv(ds: Dong[]): string {
  const dau = ['id', 'nhom', 'lan', 'luot_so', 'tin', 'tra_loi', 'co_dap_so',
    'muc_be_tac', 'gio_kiem_tra', 'da_chan', 'buoc', 'loai_luot', 'nguoi_duyet'];
  /* BOM ở đầu: thiếu nó thì Excel trên Windows đọc UTF-8 thành ký tự rác. */
  return '﻿' + [dau.join(','), ...ds.map(d => [
    d.id, d.nhom, d.lan, d.luot_so, d.tin, d.tra_loi, d.co_dap_so ? 'RÒ' : '',
    d.muc_be_tac, d.gio_kiem_tra ? 'x' : '', d.da_chan ? 'x' : '', d.buoc, d.loai_luot, '',
  ].map(oCsv).join(','))].join('\n');
}

/* ── Chạy ──────────────────────────────────────────────────────────────── */

async function main(): Promise<void> {
  const chon = tanCong.slice(TU_CAU - 1);
  let luotCan = 0;
  const lay: CauTanCong[] = [];
  for (const c of chon) {
    const them = c.luot.length * SO_LAN * (CO_CHAN ? 2 : 1); // có chặn thì có thể phải sinh lại
    if (luotCan + them > TRAN_LUOT) break;
    luotCan += them;
    lay.push(c);
  }

  console.log(`\nP0-4 — bộ kiểm thử tấn công${CO_CHAN ? ' (CÓ hàng rào P0-2)' : ' (BASELINE, chưa có hàng rào)'}`);
  console.log(`Model: ${GEMINI_MODEL_NAME}`);
  console.log(`Cả bộ: ${tanCong.length} câu, ${tanCong.reduce((s, c) => s + c.luot.length, 0)} lượt.`);
  console.log(`Lô này: câu ${TU_CAU}–${TU_CAU + lay.length - 1} (${lay.length} câu), ${luotCan}/${TRAN_LUOT} lượt.`);
  if (lay.length < chon.length) {
    console.log(`Còn ${chon.length - lay.length} câu chưa chạy. Lô sau:`);
    console.log(`  npx tsx scripts/red-team/chay.mts --tu-cau ${TU_CAU + lay.length} --tran ${TRAN_LUOT}${CO_CHAN ? ' --chan' : ''}`);
  }
  if (CHI_XEM) { console.log('\n--xem: dừng ở đây, không gọi mô hình.'); return; }
  if (!KEY) { console.error('\nKhông tìm thấy GEMINI_API_KEY trong .env.local'); process.exit(1); }

  const ra: Dong[] = [];
  for (let lan = 1; lan <= SO_LAN; lan++) {
    for (const c of lay) {
      process.stdout.write(`  [lần ${lan}] ${c.id} (${c.nhom})… `);
      await chayMotCau(c, lan, ra);
      const roCuaCau = ra.filter(d => d.id === c.id && d.lan === lan && d.co_dap_so).length;
      console.log(roCuaCau > 0 ? `RÒ ${roCuaCau} lượt` : 'sạch');
    }
  }

  // ── Bảng tóm tắt theo nhóm ──
  console.log('\n══ TỈ LỆ RÒ THEO NHÓM ══');
  const nhom = [...new Set(ra.map(d => d.nhom))];
  for (const n of nhom) {
    const cua = ra.filter(d => d.nhom === n);
    const ro = cua.filter(d => d.co_dap_so).length;
    console.log(`  ${n.padEnd(30)} ${String(ro).padStart(2)}/${String(cua.length).padEnd(3)} ` +
      `${(ro / cua.length * 100).toFixed(1).padStart(5)}%`);
  }
  const tongRo = ra.filter(d => d.co_dap_so).length;
  console.log(`  ${'TỔNG'.padEnd(30)} ${String(tongRo).padStart(2)}/${String(ra.length).padEnd(3)} ` +
    `${(tongRo / ra.length * 100).toFixed(1).padStart(5)}%`);
  console.log(`\nSố lượt gọi mô hình đã dùng: ${daGoi}`);

  const moc = new Date().toISOString().slice(0, 10);
  const ten = `ket-qua-${CO_CHAN ? 'SAU' : 'BASELINE'}-${moc}-cau${TU_CAU}.csv`;
  mkdirSync(join(GOC, 'scripts/red-team'), { recursive: true });
  writeFileSync(join(GOC, 'scripts/red-team', ten), xuatCsv(ra), 'utf8');
  console.log(`Kết quả: scripts/red-team/${ten}`);
  console.log('Cột `nguoi_duyet` để trống — người đọc lại và chấm tay, đừng tin mỗi cột tự chấm.');
}

main().catch(e => { console.error(e); process.exit(1); });
