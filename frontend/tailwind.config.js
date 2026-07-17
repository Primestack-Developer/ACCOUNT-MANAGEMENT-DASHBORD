
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cobbler: {
          bg:     '#07090e',
          s1:     '#0d1017',
          s2:     '#111620',
          s3:     '#161d2b',
          border: '#1c2436',
          text:   '#dde4ef',
          muted:  '#55657e',
          green:  '#1fd693',
          red:    '#f04f5a',
          yellow: '#f5b731',
          blue:   '#4e8fff',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body:    ['Syne', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
