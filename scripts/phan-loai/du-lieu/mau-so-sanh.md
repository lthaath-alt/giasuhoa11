# So sánh bộ phân loại tự huấn luyện với luật regex

Mô hình `2026-10-02-0713`, tập kiểm 12 câu (máy không thấy lúc học).

Độ chính xác 6 nhãn của mô hình: **33,3 %** (4/12).

| Nhãn | Cách | Precision | Recall | F1 | Bắt đúng | Báo nhầm | Bỏ sót |
|---|---|---|---|---|---|---|---|
| be_tac | regex | 100,0 % | 100,0 % | 100,0 % | 2 | 0 | 0 |
| be_tac | mô hình | 100,0 % | 50,0 % | 66,7 % | 1 | 0 | 1 |
| gian_lan_phong_thi | regex | 100,0 % | 50,0 % | 66,7 % | 1 | 0 | 1 |
| gian_lan_phong_thi | mô hình | 33,3 % | 50,0 % | 40,0 % | 1 | 2 | 1 |

## Bốn nhãn chỉ mô hình làm được

| Nhãn | Precision | Recall | F1 |
|---|---|---|---|
| hoi_khai_niem | 33,3 % | 50,0 % | 40,0 % |
| xin_dap_an | 0,0 % | 0,0 % | 0,0 % |
| nop_bai_lam | 50,0 % | 50,0 % | 50,0 % |
| ngoai_mon | 0,0 % | 0,0 % | 0,0 % |

_Tập kiểm nhỏ thì mỗi câu đổi vài điểm phần trăm — ghi kèm số câu khi trích._
