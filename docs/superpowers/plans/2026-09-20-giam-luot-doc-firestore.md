# Giảm lượt đọc Firestore của Luyện tập, Trò chơi và đề theo chương

> **Cho người thực thi:** dùng `superpowers:executing-plans`, làm từng việc một,
> dừng báo sau mỗi việc. Các bước đánh dấu `- [ ]` để theo dõi.

**Mục tiêu:** Một lớp 40 em mở Luyện tập cùng lúc không làm vỡ hạn mức đọc
50.000 lượt/ngày của Firestore bậc miễn phí — và **không sinh ra con số nào có
thể cũ**, tức không thêm chỗ nào để hiểu nhầm.

**Kiến trúc:** Không thêm bản chụp, không thêm tệp đếm, không thêm nguồn dữ liệu
nào. Chỉ **hoãn** lời gọi Firestore lại cho tới khi thật sự cần.

Mấu chốt nằm ở `trangThaiPhan()` trong `logic.ts`: trong sáu trạng thái của một
phần, số câu chỉ quyết định đúng **một** trạng thái là `'thieu-cau'`. Năm cái còn
lại (`da-dat`, `chua-mo`, `dang-khoa`, `can-on-lai`, `san-sang`) tính hoàn toàn
từ tiến độ trong localStorage. Vậy nên:

- **Danh sách bài vẽ được đầy đủ mà không cần biết số câu** → mở tab Luyện tập
  tốn **0 lượt đọc** (nay 1.554).
- **`'thieu-cau'` chuyển sang xác định lúc em bấm vào bài**, bằng số đọc tươi từ
  Firestore đúng bài đó — mà lượt đọc ấy đằng nào cũng phải có, vì còn lấy câu
  để làm.

Vì không có con số nào được lưu sẵn ở đâu, **không có gì cũ được**. Thầy cô nhập
câu hỏi bằng JSON xong là đúng ngay, không phải chụp lại, không phải deploy lại.

**Công nghệ:** React 19, Firebase Firestore v12 (`query` + `where` +
`documentId`), MUI v9.

**Spec:** không có tệp spec riêng; mục "Số đo" ngay dưới là spec.

## Số đo (20/09/2026 — đừng làm lại từ trí nhớ)

**ĐÃ LÀM XONG 20/09/2026.** Đo lại bằng `kiem-tra:e2e` trên trình duyệt thật,
đếm request tới `firestore.googleapis.com`: **mở tab Luyện tập = 0 request; bấm
vào một bài = 1–2 request.** Phép đo đó nay là một phép thử thường trực trong
`tests/hocsinh/luyen-tap.spec.ts`, không phải một lần chạy tay.

| Đường | Lượt đọc HIỆN NAY | Sau khi sửa |
|---|---|---|
| Mở tab Luyện tập | 1.554 | **0** (đo được) |
| Bấm vào một bài | 0 (đã có sẵn trong kho đã tải) | ~80, nhiều nhất 230 — giữ lại cả phiên |
| Mở tab Trò chơi (học sinh) | 1.554 | **0** |
| Mở tab Trò chơi (giáo viên) | 1.554 | 1.554 — cố ý giữ |
| Đề theo CHƯƠNG | 1.554 | ≤583 |
| Đề theo BÀI | ~80 | ~80 — vốn đã đúng |

Ngân hàng: **1.554 tài liệu, 5,74 MB**, trung bình 3.783 byte/câu. Phân bố `t`:
mc 755, tf 599, tn 200. Phân bố `ch`: 1→391, 2→583, 3→484, 4→40, 5→29, 6→27.
19 bài gắn câu, trung bình 80 câu/bài, nhiều nhất `bai-2` 230 câu; 36 câu chưa
gắn `lessonId`.

Hạn mức Spark (tra tài liệu Google 20/09/2026): 50.000 lượt đọc/ngày, 20.000
lượt ghi/ngày, 10 GiB tải xuống/tháng.

**Nghiệm thu:** một lớp 40 em, mỗi em làm 3 bài ≈ 40 × 3 × 80 = **9.600 lượt
đọc**, nằm gọn trong 50.000. Trước khi sửa, chỉ riêng việc 40 em mở tab Luyện
tập đã là 62.160 lượt.

## Đường đã thử và CHẾT — đừng thử lại

**`getCountFromServer` (phép đếm gộp) KHÔNG dùng được trên dự án này.** Đo bằng
chính cấu hình công khai của dự án:

