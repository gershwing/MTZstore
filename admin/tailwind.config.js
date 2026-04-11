/** @type {import('tailwindcss').Config} */
export default {
  darkMode: false, // ⬅️ desactiva por completo dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3872fa",
      },
      backgroundColor: {
        primary: "#3872fa",
      },
    },
  },
  plugins: [],
}
