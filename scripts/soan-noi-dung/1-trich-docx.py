# -*- coding: utf-8 -*-
"""
BƯỚC 1 — trích lý thuyết từ các tệp .docx của giáo viên.

  python scripts/soan-noi-dung/1-trich-docx.py "<thư mục chứa .docx>"

Nguồn:
  - <thư mục>/BAI *.docx        → lý thuyết, chia theo đề mục La Mã có sẵn
  - public/bank/seed-160.json   → câu hỏi thường gặp, lọc theo chương

Đích: scripts/du-lieu/trich-tu-docx.json — bước 2 đọc tệp này.

CỐ Ý không tự bịa nội dung hóa học: mọi câu chữ đều lấy nguyên từ docx của
giáo viên hoặc từ ngân hàng câu hỏi. Chỗ nào không có dữ liệu thì để trống,
không đoán thay giáo viên.
"""
import zipfile, re, io, os, sys, json, glob, html

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try: sys.stdout.reconfigure(encoding='utf-8')
    except Exception: pass

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.dirname(os.path.dirname(HERE))          # thư mục gốc của dự án

# Thư mục chứa các tệp .docx của giáo viên. Nhận từ dòng lệnh hoặc biến môi
# trường HOA11_DOCX. CỐ Ý không viết cứng đường dẫn máy của ai vào mã nguồn.
DOCX_DIR = (sys.argv[1] if len(sys.argv) > 1 else '') or os.environ.get('HOA11_DOCX', '')

BANK = os.path.join(GOC, 'public', 'bank', 'seed-160.json')
DICH = os.path.join(GOC, 'scripts', 'du-lieu', 'trich-tu-docx.json')

if not DOCX_DIR or not os.path.isdir(DOCX_DIR):
    print('Chua chi ra thu muc chua cac tep .docx.\n')
    print('  python scripts/soan-noi-dung/1-trich-docx.py "D:\\duong dan\\thu muc docx"\n')
    print('hoac dat bien moi truong HOA11_DOCX roi chay: npm run soan:trich')
    sys.exit(1)

# Bài nào thuộc chương nào — theo đúng chương trình KNTT 2018
CHUONG = {
    1: (1, 'Chương 1: Cân bằng hoá học',                        [1, 2, 3]),
    2: (2, 'Chương 2: Nitrogen – Sulfur',                       [4, 5, 6, 7, 8, 9]),
    3: (3, 'Chương 3: Đại cương hoá học hữu cơ',                [10, 11, 12, 13, 14]),
    4: (4, 'Chương 4: Hydrocarbon',                             [15, 16, 17, 18]),
    5: (5, 'Chương 5: Dẫn xuất halogen – Alcohol – Phenol',     [19, 20, 21, 22]),
    6: (6, 'Chương 6: Hợp chất carbonyl – Carboxylic acid',     [23, 24, 25]),
}
BAI_TO_CH = {b: c for c, (_, _, bs) in CHUONG.items() for b in bs}


def doc_text(path):
    """Rút văn bản từ .docx, mỗi đoạn Word thành một dòng."""
    z = zipfile.ZipFile(path)
    x = z.read('word/document.xml').decode('utf8', 'ignore')
    x = re.sub(r'</w:p>', '\n', x)
    x = re.sub(r'<[^>]+>', '', x)
    x = html.unescape(x)
    dong = [l.strip() for l in x.split('\n')]
    # Bỏ dòng rác: rỗng, hoặc chỉ là chữ "Hoá học" (chân trang của SGK)
    return [l for l in dong if l and l != 'Hoá học' and l != 'Hóa học']


def bo_dau(s):
    """Bo dau tieng Viet. Can vi ten tep khong thong nhat: co tep viet
    'BAI 22 HOA 11', co tep viet 'bai 22 hoa 11' co dau."""
    import unicodedata
    return ''.join(c for c in unicodedata.normalize('NFD', s)
                   if unicodedata.category(c) != 'Mn').replace('đ', 'd').replace('Đ', 'D')


