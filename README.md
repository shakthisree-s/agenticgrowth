# MerchantOS AI

Autonomous AI Growth & Commerce Operating System with Python FastAPI backend and React/Vite storefront.

---

## 1. Project Structure

```
MerchantOS/
├── backend/                 # Python FastAPI + SQLite + SQLAlchemy Backend
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── requirements.txt
│   ├── merchantos.db
│   ├── data/
│   │   ├── __init__.py
│   │   └── seed_data.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── recommendation_service.py
│   │   ├── customer_service.py
│   │   ├── order_service.py
│   │   └── payment_service.py
│   └── test_backend.py
├── frontend/                # React 19 + TypeScript + Vite Storefront & Admin App
│   ├── src/
│   ├── public/
│   ├── scripts/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── .oxlintrc.json
├── .gitignore
└── README.md
```

---

## 2. Running the Backend

From the project root:

```bash
py -m uvicorn backend.main:app --reload --port 8000
```

- **API Base URL**: `http://127.0.0.1:8000`
- **Swagger Documentation**: `http://127.0.0.1:8000/docs`
- **Health Endpoint**: `http://127.0.0.1:8000/api/health`

### Run Backend Tests
```bash
py -m unittest backend.test_backend -v
```

---

## 3. Running the Frontend

From the `frontend/` directory:

```bash
cd frontend
npm install
npm run dev
```

- **Customer Storefront**: `http://localhost:5173/shop`
- **Merchant Admin App**: `http://localhost:5173/`

### Run Frontend Tests & Build
```bash
cd frontend
npm test
npm run build
```

