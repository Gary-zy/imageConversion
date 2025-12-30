import Pica from 'pica';
import jsPDF from 'jspdf';
import { ConvertOptions, FORMAT_OPTIONS } from '../types';

const pica = new Pica();

// ICNS 标准尺寸
const ICNS_STANDARD_SIZES = [16, 32, 64, 128, 256, 512, 1024];

// ICNS OSType 映射
const ICNS_OSTYPES: Record<number, string> = {
  16: 'icp4',
  32: 'icp5',
  64: 'icp6',
  128: 'ic07',
  256: 'ic08',
  512: 'ic09',
  1024: 'ic10',
};

export async function convertImage(file: File, options: ConvertOptions): Promise<Blob> {
  const { targetFormat, quality, resize, rotate, flip, flop, crop, adjustment, filter, watermark, imageWatermark, backgroundColor, iconSizes } = options;

  // 1. 加载原始图片
  const img = await loadImage(file);
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('无法创建 Canvas 上下文');
  }

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  // 2. 应用背景色
  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (targetFormat === 'jpeg' || targetFormat === 'bmp') {
    // JPEG 和 BMP 不支持透明，默认白色背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 3. 绘制原始图片
  ctx.drawImage(img, 0, 0);

  // 4. 应用旋转
  if (rotate && rotate !== 0) {
    canvas = applyRotation(canvas, rotate);
    ctx = canvas.getContext('2d')!;
  }

  // 5. 应用翻转
  if (flip || flop) {
    canvas = applyFlip(canvas, flip ?? false, flop ?? false);
    ctx = canvas.getContext('2d')!;
  }

  // 6. 应用裁剪
  if (crop) {
    canvas = applyCrop(canvas, crop);
    ctx = canvas.getContext('2d')!;
  }

  // 7. 应用图片调整（亮度、对比度、饱和度）
  if (adjustment && (adjustment.brightness !== 0 || adjustment.contrast !== 0 || adjustment.saturation !== 0)) {
    canvas = applyAdjustment(canvas, adjustment);
    ctx = canvas.getContext('2d')!;
  }

  // 8. 应用滤镜
  if (filter && (filter.blur > 0 || filter.sharpen > 0 || filter.grayscale || filter.sepia || filter.invert)) {
    canvas = applyFilter(canvas, filter);
    ctx = canvas.getContext('2d')!;
  }

  // 9. 应用水印
  if (watermark && watermark.text) {
    console.log('Applying watermark with type:', watermark.type);
    canvas = applyWatermark(canvas, watermark);
    ctx = canvas.getContext('2d')!;
  }

  // 10. 应用图片水印
  if (imageWatermark && imageWatermark.imageData) {
    console.log('Applying image watermark with type:', imageWatermark.type);
    canvas = await applyImageWatermark(canvas, imageWatermark);
    ctx = canvas.getContext('2d')!;
  }

  // 10. 计算目标尺寸
  let targetWidth = canvas.width;
  let targetHeight = canvas.height;

  if (resize) {
    if (resize.maintainAspectRatio) {
      const ratio = Math.min(
        resize.width / targetWidth,
        resize.height / targetHeight
      );
      targetWidth = Math.round(targetWidth * ratio);
      targetHeight = Math.round(targetHeight * ratio);
    } else {
      targetWidth = resize.width;
      targetHeight = resize.height;
    }
  }

  // 11. 使用 Pica 进行高质量缩放
  let resultCanvas: HTMLCanvasElement;

  if (targetWidth !== canvas.width || targetHeight !== canvas.height) {
    resultCanvas = document.createElement('canvas');
    resultCanvas.width = targetWidth;
    resultCanvas.height = targetHeight;

    await pica.resize(canvas, resultCanvas, {
      quality: 3,
      alpha: targetFormat !== 'jpeg' && targetFormat !== 'bmp',
    });
  } else {
    resultCanvas = canvas;
  }

  // 12. 特殊格式处理
  if (targetFormat === 'ico') {
    const sizes = iconSizes || [16, 32, 48, 64, 128, 256];
    return await convertToIco(resultCanvas, sizes);
  }

  if (targetFormat === 'icns') {
    const sizes = iconSizes || ICNS_STANDARD_SIZES;
    return await convertToIcns(resultCanvas, sizes);
  }

  if (targetFormat === 'svg') {
    return await convertToSvg(resultCanvas);
  }

  if (targetFormat === 'pdf') {
    return await convertToPdf(resultCanvas, quality);
  }

  if (targetFormat === 'jp2') {
    return await convertToJp2(resultCanvas, quality);
  }

  // 新增格式处理
  if (targetFormat === 'pbm') {
    return await convertToPbm(resultCanvas);
  }

  if (targetFormat === 'pgm') {
    return await convertToPgm(resultCanvas);
  }

  if (targetFormat === 'ppm') {
    return await convertToPpm(resultCanvas);
  }

  if (targetFormat === 'xbm') {
    return await convertToXbm(resultCanvas);
  }

  if (targetFormat === 'pcx') {
    return await convertToPcx(resultCanvas);
  }

  if (targetFormat === 'wbmp') {
    return await convertToWbmp(resultCanvas);
  }

  if (targetFormat === 'qoi') {
    return await convertToQoi(resultCanvas);
  }

  if (targetFormat === 'cur') {
    const sizes = iconSizes || [16, 32, 48, 64, 128, 256];
    return await convertToCur(resultCanvas, sizes);
  }

  // 需要外部库支持的格式（目前转换为 PNG）
  if (targetFormat === 'psd' || targetFormat === 'exr' || targetFormat === 'hdr' || targetFormat === 'dds' || targetFormat === 'xpm') {
    console.warn(`格式 ${targetFormat} 需要外部库支持，已转换为 PNG`);
    return await canvasToBlob(resultCanvas, 'image/png');
  }

  // 13. 普通格式转换
  const formatInfo = FORMAT_OPTIONS.find((f) => f.value === targetFormat);
  if (!formatInfo) {
    throw new Error(`不支持的格式: ${targetFormat}`);
  }

  const blob = await canvasToBlob(
    resultCanvas,
    formatInfo.mimeType,
    formatInfo.supportsQuality ? quality / 100 : undefined
  );

  // 14. 清理
  URL.revokeObjectURL(img.src);

  return blob;
}

