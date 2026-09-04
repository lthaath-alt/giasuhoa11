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


SO_DUOI = str.maketrans('0123456789', '\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089')

# Công thức hoá học: một chuỗi ký hiệu nguyên tố, trong đó có ít nhất một chữ số.
#   N2, O2, H2O, H2SO4, C6H5OH, Al2O3, Cu2O …
# Bắt buộc chữ số phải đứng NGAY SAU một ký hiệu nguyên tố (chữ hoa, có thể kèm
# một chữ thường). Nhờ vậy "lớp 11", "Bài 2", "Chương 3", "25 °C" không dính —
# ở đó chữ số đứng sau dấu cách chứ không sau ký hiệu nguyên tố.
# Neo bang "ky tu truoc khong phai chu cai" chu KHONG dung \b.
# Ly do: he so can bang dung ngay truoc cong thuc — "4NH3", "5O2" — thi giua
# chu so va chu cai KHONG co ranh gioi tu, nen \b lam ca cum truot khong khop
# va cong thuc do khong bao gio duoc ha chi so. Da do: 7 cong thuc bi bo sot
# kieu nay. Nay he so van la chu so thuong, chi phan sau ky hieu nguyen to moi
# ha xuong: "4NH3" -> "4NH₃", dung nhu cach viet trong sach.
CONG_THUC = re.compile(r'(?<![A-Za-zÀ-ỹ])((?:[A-Z][a-z]?\d*)+)(?![A-Za-zÀ-ỹ])')


def ha_chi_so(s):
    """Đưa công thức hoá học viết thô về đúng chỉ số dưới: N2 -> N\u2082, H2SO4 -> H\u2082SO\u2084.

    Vì sao cần: văn bản trích từ .docx mất hết định dạng chỉ số dưới, nên dữ
    liệu bài học mang "N2", "NH3", "H2SO4". Phần đọc SGK và ô tìm kiếm hiển thị
    thẳng chuỗi này, nên học sinh đọc được đúng cái công thức viết sai — trong
    khi chính con gia sư AI lại luôn viết đúng "N\u2082". Hai bên lệch nhau ngay
    trên cùng một màn hình.

    Đo trước khi sửa: 85 lần xuất hiện, 22 dạng, và không dạng nào là nhầm.

    Chỗ CỐ Ý bỏ qua:
      - Từ viết hoa toàn bộ không có số (SGK, IUPAC) — không khớp vì thiếu chữ số.
      - Số đứng rời ("lớp 11") — không khớp vì phải dính ngay sau ký hiệu.
      - Mã bài, mã đề dạng bai-4, quiz_123 — có gạch nối/gạch dưới nên \b chặn lại.
    """
    def thay(m):
        t = m.group(1)
        if not any(c.isdigit() for c in t):
            return t          # không có số thì không phải công thức, để yên
        if t[0].islower():
            return t
        # Ngay sau là dấu + hoặc - DÍNH LIỀN thì đây là ion mang điện tích, và
        # chữ số cuối là chỉ số TRÊN chứ không phải chỉ số dưới: Fe2+ đọc là
        # Fe²⁺, hạ xuống thành Fe₂+ là sai hẳn nghĩa. Phân biệt cho đúng thì
        # phải biết hoá (SO42- là SO₄²⁻ — vừa có chỉ số dưới vừa có chỉ số
        # trên), nên ở đây CHỌN KHÔNG ĐOÁN: để nguyên văn. Viết nguyên là xấu
        # nhưng vẫn đọc đúng; đoán sai thì học sinh học phải công thức sai.
        # Dữ liệu hiện tại không có dạng này (đã đo), đây là phòng cho sau.
        # Dấu +/- DÍNH LIỀN sau công thức có hai nghĩa khác hẳn nhau:
        #   · điện tích ion  — "Fe2+", "H3O+"        -> chữ số là chỉ số TRÊN
        #   · dấu cộng phản ứng — "C6H5OH+H2O⇌..."   -> vẫn là chỉ số dưới
        # Phân biệt bằng ký tự đứng SAU dấu: còn công thức nữa (chữ cái hoặc
        # chữ số) thì đó là phản ứng; hết câu hay gặp dấu cách/dấu câu thì đó là
        # điện tích.
        #
        # Gặp điện tích thì CHỌN KHÔNG ĐOÁN, để nguyên văn: viết đúng cần biết
        # hoá (SO42- là SO₄²⁻ — vừa chỉ số dưới vừa chỉ số trên), đoán sai thì
        # học sinh học phải công thức sai. Viết thô tuy xấu nhưng vẫn đọc đúng.
        #
        # PHẢI kiểm chuỗi khác rỗng trước: trong Python `'' in '+-'` là True,
        # nên công thức ở CUỐI chuỗi từng bị coi là ion và bỏ qua oan — đúng lỗi
        # đã mắc: "Cu2O" cuối câu không đổi trong khi giữa câu thì có.
        sau = s[m.end():m.end() + 1]
        ke = s[m.end() + 1:m.end() + 2]
        # Chỉ nhập nhằng khi CHỮ SỐ dính ngay trước dấu: "Fe2+" — số 2 là điện
        # tích chứ không phải chỉ số. Còn "H3O+" hay "C6H5O-" thì trước dấu là
        # chữ cái, mọi chữ số trong đó chắc chắn là chỉ số dưới, hạ được an toàn.
        if sau and sau in '+-' and not (ke and ke.isalnum()) and t[-1].isdigit():
            return t
        return ''.join(c.translate(SO_DUOI) if c.isdigit() else c for c in t)
    return CONG_THUC.sub(thay, s)


def ha_chi_so_cay(o):
    """Áp dụng ha_chi_so cho mọi chuỗi trong cây dữ liệu."""
    if isinstance(o, str):
        return ha_chi_so(o)
    if isinstance(o, list):
        return [ha_chi_so_cay(x) for x in o]
    if isinstance(o, dict):
        return {k: ha_chi_so_cay(v) for k, v in o.items()}
    return o


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
    # Hạ chỉ số SAU khi chuẩn hoá thuật ngữ: bảng THUAT_NGU viết bằng công thức
    # thô ("H2SO4"), khớp trước rồi mới hạ chỉ số thì không có gì lệch nhau.
    chuong_ra = ha_chi_so_cay(chuong_ra)
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
