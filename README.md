# Andreas Boutsikas Portal

A premium, private client portal for delivering photography work to high-end hospitality, real estate, and architecture clients.

**Target Environment**: Self-hosted on your own server (Super Server) via Docker Compose.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Super Server                            │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │   Nginx     │───▶│  Next.js    │───▶│ PostgreSQL │   │
│  │ (optional)  │    │   App       │    │  Database  │   │
│  │  Reverse    │    │   :3000     │    │   :5432    │   │
│  │   Proxy     │    │             │    │             │   │
│  └─────────────┘    └─────────────┘    └─────────────┘   │
│                            │                              │
│                     ┌──────┴──────┐                       │
│                     │   Storage   │                       │
│                     │ /data/...   │                       │
│                     │ - images/    │                       │
│                     │ - zips/     │                       │
│                     └─────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Features

- **Premium Client Experience**: Elegant, photography-first gallery delivery
- **Admin Dashboard**: Clean interface for managing clients and projects
- **Secure Downloads**: Protected ZIP downloads with server-side authorization
- **Role-Based Access**: Admin and client roles with proper separation
- **Self-Hosted**: Runs entirely on your own infrastructure
- **Docker Deployment**: Full Docker Compose setup included

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Auth**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **Container**: Docker + Docker Compose

---

## Quick Start (Self-Hosted)

### Prerequisites

- Docker installed on your server
- Docker Compose v2+
- Domain/subdomain pointed to your server (optional for production)

### 1. Clone and Configure

```bash
# Clone the repository to your server
cd /opt/andreas-portal
git pull origin main

# Copy environment template
cp .env.production .env

# Edit .env with your configuration
nano .env
```

**Required .env settings:**
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/andreas_portal"
NEXTAUTH_SECRET="Generate with: openssl rand -base64 32"
NEXTAUTH_URL="https://portal.yourdomain.com"  # Your domain
STORAGE_PATH="/data/andreas-portal"
```

### 2. Create Data Directories

```bash
# Create persistent storage directories
sudo mkdir -p /data/andreas-portal/images
sudo mkdir -p /data/andreas-portal/zips
sudo mkdir -p /data/postgres/andreas_portal

# Set permissions (Docker runs as uid 1000)
sudo chown -R 1000:1000 /data/andreas-portal
sudo chown -R 1000:1000 /data/postgres
```

### 3. Deploy

```bash
# Build and start containers
docker-compose up -d --build

# Initialize database
docker-compose exec app npm run db:push

# Seed demo data (optional)
docker-compose exec app npm run db:seed

# Check status
docker-compose ps
```

### 4. Access the Portal

- **Client Portal**: `http://your-server:3000`
- **Admin Portal**: `http://your-server:3000/auth/admin-login`

---

## Production Deployment

### With Domain and SSL (Recommended)

1. **Configure DNS**: Point `portal.yourdomain.com` to your server's IP

2. **Install SSL Certificate**:
```bash
# Using Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d portal.yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/portal.yourdomain.com/fullchain.pem /opt/andreas-portal/ssl/
sudo cp /etc/letsencrypt/live/portal.yourdomain.com/privkey.pem /opt/andreas-portal/ssl/
```

3. **Enable Nginx Reverse Proxy**: Uncomment the nginx service in `docker-compose.yml` and configure `nginx/nginx.conf.example`

4. **Update .env**:
```env
NEXTAUTH_URL="https://portal.yourdomain.com"
```

### Docker Compose Services

| Service | Port | Purpose |
|---------|------|---------|
| app | 3000 | Next.js application |
| db | 5432 | PostgreSQL database |
| nginx | 80/443 | Reverse proxy (optional) |

### Persistent Storage

| Volume | Path | Purpose |
|--------|------|---------|
| abportal-storage | /data/andreas-portal | Images and ZIP files |
| abportal-dbdata | /data/postgres/andreas_portal | Database files |

---

## Management Commands

### View Logs
```bash
docker-compose logs -f app
```

### Shell into Container
```bash
docker-compose exec app sh
```

### Database Shell
```bash
docker-compose exec db psql -U postgres -d andreas_portal
```

### Restart Services
```bash
docker-compose restart app
```

### Update and Redeploy
```bash
git pull origin main
docker-compose up -d --build
docker-compose exec app npm run db:push
```

---

## Backup and Recovery

### Automated Backup
```bash
# Run backup script
./scripts/backup.sh

# Backups stored in /data/backups/abportal/
```

### Manual Backup
```bash
# Database only
docker-compose exec -T db pg_dump -U postgres andreas_portal > backup.sql

# Everything
tar -czf backup.tar.gz .env docker-compose.yml /data/andreas-portal /data/postgres
```

### Restore from Backup
```bash
# Restore database
cat backup.sql | docker-compose exec -T db psql -U postgres -d andreas_portal

# Restore files
tar -xzf backup.tar.gz -C /
```

---

## Demo Credentials

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@andreasboutsikas.com | admin-portal-2024 |
| Client | villa-eden@client.com | client-demo-2024 |
| Client | hotel-renaissance@client.com | client-demo-2024 |

**Important**: Change these passwords immediately for production!

---

## File Structure

```
andreas-portal/
├── app/                    # Next.js application
│   ├── admin/             # Admin pages
│   ├── auth/              # Authentication pages
│   ├── client/            # Client-facing pages
│   └── api/               # API routes
├── components/             # React components
├── lib/                   # Utilities (auth, prisma, storage)
├── prisma/                # Database schema and seed
├── scripts/               # Deployment scripts
├── nginx/                 # Nginx configuration
├── public/                # Static assets (logo, etc.)
├── docker-compose.yml     # Container orchestration
├── Dockerfile             # App container definition
└── .env.production        # Environment template
```

---

## Security Checklist

Before going live:

- [ ] Change all default passwords
- [ ] Generate secure NEXTAUTH_SECRET
- [ ] Enable HTTPS via Nginx/Let's Encrypt
- [ ] Configure firewall (allow 80, 443 only)
- [ ] Set up automated backups
- [ ] Review Nginx security headers
- [ ] Change PostgreSQL password
- [ ] Enable fail2ban for SSH

---

## Troubleshooting

### Database Connection Failed
```bash
# Check if database is ready
docker-compose exec db pg_isready -U postgres

# Check logs
docker-compose logs db
```

### Container Won't Start
```bash
# Check for port conflicts
netstat -tlnp | grep 3000

# Check disk space
df -h
```

### Upload Fails
```bash
# Check storage permissions
ls -la /data/andreas-portal

# Fix permissions
sudo chown -R 1000:1000 /data/andreas-portal
```

### 502 Bad Gateway (Nginx)
```bash
# Check if app is running
docker-compose ps

# Check Nginx logs
docker-compose logs nginx
```

---

## Performance Notes

- Images are optimized via Next.js Image component
- Static assets cached via Nginx
- Database connection pooling via Prisma
- File uploads streamed to disk (not memory)

---

## Support

For issues or questions about this deployment, review the logs and check the troubleshooting section above.
