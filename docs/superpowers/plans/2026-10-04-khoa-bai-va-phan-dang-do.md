# Khoá bài theo đề kiểm tra, gỡ "Nâng cao", sửa phần dang dở — Kế hoạch thực hiện

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khôi phục khoá bài tuần tự với điều kiện chạy được (đạt từ 7/10 đề kiểm tra của bài trước), gỡ mọi thứ mang tên "Nâng cao" và "Mật khẩu Cấp 1/2", sửa các phần dang dở và lỗi nhỏ đã báo ngày 04/10/2026.

**Architecture:** Luật khoá nằm ở MỘT hàm thuần `xetKhoaBai` (`src/features/lessons/khoaBai.ts`); bốn chỗ dùng chung nó (đề kiểm tra, danh mục bài, ô tìm kiếm, chỗ Chemai phát đề) để không chỗ nào lệch chỗ nào. Phần còn lại là gỡ giao diện giả/dở và sửa hiển thị, không đổi mô hình dữ liệu: các trường `advancedUnlocked` / `advancedCompleted` / `skippedAdvanced` vẫn nằm trong kiểu `LessonProgress` để đọc được hồ sơ cũ, chỉ là không còn chỗ nào đọc hay ghi.

**Tech Stack:** React 19, TypeScript 5.8, MUI v9, Vite 6; bộ kiểm `tsx scripts/kiem-tra-*.mts`.

**Spec:** quyết định của chủ dự án trong phiên 04/10/2026 (bốn câu trả lời):
1. Khoá bài: bài N mở khi bài N−1 **đạt từ 70% đề kiểm tra** (xem slide KHÔNG tính).
2. Bỏ cả "HS Nâng cao" lẫn "Mật khẩu Cấp 1/Cấp 2".
3. Trang "Quản lý Mật khẩu": bỏ danh sách yêu cầu giả, để hướng dẫn thật.
4. Cho phép: giao 1 đề [THỬ] rồi xoá; đồng bộ ngân hàng về repo; xoá tệp trò chơi thừa.

**Bổ sung trong lúc làm (cùng ngày), đều do chủ dự án chốt hoặc do đo mà ra:**
- Sau khi đồng bộ ngân hàng (1.780 câu) mới thấy các bài ôn tập 9, 14, 18, 22, 25
  không có câu nào và bài 3 chỉ có 1 câu, nên luật "bài N−1 đạt 70%" làm bài 10
  trở đi khoá vĩnh viễn. Chủ dự án chọn: **bài ôn tập không chặn bài sau** — bài
  chặn là bài học gần nhất phía trước không phải ôn tập. Mọi chỗ ghi "bài N−1"
  bên dưới đọc là "bài chặn".
- Thêm ngoài kế hoạch: nút mũi tên cho thanh menu khi tràn ngang (Task 4, bước 4
  đã đo ra tràn 576 px ở 375 px); sửa ô thao tác của bảng "Đề đã giao" trong
  `GiaoDeTab.tsx` (chú giải của nút trên che và hứng cú bấm của nút dưới ở bề
  ngang hẹp — phát hiện khi thử "Đóng đề sớm").
- Không làm: câu `bq_1789372198145_vwb21` gắn nhầm Bài 1 (đúng ra Bài 2) — phải
  sửa trên ngân hàng thật, việc của chủ dự án.

## Global Constraints

- KHÔNG `npm run build`, không commit, không push, không deploy, không git nguy hiểm.
- KHÔNG sửa tay `src/features/lessons/constants.ts` (máy sinh).
- KHÔNG ghi `bank_questions`; đồng bộ chỉ đọc Firestore và ghi tệp trong repo.
- KHÔNG gõ hay đọc mật khẩu; chủ dự án tự đăng nhập trong khung trình duyệt.
- Mọi `dangerouslySetInnerHTML` đi qua `locHtml` (ở `QuizPage` là `ChemicalText`).
- Màu chỉ dùng biến CSS theo vai; không viền trái dày một màu, không bóng đổ, không chuyển sắc (`docs/claude-reference/ui.md`).
- Không thêm khung test mới; phép kiểm mới thêm vào bộ `kiem-tra:*` sẵn có.
- Mốc kiểm: `npm run lint` một lần trước khi báo xong; các bộ `kiem-tra:*` liên quan; `kiem-tra:mau` vì có đổi màu/khối `sx`.
- Hằng số ngưỡng khoá: `DIEM_MO_BAI_SAU = 7` (thang 10; `bestScore` trong hồ sơ lưu thang 10 = phần trăm / 10).

