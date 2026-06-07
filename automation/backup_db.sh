#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/postgres"
S3_BUCKET="s3://verse-backups"
DATE=$(date +%F_%H-%M-%S)
BACKUP_FILE="${BACKUP_DIR}/verse_db_${DATE}.sql.gz"

# Créer le répertoire de backup s'il n'existe pas
mkdir -p "$BACKUP_DIR"

# Charger les variables du fichier .env
ENV_FILE="../backend/.env"
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

echo "[$(date)] Début de la sauvegarde de la base de données ${DB_DATABASE}..."

# Effectuer le dump PostgreSQL compressé
PGPASSWORD="${DB_PASSWORD}" pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USERNAME}" -d "${DB_DATABASE}" | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "[$(date)] Sauvegarde locale créée avec succès : ${BACKUP_FILE}"
    
    # Envoyer vers le bucket cloud chiffré AWS S3
    aws s3 cp "$BACKUP_FILE" "${S3_BUCKET}/"
    
    if [ $? -eq 0 ]; then
        echo "[$(date)] Transfert vers S3 réussi."
    else
        echo "[$(date)] ERREUR: Échec du transfert vers S3."
    fi
    
    # Nettoyer les backups locaux vieux de plus de 7 jours
    find "$BACKUP_DIR" -type f -name "verse_db_*.sql.gz" -mtime +7 -delete
    echo "[$(date)] Nettoyage des sauvegardes locales de plus de 7 jours effectué."
else
    echo "[$(date)] ERREUR: Échec du dump de la base de données."
fi

echo "[$(date)] Fin de la procédure de sauvegarde."
