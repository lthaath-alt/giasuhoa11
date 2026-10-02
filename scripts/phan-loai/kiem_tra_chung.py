"""Chạy vectơ kiểm chuẩn hoá phía Python. Chạy: python scripts/phan-loai/kiem_tra_chung.py"""
import json
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from chung import chuan_hoa, doc_csv_nhan, gop_trung, tach_tu  # noqa: E402

hong = 0


def ok(dat, ten):
    global hong
    hong += 0 if dat else 1
    print(f"  {'OK  ' if dat else 'SAI '} {ten}")


for v in json.loads((Path(__file__).parent / 'du-lieu' / 'vecto-chuan-hoa.json').read_text(encoding='utf-8')):
    ra = chuan_hoa(v['vao'])
    dat = ra == v['ra']
    hong += 0 if dat else 1
    print(f"  {'OK  ' if dat else 'SAI '} {v['vao']!r} -> {v['ra']!r}" + ('' if dat else f'  — ra {ra!r}'))
ok(tach_tu('k biet') == ['k', 'biet'], 'giữ từ một ký tự')

print('\n== gop_trung: gộp câu trùng sau chuẩn hoá, chặn nhãn mâu thuẫn ==')
# 'Em chịu' -> 'em chiu', 'em chiu' -> 'em chiu', 'EM CHỊU!!' -> 'em chiu':
# cùng khoá, cùng nhãn — giữ câu ĐẦU, gộp 2 câu sau.
# ('Em chịu ạ!!' KHÔNG cùng khoá — ra 'em chiu a' vì có thêm chữ 'ạ'.)
X2, y2, so_gop = gop_trung(['Em chịu', 'em chiu', 'EM CHỊU!!'], ['be_tac', 'be_tac', 'be_tac'])
ok(X2 == ['Em chịu'] and y2 == ['be_tac'], 'giữ câu gốc của lần xuất hiện đầu tiên')
ok(so_gop == 2, f'so_gop đúng số câu bị gộp (được {so_gop}, cần 2)')

try:
    gop_trung(['Em chịu', 'em chiu'], ['be_tac', 'xin_dap_an'])
    ok(False, 'cùng khoá chuẩn hoá nhưng khác nhãn phải dừng bằng SystemExit')
except SystemExit:
    ok(True, 'cùng khoá chuẩn hoá nhưng khác nhãn → SystemExit (người gán phải thống nhất)')

print('\n== doc_csv_nhan: CSV thiếu cột tin_nhan/nhan phải dừng rõ nguyên nhân ==')
with tempfile.TemporaryDirectory() as tmp:
    tep_thieu_cot = Path(tmp) / 'thieu-cot.csv'
    tep_thieu_cot.write_text('cau,label\nxin chao,be_tac\n', encoding='utf-8')
    try:
        doc_csv_nhan(tep_thieu_cot)
        ok(False, 'CSV thiếu cột tin_nhan/nhan phải dừng bằng SystemExit')
    except SystemExit:
        ok(True, 'CSV thiếu cột tin_nhan/nhan → SystemExit')

print('>>> TẤT CẢ ĐẠT' if hong == 0 else f'>>> CÓ {hong} MỤC KHÔNG ĐẠT')
sys.exit(0 if hong == 0 else 1)
