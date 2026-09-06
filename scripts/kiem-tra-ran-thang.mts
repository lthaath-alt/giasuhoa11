/**
 * Kiểm dữ liệu trò "Rắn và Thang".
 *
 * Chạy:  npm run kiem-tra:ran-thang
 * Không gọi mạng, không tốn lượt API.
 *
 * Trò chơi đọc hai tệp JSON sinh sẵn. Sinh lại dữ liệu bài học mà quên chạy lại
 * hai lệnh sinh là trò chơi lệch khỏi chương trình — mà nhìn vào không biết,
 * vì nó vẫn chạy bình thường với dữ liệu cũ.
 */
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { CHEMISTRY_11_CURRICULUM as CT } from '../src/features/lessons/constants';

let hong = 0;
const ok = (dieu: boolean, ten: string, chiTiet = '') => {
  if (!dieu) hong++;
  console.log(`  ${dieu ? 'OK  ' : 'SAI '} ${ten}${chiTiet ? '  — ' + chiTiet : ''}`);
};

const doc = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const rt = doc('public/games/du-lieu/ran-thang.json') as Record<string, any>;
const ch = doc('public/games/du-lieu/cau-hoi-theo-bai.json') as Record<string, any>;
const bank = doc('public/bank/ngan-hang.json') as any[];

const baiThat = CT.flatMap(c => c.lessons.map(l => l.id));

console.log('\n== Nội dung rắn và thang ==');
{
  ok(Object.keys(rt).length === baiThat.length,
     `có đủ ${baiThat.length} bài`, `${Object.keys(rt).length} bài`);

  const thieu = baiThat.filter(id => !rt[id]);
  ok(thieu.length === 0, 'bài nào cũng có dữ liệu', thieu.join(', '));

  const thua = Object.keys(rt).filter(id => !baiThat.includes(id));
  ok(thua.length === 0, 'không có bài lạ ngoài chương trình', thua.join(', '));

  const itThang = baiThat.filter(id => (rt[id]?.thang ?? []).length < 4);
  const itRan = baiThat.filter(id => (rt[id]?.ran ?? []).length < 4);
  ok(itThang.length === 0, 'bài nào cũng đủ 4 thang', itThang.join(', '));
  ok(itRan.length === 0, 'bài nào cũng đủ 4 rắn', itRan.join(', '));

  /* Tên bài trong tệp phải khớp dữ liệu chương trình. Lệch nghĩa là tệp sinh từ
     một bản constants.ts cũ. */
  const lech = baiThat.filter(id => {
    const l = CT.flatMap(c => c.lessons).find(x => x.id === id)!;
    return rt[id]?.tenBai !== l.title;
  });
  ok(lech.length === 0, 'tên bài khớp với chương trình hiện tại',
     lech.length ? lech.join(', ') + ' — chạy lại: npm run sinh:ran-thang' : '');

  /* Câu chữ hiển thị trong trò chơi phải dùng chỉ số dưới như phần đọc SGK.
     Học sinh thấy "N₂" ở bài giảng rồi thấy "N2" trong trò chơi là lệch. */
  const chuoi = Object.values(rt).flatMap((v: any) =>
    [...v.thang, ...v.ran].flatMap((m: any) => [m.noi, m.sua].filter(Boolean)));
  const tho = [...new Set(chuoi.join('\n').match(/\b(?:[A-Z][a-z]?\d+)+[A-Za-z]*\b(?![+-])/g) ?? [])];
  ok(tho.length === 0, 'không còn công thức viết thô', tho.slice(0, 8).join(', '));

  /* Rắn phải luôn kèm phần "sửa cho đúng" — nếu không, học sinh chỉ đọc được
     mô tả một cái sai mà không biết cái đúng là gì. */
  const ranThieuSua = Object.entries(rt)
    .filter(([, v]: any) => v.ran.some((r: any) => !r.sua)).map(([k]) => k);
  ok(ranThieuSua.length === 0, 'rắn nào cũng kèm cách làm đúng', ranThieuSua.join(', '));
}

