"""Phần dùng chung của bộ phân loại ý định (02/10/2026).

`chuan_hoa` PHẢI cho ra đúng như `chuanHoaYDinh()` bên TypeScript
(src/features/tutor/services/phanLoaiYDinh.ts). Lệch một ký tự thì mô hình học
một đằng, trình duyệt đoán một nẻo. Hai bên cùng chạy du-lieu/vecto-chuan-hoa.json.
"""
import csv
import os
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split
from sklearn.pipeline import Pipeline

# Windows: Python không tự dùng UTF-8 cho console (kể cả khi chcp 65001), in chữ
# Việt là văng UnicodeEncodeError trước khi kịp báo kết quả. Ép UTF-8 ngay khi nạp.
for _luong in (sys.stdout, sys.stderr):
    if hasattr(_luong, 'reconfigure'):
        _luong.reconfigure(encoding='utf-8', errors='replace')

PHIEN_BAN_CHUAN_HOA = 1

# Sáu nhãn — thứ tự cố định, dùng cho báo cáo và ma trận nhầm lẫn.
# "xin_de" (xin bài tập / đề để tự luyện) thêm 04/10/2026 theo quyết định của chủ dự án: bộ nhãn
# của đề tài từ 6 thành 7 kể từ ngày đó. Mô hình chỉ học một nhãn khi nó có ≥ SO_CAU_TOI_THIEU câu.
# "tra_loi_gia_su" (em trả lời câu ChemAI vừa hỏi) thêm 05/10/2026, cũng theo quyết định của chủ dự
# án: bộ nhãn từ 7 thành 8 kể từ ngày đó.
NHAN = ['hoi_khai_niem', 'be_tac', 'xin_dap_an', 'nop_bai_lam', 'gian_lan_phong_thi', 'xin_de', 'tra_loi_gia_su',
        'ngoai_mon']
# Sáu nhãn gốc BẮT BUỘC đủ câu (thiếu là dữ liệu hỏng, dừng). Nhãn thêm sau chưa đủ thì tạm gác,
# mô hình học các nhãn còn lại như cũ cho tới khi đủ.
NHAN_THEM_SAU = ['xin_de', 'tra_loi_gia_su']
NHAN_BAT_BUOC = [n for n in NHAN if n not in NHAN_THEM_SAU]
SO_CAU_TOI_THIEU = 5


def kiem_so_cau(X, y):
    """Dừng nếu một nhãn bắt buộc thiếu câu; gác nhãn thêm sau còn ít câu. Trả (X, y, {nhãn gác: số câu})."""
    dem = Counter(y)
    thieu = [n for n in NHAN_BAT_BUOC if dem[n] < SO_CAU_TOI_THIEU]
    if thieu:
        sys.exit(f'Mỗi nhãn cần ít nhất {SO_CAU_TOI_THIEU} câu. Đang thiếu: '
                 + ', '.join(f'{n} ({dem[n]})' for n in thieu))
    X, y, gac = loc_nhan_it_cau(X, y)
    for n, s in gac.items():
        print(f'Nhãn {n} mới có {s}/{SO_CAU_TOI_THIEU} câu: TẠM CHƯA HỌC nhãn này (câu vẫn giữ trong dữ liệu, '
              f'đủ {SO_CAU_TOI_THIEU} câu thì tự được học).')
    return X, y, gac

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


def loc_nhan_it_cau(X, y, toi_thieu=SO_CAU_TOI_THIEU):
    """Tạm gác các câu của nhãn có 1..toi_thieu-1 câu (vd. nhãn mới thêm, mới gặp vài câu): quá ít
    để chia học/kiểm và kiểm chéo. Câu vẫn nằm nguyên trong CSV; đủ câu thì tự được học.
    Nhãn 0 câu thì thôi. Trả (X, y, {nhãn: số câu bị gác})."""
    dem = Counter(y)
    gac = {n: s for n, s in dem.items() if 0 < s < toi_thieu}
    if not gac:
        return X, y, {}
    giu = [(t, n) for t, n in zip(X, y) if n not in gac]
    return [t for t, _ in giu], [n for _, n in giu], gac


# ─── Ống học: TF-IDF + hồi quy logistic ──────────────────────────────────────
# huan-luyen.py và ve-bieu-do.py cùng gọi ba hàm dưới đây, để biểu đồ vẽ đúng mô
# hình đang chạy trên web. Đổi tham số ở đây là đổi cả hai.

CAC_C = [0.25, 1.0, 4.0, 16.0]  # các mức C thử khi kiểm chéo; C nhỏ = phạt trọng số lớn mạnh hơn


def chia_tap(X, y):
    """80 % để học, 20 % để kiểm, giữ tỉ lệ nhãn, hạt giống 42. Trả X_hoc, X_kiem, y_hoc, y_kiem."""
    return train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)


