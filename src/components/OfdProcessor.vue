<template>
  <div class="max-w-7xl mx-auto p-6">
    <!-- 文件上传区域 -->
    <div
      v-if="!converter"
      @drop="handleDrop"
      @dragover="handleDragOver"
      class="border-2 border-dashed border-ink-300 dark:border-ink-600 rounded-lg p-12 text-center cursor-pointer hover:border-ink-500 dark:hover:border-ink-400 bg-ink-50 dark:bg-ink-800 transition-colors duration-300"
      @click="fileInputRef?.click()"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept=".ofd"
        @change="(e) => {
          const selectedFile = (e.target as HTMLInputElement).files?.[0];
          if (selectedFile) handleFileUpload(selectedFile);
        }"
        class="hidden"
      />
      <div class="text-4xl mb-4">📄</div>
      <h3 class="text-lg font-serif font-semibold mb-2 text-ink-800 dark:text-ink-100">拖拽 OFD 文件到此处</h3>
      <p class="text-ink-600 dark:text-ink-400 mb-4">或点击选择文件</p>
      <p class="text-sm text-ink-500 dark:text-ink-500">支持 .ofd 格式，最大 50MB</p>
    </div>

    <!-- 加载进度 -->
    <div v-if="converting && !converter" class="bg-ink-50 dark:bg-ink-800 rounded-lg p-6 shadow-ink dark:shadow-ink-dark border border-ink-200 dark:border-ink-700">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-ink-700 dark:text-ink-300">{{ progress.status }}</span>
        <span class="text-sm text-ink-600 dark:text-ink-400">
          {{ progress.current }} / {{ progress.total }}
        </span>
      </div>
      <div class="w-full bg-ink-200 dark:bg-ink-600 rounded-full h-2">
        <div
          class="bg-ink-700 dark:bg-ink-300 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${(progress.current / progress.total) * 100}%` }"
        />
      </div>
    </div>

    <!-- 主内容区域 -->
    <div v-if="converter" class="flex flex-col gap-6">
      <!-- 预览区域 - 上方 -->
      <div class="w-full">
        <h2 class="text-lg font-serif font-semibold mb-4 text-ink-800 dark:text-ink-100">文档预览</h2>
        <OfdPreview
          :converter="converter"
          :current-page="currentPage"
          @update:current-page="setCurrentPage"
          :scale="scale"
          @update:scale="setScale"
        />
      </div>

      <!-- 设置区域 - 下方 -->
      <div class="w-full">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 文件信息 -->
          <div class="bg-ink-50 dark:bg-ink-800 rounded-lg p-4 shadow-ink dark:shadow-ink-dark border border-ink-200 dark:border-ink-700 h-fit">
            <h3 class="font-serif font-semibold mb-2 text-ink-800 dark:text-ink-100">文件信息</h3>
            <div class="text-sm text-ink-600 dark:text-ink-400 space-y-1">
              <p>文件名: {{ file?.name }}</p>
              <p>文件大小: {{ (file?.size || 0) / 1024 / 1024 }} MB</p>
              <p>总页数: {{ converter.getPageCount() }}</p>
            </div>
            <button
              @click="handleReset"
              class="mt-3 px-4 py-2 text-sm bg-ink-200 dark:bg-ink-700 hover:bg-ink-300 dark:hover:bg-ink-600 text-ink-700 dark:text-ink-300 rounded-lg transition-colors duration-200"
            >
              重新上传
            </button>
          </div>

          <!-- 转换设置 -->
          <div class="bg-ink-50 dark:bg-ink-800 rounded-lg p-4 shadow-ink dark:shadow-ink-dark border border-ink-200 dark:border-ink-700">
            <h3 class="font-serif font-semibold mb-4 text-ink-800 dark:text-ink-100">转换设置</h3>

            <!-- 输出格式 -->
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2 text-ink-700 dark:text-ink-300">输出格式</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="format in ['png', 'jpeg', 'webp', 'pdf'] as OfdTargetFormat[]"
                  :key="format"
                  @click="targetFormat = format"
                  :class="['relative py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 border', targetFormat === format ? 'bg-ink-200 dark:bg-ink-600 text-ink-800 dark:text-ink-100 border-ink-500 dark:border-ink-400 ring-2 ring-ink-700 dark:ring-ink-300' : 'bg-ink-100 dark:bg-ink-700 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-600 border-ink-200 dark:border-ink-600']"
                >
                  {{ format.toUpperCase() }}
                  <span v-if="targetFormat === format" class="absolute -top-1 -right-1 w-4 h-4 bg-ink-700 dark:bg-ink-300 rounded-full flex items-center justify-center">
                    <svg class="w-2.5 h-2.5 text-white dark:text-ink-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            <!-- 图片选项 -->
            <template v-if="targetFormat !== 'pdf'">
              <!-- 页面范围 -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2 text-ink-700 dark:text-ink-300">转换页面</label>
                <div class="flex gap-2 mb-2">
                  <button
                    v-for="range in ['all', 'current', 'custom'] as const"
                    :key="range"
                    @click="imagePages = range"
                    :class="['relative py-1 px-3 rounded-lg text-sm transition-colors duration-200 border', imagePages === range ? 'bg-ink-200 dark:bg-ink-600 text-ink-800 dark:text-ink-100 border-ink-500 dark:border-ink-400 ring-2 ring-ink-700 dark:ring-ink-300' : 'bg-ink-100 dark:bg-ink-700 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-600 border-ink-200 dark:border-ink-600']"
                  >
                    {{ range === 'all' ? '全部页' : range === 'current' ? '当前页' : '自定义' }}
                  </button>
                </div>
                <input
                  v-if="imagePages === 'custom'"
                  type="text"
                  v-model="customPages"
                  placeholder="例如: 1,3-5,8"
                  class="w-full px-3 py-2 border border-ink-300 dark:border-ink-600 bg-white dark:bg-ink-700 text-ink-800 dark:text-ink-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ink-700 dark:focus:ring-ink-300 transition-colors duration-200"
                />
              </div>

              <!-- 图片质量 -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2 text-ink-700 dark:text-ink-300">
                  图片质量: {{ imageQuality }}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  v-model.number="imageQuality"
                  class="w-full h-2 bg-ink-200 dark:bg-ink-600 rounded-lg appearance-none cursor-pointer accent-ink-700 dark:accent-ink-300"
                />
              </div>

              <!-- 分辨率 -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2 text-ink-700 dark:text-ink-300">分辨率</label>
                <select
                  v-model.number="imageScale"
                  class="w-full px-3 py-2 border border-ink-300 dark:border-ink-600 bg-white dark:bg-ink-700 text-ink-800 dark:text-ink-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ink-500 dark:focus:ring-ink-400 transition-colors duration-200"
                >
                  <option :value="1">标准 (1x)</option>
                  <option :value="2">高清 (2x)</option>
                  <option :value="3">超清 (3x)</option>
                </select>
              </div>
            </template>

            <!-- PDF 选项 -->
            <template v-if="targetFormat === 'pdf'">
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2 text-ink-700 dark:text-ink-300">页面尺寸</label>
                <select
                  v-model="pdfPageSize"
                  class="w-full px-3 py-2 border border-ink-300 dark:border-ink-600 bg-white dark:bg-ink-700 text-ink-800 dark:text-ink-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ink-500 dark:focus:ring-ink-400 transition-colors duration-200"
                >
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                  <option value="original">原始尺寸</option>
                </select>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium mb-2 text-ink-700 dark:text-ink-300">页面方向</label>
                <div class="flex gap-2">
                  <button
                    @click="pdfOrientation = 'portrait'"
                    :class="['relative flex-1 py-2 rounded-lg text-sm transition-colors duration-200 border', pdfOrientation === 'portrait' ? 'bg-ink-200 dark:bg-ink-600 text-ink-800 dark:text-ink-100 border-ink-500 dark:border-ink-400 ring-2 ring-ink-700 dark:ring-ink-300' : 'bg-ink-100 dark:bg-ink-700 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-600 border-ink-200 dark:border-ink-600']"
                  >
                    纵向
                    <span v-if="pdfOrientation === 'portrait'" class="absolute -top-1 -right-1 w-4 h-4 bg-ink-700 dark:bg-ink-300 rounded-full flex items-center justify-center">
                      <svg class="w-2.5 h-2.5 text-white dark:text-ink-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  </button>
                  <button
                    @click="pdfOrientation = 'landscape'"
                    :class="['relative flex-1 py-2 rounded-lg text-sm transition-colors duration-200 border', pdfOrientation === 'landscape' ? 'bg-ink-200 dark:bg-ink-600 text-ink-800 dark:text-ink-100 border-ink-500 dark:border-ink-400 ring-2 ring-ink-700 dark:ring-ink-300' : 'bg-ink-100 dark:bg-ink-700 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-600 border-ink-200 dark:border-ink-600']"
                  >
                    横向
                    <span v-if="pdfOrientation === 'landscape'" class="absolute -top-1 -right-1 w-4 h-4 bg-ink-700 dark:bg-ink-300 rounded-full flex items-center justify-center">
                      <svg class="w-2.5 h-2.5 text-white dark:text-ink-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>

              <div class="mb-4">
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    v-model="pdfCompression"
                    class="rounded text-ink-700 dark:text-ink-300"
                  />
                  <span class="text-sm font-medium text-ink-700 dark:text-ink-300">启用压缩</span>
                </label>
              </div>
            </template>
          </div>
        </div>

        <!-- 转换按钮 -->
        <div class="mt-6">
          <button
            @click="handleConvert"
            :disabled="converting"
            class="w-full py-3 bg-vermillion-500 hover:bg-vermillion-600 disabled:bg-ink-400 dark:disabled:bg-ink-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-ink hover:shadow-ink-md transition-all duration-300"
          >
            {{ converting ? '转换中...' : '开始转换' }}
          </button>
        </div>

        <!-- 转换进度 -->
        <div v-if="converting && converter" class="mt-4 bg-ink-50 dark:bg-ink-800 rounded-lg p-4 shadow-ink dark:shadow-ink-dark border border-ink-200 dark:border-ink-700">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-ink-700 dark:text-ink-300">{{ progress.status }}</span>
            <span class="text-sm text-ink-600 dark:text-ink-400">
              {{ progress.current }} / {{ progress.total }}
            </span>
          </div>
          <div class="w-full bg-ink-200 dark:bg-ink-600 rounded-full h-2">
            <div
              class="bg-ink-700 dark:bg-ink-300 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${(progress.current / progress.total) * 100}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { validateOfdFile, packBlobsToZip } from '../utils/ofdConverter';
