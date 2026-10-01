"""Chạy vectơ kiểm chuẩn hoá phía Python. Chạy: python scripts/phan-loai/kiem_tra_chung.py"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from chung import chuan_hoa, tach_tu  # noqa: E402

hong = 0
for v in json.loads((Path(__file__).parent / 'du-lieu' / 'vecto-chuan-hoa.json').read_text(encoding='utf-8')):
    ra = chuan_hoa(v['vao'])
    dat = ra == v['ra']
    hong += 0 if dat else 1
    print(f"  {'OK  ' if dat else 'SAI '} {v['vao']!r} -> {v['ra']!r}" + ('' if dat else f'  — ra {ra!r}'))
dat = tach_tu('k biet') == ['k', 'biet']
hong += 0 if dat else 1
print(f"  {'OK  ' if dat else 'SAI '} giữ từ một ký tự")
print('>>> TẤT CẢ ĐẠT' if hong == 0 else f'>>> CÓ {hong} MỤC KHÔNG ĐẠT')
sys.exit(0 if hong == 0 else 1)
