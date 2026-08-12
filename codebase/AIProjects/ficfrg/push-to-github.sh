#!/usr/bin/env bash
# Push FixFr to https://github.com/shubhransh-gupta/FixFR
# Run from ficfrg directory after sync-to-local.sh

set -euo pipefail

if [ ! -f package.json ]; then
  echo "Run this from the ficfrg project directory."
  exit 1
fi

git init
git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/shubhransh-gupta/FixFR.git
git add -A
git commit -m "Initial FixFr — static civic complaint routing for India" || true
git push -u origin main --force

echo ""
echo "✓ Pushed to https://github.com/shubhransh-gupta/FixFR"
echo ""
echo "Enable GitHub Pages:"
echo "  Settings → Pages → Build and deployment → GitHub Actions"
echo "  Site: https://shubhransh-gupta.github.io/FixFR/"
