// ═══════════════════════════════════════════════════════════
// SERVICE WORKER — ProspectX PWA
//
// Estratégia simples e segura: cache-first para arquivos estáticos
// (JS, CSS, imagens, ícones), network-first para tudo o resto (HTML
// de navegação, chamadas de API). Isso garante que o app abra rápido
// e funcione minimamente offline, sem arriscar mostrar dados antigos
// de busca/perfil — esses sempre vêm da rede quando disponível.
// ═══════════════════════════════════════════════════════════

const CACHE_NOME = "prospectx-v1"
const ARQUIVOS_ESSENCIAIS = [
  "/",
  "/manifest.json",
  "/logo-projectx.png",
  "/logo-x-apenas.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NOME).then((cache) => cache.addAll(ARQUIVOS_ESSENCIAIS))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes
          .filter((nome) => nome !== CACHE_NOME)
          .map((nome) => caches.delete(nome))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  const ehChamadaExterna =
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("mercadopago.com") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("openstreetmap.org") ||
    url.hostname.includes("overpass-api.de")

  if (ehChamadaExterna || request.method !== "GET") {
    return
  }

  const ehArquivoEstatico = /\.(js|css|png|jpg|jpeg|svg|webp|woff2?)$/.test(url.pathname)

  if (ehArquivoEstatico) {
    event.respondWith(
      caches.match(request).then((respostaCache) => {
        if (respostaCache) return respostaCache
        return fetch(request).then((respostaRede) => {
          const clone = respostaRede.clone()
          caches.open(CACHE_NOME).then((cache) => cache.put(request, clone))
          return respostaRede
        })
      })
    )
    return
  }

  event.respondWith(
    fetch(request)
      .then((respostaRede) => {
        const clone = respostaRede.clone()
        caches.open(CACHE_NOME).then((cache) => cache.put(request, clone))
        return respostaRede
      })
      .catch(() => caches.match(request).then((r) => r || caches.match("/")))
  )
})
