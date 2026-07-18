import os
from contextlib import asynccontextmanager
from concurrent.futures import ThreadPoolExecutor, as_completed
from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db, engine
import uvicorn
import pandas as pd
from ml import detect_anomalies, forecast_metric
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from reportlab.pdfgen import canvas  # type: ignore[import]
import logging
from etl import run_etl_pipeline

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    expected_token = os.getenv("ANALYTICS_API_KEY")
    if expected_token and token != expected_token:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid Analytics API Key")
    return token

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    scheduler.add_job(nightly_ml_batch_job, CronTrigger(hour=0, minute=0))
    scheduler.start()
    logger.info("Scheduler started.")
    yield
    # Shutdown
    scheduler.shutdown()
    logger.info("Scheduler shut down.")

app = FastAPI(
    title="Atlas Analytics Engine",
    description="Python microservice for Atlas OS AI and data processing",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scheduler = BackgroundScheduler()
logger = logging.getLogger("analytics_engine")


def _run_etl_for_org(org_id: str) -> tuple[str, bool, str]:
    """Run ETL for a single org and return (org_id, success, error_msg)."""
    try:
        run_etl_pipeline(org_id)
        return (org_id, True, "")
    except Exception as e:
        return (org_id, False, str(e))


ETL_WORKER_POOL_SIZE = int(os.getenv("ETL_WORKER_POOL_SIZE", "8"))

def nightly_ml_batch_job():
    logger.info("Running nightly ML batch job...")
    with engine.begin() as conn:
        result = conn.execute(text("SELECT id FROM atlas_core.organizations WHERE status = 'ACTIVE'"))
        org_ids = [row[0] for row in result]

    if not org_ids:
        logger.info("No active organisations found — batch job skipped.")
        return

    logger.info(f"Starting concurrent ETL for {len(org_ids)} organisation(s) with {ETL_WORKER_POOL_SIZE} workers.")
    success_count = 0
    failure_count = 0

    with ThreadPoolExecutor(max_workers=ETL_WORKER_POOL_SIZE) as executor:
        futures = {executor.submit(_run_etl_for_org, org_id): org_id for org_id in org_ids}
        for future in as_completed(futures):
            org_id, ok, err = future.result()
            if ok:
                logger.info(f"ETL completed for org: {org_id}")
                success_count += 1
            else:
                logger.error(f"ETL failed for org {org_id}: {err}")
                failure_count += 1

    logger.info(f"Nightly batch job completed — success: {success_count}, failed: {failure_count}.")



@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    return {"status": "healthy", "service": "analytics-engine", "db_status": db_status}

@app.post("/sync", dependencies=[Depends(verify_token)])
def force_sync(org_id: str):
    logger.info(f"Force sync requested for org: {org_id}")
    run_etl_pipeline(org_id)
    return {"status": "success", "message": "ETL pipeline completed successfully."}

@app.get("/dashboard", dependencies=[Depends(verify_token)])
def get_dashboard(org_id: str):
    logger.info(f"Dashboard requested for org: {org_id}")
    
    with engine.begin() as conn:
        df = pd.read_sql(  # type: ignore[call-overload]
            text("SELECT metric_name, SUM(value) as total FROM analytics_metrics WHERE org_id = :org_id GROUP BY metric_name"),
            conn,
            params={"org_id": org_id}
        )
    
    metrics = {}
    if not df.empty:
        metrics = dict(zip(df['metric_name'], df['total']))
        
    return {
        "overview": {
            "totalRevenue": metrics.get('crm_deals_won', 0), 
            "totalPayroll": metrics.get('hr_payroll', 0),
            "inventoryValuation": metrics.get('inv_valuation', 0)
        },
        "metrics": metrics
    }

@app.get("/timeseries", dependencies=[Depends(verify_token)])
def get_timeseries(org_id: str):
    with engine.begin() as conn:
        df = pd.read_sql(  # type: ignore[call-overload]
            text("SELECT timestamp, metric_name, value FROM analytics_metrics WHERE org_id = :org_id ORDER BY timestamp ASC"),
            conn,
            params={"org_id": org_id}
        )
    if df.empty:
        return {}
    
    df['timestamp'] = df['timestamp'].astype(str)
    result = {}
    for metric in df['metric_name'].unique():
        metric_df = df[df['metric_name'] == metric]
        result[metric] = metric_df[['timestamp', 'value']].to_dict(orient='records') # type: ignore
        
    return result

@app.get("/anomalies", dependencies=[Depends(verify_token)])
def get_anomalies(org_id: str):
    with engine.begin() as conn:
        df = pd.read_sql(  # type: ignore[call-overload]
            text("SELECT timestamp, metric_name, value FROM analytics_metrics WHERE org_id = :org_id"),
            conn,
            params={"org_id": org_id}
        )
    if df.empty:
        return []
    
    all_anomalies = []
    metrics = df['metric_name'].unique()
    for m in metrics:
        all_anomalies.extend(detect_anomalies(df, m))
    
    return all_anomalies

@app.get("/forecast", dependencies=[Depends(verify_token)])
def get_forecast(org_id: str):
    with engine.begin() as conn:
        df = pd.read_sql(  # type: ignore[call-overload]
            text("SELECT timestamp, metric_name, value FROM analytics_metrics WHERE org_id = :org_id"),
            conn,
            params={"org_id": org_id}
        )
    if df.empty:
        return []
        
    all_forecasts = []
    metrics = df['metric_name'].unique()
    for m in metrics:
        all_forecasts.extend(forecast_metric(df, m))
    
    return all_forecasts

@app.post("/reports/generate", dependencies=[Depends(verify_token)])
def generate_report(org_id: str):
    filename = f"report_{org_id}.pdf"
    c = canvas.Canvas(filename)
    c.drawString(100, 750, f"Analytics Report for Organization: {org_id}")
    c.drawString(100, 730, "Generated by Atlas OS Analytics Plugin")
    c.save()
    
    return {"status": "success", "file": filename, "message": "Report generated successfully"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
