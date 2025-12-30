# OFD 预览组件 - 快速开始

## 最简单的使用方式

只需要 3 步，即可在你的项目中使用 OFD 预览功能：

### 步骤 1: 复制组件到你的项目

```bash
# 将整个 ofd-preview-component 文件夹复制到你的项目中
cp -r ofd-preview-component /your-project/src/components/
```

### 步骤 2: 安装依赖（⚠️ 重要！）

必须安装以下所有依赖，组件才能正常工作：

```bash
npm install jszip jszip-utils jspdf file-saver html2canvas ofd-xml-parser js-md5 js-sha1 @lapo/asn1js jsrsasign jsrsasign-util sm-crypto web-streams-polyfill
```

**依赖说明**：
- `jszip` - ZIP 文件处理
- `jszip-utils` - JSZip 工具库
- `jspdf` - PDF 生成
- `file-saver` - 文件保存
- `html2canvas` - HTML 转图片
- `ofd-xml-parser` - OFD XML 解析（**必需！**）
- `js-md5` / `js-sha1` - 加密算法
- `@lapo/asn1js` - ASN.1 解析
- `jsrsasign` / `jsrsasign-util` - 签名验证
- `sm-crypto` - 国密算法
- `web-streams-polyfill` - Stream API

### 步骤 3: 使用组件

```tsx
import React from 'react';
import { OfdProcessor } from './components/ofd-preview-component';

function App() {
  return (
    <div>
      <h1>我的 OFD 转换器</h1>
      <OfdProcessor />
    </div>
  );
}

export default App;
```

就这么简单！🎉

---

## 其他使用方式

### 只需要预览功能？

```tsx
import { OfdPreview, OfdConverter } from './components/ofd-preview-component';

function MyOfdViewer() {
  const [converter, setConverter] = React.useState<OfdConverter | null>(null);

  const handleFileSelect = async (file: File) => {
    const conv = new OfdConverter();
    await conv.loadOfd(file);
    setConverter(conv);
  };

  return (
    <OfdPreview
      converter={converter}
      currentPage={0}
      onPageChange={(page) => console.log('当前页:', page)}
      scale={1}
      onScaleChange={(scale) => console.log('缩放:', scale)}
    />
  );
}
```

### 需要编程控制转换？

```tsx
import { OfdConverter } from './components/ofd-preview-component';

async function convertMyOfd(file: File) {
  const converter = new OfdConverter();

  // 1. 加载文件
  await converter.loadOfd(file);

  // 2. 转换为图片
  const images = await converter.convertToImage({
    format: 'png',
    quality: 90,
    scale: 2,
    pages: 'all',
    background: '#ffffff'
  }, 0);

  // 3. 或转换为 PDF
  const pdf = await converter.convertToPdf({
    pageSize: 'A4',
    orientation: 'portrait',
    quality: 90,
    compression: true
  });

  return pdf;
}
```

---

## 目录结构

```
ofd-preview-component/
├── src/
│   ├── components/       # React 组件
│   │   ├── OfdPreview.tsx      # 预览组件
│   │   └── OfdProcessor.tsx    # 完整处理组件
│   ├── core/             # OFD 核心库
│   │   ├── ofd.js
│   │   ├── ofd_parser.js
│   │   ├── ofd_render.js
│   │   └── ...
│   ├── utils/            # 工具类
│   │   └── OfdConverter.ts      # 转换器类
│   ├── types/            # TypeScript 类型定义
│   │   └── index.ts
│   └── index.ts          # 主入口
├── example.tsx           # 使用示例
├── README.md             # 完整文档
├── package.json          # 依赖配置
└── QUICKSTART.md         # 本文件
```

---

## 常见问题

### Q: 支持哪些 OFD 文件？

A: 支持符合国家标准的 OFD 文件，最大文件大小 50MB。

### Q: 转换后的图片质量如何？

A: 默认使用 2 倍缩放（高清），可调整为 1x（标准）或 3x（超清）。

### Q: 可以在移动端使用吗？

A: 可以，但建议在屏幕较大的设备上使用以获得更好的预览体验。

### Q: 数据会上传到服务器吗？

A: 不会，所有处理都在浏览器本地完成，数据不会离开你的设备。

---

## 需要帮助？

- 查看完整文档：`README.md`
- 查看示例代码：`example.tsx`
- 查看类型定义：`src/types/index.ts`

祝你使用愉快！ 😊
