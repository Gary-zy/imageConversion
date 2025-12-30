import React, { useState, useRef } from 'react';
import { OfdConverter, validateOfdFile, packBlobsToZip } from '../utils/ofdConverter';
import { OfdPreview } from './OfdPreview';
import { OfdTargetFormat, OfdPageRange } from '../types';
import { saveAs } from 'file-saver';

export const OfdProcessor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [converter, setConverter] = useState<OfdConverter | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [scale, setScale] = useState(1);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 转换设置
  const [targetFormat, setTargetFormat] = useState<OfdTargetFormat>('png');
  const [imageQuality, setImageQuality] = useState(90);
  const [imageScale, setImageScale] = useState(2);
  const [imagePages, setImagePages] = useState<OfdPageRange>('all');
  const [customPages, setCustomPages] = useState('');
  const [pdfPageSize, setPdfPageSize] = useState<'A4' | 'A3' | 'original'>('A4');
  const [pdfOrientation, setPdfOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pdfCompression, setPdfCompression] = useState(true);

  const handleFileUpload = async (uploadedFile: File) => {
    const validation = validateOfdFile(uploadedFile);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setFile(uploadedFile);
    setConverting(true);
    setProgress({ current: 0, total: 4, status: '正在加载文件...' });

    try {
      const conv = new OfdConverter();
      await conv.loadOfd(uploadedFile, (current, total, status) => {
        setProgress({ current, total, status });
      });
      setConverter(conv);
      setCurrentPage(0);
    } catch (error) {
      alert(`文件加载失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setConverting(false);
      setProgress({ current: 0, total: 0, status: '' });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileUpload(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // 处理转换
  const handleConvert = async () => {
    if (!converter || !file) return;

    setConverting(true);

    try {
      if (targetFormat === 'pdf') {
        // 转 PDF
        const blob = await converter.convertToPdf(
          {
            pageSize: pdfPageSize,
            orientation: pdfOrientation,
            quality: imageQuality,
            compression: pdfCompression,
          },
          (current, total, status) => {
            setProgress({ current, total, status });
          }
        );
        saveAs(blob, `${file.name.replace('.ofd', '')}.pdf`);
      } else {
        // 转图片
        const blobs = await converter.convertToImage(
          {
            format: targetFormat,
            quality: imageQuality,
            scale: imageScale,
            pages: imagePages,
            background: '#ffffff',
            customPagesInput: imagePages === 'custom' ? customPages : undefined,
          },
          currentPage,
          (current, total, status) => {
            setProgress({ current, total, status });
          }
        );

        if (blobs.length === 1) {
          const ext = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
          saveAs(blobs[0], `${file.name.replace('.ofd', '')}.${ext}`);
        } else {
          // 打包为 ZIP
          const ext = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
          const filenames = blobs.map((_, i) => `${file.name.replace('.ofd', '')}_page_${i + 1}.${ext}`);
          const zipBlob = await packBlobsToZip(blobs, filenames);
          saveAs(zipBlob, `${file.name.replace('.ofd', '')}_images.zip`);
        }
      }
    } catch (error) {
      alert(`转换失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setConverting(false);
      setProgress({ current: 0, total: 0, status: '' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 文件上传区域 */}
      {!converter && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".ofd"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) handleFileUpload(selectedFile);
            }}
            className="hidden"
          />
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-semibold mb-2">拖拽 OFD 文件到此处</h3>
          <p className="text-gray-600 mb-4">或点击选择文件</p>
          <p className="text-sm text-gray-500">支持 .ofd 格式，最大 50MB</p>
        </div>
      )}

      {/* 加载进度 */}
      {converting && !converter && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{progress.status}</span>
            <span className="text-sm text-gray-600">
              {progress.current} / {progress.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 主内容区域 */}
      {converter && (
        <div className="flex flex-col gap-6">
          {/* 预览区域 - 上方 */}
          <div className="w-full">
            <h2 className="text-lg font-semibold mb-4">文档预览</h2>
            <OfdPreview
              converter={converter}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              scale={scale}
              onScaleChange={setScale}
            />
          </div>

          {/* 设置区域 - 下方 */}
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 文件信息 */}
              <div className="bg-white rounded-lg p-4 shadow-sm h-fit">
                <h3 className="font-semibold mb-2">文件信息</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>文件名: {file?.name}</p>
                  <p>文件大小: {(file?.size || 0) / 1024 / 1024} MB</p>
                  <p>总页数: {converter.getPageCount()}</p>
                </div>
                <button
                  onClick={() => {
                    setConverter(null);
                    setFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="mt-3 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                >
                  重新上传
                </button>
              </div>

              {/* 转换设置 */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold mb-4">转换设置</h3>

                {/* 输出格式 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">输出格式</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['png', 'jpeg', 'webp', 'pdf'] as OfdTargetFormat[]).map((format) => (
                      <button
                        key={format}
                        onClick={() => setTargetFormat(format)}
                        className={`py-2 px-4 rounded text-sm font-medium transition-colors ${
                          targetFormat === format
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 图片选项 */}
                {targetFormat !== 'pdf' && (
                  <>
                    {/* 页面范围 */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">转换页面</label>
                      <div className="flex gap-2 mb-2">
                        {(['all', 'current', 'custom'] as const).map((range) => (
                          <button
                            key={range}
                            onClick={() => setImagePages(range)}
                            className={`py-1 px-3 rounded text-sm ${
                              imagePages === range
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                          >
                            {range === 'all' ? '全部页' : range === 'current' ? '当前页' : '自定义'}
                          </button>
                        ))}
                      </div>
                      {imagePages === 'custom' && (
                        <input
                          type="text"
                          value={customPages}
                          onChange={(e) => setCustomPages(e.target.value)}
                          placeholder="例如: 1,3-5,8"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>

                    {/* 图片质量 */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        图片质量: {imageQuality}%
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={imageQuality}
                        onChange={(e) => setImageQuality(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* 分辨率 */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">分辨率</label>
                      <select
                        value={imageScale}
                        onChange={(e) => setImageScale(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>标准 (1x)</option>
                        <option value={2}>高清 (2x)</option>
                        <option value={3}>超清 (3x)</option>
                      </select>
                    </div>
                  </>
                )}

                {/* PDF 选项 */}
                {targetFormat === 'pdf' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">页面尺寸</label>
                      <select
                        value={pdfPageSize}
                        onChange={(e) => setPdfPageSize(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="A4">A4</option>
                        <option value="A3">A3</option>
                        <option value="original">原始尺寸</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">页面方向</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPdfOrientation('portrait')}
                          className={`flex-1 py-2 rounded text-sm ${
                            pdfOrientation === 'portrait'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          纵向
                        </button>
                        <button
                          onClick={() => setPdfOrientation('landscape')}
                          className={`flex-1 py-2 rounded text-sm ${
                            pdfOrientation === 'landscape'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          横向
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={pdfCompression}
                          onChange={(e) => setPdfCompression(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm font-medium">启用压缩</span>
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 转换按钮 */}
            <div className="mt-6">
              <button
                onClick={handleConvert}
                disabled={converting}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {converting ? '转换中...' : '开始转换'}
              </button>
            </div>

            {/* 转换进度 */}
            {converting && converter && (
              <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{progress.status}</span>
                  <span className="text-sm text-gray-600">
                    {progress.current} / {progress.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
