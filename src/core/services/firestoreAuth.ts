import {
  collection, getDocs, getDoc, setDoc, updateDoc,
  doc, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, signOut,
} from 'firebase/auth';
import { db, auth, taoAuthPhu } from './firebase';
import { ErrorLogService } from './errorLog';

/* ─── Đăng nhập qua Firebase Auth ─────────────────────────────────────────────
 *
 * Trước 10/09/2026 tệp này đọc thẳng collection `users` rồi SO CHUỖI mật khẩu
 * ngay trên trình duyệt. Mà `users` phải cho đọc công khai để việc đó chạy
 * được, nên bất kỳ ai cũng tải về được mật khẩu của mọi người. Đó là lỗ hổng
 * nặng nhất của dự án.
 *
 * Nay mật khẩu chỉ tồn tại ở phía Firebase Auth, đã băm, không bao giờ về tới
 * trình duyệt. Tài liệu `users/{uid}` chỉ còn giữ hồ sơ: tên, vai, lớp, trạng
 * thái.
 *
 * Id tài liệu = `uid` của Auth (đánh lại khoá ngày 10/09/2026). Bắt buộc như
 * vậy vì luật Firestore KHÔNG truy vấn được, chỉ `get()` theo đường dẫn — đợt
 * siết phân quyền sẽ cần đọc `users/{request.auth.uid}` để biết vai.
 *
 * `npm run kiem-tra:an-ninh` canh cho tệp này không quay lại lối cũ.
 */

// ─── Hồ sơ người dùng trên Firestore (KHÔNG còn mật khẩu) ───────────────────
export interface FirestoreUser {
  /** Id tài liệu = uid của Firebase Auth */
  uid: string;
  /** Email đăng nhập */
  username: string;
  /** Họ và tên hiển thị */
  fullName: string;
  /** Vai trò: 'admin' | 'school_admin' | 'teacher' | 'student' */
  role: string;
  createdAt?: string | Timestamp;
}

/** Đổi mã lỗi của Firebase Auth sang câu tiếng Việt học sinh đọc hiểu. */
function loiTiengViet(ma: string): string {
  switch (ma) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Sai email hoặc mật khẩu.';
    case 'auth/invalid-email':
      return 'Email không đúng định dạng.';
    case 'auth/user-disabled':
      return 'Tài khoản này đã bị khoá. Hãy liên hệ giáo viên.';
    case 'auth/too-many-requests':
      return 'Sai quá nhiều lần. Hãy đợi vài phút rồi thử lại.';
    case 'auth/email-already-in-use':
      return 'Email này đã có tài khoản rồi.';
    case 'auth/weak-password':
      return 'Mật khẩu phải từ 6 ký tự trở lên.';
    case 'auth/network-request-failed':
      return 'Không kết nối được. Hãy kiểm tra mạng.';
    default:
      return 'Không đăng nhập được. Hãy thử lại.';
  }
}

/* Sai mật khẩu là chuyện thường ngày — KHÔNG ghi vào nhật ký lỗi. Ghi thì nhật
   ký ngập bởi lỗi gõ nhầm và lỗi hệ thống thật bị chìm mất. */
const LOI_THUONG = new Set([
  'auth/invalid-credential', 'auth/wrong-password',
  'auth/user-not-found', 'auth/invalid-email',
]);

// ─── 1. ĐĂNG NHẬP ───────────────────────────────────────────────────────────
export const loginWithFirestore = async (
  email: string,
  password: string
): Promise<{ success: boolean; message: string; user?: FirestoreUser }> => {
  const dinhDanh = email.trim().toLowerCase();
  if (!dinhDanh || !password) {
    return { success: false, message: 'Vui lòng nhập đầy đủ email và mật khẩu!' };
  }
  try {
    const cred = await signInWithEmailAndPassword(auth, dinhDanh, password);
    const uid = cred.user.uid;

    /* Hồ sơ nằm ở `users/{uid}`. Thiếu hồ sơ thì KHÔNG tự tạo: có tài khoản
       Auth mà không có hồ sơ là dấu hiệu dữ liệu lệch, phải để người quản trị
       nhìn thấy chứ đừng lặng lẽ vá. Và phải đăng xuất ngay, nếu không người
       dùng mắc kẹt ở trạng thái nửa vời — Auth thì đã vào, app thì chưa. */
    const hoSo = await getDoc(doc(db, 'users', uid));
    if (!hoSo.exists()) {
      await signOut(auth);
      return {
        success: false,
        message: 'Tài khoản đăng nhập được nhưng chưa có hồ sơ trong hệ thống. Hãy báo giáo viên.',
      };
    }

    const d = hoSo.data();
    return {
      success: true,
      message: 'Đăng nhập thành công!',
      user: {
        uid,
        username: d.email || d.username || dinhDanh,
        fullName: d.fullName || d.name || '',
        role: d.role || 'student',
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || '',
      },
    };
  } catch (error: any) {
    const ma = error?.code || '';
    if (!LOI_THUONG.has(ma)) {
      ErrorLogService.logError({
        level: 'Lỗi Cơ Sở Dữ Liệu',
        component: 'firestoreAuth.login',
        message: `${ma} — ${error?.message || ''}`,
      });
    }
    return { success: false, message: loiTiengViet(ma) };
  }
};

