/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ff0000",
        dark: "#0a0a0a",
        light: "#f5f5f5",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
};
