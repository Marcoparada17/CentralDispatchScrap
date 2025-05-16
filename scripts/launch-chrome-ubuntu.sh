#!/bin/bash

echo "🚀 Launching Chrome with remote debugging on port 9222..."

# Close any existing Chrome instances using port 9222
pkill -f "remote-debugging-port=9222" || true

# Create profile directory if it doesn't exist
PROFILE_DIR="$HOME/.config/google-chrome/DebugProfile"
mkdir -p "$PROFILE_DIR"
echo "📁 Using Chrome profile at $PROFILE_DIR"

# Launch Chrome with the debugging port and redirect output to /dev/null
nohup google-chrome \
  --headless \
  --no-sandbox \
  --disable-gpu \
  --disable-dev-shm-usage \
  --remote-debugging-port=9222 \
  --remote-allow-origins=* \
  --user-data-dir="$PROFILE_DIR" \
  --no-first-run \
  --no-default-browser-check > /dev/null 2>&1 &

# Get the process ID
CHROME_PID=$!

echo "✅ Chrome launched with debugging port 9222 (PID: $CHROME_PID)"
echo "⚠️  Chrome is running in the background"
echo "⚠️  To stop Chrome, run: pkill -f 'remote-debugging-port=9222'"