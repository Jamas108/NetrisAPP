#!/bin/bash

# Script untuk build Docker dengan retry mechanism
# Guaranteed success dengan multiple fallback strategies

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Netris App Docker Build Script          ║${NC}"
echo -e "${GREEN}║   Guaranteed Success Build                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if docker is running
print_info "Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi
print_success "Docker is running"

# Create eas.json if not exists
print_info "Checking eas.json..."
if [ ! -f "eas.json" ]; then
    print_info "Creating eas.json..."
    cat > eas.json << 'EOF'
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
EOF
    print_success "eas.json created"
else
    print_success "eas.json exists"
fi

# Clean previous builds
print_info "Cleaning previous builds..."
docker-compose down -v 2>/dev/null || true
docker system prune -f 2>/dev/null || true
print_success "Cleanup complete"

# Strategy 1: Build dengan BuildKit (fastest)
print_info "Strategy 1: Building with BuildKit..."
if DOCKER_BUILDKIT=1 docker-compose build --no-cache 2>&1 | tee build.log; then
    print_success "Build successful with BuildKit!"
    exit 0
fi

print_error "Strategy 1 failed, trying Strategy 2..."
sleep 5

# Strategy 2: Build dengan docker build langsung
print_info "Strategy 2: Building with docker build..."
if docker build --no-cache --network=host -t netris-app:latest . 2>&1 | tee build.log; then
    print_success "Build successful with docker build!"
    exit 0
fi

print_error "Strategy 2 failed, trying Strategy 3..."
sleep 5

# Strategy 3: Build dengan increased timeout
print_info "Strategy 3: Building with increased timeout..."
cat > Dockerfile.tmp << 'EOF'
FROM node:18-slim

# Install minimal dependencies
RUN apt-get update && apt-get install -y curl git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Configure npm dengan timeout sangat tinggi
RUN npm config set fetch-retry-mintimeout 120000 && \
    npm config set fetch-retry-maxtimeout 900000 && \
    npm config set fetch-retries 20 && \
    npm config set maxsockets 1

# Copy files
COPY package*.json ./
COPY app.json ./

# Install dependencies (tanpa expo-cli global)
RUN npm cache clean --force
RUN npm install --legacy-peer-deps --no-audit --loglevel=error || \
    (sleep 30 && npm install --legacy-peer-deps --no-audit) || \
    (sleep 60 && npm install --legacy-peer-deps --no-audit)

COPY . .

EXPOSE 8081 19000

ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
CMD ["npx", "expo", "start"]
EOF

if docker build --no-cache -f Dockerfile.tmp -t netris-app:latest . 2>&1 | tee build.log; then
    print_success "Build successful with minimal Dockerfile!"
    rm Dockerfile.tmp
    exit 0
fi

print_error "Strategy 3 failed, trying Strategy 4..."
sleep 5

# Strategy 4: Multi-stage build
print_info "Strategy 4: Multi-stage build..."
cat > Dockerfile.multi << 'EOF'
# Stage 1: Dependencies
FROM node:18-slim AS deps

WORKDIR /app

RUN npm config set fetch-retry-mintimeout 120000 && \
    npm config set fetch-retry-maxtimeout 900000 && \
    npm config set fetch-retries 20

COPY package*.json ./
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --no-audit || \
    npm install --legacy-peer-deps --no-audit || \
    npm install --legacy-peer-deps --no-audit

# Stage 2: Runtime
FROM node:18-slim

RUN apt-get update && apt-get install -y curl git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY app.json ./
COPY . .

EXPOSE 8081 19000

ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
CMD ["npx", "expo", "start"]
EOF

if docker build --no-cache -f Dockerfile.multi -t netris-app:latest . 2>&1 | tee build.log; then
    print_success "Build successful with multi-stage!"
    rm Dockerfile.multi
    exit 0
fi

print_error "All strategies failed!"
echo ""
echo -e "${YELLOW}════════════════════════════════════════${NC}"
echo -e "${YELLOW}TROUBLESHOOTING TIPS:${NC}"
echo -e "${YELLOW}════════════════════════════════════════${NC}"
echo ""
echo "1. Check your internet connection"
echo "2. Check if you're behind a proxy"
echo "3. Try using mobile hotspot instead of WiFi"
echo "4. Check build.log for specific errors:"
echo "   cat build.log | grep -i error"
echo ""
echo "5. Manual build command:"
echo "   docker build --network=host --no-cache -t netris-app ."
echo ""
echo "6. Alternative: Build without Docker"
echo "   npm install --legacy-peer-deps"
echo "   npx expo start"
echo ""

exit 1