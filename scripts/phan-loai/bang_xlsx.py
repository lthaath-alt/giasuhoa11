"""Bảng gán nhãn Excel (.xlsx) cho MỘT người gán, viết bằng thư viện chuẩn (04/10/2026).

Máy không có openpyxl và quy tắc dự án không cho cài gói mới, nên tệp .xlsx được dựng
thẳng bằng zipfile + XML (định dạng Office Open XML). Bảng có:
  - sheet "Gán nhãn": STT | [ChemAI vừa nói, khi đợt có cột chemai_vua_noi] | Câu hỏi (xuống dòng
    trong ô, cột rộng) | Nhãn (bấm mũi tên chọn
    1 trong 8 nhãn hoặc "(Bỏ câu này)", gõ chữ khác thì Excel báo lỗi) | Người gán | Ghi chú;
    dòng tiêu đề đứng yên khi cuộn.
  - sheet "Giải thích nhãn": 8 nhãn bằng lời thường, có ví dụ.
  - sheet "Thông tin": tên đợt (nap_dot.py dựa vào đây để biết bảng của đợt nào) và ô
    "Người gán" điền một lần cho cả bảng.
doc_bang() đọc lại bảng SAU KHI Excel lưu (chuỗi nằm ở sharedStrings, ô trống bị bỏ...).
"""
import re
import zipfile
import xml.etree.ElementTree as ET
from xml.sax.saxutils import escape

# Thứ tự = thứ tự trong ô thả xuống. Tên hiện trên bảng là chữ thường, máy đổi về mã nhãn.
NHAN_HIEN = {
    'hoi_khai_niem': 'Hỏi khái niệm',
    'be_tac': 'Bế tắc',
    'xin_dap_an': 'Xin đáp án',
    'nop_bai_lam': 'Nộp bài làm',
    'gian_lan_phong_thi': 'Gian lận phòng thi',
    'xin_de': 'Xin đề',          # thêm 04/10/2026
    'tra_loi_gia_su': 'Trả lời ChemAI',   # thêm 05/10/2026
    'ngoai_mon': 'Ngoài môn',
}
BO_CAU = '(Bỏ câu này)'   # câu dán cả tài liệu, câu rác: không đưa vào học
GIAI_THICH = [
    ('Hỏi khái niệm', 'Hỏi kiến thức, hỏi "vì sao", hỏi định nghĩa Hoá học', 'vì sao xúc tác không đổi Kc'),
    ('Bế tắc', 'Bỏ cuộc, không biết bắt đầu, không đưa ra ý gì', 'thôi e chịu, hết cứu'),
    ('Xin đáp án', 'Đòi đáp số / lời giải mà không đưa bài làm của mình', 'cho em đáp án luôn đi ạ'),
    ('Nộp bài làm', 'Đưa kết quả, bước làm hay lựa chọn của mình ra hỏi đúng không', 'em ra pH = 1,7 đúng không ạ'),
    ('Gian lận phòng thi', 'Nói rõ đang trong giờ kiểm tra / thi mà nhờ giải', 'đang kiểm tra 15 phút giải nhanh giúp em'),
    ('Xin đề', 'Xin một bài tập / đề để TỰ luyện (không đưa bài nào nhờ giải)', 'cho em vài bài pH để luyện'),
    ('Trả lời ChemAI', 'Em trả lời câu ChemAI vừa hỏi để dẫn dắt (đáp xong có hỏi thêm kiến thức vẫn chọn nhãn này)',
     'dạ là acid mạnh ạ; tăng ạ'),
    ('Ngoài môn', 'Chào hỏi, cảm ơn, tâm sự, môn khác, hỏi về gia sư', 'chào thầy; giải giúp bài Toán'),
    (BO_CAU, 'Câu không dùng để học: dán cả tài liệu, gõ bừa, trùng ý câu khác', ''),
]
TEN_SHEET = ['Gán nhãn', 'Giải thích nhãn', 'Thông tin']
# Dòng tiêu đề của sheet "Gán nhãn". doc_bang() tìm cột theo các chữ này, nên bảng có hay không có
# cột "ChemAI vừa nói" (thêm 05/10/2026) đều đọc được.
TIEU_DE = {'stt': 'STT', 'chemai_vua_noi': 'ChemAI vừa nói (chỉ để đọc)', 'tin_nhan': 'Câu hỏi',
           'nhan': 'Nhãn (bấm mũi tên)', 'nguoi_gan': 'Người gán', 'ghi_chu': 'Ghi chú'}
