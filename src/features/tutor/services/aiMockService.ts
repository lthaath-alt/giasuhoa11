import { ChatMessage } from '../../auth/types';

// ============================================================
// SYSTEM PROMPT: GIA SƯ HÓA HỌC 11 THÔNG MINH
// Phương pháp Socratic - 6 bước dẫn dắt tư duy
// ============================================================

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================
// TRẠNG THÁI PHIÊN HỌC (Session State)
// Lưu theo key: `${userEmail}_${lessonId}`
// ============================================================

export type SessionBranch = 'none' | 'theory' | 'calculation';
export type SessionStep =
  | 'step0_classify'      // Bước 0: Phân loại câu hỏi
  | 'stepA1_chapter'      // A1: Xác định chương
  | 'stepA2_core'         // A2: Tính chất/hiện tượng cốt lõi
  | 'stepA3_essence'      // A3: Bản chất nguyên nhân
  | 'stepA4_equation'     // A4: Phương trình hóa học
  | 'stepA5_summary'      // A5: Tổng hợp & liên hệ thực tiễn
  | 'stepA6_done'         // A6: Kết luận
  | 'stepB1_chapter'      // B1: Xác định chương
  | 'stepB2_data'         // B2: Tóm tắt dữ kiện
  | 'stepB3_formula'      // B3: Công thức/định luật
  | 'stepB4_plan'         // B4: Xác định các bước giải
  | 'stepB5_calculate'    // B5: Học sinh tự tính toán
  | 'stepB6_hint'         // B6: Gợi ý có cấu trúc
  | 'stepB_done';         // Kết thúc bài toán

export interface SessionState {
  branch: SessionBranch;
  step: SessionStep;
  originalQuestion: string;
  chapter: string;
  unknownCount: number;         // Đếm số lần "không biết" liên tiếp tại một bước
  unknownLessonId?: string;     // ID bài học được yêu cầu học khi kích hoạt quy tắc 3 lần
  waitingForApiScore?: boolean; // Đang chờ kết quả điểm số từ API
  b5AttemptCount: number;       // Số lần thử tính toán ở B5
}

// Lưu trữ trạng thái phiên trong memory (per session)
const sessionStore: Record<string, SessionState> = {};

const getSessionKey = (userEmail: string, lessonId: string) =>
  `${userEmail}__${lessonId}`;

export const getSession = (userEmail: string, lessonId: string): SessionState => {
  const key = getSessionKey(userEmail, lessonId);
  if (!sessionStore[key]) {
    sessionStore[key] = {
      branch: 'none',
      step: 'step0_classify',
      originalQuestion: '',
      chapter: '',
      unknownCount: 0,
      b5AttemptCount: 0,
    };
  }
  return sessionStore[key];
};

export const resetSession = (userEmail: string, lessonId: string): void => {
  const key = getSessionKey(userEmail, lessonId);
  sessionStore[key] = {
    branch: 'none',
    step: 'step0_classify',
    originalQuestion: '',
    chapter: '',
    unknownCount: 0,
    b5AttemptCount: 0,
  };
};

// ============================================================
// HỆ THỐNG PHÁT HIỆN Ý ĐỊNH (Intent Detection)
// ============================================================

const CHEAT_PATTERNS = [
  'giải giùm', 'cho em đáp án', 'cho đáp án', 'đáp án là gì', 'kết quả luôn',
  'bỏ qua bước', 'bỏ qua mấy bước', 'đi thẳng vào', 'nhảy thẳng',
  'quên hết', 'bỏ qua luật', 'không theo quy trình', 'đổi vai',
  'giả vờ bạn là', 'coi như em đã', 'học sinh giỏi rồi thì', 'test thử',
  'tình huống giả định', 'giả sử bạn',
];

const DONT_KNOW_PATTERNS = [
  'không biết', 'em chịu', 'chịu thôi', 'không rõ', 'mình không biết',
  'chả biết', 'ko biết', 'k biết',
];

const THEORY_PATTERNS = ['lý thuyết', 'ly thuyet', 'lí thuyết', 'lý thuyêt', 'a', 'A'];
const CALC_PATTERNS = [
  'bài toán', 'tính toán', 'tính', 'bài tập tính', 'calculation',
  'b', 'B', 'bai toan',
];

const isCheatAttempt = (text: string): boolean => {
  const lower = text.toLowerCase();
  return CHEAT_PATTERNS.some(p => lower.includes(p));
};

const isDontKnow = (text: string): boolean => {
  const lower = text.toLowerCase().trim();
  return DONT_KNOW_PATTERNS.some(p => lower.includes(p)) || lower.length < 4;
};

const isTheory = (text: string): boolean => {
  const lower = text.toLowerCase().trim();
  return THEORY_PATTERNS.some(p => lower === p || lower.includes('lý thuyết') || lower.includes('lí thuyết'));
};

const isCalculation = (text: string): boolean => {
  const lower = text.toLowerCase().trim();
  return CALC_PATTERNS.some(p => lower === p || lower.includes('tính toán') || lower.includes('bài toán'));
};

