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
} from 'lucide-react';
import { User } from '../../auth/types';
import { useApp } from '../../../core/hooks/useApp';
import { Lesson } from '../types';

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
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
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
              setActiveTab('hocmai');
              onLogoClick();
            }}
          >
            {/* Biểu tượng HOCMAI */}
            <Box
              sx={{
                p: 1,
                backgroundColor: '#0062b8',
                borderRadius: '50% 12px 50% 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0, 98, 184, 0.25)',
              }}
            >
              <BookOpen size={24} color="#ffffff" />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.5px',
                  color: '#0062b8',
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
                  color: '#ea580c',
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
                borderRadius: 20,
                backgroundColor: '#f1f5f9',
                px: 2,
                py: 0.8,
                border: '1px solid transparent',
                '&:focus-within': {
                  borderColor: '#0062b8',
                  backgroundColor: '#ffffff',
                },
              }}
            >
              <Search size={16} color="#0062b8" style={{ marginLeft: 6 }} />
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
                  color: '#1e293b',
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
                  borderRadius: 3,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0',
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
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '#f1f5f9',
                        },
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0062b8' }}>
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
                onClick={() => window.open('https://zalo.me', '_blank')}
                sx={{
                  backgroundColor: '#0084ff',
                  color: '#ffffff',
                  borderRadius: 20,
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  px: 2,
                  py: 0.6,
                  '&:hover': {
                    backgroundColor: '#006ed4',
                  },
                }}
              >
                Zalo: 0345203054
              </Button>
            </Tooltip>

            {/* Auth section */}
            {currentUser ? (
              // ── Đã đăng nhập: Avatar + Tên + Chip vai trò + Đăng xuất
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: '#0062b8', color: '#ffffff', width: 34, height: 34, fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', lineHeight: 1.3 }} color="text.primary">
                    {currentUser.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={
                      currentUser.role === 'super_admin' ? 'Quản trị Web'
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
                        currentUser.role === 'super_admin' ? '#7c3aed'
                        : currentUser.role === 'school_admin' ? '#0369a1'
                        : currentUser.role === 'teacher' ? '#059669'
                        : '#ea580c',
                      color: '#fff',
                    }}
                  />
                  {(currentUser.role === 'student' || currentUser.role === 'free_user') && hasAdvancedStudentTitle(currentUser.email) && (
                    <Chip
                      size="small"
                      label="HS Nâng cao 🎓"
                      sx={{
                        height: 18,
                        fontSize: '0.6rem',
                        fontWeight: 'bold',
                        bgcolor: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                        color: '#fff',
                        ml: 0.5,
                        boxShadow: '0 2px 4px rgba(234,88,12,0.3)',
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
                    borderRadius: 20,
                    fontSize: '0.72rem',
                    fontWeight: 'bold',
                    borderColor: '#dc2626',
                    color: '#dc2626',
                    '&:hover': { bgcolor: '#fef2f2' },
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
                  sx={{ textTransform: 'none', borderRadius: 20, fontSize: '0.75rem', fontWeight: 'bold', borderColor: '#0062b8', color: '#0062b8' }}
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
                    textTransform: 'none',
                    borderRadius: 20,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    backgroundColor: '#ff9900',
                    color: '#ffffff',
                    '&:hover': { backgroundColor: '#e68a00' },
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
                    borderRadius: 20,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    backgroundColor: '#0f766e',
                    color: '#ffffff',
                    '&:hover': { backgroundColor: '#0d635c' },
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
      <Box sx={{ backgroundColor: '#0062b8', color: '#ffffff' }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              overflowX: 'auto',
              py: 0.5,
              gap: 1,
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {/* Mục Các Khóa Học */}
            <Button
              id="nav-courses-btn"
              onClick={() => {
                setActiveTab('hocmai');
                onLogoClick();
              }}
              startIcon={<Layers size={16} />}
              sx={{
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 2,
                py: 1,
                borderRadius: 0,
                borderBottom: activeTab === 'hocmai' ? '3px solid #ff9900' : '3px solid transparent',
                backgroundColor: activeTab === 'hocmai' ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
              }}
            >
              Các khóa học (Hóa 11)
            </Button>

            {/* Mục Bài Giảng Slide */}
            <Button
              id="nav-slides-btn"
              onClick={() => {
                setActiveTab('baigiang');
              }}
              startIcon={<Presentation size={16} />}
              sx={{
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 2,
                py: 1,
                borderRadius: 0,
                whiteSpace: 'nowrap',
                borderBottom: activeTab === 'baigiang' ? '3px solid #ff9900' : '3px solid transparent',
                backgroundColor: activeTab === 'baigiang' ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
              }}
            >
              Bài giảng
            </Button>

            {/* Mục Giới Thiệu */}
            <Button
              id="nav-about-btn"
              onClick={() => {
                setActiveTab('gioithieu');
              }}
              startIcon={<Info size={16} />}
              sx={{
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 2,
                py: 1,
                borderRadius: 0,
                borderBottom: activeTab === 'gioithieu' ? '3px solid #ff9900' : '3px solid transparent',
                backgroundColor: activeTab === 'gioithieu' ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
              }}
            >
              Giới thiệu
            </Button>

            {/* Mục iChat - Hỏi đáp với AI */}
            <Button
              id="nav-ai-chat-btn"
              onClick={() => {
                setActiveTab('ichat');
              }}
              startIcon={<MessageSquare size={16} />}
              sx={{
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 2,
                py: 1,
                borderRadius: 0,
                borderBottom: activeTab === 'ichat' ? '3px solid #ff9900' : '3px solid transparent',
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
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 2,
                py: 1,
                borderRadius: 0,
                borderBottom: activeTab === 'hotro' ? '3px solid #ff9900' : '3px solid transparent',
                backgroundColor: activeTab === 'hotro' ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
              }}
            >
              Hỗ trợ
            </Button>

            {/* ── Mục điều hướng theo VAI TRÒ ── Chỉ hiện khi đăng nhập ── */}

            {/* student, free_user → Khu vực Học sinh */}
            {currentUser && (currentUser.role === 'student' || currentUser.role === 'free_user') && (
              <Button
                id="nav-student-area-btn"
                onClick={() => setActiveTab('hocsinh')}
                startIcon={<UserIcon size={16} />}
                sx={{
                  color: '#ffffff',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 2,
                  py: 1,
                  borderRadius: 0,
                  borderBottom: activeTab === 'hocsinh' ? '3px solid #ff9900' : '3px solid transparent',
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
                  color: '#ff9900',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 2,
                  py: 1,
                  border: '1px solid rgba(255,153,0,0.4)',
                  borderRadius: 2,
                  '&:hover': { backgroundColor: 'rgba(255,153,0,0.15)' },
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
                  color: '#ff9900',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 2,
                  py: 1,
                  border: '1px solid rgba(255,153,0,0.4)',
                  borderRadius: 2,
                  '&:hover': { backgroundColor: 'rgba(255,153,0,0.15)' },
                }}
              >
                Quản trị Trường
              </Button>
            )}

            {/* super_admin → Quản trị Website */}
            {currentUser && currentUser.role === 'super_admin' && (
              <Button
                id="nav-admin-area-btn"
                onClick={() => navigate('/admin')}
                startIcon={<ShieldCheck size={16} />}
                sx={{
                  color: '#ff9900',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 2,
                  py: 1,
                  border: '1px solid rgba(255,153,0,0.4)',
                  borderRadius: 2,
                  '&:hover': { backgroundColor: 'rgba(255,153,0,0.15)' },
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
