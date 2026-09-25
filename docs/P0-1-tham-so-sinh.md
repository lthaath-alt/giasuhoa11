# P0-1 — Đo thật temperature và topP trên `gemini-3.6-flash`

**Ngày đo:** 22/09/2026
**Cách đo:** `npx tsx scripts/do-tham-so-sinh.mts` — 8 lượt gọi REST
`generativelanguage.googleapis.com/v1beta`, bằng khoá API trong `.env.local`.
**Dữ liệu thô:** `docs/P0-1-do-tho.json` (đủ request config và response từng lượt).

## Câu hỏi cần trả lời

Tài liệu Google Cloud về Gemini 3.6 Flash ghi rằng model không hỗ trợ giá trị tuỳ chỉnh cho
temperature / top-K / top-P. Mã của web đang gửi `temperature: 0,3` và `topP: 0,85` ở cả ba
đường gọi ([promptSuPham.ts:243](../src/features/tutor/services/promptSuPham.ts),
[giaSuFirebaseAI.ts:66](../src/features/tutor/services/giaSuFirebaseAI.ts),
[giaSuKeyRieng.ts:22](../src/features/tutor/services/giaSuKeyRieng.ts),
[geminiTutorService.ts:149](../src/features/tutor/services/geminiTutorService.ts)). Vậy API
báo lỗi, bỏ qua im lặng, hay có hiệu lực?

## Phép A — gửi giá trị ngoài miền

Gửi `{"temperature": 99}`.

```
HTTP 400
{
  "error": {
    "code": 400,
    "message": "* GenerateContentRequest.generation_config.temperature: temperature must be in the range [0.0, 2.0].\n",
    "status": "INVALID_ARGUMENT"
  }
}
```

**Kết luận A:** API **đọc** tham số và **kiểm tra miền giá trị**. Không hề bỏ qua im lặng.

## Phép C — siêu dữ liệu model

`GET /v1beta/models/gemini-3.6-flash` trả HTTP 200:

```json
{
  "name": "models/gemini-3.6-flash",
  "version": "3.6-flash-07-2026",
  "inputTokenLimit": 1048576,
  "outputTokenLimit": 65536,
  "temperature": 1,
  "topP": 0.95,
  "topK": 64,
  "maxTemperature": 2,
  "thinking": true
}
```

**Kết luận C:** model **khai cả ba tham số** kèm giá trị mặc định (temperature 1, topP 0,95,
topK 64) và trần `maxTemperature: 2` — khớp với thông báo lỗi ở phép A.

## Phép B — hai cực nhiệt độ, mỗi cực ba lượt

Cùng một câu hỏi, ba lượt `temperature: 0, topP: 0.1` và ba lượt `temperature: 2, topP: 1`.

| Lượt | HTTP | Độ dài | Mở đầu |
|---|---|---|---|
| B1.1 (t=0) | 200 | 254 | "Khi thay đổi một trong các điều kiện bên ngoài…" |
| B1.2 (t=0) | 200 | 394 | "Dưới đây là câu dẫn và ba yếu tố…" |
| B1.3 (t=0) | 200 | 359 | "Dưới đây là câu dẫn và 3 yếu tố…" |
| B2.1 (t=2) | 200 | 408 | "Dưới đây là câu dẫn và 3 yếu tố…" |
| B2.2 (t=2) | **503** | — | model quá tải, lượt này mất |
| B2.3 (t=2) | 200 | 237 | "Cân bằng hóa học là một cân bằng động…" |

**Kết luận B, và đây là phát hiện đáng kể nhất:** ba lượt ở `temperature = 0` cho **ba câu
trả lời khác nhau**, khác cả về độ dài (254 / 394 / 359 ký tự) lẫn cách mở đầu. Nhiệt độ 0
**không** cho kết quả tái lập được trên model này. Nhiều khả năng do model bật "thinking"
(`"thinking": true` trong metadata), phần suy nghĩ không tất định.

Với 5 mẫu hợp lệ, **không** kết luận được là hai cực nhiệt độ cho phân bố khác nhau — cỡ mẫu
quá nhỏ. Muốn khẳng định thì cần vài chục lượt mỗi cực, tức phải bật thanh toán.

## Kết luận chung

1. **Tham số KHÔNG bị bỏ qua.** API đọc, kiểm miền giá trị, và model khai chúng trong
   metadata. Mô tả trong tài liệu Google Cloud không khớp với hành vi đo được ngày 22/09/2026.
2. **Vì vậy KHÔNG gỡ `temperature` / `topP` khỏi mã.** Giữ nguyên `0,3 / 0,85`.
3. **Nhưng phải sửa câu chữ trong slide và báo cáo.** Chú thích hiện tại ở
   `promptSuPham.ts:238-242` viết rằng hạ xuống 0,3 / 0,85 để "câu trả lời ổn định và tái lập
   được hơn khi đo cho đề tài". Vế "tái lập được" **sai** — đo được là ngay ở nhiệt độ 0,
   ba lượt vẫn ra ba câu khác nhau. Câu đúng để nói trước hội đồng: *"Chúng tôi hạ nhiệt độ
   để giảm độ tản mạn của câu trả lời; tuy nhiên đo ngày 22/09/2026 cho thấy model này không
   tất định kể cả ở nhiệt độ 0, nên mỗi lượt đo đều được chạy lại nhiều lần."*

## Hai giới hạn của phép đo này

- Đo qua **REST + khoá API**, còn bản chạy thật gọi qua **Firebase AI Logic** và có thêm
  `thinkingConfig: { thinkingLevel: LOW }`. Cùng model, khác lớp vận chuyển và khác một tham
  số. Nếu cần chắc chắn tuyệt đối cho bản chạy thật thì phải đo trong trình duyệt.
- Một lượt (B2.2) trả 503 "high demand", nên cỡ mẫu phép B là 5 chứ không phải 6.
