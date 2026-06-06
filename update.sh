#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/wardrobe-ai}"
BRANCH="${BRANCH:-main}"
APP_USER="${APP_USER:-wardrobeai}"
DOMAIN="${DOMAIN:-_}"

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

before="$(sudo -u "${APP_USER}" -H bash -lc "cd '${REPO_DIR}' && git rev-parse --short HEAD" 2>/dev/null || true)"
sudo -u "${APP_USER}" -H bash -lc "cd '${REPO_DIR}' && git fetch origin"
remote="$(sudo -u "${APP_USER}" -H bash -lc "cd '${REPO_DIR}' && git rev-parse --short 'origin/${BRANCH}'" 2>/dev/null || true)"
sudo -u "${APP_USER}" -H bash -lc "cd '${REPO_DIR}' && git checkout '${BRANCH}' && git reset --hard 'origin/${BRANCH}'"
after="$(sudo -u "${APP_USER}" -H bash -lc "cd '${REPO_DIR}' && git rev-parse --short HEAD" 2>/dev/null || true)"

echo "Repo: ${REPO_DIR}"
echo "Branch: ${BRANCH}"
echo "Before: ${before}"
echo "Remote: ${remote}"
echo "After:  ${after}"
if [[ -n "${before}" && -n "${after}" && "${before}" != "${after}" ]]; then
  echo "Changes:"
  sudo -u "${APP_USER}" -H bash -lc "cd '${REPO_DIR}' && git log --oneline '${before}..${after}'" || true
fi

if ! command -v python3 >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y python3 python3-venv python3-pip
fi

VENV_DIR="${APP_DIR}/venv"
SEGMENT_PY="${VENV_DIR}/bin/python"
if [[ ! -x "${SEGMENT_PY}" ]]; then
  sudo -u "${APP_USER}" -H bash -lc "python3 -m venv '${VENV_DIR}'"
fi
sudo -u "${APP_USER}" -H bash -lc "'${SEGMENT_PY}' -m pip install --upgrade pip && '${SEGMENT_PY}' -m pip install --upgrade rembg pillow"
if [[ -f "${ENV_FILE}" ]]; then
  if grep -qE '^SEGMENT_PYTHON=' "${ENV_FILE}" 2>/dev/null; then
    TMP_ENV="$(mktemp)"
    awk -v v="SEGMENT_PYTHON=${SEGMENT_PY}" 'BEGIN{done=0} {if($0 ~ /^SEGMENT_PYTHON=/){print v; done=1} else {print $0}} END{if(done==0) print v}' "${ENV_FILE}" > "${TMP_ENV}"
    mv "${TMP_ENV}" "${ENV_FILE}"
  else
    echo "SEGMENT_PYTHON=${SEGMENT_PY}" >> "${ENV_FILE}"
  fi
fi

sudo -u "${APP_USER}" -H bash -lc "cd '${BACKEND_DIR}' && npm ci"
sudo -u "${APP_USER}" -H bash -lc "cd '${BACKEND_DIR}' && npm run prisma:generate"
sudo -u "${APP_USER}" -H bash -lc "cd '${BACKEND_DIR}' && npx prisma db push"
sudo -u "${APP_USER}" -H bash -lc "cd '${BACKEND_DIR}' && npm run build"

systemctl restart wardrobe-ai.service
systemctl is-active --quiet wardrobe-ai.service

APP_PORT="3000"
if [[ -f "${ENV_FILE}" ]]; then
  PORT_LINE="$(grep -E '^PORT=' "${ENV_FILE}" | head -n 1 || true)"
  if [[ -n "${PORT_LINE}" ]]; then
    APP_PORT="${PORT_LINE#PORT=}"
  fi
fi

NGINX_SITE="/etc/nginx/sites-available/wardrobe-ai"
cat > "${NGINX_SITE}" <<EOF
server {
  listen 80 default_server;
  server_name ${DOMAIN} _;

  client_max_body_size 25m;

  location = /app {
    return 302 /app/;
  }

  location ^~ /app/ {
    alias ${BACKEND_DIR}/public/;
    try_files \$uri \$uri/ /app/index.html;
    add_header Cache-Control "no-cache";
  }

  location / {
    proxy_pass http://127.0.0.1:${APP_PORT};
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_connect_timeout 30s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
  }
}
EOF

ln -sf "${NGINX_SITE}" /etc/nginx/sites-enabled/wardrobe-ai
rm -f /etc/nginx/sites-enabled/default || true
nginx -t
systemctl reload nginx

echo "OK"
