import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Typography, Box, Alert, Stack, Link,
} from '@mui/material';
import { KeyRound, ShieldCheck, Trash2 } from 'lucide-react';
import { docKey, luuKey, xoaKey, cheKey } from '../services/keyRieng';

interface Props {
  mo: boolean;
  onDong: () => void;
  /** Gọi sau khi lưu hoặc xoá, để màn chat vẽ lại trạng thái */
  onDoi?: () => void;
}

/**
 * Hộp thoại để em tự dán khoá Gemini của mình.
 *
 * Viết cho học sinh lớp 11 đang bị chặn giữa buổi học: bốn bước đánh số, mỗi
 * bước một việc, và nói thẳng khoá nằm ở đâu. Không doạ, không thuật ngữ.
 */
export const KeyRiengDialog: React.FC<Props> = ({ mo, onDong, onDoi }) => {
  const [nhap, setNhap] = useState('');
  const [loi, setLoi] = useState<string | null>(null);
  const dangCo = docKey();

  const luu = () => {
    if (luuKey(nhap)) {
      setNhap('');
      setLoi(null);
      onDoi?.();
      onDong();
    } else {
      setLoi('Khoá chưa đúng dạng. Khoá của Google bắt đầu bằng "AIza" hoặc "AQ." và không có dấu cách. Em thử dán lại nhé.');
    }
  };

  return (
    <Dialog open={mo} onClose={onDong} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <KeyRound size={20} /> Khoá riêng của em
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Cả web dùng chung một hạn mức hỏi Gia sư AI mỗi ngày. Hết hạn mức thì
          cả lớp phải chờ sang hôm sau. Nếu em có khoá riêng, em có phần hạn mức
          của riêng mình và hỏi tiếp được ngay.
        </Typography>

        <Alert severity="warning" sx={{ mb: 2, borderRadius: 0 }}>
          Google yêu cầu <b>người tạo khoá phải từ 18 tuổi trở lên</b>. Em nhờ bố mẹ
          hoặc thầy cô làm bốn bước dưới đây giúp em nhé — em chỉ cần dán khoá vào ô cuối.
        </Alert>

        <Stack spacing={1.2} sx={{ mb: 2 }}>
          <Typography variant="body2"><b>1.</b> Mở{' '}
            <Link href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
              aistudio.google.com/apikey
            </Link>
          </Typography>
          <Typography variant="body2"><b>2.</b> Đăng nhập bằng tài khoản Google của người lớn, rồi bấm <b>Create API key</b>.</Typography>
          <Typography variant="body2"><b>3.</b> Bấm nút sao chép khoá vừa hiện ra.</Typography>
          <Typography variant="body2"><b>4.</b> Dán vào ô dưới đây rồi bấm Lưu.</Typography>
        </Stack>

        <Alert severity="info" icon={<ShieldCheck size={18} />} sx={{ mb: 2, borderRadius: 0 }}>
          Khoá chỉ được lưu trong trình duyệt trên máy này. Web không gửi khoá
          đi đâu, thầy cô và bạn bè không đọc được, và em xoá lúc nào cũng được.
          Nếu em dùng máy chung ở trường thì nhớ bấm Xoá khoá trước khi rời máy.
        </Alert>

        {dangCo && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Máy này đang lưu khoá: <b>{cheKey(dangCo)}</b>
            </Typography>
          </Box>
        )}

        <TextField
          fullWidth
          size="small"
          label="Dán khoá vào đây"
          value={nhap}
          onChange={e => { setNhap(e.target.value); setLoi(null); }}
          placeholder="AIza..."
          autoComplete="off"
          spellCheck={false}
        />
        {loi && <Alert severity="warning" sx={{ mt: 1.5, borderRadius: 0 }}>{loi}</Alert>}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          Hai phút thôi, và làm một lần là dùng được mãi. Em làm được mà.
        </Typography>
      </DialogContent>
      <DialogActions>
        {dangCo && (
          <Button
            color="error"
            startIcon={<Trash2 size={16} />}
            onClick={() => { xoaKey(); onDoi?.(); onDong(); }}
          >
            Xoá khoá khỏi máy này
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onDong}>Để sau</Button>
        <Button variant="contained" onClick={luu} disabled={!nhap.trim()}>Lưu khoá</Button>
      </DialogActions>
    </Dialog>
  );
};

export default KeyRiengDialog;