def so_bai(ten):
    m = re.search(r'BAI\s*(\d+)', bo_dau(ten), re.I)
    return int(m.group(1)) if m else None


LA_MA = re.compile(r'^([IVX]+)\.\s+(.+)$')
TIEU_MUC = re.compile(r'^(\d+)\.\s+(.+)$')


def tach_muc(dong):
    """Cắt danh sách dòng thành các mục theo đề mục La Mã."""
    muc, hien = [], None
    for l in dong:
        m = LA_MA.match(l)
        if m:
            if hien: muc.append(hien)
            hien = {'sectionTitle': l, 'noi_dung': [], 'keyPoints': []}
            continue
        if hien is None:
            # Phần đứng trước mục La Mã đầu tiên — gom làm mở đầu
            hien = {'sectionTitle': 'Mở đầu', 'noi_dung': [], 'keyPoints': []}
        tm = TIEU_MUC.match(l)
        if tm:
            hien['keyPoints'].append(l)
        else:
            hien['noi_dung'].append(l)
    if hien: muc.append(hien)
    return [m for m in muc if m['noi_dung'] or m['keyPoints']]


CT = re.compile(r'(=|⇌|→|\bK[cp]\b|pH|%|mol|CTPT|CTĐGN)')


def lay_cong_thuc(dong):
    """Nhặt các dòng trông như công thức. Giữ nguyên văn, không viết lại."""
    ra = []
    for l in dong:
        if len(l) > 160 or len(l) < 6: continue
        if CT.search(l) and not l.endswith(('.', ':')) and not l[0].isupper() * 0:
            if l.count(' ') < 24:
                ra.append(l)
    # bỏ trùng, giữ thứ tự
    thay, kq = set(), []
    for l in ra:
        if l not in thay:
            thay.add(l); kq.append(l)
    return kq[:6]


def main():
    bank = json.load(io.open(BANK, encoding='utf8'))
    theo_ch = {}
    for q in bank:
        theo_ch.setdefault(q['ch'], []).append(q)

    ra = {}
    for f in glob.glob(os.path.join(DOCX_DIR, '*.docx')):
        n = so_bai(os.path.basename(f))
        if not n or n not in BAI_TO_CH: continue
        dong = doc_text(f)
        muc = tach_muc(dong)
        ch = BAI_TO_CH[n]

        # Câu hỏi thường gặp: lấy từ ngân hàng, ưu tiên câu có giải thích dài
        ds = sorted(theo_ch.get(ch, []), key=lambda q: -len(q.get('e', '')))[:3]
        cq = []
        for q in ds:
            dap = ''
            if q.get('t', 'mc') == 'mc' and q.get('o'):
                dap = q['o'][q.get('a', 0)]
            elif q.get('t') == 'tn':
                dap = str(q.get('ansText', '')) + (' ' + q['unit'] if q.get('unit') else '')
            cq.append({
                'question': q['q'],
                'hint': q.get('e', ''),
                'sampleAnswer': dap,
            })

        ra[n] = {
            'so': n, 'chuong': ch,
            'so_muc': len(muc),
            'muc': [{'sectionTitle': m['sectionTitle'],
                     'content': '\n'.join(m['noi_dung']),
                     'keyPoints': m['keyPoints']} for m in muc],
            'formulae': lay_cong_thuc(dong),
            'commonQuestions': cq,
            'tom_tat_nguon': ' '.join(dong[:4])[:400],
        }

    json.dump(ra, io.open(DICH, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    out = DICH

    print('%-4s %-4s %5s %6s %6s %s' % ('Bai', 'Ch', 'muc', 'ky tu', 'ct', 'ten muc dau'))
    for n in sorted(ra):
        d = ra[n]
        kt = sum(len(m['content']) for m in d['muc'])
        dau = d['muc'][0]['sectionTitle'][:44] if d['muc'] else '(khong tach duoc)'
        print('%-4d %-4d %5d %6d %6d %s' % (n, d['chuong'], d['so_muc'], kt, len(d['formulae']), dau))
    print('\nDa ghi', out)


if __name__ == '__main__':
    main()
