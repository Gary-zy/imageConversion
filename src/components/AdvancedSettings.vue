<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <button
      @click="isExpanded = !isExpanded"
      class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
    >
      <span class="font-medium text-gray-700">高级设置</span>
      <svg
        :class="['w-5 h-5 text-gray-400 transition-transform', isExpanded ? 'rotate-180' : '']"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <div v-if="isExpanded" class="border-t border-gray-200">
      <!-- 标签页导航 -->
      <div class="flex border-b border-gray-200 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors', activeTab === tab.id ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700']"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="px-4 py-4 max-h-96 overflow-y-auto">
        <!-- 基础设置 -->
        <div v-if="activeTab === 'basic'" class="space-y-5">
          <!-- 质量调整 -->
          <div v-if="supportsQuality">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              图片质量: {{ settings.quality }}%
            </label>
            <input
              type="range"
              min="1"
              max="100"
              v-model.number="settings.quality"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div class="flex justify-between text-xs text-gray-400 mt-1">
              <span>最小文件</span>
              <span>最高质量</span>
            </div>
          </div>

          <!-- 尺寸调整 -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="enableResize"
                v-model="settings.enableResize"
                class="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
              />
              <label
                for="enableResize"
                class="text-sm font-medium text-gray-700"
              >
                调整尺寸
              </label>
            </div>

            <div v-if="settings.enableResize" class="pl-6 space-y-3">
              <div class="flex items-center gap-3">
                <div class="flex-1">
                  <label class="block text-xs text-gray-500 mb-1">
                    宽度 (px)
                  </label>
                  <input
                    type="number"
                    v-model.number="settings.resizeWidth"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <span class="text-gray-400 mt-5">x</span>
                <div class="flex-1">
                  <label class="block text-xs text-gray-500 mb-1">
                    高度 (px)
                  </label>
                  <input
                    type="number"
                    v-model.number="settings.resizeHeight"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="maintainAspectRatio"
                  v-model="settings.maintainAspectRatio"
                  class="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <label
                  for="maintainAspectRatio"
                  class="text-sm text-gray-600"
                >
                  保持宽高比
                </label>
              </div>

              <!-- 常用尺寸快捷选择 -->
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="size in [
                    { label: '1920x1080', width: 1920, height: 1080 },
                    { label: '1280x720', width: 1280, height: 720 },
                    { label: '800x600', width: 800, height: 600 },
                    { label: '512x512', width: 512, height: 512 },
                  ]"
                  :key="size.label"
                  @click="updateSettings({ resizeWidth: size.width, resizeHeight: size.height })"
                  class="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                >
                  {{ size.label }}
                </button>
              </div>

              <!-- 社交媒体尺寸预设 -->
              <div class="mt-4">
                <label class="block text-xs text-gray-500 mb-2">社交媒体尺寸</label>
                <div class="space-y-2">
                  <!-- Instagram -->
                  <div>
                    <span class="text-xs font-medium text-gray-600">Instagram</span>
                    <div class="flex flex-wrap gap-2 mt-1">
                      <button
                        v-for="size in SOCIAL_MEDIA_SIZES.instagram"
                        :key="size.name"
                        @click="updateSettings({ resizeWidth: size.width, resizeHeight: size.height })"
                        class="px-2 py-1 text-xs text-gray-600 bg-purple-50 hover:bg-purple-100 rounded transition-colors"
                      >
                        {{ size.name }} ({{ size.width }}x{{ size.height }})
                      </button>
                    </div>
                  </div>
                  <!-- Facebook -->
                  <div>
                    <span class="text-xs font-medium text-gray-600">Facebook</span>
                    <div class="flex flex-wrap gap-2 mt-1">
                      <button
                        v-for="size in SOCIAL_MEDIA_SIZES.facebook"
                        :key="size.name"
                        @click="updateSettings({ resizeWidth: size.width, resizeHeight: size.height })"
                        class="px-2 py-1 text-xs text-gray-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                      >
                        {{ size.name }} ({{ size.width }}x{{ size.height }})
                      </button>
                    </div>
                  </div>
                  <!-- Twitter -->
                  <div>
                    <span class="text-xs font-medium text-gray-600">Twitter/X</span>
                    <div class="flex flex-wrap gap-2 mt-1">
                      <button
                        v-for="size in SOCIAL_MEDIA_SIZES.twitter"
                        :key="size.name"
                        @click="updateSettings({ resizeWidth: size.width, resizeHeight: size.height })"
                        class="px-2 py-1 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                      >
                        {{ size.name }} ({{ size.width }}x{{ size.height }})
                      </button>
                    </div>
                  </div>
                  <!-- YouTube -->
                  <div>
                    <span class="text-xs font-medium text-gray-600">YouTube</span>
                    <div class="flex flex-wrap gap-2 mt-1">
                      <button
                        v-for="size in SOCIAL_MEDIA_SIZES.youtube"
                        :key="size.name"
                        @click="updateSettings({ resizeWidth: size.width, resizeHeight: size.height })"
                        class="px-2 py-1 text-xs text-gray-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                      >
                        {{ size.name }} ({{ size.width }}x{{ size.height }})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 文件名设置 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              文件名设置
            </label>
            <div class="flex items-center gap-2">
              <div class="flex-1">
                <label class="block text-xs text-gray-500 mb-1">前缀</label>
                <input
                  type="text"
                  v-model="settings.fileNamePrefix"
                  placeholder="如: converted_"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div class="flex-1">
                <label class="block text-xs text-gray-500 mb-1">后缀</label>
                <input
                  type="text"
                  v-model="settings.fileNameSuffix"
                  placeholder="如: _converted"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <!-- 背景色 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              背景色 (用于透明图片)
            </label>
            <div class="flex items-center gap-3">
              <input
                type="color"
                :value="settings.backgroundColor || '#ffffff'"
                @input="updateSettings({ backgroundColor: ($event.target as HTMLInputElement).value })"
                class="w-10 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                :value="settings.backgroundColor || ''"
                @input="updateSettings({ backgroundColor: ($event.target as HTMLInputElement).value })"
                placeholder="#FFFFFF 或留空透明"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                @click="updateSettings({ backgroundColor: '' })"
                class="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                清除
              </button>
            </div>
          </div>
        </div>

        <!-- 变换设置 -->
        <div v-if="activeTab === 'transform'" class="space-y-5">
          <!-- 旋转 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              旋转角度
            </label>
            <div class="flex gap-2">
              <button
                v-for="angle in [
                  { label: '0°', value: 0 },
                  { label: '90°', value: 90 },
                  { label: '180°', value: 180 },
                  { label: '270°', value: 270 },
                ]"
                :key="angle.label"
                @click="updateSettings({ rotate: angle.value })"
                :class="['px-4 py-2 rounded-md font-medium transition-colors', settings.rotate === angle.value ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
              >
                {{ angle.label }}
              </button>
            </div>
          </div>

          <!-- 翻转 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              翻转
            </label>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="flip"
                  v-model="settings.flip"
                  class="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <label
                  for="flip"
                  class="text-sm text-gray-600"
                >
                  水平翻转 (左右翻转)
                </label>
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="flop"
                  v-model="settings.flop"
                  class="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <label
                  for="flop"
                  class="text-sm text-gray-600"
                >
                  垂直翻转 (上下翻转)
                </label>
              </div>
            </div>
          </div>

          <!-- 裁剪 -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="enableCrop"
                v-model="settings.enableCrop"
                class="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
              />
              <label
                for="enableCrop"
                class="text-sm font-medium text-gray-700"
              >
                裁剪
              </label>
            </div>

            <div v-if="settings.enableCrop" class="pl-6 grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-500 mb-1">X 坐标</label>
                <input
                  type="number"
                  v-model.number="settings.cropX"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Y 坐标</label>
                <input
                  type="number"
                  v-model.number="settings.cropY"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">宽度</label>
                <input
                  type="number"
                  v-model.number="settings.cropWidth"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">高度</label>
                <input
                  type="number"
                  v-model.number="settings.cropHeight"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 调整设置 -->
        <div v-if="activeTab === 'adjust'">
          <div class="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="enableAdjustment"
              v-model="settings.enableAdjustment"
              class="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
            />
            <label
              for="enableAdjustment"
              class="text-sm font-medium text-gray-700"
            >
              启用图片调整
            </label>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-600 mb-2">
                亮度: {{ settings.brightness > 0 ? '+' : '' }}{{ settings.brightness }}
              </label>
              <input
                type="range"
                min="-100"
                max="100"
                v-model.number="settings.brightness"
                :disabled="!settings.enableAdjustment"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
              />
              <div class="flex justify-between text-xs text-gray-400 mt-1">
                <span>-100</span>
                <span>0</span>
                <span>+100</span>
              </div>
            </div>

            <div>
              <label class="block text-sm text-gray-600 mb-2">
                对比度: {{ settings.contrast > 0 ? '+' : '' }}{{ settings.contrast }}
              </label>
              <input
                type="range"
                min="-100"
                max="100"
                v-model.number="settings.contrast"
                :disabled="!settings.enableAdjustment"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
              />
              <div class="flex justify-between text-xs text-gray-400 mt-1">
                <span>-100</span>
                <span>0</span>
                <span>+100</span>
              </div>
            </div>

            <div>
              <label class="block text-sm text-gray-600 mb-2">
                饱和度: {{ settings.saturation > 0 ? '+' : '' }}{{ settings.saturation }}
              </label>
              <input
                type="range"
                min="-100"
                max="100"
                v-model.number="settings.saturation"
                :disabled="!settings.enableAdjustment"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
              />
              <div class="flex justify-between text-xs text-gray-400 mt-1">
                <span>-100</span>
                <span>0</span>
                <span>+100</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 滤镜设置 -->
        <div v-if="activeTab === 'filter'">
          <div class="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="enableFilter"
              v-model="settings.enableFilter"
              class="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
            />
            <label
              for="enableFilter"
              class="text-sm font-medium text-gray-700"
            >
              启用滤镜
            </label>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-600 mb-2">
                模糊: {{ settings.blur }}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                v-model.number="settings.blur"
                :disabled="!settings.enableFilter"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label class="block text-sm text-gray-600 mb-2">
                锐化: {{ settings.sharpen }}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                v-model.number="settings.sharpen"
                :disabled="!settings.enableFilter"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
              />
            </div>

            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="grayscale"
                  v-model="settings.grayscale"
                  :disabled="!settings.enableFilter"
                  class="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                />
                <label
                  for="grayscale"
                  class="text-sm text-gray-600"
                >
                  灰度
                </label>
              </div>

              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sepia"
                  v-model="settings.sepia"
                  :disabled="!settings.enableFilter"
                  class="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                />
                <label
                  for="sepia"
                  class="text-sm text-gray-600"
                >
                  复古 (棕褐色)
                </label>
              </div>

              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="invert"
                  v-model="settings.invert"
                  :disabled="!settings.enableFilter"
                  class="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                />
                <label
                  for="invert"
                  class="text-sm text-gray-600"
                >
                  反色
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- 水印设置 -->
        <div v-if="activeTab === 'watermark'" class="space-y-4">
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              id="enableWatermark"
              v-model="settings.enableWatermark"
              class="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
            />
            <label
              for="enableWatermark"
              class="text-sm font-medium text-gray-700"
            >
              启用水印
            </label>
          </div>

          <!-- 水印类型选择 -->
          <div>
            <label class="block text-xs text-gray-500 mb-2">水印类型</label>
            <div class="flex gap-2">
              <button
                @click="updateSettings({ watermarkType: 'text' })"
                :disabled="!settings.enableWatermark"
                :class="['flex-1 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50', settings.watermarkType === 'text' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
              >
                文字水印
              </button>
              <button
                @click="updateSettings({ watermarkType: 'image' })"
                :disabled="!settings.enableWatermark"
                :class="['flex-1 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50', settings.watermarkType === 'image' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
              >
                图片水印
              </button>
            </div>
          </div>

          <!-- 文字水印设置 -->
          <template v-if="settings.watermarkType === 'text'">
            <div>
              <label class="block text-xs text-gray-500 mb-1">水印文字</label>
              <input
                type="text"
                v-model="settings.watermarkText"
                :disabled="!settings.enableWatermark"
                placeholder="输入水印文字"
                class="w-full px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              />
            </div>

            <div>
              <label class="block text-xs text-gray-500 mb-1">文字颜色</label>
              <div class="flex items-center gap-3">
                <input
                  type="color"
                  :value="settings.watermarkColor"
                  @input="updateSettings({ watermarkColor: ($event.target as HTMLInputElement).value })"
                  :disabled="!settings.enableWatermark"
                  class="w-10 h-10 rounded border border-gray-300 cursor-pointer disabled:opacity-50"
                />
                <input
                  type="text"
                  :value="settings.watermarkColor"
                  @input="updateSettings({ watermarkColor: ($event.target as HTMLInputElement).value })"
                  :disabled="!settings.enableWatermark"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs text-gray-500 mb-1">
                字体大小: {{ settings.watermarkFontSize }}px
              </label>
              <input
                type="range"
                min="8"
                max="200"
                v-model.number="settings.watermarkFontSize"
                :disabled="!settings.enableWatermark"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
              />
            </div>

            <!-- 水印样式类型 -->
            <div>
              <label class="block text-xs text-gray-500 mb-2">水印样式</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="type in [
                    { label: '角落水印', value: 'corner' },
                    { label: '平铺水印', value: 'tiled' },
                    { label: '对角线水印', value: 'diagonal' },
                    { label: '全页覆盖', value: 'full' },
                  ]"
                  :key="type.value"
                  @click="updateSettings({ watermarkStyleType: type.value as any })"
                  :disabled="!settings.enableWatermark"
                  :class="['px-2 py-2 text-xs rounded-md transition-colors disabled:opacity-50', settings.watermarkStyleType === type.value ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
                >
                  {{ type.label }}
                </button>
              </div>
            </div>

            <!-- 旋转角度 -->
            <div>
              <label class="block text-xs text-gray-500 mb-1">
                旋转角度: {{ settings.watermarkRotation }}°
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                v-model.number="settings.watermarkRotation"
                :disabled="!settings.enableWatermark || settings.watermarkStyleType === 'corner'"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
              />
            </div>

            <!-- 水印间距（仅平铺和对角线模式显示） -->
            <div v-if="settings.watermarkStyleType === 'tiled' || settings.watermarkStyleType === 'diagonal'">
              <label class="block text-xs text-gray-500 mb-1">
                水印间距: {{ settings.watermarkSpacing }}px
              </label>
              <input
                type="range"
                min="50"
                max="500"
                v-model.number="settings.watermarkSpacing"
                :disabled="!settings.enableWatermark"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
              />
            </div>

            <!-- 边距（仅平铺模式显示） -->
            <div v-if="settings.watermarkStyleType === 'tiled'">
              <label class="block text-xs text-gray-500 mb-1">
                边距: {{ settings.watermarkMargin }}px
              </label>
              <input
                type="range"
                min="0"
                max="100"
                v-model.number="settings.watermarkMargin"
                :disabled="!settings.enableWatermark"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
              />
            </div>

            <!-- 字体缩放（仅全页覆盖模式显示） -->
            <div v-if="settings.watermarkStyleType === 'full'">
              <label class="block text-xs text-gray-500 mb-1">
                字体大小: {{ Math.round(settings.watermarkFontScale * 100) }}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.1"
                v-model.number="settings.watermarkFontScale"
                :disabled="!settings.enableWatermark"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
              />
              <div class="flex justify-between text-xs text-gray-400 mt-1">
                <span>10%</span>
                <span>100%</span>
                <span>150%</span>
              </div>
            </div>

            <!-- 位置（仅角落模式显示） -->
            <div v-if="settings.watermarkStyleType === 'corner'">
              <label class="block text-xs text-gray-500 mb-2">位置</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="pos in [
                    { label: '左上', value: 'top-left' },
                    { label: '右上', value: 'top-right' },
                    { label: '居中', value: 'center' },
                    { label: '左下', value: 'bottom-left' },
                    { label: '右下', value: 'bottom-right' },
                  ]"
                  :key="pos.value"
                  @click="updateSettings({ watermarkPosition: pos.value as any })"
                  :disabled="!settings.enableWatermark"
                  :class="['px-2 py-2 text-xs rounded-md transition-colors disabled:opacity-50', settings.watermarkPosition === pos.value ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
                >
                  {{ pos.label }}
                </button>
              </div>
            </div>
          </template>

          <!-- 图片水印设置 -->
          <template v-if="settings.watermarkType === 'image'">
            <div>
              <label class="block text-xs text-gray-500 mb-1">上传水印图片</label>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                :disabled="!settings.enableWatermark"
                class="w-full px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              />
              <div v-if="settings.watermarkImage" class="mt-2">
                <img
                  :src="settings.watermarkImage"
                  alt="水印预览"
                  class="h-20 border border-gray-200 rounded"
                />
                <p class="text-xs text-gray-500 mt-1">
                  原始尺寸: {{ settings.watermarkImageWidth }} x {{ settings.watermarkImageHeight }}
                </p>
              </div>
            </div>

            <div>
              <label class="block text-xs text-gray-500 mb-1">
                缩放比例: {{ settings.watermarkImageScale.toFixed(1) }}x
              </label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                v-model.number="settings.watermarkImageScale"
                :disabled="!settings.enableWatermark"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
              />
              <div class="flex justify-between text-xs text-gray-400 mt-1">
                <span>10%</span>
                <span>100%</span>
                <span>200%</span>
              </div>
            </div>

            <!-- 水印样式类型 -->
            <div>
              <label class="block text-xs text-gray-500 mb-2">水印样式</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="type in [
                    { label: '角落水印', value: 'corner' },
                    { label: '平铺水印', value: 'tiled' },
                    { label: '对角线水印', value: 'diagonal' },
                    { label: '全页覆盖', value: 'full' },
                  ]"
                  :key="type.value"
                  @click="updateSettings({ watermarkImageStyleType: type.value as any })"
                  :disabled="!settings.enableWatermark"
                  :class="['px-2 py-2 text-xs rounded-md transition-colors disabled:opacity-50', settings.watermarkImageStyleType === type.value ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
                >
                  {{ type.label }}
                </button>
              </div>
            </div>

            <!-- 旋转角度 -->
            <div>
              <label class="block text-xs text-gray-500 mb-1">
                旋转角度: {{ settings.watermarkImageRotation }}°
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                v-model.number="settings.watermarkImageRotation"
                :disabled="!settings.enableWatermark || settings.watermarkImageStyleType === 'corner'"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
              />
            </div>

            <!-- 水印间距（仅平铺和对角线模式显示） -->
            <div v-if="settings.watermarkImageStyleType === 'tiled' || settings.watermarkImageStyleType === 'diagonal'">
              <label class="block text-xs text-gray-500 mb-1">
                水印间距: {{ settings.watermarkImageSpacing }}px
              </label>
              <input
                type="range"
                min="50"
                max="500"
                v-model.number="settings.watermarkImageSpacing"
                :disabled="!settings.enableWatermark"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
              />
            </div>

            <!-- 边距（仅平铺模式显示） -->
            <div v-if="settings.watermarkImageStyleType === 'tiled'">
              <label class="block text-xs text-gray-500 mb-1">
                边距: {{ settings.watermarkImageMargin }}px
              </label>
              <input
                type="range"
                min="0"
                max="100"
                v-model.number="settings.watermarkImageMargin"
                :disabled="!settings.enableWatermark"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
              />
            </div>

            <!-- 图片缩放（仅全页覆盖模式显示） -->
            <div v-if="settings.watermarkImageStyleType === 'full'">
              <label class="block text-xs text-gray-500 mb-1">
                图片大小: {{ Math.round(settings.watermarkImageImageScale * 100) }}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.1"
                v-model.number="settings.watermarkImageImageScale"
                :disabled="!settings.enableWatermark"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
              />
              <div class="flex justify-between text-xs text-gray-400 mt-1">
                <span>10%</span>
                <span>100%</span>
                <span>150%</span>
              </div>
            </div>

            <!-- 位置（仅角落模式显示） -->
            <div v-if="settings.watermarkImageStyleType === 'corner'">
              <label class="block text-xs text-gray-500 mb-2">位置</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="pos in [
                    { label: '左上', value: 'top-left' },
                    { label: '右上', value: 'top-right' },
                    { label: '居中', value: 'center' },
                    { label: '左下', value: 'bottom-left' },
                    { label: '右下', value: 'bottom-right' },
                  ]"
                  :key="pos.value"
                  @click="updateSettings({ watermarkImagePosition: pos.value as any })"
                  :disabled="!settings.enableWatermark"
                  :class="['px-2 py-2 text-xs rounded-md transition-colors disabled:opacity-50', settings.watermarkImagePosition === pos.value ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
                >
                  {{ pos.label }}
                </button>
              </div>
            </div>
          </template>

          <!-- 透明度 - 共用 -->
          <div>
            <label class="block text-xs text-gray-500 mb-1">
              透明度: {{ Math.round(settings.watermarkType === 'text' ? settings.watermarkOpacity * 100 : settings.watermarkImageOpacity * 100) }}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              :value="settings.watermarkType === 'text' ? settings.watermarkOpacity * 100 : settings.watermarkImageOpacity * 100"
              @input="handleOpacityChange"
              :disabled="!settings.enableWatermark"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
            />
          </div>
        </div>

        <!-- 图标设置 -->
        <div v-if="activeTab === 'icon' && isIconFormat">
          <label class="block text-sm font-medium text-gray-700 mb-3">
            图标尺寸 (ICO/ICNS)
          </label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="size in [16, 32, 48, 64, 128, 256, 512, 1024]"
              :key="size"
              @click="() => {
                const newSizes = settings.iconSizes.includes(size)
                  ? settings.iconSizes.filter((s) => s !== size)
                  : [...settings.iconSizes, size];
                updateSettings({ iconSizes: newSizes });
              }"
              :class="['px-3 py-2 text-sm rounded-md transition-colors', settings.iconSizes.includes(size) ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
            >
              {{ size }}
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-3">
            选择要包含在图标文件中的尺寸。ICO 格式用于 Windows，ICNS 格式用于 macOS。
          </p>
        </div>

        <div v-if="activeTab === 'icon' && !isIconFormat" class="text-center text-gray-500 py-8">
          <p>图标设置仅在选择 ICO 或 ICNS 格式时可用</p>
        </div>

        <!-- EXIF 设置 -->
        <div v-if="activeTab === 'exif'" class="space-y-4">
          <div class="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="editExif"
              v-model="settings.editExif"
              class="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
            />
            <label
              for="editExif"
              class="text-sm font-medium text-gray-700"
            >
              编辑 EXIF 信息
            </label>
          </div>

          <template v-if="settings.editExif">
            <div>
              <label class="block text-xs text-gray-500 mb-1">作者 (Artist)</label>
              <input
                type="text"
                v-model="settings.exifArtist"
                placeholder="输入作者名称"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label class="block text-xs text-gray-500 mb-1">版权 (Copyright)</label>
              <input
                type="text"
                v-model="settings.exifCopyright"
                placeholder="输入版权信息，如: © 2025 Your Name"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label class="block text-xs text-gray-500 mb-1">软件 (Software)</label>
              <input
                type="text"
                v-model="settings.exifSoftware"
                placeholder="生成软件的名称"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div class="p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
              <p class="text-sm text-blue-700 dark:text-blue-400">
                <strong>提示：</strong>EXIF 信息编辑功能会在转换后的图片中嵌入您设置的信息。目前支持 JPEG、PNG 和 WebP 格式。
              </p>
            </div>
          </template>

          <div v-else class="text-center text-gray-500 py-8">
            <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>启用 EXIF 编辑后可修改图片元数据</p>
            <p class="text-sm mt-2">包括作者、版权、软件等信息</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useImageStore } from '../stores/imageStore';
