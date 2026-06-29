const CACHE_NAME = 'pwa-photo-cache';

// 安裝事件
self.addEventListener('install', event => {
  self.skipWaiting();
});

// 啟用事件
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// 攔截請求，特別處理來自 Share Target 的 POST 請求
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1. 動態計算符合此 PWA 註冊 Scope 的路徑
  const scopePath = new URL(self.registration.scope).pathname;
  
  // 2. 判斷是否為分享請求：POST 請求且目標路徑在此 PWA 範圍內
  const isShareAction = event.request.method === 'POST' && (
    url.pathname === scopePath || 
    url.pathname === scopePath + 'index.html' || 
    url.pathname === scopePath + '/' ||
    url.pathname.endsWith('/index.html')
  );

  if (isShareAction) {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const file = formData.get('shared_image');

          if (file && file.type.startsWith('image/')) {
            const cache = await caches.open(CACHE_NAME);
            
            // 使用 Scope 絕對路徑作為快取金鑰，確保與前端網頁完全同步
            const sharedImageKey = new URL('shared-image.jpg', self.registration.scope).href;
            
            // 將圖片檔案寫入 Cache
            await cache.put(sharedImageKey, new Response(file));
            
            // 303 重導向到編輯頁面，帶上參數通知前端讀取
            const redirectUrl = new URL('index.html?hasImage=true', self.registration.scope).href;
            return Response.redirect(redirectUrl, 303);
          }
        } catch (err) {
          console.error('處理 PWA 分享圖片快取失敗:', err);
        }
        // 若失敗則導回首頁
        const fallbackUrl = new URL('index.html', self.registration.scope).href;
        return Response.redirect(fallbackUrl, 303);
      })()
    );
    return;
  }

  // 其他常規請求採網路優先策略
  event.respondWith(
    fetch(event.request).catch(() => caches.match(e.request))
  );
});