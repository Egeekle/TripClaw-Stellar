# TripClaw Progression & RPG Engine 🌟

## 1. XP Curve & Level Formula
The level progression uses a **Quadratic Scaling Curve**. It ensures early levels are rapid (dopamine hit, retention), while higher levels require dedication and rare discoveries.

```python
# Formula: XP required for next level
# Base XP = 1000, Multiplier = 1.15
def xp_for_level(level):
    return int(1000 * (level ** 1.5))
```
* **Level 1 -> 2:** 1,000 XP
* **Level 5 -> 6:** 11,180 XP
* **Level 20 -> 21:** 89,442 XP

## 2. XP Reward Balancing
| Action | XP Reward | Cooldown / Anti-Exploit |
| :--- | :--- | :--- |
| **Hidden Discovery (Common)** | +50 XP | 1 per location, 2 hrs |
| **Hidden Discovery (Legendary)** | +250 XP | 1 per location, lifetime |
| **Verified Check-in** | +20 XP | 3 per day, max 10km radius |
| **Complete Swarm Mission** | +150 XP | Mission completion hash verified |
| **Leave High-Quality Review** | +40 XP | Must pass AI text analysis |
| **City Completion (100%)** | +1000 XP | Once per city |

## 3. Traveler Ranks (Prestige System)
Levels are grouped into overarching **Traveler Ranks**. Ranks unlock exclusive AI Skills and UI aesthetics.

1. **Novice Scout (Lvl 1-5):** Standard map, Basic Analyzer.
2. **Urban Navigator (Lvl 6-15):** Unlocks `Smart Budget Planner`, Silver UI accents.
3. **Swarm Sentinel (Lvl 16-30):** Unlocks `Autonomous Itinerary Builder`, Gold UI accents, voting rights.
4. **Apex Explorer (Lvl 31+):** Unlocks `VIP Swarm Access`, Neon Platinum UI, can mint Legendary NFTs.

## 4. PostgreSQL Schema Extensions

```sql
-- XP Audit Log (For rollback and anti-cheat)
CREATE TABLE xp_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action_type VARCHAR(50), -- 'discovery', 'check-in', 'mission'
    amount INTEGER NOT NULL,
    geo_hash VARCHAR(20), -- For location spoofing analysis
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Unlockable Skills
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE,
    required_level INTEGER
);

-- User Active Skills
CREATE TABLE user_skills (
    user_id UUID REFERENCES users(id),
    skill_id UUID REFERENCES skills(id),
    unlocked_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY(user_id, skill_id)
);
```

## 5. NestJS Service Architecture
The backend uses an Event-Driven Architecture via **EventEmitter** or **Redis Pub/Sub** to decouple actions from rewards.

```typescript
// NestJS: xp.service.ts
@Injectable()
export class XpService {
  constructor(private prisma: PrismaService, private websocketGateway: WebSocketGateway) {}

  @OnEvent('user.action.completed')
  async handleUserAction(event: UserActionEvent) {
    // 1. Anti-Exploit Check (Velocity, Cooldowns)
    await this.verifyLegitimacy(event);
    
    // 2. Add XP
    const user = await this.prisma.user.update({
       where: { id: event.userId },
       data: { xp: { increment: event.xpReward } }
    });

    // 3. Level Up Check
    const newLevel = this.calculateLevel(user.xp);
    if (newLevel > user.level) {
      await this.processLevelUp(user.id, newLevel);
      
      // 4. Push WebSocket Event to trigger Cinematic UI
      this.websocketGateway.server.to(user.id).emit('LEVEL_UP', { newLevel, rank: this.getRank(newLevel) });
    }
  }
}
```

## 6. Anti-Exploit Protections
- **Velocity Tracking:** If a user claims a check-in in Cusco and 5 minutes later in Lima, flag account and block XP.
- **AI Spam Filter:** Reviews must pass NLP sentiment/spam check before awarding XP. No "good place" 10-character reviews.
- **Geohash Rate Limiting:** Max 3 interactions per Geohash-6 sector per day.

## 7. The Frontend Experience (Apple-Quality Polish)
When a user levels up, a WebSockets event triggers the `LevelUpModal.jsx`.
- **Visuals:** Dark glassmorphism, slow glowing particles, sharp typography.
- **Sound:** Deep, resonant sci-fi bass drop.
- **Interaction:** Forces the user to acknowledge the new Rank or Skill unlocked.
