import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090D16",
        surface: "#0F172A",
        card: "#131D31",
        "card-hover": "#17233B",
        border: "rgba(255, 255, 255, 0.08)",
        primary: {
          DEFAULT: "#06B6D4",
          50: "#ECFEFF",
          100: "#CFFAFE",
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
          700: "#0E7490",
        },
        emerald: {
          glow: "#10B981",
        },
        aqi: {
          good: "#10B981",      // 0-50
          moderate: "#EAB308",  // 51-100
          sensitive: "#F97316", // 101-150
          unhealthy: "#EF4444", // 151-200
          veryUnhealthy: "#A855F7", // 201-300
          hazardous: "#881337", // 301+
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.3)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
