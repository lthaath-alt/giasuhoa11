"""Nạp một đợt câu thật đã gán nhãn rồi huấn luyện lại, chạy nối tiếp (03/10/2026).

Chạy (từ gốc repo):  npm run phan-loai:huan-luyen -- scripts/phan-loai/du-lieu/that/dot-2026-10-03
     hoặc            python scripts/phan-loai/nap_dot.py scripts/phan-loai/du-lieu/that/dot-2026-10-03
Thêm --chi-cau-that để học CHỈ trên câu thật (mặc định học cả bộ cũ du-lieu/nhan.csv cho đủ
câu; số đo vẫn chấm trên tập kiểm toàn câu thật). Thêm --bo-bieu-do để bỏ bước vẽ (~30 giây).

Đợt do `npm run phan-loai:xuat` tạo: a.csv, b.csv (hai người gán độc lập), chua-gan.csv.
Các bước, dừng ngay ở bước nào hỏng và nói cách sửa:
  1. a.csv, b.csv gán đủ, đúng nhãn, cùng danh sách câu.
  2. Đo đồng thuận (lần đầu ghi bat-dong.csv). Còn câu bất đồng chưa có nhan_chot thì dừng.
  3. gop-nhan.py → nhan-dot.csv, rồi cộng dồn vào that/nhan-that.csv (bỏ trùng; cùng câu mà
     khác nhãn với đợt trước thì dừng). Chạy lại cùng một đợt không cộng hai lần.
  4. Dựng that/hoc.csv (câu thật + bộ cũ, câu thật thắng khi trùng), huan-luyen.py với tập
     kiểm cố định that/tap-kiem-co-dinh.csv (lần đầu tự tạo) và phép dò tên.
  5. npm run kiem-tra:phan-loai, npm run danh-gia:phan-loai --tap-kiem, ve-bieu-do.py.
  6. In bảng tóm tắt, ghi một dòng vào that/lich-su.csv.
KHÔNG gán nhãn bằng máy, KHÔNG dùng y_dinh làm nhãn. Không build, không deploy.
"""
import argparse
import csv
import datetime
import json
import subprocess
import sys
from pathlib import Path

THU_MUC = Path(__file__).resolve().parent
GOC = THU_MUC.parents[1]
sys.path.insert(0, str(THU_MUC))
from chung import NHAN, THU_MUC_THAT, chuan_hoa  # noqa: E402

TEP_TICH_LUY = THU_MUC_THAT / 'nhan-that.csv'
TEP_HOC = THU_MUC_THAT / 'hoc.csv'
TEP_TAP_KIEM = THU_MUC_THAT / 'tap-kiem-co-dinh.csv'
TEP_LICH_SU = THU_MUC_THAT / 'lich-su.csv'
TEP_MO_HINH = GOC / 'public' / 'mo-hinh' / 'phan-loai-y-dinh.json'
COT = ['tin_nhan', 'nhan', 'nguoi_gan', 'nguon']
COT_LICH_SU = ['ngay', 'dot', 'so_cau_moi', 'kappa', 'so_cau_that', 'so_cau_hoc', 'so_cau_kiem',
               'do_chinh_xac', 'f1_trung_binh', 'phien_ban_mo_hinh']


class Dung(Exception):
    """Dừng quy trình, kèm lời dặn cách sửa."""


def doc_dong(tep):
    with open(tep, encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))


