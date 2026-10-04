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
  BookMarked,
  KeyRound
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
import { GameHubSection, SO_TRO_CHOI } from '../features/games/GameHubSection';
import { PracticeSection } from '../features/practice';
import { SlidesSection } from '../features/lessons/components/SlidesSection';
import { PhongThiNghiem } from '../features/lessons/components/PhongThiNghiem';
import { ActivityFields, type Truong } from '../features/lessons/components/ActivityFields';
import {
  GameDoodles, GameDoodlesTren, GameDoodlesDuoi,
  MascotDauVai,
} from '../features/mascot';
import { MathMarkdownRenderer } from '../core/components/MathMarkdownRenderer';
import { coGiaSuAI } from '../features/tutor/services/geminiTutorService';
import { TRAN_LUOT_KHACH } from '../features/tutor/services/gioiHanChatService';
import { coKeyRieng } from '../features/tutor/services/keyRieng';
import { KeyRiengDialog } from '../features/tutor/components/KeyRiengDialog';
import { useGiayDaCho, chuDangCho } from '../features/tutor/components/useGiayDaCho';
import { useCuonDay } from '../features/tutor/components/useCuonDay';
import { DanhSachTinTheoPhien, NutTinMoiNhat } from '../features/tutor/components/DanhSachTinTheoPhien';
import type { ChatMessage } from '../features/auth/types';

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
  /** Tab đang đứng lúc mở một bài từ ô tìm kiếm — nơi nút "Quay lại" trả về */
  const [tabTruocKhiMoBai, setTabTruocKhiMoBai] = useState<string>('gioithieu');
  const [searchQuery, setSearchQuery] = useState<string>('');
  // 'sgk' = xem trang sách, 'chat' = hỏi gia sư AI
  const [studyMode, setStudyMode] = useState<'sgk' | 'chat'>('sgk');

  // iChat state riêng cho Chatbot tư vấn học tập
  const [ichatInput, setIchatInput] = useState('');
  const [isIchatSending, setIsIchatSending] = useState(false);
  const [ichatError, setIchatError] = useState<string | null>(null);
  /* Đếm giây chờ để dòng "Thầy đang viết câu trả lời..." không đứng im suốt
     cả phút — xem `useGiayDaCho.ts`. */
  const giayDaChoIchat = useGiayDaCho(isIchatSending);

  /* Khoá riêng quay lại ngày 20/09/2026, theo quyết định của chủ dự án, nhưng
     KHÁC bản bị bỏ ngày 14/09/2026 ở ba điểm: chỉ hiện khi cả web vừa hết hạn
     mức theo NGÀY (không bày thường trực), hướng dẫn nói rõ Google đòi người
     tạo khoá từ 18 tuổi nên phải nhờ bố mẹ hoặc thầy cô làm giúp, và khoá
     không bao giờ rời khỏi máy — `kiem-tra:an-ninh` canh điều đó.
     Vẫn báo thật khi máy chưa cấu hình gia sư AI, để học sinh không tưởng kịch
     bản mẫu là AI đang trả lời. */
  const [moKeyRieng, setMoKeyRieng] = useState(false);
  const [daCoKeyRieng, setDaCoKeyRieng] = useState(() => coKeyRieng());
  const coGiaSuThat = coGiaSuAI();

  // Lấy tổng số bài học
  const allLessons = curriculum.flatMap((c) => c.lessons);

  // Tính toán tiến độ của học sinh hiện tại
  const progress = currentUser ? getUserProgress(currentUser.email) : null;
  /* Chỉ đếm mã bài có thật, như StudentArea — mảng này từng lẫn mã rác
     ('student-free-chat'). */
  const completedCount = progress
    ? progress.completedLessons.filter((id) => allLessons.some((l) => l.id === id)).length
    : 0;
  const progressPercent =
    allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  /* Bon viec lam duoc, dung theo FIRST VIEWPORT cua hop dong huong.
     Moi dong trang thai la SO THAT doc tu du lieu dang chay:
       - so bai va so chuong tu `curriculum`;
       - so bai da hoc tu tien do that cua nguoi dang dang nhap;
       - so cau hoi thu con lai tu `guestChatCount`, tran doc tu hang so
         `TRAN_LUOT_KHACH` (20/09/2026 ha tu 25 xuong 5).
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
        ? 'Chemai gợi mở từng bước, không đưa đáp số'
        : `còn ${Math.max(0, TRAN_LUOT_KHACH - guestChatCount)}/${TRAN_LUOT_KHACH} câu hỏi thử`,
      /* Chemai đứng ở mép phải ĐÚNG trường này, không phải giữa màn —
         hợp đồng hướng chỉ định vậy, và ở đây nhân vật nói đúng việc mình làm
         thay vì làm nền trang trí cho cả trang. */
      nhanVat: <MascotDauVai tab="gioithieu" rong={64} anBongBong />,
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
      trangThai: `${SO_TRO_CHOI} trò · Rắn và Thang mở khoá lần lượt ${allLessons.length} màn`,
      moKhi: () => setActiveTab('trochoi'),
      nhanNut: 'Chơi',
    },
  ];

  // Lấy lịch sử iChat toàn cục (chúng ta dùng lessonId là 'global-advisor' cho cuộc chat tư vấn chung)
  const userEmail = currentUser ? currentUser.email : 'guest';
  const globalChats = chats.filter(c => c.userEmail === userEmail && c.lessonId === 'global-advisor');
  /* Bản cũ không cuộn gì cả: mở tab là đứng ở tin CŨ NHẤT, câu trả lời mới
     cũng không tự hiện ra. Khoá theo tab để mỗi lần mở lại đều xuống đáy. */
  const ichatCuon = useCuonDay(globalChats.length, isIchatSending, activeTab);

  /* Lượt vừa rồi có bị chặn vì CẢ WEB hết hạn mức trong ngày không — bám vào
     đúng cụm chữ mà `thongBaoHetLuot` sinh ra cho trường hợp đó. */
  const ichatVuaHetHanMuc = /hết lượt trả lời trong ngày của toàn hệ thống/
    .test(globalChats[globalChats.length - 1]?.content || '');

  const handleSendGlobalIchat = async (textToSend?: string) => {
    const text = (textToSend || ichatInput).trim();
    if (!text) return;

    setIchatInput('');
    setIsIchatSending(true);
    setIchatError(null);

    try {
      await addMessage('global-advisor', text);
    } catch (err: any) {
      setIchatError(err.message || 'Có lỗi xảy ra khi trò chuyện với Chemai.');
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
    'Chemai ơi, hướng dẫn em cách tính pH của dung dịch Ba(OH)2 với ạ?',
    'Làm sao để làm bài tập hiệu suất tổng hợp Ammonia vậy Chemai?',
    'Làm thế nào để xác định sản phẩm chính của phản ứng thế Alkane ạ?',
    'Phương pháp lập công thức phân tử hợp chất hữu cơ CxHyOz như thế nào ạ?',
  ];

  /* Trạng thái dùng thử còn lại của iChat — ĐỌC HẰNG SỐ `TRAN_LUOT_KHACH`.
     Chép cứng 25 ở đây là lý do bản pages.dev ghi số còn lại 24 trên nền trần 5. */
  const guestLimitReached = !currentUser && guestChatCount >= TRAN_LUOT_KHACH;
  const guestRemainingCount = !currentUser ? Math.max(0, TRAN_LUOT_KHACH - guestChatCount) : 0;

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
          /* Nhớ tab đang đứng để "Quay lại" trả về đúng đó. Tab 'hocmai' không
             có nút nào trên menu, nên quay về nó là rơi vào một trang lạc lõng. */
          if (activeTab !== 'hocmai') setTabTruocKhiMoBai(activeTab);
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
        {/* ChemDoodles TUNG rai o day — hinh hoa chat pastel ve tay, hai le
            cua chinh man dau. THESIS cua huong tu choi thang idiom do, va no
            khong nam trong danh sach rang buoc thuong hieu (ten, dong phu, logo
            sach mo, so Zalo, Thay Hung), nen bo. Cac tab khac van giu hinh cua
            rieng chung. */}
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>

          {/* Băng "đơn xin làm giáo viên đang chờ duyệt" — ĐO trước khi đặt (Đợt 3b/6):
              đây là chỗ DUY NHẤT trong /dashboard luôn dựng bất kể activeTab. Mọi khối
              phía dưới đều gác bằng {activeTab === '...'} (hocmai, baigiang, thinghiem,
              luyentap, trochoi, gioithieu, ichat, hotro, hocsinh), còn tab mặc định là
              'gioithieu' chứ không phải 'hocsinh' — đặt trong StudentArea thì người vừa
              đăng ký sẽ không thấy gì. Bài học từ Đợt 2b: một tính năng từng nằm sau
              activeTab === 'hocmai' mà nút mở tab đó đã bị ẩn khỏi menu — không ai tới
              được. Chỉ coi là đơn khi ĐỦ hai điều: còn pendingRole 'teacher' VÀ vai hiện
              tại vẫn là 'student' — thiếu vế sau thì sau khi duyệt (vai đã thành teacher)
              băng vẫn còn nếu pendingRole chưa kịp xoá. */}
          {currentUser?.pendingRole === 'teacher' && currentUser.role === 'student' && (
            <Alert
              severity="info"
              sx={{ mb: 3, borderRadius: 0, border: '1px solid var(--vien)' }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Đơn xin làm giáo viên đang chờ duyệt
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, lineHeight: 1.6 }}>
                Quản trị sẽ xem xét đơn của bạn. Trong lúc chờ, bạn dùng web như học sinh —
                mọi lịch sử học tập sẽ được giữ nguyên sau khi duyệt.
              </Typography>
            </Alert>
          )}

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
                        onClick={() => { setSelectedLesson(null); setStudyMode('sgk'); setActiveTab(tabTruocKhiMoBai); }}
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
                      /* Cột danh mục rộng theo chính nó (260 px khi mở, một ô
                         biểu tượng khi thu gọn). Ghim cứng 260 px thì bấm "Thu
                         gọn" xong cột vẫn chiếm nguyên chỗ, nội dung không rộng
                         thêm chút nào. `minmax(0, 1fr)` để nội dung dài không
                         đẩy lưới tràn ngang. */
                      gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'auto minmax(0, 1fr)' },
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
                            Tạo tài khoản miễn phí để lưu tiến trình chơi, mở khóa đầy đủ 6 chương Hóa 11 và hỏi Chemai bất cứ lúc nào.
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          color="warning"
                          size="large"
                          onClick={() => navigate('/login', { state: { moDangKy: true } })}
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

          {/* ================= TAB: THÍ NGHIỆM ================= */}
          {activeTab === 'thinghiem' && (
            <Box id="tab-content-lab">
              <PhongThiNghiem />
            </Box>
          )}

          {/* ================= TAB: LUYỆN TẬP ================= */}
          {activeTab === 'luyentap' && (
            <Box id="tab-content-practice">
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                <MascotDauVai tab="luyentap" />
              </Box>
              <PracticeSection
                /* Nút này chỉ hiện với KHÁCH. Trước đây nó chuyển sang tab
                   'hocsinh', mà `StudentArea` trả về rỗng khi chưa đăng nhập —
                   khách bấm xong chỉ thấy một trang trắng. */
                onDangNhap={() => navigate('/login')}
                onMoTroChoi={() => setActiveTab('trochoi')}
              />
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
              <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 0, border: '1px solid var(--vien)', boxShadow: 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Avatar variant="square" sx={{ bgcolor: 'var(--nen-dam)', color: 'var(--chu-nguoc)', width: 56, height: 56 }}>
                    <Info size={32} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)' }}>Giới thiệu về Gia sư Hóa 11</Typography>
                    <Typography variant="subtitle2" color="text.secondary">Tự học Hoá học 11 bám sát sách, có gia sư AI dẫn đường</Typography>
                  </Box>
                </Box>

                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: 'var(--chu-dam-3)' }}>
                  Chào mừng các em học sinh đến với <strong>Gia sư Hóa 11</strong>! Đây là nền tảng tự học Hoá học lớp 11 bám sát đúng 25 bài của bộ Kết nối tri thức 2018 — chính bộ sách các em đang cầm trên tay.
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, color: 'var(--chu-dam-3)' }}>
                  Với mong muốn giúp mọi học sinh đều có thể tự tin làm chủ môn Hóa mà không cần đi học thêm tốn kém, chúng tôi đã tích hợp công nghệ trí tuệ nhân tạo (AI) thông minh để tạo ra một <strong>Người Thầy Gia Sư riêng cho từng em</strong>. Gia sư AI không làm thay bài tập cho học sinh, mà đóng vai trò người hướng dẫn tận tình, khơi gợi suy nghĩ và dìu dắt các em giải quyết bài tập qua từng bước tư duy.
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
                      <Sparkles size={20} color="var(--chu-dam)" /> Chemai Trợ Giảng AI
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                      Chemai là trợ lý học tập cá nhân của em, sẵn sàng giải đáp mọi thắc mắc lý thuyết liên quan đến <strong>Hóa học lớp 11</strong>!
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                      Chemai chỉ dẫn từng bước, khơi gợi tư duy giúp em tự học tốt nhất, không làm bài tập hộ đâu nhé!
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
                          <span style={{ color: 'var(--luc-tham)', fontWeight: 'bold' }}>Đã nạp sẵn trong web</span>
                          {' '}— Chemai luôn có danh mục cả 25 bài; mở một bài cụ thể thì có thêm toàn văn bài đó.
                        </Typography>
                      </Box>
                    </Box>
                  </Card>

                  {/* Câu hỏi gợi ý nhanh */}
                  <Card sx={{ p: 3, borderRadius: 0, border: '1px solid var(--vien)' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Các chủ đề gợi ý em có thể hỏi Chemai:
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
                    /* Màn hẹp: khung chat lên TRƯỚC thẻ giới thiệu và gợi ý.
                       Đo 03/10/2026 ở 375×812: khung chat bắt đầu ở y=1135 px,
                       tức em phải cuộn qua hơn một màn mới tới chỗ hỏi. */
                    order: { xs: -1, md: 0 },
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
                        Chemai — Gia sư tư vấn
                        <Chip label="ONLINE" size="small" color="secondary" sx={{ height: 16, fontSize: '0.65rem', fontWeight: 'bold' }} />
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Gia sư tận tình • Hướng dẫn giải bài tập từng bước • Giải đáp Hóa 11
                      </Typography>
                    </Box>
                  </Box>

                  {/* Máy chưa cấu hình gia sư AI thì nói thẳng, đừng để học sinh tưởng đang chat với AI */}
                  {!coGiaSuThat && (
                    <Alert severity="warning" sx={{ borderRadius: 0, py: 0.5, px: 2, '.MuiAlert-message': { fontSize: '0.8rem' } }}>
                      Gia sư AI chưa được cấu hình trên bản web này, nên câu trả lời là kịch bản mẫu, không phải AI.
                    </Alert>
                  )}

                  {/* Lượt dùng thử */}
                  {!currentUser && (
                    <Alert severity={guestRemainingCount === 0 ? 'error' : 'warning'} sx={{ borderRadius: 0, py: 0.5, px: 2, '.MuiAlert-message': { fontSize: '0.8rem' } }}>
                      {guestRemainingCount === 0 ? (
                        <strong>Em đã dùng hết {TRAN_LUOT_KHACH} lượt hỏi thử miễn phí.</strong>
                      ) : (
                        <span>Em đang dùng bản dùng thử. Còn lại: <strong>{guestRemainingCount}/{TRAN_LUOT_KHACH} lượt hỏi</strong>.</span>
                      )}
                      {' Đăng ký tài khoản học sinh để hỏi Chemai không giới hạn!'}
                    </Alert>
                  )}

                  {/* Vùng Tin Nhắn */}
                  <Box
                    ref={ichatCuon.khungRef}
                    onScroll={ichatCuon.khiCuon}
                    sx={{ flex: 1, p: 3, overflowY: 'auto', bgcolor: 'var(--nen-the)', display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    {globalChats.length === 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: 2, p: 4 }}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: 'var(--nen-xanh-nhat2)', color: 'var(--xanh)' }}>
                          <MessageSquare size={32} />
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Bắt đầu buổi tư vấn riêng cùng Chemai!</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
                          Em có thắc mắc gì về lý thuyết Hóa học 11, cách cân bằng phương trình, quy tắc Le Chatelier hay các chủ đề tự luận? Nhắn ngay cho Chemai dưới đây nhé!
                        </Typography>
                      </Box>
                    ) : (
                      <DanhSachTinTheoPhien
                        tin={globalChats}
                        khungRef={ichatCuon.khungRef}
                        khoa="global-advisor"
                        veTin={(msg: ChatMessage) => {
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
                                  <Typography component="div" variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.9rem' }}>
                                    <MathMarkdownRenderer text={msg.content} linkColor={isAi ? 'var(--xanh)' : 'var(--chu-nguoc)'} />
                                  </Typography>
                                </Paper>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: isAi ? 'left' : 'right' }}>
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        }}
                      />
                    )}

                    {isIchatSending && (
                      <Box sx={{ display: 'flex', gap: 1.5, alignSelf: 'flex-start' }}>
                        <Avatar sx={{ bgcolor: 'var(--nen-xanh-nhat2)', color: 'var(--xanh)', width: 32, height: 32 }}>
                          <Sparkles size={16} />
                        </Avatar>
                        <Paper sx={{ p: 1.5, bgcolor: 'var(--nen-nhat)', border: '1px solid var(--vien)', borderRadius: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <RefreshCw size={14} className="animate-spin" />
                          <Typography variant="caption" color="text.secondary">{chuDangCho(giayDaChoIchat)}</Typography>
                        </Paper>
                      </Box>
                    )}

                    {ichatCuon.xaDay && <NutTinMoiNhat onClick={() => ichatCuon.cuonXuong()} />}
                  </Box>

                  {ichatError && (
                    <Alert severity="error" onClose={() => setIchatError(null)} sx={{ borderRadius: 0 }}>
                      {ichatError}
                    </Alert>
                  )}

                  {/* Khoá riêng: chỉ mời khi CẢ WEB vừa hết hạn mức trong ngày
                      và máy này chưa có khoá. Không bày thường trực — em không
                      cần biết tới nó cho tới lúc thật sự bị chặn. */}
                  {ichatVuaHetHanMuc && !daCoKeyRieng && (
                    <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid var(--vien)' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<KeyRound size={16} />}
                        onClick={() => setMoKeyRieng(true)}
                        sx={{ borderRadius: 0, textTransform: 'none' }}
                      >
                        Khoá riêng của em — hỏi tiếp ngay hôm nay
                      </Button>
                    </Box>
                  )}

                  {/* Vùng Nhập */}
                  <Box sx={{ p: 2, bgcolor: 'var(--nen-trang)', borderTop: '1px solid var(--vien)', display: 'flex', gap: 1.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={guestLimitReached ? 'Đã hết lượt chat thử miễn phí!' : 'Nhắn tin hỏi Chemai (Ví dụ: Hướng dẫn em bài tập tính pH)...'}
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
                      Gửi
                    </Button>
                  </Box>

                  <KeyRiengDialog
                    mo={moKeyRieng}
                    onDong={() => setMoKeyRieng(false)}
                    onDoi={() => setDaCoKeyRieng(coKeyRieng())}
                  />
                </Paper>

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
                        {/* Viết lại 02/10/2026 cho khớp luồng đang chạy: học sinh tự
                            đăng ký là dùng được ngay, không có bước chờ quản trị
                            duyệt (chỉ đơn làm GIÁO VIÊN mới chờ duyệt), và nút
                            Đăng Ký không còn màu cam. */}
                        Em nhìn lên góc trên bên phải màn hình và nhấn nút <strong>Đăng Ký</strong>, chọn <strong>Học sinh đăng ký bằng Email</strong>, rồi nhập họ tên, địa chỉ email và mật khẩu. Tạo xong là em đăng nhập được ngay bằng nút <strong>Đăng Nhập</strong>, không phải chờ ai duyệt.
                        Sau khi đăng nhập, em vào mục <strong>Học sinh</strong> để chọn lớp của mình; thầy cô duyệt đơn là em vào lớp. Nếu nhà trường đã cấp sẵn tài khoản thì em dùng luôn tài khoản đó.
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
                        Đối với <strong>khách dùng thử (chưa đăng nhập)</strong>, hệ thống hỗ trợ dùng thử tối đa <strong>{TRAN_LUOT_KHACH} câu hỏi</strong> thảo luận với Gia sư AI. Để học tập hoàn toàn không giới hạn và lưu giữ toàn bộ tiến độ, các em chỉ cần đăng ký cho mình một tài khoản học sinh.
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
                        Gia sư AI đóng vai trò như một giáo viên thực thụ đồng hành cùng em qua từng bước.
                        <br />
                        - Khi em học lý thuyết, Gia sư tóm tắt các điểm then chốt nhất giúp em dễ nhớ dễ hiểu.
                        <br />
                        - Khi em làm bài tập, Gia sư <strong>chỉ gợi mở phương pháp và dẫn dắt em tư duy qua từng bước</strong>, chứ Chemai sẽ không giải hộ trực tiếp bài tập hay đưa ra đáp số ngay. Chemai muốn em tự động não và làm được bài tập để hình thành tư duy chủ động xuất sắc!
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