# ─── Câu THẬT của học sinh không được rời thư mục du-lieu/that/ (03/10/2026) ──
# Thư mục đó bị .gitignore chặn. Mọi tệp ra CÓ CHỨA CÂU (bất đồng, nhãn gộp, tập
# kiểm, dự đoán, biểu đồ cụm từ) khi dữ liệu vào có câu nguồn "that" phải nằm ở
# đó; trỏ ra ngoài thì dừng. Mô hình web chỉ mang từ vựng, nhưng từ vựng vẫn có
# thể chứa tên chưa che, nên phải qua do_ten_trong_tu_vung trước khi ghi.

# Biến môi trường CHỈ để chạy thử đầu-cuối trên dữ liệu giả mà không đụng đợt thật đang gán dở.
THU_MUC_THAT = Path(os.environ.get('PHAN_LOAI_THU_MUC_THAT') or Path(__file__).resolve().parent / 'du-lieu' / 'that')
TEP_TEN_HOC_SINH = THU_MUC_THAT / 'ten-hoc-sinh.txt'   # do `npm run xuat:cau-hoi -- --that` ghi


def co_cau_that(*cac_tep, goc_that=THU_MUC_THAT):
    """Có tệp nào mang câu thật không: nằm trong du-lieu/that/, HOẶC có dòng nguồn bắt đầu
    bằng "that". Xét cả vị trí tệp vì người gán có thể xoá cột nguon khi làm trên Sheets."""
    g = Path(goc_that).resolve()
    for tep in cac_tep:
        p = Path(tep).resolve()
        if g in p.parents or any(v.startswith('that') for v in nguon_theo_khoa(p).values()):
            return True
    return False


def bat_buoc_trong(duong, goc, ten_tham_so):
    """Dừng nếu `duong` không nằm trong thư mục `goc`. Trả Path đã chuẩn hoá."""
    p, g = Path(duong).resolve(), Path(goc).resolve()
    if p != g and g not in p.parents:
        sys.exit(f'Dữ liệu có câu THẬT (nguồn "that") nên {ten_tham_so} phải nằm trong {g} '
                 f'(thư mục bị .gitignore chặn), đang là {p}.')
    return p


def doc_ten_hoc_sinh(tep=TEP_TEN_HOC_SINH):
    tep = Path(tep)
    if not tep.exists():
        sys.exit(f'Chưa có {tep}. Chạy `npm run xuat:cau-hoi -- --lop 11A3 --that` (nó ghi danh sách tên '
                 f'học sinh, chỉ tên) trước khi huấn luyện trên câu thật.')
    return [d.strip() for d in tep.read_text(encoding='utf-8-sig').splitlines() if d.strip()]


def do_ten_trong_tu_vung(tu_vung, ds_ten, cho_phep=()):
    """Các mục từ vựng trùng một cặp chữ liền nhau trong họ tên học sinh.

    Từ vựng mô hình là chữ đã chuan_hoa (không dấu), nên chuẩn hoá tên y như vậy: tên
    gõ có dấu hay không dấu đều khớp. Chỉ dò CỤM HAI CHỮ ("thanh an", "nguyen hoang"),
    không dò chữ đơn: "an", "anh", "minh" là chữ thường gặp, dò chữ đơn thì mô hình
    nào cũng bị chặn. Cụm đã xem tay là lời thường thì đưa vào cho_phep."""
    cum = set()
    for ten in ds_ten:
        chu = chuan_hoa(ten).split()
        cum.update(f'{chu[i]} {chu[i + 1]}' for i in range(len(chu) - 1))
    cum -= {chuan_hoa(c) for c in cho_phep}
    return sorted(t for t in tu_vung if t in cum)


# ─── Tập kiểm CỐ ĐỊNH cho dữ liệu thật (03/10/2026) ──────────────────────────
# chia_tap chia lại theo toàn bộ nhan.csv, nên mỗi đợt thêm câu thật là tập kiểm
# đổi và số đo các đợt không so được với nhau. Với câu thật, tập kiểm được chọn
# MỘT lần (20 % câu nguồn "that"), ghi ra tệp, các đợt sau chỉ thêm vào phần học.

def nguon_theo_khoa(tep):
    """{khoá chuẩn hoá: cột nguon} của lần xuất hiện đầu tiên, để biết câu nào là câu thật."""
    ket = {}
    with open(tep, encoding='utf-8-sig', newline='') as f:
        for r in csv.DictReader(f):
            tin = (r.get('tin_nhan') or '').strip()
            if tin:
                ket.setdefault(chuan_hoa(tin), (r.get('nguon') or '').strip())
    return ket


def la_cau_hoc_sinh(nguon):
    """Câu THẬT của học sinh: "that" hoặc "that:<đợt>". Câu giáo viên/quản trị ("that-gv...")
    vẫn là dữ liệu riêng tư nhưng KHÔNG vào tập kiểm: số đo báo cáo là trên câu học sinh."""
    return nguon == 'that' or nguon.startswith('that:')


