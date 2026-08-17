import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container,
  Avatar,
  Chip
} from '@mui/material';
import { LogOut, GraduationCap, ArrowLeft } from 'lucide-react';
import { useApp } from '../core/hooks/useApp';
import { ManagementLayout } from '../core/components/ManagementLayout';
import AccountManagement from '../core/components/AccountManagement';
import ClassManagement from '../core/components/ClassManagement';
import LibraryManagement from '../core/components/LibraryManagement';
import DatabankManagement from '../core/components/DatabankManagement';
import PasswordManagement from '../core/components/PasswordManagement';
import ErrorManagement from '../core/components/ErrorManagement';
import { CreateTeacherDialog, CreateClassDialog, CredentialInfo, CredentialDialog } from '../features/admin/components/shared/SchoolDialogs';

export const SchoolAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout, users, classes, exams, libraryQuestions } = useApp();

  const [createTeacherOpen, setCreateTeacherOpen] = useState(false);
  const [createClassOpen, setCreateClassOpen] = useState(false);
  const [credentialDialog, setCredentialDialog] = useState<CredentialInfo | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToStudy = () => {
    navigate('/dashboard');
  };

  // Lọc dữ liệu theo phạm vi trường học của School Admin
  const schoolClasses = classes.filter(c => c.schoolId === currentUser?.schoolId);
  const schoolUsers = users.filter(u => u.schoolId === currentUser?.schoolId);

  return (
    <Box id="school-admin-page-layout" sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      
      {/* ADMIN NAVIGATION BAR */}
      <AppBar id="admin-app-bar" position="static" elevation={0} sx={{ backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1, px: { xs: 0 } }}>
            
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={handleBackToStudy}>
              <Box sx={{ p: 1, backgroundColor: 'rgba(234, 88, 12, 0.15)', borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={24} color="#ea580c" />
              </Box>
              <Typography variant="h6" sx={{ letterSpacing: '-0.5px', fontWeight: 'bold', color: '#ffffff' }}>
                Quản trị Trường học
              </Typography>
            </Box>

            {/* Thông tin Admin & Điều hướng */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: '#ea580c', color: '#ffffff', width: 36, height: 36, fontWeight: 'bold', fontSize: '0.9rem' }}>
                  S
                </Avatar>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#f8fafc', lineHeight: 1.2 }}>
                    {currentUser?.name || 'Quản trị trường'}
                  </Typography>
                  <Chip label="SCHOOL ADMIN" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 'bold', backgroundColor: 'rgba(234, 88, 12, 0.2)', color: '#fb923c', border: '1px solid rgba(234, 88, 12, 0.4)' }} />
                </Box>
              </Box>

              {/* Nút Quay về Không gian học tập */}
              <Button
                id="back-to-study-btn"
                variant="outlined"
                size="small"
                startIcon={<ArrowLeft size={16} />}
                onClick={handleBackToStudy}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2.5,
                  fontWeight: 'bold',
                  color: '#10b981',
                  borderColor: 'rgba(16, 185, 129, 0.4)',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  '&:hover': {
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  }
                }}
              >
                Vào học tập (Student View)
              </Button>

              {/* Nút Đăng xuất */}
              <Button
                id="admin-logout-btn"
                variant="contained"
                size="small"
                startIcon={<LogOut size={16} />}
                onClick={handleLogout}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2.5,
                  fontWeight: 'bold',
                  boxShadow: 'none',
                  backgroundColor: '#ef4444',
                  '&:hover': { backgroundColor: '#dc2626' }
                }}
              >
                Đăng xuất
              </Button>
            </Box>

          </Toolbar>
        </Container>
      </AppBar>

      {/* DASHBOARD NỘI DUNG CHÍNH */}
      <Container maxWidth="xl" sx={{ display: 'flex', flexDirection: 'column', flex: 1, py: { xs: 2, md: 3 } }}>
        <ManagementLayout
          roleName="Quản trị Trường học"
          classCount={schoolClasses.length}
          accountCount={schoolUsers.length}
          questionCount={libraryQuestions.length}
          examCount={exams.length}
          accountContent={
            <AccountManagement
              users={schoolUsers}
              classes={schoolClasses}
              canCreateTeacher={true}
              canCreateClass={true}
              canCreateStudent={false}
              onCreateTeacherClick={() => setCreateTeacherOpen(true)}
              onCreateClassClick={() => setCreateClassOpen(true)}
            />
          }
          classContent={
            <ClassManagement
              classes={schoolClasses}
              users={schoolUsers}
              canCreate={true}
              onCreateClick={() => setCreateClassOpen(true)}
              currentUserRole="school_admin"
            />
          }
          libraryContent={<LibraryManagement />}
          databankContent={<DatabankManagement />}
          passwordContent={<PasswordManagement users={schoolUsers} />}
          errorContent={<ErrorManagement />}
        />
      </Container>

      {/* DIALOGS */}
      {currentUser?.schoolId && (
        <>
          <CreateTeacherDialog
            open={createTeacherOpen}
            onClose={() => setCreateTeacherOpen(false)}
            schoolId={currentUser.schoolId}
            onCreated={creds => { setCredentialDialog(creds); setCreateTeacherOpen(false); }}
          />
          <CreateClassDialog
            open={createClassOpen}
            onClose={() => setCreateClassOpen(false)}
            schoolId={currentUser.schoolId}
          />
        </>
      )}

      <CredentialDialog
        open={Boolean(credentialDialog)}
        onClose={() => setCredentialDialog(null)}
        credentials={credentialDialog}
      />
    </Box>
  );
};

export default SchoolAdminPage;
