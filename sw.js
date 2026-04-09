
const CACHE_NAME = "timer-app-v1";

// Список файлов, которые нужно закэшировать для работы оффлайн
const ASSETS = [
    "/",
    "/index.html",
    "/style.css",
    "/main.js",
    "/icon.png"
];

// Установка Service Worker и кэширование файлов
self.addEventListener("install", e => {
    console.log("Service Worker установлен");
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Обработка запросов: сначала проверяем кэш, потом сеть
self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});

// Активация нового SW и удаление старого кэша
self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});