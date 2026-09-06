import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FIREBASE_CONG_KHAI } from './firebaseCongKhai';

// 1. Cấu hình Firebase: ưu tiên biến môi trường, thiếu thì lấy bản công khai
//    trong git. Trước đây thiếu là rơi về chuỗi rỗng, và ứng dụng chạy tiếp
//    với một dự án Firebase không tồn tại — máy vừa clone về sẽ thấy "ngân
//    hàng trống", "chưa có lớp nào", tưởng mất dữ liệu chứ không hiểu là chưa
//    có cấu hình. Xem chú thích trong firebaseCongKhai.ts.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || FIREBASE_CONG_KHAI.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || FIREBASE_CONG_KHAI.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || FIREBASE_CONG_KHAI.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || FIREBASE_CONG_KHAI.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
    || FIREBASE_CONG_KHAI.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || FIREBASE_CONG_KHAI.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// 2. Khởi tạo Firebase App (Tránh khởi tạo lại nếu ứng dụng đã khởi tạo)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 3. Khởi tạo và export instance Firestore `db` để dùng trực tiếp trong toàn bộ app
export const db = getFirestore(app);

/**
 * Firebase Authentication.
 *
 * Thêm ngày 01/09/2026, chuẩn bị thay hệ đăng nhập tự viết trong
 * `firestoreAuth.ts` (đọc thẳng collection `users` rồi so mật khẩu plain text
 * ngay trên trình duyệt).
 *
 * Chỉ khai báo ở bước này, CHƯA chỗ nào dùng — thêm vào đây không đổi hành vi
 * hiện tại của ứng dụng.
 */
export const auth = getAuth(app);

export default db;


