NHAC TU HOOK (chay moi luot, KHONG phai loi user — dung tra loi rieng ve no)

KHONG CO DOT NAO DANG CHAY. Dot 3 dong 13/09/2026.

BON DIEU CAM, khong bao gio tu y lam:
  1. KHONG tu chay `npm run build`, git nguy hiem, push hay deploy.
  2. `bank_questions` PHAI giu `allow read: if true` — dong bo dem doc no
     khi CHUA dang nhap. Siet dong do la dong bo chet ma khong ai biet.
  3. Dat/doi `role` va xoa ho so: CHI `laChuDuAn()`. Dung canh bang vai
     trong ho so — lay chinh thu dang bao ve ra canh no la khoa tu mo.
  4. KHONG lam kho mat khau dang chu thuong. Kieu `User` khong co truong
     `password`; 4 phep kiem canh dieu do.

DA CHOT, dung dat lai:
  - Kho mat khau cho quan tri: KHONG LAM. Chu du an tra loi 16/09/2026 —
    nhu cau that chi la "bi voi dong tai khoan thu", ma
    `npm run liet-ke:tai-khoan` da giai xong. Neu sau nay co nhu cau THAT
    la "hoc sinh quen mat khau giua gio" thi loi giai la nut cap mat khau
    moi hien MOT LAN, can Cloud Function + Admin SDK (goi Blaze) — khong
    phai kho mat khau.

DA CHOT, dung dat lai:
  - Duong "TAO TRUONG" da bi xoa het 16/09/2026, theo y chu du an, sau khi
    da neu ro cai gia. Bon lop xoa theo thu tu: SchoolTab.tsx ->
    CreateSchoolDialog -> AppContext.createSchool -> FirestoreService.addSchool.
    Trong ma HOM NAY khong con duong nao tao mot tai lieu `schools` moi —
    chi con doc/sua/xoa. Muon co lai thi phai viet lai tu dau (xem
    `git show 62bcf27` va commit ke tiep de lay lai ma cu).
    Truong dang co trong Firestore van chay binh thuong.

CHON KY NANG TRUOC KHI DOC HAY SUA MA (goi bang cong cu Skill):
  viec mo ho / nhieu duong lam        -> brainstorming
  co gi hong, sai, khong nhu mong doi -> systematic-debugging
  sap noi "xong"                      -> verification-before-completion
  nhieu buoc, nhieu tep               -> writing-plans roi executing-plans

LICH SU CAC DOT, BAI HOC DA TRA GIA, va moi thu ve luat / mau / an ninh:
  nam trong CLAUDE.md (nap dau phien). Truoc khi sua `firestore.rules`,
  `index.css`, `public/_headers` hay vung Auth: doc lai muc tuong ung o
  do, DUNG lam theo tri nho.
  Sua `firestore.rules` xong: chay `npm run kiem-tra:luat` (may nay se BO QUA
  vi thieu Java — xem ket qua that o tab Actions sau khi push).

Doi viec khac thi SUA CHINH TEP NAY (.claude/nhac-moi-luot.md), khong
phai sua .claude/settings.json. Hook chi lam moi viec `cat` tep nay ra.
Bat dau mot dot moi thi ghim vao dong thu 3; xong thi go ra.
