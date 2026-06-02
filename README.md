# StockFlow — Inventory & Order Management System

A production-ready, fully containerized Inventory & Order Management System built with React, FastAPI, and PostgreSQL.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios |
| Backend | Python 3.12, FastAPI, SQLAlchemy, Pydantic v2 |
| Database | PostgreSQL 16 |
| Containerization | Docker (multi-stage builds) |
| Orchestration | Docker Compose |
| Reverse Proxy | Nginx (frontend) |

---

## Features

- **Product Management** — CRUD with SKU uniqueness enforcement, stock tracking, low-stock alerts
- **Customer Management** — Create/list/delete with unique email validation
- **Order Management** — Multi-item orders, automatic stock deduction, total calculation, cancel & restore
- **Dashboard** — Real-time summary (products, customers, orders, revenue) and low-stock alerts
- **Business Rules** — Insufficient stock prevention, negative quantity guard, unique constraint enforcement
- **Fully Containerized** — Three-service Docker Compose setup with health checks and named volumes

---

## Project Structure

```
inventory-system/
├── backend/
│   ├── main.py           # FastAPI app & all route handlers
│   ├── models.py         # SQLAlchemy ORM models
│   ├── schemas.py        # Pydantic request/response schemas
│   ├── crud.py           # Database operations layer
│   ├── database.py       # DB connection & session factory
│   ├── requirements.txt
│   ├── Dockerfile        # Multi-stage production build
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── pages/        # Dashboard, Products, Customers, Orders, OrderDetail
│   │   ├── utils/api.js  # Axios API client
│   │   ├── App.js        # Router + sidebar layout
│   │   └── App.css       # Design system & all styles
│   ├── public/
│   ├── nginx.conf        # SPA routing config
│   ├── Dockerfile        # Multi-stage build with Nginx
│   └── .dockerignore
├── docker-compose.yml
├── .env.example
└── .gitignore
```

---

## Quick Start (Local)

### Prerequisites
- Docker ≥ 24.x
- Docker Compose ≥ 2.x

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd inventory-system
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — at minimum change POSTGRES_PASSWORD
```

### 3. Start all services
```bash
docker compose up --build
```

### 4. Access the app
| Service | URL |
|---|---|
| Frontend | [https://inventory-system-ip83ipr28-shubham-verma-s-projects1.vercel.app] |
| Backend API | [https://inventory-backend-wmuz.onrender.com/] |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

### Stop
```bash
docker compose down
# To also remove database volume:
docker compose down -v
```

---

## API Reference

### Products
| Method | Endpoint | Description |
|---|---|---|
| POST | `/products` | Create a product |
| GET | `/products` | List all products |
| GET | `/products/{id}` | Get product by ID |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| POST | `/customers` | Create a customer |
| GET | `/customers` | List all customers |
| GET | `/customers/{id}` | Get customer by ID |
| DELETE | `/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders` | Create an order |
| GET | `/orders` | List all orders |
| GET | `/orders/{id}` | Get order by ID |
| DELETE | `/orders/{id}` | Cancel/delete order |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/summary` | Summary stats + low-stock alerts |

---

## Deployment Guide

### Backend — Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your repository; set **Root Directory** to `backend`
4. Set **Runtime** to Docker
5. Add environment variables:
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   ```
6. Provision a **PostgreSQL** database from Render and copy the connection string

### Backend — Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Add a PostgreSQL service from the Railway marketplace
3. Set `DATABASE_URL` from the Railway-generated connection string
4. Set root directory to `backend/` in settings

---

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Set **Root Directory** to `frontend`
4. Set **Framework Preset** to Create React App
5. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```
6. Deploy

### Frontend — Netlify

1. Go to [netlify.com](https://netlify.com) → **Add New Site** → **Import from Git**
2. Set **Base directory** to `frontend`
3. Set **Build command** to `npm run build`
4. Set **Publish directory** to `frontend/build`
5. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url
   ```

---

## Docker Hub

```bash
# Build and tag
docker build -t yourusername/inventory-backend:latest ./backend

# Push
docker push yourusername/inventory-backend:latest
```

---

## Business Logic Enforced

| Rule | Where |
|---|---|
| SKU must be unique | `POST /products` — 400 if duplicate |
| Email must be unique | `POST /customers` — 400 if duplicate |
| Quantity cannot be negative | Pydantic schema (`ge=0`) + DB model |
| Cannot order more than in stock | `POST /orders` — 400 with detailed message |
| Stock auto-deducted on order | `crud.create_order()` |
| Stock auto-restored on cancel | `crud.delete_order()` |
| Total calculated by backend | Price × qty summed server-side |
| All inputs validated | Pydantic schemas on every endpoint |

---

## Development (without Docker)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Set DATABASE_URL environment variable
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8000 npm start
```
