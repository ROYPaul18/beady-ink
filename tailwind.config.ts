// tailwind.config.js

import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './ui/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        green: '#454C22',
        red: '#9B2D30',
        beige: '#E8E3D4',
        lightblue: '#CBD4DD',
        purpleclair: '#5D4948',
        marron: '#1D0002',
      },
      backgroundImage: {
        'feuille': "url('/img/bg-feuille.jpg')",
        'tatouage': "url('/img/13.png')",
        'flash-tattoo': "url('/img/13.png')",
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