| Phép | Kết quả |
|---|---|
| `getDocs(query(bank_questions, limit(1)))` | **ĐƯỢC**, trả 1 tài liệu |
| `getCountFromServer(bank_questions)` — không lọc | `RESOURCE_EXHAUSTED: Quota exceeded` |
| `getCountFromServer(… where lessonId ==)` | `RESOURCE_EXHAUSTED` |
| `getCountFromServer(… where lessonId ==, where t ==)` | `RESOURCE_EXHAUSTED` |
| `getCountFromServer(classes)` — collection khác | `RESOURCE_EXHAUSTED` |

Đọc thường được, đếm thì không, trên MỌI collection — nên không phải hết hạn mức
ngày, mà là phép đếm gộp không được cấp cho dự án này (gần như chắc vì chưa bật
thanh toán). Trên giấy nó đáng lẽ là đường đẹp nhất: tài liệu Google ghi `count()`
tính 1 lượt đọc mỗi lô 1.000 mục chỉ mục, mà bài nhiều câu nhất chỉ 230.

Dấu vết có người từng vấp: `BankFirestore.getCount()` (`bankStore.ts:101`) đã sẵn
`try/catch` lùi về `getDocs(collection)` — tức **mỗi lần gọi `getCount()` thật ra
tốn 1.554 lượt đọc**. Nay chỉ `DatabankManagement` (màn quản trị) gọi nó, tạm
chấp nhận; ghi lại để ai đọc sau khỏi tưởng nó rẻ.

**Bản chụp tĩnh / tệp đếm sinh sẵn cũng đã cân nhắc rồi BỎ.** Nó cho 0 lượt đọc,
nhưng web deploy bằng kéo-thả `dist/` nên tệp trên `pages.dev` chỉ mới tới lần
deploy gần nhất — thầy cô thêm câu hỏi xong phải build và deploy lại thì con số
mới đúng. Đổi một hạn mức lấy một nguồn hiểu nhầm là lỗ vốn.

## Ràng buộc chung

- **Dự án KHÔNG có bộ chạy test.** Theo CLAUDE.md mục "Ba chỗ superpowers nói
  khác dự án này": "viết test trước" ở đây nghĩa là **viết phép kiểm trước**, thêm
  vào `scripts/kiem-tra-*.mts` có sẵn. Đừng dựng Vitest/Jest.
- **KHÔNG tự chạy `npm run build`, git nguy hiểm, push, deploy.** Commit thì chờ
  chủ dự án bảo.
- `bank_questions` giữ `allow read: if true` — không đụng `firestore.rules`. Kế
  hoạch này KHÔNG cần đổi luật.
- `logic.ts` phải nạp được ngoài trình duyệt (bộ kiểm `kiem-tra:luyen-tap` nạp
  nó bằng tsx). **Tuyệt đối không import gì từ `firebase` vào `logic.ts`** — một
  dòng `import.meta.env` là script sập.
- Sau mỗi việc: `npm run lint` một lần. Trước khi báo xong: `npm run kiem-tra`.

---

### Việc 1: `trangThaiPhan` chạy được khi CHƯA biết số câu

Đây là nền của cả kế hoạch. Làm trước, và phải có phép kiểm ngay.

**Tệp:**
- Sửa: `src/features/practice/logic.ts:213-232` (`trangThaiPhan`)
- Sửa: `scripts/kiem-tra-luyen-tap.mts` (thêm mục kiểm, đặt cạnh mục
  "Thứ tự ba phần trong một bài" quanh dòng 256)

**Giao diện:**
- Đổi: `trangThaiPhan(phan, tienDoBai, soCau?)` — tham số thứ ba thành **tuỳ
  chọn**. `undefined` nghĩa là *"chưa biết bài này có bao nhiêu câu"*, và khi đó
  KHÔNG bao giờ trả `'thieu-cau'`.
- Không đổi gì khác. `demCuaBai`, `moTaThieuCau`, `baiDuCau`, `BangDemCau` giữ
  nguyên — chúng vẫn dùng sau khi đã đọc tươi.

- [ ] **Bước 1: Viết phép kiểm TRƯỚC**

Thêm vào `scripts/kiem-tra-luyen-tap.mts`, ngay sau mục "Thứ tự ba phần trong
một bài":

