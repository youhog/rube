// sw.js 更新

// 1. 更新版本號，讓瀏覽器知道要重新抓檔案
const CACHE_NAME = 'drink-tracker-v3'; // 從 v2 改成 v3

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    // 🆕 新增這兩個檔案
    './dark.css',
    './theme.js',
    './favicon.svg'
    // xlsx 不需要快取，因為我們已經改成動態載入了
];

// ... (以下的 Service Worker 程式碼不用動) ...
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('firebase') || event.request.url.includes('googleapis')) {
        return;
    }
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});