# So sánh bộ phân loại tự huấn luyện với luật regex

Mô hình `2026-10-05-2342`, tập kiểm 100 câu (máy không thấy lúc học).

Độ chính xác 8 nhãn của mô hình: **84,0 %** (84/100).

| Nhãn | Cách | Precision | Recall | F1 | Bắt đúng | Báo nhầm | Bỏ sót |
|---|---|---|---|---|---|---|---|
| be_tac | regex | 58,3 % | 41,2 % | 48,3 % | 7 | 5 | 10 |
| be_tac | mô hình | 80,0 % | 94,1 % | 86,5 % | 16 | 4 | 1 |
| gian_lan_phong_thi | regex | 100,0 % | 66,7 % | 80,0 % | 8 | 0 | 4 |
| gian_lan_phong_thi | mô hình | 90,0 % | 75,0 % | 81,8 % | 9 | 1 | 3 |

## Các nhãn chỉ mô hình làm được

| Nhãn | Precision | Recall | F1 |
|---|---|---|---|
| hoi_khai_niem | 93,3 % | 93,3 % | 93,3 % |
| xin_dap_an | 75,9 % | 95,7 % | 84,6 % |
| nop_bai_lam | 100,0 % | 80,0 % | 88,9 % |
| xin_de | 100,0 % | 66,7 % | 80,0 % |
| tra_loi_gia_su | 80,0 % | 57,1 % | 66,7 % |
| ngoai_mon | 81,8 % | 69,2 % | 75,0 % |

_Tập kiểm nhỏ thì mỗi câu đổi vài điểm phần trăm — ghi kèm số câu khi trích._
