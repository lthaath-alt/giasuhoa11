import React from 'react';
import { Box, Container, Typography, LinearProgress } from '@mui/material';
import { Award } from 'lucide-react';

interface StudyProgressBarProps {
  progressPercent: number;
  completedCount: number;
  totalLessonsCount: number;
}

export const StudyProgressBar: React.FC<StudyProgressBarProps> = ({
  progressPercent,
  completedCount,
  totalLessonsCount,
}) => {
  return (
    <Box id="student-progress-bar" sx={{ backgroundColor: 'var(--nen-the)', borderBottom: '1px solid var(--vien)', py: 1.5 }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Award size={18} color="var(--cam)" />
            <Typography variant="body2" sx={{ fontWeight: 'bold' }} color="text.primary">
              Tiến trình tự học SGK Hóa học 11:
            </Typography>
          </Box>
          <Box sx={{ flex: 1, width: '100%', mx: { sm: 3 } }}>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              color="primary"
              sx={{ height: 6, borderRadius: 3, backgroundColor: 'var(--vien)' }}
            />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }} color="primary.main">
            {progressPercent}% Hoàn thành ({completedCount}/{totalLessonsCount} bài)
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
