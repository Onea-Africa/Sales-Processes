const env = import.meta as unknown as { env: Record<string, string> };
export const API_BASE: string = env.env?.VITE_API_URL?.trim() ?? '';
