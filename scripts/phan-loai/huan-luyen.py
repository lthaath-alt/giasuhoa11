"""Huấn luyện bộ phân loại ý định bằng hồi quy logistic (02/10/2026).

Chạy:  python scripts/phan-loai/huan-luyen.py
       python scripts/phan-loai/huan-luyen.py --vao scripts/phan-loai/du-lieu/mau-nho.csv \
              --ra scripts/phan-loai/du-lieu/mau-mo-hinh.json --kiem scripts/phan-loai/du-lieu \
              --tien-to mau- --min-df 1

Ba tệp ra:
  - mô hình JSON (--ra): trọng số để trình duyệt đoán; mặc định public/mo-hinh/phan-loai-y-dinh.json
  - <kiem>/<tien-to>du-doan.json: 30 câu của tập kiểm kèm xác suất scikit-learn tính —
    `kiem-tra:phan-loai` bắt TypeScript tính ra đúng các số này
  - <kiem>/<tien-to>tap-kiem.json: TẬP KIỂM (20 %, máy KHÔNG thấy lúc học) — để so với regex

Số đo báo cáo lấy trên tập kiểm, từ mô hình CHỈ học trên 80 % còn lại (hoặc trên phần
ngoài tập kiểm cố định khi có --tap-kiem, xem README bước 2b). Mô hình xuất ra
cũng chính là mô hình đó, để số đo nói đúng về thứ đang chạy.
"""
import argparse
import datetime
import json
import sys
from collections import Counter
from pathlib import Path

import numpy as np
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score

THU_MUC = Path(__file__).resolve().parent
GOC = THU_MUC.parents[1]
sys.path.insert(0, str(THU_MUC))
from chung import (  # noqa: E402
    NHAN, PHIEN_BAN_CHUAN_HOA, TEP_TEN_HOC_SINH, THU_MUC_THAT, bat_buoc_trong, chia_theo_tuy_chon, chon_C, kiem_so_cau,
    co_cau_that, doc_csv_nhan, doc_ten_hoc_sinh, do_ten_trong_tu_vung, gop_trung,
)

# Câu DÒ nối thêm vào tệp khớp: tập kiểm thật hiếm khi lặp từ, nên nếu chỉ có tập
# kiểm thì một bản TypeScript đếm "có/không" thay vì đếm thô vẫn khớp. Có lặp từ,
# có câu toàn từ lạ, có chuỗi rỗng — mỗi câu bắt một kiểu sai khác nhau.
CAU_DO = [
    'không biết không biết không biết',
    'cho em đáp án đáp án đáp án đi',
    'em chịu em chịu thôi',
    'pH pH pH là gì là gì',
    'xyzzy qwerty asdf',
    '',
]


def softmax(z):
    z = z - z.max(axis=1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=1, keepdims=True)


def khoang_tin_cay(y_that, y_doan, so_lan=1000, hat=42):
    """Khoảng tin cậy 95 % bằng bootstrap: lấy mẫu lại CÓ hoàn lại tập kiểm `so_lan` lần, mỗi lần
    tính lại độ chính xác và F1 macro, rồi lấy phân vị 2,5 và 97,5. Mô hình không học lại, nên
    khoảng này chỉ nói độ dao động do tập kiểm nhỏ. F1 macro mỗi lần tính trên các nhãn có mặt
    trong mẫu lần đó, đúng cách tính con số chính. Trả ((thấp, cao) độ chính xác, (thấp, cao) F1)."""
    rng = np.random.default_rng(hat)
    yt, yd = np.asarray(y_that), np.asarray(y_doan)
    accs, f1s = [], []
    for _ in range(so_lan):
        i = rng.integers(0, len(yt), len(yt))
        accs.append(accuracy_score(yt[i], yd[i]))
        f1s.append(f1_score(yt[i], yd[i], average='macro', zero_division=0))
    return tuple(np.percentile(accs, [2.5, 97.5])), tuple(np.percentile(f1s, [2.5, 97.5]))


