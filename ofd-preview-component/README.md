# OFD 预览组件

一个纯前端实现的 OFD 文档预览和转换组件，支持将 OFD 文件转换为 PNG、JPEG、WebP 和 PDF 格式。

## 功能特性

- ✅ OFD 文档预览
- ✅ 页面导航（上一页/下一页）
- ✅ 缩放控制（50% - 300%）
- ✅ 转换为图片（PNG/JPEG/WebP）
- ✅ 转换为 PDF
- ✅ 自定义页面范围转换
- ✅ 图片质量和分辨率控制
- ✅ PDF 页面尺寸和方向设置
- ✅ 纯前端实现，保护隐私
- ✅ 支持拖拽上传

## 安装

### 1. 复制组件文件

将 `ofd-preview-component` 目录复制到你的项目中：

```bash
cp -r ofd-preview-component your-project/src/components/
```

### 2. 安装依赖（⚠️ 必须安装所有依赖）

```bash
npm install jszip jszip-utils jspdf file-saver html2canvas ofd-xml-parser js-md5 js-sha1 @lapo/asn1js jsrsasign jsrsasign-util sm-crypto web-streams-polyfill
```

**核心依赖说明**：
- `jszip` + `jszip-utils` - OFD 文件解压
- `ofd-xml-parser` - OFD XML 解析（**必需**）
- `jspdf` - PDF 生成
- `file-saver` - 文件下载
- `html2canvas` - 截图功能
- 其他依赖用于签名验证和加密处理

## 使用方法

### 基础使用 - 使用 OfdProcessor 组件

`OfdProcessor` 是一个完整的 OFD 处理组件，包含文件上传、预览和转换功能。

```tsx
import React from 'react';
import { OfdProcessor } from './components/ofd-preview-component';

function App() {
  return (
    <div className="App">
      <h1>OFD 文档转换器</h1>
      <OfdProcessor
        onFileLoaded={(file, converter) => {
          console.log('文件加载成功:', file.name);
          console.log('总页数:', converter.getPageCount());
        }}
        onConvertComplete={(blob, format) => {
          console.log('转换完成:', format);
        }}
        onError={(error) => {
          console.error('发生错误:', error);
        }}
      />
    </div>
  );
}

export default App;
```

### 高级使用 - 仅预览组件

如果你只需要预览功能，可以单独使用 `OfdPreview` 组件：

```tsx
import React, { useState, useRef } from 'react';
import { OfdPreview, OfdConverter } from './components/ofd-preview-component';

function OfdViewer() {
  const [converter, setConverter] = useState<OfdConverter | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [scale, setScale] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    const conv = new OfdConverter();
    await conv.loadOfd(file);
    setConverter(conv);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".ofd"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />
      {converter && (
        <OfdPreview
          converter={converter}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          scale={scale}
          onScaleChange={setScale}
        />
      )}
    </div>
  );
}
```

### 编程方式使用 OfdConverter

你还可以直接使用 `OfdConverter` 类进行更灵活的控制：

```tsx
import { OfdConverter } from './components/ofd-preview-component';

async function convertOfd(file: File) {
  const converter = new OfdConverter();

  // 加载 OFD 文件
  await converter.loadOfd(file, (current, total, status) => {
    console.log(`进度: ${current}/${total} - ${status}`);
  });

  // 获取页数
  const pageCount = converter.getPageCount();
  console.log('总页数:', pageCount);

  // 转换为图片
  const blobs = await converter.convertToImage(
    {
      format: 'png',
      quality: 90,
      scale: 2,
      pages: 'all',
      background: '#ffffff'
    },
    0,
    (current, total, status) => {
      console.log(`转换进度: ${current}/${total} - ${status}`);
    }
  );

  // 转换为 PDF
  const pdfBlob = await converter.convertToPdf(
    {
      pageSize: 'A4',
      orientation: 'portrait',
      quality: 90,
      compression: true
    },
    (current, total, status) => {
      console.log(`PDF 生成进度: ${current}/${total} - ${status}`);
    }
  );

  return pdfBlob;
}
```

