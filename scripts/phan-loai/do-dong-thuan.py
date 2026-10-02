"""Đo độ đồng thuận giữa hai người gán nhãn (Cohen's kappa).

Chạy: python scripts/phan-loai/do-dong-thuan.py nguoi1.csv nguoi2.csv
Ra:   in kappa, tỉ lệ trùng; ghi các câu bất đồng ra du-lieu/bat-dong.csv để ngồi bàn lại.

Đọc kappa (Landis & Koch 1977): < 0,4 kém — viết lại hướng dẫn; 0,4–0,6 vừa;
0,6–0,8 tốt; > 0,8 rất tốt. Báo cáo đề tài ghi kappa TRƯỚC khi thống nhất.
"""
import csv
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from chung import NHAN, doc_csv_nhan  # noqa: E402

if len(sys.argv) != 3:
    sys.exit('Cách chạy: python scripts/phan-loai/do-dong-thuan.py nguoi1.csv nguoi2.csv')
from sklearn.metrics import cohen_kappa_score  # noqa: E402

a = dict(zip(*doc_csv_nhan(sys.argv[1])))
b = dict(zip(*doc_csv_nhan(sys.argv[2])))
chung = [t for t in a if t in b]
if not chung:
    sys.exit('Hai tệp không có câu nào trùng nhau — hai người phải gán CÙNG danh sách câu.')
y1, y2 = [a[t] for t in chung], [b[t] for t in chung]
trung = sum(p == q for p, q in zip(y1, y2))
print(f'Số câu chung: {len(chung)} (bỏ {len(a) - len(chung)} / {len(b) - len(chung)} câu chỉ một người có)')
print(f'Trùng nhãn: {trung}/{len(chung)} = {trung / len(chung):.1%}')
print(f"Cohen's kappa: {cohen_kappa_score(y1, y2, labels=NHAN):.3f}")
ra = Path(__file__).parent / 'du-lieu' / 'bat-dong.csv'
with open(ra, 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f)
    w.writerow(['tin_nhan', 'nhan_1', 'nhan_2'])
    w.writerows([t, a[t], b[t]] for t in chung if a[t] != b[t])
print(f'Câu bất đồng: {len(chung) - trung} — ghi ở {ra.name}')
