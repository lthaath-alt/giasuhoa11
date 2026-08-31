# -*- coding: utf-8 -*-
"""
BƯỚC 2 — sinh src/features/lessons/constants.ts đủ 25 bài, đánh số đúng
chương trình.

  python scripts/soan-noi-dung/2-sinh-bai-hoc.py

Nguồn chữ:
  du-lieu/trich-tu-docx.json  — lý thuyết trích từ .docx (do bước 1 tạo ra)
  du-lieu/soan-tay-goc.json   — 6 bài giáo viên soạn tay, KHÔNG được làm mất
  public/bank/seed-160.json   — ngân hàng câu hỏi, dùng cho phần luyện tập

CỐ Ý không bịa nội dung hóa học. Bài nào thiếu nguồn thì để trống và ghi rõ,
không đoán thay giáo viên.

Chạy xong nhớ kiểm lại:  npm run kiem-tra:chuong-trinh
"""
import json, io, os, re, sys

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try: sys.stdout.reconfigure(encoding='utf-8')
    except Exception: pass

HERE = os.path.dirname(os.path.abspath(__file__))
DU_AN = os.path.dirname(os.path.dirname(HERE))        # thư mục gốc của dự án
DU_LIEU = os.path.join(DU_AN, 'scripts', 'du-lieu')

TEN_BAI = {
    1: 'Khái niệm về cân bằng hoá học',
    2: 'Cân bằng trong dung dịch nước và thuyết acid – base',
    3: 'Ôn tập cân bằng hoá học và cân bằng trong dung dịch nước',
    4: 'Nitrogen',
    5: 'Ammonia và muối ammonium',
    6: 'Một số hợp chất của nitrogen với oxygen',
    7: 'Sulfur và sulfur dioxide',
    8: 'Sulfuric acid và muối sulfate',
    9: 'Hệ thống hoá kiến thức về nitrogen và sulfur',
    10: 'Hợp chất hữu cơ và hoá học hữu cơ',
    11: 'Phương pháp tách và tinh chế hợp chất hữu cơ',
    12: 'Công thức phân tử hợp chất hữu cơ',
    13: 'Thuyết cấu tạo hoá học và công thức cấu tạo hợp chất hữu cơ',
    14: 'Ôn tập công thức và cấu tạo phân tử hợp chất hữu cơ',
    15: 'Alkane',
    16: 'Hydrocarbon không no',
    17: 'Arene (hydrocarbon thơm)',
    18: 'Ôn tập hệ thống kiến thức về hydrocarbon',
    19: 'Dẫn xuất halogen',
    20: 'Alcohol',
    21: 'Phenol',
    22: 'Hệ thống hoá kiến thức về dẫn xuất halogen, alcohol và phenol',
    23: 'Hợp chất carbonyl (aldehyde – ketone)',
    24: 'Carboxylic acid',
    25: 'Ôn tập hợp chất carbonyl và carboxylic acid',
}

CHUONG = [
    (1, 'Chương 1: Cân bằng hoá học',                    [1, 2, 3]),
    (2, 'Chương 2: Nitrogen – Sulfur',                   [4, 5, 6, 7, 8, 9]),
    (3, 'Chương 3: Đại cương hoá học hữu cơ',            [10, 11, 12, 13, 14]),
    (4, 'Chương 4: Hydrocarbon',                         [15, 16, 17, 18]),
    (5, 'Chương 5: Dẫn xuất halogen – Alcohol – Phenol', [19, 20, 21, 22]),
    (6, 'Chương 6: Hợp chất carbonyl – Carboxylic acid', [23, 24, 25]),
]

# Bài soạn tay trong web trước đây đánh số lệch. Đây là bài THẬT tương ứng,
# ghép theo chủ đề chứ không theo con số cũ.
CHUYEN = {
    'bai-1': 1,   # Khái niệm cân bằng            -> đúng bài 1
    'bai-2': 2,   # Sự điện li, Brønsted-Lowry    -> bài 2 cân bằng trong dung dịch nước
    'bai-3': 4,   # Đơn chất Nitrogen và Ammonia  -> bài 4 Nitrogen
    'bai-4': 6,   # Nitric acid và muối nitrate   -> bài 6 hợp chất nitrogen với oxygen
    'bai-5': 10,  # Hợp chất hữu cơ               -> bài 10
    'bai-6': 15,  # Alkane                        -> bài 15
}

# Bài có nguồn .docx hỏng — không dựng nội dung, tránh đưa chữ sai cho học sinh.
# Bài 22 từng nằm ở đây vì tệp cũ là bản sao của Bài 1; giáo viên đã gửi tệp
# đúng ("bài 22 hóa 11 ôn tập.docx") nên nay không còn bài nào hỏng.
DOCX_HONG = {}


