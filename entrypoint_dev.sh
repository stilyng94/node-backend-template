#!/usr/bin/env bash
set -e

echo "create tables"
pnpm prototype
echo "tables created"

echo "Seeding database"
pnpm seed:dev
echo "seeding success"

echo "start app"
exec "$@"
