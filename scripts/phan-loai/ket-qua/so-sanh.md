# So sánh bộ phân loại tự huấn luyện với luật regex

Mô hình `2026-10-05-2241`, tập kiểm 100 câu (máy không thấy lúc học).

Độ chính xác 8 nhãn của mô hình: **89,0 %** (89/100).

| Nhãn | Cách | Precision | Recall | F1 | Bắt đúng | Báo nhầm | Bỏ sót |
|---|---|---|---|---|---|---|---|
| be_tac | regex | 53,8 % | 41,2 % | 46,7 % | 7 | 6 | 10 |
| be_tac | mô hình | 88,9 % | 94,1 % | 91,4 % | 16 | 2 | 1 |
| gian_lan_phong_thi | regex | 100,0 % | 58,3 % | 73,7 % | 7 | 0 | 5 |
| gian_lan_phong_thi | mô hình | 90,9 % | 83,3 % | 87,0 % | 10 | 1 | 2 |

## Các nhãn chỉ mô hình làm được

| Nhãn | Precision | Recall | F1 |
|---|---|---|---|
| hoi_khai_niem | 100,0 % | 93,3 % | 96,6 % |
| xin_dap_an | 79,3 % | 100,0 % | 88,5 % |
| nop_bai_lam | 100,0 % | 80,0 % | 88,9 % |
| xin_de | 100,0 % | 66,7 % | 80,0 % |
| tra_loi_gia_su | 100,0 % | 57,1 % | 72,7 % |
| ngoai_mon | 85,7 % | 92,3 % | 88,9 % |

_Tập kiểm nhỏ thì mỗi câu đổi vài điểm phần trăm — ghi kèm số câu khi trích._