// ========== 基础工具函数 ==========

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('无法加载图片'));
    };

    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('无法创建 Blob'));
        }
      },
      mimeType,
      quality
    );
  });
}

// ========== 图片变换函数 ==========

function applyRotation(canvas: HTMLCanvasElement, angle: number): HTMLCanvasElement {
  const radians = (angle * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));

  const newWidth = canvas.width * cos + canvas.height * sin;
  const newHeight = canvas.width * sin + canvas.height * cos;

  const rotatedCanvas = document.createElement('canvas');
  rotatedCanvas.width = newWidth;
  rotatedCanvas.height = newHeight;

  const ctx = rotatedCanvas.getContext('2d')!;
  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(radians);
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

  return rotatedCanvas;
}

function applyFlip(canvas: HTMLCanvasElement, horizontal: boolean, vertical: boolean): HTMLCanvasElement {
  const flippedCanvas = document.createElement('canvas');
  flippedCanvas.width = canvas.width;
  flippedCanvas.height = canvas.height;

  const ctx = flippedCanvas.getContext('2d')!;

  ctx.save();
  if (horizontal && vertical) {
    ctx.translate(canvas.width, canvas.height);
    ctx.rotate(Math.PI);
  } else if (horizontal) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  } else if (vertical) {
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
  }
  ctx.drawImage(canvas, 0, 0);
  ctx.restore();

  return flippedCanvas;
}

function applyCrop(canvas: HTMLCanvasElement, crop: { x: number; y: number; width: number; height: number }): HTMLCanvasElement {
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = crop.width;
  croppedCanvas.height = crop.height;

  const ctx = croppedCanvas.getContext('2d')!;
  ctx.drawImage(canvas, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

  return croppedCanvas;
}

function applyAdjustment(
  canvas: HTMLCanvasElement,
  adjustment: { brightness: number; contrast: number; saturation: number }
): HTMLCanvasElement {
  const adjustedCanvas = document.createElement('canvas');
  adjustedCanvas.width = canvas.width;
  adjustedCanvas.height = canvas.height;

  const ctx = adjustedCanvas.getContext('2d')!;
  const imageData = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const brightness = adjustment.brightness * 2.55; // -100 到 100 转换为 -255 到 255
  const contrast = (adjustment.contrast + 100) / 100; // -100 到 100 转换为乘数
  const saturation = (adjustment.saturation + 100) / 100; // -100 到 100 转换为乘数

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 亮度
    r += brightness;
    g += brightness;
    b += brightness;

    // 对比度
    r = ((r - 128) * contrast) + 128;
    g = ((g - 128) * contrast) + 128;
    b = ((b - 128) * contrast) + 128;

    // 饱和度
    const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
    r = gray + saturation * (r - gray);
    g = gray + saturation * (g - gray);
    b = gray + saturation * (b - gray);

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imageData, 0, 0);
  return adjustedCanvas;
}

