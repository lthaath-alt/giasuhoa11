# So sánh bộ phân loại tự huấn luyện với luật regex

Mô hình `2026-10-02-1154`, tập kiểm 88 câu (máy không thấy lúc học).

Độ chính xác 6 nhãn của mô hình: **92,0 %** (81/88).

| Nhãn | Cách | Precision | Recall | F1 | Bắt đúng | Báo nhầm | Bỏ sót |
|---|---|---|---|---|---|---|---|
| be_tac | regex | 66,7 % | 50,0 % | 57,1 % | 8 | 4 | 8 |
| be_tac | mô hình | 93,8 % | 93,8 % | 93,8 % | 15 | 1 | 1 |
| gian_lan_phong_thi | regex | 100,0 % | 58,3 % | 73,7 % | 7 | 0 | 5 |
| gian_lan_phong_thi | mô hình | 100,0 % | 83,3 % | 90,9 % | 10 | 0 | 2 |

## Bốn nhãn chỉ mô hình làm được

| Nhãn | Precision | Recall | F1 |
|---|---|---|---|
| hoi_khai_niem | 100,0 % | 92,3 % | 96,0 % |
| xin_dap_an | 83,3 % | 95,2 % | 88,9 % |
| nop_bai_lam | 100,0 % | 92,9 % | 96,3 % |
| ngoai_mon | 84,6 % | 91,7 % | 88,0 % |

_Tập kiểm nhỏ thì mỗi câu đổi vài điểm phần trăm — ghi kèm số câu khi trích._
