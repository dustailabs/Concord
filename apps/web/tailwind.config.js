/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0B1220",
        panel: "#121B2E",
        "panel-raised": "#16223A",
        border: "#26334D",
        ink: "#E8ECF1",
        muted: "#8C9AB5",
        signal: "#FFB454",
        resolved: "#5EEAD4",
        escalated: "#FF7A7A",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        blink: "blink 1.4s ease-in-out infinite",
        "fade-in": "fade-in 0.35s ease-out forwards",
      },
    },
  },
  plugins: [],
};
