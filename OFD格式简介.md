# PRD - 在线图片转换工具 OFD功能增补

## 一、功能概述

在现有图片格式转换工具基础上，新增**OFD文档处理模块**，支持OFD格式转换为PDF和常见图片格式（PNG、JPEG、WebP）。完全基于浏览器端实现，无需后端服务，保护用户隐私 。[^2_1]

### 业务价值

- **用户痛点**：电子发票、电子公文等OFD文档无法直接查看或分享，需要专用阅读器
- **解决方案**：纯前端转换OFD为通用格式，即开即用，无需安装软件
- **目标用户**：财务人员、行政人员、开发者、普通用户


## 二、核心功能需求

### 2.1 文件上传模块（复用现有）

```typescript
// 扩展支持的文件类型
const SUPPORTED_FILES = {
  image: ['.jpg', '.png', '.webp', '.gif', '.bmp'],
  ofd: ['.ofd'] // 新增
}
```

**功能要求**：

- 支持拖拽上传 .ofd 文件
- 支持点击选择上传
- 文件格式校验（检查.ofd扩展名和文件头）
- 单个文件大小限制：50MB
- 支持批量上传多个OFD文件


### 2.2 OFD预览功能

**需求描述**：
用户上传OFD文件后，在转换前可以预览文档内容，确认无误后再进行转换。

**技术实现**：

- 使用 `ofd.js` 或 `liteofd` 库解析和渲染
- 以Canvas/SVG方式渲染到页面
- 显示页码和总页数
- 支持页面导航（上一页/下一页）
- 支持缩放查看（50%-200%）

**UI组件**：

```
┌─────────────────────────────┐
│  OFD文档预览                 │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │   OFD内容渲染区域      │  │
│  │                       │  │
│  └───────────────────────┘  │
│  [<] 1/5 [>]  [50%▼] [转换] │
└─────────────────────────────┘
```


### 2.3 格式转换模块

#### 2.3.1 OFD → 图片

**支持格式**：

- PNG（默认，无损）
- JPEG（可调质量，80-100）
- WebP（可调质量，80-100）

**转换选项**：

```typescript
interface OfdToImageOptions {
  format: 'png' | 'jpeg' | 'webp'
  quality: number // 1-100，仅JPEG/WebP有效
  scale: number // 缩放比例 1-3，控制输出分辨率
  pages: 'all' | 'current' | number[] // 转换页面范围
  background: string // 背景色，默认'#ffffff'
}
```

**转换流程**：

1. 解析OFD文件（使用 ofd.js/liteofd）
2. 遍历指定页面
3. 渲染到Canvas
4. 使用 `canvas.toBlob()` 导出图片
5. 多页生成多个图片文件

#### 2.3.2 OFD → PDF

**转换选项**：

```typescript
interface OfdToPdfOptions {
  pageSize: 'A4' | 'A3' | 'original' // PDF页面尺寸
  orientation: 'portrait' | 'landscape' // 方向
  quality: number // 1-100，影响图片压缩质量
  compression: boolean // 是否启用压缩
}
```

**转换流程**：

1. 解析OFD文件
2. 遍历所有页面并渲染到Canvas
3. 计算PDF页面布局
4. 使用 `jsPDF` 库创建PDF文档
5. 将Canvas内容添加到PDF页面
6. 导出PDF文件

### 2.4 下载功能

**单页/单文件下载**：

- 文件名格式：`原文件名_第X页.png` 或 `原文件名.pdf`
- 使用 `saveAs` 或 `<a download>` 触发下载

**多页批量下载**：

- 自动打包为ZIP文件（使用 JSZip 库）
- ZIP文件名：`原文件名_images.zip`
- 显示打包进度条


### 2.5 高级设置面板

```typescript
// UI结构
<AdvancedSettings>
  <FormItem label="输出格式">
    <Radio.Group options={['PNG', 'JPEG', 'WebP', 'PDF']} />
  </FormItem>
  
  <FormItem label="转换页面" visible={format !== 'pdf'}>
    <Radio.Group options={['当前页', '全部页', '自定义']} />
    <Input placeholder="1,3-5,8" visible={custom} />
  </FormItem>
  
  <FormItem label="图片质量" visible={['jpeg','webp'].includes(format)}>
    <Slider min={80} max={100} />
  </FormItem>
  
  <FormItem label="分辨率" visible={format !== 'pdf'}>
    <Select options={['标准(1x)', '高清(2x)', '超清(3x)']} />
  </FormItem>
  
  <FormItem label="PDF尺寸" visible={format === 'pdf'}>
    <Select options={['A4', 'A3', '原始尺寸']} />
  </FormItem>
</AdvancedSettings>
```


## 三、技术实现方案

### 3.1 技术栈

**核心库**：

```json
{
  "dependencies": {
    "ofd.js": "^1.x.x",        // OFD解析和渲染（主选）
    "liteofd": "^1.x.x",       // OFD解析备选方案
    "jspdf": "^2.5.1",         // PDF生成
    "jszip": "^3.10.1",        // ZIP打包
    "file-saver": "^2.0.5"     // 文件下载
  }
}
```