# ── Thuật ngữ chương trình 2006 còn sót trong tài liệu ───────────────────────
#
# Tài liệu của giáo viên soạn qua nhiều năm nên lẫn tên gọi của chương trình cũ
# ("ancol", "axit", "cacbonat"), trong khi web và ngân hàng câu hỏi đều dùng tên
# theo KNTT 2018. Học sinh thấy hai tên cho cùng một chất thì rất dễ rối.
#
# CỐ Ý chỉ đổi những từ đã kiểm tra tận nơi, không đổi hàng loạt theo cảm tính:
#   - "oxi hoá" GIỮ NGUYÊN: chương trình 2018 vẫn dùng "số oxi hoá",
#     "phản ứng oxi hoá – khử". Đã kiểm 98/98 chỗ đều là cụm này.
#   - "đồng" GIỮ NGUYÊN: 62/62 chỗ là "đồng phân / đồng đẳng / đồng thời /
#     đồng vị", không chỗ nào nói về kim loại copper.
#   - "tráng bạc" GIỮ NGUYÊN: tên phản ứng này vẫn dùng trong chương trình mới.
#   - "Sulfur (lưu huỳnh)" GIỮ NGUYÊN: giáo viên cố ý chú thích tên tiếng Việt
#     trong ngoặc để học sinh quen dần.
#   - "butan-1-ol" GIỮ NGUYÊN: đó là tên IUPAC đúng, không phải tên cũ.
THUAT_NGU = [
    ('ancol',    'alcohol'),
    ('axit',     'acid'),
    ('ete',      'ether'),
    ('cacbonat', 'carbonate'),
    ('cacbua',   'carbide'),
    ('xianua',   'cyanide'),
    ('nitơ',     'nitrogen'),
    ('clo hóa',  'chlorine hoá'),
    ('clo hoá',  'chlorine hoá'),
    ('Sắt (Fe)', 'Iron (Fe)'),
    ('sắt (Fe)', 'iron (Fe)'),
    ('nhôm (Al)', 'aluminium (Al)'),
]

CHU_VIET = 'A-Za-zÀ-ỹ'


def chuan_hoa(s):
    """Đổi thuật ngữ cũ sang tên 2018, giữ nguyên chữ hoa đầu từ."""
    for cu, moi in THUAT_NGU:
        def thay(m, moi=moi):
            goc = m.group(2)
            return m.group(1) + (moi[0].upper() + moi[1:] if goc[0].isupper() else moi)
        s = re.sub('([^%s]|^)(%s)(?=[^%s]|$)' % (CHU_VIET, re.escape(cu), CHU_VIET),
                   thay, s, flags=re.IGNORECASE)
    return s


def chuan_hoa_cay(o):
    """Áp dụng chuan_hoa cho mọi chuỗi trong cây dữ liệu."""
    if isinstance(o, str):
        return chuan_hoa(o)
    if isinstance(o, list):
        return [chuan_hoa_cay(x) for x in o]
    if isinstance(o, dict):
        return {k: chuan_hoa_cay(v) for k, v in o.items()}
    return o


def bo_o_bang(s):
    """Bỏ các dòng đầu trông như ô của bảng biểu.

    Word xuất mỗi ô bảng thành một đoạn riêng, nên hàng tiêu đề của bảng ra
    thành mấy dòng cụt: "Chưng cất", "Chiết", "Kết tinh", "Sắc kí cột". Lấy
    nguyên mấy dòng đó làm tóm tắt thì đọc như một mớ từ rời rạc.
    """
    XUONG_DONG = chr(10)
    dong = s.strip().split(XUONG_DONG)
    i = 0
    while i < len(dong) and len(dong[i].strip()) < 40 and not dong[i].rstrip().endswith(('.', '!', '?')):
        i += 1
    return XUONG_DONG.join(dong[i:]) if i < len(dong) else s


def cau_dau(s, n=2):
    """Lấy n câu đầu làm tóm tắt. Chữ của giáo viên, không viết lại."""
    c = re.split(r'(?<=[.!?])\s+', bo_o_bang(s).strip())
    return ' '.join(c[:n]).strip()


def muc_co_chu(muc, toi_thieu=80):
    """Mục đầu tiên có nội dung thật sự.

    Nhiều tệp mở đầu bằng một dòng tiêu đề trơ trọi ("HỆ THỐNG HOÁ KIẾN THỨC"),
    lấy nguyên dòng đó làm tóm tắt thì học sinh đọc không hiểu bài nói gì.
    """
    for m in muc:
        if len(m['content'].strip()) >= toi_thieu:
            return m['content']
    return muc[0]['content'] if muc else ''


