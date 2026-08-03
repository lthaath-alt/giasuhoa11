// ============================================================
// COOLDOWN SERVICE — Quản lý trạng thái cooldown khi học sinh lạc đề
// Lưu trữ per-student trong localStorage
// ============================================================

export interface CooldownLogEntry {
  studentId: string;
  studentName?: string;
  triggeredAt: string;       // ISO timestamp
  reason: string;
  durationMinutes: number;
  offTopicMessages: string[]; // Các câu hỏi lạc đề gây ra cooldown
}

export interface CooldownState {
  studentId: string;
  offTopicStrikeCount: number;
  cooldownUntil: number | null;    // Unix timestamp (ms); null = không cooldown
  lastMessageAt: number;           // Unix timestamp (ms)
  recentOffTopicMessages: string[]; // Lưu lại tin lạc đề gần nhất (để ghi log)
  messageTimestamps: number[];     // Lưu lại lịch sử timestamp gửi tin nhắn gần đây để check rate limit
}

// ── Cấu hình ──────────────────────────────────────────────────────────────────

/** Thời gian cooldown (phút) — 15 phút đủ hạ nhiệt mà không quá nặng */
export const COOLDOWN_DURATION_MINUTES = 15;

/** Số lần lạc đề tối đa trước khi kích hoạt cooldown */
export const MAX_OFFTOPIC_STRIKES = 5;

// ── Keys ──────────────────────────────────────────────────────────────────────

const COOLDOWN_KEY_PREFIX = 'h11_cooldown_';
const COOLDOWN_LOG_KEY = 'h11_cooldown_logs';

// ── Helpers ───────────────────────────────────────────────────────────────────

const getStateKey = (studentId: string): string =>
  `${COOLDOWN_KEY_PREFIX}${studentId}`;

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Lấy trạng thái cooldown hiện tại của học sinh.
 * Tự động reset nếu cooldown đã hết hạn.
 */
export function getCooldownState(studentId: string): CooldownState {
  const key = getStateKey(studentId);
  const raw = localStorage.getItem(key);

  if (!raw) {
    return createDefaultState(studentId);
  }

  try {
    const state: CooldownState = JSON.parse(raw);

    // Auto-reset nếu cooldown đã hết hạn
    if (state.cooldownUntil && Date.now() >= state.cooldownUntil) {
      state.cooldownUntil = null;
      state.offTopicStrikeCount = 0;
      state.recentOffTopicMessages = [];
      saveCooldownState(state);
    }

    return state;
  } catch {
    return createDefaultState(studentId);
  }
}

/**
 * Kiểm tra học sinh có đang bị cooldown không.
 * Trả về thời gian còn lại (ms) hoặc 0 nếu không cooldown.
 */
export function getRemainingCooldown(studentId: string): number {
  const state = getCooldownState(studentId);
  if (!state.cooldownUntil) return 0;

  const remaining = state.cooldownUntil - Date.now();
  return remaining > 0 ? remaining : 0;
}

/**
 * Kiểm tra xem học sinh có đang trong cooldown không.
 */
export function isInCooldown(studentId: string): boolean {
  return getRemainingCooldown(studentId) > 0;
}

/**
 * Tăng off-topic strike count.
 * Trả về true nếu cooldown vừa được kích hoạt (đạt ngưỡng).
 */
export function recordOffTopicStrike(
  studentId: string,
  offTopicMessage: string,
  studentName?: string
): { cooldownActivated: boolean; currentStrikes: number } {
  const state = getCooldownState(studentId);
  state.offTopicStrikeCount += 1;
  state.lastMessageAt = Date.now();
  state.recentOffTopicMessages.push(offTopicMessage);

  // Giới hạn lưu 10 tin lạc đề gần nhất
  if (state.recentOffTopicMessages.length > 10) {
    state.recentOffTopicMessages = state.recentOffTopicMessages.slice(-10);
  }

  let cooldownActivated = false;

  if (state.offTopicStrikeCount >= MAX_OFFTOPIC_STRIKES) {
    // Kích hoạt cooldown
    state.cooldownUntil = Date.now() + COOLDOWN_DURATION_MINUTES * 60 * 1000;
    cooldownActivated = true;

    // Ghi log
    addCooldownLog({
      studentId,
      studentName,
      triggeredAt: new Date().toISOString(),
      reason: `Hỏi lạc đề ${state.offTopicStrikeCount} lần liên tiếp`,
      durationMinutes: COOLDOWN_DURATION_MINUTES,
      offTopicMessages: [...state.recentOffTopicMessages],
    });
  }

  saveCooldownState(state);

  return {
    cooldownActivated,
    currentStrikes: state.offTopicStrikeCount,
  };
}

