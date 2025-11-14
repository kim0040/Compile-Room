#!/usr/bin/env bash
# 로컬 개발 환경에서 HTTPS를 테스트하기 위해 mkcert 인증서를 자동 생성한다.
set -euo pipefail

CERT_DIR="certs"
CERT_FILE="$CERT_DIR/localhost.pem"
KEY_FILE="$CERT_DIR/localhost-key.pem"

if ! command -v mkcert >/dev/null 2>&1; then
  cat <<'EOF'
[setup-local-https] mkcert가 설치되어 있지 않습니다.
Homebrew:  brew install mkcert && brew install nss
Ubuntu  :  sudo apt install libnss3-tools && brew install mkcert
자세한 설치 방법은 docs/mkcert-master/README.md 를 참고하세요.
EOF
  exit 1
fi

mkdir -p "$CERT_DIR"

if [[ ! -f "$CERT_FILE" || ! -f "$KEY_FILE" ]]; then
  echo "[setup-local-https] 로컬 CA 설치 여부를 확인합니다..."
  mkcert -install >/dev/null 2>&1 || true
  echo "[setup-local-https] localhost 인증서를 생성합니다..."
  mkcert -cert-file "$CERT_FILE" -key-file "$KEY_FILE" localhost 127.0.0.1 ::1
fi

echo "[setup-local-https] 인증서 준비 완료: $CERT_FILE"
