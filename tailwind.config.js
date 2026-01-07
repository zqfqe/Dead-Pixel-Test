import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./data/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#0a0a0a', 
        'surface-hover': '#111111',
        primary: '#ffffff', 
        secondary: '#a3a3a3',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scan': 'scan 4s linear infinite',
        'scan-slow': 'scanSlow 8s linear infinite', // Added for TestIntro
        'scroll-vertical': 'scrollVertical 20s linear infinite',
        'scroll-horizontal': 'scrollHorizontal 20s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        scanSlow: {
          '0%': { transform: 'translate3d(0, -100%, 0)' },
          '100%': { transform: 'translate3d(0, 100vh, 0)' },
        },
        scrollVertical: {
          '0%': { transform: 'translateY(50%)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        scrollHorizontal: {
          '0%': { transform: 'translateX(50%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [
    typography,
  ],
}