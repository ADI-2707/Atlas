from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db, engine
import uvicorn

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
    return [
        {"id": 1, "type": "spike", "metric": "traffic", "severity": "high", "timestamp": "2023-10-25T10:00:00Z"}
    ]

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
