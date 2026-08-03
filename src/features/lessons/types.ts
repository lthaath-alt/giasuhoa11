export interface TextbookSection {
  id: string;
  sectionTitle: string;          // Tên mục (VD: "I. Phản ứng thuận nghịch")
  content: string;               // Nội dung lý thuyết
  keyPoints?: string[];          // Các điểm quan trọng cần nhớ (highlight box)
  formulae?: string[];           // Công thức của mục này
  examples?: {
    title: string;
    problem: string;
    solution: string;
  }[];                           // Ví dụ minh họa
  imagePrompt?: string;          // Mô tả để AI tạo ảnh minh họa
  imageAlt?: string;             // Alt text cho ảnh
}

export interface TextbookContent {
  pageRange: string;             // VD: "Trang 6–14" (SGK KNTT 2025)
  objectives: string[];          // Mục tiêu bài học
  sections: TextbookSection[];   // Các mục nội dung
  practiceQuestions: {
    id: string;
    question: string;
    hint?: string;
    answer?: string;
  }[];                           // Câu hỏi luyện tập
}

export interface Lesson {
  id: string;
  title: string;
  summary: string; // Tóm tắt lý thuyết cốt lõi
  formulae: string[]; // Các công thức hóa học quan trọng cần nhớ
  commonQuestions: {
    question: string;
    hint: string; // Gợi ý tư duy của gia sư AI cho câu hỏi này
    sampleAnswer: string; // Lời giải tham khảo của giáo viên
  }[];
  textbook?: TextbookContent;   // Nội dung trang SGK (tùy chọn)
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}
