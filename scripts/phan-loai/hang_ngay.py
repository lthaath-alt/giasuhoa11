"""Mỗi đêm: lấy câu hỏi mới, làm bảng Excel gán nhãn, gửi mail cho chủ dự án (04/10/2026).

Chạy tay (từ gốc repo):
  npm run phan-loai:hang-ngay                       đủ cả: xuất câu mới → bảng → gửi mail
  npm run phan-loai:hang-ngay -- --khong-gui         xuất + làm bảng, KHÔNG gửi mail
  npm run phan-loai:hang-ngay -- --kiem-mail       chỉ thử đăng nhập Gmail (kiểm mật khẩu ứng dụng), không gửi
  npm run phan-loai:hang-ngay -- --thu <thư mục đợt> KHÔNG đọc Firestore, KHÔNG gửi: làm bảng từ một
                                                    đợt có sẵn và in thư sẽ gửi (để thử)
Hẹn giờ 0:00 mỗi ngày: scripts/phan-loai/dang-ky-hen-gio.ps1 (chạy chay-hang-ngay.cmd).

Các bước:
  1. npm run phan-loai:xuat (câu học sinh 11A3 + câu giáo viên/quản trị, chỉ câu chưa có ở đợt nào).
     Không có câu mới → ghi nhật ký "không gửi" và thoát. KHÔNG gửi mail.
  2. Làm bảng <Tài liệu>/gan-nhan-gia-su/cau-hoi-<đợt>.xlsx (và bản trong thư mục đợt).
  3. Gửi mail qua Gmail (SMTP SSL), đính kèm bảng. Cần trong .env.local (chủ dự án tự thêm):
       GMAIL_GUI=<địa chỉ Gmail gửi>
       GMAIL_MAT_KHAU_UNG_DUNG=<mật khẩu ứng dụng 16 ký tự của tài khoản đó>
       GMAIL_NHAN=<địa chỉ nhận>   (bỏ trống thì gửi cho chính GMAIL_GUI)
     Thiếu thì bảng vẫn được làm, script in cách tạo mật khẩu ứng dụng và thoát mã 2.
Nhật ký: <Tài liệu>/gan-nhan-gia-su/nhat-ky/<ngày>.log.
Câu trong bảng đã che email, số điện thoại, họ tên có hồ sơ; tên một chữ, biệt danh có thể sót.
"""
import argparse
import csv
import datetime
import os
import re
import smtplib
import ssl
import subprocess
import sys
from email.message import EmailMessage
from pathlib import Path

THU_MUC = Path(__file__).resolve().parent
GOC = THU_MUC.parents[1]
sys.path.insert(0, str(THU_MUC))
from bang_xlsx import ghi_bang  # noqa: E402
from chung import THU_MUC_THAT  # noqa: E402

