/**
 * Discovery Service 
 * Simulates the backend AI recommendation engine and Redis proximity cache.
 * In production, this would communicate via WebSockets with the NestJS/FastAPI backend.
 */

// Mock PostGIS / Redis Database
const MOCK_DISCOVERIES = [
  {
    id: 'd-001',
    title: 'Secret Jazz Rooftop',
    description: 'A hidden rooftop bar playing live jazz. Enter through the unmarked black door next to the bakery.',
    category: 'rooftop',
    rarity: 'Legendary',
    xpReward: 150,
    foundCount: 12,
    conditions: { time: 'night', weather: 'clear' },
    lat: -12.1211, // Miraflores
    lng: -77.0294
  },
  {
    id: 'd-002',
    title: 'San Blas Artisan Workshop',
    description: 'An underground workshop where local artisans craft silver jewelry. They offer impromptu classes.',
    category: 'culture',
    rarity: 'Rare',
    xpReward: 80,
    foundCount: 45,
    conditions: { time: 'day', weather: 'any' },
    lat: -13.1631, // Cusco
    lng: -72.5450
  }
];

export class DiscoveryService {
  constructor() {
    this.cooldowns = new Map(); // Simulates Redis SETEX user:{id}:cooldown
  }

  /**
   * Simulates the AI evaluating context against nearby discoveries.
   */
  async evaluateLocation(userLocation, userProfile, environmentalContext) {
    // 1. Check Cooldown (Anti-spam)
    const cooldownKey = `${userProfile.id || 'local'}_cooldown`;
    if (this.cooldowns.has(cooldownKey)) {
      const expiresAt = this.cooldowns.get(cooldownKey);
      if (Date.now() < expiresAt) {
        console.log('Discovery engine on cooldown. Skipping evaluation.');
        return null;
      }
    }

    // 2. Proximity Search (Simulating PostGIS ST_DWithin / Redis GEORADIUS)
    // For demo, we just pick a random discovery to simulate finding one nearby
    const nearby = MOCK_DISCOVERIES[Math.floor(Math.random() * MOCK_DISCOVERIES.length)];

    // 3. AI Scoring Logic
    let score = 0;
    if (environmentalContext.time === nearby.conditions.time || nearby.conditions.time === 'any') score += 30;
    if (environmentalContext.weather === nearby.conditions.weather || nearby.conditions.weather === 'any') score += 30;
    if (nearby.rarity === 'Legendary' && userProfile.level >= 5) score += 40;
    if (environmentalContext.crowdDensity === 'high') score -= 50;

    // If score is high enough, trigger the discovery
    if (score > 40) {
      // 4. Set Cooldown (1 hour in prod, 10s for demo)
      this.cooldowns.set(cooldownKey, Date.now() + 10000); 
      return {
        ...nearby,
        weather: environmentalContext.weather
      };
    }

    return null;
  }
}

export const discoveryEngine = new DiscoveryService();
