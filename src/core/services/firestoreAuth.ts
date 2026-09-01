import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { ErrorLogService } from './errorLog';

// ─── Data Interface cho User trên Firestore ─────────────────────────────────
export interface FirestoreUser {
  /** Document ID trên Firestore (dùng làm UID) */
  uid: string;
  /** Mã đăng nhập / Tên tài khoản */
  username: string;
  /** Mật khẩu lưu dạng plain text */
  password: string;
  /** Họ và tên hiển thị */
  fullName: string;
  /** Vai trò: "teacher", "student", "admin", v.v. */
  role: string;
  /** Thời gian tạo tài khoản */
  createdAt?: string | Timestamp;
}

// ─── 1. CHỨC NĂNG ĐĂNG NHẬP (Firestore direct) ──────────────────────────────
/**
 * Đăng nhập bằng cách truy vấn Firestore collection "users" theo username hoặc email
 * và so sánh trực tiếp chuỗi mật khẩu (plain text).
 */
export const loginWithFirestore = async (
  username: string,
  password: string
): Promise<{ success: boolean; message: string; user?: FirestoreUser }> => {
  try {
    const trimmedUsername = username.trim().toLowerCase();
    if (!trimmedUsername || !password) {
      return { success: false, message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!' };
    }

    // Bước 1: Tham chiếu tới collection "users" trên Firestore
    const usersCollection = collection(db, 'users');

    // Bước 2: Tạo query tìm document có field "username" hoặc "email" khớp
    let querySnapshot = await getDocs(query(usersCollection, where('username', '==', trimmedUsername)));
    if (querySnapshot.empty) {
      querySnapshot = await getDocs(query(usersCollection, where('email', '==', trimmedUsername)));
    }

    // Bước 3: Nếu không tìm thấy document nào khớp username/email
    if (querySnapshot.empty) {
      return { success: false, message: 'Sai tài khoản hoặc mật khẩu' };
    }

    // Bước 4: Lấy document đầu tiên tìm được
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Bước 5: So sánh chuỗi mật khẩu trực tiếp (Plain text comparison)
    if (userData.password !== password) {
      return { success: false, message: 'Sai tài khoản hoặc mật khẩu' };
    }

    // Bước 6: Đăng nhập thành công -> Trả về thông tin user cùng document ID (uid)
    const user: FirestoreUser = {
      uid: userDoc.id,
      username: userData.username || userData.email || trimmedUsername,
      password: userData.password,
      fullName: userData.fullName || userData.name || '',
      role: userData.role || 'student',
      createdAt: userData.createdAt ? userData.createdAt.toString() : new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Đăng nhập thành công!',
      user,
    };
  } catch (error: any) {
    console.error('Lỗi khi đăng nhập Firestore:', error);
    ErrorLogService.logError({
      level: 'Lỗi Cơ Sở Dữ Liệu',
      component: 'firestoreAuth.login',
      message: error?.message || 'Lỗi khi đăng nhập Firestore'
    });
    return {
      success: false,
      message: error?.message || 'Có lỗi xảy ra khi kết nối tới Firestore. Vui lòng kiểm tra lại cấu hình Firebase!',
    };
  }
};

// ─── 2. CHỨC NĂNG TẠO TÀI KHOẢN (Firestore direct) ──────────────────────────
/**
 * Tạo tài khoản mới bằng cách kiểm tra username/email chưa tồn tại,
 * sau đó ghi trực tiếp document mới vào collection "users" từ client.
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
}): Promise<{ success: boolean; message: string; user?: FirestoreUser }> => {
  try {
    const username = data.username.trim().toLowerCase();
    const password = data.password;
    const fullName = data.fullName.trim();
    const role     = data.role || 'student';
    const email    = (data.email || username).trim().toLowerCase();
    const status   = data.status || 'active';

    if (role === 'admin' || role === 'admin' || role === 'school_admin') {
      return { success: false, message: 'Chỉ được phép tạo tài khoản với vai trò học sinh hoặc giáo viên qua chức năng này.' };
    }

    if (!username || !password || !fullName) {
      return { success: false, message: 'Vui lòng nhập đầy đủ Username, Mật khẩu và Họ tên!' };
    }

    const usersCollection = collection(db, 'users');

    // Bước 1: Kiểm tra username/email đã tồn tại chưa bằng query
    let checkSnapshot = await getDocs(query(usersCollection, where('username', '==', username)));
    if (checkSnapshot.empty && email) {
      checkSnapshot = await getDocs(query(usersCollection, where('email', '==', email)));
    }

    if (!checkSnapshot.empty) {
      return { success: false, message: `Tài khoản / Email "${username}" đã tồn tại trên Firestore!` };
    }

    // Bước 2: Chuẩn bị dữ liệu document mới (Plain text password, createdAt timestamp)
    const newUserPayload: Record<string, any> = {
      username,
      password, // Lưu plain text theo yêu cầu
      fullName,
      name: fullName,
      email,
      role,
      status,
      createdAt: serverTimestamp(),
    };

    if (data.classId) newUserPayload.classId = data.classId;
    if (data.schoolId) newUserPayload.schoolId = data.schoolId;

    // Bước 3: Ghi trực tiếp document mới vào Firestore (bằng addDoc từ client)
    const docRef = await addDoc(usersCollection, newUserPayload);

    // Bước 4: Trả về đối tượng User vừa tạo thành công
    const createdUser: FirestoreUser = {
      uid: docRef.id,
      username,
      password,
      fullName,
      role,
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      message: `Đã tạo tài khoản "${username}" thành công trên Firestore!`,
      user: createdUser,
    };
  } catch (error: any) {
    console.error('Lỗi khi tạo tài khoản Firestore:', error);
    ErrorLogService.logError({
      level: 'Lỗi Cơ Sở Dữ Liệu',
      component: 'firestoreAuth.createAccount',
      message: error?.message || 'Lỗi khi tạo tài khoản trên Firestore'
    });
    return {
      success: false,
      message: error?.message || 'Không thể tạo tài khoản trên Firestore. Vui lòng kiểm tra lại kết nối/config!',
    };
  }
};

// ─── 3. CHỨC NĂNG RESET MẬT KHẨU (Firestore direct) ────────────────────────
/**
 * Reset/Đổi mật khẩu bằng cách gọi updateDoc trực tiếp trên document ID của người dùng.
 */
export const resetPasswordWithFirestore = async (
  docId: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!docId) {
      return { success: false, message: 'Không xác định được ID tài khoản!' };
    }
    if (!newPassword || newPassword.trim() === '') {
      return { success: false, message: 'Mật khẩu mới không được để trống!' };
    }

    // Bước 1: Tạo tham chiếu tới document cụ thể trong collection "users"
    const userDocRef = doc(db, 'users', docId);

    // Bước 2: Gọi updateDoc ghi đè trực tiếp trường password (plain text)
    await updateDoc(userDocRef, {
      password: newPassword,
    });

    return {
      success: true,
      message: 'Cập nhật mật khẩu thành công!',
    };
  } catch (error: any) {
    console.error('Lỗi khi reset mật khẩu Firestore:', error);
    ErrorLogService.logError({
      level: 'Lỗi Cơ Sở Dữ Liệu',
      component: 'firestoreAuth.resetPassword',
      message: error?.message || 'Lỗi khi cập nhật mật khẩu trên Firestore'
    });
    return {
      success: false,
      message: error?.message || 'Không thể cập nhật mật khẩu trên Firestore!',
    };
  }
};

