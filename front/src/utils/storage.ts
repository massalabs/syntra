// Persistent storage keys
export const SELECTED_MASSA_TOKEN_KEY = 'massa-bridge-token';
export const LAST_USED_ACCOUNT = 'massa-bridge-account';
export const LAST_TOS_ACCEPTANCE = 'tos-acceptance-date-time';

export function _setInStorage(key: string, value: string): void {
  if (typeof Storage !== 'undefined') {
    localStorage.setItem(key, value);
  }
}

export function _getFromStorage(key: string): string {
  return localStorage.getItem(key) || '';
}