---

### Task 1: Hàm thuần `xetKhoaBai` và phép kiểm

**Files:**
- Create: `src/features/lessons/khoaBai.ts`
- Modify: `scripts/kiem-tra-chuong-trinh.mts` (thêm mục "Khoá bài tuần tự" trước dòng tổng kết)

**Interfaces:**
- Produces:
  ```ts
  export const DIEM_MO_BAI_SAU = 7;
  export interface KetQuaKhoaBai { khoa: boolean; baiTruoc?: Lesson }
  export function xetKhoaBai(
    dsBai: Lesson[],
    maBai: string,
    layTienDo: (maBai: string) => { bestScore?: number } | null | undefined,
    vai: UserRole | null | undefined,
  ): KetQuaKhoaBai
  ```
- Luật: chỉ vai `'student'` bị khoá; bài đầu tiên và mã không phải bài (mã chương, `de-giao:…`) không bao giờ khoá; bài N khoá khi `bestScore` của bài N−1 < 7.

- [ ] **Step 1:** Viết phép kiểm trong `kiem-tra-chuong-trinh.mts` (import `xetKhoaBai`, `DIEM_MO_BAI_SAU`): khách không khoá; giáo viên không khoá; `bai-1` không khoá; `bai-2` khoá khi chưa có tiến độ; `bai-2` khoá khi bài 1 chỉ có `basicCompleted` (xem slide) mà `bestScore` 0; khoá ở 6,9; mở ở 7; `bai-3` vẫn khoá khi chỉ bài 1 đạt; mã chương và `de-giao:x` không khoá; `baiTruoc` trả đúng bài liền trước.
- [ ] **Step 2:** Chạy `npm run kiem-tra:chuong-trinh` — phải HỎNG vì chưa có tệp.
- [ ] **Step 3:** Viết `khoaBai.ts`.
- [ ] **Step 4:** Chạy lại — phải đạt toàn bộ.

### Task 2: `QuizPage` — khoá đề, gỡ hộp thoại Nâng cao, trang kết quả

**Files:** Modify `src/pages/QuizPage.tsx`

**Interfaces:** Consumes `xetKhoaBai`, `DIEM_MO_BAI_SAU` (Task 1).

- [ ] **Step 1:** Thay khối chú thích "KHÔNG còn khoá bài tuần tự" bằng phép xét khoá, đặt SAU hai lớp kiểm chủ bài. Chỉ chặn đề đang làm (`quiz.status !== 'submitted'`): bài đã nộp vẫn xem lại được. Màn khoá ghi rõ tên bài trước và ngưỡng 7 điểm.
- [ ] **Step 2:** Bỏ `showRetryDialog`, `showUnlockDialog`, `handleSkip`, hai `<Dialog>`, và dòng `updates.advancedUnlocked = true`. Giữ `basicCompleted` khi ≥ 70% như cũ.
- [ ] **Step 3:** Trang kết quả, đề tự ôn theo BÀI dưới 70%: thêm nút "Làm lại đề khác" (gọi `handleRetry`) cạnh "Quay lại trang học tập"; lỗi tạo đề hiện bằng `<Alert>` ngay đó. Đề cả chương và đề giáo viên giao không có nút này.
- [ ] **Step 4:** Hai lời nhận xét: thêm câu về bài tiếp theo (đã mở / cần 70% để mở) khi đề thuộc một bài có bài kế tiếp.
- [ ] **Step 5:** Câu trắc nghiệm: hiện "B. nội dung phương án" ở "CÂU TRẢ LỜI CỦA BẠN" và "ĐÁP ÁN MẪU CHUẨN" (qua `ChemicalText`).
- [ ] **Step 6:** Gỡ `borderLeft` ở thẻ từng câu và hộp "LỜI GIẢI" (đúng/sai đã có chip "Câu N" xanh/đỏ, dòng "Điểm đạt" và biểu tượng).
- [ ] **Step 7:** Dọn import thừa (`Dialog*` nếu không còn dùng), `npm run lint`.

