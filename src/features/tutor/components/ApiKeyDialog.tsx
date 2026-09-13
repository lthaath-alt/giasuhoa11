import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, IconButton, InputAdornment,
  Alert, Divider, CircularProgress, Link
} from '@mui/material';
import { Eye, EyeOff, Key, CheckCircle, ExternalLink, Save, Trash2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_MODEL_NAME } from '../../../core/constants';
import { thongBaoHetLuot, coDangKeyGoogle } from '../services/geminiTutorService';

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

    /* Chỉ chặn những thứ chắc chắn không phải key (một câu gõ nhầm, vài dấu
       cách), đừng đoán hình dạng key — Google có nhiều dạng key khác nhau và
       còn đổi nữa. Key có đúng hay không thì vòng gọi thử ngay dưới trả lời. */
    if (!coDangKeyGoogle(apiKey)) {
      setTestResult({
        success: false,
        message: 'Chuỗi này trông không giống một API Key (quá ngắn hoặc có dấu cách '
          + 'ở giữa). Em vào Google AI Studio, bấm "Create API Key" rồi bấm nút sao '
          + 'chép ngay cạnh dòng key để lấy đúng và đủ nhé.',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      /* KHÔNG đặt maxOutputTokens ở đây.

         Model đang dùng là model có suy nghĩ trước khi trả lời, và phần suy nghĩ
         cũng tính vào maxOutputTokens. Đặt 10 thì hạn mức hết sạch ngay trong
         lúc nghĩ, model dừng với response.text rỗng — nên MỘT KEY TỐT vẫn bị báo
         "Không nhận được phản hồi hợp lệ từ Gemini." Câu hỏi thử chỉ xin một từ
         nên bỏ hạn mức đi cũng không tốn gì đáng kể. */
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: 'Say "hello" in Vietnamese, just that word.',
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
      } else if (thongBaoHetLuot(err?.message || '')) {
        // Dùng chung cách diễn giải với khung chat, để học sinh không nhận hai
        // lời khuyên khác nhau cho cùng một lỗi hết lượt
        setTestResult({ success: false, message: thongBaoHetLuot(err?.message || '') });
      } else {
        setTestResult({ success: false, message: `Lỗi kết nối: ${err?.message || 'Không xác định'}` });
      }
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    /* KHÔNG lưu một key vừa bị kiểm tra và báo là hỏng.

       Key của người dùng ĐÈ LÊN đường gọi mặc định của web (Firebase AI Logic —
       xem generateAIResponse trong geminiTutorService), nên lưu
       nhầm một key sai là tắt luôn gia sư — mà học sinh sẽ không hiểu vì sao,
       chỉ thấy thầy im lặng. Bản trước nút "Lưu Key" vẫn bật ngay sau khi hộp
       thoại báo "API Key không hợp lệ".

       Chưa bấm kiểm tra thì vẫn cho lưu: có thể em dán key đúng mà mạng trường
       chặn lúc kiểm, chặn cứng thì lại thành cản trở. */
    if (testResult && !testResult.success) {
      setTestResult({
        success: false,
        message: 'Key này vừa kiểm tra và không dùng được nên thầy chưa lưu. '
          + 'Em kiểm tra lại key rồi bấm Lưu, hoặc bấm Hủy để giữ nguyên như cũ.',
      });
      return;
    }
    /* getEffectiveApiKey bỏ qua chuỗi không trông như key, nên lưu vào chỉ làm
       người dùng tưởng đã xong. Báo thẳng ở đây thay vì đóng hộp thoại. */
    if (apiKey.trim() && !coDangKeyGoogle(apiKey)) {
      setTestResult({
        success: false,
        message: 'Chuỗi này trông không giống một API Key (quá ngắn hoặc có dấu cách '
          + 'ở giữa) nên thầy chưa lưu. Em sao chép lại key ở Google AI Studio theo '
          + 'hướng dẫn bên dưới nhé.',
      });
      return;
    }
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
        <Key size={20} color="var(--luc-tham)" />
        Cài đặt Gemini API Key
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          
          <Alert severity="info" sx={{ borderRadius: 0 }}>
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
              placeholder="Dán key lấy từ Google AI Studio"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => {
                // Dán từ trang web hay dính dấu cách hoặc dấu nháy ở hai đầu
                setApiKey(e.target.value.trim().replace(/^["']|["']$/g, ''));
                setTestResult(null);
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowKey(!showKey)} edge="end">
                        {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 0 },
                },
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5, justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<Trash2 size={16} />}
                onClick={handleDelete}
                disabled={!apiKey}
                sx={{ textTransform: 'none', borderRadius: 0 }}
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
                sx={{ textTransform: 'none', borderRadius: 0 }}
              >
                Kiểm tra Key
              </Button>
            </Box>
          </Box>

          {testResult && (
            <Alert severity={testResult.success ? 'success' : 'error'} sx={{ borderRadius: 0 }}>
              {testResult.message}
            </Alert>
          )}

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Hướng dẫn lấy API Key miễn phí
            </Typography>
            <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '0.875rem', color: 'var(--chu)' }}>
              <li>Truy cập <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 'bold' }}>Google AI Studio <ExternalLink size={12} /></Link></li>
              <li>Đăng nhập bằng tài khoản Google của bạn.</li>
              <li>Bấm nút <strong>"Create API Key"</strong>.</li>
              <li>Sao chép key và dán vào ô bên trên.</li>
            </ol>
            
            {/* Khung video hướng dẫn đã gỡ: iframe để src rỗng khiến trình duyệt
                tải lại TOÀN BỘ ứng dụng vào bên trong khung, mỗi lần mở hộp thoại
                lại chạy thêm một bản web nữa. Khi nào có link video thật thì
                thêm iframe lại kèm src cụ thể. */}
          </Box>

        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', borderRadius: 0 }}>
          Hủy
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          startIcon={<Save size={16} />}
          disabled={testing}
          sx={{ textTransform: 'none', borderRadius: 0, boxShadow: 'none' }}
        >
          Lưu Key
        </Button>
      </DialogActions>
    </Dialog>
  );
};
