# Design Document: UI Style Unification

## Overview

本设计文档描述了图片转换器应用的 UI 样式统一优化方案。主要解决弹窗在深色模式下与整体风格不协调的问题，添加 GitHub 链接功能，以及整体视觉优化。

## Architecture

### 组件结构

```
App.vue
├── Header (顶部导航栏)
│   ├── Logo
│   ├── Tab 切换
│   ├── 功能标签
│   └── 工具按钮区
│       ├── 快捷键按钮
│       ├── 历史记录按钮
│       ├── GitHub 按钮 (新增)
│       └── 主题切换按钮
├── Main Content
└── Modals
    ├── 历史记录弹窗
    └── 快捷键帮助弹窗
```

### 样式系统

采用 Tailwind CSS 的深色模式支持，通过 `dark:` 前缀实现主题切换。

## Components and Interfaces

### 1. GitHub 链接按钮

位置：Header 工具按钮区，在主题切换按钮之前

```vue
<a
  href="https://github.com/YOUR_USERNAME/YOUR_REPO"
  target="_blank"
  rel="noopener noreferrer"
  class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
  title="GitHub 仓库 (G)"
>
  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
</a>
```

### 2. 弹窗样式优化

#### 统一的弹窗容器样式

```vue
<!-- 遮罩层 - 两种主题下保持一致 -->
<div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

<!-- 弹窗内容 - 支持深色模式 -->
<div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-700">
  <!-- 头部 -->
  <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
    <h3 class="text-lg font-semibold text-gray-800 dark:text-white">标题</h3>
    <button class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
      <!-- 关闭图标 -->
    </button>
  </div>
  
  <!-- 内容区 -->
  <div class="p-6">
    <!-- 内容 -->
  </div>
</div>
```

### 3. 快捷键列表更新

新增 GitHub 快捷键：

```typescript
const shortcuts = [
  { key: 'Ctrl + Enter', action: '开始转换', description: '转换所有待处理的文件' },
  { key: 'Escape', action: '取消/关闭', description: '清空文件列表或关闭弹窗' },
  { key: 'Ctrl + H', action: '历史记录', description: '打开/关闭转换历史' },
  { key: 'Ctrl + /', action: '快捷键帮助', description: '显示快捷键列表' },
  { key: 'D', action: '切换主题', description: '切换深色/浅色模式' },
  { key: 'G', action: 'GitHub', description: '打开 GitHub 仓库' }, // 新增
];
```

### 4. 键盘事件处理

```typescript
// G: 打开 GitHub
if (e.key === 'g' && !e.ctrlKey && !e.metaKey && !e.altKey) {
  window.open('https://github.com/YOUR_USERNAME/YOUR_REPO', '_blank');
  return;
}
```

## Data Models

无新增数据模型，仅涉及 UI 样式和交互。

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

由于本功能主要涉及 UI 样式和视觉优化，大部分需求是视觉性的，不适合通过属性测试验证。以下是可测试的属性：

### Property 1: GitHub 快捷键功能

*For any* keyboard event where the G key is pressed without modifier keys (Ctrl, Meta, Alt), and the event target is not an input or textarea element, the application should trigger the GitHub repository opening action.

**Validates: Requirements 3.1, 3.3**

## Error Handling

1. **GitHub 链接打开失败**: 如果浏览器阻止弹出窗口，用户仍可通过点击按钮访问
2. **快捷键冲突**: G 键快捷键仅在非输入状态下生效，避免与文本输入冲突

## Testing Strategy

### 单元测试

由于本功能主要是 UI 样式优化，建议通过以下方式验证：

1. **手动视觉测试**: 在浅色和深色模式下检查弹窗样式是否协调
2. **组件存在性测试**: 验证 GitHub 按钮是否正确渲染在 Header 中
3. **快捷键测试**: 验证 G 键是否正确触发 GitHub 链接打开

### 属性测试

使用 Vitest 进行测试：

```typescript
// 测试 G 键快捷键
describe('GitHub shortcut', () => {
  it('should open GitHub when G key is pressed', () => {
    // 模拟键盘事件
    const event = new KeyboardEvent('keydown', { key: 'g' });
    // 验证 window.open 被调用
  });
  
  it('should not trigger when typing in input', () => {
    // 验证在输入框中按 G 不会触发
  });
});
```

### 视觉回归测试（可选）

如果需要更严格的视觉一致性验证，可以考虑使用 Playwright 或 Cypress 进行截图对比测试。
