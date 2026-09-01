import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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

async function main() {
  console.log("Fetching questions from Firestore collection 'bank_questions'...");
  const snap = await getDocs(collection(db, 'bank_questions'));
  console.log(`Fetched ${snap.docs.length} questions.`);

  const questions = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const jsonPath = path.join(__dirname, '../scratch_raw_questions.json');
  fs.writeFileSync(jsonPath, JSON.stringify(questions, null, 2), 'utf-8');
  console.log("Saved raw questions to scratch_raw_questions.json");
}

main().catch(err => {
  console.error("Error in script:", err);
  process.exit(1);
});
