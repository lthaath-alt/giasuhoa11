import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Send, Trash2, Sparkles, CheckCircle, Award, Lightbulb, HelpCircle, Clock, KeyRound } from 'lucide-react';
import { coKeyRieng } from '../services/keyRieng';
import { KeyRiengDialog } from './KeyRiengDialog';
import { useApp } from '../../../core/hooks/useApp';
import { Lesson } from '../../lessons/types';
import { KnowledgeTheoryCard } from './KnowledgeTheoryCard';
import { SuggestedQuestionsCard } from './SuggestedQuestionsCard';
import { layTrangThaiGioiHan, TRAN_LUOT_KHACH } from '../services/gioiHanChatService';
import { useGiayDaCho, chuDangCho } from './useGiayDaCho';
import { MathMarkdownRenderer } from '../../../core/components/MathMarkdownRenderer';

interface TutorChatProps {
  lesson: Lesson;
}

export const TutorChat: React.FC<TutorChatProps> = ({ lesson }) => {
  const {
    currentUser,
    chats,
    guestChatCount,
    addMessage,
    clearLessonHistory,
    isLessonCompleted,
    toggleLessonCompletion,
    loadLessonChats,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [remainingCooldown, setRemainingCooldown] = useState(0);
  /* Số giây đã chờ lượt này — để dòng "đang chuẩn bị gợi ý" không đứng im. */
  const giayDaCho = useGiayDaCho(isSending);

  /* Khoá Gemini riêng của em (20/09/2026). Chỉ mời khi lượt vừa rồi bị chặn vì
     CẢ WEB hết hạn mức trong ngày — đọc từ chính câu trả lời cuối, vì đó là
     nơi thông báo đó hiện ra. */
  const [moKey, setMoKey] = useState(false);
  const [daCoKeyRieng, setDaCoKeyRieng] = useState(() => coKeyRieng());

  // Load lịch sử chat từ Firestore khi vào bài học
  useEffect(() => {
    loadLessonChats(lesson.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id, currentUser?.email]);

  // Lọc tin nhắn của bài học hiện tại và user hiện tại
  const email = currentUser ? currentUser.email : 'guest';
  const lessonChats = chats.filter((c) => c.userEmail === email && c.lessonId === lesson.id);

  /* Câu trả lời cuối có phải thông báo hết hạn mức THEO NGÀY không. Bám vào
     đúng cụm chữ mà `thongBaoHetLuot` sinh ra cho trường hợp đó. */
  const vuaHetHanMuc = /hết lượt trả lời trong ngày của toàn hệ thống/
    .test(lessonChats[lessonChats.length - 1]?.content || '');

  // Cuộn xuống đáy khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [lessonChats, isSending]);

  /* Thời gian khoá (khi bị phát hiện spam) nay nằm ở Firestore — đọc một lần
     sau mỗi lượt gửi, rồi đếm lùi tại chỗ. Lạc đề và cảm xúc tiêu cực KHÔNG còn
     bị tính lượt phạt, nên không còn chip "Cảnh báo lạc đề x/5". */
  useEffect(() => {
    let huy = false;
    let interval: ReturnType<typeof setInterval> | undefined;
    layTrangThaiGioiHan(!currentUser)
      .then(({ conLaiKhoaMs }) => {
        if (huy) return;
        const het = Date.now() + conLaiKhoaMs;
        setRemainingCooldown(conLaiKhoaMs);
        if (conLaiKhoaMs > 0) {
          interval = setInterval(() => {
            const cd = Math.max(0, het - Date.now());
            setRemainingCooldown(cd);
            if (cd <= 0 && interval) clearInterval(interval);
          }, 1000);
        }
      })
      .catch(() => { /* không đọc được thì không hiện khoá; lượt gửi vẫn tự kiểm */ });

    return () => {
      huy = true;
      if (interval) clearInterval(interval);
    };
  }, [currentUser, isSending]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    /* Giới hạn tốc độ và spam nay kiểm trong addMessage, ở Firestore. */
    setInputMessage('');
    setIsSending(true);
    setErrorMsg(null);

    try {
      await addMessage(lesson.id, text);
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi kết nối với Chemai.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện của bài học này?')) {
      clearLessonHistory(lesson.id);
    }
  };

  /* Tính số lượt dùng thử còn lại — ĐỌC HẰNG SỐ, đừng chép cứng con số.
     Ngày 20/09/2026 trần hạ từ 25 xuống 5 nhưng hai dòng này còn nguyên 25,
     nên bản pages.dev hiện "còn 24" trên nền trần 5 sau câu đầu tiên. */
  const guestLimitReached = !currentUser && guestChatCount >= TRAN_LUOT_KHACH;
  const guestRemainingCount = !currentUser ? Math.max(0, TRAN_LUOT_KHACH - guestChatCount) : 0;

  return (
    <Box
      id="tutor-chat-container"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3,
        height: 'calc(100vh - 180px)',
        minHeight: 500,
      }}
    >
      {/* CỘT TRÁI: KIẾN THỨC BÀI HỌC VÀ CÂU HỎI MẪU */}
      <Box
        sx={{
          width: { xs: '100%', md: '35%' },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          height: '100%',
          overflowY: 'auto',
          pr: { md: 1 },
        }}
      >
        {/* Thẻ Lý thuyết tóm tắt */}
        <KnowledgeTheoryCard lesson={lesson} />

        {/* Nút Hoàn thành bài học và Tiến độ */}
        {currentUser && (
          <Paper
            id="completion-paper"
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'none',
              border: '1px solid var(--vien)',
              backgroundColor: 'var(--nen-the)',
              borderRadius: 0,
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Trạng thái tự học
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isLessonCompleted(lesson.id) ? 'Đã nắm vững bài này' : 'Chưa hoàn thành bài học'}
              </Typography>
            </Box>
            <Button
              id="toggle-completion-btn"
              variant={isLessonCompleted(lesson.id) ? 'contained' : 'outlined'}
              color={isLessonCompleted(lesson.id) ? 'secondary' : 'primary'}
              size="small"
              startIcon={<CheckCircle size={16} />}
              onClick={() => toggleLessonCompletion(lesson.id)}
              sx={{ textTransform: 'none', borderRadius: 0, fontWeight: 'bold' }}
            >
              {isLessonCompleted(lesson.id) ? 'Đã Xong!' : 'Đánh dấu Xong'}
            </Button>
          </Paper>
        )}

        {/* Thẻ câu hỏi tự học gợi ý */}
        <SuggestedQuestionsCard
          lesson={lesson}
          guestLimitReached={guestLimitReached}
          isSending={isSending}
          onQuestionClick={(q) => {
            if (!guestLimitReached) {
              setInputMessage(q);
              handleSend(q);
            } else {
              setErrorMsg(`Bạn đã dùng hết ${TRAN_LUOT_KHACH} lượt chat thử. Hãy đăng ký tài khoản để hỏi Chemai câu này nhé!`);
            }
          }}
        />
      </Box>

      {/* CỘT PHẢI: KHUNG CHAT GIA SƯ AI */}
      <Paper
        id="chat-frame-paper"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          borderRadius: 0,
          overflow: 'hidden',
          boxShadow: 'none',
          border: '1px solid var(--vien)',
          backgroundColor: 'var(--nen-the)',
        }}
      >
        {/* Chat Header */}
        <Box
          id="chat-header"
          sx={{
            p: 2,
            backgroundColor: 'var(--nen-trang)',
            borderBottom: '1px solid var(--vien)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'var(--tin-hieu-nen)', color: 'var(--chu-nguoc)' }}>
              <Sparkles size={20} />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 'bold' }}>
                Chemai
                <Chip label="ONLINE" size="small" color="secondary" sx={{ height: 16, fontSize: '0.65rem', fontWeight: 'bold' }} />
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Định hướng tư duy - Không cho sẵn đáp án trực tiếp
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {remainingCooldown > 0 ? (
              <Chip 
                icon={<Clock size={14} color="var(--do)" />} 
                label={`Tạm dừng: ${Math.ceil(remainingCooldown / 60000)} phút`} 
                color="error" 
                size="small" 
                variant="outlined"
                sx={{ fontWeight: 'bold' }}
              />
            ) : null}

            {lessonChats.length > 0 && (
              <Button
                id="clear-history-btn"
                size="small"
                color="error"
                startIcon={<Trash2 size={14} />}
                onClick={handleClearHistory}
                sx={{ textTransform: 'none' }}
              >
                Xóa lịch sử chat
              </Button>
            )}

          </Box>
        </Box>

        {/* Cảnh báo khách vãng lai hoặc tài khoản */}
        {!currentUser && (
          <Alert
            id="guest-alert"
            severity={guestRemainingCount === 0 ? 'error' : 'warning'}
            sx={{ py: 0.5, px: 2, borderRadius: 0, '.MuiAlert-message': { fontSize: '0.8rem' } }}
          >
            {guestRemainingCount === 0 ? (
              <strong>Bạn đã hết lượt dùng thử miễn phí.</strong>
            ) : (
              <span>
                Bạn đang dùng bản trải nghiệm miễn phí. Còn lại:{' '}
                <strong>{guestRemainingCount}/{TRAN_LUOT_KHACH} câu hỏi</strong>.
              </span>
            )}
            {' Đăng ký tài khoản học sinh để học tập không giới hạn!'}
          </Alert>
        )}

        {/* Khung chứa các tin nhắn */}
        <Box
          id="chat-messages-box"
          sx={{
            flex: 1,
            p: 3,
            overflowY: 'auto',
            backgroundColor: 'var(--nen-the)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {lessonChats.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 2,
                p: 4,
                textAlign: 'center',
              }}
            >
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'var(--nen-tin-hieu-nhat2)', color: 'var(--tin-hieu)' }}>
                <Sparkles size={32} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Trò chuyện với Chemai về bài học này
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mb: 1 }}>
                Nhập câu hỏi của em ở phía dưới, hoặc nhấp vào một trong các{' '}
                <strong>Câu hỏi tự luyện mẫu</strong> ở cột trái để bắt đầu buổi thảo luận nhé!
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                <Chip icon={<Award size={14} color="var(--chu-dam)" />} label="Hỗ trợ lý thuyết" variant="outlined" size="small" />
                <Chip icon={<Lightbulb size={14} color="var(--chu-dam)" />} label="Gợi mở phương pháp" variant="outlined" size="small" />
                <Chip icon={<HelpCircle size={14} color="var(--chu-dam)" />} label="Giải đáp thắc mắc" variant="outlined" size="small" />
              </Box>
            </Box>
          ) : (
            lessonChats.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 1.5,
                    alignSelf: isAi ? 'flex-start' : 'flex-end',
                    maxWidth: { xs: '90%', sm: '80%' },
                    textAlign: 'left',
                  }}
                >
                  {isAi && (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'var(--nen-tin-hieu-nhat2)',
                        color: 'var(--tin-hieu)',
                        border: '1px solid var(--nen-tin-hieu-nhat2)',
                      }}
                    >
                      <Sparkles size={16} />
                    </Avatar>
                  )}

                  <Box>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 0,
                        backgroundColor: isAi ? 'var(--nen-nhat)' : 'var(--luc-tham-nen)',
                        color: isAi ? 'text.primary' : 'var(--chu-nguoc)',
                        border: isAi ? '1px solid var(--vien)' : 'none',
                        boxShadow: 'none',
                      }}
                    >
                      <Typography component="div" variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.9rem' }}>
                        <MathMarkdownRenderer text={msg.content} linkColor={isAi ? 'var(--xanh)' : 'var(--chu-nguoc)'} />
                      </Typography>
                    </Paper>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.5, ml: 1, mr: 1, textAlign: isAi ? 'left' : 'right' }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}

          {/* Hiệu ứng đang gửi / AI phản hồi */}
          {isSending && (
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, alignSelf: 'flex-start', maxWidth: '80%' }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'var(--nen-tin-hieu-nhat2)',
                  color: 'var(--tin-hieu)',
                  border: '1px solid var(--nen-tin-hieu-nhat2)',
                }}
              >
                <Sparkles size={16} />
              </Avatar>
              <Paper
                sx={{
                  p: 1.5,
                  borderRadius: 0,
                  backgroundColor: 'var(--nen-nhat)',
                  border: '1px solid var(--vien)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <CircularProgress size={16} thickness={5} color="primary" />
                <Typography variant="caption" color="text.secondary">
                  {chuDangCho(giayDaCho, 'Chemai đang chuẩn bị gợi ý...')}
                </Typography>
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Hiển thị lỗi nếu có */}
        {errorMsg && (
          <Alert id="chat-error-alert" severity="error" onClose={() => setErrorMsg(null)} sx={{ borderRadius: 0 }}>
            {errorMsg}
          </Alert>
        )}

        {/* Khoá riêng: chỉ mời khi CẢ WEB vừa hết hạn mức trong ngày và em
            chưa có khoá. Không bày thường trực — học sinh không cần biết tới
            nó cho tới lúc thật sự bị chặn. */}
        {vuaHetHanMuc && !daCoKeyRieng && (
          <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid var(--vien)' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<KeyRound size={16} />}
              onClick={() => setMoKey(true)}
              sx={{ textTransform: 'none' }}
            >
              Khoá riêng của em — hỏi tiếp ngay hôm nay
            </Button>
          </Box>
        )}
        <KeyRiengDialog
          mo={moKey}
          onDong={() => setMoKey(false)}
          onDoi={() => setDaCoKeyRieng(coKeyRieng())}
        />

        {/* Khung nhập tin nhắn */}
        <Box
          id="chat-input-box"
          sx={{
            p: 2,
            backgroundColor: 'var(--nen-trang)',
            borderTop: '1px solid var(--vien)',
            display: 'flex',
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          <TextField
            id="chat-input-field"
            fullWidth
            placeholder={
              guestLimitReached
                ? 'Đã hết lượt chat thử! Đăng ký tài khoản học sinh ngay.'
                : remainingCooldown > 0
                ? `Đang tạm dừng (${Math.ceil(remainingCooldown / 60000)} phút)`
                : 'Hỏi Chemai về phương pháp giải bài...'
            }
            variant="outlined"
            size="small"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={guestLimitReached || isSending || remainingCooldown > 0}
            sx={{
              backgroundColor: 'var(--nen-the)',
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          />
          <Button
            id="chat-send-btn"
            variant="contained"
            color="primary"
            onClick={() => handleSend()}
            disabled={guestLimitReached || isSending || remainingCooldown > 0 || !inputMessage.trim()}
            sx={{
              borderRadius: 0,
              minWidth: 48,
              height: 40,
              p: 0,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            }}
          >
            {isSending ? <CircularProgress size={20} color="inherit" /> : <Send size={18} />}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
