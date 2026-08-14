#!/bin/bash
set -e

# Target directory for persistent storage on Jarvislabs
TARGET_DIR="/home/app"

echo "📍 Preparing persistent directory at $TARGET_DIR..."
mkdir -p "$TARGET_DIR/models"

# Copy backend application files into persistent storage
cp server.py requirements.txt "$TARGET_DIR/"
cd "$TARGET_DIR"

if [ ! -d ".venv" ]; then
    echo "📦 Creating Python virtual environment (.venv)..."
    python3 -m venv .venv
fi

echo "⚡ Activating .venv and installing requirements..."
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Backend setup complete!"
echo "To launch the server, run:"
echo "  cd /home/app && source .venv/bin/activate && python server.py"
