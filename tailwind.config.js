/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        // Instrument Serif покрывает латиницу (точно по спеке),
        // Cormorant Garamond подхватывает кириллицу пофразовым фолбэком.
        display: ["'Instrument Serif'", "'Cormorant Garamond'", 'serif'],
      },
      colors: {
        bg: 'hsl(var(--bg))',
        surface: 'hsl(var(--surface))',
        'text-primary': 'hsl(var(--text))',
        muted: 'hsl(var(--muted))',
        stroke: 'hsl(var(--stroke))',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
