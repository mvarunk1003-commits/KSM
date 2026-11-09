# =============================================================================
# Dockerfile for Kolar Sringeri SriShankara Mutt Backend
# AWS Architecture: EC2 / ECR in ap-south-1 (Mumbai)
# AWS Account ID: 2777-3120-8394
# =============================================================================

FROM node:20-alpine AS base

# Install curl for health check and tzdata for Indian Standard Time (IST)
RUN apk add --no-cache curl tzdata
ENV TZ="Asia/Kolkata"

WORKDIR /app

# Set production node environment
ENV NODE_ENV=production
ENV PORT=5000

# Install dependencies with cache optimization
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Copy application source code
COPY . .

# Create directory for uploads with appropriate permissions
RUN mkdir -p /app/data /app/public/assets && chown -R node:node /app

# Switch to non-root user for security
USER node

# Expose backend API port
EXPOSE 5000

# Container Health Check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the Express server
CMD ["node", "server.js"]
