import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        duo: {
          green: "#58CC02",
          "green-dark": "#46A302",
          blue: "#1CB0F6",
          "blue-dark": "#1899D6",
          red: "#FF4B4B",
          "red-dark": "#EA2B2B",
          yellow: "#FFC800",
          purple: "#CE82FF",
          orange: "#FF9600",
          gray: "#E5E5E5",
          "gray-dark": "#AFAFAF",
          feather: "#777777",
          sky: "#235390",
          path: "#204482",
        },
      },
      boxShadow: {
        duo: "0 4px 0 0 rgba(0,0,0,0.2)",
        "duo-green": "0 4px 0 0 #46A302",
        "duo-blue": "0 4px 0 0 #1899D6",
        "duo-red": "0 4px 0 0 #EA2B2B",
        "duo-gray": "0 4px 0 0 #AFAFAF",
      },
      fontFamily: {
        duo: ["var(--font-nunito)", "Nunito", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
