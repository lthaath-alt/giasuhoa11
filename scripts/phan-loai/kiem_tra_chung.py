"""Chạy vectơ kiểm chuẩn hoá phía Python. Chạy: python scripts/phan-loai/kiem_tra_chung.py"""
import csv
import json
import sys
import tempfile
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from chung import (  # noqa: E402
    bat_buoc_trong, chia_tap, la_cau_hoc_sinh, chia_theo_tuy_chon, chuan_hoa, co_cau_that, do_ten_trong_tu_vung, doc_csv_nhan,
    doc_ten_hoc_sinh, gop_trung, tach_tu,
)
import os  # noqa: E402
from bang_xlsx import doc_bang, ghi_bang, ma_nhan  # noqa: E402
from hang_ngay import doc_bien_gmail, doc_ngu_canh, gui_thu, kiem_dang_nhap, lam_bang, soan_thu  # noqa: E402
from nap_dot import (  # noqa: E402
    NGUONG_TAP_KIEM, Dung, cau_chua_hai_nguoi_gan, chenh, chu_kappa, chu_kappa_gop, chuyen_bang, cong_don, doc_lich_su,
    du_cau_chot_tap_kiem, dung_tep_hoc, ghi_dong, kappa, kappa_gop, kiem_cung_danh_sach, kiem_tep_gan,
    them_lich_su,
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

print('\n== Quy trình nạp đợt (nap_dot.py): các bước kiểm, cộng dồn, lịch sử ==')
with tempfile.TemporaryDirectory() as tmp:
    tm = Path(tmp)

    def dung_ra(ham, *ts):
        try:
            ham(*ts)
            return ''
        except Dung as e:
            return str(e)

    ghi_dong(tm / 'a.csv', [{'tin_nhan': 'em chiu', 'nhan': 'be_tac', 'nguoi_gan': 'An'},
                            {'tin_nhan': 'cho dap an', 'nhan': '', 'nguoi_gan': 'An'}], ['tin_nhan', 'nhan', 'nguoi_gan'])
    ok('chưa gán nhãn' in dung_ra(kiem_tep_gan, tm / 'a.csv'), 'còn ô nhãn trống → dừng, nói dòng nào')
    ghi_dong(tm / 'a.csv', [{'tin_nhan': 'em chiu', 'nhan': 'be-tac', 'nguoi_gan': 'An'}], ['tin_nhan', 'nhan', 'nguoi_gan'])
    ok('nhãn lạ' in dung_ra(kiem_tep_gan, tm / 'a.csv'), 'nhãn gõ sai → dừng')
    ghi_dong(tm / 'a.csv', [{'tin_nhan': 'em chiu', 'nhan': 'be_tac', 'nguoi_gan': ''}], ['tin_nhan', 'nhan', 'nguoi_gan'])
    ok('nguoi_gan' in dung_ra(kiem_tep_gan, tm / 'a.csv'), 'thiếu tên người gán → dừng')
    ok('Không thấy' in dung_ra(kiem_tep_gan, tm / 'khong-co.csv'), 'thiếu tệp → dừng')
    ok('lệch' in dung_ra(kiem_cung_danh_sach, [{'tin_nhan': 'a'}], [{'tin_nhan': 'b'}]), 'a.csv và b.csv khác câu → dừng')

    d1 = [{'tin_nhan': 'Em chịu', 'nhan': 'be_tac', 'nguoi_gan': 'An+Binh'},
          {'tin_nhan': 'cho em dap an', 'nhan': 'xin_dap_an', 'nguoi_gan': 'An+Binh'}]
    tl, them = cong_don([], d1, 'dot-1')
    ok(them == 2 and all(d['nguon'] == 'that:dot-1' for d in tl), 'đợt đầu: thêm 2 câu, nguồn ghi tên đợt')
    tl2, them2 = cong_don(tl, d1, 'dot-1')
    ok(them2 == 0 and len(tl2) == 2, 'chạy lại cùng đợt không cộng hai lần')
    tl3, them3 = cong_don(tl, [{'tin_nhan': 'em chiu!!', 'nhan': 'be_tac'}, {'tin_nhan': 'Kc là gì', 'nhan': 'hoi_khai_niem'}], 'dot-2')
    ok(them3 == 1 and len(tl3) == 3, 'đợt sau: câu trùng (sau chuẩn hoá) bỏ qua, câu mới thêm')
    ok('đợt trước' in dung_ra(cong_don, tl, [{'tin_nhan': 'em chiu', 'nhan': 'ngoai_mon'}], 'dot-3'),
       'cùng câu mà đợt sau gán khác nhãn → dừng, không tự chọn')

    cu = [{'tin_nhan': 'em chịu', 'nhan': 'ngoai_mon', 'nguon': 'ai-sinh'}, {'tin_nhan': 'chao thay', 'nhan': 'ngoai_mon', 'nguon': 'ai-sinh'}]
    hoc, bo = dung_tep_hoc(tl, cu, False)
    ok(len(hoc) == 3 and bo == 1, 'bộ học = câu thật + bộ cũ, bỏ câu cũ trùng câu thật')
    ok([d['nhan'] for d in hoc if chuan_hoa(d['tin_nhan']) == 'em chiu'] == ['be_tac'], 'trùng câu thì giữ nhãn câu THẬT')
    ok(dung_tep_hoc(tl, cu, True) == (tl, 0), '--chi-cau-that: chỉ câu thật')

    cau = lambda n, nhan: [{'tin_nhan': f'c{i}', 'nhan': nhan} for i in range(n)]  # noqa: E731
    ok(du_cau_chot_tap_kiem(cau(13, 'be_tac'))[0] is False, 'mới 13 câu thật (như đợt 03/10) → CHƯA chốt tập kiểm')
    # Ngưỡng mặc định lên 250 từ 04/10/2026 (quyết định Q3): phép kiểm bám theo hằng số, không ghi cứng số.
    N = NGUONG_TAP_KIEM
    ok(N == 250, 'ngưỡng chốt tập kiểm mặc định là 250 câu học sinh')
    ok(du_cau_chot_tap_kiem(cau(N - 1, 'be_tac')) == (False, f'mới {N - 1}/{N} câu học sinh'),
       'thiếu một câu so với ngưỡng → chưa chốt, lý do ghi số câu đang có / ngưỡng')
    ok(du_cau_chot_tap_kiem(cau(100, 'be_tac'))[0] is False, '100 câu (ngưỡng cũ) nay CHƯA đủ để chốt')
    ok(du_cau_chot_tap_kiem(cau(N - 1, 'be_tac') + cau(1, 'ngoai_mon')) == (False, 'nhãn chỉ có 1 câu: ngoai_mon'),
       'đủ ngưỡng mà có nhãn chỉ 1 câu → chưa chốt (không chia giữ tỉ lệ được)')
    ok(du_cau_chot_tap_kiem(cau(N - 2, 'be_tac') + cau(2, 'ngoai_mon')) == (True, ''),
       'đủ ngưỡng, mọi nhãn đã có đều ≥ 2 câu → chốt; nhãn chưa từng gặp không chặn')
    ok(du_cau_chot_tap_kiem(cau(20, 'be_tac'), nguong=20)[0], '--nguong-tap-kiem hạ ngưỡng được')

    hai = [{'tin_nhan': 'x', 'nhan': 'be_tac'}, {'tin_nhan': 'y', 'nhan': 'be_tac'}]
    ok(kappa(hai, hai) is None and 'không tính được' in chu_kappa(None),
       'cả hai người chỉ dùng một nhãn: kappa "không tính được", không in "nan"')
    ok(chu_kappa(kappa(hai, [hai[0], {'tin_nhan': 'y', 'nhan': 'ngoai_mon'}])) == '0.000', 'kappa thường vẫn in 3 chữ số')

    ls = tm / 'lich-su.csv'
    them_lich_su({'ngay': '2026-10-03', 'dot': 'dot-1', 'do_chinh_xac': 0.8}, ls)
    them_lich_su({'ngay': '2026-10-10', 'dot': 'dot-2', 'do_chinh_xac': 0.85}, ls)
    ok([d['dot'] for d in doc_lich_su(ls)] == ['dot-1', 'dot-2'], 'lịch sử ghi thêm từng đợt, không ghi đè')
    them_lich_su({'ngay': '2026-10-10', 'dot': 'dot-2', 'do_chinh_xac': 0.86}, ls)
    ok([(d['dot'], d['do_chinh_xac']) for d in doc_lich_su(ls)] == [('dot-1', '0.8'), ('dot-2', '0.86')],
       'chạy lại cùng đợt thì thay dòng của đợt đó, không thêm dòng trùng')
    ok(chenh(0.85, '0.8') == ' (+5,0 điểm %)', f'so với đợt trước ra điểm phần trăm ({chenh(0.85, "0.8")})')

print('\n== Bảng Excel một người gán (bang_xlsx.py) và nạp lại (nap_dot.chuyen_bang) ==')
with tempfile.TemporaryDirectory() as tmp:
    import zipfile
    tm = Path(tmp)
    cau_gia = ['em chịu bài này', 'cho em đáp án <b>&"x"</b>\nxuống dòng', 'x' * 8328, 'ký tự lạ \x01 ở đây']
    tep = tm / 'bang.xlsx'
    ghi_bang(tep, cau_gia, 'dot-2026-10-04', 3, 1)
    with zipfile.ZipFile(tep) as z:
        s1 = z.read('xl/worksheets/sheet1.xml').decode()
    ok('type="list"' in s1 and 'sqref="C2:C5"' in s1 and 'showErrorMessage="1"' in s1,
       'cột Nhãn có ô thả xuống (data validation dạng danh sách), gõ chữ khác thì báo lỗi')
    ok('Bế tắc' in s1 and '(Bỏ câu này)' in s1 and 'state="frozen"' in s1,
       'danh sách có tên nhãn tiếng Việt + "(Bỏ câu này)"; dòng tiêu đề đứng yên')
    b = doc_bang(tep)
    ok(b['dot'] == 'dot-2026-10-04' and [d['tin_nhan'] for d in b['dong']][:3] == cau_gia[:3],
       'đọc lại: đúng tên đợt, câu giữ nguyên (cả ký tự đặc biệt, xuống dòng, câu 8328 ký tự)')
    ok(b['dong'][3]['tin_nhan'] == 'ký tự lạ  ở đây', 'ký tự điều khiển (XML không chứa được) bị bỏ, không làm hỏng tệp')
    ok([ma_nhan(x) for x in ['Bế tắc', 'be_tac', ' xin đáp án ', '(Bỏ câu này)', '', 'linh tinh']]
       == ['be_tac', 'be_tac', 'xin_dap_an', 'bo', '', 'linh tinh'], 'tên nhãn trên bảng đổi về mã nhãn')

    def bang_gia(nhan, nguoi=('',) * 4, stt=('1', '2', '3', '4'), chung='Khải'):
        return {'dot': 'dot-2026-10-04', 'nguoi_gan': chung,
                'dong': [{'stt': s, 'tin_nhan': f'cau {s}', 'nhan': n, 'nguoi_gan': g, 'ghi_chu': ''}
                         for s, n, g in zip(stt, nhan, nguoi)]}
    cg = [{'tin_nhan': 'c', 'nguon': n} for n in ('that', 'that-gv', 'that', 'that')]
    ra, bo = chuyen_bang(bang_gia(['be_tac', 'ngoai_mon', 'bo', 'xin_dap_an'], ('', '', '', 'Binh')), cg)
    ok(bo == 1 and len(ra) == 3, '"(Bỏ câu này)" không đưa vào học')
    ok([d['nguon'] for d in ra] == ['that', 'that-gv', 'that'], 'nguồn lấy theo STT từ chua-gan.csv (học sinh / giáo viên)')
    ok([d['nguoi_gan'] for d in ra] == ['Khải', 'Khải', 'Binh'], 'ô Người gán trống thì lấy tên ở sheet Thông tin')
    ok('chưa chọn nhãn' in dung_ra(chuyen_bang, bang_gia(['be_tac', '', 'bo', '']), cg), 'còn câu chưa chọn nhãn → dừng, nói STT')
    ok('thiếu' in dung_ra(chuyen_bang, bang_gia(['be_tac'] * 3, stt=('1', '2', '3')), cg), 'xoá mất dòng → dừng')
    ok('lặp' in dung_ra(chuyen_bang, bang_gia(['be_tac'] * 4, stt=('1', '2', '2', '4')), cg), 'STT lặp (sắp xếp lại) → dừng')
    ok('không có trong danh sách' in dung_ra(chuyen_bang, bang_gia(['be_tac', 'abc', 'bo', 'bo']), cg), 'nhãn gõ tay sai → dừng')

    hs_gv = [{'tin_nhan': f'c{i}', 'nhan': 'be_tac', 'nguon': 'that-gv:d'} for i in range(NGUONG_TAP_KIEM)]
    ok(du_cau_chot_tap_kiem(hs_gv) == (False, f'mới 0/{NGUONG_TAP_KIEM} câu học sinh'),
       'câu giáo viên không tính vào ngưỡng chốt tập kiểm')
    ok(la_cau_hoc_sinh('that:dot-1') and la_cau_hoc_sinh('that') and not la_cau_hoc_sinh('that-gv:dot-1'),
       'tập kiểm chỉ lấy câu học sinh, không lấy câu giáo viên')
    ok(cong_don([], [{'tin_nhan': 'a', 'nhan': 'be_tac', 'nguon': 'that-gv'}], 'dot-9')[0][0]['nguon'] == 'that-gv:dot-9',
       'cộng dồn giữ nguồn giáo viên')

print('\n== Nhãn thứ 7 "xin_de" (04/10/2026) ==')
from chung import NHAN, loc_nhan_it_cau  # noqa: E402
ok(NHAN[-3:] == ['xin_de', 'tra_loi_gia_su', 'ngoai_mon'] and len(NHAN) == 8,
   'bộ nhãn có 8 nhãn, xin_de và tra_loi_gia_su đứng trước ngoai_mon')
ok(ma_nhan('Xin đề') == 'xin_de' and ma_nhan('xin_de') == 'xin_de', 'bảng Excel hiểu "Xin đề"')
Xg = [f'c{i}' for i in range(13)]
yg = ['be_tac'] * 10 + ['xin_de'] * 3
X2, y2, gac = loc_nhan_it_cau(Xg, yg)
ok(gac == {'xin_de': 3} and len(X2) == 10 and 'xin_de' not in y2,
   'xin_de mới 3 câu: tạm gác khi học (câu vẫn trong CSV), không làm dừng cả lần học')
ok(loc_nhan_it_cau(Xg, ['be_tac'] * 8 + ['xin_de'] * 5)[2] == {}, 'đủ 5 câu thì học bình thường')
with tempfile.TemporaryDirectory() as tmp:
    tep = Path(tmp) / 'b.xlsx'
    ghi_bang(tep, ['a', 'b', 'c'], 'dot-x', da_gan=[{'nhan': 'xin_de', 'ghi_chu': 'xin đề'}, {'nhan': 'bo'}, {}],
             nguoi_gan_chung='Khải')
    b = doc_bang(tep)
    ok([d['nhan'] for d in b['dong']] == ['xin_de', 'bo', ''] and b['dong'][0]['ghi_chu'] == 'xin đề' and b['nguoi_gan'] == 'Khải',
       'dựng lại bảng giữ nhãn, ghi chú, người gán đã có')

print('\n== Nhãn thứ 8 "tra_loi_gia_su" (05/10/2026) ==')
from chung import NHAN_BAT_BUOC  # noqa: E402
from bang_xlsx import GIAI_THICH, NHAN_HIEN  # noqa: E402
ok(ma_nhan('Trả lời ChemAI') == 'tra_loi_gia_su' and ma_nhan('tra_loi_gia_su') == 'tra_loi_gia_su',
   'bảng Excel hiểu "Trả lời ChemAI"')
ok(list(NHAN_HIEN) == NHAN, 'ô thả xuống của bảng Excel có đủ và đúng thứ tự mọi nhãn')
ok([g[0] for g in GIAI_THICH[:-1]] == list(NHAN_HIEN.values()), 'sheet "Giải thích nhãn" giải thích đủ mọi nhãn')
ok('tra_loi_gia_su' not in NHAN_BAT_BUOC and 'xin_de' not in NHAN_BAT_BUOC and len(NHAN_BAT_BUOC) == 6,
   'hai nhãn thêm sau không bắt buộc đủ câu: bộ cũ chưa có câu nào của chúng vẫn học được')
ok(loc_nhan_it_cau(Xg, ['be_tac'] * 10 + ['tra_loi_gia_su'] * 3)[2] == {'tra_loi_gia_su': 3},
   'tra_loi_gia_su mới 3 câu: tạm gác khi học')
with tempfile.TemporaryDirectory() as tmp:
    tep = Path(tmp) / 'b.xlsx'
    ghi_bang(tep, ['a', 'b'], 'dot-x', da_gan=[{'nhan': 'tra_loi_gia_su'}, {}], nguoi_gan_chung='Khải')
    ok([d['nhan'] for d in doc_bang(tep)['dong']] == ['tra_loi_gia_su', ''], 'ghi rồi đọc lại bảng giữ nhãn tra_loi_gia_su')

print('\n== Cột "ChemAI vừa nói" trên bảng Excel (05/10/2026). Dữ liệu GIẢ ==')
with tempfile.TemporaryDirectory() as tmp:
    import zipfile
    tm = Path(tmp)
    cau_nc = ['dạ tăng ạ', 'cho em đáp án', 'em chịu']
    nc = ['Thêm HCl thì nồng độ H+ thay đổi thế nào?\nEm thử đoán xem.', '', 'Bước đầu tiên em làm gì <b>&"x"</b>?']
    tep = tm / 'co-ngu-canh.xlsx'
    ghi_bang(tep, cau_nc, 'dot-x', 3, 0, da_gan=[{'nhan': 'tra_loi_gia_su', 'ghi_chu': 'gc'}, {'nhan': 'bo'}, {}],
             nguoi_gan_chung='Khải', ngu_canh=nc)
    with zipfile.ZipFile(tep) as z:
        s1 = z.read('xl/worksheets/sheet1.xml').decode()
        s3 = z.read('xl/worksheets/sheet3.xml').decode()
    ok('ChemAI vừa nói' in s1 and s1.index('ChemAI vừa nói') < s1.index('Câu hỏi'),
       'có ngữ cảnh: cột "ChemAI vừa nói" đứng trước cột Câu hỏi')
    ok('sqref="D2:D4"' in s1 and 'sqref="C2:C4"' not in s1 and 'activeCell="D2"' in s1,
       'có ngữ cảnh: ô thả xuống chọn nhãn lùi sang cột D')
    ok('ChemAI vừa nói' in s3 and '[tên]' in s3, 'sheet Thông tin dặn cột ngữ cảnh chỉ để đọc và phải che tên')
    b = doc_bang(tep)
    ok([d['tin_nhan'] for d in b['dong']] == cau_nc and [d['stt'] for d in b['dong']] == ['1', '2', '3'],
       'đọc lại bảng có ngữ cảnh: STT và câu hỏi đúng cột, không lẫn sang tin của ChemAI')
    ok([d['nhan'] for d in b['dong']] == ['tra_loi_gia_su', 'bo', ''] and b['dong'][0]['ghi_chu'] == 'gc'
       and b['nguoi_gan'] == 'Khải', 'đọc lại bảng có ngữ cảnh: nhãn, ghi chú, người gán đúng cột')
    ok([d['chemai_vua_noi'] for d in b['dong']] == nc, 'tin ChemAI giữ nguyên (xuống dòng, ký tự đặc biệt, ô trống)')
    cg3 = [{'tin_nhan': c, 'nguon': 'that'} for c in cau_nc]
    ra3, bo3 = chuyen_bang({**b, 'dong': [{**d, 'nhan': d['nhan'] or 'be_tac'} for d in b['dong']]}, cg3)
    ok([d['tin_nhan'] for d in ra3] == ['dạ tăng ạ', 'em chịu'] and bo3 == 1 and all('chemai_vua_noi' not in d for d in ra3),
       'nạp bảng có ngữ cảnh: chỉ câu hỏi và nhãn đi tiếp, tin ChemAI KHÔNG vào dữ liệu học')

    tep_cu = tm / 'khong-ngu-canh.xlsx'
    ghi_bang(tep_cu, cau_nc, 'dot-x')
    with zipfile.ZipFile(tep_cu) as z:
        s1 = z.read('xl/worksheets/sheet1.xml').decode()
    b = doc_bang(tep_cu)
    ok('ChemAI vừa nói' not in s1 and 'sqref="C2:C4"' in s1 and [d['tin_nhan'] for d in b['dong']] == cau_nc
       and all(d['chemai_vua_noi'] == '' for d in b['dong']), 'không có ngữ cảnh: bảng 5 cột như cũ, vẫn đọc được')
    try:
        ghi_bang(tm / 'lech.xlsx', cau_nc, 'dot-x', ngu_canh=nc[:2])
        ok(False, 'ngữ cảnh lệch số dòng → dừng')
    except ValueError:
        ok(True, 'ngữ cảnh lệch số dòng → dừng, không ghi bảng lệch câu')

    dot = tm / 'dot-2026-10-05'
    dot.mkdir()
    ghi_dong(dot / 'chua-gan.csv', [{'chemai_vua_noi': nc[i], 'tin_nhan': c, 'nhan': '', 'nguoi_gan': '', 'nguon': 'that'}
                                    for i, c in enumerate(cau_nc)], cot=['chemai_vua_noi', 'tin_nhan', 'nhan', 'nguoi_gan', 'nguon'])
    tep, n, hs, gv = lam_bang(dot, tm / 'ra')
    ok([d['chemai_vua_noi'] for d in doc_bang(tep)['dong']] == nc and (n, hs, gv) == (3, 3, 0),
       'bảng gửi hằng đêm lấy cột chemai_vua_noi từ chua-gan.csv')
    ok(doc_ngu_canh(dot) == nc, 'doc_ngu_canh đọc đúng thứ tự câu')
    dot_cu = tm / 'dot-2026-10-03'
    dot_cu.mkdir()
    ghi_dong(dot_cu / 'chua-gan.csv', [{'tin_nhan': 'em chịu', 'nhan': '', 'nguoi_gan': '', 'nguon': 'that'}])
    ok(doc_ngu_canh(dot_cu) is None, 'đợt xuất trước khi có cột chemai_vua_noi: không có ngữ cảnh, bảng giữ 5 cột')

print('\n== Tập kiểm chỉ chốt khi mọi câu học sinh đã qua hai người gán (cau_chua_hai_nguoi_gan) ==')
with tempfile.TemporaryDirectory() as tmp:
    tm = Path(tmp)
    (tm / 'dot-1').mkdir()
    ghi_dong(tm / 'dot-1' / 'nhan-dot.csv', [{'tin_nhan': 'Em chịu!', 'nhan': 'be_tac'}, {'tin_nhan': 'pH là gì', 'nhan': 'hoi_khai_niem'}])
    (tm / 'dot-2').mkdir()
    ghi_dong(tm / 'dot-2' / 'mot-nguoi.csv', [{'tin_nhan': 'cho em đáp án', 'nhan': 'xin_dap_an'}])
    tl = [{'tin_nhan': 'em chiu', 'nhan': 'be_tac', 'nguon': 'that:dot-1'},
          {'tin_nhan': 'pH là gì', 'nhan': 'hoi_khai_niem', 'nguon': 'that:dot-1'}]
    ok(cau_chua_hai_nguoi_gan(tl, tm) == {}, 'mọi câu nằm trong nhan-dot.csv của đợt nó (so sau chuẩn hoá) → không còn câu nào')
    ok(cau_chua_hai_nguoi_gan(tl + [{'tin_nhan': 'câu lạ', 'nhan': 'be_tac', 'nguon': 'that:dot-1'}], tm) == {'dot-1': 1},
       'câu không có trong nhan-dot.csv của đợt → tính là chưa qua hai người')
    mot = [{'tin_nhan': 'cho em đáp án', 'nhan': 'xin_dap_an', 'nguon': 'that:dot-2'},
           {'tin_nhan': 'chào thầy', 'nhan': 'ngoai_mon', 'nguon': 'that:dot-2'}]
    ok(cau_chua_hai_nguoi_gan(tl + mot, tm) == {'dot-2': 2}, 'đợt nạp bằng bảng Excel một người (chỉ có mot-nguoi.csv) → cả đợt chưa qua hai người')
    ok(cau_chua_hai_nguoi_gan([{'tin_nhan': 'x', 'nhan': 'be_tac', 'nguon': 'that'},
                               {'tin_nhan': 'y', 'nhan': 'be_tac'}], tm) == {'(không rõ đợt)': 2},
       'nguồn không ghi đợt (hoặc thiếu nguồn) → chưa kiểm chứng')
    ok(cau_chua_hai_nguoi_gan([{'tin_nhan': 'test', 'nhan': 'ngoai_mon', 'nguon': 'that-gv:dot-2'}], tm) == {},
       'câu giáo viên không vào tập kiểm nên không bị đếm')
    ok(cau_chua_hai_nguoi_gan([{'tin_nhan': 'x', 'nhan': 'be_tac', 'nguon': 'that:dot-9'}], tm) == {'dot-9': 1},
       'đợt không còn thư mục → chưa kiểm chứng, không văng lỗi')

print('\n== Kappa gộp mọi đợt hai người gán (kappa_gop) ==')
with tempfile.TemporaryDirectory() as tmp:
    from sklearn.metrics import cohen_kappa_score
    tm = Path(tmp)
    COT_GAN = ['tin_nhan', 'nhan', 'nguoi_gan']

    def dot_gia(ten, nhan_a, nhan_b, tep_b=True):
        d = tm / ten
        d.mkdir()
        ghi_dong(d / 'a.csv', [{'tin_nhan': f'{ten} c{i}', 'nhan': n, 'nguoi_gan': 'A'} for i, n in enumerate(nhan_a)], cot=COT_GAN)
        if tep_b:
            ghi_dong(d / 'b.csv', [{'tin_nhan': f'{ten} c{i}', 'nhan': n, 'nguoi_gan': 'B'} for i, n in enumerate(nhan_b)], cot=COT_GAN)

    ok(kappa_gop(tm) == (None, 0, 0, []) and 'chưa có đợt nào' in chu_kappa_gop(kappa_gop(tm)), 'chưa có đợt nào → không có kappa, không văng lỗi')
    a1, b1 = ['be_tac', 'be_tac', 'xin_dap_an', 'ngoai_mon'], ['be_tac', 'xin_dap_an', 'xin_dap_an', 'ngoai_mon']
    a2, b2 = ['hoi_khai_niem', 'be_tac', 'ngoai_mon'], ['hoi_khai_niem', 'be_tac', 'be_tac']
    dot_gia('dot-1', a1, b1)
    dot_gia('dot-2', a2, b2)
    dot_gia('dot-3', ['be_tac'], [], tep_b=False)            # một người gán: không tính, không coi là lỗi
    dot_gia('dot-4', ['be_tac', ''], ['be_tac', 'be_tac'])   # a.csv chưa gán đủ: bỏ qua, có ghi tên
    k, so_cau, so_dot, bo = kappa_gop(tm)
    ok((so_cau, so_dot, bo) == (7, 2, ['dot-4']), 'dồn câu của các đợt hai người gán đủ; đợt chưa gán đủ bị bỏ qua và nêu tên')
    mong = cohen_kappa_score(a1 + a2, b1 + b2)
    ok(k is not None and abs(k - mong) < 1e-9, 'kappa gộp = kappa của MỘT dãy dồn mọi đợt (không phải trung bình từng đợt)')
    tb = (cohen_kappa_score(a1, b1) + cohen_kappa_score(a2, b2)) / 2
    ok(abs(mong - tb) > 1e-6, 'bộ thử phân biệt được kappa gộp với trung bình kappa từng đợt')
    chu = chu_kappa_gop((k, so_cau, so_dot, bo))
    ok('7 câu' in chu and '2 đợt' in chu and 'bỏ qua 1 đợt' in chu, 'dòng in ra có số câu, số đợt và số đợt bỏ qua')

print('\n== Khoảng tin cậy 95 % bằng bootstrap (huan-luyen.py: khoang_tin_cay) ==')
import importlib.util  # noqa: E402
_spec = importlib.util.spec_from_file_location('huan_luyen', Path(__file__).parent / 'huan-luyen.py')
_hl = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_hl)
yt = ['be_tac'] * 20 + ['xin_dap_an'] * 20
(a_lo, a_hi), (f_lo, f_hi) = _hl.khoang_tin_cay(yt, yt)
ok((a_lo, a_hi, f_lo, f_hi) == (1.0, 1.0, 1.0, 1.0), 'đoán đúng hết → khoảng là [1; 1]')
yd = ['be_tac'] * 15 + ['xin_dap_an'] * 5 + ['xin_dap_an'] * 16 + ['be_tac'] * 4   # đúng 31/40 = 0,775
(a_lo, a_hi), (f_lo, f_hi) = _hl.khoang_tin_cay(yt, yd)
ok(0 <= a_lo < 0.775 < a_hi <= 1 and 0 <= f_lo < f_hi <= 1, 'khoảng nằm trong [0; 1] và chứa độ chính xác của chính tập kiểm')
ok(_hl.khoang_tin_cay(yt, yd) == ((a_lo, a_hi), (f_lo, f_hi)), 'cùng hạt giống → cùng khoảng (báo cáo chạy lại ra đúng số cũ)')
rong_40 = a_hi - a_lo
(b_lo, b_hi), _ = _hl.khoang_tin_cay(yt * 10, yd * 10)
ok(b_hi - b_lo < rong_40 / 2, 'tập kiểm lớn gấp 10 → khoảng hẹp đi rõ')
(c_lo, c_hi), _ = _hl.khoang_tin_cay(yt, yd, so_lan=200, hat=7)
ok(c_lo < 0.775 < c_hi, 'đổi số lần lấy mẫu và hạt giống vẫn chạy')

