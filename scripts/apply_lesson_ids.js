import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
  apiKey: "AIzaSyDl582-NGpQDX3flvHeqJb5aPdCVXYf7Bo",
  authDomain: "giasuhoa11.firebaseapp.com",
  projectId: "giasuhoa11",
  storageBucket: "giasuhoa11.firebasestorage.app",
  messagingSenderId: "334980936585",
  appId: "1:334980936585:web:2590cc0f7551a0b492e758"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const proposalPath = path.join(__dirname, '../scratch_proposal_results.json');
if (!fs.existsSync(proposalPath)) {
  console.error('Khong tim thay file: ' + proposalPath);
  process.exit(1);
}

const proposals = JSON.parse(fs.readFileSync(proposalPath, 'utf-8'));
console.log('Da doc ' + proposals.length + ' ban ghi tu scratch_proposal_results.json');

const toUpdate = proposals.filter(p => p.proposedId && p.proposedId.trim() !== '');
const toSkip   = proposals.filter(p => !p.proposedId || p.proposedId.trim() === '');

console.log('Se cap nhat: ' + toUpdate.length + ' cau hoi');
console.log('Bo qua: ' + toSkip.length + ' cau hoi (lessonId rong - confidence That)');
console.log('');

const BATCH_SIZE = 499;
let updatedCount = 0;
let errorCount   = 0;
const errorList  = [];
const bankCol = collection(db, 'bank_questions');

for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
  const chunk = toUpdate.slice(i, i + BATCH_SIZE);
  const batchIndex = Math.floor(i / BATCH_SIZE) + 1;
  const totalBatches = Math.ceil(toUpdate.length / BATCH_SIZE);
  console.log('Dang ghi batch ' + batchIndex + '/' + totalBatches + ' (' + chunk.length + ' cau)...');
  try {
    const batch = writeBatch(db);
    for (const item of chunk) {
      const docRef = doc(bankCol, item.id);
      batch.update(docRef, { lessonId: item.proposedId });
    }
    await batch.commit();
    updatedCount += chunk.length;
    console.log('  Batch ' + batchIndex + ' thanh cong: +' + chunk.length + ' cau');
  } catch (err) {
    errorCount += chunk.length;
    const errMsg = 'Batch ' + batchIndex + ' (cau ' + (i + 1) + '-' + (i + chunk.length) + '): ' + err.message;
    errorList.push(errMsg);
    console.error('  Batch ' + batchIndex + ' THAT BAI: ' + err.message);
  }
}

console.log('');
console.log('===== BAO CAO KET QUA =====');
console.log('Cap nhat thanh cong : ' + updatedCount + ' cau');
console.log('Bo qua (de rong)    : ' + toSkip.length + ' cau');
console.log('Loi                 : ' + errorCount + ' cau');
console.log('Tong xu ly          : ' + proposals.length + ' cau');

if (errorList.length > 0) {
  console.log('Chi tiet loi:');
  errorList.forEach(e => console.log('  - ' + e));
}

const reportLines = [
  'apply_lesson_ids.js - Bao cao chay luc ' + new Date().toISOString(),
  '========================================',
  'Cap nhat thanh cong : ' + updatedCount + ' cau',
  'Bo qua (de rong)    : ' + toSkip.length + ' cau',
  'Loi                 : ' + errorCount + ' cau',
  'Tong                : ' + proposals.length + ' cau',
];
if (errorList.length > 0) {
  reportLines.push('', 'Chi tiet loi:');
  errorList.forEach(e => reportLines.push('  - ' + e));
}
reportLines.push('', '--- Danh sach cau da cap nhat ---');
toUpdate.forEach(p => reportLines.push(p.stt + '. [' + p.id + '] -> ' + p.proposedId + ' (' + p.confidence + ')'));
reportLines.push('', '--- Danh sach cau bo qua ---');
toSkip.forEach(p => reportLines.push(p.stt + '. [' + p.id + '] -- ' + (p.reason || 'Confidence That')));

const reportPath = path.join(__dirname, '../scratch_apply_report.txt');
fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf-8');
console.log('Bao cao da luu tai: scratch_apply_report.txt');

if (errorCount === 0) {
  console.log('Hoan thanh! Tat ca lessonId da duoc ghi len Firestore.');
} else {
  console.log('Hoan thanh voi loi. Kiem tra chi tiet ben tren.');
}

process.exit(0);
