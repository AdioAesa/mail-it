/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm cream/ivory base
        cream: {
          50: '#FFFDF8',
          100: '#FDF9F0',
          200: '#FAF3E3',
          300: '#F5EBD3',
          400: '#EDE0C0',
          500: '#E3D3AA',
        },
        // Deep burgundy/wine - primary action color
        burgundy: {
          50: '#FDF2F4',
          100: '#FCE7EB',
          200: '#F9D0D9',
          300: '#F4A9BA',
          400: '#EC7794',
          500: '#DC4C6E',
          600: '#B8324F',
          700: '#9A2640',
          800: '#81223A',
          900: '#6E2036',
        },
        // Postal blue - secondary accent
        postal: {
          50: '#F0F5FA',
          100: '#E1EBF5',
          200: '#C3D7EB',
          300: '#9BBCDC',
          400: '#6B9AC8',
          500: '#4A7BB1',
          600: '#3A6395',
          700: '#30507A',
          800: '#2B4465',
          900: '#283B55',
        },
        // Warm gold accents
        gold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#D4A012',
          600: '#B8860B',
          700: '#92400E',
          800: '#78350F',
          900: '#451A03',
        },
        // Warm paper tones
        paper: {
          white: '#FEFDFB',
          aged: '#F7F3EB',
          vintage: '#EDE4D3',
          kraft: '#C9B896',
        },
        // Ink colors
        ink: {
          black: '#1C1917',
          dark: '#292524',
          medium: '#44403C',
          light: '#78716C',
          faded: '#A8A29E',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        script: ['Caveat', 'cursive'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(28, 25, 23, 0.06)',
        'soft-lg': '0 4px 16px rgba(28, 25, 23, 0.08)',
        'paper': '0 1px 3px rgba(28, 25, 23, 0.08), 0 4px 12px rgba(28, 25, 23, 0.04)',
        'card': '0 2px 4px rgba(28, 25, 23, 0.04), 0 8px 24px rgba(28, 25, 23, 0.08)',
        'stamp': '2px 2px 0 rgba(28, 25, 23, 0.15)',
        'wax': '0 4px 8px rgba(184, 50, 79, 0.25), inset 0 -2px 4px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'paper-texture': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        'postal-stripe': 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(184, 50, 79, 0.05) 10px, rgba(184, 50, 79, 0.05) 20px)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'stamp': 'stamp 0.4s ease-out forwards',
        'unfold': 'unfold 0.6s ease-out forwards',
        'write': 'write 2s ease-out forwards',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'fade-up-delay-1': 'fadeUp 0.5s ease-out 0.1s forwards',
        'fade-up-delay-2': 'fadeUp 0.5s ease-out 0.2s forwards',
        'fade-up-delay-3': 'fadeUp 0.5s ease-out 0.3s forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        stamp: {
          '0%': { transform: 'scale(1.5) rotate(-5deg)', opacity: '0' },
          '50%': { transform: 'scale(0.95) rotate(2deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        unfold: {
          '0%': { transform: 'rotateX(-90deg)', opacity: '0', transformOrigin: 'top' },
          '100%': { transform: 'rotateX(0deg)', opacity: '1', transformOrigin: 'top' },
        },
        write: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        fadeUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      borderRadius: {
        'stamp': '2px',
      },
    },
  },
  plugins: [],
}
