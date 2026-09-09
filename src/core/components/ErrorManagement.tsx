import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip,
  TextField, FormControl, InputLabel, Select, MenuItem, LinearProgress,
  Button
} from '@mui/material';
import { ShieldAlert, AlertTriangle, Bug, ServerCrash, CheckCircle2, Trash2, Search, Database, Globe, UserCog, Info } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { ErrorLog, ErrorLogService, ErrorLevel } from '../services/errorLog';

const ERROR_LEVEL_COLORS: Record<ErrorLevel, { bg: string; color: string; icon: React.ReactNode }> = {
  'Nghiêm Trọng (Critical)': { bg: 'var(--nen-do-nhat)', color: 'var(--do)', icon: <ServerCrash size={14} /> },
  'Lỗi API/AI Service': { bg: 'var(--nen-vang-nhat)', color: 'var(--vang-dam)', icon: <Globe size={14} /> },
  'Lỗi Cơ Sở Dữ Liệu': { bg: 'var(--nen-tim-nhat)', color: 'var(--tim)', icon: <Database size={14} /> },
  'Lỗi Xác Thực/Phân Quyền': { bg: '#fce7f3', color: '#db2777', icon: <UserCog size={14} /> },
  'Lỗi Giao Diện Client': { bg: 'var(--nen-cam-nhat2)', color: 'var(--cam)', icon: <Bug size={14} /> },
  'Cảnh Báo Hệ Thống': { bg: '#fef08a', color: '#a16207', icon: <AlertTriangle size={14} /> },
  'Thông Tin Hệ Thống': { bg: 'var(--nen-xanh-nhat)', color: 'var(--xanh-troi)', icon: <Info size={14} /> }
};

