import React from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, Grid,
} from '@mui/material';
import { KeyRound, Mail, UserX } from 'lucide-react';
import { User as UserType } from '../../features/auth/types';

/* Trang này trước 04/10/2026 gồm ba thứ, và cả ba đều không thật:
     - Hai ô "Mật khẩu Cấp 1" / "Mật khẩu Cấp 2" chỉ ghi "Tính năng đang được
       hoàn thiện". Chủ dự án chốt bỏ việc chia mật khẩu theo cấp.
     - "Danh sách yêu cầu cấp lại mật khẩu" là dữ liệu GIẢ: một `useEffect` lấy
       hai học sinh đầu danh sách làm "yêu cầu hôm nay". Hệ thống không hề có
       hàng đợi yêu cầu nào — học sinh tự bấm "Quên mật khẩu?" ở màn đăng nhập.
     - Nút "Cấp lại mật khẩu" bên cạnh lại gửi THƯ ĐẶT LẠI THẬT cho đúng em đó,
       tức một em không yêu cầu gì vẫn nhận thư.
   Nay trang chỉ nói điều đúng: mật khẩu đặt lại bằng cách nào, và tài khoản
   nào trong phạm vi quản lý KHÔNG tự đặt lại được. */

/** Đuôi địa chỉ của tài khoản tạo bằng tên đăng nhập, không có email thật.
 *  Ghép ở `createStudent` trong AppContext; xem docs/claude-reference/auth.md. */
const DUOI_KHONG_EMAIL = '@internal.local';

interface Props {
  users: UserType[];
}

const BUOC_DAT_LAI = [
  'Ở màn đăng nhập, bấm "Quên mật khẩu?".',
  'Nhập email tài khoản rồi bấm "Gửi thư đặt lại mật khẩu".',
  'Mở thư, bấm đường dẫn trong đó để tự đặt mật khẩu mới. Không thấy thư thì xem hộp thư rác.',
];

export const PasswordManagement: React.FC<Props> = ({ users }) => {
  const khongEmail = users
    .filter(u => (u.email || '').toLowerCase().endsWith(DUOI_KHONG_EMAIL))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <KeyRound size={20} color="var(--chu-dam)" />
        Đặt lại mật khẩu
      </Typography>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 0 }}>
        Không ai xem hay đặt hộ được mật khẩu của người khác, kể cả quản trị. Chỉ chủ
        tài khoản tự đặt lại được, qua thư gửi về email của chính mình.
      </Alert>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 0, border: '1px solid var(--vien)', height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Mail size={18} color="var(--chu-dam)" /> Tài khoản có email
            </Typography>
            <Box component="ol" sx={{ m: 0, pl: 2.5, color: 'var(--chu)', '& li': { mb: 0.75, lineHeight: 1.6 } }}>
              {BUOC_DAT_LAI.map((buoc, i) => (
                <Typography key={i} component="li" variant="body2">{buoc}</Typography>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 0, border: '1px solid var(--vien)', height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <UserX size={18} color="var(--chu-dam)" /> Tài khoản không có email
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--chu)', lineHeight: 1.6 }}>
              Học sinh được tạo bằng tên đăng nhập (không khai email) không nhận được thư
              đặt lại. Em nào quên mật khẩu thì thầy cô tạo lại tài khoản cho em bằng nút
              "Thêm tài khoản Học sinh" ở mục "Quản lý Tài khoản".
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', mb: 0.5 }}>
        Tài khoản không tự đặt lại được
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {users.length === 0
          ? 'Chưa có tài khoản nào trong phạm vi quản lý.'
          : khongEmail.length === 0
            ? `Cả ${users.length} tài khoản trong phạm vi quản lý đều có email, tự đặt lại được.`
            : `${khongEmail.length}/${users.length} tài khoản trong phạm vi quản lý không có email.`}
      </Typography>

      {khongEmail.length > 0 && (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid var(--vien)', borderRadius: 0 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'var(--nen-trang)' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'var(--chu)' }}>Họ tên</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'var(--chu)' }}>Tên đăng nhập</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {khongEmail.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>
                    {u.username || u.email.slice(0, -DUOI_KHONG_EMAIL.length)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default PasswordManagement;
