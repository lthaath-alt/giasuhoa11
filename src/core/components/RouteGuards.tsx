import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { CircularProgress, Box, Typography } from '@mui/material';

// ─── Loading Spinner ──────────────────────────────────────────────────────────

const LoadingScreen: React.FC<{ label?: string }> = ({ label = 'Đang tải...' }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 2 }}>
    <CircularProgress size={48} color="primary" />
    <Typography variant="body2" color="text.secondary">{label}</Typography>
  </Box>
);

// ─── ProtectedRoute – cho phép cả khách vãng lai ────────────────────────────

/** Dashboard học tập: học sinh, free_user VÀ khách vãng lai đều vào được. */
export const ProtectedRoute: React.FC = () => {
  const { loading } = useApp();
  if (loading) return <LoadingScreen label="Đang tải dữ liệu Gia sư..." />;
  // Khách vãng lai được phép vào; component tự giới hạn qua guestChatCount
  return <Outlet />;
};

// ─── SuperAdminRoute – chỉ admin hệ thống ─────────────────────────────────────────

export const SuperAdminRoute: React.FC = () => {
  const { currentUser, loading } = useApp();
  if (loading) return <LoadingScreen label="Đang tải cấu hình Admin Website..." />;
  if (!currentUser || currentUser.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

// ─── SchoolAdminRoute – chỉ admin trường học ────────────────────────────────────────

export const SchoolAdminRoute: React.FC = () => {
  const { currentUser, loading } = useApp();
  if (loading) return <LoadingScreen label="Đang tải cấu hình Admin Trường học..." />;
  if (!currentUser || currentUser.role !== 'school_admin') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

// ─── TeacherRoute – chỉ giáo viên ────────────────────────────────────────────

export const TeacherRoute: React.FC = () => {
  const { currentUser, loading } = useApp();
  if (loading) return <LoadingScreen label="Đang tải không gian Giáo viên..." />;
  if (!currentUser || currentUser.role !== 'teacher') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

// ─── PublicRoute – trang công khai (Login) ────────────────────────────────────

/** Nếu đã đăng nhập → redirect đến đúng trang theo role. */
export const PublicRoute: React.FC = () => {
  const { currentUser, loading } = useApp();
  if (loading) return <LoadingScreen />;

  if (currentUser) {
    if (currentUser.role === 'super_admin')  return <Navigate to="/admin" replace />;
    if (currentUser.role === 'school_admin') return <Navigate to="/school-admin" replace />;
    if (currentUser.role === 'teacher')      return <Navigate to="/teacher" replace />;
    // student, free_user → dashboard học tập
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
