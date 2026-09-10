/* ─── Xoá cột `password` khỏi collection `users` ──────────────────────────────
 *
 * ĐÂY LÀ BƯỚC ĐÓNG LỖ HỔNG NẶNG NHẤT CỦA DỰ ÁN.
 *
 * Trước 10/09/2026, `users` phải cho đọc công khai vì việc đăng nhập chạy ngay
 * trên trình duyệt: nó tải bản ghi người dùng về rồi so chuỗi mật khẩu. Nghĩa
 * là bất kỳ ai trên Internet cũng tải về được mật khẩu của mọi người — không
 * luật Firestore nào cứu được, vì chính ứng dụng cần quyền đọc đó.
 *
 * Nay mật khẩu nằm ở Firebase Auth, đã băm, không bao giờ về tới trình duyệt.
 * Cột `password` trong Firestore chỉ còn là bản sao thừa của một bí mật — và
 * là bản sao ai cũng đọc được.
 *
 * ⚠ CHỈ chạy sau khi đã đăng nhập được bằng Firebase Auth. Chạy sớm thì đường
 * đăng nhập cũ chết ngay mà đường mới chưa chắc chạy.
 *
 * KHÔNG LÙI ĐƯỢC: Firestore không có thùng rác. Script tự chụp một bản dự phòng
 * ra thư mục tạm trước khi xoá, và in đường dẫn ra màn hình.
 *
 * Mặc định CHẠY THỬ. Thêm `--that` mới ghi.
 *
 * Chạy: npm run xoa:password              (thử)
 *       npm run xoa:password -- --that     (ghi thật)
 */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const GOC = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const cauHinh = readFileSync(GOC + 'src/core/services/firebaseCongKhai.ts', 'utf8');
const KHOA = cauHinh.match(/apiKey: '([^']+)'/)![1];
const DU_AN = cauHinh.match(/projectId: '([^']+)'/)![1];
const GOC_API = `https://firestore.googleapis.com/v1/projects/${DU_AN}/databases/(default)/documents`;
const THAT = process.argv.includes('--that');

/* Nối khoá API bằng `&` khi đường dẫn đã có tham số truy vấn. Dùng `?` cứng thì
   `users?pageSize=300` thành `...?pageSize=300?key=...` — hai dấu hỏi, Firestore
   trả rỗng, và script tưởng là mất mạng. Đã vấp đúng lỗi này ở
   `chuyen-users-sang-uid.mts`. */
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

  const co = docs.filter(d => d.fields?.password !== undefined);
  console.log(`${docs.length} tài liệu users, ${co.length} còn cột password\n`);
  for (const d of co) {
    const e = d.fields?.email?.stringValue ?? d.name.split('/').pop();
    console.log('  ' + e);
  }

  if (!THAT) {
    console.log('\n(CHẠY THỬ — chưa ghi gì. Thêm `-- --that` để ghi thật.)\n');
    return;
  }
  if (!co.length) { console.log('\nKhông còn gì để xoá.\n'); return; }

  /* Chụp dự phòng TRƯỚC khi xoá. Firestore không có thùng rác — không có bước
     này thì sai một cái là mất hẳn. Để ở thư mục tạm chứ KHÔNG để trong repo:
     bản chụp này chứa mật khẩu dạng chữ thường. */
  const thuMuc = mkdtempSync(join(tmpdir(), 'giasuhoa11-duphong-'));
  const tepDuPhong = join(thuMuc, 'users-truoc-khi-xoa-password.json');
  writeFileSync(tepDuPhong, JSON.stringify(docs, null, 1), 'utf8');
  console.log(`\nĐã chụp dự phòng ${docs.length} tài liệu:`);
  console.log(`  ${tepDuPhong}`);
  console.log('  (chứa mật khẩu chữ thường — ĐỪNG đưa vào repo, xoá đi khi không cần nữa)');

  console.log('\nĐang xoá…');
  let xong = 0;
  const hong: string[] = [];
  for (const d of co) {
    const id = d.name.split('/').pop();
    const e = d.fields?.email?.stringValue ?? id;
    /* `updateMask.fieldPaths=password` + thân không có `password`
       => Firestore XOÁ đúng trường đó, giữ nguyên mọi trường khác.
       Đây là lý do KHÔNG dùng PATCH thường: PATCH không có updateMask sẽ
       ghi đè cả tài liệu và xoá sạch những trường không nhắc tới. */
    const r = await fetch(
      `${GOC_API}/users/${id}?updateMask.fieldPaths=password&key=${KHOA}`,
      { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: {} }) }
    );
    if (r.ok) { xong++; console.log(`  OK  ${e}`); }
    else hong.push(`${e}: HTTP ${r.status}`);
  }

  console.log(`\nXoá xong ${xong}/${co.length}`);
  if (hong.length) {
    console.log('\nCÓ VẤN ĐỀ:');
    for (const h of hong) console.log('  ' + h);
    process.exit(1);
  }
  console.log('');
}

main();
