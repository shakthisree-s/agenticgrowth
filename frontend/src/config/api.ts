export const API_BASE_URL: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof globalThis !== 'undefined' && (globalThis as unknown as { process?: { env?: Record<string, string> } }).process?.env?.VITE_API_URL) ||
  'http://127.0.0.1:8001';
