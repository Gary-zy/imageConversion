# OFD 预览组件 - 集成指南

## 将组件集成到现有项目

### 方式 1: 直接复制（推荐）

最简单的方式，直接将组件复制到你的项目中：

```bash
# 1. 复制组件文件夹
cp -r ofd-preview-component /your-project/src/lib/

# 2. 安装所有必需的依赖（⚠️ 重要！）
cd /your-project
npm install jszip jszip-utils jspdf file-saver html2canvas ofd-xml-parser js-md5 js-sha1 @lapo/asn1js jsrsasign jsrsasign-util sm-crypto web-streams-polyfill

# 3. 在你的代码中使用
import { OfdProcessor } from './lib/ofd-preview-component';
```

### 方式 2: 作为 npm 包使用

如果你想将这个组件作为独立的 npm 包使用：

#### 2.1 在 package.json 中添加本地依赖

```json
{
  "dependencies": {
    "ofd-preview-component": "file:./ofd-preview-component"
  }
}
```

#### 2.2 安装

```bash
npm install
```

#### 2.3 使用

```tsx
import { OfdProcessor } from 'ofd-preview-component';
```

---

## 在不同框架中使用

### React + TypeScript

```tsx
import React from 'react';
import { OfdProcessor } from './lib/ofd-preview-component';

const MyComponent: React.FC = () => {
  return (
    <div>
      <OfdProcessor
        onFileLoaded={(file, converter) => {
          console.log('文件已加载:', file.name);
        }}
        onConvertComplete={(blob) => {
          console.log('转换完成');
        }}
      />
    </div>
  );
};
```

### React + JavaScript

```jsx
import React from 'react';
import { OfdProcessor } from './lib/ofd-preview-component';

function MyComponent() {
  return (
    <div>
      <OfdProcessor />
    </div>
  );
}
```

### Next.js

```tsx
// pages/ofd.tsx 或 app/ofd/page.tsx
import { OfdProcessor } from '@/lib/ofd-preview-component';
import { useState } from 'react';

export default function OfdPage() {
  // 如果使用客户端组件（Next.js 13+）
  const [isClient, setIsClient] = useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>加载中...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">OFD 文档转换</h1>
      <OfdProcessor />
    </div>
  );
}
```

### Vite + React

```tsx
// src/App.tsx
import { OfdProcessor } from './lib/ofd-preview-component';

function App() {
  return (
    <div className="App">
      <OfdProcessor />
    </div>
  );
}

export default App;
```

### Create React App

```tsx
// src/App.js
import React from 'react';
import { OfdProcessor } from './lib/ofd-preview-component';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>OFD 转换器</h1>
      </header>
      <main>
        <OfdProcessor />
      </main>
    </div>
  );
}

export default App;
```

---

## 配置选项

### Tailwind CSS

组件使用了 Tailwind CSS，确保你的项目已配置 Tailwind：

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/lib/ofd-preview-component/**/*.{js,jsx,ts,tsx}",
  ],
  // ... 其他配置
};
```

### 不使用 Tailwind CSS？

如果你想使用普通的 CSS，可以通过 `className` 属性覆盖样式，或者修改组件源文件中的类名。

---

## 样式自定义

### 方式 1: 通过 className

```tsx
<OfdProcessor className="my-custom-wrapper" />
```

### 方式 2: 通过 style

```tsx
<OfdProcessor style={{ maxWidth: '1200px' }} />
```

### 方式 3: CSS 覆盖

```css
/* 在你的 CSS 文件中 */
.ofd-processor {
  max-width: 1200px;
  margin: 0 auto;
}

.ofd-upload-area {
  border-color: #your-color;
}
```

---

## 常见集成问题

### 问题 1: 找不到模块

**错误**: `Cannot find module 'ofd-preview-component'`

**解决**: 检查你的导入路径是否正确

```tsx
// 如果直接复制到 src/lib/
import { OfdProcessor } from './lib/ofd-preview-component';

// 如果作为 npm 包安装
import { OfdProcessor } from 'ofd-preview-component';
```

### 问题 2: 类型错误

**错误**: TypeScript 类型错误

**解决**: 确保安装了类型定义

```bash
npm install --save-dev @types/react @types/react-dom
```

### 问题 3: 样式不生效

**解决**: 确保你的项目配置了 Tailwind CSS 或提供了相应的 CSS

### 问题 4: html2canvas 相关错误

**错误**: html2canvas 相关的运行时错误

**解决**: 确保安装了 html2canvas

```bash
npm install html2canvas
```

---

## 性能优化建议

### 1. 代码分割

对于大型应用，建议使用动态导入：

```tsx
import React, { Suspense, lazy } from 'react';

const OfdProcessor = lazy(() => import('./lib/ofd-preview-component').then(m => ({ default: m.OfdProcessor })));

function MyPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <OfdProcessor />
    </Suspense>
  );
}
```

### 2. 内存管理

对于大文件处理，记得在组件卸载时清理资源：

```tsx
import React, { useEffect, useRef } from 'react';
import { OfdConverter } from './lib/ofd-preview-component';

function MyComponent() {
  const converterRef = useRef<OfdConverter | null>(null);

  useEffect(() => {
    return () => {
      // 清理资源
      converterRef.current?.dispose();
    };
  }, []);

  // ...
}
```

---

## 部署注意事项

### 1. 确保所有依赖都被打包

```javascript
// vite.config.js
export default {
  build: {
    commonjsOptions: {
      include: [/node_modules/, /src\/lib\/ofd-preview-component/],
    },
  },
};
```

### 2. 静态文件处理

OFD 核心库包含了一些静态资源，确保它们被正确复制到构建目录。

---

## 需要帮助？

如果遇到其他问题，请：
1. 查看 `README.md` 获取完整的 API 文档
2. 查看 `example.tsx` 获取使用示例
3. 检查浏览器控制台的错误信息

祝你集成顺利！ 🚀
