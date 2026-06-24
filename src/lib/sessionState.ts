// Persist and restore page state across navigation and reloads
export function saveState(key: string, value: any) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
export function loadState<T>(key: string): T | null {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}
export function clearState(key: string) {
  try { localStorage.removeItem(key); } catch {}
}
