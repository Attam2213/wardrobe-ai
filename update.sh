#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/wardrobe-ai}"
BRANCH="${BRANCH:-main}"
APP_USER="${APP_USER:-wardrobeai}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root"
  exit 1
fi

REPO_DIR="${APP_DIR}/repo"
BACKEND_DIR="${REPO_DIR}/backend"
ENV_FILE="${BACKEND_DIR}/.env"

if [[ ! -d "${REPO_DIR}/.git" ]]; then
  echo "Repo not found at ${REPO_DIR}. Run install.sh first."
  exit 1
fi

sudo -u "${APP_USER}" -H bash -lc "cd '${REPO_DIR}' && git fetch origin && git checkout '${BRANCH}' && git reset --hard 'origin/${BRANCH}'"
sudo -u "${APP_USER}" -H bash -lc "cd '${BACKEND_DIR}' && npm ci"
sudo -u "${APP_USER}" -H bash -lc "cd '${BACKEND_DIR}' && npm run prisma:generate"
sudo -u "${APP_USER}" -H bash -lc "cd '${BACKEND_DIR}' && npx prisma db push"
sudo -u "${APP_USER}" -H bash -lc "cd '${BACKEND_DIR}' && npm run build"

systemctl restart wardrobe-ai.service
systemctl is-active --quiet wardrobe-ai.service

echo "OK"
