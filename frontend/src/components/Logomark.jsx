import React from 'react';

export default function Logomark({ className }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className}>
      <circle cx="17" cy="15" r="7" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M10 27a7 6.2 0 0 1-.8-12.4A9.4 9.4 0 0 1 27 13a6.4 6.4 0 0 1 .7 12.7z"
        fill="currentColor" opacity="0.14"
      />
      <path
        d="M10 27a7 6.2 0 0 1-.8-12.4A9.4 9.4 0 0 1 27 13a6.4 6.4 0 0 1 .7 12.7z"
        stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"
      />
    </svg>
  );
}
