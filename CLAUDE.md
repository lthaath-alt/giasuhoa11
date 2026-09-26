# Gia sư Hóa 11 — hướng dẫn hằng ngày

Nền tảng tự học Hóa 11 Kết nối tri thức 2018 cho học sinh và giáo viên, phục vụ đề tài NCKH. Tính đúng đắn hóa học là ưu tiên cao nhất.
Nguyên tắc dài hạn: `.specify/memory/constitution.md`; hướng dẫn này không được mâu thuẫn với hiến chương.
Đây là bản tổ chức lại từ tài liệu người dùng cung cấp, chưa đối chiếu với repo đang chạy. Các mô tả hiện trạng là mặc định; thay đổi sản phẩm/công nghệ theo yêu cầu người dùng thì báo rõ tác động.

## Cách làm việc
- Trả lời tiếng Việt, gọn; giữ tên biến, hàm, file và lệnh nguyên dạng. Thiếu thông tin quyết định cách làm thì hỏi trước, không đoán.
- Việc lớn hoặc mơ hồ: nói ngắn gọn hướng làm trước khi sửa. Chỉ sửa trong phạm vi được giao; lỗi ngoài phạm vi thì báo, chỉ tự sửa nếu chặn việc đang làm.
- Xem danh sách kỹ năng có sẵn trước khi đọc mã, chỉ nạp kỹ năng liên quan. Mơ hồ → `brainstorming`; lỗi → `systematic-debugging`; nhiều bước/nhiều tệp → `writing-plans` rồi `executing-plans`; trước khi báo xong → `verification-before-completion`.
- Chạm từ 3 tệp: nói rõ số tệp dự kiến và kỹ năng sẽ dùng, hoặc lý do không dùng, trước khi sửa.
- Không tự build, push, deploy, publish luật hay chạy git nguy hiểm (reset/xóa/ghi đè). Người dùng tự làm; build chỉ khi được yêu cầu. Không tự thêm khung test mới.
- Hỏi trước khi chạy `npx skills` để tải/chạy mã bên ngoài; ngoại lệ duy nhất là `npx skills find` (chỉ tìm, xem `docs/claude-reference/workflow.md`). Không sửa tay kỹ năng bên thứ ba; xem tài liệu quy trình khi cần cập nhật.
- Bắt đầu từ file/màn hình được chỉ ra; chỉ đọc rộng khi chưa đủ bằng chứng. Đo trước khi sửa; mã nguồn không thay được phép kiểm hành vi thực tế.
- Chỉ đọc các tài liệu liên quan trong bảng dưới, không đọc cả bộ mỗi phiên. Đường dẫn là chỉ dẫn đọc khi cần, không phải lệnh import toàn bộ.

## Đọc trước khi sửa vùng liên quan
Tất cả đường dẫn tính từ gốc repo. Bảng dưới là bước bắt buộc trước khi sửa, không phải danh sách đọc tùy thích: chọn đủ các dòng liên quan; nếu phạm vi mở rộng thì đọc thêm trước khi tiếp tục. Thiếu tài liệu thì báo rõ và lấy lại tài liệu trước khi sửa phần phụ thuộc vào nó; không suy đoán quy tắc bị thiếu.
Các tài liệu giữ nguyên nội dung gốc. Quy tắc bắt buộc và quyết định sản phẩm vẫn có hiệu lực khi chuyển sang file phụ; không được bỏ qua chỉ vì chúng nằm trong đoạn ghi ngày cũ. Số đo, phiên bản, quota và trạng thái dịch vụ là ghi nhận tại thời điểm đó: khi nhiệm vụ phụ thuộc vào chúng, xác minh điều cần thiết, không rà lại toàn hệ thống.
Nếu bản tóm tắt thiếu chi tiết thì đọc mục gốc qua `docs/claude-reference/INDEX.md`. Không dùng câu rút gọn để nới quyền, bỏ kiểm tra hoặc đổi quyết định. Khi tài liệu mâu thuẫn: chỉ ra xung đột, kiểm mã/hành vi liên quan; hỏi người dùng nếu phải đổi quyết định hoặc quyền. Không tự coi ghi chú có ngày mới hơn là giấy phép thay đổi.

