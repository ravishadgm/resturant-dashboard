/* global importScripts, firebase */
// Kept as a classic worker so it can run directly from /public without a build step.
importScripts('https://www.gstatic.com/firebasejs/13.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/13.1.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyA7zK7OLI2uffMm5lzo_OJigOf2Q72fCdo',
  authDomain: 'test-resturant-2a84f.firebaseapp.com',
  projectId: 'test-resturant-2a84f',
  storageBucket: 'test-resturant-2a84f.firebasestorage.app',
  messagingSenderId: '720028744194',
  appId: '1:720028744194:web:dc787dcc7cd62c9740451b',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const notification = payload.notification || {};
  self.registration.showNotification(notification.title || payload.data?.title || 'New notification', {
    body: notification.body || payload.data?.body || '',
    icon: '/favicon.ico',
    data: payload.data,
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windows => {
    const existing = windows[0];
    return existing ? existing.focus() : clients.openWindow('/');
  }));
});
