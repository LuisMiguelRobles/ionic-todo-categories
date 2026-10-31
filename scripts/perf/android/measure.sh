#!/bin/bash
# Arranque en frío en un emulador/dispositivo Android y evaluación de un script en el WebView
# mediante el protocolo de DevTools (requiere un APK de debug, que habilita la depuración del WebView).
#
# Uso:   scripts/perf/android/measure.sh <paquete> <script.js>
# Ej.:   scripts/perf/android/measure.sh com.luisrobles.todocategories scripts/perf/seed-tasks.js
#        scripts/perf/android/measure.sh com.luisrobles.todocategories scripts/perf/measure-load.js
#
# measure-load.js devuelve los tiempos desde el inicio de la navegación del WebView; además este
# script agrega `launchToRenderedMs`: desde que se lanza la app hasta la marca `tasks-rendered`.
set -euo pipefail
DIR=$(cd "$(dirname "$0")" && pwd)
PKG=$1
SCRIPT=$2
COMPONENT=$(adb shell cmd package resolve-activity --brief "$PKG" | tail -1 | tr -d '\r')

adb shell am force-stop "$PKG"
sleep 1
LAUNCHED_AT=$(adb shell date +%s%3N | tr -d '\r')
adb shell am start -n "$COMPONENT" >/dev/null

# Espera a que el WebView abra su socket de depuración y lo expone en el puerto 9333.
for _ in $(seq 1 100); do
  PID=$(adb shell pidof "$PKG" | tr -d '\r' || true)
  if [ -n "$PID" ] && adb shell cat /proc/net/unix | grep -q "webview_devtools_remote_$PID"; then break; fi
  sleep 0.2
done
adb forward --remove tcp:9333 >/dev/null 2>&1 || true
adb forward tcp:9333 "localabstract:webview_devtools_remote_$PID" >/dev/null

EXPRESSION=$(mktemp)
{
  cat "$SCRIPT"
  echo "; const __mark = performance.getEntriesByName('tasks-rendered')[0];"
  echo "return typeof result === 'undefined' ? null : { ...result, launchToRenderedMs: __mark ? Math.round(performance.timeOrigin + __mark.startTime - $LAUNCHED_AT) : null };"
} > "$EXPRESSION"
node "$DIR/cdp.mjs" 9333 "$EXPRESSION"
rm "$EXPRESSION"
adb shell am force-stop "$PKG"
