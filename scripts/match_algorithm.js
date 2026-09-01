import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read raw questions
const rawPath = path.join(__dirname, '../scratch_raw_questions.json');
const questions = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));

// Lesson definitions mapping per chapter
const LESSON_MAP = {
  1: [
    {
      id: "bai-1",
      title: "Bài 1: Khái niệm về cân bằng hoá học",
      keywords: ["thuận nghịch", "cân bằng", "hằng số cân bằng", "kc", "le chatelier", "chuyển dịch", "tốc độ thuận", "tốc độ nghịch", "tỏa nhiệt", "thu nhiệt", "áp suất", "nồng độ"]
    },
    {
      id: "bai-2",
      title: "Bài 2: Cân bằng trong dung dịch nước và thuyết acid – base",
      keywords: ["điện li", "ph", "poh", "acid", "base", "chất điện li", "brønsted", "proton", "h+", "oh-", "quỳ tím", "phenolphthalein", "tích số ion", "nước", "h2o", "thuẫn nghịch"]
    },
    {
      id: "bai-3",
      title: "Bài 3: Ôn tập chương 1",
      keywords: ["chuẩn độ", "ôn tập chương 1", "tổng hợp cân bằng"]
    }
  ],
  2: [
    {
      id: "bai-4",
      title: "Bài 4: Nitrogen",
      keywords: ["nitrogen", "đơn chất n2", "khí n2", "liên kết ba", "n≡n", "khí trơ"]
    },
    {
      id: "bai-5",
      title: "Bài 5: Ammonia và muối ammonium",
      keywords: ["ammonia", "nh3", "ammonium", "nh4+", "nh4", "khí nh3", "mùi khai", "phản ứng tạo khói trắng"]
    },
    {
      id: "bai-6",
      title: "Bài 6: Một số hợp chất của nitrogen với oxygen",
      keywords: ["no", "no2", "hno3", "nitric acid", "nitrate", "mưa acid", "tính oxi hóa mạnh", "phú dưỡng", "chu trình nitrogen"]
    },
    {
      id: "bai-7",
      title: "Bài 7: Sulfur và sulfur dioxide",
      keywords: ["sulfur", "lưu huỳnh", "so2", "sulfur dioxide", "khí so2", "mưa axit", "ô nhiễm"]
    },
    {
      id: "bai-8",
      title: "Bài 8: Sulfuric acid và muối sulfate",
      keywords: ["h2so4", "sulfuric acid", "sulfate", "so4 2-", "so4", "bacl2", "ba(oh)2", "háo nước", "tính oxi hóa"]
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
      keywords: ["hợp chất hữu cơ", "hóa học hữu cơ", "nhóm chức", "đặc điểm chung hợp chất hữu cơ", "phân loại hợp chất hữu cơ"]
    },
    {
      id: "bai-11",
      title: "Bài 11: Phương pháp tách biệt và tinh chế hợp chất hữu cơ",
      keywords: ["chưng cất", "chiết", "kết tinh", "sắc ký", "tách biệt", "tinh chế"]
    },
    {
      id: "bai-12",
      title: "Bài 12: Công thức phân tử hợp chất hữu cơ",
      keywords: ["phân tích nguyên tố", "phổ khối lượng", "ms", "m/z", "công thức đơn giản nhất", "ctđgn", "ctpt", "công thức phân tử", "phần trăm khối lượng"]
    },
    {
      id: "bai-13",
      title: "Bài 13: Cấu tạo hoá học hợp chất hữu cơ",
      keywords: ["thuyết cấu tạo", "công thức cấu tạo", "đồng đẳng", "đồng phân", "liên kết đơn", "liên kết đôi", "liên kết ba", "mạch cacbon", "mạch carbon"]
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
      keywords: ["alkane", "paraffin", "cnh2n+2", "methane", "ch4", "ethane", "propane", "butane", "pentane", "thế halogen", "cracking", "chỉ số octane", "gas", "khí thiên nhiên"]
    },
    {
      id: "bai-16",
      title: "Bài 16: Hydrocarbon không no",
      keywords: ["alkene", "alkyne", "không no", "cnh2n", "cnh2n-2", "ethylene", "c2h4", "acetylene", "c2h2", "propene", "propyne", "cộng br2", "bromine", "kmno4", "thuốc tím", "agn3", "đồng phân hình học", "cis", "trans", "markovnikov"]
    },
    {
      id: "bai-17",
      title: "Bài 17: Arene (Hydrocarbon thơm)",
      keywords: ["arene", "benzene", "c6h6", "toluene", "c7h8", "xylene", "thơm", "vòng benzene", "nitro hóa", "brom hóa benzene", "kmno4 đun nóng"]
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
      keywords: ["dẫn xuất halogen", "ch3cl", "c2h5br", "thủy phân dẫn xuất halogen", "thế nucleophile", "tách hx", "cfc", "refrigerant"]
    },
    {
      id: "bai-20",
      title: "Bài 20: Alcohol",
      keywords: ["alcohol", "r-oh", "methanol", "ch3oh", "ethanol", "c2h5oh", "ethylene glycol", "glycerol", "bậc alcohol", "thế na", "tách nước alkene", "tách nước ether", "cuo đun nóng"]
    },
    {
      id: "bai-21",
      title: "Bài 21: Phenol",
      keywords: ["phenol", "c6h5oh", "tính acid của phenol", "kết tủa trắng brom", "vòng phenol", "picric acid", "không đổi màu quỳ"]
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
      keywords: ["carbonyl", "aldehyde", "ketone", "cho", "co", "formaldehyde", "hcho", "acetaldehyde", "ch3cho", "acetone", "ch3coch3", "tráng bạc", "agno3/nh3", "cu(oh)2", "iodoform", "chi-loi-hoi-phuc"]
    },
    {
      id: "bai-24",
      title: "Bài 24: Carboxylic acid",
      keywords: ["carboxylic acid", "acid hữu cơ", "cooh", "formic acid", "hcooh", "acetic acid", "ch3cooh", "ester hóa", "ester", "tính acid của ch3cooh"]
    },
    {
      id: "bai-25",
      title: "Bài 25: Ôn tập chương 6",
      keywords: ["ôn tập chương 6"]
    }
  ]
};

