# So sánh bộ phân loại tự huấn luyện với luật regex

Mô hình `2026-10-05-0907`, tập kiểm 100 câu (máy không thấy lúc học).

Độ chính xác 8 nhãn của mô hình: **89,0 %** (89/100).

| Nhãn | Cách | Precision | Recall | F1 | Bắt đúng | Báo nhầm | Bỏ sót |
|---|---|---|---|---|---|---|---|
| be_tac | regex | 58,3 % | 41,2 % | 48,3 % | 7 | 5 | 10 |
| be_tac | mô hình | 85,0 % | 100,0 % | 91,9 % | 17 | 3 | 0 |
| gian_lan_phong_thi | regex | 100,0 % | 58,3 % | 73,7 % | 7 | 0 | 5 |
| gian_lan_phong_thi | mô hình | 83,3 % | 83,3 % | 83,3 % | 10 | 2 | 2 |

## Các nhãn chỉ mô hình làm được

| Nhãn | Precision | Recall | F1 |
|---|---|---|---|
| hoi_khai_niem | 100,0 % | 93,8 % | 96,8 % |
| xin_dap_an | 80,8 % | 95,5 % | 87,5 % |
| nop_bai_lam | 92,3 % | 85,7 % | 88,9 % |
| xin_de | 100,0 % | 33,3 % | 50,0 % |
| tra_loi_gia_su | 100,0 % | 100,0 % | 100,0 % |
| ngoai_mon | 100,0 % | 75,0 % | 85,7 % |

_Tập kiểm nhỏ thì mỗi câu đổi vài điểm phần trăm — ghi kèm số câu khi trích._
