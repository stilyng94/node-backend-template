#!/usr/bin/env bash
set -e

echo "migrate for deployment"
pnpm migrate:deploy
echo "migration success"

echo "Seeding database"
pnpm seed
echo "seeding success"

echo "start app"
node ./dist/index.js
exec "$@"
