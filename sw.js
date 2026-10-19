const CACHE_NAME = "cube-yusik-lab-v5";


const FILES_TO_CACHE = [
"./",
"./index.html",
"./manifest.json",
"./icon-192.png",
"./icon-512.png"
];


// 앱 설치 시 필요한 파일을 캐시에 저장
self.addEventListener("install", (event) => {
event.waitUntil(
caches.open(CACHE_NAME)
.then((cache) => cache.addAll(FILES_TO_CACHE))
.then(() => self.skipWaiting())
);
});


// 새 버전 활성화 및 이전 캐시 정리
self.addEventListener("activate", (event) => {
event.waitUntil(
caches.keys()
.then((cacheNames) =>
Promise.all(
cacheNames
.filter((name) => name.startsWith("cube-yusik-lab-") && name !== CACHE_NAME)
.map((name) => caches.delete(name))
)
)
.then(() => self.clients.claim())
);
});


// 네트워크 우선, 실패하면 캐시 사용
self.addEventListener("fetch", (event) => {
if (event.request.method !== "GET") {
return;
}


const url = new URL(event.request.url);


// 다른 사이트 요청은 가로채지 않음
if (url.origin !== self.location.origin) {
return;
}


event.respondWith(
fetch(event.request)
.then((response) => {
if (response && response.ok) {
const responseCopy = response.clone();


      caches.open(CACHE_NAME)
        .then((cache) => cache.put(event.request, responseCopy))
        .catch(() => {});
    }

    return response;
  })
  .catch(() =>
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // 오프라인에서 페이지를 열 수 있도록 메인 HTML 제공
      if (event.request.mode === "navigate") {
        return caches.match("./index.html");
      }

      return new Response("오프라인 상태입니다.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    })
  )



);
});


