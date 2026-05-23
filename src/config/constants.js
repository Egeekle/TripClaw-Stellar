/**
 * Aquisito — Application Constants
 * Production-grade configuration file.
 */

export const APP_CONFIG = {
  NAME: 'Aquisito',
  VERSION: '1.0.0',
  DESCRIPTION: 'Encuentra lo bueno, aquisito nomás. Inteligencia de viaje en enjambre y agentes IA locales.',
  THEME_COLOR: '#d65335',
};

export const STORAGE_KEYS = {
  IDENTITY: 'aquisito_identity',
  AUTH_SESSION: 'supabase.auth.token', // Standard Supabase key
  THEME: 'aquisito_theme',
};

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  MAP: '/map',
  CONSOLE: '/console',
  PASSPORT: '/passport',
  MATCH: '/match',
  VOTE: '/vote',
  VERIFY: '/verify',
};

export const API_ENDPOINTS = {
  ZEROCLAW_GATEWAY: '/zc-api',
};

export const EXPERIENCE_LEVELS = {
  XP_PER_MISSION: 150,
  XP_TO_LEVEL_UP: 1000,
};

export const BRAND_COLORS = {
  PRIMARY: '#d65335', // Terracota
  SECONDARY: '#e3a033', // Mostaza
  ACCENT: '#3ca9be', // Turquesa
  SUCCESS: '#3fa774', // Verde selva
  ERROR: '#ef4444', // Red-500
};

