import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Paper, Button, Alert, AlertTitle,
  CircularProgress, Stack,
} from '@mui/material';
import { LogIn, RefreshCw, Target } from 'lucide-react';
import { useApp } from '../../core/hooks/useApp';
import { Lesson } from '../lessons/types';
import { BankQuestion } from '../bank/types';
import { PhanLuyenTap, TEN_PHAN, TienDoLuyenTap, TienDoPhan, KetQuaLuot, PHUT_KHOA } from './types';
import {
  demTuoiCuaBai, layCauChoLuot, layCauTheoId, trangThaiPhan, moTaThieuCau,
  capLaiLuot, tienDoCuaPhan, xoaCacheKho,
} from './practiceService';
import { PracticeList } from './components/PracticeList';
import { PracticeRunner } from './components/PracticeRunner';
import { ReviewGate } from './components/ReviewGate';
import { troChoiCuaBai } from './troChoiOn';
import { datYeuCauMoTroChoi } from '../games/yeuCauMoTroChoi';
import { daChoiSauKhi } from './logic';

type Man = 'danh-sach' | 'lam-bai' | 'on-lai';

interface Props {
  /** Chuyển sang tab Trò chơi. Không truyền thì Luyện tập không hiện nút chơi. */
  onMoTroChoi?: () => void;
  /** Đưa học sinh sang tab đăng nhập / khu vực học sinh */
  onDangNhap?: () => void;
}