function applyFilter(
  canvas: HTMLCanvasElement,
  filter: { blur: number; sharpen: number; grayscale: boolean; sepia: boolean; invert: boolean }
): HTMLCanvasElement {
  const filteredCanvas = document.createElement('canvas');
  filteredCanvas.width = canvas.width;
  filteredCanvas.height = canvas.height;

  const ctx = filteredCanvas.getContext('2d')!;

  // 应用 CSS 滤镜
  let filterString = '';
  if (filter.blur > 0) {
    filterString += `blur(${filter.blur / 10}px) `;
  }
  if (filter.grayscale) {
    filterString += 'grayscale(100%) ';
  }
  if (filter.sepia) {
    filterString += 'sepia(100%) ';
  }
  if (filter.invert) {
    filterString += 'invert(100%) ';
  }

  ctx.filter = filterString.trim() || 'none';
  ctx.drawImage(canvas, 0, 0);

  // 锐化处理（卷积核）
  if (filter.sharpen > 0) {
    const amount = filter.sharpen / 100;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;
    const copy = new Uint8ClampedArray(data);

    // 锐化卷积核
    const kernel = [
      0, -amount, 0,
      -amount, 1 + 4 * amount, -amount,
      0, -amount, 0
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              sum += copy[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
            }
          }
          data[(y * width + x) * 4 + c] = Math.max(0, Math.min(255, sum));
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  return filteredCanvas;
}

function applyWatermark(
  canvas: HTMLCanvasElement,
  watermark: {
    text: string;
    color: string;
    fontSize: number;
    position: string;
    opacity: number;
    type?: 'corner' | 'tiled' | 'diagonal' | 'full';
    rotation?: number;
    spacing?: number;
    margin?: number;
    fontScale?: number;
  }
): HTMLCanvasElement {
  const watermarkedCanvas = document.createElement('canvas');
  watermarkedCanvas.width = canvas.width;
  watermarkedCanvas.height = canvas.height;

  const ctx = watermarkedCanvas.getContext('2d')!;
  ctx.drawImage(canvas, 0, 0);

  ctx.save();
  ctx.globalAlpha = watermark.opacity;
  ctx.fillStyle = watermark.color;
  ctx.font = `${watermark.fontSize}px Arial, sans-serif`;
  ctx.textBaseline = 'top';

  const padding = watermark.margin ?? 10;
  const textWidth = ctx.measureText(watermark.text).width;
  const textHeight = watermark.fontSize;

  // 获取水印类型，默认为 corner
  const watermarkType = watermark.type ?? 'corner';

  // 根据水印类型应用不同的效果
  switch (watermarkType) {
    case 'tiled':
      // 平铺水印
      applyTiledWatermark(ctx, canvas.width, canvas.height, watermark.text, textWidth, textHeight, padding);
      break;

    case 'diagonal':
      // 对角线平铺水印（类似 PDF 水印效果）
      applyDiagonalWatermark(ctx, canvas.width, canvas.height, watermark.text, textWidth, textHeight, padding, watermark.rotation ?? -45);
      break;

    case 'full':
      // 全页覆盖水印
      applyFullWatermark(ctx, canvas.width, canvas.height, watermark.text, textWidth, textHeight, watermark.rotation ?? -45, watermark.fontScale ?? 0.5);
      break;

    case 'corner':
    default:
      // 角落水印（原有逻辑）
      let x = padding;
      let y = padding;

      switch (watermark.position) {
        case 'top-right':
          x = canvas.width - textWidth - padding;
          break;
        case 'bottom-left':
          y = canvas.height - textHeight - padding;
          break;
        case 'bottom-right':
          x = canvas.width - textWidth - padding;
          y = canvas.height - textHeight - padding;
          break;
        case 'center':
          x = (canvas.width - textWidth) / 2;
          y = (canvas.height - textHeight) / 2;
          break;
      }

      ctx.fillText(watermark.text, x, y);
      break;
  }

  ctx.restore();

  return watermarkedCanvas;
}

// 平铺水印
function applyTiledWatermark(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  text: string,
  textWidth: number,
  textHeight: number,
  padding: number
): void {
  const spacing = Math.max(textWidth, textHeight) + padding * 2;

  for (let y = 0; y < canvasHeight + spacing; y += spacing) {
    for (let x = 0; x < canvasWidth + spacing; x += spacing) {
      ctx.fillText(text, x, y);
    }
  }
}

// 对角线平铺水印（类似 PDF 水印效果）
function applyDiagonalWatermark(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  text: string,
  textWidth: number,
  textHeight: number,
  padding: number,
  rotation: number
): void {
  const spacing = Math.max(textWidth, textHeight) + padding * 3;
  // 使用更大的范围以确保覆盖整个旋转后的画布
  const diagonal = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight) * 1.5;

  ctx.save();
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.rotate((rotation * Math.PI) / 180);

  // 从左上角到右下角平铺，覆盖整个区域
  for (let y = -diagonal; y < diagonal; y += spacing) {
    for (let x = -diagonal; x < diagonal; x += spacing) {
      ctx.fillText(text, x - textWidth / 2, y + textHeight / 3);
    }
  }

  ctx.restore();
}

// 全页覆盖水印
function applyFullWatermark(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  text: string,
  _textWidth: number,
  _textHeight: number,
  rotation: number,
  fontScale: number = 0.5
): void {
  ctx.save();
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.rotate((rotation * Math.PI) / 180);

  // 计算适合全页的字体大小，使用用户提供的缩放比例
  const baseFontSize = Math.max(canvasWidth, canvasHeight) / 5;
  const fontSize = baseFontSize * fontScale;
  ctx.font = `${fontSize}px Arial, sans-serif`;
  const scaledTextWidth = ctx.measureText(text).width;

  // 将水印绘制在中心，覆盖整个页面
  ctx.globalAlpha = 0.3; // 全页水印使用较低的透明度
  ctx.fillText(text, -scaledTextWidth / 2, fontSize / 3);

  ctx.restore();
}

