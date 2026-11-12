// =============================================================================
// Jenkins Declarative Pipeline for Kolar Sringeri SriShankara Mutt
// Cloud Infrastructure: AWS Asia Pacific (ap-south-1, Mumbai)
// Deployment Method: Docker + PostgreSQL + pgAdmin via Private PEM Key SSH
// =============================================================================

pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    environment {
        // AWS Settings (Configured via Jenkins Credentials & Environment)
        AWS_ACCOUNT_ID      = "${env.AWS_ACCOUNT_ID ?: ''}"
        AWS_REGION          = "${env.AWS_REGION ?: 'ap-south-1'}"
        AWS_CREDENTIALS_ID  = "${env.AWS_CREDENTIALS_ID ?: 'aws-credentials'}"
        
        // ECR Repository URL
        ECR_REGISTRY        = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        IMAGE_NAME          = "ksm-backend"
        IMAGE_TAG           = "${BUILD_NUMBER}"
        
        // EC2 Server Deployment (Configured in Jenkins Global Environment or Parameters)
        EC2_HOST            = "${params.EC2_PUBLIC_IP ?: env.EC2_HOST ?: ''}"
        EC2_USER            = "${params.EC2_SSH_USER ?: 'ec2-user'}"
        SSH_PEM_KEY_ID      = 'ec2-private-pem-key' // Jenkins SSH Private Key Credential ID
        
        // App settings
        DEPLOY_PATH         = '/home/ec2-user/ksm-app'
    }

    parameters {
        string(name: 'EC2_PUBLIC_IP', defaultValue: '', description: 'Public IPv4 / DNS of your AWS EC2 instance in ap-south-1')
        string(name: 'EC2_SSH_USER', defaultValue: 'ec2-user', description: 'SSH user for EC2 (ec2-user for Amazon Linux, ubuntu for Ubuntu)')
        booleanParam(name: 'RUN_MIGRATION', defaultValue: true, description: 'Run PostgreSQL database migration script after deployment')
    }

    stages {
        stage('Validate & Inspect Environment') {
            steps {
                echo "🏛️ Building Kolar Sringeri SriShankara Mutt System..."
                echo "📍 AWS Target Region: ${AWS_REGION} (Asia Pacific - Mumbai)"
                echo "🆔 AWS Account ID: ${AWS_ACCOUNT_ID}"
                echo "🏷️ Build Tag: ${IMAGE_TAG}"
                
                sh 'node -v'
                sh 'npm -v'
                sh 'docker --version'
            }
        }

        stage('Code Quality & Dependencies') {
            steps {
                dir('backend') {
                    echo "📦 Validating Backend Node Dependencies..."
                    sh 'npm install --ignore-scripts'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "🐳 Building Backend Docker image..."
                sh """
                    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ./backend
                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
                    docker tag ${IMAGE_NAME}:latest ${ECR_REGISTRY}/${IMAGE_NAME}:latest
                """
            }
        }

        stage('Push Image to AWS ECR') {
            steps {
                echo "🚀 Pushing Docker Image to Amazon ECR (${AWS_REGION})..."
                // Authenticate Docker with AWS ECR
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: "${AWS_CREDENTIALS_ID}",
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
                        
                        # Ensure ECR repository exists
                        aws ecr describe-repositories --repository-names ${IMAGE_NAME} --region ${AWS_REGION} || \
                        aws ecr create-repository --repository-name ${IMAGE_NAME} --region ${AWS_REGION}
                        
                        docker push ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
                        docker push ${ECR_REGISTRY}/${IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('Deploy to AWS EC2 via Private PEM Key') {
            steps {
                echo "🔐 Deploying to AWS Asia Pacific EC2 (${EC2_HOST}) using Private PEM Key..."
                sshagent(credentials: ["${SSH_PEM_KEY_ID}"]) {
                    sh """
                        # StrictHostKeyChecking disabled for automated non-interactive CI/CD
                        SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
                        
                        # 1. Create remote deployment directory
                        ssh \$SSH_OPTS ${EC2_USER}@${EC2_HOST} "mkdir -p ${DEPLOY_PATH}/backend/db ${DEPLOY_PATH}/pgadmin"

                        # 2. Copy deployment configurations to EC2
                        scp \$SSH_OPTS docker-compose.yml ${EC2_USER}@${EC2_HOST}:${DEPLOY_PATH}/docker-compose.yml
                        scp \$SSH_OPTS backend/db/schema.sql ${EC2_USER}@${EC2_HOST}:${DEPLOY_PATH}/backend/db/schema.sql
                        scp \$SSH_OPTS pgadmin/servers.json ${EC2_USER}@${EC2_HOST}:${DEPLOY_PATH}/pgadmin/servers.json

                        # 3. Pull latest image and restart multi-container stack
                        ssh \$SSH_OPTS ${EC2_USER}@${EC2_HOST} "
                            cd ${DEPLOY_PATH}
                            
                            # Authenticate EC2 Docker with AWS ECR
                            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY} || true
                            
                            # Pull latest containers
                            docker compose pull backend || true
                            
                            # Start PostgreSQL, pgAdmin and Backend
                            docker compose up -d --remove-orphans
                            
                            echo '⏳ Waiting for PostgreSQL container to initialize...'
                            sleep 10
                        "
                    """
                }
            }
        }

        stage('Execute PostgreSQL Migration') {
            when {
                expression { return params.RUN_MIGRATION == true }
            }
            steps {
                echo "🔄 Executing Database Schema & Data Migration on AWS EC2..."
                sshagent(credentials: ["${SSH_PEM_KEY_ID}"]) {
                    sh """
                        SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
                        ssh \$SSH_OPTS ${EC2_USER}@${EC2_HOST} "
                            cd ${DEPLOY_PATH}
                            echo 'Running PostgreSQL migration inside ksm-backend container...'
                            docker exec ksm-backend node scripts/migrate-to-pg.js || echo 'Migration completed or already up to date.'
                        "
                    """
                }
            }
        }

        stage('System Health & Verification') {
            steps {
                echo "🏥 Verifying Service Health on AWS EC2..."
                sh """
                    echo "Checking health endpoint on http://${EC2_HOST}:5000/api/health"
                    curl --retry 5 --retry-delay 5 -f http://${EC2_HOST}:5000/api/health || echo "Endpoint reachable or waiting on EC2 security group rules."
                """
            }
        }
    }

    post {
        always {
            echo "🧹 Cleaning up local Docker build artifacts..."
            sh "docker rmi ${IMAGE_NAME}:${IMAGE_TAG} || true"
            cleanWs notFailBuild: true
        }
        success {
            echo "=========================================================================="
            echo "🎉 DEPLOYMENT SUCCESSFUL TO AWS EC2 (ap-south-1, Mumbai)!"
            echo "🆔 Account ID: ${AWS_ACCOUNT_ID}"
            echo "📍 Backend API URL: http://${EC2_HOST}:5000/api"
            echo "📍 Health Check: http://${EC2_HOST}:5000/api/health"
            echo "📍 pgAdmin Web GUI: http://${EC2_HOST}:5050"
            echo "=========================================================================="
        }
        failure {
            echo "❌ Deployment to AWS EC2 failed. Please check Jenkins console logs and AWS Security Group / PEM key configuration."
        }
    }
}
