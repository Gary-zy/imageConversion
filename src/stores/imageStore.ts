import { create } from 'zustand';
import { ImageFile, ImageFormat, AdvancedSettings, generateId, getFormatFromMimeType } from '../types';
import { convertImage } from '../utils/imageConverter';

interface ImageState {
  files: ImageFile[];
  targetFormat: ImageFormat;
  settings: AdvancedSettings;
  isConverting: boolean;

  // Actions
  addFiles: (files: File[]) => Promise<void>;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  setTargetFormat: (format: ImageFormat) => void;
  updateSettings: (settings: Partial<AdvancedSettings>) => void;
  convertAll: () => Promise<void>;
  convertSingle: (id: string) => Promise<void>;
  updateFileStatus: (id: string, updates: Partial<ImageFile>) => void;
}

const defaultSettings: AdvancedSettings = {
  // 基础设置
  quality: 90,
  fileNamePrefix: '',
  fileNameSuffix: '_converted',

  // 尺寸调整
  enableResize: false,
  resizeWidth: 1920,
  resizeHeight: 1080,
  maintainAspectRatio: true,

  // 旋转和翻转
  rotate: 0,
  flip: false,
  flop: false,

  // 裁剪
  enableCrop: false,
  cropX: 0,
  cropY: 0,
  cropWidth: 100,
  cropHeight: 100,

  // 图片调整
  enableAdjustment: false,
  brightness: 0,
  contrast: 0,
  saturation: 0,

  // 滤镜
  enableFilter: false,
  blur: 0,
  sharpen: 0,
  grayscale: false,
  sepia: false,
  invert: false,

  // 水印
  enableWatermark: false,
  watermarkType: 'text' as const,
  watermarkText: '',
  watermarkColor: '#FFFFFF',
  watermarkFontSize: 24,
  watermarkPosition: 'bottom-right' as const,
  watermarkOpacity: 0.5,
  // 新增：PDF 风格水印选项
  watermarkStyleType: 'corner' as const,
  watermarkRotation: -45,
  watermarkSpacing: 200,
  watermarkMargin: 50,
  watermarkFontScale: 0.5, // 全页水印字体缩放比例 (0.1 - 1.0)
  // 图片水印
  watermarkImage: '',
  watermarkImageWidth: 100,
  watermarkImageHeight: 100,
  watermarkImageScale: 1,
  watermarkImagePosition: 'bottom-right' as const,
  watermarkImageOpacity: 0.5,
  // 新增：PDF 风格水印选项（图片水印）
  watermarkImageStyleType: 'corner' as const,
  watermarkImageRotation: -45,
  watermarkImageSpacing: 200,
  watermarkImageMargin: 50,
  watermarkImageImageScale: 0.5, // 全页水印图片缩放比例 (0.1 - 1.0)

  // 背景色
  backgroundColor: '',

  // 图标尺寸
  iconSizes: [16, 32, 48, 64, 128, 256],

  // 新增：压缩选项
  enableCompression: false,
  compressionLevel: 6,

  // 新增：去噪
  enableDenoise: false,
  denoiseLevel: 0,
};

// 读取图片信息
async function getImageInfo(file: File): Promise<{ width: number; height: number; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const previewUrl = URL.createObjectURL(file);

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        previewUrl,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      reject(new Error('无法加载图片'));
    };

    img.src = previewUrl;
  });
}

