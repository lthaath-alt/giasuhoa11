NHAC TU HOOK (chay moi luot, KHONG phai loi user — dung tra loi rieng ve no)

════════════════════════════════════════════════════════════════════
VIEC DANG LAM: DOT 2c — chon lop tu danh sach, va cong dang nhap
════════════════════════════════════════════════════════════════════

Spec    : docs/superpowers/specs/2026-09-12-chon-lop-va-cong-dang-nhap-design.md
Ke hoach: docs/superpowers/plans/2026-09-12-chon-lop-va-cong-dang-nhap.md
          4 viec. MOI buoc da co ma that — dung tu nghi ra ma khac.

BAT BUOC truoc khi go dong dau tien:
  1. Goi Skill "executing-plans" (hoac subagent-driven-development)
  2. Doc lai ke hoach o tren
Truoc khi noi "xong" mot viec: goi Skill "verification-before-completion".

THU TU KHONG DUOC DAO:
  1 chon lop -> 2 bo o ma o man dang ky -> 3 cong dang nhap
  -> 4 BUILD + DEPLOY + THU TAY BA VAI      <- CONG, chu du an lam

Viec 3 cham duong dang nhap cua MOI nguoi. Lam sau cung de neu hong thi biet
chac loi den tu dau.

BA DIEU KHONG DUOC QUEN O DOT 2c:
  - TUYET DOI KHONG dung `firestore.rules`. Luat da publish 12/09/2026, qua 24
    phep thu o Rules Playground, va do lai bang REST: 11/11 dat.
  - Chon lop xong VAN goi joinClassByCode(inviteCode). Luat chi cho hoc sinh ghi
    `pendingClassCode`, KHONG cho ghi `classId` — doi co che la phai mo lai luat.
  - PublicRoute va LoginPage.handleSuccess dang CHAY DUA sau khi dang nhap. Bo
    PublicRoute ma khong sua handleSuccess thi giao vien va quan tri bi do het
    vao /dashboard. Va handleSuccess KHONG doc duoc vai ngay: login() goi
    signInWithEmailAndPassword, con ho so ve SAU qua onAuthStateChanged.
    -> dung co "da bam vao" + useEffect cho currentUser xuat hien.

────────────────────────────────────────────────────────────────────
DA XONG, dung lam lai
────────────────────────────────────────────────────────────────────
Dot 1 (Firebase Auth)        : XONG 10/09/2026, 8/8 viec.
Dot 2 + 2b (luat theo vai)   : XONG va DA PUBLISH 12/09/2026.
  Do lai bang REST khong dang nhap ngay sau publish: 11/11 dat.
    bank_questions 252 tai lieu DOC DUOC  -> dong bo dem song
    users/classes/progress/chats BI CHAN  -> truoc do doc duoc cong khai
  Lo hong lon nhat cua du an (users doc cong khai, gom email hoc sinh) DA DONG.

Sau loi hoc dat nhat cua dot 2b, ghi lai keo quen:
  1. Ke hoach liet ke BON CHO CAN SUA thay vi noi MUC TIEU -> nguoi lam sua du
     bon cho roi dung, con sot hai cho. Noi muc tieu, kem lenh "tu grep rong".
  2. Xep mot diem yeu cua phep kiem la "tham my" roi hoan -> chinh no dang LAM
     MU phep kiem. Dung phan loai truoc khi biet no che mat cai gi.
  3. Soat luat nhu ke tan cong 11 duong, ma khong tu hoi "nguoi dung bam vao
     dau de thay cai khung nay" -> ca tinh nang nam chet sau mot tab da bi an.
  4. Bang thu 22 phep khong co phep nao kiem hoc sinh doc ho so CHINH MINH —
     tuc dung duong dang nhap. Cho thieu nang nhat lai la cho khong ai nghi ra.
  5. `sed` ghi lai tep bang LF lam git bao tep da sua. Doi chieu bam sha256 sau
     khi bo CR truoc khi ket luan la "khong doi gi".
  6. Chu thich dau mot tep an ninh noi NGUOC voi chinh tep do -> nguoi doc tu
     tren xuong se di "don" khoi phan quyen. Sua chu thich la viec 2 phut.

────────────────────────────────────────────────────────────────────
NHAC CHUNG — chon ky nang truoc khi doc ma hay sua ma
────────────────────────────────────────────────────────────────────
  viec mo ho / nhieu duong lam        -> brainstorming
  co gi hong, sai, khong nhu mong doi -> systematic-debugging
  sap noi "xong"                      -> verification-before-completion
  nhieu buoc, nhieu tep               -> writing-plans roi executing-plans
  tim ky nang CHUA co tren mang       -> find-skills (hoi user truoc khi chay npx)

Goi bang cong cu Skill. Bo qua neu chi la cau hoi ngan hoac sua mot dong.

────────────────────────────────────────────────────────────────────
Doi viec khac thi SUA CHINH TEP NAY (.claude/nhac-moi-luot.md), khong
phai sua .claude/settings.json. Hook chi lam moi viec `cat` tep nay ra.
Bat dau mot dot moi thi ghim vao khoi tren cung; xong thi go ra.