**兼容性**：

- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+


### 3.2 核心代码结构

```typescript
// src/utils/ofdConverter.ts
import { renderOfd } from 'ofd.js'
import jsPDF from 'jspdf'
import JSZip from 'jszip'

export class OfdConverter {
  private ofdData: any
  
  async loadOfd(file: File): Promise<void> {
    // 解析OFD文件
  }
  
  async renderToCanvas(pageIndex: number, scale: number): Promise<HTMLCanvasElement> {
    // 渲染指定页面到Canvas
  }
  
  async convertToImage(options: OfdToImageOptions): Promise<Blob[]> {
    // 转换为图片
    const canvases = await this.renderPages(options.pages, options.scale)
    return canvases.map(canvas => 
      canvas.toBlob(options.format, options.quality / 100)
    )
  }
  
  async convertToPdf(options: OfdToPdfOptions): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: options.pageSize
    })
    
    const pageCount = this.getPageCount()
    for (let i = 0; i < pageCount; i++) {
      const canvas = await this.renderToCanvas(i, 2) // 2x分辨率
      const imgData = canvas.toDataURL('image/jpeg', options.quality / 100)
      
      if (i > 0) pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight)
    }
    
    return pdf.output('blob')
  }
}
```

```typescript
// src/components/OfdProcessor.tsx
import { OfdConverter } from '@/utils/ofdConverter'

export const OfdProcessor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [converter, setConverter] = useState<OfdConverter | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [converting, setConverting] = useState(false)
  
  const handleFileUpload = async (uploadedFile: File) => {
    const conv = new OfdConverter()
    await conv.loadOfd(uploadedFile)
    setConverter(conv)
    setFile(uploadedFile)
  }
  
  const handleConvert = async (format: string, options: any) => {
    setConverting(true)
    try {
      if (format === 'pdf') {
        const blob = await converter.convertToPdf(options)
        saveAs(blob, `${file.name}.pdf`)
      } else {
        const blobs = await converter.convertToImage(options)
        if (blobs.length === 1) {
          saveAs(blobs[^2_0], `${file.name}.${format}`)
        } else {
          // 批量打包ZIP
          const zip = new JSZip()
          blobs.forEach((blob, i) => {
            zip.file(`page_${i + 1}.${format}`, blob)
          })
          const zipBlob = await zip.generateAsync({ type: 'blob' })
          saveAs(zipBlob, `${file.name}_images.zip`)
        }
      }
    } finally {
      setConverting(false)
    }
  }
  
  return (
    <div>
      <FileUpload accept=".ofd" onChange={handleFileUpload} />
      {converter && (
        <>
          <OfdPreview 
            converter={converter} 
            page={currentPage}
            onPageChange={setCurrentPage}
          />
          <ConversionSettings onConvert={handleConvert} />
        </>
      )}
    </div>
  )
}
```


### 3.3 性能优化

**Web Worker 处理**：

```typescript
// src/workers/ofd.worker.ts
self.addEventListener('message', async (e) => {
  const { type, data } = e.data
  
  if (type === 'convert') {
    const converter = new OfdConverter()
    await converter.loadOfd(data.file)
    const result = await converter.convertToImage(data.options)
    self.postMessage({ type: 'success', data: result })
  }
})
```

**内存管理**：

- 大文件分页转换，避免同时加载所有页面
- 及时释放Canvas和Blob对象
- 转换完成后清理临时数据

**进度显示**：

```typescript
interface ConversionProgress {
  current: number
  total: number
  status: 'parsing' | 'rendering' | 'exporting'
}
```


## 四、UI/UX 设计

### 4.1 页面布局

```
┌─────────────────────────────────────────────┐
│  在线图片转换工具                            │
│  [图片格式] [OFD文档] ← Tab切换              │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  拖拽OFD文件到此处                     │ │
│  │  或 [选择文件]                         │ │
│  │  支持：.ofd 格式                       │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌─────────────┐  ┌──────────────────────┐ │
│  │  文档预览   │  │  转换设置             │ │
│  │             │  │  ○ PNG               │ │
│  │   OFD页面   │  │  ○ JPEG [质量:90▬]   │ │
│  │   渲染区域  │  │  ● PDF               │ │
│  │             │  │  页面尺寸: [A4 ▼]    │ │
│  │  [<] 1/5 [>]│  │  □ 启用压缩          │ │
│  │  [50%▼]     │  │                      │ │
│  │             │  │  [开始转换]           │ │
│  └─────────────┘  └──────────────────────┘ │
│                                             │
│  ━━━━━━━━━━ 转换中 65% ━━━━━━━━━━━━━       │
└─────────────────────────────────────────────┘
```


### 4.2 交互流程

