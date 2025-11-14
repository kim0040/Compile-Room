#!/usr/bin/env bash
# Ubuntu 서버에서 `npm ci → prisma migrate → npm run build → pm2`를
# 순차적으로 실행해 배포를 자동화한다.
set -euo pipefail

APP_NAME="compileroom"

if ! command -v pm2 >/dev/null 2>&1; then
  echo "[deploy] pm2가 설치되어 있지 않습니다. \`npm install -g pm2\` 실행 후 다시 시도하세요."
  exit 1
fi

echo "[deploy] 의존성 설치 (npm ci)"
npm ci

echo "[deploy] Prisma Client 생성"
npx prisma generate

echo "[deploy] Prisma 마이그레이션 적용"
npx prisma migrate deploy

echo "[deploy] Next.js 빌드"
npm run build

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  echo "[deploy] 기존 PM2 프로세스 재시작"
  pm2 restart "$APP_NAME" --update-env
else
  echo "[deploy] PM2 새 프로세스 시작"
  pm2 start npm --name "$APP_NAME" -- run start
fi

pm2 save
echo "[deploy] 완료!"
