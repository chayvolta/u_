/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        euro: {
          dark: '#1A1A1A',
          primary: '#E6A11D',   // Cerveza dorada
          secondary: '#D9D9D9',
          accent: '#005f73',
        }
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
