"""Vẽ biểu đồ cho bộ phân loại ý định (02/10/2026).

Chạy (từ gốc repo):  python scripts/phan-loai/ve-bieu-do.py
Ra: scripts/phan-loai/ket-qua/bieu-do/ gồm các ảnh PNG và so-lieu.json (mọi con số trên ảnh).

Script học lại y như huan-luyen.py (cùng dữ liệu, cùng cách chia, cùng ống học trong
chung.py) nhưng KHÔNG ghi đè mô hình trên web. Các phép kiểm chạy trước khi vẽ:
  1. Mô hình vừa học phải trùng public/mo-hinh/phan-loai-y-dinh.json. Lệch nghĩa là
     nhan.csv đã đổi sau lần huấn luyện cuối: ảnh không còn nói về mô hình đang chạy,
     script in cảnh báo và ghi vào chân mỗi ảnh.
  2. Đường cong huấn luyện dựng bằng cách học lại với max_iter = 1, 2, 3...: vòng cuối
     phải ra đúng trọng số của mô hình thật, không thì dừng.
  3. Điểm kiểm chéo ở C đã chọn (trên đường cong học và đường chọn C) phải bằng điểm
     GridSearchCV của huan-luyen.py, không thì dừng.

Cột nguoi_gan có tên một AI (claude, gemini, gpt...) thì mọi ảnh mang chữ chìm
"BẢN THỬ / NHÃN DO AI GÁN": số đo đó chưa được ghi là của nhóm
(du-lieu/GHI-CHU-DU-LIEU-AI.md). Nhóm tự gán nhãn lại thì chữ chìm tự mất.
"""
import argparse
import csv
import datetime
import json
import math
import re
import sys
import textwrap
import warnings
from collections import Counter
from pathlib import Path

import matplotlib

matplotlib.use('Agg')  # chỉ ghi tệp ảnh, không mở cửa sổ
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib.ticker import FuncFormatter  # noqa: E402
from sklearn.base import clone  # noqa: E402
from sklearn.exceptions import ConvergenceWarning  # noqa: E402
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, log_loss  # noqa: E402
from sklearn.model_selection import StratifiedKFold, train_test_split, validation_curve  # noqa: E402

THU_MUC = Path(__file__).resolve().parent
GOC = THU_MUC.parents[1]
sys.path.insert(0, str(THU_MUC))
from chung import (  # noqa: E402
    CAC_C, NHAN, THU_MUC_THAT, bat_buoc_trong, chia_theo_tuy_chon, chon_C, co_cau_that, doc_csv_nhan,
    gop_trung, tao_ong,
)

TEN_NHAN = {
    'hoi_khai_niem': 'Hỏi khái niệm',
    'be_tac': 'Bế tắc',
    'xin_dap_an': 'Xin đáp án',
    'nop_bai_lam': 'Nộp bài làm',
    'gian_lan_phong_thi': 'Gian lận phòng thi',
    'ngoai_mon': 'Ngoài môn',
}
# Thấy một trong các tên này ở cột nguoi_gan thì coi dòng đó do AI gán nhãn.
TEN_AI = ('claude', 'gemini', 'gpt', 'deepseek', 'llama', 'qwen', 'copilot', 'grok')
MAU_HOC, MAU_KIEM, MAU_PHU, MAU_DAM = '#1f6fb4', '#d1372f', '#777777', '#222222'
TI_LE_HOC = [0.2, 0.35, 0.5, 0.65, 0.8, 1.0]  # đường cong học: dùng bấy nhiêu phần của phần học
C_DAY = sorted({4.0 ** k for k in range(-3, 6)} | set(CAC_C))  # 1/64 ... 1024, chứa đủ CAC_C


def so(v, k=2):
    """Số kiểu Việt, dấu phẩy thập phân: 0.361 -> '0,36'."""
    return f'{v:.{k}f}'.replace('.', ',')


def pt(v, k=1):
    """Tỉ lệ 0..1 thành phần trăm kiểu Việt: 0.92 -> '92,0 %'."""
    return so(v * 100, k) + ' %'


def ten_C(c):
    return f'1/{round(1 / c)}' if c < 1 else f'{c:g}'


