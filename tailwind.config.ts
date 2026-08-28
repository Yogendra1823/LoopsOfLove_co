import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ivory: '#FAF7F2',
          cream: '#FAF4E8',
          sand: '#E8DEC9',
          border: '#F4EFE6',
          rose: '#C86D51',
          roseHover: '#B0583E',
          sage: '#7A8B7B',
          sageLight: '#E8EFE8',
          charcoal: '#1A1A1A',
          gold: '#DAAF87',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
