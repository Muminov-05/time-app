self.addEventListener("install", e => {
    console.log("Service Worker установлен");
    self.skipWaiting();
});

self.addEventListener("fetch", e => {
    // пока пусто
});