import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpenClaw } from '../context/OpenClawContext';

export default function AgentConsole() {
  const navigate = useNavigate();
  const { messages, agentEvents, tools, isConnected, isGatewayOnline, wsStatus, status, send, runSkill, isThinking } = useOpenClaw();
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // chat | events | tools
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [expandedTool, setExpandedTool] = useState(null);
  const [skillInput, setSkillInput] = useState('');

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    await send(text);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const statusColor = {
    connected: 'bg-emerald-500',
    connecting: 'bg-amber-400',
    disconnected: 'bg-slate-400',
    error: 'bg-red-500',
  };

  const quickCommands = [
    { label: '📍 Analyze Cusco', skill: 'trip_analyzer', query: 'Analyze Cusco for safety, altitude sickness tips, costs, and hidden gems' },
    { label: '🗺️ Plan Lima Trip', skill: 'itinerary_builder', query: 'Create a 3-day itinerary for Lima focusing on gastronomy and culture' },
    { label: '☀️ Arequipa Weather', skill: 'weather_forecast', query: 'Weather forecast for Arequipa this week' },
    { label: '💎 Hidden Gems', skill: 'local_recommender', query: 'Best hidden restaurants and local experiences in the Sacred Valley' },
  ];

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-background-light dark:bg-background-dark font-display">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex size-10 items-center justify-center rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
            >
              <span className="material-symbols-outlined">arrow_back_ios_new</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="size-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <span className="material-symbols-outlined text-white text-lg">neurology</span>
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white dark:border-background-dark ${statusColor[wsStatus]}`}></span>
              </div>
              <div>
                <h2 className="text-slate-900 dark:text-white text-base font-bold">OpenClaw Agent</h2>
                <p className="text-[10px] uppercase tracking-widest font-bold text-violet-500 flex items-center gap-1">
                  {isGatewayOnline ? (
                    <>Gateway Online <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></span></>
                  ) : (
                    <>Demo Mode <span className="size-1.5 bg-amber-400 rounded-full"></span></>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Session:</span>
              <span className="text-[10px] text-slate-900 dark:text-white font-mono font-bold">{status?.session || 'main'}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-1">
          {[
            { key: 'chat', label: 'Chat', icon: 'chat' },
            { key: 'events', label: 'Events', icon: 'event_note', count: agentEvents.length },
            { key: 'tools', label: 'Skills', icon: 'build', count: tools.length || 3 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-t-lg border-b-2 ${
                activeTab === tab.key
                  ? 'text-violet-600 dark:text-fuchsia-400 border-violet-600 dark:border-fuchsia-400 bg-violet-50 dark:bg-violet-500/5'
                  : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
              {tab.count > 0 && (
                <span className="text-[9px] bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 px-1.5 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* ── CHAT TAB ────────────────────────────────────── */}
        {activeTab === 'chat' && (
          <div className="flex flex-col min-h-full">
            <div className="flex-1 p-4 space-y-4">
              {/* Welcome message */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="size-20 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-violet-500/30 mb-6">
                    <span className="material-symbols-outlined text-white text-4xl">neurology</span>
                  </div>
                  <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2">OpenClaw Agent Ready</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-6">
                    {isGatewayOnline
                      ? 'Your agent is connected and ready. Ask anything about destinations, safety, or trip planning.'
                      : 'Configure your OpenClaw gateway (localhost:18789) to enable live agent responses. Try the demo commands below!'}
                  </p>

                  {/* Quick Commands */}
                  <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                    {quickCommands.map((qc) => (
                      <button
                        key={qc.label}
                        onClick={() => runSkill(qc.skill, { query: qc.query, destination: qc.query }, qc.query)}
                        className="text-left px-3 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-500/5 transition-all active:scale-[0.97]"
                      >
                        {qc.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role !== 'user' && (
                    <div className="shrink-0 size-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-white text-sm">neurology</span>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white rounded-br-md shadow-lg shadow-violet-500/20'
                        : 'bg-white dark:bg-[#1c2427] border border-slate-100 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-bl-md shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content || msg.text}</p>
                    {msg.timestamp && (
                      <p className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-white/50' : 'text-slate-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="shrink-0 size-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-sm">person</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Thinking indicator */}
              {isThinking && (
                <div className="flex gap-3 justify-start">
                  <div className="shrink-0 size-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-white text-sm animate-spin">progress_activity</span>
                  </div>
                  <div className="bg-white dark:bg-[#1c2427] border border-slate-100 dark:border-white/5 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                    <div className="flex items-center gap-2 text-violet-500 text-sm">
                      <div className="flex gap-1">
                        <span className="size-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="size-1.5 bg-fuchsia-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="size-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span className="text-xs">Agent thinking…</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* ── EVENTS TAB ──────────────────────────────────── */}
        {activeTab === 'events' && (
          <div className="p-4 space-y-3">
            {agentEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-5xl mb-4">event_note</span>
                <p className="text-slate-500 dark:text-slate-400 text-sm">No agent events yet. Interact with the map or send messages to generate events.</p>
              </div>
            ) : (
              agentEvents.map((event) => (
                <div key={event.id} className="bg-white dark:bg-[#1c2427]/50 border border-slate-100 dark:border-white/5 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        event.type === 'tool_call' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : event.type === 'tool_result' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400'
                      }`}>
                        {event.type}
                      </span>
                      {event.tool && <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{event.tool}</span>}
                    </div>
                    <time className="text-xs text-slate-400">{event.time}</time>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm">{event.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TOOLS TAB ───────────────────────────────────── */}
        {activeTab === 'tools' && (
          <div className="p-4 space-y-3">
            {(tools.length > 0 ? tools : [
              { name: 'trip_analyzer', description: 'Analyzes destinations for tourist safety, cost, and sentiment scoring', type: 'skill' },
              { name: 'weather_forecast', description: 'Fetches real-time weather data for any global destination', type: 'api' },
              { name: 'local_recommender', description: 'AI-curated local food, culture, and hidden gem recommendations', type: 'skill' },
              { name: 'telegram_send', description: 'Forwards agent insights and alerts to Telegram groups', type: 'integration' },
              { name: 'itinerary_builder', description: 'Creates multi-day smart itineraries with budget optimization', type: 'skill' },
            ]).map((tool, i) => (
              <div key={tool.name || i} className="bg-white dark:bg-[#1c2427]/50 border border-slate-100 dark:border-white/5 rounded-xl overflow-hidden shadow-sm transition-all">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="size-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-violet-200 dark:border-violet-800/30">
                        <span className="material-symbols-outlined text-violet-500 dark:text-fuchsia-400 text-base">
                          {tool.type === 'api' ? 'api' : tool.type === 'integration' ? 'link' : 'memory'}
                        </span>
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white text-sm font-bold font-mono">{tool.name}</p>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-violet-500">{tool.type || 'skill'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setExpandedTool(expandedTool === tool.name ? null : tool.name);
                        setSkillInput('');
                      }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        expandedTool === tool.name
                          ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                          : 'bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {expandedTool === tool.name ? 'close' : 'play_arrow'}
                      </span>
                      {expandedTool === tool.name ? 'Close' : 'Run'}
                    </button>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">{tool.description}</p>
                </div>

                {/* Expanded: Skill Invocation Panel */}
                {expandedTool === tool.name && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">Describe what you want this skill to do:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder={tool.name === 'trip_analyzer' ? 'e.g. Analyze Paris for safety and costs'
                          : tool.name === 'weather_forecast' ? 'e.g. Weather in Tokyo next week'
                          : tool.name === 'local_recommender' ? 'e.g. Best hidden restaurants in Rome'
                          : tool.name === 'itinerary_builder' ? 'e.g. 3-day budget trip to Bali'
                          : tool.name === 'telegram_send' ? 'e.g. Send trip summary to my group'
                          : `Describe task for ${tool.name}...`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && skillInput.trim()) {
                            runSkill(tool.name, { query: skillInput.trim() }, skillInput.trim());
                            setExpandedTool(null);
                            setSkillInput('');
                            setActiveTab('chat');
                          }
                        }}
                        className="flex-1 h-10 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                      />
                      <button
                        onClick={() => {
                          if (!skillInput.trim()) return;
                          runSkill(tool.name, { query: skillInput.trim() }, skillInput.trim());
                          setExpandedTool(null);
                          setSkillInput('');
                          setActiveTab('chat');
                        }}
                        disabled={!skillInput.trim() || isThinking}
                        className="h-10 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-xs font-bold disabled:opacity-40 active:scale-95 transition-all shadow-lg shadow-violet-500/20 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">bolt</span>
                        Execute
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Bar — always visible on chat tab */}
      {activeTab === 'chat' && (
        <div className="sticky bottom-0 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 p-4 pb-8">
          <div className="flex items-end gap-2 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isGatewayOnline ? 'Message OpenClaw agent...' : 'Try a command (demo mode)...'}
                rows={1}
                className="w-full resize-none rounded-xl bg-white dark:bg-[#1c2427] border border-slate-200 dark:border-white/10 px-4 py-3 pr-12 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                style={{ minHeight: '44px', maxHeight: '120px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              className="shrink-0 size-11 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white flex items-center justify-center shadow-lg shadow-violet-500/20 disabled:opacity-40 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-lg">
                {isThinking ? 'hourglass_empty' : 'send'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
