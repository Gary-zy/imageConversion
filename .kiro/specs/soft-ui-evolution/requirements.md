# Requirements Document

## Introduction

将图片转换器项目的 UI 风格从当前的「水墨风格」(ink-wash-style) 替换为「Soft UI Evolution」风格。Soft UI Evolution 是一种现代化的柔和 UI 设计风格，具有改进的对比度、柔和的阴影效果和更好的无障碍性，适合工具类应用。

## Glossary

- **Soft_UI_Evolution**: 一种进化版的柔和 UI 设计风格，结合了 Neumorphism 的柔和感和 Flat Design 的清晰度，具有更好的对比度和无障碍性
- **Design_System**: 包含颜色、字体、阴影、间距等设计规范的统一系统
- **Tailwind_Config**: Tailwind CSS 的配置文件，定义自定义主题变量
- **Component**: Vue 组件，包括 FileUpload、FormatSelector、FileList、AdvancedSettings 等
- **Dark_Mode**: 深色模式，需要与 Soft UI Evolution 风格保持一致

## Requirements

### Requirement 1: 设计系统配置

**User Story:** As a developer, I want to configure the Soft UI Evolution design system in Tailwind, so that all components can use consistent styling.

#### Acceptance Criteria

1. THE Design_System SHALL define primary colors: Soft Blue (#87CEEB), Soft Pink (#FFB6C1), Soft Green (#90EE90)
2. THE Design_System SHALL define functional colors: Primary (#3B82F6), Secondary (#60A5FA), CTA (#F97316)
3. THE Design_System SHALL define neutral colors: Background (#F8FAFC), Text (#1E293B), Border (#E2E8F0)
4. THE Design_System SHALL define soft shadow utilities for depth effects
5. THE Design_System SHALL configure the Nunito Sans font family for body text
6. THE Design_System SHALL configure the Varela Round font family for headings
7. WHEN dark mode is enabled, THE Design_System SHALL provide appropriate dark variants for all colors

### Requirement 2: 移除水墨风格

**User Story:** As a developer, I want to remove all ink-wash style classes and configurations, so that the codebase is clean for the new style.

#### Acceptance Criteria

1. THE Tailwind_Config SHALL remove all ink-* color definitions
2. THE Tailwind_Config SHALL remove all ink-wash related custom utilities
3. WHEN a component uses ink-* classes, THE Component SHALL have those classes replaced with Soft UI Evolution equivalents
4. THE CSS file SHALL remove all ink-wash-gradient and ink-brush-border styles

### Requirement 3: 组件样式更新 - 导航栏

**User Story:** As a user, I want the navigation bar to have a soft, modern appearance, so that the interface feels friendly and professional.

#### Acceptance Criteria

1. THE Header Component SHALL use a soft white background with subtle shadow
2. THE Header Component SHALL have rounded corners (rounded-2xl) with soft border
3. WHEN hovering over navigation buttons, THE Component SHALL show smooth color transitions (200-300ms)
4. THE Logo area SHALL use the primary blue color with soft shadow effect
5. THE Tab switcher SHALL use soft background colors with smooth active state transitions

### Requirement 4: 组件样式更新 - 上传区域

**User Story:** As a user, I want the file upload area to be visually inviting with soft styling, so that I feel comfortable using the tool.

#### Acceptance Criteria

1. THE FileUpload Component SHALL have a soft dashed border with rounded corners (rounded-2xl)
2. WHEN dragging files over the upload area, THE Component SHALL show a soft highlight effect
3. THE upload icon SHALL use the primary blue color
4. THE Component SHALL have a subtle soft shadow for depth

### Requirement 5: 组件样式更新 - 卡片和面板

**User Story:** As a user, I want all cards and panels to have consistent soft styling, so that the interface looks cohesive.

#### Acceptance Criteria

1. THE Card Components SHALL use white background with soft shadow (shadow-soft)
2. THE Card Components SHALL have rounded corners (rounded-xl or rounded-2xl)
3. THE Card Components SHALL have subtle borders using the border color (#E2E8F0)
4. WHEN hovering over interactive cards, THE Component SHALL show elevated shadow effect
5. THE statistics panel SHALL use soft gradient backgrounds instead of solid dark colors

### Requirement 6: 组件样式更新 - 按钮

**User Story:** As a user, I want buttons to have soft, tactile appearance, so that interactions feel pleasant.

#### Acceptance Criteria

1. THE Primary Button SHALL use the primary blue color (#3B82F6) with soft shadow
2. THE Secondary Button SHALL use soft background with subtle border
3. WHEN hovering over buttons, THE Component SHALL show smooth color transition and shadow elevation
4. WHEN pressing buttons, THE Component SHALL show subtle press effect (scale 0.98)
5. THE CTA Button SHALL use the orange accent color (#F97316) for important actions

### Requirement 7: 组件样式更新 - 表单元素

**User Story:** As a user, I want form inputs to have soft, accessible styling, so that I can easily interact with settings.

#### Acceptance Criteria

1. THE Input fields SHALL have soft borders with rounded corners (rounded-lg)
2. WHEN focusing on inputs, THE Component SHALL show soft blue ring effect
3. THE Slider components SHALL use soft track and thumb styling
4. THE Checkbox and Radio components SHALL use soft styling with smooth transitions

### Requirement 8: 组件样式更新 - 弹窗

**User Story:** As a user, I want modal dialogs to have soft, modern appearance, so that they feel integrated with the overall design.

#### Acceptance Criteria

1. THE Modal backdrop SHALL use a soft blur effect with semi-transparent overlay
2. THE Modal content SHALL have white background with soft shadow and rounded corners
3. THE Modal header SHALL have subtle bottom border
4. WHEN modal appears, THE Component SHALL animate with smooth scale and fade transition

### Requirement 9: 深色模式适配

**User Story:** As a user, I want the dark mode to maintain the soft UI feel, so that the experience is consistent across themes.

#### Acceptance Criteria

1. WHEN dark mode is enabled, THE Background SHALL use dark slate colors (#0F172A, #1E293B)
2. WHEN dark mode is enabled, THE Text SHALL use light colors (#F1F5F9, #E2E8F0)
3. WHEN dark mode is enabled, THE Shadows SHALL be adjusted for visibility on dark backgrounds
4. WHEN dark mode is enabled, THE Soft colors SHALL be adjusted to maintain contrast ratios (WCAG AA)

### Requirement 10: 无障碍性保证

**User Story:** As a user with accessibility needs, I want the interface to meet WCAG AA standards, so that I can use the tool effectively.

#### Acceptance Criteria

1. THE Design_System SHALL ensure text contrast ratio of at least 4.5:1
2. THE Interactive elements SHALL have visible focus states
3. THE Color choices SHALL not rely solely on color to convey information
4. THE Transitions SHALL respect prefers-reduced-motion preference
