/**
 * Kiểm động cơ sư phạm và phần hiển thị công thức (Trục 3–4, 14/09/2026).
 *
 * Chạy:  npm run kiem-tra:su-pham
 * Không gọi mạng, không tốn lượt API. Hành vi THẬT của mô hình thì đo bằng
 * `npm run thu:ai`; bộ này canh phần do MÃ quyết định:
 *   1. Máy trạng thái: đếm bế tắc, giàn giáo bốn nấc, chặn gian lận phòng thi,
 *      phát hiện spam, tách nhãn ẩn.
 *   2. Câu lệnh hệ thống không còn ba chỗ tự mâu thuẫn mà biên bản bắt được.
 *   3. Bộ chuẩn hoá + dựng công thức: đúng từng ca đã hỏng ở bộ regex cũ, và
 *      không mở lại lỗ hổng XSS / link độc.
 *   4. Chỉ số telemetry tính đúng và bản xuất CSV không lộ email hay nội dung.
 *   5. Khung chat gom tin theo phiên (nhomPhien.ts) đúng ranh giới phiên và ngày.
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
import { tinhChiSo, xuatCsv, gopTheoHocSinh, csvHocSinh } from '../src/features/tutor/services/telemetryService';
import { coDapSo, timDapAnChoTin } from '../src/features/tutor/services/chanRoDapSo';
import type { ChatMessage } from '../src/features/auth/types';
import { nhomTheoPhien, nhanNhom } from '../src/features/tutor/services/nhomPhien';
import { khoaAnTin, docMocAn, ghiMocAn, mocAnTatCa, locTheoMoc } from '../src/features/tutor/services/anTinCu';

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

  /* 26/09/2026, chủ dự án duyệt: đếm thêm "chịu" đứng riêng, "bt"/"bik", "hiểu"
     viết tắt và gõ không dấu. "chịu" chỉ tính khi cả tin chỉ có vậy, để "chịu
     nhiệt" không thành bế tắc. Trước đó "Ok biết rồi ạ" bị đếm là bế tắc vì
     "k biết" khớp giữa chữ "ok biết" — nay có ranh giới đầu từ. */
  const beTacMoi = ['em chịu', 'Chịu ạ.', 'chiu', 'ko bt', 'k bik', 'hk bt', 'ko hiểu', 'k hiểu', 'hk hiểu',
    'chả hiểu gì', 'khong biet', 'ko biet', 'khong hieu', 'em không biết'.normalize('NFD')];
  beTacMoi.forEach(c => ok(laTinBeTac(c), 'nhận cách nói bế tắc gõ tắt / không dấu', c.normalize('NFC')));
  ok(demBeTacLienTiep([hs('em chịu'), gs('Không sao…'), hs('ko bt'), gs('Mình thu hẹp nhé…')], 'khong biet') === 3,
    'chuỗi "em chịu" → "ko bt" → "khong biet" đếm đủ 3 lần');
  const khongBeTac = ['Chất nào chịu nhiệt tốt hơn ạ?', 'em chịu khó làm lại rồi, ra 0,1 M ạ', 'Ok biết rồi ạ',
    'Cô ko giao bt về nhà ạ?'];
  khongBeTac.forEach(c => ok(!laTinBeTac(c), 'KHÔNG coi là bế tắc', c));

  /* Bốn nấc từ 18/09/2026: nấc 2 "thu hẹp câu hỏi" được chèn thêm, đẩy giải
     mẫu xuống nấc 3 và làm hộ một bước xuống nấc 4. */
  const n1 = chiDanGianGiao(1), n2 = chiDanGianGiao(2), n3 = chiDanGianGiao(3), n4 = chiDanGianGiao(4);
  ok(chiDanGianGiao(0) === '', 'không bế tắc thì không gắn chỉ dẫn');
  ok(/A\..*B\..*C\./s.test(n1) && n1.includes('CHẨN ĐOÁN'), 'nấc 1: câu hỏi chẩn đoán có đủ A, B, C');
  ok(n2.includes('THU HẸP CÂU HỎI') && n2.includes('KHÔNG đưa đáp án') && n2.includes('KHÔNG giải mẫu'),
    'nấc 2: thu hẹp câu hỏi, chưa đưa đáp án và chưa giải mẫu');
  ok(n3.includes('GIẢI MẪU') && n3.includes('KHÁC số liệu'), 'nấc 3: giải mẫu bài tương tự với số liệu khác');
  ok(n4.includes('THU HẸP TỚI MỨC NHỎ NHẤT') && n4.includes('KHÔNG đưa đáp án'),
    'nấc 4+: thu hẹp tới mức nhỏ nhất, vẫn không đưa đáp án');
  ok(!n2.includes('GIẢI MẪU'), 'nấc 2 chưa giải mẫu, để dành cho nấc 3');
  /* Quy tắc 3 của chủ đề tài: bế tắc mấy lần cũng KHÔNG được đưa đáp án. Trước
     18/09/2026 nấc cuối làm hộ một bước của bài gốc; nay bỏ. */
  ok([n1, n2, n3, n4].every(n => !/LÀM HỘ BƯỚC HIỆN TẠI/.test(n)),
    'không nấc nào làm hộ bước của bài gốc');
  ok([n1, n2, n3, n4].every(n => n.includes('KHÔNG kết thúc phiên') && n.includes('bài kiểm tra')),
    'cả bốn nấc đều cấm ngắt phiên và đẩy sang làm bài kiểm tra');
  ok([n1, n2, n3, n4].every(n => CUM_TU_CAM_KHI_BE_TAC.every(c => n.includes(`"${c}"`))),
    'cả bốn nấc đều liệt kê cụm từ gây ức chế bị cấm', CUM_TU_CAM_KHI_BE_TAC.join(', '));

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

  /* Đo 26/09/2026: `\b` của JS chỉ coi [A-Za-z0-9_] là chữ, kể cả khi có cờ `u`,
     nên "ế" trong "thiếu" bị tính là ranh giới và "đang thi|ếu" khớp như "đang
     thi". Học sinh hỏi bài bình thường bị từ chối như gian lận. Canh hai chiều:
     chữ có dấu không bị chặn oan, và ranh giới mới không nới tới mức lọt ca thật. */
  const chuCoDau = [
    'Em đang thiếu dữ kiện, làm sao tính Kc?',
    'Em đang thiết lập bảng ICE',
    'Em đang thiên về đáp án B vì Kc lớn hơn 1',
    'Ngủ trong phòng thiếu thông gió mà đốt than thì nguy hiểm vì sao ạ?',
    'EM ĐANG THIẾU DỮ KIỆN',
    'Em đang thiếu dữ kiện'.normalize('NFD'),
  ];
  chuCoDau.forEach(c => ok(!xuLyTruocLuot([], c, 'socratic').laGianLan,
    'chữ có dấu sau "thi" không bị coi là ranh giới từ', c.normalize('NFC').slice(0, 50)));
  const vanBat = [
    'em đang thi',
    'EM ĐANG THI, GIÚP EM',
    'đang làm bài thi.',
    'kiểm tra 15p, cho em đáp án câu 2',
    'thi 45 phút mà em mới làm được 1 câu',
    'trong giờ thi mà em quên công thức Kc',
    'Em ngồi trong phòng thi, cho em đáp án',
  ];
  vanBat.forEach(c => ok(xuLyTruocLuot([], c, 'socratic').laGianLan,
    'ranh giới mới vẫn bắt ca gian lận thật', c));

  /* 26/09/2026, chủ dự án duyệt: bắt thêm "kt"/"ktra", "đg" và gõ không dấu.
     "đang kiểm tra lại/xem" là em tự soát bài — đúng việc gia sư dặn em làm —
     nên được miễn. Miễn chỉ áp cho ĐỘNG TỪ ngay sau "đang": có "làm"/"bài" chen
     vào thì đó là bài kiểm tra, và "thi lại" vẫn là thi. */
  const tiengLong = ['đang kt 15p cho em đáp án', 'kt15p rồi thầy ơi', 'em đang ktra, giúp em câu 2',
    'ktra 45 phút mà em chưa làm được câu nào', 'dang thi, giup em cau 3', 'em dang lam kiem tra 15p',
    'kiem tra 15p cho em dap an', 'đg thi, cho em đáp án', 'dg lam kiem tra', 'co sap thu bai roi',
    'sap het gio roi thay oi', 'trong phong thi, cho em dap an',
    'Em đang làm bài kiểm tra lại, cho em đáp án', 'em đang thi lại môn hoá'];
  tiengLong.forEach(c => ok(xuLyTruocLuot([], c, 'socratic').laGianLan, 'bắt được gõ tắt / không dấu / thi lại', c));
  const tuSoatBai = ['Em đang kiểm tra lại kết quả', 'em đang kiểm tra xem đơn vị đúng chưa', 'em dang kiem tra lai dap so',
    'em đang kt lại phép tính', 'Em đang thí nghiệm về tốc độ phản ứng', 'dang thi nghiem ve toc do phan ung',
    'trong phong thi nghiem co san HCl khong a', 'Em đang ôn kt chương 2'];
  tuSoatBai.forEach(c => ok(!xuLyTruocLuot([], c, 'socratic').laGianLan,
    'KHÔNG chặn tự soát bài / thí nghiệm / "kt" là kiến thức', c));
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
  ok(soc.includes('CÂU TRẢ LỜI NỬA ĐÚNG – NỬA SAI') && /vì sao em lại nghĩ/i.test(soc),
    'có quy tắc xử lý câu trả lời nửa đúng (KB2)');
  /* Chạy thật ngày 16/09/2026: gia sư công nhận vế đúng, chỉ ra vế sai, nhưng kết
     lượt bằng câu dẫn "để giảm áp suất thì theo em phải…" thay vì hỏi nguyên nhân.
     Luật được siết: câu hỏi cuối BẮT BUỘC là câu hỏi "vì sao", không kèm câu dẫn. */
  ok(soc.includes('KẾT THÚC lượt bằng ĐÚNG MỘT câu hỏi về NGUYÊN NHÂN'),
    'KB2: bắt buộc kết lượt bằng câu hỏi nguyên nhân, không chen câu dẫn dắt');
  ok(soc.includes('BaSO4') && soc.includes('CH3COOH') && soc.includes('glucose'),
    'bảng ngộ nhận độ tan / điện li có đủ ba phản ví dụ (KB4)');
  ok(soc.includes('[BUOC:') && soc.includes('[LUOT:') && soc.includes('hanh_chinh'), 'dặn gắn nhãn ẩn để đo');

  /* Năm quy tắc chủ đề tài đưa ra ngày 18/09/2026. Quy tắc chống sao chép và
     câu về giọng điệu nằm ở phần DÙNG CHUNG nên phải có ở CẢ HAI nhánh; hai
     quy tắc còn lại thuộc cách dạy nên chỉ ở nhánh gợi mở. */
  const tt = dungPrompt('truc-tiep');
  for (const [ten, p] of [['gợi mở', soc], ['đối chứng', tt]] as const) {
    ok(p.includes('BÀI LÀM CÓ DẤU HIỆU KHÔNG PHẢI CỦA EM') && p.includes('ÍT NHẤT HAI dấu hiệu')
       && p.includes('KHÔNG kết tội') && p.includes('bằng lời của chính em') && p.includes('đổi dữ kiện'),
      `nhánh ${ten}: có luật xử lý bài làm nghi sao chép, không kết tội`);
    ok(p.includes('không mỉa mai, không chê, không hạ thấp em'), `nhánh ${ten}: dặn giữ giọng tôn trọng`);
  }
  /* Năm quy tắc của chủ đề tài phải nằm NGUYÊN VĂN trong nhánh gợi mở: đây là
     luật cao nhất, mọi mục khác của câu lệnh đã được viết lại cho khớp. */
  const NAM_QUY_TAC = [
    'Không bao giờ đưa ra công thức, phương trình, hoặc kết quả tính toán trước khi học sinh tự đề xuất.',
    'Khi học sinh trả lời sai, không chỉ ra lỗi trực tiếp — hãy đặt câu hỏi để học sinh tự kiểm tra lại.',
    'được phép thu hẹp câu hỏi để dễ trả lời hơn (giảm "độ mở" của câu hỏi), nhưng vẫn không được đưa đáp án',
    'hãy yêu cầu học sinh giải thích lại bằng lời của chính mình, hoặc áp dụng cách giải vào một dữ kiện khác',
    'mục tiêu là khuyến khích tư duy, không phải hạ thấp học sinh',
  ];
  NAM_QUY_TAC.forEach((q, i) => ok(soc.includes(q), `quy tắc ${i + 1} của chủ đề tài còn nguyên văn`));
  ok(soc.startsWith('VAI TRÒ\nBạn là Chemai — một gia sư Hóa học theo phong cách Socrates.'),
    'mở đầu câu lệnh đúng nguyên văn vai Chemai');
  ok(soc.includes('KHI EM TRẢ LỜI SAI') && soc.includes('KHÔNG nói "em sai"')
     && soc.includes('KHÔNG sửa hộ phép tính'),
    'em trả lời sai thì hỏi để em tự kiểm, không chỉ lỗi trực tiếp (quy tắc 2)');
  ok(soc.includes('Không tuyên bố nhận định đó sai'),
    'ngộ nhận cũng xử bằng phản ví dụ và câu hỏi, không tuyên bố sai (quy tắc 2)');
  ok(soc.includes('Hỏi em TỰ nêu công thức hoặc định luật cần dùng') && soc.includes('mới thu hẹp thành 4 lựa chọn'),
    'bước B3 hỏi em tự đề xuất trước, chỉ thu hẹp khi em không nêu được (quy tắc 1 và 3)');
  ok(!soc.includes('bế tắc lần 4 trở lên') && !soc.includes('bế tắc lần 3 trở lên'),
    'bỏ ngoại lệ làm hộ một bước, khớp với máy trạng thái');
  ok(!tt.includes('KHÔNG sửa hộ phép tính') && !tt.includes('phong cách Socrates'),
    'nhánh đối chứng KHÔNG nhận luật của nhánh gợi mở (giữ biến đối chứng)');
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
  const NGUON = 'https://giasuhoa11.pages.dev/';
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
  const link = dung('[Làm bài](https://giasuhoa11.pages.dev/#/quiz/q1) [ngoài](https://vi.wikipedia.org/wiki/Hoa) [http](http://evil.example)');
  ok(/<a href="https:\/\/giasuhoa11\.pages\.dev\/#\/quiz\/q1" rel="noopener noreferrer nofollow"(?! target)/.test(link),
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
  ok(csv.split('\n')[0].endsWith(',do_dai_noi_dung,nha_cung_cap,duong,y_dinh,y_dinh_xs,y_dinh_phien_ban'),
    'CSV có cột nguồn trả lời, đường đi và ý định — thêm ở CUỐI để không xô lệch cột cũ');

  /* Sửa vòng 1, MINOR 2: kiểm GIÁ TRỊ thật của ba cột mới trên một dòng, không
     chỉ kiểm tên cột ở header. */
  const csvYDinh = xuatCsv([m({ sender: 'user', y_dinh: 'be_tac', y_dinh_xs: 0.9, y_dinh_phien_ban: 'v1' })]);
  ok(csvYDinh.split('\n')[1].endsWith(',be_tac,0.9,v1'),
    'dòng CSV mang đúng giá trị y_dinh/y_dinh_xs/y_dinh_phien_ban ở ba cột cuối', csvYDinh.split('\n')[1]);
}

