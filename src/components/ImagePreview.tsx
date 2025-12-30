import { ImageFile, formatFileSize } from '../types';

interface ImagePreviewProps {
  file: ImageFile;
}

export default function ImagePreview({ file }: ImagePreviewProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* 原图预览 */}
        <div className="flex-1 p-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">原图</h4>
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={file.previewUrl}
              alt={file.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <p className="truncate" title={file.name}>
              {file.name}
            </p>
            <p>
              {file.width} x {file.height} | {formatFileSize(file.size)}
            </p>
          </div>
        </div>

        {/* 箭头 */}
        <div className="hidden md:flex items-center justify-center px-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </div>

        {/* 转换后预览 */}
        <div className="flex-1 p-4 border-t md:border-t-0 md:border-l border-gray-200">
          <h4 className="text-sm font-medium text-gray-500 mb-2">转换后</h4>
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            {file.convertedUrl ? (
              <img
                src={file.convertedUrl}
                alt="转换后"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-gray-400 text-sm">
                {file.status === 'converting' ? '转换中...' : '等待转换'}
              </div>
            )}
          </div>
          {file.convertedSize && (
            <div className="mt-2 text-sm text-gray-600">
              <p>转换后大小: {formatFileSize(file.convertedSize)}</p>
              {file.size !== file.convertedSize && (
                <p
                  className={
                    file.convertedSize < file.size
                      ? 'text-green-600'
                      : 'text-orange-600'
                  }
                >
                  {file.convertedSize < file.size
                    ? `减少 ${formatFileSize(file.size - file.convertedSize)} (${Math.round(
                        (1 - file.convertedSize / file.size) * 100
                      )}%)`
                    : `增加 ${formatFileSize(file.convertedSize - file.size)} (${Math.round(
                        (file.convertedSize / file.size - 1) * 100
                      )}%)`}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
