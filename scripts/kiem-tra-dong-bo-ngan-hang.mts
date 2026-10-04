/**
 * Kiểm ngân hàng trong git có còn khớp với Firestore không.
 *
 * Chạy:  npm run kiem-tra:dong-bo   (và chạy cuối trong `npm run kiem-tra`)
 *
 * Ngân hàng thật ở Firestore, bản trong repo chỉ là bản chụp. Thêm hay sửa câu
 * trên web mà quên `npm run xuat:ngan-hang` thì hai bên lệch dần, và không có
 * dấu hiệu nào báo ra: web vẫn chạy đúng vì nó đọc thẳng Firestore, chỉ có trò
 * chơi và các bộ kiểm là âm thầm dùng dữ liệu cũ. Đã lệch một lần như thế —
 * tệp trong git đứng ở 160 câu suốt trong khi Firestore lên 252.
 *
 * So bằng VÂN TAY chứ không chỉ đếm số câu: sửa nội dung một câu thì số lượng
 * không đổi, mà đó lại đúng là kiểu lệch khó thấy nhất.
 *
 * MẤT MẠNG THÌ BỎ QUA, không báo hỏng. Đây là phép kiểm cần mạng duy nhất
 * trong cả bộ; để nó chặn thì làm việc lúc offline thành không kiểm được gì.
 */
import {
  docEnv, thieuCauHinh, taiTuFirestore, vanTay, docTepNganHang,
} from './ngan-hang-chung.mts';

console.log('\n== Ngân hàng trong git có khớp Firestore không ==');

const tep = docTepNganHang();
if (!tep) {
  console.log('  SAI  không thấy public/bank/ngan-hang.json  — chạy: npm run xuat:ngan-hang');
  process.exit(1);
}

const env = docEnv();
const thieu = thieuCauHinh(env);
if (thieu.length) {
  console.log(`  BỎ QUA  chưa có cấu hình Firebase trong .env.local (${thieu.join(', ')})`);
  console.log(`          tệp trong git đang có ${tep.length} câu, không đối chiếu được.`);
  process.exit(0);
}

let tren: Record<string, unknown>[];
try {
  tren = await taiTuFirestore(env);
} catch (e) {
  console.log('  BỎ QUA  không đọc được Firestore: ' + (e as Error).message);
  console.log(`          tệp trong git đang có ${tep.length} câu.`);
  process.exit(0);
}

/* Firestore trả về 0 câu trong khi git đang có câu: đó là KHÔNG ĐỌC ĐƯỢC, không
   phải lệch thật. Mạng rớt giữa chừng thì SDK trả ngay một danh sách rỗng —
   không ném lỗi, không chờ hết hạn — nên nhánh `catch` ở trên không bắt được.
   Đo 04/10/2026: mạng rớt vài chục giây (trình duyệt báo ERR_INTERNET_DISCONNECTED
   cùng lúc), bộ này ra "lệch — trên Firestore 0 câu" và chặn cả `npm run
   kiem-tra`; chạy lại ngay sau đó thì khớp 1780 câu. Cùng lý lẽ với
   `xuat-ngan-hang.mts`, vốn từ chối ghi đè khi nhận 0 câu: ngân hàng rỗng gần
   như luôn là lỗi mạng, chứ không phải ai vừa xoá sạch mấy trăm câu. */
if (tren.length === 0 && tep.length > 0) {
  console.log('  BỎ QUA  Firestore trả về 0 câu — coi như không đọc được (mất mạng?), không phải lệch thật.');
  console.log(`          tệp trong git đang có ${tep.length} câu. Có mạng lại thì chạy lại lệnh này.`);
  process.exit(0);
}

const vtTep = vanTay(tep);
const vtTren = vanTay(tren);

if (vtTep === vtTren) {
  console.log(`  OK   khớp — ${tep.length} câu, vân tay ${vtTep}`);
  console.log('\n>>> TẤT CẢ ĐẠT\n');
  process.exit(0);
}

/* Nói rõ lệch ở đâu. "Không khớp" trơ trọi thì người đọc phải tự đi dò. */
const idTep = new Set(tep.map(q => String(q.id)));
const idTren = new Set(tren.map(q => String(q.id)));
const themMoi = [...idTren].filter(id => !idTep.has(id));
const daXoa = [...idTep].filter(id => !idTren.has(id));
const suaNoiDung = [...idTren].filter(id => idTep.has(id)).filter(id => {
  const a = tep.find(q => String(q.id) === id)!;
  const b = tren.find(q => String(q.id) === id)!;
  return vanTay([a]) !== vanTay([b]);
});

console.log(`  SAI  lệch — trong git ${tep.length} câu (${vtTep}), trên Firestore ${tren.length} câu (${vtTren})`);
if (themMoi.length) console.log(`       ${themMoi.length} câu mới chưa có trong git: ${themMoi.slice(0, 5).join(', ')}${themMoi.length > 5 ? ' …' : ''}`);
if (daXoa.length) console.log(`       ${daXoa.length} câu còn trong git nhưng đã xoá trên web: ${daXoa.slice(0, 5).join(', ')}${daXoa.length > 5 ? ' …' : ''}`);
if (suaNoiDung.length) console.log(`       ${suaNoiDung.length} câu đã sửa nội dung: ${suaNoiDung.slice(0, 5).join(', ')}${suaNoiDung.length > 5 ? ' …' : ''}`);
console.log('\n  Chữa bằng hai lệnh:');
console.log('    npm run xuat:ngan-hang');
console.log('    npm run gan:cau-hoi');
console.log('\n>>> CÓ 1 MỤC KHÔNG ĐẠT\n');
process.exit(1);
