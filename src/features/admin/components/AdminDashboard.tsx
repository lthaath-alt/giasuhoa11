import React, { useState } from 'react';
import { Box, Tabs, Tab, Badge, Paper } from '@mui/material';
import { Users, MessageSquare, BookOpen, Building2, Library, Award } from 'lucide-react';
import { useApp } from '../../../core/hooks/useApp';
import { AdminHeader } from './AdminHeader';
import { AccountsTab } from './AccountsTab';
import { ProgressChatsTab } from './ProgressChatsTab';
import { CurriculumTab } from './CurriculumTab';
import { SchoolTab } from './SchoolTab';
import { LibraryTab } from '../../library/components/LibraryTab';
import { QuizProgressTab } from '../../teacher/components/QuizProgressTab';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    chats,
    schools,
    approveUser,
    rejectUser,
    deleteUser,
    getUserProgress,
    resetGuestChats,
    guestChatCount,
  } = useApp();

  const [activeTab, setActiveTab] = useState(0);

  // Lọc danh sách học sinh (bỏ qua admin/teacher)
  const students = users.filter((u) => u.role === 'student');
  const pendingCount = students.filter((s) => s.status === 'pending').length;

  return (
    <Box id="admin-dashboard-container" sx={{ pb: 5 }}>
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
              '&:hover': {
                backgroundColor: 'var(--nen-nhat)',
                color: 'var(--chu-dam)',
              },
              '&.Mui-selected': {
                color: 'var(--tin-hieu)',
                backgroundColor: 'var(--nen-tin-hieu-nhat2)',
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 0,
              backgroundColor: 'var(--tin-hieu-nen)',
            }
          }}
        >
          <Tab
            id="admin-tab-accounts"
            label={
              <Badge badgeContent={pendingCount} color="error" max={99}>
                Tài khoản & Phê duyệt
              </Badge>
            }
            icon={<Users size={18} />}
            iconPosition="start"
          />
          <Tab
            id="admin-tab-progress"
            label="Tiến độ & Nhật ký chat"
            icon={<MessageSquare size={18} />}
            iconPosition="start"
          />
          <Tab
            id="admin-tab-curriculum"
            label="Bài học & Chương trình"
            icon={<BookOpen size={18} />}
            iconPosition="start"
          />
          <Tab
            id="admin-tab-schools"
            label={
              <Badge badgeContent={schools.length || undefined} color="primary" max={99}>
                Trường học
              </Badge>
            }
            icon={<Building2 size={18} />}
            iconPosition="start"
          />
          {/* TAB THƯ VIỆN — Chỉ Admin */}
          <Tab
            id="admin-tab-library"
            label="Thư viện câu hỏi"
            icon={<Library size={18} />}
            iconPosition="start"
          />
          {/* TAB TIẾN ĐỘ & CHẤM ĐIỂM BÀI KIỂM TRA (Bước 4) */}
          <Tab
            id="admin-tab-quiz-progress"
            label="Tiến độ & Chấm điểm"
            icon={<Award size={18} />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* TAB 0: QUẢN LÝ VÀ PHÊ DUYỆT TÀI KHOẢN */}
      {activeTab === 0 && (
        <AccountsTab
          students={students}
          approveUser={approveUser}
          rejectUser={rejectUser}
          deleteUser={deleteUser}
        />
      )}

      {/* TAB 1: TIẾN ĐỘ & NHẬT KÝ CHAT */}
      {activeTab === 1 && (
        <ProgressChatsTab
          students={students}
          chats={chats}
          getUserProgress={getUserProgress}
        />
      )}

      {/* TAB 2: QUẢN LÝ BÀI HỌC VÀ CHƯƠNG TRÌNH */}
      {activeTab === 2 && <CurriculumTab />}

      {/* TAB 3: QUẢN LÝ TRƯỜNG HỌC */}
      {activeTab === 3 && <SchoolTab />}

      {/* TAB 4: THƯ VIỆN CÂU HỎI — Chỉ Admin */}
      {activeTab === 4 && <LibraryTab />}

      {/* TAB 5: TIẾN ĐỘ & CHẤM ĐIỂM BÀI THI (Bước 4) */}
      {activeTab === 5 && (
        <QuizProgressTab students={students} isAdmin={true} />
      )}
    </Box>
  );
};

export default AdminDashboard;
