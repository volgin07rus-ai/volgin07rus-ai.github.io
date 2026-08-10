/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Монохром плюс единственный акцент — больше цветов система не знает */
        ember: '#ff6436',
        onyx: '#161616',
        graphite: '#3c3a3e',
        stone: '#7b7a7c',
        ash: '#a2a2a2',
        'silver-mist': '#c9c7cc',
        fog: '#f1f1f1',
        paper: '#f8f8f8',
      },
      fontFamily: {
        /* ABC Gravity Cyrillic — та же гарнитура, что у оригинала;
           подключена файлом в index.css. Onest вместо Die Grotesk B,
           IBM Plex Mono взят как есть: кириллица в нём есть. */
        monument: ["'ABC Gravity'", "'Arial Black'", 'sans-serif'],
        grot: ["'Onest'", 'system-ui', 'sans-serif'],
        mono: ["'IBM Plex Mono'", 'ui-monospace', 'monospace'],
      },
      fontSize: {
        micro: ['12px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        caption: ['14px', { lineHeight: '1', letterSpacing: '-0.01em' }],
        'body-sm': ['17px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'body-lg': ['21px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        subheading: ['23px', { lineHeight: '1', letterSpacing: '-0.005em' }],
        'heading-sm': ['36px', { lineHeight: '1', letterSpacing: '-0.03em' }],
        heading: ['60px', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'heading-lg': ['96px', { lineHeight: '0.74', letterSpacing: '-0.01em' }],
      },
      spacing: {
        /* Базовая единица 6px — плотная сетка оригинала */
        1.5: '6px',
        3: '12px',
        4.5: '18px',
        6: '24px',
        12: '48px',
        15: '60px',
        18: '72px',
        24: '96px',
        30: '120px',
      },
      borderRadius: {
        /* Пилюли только у интерактивного, карточки и панели — острые углы */
        panel: '14.4px',
      },
      transitionTimingFunction: {
        enter: 'cubic-bezier(0.32, 0.72, 0, 1)',
        exit: 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      maxWidth: {
        page: '1200px',
      },
    },
  },
  plugins: [],
}
