<template>
  <div class="flex flex-col bg-ink-100 dark:bg-ink-700 rounded-lg p-4">
    <!-- 顶部信息栏 -->
    <div class="flex items-center justify-between mb-4">
      <div class="text-sm text-ink-600 dark:text-ink-400">
        文档尺寸: {{ pageSize.width }}mm x {{ pageSize.height }}mm
      </div>
      <div v-if="isLoading" class="text-sm text-ink-600 dark:text-ink-400 flex items-center gap-2">
        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        渲染中...
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="mb-4 p-3 bg-vermillion-50 dark:bg-vermillion-900/20 border border-vermillion-200 dark:border-vermillion-800 rounded-lg text-vermillion-600 dark:text-vermillion-400 text-sm">
      {{ error }}
    </div>

    <!-- 预览区域 -->
    <div
      ref="scrollContainerRef"
      class="flex-1 bg-ink-200 dark:bg-ink-600 border-2 border-ink-300 dark:border-ink-500 rounded-lg overflow-auto"
      :style="{
        minHeight: '500px',
        maxHeight: '70vh'
      }"
    >
      <div
        ref="containerRef"
        class="ofd-content-container"
        :style="{
          minWidth: '800px',
          minHeight: '600px',
          width: '100%',
        }"
      >
        <div v-if="!converter" class="flex items-center justify-center h-96 text-ink-400 dark:text-ink-500">
          请先上传 OFD 文件
        </div>
      </div>
    </div>

    <!-- 底部控制栏 -->
    <div class="flex items-center justify-between mt-4 gap-4">
      <!-- 页面导航 -->
      <div class="flex items-center gap-2">
        <button
          @click="handlePrevPage"
          :disabled="currentPage <= 0 || isLoading"
          class="px-3 py-1.5 bg-ink-200 dark:bg-ink-600 hover:bg-ink-300 dark:hover:bg-ink-500 text-ink-700 dark:text-ink-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors duration-200"
        >
          上一页
        </button>
        <span class="text-sm font-medium px-3 text-ink-700 dark:text-ink-300">
          {{ currentPage + 1 }} / {{ pageCount || 0 }}
        </span>
        <button
          @click="handleNextPage"
          :disabled="currentPage >= pageCount - 1 || isLoading"
          class="px-3 py-1.5 bg-ink-200 dark:bg-ink-600 hover:bg-ink-300 dark:hover:bg-ink-500 text-ink-700 dark:text-ink-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors duration-200"
        >
          下一页
        </button>
      </div>

      <!-- 缩放控制 -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-ink-600 dark:text-ink-400">缩放:</span>
        <select
          :value="scale"
          @change="handleScaleChange(parseFloat(($event.target as HTMLSelectElement).value))"
          :disabled="isLoading"
          class="px-2 py-1.5 border border-ink-300 dark:border-ink-600 bg-white dark:bg-ink-700 text-ink-800 dark:text-ink-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ink-500 dark:focus:ring-ink-400 disabled:opacity-50 transition-colors duration-200"
        >
          <option v-for="s in scaleOptions" :key="s" :value="s">
            {{ Math.round(s * 100) }}%
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUpdated, onMounted, onUnmounted, nextTick, toRef } from 'vue';

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

interface Props {
  converter: OfdConverterInterface | null;
  currentPage: number;
  scale: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void;
  (e: 'update:scale', scale: number): void;
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const scrollContainerRef = ref<HTMLDivElement | null>(null);
const error = ref<string | null>(null);
const isLoading = ref(false);

const pageCount = computed(() => props.converter?.getPageCount() || 0);
const pageSize = computed(() => props.converter ? props.converter.getPageSize(props.currentPage) : { width: 210, height: 297 });

const scaleOptions = [0.5, 0.75, 1, 1.5, 2, 3];

// 渲染文档
const renderDocument = async () => {
  if (!props.converter || !containerRef.value) return;

  isLoading.value = true;
  error.value = null;

  try {
    // 等待 DOM 更新完成后再渲染
    await nextTick();
    // 再等待一帧确保容器已完全布局
    await new Promise(resolve => requestAnimationFrame(resolve));
    await props.converter.renderToContainer(containerRef.value, props.currentPage, props.scale);
  } catch (err) {
    console.error('OFD 渲染失败:', err);
    error.value = err instanceof Error ? err.message : '渲染失败';
  } finally {
    isLoading.value = false;
  }
};

// 使用 toRef 创建对 converter 的响应式引用
const converterRef = toRef(props, 'converter');

// 当 converter 变化时，重置渲染状态
watch(converterRef, () => {
  hasRendered.value = false;
});

// 当 converter 或页面变化时重新渲染
watch(
  [converterRef, () => props.currentPage, () => props.scale],
  async ([newConverter, _newPage, _newScale]) => {
    if (newConverter && containerRef.value) {
      renderDocument();
    } else if (newConverter && !containerRef.value) {
      // 等待容器准备好后再渲染
      await nextTick();
      await new Promise(resolve => requestAnimationFrame(resolve));
      if (containerRef.value) {
        renderDocument();
      }
    }
  }
);

// 监听 converter 变化，当容器准备好时渲染（仅渲染一次）
const hasRendered = ref(false);

onUpdated(() => {
  if (props.converter && containerRef.value && !hasRendered.value) {
    renderDocument();
    hasRendered.value = true;
  }
});

// 使用 setInterval 定期检查并渲染（解决 watch 不触发的问题）
let renderInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  // 启动定时检查 - 当 watch 无法检测 prop 变化时作为备用方案
  renderInterval = setInterval(() => {
    if (props.converter && containerRef.value && !isLoading.value && !hasRendered.value) {
      renderDocument();
      hasRendered.value = true;
      // 渲染成功后清除定时器
      if (renderInterval) {
        clearInterval(renderInterval);
        renderInterval = null;
      }
    }
  }, 100);
});

onUnmounted(() => {
  if (renderInterval) {
    clearInterval(renderInterval);
    renderInterval = null;
  }
});

// 监听页面变化事件
const handlePageChange = () => {
  if (props.converter) {
    const newPage = props.converter.getCurrentPageIndex();
    if (newPage !== props.currentPage) {
      emit('update:currentPage', newPage);
    }
  }
};

onMounted(() => {
  window.addEventListener('ofdPageChange', handlePageChange);
});

onUnmounted(() => {
  window.removeEventListener('ofdPageChange', handlePageChange);
});

const handlePrevPage = () => {
  if (props.currentPage > 0) {
    emit('update:currentPage', props.currentPage - 1);
  }
};

const handleNextPage = () => {
  if (props.currentPage < pageCount.value - 1) {
    emit('update:currentPage', props.currentPage + 1);
  }
};

const handleScaleChange = (newScale: number) => {
  emit('update:scale', Math.max(0.5, Math.min(3, newScale)));
};
</script>
