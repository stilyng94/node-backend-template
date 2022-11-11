#!/bin/sh

set -e

echo "create tables"
yarn prototype
echo "tables created"

echo "Seeding database"
yarn seed:dev
echo "seeding success"

echo "start app"
exec "$@"
