# 图片转换器 - 多功能在线图片/OFD文档处理工具

[English](./README_EN.md) | 简体中文

免费在线图片格式转换工具，支持多种图片格式互转、OFD文档处理。所有转换在浏览器本地完成，保护隐私，无需上传服务器。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vue](https://img.shields.io/badge/Vue-3.4-42b883.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-6-646cff.svg)

## 目录

- [功能特性](#功能特性)
- [技术架构](#技术架构)
- [核心功能实现](#核心功能实现)
  - [图片转换实现](#图片转换实现)
  - [OFD文档处理实现](#ofd文档处理实现)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [部署方案](#部署方案)

---

## 功能特性

### 图片格式转换

| 分类 | 支持格式 |
|------|----------|
| **常用格式** | JPEG、PNG、WebP、AVIF、GIF、BMP、TIFF |
| **专业格式** | PSD、EXR、HDR、DDS、XPM |
| **图标格式** | ICO（多尺寸）、ICNS（macOS）、CUR（Windows 光标） |
| **文档格式** | PDF |
| **便携格式** | PBM、PGM、PPM、XBM、WBMP |
| **现代格式** | QOI、JP2、PCX、SVG |

### 图片编辑功能

- **基础调整**: 尺寸调整（支持宽高比）、旋转、翻转、裁剪
- **图像增强**: 亮度、对比度、饱和度调节
- **滤镜效果**: 模糊、锐化、灰度、复古、反色
- **水印功能**: 文字水印、图片水印，支持平铺、对角线、全页等多种样式
- **背景处理**: 支持自定义背景色

### OFD 文档处理

- **OFD 转图片**: 将 OFD 文档转换为 PNG/JPEG/WebP 格式
- **OFD 转 PDF**: 将 OFD 文档导出为 PDF 文件
- **页面选择**: 支持全部页面、当前页面、自定义页码范围
- **电子签章验证**: 支持国密 SM2 算法签章验证
- **签章信息查看**: 查看签章证书信息、签名时间等详情

### 其他特性

- **批量处理**: 支持批量上传和批量转换
- **ZIP 打包**: 批量下载时自动打包为 ZIP 文件
- **拖拽上传**: 支持拖拽、点击或 Ctrl+V 粘贴上传
- **响应式设计**: 完美支持桌面端和移动端
- **PWA 支持**: 可安装为本地应用，离线使用
- **隐私保护**: 所有处理在浏览器本地完成，不上传文件

---

## 技术架构

### 技术栈

| 领域 | 技术 |
|------|------|
| **UI 框架** | Vue 3.4 (Composition API + `<script setup>`) |
| **构建工具** | Vite 6 |
| **语言** | TypeScript 5.6 |
| **样式方案** | Tailwind CSS 3.4 |
| **状态管理** | Vue 3 Reactive (替代 Zustand) |
| **图片处理** | Canvas API、Pica（高质量缩放） |
| **PDF 生成** | jsPDF |
| **OFD 解析** | ofd.js（自定义实现） |
| **国密算法** | sm-crypto（SM2/SM3/SM4）、jsrsasign |
| **图标处理** | psd.js、utif |
| **文件处理** | JSZip、file-saver |

### 架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                        应用层 (Vue 3)                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ FileUpload  │  │  FormatSel  │  │     ImagePreview        │  │
│  │   组件      │  │   组件      │  │       组件              │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  FileList   │  │ OfdProcessor│  │    OfdPreview           │  │
│  │   组件      │  │   组件      │  │       组件              │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      状态层 (Reactive Store)                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   useImageStore                           │   │
│  │  files | targetFormat | settings | isConverting          │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      工具层 (Utils)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ imageConv   │  │ ofdConverter│  │      download           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      浏览器原生 API                              │
│  Canvas API | File API | Web Workers | IndexedDB                │
└─────────────────────────────────────────────────────────────────┘
```

### 状态管理设计

项目使用 Vue 3 的 `reactive` + `computed` 替代 Zustand：

```typescript
// stores/imageStore.ts
import { reactive, computed } from 'vue';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  convertedBlob?: Blob;
  status: 'pending' | 'converting' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

interface Settings {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  maintainAspectRatio: boolean;
  autoResize: boolean;
  backgroundColor: string;
  watermarkEnabled: boolean;
  watermarkText: string;
  watermarkPosition: 'center' | 'corner' | 'diagonal' | 'tile';
  fileNamePrefix: string;
  fileNameSuffix: string;
}

export const useImageStore = () => {
  const state = reactive({
    files: [] as ImageFile[],
    targetFormat: 'png' as ImageFormat,
    settings: {
      quality: 90,
      maxWidth: 0,
      maxHeight: 0,
      maintainAspectRatio: true,
      autoResize: false,
      backgroundColor: '#ffffff',
      watermarkEnabled: false,
      watermarkText: '',
      watermarkPosition: 'center' as const,
      fileNamePrefix: '',
      fileNameSuffix: '',
    } as Settings,
    isConverting: false,
  });

  return state;
};
```

---

## 核心功能实现

### 图片转换实现

#### 转换流程

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  文件    │ -> │  读取    │ -> │ Canvas   │ -> │ 格式编码 │ -> │  保存    │
│  上传    │    │  解码    │    │  绘制    │    │  输出    │    │  下载    │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

#### 核心代码实现

**1. 图片读取与解码**

```typescript
// utils/imageConverter.ts
export const readImageFile = async (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const decodeImageData = async (
  data: ArrayBuffer
): Promise<ImageData> => {
  const bitmap = await createImageBitmap(new Blob([data]));
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(bitmap, 0, 0);
  return ctx!.getImageData(0, 0, bitmap.width, bitmap.height);
};
```

**2. Canvas 绘制与处理**

```typescript
export const drawToCanvas = async (
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  options: ConversionOptions
): Promise<void> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法获取 Canvas 上下文');

  // 调整尺寸
  const { width, height } = calculateTargetSize(
    img.width,
    img.height,
    options.maxWidth,
    options.maxHeight,
    options.maintainAspectRatio
  );

  canvas.width = width;
  canvas.height = height;

  // 绘制背景
  if (options.backgroundColor) {
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  // 使用 Pica 进行高质量缩放
  if (options.scale && options.scale !== 1) {
    const pica = window.pica();
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = img.width;
    srcCanvas.height = img.height;
    const srcCtx = srcCanvas.getContext('2d');
    srcCtx?.drawImage(img, 0, 0);
    await pica.resize(srcCanvas, canvas, {
      unsharpAmount: 80,
      unsharpRadius: 0.6,
      unsharpThreshold: 2,
    });
  } else {
    ctx.drawImage(img, 0, 0, width, height);
  }

  // 应用水印
  if (options.watermarkEnabled && options.watermarkText) {
    drawWatermark(ctx, width, height, options.watermarkText, options.watermarkPosition);
  }
};

const calculateTargetSize = (
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number,
  maintainAspectRatio: boolean
): { width: number; height: number } => {
  if (!maxWidth && !maxHeight) {
    return { width: srcWidth, height: srcHeight };
  }

  let width = srcWidth;
  let height = srcHeight;

  if (maxWidth && width > maxWidth) {
    width = maxWidth;
    if (maintainAspectRatio) {
      height = Math.round((width / srcWidth) * srcHeight);
    }
  }

  if (maxHeight && height > maxHeight) {
    height = maxHeight;
    if (maintainAspectRatio) {
      width = Math.round((height / srcHeight) * srcWidth);
    }
  }

  return { width, height };
};
```

**3. 格式编码与输出**

```typescript
export const convertToBlob = async (
  canvas: HTMLCanvasElement,
  format: ImageFormat,
  quality: number
): Promise<Blob> => {
  const mimeType = getMimeType(format);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('格式转换失败'));
        }
      },
      mimeType,
      quality / 100
    );
  });
};

const getMimeType = (format: ImageFormat): string => {
  const mimeTypes: Record<ImageFormat, string> = {
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
    avif: 'image/avif',
    ico: 'image/x-icon',
    pdf: 'application/pdf',
  };
  return mimeTypes[format] || 'image/png';
};
```

**4. 批量转换**

```typescript
export const convertAllImages = async (
  files: ImageFile[],
  format: ImageFormat,
  options: ConversionOptions,
  onProgress?: (current: number, total: number) => void
): Promise<void> => {
  for (let i = 0; i < files.length; i++) {
    const imageFile = files[i];
    try {
      imageFile.status = 'converting';
      imageFile.progress = 0;

      // 读取图片
      const img = await readImageFile(imageFile.file);

      // 创建 Canvas
      const canvas = document.createElement('canvas');
      await drawToCanvas(img, canvas, options);

      // 转换格式
      const blob = await convertToBlob(canvas, format, options.quality);

      imageFile.convertedBlob = blob;
      imageFile.status = 'completed';
      imageFile.progress = 100;

      onProgress?.(i + 1, files.length);
    } catch (error) {
      imageFile.status = 'failed';
      imageFile.error = error instanceof Error ? error.message : '转换失败';
    }
  }
};
```

---

### OFD文档处理实现

#### OFD 文件结构

OFD（Open Fixed Layout Document）是一种开放版式文档格式，类似 PDF。其文件结构：

```
OFD 文件 (ZIP 压缩包)
├── Doc_0/
│   ├── Document.xml          # 文档主结构
│   ├── PublicRes.xml         # 公共资源索引
│   ├── DocumentRes.xml       # 文档资源索引
│   ├── Pages/                # 页面目录
│   │   ├── Page_0/
│   │   │   ├── Content.xml   # 页面内容
│   │   │   └── Res.xml       # 页面资源
│   │   └── Page_1/
│   └── Res/                  # 资源目录
│       ├── Fonts/            # 字体资源
│       ├── Images/           # 图片资源
│       └── Symbols/          # 符号资源
└── OFD.xml                   # 文档包描述
```

#### OFD 解析器实现

**1. ZIP 解压与 XML 解析**

```typescript
// utils/ofdConverter.ts
export class OfdConverter {
  private zipReader: any;
  private documentXml: Document | null = null;
  private pages: OFDPage[] = [];
  private resources: Map<string, any> = new Map();
  private currentPageIndex = 0;

  async loadOfd(
    file: File,
    onProgress?: (current: number, total: number, status: string) => void
  ): Promise<void> {
    onProgress?.(0, 10, '正在解压 OFD 文件...');

    // 解压 ZIP
    const zip = await JSZip.loadAsync(file);
    const entries = Object.keys(zip.files);

    onProgress?.(2, 10, '正在解析文档结构...');

    // 解析 OFD.xml
    const ofdXml = await this.parseXml(zip.file('OFD.xml'));
    const docDir = this.getDocDir(ofdXml);

    onProgress?.(4, 10, '正在解析页面结构...');

    // 解析 Document.xml
    const docXml = await this.parseXml(zip.file(`${docDir}/Document.xml`));
    const pageCount = this.getPageCount(docXml);

    // 解析每一页
    for (let i = 0; i < pageCount; i++) {
      onProgress?.(5 + (i / pageCount) * 4, 10, `正在解析页面 ${i + 1}/${pageCount}...`);

      const pageEntry = `${docDir}/Pages/Page_${i}/Content.xml`;
      const pageXml = await this.parseXml(zip.file(pageEntry));

      this.pages.push({
        index: i,
        content: pageXml,
        size: this.getPageSize(pageXml),
        elements: this.parsePageElements(pageXml),
      });
    }

    onProgress?.(9, 10, '正在加载资源...');

    // 加载资源
    await this.loadResources(zip, docDir);

    onProgress?.(10, 10, '加载完成');
  }

  private async parseXml(file: any): Promise<Document> {
    const text = await file.async('text');
    return new DOMParser().parseFromString(text, 'text/xml');
  }

  private getDocDir(ofdXml: Document): string {
    const docBody = ofdXml.getElementsByTagName('DocBody')[0];
    const docInfo = docBody?.getElementsByTagName('DocInfo')[0];
    const docID = docInfo?.getElementsByTagName('DocID')[0]?.textContent;
    return `Doc_${docID || 0}`;
  }

  private getPageCount(docXml: Document): number {
    const pages = docXml.getElementsByTagName('Page');
    return pages.length;
  }

  private getPageSize(pageXml: Document): { width: number; height: number } {
    const pageArea = pageXml.getElementsByTagName('PageArea')[0];
    const physicalBox = pageArea?.getElementsByTagName('PhysicalBox')[0]?.textContent;

    if (physicalBox) {
      const [x1, y1, x2, y2] = physicalBox.split(' ').map(Number);
      return { width: x2 - x1, height: y2 - y1 };
    }

    return { width: 210, height: 297 }; // 默认 A4
  }
}
```

**2. 页面元素解析**

```typescript
private parsePageElements(pageXml: Document): OFDElement[] {
  const elements: OFDElement[] = [];
  const content = pageXml.getElementsByTagName('Content')[0];

  // 解析图层
  const layers = content?.getElementsByTagName('Layer');
  for (const layer of layers || []) {
    const layerElement = this.parseLayer(layer);
    elements.push(...layerElement);
  }

  return elements;
}

private parseLayer(layer: Element): OFDElement[] {
  const elements: OFDElement[] = [];
  const children = layer.children;

  for (const child of children) {
    switch (child.tagName) {
      case 'Path':
        elements.push(this.parsePath(child));
        break;
      case 'ImageObject':
        elements.push(this.parseImageObject(child));
        break;
      case 'TextObject':
        elements.push(this.parseTextObject(child));
        break;
      case 'CompositeObject':
        elements.push(this.parseCompositeObject(child));
        break;
    }
  }

  return elements;
}

private parsePath(pathEl: Element): OFDPath {
  const data = pathEl.getElementsByTagName('Data')[0]?.textContent || '';
  const fillColor = pathEl.getElementsByTagName('FillColor')[0];
  const strokeColor = pathEl.getElementsByTagName('StrokeColor')[0];

  return {
    type: 'path',
    data: this.parsePathData(data),
    fillColor: this.parseColor(fillColor),
    strokeColor: this.parseColor(strokeColor),
    strokeWidth: parseFloat(pathEl.getElementsByTagName('StrokeWidth')[0]?.textContent || '1'),
  };
}

private parseImageObject(imgEl: Element): OFDImage {
  const resourceId = imgEl.getElementsByTagName('ResourceID')[0]?.textContent;
  const clip = imgEl.getElementsByTagName('Clip')[0];
  const boundary = imgEl.getElementsByTagName('Boundary')[0]?.textContent?.split(' ').map(Number);

  return {
    type: 'image',
    resourceId,
    resource: this.resources.get(`image_${resourceId}`),
    boundary: boundary ? { x: boundary[0], y: boundary[1], width: boundary[2], height: boundary[3] } : undefined,
    clip: clip ? this.parsePathData(clip.getElementsByTagName('Data')[0]?.textContent || '') : undefined,
  };
}

private parseTextObject(textEl: Element): OFDText {
  const textCode = textEl.getElementsByTagName('TextCode')[0];
  const font = textEl.getElementsByTagName('Font')[0]?.textContent;
  const fillColor = textEl.getElementsByTagName('FillColor')[0];

  return {
    type: 'text',
    content: textCode?.textContent || '',
    fontSize: parseFloat(textEl.getElementsByTagName('Size')[0]?.textContent || '12'),
    fontId: font,
    fillColor: this.parseColor(fillColor),
    boundary: textEl.getElementsByTagName('Boundary')[0]?.textContent?.split(' ').map(Number),
  };
}
```

**3. Canvas 渲染**

```typescript
async renderToContainer(
  container: HTMLElement,
  pageIndex: number,
  scale: number = 1
): Promise<void> {
  const page = this.pages[pageIndex];
  if (!page) throw new Error(`页面 ${pageIndex} 不存在`);

  // 清空容器
  container.innerHTML = '';

  // 创建页面容器
  const pageDiv = document.createElement('div');
  pageDiv.id = `page-${pageIndex}`;
  pageDiv.style.cssText = `
    position: relative;
    width: ${page.size.width * scale}px;
    height: ${page.size.height * scale}px;
    background: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  `;

  // 渲染每个元素
  for (const element of page.elements) {
    const elementDiv = await this.renderElement(element, scale);
    pageDiv.appendChild(elementDiv);
  }

  container.appendChild(pageDiv);
}

private async renderElement(element: OFDElement, scale: number): Promise<HTMLElement> {
  switch (element.type) {
    case 'path':
      return this.renderPath(element as OFDPath, scale);
    case 'image':
      return this.renderImage(element as OFDImage, scale);
    case 'text':
      return this.renderText(element as OFDText, scale);
    default:
      const div = document.createElement('div');
      div.textContent = `未知元素类型: ${element.type}`;
      return div;
  }
}

private renderPath(path: OFDPath, scale: number): HTMLElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');

  const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathElement.setAttribute('d', this.convertPathData(path.data, scale));

  if (path.fillColor) {
    pathElement.setAttribute('fill', this.colorToCss(path.fillColor));
  }
  if (path.strokeColor) {
    pathElement.setAttribute('stroke', this.colorToCss(path.strokeColor));
    pathElement.setAttribute('stroke-width', String(path.strokeWidth * scale));
  }

  svg.appendChild(pathElement);
  return svg;
}

