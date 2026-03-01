#!/usr/bin/env bash
# File: scripts/db-backup.sh

set -e

# Load environment variables from apps/api/.env
source apps/api/.env

echo "Attempting to backup database from SUPERBASE/PostgreSQL..."
mkdir -p backups

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="backups/tbms_backup_${TIMESTAMP}.sql"

# Using parsed connection string from DIRECT_URL or DATABASE_URL
# It's better to use DIRECT_URL for pg_dump if it's Supabase
PG_URL=${DIRECT_URL:-$DATABASE_URL}

if [ -z "$PG_URL" ]; then
  echo "Error: Database URL not found."
  exit 1
fi

pg_dump "$PG_URL" -c -O -f "$FILENAME"

echo "Backup successfully saved to $FILENAME"
