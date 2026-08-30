import React from 'react';

/**
 * Hiển thị văn bản có markdown đơn giản của gia sư AI.
 *
 * Trước đây tin nhắn được render bằng {msg.content} nên các dấu **, * và
 * link [chữ](địa chỉ) hiện ra nguyên ký tự thay vì được định dạng.
 *
 * CỐ Ý chỉ xử lý 3 cú pháp thực sự có trong tin nhắn, không dựng cả bộ
 * markdown đầy đủ:
 *    **đậm**            -> <strong>
 *    *nghiêng*          -> <em>
 *    [chữ](địa chỉ)     -> <a>
 *
 * Xuống dòng và gạch đầu dòng "- " vẫn do CSS whiteSpace: 'pre-line' lo,
 * hiển thị đúng như văn bản gốc.
 *
 * Cặp dấu lẻ (ví dụ chỉ có một dấu *) sẽ không khớp và được giữ nguyên,
 * nên công thức hóa học hay chú thích có dấu sao không bị hỏng.
 */

// Thứ tự nhánh quan trọng: link -> đậm -> nghiêng.
// Nếu để nghiêng trước, nó sẽ ăn mất một nửa của cặp **.
//
// Nhánh nghiêng bắt buộc chữ bên trong không bắt đầu/kết thúc bằng khoảng
// trắng (đúng quy tắc markdown). Nếu bỏ ràng buộc này thì câu kiểu
// "Nồng độ * 2 = ..., chú thích (*) xem dưới" sẽ bị hiểu nhầm hai dấu sao
// rời rạc thành một cặp in nghiêng và nuốt mất đoạn giữa.
const MARKUP =
  /\[([^\]\n]+)\]\(([^)\s]+)\)|\*\*([\s\S]+?)\*\*|\*([^\s*][^*\n]*?[^\s*]|[^\s*])\*/g;

interface RichTextProps {
  text: string;
  /** Màu chữ của link; mặc định hợp với bong bóng chat nền sáng */
  linkColor?: string;
}

export const RichText: React.FC<RichTextProps> = ({ text, linkColor = '#0062b8' }) => {
  if (!text) return null;

  const nodes: React.ReactNode[] = [];
  const re = new RegExp(MARKUP.source, 'g');
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));

    if (m[1] !== undefined) {
      nodes.push(
        <a
          key={key++}
          href={m[2]}
          style={{ color: linkColor, fontWeight: 600 }}
        >
          {m[1]}
        </a>,
      );
    } else if (m[3] !== undefined) {
      nodes.push(<strong key={key++}>{m[3]}</strong>);
    } else if (m[4] !== undefined) {
      nodes.push(<em key={key++}>{m[4]}</em>);
    }

    last = m.index + m[0].length;
  }

  if (last < text.length) nodes.push(text.slice(last));

  return <>{nodes}</>;
};
