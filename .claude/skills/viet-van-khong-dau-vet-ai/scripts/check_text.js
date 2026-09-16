#!/usr/bin/env node
// Quét văn bản tìm dấu vết văn phong AI theo references/rules.md.
//
// Cách dùng:
//   node check_text.js bai-viet.txt
//   node check_text.js bai-viet.md --markdown-ok     (nơi đăng hỗ trợ Markdown)
//   node check_text.js commit.txt --summary          (mô tả chỉnh sửa, commit message)
//   node check_text.js -                             (đọc từ stdin)
//
// Mã thoát: 0 = không có LỖI, 1 = có LỖI, 2 = lỗi đầu vào.
// Không cần cài thêm thư viện. Cần Node.js 12 trở lên.

"use strict";
const fs = require("fs");

const ERR = "LỖI";
const REV = "XEM LẠI";

// \b của JavaScript chỉ hiểu chữ ASCII nên hỏng với tiếng Việt.
// Thay mọi \b trong mẫu bằng ranh giới từ theo Unicode.
const W = "[\\p{L}\\p{M}\\p{N}_]";
const UB = `(?:(?<!${W})(?=${W})|(?<=${W})(?!${W}))`;

function rx(src) {
  return new RegExp(src.normalize("NFC").replace(/\\b/g, UB), "giu");
}

