#!/bin/sh
set -e

if [ -n "$MYSQL_PASSWORD" ]; then
  cat > /data/flows_cred.json <<EOF
{
    "de0d2809d2f8c59f": {
        "user": "${MYSQL_USER:-root}",
        "password": "${MYSQL_PASSWORD}"
    }
}
EOF
fi

if [ -f /data/package.json ]; then
  cd /data
  if [ ! -d node_modules/node-red-node-mysql ]; then
    npm ci --omit=dev 2>/dev/null || npm install --omit=dev --no-audit --no-fund
  fi
fi

cd /usr/src/node-red
exec /usr/src/node-red/entrypoint.sh "$@"
