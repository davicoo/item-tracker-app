/** @type {import('tailwindcss').Config} */
import preline from 'preline/plugin'
import daisyui from 'daisyui'
import plugin from 'tailwindcss/plugin'

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './src/assets/**/*.css'
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', 'sans-serif']
    },
    extend: {
      spacing: {
        10.5: '2.625rem',
        160: '40rem'
      },
      width: {
        160: '40rem'
      }
    }
  },
  plugins: [
    preline,
    daisyui,
    plugin(function({ addUtilities }) {
      addUtilities({
        '.outline-hidden': { outline: '0' }
      })
    })
  ],
  daisyui: {
    themes: ['cupcake', 'dark']
  }
}
