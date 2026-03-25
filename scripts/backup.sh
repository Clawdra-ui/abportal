#!/bin/bash
# ============================================
# Andreas Boutsikas Portal - Backup Script
# Self-hosted production backup
# ============================================

set -e

BACKUP_ROOT="/data/backups/abportal"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_ROOT}/${TIMESTAMP}"

echo "============================================"
echo "Andreas Boutsikas Portal - Backup"
echo "============================================"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Backup database
echo "[1/3] Backing up database..."
docker compose exec -T db pg_dump -U postgres andreas_portal > "${BACKUP_DIR}/database.sql"
echo "      Database saved: ${BACKUP_DIR}/database.sql"

# Backup uploaded files
echo "[2/3] Backing up uploaded files..."
if [ -d "/data/andreas-portal" ]; then
    tar -czf "${BACKUP_DIR}/uploads.tar.gz" -C /data andreas-portal/images andreas-portal/zips 2>/dev/null || true
    echo "      Uploads saved: ${BACKUP_DIR}/uploads.tar.gz"
else
    echo "      No uploads directory found, skipping..."
fi

# Backup environment file
echo "[3/3] Backing up configuration..."
cp .env "${BACKUP_DIR}/.env" 2>/dev/null || true
cp docker-compose.yml "${BACKUP_DIR}/docker-compose.yml" 2>/dev/null || true

# Create backup info
cat > "${BACKUP_DIR}/backup_info.txt" << EOF
Backup Date: $(date)
Hostname: $(hostname)
App Version: $(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
EOF

# Clean old backups (keep last 7)
echo ""
echo "Cleaning old backups (keeping last 7)..."
cd "${BACKUP_ROOT}" && ls -1d */ 2>/dev/null | head -n -7 | xargs rm -rf 2>/dev/null || true

echo ""
echo "============================================"
echo "Backup Complete!"
echo "============================================"
echo "Backup location: ${BACKUP_DIR}"
echo "Size: $(du -sh "${BACKUP_DIR}" | cut -f1)"
echo ""

# List recent backups
echo "Recent backups:"
ls -1d "${BACKUP_ROOT}"/*/ 2>/dev/null | tail -5
