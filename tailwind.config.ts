import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111313",
        paper: "#eef1f2",
        line: "#d7dddf",
        muted: "#66706d",
        success: "#168454",
        warning: "#a86605",
        danger: "#b42318",
        steel: "#25302f",
        signal: "#0e9f6e",
        cyanline: "#2f8f9d"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(17, 19, 19, 0.10)",
        lift: "0 24px 70px rgba(17, 19, 19, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
