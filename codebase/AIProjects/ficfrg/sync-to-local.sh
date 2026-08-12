#!/usr/bin/env bash
# Sync FixFr from cloud export branch to ./codebase/AIProjects/ficfrg
# Run from anywhere: bash sync-to-local.sh

set -euo pipefail

TARGET_DIR="${1:-./codebase/AIProjects/ficfrg}"
REPO="https://github.com/shubhransh-gupta/sketchd.git"
BRANCH="export/fixfr"
TMP_DIR=$(mktemp -d)

echo "→ Cloning export branch..."
git clone --branch "$BRANCH" --depth 1 "$REPO" "$TMP_DIR"

echo "→ Copying to $TARGET_DIR..."
mkdir -p "$(dirname "$TARGET_DIR")"
rm -rf "$TARGET_DIR"
cp -a "$TMP_DIR/codebase/AIProjects/ficfrg" "$TARGET_DIR"
rm -rf "$TMP_DIR"

echo "→ Installing dependencies..."
cd "$TARGET_DIR"
npm install

echo ""
echo "✓ FixFr synced to $TARGET_DIR"
echo ""
echo "Next steps:"
echo "  cd $TARGET_DIR"
echo "  npm run dev          # start dev server"
echo ""
echo "To push to FixFR GitHub repo:"
echo "  git init"
echo "  git remote add origin https://github.com/shubhransh-gupta/FixFR.git"
echo "  git add -A && git commit -m 'Initial FixFr'"
echo "  git push -u origin main"
