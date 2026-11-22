/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        minecraft: {
          50: '#f7f5f3',
          100: '#ede7e0',
          200: '#d8cdc1',
          300: '#bfa898',
          400: '#a08670',
          500: '#8b6f56',
          600: '#7a5e4a',
          700: '#654e40',
          800: '#524237',
          900: '#46392f',
          950: '#241e18',
        },
        grass: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        stone: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        dirt: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fad7ac',
          300: '#f6ba77',
          400: '#f1934a',
          500: '#ed7424',
          600: '#de5a1a',
          700: '#b84518',
          800: '#93381c',
          900: '#76301a',
          950: '#40160c',
        }
      },
      fontFamily: {
        'minecraft': ['Courier New', 'monospace'],
      },
      boxShadow: {
        'minecraft': '4px 4px 0px 0px rgba(0, 0, 0, 0.3)',
        'minecraft-hover': '6px 6px 0px 0px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'bounce-subtle': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      }
    },
  },
  plugins: [],
};