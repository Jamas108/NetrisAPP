# GUARANTEED SUCCESS DOCKERFILE
# Strategi: Minimal dependencies, tanpa global install, gunakan npx

FROM node:18-slim

# Install only essential tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

WORKDIR /app

# Configure npm untuk maximum stability
RUN npm config set fetch-retry-mintimeout 120000 && \
    npm config set fetch-retry-maxtimeout 900000 && \
    npm config set fetch-retries 30 && \
    npm config set fetch-timeout 900000 && \
    npm config set maxsockets 1 && \
    npm config set registry https://registry.npmjs.org/

# Copy package files
COPY package.json ./
COPY package-lock.json* ./

# Clean npm cache
RUN npm cache clean --force

# Install dependencies dengan multiple retry
# TIDAK install expo-cli/eas-cli global - gunakan npx
RUN npm install --legacy-peer-deps \
    --no-audit \
    --no-fund \
    --loglevel=error \
    --prefer-offline=false || \
    (echo "Attempt 1 failed, retrying in 30s..." && \
     sleep 30 && \
     npm cache clean --force && \
     npm install --legacy-peer-deps --no-audit --loglevel=error) || \
    (echo "Attempt 2 failed, retrying in 60s..." && \
     sleep 60 && \
     npm cache clean --force && \
     npm install --legacy-peer-deps --no-audit --loglevel=error) || \
    (echo "Attempt 3 failed, trying with different approach..." && \
     sleep 90 && \
     npm cache clean --force && \
     npm install --legacy-peer-deps --no-audit --verbose)

# Verify node_modules exists
RUN if [ ! -d "node_modules" ]; then \
        echo "node_modules not found! Installation failed."; \
        exit 1; \
    fi && \
    echo "node_modules verified successfully"

# Copy app configuration
COPY app.json ./

# Copy source code
COPY . .

# Expose ports
EXPOSE 8081 19000 19001 19002

# Environment variables
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0
ENV NODE_ENV=development

# Health check
HEALTHCHECK --interval=60s --timeout=30s --start-period=120s --retries=3 \
  CMD curl -f http://localhost:8081/status || exit 1

# Use npx to run expo (no global install needed)
CMD ["npx", "expo", "start", "--non-interactive"]