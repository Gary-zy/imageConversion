<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div class="flex flex-col md:flex-row">
      <!-- 原图预览 -->
      <div class="flex-1 p-4">
        <h4 class="text-sm font-medium text-gray-500 mb-2">原图</h4>
        <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          <img
            :src="file.previewUrl"
            :alt="file.name"
            class="max-w-full max-h-full object-contain"
          />
        </div>
        <div class="mt-2 text-sm text-gray-600">
          <p class="truncate" :title="file.name">
            {{ file.name }}
          </p>
          <p>
            {{ file.width }} x {{ file.height }} | {{ formatFileSize(file.size) }}
          </p>
        </div>
      </div>

      <!-- 箭头 -->
      <div class="hidden md:flex items-center justify-center px-4">
        <svg
          class="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </div>

      <!-- 转换后预览 -->
      <div class="flex-1 p-4 border-t md:border-t-0 md:border-l border-gray-200">
        <h4 class="text-sm font-medium text-gray-500 mb-2">转换后</h4>
        <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          <img
            v-if="file.convertedUrl"
            :src="file.convertedUrl"
            alt="转换后"
            class="max-w-full max-h-full object-contain"
          />
          <div v-else class="text-gray-400 text-sm">
            {{ file.status === 'converting' ? '转换中...' : '等待转换' }}
          </div>
        </div>
        <div v-if="file.convertedSize" class="mt-2 text-sm text-gray-600">
          <p>转换后大小: {{ formatFileSize(file.convertedSize) }}</p>
          <p
            v-if="file.size !== file.convertedSize"
            :class="file.convertedSize < file.size ? 'text-green-600' : 'text-orange-600'"
          >
            {{ file.convertedSize < file.size
              ? `减少 ${formatFileSize(file.size - file.convertedSize)} (${Math.round((1 - file.convertedSize / file.size) * 100)}%)`
              : `增加 ${formatFileSize(file.convertedSize - file.size)} (${Math.round((file.convertedSize / file.size - 1) * 100)}%)`
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ImageFile, formatFileSize } from '../types';

defineProps<{
  file: ImageFile;
}>();
</script>
