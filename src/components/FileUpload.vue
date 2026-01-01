<template>
  <div
    :class="[
      'relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ease-out cursor-pointer',
      isDragOver
        ? 'border-primary-500 bg-primary-50 scale-[1.02] shadow-lg shadow-primary-500/20'
        : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50/80 bg-white'
    ]"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click="handleClick"
  >
    <input
      ref="inputRef"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="handleChange"
    />

    <div class="flex flex-col items-center gap-6 py-12 px-6">
      <!-- 图标区域 -->
      <div
        :class="[
          'w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300',
          isDragOver ? 'bg-primary-100 scale-110' : 'bg-gradient-to-br from-primary-100 to-primary-50'
        ]"
      >
        <div class="relative">
          <div
            :class="[
              'absolute inset-0 rounded-full transition-all duration-300',
              isDragOver ? 'bg-primary-400 animate-ping opacity-20' : ''
            ]"
          />
          <svg
            :class="['w-10 h-10 relative z-10 transition-colors duration-300', isDragOver ? 'text-primary-600' : 'text-primary-500']"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      <div class="text-center space-y-2">
        <p class="text-lg font-semibold text-gray-800">
          {{ isDragOver ? '释放以上传图片' : '拖拽图片到这里，或点击选择文件' }}
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500">
          <span class="px-2 py-1 bg-gray-100 rounded-md">JPEG</span>
          <span class="px-2 py-1 bg-gray-100 rounded-md">PNG</span>
          <span class="px-2 py-1 bg-gray-100 rounded-md">WebP</span>
          <span class="px-2 py-1 bg-gray-100 rounded-md">GIF</span>
          <span class="px-2 py-1 bg-gray-100 rounded-md">BMP</span>
          <span class="px-2 py-1 bg-gray-100 rounded-md">SVG</span>
          <span class="px-2 py-1 bg-gray-100 rounded-md">ICO</span>
          <span class="px-2 py-1 bg-gray-100 rounded-md">AVIF</span>
          <span class="px-2 py-1 bg-gray-100 rounded-md">HEIC</span>
        </div>
      </div>

      <!-- 快捷键提示 -->
      <div class="flex items-center gap-4 text-xs text-gray-400">
        <span class="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          点击上传
        </span>
        <span class="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5v14H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2h-4m0 0l-4-4m4 4l-4-4" />
          </svg>
          拖拽上传
        </span>
        <span class="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5v14H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2h-4m0 0l-4-4m4 4l-4-4" />
          </svg>
          Ctrl+V 粘贴
        </span>
      </div>
    </div>

    <!-- 拖拽时的覆盖层 -->
    <div v-if="isDragOver" class="absolute inset-0 bg-primary-500/5 border-2 border-primary-500 rounded-2xl flex items-center justify-center">
      <div class="bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary-500/30 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span>释放以上传</span>
      </div>
    </div>

    <!-- 上传成功动画 -->
    <div v-if="uploadCount > 0" class="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-medium animate-bounce">
      +{{ uploadCount }} 文件已添加
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useImageStore } from '../stores/imageStore';
import { filterValidImageFiles } from '../utils/validator';

const inputRef = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);
const uploadCount = ref(0);

const store = useImageStore();
const addFiles = store.addFiles.bind(store);

const handleFiles = async (files: FileList | File[]) => {
  const validFiles = filterValidImageFiles(files);
  if (validFiles.length > 0) {
    await addFiles(validFiles);
    uploadCount.value = validFiles.length;
    setTimeout(() => {
      uploadCount.value = 0;
    }, 3000);
  }
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDragOver.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDragOver.value = false;
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDragOver.value = false;

  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    handleFiles(e.dataTransfer.files);
  }
};

const handleClick = () => {
  inputRef.value?.click();
};

const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    handleFiles(target.files);
    target.value = '';
  }
};

const handlePaste = (e: ClipboardEvent) => {
  const items = e.clipboardData?.items;
  if (!items) return;

  const files: File[] = [];
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        files.push(file);
      }
    }
  }

  if (files.length > 0) {
    handleFiles(files);
  }
};

onMounted(() => {
  document.addEventListener('paste', handlePaste);
});

onUnmounted(() => {
  document.removeEventListener('paste', handlePaste);
});
</script>
