import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': '/src',
    },
  },

  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: true,

    // 构建策略优化
    rollupOptions: {
      output: {
        // 分块命名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || 'assets';
          const ext = name.split('.').pop() || '';

          if (/\.(png|jpe?g|gif|svg|ico|webp)$/i.test(name)) {
            return `images/[name]-[hash].${ext}`;
          }

          if (/\.(css)$/i.test(name)) {
            return `css/[name]-[hash].${ext}`;
          }

          return `[name]-[hash].${ext}`;
        },

        // 压缩配置
        compact: true,
      },

      // 外部依赖
      external: [],

      // 插件
      plugins: [],
    },

    // 块大小警告阈值
    chunkSizeWarningLimit: 1000,

    // CSS 代码分割
    cssCodeSplit: true,

    // 最小化
    minify: 'esbuild',

    // 启用 gzip 压缩报告
    reportCompressedSize: true,
  },

  optimizeDeps: {
    // 预构建依赖
    include: [
      'vue',
      'zustand',
      'jszip',
      'jspdf',
      'file-saver',
      'pica',
    ],

    // 排除不需要预构建的依赖
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],

    // 预构建选项
    esbuildOptions: {
      // 保持注释
      legalComments: 'none',
    },
  },

  server: {
    port: 3000,
    host: true,
    open: true,

    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },

  // 开发服务器选项
  preview: {
    port: 4173,
    host: true,
  },

  // 路径别名
  base: './',
});
