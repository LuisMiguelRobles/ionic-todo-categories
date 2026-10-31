// Métricas de carga. Uso: recarga la app y pega este archivo en la consola de DevTools.
// - rendered: ms desde el inicio de la navegación hasta la marca `tasks-rendered`
//   (la lista pintada con los datos guardados; ver src/app/core/performance).
// - longTaskMs: tiempo total de tareas largas (> 50 ms) que bloquearon el hilo principal.
// - domNodes: elementos del DOM, incluidos los de shadow DOM de los componentes de Ionic.
// - heapMB: memoria JS en uso (solo Chromium; conviene medir en una pestaña nueva).
const longTasks = [];
new PerformanceObserver((list) => longTasks.push(...list.getEntries())).observe({ type: 'longtask', buffered: true });
for (let i = 0; i < 600 && !performance.getEntriesByName('tasks-rendered').length; i++) {
  await new Promise((resolve) => setTimeout(resolve, 50));
}
await new Promise((resolve) => setTimeout(resolve, 3000));
const countDeep = (root) => {
  let count = 0;
  const walk = (el) => {
    count++;
    if (el.shadowRoot) el.shadowRoot.querySelectorAll('*').forEach(walk);
  };
  root.querySelectorAll('*').forEach(walk);
  return count;
};
const mark = performance.getEntriesByName('tasks-rendered')[0];
const result = {
  rendered: Math.round(mark.startTime),
  tasks: mark.detail?.tasks,
  fcp: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime),
  longTaskMs: Math.round(longTasks.reduce((sum, entry) => sum + entry.duration, 0)),
  renderedItems: document.querySelectorAll('app-task-item').length,
  domNodes: countDeep(document),
  heapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null,
};
console.table(result);
result;
