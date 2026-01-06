<template>
  <div class="bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-soft dark:shadow-soft-dark">
    <!-- 标题栏 -->
    <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
      <h3 class="font-heading font-medium text-slate-800 dark:text-slate-100">高级设置</h3>
      <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span class="w-1.5 h-1.5 rounded-full" :class="hasActiveSettings ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-600'"></span>
        {{ hasActiveSettings ? '已配置' : '默认' }}
      </div>
    </div>

    <div class="p-5">
      <!-- 设置分类卡片 -->
      <div class="grid grid-cols-4 gap-3">
        <button
          v-for="tab in mainTabs"
          :key="tab.id"
          @click="activeTab = activeTab === tab.id ? '' : tab.id"
          :class="[
            'group relative py-3 rounded-lg border transition-all duration-300',
            activeTab === tab.id
              ? 'border-slate-400 dark:border-slate-500 bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 shadow-soft'
              : 'border-slate-200 dark:border-slate-600 bg-slate-100/50 dark:bg-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-soft'
          ]"
        >
          <div class="text-center">
            <div :class="['w-6 h-6 mx-auto mb-1', activeTab === tab.id ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500']">
              <component :is="tab.icon" />
            </div>
            <p :class="['text-xs font-medium', activeTab === tab.id ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400']">
              {{ tab.label }}
            </p>
          </div>
          <!-- 选中指示 -->
          <div
            v-if="activeTab === tab.id"
            class="absolute -top-1 -right-1 w-4 h-4 bg-slate-700 dark:bg-slate-300 rounded-full flex items-center justify-center shadow-soft"
          >
            <svg class="w-2.5 h-2.5 text-white dark:text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </button>
      </div>

      <!-- 更多设置 -->
      <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          @click="showMore = !showMore"
          class="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-600 transition-all duration-300"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>更多设置</span>
          <svg
            :class="['w-4 h-4 transition-transform duration-300', showMore ? 'rotate-180' : '']"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-show="showMore" class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="tab in moreTabs"
            :key="tab.id"
            @click="activeTab = activeTab === tab.id ? '' : tab.id"
            :class="[
              'px-3 py-1.5 text-sm rounded-lg border transition-all duration-300',
              activeTab === tab.id
                ? 'border-slate-400 dark:border-slate-500 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100'
                : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- 设置内容区域 -->
      <div v-if="activeTab" class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div class="max-h-80 overflow-y-auto pr-1">
          <!-- 基础设置 -->
          <div v-if="activeTab === 'basic'" class="space-y-5">
            <!-- 质量调整 -->
            <div v-if="supportsQuality">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                图片质量: {{ settings.quality }}%
              </label>
              <input
                type="range"
                min="1"
                max="100"
                v-model.number="settings.quality"
                class="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-slate-700 dark:accent-slate-300"
              />
              <div class="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
                <span>最小文件</span>
                <span>最高质量</span>
              </div>
            </div>

            <!-- 文件名设置 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">文件名设置</label>
              <div class="flex items-center gap-2">
                <div class="flex-1">
                  <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">前缀</label>
                  <input
                    type="text"
                    v-model="settings.fileNamePrefix"
                    placeholder="如: converted_"
                    class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm focus:ring-slate-500 focus:border-slate-500 dark:focus:border-slate-400 transition-colors duration-200"
                  />
                </div>
                <div class="flex-1">
                  <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">后缀</label>
                  <input
                    type="text"
                    v-model="settings.fileNameSuffix"
                    placeholder="如: _converted"
                    class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm focus:ring-slate-500 focus:border-slate-500 dark:focus:border-slate-400 transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            <!-- 背景色 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">背景色</label>
              <div class="flex items-center gap-3">
                <input
                  type="color"
                  :value="settings.backgroundColor || '#ffffff'"
                  @input="updateSettings({ backgroundColor: ($event.target as HTMLInputElement).value })"
                  class="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer"
                />
                <input
                  type="text"
                  :value="settings.backgroundColor || ''"
                  @input="updateSettings({ backgroundColor: ($event.target as HTMLInputElement).value })"
                  placeholder="#FFFFFF 或留空透明"
                  class="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm transition-colors duration-200"
                />
                <button
                  @click="updateSettings({ backgroundColor: '' })"
                  class="px-3 py-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-colors duration-200"
                >
                  清除
                </button>
              </div>
            </div>
          </div>

          <!-- 尺寸设置 -->
          <div v-if="activeTab === 'resize'" class="space-y-4">
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                id="enableResize"
                v-model="settings.enableResize"
                class="w-4 h-4 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 rounded focus:ring-slate-500"
              />
              <label for="enableResize" class="text-sm font-medium text-slate-700 dark:text-slate-300">启用尺寸调整</label>
            </div>

            <div v-if="settings.enableResize" class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="flex-1">
                  <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">宽度 (px)</label>
                  <input
                    type="number"
                    v-model.number="settings.resizeWidth"
                    class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm transition-colors duration-200"
                  />
                </div>
                <span class="text-slate-400 dark:text-slate-500 mt-5">×</span>
                <div class="flex-1">
                  <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">高度 (px)</label>
                  <input
                    type="number"
                    v-model.number="settings.resizeHeight"
                    class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm transition-colors duration-200"
                  />
                </div>
              </div>

              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="maintainAspectRatio"
                  v-model="settings.maintainAspectRatio"
                  class="w-4 h-4 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 rounded"
                />
                <label for="maintainAspectRatio" class="text-sm text-slate-600 dark:text-slate-400">保持宽高比</label>
              </div>

              <!-- 常用尺寸 -->
              <div>
                <p class="text-xs text-slate-400 dark:text-slate-500 mb-2">常用尺寸</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="size in quickSizes"
                    :key="size.label"
                    @click="updateSettings({ resizeWidth: size.width, resizeHeight: size.height })"
                    class="px-2 py-1 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-colors duration-200"
                  >
                    {{ size.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 变换设置 -->
          <div v-if="activeTab === 'transform'" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">旋转角度</label>
              <div class="flex gap-2">
                <button
                  v-for="angle in rotateAngles"
                  :key="angle.value"
                  @click="updateSettings({ rotate: angle.value })"
                  :class="[
                    'relative flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 border',
                    settings.rotate === angle.value
                      ? 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 border-slate-500 dark:border-slate-400 ring-2 ring-slate-700 dark:ring-slate-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 border-slate-200 dark:border-slate-600'
                  ]"
                >
                  {{ angle.label }}
                  <span v-if="settings.rotate === angle.value" class="absolute -top-1 -right-1 w-4 h-4 bg-slate-700 dark:bg-slate-300 rounded-full flex items-center justify-center">
                    <svg class="w-2.5 h-2.5 text-white dark:text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">翻转</label>
              <div class="flex gap-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="settings.flip" class="w-4 h-4 text-slate-700 dark:text-slate-300 rounded" />
                  <span class="text-sm text-slate-600 dark:text-slate-400">水平翻转</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="settings.flop" class="w-4 h-4 text-slate-700 dark:text-slate-300 rounded" />
                  <span class="text-sm text-slate-600 dark:text-slate-400">垂直翻转</span>
                </label>
              </div>
            </div>
          </div>

          <!-- 调整设置 -->
          <div v-if="activeTab === 'adjust'" class="space-y-4">
            <div class="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="enableAdjustment"
                v-model="settings.enableAdjustment"
                class="w-4 h-4 text-slate-700 dark:text-slate-300 rounded"
              />
              <label for="enableAdjustment" class="text-sm font-medium text-slate-700 dark:text-slate-300">启用图片调整</label>
            </div>

            <div class="space-y-4" :class="{ 'opacity-50': !settings.enableAdjustment }">
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-slate-600 dark:text-slate-400">亮度</span>
                  <span class="text-slate-400 dark:text-slate-500">{{ settings.brightness > 0 ? '+' : '' }}{{ settings.brightness }}</span>
                </div>
                <input
                  type="range" min="-100" max="100"
                  v-model.number="settings.brightness"
                  :disabled="!settings.enableAdjustment"
                  class="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-slate-700 dark:accent-slate-300"
                />
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-slate-600 dark:text-slate-400">对比度</span>
                  <span class="text-slate-400 dark:text-slate-500">{{ settings.contrast > 0 ? '+' : '' }}{{ settings.contrast }}</span>
                </div>
                <input
                  type="range" min="-100" max="100"
                  v-model.number="settings.contrast"
                  :disabled="!settings.enableAdjustment"
                  class="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-slate-700 dark:accent-slate-300"
                />
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-slate-600 dark:text-slate-400">饱和度</span>
                  <span class="text-slate-400 dark:text-slate-500">{{ settings.saturation > 0 ? '+' : '' }}{{ settings.saturation }}</span>
                </div>
                <input
                  type="range" min="-100" max="100"
                  v-model.number="settings.saturation"
                  :disabled="!settings.enableAdjustment"
                  class="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-slate-700 dark:accent-slate-300"
                />
              </div>
            </div>
          </div>

          <!-- 滤镜设置 -->
          <div v-if="activeTab === 'filter'" class="space-y-4">
            <div class="flex items-center gap-2 mb-2">
              <input type="checkbox" id="enableFilter" v-model="settings.enableFilter" class="w-4 h-4 text-slate-700 dark:text-slate-300 rounded" />
              <label for="enableFilter" class="text-sm font-medium text-slate-700 dark:text-slate-300">启用滤镜</label>
            </div>

            <div class="space-y-4" :class="{ 'opacity-50': !settings.enableFilter }">
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-slate-600 dark:text-slate-400">模糊</span>
                  <span class="text-slate-400 dark:text-slate-500">{{ settings.blur }}</span>
                </div>
                <input
                  type="range" min="0" max="100"
                  v-model.number="settings.blur"
                  :disabled="!settings.enableFilter"
                  class="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-slate-700 dark:accent-slate-300"
                />
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-slate-600 dark:text-slate-400">锐化</span>
                  <span class="text-slate-400 dark:text-slate-500">{{ settings.sharpen }}</span>
                </div>
                <input
                  type="range" min="0" max="100"
                  v-model.number="settings.sharpen"
                  :disabled="!settings.enableFilter"
                  class="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-slate-700 dark:accent-slate-300"
                />
              </div>
              <div class="flex flex-wrap gap-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="settings.grayscale" :disabled="!settings.enableFilter" class="w-4 h-4 text-slate-700 dark:text-slate-300 rounded" />
                  <span class="text-sm text-slate-600 dark:text-slate-400">灰度</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="settings.sepia" :disabled="!settings.enableFilter" class="w-4 h-4 text-slate-700 dark:text-slate-300 rounded" />
                  <span class="text-sm text-slate-600 dark:text-slate-400">复古</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="settings.invert" :disabled="!settings.enableFilter" class="w-4 h-4 text-slate-700 dark:text-slate-300 rounded" />
                  <span class="text-sm text-slate-600 dark:text-slate-400">反色</span>
                </label>
              </div>
            </div>
          </div>

          <!-- 水印设置 -->
          <div v-if="activeTab === 'watermark'" class="space-y-4">
            <div class="flex items-center gap-2 mb-2">
              <input type="checkbox" id="enableWatermark" v-model="settings.enableWatermark" class="w-4 h-4 text-slate-700 dark:text-slate-300 rounded" />
              <label for="enableWatermark" class="text-sm font-medium text-slate-700 dark:text-slate-300">启用水印</label>
            </div>

            <div :class="{ 'opacity-50 pointer-events-none': !settings.enableWatermark }">
              <!-- 水印类型 -->
              <div class="flex gap-2 mb-4">
                <button
                  @click="updateSettings({ watermarkType: 'text' })"
                  :class="[
                    'relative flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 border',
                    settings.watermarkType === 'text'
                      ? 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 border-slate-500 dark:border-slate-400 ring-2 ring-slate-700 dark:ring-slate-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 border-slate-200 dark:border-slate-600'
                  ]"
                >
                  文字水印
                  <span v-if="settings.watermarkType === 'text'" class="absolute -top-1 -right-1 w-4 h-4 bg-slate-700 dark:bg-slate-300 rounded-full flex items-center justify-center">
                    <svg class="w-2.5 h-2.5 text-white dark:text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </button>
                <button
                  @click="updateSettings({ watermarkType: 'image' })"
                  :class="[
                    'relative flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 border',
                    settings.watermarkType === 'image'
                      ? 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 border-slate-500 dark:border-slate-400 ring-2 ring-slate-700 dark:ring-slate-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 border-slate-200 dark:border-slate-600'
                  ]"
                >
                  图片水印
                  <span v-if="settings.watermarkType === 'image'" class="absolute -top-1 -right-1 w-4 h-4 bg-slate-700 dark:bg-slate-300 rounded-full flex items-center justify-center">
                    <svg class="w-2.5 h-2.5 text-white dark:text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </button>
              </div>

              <!-- 文字水印 -->
              <template v-if="settings.watermarkType === 'text'">
                <div class="space-y-3">
                  <input
                    type="text"
                    v-model="settings.watermarkText"
                    placeholder="输入水印文字"
                    class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm transition-colors duration-200"
                  />
                  <div class="flex items-center gap-3">
                    <input
                      type="color"
                      :value="settings.watermarkColor"
                      @input="updateSettings({ watermarkColor: ($event.target as HTMLInputElement).value })"
                      class="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer"
                    />
                    <div class="flex-1">
                      <div class="flex justify-between text-sm mb-1">
                        <span class="text-slate-600 dark:text-slate-400">字体大小</span>
                        <span class="text-slate-400 dark:text-slate-500">{{ settings.watermarkFontSize }}px</span>
                      </div>
                      <input
                        type="range" min="8" max="200"
                        v-model.number="settings.watermarkFontSize"
                        class="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-slate-700 dark:accent-slate-300"
                      />
                    </div>
                  </div>
                </div>
              </template>

              <!-- 图片水印 -->
              <template v-if="settings.watermarkType === 'image'">
                <div
                  @click="triggerFileInput"
                  @dragover.prevent="isDragging = true"
                  @dragleave="isDragging = false"
                  @drop.prevent="handleDrop"
                  :class="[
                    'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-300',
                    isDragging ? 'border-slate-500 dark:border-slate-400 bg-slate-100 dark:bg-slate-700' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                  ]"
                >
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/*"
                    @change="handleImageUpload"
                    class="hidden"
                  />
                  <div v-if="!settings.watermarkImage">
                    <svg class="w-8 h-8 mx-auto text-slate-400 dark:text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p class="text-sm text-slate-500 dark:text-slate-400">点击或拖拽上传</p>
                  </div>
                  <div v-else class="flex items-center gap-3">
                    <img :src="settings.watermarkImage" alt="水印" class="h-12 w-12 object-contain border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700" />
                    <div class="flex-1 text-left">
                      <p class="text-sm text-slate-700 dark:text-slate-300">已上传</p>
                      <p class="text-xs text-slate-400 dark:text-slate-500">{{ settings.watermarkImageWidth }} × {{ settings.watermarkImageHeight }}</p>
                    </div>
                    <button @click.stop="clearWatermarkImage" class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded transition-colors duration-200">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </template>

              <!-- 水印样式 -->
              <div class="mt-4">
                <p class="text-xs text-slate-400 dark:text-slate-500 mb-2">水印样式</p>
                <div class="grid grid-cols-4 gap-2">
                  <button
                    v-for="type in watermarkStyles"
                    :key="type.value"
                    @click="updateSettings(settings.watermarkType === 'text' ? { watermarkStyleType: type.value as any } : { watermarkImageStyleType: type.value as any })"
                    :class="[
                      'relative py-1.5 text-xs rounded-lg transition-all duration-300 border',
                      (settings.watermarkType === 'text' ? settings.watermarkStyleType : settings.watermarkImageStyleType) === type.value
                        ? 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 border-slate-500 dark:border-slate-400 ring-2 ring-slate-700 dark:ring-slate-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 border-slate-200 dark:border-slate-600'
                    ]"
                  >
                    {{ type.label }}
                  </button>
                </div>
              </div>

              <!-- 透明度 -->
              <div class="mt-4">
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-slate-600 dark:text-slate-400">透明度</span>
                  <span class="text-slate-400 dark:text-slate-500">{{ Math.round((settings.watermarkType === 'text' ? settings.watermarkOpacity : settings.watermarkImageOpacity) * 100) }}%</span>
                </div>
                <input
                  type="range" min="0" max="100"
                  :value="(settings.watermarkType === 'text' ? settings.watermarkOpacity : settings.watermarkImageOpacity) * 100"
                  @input="handleOpacityChange"
                  class="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-slate-700 dark:accent-slate-300"
                />
              </div>
            </div>
          </div>

          <!-- 图标设置 -->
          <div v-if="activeTab === 'icon'">
            <div v-if="isIconFormat" class="space-y-3">
              <p class="text-sm font-medium text-slate-700 dark:text-slate-300">图标尺寸</p>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="size in iconSizes"
                  :key="size"
                  @click="toggleIconSize(size)"
                  :class="[
                    'relative py-2 text-sm rounded-lg transition-all duration-300 border',
                    settings.iconSizes.includes(size)
                      ? 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 border-slate-500 dark:border-slate-400 ring-2 ring-slate-700 dark:ring-slate-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 border-slate-200 dark:border-slate-600'
                  ]"
                >
                  {{ size }}
                  <span v-if="settings.iconSizes.includes(size)" class="absolute -top-1 -right-1 w-4 h-4 bg-slate-700 dark:bg-slate-300 rounded-full flex items-center justify-center">
                    <svg class="w-2.5 h-2.5 text-white dark:text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </button>
              </div>
              <p class="text-xs text-slate-400 dark:text-slate-500">选择要包含在图标文件中的尺寸</p>
            </div>
            <div v-else class="text-center py-8 text-slate-400 dark:text-slate-500">
              <p class="text-sm">图标设置仅在选择 ICO 或 ICNS 格式时可用</p>
            </div>
          </div>

          <!-- EXIF 设置 -->
          <div v-if="activeTab === 'exif'" class="space-y-4">
            <div class="flex items-center gap-2 mb-2">
              <input type="checkbox" id="editExif" v-model="settings.editExif" class="w-4 h-4 text-slate-700 dark:text-slate-300 rounded" />
              <label for="editExif" class="text-sm font-medium text-slate-700 dark:text-slate-300">编辑 EXIF 信息</label>
            </div>

            <div v-if="settings.editExif" class="space-y-3">
              <div>
                <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">作者</label>
                <input
                  type="text"
                  v-model="settings.exifArtist"
                  placeholder="输入作者名称"
                  class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm transition-colors duration-200"
                />
              </div>
              <div>
                <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">版权</label>
                <input
                  type="text"
                  v-model="settings.exifCopyright"
                  placeholder="© 2025 Your Name"
                  class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm transition-colors duration-200"
                />
              </div>
              <div>
                <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">软件</label>
                <input
                  type="text"
                  v-model="settings.exifSoftware"
                  placeholder="生成软件名称"
                  class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm transition-colors duration-200"
                />
              </div>
            </div>
            <div v-else class="text-center py-6 text-slate-400 dark:text-slate-500">
              <p class="text-sm">启用后可修改图片元数据</p>
            </div>
          </div>

          <!-- 裁剪设置 -->
          <div v-if="activeTab === 'crop'" class="space-y-4">
            <div class="flex items-center gap-2 mb-2">
              <input type="checkbox" id="enableCrop" v-model="settings.enableCrop" class="w-4 h-4 text-slate-700 dark:text-slate-300 rounded" />
              <label for="enableCrop" class="text-sm font-medium text-slate-700 dark:text-slate-300">启用裁剪</label>
            </div>

            <div v-if="settings.enableCrop" class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">X 坐标</label>
                <input type="number" v-model.number="settings.cropX" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm transition-colors duration-200" />
              </div>
              <div>
                <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Y 坐标</label>
                <input type="number" v-model.number="settings.cropY" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm transition-colors duration-200" />
              </div>
              <div>
                <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">宽度</label>
                <input type="number" v-model.number="settings.cropWidth" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm transition-colors duration-200" />
              </div>
              <div>
                <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">高度</label>
                <input type="number" v-model.number="settings.cropHeight" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm transition-colors duration-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue';
import { useImageStore } from '../stores/imageStore';
import { FORMAT_OPTIONS } from '../types';

const activeTab = ref('');
const showMore = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

const store = useImageStore();
const settings = computed(() => store.settings);
const targetFormat = computed(() => store.targetFormat);
const updateSettings = store.updateSettings.bind(store);

const currentFormat = computed(() => FORMAT_OPTIONS.find((f) => f.value === targetFormat.value));
const supportsQuality = computed(() => currentFormat.value?.supportsQuality ?? false);
const isIconFormat = computed(() => targetFormat.value === 'ico' || targetFormat.value === 'icns');

// 检查是否有激活的设置
const hasActiveSettings = computed(() => {
  const s = settings.value;
  return s.enableResize || s.enableCrop || s.enableAdjustment || s.enableFilter || s.enableWatermark || s.editExif || s.quality !== 85;
});

// 图标组件
const IconBasic = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' })
]);
const IconResize = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4' })
]);
const IconTransform = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' })
]);
const IconAdjust = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' })
]);

const mainTabs = [
  { id: 'basic', label: '基础', icon: IconBasic },
  { id: 'resize', label: '尺寸', icon: IconResize },
  { id: 'transform', label: '变换', icon: IconTransform },
  { id: 'adjust', label: '调整', icon: IconAdjust },
];

const moreTabs = [
  { id: 'filter', label: '滤镜' },
  { id: 'watermark', label: '水印' },
  { id: 'crop', label: '裁剪' },
  { id: 'icon', label: '图标' },
  { id: 'exif', label: 'EXIF' },
];

const quickSizes = [
  { label: '1920×1080', width: 1920, height: 1080 },
  { label: '1280×720', width: 1280, height: 720 },
  { label: '800×600', width: 800, height: 600 },
  { label: '512×512', width: 512, height: 512 },
];

const rotateAngles = [
  { label: '0°', value: 0 },
  { label: '90°', value: 90 },
  { label: '180°', value: 180 },
  { label: '270°', value: 270 },
];

const watermarkStyles = [
  { label: '角落', value: 'corner' },
  { label: '平铺', value: 'tiled' },
  { label: '对角', value: 'diagonal' },
  { label: '全页', value: 'full' },
];

const iconSizes = [16, 32, 48, 64, 128, 256, 512, 1024];

const handleOpacityChange = (e: Event) => {
  const value = Number((e.target as HTMLInputElement).value) / 100;
  if (settings.value.watermarkType === 'text') {
    updateSettings({ watermarkOpacity: value });
  } else {
    updateSettings({ watermarkImageOpacity: value });
  }
};

const toggleIconSize = (size: number) => {
  const newSizes = settings.value.iconSizes.includes(size)
    ? settings.value.iconSizes.filter((s) => s !== size)
    : [...settings.value.iconSizes, size];
  updateSettings({ iconSizes: newSizes });
};

const triggerFileInput = () => {
  if (settings.value.enableWatermark) {
    fileInputRef.value?.click();
  }
};

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  if (!settings.value.enableWatermark) return;
  const file = e.dataTransfer?.files?.[0];
  if (file && file.type.startsWith('image/')) {
    processImageFile(file);
  }
};

const processImageFile = (file: File) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      updateSettings({
        watermarkImage: event.target?.result as string,
        watermarkImageWidth: img.naturalWidth,
        watermarkImageHeight: img.naturalHeight,
      });
    };
    img.src = event.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const handleImageUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    processImageFile(file);
  }
};

const clearWatermarkImage = () => {
  updateSettings({
    watermarkImage: '',
    watermarkImageWidth: 100,
    watermarkImageHeight: 100,
  });
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};
</script>
