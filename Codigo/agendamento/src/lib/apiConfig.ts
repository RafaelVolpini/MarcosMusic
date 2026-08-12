// URL base do backend.
// Em dev: deixe VITE_API_URL vazio/ausente — os fetches usam caminho relativo e o
// proxy do Vite (vite.config.ts) encaminha para http://localhost:8080.
// Em prod: defina VITE_API_URL no build (variável do Railway) apontando para o
// backend, ex.: https://marcosmusic-production.up.railway.app
export const API_URL = import.meta.env.VITE_API_URL ?? '';
