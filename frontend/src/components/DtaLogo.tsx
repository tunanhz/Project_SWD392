import React from 'react';

export default function DtaLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" /> {/* amber-400 */}
          <stop offset="40%" stopColor="#D97706" /> {/* amber-600 */}
          <stop offset="60%" stopColor="#B45309" /> {/* amber-700 */}
          <stop offset="100%" stopColor="#78350F" /> {/* amber-900 */}
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Outer elegant shield */}
      <path 
        d="M60 8 L110 32 L110 88 L60 112 L10 88 L10 32 Z" 
        stroke="url(#goldGradient)" 
        strokeWidth="3.5" 
        fill="url(#goldGradient)" 
        fillOpacity="0.05"
        filter="url(#glow)"
      />
      
      {/* Inner decorative border */}
      <path 
        d="M60 18 L98 38 L98 82 L60 102 L22 82 L22 38 Z" 
        stroke="url(#goldGradient)" 
        strokeWidth="1" 
        opacity="0.7" 
        strokeDasharray="4 4" 
      />
      
      {/* Abstract Real Estate Roof/Arrow */}
      <path 
        d="M30 65 L60 30 L90 65" 
        stroke="url(#goldGradient)" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        filter="url(#glow)"
      />
      <path 
        d="M45 65 L60 48 L75 65" 
        stroke="url(#goldGradient)" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        opacity="0.8"
      />
      
      {/* Center Line */}
      <path 
        d="M60 30 L60 102" 
        stroke="url(#goldGradient)" 
        strokeWidth="2" 
        opacity="0.4" 
      />
      
      {/* Text DTA */}
      <text 
        x="60" 
        y="90" 
        fontFamily="Georgia, serif" 
        fontSize="22" 
        fontWeight="bold" 
        fill="url(#goldGradient)" 
        textAnchor="middle" 
        letterSpacing="3"
        filter="url(#glow)"
      >
        DTA
      </text>
    </svg>
  );
}
