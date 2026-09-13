import { initializeApp, getApps, getApp, deleteApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signOut, type Auth } from 'firebase/auth';
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
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

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

/* Đếm tăng dần để đặt tên app phụ. Chỉ dùng `Date.now()` là chưa đủ: hai lời
   gọi trong cùng một mili-giây sẽ trùng tên, và `initializeApp` với tên đã tồn
   tại thì ném lỗi. Hiếm, nhưng đây là đường tạo tài khoản hàng loạt. */
let soAppPhu = 0;

/**
 * Tạo một Firebase App PHỤ chỉ để tạo tài khoản mới.
 *
 * Vì sao cần: `createUserWithEmailAndPassword` ĐĂNG NHẬP LUÔN bằng tài khoản
 * vừa tạo. Gọi nó trên app chính thì admin đang thao tác bị đá ra khỏi phiên
 * của chính mình và trở thành người dùng vừa tạo — mất phiên, mất luôn ngữ
 * cảnh đang làm dở.
 *
 * Cách chính thống là dùng Admin SDK trong Cloud Function, nhưng thứ đó đòi
 * gói Blaze trả tiền. Dự án đang ở gói Spark ($0), nên dùng app phụ: nó có kho
 * phiên riêng, tạo xong thì huỷ, phiên của admin không hề bị đụng.
 *
 * LUÔN gọi `huy()` trong khối `finally`, kể cả khi tạo lỗi — bỏ sót thì app
 * phụ nằm lại trong bộ nhớ và giữ luôn một phiên đăng nhập không ai dùng.
 *
 * Dùng thế nào:
 *
 *     const phu = taoAuthPhu();
 *     try {
 *       await createUserWithEmailAndPassword(phu.authPhu, email, matKhau);
 *     } finally {
 *       await phu.huy();
 *     }
 */
export function taoAuthPhu(): { authPhu: Auth; huy: () => Promise<void> } {
  const ten = `phu-${Date.now()}-${++soAppPhu}`;
  const appPhu = initializeApp(firebaseConfig, ten);
  const authPhu = getAuth(appPhu);
  return {
    authPhu,
    huy: async () => {
      try { await signOut(authPhu); } catch { /* chưa đăng nhập thì thôi */ }
      await deleteApp(appPhu);
    },
  };
}

export default db;