// Mapping tên chương từ lựa chọn
const CHAPTER_MAP: Record<string, string> = {
  'a': 'Cân bằng hóa học',
  'b': 'Nitrogen – Sulfur',
  'c': 'Đại cương về hóa học hữu cơ',
  'd': 'Hydrocarbon',
  'e': 'Dẫn xuất halogen - Alcohol - Phenol',
  'f': 'Hợp chất carbonyl - Carboxylic acid',
};

const CHAPTER_KEYWORDS: Record<string, string[]> = {
  'Cân bằng hóa học': ['cân bằng', 'le chatelier', 'hằng số cân bằng', 'kc', 'kp', 'chuyển dịch cân bằng'],
  'Nitrogen – Sulfur': ['nitrogen', 'nitơ', 'sulfur', 'lưu huỳnh', 'nh3', 'ammonia', 'hno3', 'h2so4', 'so2', 'n2'],
  'Đại cương về hóa học hữu cơ': ['hữu cơ', 'công thức phân tử', 'ctpt', 'đồng phân', 'đốt cháy', 'phân tích nguyên tố'],
  'Hydrocarbon': ['alkane', 'alkene', 'alkyne', 'ankan', 'anken', 'ankin', 'hydrocarbon', 'hydrocarbon', 'methane', 'ethylene', 'acetylene', 'benzene'],
  'Dẫn xuất halogen - Alcohol - Phenol': ['alcohol', 'phenol', 'halogen', 'dẫn xuất', 'ethanol', 'methanol', 'ancol', 'phenol'],
  'Hợp chất carbonyl - Carboxylic acid': ['aldehyde', 'ketone', 'carboxylic acid', 'ester', 'andehit', 'xeton', 'acid acetic', 'formic'],
};

