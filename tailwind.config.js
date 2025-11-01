/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6B46C1',
        secondary: '#553C9A',
        accent: '#B794F4',
        background: '#1A202C',
        text: '#E2E8F0',
        card: '#2D3748',
        border: '#4A5568',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(to right, #553C9A, #B794F4)',
      },
    },
  },
  plugins: [],
}