import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read raw questions
const rawPath = path.join(__dirname, '../scratch_raw_questions.json');
const questions = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));

function normalizeChem(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[₀0]/g, '0')
    .replace(/[₁1]/g, '1')
    .replace(/[₂2]/g, '2')
    .replace(/[₃3]/g, '3')
    .replace(/[₄4]/g, '4')
    .replace(/[₅5]/g, '5')
    .replace(/[₆6]/g, '6')
    .replace(/[₇7]/g, '7')
    .replace(/[₈8]/g, '8')
    .replace(/[₉9]/g, '9')
    .replace(/⁺/g, '+')
    .replace(/⁻/g, '-');
}

const LESSON_DEFINITIONS = {
  1: [
    {
      id: "bai-1",
      title: "Bài 1: Khái niệm về cân bằng hoá học",
      keywords: [
        "thuận nghịch", "cân bằng", "hằng số cân bằng", "kc", "le chatelier", "le châtelier",
        "chuyển dịch", "tốc độ thuận", "tốc độ nghịch", "tỏa nhiệt", "thu nhiệt", "delta h", "dh < 0", "dh > 0",
        "tăng áp suất", "giảm áp suất", "tăng nhiệt độ", "giảm nhiệt độ", "cân bằng hóa học", "phản ứng một chiều",
        "phản ứng thuận nghịch"
      ]
    },
    {
      id: "bai-2",
      title: "Bài 2: Cân bằng trong dung dịch nước và thuyết acid – base",
      keywords: [
        "điện li", "ph =", "tính ph", "ph của", "poh", "acid", "base", "chất điện li", "brønsted", "bronsted",
        "lowry", "proton", "h+", "oh-", "quỳ tím", "phenolphthalein", "tích số ion", "điện li mạnh",
        "điện li yếu", "ka", "kb", "dung dịch acid", "dung dịch base", "môi trường acid", "môi trường base",
        "nồng độ ion", "nhường proton", "nhận proton", "lưỡng tính"
      ]
    },
    {
      id: "bai-3",
      title: "Bài 3: Ôn tập chương 1",
      keywords: ["chuẩn độ", "buret", "pipet", "dung dịch chuẩn", "điểm tương đương", "ôn tập chương 1"]
    }
  ],
  2: [
    {
      id: "bai-4",
      title: "Bài 4: Nitrogen",
      keywords: [
        "nitrogen", "đơn chất n2", "khí n2", "n2", "n≡n", "tính trơ", "khí trơ", "n2 + o2", "liên kết ba",
        "chu trình nitrogen", "lỏng ở nhiệt độ"
      ]
    },
    {
      id: "bai-5",
      title: "Bài 5: Ammonia và muối ammonium",
      keywords: [
        "ammonia", "nh3", "ammonium", "nh4+", "nh4", "khí nh3", "mùi khai", "khói trắng", "nh4cl",
        "tính base của nh3", "nh4no3", "(nh4)2so4", "đũa thủy tinh", "tẩm nh3"
      ]
    },
    {
      id: "bai-6",
      title: "Bài 6: Một số hợp chất của nitrogen với oxygen",
      keywords: [
        "hno3", "nitric acid", "nitrate", "no3-", "mưa acid", "phú dưỡng", "tính oxi hóa mạnh",
        "hno3 đặc", "hno3 loãng", "khí no2", "khí no", "hóa nâu", "không màu hóa nâu", "muối nitrate",
        "n2o", "n2o4"
      ]
    },
    {
      id: "bai-7",
      title: "Bài 7: Sulfur và sulfur dioxide",
      keywords: [
        "sulfur", "lưu huỳnh", "so2", "sulfur dioxide", "khí so2", "mất màu nước bromine", "mất màu nước brom",
        "tính khử của so2", "tính oxi hóa của so2", "đơn chất s"
      ]
    },
    {
      id: "bai-8",
      title: "Bài 8: Sulfuric acid và muối sulfate",
      keywords: [
        "h2so4", "sulfuric acid", "sulfate", "so4 2-", "so4", "bacl2", "ba(oh)2", "baso4", "háo nước",
        "h2so4 đặc", "h2so4 loãng", "kết tủa trắng", "thụ động hóa", "rót acid vào nước", "pha loãng h2so4"
      ]
    },
    {
      id: "bai-9",
      title: "Bài 9: Ôn tập chương 2",
      keywords: ["ôn tập chương 2"]
    }
  ],
  3: [
    {
      id: "bai-10",
      title: "Bài 10: Hợp chất hữu cơ và hóa học hữu cơ",
      keywords: [
        "hợp chất hữu cơ", "hóa học hữu cơ", "nhóm chức", "phân loại hợp chất hữu cơ", "đặc điểm chung hợp chất hữu cơ",
        "liên kết trong hợp chất hữu cơ"
      ]
    },
    {
      id: "bai-11",
      title: "Bài 11: Phương pháp tách biệt và tinh chế hợp chất hữu cơ",
      keywords: [
        "chưng cất", "chiết", "kết tinh", "sắc ký", "tách biệt", "tinh chế", "bình chiết", "nhiệt độ sôi",
        "độ tan", "sắc ký cột", "sắc ký lớp mỏng"
      ]
    },
    {
      id: "bai-12",
      title: "Bài 12: Công thức phân tử hợp chất hữu cơ",
      keywords: [
        "phổ khối lượng", "ms", "m/z", "công thức đơn giản nhất", "ctđgn", "ctpt", "công thức phân tử",
        "phân tích nguyên tố", "khối lượng phân tử", "phần trăm khối lượng", "%c", "%h", "%o", "%n"
      ]
    },
    {
      id: "bai-13",
      title: "Bài 13: Cấu tạo hoá học hợp chất hữu cơ",
      keywords: [
        "thuyết cấu tạo", "công thức cấu tạo", "đồng đẳng", "đồng phân", "mạch carbon", "mạch hở",
        "mạch vòng", "liên kết đơn", "liên kết đôi", "liên kết ba", "đồng phân cấu tạo", "đồng phân vị trí"
      ]
    },
    {
      id: "bai-14",
      title: "Bài 14: Ôn tập chương 3",
      keywords: ["ôn tập chương 3"]
    }
  ],
  4: [
    {
      id: "bai-15",
      title: "Bài 15: Alkane",
      keywords: [
        "alkane", "paraffin", "cnh2n+2", "methane", "ch4", "ethane", "c2h6", "propane", "c3h8",
        "butane", "c4h10", "pentane", "thế halogen", "cracking", "octane", "gas", "chỉ số octane",
        "phản ứng thế clo", "phản ứng thế bromine"
      ]
    },
    {
      id: "bai-16",
      title: "Bài 16: Hydrocarbon không no",
      keywords: [
        "alkene", "alkyne", "không no", "cnh2n", "cnh2n-2", "ethylene", "c2h4", "acetylene", "c2h2",
        "propene", "propyne", "cộng br2", "bromine", "kmno4", "thuốc tím", "agno3/nh3", "kết tủa vàng",
        "đồng phân hình học", "cis", "trans", "markovnikov", "mactocnicop", "trùng hợp", "polyethylene", "pe"
      ]
    },
    {
      id: "bai-17",
      title: "Bài 17: Arene (Hydrocarbon thơm)",
      keywords: [
        "arene", "benzene", "c6h6", "toluene", "c7h8", "xylene", "thơm", "vòng benzene",
        "nitro hóa", "br2/fe", "brom hóa benzene", "kmno4 đun nóng", "thế electrophile", "styrene"
      ]
    },
    {
      id: "bai-18",
      title: "Bài 18: Ôn tập chương 4",
      keywords: ["ôn tập chương 4"]
    }
  ],
  5: [
    {
      id: "bai-19",
      title: "Bài 19: Dẫn xuất halogen",
      keywords: [
        "dẫn xuất halogen", "ch3cl", "c2h5br", "thủy phân dẫn xuất halogen", "thế nucleophile",
        "tách hx", "cfc", "gốc halogen", "haloalkane"
      ]
    },
    {
      id: "bai-20",
      title: "Bài 20: Alcohol",
      keywords: [
        "alcohol", "r-oh", "methanol", "ch3oh", "ethanol", "c2h5oh", "ethylene glycol",
        "glycerol", "bậc alcohol", "thế na", "tách nước alkene", "tách nước ether", "cuo đun nóng",
        "ancol", "bậc i", "bậc ii", "bậc iii"
      ]
    },
    {
      id: "bai-21",
      title: "Bài 21: Phenol",
      keywords: [
        "phenol", "c6h5oh", "tính acid của phenol", "kết tủa trắng bromine", "kết tủa trắng br2",
        "vòng phenol", "picric acid", "không đổi màu quỳ tím", "tác dụng với naoh"
      ]
    },
    {
      id: "bai-22",
      title: "Bài 22: Ôn tập chương 5",
      keywords: ["ôn tập chương 5"]
    }
  ],
  6: [
    {
      id: "bai-23",
      title: "Bài 23: Hợp chất carbonyl",
      keywords: [
        "carbonyl", "aldehyde", "ketone", "cho", "co", "formaldehyde", "hcho", "acetaldehyde",
        "ch3cho", "acetone", "ch3coch3", "tráng bạc", "agno3/nh3", "cu(oh)2", "iodoform",
        "kết tủa ag", "gạch đỏ cu2o", "kết tủa vàng iodoform"
      ]
    },
    {
      id: "bai-24",
      title: "Bài 24: Carboxylic acid",
      keywords: [
        "carboxylic acid", "acid hữu cơ", "cooh", "formic acid", "hcooh", "acetic acid",
        "ch3cooh", "ester hóa", "ester", "tính acid của ch3cooh", "tính acid của hcooh", "vị chua"
      ]
    },
    {
      id: "bai-25",
      title: "Bài 25: Ôn tập chương 6",
      keywords: ["ôn tập chương 6"]
    }
  ]
};

