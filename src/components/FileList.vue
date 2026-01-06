<template>
  <div v-if="files.length > 0" class="bg-ink-50 dark:bg-ink-800 rounded-lg border border-ink-200 dark:border-ink-700 shadow-ink dark:shadow-ink-dark overflow-hidden">
    <div class="px-6 py-4 bg-gradient-to-r from-ink-100 to-ink-50 dark:from-ink-700 dark:to-ink-800 border-b border-ink-200 dark:border-ink-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-ink-200 dark:bg-ink-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-ink-600 dark:text-ink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 class="font-serif font-semibold text-ink-800 dark:text-ink-100">文件列表</h3>
            <p class="text-sm text-ink-500 dark:text-ink-400">{{ files.length }} 个文件</p>
          </div>
        </div>
        <button
          @click="handleClearFiles"
          class="px-3 py-1.5 text-sm text-ink-500 dark:text-ink-400 hover:text-vermillion-500 dark:hover:text-vermillion-400 hover:bg-vermillion-50 dark:hover:bg-vermillion-900/20 rounded-lg transition-colors duration-200 flex items-center gap-1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          清空
        </button>
      </div>
    </div>

    <ul class="divide-y divide-ink-200 dark:divide-ink-700">
      <li
        v-for="file in files"
        :key="file.id"
        class="p-4 hover:bg-ink-100/50 dark:hover:bg-ink-700/50 transition-colors duration-200"
      >
        <div class="flex items-center gap-4">
          <!-- 缩略图 -->
          <div class="w-16 h-16 flex-shrink-0 bg-ink-100 dark:bg-ink-700 rounded-lg overflow-hidden shadow-ink dark:shadow-ink-dark">
            <img
              :src="file.previewUrl"
              :alt="file.name"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- 文件信息 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <p class="font-medium text-ink-800 dark:text-ink-100 truncate" :title="file.name">
                {{ file.name }}
              </p>
              <div v-html="getStatusIcon(file.status)"></div>
            </div>
            <div class="flex items-center gap-4 text-xs text-ink-500 dark:text-ink-400">
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                {{ file.width }} x {{ file.height }}
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                {{ formatFileSize(file.size) }}
              </span>
              <span v-if="file.status === 'completed' && file.convertedSize" class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {{ formatFileSize(file.convertedSize) }}
                <span v-html="getSizeChange(file.size, file.convertedSize)"></span>
              </span>
            </div>
            <div class="mt-2">
              <ProgressBar :progress="file.progress" :status="file.status" />
            </div>
            <p v-if="file.error" class="text-sm text-vermillion-500 dark:text-vermillion-400 mt-1 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ file.error }}
            </p>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center gap-2">
            <button
              v-if="file.status === 'completed'"
              @click="handleDownload(file.id)"
              class="px-4 py-2 text-sm font-medium text-white bg-bamboo-500 hover:bg-bamboo-600 rounded-lg shadow-ink hover:shadow-ink-md transition-all duration-300 flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              下载
            </button>
            <button
              @click="removeFile(file.id)"
              class="p-2 text-ink-400 dark:text-ink-500 hover:text-vermillion-500 dark:hover:text-vermillion-400 hover:bg-vermillion-50 dark:hover:bg-vermillion-900/20 rounded-lg transition-colors duration-200"
              title="删除"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useImageStore } from '../stores/imageStore';
import { formatFileSize } from '../types';
import { downloadConvertedFile } from '../utils/download';
import ProgressBar from './ProgressBar.vue';

const store = useImageStore();
const files = computed(() => store.files);
const targetFormat = computed(() => store.targetFormat);
const settings = computed(() => store.settings);
const removeFile = store.removeFile.bind(store);
const clearFiles = store.clearFiles.bind(store);

const handleDownload = (fileId: string) => {
  const file = files.value.find((f: { id: string }) => f.id === fileId);
  if (file && file.convertedBlob) {
    downloadConvertedFile(
      file,
      targetFormat.value,
      settings.value.fileNamePrefix,
      settings.value.fileNameSuffix
    );
  }
};

const handleClearFiles = () => {
  clearFiles();
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return `<div class="w-8 h-8 bg-bamboo-100 dark:bg-bamboo-900/30 rounded-full flex items-center justify-center">
        <svg class="w-5 h-5 text-bamboo-600 dark:text-bamboo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>`;
    case 'converting':
      return `<div class="w-8 h-8 bg-ink-200 dark:bg-ink-600 rounded-full flex items-center justify-center">
        <svg class="w-5 h-5 text-ink-600 dark:text-ink-300 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>`;
    case 'failed':
      return `<div class="w-8 h-8 bg-vermillion-100 dark:bg-vermillion-900/30 rounded-full flex items-center justify-center">
        <svg class="w-5 h-5 text-vermillion-600 dark:text-vermillion-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>`;
    default:
      return `<div class="w-8 h-8 bg-ink-100 dark:bg-ink-700 rounded-full flex items-center justify-center">
        <svg class="w-5 h-5 text-ink-400 dark:text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>`;
  }
};

const getSizeChange = (original: number, converted?: number) => {
  if (!converted) return null;
  const change = ((converted - original) / original) * 100;
  if (change > 0) {
    return `<span class="text-vermillion-500 dark:text-vermillion-400">+${change.toFixed(1)}%</span>`;
  } else if (change < 0) {
    return `<span class="text-bamboo-500 dark:text-bamboo-400">${change.toFixed(1)}%</span>`;
  }
  return '<span class="text-ink-400 dark:text-ink-500">0%</span>';
};
</script>
