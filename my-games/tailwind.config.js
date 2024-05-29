/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      flexBasis: {
        '1/3': '30.333333%',
      }
    },
  },
  plugins: [
    
  ],
}