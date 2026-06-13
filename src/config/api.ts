// API base URL — set per environment via Vite env files:
//   .env.development  → /api (Vite dev proxy → backend)
//   .env.production   → full backend URL (e.g. http://host:5000/api)
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "/api";
