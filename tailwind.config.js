/** @type {import('tailwindcss').Config} */
import preline from 'preline/plugin'
import daisyui from 'daisyui'
import plugin from 'tailwindcss/plugin'
import { shade, components as tailusComponents, rounded, animations, palettes, palette } from '@tailus/themer'

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './src/assets/**/*.css',
    './node_modules/@tailus/themer/dist/**/*.{js,ts}'
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', 'sans-serif']
    },
    extend: {
      colors: palettes.trust,
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
    shade,
    rounded,
    tailusComponents,
    animations,
    palette,
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
