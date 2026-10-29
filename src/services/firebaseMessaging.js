import { getApps, initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];

export function getMessagingConfigError() {
  const missing = requiredConfig.filter(key => !firebaseConfig[key]);
  if (!vapidKey) missing.push('VITE_FIREBASE_VAPID_KEY');
  return missing.length ? `Firebase Messaging is not configured. Missing: ${missing.join(', ')}.` : '';
}

function getFirebaseApp() {
  return getApps()[0] || initializeApp(firebaseConfig);
}

function normalizedBasePath() {
  return import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
}

function getWorkerUrl() {
  const url = new URL(`${normalizedBasePath()}firebase-messaging-sw.js`, window.location.origin);
  Object.entries(firebaseConfig).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return url;
}

export async function registerBranchBrowser() {
  const configError = getMessagingConfigError();
  if (configError) throw new Error(configError);
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !(await isSupported())) {
    throw new Error('This browser does not support Firebase web notifications. Try a recent version of Chrome or Edge.');
  }
  if (Notification.permission === 'denied') {
    throw new Error('Notifications are blocked for this site. Allow them in the browser site settings, then try again.');
  }

  const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Allow browser notifications to connect this device.');

  const workerScope = new URL(normalizedBasePath(), window.location.origin).pathname;
  const registration = await navigator.serviceWorker.register(getWorkerUrl(), { scope: workerScope });
  const messaging = getMessaging(getFirebaseApp());
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  if (!token) throw new Error('Firebase did not return a registration token. Try refreshing the connection.');
  return token;
}

export async function listenForBranchMessages(callback) {
  if (getMessagingConfigError() || !(await isSupported())) return () => {};
  return onMessage(getMessaging(getFirebaseApp()), callback);
}
