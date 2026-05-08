/**
 * TripClaw XP & Progression Engine
 * Simulates the NestJS backend logic for XP balancing and Level Ups.
 * Now syncs to Supabase PostgreSQL via identityApi.
 */
import { syncXpToCloud } from './identityApi';

const RANKS = [
  { maxLevel: 5, name: 'Novice Scout', color: 'from-slate-400 to-slate-600' },
  { maxLevel: 15, name: 'Urban Navigator', color: 'from-blue-400 to-indigo-600' },
  { maxLevel: 30, name: 'Swarm Sentinel', color: 'from-amber-400 to-orange-600' },
  { maxLevel: 100, name: 'Apex Explorer', color: 'from-violet-400 to-fuchsia-600' }
];

export class XpEngine {
  constructor() {
    this.baseXp = 1000;
  }

  /**
   * Calculates the XP required for the NEXT level based on a quadratic curve.
   */
  xpForNextLevel(currentLevel) {
    return Math.floor(this.baseXp * Math.pow(currentLevel, 1.5));
  }

  /**
   * Calculates total level based on cumulative XP.
   */
  calculateLevelFromXp(totalXp) {
    let level = 1;
    while (totalXp >= this.xpForNextLevel(level)) {
      totalXp -= this.xpForNextLevel(level);
      level++;
    }
    return { level, currentLevelXp: totalXp, requiredForNext: this.xpForNextLevel(level) };
  }

  getRank(level) {
    return RANKS.find(r => level <= r.maxLevel) || RANKS[RANKS.length - 1];
  }

  /**
   * Simulates an action being validated by the backend.
   * Returns a payload if the user leveled up.
   * Now syncs to Supabase cloud in the background.
   */
  grantXp(actionType) {
    const profile = JSON.parse(localStorage.getItem('tripclaw_identity') || '{}');
    if (!profile.nickname) return null;

    let xpReward = 0;
    switch (actionType) {
      case 'discovery_common': xpReward = 50; break;
      case 'discovery_legendary': xpReward = 250; break;
      case 'check_in': xpReward = 20; break;
      case 'mission_complete': xpReward = 150; break;
      default: xpReward = 10;
    }

    const previousLevelData = this.calculateLevelFromXp(profile.xp || 0);
    profile.xp = (profile.xp || 0) + xpReward;
    
    const newLevelData = this.calculateLevelFromXp(profile.xp);
    profile.level = newLevelData.level;
    
    localStorage.setItem('tripclaw_identity', JSON.stringify(profile));

    // 🔄 Sync to Supabase PostgreSQL (fire-and-forget, non-blocking)
    syncXpToCloud(profile.nickname, profile.xp, profile.level);

    // Return Level Up Event if true
    if (newLevelData.level > previousLevelData.level) {
      return {
        leveledUp: true,
        oldLevel: previousLevelData.level,
        newLevel: newLevelData.level,
        rank: this.getRank(newLevelData.level),
        xpGained: xpReward
      };
    }

    return { leveledUp: false, xpGained: xpReward, progress: newLevelData };
  }
}

export const xpService = new XpEngine();

