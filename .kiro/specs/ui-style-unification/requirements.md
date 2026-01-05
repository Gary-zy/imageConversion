# Requirements Document

## Introduction

本功能旨在统一图片转换器应用的 UI 样式，解决深色/浅色模式下弹窗样式不一致的问题，添加 GitHub 链接以便用户快速访问项目仓库，并整体优化视觉体验使界面更加协调美观。

## Glossary

- **App**: 图片转换器应用程序
- **Modal**: 弹窗组件，包括历史记录弹窗和快捷键帮助弹窗
- **Header**: 顶部导航栏组件
- **Theme_System**: 主题切换系统，支持浅色和深色模式
- **GitHub_Link**: GitHub 仓库链接按钮

## Requirements

### Requirement 1: 弹窗样式统一

**User Story:** As a user, I want the modal dialogs to have consistent styling with the overall app theme, so that the visual experience is cohesive and pleasant.

#### Acceptance Criteria

1. WHEN the app is in light mode, THE Modal SHALL display with a white background and light gray borders
2. WHEN the app is in dark mode, THE Modal SHALL display with a dark gray background that matches the app's dark theme
3. THE Modal overlay background SHALL use a semi-transparent dark overlay in both themes
4. THE Modal close button SHALL have consistent hover states that match the current theme

### Requirement 2: GitHub 链接功能

**User Story:** As a user, I want to quickly access the GitHub repository, so that I can star the project or view the source code.

#### Acceptance Criteria

1. THE Header SHALL display a GitHub icon button in the toolbar area
2. WHEN a user clicks the GitHub button, THE App SHALL open the GitHub repository in a new browser tab
3. THE GitHub_Link button SHALL have a tooltip indicating its purpose
4. THE GitHub_Link button SHALL have consistent styling with other toolbar buttons

### Requirement 3: 快捷键列表更新

**User Story:** As a user, I want to see a keyboard shortcut for opening the GitHub link, so that I can quickly access it without using the mouse.

#### Acceptance Criteria

1. THE App SHALL support a keyboard shortcut (G key) to open the GitHub repository
2. THE shortcuts list in the help modal SHALL include the GitHub shortcut entry
3. WHEN a user presses the G key (without modifiers), THE App SHALL open the GitHub repository

### Requirement 4: 整体样式优化

**User Story:** As a user, I want the app to have a polished and cohesive visual design, so that using it feels professional and enjoyable.

#### Acceptance Criteria

1. THE App SHALL use consistent border radius values across all components
2. THE App SHALL use consistent shadow styles for elevated elements
3. THE Modal animations SHALL be smooth and consistent
4. THE color palette SHALL be harmonious across light and dark modes
5. THE Header toolbar buttons SHALL have uniform spacing and sizing
