import { reactive, computed } from 'vue';
import { ImageFile, ImageFormat, AdvancedSettings, generateId, getFormatFromMimeType } from '../types';
import { convertImage } from '../utils/imageConverter';

interface ImageState {
  files: ImageFile[];
  targetFormat: ImageFormat;
  settings: AdvancedSettings;
  isConverting: boolean;
}

const defaultSettings: AdvancedSettings = {
  quality: 90,
  fileNamePrefix: '',
  fileNameSuffix: '_converted',
  enableResize: false,
  resizeWidth: 1920,
  resizeHeight: 1080,
  maintainAspectRatio: true,
  rotate: 0,
  flip: false,
  flop: false,
  enableCrop: false,
  cropX: 0,
  cropY: 0,
  cropWidth: 100,
  cropHeight: 100,
  enableAdjustment: false,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  enableFilter: false,
  blur: 0,
  sharpen: 0,
  grayscale: false,
  sepia: false,
  invert: false,
  enableWatermark: false,
  watermarkType: 'text' as const,
  watermarkText: '',
  watermarkColor: '#FFFFFF',
  watermarkFontSize: 24,
  watermarkPosition: 'bottom-right' as const,
  watermarkOpacity: 0.5,
  watermarkStyleType: 'corner' as const,
  watermarkRotation: -45,
  watermarkSpacing: 200,
  watermarkMargin: 50,
  watermarkFontScale: 0.5,
  watermarkImage: '',
  watermarkImageWidth: 100,
  watermarkImageHeight: 100,
  watermarkImageScale: 1,
  watermarkImagePosition: 'bottom-right' as const,
  watermarkImageOpacity: 0.5,
  watermarkImageStyleType: 'corner' as const,
  watermarkImageRotation: -45,
  watermarkImageSpacing: 200,
  watermarkImageMargin: 50,
  watermarkImageImageScale: 0.5,
  backgroundColor: '',
  iconSizes: [16, 32, 48, 64, 128, 256],
  enableCompression: false,
  compressionLevel: 6,
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

// 创建响应式 store
const state = reactive<ImageState>({
  files: [],
  targetFormat: 'jpeg',
  settings: defaultSettings,
  isConverting: false,
});

// Actions
async function addFiles(files: File[]) {
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

  state.files = [...state.files, ...newFiles];
}

function removeFile(id: string) {
  const file = state.files.find((f) => f.id === id);
  if (file) {
    URL.revokeObjectURL(file.previewUrl);
    if (file.convertedUrl) {
      URL.revokeObjectURL(file.convertedUrl);
    }
  }
  state.files = state.files.filter((f) => f.id !== id);
}

function clearFiles() {
  state.files.forEach((file) => {
    URL.revokeObjectURL(file.previewUrl);
    if (file.convertedUrl) {
      URL.revokeObjectURL(file.convertedUrl);
    }
  });
  state.files = [];
}

function setTargetFormat(format: ImageFormat) {
  state.targetFormat = format;
}

function updateSettings(settings: Partial<AdvancedSettings>) {
  state.settings = { ...state.settings, ...settings };
}

function updateFileStatus(id: string, updates: Partial<ImageFile>) {
  state.files = state.files.map((f) =>
    f.id === id ? { ...f, ...updates } : f
  );
}

async function convertSingle(id: string) {
  const file = state.files.find((f) => f.id === id);
  if (!file) return;

  const { targetFormat, settings } = state;

  updateFileStatus(id, { status: 'converting', progress: 0 });

  try {
    const options: any = {
      targetFormat,
      quality: settings.quality,
    };

    if (settings.enableResize) {
      options.resize = {
        width: settings.resizeWidth,
        height: settings.resizeHeight,
        maintainAspectRatio: settings.maintainAspectRatio,
      };
    }

    if (settings.rotate !== 0) {
      options.rotate = settings.rotate;
    }

    if (settings.flip || settings.flop) {
      options.flip = settings.flip;
      options.flop = settings.flop;
    }

    if (settings.enableCrop) {
      options.crop = {
        x: settings.cropX,
        y: settings.cropY,
        width: settings.cropWidth,
        height: settings.cropHeight,
      };
    }

    if (settings.enableAdjustment) {
      options.adjustment = {
        brightness: settings.brightness,
        contrast: settings.contrast,
        saturation: settings.saturation,
      };
    }

    if (settings.enableFilter) {
      options.filter = {
        blur: settings.blur,
        sharpen: settings.sharpen,
        grayscale: settings.grayscale,
        sepia: settings.sepia,
        invert: settings.invert,
      };
    }

    if (settings.enableWatermark && settings.watermarkType === 'text' && settings.watermarkText) {
      options.watermark = {
        text: settings.watermarkText,
        color: settings.watermarkColor,
        fontSize: settings.watermarkFontSize,
        position: settings.watermarkPosition,
        opacity: settings.watermarkOpacity,
        type: settings.watermarkStyleType,
        rotation: settings.watermarkRotation,
        spacing: settings.watermarkSpacing,
        margin: settings.watermarkMargin,
        fontScale: settings.watermarkFontScale,
      };
    }

    if (settings.enableWatermark && settings.watermarkType === 'image' && settings.watermarkImage) {
      options.imageWatermark = {
        imageData: settings.watermarkImage,
        width: settings.watermarkImageWidth,
        height: settings.watermarkImageHeight,
        position: settings.watermarkImagePosition,
        opacity: settings.watermarkImageOpacity,
        scale: settings.watermarkImageScale,
        type: settings.watermarkImageStyleType,
        rotation: settings.watermarkImageRotation,
        spacing: settings.watermarkImageSpacing,
        margin: settings.watermarkImageMargin,
        imageScale: settings.watermarkImageImageScale,
      };
    }

    if (settings.backgroundColor) {
      options.backgroundColor = settings.backgroundColor;
    }

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
}

async function convertAll() {
  if (state.isConverting) return;

  state.isConverting = true;

  const pendingFiles = state.files.filter(
    (f) => f.status === 'pending' || f.status === 'failed'
  );

  const concurrency = 3;
  const queue = [...pendingFiles];
  const executing: Promise<void>[] = [];

  while (queue.length > 0 || executing.length > 0) {
    while (executing.length < concurrency && queue.length > 0) {
      const file = queue.shift()!;
      const promise = convertSingle(file.id).then(() => {
        executing.splice(executing.indexOf(promise), 1);
      });
      executing.push(promise);
    }

    if (executing.length > 0) {
      await Promise.race(executing);
    }
  }

  state.isConverting = false;
}

// 导出 store 和方法
export function useImageStore() {
  return {
    // state
    get files() { return state.files; },
    get targetFormat() { return state.targetFormat; },
    get settings() { return state.settings; },
    get isConverting() { return state.isConverting; },

    // computed
    completedFiles: computed(() => state.files.filter((f) => f.status === 'completed')),
    hasFilesToConvert: computed(() => state.files.some((f) => f.status === 'pending' || f.status === 'failed')),

    // actions
    addFiles,
    removeFile,
    clearFiles,
    setTargetFormat,
    updateSettings,
    updateFileStatus,
    convertSingle,
    convertAll,
  };
}
