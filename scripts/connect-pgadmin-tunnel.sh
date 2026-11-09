#!/usr/bin/env bash
# =============================================================================
# Secure SSH Tunnel to AWS PostgreSQL using Private PEM Key
# Maps remote EC2 PostgreSQL (port 5432) to your local machine (port 5432)
# Usage: ./scripts/connect-pgadmin-tunnel.sh <PATH_TO_PEM_KEY> <EC2_PUBLIC_IP>
# =============================================================================

PEM_KEY="$1"
EC2_HOST="$2"
SSH_USER="${3:-ec2-user}"

if [ -z "$PEM_KEY" ] || [ -z "$EC2_HOST" ]; then
    echo "Usage: $0 <PATH_TO_PEM_KEY> <EC2_PUBLIC_IP> [SSH_USER]"
    exit 1
fi

chmod 400 "$PEM_KEY"

echo "🔐 Opening secure SSH Tunnel to AWS PostgreSQL in ap-south-1..."
echo "🔌 Local port 5432 -> Remote EC2 127.0.0.1:5432"
echo "👉 You can now connect your local pgAdmin / DBeaver to: localhost:5432"
echo "Press Ctrl+C to close the tunnel."

ssh -i "$PEM_KEY" -N -L 5432:127.0.0.1:5432 "${SSH_USER}@${EC2_HOST}"