function applyImageWatermark(
  canvas: HTMLCanvasElement,
  watermark: {
    imageData: string;
    width: number;
    height: number;
    position: string;
    opacity: number;
    scale: number;
    type?: 'corner' | 'tiled' | 'diagonal' | 'full';
    rotation?: number;
    spacing?: number;
    margin?: number;
    imageScale?: number;
  }
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const watermarkedCanvas = document.createElement('canvas');
      watermarkedCanvas.width = canvas.width;
      watermarkedCanvas.height = canvas.height;

      const ctx = watermarkedCanvas.getContext('2d')!;
      ctx.drawImage(canvas, 0, 0);

      // 计算水印图片的显示尺寸
      const scaledWidth = watermark.width * watermark.scale;
      const scaledHeight = watermark.height * watermark.scale;

      ctx.save();
      ctx.globalAlpha = watermark.opacity;

      // 获取水印类型，默认为 corner
      const watermarkType = watermark.type ?? 'corner';
      const padding = watermark.margin ?? 10;

      // 根据水印类型应用不同的效果
      switch (watermarkType) {
        case 'tiled':
          // 平铺水印
          applyTiledImageWatermark(ctx, canvas.width, canvas.height, img, scaledWidth, scaledHeight, padding);
          break;

        case 'diagonal':
          // 对角线平铺水印（类似 PDF 水印效果）
          applyDiagonalImageWatermark(ctx, canvas.width, canvas.height, img, scaledWidth, scaledHeight, padding, watermark.rotation ?? -45);
          break;

        case 'full':
          // 全页覆盖水印
          applyFullImageWatermark(ctx, canvas.width, canvas.height, img, scaledWidth, scaledHeight, watermark.rotation ?? -45, watermark.imageScale ?? 0.5);
          break;

        case 'corner':
        default:
          // 角落水印（原有逻辑）
          let x = padding;
          let y = padding;

          switch (watermark.position) {
            case 'top-right':
              x = canvas.width - scaledWidth - padding;
              break;
            case 'bottom-left':
              y = canvas.height - scaledHeight - padding;
              break;
            case 'bottom-right':
              x = canvas.width - scaledWidth - padding;
              y = canvas.height - scaledHeight - padding;
              break;
            case 'center':
              x = (canvas.width - scaledWidth) / 2;
              y = (canvas.height - scaledHeight) / 2;
              break;
          }

          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          break;
      }

      ctx.restore();

      resolve(watermarkedCanvas);
    };

    img.onerror = () => {
      reject(new Error('无法加载水印图片'));
    };

    img.src = watermark.imageData;
  });
}

// 平铺图片水印
function applyTiledImageWatermark(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  img: HTMLImageElement,
  scaledWidth: number,
  scaledHeight: number,
  padding: number
): void {
  const spacingX = scaledWidth + padding * 2;
  const spacingY = scaledHeight + padding * 2;

  for (let y = 0; y < canvasHeight + spacingY; y += spacingY) {
    for (let x = 0; x < canvasWidth + spacingX; x += spacingX) {
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    }
  }
}

// 对角线平铺图片水印（类似 PDF 水印效果）
function applyDiagonalImageWatermark(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  img: HTMLImageElement,
  scaledWidth: number,
  scaledHeight: number,
  padding: number,
  rotation: number
): void {
  const spacing = Math.max(scaledWidth, scaledHeight) + padding * 3;
  // 使用更大的范围以确保覆盖整个旋转后的画布
  const diagonal = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight) * 1.5;

  ctx.save();
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.rotate((rotation * Math.PI) / 180);

  // 从左上角到右下角平铺，覆盖整个区域
  for (let y = -diagonal; y < diagonal; y += spacing) {
    for (let x = -diagonal; x < diagonal; x += spacing) {
      ctx.drawImage(img, x - scaledWidth / 2, y - scaledHeight / 2, scaledWidth, scaledHeight);
    }
  }

  ctx.restore();
}

// 全页覆盖图片水印
function applyFullImageWatermark(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  img: HTMLImageElement,
  scaledWidth: number,
  scaledHeight: number,
  rotation: number,
  imageScale: number = 0.5
): void {
  ctx.save();
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.rotate((rotation * Math.PI) / 180);

  // 缩放水印以覆盖整个页面，使用用户提供的缩放比例
  const baseScale = Math.max(canvasWidth / scaledWidth, canvasHeight / scaledHeight) * 0.8;
  const finalScale = baseScale * imageScale;
  const finalWidth = scaledWidth * finalScale;
  const finalHeight = scaledHeight * finalScale;

  // 将水印绘制在中心，覆盖整个页面
  ctx.globalAlpha = 0.3; // 全页水印使用较低的透明度
  ctx.drawImage(img, -finalWidth / 2, -finalHeight / 2, finalWidth, finalHeight);

  ctx.restore();
}

