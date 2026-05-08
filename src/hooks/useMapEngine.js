import { useState, useEffect, useRef } from 'react';
import { DEMO_AGENTS, AGENT_DIALOGUES } from '../config/mapData';
import { discoveryEngine } from '../services/discoveryService';
import { STORAGE_KEYS } from '../config/constants';

export function useMapEngine() {
  const [agents, setAgents] = useState(DEMO_AGENTS);
  const [interactions, setInteractions] = useState({});
  const [activeDiscovery, setActiveDiscovery] = useState(null);
  const agentsRef = useRef(agents);

  // 1. Agent Wandering Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) => {
        const next = prev.map((agent) => ({
          ...agent,
          lat: Math.max(-18, Math.min(0, agent.lat + (Math.random() - 0.5) * 0.5)),
          lng: Math.max(-81, Math.min(-68, agent.lng + (Math.random() - 0.5) * 0.5)),
          sentiment: Math.max(30, Math.min(100, agent.sentiment + (Math.random() - 0.48) * 5)),
        }));
        agentsRef.current = next;
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 2. Agent Dialogue Logic
  useEffect(() => {
    const interval = setInterval(() => {
      const currentAgents = agentsRef.current;
      const randomAgent = currentAgents[Math.floor(Math.random() * currentAgents.length)];
      if (!randomAgent) return;
      const message = AGENT_DIALOGUES[Math.floor(Math.random() * AGENT_DIALOGUES.length)];
      
      setInteractions((prev) => ({ ...prev, [randomAgent.id]: message }));
      setTimeout(() => {
        setInteractions((prev) => {
          const next = { ...prev };
          delete next[randomAgent.id];
          return next;
        });
      }, 4000);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // 3. Discovery Engine Polling
  useEffect(() => {
    const checkEnvironment = async () => {
      if (activeDiscovery) return;
      
      const profile = JSON.parse(localStorage.getItem(STORAGE_KEYS.IDENTITY) || '{}');
      const mockEnv = { time: 'night', weather: 'clear', crowdDensity: 'low' };
      
      const discovery = await discoveryEngine.evaluateLocation(null, profile, mockEnv);
      if (discovery) {
        setActiveDiscovery(discovery);
      }
    };

    const interval = setInterval(checkEnvironment, 15000);
    return () => clearInterval(interval);
  }, [activeDiscovery]);

  return {
    agents,
    interactions,
    activeDiscovery,
    setActiveDiscovery,
    setInteractions
  };
}
