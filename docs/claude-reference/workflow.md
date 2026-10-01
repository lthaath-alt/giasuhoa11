# Tài liệu theo chủ đề — workflow

> Trích nguyên văn từ CLAUDE.md người dùng cung cấp. Quy tắc/giới hạn vẫn có hiệu lực; số đo và trạng thái dịch vụ là ghi nhận lịch sử, chưa được xác minh lại. Chỉ đọc phần liên quan.

**Tra mục:** [INDEX.md](INDEX.md). **Đọc chéo khi liên quan:** [testing.md](testing.md), [project.md](project.md).

Các đường dẫn code trong nội dung gốc tính từ gốc repo. Cụm “mục bên dưới”, “tệp này” hoặc tên mục không kèm file là tham chiếu của bản gốc: dùng INDEX.md để tìm đúng tài liệu mới.

**Ghi chú đối chiếu:** Đoạn mở đầu gốc nói toàn bộ tài liệu ở “tệp này” và “đọc mục bên dưới”; sau khi tách phải tra INDEX.md. Phần ngoại lệ về test có mô tả cũ “không có bộ chạy test”, trong khi testing.md có Playwright mới hơn. Không tự dựng framework mới, cũng không bỏ E2E hiện có.

---

# CLAUDE.md — Gia sư Hóa 11

Nền tảng tự học Hoá học 11 theo chương trình Kết nối tri thức 2018: 25 bài giảng,
gia sư AI (Gemini), ngân hàng câu hỏi, đề kiểm tra và hai trò chơi ôn tập. Người dùng
là học sinh lớp 11 và giáo viên phổ thông. Dùng cho một đề tài nghiên cứu khoa học,
nên tính đúng đắn của nội dung hoá học quan trọng hơn mọi thứ khác.

Nguyên tắc dài hạn của dự án nằm ở `.specify/memory/constitution.md`; tệp này là
hướng dẫn vận hành hằng ngày và không được mâu thuẫn với tệp đó.

> File này mô tả dự án ĐANG như thế nào, để bạn (AI) khỏi phải dò lại toàn bộ code mỗi phiên.
> Đây là mặc định, KHÔNG phải xiềng: nếu user muốn đổi UI/Auth/nhà cung cấp AI/cấu trúc, cứ làm theo user — chỉ cần báo trước là sẽ lệch khỏi mô tả dưới đây.

**Sắp sửa vùng nào thì đọc mục đó TRƯỚC, đừng làm theo trí nhớ.** Tệp dài
~11.600 từ; cái hại của nó không phải tốn chỗ mà là bị đọc lướt. Bảng này để
nhảy thẳng:

| Sắp đụng vào | Đọc mục |
|---|---|
| Đăng nhập, vai trò, vào lớp, đăng ký | Vài điểm dễ vấp |
| `firestore.rules` | An ninh dự án → "Bảy điều về luật hiện hành" |
| `index.css`, màu, chế độ tối | Bảng màu & chế độ sáng / tối |
| `public/_headers`, CSP, deploy | An ninh dự án → "Ba cái bẫy của `_headers`" |
| Giao diện, bố cục, kiểu dáng | Thế giới thị giác |
| Ngân hàng câu hỏi, bài đã nộp, đồng bộ | **Kiến trúc dự án** |
| Đọc ngân hàng ở màn học sinh, hạn mức Firestore | Kiến trúc dự án → "Hạn mức đọc" |
| Gia sư AI, hạn mức, khoá Gemini | An ninh dự án + Nhờ Gemini soi nội dung |
| Viết/sửa phép kiểm | Lệnh + Rút kinh nghiệm |

**Chín bài học ở mục "Rút kinh nghiệm" là phần đắt nhất của tệp này** — mỗi cái
đổi bằng một lần hỏng đã tới tay người dùng. Đọc trước khi tin trí nhớ.