// ─── 2. TẠO TÀI KHOẢN ───────────────────────────────────────────────────────
/**
 * Tạo tài khoản Auth + hồ sơ Firestore.
 *
 * `dangTuDangKy = true`  → người dùng tự đăng ký: tạo trên app CHÍNH nên tạo
 *                          xong là đăng nhập luôn (đúng ý muốn).
 * `dangTuDangKy = false` → admin tạo hộ: dùng app PHỤ để phiên của admin không
 *                          bị đụng. Xem `taoAuthPhu()` trong `firebase.ts`.
 */
export const createAccountWithFirestore = async (data: {
  username: string;
  password: string;
  fullName: string;
  role: string;
  email?: string;
  classId?: string;
  schoolId?: string;
  status?: string;
  dangTuDangKy?: boolean;
}): Promise<{ success: boolean; message: string; user?: FirestoreUser }> => {
  const email = (data.email || data.username).trim().toLowerCase();
  const fullName = data.fullName.trim();
  const role = data.role || 'student';
  const status = data.status || 'active';

  /* Chốt chặn GIỮ NGUYÊN từ bản cũ: không tạo được tài khoản quyền cao qua
     đường này. Bản cũ viết `role === 'admin' || role === 'admin' ||
     role === 'school_admin'` — lặp 'admin' hai lần, chắc định gõ một vai khác.
     Nay viết bằng danh sách cho gọn và không lặp. */
  const VAI_CAM = new Set(['admin', 'school_admin']);
  if (VAI_CAM.has(role)) {
    return {
      success: false,
      message: 'Chỉ được phép tạo tài khoản với vai trò học sinh hoặc giáo viên qua chức năng này.',
    };
  }

  if (!email || !data.password || !fullName) {
    return { success: false, message: 'Vui lòng nhập đầy đủ Email, Mật khẩu và Họ tên!' };
  }
  if (data.password.length < 6) {
    return { success: false, message: 'Mật khẩu phải từ 6 ký tự trở lên.' };
  }

  const tuDangKy = data.dangTuDangKy === true;
  const phu = tuDangKy ? null : taoAuthPhu();

  try {
    const authDung = phu ? phu.authPhu : auth;
    const cred = await createUserWithEmailAndPassword(authDung, email, data.password);
    const uid = cred.user.uid;

    /* `setDoc` với id = uid, KHÔNG dùng `addDoc`: luật Firestore đợt sau cần
       đọc `users/{request.auth.uid}` để biết vai. `addDoc` sinh id ngẫu nhiên
       là hỏng đúng điều đó — và đó chính là lý do đã phải chạy một đợt đánh
       lại khoá cho 15 tài khoản cũ. */
    const hoSo: Record<string, any> = {
      email,
      username: email,
      fullName,
      name: fullName,
      role,
      status,
      authUid: uid,
      /* 'local' = đăng nhập bằng email+mật khẩu, đối lại với 'google'. Trường
         này nói CÁCH đăng nhập, không nói chỗ lưu mật khẩu — nên nó không đổi
         sau đợt chuyển sang Firebase Auth. 15 hồ sơ cũ cũng đang ghi 'local'. */
      authProvider: 'local',
      createdAt: serverTimestamp(),
    };
    if (data.classId) hoSo.classId = data.classId;
    if (data.schoolId) hoSo.schoolId = data.schoolId;

    await setDoc(doc(db, 'users', uid), hoSo);

    return {
      success: true,
      message: `Đã tạo tài khoản "${email}" thành công!`,
      user: { uid, username: email, fullName, role, createdAt: new Date().toISOString() },
    };
  } catch (error: any) {
    const ma = error?.code || '';
    if (!LOI_THUONG.has(ma) && ma !== 'auth/email-already-in-use') {
      ErrorLogService.logError({
        level: 'Lỗi Cơ Sở Dữ Liệu',
        component: 'firestoreAuth.createAccount',
        message: `${ma} — ${error?.message || ''}`,
      });
    }
    return { success: false, message: loiTiengViet(ma) };
  } finally {
    /* Huỷ app phụ kể cả khi tạo lỗi — bỏ sót thì nó nằm lại trong bộ nhớ và
       giữ luôn một phiên đăng nhập không ai dùng. */
    if (phu) await phu.huy();
  }
};