// [mã quy tắc, mức, mẫu, gợi ý sửa]
// Mẫu viết như regex thường; \b sẽ được đổi sang bản Unicode.
const RULES = [
  // Q1 tầm quan trọng
  ["Q1", ERR, String.raw`\b(?:is|was|stands as|serves as) a (?:testament|reminder)\b`, "Bỏ lời khẳng định tầm quan trọng, nêu sự việc cụ thể."],
  ["Q1", ERR, String.raw`\b(?:pivotal|crucial|vital|significant|key) (?:role|moment)\b`, "Bỏ 'vai trò quan trọng', nêu việc cụ thể đã làm."],
  ["Q1", ERR, String.raw`\b(?:underscor|highlight)\w* (?:its|the|their|his|her) (?:importance|significance)\b`, "Bỏ câu bình về tầm quan trọng."],
  ["Q1", ERR, String.raw`\breflects? (?:the )?broader\b|\bsetting the stage for\b|\b(?:represents|marks) a (?:shift|turning point)\b|\bturning point\b|\bevolving landscape\b|\bfocal point\b|\bindelible mark\b|\bdeeply rooted\b`, "Cụm thổi phồng tầm quan trọng."],
  ["Q1", ERR, String.raw`\b(?:enduring|lasting|ongoing) (?:legacy|impact|significance|influence)\b`, "Cụm thổi phồng di sản."],
  ["Q1", ERR, String.raw`đóng vai trò (?:quan trọng|then chốt|chủ chốt|trọng yếu|to lớn|nòng cốt)|minh chứng (?:cho|rõ nét)|dấu ấn|bước ngoặt|khẳng định vị thế|để lại di sản`, "Bỏ lời khen tầm quan trọng, thay bằng số liệu hoặc sự việc."],
  ["Q1", REV, String.raw`\bdi sản\b|\blegacy\b`, "Chỉ giữ nếu nói về di sản theo nghĩa đen (tài sản, di tích)."],

  // Q2 khoe độ phủ báo chí
  ["Q2", ERR, String.raw`\bindependent coverage\b|\b(?:local|regional|national|international) media outlets?\b|\btrade publications?\b|\bleading expert\b|\b(?:active|strong) social media presence\b`, "Nói nguồn viết gì thay vì khoe được đưa tin."],
  ["Q2", REV, String.raw`\b(?:featured|profiled|cited) in\b`, "Nếu chỉ để khoe độ nổi tiếng thì bỏ."],
  ["Q2", ERR, String.raw`được (?:nhiều )?(?:báo|báo chí|truyền thông|trang tin)[^.\n]{0,25}đưa tin|sự quan tâm của (?:truyền thông|dư luận|báo chí)|sôi nổi trên mạng xã hội`, "Nói nguồn viết gì thay vì khoe được đưa tin."],

  // Q3 lời bình cuối câu
  ["Q3", ERR, String.raw`,\s*(?:highlighting|underscoring|emphasizing|emphasising|reflecting|symbolizing|symbolising|contributing to|fostering|ensuring|showcasing|cultivating|encompassing|enhancing)\b`, "Cắt cụm -ing bình luận ở cuối câu."],
  ["Q3", ERR, String.raw`\bvaluable insights?\b|\bresonat(?:e|es|ed|ing) with\b`, "Cụm bình luận rỗng."],
  ["Q3", ERR, String.raw`qua đó (?:cho thấy|thể hiện|khẳng định|góp phần|phản ánh)`, "Cắt phần bình luận, để sự việc tự nói."],
  ["Q3", REV, String.raw`\bgóp phần\b`, "Nếu là lời bình chung chung thì bỏ, nếu có số liệu thì nói số liệu."],

  // Q4 quảng cáo
  ["Q4", ERR, String.raw`\bnestled\b|\bin the heart of\b|\bgroundbreaking\b|\brenowned\b|\bdiverse array\b|\bnatural beauty\b|\bcommitment to\b|\bexemplif(?:y|ies|ied)\b`, "Từ quảng cáo."],
  ["Q4", REV, String.raw`\bprofound(?:ly)?\b|\bfeaturing\b|\brich\b`, "Kiểm tra có đang dùng giọng quảng cáo không."],
  ["Q4", ERR, String.raw`tọa lạc|toạ lạc|giữa lòng|sôi động|đa dạng (?:và )?phong phú|đẳng cấp|tiên phong|hàng đầu|không thể bỏ qua`, "Từ quảng cáo."],
  ["Q4", REV, String.raw`\bnổi tiếng\b`, "Chỉ giữ nếu có nguồn xác nhận và cần thiết."],

  // Q5 nguồn mơ hồ
  ["Q5", ERR, String.raw`\bexperts? (?:argue|say|believe|note|suggest)s?\b|\bobservers (?:have )?(?:cited|noted|say|argue)\b|\bsome critics\b|\bindustry reports\b`, "Nêu tên người hoặc tổ chức cụ thể."],
  ["Q5", REV, String.raw`\b(?:several|many|numerous|various) (?:sources|publications|reviewers|scholars|critics)\b|\bsuch as\b`, "Đếm lại số nguồn thực tế; 'such as' chỉ dùng khi danh sách còn phần chưa kể."],
  ["Q5", ERR, String.raw`(?:giới|các|nhiều) chuyên gia (?:cho rằng|nhận định|đánh giá)|nhiều ý kiến (?:cho rằng|nhận định)|theo một số nguồn tin`, "Nêu tên người hoặc tổ chức cụ thể."],

  // Q7 kết bài theo công thức
  ["Q7", ERR, String.raw`\bdespite (?:its|these|this|the|their|his|her)\b[^.\n]{0,80}\bchallenges\b|\bfaces? (?:several|many|numerous|significant|various) challenges\b|\bfuture (?:outlook|prospects)\b|\bin (?:summary|conclusion)\b`, "Bỏ đoạn kết theo công thức."],
  ["Q7", ERR, String.raw`^\s*(?:#+\s*|=+\s*)?(?:overall|tóm lại|nhìn chung|có thể nói|kết luận)\b`, "Bỏ câu tóm tắt, hết thông tin thì dừng."],
  ["Q7", ERR, String.raw`đối mặt với (?:nhiều|không ít|hàng loạt) (?:thách thức|khó khăn)`, "Bỏ đoạn 'thách thức' theo công thức."],
  ["Q7", REV, String.raw`trong tương lai`, "Chỉ giữ nếu có kế hoạch cụ thể, có nguồn."],

  // Q8 tiêu đề khuôn
  ["Q8", ERR, String.raw`\bawards? and recognition\b|giải thưởng và (?:ghi nhận|vinh danh|thành tựu)`, "Đổi tiêu đề (ví dụ chỉ 'Giải thưởng') hoặc bỏ mục."],

  // Q9 không biết thì không viết
  ["Q9", ERR, String.raw`\bas of my last (?:knowledge|training) (?:update|cutoff)\b|\bup to my last training\b|\bdetails are (?:limited|scarce)\b|\bnot widely (?:available|documented|disclosed|known|reported)\b|\bbased on (?:the )?available information\b|\bin the (?:provided|available) (?:sources|search results)\b|\b(?:maintains|keeps) a low profile\b|\bpersonal (?:life|details) private\b`, "Không biết thì bỏ, không suy đoán."],
  ["Q9", REV, String.raw`\blikely\b|nhiều khả năng|có thể là`, "Suy đoán? Không có nguồn thì bỏ."],
  ["Q9", ERR, String.raw`thông tin (?:về [^.\n]{0,30})?(?:còn )?(?:hạn chế|khan hiếm)|ít chia sẻ về (?:đời tư|cuộc sống riêng)|dựa trên (?:các )?thông tin (?:hiện có|có sẵn)`, "Không biết thì bỏ, không suy đoán."],

  // Q10 răn dạy
  ["Q10", ERR, String.raw`\bit'?s (?:important|critical|crucial|essential|worth) (?:to )?(?:note|remember|consider|noting|mention)\b|\bworth noting\b|\bmay vary\b`, "Bỏ lời răn dạy."],
  ["Q10", ERR, String.raw`cần lưu ý (?:rằng)?|lưu ý rằng|điều quan trọng là`, "Bỏ lời răn dạy."],
  ["Q10", REV, String.raw`tùy (?:từng|vào) trường hợp|tuỳ (?:từng|vào) trường hợp`, "Nếu là câu rào đón chung chung thì bỏ."],

  // Q13 từ tiếng Anh cấm
  ["Q13", ERR, String.raw`\badditionally\b|\balign(?:s|ed|ing)? with\b|\bboast(?:s|ed|ing)?\b|\bbolster(?:s|ed|ing)?\b|\bcrucial(?:ly)?\b|\bdeep dive\b|\bdelv(?:e|es|ed|ing)\b|\bemphasi[sz]ing\b|\benduring\b|\benhanc(?:e|es|ed|ing|ement|ements)\b|\bfoster(?:s|ed|ing)?\b|\bgarner(?:s|ed|ing)?\b|\binterplay\b|\bintricate(?:ly)?\b|\bintricac(?:y|ies)\b|\bmeticulous(?:ly)?\b|\bpivotal\b|\brobust(?:ly|ness)?\b|\bshowcas(?:e|es|ed|ing)\b|\btestament\b|\bunderscor(?:e|es|ed|ing)\b|\bvaluable\b|\bvibrant\b`, "Từ AI bị cấm, thay bằng từ thường hoặc bỏ."],
  ["Q13", REV, String.raw`\bhighlight(?:s|ed|ing)?\b|\bkey\b|\blandscape\b|\btapestry\b|\bcausal(?:ly)?\b|\bempirical(?:ly)?\b|\bcorrelat(?:e|es|ed|ion)\b`, "Chỉ giữ nếu dùng nghĩa đen (danh từ, chìa khóa, phong cảnh, thống kê)."],

  // Q14 từ tiếng Việt cấm
  ["Q14", ERR, String.raw`nâng tầm|đắm chìm|tỉ mỉ|tỷ mỷ|then chốt|sâu sắc|đầy cảm hứng|đặc sắc|nổi bật|thu hút sự chú ý|ngày càng khẳng định|trong bối cảnh|không ngừng`, "Từ bị cấm, viết thẳng sự việc."],
  ["Q14", REV, String.raw`bức tranh|hành trình|khám phá|vững chắc`, "Chỉ giữ nếu dùng nghĩa đen."],

  // Q15 né "là/có"
  ["Q15", ERR, String.raw`\b(?:serves?|served|serving|stands?|stood|functions?|functioned|operates?|operated) as (?:a|an|the)\b|\bventured into\b`, "Dùng 'is/was' hoặc 'has'."],
  ["Q15", REV, String.raw`\brefers to\b|\b(?:represents|marks) (?:a|an|the)\b|\b(?:boasts|features|offers|maintains) (?:a|an)\b|\bbegan (?:his|her|their) career as\b`, "Có thể thay bằng 'is/has' không?"],
  ["Q15", ERR, String.raw`đóng vai trò (?:là|như)|giữ vai trò`, "Dùng 'là'."],
  ["Q15", REV, String.raw`được (?:xem|coi) (?:là|như)|sở hữu|mang đến|mang lại`, "Có thể thay bằng 'là' hoặc 'có' không?"],

  // Q16 quan hệ mơ hồ
  ["Q16", ERR, String.raw`gắn liền với`, "Nói thẳng quan hệ cụ thể."],
  ["Q16", REV, String.raw`\b(?:associated|connected) (?:with|to)\b|\bin (?:connection|association) (?:with|to)\b|có liên hệ với`, "Biết quan hệ cụ thể thì nói thẳng."],

  // Q17 đối lập phủ định
  ["Q17", ERR, String.raw`\bnot only\b[^.\n]{0,100}\bbut\b|\bit'?s not (?:just|only|merely)\b|\bnot just\b[^.\n]{0,80}\bbut\b|\bit'?s not\b[^.,;\n]{1,50},\s*it'?s\b`, "Bỏ phép đối lập, nói thẳng điều đúng."],
  ["Q17", ERR, String.raw`không chỉ\b[^.\n]{0,100}\bmà còn|không phải (?:là )?[^.\n]{1,60}\bmà là|không đơn thuần (?:là|chỉ)|hơn cả một`, "Bỏ phép đối lập, nói thẳng điều đúng."],
  ["Q17", REV, String.raw`\brather than\b|thay vì`, "Kiểm tra có phải phép đối lập kiểu 'Y rather than X' không."],

  // Q19 từ nối đầu câu
  ["Q19", ERR, String.raw`(?:^|[.!?:]\s+)(?:additionally|moreover|furthermore|notably|consequently|importantly)\b`, "Bỏ từ nối đầu câu."],
  ["Q19", ERR, String.raw`(?:^|[.!?:]\s+)(?:ngoài ra|bên cạnh đó|đáng chú ý|hơn nữa|không những thế)\b`, "Bỏ từ nối đầu câu."],

  // Q20 từ cầu kỳ
  ["Q20", REV, String.raw`\bauthored\b|\brelocated\b|\butili[sz](?:e|es|ed|ing|ation)\b|\battempted\b|\bpassed away\b|di dời đến`, "Dùng từ đơn giản: wrote, moved, used, tried, died."],

  // Q23 dấu gạch
  ["Q23", ERR, "—", "Cấm dấu gạch dài. Dùng dấu phẩy, hai chấm, ngoặc đơn hoặc tách câu."],
  ["Q23", REV, String.raw`(?<!\d)–|–(?!\d)`, "Dấu gạch ngắn chỉ dùng cho khoảng số, không cách (2020–2025)."],

  // Q24 nháy cong
  ["Q24", ERR, "[“”‘’]", "Dùng nháy thẳng \" và '."],

  // Q25, Q26 in đậm và danh sách
  ["Q26", ERR, String.raw`^\s*(?:[-*+•–]|\d+[.)])\s*(?:\*\*|__)[^*_\n]+(?:\*\*|__)\s*:?`, "Cấm danh sách 'Tiêu đề in đậm: mô tả'. Viết thành câu."],
  ["Q25", ERR, String.raw`\*\*[^*\n]+\*\*|__[^_\n]+__`, "Cấm in đậm để nhấn mạnh."],
  ["Q26", ERR, String.raw`^\s*•`, "Ký hiệu gạch đầu dòng không chuẩn."],

  // Q28 đường kẻ ngang
  ["Q28", ERR, String.raw`^\s*(?:-{3,}|\*{3,}|_{3,})\s*$`, "Bỏ đường kẻ ngang giữa các mục."],

  // Q29 emoji
  ["Q29", ERR, String.raw`[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B55}\u{FE0F}]`, "Cấm emoji."],

  // Q32 câu trò chuyện
  ["Q32", ERR, String.raw`\bI hope this helps\b|\bcertainly!|\bof course!|\byou'?re absolutely right\b|\bwould you like (?:me )?to\b|\blet me know\b|\bis there anything else\b|\bmore detailed breakdown\b|\bas an? (?:AI|large) language model\b`, "Xóa câu trò chuyện của chatbot."],
  ["Q32", ERR, String.raw`hy vọng (?:điều này |thông tin này |bài viết này |nội dung này )?(?:sẽ )?(?:giúp ích|hữu ích)|chắc chắn rồi|bạn có muốn (?:tôi|mình)|nếu (?:bạn )?cần thêm|là một mô hình ngôn ngữ`, "Xóa câu trò chuyện của chatbot."],
  ["Q32", REV, String.raw`\bhere (?:is|are) (?:a|an|the|your)\b|dưới đây là`, "Nếu là câu dẫn của chatbot thì xóa."],

  // Q33 chỗ trống
  ["Q33", ERR, String.raw`\b20\d\d-(?:xx|XX)-(?:xx|XX)\b|\bTODO\b|\bTBD\b|\[(?:tên|name|your|insert|enter|add|thêm|chèn)\b[^\]\n]{0,40}\]|\((?:add|insert|thêm|chèn)\b[^)\n]{0,60}\)|<!--\s*(?:add|insert|thêm|chèn)\b`, "Chỗ trống chưa điền."],

  // Q34 mã nội bộ
  ["Q34", ERR, String.raw`oaicite|contentReference|oai_citation|turn\d+(?:search|image|news|file)\d+|attributableIndex|\[cite:\s*\d|start_span|end_span|grok_card|grok_render_citation_card_json|【\d+†|\[attached_file:\d+\]|\[web:\d+\]|ppl-ai-file-upload|:::writing|↩|[\u{E000}-\u{F8FF}]`, "Mã nội bộ của chatbot còn sót, xóa."],

  // Q35 tham số theo dõi
  ["Q35", ERR, String.raw`[?&](?:utm_[a-z]+|referrer)=`, "Xóa tham số theo dõi khỏi URL."],

  // Q36 tự khen bài
  ["Q36", ERR, String.raw`\bwell-sourced\b|\breviewer note\b|\bmeets WP:|\b(?:this|the) (?:draft|article) is (?:a )?neutral\b|bài viết (?:này )?(?:trung lập|khách quan) và`, "Không tự khen bài."],
  ["Q36", REV, String.raw`có nguồn (?:đầy đủ|uy tín)|nguồn đáng tin cậy`, "Nếu là lời tự khen thì bỏ."],

  // Q45 bình luận, email
  ["Q45", ERR, String.raw`\bdear [^,\n]{0,40}team\b|\bI am writing to\b|\bI hope (?:this|my) (?:message|email|letter) finds you well\b|\bI understand (?:the|your) concerns?\b|\bmay have been perceived as\b`, "Mở đầu hoặc câu đệm theo khuôn."],
  ["Q45", ERR, String.raw`tôi viết (?:thư|email|bức thư) này (?:nhằm|để)|chúc (?:anh|chị|anh/chị|anh chị|bạn|quý vị) (?:có )?một ngày tốt lành|tôi hiểu (?:băn khoăn|lo ngại|quan ngại|mối lo) của`, "Mở đầu hoặc câu đệm theo khuôn."],
  ["Q45", REV, String.raw`kính gửi`, "Chỉ giữ khi văn bản hành chính bắt buộc theo thể thức."],

  // Q46 trang giới thiệu
  ["Q46", ERR, String.raw`\babout me\b|\blet'?s connect\b|\bhappy editing\b|\bwelcome to my (?:user )?page\b`, "Khuôn trang giới thiệu."],
];

