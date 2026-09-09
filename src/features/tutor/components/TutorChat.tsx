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
import { Send, Trash2, Sparkles, CheckCircle, Award, Lightbulb, HelpCircle, Clock, ShieldAlert, Settings, Key } from 'lucide-react';
import { useApp } from '../../../core/hooks/useApp';
import { Lesson } from '../../lessons/types';
import { KnowledgeTheoryCard } from './KnowledgeTheoryCard';
import { SuggestedQuestionsCard } from './SuggestedQuestionsCard';
import { ApiKeyDialog } from './ApiKeyDialog';
import { getEffectiveApiKey } from '../services/geminiTutorService';
import { getRemainingCooldown, getCooldownState, checkRateLimit, recordMessageSent } from '../services/cooldownService';
import { RichText } from '../../../core/components/RichText';

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
  const [offTopicStrikes, setOffTopicStrikes] = useState(0);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  /* Hỏi getEffectiveApiKey chứ KHÔNG đọc thẳng localStorage: key còn có thể đến
     từ biến môi trường VITE_GEMINI_API_KEY. Nếu chỉ đọc localStorage thì trường
     nào cấu hình key chung vẫn bị đòi từng học sinh tự nhập key riêng. */
  const coKey = () => getEffectiveApiKey() !== 'MISSING_API_KEY' && !!getEffectiveApiKey();
  const [hasApiKey, setHasApiKey] = useState(coKey);
  const { systemSettings } = useApp();

  // Load lịch sử chat từ Firestore khi vào bài học
  useEffect(() => {
    loadLessonChats(lesson.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id, currentUser?.email]);

  // Lọc tin nhắn của bài học hiện tại và user hiện tại
  const email = currentUser ? currentUser.email : 'guest';
  const lessonChats = chats.filter((c) => c.userEmail === email && c.lessonId === lesson.id);

  // Cuộn xuống đáy khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [lessonChats, isSending]);

  useEffect(() => {
    const emailStr = currentUser ? currentUser.email : 'guest';
    const cooldown = getRemainingCooldown(emailStr);
    const state = getCooldownState(emailStr);
    setRemainingCooldown(cooldown);
    setOffTopicStrikes(state.offTopicStrikeCount);

    let interval: ReturnType<typeof setInterval>;
    if (cooldown > 0) {
      interval = setInterval(() => {
        const cd = getRemainingCooldown(emailStr);
        setRemainingCooldown(cd);
        if (cd <= 0) {
          clearInterval(interval);
          setOffTopicStrikes(0);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentUser, chats, isSending]);

  const handleSend = async (textToSend?: string) => {
    if (systemSettings?.allowUserApiKey && !hasApiKey) {
      setApiKeyDialogOpen(true);
      return;
    }

    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const emailStr = currentUser ? currentUser.email : 'guest';
    const rateLimit = checkRateLimit(emailStr);
    
    if (!rateLimit.allowed) {
      if (rateLimit.reason === 'fast') {
        setErrorMsg(`Bạn đang hỏi quá nhanh. Vui lòng đợi thêm ${Math.ceil((rateLimit.waitMs || 0)/1000)} giây.`);
      } else {
        setErrorMsg(`Bạn đã hỏi tối đa 3 câu trong 1 phút. Vui lòng đợi thêm ${Math.ceil((rateLimit.waitMs || 0)/1000)} giây.`);
      }
      return;
    }

    recordMessageSent(emailStr);

    setInputMessage('');
    setIsSending(true);
    setErrorMsg(null);

    try {
      await addMessage(lesson.id, text);
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi kết nối với Gia sư AI.');
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

  // Tính số lượt dùng thử còn lại
  const guestLimitReached = !currentUser && guestChatCount >= 25;
  const guestRemainingCount = !currentUser ? Math.max(0, 25 - guestChatCount) : 0;

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
              setErrorMsg('Bạn đã dùng hết 25 lượt chat thử. Hãy đăng ký tài khoản để hỏi Gia sư câu này nhé!');
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
                Gia sư AI Hóa học 11
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
            ) : offTopicStrikes > 0 ? (
              <Chip 
                icon={<ShieldAlert size={14} color="var(--vang)" />} 
                label={`Cảnh báo lạc đề: ${offTopicStrikes}/5`} 
                color="warning" 
                size="small" 
                variant="outlined"
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

            {systemSettings?.allowUserApiKey && (
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => setApiKeyDialogOpen(true)}
                sx={{ minWidth: 0, p: 0.5, borderRadius: 0 }}
              >
                <Settings size={18} />
              </Button>
            )}
          </Box>
        </Box>

        {/* Api Key Dialog */}
        <ApiKeyDialog 
          open={apiKeyDialogOpen} 
          onClose={() => {
            setApiKeyDialogOpen(false);
            setHasApiKey(coKey());
          }} 
        />

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
                <strong>{guestRemainingCount}/25 câu hỏi</strong>.
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
          {systemSettings?.allowUserApiKey && !hasApiKey ? (
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
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'var(--nen-luc-nhat2)', color: 'var(--luc-tham)' }}>
                <Key size={32} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Mời cài đặt API Key
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mb: 1 }}>
                Hệ thống yêu cầu bạn tự cung cấp Gemini API Key để tiếp tục trò chuyện. API Key của bạn chỉ được lưu trên trình duyệt này.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Settings size={18} />}
                onClick={() => setApiKeyDialogOpen(true)}
                sx={{ borderRadius: 0, textTransform: 'none', boxShadow: 'none' }}
              >
                Cài đặt Key ngay
              </Button>
            </Box>
          ) : lessonChats.length === 0 ? (
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
                Trò chuyện với Gia sư AI của bài học này
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
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6, fontSize: '0.9rem' }}>
                        <RichText text={msg.content} linkColor={isAi ? 'var(--xanh)' : 'var(--chu-nguoc)'} />
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
                  Gia sư AI đang chuẩn bị gợi ý...
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
                : 'Hỏi Gia sư AI về phương pháp giải bài...'
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
