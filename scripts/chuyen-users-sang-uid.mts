/* ─── Đánh lại khoá collection `users` theo uid của Firebase Auth ────────────
 *
 * VÌ SAO CẦN: luật Firestore KHÔNG truy vấn được, chỉ `get()` theo đường dẫn.
 * Muốn luật đọc được vai của người đang gọi thì tài liệu phải nằm đúng ở
 * `users/{request.auth.uid}`. Đo ngày 10/09/2026: 0/16 tài liệu có id trùng
 * `authUid` — id hiện là chuỗi ngẫu nhiên do `addDoc` sinh ra.
 *
 * VÌ SAO CHẠY SỚM ĐƯỢC (trước khi đổi mã đăng nhập): mã cũ tra người dùng theo
 * TRƯỜNG `email`/`username`, không theo id tài liệu. Đã đo trên dữ liệu thật
 * cùng ngày: 0 bản ghi trong `classes`, `progress`, `chats`, `exams` chứa bất
 * kỳ id tài liệu `users` nào — chúng trỏ bằng `userEmail`, `teacherEmail`,
 * `studentIdentifiers` (đều là email). Nên đổi id không làm hỏng gì.
 *
 * AN TOÀN KHI CHẠY: tạo tài liệu MỚI trước, đọc lại xác nhận, RỒI mới xoá tài
 * liệu cũ. Đứt mạng giữa chừng thì thừa một bản sao — còn hơn mất dữ liệu.
 * Chạy lại được nhiều lần: tài liệu đã đúng khoá thì bỏ qua.
 *
 * Mặc định CHẠY THỬ, không ghi gì. Thêm `--that` mới ghi.
 *
 * Chạy: npm run chuyen:users              (thử)
 *       npm run chuyen:users -- --that     (ghi thật)
 */
import { readFileSync } from 'node:fs';

const GOC = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const cauHinh = readFileSync(GOC + 'src/core/services/firebaseCongKhai.ts', 'utf8');
const KHOA = cauHinh.match(/apiKey: '([^']+)'/)![1];
const DU_AN = cauHinh.match(/projectId: '([^']+)'/)![1];
const GOC_API = `https://firestore.googleapis.com/v1/projects/${DU_AN}/databases/(default)/documents`;
const THAT = process.argv.includes('--that');

/* Nối khoá API bằng `&` khi đường dẫn đã có sẵn tham số truy vấn. Bản đầu luôn
   dùng `?`, nên `lay('users?pageSize=300')` ra `...?pageSize=300?key=...` —
   hai dấu hỏi, Firestore trả về rỗng và script tưởng là mất mạng. */
const lay = (duong: string) =>
  fetch(`${GOC_API}/${duong}${duong.includes('?') ? '&' : '?'}key=${KHOA}`).then(r => r.json());

async function main() {
  console.log(`\nDự án Firebase: ${DU_AN}`);

  const j = await lay('users?pageSize=300');
  const docs = (j.documents ?? []) as any[];
  if (!docs.length) {
    console.log('Không đọc được tài liệu nào — kiểm tra mạng hoặc luật Firestore.\n');
    process.exit(1);
  }
  console.log(`Đọc được ${docs.length} tài liệu users\n`);

  const canChuyen: { cu: string; moi: string; fields: any; email: string }[] = [];
  const boQua: string[] = [];

  for (const d of docs) {
    const idCu = d.name.split('/').pop() as string;
    const uid = d.fields?.authUid?.stringValue ?? '';
    const email = d.fields?.email?.stringValue ?? '(không có email)';
    if (!uid) { boQua.push(`${email.padEnd(30)} ${idCu}  — KHÔNG có authUid`); continue; }
    if (idCu === uid) { boQua.push(`${email.padEnd(30)} ${idCu}  — đã đúng khoá rồi`); continue; }
    canChuyen.push({ cu: idCu, moi: uid, fields: d.fields, email });
  }

  console.log(`Cần chuyển: ${canChuyen.length}`);
  for (const x of canChuyen) console.log(`  ${x.email.padEnd(30)} ${x.cu}  ->  ${x.moi}`);
  if (boQua.length) {
    console.log(`\nBỏ qua: ${boQua.length}`);
    for (const x of boQua) console.log('  ' + x);
  }

  if (!THAT) {
    console.log('\n(CHẠY THỬ — chưa ghi gì. Thêm `-- --that` để ghi thật.)\n');
    return;
  }

  console.log('\nĐang ghi…');
  let xong = 0;
  const hong: string[] = [];
  for (const x of canChuyen) {
    const tao = await fetch(`${GOC_API}/users?documentId=${x.moi}&key=${KHOA}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: x.fields }),
    });
    if (!tao.ok) { hong.push(`${x.email}: không tạo được bản mới (HTTP ${tao.status})`); continue; }

    /* Đọc lại bản mới TRƯỚC khi xoá bản cũ. Không có bước này thì một lần ghi
       hỏng âm thầm là mất hẳn một người dùng. */
    const kiem = await lay(`users/${x.moi}`);
    if (!kiem.name) { hong.push(`${x.email}: đọc lại bản mới không thấy — GIỮ NGUYÊN bản cũ`); continue; }

    const xoa = await fetch(`${GOC_API}/users/${x.cu}?key=${KHOA}`, { method: 'DELETE' });
    if (!xoa.ok) { hong.push(`${x.email}: tạo xong nhưng không xoá được bản cũ ${x.cu}`); continue; }

    xong++;
    console.log(`  OK  ${x.email}`);
  }

  console.log(`\nChuyển xong ${xong}/${canChuyen.length}`);
  if (hong.length) {
    console.log('\nCÓ VẤN ĐỀ:');
    for (const h of hong) console.log('  ' + h);
    console.log('\nChạy lại lệnh này ở chế độ THỬ để xem còn lệch chỗ nào.\n');
    process.exit(1);
  }
  console.log('');
}

main();
