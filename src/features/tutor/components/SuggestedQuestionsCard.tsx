import React from 'react';
import { Card, CardContent, Box, Typography, Button } from '@mui/material';
import { HelpCircle } from 'lucide-react';
import { Lesson } from '../../lessons/types';

interface SuggestedQuestionsCardProps {
  lesson: Lesson;
  guestLimitReached: boolean;
  isSending: boolean;
  onQuestionClick: (question: string) => void;
}

export const SuggestedQuestionsCard: React.FC<SuggestedQuestionsCardProps> = ({
  lesson,
  guestLimitReached,
  isSending,
  onQuestionClick,
}) => {
  return (
    <Card
      id="suggested-questions-card"
      sx={{
        borderLeft: '5px solid #0f766e',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderLeftWidth: '5px',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <HelpCircle size={20} color="#0f766e" />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }} color="text.primary">
            Câu hỏi tự luyện mẫu
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Click vào câu hỏi dưới đây để Gia sư AI dẫn dắt phương pháp giải và khơi gợi tư duy:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {lesson.commonQuestions.map((q, i) => (
            <Button
              id={`suggested-question-btn-${i}`}
              key={i}
              variant="outlined"
              color="secondary"
              size="small"
              sx={{
                textAlign: 'left',
                justifyContent: 'flex-start',
                textTransform: 'none',
                p: 1.5,
                borderStyle: 'dashed',
                borderColor: 'rgba(15, 118, 110, 0.3)',
                borderRadius: 2,
                fontSize: '0.8rem',
                lineHeight: 1.4,
                color: '#0f766e',
                fontWeight: '600',
                '&:hover': {
                  backgroundColor: 'rgba(15, 118, 110, 0.04)',
                  borderColor: '#0f766e',
                },
              }}
              onClick={() => onQuestionClick(q.question)}
              disabled={guestLimitReached || isSending}
            >
              {q.question}
            </Button>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