```ts
// ─── Vẽ danh sách khi CHƯA biết số câu ───────────────────────────────────────
//
// Tab Luyện tập không đọc Firestore lúc mở nữa (1.554 lượt đọc mỗi lần mở là
// quá đắt — xem docs/superpowers/plans/2026-09-20-giam-luot-doc-firestore.md).
// Nên `trangThaiPhan` phải vẽ được khi chưa biết bài có bao nhiêu câu: lúc đó
// nó tính bằng tiến độ, và KHÔNG được kết luận là thiếu câu.
console.log('\n== Vẽ được khi chưa biết số câu ==');
{
  ok(trangThaiPhan('mc', undefined, undefined) === 'san-sang',
     'chưa biết số câu + chưa làm gì -> san-sang',
     `đang ra: ${trangThaiPhan('mc', undefined, undefined)}`);

  ok(trangThaiPhan('tf', undefined, undefined) === 'chua-mo',
     'chưa biết số câu + chưa qua phần trước -> chua-mo',
     `đang ra: ${trangThaiPhan('tf', undefined, undefined)}`);

  const daDat = { mc: { dat: true } } as never;
  ok(trangThaiPhan('mc', daDat, undefined) === 'da-dat',
     'chưa biết số câu + đã đạt -> da-dat');

  // Và phải KHÔNG bao giờ ra 'thieu-cau' khi chưa biết số câu
  const moiTruongHop = THU_TU_PHAN.map(p => trangThaiPhan(p, undefined, undefined));
  ok(!moiTruongHop.includes('thieu-cau'),
     'chưa biết số câu thì không kết luận thiếu câu',
     `đang ra: ${moiTruongHop.join(', ')}`);

  // Còn khi ĐÃ biết số câu thì phải giữ nguyên hành vi cũ
  ok(trangThaiPhan('mc', undefined, { mc: 0, tf: 0, tn: 0 }) === 'thieu-cau',
     'biết số câu = 0 -> vẫn báo thieu-cau như cũ');
}
```

Kiểm `trangThaiPhan` và `THU_TU_PHAN` đã nằm trong khối `import` ở đầu tệp chưa;
chưa thì thêm.

- [ ] **Bước 2: Chạy để thấy nó TRƯỢT**

```bash
npm run kiem-tra:luyen-tap
```

`tsc` sẽ kêu thiếu tham số, hoặc phép kiểm báo `SAI` vì đang ra `thieu-cau`.
ĐẠT ngay từ đầu là phép kiểm hỏng — bài học số 1 trong CLAUDE.md.

- [ ] **Bước 3: Sửa `trangThaiPhan`**

```ts
export function trangThaiPhan(
  phan: PhanLuyenTap,
  tienDoBai: Partial<Record<PhanLuyenTap, TienDoPhan>> | undefined,
  /* `undefined` = CHƯA BIẾT bài này có bao nhiêu câu.
     Danh sách Luyện tập cố ý vẽ trước khi hỏi Firestore, vì hỏi lúc mở tab là
     1.554 lượt đọc cho mỗi em. Chưa biết thì KHÔNG được đoán là thiếu câu —
     đoán sai theo hướng đó là giấu mất bài mà ngân hàng vẫn có đủ câu.
     Số thật được xác định lúc em bấm vào bài, xem `demTuoiCuaBai`. */
  soCau?: Record<PhanLuyenTap, number>,
): TrangThaiPhan {
  const tienDo = tienDoBai?.[phan];
  if (tienDo?.dat) return 'da-dat';
  if (soCau && soCau[phan] < NGUONG_MO_BAI[phan]) return 'thieu-cau';
  ...
```

Phần còn lại của hàm giữ NGUYÊN.

- [ ] **Bước 4: Chạy lại, phải ĐẠT hết**

```bash
npm run lint
npm run kiem-tra:luyen-tap
```

Bộ kiểm này có sẵn nhiều phép về `trangThaiPhan` — **tất cả phải vẫn ĐẠT**.
Trượt phép cũ nào là đã đổi hành vi khi đã biết số câu, quay lại sửa.

- [ ] **Bước 5: Dừng, báo chủ dự án.** Chưa commit.

---

### Việc 2: Luyện tập đọc theo BÀI thay vì tải cả kho

**Tệp:**
- Sửa: `src/features/bank/bankStore.ts` (thêm `getByIds` sau `getByLesson`)
- Sửa: `src/features/practice/practiceService.ts` (thay cả khối "Kho câu hỏi",
  dòng 17–72)

**Giao diện:**
- Dùng: `BankFirestore.getByLesson(lessonId)` — đã có sẵn ở dòng 134.
- Bỏ: `demCauTheoBai()` — không còn ai gọi sau Việc 3.
- Giữ nguyên chữ ký: `layCauChoLuot(lessonId, phan, tienDo)`,
  `layCauTheoId(ids)`, `xoaCacheKho()`.
- Thêm: `demTuoiCuaBai(lessonId): Promise<Record<PhanLuyenTap, number>>`.

