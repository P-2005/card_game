/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#1e293b',
          900: '#0a0f1e',
          950: '#050710',
        },
        surface: '#111827',
        gold: {
          DEFAULT: '#ffd700',
          dark: '#b8860b',
        },
        pitch: '#22c55e',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        bebas: ['"Bebas Neue"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
