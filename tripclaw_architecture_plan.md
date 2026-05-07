# TripClaw Progression Engine 🧬

This document outlines the architecture for the TripClaw Progression Engine, transforming the app into an immersive, cyber-explorer platform.

## 1. UX Flow (The Explorer's Loop)
1. **Discovery**: User enters a new city territory (e.g., Cusco) via the Map interface.
2. **Ping**: The local Swarm Agent detects the user and sends a localized "Mystery Mission" (e.g., "Find the hidden San Blas artisan").
3. **Action**: User completes the action (geo-check-in, transaction, or itinerary completion).
4. **Validation**: The backend verifies the action via GPS coordinates or Stellar transaction hashes.
5. **Reward & Reveal**: A futuristic UI overlay appears (Framer Motion). The user gains XP, levels up, and mints an on-chain NFT Badge.

## 2. UI Structure (React + Framer Motion)
* **HUD Identity Bar**: Always visible at the top (implemented in Dashboard), showing Level, XP progress bar, and Nickname.
* **Mission Drawer**: A sleek, translucent glassmorphism bottom drawer that slides up to reveal active local agent missions.
* **Badge Showcase Modal**: A 3D-tilting card view (using `react-tilt` and Framer Motion) to display unlocked achievements with cyber-punk neon glows based on rarity (Common, Rare, Legendary).

## 3. Backend Architecture (NestJS / FastAPI)
* **API Gateway**: Handles incoming client requests and routes them to microservices.
* **Identity Microservice**: Manages user profiles, XP, and leveling logic.
* **Geo-Spatial Engine**: Uses PostGIS in PostgreSQL to trigger events when users enter specific polygons (cities/neighborhoods).
* **Web3 Event Listener**: Listens to the Stellar Testnet for Soroban contract events to validate on-chain achievements.
* **WebSocket Server**: Pushes real-time mission alerts and Swarm updates to the client.

## 4. Database Schema (PostgreSQL + Prisma)

```sql
-- Core User Identity
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nickname VARCHAR(50) UNIQUE NOT NULL,
    wallet_address VARCHAR(100),
    traveler_type VARCHAR(50),
    companion_id VARCHAR(50),
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    reputation_score INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT NOW()
);

-- City Unlocks & Progress
CREATE TABLE city_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    city_name VARCHAR(100) NOT NULL,
    unlocked BOOLEAN DEFAULT true,
    exploration_percentage INTEGER DEFAULT 0,
    discovered_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, city_name)
);

-- Missions & Quests
CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_name VARCHAR(100),
    title VARCHAR(100),
    description TEXT,
    xp_reward INTEGER,
    badge_reward_id UUID,
    geo_polygon GEOMETRY(Polygon, 4326) -- PostGIS
);

-- User Missions Log
CREATE TABLE user_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    mission_id UUID REFERENCES missions(id),
    status VARCHAR(20) DEFAULT 'active', -- active, completed, failed
    completed_at TIMESTAMP
);

-- Badges (Future On-chain NFTs)
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    rarity VARCHAR(20), -- common, rare, legendary, mythic
    image_url VARCHAR(255),
    stellar_contract_id VARCHAR(100)
);

-- User Badges (Inventory)
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    badge_id UUID REFERENCES badges(id),
    minted_at TIMESTAMP DEFAULT NOW()
);
```

## 5. API Routes (RESTful)
* `POST /api/v1/identity` - Create/Update user profile.
* `GET /api/v1/identity/@:nickname` - Fetch public traveler profile.
* `POST /api/v1/geo/check-in` - Validate GPS coords against active missions.
* `GET /api/v1/missions?city=:city` - Fetch available agent missions for a territory.
* `POST /api/v1/rewards/claim` - Claim XP and trigger Badge minting logic.

## 6. Animation Ideas
* **Level Up Sequence**: Screen darkens, a glitch effect plays, and the new level number aggressively scales up with a satisfying cyber-chime, surrounded by a particle explosion.
* **Mission Reveal**: The UI simulates a terminal decoding text character-by-character when an AI Agent assigns a new mission.

## 7. Retention Logic
* **Variable Rewards**: Missions grant a random range of XP (e.g., 50-80) to maintain dopamine unpredictability without feeling like a casino.
* **Social Proof**: The public `/traveler/@nickname` profile creates prestige. Users want to collect rare badges from difficult locations (e.g., "Inca Trail Survivor").

## 8. Edge Cases
* **GPS Spoofing**: Implement basic velocity checks (user can't check-in to Lima and Cusco within 5 minutes).
* **Offline Modes**: Allow offline mission tracking that syncs when connectivity is restored, crucial for remote travel areas.
* **Wallet Loss**: Separate internal XP/Level from Web3 Wallet. If a wallet is lost, the Web2 identity remains intact, and a new wallet can be bound (though past NFTs might be lost).

## 9. Scalable Architecture
* Use **Redis** to cache public profiles (`/traveler/@nickname`) since they are read-heavy.
* Use **WebSockets** heavily for real-time Swarm map updates instead of polling.
* Offload heavy AI tasks (itinerary generation) to background workers using a job queue.

## 10. Production-Ready Next Steps
1. Set up a PostgreSQL database (e.g., Supabase).
2. Migrate the `localStorage` MVP logic to the actual DB.
3. Build the `/traveler/@[nickname]` public profile page.
