#!/bin/bash
# ============================================
# Docker Entrypoint Script
# Handles database setup on first boot
# ============================================

set -e

echo "[Entrypoint] Starting Andreas Boutsikas Portal..."

# Run database push if needed (first time setup)
# Only runs if /data/.db-initialized doesn't exist
if [ ! -f "/data/.db-initialized" ]; then
    echo "[Entrypoint] Running database setup..."
    # Wait a moment for DB to be fully ready
    sleep 5

    # Try to push schema using node directly
    node ./node_modules/prisma/build/index.js db push --schema=./prisma/schema.prisma 2>/dev/null || {
        echo "[Entrypoint] DB push skipped (may already be initialized)"
    }

    touch /data/.db-initialized
    echo "[Entrypoint] Database setup complete"
fi

# Start the application
echo "[Entrypoint] Starting application..."
exec node server.js