console.log('\n== Gán câu hỏi theo bài ==');
{
  const thieu = baiThat.filter(id => !ch[id]);
  ok(thieu.length === 0, 'bài nào cũng có danh sách câu hỏi', thieu.join(', '));

  const idNganHang = new Set(bank.map(q => q.id));
  const laId = Object.values(ch).flatMap((v: any) => v.cau.map((x: any) => x.id));
  const bay = [...new Set(laId.filter((id: string) => !idNganHang.has(id)))];
  ok(bay.length === 0, 'mọi mã câu đều có thật trong ngân hàng', bay.slice(0, 6).join(', '));

  /* Trò chơi chỉ dùng câu trắc nghiệm. Cần đủ câu cho một màn — 6 câu đúng, mà
     có thể trả lời sai nên phải dư ra. Dưới 10 câu là màn đó lặp câu liên tục. */
  const bang: Record<string, any> = {};
  bank.forEach(q => { bang[q.id] = q; });
  const itCau = baiThat.filter(id => {
    const n = (ch[id]?.cau ?? []).filter((x: any) => {
      const q = bang[x.id];
      return q && (q.t || 'mc') === 'mc' && Array.isArray(q.o) && q.o.length >= 2;
    }).length;
    return n < 10;
  });
  ok(itCau.length === 0, 'bài nào cũng có từ 10 câu trắc nghiệm trở lên', itCau.join(', '));

  /* Câu của bài phải cùng chương với bài — gán lẫn chương là sai hẳn nội dung. */
  const lechChuong: string[] = [];
  for (const c of CT) {
    const soCh = Number(c.id.replace('chuong-', ''));
    for (const l of c.lessons) {
      const co = (ch[l.id]?.cau ?? []).some((x: any) => bang[x.id] && bang[x.id].ch !== soCh);
      if (co) lechChuong.push(l.id);
    }
  }
  ok(lechChuong.length === 0, 'câu hỏi của bài đều thuộc đúng chương', lechChuong.join(', '));

  /* Xếp hạng phải giảm dần: trò chơi lấy lần lượt từ đầu nên thứ tự chính là
     mức ưu tiên. Xếp sai thứ tự là câu lệch bài lại được hỏi trước. */
  const saiThuTu = baiThat.filter(id => {
    const ds = (ch[id]?.cau ?? []).map((x: any) => x.diem);
    return ds.some((d: number, i: number) => i > 0 && d > ds[i - 1]);
  });
  ok(saiThuTu.length === 0, 'câu sát bài được xếp lên trước', saiThuTu.join(', '));
}

console.log('\n== Bản nhúng trong tệp trò chơi ==');
{
  /* Trò chơi dùng bản NHÚNG trong chính tệp HTML chứ không tải JSON qua mạng —
     vì máy chủ không tìm thấy tệp thì trả về index.html, và trò chơi báo
     "Unexpected token '<'" mà không ai hiểu vì sao. Đổi lại, phải canh bản
     nhúng đừng lạc hậu so với hai tệp .json: sinh lại dữ liệu mà quên nhúng thì
     trò chơi vẫn chạy ngon lành với nội dung cũ, không có dấu hiệu gì. */
  /* Chuẩn hoá xuống dòng trước khi tìm. Git trên Windows đổi cả tệp sang CRLF,
     và phép tìm `;` kèm xuống dòng khi đó không khớp — phép kiểm báo hỏng trong
     khi nội dung không sai một chữ nào. Đã mắc đúng lỗi này ở bộ kiểm thực
     nghiệm, nay lặp lại ở đây. */
  const html = readFileSync('public/games/ran-va-thang.html', 'utf8')
    .replace(/\r\n/g, '\n');
  const lay = (ten: string) => {
    const mo = 'var ' + ten + ' = ';
    const i = html.indexOf(mo);
    if (i < 0) return null;
    const j = html.indexOf(';' + '\n', i);
    try { return JSON.parse(html.slice(i + mo.length, j)); } catch { return null; }
  };
  const nRt = lay('NHUNG_RAN_THANG');
  const nUt = lay('NHUNG_UU_TIEN');
  ok(!!nRt && !!nUt, 'tệp trò chơi có đủ hai khối dữ liệu nhúng');
  ok(JSON.stringify(nRt) === JSON.stringify(rt),
     'bản nhúng rắn/thang khớp tệp .json', 'chạy lại: npm run nhung:ran-thang');
  ok(JSON.stringify(nUt) === JSON.stringify(ch),
     'bản nhúng câu hỏi khớp tệp .json', 'chạy lại: npm run nhung:ran-thang');
  ok(!html.includes("nap('du-lieu/"),
     'trò chơi KHÔNG còn tải hai tệp đó qua mạng');
}

