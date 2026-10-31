// Métricas de interacción con la lista ya cargada. Uso: pega este archivo en la consola de DevTools.
// Mide cuánto tarda en reflejarse en pantalla: marcar una tarea, filtrar por una categoría,
// volver a "Todas" y desplazar la lista (fps y frames de más de 50 ms).
const frame = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function timed(action, done) {
  const start = performance.now();
  action();
  for (let i = 0; i < 300 && !done(); i++) await frame();
  await frame();
  return Math.round(performance.now() - start);
}
const firstCheckbox = () => document.querySelector('app-task-item ion-checkbox');
const chip = (label) => [...document.querySelectorAll('.filter-chip')].find((b) => b.textContent.trim().startsWith(label));
const pressed = (label) => chip(label).getAttribute('aria-pressed') === 'true';
const [, secondCategory] = [...document.querySelectorAll('.filter-chip')].map((b) => b.textContent.trim().split(/\s/)[0]);

const wasChecked = firstCheckbox().checked;
const toggleMs = await timed(() => firstCheckbox().click(), () => firstCheckbox().checked !== wasChecked);
await pause(800);
const filterMs = await timed(() => chip(secondCategory).click(), () => pressed(secondCategory));
await pause(800);
const showAllMs = await timed(() => chip('Todas').click(), () => pressed('Todas'));
await pause(800);

// El scroll lo hace .scroll-host en la versión optimizada y ion-content en la anterior.
const scroller = document.querySelector('.scroll-host') ?? (await document.querySelector('ion-content').getScrollElement());
const frames = [];
let last = performance.now();
for (let i = 0; i < 120; i++) {
  scroller.scrollTop += 250;
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const now = performance.now();
  frames.push(now - last);
  last = now;
}
const result = {
  toggleMs,
  filterMs,
  showAllMs,
  scrollFps: Math.round(frames.length / (frames.reduce((a, b) => a + b, 0) / 1000)),
  slowFrames: frames.filter((ms) => ms > 50).length,
  worstFrameMs: Math.round(Math.max(...frames)),
};
console.table(result);
result;
