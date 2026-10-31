// Genera tareas de prueba directamente en IndexedDB (la base que usa @ionic/storage).
// Uso: abre la app, pega este archivo en la consola de DevTools y recarga la página.
// En Android también se puede ejecutar dentro del WebView con android/measure.sh.
const N = 10000;
const db = await new Promise((resolve, reject) => {
  const request = indexedDB.open('todo_db');
  request.onsuccess = () => resolve(request.result);
  request.onerror = reject;
});
const STORE = '_ionickv';
const get = (key) =>
  new Promise((resolve) => {
    const request = db.transaction(STORE).objectStore(STORE).get(key);
    request.onsuccess = () => resolve(request.result);
  });
// Reparte las tareas entre las categorías existentes y "sin categoría"; el 30 % queda completado.
const categories = (await get('categories')) ?? [];
const categoryIds = [...categories.map((category) => category.id), null];
const verbs = ['Revisar', 'Comprar', 'Llamar', 'Preparar', 'Enviar', 'Organizar', 'Leer', 'Pagar'];
const now = Date.now();
const tasks = Array.from({ length: N }, (_, i) => ({
  id: `seed-${i}`,
  title: `${verbs[i % verbs.length]} pendiente número ${i + 1}`,
  completed: i % 10 < 3,
  categoryId: categoryIds[i % categoryIds.length],
  createdAt: now - i * 1000,
}));
await new Promise((resolve, reject) => {
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).put(tasks, 'tasks');
  tx.oncomplete = resolve;
  tx.onerror = reject;
});
console.info(`${N} tareas generadas. Recarga la página.`);
