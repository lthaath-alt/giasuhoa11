import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Container,
  Typography,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Paper
} from '@mui/material';
import {
  BookOpen,
  ShieldCheck,
  Sparkles,
  UserPlus,
  LogOut,
  Search,
  Phone,
  MessageSquare,
  HelpCircle,
  Info,
  Layers,
  ChevronDown,
  User as UserIcon,
  GraduationCap,
  Building2,
  Presentation,
  Gamepad2,
  Moon,
  Sun,
} from 'lucide-react';
import { useCheDoMau } from '../../../core/hooks/useCheDoMau';
import { LINK_ZALO } from '../../../core/constants';
import { User } from '../../auth/types';
import { useApp } from '../../../core/hooks/useApp';
import { Lesson } from '../types';

/**
 * Bật/tắt mục "Các khóa học (Hóa 11)" trên thanh menu.
 *
 * Đang để false: nút bị ẩn, "Bài giảng" là mục đầu tiên và là tab mặc định.
 * Toàn bộ nội dung tab đó (đọc SGK, Hỏi AI theo bài, khu trò chơi, thanh tiến
 * độ) VẪN CÒN NGUYÊN trong code — đổi dòng này thành true là hiện lại ngay.
 *
 * Lưu ý: tìm kiếm bài học ở ô trên cùng vẫn mở được phần đọc SGK, kể cả khi
 * nút menu đang ẩn.
 */
const HIEN_MUC_KHOA_HOC = false;

