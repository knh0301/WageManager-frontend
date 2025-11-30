/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: "#769fcd",
        "main-dark": "#5a7fa8",
        background: "#f7fbfc",
        red: "#f38181",
        yellow: "#fce38a",
        mint: "#95e1d3",
        brown: "#b4846c",
        green: "#27c840",
        grey: "#d9d9d9",
      },
    },
  },
  plugins: [],
}

