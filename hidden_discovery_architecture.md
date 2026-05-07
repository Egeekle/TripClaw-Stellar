# TripClaw: Hidden Discovery System 📡

## 1. Core Architecture Overview
The "Hidden Discovery" system is a geo-spatial, event-driven engine. It constantly evaluates a user's location against a database of hidden gems, applying AI scoring based on weather, time, and crowd density to decide IF and WHEN to unlock a discovery.

### Tech Stack Additions
- **PostGIS**: For fast spatial queries (`ST_DWithin`).
- **Redis (GeoHashes + Sorted Sets)**: For real-time proximity caching and crowd density heatmaps.
- **OpenWeatherMap API / WeatherKit**: For environmental context.
- **Framer Motion**: For the cinematic "cyber-unlock" UI.

---

## 2. PostgreSQL / PostGIS Schema

```sql
-- The Hidden Locations Database
CREATE TABLE hidden_discoveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- rooftop, speakeasy, viewpoint, event
    rarity VARCHAR(20), -- uncommon, rare, legendary
    xp_reward INTEGER,
    geo_location GEOMETRY(Point, 4326),
    conditions JSONB, -- e.g., {"time": "night", "weather": "clear", "crowds": "low"}
    found_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tracking who found what
CREATE TABLE user_discoveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    discovery_id UUID REFERENCES hidden_discoveries(id),
    found_at TIMESTAMP DEFAULT NOW(),
    weather_at_time VARCHAR(50),
    UNIQUE(user_id, discovery_id)
);
```

---

## 3. Redis Caching Strategy & Anti-Spam
- **Proximity Cache (`GEOADD / GEORADIUS`)**: Active discoveries are loaded into a Redis Geo index. When a user moves, we query Redis first (`GEORADIUS active_discoveries lng lat 1 km`) before hitting PostGIS.
- **Cooldown Logic (`SETEX`)**: To prevent notification spam, we set a cooldown key per user: `SETEX user:{id}:cooldown 3600 true`. The system will not ping the user again for 1 hour.
- **Crowd Heatmap**: Check-ins increment a Redis sorted set `ZINCRBY crowd_density:cusco_centro 1`. AI avoids triggering discoveries if density is too high.

---

## 4. AI Recommendation Engine (ZeroClaw / Backend)
When the user enters a 1km radius of potential discoveries, the engine evaluates the candidates using a scoring algorithm:

```python
# Pseudo-code for AI Decision Matrix
def score_discovery(discovery, user, context):
    score = 0
    # Context Matching
    if context.weather == discovery.conditions['weather']: score += 30
    if context.time_of_day == discovery.conditions['time']: score += 30
    
    # Rarity & History
    if discovery.rarity == 'legendary' and user.level >= 10: score += 40
    if user.traveler_type in discovery.category: score += 20
    
    # Crowd penalty (we want exclusive experiences)
    if context.crowd_density == 'high': score -= 50
    
    return score
```

---

## 5. API Endpoints
* `POST /api/v1/telemetry/location` - Receives user coordinates, checks cooldowns, triggers background job.
* `GET /api/v1/discoveries/active` - Fetches currently active unlocked discoveries.
* `POST /api/v1/discoveries/:id/claim` - User physically arrives and claims the XP/Badge.

---

## 6. Frontend Architecture (React + Framer Motion)

### Flow
1. **WebSocket Event**: The server pushes an event `DISCOVERY_UNLOCKED`.
2. **Audio Cue**: A subtle, futuristic scanner sound plays.
3. **UI Overlay**: A `HiddenDiscoveryOverlay` component mounts with a cinematic entrance.
4. **Map Update**: The Leaflet map pans slightly, and a glowing purple marker pulses at the location.

### Cinematic UI Requirements
- **Cyber-Minimal**: Dark glassmorphism (`bg-slate-900/80 backdrop-blur-xl`), neon violet accents.
- **Terminal Text**: The text should reveal character-by-character as if being decoded by the user's Companion AI.
- **Action Buttons**: "Initiate Route" (Accept) or "Dismiss" (Ignore).

## 7. Production-Ready Next Steps
1. Create the `HiddenDiscovery` React Component using Framer Motion.
2. Implement the `DiscoveryService` logic in the frontend to listen to simulated WebSockets.
3. Update the `Map.jsx` to render the glowing markers when a discovery is triggered.
