/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        verse: {
          bgStart: '#04060a',
          bgEnd: '#0a0f1d',
          card: 'rgba(13, 18, 30, 0.75)',
          purple: '#c084fc',
          indigo: '#818cf8',
          green: '#34d399',
          amber: '#fbbf24',
          red: '#f87171',
        }
      }
    },
  },
  plugins: [],
}
