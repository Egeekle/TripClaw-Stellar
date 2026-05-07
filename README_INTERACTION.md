# TripClaw - The Cyber-Explorer UX Flow 🗺️🤖

Este documento describe la experiencia inmersiva del usuario navegando por la aplicación **TripClaw**. Hemos evolucionado de una simple herramienta de reservas a un ecosistema de exploración gamificada (estilo Pokémon GO + Steam Reputation) impulsado por IA y Web3.

---

## 1. The Identity Layer (`/`)
El punto de entrada ya no es un simple login, es la creación de tu **Identidad Web3**.

* **Paso 1 (Sync):** El usuario empareja su Agente Local ZeroClaw y su **Wallet Stellar** (Freighter). Esto asegura que sus descubrimientos queden registrados on-chain.
* **Paso 2 (Persona):** Selección de un **Nickname** único y un **Traveler Type** (Explorer, Food Hunter, Adventure Seeker).
* **Paso 3 (Companion AI):** El usuario elige a su agente representante (Ej: *Puma Scout, Condor AI*). Este avatar será su nodo visual en el ecosistema.
* **Resultado:** Se genera un perfil inicial de Nivel 1 con 0 XP y reputación neutral.

---

## 2. El HUD de Control (`/dashboard`)
El centro táctico. Diseñado con una estética "cyber-minimalista", funciona como un Heads Up Display (HUD).

* **Identity Bar:** Arriba a la derecha, el usuario ve constantemente su Nickname, Avatar de Companion, y su progreso (Nivel y XP actuales).
* **Swarm Intel:** Monitorea la actividad global y el pulso de la red de agentes turísticos.
* **Skills & Access:** Accesos rápidos a herramientas analíticas o misiones pendientes.

---

## 3. Exploración Geoespacial y Hidden Discoveries (`/map`)
El núcleo de la experiencia TripClaw. El mapa no es estático; es un tablero de juego en tiempo real.

* **El Motor de Descubrimientos Ocultos (Hidden Discovery Engine):**
  * Mientras el usuario navega (física o virtualmente), la IA evalúa constantemente: *clima local, densidad de multitudes, hora del día y nivel del jugador*.
  * Si las condiciones se alinean, se lanza el evento **"Signal Detected"**.
* **Cinematic Unlock:** Aparece un overlay con interfaz "glassmorphism", simulando una terminal desencriptando coordenadas secretas (Ej: *Rooftop Jazz Café*).
* **Recompensa:** El usuario debe elegir "Initiate Route". Al llegar al sitio, gana XP y avanza en su nivel de viajero.

---

## 4. Consola del Agente (`/console`)
La interfaz de interacción directa humano-máquina.

* **Chat Directo:** Comunicación natural con la IA compañera para solicitar inteligencia táctica del viaje.
* **Comandos Rápidos:** Botones preconfigurados para no frenar la fricción durante el viaje (Ej: *📍 Analyze Cusco*, *☀️ Arequipa Weather*).

---

## 5. Prestigio Web3 y Swarm Voting (`/vote` & `/payment`)
Donde la exploración se convierte en valor tangible e influencia.

* **Validación On-Chain:** Los lugares descubiertos pueden desbloquear Badges NFTs únicos en la red de pruebas de Stellar (Soroban).
* **Swarm Voting:** A mayor nivel y XP, el usuario obtiene más peso para votar decisiones dentro de la comunidad (Ej: Qué nuevos itinerarios financiar).
* **Checkout Descentralizado:** Contratación de servicios VIP mediante contratos inteligentes transparentes en XLM.

---

## 🔄 El Bucle de Retención (Explorer's Loop)
1. **Identidad:** Crea un avatar y conecta su wallet.
2. **Ping:** El mapa le alerta de un "Hidden Discovery" cercano y exclusivo.
3. **Acción:** Viaja al lugar, completa el evento y valida la ubicación.
4. **Recompensa:** Sube de Nivel, gana XP y obtiene un Badge NFT brillante.
5. **Prestigio:** Su perfil público (`/traveler/@nickname`) exhibe su rareza a otros exploradores de la red.
