/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        epilogue: ['Epilogue', 'sans-serif'],
      },
      boxShadow: {
        secondary: '10px 10px 20px rgba(2, 2, 2, 0.25)',
      },
      colors: {
        'primary': 'var(--primary)',
        'secondary': 'var(--secondary)',
        'text': 'var(--text)',
        'subtext': 'var(--subtext)',
        'accent': 'var(--accent)',
        'background': 'var(--background)',
        'card': 'var(--card)',
        'border': 'var(--border)',
      },
      backgroundColor: {
        'theme-primary': 'var(--primary)',
        'theme-secondary': 'var(--secondary)',
        'theme-background': 'var(--background)',
        'theme-card': 'var(--card)',
      },
      textColor: {
        'theme-text': 'var(--text)',
        'theme-subtext': 'var(--subtext)',
        'theme-accent': 'var(--accent)',
      },
      borderColor: {
        'theme-border': 'var(--border)',
      },
    },
  },
  plugins: [],
}