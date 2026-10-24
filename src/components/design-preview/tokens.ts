/**
 * DOKIND DESIGN STUDIO — SHARED DESIGN TOKENS
 * 
 * Centralized design variables for Rocket.new Visual Edit mode.
 * Easily adjust colors, typography scales, spacing, and borders here
 * or visually via class editing.
 */

export const DESIGN_TOKENS = {
  colors: {
    // Primary Brand Accents
    brandRed: '#EF4949', // dokind signature coral-red (dot of the i)
    brandRedHover: '#D93838',
    brandRedLight: '#FFF0EF',
    brandRedBorder: '#FEE2E2',

    // Neutrals
    backgroundWarm: '#FAF9F6', // Warm off-white
    surfaceWhite: '#FFFFFF',
    textPrimary: '#202124',   // Deep charcoal
    textSecondary: '#555B63', // Slate charcoal
    textMuted: '#8A909A',
    borderLight: '#E8E6E1',
    borderMedium: '#D5D1C8',

    // Contrast Accent Panels
    darkPanel: '#202124',
    darkPanelBorder: '#2E3035',

    // Status Accents
    successGreen: '#25845B',
    successGreenLight: '#EDF7F2',
    accentBlue: '#2563EB',
    accentBlueLight: '#EFF6FF',
    accentAmber: '#D97706',
    accentAmberLight: '#FFFBEB',
  },

  typography: {
    fontSans: 'var(--font-geist-sans), sans-serif',
    fontMono: 'var(--font-geist-mono), monospace',
  },

  radii: {
    badge: '9999px',
    button: '0.75rem',  // 12px
    card: '1.25rem',    // 20px
    section: '1.75rem', // 28px
  },

  spacing: {
    containerMaxWidth: 'max-w-7xl',
    sectionPaddingY: 'py-20',
    sectionPaddingX: 'px-4 sm:px-6 lg:px-8',
  },
} as const;
