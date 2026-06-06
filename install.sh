#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/wardrobe-ai}"
REPO_URL="${REPO_URL:-}"
BRANCH="${BRANCH:-main}"
DOMAIN="${DOMAIN:-_}"
APP_USER="${APP_USER:-wardrobeai}"
APP_PORT="${APP_PORT:-3000}"

if [[ -z "${REPO_URL}" ]]; then
  echo "REPO_URL is required (example: git@github.com:USER/REPO.git)"
  exit 1
fi

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

apt-get update -y
apt-get install -y curl ca-certificates git nginx openssl

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  useradd -m -s /bin/bash "${APP_USER}"
fi

mkdir -p "${APP_DIR}"
mkdir -p "${APP_DIR}/data"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

if [[ ! -d "${APP_DIR}/repo/.git" ]]; then
  sudo -u "${APP_USER}" -H bash -lc "mkdir -p '${APP_DIR}/repo' && git clone --branch '${BRANCH}' '${REPO_URL}' '${APP_DIR}/repo'"
else
  sudo -u "${APP_USER}" -H bash -lc "cd '${APP_DIR}/repo' && git fetch origin && git checkout '${BRANCH}' && git reset --hard 'origin/${BRANCH}'"
fi

BACKEND_DIR="${APP_DIR}/repo/backend"
if [[ ! -f "${BACKEND_DIR}/package.json" ]]; then
  echo "backend/package.json not found in repo"
  exit 1
fi

JWT_ACCESS_SECRET="$(openssl rand -hex 32)"
JWT_REFRESH_SECRET="$(openssl rand -hex 32)"
ADMIN_PASSWORD="$(openssl rand -base64 18 | tr -d '\n' | tr -d '/' | tr -d '+' | tr -d '=' | cut -c1-16)"
DATABASE_URL="file:${APP_DIR}/data/dev.db"

ENV_FILE="${BACKEND_DIR}/.env"
CREATED_ADMIN_PASSWORD=""
if [[ ! -f "${ENV_FILE}" ]]; then
  CREATED_ADMIN_PASSWORD="${ADMIN_PASSWORD}"
  cat > "${ENV_FILE}" <<EOF
NODE_ENV=production
PORT=${APP_PORT}
DATABASE_URL=${DATABASE_URL}
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
SEED_ADMIN=1
ADMIN_PASSWORD=${ADMIN_PASSWORD}
EOF
fi
chown "${APP_USER}:${APP_USER}" "${ENV_FILE}"
chmod 600 "${ENV_FILE}"

sudo -u "${APP_USER}" -H bash -lc "cd '${BACKEND_DIR}' && npm ci"
sudo -u "${APP_USER}" -H bash -lc "cd '${BACKEND_DIR}' && npm run prisma:generate"
sudo -u "${APP_USER}" -H bash -lc "cd '${BACKEND_DIR}' && npx prisma db push"
sudo -u "${APP_USER}" -H bash -lc "cd '${BACKEND_DIR}' && npm run build"

SERVICE_FILE="/etc/systemd/system/wardrobe-ai.service"
cat > "${SERVICE_FILE}" <<EOF
[Unit]
Description=Wardrobe AI API
After=network.target

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${BACKEND_DIR}
EnvironmentFile=${ENV_FILE}
ExecStart=/usr/bin/node ${BACKEND_DIR}/dist/index.js
Restart=always
RestartSec=2

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable wardrobe-ai.service
systemctl restart wardrobe-ai.service

NGINX_SITE="/etc/nginx/sites-available/wardrobe-ai"
cat > "${NGINX_SITE}" <<EOF
server {
  listen 80 default_server;
  server_name ${DOMAIN} _;

  client_max_body_size 12m;

  location / {
    proxy_pass http://127.0.0.1:${APP_PORT};
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
EOF

ln -sf "${NGINX_SITE}" /etc/nginx/sites-enabled/wardrobe-ai
rm -f /etc/nginx/sites-enabled/default || true
nginx -t
systemctl reload nginx

echo "OK"
echo "URL: http://<server-ip>/app/"
echo "Login: admin"
if [[ -n "${CREATED_ADMIN_PASSWORD}" ]]; then
  echo "Password: ${CREATED_ADMIN_PASSWORD}"
else
  echo "Password: (already set in ${ENV_FILE})"
fi
