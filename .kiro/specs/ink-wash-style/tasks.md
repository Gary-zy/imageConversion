# Implementation Plan: 水墨画风格 UI 设计

## Overview

本实现计划将分步骤完成图片转换器应用的水墨画风格 UI 重设计。采用渐进式修改策略，确保每一步都可验证，不破坏现有功能。

## Tasks

- [x] 1. 配置设计系统基础
  - [x] 1.1 更新 tailwind.config.js 添加水墨色彩系统
    - 添加 ink 色彩系列（ink-50 到 ink-900）
    - 添加 vermillion 和 bamboo 点缀色
    - 添加自定义阴影 shadow-ink 系列
    - _Requirements: 1.1, 1.2_
  - [x] 1.2 更新 src/index.css 导入字体和基础样式
    - 导入 Noto Serif SC 和 Noto Sans SC 字体
    - 添加宣纸纹理背景 CSS
    - 添加水墨渐变效果 CSS
    - _Requirements: 2.1, 2.2, 4.1_

- [x] 2. 更新全局样式和主题
  - [x] 2.1 修改 App.vue 页面背景样式
    - 应用宣纸背景色和纹理
    - 添加水墨渐变装饰层
    - 更新深色模式背景为墨黑色
    - _Requirements: 1.3, 1.4, 4.1_
  - [x] 2.2 更新 Header 导航栏样式
    - 应用水墨风格背景和边框
    - 添加毛笔笔触风格底边装饰
    - 更新 Logo 区域样式
    - _Requirements: 4.2_

- [x] 3. Checkpoint - 验证基础样式
  - 确保页面背景正确显示宣纸纹理
  - 确保深色模式切换正常
  - 确保字体正确加载

- [x] 4. 更新核心组件样式
  - [x] 4.1 更新 FileUpload.vue 上传区域样式
    - 应用水墨风格边框和背景
    - 更新拖拽悬停效果
    - _Requirements: 3.1, 3.2_
  - [x] 4.2 更新 FormatSelector.vue 格式选择器样式
    - 应用水墨风格卡片和按钮
    - 更新选中状态样式
    - _Requirements: 3.1, 3.2_
  - [x] 4.3 更新 AdvancedSettings.vue 高级设置样式
    - 应用水墨风格输入框和滑块
    - 更新折叠面板样式
    - _Requirements: 3.1, 3.3_
  - [x] 4.4 更新 FileList.vue 文件列表样式
    - 应用水墨风格列表项
    - 更新状态指示器颜色
    - _Requirements: 3.1_

- [x] 5. Checkpoint - 验证组件样式
  - 确保所有组件样式协调一致
  - 确保深色模式下组件显示正常
  - 确保交互效果流畅

- [x] 6. 更新弹窗和操作区样式
  - [x] 6.1 更新 App.vue 中的历史记录弹窗样式
    - 应用墨色晕染遮罩
    - 应用水墨风格弹窗容器
    - 更新列表项样式
    - _Requirements: 3.4, 3.5_
  - [x] 6.2 更新 App.vue 中的快捷键帮助弹窗样式
    - 应用水墨风格弹窗
    - 更新 kbd 标签样式为墨色风格
    - _Requirements: 3.4, 3.5_
  - [x] 6.3 更新操作按钮区样式
    - 主按钮使用朱红色
    - 次按钮使用墨色
    - 添加水墨扩散悬停效果
    - _Requirements: 3.2, 5.1, 5.2_

- [x] 7. 更新辅助组件样式
  - [x] 7.1 更新 ImagePreview.vue 预览组件样式
    - 应用水墨风格边框和阴影
    - _Requirements: 3.1, 3.5_
  - [x] 7.2 更新 OfdProcessor.vue OFD处理器样式
    - 保持与图片转换器一致的水墨风格
    - _Requirements: 3.1_
  - [x] 7.3 更新使用提示区域样式
    - 将橙色提示改为竹绿或墨色风格
    - _Requirements: 1.2_

- [x] 8. 优化交互效果
  - [x] 8.1 添加水墨风格过渡动画
    - 统一过渡时间为 200-300ms
    - 使用 ease-out 缓动函数
    - _Requirements: 5.1, 5.3_
  - [x] 8.2 添加 prefers-reduced-motion 支持
    - 在 CSS 中添加媒体查询
    - 禁用或减少动画效果
    - _Requirements: 5.4_

- [x] 9. Final Checkpoint - 完整验证
  - 确保所有页面和组件样式一致
  - 确保浅色/深色模式切换流畅
  - 确保所有原有功能正常工作
  - 确保响应式布局正常
  - 确保无障碍访问支持

## Notes

- 所有样式修改使用 Tailwind CSS 类，避免内联样式
- 优先使用自定义的 ink 色彩系统
- 保持现有功能逻辑不变，仅修改样式
- 每个 Checkpoint 后进行视觉验证
- 深色模式使用 dark: 前缀实现
