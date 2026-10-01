# Kế hoạch L — Bộ phân loại ý định tin nhắn bằng hồi quy logistic (chạy bóng)

> **Cho người thực thi:** KỸ NĂNG BẮT BUỘC: dùng `superpowers:subagent-driven-development`
> (khuyến nghị) hoặc `superpowers:executing-plans` để làm từng việc. Các bước dùng ô
> đánh dấu (`- [ ]`).

**Mục tiêu:** Nhóm đề tài tự gán nhãn, tự huấn luyện một mô hình hồi quy logistic đoán
ý định mỗi tin nhắn của học sinh (6 nhãn), chạy trên trình duyệt ở chế độ BÓNG — chỉ
ghi kết quả vào `chats`, không đổi hành vi gia sư — và so được độ chính xác với các luật
regex đang chạy (`BE_TAC`, dấu hiệu phòng thi).

**Kiến trúc:** Python (scikit-learn, chạy trên máy hoặc Google Colab) học TF-IDF 1–2 từ +
`LogisticRegression` đa lớp, xuất trọng số ra JSON. TypeScript thuần tái hiện đúng phép
tính (chuẩn hoá → n-gram → TF-IDF chuẩn L2 → softmax), kiểm khớp với xác suất
scikit-learn trên tệp mẫu. Trình duyệt nạp JSON một lần từ `public/mo-hinh/`, đoán tin
của em và gắn `y_dinh` vào tin nhắn trước khi lưu. Không gọi mạng ngoài, không tốn lượt AI.

**Ngăn xếp:** Python 3.12 + scikit-learn ≥ 1.5 + numpy (chỉ cho huấn luyện), TypeScript 5.8,
`tsx` cho script `.mts`. Không thêm gói npm.

**Spec:** thiết kế bàn trong phiên 01–02/10/2026 (ghi lại ở mục "Bối cảnh" dưới đây); chưa
có tệp spec riêng. Quyết định đã chốt: hồi quy logistic, TF-IDF, xuất JSON, chạy bóng
trước, so với regex; dữ liệu do nhóm tự viết + 40 câu tấn công, KHÔNG dùng chat thật.

## Bối cảnh

Máy trạng thái hiện quyết bằng regex viết tay (`pedagogicalStateMachine.ts`): `BE_TAC`
(dòng 27) bỏ sót "thôi e chịu", "hết cứu"; `DAU_HIEU_PHONG_THI` chỉ bắt vài mẫu câu. Một
mô hình do nhóm tự huấn luyện, đo được precision/recall so với regex, là thành phần
"tự train thật" cho đề tài — miễn phí, giải thích được (hệ số theo từng cụm từ).

**Chạy bóng** để không chạm dữ liệu thực nghiệm lớp 11A3: mô hình chỉ ghi nhãn đoán;
quyết định giàn giáo/chặn gian lận vẫn do regex. Bật cho mô hình quyết định là việc SAU,
cần chủ nhiệm đề tài đồng ý.

## Ràng buộc toàn cục

- Nhánh mới `phan-loai-y-dinh` tách từ `du-phong-gia-su`. Không `npm run build`, không push, không deploy.
- Sáu nhãn, viết đúng thế này, cùng thứ tự: `hoi_khai_niem`, `be_tac`, `xin_dap_an`, `nop_bai_lam`, `gian_lan_phong_thi`, `ngoai_mon`.
- Chuẩn hoá hai bên PHẢI y hệt: chữ thường → NFD → bỏ dấu loại `Mn` → `đ`→`d` → mọi chuỗi ký tự ngoài `[a-z0-9]` thành một dấu cách → cắt hai đầu. Tách từ theo dấu cách, GIỮ từ một ký tự ("k biet"). `PHIEN_BAN_CHUAN_HOA = 1`.
- Đặc trưng: n-gram từ 1–2, đếm thô × idf mượt (`smooth_idf=True`), chuẩn L2. Lớp: `LogisticRegression(class_weight='balanced', max_iter=3000)`, xác suất = softmax(decision_function).
- CHẠY BÓNG: `geminiTutorService.ts`, `pedagogicalStateMachine.ts`, `chuoiDuPhong.ts`, `promptSuPham.ts`, `dungCauLenh.ts` không được import mô-đun phân loại. Nạp mô hình hỏng/chậm (> 1,5 s) thì bỏ qua lặng lẽ.
- KHÔNG dùng tin nhắn thật của học sinh làm dữ liệu (chưa có giấy đồng ý — P1-7). Dữ liệu = câu nhóm tự viết + câu trong `scripts/red-team/cau-tan-cong.json`.
- Không thêm gói npm. Gói Python (`scikit-learn`, `numpy`) do người dùng tự cài hoặc chạy trên Colab.
- Trường mới trong `chats` thêm ở CUỐI CSV; `undefined` không được ghi xuống Firestore (đã có `cleanForFirestore`).
- Bash trên máy này thiếu PATH: đầu mỗi lệnh `export PATH="$PATH:/c/Program Files/nodejs:/usr/bin:/mingw64/bin";`.
- `npm run lint` một lần cuối mỗi việc; `npm run kiem-tra` trước commit cuối.

## Điều kiện trước khi bắt đầu Việc 3

Máy này có Python 3.12 nhưng CHƯA có scikit-learn (đo 02/10/2026). Người dùng chạy
một lần: `python -m pip install --user -r scripts/phan-loai/requirements.txt`
(tệp tạo ở Việc 2). Không cài được trên máy công ty thì Việc 3 Bước 4 chạy trên Colab
và chép ba tệp kết quả về.

## Bản đồ tệp

| Tệp | Việc | Trách nhiệm |
|---|---|---|
| `scripts/phan-loai/chung.py` (mới) | 1 | `NHAN`, `chuan_hoa`, `tach_tu`, `doc_csv_nhan` |
| `scripts/phan-loai/du-lieu/vecto-chuan-hoa.json` (mới) | 1 | Vectơ kiểm chuẩn hoá dùng chung Python/TS |
| `scripts/phan-loai/kiem_tra_chung.py` (mới) | 1 | Python chạy vectơ kiểm |
| `src/features/tutor/services/phanLoaiYDinh.ts` (mới) | 1, 4 | Chuẩn hoá, TF-IDF, softmax — thuần |
| `scripts/kiem-tra-phan-loai.mts` (mới) | 1, 4, 6 | Phép kiểm phía TS |
| `scripts/phan-loai/HUONG-DAN-GAN-NHAN.md`, `du-lieu/nhan.csv`, `du-lieu/mau-nho.csv`, `lay-cau-red-team.py`, `do-dong-thuan.py`, `requirements.txt`, `README.md` (mới) | 2 | Bộ đồ nghề gán nhãn |
| `scripts/phan-loai/huan-luyen.py` (mới) + `du-lieu/mau-*.json` | 3 | Huấn luyện, xuất mô hình, tệp khớp |
| `scripts/danh-gia-phan-loai.mts` (mới) | 5 | So mô hình với regex trên tập kiểm |
| `src/features/tutor/services/yDinhNen.ts` (mới) | 6 | Nạp mô hình + đoán, chạy bóng |
| `src/core/contexts/AppContext.tsx`, `src/features/auth/types.ts`, `src/features/tutor/services/telemetryService.ts`, `scripts/kiem-tra-su-pham.mts` | 6 | Ghi `y_dinh` |
| `package.json` | 1, 5 | `kiem-tra:phan-loai`, `danh-gia:phan-loai` |
| `docs/claude-reference/data.md` | 7 | Ghi trường mới |

---

### Việc 1: Chuẩn hoá đôi Python/TypeScript