// ========== PBM 格式转换（Portable Bitmap） ==========

async function convertToPbm(canvas: HTMLCanvasElement): Promise<Blob> {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let pbmContent = `P1\n${canvas.width} ${canvas.height}\n`;

  for (let y = 0; y < canvas.height; y++) {
    let row = '';
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      // 转换为灰度，然后取阈值生成二值图
      const gray = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
      const bit = gray > 128 ? 0 : 1;
      row += bit + ' ';
    }
    pbmContent += row.trim() + '\n';
  }

  return new Blob([pbmContent], { type: 'image/x-portable-bitmap' });
}

// ========== PGM 格式转换（Portable Graymap） ==========

async function convertToPgm(canvas: HTMLCanvasElement): Promise<Blob> {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let pgmContent = `P2\n${canvas.width} ${canvas.height}\n255\n`;

  for (let y = 0; y < canvas.height; y++) {
    let row = '';
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      // 转换为灰度
      const gray = Math.round(data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
      row += gray + ' ';
    }
    pgmContent += row.trim() + '\n';
  }

  return new Blob([pgmContent], { type: 'image/x-portable-graymap' });
}

// ========== PPM 格式转换（Portable Pixmap） ==========

async function convertToPpm(canvas: HTMLCanvasElement): Promise<Blob> {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let ppmContent = `P3\n${canvas.width} ${canvas.height}\n255\n`;

  for (let y = 0; y < canvas.height; y++) {
    let row = '';
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      row += `${data[idx]} ${data[idx + 1]} ${data[idx + 2]} `;
    }
    ppmContent += row.trim() + '\n';
  }

  return new Blob([ppmContent], { type: 'image/x-portable-pixmap' });
}

// ========== XBM 格式转换（X Bitmap） ==========

async function convertToXbm(canvas: HTMLCanvasElement): Promise<Blob> {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let xbmContent = `#define image_width ${canvas.width}\n#define image_height ${canvas.height}\nstatic unsigned char image_bits[] = {\n`;

  let byte = 0;
  let bitCount = 0;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
      const bit = gray > 128 ? 0 : 1;

      byte |= (bit << (7 - bitCount));
      bitCount++;

      if (bitCount === 8) {
        xbmContent += `  0x${byte.toString(16).padStart(2, '0')},\n`;
        byte = 0;
        bitCount = 0;
      }
    }
    // 处理行尾不完整的字节
    if (bitCount > 0) {
      xbmContent += `  0x${byte.toString(16).padStart(2, '0')},\n`;
      byte = 0;
      bitCount = 0;
    }
  }

  xbmContent += '};\n';

  return new Blob([xbmContent], { type: 'image/x-xbitmap' });
}

// ========== CUR 格式转换（Windows Cursor） ==========

async function convertToCur(canvas: HTMLCanvasElement, sizes: number[]): Promise<Blob> {
  // CUR 格式与 ICO 基本相同，只是头部类型不同
  const images: { size: number; data: ArrayBuffer }[] = [];

  for (const size of sizes) {
    const sizedCanvas = document.createElement('canvas');
    sizedCanvas.width = size;
    sizedCanvas.height = size;

    await pica.resize(canvas, sizedCanvas, {
      quality: 3,
      alpha: true,
    });

    const pngData = await canvasToBlob(sizedCanvas, 'image/png');
    const pngBuffer = await pngData.arrayBuffer();

    images.push({ size, data: pngBuffer });
  }

  // 创建 CUR 文件（与 ICO 类似，但使用不同的魔术字节）
  const numImages = images.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dataOffset = headerSize + dirEntrySize * numImages;

  let totalSize = dataOffset;
  for (const img of images) {
    totalSize += img.data.byteLength;
  }

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  let offset = 0;

  // CUR Header (6 bytes) - 与 ICO 相同但保留
  view.setUint16(offset, 0, true); offset += 2; // Reserved
  view.setUint16(offset, 2, true); offset += 2; // Type (2 = CUR)
  view.setUint16(offset, numImages, true); offset += 2; // Number of images

  const imageOffsets: number[] = [];
  for (const img of images) {
    view.setUint8(offset++, img.size >= 256 ? 0 : img.size); // Width
    view.setUint8(offset++, img.size >= 256 ? 0 : img.size); // Height
    view.setUint8(offset++, 0); // Color palette
    view.setUint8(offset++, 0); // Reserved
    view.setUint16(offset, 1, true); offset += 2; // Color planes
    view.setUint16(offset, 32, true); offset += 2; // Bits per pixel
    view.setUint32(offset, img.data.byteLength, true); offset += 4; // Size
    imageOffsets.push(offset);
    view.setUint32(offset, 0, true); offset += 4; // Offset (will be filled)
  }

  let currentOffset = dataOffset;
  for (let i = 0; i < images.length; i++) {
    view.setUint32(imageOffsets[i], currentOffset, true);

    const srcBytes = new Uint8Array(images[i].data);
    bytes.set(srcBytes, currentOffset);

    currentOffset += images[i].data.byteLength;
  }

  return new Blob([buffer], { type: 'image/x-icon' });
}