| Công việc | Tài liệu bắt buộc đọc phần liên quan |
|---|---|
| Quy trình, kỹ năng, ngoại lệ, lý do các quy tắc | `docs/claude-reference/workflow.md` |
| Thêm trang, cấu trúc, đổi stack | `docs/claude-reference/project.md` |
| Auth, vai trò, hồ sơ, đăng ký, vào lớp | `docs/claude-reference/auth.md` và `docs/claude-reference/security.md` |
| Ngân hàng, bài nộp, tiến độ, đồng bộ, quota đọc | `docs/claude-reference/data.md`; thay luồng đọc/ghi, quyền hoặc render dữ liệu thì đọc thêm `docs/claude-reference/security.md` |
| Luật Firestore, HTML, postMessage, CSP, App Check, khóa AI | `docs/claude-reference/security.md` |
| Test, E2E, lỗi không tái hiện, thay thế hàng loạt | `docs/claude-reference/testing.md` |
| Soát hóa học, Gemini CLI/API, sửa câu hỏi, liệt kê tài khoản | `docs/claude-reference/chemistry.md`; ghi ngân hàng thì đọc thêm `docs/claude-reference/data.md` và `docs/claude-reference/security.md` |
| Gia sư AI trên web, hết lượt, khóa riêng, lỗi kết nối | `docs/claude-reference/security.md`, `docs/claude-reference/deployment.md`, `docs/claude-reference/product-decisions.md`; chỉ đọc `docs/claude-reference/chemistry.md` nếu liên quan script/CLI hoặc soát nội dung |
| Deploy, biến môi trường, trắng trang, F5 lỗi | `docs/claude-reference/deployment.md` và phần liên quan của `docs/claude-reference/security.md` |
| Giao diện, màu, sáng/tối, MUI | `docs/claude-reference/ui.md`, `.impeccable/surfaces/app.md`, `PRODUCT.md`; xem thêm MUI trong `docs/claude-reference/auth.md` |
| Hạn mức khách, trò chơi mở khóa, PWA | `docs/claude-reference/product-decisions.md` |

## Kiến trúc tối thiểu
- Theo bản gốc: React 19, Vite 6, TypeScript 5.8, MUI v9, Tailwind v4, emotion, React Router v7; kiểm `package.json` trước khi thay phụ thuộc. Không mặc định đã có react-hook-form, zod, recharts.
- Import một chiều: `pages → features → core`. Trang ở `src/pages/`; phần tính năng ở `src/features/`; khối chung ở `src/core/`. Firestore/AI qua service, không viết thẳng trong component.
- Auth: Firebase Auth; trạng thái qua `AppContext`/`useApp()`. Hồ sơ `users/{uid}` phải khớp uid Auth. Tạo tài khoản qua luồng hiện có và app Auth phụ khi tạo hộ; không chỉ ghi hồ sơ Firestore. Không lưu mật khẩu trong hồ sơ.
- Bốn vai, chữ thường có gạch dưới: `'admin'`, `'school_admin'`, `'teacher'`, `'student'` — khai ở `src/features/auth/types.ts`. Dòng này không phải để trang trí: `kiem-tra:tai-lieu` đọc `UserRole` trong mã rồi bắt CLAUDE.md nhắc đủ cả bốn, thiếu một tên là bộ kiểm đỏ.
- AI trên web mặc định qua Firebase AI Logic; script dùng đường Gemini riêng. Bản gốc có ghi chú mới hơn về khóa riêng người dùng khi hết hạn mức ngày: đọc `docs/claude-reference/security.md` trước khi sửa, không dựa vào bảng stack cũ để xóa tính năng.
- Ngân hàng thật ở Firestore `bank_questions`; `public/bank/ngan-hang.json` là bản chụp. Không sửa tay `src/features/lessons/constants.ts` do máy sinh.
- Không dùng `getAll()` hay nhánh đếm tải cả kho ở màn học sinh; truy vấn theo bài/chương/ids. Giữ dữ liệu câu hỏi cập nhật mà không buộc deploy lại để đổi số đếm.
- Bài đã nộp đồng bộ qua `bai_nop/{quizId}`; localStorage vẫn phục vụ bài đang làm. Không đổi lỗi đồng bộ thành trạng thái đã đẩy. Không coi điểm trình duyệt là chống gian lận hoàn chỉnh.

