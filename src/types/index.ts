// ========== 核心类型定义 ==========

// 支持的图片格式
export type ImageFormat =
  | 'jpeg'
  | 'png'
  | 'webp'
  | 'gif'
  | 'bmp'
  | 'ico'
  | 'icns'
  | 'avif'
  | 'tiff'
  | 'heif'
  | 'heic'
  | 'jxl'
  | 'pdf'
  | 'svg'
  | 'jp2'
  | 'tga'
  // 新增格式
  | 'pbm'
  | 'pgm'
  | 'ppm'
  | 'xbm'
  | 'xpm'
  | 'pcx'
  | 'dds'
  | 'cur'
  | 'psd'
  | 'exr'
  | 'hdr'
  | 'wbmp'
  | 'qoi';

// 文件转换状态
export type ConvertStatus = 'pending' | 'converting' | 'completed' | 'failed';

// 图片文件信息
export interface ImageFile {
  id: string;
  file: File;
  name: string;
  size: number;
  width: number;
  height: number;
  format: string;
  previewUrl: string;
  status: ConvertStatus;
  progress: number;
  convertedBlob?: Blob;
  convertedSize?: number;
  convertedUrl?: string;
  error?: string;
  originalUrl?: string; // 原始图片URL，用于对比
}

// 转换配置选项
export interface ConvertOptions {
  targetFormat: ImageFormat;
  quality: number; // 0-100, 用于 jpeg/webp/avif
  resize?: {
    width: number;
    height: number;
    maintainAspectRatio: boolean;
  };
  rotate?: number; // 旋转角度 (0, 90, 180, 270)
  flip?: boolean; // 水平翻转
  flop?: boolean; // 垂直翻转
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  adjustment?: {
    brightness: number; // -100 到 100，0 为原始
    contrast: number; // -100 到 100，0 为原始
    saturation: number; // -100 到 100，0 为原始
  };
  filter?: {
    blur: number; // 0-100
    sharpen: number; // 0-100
    grayscale: boolean;
    sepia: boolean;
    invert: boolean;
  };
  watermark?: {
    text: string;
    color: string;
    fontSize: number;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number;
    // 新增：PDF 风格水印选项
    type?: 'corner' | 'tiled' | 'diagonal' | 'full';
    rotation?: number; // 旋转角度
    spacing?: number; // 水印间距（用于平铺）
    margin?: number; // 边距
    // 全页水印专用
    fontScale?: number; // 字体缩放比例
  };
  imageWatermark?: {
    imageData: string;
    width: number;
    height: number;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number;
    scale: number;
    // 新增：PDF 风格水印选项
    type?: 'corner' | 'tiled' | 'diagonal' | 'full';
    rotation?: number; // 旋转角度
    spacing?: number; // 水印间距（用于平铺）
    margin?: number; // 边距
    // 全页水印专用
    imageScale?: number; // 图片缩放比例
  };
  backgroundColor?: string;
  iconSizes?: number[];
  exif?: {
    artist?: string;
    copyright?: string;
    software?: string;
  };
}

// 高级设置
export interface AdvancedSettings {
  quality: number;
  fileNamePrefix: string;
  fileNameSuffix: string;

  enableResize: boolean;
  resizeWidth: number;
  resizeHeight: number;
  maintainAspectRatio: boolean;

  rotate: number;
  flip: boolean;
  flop: boolean;

  enableCrop: boolean;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;

  enableAdjustment: boolean;
  brightness: number;
  contrast: number;
  saturation: number;

  enableFilter: boolean;
  blur: number;
  sharpen: number;
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;

  enableWatermark: boolean;
  watermarkType: 'text' | 'image';
  watermarkText: string;
  watermarkColor: string;
  watermarkFontSize: number;
  watermarkPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  watermarkOpacity: number;
  // 新增：PDF 风格水印选项
  watermarkStyleType: 'corner' | 'tiled' | 'diagonal' | 'full';
  watermarkRotation: number; // 旋转角度
  watermarkSpacing: number; // 水印间距
  watermarkMargin: number; // 边距
  watermarkFontScale: number; // 全页水印字体缩放比例

  watermarkImage: string;
  watermarkImageWidth: number;
  watermarkImageHeight: number;
  watermarkImageScale: number;
  watermarkImagePosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  watermarkImageOpacity: number;
  // 新增：PDF 风格水印选项（图片水印）
  watermarkImageStyleType: 'corner' | 'tiled' | 'diagonal' | 'full';
  watermarkImageRotation: number; // 旋转角度
  watermarkImageSpacing: number; // 水印间距
  watermarkImageMargin: number; // 边距
  watermarkImageImageScale: number; // 全页水印图片缩放比例