- [ ] **Bước 1: Thêm `getByIds` vào `bankStore.ts`**

Đặt ngay sau `getByLesson`:

```ts
  /**
   * Lấy đúng mấy câu theo id. Dùng cho phần "những câu em còn sai".
   *
   * `where(documentId(), 'in', …)` chỉ nhận tối đa 30 giá trị mỗi lượt nên chia
   * lô; danh sách câu sai của một em thường dưới 30, tức một lượt gọi.
   *
   * Trước 20/09/2026 chỗ này tải CẢ ngân hàng rồi lọc — 1.554 lượt đọc để lấy
   * về dăm câu.
   */
  async getByIds(ids: string[]): Promise<BankQuestion[]> {
    if (!ids.length) return [];
    const ra: BankQuestion[] = [];
    for (let i = 0; i < ids.length; i += 30) {
      const lo = ids.slice(i, i + 30);
      try {
        const snap = await getDocs(
          query(collection(db, COL_BANK), where(documentId(), 'in', lo)),
        );
        ra.push(...snap.docs.map(d => chuanHoaCau({ ...(d.data() as BankQuestion), id: d.id })));
      } catch (err) {
        console.error('[Luyện tập] Không đọc được câu theo id', lo, err);
      }
    }
    return ra;
  },
```

Thêm `documentId` vào dòng `import` từ `firebase/firestore` ở đầu tệp.

- [ ] **Bước 2: Thay khối "Kho câu hỏi" của `practiceService.ts`**

Thay TOÀN BỘ từ `let khoDangTai` tới hết `layCauTheoId` bằng:

```ts
// ─── Kho câu hỏi ─────────────────────────────────────────────────────────────
//
// Đọc Firestore THEO TỪNG BÀI, và chỉ khi học sinh thật sự mở bài đó.
//
// Trước 20/09/2026 chỗ này tải cả ngân hàng ngay lúc mở tab Luyện tập, chỉ để
// đếm xem mỗi bài có bao nhiêu câu: 1.554 lượt đọc + 5,74 MB mỗi em mỗi phiên.
// Bậc miễn phí cho 50.000 lượt đọc/NGÀY, tức một lớp 40 em mở cùng một tiết là
// 62.160 lượt — vỡ hạn mức giữa buổi, và cả trường mất ngân hàng tới sáng hôm
// sau.
//
// Danh sách nay vẽ bằng tiến độ trong localStorage, không cần số câu — xem chú
// thích trong `trangThaiPhan` ở logic.ts. Số câu chỉ được hỏi khi em bấm vào
// một bài, và lượt hỏi đó đằng nào cũng phải có vì còn lấy câu để làm.
//
// CỐ Ý không giữ bản sao lâu dài (localStorage/IndexedDB): thầy cô nhập câu mới
// là em thấy ngay ở lần mở bài kế tiếp, không có gì cũ nằm lại ở đâu.

/** Câu của từng bài, giữ trong phiên để em làm lại không phải đọc lại. */
const khoTheoBai = new Map<string, Promise<BankQuestion[]>>();

export function xoaCacheKho(): void {
  khoTheoBai.clear();
}

function cauCuaBai(lessonId: string): Promise<BankQuestion[]> {
  let p = khoTheoBai.get(lessonId);
  if (!p) {
    p = BankFirestore.getByLesson(lessonId).catch(err => {
      khoTheoBai.delete(lessonId);   // hỏng thì bỏ đi, lần sau còn thử lại
      throw err;
    });
    khoTheoBai.set(lessonId, p);
  }
  return p;
}

/**
 * Đếm số câu của MỘT bài, hỏi thẳng Firestore.
 *
 * Đây là con số DUY NHẤT được dùng để quyết định "bài này đủ câu để mở một lượt
 * chưa". Không có bảng đếm dựng sẵn ở đâu cả, nên không có gì cũ được.
 */
export async function demTuoiCuaBai(
  lessonId: string,
): Promise<Record<PhanLuyenTap, number>> {
  const kho = await cauCuaBai(lessonId);
  const ra: Record<PhanLuyenTap, number> = { mc: 0, tf: 0, tn: 0 };
  for (const c of kho) {
    const p = c.t as PhanLuyenTap;
    if (THU_TU_PHAN.includes(p)) ra[p]++;
  }
  return ra;
}

/** Rút câu cho một lượt làm. Luật chọn xem `chonCauTuKho` trong logic.ts. */
export async function layCauChoLuot(
  lessonId: string,
  phan: PhanLuyenTap,
  tienDo: TienDoPhan,
): Promise<BankQuestion[]> {
  const kho = (await cauCuaBai(lessonId)).filter(c => (c.t as PhanLuyenTap) === phan);
  return chonCauTuKho(kho, phan, tienDo);
}

/** Lấy lại câu hỏi theo id — dùng để dựng phần "những câu em còn sai" */
export async function layCauTheoId(ids: string[]): Promise<BankQuestion[]> {
  return BankFirestore.getByIds(ids);
}
```

