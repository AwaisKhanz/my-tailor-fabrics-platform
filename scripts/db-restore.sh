#!/usr/bin/env bash
# File: scripts/db-restore.sh

set -e

if [ -z "$1" ]; then
  echo "Usage: npm run db:restore <path_to_sql_file>"
  exit 1
fi

FILE=$1
source apps/api/.env

echo "Attempting to restore database from $FILE..."

PG_URL=${DIRECT_URL:-$DATABASE_URL}

if [ -z "$PG_URL" ]; then
  echo "Error: Database URL not found."
  exit 1
fi

echo "WARNING: This will overwrite existing data. Press Ctrl+C to abort or wait 5 seconds..."
sleep 5

psql "$PG_URL" -f "$FILE"

echo "Restore operation from $FILE complete."
