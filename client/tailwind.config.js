/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17202a',
        cream: '#f5f2ea',
        rust: '#b64a2b',
        sage: '#4b6655',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Georgia', 'Cambria', 'serif'],
      },
      boxShadow: {
        card: '0 12px 35px rgba(23, 32, 42, 0.08)',
      },
    },
  },
  plugins: [],
};

