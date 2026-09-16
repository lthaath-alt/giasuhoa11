# viet-van-khong-dau-vet-ai

Skill cho Claude gồm 50 quy tắc viết giúp văn bản tiếng Việt và tiếng Anh cụ thể, viết thẳng, không mang các đặc điểm văn phong AI. Kèm một script quét lỗi tự động.

Các quy tắc được tổng hợp từ trang [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) của WikiProject AI Cleanup. Danh sách từ cấm tiếng Việt là phần suy ra tương đương, trang gốc không có.

## Cấu trúc

```
SKILL.md                 Hướng dẫn cho Claude: khi nào dùng, quy trình viết và soát
references/rules.md      Đủ 50 quy tắc (Q1 đến Q50), ví dụ sai/đúng, checklist
scripts/check_text.js    Script quét lỗi, chỉ cần Node.js
```

## Cài đặt

Claude Code: chép thư mục này vào `~/.claude/skills/viet-van-khong-dau-vet-ai/`.

Claude.ai hoặc ứng dụng Claude: nén thư mục thành file zip rồi tải lên trong phần cài đặt Skills.

## Dùng script

```bash
node scripts/check_text.js bai-viet.txt
node scripts/check_text.js bai-viet.md --markdown-ok
node scripts/check_text.js commit.txt --summary
```

`--markdown-ok` dùng khi nơi đăng hỗ trợ Markdown. `--summary` dùng cho mô tả chỉnh sửa hoặc commit message. Script trả mã thoát 1 khi còn LỖI.

Script chỉ bắt dấu hiệu bề mặt. Các quy tắc về nội dung và nguồn trích dẫn vẫn cần người đọc tự rà.
