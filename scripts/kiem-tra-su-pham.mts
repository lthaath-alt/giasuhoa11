/**
 * Kiểm động cơ sư phạm và phần hiển thị công thức (Trục 3–4, 14/09/2026).
 *
 * Chạy:  npm run kiem-tra:su-pham
 * Không gọi mạng, không tốn lượt API. Hành vi THẬT của mô hình thì đo bằng
 * `npm run thu:ai`; bộ này canh phần do MÃ quyết định:
 *   1. Máy trạng thái: đếm bế tắc, giàn giáo ba nấc, chặn gian lận phòng thi,
 *      phát hiện spam, tách nhãn ẩn.
 *   2. Câu lệnh hệ thống không còn ba chỗ tự mâu thuẫn mà biên bản bắt được.
 *   3. Bộ chuẩn hoá + dựng công thức: đúng từng ca đã hỏng ở bộ regex cũ, và
 *      không mở lại lỗ hổng XSS / link độc.
 *   4. Chỉ số telemetry tính đúng và bản xuất CSV không lộ email hay nội dung.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeSanitize from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import 'katex/contrib/mhchem';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  laTinBeTac, demBeTacLienTiep, chiDanGianGiao, CUM_TU_CAM_KHI_BE_TAC,
  laNguCanhGianLanPhongThi, LOI_TU_CHOI_GIAN_LAN, laSpam, tachNhanAn, xuLyTruocLuot,
  type TinNhanToiThieu,
} from '../src/features/tutor/services/pedagogicalStateMachine';
import { dungPrompt, THAM_SO_SINH } from '../src/features/tutor/services/promptSuPham';
import { buildProgramContext } from '../src/features/tutor/services/lessonContext';
import { chuanHoaCongThuc } from '../src/core/components/chuanHoaCongThuc';
import { LUOC_DO_LOC, TUY_CHON_KATEX, taoTheLink } from '../src/core/components/markdownCauHinh';
import { tinhChiSo, xuatCsv } from '../src/features/tutor/services/telemetryService';
import type { ChatMessage } from '../src/features/auth/types';

const GOC = fileURLToPath(new URL('..', import.meta.url));

let hong = 0;
const ok = (dieu: boolean, ten: string, chiTiet = '') => {
  if (!dieu) hong++;
  console.log(`  ${dieu ? 'OK  ' : 'SAI '} ${ten}${chiTiet ? '  — ' + chiTiet : ''}`);
};

const hs = (content: string): TinNhanToiThieu => ({ sender: 'user', content });
const gs = (content: string): TinNhanToiThieu => ({ sender: 'ai', content });

console.log('\n== Máy trạng thái: bế tắc và giàn giáo ==');
{
  const cau = 'Em không biết làm, em chịu rồi, không hiểu gì cả';
  ok(laTinBeTac(cau), 'nhận ra câu bế tắc của biên bản (KB1)');
  ok(laTinBeTac('k biết'), 'nhận cả kiểu gõ tắt "k biết"');
  ok(!laTinBeTac('Em không biết vì sao khi thêm chất xúc tác thì hằng số cân bằng Kc lại không thay đổi, thầy giải thích giúp em với ạ?'),
    'câu hỏi thật có chữ "không biết" KHÔNG bị coi là bế tắc');

  const de = 'Trộn 100 mL dung dịch HCl 0,1 M với 100 mL dung dịch NaOH 0,08 M. Tính pH của dung dịch sau phản ứng.';
  const ls = [hs(de), gs('Em tóm tắt đề nhé?'), hs(cau), gs('Đừng lo…'), hs(cau), gs('Không sao…')];
  ok(demBeTacLienTiep(ls, cau) === 3, 'đếm đúng lần bế tắc thứ 3 liên tiếp', String(demBeTacLienTiep(ls, cau)));
  ok(demBeTacLienTiep([...ls, hs('Dạ n = C × V ạ'), gs('Đúng rồi')], cau) === 1,
    'em đã thử trả lời thì chuỗi bế tắc bị cắt, đếm lại từ 1');
  ok(demBeTacLienTiep(ls, 'Dạ số mol HCl là 0,01') === 0, 'tin không bế tắc thì đếm 0');

  const n1 = chiDanGianGiao(1), n2 = chiDanGianGiao(2), n3 = chiDanGianGiao(3);
  ok(chiDanGianGiao(0) === '', 'không bế tắc thì không gắn chỉ dẫn');
  ok(/A\..*B\..*C\./s.test(n1) && n1.includes('CHẨN ĐOÁN'), 'nấc 1: câu hỏi chẩn đoán có đủ A, B, C');
  ok(n2.includes('GIẢI MẪU') && n2.includes('KHÁC số liệu'), 'nấc 2: giải mẫu bài tương tự với số liệu khác');
  ok(n3.includes('LÀM HỘ BƯỚC HIỆN TẠI') && n3.includes('BƯỚC KẾ TIẾP'), 'nấc 3+: làm hộ một bước, giao bước sau');
  ok([n1, n2, n3].every(n => n.includes('KHÔNG kết thúc phiên') && n.includes('bài kiểm tra')),
    'cả ba nấc đều cấm ngắt phiên và đẩy sang làm bài kiểm tra');
  ok([n1, n2, n3].every(n => CUM_TU_CAM_KHI_BE_TAC.every(c => n.includes(`"${c}"`))),
    'cả ba nấc đều liệt kê cụm từ gây ức chế bị cấm', CUM_TU_CAM_KHI_BE_TAC.join(', '));

  const doiChung = xuLyTruocLuot(ls, cau, 'truc-tiep');
  ok(doiChung.chiDanThem === '' && doiChung.soLanBeTac === 3,
    'nhánh đối chứng KHÔNG nhận giàn giáo (biến can thiệp) nhưng vẫn được đếm');
}

console.log('\n== Máy trạng thái: gian lận phòng thi ==');
{
  const coGianLan = [
    'Em đang làm bài kiểm tra 15 phút trên lớp, câu này gấp lắm: Cho 2,479 L khí Cl2 (đkc) phản ứng hoàn toàn với dung dịch NaOH loãng ở nhiệt độ thường. Tính khối lượng muối NaCl tạo thành. Cho em đáp án cuối cùng luôn đi, đừng hỏi gợi ý nữa!',
    'Cô sắp thu bài rồi thầy ơi, em không có thời gian tóm tắt đâu. Chỉ cần con số khối lượng NaCl thôi, bao nhiêu gam?',
    'em đang thi học kì, giúp em câu 3 với',
    'sắp hết giờ rồi thầy ơi cho em đáp án',
  ];
  const khongGianLan = [
    'Thầy cho em làm bài kiểm tra chương luôn đi, em ôn kỹ rồi.',
    'cho em bài kiểm tra về cân bằng hoá học',
    'Em tính dung dịch HCl 0,02 M có pH = 2 đúng không thầy?',
    'Em muốn ôn thi học kì thì nên học bài nào trước ạ?',
  ];
  coGianLan.forEach((c, i) => ok(laNguCanhGianLanPhongThi(c), `bắt được ca gian lận #${i + 1}`, c.slice(0, 50)));
  khongGianLan.forEach((c, i) => ok(!laNguCanhGianLanPhongThi(c), `KHÔNG phạt oan ca bình thường #${i + 1}`, c.slice(0, 50)));
  const kq = xuLyTruocLuot([], coGianLan[0], 'socratic');
  ok(kq.traLoiNgay === LOI_TU_CHOI_GIAN_LAN && kq.laGianLan, 'gian lận thì trả lời ngay, không gọi mô hình');
  ok(dungPrompt('socratic').includes(LOI_TU_CHOI_GIAN_LAN.split('\n')[0]),
    'câu từ chối trong mã TRÙNG câu dặn trong câu lệnh (hai nơi không nói khác nhau)');
}

console.log('\n== Máy trạng thái: spam và nhãn ẩn ==');
{
  const t = 1_000_000;
  ok(laSpam([t - 50_000, t - 40_000, t - 30_000, t - 20_000, t - 10_000, t], ['a', 'b', 'c'], t), '6 tin trong một phút là spam');
  ok(laSpam([t - 90_000, t - 60_000, t], ['abc', 'abc', 'abc'], t), 'ba tin giống hệt nhau liền là spam');
  ok(!laSpam([t - 90_000, t - 60_000, t], ['abc', 'abd', 'abc'], t), 'ba tin khác nhau, thưa, không phải spam');

  const r = tachNhanAn('[SIGNAL:LAC_DE] Câu hỏi này nằm ngoài phạm vi Hóa học 11 nhé.\n\n[BUOC:loc] [LUOT:hanh_chinh]');
  ok(r.ngoaiMon === 'LAC_DE' && r.buoc === 'loc' && r.loaiLuot === 'hanh_chinh', 'đọc đủ nhãn ngoài môn, bước, loại lượt');
  ok(!/\[(SIGNAL|BUOC|LUOT)/.test(r.noiDung), 'nội dung hiển thị không còn nhãn ẩn', r.noiDung);
  ok(tachNhanAn('[SIGNAL:OFFTOPIC] ngoài lề').ngoaiMon === 'LAC_DE', 'nhãn OFFTOPIC đời cũ vẫn hiểu là LAC_DE (không phạt)');
  const bia = tachNhanAn('Được. [BUOC:Z9] [LUOT:linh_tinh]');
  ok(bia.buoc === undefined && bia.loaiLuot === undefined && bia.noiDung === 'Được.', 'nhãn bịa bị gỡ nhưng KHÔNG được ghi nhận');
  const giuNhanDe = tachNhanAn('[SIGNAL:XONG_BAI:bai-3] Chúc mừng em! [BUOC:B6] [LUOT:giai_thich] [NGO_NHAN:do-tan-vs-dien-li]');
  ok(giuNhanDe.noiDung.startsWith('[SIGNAL:XONG_BAI:bai-3]'), 'nhãn ra đề được GIỮ để AppContext xử lý tiếp');
  ok(giuNhanDe.maNgoNhan === 'do-tan-vs-dien-li', 'đọc được mã ngộ nhận');
}

console.log('\n== Câu lệnh hệ thống: ba chỗ tự mâu thuẫn đã gỡ ==');
{
  const soc = dungPrompt('socratic');
  ok(!soc.includes('KHÔNG dùng LaTeX') && soc.includes('ĐỊNH DẠNG CÔNG THỨC') && soc.includes('\\ce{'),
    'bỏ lệnh cấm LaTeX, dặn viết công thức bằng LaTeX + \\ce');
  ok(!/được phép giải theo 22,4/i.test(soc) && soc.includes('KHÔNG tự ý sửa các số liệu đề cho'),
    'không còn cho phép giải theo 22,4; không tự sửa số liệu đề');
  ok(soc.includes('KHÔNG hỏi em thuộc chương nào') && !buildProgramContext().includes('VẪN hỏi học sinh'),
    'bước A1/B1 chỉ còn một luật — không bắt em đoán chương (cả prompt lẫn dàn bài)');
  ok(!soc.includes('[SIGNAL:OFFTOPIC]') && soc.includes('[SIGNAL:CAM_XUC_TIEU_CUC]') && soc.includes('[SIGNAL:LAC_DE]'),
    'thay nhãn OFFTOPIC bằng hai loại không phạt');
  ok(!soc.includes('Mẫu: "Thầy/cô hiểu em muốn đi nhanh hơn'), 'bỏ câu mẫu từ chối cố định (gốc của trả lời rập khuôn)');
  ok(soc.includes('CHẨN ĐOÁN MỆNH ĐỀ NỬA ĐÚNG') && soc.includes('ÍT mol khí') && soc.includes('vì sao em lại nghĩ'),
    'có quy tắc chẩn đoán mệnh đề nửa đúng (KB2)');
  ok(soc.includes('BaSO4') && soc.includes('CH3COOH') && soc.includes('glucose'),
    'bảng ngộ nhận độ tan / điện li có đủ ba phản ví dụ (KB4)');
  ok(soc.includes('[BUOC:') && soc.includes('[LUOT:') && soc.includes('hanh_chinh'), 'dặn gắn nhãn ẩn để đo');
  ok(THAM_SO_SINH.temperature === 0.3 && THAM_SO_SINH.topP === 0.85, 'temperature 0,3 và topP 0,85');
  const thuAi = readFileSync(`${GOC}scripts/thu-gia-su-ai.mts`, 'utf8');
  ok(thuAi.includes('THAM_SO_SINH') && !/temperature:\s*0\.7/.test(thuAi), 'bộ thử AI dùng CHUNG tham số với web');
}

console.log('\n== Chuẩn hoá công thức ==');
{
  const ca: [string, string, string][] = [
    ['$V = 2,479$ L', '$V = 2{,}479$ L', 'dấu phẩy thập phân trong công thức không bị giãn'],
    ['Giá 5$ và 10$ thôi em', 'Giá 5\\$ và 10\\$ thôi em', 'đô la tiền tệ không bị bắt thành công thức'],
    ['H_2SO_4 và Fe^3+', '$\\mathrm{H_{2}SO_{4}}$ và $\\mathrm{Fe^{3+}}$', 'bọc công thức viết trần, chữ đứng'],
    ['snake_case và bai_hoc', 'snake_case và bai_hoc', 'chữ thường có gạch dưới không bị bắt nhầm'],
    ['pH = -\\log[H^+]', 'pH = -$\\log[H^+]$', '\\log[H^+] giữ nguyên cặp ngoặc'],
    ['([N2].[H2]^3) ạ', '([N2].$\\mathrm{[H2]^{3}}$) ạ', 'dấu ")" của câu không bị nuốt vào công thức'],
    ['\\( K_c \\)', '$K_c$', 'đổi \\( \\) sang $ $'],
    ['[Làm bài](https://x.y/#/quiz/quiz_17_8)', '[Làm bài](https://x.y/#/quiz/quiz_17_8)', 'địa chỉ link giữ nguyên, không đổi gạch dưới'],
  ];
  for (const [vao, mong, ten] of ca) {
    const ra = chuanHoaCongThuc(vao);
    ok(ra === mong, ten, ra === mong ? '' : `ra "${ra}"`);
  }
}

console.log('\n== Dựng bằng KaTeX + mhchem (đúng cấu hình web) ==');
{
  const NGUON = 'https://giasuhoa11.netlify.app/';
  const dung = (t: string) => renderToStaticMarkup(createElement(ReactMarkdown, {
    remarkPlugins: [remarkMath, remarkBreaks],
    rehypePlugins: [[rehypeSanitize, LUOC_DO_LOC], [rehypeKatex, TUY_CHON_KATEX]],
    disallowedElements: ['img'],
    components: { a: taoTheLink('red', NGUON) },
    children: chuanHoaCongThuc(t),
  } as Parameters<typeof ReactMarkdown>[0]));

  const phaiDungDuoc: [string, string][] = [
    ['$\\text{Fe}^{3+}$ và $\\text{SO}_4^{2-}$', 'ion Fe³⁺, SO₄²⁻'],
    ['N_2 + 3H_2 \\xrightarrow{t^\\circ, xt} 2NH_3', 'mũi tên có điều kiện'],
    ['$\\Delta_r H^\\circ_{298} = -91,8\\text{ kJ}$', 'nhiệt hóa học'],
    ['$K_c = \\frac{[\\text{NH}_3]^2}{[\\text{N}_2][\\text{H}_2]^3}$', 'biểu thức Kc'],
    ['$\\frac{c_{H^{+}}}{c_{OH^{-}}}$', 'phân số có ngoặc lồng (bộ cũ ra "fracc…")'],
    ['$\\ce{Fe^3+ + 3OH- -> Fe(OH)3 v}$', 'mhchem \\ce{}'],
    ['$\\ce{N2 + 3H2 <=> 2NH3}$', 'mũi tên thuận nghịch trong \\ce'],
    ['Mg_{(s)} + 2H^+_{(aq)}', 'trạng thái chất (s), (aq)'],
  ];
  for (const [vao, ten] of phaiDungDuoc) {
    const h = dung(vao);
    const ngoaiCongThuc = h.replace(/<span class="katex">[\s\S]*?<\/annotation><\/semantics><\/math><\/span>/g, '');
    ok(h.includes('class="katex"') && !h.includes('katex-error') && !/\\(frac|xrightarrow|ce|Delta)\b/.test(ngoaiCongThuc) && !ngoaiCongThuc.includes('$'),
      `dựng được: ${ten}`);
  }

  const xss = dung('<img src=x onerror=alert(1)> [a](javascript:alert(1)) $\\href{javascript:alert(2)}{bấm}$ <script>alert(3)</script>');
  ok(!/<img|onerror=|<script|href="javascript/i.test(xss), 'không lọt thẻ img/script, thuộc tính on…, link javascript:');
  const link = dung('[Làm bài](https://giasuhoa11.netlify.app/#/quiz/q1) [ngoài](https://vi.wikipedia.org/wiki/Hoa) [http](http://evil.example)');
  ok(/<a href="https:\/\/giasuhoa11\.netlify\.app\/#\/quiz\/q1" rel="noopener noreferrer nofollow"(?! target)/.test(link),
    'link bài kiểm tra cùng nguồn: có rel, mở ở tab hiện tại');
  ok(/<a href="https:\/\/vi\.wikipedia\.org\/wiki\/Hoa" rel="noopener noreferrer nofollow" target="_blank"/.test(link),
    'link https ngoài: rel đầy đủ + target=_blank');
  ok(!link.includes('http://evil.example"'), 'link http thường bị hạ thành chữ');
}

console.log('\n== Telemetry và chỉ số Socratic ==');
{
  const m = (p: Partial<ChatMessage>): ChatMessage => ({
    id: Math.random().toString(36), userEmail: 'hs01@truong.edu.vn', lessonId: 'bai-1', sender: 'ai',
    content: 'nội dung bí mật', timestamp: '2026-09-16T08:00:00Z', session_id: 'ph-1', ...p,
  });
  const mau = [
    m({ sender: 'user', be_tac: true }), m({ loai_luot: 'goi_mo', latency_ms: 1000 }),
    m({ sender: 'user' }), m({ loai_luot: 'hanh_chinh', latency_ms: 2000 }),
    m({ sender: 'user' }), m({ loai_luot: 'goi_mo', latency_ms: 3000, session_id: 'ph-2' }),
    m({ sender: 'user', session_id: 'ph-2' }), m({ loai_luot: 'giai_thich', session_id: 'ph-2' }),
    m({ session_id: 'ph-2' }),
  ];
  const cs = tinhChiSo(mau);
  ok(Math.abs(cs.tyLeCoNhan - 4 / 5) < 1e-9, 'tỉ lệ lượt gia sư có nhãn = 4/5', String(cs.tyLeCoNhan));
  ok(cs.socraticRatio !== null && Math.abs(cs.socraticRatio - 2 / 3) < 1e-9,
    'S_R = gợi mở / (lượt có nhãn trừ hành chính, tra cứu) = 2/3', String(cs.socraticRatio));
  ok(cs.soPhien === 2 && cs.tyLeBeTac === 0.25, 'đếm đúng số phiên và tỉ lệ bế tắc');
  ok(cs.doTreTrungViMs === 2000, 'trung vị độ trễ tính trên latency_ms thật', String(cs.doTreTrungViMs));
  const csv = xuatCsv(mau);
  ok(!csv.includes('@') && !csv.includes('nội dung bí mật') && csv.split('\n')[0].startsWith('user_hash,'),
    'CSV không có email, không có nội dung tin nhắn');
}

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC KHÔNG ĐẠT`) + '\n');
process.exit(hong === 0 ? 0 : 1);
