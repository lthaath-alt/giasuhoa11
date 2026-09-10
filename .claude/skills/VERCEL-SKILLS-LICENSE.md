# Nguồn gốc và giấy phép — hai kỹ năng `vercel-*`

Chép ngày 10/09/2026 từ **`github.com/vercel-labs/agent-skills`**, giấy phép
**MIT**, © 2026 Vercel, Inc.

| Thư mục | Nội dung |
|---|---|
| `vercel-composition-patterns/` | Lối viết component React ghép được: compound component, render prop, context. Có phần React 19. |
| `vercel-react-best-practices/` | Hiệu năng React theo Vercel Engineering. |

## Vì sao chỉ lấy hai trong chín

Repo đó có chín kỹ năng. Bảy cái còn lại **cố ý không lấy**:

- `deploy-to-vercel`, `vercel-cli-with-tokens`, `vercel-optimize` — chỉ dùng cho
  Vercel. Dự án này phát hành lên **Netlify** bằng cách kéo thả `dist/`. Ba cái
  này còn kèm `resources/deploy.sh`, `deploy-codex.sh` và tệp `.zip` — mã chạy
  được, không phải tài liệu.
- `react-native-skills` — dự án không có React Native.
- `react-view-transitions` — **mâu thuẫn với hợp đồng hướng**. Thế giới thị giác
  của dự án chốt "chuyển động đúng MỘT nhịp" (xem `.impeccable/surfaces/app.md`).
  Kỹ năng này đẩy về phía thêm hiệu ứng chuyển cảnh.
- `web-design-guidelines`, `writing-guidelines` — cả hai **tải hướng dẫn từ một
  URL lúc chạy** rồi mới soi mã. Mạng công ty hay chặn, và nội dung là hướng dẫn
  chung của Vercel: cái đầu dễ nói ngược với hệ nhãn cảnh báo của dự án, cái sau
  viết cho văn xuôi tiếng Anh trong khi dự án viết tiếng Việt.

Muốn thêm cái nào thì `git clone github.com/vercel-labs/agent-skills` rồi chép
thư mục tương ứng vào `.claude/skills/`, đặt tên thư mục trùng với `name:` trong
frontmatter.

## Lưu ý về repo `vercel-labs/skills`

Đó là **trình cài đặt CLI** (`npx skills add …`), không phải bộ kỹ năng. Nó tải
và chạy mã từ npm rồi kéo kỹ năng về từ repo GitHub bất kỳ. Dự án này **không
dùng** nó: kỹ năng ở đây chép tay và theo git, giống cách làm với `superpowers`
và `impeccable`, để đọc được nội dung trước khi cài và để `git pull` mang sang
máy khác.

## Nâng cấp

Chép đè lại từ repo gốc. Đừng sửa tay — sửa thì mất mạch với bản gốc; muốn khác
thì ghi vào `CLAUDE.md`.

Đã bỏ `metadata.json` của mỗi thư mục: đó là tệp phục vụ trình cài đặt, không
phải nội dung kỹ năng.
