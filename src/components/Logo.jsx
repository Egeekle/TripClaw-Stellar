import React from 'react';

export default function Logo({ className = "w-10 h-10" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="tripclawGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" /> {/* violet-500 */}
          <stop offset="100%" stopColor="#d946ef" /> {/* fuchsia-500 */}
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background cyber hexagon/shield */}
      <path 
        d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" 
        fill="url(#tripclawGradient)" 
        fillOpacity="0.1" 
        stroke="url(#tripclawGradient)" 
        strokeWidth="4" 
        strokeLinejoin="round" 
      />

      {/* Inner sharp claw marks - futuristic */}
      <path 
        d="M35 30 L45 75 L55 55" 
        stroke="url(#tripclawGradient)" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter="url(#glow)"
      />
      <path 
        d="M65 30 L55 75 L45 55" 
        stroke="white" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter="url(#glow)"
      />

      {/* Cyber eye / Waypoint center dot */}
      <circle cx="50" cy="40" r="6" fill="#fff" filter="url(#glow)" />
    </svg>
  );
}
