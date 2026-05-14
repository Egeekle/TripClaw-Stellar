import { useState } from 'react';

const DEFAULT_TOOLS = [
  { name: 'trip_analyzer', description: 'Analyzes destinations for tourist safety, cost, and sentiment scoring', type: 'skill' },
  { name: 'weather_forecast', description: 'Fetches real-time weather data for any global destination', type: 'api' },
  { name: 'local_recommender', description: 'AI-curated local food, culture, and hidden gem recommendations', type: 'skill' },
  { name: 'telegram_send', description: 'Forwards agent insights and alerts to Telegram groups', type: 'integration' },
  { name: 'itinerary_builder', description: 'Creates multi-day smart itineraries with budget optimization', type: 'skill' },
];

export default function ToolsTab({ tools, runSkill, isThinking, setActiveTab }) {
  const [expandedTool, setExpandedTool] = useState(null);
  const [skillInput, setSkillInput] = useState('');

  const displayTools = tools.length > 0 ? tools : DEFAULT_TOOLS;

  const handleExecute = (toolName) => {
    if (!skillInput.trim()) return;
    runSkill(toolName, { query: skillInput.trim() }, skillInput.trim());
    setExpandedTool(null);
    setSkillInput('');
    setActiveTab('chat');
  };

  return (
    <div className="p-4 space-y-3">
      {displayTools.map((tool, i) => (
        <div key={tool.name || i} className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
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

          {expandedTool === tool.name && (
            <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">Configure Skill Execution:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="What should the agent do?"
                  onKeyDown={(e) => e.key === 'Enter' && handleExecute(tool.name)}
                  className="flex-1 h-10 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                />
                <button
                  onClick={() => handleExecute(tool.name)}
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
  );
}