interface DashboardHeaderProps {
  currentUser: User | null;
  logout: () => void;
  guestChatCount: number;
  onLogoClick: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectLesson: (lesson: Lesson) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentUser,
  logout,
  guestChatCount,
  onLogoClick,
  activeTab,
  setActiveTab,
  onSelectLesson,
}) => {
  const { curriculum, hasAdvancedStudentTitle } = useApp();
  const { laToi, doiCheDo } = useCheDoMau();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAnchorEl, setSearchAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRegisterRedirect = () => {
    logout();
    navigate('/login');
  };

  // Lọc bài học khi tìm kiếm
  const allLessons = curriculum.flatMap((c) => c.lessons);
  const filteredLessons = searchQuery.trim()
    ? allLessons.filter((l) => l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.summary.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSearchAnchorEl(e.currentTarget);
  };

  const handleSearchSelect = (lesson: Lesson) => {
    onSelectLesson(lesson);
    setActiveTab('hocmai');
    setSearchQuery('');
    setSearchAnchorEl(null);
  };

  return (
    <AppBar
      id="hocmai-app-bar"
      position="static"
      color="inherit"
      elevation={0}
      sx={{
        backgroundColor: 'var(--nen-the)',
        /* Thế giới nhãn dựng bằng NÉT KẺ, không bằng bóng đổ mềm. Một đường mực
           đậm dưới thanh thay cho vệt mờ toả — đó là cách một cái nhãn thật kết
           thúc ở mép giấy. */
        borderBottom: '2px solid var(--chu-dam)',
        boxShadow: 'none',
      }}
    >
      {/* 1. DÒNG TRÊN CÙNG: LOGO - TÌM KIẾM - HOTLINE & LIÊN HỆ - ĐĂNG NHẬP */}
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1.5,
            gap: 2,
          }}
        >
          {/* LOGO STYLE HOCMAI */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
            onClick={() => {
              // Bấm logo về mục đầu tiên đang hiện trên menu
              setActiveTab(HIEN_MUC_KHOA_HOC ? 'hocmai' : 'gioithieu');
              onLogoClick();
            }}
          >
            {/* Biểu tượng HOCMAI */}
            <Box
              sx={{
                p: 1,
                /* Mực đen, không xanh dương: ô nhận diện là con dấu trên nhãn.
                   Góc vuông và không bóng đổ — hình thoi bo tròn nửa vời là di
                   sản của thế giới cũ. */
                backgroundColor: 'var(--nen-dam)',
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none',
              }}
            >
              <BookOpen size={24} color="var(--chu-nguoc)" />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.5px',
                  color: 'var(--xanh)',
                  lineHeight: 1.1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                Gia sư Hóa 11
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 'bold',
                  color: 'var(--cam)',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  fontSize: '0.68rem',
                }}
              >
                Hệ Thống Tự Học AI
              </Typography>
            </Box>
          </Box>

          {/* Ô TÌM KIẾM NHANH (GIỐNG HOCMAI.VN) */}
          <Box sx={{ position: 'relative', width: { xs: '100%', md: '35%' } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                borderRadius: 0,
                backgroundColor: 'var(--nen-nhat)',
                px: 2,
                py: 0.8,
                border: '1px solid transparent',
                '&:focus-within': {
                  borderColor: 'var(--xanh)',
                  backgroundColor: 'var(--nen-the)',
                },
              }}
            >
              <Search size={16} color="var(--xanh)" style={{ marginLeft: 6 }} />
              <input
                id="hocmai-search-bar"
                placeholder="Tìm kiếm bài học hóa học 11..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchAnchorEl(e.currentTarget);
                }}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontSize: '0.85rem',
                  color: 'var(--chu-dam-2)',
                }}
              />
            </Box>
            
            {/* Kết quả tìm kiếm nhanh */}
            {searchQuery.trim() !== '' && (
              <Paper
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 9999,
                  mt: 1,
                  maxHeight: 280,
                  overflowY: 'auto',
                  borderRadius: 0,
                  boxShadow: 'none',
                  border: '1px solid var(--vien)',
                }}
              >
                {filteredLessons.length > 0 ? (
                  filteredLessons.map((l) => (
                    <Box
                      key={l.id}
                      onClick={() => handleSearchSelect(l)}
                      sx={{
                        py: 1.2,
                        px: 2,
                        borderBottom: '1px solid var(--nen-nhat)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'var(--nen-nhat)',
                        },
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--xanh)' }}>
                        {l.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ width: '100%' }}>
                        {l.summary}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Không tìm thấy bài học phù hợp.
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}
          </Box>

          {/* HOTLINE - ZALO - AUTH BUTTONS */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: { xs: 1, sm: 2 },
              justifyContent: 'center',
            }}
          >
            {/* Liên hệ Zalo */}
            <Tooltip title="Liên hệ Zalo hỗ trợ kỹ thuật">
              <Button
                id="zalo-contact-btn"
                variant="contained"
                size="small"
                onClick={() => window.open(LINK_ZALO, '_blank', 'noopener,noreferrer')}
                sx={{
                  /* Zalo là đường liên hệ, không phải hành động chính. Trong thế
                     giới nhãn chỉ có MỘT màu tín hiệu, và nó dành cho việc học —
                     nên nút này hạ xuống dạng khung kẻ. */
                  backgroundColor: 'transparent',
                  color: 'var(--chu-dam)',
                  border: '1px solid var(--chu-dam)',
                  borderRadius: 0,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2,
                  py: 0.6,
                  '&:hover': {
                    backgroundColor: 'var(--nen-dam)',
                    color: 'var(--chu-nguoc)',
                  },
                }}
              >
                Zalo: 0345203054
              </Button>
            </Tooltip>

            {/* Nút đổi nền sáng / tối. Đặt cạnh nhóm nút đăng nhập để ai cũng
                thấy, kể cả khách chưa có tài khoản. */}
            <Tooltip title={laToi ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}>
              <IconButton
                id="header-theme-btn"
                onClick={doiCheDo}
                size="small"
                aria-label={laToi ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}
                sx={{ color: 'var(--chu-2)', '&:hover': { color: 'var(--cam)' } }}
              >
                {laToi ? <Sun size={18} /> : <Moon size={18} />}
              </IconButton>
            </Tooltip>

            {/* Auth section */}
            {currentUser ? (
              // ── Đã đăng nhập: Avatar + Tên + Chip vai trò + Đăng xuất
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'var(--xanh-nen)', color: 'var(--chu-nguoc)', width: 34, height: 34, fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', lineHeight: 1.3 }} color="text.primary">
                    {currentUser.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={
                      currentUser.role === 'admin' ? 'Quản trị Web'
                      : currentUser.role === 'school_admin' ? 'Admin Trường'
                      : currentUser.role === 'teacher' ? 'Giáo viên'
                      : currentUser.role === 'student' ? 'Học sinh'
                      : 'Học sinh tự do'
                    }
                    sx={{
                      height: 18,
                      fontSize: '0.6rem',
                      fontWeight: 'bold',
                      bgcolor:
                        currentUser.role === 'admin' ? '#7c3aed'
                        : currentUser.role === 'school_admin' ? 'var(--xanh-troi2)'
                        : currentUser.role === 'teacher' ? '#059669'
                        : 'var(--cam)',
                      color: 'var(--chu-nguoc)',
                    }}
                  />
                  {currentUser.role === 'student' && hasAdvancedStudentTitle(currentUser.email) && (
                    <Chip
                      size="small"
                      label="HS Nâng cao 🎓"
                      sx={{
                        height: 18,
                        fontSize: '0.6rem',
                        fontWeight: 'bold',
                        bgcolor: 'var(--vang-nen)',
                        color: 'var(--chu-nguoc)',
                        ml: 0.5,
                        boxShadow: 'none',
                      }}
                    />
                  )}
                </Box>
                <Button
                  id="header-logout-btn"
                  variant="outlined"
                  size="small"
                  startIcon={<LogOut size={14} />}
                  onClick={handleLogout}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 0,
                    fontSize: '0.72rem',
                    fontWeight: 'bold',
                    borderColor: 'var(--do)',
                    color: 'var(--do)',
                    '&:hover': { bgcolor: 'var(--nen-do-nhat2)' },
                  }}
                >
                  Đăng xuất
                </Button>
              </Box>

            ) : (
              // ── Chưa đăng nhập: Đăng nhập | Đăng Ký | Dùng Thử
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  id="header-login-btn"
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/login')}
                  sx={{ textTransform: 'none', borderRadius: 0, fontSize: '0.75rem', fontWeight: 'bold', borderColor: 'var(--xanh)', color: 'var(--xanh)' }}
                >
                  Đăng Nhập
                </Button>
                <Button
                  id="header-register-btn"
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={handleRegisterRedirect}
                  sx={{
                    /* Hành động chính DUY NHẤT trên thanh này. Đỏ tín hiệu chỉ
                       xuất hiện ở đây và ở lỗi thật — dùng thêm chỗ nữa là màu
                       mất nghĩa. */
                    textTransform: 'none',
                    borderRadius: 0,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--cam-nen)',
                    color: 'var(--chu-nguoc)',
                    boxShadow: 'none',
                    '&:hover': { backgroundColor: 'var(--nen-dam)', boxShadow: 'none' },
                  }}
                >
                  Đăng Ký
                </Button>
                <Button
                  id="header-try-btn"
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 0,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: 'transparent',
                    color: 'var(--chu-dam)',
                    border: '1px solid var(--chu-dam)',
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: 'var(--nen-dam)',
                      color: 'var(--chu-nguoc)',
                      boxShadow: 'none',
                    },
                  }}
                >
                  Dùng Thử
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Container>

      {/* 2. DÒNG DƯỚI: THANH NAVIGATE MENU CHÍNH (GIỐNG HOCMAI.VN TRONG HÌNH) */}
      <Box sx={{ backgroundColor: 'var(--nen-dam)', color: 'var(--chu-nguoc)' }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              overflowX: 'auto',
              py: 0.5,
              gap: 1,
              '&::-webkit-scrollbar': { display: 'none' },
              /* Không có hai dòng này thì trên điện thoại flex bóp các nút lại
                 cho vừa bề ngang: chữ vỡ dòng, icon đè lên chữ mục kế bên.
                 Ép nút giữ nguyên bề ngang để `overflowX: auto` ở trên làm
                 đúng việc của nó là cho cuộn ngang. */
              '& > *': { flexShrink: 0, whiteSpace: 'nowrap' },
            }}
          >
            {/* Mục Các Khóa Học — ẩn qua cờ HIEN_MUC_KHOA_HOC ở đầu file */}
            {HIEN_MUC_KHOA_HOC && (
            <Button
              id="nav-courses-btn"
              onClick={() => {
                setActiveTab('hocmai');
                onLogoClick();
              }}
              startIcon={<Layers size={16} />}
              sx={{
                color: 'var(--chu-nguoc)',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 2,
                py: 1,
                borderRadius: 0,
                borderBottom: activeTab === 'hocmai' ? '3px solid var(--vang)' : '3px solid transparent',
                backgroundColor: activeTab === 'hocmai' ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
              }}
            >
              Các khóa học (Hóa 11)
            </Button>
            )}

            {/* Mục Giới Thiệu */}
            <Button
              id="nav-about-btn"
              onClick={() => {
                setActiveTab('gioithieu');
              }}
              startIcon={<Info size={16} />}
              sx={{
                color: 'var(--chu-nguoc)',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 2,
                py: 1,
                borderRadius: 0,
                borderBottom: activeTab === 'gioithieu' ? '3px solid var(--vang)' : '3px solid transparent',
                backgroundColor: activeTab === 'gioithieu' ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
              }}
            >
              Giới thiệu
            </Button>

            {/* Mục Bài Giảng Slide */}
            <Button
              id="nav-slides-btn"
              onClick={() => {
                setActiveTab('baigiang');
              }}
              startIcon={<Presentation size={16} />}
              sx={{
                color: 'var(--chu-nguoc)',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 2,
                py: 1,
                borderRadius: 0,
                whiteSpace: 'nowrap',
                borderBottom: activeTab === 'baigiang' ? '3px solid var(--vang)' : '3px solid transparent',
                backgroundColor: activeTab === 'baigiang' ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
              }}
            >
              Bài giảng
            </Button>

            {/* Mục Trò Chơi — khu game truoc day nam trong tab "Các khóa học" */}
            <Button
              id="nav-games-btn"
              onClick={() => {
                setActiveTab('trochoi');
              }}
              startIcon={<Gamepad2 size={16} />}
              sx={{
                color: 'var(--chu-nguoc)',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 2,
                py: 1,
                borderRadius: 0,
                whiteSpace: 'nowrap',
                borderBottom: activeTab === 'trochoi' ? '3px solid var(--vang)' : '3px solid transparent',
                backgroundColor: activeTab === 'trochoi' ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
              }}
            >
              Trò chơi
            </Button>

            {/* Mục iChat - Hỏi đáp với AI */}
            <Button
              id="nav-ai-chat-btn"
              onClick={() => {
                setActiveTab('ichat');
              }}
              startIcon={<MessageSquare size={16} />}
              sx={{
                color: 'var(--chu-nguoc)',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 2,
                py: 1,
                borderRadius: 0,
                borderBottom: activeTab === 'ichat' ? '3px solid var(--vang)' : '3px solid transparent',
                backgroundColor: activeTab === 'ichat' ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
              }}
            >
              iChat - Hỏi đáp với AI
            </Button>

            {/* Mục Hỗ Trợ */}
            <Button
              id="nav-support-btn"
              onClick={() => setActiveTab('hotro')}
              startIcon={<HelpCircle size={16} />}
              sx={{
                color: 'var(--chu-nguoc)',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 2,
                py: 1,
                borderRadius: 0,
                borderBottom: activeTab === 'hotro' ? '3px solid var(--vang)' : '3px solid transparent',
                backgroundColor: activeTab === 'hotro' ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
              }}
            >
              Hỗ trợ
            </Button>

            {/* ── Mục điều hướng theo VAI TRÒ ── Chỉ hiện khi đăng nhập ── */}

            {/* student → Khu vực Học sinh */}
            {currentUser && currentUser.role === 'student' && (
              <Button
                id="nav-student-area-btn"
                onClick={() => setActiveTab('hocsinh')}
                startIcon={<UserIcon size={16} />}
                sx={{
                  color: 'var(--chu-nguoc)',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 2,
                  py: 1,
                  borderRadius: 0,
                  borderBottom: activeTab === 'hocsinh' ? '3px solid var(--vang)' : '3px solid transparent',
                  backgroundColor: activeTab === 'hocsinh' ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
                }}
              >
                Học sinh
              </Button>
            )}

            {/* teacher → Trang Giáo viên */}
            {currentUser && currentUser.role === 'teacher' && (
              <Button
                id="nav-teacher-area-btn"
                onClick={() => navigate('/teacher')}
                startIcon={<GraduationCap size={16} />}
                sx={{
                  color: 'var(--vang)',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 2,
                  py: 1,
                  border: '1px solid var(--nen-vang-nhat)',
                  borderRadius: 0,
                  '&:hover': { backgroundColor: 'var(--nen-vang-nhat)' },
                }}
              >
                Giáo viên
              </Button>
            )}

            {/* school_admin → Quản trị Trường */}
            {currentUser && currentUser.role === 'school_admin' && (
              <Button
                id="nav-school-admin-area-btn"
                onClick={() => navigate('/school-admin')}
                startIcon={<Building2 size={16} />}
                sx={{
                  color: 'var(--vang)',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 2,
                  py: 1,
                  border: '1px solid var(--nen-vang-nhat)',
                  borderRadius: 0,
                  '&:hover': { backgroundColor: 'var(--nen-vang-nhat)' },
                }}
              >
                Quản trị Trường
              </Button>
            )}

            {/* admin → Quản trị Website */}
            {currentUser && currentUser.role === 'admin' && (
              <Button
                id="nav-admin-area-btn"
                onClick={() => navigate('/admin')}
                startIcon={<ShieldCheck size={16} />}
                sx={{
                  color: 'var(--vang)',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 2,
                  py: 1,
                  border: '1px solid var(--nen-vang-nhat)',
                  borderRadius: 0,
                  '&:hover': { backgroundColor: 'var(--nen-vang-nhat)' },
                }}
              >
                Quản trị Website
              </Button>
            )}
          </Box>
        </Container>
      </Box>
    </AppBar>
  );
};
