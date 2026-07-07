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
          dark: '#121212',
          primary: '#E30613',   // Rojo Eurocervezas
          secondary: '#E5E5E5',
          accent: '#FFFFFF',
        }
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