## Các ràng buộc phải giữ
- Không commit khóa/mật khẩu, `.env.local`, dữ liệu phiên `tests/.auth/` hoặc CSV chứa email học sinh. Không đọc/in mật khẩu; để người dùng nhập hoặc script dùng biến môi trường theo quy trình hiện có.
- Không nhúng khóa Gemini vào biến môi trường `VITE_*`. Khóa riêng do người dùng nhập là trường hợp khác, phải theo đúng tài liệu bảo mật.
- Nội dung không tin cậy phải qua bộ lọc hiện có; mọi `dangerouslySetInnerHTML` qua `locHtml`; kiểm origin của postMessage; kiểm cả `src/` lẫn `public/games/`.
- Sửa Firestore Rules: giữ đọc công khai ngân hàng để đồng bộ; không nới phân quyền. Đọc đủ bảy điều về luật trong `docs/claude-reference/security.md`. Gửi nguyên tệp và phép thử cho người dùng; mã trong git không chứng minh luật đã publish.
- Chỉ gửi nội dung câu hỏi khi nhờ mô hình ngoài soát, không gửi dữ liệu học sinh. AI nêu lỗi phải tự kiểm lại; người dùng quyết cách sửa và tự ghi dữ liệu thật. Không tự soát cả kho hay tự sửa hàng loạt.
- Không tự thêm PWA/service worker. Nếu người dùng yêu cầu thì giải thích ảnh hưởng cache và xác nhận theo quy tắc gốc.
- Không sửa `hmr`/`watch` trong `vite.config.ts` do AI Studio điều khiển.
- UI: hệ nhãn GHS, góc vuông/nét kẻ, không bóng mềm/chuyển sắc; đỏ cho hành động chính, lỗi và đang chọn. Trong TSX dùng biến màu theo vai; MUI palette và tranh vẽ có ngoại lệ trong tài liệu UI. Biến màu chữ không thay được biến màu nền.

## Kiểm tra và bàn giao
| Khi nào | Thực hiện |
|---|---|
| Hoàn tất thay đổi mã | `npm run lint` một lần trước khi báo xong; miễn nếu chỉ đổi chữ/màu/comment |
| Trước commit | `npm run kiem-tra`; nêu rõ bộ bị bỏ qua và nguyên nhân |
| Thay đổi màu | `npm run kiem-tra:mau`, kiểm cả sáng/tối |
| Bảo mật / luật | Bộ kiểm liên quan theo `docs/claude-reference/security.md`; không nới test để che lỗi |
| Luồng trình duyệt / đăng nhập | Đọc `docs/claude-reference/testing.md` trước E2E: có ghi dữ liệu thật, cần tài khoản thử riêng |
| Chạy script sửa file | Đọc lại đúng phần đã sửa; không chỉ tin thông báo thành công |

Xem danh sách lệnh trong `docs/claude-reference/testing.md` và script thực tế. Không chạy lại toàn bộ bộ kiểm sau mỗi chỉnh nhỏ; giữ các mốc kiểm bắt buộc nêu trên.
Các bài học chung phải áp dụng dù không mở tài liệu kiểm thử (bản đầy đủ trong `docs/claude-reference/testing.md`):
- Sau script sửa file, kiểm nội dung thực tế; thông báo thành công không chứng minh đã ghi.
- Regex thay hàng loạt phải neo ranh giới, đếm trước/sau; tránh khớp `color` vào `bgcolor`.
- Đo bố cục khi tab đang hiển thị (`document.hidden`); tab ẩn có thể trả kích thước/style sai.
- Xác định sai ở test hay code trước khi sửa; không ép hành vi đúng theo test sai.
- Đóng tab trò chơi sau khi thử để không để nhạc tiếp tục phát.
- Đo trước khi sửa và lưu số đo cần thiết, không ước lượng.
- Thêm trường User: rà mọi chỗ dựng hồ sơ/ép kiểu `as User`, không chỉ sửa kiểu.
- Console có thể giữ lỗi qua reload; mở tab mới hoặc đo trực tiếp thay vì tin cảnh báo cũ.
- Khả năng dịch vụ phải được xác nhận bằng phép gọi phù hợp khi cần; chuỗi còn trong mã không chứng minh server còn hỗ trợ. Không biết kiểu xác thực thì không tắt hàng rào quota; báo cáo nhiều lượt phải có tên riêng để không ghi đè.
Báo xong gồm: đã đổi gì, đã kiểm gì, điều chưa kiểm/giới hạn còn lại. Giữ các tài liệu chi tiết đồng bộ khi thay đổi kiến trúc; không dồn nhật ký sự cố trở lại file này.
