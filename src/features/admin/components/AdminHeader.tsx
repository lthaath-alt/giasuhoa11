import React from 'react';
import { Box, Paper, Typography, Chip, Button } from '@mui/material';
import { Users, RefreshCw } from 'lucide-react';

interface AdminHeaderProps {
  pendingCount: number;
  guestChatCount: number;
  resetGuestChats: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  pendingCount,
  guestChatCount,
  resetGuestChats,
}) => {
  return (
    <Paper
      id="admin-header"
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 3,
        backgroundColor: 'var(--nen-the)',
        border: '1px solid var(--vien)',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <Box>
        <Typography variant="h5" color="var(--cam)" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
          <Users size={24} /> Bảng Điều Khiển Quản Trị Viên
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Phê duyệt tài khoản học sinh, kiểm soát tiến độ và giám sát chất lượng gia sư AI.
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Chip
          label={`Đang chờ duyệt: ${pendingCount} tài khoản`}
          color={pendingCount > 0 ? 'warning' : 'default'}
          variant="filled"
          sx={{ fontWeight: 'bold' }}
        />
        <Button
          id="reset-guest-chats-btn"
          variant="outlined"
          color="secondary"
          size="small"
          startIcon={<RefreshCw size={14} />}
          onClick={() => {
            resetGuestChats();
            alert('Đã reset thành công số lượt chat dùng thử của Khách vãng lai về 0.');
          }}
          sx={{
            textTransform: 'none',
            borderColor: 'var(--teal)',
            color: 'var(--teal)',
            fontWeight: 'bold',
            '&:hover': {
              borderColor: 'var(--teal)',
              backgroundColor: 'rgba(15, 118, 110, 0.05)',
            },
          }}
        >
          Reset Khách thử ({guestChatCount}/25)
        </Button>
      </Box>
    </Paper>
  );
};
