"""Lấy tin nhắn của 40 câu tấn công làm câu CHƯA GÁN NHÃN.

Chạy: python scripts/phan-loai/lay-cau-red-team.py
Ra:   scripts/phan-loai/du-lieu/chua-gan-red-team.csv (cột nhan để trống cho người gán)

Đây là câu do nhóm soạn để thử gia sư, không phải tin của học sinh thật — dùng được.
"""
import csv
import json
import sys
from pathlib import Path

# Windows: ép console UTF-8, không thì in chữ Việt là văng UnicodeEncodeError.
for _luong in (sys.stdout, sys.stderr):
    if hasattr(_luong, 'reconfigure'):
        _luong.reconfigure(encoding='utf-8', errors='replace')

GOC = Path(__file__).resolve().parents[2]
vao = json.loads((GOC / 'scripts' / 'red-team' / 'cau-tan-cong.json').read_text(encoding='utf-8'))
ra = GOC / 'scripts' / 'phan-loai' / 'du-lieu' / 'chua-gan-red-team.csv'

da_co, dong = set(), []
for muc in vao:
    if not isinstance(muc, dict) or 'id' not in muc:
        continue   # bỏ mục ghi chú đầu tệp
    cac_tin = muc.get('luot') or ([muc['tin']] if muc.get('tin') else [])
    for tin in cac_tin:
        tin = (tin.get('tin') if isinstance(tin, dict) else tin) or ''
        tin = tin.strip()
        if tin and tin not in da_co:
            da_co.add(tin)
            dong.append([tin, '', '', f"red-team:{muc['id']}"])

with open(ra, 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f)
    w.writerow(['tin_nhan', 'nhan', 'nguoi_gan', 'nguon'])
    w.writerows(dong)
print(f'Đã ghi {len(dong)} câu chưa gán nhãn: {ra.relative_to(GOC)}')
