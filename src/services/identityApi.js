/**
 * TripClaw — Identity API Service
 * Migrates localStorage identity to Supabase PostgreSQL.
 * Falls back gracefully to localStorage when Supabase is unavailable.
 */
import { supabase } from '../lib/supabase';
import { STORAGE_KEYS } from '../config/constants';
import { logger } from './logger';

const LOCAL_KEY = STORAGE_KEYS.IDENTITY;

/**
 * @typedef {Object} TripClawProfile
 * @property {string} nickname
 * @property {string} [email]
 * @property {string} [travelerType]
 * @property {string} [companion]
 * @property {number} xp
 * @property {number} level
 * @property {number} reputationScore
 * @property {string[]} visitedCities
 * @property {string[]} unlockedSkills
 * @property {string[]} badges
 * @property {string} createdAt
 * @property {string} [company_name]
 */

// ── Helpers ─────────────────────────────────────────────────
/**
 * @returns {TripClawProfile|null}
 */
function getLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}'); }
  catch { return {}; }
}

function saveLocal(profile) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(profile));
}

// ── Public API ──────────────────────────────────────────────

/**
 * Create or update user identity.
 * Writes to Supabase AND localStorage (dual-write for offline resilience).
 * @param {TripClawProfile} profile
 * @returns {Promise<{data: TripClawProfile, source: string}>}
 */
export async function upsertIdentity(profile) {
  // Always save locally for instant UI
  saveLocal(profile);

  if (!supabase) return { data: profile, source: 'local' };

  const { data, error } = await supabase
    .from('users')
    .upsert({
      nickname: profile.nickname,
      wallet_address: profile.walletAddress || null,
      traveler_type: profile.travelerType || null,
      companion_id: profile.companion || null,
      level: profile.level || 1,
      xp: profile.xp || 0,
      reputation_score: profile.reputationScore || 100,
    }, { onConflict: 'nickname' })
    .select()
    .single();

  if (error) {
    logger.warn('[IdentityAPI] Supabase upsert failed, using localStorage:', error.message);
    return { data: profile, source: 'local' };
  }

  // Sync the Supabase ID back into localStorage
  saveLocal({ ...profile, supabaseId: data.id });
  return { data, source: 'supabase' };
}

/**
 * Fetch a user by nickname (public profile).
 * @param {string} nickname
 * @returns {Promise<{data: TripClawProfile|null, source: string}>}
 */
export async function fetchProfile(nickname) {
  if (!supabase) return { data: getLocal(), source: 'local' };

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('nickname', nickname)
    .single();

  if (error) {
    logger.warn('[IdentityAPI] Fetch failed:', error.message);
    return { data: getLocal(), source: 'local' };
  }

  return { data, source: 'supabase' };
}

/**
 * Update XP and level in Supabase after the XpEngine calculates them.
 */
export async function syncXpToCloud(nickname, xp, level) {
  if (!supabase) return;

  const { error } = await supabase
    .from('users')
    .update({ xp, level })
    .eq('nickname', nickname);

  if (error) console.warn('[IdentityAPI] XP sync failed:', error.message);
}

/**
 * Unlock or update city exploration progress.
 */
export async function upsertCityProgress(userId, cityName, explorationPercentage) {
  if (!supabase) return;

  const { error } = await supabase
    .from('city_unlocks')
    .upsert({
      user_id: userId,
      city_name: cityName,
      exploration_percentage: explorationPercentage,
    }, { onConflict: 'user_id,city_name' })
    .select();

  if (error) console.warn('[IdentityAPI] City upsert failed:', error.message);
}

/**
 * Fetch all city progress for a user.
 */
export async function fetchCityProgress(userId) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('city_unlocks')
    .select('*')
    .eq('user_id', userId)
    .order('discovered_at', { ascending: false });

  if (error) {
    console.warn('[IdentityAPI] City fetch failed:', error.message);
    return [];
  }
  return data;
}

/**
 * Fetch active missions for a city.
 */
export async function fetchMissions(cityName) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('city_name', cityName);

  if (error) {
    console.warn('[IdentityAPI] Missions fetch failed:', error.message);
    return [];
  }
  return data;
}

/**
 * Complete a mission for a user.
 */
export async function completeMission(userId, missionId) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_missions')
    .upsert({
      user_id: userId,
      mission_id: missionId,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.warn('[IdentityAPI] Mission complete failed:', error.message);
    return null;
  }
  return data;
}

/**
 * Grant a badge to a user.
 */
export async function grantBadge(userId, badgeId) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_badges')
    .insert({ user_id: userId, badge_id: badgeId })
    .select()
    .single();

  if (error) {
    console.warn('[IdentityAPI] Badge grant failed:', error.message);
    return null;
  }
  return data;
}

/**
 * Fetch all badges for a user (passport).
 */
export async function fetchUserBadges(userId) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('user_badges')
    .select('*, badges(*)')
    .eq('user_id', userId)
    .order('minted_at', { ascending: false });

  if (error) {
    console.warn('[IdentityAPI] Badges fetch failed:', error.message);
    return [];
  }
  return data;
}
