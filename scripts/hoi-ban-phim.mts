import readline from 'node:readline';
/**
 * Hỏi email và mật khẩu ngay tại máy đang chạy script.
 *
 * Tách ra từ `liet-ke-tai-khoan.mts` ngày 20/09/2026, khi `sua-cau-hoi.mts`
 * cần đúng hai hàm này. Mỗi chú thích bên dưới là một lỗi đã trả giá — chép
 * lại thành bản thứ hai là chúng sẽ lệch nhau theo thời gian.
 *
 * KHÔNG nhận mật khẩu qua tham số dòng lệnh, và không lưu nó ở đâu: dòng lệnh
 * nằm trong lịch sử shell và trong danh sách tiến trình của cả máy.
 */

/** Hỏi một dòng bình thường, có hiện chữ. */
export function hoi(cauHoi: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(xong => {
    /* Chạy không có bàn phím (đầu vào bị chuyển hướng) thì readline đóng mà
       KHÔNG gọi callback — thiếu dòng này là script lặng lẽ thoát, người chạy
       tưởng nó hỏng. */
    rl.on('close', () => xong(''));
    /* Trả giá trị TRƯỚC rồi mới đóng. `rl.close()` phát sự kiện `close` NGAY
       LẬP TỨC, nên bản cũ (đóng trước, trả sau) để dòng trên chốt chuỗi rỗng
       trước — email gõ đúng vẫn ra "Chưa nhập email". Lỗi sống từ 13/09 tới
       17/09/2026, lộ ra khi chủ dự án gõ email thay vì truyền qua tham số. */
    rl.question(cauHoi, v => { xong(v.trim()); rl.close(); });
  });
}

/**
 * Hỏi mật khẩu.
 *
 * Bản đầu (13/09/2026) không vẽ gì cả khi người dùng gõ. Chủ dự án thử trên
 * Windows PowerShell và báo "không nhập được ô mật khẩu" — phím CÓ vào, chỉ là
 * màn hình đứng im nên không ai biết. Một ô nhập không phản hồi thì người dùng
 * kết luận là hỏng, và kết luận đó hợp lý.
 *
 * Nay mỗi phím vẽ một dấu sao. Mặc định KHÔNG hiện chữ thật: terminal giữ lại
 * khung cuộn, mà khung cuộn hay bị chụp màn hình gửi đi. Muốn chữ thật thì
 * thêm cờ `--hien`.
 *
 * Đọc phím ở chế độ thô chứ không ghi đè `_writeToOutput` của readline: hàm đó
 * còn được gọi cho cả chuỗi điều khiển vẽ lại dòng, nên đếm dấu sao sai.
 */
export function hoiKin(cauHoi: string, hien: boolean): Promise<string> {
  const ra = process.stdout;
  const vao = process.stdin;

  /* Không có bàn phím thật (đầu vào bị chuyển hướng) thì chế độ thô không bật
     được — lùi về đọc cả dòng như bình thường. */
  if (!vao.isTTY) return hoi(cauHoi);

  return new Promise(xong => {
    ra.write(cauHoi);
    vao.setRawMode(true);
    vao.resume();
    vao.setEncoding('utf8');

    let daGo = '';
    const nghe = (khoi: string) => {
      /* Phím mũi tên / Home / End gửi cả chuỗi thoát `[A`. Bỏ ký tự ESC
         rồi duyệt tiếp thì `[` và `A` lọt vào mật khẩu thành rác — phải bỏ cả
         khối. */
      if (khoi.charCodeAt(0) === 0x1b) return;
      for (const c of khoi) {
        if (c === '\r' || c === '\n') {
          vao.off('data', nghe);
          vao.setRawMode(false);
          vao.pause();
          ra.write('\n');
          xong(daGo);
          return;
        }
        if (c === '\u0003') {           // Ctrl+C
          vao.setRawMode(false);
          ra.write('\n');
          process.exit(130);
        }
        if (c === '\u007f' || c === '\b') {   // Backspace
          if (daGo.length) { daGo = daGo.slice(0, -1); ra.write('\b \b'); }
          continue;
        }
        if (c < ' ') continue;         // bỏ mọi phím điều khiển khác
        daGo += c;
        ra.write(hien ? c : '*');
      }
    };
    vao.on('data', nghe);
  });
}
