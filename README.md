#  Order Execution Engine

A high-performance **order execution engine** built with **Fastify**, **BullMQ**, **Redis**, and **PostgreSQL**.  
It processes asynchronous token swap orders through background workers and streams real-time updates to clients via WebSockets.

---

## Features

- **Fastify REST + WebSocket API** for order submission and live updates  
- **BullMQ Worker** to process queued trades asynchronously  
- **PostgreSQL Integration** for persistent order tracking  
- **Redis Pub/Sub** for instant status propagation  
- **Cloud-ready deployment** (Docker, GCP, Zeabur, etc.)

---

## Tech Stack

| Component | Technology |
|------------|-------------|
| API Framework | Fastify |
| Job Queue | BullMQ |
| Caching / Messaging | Redis |
| Database | PostgreSQL |
| Deployment | Docker / Cloud Run / Zeabur |

---

<!-- ## ⚙️ Architecture Overview

```
┌───────────────┐        ┌──────────────┐        ┌──────────────┐
│   Fastify API │◄──────►│ Redis Pub/Sub│◄──────►│ BullMQ Worker │
│  (Order Input)│        │  (Messaging) │        │ (Exec Engine) │
└──────┬────────┘        └─────┬────────┘        └──────┬────────┘
       │                         │                     │
       ▼                         ▼                     ▼
 PostgreSQL DB           WebSocket Clients        Mock DEX Routers
```

--- -->

## Order Type Implemented

This implementation currently supports **Limit Orders** — chosen for their balance between control and complexity.  
A **limit order** executes only when the target price condition is met, showcasing asynchronous workflow and live state updates (pending → routing → building → submitted → confirmed).

**Extensibility:**  
- *Market Orders* → execute immediately upon submission (skip routing).  
- *Stop-Limit Orders* → trigger queueing only when market conditions reach the stop price.

This modular queue-based design makes adding new order types straightforward.

---

##  Environment Variables

```bash
# === Application ===
PORT=8080
NODE_ENV=production
HOST=0.0.0.0

# === Redis ===
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# === PostgreSQL ===
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/orders_db?schema=public
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start Redis and PostgreSQL (with Docker)
docker-compose up -d

# Run database migrations (if using Prisma)
npx prisma migrate dev --name init

# Build and run the app
npm run build
npm run start

# or, for development mode with hot reload:
npm run dev
```

---

##  API Endpoints

| Method | Endpoint | Description |
|---------|-----------|-------------|
| `POST` | `/api/orders/execute` | Submit a new order |
| `GET`  | `/ws/orders/:orderId` | Subscribe for live order status updates |

---

## WebSocket Update Example

```json
{
  "status": "confirmed",
  "timestamp": 1735673845000,
  "dex": "Meteora",
  "txHash": "0xabc123...",
  "executedPrice": 101.45
}
```

---

##  Deployment

The engine is deployable on:
- **Zeabur** (recommended for free hosting)
- **Google Cloud Run**
- **Docker Compose / Local VM**

For Zeabur or Cloud Run, ensure:
- `HOST=0.0.0.0`
- `PORT=8080`
- Remote Redis & Postgres credentials are provided.

---

## Future Enhancements

- Integrate real on-chain DEX APIs (Raydium, Meteora, Jupiter)
- Add stop-limit and market order support
- Enable user authentication and order history queries
- Enhance fault tolerance and retry logic for BullMQ jobs
- Add Prometheus metrics and Grafana dashboards for observability
- Support multi-chain routing simulation for cross-DEX swaps

