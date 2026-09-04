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
import { CHEMISTRY_11_CURRICULUM as CT } from '../src/features/lessons/constants';

let hong = 0;
const ok = (dieu: boolean, ten: string, chiTiet = '') => {
  if (!dieu) hong++;
  console.log(`  ${dieu ? 'OK  ' : 'SAI '} ${ten}${chiTiet ? '  — ' + chiTiet : ''}`);
};

const doc = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const rt = doc('public/games/du-lieu/ran-thang.json') as Record<string, any>;
const ch = doc('public/games/du-lieu/cau-hoi-theo-bai.json') as Record<string, any>;
const bank = doc('public/bank/seed-160.json') as any[];

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

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC KHÔNG ĐẠT`) + '\n');
process.exit(hong === 0 ? 0 : 1);
