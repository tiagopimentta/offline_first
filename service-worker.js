const CACHE_NAME = 'pwa-cache-v1';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/offline.html', // Página de fallback
  '/assets/css/styles.css',
  '/assets/js/app.js',
  '/assets/images/icon-512x512.png',
  '/assets/fonts/custom-font.woff2' // Exemplo de recurso adicional
];

// Evento de instalação: armazena os arquivos no cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Armazenando recursos no cache...');
      return cache.addAll(OFFLINE_URLS);
    })
  );
});

// Evento de ativação: limpa caches antigos, se necessário
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento de busca: responde com o cache ou faz uma requisição de rede
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() => {
          // Exibe a página de fallback para navegação
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        })
      );
    })
  );
});

// Evento de sincronização em segundo plano (Background Sync)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    console.log('Sincronizando dados...');
    const response = await fetch('/api/sync', { method: 'POST' });
    const result = await response.json();
    console.log('Dados sincronizados com sucesso:', result);
  } catch (error) {
    console.error('Erro ao sincronizar dados:', error);
  }
}

// Evento de sincronização periódica (Periodic Sync)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'periodic-sync') {
    event.waitUntil(updateAppData());
  }
});

async function updateAppData() {
  try {
    console.log('Atualizando dados do app...');
    const response = await fetch('/api/get-latest-data');
    const data = await response.json();
    console.log('Dados atualizados:', data);
  } catch (error) {
    console.error('Erro ao atualizar dados:', error);
  }
}

// Evento de notificações push
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Nova Notificação';
  const options = {
    body: data.body || 'Você tem uma nova mensagem.',
    icon: '/assets/images/icon-512x512.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Clique em notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/notification-page') // Substituir pela URL correta
  );
});
