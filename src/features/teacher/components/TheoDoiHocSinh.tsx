import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, LinearProgress, Paper, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tabs, Typography,
} from '@mui/material';
import { BarChart3, ClipboardCheck, MessageSquare, Send } from 'lucide-react';
import { CHEMISTRY_11_CURRICULUM } from '../../lessons/constants';
import { docBaiNopCuaCacEm } from '../../quiz/baiNopService';
import { docChatCuaEm, docTienDoCacEm } from '../services/theoDoiService';
import { GiaoDeTab } from './GiaoDeTab';
import { QuizProgressTab } from './QuizProgressTab';
import { ProgressChatsTab } from '../../admin/components/ProgressChatsTab';
import type { ChatMessage, LearningProgress, User } from '../../auth/types';
import type { Quiz } from '../../quiz/types';

/*
 * Mục "Theo dõi học sinh" của trang giáo viên (18/09/2026).
 *
 * `QuizProgressTab` và `ProgressChatsTab` đã viết xong từ trước nhưng không
 * trang nào gắn vào, nên giáo viên không có chỗ nào xem kết quả của lớp. Tệp
 * này gom hai khối đó, thêm một bảng tổng quan cả lớp ở thẻ đầu và thẻ "Giao đề
 * kiểm tra" (22/09/2026, xem `GiaoDeTab.tsx`). Mọi số liệu
 * đọc thẳng Firestore — không có dòng dữ liệu mẫu nào.
 */

const MA_BAI = new Set(CHEMISTRY_11_CURRICULUM.flatMap(c => c.lessons).map(l => l.id));
const TONG_SO_BAI = MA_BAI.size;
/** Chỉ đếm bài có thật — khung chat chung ghi cả mã 'student-free-chat'. */
const soBaiXong = (p: LearningProgress | null) => (p?.completedLessons || []).filter(id => MA_BAI.has(id)).length;

const diem10 = (q: Quiz) => (q.maxScore > 0 ? (q.score / q.maxScore) * 10 : 0);

const TheSo: React.FC<{ nhan: string; so: string; ghiChu: string }> = ({ nhan, so, ghiChu }) => (
  <Paper sx={{ p: 2, borderRadius: 0, border: '1px solid var(--vien)', boxShadow: 'none' }}>
    <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'var(--chu-2)', fontSize: '0.65rem', letterSpacing: '0.08em', display: 'block', lineHeight: 1.4 }}>
      {nhan}
    </Typography>
    <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: 'var(--chu-dam)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
      {so}
    </Typography>
    <Typography variant="caption" sx={{ color: 'var(--chu-mo)' }}>{ghiChu}</Typography>
  </Paper>
);

