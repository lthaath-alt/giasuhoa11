// ─── Kho ngân hàng câu hỏi hợp nhất ──────────────────────────────────────────
//
// Hai nơi lưu, mỗi nơi một vai trò:
//
//   Firestore  `bank_questions`  — bản thật, mọi người dùng chung, còn khi đổi máy
//   IndexedDB  hoa11 / kv / bank — bản cho trò chơi đọc, cùng origin nên dùng chung
//
// Trò chơi "Vòng Quanh Hóa 11" chạy trong iframe cùng origin với web, nên hai bên
// đọc chung được IndexedDB mà không cần máy chủ. Đó là kênh đồng bộ.
//
// CỐ Ý KHÔNG dùng localStorage làm kênh: ngân hàng có ảnh base64, đã từng làm đầy
// localStorage ở mức 5 MB và gây mất dữ liệu. Ghi chú dự án của trò chơi cấm quay
// lại cách đó.
//
// CỐ Ý dùng collection MỚI thay vì ghi đè `questions`: dữ liệu cũ giữ nguyên làm
// đường lùi, chuyển đổi sai vẫn khôi phục được.

import { collection, doc, getDocs, setDoc, deleteDoc, writeBatch, getCountFromServer, query, where, documentId } from 'firebase/firestore';
import { db } from '../../core/services/firebase';
import { BankQuestion, BankStore, emptyStore, chuanHoaCau } from './types';

const COL_BANK = 'bank_questions';

/** Phải trùng khai báo trong hoa11-boardgame.html */
const IDB_NAME = 'hoa11';
const IDB_STORE = 'kv';
const IDB_KEY = 'bank';

// ─── IndexedDB — kênh dùng chung với trò chơi ────────────────────────────────

