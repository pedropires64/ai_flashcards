// theme.js
export const colors = {
    bg: '#0f172a',        // slate-900 (dark)
    bgCard: '#111827',    // gray-900
    bgLight: '#ffffff',
    bgCardLight: '#ffffff',
    text: '#e5e7eb',      // gray-200
    textMuted: '#9ca3af', // gray-400
    textDark: '#1f2937',  // gray-800
    textMutedDark: '#6b7280',
    primary: '#3b82f6',   // blue-500
    success: '#16a34a',   // green-600
    danger: '#ef4444',    // red-500
    borderDark: '#1f2937',
    borderLight: '#e5e7eb',
  };
  
  export const radius = {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
  };
  
  export const shadow = {
    card: {
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
  };
  
  export const spacing = (n) => n * 8; // 8pt scale