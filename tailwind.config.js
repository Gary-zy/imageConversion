/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,vue}",
  ],
  safelist: [
    // Layout
    'flex', 'inline-flex', 'grid', 'block', 'hidden', 'relative', 'absolute', 'fixed', 'sticky',
    'flex-col', 'flex-wrap', 'flex-1', 'items-center', 'justify-center', 'justify-between', 'items-start',
    'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-6', 'gap-8',
    'space-y-1', 'space-y-2', 'space-y-3', 'space-y-4', 'space-y-5', 'space-y-6',
    // Sizing
    'h-full', 'h-fit', 'w-full', 'w-4', 'w-5', 'w-6', 'w-8', 'w-10', 'w-12', 'w-16', 'w-20',
    'h-4', 'h-5', 'h-6', 'h-8', 'h-10', 'h-12', 'h-16', 'h-20',
    'min-h-screen', 'max-w-7xl', 'max-h-96',
    // Spacing
    'p-1', 'p-2', 'p-3', 'p-4', 'p-6', 'p-12',
    'px-2', 'px-3', 'px-4', 'px-6',
    'py-1', 'py-1.5', 'py-2', 'py-3', 'py-4', 'py-6', 'py-8', 'py-12',
    'pt-4', 'pl-6',
    'mt-1', 'mt-2', 'mt-3', 'mt-4', 'mt-5', 'mt-6', 'mt-12',
    'mb-1', 'mb-2', 'mb-3', 'mb-4',
    // Borders
    'border', 'border-2', 'border-b', 'border-t', 'border-b-2',
    'border-dashed', 'border-gray-200', 'border-gray-300', 'border-primary-500', 'border-primary-600',
    // Border Radius
    'rounded', 'rounded-lg', 'rounded-md', 'rounded-xl', 'rounded-2xl', 'rounded-full',
    // Backgrounds
    'bg-white', 'bg-gray-50', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300',
    'bg-primary-50', 'bg-primary-100', 'bg-primary-400', 'bg-primary-500', 'bg-blue-500',
    'bg-green-500', 'bg-red-500', 'bg-red-50', 'bg-red-100',
    'bg-gradient-to-r', 'bg-gradient-to-br',
    'from-primary-500', 'from-primary-100', 'from-gray-50', 'from-green-500',
    'to-primary-600', 'to-primary-50', 'to-gray-50', 'to-emerald-500',
    // Typography
    'text-center', 'text-right',
    'text-xs', 'text-sm', 'text-lg',
    'font-medium', 'font-semibold', 'font-bold',
    'text-white', 'text-gray-400', 'text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900',
    'text-primary-500', 'text-primary-600', 'text-red-500', 'text-green-500',
    'text-white/80', 'text-white/70',
    // Effects
    'opacity-20', 'opacity-25', 'opacity-75',
    'shadow', 'shadow-lg', 'shadow-md', 'shadow-sm',
    'shadow-primary-500/20', 'shadow-primary-500/30', 'shadow-green-500/30',
    'blur',
    'grayscale', 'invert', 'sepia',
    // Transitions
    'transition-all', 'transition-colors', 'transition-transform',
    'duration-200', 'duration-300', 'ease-out',
    // Transforms
    'rotate-180', 'scale-105', 'scale-110', 'scale-[1.02]',
    // Interactive
    'cursor-pointer', 'cursor-not-allowed',
    'hover:scale-[1.02]', 'hover:border-blue-500', 'hover:border-primary-400', 'hover:border-gray-300',
    'hover:bg-gray-50', 'hover:bg-gray-50/50', 'hover:bg-gray-50/80', 'hover:bg-gray-100', 'hover:bg-gray-200', 'hover:bg-gray-300',
    'hover:bg-red-50', 'hover:bg-blue-600',
    'hover:text-red-500', 'hover:text-red-600', 'hover:text-gray-700', 'hover:text-gray-900',
    'hover:shadow-lg', 'hover:shadow-sm', 'hover:shadow-xl', 'hover:shadow-green-500/30',
    'active:scale-[0.98]',
    'focus:outline-none', 'focus:ring-2', 'focus:border-primary-500', 'focus:ring-primary-500',
    'disabled:opacity-50', 'disabled:bg-gray-400', 'disabled:cursor-not-allowed',
    // Layout specific
    'overflow-hidden', 'overflow-auto', 'overflow-y-auto', 'overflow-x-auto',
    'truncate', 'whitespace-nowrap',
    'divide-y', 'divide-gray-100',
    // Other
    'aspect-video', 'object-cover', 'object-contain',
    'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4',
    'contents', 'table',
    'resize', 'appearance-none',
    // Ring colors for ink wash style
    'ring-2', 'ring-ink-700', 'ring-ink-300',
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