export const ErrorManagement: React.FC = () => {
  const { currentUser, users } = useApp();
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const allLogs = ErrorLogService.getLogs();
    
    // Phân quyền
    if (currentUser?.role === 'admin') {
      setLogs(allLogs);
    } else {
      // School admin và teacher chỉ thấy lỗi của mình và học sinh mình
      const myStudents = users.filter(u => u.role === 'student' && u.schoolId === currentUser?.schoolId).map(u => u.email || u.username);
      const myEmails = [currentUser?.email, currentUser?.username, ...myStudents].filter(Boolean) as string[];
      setLogs(allLogs.filter(l => myEmails.includes(l.userEmail || '')));
    }
  };

  const handleResolve = (id: string) => {
    ErrorLogService.resolveError(id);
    loadLogs();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa log này?')) {
      ErrorLogService.deleteError(id);
      loadLogs();
    }
  };

  // Tính toán thống kê
  const totalLogs = logs.length;
  const unhandledLogs = logs.filter(l => l.status === 'Chưa xử lý').length;
  const criticalLogs = logs.filter(l => l.level === 'Nghiêm Trọng (Critical)' || l.level === 'Lỗi API/AI Service').length;
  const resolvedLogs = logs.filter(l => l.status === 'Đã khắc phục').length;
  const stabilityRate = totalLogs > 0 ? Math.round((resolvedLogs / totalLogs) * 100) : 100;
  
  // Tính components
  const componentMap = logs.reduce((acc, log) => {
    acc[log.component] = (acc[log.component] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const componentsList = Object.entries(componentMap).sort((a,b) => b[1] - a[1]);

  // Phân phối theo mức độ
  const levelDistribution = Object.keys(ERROR_LEVEL_COLORS).map(level => {
    const count = logs.filter(l => l.level === level).length;
    const percent = totalLogs > 0 ? Math.round((count / totalLogs) * 100) : 0;
    return { level, count, percent };
  });

  // Lọc
  const filteredLogs = logs.filter(l => {
    const matchSearch = l.message.toLowerCase().includes(search.toLowerCase()) || 
                        l.id.toLowerCase().includes(search.toLowerCase()) ||
                        l.component.toLowerCase().includes(search.toLowerCase()) ||
                        (l.userEmail || '').toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === 'all' || l.level === levelFilter;
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchLevel && matchStatus;
  });

  return (
    <Box>
      {/* ─── 4 THẺ THỐNG KÊ ────────────────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 0, border: '1px solid var(--vien)' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>TỔNG SỐ LỖI THU THẬP</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1, color: 'var(--chu-dam)' }}>{totalLogs}</Typography>
            <Typography variant="caption" color="text.secondary">Ghi nhận trên toàn hệ thống</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 0, border: '1px solid #fecaca', bgcolor: 'var(--nen-do-nhat2)' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'var(--do-dam)' }}>LỖI CHƯA XỬ LÝ (NEW)</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1, color: 'var(--do)' }}>{unhandledLogs}</Typography>
            <Typography variant="caption" sx={{ color: '#991b1b' }}>{criticalLogs} lỗi nghiêm trọng / API</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 0, border: '1px solid #bbf7d0', bgcolor: 'var(--nen-luc-nhat2)' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'var(--luc-dam)' }}>TỈ LỆ ỔN ĐỊNH NỀN TẢNG</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1, color: 'var(--luc)' }}>{stabilityRate}%</Typography>
            <Typography variant="caption" sx={{ color: 'var(--luc-dam2)' }}>Đã khắc phục: {resolvedLogs} sự cố</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 0, border: '1px solid var(--nen-tim-nhat)', bgcolor: 'var(--nen-tim-nhat2)' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4338ca' }}>NGUỒN DỮ LIỆU CẮT LỚP</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1, color: 'var(--tim)' }}>{componentsList.length}</Typography>
            <Typography variant="caption" sx={{ color: '#3730a3' }}>Module dịch vụ hoạt động</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* ─── PHÂN PHỐI LỖI THEO MỨC ĐỘ ───────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 0, border: '1px solid var(--vien)', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Phân Phối Lỗi Theo Mức Độ</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {levelDistribution.map((item, index) => {
                const config = ERROR_LEVEL_COLORS[item.level as ErrorLevel];
                return (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 220 }}>
                      <Box sx={{ p: 0.5, borderRadius: 0, bgcolor: config.bg, color: config.color, display: 'flex' }}>
                        {config.icon}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'var(--chu)' }}>
                        {item.level}
                      </Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={item.percent} 
                        sx={{ height: 8, borderRadius: 0, bgcolor: 'var(--nen-nhat)', '& .MuiLinearProgress-bar': { bgcolor: config.color } }} 
                      />
                    </Box>
                    <Box sx={{ minWidth: 80, textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{item.count} lượt</Typography>
                      <Typography variant="caption" color="text.secondary">({item.percent}%)</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {/* ─── PHÂN PHỐI SỰ CỐ THEO THÀNH PHẦN ──────────────────────────────── */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 0, border: '1px solid var(--vien)', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Phân Phối Sự Cố Theo Thành Phần</Typography>
            
            {componentsList.length === 0 ? (
              <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Chưa có thông số sự cố</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {componentsList.map(([comp, count], idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: 'var(--nen-trang)', borderRadius: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'var(--chu-dam-3)' }}>{comp}</Typography>
                    <Chip label={`${count} sự cố`} size="small" sx={{ bgcolor: 'var(--vien)', fontWeight: 'bold' }} />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* ─── DANH SÁCH LỖI CHI TIẾT ───────────────────────────────────────── */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 0, border: '1px solid var(--vien)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldAlert size={20} color="var(--do)" /> Danh sách sự cố chi tiết
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Tìm theo Mã lỗi, Nội dung, Thành phần..."
              slotProps={{ input: { startAdornment: <Search size={18} style={{ marginRight: 8, color: 'var(--chu-mo)' }} /> } }}
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ width: 300 }}
            />
            <FormControl size="small" sx={{ width: 180 }}>
              <InputLabel>Mức độ lỗi</InputLabel>
              <Select value={levelFilter} label="Mức độ lỗi" onChange={e => setLevelFilter(e.target.value)}>
                <MenuItem value="all">Tất cả mức độ</MenuItem>
                {Object.keys(ERROR_LEVEL_COLORS).map(level => (
                  <MenuItem key={level} value={level}>{level}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ width: 160 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select value={statusFilter} label="Trạng thái" onChange={e => setStatusFilter(e.target.value)}>
                <MenuItem value="all">Tất cả trạng thái</MenuItem>
                <MenuItem value="Chưa xử lý">Chưa xử lý</MenuItem>
                <MenuItem value="Đã khắc phục">Đã khắc phục</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'var(--nen-trang)' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Mã lỗi & Thời gian</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Mức độ & Thành phần</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Nội dung</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Người dùng liên quan</TableCell>
                <TableCell sx={{ fontWeight: 'bold', align: 'center' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 'bold', align: 'right' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.map(log => {
                const config = ERROR_LEVEL_COLORS[log.level];
                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold', display: 'block' }}>{log.id}</Typography>
                      <Typography variant="caption" color="text.secondary">{new Date(log.timestamp).toLocaleString('vi-VN')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={log.level} icon={React.cloneElement(config.icon as React.ReactElement<any>, { size: 12 })} sx={{ bgcolor: config.bg, color: config.color, fontWeight: 'bold', mb: 0.5, fontSize: '0.7rem' }} />
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'var(--chu)' }}>{log.component}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{log.message}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{log.userEmail}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={log.status}
                        icon={log.status === 'Đã khắc phục' ? <CheckCircle2 size={12} /> : undefined}
                        sx={{
                          bgcolor: log.status === 'Đã khắc phục' ? 'var(--nen-luc-nhat)' : 'var(--nen-do-nhat)',
                          color: log.status === 'Đã khắc phục' ? 'var(--luc)' : 'var(--do)',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {log.status === 'Chưa xử lý' && (
                        <Tooltip title="Đánh dấu đã xử lý">
                          <IconButton size="small" onClick={() => handleResolve(log.id)} sx={{ color: 'var(--luc)' }}>
                            <CheckCircle2 size={18} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Xóa log">
                        <IconButton size="small" onClick={() => handleDelete(log.id)} sx={{ color: 'var(--do)' }}>
                          <Trash2 size={18} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    Không có log lỗi nào phù hợp với bộ lọc hiện tại.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ErrorManagement;
