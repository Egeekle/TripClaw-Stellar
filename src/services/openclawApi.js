/**
 * ZeroClaw Gateway API Service
 * 
 * Connects TripClaw to a local ZeroClaw agent instance.
 * 
 * ZeroClaw API surface:
 *   POST /pair        — Pair a new client (X-Pairing-Code header)
 *   POST /webhook     — Send prompt: {"message": "your prompt"}
 *   GET  /api/*       — REST API (Bearer token required)
 *   GET  /ws/chat     — WebSocket agent chat
 *   GET  /health      — Health check
 *   GET  /metrics     — Prometheus metrics
 * 
 * Default gateway: http://localhost:18789
 */

// In dev mode, use Vite proxy to avoid CORS. In production, use the direct URL.
const isDev = import.meta.env.DEV;
const DIRECT_URL = import.meta.env.VITE_ZEROCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';
const GATEWAY_URL = isDev ? '/zc-api' : DIRECT_URL;
const WS_URL = isDev
  ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/zc-api`
  : (import.meta.env.VITE_ZEROCLAW_WS_URL || 'ws://127.0.0.1:18789');
const TOKEN = import.meta.env.VITE_ZEROCLAW_TOKEN || '';

// ─── Auth Headers ────────────────────────────────────────────────
const headers = () => ({
  'Content-Type': 'application/json',
  ...(TOKEN && TOKEN !== 'paste_your_bearer_token_here'
    ? { Authorization: `Bearer ${TOKEN}` }
    : {}),
});

const isTokenConfigured = () => TOKEN && TOKEN !== 'paste_your_bearer_token_here';

// ─── Connection Constants ────────────────────────────────────────
const MAX_RECONNECT = 5;
const RECONNECT_DELAY = 2000;

// ─── Pair with Gateway ──────────────────────────────────────────
export const pairWithGateway = async (pairingCode) => {
  try {
    const response = await fetch(`${GATEWAY_URL}/pair`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Pairing-Code': pairingCode,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Pairing failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    console.log('[ZeroClaw] Paired successfully:', data);
    return data; // Expect: { token: "bearer_token_value", ... }
  } catch (error) {
    console.error('[ZeroClaw] Pairing failed:', error);
    return { error: error.message };
  }
};

// ─── Send Message via Webhook ───────────────────────────────────
export const sendAgentMessage = async (content) => {
  try {
    const response = await fetch(`${GATEWAY_URL}/webhook`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ message: content }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`ZeroClaw webhook error ${response.status}: ${errText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[ZeroClaw] Failed to send message:', error);
    return { error: error.message, status: 'failed' };
  }
};

