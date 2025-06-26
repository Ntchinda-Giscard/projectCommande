/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}", // Keep this in case you still have an App file
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        primary: "#000000",
        secondary: "#ffffff",
        tertiary: "#f5f5f5",
      }
    },
  },
  plugins: [],
}