def moc_nhan_dong_nhat(y_hoc, y_kiem):
    """Mốc so: "mô hình" luôn đoán nhãn đông nhất của PHẦN HỌC. Trả (nhãn, độ chính xác, F1 macro)
    trên tập kiểm; F1 macro tính trên các nhãn có trong tập kiểm và nhãn được đoán."""
    nhan = Counter(y_hoc).most_common(1)[0][0]
    du = [nhan] * len(y_kiem)
    return nhan, accuracy_score(y_kiem, du), f1_score(y_kiem, du, average='macro', zero_division=0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--vao', default=str(THU_MUC / 'du-lieu' / 'nhan.csv'))
    ap.add_argument('--ra', default=str(GOC / 'public' / 'mo-hinh' / 'phan-loai-y-dinh.json'))
    ap.add_argument('--kiem', help='thư mục tệp khớp + tập kiểm; mặc định ket-qua/, hoặc du-lieu/that/ket-qua/ khi có câu thật')
    ap.add_argument('--tien-to', default='')
    ap.add_argument('--min-df', type=int, default=2)
    ap.add_argument('--tap-kiem', help='tệp tập kiểm CỐ ĐỊNH (dữ liệu thật); bỏ trống = chia 80/20 như cũ')
    ap.add_argument('--tao-tap-kiem', action='store_true',
                    help='chưa có tệp --tap-kiem thì tạo từ 20 %% câu nguồn "that" (chỉ làm MỘT lần)')
    ap.add_argument('--ten-hoc-sinh', default=str(TEP_TEN_HOC_SINH), help='danh sách tên để dò trong từ vựng')
    ap.add_argument('--cho-phep-cum', action='append', default=[],
                    help='cụm hai chữ đã xem tay, là lời thường chứ không phải tên (lặp lại được)')
    a = ap.parse_args()
    vao = Path(a.vao)   # đường dẫn tương đối tính từ thư mục đang đứng (chạy từ gốc repo)

    # Câu thật (nguồn "that"): mọi tệp ra có chứa câu phải ở du-lieu/that/, và từ vựng
    # mô hình web phải qua phép dò tên. Kiểm TRƯỚC khi học, để không mất công rồi mới dừng.
    that = co_cau_that(vao)
    if that:
        kiem = bat_buoc_trong(a.kiem or THU_MUC_THAT / 'ket-qua', THU_MUC_THAT, '--kiem')
        if a.tap_kiem:
            bat_buoc_trong(a.tap_kiem, THU_MUC_THAT, '--tap-kiem')
        else:
            print('CẢNH BÁO: có câu thật mà không --tap-kiem — tập kiểm sẽ đổi mỗi đợt (README bước 2b).')
        ds_ten = doc_ten_hoc_sinh(a.ten_hoc_sinh)
    else:
        kiem = Path(a.kiem) if a.kiem else THU_MUC / 'ket-qua'

    X, y = doc_csv_nhan(vao)
    # Gộp câu trùng SAU chuẩn hoá trước khi chia train/test — nếu không, "Em
    # chịu" (train) và "em chiu" (test) là CÙNG một vectơ TF-IDF, mô hình coi
    # như được xem bài trước; luật regex không có lợi thế này nên số đo lệch
    # về phía mô hình một cách giả tạo.
    X, y, so_gop = gop_trung(X, y)
    print(f'Gộp {so_gop} câu trùng sau chuẩn hoá — ghi số này vào báo cáo.')
    dem = Counter(y)
    print(f'Đọc {len(X)} câu từ {vao}: ' + ', '.join(f'{n}={dem[n]}' for n in NHAN))
    X, y, _ = kiem_so_cau(X, y)

    # Cách chia, ống học và lưới C nằm ở chung.py — ve-bieu-do.py dùng đúng các hàm này.
    X_tr, X_te, y_tr, y_te = chia_theo_tuy_chon(X, y, vao, a.tap_kiem, a.tao_tap_kiem)
    luoi = chon_C(X_tr, y_tr, a.min_df)
    tot = luoi.best_estimator_
    vec, clf = tot.named_steps['vec'], tot.named_steps['clf']
    print(f'C tốt nhất (kiểm chéo {luoi.n_splits_} gấp trên phần học, {len(X_tr)} câu): {luoi.best_params_["clf__C"]}')

    Xv = vec.transform(X_te)
    # Trình duyệt tính softmax(decision_function); phải trùng predict_proba, không thì dừng.
    if not np.allclose(clf.predict_proba(Xv), softmax(clf.decision_function(Xv)), atol=1e-9):
        sys.exit('predict_proba khác softmax(decision_function) — bản scikit-learn này không dùng đa thức.')
    du = clf.predict(Xv)
    acc, f1 = accuracy_score(y_te, du), f1_score(y_te, du, average='macro')
    print(f'\nTẬP KIỂM ({len(X_te)} câu): độ chính xác {acc:.3f}, F1 trung bình {f1:.3f}')
    (acc_lo, acc_hi), (f1_lo, f1_hi) = khoang_tin_cay(y_te, du)
    print(f'Khoảng tin cậy 95 % (bootstrap 1.000 lần lấy mẫu lại tập kiểm, hạt 42): '
          f'độ chính xác {acc_lo:.3f}–{acc_hi:.3f}, F1 macro {f1_lo:.3f}–{f1_hi:.3f}')
    nhan_dong, acc_moc, f1_moc = moc_nhan_dong_nhat(y_tr, y_te)
    print(f'Mốc so "luôn đoán nhãn đông nhất của phần học" ({nhan_dong}): '
          f'độ chính xác {acc_moc:.3f}, F1 macro {f1_moc:.3f}\n')
    print(classification_report(y_te, du, labels=NHAN, zero_division=0))
    print('Ma trận nhầm lẫn (hàng = thật, cột = đoán), thứ tự:', ', '.join(NHAN))
    print(confusion_matrix(y_te, du, labels=NHAN))

    ten = vec.get_feature_names_out()
    print('\nCụm từ đẩy mạnh nhất về từng nhãn (giải thích được — đưa vào báo cáo):')
    for k, nhan in enumerate(clf.classes_):
        top = np.argsort(clf.coef_[k])[::-1][:8]
        print(f'  {nhan}: ' + ', '.join(f'"{ten[i]}"' for i in top))

    if that:
        lot = do_ten_trong_tu_vung(vec.vocabulary_, ds_ten, a.cho_phep_cum)
        if lot:
            sys.exit(f'DỪNG, chưa ghi mô hình: {len(lot)} mục từ vựng trùng tên học sinh: {", ".join(lot)}.\n'
                     f'Mô hình nằm trong public/, ai vào web cũng tải được từ vựng. Che tay các tên đó trong CSV '
                     f'(thay bằng [tên]) rồi chạy lại. Cụm nào xem tay thấy là lời thường thì thêm '
                     f'--cho-phep-cum "<cụm>".')
        print(f'Dò tên trong từ vựng: {len(vec.vocabulary_)} mục, không trùng tên nào trong {len(ds_ten)} tên.')

    mo_hinh = {
        'phien_ban': datetime.datetime.now().strftime('%Y-%m-%d-%H%M'),
        'chuan_hoa_phien_ban': PHIEN_BAN_CHUAN_HOA,
        'nhan': [str(n) for n in clf.classes_],
        'tu_vung': {str(t): int(i) for t, i in vec.vocabulary_.items()},
        'idf': [round(float(v), 6) for v in vec.idf_],
        'he_so': [[round(float(v), 6) for v in hang] for hang in clf.coef_],
        'chan': [round(float(v), 6) for v in clf.intercept_],
        'so_do': {'so_cau_hoc': len(X_tr), 'so_cau_kiem': len(X_te), 'do_chinh_xac': round(acc, 4),
                  'f1_trung_binh': round(f1, 4), 'C': luoi.best_params_['clf__C']},
    }
    ra = Path(a.ra) if Path(a.ra).is_absolute() else Path.cwd() / a.ra
    ra.parent.mkdir(parents=True, exist_ok=True)
    ra.write_text(json.dumps(mo_hinh, ensure_ascii=False), encoding='utf-8')

    kiem = Path(kiem) if Path(kiem).is_absolute() else Path.cwd() / kiem
    kiem.mkdir(parents=True, exist_ok=True)
    xs = clf.predict_proba(Xv)
    xs_do = clf.predict_proba(vec.transform(CAU_DO))
    du_doan = [{'tin': t, 'xac_suat': [float(v) for v in hang]} for t, hang in list(zip(X_te, xs))[:30]]
    du_doan += [{'tin': t, 'xac_suat': [float(v) for v in hang]} for t, hang in zip(CAU_DO, xs_do)]
    (kiem / f'{a.tien_to}du-doan.json').write_text(json.dumps(
        du_doan, ensure_ascii=False, indent=1), encoding='utf-8')
    (kiem / f'{a.tien_to}tap-kiem.json').write_text(json.dumps(
        [{'tin_nhan': t, 'nhan': n} for t, n in zip(X_te, y_te)], ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'\nĐã ghi mô hình {ra} ({ra.stat().st_size // 1024} KB), tệp khớp và tập kiểm ở {kiem}')

    # `kiem-tra:phan-loai` so TypeScript với Python trên ket-qua/du-doan.json cho đúng mô
    # hình web. Tệp đó lên git, nên khi học trên câu thật thì dựng nó từ câu GIẢ
    # (mau-nho.csv + câu dò), không lấy một câu thật nào.
    if that and ra.resolve() == (GOC / 'public' / 'mo-hinh' / 'phan-loai-y-dinh.json').resolve():
        X_gia, _ = doc_csv_nhan(THU_MUC / 'du-lieu' / 'mau-nho.csv')
        cau_gia = X_gia[:30] + CAU_DO
        xs_gia = clf.predict_proba(vec.transform(cau_gia))
        (THU_MUC / 'ket-qua' / 'du-doan.json').write_text(json.dumps(
            [{'tin': t, 'xac_suat': [float(v) for v in hang]} for t, hang in zip(cau_gia, xs_gia)],
            ensure_ascii=False, indent=1), encoding='utf-8')
        print('Ghi ket-qua/du-doan.json từ câu giả (mau-nho.csv) cho kiem-tra:phan-loai. So với regex: '
              f'npm run danh-gia:phan-loai -- --tap-kiem {kiem / (a.tien_to + "tap-kiem.json")}')


if __name__ == '__main__':
    main()