export const TheoDoiHocSinh: React.FC<{ students: User[] }> = ({ students }) => {
  const [the, setThe] = useState(0);
  const [tienDo, setTienDo] = useState<Record<string, LearningProgress>>({});
  const [baiNop, setBaiNop] = useState<Quiz[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);

  const khoaEmail = students.map(s => s.email.toLowerCase()).sort().join('|');

  useEffect(() => {
    const emails = khoaEmail ? khoaEmail.split('|') : [];
    let huy = false;
    setDangTai(true);
    setLoi(null);
    Promise.all([docTienDoCacEm(emails), docBaiNopCuaCacEm(emails)])
      .then(([td, bn]) => { if (!huy) { setTienDo(td); setBaiNop(bn); } })
      .catch(e => {
        console.warn('[theoDoi] không tải được số liệu lớp', e);
        if (!huy) setLoi('Không tải được số liệu của lớp. Kiểm tra mạng rồi tải lại trang.');
      })
      .finally(() => { if (!huy) setDangTai(false); });
    return () => { huy = true; };
  }, [khoaEmail]);

  const napChat = useCallback(async (email: string) => {
    if (chats.some(c => c.userEmail === email)) return;
    try {
      const moi = await docChatCuaEm(email);
      setChats(prev => [...prev.filter(c => c.userEmail !== email), ...moi]);
    } catch (e) {
      console.warn('[theoDoi] không tải được hội thoại', email, e);
    }
  }, [chats]);

  const layTienDo = (email: string) => tienDo[email.toLowerCase()] || null;

  // ── Số liệu tổng quan ──────────────────────────────────────────────────────
  const hang = students.map(s => {
    const bai = baiNop.filter(q => q.userEmail === s.email.toLowerCase());
    const soBaiHoc = soBaiXong(layTienDo(s.email));
    const tb = bai.length ? bai.reduce((t, q) => t + diem10(q), 0) / bai.length : null;
    return { s, soBaiHoc, soBaiKT: bai.length, tb, ganNhat: bai[0]?.createdAt };   // bai đã xếp mới nhất trước
  });
  const siSo = students.length;
  const soEmDaHoc = hang.filter(h => h.soBaiHoc > 0).length;
  const tatCaDiem = baiNop.map(diem10);
  const tbLop = tatCaDiem.length ? tatCaDiem.reduce((a, b) => a + b, 0) / tatCaDiem.length : null;

  return (
    <Box>
      <Paper sx={{ borderRadius: 0, border: '1px solid var(--vien)', boxShadow: 'none', mb: 2.5 }}>
        <Tabs value={the} onChange={(_, v) => setThe(v)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<BarChart3 size={16} />} iconPosition="start" label="Tổng quan lớp" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
          <Tab icon={<Send size={16} />} iconPosition="start" label="Giao đề kiểm tra" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
          <Tab icon={<ClipboardCheck size={16} />} iconPosition="start" label="Bài kiểm tra và chấm tự luận" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
          <Tab icon={<MessageSquare size={16} />} iconPosition="start" label="Tiến độ và hội thoại AI" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
        </Tabs>
      </Paper>

      {the === 0 && (
        <Box>
          {loi && <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>{loi}</Alert>}
          {dangTai && <LinearProgress sx={{ mb: 2 }} />}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 2.5 }}>
            <TheSo nhan="SĨ SỐ" so={`${siSo}`} ghiChu="học sinh trong lớp" />
            <TheSo nhan="ĐÃ BẮT ĐẦU HỌC" so={`${soEmDaHoc}/${siSo}`} ghiChu="em hoàn thành ít nhất 1 bài" />
            <TheSo nhan="BÀI KIỂM TRA ĐÃ NỘP" so={`${baiNop.length}`} ghiChu="tổng cả lớp" />
            <TheSo nhan="ĐIỂM TRUNG BÌNH" so={tbLop === null ? '—' : tbLop.toFixed(1)} ghiChu="thang 10, mọi bài đã nộp" />
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: 0, border: '1px solid var(--vien)', boxShadow: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'var(--nen-nhat)' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>STT</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Học sinh</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: 180 }}>Bài học hoàn thành</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Bài KT đã nộp</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Điểm TB</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Lần làm gần nhất</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hang.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      Lớp chưa có học sinh nào.
                    </TableCell>
                  </TableRow>
                ) : hang.map((h, i) => (
                  <TableRow key={h.s.email} hover>
                    <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{h.s.studentNumber ?? i + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{h.s.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={TONG_SO_BAI ? (h.soBaiHoc / TONG_SO_BAI) * 100 : 0}
                          color="secondary"
                          sx={{ flex: 1, height: 6, borderRadius: 0, bgcolor: 'var(--vien)' }}
                        />
                        <Typography variant="caption" sx={{ fontVariantNumeric: 'tabular-nums', minWidth: 40 }}>
                          {h.soBaiHoc}/{TONG_SO_BAI}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{h.soBaiKT}</TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 'bold' }}>
                      {h.tb === null ? '—' : h.tb.toFixed(1)}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {h.ganNhat ? new Date(h.ganNhat).toLocaleDateString('vi-VN') : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {the === 1 && <GiaoDeTab students={students} />}

      {the === 2 && <QuizProgressTab students={students} />}

      {the === 3 && (
        <ProgressChatsTab
          students={students}
          chats={chats}
          getUserProgress={layTienDo}
          onSelectStudent={email => { void napChat(email); }}
        />
      )}
    </Box>
  );
};

export default TheoDoiHocSinh;
