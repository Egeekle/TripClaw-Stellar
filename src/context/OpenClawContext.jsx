import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  fetchAgentStatus,
  fetchAvailableTools,
  fetchConversationHistory,
  createZeroClawWebSocket,
  sendAgentMessage,
  pairWithGateway,
  invokeTool,
} from '../services/openclawApi';
import { executeSkillLocally, getLocalSkills } from '../services/skillHandlers';

const OpenClawContext = createContext(null);

const MAX_MESSAGES = 200;
const THINKING_TIMEOUT_MS = 30_000;

export function OpenClawProvider({ children }) {
  const [status, setStatus] = useState(null);
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [tools, setTools] = useState([]);
  const [messages, setMessages] = useState([]);
  const [agentEvents, setAgentEvents] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const socketRef = useRef(null);
  const mountedRef = useRef(false);
  const thinkingTimeoutRef = useRef(null);

  // Helper: append message with cap
  const appendMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg].slice(-MAX_MESSAGES));
  }, []);

  // Helper: clear thinking timeout
  const clearThinkingTimeout = useCallback(() => {
    if (thinkingTimeoutRef.current) {
      clearTimeout(thinkingTimeoutRef.current);
      thinkingTimeoutRef.current = null;
    }
  }, []);

  // Helper: set thinking with auto-timeout
  const startThinking = useCallback(() => {
    setIsThinking(true);
    clearThinkingTimeout();
    thinkingTimeoutRef.current = setTimeout(() => {
      setIsThinking(false);
    }, THINKING_TIMEOUT_MS);
  }, [clearThinkingTimeout]);

  const stopThinking = useCallback(() => {
    setIsThinking(false);
    clearThinkingTimeout();
  }, [clearThinkingTimeout]);

  // ── Fetch initial state ──────────────────────────────────
  useEffect(() => {
    fetchAgentStatus().then(setStatus);
    fetchAvailableTools().then((t) => {
      // Use gateway tools if available, otherwise use local skill definitions
      setTools(t && t.length > 0 ? t : getLocalSkills());
    });
    fetchConversationHistory(30).then((hist) => {
      if (Array.isArray(hist)) setMessages(hist);
    });
  }, []);

  // ── Poll health every 15s ────────────────────────────────
  useEffect(() => {
    const poll = setInterval(() => {
      fetchAgentStatus().then(setStatus);
    }, 15000);
    return () => clearInterval(poll);
  }, []);

  // ── WebSocket connection via /ws/chat ────────────────────
  // Uses mountedRef to prevent StrictMode double-connection
  useEffect(() => {
    if (mountedRef.current) return; // Already connected in StrictMode re-run
    mountedRef.current = true;

    const ws = createZeroClawWebSocket(
      (data) => {
        switch (data.type) {
          case 'agent_response':
          case 'message':
          case 'response':
            appendMessage({
              role: 'assistant',
              content: data.content || data.text || data.message || JSON.stringify(data),
              timestamp: Date.now(),
            });
            stopThinking();
            break;
          case 'tool_call':
          case 'tool_result':
          case 'action':
            setAgentEvents((prev) => [
              {
                id: Date.now(),
                type: data.type,
                tool: data.tool || data.name || data.action,
                content: data.result || data.content || data.message || JSON.stringify(data.params || data),
                time: new Date().toLocaleTimeString(),
              },
              ...prev.slice(0, 49),
            ]);
            break;
          case 'thinking':
          case 'processing':
            startThinking();
            break;
          case 'status_update':
          case 'status':
            setStatus((prev) => ({ ...prev, ...data }));
            break;
          case 'error':
            appendMessage({
              role: 'assistant',
              content: `⚠️ Agent error: ${data.message || data.error || JSON.stringify(data)}`,
              timestamp: Date.now(),
            });
            stopThinking();
            break;
          default:
            if (data.content || data.text || data.message) {
              appendMessage({
                role: 'assistant',
                content: data.content || data.text || data.message,
                timestamp: Date.now(),
              });
              stopThinking();
            }
        }
      },
      (newStatus) => setWsStatus(newStatus)
    );

    socketRef.current = ws;
    return () => {
      ws.close();
      mountedRef.current = false;
    };
  }, [appendMessage, startThinking, stopThinking]);

  // ── Send user message via WebSocket (primary) or webhook (fallback) ──
  const send = useCallback(async (content) => {
    const userMsg = { role: 'user', content, timestamp: Date.now() };
    appendMessage(userMsg);
    startThinking();

    // Primary: send via WebSocket if connected
    if (socketRef.current?.getStatus() === 'connected') {
      socketRef.current.send(content);
      return { sent: true, via: 'websocket' };
    }

    // Fallback: POST /webhook (requires bearer token)
    const result = await sendAgentMessage(content);

    if (result && !result.error) {
      const reply = result.content || result.text || result.message || result.response;
      if (reply) {
        appendMessage({ role: 'assistant', content: reply, timestamp: Date.now() });
        stopThinking();
      }
    } else {
      stopThinking();
    }

    return result;
  }, [appendMessage, startThinking, stopThinking]);

  // ── Pair with gateway ────────────────────────────────────
  const pair = useCallback(async (code) => {
    return pairWithGateway(code);
  }, []);

  // ── Run a skill directly (explicit tool invocation) ──────
  const runSkill = useCallback(async (toolName, params = {}, userPrompt = '') => {
    // Show user intent in chat
    const label = userPrompt || `Run skill: ${toolName}`;
    appendMessage({ role: 'user', content: `🛠️ ${label}`, timestamp: Date.now() });
    startThinking();

    // Register as agent event
    setAgentEvents((prev) => [
      {
        id: Date.now(),
        type: 'tool_call',
        tool: toolName,
        content: JSON.stringify(params),
        time: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 49),
    ]);

    // Try direct invocation first
    if (status?.active) {
      const result = await invokeTool(toolName, params);

      if (result && !result.error) {
        const text = result.result || result.content || result.text || JSON.stringify(result, null, 2);
        appendMessage({ role: 'assistant', content: text, timestamp: Date.now() });
        setAgentEvents((prev) => [
          {
            id: Date.now(),
            type: 'tool_result',
            tool: toolName,
            content: typeof text === 'string' ? text.slice(0, 200) : text,
            time: new Date().toLocaleTimeString(),
          },
          ...prev.slice(0, 49),
        ]);
        stopThinking();
        return result;
      }
    }

    // Fallback: send as natural language to the agent
    const prompt = userPrompt
      ? `Use the ${toolName} skill: ${userPrompt}`
      : `Execute the ${toolName} tool with parameters: ${JSON.stringify(params)}`;

    // If WebSocket connected, send via WS (response comes async)
    if (socketRef.current?.getStatus() === 'connected') {
      socketRef.current.send(prompt);
      return { sent: true, via: 'websocket', fallback: true };
    }

    // Try webhook
    const result = await sendAgentMessage(prompt);
    if (result && !result.error) {
      const reply = result.content || result.text || result.message || result.response;
      if (reply) {
        appendMessage({ role: 'assistant', content: reply, timestamp: Date.now() });
        stopThinking();
        return result;
      }
    }

    // Last resort: execute skill locally (demo mode with real output)
    const localResult = executeSkillLocally(toolName, { ...params, _gatewayOnline: false });
    if (localResult) {
      appendMessage({ role: 'assistant', content: localResult.result, timestamp: Date.now() });
      setAgentEvents((prev) => [
        {
          id: Date.now(),
          type: 'tool_result',
          tool: toolName,
          content: `[Local] ${(localResult.result || '').slice(0, 150)}...`,
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 49),
      ]);
    } else {
      appendMessage({
        role: 'assistant',
        content: `⚡ **${toolName}** — No handler available. Connect to ZeroClaw (localhost:18789) for full functionality.`,
        timestamp: Date.now(),
      });
    }
    stopThinking();
    return localResult || { demo: true };
  }, [status, appendMessage, startThinking, stopThinking]);

  // Cleanup thinking timeout on unmount
  useEffect(() => {
    return () => clearThinkingTimeout();
  }, [clearThinkingTimeout]);

  // Memoize the context value to prevent unnecessary re-renders of all consumer components
  // when the OpenClawProvider re-renders for other reasons.
  const value = useMemo(() => ({
    status,
    wsStatus,
    tools,
    messages,
    agentEvents,
    isThinking,
    send,
    pair,
    runSkill,
    isConnected: wsStatus === 'connected',
    isGatewayOnline: status?.active === true,
  }), [status, wsStatus, tools, messages, agentEvents, isThinking, send, pair, runSkill]);

  return (
    <OpenClawContext.Provider value={value}>
      {children}
    </OpenClawContext.Provider>
  );
}

export const useOpenClaw = () => {
  const ctx = useContext(OpenClawContext);
  if (!ctx) throw new Error('useOpenClaw must be used within an OpenClawProvider');
  return ctx;
};
