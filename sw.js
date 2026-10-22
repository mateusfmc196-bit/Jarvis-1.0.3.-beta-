// Service worker do Jarvis: guarda a tela no aparelho pra abrir mesmo sem internet.
// As chamadas para o cerebro (outros enderecos) nunca passam por aqui.
const VERSAO = "jarvis-v1";
const ARQUIVOS = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];

self.addEventListener("install", (ev) => {
  ev.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches.keys().then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (ev) => {
  const req = ev.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  // rede primeiro (pega atualizacoes); se estiver offline, usa a copia guardada
  ev.respondWith(
    fetch(req).then((resp) => {
      if (resp && resp.ok) { const copia = resp.clone(); caches.open(VERSAO).then((c) => c.put(req, copia)); }
      return resp;
    }).catch(() => caches.match(req).then((r) => r || caches.match("index.html")))
  );
});
