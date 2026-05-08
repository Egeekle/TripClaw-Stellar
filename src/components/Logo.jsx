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
          <linearGradient id="tripclawGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Claw Frame - Left */}
        <path 
          d="M25 20 C15 35 15 65 25 80 L35 75 C30 65 30 35 35 25 Z" 
          fill="url(#tripclawGradient)" 
          fillOpacity="0.2"
          stroke="url(#tripclawGradient)"
          strokeWidth="2"
        />
        
        {/* Outer Claw Frame - Right */}
        <path 
          d="M75 20 C85 35 85 65 75 80 L65 75 C70 65 70 35 65 25 Z" 
          fill="url(#tripclawGradient)" 
          fillOpacity="0.2"
          stroke="url(#tripclawGradient)"
          strokeWidth="2"
        />

        {/* Central Explorer Shield */}
        <path 
          d="M50 15 L80 25 V55 C80 75 50 85 50 85 C50 85 20 75 20 55 V25 L50 15 Z" 
          fill="#0f172a"
          stroke="url(#tripclawGradient)"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Compass Star / Waypoint */}
        <path 
          d="M50 30 L55 45 L70 50 L55 55 L50 70 L45 55 L30 50 L45 45 Z" 
          fill="url(#tripclawGradient)"
          filter="url(#glow)"
        />
        <circle cx="50" cy="50" r="3" fill="white" />
        
        {/* Futuristic Accents */}
        <path d="M30 35 H40" stroke="white" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M60 35 H70" stroke="white" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M40 75 L60 75" stroke="url(#tripclawGradient)" strokeWidth="1" strokeOpacity="0.8" />
      </svg>
      
      {showText && (
        <span className={`font-black tracking-tighter uppercase italic ${textClassName} bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(167,139,250,0.3)]`}>
          TripClaw
        </span>
      )}
    </div>
  );
}

