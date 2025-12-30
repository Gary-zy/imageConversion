import { useState } from 'react';
import { useImageStore } from '../stores/imageStore';
import { FORMAT_OPTIONS, FORMAT_CATEGORIES, ImageFormat } from '../types';

export default function FormatSelector() {
  const targetFormat = useImageStore((state) => state.targetFormat);
  const setTargetFormat = useImageStore((state) => state.setTargetFormat);
  const [expandedCategory, setExpandedCategory] = useState<string>('common');

  const categoryIcons: Record<string, string> = {
    common: '🖼️',
    modern: '⚡',
    document: '📄',
    icon: '🔖',
    legacy: '📦',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-700">选择目标格式</h2>
        <span className="text-xs text-gray-400">
          当前: {FORMAT_OPTIONS.find(f => f.value === targetFormat)?.label}
        </span>
      </div>

      {/* 分类标签 */}
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(FORMAT_CATEGORIES).map(([key, category]) => {
          const formatInfo = FORMAT_OPTIONS.find(f => f.category === key);
          if (!formatInfo) return null;
          const isActive = expandedCategory === key;

              return (
                <button
                  key={key}
                  onClick={() => setExpandedCategory(key)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                    flex items-center gap-1.5
                    ${isActive
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <span>{categoryIcons[key]}</span>
                  <span>{category.name}</span>
                </button>
              );
        })}
      </div>

      {/* 格式按钮网格 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {FORMAT_OPTIONS.filter(f => f.category === expandedCategory).map((format) => {
            const isSelected = targetFormat === format.value;

            return (
              <button
                key={format.value}
                onClick={() => setTargetFormat(format.value as ImageFormat)}
                className={`
                  relative px-3 py-3 rounded-lg font-medium transition-all duration-200
                  flex flex-col items-center gap-1
                  ${isSelected
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 transform scale-105'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                  }
                `}
              >
                <span className="text-lg">{format.label}</span>
                <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                  {format.extension.toUpperCase()}
                </span>

                {/* 选中指示器 */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow">
                    <svg className="w-3 h-3 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 格式说明 */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          {(() => {
            const currentFormat = FORMAT_OPTIONS.find(f => f.value === targetFormat);
            if (!currentFormat) return null;

            return (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{currentFormat.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{currentFormat.description}</p>
                  {currentFormat.supportsQuality && (
                    <p className="text-xs text-primary-600 mt-1">支持质量调整</p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
