<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useImageStore } from './stores/imageStore';
import { downloadAsZip } from './utils/download';
import FileUpload from './components/FileUpload.vue';
import FormatSelector from './components/FormatSelector.vue';
import FileList from './components/FileList.vue';
import AdvancedSettings from './components/AdvancedSettings.vue';
import ImagePreview from './components/ImagePreview.vue';
import OfdProcessor from './components/OfdProcessor.vue';
import { formatFileSize } from './types';

type TabType = 'image' | 'ofd';

const activeTab = ref<TabType>('image');
const showHistory = ref(false);
const showShortcuts = ref(false);

// 使用 store
const store = useImageStore();
const files = computed(() => store.files);
const targetFormat = computed(() => store.targetFormat);
const settings = computed(() => store.settings);
const isConverting = computed(() => store.isConverting);
const isDarkMode = computed(() => store.isDarkMode);
const history = computed(() => store.history);
const clearFiles = store.clearFiles.bind(store);
const toggleDarkMode = store.toggleDarkMode.bind(store);
const clearHistory = store.clearHistory.bind(store);
const removeHistoryItem = store.removeHistoryItem.bind(store);
const convertAll = store.convertAll.bind(store);

const completedFiles = computed(() => files.value.filter((f) => f.status === 'completed'));
const hasFilesToConvert = computed(() =>
  files.value.some((f) => f.status === 'pending' || f.status === 'failed')
);

const handleConvertAll = async () => {
  await convertAll();
};

const handleDownloadAll = async () => {
  if (completedFiles.value.length > 0) {
    await downloadAsZip(
      completedFiles.value,
      targetFormat.value,
      settings.value.fileNamePrefix,
      settings.value.fileNameSuffix
    );
  }
};

// 键盘快捷键处理
const handleKeydown = (e: KeyboardEvent) => {
  // 如果正在输入，不触发快捷键
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
    return;
  }

  // Ctrl/Cmd + Enter: 开始转换
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    if (hasFilesToConvert.value && !isConverting.value) {
      handleConvertAll();
    }
    return;
  }

  // Escape: 关闭弹窗/清空文件
  if (e.key === 'Escape') {
    if (showHistory.value) {
      showHistory.value = false;
      return;
    }
    if (showShortcuts.value) {
      showShortcuts.value = false;
      return;
    }
    if (files.value.length > 0) {
      clearFiles();
    }
    return;
  }

  // Ctrl/Cmd + H: 历史记录
  if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
    e.preventDefault();
    showHistory.value = !showHistory.value;
    return;
  }

  // Ctrl/Cmd + /: 显示快捷键
  if ((e.ctrlKey || e.metaKey) && e.key === '/') {
    e.preventDefault();
    showShortcuts.value = !showShortcuts.value;
    return;
  }

  // D: 切换深色模式
  if (e.key === 'd' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    toggleDarkMode();
    return;
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// 格式化时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) {
    return '刚刚';
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`;
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前`;
  } else {
    return date.toLocaleDateString('zh-CN');
  }
};

