# Production Nginx image serving pre-compiled React build
FROM nginx:alpine

# Install openssl and generate self-signed SSL certificate for HTTPS (port 443)
RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/server.key \
    -out /etc/nginx/ssl/server.crt \
    -subj "/C=IN/ST=Karnataka/L=Kolar/O=Kolar Sringeri SriShankara Mutt/CN=15.206.128.103"

# Copy pre-compiled static files
COPY build /usr/share/nginx/html

# Copy custom Nginx configuration (handles SPA routing, API reverse-proxy, and SSL)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 443
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
