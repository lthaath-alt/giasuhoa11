import React from 'react';
import { Paper, Avatar, Typography, Box, Card } from '@mui/material';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Lesson } from '../types';
import { CHEMISTRY_11_CURRICULUM } from '../constants';

interface WelcomeWorkspaceProps {
  setSelectedLesson: (lesson: Lesson | null) => void;
}

export const WelcomeWorkspace: React.FC<WelcomeWorkspaceProps> = ({ setSelectedLesson }) => {
  return (
    <Paper
      id="welcome-workspace"
      sx={{
        p: { xs: 4, sm: 8 },
        borderRadius: 4,
        border: '1px solid var(--vien)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--nen-the) 0%, var(--nen-trang) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 480,
      }}
    >
      <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(234, 88, 12, 0.08)', color: 'var(--cam)', mb: 3 }}>
        <Sparkles size={40} />
      </Avatar>

      <Typography variant="h4" color="var(--chu-dam)" sx={{ mb: 2, fontWeight: 'bold' }}>
        Chào mừng em đến với không gian Gia sư AI!
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mb: 4, lineHeight: 1.8 }}>
        Để bắt đầu nâng cao tư duy giải bài tập, em hãy lựa chọn một bài học bất kỳ thuộc chương trình Hóa học 11 ở <strong>Danh mục bài học</strong> bên trái nhé.
        Gia sư AI sẽ tóm tắt kiến thức, chỉ ra công thức cốt lõi và hướng dẫn em cách tư duy giải các bài tập mẫu một cách cặn kẽ!
      </Typography>

      {/* Danh sách thẻ chương hiển thị trực quan */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 700,
          mt: 2,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        {CHEMISTRY_11_CURRICULUM.map((ch, idx) => (
          <Card
            id={`welcome-chapter-card-${ch.id}`}
            key={ch.id}
            onClick={() => {
              if (ch.lessons.length > 0) {
                setSelectedLesson(ch.lessons[0]);
              }
            }}
            sx={{
              p: 2,
              cursor: 'pointer',
              textAlign: 'left',
              borderRadius: 3,
              border: '1px solid var(--vien)',
              transition: 'all 0.2s',
              backgroundColor: 'var(--nen-the)',
              '&:hover': {
                transform: 'translateY(-3px)',
                borderColor: 'var(--cam)',
                boxShadow: '0 6px 16px rgba(234, 88, 12, 0.12)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor:
                    idx % 2 === 0
                      ? 'rgba(234, 88, 12, 0.08)'
                      : 'rgba(15, 118, 110, 0.08)',
                  color:
                    idx % 2 === 0
                      ? 'var(--cam)'
                      : 'var(--teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                }}
              >
                {idx + 1}
              </Box>
              <Box>
                <Typography variant="subtitle2" noWrap sx={{ maxWidth: 220, fontWeight: 'bold', color: 'var(--chu-dam)' }}>
                  {ch.title.split(':')[1] || ch.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {ch.lessons.length} bài học tự luyện
                </Typography>
              </Box>
              <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--chu-2)' }} />
            </Box>
          </Card>
        ))}
      </Box>
    </Paper>
  );
};