`getByLesson` đã lọc `lessonId` rồi nên `layCauChoLuot` **không lọc lại**
`lessonId`, chỉ lọc `phan`. Bỏ `BangDemCau` khỏi import nếu không còn dùng —
`tsc` sẽ chỉ chỗ.

- [ ] **Bước 3: `npm run lint`**

Lúc này `PracticeSection.tsx` sẽ ĐỎ vì còn gọi `demCauTheoBai` — đúng như dự
kiến, Việc 3 sửa nó. Ghi lại tên các lỗi rồi sang Việc 3 ngay, đừng dừng ở
trạng thái đỏ.

---

### Việc 3: Danh sách vẽ không cần số câu; bấm vào bài mới hỏi

**Tệp:**
- Sửa: `src/features/practice/components/PracticeList.tsx` (bỏ prop `bangDem`)
- Sửa: `src/features/practice/PracticeSection.tsx` (bỏ nạp bảng đếm; kiểm số
  tươi lúc bấm)

- [ ] **Bước 1: Đọc cả hai tệp trước khi sửa**

```bash
sed -n '40,140p' src/features/practice/components/PracticeList.tsx
sed -n '60,140p' src/features/practice/PracticeSection.tsx
```

**Đừng sửa theo trí nhớ của kế hoạch này** — nó viết trước khi đọc hết hai tệp.
Chú ý `soLuotKhacNhau` đang được import ở `PracticeList.tsx:14`: nếu nó cần số
câu thì phần hiển thị đó cũng phải chuyển sang sau khi bấm, hoặc bỏ.

- [ ] **Bước 2: `PracticeList.tsx` — bỏ `bangDem`**

Bỏ khỏi `interface Props`, bỏ khỏi tham số, rồi ở chỗ gọi:

```tsx
                const trangThai = trangThaiPhan(phan, tienDo[bai.id]);   // không truyền số câu
```

Ba chỗ phải xử lý vì chúng cần số câu:

1. `soMoDuoc` — **bỏ**. Thay dòng tóm tắt bằng số bài đã xong trên tổng số bài:
   ```tsx
        <Typography variant="caption" color="text.secondary">
          Đã hoàn thành <b>{soXong}</b>/{tatCaBai.length} bài
        </Typography>
   ```
2. Khung cảnh báo `soMoDuoc === 0` ("Ngân hàng câu hỏi chưa đủ để mở bài nào") —
   **bỏ cả khối**. Nó nói về tình trạng ngân hàng, tức việc của thầy cô, mà nay
   danh sách không biết điều đó nữa. Học sinh bấm vào bài thiếu câu sẽ nhận
   đúng thông báo ở Bước 3, cụ thể hơn khung này nhiều.
3. `const thieu = moTaThieuCau(dem)` và `opacity: thieu && !xong ? 0.75 : 1` —
   **bỏ**, để mọi bài hiện rõ như nhau. Làm mờ một bài vì tưởng nó thiếu câu
   chính là kiểu hiểu nhầm mà cả kế hoạch này đang tránh.

Bỏ `demCuaBai`, `moTaThieuCau`, `BangDemCau` khỏi dòng import nếu hết dùng.

- [ ] **Bước 3: `PracticeSection.tsx` — bỏ nạp bảng đếm, kiểm lúc bấm**

Trong hàm `nap`, bỏ hai dòng `const bang = await demCauTheoBai();` và
`setBangDem(bang);`, bỏ luôn state `bangDem`. Phần đọc tiến độ giữ nguyên —
`nap` vẫn còn việc, đừng xoá cả hàm.

Ngay TRƯỚC lời gọi `layCauChoLuot(b.id, p, td)`:

```tsx
      /* Hỏi số câu THẬT của đúng bài này, ngay lúc em bấm.
         Không có bảng đếm dựng sẵn ở đâu, nên con số này luôn là mới nhất: thầy
         cô vừa nhập câu bằng JSON xong là em thấy ngay, không phải deploy lại.
         Lượt đọc này không phải chi phí thêm — `cauCuaBai` giữ lại trong phiên
         và `layCauChoLuot` ngay dưới dùng lại đúng kết quả đó. */
      const dem = await demTuoiCuaBai(b.id);
      if (dem[p] < SO_CAU_MOI_LUOT[p]) {
        setLoiTai(
          `Bài này chưa đủ câu cho phần ${TEN_PHAN_NGAN[p]}. ${moTaThieuCau(dem)}. `
          + 'Em báo thầy/cô bổ sung giúp nhé.',
        );
        return;
      }
```

