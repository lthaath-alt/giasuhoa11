/**
 * wordParser.ts
 * Parse file .docx thành danh sách câu hỏi cho Thư viện.
 * Dùng mammoth để chuyển .docx → HTML (giữ <sub>, <sup>, ảnh nhúng base64).
 *
 * ──────────────────────────────────────────────────────
 * Định dạng file Word chuẩn (template):
 *
 *   Câu 1 [Trắc nghiệm] [Mức: Thấp] [Điểm: 1]
 *   Nội dung câu hỏi...
 *   A. ...
 *   B. ...
 *   C. ...
 *   D. ...
 *   Đáp án đúng: B
 *
 *   Câu 2 [Đúng/Sai] [Mức: Trung bình] [Điểm: 2]
 *   Nội dung câu hỏi...
 *   Đáp án đúng: Đúng
 *
 *   Câu 3 [Tự luận] [Mức: Cao] [Điểm: 3]
 *   Nội dung câu hỏi...
 *   Đáp án mẫu:
 *     Ý 1: ...
 *     Ý 2: ...
 * ──────────────────────────────────────────────────────
 */

import mammoth from 'mammoth';
import {
  ParseResult,
  ParsedQuestion,
  ParseError,
  ParseWarning,
  QuestionType,
  DifficultyLevel,
  QuestionOption,
  EssayPoint,
  QuestionImage,
} from './types';

// ─── Regex helpers ────────────────────────────────────────────────────────────

const HEADER_REGEX = /^Câu\s+(\d+)\s*\[([^\]]+)\]\s*\[Mức:\s*([^\]]+)\]\s*\[Điểm:\s*(\d+(?:[.,]\d+)?)\]/i;
const CORRECT_ANSWER_REGEX = /^Đáp án đúng\s*:\s*(.+)/i;
const ESSAY_ANSWER_HEADER_REGEX = /^Đáp án mẫu\s*:/i;
const ESSAY_POINT_REGEX = /^Ý\s+(\d+(?:\s*\([^)]+\))?)\s*:\s*(.+)/i;
const OPTION_REGEX = /^([ABCD])\.\s*(.+)/;

const VALID_TYPES: Record<string, QuestionType> = {
  'trắc nghiệm': 'Trắc nghiệm',
  'trac nghiem': 'Trắc nghiệm',
  'đúng/sai': 'Đúng/Sai',
  'dung/sai': 'Đúng/Sai',
  'tự luận': 'Tự luận',
  'tu luan': 'Tự luận',
};

const VALID_LEVELS: Record<string, DifficultyLevel> = {
  'thấp': 'Thấp',
  'thap': 'Thấp',
  'trung bình': 'Trung bình',
  'trung binh': 'Trung bình',
  'cao': 'Cao',
};

// ─── HTML → Plain text (giữ sub/sup) ─────────────────────────────────────────

/**
 * Chuẩn hóa HTML từ mammoth:
 * - Giữ <sub>, <sup>, <strong>, <em>
 * - Chuyển <br>, </p> thành newline
 * - Bỏ các tag HTML khác
 */
