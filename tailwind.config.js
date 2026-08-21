/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'var(--bg)',
          2: 'var(--bg-2)',
          3: 'var(--bg-3)',
          4: 'var(--bg-4)',
        },
        gold: {
          DEFAULT: 'var(--gold)',
          2: 'var(--gold-2)',
          dim: 'var(--gold-dim)',
        },
        teal: 'var(--teal)',
        green: 'var(--green)',
        red: 'var(--red)',
        orange: 'var(--orange)',
        text: {
          DEFAULT: 'var(--text)',
          muted: 'var(--text-muted)',
          faint: 'var(--text-faint)',
        },
        border: {
          DEFAULT: 'var(--border)',
          2: 'var(--border-2)',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        playfair: ['"Playfair Display"', 'serif'],
        plex: ['"Space Grotesk"', 'sans-serif'],
        dm: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        gold: 'var(--shadow-gold)',
        active: 'var(--shadow-active)',
      },
    },
  },
  plugins: [],
}
