@echo off
rem Tac vu hen gio 0:00 goi tep nay (xem dang-ky-hen-gio.ps1). Chay tay cung duoc.
rem Lay cau hoi moi, lam bang gan nhan, gui mail. Nhat ky: Tai lieu\gan-nhan-gia-su\nhat-ky\
cd /d "%~dp0..\.."
python scripts\phan-loai\hang_ngay.py %*
