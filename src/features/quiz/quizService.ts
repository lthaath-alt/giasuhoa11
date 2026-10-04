import { Quiz, QuizQuestionResult } from './types';
import { chonCauChoDeChuong } from './deChuong';
import { xaoPhuongAnWeb } from '../bank/xaoDapAn';
import { QuizStorage } from './quizStorage';
import { luuBaiNop } from './baiNopService';
import { chamDapSo, chamDungSaiNhieuY, dapSoCua } from './chamDiem';
import { Question, QuestionType, DifficultyLevel } from '../library/types';
import {
  layCauHoiCuaBai,
  chuanHoaDoKho,
  TRONG_SO_DO_KHO,
  LOG_TAO_DE,
} from '../library/questionBank';

// ============================================================
// BỘ CÂU HỎI DỰ PHÒNG (MOCK BACKUP QUESTIONS)
// ============================================================
//
// Chỉ dùng khi bài học ĐÓ chưa có câu nào trong cả 3 kho, và chỉ lấy đúng khoá
// `lessonId` của chính nó.
//
// CỐ Ý KHÔNG còn `DEFAULT_FALLBACK_QUESTIONS` — bộ "dự phòng chung" cho mọi
// bài. Bài nào không có khoá riêng ở đây thì trước kia lấy một bộ câu cứng về
// hợp chất hữu cơ/alkane, nên học sinh hỏi Bài 1 xong bấm link kiểm tra lại
// phải làm đề của bài khác hẳn. Thà không có đề còn hơn giao nhầm đề.

