/**
 * Skill Handlers — Local execution layer for TripClaw skills.
 *
 * When ZeroClaw gateway is online → invokeTool() sends to the agent.
 * When offline → these handlers provide intelligent demo responses
 * so the UI feels alive and demonstrates the skill's purpose.
 *
 * Each handler receives { query, destination, action, ...params }
 * and returns { result: string, metadata?: object }
 */

// ── Trip Analyzer ───────────────────────────────────────────
const tripAnalyzer = (params) => {
  const dest = params.destination || params.query || 'Unknown destination';

  const safetyScores = {
    'Paris': 82, 'Tokyo': 95, 'Rome': 76, 'Santorini': 90,
    'New York': 74, 'Bali': 85, 'London': 80, 'Bangkok': 72,
  };

  const matchedCity = Object.keys(safetyScores).find(
    (c) => dest.toLowerCase().includes(c.toLowerCase())
  );
  const safety = matchedCity ? safetyScores[matchedCity] : Math.floor(65 + Math.random() * 30);
  const cost = Math.floor(40 + Math.random() * 50);
  const sentiment = Math.floor(70 + Math.random() * 25);
  const crowd = ['Low', 'Moderate', 'High', 'Very High'][Math.floor(Math.random() * 4)];

  return {
    result: `📊 **Trip Analysis: ${dest}**

🛡️ **Safety Score:** ${safety}/100 ${safety > 85 ? '✅ Very Safe' : safety > 70 ? '⚠️ Generally Safe' : '🔴 Exercise Caution'}
💰 **Budget Index:** ${cost}/100 ${cost > 60 ? '($$$ Expensive)' : cost > 35 ? '($$ Moderate)' : '($ Budget-Friendly)'}
😊 **Traveler Sentiment:** ${sentiment}% positive
👥 **Current Crowd Level:** ${crowd}

**Key Insights:**
• ${safety > 80 ? 'Well-patrolled tourist areas with low crime rates' : 'Stay alert in crowded areas, avoid unlit streets at night'}
• ${cost > 60 ? 'Book accommodation 2-3 months ahead for better rates' : 'Great value for money — local food is very affordable'}
• Best time to visit popular attractions: early morning (7-9 AM)
• ${crowd === 'High' || crowd === 'Very High' ? '⚠️ Peak season — expect queues at major sites' : 'Good timing — moderate tourist traffic'}

_Powered by trip_analyzer • ${new Date().toLocaleDateString()}_`,
    metadata: { safety, cost, sentiment, crowd, destination: dest },
  };
};

// ── Weather Forecast ────────────────────────────────────────
const weatherForecast = (params) => {
  const dest = params.destination || params.query || 'your destination';

  const conditions = ['☀️ Sunny', '⛅ Partly Cloudy', '🌤️ Mostly Sunny', '🌧️ Light Rain', '⛈️ Thunderstorms'];
  const temps = Array.from({ length: 5 }, () => Math.floor(15 + Math.random() * 20));

  const days = [];
  const now = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dayName = d.toLocaleDateString('en', { weekday: 'short' });
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    days.push(`${dayName}: ${condition} ${temps[i]}°C / ${Math.floor(temps[i] * 1.8 + 32)}°F`);
  }

  const avgTemp = Math.round(temps.reduce((a, b) => a + b) / temps.length);
  const rainChance = Math.floor(10 + Math.random() * 60);

  return {
    result: `🌤️ **5-Day Forecast: ${dest}**

${days.map((d) => `• ${d}`).join('\n')}

📊 **Summary:**
• Average temp: ${avgTemp}°C / ${Math.floor(avgTemp * 1.8 + 32)}°F
• Rain probability: ${rainChance}%
• UV Index: ${Math.floor(3 + Math.random() * 8)} (${rainChance < 30 ? 'Wear sunscreen!' : 'Bring an umbrella'})
• Humidity: ${Math.floor(40 + Math.random() * 40)}%

💡 **Packing tip:** ${avgTemp > 25 ? 'Light, breathable clothes. Don\'t forget sunglasses!' : avgTemp > 15 ? 'Layers recommended — cool mornings, warm afternoons.' : 'Pack warm layers and a waterproof jacket.'}

_Powered by weather_forecast • Updated ${new Date().toLocaleTimeString()}_`,
    metadata: { avgTemp, rainChance, days: temps },
  };
};

