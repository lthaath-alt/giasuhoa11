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

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC HỎNG`) + '\n');
process.exit(hong === 0 ? 0 : 1);
