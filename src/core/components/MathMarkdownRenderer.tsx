import React, { Suspense, lazy } from 'react';
import type { MathMarkdownProps } from './MathMarkdownCore';

/* ─── Hiển thị tin nhắn chat: Markdown + công thức KaTeX (+ mhchem) ───────────
   Thay cho RichText.tsx + mathText.ts (xoá ngày 14/09/2026).

   Phần nặng nằm ở MathMarkdownCore và chỉ tải khi có tin nhắn đầu tiên cần
   hiện. Trong lúc tải, hiện chữ thô để tin nhắn không bị trống. */

const Core = lazy(() => import('./MathMarkdownCore'));

export const MathMarkdownRenderer: React.FC<MathMarkdownProps> = (props) => (
  <Suspense fallback={<span style={{ whiteSpace: 'pre-line' }}>{props.text}</span>}>
    <Core {...props} />
  </Suspense>
);
