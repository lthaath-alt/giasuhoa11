// ─── Chế độ sáng / tối ───────────────────────────────────────────────────────
//
// Bảng màu thật nằm trong `src/index.css` dưới dạng biến CSS. Hook này gắn
// `data-theme="dark"` lên thẻ <html> để bảng màu tối có hiệu lực, và nhớ lựa
// chọn cho lần sau.
//
// Mặc định là SÁNG, kể cả khi máy đang để chế độ tối: phần lớn học sinh mở web
// giữa ban ngày trên máy trường, và nền sáng vẫn là giao diện đã được kiểm kỹ
// hơn. Ai thích tối thì bấm một cái, máy nhớ luôn.
//
// QUAN TRỌNG — vì sao trạng thái để NGOÀI React:
// Hook này được gọi ở hai nơi: `App` (dựng lại theme MUI) và `DashboardHeader`
// (cái nút bấm). Nếu mỗi nơi giữ một `useState` riêng thì bấm nút chỉ đổi state
// của header: biến CSS đổi theo (vì effect có gắn data-theme lên <html>) nhưng
// `App` không hề hay biết, nên MUI vẫn ở chế độ sáng và nền <body> vẫn trắng.
// Đúng lỗi đã gặp. Nay mọi nơi gọi hook đều đọc chung một biến và cùng được
// báo khi nó đổi.

import { useEffect, useState } from 'react';

const KHOA = 'h11_che_do_mau';
export type CheDoMau = 'sang' | 'toi';

function docLuaChon(): CheDoMau {
  try {
    return localStorage.getItem(KHOA) === 'toi' ? 'toi' : 'sang';
  } catch {
    // Trình duyệt chặn localStorage (chế độ riêng tư) — cứ chạy nền sáng
    return 'sang';
  }
}

let cheDoHienTai: CheDoMau = docLuaChon();
const nguoiNghe = new Set<(c: CheDoMau) => void>();

/** Gắn thuộc tính lên <html> — biến CSS trong index.css bám vào đây. */
function apDung(c: CheDoMau) {
  const goc = document.documentElement;
  if (c === 'toi') goc.dataset.theme = 'dark';
  else delete goc.dataset.theme;
}

function dat(c: CheDoMau) {
  if (c === cheDoHienTai) return;
  cheDoHienTai = c;
  apDung(c);
  try { localStorage.setItem(KHOA, c); } catch { /* không lưu được thì thôi */ }
  nguoiNghe.forEach(f => f(c));
}

export function useCheDoMau() {
  const [cheDo, datCheDo] = useState<CheDoMau>(cheDoHienTai);

  useEffect(() => {
    nguoiNghe.add(datCheDo);
    // Phòng khi giá trị đổi giữa lúc dựng và lúc gắn effect
    if (cheDoHienTai !== cheDo) datCheDo(cheDoHienTai);
    return () => { nguoiNghe.delete(datCheDo); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    cheDo,
    laToi: cheDo === 'toi',
    doiCheDo: () => dat(cheDoHienTai === 'toi' ? 'sang' : 'toi'),
  };
}

/* Đặt thuộc tính NGAY khi tệp được nạp, trước cả lần vẽ đầu tiên của React.
   Nếu chờ useEffect thì người dùng đã chọn nền tối sẽ thấy một nháy trắng mỗi
   lần mở web — khó chịu và trông như lỗi. */
apDung(cheDoHienTai);