print('\n== Chạy hằng đêm (hang_ngay.py): biến Gmail, soạn thư, gửi (máy gửi GIẢ) ==')
with tempfile.TemporaryDirectory() as tmp:
    tm = Path(tmp)
    env = tm / '.env.local'
    env.write_text('KHAC=1\nGMAIL_GUI=gui@gmail.com\nGMAIL_MAT_KHAU_UNG_DUNG="abcd efgh ijkl mnop"\n', encoding='utf-8')
    for k in ('GMAIL_GUI', 'GMAIL_MAT_KHAU_UNG_DUNG', 'GMAIL_NHAN'):
        os.environ.pop(k, None)
    bien = doc_bien_gmail(env)
    ok(bien == {'GMAIL_GUI': 'gui@gmail.com', 'GMAIL_MAT_KHAU_UNG_DUNG': 'abcdefghijklmnop', 'GMAIL_NHAN': 'gui@gmail.com'},
       'đọc đúng ba biến GMAIL_*, bỏ dấu cách trong mật khẩu ứng dụng, thiếu GMAIL_NHAN thì gửi cho chính mình')
    dot = tm / 'dot-2026-10-04'
    dot.mkdir()
    ghi_dong(dot / 'chua-gan.csv', [{'tin_nhan': 'em chịu', 'nhan': '', 'nguoi_gan': '', 'nguon': 'that'},
                                    {'tin_nhan': 'test gia su', 'nhan': '', 'nguoi_gan': '', 'nguon': 'that-gv'}])
    tep, n, hs, gv = lam_bang(dot, tm / 'ra')
    ok(tep.exists() and (dot / 'bang-gan-nhan.xlsx').exists() and (n, hs, gv) == (2, 1, 1),
       'làm bảng ở thư mục ra và trong thư mục đợt, đếm đúng học sinh / giáo viên')
    thu = soan_thu(tep, dot, n, hs, gv, 'gui@gmail.com', 'nguoi-nhan@gmail.com')
    dinh_kem = [p for p in thu.iter_attachments()]
    ok(thu['To'] == 'nguoi-nhan@gmail.com' and '2 câu' in thu['Subject'] and len(dinh_kem) == 1
       and dinh_kem[0].get_filename() == tep.name, 'thư có tiêu đề kèm số câu, đúng người nhận, đính kèm bảng')

    class SmtpGia:
        gui = []

        def __init__(self, may, cong, **_):
            self.may, self.cong = may, cong

        def __enter__(self):
            return self

        def __exit__(self, *_):
            return False

        def login(self, u, p):
            self.u = u

        def send_message(self, m):
            SmtpGia.gui.append((self.may, self.cong, self.u, m['To']))
    kiem_dang_nhap('gui@gmail.com', 'x', smtp=SmtpGia)
    ok(SmtpGia.gui == [], '--kiem-mail chỉ đăng nhập, không gửi thư nào')
    gui_thu(thu, 'gui@gmail.com', 'x', smtp=SmtpGia)
    ok(SmtpGia.gui == [('smtp.gmail.com', 465, 'gui@gmail.com', 'nguoi-nhan@gmail.com')],
       'gửi qua smtp.gmail.com cổng 465 bằng tài khoản GMAIL_GUI (máy gửi giả, không gửi thật)')

print('>>> TẤT CẢ ĐẠT' if hong == 0 else f'>>> CÓ {hong} MỤC KHÔNG ĐẠT')
sys.exit(0 if hong == 0 else 1)