**Tệp:**
- Tạo: `scripts/phan-loai/chung.py`, `scripts/phan-loai/kiem_tra_chung.py`, `scripts/phan-loai/du-lieu/vecto-chuan-hoa.json`
- Tạo: `src/features/tutor/services/phanLoaiYDinh.ts` (phần chuẩn hoá)
- Tạo: `scripts/kiem-tra-phan-loai.mts`
- Sửa: `package.json` (thêm `"kiem-tra:phan-loai": "tsx scripts/kiem-tra-phan-loai.mts"`; nối `&& npm run kiem-tra:phan-loai` vào `kiem-tra` ngay sau `npm run kiem-tra:du-phong`)

**Giao diện:**
- Sinh ra (TS): `PHIEN_BAN_CHUAN_HOA = 1`, `chuanHoaYDinh(s: string): string`, `tachTuYDinh(s: string): string[]`
- Sinh ra (Python): `NHAN: list[str]`, `PHIEN_BAN_CHUAN_HOA = 1`, `chuan_hoa(s) -> str`, `tach_tu(s) -> list[str]`, `doc_csv_nhan(tep) -> tuple[list[str], list[str]]`

- [ ] **Bước 1: Viết vectơ kiểm chung `scripts/phan-loai/du-lieu/vecto-chuan-hoa.json`**

```json
[
  { "vao": "Đáp Án Là Gì?", "ra": "dap an la gi" },
  { "vao": "pH = 1,70", "ra": "ph 1 70" },
  { "vao": "k bjk 😭", "ra": "k bjk" },
  { "vao": "  NaOH   0,1M ", "ra": "naoh 0 1m" },
  { "vao": "Tăng nhiệt độ→cân bằng chuyển dịch", "ra": "tang nhiet do can bang chuyen dich" },
  { "vao": "", "ra": "" },
  { "vao": "ỦA, sao vậy???", "ra": "ua sao vay" },
  { "vao": "Hoà tó", "ra": "hoa to" },
  { "vao": "SO₄²⁻ là gì", "ra": "so la gi" },
  { "vao": "ĐƯỢC KHÔNG Ạ", "ra": "duoc khong a" },
  { "vao": "thôi e chịu!!!", "ra": "thoi e chiu" }
]
```

- [ ] **Bước 2: Viết phép kiểm TS trước — tạo `scripts/kiem-tra-phan-loai.mts`**

```ts
/**
 * Kiểm bộ phân loại ý định tự huấn luyện (02/10/2026).
 *
 * Chạy:  npm run kiem-tra:phan-loai
 * Không gọi mạng, không cần Python: so với các tệp mẫu đã xuất sẵn.
 *
 * Điều quan trọng nhất ở đây là phía TypeScript tính RA ĐÚNG như phía Python.
 * Lệch chuẩn hoá một ký tự thì mô hình vẫn chạy, vẫn ra nhãn — chỉ là nhãn sai,
 * và không ai thấy.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chuanHoaYDinh, tachTuYDinh } from '../src/features/tutor/services/phanLoaiYDinh';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');
const docJson = (p: string): unknown => JSON.parse(readFileSync(join(GOC, p), 'utf8'));

let hong = 0;
const ok = (dieu: boolean, ten: string, chiTiet = '') => {
  if (!dieu) hong++;
  console.log(`  ${dieu ? 'OK  ' : 'SAI '} ${ten}${chiTiet ? '  — ' + chiTiet : ''}`);
};

console.log('\n== Chuẩn hoá khớp vectơ chung với Python ==');
{
  const vecto = docJson('scripts/phan-loai/du-lieu/vecto-chuan-hoa.json') as { vao: string; ra: string }[];
  for (const v of vecto) {
    const ra = chuanHoaYDinh(v.vao);
    ok(ra === v.ra, `"${v.vao}" → "${v.ra}"`, ra === v.ra ? '' : `ra "${ra}"`);
  }
  ok(JSON.stringify(tachTuYDinh('k biet')) === '["k","biet"]', 'giữ từ một ký tự ("k biet")');
  ok(tachTuYDinh('   ').length === 0, 'chuỗi trắng thì không có từ nào');
}

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC KHÔNG ĐẠT`) + '\n');
process.exit(hong === 0 ? 0 : 1);
```

(`existsSync` dùng ở Việc 4; `tsc` không báo import thừa với `.mts` chạy bằng tsx — nếu `npm run lint` báo, thêm import ở Việc 4 thay vì bây giờ.)

Thêm hai dòng vào `package.json` như phần **Tệp**.

- [ ] **Bước 3: Chạy để thấy TRƯỢT**

Chạy: `npm run kiem-tra:phan-loai`
Kỳ vọng: lỗi nạp mô-đun `phanLoaiYDinh`.

- [ ] **Bước 4: Viết phần chuẩn hoá của `src/features/tutor/services/phanLoaiYDinh.ts`**

```ts
// ─── Phân loại ý định tin nhắn của em bằng hồi quy logistic (CHẠY BÓNG) ─────
//
// Nhóm đề tài tự gán nhãn và tự huấn luyện (`scripts/phan-loai/huan-luyen.py`),
// xuất trọng số ra JSON; tệp này chỉ làm phép nhân và softmax trên trình duyệt.
// Không gọi mạng, không tốn lượt AI.
//
// CHẠY BÓNG (02/10/2026): kết quả chỉ được GHI vào `chats`, KHÔNG được đổi hành
// vi gia sư. `kiem-tra:phan-loai` canh việc gia sư và máy trạng thái không
// import tệp này.
//
// `chuanHoaYDinh` phải ra ĐÚNG như `chuan_hoa` bên Python
// (`scripts/phan-loai/chung.py`). Lệch một ký tự thì mô hình vẫn ra nhãn — chỉ là
// nhãn sai. Hai bên cùng chạy `scripts/phan-loai/du-lieu/vecto-chuan-hoa.json`.
//
// Tệp thuần, không import gì.

/** Đổi cách chuẩn hoá thì tăng số này: mô hình cũ sẽ bị từ chối thay vì đoán sai. */
export const PHIEN_BAN_CHUAN_HOA = 1;

