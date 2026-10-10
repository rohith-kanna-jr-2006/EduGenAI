/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#5873E5',
          hover: '#4760D1',
          active: '#3C52B8',
          tint: '#EEF2FF',
          dark: '#3552C3',
          light: '#DDE1FF',
        },
        surface: {
          canvas: '#F7F8FC',
          card: '#FFFFFF',
          hover: '#F1F4F9',
          tint: '#FBF8FF',
          container: '#ECECFF',
        },
        ink: {
          heading: '#1A1F36',
          body: '#4A5568',
          muted: '#8792A2',
          light: '#C5C5D5',
        },
        border: {
          DEFAULT: '#E8EBF3',
          light: '#F0F2F8',
          dark: '#D1D5DB',
        },
        status: {
          success: '#10B981',
          'success-bg': '#ECFDF5',
          'success-border': '#A7F3D0',
          warning: '#F59E0B',
          'warning-bg': '#FFFBEB',
          'warning-border': '#FDE68A',
          danger: '#EF4444',
          'danger-bg': '#FEF2F2',
          'danger-border': '#FECACA',
          info: '#3B82F6',
          'info-bg': '#EFF6FF',
          'info-border': '#BFDBFE',
        }
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        pill: '9999px',
      },
      boxShadow: {
        'level-0': 'none',
        'level-1': '0 1px 3px rgba(26, 31, 54, 0.04), 0 1px 2px rgba(26, 31, 54, 0.02)',
        'level-2': '0 4px 12px rgba(26, 31, 54, 0.06), 0 1px 3px rgba(26, 31, 54, 0.04)',
        'level-3': '0 12px 32px rgba(26, 31, 54, 0.10), 0 2px 6px rgba(26, 31, 54, 0.04)',
      },
      width: {
        sidebar: '246px',
      }
    },
  },
  plugins: [],
};
