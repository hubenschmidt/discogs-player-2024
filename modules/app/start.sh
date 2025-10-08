#!/bin/bash

# Run table migrations
echo "Running migrations..."

if [ "$NODE_ENV" = "production" ]; then
    # Use the compiled JavaScript file in the `dist` folder
    npx sequelize-cli db:migrate --config dist/conf/db.js --migrations-path dist/migrations
else
    # Use ts-node to run migrations with the TypeScript config
    npx sequelize-cli db:migrate --config src/conf/db.js --migrations-path src/migrations
fi

echo ""
echo "Starting... 🌐︎🌐︎🌐︎🌐︎🌐︎🌐︎🌐︎🌐︎🌐︎🌐︎🌐︎🌐︎🌐︎🌐︎"

if [ "$NODE_ENV" = "production" ]; then
    # Run production command
    node server.js
else
    # Run development command
    npm run dev
fi