  backgroundColor: string;

  iconSizes: number[];

  // 新增：压缩选项
  enableCompression: boolean;
  compressionLevel: number; // 0-9

  // 新增：去噪
  enableDenoise: boolean;
  denoiseLevel: number;

  // EXIF 信息编辑
  editExif: boolean;
  exifArtist: string;
  exifCopyright: string;
  exifSoftware: string;
}

// ========== 格式配置 ==========

// 格式信息
export interface FormatInfo {
  value: ImageFormat;
  label: string;
  mimeType: string;
  extension: string;
  supportsQuality: boolean;
  category: 'common' | 'modern' | 'document' | 'icon' | 'legacy' | 'netpbm' | 'other' | 'raw';
  description?: string;
}

// 格式分类
export const FORMAT_CATEGORIES = {
  common: {
    name: '常用格式',
    formats: ['jpeg', 'png', 'webp'] as const,
  },
  modern: {
    name: '现代格式',
    formats: ['avif', 'heic', 'heif', 'jxl'] as const,
  },
  document: {
    name: '文档格式',
    formats: ['pdf', 'svg', 'jp2'] as const,
  },
  icon: {
    name: '图标格式',
    formats: ['ico', 'icns'] as const,
  },
  legacy: {
    name: '传统格式',
    formats: ['gif', 'bmp', 'tiff', 'tga'] as const,
  },
  // 新增分类
  raw: {
    name: '原始格式',
    formats: ['psd', 'exr', 'hdr'] as const,
  },
  netpbm: {
    name: 'Netpbm 格式',
    formats: ['pbm', 'pgm', 'ppm'] as const,
  },
  other: {
    name: '其他格式',
    formats: ['xbm', 'xpm', 'pcx', 'dds', 'cur', 'wbmp', 'qoi'] as const,
  },
};

