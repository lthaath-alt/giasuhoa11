import React, { useState, ReactNode } from 'react';
import {
  Box,
  Typography,
  Paper,
  useMediaQuery,
  useTheme,
  IconButton,
  Drawer,
} from '@mui/material';
import {
  Users,
  GraduationCap,
  BookOpen,
  Database,
  Key,
  AlertTriangle,
  Shield,
  Menu,
  X,
  Construction,
} from 'lucide-react';

// ─── Sidebar menu items ───────────────────────────────────────────────────────

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'accounts',   label: 'Quản lý Tài khoản',          icon: <Users size={18} /> },
  { id: 'classes',    label: 'Quản lý Lớp học',             icon: <GraduationCap size={18} /> },
  { id: 'library',    label: 'Quản lý Kho bài tập chung',   icon: <BookOpen size={18} /> },
  { id: 'databank',   label: 'Ngân hàng dữ liệu',          icon: <Database size={18} /> },
  { id: 'password',   label: 'Quản lý Mật khẩu',           icon: <Key size={18} /> },
  { id: 'errors',     label: 'Chỉ số Lỗi Hệ thống',        icon: <AlertTriangle size={18} /> },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  topLabel: string;
  mainContent: string;
  description: string;
  accentColor: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ topLabel, mainContent, description, accentColor, icon, onClick }) => (
  <Paper
    onClick={onClick}
    sx={{
      p: 2.5,
      borderRadius: 3,
      cursor: 'pointer',
      border: '1px solid #e2e8f0',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
        borderColor: accentColor,
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '4px',
        height: '100%',
        backgroundColor: accentColor,
        borderRadius: '4px 0 0 4px',
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      <Box
        sx={{
          p: 1.2,
          borderRadius: 2,
          bgcolor: `${accentColor}14`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="overline"
          sx={{
            fontWeight: 'bold',
            color: '#64748b',
            fontSize: '0.65rem',
            letterSpacing: '0.08em',
            lineHeight: 1.2,
            display: 'block',
            mb: 0.3,
          }}
        >
          {topLabel}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.2,
            fontSize: { xs: '1rem', md: '1.15rem' },
          }}
        >
          {mainContent}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: '#94a3b8', fontSize: '0.7rem', mt: 0.3, display: 'block' }}
        >
          {description}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

// ─── Placeholder component ────────────────────────────────────────────────────

const PlaceholderContent: React.FC<{ title: string }> = ({ title }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 350,
      gap: 2,
      borderRadius: 3,
      border: '2px dashed #e2e8f0',
      bgcolor: '#f8fafc',
    }}
  >
    <Box sx={{ p: 2, bgcolor: 'rgba(234,88,12,0.06)', borderRadius: '50%' }}>
      <Construction size={36} color="#ea580c" />
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#475569' }}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      🔧 Đang xây dựng — sẽ hoàn thiện ở Prompt tiếp theo
    </Typography>
  </Box>
);

// ─── ManagementLayout ─────────────────────────────────────────────────────────

export interface ManagementLayoutProps {
  /** Tên vai trò hiển thị: "Quản trị Website" | "Quản trị Trường học" | "Giáo viên" */
  roleName: string;
  /** Số lớp học trong phạm vi */
  classCount: number;
  /** Số tài khoản trong phạm vi */
  accountCount: number;
  /** Số câu hỏi trong ngân hàng */
  questionCount: number;
  /** Số đề kiểm tra */
  examCount: number;
  /** Nội dung tùy chỉnh cho mục "Quản lý Lớp học" — gắn component có sẵn */
  classContent?: ReactNode;
  /** Nội dung tùy chỉnh cho mục "Quản lý Tài khoản" */
  accountContent?: ReactNode;
  /** Nội dung tùy chỉnh cho mục "Kho bài tập chung" */
  libraryContent?: ReactNode;
  /** Nội dung tùy chỉnh cho mục "Ngân hàng dữ liệu" */
  databankContent?: ReactNode;
  /** Nội dung tùy chỉnh cho mục "Quản lý Mật khẩu" */
  passwordContent?: ReactNode;
  /** Nội dung tùy chỉnh cho mục "Chỉ số Lỗi Hệ thống" */
  errorContent?: ReactNode;
}