## API 文档

### OfdProcessor 组件

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| className | string | 否 | 自定义类名 |
| style | React.CSSProperties | 否 | 自定义样式 |
| onFileLoaded | (file: File, converter: OfdConverter) => void | 否 | 文件加载成功回调 |
| onConvertComplete | (blob: Blob \| Blob[], format: OfdTargetFormat) => void | 否 | 转换完成回调 |
| onError | (error: string) => void | 否 | 错误回调 |

### OfdPreview 组件

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| converter | OfdConverter \| null | 是 | OFD 转换器实例 |
| currentPage | number | 是 | 当前页码（从 0 开始） |
| onPageChange | (page: number) => void | 是 | 页面变化回调 |
| scale | number | 是 | 缩放比例（0.5 - 3） |
| onScaleChange | (scale: number) => void | 是 | 缩放变化回调 |
| className | string | 否 | 自定义类名 |
| style | React.CSSProperties | 否 | 自定义样式 |

### OfdConverter 类

#### 方法

##### loadOfd(file: File, onProgress?: ProgressCallback): Promise<void>
加载并解析 OFD 文件。

##### getPageCount(): number
获取文档总页数。

##### getPageSize(pageIndex: number): { width: number; height: number }
获取指定页面的尺寸（单位：毫米）。

##### renderToContainer(container: HTMLElement, pageIndex?: number, scale?: number): Promise<void>
将文档渲染到指定的 DOM 容器中，用于预览。

##### scrollToPage(pageIndex: number): void
滚动到指定页面。

##### getCurrentPageIndex(): number
获取当前可视区域的页面索引。

##### convertToImage(options: OfdToImageOptions, currentPage: number, onProgress?: ProgressCallback): Promise<Blob[]>
将指定页面转换为图片。

##### convertToPdf(options: OfdToPdfOptions, onProgress?: ProgressCallback): Promise<Blob>
将文档转换为 PDF。

##### dispose(): void
清理资源。

### 类型定义

#### OfdTargetFormat
```typescript
type OfdTargetFormat = 'png' | 'jpeg' | 'webp' | 'pdf';
```

#### OfdPageRange
```typescript
type OfdPageRange = 'all' | 'current' | 'custom' | number[];
```

#### OfdToImageOptions
```typescript
interface OfdToImageOptions {
  format: 'png' | 'jpeg' | 'webp';
  quality: number; // 1-100，仅 JPEG/WebP 有效
  scale: number; // 缩放比例 1-3
  pages: OfdPageRange;
  background: string; // 背景色，默认 '#ffffff'
  customPagesInput?: string; // 当 pages 为 'custom' 时使用，例如 "1,3-5,8"
}
```

#### OfdToPdfOptions
```typescript
interface OfdToPdfOptions {
  pageSize: 'A4' | 'A3' | 'original';
  orientation: 'portrait' | 'landscape';
  quality: number; // 1-100
  compression: boolean;
}
```

## 样式自定义

组件使用 Tailwind CSS 类名，你可以通过以下方式自定义样式：

### 1. 通过 className 覆盖

```tsx
<OfdProcessor className="my-custom-class" />
```

### 2. 通过 style 覆盖

```tsx
<OfdProcessor style={{ background: '#f0f0f0' }} />
```

### 3. 覆盖特定元素的样式

组件使用了一些特定的类名，你可以在你的 CSS 中覆盖：

```css
.ofd-processor {
  /* 组件容器 */
}

.ofd-upload-area {
  /* 上传区域 */
}

.ofd-preview-container {
  /* 预览容器 */
}

.ofd-preview-controls {
  /* 预览控制栏 */
}
```

## 注意事项

1. **文件大小限制**：默认最大支持 50MB 的 OFD 文件
2. **浏览器兼容性**：需要现代浏览器支持 ES6+ 和 Canvas API
3. **性能建议**：
   - 大文件转换时建议显示进度条
   - 转换高分辨率图片会增加内存使用
   - 建议在 Web Worker 中处理大文件

## 示例项目

查看 `examples` 目录获取完整的使用示例。

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
