/**
 * Kiểm tra cách web diễn giải lỗi 429 "hết lượt" của Gemini.
 *
 * Chạy:  npm run kiem-tra:het-luot
 *
 * Dùng ĐÚNG hai thông báo lỗi thật bắt được lúc chạy thử gia sư, nên không cần
 * gọi mạng và không tốn lượt API.
 *
 * Vì sao cần: bậc miễn phí của Gemini có HAI hạn mức rất khác nhau —
 *   5 lượt/phút  → chờ vài chục giây là hỏi tiếp được
 *   20 lượt/NGÀY → hết sạch, phải đợi sang ngày hôm sau
 * Nếu báo chung một câu "thử lại sau ít phút" thì học sinh hết lượt của ngày sẽ
 * ngồi bấm lại cả buổi mà không bao giờ được trả lời.
 */
import { thongBaoHetLuot } from '../src/features/tutor/services/geminiTutorService';
import { loiThanhChuoi } from '../src/features/tutor/services/loiGemini';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');

const LOI_PHUT = '{"error":{"code":429,"message":"You exceeded your current quota. \\n* Quota'
  + ' exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests,'
  + ' limit: 5, model: gemini-3.6-flash\\nPlease retry in 41.265642542s.","status":'
  + '"RESOURCE_EXHAUSTED","details":[{"@type":"type.googleapis.com/google.rpc.QuotaFailure",'
  + '"violations":[{"quotaId":"GenerateRequestsPerMinutePerProjectPerModel-FreeTier",'
  + '"quotaValue":"5"}]},{"@type":"type.googleapis.com/google.rpc.RetryInfo","retryDelay":"41s"}]}}';

const LOI_NGAY = '{"error":{"code":429,"message":"You exceeded your current quota. \\n* Quota'
  + ' exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests,'
  + ' limit: 20, model: gemini-3.6-flash\\nPlease retry in 57.545008081s.","status":'
  + '"RESOURCE_EXHAUSTED","details":[{"@type":"type.googleapis.com/google.rpc.QuotaFailure",'
  + '"violations":[{"quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier",'
  + '"quotaValue":"20"}]},{"@type":"type.googleapis.com/google.rpc.RetryInfo","retryDelay":"57s"}]}}';

const LOI_KEY = 'API key not valid. Please pass a valid API key.';

let hong = 0;
const ok = (dieu: boolean, ten: string) => {
  console.log((dieu ? '  OK   ' : '  HỎNG ') + ten);
  if (!dieu) hong++;
};

const tPhut = thongBaoHetLuot(LOI_PHUT);
const tNgay = thongBaoHetLuot(LOI_NGAY);
const tKey = thongBaoHetLuot(LOI_KEY);

console.log('\n== Hết lượt theo PHÚT (5/phút) ==');
console.log('   ' + tPhut);
ok(tPhut.includes('mỗi phút'), 'nói rõ là giới hạn theo phút');
ok(tPhut.includes('41 giây'), 'nói đúng số giây cần chờ, lấy từ retryDelay');
ok(!tPhut.includes('ngày mai'), 'KHÔNG báo nhầm thành hết lượt ngày');

console.log('\n== Hết lượt theo NGÀY (20/ngày) ==');
console.log('   ' + tNgay);
ok(tNgay.includes('trong ngày'), 'nói rõ là hết lượt của ngày');
ok(tNgay.includes('ngày mai'), 'hướng dẫn chờ sang ngày mai');
/* Đảo chiều ngày 14/09/2026: bản cũ khuyên "vào cài đặt để dùng một API key
   khác" — tức xui học sinh lớp 11 tự tạo key Gemini, trong khi điều khoản Gemini
   API cấm ứng dụng dành cho người dưới 18 tuổi, và hạn mức tính theo PROJECT
   chứ không phải của riêng em. */
ok(!/API key/i.test(tNgay), 'KHÔNG xui học sinh tự dùng API key riêng');
ok(tNgay.includes('toàn hệ thống'), 'nói rõ hạn mức là của cả hệ thống, không phải của riêng em');
ok(!/\d+ giây/.test(tNgay), 'KHÔNG báo nhầm là chỉ chờ vài giây');

console.log('\n== Lỗi khác thì không nhận nhầm ==');
ok(tKey === '', 'lỗi sai API key không bị coi là hết lượt');

/* Lỗi 429 như `firebase/ai` ném ra — dựng theo mã nguồn @firebase/ai 12.16.0
   (AIError: message có "[429 Too Many Requests]", quotaId và retryDelay nằm
   trong customErrorData.errorDetails, KHÔNG nằm trong message). */
const loiFirebase = (quotaId: string, giay: string) => Object.assign(
  new Error('AI: Error fetching from https://firebasevertexai.googleapis.com/v1beta/projects/'
    + 'giasuhoa11/models/gemini-3.6-flash:generateContent: [429 Too Many Requests] '
    + 'You exceeded your current quota. (AI/fetch-error)'),
  {
    code: 'fetch-error',
    customErrorData: {
      status: 429,
      statusText: 'Too Many Requests',
      errorDetails: [
        { '@type': 'type.googleapis.com/google.rpc.QuotaFailure', violations: [{ quotaId }] },
        { '@type': 'type.googleapis.com/google.rpc.RetryInfo', retryDelay: `${giay}s` },
      ],
    },
  },
);

