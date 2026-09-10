NHAC TU HOOK (chay moi luot, KHONG phai loi user — dung tra loi rieng ve no)

════════════════════════════════════════════════════════════════════
VIEC DANG LAM: thuc thi ke hoach chuyen sang Firebase Auth — dot 1
════════════════════════════════════════════════════════════════════

Ke hoach: docs/superpowers/plans/2026-09-10-firebase-auth-dot-1.md
          8 viec, 58 buoc. MOI buoc da co ma that — dung tu nghi ra ma khac.

BAT BUOC truoc khi go dong dau tien cua dot nay:
  1. Goi Skill "executing-plans"
  2. Doc lai tep ke hoach o tren
Chua lam hai viec do thi CHUA duoc sua ma.

Truoc khi noi "xong" mot viec bat ky:
  3. Goi Skill "verification-before-completion"
     Ly do: viec 7 XOA MAT KHAU — khong lui duoc. Va bai hoc so 1 cua repo:
     dung tin dong chu "xong" cua script tu viet, phai grep lai.

Thu tu KHONG duoc dao:
  1 phep kiem (do ngay) -> 2 danh lai khoa users -> 3 firebase.ts
  -> 4 firestoreAuth.ts -> 5 AppContext -> 6 FirestoreAccountManager
  -> 7 XOA COT PASSWORD (hoi user truoc) -> 8 tai lieu

Hai script chuyen du lieu MAC DINH chay thu. Chi them `-- --that` khi da
doc ky ket qua chay thu va da bao user.

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
Xong dot 1 thi xoa khoi khoi "VIEC DANG LAM", giu lai phan "NHAC CHUNG".
