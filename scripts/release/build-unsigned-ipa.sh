#!/bin/bash
# Genera un IPA sin firmar (Payload/Tareas.app comprimido) para dispositivos iOS.
# Requiere la plataforma iOS preparada con el build de producción, p. ej. tras `npm run ios:build`
# o `npx ionic cordova prepare ios --prod`.
#
# Uso: scripts/release/build-unsigned-ipa.sh [salida.ipa]   (por defecto: Tareas-unsigned.ipa)
set -euo pipefail
OUTPUT=$(cd "$(dirname "${1:-Tareas-unsigned.ipa}")" && pwd)/$(basename "${1:-Tareas-unsigned.ipa}")
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

# Sin cuenta de Apple Developer no hay certificado: se desactiva la firma del todo.
xcodebuild -workspace platforms/ios/App.xcworkspace -scheme App -configuration Release \
  -destination 'generic/platform=iOS' -archivePath "$WORK/Tareas.xcarchive" archive \
  CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY="" -quiet

mkdir -p "$WORK/Payload"
cp -R "$WORK/Tareas.xcarchive/Products/Applications/Tareas.app" "$WORK/Payload/"
rm -f "$OUTPUT"
(cd "$WORK" && zip -qry "$OUTPUT" Payload)
echo "IPA sin firmar: $OUTPUT"