def dem_nguon(tep):
    """Đếm câu do AI viết (nguon bắt đầu bằng 'ai-') và câu do AI gán nhãn (nguoi_gan có tên AI)."""
    ai_viet = ai_gan = 0
    with open(tep, encoding='utf-8-sig', newline='') as f:
        for r in csv.DictReader(f):
            if not (r.get('tin_nhan') or '').strip():
                continue
            if (r.get('nguon') or '').strip().lower().startswith('ai-'):
                ai_viet += 1
            if any(t in (r.get('nguoi_gan') or '').lower() for t in TEN_AI):
                ai_gan += 1
    return ai_viet, ai_gan


def so_voi_mo_hinh_web(tep, vec, clf):
    """(None, None) nếu không có tệp; ngược lại (trùng hay không, phiên bản trên web)."""
    if not tep.exists():
        return None, None
    m = json.loads(tep.read_text(encoding='utf-8'))
    try:
        trung = (m.get('nhan') == [str(n) for n in clf.classes_]
                 and m.get('tu_vung') == {str(t): int(i) for t, i in vec.vocabulary_.items()}
                 and np.allclose(m.get('he_so'), clf.coef_, atol=2e-6)
                 and np.allclose(m.get('chan'), clf.intercept_, atol=2e-6))
    except (TypeError, ValueError):
        trung = False
    return bool(trung), m.get('phien_ban')


def duong_cong_huan_luyen(tot, X_hoc, y_hoc, X_kiem, y_kiem):
    """Đường cong huấn luyện của CHÍNH mô hình đã học.

    scikit-learn học hồi quy logistic bằng L-BFGS, xuất phát từ mọi trọng số bằng 0
    (vòng 0: mọi nhãn cùng xác suất, mất mát = ln số nhãn). L-BFGS tất định, nên học
    lại với max_iter = k thì dừng đúng ở trọng số vòng k của lần học thật.
    """
    clf = tot.named_steps['clf']
    nhan = clf.classes_
    hang = [{'vong': 0, 'mat_mat_hoc': math.log(len(nhan)), 'mat_mat_kiem': math.log(len(nhan)),
             'chinh_xac_hoc': None, 'chinh_xac_kiem': None}]
    ong = None
    for k in range(1, int(np.max(clf.n_iter_)) + 1):
        ong = clone(tot).set_params(clf__max_iter=k)
        with warnings.catch_warnings():
            warnings.simplefilter('ignore', ConvergenceWarning)  # dừng trước khi hội tụ là cố ý
            ong.fit(X_hoc, y_hoc)
        hang.append({
            'vong': k,
            'mat_mat_hoc': float(log_loss(y_hoc, ong.predict_proba(X_hoc), labels=nhan)),
            'mat_mat_kiem': float(log_loss(y_kiem, ong.predict_proba(X_kiem), labels=nhan)),
            'chinh_xac_hoc': float(accuracy_score(y_hoc, ong.predict(X_hoc))),
            'chinh_xac_kiem': float(accuracy_score(y_kiem, ong.predict(X_kiem))),
        })
    cuoi = ong.named_steps['clf']
    if not (np.allclose(cuoi.coef_, clf.coef_, atol=1e-10) and np.allclose(cuoi.intercept_, clf.intercept_, atol=1e-10)):
        sys.exit('Vòng cuối của đường cong huấn luyện không ra đúng mô hình thật: ảnh sẽ vẽ sai, dừng.')
    return hang


