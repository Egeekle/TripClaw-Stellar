# TripClaw Backend — Architecture Initialization Report

## ✅ Infrastructure Status

### Supabase Project
| Property | Value |
|----------|-------|
| **Project** | TripClaw |
| **Project ID** | `pqnjzdxoyjandzzeiioa` |
| **Region** | `sa-east-1` (São Paulo — closest to Peru) |
| **Status** | ACTIVE_HEALTHY |
| **URL** | `https://pqnjzdxoyjandzzeiioa.supabase.co` |
| **Dashboard** | [Open Dashboard](https://supabase.com/dashboard/project/pqnjzdxoyjandzzeiioa) |

---

## ✅ Database Schema (6 Tables Created)

| Table | Purpose | RLS Enabled |
|-------|---------|:-----------:|
| `users` | Core identity: nickname, wallet, level, XP, reputation | ✅ |
| `city_unlocks` | Per-user city exploration progress (%) | ✅ |
| `missions` | AI agent missions per city with XP rewards | ✅ |
| `user_missions` | Log of completed/active/failed missions | ✅ |
| `badges` | Achievement definitions (rarity, NFT contract) | ✅ |
| `user_badges` | User badge inventory (passport) | ✅ |

> [!NOTE]
> PostGIS extension enabled for future geo-spatial polygon queries (GPS validation).

---

## ✅ Seed Data Loaded

### Missions by City
| City | Missions |
|------|:--------:|
| Cusco | 4 |
| Lima | 3 |
| Puno | 2 |
| Arequipa | 2 |
| Iquitos | 2 |
| Nazca | 2 |

### Badges by Rarity
| Rarity | Badges |
|--------|--------|
| Common | First Steps, City Discoverer |
| Rare | Cusco Conqueror, Lima Foodie Elite, Titicaca Mystic, Colca Canyon Sentinel, 7-Day Streak |
| Legendary | Amazon Survivor, Nazca Decoder, Inca Trail Survivor, 30-Day Legend |
| Mythic | Apex Explorer, Swarm Leader |

---

## ✅ Frontend Integration Files Created

| File | Purpose |
|------|---------|
| `src/lib/supabase.js` | Central Supabase client (auto-fallback to localStorage) |
| `src/services/identityApi.js` | Full CRUD API: identity, XP sync, city progress, missions, badges |
| `src/services/xpService.js` | Updated: now syncs level-ups to PostgreSQL in background |
| `.env` | Updated: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` added |

---

## ⚠️ Action Required

Run the following command in your terminal to install the Supabase SDK:

```bash
npm install @supabase/supabase-js
```

Then restart the dev server (`npm run dev`) to pick up the new `.env` variables.

---

## 🔒 Security Notes

- Row Level Security (RLS) is **enabled on all 6 tables**
- MVP policies allow open read/write via anon key (no auth yet)
- When Supabase Auth is added later, policies will be tightened to `auth.uid()` matching

---

## 📋 Remaining Architecture Plan Items

| Section | Status |
|---------|--------|
| §1 UX Flow (Explorer's Loop) | ✅ Implemented in UI |
| §2 UI Structure | ✅ Dashboard, Map, Match, Payment, Passport |
| §3 Backend Architecture | ✅ Supabase initialized |
| §4 Database Schema | ✅ Migrated to PostgreSQL |
| §5 API Routes | ✅ `identityApi.js` wraps Supabase REST |
| §6 Animation Ideas | ✅ LevelUpModal, PageTransition |
| §7 Retention Logic | ✅ Variable XP rewards, public profiles |
| §8 Edge Cases | 🔲 GPS spoofing checks, offline sync |
| §9 Scalable Architecture | 🔲 Redis cache, WebSocket migration |
| §10 Production Next Steps | ✅ DB created, migration started |
| §11 Reputation Engine | ✅ UI implemented, backend schema ready |
| §12 Retention Loops | ✅ Exploration, Daily, City %, Reputation, AI Companion |
