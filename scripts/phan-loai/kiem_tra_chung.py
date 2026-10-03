"""Chạy vectơ kiểm chuẩn hoá phía Python. Chạy: python scripts/phan-loai/kiem_tra_chung.py"""
import csv
import json
import sys
import tempfile
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from chung import (  # noqa: E402
    bat_buoc_trong, chia_tap, chia_theo_tuy_chon, chuan_hoa, co_cau_that, do_ten_trong_tu_vung, doc_csv_nhan,
    doc_ten_hoc_sinh, gop_trung, tach_tu,
)

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

print('\n== Tập kiểm cố định cho câu thật (chia_theo_tuy_chon) ==')
# Dữ liệu GIẢ: 30 câu "that" + 30 câu tự viết, 3 nhãn, viết tại chỗ.
with tempfile.TemporaryDirectory() as tmp:
    nhan3 = ['be_tac', 'xin_dap_an', 'hoi_khai_niem']
    dong = [(f'cau that so {i} {nhan3[i % 3]}', nhan3[i % 3], 'that') for i in range(30)]
    dong += [(f'cau tu viet so {i} {nhan3[i % 3]}', nhan3[i % 3], 'tu-viet') for i in range(30)]
    vao = Path(tmp) / 'nhan.csv'
    with open(vao, 'w', encoding='utf-8-sig', newline='') as f:
        csv.writer(f).writerows([('tin_nhan', 'nhan', 'nguoi_gan', 'nguon')] + [(t, n, 'x', g) for t, n, g in dong])
    X, y = doc_csv_nhan(vao)
    tk = Path(tmp) / 'that' / 'tap-kiem-co-dinh.csv'

    ok(chia_theo_tuy_chon(X, y, vao) == chia_tap(X, y), 'không có --tap-kiem thì chia 80/20 y như cũ')
    try:
        chia_theo_tuy_chon(X, y, vao, tk)
        ok(False, 'chưa có tệp mà không --tao-tap-kiem phải dừng')
    except SystemExit:
        ok(True, 'chưa có tệp tập kiểm, không --tao-tap-kiem → dừng, không tự tạo')

    X_tr, X_te, y_tr, y_te = chia_theo_tuy_chon(X, y, vao, tk, tao=True)
    ok(tk.exists() and len(X_te) == 6, f'tạo tập kiểm 20 % của 30 câu thật = 6 câu (được {len(X_te)})')
    ok(all(t.startswith('cau that') for t in X_te), 'tập kiểm CHỈ gồm câu nguồn "that"')
    ok(sorted(Counter(y_te).values()) == [2, 2, 2], f'tập kiểm giữ tỉ lệ nhãn ({dict(Counter(y_te))})')
    ok(len(X_tr) == 54 and not set(X_tr) & set(X_te), 'phần học là 54 câu còn lại, không lẫn câu kiểm')

    try:
        chia_theo_tuy_chon(X, y, vao, tk, tao=True)
        ok(False, 'đã có tệp mà vẫn --tao-tap-kiem phải dừng')
    except SystemExit:
        ok(True, 'đã có tệp mà vẫn --tao-tap-kiem → dừng, không tạo lại')

    # Đợt sau: thêm 12 câu thật mới (viết khác hoa thường câu cũ cũng là câu mới khác).
    X2 = X + [f'cau that moi {i}' for i in range(12)]
    y2 = y + [nhan3[i % 3] for i in range(12)]
    X2_tr, X2_te, _, _ = chia_theo_tuy_chon(X2, y2, vao, tk)
    ok(X2_te == X_te and len(X2_tr) == 66, 'thêm câu mới: tập kiểm GIỮ NGUYÊN, câu mới vào phần học')

    bo = [t for t in X if t != X_te[0]]
    try:
        chia_theo_tuy_chon(bo, [n for t, n in zip(X, y) if t != X_te[0]], vao, tk)
        ok(False, 'mất một câu của tập kiểm phải dừng')
    except SystemExit:
        ok(True, 'một câu của tập kiểm biến khỏi dữ liệu → dừng')

