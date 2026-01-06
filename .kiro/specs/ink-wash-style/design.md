# Design Document: 水墨画风格 UI 设计

## Overview

本设计文档描述图片转换器应用的水墨画风格（Ink Wash Style）UI 重设计方案。设计灵感来源于中国传统水墨画艺术，强调留白、墨色层次、简约雅致的东方美学。通过黑白灰为主的色调配合宣纸质感背景，营造宁静、典雅、富有文化底蕴的视觉体验。

## Architecture

### 设计系统结构

```
Design System
├── Colors (色彩系统)
│   ├── Ink Tones (墨色系)
│   ├── Accent Colors (点缀色)
│   └── Semantic Colors (语义色)
├── Typography (字体排版)
│   ├── Heading Font (标题字体)
│   └── Body Font (正文字体)
├── Components (组件样式)
│   ├── Cards (卡片)
│   ├── Buttons (按钮)
│   ├── Inputs (输入框)
│   └── Modals (弹窗)
├── Effects (效果)
│   ├── Shadows (阴影)
│   ├── Borders (边框)
│   └── Animations (动画)
└── Themes (主题)
    ├── Light Mode (宣纸白)
    └── Dark Mode (墨黑)
```

## Components and Interfaces

### 1. 色彩系统 (Color System)

#### Tailwind 配置扩展

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // 墨色系 - Ink Tones
        ink: {
          900: '#1A1A1A', // 浓墨 - Deep Ink
          800: '#2D2D2D', // 重墨 - Heavy Ink
          700: '#404040', // 中墨 - Medium Ink
          600: '#525252', // 淡墨 - Light Ink
          500: '#6B7280', // 石灰 - Stone Gray
          400: '#9CA3AF', // 雾灰 - Mist Gray
          300: '#D1D5DB', // 浅灰 - Light Gray
          200: '#E5E7EB', // 云白 - Cloud White
          100: '#F3F4F6', // 霜白 - Frost White
          50: '#FDFBF7',  // 宣纸 - Rice Paper
        },
        // 点缀色 - Accent Colors
        vermillion: {
          500: '#C53030', // 朱红 - Vermillion Red
          600: '#9B2C2C', // 深朱红
          400: '#E53E3E', // 浅朱红
        },
        bamboo: {
          500: '#2F855A', // 竹绿 - Bamboo Green
          600: '#276749', // 深竹绿
          400: '#48BB78', // 浅竹绿
        },
        // 语义色
        primary: {
          DEFAULT: '#1A1A1A',
          light: '#404040',
          dark: '#0A0A0A',
        },
      },
      // 字体
      fontFamily: {
        serif: ['Noto Serif SC', 'serif'],
        sans: ['Noto Sans SC', 'sans-serif'],
      },
      // 阴影 - 水墨扩散效果
      boxShadow: {
        'ink': '0 4px 20px -2px rgba(26, 26, 26, 0.08)',
        'ink-md': '0 8px 30px -4px rgba(26, 26, 26, 0.12)',
        'ink-lg': '0 12px 40px -6px rgba(26, 26, 26, 0.16)',
        'ink-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
      },
      // 背景图案
      backgroundImage: {
        'rice-paper': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
        'ink-wash': 'linear-gradient(180deg, rgba(26,26,26,0.02) 0%, rgba(26,26,26,0.05) 100%)',
      },
    },
  },
}
```

### 2. 字体导入 (Typography Import)

```css
/* src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Serif+SC:wght@400;500;600;700&display=swap');
```

### 3. 组件样式规范

#### 卡片组件 (Card)

```vue
<!-- 水墨风格卡片 -->
<div class="
  bg-ink-50 dark:bg-ink-800
  border border-ink-200 dark:border-ink-700
  rounded-lg
  shadow-ink dark:shadow-ink-dark
  transition-all duration-300 ease-out
  hover:shadow-ink-md dark:hover:shadow-ink-dark
">
  <!-- 内容 -->
</div>
```

#### 按钮组件 (Button)

```vue
<!-- 主要按钮 - 朱红 -->
<button class="
  px-6 py-3
  bg-vermillion-500 hover:bg-vermillion-600
  text-white
  rounded-md
  font-sans font-medium
  transition-all duration-200 ease-out
  shadow-ink hover:shadow-ink-md
  active:scale-[0.98]
">
  开始转换
</button>

<!-- 次要按钮 - 墨色 -->
<button class="
  px-6 py-3
  bg-ink-100 dark:bg-ink-700
  text-ink-800 dark:text-ink-100
  border border-ink-300 dark:border-ink-600
  rounded-md
  font-sans font-medium
  transition-all duration-200 ease-out
  hover:bg-ink-200 dark:hover:bg-ink-600
">
  取消
</button>
```

#### 输入框组件 (Input)

```vue
<input class="
  w-full px-4 py-3
  bg-white dark:bg-ink-800
  border border-ink-300 dark:border-ink-600
  rounded-md
  font-sans text-ink-800 dark:text-ink-100
  placeholder-ink-400
  transition-all duration-200
  focus:outline-none
  focus:border-ink-500 dark:focus:border-ink-400
  focus:ring-2 focus:ring-ink-500/20
" />
```

### 4. 页面背景样式

```vue
<!-- 浅色模式背景 -->
<div class="
  min-h-screen
  bg-ink-50 bg-rice-paper
  dark:bg-ink-900 dark:bg-none
">
  <!-- 水墨渐变装饰层 -->
  <div class="
    fixed inset-0 pointer-events-none
    bg-gradient-to-b from-transparent via-ink-100/30 to-ink-200/20
    dark:from-transparent dark:via-ink-800/30 dark:to-ink-900/50
  "></div>
  
  <!-- 内容 -->
</div>
```

### 5. 导航栏样式

```vue
<header class="
  sticky top-0 z-50
  bg-ink-50/90 dark:bg-ink-900/90
  backdrop-blur-md
  border-b border-ink-200/50 dark:border-ink-700/50
">
  <!-- 毛笔笔触风格底边 -->
  <div class="
    absolute bottom-0 left-0 right-0 h-px
    bg-gradient-to-r from-transparent via-ink-400 to-transparent
    opacity-30
  "></div>
</header>
```

### 6. 弹窗样式

```vue
<!-- 遮罩层 - 墨色晕染 -->
<div class="
  fixed inset-0
  bg-ink-900/60 dark:bg-ink-900/80
  backdrop-blur-sm
"></div>

<!-- 弹窗内容 -->
<div class="
  bg-ink-50 dark:bg-ink-800
  border border-ink-200 dark:border-ink-700
  rounded-lg
  shadow-ink-lg dark:shadow-ink-dark
  overflow-hidden
">
  <!-- 头部 -->
  <div class="
    px-6 py-4
    border-b border-ink-200 dark:border-ink-700
    bg-ink-100/50 dark:bg-ink-700/50
  ">
    <h3 class="font-serif text-lg font-semibold text-ink-800 dark:text-ink-100">
      标题
    </h3>
  </div>
</div>
```

## Data Models

无新增数据模型，本功能仅涉及 UI 样式变更。

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

由于本功能主要涉及 UI 样式和视觉设计，大部分需求是视觉性的，不适合通过属性测试验证。以下是可测试的属性：

### Property 1: 主题背景一致性

*For any* theme state (light or dark), the application background color should match the corresponding ink wash palette color - rice paper (#FDFBF7) for light mode, deep ink (#111111 or similar dark) for dark mode.

**Validates: Requirements 1.3, 1.4, 6.1**

### Property 2: 动画无障碍支持

*For any* animation in the application, when the user has enabled `prefers-reduced-motion: reduce`, the animation should be disabled or significantly reduced.

**Validates: Requirements 5.4**

## Error Handling

1. **字体加载失败**: 使用系统默认 serif/sans-serif 字体作为后备
2. **CSS 变量不支持**: 提供硬编码的颜色值作为后备
3. **动画性能问题**: 在低性能设备上自动降级动画效果

## Testing Strategy

### 单元测试

由于本功能主要是 UI 样式重设计，建议通过以下方式验证：

1. **手动视觉测试**: 在浅色和深色模式下检查所有组件样式
2. **Tailwind 配置测试**: 验证自定义颜色和阴影配置正确加载
3. **字体加载测试**: 验证 Google Fonts 正确加载

### 属性测试

使用 Vitest 进行测试：

```typescript
describe('Theme consistency', () => {
  it('should apply rice paper background in light mode', () => {
    // 验证浅色模式背景色
  });
  
  it('should apply ink black background in dark mode', () => {
    // 验证深色模式背景色
  });
});

describe('Accessibility', () => {
  it('should respect prefers-reduced-motion', () => {
    // 验证动画无障碍支持
  });
});
```

### 视觉回归测试

建议使用 Playwright 或 Cypress 进行截图对比测试，确保样式变更不会意外破坏现有布局。

## 设计参考

### 色彩灵感

- 浓墨：如同毛笔蘸满墨汁的深黑
- 淡墨：如同墨水在宣纸上晕染开的灰色
- 宣纸：略带暖调的米白色，有细微纹理
- 朱红：传统印章的红色，用于强调和行动
- 竹绿：竹叶的青绿色，用于成功状态

### 交互原则

- 悬停效果如墨水缓缓扩散
- 点击反馈如墨滴落入水中
- 过渡动画平缓流畅，不急不躁
- 留白充足，呼吸感强
