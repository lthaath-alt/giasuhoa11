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
      main: '#C4000E', // Đỏ tín hiệu — màu viền thoi trên nhãn cảnh báo hoá chất.
                       // CHỈ dùng cho hành động chính và lỗi thật, không trang trí.
      // MUI lay `light` lam GOC de tinh mau cho <Alert>: chu la darken(light,0.6),
      // nen la lighten(light,0.9). De `light` la mot mau co ALPHA thi ca hai deu
      // ke thua do trong suot -- do duoc chu ra var(--nen-vang-nhat), tuc mo 8%,
      // gan nhu vo hinh. Bang mau TOI da sua tu truoc; bang SANG con sot.
      // Phai la mau DAC. Xem chu thich dau khoi palette.
      light: '#E85D5D',
      dark: '#8C000C',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0F5A44', // Lục phòng thí nghiệm — vai phụ, dùng cho trạng thái an toàn
      light: '#2E8B6D',
      dark: '#0A4231',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#F5C400', // Vàng cảnh báo — băng kẻ chéo trong phòng thí nghiệm
      light: '#FFD640',
      dark: '#B38F00',
    },
    success: {
      main: '#17603A',
      light: '#2E8B5A',
      dark: '#0F4527',
    },
    background: {
      default: '#F2F1ED', // Giấy nhãn
      paper: '#FFFFFF',   // Mặt nhãn
    },
    text: {
      primary: '#121210',  // Mực
      secondary: '#4D4D47',
    },
    /* Lỗi thật dùng ĐÚNG màu đỏ tín hiệu của hành động chính. Trên nhãn hoá
       chất chỉ có MỘT màu báo động; tách ra hai sắc đỏ khác nhau là làm loãng nó. */
    error: { main: '#C4000E', light: '#E85D5D', dark: '#8C000C', contrastText: '#ffffff' },
    info: { main: '#14508C', light: '#5B8FC9', dark: '#0E3A66', contrastText: '#ffffff' },
    divider: '#CBC9C0', // Đường kẻ — thế giới này dựng bằng nét kẻ, không bằng bóng đổ
  },
  /* Bán kính duy nhất của hình dạng: 0. Mọi thành phần MUI không tự khai
     borderRadius sẽ vuông góc — Menu, Popover, Snackbar, Accordion, Slider…
     Sửa ở đây rẻ hơn nhiều so với đi đổi từng chỗ. */
  shape: { borderRadius: 0 },
  typography: {
    // Inter cho chữ thân bài; Archivo cho GIỌNG HIỂN THỊ. Archivo là grotesque
    // công nghiệp gốc từ chữ biển báo — đúng thế giới nhãn cảnh báo, và Impeccable
    // cấm lấy Inter làm giọng hiển thị vì nó là phông giao diện, không có quan điểm.
    fontFamily: '"Inter", system-ui, sans-serif',
    h1: { fontFamily: '"Archivo", system-ui, sans-serif', fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Archivo", system-ui, sans-serif', fontWeight: 800, letterSpacing: '-0.02em' },
    overline: { fontFamily: '"Archivo", system-ui, sans-serif', fontWeight: 700, letterSpacing: '0.12em' },
    h3: {
      fontFamily: '"Archivo", system-ui, sans-serif',
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontFamily: '"Archivo", system-ui, sans-serif',
      fontWeight: 800,
      letterSpacing: '-0.5px',
    },
    h5: {
      fontFamily: '"Archivo", system-ui, sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontFamily: '"Archivo", system-ui, sans-serif',
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
      fontFamily: '"Archivo", system-ui, sans-serif',
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: '0.01em',
    },
  },
  components: {
    /* Bóng đổ mềm là ngôn ngữ của thế giới cũ ("thẻ nổi trên nền"). Thế giới
       nhãn dựng bằng NÉT KẺ: một mặt phẳng giấy, các ô chia bằng đường mực. Vì
       vậy mọi mặc định boxShadow của MUI bị tắt, và độ sâu được diễn đạt bằng ĐỘ
       ĐẬM của viền thay vì bằng độ nhòe của bóng. */
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          padding: '8px 18px',
          transition: 'background-color 0.15s linear, color 0.15s linear',
          '&:hover': { boxShadow: 'none' },
        },
        outlined: { borderWidth: '1px' },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid var(--vien)',
          backgroundColor: 'var(--nen-the)',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid var(--vien)',
          backgroundColor: 'var(--nen-the)',
          backgroundImage: 'none',
        },
      },
    },
    /* Mặt NỔI lên trên (hộp thoại, menu, gợi ý) không còn bóng đổ để tách khỏi
       nền, nên phải tách bằng viền MỰC đậm — giống mép một tờ nhãn dán đè lên. */
    MuiDialog: { styleOverrides: { paper: { border: '2px solid var(--chu-dam)' } } },
    MuiMenu: { styleOverrides: { paper: { border: '2px solid var(--chu-dam)' } } },
    MuiPopover: { styleOverrides: { paper: { border: '2px solid var(--chu-dam)' } } },
    MuiAutocomplete: { styleOverrides: { paper: { border: '2px solid var(--chu-dam)' } } },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 0,
          backgroundColor: 'var(--nen-dam)',
          color: 'var(--chu-nguoc)',
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '6px 10px',
        },
        arrow: { color: 'var(--nen-dam)' },
      },
    },
    /* Chip là NHÃN NHỏ: chữ nhật, chữ đậm, không phải viên kẹo bo tròn. */
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 0, fontWeight: 700, letterSpacing: '0.02em' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            '& fieldset': { borderColor: 'var(--vien)' },
            '&:hover fieldset': { borderColor: 'var(--chu-dam)' },
            '&.Mui-focused fieldset': { borderColor: 'var(--cam)', borderWidth: '2px' },
          },
        },
      },
    },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 0 } } },
    MuiToggleButton: { styleOverrides: { root: { borderRadius: 0 } } },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 0, height: 6, backgroundColor: 'var(--nen-nhat)' },
        bar: { borderRadius: 0 },
      },
    },
    /* Gạch chân tab là một nét mực dày, không phải vệt màu mờ. */
    MuiTabs: { styleOverrides: { indicator: { height: 3, backgroundColor: 'var(--cam-nen)' } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 700, minHeight: 44 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 0 } } },
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
            /* Bản tối của thế giới nhãn: giấy đen, mực sáng. Các giá trị này trùng
               khớp với :root[data-theme="dark"] trong index.css — hai hệ phải nói cùng
               một thứ, không thì chữ MUI ngồi trên nền CSS khác hệ và tương phản tụt
               mà build vẫn xanh. */
            background: { default: '#0D0D0B', paper: '#161613' },
            text: { primary: '#F3F2ED', secondary: '#AEADA5' },
            divider: '#34342E',
            /* PHẢI đặt lại `light` cho từng màu, không được để nguyên bản sáng.
               Ở nền tối MUI lấy CHÍNH `light` làm MÀU CHỮ cho <Alert>, <Chip>, nút
               outlined… nên nó phải là sắc ĐÃ LÀM SÁNG cho nền đậm, không phải sắc
               nhạt của bản sáng. Đây là lỗi từng ăn vào 66 chỗ dùng <Alert>. Còn
               `main` thì ngược lại: nó là NỀN nút mang chữ trắng nên giữ độ đậm. */
            primary:   { main: '#C4000E', light: '#FF5A50', dark: '#8C000C', contrastText: '#ffffff' },
            secondary: { main: '#0F5A44', light: '#4FC9A5', dark: '#0A4231', contrastText: '#ffffff' },
            warning:   { main: '#D9A600', light: '#F0BE2E', dark: '#8F6E00' },
            success:   { main: '#17603A', light: '#4ADE80', dark: '#0F4527' },
            error:     { main: '#C4000E', light: '#FF5A50', dark: '#8C000C', contrastText: '#ffffff' },
            info:      { main: '#14508C', light: '#6BA9EE', dark: '#0E3A66', contrastText: '#ffffff' },
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
