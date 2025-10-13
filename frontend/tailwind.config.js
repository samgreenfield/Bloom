/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: "#fffcf0",
        forest: "#3f5d3e",
        text: "#222222",
      },
      fontFamily: {
        sans: ["'Pelago Variable'", "system-ui", "sans-serif"], // body
        serif: ["'Caslon'", "serif"], // headings
      },
    },
  },
  plugins: [],
};