private renderImage(img: OFDImage, scale: number): HTMLElement {
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.left = `${(img.boundary?.[0] || 0) * scale}px`;
  div.style.top = `${(img.boundary?.[1] || 0) * scale}px`;
  div.style.width = `${(img.boundary?.[2] || 0) * scale}px`;
  div.style.height = `${(img.boundary?.[3] || 0) * scale}px`;
  div.style.overflow = 'hidden';

  if (img.resource) {
    const imgEl = document.createElement('img');
    imgEl.src = img.resource.dataUrl;
    imgEl.style.width = '100%';
    imgEl.style.height = '100%';
    imgEl.style.objectFit = 'contain';
    div.appendChild(imgEl);
  }

  return div;
}

private renderText(text: OFDText, scale: number): HTMLElement {
  const div = document.createElement('div');
  div.textContent = text.content;
  div.style.position = 'absolute';

  if (text.boundary) {
    div.style.left = `${text.boundary[0] * scale}px`;
    div.style.top = `${text.boundary[1] * scale}px`;
    div.style.width = `${text.boundary[2] * scale}px`;
    div.style.height = `${text.boundary[3] * scale}px`;
  }

  div.style.fontSize = `${text.fontSize * scale}px`;
  div.style.color = text.fillColor ? this.colorToCss(text.fillColor) : 'black';

  return div;
}
```

**4. 转换为图片**

```typescript
async convertToImage(
  options: {
    format: 'png' | 'jpeg' | 'webp';
    quality: number;
    scale: number;
    pages: 'all' | 'current' | 'custom';
    background?: string;
    customPagesInput?: string;
  },
  currentPage: number,
  onProgress?: (current: number, total: number, status: string) => void
): Promise<Blob[]> {
  const blobs: Blob[] = [];
  const pageCount = this.pages.length;

  // 确定要转换的页面
  let pagesToConvert: number[] = [];
  if (options.pages === 'all') {
    pagesToConvert = Array.from({ length: pageCount }, (_, i) => i);
  } else if (options.pages === 'current') {
    pagesToConvert = [currentPage];
  } else if (options.pages === 'custom') {
    pagesToConvert = this.parsePageRange(options.customPagesInput || '', pageCount);
  }

  // 创建临时渲染容器
  const container = document.createElement('div');

  for (let i = 0; i < pagesToConvert.length; i++) {
    const pageIndex = pagesToConvert[i];
    onProgress?.(i + 1, pagesToConvert.length, `正在转换页面 ${pageIndex + 1}`);

    // 渲染到容器
    await this.renderToContainer(container, pageIndex, options.scale);

    // 转换为 Canvas
    const canvas = await this.htmlToCanvas(container, options.background || '#ffffff');

    // 导出为 Blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (b) => resolve(b),
        `image/${options.format}`,
        options.quality / 100
      );
    });

    if (blob) {
      blobs.push(blob);
    }
  }

  return blobs;
}