/**
 * Reset off-topic strikes (khi học sinh quay lại hỏi đúng Hóa học).
 */
export function resetOffTopicStrikes(studentId: string): void {
  const state = getCooldownState(studentId);
  state.offTopicStrikeCount = 0;
  state.recentOffTopicMessages = [];
  saveCooldownState(state);
}

/**
 * Kiểm tra rate limit:
 * - Tối đa 3 câu trong 1 phút.
 * - Ít nhất 20 giây giữa 2 câu liên tiếp.
 */
export function checkRateLimit(studentId: string): { allowed: boolean; reason?: 'fast' | 'many'; waitMs?: number } {
  const state = getCooldownState(studentId);
  const now = Date.now();
  
  // Lọc các tin nhắn trong vòng 1 phút qua
  state.messageTimestamps = (state.messageTimestamps || []).filter(ts => now - ts < 60000);
  
  // 1. Kiểm tra khoảng cách 20 giây
  if (state.messageTimestamps.length > 0) {
    const lastMsgTime = state.messageTimestamps[state.messageTimestamps.length - 1];
    if (now - lastMsgTime < 20000) {
      return { allowed: false, reason: 'fast', waitMs: 20000 - (now - lastMsgTime) };
    }
  }

  // 2. Kiểm tra giới hạn 3 câu / phút
  if (state.messageTimestamps.length >= 3) {
    const oldestInMinute = state.messageTimestamps[0];
    return { allowed: false, reason: 'many', waitMs: 60000 - (now - oldestInMinute) };
  }
  
  return { allowed: true };
}

export function recordMessageSent(studentId: string): void {
  const state = getCooldownState(studentId);
  if (!state.messageTimestamps) {
    state.messageTimestamps = [];
  }
  const now = Date.now();
  // Cleanup old timestamps while adding new one
  state.messageTimestamps = state.messageTimestamps.filter(ts => now - ts < 60000);
  state.messageTimestamps.push(now);
  saveCooldownState(state);
}

/**
 * Format thông báo cooldown cho học sinh — trung thực, không dọa.
 */
export function formatCooldownMessage(remainingMs: number): string {
  const minutes = Math.ceil(remainingMs / 60000);
  return `⏸️ Mình thấy mình đang lạc đề nhiều lần rồi. Thầy/cô sẽ tạm dừng trả lời các câu hỏi ngoài Hóa học trong khoảng **${minutes} phút** nữa.\n\nSau đó em quay lại bình thường nhé — thầy/cô vẫn luôn sẵn sàng hỗ trợ em học Hóa! 💪`;
}

/**
 * Thông báo khi cooldown vừa kích hoạt.
 */
export function formatCooldownActivationNotice(): string {
  return `\n\n⏸️ Mình thấy mình đang lạc đề nhiều lần rồi. Thầy/cô sẽ tạm dừng trả lời các câu hỏi ngoài Hóa học trong khoảng **${COOLDOWN_DURATION_MINUTES} phút**. Sau đó em quay lại bình thường nhé — vẫn luôn sẵn sàng hỗ trợ em học Hóa! 💪`;
}

// ── Cooldown Logs (cho Admin/Giáo viên) ───────────────────────────────────────

/**
 * Lấy toàn bộ log cooldown.
 */
export function getCooldownLogs(): CooldownLogEntry[] {
  const raw = localStorage.getItem(COOLDOWN_LOG_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Lấy log cooldown theo danh sách student IDs.
 */
export function getCooldownLogsByStudents(studentIds: string[]): CooldownLogEntry[] {
  const allLogs = getCooldownLogs();
  if (studentIds.length === 0) return allLogs;
  return allLogs.filter(log => studentIds.includes(log.studentId));
}

/**
 * Xóa toàn bộ log cooldown (Admin only).
 */
export function clearCooldownLogs(): void {
  localStorage.removeItem(COOLDOWN_LOG_KEY);
}

// ── Private helpers ───────────────────────────────────────────────────────────

function createDefaultState(studentId: string): CooldownState {
  return {
    studentId,
    offTopicStrikeCount: 0,
    cooldownUntil: null,
    lastMessageAt: 0,
    recentOffTopicMessages: [],
    messageTimestamps: [],
  };
}

function saveCooldownState(state: CooldownState): void {
  const key = getStateKey(state.studentId);
  localStorage.setItem(key, JSON.stringify(state));
}

function addCooldownLog(entry: CooldownLogEntry): void {
  const logs = getCooldownLogs();
  logs.push(entry);

  // Giữ tối đa 200 entries gần nhất
  if (logs.length > 200) {
    logs.splice(0, logs.length - 200);
  }

  localStorage.setItem(COOLDOWN_LOG_KEY, JSON.stringify(logs));
}
