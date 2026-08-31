// ─── Nạp đề từ file ──────────────────────────────────────────────────────────
//
// Chuyển nguyên cách làm của trò chơi Vòng Quanh Hóa 11 sang web.
//
// Trình duyệt không tự đọc được PDF hay ảnh chụp. Thay vì cố parse, ta sinh sẵn
// một câu lệnh để giáo viên nhờ AI bên ngoài đọc hộ, rồi dán JSON kết quả về.
//
// Câu nhận về KHÔNG vào thẳng ngân hàng mà nằm ở khu chờ duyệt, vì AI hay đoán
// sai chương và mức độ.

import { BankQuestion, Chapter, Level, QType, CHAPTERS } from './types';

const QTYPES: QType[] = ['mc', 'tf', 'tn', 'tl'];
const PENDING_KEY = 'h11_bank_pending_v1';

// ─── Tiện ích ────────────────────────────────────────────────────────────────

export function normKey(s: unknown): string {
  return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function parseNum(x: unknown): number {
  const v = String(x === undefined || x === null ? '' : x).trim().replace(/\s+/g, '').replace(/,/g, '.');
  if (!v) return NaN;
  return parseFloat(v);
}

function normLevel(x: unknown): Level | '' {
  const v = String(x || '').toLowerCase().trim();
  if (v === 'nb' || v === 'th' || v === 'vd' || v === 'vdc') return v;
  if (v.includes('nhận biết')) return 'nb';
  if (v.includes('thông hiểu')) return 'th';
  if (v.includes('vận dụng cao')) return 'vdc';
  if (v.includes('vận dụng')) return 'vd';
  return '';
}

function newId(): string {
  return `bq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Tách các khối JSON nằm lẫn trong lời dẫn của AI.
 *
 * AI hay viết vài câu giải thích rồi mới in JSON, có khi in nhiều khối liền
 * nhau. Hàm này bỏ qua phần chữ và nhặt đúng các khối cân ngoặc; khối cuối bị
 * cắt cụt thì đánh dấu `truncated` để báo cho người dùng biết mà xin in lại.
 */
export function extractJsonBlocks(text: string): { blocks: string[]; truncated: boolean } {
  const out: string[] = [];
  let truncated = false;
  let i = 0;
  const n = text.length;

  while (i < n) {
    const ch = text.charAt(i);
    if (ch === '{' || ch === '[') {
      const close = ch === '{' ? '}' : ']';
      let depth = 0;
      let inStr = false;
      let esc = false;
      let j = i;
      for (; j < n; j++) {
        const c = text.charAt(j);
        if (inStr) {
          if (esc) esc = false;
          else if (c === '\\') esc = true;
          else if (c === '"') inStr = false;
          continue;
        }
        if (c === '"') { inStr = true; continue; }
        if (c === ch) depth++;
        else if (c === close) { depth--; if (depth === 0) break; }
      }
      if (j >= n) { truncated = true; break; }
      out.push(text.slice(i, j + 1));
      i = j + 1;
      continue;
    }
    i++;
  }
  return { blocks: out, truncated };
}

// ─── Đọc JSON do AI trả về ───────────────────────────────────────────────────

export interface ParseOutcome {
  /** Câu đọc được, đã chuẩn hóa, chờ duyệt */
  rows: BankQuestion[];
  /** Cảnh báo từng câu — không chặn, chỉ để người dùng biết đã bỏ gì */
  errs: string[];
  /** Lỗi khiến không đọc được gì cả */
  fatal: string | null;
}

/**
 * @param text  nguyên văn phần AI trả về
 * @param daCo  câu đã có trong ngân hàng và trong khu chờ, để loại trùng
 */
export function parseAIJson(text: string, daCo: BankQuestion[]): ParseOutcome {
  const raw = String(text || '').trim();
  if (!raw) return { rows: [], errs: [], fatal: 'Chưa dán gì vào ô JSON.' };

  const { blocks, truncated } = extractJsonBlocks(raw);
  let list: Record<string, unknown>[] = [];
  let badBlocks = 0;
  let okBlocks = 0;

  blocks.forEach(b => {
    let data: unknown;
    try { data = JSON.parse(b); } catch { badBlocks++; return; }
    const arr = Array.isArray(data)
      ? data
      : (data && typeof data === 'object' ? (data as { questions?: unknown }).questions : null);
    if (Array.isArray(arr)) { list = list.concat(arr as Record<string, unknown>[]); okBlocks++; }
  });

  if (!okBlocks) {
    return {
      rows: [], errs: [],
      fatal: 'Không đọc được khối JSON nào — hãy chép lại nguyên văn phần AI trả về, gồm cả dấu ngoặc nhọn mở và đóng.',
    };
  }

  const seen = new Set<string>();
  daCo.forEach(x => seen.add(normKey(x.q) + '|' + (x.t || 'mc')));

  const rows: BankQuestion[] = [];
  const errs: string[] = [];
  let dup = 0;

  if (badBlocks) errs.push(`Có ${badBlocks} khối dữ liệu bị hỏng, đã bỏ qua.`);
  if (truncated) errs.push('Phần cuối bị cắt giữa chừng nên không dùng được — hãy bảo AI in lại trọn vẹn phần đó rồi dán thêm.');

  list.forEach((it, i) => {
    const no = `Câu ${i + 1}: `;
    if (!it || typeof it !== 'object') { errs.push(no + 'không phải một đối tượng.'); return; }

    const q = String(it.q || '').trim();
    if (!q) { errs.push(no + 'thiếu nội dung câu hỏi.'); return; }

    let ch = parseInt(String(it.ch), 10);
    if (!(ch >= 1 && ch <= 6)) ch = 1;
    const lv = normLevel(it.lv) || 'th';
    const t = (QTYPES.indexOf(it.t as QType) !== -1 ? it.t : 'mc') as QType;
    const e = String(it.e || '').trim() || 'Chưa có lời giải thích.';

    const key = normKey(q) + '|' + t;
    if (seen.has(key)) { dup++; return; }

    const rec: BankQuestion = { id: newId(), ch: ch as Chapter, lv, t, q, e };
    if (it.f) rec.topic = String(it.f).trim().slice(0, 60);
    // imgNote gom theo vị trí trong tài liệu để dán ảnh một lần cho nhiều câu
    if (it.imgNote) rec.imgNote = String(it.imgNote).trim().slice(0, 120);
    if (it.g !== undefined) rec.g = it.g as number | string;

    if (t === 'mc') {
      const o = it.o as unknown[];
      if (!Array.isArray(o) || o.length !== 4 || o.some(x => !String(x || '').trim())) {
        errs.push(no + 'cần đủ bốn phương án.'); return;
      }
      const a = parseInt(String(it.a), 10);
      if (!(a >= 0 && a <= 3)) { errs.push(no + 'chỉ số đáp án đúng phải từ 0 đến 3.'); return; }
      rec.o = o.map(x => String(x).trim());
      rec.a = a;
    } else if (t === 'tf') {
      const st = it.st as { s?: unknown; v?: unknown }[];
      if (!Array.isArray(st) || st.length < 2) { errs.push(no + 'câu đúng/sai cần ít nhất hai ý.'); return; }
      rec.st = st.slice(0, 4)
        .map(x => ({ s: String((x && x.s) || '').trim(), v: !!(x && x.v) }))
        .filter(x => x.s);
      if (rec.st.length < 2) { errs.push(no + 'các ý của câu đúng/sai đều trống.'); return; }
    } else if (t === 'tn') {
      rec.ansText = String(it.ansText === undefined ? it.num : it.ansText).trim();
      rec.num = parseNum(rec.ansText);
      if (!isFinite(rec.num)) { errs.push(no + 'đáp án của câu trả lời ngắn phải là một số.'); return; }
      if (it.unit) rec.unit = String(it.unit).trim();
      const tol = parseNum(it.tol);
      if (isFinite(tol) && tol > 0) rec.tol = tol;
    } else {
      rec.ans = String(it.ans || '').trim();
      if (!rec.ans) { errs.push(no + 'câu tự luận cần đáp án tham khảo.'); return; }
    }

    seen.add(key);
    rows.push(rec);
  });

  if (dup) errs.push(`Bỏ qua ${dup} câu trùng với câu đã có trong ngân hàng hoặc khu chờ duyệt.`);
  return { rows, errs, fatal: null };
}

// ─── Sinh câu lệnh cho AI ────────────────────────────────────────────────────

export interface PromptOptions {
  /** Chia kết quả thành nhiều phần, mỗi phần tối đa bấy nhiêu câu; 0 là không chia */
  chunk: number;
  /** Sinh thêm biến thể mc / tf / tn cho mỗi câu gốc */
  variants: boolean;
  /** Ép mọi câu về một chương, hoặc 'auto' để AI tự phân loại */
  scopeCh: 'auto' | Chapter;
  /** Ép mọi câu về một mức độ, hoặc 'auto' */
  scopeLv: 'auto' | Level;
}

function chapterListText(): string {
  return CHAPTERS.map(c => `${c.id} ${c.name}`).join('; ');
}

/**
 * Nguyên văn câu lệnh của trò chơi, giữ nguyên từng chữ.
 *
 * Đây là phần giá trị nhất của tính năng: nó đã được chỉnh cho AI đọc đúng
 * nhiều tệp, không cắt câu ở ranh giới trang, và mô tả hình bằng lời để câu
 * hỏi vẫn dùng được khi chưa kịp cắt ảnh.
 */
export function buildPrompt(o: PromptOptions): string {
  const L: string[] = [];
  L.push('Bạn là giáo viên Hóa học lớp 11 theo chương trình Kết nối tri thức với cuộc sống (2018).');
  L.push('Tôi đính kèm MỘT HOẶC NHIỀU tệp đề (PDF hoặc ảnh chụp). Hãy đọc TẤT CẢ các tệp và chuyển toàn bộ câu hỏi thành dữ liệu JSON cho ngân hàng câu hỏi.');
  L.push('');
  L.push('CÁCH XỬ LÝ NHIỀU TỆP');
  L.push('A. Duyệt lần lượt từng tệp theo thứ tự tôi đính kèm, không bỏ sót tệp nào. Trước khi bắt đầu, hãy liệt kê tên các tệp bạn đọc được và số câu ước tính trong mỗi tệp.');
  L.push('B. Nếu nhiều ảnh là các trang liên tiếp của cùng một đề, hãy ghép chúng lại thành một đề liền mạch rồi mới tách câu; đừng để một câu bị cắt đôi ở ranh giới trang.');
  L.push('C. Mỗi bản ghi thêm trường "f" ghi tên tệp nguồn, để tôi biết câu đến từ đâu.');
  L.push('D. Số "g" đánh liên tục từ 1 qua tất cả các tệp, không đánh lại từ đầu ở mỗi tệp.');
  L.push('E. Nếu cùng một câu xuất hiện ở nhiều tệp thì chỉ giữ lại một lần.');
  if (o.chunk > 0) {
    L.push(`F. Đề có thể rất dài nên hãy chia kết quả thành NHIỀU PHẦN, mỗi phần tối đa ${o.chunk} câu gốc.`);
    L.push('   Mỗi phần phải là một khối JSON HOÀN CHỈNH và hợp lệ đúng theo mẫu dưới đây — tuyệt đối không cắt ngang một khối JSON.');
    L.push('   In xong một phần thì dừng lại, ghi rõ đã xử lý tới tệp nào, câu nào, còn lại bao nhiêu, rồi chờ tôi nói "tiếp" mới in phần sau.');
  } else {
    L.push('F. In toàn bộ kết quả trong một khối JSON duy nhất. Nếu quá dài, hãy chia thành nhiều khối JSON hoàn chỉnh nối tiếp nhau, không cắt ngang khối nào.');
  }
  L.push('');
  L.push('QUY TẮC NỘI DUNG');
  if (o.variants) {
    L.push('1. Với MỖI câu hỏi gốc, tạo tối đa BA bản ghi cùng kiểm tra một nội dung kiến thức:');
    L.push('   - một bản dạng "mc": trắc nghiệm bốn phương án;');
    L.push('   - một bản dạng "tf": đúng/sai gồm bốn ý a, b, c, d;');
    L.push('   - một bản dạng "tn": trả lời ngắn, CHỈ tạo khi đáp án là một con số.');
    L.push('   Ba bản ghi của cùng một câu gốc dùng chung một giá trị "g" và cùng một "f".');
  } else {
    L.push('1. Giữ nguyên dạng của từng câu trong tệp, không sinh thêm biến thể. Mỗi câu gốc cho đúng một bản ghi.');
  }
  L.push('2. Phân loại chương theo danh sách: ' + chapterListText() + '.');
  if (o.scopeCh !== 'auto') L.push(`   Lần này chỉ lấy câu thuộc chương ${o.scopeCh} và đặt "ch":${o.scopeCh} cho mọi bản ghi.`);
  L.push('3. Phân loại mức độ: "nb" nhận biết, "th" thông hiểu, "vd" vận dụng, "vdc" vận dụng cao.');
  if (o.scopeLv !== 'auto') L.push(`   Lần này đặt "lv":"${o.scopeLv}" cho mọi bản ghi.`);
  L.push('4. Mỗi bản ghi phải có "e" là lời giải thích ngắn một đến hai câu, nêu bản chất hóa học chứ không chỉ nhắc lại đáp án.');
  L.push('5. Bài toán về khí dùng điều kiện chuẩn đkc: 25 °C, 1 bar, thể tích mol 24,79 L/mol.');
  L.push('6. Viết số thập phân kiểu Việt Nam, ví dụ 2,479. Công thức hóa học dùng ký tự chỉ số dưới nếu được, ví dụ H₂SO₄.');
  L.push('7. Không bịa thêm câu không có trong tệp. Câu nào không đọc rõ thì bỏ qua và ghi chú lại ở cuối.');
  L.push('');
  L.push('CÂU CÓ HÌNH (đồ thị, sơ đồ thí nghiệm, công thức cấu tạo, bảng số liệu)');
  L.push('8. Bạn không xuất được tệp ảnh, nên với mỗi câu có hình hãy làm hai việc:');
  L.push('   - Mô tả hình bằng lời ngay trong "q", đặt trong ngoặc vuông ở đầu câu, đủ chi tiết để học sinh làm được mà không cần nhìn hình.');
  L.push('     Ví dụ: "[Đồ thị: trục hoành là thể tích NaOH (mL), trục tung là pH; đường cong tăng chậm rồi dựng đứng quanh 25 mL]"');
  L.push('     Với công thức cấu tạo thì viết hẳn công thức bằng chữ, ví dụ CH₃−CH(OH)−CH₃.');
  L.push('   - Thêm trường "imgNote" ghi rõ vị trí hình để tôi tự cắt ảnh dán vào sau, ví dụ "tệp de-1.pdf, trang 2, hình bên phải câu 5".');
  L.push('   QUAN TRỌNG: mọi câu dùng CHUNG một hình phải có "imgNote" GIỐNG HỆT NHAU tới từng chữ, kể cả khi chúng là những câu gốc khác nhau.');
  L.push('   Hình ở trang khác, hoặc hình khác trên cùng trang, phải có "imgNote" khác. Nhờ vậy tôi chỉ cần cắt và dán mỗi hình một lần.');
  L.push('9. Câu nào không có hình thì không thêm "imgNote". Tuyệt đối không bịa ra hình không tồn tại.');
  L.push('');
  L.push('ĐỊNH DẠNG MỖI KHỐI JSON — chỉ in JSON, không thêm lời dẫn bên trong khối, không bọc trong khối mã:');
  L.push('{"questions":[');
  L.push(' {"g":1,"f":"de-on-tap-1.pdf","t":"mc","ch":2,"lv":"vd","q":"nội dung câu hỏi","o":["phương án A","phương án B","phương án C","phương án D"],"a":0,"e":"giải thích ngắn"},');
  L.push(' {"g":1,"f":"de-on-tap-1.pdf","t":"tf","ch":2,"lv":"vd","q":"câu dẫn","st":[{"s":"ý a","v":true},{"s":"ý b","v":false},{"s":"ý c","v":true},{"s":"ý d","v":false}],"e":"giải thích ngắn"},');
  L.push(' {"g":2,"f":"de-on-tap-1.pdf","t":"tn","ch":2,"lv":"vd","q":"[Đồ thị: mô tả hình bằng lời] câu hỏi tính toán","imgNote":"trang 2, hình bên phải câu 5","ansText":"2,479","unit":"L","tol":0.01,"e":"giải thích ngắn"}');
  L.push(']}');
  L.push('');
  L.push('Trong đó "a" là chỉ số của phương án đúng, đếm từ 0. Trường "unit" và "tol" của dạng "tn" có thể bỏ trống; "tol" là sai số chấp nhận được khi kết quả có làm tròn. Trường "imgNote" chỉ có ở câu kèm hình.');
  return L.join('\n');
}

// ─── Khu chờ duyệt ───────────────────────────────────────────────────────────
//
// Để ở localStorage chứ không phải Firestore: câu chờ duyệt là bản nháp của
// riêng người đang nhập, chưa nên cho cả trường nhìn thấy. Câu chờ duyệt không
// mang ảnh base64 nên không có nguy cơ làm đầy localStorage.

export function docChoDuyet(): BankQuestion[] {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as BankQuestion[]) : [];
  } catch {
    return [];
  }
}

export function ghiChoDuyet(list: BankQuestion[]): boolean {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

/** Khóa gom ảnh theo vị trí trong tài liệu — nhiều câu chung một hình chỉ dán một lần */
export function imgKeyOf(q: BankQuestion): string {
  if (!q.imgNote) return '';
  return normKey(q.topic || '') + ' ¦ ' + normKey(q.imgNote);
}
