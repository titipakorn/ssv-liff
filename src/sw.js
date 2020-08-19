importScripts("/workbox-sw.js")

workbox.setConfig({
  debug: false
})

const PREFIX = "liff"

workbox.core.setCacheNameDetails({
  prefix: PREFIX,
  suffix: "",
  precache: "install-time",
  runtime: "run-time",
  googleAnalytics: "ga"
})

const oldCache = ["v0.5.0"]
for (let k in oldCache) {
  caches.delete(`${PREFIX}-install-time-${oldCache[k]}`).then(function() {})
}

workbox.precaching.precacheAndRoute([])
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST)

workbox.core.skipWaiting()
workbox.core.clientsClaim()

// workbox.routing.registerRoute("/", workbox.strategies.networkFirst())
/*workbox.routing.registerRoute(
  new RegExp("\\.(png|gif|jpg|jpeg)$"),
  new workbox.strategies.CacheFirst()
)*/