## Cách làm việc (luôn áp dụng)
- Trả lời bằng tiếng Việt; giữ nguyên tiếng Anh cho tên biến/hàm/file/lệnh/code.
- Trả lời gọn, đi thẳng việc. Yêu cầu chưa rõ hoặc thiếu thông tin → HỎI LẠI trước, đừng đoán rồi làm sai.
- Việc lớn/mơ hồ: nói ngắn gọn định làm gì rồi mới code, để user kịp chỉnh hướng.
- **XEM DANH SÁCH KỸ NĂNG TRƯỚC KHI ĐỌC MÃ.** Repo có gần 30 kỹ năng ở
  `.claude/skills/`, nạp sẵn mỗi phiên, chọn một cái chỉ tốn một câu. Bốn mốc
  BẮT BUỘC dừng lại tự hỏi "việc này có kỹ năng nào không":

  | Khi | Gọi |
  |---|---|
  | User mô tả việc còn mơ hồ, hoặc có nhiều đường làm | `brainstorming` |
  | Có gì đó hỏng / sai / chạy không như mong đợi | `systematic-debugging` |
  | Sắp nói "xong" | `verification-before-completion` |
  | Việc nhiều bước, nhiều tệp | `writing-plans` rồi `executing-plans` |

  **Việc chạm từ 3 TỆP trở lên: NÓI RA một dòng TRƯỚC KHI gõ dòng mã đầu tiên**
  — *"việc này ~N tệp, tôi gọi `writing-plans`"*, hoặc *"~N tệp, tôi không gọi
  kỹ năng nào, vì …"*. Nói ra là đủ; không cần dài.

  Vì sao siết thành "nói ra" (20/09/2026): bảng trên vốn chỉ là lời nhắc thụ
  động, và nó **thất bại có bằng chứng**. Hôm đó hook nhắc đúng bảng này **25
  lượt liên tiếp**, mà cả hai việc lớn trong ngày đều bỏ qua nó — dựng Playwright
  (9 tệp) và làm `soat:hoa-hoc` + `kiem-tra:gemini` (5 tệp) đều chạy tuỳ cơ ứng
  biến, không gọi `writing-plans` lần nào. Kết quả vẫn dùng được, nên **không ai
  phát hiện ra là quy tắc đang bị bỏ** cho tới lúc ngồi rà lại cuối ngày.

  Đó là bài học chung, không riêng chỗ này: **một quy tắc không ai NHÌN THẤY
  được thì không ai kiểm được.** Bắt nói ra biến nó thành thứ chủ dự án bắt lỗi
  được ngay trong lượt đó. Giống hệt lý do mọi luật khác của dự án đều có một
  phép kiểm đi kèm — khác mỗi chỗ luật này chỉ người kiểm được, không có script
  nào kiểm hộ.

  Hai lần khác đã trả giá, giữ lại để nhớ: một lần định đọc ~18.000 dòng mã trò
  chơi để "chuyển chúng sang thế giới mới", trong khi `brainstorming` hỏi đúng
  một câu ("trò chơi có cần thế giới của app không?") là việc co lại còn sửa một
  chỗ nối; một lần đoán nguyên nhân lỗi CSP thay vì chạy `systematic-debugging`
  ngay từ đầu.

  Kỹ năng `find-skills` là việc KHÁC: nó đi tìm kỹ năng **chưa có** trên
  Internet (chạy `npx skills find`, cần mạng). Đừng lẫn hai việc.
- Sửa xong một việc: chạy `npm run lint` MỘT LẦN trước khi báo xong. Bỏ qua nếu chỉ đổi chữ/màu/comment. Không chạy sau mỗi chỉnh nhỏ.
- KHÔNG tự chạy `npm run build`, git nguy hiểm (reset/xoá/ghi đè), push/deploy — user tự làm.
- Ưu tiên sửa đúng file/màn hình user chỉ ra; chỉ đọc rộng khi thật sự chưa biết lỗi ở đâu.
- **Thấy lỗi NGOÀI phạm vi được giao thì BÁO, đừng tự vá.** Đang làm việc A mà phát
  hiện lỗi B không liên quan: nói ra kèm số đo, rồi hỏi có sửa luôn không. Chỉ tự sửa
  khi B chặn mất việc A. Lý do: mỗi commit nên đúng bằng phần user yêu cầu, không rộng
  hơn — người duyệt mới soi được. Cũng đừng "cải thiện" đoạn mã kề bên, đừng sửa chú
  thích hay định dạng không liên quan, và thấy mã chết thì nhắc chứ đừng xoá.


## Kỹ năng trong repo (`.claude/skills/`)

Mở Claude Code ở thư mục dự án thì các kỹ năng này tự nạp, gọi bằng dấu gạch chéo:

- **`karpathy-guidelines`** — bốn nguyên tắc hành vi: nghĩ trước khi code, ưu tiên đơn
  giản, sửa đúng chỗ, đặt tiêu chí nghiệm thu. Lấy nguyên văn từ
  `github.com/multica-ai/andrej-karpathy-skills` (giấy phép MIT), bản ngày 20/04/2026.
  **Giữ nguyên văn** — sửa thì mất mạch với bản gốc; muốn khác thì ghi vào chính
  `CLAUDE.md` này.
- **`speckit-*`** (10 kỹ năng) — quy trình Spec-Driven Development của GitHub Spec Kit
  1.0.4: `/speckit-constitution`, `/speckit-specify`, `/speckit-plan`, `/speckit-tasks`,
  `/speckit-implement`, `/speckit-converge`, cùng bốn cái tuỳ chọn. Do `specify init`
  sinh ra, đừng sửa tay — chạy lại lệnh đó khi nâng cấp.
- **`impeccable`** — quy trình thiết kế giao diện: chốt sự thật sản phẩm, bốc hướng,
  viết hợp đồng hướng, dựng, rồi duyệt kết thúc. Thế giới thị giác hiện tại của dự án
  ra đời từ đây; xem mục "Thế giới thị giác" bên dưới.
