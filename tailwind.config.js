/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3AB795",
        secondary: "#16342F",
        warning: "#F7934C",
        light: "#F6F6EB",
      },
      fontFamily: {
        sans: ["Poppins", "Noto Sans TC", "sans-serif"],
      },
    },
  },
  plugins: [],
};