const fPhut = thongBaoHetLuot(loiThanhChuoi(loiFirebase('GenerateRequestsPerMinutePerProjectPerModel-FreeTier', '41')));
const fNgay = thongBaoHetLuot(loiThanhChuoi(loiFirebase('GenerateRequestsPerDayPerProjectPerModel-FreeTier', '57')));

console.log('\n== Lỗi dạng Firebase AI Logic ==');
console.log('   ' + fPhut);
console.log('   ' + fNgay);
ok(fPhut.includes('mỗi phút') && fPhut.includes('41 giây'), 'Firebase: hết lượt PHÚT, đúng số giây');
ok(fNgay.includes('trong ngày') && !/\d+ giây/.test(fNgay), 'Firebase: hết lượt NGÀY, không báo nhầm thành chờ giây');
ok(thongBaoHetLuot(loiThanhChuoi(new Error(LOI_NGAY))) === tNgay, 'lỗi @google/genai đi qua loiThanhChuoi vẫn ra y như cũ');

/* Hết hạn mức theo NGÀY là hết cho CẢ WEB. Lúc đó chỉ còn một lối đi tiếp
   trong hôm nay: em tự lấy một khoá miễn phí của Google. Thông báo phải chỉ
   đường, và phải động viên — em đang bị chặn giữa lúc học, không phải lúc để
   nhận một câu cụt lủn. */
console.log('\n== Hết hạn mức thì chỉ đường cho em tự lấy khoá ==');
{
  const chuaCoKhoa = thongBaoHetLuot(LOI_NGAY, false);
  console.log('   ' + chuaCoKhoa);
  ok(/aistudio\.google\.com/.test(chuaCoKhoa), 'nói rõ chỗ lấy khoá');
  ok(/miễn phí/.test(chuaCoKhoa), 'nói rõ là miễn phí');
  ok(!/em đã dùng hết/i.test(chuaCoKhoa), 'không đổ lỗi cho em — hạn mức tính cho cả web');
  ok(chuaCoKhoa.length > 200, 'có câu động viên chứ không cụt lủn');
  /* Điều khoản Gemini API đòi người tạo khoá từ 18 tuổi, mà người dùng web là
     học sinh lớp 11. Câu hướng dẫn PHẢI đẩy việc tạo khoá sang người lớn —
     bỏ dòng này là web đang xui trẻ vị thành niên làm sai điều khoản. */
  ok(/bố mẹ|phụ huynh|thầy cô/.test(chuaCoKhoa), 'bảo em nhờ người lớn lấy khoá giúp');
  ok(/18 tuổi/.test(chuaCoKhoa), 'nói rõ Google đòi người tạo khoá từ 18 tuổi');

  const daCoKhoa = thongBaoHetLuot(LOI_NGAY, true);
  ok(!/aistudio\.google\.com/.test(daCoKhoa), 'em đã có khoá rồi thì đừng chỉ lại cách lấy');

  ok(!/aistudio\.google\.com/.test(thongBaoHetLuot(LOI_PHUT, false)),
    'hết lượt theo PHÚT thì chỉ cần chờ, không cần khoá riêng');
}

/* Trần lượt khách: một chỗ khai, mọi chỗ khác phải đọc từ đó.
   Chép cứng con số ra giao diện thì đổi hằng số xong web vẫn nói số cũ, và
   không ai thấy cho tới khi học sinh kêu. */
console.log('\n== Trần lượt khách chỉ khai MỘT chỗ ==');
{
  /* Đọc hằng số từ MÃ NGUỒN chứ không import: `gioiHanChatService` kéo theo
     `firebase.ts`, mà tệp đó đọc `import.meta.env` nên chỉ chạy được trong
     trình duyệt. */
  const maGioiHan = readFileSync(join(GOC, 'src/features/tutor/services/gioiHanChatService.ts'), 'utf8');
  const tran = Number(maGioiHan.match(/TRAN_LUOT_KHACH\s*=\s*(\d+)/)?.[1]);
  ok(tran === 5, `trần lượt khách là 5 (đang là ${tran})`);
  for (const t of ['src/pages/DashboardPage.tsx', 'src/pages/LoginPage.tsx',
                   'src/features/tutor/components/TutorChat.tsx']) {
    const ma = readFileSync(join(GOC, t), 'utf8');
    const chepCung = ma.match(/\b\d+\s*(?:câu hỏi|lượt (?:chat|hỏi))|\/\s*\d+\s*câu hỏi/g) || [];
    ok(chepCung.length === 0, `${t}: không chép cứng số lượt${chepCung.length ? ' — ' + chepCung.join(' | ') : ''}`);
  }
}

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC HỎNG`) + '\n');
process.exit(hong === 0 ? 0 : 1);