private async htmlToCanvas(element: HTMLElement, backgroundColor: string): Promise<HTMLCanvasElement> {
  const rect = element.getBoundingClientRect();
  const canvas = document.createElement('canvas');
  canvas.width = rect.width;
  canvas.height = rect.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法获取 Canvas 上下文');

  // 填充背景
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 使用 html2canvas 或直接绘制
  // 这里使用 DOMParser 和手动绘制的方式
  const svgData = new XMLSerializer().serializeToString(element);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = url;
  });
}
```

**5. 转换为 PDF**

```typescript
async convertToPdf(
  options: {
    pageSize: 'A4' | 'A3' | 'original';
    orientation: 'portrait' | 'landscape';
    quality: number;
    compression: boolean;
  },
  onProgress?: (current: number, total: number, status: string) => void
): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({
    orientation: options.orientation,
    unit: 'mm',
    format: options.pageSize === 'original' ? 'a4' : options.pageSize.toLowerCase(),
  });

  const container = document.createElement('div');
  const pageCount = this.pages.length;

  for (let i = 0; i < pageCount; i++) {
    onProgress?.(i + 1, pageCount, `正在处理页面 ${i + 1}`);

    // 渲染页面
    await this.renderToContainer(container, i, 2);

    // 转换为 Canvas
    const canvas = await this.htmlToCanvas(container, '#ffffff');

    // 获取图片数据
    const imgData = canvas.toDataURL('image/jpeg', options.quality / 100);

    // 添加到 PDF
    if (i > 0) {
      pdf.addPage();
    }

    const pageSize = pdf.internal.pageSize;
    pdf.addImage(
      imgData,
      'JPEG',
      0,
      0,
      pageSize.getWidth(),
      pageSize.getHeight()
    );
  }

  return pdf.output('blob');
}
```

**6. 电子签章验证**

```typescript
// utils/ofd-core/verify_signature_util.js
export const verifySignature = async (signature: SES_Signature): Promise<VerificationResult> => {
  const result: VerificationResult = {
    valid: false,
    signTime: null,
    signerName: null,
    algorithm: null,
    error: null,
  };

  try {
    // 1. 解析签章证书
    const certInfo = await parseCertificate(signature.cert);
    result.signerName = certInfo.subject.commonName || certInfo.subject.organization;

    // 2. 获取签章时间
    result.signTime = signature.signTime;

    // 3. 获取签名算法
    result.algorithm = signature.digestAlgorithm;

    // 4. 计算原文 SM3 哈希
    const documentHash = await calculateSM3Hash(signature.signedData);

    // 5. 使用公钥验签
    const publicKey = await importSM2PublicKey(certInfo.publicKey);
    const isValid = await sm2Verify(
      signature.signatureValue,
      documentHash,
      publicKey,
      'sm2'
    );

    result.valid = isValid;

    // 6. 验证证书有效期
    const now = new Date();
    if (now < certInfo.notBefore || now > certInfo.notAfter) {
      result.valid = false;
      result.error = '证书已过期或尚未生效';
    }

    // 7. 验证证书链（简化版）
    const issuerValid = await verifyCertificateChain(certInfo);
    if (!issuerValid) {
      result.valid = false;
      result.error = '证书链验证失败';
    }
  } catch (error) {
    result.error = error instanceof Error ? error.message : '验签失败';
  }

  return result;
};

