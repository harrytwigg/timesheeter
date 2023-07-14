#!/bin/sh

cd ../../

if [ -f .env.local ]; then
  cp .env.local packages/web/.env
elif [ -f .env.staging ]; then
  cp .env.staging packages/web/.env
elif [ -f .env.production ]; then
  cp .env.production packages/web/.env
fi

cd packages/web

pnpm prisma migrate dev --skip-seed --skip-generate

rm .env
