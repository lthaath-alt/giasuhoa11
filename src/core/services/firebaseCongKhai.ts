/**
 * Cấu hình Firebase của ứng dụng web — CÔNG KHAI, cố ý để trong git.
 *
 * Sáu giá trị này KHÔNG phải bí mật. Firebase thiết kế chúng để nằm trong mã
 * JavaScript chạy trên trình duyệt, và chúng đã nằm sẵn trong bản dựng đang
 * chạy trên Netlify — ai mở trang rồi bấm F12 cũng đọc được. Đưa vào git không
 * lộ thêm gì, mà đổi lại máy mới chỉ cần `git pull` là chạy được ngay, không
 * phải chép tay `.env.local` sang.
 *
 * An toàn của dữ liệu KHÔNG dựa vào việc giấu mấy giá trị này mà dựa vào
 * Firestore Security Rules. Hiện `bank_questions` để `allow write: if true`,
 * nghĩa là ai cũng ghi được — đó là chỗ cần siết (bằng Firebase Auth), không
 * phải chỗ này.
 *
 * KHÔNG bao giờ thêm key Gemini hay khoá tài khoản dịch vụ vào tệp này.
 * Bản build KHÔNG còn chứa key Gemini: gia sư gọi qua Firebase AI Logic
 * (xem giaSuFirebaseAI.ts). `GEMINI_API_KEY` trong `.env.local` chỉ dành cho
 * script Node trong `scripts/`. `npm run kiem-tra:an-ninh` quét `dist/` để
 * canh điều này — ngày 13/09/2026 dòng chú thích cũ ở đây nói "đã kiểm" trong
 * khi key đang nằm nguyên văn trên Netlify.
 *
 * Biến môi trường VITE_FIREBASE_* vẫn được ưu tiên nếu có, để còn trỏ sang dự
 * án Firebase khác lúc thử nghiệm mà không phải sửa tệp này.
 *
 * TỰ SINH RA từ `.env.local`. Muốn đổi thì sửa dự án Firebase rồi sinh lại.
 */
export const FIREBASE_CONG_KHAI = {
  apiKey: 'AIzaSyDl582-NGpQDX3flvHeqJb5aPdCVXYf7Bo',
  authDomain: 'giasuhoa11.firebaseapp.com',
  projectId: 'giasuhoa11',
  storageBucket: 'giasuhoa11.firebasestorage.app',
  messagingSenderId: '334980936585',
  appId: '1:334980936585:web:2590cc0f7551a0b492e758',
} as const;

/**
 * Site key reCAPTCHA Enterprise cho App Check — CÔNG KHAI, cùng lý do với
 * sáu giá trị trên: reCAPTCHA thiết kế nó để nằm trên trang. Nó chỉ dùng
 * được trên các tên miền khai trong Google Cloud Console → reCAPTCHA
 * (13/09/2026: `giasuhoa11.netlify.app`). Chuỗi rỗng = chưa cấu hình → bản
 * build không gọi Firebase AI Logic.
 */
export const RECAPTCHA_ENTERPRISE_SITE_KEY = '6LeGYbktAAAAAAk5zOJ1Ad_PB3AqYojgUIaCvknD';
