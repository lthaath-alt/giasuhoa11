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

Số đo báo cáo lấy trên tập kiểm, từ mô hình CHỈ học trên 80 % còn lại. Mô hình xuất ra
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
from chung import NHAN, PHIEN_BAN_CHUAN_HOA, chia_tap, chon_C, doc_csv_nhan, gop_trung  # noqa: E402

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


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--vao', default=str(THU_MUC / 'du-lieu' / 'nhan.csv'))
    ap.add_argument('--ra', default=str(GOC / 'public' / 'mo-hinh' / 'phan-loai-y-dinh.json'))
    ap.add_argument('--kiem', default=str(THU_MUC / 'ket-qua'))
    ap.add_argument('--tien-to', default='')
    ap.add_argument('--min-df', type=int, default=2)
    a = ap.parse_args()
    vao = Path(a.vao)   # đường dẫn tương đối tính từ thư mục đang đứng (chạy từ gốc repo)

    X, y = doc_csv_nhan(vao)
    # Gộp câu trùng SAU chuẩn hoá trước khi chia train/test — nếu không, "Em
    # chịu" (train) và "em chiu" (test) là CÙNG một vectơ TF-IDF, mô hình coi
    # như được xem bài trước; luật regex không có lợi thế này nên số đo lệch
    # về phía mô hình một cách giả tạo.
    X, y, so_gop = gop_trung(X, y)
    print(f'Gộp {so_gop} câu trùng sau chuẩn hoá — ghi số này vào báo cáo.')
    dem = Counter(y)
    thieu = [n for n in NHAN if dem[n] < 5]
    if thieu:
        sys.exit(f'Mỗi nhãn cần ít nhất 5 câu. Đang thiếu: {", ".join(f"{n} ({dem[n]})" for n in thieu)}')
    print(f'Đọc {len(X)} câu từ {vao}: ' + ', '.join(f'{n}={dem[n]}' for n in NHAN))

    # Cách chia, ống học và lưới C nằm ở chung.py — ve-bieu-do.py dùng đúng các hàm này.
    X_tr, X_te, y_tr, y_te = chia_tap(X, y)
    luoi = chon_C(X_tr, y_tr, a.min_df)
    tot = luoi.best_estimator_
    vec, clf = tot.named_steps['vec'], tot.named_steps['clf']
    print(f'C tốt nhất (kiểm chéo {luoi.n_splits_} gấp trên 80 %): {luoi.best_params_["clf__C"]}')

    Xv = vec.transform(X_te)
    # Trình duyệt tính softmax(decision_function); phải trùng predict_proba, không thì dừng.
    if not np.allclose(clf.predict_proba(Xv), softmax(clf.decision_function(Xv)), atol=1e-9):
        sys.exit('predict_proba khác softmax(decision_function) — bản scikit-learn này không dùng đa thức.')
    du = clf.predict(Xv)
    acc, f1 = accuracy_score(y_te, du), f1_score(y_te, du, average='macro')
    print(f'\nTẬP KIỂM ({len(X_te)} câu): độ chính xác {acc:.3f}, F1 trung bình {f1:.3f}\n')
    print(classification_report(y_te, du, labels=NHAN, zero_division=0))
    print('Ma trận nhầm lẫn (hàng = thật, cột = đoán), thứ tự:', ', '.join(NHAN))
    print(confusion_matrix(y_te, du, labels=NHAN))

    ten = vec.get_feature_names_out()
    print('\nCụm từ đẩy mạnh nhất về từng nhãn (giải thích được — đưa vào báo cáo):')
    for k, nhan in enumerate(clf.classes_):
        top = np.argsort(clf.coef_[k])[::-1][:8]
        print(f'  {nhan}: ' + ', '.join(f'"{ten[i]}"' for i in top))

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

    kiem = Path(a.kiem) if Path(a.kiem).is_absolute() else Path.cwd() / a.kiem
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


if __name__ == '__main__':
    main()
