/**
 * Nhờ Gemini soi lại nội dung hoá học của ngân hàng câu hỏi (20/09/2026).
 *
 * Vì sao có: với đề tài NCKH này, tính đúng đắn của hoá học quan trọng hơn mọi
 * thứ khác, mà 1554 câu thì không ai đọc tay hết được. Gemini đọc nhanh và đọc
 * nhiều; việc của nó ở đây là CHỈ RA CHỖ NGHI NGỜ, không phải phán xử.
 *
 * Bốn điều cố ý, đừng "sửa" thành khác:
 *
 * 1. **Script KHÔNG sửa gì.** Nó chỉ in ra danh sách câu đáng xem lại. Sửa ngân
 *    hàng là việc của người, trên Firestore, sau khi đã tự kiểm chứng. Một mô
 *    hình nói "câu này sai" không phải là bằng chứng câu đó sai.
 * 2. **Chỉ gửi đi nội dung câu hỏi.** Không email, không tên học sinh, không
 *    tiến độ, không gì từ `users`. Dữ liệu rời khỏi máy là rời hẳn.
 * 3. **Đọc bản chụp trong repo**, không đọc Firestore. Giống mọi thứ chạy ngoài
 *    trình duyệt (xem mục "Ngân hàng câu hỏi" trong CLAUDE.md). Muốn soát bản
 *    mới nhất thì `npm run xuat:ngan-hang` trước.
 * 4. **Tự chặn khi vượt hạn mức ngày.** Bậc miễn phí cho 5 lượt/phút và 20
 *    lượt/NGÀY. Soát cả kho tốn hơn 60 lượt, tức quá gấp ba. Script tính trước
 *    số lượt rồi dừng, thay vì chạy được một phần ba rồi chết giữa chừng.
 *
 * Hai đường soát, dùng xen kẽ được:
 *
 *   A. GỌI THẲNG — tiêu hạn mức miễn phí (20 lượt/ngày), tự chạy:
 *        npm run soat:hoa-hoc -- --bai bai-1
 *        npm run soat:hoa-hoc -- --chuong 1 --xem     chỉ tính kế hoạch
 *        npm run soat:hoa-hoc -- --bai bai-1 --lan 1  một lượt (BỎ SÓT, xem dưới)
 *
 *   B. DẪN TAY QUA ANTIGRAVITY — không tốn lượt nào, vì gói trả phí của cá
 *      nhân vẫn dùng được trong Antigravity:
 *        npm run soat:hoa-hoc -- --chuong 2 --xuat-de-dan
 *        (mở tệp đề dẫn trong Antigravity, bảo nó ghi kết quả ra JSON)
 *        npm run soat:hoa-hoc -- --chuong 2 --nap docs/soat-hoa-hoc/tra-loi-....json
 *
 * Cờ khác: --muc nb|th|vd|vdc · --loai mc|tf|tn · --so N · --lo N · --lan N
 *          --model ... · --ra tep.md · --qua cli|key
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, isAbsolute } from 'node:path';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_MODEL_NAME } from '../src/core/constants';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Đường dẫn người dùng đưa vào có thể là tuyệt đối. `join(GOC, ...)` với một
 *  đường tuyệt đối trên Windows cho ra đường rác — đã vấp khi thử `--nap`. */
const duong = (p: string) => (isAbsolute(p) ? p : join(GOC, p));

/* Hạn mức bậc miễn phí, tính cho TỪNG model. Xem scripts/README.md. */
const LUOT_MOI_NGAY = 20;
const GIAY_NGHI_GIUA_HAI_LUOT = 13;   // 5 lượt/phút → cách nhau ít nhất 12s

// ── Đọc tham số ────────────────────────────────────────────────────────────
const dsThamSo = process.argv.slice(2);
const co = (ten: string) => dsThamSo.includes(ten);
const lay = (ten: string) => {
  const i = dsThamSo.indexOf(ten);
  return i >= 0 ? dsThamSo[i + 1] : undefined;
};

const locBai = lay('--bai');
const locChuong = lay('--chuong');
const locMuc = lay('--muc');
const locLoai = lay('--loai');
const soToiDa = Number(lay('--so') || 0);
const moiLo = Number(lay('--lo') || 25);
/* Soát MẤY LƯỢT cho mỗi lô. Mặc định 2, không phải 1 — xem ghi chú ở vòng lặp:
   cùng một lô, cùng temperature 0, ba lượt đo được 3, 3, rồi 0 câu nghi ngờ. */
