// ─── Chuyển đổi giữa mô hình cũ của web và ngân hàng hợp nhất ────────────────
//
// Web cũ dùng kiểu Question (3 dạng, 3 mức, đáp án theo chữ A/B/C/D).
// Ngân hàng hợp nhất dùng mô hình của game (4 dạng, 4 mức, đáp án theo chỉ số).
//
// Giữ hai chiều chuyển đổi để những phần chưa viết lại — sinh đề kiểm tra,
// nhập từ file Word, gia sư AI — vẫn chạy được trên dữ liệu mới.

import { Question, QuestionType, DifficultyLevel } from '../library/types';
import { BankQuestion, Chapter, Level, QType } from './types';

// ─── Bảng ánh xạ ─────────────────────────────────────────────────────────────

/**
 * Mức độ: web có 3, game có 4.
 * Mức "vdc" (vận dụng cao) không có bên web nên chỉ xuất hiện ở câu nhập mới.
 * Chiều ngược lại gộp vdc về "Cao" để không mất câu.
 */
const WEB_TO_LEVEL: Record<DifficultyLevel, Level> = {
  'Thấp': 'nb',
  'Trung bình': 'th',
  'Cao': 'vd',
};

const LEVEL_TO_WEB: Record<Level, DifficultyLevel> = {
  nb: 'Thấp',
  th: 'Trung bình',
  vd: 'Cao',
  vdc: 'Cao',
};

/**
 * Dạng câu: web có 3, game có 4.
 * Dạng "tn" (trả lời ngắn bằng số) không có bên web — chiều ngược lại đưa về
 * Tự luận để vẫn hiển thị và chấm tay được.
 */
const WEB_TO_QTYPE: Record<QuestionType, QType> = {
  'Trắc nghiệm': 'mc',
  'Đúng/Sai': 'tf',
  'Tự luận': 'tl',
};

const QTYPE_TO_WEB: Record<QType, QuestionType> = {
  mc: 'Trắc nghiệm',
  tf: 'Đúng/Sai',
  tn: 'Tự luận',
  tl: 'Tự luận',
};

const KEYS = ['A', 'B', 'C', 'D'] as const;

/** "c1" | "chuong1" | 3 → 1–6, mặc định 1 nếu không đọc được */
export function toChapter(raw: unknown): Chapter {
  // Math.trunc để số lẻ như 2.7 không lọt qua thành "chương 2.7" — kiểu Chapter
  // chỉ nhận 1–6, và một chương lẻ sẽ rơi khỏi mọi bộ lọc theo chương.
  const n = Math.trunc(
    typeof raw === 'number' ? raw : parseInt(String(raw ?? '').replace(/\D+/g, ''), 10));
  return (n >= 1 && n <= 6 ? n : 1) as Chapter;
}

// ─── Web cũ → ngân hàng hợp nhất ─────────────────────────────────────────────

export function fromLegacy(
  q: Question,
  ctx: { chapterId?: string; lessonId?: string } = {},
): BankQuestion {
  const t = WEB_TO_QTYPE[q.type] ?? 'mc';
  const imgs = (q.images || []).map(i => i.base64).filter(Boolean);

  const out: BankQuestion = {
    id: q.id,
    ch: toChapter(ctx.chapterId ?? q.topic),
    lv: WEB_TO_LEVEL[q.difficulty] ?? 'nb',
    t,
    q: q.content,
    createdBy: q.createdBy,
    createdAt: q.createdAt,
  };

  if (q.topic) out.topic = q.topic;
  if (typeof q.points === 'number' && q.points > 0) out.points = q.points;
  if (ctx.lessonId) out.lessonId = ctx.lessonId;
  if (ctx.chapterId) out.chapterId = ctx.chapterId;
  if (imgs.length) {
    out.img = imgs[0];
    if (imgs.length > 1) out.imgs = imgs;
  }

  if (t === 'mc') {
    // Web lưu phương án theo khoá A–D; game lưu theo thứ tự mảng.
    const opts = q.options || [];
    out.o = KEYS.map(k => opts.find(o => o.key === k)?.text ?? '');
    const idx = KEYS.indexOf((q.correctAnswer || 'A') as typeof KEYS[number]);
    out.a = idx >= 0 ? idx : 0;
  } else if (t === 'tf') {
    // Đúng/Sai bên web là MỘT mệnh đề; bên game là NHIỀU ý chấm từng phần.
    // Chuyển thành một ý duy nhất — đúng về nghĩa, nhưng form thêm câu của
    // game đòi tối thiểu 2 ý nên câu loại này cần bổ sung ý khi sửa trong game.
    out.st = [{ s: q.content, v: q.correctAnswer !== 'Sai' }];
  } else {
    out.ans = (q.essayPoints || []).map(p => `${p.label}: ${p.content}`).join('\n');
    if (q.essayPoints && q.essayPoints.length) out.essayPoints = q.essayPoints;
  }

  return out;
}