def main():
    noi = json.load(io.open(os.path.join(DU_LIEU, 'trich-tu-docx.json'), encoding='utf8'))
    tay = {l['id']: l for l in
           json.load(io.open(os.path.join(DU_LIEU, 'soan-tay-goc.json'), encoding='utf8'))}
    bank = json.load(io.open(os.path.join(DU_AN, 'public', 'bank', 'seed-160.json'), encoding='utf8'))

    theo_ch = {}
    for q in bank:
        theo_ch.setdefault(q['ch'], []).append(q)

    # bài thật -> bài soạn tay tương ứng
    nguoc = {v: k for k, v in CHUYEN.items()}

    chuong_ra, thong_ke = [], []
    for ch_id, ch_ten, bais in CHUONG:
        ds = []
        for n in bais:
            d = noi.get(str(n)) or noi.get(n)
            t = tay.get(nguoc.get(n, ''), None)
            hong = n in DOCX_HONG

            # ── tóm tắt ──
            if t and t.get('summary'):
                tom = t['summary']                       # giữ nguyên chữ giáo viên
            elif d and not hong and d['muc']:
                tom = cau_dau(muc_co_chu(d['muc']) or d['tom_tat_nguon'])
            else:
                tom = ''

            # ── công thức ──
            ct = list(t['formulae']) if (t and t.get('formulae')) else []
            if d and not hong:
                for c in d['formulae']:
                    if c not in ct: ct.append(c)

            # ── câu hỏi thường gặp: ưu tiên bản soạn tay ──
            cq = list(t['commonQuestions']) if (t and t.get('commonQuestions')) else []
            if not cq and d: cq = d['commonQuestions']

            # ── trang SGK ──
            sections = []
            if d and not hong:
                for m in d['muc']:
                    if not (m['content'] or m['keyPoints']): continue
                    s = {'id': 'b%d-m%d' % (n, len(sections) + 1),
                         'sectionTitle': m['sectionTitle'],
                         'content': m['content']}
                    if m['keyPoints']: s['keyPoints'] = m['keyPoints']
                    sections.append(s)

            lt = []
            for i, q in enumerate(theo_ch.get(ch_id, [])[:4], 1):
                lt.append({'id': 'b%d-lt%d' % (n, i), 'question': q['q'],
                           'hint': q.get('e', '')})

            bai = {'id': 'bai-%d' % n, 'title': 'Bài %d: %s' % (n, TEN_BAI[n]),
                   'summary': tom, 'formulae': ct, 'commonQuestions': cq}

            # Giữ nguyên trang SGK bản soạn tay nếu bài đó đã có, vì nó công phu hơn
            if t and t.get('textbook'):
                bai['textbook'] = t['textbook']
            elif sections:
                bai['textbook'] = {'pageRange': '', 'objectives': [],
                                   'sections': sections, 'practiceQuestions': lt}

            ds.append(bai)
            thong_ke.append((n, bool(t), len(sections), len(ct), len(cq), hong))
        chuong_ra.append({'id': 'chuong-%d' % ch_id, 'title': ch_ten, 'lessons': ds})

    truoc = json.dumps(chuong_ra, ensure_ascii=False)
    chuong_ra = chuan_hoa_cay(chuong_ra)
    than = json.dumps(chuong_ra, ensure_ascii=False, indent=2)
    if truoc != json.dumps(chuong_ra, ensure_ascii=False):
        print('Da chuan hoa thuat ngu 2006 -> 2018.')
    ra = ("import { Chapter } from './types';\n\n"
          "/**\n"
          " * Chương trình Hoá học 11 — Kết nối tri thức với cuộc sống (2018).\n"
          " *\n"
          " * Đánh số bài KHỚP với 25 bài giảng slide và với ngân hàng câu hỏi.\n"
          " * Trước đây web đánh số 1–6 cho các bài thật là 1, 2, 4, 6, 10, 15 nên\n"
          " * học sinh thấy hai cách đánh số khác nhau giữa mục Bài giảng và mục SGK.\n"
          " *\n"
          " * Lý thuyết lấy từ tệp .docx của giáo viên; câu luyện tập lấy từ ngân hàng\n"
          " * câu hỏi theo đúng chương. Phần tóm tắt và câu hỏi kèm lời giải mẫu do\n"
          " * giáo viên soạn tay được giữ nguyên, chuyển sang bài cùng chủ đề.\n"
          " */\n"
          "export const CHEMISTRY_11_CURRICULUM: Chapter[] = " + than + ";\n")

    dich = os.path.join(DU_AN, 'src', 'features', 'lessons', 'constants.ts')
    io.open(dich, 'w', encoding='utf8').write(ra)

    print('%-5s %-9s %5s %5s %6s %s' % ('Bai', 'soantay', 'muc', 'ct', 'cauhoi', 'ghi chu'))
    for n, co_tay, sm, sc, sq, hong in thong_ke:
        print('%-5d %-9s %5d %5d %6d %s' % (
            n, 'co' if co_tay else '-', sm, sc, sq,
            DOCX_HONG.get(n, '') if hong else ''))
    print('\nDa ghi', dich, '(%d ky tu)' % len(ra))


if __name__ == '__main__':
    main()
