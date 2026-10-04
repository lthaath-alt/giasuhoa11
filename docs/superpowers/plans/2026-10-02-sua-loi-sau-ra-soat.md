# Sửa lỗi sau đợt rà soát 02/10/2026 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sửa các lỗi tìm được trong đợt bấm thử toàn trang ngày 02/10/2026, trừ ba việc chủ dự án để lại bàn với thầy.

**Architecture:** Phần chấm điểm của Đề kiểm tra tách ra một tệp logic thuần (`chamDiem.ts`) để bộ kiểm chạy được bằng Node, rồi `quizService` và `QuizPage` gọi vào đó. Các lỗi bố cục sửa ngay tại component gây lỗi. Không thêm thư viện, không đổi luật Firestore, không thêm trường cấp cao nhất vào bài nộp.

**Tech Stack:** React 19, MUI v9, TypeScript 5.8; bộ kiểm tự viết trong `scripts/` chạy bằng `tsx`.

**Spec:** báo cáo rà soát trong phiên làm việc 02/10/2026 (không có tệp spec riêng). Số đo gốc ghi ở từng task.

## Global Constraints

- KHÔNG đụng ba việc để lại: khoá bài tuần tự (`QuizPage.tsx` khối `isLocked`, `LessonSidebar.tsx` khối `isLocked`, hai hộp thoại "Nâng cao" sau khi nộp), nội dung SGK (`src/features/lessons/constants.ts` do máy sinh), và các phần còn dở (tab "Luyện tập tự do", thẻ bài tập cũ trong `StudentArea`, Mật khẩu cấp 1/2).
- Bài nộp lên `bai_nop` chỉ được mang các trường cấp cao nhất đã khai trong `baiNopHopLe` (`firestore.rules:236`). Trường mới chỉ được nằm BÊN TRONG từng câu hỏi.
- Không ghi giá trị `undefined` vào object câu hỏi (Firestore từ chối cả tài liệu).
- Mọi HTML từ ngân hàng hiển thị qua `ChemicalText` (tức `locHtml`).
- Không gọi `getAll()`/`getCount()` ở màn học sinh; không dựng bảng đếm sẵn.
- Không tự build, commit, push, deploy. Cuối đợt chạy `npm run lint` một lần và các bộ kiểm liên quan.
- Màu chỉ dùng biến đã có; không thêm màu mới.

---

### Task 1: Bộ chấm thuần cho câu Đúng/Sai nhiều ý và câu trả lời ngắn

**Gốc lỗi (đo 02/10/2026):** `toLegacy` (`src/features/bank/convert.ts:154-162`) gộp các ý Đúng/Sai thành một mệnh đề, bỏ mất đề dẫn, và biến câu trả lời ngắn thành "Tự luận" một ý. `evaluateEssay` (`quizService.ts:457`) cộng cứng 0,25 cho mỗi ý khớp, nên câu trả lời ngắn đúng chỉ được 0,25/1. Trả lời đúng cả 8 câu được 5,5/8.

**Files:**
- Create: `src/features/quiz/chamDiem.ts`
- Modify: `src/features/library/types.ts` (thêm `yDungSai`, `dapSo` vào `Question`)
- Modify: `src/features/bank/convert.ts` (`toLegacy`, `fromLegacy`)
- Modify: `src/features/bank/xaoDapAn.ts` (`chuoiDapAnDungSai`, xáo ý trong `xaoPhuongAnWeb`)
- Modify: `src/features/quiz/quizService.ts` (`submitQuiz` gọi bộ chấm mới)
- Test: `scripts/kiem-tra-de-giao.mts` (thêm khối "Chấm Đề kiểm tra")

