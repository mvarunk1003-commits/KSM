#!/usr/bin/env bash
# =============================================================================
# Kolar Sringeri SriShankara Mutt — Direct Deployment to AWS EC2 via Private PEM Key
# Usage: ./scripts/deploy-ec2.sh <PATH_TO_PEM_KEY> <EC2_PUBLIC_IP_OR_DNS> [SSH_USER]
# Example: ./scripts/deploy-ec2.sh ~/.ssh/ksm-mumbai.pem 13.233.45.67 ec2-user
# =============================================================================

set -e

PEM_KEY="$1"
EC2_HOST="$2"
SSH_USER="${3:-ec2-user}"
DEPLOY_DIR="/home/${SSH_USER}/ksm-app"

if [ -z "$PEM_KEY" ] || [ -z "$EC2_HOST" ]; then
    echo "❌ Usage: $0 <PATH_TO_PEM_KEY> <EC2_PUBLIC_IP_OR_DNS> [SSH_USER]"
    echo "Example: $0 ./keys/ksm-ec2.pem 13.233.100.50 ec2-user"
    exit 1
fi

if [ ! -f "$PEM_KEY" ]; then
    echo "❌ Error: Private PEM key file not found at: $PEM_KEY"
    exit 1
fi

# Ensure proper permissions on the PEM key (chmod 400)
chmod 400 "$PEM_KEY"

echo "🏛️ =================================================================="
echo "   Deploying KSM Stack to AWS EC2 (ap-south-1 Mumbai)"
echo "   Host: $EC2_HOST ($SSH_USER)"
echo "   PEM Key: $PEM_KEY"
echo "====================================================================="

SSH_CMD="ssh -i $PEM_KEY -o StrictHostKeyChecking=no"
SCP_CMD="scp -i $PEM_KEY -o StrictHostKeyChecking=no"

echo "📁 Creating remote application directories..."
$SSH_CMD "${SSH_USER}@${EC2_HOST}" "mkdir -p ${DEPLOY_DIR}/backend/db ${DEPLOY_DIR}/pgadmin ${DEPLOY_DIR}/backend/scripts ${DEPLOY_DIR}/backend/data"

echo "📤 Copying Docker and Database configurations..."
$SCP_CMD docker-compose.yml "${SSH_USER}@${EC2_HOST}:${DEPLOY_DIR}/docker-compose.yml"
$SCP_CMD backend/db/schema.sql "${SSH_USER}@${EC2_HOST}:${DEPLOY_DIR}/backend/db/schema.sql"
$SCP_CMD pgadmin/servers.json "${SSH_USER}@${EC2_HOST}:${DEPLOY_DIR}/pgadmin/servers.json"

echo "📦 Syncing backend code..."
$SCP_CMD -r backend/package*.json backend/server.js backend/config backend/services backend/scripts backend/Dockerfile "${SSH_USER}@${EC2_HOST}:${DEPLOY_DIR}/backend/"

echo "🚀 Starting Docker containers (Backend + PostgreSQL 16 + pgAdmin 4)..."
$SSH_CMD "${SSH_USER}@${EC2_HOST}" "
    cd ${DEPLOY_DIR}
    docker compose up -d --build
    echo '⏳ Waiting for PostgreSQL to be ready...'
    sleep 8
"

echo "🔄 Running PostgreSQL Data Migration..."
$SSH_CMD "${SSH_USER}@${EC2_HOST}" "
    cd ${DEPLOY_DIR}
    docker exec ksm-backend node scripts/migrate-to-pg.js || echo 'Migration ran or already initialized.'
"

echo "🏥 Checking Service Health..."
$SSH_CMD "${SSH_USER}@${EC2_HOST}" "
    curl -s http://localhost:5000/api/health || true
"

echo ""
echo "====================================================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "📍 Backend API URL: http://${EC2_HOST}:5000/api"
echo "📍 pgAdmin Web GUI: http://${EC2_HOST}:5050"
echo "   (pgAdmin credentials configured via environment / .env)"
echo "====================================================================="