LOAI_XLSX = ('application', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet')
HUONG_DAN_MAT_KHAU = """\
Chưa gửi được mail: thiếu GMAIL_GUI hoặc GMAIL_MAT_KHAU_UNG_DUNG trong .env.local.
Cách tạo mật khẩu ứng dụng Gmail (làm một lần):
  1. Vào https://myaccount.google.com/security bằng tài khoản Gmail sẽ GỬI thư.
  2. Bật "Xác minh 2 bước" nếu chưa bật.
  3. Vào https://myaccount.google.com/apppasswords, đặt tên "Gia su Hoa 11", bấm Tạo.
  4. Google hiện 16 chữ cái: chép lại (bỏ dấu cách).
  5. Mở tệp .env.local ở gốc repo bằng Notepad, thêm ba dòng rồi lưu:
       GMAIL_GUI=ten-ban@gmail.com
       GMAIL_MAT_KHAU_UNG_DUNG=16chucai
       GMAIL_NHAN=dia-chi-nhan@gmail.com
Mật khẩu ứng dụng chỉ dùng để gửi thư; đổi ý thì xoá nó ở trang apppasswords."""


def thu_muc_tai_lieu():
    """Thư mục Tài liệu (Documents) thật, kể cả khi OneDrive chuyển hướng nó."""
    try:
        import ctypes
        from ctypes import wintypes
        buf = ctypes.create_unicode_buffer(wintypes.MAX_PATH)
        if ctypes.windll.shell32.SHGetFolderPathW(None, 5, None, 0, buf) == 0:   # CSIDL_PERSONAL
            return Path(buf.value)
    except Exception:
        pass
    return Path.home() / 'Documents'


class NhatKy:
    def __init__(self, thu_muc):
        thu_muc.mkdir(parents=True, exist_ok=True)
        self.tep = thu_muc / f'{datetime.date.today().isoformat()}.log'

    def __call__(self, *dong):
        chu = ' '.join(str(d) for d in dong)
        print(chu, flush=True)
        with open(self.tep, 'a', encoding='utf-8') as f:
            f.write(f'[{datetime.datetime.now():%H:%M:%S}] {chu}\n')


def doc_bien_gmail(tep_env=GOC / '.env.local'):
    """Ba biến GMAIL_* từ biến môi trường, nếu thiếu thì từ .env.local. Chỉ đọc đúng ba khoá này."""
    can = ('GMAIL_GUI', 'GMAIL_MAT_KHAU_UNG_DUNG', 'GMAIL_NHAN')
    ra = {k: os.environ.get(k, '').strip() for k in can}
    if not (ra['GMAIL_GUI'] and ra['GMAIL_MAT_KHAU_UNG_DUNG']) and Path(tep_env).exists():
        for dong in Path(tep_env).read_text(encoding='utf-8-sig').splitlines():
            m = re.match(r'\s*(GMAIL_GUI|GMAIL_MAT_KHAU_UNG_DUNG|GMAIL_NHAN)\s*=\s*(.*?)\s*$', dong)
            if m and not ra[m.group(1)]:
                ra[m.group(1)] = m.group(2).strip('"\'').replace(' ', '') if m.group(1) == 'GMAIL_MAT_KHAU_UNG_DUNG' \
                    else m.group(2).strip('"\'')
    ra['GMAIL_NHAN'] = ra['GMAIL_NHAN'] or ra['GMAIL_GUI']
    return ra


def dem_nguon(dot):
    """(số câu, số câu học sinh, số câu giáo viên) theo chua-gan.csv của đợt."""
    with open(dot / 'chua-gan.csv', encoding='utf-8-sig', newline='') as f:
        dong = list(csv.DictReader(f))
    gv = sum((d.get('nguon') or '').startswith('that-gv') for d in dong)
    return [d['tin_nhan'] for d in dong], len(dong) - gv, gv


def lam_bang(dot, thu_muc_ra):
    """Bảng cho đợt: một bản ở thư mục ra (để gửi / mở), một bản trong thư mục đợt."""
    cau, hs, gv = dem_nguon(dot)
    thu_muc_ra.mkdir(parents=True, exist_ok=True)
    tep = thu_muc_ra / f'cau-hoi-{dot.name}.xlsx'
    ghi_bang(tep, cau, dot.name, hs, gv)
    ghi_bang(dot / 'bang-gan-nhan.xlsx', cau, dot.name, hs, gv)
    return tep, len(cau), hs, gv


def soan_thu(tep, dot, n, hs, gv, gui, nhan):
    m = EmailMessage()
    m['Subject'] = f'Câu hỏi mới gia sư Hóa 11 – {dot.name.removeprefix("dot-")} – {n} câu'
    m['From'] = gui
    m['To'] = nhan
    m.set_content(
        f'Đợt {dot.name}: {n} câu mới ({hs} học sinh lớp 11A3, {gv} giáo viên/quản trị).\n\n'
        'Cách gán nhãn:\n'
        '  1. Mở tệp đính kèm bằng Excel, sheet "Gán nhãn".\n'
        '  2. Ở cột Nhãn, bấm vào ô, bấm mũi tên, chọn nhãn. Không hợp thì chọn "(Bỏ câu này)".\n'
        '     Sheet "Giải thích nhãn" có nghĩa và ví dụ của từng nhãn.\n'
        '  3. Câu có tên người thì sửa tên thành [tên].\n'
        '  4. Lưu (Ctrl+S, giữ dạng .xlsx), chép tệp vào máy có repo rồi chạy:\n'
        f'       npm run phan-loai:nap-xlsx -- "<đường dẫn tới tệp>"\n\n'
        'Tệp chứa câu thật của học sinh (đã che email, số điện thoại, họ tên có hồ sơ): '
        'đừng chuyển tiếp, xoá thư khi đã gán xong.\n')
    m.add_attachment(tep.read_bytes(), maintype=LOAI_XLSX[0], subtype=LOAI_XLSX[1], filename=tep.name)
    return m


def kiem_dang_nhap(gui, mat_khau, smtp=smtplib.SMTP_SSL):
    """Chỉ đăng nhập Gmail rồi thoát, KHÔNG gửi thư: thử mật khẩu ứng dụng có đúng không."""
    with smtp('smtp.gmail.com', 465, context=ssl.create_default_context(), timeout=60) as s:
        s.login(gui, mat_khau)


def gui_thu(thu, gui, mat_khau, smtp=smtplib.SMTP_SSL):
    with smtp('smtp.gmail.com', 465, context=ssl.create_default_context(), timeout=60) as s:
        s.login(gui, mat_khau)
        s.send_message(thu)


def xuat_cau_moi(log):
    """Chạy npm run phan-loai:xuat. Trả thư mục đợt mới, hoặc None nếu không có câu mới."""
    truoc = {p.name for p in THU_MUC_THAT.glob('dot-*')} if THU_MUC_THAT.exists() else set()
    kq = subprocess.run('npm run phan-loai:xuat', cwd=GOC, shell=True, capture_output=True,
                        text=True, encoding='utf-8', errors='replace')
    for dong in (kq.stdout + kq.stderr).splitlines():
        if dong.strip() and not dong.startswith('  ') and 'Mật khẩu' not in dong:   # không ghi câu mẫu hay mật khẩu
            log('  xuat:', dong)
    if kq.returncode != 0:
        raise RuntimeError(f'phan-loai:xuat hỏng (mã {kq.returncode}), xem nhật ký phía trên.')
    m = re.search(r'^DOT_MOI=(.+)$', kq.stdout, re.M)
    if m:
        return Path(m.group(1).strip())
    moi = sorted(p for p in THU_MUC_THAT.glob('dot-*') if p.name not in truoc) if THU_MUC_THAT.exists() else []
    return moi[-1] if moi else None


def main():
    ap = argparse.ArgumentParser(description='Lấy câu hỏi mới, làm bảng gán nhãn, gửi mail.')
    ap.add_argument('--khong-gui', action='store_true', help='làm bảng nhưng không gửi mail')
    ap.add_argument('--thu', metavar='THU_MUC_DOT', help='thử: làm bảng từ đợt có sẵn, không đọc Firestore, không gửi')
    ap.add_argument('--thu-muc-ra', help='nơi để bảng (mặc định <Tài liệu>/gan-nhan-gia-su)')
    ap.add_argument('--kiem-mail', action='store_true',
                    help='chỉ kiểm cài đặt Gmail (đăng nhập thử), không đọc Firestore, không gửi thư')
    a = ap.parse_args()
    if a.kiem_mail:
        bien = doc_bien_gmail()
        if not (bien['GMAIL_GUI'] and bien['GMAIL_MAT_KHAU_UNG_DUNG']):
            print(HUONG_DAN_MAT_KHAU)
            return 2
        try:
            kiem_dang_nhap(bien['GMAIL_GUI'], bien['GMAIL_MAT_KHAU_UNG_DUNG'])
        except smtplib.SMTPAuthenticationError:
            print(f'Gmail TỪ CHỐI đăng nhập {bien["GMAIL_GUI"]}: mật khẩu ứng dụng sai, hoặc GMAIL_GUI không phải '
                  'tài khoản đã tạo mật khẩu đó. (Đây là mật khẩu ứng dụng 16 chữ, không phải mật khẩu Gmail.)')
            return 2
        except Exception as e:
            print(f'Không kết nối được Gmail: {type(e).__name__}: {e}')
            return 1
        print(f'Cài đặt Gmail ĐÚNG: đăng nhập được {bien["GMAIL_GUI"]}; thư mỗi đêm sẽ gửi tới {bien["GMAIL_NHAN"]}. '
              '(Không gửi thư nào.)')
        return 0
    ra = Path(a.thu_muc_ra) if a.thu_muc_ra else thu_muc_tai_lieu() / 'gan-nhan-gia-su'
    log = NhatKy(ra / 'nhat-ky')
    log(f'== Bắt đầu {"(THỬ) " if a.thu else ""}{datetime.datetime.now():%Y-%m-%d %H:%M} ==')

    if a.thu:
        dot = Path(a.thu).resolve()
        if not (dot / 'chua-gan.csv').exists():
            log(f'Không thấy {dot / "chua-gan.csv"}.')
            return 1
    else:
        try:
            dot = xuat_cau_moi(log)
        except RuntimeError as e:
            log('LỖI:', e)
            return 1
        if dot is None:
            log('Không có câu hỏi mới — không làm bảng, không gửi mail.')
            return 0

    tep, n, hs, gv = lam_bang(dot, ra)
    log(f'Bảng: {tep} ({n} câu: {hs} học sinh, {gv} giáo viên/quản trị)')

    if a.thu or a.khong_gui:
        bien = doc_bien_gmail() if not a.thu else {'GMAIL_GUI': 'nguoi-gui@gmail.com', 'GMAIL_NHAN': 'nguoi-nhan@gmail.com'}
        thu = soan_thu(tep, dot, n, hs, gv, bien['GMAIL_GUI'] or '(chưa đặt)', bien['GMAIL_NHAN'] or '(chưa đặt)')
        log(f'KHÔNG gửi ({"thử" if a.thu else "--khong-gui"}). Thư sẽ gửi: "{thu["Subject"]}", tới {thu["To"]}, '
            f'đính kèm {tep.name} ({tep.stat().st_size // 1024} KB).')
        return 0

    bien = doc_bien_gmail()
    if not (bien['GMAIL_GUI'] and bien['GMAIL_MAT_KHAU_UNG_DUNG']):
        log(HUONG_DAN_MAT_KHAU)
        return 2
    thu = soan_thu(tep, dot, n, hs, gv, bien['GMAIL_GUI'], bien['GMAIL_NHAN'])
    try:
        gui_thu(thu, bien['GMAIL_GUI'], bien['GMAIL_MAT_KHAU_UNG_DUNG'])
    except smtplib.SMTPAuthenticationError:
        log('LỖI: Gmail từ chối đăng nhập. Kiểm GMAIL_GUI và mật khẩu ứng dụng (16 chữ, không phải mật khẩu Gmail).')
        return 2
    except Exception as e:   # mạng, chặn cổng 465...
        log(f'LỖI gửi mail: {type(e).__name__}: {e}. Bảng vẫn ở {tep}.')
        return 1
    log(f'Đã gửi "{thu["Subject"]}" tới {bien["GMAIL_NHAN"]}.')
    return 0


if __name__ == '__main__':
    for _luong in (sys.stdout, sys.stderr):
        if hasattr(_luong, 'reconfigure'):
            _luong.reconfigure(encoding='utf-8', errors='replace')
    sys.exit(main())