**Interfaces (Produces):**
- `Question.yDungSai?: { s: string; v: boolean }[]` — các ý của câu Đúng/Sai, `content` là đề dẫn.
- `Question.dapSo?: { text: string; num?: number; tol?: number; unit?: string }` — đáp số câu trả lời ngắn.
- `chuoiDapAnDungSai(y): string` trong `xaoDapAn.ts` → `"a) Đúng · b) Sai · …"`.
- Trong `chamDiem.ts`: `maHoaDungSai(ds: (boolean | null)[]): string` (ký tự `D`/`S`/`-`), `giaiMaDungSai(chuoi: string, soY: number): (boolean | null)[]`, `dapSoCua(q: Question): Question['dapSo'] | null`, `chamDungSaiNhieuY(q, traLoi)`, `chamDapSo(q, traLoi)` — hai hàm chấm trả `{ diem: number; dung: boolean; traLoiHienThi: string; nhanXet: string }`.

- [ ] **Step 1:** Thêm khối phép kiểm vào `scripts/kiem-tra-de-giao.mts`: câu tf 4 ý qua `toLegacy` giữ đề dẫn và đủ 4 ý; chấm 4/4 = trọn điểm, 3/4 = 0,5, bỏ trống = 0; câu tn: "3,57" và "3.57" và "Kc = 3,57" đều đúng với đáp số 3,57, "3,6" sai; có `tol` thì nhận trong sai số; câu "Tự luận" cũ một ý nhãn "Đáp án" cũng được chấm theo số; xáo ý xong chuỗi đáp án đi theo.
- [ ] **Step 2:** Chạy `npm run kiem-tra:de-giao` → phải HỎNG vì chưa có `chamDiem.ts`.
- [ ] **Step 3:** Viết mã các tệp ở trên.
- [ ] **Step 4:** Chạy `npm run kiem-tra:de-giao`, `kiem-tra:ngan-hang`, `kiem-tra:de-chuong`, `kiem-tra:luyen-tap` → đều đạt.

### Task 2: QuizPage — hiện câu mới, lưu tạm, tự nộp khi hết giờ, chữ cho đề giao

**Gốc lỗi (đo 02/10/2026):** `handleAnswerChange` chỉ đặt state nên tải lại trang là mất đáp án (3 → 0 câu). Hết giờ, `isExpired` thay cả trang bằng thông báo "quá hạn 24 giờ" mà không nộp (đề 1 phút: 4 đáp án mất, bài vẫn `pending`). Tiêu đề và băng đếm giờ viết cứng cho đề tự ôn.

**Files:**
- Modify: `src/pages/QuizPage.tsx`

- [ ] **Step 1:** `handleAnswerChange` ghi `QuizStorage.updateQuiz(quiz.id, { answers })` khi bài còn `pending`.
- [ ] **Step 2:** Tách `nopBai(dapAn)` khỏi `handleSubmit`; đề có `deGiaoId` hết giờ thì tự gọi `nopBai` với đáp án đang có (kể cả khi mở lại trang sau giờ hết). Đề tự ôn giữ nguyên màn "đã hết hạn".
- [ ] **Step 3:** Vẽ câu Đúng/Sai có `yDungSai` thành từng ý với hai nút Đúng/Sai; câu có đáp số thành một ô nhập ngắn. Màn kết quả hiện từng ý kèm đáp án.
- [ ] **Step 4:** Đề giao: tiêu đề là `quiz.tenDe`, băng giờ ghi "Hết giờ hệ thống tự nộp phần em đã làm", lời nhận xét kết quả không nhắc "Socratic".

### Task 3: Link đề trong câu trả lời của Chemai

**Gốc lỗi (đo 02/10/2026):** khách nhận link `#/quiz/…` nhưng `QuizPage` đòi đăng nhập và đề đứng tên `guest`. Mô hình chép lại dòng link cũ từ lịch sử chat (`quiz_1789723767818_81` hiện lại trong câu trả lời ngày 02/10).

**Files:**
- Create: `src/features/quiz/linkDe.ts` (`boDongLinkDe(text: string): string`)
- Modify: `src/core/contexts/AppContext.tsx` (`addMessage`)
- Test: `scripts/kiem-tra-de-giao.mts`

- [ ] **Step 1:** Phép kiểm cho `boDongLinkDe`: bỏ đúng dòng có `#/quiz/` hoặc `#/de/`, giữ các dòng khác.
- [ ] **Step 2:** `addMessage`: lọc lịch sử gửi cho mô hình và lọc câu trả lời trước khi nối link thật; khách thì không tạo đề, thay bằng một câu mời đăng ký.

