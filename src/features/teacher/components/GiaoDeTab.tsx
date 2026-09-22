import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, IconButton, LinearProgress, MenuItem, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import {
  ClipboardList, Copy, FileText, Link2, Lock, RefreshCw, Send, Trash2, Unlock, X,
} from 'lucide-react';
import { useApp } from '../../../core/hooks/useApp';
import { locHtml } from '../../../core/services/locHtml';
import { BankFirestore } from '../../bank/bankStore';
import { toChapter, toLegacy } from '../../bank/convert';
import { docBaiNopCuaCacEm } from '../../quiz/baiNopService';
import {
  datTrangThaiDong, docDeCuaLop, luuDeGiao, xoaDeGiao,
} from '../../quiz/deGiaoService';
import { tongDiem, trangThaiDe } from '../../quiz/taoDeGiao';
import type { TrangThaiDe } from '../../quiz/taoDeGiao';
import { DE_MAU_CAN_BANG, TEN_DE_MAU } from '../../quiz/deMauCanBang';
import type { DeGiao, Quiz } from '../../quiz/types';
import type { Question } from '../../library/types';
import type { User } from '../../auth/types';

/*
 * "Giao đề kiểm tra" — mục mới của trang giáo viên (22/09/2026).
 *
 * Trước đó đề kiểm tra CHỈ sinh ra khi học sinh tự bấm trong màn học, nên giáo
 * viên không có đường nào giao một đề chung cho cả lớp. Ở đây cô chọn câu từ
 * ngân hàng, đặt hạn nộp, rồi nhận một LINK THÔNG BÁO để dán vào nhóm lớp.
 *
 * Đề ghi thẳng lên `de_giao` (xem `deGiaoService.ts`); bài các em làm vẫn đi
 * qua `QuizPage` và `bai_nop` như cũ, không có đường chấm điểm thứ hai.
 */

const SO_CAU_MAC_DINH = 10;

const hai = (n: number) => String(n).padStart(2, '0');

/** `2026-09-22T19:30` cho <input type="datetime-local"> — theo giờ MÁY, không
 *  phải giờ UTC. Dùng `toISOString()` ở đây là lệch đúng 7 tiếng với Việt Nam. */
function choONhapGio(d: Date): string {
  return `${d.getFullYear()}-${hai(d.getMonth() + 1)}-${hai(d.getDate())}T${hai(d.getHours())}:${hai(d.getMinutes())}`;
}

function gioDep(iso: string): string {
  const d = new Date(iso);
  return `${hai(d.getDate())}/${hai(d.getMonth() + 1)}/${d.getFullYear()} ${hai(d.getHours())}:${hai(d.getMinutes())}`;
}

/** Link thông báo. HashRouter nên đường dẫn thật nằm sau dấu `#`. */
function linkCuaDe(id: string): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#/de/${id}`;
}

/** Đoạn thông báo dán thẳng vào nhóm lớp — cô không phải gõ lại. */
function loiThongBao(de: DeGiao): string {
  return [
    `📢 ${de.tieuDe}`,
    `Lớp: ${de.tenLop}`,
    `Số câu: ${de.questions.length} — Thời gian làm bài: ${de.soPhut} phút`,
    `Hạn nộp: ${gioDep(de.dongLuc)}`,
    de.loiDan ? `Ghi chú: ${de.loiDan}` : '',
    '',
    `Vào làm bài: ${linkCuaDe(de.id)}`,
    '(Đăng nhập bằng tài khoản của em rồi mở link trên.)',
  ].filter(Boolean).join('\n');
}

const NHAN_TRANG_THAI: Record<TrangThaiDe, { chu: string; mau: 'default' | 'success' | 'warning' }> = {
  'chua-mo': { chu: 'Chưa tới giờ', mau: 'warning' },
  'dang-mo': { chu: 'Đang mở', mau: 'success' },
  'da-dong': { chu: 'Đã đóng', mau: 'default' },
};

