# Dang ky (hoac huy) tac vu Windows chay chay-hang-ngay.cmd luc 0:00 moi ngay.
#
#   Dang ky:  powershell -ExecutionPolicy Bypass -File scripts\phan-loai\dang-ky-hen-gio.ps1
#   Huy:      powershell -ExecutionPolicy Bypass -File scripts\phan-loai\dang-ky-hen-gio.ps1 -Huy
#   Xem:      Get-ScheduledTask -TaskName GiaSuHoa11-CauHoiMoi | Get-ScheduledTaskInfo
#
# - Chay bang tai khoan Windows dang dang nhap, chi khi da dang nhap: khong luu mat khau Windows.
# - May tat luc 0:00 thi chay bu ngay khi bat lai (StartWhenAvailable).
# - Dung toi da 1 gio; chay ca khi dung pin.
param([switch]$Huy)

$ten = 'GiaSuHoa11-CauHoiMoi'
if ($Huy) {
  Unregister-ScheduledTask -TaskName $ten -Confirm:$false
  "Da huy tac vu $ten."
  return
}

$tep = Join-Path $PSScriptRoot 'chay-hang-ngay.cmd'
if (-not (Test-Path $tep)) { throw "Khong thay $tep" }

$hanhDong = New-ScheduledTaskAction -Execute $tep -WorkingDirectory (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$lich = New-ScheduledTaskTrigger -Daily -At '00:00'
$caiDat = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit (New-TimeSpan -Hours 1) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName $ten -Action $hanhDong -Trigger $lich -Settings $caiDat -Force `
  -Description 'Gia su Hoa 11: lay cau hoi moi cua lop 11A3 va giao vien, lam bang gan nhan, gui mail. Khong co cau moi thi khong gui.' | Out-Null
"Da dang ky tac vu $ten, chay 0:00 moi ngay."
Get-ScheduledTask -TaskName $ten | Get-ScheduledTaskInfo | Select-Object NextRunTime
