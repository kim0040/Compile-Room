#!/bin/bash
# Set up nginx reverse proxy for compileroom.space -> 127.0.0.1:3000
# Usage: sudo bash scripts/fix_nginx_compileroom.sh
set -euo pipefail

SITE_AVAIL="/etc/nginx/sites-available/compileroom"
SITE_ENABLED="/etc/nginx/sites-enabled/compileroom"

echo "Writing nginx site config to ${SITE_AVAIL}..."
cat > "${SITE_AVAIL}" <<'EOF'
server {
    listen 80;
    server_name compileroom.space www.compileroom.space;
    client_max_body_size 8m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 120s;
    }
}
EOF

echo "Linking site and disabling default..."
ln -sf "${SITE_AVAIL}" "${SITE_ENABLED}"
rm -f /etc/nginx/sites-enabled/default

echo "Testing nginx config..."
nginx -t

echo "Reloading nginx..."
systemctl reload nginx

echo "Done. HTTP now proxies to 127.0.0.1:3000. Run certbot for HTTPS if needed:"
echo "sudo certbot --nginx -d compileroom.space -d www.compileroom.space"
