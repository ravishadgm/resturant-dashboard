import { getApp, getApps, initializeApp } from 'firebase/app';
import { deleteToken, getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import {
  getInstallations,
  getId as getInstallationId,
  getToken as getInstallationAuthToken,
} from 'firebase/installations';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let foregroundUnsubscribe;

function readableMessagingError(error, installationAuthReady) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('token-subscribe-failed') || message.includes('fid-registration-failed')) {
    if (installationAuthReady) {
      return 'Firebase Installations authentication succeeded, but Google rejected the FCM registration request (401). In Chrome DevTools, open Network, select the failed fcmregistrations request, and check Request Headers for x-goog-firebase-installations-auth. Do not copy or share its value. If the header is present, the remaining issue is on the Google/Firebase project or registration service side; your API key already allows FCM Registration API.';
    }
    return 'Firebase could not create its Installation authentication credential. Check that Firebase Installations API is enabled and allowed for this web API key, save the key settings, and wait a few minutes before retrying.';
  }
  return message;
}

function configured() {
  return Object.values(firebaseConfig).every(Boolean) && Boolean(import.meta.env.VITE_FIREBASE_VAPID_KEY);
}

function messageDetails(payload) {
  return {
    title: payload.notification?.title || payload.data?.title || 'New notification',
    body: payload.notification?.body || payload.data?.body || '',
  };
}

export async function enablePushNotifications(onForegroundMessage = () => {}) {
  if (!configured()) throw new Error('Firebase Messaging is not configured. Add the VITE_FIREBASE_* values to .env.');
  if (!('Notification' in window) || !('serviceWorker' in navigator)) throw new Error('This browser does not support push notifications.');
  if (!(await isSupported())) throw new Error('Firebase Messaging is not supported by this browser.');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission was not granted. Enable it in your browser settings and try again.');

  const registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}firebase-messaging-sw.js`);
  await navigator.serviceWorker.ready;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const messaging = getMessaging(app);
  const installations = getInstallations(app);
  let installationAuthReady = false;
  let token;
  try {
    // Verify Firebase Installations can mint the credential FCM requires.
    await getInstallationId(installations);
    await getInstallationAuthToken(installations);
    installationAuthReady = true;
    token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
  } catch (error) {
    throw new Error(readableMessagingError(error, installationAuthReady));
  }

  if (!token) throw new Error('Firebase did not return a registration token.');
  foregroundUnsubscribe?.();
  foregroundUnsubscribe = onMessage(messaging, payload => {
    const details = messageDetails(payload);
    if (Notification.permission === 'granted') new Notification(details.title, { body: details.body });
    onForegroundMessage(details, payload);
  });
  return token;
}

export async function disablePushNotifications() {
  foregroundUnsubscribe?.();
  foregroundUnsubscribe = undefined;
  if (!configured() || !(await isSupported())) return;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  await deleteToken(getMessaging(app));
}

export async function listenForPushNotifications(onForegroundMessage) {
  if (!configured() || !(await isSupported())) return () => {};
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const messaging = getMessaging(app);
  foregroundUnsubscribe?.();
  const unsubscribe = onMessage(messaging, payload => {
    const details = messageDetails(payload);
    if (Notification.permission === 'granted') new Notification(details.title, { body: details.body });
    onForegroundMessage(details, payload);
  });
  foregroundUnsubscribe = unsubscribe;
  return () => {
    if (foregroundUnsubscribe === unsubscribe) foregroundUnsubscribe = undefined;
    unsubscribe();
  };
}

export function showTestNotification() {
  if (Notification.permission !== 'granted') throw new Error('Enable browser notifications first.');
  new Notification('Firebase notification test', {
    body: 'Your admin dashboard can display browser notifications.',
    tag: 'firebase-notification-test',
  });
}