1. **上传阶段**：拖拽或选择OFD文件 → 文件校验 → 解析文件
2. **预览阶段**：显示文档首页 → 支持翻页/缩放查看
3. **设置阶段**：选择输出格式 → 配置高级选项
4. **转换阶段**：显示进度条 → 显示当前处理页面
5. **下载阶段**：自动下载或手动下载 → 显示成功提示

### 4.3 错误处理

```typescript
const ERROR_MESSAGES = {
  INVALID_FILE: 'OFD文件格式不正确，请重新选择',
  PARSE_FAILED: 'OFD文件解析失败，可能已损坏',
  RENDER_FAILED: '页面渲染失败，请重试',
  OUT_OF_MEMORY: '文件过大，建议减少转换页面或降低分辨率',
  BROWSER_NOT_SUPPORTED: '当前浏览器不支持，请使用Chrome/Edge/Firefox最新版'
}
```

**Toast提示**：

- 成功：绿色，2秒自动消失
- 错误：红色，手动关闭
- 警告：黄色，3秒自动消失


## 五、测试用例

### 5.1 功能测试

| 用例ID | 测试场景 | 预期结果 |
| :-- | :-- | :-- |
| OFD-001 | 上传有效的.ofd文件 | 成功解析并显示预览 |
| OFD-002 | 上传非OFD文件（.pdf） | 提示格式错误 |
| OFD-003 | 上传50MB以上文件 | 提示文件过大 |
| OFD-004 | 单页转PNG | 生成1个PNG文件，可正常打开 |
| OFD-005 | 多页转PNG | 生成ZIP包含所有页面 |
| OFD-006 | 转换为PDF | 生成PDF文件，页数与OFD一致 |
| OFD-007 | 调整JPEG质量到90 | 生成文件质量符合设置 |
| OFD-008 | 选择2x分辨率 | 图片尺寸为原始的2倍 |
| OFD-009 | 批量上传3个OFD | 依次转换，互不干扰 |
| OFD-010 | 转换中取消操作 | 停止转换，释放资源 |

### 5.2 性能测试

| 指标 | 目标 |
| :-- | :-- |
| 10页OFD转PNG | < 15秒 |
| 10页OFD转PDF | < 20秒 |
| 单页渲染时间 | < 2秒 |
| 内存占用 | < 500MB（10页文档） |
| UI响应延迟 | < 100ms |

### 5.3 兼容性测试

- ✅ Chrome 120+ / Windows 11
- ✅ Chrome 120+ / macOS
- ✅ Firefox 121+ / Windows 11
- ✅ Edge 120+ / Windows 11
- ✅ Safari 17+ / macOS
- ⚠️ 移动端浏览器（仅查看，不支持转换大文件）


## 六、实施计划

### 第一阶段（1-2天）

- [ ] 集成 ofd.js 库
- [ ] 实现文件上传和格式校验
- [ ] 实现基础的OFD预览功能
- [ ] 单页转PNG功能


### 第二阶段（2-3天）

- [ ] 多页转图片功能
- [ ] ZIP打包下载
- [ ] OFD转PDF功能
- [ ] 进度条显示


### 第三阶段（1-2天）

- [ ] 高级设置面板
- [ ] 质量/分辨率调节
- [ ] 性能优化（Web Worker）
- [ ] 错误处理完善


### 第四阶段（1天）

- [ ] UI细节优化
- [ ] 全功能测试
- [ ] 文档编写


## 七、验收标准

- [x] 支持.ofd文件上传和校验
- [x] OFD文档可正常预览，支持翻页
- [x] 可转换为PNG/JPEG/WebP格式，图片清晰无失真
- [x] 可转换为PDF格式，页面布局正确
- [x] 多页文档可打包为ZIP下载
- [x] 转换过程显示进度，不卡顿
- [x] 高级设置功能正常，参数生效
- [x] 错误提示清晰，引导用户解决问题
- [x] 主流浏览器兼容性测试通过
- [x] 性能达标（参考性能测试指标）

***

## 使用说明

将此PRD提供给AI代码生成工具时，可以这样提问：

> 我需要在现有的React图片转换项目中增加OFD文档转换功能。根据以下PRD文档，请帮我实现：
> 1. 首先实现 OfdConverter 工具类，包含OFD解析、渲染、转图片、转PDF的核心逻辑
> 2. 然后实现 OfdProcessor 组件，包含文件上传、预览、设置面板、转换下载的完整UI
> 3. 使用 ofd.js + jsPDF + JSZip 技术栈，TypeScript编写
>
> [粘贴完整PRD]
>
> 请先生成核心转换逻辑代码。

这份PRD包含完整的功能需求、技术方案、代码示例和验收标准，可直接用于AI辅助开发 。[^2_1]
<span style="display:none">[^2_2][^2_3]</span>

<div align="center">⁂</div>

[^2_1]: interests.ofd_conversion

[^2_2]: projects.web_image_processing

[^2_3]: https://www.perplexity.ai/search/8a82bf56-f6f1-45b5-91db-bedbecdfb94f

