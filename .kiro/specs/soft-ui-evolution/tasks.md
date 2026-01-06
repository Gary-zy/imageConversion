# Implementation Plan: Soft UI Evolution Style

## Overview

将图片转换器从水墨风格迁移到 Soft UI Evolution 风格。按照配置 → 基础样式 → 组件的顺序逐步实施。

## Tasks

- [x] 1. 更新设计系统配置
  - [x] 1.1 更新 tailwind.config.js 颜色系统
    - 添加 soft 颜色 (blue, pink, green)
    - 移除 ink, vermillion, bamboo 颜色
    - 保留并优化 primary 颜色
    - 添加 slate 中性色作为主要灰度色
    - _Requirements: 1.1, 1.2, 1.3, 2.1_
  - [x] 1.2 更新 tailwind.config.js 阴影系统
    - 添加 soft, soft-md, soft-lg, soft-inner 阴影
    - 移除 ink 相关阴影
    - _Requirements: 1.4, 2.2_
  - [x] 1.3 更新 tailwind.config.js 字体配置
    - 添加 Google Fonts 导入 (Nunito Sans, Varela Round)
    - 配置 heading 和 body 字体族
    - _Requirements: 1.5, 1.6_
  - [x] 1.4 更新 safelist 配置
    - 移除 ink 相关类名
    - 添加 soft 相关类名
    - _Requirements: 2.2_

- [x] 2. 更新基础样式文件
  - [x] 2.1 更新 index.html 添加 Google Fonts
    - 添加 Nunito Sans 和 Varela Round 字体链接
    - _Requirements: 1.5, 1.6_
  - [x] 2.2 更新 src/index.css
    - 移除水墨风格自定义样式
    - 更新深色模式基础样式
    - 更新滚动条样式为 slate 色系
    - _Requirements: 2.4, 9.1, 9.2_

- [ ] 3. Checkpoint - 验证配置
  - 运行 `pnpm dev` 确保项目正常启动
  - 检查控制台无错误
  - 确认字体正确加载

- [x] 4. 更新主应用组件 App.vue
  - [x] 4.1 更新页面背景和布局
    - 移除 ink-paper-bg, ink-wash-gradient 类
    - 使用 bg-slate-50 dark:bg-slate-900 背景
    - _Requirements: 2.3, 9.1_
  - [x] 4.2 更新导航栏样式
    - 使用 bg-white/80 dark:bg-slate-800/80 背景
    - 添加 shadow-soft 阴影
    - 更新边框为 border-slate-200
    - _Requirements: 3.1, 3.2_
  - [x] 4.3 更新 Logo 区域
    - 使用 bg-primary-500 背景色
    - 添加 shadow-soft 阴影
    - _Requirements: 3.4_
  - [x] 4.4 更新 Tab 切换器
    - 使用 bg-slate-100 dark:bg-slate-800 背景
    - 激活状态使用 bg-white shadow-soft
    - _Requirements: 3.5_
  - [x] 4.5 更新统计面板
    - 使用渐变背景 bg-gradient-to-r from-primary-500 to-primary-600
    - 替换 ink 色为 slate 色
    - _Requirements: 5.5_
  - [x] 4.6 更新操作按钮区域
    - 主按钮使用 bg-primary-500 shadow-soft
    - 次要按钮使用 bg-slate-100
    - CTA 按钮使用 bg-orange-500
    - _Requirements: 6.1, 6.2, 6.5_
  - [x] 4.7 更新历史记录弹窗
    - 遮罩使用 bg-slate-900/50 backdrop-blur-sm
    - 内容使用 bg-white shadow-soft-lg rounded-2xl
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [x] 4.8 更新快捷键弹窗
    - 同历史记录弹窗样式
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 5. 更新文件上传组件 FileUpload.vue
  - [x] 5.1 更新上传区域样式
    - 使用 border-dashed border-2 border-slate-300
    - 背景使用 bg-slate-50 hover:bg-slate-100
    - 圆角使用 rounded-2xl
    - _Requirements: 4.1_
  - [x] 5.2 更新拖拽状态样式
    - 拖拽时使用 border-primary-400 bg-primary-50
    - _Requirements: 4.2_
  - [x] 5.3 更新图标和文字颜色
    - 图标使用 text-primary-500
    - 文字使用 text-slate-600
    - _Requirements: 4.3_

- [x] 6. 更新格式选择组件 FormatSelector.vue
  - [x] 6.1 更新格式卡片样式
    - 使用 bg-white shadow-soft rounded-xl
    - 边框使用 border border-slate-200
    - hover 状态使用 shadow-soft-md
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 6.2 更新选中状态
    - 选中时使用 ring-2 ring-primary-500
    - _Requirements: 5.4_

- [x] 7. 更新文件列表组件 FileList.vue
  - [x] 7.1 更新列表项样式
    - 使用 bg-white shadow-soft rounded-xl
    - hover 状态使用 shadow-soft-md
    - _Requirements: 5.1, 5.2, 5.4_
  - [x] 7.2 更新状态指示器
    - 成功状态使用 text-emerald-500
    - 错误状态使用 text-rose-500
    - 进行中使用 text-primary-500
    - _Requirements: 5.3_

- [x] 8. Checkpoint - 验证核心组件
  - 检查上传、格式选择、文件列表功能正常
  - 验证浅色/深色模式切换
  - 确保所有 ink-* 类名已移除

- [x] 9. 更新高级设置组件 AdvancedSettings.vue
  - [x] 9.1 更新面板容器样式
    - 使用 bg-white shadow-soft rounded-2xl
    - 边框使用 border border-slate-200
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 9.2 更新表单输入框
    - 使用 rounded-lg border-slate-300
    - focus 状态使用 ring-2 ring-primary-500
    - _Requirements: 7.1, 7.2_
  - [x] 9.3 更新滑块组件
    - 轨道使用 bg-slate-200
    - 滑块使用 bg-primary-500
    - _Requirements: 7.3_
  - [x] 9.4 更新复选框样式
    - 使用 rounded border-slate-300
    - 选中使用 bg-primary-500
    - _Requirements: 7.4_

- [x] 10. 更新图片预览组件 ImagePreview.vue
  - [x] 10.1 更新预览卡片样式
    - 使用 bg-white shadow-soft rounded-2xl
    - _Requirements: 5.1, 5.2_

- [x] 11. 更新 OFD 处理组件 OfdProcessor.vue
  - [x] 11.1 更新整体布局样式
    - 应用与其他组件一致的 Soft UI 样式
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 12. 深色模式优化
  - [x] 12.1 验证所有组件深色模式
    - 确保每个颜色类都有 dark: 变体
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - [x] 12.2 调整深色模式阴影
    - 深色模式下使用更微妙的阴影
    - _Requirements: 9.3_

- [x] 13. 无障碍性检查
  - [x] 13.1 添加 focus 可见状态
    - 所有交互元素添加 focus-visible:ring-2
    - _Requirements: 10.2_
  - [x] 13.2 添加 reduced-motion 支持
    - 动画添加 motion-reduce:transition-none
    - _Requirements: 10.4_

- [x] 14. Final Checkpoint - 完整测试
  - 测试所有功能正常工作
  - 验证浅色/深色模式
  - 检查移动端响应式
  - 确认无 ink-* 类名残留
  - 验证字体正确显示

## Notes

- 迁移过程中保持功能不变，仅更新样式
- 每个组件更新后立即测试，确保无回归
- 使用 `grep -r "ink-" src/` 检查残留类名
- 深色模式是重点，确保每个颜色都有对应的 dark: 变体
