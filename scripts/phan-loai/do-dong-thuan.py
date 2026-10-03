"""Đo độ đồng thuận giữa hai người gán nhãn (Cohen's kappa).

Chạy: python scripts/phan-loai/do-dong-thuan.py nguoi1.csv nguoi2.csv [--ra bat-dong.csv]
Ra:   in kappa, tỉ lệ trùng, đồng thuận từng nhãn, ma trận nhầm lẫn giữa hai người;
      ghi các câu bất đồng ra du-lieu/bat-dong.csv (cột nhan_chot, ly_do để trống) để
      ngồi bàn lại, rồi gop-nhan.py dựng du-lieu/nhan.csv.

Đọc kappa (Landis & Koch 1977): < 0,4 kém — viết lại hướng dẫn; 0,4–0,6 vừa;
0,6–0,8 tốt; > 0,8 rất tốt. Báo cáo đề tài ghi kappa TRƯỚC khi thống nhất.
"""
import argparse
import csv
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from chung import NHAN, doc_csv_nhan  # noqa: E402
from sklearn.metrics import cohen_kappa_score, confusion_matrix  # noqa: E402


def doc_theo_cau(tep):
    """{câu: nhãn}. Một câu gặp hai lần trong CÙNG tệp: cùng nhãn thì bỏ bản sau,
    khác nhãn thì DỪNG — dict thường sẽ lặng lẽ giữ nhãn sau cùng."""
    ket = {}
    for tin, nhan in zip(*doc_csv_nhan(tep)):
        if tin in ket and ket[tin] != nhan:
            sys.exit(f'{tep}: câu "{tin}" gặp hai lần với hai nhãn {ket[tin]} và {nhan} — sửa tệp trước.')
        ket.setdefault(tin, nhan)
    return ket


def main():
    ap = argparse.ArgumentParser(description='Đo đồng thuận giữa hai người gán nhãn.')
    ap.add_argument('nguoi1')
    ap.add_argument('nguoi2')
    ap.add_argument('--ra', default=str(Path(__file__).parent / 'du-lieu' / 'bat-dong.csv'),
                    help='nơi ghi các câu bất đồng')
    a = ap.parse_args()

    ta, tb = doc_theo_cau(a.nguoi1), doc_theo_cau(a.nguoi2)
    chung = [t for t in ta if t in tb]
    if not chung:
        sys.exit('Hai tệp không có câu nào trùng nhau — hai người phải gán CÙNG danh sách câu.')
    y1, y2 = [ta[t] for t in chung], [tb[t] for t in chung]
    trung = sum(p == q for p, q in zip(y1, y2))
    print(f'Số câu chung: {len(chung)} (bỏ {len(ta) - len(chung)} / {len(tb) - len(chung)} câu chỉ một người có)')
    print(f'Trùng nhãn: {trung}/{len(chung)} = {trung / len(chung):.1%}')
    print(f"Cohen's kappa: {cohen_kappa_score(y1, y2, labels=NHAN):.3f}")

    # Đồng thuận riêng từng nhãn = 2·(số câu cả hai cùng gán nhãn đó) / (số câu người 1 gán + người 2 gán).
    # Kappa chung cao vẫn có thể che một nhãn hai người hiểu khác nhau.
    print('\nĐồng thuận từng nhãn (2 × cả hai cùng gán / tổng hai người gán):')
    print(f'  {"nhãn":<20}{"người 1":>8}{"người 2":>8}{"cùng":>6}{"đồng thuận":>12}')
    for n in NHAN:
        n1, n2 = y1.count(n), y2.count(n)
        ca_hai = sum(p == q == n for p, q in zip(y1, y2))
        ti_le = f'{2 * ca_hai / (n1 + n2):.1%}' if n1 + n2 else '—'
        print(f'  {n:<20}{n1:>8}{n2:>8}{ca_hai:>6}{ti_le:>12}')

    print('\nMa trận nhầm lẫn giữa hai người (hàng = người 1, cột = người 2):')
    viet_tat = [n[:6] for n in NHAN]
    print(f'  {"":<20}' + ''.join(f'{v:>8}' for v in viet_tat))
    for n, hang in zip(NHAN, confusion_matrix(y1, y2, labels=NHAN)):
        print(f'  {n:<20}' + ''.join(f'{int(v):>8}' for v in hang))
    print('  (cột viết tắt 6 chữ đầu của nhãn, cùng thứ tự với hàng)')

    ra = Path(a.ra)
    ra.parent.mkdir(parents=True, exist_ok=True)
    with open(ra, 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f)
        w.writerow(['tin_nhan', 'nhan_1', 'nhan_2', 'nhan_chot', 'ly_do'])
        w.writerows([t, ta[t], tb[t], '', ''] for t in chung if ta[t] != tb[t])
    print(f'\nCâu bất đồng: {len(chung) - trung} — ghi ở {ra}')
    print('Ngồi lại điền cột nhan_chot (và ly_do) cho từng câu, rồi chạy gop-nhan.py.')


if __name__ == '__main__':
    main()
