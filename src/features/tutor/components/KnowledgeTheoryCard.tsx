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
        borderLeft: '5px solid #ea580c',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderLeftWidth: '5px',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <BookOpen size={20} color="#ea580c" />
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
          <Lightbulb size={16} color="#ea580c" /> Công thức & Chìa khóa cần nhớ:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {lesson.formulae.map((f, i) => (
            <Paper key={i} sx={{ p: 1.5, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Typography
                variant="caption"
                sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f766e', display: 'block', wordBreak: 'break-word' }}
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
