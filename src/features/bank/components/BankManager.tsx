import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, FormControl, IconButton, InputLabel, MenuItem, Radio, Select,
  Stack, TextField, Tooltip, Typography, Alert, CircularProgress,
} from '@mui/material';
import { Plus, Pencil, Trash2, RefreshCw, Upload, Download, Image as ImageIcon, X, FileUp } from 'lucide-react';
import { useApp } from '../../../core/hooks/useApp';
import {
  BankQuestion, Chapter, Level, QType, LEVELS, QTYPE_NAME, CHAPTERS, pointsOf,
} from '../types';
import { BankFirestore, pushToGame, syncBackFromGame } from '../bankStore';
import { chuyenDoiNganHang, daChuyenDoi, MigrateReport } from '../migrate';
import { ImportFromFile } from './ImportFromFile';

/**
 * Quản lý ngân hàng câu hỏi theo đúng cấu trúc của trò chơi Vòng Quanh Hóa 11:
 * chương (1–6) × mức độ (nb/th/vd/vdc) × dạng câu (mc/tf/tn/tl).
 *
 * Giữ đủ những thứ bản web cũ có mà game không có: ảnh, ý chấm tự luận,
 * điểm riêng từng câu, chủ đề, liên kết bài học.
 */

const LV_COLOR: Record<Level, string> = {
  nb: '#0f766e', th: '#0062b8', vd: '#ea580c', vdc: '#b91c1c',
};

function blank(): BankQuestion {
  return {
    id: '', ch: 1, lv: 'nb', t: 'mc',
    q: '', e: '', o: ['', '', '', ''], a: 0,
    st: [{ s: '', v: true }, { s: '', v: false }],
    ansText: '', unit: '', ans: '', essayPoints: [],
  };
}