def tao_tap_kiem(y, nguon, ti_le=0.2, hat=42):
    """Chỉ số các câu học sinh thật được chọn làm tập kiểm cố định (giữ tỉ lệ nhãn khi được)."""
    idx = [i for i, n in enumerate(nguon) if la_cau_hoc_sinh(n)]
    if len(idx) < 10:
        sys.exit(f'Mới có {len(idx)} câu nguồn "that" — cần ít nhất 10 câu thật đã gán nhãn mới tạo tập kiểm cố định.')
    yy = [y[i] for i in idx]
    dem = Counter(yy)
    tang = yy if len(dem) > 1 and min(dem.values()) >= 2 else None
    _, kiem = train_test_split(idx, test_size=ti_le, stratify=tang, random_state=hat)
    return sorted(kiem)


def ghi_tap_kiem(tep, X, y):
    tep.parent.mkdir(parents=True, exist_ok=True)
    with open(tep, 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f)
        w.writerow(['tin_nhan', 'nhan'])
        w.writerows(zip(X, y))


def doc_tap_kiem(tep):
    """Khoá chuẩn hoá của các câu trong tệp tập kiểm cố định."""
    X, _ = doc_csv_nhan(tep)
    return [chuan_hoa(t) for t in X]


def chia_theo_tap_kiem(X, y, khoa_kiem):
    """Câu có khoá trong khoa_kiem vào tập kiểm, còn lại vào phần học. Câu nào của tập
    kiểm đã biến khỏi dữ liệu thì DỪNG: tập kiểm đã đổi, số đo không còn so được."""
    co = {chuan_hoa(t) for t in X}
    thieu = [k for k in khoa_kiem if k not in co]
    if thieu:
        sys.exit(f'{len(thieu)} câu của tập kiểm cố định không còn trong dữ liệu học (vd. "{thieu[0]}"). '
                 f'Không được bỏ câu khỏi tập kiểm; khôi phục câu đó trong nhan.csv.')
    kk = set(khoa_kiem)
    X_tr, X_te, y_tr, y_te = [], [], [], []
    for t, n in zip(X, y):
        if chuan_hoa(t) in kk:
            X_te.append(t)
            y_te.append(n)
        else:
            X_tr.append(t)
            y_tr.append(n)
    return X_tr, X_te, y_tr, y_te


def chia_theo_tuy_chon(X, y, vao, tap_kiem=None, tao=False):
    """Không có tap_kiem: chia 80/20 như cũ. Có: dùng tệp đó; chưa có tệp mà tao=True thì
    tạo từ 20 % câu nguồn "that" của `vao` rồi dùng. Trả X_hoc, X_kiem, y_hoc, y_kiem."""
    if not tap_kiem:
        return chia_tap(X, y)
    tk = Path(tap_kiem)
    if not tk.exists():
        if not tao:
            sys.exit(f'Chưa có tệp tập kiểm {tk}. Lần đầu huấn luyện với câu thật thì thêm --tao-tap-kiem.')
        theo_khoa = nguon_theo_khoa(vao)
        chon = tao_tap_kiem(y, [theo_khoa.get(chuan_hoa(t), '') for t in X])
        ghi_tap_kiem(tk, [X[i] for i in chon], [y[i] for i in chon])
        print(f'Đã TẠO tập kiểm cố định {len(chon)} câu: {tk}. Từ nay giữ nguyên tệp này, đừng sửa hay xoá.')
    elif tao:
        sys.exit(f'{tk} đã có. Không tạo lại tập kiểm (số đo cũ sẽ không so được nữa); bỏ --tao-tap-kiem.')
    return chia_theo_tap_kiem(X, y, doc_tap_kiem(tk))


def tao_ong(min_df=2):
    """TF-IDF 1–2 từ trên chữ đã chuẩn hoá, rồi hồi quy logistic đa thức cân bằng nhãn."""
    return Pipeline([
        ('vec', TfidfVectorizer(tokenizer=tach_tu, preprocessor=None, lowercase=False, token_pattern=None,
                                ngram_range=(1, 2), min_df=min_df, smooth_idf=True, norm='l2')),
        ('clf', LogisticRegression(max_iter=3000, class_weight='balanced')),
    ])


def chon_C(X_hoc, y_hoc, min_df=2):
    """Kiểm chéo trên phần học để chọn C. Trả GridSearchCV đã học xong: `best_estimator_`
    là ống học lại trên cả phần học với C tốt nhất, `n_splits_` là số gấp."""
    so_gap = min(5, min(Counter(y_hoc).values()))
    luoi = GridSearchCV(tao_ong(min_df), {'clf__C': CAC_C}, scoring='f1_macro',
                        cv=StratifiedKFold(n_splits=so_gap, shuffle=True, random_state=42))
    luoi.fit(X_hoc, y_hoc)
    return luoi
