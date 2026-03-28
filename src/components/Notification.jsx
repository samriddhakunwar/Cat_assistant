import React from 'react';

/**
 * Notification Component
 * Displays a cute bubble notification above the cat avatar.
 *
 * Props:
 *  - message: text to display
 *  - type: 'water' | 'rest' — affects the icon
 *  - onDismiss: callback when clicking dismiss
 *  - onTakeBreak: optional callback for rest reminders
 */
export default function Notification({ message, type = 'water', onDismiss, onTakeBreak }) {
  return (
    <div className="notification-bubble" id={`notification-${type}`}>
      <div className="flex flex-col items-center gap-2">
        {/* Icon */}
        <span className="text-2xl">
          {type === 'water' ? '💧' : '🧘'}
        </span>

        {/* Message */}
        <p className="text-center leading-tight">{message}</p>

        {/* Action buttons */}
        <div className="flex gap-2 mt-1">
          {onTakeBreak && (
            <button
              onClick={onTakeBreak}
              className="px-3 py-1 bg-gradient-to-r from-violet-400 to-pink-400 text-white text-xs font-bold rounded-full hover:scale-105 transition-transform"
              id="btn-take-break"
            >
              Take a break ✨
            </button>
          )}
          <button
            onClick={onDismiss}
            className="px-3 py-1 bg-white/60 text-gray-600 text-xs font-semibold rounded-full hover:bg-white/80 transition-colors"
            id="btn-dismiss"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
