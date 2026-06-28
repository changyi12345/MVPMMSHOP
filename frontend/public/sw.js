self.addEventListener('push', (event) => {
  let data = { title: 'MVPMMSHOP', body: '', url: '/' };
  try {
    data = { ...data, ...event.data?.json() };
  } catch {
    /* ignore */
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/branding/logo.jpg',
      badge: '/branding/logo.jpg',
      data: { url: data.url || '/' },
    }),
  );
});

function resolveAbsoluteUrl(url) {
  if (!url) return self.location.origin + '/';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const path = url.startsWith('/') ? url : '/' + url;
  return self.location.origin + path;
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = resolveAbsoluteUrl(event.notification.data?.url || '/');
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        const clientUrl = new URL(client.url);
        const targetUrl = new URL(url);
        if (clientUrl.pathname === targetUrl.pathname && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    }),
  );
});
