const CACHE_NAME = 'pwa-universal-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
    console.log('Service Worker instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
    console.log('Service Worker ativando...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deletando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
    // Ignorar requisições que não são GET
    if (event.request.method !== 'GET') return;
    
    // Ignorar requisições de analytics
    if (event.request.url.includes('google-analytics')) return;
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - retorna resposta do cache
                if (response) {
                    return response;
                }
                
                // Clone da requisição porque ela é um stream
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then(response => {
                    // Checar se recebemos uma resposta válida
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone da resposta porque ela é um stream
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            // Cache da nova resposta
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                }).catch(error => {
                    // Fallback para páginas HTML
                    if (event.request.destination === 'document') {
                        return caches.match('/');
                    }
                    
                    // Fallback genérico
                    return new Response('Offline - Conteúdo não disponível', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/plain'
                        })
                    });
                });
            })
    );
});

// Mensagens do Service Worker
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