function openIdb(): Promise<IDBDatabase | null> {
  return new Promise(resolve => {
    try {
      if (!window.indexedDB) return resolve(null);
      const rq = window.indexedDB.open(IDB_NAME);
      // Trò chơi là bên tạo kho. Nếu web mở trước thì phải tự tạo store,
      // nếu không transaction bên dưới sẽ ném lỗi.
      rq.onupgradeneeded = () => {
        const d = rq.result;
        if (!d.objectStoreNames.contains(IDB_STORE)) d.createObjectStore(IDB_STORE);
      };
      rq.onsuccess = () => resolve(rq.result);
      rq.onerror = () => resolve(null);
      rq.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/** Đọc kho của trò chơi. Trả về null khi không đọc được, KHÔNG ném lỗi. */
export async function readGameStore(): Promise<BankStore | null> {
  const d = await openIdb();
  if (!d) return null;
  return new Promise(resolve => {
    try {
      if (!d.objectStoreNames.contains(IDB_STORE)) return resolve(null);
      const tx = d.transaction(IDB_STORE, 'readonly');
      const rq = tx.objectStore(IDB_STORE).get(IDB_KEY);
      rq.onsuccess = () => resolve((rq.result as BankStore) || null);
      rq.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/** Ghi kho cho trò chơi đọc. Trả về false khi thất bại. */
export async function writeGameStore(store: BankStore): Promise<boolean> {
  const d = await openIdb();
  if (!d) return false;
  return new Promise(resolve => {
    try {
      const tx = d.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(store, IDB_KEY);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

// ─── Firestore — bản thật ────────────────────────────────────────────────────

/** Firestore không nhận undefined; bỏ hẳn những khoá đó đi. */
function clean<T extends Record<string, unknown>>(o: T): Record<string, unknown> {
  const r: Record<string, unknown> = {};
  Object.keys(o).forEach(k => {
    const v = o[k];
    if (v !== undefined) r[k] = v;
  });
  return r;
}

export const BankFirestore = {
  /**
   * Đếm số lượng câu hỏi trong collection bank_questions.
   */
  async getCount(): Promise<number> {
    try {
      const snap = await getCountFromServer(collection(db, COL_BANK));
      return snap.data().count;
    } catch {
      const snap = await getDocs(collection(db, COL_BANK));
      return snap.docs.length;
    }
  },

  /**
   * CỐ Ý ném lỗi ra ngoài thay vì trả mảng rỗng.
   *
   * Nếu nuốt lỗi, mất mạng hay thiếu quyền sẽ hiện y như "ngân hàng trống" —
   * giáo viên tưởng mất sạch câu hỏi, tệ hơn nữa là bấm chuyển đổi lại hoặc
   * đưa một ngân hàng rỗng sang trò chơi, ghi đè mất dữ liệu thật.
   */
  async getAll(): Promise<BankQuestion[]> {
    const snap = await getDocs(collection(db, COL_BANK));
    // chuanHoaCau: 148 cau mau cua tro choi khong co truong `t`, thieu no thi
    // BankManager khong ve phuong an nao. Xem chu thich trong types.ts.
    return snap.docs.map(d => chuanHoaCau({ ...(d.data() as BankQuestion), id: d.id }));
  },

  /**
   * Câu hỏi đã gắn vào một bài học cụ thể.
   *
   * Dùng `where` thay vì tải cả ngân hàng rồi lọc: đề kiểm tra chỉ cần vài câu,
   * còn ngân hàng có ảnh base64 nên tải hết rất nặng cho máy học sinh.
   *
   * Câu chưa gắn `lessonId` sẽ không khớp — đúng ý: thà đề trống còn hơn lấy
   * nhầm câu của bài khác.
   */
  async getByLesson(lessonId: string): Promise<BankQuestion[]> {
    if (!lessonId) return [];
    try {
      const snap = await getDocs(
        query(collection(db, COL_BANK), where('lessonId', '==', lessonId)),
      );
      return snap.docs.map(d => chuanHoaCau({ ...(d.data() as BankQuestion), id: d.id }));
    } catch (err) {
      // Mất mạng / thiếu quyền: trả rỗng để chỗ gọi tự quyết, KHÔNG chặn chat.
      // Log ra để phân biệt "bài chưa có câu" với "không đọc được ngân hàng".
      console.error('[Quiz] Không đọc được bank_questions cho bài', lessonId, err);
      return [];
    }
  },

  /**
   * Lấy đúng mấy câu theo id. Dùng cho phần "những câu em còn sai".
   *
   * `where(documentId(), 'in', …)` chỉ nhận tối đa 30 giá trị mỗi lượt nên chia
   * lô; danh sách câu sai của một em thường dưới 30, tức một lượt gọi.
   *
   * Trước 20/09/2026 chỗ này tải CẢ ngân hàng rồi lọc tại máy — 1.554 lượt đọc
   * để lấy về dăm câu.
   */
  async getByIds(ids: string[]): Promise<BankQuestion[]> {
    if (!ids.length) return [];
    const ra: BankQuestion[] = [];
    for (let i = 0; i < ids.length; i += 30) {
      const lo = ids.slice(i, i + 30);
      try {
        const snap = await getDocs(
          query(collection(db, COL_BANK), where(documentId(), 'in', lo)),
        );
        ra.push(...snap.docs.map(d => chuanHoaCau({ ...(d.data() as BankQuestion), id: d.id })));
      } catch (err) {
        // Mất mạng / thiếu quyền: bỏ lô này, KHÔNG chặn cả màn ôn lại.
        console.error('[Luyện tập] Không đọc được câu theo id', lo, err);
      }
    }
    return ra;
  },

  /**
   * Câu hỏi của cả một chương, cho đề tổng hợp cuối chương.
   *
   * `getByLesson` không đủ vì đề này gom câu của nhiều bài; nhưng tải cả ngân
   * hàng thì quá tay. Đo 20/09/2026: chương nặng nhất là chương 2 với 583 câu,
   * tức vẫn chưa bằng 40% của 1.554.
   *
   * CỐ Ý không bọc try/catch — chỗ gọi trong AppContext đang bắt lỗi và nói
   * thật với học sinh. Nuốt lỗi ở đây là biến "chưa đọc được ngân hàng" thành
   * "chương này chưa có câu nào", sai hẳn nguyên nhân.
   */
  async getByChapter(ch: number): Promise<BankQuestion[]> {
    const snap = await getDocs(query(collection(db, COL_BANK), where('ch', '==', ch)));
    return snap.docs.map(d => chuanHoaCau({ ...(d.data() as BankQuestion), id: d.id }));
  },

  async save(q: BankQuestion): Promise<boolean> {
    try {
      await setDoc(doc(db, COL_BANK, q.id), clean(q as unknown as Record<string, unknown>));
      return true;
    } catch {
      return false;
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, COL_BANK, id));
      return true;
    } catch {
      return false;
    }
  },

  /** Ghi nhiều câu; Firestore giới hạn 500 thao tác mỗi batch. */
  async saveMany(qs: BankQuestion[]): Promise<number> {
    let ok = 0;
    try {
      const SIZE = 400;
      for (let i = 0; i < qs.length; i += SIZE) {
        const batch = writeBatch(db);
        const chunk = qs.slice(i, i + SIZE);
        chunk.forEach(q =>
          batch.set(doc(db, COL_BANK, q.id), clean(q as unknown as Record<string, unknown>)),
        );
        await batch.commit();
        ok += chunk.length;
      }
    } catch {
      /* trả về số đã ghi được, phần còn lại coi như thất bại */
    }
    return ok;
  },
};

// ─── Cầu nối hai chiều ───────────────────────────────────────────────────────

/**
 * Bơm ngân hàng từ Firestore sang kho của trò chơi.
 *
 * Giữ nguyên `deleted`, `overrides`, `pending`, `pin` mà giáo viên đã đặt trong
 * game — chỉ thay danh sách câu tự nhập.
 */
export async function pushToGame(questions: BankQuestion[]): Promise<boolean> {
  const cur = (await readGameStore()) || emptyStore();
  return writeGameStore({ ...cur, questions });
}

export interface PullResult {
  /** Câu trong game khác với bản trên Firestore, cần ghi ngược lên */
  changed: BankQuestion[];
  /** Id câu đã bị xoá trong game */
  removed: string[];
}

/**
 * So kho của trò chơi với bản trên Firestore để biết giáo viên đã sửa gì.
 *
 * Chỉ so danh sách câu tự nhập. Câu mẫu dựng sẵn của game nằm trong hằng số
 * BANK của file HTML, không thuộc phạm vi đồng bộ; giáo viên sửa chúng thì game
 * ghi vào `overrides` và phần đó vẫn nằm lại bên game.
 */
export async function pullFromGame(known: BankQuestion[]): Promise<PullResult> {
  const store = await readGameStore();
  if (!store) return { changed: [], removed: [] };

  const inGame = store.questions || [];
  const byId = new Map(known.map(q => [q.id, q]));
  const gameIds = new Set(inGame.map(q => q.id));

  const changed = inGame.filter(q => {
    const old = byId.get(q.id);
    return !old || JSON.stringify(old) !== JSON.stringify(q);
  });

  const removed = known.filter(q => !gameIds.has(q.id)).map(q => q.id);

  return { changed, removed };
}

/** Đẩy thay đổi từ game lên Firestore. Trả về số câu đã ghi. */
export async function syncBackFromGame(known: BankQuestion[]): Promise<PullResult> {
  const res = await pullFromGame(known);
  if (res.changed.length) await BankFirestore.saveMany(res.changed);
  for (const id of res.removed) await BankFirestore.remove(id);
  return res;
}
