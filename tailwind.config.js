/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bonsai: {
          dark: '#0a0d14',
          card: '#111726',
          border: '#1e293b',
          accent: '#00f0ff',
          neon: '#10b981',
          gold: '#f59e0b',
          purple: '#8b5cf6',
          rose: '#f43f5e'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
