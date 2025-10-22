import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        triadGold: {
          light: '#f6c84c',
          DEFAULT: '#c9972d',
          dark: '#9e6b10'
        }
      },
      fontFamily: {
        display: ['\"Montserrat\"', 'system-ui', 'sans-serif']
      },
      animation: {
        'scanlines': 'scanlines 6s linear infinite',
        'grain': 'grain 8s steps(10) infinite'
      },
      keyframes: {
        scanlines: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100%' }
        },
        grain: {
          '0%': { transform: 'translate(0,0)' },
          '10%': { transform: 'translate(-1%,1%)' },
          '20%': { transform: 'translate(1%,-1%)' },
          '30%': { transform: 'translate(-1%,1%)' },
          '40%': { transform: 'translate(1%,0)' },
          '50%': { transform: 'translate(-1%,-1%)' },
          '60%': { transform: 'translate(0,1%)' },
          '70%': { transform: 'translate(1%,-1%)' },
          '80%': { transform: 'translate(-1%,0)' },
          '90%': { transform: 'translate(1%,1%)' },
          '100%': { transform: 'translate(0,0)' }
        }
      }
    }
  },
  plugins: []
} satisfies Config;
