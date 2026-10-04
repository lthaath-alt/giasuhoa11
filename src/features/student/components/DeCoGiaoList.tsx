import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, Chip, LinearProgress, Typography,
} from '@mui/material';
import { CalendarClock, ClipboardList, Clock } from 'lucide-react';
import { docBaiNop } from '../../quiz/baiNopService';
import { docDeCuaLop } from '../../quiz/deGiaoService';
import { QuizStorage } from '../../quiz/quizStorage';
import { maBaiLam, trangThaiDe } from '../../quiz/taoDeGiao';
import type { DeGiao } from '../../quiz/types';

/*
 * "Đề kiểm tra Thầy/Cô giao" — khối thật trong tab "Bài tập GV giao"
 * (22/09/2026).
 *
 * Link thông báo (`#/de/<id>`) vẫn là đường chính, nhưng link thì rơi mất
 * trong nhóm lớp sau vài chục tin nhắn. Khối này để em nào mất link vẫn tìm
 * lại được đề, và để em thấy đề nào mình đã nộp rồi.
 *
 * KHÔNG đọc ngân hàng câu hỏi ở đây: đề mang sẵn câu trong chính tài liệu
 * `de_giao`, nên mở tab này chỉ tốn số lượt đọc bằng số đề của lớp.
 */

const hai = (n: number) => String(n).padStart(2, '0');
const gioDep = (iso: string) => {
  const d = new Date(iso);
  return `${hai(d.getDate())}/${hai(d.getMonth() + 1)}/${d.getFullYear()} ${hai(d.getHours())}:${hai(d.getMinutes())}`;
};

export const DeCoGiaoList: React.FC<{
  classId: string;
  email: string;
  /** Báo số đề của lớp cho màn cha, để nó không ghi "chưa có bài tập" bên dưới */
  onSoDe?: (soDe: number) => void;
}> = ({ classId, email, onSoDe }) => {
  const navigate = useNavigate();
  const [ds, setDs] = useState<DeGiao[]>([]);
  const [daNop, setDaNop] = useState<Set<string>>(new Set());
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState(false);

  useEffect(() => {
    let huy = false;
    setDangTai(true);
    setLoi(false);
    void docDeCuaLop(classId)
      .then(async de => {
        if (huy) return;
        setDs(de);
        onSoDe?.(de.length);
        /* Hỏi máy này trước rồi mới hỏi Firestore: em làm ở máy khác thì
           localStorage trống, còn em làm ở chính máy này thì khỏi tốn lượt đọc. */
        const xong = new Set<string>();
        const canHoi: DeGiao[] = [];
        for (const d of de) {
          const ma = maBaiLam(d.id, email);
          if (QuizStorage.getQuizById(ma)?.status === 'submitted') xong.add(d.id);
          else canHoi.push(d);
        }
        const tra = await Promise.all(canHoi.map(d => docBaiNop(maBaiLam(d.id, email))));
        tra.forEach((ban, i) => { if (ban?.status === 'submitted') xong.add(canHoi[i].id); });
        if (!huy) setDaNop(xong);
      })
      .catch(e => {
        console.warn('[deCoGiao] không tải được đề của lớp', e);
        if (!huy) setLoi(true);
      })
      .finally(() => { if (!huy) setDangTai(false); });
    return () => { huy = true; };
  }, [classId, email]);

  if (dangTai) return <LinearProgress sx={{ mb: 3 }} />;

  if (loi) {
    return (
      <Alert severity="warning" sx={{ mb: 3, borderRadius: 0 }}>
        Chưa tải được đề kiểm tra của lớp. Kiểm tra mạng rồi tải lại trang.
      </Alert>
    );
  }

  if (ds.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'var(--chu-2)', display: 'block', mb: 1 }}>
        ĐỀ KIỂM TRA THẦY/CÔ GIAO
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {ds.map(de => {
          const nop = daNop.has(de.id);
          const tt = trangThaiDe(de);
          const vaoDuoc = nop || tt === 'dang-mo';
          return (
            <Card key={de.id} sx={{ borderRadius: 0, border: '1px solid var(--vien)', boxShadow: 'none' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
                  <Chip icon={<ClipboardList size={13} />} size="small" label={`${de.questions.length} câu`} />
                  <Chip
                    size="small"
                    label={nop ? 'Đã nộp' : tt === 'chua-mo' ? 'Chưa tới giờ' : tt === 'da-dong' ? 'Đã đóng' : 'Chưa làm'}
                    color={nop ? 'success' : tt === 'dang-mo' ? 'primary' : 'default'}
                  />
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>{de.tieuDe}</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Clock size={13} color="var(--chu-mo)" />
                  <Typography variant="caption" color="text.secondary">{de.soPhut} phút làm bài</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CalendarClock size={13} color="var(--chu-mo)" />
                  <Typography variant="caption" color="text.secondary">Hạn nộp: {gioDep(de.dongLuc)}</Typography>
                </Box>

                <Button
                  variant={nop ? 'outlined' : 'contained'}
                  color="secondary"
                  size="small"
                  disabled={!vaoDuoc}
                  onClick={() => navigate(`/de/${de.id}`)}
                >
                  {nop ? 'Xem lại bài' : tt === 'chua-mo' ? 'Chưa mở' : tt === 'da-dong' ? 'Đã hết hạn' : 'Vào làm bài'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default DeCoGiaoList;
