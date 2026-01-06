<template>
  <div class="bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-soft">
    <!-- 标题栏 - 水墨风格 -->
    <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
      <h3 class="font-heading font-medium text-slate-800 dark:text-slate-100">输出格式</h3>
      <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span class="w-1.5 h-1.5 rounded-full bg-slate-600 dark:bg-slate-300"></span>
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
              ? 'border-slate-400 dark:border-slate-500 bg-slate-100 dark:bg-slate-700 shadow-soft'
              : 'border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
          ]"
        >
          <div class="text-center">
            <p :class="[
              'font-semibold',
              targetFormat === format.value ? 'text-slate-800 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'
            ]">
              {{ format.label }}
            </p>
            <p :class="[
              'text-xs mt-0.5',
              targetFormat === format.value ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'
            ]">
              .{{ format.extension }}
            </p>
          </div>
          <!-- 选中指示 - 水墨风格 -->
          <div
            v-if="targetFormat === format.value"
            class="absolute -top-1 -right-1 w-5 h-5 bg-slate-800 dark:bg-slate-100 rounded-full flex items-center justify-center shadow-soft"
          >
            <svg class="w-3 h-3 text-slate-50 dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </button>
      </div>

      <!-- 更多格式 - 水墨风格 -->
      <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        <button
          @click="showMore = !showMore"
          class="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md border border-slate-200 dark:border-slate-600 transition-all duration-300"
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
            <p class="text-xs text-slate-400 dark:text-slate-500 mb-2">{{ categoryNames[category] }}</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="format in formats"
                :key="format.value"
                @click="setTargetFormat(format.value as ImageFormat)"
                :class="[
                  'relative px-3 py-1.5 text-sm rounded-md border transition-all duration-300',
                  targetFormat === format.value
                    ? 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 border-slate-500 dark:border-slate-400 ring-2 ring-slate-700 dark:ring-slate-300'
                    : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                ]"
              >
                {{ format.label }}
                <span v-if="targetFormat === format.value" class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-slate-700 dark:bg-slate-300 rounded-full flex items-center justify-center">
                  <svg class="w-2 h-2 text-white dark:text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div v-if="currentFormat" class="px-5 py-4 bg-slate-100/50 dark:bg-slate-700/50 border-t border-slate-100 dark:border-slate-700">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center shadow-soft">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ currentFormat.extension.toUpperCase().slice(0, 3) }}</span>
        </div>
        <div class="flex-1">
          <p class="text-sm text-slate-600 dark:text-slate-300">{{ currentFormat.description }}</p>
          <div class="flex items-center gap-3 mt-1">
            <span v-if="currentFormat.supportsQuality" class="text-xs text-slate-400 dark:text-slate-500">
              ✓ 质量可调
            </span>
            <span v-if="supportsTransparency" class="text-xs text-slate-400 dark:text-slate-500">
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
