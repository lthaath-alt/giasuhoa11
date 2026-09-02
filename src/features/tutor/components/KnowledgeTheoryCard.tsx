import React from 'react';
import { Card, CardContent, Box, Typography, Divider, Paper } from '@mui/material';
import { BookOpen, Lightbulb } from 'lucide-react';
import { Lesson } from '../../lessons/types';

interface KnowledgeTheoryCardProps {
  lesson: Lesson;
}

export const KnowledgeTheoryCard: React.FC<KnowledgeTheoryCardProps> = ({ lesson }) => {
  return (
    <Card
      id="theory-card"
      sx={{
        borderLeft: '5px solid var(--cam)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        backgroundColor: 'var(--nen-the)',
        border: '1px solid var(--vien)',
        borderLeftWidth: '5px',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <BookOpen size={20} color="var(--cam)" />
          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 'bold' }}>
            Trọng tâm kiến thức
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2, textAlign: 'justify' }}>
          {lesson.summary}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Typography
          variant="subtitle2"
          color="text.primary"
          sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 'bold' }}
        >
          <Lightbulb size={16} color="var(--cam)" /> Công thức & Chìa khóa cần nhớ:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {lesson.formulae.map((f, i) => (
            <Paper key={i} sx={{ p: 1.5, backgroundColor: 'var(--nen-trang)', border: '1px solid var(--vien)', borderRadius: 2 }}>
              <Typography
                variant="caption"
                sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--teal)', display: 'block', wordBreak: 'break-word' }}
              >
                {f}
              </Typography>
            </Paper>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
