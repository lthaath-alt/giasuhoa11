# So sánh bộ phân loại tự huấn luyện với luật regex

Mô hình `2026-10-04-1045`, tập kiểm 89 câu (máy không thấy lúc học).

Độ chính xác 6 nhãn của mô hình: **93,3 %** (83/89).

| Nhãn | Cách | Precision | Recall | F1 | Bắt đúng | Báo nhầm | Bỏ sót |
|---|---|---|---|---|---|---|---|
| be_tac | regex | 66,7 % | 62,5 % | 64,5 % | 10 | 5 | 6 |
| be_tac | mô hình | 93,8 % | 93,8 % | 93,8 % | 15 | 1 | 1 |
| gian_lan_phong_thi | regex | 100,0 % | 53,8 % | 70,0 % | 7 | 0 | 6 |
| gian_lan_phong_thi | mô hình | 100,0 % | 84,6 % | 91,7 % | 11 | 0 | 2 |

## Bốn nhãn chỉ mô hình làm được

| Nhãn | Precision | Recall | F1 |
|---|---|---|---|
| hoi_khai_niem | 100,0 % | 100,0 % | 100,0 % |
| xin_dap_an | 90,9 % | 95,2 % | 93,0 % |
| nop_bai_lam | 81,3 % | 92,9 % | 86,7 % |
| ngoai_mon | 100,0 % | 91,7 % | 95,7 % |

_Tập kiểm nhỏ thì mỗi câu đổi vài điểm phần trăm — ghi kèm số câu khi trích._
