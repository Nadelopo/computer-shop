module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    screens: {
      xs: '520px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    extend: {
      colors: {
        text: 'var(--main-semi-light)',
        danger: 'var(--danger)',
        'danger-light': 'var(--danger-semi-light)'
      }
    }
  },
  plugins: []
}