// ========== PCX 格式转换 ==========

async function convertToPcx(canvas: HTMLCanvasElement): Promise<Blob> {
  // PCX 是较老的格式，这里简化为 24 位色深
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const headerSize = 128;
  const linePadding = (4 - (canvas.width * 3) % 4) % 4; // PCX 行对齐
  const imageDataSize = (canvas.width * 3 + linePadding) * canvas.height;
  const totalSize = headerSize + imageDataSize + 2; // +2 for palette marker

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  let offset = 0;

  // PCX Header
  view.setUint8(offset++, 0x0A); // Manufacturer (PC Paintbrush)
  view.setUint8(offset++, 5); // Version (PC Paintbrush 3.0)
  view.setUint8(offset++, 1); // Encoding (RLE)
  view.setUint8(offset++, 8); // Bits per pixel
  view.setUint16(offset, 0, true); offset += 2; // Xmin
  view.setUint16(offset, 0, true); offset += 2; // Ymin
  view.setUint16(offset, canvas.width - 1, true); offset += 2; // Xmax
  view.setUint16(offset, canvas.height - 1, true); offset += 2; // Ymax
  view.setUint16(offset, canvas.width, true); offset += 2; // Horiz DPI
  view.setUint16(offset, canvas.height, true); offset += 2; // Vert DPI
  view.setUint8(offset++, 0); // Reserved
  view.setUint8(offset++, 1); // Color planes
  view.setUint16(offset, canvas.width * 3, true); offset += 2; // Bytes per line
  view.setUint16(offset, 1, true); offset += 2; // Palette type
  view.setUint16(offset, 0, true); offset += 2; // HScreen size
  view.setUint16(offset, 0, true); offset += 2; // VScreen size

  // Fill rest of header with zeros
  for (let i = 0; i < 54; i++) {
    view.setUint8(offset++, 0);
  }

  // RLE encoded image data
  for (let y = 0; y < canvas.height; y++) {
    let runLength = 0;
    let runValue = 0;
    let col = 0;

    while (col < canvas.width) {
      const idx = (y * canvas.width + col) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // 尝试压缩连续的相同像素
      while (col < canvas.width) {
        const nextIdx = (y * canvas.width + col) * 4;
        if (data[nextIdx] === r && data[nextIdx + 1] === g && data[nextIdx + 2] === b) {
          runLength++;
          col++;
          if (runLength === 63) break;
        } else {
          break;
        }
      }

      // 写入 RLE 数据
      if (runLength > 0 || col === 0) {
        if (runLength > 1 || (runValue & 0xC0) === 0xC0) {
          // 需要转义
          view.setUint8(offset++, 0xC0 | runLength);
        }
        view.setUint8(offset++, runValue);
      }

      if (runLength > 0 && col < canvas.width) {
        runLength = 0;
        runValue = 0;
      } else if (runLength === 0) {
        runValue = r;
        runLength = 1;
        col++;
      }
    }

    // 行对齐填充
    for (let i = 0; i < linePadding; i++) {
      view.setUint8(offset++, 0);
    }
  }

  // Palette marker
  view.setUint8(offset++, 0x0C);

  // 256 色调色板（简化为灰度）
  for (let i = 0; i < 256; i++) {
    const shade = Math.round((i / 255) * 255);
    view.setUint8(offset++, shade);
    view.setUint8(offset++, shade);
    view.setUint8(offset++, shade);
  }

  return new Blob([buffer], { type: 'image/pcx' });
}

// ========== WBMP 格式转换 ==========

async function convertToWbmp(canvas: HTMLCanvasElement): Promise<Blob> {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // WBMP 是单色位图格式
  const headerSize = 3; // Type (0) + Fixed (0) + Width (varint) + Height (varint)
  const rowPadding = (8 - (canvas.width % 8)) % 8;
  const rowBytes = Math.ceil(canvas.width / 8);
  const imageDataSize = rowBytes * canvas.height;
  const totalSize = headerSize + varintLength(canvas.width) + varintLength(canvas.height) + imageDataSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  let offset = 0;

  // WBMP Header
  view.setUint8(offset++, 0); // Type (MBM)
  view.setUint8(offset++, 0); // Fixed

  // 写入宽度和高度（变长整数）
  offset = writeVarint(view, offset, canvas.width);
  offset = writeVarint(view, offset, canvas.height);

  // 图像数据
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < rowBytes; x++) {
      let byte = 0;
      for (let bit = 0; bit < 8; bit++) {
        const pixelX = x * 8 + bit;
        if (pixelX < canvas.width) {
          const idx = (y * canvas.width + pixelX) * 4;
          const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
          if (gray > 128) {
            byte |= (1 << (7 - bit));
          }
        }
      }
      view.setUint8(offset++, byte);
    }
  }

  return new Blob([buffer], { type: 'image/vnd.wap.wbmp' });
}

