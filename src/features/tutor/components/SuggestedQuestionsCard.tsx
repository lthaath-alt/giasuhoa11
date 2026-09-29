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
        borderLeft: '5px solid var(--luc-tham)',
        boxShadow: 'none',
        backgroundColor: 'var(--nen-the)',
        border: '1px solid var(--vien)',
        borderLeftWidth: '5px',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <HelpCircle size={20} color="var(--luc-tham)" />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }} color="text.primary">
            Câu hỏi tự luyện mẫu
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Click vào câu hỏi dưới đây để Chemai dẫn dắt phương pháp giải và khơi gợi tư duy:
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
                borderColor: 'var(--vien-2)',
                borderRadius: 0,
                fontSize: '0.8rem',
                lineHeight: 1.4,
                color: 'var(--luc-tham)',
                fontWeight: '600',
                '&:hover': {
                  backgroundColor: 'var(--nen-luc-nhat2)',
                  borderColor: 'var(--luc-tham)',
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
