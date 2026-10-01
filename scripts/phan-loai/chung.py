"""Phần dùng chung của bộ phân loại ý định (02/10/2026).

`chuan_hoa` PHẢI cho ra đúng như `chuanHoaYDinh()` bên TypeScript
(src/features/tutor/services/phanLoaiYDinh.ts). Lệch một ký tự thì mô hình học
một đằng, trình duyệt đoán một nẻo. Hai bên cùng chạy du-lieu/vecto-chuan-hoa.json.
"""
import csv
import re
import sys
import unicodedata

PHIEN_BAN_CHUAN_HOA = 1

# Sáu nhãn — thứ tự cố định, dùng cho báo cáo và ma trận nhầm lẫn.
NHAN = ['hoi_khai_niem', 'be_tac', 'xin_dap_an', 'nop_bai_lam', 'gian_lan_phong_thi', 'ngoai_mon']

_NGOAI_CHU_SO = re.compile(r'[^a-z0-9]+')


def chuan_hoa(s):
    """Chữ thường → bỏ dấu → đ thành d → mọi thứ ngoài a-z, 0-9 thành một dấu cách."""
    s = unicodedata.normalize('NFD', (s or '').lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = s.replace('đ', 'd')
    return _NGOAI_CHU_SO.sub(' ', s).strip()


def tach_tu(s):
    """Tách theo dấu cách, GIỮ từ một ký tự ("k biet")."""
    t = chuan_hoa(s)
    return t.split(' ') if t else []


def doc_csv_nhan(tep):
    """Đọc CSV có cột tin_nhan, nhan. Dòng trống bỏ qua; nhãn lạ thì DỪNG, đừng học sai."""
    X, y = [], []
    with open(tep, encoding='utf-8-sig', newline='') as f:
        for so_dong, r in enumerate(csv.DictReader(f), start=2):
            tin = (r.get('tin_nhan') or '').strip()
            nhan = (r.get('nhan') or '').strip()
            if not tin:
                continue
            if nhan not in NHAN:
                sys.exit(f'{tep} dòng {so_dong}: nhãn lạ "{nhan}". Nhãn hợp lệ: {", ".join(NHAN)}')
            X.append(tin)
            y.append(nhan)
    return X, y