/* ══ Bàn cờ và bảng màu ══════════════════════════════════════════════════
   Ba mục dưới đây TRÍCH THẲNG mã trong tệp trò chơi ra chạy chứ không chép
   lại. Chép lại thì bài kiểm cứ đạt trong khi trò chơi đã sai — đúng cái bẫy
   đã mắc ở bộ kiểm màu của web, nơi một phép so sánh không bao giờ chạy mà
   vẫn báo OK suốt nhiều tháng. */
const html = readFileSync('public/games/ran-va-thang.html', 'utf8').replace(/\r\n/g, '\n');

/** Cắt đoạn mã từ `mo` tới ngay trước `dong`. */
function catMa(mo: string, dong: string): string {
  const i = html.indexOf(mo);
  if (i < 0) throw new Error('không thấy trong tệp trò chơi: ' + mo);
  const j = html.indexOf(dong, i);
  if (j < 0) throw new Error('không thấy đoạn kết sau: ' + mo);
  return html.slice(i, j);
}

const hop: Record<string, any> = { console, Math, Object, JSON, String, Number, Array };
createContext(hop);
runInContext([
  catMa('var NHUNG_RAN_THANG = ', '\n// ═══'),
  'var duLieu = { ranThang: NHUNG_RAN_THANG };',
  catMa('var SO_O       =', '// ═══ Trạng thái'),
  catMa('function bam(s)', '\n// ═══'),
  catMa('var HANG = {', '// ═══ Tiến độ'),
  catMa('function datRanThang(maBai)', '\n// ═══ Vẽ bàn cờ'),
].join('\n'), hop);

console.log('\n== Bàn cờ ==');
{
  ok(hop.SO_O % hop.COT === 0, 'số ô chia hết cho số cột (không có hàng cụt)',
     `${hop.SO_O} ô / ${hop.COT} cột`);

  const loi = { thieu: [] as string[], nguoc: [] as string[], trung: [] as string[],
                chuoi: [] as string[], chamMep: [] as string[] };
  const dai: number[] = [];
  for (const ma of baiThat) {
    const duong = hop.datRanThang(ma) as any[];
    const sThang = duong.filter(d => d.loai === 'thang').length;
    const sRan = duong.filter(d => d.loai === 'ran').length;
    if (sThang !== hop.SO_THANG || sRan !== hop.SO_RAN)
      loi.thieu.push(`${ma}: ${sThang} thang / ${sRan} rắn`);
    if (duong.some(d => (d.loai === 'thang') !== (d.den > d.tu))) loi.nguoc.push(ma);

    const mut = duong.flatMap(d => [d.tu, d.den]);
    if (new Set(mut).size !== mut.length) loi.trung.push(ma);
    const dauVao = new Set(duong.map(d => d.tu));
    if (duong.some(d => dauVao.has(d.den))) loi.chuoi.push(ma);
    if (mut.some(o => o <= 1 || o >= hop.SO_O)) loi.chamMep.push(ma);
    duong.forEach(d => dai.push(Math.abs(d.den - d.tu)));
  }
  /* Bàn 30 ô đặt 8 đường là chiếm hơn nửa số ô dùng được. Ở mật độ ấy, số lượt
     thử trong datRanThang mà thấp thì thỉnh thoảng có màn thiếu mất một cái
     thang — trò chơi vẫn chạy êm, không lỗi nào báo ra. */
  ok(loi.thieu.length === 0, 'màn nào cũng đặt đủ số thang và rắn', loi.thieu.join('; '));
  ok(loi.nguoc.length === 0, 'thang luôn đi lên, rắn luôn đi xuống', loi.nguoc.join(', '));
  ok(loi.trung.length === 0, 'không ô nào giữ hai đầu đường', loi.trung.join(', '));
  ok(loi.chuoi.length === 0, 'không có trượt dây chuyền', loi.chuoi.join(', '));
  ok(loi.chamMep.length === 0, 'ô xuất phát và ô đích luôn để trống', loi.chamMep.join(', '));

  const xa = Math.max(...dai), gan = Math.min(...dai);
  ok(xa <= Math.round(hop.SO_O / 3), 'bước nhảy dài nhất không quá một phần ba bàn',
     `dài nhất ${xa} ô trên ${hop.SO_O}`);
  ok(gan >= 3, 'bước nhảy ngắn nhất vẫn đáng đi', `ngắn nhất ${gan} ô`);
}

