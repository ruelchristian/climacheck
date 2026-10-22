import React from 'react';

// Simple line-drawn weather icons, colored via currentColor so they
// inherit whatever ink color the current weather theme sets.

function Sun(props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <circle cx="32" cy="32" r="13" stroke="currentColor" strokeWidth="2.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="32" y1="9" x2="32" y2="2"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          transform={`rotate(${deg} 32 32)`}
        />
      ))}
    </svg>
  );
}

function Cloud(props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <path
        d="M20 42a10 10 0 0 1-1-19.9A13 13 0 0 1 44 21a9 9 0 0 1 1 17.9z"
        stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"
      />
    </svg>
  );
}

function Rain(props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <path
        d="M20 34a10 10 0 0 1-1-19.9A13 13 0 0 1 44 13a9 9 0 0 1 1 17.9z"
        stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"
      />
      {[24, 32, 40].map((x, i) => (
        <line key={x} x1={x} y1="42" x2={x - 4} y2="56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity={1 - i * 0.15} />
      ))}
    </svg>
  );
}

function Storm(props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <path
        d="M20 32a10 10 0 0 1-1-19.9A13 13 0 0 1 44 11a9 9 0 0 1 1 17.9z"
        stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"
      />
      <path d="M33 34 24 48h8l-4 12 14-18h-8z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function Snow(props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <path
        d="M20 32a10 10 0 0 1-1-19.9A13 13 0 0 1 44 11a9 9 0 0 1 1 17.9z"
        stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"
      />
      {[24, 32, 40].map((x) => (
        <g key={x} transform={`translate(${x} 48)`}>
          <line x1="-5" y1="0" x2="5" y2="0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="-5" x2="0" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

function Mist(props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      {[20, 28, 36, 44].map((y, i) => (
        <line key={y} x1={12 + (i % 2) * 4} y1={y} x2={52 - (i % 2) * 4} y2={y} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      ))}
    </svg>
  );
}

const ICONS = { sun: Sun, cloud: Cloud, rain: Rain, storm: Storm, snow: Snow, mist: Mist };

export default function WeatherIcon({ name, className, style }) {
  const Icon = ICONS[name] || Cloud;
  return <Icon className={className} style={style} />;
}
