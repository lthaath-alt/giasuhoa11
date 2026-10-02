"""Huấn luyện bộ phân loại ý định bằng hồi quy logistic (02/10/2026).

Chạy:  python scripts/phan-loai/huan-luyen.py
       python scripts/phan-loai/huan-luyen.py --vao du-lieu/mau-nho.csv --ra du-lieu/mau-mo-hinh.json \
              --kiem du-lieu --tien-to mau- --min-df 1

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
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split
from sklearn.pipeline import Pipeline

THU_MUC = Path(__file__).resolve().parent
GOC = THU_MUC.parents[1]
sys.path.insert(0, str(THU_MUC))
from chung import NHAN, PHIEN_BAN_CHUAN_HOA, doc_csv_nhan, tach_tu  # noqa: E402


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
    dem = Counter(y)
    thieu = [n for n in NHAN if dem[n] < 5]
    if thieu:
        sys.exit(f'Mỗi nhãn cần ít nhất 5 câu. Đang thiếu: {", ".join(f"{n} ({dem[n]})" for n in thieu)}')
    print(f'Đọc {len(X)} câu từ {vao}: ' + ', '.join(f'{n}={dem[n]}' for n in NHAN))

    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    ong = Pipeline([
        ('vec', TfidfVectorizer(tokenizer=tach_tu, preprocessor=None, lowercase=False, token_pattern=None,
                                ngram_range=(1, 2), min_df=a.min_df, smooth_idf=True, norm='l2')),
        ('clf', LogisticRegression(max_iter=3000, class_weight='balanced')),
    ])
    so_gap = min(5, min(Counter(y_tr).values()))
    luoi = GridSearchCV(ong, {'clf__C': [0.25, 1.0, 4.0, 16.0]}, scoring='f1_macro',
                        cv=StratifiedKFold(n_splits=so_gap, shuffle=True, random_state=42))
    luoi.fit(X_tr, y_tr)
    tot = luoi.best_estimator_
    vec, clf = tot.named_steps['vec'], tot.named_steps['clf']
    print(f'C tốt nhất (kiểm chéo {so_gap} gấp trên 80 %): {luoi.best_params_["clf__C"]}')

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
    (kiem / f'{a.tien_to}du-doan.json').write_text(json.dumps(
        [{'tin': t, 'xac_suat': [float(v) for v in hang]} for t, hang in list(zip(X_te, xs))[:30]],
        ensure_ascii=False, indent=1), encoding='utf-8')
    (kiem / f'{a.tien_to}tap-kiem.json').write_text(json.dumps(
        [{'tin_nhan': t, 'nhan': n} for t, n in zip(X_te, y_te)], ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'\nĐã ghi mô hình {ra} ({ra.stat().st_size // 1024} KB), tệp khớp và tập kiểm ở {kiem}')


if __name__ == '__main__':
    main()
