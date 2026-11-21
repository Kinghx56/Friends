/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Dashboard and shared components that live outside frontend/src
    "../../dashboards/**/*.{js,ts,jsx,tsx}",
    "../dashboards/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Stone text colours used in dashboard pages
    { pattern: /^text-stone-(400|500|600|700|800|900)$/ },
    // Orange palette
    { pattern: /^(text|bg|border)-orange-(50|100|200|300|400|500|600|700)$/ },
    // Amber palette
    { pattern: /^(text|bg|border)-amber-(50|100|200|300|400|500|600|700)$/ },
    // Emerald palette
    { pattern: /^(text|bg|border)-emerald-(50|100|200|300|400|500|600|700)$/ },
    // Red palette
    { pattern: /^(text|bg|border)-red-(50|100|200|300|400|500|600|700)$/ },
    // White text (gradient headers)
    'text-white',
    // Fill utilities for star icons
    'fill-amber-400',
    // Animate
    'animate-spin', 'animate-pulse',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // ── Saarthi premium site palette (scoped; used only by site components) ──
        site: {
          black: "#F6F1E7",
          graphite: "#EFE8DA",
          surface: "#FFFFFF",
          line: "#DDD3BF",
          orange: "#B23A0A",
          amber: "#FF8A3D",
          paper: "#EFEAE2",
          text: "#1B1A17",
          muted: "#6F6A5C",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      transitionDuration: {
        roll: "340ms",
      },
      transitionTimingFunction: {
        roll: "cubic-bezier(0.76,0,0.24,1)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "site-marquee": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "site-marquee": "site-marquee 28s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
