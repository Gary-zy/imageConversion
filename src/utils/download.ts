import JSZip from 'jszip';
import { ImageFile, FORMAT_OPTIONS, ImageFormat } from '../types';

// 下载单个文件
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 生成转换后的文件名
export function getConvertedFileName(
  originalName: string,
  targetFormat: ImageFormat,
  prefix: string = '',
  suffix: string = ''
): string {
  const formatInfo = FORMAT_OPTIONS.find((f) => f.value === targetFormat);
  const extension = formatInfo?.extension || targetFormat;

  // 移除原始扩展名
  const baseName = originalName.replace(/\.[^.]+$/, '');

  return `${prefix}${baseName}${suffix}.${extension}`;
}

// 批量下载为 ZIP
export async function downloadAsZip(
  files: ImageFile[],
  targetFormat: ImageFormat,
  prefix: string = '',
  suffix: string = ''
): Promise<void> {
  const zip = new JSZip();

  files.forEach((file) => {
    if (file.convertedBlob) {
      const fileName = getConvertedFileName(file.name, targetFormat, prefix, suffix);
      zip.file(fileName, file.convertedBlob);
    }
  });

  const content = await zip.generateAsync({ type: 'blob' });
  downloadFile(content, 'converted_images.zip');
}

// 下载单个转换后的文件
export function downloadConvertedFile(
  file: ImageFile,
  targetFormat: ImageFormat,
  prefix: string = '',
  suffix: string = ''
): void {
  if (file.convertedBlob) {
    const fileName = getConvertedFileName(file.name, targetFormat, prefix, suffix);
    downloadFile(file.convertedBlob, fileName);
  }
}