import { FORMAT_OPTIONS, SOCIAL_MEDIA_SIZES } from '../types';

const isExpanded = ref(false);
const activeTab = ref('basic');
const fileInputRef = ref<HTMLInputElement | null>(null);

const store = useImageStore();
const settings = computed(() => store.settings);
const targetFormat = computed(() => store.targetFormat);
const updateSettings = store.updateSettings.bind(store);

const currentFormat = computed(() => FORMAT_OPTIONS.find((f) => f.value === targetFormat.value));
const supportsQuality = computed(() => currentFormat.value?.supportsQuality ?? false);
const isIconFormat = computed(() => targetFormat.value === 'ico' || targetFormat.value === 'icns');

const handleOpacityChange = (e: Event) => {
  const value = Number((e.target as HTMLInputElement).value) / 100;
  if (settings.value.watermarkType === 'text') {
    updateSettings({ watermarkOpacity: value });
  } else {
    updateSettings({ watermarkImageOpacity: value });
  }
};

const tabs = [
  { id: 'basic', label: '基础' },
  { id: 'transform', label: '变换' },
  { id: 'adjust', label: '调整' },
  { id: 'filter', label: '滤镜' },
  { id: 'watermark', label: '水印' },
  { id: 'icon', label: '图标' },
  { id: 'exif', label: 'EXIF' },
];

const handleImageUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
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
  }
};
</script>
