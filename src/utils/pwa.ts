/**
 * PWA 配置
 * 包含 Service Worker 和 Manifest 配置
 */

// PWA 配置选项
export interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'any';
  scope: string;
  startUrl: string;
  icons: PWAIcon[];
  categories: string[];
  screenshots?: PWAScreenshot[];
  shortcuts?: PWAShortcut[];
}

export interface PWAIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'any' | 'maskable' | 'monochrome';
}

export interface PWAScreenshot {
  src: string;
  sizes: string;
  type: string;
  formFactor?: 'wide' | 'narrow';
  label?: string;
}

export interface PWAShortcut {
  name: string;
  shortName?: string;
  description?: string;
  url: string;
  icons?: PWAIcon[];
}

// 默认配置
export const defaultPWAConfig: PWAConfig = {
  name: '图片转换器',
  shortName: '图片转换',
  description: '免费在线图片格式转换工具，纯前端处理，保护隐私',
  themeColor: '#3B82F6',
  backgroundColor: '#FFFFFF',
  display: 'standalone',
  orientation: 'any',
  scope: '/',
  startUrl: '/',
  categories: ['utilities', 'productivity'],
  icons: [
    {
      src: '/icons/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/icons/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
    },
    {
      src: '/icons/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
};

// Service Worker 缓存策略
export const CACHE_STRATEGIES = {
  // 静态资源：缓存优先
  static: {
    cacheName: 'static-resources',
    strategies: [
      { pattern: /\.(js|css|woff2?|ttf|eot)$/, strategy: 'cacheFirst' },
      { pattern: /\.(png|jpg|jpeg|svg|ico)$/, strategy: 'cacheFirst' },
    ],
  },

  // API 请求：网络优先
  api: {
    cacheName: 'api-cache',
    strategies: [
      { pattern: /\/api\//, strategy: 'networkFirst' },
    ],
  },

  // 字体：缓存优先
  fonts: {
    cacheName: 'fonts-cache',
    strategies: [
      { pattern: /fonts\.googleapis\.com/, strategy: 'cacheFirst' },
      { pattern: /fonts\.gstatic\.com/, strategy: 'cacheFirst' },
    ],
  },
} as const;

// 生成 manifest.json
export function generateManifest(config: PWAConfig = defaultPWAConfig): object {
  return {
    name: config.name,
    short_name: config.shortName,
    description: config.description,
    start_url: config.startUrl,
    scope: config.scope,
    display: config.display,
    orientation: config.orientation,
    theme_color: config.themeColor,
    background_color: config.backgroundColor,
    categories: config.categories,
    icons: config.icons,
    screenshots: config.screenshots,
    shortcuts: config.shortcuts?.map((shortcut) => ({
      name: shortcut.name,
      short_name: shortcut.shortName,
      description: shortcut.description,
      url: shortcut.url,
      icons: shortcut.icons,
    })),
  };
}

// 生成 Service Worker
export function generateServiceWorker(): string {
  const CACHE_NAME = 'image-converter-v1';
  const STATIC_CACHE = 'static-v1';
  const DYNAMIC_CACHE = 'dynamic-v1';

  return `
// Service Worker for Image Converter PWA
const CACHE_NAME = '${CACHE_NAME}';
const STATIC_CACHE = '${STATIC_CACHE}';
const DYNAMIC_CACHE = '${DYNAMIC_CACHE}';

// 安装事件
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
      ]);
    })
  );
  
  self.skipWaiting();
});

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  
  self.clients.claim();
});

// 抓取事件
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过跨域请求
  if (url.origin !== location.origin) {
    // 对于第三方资源，使用网络优先策略
    event.respondWith(networkFirst(request));
    return;
  }

  // 静态资源使用缓存优先
  if (isStaticResource(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // API 请求使用网络优先
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 默认使用 staleWhileRevalidate
  event.respondWith(staleWhileRevalidate(request));
});

// 缓存优先策略
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// 网络优先策略
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then((c) => c.put(request, response.clone()));
    }
    return response;
  });

  return cached || fetchPromise;
}

// 判断是否为静态资源
function isStaticResource(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some((ext) => url.pathname.endsWith(ext));
}

// 消息处理
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

// 后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-images') {
    event.waitUntil(syncImages());
  }
});

// 同步图片（用于离线时的后台任务）
async function syncImages() {
  // 从 IndexedDB 获取待同步的任务
  // 实际实现需要结合 IndexedDB
  console.log('[SW] Syncing images...');
}

// 推送通知
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 点击通知
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
  `;
}

// 检测 PWA 支持
export function isPWASupported(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

// 获取 PWA 安装状态
export function getPWAInstallStatus(): {
  isInstallable: boolean;
  isInstalled: boolean;
  installPrompt?: any;
} {
  if (typeof window === 'undefined') {
    return { isInstallable: false, isInstalled: false };
  }

  const nav = navigator as any;

  return {
    isInstallable: !!nav.canInstallPWA,
    isInstalled: window.matchMedia('(display-mode: standalone)').matches,
    installPrompt: nav.installPrompt,
  };
}

// 请求安装 PWA
export async function requestPWAInstall(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const nav = navigator as any;

  if (!nav.installPrompt) return false;

  return new Promise((resolve) => {
    const handleResult = (result: any) => {
      nav.removeEventListener('installprompt', handleResult);
      resolve(result.outcome === 'accepted');
    };

    nav.addEventListener('installprompt', handleResult);
    nav.prompt();
  });
}

// 离线状态检测
export function isOnline(): boolean {
  if (typeof navigator !== 'undefined') {
    return navigator.onLine;
  }
  return true;
}

// 监听网络状态变化
export function addNetworkListener(callback: (online: boolean) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