// 格式配置
export const FORMAT_OPTIONS: FormatInfo[] = [
  // 现代格式
  { value: 'avif', label: 'AVIF', mimeType: 'image/avif', extension: 'avif', supportsQuality: true, category: 'modern', description: '最新高效图片格式，超高压缩率' },
  { value: 'heic', label: 'HEIC', mimeType: 'image/heic', extension: 'heic', supportsQuality: true, category: 'modern', description: 'Apple 设备常用格式' },
  { value: 'heif', label: 'HEIF', mimeType: 'image/heif', extension: 'heif', supportsQuality: true, category: 'modern', description: '高效图片格式' },
  { value: 'jxl', label: 'JPEG XL', mimeType: 'image/jxl', extension: 'jxl', supportsQuality: true, category: 'modern', description: '下一代 JPEG 格式' },
  // 常用格式
  { value: 'jpeg', label: 'JPEG', mimeType: 'image/jpeg', extension: 'jpg', supportsQuality: true, category: 'common', description: '最通用的图片格式' },
  { value: 'png', label: 'PNG', mimeType: 'image/png', extension: 'png', supportsQuality: false, category: 'common', description: '支持透明度的无损格式' },
  { value: 'webp', label: 'WebP', mimeType: 'image/webp', extension: 'webp', supportsQuality: true, category: 'common', description: 'Google 开发的高效格式' },
  // 文档格式
  { value: 'pdf', label: 'PDF', mimeType: 'application/pdf', extension: 'pdf', supportsQuality: false, category: 'document', description: '可移植文档格式' },
  { value: 'svg', label: 'SVG', mimeType: 'image/svg+xml', extension: 'svg', supportsQuality: false, category: 'document', description: '矢量图形格式' },
  { value: 'jp2', label: 'JPEG 2000', mimeType: 'image/jp2', extension: 'jp2', supportsQuality: true, category: 'document', description: '专业图片格式' },
  // 图标格式
  { value: 'ico', label: 'ICO', mimeType: 'image/x-icon', extension: 'ico', supportsQuality: false, category: 'icon', description: 'Windows 图标格式' },
  { value: 'icns', label: 'ICNS', mimeType: 'image/icns', extension: 'icns', supportsQuality: false, category: 'icon', description: 'macOS 图标格式' },
  // 传统格式
  { value: 'gif', label: 'GIF', mimeType: 'image/gif', extension: 'gif', supportsQuality: false, category: 'legacy', description: '支持动画的图片格式' },
  { value: 'bmp', label: 'BMP', mimeType: 'image/bmp', extension: 'bmp', supportsQuality: false, category: 'legacy', description: 'Windows 位图格式' },
  { value: 'tiff', label: 'TIFF', mimeType: 'image/tiff', extension: 'tiff', supportsQuality: false, category: 'legacy', description: '专业图片格式，无损压缩' },
  { value: 'tga', label: 'TGA', mimeType: 'image/tga', extension: 'tga', supportsQuality: false, category: 'legacy', description: 'Truevision 图形格式' },
  // Netpbm 格式
  { value: 'pbm', label: 'PBM', mimeType: 'image/x-portable-bitmap', extension: 'pbm', supportsQuality: false, category: 'netpbm', description: 'Portable Bitmap 单色位图' },
  { value: 'pgm', label: 'PGM', mimeType: 'image/x-portable-graymap', extension: 'pgm', supportsQuality: false, category: 'netpbm', description: 'Portable Graymap 灰度图' },
  { value: 'ppm', label: 'PPM', mimeType: 'image/x-portable-pixmap', extension: 'ppm', supportsQuality: false, category: 'netpbm', description: 'Portable Pixmap 彩色图' },
  // 其他格式
  { value: 'xbm', label: 'XBM', mimeType: 'image/x-xbitmap', extension: 'xbm', supportsQuality: false, category: 'other', description: 'X Window System 位图' },
  { value: 'xpm', label: 'XPM', mimeType: 'image/x-xpixmap', extension: 'xpm', supportsQuality: false, category: 'other', description: 'X Window System 像素图' },
  { value: 'pcx', label: 'PCX', mimeType: 'image/pcx', extension: 'pcx', supportsQuality: false, category: 'other', description: 'PC Paintbrush 位图' },
  { value: 'dds', label: 'DDS', mimeType: 'image/vnd.ms-dds', extension: 'dds', supportsQuality: false, category: 'other', description: 'DirectDraw Surface 纹理格式' },
  { value: 'cur', label: 'CUR', mimeType: 'image/x-icon', extension: 'cur', supportsQuality: false, category: 'other', description: 'Windows 光标格式' },
  { value: 'wbmp', label: 'WBMP', mimeType: 'image/vnd.wap.wbmp', extension: 'wbmp', supportsQuality: false, category: 'other', description: 'WAP 位图格式' },
  { value: 'qoi', label: 'QOI', mimeType: 'image/qoi', extension: 'qoi', supportsQuality: false, category: 'other', description: 'Quite OK Image 格式' },
  // 专业格式（需要额外库支持）
  { value: 'psd', label: 'PSD', mimeType: 'image/vnd.adobe.photoshop', extension: 'psd', supportsQuality: false, category: 'raw', description: 'Photoshop 文档格式' },
  { value: 'exr', label: 'EXR', mimeType: 'image/x-exr', extension: 'exr', supportsQuality: true, category: 'raw', description: 'OpenEXR 高动态范围格式' },
  { value: 'hdr', label: 'HDR', mimeType: 'image/radiance', extension: 'hdr', supportsQuality: true, category: 'raw', description: 'Radiance HDR 高动态范围格式' },
];

// 支持的输入格式
export const SUPPORTED_INPUT_FORMATS = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp',
  'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon',
  'image/tiff', 'image/tga', 'image/avif', 'image/heic', 'image/heif',
  'image/x-portable-bitmap', 'image/x-portable-graymap', 'image/x-portable-pixmap',
  'image/x-xbitmap', 'image/x-xpixmap', 'image/pcx',
  'image/vnd.ms-dds', 'image/vnd.wap.wbmp',
  'image/vnd.adobe.photoshop', 'image/x-exr', 'image/radiance',
];

// 支持的文件扩展名
export const SUPPORTED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg', '.ico', '.icns',
  '.tiff', '.tif', '.tga', '.avif', '.heic', '.heif', '.jxl', '.jp2',
  '.pbm', '.pgm', '.ppm', '.xbm', '.xpm', '.pcx', '.dds', '.cur', '.wbmp', '.qoi',
  '.psd', '.exr', '.hdr',
];

// ========== 尺寸预设 ==========

