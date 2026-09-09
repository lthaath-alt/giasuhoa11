import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, Accordion, AccordionSummary,
  AccordionDetails, Avatar, Chip, Divider
} from '@mui/material';
import {
  Building2, UserPlus, Plus, ChevronDown, Users, GraduationCap, ShieldCheck
} from 'lucide-react';
import { useApp } from '../../../core/hooks/useApp';
import { CredentialInfo, CredentialDialog, CreateSchoolDialog, CreateTeacherDialog, CreateClassDialog, CreateSchoolAdminDialog } from './shared/SchoolDialogs';

// ─── SchoolTab ────────────────────────────────────────────────────────────────

export const SchoolTab: React.FC = () => {
  const { currentUser, schools, classes, users } = useApp();
  const [createSchoolOpen, setCreateSchoolOpen] = useState(false);
  const [createTeacherSchool, setCreateTeacherSchool] = useState<string | null>(null);
  const [createClassSchool, setCreateClassSchool] = useState<string | null>(null);
  const [createSchoolAdminSchool, setCreateSchoolAdminSchool] = useState<string | null>(null);
  const [credentialDialog, setCredentialDialog] = useState<CredentialInfo | null>(null);

  const getSchoolTeachers = (schoolId: string) => users.filter(u => u.role === 'teacher' && u.schoolId === schoolId);
  const getSchoolClasses = (schoolId: string) => classes.filter(c => c.schoolId === schoolId);
  const getSchoolAdmins = (schoolId: string) => users.filter(u => u.role === 'school_admin' && u.schoolId === schoolId);

  return (
    <Box id="school-tab">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)' }}>Quản lý Trường học</Typography>
          <Typography variant="body2" color="text.secondary">Tạo trường, quản lý giáo viên và lớp học</Typography>
        </Box>
        <Button
          id="create-school-btn"
          variant="contained" color="primary"
          startIcon={<Plus size={16} />}
          onClick={() => setCreateSchoolOpen(true)}
          sx={{ textTransform: 'none', borderRadius: 0, fontWeight: 'bold', boxShadow: 'none' }}
        >
          Thêm trường mới
        </Button>
      </Box>

      {schools.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 0, border: '1px dashed var(--vien)' }}>
          <Building2 size={48} color="var(--chu-mo)" style={{ marginBottom: 12 }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>Chưa có trường học nào</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Nhấn "Thêm trường mới" để bắt đầu cấu hình.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {schools.map(school => {
            const schoolTeachers = getSchoolTeachers(school.id);
            const schoolClasses = getSchoolClasses(school.id);
            const schoolAdmins = getSchoolAdmins(school.id);
            return (
              <Accordion key={school.id} defaultExpanded sx={{ borderRadius: '0 !important', border: '1px solid var(--vien)', boxShadow: 'none', '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ChevronDown size={20} />} sx={{ px: 3, py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Box sx={{ p: 1, bgcolor: 'var(--nen-cam-nhat2)', borderRadius: 0 }}>
                      <Building2 size={20} color="var(--chu-dam)" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)' }}>{school.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {schoolTeachers.length} giáo viên · {schoolClasses.length} lớp
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                  <Divider sx={{ mb: 2 }} />

                  {/* Giáo viên */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Users size={16} /> Giáo viên ({schoolTeachers.length})
                        </Typography>
                        {schoolAdmins.length > 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Admin Trường: {schoolAdmins.map(a => a.name).join(', ')}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          id={`create-school-admin-${school.id}-btn`}
                          size="small" variant="outlined" color="warning"
                          startIcon={<ShieldCheck size={14} />}
                          onClick={() => setCreateSchoolAdminSchool(school.id)}
                          sx={{ textTransform: 'none', borderRadius: 0, fontWeight: 'bold' }}
                        >
                          Thêm Admin Trường
                        </Button>
                        <Button
                          id={`create-teacher-${school.id}-btn`}
                          size="small" variant="outlined" color="primary"
                          startIcon={<UserPlus size={14} />}
                          onClick={() => setCreateTeacherSchool(school.id)}
                          sx={{ textTransform: 'none', borderRadius: 0, fontWeight: 'bold' }}
                        >
                          Thêm GV
                        </Button>
                      </Box>
                    </Box>

                    {schoolTeachers.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>Chưa có giáo viên.</Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {schoolTeachers.map(t => (
                          <Chip key={t.email} avatar={<Avatar sx={{ bgcolor: 'var(--nen-cam-nhat2)', color: 'var(--cam)' }}>{t.name.charAt(0)}</Avatar>}
                            label={`${t.name} – ${t.email}`} variant="outlined" sx={{ fontWeight: 600 }} />
                        ))}
                      </Box>
                    )}
                  </Box>

                  {/* Lớp học */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <GraduationCap size={16} /> Lớp học ({schoolClasses.length})
                      </Typography>
                      <Button
                        id={`create-class-${school.id}-btn`}
                        size="small" variant="outlined" color="secondary"
                        startIcon={<Plus size={14} />}
                        onClick={() => setCreateClassSchool(school.id)}
                        sx={{ textTransform: 'none', borderRadius: 0, fontWeight: 'bold', color: 'var(--teal)', borderColor: 'var(--teal)' }}
                      >
                        Tạo lớp
                      </Button>
                    </Box>

                    {schoolClasses.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>Chưa có lớp học.</Typography>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        {schoolClasses.map(cls => {
                          const teacher = users.find(u => u.email.toLowerCase() === cls.teacherEmail.toLowerCase());
                          return (
                            <Paper key={cls.id} variant="outlined" sx={{ p: 1.5, borderRadius: 0, minWidth: 160 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--teal)' }}>Lớp {cls.name}</Typography>
                              <Typography variant="caption" color="text.secondary">GVCN: {teacher?.name || cls.teacherEmail}</Typography>
                              <br />
                              <Typography variant="caption" color="text.secondary">{cls.studentIdentifiers.length} học sinh</Typography>
                            </Paper>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}

      {/* Dialogs */}
      <CreateSchoolDialog
        open={createSchoolOpen}
        onClose={() => setCreateSchoolOpen(false)}
        adminEmail={currentUser?.email || ''}
      />

      {createTeacherSchool && (
        <CreateTeacherDialog
          open={Boolean(createTeacherSchool)}
          onClose={() => setCreateTeacherSchool(null)}
          schoolId={createTeacherSchool}
          onCreated={creds => { setCredentialDialog(creds); setCreateTeacherSchool(null); }}
        />
      )}

      {createSchoolAdminSchool && (
        <CreateSchoolAdminDialog
          open={Boolean(createSchoolAdminSchool)}
          onClose={() => setCreateSchoolAdminSchool(null)}
          schoolId={createSchoolAdminSchool}
          onCreated={creds => { setCredentialDialog(creds); setCreateSchoolAdminSchool(null); }}
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
  );
};

export default SchoolTab;