const detectChapter = (text: string): string | null => {
  const lower = text.toLowerCase().trim();
  // Kiểm tra lựa chọn chữ cái
  for (const [key, chapter] of Object.entries(CHAPTER_MAP)) {
    if (lower === key) return chapter;
  }
  // Kiểm tra từ khóa
  for (const [chapter, keywords] of Object.entries(CHAPTER_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return chapter;
  }
  return null;
};

// ============================================================
// LESSON ID → CHAPTER MAPPING (để gợi ý bài học khi cần)
// ============================================================
const LESSON_CHAPTER_MAP: Record<string, string> = {
  'bai-1': 'Cân bằng hóa học',
  'bai-2': 'Nitrogen – Sulfur',
  'bai-3': 'Đại cương về hóa học hữu cơ',
  'bai-4': 'Hydrocarbon',
  'bai-5': 'Dẫn xuất halogen - Alcohol - Phenol',
  'bai-6': 'Hợp chất carbonyl - Carboxylic acid',
};

// ============================================================
// PHẦN PHẢN HỒI THEO TỪNG BƯỚC (Step Responses)
// ============================================================

const STEP_PROMPTS = {
  classify: `Chào em! 👋 Thầy/Cô là Chemai, gia sư Hóa học 11 — sẽ dẫn dắt em tự tìm ra câu trả lời theo từng bước nhé!

Để bắt đầu, em hãy cho thầy/cô biết:

📚 **Đây là câu hỏi về:**
- **Lý thuyết** (hiện tượng, bản chất, nguyên lý...)
- **Bài toán tính toán** (có số liệu cụ thể, cần tính ra đáp số)

Em trả lời nhé!`,

  chapterQuestion: `Chính xác! Vậy kiến thức này thuộc chương nào trong các chương sau đây?

**A.** Cân bằng hóa học
**B.** Nitrogen – Sulfur
**C.** Đại cương về hóa học hữu cơ
**D.** Hydrocarbon
**E.** Dẫn xuất halogen - Alcohol - Phenol
**F.** Hợp chất carbonyl - Carboxylic acid

*(Em gõ chữ A/B/C/D/E/F hoặc tên chương nhé!)*`,

  chapterWrong: `Thầy/Cô nhận thấy em chưa chọn đúng chương rồi! Hãy suy nghĩ lại nhé.

📌 Câu hỏi ban đầu của em là: **"{question}"**

Chương nào trong Hóa học 11 có liên quan đến chủ đề này?

**A.** Cân bằng hóa học | **B.** Nitrogen – Sulfur | **C.** Đại cương hữu cơ
**D.** Hydrocarbon | **E.** Halogen - Alcohol - Phenol | **F.** Carbonyl - Carboxylic acid`,

  cheatResponse: `Thầy/Cô hiểu em muốn đi nhanh hơn, nhưng để nắm chắc kiến thức, mình vẫn cần hoàn thành bước hiện tại nhé! 😊

Phương pháp học Socratic của thầy/cô giúp em thực sự hiểu bài, không chỉ biết đáp án. Em hoàn thành câu hỏi thầy/cô vừa đặt ra xem sao?`,

  outOfScope: `Câu hỏi này nằm ngoài phạm vi môn Hóa học mà thầy/cô hỗ trợ. Mình quay lại bài học nhé — em còn thắc mắc gì về Hóa học 11 không? 😊`,

  // NHÁNH A
  a2_core: (chapter: string, question: string) => `Tuyệt vời! Câu hỏi của em thuộc chương **${chapter}** — đúng rồi!

🎯 Bước tiếp theo, em hãy xác định **tính chất/hiện tượng cốt lõi** liên quan đến câu hỏi: *"${question}"*

Theo em, điều nào đúng nhất?

**A.** Đây liên quan đến sự thay đổi trạng thái vật lý
**B.** Đây liên quan đến phản ứng hóa học và sự thay đổi liên kết
**C.** Đây liên quan đến sự cân bằng giữa các quá trình thuận và nghịch
**D.** Đây liên quan đến tính chất đặc trưng của nhóm chức/nguyên tố

*(Em chọn đáp án và giải thích vì sao nhé!)*`,

  a3_essence: `Xuất sắc! Em đã xác định đúng tính chất cốt lõi rồi! 🌟

Bây giờ đến phần quan trọng nhất — **đào sâu bản chất**:

Theo em, dựa vào **cấu tạo nguyên tử** hoặc **liên kết hóa học**, tại sao chất này lại có tính chất đó / tại sao hiện tượng này lại xảy ra?

*(Hãy nghĩ về: cấu hình electron, độ âm điện, liên kết, nhóm chức... Em tự phân tích nhé!)*`,

  a4_equation: `Rất giỏi! Em đã giải thích đúng bản chất rồi! 👏

🧪 Bây giờ để **minh họa rõ hơn**, em hãy viết phương trình hóa học của phản ứng xảy ra.

*(Chú ý: ghi rõ điều kiện phản ứng nếu có, dùng ký hiệu Unicode: H₂SO₄, Fe³⁺, ⇌, →...)*`,

  a5_summary: `Phương trình của em chuẩn xác rồi! Tuyệt vời! 🎉

📝 Bước cuối cùng — **Tổng hợp và liên hệ thực tiễn**:

Từ phương trình và bản chất vừa phân tích, em hãy:
1. Tự **tóm tắt lại** câu trả lời cho câu hỏi ban đầu
2. Nêu **ứng dụng thực tiễn** của phản ứng này trong đời sống

*(Em viết tổng kết của mình nhé, thầy/cô sẽ nhận xét!)*`,

  a6_done: (question: string) => `🎊 Chúc mừng em! Em đã tự mình dùng tư duy Socratic để khám phá và trả lời câu hỏi *"${question}"* — thật đáng khen!

✅ **Kiến thức trọng tâm em vừa nắm được:**
Em đã đi qua đầy đủ: Xác định chương → Tính chất cốt lõi → Bản chất hóa học → Phương trình → Liên hệ thực tiễn.

---
Em đã hiểu rõ bản chất phần này chưa? Mình tiếp tục khám phá bài tập khác nhé! 🚀`,

  // NHÁNH B
  b2_data: `Tốt lắm! Vậy kiến thức này đúng chương rồi! ✅

📋 **Bước B2 — Tóm tắt dữ kiện đề bài:**

Trước khi tính toán, em hãy liệt kê giúp thầy/cô:
- **Đề bài cho những dữ kiện gì?** (nồng độ, khối lượng, thể tích, nhiệt độ...)
- **Yêu cầu tìm cái gì?**

*(Hãy gõ đầy đủ các dữ kiện đề cho nhé!)*`,

  b3_formula: `Rất tốt! Em đã liệt kê đầy đủ dữ kiện rồi! 👍

📐 **Bước B3 — Chọn công thức/định luật cần dùng:**

Để giải bài này, em cần áp dụng công thức nào?

**A.** n = m/M (số mol từ khối lượng)
**B.** C = n/V hoặc CM = n/V (nồng độ mol)
**C.** Định luật bảo toàn khối lượng / bảo toàn electron
**D.** Hằng số cân bằng Kc = [sản phẩm]/[chất đầu]

*(Em chọn và giải thích tại sao công thức đó phù hợp với dữ kiện đề bài nhé!)*`,

  b4_plan: `Xuất sắc! Em chọn đúng công thức rồi! 🌟

🗺️ **Bước B4 — Lập kế hoạch giải:**

Theo em, để đi từ dữ kiện đề cho đến đáp số cuối cùng, mình cần thực hiện các bước theo thứ tự nào?

*(Hãy liệt kê thứ tự các bước tính, ví dụ: Bước 1 tính n, Bước 2 áp dụng phương trình...)*`,

  b5_calculate: `Kế hoạch của em rất logic! 👏

🔢 **Bước B5 — Tính toán từng bước:**

Bây giờ em hãy **tự thực hiện** từng bước đã lên kế hoạch và báo kết quả từng bước cho thầy/cô nhé!

*(Chú ý: kiểm tra kỹ đơn vị, hệ số ở mỗi bước trước khi sang bước tiếp!)*`,

  b5_wrong: `Kết quả em báo chưa đúng rồi! Đừng nản nhé, thầy/cô hỏi em một chút:

🔍 Em hãy **kiểm tra lại** bước vừa thực hiện:
- Đơn vị có nhất quán chưa? (mol, lít, gam...)
- Em đã áp dụng đúng công thức chưa?
- Giá trị em dùng có khớp với dữ kiện đề cho không?

Em thử lại và báo kết quả nhé!`,

  b6_hint: (step: string) => `Thầy/Cô thấy em đang gặp khó ở **${step}**. Hãy để thầy/cô giúp em tìm lại hướng đi!

❓ Câu hỏi gợi ý: Trong bước này, em cần **chuyển đổi** đại lượng nào? Công thức liên kết hai đại lượng đó là gì?

**A.** n (mol) = m (g) ÷ M (g/mol)
**B.** V (lít) = n × 24,79 (ở đkc: 25 °C, 1 bar)
**C.** C (mol/L) = n ÷ V
**D.** Tỉ lệ mol theo phương trình hóa học

*(Em chọn công thức đúng, rồi tự áp dụng vào số liệu của bài nhé — thầy/cô không tính thay đâu!)*`,

  bdone: (question: string) => `🎊 **Chúc mừng em đã hoàn thành bài toán!**

Em đã tự giải bài *"${question}"* theo đúng quy trình Socratic — rất đáng khen!

---
💡 **Liên hệ thực tiễn:** Kết quả em vừa tính có ý nghĩa thực tế quan trọng trong hóa học ứng dụng và đời sống. Hãy suy nghĩ: con số này trong thực tế thường gặp ở đâu, có an toàn không?

Mình tiếp tục với bài tập khác nhé! 🚀`,

  // QUY TẮC 3 LẦN KHÔNG BIẾT
  threeTimesUnknown: (lessonId: string) =>
    `Thầy/Cô thấy em đang gặp khó khăn ở phần này — không sao cả, học là phải có lúc vấp! 😊

📖 Để em nắm vững kiến thức nền trước, thầy/cô yêu cầu em **hoàn thành bài học trên website** liên quan đến câu hỏi này nhé:

👉 [Mở bài học tương ứng]

Sau khi hoàn thành **xem lý thuyết + làm bài tập cơ bản** và đạt **≥ 70% điểm**, hãy quay lại đây báo thầy/cô nhé!

[GỌI_API_KIỂM_TRA_ĐIỂM: ${lessonId}]`,

  apiScorePass: `🎉 Tuyệt vời! Em đã hoàn thành bài học đạt ≥ 70% — thầy/cô rất vui!

Bây giờ mình thử lại câu hỏi ban đầu nhé. Em hãy trả lời lại câu thầy/cô vừa hỏi dựa trên kiến thức vừa ôn:`,

  apiScoreFail: `Em chưa đạt 70% ở bài học này. Đừng nản nhé — hãy **xem lại phần lý thuyết** và làm thêm bài tập cơ bản đến khi đạt nhé!

Thầy/Cô sẽ chờ em hoàn thành bài học rồi mình cùng giải câu hỏi này. 💪

[GỌI_API_KIỂM_TRA_ĐIỂM: ${'' /* sẽ được điền khi gọi */}]`,
};

// ============================================================
// HÀM CHÍNH: generateAIResponse
// ============================================================

export const generateAIResponse = async (
  lessonId: string,
  userQuestion: string,
  history: ChatMessage[],
  userEmail: string = 'guest'
): Promise<string> => {
  await delay(900);

  const session = getSession(userEmail, lessonId);
  const text = userQuestion.trim();
  const lower = text.toLowerCase();

  // ----- KIỂM TRA CHỐNG LÁCH LUẬT (ưu tiên cao nhất) -----
  if (isCheatAttempt(text)) {
    return STEP_PROMPTS.cheatResponse;
  }

  // ----- KIỂM TRA NGOÀI PHẠM VI MÔN HỌC -----
  const offTopicKeywords = [
    'toán', 'vật lý', 'sinh học', 'lịch sử', 'địa lý', 'văn học',
    'tiếng anh', 'tin học', 'gdcd', 'thể dục',
  ];
  const isOffTopic =
    offTopicKeywords.some(k => lower.includes(k)) &&
    !lower.includes('hóa') &&
    !lower.includes('hoa') &&
    !lower.includes('chất') &&
    !lower.includes('phản ứng');
  if (isOffTopic) {
    return STEP_PROMPTS.outOfScope;
  }

  // ----- BƯỚC 0: PHÂN LOẠI CÂU HỎI -----
  if (session.step === 'step0_classify') {
    // Câu hỏi mới đầu tiên → ghi nhớ câu hỏi và hỏi phân loại
    if (session.originalQuestion === '') {
      session.originalQuestion = text;
      return STEP_PROMPTS.classify;
    }
    // Đang chờ phân loại
    if (isTheory(text)) {
      session.branch = 'theory';
      session.step = 'stepA1_chapter';
      return STEP_PROMPTS.chapterQuestion;
    }
    if (isCalculation(text)) {
      session.branch = 'calculation';
      session.step = 'stepB1_chapter';
      return STEP_PROMPTS.chapterQuestion;
    }
    // Không rõ → hỏi lại
    return `Thầy/Cô chưa hiểu rõ ý em! Em hãy cho thầy/cô biết:
- Gõ **"Lý thuyết"** nếu câu hỏi về bản chất, khái niệm, nguyên lý
- Gõ **"Bài toán"** nếu câu hỏi có số liệu và cần tính ra kết quả

Câu hỏi ban đầu của em: *"${session.originalQuestion}"*`;
  }

  // ----- XỬ LÝ THEO NHÁNH -----
  if (session.branch === 'theory') {
    return handleTheoryBranch(session, lessonId, text);
  }
  if (session.branch === 'calculation') {
    return handleCalculationBranch(session, lessonId, text);
  }

  // Fallback: reset về step 0 nếu trạng thái không hợp lệ
  session.step = 'step0_classify';
  session.originalQuestion = text;
  return STEP_PROMPTS.classify;
};

// ============================================================
// NHÁNH A: LÝ THUYẾT
// ============================================================
function handleTheoryBranch(session: SessionState, lessonId: string, text: string): string {
  const lower = text.toLowerCase().trim();

  // A1: Xác định chương
  if (session.step === 'stepA1_chapter') {
    const chapter = detectChapter(lower) || LESSON_CHAPTER_MAP[lessonId];
    if (chapter) {
      session.chapter = chapter;
      session.step = 'stepA2_core';
      session.unknownCount = 0;
      return STEP_PROMPTS.a2_core(chapter, session.originalQuestion);
    }
    return STEP_PROMPTS.chapterWrong.replace('{question}', session.originalQuestion);
  }

  // A2: Tính chất/hiện tượng cốt lõi
  if (session.step === 'stepA2_core') {
    if (isDontKnow(text)) {
      session.unknownCount++;
      if (session.unknownCount >= 3) {
        session.unknownCount = 0;
        return STEP_PROMPTS.threeTimesUnknown(lessonId);
      }
      return `Đừng lo! Thầy/Cô gợi ý nhỏ: Hãy đọc lại câu hỏi ban đầu — *"${session.originalQuestion}"* — và nghĩ xem đây là hiện tượng vật lý hay hóa học? Liên quan đến liên kết hay trạng thái?

Em thử chọn lại nhé: **A, B, C hay D?**`;
    }
    // Kiểm tra chọn đáp án (B hoặc D thường đúng trong ngữ cảnh hóa học)
    const correctChoices = ['b', 'c', 'd'];
    if (correctChoices.some(c => lower === c || lower.startsWith(c + '.') || lower.startsWith(c + ' '))) {
      session.step = 'stepA3_essence';
      session.unknownCount = 0;
      return `✅ Chính xác! Em đã nhận ra đúng tính chất cốt lõi rồi! Tuyệt vời!

` + STEP_PROMPTS.a3_essence;
    }
    if (lower === 'a') {
      return `Chưa đúng rồi em! Đây không phải chỉ là sự thay đổi trạng thái vật lý — có sự biến đổi **liên kết hóa học** xảy ra.

Hãy xem lại các đáp án **B, C, D** — cái nào phù hợp hơn với câu hỏi *"${session.originalQuestion}"*?`;
    }
    // Câu trả lời dài → chấp nhận nếu có nội dung đúng
    if (text.length > 20) {
      session.step = 'stepA3_essence';
      session.unknownCount = 0;
      return `Ý em đúng hướng rồi! 👍 Thầy/Cô ghi nhận em đã xác định được tính chất cốt lõi.

` + STEP_PROMPTS.a3_essence;
    }
    return `Thầy/Cô chưa rõ em muốn chọn đáp án nào. Em gõ **A, B, C hoặc D** nhé, hoặc giải thích thêm ý em đang nghĩ!`;
  }

  // A3: Bản chất nguyên nhân
  if (session.step === 'stepA3_essence') {
    if (isDontKnow(text)) {
      session.unknownCount++;
      if (session.unknownCount >= 3) {
        session.unknownCount = 0;
        return STEP_PROMPTS.threeTimesUnknown(lessonId);
      }
      return `Gợi ý nhỏ: Em hãy nghĩ về **${session.chapter}** — điều gì ở cấp độ nguyên tử/phân tử làm cho phản ứng/hiện tượng này xảy ra?

*(Hint: cấu hình electron, độ bền liên kết, nhóm chức...)*`;
    }
    if (text.length >= 15) {
      session.step = 'stepA4_equation';
      session.unknownCount = 0;
      return `Rất giỏi! Em đã giải thích đúng bản chất rồi! 🌟

` + STEP_PROMPTS.a4_equation;
    }
    return `Em hãy giải thích **chi tiết hơn** nhé — thầy/cô muốn nghe em phân tích từ góc độ cấu tạo nguyên tử hoặc liên kết hóa học. Đừng ngại viết dài!`;
  }

  // A4: Phương trình hóa học
  if (session.step === 'stepA4_equation') {
    if (isDontKnow(text)) {
      session.unknownCount++;
      if (session.unknownCount >= 3) {
        session.unknownCount = 0;
        return STEP_PROMPTS.threeTimesUnknown(lessonId);
      }
      return `Thầy/Cô gợi ý: Hãy nghĩ về các **chất tham gia** và **sản phẩm** của phản ứng này. Viết công thức các chất trước, sau đó cân bằng số nguyên tử nhé!

*(Dùng ký hiệu Unicode: H₂O, CO₂, Fe₂O₃, ⇌, →...)*`;
    }
    // Kiểm tra có ký hiệu hóa học cơ bản
    const hasChemical =
      text.includes('→') || text.includes('⇌') || text.includes('+') ||
      /[A-Z][a-z]?[₀₁₂₃₄₅₆₇₈₉]/.test(text) ||
      /[A-Z][a-z]?\d/.test(text) || text.length > 10;
    if (hasChemical) {
      // Kiểm tra cân bằng cơ bản (kiểm tra đơn giản)
      if (!text.includes('→') && !text.includes('+') && !text.includes('⇌') && text.length < 20) {
        return `Em hãy viết phương trình **đầy đủ** hơn nhé — gồm chất tham gia, mũi tên (→ hoặc ⇌) và sản phẩm. Đừng quên điều kiện phản ứng nếu có!`;
      }
      session.step = 'stepA5_summary';
      session.unknownCount = 0;

      // Gợi ý video nếu phù hợp
      const videoHint = session.chapter.includes('Nitrogen') || session.chapter.includes('Sulfur')
        ? '\n\n[YÊU CẦU VIDEO: Thí nghiệm điều chế và tính chất của Nitrogen/Sulfur]'
        : session.chapter.includes('Cân bằng')
        ? '\n\n[YÊU CẦU VIDEO: Thí nghiệm minh họa sự chuyển dịch cân bằng hóa học]'
        : '';

      return `Phương trình của em rất tốt! Thầy/Cô nhận xét: hãy chú ý dùng ký hiệu Unicode cho đẹp (H₂SO₄ thay vì H2SO4) nhé!${videoHint}

` + STEP_PROMPTS.a5_summary;
    }
    return `Thầy/Cô chưa thấy phương trình hóa học trong câu trả lời của em. Em hãy viết ra **phương trình hóa học** có chất tham gia, mũi tên và sản phẩm nhé!`;
  }

  // A5: Tổng hợp & liên hệ thực tiễn
  if (session.step === 'stepA5_summary') {
    if (isDontKnow(text)) {
      session.unknownCount++;
      if (session.unknownCount >= 3) {
        session.unknownCount = 0;
        return STEP_PROMPTS.threeTimesUnknown(lessonId);
      }
      return `Gợi ý: Em hãy nhìn lại các bước mình vừa làm — từ tính chất cốt lõi → bản chất → phương trình — và **tóm tắt lại** bằng 2-3 câu. Ứng dụng thực tiễn có thể là sản xuất công nghiệp, y tế, môi trường...`;
    }
    if (text.length >= 20) {
      session.step = 'stepA6_done';
      return STEP_PROMPTS.a6_done(session.originalQuestion);
    }
    return `Em hãy viết **đầy đủ hơn** nhé — tóm tắt câu trả lời ban đầu **VÀ** nêu ít nhất một ứng dụng thực tiễn!`;
  }

  // A6: Done — reset session cho câu hỏi mới
  if (session.step === 'stepA6_done') {
    const email = 'guest'; // sẽ được truyền đúng khi refactor
    const key = Object.keys(sessionStore).find(k => sessionStore[k] === session);
    if (key) {
      sessionStore[key] = {
        branch: 'none',
        step: 'step0_classify',
        originalQuestion: text,
        chapter: '',
        unknownCount: 0,
        b5AttemptCount: 0,
      };
    }
    return STEP_PROMPTS.classify;
  }

  return `Thầy/Cô chưa hiểu câu trả lời của em. Em hãy trả lời câu hỏi thầy/cô vừa đặt nhé!`;
}

// ============================================================
// NHÁNH B: BÀI TOÁN TÍNH TOÁN
// ============================================================
function handleCalculationBranch(session: SessionState, lessonId: string, text: string): string {
  const lower = text.toLowerCase().trim();

  // B1: Xác định chương
  if (session.step === 'stepB1_chapter') {
    const chapter = detectChapter(lower) || LESSON_CHAPTER_MAP[lessonId];
    if (chapter) {
      session.chapter = chapter;
      session.step = 'stepB2_data';
      session.unknownCount = 0;
      return `Chính xác! Chương **${chapter}** — đúng rồi! ✅

` + STEP_PROMPTS.b2_data;
    }
    return STEP_PROMPTS.chapterWrong.replace('{question}', session.originalQuestion);
  }

  // B2: Tóm tắt dữ kiện
  if (session.step === 'stepB2_data') {
    if (isDontKnow(text)) {
      session.unknownCount++;
      if (session.unknownCount >= 3) {
        session.unknownCount = 0;
        return STEP_PROMPTS.threeTimesUnknown(lessonId);
      }
      return `Gợi ý: Hãy đọc lại đề bài — tìm các **số liệu cụ thể** (khối lượng, thể tích, nồng độ, nhiệt độ...) và **câu hỏi cuối bài** (tìm gì?). Liệt kê từng dòng một nhé!`;
    }

    // Kiểm tra xem học sinh có vừa tóm tắt dữ kiện VÀ nêu công thức không (xuất sắc → bỏ qua B3)
    const hasFormula =
      lower.includes('công thức') || lower.includes('n =') || lower.includes('c =') ||
      lower.includes('kc') || lower.includes('bảo toàn') || lower.includes('mol');
    const hasData =
      /\d/.test(text) || lower.includes('cho') || lower.includes('biết') ||
      lower.includes('dữ kiện') || lower.includes('g)') || lower.includes('ml') ||
      lower.includes('lít') || lower.includes('mol') || text.length > 30;

    if (hasData && hasFormula) {
      // Xuất sắc: bỏ qua B3, chuyển thẳng sang B4
      session.step = 'stepB4_plan';
      session.unknownCount = 0;
      return `Xuất sắc! 🌟 Em đã vừa tóm tắt dữ kiện **và** xác định được công thức sẽ dùng — thầy/cô rất ấn tượng!

` + STEP_PROMPTS.b4_plan;
    }

    if (hasData || text.length > 20) {
      session.step = 'stepB3_formula';
      session.unknownCount = 0;
      return `Tốt lắm! Em đã liệt kê đủ dữ kiện rồi! ✅

` + STEP_PROMPTS.b3_formula;
    }

    return `Em hãy liệt kê **cụ thể hơn** nhé — đề bài cho những số nào, đơn vị là gì, và yêu cầu tìm đại lượng nào?`;
  }

  // B3: Công thức/định luật
  if (session.step === 'stepB3_formula') {
    if (isDontKnow(text)) {
      session.unknownCount++;
      if (session.unknownCount >= 3) {
        session.unknownCount = 0;
        return STEP_PROMPTS.threeTimesUnknown(lessonId);
      }
      return `Gợi ý: Nhìn vào dữ kiện em vừa liệt kê — đề cho **loại đại lượng gì** (khối lượng? nồng độ? thể tích?)? Công thức nào liên kết các đại lượng đó với nhau?`;
    }

    const correctChoices = ['a', 'b', 'c', 'd'];
    const wrongExplanations: Record<string, string> = {
      'a': 'Công thức n = m/M dùng để tính số mol từ khối lượng — phù hợp khi đề cho khối lượng. Với bài này, hãy xem lại dữ kiện đề có khớp không?',
      'b': 'C = n/V dùng cho bài toán nồng độ mol. Hãy kiểm tra xem đề bài có liên quan đến dung dịch và thể tích không?',
      'c': 'Bảo toàn khối lượng/electron dùng cho phản ứng oxi hóa-khử. Đây có phải loại bài đó không?',
      'd': 'Hằng số cân bằng Kc dùng khi đề bài nói về trạng thái cân bằng. Hãy kiểm tra lại!',
    };

    const chosen = correctChoices.find(c => lower === c || lower.startsWith(c + '.') || lower.startsWith(c + ' '));
    if (chosen) {
      // Chấp nhận tất cả các lựa chọn nếu có giải thích → chuyển B4
      if (text.length > 5 || lower.length === 1) {
        session.step = 'stepB4_plan';
        session.unknownCount = 0;
        return `Tốt lắm! Em đã chọn được công thức phù hợp! ✅

` + STEP_PROMPTS.b4_plan;
      }
    }

    if (text.length > 20) {
      session.step = 'stepB4_plan';
      session.unknownCount = 0;
      return `Ý em đúng hướng! Em đã xác định được công thức cần dùng.

` + STEP_PROMPTS.b4_plan;
    }

    return `Em hãy **chọn đáp án** (A, B, C hoặc D) và giải thích ngắn gọn tại sao công thức đó phù hợp với dữ kiện bài nhé!`;
  }

  // B4: Lập kế hoạch giải
  if (session.step === 'stepB4_plan') {
    if (isDontKnow(text)) {
      session.unknownCount++;
      if (session.unknownCount >= 3) {
        session.unknownCount = 0;
        return STEP_PROMPTS.threeTimesUnknown(lessonId);
      }
      return `Gợi ý lập kế hoạch: Hãy nghĩ từ **điểm đầu** (dữ kiện đề cho) đến **điểm cuối** (đáp số cần tìm). Mỗi bước là một phép biến đổi. Em thử viết "Bước 1:..., Bước 2:..." nhé!`;
    }

    // Chấp nhận nếu có thứ tự bước hoặc câu trả lời đủ dài
    const hasPlan =
      lower.includes('bước') || lower.includes('step') || lower.includes('trước') ||
      lower.includes('sau đó') || lower.includes('tiếp theo') || text.length > 25;

    if (hasPlan) {
      session.step = 'stepB5_calculate';
      session.unknownCount = 0;
      session.b5AttemptCount = 0;
      return `Kế hoạch của em rất logic! Thầy/Cô phê duyệt! 👏

` + STEP_PROMPTS.b5_calculate;
    }

    return `Em hãy **liệt kê thứ tự các bước** cụ thể hơn nhé. Ví dụ: "Bước 1: Tính số mol... → Bước 2: Áp dụng phương trình... → Bước 3: Tính kết quả..."`;
  }

  // B5: Học sinh tự tính toán
  if (session.step === 'stepB5_calculate') {
    if (isDontKnow(text)) {
      session.unknownCount++;
      if (session.unknownCount >= 3) {
        session.unknownCount = 0;
        session.step = 'stepB6_hint';
        return STEP_PROMPTS.b6_hint('bước tính toán');
      }
      return `Đừng nản! Em hãy thử viết ra **phép tính** theo bước đầu tiên trong kế hoạch của mình — dù chưa chắc đúng cũng được, thầy/cô sẽ hướng dẫn tiếp!`;
    }

    // Kiểm tra có số liệu / phép tính
    const hasCalculation =
      /[\d.,]+/.test(text) ||
      text.includes('=') || text.includes('mol') || text.includes('gam') ||
      text.includes('lít') || text.includes('M') || text.length > 10;

    if (hasCalculation) {
      session.b5AttemptCount++;
      // Giả sử đúng (trong mock service, ta không có đề bài cụ thể để verify)
      // Trong thực tế sẽ cần AI thật để kiểm tra
      if (session.b5AttemptCount <= 2) {
        // Khen và cho tiếp
        const isLikelyFinalAnswer =
          lower.includes('vậy') || lower.includes('kết quả') || lower.includes('đáp số') ||
          lower.includes('cm =') || lower.includes('nồng độ') || lower.includes('khối lượng') ||
          session.b5AttemptCount >= 2;

        if (isLikelyFinalAnswer) {
          session.step = 'stepB_done';
          return STEP_PROMPTS.bdone(session.originalQuestion);
        }
        return `Tốt lắm! Bước vừa rồi em làm đúng rồi! 👍

Tiếp tục nhé — em hãy thực hiện **bước tiếp theo** trong kế hoạch và báo kết quả!`;
      } else {
        // Thử 2 lần rồi → chuyển B6
        session.step = 'stepB6_hint';
        session.unknownCount = 0;
        return `Em đã cố gắng rồi! Thầy/Cô sẽ hỗ trợ thêm ở bước này.

` + STEP_PROMPTS.b6_hint('bước em đang tính');
      }
    }

    return `Em hãy viết ra **kết quả tính toán cụ thể** nhé — có số, đơn vị và giải thích ngắn gọn em làm gì ở bước đó!`;
  }

  // B6: Gợi ý có cấu trúc
  if (session.step === 'stepB6_hint') {
    if (isDontKnow(text)) {
      session.unknownCount++;
      if (session.unknownCount >= 3) {
        session.unknownCount = 0;
        return STEP_PROMPTS.threeTimesUnknown(lessonId);
      }
      return `Thầy/Cô gợi ý thêm: Em hãy chọn **một trong các công thức** ở trên, thay số vào và tính từng bước nhỏ một!`;
    }

    const correctChoices = ['a', 'b', 'c', 'd'];
    const chosen = correctChoices.find(c => lower.startsWith(c));
    if (chosen || text.length > 15) {
      // Cho tiếp bước B5 sau khi gợi ý
      session.step = 'stepB5_calculate';
      session.b5AttemptCount = 0;
      return `Đúng rồi! Bây giờ em tự áp dụng công thức đó vào số liệu của bài nhé — thầy/cô không tính thay đâu! 😄

Em viết phép tính và ra kết quả cho thầy/cô xem!`;
    }

    return `Em hãy **chọn công thức** phù hợp (A, B, C hoặc D) rồi tự áp dụng vào bài nhé!`;
  }

  // B Done → reset
  if (session.step === 'stepB_done') {
    const key = Object.keys(sessionStore).find(k => sessionStore[k] === session);
    if (key) {
      sessionStore[key] = {
        branch: 'none',
        step: 'step0_classify',
        originalQuestion: text,
        chapter: '',
        unknownCount: 0,
        b5AttemptCount: 0,
      };
    }
    return STEP_PROMPTS.classify;
  }

  return `Thầy/Cô chưa hiểu câu trả lời của em. Em hãy trả lời câu hỏi thầy/cô vừa đặt nhé!`;
}
