import React from 'react';

// One quiet line icon per category, used as the small mark on each
// activity's "ticket stub" card. Falls back to a generic dot if a
// content manager adds a category name we haven't mapped.

function Leaf(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M5 19c8-1 13-6 14-14C11 6 6 11 5 19Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function Lamp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M9 4h6l2 7H7l2-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10 11v3h4v-3M9 20h6M12 17v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function Runner(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="15" cy="5" r="1.8" fill="currentColor" />
      <path d="M6 20l4-5 2-3 4 2 3 5M9 12l2-4 4 1M11 8 8 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Chat(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4 6h16v10H9l-4 4V6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function Palette(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 4a8 7 0 0 0 0 14c1.2 0 1.6-1 1-1.8-.6-.7 0-1.7 1-1.7h1.5c2 0 3.5-1.6 3.5-3.5A8 7 0 0 0 12 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="13" cy="8" r="1" fill="currentColor" />
    </svg>
  );
}
function Checklist(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="5" y="4" width="14" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 9l1.5 1.5L12 8M8 15l1.5 1.5L12 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Dot(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

const MAP = {
  'Outdoor Recreation': Leaf,
  'Indoor Leisure': Lamp,
  'Fitness': Runner,
  'Social': Chat,
  'Creative': Palette,
  'Errands & Chores': Checklist,
};

export default function CategoryIcon({ name, className }) {
  const Icon = MAP[name] || Dot;
  return <Icon className={className} />;
}