function matchSingle(q) {
  const ch = q.ch || 1;
  const lessonsInCh = LESSON_DEFINITIONS[ch] || [];

  const rawText = [
    q.q || '',
    q.topic || '',
    q.e || '',
    q.ans || '',
    ...(q.o || []),
    ...(q.st ? q.st.map(s => s.s) : [])
  ].join(' ');

  const textToSearch = normalizeChem(rawText);

  let matches = [];

  for (const lesson of lessonsInCh) {
    let matchedKws = [];
    let score = 0;

    for (const kw of lesson.keywords) {
      const normKw = normalizeChem(kw);
      if (textToSearch.includes(normKw)) {
        matchedKws.push(kw);
        if (normKw.length >= 6) score += 4;
        else if (normKw.length >= 4) score += 2;
        else score += 1;
      }
    }

    if (score > 0) {
      matches.push({ lesson, score, matchedKws });
    }
  }

  matches.sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    return {
      lessonId: "",
      lessonTitle: "Chưa xác định",
      confidence: "Thấp",
      score: 0,
      reason: "Không tìm thấy từ khóa đặc trưng trong chương"
    };
  }

  const best = matches[0];
  const second = matches[1];

  let confidence = "Thấp";
  if (best.score >= 5 && (!second || best.score >= second.score + 2)) {
    confidence = "Cao";
  } else if (best.score >= 2 && (!second || best.score > second.score)) {
    confidence = "Trung bình";
  }

  // Strict rule: If confidence is low (score <= 2 or tied), leave lessonId empty
  if (confidence === "Thấp") {
    return {
      lessonId: "",
      lessonTitle: "Chưa xác định",
      confidence: "Thấp",
      score: best.score,
      reason: `Mức độ tin cậy thấp (khớp: ${best.matchedKws.join(', ')})`
    };
  }

  return {
    lessonId: best.lesson.id,
    lessonTitle: best.lesson.title,
    confidence: confidence,
    score: best.score,
    reason: `Khớp: ${best.matchedKws.join(', ')}`
  };
}

