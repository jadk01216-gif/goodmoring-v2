const CACHE_NAME = 'pwa-photo-cache';
const SHARED_IMAGE_KEY = '/shared-image.jpg';

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

  // 檢查是否為對 index.html 的 POST 分享請求
  if (event.request.method === 'POST' && (url.pathname.endsWith('index.html') || url.pathname === '/')) {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const file = formData.get('shared_image');

          if (file && file.type.startsWith('image/')) {
            const cache = await caches.open(CACHE_NAME);
            // 將圖片檔案封裝成 Response 存入 Cache
            await cache.put(SHARED_IMAGE_KEY, new Response(file));
            
            // 303 Redirect 到編輯頁面並帶上參數通知前端讀取
            return Response.redirect('./index.html?hasImage=true', 303);
          }
        } catch (err) {
          console.error('處理 PWA 分享圖片快取失敗:', err);
        }
        // 若失敗則直接重導向回首頁
        return Response.redirect('./index.html', 303);
      })()
    );
    return;
  }

  // 其他常規請求採網路優先策略，確保離線與即時更新平衡
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});