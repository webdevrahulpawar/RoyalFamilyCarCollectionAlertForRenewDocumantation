/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        royal: {
          bg: "#0b0a07",
          panel: "#14110c",
          panel2: "#1a1510",
          gold: "#d4af37",
          gold2: "#f6e27a",
          muted: "#b8b0a2",
          danger: "#ff5a5f",
          ok: "#2dd4bf",
        },
      },
      boxShadow: {
        royal: "0 18px 60px rgba(0,0,0,0.55)",
      },
    },
  },
  plugins: [],
};

