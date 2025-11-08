# Production Deployment Guide

## ⚠️ Security Configuration for Production

### 1. Disable Test Endpoints

Test endpoints (`/api/v1/test/*`) are **automatically disabled** in production. To ensure they are disabled:

**In `docker-compose.yml`, change:**
```yaml
ENVIRONMENT: development
```

**To:**
```yaml
ENVIRONMENT: production
```

This will:
- ✅ Remove test endpoints from the API completely
- ✅ Return 403 Forbidden if someone tries to access them
- ✅ Hide them from the API documentation
- ✅ Print "Test endpoints are disabled (production mode)" on startup

### 2. Update CORS Origins

Replace localhost URLs with your actual domain:

```yaml
BACKEND_CORS_ORIGINS: '["https://yourdomain.com"]'
```

### 3. Secure Environment Variables

**DO NOT** use the auto-generated keys from setup.sh in production!

Generate secure keys:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

Update these in your `.env` file or environment variables:
- `SECRET_KEY`
- `ENCRYPTION_KEY`
- `JWT_SECRET_KEY`

### 4. Remove Development Volume Mounts

In `docker-compose.yml`, remove the development volume mount:

**Remove:**
```yaml
volumes:
  - ./backend:/app
```

This prevents hot-reloading and protects your source code.

### 5. Production Checklist

Before deploying to production:

- [ ] Set `ENVIRONMENT: production` in docker-compose.yml
- [ ] Update `BACKEND_CORS_ORIGINS` with production domain
- [ ] Generate new secure keys for SECRET_KEY, ENCRYPTION_KEY, JWT_SECRET_KEY
- [ ] Remove development volume mounts
- [ ] Use HTTPS/SSL certificates
- [ ] Set up proper database backups
- [ ] Configure firewall rules
- [ ] Review and limit exposed ports
- [ ] Enable production logging
- [ ] Set up monitoring and alerts

## Example Production docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: social-scraper-db
    environment:
      POSTGRES_USER: scraper_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}  # Use strong password from env
      POSTGRES_DB: social_scraper_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U scraper_user"]
      interval: 10s
      timeout: 5s
      retries: 5
    # Don't expose postgres port externally in production
    # ports:
    #   - "5432:5432"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: social-scraper-backend
    environment:
      DATABASE_URL: postgresql://scraper_user:${DB_PASSWORD}@postgres:5432/social_scraper_db
      SECRET_KEY: ${SECRET_KEY}
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      JWT_ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: 15
      REFRESH_TOKEN_EXPIRE_DAYS: 7
      TIMEZONE: America/New_York
      DAILY_RUN_TIME: "06:45"
      BACKEND_CORS_ORIGINS: '["https://yourdomain.com"]'
      ENVIRONMENT: production  # ⚠️ CRITICAL FOR SECURITY
    depends_on:
      postgres:
        condition: service_healthy
    # Remove development volume mount
    # volumes:
    #   - ./backend:/app
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: social-scraper-frontend
    ports:
      - "80:80"
      - "443:443"  # For HTTPS
    depends_on:
      - backend
    environment:
      - VITE_API_URL=https://yourdomain.com/api/v1
    restart: unless-stopped

volumes:
  postgres_data:
```

## Verification

After deployment, verify test endpoints are disabled:

```bash
curl https://yourdomain.com/api/v1/test/health
```

Should return:
```json
{
  "detail": "Test endpoints are only available in development mode. These endpoints are disabled in production for security."
}
```

## Local Development

For local development, keep `ENVIRONMENT: development` to enable test endpoints.

Test endpoints available in development:
- `POST /api/v1/test/init-test-user` - Create test user
- `POST /api/v1/test/trigger-scrape` - Trigger scrape without auth
- `GET /api/v1/test/jobs` - View test user's jobs
- `GET /api/v1/test/health` - Test endpoint health check
