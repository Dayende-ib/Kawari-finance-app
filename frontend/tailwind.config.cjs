module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#0ea5e9',
        bg: '#0b1220',
        panel: '#111827',
        muted: '#9ca3af',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
      },
      boxShadow: {
        card: '0 10px 40px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
};