console.log('\n== Gộp chỉ số theo từng học sinh (P0-5) ==');
{
  const t = (p: Partial<ChatMessage>): ChatMessage => ({
    id: Math.random().toString(36), userEmail: 'hs01@truong.edu.vn', lessonId: 'bai-1',
    sender: 'ai', content: 'nội dung bí mật', timestamp: '2026-09-20T08:00:00.000Z',
    session_id: 's1', user_hash: 'h1', nhanh: 'socratic', ...p,
  });
  /* Mẫu dựng theo đúng những trường mã THẬT SỰ đang ghi xuống `chats` (xem
     khối `aiMsg` trong AppContext): `chan_ro`, `nhan_hong`, `muc_goi_y`,
     `be_tac`, `ngoai_mon`. Kế hoạch P0-5 còn nhắc `nghi_sao_chep` và
     `gio_kiem_tra` — hai trường đó chưa có chỗ nào ghi, nên cố tình KHÔNG đo:
     một cột luôn rỗng trong bản xuất nghiên cứu tệ hơn là không có cột. */
  const mau = [
    t({ sender: 'user', be_tac: true }),
    t({ loai_luot: 'goi_mo', muc_goi_y: 1 }),
    t({ sender: 'user', be_tac: true }),
    t({ loai_luot: 'goi_mo', muc_goi_y: 3, chan_ro: true,
        timestamp: '2026-09-20T08:10:00.000Z' }),
    t({ sender: 'user', user_hash: 'h2', session_id: 's2' }),
    t({ loai_luot: 'giai_thich', user_hash: 'h2', session_id: 's2',
        nhan_hong: true, ngoai_mon: 'GIAN_LAN' }),
    t({ user_hash: 'h2', session_id: 's2' }),   // lượt gia sư KHÔNG có nhãn loai_luot
  ];

  const dong = gopTheoHocSinh(mau);
  ok(dong.length === 2, 'tách đúng hai học sinh', String(dong.length));

  const h1 = dong.find(d => d.user_hash === 'h1')!;
  ok(h1.soLuot === 4 && h1.soLuotHocSinh === 2 && h1.soPhien === 1,
    'đếm đúng số lượt, số lượt của em, số phiên của h1');
  ok(h1.mucCaoNhat === 3, 'nấc giàn giáo cao nhất của h1 = 3', String(h1.mucCaoNhat));
  ok(h1.soPhienMuc3 === 1, 'đếm đúng số phiên chạm nấc trần', String(h1.soPhienMuc3));
  ok(h1.tyLeGoiMo !== null && Math.abs(h1.tyLeGoiMo - 1) < 1e-9,
    'tỉ lệ gợi mở của h1 = 1', String(h1.tyLeGoiMo));
  ok(h1.tyLeBeTac !== null && Math.abs(h1.tyLeBeTac - 1) < 1e-9,
    'tỉ lệ bế tắc của h1 = 1', String(h1.tyLeBeTac));
  ok(h1.soLanChanRo === 1, 'đếm đúng số lượt bị bộ chặn rò can thiệp', String(h1.soLanChanRo));
  ok(h1.tongThoiGianMs === 10 * 60 * 1000,
    'thời gian cộng TRONG từng phiên, không lấy mốc đầu trừ mốc cuối', String(h1.tongThoiGianMs));

  const h2 = dong.find(d => d.user_hash === 'h2')!;
  ok(h2.soNhanThieu === 1, 'đếm đúng lượt gia sư thiếu nhãn loai_luot', String(h2.soNhanThieu));
  ok(h2.soLanNhanHong === 1, 'đếm đúng lượt nhãn hỏng', String(h2.soLanNhanHong));
  ok(h2.soLanGianLan === 1, 'đếm đúng lượt bị chặn vì gian lận phòng thi', String(h2.soLanGianLan));

  ok(gopTheoHocSinh(mau, '2026-09-21', '2026-09-22').length === 0,
    'lọc theo khoảng ngày loại hết tin ngoài khoảng');
  ok(gopTheoHocSinh(mau, '2026-09-20', '2026-09-20').length === 2,
    '`denNgay` tính TRỌN ngày đó, không cắt lúc 00:00');

  /* Tệp CSV này mở bằng Excel trên Windows. Thiếu BOM là tiếng Việt ra ký tự
     rác — đã ghi trong CLAUDE.md, và `liet-ke:tai-khoan` từng vấp đúng chỗ đó. */
  const csv = csvHocSinh(dong, 'CHUA_LOC_DONG_Y');
  ok(csv.startsWith('﻿'), 'CSV theo học sinh có BOM ở đầu');
  ok(csv.slice(1).split('\n')[0].startsWith('canh_bao,user_hash,'),
    'cột cảnh báo đứng ĐẦU, không nấp ở cuối bảng', csv.slice(1).split('\n')[0]);
  ok(csv.split('\n').slice(1).every(d => !d || d.startsWith('CHUA_LOC_DONG_Y,')),
    'MỌI dòng đều mang cảnh báo chưa lọc đồng ý tham gia nghiên cứu');
  ok(!csv.includes('@') && !csv.includes('nội dung bí mật'),
    'bảng theo học sinh không mang email và không mang nội dung hội thoại');
}

