/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        accent: "var(--accent)",
        secondary: "var(--secondary)",
        success: "var(--success)",
        "background-light": "var(--background-light)",
        "background-dark": "var(--background-dark)",
        foreground: "var(--foreground-dark)",
        "foreground-light": "var(--foreground-light)",
        "foreground-dark": "var(--foreground-dark)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(to right, var(--primary), var(--secondary))",
        "gradient-sky": "linear-gradient(to right, var(--accent), var(--background-light))",
        "gradient-sky-dark": "linear-gradient(to right, var(--accent), var(--background-dark))",
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"]
      },
      borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
    },
  },
  plugins: [],
}

