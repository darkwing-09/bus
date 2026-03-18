<<<<<<< HEAD
# 🚌 BusBook — Bus Booking & Live Tracking Platform

A production-grade bus booking platform with real-time tracking, modeled after RedBus/BlaBlaCar.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, React, TypeScript, TailwindCSS, Framer Motion |
| **Backend** | FastAPI (Python), Pydantic, SQLAlchemy |
| **Database** | PostgreSQL 16 |
| **Cache/Queue** | Redis 7 |
| **Background Jobs** | Celery |
| **Payments** | Razorpay |
| **Real-time** | WebSockets (Redis Pub/Sub) |
| **Infrastructure** | Docker, Docker Compose, Nginx |

## Project Structure

```
bus/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── api/v1/            # Route handlers (10 modules)
│   │   ├── models/            # SQLAlchemy models (8 tables)
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── core/              # Config, security, database, Redis
│   │   ├── workers/           # Celery tasks
│   │   └── websockets/        # WebSocket handlers
│   ├── alembic/               # DB migrations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── apps/
│   │   ├── user/              # User-facing app (port 3000)
│   │   ├── admin/             # Admin panel (port 3001)
│   │   └── conductor/         # Conductor panel (port 3002)
│   └── packages/shared/       # Shared API client, stores, types
├── docker-compose.yml
├── nginx/nginx.conf
└── README.md
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local dev)
- Python 3.11+ (for local dev)

### Using Docker (Recommended)

```bash
# Clone and start all services
docker compose up --build

# Services will be available at:
# User App:      http://localhost:3000
# Admin Panel:   http://localhost:3001
# Conductor:     http://localhost:3002
# API Docs:      http://localhost:8000/api/docs
# Nginx Proxy:   http://localhost:80
```

### Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Start PostgreSQL and Redis (via Docker or locally)
docker compose up postgres redis -d

# Run migrations
alembic upgrade head

# Start server
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install

# Start all apps
npm run dev

# Or individually
npm run dev:user      # port 3000
npm run dev:admin     # port 3001
npm run dev:conductor # port 3002
```

## Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@busbook.com | Admin@123 |
| Conductor | conductor@busbook.com | Conductor@123 |

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

### Key API Endpoints

| Endpoint | Description |
|---|---|
| `POST /api/v1/auth/register` | User registration |
| `POST /api/v1/auth/login` | JWT login |
| `GET /api/v1/trips/search` | Search buses by route & date |
| `POST /api/v1/seats/lock` | Lock seats (5-min Redis TTL) |
| `POST /api/v1/payments/create-order` | Create Razorpay order |
| `WS /api/v1/tracking/{trip_id}/ws` | Live location stream |

## Architecture Highlights

- **Seat Locking**: Redis `SET NX EX 300` for atomic 5-minute locks
- **Real-time Tracking**: Conductor REST → Redis Pub/Sub → WebSocket fan-out
- **RBAC**: JWT with role-based `RoleChecker` dependency
- **QR Tickets**: Base64-encoded QR codes generated on booking
- **3 Frontend Apps**: Monorepo with shared types, API client, and auth store

## Deployment

- **Frontend**: Vercel (configure each app separately)
- **Backend**: Railway / Render / AWS ECS
- **Database**: Managed PostgreSQL (Neon, Supabase, RDS)
- **Redis**: Upstash / ElastiCache

## License

MIT
=======
# bus-webapp
>>>>>>> 1da0b12e4cab70a6bc3cc2d0af3c74581a1f7e3a
