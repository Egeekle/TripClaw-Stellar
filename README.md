# 🦀 TripClaw

**AI-powered travel explorer managed by your local ZeroClaw agent.**

TripClaw is a React-based travel intelligence app that connects to a [ZeroClaw](https://zeroclaw.dev) agent running on your machine. It provides autonomous trip planning, real-time destination analysis, safety scoring, and swarm-based tourist intelligence — all orchestrated by a persistent, local-first AI agent.

---

## ✨ Features

- **🤖 ZeroClaw Agent Integration** — Chat with your AI agent, invoke skills, and receive real-time insights via WebSocket
- **🗺️ Interactive Swarm Map** — Visualize AI agents exploring global tourist hubs with live sentiment and dialogue bubbles
- **💬 Agent Console** — Terminal-style interface with chat, event logs, and skill management tabs
- **📍 Location Intelligence** — Click any city landmark to trigger a ZeroClaw analysis
- **📱 Telegram Alerts** — Forward agent insights to Telegram (via agent or direct API)
- **🔐 Pairing Flow** — Secure one-time pairing code from the gateway terminal
- **🌙 Dark Mode** — Full dark theme with violet/fuchsia gradient branding
- **⚡ Demo Mode** — Runs with simulated data when no gateway is available

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| State | React Context (`OpenClawContext`) |
| Agent Backend | ZeroClaw Gateway (`localhost:42617`) |
| Protocols | REST (`/webhook`, `/api/*`) + WebSocket (`/ws/chat`) |
| Notifications | Telegram Bot API |
| Icons | Google Material Symbols |
| Typography | Space Grotesk |

---

## 📁 Project Structure

```
TripClaw/
├── index.html
├── .env                          # ZeroClaw + Telegram config
├── vite.config.js
├── tailwind.config.js
└── src/
    ├── main.jsx                  # App entry with OpenClawProvider
    ├── App.jsx                   # Route definitions
    ├── index.css                 # Global styles
    ├── context/
    │   └── OpenClawContext.jsx   # React context for agent state
    ├── services/
    │   ├── openclawApi.js        # ZeroClaw Gateway API client
    │   └── mirofishApi.js        # Legacy Maritime.sh (unused)
    └── pages/
        ├── Onboarding.jsx        # /  — Pairing + interest selection
        ├── Dashboard.jsx         # /dashboard — Agent status + feed
        ├── Map.jsx               # /map — Interactive swarm map
        └── AgentConsole.jsx      # /console — Direct agent chat
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **ZeroClaw** agent running locally (optional — app works in demo mode)

### Install & Run

```bash
git clone https://github.com/your-username/TripClaw.git
cd TripClaw
npm install
npm run dev
```

App available at `http://localhost:5173`.

---

## 🔐 Pairing with ZeroClaw

When the ZeroClaw gateway starts, it displays a one-time pairing code:

```
🦀 ZeroClaw Gateway listening on http://[::]:42617

  🔐 PAIRING REQUIRED — use this one-time code:
     ┌──────────────┐
     │   961591     │
     └──────────────┘
```

### Option A: Pair via TripClaw UI

1. Open TripClaw at `http://localhost:5173`
2. Enter the 6-digit pairing code on the Onboarding screen
3. Click **Pair** — the app will call `POST /pair` with the code
4. Copy the returned bearer token to your `.env` file:
   ```env
   VITE_ZEROCLAW_TOKEN=your_returned_token
   ```
5. Restart the dev server

### Option B: Pair via curl

```bash
curl -X POST http://localhost:42617/pair \
  -H "X-Pairing-Code: 961591" \
  -H "Content-Type: application/json"
```

Save the returned token in your `.env` as `VITE_ZEROCLAW_TOKEN`.

---

## 🔌 ZeroClaw API Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/pair` | `POST` | `X-Pairing-Code` header | Pair a new client |
| `/webhook` | `POST` | Bearer token | Send prompt: `{"message": "..."}` |
| `/api/*` | `GET/POST` | Bearer token | REST API |
| `/ws/chat` | `WS` | Token via query param | WebSocket agent chat |
| `/health` | `GET` | None | Health check |
| `/metrics` | `GET` | None | Prometheus metrics |

### WebSocket Events (`/ws/chat`)

| Event Type | Description |
|------------|-------------|
| `response` | Agent reply to a message |
| `tool_call` / `action` | Agent invoking a skill |
| `tool_result` | Result from a skill execution |
| `thinking` / `processing` | Agent is working |
| `status` | Gateway status change |
| `error` | Error from agent |

---

## 📱 Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Onboarding | Pairing code input, gateway detection, travel interests |
| `/dashboard` | Dashboard | Agent status, active skills, live activity feed |
| `/map` | Explorer Map | Interactive map with AI agents + city landmarks |
| `/console` | Agent Console | Chat, events log, skills manager |

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_ZEROCLAW_GATEWAY_URL` | ZeroClaw REST API URL | `http://localhost:42617` |
| `VITE_ZEROCLAW_WS_URL` | ZeroClaw WebSocket URL | `ws://localhost:42617` |
| `VITE_ZEROCLAW_TOKEN` | Bearer token from pairing | — |
| `VITE_TELEGRAM_BOT_TOKEN` | Telegram bot token (optional) | — |
| `VITE_TELEGRAM_CHAT_ID` | Telegram chat ID (optional) | — |

---

## 📄 License

MIT

---

<p align="center">
  Built with 🦀 by TripClaw — powered by ZeroClaw
</p>
