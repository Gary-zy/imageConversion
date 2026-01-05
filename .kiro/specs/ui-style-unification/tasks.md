# Implementation Plan: UI Style Unification

## Overview

本实现计划将分步骤完成 UI 样式统一优化，包括添加 GitHub 链接、优化弹窗样式。

**⚠️ 重要原则：仅修改样式，不触碰任何现有功能逻辑！**

## Tasks

- [x] 1. 添加 GitHub 链接按钮（仅添加 HTML 元素）
  - 在 Header 工具按钮区添加 GitHub 图标链接
  - 使用 `<a>` 标签，不涉及任何 JS 逻辑
  - 按钮位置在主题切换按钮之前
  - 添加 title 属性显示提示
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2. 优化历史记录弹窗样式（仅修改 CSS 类）
  - 仅修改 class 属性，添加深色模式支持
  - 不修改任何 v-if、@click 等逻辑
  - 统一遮罩层样式
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3. 优化快捷键帮助弹窗样式（仅修改 CSS 类）
  - 仅修改 class 属性，添加深色模式支持
  - 不修改任何 v-if、@click 等逻辑
  - 优化 kbd 标签样式
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 4. 更新快捷键列表数据（最小改动）
  - 仅在 shortcuts 数组中添加一条 GitHub 条目
  - 不修改任何其他数据或逻辑
  - _Requirements: 3.2_

- [ ] 5. Checkpoint - 验证
  - 确保所有原有功能正常工作
  - 检查深色/浅色模式切换
  - 检查 GitHub 链接可点击

## Notes

- **核心原则：只改样式，不改逻辑**
- 需要用户提供 GitHub 仓库地址
- 所有样式修改都在 App.vue 的 template 部分完成
- 使用 Tailwind CSS 的 dark: 前缀实现深色模式支持
- 每次修改后仔细检查，确保不影响现有功能