// SM2 签名验证
const sm2Verify = async (
  signature: string,
  hash: string,
  publicKey: CryptoKey,
  algorithm: string
): Promise<boolean> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(hash);
  const signatureBytes = hexToBytes(signature);

  try {
    const isValid = await crypto.subtle.verify(
      { name: algorithm, hash: 'SM3' },
      publicKey,
      signatureBytes,
      data
    );
    return isValid;
  } catch {
    return false;
  }
};
```

---

## 项目结构

```
image/
├── src/
│   ├── components/           # Vue 3 组件
│   │   ├── FileUpload.vue    # 文件上传组件
│   │   ├── FileList.vue      # 文件列表组件
│   │   ├── FormatSelector.vue # 格式选择器
│   │   ├── AdvancedSettings.vue # 高级设置面板
│   │   ├── ImagePreview.vue  # 图片预览组件
│   │   ├── ProgressBar.vue   # 进度条组件
│   │   ├── OfdProcessor.vue  # OFD 处理器
│   │   └── OfdPreview.vue    # OFD 预览组件
│   ├── stores/               # 状态管理
│   │   └── imageStore.ts     # 图片状态存储 (Vue Reactive)
│   ├── utils/                # 工具函数
│   │   ├── imageConverter.ts # 图片转换核心逻辑
│   │   ├── ofdConverter.ts   # OFD 转换器
│   │   ├── download.ts       # 下载处理
│   │   ├── validator.ts      # 文件验证
│   │   ├── security.ts       # 安全相关
│   │   ├── pwa.ts            # PWA 配置
│   │   └── ofd-core/         # OFD 解析核心
│   │       ├── ofd.js        # OFD 解析入口
│   │       ├── ofd_parser.js # OFD XML 解析
│   │       ├── ofd_render.js # OFD 渲染引擎
│   │       ├── sm3.js        # SM3 哈希算法
│   │       ├── ses_signature_parser.js # SES 签章解析
│   │       └── verify_signature_util.js # 签章验证
│   ├── ofd-export/           # OFD 导出模块
│   │   └── core/             # 导出核心实现
│   ├── types/                # TypeScript 类型定义
│   │   ├── index.ts          # 主类型文件
│   │   ├── ofd.d.ts          # OFD 类型
│   │   └── pica.d.ts         # Pica 类型
│   ├── App.vue               # 主应用组件
│   ├── main.ts               # 入口文件
│   └── index.css             # 全局样式
├── public/                   # 静态资源
├── vite.config.ts            # Vite 配置
├── tailwind.config.js        # Tailwind 配置
├── tsconfig.json             # TypeScript 配置
└── package.json              # 项目依赖
```

---

## 快速开始

### 环境要求

- Node.js 18+
- pnpm（推荐）或 npm

### 安装依赖

```bash
pnpm install
# 或
npm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览生产构建

