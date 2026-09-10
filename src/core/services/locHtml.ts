/**
 * Lọc HTML trước khi đưa vào `dangerouslySetInnerHTML`.
 *
 * VÌ SAO CÓ TỆP NÀY. Nội dung câu hỏi cần giữ chỉ số dưới và chỉ số trên thật
 * (N₂, SO₄²⁻) nên nó được lưu dưới dạng HTML và render bằng
 * `dangerouslySetInnerHTML`. Nhưng nguồn của nó là collection Firestore
 * `bank_questions`, và collection đó đang để `allow write: if true` — nghĩa là
 * BẤT KỲ AI trên Internet cũng ghi được vào đó.
 *
 * Ghép hai điều đó lại là một lỗ hổng XSS lưu trữ: kẻ tấn công ghi một câu hỏi
 * có `content` là `<img src=x onerror="...">`, rồi mọi học sinh và giáo viên mở
 * đề kiểm tra chứa câu đó đều chạy đoạn mã ấy. Vì `users` lưu mật khẩu dạng chữ
 * thường và `firestoreAuth.ts` so sánh ngay trên trình duyệt, kẻ tấn công lấy
 * được cả tài khoản.
 *
 * CÁCH LÀM: danh sách CHO PHÉP, không phải danh sách cấm. Danh sách cấm luôn
 * thua vì kẻ tấn công chỉ cần tìm một thứ chưa ai nghĩ tới; danh sách cho phép
 * thì thứ chưa nghĩ tới sẽ bị loại theo mặc định.
 *
 * Dùng chính bộ phân tích HTML của trình duyệt (`<template>`) chứ không dùng
 * biểu thức chính quy. Regex trên HTML luôn thua: `<img/src=x onerror=...>`,
 * `<IMG SRC=x ONERROR=...>`, `<<img>img src=x>` đều là những cách đã biết để
 * lách. Trình duyệt phân tích ra cây thật, và cây thì không lách được.
 *
 * `<template>` KHÔNG chạy script và KHÔNG tải tài nguyên khi phân tích — ảnh
 * trong đó không được gọi, nên `onerror` không có cơ hội nổ ngay lúc lọc.
 *
 * KHÔNG thêm thư viện: một danh sách cho phép cho sáu thẻ là bốn chục dòng đọc
 * hết được, còn PRODUCT.md ghi học sinh dùng mạng di động nên mỗi gói thêm vào
 * là một rào cản thật.
 */

/** Sáu thẻ này đủ cho công thức hoá học và nhấn mạnh trong đề bài. */
const THE_CHO_PHEP = new Set(['SUB', 'SUP', 'B', 'STRONG', 'I', 'EM', 'BR', 'U']);

/**
 * KHÔNG cho phép thuộc tính nào cả — kể cả `class` hay `style`.
 * Nội dung câu hỏi không cần thuộc tính nào để hiển thị đúng, mà mọi đường tấn
 * công qua thuộc tính (`onerror`, `onload`, `href="javascript:"`, `style` có
 * `url()`) đều biến mất cùng lúc khi bỏ hết.
 */
function donThuocTinh(el: Element): void {
  for (const ten of [...el.getAttributeNames()]) el.removeAttribute(ten);
}

/**
 * Trả về HTML chỉ còn các thẻ trong danh sách cho phép, không còn thuộc tính nào.
 * Thẻ ngoài danh sách bị bóc vỏ nhưng GIỮ LẠI phần chữ bên trong — sai một câu
 * hỏi thành trống còn tệ hơn là hiển thị nó ở dạng chữ thuần.
 */
export function locHtml(thoHtml: string): string {
  if (!thoHtml) return '';

  /* Ngoài trình duyệt (bộ kiểm chạy bằng tsx, script sinh dữ liệu) thì không có
     DOM. Lúc đó bỏ mọi thẻ và trả về chữ thuần — thà mất chỉ số dưới còn hơn
     trả về HTML chưa lọc cho nơi gọi tưởng là đã lọc. */
  if (typeof document === 'undefined') return thoHtml.replace(/<[^>]*>/g, '');

  const khung = document.createElement('template');
  khung.innerHTML = thoHtml;

  const duyet = (nut: Node): void => {
    /* Duyệt trên bản sao danh sách con: vòng lặp có gỡ và chèn node, mà
       childNodes là danh sách SỐNG nên duyệt thẳng trên nó sẽ nhảy cóc. */
    for (const con of [...nut.childNodes]) {
      if (con.nodeType === Node.TEXT_NODE) continue;

      if (con.nodeType !== Node.ELEMENT_NODE) {
        /* Chú thích HTML và mọi loại node khác: bỏ hẳn. Chú thích có thể mang
           mã trong vài đường tấn công cũ. */
        con.parentNode?.removeChild(con);
        continue;
      }

      const el = con as Element;
      duyet(el);

      if (THE_CHO_PHEP.has(el.tagName)) {
        donThuocTinh(el);
      } else {
        /* Bóc vỏ: đưa các con lên thay chỗ thẻ này rồi xoá thẻ.
           `<script>` và `<style>` thì xoá cả ruột — ruột của chúng là mã chứ
           không phải chữ để đọc. */
        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') {
          el.parentNode?.removeChild(el);
        } else {
          const cha = el.parentNode;
          while (el.firstChild) cha?.insertBefore(el.firstChild, el);
          cha?.removeChild(el);
        }
      }
    }
  };

  duyet(khung.content);
  return khung.innerHTML;
}
