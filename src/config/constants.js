/**
 * TripClaw — Application Constants
 * Production-grade configuration file.
 */

export const APP_CONFIG = {
  NAME: 'TripClaw',
  VERSION: '1.0.0',
  DESCRIPTION: 'High-Tech Exploration & AI Travel Intelligence',
  THEME_COLOR: '#7c3aed',
};

export const STORAGE_KEYS = {
  IDENTITY: 'tripclaw_identity',
  AUTH_SESSION: 'supabase.auth.token', // Standard Supabase key
  THEME: 'tripclaw_theme',
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
  XP_PER_MISSION: 100,
  XP_TO_LEVEL_UP: 1000,
};

export const BRAND_COLORS = {
  PRIMARY: '#7c3aed', // Violet-600
  SECONDARY: '#db2777', // Fuchsia-600
  ACCENT: '#fbbf24', // Amber-400
  SUCCESS: '#10b981', // Emerald-500
  ERROR: '#ef4444', // Red-500
};
