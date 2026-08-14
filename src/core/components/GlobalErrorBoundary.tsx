import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorLogService } from '../services/errorLog';
import { Box, Typography, Button } from '@mui/material';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    ErrorLogService.logError({
      level: 'Lỗi Giao Diện Client',
      component: 'GlobalErrorBoundary',
      message: error.message || 'Lỗi không xác định',
      userEmail: 'Hệ thống Client'
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', p: 3, textAlign: 'center' }}>
          <AlertTriangle size={64} color="#ef4444" style={{ marginBottom: 16 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0f172a', mb: 2 }}>
            Đã xảy ra lỗi giao diện
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
            Hệ thống vừa gặp một sự cố khi hiển thị giao diện. Lỗi này đã được tự động ghi nhận vào hệ thống để ban quản trị xử lý.
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Tải lại trang
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
