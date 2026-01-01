<template>
  <div class="max-w-7xl mx-auto p-6">
    <!-- 文件上传区域 -->
    <div
      v-if="!converter"
      @drop="handleDrop"
      @dragover="handleDragOver"
      class="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
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
      <h3 class="text-lg font-semibold mb-2">拖拽 OFD 文件到此处</h3>
      <p class="text-gray-600 mb-4">或点击选择文件</p>
      <p class="text-sm text-gray-500">支持 .ofd 格式，最大 50MB</p>
    </div>

    <!-- 加载进度 -->
    <div v-if="converting && !converter" class="bg-white rounded-lg p-6 shadow-sm">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium">{{ progress.status }}</span>
        <span class="text-sm text-gray-600">
          {{ progress.current }} / {{ progress.total }}
        </span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-500 h-2 rounded-full transition-all"
          :style="{ width: `${(progress.current / progress.total) * 100}%` }"
        />
      </div>
    </div>

    <!-- 主内容区域 -->
    <div v-if="converter" class="flex flex-col gap-6">
      <!-- 预览区域 - 上方 -->
      <div class="w-full">
        <h2 class="text-lg font-semibold mb-4">文档预览</h2>
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
          <div class="bg-white rounded-lg p-4 shadow-sm h-fit">
            <h3 class="font-semibold mb-2">文件信息</h3>
            <div class="text-sm text-gray-600 space-y-1">
              <p>文件名: {{ file?.name }}</p>
              <p>文件大小: {{ (file?.size || 0) / 1024 / 1024 }} MB</p>
              <p>总页数: {{ converter.getPageCount() }}</p>
            </div>
            <button
              @click="handleReset"
              class="mt-3 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              重新上传
            </button>
          </div>

          <!-- 转换设置 -->
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <h3 class="font-semibold mb-4">转换设置</h3>

            <!-- 输出格式 -->
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">输出格式</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="format in ['png', 'jpeg', 'webp', 'pdf'] as OfdTargetFormat[]"
                  :key="format"
                  @click="targetFormat = format"
                  :class="['py-2 px-4 rounded text-sm font-medium transition-colors', targetFormat === format ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300']"
                >
                  {{ format.toUpperCase() }}
                </button>
              </div>
            </div>

            <!-- 图片选项 -->
            <template v-if="targetFormat !== 'pdf'">
              <!-- 页面范围 -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2">转换页面</label>
                <div class="flex gap-2 mb-2">
                  <button
                    v-for="range in ['all', 'current', 'custom'] as const"
                    :key="range"
                    @click="imagePages = range"
                    :class="['py-1 px-3 rounded text-sm', imagePages === range ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300']"
                  >
                    {{ range === 'all' ? '全部页' : range === 'current' ? '当前页' : '自定义' }}
                  </button>
                </div>
                <input
                  v-if="imagePages === 'custom'"
                  type="text"
                  v-model="customPages"
                  placeholder="例如: 1,3-5,8"
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <!-- 图片质量 -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2">
                  图片质量: {{ imageQuality }}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  v-model.number="imageQuality"
                  class="w-full"
                />
              </div>

              <!-- 分辨率 -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2">分辨率</label>
                <select
                  v-model.number="imageScale"
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label class="block text-sm font-medium mb-2">页面尺寸</label>
                <select
                  v-model="pdfPageSize"
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                  <option value="original">原始尺寸</option>
                </select>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium mb-2">页面方向</label>
                <div class="flex gap-2">
                  <button
                    @click="pdfOrientation = 'portrait'"
                    :class="['flex-1 py-2 rounded text-sm', pdfOrientation === 'portrait' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300']"
                  >
                    纵向
                  </button>
                  <button
                    @click="pdfOrientation = 'landscape'"
                    :class="['flex-1 py-2 rounded text-sm', pdfOrientation === 'landscape' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300']"
                  >
                    横向
                  </button>
                </div>
              </div>

              <div class="mb-4">
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    v-model="pdfCompression"
                    class="rounded"
                  />
                  <span class="text-sm font-medium">启用压缩</span>
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
            class="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {{ converting ? '转换中...' : '开始转换' }}
          </button>
        </div>

        <!-- 转换进度 -->
        <div v-if="converting && converter" class="mt-4 bg-white rounded-lg p-4 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">{{ progress.status }}</span>
            <span class="text-sm text-gray-600">
              {{ progress.current }} / {{ progress.total }}
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-500 h-2 rounded-full transition-all"
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
