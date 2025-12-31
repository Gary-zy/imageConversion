# 图片转换器 - 多功能在线图片/OFD文档处理工具

[English](./README_EN.md) | 简体中文

免费在线图片格式转换工具，支持多种图片格式互转、OFD文档处理。所有转换在浏览器本地完成，保护隐私，无需上传服务器。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg)

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

## 技术栈

| 领域 | 技术 |
|------|------|
| **UI 框架** | React 18.3 |
| **语言** | TypeScript 5.6 |
| **构建工具** | Vite 6 |
| **样式方案** | Tailwind CSS 3.4 |
| **状态管理** | Zustand 5.0 |
| **图片处理** | Canvas API、Pica（高质量缩放） |
| **PDF 生成** | jsPDF |
| **OFD 解析** | ofd.js（自定义实现） |
| **国密算法** | sm-crypto（SM2/SM3/SM4）、jsrsasign |
| **图标处理** | psd.js、utif |
| **文件处理** | JSZip、file-saver |
| **类型定义** | @types/* 系列 |

## 项目结构

```
image/
├── src/
│   ├── components/           # React 组件
│   │   ├── FileUpload.tsx    # 文件上传组件
│   │   ├── FileList.tsx      # 文件列表组件
│   │   ├── FormatSelector.tsx # 格式选择器
│   │   ├── AdvancedSettings.tsx # 高级设置面板
│   │   ├── ImagePreview.tsx  # 图片预览组件
│   │   ├── ProgressBar.tsx   # 进度条组件
│   │   ├── OfdProcessor.tsx  # OFD 处理器
│   │   └── OfdPreview.tsx    # OFD 预览组件
│   ├── stores/               # Zustand 状态管理
│   │   └── imageStore.ts     # 图片状态存储
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
│   ├── App.tsx               # 主应用组件
│   ├── main.tsx              # 入口文件
│   └── index.css             # 全局样式
├── public/                   # 静态资源
├── vite.config.ts            # Vite 配置
├── tailwind.config.js        # Tailwind 配置
├── tsconfig.json             # TypeScript 配置
└── package.json              # 项目依赖
```

## 核心功能实现

### 图片转换流程

```
文件输入 → Canvas 绘制 → 图像处理 → 格式编码 → 文件输出
              ↓
        尺寸调整/滤镜/水印等
```

### OFD 解析架构

```
OFD 文件
    ↓
XML 解析 → 文档结构 → 页面渲染 → Canvas 绘制 → 图片/PDF 输出
    ↓
资源处理 → 字体/图片/签章
```

### 电子签章验证

```
签章数据 → SES 解析 → 证书验证 → SM3 哈希 → SM2 验签 → 结果输出
```

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
- **Web Workers**: 图片处理不阻塞主线程

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

- [Pica](https://nodeca.github.io/pica/) - 高质量图片缩放库
- [jsPDF](https://github.com/parallax/jsPDF) - PDF 生成库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Zustand](https://github.com/pmndrs/zustand) - 轻量级状态管理
- [JSZip](https://stuk.github.io/jszip/) - ZIP 文件处理

---

**注意**: 本项目所有图片和文档处理均在浏览器本地完成，不会将任何文件上传到服务器。
