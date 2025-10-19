import React from 'react';

/**
 * Avatar component that displays user initials in a colored circle
 * Similar to Gmail's profile avatars
 */
export default function Avatar({ name, email, size = 40, fontSize = 16 }) {
  // Get initials from name or email
  const getInitials = () => {
    if (name && name.trim()) {
      const nameParts = name.trim().split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
      }
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    
    if (email) {
      const emailName = email.split('@')[0];
      return emailName.substring(0, 2).toUpperCase();
    }
    
    return '?';
  };

  // Generate a consistent color based on email or name
  const getBackgroundColor = () => {
    const str = email || name || 'default';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Google-style color palette
    const colors = [
      '#1a73e8', // Blue
      '#e8710a', // Orange
      '#34a853', // Green
      '#ea4335', // Red
      '#9334e6', // Purple
      '#00897b', // Teal
      '#c5221f', // Dark Red
      '#188038', // Dark Green
      '#185abc', // Dark Blue
      '#7627bb', // Dark Purple
    ];
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const initials = getInitials();
  const backgroundColor = getBackgroundColor();

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${fontSize}px`,
        fontWeight: '500',
        fontFamily: "'Google Sans', 'Roboto', sans-serif",
        flexShrink: 0,
        userSelect: 'none'
      }}
      title={name || email}
      aria-label={`Avatar for ${name || email}`}
    >
      {initials}
    </div>
  );
}