### Task 3: `LessonSidebar` — khoá lại, bỏ nhãn NC

**Files:** Modify `src/features/lessons/components/LessonSidebar.tsx`

- [ ] **Step 1:** Dùng `xetKhoaBai(allLessons, les.id, getLessonProgress, currentUser?.role)`; bài khoá: không bấm được, mờ, biểu tượng ổ khoá, `Tooltip` "Đạt từ 7 điểm đề kiểm tra bài trước để mở".
- [ ] **Step 2:** Bỏ hai chip "NC" và "NC 🔓"; chip "CB" đổi thành "Đạt", hiện khi `bestScore ≥ 7` (đúng điều kiện mở bài sau).

### Task 4: `DashboardHeader` — chip, ô tìm kiếm, "Dùng Thử", thanh menu điện thoại

**Files:** Modify `src/features/lessons/components/DashboardHeader.tsx`

- [ ] **Step 1:** Gỡ chip "HS Nâng cao" và `hasAdvancedStudentTitle` khỏi `useApp()`.
- [ ] **Step 2:** Kết quả tìm kiếm: bài đang khoá hiện ổ khoá + dòng lý do, không mở được (nếu không thì ô tìm kiếm là đường vòng qua khoá).
- [ ] **Step 3:** Nút "Dùng Thử": đang `navigate('/dashboard')` ngay trên `/dashboard` nên không làm gì. Đổi thành mở tab Bài giảng (`setActiveTab('baigiang')`), cùng đích với nút "Bắt đầu học ngay hôm nay".
- [ ] **Step 4:** Đo thanh menu ở 375 px (`scrollWidth` so `clientWidth`). Nếu tràn: thêm nút mũi tên vuông ở mép phải/trái, chỉ hiện khi còn mục khuất, bấm thì cuộn; không dùng dải mờ chuyển sắc.

### Task 5: `AppContext` — bỏ danh hiệu Nâng cao, Chemai không phát đề của bài đang khoá

**Files:** Modify `src/core/contexts/AppContext.tsx`

- [ ] **Step 1:** Xoá `hasAdvancedStudentTitle` (khai kiểu, hàm, giá trị context) — nơi dùng duy nhất là `DashboardHeader` (Task 4).
- [ ] **Step 2:** Nhánh `[SIGNAL:XONG_BAI|YEU_CAU_DE]`: trước `createQuiz`, xét `xetKhoaBai`; bài đang khoá thì KHÔNG tạo đề, nối một dòng nói rõ cần đạt 7 điểm đề của bài nào trước.

### Task 6: `PasswordManagement` và `ManagementLayout`

**Files:** Modify `src/core/components/PasswordManagement.tsx`, `src/core/components/ManagementLayout.tsx`

- [ ] **Step 1:** `PasswordManagement`: bỏ hai ô Cấp 1/Cấp 2, bỏ `useEffect` dựng yêu cầu giả, bảng, nút "Cấp lại mật khẩu", `CredentialDialog` (không nơi nào mở). Thay bằng hướng dẫn thật + danh sách tài khoản trong phạm vi KHÔNG nhận được thư (email `@internal.local`).
- [ ] **Step 2:** `ManagementLayout`: ẩn mục menu không có nội dung (hiện chỉ "Cài đặt hệ thống" với giáo viên và quản trị trường); thẻ "QUYỀN TRUY CẬP" đổi dòng phụ thành "Nhấp để xem cách đặt lại mật khẩu".

### Task 7: `StudentArea` — gỡ tab trống, thẻ đề cũ nói thật

