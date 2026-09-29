/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fbf4',
          100: '#dbf5e3',
          200: '#b8eaca',
          300: '#86d8a7',
          400: '#4fbd7d',
          500: '#2aa25e',
          600: '#1c8a4c',
          700: '#186f3f',
          800: '#155835',
          900: '#12482c',
          950: '#082818',
        },
        ink: {
          900: '#0f172a',
          700: '#334155',
          500: '#64748b',
          300: '#cbd5e1',
        },
      },
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 6px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};
