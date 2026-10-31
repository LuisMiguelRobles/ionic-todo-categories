import type { FirebaseOptions } from 'firebase/app';

/**
 * Configuración web de Firebase. No es secreta: identifica el proyecto y la protegen las
 * restricciones de la API key en Google Cloud (ver README).
 */
export const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyAHfcg6Ynk7BrjrxKy_S4bHWv3nEf6ZA6s',
  authDomain: 'ionic-todo-categories.firebaseapp.com',
  projectId: 'ionic-todo-categories',
  storageBucket: 'ionic-todo-categories.firebasestorage.app',
  messagingSenderId: '906144065570',
  appId: '1:906144065570:web:e3f6eb8ac191111bb4c27b',
};
