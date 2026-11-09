<#
.SYNOPSIS
    Deploy KSM Temple Management Backend + PostgreSQL + pgAdmin to AWS EC2 using a Private PEM Key from Windows PowerShell.
.PARAMETER PemKeyPath
    Path to your AWS private key (e.g., C:\keys\ksm-mumbai.pem)
.PARAMETER Ec2Host
    Public IPv4 or DNS of your AWS EC2 instance in ap-south-1
.PARAMETER SshUser
    SSH user (default: ec2-user)
.EXAMPLE
    .\scripts\deploy-ec2.ps1 -PemKeyPath "C:\Users\mvaru\.ssh\ksm-key.pem" -Ec2Host "13.233.50.120"
#>

param (
    [Parameter(Mandatory = $true)]
    [string]$PemKeyPath,

    [Parameter(Mandatory = $true)]
    [string]$Ec2Host,

    [Parameter(Mandatory = $false)]
    [string]$SshUser = "ec2-user"
)

Write-Host "🏛️ ==================================================================" -ForegroundColor Yellow
Write-Host "   Deploying KSM Stack to AWS EC2 (ap-south-1 Mumbai)" -ForegroundColor Cyan
Write-Host "   Host: $Ec2Host ($SshUser)" -ForegroundColor White
Write-Host "   AWS Account ID: 2777-3120-8394" -ForegroundColor White
Write-Host "   PEM Key: $PemKeyPath" -ForegroundColor White
Write-Host "=====================================================================" -ForegroundColor Yellow

if (-not (Test-Path $PemKeyPath)) {
    Write-Error "Private PEM key not found at: $PemKeyPath"
    exit 1
}

$RemotePath = "/home/$SshUser/ksm-app"
$SshCmd = "ssh -i `"$PemKeyPath`" -o StrictHostKeyChecking=no $SshUser@$Ec2Host"
$ScpCmd = "scp -i `"$PemKeyPath`" -o StrictHostKeyChecking=no"

Write-Host "`n📁 Creating remote application directories..." -ForegroundColor Yellow
Invoke-Expression "$SshCmd `"mkdir -p $RemotePath/backend/db $RemotePath/pgadmin $RemotePath/backend/scripts $RemotePath/backend/data`""

Write-Host "`n📤 Uploading configurations..." -ForegroundColor Yellow
Invoke-Expression "$ScpCmd docker-compose.yml ${SshUser}@${Ec2Host}:${RemotePath}/docker-compose.yml"
Invoke-Expression "$ScpCmd backend/db/schema.sql ${SshUser}@${Ec2Host}:${RemotePath}/backend/db/schema.sql"
Invoke-Expression "$ScpCmd pgadmin/servers.json ${SshUser}@${Ec2Host}:${RemotePath}/pgadmin/servers.json"

Write-Host "`n📦 Uploading backend application files..." -ForegroundColor Yellow
Invoke-Expression "$ScpCmd -r backend/package*.json backend/server.js backend/config backend/services backend/scripts backend/Dockerfile ${SshUser}@${Ec2Host}:${RemotePath}/backend/"

Write-Host "`n🐳 Starting Docker containers on AWS EC2..." -ForegroundColor Cyan
Invoke-Expression "$SshCmd `"cd $RemotePath && docker compose up -d --build && sleep 8`""

Write-Host "`n🔄 Running PostgreSQL Database Migration..." -ForegroundColor Green
Invoke-Expression "$SshCmd `"cd $RemotePath && docker exec ksm-backend node scripts/migrate-to-pg.js`""

Write-Host "`n🏥 Verifying Health Endpoint..." -ForegroundColor Cyan
Invoke-Expression "$SshCmd `"curl -s http://localhost:5000/api/health`""

Write-Host "`n=====================================================================" -ForegroundColor Green
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "📍 Backend API URL: http://${Ec2Host}:5000/api" -ForegroundColor Cyan
Write-Host "📍 pgAdmin Web GUI: http://${Ec2Host}:5050" -ForegroundColor Cyan
Write-Host "   pgAdmin Username: admin@kolarshankaramutt.org" -ForegroundColor White
Write-Host "   pgAdmin Password: KolarMutt2024!" -ForegroundColor White
Write-Host "=====================================================================" -ForegroundColor Green
