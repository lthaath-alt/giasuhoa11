import React, { useState } from 'react';
import { Box, Typography, Paper, Switch, FormControlLabel, CircularProgress, Alert } from '@mui/material';
import { Settings, ShieldAlert } from 'lucide-react';
import { useApp } from '../hooks/useApp';

export const SystemSettingsManagement: React.FC = () => {
  const { systemSettings, updateSystemSettings } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleApiKey = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    setError(null);
    const newVal = e.target.checked;
    
    const success = await updateSystemSettings({ allowUserApiKey: newVal });
    if (!success) {
      setError('Cập nhật cài đặt thất bại. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings size={22} color="var(--cam)" />
            Cài đặt Hệ thống
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Quản lý các cấu hình chung của nền tảng
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid var(--vien)', boxShadow: 'none' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldAlert size={18} color="var(--teal)" />
          Giới hạn sử dụng & API Key
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', p: 2, bgcolor: 'var(--nen-trang)', borderRadius: 2 }}>
          <Box sx={{ pr: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu-dam-2)' }}>
              Cho phép người dùng tự cung cấp Gemini API Key
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Khi bật, học sinh và giáo viên sẽ bị chặn chat nếu chưa cung cấp API Key cá nhân trong cài đặt của họ. 
              Điều này giúp giảm tải quota cho hệ thống. Khi tắt, người dùng sẽ dùng API Key mặc định của hệ thống.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {loading && <CircularProgress size={16} sx={{ mr: 1 }} />}
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(systemSettings?.allowUserApiKey)}
                  onChange={handleToggleApiKey}
                  disabled={loading}
                  color="primary"
                />
              }
              label={systemSettings?.allowUserApiKey ? 'Đang bật' : 'Đã tắt'}
              labelPlacement="start"
              sx={{ m: 0, '& .MuiFormControlLabel-label': { fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--chu)', mr: 1 } }}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SystemSettingsManagement;
