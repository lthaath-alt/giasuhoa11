import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Avatar,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Rating,
  Alert,
  Tooltip,
  Chip,
  TextField
} from '@mui/material';
import {
  Sparkles,
  BookOpen,
  Users,
  Award,
  HelpCircle,
  Info,
  ChevronDown,
  CheckCircle,
  MessageSquare,
  Phone,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  BookMarked
} from 'lucide-react';
import { useApp } from '../core/hooks/useApp';
import { Lesson } from '../features/lessons/types';
import { TutorChat } from '../features/tutor';
import { DashboardHeader } from '../features/lessons/components/DashboardHeader';
import { StudyProgressBar } from '../features/lessons/components/StudyProgressBar';
import { LessonSidebar } from '../features/lessons/components/LessonSidebar';
import { TextbookViewer } from '../features/lessons/components/TextbookViewer';
import { JoinClassForm } from '../features/auth/components/JoinClassForm';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    logout,
    getUserProgress,
    guestChatCount,
    addMessage,
    chats,
    curriculum,
    loadLessonChats,
  } = useApp();

  // Load lịch sử chat tư vấn toàn cục khi vào Dashboard
  useEffect(() => {
    loadLessonChats('global-advisor');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email]);

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<string>('hocmai');
  const [searchQuery, setSearchQuery] = useState<string>('');
  // 'sgk' = xem trang sách, 'chat' = hỏi gia sư AI
  const [studyMode, setStudyMode] = useState<'sgk' | 'chat'>('sgk');

  // iChat state riêng cho Chatbot tư vấn học tập
  const [ichatInput, setIchatInput] = useState('');
  const [isIchatSending, setIsIchatSending] = useState(false);
  const [ichatError, setIchatError] = useState<string | null>(null);
  const [isSgkCached, setIsSgkCached] = useState(false);

  // Kiểm tra trạng thái cache SGK HOA11.pdf từ localStorage
  useEffect(() => {
    const cached = localStorage.getItem('sgk_hoa11_cached') === 'true';
    setIsSgkCached(cached);
  }, [chats]);

  // Lấy tổng số bài học
  const allLessons = curriculum.flatMap((c) => c.lessons);

  // Tính toán tiến độ của học sinh hiện tại
  const progress = currentUser ? getUserProgress(currentUser.email) : null;
  const completedCount = progress ? progress.completedLessons.length : 0;
  const progressPercent =
    allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  // Lấy lịch sử iChat toàn cục (chúng ta dùng lessonId là 'global-advisor' cho cuộc chat tư vấn chung)
  const userEmail = currentUser ? currentUser.email : 'guest';
  const globalChats = chats.filter(c => c.userEmail === userEmail && c.lessonId === 'global-advisor');

  const handleSendGlobalIchat = async (textToSend?: string) => {
    const text = (textToSend || ichatInput).trim();
    if (!text) return;

    setIchatInput('');
    setIsIchatSending(true);
    setIchatError(null);

    try {
      await addMessage('global-advisor', text);
      // Kiểm tra lại trạng thái cache sau khi gửi
      setTimeout(() => {
        setIsSgkCached(localStorage.getItem('sgk_hoa11_cached') === 'true');
      }, 1000);
    } catch (err: any) {
      setIchatError(err.message || 'Có lỗi xảy ra khi trò chuyện với Gia sư AI.');
    } finally {
      setIsIchatSending(false);
    }
  };

  const handleKeyPressIchat = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendGlobalIchat();
    }
  };

  // Các câu hỏi gợi ý cho iChat tư vấn học tập
  const SUGGESTED_ICHAT_PROMPTS = [
    'Thầy ơi, hướng dẫn em cách tính pH của dung dịch Ba(OH)2 với ạ?',
    'Làm sao để làm bài tập hiệu suất tổng hợp Ammonia vậy thầy?',
    'Làm thế nào để xác định sản phẩm chính của phản ứng thế Alkane ạ?',
    'Phương pháp lập công thức phân tử hợp chất hữu cơ CxHyOz như thế nào ạ?',
  ];

  // Trạng thái dùng thử còn lại của iChat
  const guestLimitReached = !currentUser && guestChatCount >= 25;
  const guestRemainingCount = !currentUser ? Math.max(0, 25 - guestChatCount) : 0;

  return (
    <Box
      id="dashboard-layout"
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 1. APP BAR & NAVIGATION MENU STYLE HOCMAI */}
      <DashboardHeader
        currentUser={currentUser}
        logout={logout}
        guestChatCount={guestChatCount}
        onLogoClick={() => {
          setSelectedLesson(null);
          setActiveTab('hocmai');
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectLesson={(lesson) => {
          setSelectedLesson(lesson);
          setActiveTab('hocmai');
        }}
      />

      {/* 2. TIẾN ĐỘ HỌC TẬP (CHỈ HIỂN THỊ CHO HỌC SINH ĐĂNG NHẬP) */}
      {currentUser && currentUser.role === 'student' && activeTab === 'hocmai' && (
        <StudyProgressBar
          progressPercent={progressPercent}
          completedCount={completedCount}
          totalLessonsCount={allLessons.length}
        />
      )}

      {/* 2b. BANNER THAM GIA LỚP (chỉ hiển khi học sinh tự do hoặc chưa có lớp) */}
      {currentUser &&
        (currentUser.role === 'free_user' ||
          (currentUser.role === 'student' && !currentUser.classId && !currentUser.joinedClassId)
        ) &&
        activeTab === 'hocmai' && (
        <JoinClassForm
          onJoined={(_className) => {
            // State sẽ tự động refresh qua setCurrentUser trong joinClassByCode()
          }}
        />
      )}

      {/* 3. KHU VỰC NỘI DUNG CHÍNH THAY ĐỔI DỰA TRÊN TAB ĐANG CHỌN */}
      <Box sx={{ flex: 1, py: 4 }}>
        <Container maxWidth="xl">
          
          {/* ================= TAB 1: CÁC KHÓA HỌC (HỌC MÃI LAYOUT CHÍNH) ================= */}
          {activeTab === 'hocmai' && (
            <Box id="tab-content-courses">
              {selectedLesson ? (
                /* NẾU ĐÃ CHỌN BÀI HỌC CỤ THỂ -> RENDER WORKSPACE SGK + CHAT */
                <Box id="active-study-workspace">
                  {/* Thanh điều hướng workspace */}
                  <Paper
                    sx={{
                      p: 2,
                      mb: 3,
                      borderRadius: 3,
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      justifyContent: 'space-between',
                      gap: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    }}
                  >
                    <Box>
                      <Typography variant="caption" sx={{ color: '#ea580c', fontWeight: 'bold', display: 'block', mb: 0.3 }}>
                        CHƯƠNG TRÌNH TỰ HỌC HÓA HỌC 11 THÔNG MINH
                      </Typography>
                      <Typography variant="h6" color="text.primary" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                        {selectedLesson.title}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* Tab chuyển đổi chế độ học */}
                      <Box
                        sx={{
                          display: 'flex',
                          bgcolor: '#f1f5f9',
                          borderRadius: 2.5,
                          p: 0.5,
                          gap: 0.5,
                        }}
                      >
                        <Button
                          id="tab-sgk-btn"
                          size="small"
                          variant={studyMode === 'sgk' ? 'contained' : 'text'}
                          startIcon={<BookOpen size={15} />}
                          onClick={() => setStudyMode('sgk')}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            borderRadius: 2,
                            fontSize: '0.82rem',
                            px: 1.5,
                            ...(studyMode === 'sgk'
                              ? { bgcolor: '#0369a1', color: '#fff', boxShadow: '0 2px 8px rgba(3,105,161,0.3)', '&:hover': { bgcolor: '#0284c7' } }
                              : { color: '#64748b', '&:hover': { bgcolor: '#e2e8f0', color: '#0369a1' } }
                            ),
                          }}
                        >
                          Xem SGK
                        </Button>
                        <Button
                          id="tab-chat-btn"
                          size="small"
                          variant={studyMode === 'chat' ? 'contained' : 'text'}
                          startIcon={<MessageSquare size={15} />}
                          onClick={() => setStudyMode('chat')}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            borderRadius: 2,
                            fontSize: '0.82rem',
                            px: 1.5,
                            ...(studyMode === 'chat'
                              ? { bgcolor: '#ea580c', color: '#fff', boxShadow: '0 2px 8px rgba(234,88,12,0.3)', '&:hover': { bgcolor: '#dc2626' } }
                              : { color: '#64748b', '&:hover': { bgcolor: '#e2e8f0', color: '#ea580c' } }
                            ),
                          }}
                        >
                          Hỏi AI
                        </Button>
                      </Box>
                      <Button
                        id="close-workspace-btn"
                        variant="outlined"
                        size="small"
                        startIcon={<ArrowRight size={15} />}
                        onClick={() => { setSelectedLesson(null); setStudyMode('sgk'); }}
                        sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 2, fontSize: '0.82rem', borderColor: '#cbd5e1', color: '#64748b', '&:hover': { borderColor: '#ea580c', color: '#ea580c', bgcolor: '#fff7ed' } }}
                      >
                        Quay lại
                      </Button>
                    </Box>
                  </Paper>

                  {/* Layout 2 cột: Sidebar | Nội dung chính */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '260px 1fr' },
                      gap: 3,
                      alignItems: 'start',
                    }}
                  >
                    {/* Cột trái: Sidebar danh mục bài */}
                    <LessonSidebar
                      selectedLesson={selectedLesson}
                      setSelectedLesson={(lesson) => { setSelectedLesson(lesson); setStudyMode('sgk'); }}
                      currentUser={currentUser}
                      getUserProgress={getUserProgress}
                    />

                    {/* Cột phải: Nội dung SGK hoặc Chat AI */}
                    <Box>
                      {studyMode === 'sgk' ? (
                        <TextbookViewer
                          lesson={selectedLesson}
                          onOpenChat={() => setStudyMode('chat')}
                        />
                      ) : (
                        <TutorChat lesson={selectedLesson} />
                      )}
                    </Box>
                  </Box>
                </Box>
              ) : (
                /* NẾU CHƯA CHỌN BÀI HỌC -> RENDER TRANG CHỦ QUẢNG BÁ CHUẨN HOCMAI.VN */
                <Box id="hocmai-homepage-content">
                  
                  {/* QUẢNG CÁO ĐẶC BIỆT CHẠY CHỮ TRÊN CÙNG */}
                  <Paper
                    sx={{
                      p: 1.5,
                      mb: 3,
                      bgcolor: '#fff7ed',
                      border: '1px solid #ffedd5',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ px: 1.5, py: 0.3, bgcolor: '#ea580c', color: '#ffffff', borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 'bold' }}>
                      BÙNG NỔ
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ea580c' }}>
                      🔥 HỆ THỐNG CHÍNH THỨC MỞ ĐĂNG KÝ KHÓA HỌC XUẤT PHÁT SỚM - GIẢM NGAY 30% HỌC PHÍ {'>>'}{' '}
                      <span 
                        style={{ textDecoration: 'underline', cursor: 'pointer' }}
                        onClick={() => navigate('/login')}
                      >
                        Đăng ký ngay hôm nay!
                      </span>
                    </Typography>
                  </Paper>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1.2fr 3.8fr' },
                      gap: 3,
                    }}
                  >
                    {/* CỘT TRÁI (25%): DANH MỤC BÀI HỌC CHƯƠNG TRÌNH HÓA 11 */}
                    <LessonSidebar
                      selectedLesson={selectedLesson}
                      setSelectedLesson={setSelectedLesson}
                      currentUser={currentUser}
                      getUserProgress={getUserProgress}
                    />

                    {/* CỘT GIỮA & PHẢI (75%): BANNER QUẢNG BÁ & LỢI ÍCH HỌC TẬP */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      
                      {/* KHU VỰC BENTO GRID BANNER QUẢNG CÁO (GIỐNG CHÍNH GIỮA TRANG HOCMAI) */}
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
                          gap: 2,
                        }}
                      >
                        {/* Banner lớn chính giữa */}
                        <Paper
                          sx={{
                            p: { xs: 4, md: 6 },
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #0056a3 0%, #007bf2 100%)',
                            color: '#ffffff',
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: 320,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            boxShadow: '0 8px 30px rgba(0, 98, 184, 0.15)',
                            border: 'none',
                          }}
                        >
                          {/* Phông nền trang trí trừu tượng */}
                          <Box
                            sx={{
                              position: 'absolute',
                              right: -40,
                              top: -40,
                              width: 220,
                              height: 220,
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.08)',
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              right: 60,
                              bottom: -60,
                              width: 180,
                              height: 180,
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.05)',
                            }}
                          />

                          <Typography
                            variant="caption"
                            sx={{
                              color: '#ffea00',
                              fontWeight: 800,
                              letterSpacing: '1px',
                              textTransform: 'uppercase',
                              display: 'block',
                              mb: 1.5,
                            }}
                          >
                            GIA SƯ HÓA HỌC 11 AI
                          </Typography>
                          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)', fontSize: { xs: '2rem', md: '2.5rem' } }}>
                            2K12 XUẤT PHÁT SỚM
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: '#ffeb3b', mb: 2, fontSize: { xs: '1.5rem', md: '1.8rem' } }}>
                            ÔN THI THPT & ĐỖ ĐẠI HỌC TOP
                          </Typography>
                          <Typography variant="body1" sx={{ maxW: 520, mb: 3, opacity: 0.9, lineHeight: 1.6 }}>
                            Học tập cá nhân hóa vượt trội cùng Trợ lý Gia sư AI thông minh Hóa 11 bám sát sách giáo khoa mới. Hướng dẫn tư duy từng bước giúp học sinh tăng tốc phản xạ giải đề thi!
                          </Typography>

                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                              variant="contained"
                              onClick={() => {
                                // Tự chọn bài học đầu tiên để học viên trải nghiệm luôn
                                if (allLessons.length > 0) setSelectedLesson(allLessons[0]);
                              }}
                              sx={{
                                backgroundColor: '#ff9900',
                                color: '#ffffff',
                                px: 3,
                                py: 1.2,
                                fontWeight: 'bold',
                                borderRadius: 20,
                                '&:hover': { backgroundColor: '#e28800' },
                              }}
                            >
                              Vào Học Thử Ngay
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={() => navigate('/login')}
                              sx={{
                                borderColor: '#ffffff',
                                color: '#ffffff',
                                px: 3,
                                py: 1.2,
                                fontWeight: 'bold',
                                borderRadius: 20,
                                '&:hover': { borderColor: '#f1f5f9', backgroundColor: 'rgba(255,255,255,0.1)' },
                              }}
                            >
                              Đăng Ký Lộ Trình 1-1
                            </Button>
                          </Box>
                        </Paper>

                        {/* Banner phụ bên phải */}
                        <Card
                          sx={{
                            height: '100%',
                            background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
                            border: '1px solid #ffedd5',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            p: 3,
                            borderRadius: 4,
                            boxShadow: '0 4px 20px rgba(234, 88, 12, 0.05)',
                          }}
                        >
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="caption" sx={{ color: '#ea580c', fontWeight: 'bold', px: 1.5, py: 0.3, bgcolor: 'rgba(234,88,12,0.1)', borderRadius: 2 }}>
                                ƯU ĐÃI ĐẶC BIỆT
                              </Typography>
                              <Typography variant="h6" sx={{ color: '#ea580c', fontWeight: 900 }}>
                                GIẢM 42%
                              </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a', mb: 1 }}>
                              Giải Pháp Toàn Diện TOPUNI 2027
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Kích hoạt chiến lược tự ôn thi thông minh cùng kho 500+ đề thi chuẩn cấu trúc đánh giá năng lực ĐHQG, kì thi tốt nghiệp THPT mới nhất!
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Divider sx={{ my: 1.5 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <CheckCircle size={14} color="#0f766e" />
                              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Hỗ trợ gia sư AI 24/7 tận tình</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <CheckCircle size={14} color="#0f766e" />
                              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Học thử đầy đủ 6 chương Hóa 11</Typography>
                            </Box>
                            <Button
                              fullWidth
                              variant="contained"
                              color="warning"
                              onClick={() => navigate('/login')}
                              sx={{ borderRadius: 2, fontWeight: 'bold' }}
                            >
                              ĐĂNG KÝ HỌC NGAY
                            </Button>
                          </Box>
                        </Card>
                      </Box>

                      {/* STATISTICAL BLUE BANNER (DẢI SỐ LIỆU CHUẨN HOCMAI TRONG HÌNH) */}
                      <Paper
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          backgroundColor: '#0062b8',
                          color: '#ffffff',
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' },
                          gap: 3,
                          textAlign: 'center',
                          boxShadow: '0 4px 15px rgba(0, 98, 184, 0.1)',
                          border: 'none',
                        }}
                      >
                        <Box sx={{ borderRight: { sm: '1px solid rgba(255,255,255,0.15)' }, px: 1 }}>
                          <Typography variant="h4" sx={{ fontWeight: 900, color: '#ffea00' }}>15 năm</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 'medium' }}>Kinh nghiệm giáo dục trực tuyến</Typography>
                        </Box>
                        <Box sx={{ borderRight: { sm: '1px solid rgba(255,255,255,0.15)' }, px: 1 }}>
                          <Typography variant="h4" sx={{ fontWeight: 900, color: '#ffea00' }}>150.000+</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 'medium' }}>Học sinh tin tưởng sử dụng</Typography>
                        </Box>
                        <Box sx={{ borderRight: { sm: '1px solid rgba(255,255,255,0.15)' }, px: 1 }}>
                          <Typography variant="h4" sx={{ fontWeight: 900, color: '#ffea00' }}>6 Chương</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 'medium' }}>Bám sát SGK Hóa học 11 mới</Typography>
                        </Box>
                        <Box sx={{ px: 1 }}>
                          <Typography variant="h4" sx={{ fontWeight: 900, color: '#ffea00' }}>500+ Đề</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 'medium' }}>Kiểm tra & Câu hỏi tự luyện mẫu</Typography>
                        </Box>
                      </Paper>

                      {/* LỢI ÍCH CỦA NỀN TẢNG MANG LẠI */}
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center', color: '#0f172a' }}>
                          Lợi Ích Đột Phá Khi Tự Học Hóa Học 11 Tại Hệ Thống Gia Sư AI
                        </Typography>
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                            gap: 3,
                          }}
                        >
                          <Card sx={{ p: 2, height: '100%', borderRadius: 3 }}>
                            <Box sx={{ p: 1, bgcolor: 'rgba(234, 88, 12, 0.08)', color: '#ea580c', borderRadius: 2, width: 'fit-content', mb: 2 }}>
                              <Sparkles size={24} />
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                              Gia sư tận tâm xưng "Thầy"
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              AI đóng vai một người thầy ân cần, kiên nhẫn, luôn động viên và giảng giải chi tiết cho em học sinh bất cứ lúc nào 24/7.
                            </Typography>
                          </Card>

                          <Card sx={{ p: 2, height: '100%', borderRadius: 3 }}>
                            <Box sx={{ p: 1, bgcolor: 'rgba(15, 118, 110, 0.08)', color: '#0f766e', borderRadius: 2, width: 'fit-content', mb: 2 }}>
                              <Zap size={24} />
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                              Định hướng, không giải hộ
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Khác biệt vượt trội: Gia sư chỉ gợi mở kiến thức và hướng dẫn từng bước tư duy. Giúp em tự tay làm ra bài tập để nhớ sâu và hiểu gốc rễ.
                            </Typography>
                          </Card>

                          <Card sx={{ p: 2, height: '100%', borderRadius: 3 }}>
                            <Box sx={{ p: 1, bgcolor: 'rgba(0, 98, 184, 0.08)', color: '#0062b8', borderRadius: 2, width: 'fit-content', mb: 2 }}>
                              <BookMarked size={24} />
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                              Tích hợp SGK HOA11.pdf
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Hệ thống tự động liên kết nguồn kiến thức chính thống, hỗ trợ tham chiếu kiến thức liên môn, bài tập thực tiễn chuẩn xác.
                            </Typography>
                          </Card>
                        </Box>
                      </Box>

                      {/* QUẢNG CÁO NGƯỜI DÙNG & ĐÁNH GIÁ (USER TESTIMONIALS) */}
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center', color: '#0f172a' }}>
                          Ý Kiến Học Viên & Phụ Huynh Tin Tưởng Sử Dụng
                        </Typography>
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                            gap: 2,
                          }}
                        >
                          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Avatar sx={{ bgcolor: '#0f766e', color: '#ffffff', fontWeight: 'bold' }}>LA</Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Trần Lan Anh</Typography>
                                <Typography variant="caption" color="text.secondary">Học sinh lớp 11A1 THPT Chu Văn An</Typography>
                              </Box>
                              <Box sx={{ ml: 'auto' }}>
                                <Rating value={5} readOnly size="small" />
                              </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              "Gia sư AI của hệ thống rất đặc biệt! Thầy xưng là thầy và gọi em rất ấm áp. Khi em bí bài tập tính pH, thầy không cho ngay kết quả mà chỉ ra cho em bản chất điện li là gì, rồi hỏi em tính nồng độ OH- thế nào. Nhờ thầy gợi ý từng bước mà em tự làm được bài và hiểu bài cực kì sâu sắc."
                            </Typography>
                          </Paper>

                          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Avatar sx={{ bgcolor: '#ea580c', color: '#ffffff', fontWeight: 'bold' }}>MĐ</Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Nguyễn Minh Đức</Typography>
                                <Typography variant="caption" color="text.secondary">Học sinh lớp 11 Lý THPT Chuyên Hà Nội-Amsterdam</Typography>
                              </Box>
                              <Box sx={{ ml: 'auto' }}>
                                <Rating value={5} readOnly size="small" />
                              </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              "Em từng học qua nhiều chatbot nhưng chỉ có gia sư AI ở đây là kiên nhẫn nhất. Thầy hướng dẫn từng bước, gỡ rối lý thuyết trơ của khí Nitrogen hay quy luật nhiệt phân muối Nitrate rất dễ hiểu. Điểm thi giữa kì Hóa của em đạt 9.5 nhờ tự luyện cùng thầy hàng ngày!"
                            </Typography>
                          </Paper>
                        </Box>
                      </Box>

                      {/* FOOTER QUẢNG CÁO GHI DANH */}
                      <Paper
                        sx={{
                          p: 4,
                          borderRadius: 4,
                          background: 'radial-gradient(circle, #fff7ed 0%, #ffedd5 100%)',
                          border: '1px solid #fed7aa',
                          textAlign: 'center',
                          boxShadow: '0 4px 20px rgba(234, 88, 12, 0.04)',
                        }}
                      >
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#c2410c', mb: 1 }}>
                          Em Đã Sẵn Sàng Trở Thành Thủ Khoa Hóa Học Tiếp Theo?
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxW: 600, mx: 'auto', mb: 3 }}>
                          Hãy tạo ngay một tài khoản học sinh miễn phí để được lưu trữ tiến trình tự học, lưu lại lịch sử chat với Thầy Gia sư và nhận thêm nhiều đề thi tự luyện độc quyền!
                        </Typography>
                        <Button
                          variant="contained"
                          color="warning"
                          size="large"
                          onClick={() => navigate('/login')}
                          sx={{ px: 4, py: 1.5, borderRadius: 20, fontWeight: 'bold', fontSize: '1rem' }}
                        >
                          ĐĂNG KÝ HỌC THỬ MIỄN PHÍ NGAY
                        </Button>
                      </Paper>

                    </Box>
                  </Box>

                </Box>
              )}
            </Box>
          )}

          {/* ================= TAB 2: GIỚI THIỆU ================= */}
          {activeTab === 'gioithieu' && (
            <Box id="tab-content-about" sx={{ maxWidth: 900, mx: 'auto' }}>
              <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Avatar sx={{ bgcolor: '#0062b8', color: '#ffffff', width: 56, height: 56 }}>
                    <Info size={32} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0062b8' }}>Giới thiệu về Gia Sư Hóa Học 11 AI</Typography>
                    <Typography variant="subtitle2" color="text.secondary">Nền tảng tự học đột phá kết hợp Trí tuệ nhân tạo thế hệ mới</Typography>
                  </Box>
                </Box>

                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#334155' }}>
                  Chào mừng các em học sinh đến với **Gia Sư Hóa Học 11 AI**! Đây là dự án học tập thông minh tiên phong tại Việt Nam, mang đến giải pháp hỗ trợ tự học Hóa học lớp 11 vượt trội theo chương trình phổ thông mới. 
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, color: '#334155' }}>
                  Với mong muốn giúp mọi học sinh đều có thể tự tin làm chủ môn Hóa mà không cần đi học thêm tốn kém, chúng tôi đã tích hợp công nghệ trí tuệ nhân tạo (AI) thông minh để tạo ra một **Người Thầy Gia Sư Đồng Hành 24/7**. Gia sư AI không làm thay bài tập cho học sinh, mà đóng vai trò người hướng dẫn tận tình, khơi gợi suy nghĩ và dìu dắt các em giải quyết bài tập qua từng bước tư duy.
                </Typography>

                {/* THÔNG SỐ ĐÁNG TIN CẬY */}
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#0f172a' }}>Thông số hoạt động & Sự tin cậy</Typography>
                
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                    gap: 3,
                    mb: 5,
                  }}
                >
                  <Card sx={{ textAlign: 'center', p: 2.5, height: '100%', bgcolor: '#f8fafc' }}>
                    <Users size={32} color="#0062b8" style={{ margin: '0 auto 8px' }} />
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#0062b8' }}>150.000+</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Học sinh tin tưởng sử dụng tự học hàng ngày</Typography>
                  </Card>

                  <Card sx={{ textAlign: 'center', p: 2.5, height: '100%', bgcolor: '#f8fafc' }}>
                    <BookOpen size={32} color="#ea580c" style={{ margin: '0 auto 8px' }} />
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#ea580c' }}>6 Chương</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Khóa học bám sát toàn diện cấu trúc sách giáo khoa</Typography>
                  </Card>

                  <Card sx={{ textAlign: 'center', p: 2.5, height: '100%', bgcolor: '#f8fafc' }}>
                    <Award size={32} color="#0f766e" style={{ margin: '0 auto 8px' }} />
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f766e' }}>500+</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Đề kiểm tra định kỳ và bài tập mẫu tự luyện</Typography>
                  </Card>

                  <Card sx={{ textAlign: 'center', p: 2.5, height: '100%', bgcolor: '#f8fafc' }}>
                    <Sparkles size={32} color="#ff9900" style={{ margin: '0 auto 8px' }} />
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#ff9900' }}>2.000+</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Câu hỏi thảo luận & giải đáp hóa học thông minh</Typography>
                  </Card>
                </Box>

                {/* TRIẾT LÝ GIẢNG DẠY */}
                <Box sx={{ p: 3.5, bgcolor: '#eff6ff', borderRadius: 3, border: '1px solid #bfdbfe', mb: 4 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1e40af', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShieldCheck size={20} /> Triết lý giảng dạy của Gia sư AI
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.7, color: '#1e3a8a' }}>
                    **"Cho con cá không bằng cho cần câu"** – Gia sư AI của chúng tôi được thiết kế theo chuẩn sư phạm nghiêm ngặt. Khi học sinh gõ một câu hỏi hoặc bài tập, thầy sẽ không bao giờ đưa thẳng đáp số cuối cùng để học sinh chép. Thay vào đó, thầy sẽ phân tích đề, gợi ý lý thuyết nền tảng và dẫn dắt học sinh đặt bút tính toán từng bước. Điều này giúp học sinh phát triển tư duy logic tự chủ, tự mình tìm ra đáp số để nhớ kiến thức bền vững nhất!
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setActiveTab('hocmai')}
                  startIcon={<BookOpen size={16} />}
                  sx={{ borderRadius: 2, fontWeight: 'bold' }}
                >
                  Bắt đầu học ngay hôm nay
                </Button>
              </Paper>
            </Box>
          )}

          {/* ================= TAB 3: HỎI ĐÁP VỚI AI (CHATBOT TRỢ GIẢNG RIÊNG) ================= */}
          {activeTab === 'ichat' && (
            <Box id="tab-content-ichat">
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 2.3fr' },
                  gap: 3,
                }}
              >
                
                {/* PANEL TRÁI (30%): GIỚI THIỆU & GỢI Ý ĐỀ TÀI */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0062b8', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Sparkles size={20} color="#ea580c" /> Thầy Hùng Trợ Giảng AI
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                      Thầy là Trợ lý học tập cá nhân của em. Thầy sẵn sàng giải đáp mọi thắc mắc lý thuyết liên quan đến **Hóa học lớp 11**!
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                      Thầy chỉ dẫn từng bước khơi gợi tư duy giúp em tự học tốt nhất, không làm bài tập hộ đâu nhé!
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />

                    {/* Trạng thái Cache SGK HOA11.pdf */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                      <Box sx={{ position: 'relative', display: 'flex' }}>
                        <Box sx={{ width: 10, height: 10, bgcolor: isSgkCached ? '#0f766e' : '#f59e0b', borderRadius: '50%' }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                          Tài liệu: SGK HOA11.pdf
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', display: 'block' }}>
                          Trạng thái bộ đệm: {isSgkCached ? (
                            <span style={{ color: '#0f766e', fontWeight: 'bold' }}>Đã lưu trong trình duyệt ⚡</span>
                          ) : (
                            <span style={{ color: '#ea580c' }}>Sẽ nạp tự động khi bắt đầu hỏi</span>
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>

                  {/* Câu hỏi gợi ý nhanh */}
                  <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Các chủ đề gợi ý em có thể hỏi Thầy:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {SUGGESTED_ICHAT_PROMPTS.map((prompt, idx) => (
                        <Paper
                          key={idx}
                          onClick={() => {
                            if (!guestLimitReached) {
                              setIchatInput(prompt);
                            } else {
                              setIchatError('Em đã hết lượt chat thử. Đăng ký tài khoản học sinh ngay để nhắn tiếp nhé!');
                            }
                          }}
                          sx={{
                            p: 1.5,
                            cursor: 'pointer',
                            borderRadius: 2,
                            border: '1px solid #e2e8f0',
                            bgcolor: '#ffffff',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: '#ea580c',
                              bgcolor: 'rgba(234, 88, 12, 0.04)',
                            },
                          }}
                        >
                          {prompt}
                        </Paper>
                      ))}
                    </Box>
                  </Card>
                </Box>

                {/* PANEL PHẢI (70%): KHUNG CHAT RIÊNG BIỆT */}
                <Paper
                  sx={{
                    height: 'calc(100vh - 240px)',
                    minHeight: 520,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {/* Header Khung Chat */}
                  <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#0062b8', color: '#ffffff', width: 44, height: 44, boxShadow: '0 2px 6px rgba(0,98,184,0.15)' }}>
                      <Sparkles size={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        Thầy Hùng - Gia Sư Tư Vấn 24/7
                        <Chip label="ONLINE" size="small" color="secondary" sx={{ height: 16, fontSize: '0.65rem', fontWeight: 'bold' }} />
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Gia sư tận tình • Hướng dẫn giải bài tập từng bước • Giải đáp Hóa 11
                      </Typography>
                    </Box>
                  </Box>

                  {/* Lượt dùng thử */}
                  {!currentUser && (
                    <Alert severity={guestRemainingCount === 0 ? 'error' : 'warning'} sx={{ borderRadius: 0, py: 0.5, px: 2, '.MuiAlert-message': { fontSize: '0.8rem' } }}>
                      {guestRemainingCount === 0 ? (
                        <strong>Em đã dùng hết 25 lượt hỏi thử miễn phí.</strong>
                      ) : (
                        <span>Em đang dùng bản dùng thử. Còn lại: <strong>{guestRemainingCount}/25 lượt hỏi</strong>.</span>
                      )}
                      {' Đăng ký tài khoản học sinh để hỏi Thầy không giới hạn!'}
                    </Alert>
                  )}

                  {/* Vùng Tin Nhắn */}
                  <Box sx={{ flex: 1, p: 3, overflowY: 'auto', bgcolor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {globalChats.length === 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: 2, p: 4 }}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(0,98,184,0.08)', color: '#0062b8' }}>
                          <MessageSquare size={32} />
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Bắt đầu buổi tư vấn riêng cùng Thầy!</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxW: 420 }}>
                          Em có thắc mắc gì về lý thuyết Hóa học 11, cách cân bằng phương trình, quy tắc Le Chatelier hay các chủ đề tự luận? Nhắn ngay cho thầy dưới đây nhé!
                        </Typography>
                      </Box>
                    ) : (
                      globalChats.map((msg) => {
                        const isAi = msg.sender === 'ai';
                        return (
                          <Box
                            key={msg.id}
                            sx={{
                              display: 'flex',
                              gap: 1.5,
                              alignSelf: isAi ? 'flex-start' : 'flex-end',
                              maxWidth: '85%',
                            }}
                          >
                            {isAi && (
                              <Avatar sx={{ bgcolor: 'rgba(0,98,184,0.08)', color: '#0062b8', width: 32, height: 32 }}>
                                <Sparkles size={16} />
                              </Avatar>
                            )}
                            <Box>
                              <Paper
                                sx={{
                                  p: 2,
                                  borderRadius: isAi ? '0 16px 16px 16px' : '16px 0 16px 16px',
                                  backgroundColor: isAi ? '#f1f5f9' : '#0062b8',
                                  color: isAi ? 'text.primary' : '#ffffff',
                                  boxShadow: 'none',
                                  border: isAi ? '1px solid #e2e8f0' : 'none',
                                }}
                              >
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6, fontSize: '0.9rem' }}>
                                  {msg.content}
                                </Typography>
                              </Paper>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: isAi ? 'left' : 'right' }}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })
                    )}

                    {isIchatSending && (
                      <Box sx={{ display: 'flex', gap: 1.5, alignSelf: 'flex-start' }}>
                        <Avatar sx={{ bgcolor: 'rgba(0,98,184,0.08)', color: '#0062b8', width: 32, height: 32 }}>
                          <Sparkles size={16} />
                        </Avatar>
                        <Paper sx={{ p: 1.5, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0 16px 16px 16px', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <RefreshCw size={14} className="animate-spin" />
                          <Typography variant="caption" color="text.secondary">Thầy đang viết câu trả lời...</Typography>
                        </Paper>
                      </Box>
                    )}
                  </Box>

                  {ichatError && (
                    <Alert severity="error" onClose={() => setIchatError(null)} sx={{ borderRadius: 0 }}>
                      {ichatError}
                    </Alert>
                  )}

                  {/* Vùng Nhập */}
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 1.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={guestLimitReached ? 'Đã hết lượt chat thử miễn phí!' : 'Nhắn tin hỏi thầy (Ví dụ: Thầy hướng dẫn em bài tập tính pH)...'}
                      value={ichatInput}
                      onChange={(e) => setIchatInput(e.target.value)}
                      onKeyDown={handleKeyPressIchat}
                      disabled={guestLimitReached || isIchatSending}
                      sx={{ bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                    <Button
                      variant="contained"
                      onClick={() => handleSendGlobalIchat()}
                      disabled={guestLimitReached || isIchatSending || !ichatInput.trim()}
                      sx={{ borderRadius: 3, px: 3, fontWeight: 'bold' }}
                    >
                      Gửi Thầy
                    </Button>
                  </Box>
                </Paper>

              </Box>
            </Box>
          )}

          {/* ================= TAB 4: HỖ TRỢ (GIẢI ĐÁP CÁC THẮC MẮC) ================= */}
          {activeTab === 'hotro' && (
            <Box id="tab-content-support" sx={{ maxWidth: 850, mx: 'auto' }}>
              <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Avatar sx={{ bgcolor: '#ea580c', color: '#ffffff', width: 56, height: 56 }}>
                    <HelpCircle size={32} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0f172a' }}>Trung tâm hỗ trợ học viên</Typography>
                    <Typography variant="subtitle2" color="text.secondary">Giải đáp các thắc mắc thường gặp về cách thức vận hành của Hệ Thống AI</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Câu 1 */}
                  <Accordion sx={{ borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0062b8' }}>
                        1. Làm thế nào để đăng ký và đăng nhập tài khoản học viên?
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        Rất đơn giản! Em hãy nhìn lên góc trên bên phải màn hình và nhấn vào nút <strong>Đăng Ký</strong> (màu cam). Hãy nhập họ tên, địa chỉ email và mật khẩu của em để gửi yêu cầu phê duyệt tài khoản tới Admin. Sau khi đăng ký xong, tài khoản sẽ chuyển sang trạng thái <em>Chờ duyệt</em>. Admin (Giáo viên bộ môn) sẽ phê duyệt kích hoạt tài khoản của em trong vòng 5-10 phút. 
                        Sau khi được kích hoạt, em có thể sử dụng nút <strong>Đăng Nhập</strong> để bắt đầu học tập và lưu trữ lịch sử học tập.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>

                  {/* Câu 2 */}
                  <Accordion sx={{ borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0062b8' }}>
                        2. Sử dụng học tập trên website này có mất chi phí nào không?
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        Hệ thống tự học Gia sư Hóa Học 11 AI được cung cấp <strong>hoàn toàn miễn phí 100%</strong> dành cho học sinh THPT có tinh thần tự học. 
                        <br /><br />
                        Đối với <strong>khách dùng thử (chưa đăng nhập)</strong>, hệ thống hỗ trợ dùng thử tối đa <strong>25 câu hỏi</strong> thảo luận với Gia sư AI. Để học tập hoàn toàn không giới hạn và lưu giữ toàn bộ tiến độ, các em chỉ cần đăng ký cho mình một tài khoản học sinh.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>

                  {/* Câu 3 */}
                  <Accordion sx={{ borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0062b8' }}>
                        3. Gia sư AI hỗ trợ em học tập cụ thể như thế nào?
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        Gia sư AI đóng vai trò như một giáo viên thực thụ đồng hành cùng em 24/7.
                        <br />
                        - Khi em học lý thuyết, Gia sư tóm tắt các điểm then chốt nhất giúp em dễ nhớ dễ hiểu.
                        <br />
                        - Khi em làm bài tập, Gia sư <strong>chỉ gợi mở phương pháp và dẫn dắt em tư duy qua từng bước</strong>, chứ thầy sẽ không giải hộ trực tiếp bài tập hay đưa ra đáp số ngay. Thầy muốn em tự động não và làm được bài tập để hình thành tư duy chủ động xuất sắc!
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </Box>

                <Box sx={{ mt: 5, p: 3, bgcolor: '#fff7ed', borderRadius: 3, border: '1px solid #ffedd5', textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#ea580c', mb: 1 }}>
                    Học viên vẫn còn thắc mắc khác cần hỗ trợ nhanh?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Hãy liên hệ trực tiếp với đội ngũ tư vấn viên qua số Zalo hỗ trợ kỹ thuật miễn phí dưới đây:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button variant="contained" color="primary" startIcon={<MessageSquare size={14} />} onClick={() => window.open('https://zalo.me', '_blank')} sx={{ borderRadius: 2 }}>
                      Zalo Hỗ Trợ: 0345203054
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Box>
          )}

        </Container>
      </Box>
    </Box>
  );
};

export default DashboardPage;
