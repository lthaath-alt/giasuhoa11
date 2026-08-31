import React, { useMemo, useState } from 'react';
import {
  Alert, Box, Button, Card, Checkbox, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem,
  Select, Stack, TextField, Typography, Divider,
} from '@mui/material';
import { Copy, Check, Trash2, Image as ImageIcon, X } from 'lucide-react';
import {
  BankQuestion, Chapter, Level, LEVELS, QTYPE_NAME, CHAPTERS,
} from '../types';
import {
  buildPrompt, parseAIJson, docChoDuyet, ghiChoDuyet, imgKeyOf, PromptOptions,
} from '../importAI';

/**
 * Nạp đề từ file — chuyển nguyên quy trình của trò chơi sang web.
 *
 * Ba bước: sinh câu lệnh cho AI đọc tệp hộ → dán JSON kết quả → duyệt từng câu
 * rồi mới đưa vào ngân hàng. Cố ý có bước duyệt vì AI hay đoán sai chương và
 * mức độ.
 */

interface Props {
  mo: boolean;
  dong: () => void;
  /** Câu đã có trong ngân hàng, dùng để loại trùng */
  daCo: BankQuestion[];
  /** Gọi khi người dùng duyệt xong, trả về các câu cần ghi vào ngân hàng */
  duyet: (rows: BankQuestion[]) => Promise<void>;
}

