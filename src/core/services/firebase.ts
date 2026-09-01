import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// 1. Firebase Config đọc từ biến môi trường
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
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


