import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useCheDoMau } from './core/hooks/useCheDoMau';
import { CssBaseline } from '@mui/material';
import { AppProvider } from './core/contexts/AppContext';

// Routes and Guards
import { PublicRoute, ProtectedRoute, SuperAdminRoute, SchoolAdminRoute, TeacherRoute } from './core/components/RouteGuards';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import SchoolAdminPage from './pages/SchoolAdminPage';
import TeacherPage from './pages/TeacherPage';
import QuizPage from './pages/QuizPage';
import NotFoundPage from './pages/NotFoundPage';

// Tạo theme Material-UI cao cấp theo tone màu Giáo Viên Đổi Mới (Sáng, Cam & Teal)
const themeGoc = {
  /* CHÚ Ý: palette của MUI phải là MÀU THẬT, không dùng var(--…).
     MUI tự tính sắc độ đậm/nhạt và màu chữ tương phản từ các giá trị này bằng
     hàm darken/lighten — đưa biến CSS vào thì nó không đọc ra số nào để tính và
     hỏng cả bảng màu. Phần nền tối được xử lý bằng cách dựng lại theme ở dưới,
     chứ không phải bằng biến CSS. */
  palette: {
    mode: 'light',
    primary: {
      main: '#ea580c', // Cam đổi mới (Orange 600)
      // MUI lay `light` lam GOC de tinh mau cho <Alert>: chu la darken(light,0.6),
      // nen la lighten(light,0.9). De `light` la mot mau co ALPHA thi ca hai deu
      // ke thua do trong suot -- do duoc chu ra rgba(98,63,4,0.08), tuc mo 8%,
      // gan nhu vo hinh. Bang mau TOI da sua tu truoc; bang SANG con sot.
      // Phai la mau DAC. Xem chu thich dau khoi palette.
      light: '#fb923c', // Orange 400
      dark: '#c2410c', // Cam sẫm (Orange 700)
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0f766e', // Teal 700 (Màu tri thức giáo dục)
      light: '#14b8a6', // Teal 500
      dark: '#115e59', // Teal 800
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b', // Amber 500
      light: '#fbbf24', // Amber 400
      dark: '#d97706',
    },
    success: {
      main: '#0f766e', // Sử dụng Teal làm màu thành công thay vì xanh lá thông thường
      light: '#14b8a6', // Teal 500
      dark: '#115e59',
    },
    background: {
      default: '#f8fafc', // Nền sáng Slate 50 tinh khiết của GiaoVienDoiMoi
      paper: '#ffffff', // Nền các card/panel màu trắng tinh tế
    },
    text: {
      primary: '#0f172a', // Slate 900 cho độ tương phản đọc cực cao
      secondary: '#475569', // Slate 600 cho chữ phụ đề rõ ràng
    },
    divider: '#e2e8f0', // Viền Slate 200 mềm mại, tinh sạch
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 800,
      letterSpacing: '-1px',
    },
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.5px',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.3px',
    },
    h6: {
      fontWeight: 700,
    },
    subtitle1: {
      fontWeight: 600,
    },
    subtitle2: {
      fontWeight: 600,
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none',
          padding: '8px 18px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.15)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
          border: '1px solid var(--vien)', // Viền mỏng tinh tế
          backgroundColor: 'var(--nen-the)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
          border: '1px solid var(--vien)',
          backgroundColor: 'var(--nen-the)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '& fieldset': {
              borderColor: 'var(--vien)',
            },
            '&:hover fieldset': {
              borderColor: 'var(--cam)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'var(--cam)',
            },
          },
        },
      },
    },
  },
};

const theme = createTheme(themeGoc as any);

export default function App() {
  /* Cho các thành phần MUI (hộp thoại, ô nhập, bảng…) đổi theo nền tối.
     Phần giao diện tự viết đã dùng biến màu trong index.css rồi, nhưng MUI tự
     vẽ nền trắng của riêng nó — không đổi mode thì hộp thoại vẫn trắng loá
     giữa trang tối. */
  const { laToi } = useCheDoMau();
  const themeDangDung = useMemo(
    () => (laToi
      ? createTheme({
          ...themeGoc,
          palette: {
            ...(themeGoc as any).palette,
            mode: 'dark',
            background: { default: '#0f151d', paper: '#18212c' },
            text: { primary: '#e8eef5', secondary: '#a8b8c8' },
            divider: '#2c3947',
            /* PHẢI đặt lại `light` cho từng màu, không được để nguyên bản sáng.
               Ở bản sáng, `light` là rgba trong suốt 8% — dùng làm nền phớt cho
               các vùng nhấn, đúng vai. Nhưng ở nền tối MUI lại lấy CHÍNH `light`
               làm MÀU CHỮ cho <Alert>, <Chip>, nút outlined… Chữ màu rgba 8%
               nghĩa là gần như trong suốt: băng "Em đang dùng bản dùng thử" mờ
               tới mức không đọc nổi. Đây là lỗi ăn vào 66 chỗ dùng <Alert>, sửa
               một chỗ này là hết. */
            /* Cam ở nền tối đậm hơn một bậc (#ea580c → #c2410c, chính là
               primary.dark của bản sáng). Chữ trắng trên #ea580c chỉ đạt
               3,56 — dưới mức đọc được cho cỡ chữ 14px; đổi sang #c2410c
               lên 5,18 mà vẫn đúng màu cam thương hiệu, lại đỡ chói trên
               nền đậm. CỐ Ý chỉ đổi ở nền tối: nền sáng giữ nguyên. */
            primary:   { ...(themeGoc as any).palette.primary,   main: '#c2410c', light: '#ff9a5c' },
            secondary: { ...(themeGoc as any).palette.secondary, light: '#5fc8bd' },
            warning:   { ...(themeGoc as any).palette.warning,   light: '#fbbf24' },
            success:   { ...(themeGoc as any).palette.success,   light: '#5fc8bd' },
            error:     { main: '#ef4444', light: '#ff9a9a', dark: '#b91c1c' },
            info:      { main: '#4da3ec', light: '#8ec5f5', dark: '#1e6fb8' },
          },
        })
      : theme),
    [laToi],
  );

  return (
    <ThemeProvider theme={themeDangDung}>
      <CssBaseline />
      <AppProvider>
        <HashRouter>
          <Routes>
            {/* PUBLIC ROUTES (Chỉ khi chưa đăng nhập) */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* PROTECTED STUDY ROUTES (Học sinh & Khách vãng lai dùng thử) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/quiz/:quizId" element={<QuizPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* SUPER ADMIN ONLY ROUTES */}
            <Route element={<SuperAdminRoute />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            {/* SCHOOL ADMIN ONLY ROUTES */}
            <Route element={<SchoolAdminRoute />}>
              <Route path="/school-admin" element={<SchoolAdminPage />} />
            </Route>

            {/* TEACHER ONLY ROUTES */}
            <Route element={<TeacherRoute />}>
              <Route path="/teacher" element={<TeacherPage />} />
            </Route>

            {/* 404 NOT FOUND */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </HashRouter>
      </AppProvider>
    </ThemeProvider>
  );
}