// ─── Ngân hàng hợp nhất → web cũ ─────────────────────────────────────────────

export function toLegacy(b: BankQuestion): Question {
  /* Dùng một biến `t` đã có mặc định, thay vì đọc thẳng `b.t` ở mỗi nhánh.
     148 trong 160 câu mẫu của trò chơi không có trường `t`. Khi đó dòng cũ
     `QTYPE_TO_WEB[b.t] ?? 'Trắc nghiệm'` vẫn cho ra type = Trắc nghiệm, nhưng
     không nhánh `b.t === '...'` nào bên dưới chạy, nên câu trả về MẤT SẠCH
     phương án và đáp án mà không báo lỗi gì. */
  const t: QType = b.t ?? 'mc';
  const type = QTYPE_TO_WEB[t];
  const imgs = b.imgs && b.imgs.length ? b.imgs : b.img ? [b.img] : [];

  const out: Question = {
    id: b.id,
    type,
    difficulty: LEVEL_TO_WEB[b.lv] ?? 'Thấp',
    points: typeof b.points === 'number' ? b.points : 1,
    content: b.q,
    images: imgs.map((base64, i) => ({
      id: `${b.id}_img${i}`,
      base64,
      mimeType: mimeOf(base64),
    })),
    createdBy: b.createdBy,
    createdAt: b.createdAt || new Date().toISOString(),
  };

  if (b.topic) out.topic = b.topic;

  /* Giữ liên kết bài học khi đổi mô hình. Thiếu hai trường này thì câu bước ra
     khỏi ngân hàng là "mồ côi" — đề kiểm tra không biết nó thuộc bài nào. */
  if (b.lessonId) out.lessonId = b.lessonId;
  if (b.chapterId) out.chapterId = b.chapterId;

  if (t === 'mc') {
    out.options = (b.o || []).slice(0, 4).map((text, i) => ({ key: KEYS[i], text }));
    out.correctAnswer = KEYS[typeof b.a === 'number' ? b.a : 0];
  } else if (t === 'tf') {
    // Nhiều ý gộp lại thành một mệnh đề; đúng khi mọi ý đều đúng.
    const st = b.st || [];
    out.content = st.length > 1 ? st.map(s => `• ${s.s}`).join('\n') : (st[0]?.s ?? b.q);
    out.correctAnswer = st.every(s => s.v) ? 'Đúng' : 'Sai';
  } else if (t === 'tn') {
    out.essayPoints = [
      { label: 'Đáp án', content: b.ansText ?? String(b.num ?? '') + (b.unit ? ' ' + b.unit : '') },
    ];
  } else {
    out.essayPoints =
      b.essayPoints && b.essayPoints.length
        ? b.essayPoints
        : [{ label: 'Đáp án tham khảo', content: b.ans ?? '' }];
  }

  return out;
}

function mimeOf(dataUri: string): string {
  const m = /^data:([^;,]+)/.exec(dataUri || '');
  return m ? m[1] : 'image/png';
}
