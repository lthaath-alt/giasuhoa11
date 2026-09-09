import React, { useState, useEffect } from 'react';
import { LINK_ZALO } from '../core/constants';
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
import { StudentArea } from '../features/student/components/StudentArea';
import { GameHubSection } from '../features/games/GameHubSection';
import { SlidesSection } from '../features/lessons/components/SlidesSection';
import { ActivityFields, type Truong } from '../features/lessons/components/ActivityFields';
import {
  ChemDoodles, GameDoodles, GameDoodlesTren, GameDoodlesDuoi,
  MascotToanThan, MascotDauVai,
} from '../features/mascot';
import { RichText } from '../core/components/RichText';
import { ApiKeyDialog } from '../features/tutor/components/ApiKeyDialog';
import { getEffectiveApiKey } from '../features/tutor/services/geminiTutorService';

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
  // Tab mặc định khi vào web: Giới thiệu, để khách mới đọc trước khi vào học.
  // Đổi sang 'baigiang' nếu muốn mở thẳng vào lưới bài giảng.
  const [activeTab, setActiveTab] = useState<string>('gioithieu');
  const [searchQuery, setSearchQuery] = useState<string>('');
  // 'sgk' = xem trang sách, 'chat' = hỏi gia sư AI
  const [studyMode, setStudyMode] = useState<'sgk' | 'chat'>('sgk');

  // iChat state riêng cho Chatbot tư vấn học tập
  const [ichatInput, setIchatInput] = useState('');
  const [isIchatSending, setIsIchatSending] = useState(false);
  const [ichatError, setIchatError] = useState<string | null>(null);

  /* Tab iChat trước đây KHÔNG có lối nhập API key nào. Chưa có key thì
     geminiTutorService âm thầm rơi sang kịch bản mẫu, học sinh tưởng đang nói
     chuyện với AI. TutorChat trong bài học đã chặn đúng cách; iChat thì chưa. */
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  /* Hỏi getEffectiveApiKey chứ KHÔNG đọc thẳng localStorage: key có thể đến từ
     biến môi trường VITE_GEMINI_API_KEY. Đọc mỗi localStorage sẽ chặn nhầm
     người dùng dù app thừa sức gọi Gemini. */
  const coKey = () => getEffectiveApiKey() !== 'MISSING_API_KEY' && !!getEffectiveApiKey();
  const [hasApiKey, setHasApiKey] = useState(coKey);

  // Lấy tổng số bài học
  const allLessons = curriculum.flatMap((c) => c.lessons);

  // Tính toán tiến độ của học sinh hiện tại
  const progress = currentUser ? getUserProgress(currentUser.email) : null;
  const completedCount = progress ? progress.completedLessons.length : 0;
  const progressPercent =
    allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  /* Bon viec lam duoc, dung theo FIRST VIEWPORT cua hop dong huong.
     Moi dong trang thai la SO THAT doc tu du lieu dang chay:
       - so bai va so chuong tu `curriculum`;
       - so bai da hoc tu tien do that cua nguoi dang dang nhap;
       - so cau hoi thu con lai tu `guestChatCount` (tran 25, cung con so
         khu quan tri hien o "Reset Khach thu (n/25)").
     Cho nao chua co so that thi ghi nang luc CO THAT, khong dat mot con so
     vao cho trong. */
  const laHocSinh = currentUser?.role === 'student';
  const truongViec: Truong[] = [
    {
      ma: 'BG',
      ten: 'Bài giảng',
      trangThai: currentUser
        ? `đã học ${completedCount}/${allLessons.length} bài`
        : `${allLessons.length} bài · ${curriculum.length} chương`,
      moKhi: () => setActiveTab('baigiang'),
      nhanNut: currentUser ? 'Học tiếp' : 'Vào học',
      chinh: true,
    },
    {
      ma: 'AI',
      ten: 'Gia sư AI',
      trangThai: currentUser
        ? 'Thầy Hùng gợi mở từng bước, không đưa đáp số'
        : `còn ${Math.max(0, 25 - guestChatCount)}/25 câu hỏi thử`,
      moKhi: () => setActiveTab('ichat'),
      nhanNut: 'Hỏi bài',
    },
    {
      ma: 'ĐK',
      ten: 'Đề kiểm tra',
      trangThai: laHocSinh
        ? 'Đề thầy giao, làm và xem điểm ngay'
        : `Đề sinh theo từng chương — ${curriculum.length} chương`,
      /* Khu de kiem tra nam trong "Khu vuc Hoc sinh", chi mo cho vai student.
         Khach va giao vien khong vao duoc — noi thang ly do thay vi giau muc
         di, vi giau di thi hop dong huong hua bon viec ma chi thay ba. */
      moKhi: laHocSinh ? () => setActiveTab('hocsinh') : undefined,
      nhanNut: 'Mở đề',
      khoa: 'Cần tài khoản học sinh',
    },
    {
      ma: 'TC',
      ten: 'Trò chơi ôn tập',
      trangThai: `2 trò · Rắn và Thang mở khoá lần lượt ${allLessons.length} màn`,
      moKhi: () => setActiveTab('trochoi'),
      nhanNut: 'Chơi',
    },
  ];

  // Lấy lịch sử iChat toàn cục (chúng ta dùng lessonId là 'global-advisor' cho cuộc chat tư vấn chung)
  const userEmail = currentUser ? currentUser.email : 'guest';
  const globalChats = chats.filter(c => c.userEmail === userEmail && c.lessonId === 'global-advisor');

  const handleSendGlobalIchat = async (textToSend?: string) => {
    const text = (textToSend || ichatInput).trim();
    if (!text) return;

    // Chưa có key thì mời nhập, đừng để rơi sang kịch bản mẫu mà không báo gì
    if (!hasApiKey) {
      setApiKeyDialogOpen(true);
      return;
    }

    setIchatInput('');
    setIsIchatSending(true);
    setIchatError(null);

    try {
      await addMessage('global-advisor', text);
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
        backgroundColor: 'var(--nen-trang)',
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
          // Chỉ thoát bài đang đọc; tab do DashboardHeader tự quyết định,
          // nếu đặt tab ở đây sẽ ghi đè lựa chọn của header.
          setSelectedLesson(null);
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

      {/* 2b. BANNER THAM GIA LỚP — chỉ hiện với học sinh chưa vào lớp nào.
          Điều kiện cũ là `role === 'free_user' || (role === 'student' && chưa có lớp)`.
          Nay 'free_user' đã gộp vào 'student' nên vế đầu thừa; "học sinh tự do"
          chính là học sinh không có classId. */}
      {currentUser &&
        currentUser.role === 'student' &&
        !currentUser.classId && !currentUser.joinedClassId &&
        activeTab === 'hocmai' && (
        <JoinClassForm
          onJoined={(_className) => {
            // State sẽ tự động refresh qua setCurrentUser trong joinClassByCode()
          }}
        />
      )}

      {/* 3. KHU VỰC NỘI DUNG CHÍNH THAY ĐỔI DỰA TRÊN TAB ĐANG CHỌN */}
      <Box sx={{ flex: 1, py: 4, position: 'relative' }}>
        {/* Hình vẽ hoá học trang trí hai bên lề. Đặt ngang hàng với Container
            (không lồng vào trong) để trải hết bề ngang trang mà vẫn không đẩy
            ra thanh cuộn ngang. Chỉ dùng ở tab Giới thiệu — nơi khối chữ hẹp
            nên còn thừa lề hai bên. */}
        {activeTab === 'gioithieu' && <ChemDoodles />}
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>

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
                      borderRadius: 0,
                      border: '1px solid var(--vien)',
                      backgroundColor: 'var(--nen-the)',
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      justifyContent: 'space-between',
                      gap: 2,
                      boxShadow: 'none',
                    }}
                  >
                    <Box>
                      <Typography variant="caption" sx={{ color: 'var(--chu-dam)', fontWeight: 'bold', display: 'block', mb: 0.3 }}>
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
                          bgcolor: 'var(--nen-nhat)',
                          borderRadius: 0,
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
                            borderRadius: 0,
                            fontSize: '0.82rem',
                            px: 1.5,
                            ...(studyMode === 'sgk'
                              ? { bgcolor: 'var(--xanh-nen)', color: 'var(--chu-nguoc)', boxShadow: 'none', '&:hover': { bgcolor: 'var(--xanh)' } }
                              : { color: 'var(--chu-2)', '&:hover': { bgcolor: 'var(--vien)', color: 'var(--xanh-troi2)' } }
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
                            borderRadius: 0,
                            fontSize: '0.82rem',
                            px: 1.5,
                            ...(studyMode === 'chat'
                              ? { bgcolor: 'var(--tin-hieu-nen)', color: 'var(--chu-nguoc)', boxShadow: 'none', '&:hover': { bgcolor: 'var(--do-nen)' } }
                              : { color: 'var(--chu-2)', '&:hover': { bgcolor: 'var(--vien)', color: 'var(--chu-dam)' } }
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
                        sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 0, fontSize: '0.82rem', borderColor: 'var(--vien)', color: 'var(--chu-2)', '&:hover': { borderColor: 'var(--tin-hieu)', color: 'var(--chu-dam)', bgcolor: 'var(--nen-tin-hieu-nhat)' } }}
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
                  
                  {/* Một cột, chiếm trọn bề ngang. Cột "Danh mục bài học" đã bỏ khỏi
                      màn hình này; muốn mở một bài thì dùng ô tìm kiếm ở trên cùng.
                      Danh mục vẫn còn khi đang đọc một bài, để chuyển nhanh giữa các bài. */}
                  <Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      
                      {/* KHU VỰC TRÒ CHƠI HÓA HỌC */}
                      <GameHubSection />

                      {/* KHỐI ĐĂNG KÝ — NẰM NGAY DƯỚI LƯỚI GAME */}
                      <Paper
                        sx={{
                          px: 4,
                          py: 3,
                          borderRadius: 0,
                          backgroundColor: 'var(--nen-tin-hieu-nhat)',
                          border: '1px solid var(--tin-hieu-vien)',
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 2,
                          boxShadow: 'none',
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--tin-hieu-dam)', mb: 0.5 }}>
                            Chơi Xong Rồi, Học Tiếp Thôi!
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tạo tài khoản miễn phí để lưu tiến trình chơi, mở khóa đầy đủ 6 chương Hóa 11 và hỏi Thầy Gia sư AI bất cứ lúc nào.
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          color="warning"
                          size="large"
                          onClick={() => navigate('/login')}
                          sx={{ px: 3, py: 1.2, borderRadius: 0, fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0 }}
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

          {/* ================= TAB: BÀI GIẢNG SLIDE ================= */}
          {activeTab === 'baigiang' && (
            <Box id="tab-content-slides">
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                <MascotDauVai tab="baigiang" />
              </Box>
              <SlidesSection />
            </Box>
          )}

          {/* ================= TAB: TRÒ CHƠI ================= */}
          {/* Khu game vốn nằm trong tab "Các khóa học"; tab đó đang ẩn nên
              tách ra thành mục menu riêng để vẫn vào chơi được. */}
          {activeTab === 'trochoi' && (
            <Box id="tab-content-games">
              {/* Lớp trong phải bọc đúng hàng nhân vật + khu thẻ game. Nếu để
                  GameDoodles bám thẳng khối ngoài thì nó phủ luôn cả dải trang
                  trí bên dưới, kéo tay cầm / nấm / máy cầm tay tụt khỏi thẻ. */}
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1 }}>
                  <MascotDauVai tab="trochoi" />
                  <GameDoodlesTren />
                </Box>
                <GameHubSection />
                <GameDoodles />
              </Box>
              <GameDoodlesDuoi />
            </Box>
          )}

          {/* ================= TAB 2: GIỚI THIỆU ================= */}
          {activeTab === 'gioithieu' && (
            <Box id="tab-content-about" sx={{ maxWidth: 900, mx: 'auto', position: 'relative' }}>
              {/* Khung hinh dau: bon viec lam duoc, truoc moi doan chu. Hop dong
                  huong doi hoc sinh bam duoc viec can lam ngay trong man dau,
                  khong phai cuon tim. */}
              <ActivityFields truongs={truongViec} />
              {/* Nhân vật đứng ngoài lề trái, sát mép khối chữ. Cần khoảng
                  215px + 16px lề nên chỉ bật từ 1440px trở lên; hẹp hơn thì
                  rơi xuống kiểu ló đầu nằm trong khối chữ bên dưới. */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: '100%',
                  mr: 2,
                  display: 'none',
                  '@media (min-width:1440px)': { display: 'block' },
                }}
              >
                <MascotToanThan tab="gioithieu" />
              </Box>
              <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 0, border: '1px solid var(--vien)', boxShadow: 'none' }}>
                {/* Màn hình hẹp không đủ lề cho nhân vật đứng — thay bằng kiểu
                    ló đầu xếp ngay trên tiêu đề. */}
                <Box
                  sx={{
                    display: 'flex',
                    mb: 2,
                    '@media (min-width:1440px)': { display: 'none' },
                  }}
                >
                  <MascotDauVai tab="gioithieu" rong={84} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Avatar variant="square" sx={{ bgcolor: 'var(--nen-dam)', color: 'var(--chu-nguoc)', width: 56, height: 56 }}>
                    <Info size={32} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)' }}>Giới thiệu về Gia Sư Hóa Học 11 AI</Typography>
                    <Typography variant="subtitle2" color="text.secondary">Nền tảng tự học đột phá kết hợp Trí tuệ nhân tạo thế hệ mới</Typography>
                  </Box>
                </Box>

                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: 'var(--chu-dam-3)' }}>
                  Chào mừng các em học sinh đến với <strong>Gia Sư Hóa Học 11 AI</strong>! Đây là dự án học tập thông minh tiên phong tại Việt Nam, mang đến giải pháp hỗ trợ tự học Hóa học lớp 11 vượt trội theo chương trình phổ thông mới.
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, color: 'var(--chu-dam-3)' }}>
                  Với mong muốn giúp mọi học sinh đều có thể tự tin làm chủ môn Hóa mà không cần đi học thêm tốn kém, chúng tôi đã tích hợp công nghệ trí tuệ nhân tạo (AI) thông minh để tạo ra một <strong>Người Thầy Gia Sư Đồng Hành 24/7</strong>. Gia sư AI không làm thay bài tập cho học sinh, mà đóng vai trò người hướng dẫn tận tình, khơi gợi suy nghĩ và dìu dắt các em giải quyết bài tập qua từng bước tư duy.
                </Typography>


                {/* TRIẾT LÝ GIẢNG DẠY */}
                {/* Ô khai: viền mực đều bốn cạnh, nhãn hoa nhỏ nằm trên một dải
                    giấy sẫm, chữ đen trên nền giấy. Đây là hình thức của một ô
                    thông tin bắt buộc trên nhãn hoá chất — nó nói "đọc phần này"
                    bằng cấu trúc chứ không bằng cách tô màu. */}
                <Box sx={{ border: '2px solid var(--chu-dam)', mb: 4 }}>
                  <Typography
                    variant="overline"
                    component="div"
                    sx={{
                      bgcolor: 'var(--nen-dam)',
                      color: 'var(--chu-nguoc)',
                      px: 2,
                      py: 0.8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      lineHeight: 1.4,
                    }}
                  >
                    <ShieldCheck size={16} /> Triết lý giảng dạy của Gia sư AI
                  </Typography>
                  <Typography variant="body2" sx={{ p: 3, lineHeight: 1.7, color: 'var(--chu-dam-3)' }}>
                    <strong>“Cho con cá không bằng cho cần câu”</strong> – Gia sư AI của chúng tôi được thiết kế theo chuẩn sư phạm nghiêm ngặt. Khi học sinh gõ một câu hỏi hoặc bài tập, thầy sẽ không bao giờ đưa thẳng đáp số cuối cùng để học sinh chép. Thay vào đó, thầy sẽ phân tích đề, gợi ý lý thuyết nền tảng và dẫn dắt học sinh đặt bút tính toán từng bước. Điều này giúp học sinh phát triển tư duy logic tự chủ, tự mình tìm ra đáp số để nhớ kiến thức bền vững nhất!
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  /* Sang mục Bài giảng. Trước đây trỏ về 'hocmai' — tab đó đã bị ẩn
                     khỏi thanh menu nên bấm vào là rơi vào một trang không có lối ra. */
                  onClick={() => setActiveTab('baigiang')}
                  startIcon={<BookOpen size={16} />}
                  sx={{ borderRadius: 0, fontWeight: 'bold' }}
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
                  <Card sx={{ p: 3, borderRadius: 0, border: '1px solid var(--vien)' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Sparkles size={20} color="var(--chu-dam)" /> Thầy Hùng Trợ Giảng AI
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                      Thầy là Trợ lý học tập cá nhân của em. Thầy sẵn sàng giải đáp mọi thắc mắc lý thuyết liên quan đến <strong>Hóa học lớp 11</strong>!
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                      Thầy chỉ dẫn từng bước khơi gợi tư duy giúp em tự học tốt nhất, không làm bài tập hộ đâu nhé!
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />

                    {/* Nguồn kiến thức thật sự nạp cho Thầy.

                        Chỗ này TRƯỚC ĐÂY ghi "Tài liệu: SGK HOA11.pdf — Sẽ nạp
                        tự động khi bắt đầu hỏi", với một chấm tròn vàng chờ
                        chuyển xanh. Không đúng: trong dự án không có tệp PDF
                        nào, và khoá `sgk_hoa11_cached` chỉ được ĐỌC chứ chưa
                        bao giờ được GHI, nên chấm tròn vĩnh viễn không xanh
                        được. Nói cách khác đó là một chỉ báo trang trí.

                        Thứ thật sự đi kèm mỗi câu hỏi nằm ở
                        `tutor/services/lessonContext.ts`: danh mục 25 bài
                        (~1.700 ký tự) luôn được gửi, cộng thêm toàn văn bài
                        đang mở (~2.500–3.400 ký tự) khi học sinh vào đọc một
                        bài cụ thể. Nội dung này sinh từ các tệp .docx của thầy
                        qua `npm run soan`, đóng sẵn trong web nên không phải
                        tải gì — vì thế trạng thái luôn là "đã sẵn sàng". */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: 'var(--nen-trang)', borderRadius: 0 }}>
                      <Box sx={{ position: 'relative', display: 'flex' }}>
                        <Box sx={{ width: 10, height: 10, bgcolor: 'var(--luc-tham-nen)', borderRadius: '50%' }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                          Nguồn kiến thức: {allLessons.length} bài Hóa 11 (KNTT 2018)
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', display: 'block' }}>
                          <span style={{ color: 'var(--luc-tham)', fontWeight: 'bold' }}>Đã nạp sẵn trong web ⚡</span>
                          {' '}— Thầy luôn có danh mục cả 25 bài; mở một bài cụ thể thì có thêm toàn văn bài đó.
                        </Typography>
                      </Box>
                    </Box>
                  </Card>

                  {/* Câu hỏi gợi ý nhanh */}
                  <Card sx={{ p: 3, borderRadius: 0, border: '1px solid var(--vien)' }}>
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
                            borderRadius: 0,
                            border: '1px solid var(--vien)',
                            bgcolor: 'var(--nen-the)',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'var(--tin-hieu)',
                              bgcolor: 'var(--nen-tin-hieu-nhat2)',
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
                    borderRadius: 0,
                    overflow: 'hidden',
                    border: '1px solid var(--vien)',
                  }}
                >
                  {/* Header Khung Chat */}
                  <Box sx={{ p: 2.5, bgcolor: 'var(--nen-trang)', borderBottom: '1px solid var(--vien)', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'var(--xanh-nen)', color: 'var(--chu-nguoc)', width: 44, height: 44, boxShadow: 'none' }}>
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
                    <Box sx={{ flex: 1 }} />
                    <Tooltip title={hasApiKey ? 'Đổi API key Gemini' : 'Chưa có API key — bấm để nhập'}>
                      <Button size="small" variant={hasApiKey ? 'text' : 'contained'}
                        color={hasApiKey ? 'inherit' : 'warning'}
                        onClick={() => setApiKeyDialogOpen(true)}
                        sx={{ minWidth: 0, whiteSpace: 'nowrap' }}>
                        {hasApiKey ? '⚙️' : '⚙️ Nhập API key'}
                      </Button>
                    </Tooltip>
                  </Box>

                  {/* Chưa có key thì nói thẳng, đừng để học sinh tưởng đang chat với AI */}
                  {!hasApiKey && (
                    <Alert severity="warning" sx={{ borderRadius: 0, py: 0.5, px: 2, '.MuiAlert-message': { fontSize: '0.8rem' } }}>
                      Chưa có API key nên thầy chưa trả lời được. Bấm <strong>⚙️ Nhập API key</strong> ở
                      trên, làm theo hướng dẫn lấy key miễn phí từ Google AI Studio.
                    </Alert>
                  )}

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
                  <Box sx={{ flex: 1, p: 3, overflowY: 'auto', bgcolor: 'var(--nen-the)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {globalChats.length === 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: 2, p: 4 }}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: 'var(--nen-xanh-nhat2)', color: 'var(--xanh)' }}>
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
                              <Avatar sx={{ bgcolor: 'var(--nen-xanh-nhat2)', color: 'var(--xanh)', width: 32, height: 32 }}>
                                <Sparkles size={16} />
                              </Avatar>
                            )}
                            <Box>
                              <Paper
                                sx={{
                                  p: 2,
                                  borderRadius: 0,
                                  backgroundColor: isAi ? 'var(--nen-nhat)' : 'var(--xanh-nen)',
                                  color: isAi ? 'text.primary' : 'var(--chu-nguoc)',
                                  boxShadow: 'none',
                                  border: isAi ? '1px solid var(--vien)' : 'none',
                                }}
                              >
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6, fontSize: '0.9rem' }}>
                                  <RichText text={msg.content} linkColor={isAi ? 'var(--xanh)' : 'var(--chu-nguoc)'} />
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
                        <Avatar sx={{ bgcolor: 'var(--nen-xanh-nhat2)', color: 'var(--xanh)', width: 32, height: 32 }}>
                          <Sparkles size={16} />
                        </Avatar>
                        <Paper sx={{ p: 1.5, bgcolor: 'var(--nen-nhat)', border: '1px solid var(--vien)', borderRadius: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
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
                  <Box sx={{ p: 2, bgcolor: 'var(--nen-trang)', borderTop: '1px solid var(--vien)', display: 'flex', gap: 1.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={guestLimitReached ? 'Đã hết lượt chat thử miễn phí!' : 'Nhắn tin hỏi thầy (Ví dụ: Thầy hướng dẫn em bài tập tính pH)...'}
                      value={ichatInput}
                      onChange={(e) => setIchatInput(e.target.value)}
                      onKeyDown={handleKeyPressIchat}
                      disabled={guestLimitReached || isIchatSending}
                      sx={{ bgcolor: 'var(--nen-the)', '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                    />
                    <Button
                      variant="contained"
                      onClick={() => handleSendGlobalIchat()}
                      disabled={guestLimitReached || isIchatSending || !ichatInput.trim()}
                      sx={{ borderRadius: 0, px: 3, fontWeight: 'bold' }}
                    >
                      Gửi Thầy
                    </Button>
                  </Box>
                </Paper>

                <ApiKeyDialog
                  open={apiKeyDialogOpen}
                  onClose={() => {
                    setApiKeyDialogOpen(false);
                    setHasApiKey(coKey());
                  }}
                />

              </Box>
            </Box>
          )}

          {/* ================= TAB 4: HỖ TRỢ (GIẢI ĐÁP CÁC THẮC MẮC) ================= */}
          {activeTab === 'hotro' && (
            <Box id="tab-content-support" sx={{ maxWidth: 850, mx: 'auto' }}>
              <Paper sx={{ p: 4, borderRadius: 0, border: '1px solid var(--vien)', boxShadow: 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Avatar sx={{ bgcolor: 'var(--tin-hieu-nen)', color: 'var(--chu-nguoc)', width: 56, height: 56 }}>
                    <HelpCircle size={32} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)' }}>Trung tâm hỗ trợ học viên</Typography>
                    <Typography variant="subtitle2" color="text.secondary">Giải đáp các thắc mắc thường gặp về cách thức vận hành của Hệ Thống AI</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Câu 1 */}
                  <Accordion sx={{ borderRadius: '0 !important', '&:before': { display: 'none' }, boxShadow: 'none', border: '1px solid var(--vien)' }}>
                    <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)' }}>
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
                  <Accordion sx={{ borderRadius: '0 !important', '&:before': { display: 'none' }, boxShadow: 'none', border: '1px solid var(--vien)' }}>
                    <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)' }}>
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
                  <Accordion sx={{ borderRadius: '0 !important', '&:before': { display: 'none' }, boxShadow: 'none', border: '1px solid var(--vien)' }}>
                    <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)' }}>
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

                <Box sx={{ mt: 5, p: 3, bgcolor: 'var(--nen-tin-hieu-nhat)', borderRadius: 0, border: '1px solid var(--nen-tin-hieu-nhat2)', textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', mb: 1 }}>
                    Học viên vẫn còn thắc mắc khác cần hỗ trợ nhanh?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Hãy liên hệ trực tiếp với đội ngũ tư vấn viên qua số Zalo hỗ trợ kỹ thuật miễn phí dưới đây:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button variant="contained" color="primary" startIcon={<MessageSquare size={14} />} onClick={() => window.open(LINK_ZALO, '_blank', 'noopener,noreferrer')} sx={{ borderRadius: 0 }}>
                      Zalo Hỗ Trợ: 0345203054
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Box>
          )}

          {/* ================= TAB 5: HỌC SINH (KHU VỰC CÁ NHÂN HÓA) ================= */}
          {activeTab === 'hocsinh' && (
            <StudentArea />
          )}

        </Container>
      </Box>
    </Box>
  );
};

export default DashboardPage;