import OfdPreview from './OfdPreview.vue';
import { OfdTargetFormat, OfdPageRange } from '../types';
import { saveAs } from 'file-saver';

// OfdConverter 的公共接口
interface OfdConverterInterface {
  loadOfd: (file: File, onProgress?: ((current: number, total: number, status: string) => void) | undefined) => Promise<void>;
  getPageCount: () => number;
  getPageSize: (pageIndex: number) => { width: number; height: number };
  getCurrentPageIndex: () => number;
  renderToContainer: (container: HTMLElement, pageIndex: number, scale: number) => Promise<void>;
  convertToImage: (...args: any[]) => Promise<Blob[]>;
  convertToPdf: (...args: any[]) => Promise<Blob>;
  dispose: () => void;
}

const fileInputRef = ref<HTMLInputElement | null>(null);
const file = ref<File | null>(null);
const converter = ref<OfdConverterInterface | null>(null);
const currentPage = ref(0);
const scale = ref(1);
const converting = ref(false);
const progress = reactive({ current: 0, total: 0, status: '' });

// 转换设置
const targetFormat = ref<OfdTargetFormat>('png');
const imageQuality = ref(90);
const imageScale = ref(2);
const imagePages = ref<OfdPageRange>('all');
const customPages = ref('');
const pdfPageSize = ref<'A4' | 'A3' | 'original'>('A4');
const pdfOrientation = ref<'portrait' | 'landscape'>('portrait');
const pdfCompression = ref(true);

