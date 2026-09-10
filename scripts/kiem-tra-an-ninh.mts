/* ─── Kiểm an ninh: những hàng rào không được phép biến mất ───────────────────
 *
 * Viết bộ này sau một lượt rà soát ngày 10/09/2026 tìm ra một lỗ hổng XSS lưu
 * trữ đã sống trong dự án từ lâu:
 *
 *   collection `bank_questions` để `allow write: if true`  (ai cũng ghi được)
 *        │
 *        ├─ nội dung câu hỏi đọc từ đó
 *        │
 *        └─ đi thẳng vào `dangerouslySetInnerHTML`, không qua bộ lọc nào
 *
 * Kẻ tấn công ghi một câu hỏi có `<img src=x onerror=…>` là mọi học sinh mở đề
 * chứa câu đó đều chạy mã của hắn. Mà `users` lưu mật khẩu dạng chữ thường, nên
 * hắn lấy luôn được tài khoản.
 *
 * Mỗi phép kiểm dưới đây canh MỘT hàng rào. Chúng cố ý là phép kiểm TĨNH — đọc
 * mã nguồn, không cần chạy trình duyệt — để chạy được cùng tám bộ kia trong
 * `npm run kiem-tra` mà không cần mạng hay DOM.
 *
 * Chạy: npm run kiem-tra:an-ninh
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, basename, relative } from 'node:path';

const GOC = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

let soLoi = 0;
const dat = (ten: string) => console.log(`  OK   ${ten}`);
const truot = (ten: string, chiTiet: string) => { soLoi++; console.log(`  SAI  ${ten}\n       ${chiTiet}`); };

function moiTep(thuMuc: string, duoi: string[], ra: string[] = []): string[] {
  for (const t of readdirSync(thuMuc)) {
    const d = join(thuMuc, t);
    if (statSync(d).isDirectory()) moiTep(d, duoi, ra);
    else if (duoi.some(x => t.endsWith(x))) ra.push(d);
  }
  return ra;
}
const tepNguon = moiTep(join(GOC, 'src'), ['.ts', '.tsx']);
const doc = (f: string) => readFileSync(f, 'utf8');
const ten = (f: string) => relative(GOC, f).replace(/\\/g, '/');

console.log('\n== Mọi chỗ ghi HTML thô đều phải qua bộ lọc ==');
{
  /* `dangerouslySetInnerHTML` là cửa duy nhất để HTML chưa tin cậy vào được
     trang. Luật: hễ dùng nó thì giá trị PHẢI đi qua `locHtml()`. */
  const pham: string[] = [];
  let soCho = 0;
  for (const f of tepNguon) {
    /* Chính tệp bộ lọc nói về `dangerouslySetInnerHTML` trong chú thích của nó. */
    if (basename(f) === 'locHtml.ts') continue;
    for (const d of doc(f).split(/\r?\n/)) {
      if (!d.includes('dangerouslySetInnerHTML')) continue;
      /* Dòng chú thích chỉ NHẮC tới, không phải dùng. */
      const t = d.trimStart();
      if (t.startsWith('*') || t.startsWith('//') || t.startsWith('/*')) continue;
      soCho++;
      if (!d.includes('locHtml(')) pham.push(`${ten(f)}: ${d.trim().slice(0, 70)}`);
    }
  }
  if (soCho === 0) dat('không còn chỗ nào ghi HTML thô');
  else if (pham.length) truot('mọi dangerouslySetInnerHTML đều gọi locHtml()', pham.join(' | '));
  else dat(`cả ${soCho} chỗ ghi HTML đều qua locHtml()`);
}