// ========== QOI 格式转换（Quite OK Image） ==========

async function convertToQoi(canvas: HTMLCanvasElement): Promise<Blob> {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // QOI 文件头：8 字节 (magic: "qoif") + 4 字节宽度 + 4 字节高度 + 1 字节通道 + 1 字节色彩空间
  const headerSize = 14;
  const maxDataSize = canvas.width * canvas.height * (1 + 3 + 1) + 8; // 估算最大值
  const buffer = new ArrayBuffer(headerSize + maxDataSize);
  const bytes = new Uint8Array(buffer);

  let offset = 0;

  // QOI Header
  bytes.set([0x71, 0x6f, 0x69, 0x66], offset); offset += 4; // "qoif"
  const view = new DataView(buffer);
  view.setUint32(offset, canvas.width, false); offset += 4; // Width (big-endian)
  view.setUint32(offset, canvas.height, false); offset += 4; // Height
  bytes[offset++] = 4; // Channels (RGBA)
  bytes[offset++] = 0; // Color space (sRGB with linear alpha)

  let prevR = 0, prevG = 0, prevB = 0, prevA = 255;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      // 计算与前一个像素的差异
      const dr = r - prevR;
      const dg = g - prevG;
      const db = b - prevB;
      const da = a - prevA;

      // 尝试不同的编码方式
      if (r === prevR && g === prevG && b === prevB && a === prevA) {
        // QOI_OP_RUN: 连续相同像素
        bytes[offset++] = 0xC0 | Math.min(62, 0);
        continue;
      }

      if (da === 0 && prevA !== 0) {
        // QOI_OP_TRANS: 透明像素
        bytes[offset++] = 0xFE;
        bytes[offset++] = r;
        bytes[offset++] = g;
        bytes[offset++] = b;
        prevR = r; prevG = g; prevB = b; prevA = a;
        continue;
      }

      if (dr >= -2 && dr <= 1 && dg >= -2 && dg <= 1 && db >= -2 && db <= 1) {
        // QOI_OP_LUMA: 亮度差异编码
        const luma = (dg - 4) * 8 + dg;
        bytes[offset++] = 0x80 | (dg + 32);
        bytes[offset++] = (dr - dg + 8);
        bytes[offset++] = (db - dg + 8);
        prevR = r; prevG = g; prevB = b; prevA = a;
        continue;
      }

      if (r === prevR && g === prevG && b === prevB) {
        // QOI_OP_ALPHA: alpha 变化
        bytes[offset++] = 0xFF;
        bytes[offset++] = a;
        prevA = a;
        continue;
      }

      // QOI_OP_RGB: RGB 值
      bytes[offset++] = 0xFE;
      bytes[offset++] = r;
      bytes[offset++] = g;
      bytes[offset++] = b;
      prevR = r; prevG = g; prevB = b; prevA = a;
    }
  }

  // QOI 结束标记：8 字节
  bytes.set([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01], offset);

  return new Blob([buffer.slice(0, offset + 8)], { type: 'image/qoi' });
}

// 辅助函数：计算变长整数长度
function varintLength(value: number): number {
  if (value < 128) return 1;
  if (value < 16384) return 2;
  if (value < 2097152) return 3;
  return 4;
}

// 辅助函数：写入变长整数
function writeVarint(view: DataView, offset: number, value: number): number {
  while (value > 127) {
    view.setUint8(offset++, (value & 0x7F) | 0x80);
    value >>= 7;
  }
  view.setUint8(offset++, value);
  return offset;
}

// ========== ICO 格式转换（多尺寸支持） ==========

async function convertToIco(canvas: HTMLCanvasElement, sizes: number[]): Promise<Blob> {
  const images: { size: number; data: ArrayBuffer }[] = [];

  // 生成各个尺寸的图片数据
  for (const size of sizes) {
    const sizedCanvas = document.createElement('canvas');
    sizedCanvas.width = size;
    sizedCanvas.height = size;

    await pica.resize(canvas, sizedCanvas, {
      quality: 3,
      alpha: true,
    });

    const pngData = await canvasToBlob(sizedCanvas, 'image/png');
    const pngBuffer = await pngData.arrayBuffer();

    images.push({ size, data: pngBuffer });
  }

  // 创建 ICO 文件
  return createIcoFile(images);
}

