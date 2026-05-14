import { Badge } from '../ui';

export default function EventsTab({ agentEvents }) {
  return (
    <div className="p-4 space-y-3">
      {agentEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
          <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-5xl mb-4">event_note</span>
          <p className="text-slate-500 dark:text-slate-400 text-sm">No agent events yet.</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Interact with the map to see real-time signals.</p>
        </div>
      ) : (
        agentEvents.map((event) => (
          <div key={event.id} className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl p-4 shadow-sm hover:border-violet-300/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant={
                  event.type === 'tool_call' ? 'warning'
                  : event.type === 'tool_result' ? 'success'
                  : 'primary'
                }>
                  {event.type}
                </Badge>
                {event.tool && <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">{event.tool}</span>}
              </div>
              <time className="text-xs text-slate-400 font-mono">{event.time}</time>
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">{event.content}</p>
          </div>
        ))
      )}
    </div>
  );
}