**Files:** Modify `src/features/student/components/StudentArea.tsx`

- [ ] **Step 1:** Gỡ tab "Luyện tập tự do" và `TabPanel` của nó; đánh lại chỉ số hai tab sau (Chemai → 1, Học bạ → 2); bỏ `topics`, `libraryQuestions`.
- [ ] **Step 2:** Khối `assignedExams`: bỏ `isOverdue`, `maxAttempts`, `getSubmissions`, hạn nộp giả, nút "Vào làm bài". Thẻ mới: chủ đề, tiêu đề, mô tả, ngày đăng, nút "Mở tài liệu" chỉ khi link là `https://drive.google.com/…` hoặc `https://docs.google.com/…`; tiêu đề khối "Tài liệu thầy cô chia sẻ".

### Task 8: `TextbookViewer` — ẩn khung trống

**Files:** Modify `src/features/lessons/components/TextbookViewer.tsx`

- [ ] **Step 1:** Chip số trang chỉ hiện khi `pageRange` có chữ; khối "Mục tiêu bài học" chỉ hiện khi có mục tiêu.

### Task 9: Hình trang trí đè thẻ trò chơi

**Files:** đo trước; dự kiến `src/features/mascot/*` hoặc `src/pages/DashboardPage.tsx`

- [ ] **Step 1:** Ở tab Trò chơi (1366 px và 375 px) đo hộp bao của từng hình trang trí và từng thẻ; ghi lại cặp nào chồng nhau.
- [ ] **Step 2:** Sửa đúng hình chồng (dời hoặc ẩn ở bề ngang đó), đo lại.

### Task 10: Dữ liệu

- [ ] **Step 1:** Đọc `scripts/xuat-ngan-hang.mts` và `scripts/gan-cau-hoi-theo-bai.mts` trước khi chạy; `npm run xuat:ngan-hang` rồi `npm run gan:cau-hoi`; đọc lại kết quả (số câu, `git status`), chạy `npm run kiem-tra:dong-bo`.
- [ ] **Step 2:** Đếm số câu theo bài trong `public/bank/ngan-hang.json`: bài 1–24 đều phải có câu, nếu không chuỗi khoá kẹt ở bài đó.
- [ ] **Step 3:** Tra câu có id đuôi `vwb21`; ghi mã, bài đang gắn, nội dung tóm tắt để chủ dự án tự sửa.
- [ ] **Step 4:** Xoá `public/games/duong-ong-chuyen-hoa.html` (không nơi nào tham chiếu; git giữ bản cũ).

### Task 11: Tài liệu

**Files:** Modify `docs/claude-reference/data.md`, `docs/claude-reference/product-decisions.md`

- [ ] **Step 1:** `data.md`: thay gạch đầu dòng "Khoá bài tuần tự ĐÃ GỠ" bằng trạng thái mới; câu ở điều 3 mục "Đề giáo viên GIAO" lại đúng.
- [ ] **Step 2:** `product-decisions.md`: thêm mục "Khoá bài tuần tự theo đề kiểm tra; bỏ Nâng cao và mật khẩu cấp (04/10/2026)".

### Task 12: Kiểm

- [ ] `npm run lint`; các bộ `kiem-tra:*` (trừ `luat` cần Java); `playwright test --project=khach`.
- [ ] Trình duyệt, khách: 1366 px và 375 px, sáng và tối — tab Trò chơi, thanh menu, nút "Dùng Thử", trang SGK bài 3 (khung trống đã ẩn).
- [ ] Trình duyệt, học sinh thử: danh mục bài (Bài 2 mở, Bài 3 khoá), ô tìm kiếm, khu Học sinh (3 tab), xin đề bài đang khoá, trang kết quả một bài đã nộp.
- [ ] Trình duyệt, giáo viên: "Quản lý Mật khẩu", menu không còn "Cài đặt hệ thống", giao 1 đề [THỬ] → "Chép link" → "Đóng đề sớm" → xoá.
- [ ] Trình duyệt, quản trị trường (nhờ chủ dự án đổi tài khoản).
