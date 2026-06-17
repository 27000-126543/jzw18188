/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        navy: {
          50: "#f0f4fa",
          100: "#dce6f4",
          200: "#bccce8",
          300: "#8ea8d8",
          400: "#5a7dc3",
          500: "#3a5faa",
          600: "#2a4a8e",
          700: "#243c73",
          800: "#0F2747",
          900: "#0a1a2f",
          950: "#061020",
        },
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#2563EB",
          600: "#1d4ed8",
          700: "#1e40af",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        cooling: "#8B5CF6",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        display: [
          "'Plus Jakarta Sans'",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 39, 71, 0.06), 0 1px 3px rgba(15, 39, 71, 0.1)",
        "card-hover":
          "0 4px 8px rgba(15, 39, 71, 0.08), 0 8px 24px rgba(15, 39, 71, 0.12)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