export const ManagementLayout: React.FC<ManagementLayoutProps> = ({
  roleName,
  classCount,
  accountCount,
  questionCount,
  examCount,
  classContent,
  accountContent,
  libraryContent,
  databankContent,
  passwordContent,
  errorContent,
}) => {
  const [activeItem, setActiveItem] = useState('accounts');
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleStatClick = (targetItem: string) => {
    setActiveItem(targetItem);
    if (isMobile) setMobileOpen(false);
  };

  // ── Render nội dung bên phải theo mục đang chọn ──────────────────────────

  const renderContent = () => {
    switch (activeItem) {
      case 'classes':
        return classContent || <PlaceholderContent title="Quản lý Lớp học" />;
      case 'accounts':
        return accountContent || <PlaceholderContent title="Quản lý Tài khoản" />;
      case 'library':
        return libraryContent || <PlaceholderContent title="Quản lý Kho bài tập chung" />;
      case 'databank':
        return databankContent || <PlaceholderContent title="Ngân hàng dữ liệu" />;
      case 'password':
        return passwordContent || <PlaceholderContent title="Quản lý Mật khẩu" />;
      case 'errors':
        return errorContent || <PlaceholderContent title="Chỉ số Lỗi Hệ thống" />;
      default:
        return <PlaceholderContent title="Quản lý Tài khoản" />;
    }
  };

  // ── Sidebar content (dùng chung cho desktop + drawer mobile) ─────────────

  const sidebarContent = (
    <Box sx={{ py: 2 }}>
      <Typography
        variant="overline"
        sx={{
          px: 2.5,
          mb: 1,
          display: 'block',
          fontWeight: 'bold',
          color: '#94a3b8',
          fontSize: '0.65rem',
          letterSpacing: '0.12em',
        }}
      >
        TỔNG QUAN
      </Typography>

      {SIDEBAR_ITEMS.map((item) => {
        const isActive = activeItem === item.id;
        return (
          <Box
            key={item.id}
            onClick={() => {
              setActiveItem(item.id);
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2.5,
              py: 1.4,
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.15s ease',
              bgcolor: isActive ? 'rgba(234, 88, 12, 0.06)' : 'transparent',
              color: isActive ? '#ea580c' : '#475569',
              fontWeight: isActive ? 700 : 500,
              '&:hover': {
                bgcolor: isActive ? 'rgba(234, 88, 12, 0.08)' : '#f1f5f9',
                color: isActive ? '#ea580c' : '#0f172a',
              },
              '&::before': isActive
                ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '15%',
                    bottom: '15%',
                    width: '3.5px',
                    borderRadius: '0 4px 4px 0',
                    backgroundColor: '#ea580c',
                  }
                : {},
            }}
          >
            <Box sx={{ display: 'flex', flexShrink: 0 }}>{item.icon}</Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );

  return (
    <Box sx={{ flex: 1, py: { xs: 2, md: 3 }, px: { xs: 1.5, md: 3 } }}>
      {/* ── STAT CARDS (4 thẻ ngang) ───────────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: { xs: 1.5, md: 2 },
          mb: { xs: 2, md: 3 },
        }}
      >
        <StatCard
          topLabel="QUYỀN TRUY CẬP"
          mainContent={roleName}
          description="Nhấp để đổi mật khẩu bảo mật"
          accentColor="#ea580c"
          icon={<Shield size={20} color="#ea580c" />}
          onClick={() => handleStatClick('password')}
        />
        <StatCard
          topLabel="QUẢN LÝ LỚP HỌC"
          mainContent={`${classCount} Lớp học`}
          description="Nhấp để đi nhanh tới quản lý lớp"
          accentColor="#0f766e"
          icon={<GraduationCap size={20} color="#0f766e" />}
          onClick={() => handleStatClick('classes')}
        />
        <StatCard
          topLabel="QUẢN LÝ TÀI KHOẢN"
          mainContent={`${accountCount} Tài khoản`}
          description="Nhấp để đi nhanh tới quản lý tài khoản"
          accentColor="#6366f1"
          icon={<Users size={20} color="#6366f1" />}
          onClick={() => handleStatClick('accounts')}
        />
        <StatCard
          topLabel="NGÂN HÀNG DỮ LIỆU"
          mainContent={`${questionCount} Câu hỏi & ${examCount} Đề`}
          description="Nhấp để đi nhanh tới ngân hàng dữ liệu"
          accentColor="#f59e0b"
          icon={<Database size={20} color="#f59e0b" />}
          onClick={() => handleStatClick('databank')}
        />
      </Box>

      {/* ── MOBILE: Hamburger + Drawer ──────────────────────────────────────── */}
      {isMobile && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{
                bgcolor: '#f1f5f9',
                borderRadius: 2,
                '&:hover': { bgcolor: '#e2e8f0' },
              }}
            >
              <Menu size={20} />
            </IconButton>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#475569' }}>
              {SIDEBAR_ITEMS.find((i) => i.id === activeItem)?.label || 'Menu'}
            </Typography>
          </Box>
          <Drawer
            anchor="left"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            sx={{
              '& .MuiDrawer-paper': { width: 260, borderRadius: '0 16px 16px 0' }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
              <IconButton onClick={() => setMobileOpen(false)}>
                <X size={18} />
              </IconButton>
            </Box>
            {sidebarContent}
          </Drawer>
        </>
      )}

      {/* ── DESKTOP: Sidebar trái + Content phải ───────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 0, md: 2.5 },
          minHeight: 500,
        }}
      >
        {/* Sidebar (desktop only) */}
        {!isMobile && (
          <Paper
            elevation={0}
            sx={{
              width: 240,
              flexShrink: 0,
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              alignSelf: 'flex-start',
              position: 'sticky',
              top: 16,
              overflow: 'hidden',
            }}
          >
            {sidebarContent}
          </Paper>
        )}

        {/* Content area */}
        <Box sx={{ flex: 1, minWidth: 0 }}>{renderContent()}</Box>
      </Box>
    </Box>
  );
};

export default ManagementLayout;
