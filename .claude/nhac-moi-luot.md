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

DANG TREO, hoi truoc khi thiet ke:
  - Kho mat khau cho quan tri: DA TU CHOI 2 lan, chua duoc tra loi cau
    "nhu cau that la hoc sinh quen mat khau giua gio, hay chi la bi voi
    dong tai khoan thu?". Mat khau cu DA BAM nen kho moi KHONG cuu duoc
    tai khoan da quen. Cap lai ngay can Cloud Function + Admin SDK (Blaze).
  - `CreateSchoolDialog` (SchoolDialogs.tsx) thanh mo coi sau khi xoa
    SchoolTab.tsx. Giu lai, hoi truoc khi xoa.

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