console.log('\n== Xếp loại danh hiệu ==');
{
  const xl = hop.xepLoai, th = hop.totHon, C = hop.CAN_DUNG;
  ok(xl(C - 1, C + 2) === null, 'chưa đủ số câu đúng thì chưa có danh hiệu');
  ok(xl(C, C) === 'xuatsac', 'không sai câu nào → xuất sắc');
  ok(xl(6, 8) === 'gioi', 'đúng 6 trên 8 câu (75%) → giỏi');
  ok(xl(6, 9) === 'kha', 'đúng 6 trên 9 câu (67%) → khá');
  /* Xếp theo TỈ LỆ chứ không theo số câu đúng: ván dài bị hỏi nhiều hơn, lấy
     số câu đúng làm mốc là thưởng em đi vòng và phạt em đi thẳng. */
  ok(xl(6, 6) === 'xuatsac' && xl(11, 20) === 'kha',
     'ván ngắn hoàn hảo xếp trên ván dài nhiều lỗi');
  ok(th('kha', 'xuatsac') === 'xuatsac', 'chơi lại được hạng thấp vẫn giữ hạng cao');
  ok(th(undefined, 'gioi') === 'gioi' && th('gioi', undefined) === 'gioi',
     'thiếu một bên thì lấy bên còn lại');
}

console.log('\n== Tương phản bảng màu bàn cờ ==');
{
  const lay = (ten: string, khoi: string) =>
    new RegExp('--' + ten + ':\\s*(#[0-9a-fA-F]{3,8})').exec(khoi)?.[1] ?? null;
  const iSang = html.indexOf(':root{');
  const iToi = html.indexOf(':root[data-theme="dark"]{');
  const khoi = {
    sáng: html.slice(iSang, iToi),
    tối: html.slice(iToi, html.indexOf('}', html.indexOf('--vien-chu', iToi))),
  };
  const sang2 = (hex: string) => {
    const v = hex.replace('#', '');
    const cap = v.length === 3 ? v.split('').map(c => c + c) : v.match(/../g)!.slice(0, 3);
    const [r, g, b] = cap.map(h => {
      const c = parseInt(h, 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const tuongPhan = (a: string, b: string) => {
    const [x, y] = [sang2(a), sang2(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };

  for (const [ten, k] of Object.entries(khoi)) {
    const chuO = lay('chu-o', k)!;
    let kem = '';
    for (const o of ['o1', 'o2', 'o3', 'o4', 'o5', 'o6', 'vang-o']) {
      const t = tuongPhan(chuO, lay(o, k)!);
      if (t < 4.5) kem += ` --${o}=${t.toFixed(2)}`;
    }
    ok(kem === '', `chế độ ${ten}: chữ đọc được trên mọi màu ô`, kem.trim());
    const t1 = tuongPhan(lay('tieu-mau', k)!, lay('vien-chu', k)!);
    const t2 = tuongPhan(lay('tieu-mau', k)!, lay('troi-1', k)!);
    ok(t1 >= 3, `chế độ ${ten}: ruột chữ tiêu đề nổi trên viền chữ`, t1.toFixed(2));
    ok(t2 >= 3, `chế độ ${ten}: chữ tiêu đề nổi trên nền trời`, t2.toFixed(2));
  }
}

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC KHÔNG ĐẠT`) + '\n');
process.exit(hong === 0 ? 0 : 1);
