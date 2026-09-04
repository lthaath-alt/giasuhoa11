import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Card, Button, Dialog, IconButton } from '@mui/material';
import { Gamepad2, Play, X } from 'lucide-react';
import { DetectiveArt, BoardGameArt, RescueArt, SnakeLadderArt } from './GameArt';
import { BankFirestore, pushToGame } from '../bank/bankStore';
import { useApp } from '../../core/hooks/useApp';
import { useCheDoMau } from '../../core/hooks/useCheDoMau';

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
      'Game chạy nhảy 6 màn: đập ô ? trả lời câu hỏi, ghép phân tử mở cửa kho, băng qua khói SO₂, ghép ion mở cửa lọc, vượt tháp parkour, khóa van lò rồi đấu khối SO₂ giữa bể acid để cứu cô giáo.',
    path: '/games/giai-cuu-phong-thi-nghiem.html',
    art: <RescueArt />,
  },
  {
    id: 'ran-va-thang',
    title: 'Rắn và Thang Hoá 11',
    chapter: '25 màn — 25 bài của chương trình',
    description:
      'Cờ rắn và thang: tung xúc xắc rồi trả lời câu hỏi để đi. Leo thang khi nhớ đúng, '
      + 'gặp rắn khi mắc lỗi quen thuộc. Về đích và đúng đủ 6 câu mới qua màn — xong bài 1 mới mở bài 2.',
    path: '/games/ran-va-thang.html',
    art: <SnakeLadderArt />,
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
  /* Địa chỉ iframe chốt lại NGAY LÚC MỞ và không đổi nữa.
     Nếu để React tự dựng địa chỉ từ `laToi` thì mỗi lần bấm đổi nền, prop src
     đổi theo → iframe nạp lại → ván cờ đang chơi dở mất sạch. Đổi nền giữa
     chừng được xử lý bằng postMessage ở dưới, không đụng tới địa chỉ. */
  const [diaChiKhung, datDiaChiKhung] = useState('');
  const { currentUser, luuTienDoTroChoi, getUserProgress } = useApp();
  const { laToi } = useCheDoMau();
  const khungRef = useRef<HTMLIFrameElement>(null);

  /* Chế độ thử của trò chơi (bất tử, bay, nhảy màn) — chỉ mở cho quản trị.
     Giáo viên cần đi hết các màn để kiểm nội dung câu hỏi mà không phải chơi giỏi.

     Bản đầu truyền ?gv=1 vào địa chỉ trang trò chơi. Đó là LỖ HỔNG: trang trò
     chơi là tệp tĩnh, học sinh nào biết thì tự gõ thêm ?gv=1 là bật được, kể cả
     khi đăng nhập bằng tài khoản học sinh. Đã bỏ hẳn cách đó.

     Nay trang trò chơi phải HỎI XIN, và chỗ này mới là nơi quyết định — dựa vào
     vai trò của người ĐANG ĐĂNG NHẬP chứ không dựa vào địa chỉ trang. Học sinh
     sửa địa chỉ cũng không ăn thua vì câu trả lời không nhìn địa chỉ.

     Giới hạn còn lại, nói cho đúng: ai mở được công cụ lập trình của trình duyệt
     thì vẫn sửa được biến trong bộ nhớ — không cách nào chặn ở phía máy người
     dùng. Chấp nhận được vì trò chơi không gửi điểm về máy chủ, gian lận chỉ
     ảnh hưởng lượt chơi của chính em đó. Ngày nào điểm được ghi lại thật thì
     phải kiểm ở phía máy chủ. */
  /* Hai MỨC chứ không phải bật/tắt:
       'thuong' — quản trị trường: bất tử, bay, nhảy màn. Đủ để đi hết các màn
                  mà kiểm nội dung câu hỏi, nhưng vẫn phải chơi đúng luật.
       'day-du' — quản trị hệ thống: bỏ qua MỌI ràng buộc, kể cả điều kiện qua
                  màn và câu hỏi. Dùng để soi nhanh mọi ngóc ngách khi dựng bài.
     Tách hai mức vì mức đầy đủ làm hỏng cả ý nghĩa của trò chơi — không nên
     đưa cho người chỉ cần kiểm nội dung. */
  const mucThu: 'khong' | 'thuong' | 'day-du' =
    currentUser?.role === 'admin' ? 'day-du'
      : currentUser?.role === 'school_admin' ? 'thuong'
        : 'khong';
  const choPhepThu = mucThu !== 'khong';

  useEffect(() => {
    const traLoi = (e: MessageEvent) => {
      // Chỉ nghe khung cùng nguồn, và chỉ đúng loại tin nhắn này
      if (e.origin !== window.location.origin) return;
      if (!e.data || e.data.loai !== 'hoa11:xin-che-do-thu') return;
      (e.source as Window | null)?.postMessage(
        /* Giữ `cho` cho trò cũ đọc được, thêm `muc` cho trò biết phân biệt. */
        { loai: 'hoa11:tra-loi-che-do-thu', cho: choPhepThu, muc: mucThu },
        window.location.origin,
      );
    };
    window.addEventListener('message', traLoi);
    return () => window.removeEventListener('message', traLoi);
  }, [choPhepThu, mucThu]);

  /* Báo cho trò chơi biết web đang ở nền sáng hay tối.

     Lần mở đầu tiên đã có ?theme= trên địa chỉ. Chỗ này lo phần người dùng bấm
     đổi nền GIỮA LÚC ĐANG CHƠI.

     Gửi hai lần (ngay và sau 400ms) vì không biết trang trò chơi đã nạp xong bộ
     nghe chưa. Nhắn thừa thì trò chơi chỉ đặt lại đúng màu đang có, vô hại.

     Trò chơi nào chưa biết nghe tin này thì bỏ qua, không sao. */
  useEffect(() => {
    const w = khungRef.current?.contentWindow;
    if (!w) return;
    const gui = () => w.postMessage(
      { loai: 'hoa11:che-do-mau', toi: laToi },
      window.location.origin,
    );
    gui();
    const hen = window.setTimeout(gui, 400);
    return () => window.clearTimeout(hen);
  }, [laToi, activeGame]);

  /* Tiến độ trò chơi có chia màn.

     Trò chơi là tệp tĩnh nên không biết ai đang đăng nhập — nó tự lưu vào
     localStorage của trình duyệt rồi nhắn ra đây. Chỗ này biết tài khoản nên
     mới ghi được xuống Firestore, và nhờ vậy em đổi máy vẫn còn tiến độ.

     Hai chiều:
       · trò chơi báo vừa qua màn  -> ghi xuống Firestore
       · trò chơi hỏi xin tiến độ  -> gửi bản đã lưu sang để nó gộp vào */
  useEffect(() => {
    const nghe = async (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data;
      if (!d || !d.tro) return;
      const email = currentUser?.email;

      if (d.loai === 'hoa11:tien-do-tro-choi' && email) {
        await luuTienDoTroChoi(email, String(d.tro), String(d.bai),
          { xong: !!d.xong, cauDung: Number(d.cauDung) || 0 });
        return;
      }

      if (d.loai === 'hoa11:xin-tien-do-tro-choi') {
        const td = email ? (getUserProgress(email)?.troChoi || {}) : {};
        (e.source as Window | null)?.postMessage({
          loai: 'hoa11:nap-tien-do-tro-choi',
          tro: d.tro,
          tienDo: td[String(d.tro)] || {},
        }, window.location.origin);
      }
    };
    window.addEventListener('message', nghe);
    return () => window.removeEventListener('message', nghe);
  }, [currentUser, luuTienDoTroChoi, getUserProgress]);

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

  /* Mở trò chơi thì vào luôn toàn màn hình.
     Trình duyệt CHỈ cho gọi requestFullscreen từ trong một cú bấm thật của
     người dùng, nên phải gọi ngay tại đây — đẩy vào useEffect hay setTimeout là
     mất "cử chỉ người dùng" và trình duyệt từ chối im lặng.
     Bọc catch vì có máy chặn toàn màn hình (iOS Safari, hoặc chính sách của
     trường): trò chơi vẫn phải mở bình thường, chỉ là không tràn màn hình. */
  const handleOpenGame = (game: GameData) => {
    setActiveGame(game);
    datDiaChiKhung(`${game.path}?theme=${laToi ? 'dark' : 'light'}`);
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const handleCloseGame = () => {
    setActiveGame(null);
    // Chỉ thoát khi CHÍNH mình đã bật; người chơi tự bấm F11 thì đừng đụng vào
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  };

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: 'var(--nen-xam)',
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
            color: 'var(--xanh-dam)',
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
            color: 'var(--chu-2)',
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
              bgcolor: 'var(--nen-the)',
              border: '2px solid var(--xanh-dam)',
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
                  color: 'var(--chu-dam)',
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
                  color: 'var(--chu-2)',
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
                  background: 'linear-gradient(90deg, var(--xanh-dam-nen) 0%, var(--xanh-nen) 100%)',
                  color: 'var(--chu-nguoc)',
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
                bgcolor: 'var(--xanh-dam-nen)',
                color: 'var(--chu-nguoc)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Gamepad2 size={20} /> {activeGame.title}
              </Typography>
              <IconButton onClick={handleCloseGame} sx={{ color: 'var(--chu-nguoc)' }} size="small">
                <X size={24} />
              </IconButton>
            </Box>
            <Box sx={{ flexGrow: 1, bgcolor: '#000000' }}>
              <iframe
                ref={khungRef}
                src={diaChiKhung}
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
