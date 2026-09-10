NHAC TU HOOK (chay moi luot, KHONG phai loi user — dung tra loi rieng ve no)

════════════════════════════════════════════════════════════════════
VIEC DANG LAM: DOT 2 — siet firestore.rules theo vai tro
════════════════════════════════════════════════════════════════════

Spec    : docs/superpowers/specs/2026-09-10-firestore-rules-dot-2-design.md
Ke hoach: docs/superpowers/plans/2026-09-10-firestore-rules-dot-2.md
          6 viec, 43 buoc. MOI buoc da co ma that — dung tu nghi ra ma khac.

BAT BUOC truoc khi go dong dau tien:
  1. Goi Skill "executing-plans"
  2. Doc lai ke hoach o tren
Truoc khi noi "xong" mot viec: goi Skill "verification-before-completion".

THU TU KHONG DUOC DAO — day la cho de hong nhat cua ca dot:
  1 phep kiem (do ngay) -> 2 AppContext hai tang
  -> 3 BUILD + DEPLOY + XAC NHAN ban moi da chay   <- CONG, user lam
  -> 4 viet luat vao firestore.rules (chua publish)
  -> 5 Rules Playground roi moi Publish             <- CONG, kho lui
  -> 6 thu tay ba vai + tai lieu

Dao buoc 3 va 5 thi ban dang chay tren Netlify van tai `users` luc mo trang,
luat moi chan, va MOI NGUOI THAY TRANG TRANG.

HAI DIEU KHONG DUOC QUEN KHI VIET LUAT:
  - bank_questions phai giu `allow read: if true` — dong bo dem doc khong
    dang nhap, siet la no chet ma khong ai biet.
  - KHONG dung get() trong luat cua progress va chats — moi get() la mot luot
    doc co tinh tien, ma do la hai cho hoc sinh ghi nhieu nhat.

Dot 1 (Firebase Auth): XONG 10/09/2026, 8/8 viec.

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
