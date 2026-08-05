module.exports = {
  darkMode: "media",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        tertiary: "var(--color-tertiary)",
        foregroundCustom: "var(--color-foreground)",
        baseCustom: "var(--color-base)",
      },

      keyframes: {
        flipX: {
          "0%, 100%": {
            transform: "rotateX(0deg)",
          },
          "50%": {
            transform: "rotateX(180deg)",
          },
        },
      },

      animation: {
        flipX: "flipX 6s ease-in-out infinite",
      },

      screens: {
        md1: "865px",
      },
    },
  },
  plugins: [],
};