const BACKUP_QUESTIONS: Record<string, any[]> = {
  'bai-1': [
    {
      id: 'bq-1-1',
      type: 'Trắc nghiệm',
      difficulty: 'Thấp',
      points: 1,
      content: 'Trong các phản ứng sau, phản ứng nào là phản ứng thuận nghịch?',
      options: [
        { key: 'A', text: '2H₂ + O₂ → 2H₂O' },
        { key: 'B', text: 'N₂ + 3H₂ ⇌ 2NH₃' },
        { key: 'C', text: 'NaOH + HCl → NaCl + H₂O' },
        { key: 'D', text: 'Zn + 2HCl → ZnCl₂ + H₂' }
      ],
      correctAnswer: 'B'
    },
    {
      id: 'bq-1-2',
      type: 'Trắc nghiệm',
      difficulty: 'Trung bình',
      points: 2,
      content: 'Hằng số cân bằng K<sub>c</sub> của một phản ứng xác định chỉ phụ thuộc vào yếu tố nào sau đây?',
      options: [
        { key: 'A', text: 'Nồng độ các chất phản ứng' },
        { key: 'B', text: 'Nhiệt độ của hệ' },
        { key: 'C', text: 'Chất xúc tác' },
        { key: 'D', text: 'Áp suất của hệ' }
      ],
      correctAnswer: 'B'
    },
    {
      id: 'bq-1-3',
      type: 'Đúng/Sai',
      difficulty: 'Thấp',
      points: 1,
      content: 'Khi một phản ứng thuận nghịch đạt trạng thái cân bằng hóa học, phản ứng sẽ dừng lại hoàn toàn.',
      correctAnswer: 'Sai'
    },
    {
      id: 'bq-1-4',
      type: 'Đúng/Sai',
      difficulty: 'Trung bình',
      points: 2,
      content: 'Theo nguyên lí chuyển dịch cân bằng Le Chatelier, khi tăng nhiệt độ của hệ, cân bằng sẽ chuyển dịch theo chiều thu nhiệt (ΔH > 0).',
      correctAnswer: 'Đúng'
    },
    {
      id: 'bq-1-5',
      type: 'Tự luận',
      difficulty: 'Cao',
      points: 3,
      content: 'Cho cân bằng hóa học trong buồng phản ứng kín: N₂(g) + 3H₂(g) ⇌ 2NH₃(g) &nbsp; ΔH < 0. Hãy giải thích tại sao khi tăng áp suất chung của hệ thì cân bằng dịch chuyển theo chiều thuận và viết biểu thức hằng số cân bằng K<sub>c</sub>.',
      essayPoints: [
        { label: 'Ý 1', content: 'Khi tăng áp suất, cân bằng chuyển dịch theo chiều giảm áp suất (giảm số mol khí).' },
        { label: 'Ý 2', content: 'Số mol khí vế trái là 4 mol, vế phải là 2 mol. Do đó chiều thuận là chiều giảm số mol khí.' },
        { label: 'Ý 3', content: 'Biểu thức hằng số cân bằng: Kc = [NH₃]² / ([N₂].[H₂]³).' }
      ]
    }
  ],
  'bai-2': [
    {
      id: 'bq-2-1',
      type: 'Trắc nghiệm',
      difficulty: 'Thấp',
      points: 1,
      content: 'Chất nào sau đây là chất điện li mạnh trong dung dịch nước?',
      options: [
        { key: 'A', text: 'CH₃COOH' },
        { key: 'B', text: 'C₂H₅OH' },
        { key: 'C', text: 'NaCl' },
        { key: 'D', text: 'H₂O' }
      ],
      correctAnswer: 'C'
    },
    {
      id: 'bq-2-2',
      type: 'Trắc nghiệm',
      difficulty: 'Trung bình',
      points: 2,
      content: 'Giá trị pH của dung dịch HCl 0,01M là bao nhiêu?',
      options: [
        { key: 'A', text: '2' },
        { key: 'B', text: '12' },
        { key: 'C', text: '7' },
        { key: 'D', text: '1' }
      ],
      correctAnswer: 'A'
    },
    {
      id: 'bq-2-3',
      type: 'Đúng/Sai',
      difficulty: 'Thấp',
      points: 1,
      content: 'Dung dịch nước của các chất không điện li (như saccharose, ethanol) vẫn có thể dẫn điện tốt.',
      correctAnswer: 'Sai'
    },
    {
      id: 'bq-2-4',
      type: 'Đúng/Sai',
      difficulty: 'Trung bình',
      points: 2,
      content: 'Dung dịch có giá trị pH < 7 là dung dịch có môi trường acid, trong đó nồng độ [H⁺] > 10⁻⁷ M.',
      correctAnswer: 'Đúng'
    },
    {
      id: 'bq-2-5',
      type: 'Tự luận',
      difficulty: 'Cao',
      points: 3,
      content: 'Hãy nêu khái niệm acid, base theo thuyết Brønsted-Lowry và viết phương trình điện li minh họa cho sự nhận/cho proton của NH₃ trong dung dịch nước.',
      essayPoints: [
        { label: 'Ý 1', content: 'Acid là chất cho proton (H⁺), base là chất nhận proton (H⁺).' },
        { label: 'Ý 2', content: 'NH₃ nhận proton từ nước để tạo thành ion ammonium.' },
        { label: 'Ý 3', content: 'Phương trình hóa học: NH₃ + H₂O ⇌ NH₄⁺ + OH⁻.' }
      ]
    }
  ]
};

// ============================================================
// QUIZ SERVICE FUNCTIONS
// ============================================================