export const ImportFromFile: React.FC<Props> = ({ mo, dong, daCo, duyet }) => {
  const [opt, setOpt] = useState<PromptOptions>({
    chunk: 40, variants: false, scopeCh: 'auto', scopeLv: 'auto',
  });
  const [daChep, setDaChep] = useState(false);
  const [json, setJson] = useState('');
  const [loi, setLoi] = useState<string[]>([]);
  const [nghiemTrong, setNghiemTrong] = useState<string | null>(null);
  const [cho, setCho] = useState<BankQuestion[]>(() => docChoDuyet());
  const [chon, setChon] = useState<Set<string>>(new Set());
  const [dangGhi, setDangGhi] = useState(false);

  const cauLenh = useMemo(() => buildPrompt(opt), [opt]);

  const chepCauLenh = async () => {
    try {
      await navigator.clipboard.writeText(cauLenh);
      setDaChep(true);
      setTimeout(() => setDaChep(false), 2500);
    } catch {
      setNghiemTrong('Trình duyệt không cho chép tự động. Hãy bôi đen ô câu lệnh rồi chép tay.');
    }
  };

  const docJson = () => {
    const kq = parseAIJson(json, [...daCo, ...cho]);
    setNghiemTrong(kq.fatal);
    setLoi(kq.errs);
    if (kq.fatal) return;
    const moi = [...cho, ...kq.rows];
    setCho(moi);
    setChon(new Set([...chon, ...kq.rows.map(r => r.id)]));
    if (!ghiChoDuyet(moi)) {
      setLoi(e => [...e, 'Không lưu được khu chờ duyệt vào trình duyệt — đừng đóng trang trước khi duyệt xong.']);
    }
    setJson('');
  };

  const capNhat = (id: string, thay: Partial<BankQuestion>) => {
    const moi = cho.map(q => (q.id === id ? { ...q, ...thay } : q));
    setCho(moi);
    ghiChoDuyet(moi);
  };

  const boCau = (id: string) => {
    const moi = cho.filter(q => q.id !== id);
    setCho(moi);
    ghiChoDuyet(moi);
    const c = new Set(chon); c.delete(id); setChon(c);
  };

  /** Dán một ảnh cho TẤT CẢ câu cùng vị trí hình — đúng ý nghĩa của imgNote */
  const ganAnh = (q: BankQuestion, f: File | undefined) => {
    if (!f) return;
    const key = imgKeyOf(q);
    const r = new FileReader();
    r.onload = () => {
      const url = String(r.result);
      const moi = cho.map(x =>
        (key && imgKeyOf(x) === key) || x.id === q.id ? { ...x, img: url } : x,
      );
      setCho(moi);
      ghiChoDuyet(moi);
    };
    r.readAsDataURL(f);
  };

  const nhomAnh = useMemo(() => {
    const m = new Map<string, number>();
    cho.forEach(q => {
      const k = imgKeyOf(q);
      if (k) m.set(k, (m.get(k) || 0) + 1);
    });
    return m;
  }, [cho]);

  const duyetChon = async () => {
    const rows = cho.filter(q => chon.has(q.id));
    if (!rows.length) return;
    setDangGhi(true);
    try {
      await duyet(rows);
      const conLai = cho.filter(q => !chon.has(q.id));
      setCho(conLai);
      ghiChoDuyet(conLai);
      setChon(new Set());
    } finally {
      setDangGhi(false);
    }
  };

  return (
    <Dialog open={mo} onClose={dong} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>Nạp đề từ file</DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          Trình duyệt không đọc được PDF hay ảnh chụp. Cách làm: lấy câu lệnh bên dưới,
          gửi kèm tệp đề cho một AI bất kỳ, rồi dán JSON nó trả về vào đây.
        </Alert>

        {/* BƯỚC 1 */}
        <Typography sx={{ fontWeight: 700, mb: 1 }}>Bước 1 · Lấy câu lệnh cho AI</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 1.5 }}>
          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel>Chương</InputLabel>
            <Select label="Chương" value={opt.scopeCh}
              onChange={e => setOpt(o => ({ ...o, scopeCh: e.target.value === 'auto' ? 'auto' : Number(e.target.value) as Chapter }))}>
              <MenuItem value="auto">Để AI tự phân loại</MenuItem>
              {CHAPTERS.map(c => <MenuItem key={c.id} value={c.id}>{`Ép về chương ${c.id}`}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel>Mức độ</InputLabel>
            <Select label="Mức độ" value={opt.scopeLv}
              onChange={e => setOpt(o => ({ ...o, scopeLv: e.target.value as 'auto' | Level }))}>
              <MenuItem value="auto">Để AI tự phân loại</MenuItem>
              {LEVELS.map(l => <MenuItem key={l.key} value={l.key}>{`Ép về ${l.name}`}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField size="small" label="Chia mỗi phần (câu)" sx={{ width: 170 }}
            value={opt.chunk}
            onChange={e => setOpt(o => ({ ...o, chunk: Number(e.target.value) || 0 }))}
            helperText="0 = in một lần" />
          <FormControlLabel
            control={<Checkbox checked={opt.variants}
              onChange={e => setOpt(o => ({ ...o, variants: e.target.checked }))} />}
            label="Sinh thêm biến thể đúng/sai và trả lời ngắn" />
        </Stack>

        <Box sx={{ position: 'relative', mb: 3 }}>
          <TextField fullWidth multiline rows={6} value={cauLenh}
            slotProps={{ input: { readOnly: true, sx: { fontSize: '0.78rem', fontFamily: 'monospace' } } }} />
          <Button size="small" variant="contained" onClick={chepCauLenh}
            startIcon={daChep ? <Check size={16} /> : <Copy size={16} />}
            sx={{ position: 'absolute', top: 8, right: 8 }}>
            {daChep ? 'Đã chép' : 'Chép câu lệnh'}
          </Button>
        </Box>

        {/* BƯỚC 2 */}
        <Typography sx={{ fontWeight: 700, mb: 1 }}>Bước 2 · Dán JSON của AI vào đây</Typography>
        <TextField fullWidth multiline rows={5} placeholder="Dán nguyên văn phần AI trả về, kể cả lời dẫn — hệ thống tự nhặt các khối JSON."
          value={json} onChange={e => setJson(e.target.value)} sx={{ mb: 1.5 }} />
        <Button variant="contained" onClick={docJson} disabled={!json.trim()}>
          Đọc JSON, đưa vào khu chờ duyệt
        </Button>

        {nghiemTrong && <Alert severity="error" sx={{ mt: 2 }} onClose={() => setNghiemTrong(null)}>{nghiemTrong}</Alert>}
        {!!loi.length && (
          <Alert severity="warning" sx={{ mt: 2 }} onClose={() => setLoi([])}>
            <Stack>{loi.map((l, i) => <span key={i}>{l}</span>)}</Stack>
          </Alert>
        )}

        {/* BƯỚC 3 */}
        {!!cho.length && (
          <>
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>
                Bước 3 · Khu chờ duyệt ({cho.length} câu)
              </Typography>
              <Box sx={{ flex: 1 }} />
              <Button size="small" onClick={() => setChon(new Set(cho.map(q => q.id)))}>Chọn hết</Button>
              <Button size="small" onClick={() => setChon(new Set())}>Bỏ chọn</Button>
            </Stack>
            <Alert severity="warning" sx={{ mb: 2 }}>
              AI hay đoán sai chương và mức độ. Hãy soát lại hai cột đó trước khi duyệt.
            </Alert>

            <Stack spacing={1.5}>
              {cho.map(q => {
                const key = imgKeyOf(q);
                const chung = key ? (nhomAnh.get(key) || 1) : 0;
                return (
                  <Card key={q.id} sx={{ p: 1.5 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                      <Checkbox size="small" checked={chon.has(q.id)}
                        onChange={e => {
                          const c = new Set(chon);
                          if (e.target.checked) c.add(q.id); else c.delete(q.id);
                          setChon(c);
                        }} />
                      <FormControl size="small" sx={{ minWidth: 130 }}>
                        <Select value={q.ch}
                          onChange={e => capNhat(q.id, { ch: Number(e.target.value) as Chapter })}>
                          {CHAPTERS.map(c => <MenuItem key={c.id} value={c.id}>{`Chương ${c.id}`}</MenuItem>)}
                        </Select>
                      </FormControl>
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select value={q.lv} onChange={e => capNhat(q.id, { lv: e.target.value as Level })}>
                          {LEVELS.map(l => <MenuItem key={l.key} value={l.key}>{l.name}</MenuItem>)}
                        </Select>
                      </FormControl>
                      <Chip size="small" variant="outlined" label={QTYPE_NAME[q.t]} />
                      {q.topic && <Chip size="small" variant="outlined" label={q.topic} />}
                      <Box sx={{ flex: 1 }} />
                      <IconButton size="small" color="error" onClick={() => boCau(q.id)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </Stack>

                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{q.q}</Typography>

                    {q.imgNote && (
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1, flexWrap: 'wrap', gap: 1 }}>
                        <Chip size="small" color="warning" icon={<ImageIcon size={14} />}
                          label={`Cần cắt hình: ${q.imgNote}`} />
                        {chung > 1 && <Chip size="small" label={`dùng chung cho ${chung} câu`} />}
                        <Button size="small" component="label" variant="outlined">
                          {q.img ? 'Đổi ảnh' : 'Dán ảnh'}
                          <input hidden type="file" accept="image/*"
                            onChange={e => ganAnh(q, e.target.files?.[0])} />
                        </Button>
                        {q.img && <Box component="img" src={q.img} sx={{ height: 42, borderRadius: 1 }} />}
                        {q.img && (
                          <IconButton size="small" onClick={() => capNhat(q.id, { img: undefined })}>
                            <X size={14} />
                          </IconButton>
                        )}
                      </Stack>
                    )}
                  </Card>
                );
              })}
            </Stack>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 'auto' }}>
          {chon.size ? `Đã chọn ${chon.size} câu` : 'Chưa chọn câu nào'}
        </Typography>
        <Button onClick={dong}>Đóng</Button>
        <Button variant="contained" onClick={duyetChon} disabled={!chon.size || dangGhi}>
          {dangGhi ? 'Đang ghi…' : `Duyệt ${chon.size} câu vào ngân hàng`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
