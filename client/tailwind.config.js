/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#09090b', // Deep zinc
        surface: '#09090b',
        canvas: '#09090b',
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.03)',
          hover: 'rgba(255, 255, 255, 0.06)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        primary: {
          DEFAULT: '#FAFAFA',
          muted: '#A1A1AA', // zinc-400
        },
        accent: {
          purple: '#7C3AED',  // Excitement Purple
          purpleLight: '#A78BFA',
          orange: '#F97316',  // Action Orange
          cyan: '#00E5FF',    // Kept minimally for backward compatibility if needed
          emerald: '#10B981',
          rose: '#FF2A5F',    
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        display: ['"Satoshi"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px -4px rgba(0, 0, 0, 0.5)',
        bento: 'inset 0 0 0 1px rgba(255, 255, 255, 0.08), 0 4px 20px -2px rgba(0,0,0,0.4)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
}
