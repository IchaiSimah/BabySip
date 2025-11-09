#!/bin/bash

# BabySip Database Backup Script
# Usage: ./backup-db.sh
# This script creates a timestamped backup of the MySQL database

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set backup directory
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/bbt_app_backup_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "📦 Creating database backup..."

# Create backup using docker-compose exec
docker-compose exec -T mysql mysqldump \
    -u ${DB_USER:-bbt_user} \
    -p${DB_PASSWORD} \
    ${DB_NAME:-bbt_app} > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE
BACKUP_FILE="${BACKUP_FILE}.gz"

echo "✅ Backup created: $BACKUP_FILE"

# Keep only last 7 days of backups
echo "🧹 Cleaning old backups (keeping last 7 days)..."
find $BACKUP_DIR -name "bbt_app_backup_*.sql.gz" -mtime +7 -delete

echo "✅ Backup complete!"

