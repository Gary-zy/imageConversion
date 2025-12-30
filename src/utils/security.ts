/**
 * 文件安全验证
 */

// 文件验证配置
export interface FileValidationConfig {
  maxSize: number; // 字节
  allowedTypes: string[];
  allowedExtensions: string[];
  checkMagicNumber: boolean;
  maxWidth?: number;
  maxHeight?: number;
  maxPixelCount?: number;
}

// 验证结果
export interface ValidationResult {
  valid: boolean;
  mimeType: string;
  detectedFormat: string;
  warnings: string[];
  errors: string[];
  metadata?: FileMetadata;
}

// 文件元数据
export interface FileMetadata {
  width?: number;
  height?: number;
  colorSpace?: string;
  hasAlpha?: boolean;
  orientation?: number;
}

// 默认配置
export const defaultValidationConfig: FileValidationConfig = {
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
    'image/tiff',
    'image/tga',
    'image/ico',
    'image/x-icon',
    'image/vnd.microsoft.icon',
    'image/heic',
    'image/heif',
    'image/avif',
  ],
  allowedExtensions: [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.bmp',
    '.svg',
    '.tiff',
    '.tif',
    '.tga',
    '.ico',
    '.heic',
    '.heif',
    '.avif',
  ],
  checkMagicNumber: true,
  maxWidth: 16384,
  maxHeight: 16384,
  maxPixelCount: 16384 * 16384, // 约 2.68 亿像素
};

// 常用图片格式的魔数
const MAGIC_NUMBERS: Record<string, Uint8Array> = {
  // JPEG
  'image/jpeg': new Uint8Array([0xFF, 0xD8, 0xFF]),
  // PNG
  'image/png': new Uint8Array([0x89, 0x50, 0x4E, 0x47]),
  // GIF
  'image/gif': new Uint8Array([0x47, 0x49, 0x46, 0x38]),
  // WebP
  'image/webp': new Uint8Array([0x52, 0x49, 0x46, 0x46]),
  // BMP
  'image/bmp': new Uint8Array([0x42, 0x4D]),
  // TIFF
  'image/tiff': new Uint8Array([0x49, 0x49, 0x2A, 0x00]),
  // SVG (XML)
  'image/svg+xml': new Uint8Array([0x3C, 0x73, 0x76, 0x67]),
  // ICO
  'image/x-icon': new Uint8Array([0x00, 0x00, 0x01, 0x00]),
};

/**
 * 验证文件
 */
export async function validateFile(
  file: File,
  config: Partial<FileValidationConfig> = {}
): Promise<ValidationResult> {
  const fullConfig = { ...defaultValidationConfig, ...config };
  const result: ValidationResult = {
    valid: true,
    mimeType: file.type || 'application/octet-stream',
    detectedFormat: '',
    warnings: [],
    errors: [],
  };

  // 1. 检查文件大小
  if (file.size > fullConfig.maxSize) {
    result.errors.push(
      `文件大小 ${formatBytes(file.size)} 超过限制 ${formatBytes(fullConfig.maxSize)}`
    );
    result.valid = false;
  }

  // 2. 检查文件扩展名
  const ext = getFileExtension(file.name).toLowerCase();
  if (
    fullConfig.allowedExtensions.length > 0 &&
    !fullConfig.allowedExtensions.includes(`.${ext}`)
  ) {
    result.errors.push(`不支持的文件扩展名: .${ext}`);
    result.valid = false;
  }

  // 3. 检查 MIME 类型
  if (
    fullConfig.allowedTypes.length > 0 &&
    !fullConfig.allowedTypes.includes(result.mimeType)
  ) {
    // 尝试通过魔数检测真实类型
    const detectedType = await detectMimeType(file);
    if (detectedType && fullConfig.allowedTypes.includes(detectedType)) {
      result.mimeType = detectedType;
      result.detectedFormat = detectedType;
      result.warnings.push(`文件扩展名与实际格式不符，检测到: ${detectedType}`);
    } else {
      result.errors.push(`不支持的文件类型: ${result.mimeType}`);
      result.valid = false;
    }
  }

  // 4. 魔数验证
  if (fullConfig.checkMagicNumber && result.valid) {
    const magicValid = await validateMagicNumber(file, result.mimeType);
    if (!magicValid) {
      result.errors.push('文件魔数不匹配，可能文件已损坏或格式错误');
      result.valid = false;
    }
  }

  // 5. 获取并验证图片尺寸
  try {
    const metadata = await getImageMetadata(file);
    if (metadata) {
      result.metadata = metadata;

      if (
        fullConfig.maxWidth &&
        (metadata.width ?? 0) > fullConfig.maxWidth
      ) {
        result.errors.push(
          `图片宽度 ${metadata.width} 超过限制 ${fullConfig.maxWidth}`
        );
        result.valid = false;
      }

      if (
        fullConfig.maxHeight &&
        (metadata.height ?? 0) > fullConfig.maxHeight
      ) {
        result.errors.push(
          `图片高度 ${metadata.height} 超过限制 ${fullConfig.maxHeight}`
        );
        result.valid = false;
      }

      if (fullConfig.maxPixelCount) {
        const pixelCount = (metadata.width ?? 0) * (metadata.height ?? 0);
        if (pixelCount > fullConfig.maxPixelCount) {
          result.errors.push(
            `图片像素数 ${formatNumber(pixelCount)} 超过限制 ${formatNumber(fullConfig.maxPixelCount)}`
          );
          result.valid = false;
        }
      }
    }
  } catch (error) {
    result.warnings.push('无法获取图片元数据');
  }

  return result;
}

