/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['DM Serif Display', 'Georgia', 'serif'],
      },
      colors: {
        sage: {
          50: '#f4f7f4',
          100: '#e4ebe4',
          200: '#c9d7c9',
          300: '#a3b8a3',
          400: '#7a967a',
          500: '#5a7a5a',
          600: '#466146',
          700: '#394e39',
          800: '#304030',
          900: '#293529',
        },
        coral: {
          50: '#fff5f3',
          100: '#ffe8e3',
          200: '#ffd4cb',
          300: '#ffb4a6',
          400: '#ff8a73',
          500: '#f86b4f',
          600: '#e54d2e',
          700: '#c13d22',
          800: '#a03620',
          900: '#843220',
        },
        cream: {
          50: '#fdfcfa',
          100: '#f9f6f0',
          200: '#f2ebe0',
          300: '#e8dcc8',
        },
      },
    },
  },
  plugins: [],
}