const proposalResults = questions.map((q, idx) => {
  const m = matchSingle(q);
  const cleanQ = (q.q || '').replace(/[\r\n]+/g, ' ').trim();
  const shortQ = cleanQ.length > 55 ? cleanQ.slice(0, 52) + '...' : cleanQ;

  return {
    stt: idx + 1,
    id: q.id,
    shortQ,
    fullQ: cleanQ,
    ch: q.ch,
    topic: q.topic || '',
    proposedId: m.lessonId,
    proposedTitle: m.lessonTitle,
    confidence: m.confidence,
    reason: m.reason
  };
});

// Save JSON
const outJsonPath = path.join(__dirname, '../scratch_proposal_results.json');
fs.writeFileSync(outJsonPath, JSON.stringify(proposalResults, null, 2), 'utf-8');

// Save Markdown Table
const mdPath = path.join(__dirname, '../scratch_proposal_report.md');
let mdContent = `# BÁO CÁO ĐỀ XUẤT GÁN LESSON_ID CHO 252 CÂU HỎI NGÂN HÀNG

**Thống kê tổng quan:**
- **Tổng số câu hỏi:** ${proposalResults.length}
- **🟢 Đã xác định rõ (Độ tin cậy Cao):** ${proposalResults.filter(r => r.confidence === 'Cao').length} câu
- **🟡 Đã đề xuất (Độ tin cậy Trung bình):** ${proposalResults.filter(r => r.confidence === 'Trung bình').length} câu
- **🔴 Chưa đủ căn cứ / Để rỗng (Độ tin cậy Thấp):** ${proposalResults.filter(r => r.confidence === 'Thấp').length} câu

---

## Bảng đề xuất gán bài học cho 252 câu hỏi

| STT | ID Câu Hỏi | Nội dung câu hỏi (Rút gọn ~50 ký tự) | Chương | Bài học đề xuất | Độ tin cậy | Ghi chú |
| :---: | :--- | :--- | :---: | :--- | :---: | :--- |
`;

proposalResults.forEach(r => {
  const confBadge = r.confidence === 'Cao' ? '🟢 Cao' : r.confidence === 'Trung bình' ? '🟡 Trung bình' : '🔴 Thấp';
  const lessonDisplay = r.proposedId ? `**${r.proposedId}**: ${r.proposedTitle}` : '*Để rỗng*';
  const safeQ = r.shortQ.replace(/\|/g, '\\|');
  mdContent += `| ${r.stt} | \`${r.id}\` | ${safeQ} | C${r.ch} | ${lessonDisplay} | ${confBadge} | ${r.reason} |\n`;
});

fs.writeFileSync(mdPath, mdContent, 'utf-8');

console.log("=== THỐNG KÊ ĐỀ XUẤT GÁN BÀI HỌC ===");
console.log(`Tổng số câu: ${proposalResults.length}`);
console.log(`🟢 Độ tin cậy CAO: ${proposalResults.filter(r => r.confidence === 'Cao').length}`);
console.log(`🟡 Độ tin cậy TRUNG BÌNH: ${proposalResults.filter(r => r.confidence === 'Trung bình').length}`);
console.log(`🔴 Độ tin cậy THẤP (Để rỗng): ${proposalResults.filter(r => r.confidence === 'Thấp').length}`);
