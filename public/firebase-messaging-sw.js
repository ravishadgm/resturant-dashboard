/* Firebase Messaging worker for the restaurant web app. Config is passed in
   the registration URL from the same public Vite environment as the app. */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const params = new URL(self.location.href).searchParams;
const config = Object.fromEntries([
  'apiKey', 'authDomain', 'projectId', 'storageBucket',
  'messagingSenderId', 'appId', 'measurementId',
].map(key => [key, params.get(key)]).filter(([, value]) => value));

firebase.initializeApp(config);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || payload.data?.title || 'Restaurant notification';
  const options = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: new URL('favicon.svg', self.registration.scope).href,
    data: { url: payload.data?.url || self.registration.scope },
  };
  return self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || self.registration.scope, self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = windows.find(client => client.url.startsWith(self.registration.scope));
    if (existing) {
      await existing.focus();
      if ('navigate' in existing) await existing.navigate(target);
      return;
    }
    await clients.openWindow(target);
  })());
});
