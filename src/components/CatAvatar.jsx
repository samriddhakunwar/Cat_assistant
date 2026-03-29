import React from 'react';

/**
 * CatAvatar Component
 * Renders an SVG cat with CSS animation classes based on the current state.
 *
 * Props:
 *  - state: 'idle' | 'typing' | 'sleeping' | 'drinking' | 'tired'
 *  - dragHandlers: { onMouseDown, onDoubleClick } from useDrag hook
 *  - isDragging: boolean — true while the user is dragging
 */
export default function CatAvatar({ state = 'idle', dragHandlers = {}, isDragging = false }) {
  return (
    <div
      className={`cat-container cat-state-${state}${isDragging ? ' cat-dragging' : ''}`}
      title="Drag to move • Double-click to reset position"
      {...dragHandlers}
    >
      <svg
        width="180"
        height="180"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="cat-body"
      >
        {/* === Ears === */}
        <path
          d="M55 75 L40 30 L80 60 Z"
          fill="#FFB088"
          stroke="#E8956A"
          strokeWidth="2"
        />
        <path
          d="M58 70 L47 40 L75 62 Z"
          fill="#FFD1B8"
        />
        <path
          d="M145 75 L160 30 L120 60 Z"
          fill="#FFB088"
          stroke="#E8956A"
          strokeWidth="2"
        />
        <path
          d="M142 70 L153 40 L125 62 Z"
          fill="#FFD1B8"
        />

        {/* === Head === */}
        <ellipse
          cx="100"
          cy="90"
          rx="55"
          ry="48"
          fill="#FFB088"
          stroke="#E8956A"
          strokeWidth="2"
        />

        {/* === Face Details === */}
        {state === 'sleeping' ? (
          /* Sleeping face - closed eyes */
          <g className="cat-eyes">
            <path d="M72 85 Q80 80 88 85" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M112 85 Q120 80 128 85" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        ) : state === 'tired' ? (
          /* Tired face - half-closed eyes */
          <g className="cat-eyes">
            <ellipse cx="80" cy="83" rx="9" ry="5" fill="white" stroke="#5D4037" strokeWidth="1.5" />
            <ellipse cx="80" cy="85" rx="5" ry="3" fill="#5D4037" />
            <ellipse cx="120" cy="83" rx="9" ry="5" fill="white" stroke="#5D4037" strokeWidth="1.5" />
            <ellipse cx="120" cy="85" rx="5" ry="3" fill="#5D4037" />
            {/* eyebags */}
            <path d="M71 90 Q80 94 89 90" stroke="#D4A594" strokeWidth="1" fill="none" opacity="0.5" />
            <path d="M111 90 Q120 94 129 90" stroke="#D4A594" strokeWidth="1" fill="none" opacity="0.5" />
          </g>
        ) : (
          /* Normal eyes */
          <g className="cat-eyes">
            <ellipse cx="80" cy="83" rx="10" ry="11" fill="white" stroke="#5D4037" strokeWidth="1.5" />
            <ellipse cx="80" cy="83" rx="6" ry="7" fill="#5D4037" />
            <ellipse cx="78" cy="80" rx="2" ry="2.5" fill="white" />
            <ellipse cx="120" cy="83" rx="10" ry="11" fill="white" stroke="#5D4037" strokeWidth="1.5" />
            <ellipse cx="120" cy="83" rx="6" ry="7" fill="#5D4037" />
            <ellipse cx="118" cy="80" rx="2" ry="2.5" fill="white" />
          </g>
        )}

        {/* === Nose === */}
        <path
          d="M97 95 L100 99 L103 95"
          fill="#FF8A9E"
          stroke="#E8707E"
          strokeWidth="1"
        />

        {/* === Mouth === */}
        {state === 'sleeping' ? (
          <g>
            <path d="M95 102 Q100 100 105 102" stroke="#E8956A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
        ) : state === 'tired' ? (
          <path d="M93 104 Q100 100 107 104" stroke="#E8956A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        ) : state === 'drinking' ? (
          <ellipse cx="100" cy="104" rx="4" ry="3" fill="#FF8A9E" stroke="#E8707E" strokeWidth="1" />
        ) : (
          <g>
            <path d="M93 102 Q97 108 100 102" stroke="#E8956A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M100 102 Q103 108 107 102" stroke="#E8956A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* === Whiskers === */}
        <g opacity="0.5">
          <line x1="55" y1="90" x2="30" y2="85" stroke="#C0956D" strokeWidth="1" />
          <line x1="55" y1="95" x2="28" y2="95" stroke="#C0956D" strokeWidth="1" />
          <line x1="55" y1="100" x2="30" y2="105" stroke="#C0956D" strokeWidth="1" />
          <line x1="145" y1="90" x2="170" y2="85" stroke="#C0956D" strokeWidth="1" />
          <line x1="145" y1="95" x2="172" y2="95" stroke="#C0956D" strokeWidth="1" />
          <line x1="145" y1="100" x2="170" y2="105" stroke="#C0956D" strokeWidth="1" />
        </g>

        {/* === Cheek blush === */}
        <ellipse cx="65" cy="97" rx="8" ry="5" fill="#FFB6C1" opacity="0.5" />
        <ellipse cx="135" cy="97" rx="8" ry="5" fill="#FFB6C1" opacity="0.5" />

        {/* === Body === */}
        <ellipse
          cx="100"
          cy="155"
          rx="45"
          ry="35"
          fill="#FFB088"
          stroke="#E8956A"
          strokeWidth="2"
        />
        {/* Belly */}
        <ellipse cx="100" cy="158" rx="28" ry="22" fill="#FFD1B8" />

        {/* === Paws === */}
        <g className="cat-paws">
          {state === 'typing' ? (
            /* Typing paws - stretched forward */
            <>
              <ellipse cx="72" cy="178" rx="14" ry="8" fill="#FFB088" stroke="#E8956A" strokeWidth="1.5" />
              <ellipse cx="128" cy="178" rx="14" ry="8" fill="#FFB088" stroke="#E8956A" strokeWidth="1.5" />
              {/* Tiny keyboard */}
              <rect x="68" y="186" rx="3" ry="3" width="64" height="10" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
              <rect x="72" y="188" width="5" height="5" rx="1" fill="#CBD5E1" />
              <rect x="80" y="188" width="5" height="5" rx="1" fill="#CBD5E1" />
              <rect x="88" y="188" width="5" height="5" rx="1" fill="#CBD5E1" />
              <rect x="96" y="188" width="5" height="5" rx="1" fill="#CBD5E1" />
              <rect x="104" y="188" width="5" height="5" rx="1" fill="#CBD5E1" />
              <rect x="112" y="188" width="12" height="5" rx="1" fill="#CBD5E1" />
            </>
          ) : (
            /* Regular paws */
            <>
              <ellipse cx="75" cy="180" rx="12" ry="8" fill="#FFB088" stroke="#E8956A" strokeWidth="1.5" />
              <ellipse cx="125" cy="180" rx="12" ry="8" fill="#FFB088" stroke="#E8956A" strokeWidth="1.5" />
            </>
          )}
        </g>

        {/* === Tail === */}
        <path
          className="cat-tail"
          d="M145 155 Q165 140 170 155 Q175 170 160 175"
          fill="none"
          stroke="#FFB088"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* === Sleep ZZZ === */}
        {state === 'sleeping' && (
          <g className="cat-zzz">
            <text x="140" y="55" fill="#7C3AED" fontSize="16" fontWeight="bold" fontFamily="Nunito">z</text>
            <text x="150" y="40" fill="#7C3AED" fontSize="20" fontWeight="bold" fontFamily="Nunito" opacity="0.7">z</text>
            <text x="162" y="25" fill="#7C3AED" fontSize="24" fontWeight="bold" fontFamily="Nunito" opacity="0.4">z</text>
          </g>
        )}

        {/* === Water bowl (for drinking state) === */}
        {state === 'drinking' && (
          <g>
            <ellipse cx="60" cy="180" rx="18" ry="5" fill="#93C5FD" stroke="#60A5FA" strokeWidth="1.5" />
            <path d="M42 180 L45 172 L75 172 L78 180" fill="#BFDBFE" stroke="#60A5FA" strokeWidth="1.5" />
            {/* Water droplet */}
            <path d="M55 168 Q57 163 59 168 Q57 171 55 168" fill="#60A5FA" opacity="0.6" />
          </g>
        )}
      </svg>
    </div>
  );
}
