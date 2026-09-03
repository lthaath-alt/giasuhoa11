import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Avatar,
  Chip,
  Button,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { Check, X, Trash2, Database, Users } from 'lucide-react';
import { User } from '../../auth/types';
import { FirestoreAccountManager } from './FirestoreAccountManager';

interface AccountsTabProps {
  students: User[];
  approveUser: (email: string) => void;
  rejectUser: (email: string) => void;
  deleteUser: (email: string) => void;
  hideFirestoreTab?: boolean;
}

export const AccountsTab: React.FC<AccountsTabProps> = ({
  students,
  approveUser,
  rejectUser,
  deleteUser,
  hideFirestoreTab = false,
}) => {
  const [subTab, setSubTab] = useState<'firestore' | 'local'>(hideFirestoreTab ? 'local' : 'firestore');

  return (
    <Box id="admin-tab-accounts" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Sub Tabs: Chuyển đổi giữa Firestore Manager và Local Accounts */}
      {!hideFirestoreTab && (
      <Paper elevation={0} sx={{ p: 0.5, borderRadius: 3, border: '1px solid var(--vien)', backgroundColor: 'var(--nen-the)' }}>
        <Tabs
          value={subTab}
          onChange={(_, val) => setSubTab(val)}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: 2,
              minHeight: 38,
              px: 2,
              mr: 0.5,
              color: 'var(--chu)',
              transition: 'all 0.2s',
              fontSize: '0.88rem',
              '&:hover': { backgroundColor: 'var(--nen-nhat)', color: 'var(--chu-dam)' },
              '&.Mui-selected': { color: 'var(--cam)', backgroundColor: 'rgba(234, 88, 12, 0.08)' }
            },
            '& .MuiTabs-indicator': { backgroundColor: 'var(--cam-nen)' }
          }}
        >
          <Tab
            value="firestore"
            label="Quản lý Tài khoản Firestore"
            icon={<Database size={16} />}
            iconPosition="start"
          />
          <Tab
            value="local"
            label="Tài khoản Local / Chờ duyệt"
            icon={<Users size={16} />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>
      )}

      {/* Hiển thị Manager Firestore theo yêu cầu bài toán */}
      {subTab === 'firestore' && <FirestoreAccountManager />}

      {/* Danh sách Local Accounts cũ */}
      {subTab === 'local' && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid var(--vien)', backgroundColor: 'var(--nen-the)' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: 'var(--nen-trang)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Học sinh</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Ngày đăng ký</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', textAlign: 'center' }}>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Chưa có tài khoản học sinh nào được đăng ký trong hệ thống.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((student) => {
                      let statusColor: 'warning' | 'success' | 'error' = 'warning';
                      let statusLabel = 'Chờ duyệt';
                      if (student.status === 'active') {
                        statusColor = 'success';
                        statusLabel = 'Đã kích hoạt';
                      } else if (student.status === 'rejected') {
                        statusColor = 'error';
                        statusLabel = 'Từ chối';
                      }

                      return (
                        <TableRow key={student.email} hover sx={{ '& td': { borderColor: 'var(--vien)' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                sx={{
                                  bgcolor:
                                    student.status === 'active'
                                      ? 'rgba(15, 118, 110, 0.08)'
                                      : 'rgba(234, 88, 12, 0.08)',
                                  color: student.status === 'active' ? 'var(--teal)' : 'var(--cam)',
                                  fontWeight: 'bold',
                                  fontSize: '0.9rem',
                                }}
                              >
                                {student.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                  {student.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Học sinh 11
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Chip
                              label={statusLabel}
                              color={statusColor}
                              size="small"
                              sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              {student.status === 'pending' && (
                                <>
                                  <Button
                                    id={`approve-btn-${student.email}`}
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    startIcon={<Check size={14} />}
                                    onClick={() => approveUser(student.email)}
                                    sx={{ textTransform: 'none', borderRadius: 1.5, boxShadow: 'none' }}
                                  >
                                    Duyệt kích hoạt
                                  </Button>
                                  <Button
                                    id={`reject-btn-${student.email}`}
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    startIcon={<X size={14} />}
                                    onClick={() => rejectUser(student.email)}
                                    sx={{ textTransform: 'none', borderRadius: 1.5 }}
                                  >
                                    Từ chối
                                  </Button>
                                </>
                              )}
                              {student.status !== 'pending' && (
                                <Button
                                  id={`delete-btn-${student.email}`}
                                  variant="text"
                                  color="error"
                                  size="small"
                                  startIcon={<Trash2 size={14} />}
                                  onClick={() => {
                                    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản ${student.name}?`)) {
                                      deleteUser(student.email);
                                    }
                                  }}
                                  sx={{ textTransform: 'none' }}
                                >
                                  Xóa
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

