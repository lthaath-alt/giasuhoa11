import React from 'react';
import { doiCongThuc, SUB_OPEN, SUP_OPEN, MARK_CLOSE } from './mathText';

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
 *
 * ─── THỨ TỰ XỬ LÝ (quan trọng) ───────────────────────────────────────────────
 * Tách markdown TRƯỚC, đổi công thức SAU, và chỉ đổi trên phần CHỮ.
 *
 * Bản trước làm ngược: gọi doiCongThuc() lên cả tin nhắn rồi mới tách markdown.
 * Vì thế địa chỉ link cũng bị coi là công thức, và mã bài kiểm tra
 * `quiz_1788260660617_862` biến thành `quiz₁788260660617₈62` — học sinh bấm
 * vào là link chết. mathText phải tự vá bằng cách giấu markdown link sau
 * placeholder, nhưng cách đó chỉ cứu được link đúng cú pháp `[chữ](địa chỉ)`,
 * còn URL viết trần thì vẫn hỏng. Đảo thứ tự lại là hết tận gốc: href không bao
 * giờ đi qua bộ đổi công thức nữa.
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

/** Vị trí chỉ số mà doiCongThuc đã đánh dấu */
const CHI_SO = new RegExp(
  `${SUB_OPEN}([^${MARK_CLOSE}]*)${MARK_CLOSE}|${SUP_OPEN}([^${MARK_CLOSE}]*)${MARK_CLOSE}`,
  'g',
);

/**
 * Đổi công thức trong một đoạn chữ rồi dựng chỉ số thành <sub>/<sup> thật.
 * Dùng cho cả chữ thường, chữ đậm/nghiêng và nhãn hiển thị của link.
 */
function dungChu(doan: string, khoa: () => number): React.ReactNode[] {
  const text = doiCongThuc(doan);
  const ra: React.ReactNode[] = [];
  const re = new RegExp(CHI_SO.source, 'g');
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) ra.push(text.slice(last, m.index));
    ra.push(
      m[1] !== undefined
        ? <sub key={khoa()}>{m[1]}</sub>
        : <sup key={khoa()}>{m[2]}</sup>,
    );
    last = m.index + m[0].length;
  }

  if (last < text.length) ra.push(text.slice(last));
  return ra;
}

interface RichTextProps {
  text: string;
  /** Màu chữ của link; mặc định hợp với bong bóng chat nền sáng */
  linkColor?: string;
}

export const RichText: React.FC<RichTextProps> = ({ text: raw, linkColor = '#0062b8' }) => {
  if (!raw) return null;

  const nodes: React.ReactNode[] = [];
  const re = new RegExp(MARKUP.source, 'g');
  let last = 0;
  let key = 0;
  const khoa = () => key++;
  let m: RegExpExecArray | null;

  while ((m = re.exec(raw)) !== null) {
    if (m.index > last) nodes.push(...dungChu(raw.slice(last, m.index), khoa));

    if (m[1] !== undefined) {
      // Địa chỉ (m[2]) giữ nguyên tuyệt đối; chỉ nhãn hiển thị mới đổi công thức
      nodes.push(
        <a
          key={khoa()}
          href={m[2]}
          style={{ color: linkColor, fontWeight: 600 }}
        >
          {dungChu(m[1], khoa)}
        </a>,
      );
    } else if (m[3] !== undefined) {
      nodes.push(<strong key={khoa()}>{dungChu(m[3], khoa)}</strong>);
    } else if (m[4] !== undefined) {
      nodes.push(<em key={khoa()}>{dungChu(m[4], khoa)}</em>);
    }

    last = m.index + m[0].length;
  }

  if (last < raw.length) nodes.push(...dungChu(raw.slice(last), khoa));

  return <>{nodes}</>;
};