const soLan = Math.max(1, Number(lay('--lan') || 2));
const model = lay('--model') || GEMINI_MODEL_NAME;
const tepRa = lay('--ra');
const chiXem = co('--xem');
/* Đường dây dẫn tay qua Antigravity: xuất đề dẫn ra tệp, rồi nạp câu trả lời. */
const xuatDeDan = co('--xuat-de-dan');
const napTep = lay('--nap');
/* Hai đường gọi Gemini, khác nhau ở chỗ TIÊU HẠN MỨC CỦA AI:
     cli — qua `gemini` CLI
     key — qua @google/genai với GEMINI_API_KEY
   Cả hai nay đều đi bằng KHOÁ API: Google đã chấm dứt đăng nhập tài khoản cá
   nhân cho CLI từ 18/06/2026, kể cả gói AI Pro và Ultra. Khác nhau còn lại là
   `cli` chạy trong chế độ chỉ đọc của CLI và không cần cài @google/genai. */
let qua = (lay('--qua') || 'cli') as 'cli' | 'key';

// ── Khoá: lấy từ .env.local, TUYỆT ĐỐI không in ────────────────────────────
function docKey(): string {
  for (const ten of ['.env.local', '.env']) {
    try {
      const v = (readFileSync(join(GOC, ten), 'utf8')
        .match(/^\s*GEMINI_API_KEY\s*=\s*(.*)$/m)?.[1] ?? '')
        .trim().replace(/^["']|["']$/g, '');
      /* `.env` trong repo giữ chỗ bằng chuỗi mẫu; đừng gửi nó đi rồi ngồi đoán
         vì sao Google báo "API key not valid". */
      if (v && v !== 'MY_GEMINI_API_KEY') return v;
    } catch { /* không có tệp thì thử tệp sau */ }
  }
  return '';
}

// ── Ngân hàng ──────────────────────────────────────────────────────────────
interface Cau {
  id: string; q: string; e?: string; t?: string; lv?: string;
  ch?: number; lessonId?: string;
  o?: string[]; a?: number;
  st?: { s: string; v: boolean }[];
  ansText?: string; num?: number; tol?: number;
}

function docNganHang(): Cau[] {
  const tho = JSON.parse(readFileSync(join(GOC, 'public/bank/ngan-hang.json'), 'utf8'));
  return Array.isArray(tho) ? tho : (Object.values(tho)[0] as Cau[]);
}

/** Chỉ lấy đúng phần nội dung. Mọi trường khác ở lại trong máy. */
function goiDi(c: Cau) {
  const ra: Record<string, unknown> = { id: c.id, loai: c.t, muc: c.lv, de: c.q };
  if (c.o?.length) ra.phuong_an = c.o.map((t, i) => `${i}. ${t}`);
  if (typeof c.a === 'number') ra.dap_an_dung = c.a;
  if (c.st?.length) ra.y_dung_sai = c.st.map(x => ({ y: x.s, dung: x.v }));
  if (c.ansText) ra.dap_an = c.ansText;
  if (typeof c.tol === 'number') ra.sai_so_cho_phep = c.tol;
  if (c.e) ra.giai_thich = c.e;
  return ra;
}

/**
 * CLI đang đăng nhập kiểu gì. Quyết định có phải dựng hàng rào hạn mức không.
 *
 * Tìm `selectedType` ở BẤT KỲ độ sâu nào thay vì ghim một đường dẫn: bản 0.59
 * để nó ở `security.auth.selectedType`, mà chỗ đó Google đã đổi ít nhất một
 * lần. Ghim cứng thì hôm nó đổi tiếp, hàm này lặng lẽ trả 'khong-ro' — và
 * 'khong-ro' bị hiểu là "đang dùng tài khoản trả phí", tức hàng rào 20
 * lượt/ngày tự tắt. Đã dính đúng bẫy đó khi viết hàm này.
 */
function kieuXacThuc(): string {
  const tim = (o: unknown): string | null => {
    if (!o || typeof o !== 'object') return null;
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      if (k === 'selectedType' && typeof v === 'string') return v;
      const sau = tim(v);
      if (sau) return sau;
    }
    return null;
  };
  try {
    const p = join(homedir(), '.gemini', 'settings.json');
    if (!existsSync(p)) return 'khong-ro';
    return tim(JSON.parse(readFileSync(p, 'utf8'))) ?? 'khong-ro';
  } catch { return 'khong-ro'; }
}

const CAU_LENH = `Bạn là giáo viên Hoá học phổ thông Việt Nam, đang soát lỗi một ngân hàng
câu hỏi Hoá học lớp 11 (chương trình Kết nối tri thức 2018).

Với MỖI câu được đưa, hãy kiểm: đáp án đánh dấu có đúng không; phần giải thích có
mâu thuẫn với đáp án không; công thức, phương trình, đơn vị, số liệu có sai không;
đề có mơ hồ tới mức nhiều phương án cùng đúng không.

QUY TẮC:
- CHỈ nêu câu bạn thực sự nghi có lỗi. Câu đúng thì bỏ qua hoàn toàn.
- Không góp ý về văn phong, cách diễn đạt, hay độ khó. Chỉ nói về ĐÚNG/SAI.
- Nêu rõ vì sao sai, và đúng thì phải thế nào.
- Không chắc thì để "tin" là "thap" — thà báo nhẹ còn hơn khẳng định bừa.

Trả lời DUY NHẤT một mảng JSON, không kèm chữ nào khác, không rào đầu rào cuối:
[{"id":"...","tin":"cao|vua|thap","loi":"sai ở đâu","sua":"nên thế nào"}]
Không có câu nào đáng ngờ thì trả về [].`;

function boRaoJson(s: string): string {
  return s.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
}

const ngu = (ms: number) => new Promise(r => setTimeout(r, ms));

/** Viết báo cáo ra màn hình và ra tệp. Dùng chung cho mọi đường soát. */
function viet(
  ds: Cau[],
  gom: Map<string, { id: string; tin: string; loi: string; sua: string; lan: number }>,
  bac: Record<string, number>,
  soLuot: number,
  nguon: string,
  /** Số lượt gọi HỎNG. Phải vào báo cáo: một lô chỉ chạy được 1/2 lượt thì
   *  phần đó soát nông hơn phần khác, mà nhìn báo cáo không thể biết. */
  soHong = 0,
): void {
  const theoId = new Map(ds.map(c => [c.id, c]));
  /* Xếp câu được NHIỀU lượt cùng nêu lên trước, rồi mới tới nhãn tin. */
  const nghiNgo = [...gom.values()]
    .sort((x, y) => (y.lan - x.lan) || ((bac[x.tin] ?? 3) - (bac[y.tin] ?? 3)));

  const dong: string[] = [
    `# Soát nội dung hoá học — ${new Date().toLocaleDateString('vi-VN')}`,
    '',
    `Soát ${ds.length} câu bằng ${nguon}, mỗi lô ${soLuot} lượt. `
    + `Nghi ngờ: **${nghiNgo.length}** câu.`,
    '',
    ...(soHong > 0 ? [
      `> **SOÁT CHƯA ĐỦ: ${soHong} lượt gọi bị hỏng.** Phần nằm trong các lô đó`,
      '> chỉ được soi ít lượt hơn phần còn lại, nên "không thấy gì" ở đó yếu hơn',
      '> hẳn. Chạy lại đúng phạm vi này khi có hạn mức.',
      '',
    ] : []),
    '> Đây là ý kiến của một mô hình, KHÔNG phải kết luận. Tự kiểm chứng từng chỗ',
    '> trước khi sửa ngân hàng. Và một lượt soát KHÔNG đủ để kết luận "sạch":',
    '> đo 20/09/2026, cùng 16 câu chạy ba lượt cho ra 3, 3, rồi 0 câu nghi ngờ.',
    '',
  ];
  for (const n of nghiNgo) {
    const c = theoId.get(n.id);
    dong.push(`## ${n.id} · ${n.lan}/${soLuot} lượt cùng nêu · mô hình tự chấm: ${n.tin}`, '');
    if (c) dong.push(`**Đề:** ${c.q}`, '');
    dong.push(`**Nghi:** ${n.loi}`, '', `**Đề nghị:** ${n.sua}`, '');
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Xong. ${nghiNgo.length} câu đáng xem lại trong ${ds.length} câu đã soát.`);
  const dem = (t: string) => nghiNgo.filter(n => n.tin === t).length;
  console.log(`  tin cao: ${dem('cao')} · vừa: ${dem('vua')} · thấp: ${dem('thap')}`);
  if (soLuot > 1) {
    const deu = nghiNgo.filter(n => n.lan === soLuot).length;
    console.log(`  cả ${soLuot} lượt cùng nêu: ${deu} câu · chỉ một lượt nêu: ${nghiNgo.length - deu} câu`);
  }

  /* Báo cáo LUÔN ghi ra tệp, mặc định vào docs/soat-hoa-hoc/. Đây là vết của
     quy trình kiểm định nội dung — thứ hội đồng NCKH hỏi tới.
     Tên tệp có cả GIỜ: bản đầu chỉ có ngày, nên lượt soát thứ hai trong ngày
     ghi đè lượt đầu — và đã làm mất một báo cáo có 3 phát hiện thật. Vết mà
     xoá được thì không còn là vết. */
  const luc = new Date();
  const gio = `${String(luc.getHours()).padStart(2, '0')}${String(luc.getMinutes()).padStart(2, '0')}`;
  const ten = tepRa || join('docs/soat-hoa-hoc',
    `${luc.toISOString().slice(0, 10)}-${gio}-${locBai || locChuong || locMuc || 'tat-ca'}.md`);
  mkdirSync(dirname(duong(ten)), { recursive: true });
  writeFileSync(duong(ten), dong.join('\n'), 'utf8');
  console.log(`  đã ghi báo cáo: ${ten}`);
  console.log('\nScript KHÔNG sửa gì trong ngân hàng. Kiểm chứng rồi tự sửa trên Firestore.');
}

/**
 * Gọi qua `gemini` CLI.
 *
 * Ba chi tiết đã trả giá để biết:
 *   - `-p` được NỐI VÀO stdin, nên nhét cả câu lệnh lẫn dữ liệu qua stdin rồi
 *     để `-p` chỉ còn một câu ngắn. Đẩy cả lô vào tham số dòng lệnh là đụng
 *     giới hạn độ dài của Windows.
 *   - `--approval-mode plan` = CHỈ ĐỌC. Gemini CLI vốn có công cụ sửa tệp; cờ
 *     này khoá hết. Con lính đọc được, không viết được.
 *   - `shell: true` trên Windows nối các tham số bằng dấu cách mà KHÔNG tự bọc
 *     nháy, nên tham số nào có dấu cách phải tự bọc — không thì yargs tưởng là
 *     tham số thừa và in nguyên trang trợ giúp ra stderr.
 */
function goiQuaCli(noiDung: string, model: string): string {
  const args = ['--approval-mode', 'plan', '-m', model, '-p', '"Thực hiện đúng yêu cầu ở trên."'];
  const r = spawnSync('gemini', args, {
    input: `${CAU_LENH}

${noiDung}`,
    encoding: 'utf8', shell: true, timeout: 5 * 60 * 1000,
  });
  if (r.status !== 0) throw new Error(`gemini CLI thoát mã ${r.status}: ${(r.stderr || '').trim().slice(-200)}`);
  return r.stdout ?? '';
}

// ── Chạy ───────────────────────────────────────────────────────────────────
async function chay() {
  let ds = docNganHang();
  const tong = ds.length;

  if (locBai) ds = ds.filter(c => c.lessonId === locBai);
  if (locChuong) ds = ds.filter(c => String(c.ch) === locChuong);
  if (locMuc) ds = ds.filter(c => c.lv === locMuc);
  if (locLoai) ds = ds.filter(c => c.t === locLoai);
  if (soToiDa > 0) ds = ds.slice(0, soToiDa);

  if (ds.length === 0) {
    console.error(`Bộ lọc không khớp câu nào (kho có ${tong} câu). Kiểm lại --bai / --chuong / --muc / --loai.`);
    process.exit(1);
  }

  type Nghi = { id: string; tin: string; loi: string; sua: string; lan: number };
  const gom = new Map<string, Nghi>();
  const bac = { cao: 0, vua: 1, thap: 2 } as Record<string, number>;
  const nhan = (mang: Nghi[]) => {
    for (const n of mang) {
      const cu = gom.get(n.id);
      if (cu) {
        cu.lan++;
        /* Giữ lời giải thích của lượt tự tin nhất. */
        if ((bac[n.tin] ?? 3) < (bac[cu.tin] ?? 3)) { cu.tin = n.tin; cu.loi = n.loi; cu.sua = n.sua; }
      } else {
        gom.set(n.id, { ...n, lan: 1 });
      }
    }
  };

  /* ── Đường DÂY DẪN TAY qua Antigravity ────────────────────────────────────
     Gói Gemini trả phí của cá nhân không còn dùng được qua CLI hay API key,
     nhưng VẪN dùng được trong Antigravity. Nên thay vì để script gọi mạng, nó
     xuất ra một tệp đề dẫn; chủ dự án bảo Antigravity đọc tệp đó — repo nằm
     sẵn trong workspace của Antigravity nên không phải dán gì — rồi nạp câu
     trả lời ngược vào đây. Không tốn lượt nào của bậc miễn phí. */
  if (xuatDeDan) {
    const luc0 = new Date();
    const gio0 = `${String(luc0.getHours()).padStart(2, '0')}${String(luc0.getMinutes()).padStart(2, '0')}`;
    const tenDeDan = join('docs/soat-hoa-hoc',
      `de-dan-${luc0.toISOString().slice(0, 10)}-${gio0}-${locBai || locChuong || locMuc || 'tat-ca'}.md`);
    const tenTraLoi = tenDeDan.replace(/^.*[\\/]/, '').replace(/^de-dan-/, 'tra-loi-').replace(/\.md$/, '.json');
    const noi = [
      `# Đề dẫn soát nội dung — ${ds.length} câu`, '',
      `Mở tệp này trong Antigravity rồi bảo nó: *"làm đúng yêu cầu trong tệp,`,
      `ghi kết quả ra \`docs/soat-hoa-hoc/${tenTraLoi}\`"*.`, '',
      `Xong thì nạp lại:  \`npm run soat:hoa-hoc -- --nap docs/soat-hoa-hoc/${tenTraLoi}\``, '',
      '---', '', CAU_LENH, '', '## Dữ liệu', '', '```json',
      JSON.stringify(ds.map(goiDi), null, 1), '```', '',
    ].join('\n');
    mkdirSync(dirname(duong(tenDeDan)), { recursive: true });
    writeFileSync(duong(tenDeDan), noi, 'utf8');
    console.log(`\nĐã ghi đề dẫn ${ds.length} câu: ${tenDeDan}`);
    console.log('KHÔNG gọi mạng, không tốn lượt nào.');
    console.log(`\nBước tiếp: mở tệp đó trong Antigravity, rồi\n`
      + `  npm run soat:hoa-hoc -- --nap docs/soat-hoa-hoc/${tenTraLoi}`);
    return;
  }

  if (napTep) {
    let tho: string;
    try { tho = readFileSync(duong(napTep), 'utf8'); } catch {
      console.error(`Không đọc được tệp trả lời: ${napTep}`);
      process.exit(1);
    }
    /* Antigravity hay bọc JSON trong rào ```json, và đôi khi kèm lời dẫn. Lấy
       mảng JSON đầu tiên tìm được thay vì đòi tệp phải sạch tuyệt đối. */
    const khop = tho.match(/\[[\s\S]*\]/);
    if (!khop) {
      console.error(`Trong ${napTep} không thấy mảng JSON nào.`);
      process.exit(1);
    }
    try { nhan(JSON.parse(khop[0]) as Nghi[]); } catch (e) {
      console.error(`Mảng JSON trong ${napTep} đọc không ra: ${(e as Error).message}`);
      process.exit(1);
    }
    console.log(`\nNạp từ ${napTep}: ${gom.size} câu nghi ngờ, trên ${ds.length} câu trong phạm vi.`);
    viet(ds, gom, bac, 1, 'Antigravity (dẫn tay)');
    return;
  }

  const soLo = Math.ceil(ds.length / moiLo);
  const xacThuc = kieuXacThuc();

  /* `oauth-personal` = đã đăng nhập bằng tài khoản Google. Đăng nhập thì lọt,
     nhưng MỌI lượt gọi bị Google từ chối bằng `IneligibleTierError: This client
     is no longer supported for Gemini Code Assist for individuals` — đo thật
     20/09/2026. Tức đường CLI chết hẳn ở trạng thái này, nên lùi về khoá API
     thay vì để người dùng ngồi xem từng lô báo lỗi. */
  if (qua === 'cli' && xacThuc === 'oauth-personal') {
    console.log('\nLƯU Ý: CLI đang đăng nhập bằng tài khoản Google (oauth-personal).');
    console.log('Google không phục vụ tài khoản cá nhân qua CLI nữa, nên lùi về khoá API.');
    console.log('Muốn dùng lại đường CLI: chạy `gemini`, gõ /auth, chọn "Use Gemini API key".');
    qua = 'key';
  }
  /* Trần 20 lượt/ngày là của BẬC MIỄN PHÍ theo khoá API. Đăng nhập CLI bằng tài
     khoản Google thì hạn mức đi theo gói của tài khoản, không còn trần đó.
     KHÔNG BIẾT thì coi như đang ăn bậc miễn phí. Đoán sai theo hướng này chỉ
     tốn thêm vài giây nghỉ; đoán sai theo hướng kia là chạy được một phần ba
     rồi chết vì hết hạn mức, mất sạch phần đã tốn. */
  /* Hôm nay MỌI đường đều đi bằng khoá API, nên hàng rào luôn đứng. Giữ phép
     tính này thay vì ghi `true` để sau còn nới được, nếu Google mở lại một lối
     nào đó có hạn mức khác. */
  const anTheoKhoa = qua === 'key' || xacThuc !== 'khong-phai-hom-nay';
  const giayNghi = anTheoKhoa ? GIAY_NGHI_GIUA_HAI_LUOT : 2;
  const soGoi = soLo * soLan;
  const phut = Math.round((soGoi * giayNghi) / 60);

  console.log(`\nSoát ${ds.length}/${tong} câu · ${soLo} lô × ${soLan} lượt = ${soGoi} lượt gọi · model ${model}`);
  console.log(`Đường gọi: ${qua === 'cli' ? 'gemini CLI' : 'khoá API'} · xác thực: ${xacThuc}`
    + (anTheoKhoa ? '  → ĐANG ĂN HẠN MỨC MIỄN PHÍ' : '  → ăn hạn mức của tài khoản'));
  console.log(`Ước tính ${phut} phút (nghỉ ${giayNghi}s giữa hai lượt).`);

  if (anTheoKhoa && soGoi > LUOT_MOI_NGAY) {
    console.error(
      `\nDỪNG: ${soGoi} lượt vượt hạn mức ${LUOT_MOI_NGAY} lượt/ngày của bậc miễn phí.\n`
      + `Chia nhỏ ra, ví dụ mỗi lần một bài:  npm run soat:hoa-hoc -- --bai bai-1\n`
      + `Hoặc tăng số câu mỗi lô:             npm run soat:hoa-hoc -- --lo 40\n`
      + `Hoặc soát một lượt thay vì hai:      npm run soat:hoa-hoc -- --lan 1\n`
      + `   (nhưng một lượt BỎ SÓT lỗi thật — đã đo, xem ghi chú trong mã)\n\n`
      + `Cách gỡ hẳn trần này: bật thanh toán cho dự án Google Cloud giữ API key.\n`
      + `Đăng nhập bằng tài khoản Google KHÔNG còn dùng được — Google chấm dứt lối\n`
      + `đó cho tài khoản cá nhân từ 18/06/2026, kể cả gói AI Pro và Ultra.`,
    );
    process.exit(1);
  }

  if (chiXem) {
    console.log('\n--xem: chỉ tính kế hoạch, không gọi Gemini. Bỏ --xem đi để chạy thật.\n');
    return;
  }

  let ai: GoogleGenAI | null = null;
  if (qua === 'key') {
    const key = docKey();
    if (!key) {
      console.error('\nKhông tìm thấy GEMINI_API_KEY thật trong .env.local. Thêm dòng đó rồi chạy lại.');
      process.exit(1);
    }
    ai = new GoogleGenAI({ apiKey: key });
  }
  /* Gom theo id qua NHIỀU LƯỢT SOÁT, đếm xem mấy lượt cùng nêu một câu.
     Vì sao không chỉ chạy một lượt: đo 20/09/2026 trên CÙNG 16 câu, cùng
     `temperature: 0`, ba lượt cho ra 3, 3, rồi 0 câu nghi ngờ. Ba câu bị bỏ sót
     ở lượt thứ ba là lỗi THẬT — đã kiểm tay. Nên một lượt soát KHÔNG đủ để
     kết luận "bài này sạch", và số lượt cùng nêu chính là thước đo độ tin cậy
     đáng tin hơn cái nhãn `tin` do chính mô hình tự chấm. */
  let soHong = 0;

  for (let i = 0; i < soLo; i++) {
    const lo = ds.slice(i * moiLo, (i + 1) * moiLo);
    const noiDung = JSON.stringify(lo.map(goiDi), null, 1);
    for (let l = 0; l < soLan; l++) {
      process.stdout.write(`  lô ${i + 1}/${soLo} · lượt ${l + 1}/${soLan} (${lo.length} câu)… `);
      try {
        let thoNhap: string;
        if (qua === 'cli') {
          /* CLI tự thử lại khi chạm trần phút — đã thấy nó chờ 48s rồi đi tiếp. */
          thoNhap = goiQuaCli(noiDung, model);
        } else {
          /* Đường khoá API KHÔNG tự thử lại, nên phải tự làm. Đo 20/09/2026:
             một lượt dính 503 "This model is currently experiencing high
             demand" — lỗi của Google, không phải của mình, và chỉ cần chờ.
             Không thử lại thì mất trắng lượt đó cùng phần hạn mức đã tiêu. */
          let lanCuoi: unknown = null;
          for (let thu = 0; thu < 3; thu++) {
            try {
              const kq = await ai!.models.generateContent({
                model,
                contents: [{ role: 'user', parts: [{ text: noiDung }] }],
                config: { systemInstruction: CAU_LENH, temperature: 0 },
              });
              thoNhap = kq.text ?? '';
              lanCuoi = null;
              break;
            } catch (e) {
              lanCuoi = e;
              const s = String(e);
              /* Chỉ thử lại loại lỗi CHỜ ĐƯỢC. Sai khoá hay sai model thì thử
                 lại bao nhiêu lần cũng thế, chỉ tổ chậm. */
              if (!/429|503|RESOURCE_EXHAUSTED|UNAVAILABLE|high demand/i.test(s)) break;
              const giay = Number(s.match(/"retryDelay":\s*"(\d+)s"/)?.[1] ?? 20);
              process.stdout.write(`(chờ ${giay}s rồi thử lại) `);
              await ngu(giay * 1000);
            }
          }
          if (lanCuoi) throw lanCuoi;
          thoNhap = thoNhap!;
        }
        const mang = JSON.parse(boRaoJson(thoNhap));
        if (!Array.isArray(mang)) throw new Error('không phải mảng JSON');
        nhan(mang as Nghi[]);
        console.log(`${mang.length} câu nghi ngờ`);
      } catch (loi) {
        /* Một lượt hỏng không được giết cả lượt chạy: các lượt trước đã tốn hạn
           mức rồi, vứt đi là phí. Ghi lại rồi đi tiếp — NHƯNG phải ĐẾM, và con
           số đó phải vào báo cáo. Không đếm thì báo cáo ghi "mỗi lô 2 lượt"
           trong khi có lô chỉ chạy được 1, và người đọc tưởng đã soát đủ. Đúng
           loại sai im lặng mà dự án này chống. Đã suýt lọt ngày 20/09/2026. */
        soHong++;
        console.log(`LỖI — ${String(loi).split('\n')[0].slice(0, 120)}`);
      }
      const conNua = !(i === soLo - 1 && l === soLan - 1);
      if (conNua) await ngu(giayNghi * 1000);
    }
  }

  if (soHong > 0) {
    console.log(`\n  ${soHong} lượt gọi bị hỏng — phần trong các lô đó soát NÔNG hơn.`);
  }
  viet(ds, gom, bac, soLan, `${model} (${qua === 'cli' ? 'gemini CLI' : 'khoá API'})`, soHong);
}

chay();
