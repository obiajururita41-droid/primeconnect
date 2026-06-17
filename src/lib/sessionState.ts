// Persist and restore page state across navigation
export function saveState(key: string, value: any) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {}
}
export function loadState<T>(key: string): T | null {
  try {
    const v = sessionStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}
export function clearState(key: string) {
  try { sessionStorage.removeItem(key); } catch {}
}