_COT_CU = {'stt': 'A', 'tin_nhan': 'B', 'nhan': 'C', 'nguoi_gan': 'D', 'ghi_chu': 'E'}   # bảng trước 05/10/2026

_KY_TU_LA = re.compile('[\x00-\x08\x0b\x0c\x0e-\x1f￾￿]')   # XML không chứa được
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}


def _o(ref, chu, kieu=0):
    """Một ô chuỗi (inline string). `kieu` là chỉ số trong cellXfs của styles.xml."""
    chu = escape(_KY_TU_LA.sub('', str(chu)))
    return f'<c r="{ref}" t="inlineStr" s="{kieu}"><is><t xml:space="preserve">{chu}</t></is></c>'


def _cao_dong(chu, rong=85):
    """Chiều cao dòng (điểm) đủ hiện cả câu khi xuống dòng trong ô; Excel tối đa 409."""
    so_dong = sum(max(1, -(-len(doan) // rong)) for doan in str(chu).split('\n'))
    return min(409, max(18, 15 * so_dong + 3))


def _sheet(dong_xml, cot_xml, them='', dong_dau_yen=True, o_chon='C2'):
    pane = ('<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>'
            f'<selection pane="bottomLeft" activeCell="{o_chon}" sqref="{o_chon}"/>') if dong_dau_yen else ''
    return ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            f'<worksheet xmlns="{NS["m"]}" xmlns:r="{NS["r"]}">'
            f'<sheetViews><sheetView workbookViewId="0">{pane}</sheetView></sheetViews>'
            f'<sheetFormatPr defaultRowHeight="15"/><cols>{cot_xml}</cols>'
            f'<sheetData>{"".join(dong_xml)}</sheetData>{them}</worksheet>')


def ghi_bang(tep, cau, ten_dot, so_hs=None, so_gv=None, da_gan=None, nguoi_gan_chung='', ngu_canh=None):
    """Ghi bảng gán nhãn cho danh sách câu (đúng thứ tự chua-gan.csv: STT = vị trí + 1).
    `da_gan` (tuỳ chọn, cùng độ dài `cau`): mỗi phần tử {'nhan': mã nhãn hoặc 'bo' hoặc '',
    'nguoi_gan', 'ghi_chu'} — để dựng lại bảng (vd. khi thêm nhãn mới) mà giữ phần đã gán.
    `ngu_canh` (tuỳ chọn, cùng độ dài `cau`): tin ChemAI ngay trước câu đó (cột chemai_vua_noi của
    chua-gan.csv). Có thì bảng thêm cột "ChemAI vừa nói" đứng TRƯỚC cột Câu hỏi, chỉ để người gán
    đọc; nhãn vẫn gán cho câu hỏi. Không có thì bảng 5 cột như trước 05/10/2026."""
    if ngu_canh is not None and len(ngu_canh) != len(cau):
        raise ValueError(f'ngu_canh có {len(ngu_canh)} dòng, khác số câu ({len(cau)}).')
    # Chữ cột của Câu hỏi | Nhãn | Người gán | Ghi chú: lùi một cột khi có cột ngữ cảnh.
    c_cau, c_nhan, c_nguoi, c_ghi = ('C', 'D', 'E', 'F') if ngu_canh is not None else ('B', 'C', 'D', 'E')
    da_gan = da_gan or [{}] * len(cau)
    ten_hien = {**NHAN_HIEN, 'bo': BO_CAU}
    # styles: 0 mặc định | 1 tiêu đề | 2 câu hỏi (xuống dòng, viền) | 3 ô thường có viền | 4 ô nhãn (nền vàng nhạt)
    styles = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<styleSheet xmlns="{NS["m"]}">'
        '<fonts count="2"><font><sz val="12"/><name val="Calibri"/></font>'
        '<font><b/><sz val="12"/><name val="Calibri"/></font></fonts>'
        '<fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>'
        '<fill><patternFill patternType="solid"><fgColor rgb="FFD9D9D9"/><bgColor indexed="64"/></patternFill></fill>'
        '<fill><patternFill patternType="solid"><fgColor rgb="FFFFF2CC"/><bgColor indexed="64"/></patternFill></fill></fills>'
        '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>'
        '<border><left style="thin"><color auto="1"/></left><right style="thin"><color auto="1"/></right>'
        '<top style="thin"><color auto="1"/></top><bottom style="thin"><color auto="1"/></bottom><diagonal/></border></borders>'
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
        '<cellXfs count="5">'
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
        '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">'
        '<alignment vertical="center" wrapText="1"/></xf>'
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1">'
        '<alignment vertical="top" wrapText="1"/></xf>'
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1">'
        '<alignment vertical="top"/></xf>'
        '<xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1">'
        '<alignment vertical="top"/></xf>'
        '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>')

    n = len(cau)
    co_ngu_canh = ngu_canh is not None
    dong = ['<row r="1" ht="22" customHeight="1">' + _o('A1', TIEU_DE['stt'], 1)
            + (_o('B1', TIEU_DE['chemai_vua_noi'], 1) if co_ngu_canh else '')
            + _o(f'{c_cau}1', TIEU_DE['tin_nhan'], 1) + _o(f'{c_nhan}1', TIEU_DE['nhan'], 1)
            + _o(f'{c_nguoi}1', TIEU_DE['nguoi_gan'], 1) + _o(f'{c_ghi}1', TIEU_DE['ghi_chu'], 1) + '</row>']
    def o_hoac_trong(ref, chu, kieu):
        return _o(ref, chu, kieu) if chu else f'<c r="{ref}" s="{kieu}"/>'
    rong_cau = 55 if co_ngu_canh else 85   # số ký tự một dòng trong ô, theo bề rộng cột bên dưới
    for i, (c, g) in enumerate(zip(cau, da_gan), start=2):
        nhan = g.get('nhan') or ''
        nc = (ngu_canh[i - 2] or '') if co_ngu_canh else ''
        cao = max(_cao_dong(c, rong_cau), _cao_dong(nc, 55) if nc else 0)
        dong.append(f'<row r="{i}" ht="{cao}" customHeight="1">'
                    f'<c r="A{i}" s="3"><v>{i - 1}</v></c>'
                    + (o_hoac_trong(f'B{i}', nc, 2) if co_ngu_canh else '')
                    + _o(f'{c_cau}{i}', c, 2)
                    + o_hoac_trong(f'{c_nhan}{i}', ten_hien.get(nhan, nhan), 4)
                    + o_hoac_trong(f'{c_nguoi}{i}', g.get('nguoi_gan') or '', 3)
                    + o_hoac_trong(f'{c_ghi}{i}', g.get('ghi_chu') or '', 2) + '</row>')
    ds = ','.join(list(NHAN_HIEN.values()) + [BO_CAU])
    kiem_tra = ('<dataValidations count="1"><dataValidation type="list" allowBlank="1" showInputMessage="1" '
                'showErrorMessage="1" errorStyle="stop" errorTitle="Nhãn không hợp lệ" '
                'error="Bấm mũi tên ở ô này và chọn một nhãn có sẵn." promptTitle="Chọn nhãn" '
                f'prompt="Bấm mũi tên bên phải ô để chọn nhãn." sqref="{c_nhan}2:{c_nhan}{max(2, n + 1)}">'
                f'<formula1>"{escape(ds)}"</formula1></dataValidation></dataValidations>')
    rong = [6, 60, 60, 22, 16, 30] if co_ngu_canh else [6, 90, 22, 16, 30]
    sheet1 = _sheet(dong, ''.join(f'<col min="{k}" max="{k}" width="{r}" customWidth="1"/>'
                                  for k, r in enumerate(rong, start=1)), kiem_tra, o_chon=f'{c_nhan}2')

    dong2 = ['<row r="1">' + _o('A1', 'Nhãn', 1) + _o('B1', 'Khi nào chọn', 1) + _o('C1', 'Ví dụ', 1) + '</row>']
    for i, (nhan, nghia, vd) in enumerate(GIAI_THICH, start=2):
        dong2.append(f'<row r="{i}" ht="36" customHeight="1">' + _o(f'A{i}', nhan, 3) + _o(f'B{i}', nghia, 2)
                     + _o(f'C{i}', vd, 2) + '</row>')
    sheet2 = _sheet(dong2, '<col min="1" max="1" width="22" customWidth="1"/>'
                           '<col min="2" max="2" width="60" customWidth="1"/><col min="3" max="3" width="40" customWidth="1"/>',
                    dong_dau_yen=False)

    tt = [('Đợt', ten_dot), ('Người gán (điền tên một lần cho cả bảng)', nguoi_gan_chung),
          ('Số câu', f'{n}' + (f' ({so_hs} học sinh, {so_gv} giáo viên/quản trị)' if so_hs is not None else '')),
          ('Cách làm', 'Ở sheet "Gán nhãn": bấm vào ô cột Nhãn, bấm mũi tên, chọn nhãn. Câu có tên người thì sửa tên '
                       'thành [tên]. Xong: Lưu (Ctrl+S, giữ định dạng .xlsx) rồi gửi lại tệp.'
                       + (' Cột "ChemAI vừa nói" là tin gia sư ngay trước câu đó, chỉ để đọc cho hiểu câu hỏi: nhãn '
                          'vẫn gán cho cột Câu hỏi. Cột này cũng có thể còn tên người, thấy thì sửa thành [tên].'
                          if co_ngu_canh else ''))]
    dong3 = [f'<row r="{i}" ht="{30 if i == 4 else 18}" customHeight="1">' + _o(f'A{i}', a, 1) + _o(f'B{i}', b, 2) + '</row>'
             for i, (a, b) in enumerate(tt, start=1)]
    sheet3 = _sheet(dong3, '<col min="1" max="1" width="40" customWidth="1"/><col min="2" max="2" width="80" customWidth="1"/>',
                    dong_dau_yen=False)

    workbook = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                f'<workbook xmlns="{NS["m"]}" xmlns:r="{NS["r"]}"><sheets>'
                + ''.join(f'<sheet name="{escape(t)}" sheetId="{i}" r:id="rId{i}"/>' for i, t in enumerate(TEN_SHEET, 1))
                + '</sheets></workbook>')
    wb_rels = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
               '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
               + ''.join(f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/'
                         f'relationships/worksheet" Target="worksheets/sheet{i}.xml"/>' for i in range(1, 4))
               + '<Relationship Id="rId9" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/'
                 'styles" Target="styles.xml"/></Relationships>')
    loai = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/xl/workbook.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            + ''.join(f'<Override PartName="/xl/worksheets/sheet{i}.xml" '
                      'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
                      for i in range(1, 4))
            + '<Override PartName="/xl/styles.xml" '
              'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>')
    goc_rels = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/'
                'officeDocument" Target="xl/workbook.xml"/></Relationships>')
    with zipfile.ZipFile(tep, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml', loai)
        z.writestr('_rels/.rels', goc_rels)
        z.writestr('xl/workbook.xml', workbook)
        z.writestr('xl/_rels/workbook.xml.rels', wb_rels)
        z.writestr('xl/styles.xml', styles)
        for i, s in enumerate((sheet1, sheet2, sheet3), 1):
            z.writestr(f'xl/worksheets/sheet{i}.xml', s)


# ── Đọc lại ─────────────────────────────────────────────────────────────────

def _cot(ref):
    return re.match(r'[A-Z]+', ref).group(0)


def _cac_sheet(z):
    """{tên sheet: đường dẫn trong zip}, theo workbook.xml và rels — Excel có thể đổi tên tệp."""
    wb = ET.fromstring(z.read('xl/workbook.xml'))
    rels = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    dich = {r.get('Id'): r.get('Target') for r in rels}
    ra = {}
    for s in wb.find('m:sheets', NS):
        t = dich[s.get(f'{{{NS["r"]}}}id')].lstrip('/')
        ra[s.get('name')] = t if t.startswith('xl/') else 'xl/' + t
    return ra


def _doc_sheet(z, duong, chung):
    """Danh sách dòng, mỗi dòng {cột: chuỗi}. Hiểu chuỗi dùng chung, inline, công thức chuỗi, số."""
    goc = ET.fromstring(z.read(duong))
    dong = []
    for r in goc.iter(f'{{{NS["m"]}}}row'):
        o = {}
        for c in r.findall('m:c', NS):
            t, v = c.get('t'), c.find('m:v', NS)
            if t == 's' and v is not None:
                gia_tri = chung[int(v.text)]
            elif t == 'inlineStr':
                gia_tri = ''.join(x.text or '' for x in c.iter(f'{{{NS["m"]}}}t'))
            elif v is not None:
                gia_tri = v.text or ''
                if re.fullmatch(r'-?\d+\.0', gia_tri):
                    gia_tri = gia_tri[:-2]
            else:
                gia_tri = ''
            o[_cot(c.get('r'))] = gia_tri
        dong.append(o)
    return dong


def ma_nhan(chu):
    """Tên nhãn trên bảng (hoặc mã) → mã nhãn; '(Bỏ câu này)' → 'bo'; trống → ''; lạ → giữ nguyên."""
    chu = (chu or '').strip()
    if not chu:
        return ''
    if chu.lower() == BO_CAU.lower():
        return 'bo'
    for ma, hien in NHAN_HIEN.items():
        if chu.lower() in (ma, hien.lower()):
            return ma
    return chu


def doc_bang(tep):
    """Trả {'dot', 'nguoi_gan', 'dong': [{'stt', 'tin_nhan', 'nhan', 'nguoi_gan', 'ghi_chu', 'chemai_vua_noi'}]}.
    Cột tìm theo dòng tiêu đề (TIEU_DE); bảng không có cột "ChemAI vừa nói" thì trường đó rỗng."""
    with zipfile.ZipFile(tep) as z:
        chung = []
        if 'xl/sharedStrings.xml' in z.namelist():
            for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si', NS):
                chung.append(''.join(x.text or '' for x in si.iter(f'{{{NS["m"]}}}t')))
        sheet = _cac_sheet(z)
        if TEN_SHEET[0] not in sheet or TEN_SHEET[2] not in sheet:
            raise ValueError(f'Không phải bảng gán nhãn của gia sư (thiếu sheet "{TEN_SHEET[0]}" hoặc "{TEN_SHEET[2]}").')
        tt = {d.get('A', '').strip(): d.get('B', '').strip() for d in _doc_sheet(z, sheet[TEN_SHEET[2]], chung)}
        dong = []
        cac_dong = _doc_sheet(z, sheet[TEN_SHEET[0]], chung)
        ten_cot = {chu.strip(): cot for cot, chu in (cac_dong[0] if cac_dong else {}).items()}
        cot = {truong: ten_cot[chu] for truong, chu in TIEU_DE.items() if chu in ten_cot}
        if not all(t in cot for t in _COT_CU):   # ai đó sửa dòng tiêu đề: đọc theo vị trí cột
            cot = (dict(zip(TIEU_DE, 'ABCDEF')) if len(ten_cot) >= len(TIEU_DE)   # bảng có cột ngữ cảnh
                   else dict(_COT_CU))                                            # bảng trước 05/10/2026
        o = lambda d, truong: d.get(cot.get(truong, ''), '').strip()   # noqa: E731
        for d in cac_dong[1:]:
            if not o(d, 'stt') and not o(d, 'tin_nhan'):
                continue
            dong.append({'stt': o(d, 'stt'), 'tin_nhan': o(d, 'tin_nhan'), 'nhan': ma_nhan(o(d, 'nhan')),
                         'nguoi_gan': o(d, 'nguoi_gan'), 'ghi_chu': o(d, 'ghi_chu'),
                         'chemai_vua_noi': o(d, 'chemai_vua_noi')})
    nguoi = next((v for k, v in tt.items() if k.startswith('Người gán')), '')
    return {'dot': tt.get('Đợt', ''), 'nguoi_gan': nguoi, 'dong': dong}
