import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, Button, Dialog, IconButton } from '@mui/material';
import { Gamepad2, Play, X } from 'lucide-react';
import { DetectiveArt, BoardGameArt, RescueArt } from './GameArt';
import { BankFirestore, pushToGame } from '../bank/bankStore';
import { useApp } from '../../core/hooks/useApp';

interface GameData {
  id: string;
  title: string;
  chapter: string;
  description: string;
  path: string;
  art: React.ReactNode;
}

const GAMES: GameData[] = [
  {
    id: 'tham-tu-hoa-chat',
    title: 'Thám Tử Hóa Chất',
    chapter: 'Chương 1 — Bài 2: Sự điện li',
    description: 'Nhận biết 4 dung dịch mất nhãn bằng thuốc thử và suy luận loại trừ. Chiến dịch 5 vụ án.',
    path: '/games/tham-tu-hoa-chat.html',
    art: <DetectiveArt />,
  },
  {
    id: 'giai-cuu-phong-thi-nghiem',
    title: 'Giải Cứu Phòng Thí Nghiệm',
    chapter: 'Chương 2 — Nitrogen & Sulfur',
    description:
      'Game chạy nhảy 4 màn: đập ô ? trả lời câu hỏi, dùng khăn tẩm kiềm băng qua khói SO₂, ghép ion mở cửa lọc, rồi cân bằng phương trình để khóa van lò và cứu cô giáo.',
    path: '/games/giai-cuu-phong-thi-nghiem.html',
    art: <RescueArt />,
  },
  {
    id: 'vong-quanh-hoa-11',
    title: 'Vòng Quanh Hóa 11',
    chapter: 'Ôn tổng hợp 6 chương',
    description:
      'Chia 2–4 đội, tung xúc xắc đi quanh 28 ô. Câu hỏi lấy thẳng từ Ngân hàng dữ liệu của web, 4 mức từ nhận biết đến vận dụng cao.',
    path: '/games/hoa11-boardgame.html',
    art: <BoardGameArt />,
  },
];

export const GameHubSection: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameData | null>(null);
  const { currentUser } = useApp();

  /* Chế độ thử của trò chơi (bất tử, bay, nhảy màn) — chỉ mở cho quản trị.
     Giáo viên cần đi hết các màn để kiểm nội dung câu hỏi mà không phải chơi giỏi.

     NÓI RÕ CHO ĐÚNG: đây là cổng TIỆN LỢI, không phải cổng an ninh. Trang trò
     chơi là tệp tĩnh ai cũng tải được, nên học sinh nào biết thì tự thêm ?gv=1
     vào địa chỉ cũng bật được. Chấp nhận được vì trò chơi KHÔNG gửi điểm về máy
     chủ hay về ứng dụng — gian lận chỉ ảnh hưởng lượt chơi của chính em đó,
     không làm sai dữ liệu của ai. Ngày nào điểm được ghi lại thật thì phải kiểm
     ở phía máy chủ, đừng tin tham số này. */
  const choPhepThu = currentUser?.role === 'super_admin'
                  || currentUser?.role === 'school_admin';

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
    setActiveGame(game);
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
              bgcolor: '#ffffff',
              border: '2px solid #1e50a2',
              boxShadow: '0 4px 16px rgba(30, 80, 162, 0.12)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              overflow: 'hidden',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 32px rgba(30, 80, 162, 0.2)',
              },
            }}
          >
            {/* Hình minh họa SVG — lấp đầy khung, cao 150px */}
            <Box
              sx={{
                width: '100%',
                height: '150px',
                flexShrink: 0,
                overflow: 'hidden',
                borderRadius: '16px 16px 0 0',
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
                  color: '#0f172a',
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
                src={activeGame.path + (choPhepThu ? '?gv=1' : '')}
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
