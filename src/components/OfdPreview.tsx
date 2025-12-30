import React, { useRef, useEffect, useState, useCallback } from 'react';
import { OfdConverter } from '../utils/ofdConverter';

interface OfdPreviewProps {
  converter: OfdConverter | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  scale: number;
  onScaleChange: (scale: number) => void;
}

export const OfdPreview: React.FC<OfdPreviewProps> = ({
  converter,
  currentPage,
  onPageChange,
  scale,
  onScaleChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pageCount = converter?.getPageCount() || 0;
  const pageSize = converter ? converter.getPageSize(currentPage) : { width: 210, height: 297 };

  // 渲染文档
  const renderDocument = useCallback(async () => {
    if (!converter || !containerRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      await converter.renderToContainer(containerRef.current, currentPage, scale);
    } catch (err) {
      console.error('OFD 渲染失败:', err);
      setError(err instanceof Error ? err.message : '渲染失败');
    } finally {
      setIsLoading(false);
    }
  }, [converter, currentPage, scale]);

  // 当 converter 或页面变化时重新渲染
  useEffect(() => {
    if (converter) {
      renderDocument();
    }
  }, [converter, renderDocument]);

  // 监听页面变化事件
  useEffect(() => {
    const handlePageChange = () => {
      if (converter) {
        const newPage = converter.getCurrentPageIndex();
        if (newPage !== currentPage) {
          onPageChange(newPage);
        }
      }
    };

    window.addEventListener('ofdPageChange', handlePageChange);
    return () => {
      window.removeEventListener('ofdPageChange', handlePageChange);
    };
  }, [converter, currentPage, onPageChange]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (currentPage < pageCount - 1) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, pageCount, onPageChange]);

  const handleScaleChange = useCallback((newScale: number) => {
    onScaleChange(Math.max(0.5, Math.min(3, newScale)));
  }, [onScaleChange]);

  const scaleOptions = [0.5, 0.75, 1, 1.5, 2, 3];

  return (
    <div className="flex flex-col bg-gray-50 rounded-lg p-4">
      {/* 顶部信息栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          文档尺寸: {pageSize.width}mm x {pageSize.height}mm
        </div>
        {isLoading && (
          <div className="text-sm text-blue-500 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            渲染中...
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* 预览区域 */}
      <div
        ref={scrollContainerRef}
        className="flex-1 bg-gray-200 border-2 border-gray-300 rounded-lg overflow-auto"
        style={{
          minHeight: '500px',
          maxHeight: '70vh'
        }}
      >
        <div
          ref={containerRef}
          className="ofd-content-container"
          style={{
            minWidth: '800px',
            minHeight: '600px',
            width: '100%',
          }}
        >
          {!converter && (
            <div className="flex items-center justify-center h-96 text-gray-400">
              请先上传 OFD 文件
            </div>
          )}
        </div>
      </div>

      {/* 底部控制栏 */}
      <div className="flex items-center justify-between mt-4 gap-4">
        {/* 页面导航 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 0 || isLoading}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium transition-colors"
          >
            上一页
          </button>
          <span className="text-sm font-medium px-3">
            {currentPage + 1} / {pageCount || 0}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= pageCount - 1 || isLoading}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium transition-colors"
          >
            下一页
          </button>
        </div>

        {/* 缩放控制 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">缩放:</span>
          <select
            value={scale}
            onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
            disabled={isLoading}
            className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {scaleOptions.map((s) => (
              <option key={s} value={s}>
                {Math.round(s * 100)}%
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
