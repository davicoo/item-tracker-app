/** @type {import('tailwindcss').Config} */
import preline from 'preline/plugin'

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [preline],
}