function xaoTron<T>(ds: T[]): T[] {
  const a = [...ds];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Chỉ nhận câu trắc nghiệm dùng được: đủ phương án và có đáp án đúng. */
function dungDuoc(q: Question): boolean {
  return q.type === 'Trắc nghiệm'
    && Array.isArray(q.options) && q.options.length >= 2
    && Boolean(q.correctAnswer)
    && Boolean((q.content || '').trim());
}

export const GiaoDeTab: React.FC<{ students: User[] }> = ({ students }) => {
  const { currentUser, curriculum, getMyClass } = useApp();
  const lop = getMyClass();

  // ── Biểu mẫu soạn đề ───────────────────────────────────────────────────────
  const [tieuDe, setTieuDe] = useState('');
  const [loiDan, setLoiDan] = useState('');
  const [maChuong, setMaChuong] = useState(curriculum[0]?.id || '');
  const [maBai, setMaBai] = useState('');            // rỗng = lấy cả chương
  const [soCau, setSoCau] = useState(SO_CAU_MAC_DINH);
  const [soPhut, setSoPhut] = useState(15);
  const [moLuc, setMoLuc] = useState(() => choONhapGio(new Date()));
  const [dongLuc, setDongLuc] = useState(() => choONhapGio(new Date(Date.now() + 7 * 86400_000)));

  const [kho, setKho] = useState<Question[] | null>(null);   // câu đọc về từ ngân hàng
  const [chon, setChon] = useState<Question[]>([]);
  const [dangLayCau, setDangLayCau] = useState(false);
  const [dangGiao, setDangGiao] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  // ── Danh sách đề đã giao ───────────────────────────────────────────────────
  const [dsDe, setDsDe] = useState<DeGiao[]>([]);
  const [baiNop, setBaiNop] = useState<Quiz[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [deVuaGiao, setDeVuaGiao] = useState<DeGiao | null>(null);
  const [hoiXoa, setHoiXoa] = useState<DeGiao | null>(null);
  const [daChep, setDaChep] = useState<string | null>(null);

  const chuong = curriculum.find(c => c.id === maChuong);
  const emails = useMemo(() => students.map(s => s.email.toLowerCase()), [students]);
  const khoaEmail = emails.slice().sort().join('|');

  const taiLai = useCallback(async () => {
    if (!lop) { setDangTai(false); return; }
    setDangTai(true);
    try {
      const [de, bn] = await Promise.all([
        docDeCuaLop(lop.id),
        docBaiNopCuaCacEm(khoaEmail ? khoaEmail.split('|') : []),
      ]);
      setDsDe(de);
      setBaiNop(bn);
    } catch (e) {
      console.warn('[giaoDe] không tải được danh sách đề', e);
      setLoi('Không tải được danh sách đề đã giao. Kiểm tra mạng rồi tải lại trang.');
    } finally {
      setDangTai(false);
    }
  }, [lop, khoaEmail]);

  useEffect(() => { void taiLai(); }, [taiLai]);

  // ── Lấy câu từ ngân hàng ───────────────────────────────────────────────────
  //
  // `getByLesson` (~80 lượt đọc) khi đã chọn bài, `getByChapter` (nhiều nhất
  // 583 ở chương 2) khi lấy cả chương. KHÔNG bao giờ `getAll()` — xem mục
  // "Hạn mức đọc" trong CLAUDE.md.
  const layCau = async () => {
    setLoi(null);
    setDangLayCau(true);
    try {
      const thoi = maBai
        ? await BankFirestore.getByLesson(maBai)
        : await BankFirestore.getByChapter(toChapter(maChuong));
      const dungDuocHet = thoi.map(toLegacy).filter(dungDuoc);
      setKho(dungDuocHet);
      setChon(xaoTron(dungDuocHet).slice(0, soCau));
      if (dungDuocHet.length === 0) {
        setLoi(maBai
          ? 'Bài này chưa có câu trắc nghiệm nào trong ngân hàng. Chọn bài khác hoặc lấy cả chương.'
          : 'Chương này chưa có câu trắc nghiệm nào trong ngân hàng.');
      } else if (dungDuocHet.length < soCau) {
        setLoi(`Ngân hàng chỉ có ${dungDuocHet.length} câu trắc nghiệm dùng được — đề sẽ có ${dungDuocHet.length} câu.`);
      }
    } catch (e) {
      console.error('[giaoDe] không đọc được ngân hàng', e);
      setLoi('Không đọc được ngân hàng câu hỏi. Kiểm tra mạng rồi thử lại.');
    } finally {
      setDangLayCau(false);
    }
  };

  const doiCauKhac = () => {
    if (!kho) return;
    setChon(xaoTron(kho).slice(0, soCau));
  };

  const boCau = (id: string) => setChon(ds => ds.filter(q => q.id !== id));

  /* Đề giấy của cô, nhập sẵn trong mã (`deMauCanBang.ts`). KHÔNG đọc ngân hàng,
     nên bấm nút này không tốn lượt đọc Firestore nào. */
  const dungDeMau = () => {
    setLoi(null);
    setKho(null);
    setChon(DE_MAU_CAN_BANG);
    setSoCau(DE_MAU_CAN_BANG.length);
    if (!tieuDe.trim()) setTieuDe(TEN_DE_MAU);
  };

  // ── Giao đề ────────────────────────────────────────────────────────────────
  const giaoDe = async () => {
    if (!lop || !currentUser) return;
    setLoi(null);

    if (!tieuDe.trim()) { setLoi('Đặt tên cho đề đã, ví dụ "Kiểm tra 15 phút — Chương 2".'); return; }
    if (chon.length === 0) { setLoi('Đề chưa có câu nào. Bấm "Lấy câu từ ngân hàng" trước.'); return; }
    const moMs = new Date(moLuc).getTime();
    const dongMs = new Date(dongLuc).getTime();
    if (!Number.isFinite(moMs) || !Number.isFinite(dongMs)) { setLoi('Giờ mở hoặc hạn nộp chưa hợp lệ.'); return; }
    if (dongMs <= moMs) { setLoi('Hạn nộp phải sau giờ mở đề.'); return; }
    if (soPhut < 1) { setLoi('Thời gian làm bài phải từ 1 phút trở lên.'); return; }

    setDangGiao(true);
    const de: DeGiao = {
      id: `de_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      tieuDe: tieuDe.trim(),
      ...(loiDan.trim() ? { loiDan: loiDan.trim() } : {}),
      classId: lop.id,
      tenLop: lop.name,
      teacherEmail: currentUser.email,
      teacherName: currentUser.name,
      questions: chon,
      maxScore: tongDiem(chon),
      soPhut,
      moLuc: new Date(moMs).toISOString(),
      dongLuc: new Date(dongMs).toISOString(),
      createdAt: new Date().toISOString(),
      dong: false,
    };

    try {
      await luuDeGiao(de);
      setDeVuaGiao(de);
      setTieuDe('');
      setLoiDan('');
      setChon([]);
      setKho(null);
      await taiLai();
    } catch (e) {
      console.error('[giaoDe] ghi đề thất bại', e);
      /* Nói ĐÚNG nguyên nhân thay vì kể ra mấy khả năng. `permission-denied`
         gần như luôn là luật `de_giao` chưa publish: tệp `firestore.rules`
         trong git chỉ là bản thảo, luật đang chạy nằm trên Firebase Console,
         và khối bắt-tất-cả ở cuối là `allow read, write: if false`. Gặp đúng
         ca này ngày 22/09/2026 — câu báo lỗi cũ đổ cho "mạng hoặc quyền giáo
         viên" khiến người đọc đi tìm sai chỗ. */
      const ma = (e as { code?: string })?.code;
      setLoi(ma === 'permission-denied'
        ? 'Firebase từ chối ghi đề: luật cho collection "de_giao" chưa được publish. '
          + 'Chạy lệnh `npx firebase deploy --only firestore:rules` rồi giao lại — '
          + 'đề đang soạn vẫn giữ nguyên, không phải nhập lại.'
        : `Không giao được đề${ma ? ` (${ma})` : ''}. Kiểm tra mạng rồi thử lại.`);
    } finally {
      setDangGiao(false);
    }
  };

  const chep = (chu: string, dau: string) => {
    void navigator.clipboard.writeText(chu);
    setDaChep(dau);
    setTimeout(() => setDaChep(null), 2000);
  };

  const doiDong = async (de: DeGiao) => {
    try {
      await datTrangThaiDong(de.id, !de.dong);
      await taiLai();
    } catch (e) {
      console.error('[giaoDe] không đổi được trạng thái đề', e);
      setLoi('Không đổi được trạng thái đề.');
    }
  };

  const xoa = async (de: DeGiao) => {
    setHoiXoa(null);
    try {
      await xoaDeGiao(de.id);
      await taiLai();
    } catch (e) {
      console.error('[giaoDe] không xoá được đề', e);
      setLoi('Không xoá được đề.');
    }
  };

  /** Số em đã nộp cho một đề — đếm từ `bai_nop`, không đếm từ máy giáo viên. */
  const soEmDaNop = (deId: string) =>
    new Set(baiNop.filter(q => q.deGiaoId === deId).map(q => q.userEmail)).size;

  if (!lop) {
    return (
      <Alert severity="info" sx={{ borderRadius: 0 }}>
        Bạn chưa có lớp nào. Tạo lớp ở mục "Quản lý Lớp học" rồi quay lại đây để giao đề.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Bản ở ĐẦU khối chỉ dùng khi đề chưa có câu nào — lúc đó form ngắn,
          nút vừa bấm và thông báo cùng nằm trong một màn hình. Đề đã có câu thì
          thông báo chuyển xuống sát nút "Giao đề" ở cuối form; xem chú thích ở
          đó. Cố ý KHÔNG hiện cả hai cùng lúc. */}
      {loi && chon.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 0 }} onClose={() => setLoi(null)}>{loi}</Alert>
      )}

      {/* ── SOẠN ĐỀ ──────────────────────────────────────────────────────── */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 0, border: '1px solid var(--vien)', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ClipboardList size={18} color="var(--luc-tham)" />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Soạn đề mới cho lớp {lop.name}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, mb: 2 }}>
          <TextField
            label="Tên đề *"
            placeholder="Kiểm tra 15 phút — Chương 2"
            value={tieuDe}
            onChange={e => setTieuDe(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Số câu"
            type="number"
            value={soCau}
            onChange={e => setSoCau(Math.max(1, Number(e.target.value) || 1))}
            fullWidth
            size="small"
          />
        </Box>

        <TextField
          label="Lời dặn cho học sinh (không bắt buộc)"
          placeholder="Làm bài nghiêm túc, không dùng tài liệu."
          value={loiDan}
          onChange={e => setLoiDan(e.target.value)}
          fullWidth
          size="small"
          multiline
          minRows={2}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mb: 2 }}>
          <TextField
            select label="Chương" value={maChuong} size="small" fullWidth
            onChange={e => { setMaChuong(e.target.value); setMaBai(''); setKho(null); setChon([]); }}
          >
            {curriculum.map(c => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
          </TextField>
          <TextField
            select label="Bài học" value={maBai} size="small" fullWidth
            onChange={e => { setMaBai(e.target.value); setKho(null); setChon([]); }}
            helperText="Để trống là lấy câu của cả chương"
          >
            <MenuItem value="">— Cả chương —</MenuItem>
            {(chuong?.lessons || []).map(l => <MenuItem key={l.id} value={l.id}>{l.title}</MenuItem>)}
          </TextField>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
          <TextField
            label="Thời gian làm bài (phút)" type="number" size="small" fullWidth
            value={soPhut} onChange={e => setSoPhut(Math.max(1, Number(e.target.value) || 1))}
          />
          <TextField
            label="Mở đề lúc" type="datetime-local" size="small" fullWidth
            value={moLuc} onChange={e => setMoLuc(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Hạn nộp" type="datetime-local" size="small" fullWidth
            value={dongLuc} onChange={e => setDongLuc(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: chon.length ? 2 : 0 }}>
          <Button
            variant="outlined" color="secondary" size="small"
            startIcon={<ClipboardList size={15} />}
            onClick={() => void layCau()} disabled={dangLayCau}
          >
            {dangLayCau ? 'Đang đọc ngân hàng…' : 'Lấy câu từ ngân hàng'}
          </Button>
          <Button
            id="giao-de-mau-btn"
            variant="outlined" size="small"
            startIcon={<FileText size={15} />}
            onClick={dungDeMau}
          >
            Đề mẫu 10 câu — Cân bằng hoá học
          </Button>
          {kho && kho.length > chon.length && (
            <Button variant="text" size="small" startIcon={<RefreshCw size={15} />} onClick={doiCauKhac}>
              Đổi bộ câu khác
            </Button>
          )}
        </Box>

        {dangLayCau && <LinearProgress sx={{ mt: 1 }} />}

        {chon.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'var(--chu-2)' }}>
              ĐỀ XEM TRƯỚC — {chon.length} CÂU, {tongDiem(chon)} ĐIỂM
            </Typography>
            <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {chon.map((q, i) => (
                <Paper key={q.id} sx={{ p: 1.5, borderRadius: 0, border: '1px solid var(--vien)', boxShadow: 'none', display: 'flex', gap: 1.5 }}>
                  <Typography sx={{ fontWeight: 800, minWidth: 28, fontVariantNumeric: 'tabular-nums' }}>
                    {i + 1}.
                  </Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Nội dung câu tới từ `bank_questions` — collection ai cũng
                        ghi được, nên PHẢI đi qua locHtml. Xem locHtml.ts. */}
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      <span dangerouslySetInnerHTML={{ __html: locHtml(q.content) }} />
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0.5, mt: 0.75 }}>
                      {(q.options || []).map(o => (
                        <Typography
                          key={o.key}
                          variant="caption"
                          sx={{ color: o.key === q.correctAnswer ? 'var(--luc-tham)' : 'var(--chu-2)', fontWeight: o.key === q.correctAnswer ? 700 : 400 }}
                        >
                          {o.key}. <span dangerouslySetInnerHTML={{ __html: locHtml(o.text) }} />
                        </Typography>
                      ))}
                    </Box>
                    <Chip label={q.difficulty} size="small" sx={{ mt: 0.75, height: 18, fontSize: '0.62rem' }} />
                  </Box>
                  <Tooltip title="Bỏ câu này khỏi đề">
                    <IconButton size="small" onClick={() => boCau(q.id)}><X size={15} /></IconButton>
                  </Tooltip>
                </Paper>
              ))}
            </Box>

            {/* Báo lỗi NGAY CẠNH nút, không phải ở đầu khối (22/09/2026).
                Khối xem trước 10 câu cao hơn một màn hình, nên khi cô bấm nút ở
                CUỐI form thì thông báo hiện ở ĐẦU form nằm ngoài tầm nhìn — cô
                thấy "bấm không có gì xảy ra" trong khi mã đã báo lỗi đúng.
                Đây là lỗi thật đã xảy ra: luật `de_giao` chưa publish, đề bị
                từ chối, mà không ai biết vì sao. Phản hồi phải ở nơi mắt đang
                nhìn, tức ngay dưới ngón tay vừa bấm. */}
            {loi && (
              <Alert id="giao-de-loi" severity="warning" sx={{ mt: 2, borderRadius: 0 }} onClose={() => setLoi(null)}>
                {loi}
              </Alert>
            )}

            <Button
              id="giao-de-submit-btn"
              variant="contained" color="secondary" sx={{ mt: 2 }}
              startIcon={<Send size={16} />}
              onClick={() => void giaoDe()} disabled={dangGiao}
            >
              {dangGiao ? 'Đang giao…' : `Giao đề cho lớp ${lop.name}`}
            </Button>
          </>
        )}
      </Paper>

      {/* ── ĐỀ ĐÃ GIAO ───────────────────────────────────────────────────── */}
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1.5 }}>
        Đề đã giao cho lớp {lop.name}
      </Typography>
      {dangTai && <LinearProgress sx={{ mb: 1 }} />}
      <TableContainer component={Paper} sx={{ borderRadius: 0, border: '1px solid var(--vien)', boxShadow: 'none' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'var(--nen-nhat)' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Tên đề</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Số câu</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Hạn nộp</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Đã nộp</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dsDe.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Chưa giao đề nào cho lớp này.
                </TableCell>
              </TableRow>
            ) : dsDe.map(de => {
              const tt = NHAN_TRANG_THAI[trangThaiDe(de)];
              return (
                <TableRow key={de.id} hover data-de-id={de.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{de.tieuDe}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{de.questions.length}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{gioDep(de.dongLuc)}</TableCell>
                  <TableCell><Chip label={tt.chu} size="small" color={tt.mau} /></TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 'bold' }}>
                    {soEmDaNop(de.id)}/{students.length}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={daChep === de.id ? 'Đã chép!' : 'Chép link thông báo'}>
                      <IconButton size="small" onClick={() => chep(loiThongBao(de), de.id)}>
                        {daChep === de.id ? <Copy size={15} color="var(--luc-tham)" /> : <Link2 size={15} />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={de.dong ? 'Mở lại đề' : 'Đóng đề sớm'}>
                      <IconButton size="small" onClick={() => void doiDong(de)}>
                        {de.dong ? <Unlock size={15} /> : <Lock size={15} />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xoá đề">
                      <IconButton size="small" data-xoa onClick={() => setHoiXoa(de)}><Trash2 size={15} /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── HỘP THOẠI: LINK THÔNG BÁO ────────────────────────────────────── */}
      <Dialog open={Boolean(deVuaGiao)} onClose={() => setDeVuaGiao(null)} maxWidth="sm" fullWidth>
        <DialogTitle id="giao-de-xong" sx={{ fontWeight: 'bold' }}>Đã giao đề cho lớp {deVuaGiao?.tenLop}</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2, borderRadius: 0 }}>
            Gửi đoạn dưới đây vào nhóm lớp. Học sinh đăng nhập rồi mở link là vào làm bài.
          </Alert>
          {deVuaGiao && (
            <TextField
              value={loiThongBao(deVuaGiao)}
              fullWidth multiline minRows={8}
              slotProps={{ input: { readOnly: true, sx: { fontSize: '0.85rem' } } }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined" startIcon={<Copy size={16} />}
            onClick={() => deVuaGiao && chep(loiThongBao(deVuaGiao), 'moi')}
          >
            {daChep === 'moi' ? '✓ Đã chép' : 'Chép thông báo'}
          </Button>
          <Button variant="contained" onClick={() => setDeVuaGiao(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* ── HỘP THOẠI: XÁC NHẬN XOÁ ──────────────────────────────────────── */}
      <Dialog open={Boolean(hoiXoa)} onClose={() => setHoiXoa(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Xoá đề "{hoiXoa?.tieuDe}"?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Link thông báo sẽ không mở được nữa. Bài các em ĐÃ nộp vẫn giữ nguyên trong mục
            "Bài kiểm tra và chấm tự luận".
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setHoiXoa(null)}>Huỷ</Button>
          <Button id="giao-de-xoa-xac-nhan" variant="contained" color="error" onClick={() => hoiXoa && void xoa(hoiXoa)}>Xoá đề</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GiaoDeTab;
