import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ea580c', // Cam đổi mới (Orange 600)
      light: 'rgba(234, 88, 12, 0.08)',
      dark: '#c2410c', // Cam sẫm (Orange 700)
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0f766e', // Teal 700 (Màu tri thức giáo dục)
      light: 'rgba(15, 118, 110, 0.08)',
      dark: '#115e59', // Teal 800
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b', // Amber 500
      light: 'rgba(245, 158, 11, 0.08)',
      dark: '#d97706',
    },
    success: {
      main: '#0f766e', // Sử dụng Teal làm màu thành công thay vì xanh lá thông thường
      light: 'rgba(15, 118, 110, 0.08)',
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
          border: '1px solid #e2e8f0', // Viền mỏng tinh tế
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '& fieldset': {
              borderColor: '#e2e8f0',
            },
            '&:hover fieldset': {
              borderColor: '#ea580c',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ea580c',
            },
          },
        },
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
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
