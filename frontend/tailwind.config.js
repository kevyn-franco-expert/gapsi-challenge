/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#e9202f",
        "primary-hover": "#c91a28",
        dark: "#2e2e2e",
        darker: "#000000",
        success: "#166534",
        danger: "#991b1b",
        destructive: "#ef4444",
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', "Helvetica", "Arial", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
}
