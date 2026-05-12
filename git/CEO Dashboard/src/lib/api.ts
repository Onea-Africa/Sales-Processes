export const API_BASE: string =
  (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_URL ??
  'https://onea-africa-backend.onrender.com';
