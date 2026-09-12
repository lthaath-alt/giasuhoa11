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

  /* Học sinh tự đăng ký gửi đơn xin vào lớp CHƯA có `schoolId` (luật cấm đặt ở
     create, và đường đăng ký cũng không đặt) — lọc `schoolUsers` một mình thì
     cột "Đơn chờ" của ClassManagement luôn hiện "—" cho vai school_admin, vì
     `getDonChoDuyet()` tìm đơn trong đúng mảng `users` được truyền vào. Bổ
     sung thêm những hồ sơ có `pendingClassCode` trùng `inviteCode` của một lớp
     thuộc trường này. KHÔNG truyền cả mảng `users` chưa lọc — ClassManagement
     còn dùng nó cho ô chọn giáo viên (`getTeachers`) và sổ lớp
     (`handleExportCSV`), làm vậy là admin trường thấy người của trường khác. */
  const maMoiTrongTruong = new Set(
    schoolClasses.map(c => c.inviteCode?.toUpperCase()).filter((m): m is string => Boolean(m))
  );
  const idSchoolUsers = new Set(schoolUsers.map(u => u.id));
  const donChoDuyetNgoaiTruong = users.filter(u =>
    !idSchoolUsers.has(u.id) &&
    u.pendingClassCode &&
    maMoiTrongTruong.has(u.pendingClassCode.toUpperCase())
  );
  const usersChoClassManagement = [...schoolUsers, ...donChoDuyetNgoaiTruong];

  return (
    <Box id="school-admin-page-layout" sx={{ minHeight: '100vh', backgroundColor: 'var(--nen-trang)', display: 'flex', flexDirection: 'column' }}>
      
      {/* ADMIN NAVIGATION BAR */}
      <AppBar id="admin-app-bar" position="static" elevation={0} sx={{ backgroundColor: 'var(--nen-dam)', borderBottom: '1px solid var(--vien-dam)' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1, px: { xs: 0 } }}>
            
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={handleBackToStudy}>
              <Box sx={{ p: 1, backgroundColor: 'var(--nen-tin-hieu-nhat2)', borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={24} color="var(--chu-dam)" />
              </Box>
              <Typography variant="h6" sx={{ letterSpacing: '-0.5px', fontWeight: 'bold', color: 'var(--chu-nguoc)' }}>
                Quản trị Trường học
              </Typography>
            </Box>

            {/* Thông tin Admin & Điều hướng */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'var(--tin-hieu-nen)', color: 'var(--chu-nguoc)', width: 36, height: 36, fontWeight: 'bold', fontSize: '0.9rem' }}>
                  S
                </Avatar>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu-nguoc)', lineHeight: 1.2 }}>
                    {currentUser?.name || 'Quản trị trường'}
                  </Typography>
                  <Chip label="SCHOOL ADMIN" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 'bold', backgroundColor: 'var(--tin-hieu-vien)', color: 'var(--tin-hieu-dam)', border: '1px solid var(--tin-hieu-vien)' }} />
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
                  borderRadius: 0,
                  fontWeight: 'bold',
                  color: 'var(--luc)',
                  borderColor: 'var(--vien-2)',
                  backgroundColor: 'var(--nen-luc-nhat2)',
                  '&:hover': {
                    borderColor: 'var(--luc)',
                    backgroundColor: 'var(--nen-luc-nhat2)',
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
                  borderRadius: 0,
                  fontWeight: 'bold',
                  boxShadow: 'none',
                  backgroundColor: 'var(--do-nen)',
                  '&:hover': { backgroundColor: 'var(--do-nen)' }
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
              users={usersChoClassManagement}
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