export const BankManager: React.FC = () => {
  const { currentUser } = useApp();

  const [items, setItems] = useState<BankQuestion[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [bao, setBao] = useState<{ loai: 'ok' | 'loi' | 'tin'; chu: string } | null>(null);

  const [fCh, setFCh] = useState<'all' | Chapter>('all');
  const [fLv, setFLv] = useState<'all' | Level>('all');
  const [fT, setFT] = useState<'all' | QType>('all');
  const [tim, setTim] = useState('');

  const [mo, setMo] = useState(false);
  const [form, setForm] = useState<BankQuestion>(blank());
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Nạp dữ liệu ──
  const [napLoi, setNapLoi] = useState(false);
  const nap = async () => {
    setDangTai(true);
    try {
      setItems(await BankFirestore.getAll());
      setNapLoi(false);
    } catch {
      // Không im lặng: nếu coi lỗi mạng là "ngân hàng trống" thì người dùng
      // rất dễ bấm "Đưa sang trò chơi" và ghi đè mất ngân hàng thật.
      setNapLoi(true);
      setBao({ loai: 'loi', chu: 'Không đọc được ngân hàng từ máy chủ. Kiểm tra mạng rồi bấm Tải lại — ĐỪNG đưa sang trò chơi lúc này để tránh ghi đè mất dữ liệu.' });
    } finally {
      setDangTai(false);
    }
  };
  useEffect(() => { nap(); }, []);

  // ── Lọc ──
  const hienThi = useMemo(() => {
    const k = tim.trim().toLowerCase();
    return items.filter(q =>
      (fCh === 'all' || q.ch === fCh) &&
      (fLv === 'all' || q.lv === fLv) &&
      (fT === 'all' || q.t === fT) &&
      (!k || q.q.toLowerCase().includes(k) || (q.topic || '').toLowerCase().includes(k)),
    );
  }, [items, fCh, fLv, fT, tim]);

  const dem = useMemo(() => {
    const d: Record<string, number> = {};
    items.forEach(q => { d[q.lv] = (d[q.lv] || 0) + 1; });
    return d;
  }, [items]);

  // ── Lưu / xoá ──
  const luu = async () => {
    const q: BankQuestion = { ...form };
    if (!q.q.trim()) { setBao({ loai: 'loi', chu: 'Chưa nhập nội dung câu hỏi.' }); return; }

    if (q.t === 'mc') {
      if ((q.o || []).filter(x => x.trim()).length < 4) {
        setBao({ loai: 'loi', chu: 'Trắc nghiệm cần đủ 4 phương án.' }); return;
      }
      delete q.st; delete q.ansText; delete q.num; delete q.unit; delete q.tol; delete q.ans;
    } else if (q.t === 'tf') {
      q.st = (q.st || []).filter(s => s.s.trim());
      if (q.st.length < 2) {
        setBao({ loai: 'loi', chu: 'Câu Đúng/Sai cần ít nhất 2 ý có nội dung.' }); return;
      }
      delete q.o; delete q.a; delete q.ansText; delete q.num; delete q.unit; delete q.tol; delete q.ans;
    } else if (q.t === 'tn') {
      const n = parseFloat(String(q.ansText || '').replace(',', '.'));
      if (!isFinite(n)) {
        setBao({ loai: 'loi', chu: 'Đáp án trả lời ngắn phải là một số, ví dụ 2,479.' }); return;
      }
      q.num = n;
      delete q.o; delete q.a; delete q.st; delete q.ans;
    } else {
      if (!String(q.ans || '').trim()) {
        setBao({ loai: 'loi', chu: 'Câu tự luận cần đáp án tham khảo để đối chiếu khi chấm.' }); return;
      }
      delete q.o; delete q.a; delete q.st; delete q.ansText; delete q.num; delete q.unit; delete q.tol;
    }

    if (!q.id) {
      q.id = `bq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      q.createdAt = new Date().toISOString();
      q.createdBy = currentUser?.email || currentUser?.name || 'không rõ';
    }
    if (q.essayPoints && !q.essayPoints.length) delete q.essayPoints;

    const ok = await BankFirestore.save(q);
    if (!ok) { setBao({ loai: 'loi', chu: 'Không ghi được lên máy chủ. Kiểm tra kết nối rồi thử lại.' }); return; }

    setItems(prev => {
      const i = prev.findIndex(x => x.id === q.id);
      return i >= 0 ? prev.map(x => (x.id === q.id ? q : x)) : [...prev, q];
    });
    setMo(false);
    setBao({ loai: 'ok', chu: 'Đã lưu câu hỏi.' });
  };

  const xoa = async (id: string) => {
    if (!window.confirm('Xoá hẳn câu hỏi này khỏi ngân hàng?')) return;
    const ok = await BankFirestore.remove(id);
    if (!ok) { setBao({ loai: 'loi', chu: 'Không xoá được trên máy chủ.' }); return; }
    setItems(prev => prev.filter(q => q.id !== id));
    setBao({ loai: 'ok', chu: 'Đã xoá câu hỏi.' });
  };

  // ── Đồng bộ với trò chơi ──
  const bomSangGame = async () => {
    if (napLoi) {
      setBao({ loai: 'loi', chu: 'Chưa đọc được ngân hàng từ máy chủ nên không đưa sang trò chơi, tránh ghi đè bằng dữ liệu rỗng.' });
      return;
    }
    const ok = await pushToGame(items);
    setBao(ok
      ? { loai: 'ok', chu: `Đã đưa ${items.length} câu sang trò chơi Vòng Quanh Hóa 11.` }
      : { loai: 'loi', chu: 'Trình duyệt không cho ghi IndexedDB nên chưa đưa sang được.' });
  };

  const hutVeTuGame = async () => {
    const kq = await syncBackFromGame(items);
    if (!kq.changed.length && !kq.removed.length) {
      setBao({ loai: 'tin', chu: 'Bên trò chơi không có thay đổi nào mới.' });
      return;
    }
    await nap();
    setBao({
      loai: 'ok',
      chu: `Đã nhận ${kq.changed.length} câu sửa/thêm và ${kq.removed.length} câu xoá từ trò chơi.`,
    });
  };

  // ── Chuyển dữ liệu cũ ──
  const [dangChuyen, setDangChuyen] = useState(false);
  const chuyenDoi = async () => {
    if (napLoi) {
      setBao({ loai: 'loi', chu: 'Chưa đọc được ngân hàng hiện có nên chưa chuyển đổi được — chuyển lúc này sẽ tạo ra bản trùng lặp.' });
      return;
    }
    setDangChuyen(true);
    let rp: MigrateReport | null = null;
    try {
      rp = await chuyenDoiNganHang();
    } catch (err) {
      setBao({ loai: 'loi', chu: err instanceof Error ? err.message : 'Chuyển đổi thất bại.' });
    } finally {
      setDangChuyen(false);
    }
    if (!rp) return;
    await nap();
    setBao({
      loai: rp.thieuSot ? 'loi' : 'ok',
      chu: `Chuyển xong: ${rp.tuNganHangDuLieu} câu từ Ngân hàng dữ liệu, ${rp.tuThuVien} câu từ Thư viện, `
        + `${rp.tuCauMauGame} câu mẫu từ trò chơi, bỏ qua ${rp.boQuaVìDaCo} câu đã có. `
        + `Ghi được ${rp.daGhi} câu.`
        + (rp.thieuSot ? ' CÓ PHẦN CHƯA XONG — chạy lại để bù.' : ''),
    });
  };

  // ── Nạp đề từ file ──
  const [moNap, setMoNap] = useState(false);
  const duyetTuFile = async (rows: BankQuestion[]) => {
    const so = await BankFirestore.saveMany(rows);
    await nap();
    setBao(so === rows.length
      ? { loai: 'ok', chu: `Đã duyệt ${so} câu từ file vào ngân hàng.` }
      : { loai: 'loi', chu: `Chỉ ghi được ${so}/${rows.length} câu. Số còn lại vẫn nằm ở khu chờ duyệt.` });
  };

  // ── Ảnh ──
  const chonAnh = (f: File | undefined) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setForm(s => ({ ...s, img: String(r.result) }));
    r.readAsDataURL(f);
  };

  return (
    <Box>
      {/* Thanh công cụ */}
      {/* flexWrap để nút cuối xuống dòng thay vì bị đẩy tràn ra ngoài khung —
          ở màn hình hẹp hoặc khi trình duyệt phóng to, hàng này không đủ chỗ. */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}
        sx={{ alignItems: 'stretch', mb: 2, flexWrap: 'wrap', rowGap: 1.5 }}>
        <Button variant="contained" startIcon={<Plus size={18} />}
          onClick={() => { setForm(blank()); setMo(true); }}>
          Thêm câu hỏi
        </Button>
        <Tooltip title="Đưa toàn bộ ngân hàng sang trò chơi Vòng Quanh Hóa 11">
          <Button variant="outlined" startIcon={<Upload size={18} />} onClick={bomSangGame}>
            Đưa sang trò chơi
          </Button>
        </Tooltip>
        <Tooltip title="Nhận các câu giáo viên đã sửa hoặc thêm bên trong trò chơi">
          <Button variant="outlined" startIcon={<Download size={18} />} onClick={hutVeTuGame}>
            Nhận về từ trò chơi
          </Button>
        </Tooltip>
        <Tooltip title="Nhờ AI đọc tệp PDF hoặc ảnh chụp đề, rồi dán JSON kết quả vào">
          <Button variant="outlined" startIcon={<FileUp size={18} />} onClick={() => setMoNap(true)}>
            Nạp đề từ file
          </Button>
        </Tooltip>
        <Box sx={{ flex: 1 }} />
        <Button variant="text" startIcon={<RefreshCw size={16} />} onClick={nap}>Tải lại</Button>
      </Stack>

      {/* Việc cần làm đầu tiên của người dùng mới. Để hẳn thành khối riêng chứ
          không nhét vào cuối thanh công cụ — ở đó nó bị đẩy khuất khỏi màn hình. */}
      {!daChuyenDoi() && (
        <Alert severity="warning" sx={{ mb: 2 }}
          action={
            <Button color="warning" variant="contained" size="small"
              onClick={chuyenDoi} disabled={dangChuyen} sx={{ whiteSpace: 'nowrap' }}>
              {dangChuyen ? 'Đang chuyển…' : 'Chuyển dữ liệu cũ sang'}
            </Button>
          }>
          Ngân hàng này còn trống. Bấm nút bên phải để gom câu hỏi từ Ngân hàng dữ liệu cũ,
          Thư viện câu hỏi và 160 câu mẫu của trò chơi vào đây. Dữ liệu cũ không bị xoá hay
          sửa, chạy lại nhiều lần cũng không tạo bản trùng.
        </Alert>
      )}

      {bao && (
        <Alert severity={bao.loai === 'ok' ? 'success' : bao.loai === 'loi' ? 'error' : 'info'}
          onClose={() => setBao(null)} sx={{ mb: 2 }}>
          {bao.chu}
        </Alert>
      )}

      {/* Thống kê theo mức độ */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Chip label={`Tổng ${items.length} câu`} sx={{ fontWeight: 'bold' }} />
        {LEVELS.map(l => (
          <Chip key={l.key} label={`${l.name}: ${dem[l.key] || 0}`}
            sx={{ bgcolor: LV_COLOR[l.key], color: '#fff', fontWeight: 600 }} />
        ))}
      </Stack>

      {/* Bộ lọc */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Chương</InputLabel>
          <Select label="Chương" value={fCh}
            onChange={e => setFCh(e.target.value === 'all' ? 'all' : (Number(e.target.value) as Chapter))}>
            <MenuItem value="all">Tất cả chương</MenuItem>
            {CHAPTERS.map(c => <MenuItem key={c.id} value={c.id}>{`Chương ${c.id} — ${c.name}`}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Mức độ</InputLabel>
          <Select label="Mức độ" value={fLv} onChange={e => setFLv(e.target.value as 'all' | Level)}>
            <MenuItem value="all">Tất cả mức</MenuItem>
            {LEVELS.map(l => <MenuItem key={l.key} value={l.key}>{`${l.name} · ${l.pts}đ`}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Dạng câu</InputLabel>
          <Select label="Dạng câu" value={fT} onChange={e => setFT(e.target.value as 'all' | QType)}>
            <MenuItem value="all">Tất cả dạng</MenuItem>
            {(Object.keys(QTYPE_NAME) as QType[]).map(t => (
              <MenuItem key={t} value={t}>{QTYPE_NAME[t]}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField size="small" placeholder="Tìm trong nội dung câu hỏi…" value={tim}
          onChange={e => setTim(e.target.value)} sx={{ flex: 1 }} />
      </Stack>

      {/* Danh sách */}
      {dangTai ? (
        <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress /></Box>
      ) : !hienThi.length ? (
        <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
          {items.length
            ? 'Không có câu hỏi nào khớp bộ lọc.'
            : 'Ngân hàng đang trống. Bấm "Chuyển dữ liệu cũ sang" nếu bạn đã có câu hỏi ở bản trước.'}
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {hienThi.map(q => (
            <Card key={q.id} sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                <Chip size="small" label={`Chương ${q.ch}`} />
                <Chip size="small" label={LEVELS.find(l => l.key === q.lv)?.name || q.lv}
                  sx={{ bgcolor: LV_COLOR[q.lv], color: '#fff' }} />
                <Chip size="small" label={QTYPE_NAME[q.t]} variant="outlined" />
                <Chip size="small" label={`${pointsOf(q)}đ`} variant="outlined" />
                {q.lessonId && <Chip size="small" label={`Bài ${q.lessonId}`} variant="outlined" />}
                {q.topic && <Chip size="small" label={q.topic} variant="outlined" />}
                {q.img && <Chip size="small" icon={<ImageIcon size={14} />} label="có ảnh" variant="outlined" />}
                <Box sx={{ flex: 1 }} />
                <IconButton size="small" onClick={() => { setForm({ ...blank(), ...q }); setMo(true); }}>
                  <Pencil size={16} />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => xoa(q.id)}>
                  <Trash2 size={16} />
                </IconButton>
              </Stack>
              <Typography sx={{ fontWeight: 600, whiteSpace: 'pre-line' }}>{q.q}</Typography>
              {q.t === 'mc' && (
                <Stack sx={{ mt: 1 }}>
                  {(q.o || []).map((o, i) => (
                    <Typography key={i} variant="body2"
                      sx={{ color: i === q.a ? '#0f766e' : 'text.secondary', fontWeight: i === q.a ? 700 : 400 }}>
                      {String.fromCharCode(65 + i)}. {o}{i === q.a ? '  ✓' : ''}
                    </Typography>
                  ))}
                </Stack>
              )}
              {q.t === 'tf' && (
                <Stack sx={{ mt: 1 }}>
                  {(q.st || []).map((s, i) => (
                    <Typography key={i} variant="body2" color="text.secondary">
                      {s.v ? '✓' : '✗'} {s.s}
                    </Typography>
                  ))}
                </Stack>
              )}
              {q.t === 'tn' && (
                <Typography variant="body2" sx={{ mt: 1, color: '#0f766e' }}>
                  Đáp án: {q.ansText}{q.unit ? ` ${q.unit}` : ''}{q.tol ? ` (sai số ±${q.tol})` : ''}
                </Typography>
              )}
              {q.t === 'tl' && (
                <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }} color="text.secondary">
                  Đáp án tham khảo: {q.ans}
                </Typography>
              )}
            </Card>
          ))}
        </Stack>
      )}

      <ImportFromFile mo={moNap} dong={() => setMoNap(false)} daCo={items} duyet={duyetTuFile} />

      {/* Biểu mẫu thêm/sửa */}
      <Dialog open={mo} onClose={() => setMo(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {form.id ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Chương</InputLabel>
                <Select label="Chương" value={form.ch}
                  onChange={e => setForm(s => ({ ...s, ch: Number(e.target.value) as Chapter }))}>
                  {CHAPTERS.map(c => <MenuItem key={c.id} value={c.id}>{`Chương ${c.id} — ${c.name}`}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Mức độ</InputLabel>
                <Select label="Mức độ" value={form.lv}
                  onChange={e => setForm(s => ({ ...s, lv: e.target.value as Level }))}>
                  {LEVELS.map(l => <MenuItem key={l.key} value={l.key}>{`${l.name} · ${l.pts}đ`}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Dạng câu</InputLabel>
                <Select label="Dạng câu" value={form.t}
                  onChange={e => setForm(s => ({ ...s, t: e.target.value as QType }))}>
                  {(Object.keys(QTYPE_NAME) as QType[]).map(t => (
                    <MenuItem key={t} value={t}>{QTYPE_NAME[t]}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <TextField label="Nội dung câu hỏi" fullWidth multiline rows={3} required
              value={form.q} onChange={e => setForm(s => ({ ...s, q: e.target.value }))} />

            {/* Trắc nghiệm */}
            {form.t === 'mc' && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Bốn phương án · chọn ô tròn ở đáp án đúng</Typography>
                {[0, 1, 2, 3].map(i => (
                  <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                    <Radio checked={form.a === i} onChange={() => setForm(s => ({ ...s, a: i }))} />
                    <TextField size="small" fullWidth label={String.fromCharCode(65 + i)}
                      value={(form.o || [])[i] || ''}
                      onChange={e => setForm(s => {
                        const o = [...(s.o || ['', '', '', ''])]; o[i] = e.target.value; return { ...s, o };
                      })} />
                  </Stack>
                ))}
              </Box>
            )}

            {/* Đúng/Sai nhiều ý */}
            {form.t === 'tf' && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Các ý · chấm điểm từng phần, tối thiểu 2 ý
                </Typography>
                {(form.st || []).map((s, i) => (
                  <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <Select value={s.v ? '1' : '0'}
                        onChange={e => setForm(x => {
                          const st = [...(x.st || [])]; st[i] = { ...st[i], v: e.target.value === '1' };
                          return { ...x, st };
                        })}>
                        <MenuItem value="1">Đúng</MenuItem>
                        <MenuItem value="0">Sai</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField size="small" fullWidth label={`Ý ${i + 1}`} value={s.s}
                      onChange={e => setForm(x => {
                        const st = [...(x.st || [])]; st[i] = { ...st[i], s: e.target.value };
                        return { ...x, st };
                      })} />
                    <IconButton size="small" color="error"
                      onClick={() => setForm(x => ({ ...x, st: (x.st || []).filter((_, j) => j !== i) }))}>
                      <X size={16} />
                    </IconButton>
                  </Stack>
                ))}
                <Button size="small" startIcon={<Plus size={16} />}
                  onClick={() => setForm(x => ({ ...x, st: [...(x.st || []), { s: '', v: true }] }))}>
                  Thêm ý
                </Button>
              </Box>
            )}

            {/* Trả lời ngắn */}
            {form.t === 'tn' && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField size="small" fullWidth label="Đáp án (một số)" placeholder="ví dụ 2,479"
                  value={form.ansText || ''} onChange={e => setForm(s => ({ ...s, ansText: e.target.value }))} />
                <TextField size="small" fullWidth label="Đơn vị" placeholder="lít, gam…"
                  value={form.unit || ''} onChange={e => setForm(s => ({ ...s, unit: e.target.value }))} />
                <TextField size="small" fullWidth label="Sai số cho phép" placeholder="0,01"
                  value={form.tol ?? ''} onChange={e => setForm(s => ({ ...s, tol: Number(e.target.value) || 0 }))} />
              </Stack>
            )}

            {/* Tự luận */}
            {form.t === 'tl' && (
              <Box>
                <TextField label="Đáp án tham khảo" fullWidth multiline rows={3}
                  value={form.ans || ''} onChange={e => setForm(s => ({ ...s, ans: e.target.value }))} />
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Tách ý để chấm điểm chi tiết · phần này chỉ web dùng, trò chơi bỏ qua
                </Typography>
                {(form.essayPoints || []).map((p, i) => (
                  <Stack key={i} direction="row" spacing={1} sx={{ mb: 1 }}>
                    <TextField size="small" label="Nhãn" sx={{ width: 140 }} value={p.label}
                      onChange={e => setForm(x => {
                        const ep = [...(x.essayPoints || [])]; ep[i] = { ...ep[i], label: e.target.value };
                        return { ...x, essayPoints: ep };
                      })} />
                    <TextField size="small" fullWidth label="Nội dung ý" value={p.content}
                      onChange={e => setForm(x => {
                        const ep = [...(x.essayPoints || [])]; ep[i] = { ...ep[i], content: e.target.value };
                        return { ...x, essayPoints: ep };
                      })} />
                    <IconButton size="small" color="error"
                      onClick={() => setForm(x => ({
                        ...x, essayPoints: (x.essayPoints || []).filter((_, j) => j !== i),
                      }))}>
                      <X size={16} />
                    </IconButton>
                  </Stack>
                ))}
                <Button size="small" startIcon={<Plus size={16} />}
                  onClick={() => setForm(x => ({
                    ...x,
                    essayPoints: [...(x.essayPoints || []), { label: `Ý ${(x.essayPoints || []).length + 1}`, content: '' }],
                  }))}>
                  Thêm ý chấm
                </Button>
              </Box>
            )}

            <Divider />

            <TextField label="Giải thích (hiện sau khi trả lời)" fullWidth multiline rows={2}
              value={form.e || ''} onChange={e => setForm(s => ({ ...s, e: e.target.value }))} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField size="small" fullWidth label="Chủ đề" value={form.topic || ''}
                onChange={e => setForm(s => ({ ...s, topic: e.target.value }))} />
              <TextField size="small" fullWidth label="Mã bài học" placeholder="để trống nếu không gắn"
                value={form.lessonId || ''} onChange={e => setForm(s => ({ ...s, lessonId: e.target.value }))} />
              <TextField size="small" fullWidth label="Điểm riêng"
                placeholder={`mặc định ${LEVELS.find(l => l.key === form.lv)?.pts}đ theo mức`}
                value={form.points ?? ''}
                onChange={e => setForm(s => ({ ...s, points: Number(e.target.value) || undefined }))} />
            </Stack>

            <Box>
              <input ref={fileRef} type="file" accept="image/*" hidden
                onChange={e => chonAnh(e.target.files?.[0])} />
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Button size="small" variant="outlined" startIcon={<ImageIcon size={16} />}
                  onClick={() => fileRef.current?.click()}>
                  {form.img ? 'Đổi ảnh' : 'Chọn ảnh'}
                </Button>
                {form.img && (
                  <>
                    <Box component="img" src={form.img}
                      sx={{ height: 56, borderRadius: 1, border: '1px solid #e2e8f0' }} />
                    <Button size="small" color="error" onClick={() => setForm(s => ({ ...s, img: undefined }))}>
                      Bỏ ảnh
                    </Button>
                  </>
                )}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setMo(false)}>Huỷ</Button>
          <Button variant="contained" onClick={luu}>Lưu câu hỏi</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