def duong_cong_hoc(X_hoc, y_hoc, C, min_df, cac_gap):
    """Học trên 20 %, 35 %, ..., 100 % phần học của từng gấp kiểm chéo (lấy mẫu giữ tỉ lệ
    nhãn), chấm F1 trên câu của gấp chưa học. Tập kiểm riêng KHÔNG dùng ở đây."""
    X_hoc, y_hoc = np.array(X_hoc, dtype=object), np.array(y_hoc)
    so_nhan = len(set(y_hoc))
    kq = []
    for ti_le in TI_LE_HOC:
        so_cau, f1_hoc, f1_kiem = [], [], []
        for i_gap, i_kiem in cac_gap:
            can = round(ti_le * len(i_gap))
            if can < 3 * so_nhan:
                break  # quá ít câu: mỗi nhãn không có nổi vài câu, bỏ mức này
            i_hoc = i_gap
            if can < len(i_gap):
                i_hoc, _ = train_test_split(i_gap, train_size=can, stratify=y_hoc[i_gap], random_state=42)
            ong = tao_ong(min_df).set_params(clf__C=C).fit(list(X_hoc[i_hoc]), y_hoc[i_hoc])
            so_cau.append(len(i_hoc))
            f1_hoc.append(f1_score(y_hoc[i_hoc], ong.predict(list(X_hoc[i_hoc])), average='macro'))
            f1_kiem.append(f1_score(y_hoc[i_kiem], ong.predict(list(X_hoc[i_kiem])), average='macro'))
        if len(so_cau) == len(cac_gap):
            kq.append({'ti_le': ti_le, 'so_cau_hoc': float(np.mean(so_cau)),
                       'f1_hoc': float(np.mean(f1_hoc)), 'f1_hoc_lech': float(np.std(f1_hoc)),
                       'f1_kiem': float(np.mean(f1_kiem)), 'f1_kiem_lech': float(np.std(f1_kiem))})
    return kq


def duong_chon_C(X_hoc, y_hoc, min_df, cv):
    """F1 kiểm chéo theo từng mức C, dày hơn 4 mức huan-luyen.py thử. Trả (bảng, số lần chưa hội tụ)."""
    with warnings.catch_warnings(record=True) as canh_bao:
        warnings.simplefilter('always', ConvergenceWarning)
        diem_hoc, diem_kiem = validation_curve(tao_ong(min_df), X_hoc, y_hoc, param_name='clf__C',
                                               param_range=C_DAY, cv=cv, scoring='f1_macro')
    chua_hoi_tu = sum(issubclass(w.category, ConvergenceWarning) for w in canh_bao)
    bang = [{'C': c, 'f1_hoc': float(h.mean()), 'f1_kiem': float(k.mean()), 'f1_kiem_lech': float(k.std())}
            for c, h, k in zip(C_DAY, diem_hoc, diem_kiem)]
    return bang, chua_hoi_tu


def doc_so_sanh(tep):
    """F1 của regex và mô hình trong so-sanh.md (npm run danh-gia:phan-loai ghi ra). Trả (phiên bản, dòng)."""
    if not tep.exists():
        return None, []
    chu = tep.read_text(encoding='utf-8')
    pb = re.search(r'Mô hình `([^`]+)`', chu)
    dong = re.findall(r'^\| (\w+) \| (regex|mô hình) \| [\d,]+ % \| [\d,]+ % \| ([\d,]+) % \|', chu, re.M)
    return (pb.group(1) if pb else None), [(n, cach, float(f1.replace(',', '.')) / 100) for n, cach, f1 in dong]


def kiem_bang(ten, a, b):
    if not math.isclose(a, b, abs_tol=1e-9):
        sys.exit(f'{ten}: {a} khác điểm GridSearchCV {b}. Hai bên không học cùng một cách, ảnh sẽ sai, dừng.')


def an_vien(a):
    a.spines[['top', 'right']].set_visible(False)