export const PracticeSection: React.FC<Props> = ({ onDangNhap, onMoTroChoi }) => {
  const { currentUser, curriculum, getUserProgress, luuTienDoLuyenTap } = useApp();

  /* Mở trò chơi ôn đúng bài này. Phải đi qua tab Trò chơi của web chứ không mở
     tab trình duyệt mới: trò chơi gửi tiến độ về bằng postMessage tới cửa sổ
     cha, mở rời ra là mất tiến độ — mà tiến độ chính là thứ mở khoá lượt. */
  const moTroChoiCuaBai = (b: Lesson, thuTu: number) => {
    datYeuCauMoTroChoi(troChoiCuaBai(b.id, thuTu).id);
    onMoTroChoi?.();
  };

  /** Thứ tự bài trong cả chương trình, tính từ 0. */
  const chiSoBai = (lessonId: string) =>
    Math.max(0, curriculum.flatMap(c => c.lessons).findIndex(l => l.id === lessonId));

  /* Em có chơi xong màn của bài này SAU khi bị khoá không. Mốc là lúc BẮT ĐẦU
     khoá = hết khoá trừ đi độ dài khoá; chơi trước đó thì không tính. */
  const daChoiDeMoKhoa = (lessonId: string, p: PhanLuyenTap): boolean => {
    const het = tienDoCuaPhan(tienDo, lessonId, p).khoaDenLuc;
    if (!het) return false;
    const tro = troChoiCuaBai(lessonId, chiSoBai(lessonId));
    return daChoiSauKhi(getUserProgress(email), tro.id, tro.man, het - PHUT_KHOA * 60 * 1000);
  };

  const [dangTai, setDangTai] = useState(true);
  const [loiTai, setLoiTai] = useState<string | null>(null);
  const [tienDo, setTienDo] = useState<TienDoLuyenTap>({});

  const [man, setMan] = useState<Man>('danh-sach');
  const [bai, setBai] = useState<Lesson | null>(null);
  const [phan, setPhan] = useState<PhanLuyenTap>('mc');
  const [cauHoi, setCauHoi] = useState<BankQuestion[]>([]);
  const [cauLamSai, setCauLamSai] = useState<BankQuestion[]>([]);
  const [dangLuu, setDangLuu] = useState(false);
  const [loiLuu, setLoiLuu] = useState<string | null>(null);
  /* Mỗi lượt một số mới, làm `key` của PracticeRunner. "Làm lại với đề khác"
     giữ nguyên màn 'lam-bai' nên thiếu key thì React giữ runner cũ, kèm luôn
     `ketQua` của lượt trước: đề mới hiện ra ở trạng thái ĐÃ NỘP — lộ đáp án,
     khóa ô chọn, mất nút Nộp bài. */
  const [maLuot, setMaLuot] = useState(0);

  const email = currentUser?.email || '';

  /* ── Nạp tiến độ của học sinh ──────────────────────────────────────────────
     CỐ Ý không đọc ngân hàng ở đây. Danh sách bài vẽ được bằng tiến độ, và
     đếm số câu lúc mở tab nghĩa là tải cả 1.554 câu cho mỗi em mỗi phiên —
     bậc miễn phí chỉ cho 50.000 lượt đọc/ngày. Số câu được hỏi lúc em bấm vào
     một bài, xem `chonPhan`. */
  const nap = useCallback(async () => {
    setDangTai(true);
    setLoiTai(null);
    const tt = getUserProgress(email);
    setTienDo((tt?.luyenTap || {}) as TienDoLuyenTap);
    setDangTai(false);
  }, [email, getUserProgress]);

  useEffect(() => {
    if (currentUser) nap();
    else setDangTai(false);
  }, [currentUser, nap]);

  // ── Ghi tiến độ ────────────────────────────────────────────────────────────
  const ghiTienDo = async (lessonId: string, p: PhanLuyenTap, moi: TienDoPhan) => {
    setTienDo(cu => ({ ...cu, [lessonId]: { ...(cu[lessonId] || {}), [p]: moi } }));
    setDangLuu(true);
    setLoiLuu(null);
    try {
      await luuTienDoLuyenTap(email, lessonId, p, moi);
    } catch {
      setLoiLuu('Chưa lưu được kết quả lên máy chủ. Em kiểm tra mạng — kết quả '
        + 'lượt này có thể mất khi tải lại trang.');
    } finally {
      setDangLuu(false);
    }
  };

  // ── Bắt đầu / làm lại một lượt ─────────────────────────────────────────────
  const batDauLuot = async (b: Lesson, p: PhanLuyenTap, td: TienDoPhan) => {
    setLoiLuu(null);
    const cau = await layCauChoLuot(b.id, p, td);
    if (!cau.length) {
      setLoiTai(`Bài "${b.title}" chưa đủ câu cho phần ${TEN_PHAN[p]}.`);
      setMan('danh-sach');
      return;
    }
    setCauHoi(cau);
    setMaLuot(n => n + 1);
    setBai(b);
    setPhan(p);
    setMan('lam-bai');
  };

  const chonPhan = async (b: Lesson, p: PhanLuyenTap) => {
    const td = tienDoCuaPhan(tienDo, b.id, p);

    /* Danh sách vẽ bằng tiến độ nên chưa biết bài này có bao nhiêu câu. Hỏi ở
       ĐÂY, đúng bài em vừa bấm, và đây là con số thật — không có bảng đếm dựng
       sẵn ở đâu cả, nên thầy cô nhập câu hỏi xong là em thấy ngay, không phải
       chờ deploy lại.
       Lượt đọc này không phải chi phí thêm: `demTuoiCuaBai` và `layCauChoLuot`
       bên dưới dùng chung một lần tải, giữ lại suốt phiên. */
    setDangTai(true);
    let dem: Record<PhanLuyenTap, number>;
    try {
      dem = await demTuoiCuaBai(b.id);
    } catch (err) {
      console.error('[Luyện tập] Không đọc được ngân hàng câu hỏi:', err);
      /* Nói rõ là LỖI TẢI chứ không im lặng coi như bài trống. Kho rỗng và mất
         mạng nhìn giống hệt nhau trên màn hình, mà cách xử lý khác hẳn. */
      setLoiTai('Không tải được ngân hàng câu hỏi. Em kiểm tra lại mạng rồi bấm Thử lại.');
      return;
    } finally {
      setDangTai(false);
    }

    const tt = trangThaiPhan(p, tienDo[b.id], dem);

    if (tt === 'dang-khoa' || tt === 'can-on-lai') {
      setCauLamSai(await layCauTheoId(td.daSai || []));
      setBai(b);
      setPhan(p);
      setMan('on-lai');
      return;
    }
    if (tt === 'chua-mo') return;
    if (tt === 'thieu-cau') {
      setLoiTai(`Bài "${b.title}" chưa đủ câu cho phần ${TEN_PHAN[p]}. `
        + `${moTaThieuCau(dem)}. Em báo thầy/cô bổ sung giúp nhé.`);
      return;
    }

    /* Phần đã đạt: cho làm lại thoải mái để ôn. `capNhatSauLuot` chỉ khóa khi
       CHƯA đạt, nên em luyện thêm không bao giờ bị khóa ngược lại. */
    await batDauLuot(b, p, td);
  };

  const lamLai = async () => {
    if (!bai) return;
    /* Đọc tiến độ MỚI NHẤT (đã có câu vừa gặp) chứ không dùng biến cũ — nếu
       không, lượt sau rút trúng y hệt bộ câu vừa làm. */
    await batDauLuot(bai, phan, tienDoCuaPhan(tienDo, bai.id, phan));
  };

  const onXong = async () => {
    if (!bai) return;
    const moi = capLaiLuot(tienDoCuaPhan(tienDo, bai.id, phan));
    await ghiTienDo(bai.id, phan, moi);
    setMan('danh-sach');
  };

  const nopBai = (moi: TienDoPhan, _kq: KetQuaLuot) => {
    if (!bai) return;
    void ghiTienDo(bai.id, phan, moi);
  };

  // ── Các trạng thái màn hình ────────────────────────────────────────────────

  if (!currentUser) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Target size={40} color="var(--xanh)" />
          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1.5, mb: 1 }}>
            Luyện tập cần đăng nhập
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Phần này ghi lại em đã qua bài nào, còn mấy lượt làm lại và điểm cao
            nhất từng phần. Những thứ đó gắn với tài khoản nên em cần đăng nhập
            thì mới lưu được, và đổi sang máy khác vẫn còn.
          </Typography>
          {onDangNhap && (
            <Button variant="contained" startIcon={<LogIn size={18} />} onClick={onDangNhap}>
              Đăng nhập để luyện tập
            </Button>
          )}
        </Paper>
      </Container>
    );
  }

  if (dangTai) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Đang tải ngân hàng câu hỏi…
        </Typography>
      </Box>
    );
  }

  if (loiTai && man === 'danh-sach') {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert
          severity="error"
          action={
            <Button
              size="small"
              startIcon={<RefreshCw size={14} />}
              onClick={() => { xoaCacheKho(); void nap(); }}
            >
              Thử lại
            </Button>
          }
        >
          <AlertTitle>Chưa mở được phần Luyện tập</AlertTitle>
          {loiTai}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {man === 'danh-sach' && (
        <PracticeList
          curriculum={curriculum}
          tienDo={tienDo}
          onChon={(b, p) => { void chonPhan(b, p); }}
          onChoiOn={onMoTroChoi ? moTroChoiCuaBai : undefined}
        />
      )}

      {man === 'lam-bai' && bai && (
        <PracticeRunner
          key={maLuot}
          tenBai={bai.title}
          phan={phan}
          cauHoi={cauHoi}
          tienDo={tienDoCuaPhan(tienDo, bai.id, phan)}
          onNop={nopBai}
          onLamLai={() => { void lamLai(); }}
          onThoat={() => setMan('danh-sach')}
          dangLuu={dangLuu}
          loiLuu={loiLuu}
        />
      )}

      {man === 'on-lai' && bai && (
        <ReviewGate
          bai={bai}
          phan={phan}
          khoaDenLuc={tienDoCuaPhan(tienDo, bai.id, phan).khoaDenLuc}
          cauLamSai={cauLamSai}
          onOnXong={() => { void onXong(); }}
          onThoat={() => setMan('danh-sach')}
          dangLuu={dangLuu}
          troChoi={troChoiCuaBai(bai.id, chiSoBai(bai.id))}
          daChoiDeMoKhoa={daChoiDeMoKhoa(bai.id, phan)}
          onChoiNgay={onMoTroChoi ? () => moTroChoiCuaBai(bai, chiSoBai(bai.id)) : undefined}
        />
      )}

      {loiLuu && man !== 'lam-bai' && (
        <Alert severity="warning" sx={{ mt: 2 }}>{loiLuu}</Alert>
      )}

      <Stack sx={{ mt: 4 }} />
    </Container>
  );
};
