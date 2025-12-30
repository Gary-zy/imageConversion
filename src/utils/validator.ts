import { SUPPORTED_INPUT_FORMATS } from '../types';

// 验证文件是否为支持的图片格式
export function isValidImageFile(file: File): boolean {
  return SUPPORTED_INPUT_FORMATS.includes(file.type);
}

// 过滤有效的图片文件
export function filterValidImageFiles(files: FileList | File[]): File[] {
  const fileArray = Array.from(files);
  return fileArray.filter(isValidImageFile);
}

// 获取文件类型描述
export function getFileTypeDescription(mimeType: string): string {
  const typeMap: Record<string, string> = {
    'image/jpeg': 'JPEG 图片',
    'image/png': 'PNG 图片',
    'image/webp': 'WebP 图片',
    'image/gif': 'GIF 图片',
    'image/bmp': 'BMP 图片',
    'image/svg+xml': 'SVG 图片',
    'image/x-icon': 'ICO 图标',
    'image/vnd.microsoft.icon': 'ICO 图标',
  };
  return typeMap[mimeType] || '未知格式';
}