```bash
pnpm preview
```

---

## 部署方案

### Vercel 部署（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

或通过 GitHub 直接导入：
1. 访问 [Vercel](https://vercel.com)
2. 点击 "Add New Project"
3. 导入 GitHub 仓库

### Netlify 部署

```bash
npm i -g netlify-cli
netlify deploy --prod
```

### GitHub Pages 部署

修改 `vite.config.ts` 中的 base 路径：

```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ...
})
```

构建部署：

```bash
pnpm build
npx gh-pages -d dist
```

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t image-converter .
docker run -p 80:80 image-converter
```

---

## 浏览器支持

| 浏览器 | 版本 | 状态 |
|--------|------|------|
| Chrome | 90+ | 完全支持 |
| Firefox | 88+ | 完全支持 |
| Safari | 15+ | 完全支持 |
| Edge | 90+ | 完全支持 |

## 性能优化

- **代码分割**: 按路由/组件异步加载
- **图片缩放**: 使用 Pica 库实现高质量 Lanczos 缩放
- **格式支持**: 原生格式优先，复杂格式降级处理
- **Vue 响应式优化**: 使用 `toRef` 避免不必要的响应式开销
- **渲染优化**: OFD 渲染使用 `requestAnimationFrame` 和 `nextTick`

## 安全特性

- **本地处理**: 所有文件处理在浏览器完成
- **无服务端**: 不向任何服务器传输文件
- **沙箱隔离**: 使用 iframe 隔离第三方内容
- **输入验证**: 严格的文件类型和大小验证

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT License。

## 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Pica](https://nodeca.github.io/pica/) - 高质量图片缩放库
- [jsPDF](https://github.com/parallax/jsPDF) - PDF 生成库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [JSZip](https://stuk.github.io/jszip/) - ZIP 文件处理
- [Vite](https://vitejs.dev/) - 下一代前端构建工具

---

**注意**: 本项目所有图片和文档处理均在浏览器本地完成，不会将任何文件上传到服务器。
