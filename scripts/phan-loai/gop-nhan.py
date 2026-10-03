"""Gộp nhãn của hai người gán và kết quả thống nhất thành du-lieu/nhan.csv.

Chạy: python scripts/phan-loai/gop-nhan.py nguoi1.csv nguoi2.csv du-lieu/bat-dong.csv [--ra du-lieu/nhan.csv] [--ghi-de]

- Câu hai người cùng nhãn: giữ nhãn đó, nguoi_gan = "<người 1>+<người 2>".
- Câu bất đồng: lấy cột nhan_chot trong bat-dong.csv (tệp do do-dong-thuan.py ghi, nhóm
  đã ngồi bàn và điền), nguoi_gan = "thong-nhat:<người 1>+<người 2>".
- Còn câu bất đồng chưa có nhan_chot, hay nhan_chot là nhãn lạ: DỪNG, không tự chọn.
- Câu chỉ một người có: bỏ ra và in số câu, như do-dong-thuan.py.
- Tệp ra đã có: phải thêm --ghi-de, để không đè mất nhan.csv cũ khi gõ nhầm.
"""
import argparse
import csv
import sys
from collections import Counter
from pathlib import Path

THU_MUC = Path(__file__).resolve().parent
sys.path.insert(0, str(THU_MUC))
from chung import NHAN, doc_csv_nhan  # noqa: E402


def doc_dong(tep):
    """{câu: dòng CSV}. doc_csv_nhan chạy trước để dừng sớm nếu thiếu cột hay nhãn lạ."""
    doc_csv_nhan(tep)
    ket = {}
    with open(tep, encoding='utf-8-sig', newline='') as f:
        for r in csv.DictReader(f):
            tin = (r.get('tin_nhan') or '').strip()
            if not tin:
                continue
            r['nhan'] = (r.get('nhan') or '').strip()
            if tin in ket and ket[tin]['nhan'] != r['nhan']:
                sys.exit(f'{tep}: câu "{tin}" gặp hai lần với hai nhãn khác nhau — sửa tệp trước.')
            ket.setdefault(tin, r)
    return ket


def ten_nguoi(dong, mac_dinh):
    return (dong.get('nguoi_gan') or '').strip() or mac_dinh


def main():
    ap = argparse.ArgumentParser(description='Gộp nhãn hai người và kết quả thống nhất thành nhan.csv.')
    ap.add_argument('nguoi1')
    ap.add_argument('nguoi2')
    ap.add_argument('bat_dong', help='bat-dong.csv đã điền cột nhan_chot')
    ap.add_argument('--ra', default=str(THU_MUC / 'du-lieu' / 'nhan.csv'))
    ap.add_argument('--ghi-de', action='store_true', help='cho phép ghi đè tệp ra đã có')
    a = ap.parse_args()

    ra = Path(a.ra)
    if ra.exists() and not a.ghi_de:
        sys.exit(f'{ra} đã có. Sao lưu tệp cũ rồi chạy lại với --ghi-de nếu đúng là muốn thay.')

    da, db = doc_dong(a.nguoi1), doc_dong(a.nguoi2)
    chot = {}
    with open(a.bat_dong, encoding='utf-8-sig', newline='') as f:
        for r in csv.DictReader(f):
            tin = (r.get('tin_nhan') or '').strip()
            if tin:
                chot[tin] = (r.get('nhan_chot') or '').strip()

    chung = [t for t in da if t in db]
    dong, thieu, la = [], [], []
    so_thong_nhat = 0
    for t in chung:
        r1, r2 = da[t], db[t]
        ai = f'{ten_nguoi(r1, "nguoi-1")}+{ten_nguoi(r2, "nguoi-2")}'
        nguon = (r1.get('nguon') or r2.get('nguon') or '').strip()
        if r1['nhan'] == r2['nhan']:
            dong.append([t, r1['nhan'], ai, nguon])
            continue
        nhan = chot.get(t, '')
        if not nhan:
            thieu.append(t)
        elif nhan not in NHAN:
            la.append(f'"{t}" → "{nhan}"')
        else:
            dong.append([t, nhan, f'thong-nhat:{ai}', nguon])
            so_thong_nhat += 1
    if thieu:
        sys.exit(f'{len(thieu)} câu bất đồng chưa có nhan_chot trong {a.bat_dong}:\n  '
                 + '\n  '.join(thieu[:10]) + ('\n  ...' if len(thieu) > 10 else ''))
    if la:
        sys.exit(f'nhan_chot lạ (nhãn hợp lệ: {", ".join(NHAN)}):\n  ' + '\n  '.join(la))
    thua = [t for t in chot if t not in chung or da[t]['nhan'] == db[t]['nhan']]
    if thua:
        print(f'Lưu ý: {len(thua)} dòng trong {a.bat_dong} không còn là câu bất đồng (bat-dong.csv cũ?), đã bỏ qua.')

    ra.parent.mkdir(parents=True, exist_ok=True)
    with open(ra, 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f)
        w.writerow(['tin_nhan', 'nhan', 'nguoi_gan', 'nguon'])
        w.writerows(dong)

    dem = Counter(r[1] for r in dong)
    print(f'Ghi {len(dong)} câu vào {ra}: {len(dong) - so_thong_nhat} câu hai người trùng, '
          f'{so_thong_nhat} câu thống nhất sau khi bàn.')
    print(f'Bỏ {len(da) - len(chung)} / {len(db) - len(chung)} câu chỉ một người có.')
    print('Số câu từng nhãn: ' + ', '.join(f'{n}={dem[n]}' for n in NHAN))
    it = [n for n in NHAN if dem[n] < 50]
    if it:
        print(f'Chưa đủ 50 câu/nhãn theo hướng dẫn: {", ".join(it)} — gán thêm trước khi huấn luyện thật.')


if __name__ == '__main__':
    main()