Thêm `demTuoiCuaBai`, `moTaThieuCau`, `SO_CAU_MOI_LUOT`, `TEN_PHAN_NGAN` vào
import nếu chưa có — **kiểm dòng 12 trước**, tránh import trùng.

- [ ] **Bước 4: `npm run lint` — phải SẠCH**

- [ ] **Bước 5: Đo thật trên trình duyệt, đừng suy từ mã**

`npm run dev`, F12 → Network, lọc `firestore`:

- Mở tab Luyện tập → **không có lượt gọi nào** cho ngân hàng.
- Bấm vào một bài → đúng **một** lượt gọi.
- Bấm lại chính bài đó → **không thêm lượt nào**.
- Bấm sang bài khác → thêm một lượt.

Ghi bốn con số đo được vào bảng "Số đo" ở đầu kế hoạch này.

- [ ] **Bước 6: Dừng, báo chủ dự án.** Chưa commit.

---

### Việc 4: Trò chơi chỉ bơm ngân hàng khi người xem là GIÁO VIÊN

Đọc chú thích ở `GameHubSection.tsx:176-186` thì mục đích của lời gọi này ghi
rõ: *"bơm sẵn ở đây để GIÁO VIÊN không phải nhớ bấm nút bên trang quản trị"*,
cảnh dùng là **máy chiếu ở lớp**. Tức nó vốn không nhắm vào học sinh, mà học
sinh đang trả 1.554 lượt đọc cho nó.

Giữ nguyên Firestore và giữ nguyên độ tươi, chỉ chặn theo vai.

**Tệp:** sửa `src/features/games/GameHubSection.tsx` (useEffect quanh dòng 187)

- [ ] **Bước 1: Đọc nguyên khối chú thích 176–186 trước khi sửa.** Luật "CHỈ bơm
khi đọc được Firestore, vì bơm kho rỗng sẽ ghi đè mất phần đang có trong máy"
phải giữ.

- [ ] **Bước 2: Chặn ở đầu useEffect**

```tsx
  useEffect(() => {
    /* CHỈ bơm khi người đang xem là giáo viên trở lên.
       Lời gọi này tải CẢ ngân hàng = 1.554 lượt đọc. Bậc miễn phí cho 50.000
       lượt đọc/ngày, nên để học sinh chạm vào là một lớp 40 em mở tab Trò chơi
       ăn 62.160 lượt trong một tiết.
       Mà nó vốn không nhắm vào học sinh — xem chú thích ngay trên. Học sinh vẫn
       chơi bình thường bằng kho đã có trong IndexedDB của máy đó. */
    const vai = currentUser?.role;
    if (vai !== 'teacher' && vai !== 'school_admin' && vai !== 'admin') return;

    let huy = false;
```

Thân `(async () => { … })()` giữ NGUYÊN, kể cả `BankFirestore.getAll()` — ở đây
`getAll()` là đúng, giáo viên thật sự cần cả kho. Thêm `currentUser` vào mảng
phụ thuộc.

- [ ] **Bước 3: `npm run lint`, rồi thử tay và ĐÓNG TAB**

Đăng nhập bằng tài khoản học sinh, mở tab Trò chơi, F12 → Network: không còn
lượt gọi Firestore. Mở một trò chơi xem có câu hỏi không.

**Đóng tab trò chơi sau khi thử** — bài học số 5 trong CLAUDE.md, trò chơi có
nhạc nền.

- [ ] **Bước 4: Dừng, báo chủ dự án.** Chưa commit.

---

### Việc 5: Đề theo chương đọc đúng chương

**Tệp:**
- Sửa: `src/features/bank/bankStore.ts` (thêm `getByChapter` cạnh `getByLesson`)
- Sửa: `src/core/contexts/AppContext.tsx` (khối `[SIGNAL:XONG_CHUONG]`, ~1263)

- [ ] **Bước 1: Thêm `getByChapter`**