export const QuizService = {
  /**
   * Kho câu hỏi dùng được cho MỘT bài học.
   *
   * Thứ tự ưu tiên: câu THẬT của bài (gom từ cả 3 kho qua `layCauHoiCuaBai`),
   * hết mới tới bộ dự phòng ĐÚNG bài đó. Không bao giờ với sang bài khác.
   */
  async layKhoCauHoi(chapterId: string, lessonId: string, nganHang: Question[] = []): Promise<Question[]> {
    const cauThat = await layCauHoiCuaBai(chapterId, lessonId, nganHang);
    if (cauThat.length > 0) return cauThat;

    const duPhong = BACKUP_QUESTIONS[lessonId];
    if (LOG_TAO_DE) {
      console.warn(
        `[Quiz] Bài "${lessonId}" KHÔNG có câu thật nào. ` +
        (duPhong
          ? `Dùng bộ dự phòng riêng của bài này (${duPhong.length} câu).`
          : 'Cũng không có bộ dự phòng riêng → sẽ KHÔNG tạo đề.'),
      );
    }
    if (!duPhong) return [];

    return duPhong.map(q => ({
      id: q.id,
      type: q.type as QuestionType,
      difficulty: chuanHoaDoKho(q.difficulty),
      points: q.points,
      content: q.content,
      images: q.images || [],
      options: q.options,
      correctAnswer: q.correctAnswer,
      essayPoints: q.essayPoints,
      chapterId,
      lessonId,
      createdAt: q.createdAt || new Date().toISOString(),
    }));
  },

  /**
   * Tạo bài kiểm tra làm lại (chọn câu mới, loại bỏ các câu hỏi cũ đã làm ở lần gần nhất)
   * Trả về Quiz nếu thành công, trả về null nếu không đủ câu hỏi hợp lệ.
   */
  async createRetryQuiz(
    chapterId: string,
    lessonId: string,
    userEmail: string,
    excludeIds: string[],
    nganHang: Question[] = [],
  ): Promise<Quiz | null> {
    const bankQuestions = await this.layKhoCauHoi(chapterId, lessonId, nganHang);

    // Lọc bỏ những câu đã xuất hiện trong đề cũ (excludeIds)
    const availableQuestions = bankQuestions.filter(q => !excludeIds.includes(q.id));

    // Cần tối thiểu 5 câu để tạo đề mới
    const targetCount = 5;
    if (availableQuestions.length < targetCount) {
      return null; // Không đủ câu hỏi mới
    }

    // Lấy câu hỏi ngẫu nhiên từ kho câu hỏi hợp lệ (có thể ưu tiên chưa làm bao giờ, nhưng ở đây cứ random)
    const finalSelection = this.shuffleArray(availableQuestions).slice(0, Math.min(8, availableQuestions.length));

    finalSelection.sort((a, b) => TRONG_SO_DO_KHO[a.difficulty] - TRONG_SO_DO_KHO[b.difficulty]);

    const maxScore = finalSelection.reduce((sum, q) => sum + (q.points || 1), 0);
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const quiz: Quiz = {
      id: `quiz_retry_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      lessonId,
      chapterId,
      userEmail,
      questions: finalSelection.map(xaoPhuongAnWeb),
      answers: {},
      status: 'pending',
      score: 0,
      maxScore,
      createdAt,
      expiresAt
    };

    QuizStorage.addQuiz(quiz);
    return quiz;
  },

  /**
   * Tạo bài kiểm tra TỔNG HỢP một chương.
   *
   * Phần chọn câu nằm ở `deChuong.ts` — thuần logic, không đọc ghi gì, nên viết
   * được bài kiểm tra tự động cho nó mà không phải dựng Firebase giả. Ở đây chỉ
   * còn phần lấy lịch sử làm bài và ghi đề xuống kho.
   */
  createChapterQuiz(chapterId: string, userEmail: string, bankQuestions: Question[]): Quiz | null {
    const chon = chonCauChoDeChuong(
      bankQuestions,
      QuizStorage.getQuestionsDone(userEmail, chapterId),
      QuizStorage.getQuestionsFailed(userEmail, chapterId),
    );
    if (!chon.length) return null;

    const quiz: Quiz = {
      id: `quiz_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      // lessonId dùng chính chapterId: đề của cả chương, không của bài nào
      lessonId: chapterId,
      chapterId,
      userEmail,
      questions: chon.map(xaoPhuongAnWeb),
      answers: {},
      status: 'pending',
      score: 0,
      maxScore: chon.reduce((t, q) => t + (q.points || 1), 0),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    QuizStorage.addQuiz(quiz);
    return quiz;
  },

  /**
   * Tạo bài kiểm tra cho học sinh
   */
  async createQuiz(
    chapterId: string,
    lessonId: string,
    userEmail: string,
    nganHang: Question[] = [],
  ): Promise<Quiz | null> {
    // 1. Gom câu hỏi CỦA ĐÚNG BÀI NÀY từ mọi kho
    const bankQuestions = await this.layKhoCauHoi(chapterId, lessonId, nganHang);
    if (bankQuestions.length === 0) return null;

    // 2. Lấy danh sách lịch sử làm bài để lọc chống trùng đề
    const doneIds = QuizStorage.getQuestionsDone(userEmail, lessonId);
    const failedIds = QuizStorage.getQuestionsFailed(userEmail, lessonId);

    // Chia nhóm câu hỏi
    const neverDone = bankQuestions.filter(q => !doneIds.includes(q.id));
    const previouslyFailed = bankQuestions.filter(q => failedIds.includes(q.id));
    const previouslySucceeded = bankQuestions.filter(q => doneIds.includes(q.id) && !failedIds.includes(q.id));

    // 3. Chọn câu hỏi (tối đa 5-8 câu, ưu tiên chưa làm -> làm sai -> làm đúng)
    const targetCount = Math.min(8, Math.max(5, bankQuestions.length));
    const selectedQuestions: Question[] = [];

    // Lấy từ nhóm chưa từng làm
    selectedQuestions.push(...this.shuffleArray(neverDone));

    // Nếu chưa đủ, lấy thêm từ nhóm làm sai trước đó
    if (selectedQuestions.length < targetCount) {
      const remainingNeeded = targetCount - selectedQuestions.length;
      selectedQuestions.push(...this.shuffleArray(previouslyFailed).slice(0, remainingNeeded));
    }

    // Nếu vẫn chưa đủ, lấy thêm từ nhóm làm đúng trước đó
    if (selectedQuestions.length < targetCount) {
      const remainingNeeded = targetCount - selectedQuestions.length;
      selectedQuestions.push(...this.shuffleArray(previouslySucceeded).slice(0, remainingNeeded));
    }

    // Giới hạn đúng số câu cần thiết và xáo trộn chung
    const finalSelection = this.shuffleArray(selectedQuestions.slice(0, targetCount));

    // Sắp xếp theo độ khó: Thấp -> Trung bình -> Cao
    finalSelection.sort((a, b) => TRONG_SO_DO_KHO[a.difficulty] - TRONG_SO_DO_KHO[b.difficulty]);

    // Tính điểm tối đa
    const maxScore = finalSelection.reduce((sum, q) => sum + (q.points || 1), 0);

    // Thời gian hết hạn: 24 giờ kể từ lúc tạo
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const quiz: Quiz = {
      id: `quiz_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      lessonId,
      chapterId,
      userEmail,
      /* Xáo vị trí phương án ngay khi tạo đề: đề đã lưu mang thứ tự mới, nên
         chấm điểm và xem lại bài đều khớp. Lý do xáo: xem xaoDapAn.ts. */
      questions: finalSelection.map(xaoPhuongAnWeb),
      answers: {},
      status: 'pending',
      score: 0,
      maxScore,
      createdAt,
      expiresAt
    };

    QuizStorage.addQuiz(quiz);
    return quiz;
  },

  /**
   * Chấm điểm bài kiểm tra
   */
  submitQuiz(quizId: string, answers: Record<string, string>): Quiz | null {
    const quiz = QuizStorage.getQuizById(quizId);
    if (!quiz || quiz.status === 'submitted') return null;

    const results: Record<string, QuizQuestionResult> = {};
    let totalScore = 0;

    for (const question of quiz.questions) {
      let studentAns = (answers[question.id] || '').trim();
      let isCorrect = false;
      let pointsAwarded = 0;
      let feedback = '';
      let confidence: 'high' | 'medium' | 'low' = 'high';
      const essayPointsPassed: string[] = [];

      if (question.type === 'Trắc nghiệm') {
        isCorrect = studentAns.toUpperCase() === (question.correctAnswer || '').toUpperCase();
        pointsAwarded = isCorrect ? question.points : 0;
        feedback = isCorrect ? 'Đáp án hoàn toàn chính xác!' : `Sai rồi. Đáp án đúng là: ${question.correctAnswer}`;
      } else if (question.type === 'Đúng/Sai' && question.yDungSai && question.yDungSai.length > 1) {
        /* Câu nhiều ý: chấm từng ý theo thang của Bộ — xem chamDiem.ts. Đáp án
           lưu dạng mã ("DS-D"); đổi ra chữ để màn kết quả và màn giáo viên đọc được. */
        const kq = chamDungSaiNhieuY(question, studentAns);
        isCorrect = kq.dung;
        pointsAwarded = kq.diem;
        feedback = kq.nhanXet;
        studentAns = kq.traLoiHienThi;
      } else if (question.type === 'Tự luận' && dapSoCua(question)) {
        /* Câu trả lời ngắn: so SỐ, đúng thì trọn điểm. Độ tin cậy 'high' để câu
           này không rơi vào danh sách "cần chấm lại" của giáo viên. */
        const kq = chamDapSo(question, studentAns);
        isCorrect = kq.dung;
        pointsAwarded = kq.diem;
        feedback = kq.nhanXet;
      } else if (question.type === 'Đúng/Sai') {
        const standardAns = studentAns.toLowerCase() === 'đúng' ? 'Đúng' : studentAns.toLowerCase() === 'sai' ? 'Sai' : '';
        isCorrect = standardAns === question.correctAnswer;
        pointsAwarded = isCorrect ? question.points : 0;
        feedback = isCorrect ? 'Đúng!' : `Sai rồi. Đáp án đúng là: ${question.correctAnswer}`;
      } else if (question.type === 'Tự luận') {
        // Chấm điểm tự luận thông minh bằng Mock AI Grader
        const evalResult = this.evaluateEssay(studentAns, question);
        isCorrect = evalResult.score >= question.points * 0.7; // Tính là đúng nếu đạt >= 70% số điểm
        pointsAwarded = evalResult.score;
        feedback = evalResult.feedback;
        confidence = evalResult.confidence;
        evalResult.essayPointsPassed.forEach(p => essayPointsPassed.push(p));
      }

      totalScore += pointsAwarded;

      results[question.id] = {
        questionId: question.id,
        score: pointsAwarded,
        maxScore: question.points,
        correct: isCorrect,
        studentAnswer: studentAns,
        correctAnswer: question.correctAnswer || (question.essayPoints?.map(p => `${p.label}: ${p.content}`).join('\n') ?? ''),
        feedback,
        confidence,
        ...(essayPointsPassed.length > 0 && { essayPointsPassed })
      };
    }

    // Làm tròn điểm 2 chữ số thập phân
    const finalScore = Math.round(totalScore * 100) / 100;

    const updatedQuiz: Quiz = {
      ...quiz,
      answers,
      status: 'submitted',
      score: finalScore,
      results
    };

    QuizStorage.updateQuiz(quizId, updatedQuiz);
    /* Bản sao lên Firestore để giáo viên thấy. KHÔNG chờ: mất mạng hay luật
       chưa publish thì học sinh vẫn nộp và xem điểm bình thường; lần đăng
       nhập sau `dayBaiCuLen` đẩy lại. */
    void luuBaiNop(updatedQuiz);
    return updatedQuiz;
  },

  /**
   * Mock AI Grader chấm tự luận dựa trên từ khóa, câu chữ và phương trình hóa học.
   */
  evaluateEssay(answer: string, question: Question): { score: number; feedback: string; confidence: 'high' | 'medium' | 'low'; essayPointsPassed: string[] } {
    const maxScore = question.points;
    if (!answer.trim()) {
      return { score: 0, feedback: 'Học sinh không trả lời câu hỏi tự luận này.', confidence: 'high', essayPointsPassed: [] };
    }

    const modelPoints = question.essayPoints || [];
    if (modelPoints.length === 0) {
      // Nếu không có đáp án mẫu chi tiết, chấm tạm dựa trên chiều dài câu trả lời
      const confidence: 'high' | 'medium' | 'low' = 'low';
      const score = answer.length > 30 ? maxScore : answer.length > 10 ? maxScore / 2 : 0;
      return {
        score,
        feedback: 'Hệ thống đã tự động chấm sơ bộ dựa trên độ dài phản hồi. Giáo viên cần xem lại.',
        confidence,
        essayPointsPassed: []
      };
    }

    let score = 0;
    const essayPointsPassed: string[] = [];
    const feedbackParts: string[] = [];
    const normalizedAns = answer.toLowerCase();

    // 1. So khớp các ý chính
    modelPoints.forEach((point) => {
      // Tách từ khóa quan trọng của từng ý (lọc bỏ các từ vô nghĩa)
      const keywords = point.content
        .toLowerCase()
        .replace(/[.,()]/g, '')
        .split(' ')
        .filter(w => w.length > 2 && !['trong', 'của', 'được', 'chiều', 'trình', 'phương', 'bằng', 'chúng'].includes(w));

      // Kiểm tra xem câu trả lời của học sinh chứa bao nhiêu từ khóa của ý này
      const matches = keywords.filter(kw => normalizedAns.includes(kw));
      const matchRatio = matches.length / keywords.length;

      // Nhận định trùng khớp ý chính
      if (matchRatio >= 0.5 || normalizedAns.includes(point.content.toLowerCase().slice(0, 15))) {
        score += 0.25;
        essayPointsPassed.push(point.label);
        feedbackParts.push(`✓ Ghi điểm ý chính (${point.label}): Khớp nội dung "${point.content.slice(0, 30)}..."`);
      }
    });

    // 2. Nhận dạng phương trình hóa học (nếu đáp án mẫu có phương trình)
    const formulaRegex = /([A-Z][a-z]?\d*|\d+[A-Z][a-z]?\d*)\s*(\+|\+)\s*/g;
    const modelEquations = modelPoints.filter(p => p.content.includes('→') || p.content.includes('⇌'));
    
    modelEquations.forEach((eq) => {
      // Tìm các chất chính có trong phương trình của đáp án mẫu
      const chemicals = eq.content.match(/[A-Z][a-z]?\d*/g) || [];
      const hasArrow = answer.includes('→') || answer.includes('⇌');
      const matchedChemicals = chemicals.filter(chem => answer.includes(chem));

      if (matchedChemicals.length >= Math.ceil(chemicals.length * 0.7) && hasArrow) {
        score += 0.5; // Điểm cộng dồn cho viết đúng phương trình phản ứng
        feedbackParts.push(`✓ Ghi điểm phương trình: Viết đúng các chất phản ứng/sản phẩm chính.`);
      }
    });

    // 3. Kiểm tra trùng khớp hoàn toàn (kể cả diễn đạt khác)
    // Nếu tỉ lệ từ khóa chung rất cao, hoặc học sinh viết rất đầy đủ
    if (score >= maxScore * 0.8) {
      score = maxScore;
      return {
        score,
        feedback: 'Xuất sắc! Câu trả lời của em trùng khớp hoàn toàn với đáp án mẫu. Điểm tối đa.',
        confidence: 'high',
        essayPointsPassed: modelPoints.map(p => p.label)
      };
    }

    // Đảm bảo điểm không vượt quá điểm tối đa của câu
    const finalScore = Math.min(maxScore, score);
    
    // Nhãn độ tin cậy
    const confidence: 'high' | 'medium' | 'low' = 
      finalScore === 0 ? 'high' : 
      finalScore === maxScore ? 'high' : 
      feedbackParts.length > 0 ? 'medium' : 'low';

    const feedback = feedbackParts.length > 0 
      ? feedbackParts.join('\n') + `\n\n→ AI chấm sơ bộ đạt ${finalScore}/${maxScore} điểm.`
      : 'Học sinh có ý trả lời nhưng chưa khớp các từ khóa/phương trình trong đáp án mẫu. Giáo viên cần xem xét lại.';

    return {
      score: finalScore,
      feedback,
      confidence,
      essayPointsPassed
    };
  },

  /**
   * Helper xáo trộn mảng ngẫu nhiên
   */
  shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
};
