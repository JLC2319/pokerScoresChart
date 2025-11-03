/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      screens: {
        mobile: '0px',
        tablet: '800px',
        laptop: '1000px',
        desktop: '1500px',
      },
      colors: {
        black: '#282828',
        white: '#F2F2F2',
        racingGreen: '#243636',
        shutterGreen: '#2E3D37',
        limestone: '#DDCDB6',
      },
      fontFamily: {
        oswald: ['Oswald', 'sans'],
        albertSans: ['AlbertSans', 'sans'],
      },
      fontWeight: {
        extraBold: '800',
        bold: '700',
      },
      backdropFilter: {
        none: 'none',
        sm: 'blur(4px)',
        md: 'blur(8px)',
        lg: 'blur(16px)',
        xl: 'blur(24px)',
        '2xl': 'blur(40px)',
      },
      margin: {
        '-50': '-50%',
      },
      maxWidth: {
        k: '1000px',
        k5: '1500px',
      },
    },
  },
};
