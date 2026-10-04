import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { Settings, ShieldAlert } from 'lucide-react';

/* Công tắc "Cho phép người dùng tự cung cấp Gemini API Key" đã gỡ ngày
   16/09/2026, cùng đợt bỏ hộp nhập key riêng: key nằm trần trong localStorage
   của máy dùng chung, và điều khoản Gemini API cấm ứng dụng dành cho người dưới
   18 tuổi, nên không thể xui học sinh lớp 11 tự tạo key. Từ đó công tắc không
   còn tác dụng gì, nhưng vẫn vẽ ra một cái nút gạt được — quản trị bật/tắt mà
   hệ thống không đổi hành vi.

   Giữ lại trang này (AdminPage có một tab trỏ tới) và thay bằng phần nói thật
   hạn mức đang dùng, vì đó mới là thứ quản trị cần biết khi gia sư ngừng trả lời. */

export const SystemSettingsManagement: React.FC = () => (
  <Box>
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Settings size={22} color="var(--chu-dam)" />
        Cài đặt Hệ thống
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Quản lý các cấu hình chung của nền tảng
      </Typography>
    </Box>

    <Paper sx={{ p: 3, borderRadius: 0, border: '1px solid var(--vien)', boxShadow: 'none' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShieldAlert size={18} color="var(--luc-tham)" />
        Hạn mức gọi gia sư AI
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Gia sư AI gọi Gemini qua Firebase AI Logic bằng hạn mức của dự án Firebase, không phải của
        từng người dùng. Bậc miễn phí cho 20 lượt trả lời mỗi ngày cho cả website; hết lượt thì mọi
        học sinh đều nhận thông báo chờ sang ngày hôm sau. Muốn nâng hạn mức thì bật thanh toán cho
        dự án trong Firebase Console, trang này không đổi được.
      </Typography>

      {/* Viết lại 02/10/2026. Câu cũ ("ô nhập API key riêng đã gỡ ngày 16/09/2026")
          sai từ 20/09/2026, khi khoá riêng CÓ LẠI dưới dạng hộp thoại chỉ mời lúc
          cả web hết hạn mức ngày — xem docs/claude-reference/security.md. Công
          tắc bật/tắt ở trang này thì vẫn không có, như chú thích đầu tệp. */}
      <Alert severity="info" sx={{ borderRadius: 0 }}>
        Khi cả web hết hạn mức trong ngày, học sinh được mời dùng "Khoá riêng": một khoá Gemini do
        bố mẹ hoặc thầy cô tạo giúp, vì Google yêu cầu người tạo khoá từ 18 tuổi. Khoá chỉ lưu
        trong trình duyệt trên máy của em, không lưu vào cơ sở dữ liệu của web. Trang này không có
        công tắc bật/tắt tính năng đó.
      </Alert>
    </Paper>
  </Box>
);

export default SystemSettingsManagement;