/**
 * 检测真实 MIME 类型
 */
export async function detectMimeType(file: File): Promise<string | null> {
  try {
    const buffer = await readFileHead(file, 16);
    const uint8 = new Uint8Array(buffer);

    // 检查各格式的魔数
    for (const [mimeType, magic] of Object.entries(MAGIC_NUMBERS)) {
      if (matchesMagicNumber(uint8, magic)) {
        return mimeType;
      }
    }

    // WebP 特殊检查（RIFF 容器）
    if (matchesWebp(uint8)) {
      return 'image/webp';
    }

    // ICO 特殊检查
    if (matchesIco(uint8)) {
      return 'image/x-icon';
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * 检查 WebP 格式
 */
function matchesWebp(uint8: Uint8Array): boolean {
  // RIFF 头 + WebP 标识
  if (uint8.length < 12) return false;

  return (
    uint8[0] === 0x52 && // R
    uint8[1] === 0x49 && // I
    uint8[2] === 0x46 && // F
    uint8[3] === 0x46 && // F
    uint8[8] === 0x57 && // W
    uint8[9] === 0x45 && // E
    uint8[10] === 0x42 && // B
    uint8[11] === 0x50 // P
  );
}

/**
 * 检查 ICO 格式
 */
function matchesIco(uint8: Uint8Array): boolean {
  if (uint8.length < 4) return false;

  // ICONDIR: 0x00 0x00 + 类型 (1 = ICO)
  return uint8[0] === 0x00 && uint8[1] === 0x00 && uint8[2] === 0x01;
}

/**
 * 匹配魔数
 */
function matchesMagicNumber(
  uint8: Uint8Array,
  magic: Uint8Array
): boolean {
  if (uint8.length < magic.length) return false;

  for (let i = 0; i < magic.length; i++) {
    if (uint8[i] !== magic[i]) return false;
  }

  return true;
}

/**
 * 验证魔数
 */
async function validateMagicNumber(
  file: File,
  expectedType: string
): Promise<boolean> {
  const magic = MAGIC_NUMBERS[expectedType];
  if (!magic) return true; // 未知类型，跳过检查

  try {
    const buffer = await readFileHead(file, magic.length);
    const uint8 = new Uint8Array(buffer);
    return matchesMagicNumber(uint8, magic);
  } catch {
    return false;
  }
}

/**
 * 读取文件头部
 */
async function readFileHead(
  file: File,
  bytes: number
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsArrayBuffer(file.slice(0, bytes));
  });
}

/**
 * 获取图片元数据
 */
export async function getImageMetadata(
  file: File
): Promise<FileMetadata | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        hasAlpha: checkAlphaChannel(img),
      });

      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}

/**
 * 检查图片是否有 alpha 通道
 */
function checkAlphaChannel(img: HTMLImageElement): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');

  if (!ctx) return false;

  ctx.drawImage(img, 0, 0, 1, 1);
  const data = ctx.getImageData(0, 0, 1, 1).data;

  return data[3] < 255;
}

/**
 * 获取文件扩展名
 */
function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()! : '';
}

/**
 * 格式化字节数
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * 格式化数字
 */
function formatNumber(num: number): string {
  if (num >= 1e8) return `${(num / 1e8).toFixed(1)} 亿`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)} 百万`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)} 千`;
  return num.toString();
}

/**
 * 安全处理文件
 */
export async function safeProcessFile(
  file: File,
  processor: (file: File) => Promise<Blob>,
  config: Partial<FileValidationConfig> = {}
): Promise<{ success: boolean; result?: Blob; error?: string }> {
  try {
    // 先验证文件
    const validation = await validateFile(file, config);

    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join('; '),
      };
    }

    // 处理文件
    const result = await processor(file);
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '处理失败',
    };
  }
}

/**
 * 清理文件名（防止路径遍历）
 */
export function sanitizeFilename(filename: string): string {
  // 移除危险字符
  const dangerous = /[<>:"/\\|?*\x00-\x1F]/g;
  const cleaned = filename.replace(dangerous, '_');

  // 移除首尾空格和点
  const trimmed = cleaned.trim().replace(/^\.+|\.+$/g, '');

  // 限制长度
  const maxLength = 255;
  if (trimmed.length > maxLength) {
    const ext = getFileExtension(trimmed);
    const base = trimmed.slice(0, maxLength - ext.length - 1);
    return `${base}.${ext}`;
  }

  return trimmed || 'unnamed_file';
}

