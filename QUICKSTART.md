# Enterprise AI Platform - Quick Start

## Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB disk space

## Start in 3 Steps

### 1. Configure environment (optional)
```bash
cp .env.template .env
# Edit .env to set OPENAI_API_KEY if you want full AI responses
```

### 2. Start all services
```bash
docker compose up -d
```

### 3. Wait ~3 minutes for startup, then access:

| Service    | URL                          | Credentials   |
|------------|------------------------------|---------------|
| Frontend   | https://localhost             | admin / admin |
| API        | https://localhost/api         | —             |
| Swagger UI | https://localhost/swagger-ui.html | —         |
| AI Chatbot | http://localhost:8001/health  | —             |
| Grafana    | http://localhost:3000         | admin / admin |
| Prometheus | http://localhost:9090         | —             |

> **Note:** Your browser will warn about the self-signed SSL certificate. Click "Advanced → Proceed" to continue.

## Check Service Health
```bash
docker compose ps           # Shows status of all 7 services
docker compose logs -f      # Stream all logs
docker compose logs backend # Stream backend logs only
```

## Stop the Platform
```bash
docker compose down         # Stop (keeps data)
docker compose down -v      # Stop and remove all data
```

## Run Tests Locally

### Backend (Java)
```bash
# Requires Java 21 JDK and Maven
cd backend
JAVA_HOME=/path/to/java21 mvn test -s mvn-settings.xml
```

### AI Chatbot (Python)
```bash
cd ai-chatbot
pip install fastapi uvicorn pydantic pydantic-settings httpx redis langdetect pytest pytest-asyncio sqlalchemy psycopg2-binary
pytest tests/ -v
```

## Architecture

```
Browser (HTTPS) → Nginx (443/80)
                     ├── Frontend (Angular)  :4200
                     ├── Backend (Spring Boot) :8080
                     └── AI Chatbot (FastAPI)  :8001
                              ↓
                         PostgreSQL :5432
                         Redis      :6379

Monitoring:
  Prometheus :9090 → Grafana :3000
```

## Service Build Notes

The backend Docker build downloads dependencies from Maven Central.
On first build this takes ~5-10 minutes depending on internet speed.
Subsequent builds use Docker layer cache and are much faster.

## Default Credentials

| Service    | Username | Password             |
|------------|----------|----------------------|
| Web App    | admin    | admin                |
| Grafana    | admin    | admin (or GRAFANA_PASSWORD in .env) |
| PostgreSQL | enterprise_user | EnterpriseSecure123! |

**CHANGE THESE IN PRODUCTION!**
