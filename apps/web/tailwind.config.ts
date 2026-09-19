import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'var(--color-surface)',
        'surface-low': 'var(--color-surface-container-low)',
        'surface-mid': 'var(--color-surface-container)',
        'surface-high': 'var(--color-surface-container-high)',
        'surface-bright': 'var(--color-surface-bright)',
        primary: 'var(--color-primary)',
        'on-primary': 'var(--color-on-primary)',
        'primary-container': 'var(--color-primary-container)',
        'on-primary-container': 'var(--color-on-primary-container)',
        secondary: 'var(--color-secondary)',
        'on-surface': 'var(--color-on-surface)',
        'on-surface-variant': 'var(--color-on-surface-variant)',
        error: 'var(--color-error)',
        outline: 'var(--color-outline)',
        'outline-variant': 'var(--color-outline-variant)',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        hanken: ['Hanken Grotesk', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}

export default config
