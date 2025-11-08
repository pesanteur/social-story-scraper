# 🚀 How to Run the Social Story Scraper

## Quick Start (Recommended)

### Option 1: Automatic Setup (Easiest!)

```bash
# Clone the repository
git clone https://github.com/pesanteur/social-story-scraper.git
cd social-story-scraper
git checkout claude/social-story-scraper-011CUvKXq2qiKppn9So8yVyq

# Run the setup script
chmod +x setup.sh
./setup.sh
```

That's it! The script will:
- ✅ Check for Docker installation
- ✅ Generate secure environment keys
- ✅ Build and start all containers
- ✅ Verify services are running

Access the app at: **http://localhost:8000/api/v1/docs**

---

### Option 2: Manual Docker Setup

```bash
# 1. Clone the repository
git clone https://github.com/pesanteur/social-story-scraper.git
cd social-story-scraper
git checkout claude/social-story-scraper-011CUvKXq2qiKppn9So8yVyq

# 2. Create .env file with secure keys
python3 -c "
import secrets
print('SECRET_KEY=' + secrets.token_urlsafe(32))
print('ENCRYPTION_KEY=' + secrets.token_urlsafe(32))
print('JWT_SECRET_KEY=' + secrets.token_urlsafe(32))
" > .env

# 3. Start services
docker-compose up -d

# 4. Check status
docker-compose logs -f backend
```

---

### Option 3: Manual Setup (Without Docker)

```bash
# 1. Clone the repository
git clone https://github.com/pesanteur/social-story-scraper.git
cd social-story-scraper/backend

# 2. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Edit .env and add your keys

# 5. Create database
python3 -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"

# 6. Run the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Troubleshooting

### Error: `.env file not found`

**Solution:** Create the .env file in the root directory:

```bash
# Option A: Use the setup script
./setup.sh

# Option B: Create manually
python3 -c "
import secrets
print('SECRET_KEY=' + secrets.token_urlsafe(32))
print('ENCRYPTION_KEY=' + secrets.token_urlsafe(32))
print('JWT_SECRET_KEY=' + secrets.token_urlsafe(32))
" > .env
```

### Error: `version is obsolete`

This is just a warning and can be ignored. The docker-compose file has been updated to remove the version field for newer Docker Compose versions.

### Backend not starting

```bash
# Check logs
docker-compose logs backend

# Restart services
docker-compose restart

# Rebuild if needed
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Port already in use

If port 8000 or 5432 is already in use, edit `docker-compose.yml` and change the ports:

```yaml
ports:
  - "8001:8000"  # Use 8001 instead of 8000
```

---

## Raspberry Pi Specific

The app works on Raspberry Pi! Just make sure:
- ✅ Docker is installed: `curl -sSL https://get.docker.com | sh`
- ✅ Your user is in docker group: `sudo usermod -aG docker $USER`
- ✅ You have enough memory (2GB+ recommended)

---

## What's Next?

After the app is running:

### 1. Register Your Account

Visit: http://localhost:8000/api/v1/docs

Click on **POST /api/v1/auth/register** and try it out:

```json
{
  "email": "your@email.com",
  "password": "SecurePassword123!"
}
```

### 2. Login

**POST /api/v1/auth/login** with the same credentials

Copy the `access_token` from the response.

### 3. Add API Keys

Click the **Authorize** button at the top, paste your token.

Then use **POST /api/v1/settings/api-keys** to add:

- Apify API key
- OpenAI/Anthropic/Google AI key
- Perplexity API key
- Telegram bot token (format: `bot_token|chat_id`)

### 4. Configure Preferences

**PUT /api/v1/settings/preferences**:

```json
{
  "ai_model_provider": "openai",
  "ai_model_name": "gpt-4-turbo",
  "twitter_list_url": "https://x.com/i/lists/YOUR_LIST_ID",
  "daily_run_time": "06:45:00",
  "timezone": "America/New_York",
  "auto_run_enabled": true,
  "max_tweets_to_scrape": "50"
}
```

### 5. Run Your First Scrape!

**POST /api/v1/scrapes/**:

```json
{
  "trigger_type": "manual"
}
```

---

## Useful Commands

```bash
# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Check service status
docker-compose ps

# Access database
docker-compose exec postgres psql -U scraper_user -d social_scraper_db
```

---

## Need Help?

- 📖 See **README.md** for full documentation
- 🚀 See **QUICKSTART.md** for API usage examples
- 💬 Check logs: `docker-compose logs backend`
- 🏥 Health check: http://localhost:8000/health

---

**The backend is production-ready! Start scraping and analyzing social stories!** 🎉
