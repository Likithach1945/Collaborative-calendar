import React from 'react';
import './NotificationBadge.css';

/**
 * Notification badge component to display count of pending items
 * @param {number} count - Number of notifications
 * @param {string} variant - 'pending' | 'error' | 'warning' (default: 'pending')
 */
export default function NotificationBadge({ count = 0, variant = 'pending' }) {
  if (count <= 0) {
    return null;
  }

  const displayCount = count > 99 ? '99+' : count;

  return (
    <div className={`notification-badge notification-${variant}`}>
      {displayCount}
    </div>
  );
}
