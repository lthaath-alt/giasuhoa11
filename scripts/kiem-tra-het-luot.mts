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
ok(tNgay.includes('API key khác'), 'gợi ý đổi API key');
ok(!/\d+ giây/.test(tNgay), 'KHÔNG báo nhầm là chỉ chờ vài giây');

console.log('\n== Lỗi khác thì không nhận nhầm ==');
ok(tKey === '', 'lỗi sai API key không bị coi là hết lượt');

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC HỎNG`) + '\n');
process.exit(hong === 0 ? 0 : 1);
