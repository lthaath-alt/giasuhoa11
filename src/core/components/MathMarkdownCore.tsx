import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeSanitize from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
// Đăng ký lệnh \ce{} và \pu{} vào chính bản KaTeX mà rehype-katex dùng.
import 'katex/contrib/mhchem';
import { chuanHoaCongThuc } from './chuanHoaCongThuc';
import { LUOC_DO_LOC, TUY_CHON_KATEX, taoTheLink } from './markdownCauHinh';

/* ─── Phần NẶNG của MathMarkdownRenderer — nạp lười ────────────────────────────
   KaTeX + bộ phân tích Markdown nặng vài trăm KB; chỉ khung chat cần tới, nên
   tách thành chunk riêng (xem MathMarkdownRenderer.tsx).

   An ninh — thứ tự plugin là CỐ Ý:
     remark-math → (mdast→hast) → rehype-sanitize → rehype-katex
   Lọc TRƯỚC khi KaTeX dựng: nội dung do mô hình và học sinh viết là không tin
   cậy, còn HTML của KaTeX là do thư viện sinh (và `trust: false` chặn \href,
   \url, \htmlClass…). Lọc SAU thì bộ lọc sẽ xoá sạch class và style của KaTeX.
   Không ghi HTML thô vào DOM — react-markdown dựng thành nút React.

   Cấu hình (lược đồ lọc, tùy chọn KaTeX, thẻ link) nằm ở markdownCauHinh.ts để
   `npm run kiem-tra:su-pham` dựng đúng thứ học sinh thấy. */

export interface MathMarkdownProps {
  text: string;
  linkColor?: string;
}

const MathMarkdownCore: React.FC<MathMarkdownProps> = ({ text, linkColor = 'var(--xanh)' }) => {
  const components: Components = { a: taoTheLink(linkColor, window.location.href) };

  return (
    <div className="chem-md">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkBreaks]}
        rehypePlugins={[[rehypeSanitize, LUOC_DO_LOC], [rehypeKatex, TUY_CHON_KATEX]]}
        /* Ảnh trong tin nhắn là đường rò: một link ảnh ngoài chạy ngay khi giáo
           viên mở lại hội thoại trong trang quản trị. */
        disallowedElements={['img']}
        components={components}
      >
        {chuanHoaCongThuc(text)}
      </ReactMarkdown>
    </div>
  );
};

export default MathMarkdownCore;
