# Nguồn gốc và giấy phép — kỹ năng notebooklm

Thư mục `notebooklm/` **không phải do dự án này viết**. `SKILL.md` được chép nguyên
văn (không sửa) từ gói `notebooklm-py` phiên bản 0.8.3 — lệnh `notebooklm skill install`
sinh ra — ngày 27/09/2026, để máy khác `git pull` về là có sẵn kỹ năng.

- Nguồn: https://github.com/teng-lin/notebooklm-py
- Tác giả: Teng Lin
- Giấy phép: MIT (nguyên văn bên dưới)

Cập nhật: chạy `notebooklm skill install` rồi chép lại `SKILL.md` — KHÔNG sửa tay
(CLAUDE.md: không sửa tay kỹ năng bên thứ ba).

Kỹ năng chỉ là hướng dẫn; muốn dùng thật vẫn phải cài gói và đăng nhập trên từng máy
(`pip install "notebooklm-py[browser]"`, `notebooklm login`). Tệp đăng nhập
(`storage_state.json`, `master_token.json`) nằm ở `~/.notebooklm/`, NGOÀI repo — đừng
bao giờ chép vào đây.

---
MIT License

Copyright (c) 2026 Teng Lin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