```ts
  /**
   * Câu hỏi của cả một chương.
   *
   * Đề tổng hợp cuối chương cần câu của nhiều bài nên `getByLesson` không đủ,
   * nhưng tải CẢ ngân hàng thì quá tay: đo 20/09/2026, chương nặng nhất là
   * chương 2 với 583 câu, tức vẫn chưa bằng 40% của 1.554.
   */
  async getByChapter(ch: number): Promise<BankQuestion[]> {
    const snap = await getDocs(query(collection(db, COL_BANK), where('ch', '==', ch)));
    return snap.docs.map(d => chuanHoaCau({ ...(d.data() as BankQuestion), id: d.id }));
  },
```

KHÔNG bọc `try/catch` — chỗ gọi trong `AppContext` đang bắt lỗi và nói thật với
học sinh ("Chưa đọc được ngân hàng câu hỏi…"). Nuốt lỗi ở đây là biến nó thành
"chương này chưa có câu nào", sai hẳn nguyên nhân.

- [ ] **Bước 2: Đổi chỗ gọi trong `AppContext.tsx`**

Thay:

```ts
          const bank = await BankFirestore.getAll();
          const cuaChuong = bank
            .filter(q => q.ch === toChapter(chapter.id))
            .map(q => toLegacy(q));
```

bằng:

```ts
          /* Lọc ngay trên Firestore thay vì tải cả kho về rồi lọc tại máy.
             Cùng kết quả, nhưng 583 lượt đọc thay vì 1.554 ở chương nặng nhất. */
          const cuaChuong = (await BankFirestore.getByChapter(toChapter(chapter.id)))
            .map(q => toLegacy(q));
```

- [ ] **Bước 3: `npm run lint` rồi đối chiếu bằng dữ liệu thật**

```bash
node -e "const d=require('./public/bank/ngan-hang.json');const c={};for(const q of d)c[q.ch]=(c[q.ch]||0)+1;console.log(c)"
```

Phải ra `{1:391, 2:583, 3:484, 4:40, 5:29, 6:27}`. `filter` cũ và `where` mới
cùng một điều kiện trên cùng một trường nên phải cho cùng kết quả.

- [ ] **Bước 4: Dừng, báo chủ dự án.** Chưa commit.

---

### Việc 6: Canh cho `getAll()` không mọc lại, và ghi vào tài liệu

Không có việc này thì lần sau ai đó lại gọi `getAll()` cho tiện, và không có gì
kêu lên — đúng loại lỗi CLAUDE.md gọi là "không làm hỏng build".

**Tệp:**
- Sửa: `scripts/kiem-tra-luyen-tap.mts`
- Sửa: `CLAUDE.md` (mục "Kiến trúc dự án")
- Sửa: `scripts/README.md`

- [ ] **Bước 1: Viết phép kiểm**

```ts
// ─── Màn học sinh không tải cả ngân hàng ─────────────────────────────────────
//
// `BankFirestore.getAll()` = 1.554 lượt đọc + 5,74 MB. Bậc miễn phí cho 50.000
// lượt đọc/ngày, nên một màn học sinh gọi nó là 32 lượt mở hết sạch hạn mức của
// cả trường trong một ngày.
console.log('\n== Màn học sinh không tải cả ngân hàng ==');
{
  const boChuThich = (s: string) =>
    s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  for (const tep of [
    'src/features/practice/practiceService.ts',
    'src/core/contexts/AppContext.tsx',
  ]) {
    ok(!/BankFirestore\.getAll\s*\(/.test(boChuThich(readFileSync(tep, 'utf8'))),
       `${tep} không gọi BankFirestore.getAll()`,
       'dùng getByLesson / getByChapter / getByIds thay thế');
  }

  /* GameHubSection VẪN được gọi getAll() — nhưng chỉ sau khi đã canh vai, vì
     lời gọi đó vốn dành cho giáo viên mở trên máy chiếu. */
  const game = boChuThich(readFileSync('src/features/games/GameHubSection.tsx', 'utf8'));
  const viTriCanh = game.search(/vai\s*!==\s*'teacher'/);
  const viTriGoi = game.search(/BankFirestore\.getAll\s*\(/);
  ok(viTriCanh >= 0 && viTriGoi > viTriCanh,
     'GameHubSection chỉ tải cả ngân hàng SAU khi canh vai giáo viên',
     `canh ở ${viTriCanh}, gọi ở ${viTriGoi}`);
}
```

- [ ] **Bước 2: Chạy — phải ĐẠT**

- [ ] **Bước 3: Cố tình làm hỏng để xem nó có kêu không**

