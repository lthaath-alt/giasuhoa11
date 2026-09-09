# Nguồn gốc và giấy phép — 14 kỹ năng superpowers

Mười bốn thư mục kỹ năng dưới đây **không phải do dự án này viết**. Chúng được chép
nguyên văn từ dự án `superpowers`:

| | |
|---|---|
| Nguồn | https://github.com/obra/superpowers |
| Tác giả | Jesse Vincent (obra) |
| Phiên bản | 6.3.0 |
| Commit | `b36e0829c6d0140e93cfef2ca599b1b07d4a7797` (12/08/2026) |
| Ngày chép về | 09/09/2026 |
| Giấy phép | MIT (toàn văn ở cuối tệp này) |

Các thư mục thuộc nhóm này:

```
brainstorming                    receiving-code-review     using-git-worktrees
dispatching-parallel-agents      requesting-code-review    using-superpowers
executing-plans                  subagent-driven-development  verification-before-completion
finishing-a-development-branch   systematic-debugging      writing-plans
                                 test-driven-development   writing-skills
```

## Vì sao chép vào repo thay vì cài dạng plugin

Bản chính chủ khuyên cài qua `/plugin install superpowers@claude-plugins-official`.
Dự án này cố ý **không** làm vậy: cài dạng plugin là cài theo TỪNG MÁY, mà cả kho kỹ
năng ở đây được dựng để đi theo `git pull` sang máy khác — xem `.gitignore` dòng
`.claude/*` kèm ngoại lệ `!.claude/skills/`. Cùng lý do với `karpathy-guidelines`.

**Đổi lại: đây là bản đóng băng.** Muốn lên bản mới thì chép lại từ đầu:

```bash
git clone --depth 1 https://github.com/obra/superpowers.git /tmp/sp
cp -r /tmp/sp/skills/* .claude/skills/
```

Rồi cập nhật bảng phiên bản ở trên. **Đừng sửa tay nội dung các kỹ năng** — sửa là mất
mạch với bản gốc và lần chép sau sẽ ghi đè mất. Muốn khác đi thì ghi vào `CLAUDE.md`.

## Hai điều bản plugin có mà bản chép này không có

1. **Hook lúc mở phiên.** Bản plugin nhét kỹ năng `using-superpowers` vào đầu mỗi
   phiên. Bản chép không có, nên kỹ năng phải được gọi ra chứ không tự nhắc.
2. **Tự cập nhật.** Xem mục trên.

## Một tệp KHÔNG phải markdown, cần biết trước khi dùng

`brainstorming/scripts/server.cjs` (723 dòng) là một máy chủ HTTP Node dựng giao diện
brainstorm trực quan trong trình duyệt. Nó **chỉ chạy khi được gọi**, và chính kỹ năng
đó ghi là phải hỏi ý người dùng trước.

Đã đọc qua: nó lắng nghe trên `127.0.0.1` (chỉ máy nội bộ), cổng ngẫu nhiên, có khoá
phiên + kiểm tra Origin cho WebSocket, tự tắt sau 4 giờ không dùng. Một điểm đáng nói:
trang nó dựng có nhúng ảnh hiệu từ `primeradiant.com`, tức trình duyệt sẽ gọi ra một
tên miền ngoài khi thầy mở giao diện đó.

Không cần tính năng này thì xoá `brainstorming/scripts/` là xong; phần còn lại của kỹ
năng `brainstorming` vẫn chạy.

Vài tệp `.sh` / `.js` khác (`systematic-debugging/find-polluter.sh`,
`subagent-driven-development/scripts/*`, `writing-skills/render-graphs.js`) là tiện ích
chạy tại chỗ, không gọi ra mạng.

---

## MIT License

Copyright (c) 2025 Jesse Vincent

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
