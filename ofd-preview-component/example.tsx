import React from 'react';
import { OfdProcessor } from './src/index';

/**
 * OFD 预览组件使用示例
 */
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">OFD 文档预览组件</h1>
          <p className="text-gray-600 mt-2">
            纯前端实现，支持 OFD 文件预览和转换为 PNG/JPEG/WebP/PDF
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <OfdProcessor
          onFileLoaded={(file, converter) => {
            console.log('✅ 文件加载成功');
            console.log('文件名:', file.name);
            console.log('文件大小:', (file.size / 1024 / 1024).toFixed(2), 'MB');
            console.log('总页数:', converter.getPageCount());
          }}
          onConvertComplete={(blob, format) => {
            console.log('✅ 转换完成');
            console.log('输出格式:', format);
            if (Array.isArray(blob)) {
              console.log('输出文件数:', blob.length);
            } else {
              console.log('输出大小:', (blob.size / 1024 / 1024).toFixed(2), 'MB');
            }
          }}
          onError={(error) => {
            console.error('❌ 发生错误:', error);
          }}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            所有文件处理均在浏览器本地完成，不会上传到任何服务器
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
