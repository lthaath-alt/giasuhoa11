NHAC TU HOOK (chay moi luot, KHONG phai loi user — dung tra loi rieng ve no)

════════════════════════════════════════════════════════════════════
KHONG CO DOT NAO DANG CHAY. Dot 3 (3a + 3b) da dong 13/09/2026.
════════════════════════════════════════════════════════════════════

CON DUNG MOT viec chu du an neu ma CHUA chot:
  Kho mat khau cho quan tri xem — DA TU CHOI, dang ban tiep.
  Ly do thuc dung: mat khau cu DA BAM, kho moi chi hung duoc tu luc bat
  tro di, nen KHONG cuu duoc tai khoan da quen. Ly do an ninh: dung cai
  lo da dong 10/09/2026 (mat khau chu thuong + XSS = mat sach tai khoan
  hoc sinh), va kieu `User` khong co truong `password` — 4 phep kiem
  canh dieu do.
  Nhu cau THAT co the la: hoc sinh quen mat khau giua gio, thay can cap
  lai ngay; ma hoc sinh dung <username>@internal.local thi KHONG nhan
  duoc thu dat lai. Loi giai dung: nut "cap mat khau moi" hien MOT LAN,
  khong cat o dau — can Cloud Function + Admin SDK, tuc goi Blaze.
  DA HOI HAI LAN, chua duoc tra loi: nhu cau that la "hoc sinh quen mat
  khau giua gio" hay chi la "bi voi dong tai khoan thu"? Hoi lai truoc
  khi thiet ke bat cu thu gi.

MOT CHO MA CHET tim ra 13/09/2026, moi BAO chu chua xoa:
  src/features/admin/components/SchoolTab.tsx — 207 dong, co du nut "Them
  giao vien" / "Them Admin Truong" / "Them lop", nhung KHONG TEP NAO dung
  no. Duong that nam o AdminPage -> ManagementLayout -> "Quan ly Tai khoan"
  -> nut "Them tai khoan Giao vien".

────────────────────────────────────────────────────────────────────
DA XONG, dung lam lai
────────────────────────────────────────────────────────────────────
Dot 1 (Firebase Auth)        : XONG 10/09/2026, 8/8 viec.
Dot 2 + 2b (luat theo vai)   : XONG va DA PUBLISH 12/09/2026.
  Do lai bang REST khong dang nhap ngay sau publish: 11/11 dat.
    bank_questions 252 tai lieu DOC DUOC  -> dong bo dem song
    users/classes/progress/chats BI CHAN  -> truoc do doc duoc cong khai
  Lo hong lon nhat cua du an (users doc cong khai, gom email hoc sinh) DA DONG.

Dot 2c (chon lop + cong dang nhap): XONG CA 4 VIEC 13/09/2026 (0b144fc).
  Chon lop tu danh sach, bo o ma o man dang ky, cong dang nhap theo vai.
  Don them: het chu bao hoc sinh GO ma lop (10 cho, 6 tep).
  Viec 4 — chu du an thu tay tren ban Netlify that, 9/9 phep dat:
    ba vai vao dung ba trang (giao vien ra /teacher, KHONG phai /dashboard)
    phien song qua lan mo lai, nut "Tiep tuc voi <email>" chay
    KHONG nhap nhay -> diem R7 tu dong lai, KHONG can them co "auth da
      xac dinh" o AppContext. Dung di them may moc do nua.
    o chon lop hien du 9 lop; man dang ky het o "Ma lop"
    man giao vien + hop duyet don: chu da dung

LUAT `laChuDuAn()`          : XONG va DA PUBLISH 13/09/2026 (c8d8bf0).
  Chu du an yeu cau: chi MOT nguoi duoc dat/doi `role` va xoa ho so.
  users/{userId} create + update + delete deu di qua laChuDuAn(), ghim
  bang email trong token Auth. Lo hong school_admin tu nang len admin: VA.
  7 phep Rules Playground: dat. Do lai bang REST sau publish: 11/11, y het
  moc truoc publish — khong dong nao nhuc nhich.
  -> `firestore.rules` trong git DA khop voi ban dang chay. Sua tiep thi
     van phai qua Playground roi Publish tay; toi khong publish duoc.

Dot 3a + 3b (dong quan tri + don xin lam giao vien): XONG 13/09/2026.
  Luat: `laDongQuanTri()` + collection `quan_tri/dong_quan_tri`. DA PUBLISH,
    10 phep Rules Playground dat, do lai bang REST sau publish: 12/12.
  Giao dien: khung "Dong quan tri" (chi chu du an sua), the thu ba o man
    dang ky, bang bao dang cho duyet, khung duyet don (chu du an + dong
    quan tri thay; giao vien thuong khong).
  Chu du an thu tay tren ban Netlify that: TAT CA DAT, ke ca phep 6 —
    dong quan tri KHONG phai chu du an duyet duoc don.
  lthaa.th@gmail.com la dong quan tri dau tien.

Loi `getUsers()` bo roi hai truong don (28cd686, 13/09/2026):
  `getUsers()` va `getUserByIdentifier()` liet ke tung truong roi ep kieu
  `as User`. Cai ep kieu do lam tsc im khi thieu truong, nen ca
  `pendingRole` lan `pendingClassCode` bi rot tren duong tu Firestore ve
  mang `users`. Hau qua: khung duyet don nam im du Firestore CO don, va
  cot "Don cho" o ClassManagement mu y the — hai tinh nang, mot goc.
  Duong dang nhap (firestoreAuth.ts) chep du hai truong, nen phia nguoi
  nop van thay bang "dang cho duyet" — chinh cho lech do lam loi kho thay.
  BAI HOC: cho nao map tai lieu Firestore bang danh sach truong tuong minh
  + `as User` la cho do se nuot truong moi. Them truong vao kieu `User`
  thi PHAI grep `as User` roi them vao tung cho.
Hai ho so mo coi `super_admin_001` va `uid_admin_1`: DA XOA 13/09/2026.

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