function matchQuestion(q) {
  const ch = q.ch || 1;
  const lessonsInCh = LESSON_MAP[ch] || [];

  const textToSearch = [
    q.q || '',
    q.topic || '',
    q.e || '',
    q.ans || '',
    ...(q.o || []),
    ...(q.st ? q.st.map(s => s.s) : [])
  ].join(' ').toLowerCase();

  let bestMatch = null;
  let maxScore = 0;
  let secondMax = 0;

  for (const lesson of lessonsInCh) {
    let score = 0;
    for (const kw of lesson.keywords) {
      if (textToSearch.includes(kw.toLowerCase())) {
        // give higher weight for specific keywords
        if (kw.length > 5) score += 3;
        else if (kw.length > 3) score += 2;
        else score += 1;
      }
    }

    if (score > maxScore) {
      secondMax = maxScore;
      maxScore = score;
      bestMatch = lesson;
    } else if (score > secondMax) {
      secondMax = score;
    }
  }

  let confidence = "Thấp";
  if (maxScore >= 6 && maxScore > secondMax + 2) {
    confidence = "Cao";
  } else if (maxScore >= 3 && maxScore > secondMax) {
    confidence = "Trung bình";
  }

  if (maxScore === 0) {
    return {
      lessonId: "",
      lessonTitle: "Chưa xác định",
      confidence: "Thấp",
      score: 0
    };
  }

  // If score is too low or ambiguous, return unassigned if confidence is low
  if (confidence === "Thấp" && maxScore < 2) {
    return {
      lessonId: "",
      lessonTitle: "Chưa xác định",
      confidence: "Thấp",
      score: maxScore
    };
  }

  return {
    lessonId: bestMatch.id,
    lessonTitle: bestMatch.title,
    confidence: confidence,
    score: maxScore
  };
}

const results = questions.map((q, index) => {
  const match = matchQuestion(q);
  // Shorten question text to ~50 characters
  const cleanQ = (q.q || '').replace(/[\r\n]+/g, ' ').trim();
  const shortQ = cleanQ.length > 55 ? cleanQ.slice(0, 50) + '...' : cleanQ;

  return {
    stt: index + 1,
    id: q.id,
    shortQ,
    fullQ: cleanQ,
    topic: q.topic || '',
    ch: q.ch,
    proposedId: match.lessonId,
    proposedTitle: match.lessonTitle,
    confidence: match.confidence,
    score: match.score
  };
});

fs.writeFileSync(path.join(__dirname, '../scratch_match_results.json'), JSON.stringify(results, null, 2), 'utf-8');

console.log(`Processed ${results.length} questions.`);
console.log(`Cao: ${results.filter(r => r.confidence === 'Cao').length}`);
console.log(`Trung bình: ${results.filter(r => r.confidence === 'Trung bình').length}`);
console.log(`Thấp: ${results.filter(r => r.confidence === 'Thấp').length}`);
