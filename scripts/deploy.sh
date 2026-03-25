#!/bin/bash
# ============================================
# Andreas Boutsikas Portal - Deployment Script
# Self-hosted production deployment
# ============================================

set -e

echo "============================================"
echo "Andreas Boutsikas Portal - Deployment"
echo "============================================"

# Configuration
APP_NAME="abportal"
DATA_ROOT="/var/data/abportal"
STORAGE_PATH="${DATA_ROOT}/storage"
DB_PATH="${DATA_ROOT}/db"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root or with docker permissions
check_permissions() {
    log_info "Checking prerequisites..."
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose V2 is not installed. Please update Docker."
        exit 1
    fi
}

# Create bind mount directories on host
create_directories() {
    log_info "Creating host data directories..."
    sudo mkdir -p "${STORAGE_PATH}/images"
    sudo mkdir -p "${STORAGE_PATH}/zips"
    sudo mkdir -p "${DB_PATH}"
    # Match container's appuser UID/GID
    sudo chown -R 1001:1001 "${DATA_ROOT}"
    log_info "Directories created at ${DATA_ROOT}"
}

# Check environment file
check_env() {
    log_info "Checking environment configuration..."

    if [ ! -f ".env" ]; then
        if [ -f ".env.production" ]; then
            log_warn "No .env file found. Copying from .env.production..."
            cp .env.production .env
            log_error "Please edit .env and set POSTGRES_PASSWORD and NEXTAUTH_SECRET before deploying."
            exit 1
        else
            log_error "No .env or .env.production file found."
            exit 1
        fi
    fi

    # Check POSTGRES_PASSWORD is set (required for docker-compose)
    if ! grep -q "^POSTGRES_PASSWORD=" .env 2>/dev/null; then
        log_error "POSTGRES_PASSWORD is not set in .env. Set it before deploying."
        exit 1
    fi

    local secret_value
    secret_value=$(grep "^NEXTAUTH_SECRET=" .env 2>/dev/null | cut -d'=' -f2-)
    if [ "${secret_value}" = "REPLACE_ME_RUN_openssl_rand_-base64_32" ] || \
       [ -z "${secret_value}" ] || \
       [ "${secret_value}" = "dev-only-localhost-secret-do-not-use-in-production" ]; then
        log_error "NEXTAUTH_SECRET is still a placeholder. Generate a real secret:"
        log_error "  openssl rand -base64 32"
        log_error "Then edit .env and set NEXTAUTH_SECRET=<output>"
        exit 1
    fi
}

# Pull latest code (if using git)
pull_code() {
    if [ -d ".git" ]; then
        log_info "Pulling latest code..."
        git pull origin main 2>/dev/null || log_warn "Not a git repo or pull failed. Continuing..."
    fi
}

# Build and start containers
deploy() {
    log_info "Building and starting containers..."
    docker compose build --no-cache app
    docker compose up -d

    # Wait for app to be healthy
    log_info "Waiting for application to start..."
    for i in {1..30}; do
        if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
            log_info "Application is healthy!"
            return 0
        fi
        sleep 2
    done

    log_warn "Application may not be fully healthy yet. Check logs with: docker compose logs"
}

# Show status
status() {
    echo ""
    echo "============================================"
    echo "Container Status"
    echo "============================================"
    docker compose ps
    echo ""
    echo "============================================"
    echo "Storage Usage"
    echo "============================================"
    echo "Images/ZIPs: $(du -sh "${STORAGE_PATH}" 2>/dev/null || echo 'N/A')"
    echo "Database: $(du -sh "${DB_PATH}" 2>/dev/null || echo 'N/A')"
    echo ""
    echo "============================================"
    echo "Health Check"
    echo "============================================"
    curl -s http://localhost:3000/api/health 2>/dev/null || echo "Health check unavailable"
    echo ""
}

# Show logs
logs() {
    docker compose logs -f --tail=100
}

# Initialize database (first time only)
init_db() {
    log_info "Pushing database schema..."
    docker compose exec -T app node ./node_modules/prisma/build/index.js db push --schema=./prisma/schema.prisma --accept-data-loss
    log_info "Database schema created."
}

# Seed database (demo data)
seed_db() {
    log_info "Seeding database with demo data..."
    docker compose exec -T app npm run db:seed
    log_info "Demo data created."
}

# Full deploy with initialization
full_deploy() {
    check_permissions
    create_directories
    check_env
    pull_code
    docker compose up -d db
    log_info "Waiting for database to be healthy..."
    sleep 5
    init_db
    deploy
    status
}

# Help
show_help() {
    echo ""
    echo "============================================"
    echo "Andreas Boutsikas Portal - Deployment"
    echo "============================================"
    echo ""
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "First-time setup:"
    echo "  ./deploy.sh full       # Full deploy with DB init + seed"
    echo ""
    echo "Subsequent deploys:"
    echo "  ./deploy.sh deploy     # Rebuild and restart app only"
    echo ""
    echo "Database:"
    echo "  ./deploy.sh init       # Push schema (after schema changes)"
    echo "  ./deploy.sh seed       # Seed demo data"
    echo ""
    echo "Monitoring:"
    echo "  ./deploy.sh status     # Container status and health"
    echo "  ./deploy.sh logs       # Application logs"
    echo "  ./deploy.sh restart    # Restart containers"
    echo "  ./deploy.sh stop       # Stop all containers"
    echo "  ./deploy.sh clean      # Stop and remove containers (preserves data)"
    echo "  ./deploy.sh help       # Show this help"
    echo ""
    echo "Before running ./deploy.sh full for the first time:"
    echo "  1. cp .env.production .env"
    echo "  2. Edit .env: set POSTGRES_PASSWORD, NEXTAUTH_SECRET, NEXTAUTH_URL"
    echo "  3. Generate secret: openssl rand -base64 32"
    echo ""
    echo "Demo credentials (dev/demo only, change in production):"
    echo "  Admin:  admin@andreasboutsikas.com  / admin-portal-2024"
    echo "  Client: villa-eden@client.com        / client-demo-2024"
    echo ""
}

# Main
case "${1:-help}" in
    deploy)
        check_permissions
        check_env
        pull_code
        deploy
        status
        ;;
    init)
        check_permissions
        check_env
        init_db
        ;;
    seed)
        check_permissions
        seed_db
        ;;
    full)
        full_deploy
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    restart)
        docker compose restart
        ;;
    stop)
        docker compose stop
        ;;
    clean)
        log_warn "Stopping and removing containers..."
        docker compose down
        log_info "Containers removed. Data preserved at ${DATA_ROOT}"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
