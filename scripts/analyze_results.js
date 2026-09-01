import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const results = JSON.parse(fs.readFileSync(path.join(__dirname, '../scratch_match_results.json'), 'utf-8'));

console.log("=== LOW CONFIDENCE EXAMPLES ===");
results.filter(r => r.confidence === 'Thấp').slice(0, 15).forEach(r => {
  console.log(`[STT ${r.stt}] [Chương ${r.ch}] ${r.shortQ}`);
  console.log(`  Topic: "${r.topic}" | De xuat: "${r.proposedTitle}" (score: ${r.score})`);
});