// ─── REST API Calls (Bearer token required) ─────────────────────
const apiGet = async (path) => {
  try {
    const response = await fetch(`${GATEWAY_URL}/api${path}`, {
      headers: headers(),
    });
    if (!response.ok) throw new Error(`API ${path} failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`[ZeroClaw] API GET ${path} failed:`, error);
    return null;
  }
};

const apiPost = async (path, body = {}) => {
  try {
    const response = await fetch(`${GATEWAY_URL}/api${path}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`API ${path} failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`[ZeroClaw] API POST ${path} failed:`, error);
    return null;
  }
};

// ─── Health Check ───────────────────────────────────────────────
export const fetchAgentStatus = async () => {
  try {
    const response = await fetch(`${GATEWAY_URL}/health`);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      active: true,
      gateway: 'online',
      paired: isTokenConfigured(),
      port: 18789,
      ...data,
    };
  } catch (error) {
    console.error('[ZeroClaw] Health check failed:', error);
    return {
      active: false,
      gateway: 'offline',
      paired: isTokenConfigured(),
      port: 18789,
      error: error.message,
    };
  }
};

// ─── Fetch Metrics ──────────────────────────────────────────────
export const fetchMetrics = async () => {
  try {
    const response = await fetch(`${GATEWAY_URL}/metrics`);
    if (!response.ok) throw new Error(`Metrics fetch failed: ${response.status}`);
    return await response.text(); // Prometheus format is plain text
  } catch (error) {
    console.error('[ZeroClaw] Metrics fetch failed:', error);
    return null;
  }
};

// ─── List Available Tools (via REST API) ────────────────────────
export const fetchAvailableTools = async () => {
  const data = await apiGet('/tools');
  return Array.isArray(data) ? data : data?.tools || [];
};

// ─── Fetch Conversation History (via REST API) ──────────────────
export const fetchConversationHistory = async (limit = 20) => {
  const data = await apiGet(`/messages?limit=${limit}`);
  return Array.isArray(data) ? data : data?.messages || [];
};

// ─── Invoke a Tool (via REST API) ───────────────────────────────
export const invokeTool = async (toolName, params = {}) => {
  return apiPost('/tools/invoke', { tool: toolName, params });
};

// ─── WebSocket Chat ─────────────────────────────────────────────
// Each call creates its own closure-local state to avoid conflicts
// when React StrictMode double-mounts the component.
export const createZeroClawWebSocket = (onMessage, onStatusChange) => {
  let socket = null;
  let localStatus = 'disconnected';
  let localReconnectAttempts = 0;
  let reconnectTimer = null;

  const updateStatus = (newStatus) => {
    localStatus = newStatus;
    onStatusChange?.(newStatus);
  };

  const connect = () => {
    updateStatus('connecting');

    try {
      const wsUrl = `${WS_URL}/ws/chat`;
      socket = new WebSocket(
        isTokenConfigured()
          ? `${wsUrl}?token=${TOKEN}`
          : wsUrl
      );

      socket.onopen = () => {
        localReconnectAttempts = 0;
        updateStatus('connected');
        console.log('[ZeroClaw] WebSocket connected to /ws/chat');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'pong') return;
          onMessage(data);
        } catch {
          onMessage({ type: 'text', content: event.data });
        }
      };

      socket.onerror = (error) => {
        console.error('[ZeroClaw] WebSocket error:', error);
        updateStatus('error');
      };

      socket.onclose = (event) => {
        updateStatus('disconnected');
        console.log('[ZeroClaw] WebSocket closed:', event.code, event.reason);

        if (localReconnectAttempts < MAX_RECONNECT) {
          localReconnectAttempts++;
          const delay = RECONNECT_DELAY * Math.pow(1.5, localReconnectAttempts - 1);
          console.log(`[ZeroClaw] Reconnecting in ${delay}ms (attempt ${localReconnectAttempts}/${MAX_RECONNECT})...`);
          reconnectTimer = setTimeout(connect, delay);
        }
      };
    } catch (error) {
      console.error('[ZeroClaw] WebSocket setup failed:', error);
      updateStatus('error');
    }
  };

  connect();

  return {
    send: (data) => {
      if (socket?.readyState === WebSocket.OPEN) {
        // ZeroClaw requires {"type":"message","content":"..."}
        const payload = typeof data === 'string'
          ? { type: 'message', content: data }
          : { type: 'message', content: data.content || JSON.stringify(data) };
        socket.send(JSON.stringify(payload));
      }
    },
    close: () => {
      localReconnectAttempts = MAX_RECONNECT; // Prevent reconnection
      clearTimeout(reconnectTimer);
      socket?.close();
    },
    getStatus: () => localStatus,
  };
};

// ─── Telegram via ZeroClaw or direct ────────────────────────────
export const sendTelegramViaAgent = async (text) => {
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!botToken || !chatId || botToken === 'your_bot_token_here') {
    // Delegate to ZeroClaw agent
    return sendAgentMessage(`Send this to Telegram: ${text}`);
  }

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });
  } catch (error) {
    console.error('[ZeroClaw] Telegram message failed:', error);
  }
};

// ─── Location Interaction ───────────────────────────────────────
export const sendLocationInteraction = async (locationId, action) => {
  return sendAgentMessage(
    `[TripClaw] User interaction at "${locationId}": ${action}. ` +
    `Analyze this location for tourist insights, safety, and local recommendations.`
  );
};
