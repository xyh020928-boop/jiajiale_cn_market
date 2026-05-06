// 家家乐超市 PWA Service Worker
const CACHE_NAME = "mama-mart-v1";

// 安装阶段：预缓存关键资源
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// 激活阶段：清理旧缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
});

// 离线备用页
const OFFLINE_PAGE = "/offline.html";

// 网络优先策略，离线时使用缓存
self.addEventListener("fetch", (event) => {
  // 只缓存 GET 请求
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 缓存成功的响应
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(async () => {
        // 离线时从缓存读取
        const cached = await caches.match(event.request);
        if (cached) return cached;

        // 如果是导航请求，显示离线页
        if (event.request.mode === "navigate") {
          const offline = await caches.match(OFFLINE_PAGE);
          if (offline) return offline;
        }

        return new Response("离线中", { status: 503 });
      })
  );
});
