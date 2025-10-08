/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {}
  },
  plugins: []
};

module.exports = {
  theme: {
    extend: {
      colors: {
        red: {
          600: '#d32f2f',
          700: '#b71c1c',
        },
        gray: {
          100: '#f5f5f5',
          200: '#e0e0e0',
          300: '#cccccc',
        }
      }
    }
  }
}