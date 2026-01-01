<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-sm font-medium text-gray-700">选择目标格式</h2>
      <span class="text-xs text-gray-400">
        当前: {{ FORMAT_OPTIONS.find(f => f.value === targetFormat)?.label }}
      </span>
    </div>

    <!-- 分类标签 -->
    <div class="flex flex-wrap gap-2 mb-3">
      <button
        v-for="([key, category]) in Object.entries(FORMAT_CATEGORIES)"
        :key="key"
        @click="expandedCategory = key"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
          'flex items-center gap-1.5',
          expandedCategory === key
            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
        ]"
      >
        <span>{{ categoryIcons[key] }}</span>
        <span>{{ category.name }}</span>
      </button>
    </div>

    <!-- 格式按钮网格 -->
    <div class="bg-white rounded-xl border border-gray-200 p-4">
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        <button
          v-for="format in FORMAT_OPTIONS.filter(f => f.category === expandedCategory)"
          :key="format.value"
          @click="setTargetFormat(format.value as ImageFormat)"
          :class="[
            'relative px-3 py-3 rounded-lg font-medium transition-all duration-200',
            'flex flex-col items-center gap-1',
            targetFormat === format.value
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 transform scale-105'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm'
          ]"
        >
          <span class="text-lg">{{ format.label }}</span>
          <span :class="['text-xs', targetFormat === format.value ? 'text-white/80' : 'text-gray-400']">
            {{ format.extension.toUpperCase() }}
          </span>

          <!-- 选中指示器 -->
          <div v-if="targetFormat === format.value" class="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow">
            <svg class="w-3 h-3 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </button>
      </div>

      <!-- 格式说明 -->
      <div class="mt-4 pt-4 border-t border-gray-100">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-800">{{ currentFormat?.label }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ currentFormat?.description }}</p>
            <p v-if="currentFormat?.supportsQuality" class="text-xs text-primary-600 mt-1">支持质量调整</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef } from 'vue';
import { useImageStore } from '../stores/imageStore';
import { FORMAT_OPTIONS, FORMAT_CATEGORIES, ImageFormat } from '../types';

const store = useImageStore();
const setTargetFormat = store.setTargetFormat.bind(store);

// 使用 toRef 创建正确的响应式引用
const targetFormat = toRef(store, 'targetFormat');

const expandedCategory = ref<string>('common');

const categoryIcons: Record<string, string> = {
  common: '🖼️',
  modern: '⚡',
  document: '📄',
  icon: '🔖',
  legacy: '📦',
};

const currentFormat = computed(() => FORMAT_OPTIONS.find(f => f.value === targetFormat.value));
</script>
