import { useState } from 'react';
import { useImageStore } from './stores/imageStore';
import { downloadAsZip } from './utils/download';
import FileUpload from './components/FileUpload';
import FormatSelector from './components/FormatSelector';
import FileList from './components/FileList';
import AdvancedSettings from './components/AdvancedSettings';
import ImagePreview from './components/ImagePreview';
import { OfdProcessor } from './components/OfdProcessor';

type TabType = 'image' | 'ofd';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('image');

  const files = useImageStore((state) => state.files);
  const targetFormat = useImageStore((state) => state.targetFormat);
  const settings = useImageStore((state) => state.settings);
  const isConverting = useImageStore((state) => state.isConverting);
  const convertAll = useImageStore((state) => state.convertAll);
  const clearFiles = useImageStore((state) => state.clearFiles);

  const completedFiles = files.filter((f) => f.status === 'completed');
  const hasFilesToConvert = files.some(
    (f) => f.status === 'pending' || f.status === 'failed'
  );

  const handleConvertAll = async () => {
    await convertAll();
  };

  const handleDownloadAll = async () => {
    if (completedFiles.length > 0) {
      await downloadAsZip(
        completedFiles,
        targetFormat,
        settings.fileNamePrefix,
        settings.fileNameSuffix
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">图片转换器</h1>
                <p className="text-xs text-gray-500 hidden sm:block">纯前端处理，保护隐私</p>
              </div>
            </div>

            {/* Tab 切换 */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('image')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'image'
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">图片格式</span>
              </button>
              <button
                onClick={() => setActiveTab('ofd')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'ofd'
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">OFD 文档</span>
              </button>
            </div>

            {/* 功能特性标签 */}
            <div className="hidden md:flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                免费使用
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                无需上传
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'image' ? (
          <div className="space-y-6">
            {/* 顶部统计信息 */}
            {files.length > 0 && (
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg shadow-primary-500/30">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{files.length}</p>
                      <p className="text-white/80 text-sm">已添加文件</p>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="text-center">
                      <p className="text-lg font-semibold">{completedFiles.length}</p>
                      <p className="text-white/70 text-xs">已完成</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">{files.length - completedFiles.length}</p>
                      <p className="text-white/70 text-xs">待转换</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">
                        {completedFiles.length > 0
                          ? Math.round(completedFiles.reduce((acc, f) => acc + (f.size - (f.convertedSize || 0)), 0) / completedFiles.reduce((acc, f) => acc + f.size, 0) * 100)
                          : 0}%
                      </p>
                      <p className="text-white/70 text-xs">平均压缩</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* 左侧：上传和格式选择 */}
              <div className="xl:col-span-2 space-y-6">
                {/* 上传区域 */}
                <section>
                  <FileUpload />
                </section>

                {/* 格式选择 */}
                <section>
                  <FormatSelector />
                </section>

                {/* 文件列表 */}
                <section>
                  <FileList />
                </section>

                {/* 预览区域 */}
                {files.length === 1 && (
                  <section>
                    <h2 className="text-sm font-medium text-gray-700 mb-3">预览对比</h2>
                    <ImagePreview file={files[0]} />
                  </section>
                )}
              </div>

              {/* 右侧：设置和操作 */}
              <div className="xl:col-span-1 space-y-6">
                {/* 高级设置 */}
                <section>
                  <AdvancedSettings />
                </section>

                {/* 操作按钮 */}
                {files.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3">
                    <h3 className="font-semibold text-gray-800 mb-4">操作</h3>

                    <button
                      onClick={handleConvertAll}
                      disabled={!hasFilesToConvert || isConverting}
                      className={`
                        w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200
                        flex items-center justify-center gap-2
                        ${
                          hasFilesToConvert && !isConverting
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      {isConverting ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>转换中...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>开始转换</span>
                        </>
                      )}
                    </button>

                    {completedFiles.length > 1 && (
                      <button
                        onClick={handleDownloadAll}
                        className="w-full py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>批量下载 (ZIP)</span>
                      </button>
                    )}

                    <button
                      onClick={clearFiles}
                      className="w-full py-3 px-4 rounded-xl font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>清空列表</span>
                    </button>
                  </div>
                )}

                {/* 使用提示 */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-4">
                  <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    使用提示
                  </h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      支持拖拽、点击或 Ctrl+V 粘贴上传
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      可批量处理多张图片
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      所有转换在浏览器本地完成
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <OfdProcessor />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 bg-white/50 backdrop-blur-sm mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              隐私保护
            </span>
            <span className="text-gray-300">|</span>
            <span>所有图片处理均在浏览器本地完成</span>
            <span className="text-gray-300">|</span>
            <span>免费开源</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