// Chỉ bật khi văn bản là mô tả chỉnh sửa hoặc commit message.
const SUMMARY_RULES = [
  ["Q44", ERR, String.raw`\bensur(?:e|ed|ing)\b|\badheres? to\b|\brefined\b|\benriched\b|\bstreamlined\b|\bimproved (?:clarity|flow|readability|neutrality|tone|attribution|sourcing)\b|\bencyclopedic tone\b|\bin compliance with\b|\bcompl(?:y|ies) with\b`, "Nói nội dung cụ thể đã đổi, không cam kết chung chung."],
  ["Q44", ERR, String.raw`\bpreserv(?:e|ed|ing)\b|\bretain(?:ed|ing)?\b|\bavoid(?:ed|ing)?\b|\bwhile keeping\b|giữ nguyên|tránh`, "Không kể những gì không làm."],
  ["Q44", ERR, String.raw`\badded (?:sourced|verified|cited)\b|\bwith (?:independent|secondary|third-party|peer-reviewed|reliable) sources\b|\bimproved attribution\b|\baddress(?:ed|ing) (?:the )?reviewer(?:'s)? (?:feedback|comments)\b`, "Không khoe có nguồn, không nhắc 'sửa theo góp ý'."],
  ["Q44", ERR, String.raw`tối ưu|cải thiện tính (?:trung lập|khách quan|mạch lạc)|nâng cao chất lượng|nguồn uy tín|sửa theo góp ý`, "Nói nội dung cụ thể đã đổi."],
];