- **14 kỹ năng `superpowers`** — cách LÀM VIỆC, không phải cách viết code:
  `brainstorming`, `writing-plans`, `executing-plans`, `systematic-debugging`,
  `verification-before-completion`, `requesting-code-review`, `receiving-code-review`,
  `test-driven-development`, `using-git-worktrees`, `dispatching-parallel-agents`,
  `subagent-driven-development`, `finishing-a-development-branch`, `writing-skills`,
  `using-superpowers`. Chép nguyên văn từ `github.com/obra/superpowers` v6.3.0 (MIT).
  Nguồn gốc, giấy phép và cách nâng cấp: `.claude/skills/SUPERPOWERS-LICENSE.md`.
- **`vercel-composition-patterns`, `vercel-react-best-practices`** — lối viết
  component React ghép được, và hiệu năng React. Chép từ
  `github.com/vercel-labs/agent-skills` (MIT), bản ngày 10/09/2026. Chỉ lấy 2
  trong 9 kỹ năng của repo đó; bảy cái kia hoặc chỉ dùng cho Vercel (dự án này
  lên Cloudflare Pages), hoặc mâu thuẫn với hợp đồng hướng, hoặc phải tải hướng dẫn từ URL
  lúc chạy. Lý do từng cái: `.claude/skills/VERCEL-SKILLS-LICENSE.md`.
- **`find-skills`** — đi TÌM kỹ năng chưa có trên Internet (`npx skills find`,
  bảng xếp hạng skills.sh). Chép từ `github.com/vercel-labs/skills` (MIT) — repo
  này là **trình cài đặt CLI**, không phải bộ kỹ năng; chỉ lấy đúng tệp
  `SKILL.md` của `find-skills`, không cài CLI. **Phải hỏi user trước khi chạy
  `npx skills`**: lệnh đó tải và chạy mã từ npm. **Ngoại lệ DUY NHẤT (26/09/2026,
  chủ dự án cho phép):** `npx skills find …` được chạy không cần hỏi — chỉ tìm, không
  cài; quyền nằm ở `.claude/settings.local.json` (máy riêng, không theo git).
  `npx skills add`/`update` vẫn phải hỏi. Đừng lẫn nó với việc dùng kỹ
  năng đã có — việc đó nằm ở mục "Cách làm việc" bên trên.
- **`wrangler`, `workers-best-practices`, `cloudflare`** — làm việc với Cloudflare
  (Pages Functions, D1, Workers AI, deploy bằng Wrangler). Cài ngày 01/10/2026 bằng
  `npx skills add` (user đồng ý) từ `github.com/cloudflare/skills` (Apache-2.0); mã băm
  trong `skills-lock.json`. Chúng dặn tra tài liệu Cloudflare lúc chạy — ngoại lệ có lý
  do so với tiền lệ loại kỹ năng Vercel; dùng `curl` vì WebFetch bị chặn. Chi tiết:
  `.claude/skills/CLOUDFLARE-SKILLS-LICENSE.md`.

### Ba chỗ superpowers nói khác dự án này — theo dự án

Nhóm kỹ năng trên viết cho một dự án phần mềm điển hình. Repo này khác ở ba điểm, và
khi mâu thuẫn thì **`CLAUDE.md` thắng**:

1. **`test-driven-development` bảo viết test trước khi viết code.** Dự án này KHÔNG có
   bộ chạy test nào — không Vitest, không Jest. Hàng rào là `npm run lint` cộng mười một bộ
   kiểm tự viết trong `scripts/`. "Viết test trước" ở đây nghĩa là **viết phép kiểm
   trước**, thêm vào đúng bộ kiểm liên quan. Đừng tự dựng khung test mới khi user không
   yêu cầu.
2. **`using-git-worktrees`, `finishing-a-development-branch`, `dispatching-parallel-agents`
   giả định AI tự quản nhánh, tự trộn, tự đẩy.** Ở đây thì không: mục "Cách làm việc" đã
   chốt là KHÔNG tự chạy `npm run build`, git nguy hiểm, push hay deploy — user tự làm.
3. **`verification-before-completion` đòi chạy lệnh kiểm rồi mới được nói "xong".** Cái
   này ăn khớp với dự án, và mạnh hơn: bài học số 1 trong mục "Rút kinh nghiệm" nói
   đừng tin dòng chữ "xong" của chính script mình viết. Dùng nó.

Một điểm nữa: bản chép này KHÔNG có hook lúc mở phiên như bản plugin, nên kỹ năng
`using-superpowers` phải được gọi ra chứ không tự nhắc.

`.gitignore` chặn `.claude/*` nhưng CỐ Ý mở ngoại lệ `!.claude/skills/`, để kỹ năng
theo được `git pull` sang máy khác. Phần còn lại của `.claude/` (vd `settings.local.json`)
vẫn bị chặn vì chứa cấu hình riêng từng máy.

