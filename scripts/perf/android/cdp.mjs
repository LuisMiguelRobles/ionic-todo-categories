// Uso: node cdp.mjs <puerto> <archivo-con-cuerpo-de-función-async> (ver measure.sh)
// Espera a que el WebView cargue la app (https://localhost) y evalúa la expresión (puede usar await).
// Si la página navega durante la evaluación, reintenta.
import { readFileSync } from 'node:fs';
const [port, file] = process.argv.slice(2);
const expression = `(async () => { ${readFileSync(file, 'utf8')} })()`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let attempt = 0; attempt < 40; attempt++) {
  let page;
  try {
    const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    page = targets.find((t) => t.type === 'page' && t.url.startsWith('https://localhost'));
  } catch {}
  if (!page) { await sleep(250); continue; }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
  const msg = await new Promise((r) => ws.addEventListener('message', (e) => r(JSON.parse(e.data)), { once: true }));
  ws.close();
  if (msg.error?.message?.includes('context was destroyed')) { await sleep(250); continue; }
  console.log(JSON.stringify(msg.result?.result?.value ?? msg.result?.exceptionDetails ?? msg));
  process.exit(0);
}
console.log('{"error":"timeout"}');
