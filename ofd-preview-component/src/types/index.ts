// OFD 转换目标格式
export type OfdTargetFormat = 'png' | 'jpeg' | 'webp' | 'pdf';

// OFD 转换页面范围
export type OfdPageRange = 'all' | 'current' | 'custom' | number[];

// OFD 转图片选项
export interface OfdToImageOptions {
  format: 'png' | 'jpeg' | 'webp';
  quality: number; // 1-100,仅 JPEG/WebP 有效
  scale: number; // 缩放比例 1-3,控制输出分辨率
  pages: OfdPageRange; // 转换页面范围
  background: string; // 背景色,默认 '#ffffff'
}

// OFD 转 PDF 选项
export interface OfdToPdfOptions {
  pageSize: 'A4' | 'A3' | 'original'; // PDF 页面尺寸
  orientation: 'portrait' | 'landscape'; // 方向
  quality: number; // 1-100,影响图片压缩质量
  compression: boolean; // 是否启用压缩
}

// 进度回调
export type ProgressCallback = (current: number, total: number, status: string) => void;
