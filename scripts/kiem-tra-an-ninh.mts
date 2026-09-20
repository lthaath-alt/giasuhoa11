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
import { fileURLToPath } from 'node:url';

/* fileURLToPath, không phải .pathname: .pathname còn nguyên mã hoá URL, nên
 * đường dẫn có dấu cách hoặc chữ tiếng Việt (NCKH%202026, gia-s%C6%B0…) thành
 * thư mục không tồn tại và cả bộ kiểm không đọc được tệp nguồn nào. */
const GOC = fileURLToPath(new URL('..', import.meta.url));

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
  /* Xoá chú thích nhưng GIỮ NGUYÊN số dòng: thay từng ký tự bằng dấu cách chứ
     không thay cả khối bằng một dấu cách. Bản đầu làm cách sau, nên một khối
     `/* … *​/` mười dòng co lại còn một dòng và mọi số dòng phía sau lệch đi —
     phép kiểm chỉ đúng chỗ nào SAI, còn chỉ sai chỗ nào ĐANG sai. Đã đâm vào
     đúng bẫy đó khi đi sửa 10 chỗ còn lại. */
  const boChuThich = (n: string) => n
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/(?<![:\w])\/\/[^\n]*/g, m => ' '.repeat(m.length));

  /* 1. Không còn chỗ nào so sánh mật khẩu bằng chuỗi. */
  const pham: string[] = [];
  for (const f of tepNguon) {
    const n = boChuThich(doc(f));
    if (/\.password\s*!==\s*password|password\s*!==\s*\w+\.password/.test(n)) pham.push(ten(f));
  }
  if (pham.length) truot('không so sánh mật khẩu trên trình duyệt', pham.join(', '));
  else dat('không so sánh mật khẩu trên trình duyệt');

  /* 2. Kiểu `User` KHÔNG được có trường `password`.
        Đây là hàng rào MẠNH NHẤT của cả đợt, và nó do trình biên dịch giữ chứ
        không do regex: bỏ trường khỏi kiểu thì mọi chỗ còn mang mật khẩu đi
        đều thành lỗi biên dịch. Ngày 10/09/2026 nó chỉ ra đúng 6 chỗ mà regex
        vừa báo thừa vừa bỏ sót. Phép kiểm này chỉ canh cho không ai lặng lẽ
        thêm trường đó trở lại. */
  {
    const P = join(GOC, 'src/features/auth/types.ts');
    const n = boChuThich(doc(P));
    const co = /^\s*password\s*\??\s*:/m.test(n);
    if (co) truot('kiểu User không có trường password', 'trường đó vừa quay lại — trình biên dịch hết canh được mật khẩu');
    else dat('kiểu User không có trường password');
  }

  /* 3. Không ghi mật khẩu xuống Firestore, và `firestoreService` không đụng tới.
        CHÚ Ý phân biệt hai việc dễ lẫn:
          - TRUYỀN mật khẩu vào `createAccountWithFirestore(...)` là ĐÚNG — nó
            chuyển tiếp cho `createUserWithEmailAndPassword` của Firebase Auth.
          - GHI mật khẩu xuống Firestore là SAI, vì `users` phải cho đọc công
            khai nên ghi xuống đó là ai cũng đọc được.
        Bản trước của phép kiểm này cấm `password` làm khoá object ở MỌI nơi,
        nên nó báo đỏ cả 6 chỗ truyền vào Auth — một phép kiểm đỏ vĩnh viễn thì
        người ta sẽ học cách phớt lờ nó. */
  const GHI = /(setDoc|addDoc|updateDoc|updateUserById|addUser|updateUser)\s*\([\s\S]{0,300}?\)/g;
  const ghiPham: string[] = [];
  for (const f of tepNguon) {
    const n = boChuThich(doc(f));
    for (const m of n.matchAll(GHI)) {
      if (!/(^|[{,\s])password\s*[,:]/.test(m[0])) continue;
      ghiPham.push(`${ten(f)}: ${m[1]}(…)`);
    }
  }
  const dinhTrongService = /password/.test(boChuThich(doc(join(GOC, 'src/core/services/firestoreService.ts'))));
  if (dinhTrongService) ghiPham.push('firestoreService.ts còn nhắc tới password — tệp này không được đụng tới mật khẩu');
  if (ghiPham.length) truot('không ghi mật khẩu xuống Firestore', [...new Set(ghiPham)].join(' | '));
  else dat('không ghi mật khẩu xuống Firestore');

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

console.log('\n== Luật Firestore phân quyền theo vai ==');
{
  /* Ba phép kiểm canh cho đợt 2 không bị lùi lại. Luật lỏng KHÔNG làm app vỡ —
     nó chỉ lặng lẽ cho phép mọi thứ, nên phải có phép kiểm nhìn thay người. */
  const R = join(GOC, 'firestore.rules');
  const luat = existsSync(R)
    ? doc(R).split(/\r?\n/).filter(d => !d.trimStart().startsWith('//')).join('\n')
    : '';

  /* 1. Không còn cửa mở toang.
        `allow read: if true` là HỢP LỆ và cần thiết ở `bank_questions` — đồng
        bộ đêm đọc Firestore không đăng nhập. Nên chỉ đếm những dòng cho GHI. */
  const moToang = [...luat.matchAll(/allow[^:]*:\s*if\s+true\s*;/g)].length;
  const chiDoc = [...luat.matchAll(/allow\s+read\s*:\s*if\s+true\s*;/g)].length;
  const ghiToang = moToang - chiDoc;
  if (!existsSync(R)) truot('có firestore.rules', 'thiếu tệp');
  else if (ghiToang > 0) truot('không còn `allow write: if true`', `${ghiToang} chỗ vẫn cho ghi tự do`);
  else dat('không còn `allow write: if true`');

  /* 2. Mọi collection mã nguồn có GHI đều phải có mục `match` riêng.
        Thêm collection mới mà quên viết luật thì nó rơi vào mục cấm tất ở cuối
        tệp và hỏng IM LẶNG — phép kiểm này bắt trước khi chuyện đó xảy ra. */
  const hang: Record<string, string> = {};
  for (const f of tepNguon) {
    for (const m of doc(f).matchAll(/\b(COL_[A-Z_]+)\s*=\s*['"]([^'"]+)['"]/g)) hang[m[1]] = m[2];
  }
  const dungToi = new Set<string>(Object.values(hang));
  for (const f of tepNguon) {
    for (const m of doc(f).matchAll(/collection\(\s*db\s*,\s*['"]([^'"]+)['"]/g)) dungToi.add(m[1]);
  }
  const thieuLuat = [...dungToi].filter(c => !new RegExp(`match\\s+/${c}/`).test(luat));
  if (thieuLuat.length) truot('mọi collection đều có luật riêng', 'thiếu: ' + thieuLuat.join(', '));
  else dat(`cả ${dungToi.size} collection đều có luật riêng`);

  /* 3. MỌI tên trường luật nhắc tới phải THẬT SỰ tồn tại trong mã.
        Đây đúng là cái bẫy đã sập ở đợt 1: luật nhắm `content`/`explanation`/
        `options` trong khi Firestore lưu `q`/`e`/`o`, nên mệnh đề
        `!('content' in d) || …` LUÔN đúng và luật cho qua mọi tải trọng —
        vẫn "đạt" mọi phép thử kiểu "câu hỏi sạch vẫn ghi được".

        Bản đầu của phép kiểm này chỉ dò một DANH SÁCH CỐ ĐỊNH ba tên trường,
        nên thử bịa ra một tên khác thì nó không thấy — tức nó sẽ không bắt
        được chính cái bẫy nó sinh ra để bắt. Nay rút tên trường ra từ chính
        luật rồi mới đối chiếu. */
  const truongTrongLuat = new Set<string>();
  for (const m of luat.matchAll(/\b(?:request\.)?resource\.data\.([A-Za-z_]\w*)/g)) truongTrongLuat.add(m[1]);
  for (const m of luat.matchAll(/['"]([A-Za-z_]\w*)['"]\s+in\s+(?:request\.)?resource\.data/g)) truongTrongLuat.add(m[1]);
  /* `cauHoiSach()` gán `let d = request.resource.data;` rồi dùng `d.q`,
     `'o' in d`… Hai mẫu trên đòi chữ `resource.data` đứng ngay trước nên
     KHÔNG thấy nhóm trường của bank_questions — tức phép kiểm sinh ra từ bài
     học đợt 1 lại mù với đúng nhóm trường đó. Đo ngày 12/09/2026: nó đếm 6 tên
     và không tên nào là q/e/o/st/ansText/img. */
  for (const m of luat.matchAll(/\blet\s+(\w+)\s*=\s*(?:request\.)?resource\.data\s*;/g)) {
    const biDanh = m[1];
    for (const t of luat.matchAll(new RegExp(`\\b${biDanh}\\.([A-Za-z_]\\w*)`, 'g'))) truongTrongLuat.add(t[1]);
    for (const t of luat.matchAll(new RegExp(`['"]([A-Za-z_]\\w*)['"]\\s+in\\s+${biDanh}\\b`, 'g'))) truongTrongLuat.add(t[1]);
  }
  /* Tên trường còn nấp trong affectedKeys().hasAny([...]) / .hasOnly([...]) /
     .hasAll([...]) — hai mẫu trên không thấy chúng. Cửa này mở ngày 12/09/2026
     cùng luật `users` mới; không mở mẫu theo thì gõ sai tên trường ở đó là
     luật im lặng cho qua, đúng cái bẫy đã sập ở đợt 1. */
  for (const m of luat.matchAll(/\.has(?:Any|Only|All)\(\s*\[([^\]]*)\]/g)) {
    for (const t of m[1].matchAll(/['"]([A-Za-z_]\w*)['"]/g)) truongTrongLuat.add(t[1]);
  }
  /* `role` do luật đọc qua get(...).data.role, không khớp hai mẫu trên. */
  if (/\.data\.role\b/.test(luat)) truongTrongLuat.add('role');

  /* So bằng RANH GIỚI TỪ (`\b…\b`), không phải `.includes()` thô. Tên trường
     ngắn (1-2 ký tự như `o`, `st`) là substring của vô số danh tính khác
     trong mã (`root`, `Tooltip`, `SchoolAdminRoute`…), nên `.includes()` luôn
     "tìm thấy" chúng dù trường đó không có thật — đúng cái bẫy phép kiểm này
     sinh ra để bắt. Phát hiện ngày 12/09/2026: cố tình đổi `'o' in d` thành
     `'oo' in d` để phá hoại — bản `.includes()` cũ vẫn báo ĐẠT vì "oo" là
     substring tình cờ của `root`/`Tooltip`/`SchoolAdminRoute`. */
  const khongCoThat = [...truongTrongLuat].filter(t =>
    !tepNguon.some(f => new RegExp(`\\b${t}\\b`).test(doc(f)))
  );
  if (!truongTrongLuat.size) truot('luật kiểm bằng tên trường có thật', 'luật không nhắc trường nào — chưa siết?');
  else if (khongCoThat.length) truot('luật kiểm bằng tên trường có thật', 'không có trong mã: ' + khongCoThat.join(', '));
  else dat(`cả ${truongTrongLuat.size} tên trường luật nhắc tới đều có thật trong mã`);
}

console.log('\n== Không lộ bí mật trong mã nguồn và bản dựng ==');
{
  /* Khoá web của Firebase KHÔNG phải bí mật (nó vốn nằm trong gói JS ai cũng
     đọc được — an toàn dựa vào Firestore Rules). Nhưng khoá Gemini thì có.

     Ngày 13/09/2026 phép kiểm cũ báo ĐẠT trong khi key Gemini nằm nguyên văn
     trên Netlify, vì nó mù ba chỗ: chỉ biết mẫu `AIza` (key cấp từ 2026 bắt
     đầu bằng `AQ.`), chỉ soi `src/` (key đi vào gói JS qua biến môi trường
     VITE_, không hề nằm trong mã), và không cấm đọc biến đó. */
  const MAU_KEY = /AIza[0-9A-Za-z_-]{30,}|AQ\.[0-9A-Za-z_-]{20,}/g;
  const khoaFirebase = doc(join(GOC, 'src/core/services/firebaseCongKhai.ts'));

  const pham: string[] = [];
  for (const f of tepNguon) {
    /* Khoá web của Firebase CỐ Ý nằm trong git — nó vốn nằm trong gói JS ai cũng
       đọc được, và an toàn dựa vào Firestore Rules. Xem chú thích đầu tệp
       firebaseCongKhai.ts. Miễn theo TÊN TỆP, không theo nội dung dòng: bản đầu
       của phép kiểm này viết `!d.includes('firebaseCongKhai')`, tức nó soi
       chính DÒNG chứa khoá — mà dòng đó chỉ có khoá, không có tên tệp. */
    if (basename(f) === 'firebaseCongKhai.ts') continue;
    doc(f).split(/\r?\n/).forEach((d, i) => {
      if (new RegExp(MAU_KEY.source).test(d)) {
        pham.push(`${ten(f)}:${i + 1}`);
      }
    });
  }
  if (pham.length) truot('không có khoá API viết cứng trong src/', pham.join(', '));
  else dat('không có khoá API viết cứng trong src/');

  /* Mọi biến `VITE_*` đều bị Vite chép nguyên văn vào gói JS. Key Gemini mà
     đi qua đó là lộ, bất kể `.env.local` có nằm trong .gitignore hay không. */
  const docBien = tepNguon.filter(f => /VITE_GEMINI_API_KEY|import\.meta\.env\.GEMINI_API_KEY/.test(doc(f)));
  if (docBien.length) truot('mã trình duyệt không đọc key Gemini từ biến môi trường', docBien.map(ten).join(', '));
  else dat('mã trình duyệt không đọc key Gemini từ biến môi trường');

  const DIST = join(GOC, 'dist');
  if (!existsSync(DIST)) {
    dat('chưa có dist/ — bỏ qua phép quét bản dựng');
  } else {
    const lo = new Set<string>();
    for (const f of moiTep(DIST, ['.js', '.html'])) {
      for (const m of doc(f).matchAll(MAU_KEY)) if (!khoaFirebase.includes(m[0])) lo.add(ten(f));
    }
    if (lo.size) truot('dist/ không chứa key Google nào ngoài khoá Firebase công khai', [...lo].join(', ') + ' — build lại rồi chạy lại');
    else dat('dist/ không chứa key Google nào ngoài khoá Firebase công khai');
  }
}

console.log('\n== Email chủ dự án khớp giữa luật và mã ==');
{
  /* Vì sao cần phép kiểm này: `laChuDuAn()` trong luật là hàng rào THẬT, còn
     hằng trong `src/` chỉ để quyết định vẽ hay không vẽ nút. Lệch nhau thì
     người dùng thấy nút mà bấm vào bị từ chối, hoặc tệ hơn là không thấy nút
     dù có quyền — và build vẫn xanh.

     Từ 16/09/2026 soi thêm nơi thứ BA: nhân vật `chu` trong bộ kiểm luật.
     Lệch ở đó thì phép 9 ("chủ dự án đặt vai") sẽ đỏ trên CI — nhưng đỏ
     chậm (sau khi push) và đỏ khó hiểu, mà máy thiếu Java thì vẫn xanh vì
     `kiem-tra:luat` tự bỏ qua. Phép kiểm này chạy ở mọi máy, tức thì, và
     gọi đúng tên chỗ lệch. */
  const NOI = [
    { ten: 'firestore.rules (laChuDuAn)',
      tep: 'firestore.rules',
      mau: /function\s+laChuDuAn\s*\(\s*\)[\s\S]{0,200}?email\(\)\s*==\s*'([^']+)'/ },
    { ten: 'quanTri.ts (EMAIL_CHU_DU_AN)',
      tep: 'src/core/services/quanTri.ts',
      mau: /EMAIL_CHU_DU_AN\s*=\s*'([^']+)'/ },
    { ten: 'kiem-tra-luat.mts (nhân vật chu)',
      tep: 'scripts/kiem-tra-luat.mts',
      mau: /\bchu\s*:\s*\{[^}]*?email\s*:\s*'([^']+)'/ },
  ];

  const TEN = 'email chủ dự án khớp ở cả ba nơi';
  const daDoc: { ten: string; email: string }[] = [];
  let hong = false;
  for (const n of NOI) {
    const d = join(GOC, n.tep);
    if (!existsSync(d)) { truot(TEN, `thiếu ${n.tep}`); hong = true; break; }
    const m = n.mau.exec(readFileSync(d, "utf8"));
    if (!m) { truot(TEN, `không đọc được email ở ${n.ten}`); hong = true; break; }
    daDoc.push({ ten: n.ten, email: m[1] });
  }
  if (!hong) {
    const khac = daDoc.filter(d => d.email !== daDoc[0].email);
    if (khac.length) {
      truot(TEN, daDoc.map(d => `${d.ten} nói "${d.email}"`).join("; "));
    } else {
      dat(`${TEN} — ${daDoc[0].email}`);
    }
  }
}

/* ── Khoá Gemini riêng của học sinh (20/09/2026) ────────────────────────────
   Khoá do chính em gõ vào, tính tiền theo tài khoản Google của em. Nó chỉ được
   nằm trong `localStorage` của máy em: đẩy lên Firestore là biến bí mật cá
   nhân thành dữ liệu dùng chung, in ra console hay nhật ký lỗi là ai mượn máy
   cũng đọc được. Khác hẳn lỗ hổng 13/09/2026 (khoá nằm trong gói JS đã dựng) —
   chỗ đó vẫn do các phép kiểm bên trên canh. */
console.log('\n== Khoá riêng của học sinh không rời khỏi máy em ==');
{
  const TEP_KEY = 'src/features/tutor/services/keyRieng.ts';
  const TEP_GOI = 'src/features/tutor/services/giaSuKeyRieng.ts';
  const maKey = doc(TEP_KEY);

  if (!/localStorage/.test(maKey)) truot('khoá riêng cất trong localStorage', 'không thấy localStorage');
  else dat('khoá riêng cất trong localStorage');

  const ghiXa = /setDoc\(|addDoc\(|updateDoc\(|collection\(/;
  const cho = [TEP_KEY, TEP_GOI].filter(f => ghiXa.test(doc(f)));
  if (cho.length) truot('khoá riêng KHÔNG bị ghi ra Firestore', cho.join(', '));
  else dat('khoá riêng KHÔNG bị ghi ra Firestore');

  /* Bắt cả `console.log(key)` lẫn `console.log('...', apiKey)`. */
  const inRa = /console\.(log|warn|error|info)\([^)]*\b(key|apiKey|khoa)\b/i;
  const choIn = [TEP_KEY, TEP_GOI].filter(f => inRa.test(doc(f)));
  if (choIn.length) truot('khoá riêng KHÔNG bị in ra console', choIn.join(', '));
  else dat('khoá riêng KHÔNG bị in ra console');

  /* Nhật ký lỗi gửi lên Firestore, nên tuyệt đối không được mang khoá theo. */
  const maGiaSu = doc('src/features/tutor/services/geminiTutorService.ts');
  const logCoKey = /logError\(\{[\s\S]{0,400}?\b(key|apiKey)\b/i.test(maGiaSu);
  if (logCoKey) truot('nhật ký lỗi không mang theo khoá', 'geminiTutorService.ts');
  else dat('nhật ký lỗi không mang theo khoá');
}

console.log(soLoi === 0 ? '\n>>> TẤT CẢ ĐẠT\n' : `\n>>> CÓ ${soLoi} MỤC KHÔNG ĐẠT\n`);
process.exit(soLoi === 0 ? 0 : 1);
