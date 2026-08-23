import React, { useState } from 'react';
import { Box, Typography, Card, Chip, Button, Dialog, IconButton } from '@mui/material';
import { Gamepad2, Play, X } from 'lucide-react';
import { DetectiveArt, PipelineArt, IUPACArt, BalanceArt, TowerArt } from './GameArt';

interface GameData {
  id: string;
  title: string;
  chapter: string;
  description: string;
  status: 'active' | 'soon';
  path?: string;
  art: React.ReactNode;
}

const GAMES: GameData[] = [
  {
    id: 'tham-tu-hoa-chat',
    title: 'Thám Tử Hóa Chất',
    chapter: 'Chương 1 — Bài 2: Sự điện li',
    description: 'Nhận biết 4 dung dịch mất nhãn bằng thuốc thử và suy luận loại trừ. Chiến dịch 5 vụ án.',
    status: 'active',
    path: '/games/tham-tu-hoa-chat.html',
    art: <DetectiveArt />,
  },
  {
    id: 'duong-ong',
    title: 'Đường Ống Chuyển Hóa',
    chapter: 'Chương 2 — Nitrogen & Phosphorus',
    description: 'Kéo thả điều kiện phản ứng để hoàn thành sơ đồ chuyển hóa.',
    status: 'soon',
    art: <PipelineArt />,
  },
  {
    id: 'ghep-ten',
    title: 'Ghép Tên Gọi IUPAC',
    chapter: 'Chương 3 — Đại cương hữu cơ',
    description: 'Lật thẻ ghép công thức cấu tạo với tên gọi đúng.',
    status: 'soon',
    art: <IUPACArt />,
  },
  {
    id: 'can-bang',
    title: 'Cân Bằng Thần Tốc',
    chapter: 'Chương 4 — Hydrocarbon',
    description: 'Cân bằng phương trình trước khi hết giờ, có combo điểm.',
    status: 'soon',
    art: <BalanceArt />,
  },
  {
    id: 'leo-thap',
    title: 'Leo Tháp Hóa Học',
    chapter: 'Ôn tổng hợp 6 chương',
    description: '15 câu tăng dần độ khó, có mốc an toàn và quyền trợ giúp hỏi gia sư AI.',
    status: 'soon',
    art: <TowerArt />,
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
    <Box
      sx={{
        width: '100%',
        bgcolor: '#f7f9fc',
        borderRadius: 3,
        p: 3,
        mb: 0,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: '#1e50a2',
            mb: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Gamepad2 size={32} /> Học Hóa 11 Qua Trò Chơi
        </Typography>
        {/* Gạch ngang cam */}
        <Box sx={{ width: 56, height: 4, bgcolor: '#f5a623', borderRadius: 2, mb: 1 }} />
        <Typography variant="body1" sx={{ color: '#64748b' }}>
          Chơi để hiểu bản chất, không phải để học thuộc đáp án.
        </Typography>
      </Box>

      {/* Grid thẻ game */}
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
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#ffffff',
              border: game.status === 'active' ? '2px solid #1e50a2' : '1px solid #e2e8f0',
              opacity: game.status === 'soon' ? 0.55 : 1,
              boxShadow:
                game.status === 'active'
                  ? '0 4px 16px rgba(30, 80, 162, 0.12)'
                  : '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              overflow: 'hidden',
              cursor: game.status === 'active' ? 'pointer' : 'default',
              '&:hover':
                game.status === 'active'
                  ? {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 32px rgba(30, 80, 162, 0.2)',
                    }
                  : {},
            }}
          >
            {/* Chip sắp ra mắt */}
            {game.status === 'soon' && (
              <Chip
                label="Sắp ra mắt"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  bgcolor: '#f5a623',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  zIndex: 2,
                }}
              />
            )}

            {/* Hình minh họa SVG */}
            <Box sx={{ overflow: 'hidden', flexShrink: 0 }}>
              {game.art}
            </Box>

            {/* Nội dung thẻ */}
            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              {/* Tên chương + tên game */}
              <Box sx={{ mb: 1.5, minWidth: 0 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#f5a623',
                    fontWeight: 'bold',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    pr: game.status === 'soon' ? 0 : 0,
                  }}
                >
                  {game.chapter}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1.25,
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {game.title}
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: '#475569', mb: 2.5, flexGrow: 1, lineHeight: 1.6 }}>
                {game.description}
              </Typography>

              {/* Nút */}
              <Button
                variant={game.status === 'active' ? 'contained' : 'outlined'}
                disabled={game.status === 'soon'}
                onClick={() => handleOpenGame(game)}
                startIcon={game.status === 'active' ? <Play size={18} /> : null}
                sx={{
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderRadius: 5,
                  background:
                    game.status === 'active'
                      ? 'linear-gradient(90deg, #1e50a2 0%, #007bf2 100%)'
                      : 'transparent',
                  color: game.status === 'active' ? '#ffffff' : undefined,
                  '&:hover':
                    game.status === 'active'
                      ? {
                          background: 'linear-gradient(90deg, #16407e 0%, #0056a3 100%)',
                        }
                      : {},
                }}
              >
                {game.status === 'active' ? 'Chơi ngay' : 'Đang phát triển'}
              </Button>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Game Modal */}
      <Dialog fullScreen open={Boolean(activeGame)} onClose={handleCloseGame}>
        {activeGame && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1,
                bgcolor: '#1e50a2',
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
