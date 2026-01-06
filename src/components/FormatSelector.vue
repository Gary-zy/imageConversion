<template>
  <div class="bg-ink-50 dark:bg-ink-800 rounded-lg border border-ink-200 dark:border-ink-700 shadow-ink">
    <!-- 标题栏 - 水墨风格 -->
    <div class="px-5 py-4 border-b border-ink-100 dark:border-ink-700 flex items-center justify-between">
      <h3 class="font-serif font-medium text-ink-800 dark:text-ink-100">输出格式</h3>
      <div class="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400">
        <span class="w-1.5 h-1.5 rounded-full bg-ink-600 dark:bg-ink-300"></span>
        {{ currentFormat?.label }}
      </div>
    </div>

    <div class="p-5">
      <!-- 常用格式 - 水墨风格 -->
      <div class="grid grid-cols-4 gap-3">
        <button
          v-for="format in commonFormats"
          :key="format.value"
          @click="setTargetFormat(format.value as ImageFormat)"
          :class="[
            'group relative py-4 rounded-lg border transition-all duration-300',
            targetFormat === format.value
              ? 'border-ink-400 dark:border-ink-500 bg-ink-100 dark:bg-ink-700 shadow-ink'
              : 'border-ink-200 dark:border-ink-600 bg-ink-50/50 dark:bg-ink-800/50 hover:bg-ink-100 dark:hover:bg-ink-700 hover:border-ink-300 dark:hover:border-ink-500'
          ]"
        >
          <div class="text-center">
            <p :class="[
              'font-semibold',
              targetFormat === format.value ? 'text-ink-800 dark:text-ink-100' : 'text-ink-700 dark:text-ink-300'
            ]">
              {{ format.label }}
            </p>
            <p :class="[
              'text-xs mt-0.5',
              targetFormat === format.value ? 'text-ink-500 dark:text-ink-400' : 'text-ink-400 dark:text-ink-500'
            ]">
              .{{ format.extension }}
            </p>
          </div>
          <!-- 选中指示 - 水墨风格 -->
          <div
            v-if="targetFormat === format.value"
            class="absolute -top-1 -right-1 w-5 h-5 bg-ink-800 dark:bg-ink-100 rounded-full flex items-center justify-center shadow-ink"
          >
            <svg class="w-3 h-3 text-ink-50 dark:text-ink-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </button>
      </div>

      <!-- 更多格式 - 水墨风格 -->
      <div class="mt-4 pt-4 border-t border-ink-100 dark:border-ink-700">
        <button
          @click="showMore = !showMore"
          class="flex items-center gap-2 px-3 py-1.5 text-sm text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 bg-ink-100 dark:bg-ink-700 hover:bg-ink-200 dark:hover:bg-ink-600 rounded-md border border-ink-200 dark:border-ink-600 transition-all duration-300"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          <span>更多格式</span>
          <svg
            :class="['w-4 h-4 transition-transform duration-300', showMore ? 'rotate-180' : '']"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- 展开的格式列表 - 水墨风格 -->
        <div
          v-show="showMore"
          class="mt-4 space-y-4"
        >
          <div v-for="(formats, category) in groupedFormats" :key="category">
            <p class="text-xs text-ink-400 dark:text-ink-500 mb-2">{{ categoryNames[category] }}</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="format in formats"
                :key="format.value"
                @click="setTargetFormat(format.value as ImageFormat)"
                :class="[
                  'relative px-3 py-1.5 text-sm rounded-md border transition-all duration-300',
                  targetFormat === format.value
                    ? 'bg-ink-200 dark:bg-ink-600 text-ink-800 dark:text-ink-100 border-ink-500 dark:border-ink-400 ring-2 ring-ink-700 dark:ring-ink-300'
                    : 'border-ink-200 dark:border-ink-600 bg-ink-50 dark:bg-ink-800 text-ink-600 dark:text-ink-400 hover:border-ink-300 dark:hover:border-ink-500 hover:bg-ink-100 dark:hover:bg-ink-700'
                ]"
              >
                {{ format.label }}
                <span v-if="targetFormat === format.value" class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-ink-700 dark:bg-ink-300 rounded-full flex items-center justify-center">
                  <svg class="w-2 h-2 text-white dark:text-ink-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 格式说明 - 水墨风格 -->
    <div v-if="currentFormat" class="px-5 py-4 bg-ink-100/50 dark:bg-ink-700/50 border-t border-ink-100 dark:border-ink-700">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-md bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-600 flex items-center justify-center shadow-ink">
          <span class="text-xs font-bold text-ink-500 dark:text-ink-400">{{ currentFormat.extension.toUpperCase().slice(0, 3) }}</span>
        </div>
        <div class="flex-1">
          <p class="text-sm text-ink-600 dark:text-ink-300">{{ currentFormat.description }}</p>
          <div class="flex items-center gap-3 mt-1">
            <span v-if="currentFormat.supportsQuality" class="text-xs text-ink-400 dark:text-ink-500">
              ✓ 质量可调
            </span>
            <span v-if="supportsTransparency" class="text-xs text-ink-400 dark:text-ink-500">
              ✓ 支持透明
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef } from 'vue';
import { useImageStore } from '../stores/imageStore';
import { FORMAT_OPTIONS, ImageFormat } from '../types';

const store = useImageStore();
const setTargetFormat = store.setTargetFormat.bind(store);
const targetFormat = toRef(store, 'targetFormat');

const showMore = ref(false);

// 常用格式
const commonFormats = computed(() => 
  FORMAT_OPTIONS.filter(f => ['jpeg', 'png', 'webp', 'gif'].includes(f.value))
);

// 其他格式按分类分组
const groupedFormats = computed(() => {
  const others = FORMAT_OPTIONS.filter(f => !['jpeg', 'png', 'webp', 'gif'].includes(f.value));
  const groups: Record<string, typeof FORMAT_OPTIONS> = {};
  
  others.forEach(format => {
    const cat = format.category || 'other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(format);
  });
  
  return groups;
});

const categoryNames: Record<string, string> = {
  modern: '现代格式',
  document: '文档格式',
  icon: '图标格式',
  legacy: '传统格式',
  other: '其他',
};

const currentFormat = computed(() => FORMAT_OPTIONS.find(f => f.value === targetFormat.value));

// 判断当前格式是否支持透明度
const supportsTransparency = computed(() => {
  const transparentFormats = ['png', 'webp', 'gif', 'avif', 'heif', 'heic', 'ico', 'icns', 'tiff'];
  return transparentFormats.includes(targetFormat.value);
});
</script>
