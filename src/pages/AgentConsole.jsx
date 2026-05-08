import { useState } from 'react';
import { useOpenClaw } from '../context/OpenClawContext';
import ConsoleHeader from '../components/console/ConsoleHeader';
import ChatTab from '../components/console/ChatTab';
import EventsTab from '../components/console/EventsTab';
import ToolsTab from '../components/console/ToolsTab';
import ConsoleInput from '../components/console/ConsoleInput';

export default function AgentConsole() {
  const { 
    messages, 
    agentEvents, 
    tools, 
    isGatewayOnline, 
    wsStatus, 
    status, 
    send, 
    runSkill, 
    isThinking 
  } = useOpenClaw();
  
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-background-light dark:bg-background-dark font-display">
      <ConsoleHeader 
        wsStatus={wsStatus}
        isGatewayOnline={isGatewayOnline}
        status={status}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        agentEventsCount={agentEvents.length}
        toolsCount={tools.length || 5}
      />

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chat' && (
          <ChatTab 
            messages={messages}
            isThinking={isThinking}
            isGatewayOnline={isGatewayOnline}
            runSkill={runSkill}
          />
        )}

        {activeTab === 'events' && (
          <EventsTab agentEvents={agentEvents} />
        )}

        {activeTab === 'tools' && (
          <ToolsTab 
            tools={tools}
            runSkill={runSkill}
            isThinking={isThinking}
            setActiveTab={setActiveTab}
          />
        )}
      </div>

      {activeTab === 'chat' && (
        <ConsoleInput 
          onSend={send}
          isThinking={isThinking}
          isGatewayOnline={isGatewayOnline}
        />
      )}
    </div>
  );
}
