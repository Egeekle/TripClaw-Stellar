import React from 'react';

export default function Logo({ className = "w-10 h-10", showText = false, textClassName = "text-xl" }) {
  return (
    <div className={`flex items-center gap-3 ${className.includes('w-full') ? 'flex-col' : ''}`}>
      <svg 
        className={className} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="aquisitoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--secondary)" />
          </linearGradient>
          <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Map Pin Outer Shape */}
        <path 
          d="M50 10 C28 10 10 28 10 50 C10 74 42 92 47 95.3 C48.8 96.5 51.2 96.5 53 95.3 C58 92 90 74 90 50 C90 28 72 10 50 10 Z" 
          fill="url(#aquisitoGradient)" 
          fillOpacity="0.1"
          stroke="url(#aquisitoGradient)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        
        {/* Inner Map Grid Accents */}
        <path 
          d="M20 50 H80" 
          stroke="url(#aquisitoGradient)" 
          strokeWidth="1.5" 
          strokeOpacity="0.3" 
          strokeDasharray="2,2"
        />
        <path 
          d="M50 20 V80" 
          stroke="url(#aquisitoGradient)" 
          strokeWidth="1.5" 
          strokeOpacity="0.3" 
          strokeDasharray="2,2"
        />

        {/* Central Core Circle */}
        <circle 
          cx="50" 
          cy="48" 
          r="20" 
          fill="#1b1715" 
          stroke="url(#aquisitoGradient)" 
          strokeWidth="2.5"
        />

        {/* Sparkles / Compass Star inside the pin */}
        <path 
          d="M50 34 L53.5 44.5 L64 48 L53.5 51.5 L50 62 L46.5 51.5 L36 48 L46.5 44.5 Z" 
          fill="url(#aquisitoGradient)"
          filter="url(#logoGlow)"
        />
        
        {/* Center shining core */}
        <circle cx="50" cy="48" r="3.5" fill="white" />
      </svg>
      
      {showText && (
        <span className={`font-black tracking-tighter uppercase italic ${textClassName} bg-gradient-primary bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(214,83,53,0.2)]`}>
          Aquisito
        </span>
      )}
    </div>
  );
}