// ─── 4. CẬP NHẬT QUYỀN (ROLE) TÀI KHOẢN (Dành cho Super Admin) ─────────────
/**
 * Cập nhật vai trò (role) của một tài khoản dựa trên document ID.
 * Chỉ nên được gọi từ giao diện Super Admin.
 */
export const updateUserRole = async (
  docId: string,
  newRole: string
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!docId) {
      return { success: false, message: 'Không xác định được ID tài khoản!' };
    }
    if (!newRole || !newRole.trim()) {
      return { success: false, message: 'Vui lòng chọn quyền hạn mới!' };
    }

    const userDocRef = doc(db, 'users', docId);
    await updateDoc(userDocRef, { role: newRole.trim() });

    return {
      success: true,
      message: `Đã cập nhật quyền thành "${newRole}" thành công!`,
    };
  } catch (error: any) {
    console.error('Lỗi khi cập nhật role Firestore:', error);
    ErrorLogService.logError({
      level: 'Lỗi Cơ Sở Dữ Liệu',
      component: 'firestoreAuth.updateUserRole',
      message: error?.message || 'Lỗi khi cập nhật quyền người dùng',
    });
    return {
      success: false,
      message: error?.message || 'Không thể cập nhật quyền trên Firestore!',
    };
  }
};

// ─── 5. TRUY VẤN DANH SÁCH TÀI KHOẢN (Hiển thị cho Admin/GV) ───────────────
/**
 * Lấy tất cả tài khoản từ collection "users" để hiển thị trong giao diện quản lý.
 */
export const getFirestoreUsers = async (): Promise<FirestoreUser[]> => {
  try {
    const usersCollection = collection(db, 'users');
    const snapshot = await getDocs(usersCollection);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        uid: docSnap.id,
        username: data.username || '',
        password: data.password || '',
        fullName: data.fullName || data.name || '',
        role: data.role || 'student',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || '',
      };
    });
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách user từ Firestore:', error);
    ErrorLogService.logError({
      level: 'Lỗi Cơ Sở Dữ Liệu',
      component: 'firestoreAuth.getUsers',
      message: error?.message || 'Lỗi khi lấy danh sách người dùng'
    });
    return [];
  }
};