// 快捷键列表
const shortcuts = [
  { key: 'Ctrl + Enter', action: '开始转换', description: '转换所有待处理的文件' },
  { key: 'Escape', action: '取消/关闭', description: '清空文件列表或关闭弹窗' },
  { key: 'Ctrl + H', action: '历史记录', description: '打开/关闭转换历史' },
  { key: 'Ctrl + /', action: '快捷键帮助', description: '显示快捷键列表' },
  { key: 'D', action: '切换主题', description: '切换深色/浅色模式' },
  { key: '点击图标', action: 'GitHub', description: '访问项目仓库，欢迎 Star ⭐' },
];
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900">图片转换器</h1>
              <p class="text-xs text-gray-500 hidden sm:block">纯前端处理，保护隐私</p>
            </div>
          </div>

          <!-- Tab 切换 -->
          <div class="flex bg-gray-100 rounded-xl p-1">
            <button
              @click="activeTab = 'image'"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                activeTab === 'image'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="hidden sm:inline">图片格式</span>
            </button>
            <button
              @click="activeTab = 'ofd'"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                activeTab === 'ofd'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="hidden sm:inline">OFD 文档</span>
            </button>
          </div>

          <!-- 功能特性标签 - 简化 -->
          <div class="hidden md:flex items-center gap-3 text-xs text-gray-400">
            <span>免费</span>
            <span>·</span>
            <span>本地处理</span>
            <span>·</span>
            <span>开源</span>
          </div>

          <!-- 工具按钮 -->
          <div class="flex items-center gap-2">
            <!-- 快捷键按钮 -->
            <button
              @click="showShortcuts = true"
              class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="快捷键 (Ctrl + /)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            <!-- 历史记录按钮 -->
            <button
              @click="showHistory = true"
              class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
              title="历史记录 (Ctrl + H)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span v-if="history.length > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                {{ history.length > 9 ? '9+' : history.length }}
              </span>
            </button>

            <!-- GitHub 链接 -->
            <a
              href="https://github.com/Gary-zy/imageConversion"
              target="_blank"
              rel="noopener noreferrer"
              class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="GitHub 仓库 - 欢迎 Star ⭐"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>

            <!-- 深色模式切换 -->
            <button
              @click="toggleDarkMode"
              class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="切换深色模式 (D)"
            >
              <svg v-if="isDarkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <template v-if="activeTab === 'image'">
        <div class="space-y-6">
          <!-- 顶部统计信息 -->
          <div
            v-if="files.length > 0"
            class="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg shadow-primary-500/30"
          >
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="text-2xl font-bold">{{ files.length }}</p>
                  <p class="text-white/80 text-sm">已添加文件</p>
                </div>
              </div>
              <div class="flex gap-8">
                <div class="text-center">
                  <p class="text-lg font-semibold">{{ completedFiles.length }}</p>
                  <p class="text-white/70 text-xs">已完成</p>
                </div>
                <div class="text-center">
                  <p class="text-lg font-semibold">{{ files.length - completedFiles.length }}</p>
                  <p class="text-white/70 text-xs">待转换</p>
                </div>
                <div class="text-center">
                  <p class="text-lg font-semibold">
                    {{
                      completedFiles.length > 0
                        ? Math.round(
                            completedFiles.reduce(
                              (acc, f) => acc + (f.size - (f.convertedSize || 0)),
                              0
                            ) /
                              completedFiles.reduce((acc, f) => acc + f.size, 0) *
                              100
                          )
                        : 0
                    }}%
                  </p>
                  <p class="text-white/70 text-xs">平均压缩</p>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <!-- 左侧：上传和格式选择 -->
            <div class="xl:col-span-2 space-y-6">
              <!-- 上传区域 -->
              <section>
                <FileUpload />
              </section>

              <!-- 格式选择 -->
              <section>
                <FormatSelector />
              </section>

              <!-- 文件列表 -->
              <section>
                <FileList />
              </section>

              <!-- 预览区域 -->
              <section v-if="files.length === 1">
                <h2 class="text-sm font-medium text-gray-700 mb-3">预览对比</h2>
                <ImagePreview :file="files[0]" />
              </section>
            </div>

            <!-- 右侧：设置和操作 -->
            <div class="xl:col-span-1 space-y-6">
              <!-- 高级设置 -->
              <section>
                <AdvancedSettings />
              </section>

              <!-- 操作按钮 -->
              <div v-if="files.length > 0" class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3">
                <h3 class="font-semibold text-gray-800 mb-4">操作</h3>

                <button
                  @click="handleConvertAll"
                  :disabled="!hasFilesToConvert || isConverting"
                  :class="[
                    'w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2',
                    hasFilesToConvert && !isConverting
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  ]"
                >
                  <template v-if="isConverting">
                    <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>转换中...</span>
                  </template>
                  <template v-else>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>开始转换</span>
                  </template>
                </button>

                <button
                  v-if="completedFiles.length > 1"
                  @click="handleDownloadAll"
                  class="w-full py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>批量下载 (ZIP)</span>
                </button>

                <button
                  @click="clearFiles"
                  class="w-full py-3 px-4 rounded-xl font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>清空列表</span>
                </button>
              </div>

              <!-- 使用提示 -->
              <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-4">
                <h4 class="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  使用提示
                </h4>
                <ul class="text-sm text-amber-700 space-y-1">
                  <li class="flex items-start gap-2">
                    <span class="text-amber-500">•</span>
                    支持拖拽、点击或 Ctrl+V 粘贴上传
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-amber-500">•</span>
                    可批量处理多张图片
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-amber-500">•</span>
                    所有转换在浏览器本地完成
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <OfdProcessor />
      </template>
    </main>

    <!-- Footer - 简化 -->
    <footer class="mt-16 py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-xs text-gray-400">
          所有处理均在浏览器本地完成，不会上传任何文件
        </p>
      </div>
    </footer>

    <!-- 历史记录弹窗 -->
    <Teleport to="body">
      <div v-if="showHistory" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- 遮罩层 -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showHistory = false"></div>

        <!-- 弹窗内容 -->
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-700">
          <!-- 头部 -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">转换历史</h3>
            <div class="flex items-center gap-2">
              <button
                v-if="history.length > 0"
                @click="clearHistory"
                class="px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                清空
              </button>
              <button
                @click="showHistory = false"
                class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 历史列表 -->
          <div class="overflow-y-auto max-h-[60vh]">
            <div v-if="history.length === 0" class="py-12 text-center text-gray-500 dark:text-gray-400">
              <svg class="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>暂无转换记录</p>
              <p class="text-sm mt-2">转换完成后会在这里显示记录</p>
            </div>

            <ul v-else class="divide-y divide-gray-100 dark:divide-gray-700">
              <li
                v-for="item in history"
                :key="item.id"
                class="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-800 dark:text-white truncate">{{ item.originalName }}</p>
                    <div class="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>{{ item.targetFormat.toUpperCase() }}</span>
                      <span>{{ formatTime(item.timestamp) }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-4 text-sm">
                    <span class="text-gray-500 dark:text-gray-400">
                      {{ formatFileSize(item.originalSize) }} → {{ formatFileSize(item.convertedSize) }}
                    </span>
                    <button
                      @click="removeHistoryItem(item.id)"
                      class="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="删除"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 快捷键弹窗 -->
    <Teleport to="body">
      <div v-if="showShortcuts" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- 遮罩层 -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showShortcuts = false"></div>

        <!-- 弹窗内容 -->
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-700">
          <!-- 头部 -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">键盘快捷键</h3>
            <button
              @click="showShortcuts = false"
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 快捷键列表 -->
          <div class="p-6 space-y-4">
            <div
              v-for="shortcut in shortcuts"
              :key="shortcut.key"
              class="flex items-center justify-between"
            >
              <div>
                <p class="font-medium text-gray-800 dark:text-white">{{ shortcut.action }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ shortcut.description }}</p>
              </div>
              <kbd class="px-3 py-1 text-sm font-mono bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                {{ shortcut.key }}
              </kbd>
            </div>
          </div>

          <!-- 底部提示 -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
            <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
              按 <kbd class="px-2 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-600 rounded border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300">Esc</kbd> 关闭此弹窗
            </p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
