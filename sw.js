self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {
    title: '🕌 Hifz Portal Alert',
    body: 'പുതിയ ക്യാമ്പസ് അറിയിപ്പ് ലഭ്യമാണ് / New campus update available!'
  };
  event.waitUntil(
    self.registration.showNotification(data.title || '🕌 Hifz Portal', {
      body: data.body || '',
      tag: 'hifz-campus-alert',
      renotify: true,
      silent: false,
      vibrate: [200, 100, 200]
    })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SHOW_PHONE_NOTIFICATION') {
    const { title, body } = event.data;
    event.waitUntil(
      self.registration.showNotification(title || '🕌 Hifz Portal', {
        body: body || '',
        tag: 'hifz-campus-alert',
        renotify: true,
        silent: false,
        vibrate: [200, 100, 200]
      })
    );
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});
