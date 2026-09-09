import React, { useState } from 'react';
import { Box, Tabs, Tab, Badge, Paper, Typography, Button, Divider, Avatar, Chip, Alert } from '@mui/material';
import { Users, Building2, UserPlus, Plus, GraduationCap, Award } from 'lucide-react';
import { useApp } from '../../../core/hooks/useApp';
import { AdminHeader } from './AdminHeader';
import { AccountsTab } from './AccountsTab';
import { QuizProgressTab } from '../../teacher/components/QuizProgressTab';
import { CredentialInfo, CredentialDialog, CreateTeacherDialog, CreateClassDialog } from './shared/SchoolDialogs';

export const SchoolAdminDashboard: React.FC = () => {
  const { currentUser, schools, classes, users, approveUser, rejectUser, deleteUser, guestChatCount, resetGuestChats } = useApp();
  const [activeTab, setActiveTab] = useState(0);

  // Lấy trường học của admin hiện tại
  const mySchool = schools.find(s => s.id === currentUser?.schoolId);

  // Chỉ lấy học sinh thuộc trường của mình
  const students = users.filter(u => u.role === 'student' && u.schoolId === currentUser?.schoolId);
  const pendingCount = students.filter(s => s.status === 'pending').length;

  const [createTeacherSchool, setCreateTeacherSchool] = useState<string | null>(null);
  const [createClassSchool, setCreateClassSchool] = useState<string | null>(null);
  const [credentialDialog, setCredentialDialog] = useState<CredentialInfo | null>(null);

  return (
    <Box id="school-admin-dashboard-container" sx={{ pb: 5 }}>
      {/* Tiêu đề đầu trang */}
      <AdminHeader
        pendingCount={pendingCount}
        guestChatCount={guestChatCount}
        resetGuestChats={resetGuestChats}
      />

      {/* Tabs chuyển đổi */}
      <Paper elevation={0} sx={{ borderRadius: 0, p: 0.8, mb: 3, border: '1px solid var(--vien)', backgroundColor: 'var(--nen-the)' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: 0,
              minHeight: 44,
              px: 2.5,
              mr: 0.5,
              color: 'var(--chu)',
              transition: 'all 0.2s',
              fontSize: '0.92rem',
              '&:hover': { backgroundColor: 'var(--nen-nhat)', color: 'var(--chu-dam)' },
              '&.Mui-selected': { color: 'var(--cam)', backgroundColor: 'var(--nen-cam-nhat2)' }
            },
            '& .MuiTabs-indicator': { height: 3, borderRadius: 0, backgroundColor: 'var(--cam-nen)' }
          }}
        >
          <Tab
            label={<Badge badgeContent={pendingCount} color="error" max={99}>Tài khoản chờ duyệt</Badge>}
            icon={<Users size={18} />} iconPosition="start"
          />
          <Tab
            label="Quản lý Trường học"
            icon={<Building2 size={18} />} iconPosition="start"
          />
          <Tab
            label="Tiến độ & Chấm điểm"
            icon={<Award size={18} />} iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* TAB 0: TÀI KHOẢN & PHÊ DUYỆT (Ẩn Firestore) */}
      {activeTab === 0 && (
        <AccountsTab
          students={students}
          approveUser={approveUser}
          rejectUser={rejectUser}
          deleteUser={deleteUser}
          hideFirestoreTab={true}
        />
      )}

      {/* TAB 1: QUẢN LÝ TRƯỜNG HỌC */}
      {activeTab === 1 && (
        <Box id="school-tab">
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)' }}>Quản lý Trường học</Typography>
            <Typography variant="body2" color="text.secondary">Quản lý giáo viên và lớp học trong trường của bạn</Typography>
          </Box>

          {!mySchool ? (
            <Alert severity="error">Chưa được gán trường học, vui lòng liên hệ Admin Website.</Alert>
          ) : (
            <Paper sx={{ p: 3, borderRadius: 0, border: '1px solid var(--vien)', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ p: 1, bgcolor: 'var(--nen-cam-nhat2)', borderRadius: 0 }}>
                  <Building2 size={24} color="var(--chu-dam)" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{mySchool.name}</Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />

              {/* KHỐI GIÁO VIÊN */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'var(--chu)', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Users size={18} /> Giáo viên
                  </Typography>
                  <Button size="small" variant="outlined" color="primary" startIcon={<UserPlus size={14} />}
                    onClick={() => setCreateTeacherSchool(mySchool.id)} sx={{ textTransform: 'none', borderRadius: 0, fontWeight: 'bold' }}>
                    Thêm GV
                  </Button>
                </Box>
                {(() => {
                  const schoolTeachers = users.filter(u => u.role === 'teacher' && u.schoolId === mySchool.id);
                  if (schoolTeachers.length === 0) return <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>Chưa có giáo viên.</Typography>;
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {schoolTeachers.map(t => (
                        <Chip key={t.email} avatar={<Avatar sx={{ bgcolor: 'var(--nen-cam-nhat2)', color: 'var(--cam)' }}>{t.name.charAt(0)}</Avatar>}
                          label={`${t.name} – ${t.email}`} variant="outlined" sx={{ fontWeight: 600 }} />
                      ))}
                    </Box>
                  );
                })()}
              </Box>

              {/* KHỐI LỚP HỌC */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'var(--chu)', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GraduationCap size={18} /> Lớp học
                  </Typography>
                  <Button size="small" variant="outlined" color="secondary" startIcon={<Plus size={14} />}
                    onClick={() => setCreateClassSchool(mySchool.id)} sx={{ textTransform: 'none', borderRadius: 0, fontWeight: 'bold', color: 'var(--teal)', borderColor: 'var(--teal)' }}>
                    Tạo lớp
                  </Button>
                </Box>
                {(() => {
                  const schoolClasses = classes.filter(c => c.schoolId === mySchool.id);
                  if (schoolClasses.length === 0) return <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>Chưa có lớp học.</Typography>;
                  return (
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                      {schoolClasses.map(cls => {
                        const teacher = users.find(u => u.email.toLowerCase() === cls.teacherEmail.toLowerCase());
                        return (
                          <Paper key={cls.id} variant="outlined" sx={{ p: 1.5, borderRadius: 0, minWidth: 160 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--teal)' }}>Lớp {cls.name}</Typography>
                            <Typography variant="caption" color="text.secondary">GVCN: {teacher?.name || cls.teacherEmail}</Typography><br />
                            <Typography variant="caption" color="text.secondary">{cls.studentIdentifiers.length} học sinh</Typography>
                          </Paper>
                        );
                      })}
                    </Box>
                  );
                })()}
              </Box>
            </Paper>
          )}

          {/* Dialogs */}
          {createTeacherSchool && (
            <CreateTeacherDialog
              open={Boolean(createTeacherSchool)}
              onClose={() => setCreateTeacherSchool(null)}
              schoolId={createTeacherSchool}
              onCreated={creds => { setCredentialDialog(creds); setCreateTeacherSchool(null); }}
            />
          )}

          {createClassSchool && (
            <CreateClassDialog
              open={Boolean(createClassSchool)}
              onClose={() => setCreateClassSchool(null)}
              schoolId={createClassSchool}
            />
          )}

          <CredentialDialog
            open={Boolean(credentialDialog)}
            onClose={() => setCredentialDialog(null)}
            credentials={credentialDialog}
          />
        </Box>
      )}

      {/* TAB 2: TIẾN ĐỘ & CHẤM ĐIỂM BÀI THI */}
      {activeTab === 2 && (
        <QuizProgressTab students={students} isAdmin={false} />
      )}
    </Box>
  );
};

export default SchoolAdminDashboard;