function htmlToContent(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    // Giữ sub/sup nguyên để render đúng công thức
    .replace(/<(?!\/?(?:sub|sup|strong|em)\b)[^>]+>/gi, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Lấy plain text (bỏ tất cả tags) để so khớp header/option */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
}

// ─── Main parse function ──────────────────────────────────────────────────────

export async function parseWordFile(file: File): Promise<ParseResult> {
  const questions: ParsedQuestion[] = [];
  const errors: ParseError[] = [];
  const warnings: ParseWarning[] = [];

  // 1. Đọc file buffer
  const buffer = await file.arrayBuffer();

  // 2. Dùng mammoth để convert sang HTML, extract ảnh dưới dạng base64
  const images: QuestionImage[] = [];
  let imageCounter = 0;

  const result = await mammoth.convertToHtml(
    { arrayBuffer: buffer },
    {
      convertImage: mammoth.images.imgElement(async (image) => {
        const base64 = await image.read('base64');
        const mimeType = image.contentType || 'image/png';
        const imgId = `img_${Date.now()}_${imageCounter++}`;
        images.push({ id: imgId, base64: `data:${mimeType};base64,${base64}`, mimeType });
        return { src: `__IMG__${imgId}__` };
      }),
    }
  );

  const html = result.value;

  // 3. Tách thành các đoạn văn bản (theo <p> hoặc <br>)
  const rawParagraphs = html
    .split(/<\/p>|<br\s*\/?>/gi)
    .map(p => ({ raw: p.trim(), text: stripHtml(p).trim() }))
    .filter(p => p.text.length > 0);

  // 4. Phân tích từng khối câu hỏi
  let i = 0;
  while (i < rawParagraphs.length) {
    const { text, raw } = rawParagraphs[i];
    const headerMatch = HEADER_REGEX.exec(text);

    if (!headerMatch) {
      i++;
      continue;
    }

    const questionNum = parseInt(headerMatch[1], 10);
    const typeRaw = headerMatch[2].trim().toLowerCase();
    const levelRaw = headerMatch[3].trim().toLowerCase();
    const pointsRaw = parseFloat(headerMatch[4].replace(',', '.'));

    // Validate loại câu
    const qType = VALID_TYPES[typeRaw];
    if (!qType) {
      errors.push({
        questionIndex: questionNum,
        message: `Câu ${questionNum}: Không nhận diện được loại câu hỏi "${headerMatch[2]}". Phải là một trong: Trắc nghiệm, Đúng/Sai, Tự luận.`,
      });
      i++;
      continue;
    }

    // Validate mức độ
    const difficulty = VALID_LEVELS[levelRaw];
    if (!difficulty) {
      errors.push({
        questionIndex: questionNum,
        message: `Câu ${questionNum}: Không nhận diện được mức độ "${headerMatch[3]}". Phải là: Thấp, Trung bình, hoặc Cao.`,
      });
      i++;
      continue;
    }

    // Validate điểm
    if (isNaN(pointsRaw) || pointsRaw <= 0) {
      errors.push({
        questionIndex: questionNum,
        message: `Câu ${questionNum}: Điểm không hợp lệ "${headerMatch[4]}". Phải là số dương.`,
      });
      i++;
      continue;
    }

    i++; // chuyển sang dòng nội dung

    // 5. Thu thập nội dung câu hỏi (cho đến khi gặp A./B./C./D. hoặc Đáp án)
    const contentParts: string[] = [];
    const questionImages: QuestionImage[] = [];
    const options: QuestionOption[] = [];
    let correctAnswer: string | undefined;
    const essayPoints: EssayPoint[] = [];
    let inEssayAnswer = false;

    while (i < rawParagraphs.length) {
      const cur = rawParagraphs[i];
      const curText = cur.text;

      // Kiểm tra header câu tiếp theo → dừng
      if (HEADER_REGEX.test(curText)) break;

      // Xử lý ảnh nhúng trong đoạn
      const imgMatches = cur.raw.match(/__IMG__([^_]+)__/g);
      if (imgMatches) {
        for (const m of imgMatches) {
          const imgId = m.replace(/__IMG__|__/g, '');
          const img = images.find(im => im.id === imgId);
          if (img) questionImages.push(img);
        }
      }

      // Đáp án mẫu (Tự luận)
      if (ESSAY_ANSWER_HEADER_REGEX.test(curText)) {
        inEssayAnswer = true;
        i++;
        continue;
      }

      if (inEssayAnswer) {
        const pointMatch = ESSAY_POINT_REGEX.exec(curText);
        if (pointMatch) {
          essayPoints.push({ label: `Ý ${pointMatch[1]}`, content: pointMatch[2].trim() });
          i++;
          continue;
        }
        // Dòng không có format Ý X: → thêm vào ý cuối hoặc bỏ qua
        if (essayPoints.length > 0 && curText) {
          essayPoints[essayPoints.length - 1].content += '\n' + curText;
        }
        i++;
        continue;
      }

      // Đáp án đúng (Trắc nghiệm / Đúng/Sai)
      const answerMatch = CORRECT_ANSWER_REGEX.exec(curText);
      if (answerMatch) {
        correctAnswer = answerMatch[1].trim();
        i++;
        continue;
      }

      // Đáp án A./B./C./D. (Trắc nghiệm)
      const optionMatch = OPTION_REGEX.exec(curText);
      if (optionMatch) {
        options.push({
          key: optionMatch[1] as 'A' | 'B' | 'C' | 'D',
          text: htmlToContent(cur.raw.replace(OPTION_REGEX, optionMatch[2])),
        });
        i++;
        continue;
      }

      // Nội dung câu hỏi
      const contentHtml = cur.raw.replace(/__IMG__[^_]+__/g, '').trim();
      if (contentHtml) {
        contentParts.push(htmlToContent(contentHtml));
      }
      i++;
    }

    const content = contentParts.join('\n').trim();

    // 6. Validate nội dung
    if (!content && questionImages.length === 0) {
      errors.push({
        questionIndex: questionNum,
        message: `Câu ${questionNum}: Thiếu nội dung câu hỏi.`,
      });
      continue;
    }

    // 7. Validate đáp án theo loại câu
    if (qType === 'Trắc nghiệm') {
      if (options.length === 0) {
        errors.push({ questionIndex: questionNum, message: `Câu ${questionNum} [Trắc nghiệm]: Thiếu các đáp án A/B/C/D.` });
        continue;
      }
      if (!correctAnswer) {
        errors.push({ questionIndex: questionNum, message: `Câu ${questionNum} [Trắc nghiệm]: Thiếu "Đáp án đúng".` });
        continue;
      }
      if (!['A', 'B', 'C', 'D'].includes(correctAnswer.toUpperCase())) {
        errors.push({ questionIndex: questionNum, message: `Câu ${questionNum} [Trắc nghiệm]: Đáp án đúng phải là A, B, C hoặc D.` });
        continue;
      }
      correctAnswer = correctAnswer.toUpperCase();
    }

    if (qType === 'Đúng/Sai') {
      if (!correctAnswer) {
        errors.push({ questionIndex: questionNum, message: `Câu ${questionNum} [Đúng/Sai]: Thiếu "Đáp án đúng".` });
        continue;
      }
      const ca = correctAnswer.toLowerCase();
      if (ca !== 'đúng' && ca !== 'sai') {
        errors.push({ questionIndex: questionNum, message: `Câu ${questionNum} [Đúng/Sai]: Đáp án đúng phải là "Đúng" hoặc "Sai".` });
        continue;
      }
      correctAnswer = ca === 'đúng' ? 'Đúng' : 'Sai';
    }

    if (qType === 'Tự luận') {
      if (essayPoints.length === 0) {
        // Cảnh báo (không chặn) nếu Admin chưa tách ý
        warnings.push({
          questionIndex: questionNum,
          message: `Câu ${questionNum} [Tự luận]: Đáp án mẫu chưa được tách ý (Ý 1, Ý 2...). Hệ thống sẽ lưu toàn bộ nội dung vào Ý 1. Khuyến cáo nên tách ý để chấm điểm từng phần sau này.`,
        });
        // Thêm tất cả nội dung còn lại vào Ý 1 nếu có
        if (content) {
          essayPoints.push({ label: 'Ý 1', content: content });
        }
      }
    }

    // 8. Thêm câu hỏi hợp lệ
    const parsed: ParsedQuestion = {
      type: qType,
      difficulty,
      points: pointsRaw,
      content,
      images: questionImages,
      ...(qType === 'Trắc nghiệm' && { options, correctAnswer }),
      ...(qType === 'Đúng/Sai' && { correctAnswer }),
      ...(qType === 'Tự luận' && { essayPoints }),
    };

    questions.push(parsed);
  }

  return { questions, errors, warnings };
}
