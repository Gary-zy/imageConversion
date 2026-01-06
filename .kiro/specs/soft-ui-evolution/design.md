# Design Document: Soft UI Evolution Style

## Overview

本设计文档描述如何将图片转换器项目从「水墨风格」迁移到「Soft UI Evolution」风格。Soft UI Evolution 是 Neumorphism 的进化版本，保留了柔和的视觉效果，同时改进了对比度和无障碍性，非常适合工具类应用。

### 设计原则

1. **柔和但清晰** - 使用柔和的阴影和颜色，但保持足够的对比度
2. **现代且专业** - 圆角、渐变、微妙的深度效果
3. **无障碍优先** - 确保 WCAG AA 标准，所有交互元素有明确的视觉反馈
4. **一致性** - 统一的设计语言贯穿所有组件

## Architecture

### 设计系统层次

```
┌─────────────────────────────────────────────────────────┐
│                    Design Tokens                         │
│  (Colors, Typography, Shadows, Spacing, Border Radius)  │
├─────────────────────────────────────────────────────────┤
│                  Tailwind Config                         │
│     (theme.extend with custom utilities)                │
├─────────────────────────────────────────────────────────┤
│                   Base Styles                            │
│        (index.css - global styles, resets)              │
├─────────────────────────────────────────────────────────┤
│                    Components                            │
│  (Vue components using Tailwind classes)                │
└─────────────────────────────────────────────────────────┘
```

### 迁移策略

1. 更新 `tailwind.config.js` - 替换颜色系统和阴影
2. 更新 `src/index.css` - 移除水墨风格自定义样式
3. 逐个更新 Vue 组件 - 替换类名

## Components and Interfaces

### 需要更新的组件列表

| 组件 | 文件路径 | 主要变更 |
|------|----------|----------|
| App | src/App.vue | 整体布局、导航栏、弹窗 |
| FileUpload | src/components/FileUpload.vue | 上传区域样式 |
| FormatSelector | src/components/FormatSelector.vue | 格式选择卡片 |
| FileList | src/components/FileList.vue | 文件列表项 |
| AdvancedSettings | src/components/AdvancedSettings.vue | 设置面板、表单元素 |
| ImagePreview | src/components/ImagePreview.vue | 预览卡片 |
| OfdProcessor | src/components/OfdProcessor.vue | OFD 处理界面 |

### 类名映射表

| 水墨风格类名 | Soft UI Evolution 类名 |
|-------------|----------------------|
| `bg-ink-50` | `bg-slate-50` |
| `bg-ink-100` | `bg-slate-100` |
| `bg-ink-800` | `bg-slate-800` |
| `bg-ink-900` | `bg-slate-900` |
| `text-ink-*` | `text-slate-*` |
| `border-ink-*` | `border-slate-*` |
| `shadow-ink` | `shadow-soft` |
| `shadow-ink-md` | `shadow-soft-md` |
| `shadow-ink-lg` | `shadow-soft-lg` |
| `ink-paper-bg` | (移除) |
| `ink-wash-gradient` | (移除) |
| `ink-brush-border` | (移除) |
| `font-serif` | `font-heading` |
| `vermillion-*` | `rose-*` |
| `bamboo-*` | `emerald-*` |

## Data Models

### 设计令牌 (Design Tokens)

```typescript
// 颜色系统
interface ColorPalette {
  // 主色调 - 柔和蓝
  soft: {
    blue: '#87CEEB',
    pink: '#FFB6C1', 
    green: '#90EE90',
  },
  // 功能色
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // 主色
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  // CTA 色
  cta: '#F97316',  // 橙色
  // 中性色
  neutral: {
    background: '#F8FAFC',
    text: '#1E293B',
    border: '#E2E8F0',
  },
  // 深色模式
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F1F5F9',
    border: '#334155',
  }
}

// 阴影系统
interface ShadowSystem {
  soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
  softMd: '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.06)',
  softLg: '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 50px -15px rgba(0, 0, 0, 0.1)',
  softInner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
}

// 字体系统
interface Typography {
  heading: ['Varela Round', 'sans-serif'],
  body: ['Nunito Sans', 'sans-serif'],
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

由于本功能主要是 UI 样式替换，大部分验收标准是配置验证和视觉检查，属于示例测试而非属性测试。以下是可验证的正确性属性：

### Property 1: 颜色系统完整性

*For any* Tailwind 配置文件，如果定义了 Soft UI Evolution 颜色系统，则必须包含所有必需的颜色变量（soft.blue, soft.pink, soft.green, primary.500, cta）。

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: 水墨风格完全移除

*For any* 源代码文件（.vue, .ts, .css），不应包含任何 `ink-` 前缀的类名或变量引用。

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 3: 深色模式颜色对应

*For any* 使用浅色模式颜色的组件，必须有对应的 `dark:` 前缀类提供深色模式变体。

**Validates: Requirements 9.1, 9.2, 9.3**

## Error Handling

### 迁移过程中的潜在问题

1. **类名遗漏** - 使用 grep 搜索确保所有 `ink-*` 类名被替换
2. **深色模式不一致** - 每个颜色类都需要对应的 `dark:` 变体
3. **字体加载失败** - 提供系统字体作为 fallback
4. **对比度不足** - 使用对比度检查工具验证

### 回滚策略

如果迁移出现问题，可以通过 git 回滚到水墨风格版本。建议在迁移前创建分支。

## Testing Strategy

### 测试方法

由于这是 UI 样式迁移，主要采用以下测试方法：

1. **配置验证测试** - 验证 Tailwind 配置包含所有必需的设计令牌
2. **代码搜索测试** - 确保没有遗留的水墨风格类名
3. **视觉回归测试** - 手动检查各组件在浅色/深色模式下的外观
4. **无障碍测试** - 使用浏览器开发工具检查对比度

### 测试清单

- [ ] Tailwind 配置包含所有 Soft UI Evolution 颜色
- [ ] 没有 `ink-*` 类名残留
- [ ] 所有组件在浅色模式下正常显示
- [ ] 所有组件在深色模式下正常显示
- [ ] 按钮 hover/active 状态正常
- [ ] 弹窗动画流畅
- [ ] 字体正确加载
- [ ] 移动端响应式正常

## Implementation Details

### Tailwind 配置更新

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        soft: {
          blue: '#87CEEB',
          pink: '#FFB6C1',
          green: '#90EE90',
        },
        // 保留 primary 色系
        primary: { /* ... */ },
      },
      fontFamily: {
        heading: ['Varela Round', 'system-ui', 'sans-serif'],
        body: ['Nunito Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-md': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 50px -15px rgba(0, 0, 0, 0.1)',
        'soft-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'soft': '1rem',
        'soft-lg': '1.5rem',
      },
    },
  },
}
```

### 组件样式示例

```vue
<!-- 按钮示例 -->
<button class="
  px-6 py-3 
  bg-primary-500 hover:bg-primary-600 
  text-white font-medium
  rounded-xl
  shadow-soft hover:shadow-soft-md
  transition-all duration-200
  active:scale-[0.98]
">
  开始转换
</button>

<!-- 卡片示例 -->
<div class="
  bg-white dark:bg-slate-800
  rounded-2xl
  shadow-soft
  border border-slate-200 dark:border-slate-700
  p-6
">
  <!-- 内容 -->
</div>
```
