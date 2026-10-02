"""Phần dùng chung của bộ phân loại ý định (02/10/2026).

`chuan_hoa` PHẢI cho ra đúng như `chuanHoaYDinh()` bên TypeScript
(src/features/tutor/services/phanLoaiYDinh.ts). Lệch một ký tự thì mô hình học
một đằng, trình duyệt đoán một nẻo. Hai bên cùng chạy du-lieu/vecto-chuan-hoa.json.
"""
import csv
import re
import sys
import unicodedata

# Windows: Python không tự dùng UTF-8 cho console (kể cả khi chcp 65001), in chữ
# Việt là văng UnicodeEncodeError trước khi kịp báo kết quả. Ép UTF-8 ngay khi nạp.
for _luong in (sys.stdout, sys.stderr):
    if hasattr(_luong, 'reconfigure'):
        _luong.reconfigure(encoding='utf-8', errors='replace')

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
    try:
        with open(tep, encoding='utf-8-sig', newline='') as f:
            doc = csv.DictReader(f)
            cot = doc.fieldnames or []
            if 'tin_nhan' not in cot or 'nhan' not in cot:
                sys.exit(
                    f'{tep}: thiếu cột. Cần "tin_nhan" và "nhan", tệp đang có: {", ".join(cot) or "(rỗng)"}.\n'
                    f'Mở trong Excel rồi lưu lại bằng "CSV UTF-8 (Comma delimited)" để không lệch cột.')
            X, y = [], []
            for so_dong, r in enumerate(doc, start=2):
                tin = (r.get('tin_nhan') or '').strip()
                nhan = (r.get('nhan') or '').strip()
                if not tin:
                    continue
                if nhan not in NHAN:
                    sys.exit(f'{tep} dòng {so_dong}: nhãn lạ "{nhan}". Nhãn hợp lệ: {", ".join(NHAN)}')
                X.append(tin)
                y.append(nhan)
    except UnicodeDecodeError:
        sys.exit(
            f'{tep}: không đọc được bằng UTF-8 (có thể Excel lưu bằng bảng mã khác).\n'
            f'Mở lại trong Excel rồi lưu bằng "CSV UTF-8 (Comma delimited)".')
    return X, y


def gop_trung(X, y):
    """Gộp các câu CÙNG CHUẨN HOÁ (chuan_hoa) thành một dòng duy nhất trước khi chia train/test.

    "Em chịu", "em chiu", "Em chịu ạ!!" ra cùng một vectơ TF-IDF — nếu một bản rơi
    vào train, một bản rơi vào test, mô hình coi như đã "xem bài" trước khi làm
    tập kiểm: bộ luật regex không có lợi thế này, nên so độ chính xác hai bên sẽ
    lệch có lợi cho mô hình một cách giả tạo. Giữ câu gốc (nguyên văn) của lần
    xuất hiện ĐẦU TIÊN cho mỗi khoá chuẩn hoá.

    Hai dòng trùng khoá nhưng nhãn khác nhau là người gán nhãn chưa thống nhất —
    DỪNG lại, đừng để máy tự chọn một nhãn.
    """
    theo_khoa = {}  # khoá chuẩn hoá -> (tin gốc, nhãn) của lần xuất hiện đầu tiên
    X2, y2 = [], []
    so_gop = 0
    for tin, nhan in zip(X, y):
        khoa = chuan_hoa(tin)
        if khoa in theo_khoa:
            tin_cu, nhan_cu = theo_khoa[khoa]
            if nhan_cu != nhan:
                sys.exit(
                    f'Hai câu chuẩn hoá giống nhau ("{khoa}") nhưng nhãn khác nhau — '
                    f'người gán phải thống nhất trước khi huấn luyện:\n'
                    f'  "{tin_cu}" → {nhan_cu}\n'
                    f'  "{tin}" → {nhan}')
            so_gop += 1
            continue
        theo_khoa[khoa] = (tin, nhan)
        X2.append(tin)
        y2.append(nhan)
    return X2, y2, so_gop
