/* Giả cảnh máy vừa git clone: KHÔNG có .env.local. Truyền env rỗng nên mọi giá
   trị buộc phải lấy từ bản công khai trong git. */
import { cauHinh, thieuCauHinh, taiTuFirestore, vanTay, docTepNganHang } from './scripts/ngan-hang-chung.mts';
const rong = {};
console.log('thiếu cấu hình khi env rỗng:', JSON.stringify(thieuCauHinh(rong)));
console.log('dự án nối tới:', cauHinh(rong).projectId);
const ds = await taiTuFirestore(rong);
const tep = docTepNganHang()!;
console.log('đọc được từ Firestore:', ds.length, 'câu, vân tay', vanTay(ds));
console.log('tệp trong repo:      ', tep.length, 'câu, vân tay', vanTay(tep));
console.log(vanTay(ds) === vanTay(tep) ? '>>> KHỚP — máy mới chỉ cần git pull' : '>>> LỆCH');
process.exit(0);