// Chỉ bật khi nơi đăng KHÔNG hỗ trợ Markdown.
const NO_MARKDOWN_RULES = [
  ["Q31", ERR, String.raw`^\s{0,3}#{1,6}\s`, "Nơi đăng không hỗ trợ Markdown: bỏ dấu # tiêu đề."],
  ["Q31", ERR, String.raw`\[[^\]\n]+\]\((?:https?:\/\/|www\.)[^)\s]+\)`, "Nơi đăng không hỗ trợ Markdown: bỏ cú pháp [chữ](link)."],
  ["Q31", ERR, "```", "Nơi đăng không hỗ trợ Markdown: bỏ khối ```."],
];

const SMALL_WORDS = new Set(("a an the of and or in on at to for from by with as vs nor but " +
  "và của với cho trong ở tại từ đến là các những một").split(" "));

function checkHeadings(lines) {
  const hits = [];
  let prevLevel = 0;
  let inFence = false;
  lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) { inFence = !inFence; return; }
    if (inFence) return;
    let m = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    let level, text;
    if (m) { level = m[1].length; text = m[2]; }
    else if ((m = line.match(/^\s*(={2,6})\s*(.+?)\s*\1\s*$/))) { level = m[1].length; text = m[2]; }
    else return;

    if (level === 1 && prevLevel > 0) {
      hits.push([i, 0, "Q28", REV, line.trim(), "Không dùng tiêu đề cấp 1 trong thân bài."]);
    }
    if (prevLevel > 0 && level > prevLevel + 1) {
      hits.push([i, 0, "Q28", ERR, line.trim(), `Nhảy cấp tiêu đề (từ cấp ${prevLevel} xuống cấp ${level}).`]);
    }
    prevLevel = level;

    const words = text.match(/[\p{L}\p{M}]+/gu) || [];
    const later = words.slice(1).filter(w => !SMALL_WORDS.has(w.toLowerCase()));
    if (later.length >= 2 && later.every(w => /^\p{Lu}/u.test(w) && !/^\p{Lu}+$/u.test(w))) {
      hits.push([i, 0, "Q27", REV, line.trim(), "Tiêu đề viết hoa mọi từ. Chỉ viết hoa chữ đầu và tên riêng."]);
    }
  });
  return hits;
}

