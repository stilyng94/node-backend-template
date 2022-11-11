#!/bin/sh

set -e


echo "migrate for deployment"
yarn migrate:deploy
echo "migration success"

echo "generate database"
yarn generate
echo "generate success"

echo "Seeding database"
yarn seed
echo "seeding success"

echo "start app"
exec "$@"