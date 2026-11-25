import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F3ED",
        "paper-2": "#FBF9F4",
        "paper-3": "#EEE9DF",
        ink: "#171713",
        "ink-2": "#3B3A33",
        muted: "#6E6A5E",
        line: "#D9D3C5",
        "line-strong": "#BFB8A7",
        vermilion: "#B23A1E",
        "vermilion-soft": "#F1DCD3",
        petrol: "#14524A",
        "petrol-soft": "#DCE9E4",
        brass: "#9A7527",
        "brass-soft": "#F0E6CB",
        slate: "#3D4A55",
        laser: "#C43B2A"
      },
      fontFamily: {
        display: ["var(--font-display)", "Iowan Old Style", "Palatino Linotype", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "SFMono-Regular", "Consolas", "monospace"]
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1.1", letterSpacing: "0.08em" }],
        "3xs": ["0.625rem", { lineHeight: "1.1", letterSpacing: "0.1em" }]
      },
      letterSpacing: {
        label: "0.14em",
        wide2: "0.06em"
      },
      maxWidth: {
        page: "1440px",
        prose: "68ch",
        measure: "62ch"
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 0.61, 0.36, 1)"
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-up": "fade-up 600ms cubic-bezier(0.22,0.61,0.36,1) both"
      }
    }
  },
  plugins: []
};

export default config;