console.log('\n== Gỡ nhãn ẩn an toàn (P0-6) ==');
{
  /* Học sinh KHÔNG BAO GIỜ được thấy thẻ thô, kể cả khi mô hình viết sai định
     dạng. Ba ca dưới đều là nhãn hỏng mà bốn regex cũ không khớp. */
  const hong = [
    'Em thử lại nhé. [BUOC: b3 ] [LUOT:goi_mo',      // thiếu ngoặc đóng
    'Em thử lại nhé. [BUOC:Z9] [LUOT:khong_co_loai]', // nhãn bịa
    'Em thử lại nhé. [ NGO_NHAN : xuc-tac-chuyen-dich ]',
    'Em thử lại nhé. [LUOT]',                          // nhãn rỗng
  ];
  for (const t of hong) {
    const r = tachNhanAn(t);
    ok(!/\[\s*(BUOC|LUOT|NGO_NHAN)/i.test(r.noiDung),
      `không còn thẻ thô: "${t.slice(-26)}"`, r.noiDung);
  }
  ok(tachNhanAn('Em thử lại nhé. [BUOC:Z9] [LUOT:goi_mo]').buoc === undefined,
    'nhãn bịa vẫn không được ghi nhận');
  ok(tachNhanAn('Không có nhãn gì cả.').thieuNhan === true,
    'lượt thiếu nhãn bị đánh dấu để ghi log');
  ok(tachNhanAn('Xong rồi em. [BUOC:A6] [LUOT:goi_mo]').thieuNhan === false,
    'lượt đủ hai nhãn thì không bị đánh dấu thiếu');
  ok(tachNhanAn('Em thử lại nhé. [BUOC: b3 ] [LUOT:goi_mo').nhanHong === true,
    'nhãn sai định dạng bị đánh dấu để ghi log');

  /* Nhãn RA ĐỀ phải còn nguyên — AppContext xử lý chúng sau tachNhanAn. */
  const raDe = tachNhanAn('Giỏi lắm em. [SIGNAL:XONG_BAI:bai-3] [BUOC:A6] [LUOT:goi_mo]');
  ok(raDe.noiDung.includes('[SIGNAL:XONG_BAI:bai-3]'), 'nhãn ra đề KHÔNG bị gỡ nhầm');
}

console.log('\n== Trần cho nấc câu hỏi có/không (P0-3) ==');
{
  const n4 = chiDanGianGiao(4), n5 = chiDanGianGiao(5), n6 = chiDanGianGiao(6);
  const n7 = chiDanGianGiao(7), n9 = chiDanGianGiao(9);

  ok([n4, n5, n6].every(s => /có\/không|một trong hai/i.test(s)),
    'bế tắc lần 4–6 vẫn được hỏi câu có/không');
  /* Nấc dừng VẪN nhắc chữ "có/không" — nó phải nói rõ là dừng loại câu hỏi đó.
     Nên đừng kiểm bằng "không chứa chữ có/không" (phép kiểm đầu tiên viết vậy và
     bắt nhầm chính câu đúng); kiểm bằng hai mệnh lệnh phải có. */
  ok(/DỪNG chuỗi câu hỏi có\/không/i.test(n7) && /KHÔNG hỏi thêm câu có\/không/i.test(n7)
    && /quay lại một câu hỏi mở|hỏi trực tiếp thầy|bài giảng cần đọc lại/i.test(n7),
    'bế tắc lần 7 (lượt thứ 4 ở nấc có/không) thì DỪNG chuỗi có/không');
  ok(/quay lại|câu hỏi mở|hỏi trực tiếp thầy|bài giảng/i.test(n9),
    'bế tắc lần 9 vẫn ở trạng thái dừng, không quay lại hỏi có/không');
  ok([n4, n5, n6, n7, n9].every(s => /đáp số có phải|kết quả có lớn hơn|có phải khoảng/i.test(s) === false
      || /cấm mọi câu dạng/i.test(s)),
    'không nấc nào cho phép hỏi dò giá trị đáp số');
  ok([n4, n5, n6].every(s => /cấm mọi câu dạng "đáp số có phải/i.test(s)),
    'nấc có/không nói rõ cấm hỏi dò giá trị đáp số');
  ok([n4, n5, n6, n7, n9].every(s => /KHÔNG đưa đáp án/i.test(s)),
    'mọi nấc vẫn cấm đưa đáp án');
}

console.log('\n== Bộ dò đáp số trong câu trả lời (P0-2, P0-4) ==');
{
  /* Mỗi ca là một lối viết số mà học sinh hoặc mô hình thật sự dùng. Ba lối
     luỹ thừa cuối lấy từ chính lời giải trong ngân hàng (trường `e`). */
  const ca: [string, number, boolean][] = [
    ['Vậy pH của dung dịch là 1,70 em nhé.', 1.7, true],
    ['pH = 1.70', 1.7, true],
    ['nồng độ còn lại 1,45.10^-2 M', 0.0145, true],
    ['nồng độ còn lại 1.45e-2 M', 0.0145, true],
    ['giá trị 1,45×10⁻² mol/L', 0.0145, true],
    ['Em thử tính lại xem [H+] bằng bao nhiêu nhé?', 1.7, false],
    ['Theo phương trình, 1 mol H2 phản ứng tạo ra 2 mol HI.', 1.7, false],
    ['Kết quả xấp xỉ 0,30 M', 0.3, true],
    /* Lối viết LaTeX mà chính câu lệnh hệ thống dặn dùng: `24{,}79`. Đo
       22/09/2026: 49/86 câu trả lời dùng lối này, mà bộ dò bản đầu mù hẳn. */
    ['Vậy $pH = 1{,}70$ em nhé.', 1.7, true],
    ['Khối lượng kết tủa là $66{,}2$ gam.', 66.2, true],
    ['Nồng độ $x = 0{,}3$ M.', 0.3, true],
    ['Theo đề, $V = 24{,}79$ L/mol là hằng số ở đkc.', 1.7, false],
  ];
  for (const [text, dap, mong] of ca) {
    ok(coDapSo(text, dap, 0.05) === mong, `dò "${text.slice(0, 34)}…" → ${mong}`);
  }

  const kho = [{
    q: 'Trộn 100 mL dung dịch HCl 0,1 M với 100 mL dung dịch NaOH 0,06 M. Tính pH của dung dịch sau phản ứng.',
    num: 1.7, tol: 0.05,
  }];
  ok(timDapAnChoTin(
    'tron 100 ml dung dich hcl 0,1 m voi 100 ml dung dich naoh 0,06 m tinh ph cua dung dich sau phan ung giup em voi a',
    kho)?.num === 1.7,
    'khớp được câu ngân hàng dù em gõ không dấu');
  ok(timDapAnChoTin('em khong biet lam bai nay', kho) === undefined,
    'tin ngắn hoặc khác đề thì không khớp bừa');
  ok(timDapAnChoTin('Tính pH của dung dịch thu được khi trộn hai dung dịch acid mạnh có cùng nồng độ', kho) === undefined,
    'bài cùng chủ đề nhưng khác đề thì không khớp');
}

console.log('\n== Khung chat: gom tin theo phiên (nhomPhien.ts) ==');
{
  /* Giờ địa phương dựng bằng new Date(năm, tháng, ...) để phép kiểm đúng ở mọi
     múi giờ máy chạy. Tháng tính từ 0: 9 là tháng 10. */
  const luc = (ngay: number, gio: number, phut = 0) => new Date(2026, 9, ngay, gio, phut).toISOString();
  let so = 0;
  const tin = (t: string, phien?: string) => ({ id: `t${so++}`, timestamp: t, session_id: phien });

  ok(nhomTheoPhien([]).length === 0, 'không có tin thì không có nhóm');

  const haiPhien = [
    tin(luc(3, 13, 5), 'a'), tin(luc(3, 13, 6), 'a'), tin(luc(3, 13, 9), 'a'),
    tin(luc(3, 15, 0), 'b'), tin(luc(3, 15, 1), 'b'),
  ];
  const n1 = nhomTheoPhien(haiPhien);
  ok(n1.length === 2 && n1[0].tin.length === 3 && n1[1].tin.length === 2,
    'hai session_id liền nhau → hai nhóm 3 + 2 tin', n1.map(n => n.tin.length).join(' + '));
  ok(n1.flatMap(n => n.tin).map(m => m.id).join() === haiPhien.map(m => m.id).join(),
    'giữ nguyên thứ tự và không mất tin nào');
  ok(nhanNhom(n1[0]) === 'Thứ Bảy 03/10 · 13:05 · 3 tin',
    'nhãn phiên có thứ, ngày, giờ bắt đầu, số tin', nhanNhom(n1[0]));

  const n2 = nhomTheoPhien([tin(luc(1, 8)), tin(luc(1, 9)), tin(luc(2, 8))]);
  ok(n2.length === 2 && n2.every(n => !n.theoPhien), 'tin cũ không có session_id → gom theo ngày');
  ok(nhanNhom(n2[1]) === 'Thứ Sáu 02/10 · 1 tin', 'nhóm theo ngày không ghi giờ', nhanNhom(n2[1]));

  ok(nhomTheoPhien([tin(luc(3, 23, 50)), tin(luc(4, 0, 10))]).length === 2,
    'tin cũ lúc 23:50 và 00:10 hôm sau là hai ngày theo giờ máy');
  ok(nhomTheoPhien([tin(luc(3, 23, 50), 'c'), tin(luc(4, 0, 10), 'c')]).length === 1,
    'một phiên kéo qua nửa đêm vẫn là MỘT nhóm');

  const xenKe = nhomTheoPhien([tin(luc(3, 9), 'a'), tin(luc(3, 9, 1), 'b'), tin(luc(3, 9, 2), 'a')]);
  ok(xenKe.length === 3 && new Set(xenKe.map(n => n.khoa)).size === 3,
    'phiên quay lại sau phiên khác → nhóm riêng, khoá không trùng (key React)');

  ok(nhomTheoPhien([tin(luc(3, 8)), tin(luc(3, 9), 'a')]).length === 2,
    'tin không phiên và tin có phiên cùng ngày không bị trộn');

  ok(nhanNhom(nhomTheoPhien([tin('khong-phai-ngay')])[0]) === 'Không rõ ngày · 1 tin',
    'timestamp hỏng không làm sập, ghi "Không rõ ngày"');
}

console.log('\n== Khung chat: "Ẩn khỏi màn hình" thay cho xóa (anTinCu.ts) ==');
{
  const t = (phut: number) => ({ timestamp: new Date(2026, 9, 3, 13, phut).toISOString() });
  const ds = [t(1), t(2), t(3)];

  ok(mocAnTatCa(ds) === Date.parse(t(3).timestamp), 'mốc = thời điểm tin MỚI NHẤT, không phải giờ máy');
  ok(mocAnTatCa([]) === null && mocAnTatCa([{ timestamp: 'hong' }]) === null, 'không có tin hợp lệ thì không có mốc');

  const an = locTheoMoc(ds, mocAnTatCa(ds));
  ok(an.hien.length === 0 && an.soAn === 3, 'ẩn tới mốc thì cả 3 tin cũ biến khỏi màn hình');
  const sau = locTheoMoc([...ds, t(10)], mocAnTatCa(ds));
  ok(sau.hien.length === 1 && sau.soAn === 3, 'tin tới SAU khi ẩn vẫn hiện');
  ok(locTheoMoc(ds, null).hien.length === 3, 'chưa ẩn (mốc null) thì hiện đủ');
  ok(locTheoMoc([{ timestamp: 'hong' }], 0).hien.length === 1, 'timestamp hỏng thì cứ hiện, không làm mất tin');

  const khoa = khoaAnTin('Uid123', 'bai-11');
  ok(khoa === 'h11_an_chat:Uid123:bai-11', 'khoá localStorage gồm uid và mã bài', khoa);
  ok(!/@/.test(khoa) && khoaAnTin(undefined, 'bai-11') === 'h11_an_chat:khach:bai-11',
    'khoá không chứa email; khách vãng lai dùng chữ "khach"');

  /* localStorage giả: Node không có sẵn. Thử cả bản chạy được lẫn bản ném lỗi
     (Safari chế độ riêng tư, trình duyệt chặn lưu trữ). */
  const g = globalThis as { localStorage?: unknown };
  const cu = g.localStorage;
  const kho = new Map<string, string>();
  g.localStorage = {
    getItem: (k: string) => kho.get(k) ?? null,
    setItem: (k: string, v: string) => { kho.set(k, v); },
    removeItem: (k: string) => { kho.delete(k); },
  };
  ok(docMocAn(khoa) === null, 'chưa ghi thì đọc ra null');
  ok(ghiMocAn(khoa, 1234) && docMocAn(khoa) === 1234, 'ghi rồi đọc lại đúng mốc (giữ qua tải lại trang)');
  ok(ghiMocAn(khoa, null) && docMocAn(khoa) === null && !kho.has(khoa), '"Hiện lại" xóa hẳn mốc');
  kho.set(khoa, 'rac');
  ok(docMocAn(khoa) === null, 'giá trị rác trong localStorage coi như chưa ẩn');
  const nem = () => { throw new Error('bị chặn'); };
  g.localStorage = { getItem: nem, setItem: nem, removeItem: nem };
  ok(docMocAn(khoa) === null && ghiMocAn(khoa, 1) === false,
    'localStorage ném lỗi: đọc ra null, ghi trả false, không làm sập khung chat');
  g.localStorage = cu;
}

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC KHÔNG ĐẠT`) + '\n');
process.exit(hong === 0 ? 0 : 1);
