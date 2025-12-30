import { useState, useRef } from 'react';
import { useImageStore } from '../stores/imageStore';
import { FORMAT_OPTIONS } from '../types';

export default function AdvancedSettings() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const settings = useImageStore((state) => state.settings);
  const targetFormat = useImageStore((state) => state.targetFormat);
  const updateSettings = useImageStore((state) => state.updateSettings);

  const currentFormat = FORMAT_OPTIONS.find((f) => f.value === targetFormat);
  const supportsQuality = currentFormat?.supportsQuality ?? false;
  const isIconFormat = targetFormat === 'ico' || targetFormat === 'icns';

  const tabs = [
    { id: 'basic', label: '基础' },
    { id: 'transform', label: '变换' },
    { id: 'adjust', label: '调整' },
    { id: 'filter', label: '滤镜' },
    { id: 'watermark', label: '水印' },
    { id: 'icon', label: '图标' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-700">高级设置</span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* 标签页导航 */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="px-4 py-4 max-h-96 overflow-y-auto">
            {/* 基础设置 */}
            {activeTab === 'basic' && (
              <div className="space-y-5">
                {/* 质量调整 */}
                {supportsQuality && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      图片质量: {settings.quality}%
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={settings.quality}
                      onChange={(e) =>
                        updateSettings({ quality: Number(e.target.value) })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>最小文件</span>
                      <span>最高质量</span>
                    </div>
                  </div>
                )}

                {/* 尺寸调整 */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      id="enableResize"
                      checked={settings.enableResize}
                      onChange={(e) =>
                        updateSettings({ enableResize: e.target.checked })
                      }
                      className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label
                      htmlFor="enableResize"
                      className="text-sm font-medium text-gray-700"
                    >
                      调整尺寸
                    </label>
                  </div>

                  {settings.enableResize && (
                    <div className="pl-6 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">
                            宽度 (px)
                          </label>
                          <input
                            type="number"
                            value={settings.resizeWidth}
                            onChange={(e) =>
                              updateSettings({ resizeWidth: Number(e.target.value) })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <span className="text-gray-400 mt-5">x</span>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">
                            高度 (px)
                          </label>
                          <input
                            type="number"
                            value={settings.resizeHeight}
                            onChange={(e) =>
                              updateSettings({ resizeHeight: Number(e.target.value) })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="maintainAspectRatio"
                          checked={settings.maintainAspectRatio}
                          onChange={(e) =>
                            updateSettings({ maintainAspectRatio: e.target.checked })
                          }
                          className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <label
                          htmlFor="maintainAspectRatio"
                          className="text-sm text-gray-600"
                        >
                          保持宽高比
                        </label>
                      </div>

                      {/* 常用尺寸快捷选择 */}
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: '1920x1080', width: 1920, height: 1080 },
                          { label: '1280x720', width: 1280, height: 720 },
                          { label: '800x600', width: 800, height: 600 },
                          { label: '512x512', width: 512, height: 512 },
                        ].map((size) => (
                          <button
                            key={size.label}
                            onClick={() =>
                              updateSettings({
                                resizeWidth: size.width,
                                resizeHeight: size.height,
                              })
                            }
                            className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                          >
                            {size.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 文件名设置 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    文件名设置
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">前缀</label>
                      <input
                        type="text"
                        value={settings.fileNamePrefix}
                        onChange={(e) =>
                          updateSettings({ fileNamePrefix: e.target.value })
                        }
                        placeholder="如: converted_"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">后缀</label>
                      <input
                        type="text"
                        value={settings.fileNameSuffix}
                        onChange={(e) =>
                          updateSettings({ fileNameSuffix: e.target.value })
                        }
                        placeholder="如: _converted"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 背景色 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    背景色 (用于透明图片)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.backgroundColor || '#ffffff'}
                      onChange={(e) =>
                        updateSettings({ backgroundColor: e.target.value })
                      }
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.backgroundColor || ''}
                      onChange={(e) =>
                        updateSettings({ backgroundColor: e.target.value })
                      }
                      placeholder="#FFFFFF 或留空透明"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      onClick={() => updateSettings({ backgroundColor: '' })}
                      className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      清除
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 变换设置 */}
            {activeTab === 'transform' && (
              <div className="space-y-5">
                {/* 旋转 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    旋转角度
                  </label>
                  <div className="flex gap-2">
                    {[
                      { label: '0°', value: 0 },
                      { label: '90°', value: 90 },
                      { label: '180°', value: 180 },
                      { label: '270°', value: 270 },
                    ].map((angle) => (
                      <button
                        key={angle.label}
                        onClick={() => updateSettings({ rotate: angle.value })}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${
                          settings.rotate === angle.value
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {angle.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 翻转 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    翻转
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="flip"
                        checked={settings.flip}
                        onChange={(e) =>
                          updateSettings({ flip: e.target.checked })
                        }
                        className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label
                        htmlFor="flip"
                        className="text-sm text-gray-600"
                      >
                        水平翻转 (左右翻转)
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="flop"
                        checked={settings.flop}
                        onChange={(e) =>
                          updateSettings({ flop: e.target.checked })
                        }
                        className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label
                        htmlFor="flop"
                        className="text-sm text-gray-600"
                      >
                        垂直翻转 (上下翻转)
                      </label>
                    </div>
                  </div>
                </div>

                {/* 裁剪 */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      id="enableCrop"
                      checked={settings.enableCrop}
                      onChange={(e) =>
                        updateSettings({ enableCrop: e.target.checked })
                      }
                      className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label
                      htmlFor="enableCrop"
                      className="text-sm font-medium text-gray-700"
                    >
                      裁剪
                    </label>
                  </div>

                  {settings.enableCrop && (
                    <div className="pl-6 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">X 坐标</label>
                        <input
                          type="number"
                          value={settings.cropX}
                          onChange={(e) =>
                            updateSettings({ cropX: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Y 坐标</label>
                        <input
                          type="number"
                          value={settings.cropY}
                          onChange={(e) =>
                            updateSettings({ cropY: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">宽度</label>
                        <input
                          type="number"
                          value={settings.cropWidth}
                          onChange={(e) =>
                            updateSettings({ cropWidth: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">高度</label>
                        <input
                          type="number"
                          value={settings.cropHeight}
                          onChange={(e) =>
                            updateSettings({ cropHeight: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 调整设置 */}
            {activeTab === 'adjust' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="enableAdjustment"
                    checked={settings.enableAdjustment}
                    onChange={(e) =>
                      updateSettings({ enableAdjustment: e.target.checked })
                    }
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label
                    htmlFor="enableAdjustment"
                    className="text-sm font-medium text-gray-700"
                  >
                    启用图片调整
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      亮度: {settings.brightness > 0 ? '+' : ''}{settings.brightness}
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={settings.brightness}
                      onChange={(e) =>
                        updateSettings({ brightness: Number(e.target.value) })
                      }
                      disabled={!settings.enableAdjustment}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>-100</span>
                      <span>0</span>
                      <span>+100</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      对比度: {settings.contrast > 0 ? '+' : ''}{settings.contrast}
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={settings.contrast}
                      onChange={(e) =>
                        updateSettings({ contrast: Number(e.target.value) })
                      }
                      disabled={!settings.enableAdjustment}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>-100</span>
                      <span>0</span>
                      <span>+100</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      饱和度: {settings.saturation > 0 ? '+' : ''}{settings.saturation}
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={settings.saturation}
                      onChange={(e) =>
                        updateSettings({ saturation: Number(e.target.value) })
                      }
                      disabled={!settings.enableAdjustment}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>-100</span>
                      <span>0</span>
                      <span>+100</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 滤镜设置 */}
            {activeTab === 'filter' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="enableFilter"
                    checked={settings.enableFilter}
                    onChange={(e) =>
                      updateSettings({ enableFilter: e.target.checked })
                    }
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label
                    htmlFor="enableFilter"
                    className="text-sm font-medium text-gray-700"
                  >
                    启用滤镜
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      模糊: {settings.blur}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.blur}
                      onChange={(e) =>
                        updateSettings({ blur: Number(e.target.value) })
                      }
                      disabled={!settings.enableFilter}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      锐化: {settings.sharpen}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.sharpen}
                      onChange={(e) =>
                        updateSettings({ sharpen: Number(e.target.value) })
                      }
                      disabled={!settings.enableFilter}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="grayscale"
                        checked={settings.grayscale}
                        onChange={(e) =>
                          updateSettings({ grayscale: e.target.checked })
                        }
                        disabled={!settings.enableFilter}
                        className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                      />
                      <label
                        htmlFor="grayscale"
                        className="text-sm text-gray-600"
                      >
                        灰度
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="sepia"
                        checked={settings.sepia}
                        onChange={(e) =>
                          updateSettings({ sepia: e.target.checked })
                        }
                        disabled={!settings.enableFilter}
                        className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                      />
                      <label
                        htmlFor="sepia"
                        className="text-sm text-gray-600"
                      >
                        复古 (棕褐色)
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="invert"
                        checked={settings.invert}
                        onChange={(e) =>
                          updateSettings({ invert: e.target.checked })
                        }
                        disabled={!settings.enableFilter}
                        className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                      />
                      <label
                        htmlFor="invert"
                        className="text-sm text-gray-600"
                      >
                        反色
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 水印设置 */}
            {activeTab === 'watermark' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableWatermark"
                    checked={settings.enableWatermark}
                    onChange={(e) =>
                      updateSettings({ enableWatermark: e.target.checked })
                    }
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label
                    htmlFor="enableWatermark"
                    className="text-sm font-medium text-gray-700"
                  >
                    启用水印
                  </label>
                </div>

                {/* 水印类型选择 */}
                <div>
                  <label className="block text-xs text-gray-500 mb-2">水印类型</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateSettings({ watermarkType: 'text' })}
                      disabled={!settings.enableWatermark}
                      className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 ${
                        settings.watermarkType === 'text'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      文字水印
                    </button>
                    <button
                      onClick={() => updateSettings({ watermarkType: 'image' })}
                      disabled={!settings.enableWatermark}
                      className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 ${
                        settings.watermarkType === 'image'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      图片水印
                    </button>
                  </div>
                </div>

                {/* 文字水印设置 */}
                {settings.watermarkType === 'text' && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">水印文字</label>
                      <input
                        type="text"
                        value={settings.watermarkText}
                        onChange={(e) =>
                          updateSettings({ watermarkText: e.target.value })
                        }
                        disabled={!settings.enableWatermark}
                        placeholder="输入水印文字"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">文字颜色</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settings.watermarkColor}
                          onChange={(e) =>
                            updateSettings({ watermarkColor: e.target.value })
                          }
                          disabled={!settings.enableWatermark}
                          className="w-10 h-10 rounded border border-gray-300 cursor-pointer disabled:opacity-50"
                        />
                        <input
                          type="text"
                          value={settings.watermarkColor}
                          onChange={(e) =>
                            updateSettings({ watermarkColor: e.target.value })
                          }
                          disabled={!settings.enableWatermark}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        字体大小: {settings.watermarkFontSize}px
                      </label>
                      <input
                        type="range"
                        min="8"
                        max="200"
                        value={settings.watermarkFontSize}
                        onChange={(e) =>
                          updateSettings({ watermarkFontSize: Number(e.target.value) })
                        }
                        disabled={!settings.enableWatermark}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
                      />
                    </div>

                    {/* 水印样式类型 */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">水印样式</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: '角落水印', value: 'corner' },
                          { label: '平铺水印', value: 'tiled' },
                          { label: '对角线水印', value: 'diagonal' },
                          { label: '全页覆盖', value: 'full' },
                        ].map((type) => (
                          <button
                            key={type.value}
                            onClick={() => updateSettings({ watermarkStyleType: type.value as any })}
                            disabled={!settings.enableWatermark}
                            className={`px-2 py-2 text-xs rounded-md transition-colors disabled:opacity-50 ${
                              settings.watermarkStyleType === type.value
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 旋转角度 */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        旋转角度: {settings.watermarkRotation}°
                      </label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={settings.watermarkRotation}
                        onChange={(e) =>
                          updateSettings({ watermarkRotation: Number(e.target.value) })
                        }
                        disabled={!settings.enableWatermark || settings.watermarkStyleType === 'corner'}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
                      />
                    </div>

                    {/* 水印间距（仅平铺和对角线模式显示） */}
                    {(settings.watermarkStyleType === 'tiled' || settings.watermarkStyleType === 'diagonal') && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          水印间距: {settings.watermarkSpacing}px
                        </label>
                        <input
                          type="range"
                          min="50"
                          max="500"
                          value={settings.watermarkSpacing}
                          onChange={(e) =>
                            updateSettings({ watermarkSpacing: Number(e.target.value) })
                          }
                          disabled={!settings.enableWatermark}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
                        />
                      </div>
                    )}

                    {/* 边距（仅平铺模式显示） */}
                    {settings.watermarkStyleType === 'tiled' && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          边距: {settings.watermarkMargin}px
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={settings.watermarkMargin}
                          onChange={(e) =>
                            updateSettings({ watermarkMargin: Number(e.target.value) })
                          }
                          disabled={!settings.enableWatermark}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
                        />
                      </div>
                    )}

                    {/* 字体缩放（仅全页覆盖模式显示） */}
                    {settings.watermarkStyleType === 'full' && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          字体大小: {Math.round(settings.watermarkFontScale * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="1.5"
                          step="0.1"
                          value={settings.watermarkFontScale}
                          onChange={(e) =>
                            updateSettings({ watermarkFontScale: Number(e.target.value) })
                          }
                          disabled={!settings.enableWatermark}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>10%</span>
                          <span>100%</span>
                          <span>150%</span>
                        </div>
                      </div>
                    )}

                    {/* 位置（仅角落模式显示） */}
                    {settings.watermarkStyleType === 'corner' && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-2">位置</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: '左上', value: 'top-left' },
                            { label: '右上', value: 'top-right' },
                            { label: '居中', value: 'center' },
                            { label: '左下', value: 'bottom-left' },
                            { label: '右下', value: 'bottom-right' },
                          ].map((pos) => (
                            <button
                              key={pos.value}
                              onClick={() => updateSettings({ watermarkPosition: pos.value as any })}
                              disabled={!settings.enableWatermark}
                              className={`px-2 py-2 text-xs rounded-md transition-colors disabled:opacity-50 ${
                                settings.watermarkPosition === pos.value
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* 图片水印设置 */}
                {settings.watermarkType === 'image' && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">上传水印图片</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={!settings.enableWatermark}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                      />
                      {settings.watermarkImage && (
                        <div className="mt-2">
                          <img
                            src={settings.watermarkImage}
                            alt="水印预览"
                            className="h-20 border border-gray-200 rounded"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            原始尺寸: {settings.watermarkImageWidth} x {settings.watermarkImageHeight}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        缩放比例: {settings.watermarkImageScale.toFixed(1)}x
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="2"
                        step="0.1"
                        value={settings.watermarkImageScale}
                        onChange={(e) =>
                          updateSettings({ watermarkImageScale: Number(e.target.value) })
                        }
                        disabled={!settings.enableWatermark}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>10%</span>
                        <span>100%</span>
                        <span>200%</span>
                      </div>
                    </div>

                    {/* 水印样式类型 */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">水印样式</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: '角落水印', value: 'corner' },
                          { label: '平铺水印', value: 'tiled' },
                          { label: '对角线水印', value: 'diagonal' },
                          { label: '全页覆盖', value: 'full' },
                        ].map((type) => (
                          <button
                            key={type.value}
                            onClick={() => updateSettings({ watermarkImageStyleType: type.value as any })}
                            disabled={!settings.enableWatermark}
                            className={`px-2 py-2 text-xs rounded-md transition-colors disabled:opacity-50 ${
                              settings.watermarkImageStyleType === type.value
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 旋转角度 */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        旋转角度: {settings.watermarkImageRotation}°
                      </label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={settings.watermarkImageRotation}
                        onChange={(e) =>
                          updateSettings({ watermarkImageRotation: Number(e.target.value) })
                        }
                        disabled={!settings.enableWatermark || settings.watermarkImageStyleType === 'corner'}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
                      />
                    </div>

                    {/* 水印间距（仅平铺和对角线模式显示） */}
                    {(settings.watermarkImageStyleType === 'tiled' || settings.watermarkImageStyleType === 'diagonal') && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          水印间距: {settings.watermarkImageSpacing}px
                        </label>
                        <input
                          type="range"
                          min="50"
                          max="500"
                          value={settings.watermarkImageSpacing}
                          onChange={(e) =>
                            updateSettings({ watermarkImageSpacing: Number(e.target.value) })
                          }
                          disabled={!settings.enableWatermark}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
                        />
                      </div>
                    )}

                    {/* 边距（仅平铺模式显示） */}
                    {settings.watermarkImageStyleType === 'tiled' && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          边距: {settings.watermarkImageMargin}px
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={settings.watermarkImageMargin}
                          onChange={(e) =>
                            updateSettings({ watermarkImageMargin: Number(e.target.value) })
                          }
                          disabled={!settings.enableWatermark}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
                        />
                      </div>
                    )}

                    {/* 图片缩放（仅全页覆盖模式显示） */}
                    {settings.watermarkImageStyleType === 'full' && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          图片大小: {Math.round(settings.watermarkImageImageScale * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="1.5"
                          step="0.1"
                          value={settings.watermarkImageImageScale}
                          onChange={(e) =>
                            updateSettings({ watermarkImageImageScale: Number(e.target.value) })
                          }
                          disabled={!settings.enableWatermark}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>10%</span>
                          <span>100%</span>
                          <span>150%</span>
                        </div>
                      </div>
                    )}

                    {/* 位置（仅角落模式显示） */}
                    {settings.watermarkImageStyleType === 'corner' && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-2">位置</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: '左上', value: 'top-left' },
                            { label: '右上', value: 'top-right' },
                            { label: '居中', value: 'center' },
                            { label: '左下', value: 'bottom-left' },
                            { label: '右下', value: 'bottom-right' },
                          ].map((pos) => (
                            <button
                              key={pos.value}
                              onClick={() => updateSettings({ watermarkImagePosition: pos.value as any })}
                              disabled={!settings.enableWatermark}
                              className={`px-2 py-2 text-xs rounded-md transition-colors disabled:opacity-50 ${
                                settings.watermarkImagePosition === pos.value
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* 透明度 - 共用 */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    透明度: {Math.round(
                      settings.watermarkType === 'text'
                        ? settings.watermarkOpacity * 100
                        : settings.watermarkImageOpacity * 100
                    )}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={
                      settings.watermarkType === 'text'
                        ? settings.watermarkOpacity * 100
                        : settings.watermarkImageOpacity * 100
                    }
                    onChange={(e) =>
                      updateSettings(
                        settings.watermarkType === 'text'
                          ? { watermarkOpacity: Number(e.target.value) / 100 }
                          : { watermarkImageOpacity: Number(e.target.value) / 100 }
                      )
                    }
                    disabled={!settings.enableWatermark}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            {/* 图标设置 */}
            {activeTab === 'icon' && isIconFormat && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  图标尺寸 (ICO/ICNS)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[16, 32, 48, 64, 128, 256, 512, 1024].map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        const newSizes = settings.iconSizes.includes(size)
                          ? settings.iconSizes.filter((s) => s !== size)
                          : [...settings.iconSizes, size];
                        updateSettings({ iconSizes: newSizes });
                      }}
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        settings.iconSizes.includes(size)
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  选择要包含在图标文件中的尺寸。ICO 格式用于 Windows，ICNS 格式用于 macOS。
                </p>
              </div>
            )}

            {activeTab === 'icon' && !isIconFormat && (
              <div className="text-center text-gray-500 py-8">
                <p>图标设置仅在选择 ICO 或 ICNS 格式时可用</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
