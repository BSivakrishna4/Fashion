/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0a0a0a', // Black for primary actions/text
        secondary: '#F5F5DC', // Natural cream/beige for background
        accent: '#2a2a2a', // Dark grey for hover states
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        brand: ['Syne', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
