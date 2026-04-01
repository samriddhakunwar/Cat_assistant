/**
 * storage.js — localStorage helpers for widget data persistence.
 * All keys are prefixed with "cat_" to avoid collisions.
 */

const KEYS = {
  TODOS: 'cat_todos',
  WATER_LOG: 'cat_water_log',
  POMODORO_SESSIONS: 'cat_pomodoro_sessions',
  ANALYTICS: 'cat_analytics_data',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[storage] Failed to write ${key}:`, err);
  }
}

// ── To-do list ────────────────────────────────────────────────────────────────
export function getTodos() {
  return read(KEYS.TODOS, []);
}
export function saveTodos(todos) {
  write(KEYS.TODOS, todos);
}

// ── Water log ─────────────────────────────────────────────────────────────────
export function getWaterLog() {
  return read(KEYS.WATER_LOG, { glasses: 0, goal: 8, date: null });
}
export function saveWaterLog(log) {
  write(KEYS.WATER_LOG, log);
}

// ── Pomodoro sessions ─────────────────────────────────────────────────────────
export function getPomodoroSessions() {
  return read(KEYS.POMODORO_SESSIONS, []);
}
export function savePomodoroSession(session) {
  const sessions = getPomodoroSessions();
  sessions.push(session);
  // Keep only last 100
  if (sessions.length > 100) sessions.splice(0, sessions.length - 100);
  write(KEYS.POMODORO_SESSIONS, sessions);
}

// ── Analytics snapshots ───────────────────────────────────────────────────────
export function getAnalyticsData() {
  return read(KEYS.ANALYTICS, []);
}
export function saveAnalyticsSnapshot(snapshot) {
  const data = getAnalyticsData();
  data.push({ ...snapshot, ts: Date.now() });
  // Keep last 7 days worth of minute-level snapshots (7 * 24 * 60 = 10080)
  if (data.length > 10080) data.splice(0, data.length - 10080);
  write(KEYS.ANALYTICS, data);
}
