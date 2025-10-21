/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        weather: {
          blue: '#3b82f6',
          light: '#60a5fa',
          dark: '#1e40af',
          sky: '#0ea5e9',
          ocean: '#0284c7'
        }
      }
    },
  },
  plugins: [],
}