print('\n== Câu thật không rời du-lieu/that/, tên không lọt vào từ vựng ==')
with tempfile.TemporaryDirectory() as tmp:
    goc = Path(tmp) / 'that'
    goc.mkdir()
    ok(bat_buoc_trong(goc / 'ket-qua', goc, '--kiem') == (goc / 'ket-qua').resolve(), 'đường dẫn TRONG that/ thì cho qua')
    try:
        bat_buoc_trong(Path(tmp) / 'ket-qua', goc, '--kiem')
        ok(False, 'đường dẫn ngoài that/ phải dừng')
    except SystemExit:
        ok(True, 'đường dẫn ngoài that/ → dừng')
    try:
        bat_buoc_trong(Path(tmp) / 'that-gia' / 'x.csv', goc, '--ra')
        ok(False, 'thư mục "that-gia" không phải that/ mà vẫn cho qua')
    except SystemExit:
        ok(True, 'thư mục tên na ná ("that-gia") không lách được')

    def ghi(p, dong):
        with open(p, 'w', encoding='utf-8-sig', newline='') as f:
            csv.writer(f).writerows(dong)
    ghi(Path(tmp) / 'tu-viet.csv', [('tin_nhan', 'nhan', 'nguoi_gan', 'nguon'), ('em chiu', 'be_tac', 'x', 'tu-viet')])
    ghi(Path(tmp) / 'co-that.csv', [('tin_nhan', 'nhan', 'nguoi_gan', 'nguon'), ('em chiu', 'be_tac', 'x', 'that')])
    ghi(goc / 'mat-cot-nguon.csv', [('tin_nhan', 'nhan'), ('em chiu', 'be_tac')])
    ok(not co_cau_that(Path(tmp) / 'tu-viet.csv', goc_that=goc), 'tệp toàn câu tự viết: không phải câu thật')
    ok(co_cau_that(Path(tmp) / 'tu-viet.csv', Path(tmp) / 'co-that.csv', goc_that=goc), 'có một dòng nguồn "that" là đủ')
    ok(co_cau_that(goc / 'mat-cot-nguon.csv', goc_that=goc), 'tệp nằm trong that/ dù đã xoá cột nguon vẫn tính là câu thật')

    try:
        doc_ten_hoc_sinh(goc / 'khong-co.txt')
        ok(False, 'thiếu danh sách tên phải dừng')
    except SystemExit:
        ok(True, 'thiếu danh sách tên học sinh → dừng, không học mù')
    (goc / 'ten.txt').write_text('Nguyễn Hoàng Thanh An\r\n\r\nTrần Bảo Ân\r\n', encoding='utf-8')
    ds_ten = doc_ten_hoc_sinh(goc / 'ten.txt')
    ok(ds_ten == ['Nguyễn Hoàng Thanh An', 'Trần Bảo Ân'], 'đọc danh sách tên, bỏ dòng trống')

tu_vung = {'thanh an': 0, 'nguyen hoang': 1, 'dap an': 2, 'an': 3, 'bao an': 4, 'cho em': 5}
lot = do_ten_trong_tu_vung(tu_vung, ['Nguyễn Hoàng Thanh An', 'Trần Bảo Ân'])
ok(lot == ['bao an', 'nguyen hoang', 'thanh an'], f'dò ra cụm hai chữ của tên, so không dấu ({lot})')
ok('an' not in lot and 'dap an' not in lot, 'chữ đơn "an" và cụm thường "dap an" không bị bắt')
ok(do_ten_trong_tu_vung(tu_vung, ['nguyen hoang thanh an']) == ['nguyen hoang', 'thanh an'], 'tên gõ không dấu cũng dò được')
ok(do_ten_trong_tu_vung(tu_vung, ['Trần Bảo Ân'], cho_phep=['bảo an']) == [], '--cho-phep-cum bỏ qua cụm đã xem tay')

print('>>> TẤT CẢ ĐẠT' if hong == 0 else f'>>> CÓ {hong} MỤC KHÔNG ĐẠT')
sys.exit(0 if hong == 0 else 1)
