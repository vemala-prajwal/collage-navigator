/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['clamp(3rem, 5vw, 4rem)', { lineHeight: '1.05', letterSpacing: '-0.04em' }],
        'display-md': ['clamp(2.25rem, 3.5vw, 3rem)', { lineHeight: '1.08', letterSpacing: '-0.03em' }],
      },
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        'background-secondary': 'rgb(var(--color-background-secondary) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-secondary': 'rgb(var(--color-surface-secondary) / <alpha-value>)',
        'surface-elevated': 'rgb(var(--color-surface-elevated) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        'foreground-muted': 'rgb(var(--color-foreground-muted) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'accent-strong': 'rgb(var(--color-accent-strong) / <alpha-value>)',
        'accent-muted': 'rgb(var(--color-accent-muted) / <alpha-value>)',
        'on-accent': 'rgb(var(--color-on-accent) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        'success-muted': 'rgb(var(--color-success-muted) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        'warning-muted': 'rgb(var(--color-warning-muted) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
        'error-muted': 'rgb(var(--color-error-muted) / <alpha-value>)',
        glass: 'rgb(var(--color-glass) / <alpha-value>)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        elevated: 'var(--shadow-elevated)',
        card: 'var(--shadow-card)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      transitionDuration: {
        DEFAULT: '250ms',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      letterSpacing: {
        tight: '-0.02em',
      },
      backgroundImage: {
        'hero-gradient': 'var(--gradient-hero)',
        'hero-mesh': 'var(--gradient-hero-mesh)',
      },
    },
  },
  plugins: [],
};
