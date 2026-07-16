# Enterprise AI Platform

Enterprise AI-powered customer service platform combining a Spring Boot backend, an
Angular frontend, a FastAPI-based AI chatbot (RAG + intent detection), and a
FinFlow digital wallet demo — all orchestrated with Docker Compose behind an
Nginx reverse proxy, with Prometheus/Grafana monitoring built in.

## Architecture

```
Browser (HTTPS) → Nginx (443/80)
                     ├── Frontend (Angular)        :4200
                     ├── Customer Portal (Angular)  :4201
                     ├── Backend (Spring Boot)      :8080
                     ├── AI Chatbot (FastAPI)       :8001
                     └── FinTech demo app
                              ↓
                         PostgreSQL :5432
                         Redis      :6379

Monitoring:
  Prometheus :9090 → Grafana :3000
```

## Project structure

| Path                | Description                                                             |
|---------------------|---------------------------------------------------------------------------|
| `backend/`          | Spring Boot REST API — auth, admin, chatbot integration, fintech modules |
| `frontend/`         | Angular main web application                                            |
| `customer-portal/`  | Angular customer-facing portal (FinFlow)                                |
| `ai-chatbot/`       | FastAPI AI chatbot service (RAG pipeline, intent agents, conversation memory, multilingual support) |
| `fintech-app/`      | Static HTML/JS demo — FinFlow digital wallet & money transfer UI         |
| `services/`         | Standalone microservices (`chatbot-service`, `analytics-service`) and shared `common` library |
| `database/`         | Database init script and migrations                                     |
| `infrastructure/`   | Nginx reverse proxy config and monitoring (Prometheus/Grafana) setup     |
| `docs/`             | Additional documentation                                                 |

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB disk space

## Quick start

### 1. Configure environment (optional)

```bash
cp .env.template .env
# Edit .env to set OPENAI_API_KEY if you want full AI chatbot responses
```

### 2. Start all services

```bash
docker compose up -d
```

### 3. Access the platform

Startup takes ~3 minutes on first run (Maven dependency download for the backend).

| Service    | URL                                | Credentials   |
|------------|-------------------------------------|---------------|
| Frontend   | https://localhost                   | admin / admin |
| API        | https://localhost/api               | —             |
| Swagger UI | https://localhost/swagger-ui.html   | —             |
| AI Chatbot | http://localhost:8001/health        | —             |
| Grafana    | http://localhost:3000               | admin / admin |
| Prometheus | http://localhost:9090               | —             |

> **Note:** Your browser will warn about the self-signed SSL certificate. Click
> "Advanced → Proceed" to continue.

### Managing the stack

```bash
docker compose ps            # Show status of all services
docker compose logs -f       # Stream all logs
docker compose logs backend  # Stream backend logs only
docker compose down          # Stop (keeps data)
docker compose down -v       # Stop and remove all data
```

## Running tests locally

### Backend (Java)

Requires Java 21 JDK and Maven.

```bash
cd backend
JAVA_HOME=/path/to/java21 mvn test -s mvn-settings.xml
```

### AI Chatbot (Python)

```bash
cd ai-chatbot
pip install fastapi uvicorn pydantic pydantic-settings httpx redis langdetect pytest pytest-asyncio sqlalchemy psycopg2-binary
pytest tests/ -v
```

## Default credentials

| Service    | Username         | Password                             |
|------------|------------------|---------------------------------------|
| Web App    | admin            | admin                                 |
| Grafana    | admin            | admin (or `GRAFANA_PASSWORD` in `.env`) |
| PostgreSQL | enterprise_user  | EnterpriseSecure123!                  |

**Change these before deploying to production.**

## License

No license has been specified for this project.