// 常用尺寸预设
export const SIZE_PRESETS = [
  { label: '原始尺寸', width: 0, height: 0, description: '保持原图尺寸' },
  { label: '4K Ultra HD', width: 3840, height: 2160, description: '3840 x 2160' },
  { label: '1080p Full HD', width: 1920, height: 1080, description: '1920 x 1080' },
  { label: '720p HD', width: 1280, height: 720, description: '1280 x 720' },
  { label: 'Instagram Post', width: 1080, height: 1080, description: '1080 x 1080' },
  { label: 'Instagram Story', width: 1080, height: 1920, description: '1080 x 1920' },
  { label: 'Twitter Post', width: 1200, height: 675, description: '1200 x 675' },
  { label: 'Facebook Cover', width: 820, height: 312, description: '820 x 312' },
  { label: 'YouTube Thumb', width: 1280, height: 720, description: '1280 x 720' },
  { label: 'Avatar', width: 200, height: 200, description: '200 x 200' },
  { label: 'Favicon', width: 32, height: 32, description: '32 x 32' },
  { label: '微信头像', width: 640, height: 640, description: '640 x 640' },
  { label: '小程序封面', width: 510, height: 510, description: '510 x 510' },
  { label: '抖音封面', width: 1080, height: 1920, description: '1080 x 1920' },
];

// 社交媒体尺寸
export const SOCIAL_MEDIA_SIZES = {
  instagram: [
    { name: 'Post (1:1)', width: 1080, height: 1080 },
    { name: 'Portrait (4:5)', width: 1080, height: 1350 },
    { name: 'Story (9:16)', width: 1080, height: 1920 },
    { name: 'Landscape (1.91:1)', width: 1080, height: 566 },
  ],
  facebook: [
    { name: 'Post', width: 1200, height: 630 },
    { name: 'Cover', width: 820, height: 312 },
    { name: 'Story', width: 1080, height: 1920 },
  ],
  twitter: [
    { name: 'Post', width: 1200, height: 675 },
    { name: 'Header', width: 1500, height: 500 },
    { name: 'Card', width: 800, height: 418 },
  ],
  youtube: [
    { name: 'Thumbnail', width: 1280, height: 720 },
    { name: 'Channel Art', width: 2560, height: 1440 },
  ],
};

// ========== 工具函数 ==========

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function getFormatFromMimeType(mimeType: string): string {
  const format = mimeType.split('/')[1];
  if (format === 'jpeg') return 'jpg';
  if (format === 'svg+xml') return 'svg';
  if (format === 'x-icon' || format === 'vnd.microsoft.icon') return 'ico';
  return format;
}

export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}

export function getCompressionSavings(original: number, compressed: number): string {
  if (original === 0) return '0%';
  const savings = ((original - compressed) / original) * 100;
  return savings > 0 ? `-${savings.toFixed(1)}%` : '+${Math.abs(savings).toFixed(1)}%';
}

// ========== OFD 相关类型定义 ==========

export type OfdTargetFormat = 'png' | 'jpeg' | 'webp' | 'pdf';
export type OfdPageRange = 'all' | 'current' | 'custom' | number[];

export interface OfdFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  currentPage: number;
  previewUrl?: string;
  status: ConvertStatus;
  progress: number;
  convertedBlob?: Blob;
  convertedSize?: number;
  convertedUrl?: string;
  error?: string;
}

export interface OfdToImageOptions {
  format: 'png' | 'jpeg' | 'webp';
  quality: number;
  scale: number;
  pages: OfdPageRange;
  background: string;
}

export interface OfdToPdfOptions {
  pageSize: 'A4' | 'A3' | 'original';
  orientation: 'portrait' | 'landscape';
  quality: number;
  compression: boolean;
}

export interface OfdConversionSettings {
  targetFormat: OfdTargetFormat;
  imageQuality: number;
  imageScale: number;
  imagePages: OfdPageRange;
  imageBackground: string;
  pdfPageSize: 'A4' | 'A3' | 'original';
  pdfOrientation: 'portrait' | 'landscape';
  pdfCompression: boolean;
}

// ========== 历史记录类型 ==========

export interface ConversionHistory {
  id: string;
  timestamp: number;
  originalName: string;
  originalSize: number;
  targetFormat: string;
  convertedSize: number;
  settings: Partial<AdvancedSettings>;
}

export const MAX_HISTORY_ITEMS = 50;

// 文件名模板类型
export interface FileNameTemplate {
  prefix: string;
  suffix: string;
  pattern: 'original' | 'sequential' | 'timestamp';
  startNumber: number;
}

// 深色模式类型
export type ThemeMode = 'light' | 'dark' | 'auto';

// 键盘快捷键配置
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: string;
  description: string;
}

// 社交媒体预设
export interface SocialMediaPreset {
  name: string;
  platform: string;
  width: number;
  height: number;
  description: string;
}

// EXIF信息类型
export interface ExifInfo {
  make?: string;
  model?: string;
  datetime?: string;
  software?: string;
  artist?: string;
  copyright?: string;
  lensModel?: string;
  focalLength?: string;
  fNumber?: string;
  exposureTime?: string;
  iso?: number;
  flash?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
}