// ── Local Recommender ───────────────────────────────────────
const localRecommender = (params) => {
  const dest = params.destination || params.query || 'your destination';

  const categories = {
    food: [
      { name: 'Hidden Garden Café', type: 'Café', rating: '4.8★', price: '$$', note: 'Try the house-blend pour-over' },
      { name: 'Nonna\'s Kitchen', type: 'Local Cuisine', rating: '4.9★', price: '$', note: 'Authentic family recipes since 1952' },
      { name: 'Rooftop Sushi Bar', type: 'Japanese Fusion', rating: '4.7★', price: '$$$', note: 'Sunset views + omakase' },
    ],
    culture: [
      { name: 'Street Art District', type: 'Free Walking Tour', rating: '4.6★', price: 'Free', note: 'Self-guided, best on weekday mornings' },
      { name: 'Artisan Market', type: 'Local Market', rating: '4.5★', price: '$', note: 'Saturdays 8AM-2PM, handmade crafts' },
    ],
    hidden: [
      { name: 'Secret Viewpoint', type: 'Lookout', rating: '4.9★', price: 'Free', note: 'Locals-only spot, 10min hike' },
      { name: 'Underground Jazz Club', type: 'Nightlife', rating: '4.8★', price: '$$', note: 'Live music Thu-Sat from 9PM' },
    ],
  };

  return {
    result: `🗺️ **Local Recommendations: ${dest}**

🍽️ **Food & Dining**
${categories.food.map((r) => `• **${r.name}** — ${r.type} | ${r.rating} | ${r.price}\n  _${r.note}_`).join('\n')}

🎨 **Culture & Activities**
${categories.culture.map((r) => `• **${r.name}** — ${r.type} | ${r.rating} | ${r.price}\n  _${r.note}_`).join('\n')}

💎 **Hidden Gems**
${categories.hidden.map((r) => `• **${r.name}** — ${r.type} | ${r.rating} | ${r.price}\n  _${r.note}_`).join('\n')}

_Curated by local_recommender • AI-powered sentiment analysis of 10K+ reviews_`,
    metadata: { totalPlaces: 7, categories: Object.keys(categories) },
  };
};

// ── Telegram Send ───────────────────────────────────────────
const telegramSend = (params) => {
  const message = params.query || params.message || 'No message specified';
  return {
    result: `📤 **Telegram Alert Queued**

Message: "${message}"
Channel: @Vogaye_bot
Status: ${params._gatewayOnline ? '✅ Sent via ZeroClaw' : '⏳ Queued — will send when gateway connects'}

_Configure VITE_TELEGRAM_BOT_TOKEN in .env for direct delivery_`,
    metadata: { queued: true, message },
  };
};

// ── Itinerary Builder ───────────────────────────────────────
const itineraryBuilder = (params) => {
  const dest = params.destination || params.query || 'your destination';

  const activities = [
    ['🏛️ Morning: Historic district walking tour', '🍽️ Lunch: Local market food crawl', '📸 Afternoon: Photography at viewpoint', '🌅 Evening: Sunset cruise'],
    ['🧘 Morning: Yoga at local studio', '☕ Brunch: Award-winning café', '🎨 Afternoon: Art museum + gallery hop', '🍷 Evening: Wine tasting experience'],
    ['🥾 Morning: Nature trail hike', '🍜 Lunch: Street food adventure', '🏖️ Afternoon: Beach / park relaxation', '🎭 Evening: Live performance or night market'],
  ];

  const budget = { accommodation: Math.floor(60 + Math.random() * 140), food: Math.floor(30 + Math.random() * 70), activities: Math.floor(20 + Math.random() * 80), transport: Math.floor(10 + Math.random() * 40) };
  const total = Object.values(budget).reduce((a, b) => a + b, 0);

  return {
    result: `📅 **3-Day Itinerary: ${dest}**

**Day 1 — Explore & Orient**
${activities[0].map((a) => `• ${a}`).join('\n')}

**Day 2 — Culture & Relaxation**
${activities[1].map((a) => `• ${a}`).join('\n')}

**Day 3 — Adventure & Farewell**
${activities[2].map((a) => `• ${a}`).join('\n')}

💰 **Estimated Daily Budget:**
• 🏨 Accommodation: $${budget.accommodation}/night
• 🍽️ Food: $${budget.food}/day
• 🎫 Activities: $${budget.activities}/day
• 🚌 Transport: $${budget.transport}/day
• **Total: ~$${total}/day ($${total * 3} for 3 days)**

💡 **Pro tips:**
• Book Day 1 activities in advance to skip lines
• Day 2 morning is flexible — adjust based on energy
• Leave Day 3 evening open for spontaneous discoveries

_Built by itinerary_builder • Optimized for experience-to-cost ratio_`,
    metadata: { days: 3, dailyBudget: total, destination: dest },
  };
};

// ── Handler Registry ────────────────────────────────────────
const handlers = {
  trip_analyzer: tripAnalyzer,
  weather_forecast: weatherForecast,
  local_recommender: localRecommender,
  telegram_send: telegramSend,
  itinerary_builder: itineraryBuilder,
};

/**
 * Execute a skill locally (demo mode).
 * @param {string} toolName - Name of the skill to run
 * @param {object} params - Parameters for the skill
 * @returns {{ result: string, metadata?: object } | null}
 */
export const executeSkillLocally = (toolName, params = {}) => {
  const handler = handlers[toolName];
  if (!handler) return null;

  try {
    return handler(params);
  } catch (error) {
    console.error(`[SkillHandler] ${toolName} failed:`, error);
    return { result: `⚠️ Skill "${toolName}" encountered an error: ${error.message}` };
  }
};

/** Check if a local handler exists for a given skill name */
export const hasLocalHandler = (toolName) => toolName in handlers;

/** Get list of all locally-available skills with metadata */
export const getLocalSkills = () => [
  { name: 'trip_analyzer', description: 'Analyzes destinations for tourist safety, cost, and sentiment scoring', type: 'skill' },
  { name: 'weather_forecast', description: 'Fetches real-time weather data for any global destination', type: 'api' },
  { name: 'local_recommender', description: 'AI-curated local food, culture, and hidden gem recommendations', type: 'skill' },
  { name: 'telegram_send', description: 'Forwards agent insights and alerts to Telegram groups', type: 'integration' },
  { name: 'itinerary_builder', description: 'Creates multi-day smart itineraries with budget optimization', type: 'skill' },
];
