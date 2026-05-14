#!/usr/bin/env bash
# Snap the live dev server (port from .env) into ./image-B.png.
set -euo pipefail
cd "$(dirname "$0")"
source .env
curl -sf "http://localhost:$PORT/" >/dev/null \
  || { echo "no dev server on $PORT — start it with: bin/exp.sh serve m5-ai-detection-comparison-deal-desk-prototype-1"; exit 2; }
npx --yes playwright screenshot --viewport-size=1440,900 --wait-for-timeout=1500 \
  "http://localhost:$PORT/" ./image-B.png
echo "refreshed ./image-B.png"
