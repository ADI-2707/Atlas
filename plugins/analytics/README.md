# `plugins/analytics`

The Real-time Analytics & Forecasting Plugin for the Atlas platform. It integrates a dedicated Python microservice for processing historical tenant transactional data, running anomaly detection algorithms, and serving predictive ML forecasting models.

- **Frontend:** React Dashboard (`@atlas/plugin-analytics`)
- **Backend Layer:** NestJS Proxy Module (`apps/backend/src/plugins/analytics`)
- **ML Engine:** Python FastAPI service (`python-engine`)
- **Technologies:** FastAPI, SQLAlchemy, Scikit-learn, Statsmodels, ReportLab (PDF reporting), APScheduler.

---

## Preview

![Analytics Forecasting Dashboard](../../docs/images/plugins/analytics.png)
_AI-powered forecasting and anomaly detection running in Dark Mode_

---

## How It Works

1. **ETL Job System:**
   - Every hour, an asynchronous ETL job (`etl.py` run via APScheduler) fetches transactional and user activity data across tenant tables in PostgreSQL.
2. **ML Modeling:**
   - **Anomaly Detection:** An Isolation Forest model (`scikit-learn`) identifies spikes or drop-offs in usage or metrics, marking warning flags in `SystemLog`.
   - **Forecasting:** An AutoRegressive Integrated Moving Average (ARIMA) or linear regression model (`statsmodels`) generates future metrics forecasts (e.g. MRR growth, sales, or ticket trends).
3. **PDF Generator:**
   - ReportLab processes database tables dynamically to create formatted audit reports sent to tenant admins.

---

## Directory Structure

```
analytics/
├── manifest.json      # permissions, routes, and widgets configuration
├── package.json
├── backend/           # NestJS controllers (proxies requests to Python engine)
├── frontend/          # React components and dashboard graphs
└── python-engine/     # FastAPI service & ML scripts
    ├── main.py        # router endpoints
    ├── database.py    # connection pool
    ├── etl.py         # DB synchronization script
    └── ml.py          # scikit-learn models
```

---

## Python Engine Setup (Local)

```bash
cd plugins/analytics/python-engine
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
