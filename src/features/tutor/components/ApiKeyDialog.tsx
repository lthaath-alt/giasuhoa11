import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, IconButton, InputAdornment,
  Alert, Divider, CircularProgress, Link
} from '@mui/material';
import { Eye, EyeOff, Key, CheckCircle, ExternalLink, Save, Trash2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface ApiKeyDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ open, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (open) {
      const savedKey = localStorage.getItem('gemini_api_key_user');
      if (savedKey) {
        setApiKey(savedKey);
      }
      setTestResult(null);
    }
  }, [open]);

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Vui lòng nhập API Key để kiểm tra.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Say "hello" in Vietnamese, just that word.',
        config: { maxOutputTokens: 10 }
      });
      
      if (response.text) {
        setTestResult({ success: true, message: 'API Key hợp lệ! Đã kết nối thành công.' });
      } else {
        setTestResult({ success: false, message: 'Không nhận được phản hồi hợp lệ từ Gemini.' });
      }
    } catch (err: any) {
      const msg = err?.message?.toLowerCase() || '';
      if (msg.includes('api_key_invalid') || msg.includes('api key not valid')) {
        setTestResult({ success: false, message: 'API Key không hợp lệ.' });
      } else if (msg.includes('429') || msg.includes('quota')) {
        setTestResult({ success: false, message: 'API Key đã hết lượt sử dụng (quota exceeded).' });
      } else {
        setTestResult({ success: false, message: `Lỗi kết nối: ${err?.message || 'Không xác định'}` });
      }
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key_user', apiKey.trim());
    }
    onClose();
  };

  const handleDelete = () => {
    localStorage.removeItem('gemini_api_key_user');
    setApiKey('');
    setTestResult(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
        <Key size={20} color="#0f766e" />
        Cài đặt Gemini API Key
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              Bằng cách cung cấp API Key của riêng bạn, bạn có thể vượt qua giới hạn sử dụng chung và tận hưởng trải nghiệm học tập không gián đoạn. 
              <strong> Key của bạn chỉ được lưu cục bộ trên trình duyệt này và không bao giờ được gửi đến máy chủ của chúng tôi.</strong>
            </Typography>
          </Alert>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>API Key của bạn:</Typography>
            <TextField
              variant="outlined"
              fullWidth
              placeholder="AIzaSyB..."
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              {...({
                InputProps: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowKey(!showKey)} edge="end">
                        {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }
              } as any)}
            />
            
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5, justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<Trash2 size={16} />}
                onClick={handleDelete}
                disabled={!apiKey}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Xóa Key
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={testing ? <CircularProgress size={16} /> : <CheckCircle size={16} />}
                onClick={handleTestKey}
                disabled={testing || !apiKey}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Kiểm tra Key
              </Button>
            </Box>
          </Box>

          {testResult && (
            <Alert severity={testResult.success ? 'success' : 'error'} sx={{ borderRadius: 2 }}>
              {testResult.message}
            </Alert>
          )}

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Hướng dẫn lấy API Key miễn phí
            </Typography>
            <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '0.875rem', color: '#475569' }}>
              <li>Truy cập <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 'bold' }}>Google AI Studio <ExternalLink size={12} /></Link></li>
              <li>Đăng nhập bằng tài khoản Google của bạn.</li>
              <li>Bấm nút <strong>"Create API Key"</strong>.</li>
              <li>Sao chép key và dán vào ô bên trên.</li>
            </ol>
            
            <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0', bgcolor: '#f8fafc', aspectRatio: '16/9' }}>
              <iframe
                width="100%"
                height="100%"
                src=""
                title="Hướng dẫn lấy API Key"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </Box>
          </Box>

        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', borderRadius: 2 }}>
          Hủy
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          startIcon={<Save size={16} />}
          disabled={testing}
          sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none' }}
        >
          Lưu Key
        </Button>
      </DialogActions>
    </Dialog>
  );
};
