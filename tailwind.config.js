import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './contexts/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000', surface: '#0a0a0a',
        'surface-hover': '#111111', primary: '#ffffff',
        secondary: '#a3a3a3',
      },
      fontFamily: {
        sans: ['system-ui', 'Inter', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scan': 'scan 4s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': {opacity:'0'}, '100%': {opacity:'1'} },
        slideUp: { '0%': {opacity:'0',transform:'translateY(20px)'}, '100%': {opacity:'1',transform:'translateY(0)'} },
        scan: { '0%': {transform:'translateY(-100%)'},'100%':{transform:'translateY(100vh)'} },
      },
    },
  },
  plugins: [typography],
};
