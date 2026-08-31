import { Chapter } from './types';

/**
 * Chương trình Hoá học 11 — Kết nối tri thức với cuộc sống (2018).
 *
 * Đánh số bài KHỚP với 25 bài giảng slide và với ngân hàng câu hỏi.
 * Trước đây web đánh số 1–6 cho các bài thật là 1, 2, 4, 6, 10, 15 nên
 * học sinh thấy hai cách đánh số khác nhau giữa mục Bài giảng và mục SGK.
 *
 * Lý thuyết lấy từ tệp .docx của giáo viên; câu luyện tập lấy từ ngân hàng
 * câu hỏi theo đúng chương. Phần tóm tắt và câu hỏi kèm lời giải mẫu do
 * giáo viên soạn tay được giữ nguyên, chuyển sang bài cùng chủ đề.
 */
export const CHEMISTRY_11_CURRICULUM: Chapter[] = [
  {
    "id": "chuong-1",
    "title": "Chương 1: Cân bằng hoá học",
    "lessons": [
      {
        "id": "bai-1",
        "title": "Bài 1: Khái niệm về cân bằng hoá học",
        "summary": "Học sinh nắm vững khái niệm phản ứng một chiều, phản ứng thuận nghịch và trạng thái cân bằng hóa học. Hiểu được hằng số cân bằng Kc chỉ phụ thuộc vào bản chất của chất phản ứng và nhiệt độ. Hiểu nguyên lí chuyển dịch cân bằng Le Chatelier: Khi một hệ đang ở trạng thái cân bằng chịu một tác động từ bên ngoài như thay đổi nhiệt độ, nồng độ hoặc áp suất, cân bằng sẽ chuyển dịch theo chiều làm giảm tác động đó.",
        "formulae": [
          "Hằng số cân bằng Kc: Phản ứng aA + bB ⇌ cC + dD => Kc = ([C]^c * [D]^d) / ([A]^a * [B]^b)",
          "Tốc độ phản ứng thuận vt = kt * [A]^a * [B]^b và tốc độ phản ứng nghịch vn = kn * [C]^c * [D]^d",
          "Ở trạng thái cân bằng: vt = vn và hằng số cân bằng Kc = kt / kn",
          "Ví dụ: NaOH + HCl → NaCl + H2O",
          "Ví dụ: Cl2 + H2O ⇌ HCl + HClO",
          "− Xét phản ứng thuận nghịch tổng quát: aA + bB ⇌ cC + dD"
        ],
        "commonQuestions": [
          {
            "question": "Cho phản ứng thuận nghịch ở trạng thái cân bằng: N2(k) + 3H2(k) ⇌ 2NH3(k)  ΔH < 0. Để tăng hiệu suất tạo thành NH3, ta nên thay đổi nhiệt độ và áp suất như thế nào?",
            "hint": "Hãy phân tích: 1) Phản ứng thuận tỏa nhiệt (ΔH < 0) hay thu nhiệt? Theo Le Chatelier, muốn cân bằng dịch chuyển sang chiều tỏa nhiệt (thuận), ta cần tăng hay giảm nhiệt độ? 2) Số mol khí ở vế trái là bao nhiêu và vế phải là bao nhiêu? Muốn dịch chuyển theo chiều giảm số mol khí (thuận), ta cần tăng hay giảm áp suất của hệ?",
            "sampleAnswer": "1. Về nhiệt độ: Phản ứng thuận tỏa nhiệt (ΔH < 0). Để cân bằng dịch chuyển theo chiều thuận, ta cần giảm nhiệt độ của hệ.\n2. Về áp suất: Vế trái có 4 mol khí (1 N2 + 3 H2), vế phải có 2 mol khí (2 NH3). Chiều thuận làm giảm số mol khí. Do đó, để cân bằng dịch chuyển theo chiều thuận, ta cần tăng áp suất chung của hệ.\nKết luận: Để tăng hiệu suất tạo NH3, cần giảm nhiệt độ thích hợp và tăng áp suất hệ."
          },
          {
            "question": "Viết biểu thức hằng số cân bằng Kc cho phản ứng sau: CaCO3 (rắn) ⇌ CaO (rắn) + CO2 (khí).",
            "hint": "Lưu ý rất quan trọng: Trong biểu thức hằng số cân bằng Kc, các chất ở thể rắn có nồng độ coi như không đổi và bằng 1. Chúng ta có đưa chất rắn vào biểu thức Kc không?",
            "sampleAnswer": "Vì CaCO3 và CaO là các chất ở trạng thái rắn, nồng độ của chúng được coi là hằng số và không biểu diễn trong biểu thức hằng số cân bằng.\nDo đó, biểu thức hằng số cân bằng chỉ phụ thuộc vào nồng độ của chất khí duy nhất là CO2:\nKc = [CO2]"
          }
        ],
        "textbook": {
          "pageRange": "Trang 6 – 19",
          "objectives": [
            "Nêu được khái niệm phản ứng thuận nghịch và trạng thái cân bằng hóa học.",
            "Viết được biểu thức hằng số cân bằng (Kc) của phản ứng thuận nghịch.",
            "Thực hiện được thí nghiệm về sự dịch chuyển cân bằng hóa học.",
            "Vận dụng được nguyên lí Le Chatelier để dự đoán chiều chuyển dịch cân bằng."
          ],
          "sections": [
            {
              "id": "b1-s1",
              "sectionTitle": "I. Phản ứng thuận nghịch và trạng thái cân bằng",
              "content": "Trong hóa học, phản ứng thuận nghịch là phản ứng xảy ra được theo cả hai chiều trong cùng điều kiện. Ký hiệu bằng mũi tên hai chiều (⇌).\n\nVí dụ điển hình: Phản ứng tổng hợp ammonia trong công nghiệp:\nN₂(g) + 3H₂(g) ⇌ 2NH₃(g)   ΔH° = −92 kJ/mol\n\nTrạng thái cân bằng hóa học là trạng thái mà tại đó tốc độ phản ứng thuận bằng tốc độ phản ứng nghịch. Ở trạng thái này, nồng độ các chất không thay đổi theo thời gian, nhưng phản ứng vẫn đang diễn ra ở cả hai chiều.\n\nĐây là cân bằng động — không phải cân bằng tĩnh!",
              "keyPoints": [
                "Phản ứng thuận nghịch có thể xảy ra theo cả hai chiều.",
                "Cân bằng hóa học là trạng thái động: vt = vn.",
                "Nồng độ các chất không đổi khi đạt cân bằng, nhưng phản ứng vẫn tiếp diễn."
              ],
              "imagePrompt": "Chemistry diagram showing reversible reaction equilibrium with two arrows going in opposite directions, molecular level, clean educational illustration, white background, labeled N2 H2 NH3",
              "imageAlt": "Sơ đồ phản ứng thuận nghịch ở trạng thái cân bằng"
            },
            {
              "id": "b1-s2",
              "sectionTitle": "II. Hằng số cân bằng Kc",
              "content": "Với phản ứng thuận nghịch tổng quát:\naA + bB ⇌ cC + dD\n\nBiểu thức hằng số cân bằng Kc được viết như sau:\n\nKc = [C]ᶜ × [D]ᵈ / ([A]ᵃ × [B]ᵇ)\n\nTrong đó [X] là nồng độ mol của chất X tại trạng thái cân bằng (đơn vị: mol/L).\n\nLưu ý quan trọng:\n• Chất rắn (solid) và dung môi nước (H₂O trong dung dịch loãng) KHÔNG xuất hiện trong biểu thức Kc.\n• Giá trị Kc CHỈ phụ thuộc vào nhiệt độ, không phụ thuộc vào nồng độ ban đầu hay áp suất.\n• Kc >> 1: Phản ứng thiên về chiều tạo sản phẩm.\n• Kc << 1: Phản ứng thiên về chiều chất đầu (phản ứng hầu như không xảy ra).",
              "keyPoints": [
                "Kc chỉ phụ thuộc vào nhiệt độ.",
                "Không đưa chất rắn vào biểu thức Kc.",
                "Kc > 1: ưu tiên tạo sản phẩm; Kc < 1: ưu tiên chất đầu."
              ],
              "formulae": [
                "Kc = [C]ᶜ·[D]ᵈ / ([A]ᵃ·[B]ᵇ) — cho phản ứng aA + bB ⇌ cC + dD",
                "Ví dụ: N₂ + 3H₂ ⇌ 2NH₃ → Kc = [NH₃]² / ([N₂][H₂]³)"
              ],
              "examples": [
                {
                  "title": "Ví dụ 1 (SGK tr.10)",
                  "problem": "Viết biểu thức Kc cho phản ứng: H₂(g) + I₂(g) ⇌ 2HI(g)",
                  "solution": "Kc = [HI]² / ([H₂][I₂])\n\nTất cả đều là chất khí nên đưa tất cả vào biểu thức. Số mũ bằng hệ số của phương trình."
                },
                {
                  "title": "Ví dụ 2 (SGK tr.10)",
                  "problem": "Viết biểu thức Kc cho: CaCO₃(r) ⇌ CaO(r) + CO₂(g)",
                  "solution": "Kc = [CO₂]\n\nCaCO₃ và CaO là chất rắn nên KHÔNG đưa vào biểu thức Kc. Chỉ còn lại CO₂ là chất khí."
                }
              ]
            },
            {
              "id": "b1-s3",
              "sectionTitle": "III. Sự chuyển dịch cân bằng hóa học",
              "content": "Sự chuyển dịch cân bằng là sự di chuyển của cân bằng từ trạng thái cân bằng này sang trạng thái cân bằng mới khi điều kiện bên ngoài thay đổi.\n\nNguyên lí Le Chatelier (1888):\n\"Nếu một hệ đang ở trạng thái cân bằng mà chịu một tác động từ bên ngoài (thay đổi nồng độ, nhiệt độ, áp suất...), thì cân bằng sẽ chuyển dịch theo chiều làm GIẢM tác động đó.\"\n\nÁp dụng cụ thể:\n① Thay đổi nồng độ: Tăng nồng độ chất phản ứng → cân bằng chuyển dịch về phía tạo sản phẩm (chiều thuận).\n② Thay đổi áp suất: Tăng áp suất → cân bằng chuyển dịch về phía có ít mol khí hơn.\n③ Thay đổi nhiệt độ: Tăng nhiệt độ → cân bằng chuyển dịch theo chiều thu nhiệt.\n④ Chất xúc tác: Không làm dịch chuyển cân bằng, chỉ giúp hệ đạt cân bằng nhanh hơn.",
              "keyPoints": [
                "Le Chatelier: Hệ cân bằng chống lại sự thay đổi từ bên ngoài.",
                "Tăng nồng độ chất đầu → cân bằng dịch phải (chiều thuận).",
                "Tăng áp suất → dịch về phía ít mol khí hơn.",
                "Tăng nhiệt độ → dịch theo chiều thu nhiệt.",
                "Chất xúc tác KHÔNG ảnh hưởng đến vị trí cân bằng."
              ],
              "imagePrompt": "Le Chatelier principle diagram showing equilibrium shift with arrows, temperature pressure concentration effects, clean chemistry educational poster, colorful labels, white background",
              "imageAlt": "Sơ đồ nguyên lí Le Chatelier về chuyển dịch cân bằng",
              "examples": [
                {
                  "title": "Ứng dụng trong công nghiệp Haber-Bosch",
                  "problem": "N₂(g) + 3H₂(g) ⇌ 2NH₃(g)  ΔH = −92 kJ/mol\nTrong sản xuất NH₃, người ta dùng áp suất cao (~200 atm) và nhiệt độ ~450°C. Giải thích tại sao?",
                  "solution": "• Áp suất cao: Phản ứng thuận có 4 mol khí → 2 mol khí. Tăng áp suất → cân bằng dịch về chiều thuận, tăng hiệu suất NH₃.\n• Nhiệt độ 450°C: Phản ứng thuận tỏa nhiệt → lẽ ra nên dùng nhiệt độ thấp để tăng hiệu suất. Nhưng ở nhiệt độ thấp, tốc độ phản ứng quá chậm. 450°C là sự thỏa hiệp: đủ nhanh và hiệu suất chấp nhận được (~15%)."
                }
              ]
            }
          ],
          "practiceQuestions": [
            {
              "id": "b1-q1",
              "question": "Cho phản ứng: 2SO₂(g) + O₂(g) ⇌ 2SO₃(g)  ΔH < 0. Viết biểu thức Kc và cho biết cân bằng dịch chuyển theo hướng nào khi: (a) tăng nồng độ SO₂, (b) tăng nhiệt độ, (c) tăng áp suất?",
              "hint": "Kc = [SO₃]² / ([SO₂]²·[O₂]). Áp dụng Le Chatelier cho từng trường hợp.",
              "answer": "Kc = [SO₃]² / ([SO₂]²·[O₂])\n(a) Tăng [SO₂] → cân bằng dịch phải (tạo thêm SO₃).\n(b) Tăng T, phản ứng thuận tỏa nhiệt → cân bằng dịch trái.\n(c) Tăng P, vế trái 3 mol khí > vế phải 2 mol khí → cân bằng dịch phải."
            },
            {
              "id": "b1-q2",
              "question": "Tại nhiệt độ xác định, phản ứng CO(g) + H₂O(g) ⇌ CO₂(g) + H₂(g) có Kc = 1. Hỗn hợp ban đầu có [CO] = [H₂O] = 1 M, [CO₂] = [H₂] = 0 M. Tính nồng độ các chất lúc cân bằng.",
              "hint": "Đặt x là số mol chất phản ứng. Lập bảng ICE (Initial, Change, Equilibrium). Giải phương trình Kc = x² / (1−x)² = 1.",
              "answer": "Đặt x = nồng độ CO và H₂O phản ứng.\nKc = [CO₂][H₂] / ([CO][H₂O]) = x·x / (1−x)·(1−x) = x²/(1−x)² = 1\n→ x/(1−x) = 1 → x = 0.5 M\nCân bằng: [CO]=[H₂O]=0.5 M; [CO₂]=[H₂]=0.5 M."
            },
            {
              "id": "b1-q3",
              "question": "Chất xúc tác có làm thay đổi hằng số cân bằng Kc không? Giải thích.",
              "answer": "Không. Chất xúc tác làm tăng tốc độ cả phản ứng thuận và nghịch như nhau, giúp hệ đạt trạng thái cân bằng nhanh hơn. Tuy nhiên, nó không làm thay đổi bản chất nhiệt động học của phản ứng, nên Kc không thay đổi."
            }
          ]
        }
      },
      {
        "id": "bai-2",
        "title": "Bài 2: Cân bằng trong dung dịch nước và thuyết acid – base",
        "summary": "Sự điện li là quá trình phân li các chất trong nước ra ion. Chất điện li mạnh gồm acid mạnh, base mạnh và hầu hết các muối tan. Chất điện li yếu gồm acid yếu và base yếu. Thuyết Brønsted-Lowry định nghĩa: Acid là chất cho proton (H+), Base là chất nhận proton (H+). Khái niệm pH = -log[H+] xác định môi trường của dung dịch: pH < 7 (môi trường acid), pH = 7 (môi trường trung tính), pH > 7 (môi trường base).",
        "formulae": [
          "pH = -log[H+] => [H+] = 10^(-pH)",
          "Tích số ion của nước ở 25°C: [H+] * [OH-] = 10^(-14)",
          "pH + pOH = 14",
          "Độ điện li α = n / N (n là số phân tử phân li thành ion, N là tổng số phân tử hoà tan)",
          "CH3COOH ⇌ CH3COO− + H+",
          "III. Khái niệm pH và ý nghĩa của pH trong thực tiễn",
          "1. Khái niệm pH",
          "pH = -log[H+] hoặc [H+] = 10-pH",
          "2. Ý nghĩa của pH trong thực tiễn",
          "3. Xác định pH"
        ],
        "commonQuestions": [
          {
            "question": "Tính pH của dung dịch chứa Ba(OH)2 0,005M ở 25 độ C.",
            "hint": "Hãy thực hiện các bước sau:\n1. Ba(OH)2 là chất điện li mạnh hay yếu? Nó phân li ra bao nhiêu ion OH-?\n2. Từ nồng độ Ba(OH)2 là 0,005M, hãy tính nồng độ ion OH-.\n3. Tính pOH = -log[OH-], rồi từ đó tính pH = 14 - pOH.",
            "sampleAnswer": "Ba(OH)2 là base mạnh, điện li hoàn toàn trong nước:\nBa(OH)2 → Ba2+ + 2OH-\nNồng độ OH- phóng thích: [OH-] = 2 * C_Ba(OH)2 = 2 * 0,005 = 0,01 M = 10^-2 M.\nTa có: pOH = -log[OH-] = -log(10^-2) = 2.\nSuy ra pH ở 25°C là: pH = 14 - pOH = 14 - 2 = 12.\nKết luận: pH của dung dịch Ba(OH)2 0,005M là 12."
          },
          {
            "question": "Trong phản ứng: NH3 + H2O ⇌ NH4+ + OH-, hãy xác định chất đóng vai trò là acid, chất nào đóng vai trò là base theo thuyết Brønsted-Lowry.",
            "hint": "Theo thuyết Brønsted-Lowry, acid là chất cho H+ và base là chất nhận H+. Hãy quan sát sự thay đổi giữa các cặp chất trước và sau phản ứng:\n- NH3 đã biến đổi thành NH4+ bằng cách nhận hay cho H+?\n- H2O đã biến đổi thành OH- bằng cách nhận hay cho H+?",
            "sampleAnswer": "Xét phản ứng thuận:\n- NH3 đã nhận 1 proton H+ từ H2O để tạo thành NH4+. Do đó, NH3 đóng vai trò là Base.\n- H2O đã nhường 1 proton H+ cho NH3 để tạo thành OH-. Do đó, H2O đóng vai trò là Acid.\nXét phản ứng nghịch:\n- NH4+ nhường H+ cho OH- nên NH4+ là Acid.\n- OH- nhận H+ từ NH4+ nên OH- là Base."
          }
        ],
        "textbook": {
          "pageRange": "Trang 20 – 34",
          "objectives": [
            "Trình bày được khái niệm sự điện li, chất điện li, chất không điện li.",
            "Phân biệt được chất điện li mạnh và chất điện li yếu, viết được phương trình điện li.",
            "Trình bày được thuyết Brønsted–Lowry về acid–base.",
            "Tính được pH của dung dịch acid mạnh, base mạnh loãng."
          ],
          "sections": [
            {
              "id": "b2-s1",
              "sectionTitle": "I. Sự điện li",
              "content": "Sự điện li là quá trình phân li của các chất trong nước tạo thành ion.\n\nChất điện li là chất khi tan trong nước phân li thành ion (dẫn điện).\nChất không điện li là chất khi tan trong nước không phân li thành ion (không dẫn điện).\n\nPhân loại chất điện li:\n• Chất điện li mạnh: phân li hoàn toàn (→ một chiều).\n  - Acid mạnh: HCl, H₂SO₄, HNO₃, HClO₄...\n  - Base mạnh: NaOH, KOH, Ba(OH)₂, Ca(OH)₂...\n  - Hầu hết muối tan (NaCl, K₂SO₄, Na₂CO₃...)\n  \n• Chất điện li yếu: chỉ phân li một phần (⇌ hai chiều, có hằng số điện li Ka, Kb).\n  - Acid yếu: CH₃COOH, HF, H₂CO₃, H₂S...\n  - Base yếu: NH₃, Mg(OH)₂...",
              "keyPoints": [
                "Chất điện li mạnh phân li hoàn toàn (→ một chiều).",
                "Chất điện li yếu phân li một phần (⇌ hai chiều).",
                "Acid mạnh: HCl, HNO₃, H₂SO₄. Base mạnh: NaOH, KOH, Ba(OH)₂."
              ],
              "imagePrompt": "Chemistry diagram showing strong electrolyte vs weak electrolyte dissociation in water, ions depicted as colored spheres, educational illustration, clean white background, labeled NaCl and CH3COOH",
              "imageAlt": "So sánh điện li mạnh và điện li yếu trong nước"
            },
            {
              "id": "b2-s2",
              "sectionTitle": "II. Thuyết Brønsted–Lowry về Acid–Base",
              "content": "Thuyết Brønsted–Lowry (1923) mở rộng khái niệm acid–base so với thuyết Arrhenius:\n\n• Acid: là chất NHƯỜNG proton H⁺ (chất cho proton).\n• Base: là chất NHẬN proton H⁺ (chất nhận proton).\n\nCặp acid–base liên hợp: Mỗi acid khi nhường H⁺ sẽ tạo thành base liên hợp của nó, và ngược lại.\n\nVí dụ:\nHCl + H₂O → Cl⁻ + H₃O⁺\n• HCl là acid (nhường H⁺ cho H₂O).\n• H₂O là base (nhận H⁺ từ HCl).\n• Cl⁻ là base liên hợp của HCl.\n• H₃O⁺ là acid liên hợp của H₂O.\n\nLưu ý: Nước (H₂O) có thể đóng vai trò cả acid lẫn base → Amphiprotic (lưỡng tính proton).",
              "keyPoints": [
                "Acid Brønsted: chất nhường H⁺.",
                "Base Brønsted: chất nhận H⁺.",
                "Mỗi acid có một base liên hợp và ngược lại.",
                "H₂O là chất lưỡng tính (vừa là acid vừa là base)."
              ],
              "examples": [
                {
                  "title": "Ví dụ: Xác định acid/base theo Brønsted",
                  "problem": "Trong phản ứng: NH₃ + H₂O ⇌ NH₄⁺ + OH⁻\nXác định acid, base và cặp liên hợp.",
                  "solution": "• NH₃ nhận H⁺ từ H₂O → NH₃ là BASE. NH₄⁺ là acid liên hợp của NH₃.\n• H₂O nhường H⁺ cho NH₃ → H₂O là ACID. OH⁻ là base liên hợp của H₂O.\nCặp liên hợp: (H₂O / OH⁻) và (NH₄⁺ / NH₃)."
                }
              ]
            },
            {
              "id": "b2-s3",
              "sectionTitle": "III. Khái niệm pH và môi trường dung dịch",
              "content": "pH là đại lượng đặc trưng cho môi trường acid–base của dung dịch nước.\n\nTích số ion của nước (ở 25°C):\nKw = [H⁺][OH⁻] = 10⁻¹⁴\n\nĐịnh nghĩa pH:\npH = −log[H⁺]  ↔  [H⁺] = 10⁻ᵖᴴ\n\nPhân loại môi trường (ở 25°C):\n• pH < 7: Môi trường acid ([H⁺] > [OH⁻])\n• pH = 7: Môi trường trung tính ([H⁺] = [OH⁻] = 10⁻⁷ M)\n• pH > 7: Môi trường base ([H⁺] < [OH⁻])\n\nMối quan hệ: pH + pOH = 14 (ở 25°C)",
              "keyPoints": [
                "pH = −log[H⁺]; pOH = −log[OH⁻].",
                "pH + pOH = 14 (ở 25°C).",
                "pH < 7: acid | pH = 7: trung tính | pH > 7: base."
              ],
              "formulae": [
                "pH = −log[H⁺]",
                "pOH = −log[OH⁻]",
                "pH + pOH = 14 (25°C)",
                "Kw = [H⁺][OH⁻] = 10⁻¹⁴"
              ],
              "examples": [
                {
                  "title": "Tính pH dung dịch HCl",
                  "problem": "Tính pH của dung dịch HCl 0,01 M ở 25°C.",
                  "solution": "HCl là acid mạnh, điện li hoàn toàn:\nHCl → H⁺ + Cl⁻\n[H⁺] = C_HCl = 0,01 M = 10⁻² M\npH = −log(10⁻²) = 2"
                },
                {
                  "title": "Tính pH dung dịch NaOH",
                  "problem": "Tính pH của dung dịch NaOH 0,001 M ở 25°C.",
                  "solution": "NaOH là base mạnh:\nNaOH → Na⁺ + OH⁻\n[OH⁻] = 0,001 M = 10⁻³ M\npOH = 3\npH = 14 − 3 = 11"
                }
              ]
            }
          ],
          "practiceQuestions": [
            {
              "id": "b2-q1",
              "question": "Viết phương trình điện li của: (a) H₂SO₄, (b) CH₃COOH, (c) Ba(OH)₂, (d) NH₃.",
              "answer": "(a) H₂SO₄ → 2H⁺ + SO₄²⁻ (điện li hoàn toàn)\n(b) CH₃COOH ⇌ CH₃COO⁻ + H⁺ (điện li một phần)\n(c) Ba(OH)₂ → Ba²⁺ + 2OH⁻ (điện li hoàn toàn)\n(d) NH₃ + H₂O ⇌ NH₄⁺ + OH⁻ (điện li một phần)"
            },
            {
              "id": "b2-q2",
              "question": "Tính pH của dung dịch Ba(OH)₂ 0,005 M ở 25°C.",
              "hint": "Ba(OH)₂ → Ba²⁺ + 2OH⁻. Mỗi mol Ba(OH)₂ cho 2 mol OH⁻.",
              "answer": "[OH⁻] = 2 × 0,005 = 0,01 M = 10⁻²\npOH = 2\npH = 14 − 2 = 12"
            }
          ]
        }
      },
      {
        "id": "bai-3",
        "title": "Bài 3: Ôn tập cân bằng hoá học và cân bằng trong dung dịch nước",
        "summary": "- Phân biệt phản ứng một chiều và phản ứng thuận nghịch:\nPhản ứng một chiều\nPhản ứng thuận nghịch\naA + bB → cC + dD\nPhản ứng chỉ xảy ra theo một chiều từ chất đầu tạo thành sản phẩm. aA + bB ⇌ cC + dD\nTrong cùng điều kiện, phản ứng xảy ra theo hai chiều trái ngược nhau.",
        "formulae": [
          "aA + bB → cC + dD",
          "aA + bB ⇌ cC + dD",
          "KC=(C)c(D)d(A)a(B)b",
          "pH = -log[H+] hoặc [H+] = 10-pH"
        ],
        "commonQuestions": [
          {
            "question": "Cho cân bằng N₂O₄(g) ⇌ 2NO₂(g), Δ_rH > 0. Biết N₂O₄ không màu còn NO₂ có màu nâu đỏ.",
            "hint": "Chiều nghịch toả nhiệt và giảm số mol khí nên hạ nhiệt độ hoặc tăng áp suất đều đẩy cân bằng về phía N₂O₄. Xúc tác không đổi vị trí cân bằng, và nồng độ hai chất lúc cân bằng phụ thuộc K_C chứ không bằng nhau.",
            "sampleAnswer": ""
          },
          {
            "question": "Phản ứng thuận nghịch là phản ứng",
            "hint": "Phản ứng thuận nghịch xảy ra theo cả chiều thuận và chiều nghịch trong cùng một điều kiện, vì vậy không bao giờ xảy ra hoàn toàn.",
            "sampleAnswer": "xảy ra đồng thời theo hai chiều ngược nhau trong cùng điều kiện"
          },
          {
            "question": "Khi một phản ứng thuận nghịch đạt trạng thái cân bằng thì",
            "hint": "Cân bằng hóa học là cân bằng động: hai phản ứng vẫn tiếp diễn với tốc độ bằng nhau nên nồng độ các chất không đổi theo thời gian.",
            "sampleAnswer": "tốc độ phản ứng thuận bằng tốc độ phản ứng nghịch"
          }
        ],
        "textbook": {
          "pageRange": "",
          "objectives": [],
          "sections": [
            {
              "id": "b3-m1",
              "sectionTitle": "Mở đầu",
              "content": "- Phân biệt phản ứng một chiều và phản ứng thuận nghịch:\nPhản ứng một chiều\nPhản ứng thuận nghịch\naA + bB → cC + dD\nPhản ứng chỉ xảy ra theo một chiều từ chất đầu tạo thành sản phẩm.\naA + bB ⇌ cC + dD\nTrong cùng điều kiện, phản ứng xảy ra theo hai chiều trái ngược nhau.\n- Cân bằng hoá học:\nTrạng thái cân bằng\nvthuận = vnghịch; nồng độ các chất trong hệ phản ứng không đổi.\nHằng số cân bằng\nKC=(C)c(D)d(A)a(B)b\nTrong đó: [A]; [B]; [C]; [D] là nồng độ mol của các chất ở trạng thái cân bằng.\nChất rắn không đưa vào biểu thức tính KC.\nKC chỉ phụ thuộc vào bản chất phản ứng và nhiệt độ.\nCác yếu tố ảnh hưởng đến cân bằng hoá học\nNhiệt độ, nồng độ, áp suất\nNguyên lí chuyển dịch cân bằng Le Chatelier\nMột phản ứng thuận nghịch đang ở trạng thái cân bằng, khi chịu một tác động từ bên ngoài như biến đổi nhiệt độ, nồng độ, áp suất thì cân bằng sẽ chuyển dịch theo chiều làm giảm tác động bên ngoài đó.\nSự điện li\n- Quá trình phân li các chất trong nước tạo thành ion.\n- Chất điện li mạnh: acid mạnh, base mạnh, hầu hết các muối.\n- Chất điện li yếu: acid yếu, base yếu.\n- Chất không điện li: nước, saccharose, ethanol,…\nThuyết acid – base của Bronsted – Lowry\n- Acid là chất cho proton.\n- Base là chất nhận proton.\npH = -log[H+] hoặc [H+] = 10-pH\nTrong dung dịch nước, một số ion như Al3+, Fe3+ và CO2−3 phản ứng với nước tạo ra các dung dịch có môi trường acid/base.",
              "keyPoints": [
                "1. Cân bằng  hoá học",
                "2. Cân bằng trong dung dịch nước"
              ]
            }
          ],
          "practiceQuestions": [
            {
              "id": "b3-lt1",
              "question": "Phản ứng thuận nghịch là phản ứng",
              "hint": "Phản ứng thuận nghịch xảy ra theo cả chiều thuận và chiều nghịch trong cùng một điều kiện, vì vậy không bao giờ xảy ra hoàn toàn."
            },
            {
              "id": "b3-lt2",
              "question": "Khi một phản ứng thuận nghịch đạt trạng thái cân bằng thì",
              "hint": "Cân bằng hóa học là cân bằng động: hai phản ứng vẫn tiếp diễn với tốc độ bằng nhau nên nồng độ các chất không đổi theo thời gian."
            },
            {
              "id": "b3-lt3",
              "question": "Biểu thức hằng số cân bằng K_C của phản ứng N₂(g) + 3H₂(g) ⇌ 2NH₃(g) là",
              "hint": "K_C = tích nồng độ sản phẩm chia tích nồng độ chất đầu, mỗi nồng độ mang số mũ bằng hệ số trong phương trình."
            },
            {
              "id": "b3-lt4",
              "question": "Theo thuyết Brønsted – Lowry, acid là chất",
              "hint": "Brønsted – Lowry: acid là chất cho proton, base là chất nhận proton. Nhờ đó NH₃ tuy không chứa OH vẫn là base."
            }
          ]
        }
      }
    ]
  },
  {
    "id": "chuong-2",
    "title": "Chương 2: Nitrogen – Sulfur",
    "lessons": [
      {
        "id": "bai-4",
        "title": "Bài 4: Nitrogen",
        "summary": "Nitrogen (N2) là chất khí không màu, không mùi, chiếm khoảng 78% thể tích không khí. Ở nhiệt độ thường, N2 khá trơ về mặt hóa học do có liên kết ba bền vững (N≡N). Ở nhiệt độ cao, N2 hoạt động hóa học hơn, thể hiện cả tính khử (tác dụng với O2) và tính oxi hóa (tác dụng với kim loại hoạt động, H2). Ammonia (NH3) là chất khí mùi khai, tan cực kì nhiều trong nước tạo dung dịch có tính base yếu. NH3 có tính khử mạnh do N trong NH3 có số oxi hóa cực tiểu là -3.",
        "formulae": [
          "Liên kết trong phân tử N2: N ≡ N (liên kết cộng hóa trị không cực)",
          "NH3 điện li yếu trong nước: NH3 + H2O ⇌ NH4+ + OH-",
          "Phản ứng oxi hóa NH3 bởi O2 có xúc tác Pt: 4NH3 + 5O2 -(t°, Pt)→ 4NO + 6H2O"
        ],
        "commonQuestions": [
          {
            "question": "Vì sao ở điều kiện thường, khí nitrogen (N2) trơ về mặt hóa học, nhưng lại hoạt động ở nhiệt độ cao?",
            "hint": "Hãy nhìn vào cấu tạo phân tử của khí N2. Giữa hai nguyên tử nitrogen có liên kết gì? Năng lượng liên kết này lớn hay nhỏ? Để bẻ gãy liên kết này ở nhiệt độ thường có dễ dàng không? Khi nâng cao nhiệt độ thì năng lượng cung cấp cho các phân tử thế nào?",
            "sampleAnswer": "Trong phân tử N2, hai nguyên tử nitrogen liên kết với nhau bằng một liên kết ba bền vững (N≡N) với năng lượng liên kết cực kỳ lớn (945 kJ/mol).\nỞ điều kiện thường, năng lượng của các va chạm phân tử không đủ để phá vỡ liên kết này, nên N2 khá trơ về mặt hóa học.\nTuy nhiên ở nhiệt độ cao (hoặc có tia lửa điện), động năng các phân tử tăng mạnh, cung cấp đủ năng lượng để bẻ gãy liên kết ba này, giúp nitrogen dễ dàng phản ứng với các chất khác như O2, H2 hay kim loại hoạt động."
          }
        ],
        "textbook": {
          "pageRange": "Trang 38 – 52",
          "objectives": [
            "Mô tả được cấu tạo phân tử và tính chất vật lí của nitrogen.",
            "Giải thích được tính trơ hóa học của N₂ ở nhiệt độ thường.",
            "Trình bày được tính chất hóa học của ammonia (NH₃): tính base và tính khử.",
            "Viết được phương trình hóa học minh họa các tính chất của N₂ và NH₃."
          ],
          "sections": [
            {
              "id": "b3-s1",
              "sectionTitle": "I. Đơn chất Nitrogen (N₂)",
              "content": "Cấu tạo phân tử:\nPhân tử N₂ gồm 2 nguyên tử nitrogen liên kết nhau bằng liên kết ba (N≡N) cực bền:\nNăng lượng liên kết N≡N = 945 kJ/mol (rất lớn)\n\nTính chất vật lí:\n• Chất khí không màu, không mùi, không vị.\n• Chiếm ~78% thể tích không khí.\n• Hóa lỏng ở −196°C, hóa rắn ở −210°C.\n• Tan rất ít trong nước.\n\nTính chất hóa học:\nỞ điều kiện thường: N₂ rất trơ do liên kết ba bền vững.\nỞ nhiệt độ cao / có tia lửa điện: N₂ hoạt động hơn.\n\n① Tác dụng với O₂ (tính khử):\nN₂ + O₂ ⇌ 2NO  (t° > 3000°C hoặc tia lửa điện)\n\n② Tác dụng với H₂ (tính oxi hóa):\nN₂ + 3H₂ ⇌ 2NH₃  (450°C, 200 atm, xúc tác Fe)\n\n③ Tác dụng với kim loại hoạt động (tính oxi hóa):\n3Mg + N₂ → Mg₃N₂  (nhiệt độ cao)",
              "keyPoints": [
                "N₂ có liên kết ba N≡N rất bền (945 kJ/mol) → trơ ở điều kiện thường.",
                "N₂ thể hiện tính khử khi tác dụng với O₂.",
                "N₂ thể hiện tính oxi hóa khi tác dụng với H₂ và kim loại hoạt động."
              ],
              "imagePrompt": "Nitrogen N2 molecule triple bond structure diagram, molecular orbital representation, clean chemistry educational illustration, white background, labeled atoms",
              "imageAlt": "Cấu trúc phân tử N₂ với liên kết ba"
            },
            {
              "id": "b3-s2",
              "sectionTitle": "II. Ammonia (NH₃)",
              "content": "Cấu tạo phân tử:\n• Phân tử có dạng chóp tam giác.\n• N có 1 cặp electron tự do → là tâm cho proton.\n• Phân tử có cực, tan vô hạn trong nước.\n\nTính chất vật lí:\n• Chất khí mùi khai, nhẹ hơn không khí.\n• Tan rất nhiều trong nước (ở 20°C: 1 L nước hòa tan ~700 L NH₃).\n\nTính chất hóa học:\n① Tính base yếu (do cặp electron tự do của N):\nNH₃ + H₂O ⇌ NH₄⁺ + OH⁻\nNH₃ + HCl → NH₄Cl (khói trắng)\n\n② Tính khử mạnh (N có số oxi hóa −3, thấp nhất):\n4NH₃ + 3O₂ → 2N₂ + 6H₂O  (đốt trong O₂)\n4NH₃ + 5O₂ →(Pt, t°) 4NO + 6H₂O  (oxi hóa có xúc tác)",
              "keyPoints": [
                "NH₃ tan rất nhiều trong nước → dung dịch có tính base yếu.",
                "NH₃ + HCl → NH₄Cl tạo khói trắng → nhận biết NH₃.",
                "NH₃ có tính khử mạnh (N: −3)."
              ],
              "examples": [
                {
                  "title": "Nhận biết khí NH₃",
                  "problem": "Làm thế nào để nhận biết khí NH₃ trong phòng thí nghiệm?",
                  "solution": "① Dùng quỳ tím ẩm: NH₃ làm quỳ tím ẩm chuyển xanh (do tạo môi trường base).\n② Dùng HCl đặc: Đưa đũa thủy tinh tẩm HCl đặc vào miệng bình, nếu có khói trắng (NH₄Cl) tạo thành thì là NH₃."
                }
              ],
              "imagePrompt": "Ammonia NH3 molecule 3D structure pyramidal shape with lone pair electrons, chemistry educational poster, clean white background, labeled nitrogen hydrogen atoms",
              "imageAlt": "Cấu trúc phân tử NH₃ dạng chóp tam giác"
            }
          ],
          "practiceQuestions": [
            {
              "id": "b3-q1",
              "question": "Viết phương trình hóa học khi cho NH₃ tác dụng với: (a) HNO₃, (b) H₂SO₄ loãng, (c) CuO (đun nóng).",
              "answer": "(a) NH₃ + HNO₃ → NH₄NO₃\n(b) 2NH₃ + H₂SO₄ → (NH₄)₂SO₄\n(c) 2NH₃ + 3CuO → N₂ + 3Cu + 3H₂O (NH₃ khử CuO)"
            },
            {
              "id": "b3-q2",
              "question": "Tại sao N₂ được dùng để bảo quản thực phẩm và trong các bóng đèn?",
              "answer": "N₂ rất trơ hóa học ở điều kiện thường do liên kết ba N≡N bền vững. Do đó:\n• Trong bảo quản thực phẩm: N₂ ngăn O₂ tiếp xúc với thực phẩm, hạn chế oxi hóa và vi khuẩn hiếu khí.\n• Trong bóng đèn: N₂ không phản ứng với dây tóc nóng sáng, kéo dài tuổi thọ bóng đèn."
            }
          ]
        }
      },
      {
        "id": "bai-5",
        "title": "Bài 5: Ammonia và muối ammonium",
        "summary": "- Phân tử ammonia được tạo bởi một nguyên tử nitrogen liên kết với ba nguyên tử hydrogen và có dạng hình học là chóp tam giác. - Đặc điểm cấu tạo của phân tử ammonia:\n+ Nguyên tử nitrogen còn một cặp electron không liên kết, tạo ra vùng có mật độ điện tích âm trên nguyên tử nitrogen.",
        "formulae": [
          "NH4Cl→ NH4 +"
        ],
        "commonQuestions": [
          {
            "question": "Hòa tan hoàn toàn 11,2 gam Fe bằng dung dịch H₂SO₄ đặc, nóng, dư. Thể tích khí SO₂ (đkc, 24,79 L/mol) thu được là",
            "hint": "Fe nhường 3 electron lên Fe³⁺: n(Fe) = 0,2 mol cho 0,6 mol electron. S⁺⁶ nhận 2 electron thành SO₂ nên n(SO₂) = 0,3 mol → V = 0,3 × 24,79 = 7,437 L.",
            "sampleAnswer": "7,437 L"
          },
          {
            "question": "Dẫn 3,7185 lít SO₂ (đkc) vào 200 mL dung dịch NaOH 1 M. Khối lượng muối thu được là",
            "hint": "n(SO₂) = 0,15; n(NaOH) = 0,2 nên tỉ lệ 1,33 tạo hai muối. Giải hệ được 0,05 mol Na₂SO₃ và 0,10 mol NaHSO₃ → m = 0,05×126 + 0,10×104 = 16,7 gam.",
            "sampleAnswer": "16,7 gam"
          },
          {
            "question": "Nhận định về sulfuric acid đặc.",
            "hint": "Al và Fe bị thụ động hóa trong H₂SO₄ đặc nguội. Khi Cu phản ứng, S giảm số oxi hóa từ +6 xuống +4 tạo SO₂, tức bị khử chứ không bị oxi hóa.",
            "sampleAnswer": ""
          }
        ],
        "textbook": {
          "pageRange": "",
          "objectives": [],
          "sections": [
            {
              "id": "b5-m1",
              "sectionTitle": "Mở đầu",
              "content": "BÀI 5: MUỐI AMMONIUM I. Ammonia (NH3)\n- Phân tử ammonia được tạo bởi một nguyên tử nitrogen liên kết với ba nguyên tử hydrogen và có dạng hình học là chóp tam giác.\n- Đặc điểm cấu tạo của phân tử ammonia:\n+ Nguyên tử nitrogen còn một cặp electron không liên kết, tạo ra vùng có mật độ điện tích âm trên nguyên tử nitrogen.\n+ Liên kết N–H phân cực, cặp electron dùng chung lệch về nguyên tử nitrogen làm cho nguyên tử hydrogen mang một phần điện tích dương.\n+ Liên kết N–H tương đối bền với năng lượng liên kết là 386 kJ/mol.\n- Ammonia tồn tại ở cả trong môi trường đất, nước, không khí. Trong cơ thể người, ammonia được tạo ra trong quá trình chuyển hoá thức ăn chứa protein.\n- Ở điều kiện thường, ammonia tồn tại ở thể khí, không màu, nhẹ hơn không khí, mùi khai và xốc. Ammonia tan nhiều trong nước. Ở điều kiện thường, 1 lít nước hoà tan được khoảng 700 lít khí ammonia. Ammonia dễ hoá lỏng (hoá lỏng ở –33,3 °C) và dễ hoá rắn (hoá rắn ở –77,7 °C).\na) Tính base\n- Trong dung dịch, một phần số phân tử ammonia nhận proton của nước, tạo thành ion ammonium ().\n- Dung dịch ammonia có môi trường base yếu, làm quỳ tím chuyển sang màu xanh, phenolphthalein chuyển sang màu hồng.\n- Ở thể khí, ammonia cũng có khả năng nhận proton, thể hiện tính chất của một base Bronsted – Lowry.\nVí dụ: NH3(g) + HCl(g) → NH4Cl(s).\nb. Tính khử\n- Trong phân tử ammonia, nguyên tử nitrogen có số oxi hoá –3 (số oxi hoá thấp nhất của nitrogen) nên ammonia thể hiện tính khử.\n- Khi đốt cháy trong oxygen, ammonia cháy với ngọn lửa màu vàng.\n4NH3 + 3O2  2N2 + 6H2O\n- Trong công nghiệp, phản ứng giữa ammonia và oxygen được thực hiện ở nhiệt độ 800 °C – 900 °C với xúc tác Pt.\n4NH3 + 5O2  4NO + 6H2O\nPhản ứng trên là giai đoạn trung gian quan trọng trong quá trình sản xuất nitric acid theo phương pháp Ostwald.\nMột số ứng dụng của ammonia được thể hiện trong sơ đồ sau:\nTrong công nghiệp, quá trình sản xuất ammonia thường được thực hiện ở nhiệt độ 400 oC – 450 oC, áp suất 150 – 200 bar, xúc tác Fe.",
              "keyPoints": [
                "1. Cấu tạo phân tử",
                "2. Tính chất vật lí",
                "3. Tính chất  hoá học",
                "4. Ứng dụng",
                "5. Sản xuất"
              ]
            },
            {
              "id": "b5-m2",
              "sectionTitle": "II. Muối ammonium",
              "content": "Một số muối ammonium phổ biến: NH4Cl, NH4ClO4, NH4NO3, (NH4)2SO4, NH4H2PO4, (NH4)2HPO4, NH4HCO3, (NH4)2Cr2O7.\nHầu hết các muối ammonia đều tan trong nước và phân li hoàn toàn ra ion.\nVí dụ:\nNH4Cl→ NH4 +\nChú ý: Dạng hình học của ion ammonium:\nĐào tạo từ xa\nKhi đun nóng hỗn hợp muối ammonium với dung dịch kiềm, sinh ra khí ammonia có mùi khai.\nVí dụ:\n(NH4)2SO4 + 2NaOH  Na2SO4 + 2NH3 + 2H2O\nPhương trình ion rút gọn: NH4+OH−  NH3+H2O\nCác muối ammonium đều kém bền nhiệt và dễ bị phân huỷ khi đun nóng.\nVí dụ:\nNH4Cl  NH3 + HCl\nNH4HCO3  NH3 + CO2 + H2O\nNH4NO3  N2O + 2H2O\nMột số ứng dụng của muối ammonium được thể hiện ở sơ đồ sau:",
              "keyPoints": [
                "1. Tính tan, sự điện li",
                "2. Tác dụng với kiềm – Nhận biết ion ammonium",
                "3. Tính chất",
                "4. Ứng dụng"
              ]
            }
          ],
          "practiceQuestions": [
            {
              "id": "b5-lt1",
              "question": "Liên kết trong phân tử N₂ là",
              "hint": "N≡N có năng lượng liên kết rất lớn (khoảng 945 kJ/mol) nên N₂ khá trơ ở nhiệt độ thường."
            },
            {
              "id": "b5-lt2",
              "question": "Nitrogen chiếm khoảng bao nhiêu phần trăm thể tích không khí?",
              "hint": "Không khí gồm khoảng 78% N₂, 21% O₂ về thể tích, phần còn lại là argon, CO₂ và hơi nước."
            },
            {
              "id": "b5-lt3",
              "question": "Để nhận biết muối ammonium, người ta cho muối tác dụng với dung dịch kiềm rồi đun nóng, hiện tượng là",
              "hint": "NH₄⁺ + OH⁻ → NH₃↑ + H₂O. Khí NH₃ mùi khai, làm giấy quỳ tím ẩm chuyển xanh."
            },
            {
              "id": "b5-lt4",
              "question": "Ở điều kiện thường, sulfur là",
              "hint": "Sulfur đơn chất là chất rắn màu vàng, không tan trong nước, tan trong một số dung môi hữu cơ."
            }
          ]
        }
      },
      {
        "id": "bai-6",
        "title": "Bài 6: Một số hợp chất của nitrogen với oxygen",
        "summary": "Nitric acid (HNO3) là chất lỏng không màu, bốc khói mạnh trong không khí ẩm, là một acid mạnh đồng thời là chất oxi hóa cực kỳ mạnh. HNO3 oxi hóa hầu hết kim loại (trừ Au, Pt) lên số oxi hóa cao nhất, giải phóng các sản phẩm khử của nitrogen (NO, NO2, N2O, N2, NH4NO3) thay vì khí H2. Muối nitrate dễ tan trong nước, là chất điện li mạnh, kém bền với nhiệt và có tính oxi hóa mạnh ở nhiệt độ cao.",
        "formulae": [
          "Kim loại M + HNO3 (loãng/đặc) → M(NO3)n + Sản phẩm khử (NO2/NO/N2O/N2/NH4NO3) + H2O",
          "Nhiệt phân muối nitrate: Muối của kim loại hoạt động mạnh (K -> Na) ra muối nitrite + O2; Muối của kim loại trung bình (Mg -> Cu) ra oxit kim loại + NO2 + O2; Muối của kim loại yếu (Ag, Hg...) ra kim loại + NO2 + O2",
          "N2 + O2 ⇌ 2NO",
          "2SO2 + O2 + 2H2O xt→2H2SO4",
          "4NO2 + O2 + 2H2O → 4HNO3",
          "NH3 + HNO3 → NH4NO3",
          "CaCO3 + 2HNO3 → Ca(NO3)2 + CO2 + H2O"
        ],
        "commonQuestions": [
          {
            "question": "Cho đồng (Cu) tác dụng với dung dịch HNO3 đặc, nóng thấy thoát ra khí màu nâu đỏ độc hại. Hãy viết phương trình hóa học và xác định khí màu nâu đỏ là khí gì? Biện pháp để giảm thiểu độc hại khi làm thí nghiệm này là gì?",
            "hint": "Khi kim loại Cu tác dụng với HNO3 đặc, sản phẩm khử chính của nitrogen (+5) là gì? Khí có màu nâu đỏ là khí nào? Để hấp thụ khí có tính acid độc hại này, ta nên sử dụng một dung dịch kiềm (như NaOH hay nước vôi trong Ca(OH)2) ở nút bông của ống nghiệm đúng không?",
            "sampleAnswer": "Phương trình phản ứng:\nCu + 4HNO3 (đặc) → Cu(NO3)2 + 2NO2↑ + 2H2O\n- Khí màu nâu đỏ thoát ra chính là nitrogen dioxide (NO2), là khí rất độc hại đối với hệ hô hấp.\n- Biện pháp khắc phục trong phòng thí nghiệm: Nút ống nghiệm bằng bông tẩm dung dịch kiềm (như dung dịch NaOH hoặc Ca(OH)2). Khí NO2 thoát ra sẽ phản ứng với dung dịch kiềm tạo thành muối không bay hơi, ngăn chặn khí thoát ra ngoài môi trường không khí:\n2NO2 + 2NaOH → NaNO3 + NaNO2 + H2O"
          }
        ],
        "textbook": {
          "pageRange": "Trang 53 – 66",
          "objectives": [
            "Mô tả được cấu tạo phân tử và tính chất vật lí của HNO₃.",
            "Giải thích được HNO₃ vừa là acid mạnh vừa là chất oxi hóa mạnh.",
            "Viết được PTHH của HNO₃ với kim loại, phi kim, hợp chất.",
            "Trình bày được tính chất và ứng dụng của muối nitrate."
          ],
          "sections": [
            {
              "id": "b4-s1",
              "sectionTitle": "I. Nitric Acid (HNO₃)",
              "content": "Cấu tạo phân tử:\nN có số oxi hóa +5 (cao nhất) → HNO₃ có tính oxi hóa rất mạnh.\n\nTính chất vật lí:\n• Chất lỏng không màu, bốc khói mạnh trong không khí ẩm.\n• Bị phân hủy một phần khi tiếp xúc ánh sáng → dung dịch dần có màu vàng (do NO₂).\n• Acid mạnh, tan vô hạn trong nước.\n\nTính chất hóa học:\n① Tính acid mạnh: Tác dụng với oxide base, base, muối (như acid mạnh thông thường).\n② Tính oxi hóa mạnh: Đặc điểm nổi bật nhất.\n   • HNO₃ đặc → sản phẩm khử chủ yếu là NO₂ (khí màu nâu đỏ).\n   • HNO₃ loãng → sản phẩm khử chủ yếu là NO (khí không màu).\n   • Không tác dụng với Au, Pt.\n   • Iron (Fe) và aluminium (Al) bị thụ động hóa trong HNO₃ đặc, nguội.",
              "keyPoints": [
                "HNO₃ vừa là acid mạnh vừa là chất oxi hóa mạnh (N: +5).",
                "HNO₃ đặc + kim loại → NO₂ (nâu đỏ).",
                "HNO₃ loãng + kim loại → NO (không màu).",
                "Fe, Al thụ động hóa trong HNO₃ đặc nguội."
              ],
              "formulae": [
                "Cu + 4HNO₃ (đặc) → Cu(NO₃)₂ + 2NO₂↑ + 2H₂O",
                "3Cu + 8HNO₃ (loãng) → 3Cu(NO₃)₂ + 2NO↑ + 4H₂O",
                "Fe + 4HNO₃ (loãng) → Fe(NO₃)₃ + NO↑ + 2H₂O"
              ],
              "imagePrompt": "HNO3 nitric acid reacting with copper metal, brown NO2 gas bubbling, chemistry lab flask, educational illustration, clear labels, colorful chemistry diagram",
              "imageAlt": "Phản ứng Cu + HNO₃ đặc tạo khí NO₂ màu nâu đỏ"
            },
            {
              "id": "b4-s2",
              "sectionTitle": "II. Muối Nitrate",
              "content": "Tính chất:\n• Tất cả muối nitrate đều tan trong nước.\n• Là chất điện li mạnh.\n• Kém bền với nhiệt: bị phân hủy khi đun nóng.\n• Có tính oxi hóa mạnh ở nhiệt độ cao.\n\nQuy tắc nhiệt phân muối nitrate:\n① Kim loại hoạt động mạnh (trước Mg: K, Na, Ca...):\n2KNO₃ → 2KNO₂ + O₂ (tạo muối nitrite)\n\n② Kim loại trung bình (Mg đến Cu):\n2Cu(NO₃)₂ → 2CuO + 4NO₂ + O₂ (tạo oxit kim loại)\n\n③ Kim loại yếu (sau Cu: Ag, Hg, Au):\n2AgNO₃ → 2Ag + 2NO₂ + O₂ (tạo kim loại)\n\nỨng dụng: Phân đạm (NH₄NO₃, Ca(NO₃)₂), thuốc nổ đen (KNO₃), chất oxi hóa trong pháo hoa.",
              "keyPoints": [
                "Tất cả muối nitrate tan trong nước.",
                "Nhiệt phân: hoạt động mạnh → nitrite; trung bình → oxit; yếu → kim loại.",
                "Nhận biết ion NO₃⁻: dùng Cu + H₂SO₄ loãng → khí NO không màu, hóa nâu ngoài không khí."
              ],
              "examples": [
                {
                  "title": "Nhiệt phân Fe(NO₃)₃",
                  "problem": "Viết phương trình nhiệt phân Fe(NO₃)₃.",
                  "solution": "Fe đứng sau Mg và trước Cu, thuộc nhóm kim loại trung bình:\n4Fe(NO₃)₃ → 2Fe₂O₃ + 12NO₂ + 3O₂"
                }
              ]
            }
          ],
          "practiceQuestions": [
            {
              "id": "b4-q1",
              "question": "Hòa tan 9,6 g Cu vào HNO₃ loãng (dư), thu được V lít NO (đkc). Tính V.",
              "hint": "nCu = 9,6/64 = 0,15 mol. Từ phương trình: 3Cu + 8HNO₃(loãng) → 3Cu(NO₃)₂ + 2NO + 4H₂O.",
              "answer": "nCu = 0,15 mol\n3Cu + 8HNO₃ → 3Cu(NO₃)₂ + 2NO + 4H₂O\nnNO = (2/3) × 0,15 = 0,1 mol\nV = 0,1 × 24,79 = 2,479 lít"
            }
          ]
        }
      },
      {
        "id": "bai-7",
        "title": "Bài 7: Sulfur và sulfur dioxide",
        "summary": "- Sulfur (lưu huỳnh) là nguyên tố phổ biến thứ 17 trên vỏ Trái Đất, chiếm khoảng 0,03 – 0,1% khối lượng, tồn tại ở bốn dạng đồng vị bền: 32S (94,98%), 33S (0,76%), 34S (4,22%) và 36S (0,02%). Trong tự nhiên, sulfur tồn tại ở cả dạng đơn chất và dạng hợp chất.",
        "formulae": [
          "H2(g) + S(s) to→ H2S (g) ΔrHo=−20,6kJ",
          "Hg + S → HgS",
          "S(s) + 3F2(g) → SF6(g)  =−1220,5kJ",
          "SO2 + 2H2S → 3S + 2H2O"
        ],
        "commonQuestions": [
          {
            "question": "Hòa tan hoàn toàn 11,2 gam Fe bằng dung dịch H₂SO₄ đặc, nóng, dư. Thể tích khí SO₂ (đkc, 24,79 L/mol) thu được là",
            "hint": "Fe nhường 3 electron lên Fe³⁺: n(Fe) = 0,2 mol cho 0,6 mol electron. S⁺⁶ nhận 2 electron thành SO₂ nên n(SO₂) = 0,3 mol → V = 0,3 × 24,79 = 7,437 L.",
            "sampleAnswer": "7,437 L"
          },
          {
            "question": "Dẫn 3,7185 lít SO₂ (đkc) vào 200 mL dung dịch NaOH 1 M. Khối lượng muối thu được là",
            "hint": "n(SO₂) = 0,15; n(NaOH) = 0,2 nên tỉ lệ 1,33 tạo hai muối. Giải hệ được 0,05 mol Na₂SO₃ và 0,10 mol NaHSO₃ → m = 0,05×126 + 0,10×104 = 16,7 gam.",
            "sampleAnswer": "16,7 gam"
          },
          {
            "question": "Nhận định về sulfuric acid đặc.",
            "hint": "Al và Fe bị thụ động hóa trong H₂SO₄ đặc nguội. Khi Cu phản ứng, S giảm số oxi hóa từ +6 xuống +4 tạo SO₂, tức bị khử chứ không bị oxi hóa.",
            "sampleAnswer": ""
          }
        ],
        "textbook": {
          "pageRange": "",
          "objectives": [],
          "sections": [
            {
              "id": "b7-m1",
              "sectionTitle": "Mở đầu",
              "content": "BÀI 7:Sulfur và sulfur dioxide"
            },
            {
              "id": "b7-m2",
              "sectionTitle": "I. Sulfur",
              "content": "- Sulfur (lưu huỳnh) là nguyên tố phổ biến thứ 17 trên vỏ Trái Đất, chiếm khoảng 0,03 – 0,1% khối lượng, tồn tại ở bốn dạng đồng vị bền: 32S (94,98%), 33S (0,76%), 34S (4,22%) và 36S (0,02%). Trong tự nhiên, sulfur tồn tại ở cả dạng đơn chất và dạng hợp chất. Đơn chất sulfur được phân bố ở vùng lân cận núi lửa và suối nước nóng,... Hợp chất sulfur gồm các khoáng vật sulfide, sulfate, protein,…\n- Sulfur được giải phóng ra khỏi lõi Trái Đất chủ yếu ở dạng sulfur dioxide (SO2) và hydrogen sulfide (H2S) khi núi lửa hoạt động. Sau đó, hydrogen sulfide chuyển hoá thành muối sulfide ít tan (tạo thành các khoáng vật pyrite, chalcopyrite,...) và sulfur dioxide chuyển hoá thành muối sulfate của calcium, barium (tạo thành các khoáng vật như thạch cao). Trong cơ thể người, sulfur chiếm khoảng 0,2% khối lượng, có trong thành phần nhiều protein và enzyme.\nĐá sulfur ở khu vực gần núi lửa\nCác khoáng vật chủ yếu của sulfur trên vỏ Trái Đất\na) Cấu tạo nguyên tử\nNguyên tố sulfur ở ô số 16, nhóm VIA, chu kì 3 trong bảng tuần hoàn. Nguyên tử sulfur có độ âm điện là 2,58. Sulfur có tính phi kim.\nSulfur tạo ra nhiều hợp chất với các số oxi hoá khác nhau từ –2 đến +6, ví dụ: H2S, SO2, SO3....\nb) Cấu tạo phân tử\nPhân tử sulfur gồm 8 nguyên tử (S8) có dạng vòng khép kín. Mỗi nguyên tử sulfur liên kết với hai nguyên tử bên cạnh bằng hai liên kết cộng hoá trị không phân cực. Liên kết S-S có năng lượng liên kết bằng 226 kJ/mol và độ dài liên kết là 205 pm.\nTrong phản ứng hoá học, phân tử sulfur được viết đơn giản là S.\nPhân tử sulfur S8\nĐơn chất sulfur có hai dạng thù hình: dạng tà phương (bền ở nhiệt độ thường) và dạng đơn tà.\nSulfur không tan trong nước, ít tan trong alcohol, tan nhiều trong carbon disulfide.\nSulfur nóng chảy ở 113 oC và sôi ở 445 oC.\nKhi tham gia phản ứng hoá học, sulfur có thể thể hiện tính oxi hoá hoặc tính khử. Trong thực tế, hầu hết các phản ứng của sulfur chỉ xảy ra khi đun nóng.\na) Tác dụng với hydrogen và kim loại\nỞ nhiệt độ cao, sulfur tác dụng với hydrogen tạo thành hydrogen sulfide:\nH2(g) + S(s) to→ H2S (g) ΔrHo=−20,6kJ\nSulfur tác dụng với thuỷ ngân (mercury) ngay ở nhiệt độ thường, tác dụng với nhiều kim loại khác ở nhiệt độ cao, tạo thành muối sulfide:\nHg + S → HgS\n2Al + 3S Al2S3\nPhản ứng của mercury với sulfur được sử dụng để xử lí mercury rơi vãi.\nb) Tác dụng với phi kim\nỞ nhiệt độ thích hợp, sulfur tác dụng với một số phi kim như fluorine, oxygen … Ví dụ:\nS(s) + 3F2(g) → SF6(g)  =−1220,5kJ\nS(s) + O2(g) SO2(g)  =−296,8kJ.\nMột số ứng dụng của sulfur được thể hiện trong sơ đồ sau:",
              "keyPoints": [
                "1. Trạng thái tự nhiên",
                "2. Cấu tạo nguyên tử, phân tử",
                "3. Tính chất vật lí",
                "4. Tính chất hoá học",
                "5. Ứng dụng"
              ]
            },
            {
              "id": "b7-m3",
              "sectionTitle": "II. Sulfur dioxide",
              "content": "Ở điều kiện thường, sulfur dioxide (SO2) là chất khí không màu, nặng hơn không khí, mùi hắc, tan nhiều trong nước (ở 20oC, 1 lít nước hoà tan được 40 lít khí sulfur dioxide).\nSulfur dioxide là khí độc, hít thở không khí chứa sulfur dioxide vượt ngưỡng cho phép sẽ gây viêm đường hô hấp.\na) Tính oxi hoá\nSulfur dioxide tác dụng với hydrogen sulfide tạo thành sulfur và nước.\nSO2 + 2H2S → 3S + 2H2O\nTrong thực tiễn, phản ứng trên được dùng để chuyển hoá hydrogen sulfide trong khí thiên nhiên thành sulfur.\nb) Tính khử\nSulfur dioxide tác dụng với nitrogen dioxide (NO2) khi có xúc tác nitrogen oxide để chuyển hoá thành sulfur trioxide.\nSO2 + NO2  SO3 + NO\nTrong không khí, sulfur dioxide chuyển hoá thành sulfur trioxide, sau đó kết hợp với hơi nước tạo thành sulfuric acid. Đây là phản ứng giải thích quá trình hình thành mưa acid khi không khí bị ô nhiễm bởi sulfur dioxide.\nSulfur dioxide là chất trung gian quan trọng trong quá trình sản xuất sulfuric acid.\nKhoa học Khí quyển\nDo có khả năng tẩy trắng và diệt khuẩn, sulfur dioxide được sử dụng để tẩy trắng bột giấy, khử màu trong sản xuất đường, chống nấm mốc cho sản phẩm mây tre đan,...\nTrong nghiên cứu, sulfur dioxide lỏng là một dung môi phân cực, được sử dụng để thực hiện nhiều phản ứng.\na) Nguồn phát sinh sulfur dioxide\nSulfur dioxide được sinh ra từ cả nguồn tự nhiên (khí thải núi lửa) và nguồn nhân tạo. Trên toàn thế giới, nguồn sulfur dioxide tự nhiên chiếm ưu thế, nhưng ở các khu vực đô thị và công nghiệp, nguồn nhân tạo chiếm ưu thế.\nNguồn sulfur dioxide nhân tạo chủ yếu sinh ra từ quá trình đốt cháy nhiên liệu có chứa tạp chất sulfur (than đá, dầu mỏ), đốt quặng sulfide (galen, blend) trong luyện kim, đốt sulfur và quặng pyrite trong sản xuất sulfuric acid,....\nb) Tác hại\nSulfur dioxide là một trong các tác nhân làm ô nhiễm khí quyển, gây mưa acid và viêm đường hô hấp ở người...\nc) Biện pháp cắt giảm phát thải sulfur dioxide vào khí quyển\nDựa trên các nguồn phát sinh sulfur dioxide do hoạt động của con người, các biện pháp để cắt giảm sự phát thải khí này được đề xuất như sau: tăng cưởng sử dụng các nguồn năng lượng mới, năng lượng sạch, năng lượng tái tạo; sử dụng tiết kiệm, hiệu quả nguồn tài nguyên thiên nhiên; cải tiến công nghệ sản xuất, có biện pháp xử lí khí thải và tái chế các sản phẩm phụ có chứa sulfur.",
              "keyPoints": [
                "1. Tính chất vật lí",
                "2. Tính chất  hoá học",
                "3. Ứng dụng",
                "4. Sulfur dioxide và ô nhiễm môi trường"
              ]
            }
          ],
          "practiceQuestions": [
            {
              "id": "b7-lt1",
              "question": "Liên kết trong phân tử N₂ là",
              "hint": "N≡N có năng lượng liên kết rất lớn (khoảng 945 kJ/mol) nên N₂ khá trơ ở nhiệt độ thường."
            },
            {
              "id": "b7-lt2",
              "question": "Nitrogen chiếm khoảng bao nhiêu phần trăm thể tích không khí?",
              "hint": "Không khí gồm khoảng 78% N₂, 21% O₂ về thể tích, phần còn lại là argon, CO₂ và hơi nước."
            },
            {
              "id": "b7-lt3",
              "question": "Để nhận biết muối ammonium, người ta cho muối tác dụng với dung dịch kiềm rồi đun nóng, hiện tượng là",
              "hint": "NH₄⁺ + OH⁻ → NH₃↑ + H₂O. Khí NH₃ mùi khai, làm giấy quỳ tím ẩm chuyển xanh."
            },
            {
              "id": "b7-lt4",
              "question": "Ở điều kiện thường, sulfur là",
              "hint": "Sulfur đơn chất là chất rắn màu vàng, không tan trong nước, tan trong một số dung môi hữu cơ."
            }
          ]
        }
      },
      {
        "id": "bai-8",
        "title": "Bài 8: Sulfuric acid và muối sulfate",
        "summary": "Phân tử sulfuric acid (H2SO4) có công thức cấu tạo:\nVới cấu tạo gồm các nguyên tử hydrogen linh động và các nguyên tử oxygen có độ âm điện lớn, giữa các phân tử sulfuric acid hình thành nhiều liên kết hydrogen:\nỞ điều kiện thường, sulfuric acid là chất lỏng sánh như dầu, không màu, không bay hơi, có tính hút ẩm mạnh. Dung dịch sulfuric acid 98% có khối lượng riêng 1,84 g/cm3, nặng gần gấp hai lần nước.",
        "formulae": [
          "·       H2SO4 (loãng) + Mg → MgSO4 + H2",
          "·       3H2SO4 (loãng) + 2Al → Al2(SO4)3 + 3H2",
          "·       H2SO4 (loãng) + Fe → FeSO4 + H2",
          "·       H2SO4 + Cu(OH)2 → CuSO4 + 2H2O",
          "·       H2SO4 + 2KOH → K2SO4 + 2H2O",
          "·       H2SO4 + CuO → CuSO4 + H2O"
        ],
        "commonQuestions": [
          {
            "question": "Hòa tan hoàn toàn 11,2 gam Fe bằng dung dịch H₂SO₄ đặc, nóng, dư. Thể tích khí SO₂ (đkc, 24,79 L/mol) thu được là",
            "hint": "Fe nhường 3 electron lên Fe³⁺: n(Fe) = 0,2 mol cho 0,6 mol electron. S⁺⁶ nhận 2 electron thành SO₂ nên n(SO₂) = 0,3 mol → V = 0,3 × 24,79 = 7,437 L.",
            "sampleAnswer": "7,437 L"
          },
          {
            "question": "Dẫn 3,7185 lít SO₂ (đkc) vào 200 mL dung dịch NaOH 1 M. Khối lượng muối thu được là",
            "hint": "n(SO₂) = 0,15; n(NaOH) = 0,2 nên tỉ lệ 1,33 tạo hai muối. Giải hệ được 0,05 mol Na₂SO₃ và 0,10 mol NaHSO₃ → m = 0,05×126 + 0,10×104 = 16,7 gam.",
            "sampleAnswer": "16,7 gam"
          },
          {
            "question": "Nhận định về sulfuric acid đặc.",
            "hint": "Al và Fe bị thụ động hóa trong H₂SO₄ đặc nguội. Khi Cu phản ứng, S giảm số oxi hóa từ +6 xuống +4 tạo SO₂, tức bị khử chứ không bị oxi hóa.",
            "sampleAnswer": ""
          }
        ],
        "textbook": {
          "pageRange": "",
          "objectives": [],
          "sections": [
            {
              "id": "b8-m1",
              "sectionTitle": "Mở đầu",
              "content": "BÀI 8:Sulfuric acid và muối sulfate"
            },
            {
              "id": "b8-m2",
              "sectionTitle": "I. Sulfuric acid",
              "content": "Phân tử sulfuric acid (H2SO4) có công thức cấu tạo:\nVới cấu tạo gồm các nguyên tử hydrogen linh động và các nguyên tử oxygen có độ âm điện lớn, giữa các phân tử sulfuric acid hình thành nhiều liên kết hydrogen:\nỞ điều kiện thường, sulfuric acid là chất lỏng sánh như dầu, không màu, không bay hơi, có tính hút ẩm mạnh.\nDung dịch sulfuric acid 98% có khối lượng riêng 1,84 g/cm3, nặng gần gấp hai lần nước.\nSulfuric acid tan vô hạn trong nước và toả rất nhiều nhiệt. Do vậy, tuyệt đối không tự ý pha loãng sulfuric acid. Khi pha loãng dung dịch sulfuric acid đặc, để đảm bảo an toàn phải rót từ từ dung dịch sulfuric acid đặc vào nước, vừa rót vừa khuấy (không làm ngược lại).\na) Bảo quản\nSulfuric acid được bảo quản trong chai, lọ có nút đậy chặt, đặt ở vị trí chắc chắn.\nĐặt chai, lọ đựng dung dịch sulfuric acid đặc cách xa các lọ chứa chất dễ gây cháy, nổ như chlorate, perchlorate, permanganate, dichromate.\nb) Sử dụng\nSulfuric acid gây bỏng khi rơi vào da, do vậy khi sử dụng cần tuân thủ các nguyên tắc:\n(1) Sử dụng găng tay, đeo kính bảo hộ, mặc áo thí nghiệm.\n(2) Cầm dụng cụ chắc chắn, thao tác cẩn thận.\n(3) Không tì, đè chai đựng acid lên miệng cốc, ống đong khi rót acid.\n(4) Sử dụng lượng acid vừa phải, lượng acid còn thừa phải thu hồi vào lọ đựng.\n(5) Không được đổ nước vào dung dịch acid đặc.\nc) Sơ cứu khi bỏng acid\nKhi bị bỏng sulfuric acid cần thực hiện sơ cứu theo các bước sau:\n(1) Nhanh chóng rửa ngay với nước lạnh nhiều lần để làm giảm lượng acid bám trên da. Nếu bị bỏng ở vùng mặt nhưng acid chưa bắn vào mắt thì nhắm chặt mắt khi ngâm rửa. Nếu acid đã bắn vào mắt thì úp mặt vào chậu nước sạch, mở mắt và chớp nhiều lần để rửa acid.\n(2) Sau khi ngâm rửa bằng nước, cần tiến hành trung hoà acid bằng dung dịch NaHCO3\nloãng (khoảng 2%).\n(3) Băng bó tạm thời vết bỏng bằng băng sạch, cho người bị bỏng uống bù nước điện giải rồi đưa đến cơ sở y tế gần nhất.\na) Dung dịch sulfuric acid loãng\nDung dịch sulfuric acid loãng có đầy đủ tính chất của một acid mạnh.\n- Làm đổi màu quỳ tím thành đỏ;\n- Tác dụng với nhiều kim loại (Mg, Al, Zn, Fe,...) tạo thành muối sulfate và giải phóng khí hydrogen.\nVí dụ:\n·       H2SO4 (loãng) + Mg → MgSO4 + H2\n·       3H2SO4 (loãng) + 2Al → Al2(SO4)3 + 3H2\nChú ý: Các kim loại Hg, Cu, Ag, Au, Pt …không tác dụng với H2SO4 loãng.\nKhi Fe tác dụng với H2SO4 loãng, sản phẩm thu được là muối iron(II).\n·       H2SO4 (loãng) + Fe → FeSO4 + H2\n-Tác dụng với base tạo thành muối sulfate và nước.\nVí dụ:\n·       H2SO4 + Cu(OH)2 → CuSO4 + 2H2O\n·       H2SO4 + 2KOH → K2SO4 + 2H2O\n-Tác dụng với basic oxide tạo thành muối sulfate và nước.\nVí dụ:\n·       H2SO4 + CuO → CuSO4 + H2O\n·       H2SO4 + Na2O → Na2SO4 + H2O\n- Tác dụng với một số muối tạo thành muối sulfate và acid mới\nVí dụ:\n·       MgCO3 + H2SO4 → MgSO4 + CO2 + H2O\nb) Dung dịch sulfuric acid đặc\n- Tính acid\nDung dịch sulfuric acid đặc có tính acid mạnh và khó bay hơi, được sử dụng để điều chế một số acid dễ bay hơi.\nVí dụ: Dung dịch sulfuric acid đặc được dùng trong công nghiệp để điều chế HF bằng cách tác dụng với quặng fluorite.\n·       CaF2 + H2SO4 CaSO4 + 2HF\n- Tính oxi hoá\nDung dịch sulfuric acid đặc thể hiện tính oxi hoá mạnh, nhất là khi đun nóng, kèm theo sự giảm số oxi hoá của nguyên tử sulfur:\nS+6+2e→S+4;S+6+6e→S0;S+6+8e→S-2;\nDung dịch sulfuric acid đặc, nóng oxi hoá được nhiều kim loại, phi kim và hợp chất.\nVí dụ:\n·       Cu + 2H2SO4 CuSO4 + SO2 + 2H2O\n·       C + 2H2SO4  CO2 + 2SO2 + 2H2O\n·       2KBr + 2H2SO4  Br2 + SO2 + 2H2O + K2SO4\n­- Tính háo nước\nDung dịch sulfuric acid đặc có khả năng lấy nước từ hợp chất carbohydrate và khiến chúng hoá đen (hiện tượng than hoá).\nH2SO4 đặc tác dụng với đường.\nMột số ứng dụng của sulfuric acid được thể hiện trong sơ đồ sau:\nTrong công nghiệp, sulfuric acid chủ yếu được sản xuất bằng phương pháp tiếp xúc, đi từ nguyên liệu chính là sulfur, quặng pyrite (chứa FeS2).\nPhương pháp tiếp xúc gồm ba giai đoạn chính.\nGiai đoạn 1: Sản xuất sulfur dioxide\nTuỳ thuộc vào nguồn nguyên liệu, sulfur dioxide được sản xuất bằng cách đốt cháy sulfur, pyrite hoặc quặng sulfide trong lò đốt bằng không khí.\nS(g) + O2(g)  SO2(g)\n4FeS2(s) + 11O2(g) 2Fe2O3(s) + 8SO2(g)\nGiai đoạn 2: Sản xuất sulfur trioxide\nOxi hoá sulfur dioxide bằng không khí dư ở nhiệt độ khoảng 450 oC, áp suất 1 – 2 bar, xúc tác vanadium(V) oxide (V2O5), hiệu suất đạt trên 98%:\n2SO2(g) + O2(g)­ ⇌V2O5,to2SO3(g)\nGiai đoạn 3: Hấp thụ sulfur trioxide bằng sulfuric acid đặc, tạo ra oleum (hỗn hợp các acid có công thức chung dạng H2SO4.nSO3). Sau đó, pha loãng oleum vào nước thu được dung dịch sulfuric acid loãng.",
              "keyPoints": [
                "1. Cấu tạo phân tử",
                "2. Tính chất vật lí",
                "3. Quy tắc an toàn",
                "4. Tính chất hoá học",
                "5. Ứng dụng",
                "6. Sản xuất"
              ]
            },
            {
              "id": "b8-m3",
              "sectionTitle": "II. Muối sulfate",
              "content": "Một số ứng dụng của muối sulfate được thể hiện trong sơ đồ sau:\nThuốc thử nhận biết ion sulfate là dung dịch muối barium hoặc dung dịch Ba(OH)2. Sản phẩm phản ứng là barium sulfate BaSO4 kết tủa trắng, không tan trong acid. H2SO4 + BaCl2 →BaSO4↓ + 2HCl\nNa2SO4 + Ba(OH)2 →BaSO4↓ + 2NaOH\nKết tủa trắng BaSO4",
              "keyPoints": [
                "1. Ứng dụng",
                "2. Nhận biết"
              ]
            }
          ],
          "practiceQuestions": [
            {
              "id": "b8-lt1",
              "question": "Liên kết trong phân tử N₂ là",
              "hint": "N≡N có năng lượng liên kết rất lớn (khoảng 945 kJ/mol) nên N₂ khá trơ ở nhiệt độ thường."
            },
            {
              "id": "b8-lt2",
              "question": "Nitrogen chiếm khoảng bao nhiêu phần trăm thể tích không khí?",
              "hint": "Không khí gồm khoảng 78% N₂, 21% O₂ về thể tích, phần còn lại là argon, CO₂ và hơi nước."
            },
            {
              "id": "b8-lt3",
              "question": "Để nhận biết muối ammonium, người ta cho muối tác dụng với dung dịch kiềm rồi đun nóng, hiện tượng là",
              "hint": "NH₄⁺ + OH⁻ → NH₃↑ + H₂O. Khí NH₃ mùi khai, làm giấy quỳ tím ẩm chuyển xanh."
            },
            {
              "id": "b8-lt4",
              "question": "Ở điều kiện thường, sulfur là",
              "hint": "Sulfur đơn chất là chất rắn màu vàng, không tan trong nước, tan trong một số dung môi hữu cơ."
            }
          ]
        }
      },
      {
        "id": "bai-9",
        "title": "Bài 9: Hệ thống hoá kiến thức về nitrogen và sulfur",
        "summary": "• Nitrogen là nguyên tố phổ biến, góp phần tạo nên sự sống trên Trái Đất. • Cấu hình electron lớp ngoài cùng của nguyên tử: 2s22p3.",
        "formulae": [],
        "commonQuestions": [
          {
            "question": "Hòa tan hoàn toàn 11,2 gam Fe bằng dung dịch H₂SO₄ đặc, nóng, dư. Thể tích khí SO₂ (đkc, 24,79 L/mol) thu được là",
            "hint": "Fe nhường 3 electron lên Fe³⁺: n(Fe) = 0,2 mol cho 0,6 mol electron. S⁺⁶ nhận 2 electron thành SO₂ nên n(SO₂) = 0,3 mol → V = 0,3 × 24,79 = 7,437 L.",
            "sampleAnswer": "7,437 L"
          },
          {
            "question": "Dẫn 3,7185 lít SO₂ (đkc) vào 200 mL dung dịch NaOH 1 M. Khối lượng muối thu được là",
            "hint": "n(SO₂) = 0,15; n(NaOH) = 0,2 nên tỉ lệ 1,33 tạo hai muối. Giải hệ được 0,05 mol Na₂SO₃ và 0,10 mol NaHSO₃ → m = 0,05×126 + 0,10×104 = 16,7 gam.",
            "sampleAnswer": "16,7 gam"
          },
          {
            "question": "Nhận định về sulfuric acid đặc.",
            "hint": "Al và Fe bị thụ động hóa trong H₂SO₄ đặc nguội. Khi Cu phản ứng, S giảm số oxi hóa từ +6 xuống +4 tạo SO₂, tức bị khử chứ không bị oxi hóa.",
            "sampleAnswer": ""
          }
        ],
        "textbook": {
          "pageRange": "",
          "objectives": [],
          "sections": [
            {
              "id": "b9-m1",
              "sectionTitle": "Mở đầu",
              "content": "HỆ THỐNG  HOÁ KIẾN THỨC\nNITROGEN\nSULFUR. SULFUR DIOXIDE\n• Nitrogen là nguyên tố phổ biến, góp phần tạo nên sự sống trên Trái Đất.\n• Cấu hình electron lớp ngoài cùng của nguyên tử: 2s22p3.\n• Số oxi hoá thường gặp:\n−3, 0, +1, +2, +3, +4, +5.\n• Phân tử nitrogen gồm 2 nguyên tử liên kết với nhau bằng liên kết ba bền vững (N≡N). • Đơn chất nitrogen khá trơ ở nhiệt độ thường, hoạt động hoá học mạnh hơn khi đun nóng và có xúc tác.\n• Đơn chất nitrogen thể hiện tính oxi hoá và tính khử.\nSulfur\n• Sulfur là nguyên tố phổ biến trên Trái Đất, tồn tại ở cả dạng đơn chất và hợp chất.\n• Cấu hình electron lớp ngoài cùng: 3s23p4.\n• Số oxi hoá thường gặp: −2, 0, +4, +6.\n• Phân tử dạng mạch vòng gồm 8 nguyên tử (S8) và tương đối bền.\n• Sulfur thể hiện cả tính oxi hoá và tính khử.\nSulfur dioxide\n• Sulfur dioxide phát thải ra môi trường từ quá trình đốt cháy nhiên liệu (than đá, dầu mỏ), đốt cháy sulfur và khoáng vật sulfide,...\n• Sulfur dioxide có tính chất của oxide acid, có tính oxi hoá và tính khử.\nAMMONIA. MUỐI AMMONIUM\nSULFURIC ACID. MUỐI SULFATE\nAmmonia\n• Phân tử ammonia có dạng chóp tam giác, phân tử còn 1 cặp electron không liên kết. • Khí ammonia có mùi khai, dễ tan trong nước, dễ hoá lỏng; ammonia có tính base và tính khử.\n• Ammonia được sản xuất từ nitrogen và hydrogen theo quá trình Haber - Bosch.\nMuối ammonium\n• Muối ammonium thường dễ tan trong nước và kém bền nhiệt.\n• Ion ammonium được nhận biết bằng phản ứng với kiềm, sinh ra khí có mùi khai.\nSulfuric acid\n• Dung dịch sulfuric acid loãng có đầy đủ tính chất của một acid mạnh.\n• Dung dịch sulfuric acid đặc có tính háo nước, có khả năng gây bỏng, có tính acid mạnh và tính oxi hoá mạnh.\n• Bảo quản, sử dụng sulfuric acid đặc phải tuân theo quy tắc đảm bảo an toàn, phòng chống cháy, nổ.\n• Sulfuric acid được sản xuất từ các nguyên liệu chính: sulfur, quặng pyrite.\nMuối sulfate\n• Các muối sulfate có nhiều ứng dụng thực tiễn: ammonium sulfate, barium sulfate, calcium sulfate, magnesium sulfate....\n• Ion sulfate trong dung dịch được nhận biết bằng ion Ba2+.\nMỘT SỐ HỢP CHẤT VỚI OXYGEN CỦA NITROGEN\nOxide của nitrogen\n• Các oxide của nitrogen là một trong số các tác nhân chính gây ô nhiễm môi trường không khí và mưa acid.\nNitric acid\n• Nitric acid là chất lỏng, tan tốt trong nước, bốc khói trong không khí ẩm.\n• Nitric acid có tính acid mạnh và tính oxi hoá mạnh."
            }
          ],
          "practiceQuestions": [
            {
              "id": "b9-lt1",
              "question": "Liên kết trong phân tử N₂ là",
              "hint": "N≡N có năng lượng liên kết rất lớn (khoảng 945 kJ/mol) nên N₂ khá trơ ở nhiệt độ thường."
            },
            {
              "id": "b9-lt2",
              "question": "Nitrogen chiếm khoảng bao nhiêu phần trăm thể tích không khí?",
              "hint": "Không khí gồm khoảng 78% N₂, 21% O₂ về thể tích, phần còn lại là argon, CO₂ và hơi nước."
            },
            {
              "id": "b9-lt3",
              "question": "Để nhận biết muối ammonium, người ta cho muối tác dụng với dung dịch kiềm rồi đun nóng, hiện tượng là",
              "hint": "NH₄⁺ + OH⁻ → NH₃↑ + H₂O. Khí NH₃ mùi khai, làm giấy quỳ tím ẩm chuyển xanh."
            },
            {
              "id": "b9-lt4",
              "question": "Ở điều kiện thường, sulfur là",
              "hint": "Sulfur đơn chất là chất rắn màu vàng, không tan trong nước, tan trong một số dung môi hữu cơ."
            }
          ]
        }
      }
    ]
  },
  {
    "id": "chuong-3",
    "title": "Chương 3: Đại cương hoá học hữu cơ",
    "lessons": [
      {
        "id": "bai-10",
        "title": "Bài 10: Hợp chất hữu cơ và hoá học hữu cơ",
        "summary": "Hợp chất hữu cơ là hợp chất của carbon (trừ CO, CO2, muối carbonate, cyanide, carbide...). Hóa học hữu cơ là ngành hóa học chuyên nghiên cứu về các hợp chất hữu cơ. Hợp chất hữu cơ được chia thành hai loại lớn: Hydrocarbon (chỉ chứa C và H) và Dẫn xuất của hydrocarbon (ngoài C, H còn có các nguyên tố khác như O, N, S, halogen...). Đặc điểm chung: liên kết chủ yếu là cộng hóa trị, nhiệt độ nóng chảy và sôi thấp, kém bền với nhiệt, phản ứng thường xảy ra chậm và theo nhiều hướng.",
        "formulae": [
          "Công thức phân tử tổng quát: CxHyOzNt",
          "Thiết lập CTPT từ thành phần phần trăm khối lượng: x : y : z = (%mC/12) : (%mH/1) : (%mO/16)",
          "Ví dụ: CH4; CH2 = CH2; CH ≡ CH; C6H6…",
          "2C2H5OH + 2Na → 2C2H5ONa + H2"
        ],
        "commonQuestions": [
          {
            "question": "Phân tích một hợp chất hữu cơ X thấy chứa 85,7% Carbon và 14,3% Hydrogen về khối lượng. Tỉ khối hơi của X so với khí Hydrogen là 28. Xác định công thức phân tử của X.",
            "hint": "Hãy đi từng bước giải quyết:\n1. Tính khối lượng mol của X dựa trên tỉ khối so với H2: M_X = d_X/H2 * M_H2.\n2. Gọi công thức đơn giản nhất của X là CxHy. Lập tỉ lệ x : y = %C/12 : %H/1. Tìm công thức thực nghiệm.\n3. Dựa trên khối lượng mol M_X vừa tính được ở bước 1 để tìm công thức phân tử chính xác.",
            "sampleAnswer": "Bước 1: Tính khối lượng mol của X:\nM_X = d_X/H2 * M_H2 = 28 * 2 = 56 g/mol.\n\nBước 2: Tìm công thức thực nghiệm:\nTa có tỉ lệ x : y = (%mC / 12) : (%mH / 1) = (85,7 / 12) : (14,3 / 1) = 7,14 : 14,3 ≈ 1 : 2.\n=> Công thức thực nghiệm là (CH2)n.\n\nBước 3: Tìm công thức phân tử:\nM_X = (12 + 2 * 1) * n = 56 => 14n = 56 => n = 4.\nVậy công thức phân tử của X là C4H8."
          }
        ],
        "textbook": {
          "pageRange": "Trang 70 – 82",
          "objectives": [
            "Nêu được khái niệm hợp chất hữu cơ và hóa học hữu cơ.",
            "Phân loại được hợp chất hữu cơ thành hydrocarbon và dẫn xuất.",
            "Lập được công thức phân tử hợp chất hữu cơ từ kết quả phân tích nguyên tố.",
            "Trình bày được đặc điểm chung của hợp chất hữu cơ."
          ],
          "sections": [
            {
              "id": "b5-s1",
              "sectionTitle": "I. Khái niệm hợp chất hữu cơ",
              "content": "Hợp chất hữu cơ là hợp chất của nguyên tố carbon (C), thường có thêm H, O, N, S, halogen...\n\nNgoại lệ – KHÔNG phải hợp chất hữu cơ dù có C:\n• CO, CO₂ (oxide của carbon)\n• Muối carbonate (Na₂CO₃, CaCO₃...)\n• Cyanide (HCN, NaCN)\n• Carbide (CaC₂, SiC...)\n\nPhân loại hợp chất hữu cơ:\n① Hydrocarbon: Chỉ chứa C và H.\n   • Mạch hở (acyclic): Alkane, Alkene, Alkyne...\n   • Mạch vòng (cyclic): Cycloalkane, Benzene...\n   \n② Dẫn xuất của hydrocarbon: Ngoài C, H còn có O, N, S, halogen...\n   • Dẫn xuất halogen (R–X): CH₃Cl, CHCl₃...\n   • Alcohol (R–OH): C₂H₅OH...\n   • Acid carboxylic (R–COOH): CH₃COOH...\n   • Amine (R–NH₂): CH₃NH₂...",
              "keyPoints": [
                "Hợp chất hữu cơ là hợp chất của C (trừ CO, CO₂, carbonate, cyanide, carbide).",
                "Phân loại: Hydrocarbon (chỉ C, H) và dẫn xuất (có thêm O, N, S, halogen)."
              ],
              "imagePrompt": "Organic chemistry classification tree diagram showing hydrocarbon and derivatives, colorful branches with examples like CH4 C2H5OH CH3COOH, clean educational poster white background",
              "imageAlt": "Sơ đồ phân loại hợp chất hữu cơ"
            },
            {
              "id": "b5-s2",
              "sectionTitle": "II. Đặc điểm của hợp chất hữu cơ",
              "content": "So với hợp chất vô cơ, hợp chất hữu cơ có những đặc điểm riêng biệt:\n\n① Về liên kết: Chủ yếu là liên kết cộng hóa trị (C–C, C–H, C–O...), ít phân cực → không dẫn điện.\n\n② Về nhiệt độ nóng chảy/sôi: Thường thấp hơn hợp chất vô cơ, dễ bay hơi.\n\n③ Độ bền nhiệt: Kém bền, dễ bị phân hủy khi đun nóng mạnh (carbonized).\n\n④ Tốc độ phản ứng: Thường chậm hơn, cần xúc tác, đun nóng.\n\n⑤ Phản ứng theo nhiều hướng: Thường tạo hỗn hợp sản phẩm (phản ứng chính + phụ).\n\n⑥ Tính tan: Thường tan trong dung môi hữu cơ (cồn, ether, benzene), ít tan hoặc không tan trong nước.",
              "keyPoints": [
                "Liên kết cộng hóa trị → không dẫn điện.",
                "Nhiệt độ nc/sôi thấp, kém bền nhiệt.",
                "Phản ứng chậm, theo nhiều hướng.",
                "Tan trong dung môi hữu cơ."
              ]
            },
            {
              "id": "b5-s3",
              "sectionTitle": "III. Xác định công thức phân tử hợp chất hữu cơ",
              "content": "Phương pháp phân tích nguyên tố:\nĐốt cháy hợp chất hữu cơ CxHyOz → thu CO₂ và H₂O để xác định %C và %H, phần còn lại là %O.\n\nLập công thức từ %thành phần:\nx : y : z = (%C/12) : (%H/1) : (%O/16)\n\n→ Tìm tỉ lệ số nguyên tối giản → Công thức thực nghiệm (CTTN).\n\nTừ CTTN → Công thức phân tử (CTPT):\n• CTPT = (CTTN)ₙ\n• n = M_hợp chất / M_CTTN (M_CTTN tính từ tỉ lệ tối giản)",
              "keyPoints": [
                "Đốt cháy hữu cơ → CO₂ + H₂O → tính %C, %H, %O.",
                "x:y:z = (%C/12) : (%H/1) : (%O/16) → CTTN.",
                "Kết hợp M để tìm CTPT = (CTTN)ₙ."
              ],
              "formulae": [
                "nC = nCO₂; nH = 2×nH₂O",
                "x:y:z = (%C/12) : (%H/1) : (%O/16)",
                "CTPT = (CTTN)ₙ, với n = M/(M_CTTN)"
              ],
              "examples": [
                {
                  "title": "Ví dụ tìm CTPT (SGK tr.78)",
                  "problem": "Đốt cháy hoàn toàn 0,1 mol hợp chất hữu cơ X thu được 0,2 mol CO₂ và 0,3 mol H₂O. X có M = 46 g/mol. Xác định CTPT của X.",
                  "solution": "nC = nCO₂ = 0,2 mol → trong 0,1 mol X có 0,2 mol C → 2 nguyên tử C.\nnH = 2×nH₂O = 0,6 mol → 6 nguyên tử H.\nmO = 46 – 2×12 – 6×1 = 46 – 24 – 6 = 16 → 1 nguyên tử O.\nCTPT: C₂H₆O (ethanol hoặc dimethyl ether)."
                }
              ]
            }
          ],
          "practiceQuestions": [
            {
              "id": "b5-q1",
              "question": "Chất nào sau đây là hợp chất hữu cơ: CO₂, C₂H₅OH, Na₂CO₃, CH₃COOH, CaC₂, C₆H₆?",
              "answer": "Hợp chất hữu cơ: C₂H₅OH (ethanol), CH₃COOH (acid acetic), C₆H₆ (benzene).\nKhông phải hữu cơ: CO₂ (oxide carbon), Na₂CO₃ (muối carbonate), CaC₂ (carbide)."
            },
            {
              "id": "b5-q2",
              "question": "Hợp chất hữu cơ X chứa 38,7% C, 9,7% H và 51,6% O (theo khối lượng). M_X = 62 g/mol. Xác định CTPT của X.",
              "hint": "x:y:z = (38,7/12) : (9,7/1) : (51,6/16) = 3,225 : 9,7 : 3,225 = 1:3:1 → CTTN: CH₃O",
              "answer": "x:y:z = (38,7/12) : (9,7/1) : (51,6/16) ≈ 1:3:1\nCTTN: CH₃O; M_CTTN = 31\nn = 62/31 = 2\nCTPT: C₂H₆O₂ (ethylene glycol)"
            }
          ]
        }
      },
      {
        "id": "bai-11",
        "title": "Bài 11: Phương pháp tách và tinh chế hợp chất hữu cơ",
        "summary": "Chưng cất là phương pháp tách chất dựa vào sự khác nhau về nhiệt độ sôi của các chất trong hỗn hợp ở một áp suất nhất định. Chất lỏng cần tách được chuyển sang pha hơi, rồi làm lạnh cho hơi ngưng tụ, thu lấy chất lỏng ở khoảng nhiệt độ thích hợp.",
        "formulae": [],
        "commonQuestions": [
          {
            "question": "Số đồng phân cấu tạo mạch hở ứng với công thức phân tử C₄H₁₀O là",
            "hint": "Gồm 4 alcohol (butan-1-ol, butan-2-ol, 2-methylpropan-1-ol, 2-methylpropan-2-ol) và 3 ether (diethyl ether, methyl propyl ether, methyl isopropyl ether), tất cả là 7.",
            "sampleAnswer": "7"
          },
          {
            "question": "Hợp chất hữu cơ là",
            "hint": "Hợp chất hữu cơ là hợp chất của carbon nhưng loại trừ một số hợp chất vô cơ quen thuộc như CO, CO₂, muối carbonate, cyanide, carbide.",
            "sampleAnswer": "hợp chất của carbon, trừ CO, CO₂, muối carbonate, cyanide, carbide…"
          },
          {
            "question": "Để tinh chế một chất rắn có lẫn tạp chất, người ta thường dùng phương pháp",
            "hint": "Kết tinh lại dựa trên sự khác nhau về độ tan theo nhiệt độ: chất cần tinh chế kết tinh trước, tạp chất còn lại trong dung dịch.",
            "sampleAnswer": "kết tinh"
          }
        ],
        "textbook": {
          "pageRange": "",
          "objectives": [],
          "sections": [
            {
              "id": "b11-m1",
              "sectionTitle": "I. Phương pháp chưng cất",
              "content": "Chưng cất là phương pháp tách chất dựa vào sự khác nhau về nhiệt độ sôi của các chất trong hỗn hợp ở một áp suất nhất định.\nChất lỏng cần tách được chuyển sang pha hơi, rồi làm lạnh cho hơi ngưng tụ, thu lấy chất lỏng ở khoảng nhiệt độ thích hợp.\nPhương pháp chưng cất dùng để tách các chất lỏng ra khỏi hỗn hợp các chất có nhiệt độ sôi khác nhau nhằm thu được chất lỏng tinh khiết hơn.\nXử lý Chất lỏng\nChú ý:\n- Để tách các chất lỏng có nhiệt độ sôi khác nhau nhiều, người ta dùng phương pháp chưng cất thường.\nThiết bị, dụng cụ tách chất bằng phương pháp chưng cất thường\n- Phương pháp chưng cất phân đoạn dùng để tách hai hay nhiều chất lỏng có nhiệt độ sôi khác nhau không nhiều và tan lẫn hoàn toàn trong nhau.\nThiết bị, dụng cụ tách chất bằng phương pháp chưng cất phân đoạn\n- Phương pháp chưng cất lôi cuốn hơi nước dùng để tách các chất có nhiệt độ sôi cao và không tan trong nước.\nXử lý Chất lỏng",
              "keyPoints": [
                "1. Nguyên tắc",
                "2. Cách tiến hành",
                "3. Ứng dụng"
              ]
            },
            {
              "id": "b11-m2",
              "sectionTitle": "II. Phương pháp chiết",
              "content": "Chiết là phương pháp tách biệt và tinh chế hỗn hợp các chất dựa vào sự hoà tan khác nhau của chúng trong hai môi trường không trộn lẫn vào nhau.\nDụng cụ chiết\n- Chiết lỏng – lỏng: thường dùng để tách các chất hữu cơ hoà tan trong nước. Dùng một dung môi có khả năng hoà tan chất cần chiết, không trộn lẫn với dung môi ban đầu và có nhiệt độ sôi thấp để chiết. Sau khi lắc dung môi chiết với hỗn hợp chất hữu cơ và nước, chất hữu cơ được chuyển phần lớn sang dung môi chiết và có thể dùng phễu chiết để tách riêng dịch chiết (dung dịch chứa chất cần chiết) khỏi nước. Khi hai chất lỏng không trộn lẫn được vào nhau, chất lỏng nào có khối lượng riêng nhỏ hơn sẽ tách thành lớp ở phía trên. Bằng cách lặp lại nhiều lần như trên, ta có thể tách được gần như hoàn toàn chất hữu cơ vào dung môi chiết. Sau đó, chưng cất dung môi ở nhiệt độ và áp suất thích hợp sẽ thu được chất hữu cơ.\n- Chiết lỏng – rắn: dùng dung môi lỏng hoà tan chất hữu cơ để tách chúng ra khỏi hỗn hợp rắn.\nPhương pháp chiết lỏng – lỏng dùng để tách lấy chất hữu cơ khi nó ở dạng nhũ tương hoặc huyền phù trong nước.\nÁp dụng phương pháp chiết lỏng – rắn để tách lấy chất hữu cơ ra khỏi một hỗn hợp ở thể rắn, thường được áp dụng để ngâm rượu thuốc, phân tích thổ nhưỡng, phần tích dư lượng thuốc bảo vệ thực vật trong nông sản,…",
              "keyPoints": [
                "1. Nguyên tắc",
                "2. Cách tiến hành",
                "3. Ứng dụng"
              ]
            },
            {
              "id": "b11-m3",
              "sectionTitle": "III. Phương pháp kết tinh",
              "content": "Kết tinh là phương pháp tách biệt và tinh chế hỗn hợp các chất rắn dựa vào độ tan khác nhau và sự thay đổi độ tan của chúng theo nhiệt độ.\n- Hoà tan chất rắn lẫn tạp chất vào dung môi để tạo dung dịch bão hoà ở nhiệt độ cao. Dung môi thường dùng là nước, ethanol, acetone, ether, ethyl acetate,... hoặc đôi khi là hỗn hợp của chúng. Dung môi cần hoà tan tốt chất cần tinh chế ở nhiệt độ cao và hoà tan kém hơn chất cần tinh chế ở nhiệt độ thấp.\n- Lọc nóng loại bỏ chất không tan.\n- Để nguội và làm lạnh dung dịch thu được, chất cần tinh chế sẽ kết tinh.\n- Lọc để thu được chất rắn.\nCác bước tiến hành trong phương pháp kết tinh\nThực hiện kết tinh lại nhiều lần trong cùng một dung môi hoặc các dung môi khác nhau sẽ thu được tinh thể các chất cần tinh chế.\nPhương pháp kết tinh được dùng để tách và tinh chế các chất rắn.",
              "keyPoints": [
                "1. Nguyên tắc",
                "2. Cách tiến hành",
                "3. Ứng dụng"
              ]
            },
            {
              "id": "b11-m4",
              "sectionTitle": "IV. Sắc kí cột",
              "content": "Sắc kí cột là phương pháp tách biệt và tinh chế hỗn hợp các chất dựa vào sự phân bố khác nhau của chúng giữa pha động và pha tĩnh.\nPha động là dung môi và dung dịch mẫu chất cần tách di chuyển qua cột. Pha tĩnh là một chất rắn có diện tích bề mặt rất lớn, có khả năng hấp phụ khác nhau các chất trong hỗn hợp cần tách, ví dụ: silica gel, aluminium oxide,... Khi dung môi chạy qua cột, các chất hữu cơ được tách ra ở từng phân đoạn.\n- Sử dụng các cột thuỷ tinh có chứa các chất hấp phụ dạng bột (pha tĩnh), thường là aluminium oxide, sillica gel, …\n- Cho hỗn hợp cần tách lên cột sắc kí.\n- Cho dung môi thích hợp chảy liên tục qua cột sắc kí. Thu các chất hữu cơ được tách ra ở từng phân đoạn khác nhau sau khi đi ra khỏi cột sắc kí.\n- Loại bỏ dung môi để thu được chất cần tách.\nPhương pháp sắc kí cột thường dùng để tách các chất hữu cơ có hàm lượng nhỏ và khó tách ra khỏi nhau.",
              "keyPoints": [
                "1. Nguyên tắc",
                "2. Cách tiến hành",
                "3. Ứng dụng"
              ]
            }
          ],
          "practiceQuestions": [
            {
              "id": "b11-lt1",
              "question": "Hợp chất hữu cơ là",
              "hint": "Hợp chất hữu cơ là hợp chất của carbon nhưng loại trừ một số hợp chất vô cơ quen thuộc như CO, CO₂, muối carbonate, cyanide, carbide."
            },
            {
              "id": "b11-lt2",
              "question": "Nhóm chức là",
              "hint": "Nhóm chức quyết định tính chất hóa học đặc trưng, ví dụ −OH của alcohol hay −COOH của carboxylic acid."
            },
            {
              "id": "b11-lt3",
              "question": "Phương pháp chưng cất dùng để tách các chất",
              "hint": "Chưng cất dựa trên sự khác nhau về nhiệt độ sôi: chất dễ bay hơi hơn sẽ tách ra trước rồi được ngưng tụ."
            },
            {
              "id": "b11-lt4",
              "question": "Phương pháp chiết dựa trên",
              "hint": "Chất tan tốt hơn trong dung môi nào sẽ chuyển sang lớp dung môi đó, sau đó tách hai lớp bằng phễu chiết."
            }
          ]
        }
      },
      {
        "id": "bai-12",
        "title": "Bài 12: Công thức phân tử hợp chất hữu cơ",
        "summary": "Công thức phân tử cho biết thành phần nguyên tố và số lượng nguyên tử của mỗi nguyên tố trong phân tử. a) Công thức tổng quát\nCông thức tổng quát cho biết các nguyên tố có trong phân tử hợp chất hữu cơ.",
        "formulae": [
          "x : y : z = : :  = p : q : r",
          "CxHyOz = (CpHqOr)n"
        ],
        "commonQuestions": [
          {
            "question": "Số đồng phân cấu tạo mạch hở ứng với công thức phân tử C₄H₁₀O là",
            "hint": "Gồm 4 alcohol (butan-1-ol, butan-2-ol, 2-methylpropan-1-ol, 2-methylpropan-2-ol) và 3 ether (diethyl ether, methyl propyl ether, methyl isopropyl ether), tất cả là 7.",
            "sampleAnswer": "7"
          },
          {
            "question": "Hợp chất hữu cơ là",
            "hint": "Hợp chất hữu cơ là hợp chất của carbon nhưng loại trừ một số hợp chất vô cơ quen thuộc như CO, CO₂, muối carbonate, cyanide, carbide.",
            "sampleAnswer": "hợp chất của carbon, trừ CO, CO₂, muối carbonate, cyanide, carbide…"
          },
          {
            "question": "Để tinh chế một chất rắn có lẫn tạp chất, người ta thường dùng phương pháp",
            "hint": "Kết tinh lại dựa trên sự khác nhau về độ tan theo nhiệt độ: chất cần tinh chế kết tinh trước, tạp chất còn lại trong dung dịch.",
            "sampleAnswer": "kết tinh"
          }
        ],
        "textbook": {
          "pageRange": "",
          "objectives": [],
          "sections": [
            {
              "id": "b12-m1",
              "sectionTitle": "I. Công thức phân tử",
              "content": "Công thức phân tử cho biết thành phần nguyên tố và số lượng nguyên tử của mỗi nguyên tố trong phân tử.\na) Công thức tổng quát\nCông thức tổng quát cho biết các nguyên tố có trong phân tử hợp chất hữu cơ.\nVí dụ:\nCxHyOz (x, y, z là các số nguyên dương) cho biết phân tử chất hữu cơ đã cho chứa ba nguyên tố C, H và O.\nb) Công thức đơn giản nhất\nCông thức đơn giản nhất cho biết tỉ lệ số nguyên tử của các nguyên tố có trong phân tử hợp chất hữu cơ (tỉ lệ các số nguyên tối giản).\nVí dụ: Hợp chất có công thức phân tử là C2H4O2 thì có công thức đơn giản nhất là CH2O.",
              "keyPoints": [
                "1. Khái niệm",
                "2. Cách biểu diễn công thức phân tử hợp chất hữu cơ"
              ]
            },
            {
              "id": "b12-m2",
              "sectionTitle": "II. Lập công thức phân tử hợp chất hữu cơ",
              "content": "Phương pháp phổ khối lượng được sử dụng để xác định khối lượng phân tử các hợp chất hữu cơ.\nTrong máy khối phổ, chất nghiên cứu bị bắn phá bởi một dòng electron tạo ra các mảnh ion. Ví dụ:\nMảnh ion [M+] được gọi là mảnh ion phân tử. Giá trị m/z của mỗi mảnh ion và hàm lượng tương đối của chúng được thể hiện trên phổ khối lượng.\nĐối với các hợp chất đơn giản, thường mảnh có giá trị m/z lớn nhất ứng với mảnh ion phân tử [M+] và giá trị này bằng giá trị phân tử khối của chất nghiên cứu.\nMột hợp chất hữu cơ có công thức phân tử là CxHyOz. Thiết lập công thức đơn giản nhất bằng cách lập tỉ lệ x : y : z ở dạng số nguyên tối giản p : q : r.\nSinh học\nPhân tích định lượng, ta được tỉ lệ phần trăm khối lượng các nguyên tố trong phân tử.\nx : y : z = : :  = p : q : r\nTừ đó thiết lập được công thức đơn giản nhất: CpHqOr.\nMối quan hệ giữa công thức phân tử và công thức đơn giản nhất:\nCxHyOz = (CpHqOr)n\nTrong đó: p, q, r là các số nguyên tối giản; x, y, z, n là các số nguyên dương.\nKhi biết phân tử khối, xác định được giá trị n, từ đó suy ra công thức phân tử.",
              "keyPoints": [
                "1. Xác định phân tử khối bằng phương pháp phổ khối lượng",
                "2. Lập công thức phân tử hợp chất hữu cơ"
              ]
            }
          ],
          "practiceQuestions": [
            {
              "id": "b12-lt1",
              "question": "Hợp chất hữu cơ là",
              "hint": "Hợp chất hữu cơ là hợp chất của carbon nhưng loại trừ một số hợp chất vô cơ quen thuộc như CO, CO₂, muối carbonate, cyanide, carbide."
            },
            {
              "id": "b12-lt2",
              "question": "Nhóm chức là",
              "hint": "Nhóm chức quyết định tính chất hóa học đặc trưng, ví dụ −OH của alcohol hay −COOH của carboxylic acid."
            },
            {
              "id": "b12-lt3",
              "question": "Phương pháp chưng cất dùng để tách các chất",
              "hint": "Chưng cất dựa trên sự khác nhau về nhiệt độ sôi: chất dễ bay hơi hơn sẽ tách ra trước rồi được ngưng tụ."
            },
            {
              "id": "b12-lt4",
              "question": "Phương pháp chiết dựa trên",
              "hint": "Chất tan tốt hơn trong dung môi nào sẽ chuyển sang lớp dung môi đó, sau đó tách hai lớp bằng phễu chiết."
            }
          ]
        }
      },
      {
        "id": "bai-13",
        "title": "Bài 13: Thuyết cấu tạo hoá học và công thức cấu tạo hợp chất hữu cơ",
        "summary": "Thuyết cấu tạo hoá học gồm các luận điểm chính sau:\nLuận điểm 1: Trong phân tử hợp chất hữu cơ, các nguyên tử liên kết với nhau theo đúng hoá trị và theo một thứ tự nhất định. Thứ tự liên kết đó được gọi là cấu tạo hoá học.",
        "formulae": [
          "Ví dụ: CH3 – CH2 – OH, CH2 = CH – CH = CH2,…"
        ],
        "commonQuestions": [
          {
            "question": "Số đồng phân cấu tạo mạch hở ứng với công thức phân tử C₄H₁₀O là",
            "hint": "Gồm 4 alcohol (butan-1-ol, butan-2-ol, 2-methylpropan-1-ol, 2-methylpropan-2-ol) và 3 ether (diethyl ether, methyl propyl ether, methyl isopropyl ether), tất cả là 7.",
            "sampleAnswer": "7"
          },
          {
            "question": "Hợp chất hữu cơ là",
            "hint": "Hợp chất hữu cơ là hợp chất của carbon nhưng loại trừ một số hợp chất vô cơ quen thuộc như CO, CO₂, muối carbonate, cyanide, carbide.",
            "sampleAnswer": "hợp chất của carbon, trừ CO, CO₂, muối carbonate, cyanide, carbide…"
          },
          {
            "question": "Để tinh chế một chất rắn có lẫn tạp chất, người ta thường dùng phương pháp",
            "hint": "Kết tinh lại dựa trên sự khác nhau về độ tan theo nhiệt độ: chất cần tinh chế kết tinh trước, tạp chất còn lại trong dung dịch.",
            "sampleAnswer": "kết tinh"
          }
        ],
        "textbook": {
          "pageRange": "",
          "objectives": [],
          "sections": [
            {
              "id": "b13-m1",
              "sectionTitle": "I. Thuyết cấu tạo hoá học",
              "content": "Thuyết cấu tạo hoá học gồm các luận điểm chính sau:\nLuận điểm 1: Trong phân tử hợp chất hữu cơ, các nguyên tử liên kết với nhau theo đúng hoá trị và theo một thứ tự nhất định. Thứ tự liên kết đó được gọi là cấu tạo hoá học. Sự thay đổi thứ tự liên kết đó sẽ tạo ra chất khác.\nVí dụ:\nEthanol và dimethyl ether đều có công thức phân tử C2H6O nhưng có tính chất vật lí và tính chất hoá học khác nhau do chúng có cấu tạo khác nhau. Cụ thể:\n+ Ethanol: CH3 – CH2 – OH; nhiệt độ sôi 78,3 oC; tan vô hạn trong nước; tác dụng với sodium giải phóng hydrogen.\n+ Dimethyl ether: CH3 – O – CH3; nhiệt độ sôi – 24,9 oC; ít tan trong nước; không tác dụng với sodium.\nLuận điểm 2: Trong phân tử chất hữu cơ, carbon có hoá trị IV. Các nguyên tử carbon không những liên kết với nguyên tử của các nguyên tố khác mà còn có thể liên kết trực tiếp với nhau tạo thành mạch carbon (mạch hở không phân nhánh, mạch hở phân nhánh hoặc mạch vòng). Ví dụ:\nLuận điểm 3: Tính chất của các chất phụ thuộc vào thành phần phân tử (bản chất và số lượng các nguyên tử) và cấu tạo hoá học. Các nguyên tử trong phân tử có ảnh hưởng qua lại lẫn nhau.\nVí dụ:\n+ Phụ thuộc thành phần phân tử: CH4 là chất khí dễ cháy, CCl4 là chất lỏng không cháy; CH3Cl là chất khí không có tác dụng gây mê, còn CHCl3 là chất lỏng có tác dụng gây mê.\n+ Phụ thuộc cấu tạo hóa học: CH3CH2OH và CH3OCH3 khác nhau cả về tính chất hóa học.\nThuyết cấu tạo hoá học giúp giải thích được hiện tượng đồng phân, hiện tượng đồng đẳng trong hoá học hữu cơ."
            },
            {
              "id": "b13-m2",
              "sectionTitle": "II. Công thức cấu tạo",
              "content": "Công thức biểu diễn cách liên kết và thứ tự liên kết giữa các nguyên tử trong phân tử được gọi là công thức cấu tạo.\n- Công thức cấu tạo đầy đủ: Biểu diễn trên mặt phẳng giấy tất cả các liên kết.\nVí dụ: Công thức cấu tạo đầy đủ của rượu etylic (C2H5OH).\n- Công thức cấu tạo thu gọn\n+ Dạng 1: Các nguyên tử, nhóm nguyên tử cùng liên kết với một nguyên tử carbon được viết thành một nhóm.\nVí dụ: CH3 – CH2 – OH, CH2 = CH – CH = CH2,…\n+ Dạng 2: Chỉ biểu diễn liên kết giữa các nguyên tử carbon và với nhóm chức.\n+ Mỗi đầu một đoạn thẳng hoặc điểm gấp khúc ứng với một nguyên tử carbon.\n+ Không biểu thị số nguyên tử hydrogen liên kết với mỗi nguyên tử carbon.\nVí dụ:",
              "keyPoints": [
                "1. Khái niệm",
                "2. Cách biểu diễn cấu tạo phân tử hợp chất hữu cơ"
              ]
            },
            {
              "id": "b13-m3",
              "sectionTitle": "III. Đồng phân",
              "content": "Những hợp chất hữu cơ khác nhau nhưng có cùng công thức phân tử được gọi là các chất đồng phân của nhau.\n- Các đồng phân có tính chất hoá học khác nhau do chúng có cấu tạo hoá học khác nhau.\n- Ứng với một công thức phân tử có thể có các đồng phân cấu tạo về mạch carbon, loại nhóm chức, vị trí nhóm chức.\nVí dụ:\n- Ngoài đồng phân cấu tạo, các hợp chất hữu cơ còn có đồng phân hình học và đồng phân quang học."
            },
            {
              "id": "b13-m4",
              "sectionTitle": "IV. Đồng đẳng",
              "content": "Các chất hữu cơ có tính chất hoá học tương tự nhau và thành phần phân tử hơn kém nhau một hay nhiều nhóm CH2 được gọi là các chất đồng đẳng của nhau, chúng hợp thành một dãy đồng đẳng.\nVí dụ: Dãy đồng đẳng của methane: CH4, CH3 – CH3, CH3 – CH2 – CH3,…\n⇒ Công thức chung là CnH2n + 2."
            }
          ],
          "practiceQuestions": [
            {
              "id": "b13-lt1",
              "question": "Hợp chất hữu cơ là",
              "hint": "Hợp chất hữu cơ là hợp chất của carbon nhưng loại trừ một số hợp chất vô cơ quen thuộc như CO, CO₂, muối carbonate, cyanide, carbide."
            },
            {
              "id": "b13-lt2",
              "question": "Nhóm chức là",
              "hint": "Nhóm chức quyết định tính chất hóa học đặc trưng, ví dụ −OH của alcohol hay −COOH của carboxylic acid."
            },
            {
              "id": "b13-lt3",
              "question": "Phương pháp chưng cất dùng để tách các chất",
              "hint": "Chưng cất dựa trên sự khác nhau về nhiệt độ sôi: chất dễ bay hơi hơn sẽ tách ra trước rồi được ngưng tụ."
            },
            {
              "id": "b13-lt4",
              "question": "Phương pháp chiết dựa trên",
              "hint": "Chất tan tốt hơn trong dung môi nào sẽ chuyển sang lớp dung môi đó, sau đó tách hai lớp bằng phễu chiết."
            }
          ]
        }
      },
      {
        "id": "bai-14",
        "title": "Bài 14: Ôn tập công thức và cấu tạo phân tử hợp chất hữu cơ",
        "summary": "Chưng cất là phương pháp tách chất dựa vào sự khác nhau về nhiệt độ sôi của các chất trong hỗn hợp ở một áp suất nhất định. Chiết là phương pháp dùng tách biệt và tinh chế hỗn hợp các chất dựa vào sự hoà tan khác nhau của chúng trong hai dung môi không trộn lẫn vào nhau.",
        "formulae": [
          "CpHqOr",
          "CxHyOz = (CpHqOr)n"
        ],
        "commonQuestions": [
          {
            "question": "Số đồng phân cấu tạo mạch hở ứng với công thức phân tử C₄H₁₀O là",
            "hint": "Gồm 4 alcohol (butan-1-ol, butan-2-ol, 2-methylpropan-1-ol, 2-methylpropan-2-ol) và 3 ether (diethyl ether, methyl propyl ether, methyl isopropyl ether), tất cả là 7.",
            "sampleAnswer": "7"
          },
          {
            "question": "Hợp chất hữu cơ là",
            "hint": "Hợp chất hữu cơ là hợp chất của carbon nhưng loại trừ một số hợp chất vô cơ quen thuộc như CO, CO₂, muối carbonate, cyanide, carbide.",
            "sampleAnswer": "hợp chất của carbon, trừ CO, CO₂, muối carbonate, cyanide, carbide…"
          },
          {
            "question": "Để tinh chế một chất rắn có lẫn tạp chất, người ta thường dùng phương pháp",
            "hint": "Kết tinh lại dựa trên sự khác nhau về độ tan theo nhiệt độ: chất cần tinh chế kết tinh trước, tạp chất còn lại trong dung dịch.",
            "sampleAnswer": "kết tinh"
          }
        ],
        "textbook": {
          "pageRange": "",
          "objectives": [],
          "sections": [
            {
              "id": "b14-m1",
              "sectionTitle": "Mở đầu",
              "content": "HỆ THỐNG  HOÁ KIẾN THỨC"
            },
            {
              "id": "b14-m2",
              "sectionTitle": "I. Phương pháp tách và tinh chế hợp chất hữu cơ",
              "content": "Chưng cất\nChiết\nKết tinh\nSắc kí cột\nNguyên tắc\nChưng cất là phương pháp tách chất dựa vào sự khác nhau về nhiệt độ sôi của các chất trong hỗn hợp ở một áp suất nhất định.\nChiết là phương pháp dùng tách biệt và tinh chế hỗn hợp các chất dựa vào sự hoà tan khác nhau của chúng trong hai dung môi không trộn lẫn vào nhau.\nKết tinh là phương pháp tách biệt và tinh chế hỗn hợp các chất rắn dựa vào độ tan khác nhau và sự thay đổi độ tan của chúng theo nhiệt độ.\nSắc kí cột là phương pháp tách biệt và tinh chế hỗn hợp các chất dựa vào sự phân bố khác\nnhau của chúng giữa pha động và pha tĩnh.\nCách tiến hành\nKhi nâng nhiệt độ của hỗn hợp gồm nhiều chất lỏng có nhiệt độ sôi khác nhau, thì chất nào có nhiệt độ sôi thấp hơn sẽ bay ra trước.\nDùng sinh hàn lạnh sẽ thu được chất lỏng.\nDùng một dung môi thích hợp để chuyển chất cần tách sang pha lỏng (gọi là dịch chiết). Tách lấy dịch chiết giải phóng dung môi sẽ thu được chất cần tách.\nDùng một dung môi thích hợp hoà tan chất cần tinh chế ở nhiệt độ cao tạo dung dịch bão hoà. Sau đó làm lạnh, chất rắn sẽ kết tinh, lọc, thu được sản phẩm.\nCho hỗn hợp cần tách lên cột sắc kí, sau đó cho dung môi thích hợp chảy liên tục qua cột sắc kí. Thu các chất hữu cơ được tách ra ở từng phân đoạn khác nhau sau khi đi ra khỏi cột sắc kí. Loại bỏ dung môi để thu được chất cần tách.\nVận dụng\nChưng cất thường: để tách các chất lỏng có nhiệt độ sôi khác nhau nhiều.\nPhương pháp chiết lỏng – lỏng: để tách lấy chất hữu cơ khi nó ở dạng hỗn hợp lỏng.\nPhương pháp chiết lỏng – rắn: để tách lấy chất trong hỗn hợp rắn.\nPhương pháp kết tinh để tách và tinh chế các chất rắn.\nSử dụng phương pháp sắc kí có thể tách được hỗn hợp chứa nhiều chất khác nhau."
            },
            {
              "id": "b14-m3",
              "sectionTitle": "II. Công thức phân tử hợp chất hữu cơ",
              "content": "Công thức tổng quát\nCông thức đơn giản nhất\nCho biết các nguyên tố có trong hợp chất hữu cơ\nCho biết tỉ lệ tối giản của số nguyên tử các nguyên tố có trong phân tử\nCxHyOz\nCpHqOr\nCxHyOz = (CpHqOr)n\nTrong đó: p, q, r là các số nguyên tối giản; x, y, z, n là các số nguyên dương."
            },
            {
              "id": "b14-m4",
              "sectionTitle": "III. Cấu tạo phân tử hợp chất hữu cơ",
              "content": "- Trong phân tử hợp chất hữu cơ, các nguyên tử liên kết với nhau theo đúng hoá trị và theo một thứ tự nhất định. Thứ tự liên kết đó được gọi là cấu tạo  hoá học. Công thức biểu diễn cách liên kết và thứ tự liên kết giữa các nguyên tử trong phân tử gọi là công thức cấu tạo.\n- Đồng phân cấu tạo gồm đồng phân mạch carbon, đồng phân nhóm chức và đồng phân vị trí nhóm chức.\n- Đồng đẳng là những hợp chất có tính chất hoá học tương tự nhau nhưng có thành phần phân tử hơn kém nhau một hay nhiều nhóm CH2."
            }
          ],
          "practiceQuestions": [
            {
              "id": "b14-lt1",
              "question": "Hợp chất hữu cơ là",
              "hint": "Hợp chất hữu cơ là hợp chất của carbon nhưng loại trừ một số hợp chất vô cơ quen thuộc như CO, CO₂, muối carbonate, cyanide, carbide."
            },
            {
              "id": "b14-lt2",
              "question": "Nhóm chức là",
              "hint": "Nhóm chức quyết định tính chất hóa học đặc trưng, ví dụ −OH của alcohol hay −COOH của carboxylic acid."
            },
            {
              "id": "b14-lt3",
              "question": "Phương pháp chưng cất dùng để tách các chất",
              "hint": "Chưng cất dựa trên sự khác nhau về nhiệt độ sôi: chất dễ bay hơi hơn sẽ tách ra trước rồi được ngưng tụ."
            },
            {
              "id": "b14-lt4",
              "question": "Phương pháp chiết dựa trên",
              "hint": "Chất tan tốt hơn trong dung môi nào sẽ chuyển sang lớp dung môi đó, sau đó tách hai lớp bằng phễu chiết."
            }
          ]
        }
      }
    ]
  },
  {
    "id": "chuong-4",
    "title": "Chương 4: Hydrocarbon",
    "lessons": [
      {
        "id": "bai-15",
        "title": "Bài 15: Alkane",
        "summary": "Alkane là các hydrocarbon mạch hở chỉ chứa liên kết đơn C-C và C-H trong phân tử. Công thức chung: CnH2n+2 (n ≥ 1). Phản ứng đặc trưng của Alkane là phản ứng thế halogen (thế ưu tiên vào carbon bậc cao hơn - quy tắc thế). Ngoài ra alkane còn tham gia phản ứng cracking, phản ứng oxi hóa (đốt cháy).",
        "formulae": [
          "Công thức chung của Alkane: CnH2n+2 (n ≥ 1)",
          "Phản ứng thế halogen (chlorine hoá): CnH2n+2 + Cl2 -(as)→ CnH2n+1Cl + HCl",
          "Phản ứng đốt cháy: CnH2n+2 + (3n+1)/2 O2 → nCO2 + (n+1)H2O  (Lưu ý: nH2O > nCO2 và n_alkane = nH2O - nCO2)"
        ],
        "commonQuestions": [
          {
            "question": "Khi tiến hành cho propane (CH3-CH2-CH3) tác dụng với chlorine (Cl2) theo tỉ lệ mol 1:1 ngoài ánh sáng, hãy xác định sản phẩm thế chính là gì và giải thích vì sao.",
            "hint": "Hãy nhớ lại quy tắc thế halogen vào alkane: Halogen ưu tiên thế vào nguyên tử hydrogen liên kết với nguyên tử carbon bậc cao hơn (carbon có ít hydrogen hơn). Trong propane, có 2 bậc carbon là bậc 1 (ở hai đầu -CH3) và bậc 2 (ở giữa -CH2-). Carbon nào có bậc cao hơn?",
            "sampleAnswer": "Trong phân tử propane (CH3-CH2-CH3), nguyên tử carbon ở giữa là carbon bậc 2, còn hai nguyên tử carbon ở đầu là carbon bậc 1.\nTheo quy tắc thế của alkane, nguyên tử chlorine sẽ ưu tiên thế vào nguyên tử hydrogen liên kết với carbon bậc cao hơn (bậc 2) để tạo sản phẩm chính bền vững hơn.\nDo đó:\n- Sản phẩm chính: 2-chloropropane (CH3-CHCl-CH3) (khoảng 55-60%)\n- Sản phẩm phụ: 1-chloropropane (CH3-CH2-CH2Cl)"
          }
        ],
        "textbook": {
          "pageRange": "Trang 86 – 98",
          "objectives": [
            "Nêu được khái niệm và công thức chung của alkane.",
            "Gọi được tên và viết được CTCT của các alkane đơn giản.",
            "Trình bày được tính chất hóa học đặc trưng của alkane: phản ứng thế, cracking và đốt cháy.",
            "Giải thích được quy tắc ưu tiên thế halogen."
          ],
          "sections": [
            {
              "id": "b6-s1",
              "sectionTitle": "I. Đồng đẳng, đồng phân và danh pháp",
              "content": "Định nghĩa:\nAlkane (hydrocarbon no, mạch hở) là hydrocarbon chỉ chứa liên kết đơn C–C.\nCông thức chung: CₙH₂ₙ₊₂ (n ≥ 1)\n\nDãy đồng đẳng:\nCH₄ (methane, n=1) → C₂H₆ (ethane) → C₃H₈ (propane) → C₄H₁₀ (butane) → ...\n\nDanh pháp IUPAC:\n• Chọn mạch carbon dài nhất làm mạch chính.\n• Đánh số từ đầu gần nhánh nhất.\n• Tên = Tên nhánh + Tên mạch chính + \"ane\"\n\nVí dụ: CH₃–CH(CH₃)–CH₃ → 2-methylpropane (isobutane)\n\nĐồng phân cấu trúc:\n• n-butane: CH₃–CH₂–CH₂–CH₃ (mạch thẳng)\n• 2-methylpropane: (CH₃)₃CH (mạch nhánh)",
              "keyPoints": [
                "Công thức chung: CₙH₂ₙ₊₂.",
                "Từ C₄ trở lên có đồng phân mạch carbon.",
                "Danh pháp: nhánh + tên mạch chính + ane."
              ],
              "imagePrompt": "Alkane homologous series methane ethane propane butane molecular models, ball and stick 3D models, clean chemistry educational illustration, white background, labeled formulas",
              "imageAlt": "Dãy đồng đẳng alkane từ methane đến butane"
            },
            {
              "id": "b6-s2",
              "sectionTitle": "II. Tính chất vật lí và hóa học",
              "content": "Tính chất vật lí:\n• C₁–C₄: Chất khí (ở điều kiện thường).\n• C₅–C₁₇: Chất lỏng.\n• C₁₈ trở lên: Chất rắn.\n• Không màu, không tan trong nước, nhẹ hơn nước.\n• Dễ cháy → tỏa nhiệt lớn.\n\nTính chất hóa học:\nAlkane khá trơ do chỉ có liên kết σ bền. Phản ứng đặc trưng:\n\n① Phản ứng thế (halogen hóa):\nCₙH₂ₙ₊₂ + Cl₂ →(as) CₙH₂ₙ₊₁Cl + HCl\nQuy tắc: Cl ưu tiên thế vào C bậc cao hơn.\n\n② Phản ứng cracking (bẻ gãy mạch C):\nC₄H₁₀ →(t°, xt) C₂H₄ + C₂H₆ (hoặc CH₄ + C₃H₆...)\n\n③ Phản ứng đốt cháy:\nCₙH₂ₙ₊₂ + (3n+1)/2 O₂ → n CO₂ + (n+1) H₂O\nNhận biết: nH₂O > nCO₂; nalkane = nH₂O − nCO₂",
              "keyPoints": [
                "Phản ứng đặc trưng của alkane: phản ứng thế (SR).",
                "Halogen thế vào C bậc cao hơn → sản phẩm chính.",
                "Đốt cháy: nH₂O > nCO₂ → nhận biết alkane.",
                "Cracking: tạo alkene và alkane nhỏ hơn."
              ],
              "formulae": [
                "CₙH₂ₙ₊₂ + Cl₂ →(ánh sáng) CₙH₂ₙ₊₁Cl + HCl",
                "CₙH₂ₙ₊₂ + (3n+1)/2 O₂ → nCO₂ + (n+1)H₂O",
                "Nhận biết alkane: nH₂O > nCO₂, nalkane = nH₂O − nCO₂"
              ],
              "examples": [
                {
                  "title": "Xác định sản phẩm chính phản ứng thế",
                  "problem": "Cho propane tác dụng với Cl₂ (tỉ lệ 1:1, ánh sáng). Xác định sản phẩm chính.",
                  "solution": "CH₃–CH₂–CH₃ có:\n• 2 C bậc 1 (hai đầu, 6H)\n• 1 C bậc 2 (giữa, 2H)\nCl ưu tiên thế vào C bậc 2:\nSản phẩm chính: CH₃–CHCl–CH₃ (2-chloropropane)\nSản phẩm phụ: CH₃–CH₂–CH₂Cl (1-chloropropane)"
                }
              ]
            }
          ],
          "practiceQuestions": [
            {
              "id": "b6-q1",
              "question": "Đốt cháy hoàn toàn hỗn hợp 2 alkane liên tiếp trong dãy đồng đẳng thu được 7,437 lít CO₂ (đkc) và 7,2 g H₂O. Xác định CTPT của hai alkane.",
              "hint": "nCO₂ = 0,3 mol, nH₂O = 0,4 mol. Alkane: nH₂O > nCO₂. nalkane = nH₂O − nCO₂ = 0,1 mol. C_trung bình = nCO₂/nalkane = 3.",
              "answer": "nCO₂ = 0,3 mol; nH₂O = 0,4 mol\nnalkane = nH₂O − nCO₂ = 0,1 mol\nC̄ = 0,3/0,1 = 3 (giữa 2 và 4)\n→ Hai alkane: C₂H₆ (ethane) và C₃H₈ (propane)."
            },
            {
              "id": "b6-q2",
              "question": "Viết tất cả các đồng phân alkane có CTPT C₅H₁₂ và gọi tên theo danh pháp IUPAC.",
              "answer": "① n-pentane: CH₃CH₂CH₂CH₂CH₃\n② 2-methylbutane: CH₃CH(CH₃)CH₂CH₃\n③ 2,2-dimethylpropane: C(CH₃)₄ (neopentane)"
            }
          ]
        }
      },
      {
        "id": "bai-16",
        "title": "Bài 16: Hydrocarbon không no",
        "summary": "Hydrocarbon không no là những hydrocarbon trong phân tử có chứa liên kết đôi, liên kết ba (gọi chung là liên kết bội) hoặc đồng thời cả liên kết đôi và liên kết ba. Hydrocarbon không no\nAlkene\nAlkyne\nKhái niệm\nAlkene là các hydrocarbon không no, mạch hở, có chứa một liên kết đôi >C = C< trong phân tử\nAlkyne là các hydrocarbon không no, mạch hở có chứa một liên kết ba − C≡C – trong phân tử\nCông thức chung\nCnH2n (n ≥ 2)\nCnH2n - 2 (n ≥ 2)\nVí dụ\nC2H4, C3H6, C4H8 ….",
        "formulae": [
          "Alkene là các hydrocarbon không no, mạch hở, có chứa một liên kết đôi >C = C< trong phân tử",
          "CH2 = CH – CH2 – CH3",
          "CH3 – CH = CH – CH3",
          "CH2 = CH2 + H2   CH3 – CH3",
          "CH ≡ CH + H2  CH2 = CH2",
          "CH2 = CH2 + Br2 → BrCH2 – CH2Br"
        ],
        "commonQuestions": [
          {
            "question": "Nhận định về toluene C₆H₅CH₃.",
            "hint": "Nhóm −CH₃ đẩy electron nên hoạt hóa vòng và định hướng ortho, para. Nhánh methyl bị KMnO₄ nóng oxi hóa thành nhóm −COOH, còn vòng benzene không cộng Br₂ ở điều kiện thường.",
            "sampleAnswer": ""
          },
          {
            "question": "Hỗn hợp X gồm ethylene và acetylene. Dẫn 0,3 mol X qua dung dịch bromine dư thấy có 0,5 mol Br₂ phản ứng. Phần trăm thể tích acetylene trong X là",
            "hint": "Gọi x, y là số mol C₂H₄ và C₂H₂: x + y = 0,3 và x + 2y = 0,5 (acetylene cộng 2 Br₂). Giải được y = 0,2 → %V = 0,2/0,3 × 100% ≈ 66,67%.",
            "sampleAnswer": "66,67%"
          },
          {
            "question": "Cho benzene vào nước bromine rồi lắc đều. Hiện tượng là",
            "hint": "Benzene không cộng Br₂ ở điều kiện thường; nó chỉ hòa tan bromine nên màu chuyển sang lớp benzene mà không mất màu do phản ứng.",
            "sampleAnswer": "không có hiện tượng hóa học, chỉ tách lớp"
          }
        ],
        "textbook": {
          "pageRange": "",
          "objectives": [],
          "sections": [
            {
              "id": "b16-m1",
              "sectionTitle": "I. Khái niệm, đồng phân, danh pháp",
              "content": "Hydrocarbon không no là những hydrocarbon trong phân tử có chứa liên kết đôi, liên kết ba (gọi chung là liên kết bội) hoặc đồng thời cả liên kết đôi và liên kết ba.\nHydrocarbon không no\nAlkene\nAlkyne\nKhái niệm\nAlkene là các hydrocarbon không no, mạch hở, có chứa một liên kết đôi >C = C< trong phân tử\nAlkyne là các hydrocarbon không no, mạch hở có chứa một liên kết ba − C≡C – trong phân tử\nCông thức chung\nCnH2n (n ≥ 2)\nCnH2n - 2 (n ≥ 2)\nVí dụ\nC2H4, C3H6, C4H8 ….\nC2H2, C3H4, C4H6 ….\na) Đồng phân cấu tạo\nAlkene và alkyne có hai loại đồng phân cấu tạo là đồng phân vị trí liên kết bội (từ C4 trở lên) và đồng phân mạch carbon (từ C4 trở lên với alkene và từ C5 trở lên với alkyne).\nVí dụ: Alkene C4H8 có 3 đồng phân cấu tạo:\nCH2 = CH – CH2 – CH3\nCH3 – CH = CH – CH3\nb) Đồng phân hình học\nTrong phân tử alkene nếu mỗi nguyên tử carbon của liên kết đôi liên kết với hai nguyên tử hoặc hai nhóm nguyên tử khác nhau thì sẽ có đồng phân hình học.\n+ Nếu mạch chính nằm ở cùng một phía của liên kết đôi, gọi là đồng phân hình học dạng cis −.\n+ Nếu mạch chính nằm ở hai phía khác nhau của liên kết đôi, gọi là đồng phân hình học dạng trans−.\nVí dụ: phân tử but – 2 − ene có hai đồng phân hình học dạng cis− và dạng trans−.\nTên theo danh pháp thay thế của alkene và alkyne:\nPhần nền - vị trí liên kết bội - ene hoặc yne\nLưu ý:\n+ Chọn mạch carbon dài nhất, có nhiều nhánh nhất và có chứa liên kết bội làm mạch chính.\n+ Đánh số sao cho nguyên tử carbon có liên kết bội (đôi hoặc ba) có chỉ số nhỏ nhất (đánh số mạch chính từ đầu gần liên kết bội).\n+ Dùng chữ số (1, 2, 3,...) và gạch nối (-) để chì vị trí liên kết bội (nếu chỉ có một vị trí duy nhất của liên kết bội thì không cần).\n+ Nếu alkene hoặc alkyne có nhánh thì cần thêm vị trí nhánh và tên nhánh trước tên của alkene và alkyne tương ứng với mạch chính.",
              "keyPoints": [
                "1. Khái niệm và công thức chung của alkene, alkyne",
                "2. Đồng phân",
                "3. Danh pháp"
              ]
            },
            {
              "id": "b16-m2",
              "sectionTitle": "II. Đặc điểm cấu tạo của ethylene và acetylene",
              "content": "Phân tử ethylene (C2H4) có 2 nguyên tử carbon và 4 nguyên tử hydrogen đều nằm trên một mặt phẳng. Liên kết đôi C = C gồm 1 liên kết σ và 1 liên kết π.\nPhân tử acetylene (C2H2) có 2 nguyên tử carbon và 2 nguyên tử hydrogen nằm trên một đường thẳng, góc liên kết CCH là 180o. Liên kết ba C ≡ C bao gồm một liên kết liên kết σ và hai liên kết π.",
              "keyPoints": [
                "1. Ethylene",
                "2. Acetylene"
              ]
            },
            {
              "id": "b16-m3",
              "sectionTitle": "III. Tính chất vật lí",
              "content": "Nhiệt độ sôi, nhiệt độ nóng chảy và khối lượng riêng của alkene, alkyne không khác nhiều với alkane tương ứng. Các alkene, alkyne là những hợp chất không có mùi và đều nhẹ hơn nước.\nỞ nhiệt độ thường, phần lớn các alkene và alkyne từ C2 đến C4 ở trạng thái khí, từ C5 trở lên ở trạng thái lỏng hoặc trạng thái rắn. Chúng không tan hoặc rất ít tan trong nước, tan trong một số dung môi hữu cơ.\nTính chất vật lí của một số alkene, alkyne được thể hiện trong bảng sau:"
            },
            {
              "id": "b16-m4",
              "sectionTitle": "IV. Tính chất  hoá học của alkene, alkyne",
              "content": "Các liên kết ℼ ở liên kết đôi (alkene) và liên kết ba (alkyne) kém bền vững, dễ bị đứt ra để tạo thành các liên kết mới. Vì vậy, các liên kết bội là trung tâm gây ra các phản ứng đặc trưng của hydrocarbon không no: phản ứng cộng, phản ứng trùng hợp, phản ứng oxi hoá.\na) Phản ứng cộng hydrogen\nHydrogen hoá alkene thu được alkane tương ứng. Phản ứng thường được thực hiện dưới áp suất cao, nhiệt độ cao và có mặt các chất xúc tác kim loại như platinum, nickel và palladium.\nVí dụ:\nCH2 = CH2 + H2   CH3 – CH3\nHydrogen hoá alkyne, tuỳ vào điều kiện áp suất, nhiệt độ và xúc tác, có thể nhận được sản phẩm là alkene, alkane.\nVí dụ:\nCH ≡ CH + H2  CH2 = CH2\nCH ≡ CH + 2H2  CH3 – CH3\nb) Phản ứng cộng halogen\nKhi cho alkene hoặc alkyne phản ứng với dung dịch bromine, dung dịch sẽ bị mất màu.\nVí dụ:\nCH2 = CH2 + Br2 → BrCH2 – CH2Br\nCH ≡ CH + 2Br2 → Br2HC – CHBr2\nc) Phản ứng cộng hydrogen halide\nPhản ứng cộng hydrogen halide vào alkene và alkyne tạo thành halogenoalkane tương ứng.\nCH2 = CH2 + HBr → CH3 – CH2Br\nCH ≡ CH + HBr → CH2 = CHBr\nCH ≡ CH + 2HBr → CH3 – CHBr2\nd) Phản ứng cộng nước (hydrate hoá)\n- Phản ứng cộng nước vào alkene hay còn gọi là hydrate hoá alkene tạo ra alcohol.\nPhản ứng thường sử dụng xúc tác phosphoric acid hoặc sulfuric acid.\nVí dụ:\nCH2 = CH2 + H2O  CH3 – CH2OH\nPhản ứng này được thực hiện ở quy mô công nghiệp để sản xuất ethanol.\n- Phản ứng cộng một phân tử HOH vào alkyne diễn ra khi có mặt của xúc tác là muối Hg(II) trong H2SO4, tạo thành aldehyde hoặc ketone.\nVí dụ:\nCH ≡ CH + H2O  CH3 – CH = O\nCH3C = CH + H2O  CH3 – CO – CH3\nChú ý:\nPhản ứng cộng acid, cộng nước vào alkyne cũng tuân theo quy tắc Markovnikov: Phản ứng cộng một tác nhân không đối xứng HX như HBr, HCl, HI, HOH, … vào liên kết bội, nguyên tử hydrogen sẽ ưu tiên cộng vào nguyên tử carbon có nhiều hydrogen hơn và X sẽ cộng vào nguyên tử carbon có ít hydrogen hơn.\nPhản ứng trùng hợp alkene là quá trình cộng hợp liên tiếp nhiều phân tử alkene giống nhau hoặc tương tự nhau (gọi là monomer) thành phân tử có phân tử khối lớn (gọi là polymer).\nVí dụ: Phản ứng trùng hợp ethylene tạo thành polyethylene (PE):\nn được gọi là hệ số trùng hợp.\nPhản ứng trùng hợp alkene có ứng dụng quan trọng để sản xuất vật liệu polymer.\nCác alk – 1 – yne có thể phản ứng với AgNO3/ NH3 tạo kết tủa.\nVí dụ:\nCH ≡ CH + 2AgNO3 + 2NH3 → Ag – C ≡ C – Ag↓ + 2NH4NO3\nPhản ứng này dùng để nhận biết các alkyne có liên kết ba ở đầu mạch.\na) Phản ứng oxi hoá không hoàn toàn\nCác alkene và alkyne có khả năng làm mất màu dung dịch thuốc tím, đây là phản ứng oxi hoá không hoàn toàn.\nVí dụ:\n3CH2 = CH2 + 2KMnO4 + 4H2O → 3HO – CH2 – CH2 – OH + 2MnO2 + 2KOH\nPhản ứng oxi hoá không hoàn toàn alkene được ứng dụng để sản xuất các dẫn xuất chứa oxygen của hydrocarbon trong công nghiệp.\nb) Phản ứng cháy\nAlkene và alkyne đều dễ cháy khi có mặt oxygen, phản ứng toả nhiều nhiệt. Tổng quát:",
              "keyPoints": [
                "1. Phản ứng cộng",
                "2. Phản ứng trùng hợp của alkene",
                "3. Phản ứng của alk – 1 – yne với AgNO3 trong NH3",
                "4. Phản ứng oxi hoá"
              ]
            },
            {
              "id": "b16-m5",
              "sectionTitle": "V. Điều chế",
              "content": "Trong phòng thí nghiệm, ethylene được điều chế từ phản ứng dehydrate ethanol:\nC2H5OH H2C2H4 + H2O\nTrong công nghiệp, alkene từ C2 đến C4 được điều chế từ quá trình cracking alkane trong các nhà máy lọc dầu.\nAcetylene được điều chế từ phản ứng giữa calcium carbide với nước:\nCaC2 + 2H2O → C2H2 + Ca(OH)2\nNgoài ra, acetylene còn được điều chế bằng cách nhiệt phân methane ở nhiệt độ 1500 oC, làm lạnh nhanh để tách acetylene ra khỏi hỗn hợp với hydrogen:\n2CH4 C2H2 + 3H2",
              "keyPoints": [
                "1. Alkene",
                "2. Alkyne"
              ]
            },
            {
              "id": "b16-m6",
              "sectionTitle": "VI. Ứng dụng",
              "content": "Một số ứng dụng của alkene và alkyne được thể hiện trong sơ đồ sau:"
            }
          ],
          "practiceQuestions": [
            {
              "id": "b16-lt1",
              "question": "Công thức chung của dãy đồng đẳng alkane là",
              "hint": "Alkane là hydrocarbon no, mạch hở, công thức CₙH₂ₙ₊₂ với n ≥ 1."
            },
            {
              "id": "b16-lt2",
              "question": "Phản ứng đặc trưng của alkane là",
              "hint": "Alkane chỉ có liên kết đơn bền nên đặc trưng bởi phản ứng thế nguyên tử H bằng halogen khi có ánh sáng."
            },
            {
              "id": "b16-lt3",
              "question": "Phân tử alkene chứa",
              "hint": "Alkene là hydrocarbon không no, mạch hở, có đúng một liên kết đôi C=C, công thức CₙH₂ₙ (n ≥ 2)."
            },
            {
              "id": "b16-lt4",
              "question": "Thuốc thử dùng để phân biệt ethylene với ethane là",
              "hint": "Ethylene cộng vào Br₂ làm mất màu nước bromine ngay ở điều kiện thường, còn ethane thì không."
            }
          ]
        }
      },
      {
        "id": "bai-17",
        "title": "Bài 17: Arene (hydrocarbon thơm)",
        "summary": "Arene hay còn gọi là hydrocarbon thơm là những hydrocarbon trong phân tử có chứa một hay nhiều vòng benzene. Benzene có công thức C6H6 là một hydrocarbon thơm đơn giản và điển hình nhất.",
        "formulae": [
          "C6H5COOK + HCl → C6H5COOH + KCl"
        ],
        "commonQuestions": [
          {
            "question": "Nhận định về toluene C₆H₅CH₃.",
            "hint": "Nhóm −CH₃ đẩy electron nên hoạt hóa vòng và định hướng ortho, para. Nhánh methyl bị KMnO₄ nóng oxi hóa thành nhóm −COOH, còn vòng benzene không cộng Br₂ ở điều kiện thường.",
            "sampleAnswer": ""
          },
          {
            "question": "Hỗn hợp X gồm ethylene và acetylene. Dẫn 0,3 mol X qua dung dịch bromine dư thấy có 0,5 mol Br₂ phản ứng. Phần trăm thể tích acetylene trong X là",
            "hint": "Gọi x, y là số mol C₂H₄ và C₂H₂: x + y = 0,3 và x + 2y = 0,5 (acetylene cộng 2 Br₂). Giải được y = 0,2 → %V = 0,2/0,3 × 100% ≈ 66,67%.",
            "sampleAnswer": "66,67%"
          },
          {
            "question": "Cho benzene vào nước bromine rồi lắc đều. Hiện tượng là",
            "hint": "Benzene không cộng Br₂ ở điều kiện thường; nó chỉ hòa tan bromine nên màu chuyển sang lớp benzene mà không mất màu do phản ứng.",
            "sampleAnswer": "không có hiện tượng hóa học, chỉ tách lớp"
          }
        ],
        "textbook": {
          "pageRange": "",
          "objectives": [],
          "sections": [
            {
              "id": "b17-m1",
              "sectionTitle": "I. Khái niệm và danh pháp",
              "content": "Arene hay còn gọi là hydrocarbon thơm là những hydrocarbon trong phân tử có chứa một hay nhiều vòng benzene.\nBenzene có công thức C6H6 là một hydrocarbon thơm đơn giản và điển hình nhất.\nBenzene và các đồng đẳng của nó hợp thành dãy đồng đẳng của benzene có công thức chung là CnH2n – 6 (n ≥ 6).\nMột số arene thường gặp có công thức cấu tạo và tên gọi như sau:\nBenzene\nMethylbenzene (toluene)\nVinylbenzene (styrene)\nNaphthalene\n(Chú ý: o-; m-; p- là viết tắt của các từ tương ứng ortho-; meta-; para- chỉ vị trí 2, 3, 4 của nhóm thế thứ hai).\nMột số gốc aryl thường gặp:\nGốc\nCấu tạo\nCông thức\nPhenyl\nC6H5 –\nBenzyl\nC6H5 – CH2 –",
              "keyPoints": [
                "1. Khái niệm",
                "2. Công thức cấu tạo và danh pháp"
              ]
            },
            {
              "id": "b17-m2",
              "sectionTitle": "II. Đặc điểm cấu tạo của benzene",
              "content": "Phân tử benzene có 6 nguyên tử carbon tạo thành hình lục giác đều, tất cả các nguyên tử carbon và hydrogen đều nằm trên một mặt phẳng, các góc liên kết đều bằng 120o, độ dài liên kết carbon – carbon đều bằng 139 pm.\nĐể đơn giản, benzene thường được biểu diễn bởi các kiểu công thức dưới đây:"
            },
            {
              "id": "b17-m3",
              "sectionTitle": "III. Tính chất vật lí và trạng thái tự nhiên",
              "content": "- Benzene, toluene, xylene, styrene ở điều kiện thường là chất lỏng không màu, trong suốt, dễ cháy và có mùi đặc trưng. Naphthalene là chất rắn có màu trắng, có mùi đặc trưng (có thể phát hiện được ở nồng độ thấp).\n- Các arene không phân cực hoặc kém phân cực nên không tan trong nước và thường nhẹ hơn nước, tan được trong các dung môi hữu cơ.\n- Benzene, toluene, xylene (được gọi chung là BTX) có trong dầu mỏ với hàm lượng thấp. Khi chưng cất dầu thô thường nhận được phân đoạn có chứa các arene này. Naphthalene và các arene đa vòng khác có trong dầu mỏ và nhựa than đá."
            },
            {
              "id": "b17-m4",
              "sectionTitle": "IV. Tính chất  hoá học",
              "content": "Arene có thể tham gia phản ứng thế nguyên tử hydrogen ở vòng benzene như phản ứng halogen  hoá, nitro hoá,...\nQuy tắc thế: Khi benzene có nhóm thế alkyl (–CH3, –C2H5...), các phản ứng thế nguyên tử hydrogen ở vòng benzene xảy ra dễ dàng hơn so với benzene và ưu tiên thế vào vị trí số 2 hoặc số 4 (vị trí ortho hoặc para) so với nhóm alkyl.\na) Phản ứng halogen hoá\nCác arene tham gia phản ứng thế nguyên tử hydrogen gắn với vòng thơm bằng halogen (chlorine, bromine) ở nhiệt độ cao khi có xúc tác muối iron(III) halide.\nb) Phản ứng nitro hoá\nPhản ứng nitro hoá là phản ứng trong đó một hay nhiều nguyên tử hydrogen ở vòng benzene được thay thế bằng nhóm nitro (− NO2).\n+ Benzene được nitro hoá bằng hỗn hợp HNO3 đặc và H2SO4 đặc ở nhiệt độ không quá 50oC tạo nitrobenzene dạng lỏng, màu vàng nhạt, sánh như dầu:\n+ Toluene được nitro hoá tạo thành hỗn hợp hai sản phẩm chính là ortho và para – nitrotoluene.\na) Phản ứng cộng chlorine\nPhản ứng cộng chlorine vào benzene trong điều kiện có ánh sáng tử ngoại và đun nóng, sản phẩm thu được là 1, 2, 3, 4, 5, 6 – hexachlorocyclohexane.\nb) Phản ứng cộng hydrogen\nPhản ứng cộng hydrogen vào benzene tạo thành cyclohexane. Phản ứng xảy ra ở điều kiện áp suất cao và nhiệt độ cao, với sự có mặt của các chất xúc tác dị thể như platinum, nickel.\nPhản ứng này được sử dụng trong công nghiệp để sản xuất cyclohexane.\na) Phản ứng oxi hoá hoàn toàn (phản ứng cháy)\nCác arene như benzene, toluene, xylene dễ cháy và toả nhiều nhiệt.\nTổng quát: CnH2n – 6 + 3n−32O2  nCO2 + (n – 3)H2O\nb) Phản ứng oxi hoá nhóm alkyl\nToluene và các alkylbenzene khác có thể bị oxi hoá bởi các tác nhân oxi hoá như dung dịch KMnO4.\nVí dụ:\nC6H5 – CH3 + 2KMnO4  C6H5 – COOK + 2MnO2↓ + KOH + H2O\nC6H5COOK + HCl → C6H5COOH + KCl",
              "keyPoints": [
                "1. Phản ứng thế",
                "2. Phản ứng cộng",
                "3. Phản ứng oxi hoá"
              ]
            },
            {
              "id": "b17-m5",
              "sectionTitle": "V. Ứng dụng",
              "content": "Arene (chủ yếu là benzene, toluene và xylene) là nguồn nguyên liệu để tổng hợp nhiều loại hoá chất và vật liệu hữu cơ quan trọng, có nhiều ứng dụng trong cuộc sống.\nMột số ứng dụng của arene được thể hiện trong sơ đồ sau:\nTuy nhiên, arene là những chất độc nên khi làm việc với arene cần tuân thủ các nguyên tắc an toàn."
            },
            {
              "id": "b17-m6",
              "sectionTitle": "VI. Điều chế",
              "content": "Trong công nghiệp, benzene, toluene được điều chế từ quá trình reforming phân đoạn dầu mỏ chứa các alkane và cycloalkane từ C6 đến C8.\nEthylbenzene được điều chế từ phản ứng giữa benzene và ethylene với xúc tác acid rắn là zeolite.\nNaphthalein được điều chế chủ yếu từ phương pháp chưng cất nhựa than đá."
            }
          ],
          "practiceQuestions": [
            {
              "id": "b17-lt1",
              "question": "Công thức chung của dãy đồng đẳng alkane là",
              "hint": "Alkane là hydrocarbon no, mạch hở, công thức CₙH₂ₙ₊₂ với n ≥ 1."
            },
            {
              "id": "b17-lt2",
              "question": "Phản ứng đặc trưng của alkane là",
              "hint": "Alkane chỉ có liên kết đơn bền nên đặc trưng bởi phản ứng thế nguyên tử H bằng halogen khi có ánh sáng."
            },
            {
              "id": "b17-lt3",
              "question": "Phân tử alkene chứa",
              "hint": "Alkene là hydrocarbon không no, mạch hở, có đúng một liên kết đôi C=C, công thức CₙH₂ₙ (n ≥ 2)."
            },
            {
              "id": "b17-lt4",
              "question": "Thuốc thử dùng để phân biệt ethylene với ethane là",
              "hint": "Ethylene cộng vào Br₂ làm mất màu nước bromine ngay ở điều kiện thường, còn ethane thì không."
            }
          ]
        }
      },
      {
        "id": "bai-18",
        "title": "Bài 18: Ôn tập hệ thống kiến thức về hydrocarbon",
        "summary": "Dãy đồng đẳng của benzene CnH2n - 6 (n ≥ 6)\nĐặc điểm cấu tạo phân tử\n- Mạch hở, chỉ có liên kết đơn. - Có đồng phân mạch carbon.",
        "formulae": [],
        "commonQuestions": [
          {
            "question": "Nhận định về toluene C₆H₅CH₃.",
            "hint": "Nhóm −CH₃ đẩy electron nên hoạt hóa vòng và định hướng ortho, para. Nhánh methyl bị KMnO₄ nóng oxi hóa thành nhóm −COOH, còn vòng benzene không cộng Br₂ ở điều kiện thường.",
            "sampleAnswer": ""
          },
          {
            "question": "Hỗn hợp X gồm ethylene và acetylene. Dẫn 0,3 mol X qua dung dịch bromine dư thấy có 0,5 mol Br₂ phản ứng. Phần trăm thể tích acetylene trong X là",
            "hint": "Gọi x, y là số mol C₂H₄ và C₂H₂: x + y = 0,3 và x + 2y = 0,5 (acetylene cộng 2 Br₂). Giải được y = 0,2 → %V = 0,2/0,3 × 100% ≈ 66,67%.",
            "sampleAnswer": "66,67%"
          },
          {
            "question": "Cho benzene vào nước bromine rồi lắc đều. Hiện tượng là",
            "hint": "Benzene không cộng Br₂ ở điều kiện thường; nó chỉ hòa tan bromine nên màu chuyển sang lớp benzene mà không mất màu do phản ứng.",
            "sampleAnswer": "không có hiện tượng hóa học, chỉ tách lớp"
          }
        ],
        "textbook": {
          "pageRange": "",
          "objectives": [],
          "sections": [
            {
              "id": "b18-m1",
              "sectionTitle": "Mở đầu",
              "content": "HỆ THỐNG  HOÁ KIẾN THỨC\nHYDROCARBON\nAlkane\nAlkene\nAlkyne\nArene\nCông thức tổng quát\nCnH2n + 2 (n ≥ 1)\nCnH2n (n ≥ 2)\nCnH2n - 2 (n ≥ 2)\nDãy đồng đẳng của benzene CnH2n - 6 (n ≥ 6)\nĐặc điểm cấu tạo phân tử\n- Mạch hở, chỉ có liên kết đơn.\n- Có đồng phân mạch carbon.\n- Mạch hở, có 1 liên kết đôi.\n- Có đồng phân mạch carbon, vị trí liên kết đôi, đồng phân hình học.\n- Mạch hở, có 1 liên kết ba.\n- Có đồng phân mạch carbon, vị trí liên kết ba.\n- Có vòng benzene.\n- Có đồng phân mạch carbon của alkyl, vị trí các nhóm alkyl, …\nTính chất  hoá học\n- Phản ứng thế halogen.\n- Phản ứng cracking.\n- Phản ứng reforming\n- Phản ứng oxi hoá.\n- Phản ứng cộng (H2, Br2, HX, H2O).\n- Phản ứng trùng hợp.\n- Phản ứng oxi hoá.\n- Phản ứng cộng (H2, Br2, HX, H2O).\n- Phản ứng alk – 1 – yne với AgNO3/NH3.\n- Phản ứng oxi hoá.\n- Phản ứng thế (halogen hoá, nitro hoá).\n- Phản ứng cộng (Cl2, H2)\n- Phản ứng oxi hoá.\nỨng dụng\n- Nhiên liệu: xăng, diesel, nhiên liệu phản lực.\n- Nguyên liệu: vaseline, nến, sáp, sản xuất hoá chất.\n- Tổng hợp polymer.\n- Ethylene: kích thích quả mau chín.\n- Nguyên liệu sản xuất hoá chất.\n- Đèn xì oxygen – acetylene.\n- Nguyên liệu sản xuất hoá chất.\n- Tổng hợp polymer.\n- Toluene: sản xuất thuốc nổ.\n- Nguyên liệu sản xuất hoá chất.\nHYDROCARBON\nĐiều chế\nAlkane\n- Chưng cất phân đoạn dầu mỏ thu được các sản phẩm alkane khác nhau.\n- Khí thiên nhiên.\nAlkene\n- Trong phòng thí nghiệm, ethylene được điều chế từ phản ứng dehydrate ethanol.\n- Trong công nghiệp, alkene được sản xuất từ cracking alkane.\nAlkyne\nArene\n- Acetylene được điều chế từ phản ứng giữa calcium carbide với nước.\n- Nhiệt phân methane để sản xuất acetylene.\n- Reforming alkane thu benzene, toluene, xylene.\n- Chưng cất nhựa than đá thu naphthalene."
            }
          ],
          "practiceQuestions": [
            {
              "id": "b18-lt1",
              "question": "Công thức chung của dãy đồng đẳng alkane là",
              "hint": "Alkane là hydrocarbon no, mạch hở, công thức CₙH₂ₙ₊₂ với n ≥ 1."
            },
            {
              "id": "b18-lt2",
              "question": "Phản ứng đặc trưng của alkane là",
              "hint": "Alkane chỉ có liên kết đơn bền nên đặc trưng bởi phản ứng thế nguyên tử H bằng halogen khi có ánh sáng."
            },
            {
              "id": "b18-lt3",
              "question": "Phân tử alkene chứa",
              "hint": "Alkene là hydrocarbon không no, mạch hở, có đúng một liên kết đôi C=C, công thức CₙH₂ₙ (n ≥ 2)."
            },
            {
              "id": "b18-lt4",
              "question": "Thuốc thử dùng để phân biệt ethylene với ethane là",
              "hint": "Ethylene cộng vào Br₂ làm mất màu nước bromine ngay ở điều kiện thường, còn ethane thì không."
            }
          ]
        }
      }
    ]
  },
  {
    "id": "chuong-5",
    "title": "Chương 5: Dẫn xuất halogen – Alcohol – Phenol",
    "lessons": [
      {
        "id": "bai-19",
        "title": "Bài 19: Dẫn xuất halogen",
        "summary": "Khi thay thế nguyên tử hydrogen trong phân tử hydrocarbon bằng nguyên tử halogen, được dẫn xuất halogen của hydrocarbon. Công thức tổng quát của dẫn xuất halogen: RXn.",
        "formulae": [
          "CH3Cl; CH3Br; CH2Cl2; CH2 = CH – Cl; C6H5Br…"
        ],
        "commonQuestions": [
          {
            "question": "So sánh ethanol và phenol.",
            "hint": "Chỉ phenol tạo kết tủa trắng 2,4,6-tribromophenol với nước bromine. Phenol là acid rất yếu, yếu hơn H₂CO₃ nên không đẩy được CO₂ ra khỏi muối carbonate.",
            "sampleAnswer": ""
          },
          {
            "question": "Cho 13,8 gam hỗn hợp ethanol và glycerol tác dụng hết với Na dư, thu được 4,958 lít H₂ (đkc). Phần trăm khối lượng glycerol trong hỗn hợp là",
            "hint": "Gọi a, b là số mol ethanol và glycerol: 46a + 92b = 13,8 và a/2 + 3b/2 = 0,2. Giải được a = b = 0,1 → %m(glycerol) = 9,2/13,8 × 100% ≈ 66,67%.",
            "sampleAnswer": "66,67%"
          },
          {
            "question": "Có thể phân biệt phenol và ethanol bằng thuốc thử nào?",
            "hint": "Phenol cho kết tủa trắng với nước bromine, ethanol không phản ứng. Na thì cả hai đều phản ứng cho H₂ nên không phân biệt được.",
            "sampleAnswer": "nước bromine"
          }
        ],
        "textbook": {
          "pageRange": "",
          "objectives": [],
          "sections": [
            {
              "id": "b19-m1",
              "sectionTitle": "I. Khái niệm, danh pháp",
              "content": "Khi thay thế nguyên tử hydrogen trong phân tử hydrocarbon bằng nguyên tử halogen, được dẫn xuất halogen của hydrocarbon.\nCông thức tổng quát của dẫn xuất halogen: RXn. Trong đó:\nR: gốc hydrocarbon.\nX: F, Cl, Br, I.\nn: số nguyên tử halogen.\nVật lý\nVí dụ:\nCH3Cl; CH3Br; CH2Cl2; CH2 = CH – Cl; C6H5Br…\na) Danh pháp thay thế\nTên theo danh pháp thay thế của dẫn xuất halogen:\nVị trí của halogen + halogeno + tên hydrocarbon\nHalogeno: Đuôi “-ine” trong tên halogen được đổi thành đuôi “-o”.\nChú ý:\n+ Nếu halogen chỉ có một vị trí duy nhất thì không cần số chỉ vị trí halogen.\n+ Mạch carbon được ưu tiên đánh số từ phía gần nhóm thế hơn (từ nguyên tử halogen hoặc từ nhánh alkyl).\n+ Nếu có liên kết bội thì ưu tiên đánh số từ phía gần liên kết bội.\n+ Nếu có nhiều nguyên tử halogen thì cần thêm độ bội (di, tri, tetra …) trước “halogeno”.\nVí dụ:\nb) Tên thông thường\nMột số dẫn xuất halogen thường gặp được gọi theo tên thông thường như chloroform (CHCl3); bromoform (CHBr3); iodoform (CHI3); CCl4 (carbon tetrachloride).",
              "keyPoints": [
                "1. Khái niệm",
                "2. Danh pháp"
              ]
            },
            {
              "id": "b19-m2",
              "sectionTitle": "II. Đặc điểm cấu tạo",
              "content": "Trong phân tử dẫn xuất halogen, liên kết C – X phân cực về phía nguyên tử halogen, nguyên tử carbon mang một phần điện tích dương và nguyên tử halogen mang một phần điện tích âm. Vì vậy, liên kết C – X dễ bị phân cắt trong các phản ứng  hoá học."
            },
            {
              "id": "b19-m3",
              "sectionTitle": "III. Tính chất vật lí",
              "content": "Phân tử của dẫn xuất halogen phân cực nên chúng có nhiệt độ nóng chảy và nhiệt độ sôi cao hơn các hydrocarbon có phân tử khối tương đương.\nỞ điều kiện thường, một số chất có phân tử khối nhỏ (CH3Cl, CH3F,...) ở trạng thái khí. Các dẫn xuất có phân tử khối lớn hơn ở trạng thái lỏng hoặc rắn.\nCác dẫn xuất halogen hầu như không tan trong nước, tan tốt trong các dung môi hữu cơ như hydrocarbon, ether...."
            },
            {
              "id": "b19-m4",
              "sectionTitle": "IV. Tính chất hoá học",
              "content": "Liên kết C−X phân cực về phía nguyên tử halogen nên phản ứng đặc trưng của dẫn xuất halogen là phản ứng thế nguyên tử halogen. Ngoài ra, dẫn xuất halogen còn tham gia phản ứng tách HX.\nCác dẫn xuất halogen có thể tham gia phản ứng với dung dịch kiềm, nguyên tử halogen bị thay thế bởi nhóm OH−, tạo thành alcohol.\nVí dụ:\nCH3CH2Br + NaOH (loãng)  CH3CH2OH + NaBr\nPhương trình  hóa học chung:\nR – X + NaOH  R – OH + NaX\n(X: Cl, Br, I; X liên kết với nguyên tử carbon no).\nCác dẫn xuất monohalogen của alkane có thể bị tách hydrogen halide để tạo thành alkene theo sơ đồ sau:\nPhản ứng này xảy ra khi đun nóng dẫn xuất halogen với base mạnh như NaOH, RONa trong dung môi alcohol.\nVí dụ:\nPhản ứng tách xảy ra theo quy tắc tách Zaitsev: Trong phản ứng tách hydrogen halide, nguyên tử halogen bị tách ưu tiên cùng với nguyên tử hydrogen ở carbon bên cạnh có bậc cao hơn.\nVí dụ:",
              "keyPoints": [
                "1. Phản ứng thế nguyên tử halogen",
                "2. Phản ứng tách hydrogen halide"
              ]
            },
            {
              "id": "b19-m5",
              "sectionTitle": "V. Ứng dụng",
              "content": "- Sản xuất vật liệu polymer;\n- Sản xuất dược phẩm; dung môi.\n- Tác nhân làm lạnh;\n- Sản xuất thuốc bảo vệ thực vật; chất kich thích sinh trưởng.\na) CFC và tầng ozone\nMột số dẫn xuất halogen chứa đồng thời chlorine, fluorine được gọi chung là chlorofluorocarbon (viết tắt là CFC). Các hợp chất này trước đây được sử dụng phổ biến trong các hệ thống làm lạnh như tủ lạnh, máy điều hoà nhiệt độ, hệ thống làm lạnh công nghiệp chất đẩy trong các bình xịt,... Tuy nhiên do ảnh hưởng gây hại đến tầng ozone nên CFC bị hạn chế và cấm sử dụng. Hiện nay CFC được thay thế bởi các dẫn xuất halogen không chứa chlorine như hydrofluorocarbon (HFC), hydrofluoroolefin (HFO).\nb) Thuốc trừ sâu, thuốc diệt cỏ và chất kích thích sinh trưởng thực vật\nNhiều dẫn xuất của chlorine trước đây được sử dụng phổ biến trong nông nghiệp dùng làm thuốc bảo vệ thực vật, chất kích thích sinh trưởng.\nTuy nhiên, do đặc tính khó phân huỷ, tồn dư lâu trong môi trường và có tác hại đến sức khoẻ con người nên các loại hợp chất này hiện nay bị hạn chế hoặc bị cấm sử dụng tại nhiều quốc gia.",
              "keyPoints": [
                "1. Một số ứng dụng tiêu biểu của dẫn xuất halogen",
                "2. Dẫn xuất halogen với sức khoẻ và môi trường"
              ]
            }
          ],
          "practiceQuestions": [
            {
              "id": "b19-lt1",
              "question": "Nhóm chức của alcohol là",
              "hint": "Alcohol có nhóm hydroxy −OH gắn trực tiếp vào nguyên tử carbon no. Nếu −OH gắn vào vòng benzene thì là phenol."
            },
            {
              "id": "b19-lt2",
              "question": "Công thức phân tử của phenol là",
              "hint": "Phenol là C₆H₅OH, tức C₆H₆O, gồm nhóm −OH gắn trực tiếp vào vòng benzene."
            },
            {
              "id": "b19-lt3",
              "question": "Công thức chung của alcohol no, đơn chức, mạch hở là",
              "hint": "Thay một H của alkane CₙH₂ₙ₊₂ bằng nhóm −OH ta được CₙH₂ₙ₊₁OH hay CₙH₂ₙ₊₂O với n ≥ 1."
            },
            {
              "id": "b19-lt4",
              "question": "Glycerol thuộc loại",
              "hint": "Glycerol C₃H₅(OH)₃ có ba nhóm −OH nên là alcohol đa chức, được dùng nhiều trong mỹ phẩm."
            }
          ]
        }
      },
      {
        "id": "bai-20",
        "title": "Bài 20: Alcohol",
        "summary": "Alcohol là những hợp chất hữu cơ trong phân tử có chứa nhóm hydroxy (−OH) liên kết với nguyên tử carbon no. Alcohol no, đơn chức, mạch hở trong phân tử có một nhóm – OH liên kết với gốc alkyl, có công thức tổng quát là CnH2n + 1OH (n ≥ 1).",
        "formulae": [
          "2R – OH + 2Na → 2RONa + H2",
          "CH3CH2OH CH2 = CH2 + H2O",
          "C2H5OH(l) + 3O2(g)  (g) + 3H2O(g) Δ =−1367kJ",
          "CH2 = CH2 + H2O  CH3 – CH2 – OH"
        ],
        "commonQuestions": [
          {
            "question": "So sánh ethanol và phenol.",
            "hint": "Chỉ phenol tạo kết tủa trắng 2,4,6-tribromophenol với nước bromine. Phenol là acid rất yếu, yếu hơn H₂CO₃ nên không đẩy được CO₂ ra khỏi muối carbonate.",
            "sampleAnswer": ""
          },
          {
            "question": "Cho 13,8 gam hỗn hợp ethanol và glycerol tác dụng hết với Na dư, thu được 4,958 lít H₂ (đkc). Phần trăm khối lượng glycerol trong hỗn hợp là",
            "hint": "Gọi a, b là số mol ethanol và glycerol: 46a + 92b = 13,8 và a/2 + 3b/2 = 0,2. Giải được a = b = 0,1 → %m(glycerol) = 9,2/13,8 × 100% ≈ 66,67%.",
            "sampleAnswer": "66,67%"
          },
          {
            "question": "Có thể phân biệt phenol và ethanol bằng thuốc thử nào?",
            "hint": "Phenol cho kết tủa trắng với nước bromine, ethanol không phản ứng. Na thì cả hai đều phản ứng cho H₂ nên không phân biệt được.",
            "sampleAnswer": "nước bromine"
          }
        ],
        "textbook": {
          "pageRange": "",
          "objectives": [],
          "sections": [
            {
              "id": "b20-m1",
              "sectionTitle": "I. Khái niệm, danh pháp",
              "content": "Alcohol là những hợp chất hữu cơ trong phân tử có chứa nhóm hydroxy (−OH) liên kết với nguyên tử carbon no.\nAlcohol no, đơn chức, mạch hở trong phân tử có một nhóm – OH liên kết với gốc alkyl, có công thức tổng quát là CnH2n + 1OH (n ≥ 1). Ví dụ: CH3OH; C2H5OH …\nNếu alcohol có hai hay nhiều nhóm – OH thì các alcohol đó được gọi là các alcohol đa chức (polyalcohol). Ví dụ: C2H4(OH)2; C3H5(OH)3 ….\nNgoài ra, alcohol có thể được phân loại theo bậc. Bậc của alcohol là bậc của nguyên tử carbon liên kết với nhóm hydroxy. Do đó, ta có alcohol bậc I, alcohol bậc II và alcohol bậc III.\n- Tên theo danh pháp thay thế của monoalcohol:\nTên hydrocarbon (bỏ e ở cuối) - vị trí nhóm (OH) - ol\nVí dụ:\n3 – methylbutan – 1 – ol\n- Tên theo danh pháp thay thế của polyalcohol:\nTên hydrocarbon – vị trí nhóm (OH) – độ bội nhóm (OH) + ol\nVí dụ:\nEthane – 1,2 – diol\nChú ý:\n- Nếu nhóm – OH chỉ có một vị trí duy nhất thì không cần số chỉ vị trí nhóm – OH.\n- Mạch carbon được ưu tiên đánh số từ phía gần nhóm – OH hơn.\n- Nếu mạch carbon có nhánh thì cần thêm tên nhánh ở phía trước.\n- Nếu có nhiều nhóm – OH thì cần thêm độ bội (di, tri, …) trước “ol” và giữ nguyên tên hydrocarbon.",
              "keyPoints": [
                "1. Khái niệm",
                "2. Danh pháp"
              ]
            },
            {
              "id": "b20-m2",
              "sectionTitle": "II. Đặc điểm cấu tạo",
              "content": "Trong phân tử alcohol, các liên kết O – H và C – O đều phân cực về phía nguyên tử oxygen do oxygen có độ âm điện lớn hơn.\nVì vậy, trong các phản ứng hoá học, alcohol thường bị phân cắt ở liên kết O – H hoặc liên kết C – O."
            },
            {
              "id": "b20-m3",
              "sectionTitle": "III. Tính chất vật lí",
              "content": "Ở điều kiện thường, các alcohol no, đơn chức từ C1 đến C12 ở trạng thái lỏng, các alcohol từ C13 trở lên ở trạng thái rắn. Các polyalcohol như ethylene glycol, glycerol là chất lỏng sánh, nặng hơn nước và có vị ngọt.\nAlcohol có nhiệt độ sôi cao hơn các hydrocarbon, dẫn xuất halogen có phân tử khối tương đương và dễ tan trong nước do các phân tử alcohol có thể tạo liên kết hydrogen với nhau và với nước.\nLiên kết hydrogen giữa các phân tử ethanol (a) và giữa ethanol với nước (b)\nKhi số nguyên tử carbon trong phân tử tăng lên, độ tan trong nước của alcohol giảm nhanh do gốc hydrocarbon là phần kị nước tăng lên."
            },
            {
              "id": "b20-m4",
              "sectionTitle": "IV. Tính chất hoá học",
              "content": "Liên kết O – H phân cực nên trong một số phản ứng, nguyên tử hydrogen trong nhóm hydroxy có thể bị thay thế.\nAlcohol phản ứng với các kim loại mạnh như sodium, potassium giải phóng khí hydrogen:\n2R – OH + 2Na → 2RONa + H2\nKhi đun nóng alcohol với H2SO4 đặc ở nhiệt độ thích hợp thì thu được ether.\nVí dụ:\n2C2H5OH C2H5OC2H5 + H2O\nC2H5OC2H5: diethyl ether\n⇒ Công thức tính số ether tạo thành từ n alcohol khác nhau là n(n+1)2.\nKhi cho hơi alcohol no, đơn chức, mạch hở đi qua bột Al2O3 nung nóng hoặc đun alcohol với H2SO4 đặc, H3PO4 đặc, alcohol bị tách nước tạo thành alkene:\nVí dụ:\nCH3CH2OH CH2 = CH2 + H2O\nChú ý:\nPhản ứng tách nước của alcohol tạo alkene ưu tiên theo quy tắc tách Zaitsev: Trong phản ứng tách nước của alcohol, nhóm – OH bị tách ưu tiên cùng với nguyên tử hydrogen ở carbon bên cạnh có bậc cao hơn.\nVí dụ:\na) Oxi hoá không hoàn toàn\n+ Các alcohol bậc I bị oxi hóa không hoàn toàn tạo thành aldehyde. Ví dụ:\nCH3CH2OH + CuO  CH3CHO + Cu + H2O\nTổng quát:\nR – CH2 – OH + CuO  R – CHO + Cu + H2O\n+ Các alcohol bậc II bị oxi hóa không hoàn toàn tạo thành ketone. Ví dụ:\nCH3 - CH(OH) – CH3 + CuO  CH3 – CO – CH3 + Cu + H2O\nTổng quát:\nR – CH(OH) – R’ + CuO  R – CO – R’ + Cu + H2O\n+ Trong điều kiện trên, alcohol bậc III không phản ứng.\nb) Phản ứng cháy của alcohol\nCác alcohol có thể bị đốt cháy trong không khí tạo thành carbon dioxide, hơi nước và toả nhiệt:\nCnH2n + 2O + 3n2O2  nCO2 + (n + 1)H2O\nVí dụ:\nC2H5OH(l) + 3O2(g)  (g) + 3H2O(g) Δ =−1367kJ\nEthanol được sử dụng phổ biến làm nhiên liệu cho đèn cồn, bếp cồn hoặc phối trộn với xăng để làm nhiên liệu cho động cơ đốt trong.\nCác polyalcohol có các nhóm – OH liền kề như ethylene glycol, glycerol có thể tác dụng với copper(II) hydroxide tạo thành dung dịch màu xanh lam đậm.\nVí dụ:\nVì vậy, phản ứng này có thể dùng để nhận biết các polyalcohol có các nhóm – OH liền kề.",
              "keyPoints": [
                "1. Phản ứng thế nguyên tử H của nhóm – OH.",
                "2. Phản ứng tạo ether",
                "3. Phản ứng tạo alkene",
                "4. Phản ứng oxi  hoá",
                "5. Phản ứng riêng của polyalcohol với Cu(OH)2"
              ]
            },
            {
              "id": "b20-m5",
              "sectionTitle": "V. Ứng dụng",
              "content": "Ứng dụng của một số alcohol được thể hiện trong sơ đồ sau:\nKhi đưa đồ uống có cồn vào cơ thể, một phần ethanol sẽ được hấp thụ tại dạ dày, ruột non, thẩm thấu vào máu và được đưa vào các cơ quan trong cơ thể, phần còn lại sẽ được chuyển hoá ở gan.\nViệc lạm dụng đồ uống có cồn như rượu, bia … sẽ gây ảnh hưởng nghiêm trọng tới sức khoẻ con người như tổn thương hệ thần kinh, rối loạn tâm thần, viêm gan, xơ gan, viêm loét dạ dày, viêm tuỵ, … Trong thời gian mang thai, nếu người mẹ lạm dụng rượu, bia thì sẽ gây độc cho thai nhi, có thể gây dị tật ở trẻ.",
              "keyPoints": [
                "1. Ứng dụng của alcohol",
                "2. Ảnh hưởng của rượu, bia và đồ uống có cồn đến sức khoẻ con người"
              ]
            },
            {
              "id": "b20-m6",
              "sectionTitle": "VI. Điều chế",
              "content": "Các alcohol có thể được điều chế bằng phản ứng hydrate hoá alkene. Phương pháp này được sử dụng khá phổ biến trong công nghiệp để điều chế ethanol.\nVí dụ:\nCH2 = CH2 + H2O  CH3 – CH2 – OH\nKhi lên men tinh bột, enzyme sẽ phân giải tinh bột thành glucose, sau đó glucose sẽ chuyển hoá thành ethanol:\n(C6H10O5)n  C6H12O6  C2H5OH\nNgoài các sản phẩm chứa tinh bột (gạo, ngô, sắn, …) người ta còn sử dụng các phế phẩm của công nghiệp đường, chế phẩm thuỷ phân cellulose, … để sản xuất ethanol.\nPhương pháp sinh hoá được sử dụng phổ biến để sản xuất các đồ uống có cồn, điều chế ethanol làm nhiên liệu sinh học.\nTrong công nghiệp, glycerol được tổng hợp từ propylene theo sơ đồ sau:\nNgoài ra, glycerol còn thu được khi thuỷ phân chất béo trong quá trình sản xuất xà phòng.",
              "keyPoints": [
                "1. Hydrate hoá alkene",
                "2. Điều chế ethanol bằng phương pháp sinh hoá",
                "3. Điều chế glycerol"
              ]
            }
          ],
          "practiceQuestions": [
            {
              "id": "b20-lt1",
              "question": "Nhóm chức của alcohol là",
              "hint": "Alcohol có nhóm hydroxy −OH gắn trực tiếp vào nguyên tử carbon no. Nếu −OH gắn vào vòng benzene thì là phenol."
            },
            {
              "id": "b20-lt2",
              "question": "Công thức phân tử của phenol là",
              "hint": "Phenol là C₆H₅OH, tức C₆H₆O, gồm nhóm −OH gắn trực tiếp vào vòng benzene."
            },
            {
              "id": "b20-lt3",
              "question": "Công thức chung của alcohol no, đơn chức, mạch hở là",
              "hint": "Thay một H của alkane CₙH₂ₙ₊₂ bằng nhóm −OH ta được CₙH₂ₙ₊₁OH hay CₙH₂ₙ₊₂O với n ≥ 1."
            },
            {
              "id": "b20-lt4",
              "question": "Glycerol thuộc loại",
              "hint": "Glycerol C₃H₅(OH)₃ có ba nhóm −OH nên là alcohol đa chức, được dùng nhiều trong mỹ phẩm."
            }
          ]
        }
      },
      {
        "id": "bai-21",
        "title": "Bài 21: Phenol",
        "summary": "Phenol là những hợp chất hữu cơ trong phân tử có nhóm – OH liên kết trực tiếp với nguyên tử carbon của vòng benzene. Hợp chất của phenol đơn giản nhất có công thức là C6H5OH cũng có tên riêng là phenol.",
        "formulae": [
          "C6H5OH+H2O⇌C6H5O−+H3O+",
          "C6H5OH + NaOH → C6H5ONa + H2O",
          "C6H5OH + Na2CO3 ⇌ C6H5ONa + NaHCO3"
        ],
        "commonQuestions": [
          {
            "question": "So sánh ethanol và phenol.",
            "hint": "Chỉ phenol tạo kết tủa trắng 2,4,6-tribromophenol với nước bromine. Phenol là acid rất yếu, yếu hơn H₂CO₃ nên không đẩy được CO₂ ra khỏi muối carbonate.",
            "sampleAnswer": ""
          },
          {
            "question": "Cho 13,8 gam hỗn hợp ethanol và glycerol tác dụng hết với Na dư, thu được 4,958 lít H₂ (đkc). Phần trăm khối lượng glycerol trong hỗn hợp là",
            "hint": "Gọi a, b là số mol ethanol và glycerol: 46a + 92b = 13,8 và a/2 + 3b/2 = 0,2. Giải được a = b = 0,1 → %m(glycerol) = 9,2/13,8 × 100% ≈ 66,67%.",
            "sampleAnswer": "66,67%"
          },
          {
            "question": "Có thể phân biệt phenol và ethanol bằng thuốc thử nào?",
            "hint": "Phenol cho kết tủa trắng với nước bromine, ethanol không phản ứng. Na thì cả hai đều phản ứng cho H₂ nên không phân biệt được.",
            "sampleAnswer": "nước bromine"
          }
        ],
        "textbook": {
          "pageRange": "",
          "objectives": [],
          "sections": [
            {
              "id": "b21-m1",
              "sectionTitle": "I. Khái niệm",
              "content": "Phenol là những hợp chất hữu cơ trong phân tử có nhóm – OH liên kết trực tiếp với nguyên tử carbon của vòng benzene.\nHợp chất của phenol đơn giản nhất có công thức là C6H5OH cũng có tên riêng là phenol.\nTên thông thường của một số phenol:"
            },
            {
              "id": "b21-m2",
              "sectionTitle": "II. Đặc điểm cấu tạo của phenol",
              "content": "Trong phân tử phenol, do ảnh hưởng của vòng benzene nên liên kết O – H của phenol phân cực mạnh hơn so với alcohol, vì vậy phenol thể hiện tính acid yếu.\nNgoài ra, do có vòng benzene nên phenol có thể tham gia phản ứng thế nguyên tử hydrogen của vòng benzene."
            },
            {
              "id": "b21-m3",
              "sectionTitle": "III. Tính chất vật lí",
              "content": "- Ở điều kiện thường: phenol là chất rắn, không màu, nóng chảy ở 43oC, sôi ở 181,8 oC.\n- Phenol ít tan trong nước ở điều kiện thường, tan nhiều khi đun nóng; tan tốt trong các dung môi hữu cơ như ethanol, ether và acetone.\n- Phenol độc và có thể gây bỏng khi tiếp xúc với da nên phải cẩn thận khi sử dụng."
            },
            {
              "id": "b21-m4",
              "sectionTitle": "IV. Tính chất  hoá học",
              "content": "Trong dung dịch nước, phenol phân li theo cân bằng sau:\nC6H5OH+H2O⇌C6H5O−+H3O+\nPhenol là một acid yếu, dung dịch phenol không làm đổi màu quỳ tím.\nPhenol có thể phản ứng được với kim loại kiềm, dung dịch base, muối sodium carbonate …\nVí dụ:\nC6H5OH + NaOH → C6H5ONa + H2O\nC6H5OH + Na2CO3 ⇌ C6H5ONa + NaHCO3\nPhenol có thể tham gia phản ứng thế nguyên tử hydrogen của vòng benzene. Phản ứng thế ưu tiên vào vị trí 2, 4 và 6 (ortho và para).\na) Phản ứng bromine hoá\nPhenol phản ứng với nước bromine tạo sản phẩm thế 2,4,6 – tribromophenol ở dạng kết tủa màu trắng:\nDo ảnh hưởng của nhóm – OH, phản ứng thế nguyên tử hydrogen ở vòng benzene của phenol xảy ra dễ dàng hơn so với benzene.\nb) Phản ứng nitro hoá\nPhenol phản ứng với dung dịch nitric acid đặc trong dung dịch sulfuric acid đặc tạo thành sản phẩm 2,4,6 – trinitrophenol (picric acid):",
              "keyPoints": [
                "1. Phản ứng thế nguyên tử H của nhóm – OH (tính acid của phenol)",
                "2. Phản ứng thế ở vòng thơm"
              ]
            },
            {
              "id": "b21-m5",
              "sectionTitle": "V. Ứng dụng",
              "content": "Một số ứng dụng của phenol được thể hiện trong sơ đồ sau:"
            },
            {
              "id": "b21-m6",
              "sectionTitle": "VI. Điều chế",
              "content": "Phenol được tổng hợp từ cumene (isopropylbenzene) bằng phản ứng oxi hoá bởi oxygen rồi thuỷ phân trong môi trường acid thu được hai sản phẩm là phenol và acetone:\nHiện nay, phần lớn phenol và acetone đều được sản xuất trong công nghiệp theo phương pháp này.\nNgoài ra, phenol còn được điều chế từ nhựa than đá."
            }
          ],
          "practiceQuestions": [
            {
              "id": "b21-lt1",
              "question": "Nhóm chức của alcohol là",
              "hint": "Alcohol có nhóm hydroxy −OH gắn trực tiếp vào nguyên tử carbon no. Nếu −OH gắn vào vòng benzene thì là phenol."
            },
            {
              "id": "b21-lt2",
              "question": "Công thức phân tử của phenol là",
              "hint": "Phenol là C₆H₅OH, tức C₆H₆O, gồm nhóm −OH gắn trực tiếp vào vòng benzene."
            },
            {
              "id": "b21-lt3",
              "question": "Công thức chung của alcohol no, đơn chức, mạch hở là",
              "hint": "Thay một H của alkane CₙH₂ₙ₊₂ bằng nhóm −OH ta được CₙH₂ₙ₊₁OH hay CₙH₂ₙ₊₂O với n ≥ 1."
            },
            {
              "id": "b21-lt4",
              "question": "Glycerol thuộc loại",
              "hint": "Glycerol C₃H₅(OH)₃ có ba nhóm −OH nên là alcohol đa chức, được dùng nhiều trong mỹ phẩm."
            }
          ]
        }
      },
      {
        "id": "bai-22",
        "title": "Bài 22: Hệ thống hoá kiến thức về dẫn xuất halogen, alcohol và phenol",
        "summary": "Liên kết C−X phân cực về phía nguyên tử halogen nên phản ứng đặc trưng của dẫn xuất halogen là phản ứng thế nguyên tử halogen. Ngoài ra, dẫn xuất halogen còn tham gia phản ứng tách HX.",
        "formulae": [
          "2R – OH + 2Na → 2RONa + H2"
        ],
        "commonQuestions": [
          {
            "question": "So sánh ethanol và phenol.",
            "hint": "Chỉ phenol tạo kết tủa trắng 2,4,6-tribromophenol với nước bromine. Phenol là acid rất yếu, yếu hơn H₂CO₃ nên không đẩy được CO₂ ra khỏi muối carbonate.",
            "sampleAnswer": ""
          },
          {
            "question": "Cho 13,8 gam hỗn hợp ethanol và glycerol tác dụng hết với Na dư, thu được 4,958 lít H₂ (đkc). Phần trăm khối lượng glycerol trong hỗn hợp là",
            "hint": "Gọi a, b là số mol ethanol và glycerol: 46a + 92b = 13,8 và a/2 + 3b/2 = 0,2. Giải được a = b = 0,1 → %m(glycerol) = 9,2/13,8 × 100% ≈ 66,67%.",
            "sampleAnswer": "66,67%"
          },
          {
            "question": "Có thể phân biệt phenol và ethanol bằng thuốc thử nào?",
            "hint": "Phenol cho kết tủa trắng với nước bromine, ethanol không phản ứng. Na thì cả hai đều phản ứng cho H₂ nên không phân biệt được.",
            "sampleAnswer": "nước bromine"
          }
        ],
        "textbook": {
          "pageRange": "",
          "objectives": [],
          "sections": [
            {
              "id": "b22-m1",
              "sectionTitle": "Mở đầu",
              "content": "HỆ THỐNG HOÁ KIẾN THỨC"
            },
            {
              "id": "b22-m2",
              "sectionTitle": "I. Tính chất hoá học của dẫn xuất halogen",
              "content": "Liên kết C−X phân cực về phía nguyên tử halogen nên phản ứng đặc trưng của dẫn xuất halogen là phản ứng thế nguyên tử halogen. Ngoài ra, dẫn xuất halogen còn tham gia phản ứng tách HX.\nCác dẫn xuất halogen có thể tham gia phản ứng với dung dịch kiềm, nguyên tử halogen bị thay thế bởi nhóm OH−, tạo thành alcohol.\nPhương trình hóa học chung:\nR – X + NaOH R – OH + NaX\n(X: Cl, Br, I; X liên kết với nguyên tử carbon no).\nCác dẫn xuất monohalogen của alkane có thể bị tách hydrogen halide để tạo thành alkene theo sơ đồ sau:\nPhản ứng này xảy ra khi đun nóng dẫn xuất halogen với base mạnh như NaOH, RONa trong dung môi alcohol.\nChú ý:\nPhản ứng tách xảy ra theo quy tắc tách Zaitsev: Trong phản ứng tách hydrogen halide, nguyên tử halogen bị tách ưu tiên cùng với nguyên tử hydrogen ở carbon bên cạnh có bậc cao hơn.\nVí dụ:",
              "keyPoints": [
                "1. Phản ứng thế nguyên tử halogen",
                "2. Phản ứng tách hydrogen halide"
              ]
            },
            {
              "id": "b22-m3",
              "sectionTitle": "II. Tính chất hoá học của alcohol",
              "content": "Liên kết O – H phân cực nên trong một số phản ứng, nguyên tử hydrogen trong nhóm hydroxy có thể bị thay thế.\nAlcohol phản ứng với các kim loại mạnh như sodium, potassium giải phóng khí hydrogen:\n2R – OH + 2Na → 2RONa + H2\nKhi đun nóng alcohol với H2SO4 đặc ở nhiệt độ thích hợp thì thu được ether.\nVí dụ:\n2C2H5OH C2H5OC2H5 + H2O\n⇒ Công thức tính số ether tạo thành từ n alcohol khác nhau là\nnung nóng hoặc đun alcohol với H2SO4 đặc, H3PO4 đặc, alcohol bị tách nước tạo thành alkene:\nChú ý:\nPhản ứng tách nước của alcohol tạo alkene ưu tiên theo quy tắc tách Zaitsev: Trong phản ứng tách nước của alcohol, nhóm – OH bị tách ưu tiên cùng với nguyên tử hydrogen ở carbon bên cạnh có bậc cao hơn.\nVí dụ:\na) Oxi hoá không hoàn toàn\n+ Các alcohol bậc I bị oxi hóa không hoàn toàn tạo thành aldehyde.\nTổng quát:\nR – CH2 – OH + CuO R – CHO + Cu + H2O\n+ Các alcohol bậc II bị oxi hóa không hoàn toàn tạo thành ketone.\nTổng quát:\nR – CH(OH) – R’ + CuO R – CO – R’ + Cu + H2O\n+ Trong điều kiện trên, alcohol bậc III không phản ứng.\nb) Phản ứng cháy của alcohol\nCác alcohol có thể bị đốt cháy trong không khí tạo thành carbon dioxide, hơi nước và toả nhiệt:\nCnH2n + 2O + nCO2 + (n + 1)H2O\nCác polyalcohol có các nhóm – OH liền kề như ethylene glycol, glycerol có thể tác dụng với copper(II) hydroxide tạo thành dung dịch màu xanh lam đậm.\nVí dụ:\nVì vậy, phản ứng này có thể dùng để nhận biết các polyalcohol có các nhóm – OH liền kề.",
              "keyPoints": [
                "1. Phản ứng thế nguyên tử H của nhóm – OH.",
                "2. Phản ứng tạo ether",
                "4. Phản ứng oxi hoá",
                "5. Phản ứng riêng của polyalcohol với Cu(OH)2"
              ]
            },
            {
              "id": "b22-m4",
              "sectionTitle": "III. Tính chất hoá học của phenol",
              "content": "Trong dung dịch nước, phenol phân li theo cân bằng sau:\nPhenol là một acid yếu, dung dịch phenol không làm đổi màu quỳ tím.\nPhenol có thể phản ứng được với kim loại kiềm, dung dịch base, muối sodium carbonate … 2. Phản ứng thế ở vòng thơm\nPhenol có thể tham gia phản ứng thế nguyên tử hydrogen của vòng benzene. Phản ứng thế ưu tiên vào vị trí 2, 4 và 6 (ortho và para).\na) Phản ứng bromine hoá\nPhenol phản ứng với nước bromine tạo sản phẩm thế 2,4,6 – tribromophenol ở dạng kết tủa màu trắng:\nDo ảnh hưởng của nhóm – OH, phản ứng thế nguyên tử hydrogen ở vòng benzene của phenol xảy ra dễ dàng hơn so với benzene.\nb) Phản ứng nitro hoá\nPhenol phản ứng với dung dịch nitric acid đặc trong dung dịch sulfuric acid đặc tạo thành sản phẩm 2,4,6 – trinitrophenol (picric acid):",
              "keyPoints": [
                "1. Phản ứng thế nguyên tử H của nhóm – OH (tính acid của phenol)"
              ]
            }
          ],
          "practiceQuestions": [
            {
              "id": "b22-lt1",
              "question": "Nhóm chức của alcohol là",
              "hint": "Alcohol có nhóm hydroxy −OH gắn trực tiếp vào nguyên tử carbon no. Nếu −OH gắn vào vòng benzene thì là phenol."
            },
            {
              "id": "b22-lt2",
              "question": "Công thức phân tử của phenol là",
              "hint": "Phenol là C₆H₅OH, tức C₆H₆O, gồm nhóm −OH gắn trực tiếp vào vòng benzene."
            },
            {
              "id": "b22-lt3",
              "question": "Công thức chung của alcohol no, đơn chức, mạch hở là",
              "hint": "Thay một H của alkane CₙH₂ₙ₊₂ bằng nhóm −OH ta được CₙH₂ₙ₊₁OH hay CₙH₂ₙ₊₂O với n ≥ 1."
            },
            {
              "id": "b22-lt4",
              "question": "Glycerol thuộc loại",
              "hint": "Glycerol C₃H₅(OH)₃ có ba nhóm −OH nên là alcohol đa chức, được dùng nhiều trong mỹ phẩm."
            }
          ]
        }
      }
    ]
  },
  {
    "id": "chuong-6",
    "title": "Chương 6: Hợp chất carbonyl – Carboxylic acid",
    "lessons": [
      {
        "id": "bai-23",
        "title": "Bài 23: Hợp chất carbonyl (aldehyde – ketone)",
        "summary": "- Hợp chất carbonyl là các hợp chất hữu cơ trong phân tử có chứa nhóm chức carbonyl (>C=O ). Nhóm chức carbonyl có trong aldehyde, ketone...",
        "formulae": [
          "Tên hydrocarbon (bỏ e ở cuối) – vị trí nhóm C = O – one",
          "CH3CHO + Br2 + H2O → CH3COOH + 2HBr",
          "RCHO + 2Cu(OH)2 + NaOH to→ RCOONa + Cu2O + 3H2O"
        ],
        "commonQuestions": [
          {
            "question": "Cho 7,4 gam hỗn hợp HCHO và CH₃CHO tác dụng với dung dịch AgNO₃/NH₃ dư, thu được 64,8 gam Ag. Phần trăm khối lượng HCHO trong hỗn hợp là",
            "hint": "Gọi x, y là số mol HCHO và CH₃CHO: 30x + 44y = 7,4 và 4x + 2y = 0,6 (HCHO cho 4 Ag). Giải được x = y = 0,1 → %m(HCHO) = 3/7,4 × 100% ≈ 40,54%.",
            "sampleAnswer": "40,54%"
          },
          {
            "question": "Nhận định về acetic acid.",
            "hint": "Cu đứng sau hydrogen nên không phản ứng với acetic acid. Phản ứng ester hóa là thuận nghịch nên không bao giờ hoàn toàn.",
            "sampleAnswer": ""
          },
          {
            "question": "Thứ tự tăng dần tính acid của các chất C₂H₅OH, C₆H₅OH, CH₃COOH là",
            "hint": "Ethanol hầu như không có tính acid, phenol acid rất yếu, còn acetic acid đủ mạnh để đẩy CO₂ ra khỏi muối carbonate.",
            "sampleAnswer": "C₂H₅OH < C₆H₅OH < CH₃COOH"
          }
        ],
        "textbook": {
          "pageRange": "",
          "objectives": [],
          "sections": [
            {
              "id": "b23-m1",
              "sectionTitle": "I. Khái niệm, danh pháp",
              "content": "- Hợp chất carbonyl là các hợp chất hữu cơ trong phân tử có chứa nhóm chức carbonyl (>C=O ). Nhóm chức carbonyl có trong aldehyde, ketone...\n+ Aldehyde là hợp chất hữu cơ có nhóm –CHO liên kết với nguyên tử carbon (trong gốc hydrocarbon hoặc –CHO) hoặc nguyên tử hydrogen.\nVí dụ:\nCinnamaldehyde có trong tinh dầu quế\n+ Ketone là hợp chất hữu cơ có nhóm >C=O liên kết với hai gốc hydrocarbon.\nVí dụ:\nMenthone có trong tinh dầu bạc hà\na) Danh pháp thay thế\nTên gọi theo danh pháp thay thế của aldehyde đơn chức và ketone đơn chức:\nTên aldehyde:\nTên hydrocarbon (bỏ e ở cuối) – al\nVí dụ:\n3 – methylbutanal\nTên ketone:\nTên hydrocarbon (bỏ e ở cuối) – vị trí nhóm C = O – one\nVí dụ:\nPentan – 2 – one\nChú ý:\n- Mạch carbon là mạch dài nhất chứa nhóm >C=O.\n- Mạch carbon được đánh số từ nhóm –CHO (đối với aldehyde) hoặc từ phía gần nhóm >C=O hơn (đối với ketone).\n- Đối với ketone, nếu nhóm >C=O chỉ có một vị trí duy nhất thì không cần số chỉ vị trí nhóm >C=O.\nSinh học\n- Nếu mạch carbon có nhánh thì cần thêm vị trí và tên nhánh ở phía trước.\nb) Tên thông thường\nMột số aldehyde, ketone đơn giản được gọi theo tên thông thường có nguồn gốc lịch sử. Tên thông thường của các aldehyde có nguồn gốc từ tên của acid tương ứng.\nVí dụ:\nHCHO: aldehyde formic (formaldehyde)\nCH3CHO: aldehyde acetic (acetaldehyde)\nC6H5CHO: aldehyde benzoic (benzaldehyde)\nCH3COCH3: acetone",
              "keyPoints": [
                "1. Khái niệm",
                "2. Danh pháp"
              ]
            },
            {
              "id": "b23-m2",
              "sectionTitle": "II. Đặc điểm cấu tạo",
              "content": "Liên kết đôi C = O phân cực về phía nguyên tử oxygen:"
            },
            {
              "id": "b23-m3",
              "sectionTitle": "III. Tính chất vật lí",
              "content": "Các aldehyde, ketone có nhiệt độ sôi cao hơn các hydrocarbon có khối lượng phân tử tương đương do trong phân tử chứa nhóm carbonyl phân cực làm cho phân tử aldehyde, ketone phân cực nên có nhiệt độ sôi cao hơn.\nỞ nhiệt độ thường, các aldehyde có phân tử khối nhỏ (methanal, ethanal) ở trạng thái khí, các hợp chất carbonyl thông dụng khác ở trạng thái lỏng.\nCác aldehyde, ketone có mạch carbon ngắn tan tốt trong nước. Khi số nguyên tử carbon tăng thì độ tan của hợp chất carbonyl giảm dần."
            },
            {
              "id": "b23-m4",
              "sectionTitle": "IV. Tính chất  hoá học",
              "content": "Các hợp chất carbonyl bị khử bởi các tác nhân khử như NaBH4, LiAlH4, … (kí hiệu: [H]) tạo thành các alcohol tương ứng: aldehyde bị khử thành alcohol bậc I, ketone bị khử thành alcohol bậc II.\nVí dụ:\nAldehyde dễ bị oxi hoá bởi các tác nhân oxi hoá thông thường như: Br2/H2O, [Ag(NH3)2]OH, Cu(OH)2/OH- ….\na) Oxi hoá aldehyde bởi nước bromine\nAldehyde bị oxi hoá bởi nước bromine tạo thành carboxylic acid.\nVí dụ:\nCH3CHO + Br2 + H2O → CH3COOH + 2HBr\nb) Oxi hoá aldehyde bởi thuốc thử Tollens\nThuốc thử Tollens là phức chất của ion Ag+ với ammonia, có công thức [Ag(NH3)2]OH. Ion Ag+ trong thuốc thử Tollens đóng vai trò là chất oxi hoá:\nRCHO + 2[Ag(NH3)2]OH  RCOONH4 + 2Ag + 3NH3 + H2O\nVí dụ:\nCH3CHO + 2[Ag(NH3)2]OH  CH3COONH4 + 2Ag + 3NH3 + H2O\nPhản ứng tạo thành lớp bạc sáng bóng bám vào bình phản ứng, vì vậy phản ứng này còn được gọi là phản ứng tráng bạc.\nKetone không bị oxi hoá bởi thuốc thử Tollens, vì vậy có thể dùng thuốc thử Tollens để phân biệt aldehyde với ketone và các hợp chất khác.\nc) Oxi hoá aldehyde bằng copper(II) hydroxide\nAldehyde có thể bị oxi hoá bởi copper(II) hidroxide Cu(OH)2 trong môi trường kiềm khi đun nóng tạo thành kết tủa copper(I) oxide (Cu2O) màu đỏ gạch:\nRCHO + 2Cu(OH)2 + NaOH to→ RCOONa + Cu2O + 3H2O\nHợp chất carbonyl có thể tham gia phản ứng cộng với HCN vào liên kết đôi C = O.\nVí dụ:\nCác hợp chất aldehyde, ketone có nhóm methyl cạnh nhóm carbonyl có thể phản ứng với I2 trong môi trường kiềm.\nVí dụ:\nPhản ứng tạo sản phẩm kết tủa iodoform nên phản ứng này được gọi là phản ứng iodoform và được dùng để nhận biết các aldehyde, ketone có nhóm methyl cạnh nhóm carbonyl.",
              "keyPoints": [
                "1. Phản ứng khử",
                "2. Phản ứng oxi  hoá aldehyde",
                "3. Phản ứng cộng",
                "4. Phản ứng tạo iodoform"
              ]
            },
            {
              "id": "b23-m5",
              "sectionTitle": "V. Ứng dụng",
              "content": "Một số ứng dụng của aldehyde và ketone được thể hiện trong sơ đồ sau:"
            },
            {
              "id": "b23-m6",
              "sectionTitle": "VI. Điều chế",
              "content": "Một số hợp chất carbonyl được tổng hợp trong công nghiệp bằng phương pháp oxi hoá các hydrocarbon, oxi hoá ethylene thành acetaldehyde, oxi hoá cumene thành acetone."
            }
          ],
          "practiceQuestions": [
            {
              "id": "b23-lt1",
              "question": "Nhóm carbonyl có công thức là",
              "hint": "Nhóm carbonyl gồm nguyên tử carbon liên kết đôi với oxygen, có mặt trong aldehyde, ketone và cả carboxylic acid."
            },
            {
              "id": "b23-lt2",
              "question": "Aldehyde chứa nhóm chức nào?",
              "hint": "Aldehyde có nhóm −CHO, tức nhóm carbonyl gắn với ít nhất một nguyên tử hydrogen ở đầu mạch."
            },
            {
              "id": "b23-lt3",
              "question": "Công thức của acetic acid là",
              "hint": "Acetic acid CH₃COOH là thành phần chính tạo vị chua của giấm ăn."
            },
            {
              "id": "b23-lt4",
              "question": "Thuốc thử Tollens dùng cho phản ứng tráng bạc là",
              "hint": "Phức [Ag(NH₃)₂]⁺ trong thuốc thử Tollens bị aldehyde khử thành Ag kim loại bám lên thành ống nghiệm như gương."
            }
          ]
        }
      },
      {
        "id": "bai-24",
        "title": "Bài 24: Carboxylic acid",
        "summary": "Carboxylic acid là các hợp chất hữu cơ trong phân tử có nhóm carboxyl (−COOH) liên kết với nguyên tử carbon (trong gốc hydrocarbon hoặc – COOH) hoặc nguyên tử hydrogen. Công thức của các carboxylic acid đơn chức thường được viết ở dạng thu gọn là RCOOH.",
        "formulae": [
          "2CH3COOH + Zn → (CH3COO)2Zn + H2",
          "CH3COOH + NaOH → CH3COONa + H2O",
          "2CH3COOH + ZnO → (CH3COO)2Zn + H2O",
          "2CH3COOH + CaCO3 → (CH3COO)2Ca + H2O + CO2"
        ],
        "commonQuestions": [
          {
            "question": "Cho 7,4 gam hỗn hợp HCHO và CH₃CHO tác dụng với dung dịch AgNO₃/NH₃ dư, thu được 64,8 gam Ag. Phần trăm khối lượng HCHO trong hỗn hợp là",
            "hint": "Gọi x, y là số mol HCHO và CH₃CHO: 30x + 44y = 7,4 và 4x + 2y = 0,6 (HCHO cho 4 Ag). Giải được x = y = 0,1 → %m(HCHO) = 3/7,4 × 100% ≈ 40,54%.",
            "sampleAnswer": "40,54%"
          },
          {
            "question": "Nhận định về acetic acid.",
            "hint": "Cu đứng sau hydrogen nên không phản ứng với acetic acid. Phản ứng ester hóa là thuận nghịch nên không bao giờ hoàn toàn.",
            "sampleAnswer": ""
          },
          {
            "question": "Thứ tự tăng dần tính acid của các chất C₂H₅OH, C₆H₅OH, CH₃COOH là",
            "hint": "Ethanol hầu như không có tính acid, phenol acid rất yếu, còn acetic acid đủ mạnh để đẩy CO₂ ra khỏi muối carbonate.",
            "sampleAnswer": "C₂H₅OH < C₆H₅OH < CH₃COOH"
          }
        ],
        "textbook": {
          "pageRange": "",
          "objectives": [],
          "sections": [
            {
              "id": "b24-m1",
              "sectionTitle": "I. Khái niệm, danh pháp",
              "content": "Carboxylic acid là các hợp chất hữu cơ trong phân tử có nhóm carboxyl (−COOH) liên kết với nguyên tử carbon (trong gốc hydrocarbon hoặc – COOH) hoặc nguyên tử hydrogen.\nCông thức của các carboxylic acid đơn chức thường được viết ở dạng thu gọn là RCOOH.\nVí dụ: CH3COOH, CH2 = CHCOOH, C6H5OH.\na) Danh pháp thay thế\nTên theo danh pháp thay thế của carboxylic acid đơn chức:\n4 – methylpentanoic acid\nChú ý:\n- Mạch chính là mạch carbon dài nhất chứa nhóm – COOH và được đánh số bắt đầu từ nhóm – COOH.\n- Nếu mạch carbon có nhánh thì cần thêm vị trí và tên nhánh ở phía trước.\nb) Tên thông thường\nTên thông thường của carboxylic acid thường xuất phát từ nguồn gốc tìm ra chúng trong tự nhiên.\nVí dụ:",
              "keyPoints": [
                "1. Khái niệm",
                "2. Danh pháp"
              ]
            },
            {
              "id": "b24-m2",
              "sectionTitle": "II. Đặc điểm cấu tạo",
              "content": "Nhóm carboxyl gồm có nhóm hydroxyl ( – O – H) liên kết với nhóm carbonyl (>C=O).\nNhóm >C=O là nhóm hút electron nên liên kết O – H trong carboxylic phân cực hơn so với alcohol, phenol. Nhóm – COOH có thể phân li ra H+ nên tính chất  hoá học đặc trưng của carboxylic acid là tính acid."
            },
            {
              "id": "b24-m3",
              "sectionTitle": "III. Tính chất vật lí",
              "content": "Phân tử carboxylic acid chứa nhóm carboxyl phân cực. Các phân tử carboxyl acid liên kết hydrogen với nhau tạo thành dạng dimer (a) hoặc dạng liên phân tử (b):\nDo vậy, carboxylic acid có nhiệt độ sôi cao hơn so với hydrocarbon, alcohol, hợp chất carbonyl có phân tử khối tương đương.\nCarboxylic acid mạch ngắn là chất lỏng ở nhiệt độ phòng, carboxylic acid dạng dài là chất rắn dạng sáp. Carboxylic acid thường có mùi chua nồng.\nCarboxylic acid mạch ngắn tan tốt trong nước. Khi tăng số nguyên tử carbon trong gốc hydrocarbon thì độ tan của carboxylic acid giảm."
            },
            {
              "id": "b24-m4",
              "sectionTitle": "IV. Tính chất hoá học",
              "content": "Trong dung dịch nước, chỉ một phần nhỏ carboxylic acid phân li thành ion, vì vậy carboxylic acid là những acid yếu. Chúng thể hiện đầy đủ tính chất của acid.\nVí dụ:\n2CH3COOH + Zn → (CH3COO)2Zn + H2\nCH3COOH + NaOH → CH3COONa + H2O\n2CH3COOH + ZnO → (CH3COO)2Zn + H2O\n2CH3COOH + CaCO3 → (CH3COO)2Ca + H2O + CO2\nCarboxylic acid phản ứng với alcohol tạo thành ester và nước theo phản ứng:\nPhản ứng giữa carboxylic acid và alcohol được gọi là phản ứng ester hoá. Phản ứng có đặc điểm là thuận nghịch và thường dùng sulfuric acid đặc làm xúc tác.\nVí dụ:\nCH3COOH + C2H5OH  CH3COOC2H5 + H2O",
              "keyPoints": [
                "1. Tính acid",
                "2. Phản ứng ester  hoá"
              ]
            },
            {
              "id": "b24-m5",
              "sectionTitle": "V. Điều chế",
              "content": "Phương pháp lên men được sử dụng từ thời xa xưa để làm giấm. Nguyên liệu thường dùng là các loại rượu như rượu gạo, rượu táo, rượu vang, … Quá trình lên men nhờ vi khuẩn acetobacter (men giấm) chuyển hoá ethanol thành acetic acid bởi oxygen trong không khí.\nC2H5OH + O2 CH3COOH + H2O\nTrong công nghiệp, người ta cung cấp thêm oxygen để tăng tốc độ lên men.\nCác alkane bị oxi hoá cắt mạch tạo thành các acid:\nR – CH2 – CH2 – R’ RCOOH + R’COOH",
              "keyPoints": [
                "1. Phương pháp lên men giấm",
                "2. Phương pháp oxi hoá alkane"
              ]
            },
            {
              "id": "b24-m6",
              "sectionTitle": "VI. Ứng dụng",
              "content": "Một số ứng dụng của carboxylic acid được thể hiện trong sơ đồ sau:"
            }
          ],
          "practiceQuestions": [
            {
              "id": "b24-lt1",
              "question": "Nhóm carbonyl có công thức là",
              "hint": "Nhóm carbonyl gồm nguyên tử carbon liên kết đôi với oxygen, có mặt trong aldehyde, ketone và cả carboxylic acid."
            },
            {
              "id": "b24-lt2",
              "question": "Aldehyde chứa nhóm chức nào?",
              "hint": "Aldehyde có nhóm −CHO, tức nhóm carbonyl gắn với ít nhất một nguyên tử hydrogen ở đầu mạch."
            },
            {
              "id": "b24-lt3",
              "question": "Công thức của acetic acid là",
              "hint": "Acetic acid CH₃COOH là thành phần chính tạo vị chua của giấm ăn."
            },
            {
              "id": "b24-lt4",
              "question": "Thuốc thử Tollens dùng cho phản ứng tráng bạc là",
              "hint": "Phức [Ag(NH₃)₂]⁺ trong thuốc thử Tollens bị aldehyde khử thành Ag kim loại bám lên thành ống nghiệm như gương."
            }
          ]
        }
      },
      {
        "id": "bai-25",
        "title": "Bài 25: Ôn tập hợp chất carbonyl và carboxylic acid",
        "summary": "Các hợp chất carbonyl bị khử bởi các tác nhân khử như NaBH4, LiAlH4, … (kí hiệu: [H]) tạo thành các alcohol tương ứng: aldehyde bị khử thành alcohol bậc I, ketone bị khử thành alcohol bậc II. Ví dụ:\nAldehyde dễ bị oxi hoá bởi các tác nhân oxi hoá thông thường như: Br2/H2O, [Ag(NH3)2]OH, Cu(OH)2/OH- ….",
        "formulae": [
          "CH3CHO + Br2 + H2O → CH3COOH + 2HBr",
          "RCHO + 2[Ag(NH3)2]OH to→ RCOONH4 + 2Ag + 3NH3 + H2O",
          "RCHO + 2Cu(OH)2 + NaOH to→ RCOONa + Cu2O + 3H2O",
          "2CH3COOH + Zn → (CH3COO)2Zn + H2",
          "CH3COOH + NaOH → CH3COONa + H2O",
          "2CH3COOH + ZnO → (CH3COO)2Zn + H2O"
        ],
        "commonQuestions": [
          {
            "question": "Cho 7,4 gam hỗn hợp HCHO và CH₃CHO tác dụng với dung dịch AgNO₃/NH₃ dư, thu được 64,8 gam Ag. Phần trăm khối lượng HCHO trong hỗn hợp là",
            "hint": "Gọi x, y là số mol HCHO và CH₃CHO: 30x + 44y = 7,4 và 4x + 2y = 0,6 (HCHO cho 4 Ag). Giải được x = y = 0,1 → %m(HCHO) = 3/7,4 × 100% ≈ 40,54%.",
            "sampleAnswer": "40,54%"
          },
          {
            "question": "Nhận định về acetic acid.",
            "hint": "Cu đứng sau hydrogen nên không phản ứng với acetic acid. Phản ứng ester hóa là thuận nghịch nên không bao giờ hoàn toàn.",
            "sampleAnswer": ""
          },
          {
            "question": "Thứ tự tăng dần tính acid của các chất C₂H₅OH, C₆H₅OH, CH₃COOH là",
            "hint": "Ethanol hầu như không có tính acid, phenol acid rất yếu, còn acetic acid đủ mạnh để đẩy CO₂ ra khỏi muối carbonate.",
            "sampleAnswer": "C₂H₅OH < C₆H₅OH < CH₃COOH"
          }
        ],
        "textbook": {
          "pageRange": "",
          "objectives": [],
          "sections": [
            {
              "id": "b25-m1",
              "sectionTitle": "Mở đầu",
              "content": "HỆ THỐNG KIẾN THỨC"
            },
            {
              "id": "b25-m2",
              "sectionTitle": "I. Tính chất  hoá học hợp chất carbonyl",
              "content": "Các hợp chất carbonyl bị khử bởi các tác nhân khử như NaBH4, LiAlH4, … (kí hiệu: [H]) tạo thành các alcohol tương ứng: aldehyde bị khử thành alcohol bậc I, ketone bị khử thành alcohol bậc II.\nVí dụ:\nAldehyde dễ bị oxi hoá bởi các tác nhân oxi hoá thông thường như: Br2/H2O, [Ag(NH3)2]OH, Cu(OH)2/OH- ….\na) Oxi hoá aldehyde bởi nước bromine\nAldehyde bị oxi hoá bởi nước bromine tạo thành carboxylic acid.\nVí dụ:\nCH3CHO + Br2 + H2O → CH3COOH + 2HBr\nb) Oxi hoá aldehyde bởi thuốc thử Tollens\nThuốc thử Tollens là phức chất của ion Ag+ với ammonia, có công thức [Ag(NH3)2]OH. Ion Ag+ trong thuốc thử Tollens đóng vai trò là chất oxi hoá:\nRCHO + 2[Ag(NH3)2]OH to→ RCOONH4 + 2Ag + 3NH3 + H2O\nPhản ứng tạo thành lớp bạc sáng bóng bám vào bình phản ứng, vì vậy phản ứng này còn được gọi là phản ứng tráng bạc.\nKetone không bị oxi hoá bởi thuốc thử Tollens, vì vậy có thể dùng thuốc thử Tollens để phân biệt aldehyde với ketone và các hợp chất khác.\nc) Oxi hoá aldehyde bằng copper(II) hydroxide\nAldehyde có thể bị oxi hoá bởi copper(II) hidroxide Cu(OH)2 trong môi trường kiềm khi đun nóng tạo thành kết tủa copper(I) oxide (Cu2O) màu đỏ gạch:\nRCHO + 2Cu(OH)2 + NaOH to→ RCOONa + Cu2O + 3H2O\nHợp chất carbonyl có thể tham gia phản ứng cộng với HCN vào liên kết đôi C = O.\nCác hợp chất aldehyde, ketone có nhóm methyl cạnh nhóm carbonyl có thể phản ứng với I2 trong môi trường kiềm.\nVí dụ:\nPhản ứng tạo sản phẩm kết tủa iodoform nên phản ứng này được gọi là phản ứng iodoform và được dùng để nhận biết các aldehyde, ketone có nhóm methyl cạnh nhóm carbonyl.",
              "keyPoints": [
                "1. Phản ứng khử",
                "2. Phản ứng oxi hoá aldehyde",
                "3. Phản ứng cộng",
                "4. Phản ứng tạo iodoform"
              ]
            },
            {
              "id": "b25-m3",
              "sectionTitle": "II. Tính chất hoá học carboxylic acid",
              "content": "Trong dung dịch nước, chỉ một phần nhỏ carboxylic acid phân li thành ion, vì vậy carboxylic acid là những acid yếu. Chúng thể hiện đầy đủ tính chất của acid.\nVí dụ:\n2CH3COOH + Zn → (CH3COO)2Zn + H2\nCH3COOH + NaOH → CH3COONa + H2O\n2CH3COOH + ZnO → (CH3COO)2Zn + H2O\n2CH3COOH + CaCO3 → (CH3COO)2Ca + H2O + CO2\nCarboxylic acid phản ứng với alcohol tạo thành ester và nước theo phản ứng:\nPhản ứng giữa carboxylic acid và alcohol được gọi là phản ứng ester hoá. Phản ứng có đặc điểm là thuận nghịch và thường dùng sulfuric acid đặc làm xúc tác.",
              "keyPoints": [
                "1. Tính acid",
                "2. Phản ứng ester hoá"
              ]
            }
          ],
          "practiceQuestions": [
            {
              "id": "b25-lt1",
              "question": "Nhóm carbonyl có công thức là",
              "hint": "Nhóm carbonyl gồm nguyên tử carbon liên kết đôi với oxygen, có mặt trong aldehyde, ketone và cả carboxylic acid."
            },
            {
              "id": "b25-lt2",
              "question": "Aldehyde chứa nhóm chức nào?",
              "hint": "Aldehyde có nhóm −CHO, tức nhóm carbonyl gắn với ít nhất một nguyên tử hydrogen ở đầu mạch."
            },
            {
              "id": "b25-lt3",
              "question": "Công thức của acetic acid là",
              "hint": "Acetic acid CH₃COOH là thành phần chính tạo vị chua của giấm ăn."
            },
            {
              "id": "b25-lt4",
              "question": "Thuốc thử Tollens dùng cho phản ứng tráng bạc là",
              "hint": "Phức [Ag(NH₃)₂]⁺ trong thuốc thử Tollens bị aldehyde khử thành Ag kim loại bám lên thành ống nghiệm như gương."
            }
          ]
        }
      }
    ]
  }
];