// ─── 3. ĐẶT LẠI MẬT KHẨU ────────────────────────────────────────────────────
/**
 * Gửi thư đặt lại mật khẩu.
 *
 * ⚠ CHỮ KÝ ĐÃ ĐỔI: trước là `(docId, newPassword)` — admin tự gõ mật khẩu mới
 * rồi ghi thẳng vào Firestore. Nay không ai đặt hộ mật khẩu ai được nữa; chỉ
 * chủ hộp thư mới đặt được. Đó chính là điều đợt này muốn.
 *
 * Firebase gửi thư miễn phí trên gói Spark. Nội dung thư sửa ở
 * Firebase Console → Authentication → Templates.
 */
export const resetPasswordWithFirestore = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  const dinhDanh = (email || '').trim().toLowerCase();
  if (!dinhDanh) return { success: false, message: 'Không xác định được email tài khoản!' };

  /* Câu trả lời CỐ Ý giống hệt nhau dù email có tồn tại hay không. Nói khác đi
     là biến màn này thành công cụ dò xem ai có tài khoản trong hệ thống. */
  const traLoiChung = {
    success: true,
    message: `Nếu ${dinhDanh} có tài khoản, thư đặt lại mật khẩu đã được gửi. Hãy kiểm tra cả hộp thư rác.`,
  };

  try {
    await sendPasswordResetEmail(auth, dinhDanh);
    return traLoiChung;
  } catch (error: any) {
    const ma = error?.code || '';
    if (ma === 'auth/user-not-found') return traLoiChung;
    if (!LOI_THUONG.has(ma)) {
      ErrorLogService.logError({
        level: 'Lỗi Cơ Sở Dữ Liệu',
        component: 'firestoreAuth.resetPassword',
        message: `${ma} — ${error?.message || ''}`,
      });
    }
    return { success: false, message: loiTiengViet(ma) };
  }
};

// ─── 4. CẬP NHẬT VAI TRÒ ────────────────────────────────────────────────────
/**
 * Cập nhật vai trò dựa trên uid (= id tài liệu).
 * Chỉ nên được gọi từ giao diện Super Admin.
 */
export const updateUserRole = async (
  uid: string,
  newRole: string
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!uid) return { success: false, message: 'Không xác định được ID tài khoản!' };
    if (!newRole || !newRole.trim()) return { success: false, message: 'Vui lòng chọn quyền hạn mới!' };

    await updateDoc(doc(db, 'users', uid), { role: newRole.trim() });
    return { success: true, message: `Đã cập nhật quyền thành "${newRole}" thành công!` };
  } catch (error: any) {
    ErrorLogService.logError({
      level: 'Lỗi Cơ Sở Dữ Liệu',
      component: 'firestoreAuth.updateUserRole',
      message: error?.message || 'Lỗi khi cập nhật quyền người dùng',
    });
    return { success: false, message: error?.message || 'Không thể cập nhật quyền trên Firestore!' };
  }
};

// ─── 5. DANH SÁCH TÀI KHOẢN ─────────────────────────────────────────────────
export const getFirestoreUsers = async (): Promise<FirestoreUser[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map((s) => {
      const d = s.data();
      return {
        uid: s.id,
        username: d.email || d.username || '',
        fullName: d.fullName || d.name || '',
        role: d.role || 'student',
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || '',
      };
    });
  } catch (error: any) {
    ErrorLogService.logError({
      level: 'Lỗi Cơ Sở Dữ Liệu',
      component: 'firestoreAuth.getUsers',
      message: error?.message || 'Lỗi khi lấy danh sách người dùng',
    });
    return [];
  }
};
