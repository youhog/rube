// 🆕 更新版本號：v1 -> v2
// 當瀏覽器發現版本號變了，就會重新下載所有檔案，你的新功能才會出現。
const CACHE_NAME = 'drink-tracker-v2';

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './favicon.svg',
    // 🆕 新增：把 Excel 套件也快取起來，這樣離線也能匯出！
    'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js'
];

// 安裝 Service Worker 並快取靜態檔案
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    // 🆕 強制新的 Service Worker 立刻接管頁面，不用等待下次開啟
    self.skipWaiting();
});

// 攔截網路請求：優先使用快取，沒快取才上網抓
self.addEventListener('fetch', (event) => {
    // 忽略 Firebase 或其他 API 請求 (讓它們保持即時連線)
    if (event.request.url.includes('firebase') || event.request.url.includes('googleapis')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});

// 更新版本時清除舊快取
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                // 清除舊版本的快取 (例如 v1)
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    // 🆕 讓新的快取策略立刻生效
    return self.clients.claim();
});
