<#
.SYNOPSIS
    Open a secure SSH tunnel to AWS PostgreSQL using your Private PEM Key on Windows.
.PARAMETER PemKeyPath
    Path to your AWS private key (e.g. C:\Users\mvaru\.ssh\ksm-key.pem)
.PARAMETER Ec2Host
    Public IPv4 or DNS of your AWS EC2 instance in ap-south-1
.PARAMETER SshUser
    SSH User (default: ec2-user)
#>

param (
    [Parameter(Mandatory = $true)]
    [string]$PemKeyPath,

    [Parameter(Mandatory = $true)]
    [string]$Ec2Host,

    [Parameter(Mandatory = $false)]
    [string]$SshUser = "ec2-user"
)

Write-Host "🔐 Opening secure SSH Tunnel to AWS PostgreSQL in ap-south-1 (Mumbai)..." -ForegroundColor Yellow
Write-Host "🔌 Local port 5432 -> Remote EC2 127.0.0.1:5432" -ForegroundColor Cyan
Write-Host "👉 You can now connect your local pgAdmin / DBeaver to: localhost:5432" -ForegroundColor Green
Write-Host "   Database: ksm_temple_db"
Write-Host "   Username: postgres"
Write-Host "   Password: ksm_secure_password_2024"
Write-Host "`nPress Ctrl+C to close the tunnel." -ForegroundColor DarkGray

ssh -i "$PemKeyPath" -N -L 5432:127.0.0.1:5432 "$SshUser@$Ec2Host"
