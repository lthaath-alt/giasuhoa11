NHAC TU HOOK (chay moi luot, KHONG phai loi user — dung tra loi rieng ve no)

════════════════════════════════════════════════════════════════════
VIEC DANG LAM: DOT 2b — don xin vao lop + va 4 lo chan publish
════════════════════════════════════════════════════════════════════

Spec    : docs/superpowers/specs/2026-09-12-don-xin-vao-lop-design.md
Ke hoach: docs/superpowers/plans/2026-09-12-don-xin-vao-lop.md
          8 viec. MOI buoc da co ma that — dung tu nghi ra ma khac.

BAT BUOC truoc khi go dong dau tien:
  1. Goi Skill "executing-plans"
  2. Doc lai ke hoach o tren
Truoc khi noi "xong" mot viec: goi Skill "verification-before-completion".

THU TU KHONG DUOC DAO:
  1 phep kiem -> 2 luat + kieu -> 3 AppContext -> 4 man duyet
  -> 5 chu nghia giao dien
  -> 6 BUILD + DEPLOY + XAC NHAN ban moi da chay   <- CONG, user lam
  -> 7 Playground 17 phep roi Publish              <- CONG, kho lui
  -> 8 thu tay ba vai + tai lieu

Dao 6 va 7 thi ban dang chay tren Netlify van ghi vao `classes` khi hoc sinh
nhap ma, va van tao ho so luc chua dang nhap — luat moi chan ca hai, tuc
HOC SINH MOI KHONG DANG KY DUOC va KHONG AI VAO LOP DUOC.

BON DIEU KHONG DUOC QUEN:
  - bank_questions phai giu `allow read: if true` — dong bo dem doc khong
    dang nhap, siet la no chet ma khong ai biet.
  - KHONG dung get() trong luat cua progress va chats — moi get() la mot luot
    doc co tinh tien, ma do la hai cho hoc sinh ghi nhieu nhat.
  - `classes` giu `allow write: if laGiaoVien()`. Chu du an da chot: hoc sinh
    KHONG sua gi ve lop, ke ca them email cua chinh minh.
  - Hoc sinh cung KHONG tu dat duoc classId/schoolId tren ho so cua minh —
    bo ve nay la con nguyen cua sau.

Dot 1 (Firebase Auth): XONG 10/09/2026, 8/8 viec.
Dot 2 (luat theo vai): Viec 1-4 xong, dung o cong Viec 5 vi 4 phat hien duoi.

BON PHAT HIEN LAM NEN DOT 2b (12/09/2026):
  1. `create` cua users khong rang buoc role -> ai cung tu phong admin.
  2. registerWithOptionalClass thieu dangTuDangKy -> ghi ho so luc chua
     dang nhap -> luat moi chan -> khong ai dang ky duoc.
  3. joinClassByCode ghi thang vao classes -> luat moi chan.
  4. O "Ma lop" luc dang ky tra vao mang `classes` RONG ke tu Viec 2 ->
     ma dung van bao "khong ton tai". Loi nay DA len production.

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
