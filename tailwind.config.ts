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
        bg: {
          primary: "#FAF8F5",
          secondary: "#F3F0EB",
          card: "#FFFFFF",
        },
        text: {
          primary: "#1A1A1A",
          secondary: "#6B6560",
          muted: "#9C9790",
        },
        accent: {
          DEFAULT: "#8B7355",
          hover: "#6D5A43",
        },
        border: {
          DEFAULT: "#E8E4DE",
          hover: "#D4CFC7",
        },
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      maxWidth: {
        "8xl": "1280px",
        "9xl": "1440px",
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "2px",
        md: "4px",
        lg: "8px",
      },
      boxShadow: {
        subtle: "0 2px 8px rgba(0, 0, 0, 0.04)",
        card: "0 1px 3px rgba(0, 0, 0, 0.05)",
      },
      transitionDuration: {
        150: "150ms",
        200: "200ms",
        400: "400ms",
      },
    },
  },
  plugins: [],
};

export default config;
