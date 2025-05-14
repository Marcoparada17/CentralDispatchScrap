#!/bin/bash

echo "🚀 Launching Chrome with remote debugging on port 9222..."

# Close any existing Chrome instances using port 9222
pkill -f "remote-debugging-port=9222" || true

# Create a temporary profile directory
TEMP_DIR="/tmp/chrome-debug-profile"
mkdir -p "$TEMP_DIR"
echo "📁 Using temporary Chrome profile at $TEMP_DIR"

# Launch Chrome with the debugging port and a user data directory
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir="$TEMP_DIR" \
  --no-first-run \
  --no-default-browser-check \
  --disable-gpu \
  --disable-dev-shm-usage &

echo "✅ Chrome launched with debugging port 9222"
echo "⚠️  Keep this terminal window open while using the auth script"
echo "⚠️  Press Ctrl+C to close Chrome when you're done"

# Wait for user to terminate with Ctrl+C
wait 