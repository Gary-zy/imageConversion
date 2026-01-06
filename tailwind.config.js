/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,vue}",
  ],
  darkMode: 'class',
  safelist: [
    // Ring utilities for ink wash style
    'ring-2', 'ring-ink-700', 'ring-ink-300',
    // Shadow utilities
    'shadow-ink', 'shadow-ink-md', 'shadow-ink-lg', 'shadow-ink-dark',
    // Accent colors
    'accent-ink-700', 'accent-ink-300',
    // Transition classes for modals
    'scale-95', 'scale-100', 'translate-y-0', 'translate-y-4',
    'ease-in', 'ease-out',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // 水墨画风格颜色系统
        ink: {
          50: '#FDFBF7',   // 宣纸白
          100: '#F5F0E8',  // 淡墨
          200: '#E8E0D4',  // 浅墨
          300: '#D4C9B8',  // 轻墨
          400: '#A69B8A',  // 中墨
          500: '#7A7062',  // 深墨
          600: '#5C544A',  // 浓墨
          700: '#3D3832',  // 重墨
          800: '#2A2622',  // 焦墨
          900: '#1A1A1A',  // 墨黑
          950: '#0D0D0D',  // 极墨
        },
        vermillion: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#C53030',  // 朱砂红
          600: '#B91C1C',
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#450A0A',
        },
        bamboo: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#2F855A',  // 竹青
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        serif: [
          '"Noto Serif SC"',
          '"Source Han Serif SC"',
          '"Songti SC"',
          'Georgia',
          'serif',
        ],
      },
      boxShadow: {
        'primary': '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
        'primary-lg': '0 10px 25px -5px rgba(59, 130, 246, 0.4), 0 8px 10px -6px rgba(59, 130, 246, 0.2)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        // 水墨风格阴影
        'ink': '0 2px 8px -2px rgba(26, 26, 26, 0.1), 0 4px 12px -4px rgba(26, 26, 26, 0.08)',
        'ink-md': '0 4px 16px -4px rgba(26, 26, 26, 0.15), 0 8px 24px -8px rgba(26, 26, 26, 0.1)',
        'ink-lg': '0 8px 32px -8px rgba(26, 26, 26, 0.2), 0 16px 48px -16px rgba(26, 26, 26, 0.15)',
        'ink-dark': '0 2px 8px -2px rgba(0, 0, 0, 0.3), 0 4px 12px -4px rgba(0, 0, 0, 0.2)',
      },
      ringColor: {
        ink: {
          300: '#D4C9B8',
          700: '#3D3832',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}
