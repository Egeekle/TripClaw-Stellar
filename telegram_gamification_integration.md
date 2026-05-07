# TripClaw: Telegram Bot & Gamification Integration Plan 🤖🚀

This document outlines how the **OpenClaw Telegram Bot** will seamlessly connect with the new **TripClaw Gamification Engine** (XP, Badges, and Leveling) to create a multi-platform, highly retentive "Cyber-Explorer" experience.

---

## 1. Contextual Swarm Alerts (The Ping)
Instead of forcing the user to keep the TripClaw web app open at all times, the Telegram bot acts as their personal **AI Companion in their pocket**.

*   **Proximity Alerts (Hidden Discoveries):** When the backend Geo-Spatial Engine detects the user is near a hidden gem, the Telegram Bot sends a push notification.
    *   *Message:* `🛰️ [Hidden Discovery Detected]`
    *   *Body:* `"Our Swarm Scouts found a secret 16th-century courtyard cafe just 3 mins from you. Only 12 travelers have unlocked this."`
    *   *Action Buttons:* `[Accept Mission: +100 XP]` | `[Skip]`
*   **Weather/Time Dynamics:** `"It's starting to rain in Cusco. I've found an underground artisan market nearby to keep you dry. Exploring it grants a +20% XP Rain Bonus."`

## 2. Interactive "Swipe" Experience on Telegram
We can replicate the `MatchExperience` Tinder-style swipe directly inside Telegram using **Inline Keyboards**.

*   **Flow:** When a user arrives in a new city (e.g., Arequipa), the bot sends an image of a local experience.
*   **UI:** 
    *   [Image of the experience]
    *   *Text:* "Ceremonia de Pago a la Tierra • ⭐ 5.0 • 30 XLM"
    *   *Buttons:* `[❤️ Accept & Pay]` | `[❌ Next]`
*   If they press `❤️`, the bot sends an ephemeral link to the `/payment` route on the TripClaw Web App to securely sign with Freighter.

## 3. Real-Time Progression & Celebrations
Telegram is perfect for immediate dopamine hits and sharing achievements.

*   **Level Up Alerts:** When the user completes an action on the web app (or via physical check-in), the bot immediately congratulates them.
    *   *Message:* `🎉 LEVEL UP!`
    *   *Body:* `"You've reached Level 2: [Guardián Inca]. You've unlocked the Arequipa predictive map!"`
*   **Badge Minting (NFTs):**
    *   *Message:* `💎 New Artifact Acquired!`
    *   *Body:* `"You just minted the 'Primer Camino' badge on the Stellar network. View it in your Passport."`
    *   *Action Button:* `[Open My Passport]` (Deep links to `/passport`)

## 4. On-The-Go GPS Validation (Check-Ins)
Validating a user's location is critical to prevent XP farming. Telegram makes this frictionless.

*   **Flow:** The user arrives at the "Mercado Ancestral".
*   *Bot:* `"Are you at the location? Send me your Live Location to validate your Check-In."`
*   *Action:* The user uses Telegram's native "Send Location" feature.
*   *Validation:* The OpenClaw backend checks the coordinates against the PostGIS database. If it matches -> Escrow is released to the guide -> User gets XP.

## 5. Escrow & Web3 Transaction Updates
To build trust with crypto payments, the bot acts as a transparent auditor.

*   **Funds Locked:** `"🔒 45 XLM securely locked in Escrow for your Inca Trail mission. The guide will be paid upon your arrival."`
*   **Funds Released:** `"✅ Check-in verified. 45 XLM released to @PachacutecTours. Here is your transaction hash: [0xABC...123]. You earned +150 XP!"`

## 6. Social "Swarm" Intel
The user's Telegram bot can receive curated intelligence gathered by *other* TripClaw users (The Swarm).

*   *Bot:* `"Swarm Alert: 3 Travelers just reported that the main entrance to Sacsayhuamán is very crowded. We suggest the alternative Eastern route. [Gain +10 XP for using the alternate route]"`

---

### Technical Implementation Steps (Next Phase)
1.  **Webhooks:** Connect the `xpService.js` (once moved to the backend) to trigger Telegram API Webhooks upon Level Ups or Badge unlocks.
2.  **Telegram Location API:** Build a NestJS endpoint to parse incoming Telegram location messages and cross-reference them with the `missions` database.
3.  **Deep Linking:** Configure Telegram Inline Buttons to open the TripClaw React App using specific URLs (`https://tripclaw.app/payment?missionId=123`).
