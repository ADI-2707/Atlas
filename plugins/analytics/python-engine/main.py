from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db, engine
import uvicorn
import pandas as pd
from ml import detect_anomalies, forecast_metric

app = FastAPI(
    title="Atlas Analytics Engine",
    description="Python microservice for Atlas OS AI and data processing",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    return {"status": "healthy", "service": "analytics-engine", "db_status": db_status}

@app.get("/dashboard")
def get_dashboard(org_id: str, db: Session = Depends(get_db)):
    return {
        "overview": {"totalRevenue": 150000, "activeUsers": 1250},
        "sales": [{"date": "2023-01", "amount": 10000}],
        "hr": [{"department": "Engineering", "count": 50}],
        "inventory": [{"product": "Laptop", "stock": 100}]
    }

@app.get("/anomalies")
def get_anomalies(org_id: str, db: Session = Depends(get_db)):
    df = pd.read_sql(
        text("SELECT timestamp, metric_name, value FROM analytics_metrics WHERE org_id = :org_id"),
        engine,
        params={"org_id": org_id}
    )
    if df.empty:
        return []
    
    anomalies_traffic = detect_anomalies(df, 'traffic')
    anomalies_revenue = detect_anomalies(df, 'revenue')
    
    return anomalies_traffic + anomalies_revenue

@app.get("/forecast")
def get_forecast(org_id: str, db: Session = Depends(get_db)):
    df = pd.read_sql(
        text("SELECT timestamp, metric_name, value FROM analytics_metrics WHERE org_id = :org_id"),
        engine,
        params={"org_id": org_id}
    )
    if df.empty:
        return []
        
    forecast_traffic = forecast_metric(df, 'traffic')
    forecast_revenue = forecast_metric(df, 'revenue')
    
    return forecast_traffic + forecast_revenue

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
