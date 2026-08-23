import React, { useState } from 'react';
import { Box, Typography, Card, Chip, Button, Dialog, IconButton, Grid } from '@mui/material';
import { Gamepad2, Play, Lock, X } from 'lucide-react';

interface GameData {
  id: string;
  title: string;
  chapter: string;
  description: string;
  status: 'active' | 'soon';
  path?: string;
  icon?: React.ReactNode;
}

const GAMES: GameData[] = [
  {
    id: 'tham-tu-hoa-chat',
    title: 'Thám Tử Hóa Chất',
    chapter: 'Chương 1 — Bài 2: Sự điện li',
    description: 'Nhận biết 4 dung dịch mất nhãn bằng thuốc thử và suy luận loại trừ. Chiến dịch 5 vụ án.',
    status: 'active',
    path: '/games/tham-tu-hoa-chat.html',
    icon: <Gamepad2 size={24} />,
  },
  {
    id: 'duong-ong',
    title: 'Đường Ống Chuyển Hóa',
    chapter: 'Chương 2 — Nitrogen & Phosphorus',
    description: 'Kéo thả điều kiện phản ứng để hoàn thành sơ đồ chuyển hóa.',
    status: 'soon',
    icon: <Lock size={24} />,
  },
  {
    id: 'ghep-ten',
    title: 'Ghép Tên Gọi IUPAC',
    chapter: 'Chương 3 — Đại cương hữu cơ',
    description: 'Lật thẻ ghép công thức cấu tạo với tên gọi đúng.',
    status: 'soon',
    icon: <Lock size={24} />,
  },
  {
    id: 'can-bang',
    title: 'Cân Bằng Thần Tốc',
    chapter: 'Chương 4 — Hydrocarbon',
    description: 'Cân bằng phương trình trước khi hết giờ, có combo điểm.',
    status: 'soon',
    icon: <Lock size={24} />,
  },
  {
    id: 'leo-thap',
    title: 'Leo Tháp Hóa Học',
    chapter: 'Ôn tổng hợp 6 chương',
    description: '15 câu tăng dần độ khó, có mốc an toàn và quyền trợ giúp hỏi gia sư AI.',
    status: 'soon',
    icon: <Lock size={24} />,
  },
];

export const GameHubSection: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameData | null>(null);

  const handleOpenGame = (game: GameData) => {
    if (game.status === 'active') {
      setActiveGame(game);
    }
  };

  const handleCloseGame = () => {
    setActiveGame(null);
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: '#0056a3', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Gamepad2 size={28} /> Học Hóa 11 Qua Trò Chơi
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b' }}>
          Chơi để hiểu bản chất, không phải để học thuộc đáp án.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 3,
        }}
      >
        {GAMES.map((game) => (
          <Card
            key={game.id}
            sx={{
              position: 'relative',
              p: 3,
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#ffffff',
              border: game.status === 'active' ? '2px solid #007bf2' : '1px solid #e2e8f0',
              opacity: game.status === 'soon' ? 0.55 : 1,
              boxShadow: game.status === 'active' ? '0 8px 24px rgba(0, 123, 242, 0.15)' : 'none',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: game.status === 'active' ? 'translateY(-4px)' : 'none',
              },
            }}
          >
            {game.status === 'soon' && (
              <Chip
                label="Sắp ra mắt"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  bgcolor: '#ea580c',
                  color: '#ffffff',
                  fontWeight: 'bold',
                }}
              />
            )}
            
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: game.status === 'active' ? 'rgba(0, 123, 242, 0.1)' : '#f1f5f9',
                  color: game.status === 'active' ? '#007bf2' : '#94a3b8',
                  flexShrink: 0,
                }}
              >
                {game.icon}
              </Box>
              <Box sx={{ minWidth: 0, overflow: 'hidden', pr: game.status === 'soon' ? 7 : 0 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#ea580c', 
                    fontWeight: 'bold',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {game.chapter}
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: '#0f172a', 
                    lineHeight: 1.2,
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {game.title}
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="body2" sx={{ color: '#475569', mb: 3, flexGrow: 1 }}>
              {game.description}
            </Typography>

            <Button
              variant={game.status === 'active' ? 'contained' : 'outlined'}
              disabled={game.status === 'soon'}
              onClick={() => handleOpenGame(game)}
              startIcon={game.status === 'active' ? <Play size={18} /> : null}
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
                borderRadius: 2,
                bgcolor: game.status === 'active' ? '#007bf2' : 'transparent',
                '&:hover': {
                  bgcolor: game.status === 'active' ? '#0056a3' : 'transparent',
                },
              }}
            >
              {game.status === 'active' ? 'Chơi ngay' : 'Đang phát triển'}
            </Button>
          </Card>
        ))}
      </Box>

      {/* Game Modal */}
      <Dialog
        fullScreen
        open={Boolean(activeGame)}
        onClose={handleCloseGame}
      >
        {activeGame && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1,
                bgcolor: '#0056a3',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Gamepad2 size={20} /> {activeGame.title}
              </Typography>
              <IconButton onClick={handleCloseGame} sx={{ color: '#ffffff' }} size="small">
                <X size={24} />
              </IconButton>
            </Box>
            <Box sx={{ flexGrow: 1, bgcolor: '#000000' }}>
              <iframe
                src={activeGame.path}
                title={activeGame.title}
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              />
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};
