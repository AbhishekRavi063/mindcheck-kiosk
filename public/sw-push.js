// Push notification handler — imported into the Workbox-generated sw.js via importScripts.
// Handles background FCM messages when the app is closed or not focused.

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let title = 'MindCheck';
  let body = '';

  try {
    const payload = event.data.json();
    title = payload.notification?.title ?? title;
    body = payload.notification?.body ?? body;
  } catch {
    body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'mindcheck-reminder',
      renotify: true,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
