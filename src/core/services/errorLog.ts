export type ErrorLevel = 
  | 'Nghiêm Trọng (Critical)' 
  | 'Lỗi API/AI Service' 
  | 'Lỗi Cơ Sở Dữ Liệu' 
  | 'Lỗi Xác Thực/Phân Quyền' 
  | 'Lỗi Giao Diện Client' 
  | 'Cảnh Báo Hệ Thống' 
  | 'Thông Tin Hệ Thống';

export interface ErrorLog {
  id: string;
  level: ErrorLevel;
  component: string;
  message: string;
  userEmail?: string;
  timestamp: string;
  status: 'Chưa xử lý' | 'Đã khắc phục';
}

const ERROR_LOGS_KEY = 'h11_tutor_error_logs';

export const ErrorLogService = {
  getLogs(): ErrorLog[] {
    try {
      const data = localStorage.getItem(ERROR_LOGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveLogs(logs: ErrorLog[]): void {
    localStorage.setItem(ERROR_LOGS_KEY, JSON.stringify(logs));
  },

  logError(params: { level: ErrorLevel; component: string; message: string; userEmail?: string }) {
    console.error(`[${params.level}] ${params.component}: ${params.message}`);
    const logs = this.getLogs();
    /* Nhật ký này nằm trong localStorage của MÁY HỌC SINH (thường là máy dùng
       chung ở phòng máy). Biên bản 14/09/2026 thấy nó giữ nguyên email và toàn
       văn lỗi 429 (id project, model, hạn mức). Nay chỉ lưu bản rút gọn: bỏ
       đường dẫn và khối JSON, cắt 160 ký tự, không lưu email. Toàn văn vẫn in
       ra Console ở dòng trên cho người đang gỡ lỗi. */
    const rutGon = (params.message || '')
      .replace(/https?:\/\/\S+/g, '[url]')
      .replace(/\{[\s\S]*\}/g, '[chi tiết]')
      .replace(/\s+/g, ' ')
      .slice(0, 160);
    const newLog: ErrorLog = {
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      level: params.level,
      component: params.component,
      message: rutGon,
      userEmail: params.userEmail && params.userEmail !== 'guest' ? 'Tài khoản đăng nhập' : 'Khách',
      timestamp: new Date().toISOString(),
      status: 'Chưa xử lý'
    };
    logs.unshift(newLog);
    this.saveLogs(logs);
  },

  resolveError(id: string) {
    const logs = this.getLogs();
    const index = logs.findIndex(l => l.id === id);
    if (index !== -1) {
      logs[index].status = 'Đã khắc phục';
      this.saveLogs(logs);
    }
  },

  deleteError(id: string) {
    const logs = this.getLogs();
    const filtered = logs.filter(l => l.id !== id);
    this.saveLogs(filtered);
  }
};
