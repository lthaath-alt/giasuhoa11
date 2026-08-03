import { Chapter } from './types';

export const CHEMISTRY_11_CURRICULUM: Chapter[] = [
  {
    id: 'chuong-1',
    title: 'Chương 1: Cân bằng hoá học',
    lessons: [
      {
        id: 'bai-1',
        title: 'Bài 1: Khái niệm về cân bằng hoá học',
        summary: 'Học sinh nắm vững khái niệm phản ứng một chiều, phản ứng thuận nghịch và trạng thái cân bằng hóa học. Hiểu được hằng số cân bằng Kc chỉ phụ thuộc vào bản chất của chất phản ứng và nhiệt độ. Hiểu nguyên lí chuyển dịch cân bằng Le Chatelier: Khi một hệ đang ở trạng thái cân bằng chịu một tác động từ bên ngoài như thay đổi nhiệt độ, nồng độ hoặc áp suất, cân bằng sẽ chuyển dịch theo chiều làm giảm tác động đó.',
        formulae: [
          'Hằng số cân bằng Kc: Phản ứng aA + bB ⇌ cC + dD => Kc = ([C]^c * [D]^d) / ([A]^a * [B]^b)',
          'Tốc độ phản ứng thuận vt = kt * [A]^a * [B]^b và tốc độ phản ứng nghịch vn = kn * [C]^c * [D]^d',
          'Ở trạng thái cân bằng: vt = vn và hằng số cân bằng Kc = kt / kn'
        ],
        commonQuestions: [
          {
            question: 'Cho phản ứng thuận nghịch ở trạng thái cân bằng: N2(k) + 3H2(k) ⇌ 2NH3(k)  ΔH < 0. Để tăng hiệu suất tạo thành NH3, ta nên thay đổi nhiệt độ và áp suất như thế nào?',
            hint: 'Hãy phân tích: 1) Phản ứng thuận tỏa nhiệt (ΔH < 0) hay thu nhiệt? Theo Le Chatelier, muốn cân bằng dịch chuyển sang chiều tỏa nhiệt (thuận), ta cần tăng hay giảm nhiệt độ? 2) Số mol khí ở vế trái là bao nhiêu và vế phải là bao nhiêu? Muốn dịch chuyển theo chiều giảm số mol khí (thuận), ta cần tăng hay giảm áp suất của hệ?',
            sampleAnswer: '1. Về nhiệt độ: Phản ứng thuận tỏa nhiệt (ΔH < 0). Để cân bằng dịch chuyển theo chiều thuận, ta cần giảm nhiệt độ của hệ.\n2. Về áp suất: Vế trái có 4 mol khí (1 N2 + 3 H2), vế phải có 2 mol khí (2 NH3). Chiều thuận làm giảm số mol khí. Do đó, để cân bằng dịch chuyển theo chiều thuận, ta cần tăng áp suất chung của hệ.\nKết luận: Để tăng hiệu suất tạo NH3, cần giảm nhiệt độ thích hợp và tăng áp suất hệ.'
          },
          {
            question: 'Viết biểu thức hằng số cân bằng Kc cho phản ứng sau: CaCO3 (rắn) ⇌ CaO (rắn) + CO2 (khí).',
            hint: 'Lưu ý rất quan trọng: Trong biểu thức hằng số cân bằng Kc, các chất ở thể rắn có nồng độ coi như không đổi và bằng 1. Chúng ta có đưa chất rắn vào biểu thức Kc không?',
            sampleAnswer: 'Vì CaCO3 và CaO là các chất ở trạng thái rắn, nồng độ của chúng được coi là hằng số và không biểu diễn trong biểu thức hằng số cân bằng.\nDo đó, biểu thức hằng số cân bằng chỉ phụ thuộc vào nồng độ của chất khí duy nhất là CO2:\nKc = [CO2]'
          }
        ],
        textbook: {
          pageRange: 'Trang 6 – 19',
          objectives: [
            'Nêu được khái niệm phản ứng thuận nghịch và trạng thái cân bằng hóa học.',
            'Viết được biểu thức hằng số cân bằng (Kc) của phản ứng thuận nghịch.',
            'Thực hiện được thí nghiệm về sự dịch chuyển cân bằng hóa học.',
            'Vận dụng được nguyên lí Le Chatelier để dự đoán chiều chuyển dịch cân bằng.',
          ],
          sections: [
            {
              id: 'b1-s1',
              sectionTitle: 'I. Phản ứng thuận nghịch và trạng thái cân bằng',
              content: `Trong hóa học, phản ứng thuận nghịch là phản ứng xảy ra được theo cả hai chiều trong cùng điều kiện. Ký hiệu bằng mũi tên hai chiều (⇌).

Ví dụ điển hình: Phản ứng tổng hợp ammonia trong công nghiệp:
N₂(g) + 3H₂(g) ⇌ 2NH₃(g)   ΔH° = −92 kJ/mol

Trạng thái cân bằng hóa học là trạng thái mà tại đó tốc độ phản ứng thuận bằng tốc độ phản ứng nghịch. Ở trạng thái này, nồng độ các chất không thay đổi theo thời gian, nhưng phản ứng vẫn đang diễn ra ở cả hai chiều.

Đây là cân bằng động — không phải cân bằng tĩnh!`,
              keyPoints: [
                'Phản ứng thuận nghịch có thể xảy ra theo cả hai chiều.',
                'Cân bằng hóa học là trạng thái động: vt = vn.',
                'Nồng độ các chất không đổi khi đạt cân bằng, nhưng phản ứng vẫn tiếp diễn.',
              ],
              imagePrompt: 'Chemistry diagram showing reversible reaction equilibrium with two arrows going in opposite directions, molecular level, clean educational illustration, white background, labeled N2 H2 NH3',
              imageAlt: 'Sơ đồ phản ứng thuận nghịch ở trạng thái cân bằng',
            },
            {
              id: 'b1-s2',
              sectionTitle: 'II. Hằng số cân bằng Kc',
              content: `Với phản ứng thuận nghịch tổng quát:
aA + bB ⇌ cC + dD

Biểu thức hằng số cân bằng Kc được viết như sau:

Kc = [C]ᶜ × [D]ᵈ / ([A]ᵃ × [B]ᵇ)

Trong đó [X] là nồng độ mol của chất X tại trạng thái cân bằng (đơn vị: mol/L).

Lưu ý quan trọng:
• Chất rắn (solid) và dung môi nước (H₂O trong dung dịch loãng) KHÔNG xuất hiện trong biểu thức Kc.
• Giá trị Kc CHỈ phụ thuộc vào nhiệt độ, không phụ thuộc vào nồng độ ban đầu hay áp suất.
• Kc >> 1: Phản ứng thiên về chiều tạo sản phẩm.
• Kc << 1: Phản ứng thiên về chiều chất đầu (phản ứng hầu như không xảy ra).`,
              keyPoints: [
                'Kc chỉ phụ thuộc vào nhiệt độ.',
                'Không đưa chất rắn vào biểu thức Kc.',
                'Kc > 1: ưu tiên tạo sản phẩm; Kc < 1: ưu tiên chất đầu.',
              ],
              formulae: [
                'Kc = [C]ᶜ·[D]ᵈ / ([A]ᵃ·[B]ᵇ) — cho phản ứng aA + bB ⇌ cC + dD',
                'Ví dụ: N₂ + 3H₂ ⇌ 2NH₃ → Kc = [NH₃]² / ([N₂][H₂]³)',
              ],
              examples: [
                {
                  title: 'Ví dụ 1 (SGK tr.10)',
                  problem: 'Viết biểu thức Kc cho phản ứng: H₂(g) + I₂(g) ⇌ 2HI(g)',
                  solution: 'Kc = [HI]² / ([H₂][I₂])\n\nTất cả đều là chất khí nên đưa tất cả vào biểu thức. Số mũ bằng hệ số của phương trình.',
                },
                {
                  title: 'Ví dụ 2 (SGK tr.10)',
                  problem: 'Viết biểu thức Kc cho: CaCO₃(r) ⇌ CaO(r) + CO₂(g)',
                  solution: 'Kc = [CO₂]\n\nCaCO₃ và CaO là chất rắn nên KHÔNG đưa vào biểu thức Kc. Chỉ còn lại CO₂ là chất khí.',
                },
              ],
            },
            {
              id: 'b1-s3',
              sectionTitle: 'III. Sự chuyển dịch cân bằng hóa học',
              content: `Sự chuyển dịch cân bằng là sự di chuyển của cân bằng từ trạng thái cân bằng này sang trạng thái cân bằng mới khi điều kiện bên ngoài thay đổi.

Nguyên lí Le Chatelier (1888):
"Nếu một hệ đang ở trạng thái cân bằng mà chịu một tác động từ bên ngoài (thay đổi nồng độ, nhiệt độ, áp suất...), thì cân bằng sẽ chuyển dịch theo chiều làm GIẢM tác động đó."

Áp dụng cụ thể:
① Thay đổi nồng độ: Tăng nồng độ chất phản ứng → cân bằng chuyển dịch về phía tạo sản phẩm (chiều thuận).
② Thay đổi áp suất: Tăng áp suất → cân bằng chuyển dịch về phía có ít mol khí hơn.
③ Thay đổi nhiệt độ: Tăng nhiệt độ → cân bằng chuyển dịch theo chiều thu nhiệt.
④ Chất xúc tác: Không làm dịch chuyển cân bằng, chỉ giúp hệ đạt cân bằng nhanh hơn.`,
              keyPoints: [
                'Le Chatelier: Hệ cân bằng chống lại sự thay đổi từ bên ngoài.',
                'Tăng nồng độ chất đầu → cân bằng dịch phải (chiều thuận).',
                'Tăng áp suất → dịch về phía ít mol khí hơn.',
                'Tăng nhiệt độ → dịch theo chiều thu nhiệt.',
                'Chất xúc tác KHÔNG ảnh hưởng đến vị trí cân bằng.',
              ],
              imagePrompt: 'Le Chatelier principle diagram showing equilibrium shift with arrows, temperature pressure concentration effects, clean chemistry educational poster, colorful labels, white background',
              imageAlt: 'Sơ đồ nguyên lí Le Chatelier về chuyển dịch cân bằng',
              examples: [
                {
                  title: 'Ứng dụng trong công nghiệp Haber-Bosch',
                  problem: 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g)  ΔH = −92 kJ/mol\nTrong sản xuất NH₃, người ta dùng áp suất cao (~200 atm) và nhiệt độ ~450°C. Giải thích tại sao?',
                  solution: '• Áp suất cao: Phản ứng thuận có 4 mol khí → 2 mol khí. Tăng áp suất → cân bằng dịch về chiều thuận, tăng hiệu suất NH₃.\n• Nhiệt độ 450°C: Phản ứng thuận tỏa nhiệt → lẽ ra nên dùng nhiệt độ thấp để tăng hiệu suất. Nhưng ở nhiệt độ thấp, tốc độ phản ứng quá chậm. 450°C là sự thỏa hiệp: đủ nhanh và hiệu suất chấp nhận được (~15%).',
                },
              ],
            },
          ],
          practiceQuestions: [
            {
              id: 'b1-q1',
              question: 'Cho phản ứng: 2SO₂(g) + O₂(g) ⇌ 2SO₃(g)  ΔH < 0. Viết biểu thức Kc và cho biết cân bằng dịch chuyển theo hướng nào khi: (a) tăng nồng độ SO₂, (b) tăng nhiệt độ, (c) tăng áp suất?',
              hint: 'Kc = [SO₃]² / ([SO₂]²·[O₂]). Áp dụng Le Chatelier cho từng trường hợp.',
              answer: 'Kc = [SO₃]² / ([SO₂]²·[O₂])\n(a) Tăng [SO₂] → cân bằng dịch phải (tạo thêm SO₃).\n(b) Tăng T, phản ứng thuận tỏa nhiệt → cân bằng dịch trái.\n(c) Tăng P, vế trái 3 mol khí > vế phải 2 mol khí → cân bằng dịch phải.',
            },
            {
              id: 'b1-q2',
              question: 'Tại nhiệt độ xác định, phản ứng CO(g) + H₂O(g) ⇌ CO₂(g) + H₂(g) có Kc = 1. Hỗn hợp ban đầu có [CO] = [H₂O] = 1 M, [CO₂] = [H₂] = 0 M. Tính nồng độ các chất lúc cân bằng.',
              hint: 'Đặt x là số mol chất phản ứng. Lập bảng ICE (Initial, Change, Equilibrium). Giải phương trình Kc = x² / (1−x)² = 1.',
              answer: 'Đặt x = nồng độ CO và H₂O phản ứng.\nKc = [CO₂][H₂] / ([CO][H₂O]) = x·x / (1−x)·(1−x) = x²/(1−x)² = 1\n→ x/(1−x) = 1 → x = 0.5 M\nCân bằng: [CO]=[H₂O]=0.5 M; [CO₂]=[H₂]=0.5 M.',
            },
            {
              id: 'b1-q3',
              question: 'Chất xúc tác có làm thay đổi hằng số cân bằng Kc không? Giải thích.',
              answer: 'Không. Chất xúc tác làm tăng tốc độ cả phản ứng thuận và nghịch như nhau, giúp hệ đạt trạng thái cân bằng nhanh hơn. Tuy nhiên, nó không làm thay đổi bản chất nhiệt động học của phản ứng, nên Kc không thay đổi.',
            },
          ],
        },
      },
      {
        id: 'bai-2',
        title: 'Bài 2: Sự điện li trong dung dịch nước. Thuyết Brønsted-Lowry về acid-base',
        summary: 'Sự điện li là quá trình phân li các chất trong nước ra ion. Chất điện li mạnh gồm acid mạnh, base mạnh và hầu hết các muối tan. Chất điện li yếu gồm acid yếu và base yếu. Thuyết Brønsted-Lowry định nghĩa: Acid là chất cho proton (H+), Base là chất nhận proton (H+). Khái niệm pH = -log[H+] xác định môi trường của dung dịch: pH < 7 (môi trường acid), pH = 7 (môi trường trung tính), pH > 7 (môi trường base).',
        formulae: [
          'pH = -log[H+] => [H+] = 10^(-pH)',
          'Tích số ion của nước ở 25°C: [H+] * [OH-] = 10^(-14)',
          'pH + pOH = 14',
          'Độ điện li α = n / N (n là số phân tử phân li thành ion, N là tổng số phân tử hoà tan)'
        ],
        commonQuestions: [
          {
            question: 'Tính pH của dung dịch chứa Ba(OH)2 0,005M ở 25 độ C.',
            hint: 'Hãy thực hiện các bước sau:\n1. Ba(OH)2 là chất điện li mạnh hay yếu? Nó phân li ra bao nhiêu ion OH-?\n2. Từ nồng độ Ba(OH)2 là 0,005M, hãy tính nồng độ ion OH-.\n3. Tính pOH = -log[OH-], rồi từ đó tính pH = 14 - pOH.',
            sampleAnswer: 'Ba(OH)2 là base mạnh, điện li hoàn toàn trong nước:\nBa(OH)2 → Ba2+ + 2OH-\nNồng độ OH- phóng thích: [OH-] = 2 * C_Ba(OH)2 = 2 * 0,005 = 0,01 M = 10^-2 M.\nTa có: pOH = -log[OH-] = -log(10^-2) = 2.\nSuy ra pH ở 25°C là: pH = 14 - pOH = 14 - 2 = 12.\nKết luận: pH của dung dịch Ba(OH)2 0,005M là 12.'
          },
          {
            question: 'Trong phản ứng: NH3 + H2O ⇌ NH4+ + OH-, hãy xác định chất đóng vai trò là acid, chất nào đóng vai trò là base theo thuyết Brønsted-Lowry.',
            hint: 'Theo thuyết Brønsted-Lowry, acid là chất cho H+ và base là chất nhận H+. Hãy quan sát sự thay đổi giữa các cặp chất trước và sau phản ứng:\n- NH3 đã biến đổi thành NH4+ bằng cách nhận hay cho H+?\n- H2O đã biến đổi thành OH- bằng cách nhận hay cho H+?',
            sampleAnswer: 'Xét phản ứng thuận:\n- NH3 đã nhận 1 proton H+ từ H2O để tạo thành NH4+. Do đó, NH3 đóng vai trò là Base.\n- H2O đã nhường 1 proton H+ cho NH3 để tạo thành OH-. Do đó, H2O đóng vai trò là Acid.\nXét phản ứng nghịch:\n- NH4+ nhường H+ cho OH- nên NH4+ là Acid.\n- OH- nhận H+ từ NH4+ nên OH- là Base.'
          }
        ],
        textbook: {
          pageRange: 'Trang 20 – 34',
          objectives: [
            'Trình bày được khái niệm sự điện li, chất điện li, chất không điện li.',
            'Phân biệt được chất điện li mạnh và chất điện li yếu, viết được phương trình điện li.',
            'Trình bày được thuyết Brønsted–Lowry về acid–base.',
            'Tính được pH của dung dịch acid mạnh, base mạnh loãng.',
          ],
          sections: [
            {
              id: 'b2-s1',
              sectionTitle: 'I. Sự điện li',
              content: `Sự điện li là quá trình phân li của các chất trong nước tạo thành ion.

Chất điện li là chất khi tan trong nước phân li thành ion (dẫn điện).
Chất không điện li là chất khi tan trong nước không phân li thành ion (không dẫn điện).

Phân loại chất điện li:
• Chất điện li mạnh: phân li hoàn toàn (→ một chiều).
  - Acid mạnh: HCl, H₂SO₄, HNO₃, HClO₄...
  - Base mạnh: NaOH, KOH, Ba(OH)₂, Ca(OH)₂...
  - Hầu hết muối tan (NaCl, K₂SO₄, Na₂CO₃...)
  
• Chất điện li yếu: chỉ phân li một phần (⇌ hai chiều, có hằng số điện li Ka, Kb).
  - Acid yếu: CH₃COOH, HF, H₂CO₃, H₂S...
  - Base yếu: NH₃, Mg(OH)₂...`,
              keyPoints: [
                'Chất điện li mạnh phân li hoàn toàn (→ một chiều).',
                'Chất điện li yếu phân li một phần (⇌ hai chiều).',
                'Acid mạnh: HCl, HNO₃, H₂SO₄. Base mạnh: NaOH, KOH, Ba(OH)₂.',
              ],
              imagePrompt: 'Chemistry diagram showing strong electrolyte vs weak electrolyte dissociation in water, ions depicted as colored spheres, educational illustration, clean white background, labeled NaCl and CH3COOH',
              imageAlt: 'So sánh điện li mạnh và điện li yếu trong nước',
            },
            {
              id: 'b2-s2',
              sectionTitle: 'II. Thuyết Brønsted–Lowry về Acid–Base',
              content: `Thuyết Brønsted–Lowry (1923) mở rộng khái niệm acid–base so với thuyết Arrhenius:

• Acid: là chất NHƯỜNG proton H⁺ (chất cho proton).
• Base: là chất NHẬN proton H⁺ (chất nhận proton).

Cặp acid–base liên hợp: Mỗi acid khi nhường H⁺ sẽ tạo thành base liên hợp của nó, và ngược lại.

Ví dụ:
HCl + H₂O → Cl⁻ + H₃O⁺
• HCl là acid (nhường H⁺ cho H₂O).
• H₂O là base (nhận H⁺ từ HCl).
• Cl⁻ là base liên hợp của HCl.
• H₃O⁺ là acid liên hợp của H₂O.

Lưu ý: Nước (H₂O) có thể đóng vai trò cả acid lẫn base → Amphiprotic (lưỡng tính proton).`,
              keyPoints: [
                'Acid Brønsted: chất nhường H⁺.',
                'Base Brønsted: chất nhận H⁺.',
                'Mỗi acid có một base liên hợp và ngược lại.',
                'H₂O là chất lưỡng tính (vừa là acid vừa là base).',
              ],
              examples: [
                {
                  title: 'Ví dụ: Xác định acid/base theo Brønsted',
                  problem: 'Trong phản ứng: NH₃ + H₂O ⇌ NH₄⁺ + OH⁻\nXác định acid, base và cặp liên hợp.',
                  solution: '• NH₃ nhận H⁺ từ H₂O → NH₃ là BASE. NH₄⁺ là acid liên hợp của NH₃.\n• H₂O nhường H⁺ cho NH₃ → H₂O là ACID. OH⁻ là base liên hợp của H₂O.\nCặp liên hợp: (H₂O / OH⁻) và (NH₄⁺ / NH₃).',
                },
              ],
            },
            {
              id: 'b2-s3',
              sectionTitle: 'III. Khái niệm pH và môi trường dung dịch',
              content: `pH là đại lượng đặc trưng cho môi trường acid–base của dung dịch nước.

Tích số ion của nước (ở 25°C):
Kw = [H⁺][OH⁻] = 10⁻¹⁴

Định nghĩa pH:
pH = −log[H⁺]  ↔  [H⁺] = 10⁻ᵖᴴ

Phân loại môi trường (ở 25°C):
• pH < 7: Môi trường acid ([H⁺] > [OH⁻])
• pH = 7: Môi trường trung tính ([H⁺] = [OH⁻] = 10⁻⁷ M)
• pH > 7: Môi trường base ([H⁺] < [OH⁻])

Mối quan hệ: pH + pOH = 14 (ở 25°C)`,
              keyPoints: [
                'pH = −log[H⁺]; pOH = −log[OH⁻].',
                'pH + pOH = 14 (ở 25°C).',
                'pH < 7: acid | pH = 7: trung tính | pH > 7: base.',
              ],
              formulae: [
                'pH = −log[H⁺]',
                'pOH = −log[OH⁻]',
                'pH + pOH = 14 (25°C)',
                'Kw = [H⁺][OH⁻] = 10⁻¹⁴',
              ],
              examples: [
                {
                  title: 'Tính pH dung dịch HCl',
                  problem: 'Tính pH của dung dịch HCl 0,01 M ở 25°C.',
                  solution: 'HCl là acid mạnh, điện li hoàn toàn:\nHCl → H⁺ + Cl⁻\n[H⁺] = C_HCl = 0,01 M = 10⁻² M\npH = −log(10⁻²) = 2',
                },
                {
                  title: 'Tính pH dung dịch NaOH',
                  problem: 'Tính pH của dung dịch NaOH 0,001 M ở 25°C.',
                  solution: 'NaOH là base mạnh:\nNaOH → Na⁺ + OH⁻\n[OH⁻] = 0,001 M = 10⁻³ M\npOH = 3\npH = 14 − 3 = 11',
                },
              ],
            },
          ],
          practiceQuestions: [
            {
              id: 'b2-q1',
              question: 'Viết phương trình điện li của: (a) H₂SO₄, (b) CH₃COOH, (c) Ba(OH)₂, (d) NH₃.',
              answer: '(a) H₂SO₄ → 2H⁺ + SO₄²⁻ (điện li hoàn toàn)\n(b) CH₃COOH ⇌ CH₃COO⁻ + H⁺ (điện li một phần)\n(c) Ba(OH)₂ → Ba²⁺ + 2OH⁻ (điện li hoàn toàn)\n(d) NH₃ + H₂O ⇌ NH₄⁺ + OH⁻ (điện li một phần)',
            },
            {
              id: 'b2-q2',
              question: 'Tính pH của dung dịch Ba(OH)₂ 0,005 M ở 25°C.',
              hint: 'Ba(OH)₂ → Ba²⁺ + 2OH⁻. Mỗi mol Ba(OH)₂ cho 2 mol OH⁻.',
              answer: '[OH⁻] = 2 × 0,005 = 0,01 M = 10⁻²\npOH = 2\npH = 14 − 2 = 12',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'chuong-2',
    title: 'Chương 2: Nitrogen – Phosphorus',
    lessons: [
      {
        id: 'bai-3',
        title: 'Bài 3: Đơn chất Nitrogen và Ammonia',
        summary: 'Nitrogen (N2) là chất khí không màu, không mùi, chiếm khoảng 78% thể tích không khí. Ở nhiệt độ thường, N2 khá trơ về mặt hóa học do có liên kết ba bền vững (N≡N). Ở nhiệt độ cao, N2 hoạt động hóa học hơn, thể hiện cả tính khử (tác dụng với O2) và tính oxi hóa (tác dụng với kim loại hoạt động, H2). Ammonia (NH3) là chất khí mùi khai, tan cực kì nhiều trong nước tạo dung dịch có tính base yếu. NH3 có tính khử mạnh do N trong NH3 có số oxi hóa cực tiểu là -3.',
        formulae: [
          'Liên kết trong phân tử N2: N ≡ N (liên kết cộng hóa trị không cực)',
          'NH3 điện li yếu trong nước: NH3 + H2O ⇌ NH4+ + OH-',
          'Phản ứng oxi hóa NH3 bởi O2 có xúc tác Pt: 4NH3 + 5O2 -(t°, Pt)→ 4NO + 6H2O'
        ],
        commonQuestions: [
          {
            question: 'Vì sao ở điều kiện thường, khí nitrogen (N2) trơ về mặt hóa học, nhưng lại hoạt động ở nhiệt độ cao?',
            hint: 'Hãy nhìn vào cấu tạo phân tử của khí N2. Giữa hai nguyên tử nitrogen có liên kết gì? Năng lượng liên kết này lớn hay nhỏ? Để bẻ gãy liên kết này ở nhiệt độ thường có dễ dàng không? Khi nâng cao nhiệt độ thì năng lượng cung cấp cho các phân tử thế nào?',
            sampleAnswer: 'Trong phân tử N2, hai nguyên tử nitrogen liên kết với nhau bằng một liên kết ba bền vững (N≡N) với năng lượng liên kết cực kỳ lớn (945 kJ/mol).\nỞ điều kiện thường, năng lượng của các va chạm phân tử không đủ để phá vỡ liên kết này, nên N2 khá trơ về mặt hóa học.\nTuy nhiên ở nhiệt độ cao (hoặc có tia lửa điện), động năng các phân tử tăng mạnh, cung cấp đủ năng lượng để bẻ gãy liên kết ba này, giúp nitrogen dễ dàng phản ứng với các chất khác như O2, H2 hay kim loại hoạt động.'
          }
        ],
        textbook: {
          pageRange: 'Trang 38 – 52',
          objectives: [
            'Mô tả được cấu tạo phân tử và tính chất vật lí của nitrogen.',
            'Giải thích được tính trơ hóa học của N₂ ở nhiệt độ thường.',
            'Trình bày được tính chất hóa học của ammonia (NH₃): tính base và tính khử.',
            'Viết được phương trình hóa học minh họa các tính chất của N₂ và NH₃.',
          ],
          sections: [
            {
              id: 'b3-s1',
              sectionTitle: 'I. Đơn chất Nitrogen (N₂)',
              content: `Cấu tạo phân tử:
Phân tử N₂ gồm 2 nguyên tử nitrogen liên kết nhau bằng liên kết ba (N≡N) cực bền:
Năng lượng liên kết N≡N = 945 kJ/mol (rất lớn)

Tính chất vật lí:
• Chất khí không màu, không mùi, không vị.
• Chiếm ~78% thể tích không khí.
• Hóa lỏng ở −196°C, hóa rắn ở −210°C.
• Tan rất ít trong nước.

Tính chất hóa học:
Ở điều kiện thường: N₂ rất trơ do liên kết ba bền vững.
Ở nhiệt độ cao / có tia lửa điện: N₂ hoạt động hơn.

① Tác dụng với O₂ (tính khử):
N₂ + O₂ ⇌ 2NO  (t° > 3000°C hoặc tia lửa điện)

② Tác dụng với H₂ (tính oxi hóa):
N₂ + 3H₂ ⇌ 2NH₃  (450°C, 200 atm, xúc tác Fe)

③ Tác dụng với kim loại hoạt động (tính oxi hóa):
3Mg + N₂ → Mg₃N₂  (nhiệt độ cao)`,
              keyPoints: [
                'N₂ có liên kết ba N≡N rất bền (945 kJ/mol) → trơ ở điều kiện thường.',
                'N₂ thể hiện tính khử khi tác dụng với O₂.',
                'N₂ thể hiện tính oxi hóa khi tác dụng với H₂ và kim loại hoạt động.',
              ],
              imagePrompt: 'Nitrogen N2 molecule triple bond structure diagram, molecular orbital representation, clean chemistry educational illustration, white background, labeled atoms',
              imageAlt: 'Cấu trúc phân tử N₂ với liên kết ba',
            },
            {
              id: 'b3-s2',
              sectionTitle: 'II. Ammonia (NH₃)',
              content: `Cấu tạo phân tử:
• Phân tử có dạng chóp tam giác.
• N có 1 cặp electron tự do → là tâm cho proton.
• Phân tử có cực, tan vô hạn trong nước.

Tính chất vật lí:
• Chất khí mùi khai, nhẹ hơn không khí.
• Tan rất nhiều trong nước (ở 20°C: 1 L nước hòa tan ~700 L NH₃).

Tính chất hóa học:
① Tính base yếu (do cặp electron tự do của N):
NH₃ + H₂O ⇌ NH₄⁺ + OH⁻
NH₃ + HCl → NH₄Cl (khói trắng)

② Tính khử mạnh (N có số oxi hóa −3, thấp nhất):
4NH₃ + 3O₂ → 2N₂ + 6H₂O  (đốt trong O₂)
4NH₃ + 5O₂ →(Pt, t°) 4NO + 6H₂O  (oxi hóa có xúc tác)`,
              keyPoints: [
                'NH₃ tan rất nhiều trong nước → dung dịch có tính base yếu.',
                'NH₃ + HCl → NH₄Cl tạo khói trắng → nhận biết NH₃.',
                'NH₃ có tính khử mạnh (N: −3).',
              ],
              examples: [
                {
                  title: 'Nhận biết khí NH₃',
                  problem: 'Làm thế nào để nhận biết khí NH₃ trong phòng thí nghiệm?',
                  solution: '① Dùng quỳ tím ẩm: NH₃ làm quỳ tím ẩm chuyển xanh (do tạo môi trường base).\n② Dùng HCl đặc: Đưa đũa thủy tinh tẩm HCl đặc vào miệng bình, nếu có khói trắng (NH₄Cl) tạo thành thì là NH₃.',
                },
              ],
              imagePrompt: 'Ammonia NH3 molecule 3D structure pyramidal shape with lone pair electrons, chemistry educational poster, clean white background, labeled nitrogen hydrogen atoms',
              imageAlt: 'Cấu trúc phân tử NH₃ dạng chóp tam giác',
            },
          ],
          practiceQuestions: [
            {
              id: 'b3-q1',
              question: 'Viết phương trình hóa học khi cho NH₃ tác dụng với: (a) HNO₃, (b) H₂SO₄ loãng, (c) CuO (đun nóng).',
              answer: '(a) NH₃ + HNO₃ → NH₄NO₃\n(b) 2NH₃ + H₂SO₄ → (NH₄)₂SO₄\n(c) 2NH₃ + 3CuO → N₂ + 3Cu + 3H₂O (NH₃ khử CuO)',
            },
            {
              id: 'b3-q2',
              question: 'Tại sao N₂ được dùng để bảo quản thực phẩm và trong các bóng đèn?',
              answer: 'N₂ rất trơ hóa học ở điều kiện thường do liên kết ba N≡N bền vững. Do đó:\n• Trong bảo quản thực phẩm: N₂ ngăn O₂ tiếp xúc với thực phẩm, hạn chế oxi hóa và vi khuẩn hiếu khí.\n• Trong bóng đèn: N₂ không phản ứng với dây tóc nóng sáng, kéo dài tuổi thọ bóng đèn.',
            },
          ],
        },
      },
      {
        id: 'bai-4',
        title: 'Bài 4: Nitric Acid và muối Nitrate',
        summary: 'Nitric acid (HNO3) là chất lỏng không màu, bốc khói mạnh trong không khí ẩm, là một acid mạnh đồng thời là chất oxi hóa cực kỳ mạnh. HNO3 oxi hóa hầu hết kim loại (trừ Au, Pt) lên số oxi hóa cao nhất, giải phóng các sản phẩm khử của nitơ (NO, NO2, N2O, N2, NH4NO3) thay vì khí H2. Muối nitrate dễ tan trong nước, là chất điện li mạnh, kém bền với nhiệt và có tính oxi hóa mạnh ở nhiệt độ cao.',
        formulae: [
          'Kim loại M + HNO3 (loãng/đặc) → M(NO3)n + Sản phẩm khử (NO2/NO/N2O/N2/NH4NO3) + H2O',
          'Nhiệt phân muối nitrate: Muối của kim loại hoạt động mạnh (K -> Na) ra muối nitrite + O2; Muối của kim loại trung bình (Mg -> Cu) ra oxit kim loại + NO2 + O2; Muối của kim loại yếu (Ag, Hg...) ra kim loại + NO2 + O2'
        ],
        commonQuestions: [
          {
            question: 'Cho đồng (Cu) tác dụng với dung dịch HNO3 đặc, nóng thấy thoát ra khí màu nâu đỏ độc hại. Hãy viết phương trình hóa học và xác định khí màu nâu đỏ là khí gì? Biện pháp để giảm thiểu độc hại khi làm thí nghiệm này là gì?',
            hint: 'Khi kim loại Cu tác dụng với HNO3 đặc, sản phẩm khử chính của nitơ (+5) là gì? Khí có màu nâu đỏ là khí nào? Để hấp thụ khí có tính acid độc hại này, ta nên sử dụng một dung dịch kiềm (như NaOH hay nước vôi trong Ca(OH)2) ở nút bông của ống nghiệm đúng không?',
            sampleAnswer: 'Phương trình phản ứng:\nCu + 4HNO3 (đặc) → Cu(NO3)2 + 2NO2↑ + 2H2O\n- Khí màu nâu đỏ thoát ra chính là nitrogen dioxide (NO2), là khí rất độc hại đối với hệ hô hấp.\n- Biện pháp khắc phục trong phòng thí nghiệm: Nút ống nghiệm bằng bông tẩm dung dịch kiềm (như dung dịch NaOH hoặc Ca(OH)2). Khí NO2 thoát ra sẽ phản ứng với dung dịch kiềm tạo thành muối không bay hơi, ngăn chặn khí thoát ra ngoài môi trường không khí:\n2NO2 + 2NaOH → NaNO3 + NaNO2 + H2O'
          }
        ],
        textbook: {
          pageRange: 'Trang 53 – 66',
          objectives: [
            'Mô tả được cấu tạo phân tử và tính chất vật lí của HNO₃.',
            'Giải thích được HNO₃ vừa là acid mạnh vừa là chất oxi hóa mạnh.',
            'Viết được PTHH của HNO₃ với kim loại, phi kim, hợp chất.',
            'Trình bày được tính chất và ứng dụng của muối nitrate.',
          ],
          sections: [
            {
              id: 'b4-s1',
              sectionTitle: 'I. Nitric Acid (HNO₃)',
              content: `Cấu tạo phân tử:
N có số oxi hóa +5 (cao nhất) → HNO₃ có tính oxi hóa rất mạnh.

Tính chất vật lí:
• Chất lỏng không màu, bốc khói mạnh trong không khí ẩm.
• Bị phân hủy một phần khi tiếp xúc ánh sáng → dung dịch dần có màu vàng (do NO₂).
• Axit mạnh, tan vô hạn trong nước.

Tính chất hóa học:
① Tính acid mạnh: Tác dụng với oxide base, base, muối (như acid mạnh thông thường).
② Tính oxi hóa mạnh: Đặc điểm nổi bật nhất.
   • HNO₃ đặc → sản phẩm khử chủ yếu là NO₂ (khí màu nâu đỏ).
   • HNO₃ loãng → sản phẩm khử chủ yếu là NO (khí không màu).
   • Không tác dụng với Au, Pt.
   • Sắt (Fe) và nhôm (Al) bị thụ động hóa trong HNO₃ đặc, nguội.`,
              keyPoints: [
                'HNO₃ vừa là acid mạnh vừa là chất oxi hóa mạnh (N: +5).',
                'HNO₃ đặc + kim loại → NO₂ (nâu đỏ).',
                'HNO₃ loãng + kim loại → NO (không màu).',
                'Fe, Al thụ động hóa trong HNO₃ đặc nguội.',
              ],
              formulae: [
                'Cu + 4HNO₃ (đặc) → Cu(NO₃)₂ + 2NO₂↑ + 2H₂O',
                '3Cu + 8HNO₃ (loãng) → 3Cu(NO₃)₂ + 2NO↑ + 4H₂O',
                'Fe + 4HNO₃ (loãng) → Fe(NO₃)₃ + NO↑ + 2H₂O',
              ],
              imagePrompt: 'HNO3 nitric acid reacting with copper metal, brown NO2 gas bubbling, chemistry lab flask, educational illustration, clear labels, colorful chemistry diagram',
              imageAlt: 'Phản ứng Cu + HNO₃ đặc tạo khí NO₂ màu nâu đỏ',
            },
            {
              id: 'b4-s2',
              sectionTitle: 'II. Muối Nitrate',
              content: `Tính chất:
• Tất cả muối nitrate đều tan trong nước.
• Là chất điện li mạnh.
• Kém bền với nhiệt: bị phân hủy khi đun nóng.
• Có tính oxi hóa mạnh ở nhiệt độ cao.

Quy tắc nhiệt phân muối nitrate:
① Kim loại hoạt động mạnh (trước Mg: K, Na, Ca...):
2KNO₃ → 2KNO₂ + O₂ (tạo muối nitrite)

② Kim loại trung bình (Mg đến Cu):
2Cu(NO₃)₂ → 2CuO + 4NO₂ + O₂ (tạo oxit kim loại)

③ Kim loại yếu (sau Cu: Ag, Hg, Au):
2AgNO₃ → 2Ag + 2NO₂ + O₂ (tạo kim loại)

Ứng dụng: Phân đạm (NH₄NO₃, Ca(NO₃)₂), thuốc nổ đen (KNO₃), chất oxi hóa trong pháo hoa.`,
              keyPoints: [
                'Tất cả muối nitrate tan trong nước.',
                'Nhiệt phân: hoạt động mạnh → nitrite; trung bình → oxit; yếu → kim loại.',
                'Nhận biết ion NO₃⁻: dùng Cu + H₂SO₄ loãng → khí NO không màu, hóa nâu ngoài không khí.',
              ],
              examples: [
                {
                  title: 'Nhiệt phân Fe(NO₃)₃',
                  problem: 'Viết phương trình nhiệt phân Fe(NO₃)₃.',
                  solution: 'Fe đứng sau Mg và trước Cu, thuộc nhóm kim loại trung bình:\n4Fe(NO₃)₃ → 2Fe₂O₃ + 12NO₂ + 3O₂',
                },
              ],
            },
          ],
          practiceQuestions: [
            {
              id: 'b4-q1',
              question: 'Hòa tan 9,6 g Cu vào HNO₃ loãng (dư), thu được V lít NO (đktc). Tính V.',
              hint: 'nCu = 9,6/64 = 0,15 mol. Từ phương trình: 3Cu + 8HNO₃(loãng) → 3Cu(NO₃)₂ + 2NO + 4H₂O.',
              answer: 'nCu = 0,15 mol\n3Cu + 8HNO₃ → 3Cu(NO₃)₂ + 2NO + 4H₂O\nnNO = (2/3) × 0,15 = 0,1 mol\nV = 0,1 × 22,4 = 2,24 lít',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'chuong-3',
    title: 'Chương 3: Đại cương hoá học hữu cơ',
    lessons: [
      {
        id: 'bai-5',
        title: 'Bài 5: Hợp chất hữu cơ và hóa học hữu cơ',
        summary: 'Hợp chất hữu cơ là hợp chất của carbon (trừ CO, CO2, muối cacbonat, xianua, cacbua...). Hóa học hữu cơ là ngành hóa học chuyên nghiên cứu về các hợp chất hữu cơ. Hợp chất hữu cơ được chia thành hai loại lớn: Hydrocarbon (chỉ chứa C và H) và Dẫn xuất của hydrocarbon (ngoài C, H còn có các nguyên tố khác như O, N, S, halogen...). Đặc điểm chung: liên kết chủ yếu là cộng hóa trị, nhiệt độ nóng chảy và sôi thấp, kém bền với nhiệt, phản ứng thường xảy ra chậm và theo nhiều hướng.',
        formulae: [
          'Công thức phân tử tổng quát: CxHyOzNt',
          'Thiết lập CTPT từ thành phần phần trăm khối lượng: x : y : z = (%mC/12) : (%mH/1) : (%mO/16)'
        ],
        commonQuestions: [
          {
            question: 'Phân tích một hợp chất hữu cơ X thấy chứa 85,7% Carbon và 14,3% Hydrogen về khối lượng. Tỉ khối hơi của X so với khí Hydrogen là 28. Xác định công thức phân tử của X.',
            hint: 'Hãy đi từng bước giải quyết:\n1. Tính khối lượng mol của X dựa trên tỉ khối so với H2: M_X = d_X/H2 * M_H2.\n2. Gọi công thức đơn giản nhất của X là CxHy. Lập tỉ lệ x : y = %C/12 : %H/1. Tìm công thức thực nghiệm.\n3. Dựa trên khối lượng mol M_X vừa tính được ở bước 1 để tìm công thức phân tử chính xác.',
            sampleAnswer: 'Bước 1: Tính khối lượng mol của X:\nM_X = d_X/H2 * M_H2 = 28 * 2 = 56 g/mol.\n\nBước 2: Tìm công thức thực nghiệm:\nTa có tỉ lệ x : y = (%mC / 12) : (%mH / 1) = (85,7 / 12) : (14,3 / 1) = 7,14 : 14,3 ≈ 1 : 2.\n=> Công thức thực nghiệm là (CH2)n.\n\nBước 3: Tìm công thức phân tử:\nM_X = (12 + 2 * 1) * n = 56 => 14n = 56 => n = 4.\nVậy công thức phân tử của X là C4H8.'
          }
        ],
        textbook: {
          pageRange: 'Trang 70 – 82',
          objectives: [
            'Nêu được khái niệm hợp chất hữu cơ và hóa học hữu cơ.',
            'Phân loại được hợp chất hữu cơ thành hydrocarbon và dẫn xuất.',
            'Lập được công thức phân tử hợp chất hữu cơ từ kết quả phân tích nguyên tố.',
            'Trình bày được đặc điểm chung của hợp chất hữu cơ.',
          ],
          sections: [
            {
              id: 'b5-s1',
              sectionTitle: 'I. Khái niệm hợp chất hữu cơ',
              content: `Hợp chất hữu cơ là hợp chất của nguyên tố carbon (C), thường có thêm H, O, N, S, halogen...

Ngoại lệ – KHÔNG phải hợp chất hữu cơ dù có C:
• CO, CO₂ (oxide của carbon)
• Muối cacbonat (Na₂CO₃, CaCO₃...)
• Xianua (HCN, NaCN)
• Cacbua (CaC₂, SiC...)

Phân loại hợp chất hữu cơ:
① Hydrocarbon: Chỉ chứa C và H.
   • Mạch hở (acyclic): Alkane, Alkene, Alkyne...
   • Mạch vòng (cyclic): Cycloalkane, Benzene...
   
② Dẫn xuất của hydrocarbon: Ngoài C, H còn có O, N, S, halogen...
   • Dẫn xuất halogen (R–X): CH₃Cl, CHCl₃...
   • Ancol (R–OH): C₂H₅OH...
   • Acid carboxylic (R–COOH): CH₃COOH...
   • Amine (R–NH₂): CH₃NH₂...`,
              keyPoints: [
                'Hợp chất hữu cơ là hợp chất của C (trừ CO, CO₂, cacbonat, xianua, cacbua).',
                'Phân loại: Hydrocarbon (chỉ C, H) và dẫn xuất (có thêm O, N, S, halogen).',
              ],
              imagePrompt: 'Organic chemistry classification tree diagram showing hydrocarbon and derivatives, colorful branches with examples like CH4 C2H5OH CH3COOH, clean educational poster white background',
              imageAlt: 'Sơ đồ phân loại hợp chất hữu cơ',
            },
            {
              id: 'b5-s2',
              sectionTitle: 'II. Đặc điểm của hợp chất hữu cơ',
              content: `So với hợp chất vô cơ, hợp chất hữu cơ có những đặc điểm riêng biệt:

① Về liên kết: Chủ yếu là liên kết cộng hóa trị (C–C, C–H, C–O...), ít phân cực → không dẫn điện.

② Về nhiệt độ nóng chảy/sôi: Thường thấp hơn hợp chất vô cơ, dễ bay hơi.

③ Độ bền nhiệt: Kém bền, dễ bị phân hủy khi đun nóng mạnh (carbonized).

④ Tốc độ phản ứng: Thường chậm hơn, cần xúc tác, đun nóng.

⑤ Phản ứng theo nhiều hướng: Thường tạo hỗn hợp sản phẩm (phản ứng chính + phụ).

⑥ Tính tan: Thường tan trong dung môi hữu cơ (cồn, ete, benzene), ít tan hoặc không tan trong nước.`,
              keyPoints: [
                'Liên kết cộng hóa trị → không dẫn điện.',
                'Nhiệt độ nc/sôi thấp, kém bền nhiệt.',
                'Phản ứng chậm, theo nhiều hướng.',
                'Tan trong dung môi hữu cơ.',
              ],
            },
            {
              id: 'b5-s3',
              sectionTitle: 'III. Xác định công thức phân tử hợp chất hữu cơ',
              content: `Phương pháp phân tích nguyên tố:
Đốt cháy hợp chất hữu cơ CxHyOz → thu CO₂ và H₂O để xác định %C và %H, phần còn lại là %O.

Lập công thức từ %thành phần:
x : y : z = (%C/12) : (%H/1) : (%O/16)

→ Tìm tỉ lệ số nguyên tối giản → Công thức thực nghiệm (CTTN).

Từ CTTN → Công thức phân tử (CTPT):
• CTPT = (CTTN)ₙ
• n = M_hợp chất / M_CTTN (M_CTTN tính từ tỉ lệ tối giản)`,
              keyPoints: [
                'Đốt cháy hữu cơ → CO₂ + H₂O → tính %C, %H, %O.',
                'x:y:z = (%C/12) : (%H/1) : (%O/16) → CTTN.',
                'Kết hợp M để tìm CTPT = (CTTN)ₙ.',
              ],
              formulae: [
                'nC = nCO₂; nH = 2×nH₂O',
                'x:y:z = (%C/12) : (%H/1) : (%O/16)',
                'CTPT = (CTTN)ₙ, với n = M/(M_CTTN)',
              ],
              examples: [
                {
                  title: 'Ví dụ tìm CTPT (SGK tr.78)',
                  problem: 'Đốt cháy hoàn toàn 0,1 mol hợp chất hữu cơ X thu được 0,2 mol CO₂ và 0,3 mol H₂O. X có M = 46 g/mol. Xác định CTPT của X.',
                  solution: 'nC = nCO₂ = 0,2 mol → trong 0,1 mol X có 0,2 mol C → 2 nguyên tử C.\nnH = 2×nH₂O = 0,6 mol → 6 nguyên tử H.\nmO = 46 – 2×12 – 6×1 = 46 – 24 – 6 = 16 → 1 nguyên tử O.\nCTPT: C₂H₆O (ethanol hoặc dimethyl ether).',
                },
              ],
            },
          ],
          practiceQuestions: [
            {
              id: 'b5-q1',
              question: 'Chất nào sau đây là hợp chất hữu cơ: CO₂, C₂H₅OH, Na₂CO₃, CH₃COOH, CaC₂, C₆H₆?',
              answer: 'Hợp chất hữu cơ: C₂H₅OH (ethanol), CH₃COOH (acid acetic), C₆H₆ (benzene).\nKhông phải hữu cơ: CO₂ (oxide carbon), Na₂CO₃ (muối cacbonat), CaC₂ (cacbua).',
            },
            {
              id: 'b5-q2',
              question: 'Hợp chất hữu cơ X chứa 38,7% C, 9,7% H và 51,6% O (theo khối lượng). M_X = 62 g/mol. Xác định CTPT của X.',
              hint: 'x:y:z = (38,7/12) : (9,7/1) : (51,6/16) = 3,225 : 9,7 : 3,225 = 1:3:1 → CTTN: CH₃O',
              answer: 'x:y:z = (38,7/12) : (9,7/1) : (51,6/16) ≈ 1:3:1\nCTTN: CH₃O; M_CTTN = 31\nn = 62/31 = 2\nCTPT: C₂H₆O₂ (ethylene glycol)',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'chuong-4',
    title: 'Chương 4: Hydrocarbon',
    lessons: [
      {
        id: 'bai-6',
        title: 'Bài 6: Alkane - Hydrocarbon no',
        summary: 'Alkane là các hydrocarbon mạch hở chỉ chứa liên kết đơn C-C và C-H trong phân tử. Công thức chung: CnH2n+2 (n ≥ 1). Phản ứng đặc trưng của Alkane là phản ứng thế halogen (thế ưu tiên vào carbon bậc cao hơn - quy tắc thế). Ngoài ra alkane còn tham gia phản ứng cracking, phản ứng oxi hóa (đốt cháy).',
        formulae: [
          'Công thức chung của Alkane: CnH2n+2 (n ≥ 1)',
          'Phản ứng thế halogen (clo hóa): CnH2n+2 + Cl2 -(as)→ CnH2n+1Cl + HCl',
          'Phản ứng đốt cháy: CnH2n+2 + (3n+1)/2 O2 → nCO2 + (n+1)H2O  (Lưu ý: nH2O > nCO2 và n_alkane = nH2O - nCO2)'
        ],
        commonQuestions: [
          {
            question: 'Khi tiến hành cho propane (CH3-CH2-CH3) tác dụng với chlorine (Cl2) theo tỉ lệ mol 1:1 ngoài ánh sáng, hãy xác định sản phẩm thế chính là gì và giải thích vì sao.',
            hint: 'Hãy nhớ lại quy tắc thế halogen vào alkane: Halogen ưu tiên thế vào nguyên tử hydrogen liên kết với nguyên tử carbon bậc cao hơn (carbon có ít hydrogen hơn). Trong propane, có 2 bậc carbon là bậc 1 (ở hai đầu -CH3) và bậc 2 (ở giữa -CH2-). Carbon nào có bậc cao hơn?',
            sampleAnswer: 'Trong phân tử propane (CH3-CH2-CH3), nguyên tử carbon ở giữa là carbon bậc 2, còn hai nguyên tử carbon ở đầu là carbon bậc 1.\nTheo quy tắc thế của alkane, nguyên tử chlorine sẽ ưu tiên thế vào nguyên tử hydrogen liên kết với carbon bậc cao hơn (bậc 2) để tạo sản phẩm chính bền vững hơn.\nDo đó:\n- Sản phẩm chính: 2-chloropropane (CH3-CHCl-CH3) (khoảng 55-60%)\n- Sản phẩm phụ: 1-chloropropane (CH3-CH2-CH2Cl)'
          }
        ],
        textbook: {
          pageRange: 'Trang 86 – 98',
          objectives: [
            'Nêu được khái niệm và công thức chung của alkane.',
            'Gọi được tên và viết được CTCT của các alkane đơn giản.',
            'Trình bày được tính chất hóa học đặc trưng của alkane: phản ứng thế, cracking và đốt cháy.',
            'Giải thích được quy tắc ưu tiên thế halogen.',
          ],
          sections: [
            {
              id: 'b6-s1',
              sectionTitle: 'I. Đồng đẳng, đồng phân và danh pháp',
              content: `Định nghĩa:
Alkane (hydrocarbon no, mạch hở) là hydrocarbon chỉ chứa liên kết đơn C–C.
Công thức chung: CₙH₂ₙ₊₂ (n ≥ 1)

Dãy đồng đẳng:
CH₄ (methane, n=1) → C₂H₆ (ethane) → C₃H₈ (propane) → C₄H₁₀ (butane) → ...

Danh pháp IUPAC:
• Chọn mạch carbon dài nhất làm mạch chính.
• Đánh số từ đầu gần nhánh nhất.
• Tên = Tên nhánh + Tên mạch chính + "ane"

Ví dụ: CH₃–CH(CH₃)–CH₃ → 2-methylpropane (isobutane)

Đồng phân cấu trúc:
• n-butane: CH₃–CH₂–CH₂–CH₃ (mạch thẳng)
• 2-methylpropane: (CH₃)₃CH (mạch nhánh)`,
              keyPoints: [
                'Công thức chung: CₙH₂ₙ₊₂.',
                'Từ C₄ trở lên có đồng phân mạch carbon.',
                'Danh pháp: nhánh + tên mạch chính + ane.',
              ],
              imagePrompt: 'Alkane homologous series methane ethane propane butane molecular models, ball and stick 3D models, clean chemistry educational illustration, white background, labeled formulas',
              imageAlt: 'Dãy đồng đẳng alkane từ methane đến butane',
            },
            {
              id: 'b6-s2',
              sectionTitle: 'II. Tính chất vật lí và hóa học',
              content: `Tính chất vật lí:
• C₁–C₄: Chất khí (ở điều kiện thường).
• C₅–C₁₇: Chất lỏng.
• C₁₈ trở lên: Chất rắn.
• Không màu, không tan trong nước, nhẹ hơn nước.
• Dễ cháy → tỏa nhiệt lớn.

Tính chất hóa học:
Alkane khá trơ do chỉ có liên kết σ bền. Phản ứng đặc trưng:

① Phản ứng thế (halogen hóa):
CₙH₂ₙ₊₂ + Cl₂ →(as) CₙH₂ₙ₊₁Cl + HCl
Quy tắc: Cl ưu tiên thế vào C bậc cao hơn.

② Phản ứng cracking (bẻ gãy mạch C):
C₄H₁₀ →(t°, xt) C₂H₄ + C₂H₆ (hoặc CH₄ + C₃H₆...)

③ Phản ứng đốt cháy:
CₙH₂ₙ₊₂ + (3n+1)/2 O₂ → n CO₂ + (n+1) H₂O
Nhận biết: nH₂O > nCO₂; nalkane = nH₂O − nCO₂`,
              keyPoints: [
                'Phản ứng đặc trưng của alkane: phản ứng thế (SR).',
                'Halogen thế vào C bậc cao hơn → sản phẩm chính.',
                'Đốt cháy: nH₂O > nCO₂ → nhận biết alkane.',
                'Cracking: tạo alkene và alkane nhỏ hơn.',
              ],
              formulae: [
                'CₙH₂ₙ₊₂ + Cl₂ →(ánh sáng) CₙH₂ₙ₊₁Cl + HCl',
                'CₙH₂ₙ₊₂ + (3n+1)/2 O₂ → nCO₂ + (n+1)H₂O',
                'Nhận biết alkane: nH₂O > nCO₂, nalkane = nH₂O − nCO₂',
              ],
              examples: [
                {
                  title: 'Xác định sản phẩm chính phản ứng thế',
                  problem: 'Cho propane tác dụng với Cl₂ (tỉ lệ 1:1, ánh sáng). Xác định sản phẩm chính.',
                  solution: 'CH₃–CH₂–CH₃ có:\n• 2 C bậc 1 (hai đầu, 6H)\n• 1 C bậc 2 (giữa, 2H)\nCl ưu tiên thế vào C bậc 2:\nSản phẩm chính: CH₃–CHCl–CH₃ (2-chloropropane)\nSản phẩm phụ: CH₃–CH₂–CH₂Cl (1-chloropropane)',
                },
              ],
            },
          ],
          practiceQuestions: [
            {
              id: 'b6-q1',
              question: 'Đốt cháy hoàn toàn hỗn hợp 2 alkane liên tiếp trong dãy đồng đẳng thu được 6,72 lít CO₂ (đktc) và 7,2 g H₂O. Xác định CTPT của hai alkane.',
              hint: 'nCO₂ = 0,3 mol, nH₂O = 0,4 mol. Alkane: nH₂O > nCO₂. nalkane = nH₂O − nCO₂ = 0,1 mol. C_trung bình = nCO₂/nalkane = 3.',
              answer: 'nCO₂ = 0,3 mol; nH₂O = 0,4 mol\nnalkane = nH₂O − nCO₂ = 0,1 mol\nC̄ = 0,3/0,1 = 3 (giữa 2 và 4)\n→ Hai alkane: C₂H₆ (ethane) và C₃H₈ (propane).',
            },
            {
              id: 'b6-q2',
              question: 'Viết tất cả các đồng phân alkane có CTPT C₅H₁₂ và gọi tên theo danh pháp IUPAC.',
              answer: '① n-pentane: CH₃CH₂CH₂CH₂CH₃\n② 2-methylbutane: CH₃CH(CH₃)CH₂CH₃\n③ 2,2-dimethylpropane: C(CH₃)₄ (neopentane)',
            },
          ],
        },
      },
    ],
  },
];