const handleFileUpload = async (uploadedFile: File) => {
  const validation = validateOfdFile(uploadedFile);
  if (!validation.valid) {
    alert(validation.error);
    return;
  }

  file.value = uploadedFile;
  converting.value = true;
  progress.current = 0;
  progress.total = 4;
  progress.status = '正在加载文件...';

  try {
    const { OfdConverter } = await import('../utils/ofdConverter');
    const conv = new OfdConverter() as OfdConverterInterface;
    await conv.loadOfd(uploadedFile, (current, total, status) => {
      progress.current = current;
      progress.total = total;
      progress.status = status;
    });
    converter.value = conv;
    currentPage.value = 0;
  } catch (error) {
    alert(`文件加载失败: ${error instanceof Error ? error.message : '未知错误'}`);
  } finally {
    converting.value = false;
    progress.current = 0;
    progress.total = 0;
    progress.status = '';
  }
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  const droppedFile = e.dataTransfer?.files[0];
  if (droppedFile) {
    handleFileUpload(droppedFile);
  }
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
};

const setCurrentPage = (page: number) => {
  currentPage.value = page;
};

const setScale = (newScale: number) => {
  scale.value = newScale;
};

const handleReset = () => {
  converter.value = null;
  file.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

// 处理转换
const handleConvert = async () => {
  if (!converter.value || !file.value) return;

  converting.value = true;

  try {
    if (targetFormat.value === 'pdf') {
      // 转 PDF
      const blob = await converter.value.convertToPdf(
        {
          pageSize: pdfPageSize.value,
          orientation: pdfOrientation.value,
          quality: imageQuality.value,
          compression: pdfCompression.value,
        },
        (current: number, total: number, status: string) => {
          progress.current = current;
          progress.total = total;
          progress.status = status;
        }
      );
      saveAs(blob, `${file.value.name.replace('.ofd', '')}.pdf`);
    } else {
      // 转图片
      const blobs = await converter.value.convertToImage(
        {
          format: targetFormat.value,
          quality: imageQuality.value,
          scale: imageScale.value,
          pages: imagePages.value,
          background: '#ffffff',
          customPagesInput: imagePages.value === 'custom' ? customPages.value : undefined,
        },
        currentPage.value,
        (current: number, total: number, status: string) => {
          progress.current = current;
          progress.total = total;
          progress.status = status;
        }
      );

      if (blobs.length === 1) {
        const ext = targetFormat.value === 'jpeg' ? 'jpg' : targetFormat.value;
        saveAs(blobs[0], `${file.value.name.replace('.ofd', '')}.${ext}`);
      } else {
        // 打包为 ZIP
        const ext = targetFormat.value === 'jpeg' ? 'jpg' : targetFormat.value;
        const filenames = blobs.map((_, i) => `${file.value!.name.replace('.ofd', '')}_page_${i + 1}.${ext}`);
        const zipBlob = await packBlobsToZip(blobs, filenames);
        saveAs(zipBlob, `${file.value!.name.replace('.ofd', '')}_images.zip`);
      }
    }
  } catch (error) {
    alert(`转换失败: ${error instanceof Error ? error.message : '未知错误'}`);
  } finally {
    converting.value = false;
    progress.current = 0;
    progress.total = 0;
    progress.status = '';
  }
};
</script>
