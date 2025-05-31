// Modern Minimalist Theme
export const theme = {
  // Primary Colors
  primary: '#2563EB',    // Blue - Main brand color
  secondary: '#7C3AED',  // Purple - Secondary accent
  accent: '#F97316',     // Orange - Call to action, highlights
  
  // Neutral Colors
  dark: '#111827',       // Dark Gray - Primary text
  gray: '#4B5563',       // Medium Gray - Secondary text
  light: '#F3F4F6',      // Light Gray - Backgrounds
  white: '#FFFFFF',      // White
  
  // Semantic Colors
  success: '#059669',    // Green - Success states
  warning: '#D97706',    // Amber - Warning states
  error: '#DC2626',      // Red - Error states
  info: '#2563EB',       // Blue - Information states
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    secondary: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
    accent: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
  
  // Border Radius
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
  
  // Spacing
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  // Transitions
  transitions: {
    default: 'all 0.2s ease-in-out',
    fast: 'all 0.1s ease-in-out',
    slow: 'all 0.3s ease-in-out',
  },
  
  // Z-index
  zIndex: {
    base: '0',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modal: '1040',
    popover: '1050',
    tooltip: '1060',
  },
} as const;

// Type for the theme
export type Theme = typeof theme;

// Helper function to get a color with opacity
export const withOpacity = (color: string, opacity: number) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Helper function to get a gradient
export const getGradient = (gradient: keyof typeof theme.gradients) => {
  return theme.gradients[gradient];
}; 