function createIcoFile(images: { size: number; data: ArrayBuffer }[]): Blob {
  const numImages = images.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dataOffset = headerSize + dirEntrySize * numImages;

  // 计算总大小
  let totalSize = dataOffset;
  for (const img of images) {
    totalSize += img.data.byteLength;
  }

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  let offset = 0;

  // ICO Header (6 bytes)
  view.setUint16(offset, 0, true); offset += 2; // Reserved
  view.setUint16(offset, 1, true); offset += 2; // Type (1 = ICO)
  view.setUint16(offset, numImages, true); offset += 2; // Number of images

  // Directory Entries
  const imageOffsets: number[] = [];
  for (const img of images) {
    view.setUint8(offset++, img.size >= 256 ? 0 : img.size); // Width
    view.setUint8(offset++, img.size >= 256 ? 0 : img.size); // Height
    view.setUint8(offset++, 0); // Color palette
    view.setUint8(offset++, 0); // Reserved
    view.setUint16(offset, 1, true); offset += 2; // Color planes
    view.setUint16(offset, 32, true); offset += 2; // Bits per pixel
    view.setUint32(offset, img.data.byteLength, true); offset += 4; // Size
    imageOffsets.push(offset);
    view.setUint32(offset, 0, true); offset += 4; // Offset (will be filled)
  }

  // Fill in offsets and copy image data
  let currentOffset = dataOffset;
  for (let i = 0; i < images.length; i++) {
    view.setUint32(imageOffsets[i], currentOffset, true);

    const srcBytes = new Uint8Array(images[i].data);
    bytes.set(srcBytes, currentOffset);

    currentOffset += images[i].data.byteLength;
  }

  return new Blob([buffer], { type: 'image/x-icon' });
}

// ========== ICNS 格式转换（macOS 图标格式） ==========

async function convertToIcns(canvas: HTMLCanvasElement, sizes: number[]): Promise<Blob> {
  const images: { size: number; data: ArrayBuffer; ostype: string }[] = [];

  // 生成各个尺寸的图片数据
  for (const size of sizes) {
    if (!ICNS_OSTYPES[size]) continue;

    const sizedCanvas = document.createElement('canvas');
    sizedCanvas.width = size;
    sizedCanvas.height = size;

    await pica.resize(canvas, sizedCanvas, {
      quality: 3,
      alpha: true,
    });

    const pngData = await canvasToBlob(sizedCanvas, 'image/png');
    const pngBuffer = await pngData.arrayBuffer();

    images.push({ size, data: pngBuffer, ostype: ICNS_OSTYPES[size] });
  }

  return createIcnsFile(images);
}

function createIcnsFile(images: { size: number; data: ArrayBuffer; ostype: string }[]): Blob {
  const headerSize = 8; // Magic (4) + File length (4)
  const entrySize = 8; // OSType (4) + Data length (4)

  // 计算总大小
  let totalSize = headerSize;
  for (const img of images) {
    totalSize += entrySize + img.data.byteLength;
  }

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  let offset = 0;

  // ICNS Header
  bytes.set([0x69, 0x63, 0x6e, 0x73], offset); offset += 4; // 'icns'
  view.setUint32(offset, totalSize, true); offset += 4; // File length

  // Icon entries
  for (const img of images) {
    // OSType (4 bytes)
    const ostypeBytes = stringToBytes(img.ostype);
    bytes.set(ostypeBytes, offset); offset += 4;

    // Data length (4 bytes)
    view.setUint32(offset, img.data.byteLength, true); offset += 4;

    // Image data
    const srcBytes = new Uint8Array(img.data);
    bytes.set(srcBytes, offset);
    offset += img.data.byteLength;
  }

  return new Blob([buffer], { type: 'image/icns' });
}

function stringToBytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}

// ========== SVG 格式转换 ==========

async function convertToSvg(canvas: HTMLCanvasElement): Promise<Blob> {
  // 获取 Canvas 的像素数据
  const dataUrl = canvas.toDataURL('image/png');

  // 创建 SVG 内容
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
  <image width="${canvas.width}" height="${canvas.height}" xlink:href="${dataUrl}"/>
</svg>`;

  return new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
}

// ========== PDF 格式转换 ==========

async function convertToPdf(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  // 计算 PDF 尺寸（毫米）
  // 1 像素 ≈ 0.264583 毫米（以 96 DPI 计算）
  const widthMm = (canvas.width * 25.4) / 96;
  const heightMm = (canvas.height * 25.4) / 96;

  // 创建 PDF（使用实际尺寸）
  const pdf = new jsPDF({
    orientation: widthMm > heightMm ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [widthMm, heightMm],
  });

  // 将 Canvas 转换为 JPEG 图片数据
  const imgData = canvas.toDataURL('image/jpeg', quality / 100);

  // 添加图片到 PDF
  pdf.addImage(imgData, 'JPEG', 0, 0, widthMm, heightMm);

  return pdf.output('blob');
}

// ========== JPEG 2000 格式转换 ==========

async function convertToJp2(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  // 浏览器原生不支持 JPEG 2000，尝试使用 canvas.toBlob 如果支持
  // 否则降级为高质量 JPEG
  try {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (b) => resolve(b),
        'image/jp2',
        quality / 100
      );
    });

    if (blob && blob.size > 0) {
      return blob;
    }
  } catch {
    // 忽略错误
  }

  // 降级方案：返回高质量 JPEG 并提示用户
  console.warn('浏览器不支持 JPEG 2000 格式，降级为 JPEG');

  // 尝试返回 JPEG 格式
  const jpegBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('无法创建图片'));
      },
      'image/jpeg',
      quality / 100
    );
  });

  return jpegBlob;
}
