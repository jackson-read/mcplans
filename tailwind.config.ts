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
        mc: {
          grass: "#5b8731",       // The top of a grass block
          dirt: "#855b32",        // The dirt underneath
          stone: "#767676",       // Stone/Cobblestone
          wood: "#a07449",        // Oak Planks
          darkWood: "#61442b",    // Spruce/Dark Oak
          diamond: "#4eedd8",     // Diamond Blue
          gold: "#fdf55f",        // Gold Ingot
          redstone: "#ff0000",    // Redstone Dust
          btn: {
            light: "#d0d1d4",     // Button highlight
            shadow: "#3a3a3a",    // Button shadow
          }
        },
      },
      fontFamily: {
        minecraft: ["var(--font-minecraft)"], 
      },
      backgroundImage: {
        'dirt-pattern': "url('/dirt.png')",
      }
    },
  },
  plugins: [],
};
export default config;