def luu(fig, tep, chan, chim):
    fig.tight_layout()
    # Chân ảnh đặt DƯỚI khung hình; bbox_inches='tight' tự nới ảnh ra cho đủ chỗ.
    fig.text(0.01, -0.01, textwrap.fill(chan, int(fig.get_figwidth() * 17.5)), fontsize=8,
             color=MAU_PHU, ha='left', va='top')
    if chim:
        fig.text(0.5, 0.5, chim, fontsize=40, color=MAU_KIEM, alpha=0.13, rotation=22, ha='center',
                 va='center', fontweight='bold', zorder=10, linespacing=1.15)
    fig.savefig(tep, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close(fig)


def ve_huan_luyen(hang, C, n_hoc, n_kiem):
    so_nhan = round(math.exp(hang[0]['mat_mat_hoc']))
    cuoi = hang[-1]
    fig, (a1, a2) = plt.subplots(1, 2, figsize=(11, 4.6))
    vong = [h['vong'] for h in hang]
    a1.plot(vong, [h['mat_mat_hoc'] for h in hang], color=MAU_HOC, marker='o', ms=3,
            label=f'tập học ({n_hoc} câu): {so(cuoi["mat_mat_hoc"])} ở vòng cuối')
    a1.plot(vong, [h['mat_mat_kiem'] for h in hang], color=MAU_KIEM, marker='o', ms=3,
            label=f'tập kiểm ({n_kiem} câu chưa học): {so(cuoi["mat_mat_kiem"])} ở vòng cuối')
    a1.annotate(f'vòng 0: chưa học, đoán đều mỗi nhãn 1/{so_nhan}\nmất mát = ln {so_nhan} ≈ {so(hang[0]["mat_mat_hoc"])}',
                xy=(0, hang[0]['mat_mat_hoc']), xytext=(0.22, 0.93), textcoords='axes fraction', va='top',
                fontsize=9, arrowprops={'arrowstyle': '->', 'color': MAU_PHU})
    a1.set_ylim(bottom=0)
    a1.set_xlabel('Vòng lặp của thuật toán tối ưu L-BFGS')
    a1.set_ylabel('Mất mát log-loss (thấp hơn là tốt hơn)')
    a1.set_title('Mất mát qua từng vòng')
    a1.legend(frameon=False, loc='center right', fontsize=9)

    a2.plot(vong[1:], [h['chinh_xac_hoc'] * 100 for h in hang[1:]], color=MAU_HOC, marker='o', ms=3,
            label=f'tập học, vòng cuối {pt(cuoi["chinh_xac_hoc"])}')
    a2.plot(vong[1:], [h['chinh_xac_kiem'] * 100 for h in hang[1:]], color=MAU_KIEM, marker='o', ms=3,
            label=f'tập kiểm, vòng cuối {pt(cuoi["chinh_xac_kiem"])}')
    a2.axhline(100 / so_nhan, color=MAU_PHU, ls=':', lw=1)
    a2.text(vong[-1], 100 / so_nhan + 2, f'đoán bừa: {so(100 / so_nhan, 1)} %', ha='right', color=MAU_PHU, fontsize=9)
    a2.set_ylim(0, 102)
    a2.yaxis.set_major_formatter(FuncFormatter(lambda v, _: f'{v:.0f} %'))
    a2.set_xlabel('Vòng lặp của thuật toán tối ưu L-BFGS')
    a2.set_ylabel('Độ chính xác')
    a2.set_title('Độ chính xác qua từng vòng')
    a2.legend(frameon=False, loc='lower right', fontsize=9)
    for a in (a1, a2):
        an_vien(a)
    fig.suptitle(f'Đường cong huấn luyện bộ phân loại ý định (hồi quy logistic, C = {ten_C(C)}, '
                 f'{vong[-1]} vòng)', fontweight='bold')
    return fig


def ve_hoc(kq, f1_rieng, n_hoc, n_kiem, so_gap):
    fig, a = plt.subplots(figsize=(8, 5))
    x = [d['so_cau_hoc'] for d in kq]
    for khoa, mau, ten in (('f1_hoc', MAU_HOC, 'chấm trên chính các câu đã học'),
                           ('f1_kiem', MAU_KIEM, f'kiểm chéo {so_gap} gấp (câu chưa học)')):
        tb = np.array([d[khoa] for d in kq]) * 100
        lech = np.array([d[khoa + '_lech'] for d in kq]) * 100
        a.plot(x, tb, color=mau, marker='o', label=ten)
        a.fill_between(x, tb - lech, tb + lech, color=mau, alpha=0.15, linewidth=0)
    a.plot([n_hoc], [f1_rieng * 100], marker='*', ms=16, color=MAU_DAM, ls='none',
           label=f'tập kiểm riêng ({n_kiem} câu), học trên đủ {n_hoc} câu: {pt(f1_rieng)}')
    thap = min(min(d['f1_kiem'] - d['f1_kiem_lech'] for d in kq), f1_rieng) * 100
    a.set_ylim(max(0, thap - 8), 102)
    a.yaxis.set_major_formatter(FuncFormatter(lambda v, _: f'{v:.0f} %'))
    a.set_xlabel('Số câu dùng để học')
    a.set_ylabel('F1 trung bình 6 nhãn')
    a.set_title('Đường cong học: điểm theo số câu dùng để học')
    a.legend(frameon=False, loc='lower right', fontsize=9)
    an_vien(a)
    return fig


def ve_chon_C(bang, C, so_gap, n_hoc):
    fig, a = plt.subplots(figsize=(8, 5))
    x = [d['C'] for d in bang]
    kiem = np.array([d['f1_kiem'] for d in bang]) * 100
    lech = np.array([d['f1_kiem_lech'] for d in bang]) * 100
    a.plot(x, [d['f1_hoc'] * 100 for d in bang], color=MAU_HOC, marker='o', label='chấm trên chính các câu đã học')
    a.plot(x, kiem, color=MAU_KIEM, marker='o', label=f'kiểm chéo {so_gap} gấp (câu chưa học)')
    a.fill_between(x, kiem - lech, kiem + lech, color=MAU_KIEM, alpha=0.15, linewidth=0)
    thu = [i for i, c in enumerate(x) if c in CAC_C]
    a.plot([x[i] for i in thu], [kiem[i] for i in thu], ls='none', marker='o', ms=11, mfc='none', mec=MAU_DAM,
           label=f'{len(thu)} mức huan-luyen.py thử')
    a.axvline(C, color=MAU_DAM, ls='--', lw=1, label=f'C đã chọn = {ten_C(C)}')
    thap = max(0, float((kiem - lech).min()) - 8)
    a.set_xscale('log')
    a.set_xticks(x, [ten_C(c) for c in x])
    a.minorticks_off()
    a.set_ylim(thap, 102)
    a.yaxis.set_major_formatter(FuncFormatter(lambda v, _: f'{v:.0f} %'))
    a.set_xlabel('C (thang log). Nhỏ: phạt trọng số mạnh, mô hình đơn giản.\n'
                 'Lớn: phạt nhẹ, mô hình bám sát câu đã học.')
    a.set_ylabel('F1 trung bình 6 nhãn')
    a.set_title(f'Chọn C bằng kiểm chéo trên {n_hoc} câu học')
    a.legend(frameon=False, loc='lower right', fontsize=9)
    an_vien(a)
    return fig


def ve_nham_lan(ma_tran, n, dung):
    fig, a = plt.subplots(figsize=(7.5, 6.3))
    a.imshow(ma_tran, cmap='Blues')
    ten = [TEN_NHAN.get(t, t) for t in NHAN]
    a.set_xticks(range(len(NHAN)), ten, rotation=30, ha='right')
    a.set_yticks(range(len(NHAN)), ten)
    nguong = ma_tran.max() / 2
    for i in range(len(NHAN)):
        for j in range(len(NHAN)):
            v = int(ma_tran[i, j])
            a.text(j, i, str(v), ha='center', va='center', fontsize=12,
                   color='white' if v > nguong else ('#bbbbbb' if v == 0 else MAU_DAM))
    a.set_xlabel('Mô hình đoán')
    a.set_ylabel('Nhãn thật')
    a.set_title(f'Ma trận nhầm lẫn trên tập kiểm: đúng {dung}/{n} câu ({pt(dung / n)})')
    return fig


def ve_cum_tu(clf, vec, so_tu=8):
    ten_dt = vec.get_feature_names_out()
    so_cot = 3
    so_hang = math.ceil(len(NHAN) / so_cot)
    fig, cac_o = plt.subplots(so_hang, so_cot, figsize=(12, 3.6 * so_hang))
    cac_o = np.atleast_1d(cac_o).ravel()
    cum = {}
    for o, nhan in zip(cac_o, NHAN):
        k = list(clf.classes_).index(nhan)
        top = np.argsort(clf.coef_[k])[::-1][:so_tu]
        tu = [str(ten_dt[i]) for i in top]
        he_so = [float(clf.coef_[k][i]) for i in top]
        cum[nhan] = [[t, round(h, 4)] for t, h in zip(tu, he_so)]
        vi_tri = np.arange(len(tu))[::-1]
        o.barh(vi_tri, he_so, color=MAU_HOC)
        o.set_yticks(vi_tri, [f'"{t}"' for t in tu])
        o.set_title(TEN_NHAN.get(nhan, nhan))
        o.set_xlabel('hệ số trong mô hình', fontsize=9)
        an_vien(o)
    for o in cac_o[len(NHAN):]:
        o.set_visible(False)
    fig.suptitle('Cụm từ đẩy mạnh nhất về từng nhãn (chữ đã bỏ dấu, đúng như mô hình đọc)', fontweight='bold')
    return fig, cum


def ve_regex(dong, n_kiem):
    cac_nhan = [n for n in NHAN if any(d[0] == n for d in dong)]
    fig, a = plt.subplots(figsize=(7.5, 5))
    x = np.arange(len(cac_nhan))
    rong = 0.36
    for lech, cach, mau, ten in ((-rong / 2, 'regex', MAU_PHU, 'luật regex đang chạy trên web'),
                                 (rong / 2, 'mô hình', MAU_HOC, 'mô hình hồi quy logistic')):
        gia_tri = [next((f1 for n, c, f1 in dong if n == nhan and c == cach), 0) * 100 for nhan in cac_nhan]
        a.bar(x + lech, gia_tri, width=rong, color=mau, label=ten)
        for xx, v in zip(x + lech, gia_tri):
            a.text(xx, v + 1.5, f'{so(v, 1)} %', ha='center', fontsize=10)
    a.set_xticks(x, [TEN_NHAN.get(n, n) for n in cac_nhan])
    a.set_ylim(0, 112)
    a.yaxis.set_major_formatter(FuncFormatter(lambda v, _: f'{v:.0f} %'))
    a.set_ylabel('F1')
    a.set_title(f'So với luật regex trên tập kiểm ({n_kiem} câu)\nregex chỉ nhận ra {len(cac_nhan)} nhãn này')
    a.legend(frameon=False, loc='upper left', fontsize=9)
    an_vien(a)
    return fig


def main():
    ap = argparse.ArgumentParser(description='Vẽ biểu đồ cho bộ phân loại ý định.')
    ap.add_argument('--vao', default=str(THU_MUC / 'du-lieu' / 'nhan.csv'), help='CSV đã gán nhãn')
    ap.add_argument('--ra', help='thư mục ghi ảnh; mặc định ket-qua/bieu-do/, hoặc du-lieu/that/bieu-do/ khi có câu thật')
    ap.add_argument('--mo-hinh', default=str(GOC / 'public' / 'mo-hinh' / 'phan-loai-y-dinh.json'),
                    help='mô hình đang chạy trên web, để so')
    ap.add_argument('--so-sanh', default=str(THU_MUC / 'ket-qua' / 'so-sanh.md'),
                    help='tệp npm run danh-gia:phan-loai ghi ra, để vẽ cột so với regex')
    ap.add_argument('--min-df', type=int, default=2)
    ap.add_argument('--tap-kiem', help='tệp tập kiểm cố định, PHẢI giống lệnh huan-luyen.py đã chạy')
    a = ap.parse_args()
    vao = Path(a.vao)
    # Câu thật: ảnh cụm từ đặc trưng và so-lieu.json mang chữ lấy từ câu của học sinh,
    # nên chỉ được ghi trong du-lieu/that/ (bị .gitignore). Xem lại rồi mới chép ảnh ra.
    if co_cau_that(vao):
        ra = bat_buoc_trong(a.ra or THU_MUC_THAT / 'bieu-do', THU_MUC_THAT, '--ra')
        if a.tap_kiem:
            bat_buoc_trong(a.tap_kiem, THU_MUC_THAT, '--tap-kiem')
    else:
        ra = Path(a.ra) if a.ra else THU_MUC / 'ket-qua' / 'bieu-do'
    plt.rcParams.update({'font.size': 10.5, 'axes.titleweight': 'bold'})

    X, y = doc_csv_nhan(vao)
    so_dong = len(X)
    ai_viet, ai_gan = dem_nguon(vao)
    X, y, so_gop = gop_trung(X, y)
    dem = Counter(y)
    thieu = [n for n in NHAN if dem[n] < 5]
    if thieu:
        sys.exit(f'Mỗi nhãn cần ít nhất 5 câu. Đang thiếu: {", ".join(f"{n} ({dem[n]})" for n in thieu)}')
    X_hoc, X_kiem, y_hoc, y_kiem = chia_theo_tuy_chon(X, y, vao, a.tap_kiem)
    luoi = chon_C(X_hoc, y_hoc, a.min_df)
    tot = luoi.best_estimator_
    vec, clf = tot.named_steps['vec'], tot.named_steps['clf']
    C, so_gap = luoi.best_params_['clf__C'], luoi.n_splits_
    cv = StratifiedKFold(n_splits=so_gap, shuffle=True, random_state=42)  # đúng cách chia của chon_C
    trung, phien_ban = so_voi_mo_hinh_web(Path(a.mo_hinh), vec, clf)

    print(f'Dữ liệu {vao.name}: {so_dong} câu, gộp {so_gop} câu trùng, học {len(X_hoc)}, kiểm {len(X_kiem)}.')
    if trung:
        print(f'Mô hình vừa học trùng bản đang chạy trên web ({phien_ban}).')
    elif trung is False:
        print(f'CẢNH BÁO: mô hình vừa học KHÁC bản trên web ({phien_ban}). Dữ liệu đã đổi sau lần huấn '
              f'luyện cuối; chạy huan-luyen.py rồi vẽ lại thì ảnh mới nói đúng về mô hình đang chạy.')
    else:
        print('Không thấy mô hình trên web để so; ảnh chỉ nói về mô hình vừa học lại.')

    hang = duong_cong_huan_luyen(tot, X_hoc, y_hoc, X_kiem, y_kiem)
    kq_hoc = duong_cong_hoc(X_hoc, y_hoc, C, a.min_df, list(cv.split(X_hoc, y_hoc)))
    bang_C, chua_hoi_tu = duong_chon_C(X_hoc, y_hoc, a.min_df, cv)
    if kq_hoc and kq_hoc[-1]['ti_le'] == 1.0:
        kiem_bang('Đường cong học, mức 100 %', kq_hoc[-1]['f1_kiem'], luoi.best_score_)
    kiem_bang(f'Đường chọn C, C = {C:g}', next(d['f1_kiem'] for d in bang_C if d['C'] == C), luoi.best_score_)

    du = clf.predict(vec.transform(X_kiem))
    acc, f1 = accuracy_score(y_kiem, du), f1_score(y_kiem, du, average='macro')
    ma_tran = confusion_matrix(y_kiem, du, labels=NHAN)
    dung = int(np.trace(ma_tran))

    chan = f'Dữ liệu: {vao.name}, {so_dong} câu'
    if so_gop:
        chan += f', gộp {so_gop} câu trùng còn {len(X)}'
    if ai_viet or ai_gan:
        chan += f' ({ai_viet} câu AI viết, {ai_gan} câu AI gán nhãn)'
    if trung:
        chan += f'. Mô hình {phien_ban}, trùng bản trên web'
    elif trung is False:
        chan += f'. KHÁC mô hình trên web ({phien_ban})'
    chan += f'. Vẽ {datetime.date.today():%d/%m/%Y}.'
    chim = 'BẢN THỬ\nNHÃN DO AI GÁN' if ai_gan else ''

    ra.mkdir(parents=True, exist_ok=True)
    anh = []

    def ghi(fig, ten):
        luu(fig, ra / ten, chan, chim)
        anh.append(ten)

    ghi(ve_huan_luyen(hang, C, len(X_hoc), len(X_kiem)), '1-duong-cong-huan-luyen.png')
    if kq_hoc:
        ghi(ve_hoc(kq_hoc, f1, len(X_hoc), len(X_kiem), so_gap), '2-duong-cong-hoc.png')
    ghi(ve_chon_C(bang_C, C, so_gap, len(X_hoc)), '3-chon-C.png')
    ghi(ve_nham_lan(ma_tran, len(y_kiem), dung), '4-ma-tran-nham-lan.png')
    fig, cum = ve_cum_tu(clf, vec)
    ghi(fig, '5-cum-tu-dac-trung.png')
    # so-sanh.md chấm bản TRÊN WEB; chỉ vẽ khi mô hình vừa học chính là bản đó.
    pb_so_sanh, dong_regex = doc_so_sanh(Path(a.so_sanh))
    regex_hop_le = bool(trung and dong_regex and pb_so_sanh == phien_ban)
    if regex_hop_le:
        ghi(ve_regex(dong_regex, len(y_kiem)), '6-so-voi-regex.png')
    elif not trung:
        print('Bỏ ảnh so với regex: so-sanh.md chấm mô hình trên web, mà mô hình vừa học không phải bản đó.')
    elif not dong_regex:
        print(f'Bỏ ảnh so với regex: chưa có {a.so_sanh}. Chạy npm run danh-gia:phan-loai rồi vẽ lại.')
    else:
        print(f'Bỏ ảnh so với regex: so-sanh.md chấm mô hình {pb_so_sanh or "?"}, bản trên web là '
              f'{phien_ban}. Chạy npm run danh-gia:phan-loai rồi vẽ lại.')

    thap_nhat = min(hang[1:], key=lambda h: h['mat_mat_kiem'])
    so_lieu = {
        've_ngay': datetime.date.today().isoformat(),
        'du_lieu': {'tep': vao.name, 'so_cau': so_dong, 'so_gop': so_gop, 'so_cau_ai_viet': ai_viet,
                    'so_cau_ai_gan_nhan': ai_gan, 'theo_nhan': {n: dem[n] for n in NHAN},
                    'so_cau_hoc': len(X_hoc), 'so_cau_kiem': len(X_kiem)},
        'mo_hinh': {'C': C, 'so_gap_kiem_cheo': so_gap, 'f1_kiem_cheo': round(luoi.best_score_, 4),
                    'so_vong_lap': hang[-1]['vong'], 'phien_ban_tren_web': phien_ban, 'trung_ban_tren_web': trung},
        'tap_kiem': {'so_cau': len(y_kiem), 'so_cau_dung': dung, 'do_chinh_xac': round(acc, 4),
                     'f1_trung_binh': round(f1, 4)},
        'duong_cong_huan_luyen': [{k: (round(v, 4) if isinstance(v, float) else v) for k, v in h.items()}
                                  for h in hang],
        'duong_cong_hoc': [{k: round(v, 4) for k, v in d.items()} for d in kq_hoc],
        'chon_C': [{k: round(v, 6) for k, v in d.items()} for d in bang_C],
        'so_lan_chua_hoi_tu_khi_chon_C': chua_hoi_tu,
        'ma_tran_nham_lan': {'thu_tu': NHAN, 'hang_la_nhan_that': ma_tran.tolist()},
        'cum_tu_dac_trung': cum,
        'so_voi_regex': ([{'nhan': n, 'cach': c, 'f1': round(v, 4)} for n, c, v in dong_regex]
                         if regex_hop_le else None),
        'anh': anh,
    }
    (ra / 'so-lieu.json').write_text(json.dumps(so_lieu, ensure_ascii=False, indent=1), encoding='utf-8')

    print(f'C = {ten_C(C)} (kiểm chéo {so_gap} gấp, F1 {pt(luoi.best_score_)}); học xong sau {hang[-1]["vong"]} vòng L-BFGS.')
    print(f'Mất mát vòng cuối: học {so(hang[-1]["mat_mat_hoc"], 3)}, kiểm {so(hang[-1]["mat_mat_kiem"], 3)}; '
          f'trên tập kiểm thấp nhất ở vòng {thap_nhat["vong"]} ({so(thap_nhat["mat_mat_kiem"], 3)}).')
    if kq_hoc:
        print('Đường cong học (F1 kiểm chéo): ' + ', '.join(
            f'{d["so_cau_hoc"]:.0f} câu {pt(d["f1_kiem"])}' for d in kq_hoc) + '.')
    if chua_hoi_tu:
        print(f'{chua_hoi_tu} lần học ở C rất lớn chưa hội tụ sau 3000 vòng: điểm ở đó chỉ gần đúng.')
    print(f'Tập kiểm: đúng {dung}/{len(y_kiem)} câu ({pt(acc)}), F1 trung bình {pt(f1)}.')
    if chim:
        print(f'{ai_gan} câu do AI gán nhãn: mọi ảnh có chữ chìm "BẢN THỬ / NHÃN DO AI GÁN" '
              f'(xem du-lieu/GHI-CHU-DU-LIEU-AI.md).')
    print(f'Đã ghi {len(anh)} ảnh và so-lieu.json vào {ra}')


if __name__ == '__main__':
    main()