Thêm tạm `await BankFirestore.getAll();` vào `practiceService.ts`, chạy lại,
phải thấy `SAI`, rồi **bỏ dòng đó đi**. Rồi thử bỏ dòng canh vai trong
`GameHubSection`, phải thấy `SAI`, rồi trả lại. Bài học ở cuối mục "Bảng màu"
trong CLAUDE.md: một phép kiểm luôn xanh mà chưa bao giờ bắt được gì thì đáng
ngờ hơn đáng mừng.

- [ ] **Bước 4: Ghi vào CLAUDE.md**

Vào mục `## Kiến trúc dự án — dữ liệu thật nằm ở đâu`, thêm sau khối "Ngân hàng
câu hỏi nằm ở Firestore":

```markdown
### Hạn mức đọc: đừng tải cả ngân hàng ở màn học sinh

Bậc miễn phí cho **50.000 lượt đọc/ngày**, mà ngân hàng có **1.554 tài liệu,
5,74 MB** — nên `BankFirestore.getAll()` là 1.554 lượt đọc MỖI LẦN gọi. Đo
20/09/2026: trước khi sửa, tab Luyện tập, tab Trò chơi và đề theo chương đều gọi
nó, tức một lớp 40 em mở Luyện tập cùng một tiết là 62.160 lượt — vỡ hạn mức
giữa buổi, và cả trường mất ngân hàng tới sáng hôm sau.

Ba đường thay thế: `getByLesson(lessonId)` (~80 lượt, nhiều nhất 230),
`getByChapter(ch)` (nhiều nhất 583), `getByIds(ids)` (chia lô 30).

`getAll()` nay chỉ còn ở màn GIÁO VIÊN (`BankManager`, `DatabankManagement`, và
`GameHubSection` **sau khi đã canh vai**): ít người, và họ thật sự cần cả kho.
`kiem-tra:luyen-tap` canh điều đó.

**CỐ Ý KHÔNG dựng bảng đếm sẵn ở đâu cả** — không tệp sinh sẵn, không bản chụp,
không bộ nhớ đệm bền. Web deploy bằng kéo-thả `dist/`, nên mọi con số nằm trong
tệp tĩnh chỉ mới tới lần deploy gần nhất: thầy cô nhập câu hỏi xong phải build
và deploy lại thì số mới đúng. Thay vào đó danh sách Luyện tập vẽ bằng TIẾN ĐỘ
(localStorage) và không hiện số câu; số câu chỉ được hỏi khi học sinh bấm vào
một bài, bằng `demTuoiCuaBai()`. Vì không có con số nào được lưu sẵn, không có
gì cũ được.

`trangThaiPhan(phan, tienDo, soCau?)` bỏ trống tham số thứ ba nghĩa là **chưa
biết** số câu, và khi đó nó KHÔNG bao giờ trả `'thieu-cau'` — đoán sai theo
hướng đó là giấu mất một bài mà ngân hàng vẫn đủ câu.

**`getCountFromServer` không dùng được trên dự án này** — trả
`RESOURCE_EXHAUSTED` trên mọi collection trong khi đọc thường vẫn chạy. Vì thế
`BankFirestore.getCount()` luôn rơi vào nhánh dự phòng `getDocs(collection)`,
tức **mỗi lần gọi nó tốn 1.554 lượt đọc**. Đừng gọi nó ở màn học sinh.
```

- [ ] **Bước 5: `scripts/README.md`** — một đoạn ngắn nhắc rằng `xuat:ngan-hang`
và `gan:cau-hoi` KHÔNG còn sinh bảng đếm nào cho web, và vì sao.

- [ ] **Bước 6: Chạy cả bộ rồi dừng**

```bash
npm run lint
npm run kiem-tra
npm run kiem-tra:e2e   # cần E2E_EMAIL/E2E_MATKHAU trong .env.local
```

Sạch thì báo chủ dự án kèm số đo trước/sau, và hỏi có commit không.
KHÔNG tự commit, không tự push.

---

## Thứ tự

1 → 2 → 3 phải liền nhau (giữa 2 và 3 cây mã ĐỎ, đừng dừng ở đó). 4 và 5 độc
lập. 6 làm cuối vì phép kiểm của nó đòi 2, 4, 5 xong.

## Cái này KHÔNG làm

- **Không đụng `firestore.rules`.**
- **Không dựng bộ nhớ đệm bền** cho ngân hàng ở phía học sinh. Nó giảm thêm lượt
  đọc nhưng đẻ ra câu hỏi "cũ bao lâu thì bỏ" và một đường mất đồng bộ mới —
  đúng thứ kế hoạch này vừa dọn đi.
- **Không sửa `getAll()` ở màn giáo viên.**
- **Không đổi `getByLesson`** — nó vốn đã đúng.
