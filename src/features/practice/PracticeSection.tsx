import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Paper, Button, Alert, AlertTitle,
  CircularProgress, Stack,
} from '@mui/material';
import { LogIn, RefreshCw, Target } from 'lucide-react';
import { useApp } from '../../core/hooks/useApp';
import { Lesson } from '../lessons/types';
import { BankQuestion } from '../bank/types';
import { PhanLuyenTap, TEN_PHAN, TienDoLuyenTap, TienDoPhan, KetQuaLuot } from './types';
import {
  demCauTheoBai, demCuaBai, layCauChoLuot, layCauTheoId, trangThaiPhan,
  capLaiLuot, tienDoCuaPhan, xoaCacheKho, BangDemCau,
} from './practiceService';
import { PracticeList } from './components/PracticeList';
import { PracticeRunner } from './components/PracticeRunner';
import { ReviewGate } from './components/ReviewGate';

type Man = 'danh-sach' | 'lam-bai' | 'on-lai';

interface Props {
  /** Đưa học sinh sang tab đăng nhập / khu vực học sinh */
  onDangNhap?: () => void;
}

export const PracticeSection: React.FC<Props> = ({ onDangNhap }) => {
  const { currentUser, curriculum, getUserProgress, luuTienDoLuyenTap } = useApp();

  const [dangTai, setDangTai] = useState(true);
  const [loiTai, setLoiTai] = useState<string | null>(null);
  const [bangDem, setBangDem] = useState<BangDemCau>({});
  const [tienDo, setTienDo] = useState<TienDoLuyenTap>({});

  const [man, setMan] = useState<Man>('danh-sach');
  const [bai, setBai] = useState<Lesson | null>(null);
  const [phan, setPhan] = useState<PhanLuyenTap>('mc');
  const [cauHoi, setCauHoi] = useState<BankQuestion[]>([]);
  const [cauLamSai, setCauLamSai] = useState<BankQuestion[]>([]);
  const [dangLuu, setDangLuu] = useState(false);
  const [loiLuu, setLoiLuu] = useState<string | null>(null);

  const email = currentUser?.email || '';

  // ── Nạp số câu trong kho + tiến độ của học sinh ────────────────────────────
  const nap = useCallback(async () => {
    setDangTai(true);
    setLoiTai(null);
    try {
      const bang = await demCauTheoBai();
      setBangDem(bang);
      const tt = getUserProgress(email);
      setTienDo((tt?.luyenTap || {}) as TienDoLuyenTap);
    } catch (err) {
      console.error('[Luyện tập] Không đọc được ngân hàng câu hỏi:', err);
      /* Nói rõ là LỖI TẢI chứ không im lặng hiện danh sách trống. Kho rỗng và
         mất mạng nhìn giống hệt nhau trên màn hình, mà cách xử lý thì khác
         hẳn. */
      setLoiTai('Không tải được ngân hàng câu hỏi. Em kiểm tra lại mạng rồi bấm Thử lại.');
    } finally {
      setDangTai(false);
    }
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
    setBai(b);
    setPhan(p);
    setMan('lam-bai');
  };

  const chonPhan = async (b: Lesson, p: PhanLuyenTap) => {
    const td = tienDoCuaPhan(tienDo, b.id, p);
    const tt = trangThaiPhan(p, tienDo[b.id], demCuaBai(bangDem, b.id));

    if (tt === 'dang-khoa' || tt === 'can-on-lai') {
      setCauLamSai(await layCauTheoId(td.daSai || []));
      setBai(b);
      setPhan(p);
      setMan('on-lai');
      return;
    }
    if (tt === 'chua-mo' || tt === 'thieu-cau') return;

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
          bangDem={bangDem}
          tienDo={tienDo}
          onChon={(b, p) => { void chonPhan(b, p); }}
        />
      )}

      {man === 'lam-bai' && bai && (
        <PracticeRunner
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
        />
      )}

      {loiLuu && man !== 'lam-bai' && (
        <Alert severity="warning" sx={{ mt: 2 }}>{loiLuu}</Alert>
      )}

      <Stack sx={{ mt: 4 }} />
    </Container>
  );
};
