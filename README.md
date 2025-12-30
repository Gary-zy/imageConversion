# 图片转换器 - 在线图片格式转换工具

免费在线图片格式转换工具，支持多种图片格式互转。纯前端处理，保护隐私，无需上传服务器。

## ✨ 功能特性

- **多格式支持**: JPEG、PNG、WebP、AVIF、HEIC、GIF、BMP、SVG、ICO、ICNS、TIFF、TGA 等
- **批量处理**: 支持批量上传和批量转换
- **高级编辑**: 尺寸调整、旋转、翻转、裁剪、滤镜、水印等功能
- **纯前端处理**: 所有转换在浏览器本地完成，保护用户隐私
- **免费使用**: 无需注册登录，无文件大小限制
- **响应式设计**: 完美支持桌面端和移动端

## 🚀 快速部署

### Vercel 部署（推荐）

1. 安装 Vercel CLI：
```bash
npm i -g vercel
```

2. 在项目根目录运行：
```bash
vercel
```

3. 按照提示完成部署

或者通过 GitHub 直接导入：
- 访问 [Vercel](https://vercel.com)
- 点击 "Add New Project"
- 导入你的 GitHub 仓库
- Vercel 会自动识别 Vite 项目并配置

### Netlify 部署

1. 安装 Netlify CLI：
```bash
npm i -g netlify-cli
```

2. 在项目根目录运行：
```bash
netlify deploy --prod
```

或者通过 GitHub 直接导入：
- 访问 [Netlify](https://netlify.com)
- 点击 "Add new site" → "Import an existing project"
- 导入你的 GitHub 仓库

### GitHub Pages 部署

1. 修改 `vite.config.ts` 中的 `base` 路径：
```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ...
})
```

2. 构建并部署：
```bash
npm run build
npx gh-pages -d dist
```

### Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

创建 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

构建和运行：
```bash
docker build -t image-converter .
docker run -p 80:80 image-converter
```

## 📦 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 🛠️ 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式方案
- **Zustand** - 状态管理
- **Canvas API** - 图片处理

## 📁 项目结构

```
image/
├── src/
│   ├── components/     # React 组件
│   │   ├── FileUpload.tsx
│   │   ├── FormatSelector.tsx
│   │   ├── FileList.tsx
│   │   ├── AdvancedSettings.tsx
│   │   └── ImagePreview.tsx
│   ├── stores/         # 状态管理
│   ├── utils/          # 工具函数
│   ├── types/          # TypeScript 类型
│   └── App.tsx         # 主应用
├── public/             # 静态资源
├── dist/               # 构建输出
├── vercel.json         # Vercel 配置
├── netlify.toml        # Netlify 配置
└── package.json
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**注意**: 本项目所有图片处理均在浏览器本地完成，不会将任何图片上传到服务器。