/** Chữ thường → bỏ dấu → đ thành d → mọi thứ ngoài a-z, 0-9 thành một dấu cách. */
export function chuanHoaYDinh(s: string): string {
  return (s ?? '').toLowerCase().normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Tách theo dấu cách. GIỮ từ một ký tự: "k biet", "e chiu" là cách em gõ thật. */
export function tachTuYDinh(s: string): string[] {
  const t = chuanHoaYDinh(s);
  return t ? t.split(' ') : [];
}
```

- [ ] **Bước 5: Chạy, phải ĐẠT**

Chạy: `npm run kiem-tra:phan-loai && npm run lint`
Kỳ vọng: `>>> TẤT CẢ ĐẠT` (13 dòng OK).

- [ ] **Bước 6: Viết phía Python — `scripts/phan-loai/chung.py`**

```python
"""Phần dùng chung của bộ phân loại ý định (02/10/2026).

`chuan_hoa` PHẢI cho ra đúng như `chuanHoaYDinh()` bên TypeScript
(src/features/tutor/services/phanLoaiYDinh.ts). Lệch một ký tự thì mô hình học
một đằng, trình duyệt đoán một nẻo. Hai bên cùng chạy du-lieu/vecto-chuan-hoa.json.
"""
import csv
import re
import sys
import unicodedata

PHIEN_BAN_CHUAN_HOA = 1

# Sáu nhãn — thứ tự cố định, dùng cho báo cáo và ma trận nhầm lẫn.
NHAN = ['hoi_khai_niem', 'be_tac', 'xin_dap_an', 'nop_bai_lam', 'gian_lan_phong_thi', 'ngoai_mon']

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
    X, y = [], []
    with open(tep, encoding='utf-8-sig', newline='') as f:
        for so_dong, r in enumerate(csv.DictReader(f), start=2):
            tin = (r.get('tin_nhan') or '').strip()
            nhan = (r.get('nhan') or '').strip()
            if not tin:
                continue
            if nhan not in NHAN:
                sys.exit(f'{tep} dòng {so_dong}: nhãn lạ "{nhan}". Nhãn hợp lệ: {", ".join(NHAN)}')
            X.append(tin)
            y.append(nhan)
    return X, y
```

`scripts/phan-loai/kiem_tra_chung.py`:

```python
"""Chạy vectơ kiểm chuẩn hoá phía Python. Chạy: python scripts/phan-loai/kiem_tra_chung.py"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from chung import chuan_hoa, tach_tu  # noqa: E402

hong = 0
for v in json.loads((Path(__file__).parent / 'du-lieu' / 'vecto-chuan-hoa.json').read_text(encoding='utf-8')):
    ra = chuan_hoa(v['vao'])
    dat = ra == v['ra']
    hong += 0 if dat else 1
    print(f"  {'OK  ' if dat else 'SAI '} {v['vao']!r} -> {v['ra']!r}" + ('' if dat else f'  — ra {ra!r}'))
dat = tach_tu('k biet') == ['k', 'biet']
hong += 0 if dat else 1
print(f"  {'OK  ' if dat else 'SAI '} giữ từ một ký tự")
print('>>> TẤT CẢ ĐẠT' if hong == 0 else f'>>> CÓ {hong} MỤC KHÔNG ĐẠT')
sys.exit(0 if hong == 0 else 1)
```

- [ ] **Bước 7: Chạy phía Python, phải ĐẠT**

Chạy: `python scripts/phan-loai/kiem_tra_chung.py` (không cần scikit-learn)
Kỳ vọng: `>>> TẤT CẢ ĐẠT`. Lệch dòng nào thì sửa phía SAI so với ràng buộc toàn cục, KHÔNG sửa vectơ cho khớp.

- [ ] **Bước 8: Phá thử, rồi commit**

Tạm bỏ `.replace(/đ/g, 'd')` bên TS → `npm run kiem-tra:phan-loai` phải có `SAI` ở các dòng có "đ". Hoàn lại → ĐẠT.

```bash
git add scripts/phan-loai/chung.py scripts/phan-loai/kiem_tra_chung.py scripts/phan-loai/du-lieu/vecto-chuan-hoa.json src/features/tutor/services/phanLoaiYDinh.ts scripts/kiem-tra-phan-loai.mts package.json
git commit -m "Phan loai y dinh: chuan hoa doi Python/TS va vecto kiem chung"
```

---

### Việc 2: Bộ đồ nghề gán nhãn

**Tệp:**
- Tạo: `scripts/phan-loai/HUONG-DAN-GAN-NHAN.md`, `scripts/phan-loai/README.md`, `scripts/phan-loai/requirements.txt`
- Tạo: `scripts/phan-loai/du-lieu/nhan.csv` (chỉ dòng tiêu đề), `scripts/phan-loai/du-lieu/mau-nho.csv` (60 câu mẫu để thử đường ống)
- Tạo: `scripts/phan-loai/lay-cau-red-team.py`, `scripts/phan-loai/do-dong-thuan.py`

**Giao diện:**
- Dùng: `NHAN`, `doc_csv_nhan` (Việc 1)
- Sinh ra: định dạng CSV `tin_nhan,nhan,nguoi_gan,nguon` (UTF-8 có BOM, để Excel mở không vỡ chữ)

- [ ] **Bước 1: `scripts/phan-loai/requirements.txt`**

```
scikit-learn>=1.5
numpy>=1.26
```

- [ ] **Bước 2: `scripts/phan-loai/HUONG-DAN-GAN-NHAN.md`**

```markdown
# Hướng dẫn gán nhãn ý định tin nhắn

Mỗi tin nhắn của học sinh gửi gia sư nhận ĐÚNG MỘT nhãn. Phân vân giữa hai nhãn thì
chọn theo thứ tự ưu tiên ở cột cuối (số nhỏ thắng), và ghi vào cột `nguoi_gan` tên mình.

| Nhãn | Nghĩa | Ví dụ | Ưu tiên |
|---|---|---|---|
| `gian_lan_phong_thi` | Em nói rõ đang trong giờ kiểm tra/thi và muốn được giúp | "đang kiểm tra 15 phút giải nhanh giúp em" | 1 |
| `xin_dap_an` | Đòi đáp số/lời giải mà không đưa bài làm của mình | "cho em đáp án luôn đi ạ" | 2 |
| `nop_bai_lam` | Đưa ra kết quả, bước làm, hay lựa chọn của mình để được xem | "em ra pH = 1,7 đúng không ạ" | 3 |
| `be_tac` | Buông, không biết bắt đầu, không đưa ý gì | "thôi e chịu", "hết cứu" | 4 |
| `hoi_khai_niem` | Hỏi kiến thức, hỏi vì sao, hỏi khái niệm Hoá | "vì sao xúc tác không đổi Kc" | 5 |
| `ngoai_mon` | Chào hỏi, cảm ơn, tâm sự, hỏi môn khác, hỏi về gia sư | "chào thầy", "giải giúp bài Toán" | 6 |

## Quy tắc
1. **KHÔNG chép tin nhắn thật của học sinh** (chưa có giấy đồng ý). Tự viết theo cách
   học sinh lớp 11 gõ thật: không dấu, viết tắt (k, ko, e, dc), teencode, sai chính tả.
2. Mỗi nhãn ít nhất 50 câu; tổng 300–600 câu. Viết đa dạng, đừng chỉ đổi một chữ.
3. Hai người gán nhãn ĐỘC LẬP trên cùng danh sách câu (mỗi người một tệp), rồi chạy
   `python scripts/phan-loai/do-dong-thuan.py a.csv b.csv` để đo kappa. Câu bất đồng thì
   ngồi lại thống nhất, ghi kết quả cuối vào `du-lieu/nhan.csv`.
4. Cột `nguon`: `tu-viet` hoặc `red-team:<id>`.
```

- [ ] **Bước 3: `scripts/phan-loai/du-lieu/nhan.csv`** — chỉ một dòng tiêu đề, ghi bằng UTF-8 có BOM:

```
tin_nhan,nhan,nguoi_gan,nguon
```

- [ ] **Bước 4: `scripts/phan-loai/du-lieu/mau-nho.csv`** — 60 câu MẪU chỉ để thử đường ống (KHÔNG dùng làm mô hình thật). UTF-8 có BOM, cột `tin_nhan,nhan,nguoi_gan,nguon`, `nguoi_gan` = `mau`, `nguon` = `tu-viet`. Đúng 10 câu mỗi nhãn:

- `hoi_khai_niem`: "Thầy ơi cân bằng hoá học là gì ạ"; "Tại sao thêm xúc tác thì Kc không đổi"; "em chua hieu nguyen ly Le Chatelier lam"; "pH là gì vậy thầy"; "Axit theo Bronsted khác Arrhenius chỗ nào"; "Vì sao nitơ kém hoạt động ở nhiệt độ thường"; "ankan có phản ứng cộng không ạ"; "liên kết ba trong N2 bền thế nào ạ"; "Hằng số Kc phụ thuộc vào yếu tố nào"; "sao benzen lại khó cộng hơn etilen"
- `be_tac`: "không biết"; "em chịu"; "bí quá thầy ơi"; "k biết làm"; "hông hiểu gì hết"; "thôi em chịu luôn"; "em bó tay rồi"; "ko nghĩ ra"; "e chả biết bắt đầu từ đâu"; "hết cứu rồi thầy"
- `xin_dap_an`: "cho em đáp án luôn đi ạ"; "giải hộ em bài này với"; "đáp số là bao nhiêu thầy"; "thầy cho em kết quả cuối thôi"; "làm giúp em câu 3 nhé"; "em cần lời giải đầy đủ ngay"; "nói thẳng pH bằng mấy đi"; "cho xin đáp án trắc nghiệm câu 5"; "giải nhanh giùm em"; "đừng hỏi nữa cho em đáp số"
- `nop_bai_lam`: "em tính được pH bằng 1,7 đúng không ạ"; "em ra Kc = 4 thầy xem giúp"; "em làm thế này: nHCl = 0,01 mol, đúng chưa"; "kết quả của em là 2,24 lít có sai không"; "em nghĩ cân bằng dịch sang phải vì tăng áp suất"; "bước 1 em viết phương trình rồi, thầy kiểm tra hộ"; "em được 0,3 M ạ"; "em chọn đáp án B đúng không thầy"; "em tính số mol NaOH là 0,006"; "như vậy phản ứng toả nhiệt phải không ạ"
- `gian_lan_phong_thi`: "em đang làm bài kiểm tra 15 phút giải nhanh giúp em"; "cô sắp thu bài rồi thầy ơi"; "đang thi giữa kì cứu em với"; "sắp hết giờ nộp bài rồi"; "trong phòng thi em không làm được câu này"; "kiểm tra 45 phút còn 5 phút"; "giám thị đang đi qua cho em đáp án nhanh"; "em đang thi online gửi đáp án gấp"; "thầy ơi cô chuẩn bị thu bài"; "đang làm kiểm tra cuối kì giúp em câu 2"
- `ngoai_mon`: "chào thầy"; "hôm nay trời đẹp quá"; "thầy có biết đá bóng không"; "giải giúp em bài toán đạo hàm"; "em buồn quá"; "kể chuyện cười đi"; "cảm ơn thầy nhé"; "bài hát nào hay nhất"; "em muốn hỏi tiếng Anh"; "thầy là ai vậy"

Câu có dấu phẩy phải nằm trong ngoặc kép theo chuẩn CSV. Viết tệp bằng Python `csv.writer` (encoding `utf-8-sig`) để khỏi sai trích dẫn.

- [ ] **Bước 5: `scripts/phan-loai/lay-cau-red-team.py`**

```python
"""Lấy tin nhắn của 40 câu tấn công làm câu CHƯA GÁN NHÃN.

Chạy: python scripts/phan-loai/lay-cau-red-team.py
Ra:   scripts/phan-loai/du-lieu/chua-gan-red-team.csv (cột nhan để trống cho người gán)

Đây là câu do nhóm soạn để thử gia sư, không phải tin của học sinh thật — dùng được.
"""
import csv
import json
from pathlib import Path

GOC = Path(__file__).resolve().parents[2]
vao = json.loads((GOC / 'scripts' / 'red-team' / 'cau-tan-cong.json').read_text(encoding='utf-8'))
ra = GOC / 'scripts' / 'phan-loai' / 'du-lieu' / 'chua-gan-red-team.csv'

da_co, dong = set(), []
for muc in vao:
    if not isinstance(muc, dict) or 'id' not in muc:
        continue   # bỏ mục ghi chú đầu tệp
    cac_tin = muc.get('luot') or ([muc['tin']] if muc.get('tin') else [])
    for tin in cac_tin:
        tin = (tin.get('tin') if isinstance(tin, dict) else tin) or ''
        tin = tin.strip()
        if tin and tin not in da_co:
            da_co.add(tin)
            dong.append([tin, '', '', f"red-team:{muc['id']}"])

with open(ra, 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f)
    w.writerow(['tin_nhan', 'nhan', 'nguoi_gan', 'nguon'])
    w.writerows(dong)
print(f'Đã ghi {len(dong)} câu chưa gán nhãn: {ra.relative_to(GOC)}')
```

- [ ] **Bước 6: `scripts/phan-loai/do-dong-thuan.py`**

```python
"""Đo độ đồng thuận giữa hai người gán nhãn (Cohen's kappa).

Chạy: python scripts/phan-loai/do-dong-thuan.py nguoi1.csv nguoi2.csv
Ra:   in kappa, tỉ lệ trùng; ghi các câu bất đồng ra du-lieu/bat-dong.csv để ngồi bàn lại.

Đọc kappa (Landis & Koch 1977): < 0,4 kém — viết lại hướng dẫn; 0,4–0,6 vừa;
0,6–0,8 tốt; > 0,8 rất tốt. Báo cáo đề tài ghi kappa TRƯỚC khi thống nhất.
"""
import csv
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from chung import NHAN, doc_csv_nhan  # noqa: E402

if len(sys.argv) != 3:
    sys.exit('Cách chạy: python scripts/phan-loai/do-dong-thuan.py nguoi1.csv nguoi2.csv')
from sklearn.metrics import cohen_kappa_score  # noqa: E402

a = dict(zip(*doc_csv_nhan(sys.argv[1])))
b = dict(zip(*doc_csv_nhan(sys.argv[2])))
chung = [t for t in a if t in b]
if not chung:
    sys.exit('Hai tệp không có câu nào trùng nhau — hai người phải gán CÙNG danh sách câu.')
y1, y2 = [a[t] for t in chung], [b[t] for t in chung]
trung = sum(p == q for p, q in zip(y1, y2))
print(f'Số câu chung: {len(chung)} (bỏ {len(a) - len(chung)} / {len(b) - len(chung)} câu chỉ một người có)')
print(f'Trùng nhãn: {trung}/{len(chung)} = {trung / len(chung):.1%}')
print(f"Cohen's kappa: {cohen_kappa_score(y1, y2, labels=NHAN):.3f}")
ra = Path(__file__).parent / 'du-lieu' / 'bat-dong.csv'
with open(ra, 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f)
    w.writerow(['tin_nhan', 'nhan_1', 'nhan_2'])
    w.writerows([t, a[t], b[t]] for t in chung if a[t] != b[t])
print(f'Câu bất đồng: {len(chung) - trung} — ghi ở {ra.name}')
```

- [ ] **Bước 7: `scripts/phan-loai/README.md`**

```markdown
# Bộ phân loại ý định — chạy thế nào

1. Gán nhãn theo `HUONG-DAN-GAN-NHAN.md` (Google Sheets → tải CSV). Lấy thêm câu từ bộ
   tấn công: `python scripts/phan-loai/lay-cau-red-team.py`.
2. Đo đồng thuận: `python scripts/phan-loai/do-dong-thuan.py a.csv b.csv`; thống nhất, ghi `du-lieu/nhan.csv`.
3. Huấn luyện: `python scripts/phan-loai/huan-luyen.py` → ghi `public/mo-hinh/phan-loai-y-dinh.json`
   và `scripts/phan-loai/ket-qua/`.
4. So với luật regex: `npm run danh-gia:phan-loai`.

**Trên Google Colab** (máy công ty không cài được Python): tải cả thư mục `scripts/phan-loai`
lên, chạy `!pip install -r requirements.txt`, rồi
`!python huan-luyen.py --vao du-lieu/nhan.csv --ra phan-loai-y-dinh.json --kiem ket-qua`,
tải `phan-loai-y-dinh.json` về `public/mo-hinh/` và thư mục `ket-qua` về `scripts/phan-loai/`.
```

- [ ] **Bước 8: Chạy thử rồi commit**

Chạy: `python scripts/phan-loai/lay-cau-red-team.py` → in số câu > 0; mở `chua-gan-red-team.csv` bằng Excel xem tiếng Việt không vỡ. `python -c "import sys; sys.path.insert(0,'scripts/phan-loai'); from chung import doc_csv_nhan; X,y=doc_csv_nhan('scripts/phan-loai/du-lieu/mau-nho.csv'); print(len(X), sorted(set(y)))"` → `60` và đủ 6 nhãn.

```bash
git add scripts/phan-loai
git commit -m "Phan loai y dinh: huong dan gan nhan, du lieu mau, lay cau red-team, do kappa"
```

---

### Việc 3: Script huấn luyện và tệp mẫu để kiểm khớp

**Tệp:**
- Tạo: `scripts/phan-loai/huan-luyen.py`
- Tạo (sinh ra bằng chạy script trên dữ liệu mẫu, rồi commit): `scripts/phan-loai/du-lieu/mau-mo-hinh.json`, `scripts/phan-loai/du-lieu/mau-du-doan.json`, `scripts/phan-loai/du-lieu/mau-tap-kiem.json`

**Giao diện:**
- Dùng: `NHAN`, `tach_tu`, `doc_csv_nhan`, `PHIEN_BAN_CHUAN_HOA` (Việc 1)
- Sinh ra: tệp mô hình JSON `{ phien_ban, chuan_hoa_phien_ban, nhan: string[], tu_vung: {cụm: chỉ số}, idf: number[], he_so: number[][], chan: number[], so_do: {...} }` (`nhan` theo thứ tự `clf.classes_`, tức thứ tự chữ cái); tệp khớp `[{ tin, xac_suat: number[] }]`; tập kiểm `[{ tin_nhan, nhan }]`

- [ ] **Bước 1: Viết `scripts/phan-loai/huan-luyen.py`**

```python
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
```

- [ ] **Bước 2: Kiểm điều kiện, rồi chạy trên dữ liệu mẫu**

Chạy: `python -c "import sklearn, numpy; print(sklearn.__version__)"`. Báo `ModuleNotFoundError` thì DỪNG và báo người dùng (xem "Điều kiện trước khi bắt đầu Việc 3") — không tự cài.

Chạy (từ gốc repo):

```bash
python scripts/phan-loai/huan-luyen.py --vao scripts/phan-loai/du-lieu/mau-nho.csv --ra scripts/phan-loai/du-lieu/mau-mo-hinh.json --kiem scripts/phan-loai/du-lieu --tien-to mau- --min-df 1
```

Kỳ vọng: in số câu `60`, C tốt nhất, độ chính xác tập kiểm (12 câu — số nhỏ, chỉ để thử đường ống), 6 dòng cụm từ; ba tệp `mau-mo-hinh.json`, `mau-du-doan.json`, `mau-tap-kiem.json` xuất hiện trong `scripts/phan-loai/du-lieu/`. Mở `mau-mo-hinh.json` xác nhận `nhan` có 6 phần tử theo thứ tự chữ cái và `he_so[0].length === idf.length`.

- [ ] **Bước 3: Commit**

```bash
git add scripts/phan-loai/huan-luyen.py scripts/phan-loai/du-lieu/mau-mo-hinh.json scripts/phan-loai/du-lieu/mau-du-doan.json scripts/phan-loai/du-lieu/mau-tap-kiem.json
git commit -m "Phan loai y dinh: script huan luyen logistic va mo hinh mau de kiem khop"
```

---

### Việc 4: Đoán trên TypeScript, khớp với scikit-learn

**Tệp:**
- Sửa: `src/features/tutor/services/phanLoaiYDinh.ts` (thêm phần đoán)
- Kiểm: `scripts/kiem-tra-phan-loai.mts`

**Giao diện:**
- Dùng: tệp mẫu của Việc 3
- Sinh ra: `interface MoHinhYDinh { phien_ban: string; chuan_hoa_phien_ban: number; nhan: string[]; tu_vung: Record<string, number>; idf: number[]; he_so: number[][]; chan: number[] }`; `interface KetQuaYDinh { nhan: string; xacSuat: number; phanBo: number[] }`; `laMoHinhHopLe(m: unknown): m is MoHinhYDinh`; `vectoTfidf(m, s): Map<number, number>`; `duDoanYDinh(m, s): KetQuaYDinh`

- [ ] **Bước 1: Viết phép kiểm trước**

Trong `scripts/kiem-tra-phan-loai.mts`, đổi dòng import thành
`import { chuanHoaYDinh, tachTuYDinh, duDoanYDinh, laMoHinhHopLe, type MoHinhYDinh } from '../src/features/tutor/services/phanLoaiYDinh';`
và thêm TRƯỚC dòng tổng kết:

```ts
/** So xác suất TS với xác suất scikit-learn đã xuất sẵn. Sai số cho phép 1e-4
    vì trọng số được làm tròn 6 chữ số khi xuất. */
const soKhop = (tepMoHinh: string, tepDuDoan: string, ten: string) => {
  const m = docJson(tepMoHinh);
  ok(laMoHinhHopLe(m), `${ten}: tệp mô hình đúng hình dạng`);
  if (!laMoHinhHopLe(m)) return;
  const mau = docJson(tepDuDoan) as { tin: string; xac_suat: number[] }[];
  let lechMax = 0;
  let khacNhan = 0;
  for (const c of mau) {
    const kq = duDoanYDinh(m, c.tin);
    kq.phanBo.forEach((p, k) => { lechMax = Math.max(lechMax, Math.abs(p - c.xac_suat[k])); });
    const kPy = c.xac_suat.indexOf(Math.max(...c.xac_suat));
    if (m.nhan[kPy] !== kq.nhan) khacNhan++;
  }
  ok(lechMax < 1e-4, `${ten}: xác suất TS khớp scikit-learn trên ${mau.length} câu`, `lệch lớn nhất ${lechMax.toExponential(2)}`);
  ok(khacNhan === 0, `${ten}: cùng nhãn đoán ở mọi câu`, `${khacNhan} câu khác nhãn`);
};

console.log('\n== Đoán trên TypeScript khớp scikit-learn ==');
soKhop('scripts/phan-loai/du-lieu/mau-mo-hinh.json', 'scripts/phan-loai/du-lieu/mau-du-doan.json', 'mô hình mẫu');
if (existsSync(join(GOC, 'public/mo-hinh/phan-loai-y-dinh.json')) && existsSync(join(GOC, 'scripts/phan-loai/ket-qua/du-doan.json'))) {
  soKhop('public/mo-hinh/phan-loai-y-dinh.json', 'scripts/phan-loai/ket-qua/du-doan.json', 'mô hình thật');
} else {
  console.log('  BỎ QUA  chưa có mô hình thật (nhóm chưa gán nhãn và huấn luyện)');
}

console.log('\n== Tệp mô hình hỏng thì từ chối, không đoán bừa ==');
{
  const m = docJson('scripts/phan-loai/du-lieu/mau-mo-hinh.json') as MoHinhYDinh;
  ok(!laMoHinhHopLe(null), 'null');
  ok(!laMoHinhHopLe({ ...m, chuan_hoa_phien_ban: 2 }), 'khác phiên bản chuẩn hoá');
  ok(!laMoHinhHopLe({ ...m, chan: m.chan.slice(1) }), 'thiếu hệ số chặn');
  ok(!laMoHinhHopLe({ ...m, he_so: m.he_so.map(h => h.slice(1)) }), 'hệ số lệch số cột với idf');
  ok(laMoHinhHopLe(JSON.parse(JSON.stringify(m))), 'tệp đúng thì nhận');
  const kq = duDoanYDinh(m, 'constructor toString __proto__');
  ok(Number.isFinite(kq.xacSuat), 'từ trùng tên thuộc tính JS không làm hỏng phép đoán');
  ok(Math.abs(duDoanYDinh(m, '').phanBo.reduce((a, b) => a + b, 0) - 1) < 1e-9, 'tin rỗng vẫn ra phân bố tổng bằng 1');
}
```

- [ ] **Bước 2: Chạy để thấy TRƯỢT**

Chạy: `npm run kiem-tra:phan-loai` → lỗi biên dịch `duDoanYDinh` chưa có.

- [ ] **Bước 3: Viết phần đoán — thêm vào cuối `phanLoaiYDinh.ts`**

```ts
export interface MoHinhYDinh {
  phien_ban: string;
  chuan_hoa_phien_ban: number;
  /** Thứ tự nhãn của hàng `he_so` — thứ tự scikit-learn (chữ cái), không phải thứ tự hướng dẫn */
  nhan: string[];
  /** Cụm 1–2 từ → chỉ số cột */
  tu_vung: Record<string, number>;
  idf: number[];
  he_so: number[][];
  chan: number[];
}

export interface KetQuaYDinh {
  nhan: string;
  xacSuat: number;
  /** Xác suất từng nhãn, cùng thứ tự `MoHinhYDinh.nhan` */
  phanBo: number[];
}

/** Kiểm hình dạng tệp mô hình trước khi dùng — tệp hỏng thì thôi, đừng đoán bừa. */
export function laMoHinhHopLe(m: unknown): m is MoHinhYDinh {
  const x = m as MoHinhYDinh | null;
  if (!x || typeof x !== 'object') return false;
  if (x.chuan_hoa_phien_ban !== PHIEN_BAN_CHUAN_HOA || typeof x.phien_ban !== 'string') return false;
  if (!Array.isArray(x.nhan) || x.nhan.length < 2) return false;
  if (!x.tu_vung || typeof x.tu_vung !== 'object' || !Array.isArray(x.idf)) return false;
  if (!Array.isArray(x.chan) || x.chan.length !== x.nhan.length) return false;
  if (!Array.isArray(x.he_so) || x.he_so.length !== x.nhan.length) return false;
  return x.he_so.every(h => Array.isArray(h) && h.length === x.idf.length);
}

/**
 * Vectơ TF-IDF thưa, đúng như TfidfVectorizer(ngram_range=(1, 2), smooth_idf=True,
 * norm='l2') của scikit-learn: đếm thô từng cụm × idf, rồi chia cho độ dài L2.
 */
export function vectoTfidf(m: MoHinhYDinh, s: string): Map<number, number> {
  const tu = tachTuYDinh(s);
  const cum = [...tu];
  for (let i = 0; i + 1 < tu.length; i++) cum.push(`${tu[i]} ${tu[i + 1]}`);
  const v = new Map<number, number>();
  for (const c of cum) {
    /* Object.hasOwn: "constructor", "__proto__" là từ em gõ được, không phải chỉ số. */
    if (!Object.hasOwn(m.tu_vung, c)) continue;
    const i = m.tu_vung[c];
    v.set(i, (v.get(i) ?? 0) + 1);
  }
  let binhPhuong = 0;
  for (const [i, dem] of v) {
    const w = dem * m.idf[i];
    v.set(i, w);
    binhPhuong += w * w;
  }
  const doDai = Math.sqrt(binhPhuong);
  if (doDai > 0) for (const [i, w] of v) v.set(i, w / doDai);
  return v;
}

/** Xác suất = softmax(hệ số · vectơ + chặn) — đúng `predict_proba` đa thức của scikit-learn. */
export function duDoanYDinh(m: MoHinhYDinh, s: string): KetQuaYDinh {
  const v = vectoTfidf(m, s);
  const z = m.chan.map((chan, k) => {
    let t = chan;
    for (const [i, x] of v) t += m.he_so[k][i] * x;
    return t;
  });
  const lon = Math.max(...z);
  const mu = z.map(t => Math.exp(t - lon));
  const tong = mu.reduce((a, b) => a + b, 0);
  const phanBo = mu.map(t => t / tong);
  let k = 0;
  for (let j = 1; j < phanBo.length; j++) if (phanBo[j] > phanBo[k]) k = j;
  return { nhan: m.nhan[k], xacSuat: phanBo[k], phanBo };
}
```

- [ ] **Bước 4: Chạy, phải ĐẠT; phá thử; commit**

Chạy: `npm run kiem-tra:phan-loai && npm run lint` → ĐẠT, dòng "mô hình thật" là `BỎ QUA`.
Phá thử: tạm bỏ bước chia `doDai` → dòng "khớp scikit-learn" phải `SAI`. Hoàn lại → ĐẠT.

```bash
git add src/features/tutor/services/phanLoaiYDinh.ts scripts/kiem-tra-phan-loai.mts
git commit -m "Phan loai y dinh: doan tren TypeScript, khop xac suat scikit-learn"
```

---

### Việc 5: So mô hình với luật regex

**Tệp:**
- Tạo: `scripts/danh-gia-phan-loai.mts`
- Sửa: `package.json` (thêm `"danh-gia:phan-loai": "tsx scripts/danh-gia-phan-loai.mts"` — KHÔNG nối vào `kiem-tra`)

**Giao diện:**
- Dùng: `duDoanYDinh`, `laMoHinhHopLe` (Việc 4); `laTinBeTac`, `laNguCanhGianLanPhongThi` (`pedagogicalStateMachine.ts`); tập kiểm JSON (Việc 3)

- [ ] **Bước 1: Viết `scripts/danh-gia-phan-loai.mts`**

```ts
/**
 * So bộ phân loại tự huấn luyện với luật regex đang chạy, trên TẬP KIỂM —
 * 20 % câu mà mô hình không thấy lúc học.
 *
 * Chạy:  npm run danh-gia:phan-loai                (mô hình thật, sau khi huấn luyện)
 *        npm run danh-gia:phan-loai -- --mau       (mô hình mẫu, để thử đường ống)
 *
 * In bảng Markdown để dán vào báo cáo, và ghi ra scripts/phan-loai/ket-qua/so-sanh.md
 * (hoặc du-lieu/mau-so-sanh.md với --mau).
 *
 * Regex chỉ có ý kiến về HAI nhãn (bế tắc, gian lận phòng thi), nên so từng nhãn
 * theo kiểu có/không. Bốn nhãn kia chỉ mô hình làm được — báo riêng.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { duDoanYDinh, laMoHinhHopLe } from '../src/features/tutor/services/phanLoaiYDinh';
import { laTinBeTac, laNguCanhGianLanPhongThi } from '../src/features/tutor/services/pedagogicalStateMachine';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');
const mau = process.argv.includes('--mau');
const tepMoHinh = mau ? 'scripts/phan-loai/du-lieu/mau-mo-hinh.json' : 'public/mo-hinh/phan-loai-y-dinh.json';
const tepKiem = mau ? 'scripts/phan-loai/du-lieu/mau-tap-kiem.json' : 'scripts/phan-loai/ket-qua/tap-kiem.json';
const tepRa = mau ? 'scripts/phan-loai/du-lieu/mau-so-sanh.md' : 'scripts/phan-loai/ket-qua/so-sanh.md';

const m: unknown = JSON.parse(readFileSync(join(GOC, tepMoHinh), 'utf8'));
if (!laMoHinhHopLe(m)) { console.error(`${tepMoHinh} không đúng hình dạng mô hình.`); process.exit(1); }
const cau = JSON.parse(readFileSync(join(GOC, tepKiem), 'utf8')) as { tin_nhan: string; nhan: string }[];
const doan = cau.map(c => duDoanYDinh(m, c.tin_nhan).nhan);

const pct = (x: number) => (x * 100).toFixed(1).replace('.', ',') + ' %';
/** precision, recall, F1 cho bài toán có/không. */
const prf = (that: boolean[], du: boolean[]) => {
  let tp = 0, fp = 0, fn = 0;
  that.forEach((t, i) => { if (t && du[i]) tp++; else if (!t && du[i]) fp++; else if (t && !du[i]) fn++; });
  const p = tp + fp ? tp / (tp + fp) : 0;
  const r = tp + fn ? tp / (tp + fn) : 0;
  return { p, r, f1: p + r ? 2 * p * r / (p + r) : 0, tp, fp, fn };
};

const dong: string[] = [];
const dung = doan.filter((d, i) => d === cau[i].nhan).length;
dong.push(`# So sánh bộ phân loại tự huấn luyện với luật regex`, '',
  `Mô hình \`${m.phien_ban}\`, tập kiểm ${cau.length} câu (máy không thấy lúc học).`, '',
  `Độ chính xác 6 nhãn của mô hình: **${pct(dung / cau.length)}** (${dung}/${cau.length}).`, '',
  '| Nhãn | Cách | Precision | Recall | F1 | Bắt đúng | Báo nhầm | Bỏ sót |',
  '|---|---|---|---|---|---|---|---|');
const so = (nhan: string, luat: (s: string) => boolean) => {
  const that = cau.map(c => c.nhan === nhan);
  for (const [cach, du] of [['regex', cau.map(c => luat(c.tin_nhan))], ['mô hình', doan.map(d => d === nhan)]] as const) {
    const k = prf(that, du as boolean[]);
    dong.push(`| ${nhan} | ${cach} | ${pct(k.p)} | ${pct(k.r)} | ${pct(k.f1)} | ${k.tp} | ${k.fp} | ${k.fn} |`);
  }
};
so('be_tac', laTinBeTac);
so('gian_lan_phong_thi', laNguCanhGianLanPhongThi);
dong.push('', '## Bốn nhãn chỉ mô hình làm được', '', '| Nhãn | Precision | Recall | F1 |', '|---|---|---|---|');
for (const nhan of ['hoi_khai_niem', 'xin_dap_an', 'nop_bai_lam', 'ngoai_mon']) {
  const k = prf(cau.map(c => c.nhan === nhan), doan.map(d => d === nhan));
  dong.push(`| ${nhan} | ${pct(k.p)} | ${pct(k.r)} | ${pct(k.f1)} |`);
}
dong.push('', `_Tập kiểm nhỏ thì mỗi câu đổi vài điểm phần trăm — ghi kèm số câu khi trích._`);

const ra = dong.join('\n') + '\n';
mkdirSync(dirname(join(GOC, tepRa)), { recursive: true });
writeFileSync(join(GOC, tepRa), ra, 'utf8');
console.log(ra);
console.log(`Đã ghi ${tepRa}`);
```

- [ ] **Bước 2: Chạy trên mô hình mẫu, rồi commit**

Chạy: `npm run danh-gia:phan-loai -- --mau && npm run lint`
Kỳ vọng: in bảng có 2 nhãn × 2 cách + 4 nhãn; ghi `scripts/phan-loai/du-lieu/mau-so-sanh.md`. Số liệu mẫu không có ý nghĩa (12 câu) — chỉ xác nhận đường ống chạy.

```bash
git add scripts/danh-gia-phan-loai.mts package.json scripts/phan-loai/du-lieu/mau-so-sanh.md
git commit -m "Phan loai y dinh: so mo hinh voi luat regex tren tap kiem"
```

---

### Việc 6: Chạy bóng trong app, ghi `y_dinh`

**Tệp:**
- Tạo: `src/features/tutor/services/yDinhNen.ts`
- Sửa: `src/core/contexts/AppContext.tsx` (khối dựng `userMsg`, khoảng dòng 1245–1257)
- Sửa: `src/features/auth/types.ts` (`ChatMessage`), `src/features/tutor/services/telemetryService.ts` (`COT_CSV`, `xuatCsv`)
- Kiểm: `scripts/kiem-tra-phan-loai.mts`, `scripts/kiem-tra-su-pham.mts`

**Giao diện:**
- Dùng: `duDoanYDinh`, `laMoHinhHopLe`, `MoHinhYDinh` (Việc 4)
- Sinh ra: `interface NhanYDinhGhi { y_dinh: string; y_dinh_xs: number; y_dinh_phien_ban: string }`, `doanYDinhNen(noiDung: string): Promise<NhanYDinhGhi | undefined>`; `ChatMessage.y_dinh?`, `y_dinh_xs?`, `y_dinh_phien_ban?`

- [ ] **Bước 1: Viết phép kiểm trước**

`scripts/kiem-tra-phan-loai.mts`, thêm trước dòng tổng kết:

```ts
console.log('\n== CHẠY BÓNG: bộ phân loại không được đổi hành vi gia sư ==');
{
  for (const t of ['geminiTutorService.ts', 'pedagogicalStateMachine.ts', 'chuoiDuPhong.ts', 'promptSuPham.ts', 'dungCauLenh.ts']) {
    const ma = readFileSync(join(GOC, 'src/features/tutor/services', t), 'utf8');
    ok(!/phanLoaiYDinh|yDinhNen/.test(ma), `${t} không dùng bộ phân loại`);
  }
  const ctx = readFileSync(join(GOC, 'src/core/contexts/AppContext.tsx'), 'utf8');
  ok((ctx.match(/doanYDinhNen\(/g) ?? []).length === 1, 'AppContext gọi bộ phân loại đúng một chỗ');
  ok(/\.\.\.yDinh\b/.test(ctx), 'kết quả chỉ được trải vào tin nhắn để GHI lại');
  const nen = readFileSync(join(GOC, 'src/features/tutor/services/yDinhNen.ts'), 'utf8');
  ok(nen.includes("'/mo-hinh/phan-loai-y-dinh.json'") && /content-type/i.test(nen),
     'nạp mô hình cùng nguồn và kiểm kiểu nội dung (luật SPA trả index.html kèm 200)');
}
```

`scripts/kiem-tra-su-pham.mts`: đổi phép kiểm CSV đã có
`ok(csv.split('\n')[0].endsWith(',do_dai_noi_dung,nha_cung_cap,duong'), ...)` thành:

```ts
  ok(csv.split('\n')[0].endsWith(',do_dai_noi_dung,nha_cung_cap,duong,y_dinh,y_dinh_xs,y_dinh_phien_ban'),
    'CSV có cột nguồn trả lời, đường đi và ý định — thêm ở CUỐI để không xô lệch cột cũ');
```

- [ ] **Bước 2: Chạy để thấy TRƯỢT**

Chạy: `npm run kiem-tra:phan-loai; npm run kiem-tra:su-pham` → `SAI` ở các dòng mới (hoặc lỗi đọc `yDinhNen.ts` chưa có — bọc `readFileSync` của tệp đó trong `existsSync` nếu cần để thấy đúng một `SAI`).

- [ ] **Bước 3: Viết `src/features/tutor/services/yDinhNen.ts`**

```ts
// ─── Chạy BÓNG bộ phân loại ý định trên trình duyệt (02/10/2026) ────────────
//
// Nạp mô hình MỘT lần rồi đoán ý định tin nhắn của em, để GHI vào `chats`.
// Đây là phép đo cho đề tài, không phải tính năng: mọi lỗi — chưa có mô hình,
// mạng chậm, tệp hỏng — đều bỏ qua lặng lẽ, gia sư chạy y như chưa có tệp này.
//
// Mô hình nằm ở `public/mo-hinh/` (cùng nguồn, CSP `connect-src 'self'` đã cho
// phép). Nhóm huấn luyện lại thì chỉ thay tệp, không phải sửa mã.
import { duDoanYDinh, laMoHinhHopLe, type MoHinhYDinh } from './phanLoaiYDinh';

const DUONG_MO_HINH = '/mo-hinh/phan-loai-y-dinh.json';
/** Chờ nạp tối đa chừng này rồi thôi — không được làm chậm tin nhắn của em. */
const HAN_NAP_MS = 1_500;

let dangNap: Promise<MoHinhYDinh | null> | null = null;

function napMoHinh(): Promise<MoHinhYDinh | null> {
  dangNap ??= fetch(DUONG_MO_HINH)
    .then(async (r) => {
      /* Chưa có tệp thì luật SPA (`_redirects`) trả index.html kèm 200 — phải
         nhìn kiểu nội dung, không tin mã 200. */
      if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) return null;
      const m: unknown = await r.json();
      return laMoHinhHopLe(m) ? m : null;
    })
    .catch(() => null);
  return dangNap;
}

export interface NhanYDinhGhi {
  y_dinh: string;
  /** Xác suất nhãn đoán, làm tròn 3 chữ số */
  y_dinh_xs: number;
  y_dinh_phien_ban: string;
}

export async function doanYDinhNen(noiDung: string): Promise<NhanYDinhGhi | undefined> {
  const m = await Promise.race([
    napMoHinh(),
    new Promise<null>((r) => setTimeout(() => r(null), HAN_NAP_MS)),
  ]);
  if (!m) return undefined;
  const kq = duDoanYDinh(m, noiDung);
  return { y_dinh: kq.nhan, y_dinh_xs: Math.round(kq.xacSuat * 1000) / 1000, y_dinh_phien_ban: m.phien_ban };
}
```

- [ ] **Bước 4: Gắn vào `AppContext.tsx`, `types.ts`, `telemetryService.ts`**

`AppContext.tsx`: thêm import `import { doanYDinhNen } from '../../features/tutor/services/yDinhNen';` (đối chiếu đường dẫn import `generateAIResponseChiTiet` có sẵn trong tệp). Ngay TRƯỚC dòng `const gioiHan = await kiemTraVaGhiNhanLuotGui(laKhach, content);` (để việc nạp mô hình chạy song song với lượt đọc/ghi Firestore của bộ giới hạn, không cộng thêm thời gian chờ):

```ts
    /* Chạy BÓNG bộ phân loại ý định do nhóm tự huấn luyện (02/10/2026): chỉ GHI
       nhãn đoán để so với regex; mọi quyết định vẫn do máy trạng thái. Bắt đầu
       từ đây để chạy song song với bước giới hạn bên dưới. Hỏng hay chậm quá
       1,5 s thì bỏ qua — xem yDinhNen.ts. */
    const huaYDinh = doanYDinhNen(content).catch(() => undefined);
```

Ngay trước `const userMsg: ChatMessage = {`:

```ts
    const yDinh = await huaYDinh;
```

và trong `userMsg`, sau dòng `ngoai_mon: ...`:

```ts
      ...yDinh,
```

`src/features/auth/types.ts`, trong `ChatMessage` sau `duong?`:

```ts
  /** Ý định tin của EM do bộ phân loại logistic nhóm tự huấn luyện đoán (chạy bóng, 02/10/2026) — không đổi hành vi gia sư */
  y_dinh?: string;
  /** Xác suất của nhãn đoán (0–1, 3 chữ số) */
  y_dinh_xs?: number;
  /** Phiên bản tệp mô hình đã đoán — huấn luyện lại thì so theo phiên bản */
  y_dinh_phien_ban?: string;
```

`telemetryService.ts`: thêm `'y_dinh', 'y_dinh_xs', 'y_dinh_phien_ban'` vào CUỐI `COT_CSV`, và `m.y_dinh, m.y_dinh_xs, m.y_dinh_phien_ban,` vào cuối mảng trong `xuatCsv`.

- [ ] **Bước 5: Chạy, phải ĐẠT; commit**

Chạy: `npm run lint && npm run kiem-tra:phan-loai && npm run kiem-tra:su-pham && npm run kiem-tra:an-ninh && npm run kiem-tra:du-phong`
Kỳ vọng: tất cả ĐẠT.

```bash
git add src/features/tutor/services/yDinhNen.ts src/core/contexts/AppContext.tsx src/features/auth/types.ts src/features/tutor/services/telemetryService.ts scripts/kiem-tra-phan-loai.mts scripts/kiem-tra-su-pham.mts
git commit -m "Phan loai y dinh: chay bong trong app, ghi y_dinh vao chats va CSV"
```

---

### Việc 7: Tài liệu

**Tệp:**
- Sửa: `docs/claude-reference/data.md` (mục mô tả trường của `chats`)

- [ ] **Bước 1: Ghi trường mới**

Trong `docs/claude-reference/data.md`, ở chỗ mô tả các trường telemetry của `chats` (tìm `model_name` hoặc `nhan_hong`), thêm:

```markdown
- **`y_dinh`, `y_dinh_xs`, `y_dinh_phien_ban` (02/10/2026)** — chỉ ở tin của EM: nhãn ý
  định do bộ phân loại logistic nhóm tự huấn luyện đoán, CHẠY BÓNG (không đổi hành vi
  gia sư). Mô hình là tệp JSON trong thư mục mo-hinh của public; chưa có tệp thì ba
  trường trống. Cách gán nhãn và huấn luyện: `scripts/phan-loai/README.md`.
```

KHÔNG đặt đường dẫn tệp mô hình trong dấu backtick: `kiem-tra:tai-lieu` đòi mọi đường dẫn trong backtick phải tồn tại, mà tệp đó chỉ có sau khi nhóm huấn luyện.

- [ ] **Bước 2: Kiểm toàn bộ rồi commit**

Chạy: `npm run lint && npm run kiem-tra`
Kỳ vọng: mọi bộ ĐẠT; `BỎ QUA` được phép ở `kiem-tra:dong-bo` (mạng), `kiem-tra:luat` (Java 8), và dòng "mô hình thật" của `kiem-tra:phan-loai`.

```bash
git add docs/claude-reference/data.md
git commit -m "Ghi truong y_dinh cua chats vao tai lieu du lieu"
```

---

## Sau khi xong — việc của NHÓM (không phải của AI)

1. Hai người gán nhãn độc lập theo `scripts/phan-loai/HUONG-DAN-GAN-NHAN.md` (≥ 50 câu/nhãn), chạy `do-dong-thuan.py`, ghi kappa vào báo cáo, thống nhất vào `du-lieu/nhan.csv`.
2. `python scripts/phan-loai/huan-luyen.py` (hoặc trên Colab) → chép mô hình vào `public/mo-hinh/`.
3. `npm run kiem-tra:phan-loai` (dòng "mô hình thật" phải ĐẠT) rồi `npm run danh-gia:phan-loai` → bảng so sánh cho báo cáo.
4. Chủ dự án build và deploy như thường. Muốn cho mô hình QUYẾT ĐỊNH thay regex là bước sau, phải hỏi chủ nhiệm đề tài vì đổi hành vi với lớp thực nghiệm.
