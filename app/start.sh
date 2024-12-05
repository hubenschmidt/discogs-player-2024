#!/bin/bash

echo ""
echo "Starting... 🌐︎"

if [ "$NODE_ENV" = "production" ]; then
    # Run production command
    node server.js
else
    # Run development command
    npm run dev
fi