function scan(text, opts) {
  text = text.replace(/^﻿/, "").normalize("NFC");
  const lines = text.split(/\r?\n/);
  let rules = RULES.slice();
  if (opts.summary) rules = rules.concat(SUMMARY_RULES);
  if (!opts.markdownOk) rules = rules.concat(NO_MARKDOWN_RULES);
  const compiled = rules.map(([id, sev, src, hint]) => [id, sev, rx(src), hint]);

  const hits = [];
  let inFence = false;
  lines.forEach((line, i) => {
    const isFence = /^\s*```/.test(line);
    // Khi được dùng Markdown, bỏ qua nội dung trong khối code.
    if (opts.markdownOk) {
      if (isFence) { inFence = !inFence; return; }
      if (inFence) return;
    }
    const seen = new Set();
    for (const [id, sev, re, hint] of compiled) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(line)) !== null) {
        if (m[0].length === 0) { re.lastIndex++; continue; }
        const key = `${m.index}:${id}`;
        if (!seen.has(key)) {
          seen.add(key);
          hits.push([i, m.index, id, sev, m[0].trim(), hint]);
        }
      }
    }
  });
  return hits.concat(checkHeadings(lines))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

function main() {
  const args = process.argv.slice(2);
  const opts = {
    markdownOk: args.includes("--markdown-ok"),
    summary: args.includes("--summary"),
  };
  const files = args.filter(a => !a.startsWith("--") || a === "-");
  if (files.length === 0 || args.includes("--help")) {
    console.log("Cách dùng: node check_text.js <file|-> [--markdown-ok] [--summary]");
    process.exit(files.length === 0 ? 2 : 0);
  }

  let totalErr = 0, totalRev = 0;
  for (const f of files) {
    let text;
    try {
      text = f === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(f, "utf8");
    } catch (e) {
      console.error(`Không đọc được ${f}: ${e.message}`);
      process.exit(2);
    }
    const hits = scan(text, opts);
    console.log(`\n== ${f === "-" ? "(stdin)" : f}`);
    if (hits.length === 0) console.log("  Không phát hiện vi phạm nào.");
    for (const [ln, col, id, sev, match, hint] of hits) {
      const shown = match.length > 60 ? match.slice(0, 57) + "..." : match;
      console.log(`  ${String(ln + 1).padStart(4)}:${String(col + 1).padEnd(3)} ${sev.padEnd(7)} ${id.padEnd(4)} "${shown}"  -> ${hint}`);
      if (sev === ERR) totalErr++; else totalRev++;
    }
  }
  console.log(`\nTổng: ${totalErr} ${ERR}, ${totalRev} ${REV}`);
  console.log("Script chỉ bắt dấu hiệu bề mặt. Vẫn phải tự rà Q1, Q5, Q6, Q9, Q18, Q21, Q38–Q43, Q47–Q49.");
  process.exit(totalErr > 0 ? 1 : 0);
}

if (require.main === module) main();
module.exports = { scan };
