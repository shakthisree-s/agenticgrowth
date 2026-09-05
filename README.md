# MerchantOS AI

> **Autonomous AI Growth & Commerce Operating System**

MerchantOS AI is a multi-agent commerce platform that helps merchants **discover revenue opportunities, understand customer intent, make AI-driven decisions, enforce business policies, and execute approved actions**.

## 🚀 Live Demo

- **Customer Store:** https://agenticgrowth.onrender.com/shop
- **Merchant Admin:** https://agenticgrowth.onrender.com/
- **Backend API:** https://merchantos-backend.onrender.com
- **Swagger API Docs:** https://merchantos-backend.onrender.com/docs

## 🤖 AI Agent Workforce

- **Growth Supervisor** — coordinates the agent workflow
- **Customer Intent Agent** — understands customer behavior
- **Merchandising Agent** — identifies cross-sell and upsell opportunities
- **Revenue Recovery Agent** — detects and recovers lost revenue
- **Policy & Risk Agent** — validates actions against merchant rules
- **Commerce Execution Agent** — executes approved actions

## 🔄 How It Works

```text
Customer Signal
      ↓
AI Intent Analysis
      ↓
Revenue Opportunity
      ↓
Policy & Risk Validation
      ↓
Commerce Execution
      ↓
Razorpay Test Payment
      ↓
Revenue Attribution
      ↓
Activity + Audit Trail

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
│
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
│
├── .gitignore
└── README.md
