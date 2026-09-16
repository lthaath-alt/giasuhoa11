import { createElement, type ReactNode } from 'react';
import { defaultSchema } from 'rehype-sanitize';

/* Cấu hình dùng CHUNG cho MathMarkdownCore và bộ kiểm `kiem-tra-su-pham.mts`,
   để phép kiểm dựng đúng thứ học sinh thấy chứ không phải một bản chép tay.
   Tách khỏi MathMarkdownCore vì tệp đó nạp CSS của KaTeX — Node không nạp được. */

export const LUOC_DO_LOC = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // remark-math đánh dấu công thức bằng class trên thẻ code; phải giữ lại cho rehype-katex nhận ra.
    code: [['className', /^language-./, 'math-inline', 'math-display']],
  },
};

export const TUY_CHON_KATEX = {
  throwOnError: false,   // công thức sai cú pháp thì hiện chữ đỏ, không làm vỡ cả tin nhắn
  strict: 'ignore' as const,
  trust: false,          // chặn \href, \url, \htmlClass… trong nội dung không tin cậy
  errorColor: 'var(--do)',
};

/** Link chỉ được là https, hoặc cùng nguồn với web (link bài kiểm tra nội bộ, kể cả khi chạy ở localhost). */
export function diaChiHopLe(href: string | undefined, nguonHienTai: string): URL | null {
  if (!href) return null;
  try {
    const u = new URL(href, nguonHienTai);
    if (u.origin === new URL(nguonHienTai).origin) return u;
    return u.protocol === 'https:' ? u : null;
  } catch {
    return null;
  }
}

/**
 * Thẻ `<a>` cho react-markdown. Viết bằng createElement (không JSX) để bộ kiểm
 * chạy bằng Node dùng lại được đúng hàm này.
 *   - Link không hợp lệ (javascript:, http: ngoài, data:…) → chỉ còn chữ.
 *   - Link ngoài: tab mới + rel đầy đủ (chống tabnabbing, không rò Referer).
 *   - Link cùng nguồn (bài kiểm tra do gia sư mở): giữ ở tab hiện tại để em đi
 *     thẳng vào bài; vẫn gắn rel cho nhất quán.
 */
export function taoTheLink(linkColor: string, nguonHienTai: string) {
  return ({ href, children }: { href?: string; children?: ReactNode }) => {
    const u = diaChiHopLe(href, nguonHienTai);
    if (!u) return createElement('span', null, children);
    const cungNguon = u.origin === new URL(nguonHienTai).origin;
    return createElement('a', {
      href: u.href,
      rel: 'noopener noreferrer nofollow',
      target: cungNguon ? undefined : '_blank',
      style: { color: linkColor, fontWeight: 600 },
    }, children);
  };
}