export const useImageStore = create<ImageState>((set, get) => ({
  files: [],
  targetFormat: 'jpeg',
  settings: defaultSettings,
  isConverting: false,

  addFiles: async (files: File[]) => {
    const newFiles: ImageFile[] = [];

    for (const file of files) {
      try {
        const info = await getImageInfo(file);
        const imageFile: ImageFile = {
          id: generateId(),
          file,
          name: file.name,
          size: file.size,
          width: info.width,
          height: info.height,
          format: getFormatFromMimeType(file.type),
          previewUrl: info.previewUrl,
          status: 'pending',
          progress: 0,
        };
        newFiles.push(imageFile);
      } catch (error) {
        console.error('Failed to load image:', file.name, error);
      }
    }

    set((state) => ({
      files: [...state.files, ...newFiles],
    }));
  },

  removeFile: (id: string) => {
    const state = get();
    const file = state.files.find((f) => f.id === id);
    if (file) {
      URL.revokeObjectURL(file.previewUrl);
      if (file.convertedUrl) {
        URL.revokeObjectURL(file.convertedUrl);
      }
    }
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
    }));
  },

  clearFiles: () => {
    const state = get();
    state.files.forEach((file) => {
      URL.revokeObjectURL(file.previewUrl);
      if (file.convertedUrl) {
        URL.revokeObjectURL(file.convertedUrl);
      }
    });
    set({ files: [] });
  },

  setTargetFormat: (format: ImageFormat) => {
    set({ targetFormat: format });
  },

  updateSettings: (settings: Partial<AdvancedSettings>) => {
    set((state) => ({
      settings: { ...state.settings, ...settings },
    }));
  },

  updateFileStatus: (id: string, updates: Partial<ImageFile>) => {
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    }));
  },

  convertSingle: async (id: string) => {
    const state = get();
    const file = state.files.find((f) => f.id === id);
    if (!file) return;

    const { targetFormat, settings, updateFileStatus } = state;

    updateFileStatus(id, { status: 'converting', progress: 0 });

    try {
      // 构建转换选项
      const options: Parameters<typeof convertImage>[1] = {
        targetFormat,
        quality: settings.quality,
      };

      // 尺寸调整
      if (settings.enableResize) {
        options.resize = {
          width: settings.resizeWidth,
          height: settings.resizeHeight,
          maintainAspectRatio: settings.maintainAspectRatio,
        };
      }

      // 旋转
      if (settings.rotate !== 0) {
        options.rotate = settings.rotate;
      }

      // 翻转
      if (settings.flip || settings.flop) {
        options.flip = settings.flip;
        options.flop = settings.flop;
      }

      // 裁剪
      if (settings.enableCrop) {
        options.crop = {
          x: settings.cropX,
          y: settings.cropY,
          width: settings.cropWidth,
          height: settings.cropHeight,
        };
      }

      // 图片调整
      if (settings.enableAdjustment) {
        options.adjustment = {
          brightness: settings.brightness,
          contrast: settings.contrast,
          saturation: settings.saturation,
        };
      }

      // 滤镜
      if (settings.enableFilter) {
        options.filter = {
          blur: settings.blur,
          sharpen: settings.sharpen,
          grayscale: settings.grayscale,
          sepia: settings.sepia,
          invert: settings.invert,
        };
      }

      // 文字水印
      if (settings.enableWatermark && settings.watermarkType === 'text' && settings.watermarkText) {
        options.watermark = {
          text: settings.watermarkText,
          color: settings.watermarkColor,
          fontSize: settings.watermarkFontSize,
          position: settings.watermarkPosition,
          opacity: settings.watermarkOpacity,
          // 新增：PDF 风格水印选项
          type: settings.watermarkStyleType,
          rotation: settings.watermarkRotation,
          spacing: settings.watermarkSpacing,
          margin: settings.watermarkMargin,
          fontScale: settings.watermarkFontScale,
        };
      }

      // 图片水印
      if (settings.enableWatermark && settings.watermarkType === 'image' && settings.watermarkImage) {
        options.imageWatermark = {
          imageData: settings.watermarkImage,
          width: settings.watermarkImageWidth,
          height: settings.watermarkImageHeight,
          position: settings.watermarkImagePosition,
          opacity: settings.watermarkImageOpacity,
          scale: settings.watermarkImageScale,
          // 新增：PDF 风格水印选项
          type: settings.watermarkImageStyleType,
          rotation: settings.watermarkImageRotation,
          spacing: settings.watermarkImageSpacing,
          margin: settings.watermarkImageMargin,
          imageScale: settings.watermarkImageImageScale,
        };
      }

      // 背景色
      if (settings.backgroundColor) {
        options.backgroundColor = settings.backgroundColor;
      }

      // 图标尺寸
      if (targetFormat === 'ico' || targetFormat === 'icns') {
        options.iconSizes = settings.iconSizes;
      }

      const blob = await convertImage(file.file, options);

      const convertedUrl = URL.createObjectURL(blob);

      updateFileStatus(id, {
        status: 'completed',
        progress: 100,
        convertedBlob: blob,
        convertedSize: blob.size,
        convertedUrl,
      });
    } catch (error) {
      updateFileStatus(id, {
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : '转换失败',
      });
    }
  },

  convertAll: async () => {
    const state = get();
    if (state.isConverting) return;

    set({ isConverting: true });

    const pendingFiles = state.files.filter(
      (f) => f.status === 'pending' || f.status === 'failed'
    );

    // 并发控制，最多同时处理 3 个
    const concurrency = 3;
    const queue = [...pendingFiles];
    const executing: Promise<void>[] = [];

    while (queue.length > 0 || executing.length > 0) {
      while (executing.length < concurrency && queue.length > 0) {
        const file = queue.shift()!;
        const promise = get().convertSingle(file.id).then(() => {
          executing.splice(executing.indexOf(promise), 1);
        });
        executing.push(promise);
      }

      if (executing.length > 0) {
        await Promise.race(executing);
      }
    }

    set({ isConverting: false });
  },
}));
