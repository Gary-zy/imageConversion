import React, { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { OfdConverter } from '../utils/OfdConverter';

interface OfdPreviewProps {
  converter: OfdConverter | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  scale: number;
  onScaleChange: (scale: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const OfdPreview: React.FC<OfdPreviewProps> = ({
  converter,
  currentPage,
  onPageChange,
  scale,
  onScaleChange,
  className = '',
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [hasRendered, setHasRendered] = useState(false);

  const pageCount = converter?.getPageCount() || 0;
  const pageSize = converter ? converter.getPageSize(currentPage) : { width: 210, height: 297 };

  // 当 converter 变化时重置渲染状态
  useEffect(() => {
    if (converter) {
      setHasRendered(false);
    }
  }, [converter]);

  // 首次渲染文档 - 使用 useLayoutEffect 确保 DOM 操作同步完成
  useLayoutEffect(() => {
    if (converter && containerRef.current && !hasRendered) {
      // 等待容器获得有效尺寸后再渲染
      const checkAndRender = async () => {
        const container = containerRef.current;
        if (!container) {
          console.log('OfdPreview: container ref is null');
          return;
        }

        console.log('OfdPreview: checking container size', {
          clientWidth: container.clientWidth,
          clientHeight: container.clientHeight,
          offsetWidth: container.offsetWidth,
          offsetHeight: container.offsetHeight
        });

        // 如果容器尺寸为 0，延迟重试
        if (container.clientWidth === 0) {
          console.log('OfdPreview: container width is 0, retrying in 100ms...');
          setTimeout(checkAndRender, 100);
          return;
        }

        console.log('OfdPreview: starting render, container width:', container.clientWidth);
        setIsRendering(true);
        try {
          await converter.renderToContainer(container, undefined, scale);
          console.log('OfdPreview: render complete, container childCount:', container.childElementCount);
          setHasRendered(true);
        } catch (error) {
          console.error('渲染失败:', error);
        } finally {
          setIsRendering(false);
        }
      };

      // 使用 requestAnimationFrame 确保 DOM 已经完成布局
      requestAnimationFrame(() => {
        checkAndRender();
      });
    }
  }, [converter, hasRendered, scale]);


  // 页面切换时滚动到对应页面
  useEffect(() => {
    if (converter && hasRendered && currentPage >= 0) {
      converter.scrollToPage(currentPage);
    }
  }, [converter, currentPage, hasRendered]);

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
    <div className={`ofd-preview-container flex flex-col bg-gray-50 rounded-lg p-4 ${className}`} style={style}>
      {/* 顶部信息栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          文档尺寸: {pageSize.width}mm x {pageSize.height}mm
        </div>
        {isRendering && (
          <div className="text-sm text-blue-500">渲染中...</div>
        )}
      </div>

      {/* 预览区域 */}
      <div
        ref={scrollContainerRef}
        className="ofd-preview-scroll-container flex-1 bg-gray-200 border-2 border-gray-300 rounded-lg overflow-auto"
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
      <div className="ofd-preview-controls flex items-center justify-between mt-4 gap-4">
        {/* 页面导航 */}
        <div className="ofd-page-navigation flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 0}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium transition-colors"
          >
            上一页
          </button>
          <span className="text-sm font-medium px-3">
            {currentPage + 1} / {pageCount || 0}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= pageCount - 1}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium transition-colors"
          >
            下一页
          </button>
        </div>

        {/* 缩放控制 */}
        <div className="ofd-scale-control flex items-center gap-2">
          <span className="text-sm text-gray-600">缩放:</span>
          <select
            value={scale}
            onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
            className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
