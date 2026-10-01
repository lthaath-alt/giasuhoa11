// ─── Phân loại ý định tin nhắn của em bằng hồi quy logistic (CHẠY BÓNG) ─────
//
// Nhóm đề tài tự gán nhãn và tự huấn luyện (`scripts/phan-loai/huan-luyen.py`),
// xuất trọng số ra JSON; tệp này chỉ làm phép nhân và softmax trên trình duyệt.
// Không gọi mạng, không tốn lượt AI.
//
// CHẠY BÓNG (02/10/2026): kết quả chỉ được GHI vào `chats`, KHÔNG được đổi hành
// vi gia sư. `kiem-tra:phan-loai` canh việc gia sư và máy trạng thái không
// import tệp này.
//
// `chuanHoaYDinh` phải ra ĐÚNG như `chuan_hoa` bên Python
// (`scripts/phan-loai/chung.py`). Lệch một ký tự thì mô hình vẫn ra nhãn — chỉ là
// nhãn sai. Hai bên cùng chạy `scripts/phan-loai/du-lieu/vecto-chuan-hoa.json`.
//
// Tệp thuần, không import gì.

/** Đổi cách chuẩn hoá thì tăng số này: mô hình cũ sẽ bị từ chối thay vì đoán sai. */
export const PHIEN_BAN_CHUAN_HOA = 1;

/** Chữ thường → bỏ dấu → đ thành d → mọi thứ ngoài a-z, 0-9 thành một dấu cách. */
export function chuanHoaYDinh(s: string): string {
  return (s ?? '').toLowerCase().normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Tách theo dấu cách. GIỮ từ một ký tự: "k biet", "e chiu" là cách em gõ thật. */
export function tachTuYDinh(s: string): string[] {
  const t = chuanHoaYDinh(s);
  return t ? t.split(' ') : [];
}
