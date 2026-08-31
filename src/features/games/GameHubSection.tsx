import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, Chip, Button, Dialog, IconButton } from '@mui/material';
import { Gamepad2, Play, X } from 'lucide-react';
import { DetectiveArt, PipelineArt, IUPACArt, BalanceArt, TowerArt, BoardGameArt } from './GameArt';
import { BankFirestore, pushToGame } from '../bank/bankStore';

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
    id: 'vong-quanh-hoa-11',
    title: 'Vòng Quanh Hóa 11',
    chapter: 'Ôn tổng hợp 6 chương',
    description:
      'Chia 2–4 đội, tung xúc xắc đi quanh 28 ô. Câu hỏi lấy thẳng từ Ngân hàng dữ liệu của web, 4 mức từ nhận biết đến vận dụng cao.',
    status: 'active',
    path: '/games/hoa11-boardgame.html',
    art: <BoardGameArt />,
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

  /**
   * Đưa ngân hàng câu hỏi từ web sang trò chơi ngay khi mở mục này.
   *
   * Trò chơi đọc ngân hàng trong IndexedDB, mà IndexedDB thì riêng từng trình
   * duyệt — mở trên máy chiếu ở lớp là một kho trống. Bơm sẵn ở đây để giáo
   * viên không phải nhớ bấm nút bên trang quản trị.
   *
   * CHỈ bơm khi đọc được Firestore. Nếu mất mạng mà vẫn bơm, ngân hàng rỗng sẽ
   * ghi đè mất phần đang có trong máy.
   */
  useEffect(() => {
    let huy = false;
    (async () => {
      try {
        const dsach = await BankFirestore.getAll();
        if (!huy && dsach.length) await pushToGame(dsach);
      } catch {
        /* không đọc được thì thôi, trò chơi tự dùng ngân hàng đang có trong máy */
      }
    })();
    return () => { huy = true; };
  }, []);

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
      }}
    >
      {/* Header khu vực */}
      <Box sx={{ mb: '28px' }}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '28px',
            color: '#1e50a2',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            lineHeight: 1.2,
          }}
        >
          <Gamepad2 size={30} /> Học Hóa 11 Qua Trò Chơi
        </Typography>
        <Typography
          sx={{
            fontSize: '15px',
            color: '#5a6472',
            mt: '6px',
          }}
        >
          Chơi để hiểu bản chất, không phải để học thuộc đáp án.
        </Typography>
      </Box>

      {/* Lưới thẻ game */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: '20px',
          alignItems: 'stretch',
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
              height: '100%',
              bgcolor: game.status === 'active' ? '#ffffff' : '#f4f6f9',
              border: game.status === 'active' ? '2px solid #1e50a2' : '1px solid #e2e8f0',
              boxShadow:
                game.status === 'active'
                  ? '0 4px 16px rgba(30, 80, 162, 0.12)'
                  : '0 2px 8px rgba(0,0,0,0.04)',
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
            {/* Chip sắp ra mắt — góc trên phải, z-index cao */}
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
                  fontSize: '11px',
                }}
              />
            )}

            {/* Hình minh họa SVG — lấp đầy khung, cao 150px */}
            <Box
              sx={{
                width: '100%',
                height: '150px',
                flexShrink: 0,
                overflow: 'hidden',
                borderRadius: '16px 16px 0 0',
                opacity: game.status === 'soon' ? 0.5 : 1,
                '& svg': {
                  width: '100%',
                  height: '100%',
                  display: 'block',
                },
              }}
            >
              {game.art}
            </Box>

            {/* Nội dung chữ — flex-grow để đẩy nút dính đáy */}
            <Box
              sx={{
                p: '20px',
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
              }}
            >
              {/* Tên chương */}
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#f5a623',
                  mb: '6px',
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {game.chapter}
              </Typography>

              {/* Tên game */}
              <Typography
                sx={{
                  fontSize: '19px',
                  fontWeight: 700,
                  color: game.status === 'active' ? '#0f172a' : '#5a6472',
                  lineHeight: 1.25,
                  mb: '10px',
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {game.title}
              </Typography>

              {/* Mô tả — flexGrow để đẩy nút/dòng chữ xuống đáy */}
              <Typography
                sx={{
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: '#5a6472',
                  flexGrow: 1,
                }}
              >
                {game.description}
              </Typography>

              {/* Nút chơi (active) hoặc dòng chữ nhỏ (soon) */}
              {game.status === 'active' ? (
                <Button
                  variant="contained"
                  onClick={() => handleOpenGame(game)}
                  startIcon={<Play size={18} />}
                  sx={{
                    mt: 2,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    borderRadius: 5,
                    background: 'linear-gradient(90deg, #1e50a2 0%, #007bf2 100%)',
                    color: '#ffffff',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #16407e 0%, #0056a3 100%)',
                    },
                  }}
                >
                  Chơi ngay
                </Button>
              ) : (
                <Typography
                  sx={{
                    mt: 2,
                    fontSize: '13px',
                    color: '#94a3b8',
                    fontStyle: 'italic',
                  }}
                >
                  Đang phát triển...
                </Typography>
              )}
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
