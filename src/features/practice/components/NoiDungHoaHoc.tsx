import React from 'react';
import { locHtml } from '../../../core/services/locHtml';

/**
 * Hiển thị nội dung câu hỏi, giữ chỉ số dưới/trên của công thức hóa học.
 *
 * Câu hỏi nhập từ file Word qua mammoth giữ lại thẻ <sub>/<sup>; bỏ đi thì
 * "H2SO4" hiện sai hẳn so với sách.
 *
 * Nội dung câu hỏi do giáo viên nhập và do AI sinh ra rồi dán vào — cả hai đều
 * là chữ người ngoài viết, nên phải lọc trước khi ghi thẳng vào trang. Lọc bằng
 * bản dùng chung ở core/services/locHtml.ts chứ không tự viết một bản riêng:
 * một bộ lọc thì còn giữ đúng được, hai bộ lọc sẽ trôi lệch nhau.
 */

interface Props {
  noiDung: string;
  /** Thẻ bao ngoài — dùng 'div' khi nội dung nằm riêng một khối */
  as?: 'span' | 'div';
}

export const NoiDungHoaHoc: React.FC<Props> = ({ noiDung, as = 'span' }) => {
  const The = as;
  return <The dangerouslySetInnerHTML={{ __html: locHtml(noiDung || '') }} />;
};
