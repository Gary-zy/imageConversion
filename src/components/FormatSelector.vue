<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
    <!-- 标题栏 -->
    <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
      <h3 class="font-medium text-gray-800">输出格式</h3>
      <div class="flex items-center gap-2 text-sm text-gray-500">
        <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        {{ currentFormat?.label }}
      </div>
    </div>

    <div class="p-5">
      <!-- 常用格式 -->
      <div class="grid grid-cols-4 gap-3">
        <button
          v-for="format in commonFormats"
          :key="format.value"
          @click="setTargetFormat(format.value as ImageFormat)"
          :class="[
            'group relative py-4 rounded-xl border transition-all',
            targetFormat === format.value
              ? 'border-blue-200 bg-gradient-to-b from-blue-50 to-white shadow-sm'
              : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-sm'
          ]"
        >
          <div class="text-center">
            <p :class="[
              'font-semibold',
              targetFormat === format.value ? 'text-blue-600' : 'text-gray-700'
            ]">
              {{ format.label }}
            </p>
            <p :class="[
              'text-xs mt-0.5',
              targetFormat === format.value ? 'text-blue-400' : 'text-gray-400'
            ]">
              .{{ format.extension }}
            </p>
          </div>
          <!-- 选中指示 -->
          <div
            v-if="targetFormat === format.value"
            class="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm"
          >
            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </button>
      </div>

      <!-- 更多格式 -->
      <div class="mt-4 pt-4 border-t border-gray-100">
        <button
          @click="showMore = !showMore"
          class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          <span>更多格式</span>
          <svg
            :class="['w-4 h-4 transition-transform', showMore ? 'rotate-180' : '']"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- 展开的格式列表 -->
        <div
          v-show="showMore"
          class="mt-4 space-y-4"
        >
          <div v-for="(formats, category) in groupedFormats" :key="category">
            <p class="text-xs text-gray-400 mb-2">{{ categoryNames[category] }}</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="format in formats"
                :key="format.value"
                @click="setTargetFormat(format.value as ImageFormat)"
                :class="[
                  'px-3 py-1.5 text-sm rounded-lg border transition-all',
                  targetFormat === format.value
                    ? 'border-blue-200 bg-blue-50 text-blue-600'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                ]"
              >
                {{ format.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 格式说明 -->
    <div v-if="currentFormat" class="px-5 py-4 bg-gray-50/50 border-t border-gray-100">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
          <span class="text-xs font-bold text-gray-500">{{ currentFormat.extension.toUpperCase().slice(0, 3) }}</span>
        </div>
        <div class="flex-1">
          <p class="text-sm text-gray-600">{{ currentFormat.description }}</p>
          <div class="flex items-center gap-3 mt-1">
            <span v-if="currentFormat.supportsQuality" class="text-xs text-gray-400">
              ✓ 质量可调
            </span>
            <span v-if="supportsTransparency" class="text-xs text-gray-400">
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