def ghi_dong(tep, dong, cot=COT):
    tep.parent.mkdir(parents=True, exist_ok=True)
    with open(tep, 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.DictWriter(f, fieldnames=cot, extrasaction='ignore')
        w.writeheader()
        w.writerows(dong)


# ── Bước 1 ──────────────────────────────────────────────────────────────────

def kiem_tep_gan(tep):
    """Danh sách câu đã gán của một người. Dừng nếu còn ô nhãn trống hay nhãn lạ."""
    if not tep.exists():
        raise Dung(f'Không thấy {tep.name} trong đợt.')
    dong = [d for d in doc_dong(tep) if (d.get('tin_nhan') or '').strip()]
    if not dong:
        raise Dung(f'{tep.name} không có câu nào.')
    trong = [i + 2 for i, d in enumerate(dong) if not (d.get('nhan') or '').strip()]
    if trong:
        raise Dung(f'{tep.name}: còn {len(trong)} câu chưa gán nhãn (dòng {", ".join(map(str, trong[:8]))}'
                   f'{"…" if len(trong) > 8 else ""}). Gán đủ rồi chạy lại.')
    la = [(i + 2, d['nhan'].strip()) for i, d in enumerate(dong) if d['nhan'].strip() not in NHAN]
    if la:
        raise Dung(f'{tep.name}: nhãn lạ ở dòng {la[0][0]} ("{la[0][1]}"). Nhãn hợp lệ: {", ".join(NHAN)}.')
    if not all((d.get('nguoi_gan') or '').strip() for d in dong):
        raise Dung(f'{tep.name}: điền tên mình vào cột nguoi_gan ở mọi dòng (để biết ai gán).')
    return dong


def kiem_cung_danh_sach(a, b):
    ka = {d['tin_nhan'].strip() for d in a}
    kb = {d['tin_nhan'].strip() for d in b}
    if ka != kb:
        raise Dung(f'a.csv và b.csv lệch nhau ({len(ka - kb)} câu chỉ a có, {len(kb - ka)} câu chỉ b có). '
                   'Che tay tên thì phải sửa y hệt ở cả hai tệp.')


def kappa(a, b):
    from sklearn.metrics import cohen_kappa_score
    na = {d['tin_nhan'].strip(): d['nhan'].strip() for d in a}
    nb = {d['tin_nhan'].strip(): d['nhan'].strip() for d in b}
    chung = sorted(na)
    return cohen_kappa_score([na[t] for t in chung], [nb[t] for t in chung], labels=NHAN)


# ── Bước 3: cộng dồn ────────────────────────────────────────────────────────

def cong_don(tich_luy, dot_moi, ten_dot):
    """Thêm câu của đợt vào bộ tích luỹ. Trả (bộ mới, số câu thêm). Câu đã có cùng nhãn thì bỏ
    qua (chạy lại một đợt không cộng hai lần); khác nhãn thì dừng — hai đợt gán mâu thuẫn."""
    theo_khoa = {chuan_hoa(d['tin_nhan']): d for d in tich_luy}
    ra, them = list(tich_luy), 0
    for d in dot_moi:
        k = chuan_hoa(d['tin_nhan'])
        if not k:
            continue
        cu = theo_khoa.get(k)
        if cu:
            if cu['nhan'] != d['nhan']:
                raise Dung(f'Câu "{d["tin_nhan"]}" đã gán {cu["nhan"]} ở đợt trước ({cu.get("nguon")}) mà đợt này '
                           f'gán {d["nhan"]}. Thống nhất lại rồi sửa một trong hai trong that/nhan-that.csv.')
            continue
        moi = {'tin_nhan': d['tin_nhan'], 'nhan': d['nhan'], 'nguoi_gan': d.get('nguoi_gan', ''),
               'nguon': f'that:{ten_dot}'}
        ra.append(moi)
        theo_khoa[k] = moi
        them += 1
    return ra, them


def dung_tep_hoc(that, cu, chi_that):
    """Câu thật + bộ cũ. Trùng câu (sau chuẩn hoá) thì giữ nhãn câu thật. Trả (dòng, số câu cũ bị bỏ)."""
    if chi_that:
        return list(that), 0
    khoa_that = {chuan_hoa(d['tin_nhan']) for d in that}
    giu = [d for d in cu if chuan_hoa(d['tin_nhan']) not in khoa_that]
    return list(that) + giu, len(cu) - len(giu)


# ── Lịch sử ─────────────────────────────────────────────────────────────────

def doc_lich_su(tep=TEP_LICH_SU):
    return doc_dong(tep) if Path(tep).exists() else []


def them_lich_su(dong, tep=TEP_LICH_SU):
    """Thêm một dòng. Chạy lại CÙNG đợt (vd. sau khi sửa lỗi giữa chừng) thì thay dòng cuối của
    đợt đó, không thêm dòng trùng."""
    ls = doc_lich_su(tep)
    if ls and ls[-1].get('dot') == dong.get('dot'):
        ls = ls[:-1]
    ls.append(dong)
    ghi_dong(Path(tep), ls, COT_LICH_SU)
    return ls


def chenh(moi, cu):
    try:
        d = float(moi) - float(cu)
    except (TypeError, ValueError):
        return ''
    return f' ({"+" if d >= 0 else ""}{d * 100:.1f} điểm %)'.replace('.', ',')


# ── Chạy ────────────────────────────────────────────────────────────────────

def chay(lenh, ten):
    print(f'\n── {ten} ──', flush=True)
    kq = subprocess.run(lenh, cwd=GOC, shell=isinstance(lenh, str))
    if kq.returncode != 0:
        raise Dung(f'Bước "{ten}" hỏng (mã {kq.returncode}). Đọc thông báo ngay phía trên, sửa rồi chạy lại '
                   f'cùng lệnh — các bước trước đã xong sẽ không làm hỏng gì khi chạy lại.')


def main():
    ap = argparse.ArgumentParser(description='Nạp một đợt câu thật đã gán nhãn và huấn luyện lại.')
    ap.add_argument('dot', help='thư mục đợt, vd. scripts/phan-loai/du-lieu/that/dot-2026-10-03')
    ap.add_argument('--chi-cau-that', action='store_true', help='học CHỈ trên câu thật, bỏ du-lieu/nhan.csv')
    ap.add_argument('--bo-bieu-do', action='store_true', help='bỏ bước vẽ biểu đồ')
    a = ap.parse_args()
    py = sys.executable

    dot = Path(a.dot).resolve()
    if THU_MUC_THAT.resolve() not in dot.parents:
        raise Dung(f'Thư mục đợt phải là một thư mục dot-<ngày> trong {THU_MUC_THAT}, đang là {dot}. '
                   f'Dán đúng đường dẫn mà npm run phan-loai:xuat in ra.')
    if not dot.is_dir():
        raise Dung(f'Không có thư mục đợt {dot}. Tạo bằng npm run phan-loai:xuat.')

    print(f'== Đợt {dot.name} ==')
    da, db = kiem_tep_gan(dot / 'a.csv'), kiem_tep_gan(dot / 'b.csv')
    kiem_cung_danh_sach(da, db)
    k = kappa(da, db)
    print(f'Hai tệp gán đủ: {len(da)} câu. Cohen\'s kappa (TRƯỚC khi thống nhất, ghi vào báo cáo): {k:.3f}')

    bat_dong = dot / 'bat-dong.csv'
    if not bat_dong.exists():
        chay([py, str(THU_MUC / 'do-dong-thuan.py'), str(dot / 'a.csv'), str(dot / 'b.csv'), '--ra', str(bat_dong)],
             'Đo đồng thuận')
    con = [d for d in doc_dong(bat_dong) if not (d.get('nhan_chot') or '').strip()]
    if con:
        raise Dung(f'{len(con)} câu bất đồng chưa có nhan_chot trong {bat_dong}. Ngồi lại bàn, điền cột '
                   f'nhan_chot (và ly_do), rồi chạy lại đúng lệnh này.')

    nhan_dot = dot / 'nhan-dot.csv'
    chay([py, str(THU_MUC / 'gop-nhan.py'), str(dot / 'a.csv'), str(dot / 'b.csv'), str(bat_dong),
          '--ra', str(nhan_dot), '--ghi-de'], 'Gộp nhãn hai người')
    tich_luy, them = cong_don(doc_dong(TEP_TICH_LUY) if TEP_TICH_LUY.exists() else [], doc_dong(nhan_dot), dot.name)
    ghi_dong(TEP_TICH_LUY, tich_luy)
    print(f'Cộng dồn: thêm {them} câu mới vào that/nhan-that.csv, tổng {len(tich_luy)} câu thật.')

    hoc, bo = dung_tep_hoc(tich_luy, [] if a.chi_cau_that else doc_dong(THU_MUC / 'du-lieu' / 'nhan.csv'),
                           a.chi_cau_that)
    ghi_dong(TEP_HOC, hoc)
    print(f'Dữ liệu học: {len(tich_luy)} câu thật + {len(hoc) - len(tich_luy)} câu bộ cũ'
          f'{f" (bỏ {bo} câu cũ trùng câu thật)" if bo else ""} → that/hoc.csv')

    lenh_hoc = [py, str(THU_MUC / 'huan-luyen.py'), '--vao', str(TEP_HOC), '--tap-kiem', str(TEP_TAP_KIEM)]
    if not TEP_TAP_KIEM.exists():
        lenh_hoc.append('--tao-tap-kiem')
    chay(lenh_hoc, 'Huấn luyện (tập kiểm cố định, dò tên trong từ vựng)')
    chay('npm run kiem-tra:phan-loai', 'Kiểm TypeScript tính đúng như Python')
    chay(f'npm run danh-gia:phan-loai -- --tap-kiem "{THU_MUC_THAT / "ket-qua" / "tap-kiem.json"}"', 'So với regex')
    if not a.bo_bieu_do:
        chay([py, str(THU_MUC / 've-bieu-do.py'), '--vao', str(TEP_HOC), '--tap-kiem', str(TEP_TAP_KIEM)], 'Vẽ biểu đồ')

    so_do = json.loads(TEP_MO_HINH.read_text(encoding='utf-8'))
    sd = so_do.get('so_do', {})
    # Chạy lại cùng đợt thì câu đã cộng ở lần trước: giữ số câu mới của đợt, đừng ghi 0.
    lan_truoc = [d for d in doc_lich_su() if d.get('dot') == dot.name]
    them += int(lan_truoc[-1].get('so_cau_moi') or 0) if lan_truoc else 0
    dong = {'ngay': datetime.date.today().isoformat(), 'dot': dot.name, 'so_cau_moi': them, 'kappa': f'{k:.3f}',
            'so_cau_that': len(tich_luy), 'so_cau_hoc': sd.get('so_cau_hoc'), 'so_cau_kiem': sd.get('so_cau_kiem'),
            'do_chinh_xac': sd.get('do_chinh_xac'), 'f1_trung_binh': sd.get('f1_trung_binh'),
            'phien_ban_mo_hinh': so_do.get('phien_ban')}
    truoc = [d for d in doc_lich_su() if d.get('dot') != dot.name]
    cu = truoc[-1] if truoc else {}
    them_lich_su(dong)

    print('\n================ TÓM TẮT ================')
    print(f'Đợt              : {dot.name} ({them} câu mới, kappa {k:.3f})')
    print(f'Câu thật tích luỹ: {len(tich_luy)}')
    print(f'Học / kiểm       : {sd.get("so_cau_hoc")} / {sd.get("so_cau_kiem")} câu (tập kiểm cố định, toàn câu thật)')
    print(f'Độ chính xác     : {sd.get("do_chinh_xac")}{chenh(sd.get("do_chinh_xac"), cu.get("do_chinh_xac"))}')
    print(f'Macro-F1         : {sd.get("f1_trung_binh")}{chenh(sd.get("f1_trung_binh"), cu.get("f1_trung_binh"))}')
    if cu:
        print(f'(so với đợt {cu.get("dot")} ngày {cu.get("ngay")})')
    print(f'Lịch sử          : scripts/phan-loai/du-lieu/that/lich-su.csv ({len(truoc) + 1} đợt)')
    print('\nMô hình mới đã ghi vào public/mo-hinh/ nhưng web CHỈ dùng nó sau khi chủ dự án build và deploy.')
    print('Trước khi commit: git status không được có tệp nào trong du-lieu/that/ (đã bị .gitignore chặn).')


if __name__ == '__main__':
    for _luong in (sys.stdout, sys.stderr):
        if hasattr(_luong, 'reconfigure'):
            _luong.reconfigure(encoding='utf-8', errors='replace')
    try:
        main()
    except Dung as e:
        sys.stdout.flush()
        print(f'\nDỪNG: {e}', file=sys.stderr)
        sys.exit(1)
