/**
 * 主入口文件
 * 配置初始化
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// 初始化应用
async function initApp() {
  try {
    // 启动应用
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('找不到根元素');
    }

    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );

    console.log('应用启动成功');
  } catch (error) {
    console.error('应用启动失败:', error);
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: system-ui, sans-serif;">
        <h1 style="color: #ef4444;">应用启动失败</h1>
        <p>${error instanceof Error ? error.message : '未知错误'}</p>
      </div>
    `;
  }
}

// 启动应用
initApp();