### Task 4: Màn giáo viên — CSV và chi tiết câu Đúng/Sai

**Files:**
- Modify: `src/features/teacher/components/QuizProgressTab.tsx`

- [ ] **Step 1:** Cột "Chương học" của bài đề giao ghi "Đề giáo viên giao" thay cho mã `de-giao:…`.
- [ ] **Step 2:** Lịch sử bài làm hiện các ý của câu Đúng/Sai nhiều ý.

### Task 5: Bố cục trang bài học, khung chat, khu Học sinh

**Gốc lỗi (đo 02/10/2026):** thẻ MUI trong cột trái `TutorChat` là phần tử flex `overflow: hidden` nên bị co (thẻ câu hỏi mẫu 164/434 px). `scrollIntoView` cuộn cả trang (~700 px). Ở 375 px, `LessonSidebar` `position: sticky` cao 2516 px trượt đè lên nội dung, khung chat còn 2 px. Khách bấm "Đăng nhập để luyện tập" tới `StudentArea` trả `null`.

**Files:**
- Modify: `src/features/tutor/components/TutorChat.tsx`
- Modify: `src/features/lessons/components/LessonSidebar.tsx`
- Modify: `src/pages/DashboardPage.tsx`
- Modify: `src/features/student/components/StudentArea.tsx`
- Modify: `src/features/student/components/DeCoGiaoList.tsx`

- [ ] **Step 1:** `TutorChat`: con của cột trái `flexShrink: 0`; cuộn hộp tin nhắn bằng `scrollTo` của chính hộp; ở `xs` cột trái cao tự nhiên, khung chat cao tối thiểu 460 px.
- [ ] **Step 2:** `LessonSidebar`: chỉ `sticky` từ `md`; ở `xs` mặc định thu gọn; rộng 260 px ở `md`. `DashboardPage`: lưới `md: 'auto minmax(0, 1fr)'`.
- [ ] **Step 3:** `DashboardPage`: khách bấm đăng nhập ở Luyện tập thì sang `/login`; iChat tự cuộn; "Quay lại" về tab trước khi mở bài; sửa `maxW`; sửa câu 1 mục Hỗ trợ; nút "Đăng Ký" mở thẳng màn đăng ký.
- [ ] **Step 4:** `StudentArea`: bỏ khung 70vh cắt chat; chỉ ghi "chưa có bài tập" khi lớp không có đề giao (`DeCoGiaoList` báo số đề qua `onSoDe`).

### Task 6: Chữ sai và chỗ bấm không ăn

**Files:**
- Modify: `src/features/auth/components/StudentRegisterForm.tsx`, `TeacherRegisterForm.tsx` (nhãn hai dấu sao; nút "Quay lại")
- Modify: `src/pages/LoginPage.tsx`, `src/features/lessons/components/DashboardHeader.tsx` (mở màn đăng ký)
- Modify: `src/features/auth/components/LoginForm.tsx` (nhãn đọc cho nút hiện mật khẩu)
- Modify: `src/features/games/GameHubSection.tsx` (bấm cả thẻ)
- Modify: `src/core/components/ManagementLayout.tsx` (thẻ "0 Câu hỏi, 0 Đề"; chữ "Prompt tiếp theo")
- Modify: `src/core/components/SystemSettingsManagement.tsx` (khoá riêng đã có lại 20/09/2026)

### Task 7: Kiểm

- [ ] `npm run lint`
- [ ] `npm run kiem-tra:de-giao`, `kiem-tra:ngan-hang`, `kiem-tra:de-chuong`, `kiem-tra:luyen-tap`, `kiem-tra:an-ninh`, `kiem-tra:het-luot`, `kiem-tra:tai-lieu`, `kiem-tra:su-pham`
- [ ] Bấm lại trên trình duyệt từng lỗi đã sửa (vai khách bằng Chrome thật; vai đăng nhập trong khung trình duyệt), ghi số đo trước/sau.