console.log('\n== Bộ lọc phải dùng danh sách CHO PHÉP ==');
{
  const P = join(GOC, 'src/core/services/locHtml.ts');
  if (!existsSync(P)) truot('có bộ lọc HTML', 'thiếu src/core/services/locHtml.ts');
  else {
    const n = doc(P);
    /* Danh sách cấm luôn thua: kẻ tấn công chỉ cần tìm một thứ chưa ai nghĩ
       tới. Bộ lọc phải kể tên thứ được GIỮ, và bỏ mọi thứ còn lại. */
    if (!/THE_CHO_PHEP|new Set\(/.test(n)) truot('bộ lọc dùng danh sách cho phép', 'không thấy danh sách thẻ được giữ');
    else dat('bộ lọc dùng danh sách cho phép, không phải danh sách cấm');
    /* Regex trên HTML lách được bằng `<img/src=x>`, `<IMG SRC=x>`, thẻ lồng…
       Phải dùng bộ phân tích HTML thật của trình duyệt. */
    if (!n.includes("createElement('template')")) truot('bộ lọc dùng bộ phân tích của trình duyệt', 'không thấy <template> — regex trên HTML luôn lách được');
    else dat('bộ lọc dùng <template>, không phải regex');
    if (!/getAttributeNames|removeAttribute/.test(n)) truot('bộ lọc bỏ hết thuộc tính', 'không thấy chỗ gỡ thuộc tính — onerror/onload sẽ sống sót');
    else dat('bộ lọc bỏ hết thuộc tính');
  }
}

console.log('\n== Nghe tin nhắn giữa khung phải kiểm nguồn gửi ==');
{
  /* Trò chơi chạy trong iframe và nói chuyện với web bằng postMessage. Handler
     không kiểm `e.origin` thì trang bất kỳ nhúng được app cũng gửi tin vào
     được — kể cả tin xin mở chế độ thử vốn chỉ dành cho quản trị. */
  const thieu: string[] = [];
  let so = 0;
  for (const f of tepNguon) {
    const n = doc(f);
    if (!n.includes("addEventListener('message'")) continue;
    for (const m of n.matchAll(/const (\w+)\s*=\s*(?:async\s*)?\((\w+)[^)]*\)\s*=>\s*\{([\s\S]{0,400})/g)) {
      const [, hamTen, bien, than] = m;
      if (!n.includes(`addEventListener('message', ${hamTen})`)) continue;
      so++;
      if (!than.includes(`${bien}.origin`)) thieu.push(`${ten(f)}: ${hamTen}()`);
    }
  }
  if (so === 0) dat('không có handler message nào');
  else if (thieu.length) truot('mọi handler message đều kiểm e.origin', thieu.join(' | '));
  else dat(`cả ${so} handler message đều kiểm e.origin`);
}

console.log('\n== Không có cửa chạy mã động ==');
{
  const pham: string[] = [];
  for (const f of tepNguon) {
    doc(f).split(/\r?\n/).forEach((d, i) => {
      if (d.trimStart().startsWith('*') || d.trimStart().startsWith('//')) return;
      if (/(?<![.\w])eval\(|new Function\(/.test(d)) pham.push(`${ten(f)}:${i + 1}`);
    });
  }
  if (pham.length) truot('không dùng eval / new Function', pham.join(', '));
  else dat('không dùng eval / new Function');
}

console.log('\n== Header bảo mật khi phát hành ==');
{
  const P = join(GOC, 'public/_headers');
  const CAN = [
    ['X-Content-Type-Options', 'trình duyệt tự đoán kiểu tệp là một đường tấn công'],
    ['X-Frame-Options', 'chặn nhúng vào iframe site khác để lừa bấm'],
    ['Referrer-Policy', 'đừng rò đường dẫn nội bộ sang site ngoài'],
    ['Permissions-Policy', 'tắt sẵn camera/mic/định vị — app không dùng tới'],
    ['Content-Security-Policy', 'hàng rào thứ hai nếu bộ lọc HTML thủng'],
  ];
  if (!existsSync(P)) truot('có tệp public/_headers', 'thiếu tệp');
  else {
    /* CHỈ đọc dòng khai header thật, bỏ dòng chú thích (`#`). Bản đầu của phép
       kiểm này `includes()` cả tệp, nên khi thử gỡ hẳn `X-Frame-Options` nó vẫn
       báo ĐẠT — vì chính phần chú thích bên trên có nhắc tên header đó. Một
       phép kiểm đọc cả lời giải thích về hàng rào thay vì đọc hàng rào. */
    const n = doc(P).split(/\r?\n/).filter(d => !d.trimStart().startsWith('#')).join('\n');
    const thieu = CAN.filter(([h]) => !new RegExp(`^\\s*${h}\\s*:`, 'm').test(n)).map(([h, vs]) => `${h} (${vs})`);
    if (thieu.length) truot('đủ header bảo mật', thieu.join(' | '));
    else dat(`đủ ${CAN.length} header bảo mật`);
    /* `_headers` của Netlify chỉ áp cho đường dẫn được liệt kê. Thiếu mục `/*`
       thì header viết ra mà không phủ trang nào cả. */
    if (!/^\/\*\s*$/m.test(n)) truot('header bảo mật phủ mọi đường dẫn', 'thiếu mục `/*` — Netlify chỉ áp header cho đường dẫn được liệt kê');
    else dat('header bảo mật phủ mọi đường dẫn (/*)');

    /* Chống nhúng phải là SAMEORIGIN, không phải DENY — nếu app tự nhúng chính
       mình. `DENY` và `frame-ancestors 'none'` cấm MỌI trang nhúng, kể cả cùng
       nguồn. Bản đầu để `DENY` đã lên production ngày 10/09/2026 và làm toàn bộ
       bài giảng lẫn trò chơi hiện ra ô trống mang biểu tượng cấm.
       `frame-src 'self'` không cứu được: nó nói trang CHA được nhúng ai, còn hai
       thứ dưới đây nói trang CON cho ai nhúng mình. */
    const soKhung = tepNguon.filter(f => doc(f).includes('<iframe')).length;
    if (soKhung === 0) dat('app không tự nhúng khung — DENY là đúng');
    else {
      const xfo = n.match(/^\s*X-Frame-Options\s*:\s*(\S+)/m)?.[1];
      const to = n.match(/frame-ancestors\s+'([a-z]+)'/)?.[1];
      const hong: string[] = [];
      if (xfo === 'DENY') hong.push(`X-Frame-Options: DENY (phải là SAMEORIGIN)`);
      if (to === 'none') hong.push(`frame-ancestors 'none' (phải là 'self')`);
      if (hong.length) truot(`app nhúng khung cùng nguồn ở ${soKhung} tệp — header phải cho phép`, hong.join(' | '));
      else dat(`app nhúng khung ở ${soKhung} tệp, và header cho phép cùng nguồn`);
    }
  }
}

console.log('\n== Trang tĩnh sống được dưới CSP ==');
{
  /* Sáu trang tĩnh trong `public/` (trang bài giảng + năm trò chơi) dựng HOÀN
     TOÀN bằng script nội tuyến. `script-src 'self'` chặn sạch chúng — ngày
     10/09/2026 chuyện này đã lên tới production và giết cả sáu trang.
     Cách chữa là băm sha256 từng đoạn lúc dựng (`scripts/bam-csp.mts`), KHÔNG
     phải thêm 'unsafe-inline' — từ khoá đó bật lại cả `<img onerror=…>`. */
  const tepHtml = existsSync(join(GOC, 'public'))
    ? moiTep(join(GOC, 'public'), ['.html'])
    : [];
  const coNoiTuyen = tepHtml.filter(f =>
    [...doc(f).matchAll(/<script\b([^>]*)>/gi)].some(m => !/\bsrc\s*=/i.test(m[1])));

  if (coNoiTuyen.length === 0) dat('không trang tĩnh nào dùng script nội tuyến');
  else {
    /* 1. Bước băm phải còn trong lệnh build. Gỡ nó ra thì hash biến mất khỏi
          CSP và các trang chết IM LẶNG — build vẫn xanh, chỉ production hỏng. */
    const pkg = doc(join(GOC, 'package.json'));
    const lenhBuild = JSON.parse(pkg).scripts?.build ?? '';
    if (!lenhBuild.includes('bam-csp')) {
      truot(`${coNoiTuyen.length} trang tĩnh dùng script nội tuyến — build phải chạy bam-csp`,
        `lệnh build hiện là "${lenhBuild}" — thiếu bước băm, CSP sẽ chặn hết các trang này`);
    } else dat(`build có chạy bam-csp cho ${coNoiTuyen.length} trang tĩnh`);

    /* 2. Hash chỉ cứu được script nội tuyến. Bốn thứ dưới đây thì không, và
          chúng sẽ chết dưới CSP dù có băm bao nhiêu lần. */
    const cam: [RegExp, string][] = [
      [/<[a-z][^>]*?\son[a-z]+\s*=/gi, 'thuộc tính on…= nội tuyến (cần unsafe-hashes)'],
      [/(?<![.\w])eval\s*\(|new\s+Function\s*\(/g, 'eval / new Function (cần unsafe-eval)'],
      [/set(?:Timeout|Interval)\s*\(\s*['"`]/g, 'setTimeout("chuỗi") (cần unsafe-eval)'],
      [/(?:href|src)\s*=\s*['"]javascript:/gi, 'URL javascript:'],
    ];
    /* Bỏ chú thích trước khi soi. Bản đầu quét cả tệp, và mục này ĐỎ ngay lần
       chạy đầu — vì chính chú thích giải thích lỗ hổng có viết ví dụ
       `<img src=x onerror=…>`. Một phép kiểm đọc lời cảnh báo về mối nguy rồi
       báo động vì chính lời cảnh báo đó. Cùng bài học với bộ đếm mã màu cứng. */
    const boChuThich = (n: string) => n
      .replace(/<!--[\s\S]*?-->/g, ' ')        // chú thích HTML
      .replace(/\/\*[\s\S]*?\*\//g, ' ')       // chú thích khối JS
      .replace(/(?<![:\w])\/\/[^\n]*/g, ' ');  // chú thích dòng JS, chừa https://

    const pham: string[] = [];
    for (const f of coNoiTuyen) {
      const n = boChuThich(doc(f));
      for (const [re, vi] of cam) {
        const so = [...n.matchAll(re)].length;
        if (so) pham.push(`${ten(f)}: ${so} × ${vi}`);
      }
    }
    if (pham.length) truot('trang tĩnh không dùng thứ mà hash không cứu được', pham.join(' | '));
    else dat('trang tĩnh không có on…= / eval / javascript: — hash là đủ');
  }
}

console.log('\n== Đăng nhập phải qua Firebase Auth ==');
{
  /* Ba phép kiểm này canh cho đợt chuyển 10/09/2026 không bị lùi lại.
     Lỗ hổng cũ: `users` lưu mật khẩu dạng chữ thường và `firestoreAuth.ts` so
     sánh ngay trên trình duyệt. Mà `users` PHẢI cho đọc công khai để việc đó
     chạy được, nên bất kỳ ai cũng tải về được mật khẩu của mọi người. */
  const boChuThich = (n: string) => n
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(?<![:\w])\/\/[^\n]*/g, ' ');

  /* 1. Không còn chỗ nào so sánh mật khẩu bằng chuỗi. */
  const pham: string[] = [];
  for (const f of tepNguon) {
    const n = boChuThich(doc(f));
    if (/\.password\s*!==\s*password|password\s*!==\s*\w+\.password/.test(n)) pham.push(ten(f));
  }
  if (pham.length) truot('không so sánh mật khẩu trên trình duyệt', pham.join(', '));
  else dat('không so sánh mật khẩu trên trình duyệt');

  /* 2. Không mang mật khẩu đi trong dữ liệu nữa.
        Bản đầu của phép kiểm này (viết trong kế hoạch) chỉ soi ba lệnh
        `setDoc|addDoc|updateDoc` gọi TRỰC TIẾP. Chạy thử mới thấy nó mù: dự án
        ghi mật khẩu qua hàm bọc `FirestoreService.updateUserById(...)`, và còn
        dựng `password` vào object User ở hàng chục chỗ trong AppContext. Sau
        khi viết lại `firestoreAuth.ts`, phép kiểm hẹp đó sẽ XANH trong khi
        mật khẩu vẫn chạy khắp nơi — đúng loại "xanh nhầm" mà mục Rút kinh
        nghiệm của CLAUDE.md cảnh báo.
        Nay dùng bất biến rộng và dễ kiểm: `password` KHÔNG được làm khoá của
        object ở bất kỳ đâu trong `src/`. Khai kiểu (`password?: string`) thì
        không tính — đó là mô tả, không phải dữ liệu chạy. */
  const mang: string[] = [];
  for (const f of tepNguon) {
    boChuThich(doc(f)).split(/\r?\n/).forEach((d, i) => {
      if (!/(^|[{,(\s])password\s*:/.test(d)) return;
      if (/password\s*\??\s*:\s*(string|boolean|number)\b/.test(d)) return;  // khai kiểu
      mang.push(`${ten(f)}:${i + 1}`);
    });
  }
  if (mang.length) truot(`không mang mật khẩu trong dữ liệu (${mang.length} chỗ)`, mang.slice(0, 8).join(', ') + (mang.length > 8 ? ` …và ${mang.length - 8} chỗ nữa` : ''));
  else dat('không mang mật khẩu trong dữ liệu');

  /* 3. `firestoreAuth.ts` phải thật sự GỌI Firebase Auth.
        Bỏ chú thích trước khi soi, và đòi thấy dấu `(` ngay sau tên hàm. Bản
        đầu viết `n.includes(ten)` trên cả tệp, nên chỉ cần ba cái tên đó nằm
        trong một dòng chú thích là ĐẠT — mà chính tệp này có chú thích dài kể
        về đợt chuyển. Lại đúng cái bẫy "đọc lời giải thích về hàng rào thay vì
        đọc hàng rào" đã vấp hai lần ngày 10/09/2026. */
  const P = join(GOC, 'src/core/services/firestoreAuth.ts');
  if (!existsSync(P)) truot('có firestoreAuth.ts', 'thiếu tệp');
  else {
    const n = boChuThich(doc(P));
    const can = ['signInWithEmailAndPassword', 'createUserWithEmailAndPassword', 'sendPasswordResetEmail'];
    const thieu = can.filter(h => !new RegExp(`\\b${h}\\s*\\(`).test(n));
    if (thieu.length) truot('firestoreAuth.ts dùng Firebase Auth', 'thiếu: ' + thieu.join(', '));
    else dat('firestoreAuth.ts dùng Firebase Auth');
  }
}

console.log('\n== Luật phân quyền Firestore nằm trong git ==');
{
  /* Luật Firestore là thứ DUY NHẤT đứng giữa Internet và dữ liệu. Để nó chỉ
     sống trong bảng điều khiển Firebase thì không ai soát được, không có lịch
     sử thay đổi, và một lần nới lỏng nhầm sẽ nằm im không ai biết. */
  const R = join(GOC, 'firestore.rules');
  if (!existsSync(R)) truot('có tệp firestore.rules trong repo', 'luật đang sống ngoài git, không ai soát được');
  else {
    dat('firestore.rules nằm trong git');
    const fb = join(GOC, 'firebase.json');
    if (existsSync(fb) && !doc(fb).includes('"rules"')) {
      truot('firebase.json trỏ tới firestore.rules', 'có tệp luật nhưng firebase.json không khai — `firebase deploy` sẽ bỏ qua nó');
    } else dat('firebase.json có khai rules');
  }
}

console.log('\n== Không lộ bí mật trong mã nguồn ==');
{
  /* Khoá web của Firebase KHÔNG phải bí mật (nó vốn nằm trong gói JS ai cũng
     đọc được — an toàn dựa vào Firestore Rules). Nhưng khoá Gemini thì có: nó
     tính tiền theo lượt gọi. */
  const pham: string[] = [];
  for (const f of tepNguon) {
    /* Khoá web của Firebase CỐ Ý nằm trong git — nó vốn nằm trong gói JS ai cũng
       đọc được, và an toàn dựa vào Firestore Rules. Xem chú thích đầu tệp
       firebaseCongKhai.ts. Miễn theo TÊN TỆP, không theo nội dung dòng: bản đầu
       của phép kiểm này viết `!d.includes('firebaseCongKhai')`, tức nó soi
       chính DÒNG chứa khoá — mà dòng đó chỉ có khoá, không có tên tệp. */
    if (basename(f) === 'firebaseCongKhai.ts') continue;
    doc(f).split(/\r?\n/).forEach((d, i) => {
      if (/AIza[0-9A-Za-z_-]{30,}/.test(d)) {
        pham.push(`${ten(f)}:${i + 1}`);
      }
    });
  }
  if (pham.length) truot('không có khoá API viết cứng trong src/', pham.join(', '));
  else dat('không có khoá API viết cứng trong src/');
}

console.log(soLoi === 0 ? '\n>>> TẤT CẢ ĐẠT\n' : `\n>>> CÓ ${soLoi} MỤC KHÔNG ĐẠT\n`);
process.exit(soLoi === 0 ? 0 : 1);
