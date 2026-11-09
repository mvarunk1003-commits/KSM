#!/usr/bin/env bash
# =============================================================================
# Kolar Sringeri SriShankara Mutt — AWS EC2 Server Setup Script
# AWS Region: ap-south-1 (Asia Pacific - Mumbai)
# AWS Account ID: 2777-3120-8394
# Target OS: Amazon Linux 2023 / Ubuntu 22.04 LTS
# =============================================================================

set -e

echo "🏛️ =================================================================="
echo "   KSM Temple Management System — AWS EC2 Instance Provisioning"
echo "   Region: ap-south-1 (Mumbai) | Account: 2777-3120-8394"
echo "====================================================================="

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    OS="unknown"
fi

echo "🖥️ Detected Operating System: $OS"

if [ "$OS" = "amzn" ] || [ "$OS" = "fedora" ] || [ "$OS" = "rhel" ]; then
    echo "📦 Installing updates and dependencies via dnf..."
    sudo dnf update -y
    sudo dnf install -y docker git curl wget postgresql15
    
    # Install Docker Compose Plugin
    sudo mkdir -p /usr/local/lib/docker/cli-plugins
    sudo curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" -o /usr/local/lib/docker/cli-plugins/docker-compose
    sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
    
    # Start and enable Docker
    sudo systemctl enable --now docker
    sudo usermod -aG docker ec2-user
elif [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    echo "📦 Installing updates and dependencies via apt..."
    sudo apt-get update -y && sudo apt-get upgrade -y
    sudo apt-get install -y docker.io docker-compose-plugin git curl wget postgresql-client
    
    # Start and enable Docker
    sudo systemctl enable --now docker
    sudo usermod -aG docker ubuntu
fi

# Ensure AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "☁️ Installing AWS CLI v2..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip -q awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
fi

# Create application directory
APP_DIR="/home/${USER}/ksm-app"
mkdir -p "$APP_DIR/backend/db" "$APP_DIR/pgadmin" "$APP_DIR/backend/data"

echo "✅ EC2 Environment Provisioned Successfully!"
echo "📁 Application Directory: $APP_DIR"
echo "🔑 Remember to log out and log back in for Docker group permissions to take effect."
